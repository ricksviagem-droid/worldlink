import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import * as THREE from 'three'
import { BeachClub } from './BeachClub'
import { ChatPanel } from './ChatPanel'
import { MobileControls } from './MobileControls'
import { NPCS, TALK_DISTANCE, type NpcDef } from './npcData'
import { audio } from './audio'
import { CharacterMesh } from './CharacterMesh'
import { AICustomers, CUSTOMER_DEFS, SERVE_DISTANCE, type CustomerNeed } from './AICustomers'
import { MissionPanel } from './MissionPanel'
import { CustomerChat } from './CustomerChat'
import { ShiftReport } from './ShiftReport'
import { ReceptionArea } from './ReceptionArea'
import { ValentinaBuggy } from './ValentinaBuggy'
import { ProfileSetup } from './ProfileSetup'
import { ProfileCard, type CardProfile } from './ProfileCard'
import { MatchNotification, MatchesPanel } from './MatchesPanel'
import { DMPanel, type DMMessage } from './DMPanel'
import { PeoplePanel } from './PeoplePanel'
import { Shop } from './Shop'
import { getOutfit, STORAGE_KEY, type PlayerProfile } from './outfits'

const socket = io()
const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

type PlayerState = { x: number; z: number }
type PlayersMap = Record<string, PlayerState>
type CamMode = 'iso' | 'top' | 'close' | 'wide' | 'pov'

const CAM: Record<Exclude<CamMode,'pov'>, { y: number; dz: number; speed: number }> = {
  iso:   { y: 14, dz: 12, speed: 0.07 },
  top:   { y: 24, dz: 2,  speed: 0.06 },
  close: { y: 6,  dz: 5,  speed: 0.10 },
  wide:  { y: 20, dz: 20, speed: 0.05 },
}
const CAM_KEYS: CamMode[] = ['iso', 'top', 'close', 'wide', 'pov']

// ─── Collision ───────────────────────────────────────────────────────────────
const PLAYER_R = 0.45
const OBSTACLES = [
  { x1: -6,   x2: 6,    z1: 20.5, z2: 25.5 }, // Reception building
  { x1: -6,   x2: 6,    z1: -14.5,z2: -5.5  }, // Pool water
  { x1: 14.8, x2: 17.2, z1: -10,  z2: 2     }, // Bar counter
  { x1: -5,   x2: 5,    z1: -22,  z2: -18   }, // DJ booth
]
function canMove(x: number, z: number): boolean {
  if (x < -31 + PLAYER_R || x > 31 - PLAYER_R) return false
  if (z < -46 + PLAYER_R || z > 34 - PLAYER_R) return false
  for (const o of OBSTACLES) {
    if (x > o.x1 - PLAYER_R && x < o.x2 + PLAYER_R &&
        z > o.z1 - PLAYER_R && z < o.z2 + PLAYER_R) return false
  }
  return true
}

// ─── Camera ─────────────────────────────────────────────────────────────────
function CameraRig({ targetRef, mode, facingRef, zoomRef, camYawRef, velMagRef, hasInputRef }: {
  targetRef: { current: { x: number; z: number } }
  mode: CamMode
  facingRef: React.RefObject<number>
  zoomRef: React.RefObject<number>
  camYawRef: React.RefObject<number>
  velMagRef: { current: number }
  hasInputRef: { current: boolean }
}) {
  const { camera } = useThree()
  const cam = camera as THREE.PerspectiveCamera
  const m = useRef(mode); m.current = mode
  const smooth     = useRef({ x: targetRef.current.x, z: targetRef.current.z })
  const smoothY    = useRef(14)
  const smoothDz   = useRef(12)
  const smoothLook = useRef({ x: 0, y: 1.4, z: -8 })

  useFrame((_, delta) => {
    const zoom  = zoomRef.current ?? 1.0
    const speed = velMagRef.current
    const cur   = targetRef.current

    smooth.current.x += (cur.x - smooth.current.x) * 0.12
    smooth.current.z += (cur.z - smooth.current.z) * 0.12

    if (m.current === 'pov') {
      const angle = facingRef.current ?? 0
      // Keep camYawRef in sync so joystick input is relative to where you're looking
      camYawRef.current = -angle
      // Smooth camera position to player eye level
      camera.position.x += (cur.x - camera.position.x) * Math.min(1, 14 * delta)
      camera.position.y += (1.55  - camera.position.y) * Math.min(1, 14 * delta)
      camera.position.z += (cur.z - camera.position.z) * Math.min(1, 14 * delta)
      // Smooth look-at target so turning feels fluid
      const lx = cur.x + Math.sin(angle) * 8
      const lz = cur.z - Math.cos(angle) * 8
      smoothLook.current.x += (lx - smoothLook.current.x) * Math.min(1, 6 * delta)
      smoothLook.current.z += (lz - smoothLook.current.z) * Math.min(1, 6 * delta)
      camera.lookAt(smoothLook.current.x, 1.4, smoothLook.current.z)
      const povFov = 75 + Math.min(speed / 5.2, 1) * 10
      cam.fov += (povFov / zoom - cam.fov) * Math.min(1, 6 * delta)
      cam.updateProjectionMatrix()
      return
    }

    // Drift camera behind character ONLY when player has released input and is coasting to a stop.
    // While input is active, camYawRef is frozen → no feedback loop → no spinning.
    if (!hasInputRef.current && speed < 0.8 && speed > 0.02) {
      const targetYaw = -facingRef.current
      let diff = targetYaw - (camYawRef.current ?? 0)
      while (diff > Math.PI) diff -= Math.PI * 2
      while (diff < -Math.PI) diff += Math.PI * 2
      camYawRef.current = (camYawRef.current ?? 0) + diff * Math.min(1, Math.PI * 0.3 * delta)
    }

    const cfg = CAM[m.current as Exclude<CamMode,'pov'>]
    const lerpCfg = Math.min(1, 6 * delta)
    smoothY.current  += (cfg.y  - smoothY.current)  * lerpCfg
    smoothDz.current += (cfg.dz - smoothDz.current) * lerpCfg

    const yaw = camYawRef.current ?? 0
    const tx = smooth.current.x
    const tz = smooth.current.z
    const idealX = tx + Math.sin(yaw) * smoothDz.current
    const idealZ = tz + Math.cos(yaw) * smoothDz.current
    camera.position.x += (idealX          - camera.position.x) * cfg.speed
    camera.position.y += (smoothY.current - camera.position.y) * cfg.speed
    camera.position.z += (idealZ          - camera.position.z) * cfg.speed
    camera.lookAt(tx, 0, tz)
    const baseFov = 50 + Math.min(speed / 5.2, 1) * 6
    cam.fov += (baseFov / zoom - cam.fov) * Math.min(1, 4 * delta)
    cam.updateProjectionMatrix()
  })
  return null
}

// ─── Day / Night cycle ───────────────────────────────────────────────────────
function DayNight() {
  const { scene } = useThree()
  const sunRef  = useRef<THREE.DirectionalLight>(null)
  const ambRef  = useRef<THREE.AmbientLight>(null)
  const moonRef = useRef<THREE.DirectionalLight>(null)
  const cA = useRef(new THREE.Color())
  const cB = useRef(new THREE.Color())

  useFrame(({ clock }) => {
    if (!sunRef.current || !ambRef.current || !moonRef.current) return
    const t = (clock.elapsedTime / 300) % 1   // 5-minute full cycle

    type KF = { t: number; bg: string; fog: string; amb: string; ambI: number; sun: string; sunI: number; moonI: number }
    const KFS: KF[] = [
      { t:0.00, bg:'#7ec8e8', fog:'#f4a460', amb:'#ffe8c0', ambI:0.55, sun:'#ffcc88', sunI:2.0,  moonI:0.00 },
      { t:0.28, bg:'#ff9933', fog:'#cc6622', amb:'#ff9944', ambI:0.48, sun:'#ff7722', sunI:1.5,  moonI:0.00 },
      { t:0.42, bg:'#551122', fog:'#331100', amb:'#883355', ambI:0.25, sun:'#cc3311', sunI:0.45, moonI:0.10 },
      { t:0.52, bg:'#060614', fog:'#040408', amb:'#1133aa', ambI:0.10, sun:'#223366', sunI:0.08, moonI:0.45 },
      { t:0.78, bg:'#080820', fog:'#060610', amb:'#2244bb', ambI:0.12, sun:'#223366', sunI:0.08, moonI:0.40 },
      { t:0.90, bg:'#ff6633', fog:'#cc3311', amb:'#ff8855', ambI:0.38, sun:'#ff9944', sunI:0.9,  moonI:0.08 },
      { t:1.00, bg:'#7ec8e8', fog:'#f4a460', amb:'#ffe8c0', ambI:0.55, sun:'#ffcc88', sunI:2.0,  moonI:0.00 },
    ]

    let a = KFS[0], b = KFS[1]
    for (let i = 0; i < KFS.length - 1; i++) {
      if (t >= KFS[i].t && t <= KFS[i + 1].t) { a = KFS[i]; b = KFS[i + 1]; break }
    }
    const raw = (t - a.t) / (b.t - a.t + 0.00001)
    const k   = raw * raw * (3 - 2 * raw)   // smoothstep

    cA.current.set(a.bg);  cB.current.set(b.bg)
    if (scene.background instanceof THREE.Color) scene.background.lerpColors(cA.current, cB.current, k)

    if (scene.fog instanceof THREE.Fog) {
      cA.current.set(a.fog); cB.current.set(b.fog)
      scene.fog.color.lerpColors(cA.current, cB.current, k)
    }

    cA.current.set(a.amb); cB.current.set(b.amb)
    ambRef.current.color.lerpColors(cA.current, cB.current, k)
    ambRef.current.intensity = a.ambI + (b.ambI - a.ambI) * k

    cA.current.set(a.sun); cB.current.set(b.sun)
    sunRef.current.color.lerpColors(cA.current, cB.current, k)
    sunRef.current.intensity = a.sunI + (b.sunI - a.sunI) * k

    moonRef.current.intensity = a.moonI + (b.moonI - a.moonI) * k
  })

  return (
    <>
      <color attach="background" args={['#7ec8e8']} />
      <ambientLight ref={ambRef} intensity={0.55} color="#ffe8c0" />
      <directionalLight ref={sunRef} position={[12, 22, 8]} intensity={2.0} color="#ffcc88"
        castShadow shadow-mapSize={[2048, 2048]}
        shadow-camera-far={90} shadow-camera-left={-35}
        shadow-camera-right={35} shadow-camera-top={35} shadow-camera-bottom={-35}
      />
      <directionalLight ref={moonRef} position={[-10, 18, -8]} intensity={0} color="#6688cc" />
    </>
  )
}

// ─── Sky — stars, sun, moon ──────────────────────────────────────────────────
function makeStarBelt(count: number): Float32Array {
  const a = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const theta = Math.random() * Math.PI * 2
    const cosP  = Math.random() * 0.92 + 0.08
    const r     = 175 + Math.random() * 15
    a[i*3]   = r * Math.sqrt(1 - cosP * cosP) * Math.cos(theta)
    a[i*3+1] = Math.max(6, r * cosP)
    a[i*3+2] = r * Math.sqrt(1 - cosP * cosP) * Math.sin(theta) - 20
  }
  return a
}

function Sky() {
  const sunGrp     = useRef<THREE.Group>(null)
  const moonGrp    = useRef<THREE.Group>(null)
  const starsSmRef = useRef<THREE.Points>(null)
  const starsMdRef = useRef<THREE.Points>(null)
  const starsLgRef = useRef<THREE.Points>(null)
  const sunMat     = useRef<THREE.MeshStandardMaterial>(null)
  const moonMat    = useRef<THREE.MeshStandardMaterial>(null)

  const starsSm = useRef(makeStarBelt(520))
  const starsMd = useRef(makeStarBelt(190))
  const starsLg = useRef(makeStarBelt(85))

  useFrame(({ clock }) => {
    const t      = (clock.elapsedTime / 300) % 1
    const arc    = t * Math.PI * 2
    const R      = 145

    // Night envelope (same keyframes as DayNight)
    let night = 0
    if      (t >= 0.42 && t < 0.52) night = (t - 0.42) / 0.10
    else if (t >= 0.52 && t < 0.78) night = 1.0
    else if (t >= 0.78 && t < 0.90) night = 1 - (t - 0.78) / 0.12

    // Star layers with gentle global twinkle
    const twinkle = 0.82 + Math.sin(clock.elapsedTime * 1.8) * 0.18
    for (const ref of [starsSmRef, starsMdRef, starsLgRef]) {
      if (ref.current) (ref.current.material as THREE.PointsMaterial).opacity = night * twinkle
    }

    // Sun arc
    if (sunGrp.current) {
      sunGrp.current.position.set(
        Math.cos(arc) * R * 0.52,
        Math.sin(arc) * R * 0.60 + 5,
        -60,
      )
    }
    if (sunMat.current) {
      const sunset = Math.max(0, 1 - Math.abs(t - 0.30) / 0.13)
      sunMat.current.emissive.setHSL(0.12 - sunset * 0.08, 1, 0.6)
      sunMat.current.emissiveIntensity = 2.2 + (1 - sunset) * 1.8
    }

    // Moon arc (opposite side)
    if (moonGrp.current) {
      const ma = arc + Math.PI
      moonGrp.current.position.set(
        Math.cos(ma) * R * 0.52,
        Math.sin(ma) * R * 0.60 + 5,
        -60,
      )
    }
    if (moonMat.current) moonMat.current.emissiveIntensity = 0.85 * night
  })

  return (
    <>
      {/* Stars — 3 layers of different sizes for depth */}
      {([
        [starsSmRef, starsSm.current, 0.26, '#ffffff'],
        [starsMdRef, starsMd.current, 0.48, '#ddeeff'],
        [starsLgRef, starsLg.current, 0.78, '#fff8e0'],
      ] as const).map(([ref, arr, size, color], i) => (
        <points key={i} ref={ref as React.RefObject<THREE.Points>} frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[arr, 3]} />
          </bufferGeometry>
          <pointsMaterial
            color={color} size={size} transparent opacity={0}
            sizeAttenuation depthWrite={false} fog={false}
          />
        </points>
      ))}

      {/* Sun */}
      <group ref={sunGrp}>
        <mesh>
          <sphereGeometry args={[5.2, 14, 14]} />
          <meshStandardMaterial ref={sunMat}
            color="#fff7d0" emissive="#ffdd44" emissiveIntensity={3}
            roughness={1} fog={false}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[9.5, 10, 10]} />
          <meshStandardMaterial
            color="#ffaa00" emissive="#ff8800" emissiveIntensity={0.35}
            transparent opacity={0.13} depthWrite={false} fog={false}
            side={THREE.BackSide}
          />
        </mesh>
      </group>

      {/* Moon */}
      <group ref={moonGrp}>
        <mesh>
          <sphereGeometry args={[3.6, 14, 14]} />
          <meshStandardMaterial ref={moonMat}
            color="#ddeeff" emissive="#aabbdd" emissiveIntensity={0.85}
            roughness={1} fog={false}
          />
        </mesh>
        <mesh>
          <sphereGeometry args={[6.2, 10, 10]} />
          <meshStandardMaterial
            color="#6688bb" emissive="#5577aa" emissiveIntensity={0.14}
            transparent opacity={0.10} depthWrite={false} fog={false}
            side={THREE.BackSide}
          />
        </mesh>
      </group>
    </>
  )
}

// ─── Disco lights ────────────────────────────────────────────────────────────
function DJLights() {
  const refs = useRef<(THREE.PointLight | null)[]>([null, null, null, null, null])
  useFrame(({ clock }) => {
    const t    = clock.elapsedTime
    const beat = Math.pow(Math.max(0, Math.cos(t * 116 / 60 * Math.PI * 2)), 3)
    refs.current.forEach((r, i) => {
      if (!r) return
      const angle = t * 0.55 + (i * Math.PI * 2) / 5
      r.position.x = Math.cos(angle) * 5.5
      r.position.y = 5 + beat * 1.8
      r.position.z = -19 + Math.sin(angle * 1.15) * 2.2
      r.color.setHSL((t * 0.08 + i * 0.2) % 1, 1, 0.55)
      r.intensity = 10 + beat * 22
    })
  })
  return (
    <>
      {[0, 1, 2, 3, 4].map(i => (
        <pointLight key={i} ref={el => { refs.current[i] = el }}
          position={[0, 5, -19]} intensity={10} distance={24} decay={2} />
      ))}
    </>
  )
}

// ─── Movement System (runs inside Canvas via useFrame) ───────────────────────
function MovementSystem({
  keysRef, mobileInputRef, velocityRef, positionRef, facingRef, velMagRef,
  camYawRef, hasInputRef, camModeRef, setPosition, chatOpenRef,
}: {
  keysRef: { current: Record<string, boolean> }
  mobileInputRef: { current: { x: number; z: number } }
  velocityRef: { current: { x: number; z: number } }
  positionRef: { current: { x: number; z: number } }
  facingRef: { current: number }
  velMagRef: { current: number }
  camYawRef: { current: number }
  hasInputRef: { current: boolean }
  camModeRef: { current: CamMode }
  setPosition: (p: PlayerState) => void
  chatOpenRef: React.RefObject<boolean>
}) {
  const throttleRef = useRef(0)

  useFrame((_, delta) => {
    if (chatOpenRef.current) return
    const MAX_SPEED = 5.2, ACCEL = 20, DECEL = 16
    const TURN_SPD = camModeRef.current === 'pov' ? Math.PI * 0.4 : Math.PI * 1.5

    // Raw screen-space input (up = -iz, right = +ix)
    let ix = mobileInputRef.current.x, iz = mobileInputRef.current.z
    const keys = keysRef.current
    if (keys['w'] || keys['ArrowUp'])    iz -= 1
    if (keys['s'] || keys['ArrowDown'])  iz += 1
    if (keys['a'] || keys['ArrowLeft'])  ix -= 1
    if (keys['d'] || keys['ArrowRight']) ix += 1

    // Snapshot camera yaw once — prevents any mid-frame feedback loop
    const yaw = camYawRef.current
    const wix = iz * Math.sin(yaw) + ix * Math.cos(yaw)
    const wiz = iz * Math.cos(yaw) - ix * Math.sin(yaw)

    const len = Math.sqrt(wix * wix + wiz * wiz)
    const hasInput = len > 0.05
    const hasTurn  = len > 0.25   // higher threshold so light touch doesn't snap direction
    hasInputRef.current = hasInput  // tell CameraRig to freeze yaw while player is pushing
    if (hasInput) {
      const nx = wix / len, nz = wiz / len
      velocityRef.current.x += (nx * MAX_SPEED - velocityRef.current.x) * Math.min(1, ACCEL * delta)
      velocityRef.current.z += (nz * MAX_SPEED - velocityRef.current.z) * Math.min(1, ACCEL * delta)
      if (hasTurn) {
        const targetFacing = Math.atan2(nx, -nz)
        let diff = targetFacing - facingRef.current
        while (diff > Math.PI) diff -= Math.PI * 2
        while (diff < -Math.PI) diff += Math.PI * 2
        facingRef.current += Math.sign(diff) * Math.min(Math.abs(diff), TURN_SPD * delta)
      }
    } else {
      velocityRef.current.x *= Math.max(0, 1 - DECEL * delta)
      velocityRef.current.z *= Math.max(0, 1 - DECEL * delta)
    }
    const vx = velocityRef.current.x, vz = velocityRef.current.z
    velMagRef.current = Math.sqrt(vx * vx + vz * vz)
    if (velMagRef.current > 0.02) {
      const nx = positionRef.current.x + vx * delta
      const nz = positionRef.current.z + vz * delta
      if (canMove(nx, nz)) {
        positionRef.current.x = nx; positionRef.current.z = nz
      } else if (canMove(nx, positionRef.current.z)) {
        positionRef.current.x = nx; velocityRef.current.z = 0
      } else if (canMove(positionRef.current.x, nz)) {
        positionRef.current.z = nz; velocityRef.current.x = 0
      } else {
        velocityRef.current.x = 0; velocityRef.current.z = 0
      }
      throttleRef.current += delta
      if (throttleRef.current > 1 / 15) {
        throttleRef.current = 0
        setPosition({ x: positionRef.current.x, z: positionRef.current.z })
      }
    }
  })
  return null
}

// ─── Players ─────────────────────────────────────────────────────────────────
function LocalPlayer({ positionRef, bodyColor, headColor, hairColor, pantsColor, facingRef, velMagRef }: {
  positionRef: { current: { x: number; z: number } }
  facingRef: { current: number }
  velMagRef: { current: number }
  bodyColor: string; headColor: string; hairColor?: string; pantsColor?: string
}) {
  const groupRef  = useRef<THREE.Group>(null)
  const movingRef = useRef(false)
  const smoothRot = useRef(Math.PI)

  useFrame((_, delta) => {
    if (!groupRef.current) return
    groupRef.current.position.x = positionRef.current.x
    groupRef.current.position.z = positionRef.current.z
    movingRef.current = velMagRef.current > 0.5
    const target = Math.PI - facingRef.current
    let diff = target - smoothRot.current
    while (diff > Math.PI) diff -= Math.PI * 2
    while (diff < -Math.PI) diff += Math.PI * 2
    smoothRot.current += diff * Math.min(1, Math.PI * 6 * delta)
    groupRef.current.rotation.y = smoothRot.current
  })

  return (
    <group ref={groupRef}>
      <CharacterMesh bodyColor={bodyColor} headColor={headColor} hairColor={hairColor} pantsColor={pantsColor} movingRef={movingRef} />
    </group>
  )
}

function RemotePlayer({ targetPosition, bodyColor, headColor, hairColor, pantsColor, name, photoUrl, nationality, showNameplate, nearby }: {
  targetPosition: PlayerState; bodyColor: string; headColor: string; hairColor?: string; pantsColor?: string
  name?: string; photoUrl?: string; nationality?: string; showNameplate?: boolean; nearby?: boolean
}) {
  const groupRef  = useRef<THREE.Group>(null)
  const lp        = useRef({ x: targetPosition.x, z: targetPosition.z })
  const smoothRot = useRef(Math.PI)
  const movingRef = useRef(false)
  useFrame((_, delta) => {
    if (!groupRef.current) return
    const dx = targetPosition.x - lp.current.x
    const dz = targetPosition.z - lp.current.z
    const dist = Math.abs(dx) + Math.abs(dz)
    movingRef.current = dist > 0.01
    lp.current.x += dx * 0.15
    lp.current.z += dz * 0.15
    groupRef.current.position.x = lp.current.x
    groupRef.current.position.z = lp.current.z
    if (dist > 0.005) {
      const targetRot = Math.atan2(dx, dz)
      let rotDiff = targetRot - smoothRot.current
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2
      smoothRot.current += rotDiff * Math.min(1, 10 * delta)
      groupRef.current.rotation.y = smoothRot.current
    }
  })
  return (
    <group ref={groupRef} position={[targetPosition.x, 0, targetPosition.z]}>
      <CharacterMesh bodyColor={bodyColor} headColor={headColor} hairColor={hairColor} pantsColor={pantsColor} movingRef={movingRef} />
      {(showNameplate ?? true) && (
        <Html position={[0, 2.45, 0]} center distanceFactor={12}>
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
            fontFamily: '-apple-system, sans-serif',
          }}>
          {nearby && (
            <div style={{
              background: 'rgba(243,156,18,0.92)', color: '#111',
              padding: '2px 10px', borderRadius: 10, fontSize: 10, fontWeight: 700,
              boxShadow: '0 2px 8px rgba(243,156,18,0.5)', marginBottom: 2,
            }}>Press E to chat</div>
          )}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            background: nearby ? 'rgba(243,156,18,0.9)' : 'rgba(8,8,20,0.78)',
            backdropFilter: 'blur(10px)',
            color: nearby ? '#111' : '#fff', padding: '3px 8px 3px 3px', borderRadius: 22, fontSize: 12,
            fontWeight: 600,
            whiteSpace: 'nowrap', border: nearby ? '1px solid rgba(243,156,18,0.6)' : '1px solid rgba(76,175,80,0.35)',
            boxShadow: nearby ? '0 2px 12px rgba(243,156,18,0.5)' : '0 2px 10px rgba(0,0,0,0.45)',
          }}>
            {/* Mini avatar / photo */}
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
              background: `radial-gradient(circle at 35% 30%, ${headColor}, ${bodyColor})`,
              border: '1.5px solid rgba(76,175,80,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
            }}>
              {photoUrl
                ? <img src={photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                : null
              }
            </div>
            <span>{name ?? 'Player'}</span>
            {nationality && (
              <span style={{ fontSize: 14 }}>
                {nationality.toUpperCase().split('').map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join('')}
              </span>
            )}
          </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// ─── NPC ─────────────────────────────────────────────────────────────────────
function NPCCharacter({ npc, nearby, playerPosRef }: {
  npc: NpcDef; nearby: boolean
  playerPosRef: React.RefObject<{ x: number; z: number }>
}) {
  const groupRef = useRef<THREE.Group>(null)
  const pos = useRef({ x: npc.position[0], z: npc.position[2] })
  const target = useRef({ x: npc.position[0], z: npc.position[2] })
  const timer = useRef(Math.random() * 3)
  const movingRef = useRef(false)
  const WANDER = npc.id === 'bartender' ? 1.2 : 2.2

  useFrame((_, delta) => {
    if (!groupRef.current) return
    timer.current += delta
    if (timer.current > 2.5 + Math.random() * 3) {
      const angle = Math.random() * Math.PI * 2
      const r = Math.random() * WANDER
      target.current = {
        x: npc.position[0] + Math.cos(angle) * r,
        z: npc.position[2] + Math.sin(angle) * r,
      }
      timer.current = 0
    }
    const spd = 0.018
    pos.current.x += (target.current.x - pos.current.x) * spd
    pos.current.z += (target.current.z - pos.current.z) * spd
    groupRef.current.position.x = pos.current.x
    groupRef.current.position.z = pos.current.z
    const dx = target.current.x - pos.current.x
    const dz = target.current.z - pos.current.z
    movingRef.current = Math.abs(dx) + Math.abs(dz) > 0.005
    if (movingRef.current) {
      const targetRot = Math.atan2(dx, dz)
      let rotDiff = targetRot - groupRef.current.rotation.y
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2
      groupRef.current.rotation.y += rotDiff * Math.min(1, 8 * delta)
    } else {
      // When idle: face player if nearby, else drift back to default
      const pp = playerPosRef.current
      const faceTarget = nearby && pp
        ? Math.atan2(pp.x - pos.current.x, pp.z - pos.current.z)
        : Math.PI
      let rotDiff = faceTarget - groupRef.current.rotation.y
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2
      groupRef.current.rotation.y += rotDiff * Math.min(1, 3 * delta)
    }
    groupRef.current.position.y = Math.sin(Date.now() * 0.0015 + npc.position[0]) * 0.04
  })

  return (
    <group ref={groupRef} position={npc.position}>
      <CharacterMesh bodyColor={npc.bodyColor} headColor={npc.headColor} hairColor={npc.hairColor} pantsColor={npc.pantsColor} movingRef={movingRef} />
      <Html position={[0, 2.2, 0]} center distanceFactor={12}>
        <div style={{
          background: nearby ? 'rgba(243,156,18,0.9)' : 'rgba(0,0,0,0.65)',
          color: nearby ? '#111' : '#fff',
          padding: '3px 11px', borderRadius: 20, fontSize: 12,
          fontFamily: '-apple-system, sans-serif', fontWeight: 600,
          whiteSpace: 'nowrap', backdropFilter: 'blur(6px)',
          transition: 'all 0.2s',
          boxShadow: nearby ? '0 2px 12px rgba(243,156,18,0.5)' : 'none',
        }}>
          {npc.name}
          {nearby && <div style={{ fontSize: 10, fontWeight: 400, textAlign: 'center', marginTop: 1 }}>Press E to talk</div>}
        </div>
      </Html>
    </group>
  )
}

// ─── Minimap ─────────────────────────────────────────────────────────────────
const MM_W = 110, MM_H = 128
const WX0 = -31, WX1 = 31, WZ0 = -46, WZ1 = 34
const mmX = (v: number) => ((v - WX0) / (WX1 - WX0)) * MM_W
const mmZ = (v: number) => ((v - WZ0) / (WZ1 - WZ0)) * MM_H
const mmRect = (x1: number, x2: number, z1: number, z2: number) =>
  ({ x: mmX(x1), y: mmZ(z1), width: mmX(x2) - mmX(x1), height: mmZ(z2) - mmZ(z1) })

function Minimap({ position, facingRef, players, myId, customerNeeds, camMode }: {
  position: PlayerState
  facingRef: React.RefObject<number>
  players: PlayersMap
  myId: string
  customerNeeds: Record<string, CustomerNeed>
  camMode: CamMode
}) {
  if (camMode === 'pov') return null
  const px = mmX(position.x), pz = mmZ(position.z)
  const f  = facingRef.current ?? 0
  const ax = px + Math.sin(f) * 7, ay = pz - Math.cos(f) * 7
  return (
    <div style={{
      position: 'absolute', top: 72, left: 16, zIndex: 9,
      borderRadius: 10, overflow: 'hidden',
      border: '1.5px solid rgba(255,255,255,0.22)',
      boxShadow: '0 4px 16px rgba(0,0,0,0.35)',
    }}>
      <svg width={MM_W} height={MM_H} style={{ display: 'block' }}>
        {/* Sand */}
        <rect width={MM_W} height={MM_H} fill="#c8a460" />
        {/* Pool */}
        <rect {...mmRect(-6, 6, -14.5, -5.5)} fill="#4dd0e1" opacity={0.85} rx={1} />
        {/* Bar counter */}
        <rect {...mmRect(14.8, 17.2, -10, 2)} fill="#d4870a" opacity={0.8} rx={1} />
        {/* DJ booth */}
        <rect {...mmRect(-5, 5, -22, -18)} fill="#1a1240" opacity={0.85} rx={1} />
        {/* Reception */}
        <rect {...mmRect(-6, 6, 20.5, 25.5)} fill="#b8b0a0" opacity={0.8} rx={1} />

        {/* Remote players */}
        {Object.entries(players).filter(([id]) => id !== myId).map(([id, p]) => (
          <circle key={id} cx={mmX(p.x)} cy={mmZ(p.z)} r={3.5} fill="#4caf50" />
        ))}

        {/* NPCs */}
        {NPCS.map(npc => (
          <circle key={npc.id} cx={mmX(npc.position[0])} cy={mmZ(npc.position[2])} r={3} fill="#f39c12" />
        ))}

        {/* Customers needing service */}
        {CUSTOMER_DEFS.map(c => {
          const need = customerNeeds[c.id]
          if (need === 'happy' || need === 'left') return null
          return <circle key={c.id} cx={mmX(c.spawn[0])} cy={mmZ(c.spawn[2])} r={3} fill="#e74c3c" />
        })}

        {/* Local player */}
        <circle cx={px} cy={pz} r={5.5} fill="#fff" stroke="#1565c0" strokeWidth={2} />
        <line x1={px} y1={pz} x2={ax} y2={ay} stroke="#1565c0" strokeWidth={2.5} strokeLinecap="round" />
      </svg>
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const myId        = useRef('')
  const wrapperRef  = useRef<HTMLDivElement>(null)
  const facingRef   = useRef(0)
  const zoomRef     = useRef(1.0)
  const camYawRef   = useRef(0)
  const pinchStart  = useRef({ dist: 0, zoom: 1.0 })
  const dragRef     = useRef<{ x: number; yaw: number; type: 'orbit' | 'pov' } | null>(null)
  const isLockedRef = useRef(false)
  const [isPointerLocked, setIsPointerLocked] = useState(false)
  const [position, setPosition] = useState<PlayerState>({ x: 0, z: 0 })
  const [players, setPlayers] = useState<PlayersMap>({})
  const [nearbyNpc, setNearbyNpc] = useState<NpcDef | null>(null)
  const [activeChatNpc, setActiveChatNpc] = useState<NpcDef | null>(null)
  const [camMode, setCamMode] = useState<CamMode>('iso')
  const chatOpenRef    = useRef(false)
  const keysRef        = useRef<Record<string, boolean>>({})
  const velocityRef    = useRef({ x: 0, z: 0 })
  const positionRef    = useRef({ x: 0, z: 0 })
  const mobileInputRef = useRef({ x: 0, z: 0 })
  const velMagRef      = useRef(0)
  const hasInputRef    = useRef(false)
  const camModeRef     = useRef<CamMode>(camMode)
  camModeRef.current   = camMode

  // Profile
  const [myProfile, setMyProfile] = useState<PlayerProfile | null>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null } catch { return null }
  })
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [remoteProfiles, setRemoteProfiles] = useState<Record<string, PlayerProfile>>({})
  const [nearbyPlayerId, setNearbyPlayerId] = useState<string | null>(null)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [matches, setMatches] = useState<Set<string>>(new Set())
  const [likedNpcIds, setLikedNpcIds] = useState<Set<string>>(new Set())
  const [showMatches, setShowMatches] = useState(false)
  const [matchNotify, setMatchNotify] = useState<{
    name: string; faceEmoji?: string; bodyColor: string; headColor: string
  } | null>(null)
  const [activeDMId,  setActiveDMId]  = useState<string | null>(null)
  const [dmMessages,  setDmMessages]  = useState<Record<string, DMMessage[]>>({})
  const [unreadDMs,   setUnreadDMs]   = useState<Set<string>>(new Set())
  const remoteProfilesRef = useRef(remoteProfiles)
  remoteProfilesRef.current = remoteProfiles
  const [showShop, setShowShop] = useState(false)
  const [showPeoplePanel, setShowPeoplePanel] = useState(false)
  const [notification, setNotification] = useState<string | null>(null)

  const myOutfit = getOutfit(myProfile?.outfitId ?? 'beach')

  const handleSaveProfile = (profile: PlayerProfile) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile))
    setMyProfile(profile)
    setShowProfileSetup(false)
    socket.emit('setProfile', profile)
  }

  const handleLike = (targetId: string, isSuper = false) => {
    setLikedIds(prev => new Set(prev).add(targetId))
    socket.emit('sendLike', { targetId, isSuper })
  }

  const handleChangeOutfit = (outfitId: string) => {
    if (!myProfile) return
    handleSaveProfile({ ...myProfile, outfitId })
  }

  // Mission & customers
  const [xp, setXp] = useState(0)
  const [servedTotal, setServedTotal] = useState(0)
  const [justServed, setJustServed] = useState(false)
  const [nearbyCustomerId, setNearbyCustomerId] = useState<string | null>(null)
  const initNeeds = () => Object.fromEntries(
    CUSTOMER_DEFS.map(c => [c.id, (['drink', 'towel', 'menu'] as CustomerNeed[])[Math.floor(Math.random() * 3)]])
  ) as Record<string, CustomerNeed>
  const [customerNeeds, setCustomerNeeds] = useState<Record<string, CustomerNeed>>(initNeeds)

  // Work shift
  type ShiftPhase = 'idle' | 'active' | 'ended'
  const [shiftPhase, setShiftPhase] = useState<ShiftPhase>('idle')
  const [shiftTimeLeft, setShiftTimeLeft] = useState(180) // 3 min
  const [shiftServed, setShiftServed] = useState(0)
  const [shiftMissed, setShiftMissed] = useState(0)
  const [shiftExchanges, setShiftExchanges] = useState(0)
  const [showReport, setShowReport] = useState(false)
  const [activeCustomerChat, setActiveCustomerChat] = useState<string | null>(null)
  const shiftStartTime = useRef(0)
  const shiftTimerRef = useRef<ReturnType<typeof setInterval>>()

  const startShift = () => {
    setShiftPhase('active')
    setShiftTimeLeft(180)
    setShiftServed(0)
    setShiftMissed(0)
    setShiftExchanges(0)
    shiftStartTime.current = Date.now()
    shiftTimerRef.current = setInterval(() => {
      setShiftTimeLeft(prev => {
        if (prev <= 1) { endShift(false); return 0 }
        return prev - 1
      })
    }, 1000)
  }

  const endShift = (quitEarly: boolean) => {
    clearInterval(shiftTimerRef.current)
    setShiftPhase('ended')
    // Store quitEarly for report via ref so callback captures fresh value
    _quitEarlyRef.current = quitEarly
  }

  const _quitEarlyRef = useRef(false)

  const handlePatienceOut = (customerId: string) => {
    if (shiftPhase !== 'active') return
    setCustomerNeeds(prev => ({ ...prev, [customerId]: 'left' }))
    setShiftMissed(prev => prev + 1)
    // Reset after 6s
    const needs: CustomerNeed[] = ['drink', 'towel', 'menu']
    setTimeout(() => {
      setCustomerNeeds(prev => ({ ...prev, [customerId]: needs[Math.floor(Math.random() * needs.length)] }))
    }, 6000)
  }

  // Socket
  useEffect(() => {
    const onConnect = () => {
      myId.current = socket.id || ''
      if (myProfile) socket.emit('setProfile', myProfile)
    }
    const onCurrentPlayers = (data: PlayersMap) => setPlayers(data)
    const onNewPlayer = ({ id, player }: { id: string; player: PlayerState }) =>
      setPlayers(prev => ({ ...prev, [id]: player }))
    const onUpdatePlayers = (data: PlayersMap) => setPlayers(data)
    const onPlayerLeft = (id: string) => {
      setPlayers(prev => { const n = { ...prev }; delete n[id]; return n })
      setRemoteProfiles(prev => { const n = { ...prev }; delete n[id]; return n })
      setNearbyPlayerId(prev => prev === id ? null : prev)
    }
    const onPlayerProfile = ({ id, profile }: { id: string; profile: PlayerProfile }) =>
      setRemoteProfiles(prev => ({ ...prev, [id]: profile }))
    const onExistingProfiles = (data: Record<string, PlayerProfile>) =>
      setRemoteProfiles(data)
    const onReceiveLike = ({ isSuper }: { fromId: string; isSuper: boolean }) => {
      setNotification(isSuper ? '⭐ Você recebeu um Super Like!' : '❤️ Alguém curtiu você!')
      setTimeout(() => setNotification(null), 4000)
    }
    const onNewMatch = ({ withId }: { withId: string }) => {
      setMatches(prev => new Set(prev).add(withId))
      const p = remoteProfilesRef.current[withId]
      if (p) {
        const outfit = getOutfit(p.outfitId)
        setMatchNotify({ name: p.name, faceEmoji: p.faceEmoji, bodyColor: outfit.bodyColor, headColor: outfit.headColor })
      } else {
        setNotification('💫 É um Match!')
        setTimeout(() => setNotification(null), 5000)
      }
    }

    const onReceiveDM = ({ fromId, text, timestamp }: { fromId: string; text: string; timestamp: number }) => {
      setDmMessages(prev => ({
        ...prev,
        [fromId]: [...(prev[fromId] ?? []), { fromId, text, timestamp }],
      }))
      setActiveDMId(cur => {
        if (cur !== fromId) {
          setUnreadDMs(u => new Set([...u, fromId]))
          setNotification(`💬 ${remoteProfilesRef.current[fromId]?.name ?? 'Alguém'} enviou uma mensagem!`)
          setTimeout(() => setNotification(null), 4000)
        }
        return cur
      })
    }
    const onDmHistory = ({ withId, messages }: { withId: string; messages: DMMessage[] }) => {
      setDmMessages(prev => ({ ...prev, [withId]: messages }))
    }
    const onReceiveFlirt = ({ fromId, emoji, name }: { fromId: string; emoji: string; name: string }) => {
      setNotification(`${emoji} ${name} mandou um flerte!`)
      setTimeout(() => setNotification(null), 4000)
      // Also deliver flirt as a DM message so it appears in the conversation
      setDmMessages(prev => ({
        ...prev,
        [fromId]: [...(prev[fromId] ?? []), { fromId, text: emoji, timestamp: Date.now() }],
      }))
      setActiveDMId(cur => {
        if (cur !== fromId) setUnreadDMs(u => new Set([...u, fromId]))
        return cur
      })
    }

    socket.on('connect', onConnect)
    socket.on('currentPlayers', onCurrentPlayers)
    socket.on('newPlayer', onNewPlayer)
    socket.on('updatePlayers', onUpdatePlayers)
    socket.on('playerLeft', onPlayerLeft)
    socket.on('playerProfile', onPlayerProfile)
    socket.on('existingProfiles', onExistingProfiles)
    socket.on('receiveLike', onReceiveLike)
    socket.on('newMatch', onNewMatch)
    socket.on('receiveDM', onReceiveDM)
    socket.on('dmHistory', onDmHistory)
    socket.on('receiveFlirt', onReceiveFlirt)
    return () => {
      socket.off('connect', onConnect)
      socket.off('currentPlayers', onCurrentPlayers)
      socket.off('newPlayer', onNewPlayer)
      socket.off('updatePlayers', onUpdatePlayers)
      socket.off('playerLeft', onPlayerLeft)
      socket.off('playerProfile', onPlayerProfile)
      socket.off('existingProfiles', onExistingProfiles)
      socket.off('receiveLike', onReceiveLike)
      socket.off('receiveDM', onReceiveDM)
      socket.off('dmHistory', onDmHistory)
      socket.off('newMatch', onNewMatch)
      socket.off('receiveFlirt', onReceiveFlirt)
    }
  }, [])

  // Pointer lock state sync
  useEffect(() => {
    const onChange = () => {
      const locked = !!document.pointerLockElement
      isLockedRef.current = locked
      setIsPointerLocked(locked)
    }
    document.addEventListener('pointerlockchange', onChange)
    return () => document.removeEventListener('pointerlockchange', onChange)
  }, [])

  // Exit pointer lock when leaving POV mode
  useEffect(() => {
    if (camMode !== 'pov' && document.pointerLockElement) document.exitPointerLock()
  }, [camMode])

  // POV free-look via locked pointer
  useEffect(() => {
    if (camMode !== 'pov') return
    const onMove = (e: MouseEvent) => {
      if (isLockedRef.current) facingRef.current += e.movementX * 0.0012
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [camMode])

  // Proximity detection + audio init on first move
  const prevNearby = useRef<string | null>(null)
  useEffect(() => {
    audio.init()
    const nearby = NPCS.find(npc => {
      const dx = position.x - npc.position[0]
      const dz = position.z - npc.position[2]
      return Math.sqrt(dx * dx + dz * dz) < TALK_DISTANCE
    }) ?? null
    setNearbyNpc(nearby)
    if (nearby && nearby.id !== prevNearby.current) audio.playProximity()
    prevNearby.current = nearby?.id ?? null

    // Customer proximity
    if (!nearby) {
      const nearCust = CUSTOMER_DEFS.find(c => {
        const dx = position.x - c.spawn[0]
        const dz = position.z - c.spawn[2]
        return Math.sqrt(dx * dx + dz * dz) < SERVE_DISTANCE
      }) ?? null
      setNearbyCustomerId(nearCust?.id ?? null)
    } else {
      setNearbyCustomerId(null)
    }

    // Nearby remote player — find closest within 5 units
    const nearPlayer = Object.entries(players).reduce<[string, number] | null>((best, [id, p]) => {
      if (id === myId.current) return best
      const dx = position.x - p.x
      const dz = position.z - p.z
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist < 5 && (!best || dist < best[1])) return [id, dist]
      return best
    }, null)
    setNearbyPlayerId(nearPlayer?.[0] ?? null)
  }, [position, players])

  // Keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (chatOpenRef.current) {
        if (e.key === 'Escape') {
          setActiveChatNpc(null)
          chatOpenRef.current = false
        }
        return
      }
      if ((e.target as HTMLElement).tagName === 'INPUT') return

      if (e.type === 'keydown') {
        if (e.key === 'c' || e.key === 'C') {
          setCamMode(prev => CAM_KEYS[(CAM_KEYS.indexOf(prev) + 1) % CAM_KEYS.length])
          return
        }
        if (e.key === 'e' || e.key === 'E') {
          if (nearbyNpc) {
            setActiveChatNpc(nearbyNpc)
            chatOpenRef.current = true
            audio.playOpen()
          } else if (nearbyPlayerId) {
            setActiveDMId(nearbyPlayerId)
            chatOpenRef.current = true
            audio.playOpen()
            socket.emit('getDMHistory', { withId: nearbyPlayerId })
          } else if (nearbyCustomerId && customerNeeds[nearbyCustomerId] !== 'happy') {
            handleServeCustomer(nearbyCustomerId)
          }
          return
        }
        keysRef.current[e.key] = true
      } else {
        delete keysRef.current[e.key]
      }
    }
    window.addEventListener('keydown', handleKey)
    window.addEventListener('keyup', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      window.removeEventListener('keyup', handleKey)
    }
  }, [nearbyNpc, nearbyCustomerId, customerNeeds])

  useEffect(() => { socket.emit('move', position) }, [position])

  const closeChat = () => {
    setActiveChatNpc(null)
    chatOpenRef.current = false
    audio.playClose()
  }

  const handleServeCustomer = (customerId: string) => {
    if (shiftPhase === 'active') {
      // During shift: open AI chat with customer
      setActiveCustomerChat(customerId)
      audio.playOpen()
    } else {
      // Outside shift: instant serve (existing behaviour)
      setCustomerNeeds(prev => ({ ...prev, [customerId]: 'happy' }))
      setXp(prev => prev + 50)
      setServedTotal(prev => prev + 1)
      setJustServed(true)
      audio.playSend()
      setTimeout(() => setJustServed(false), 1000)
      const needs: CustomerNeed[] = ['drink', 'towel', 'menu']
      setTimeout(() => {
        setCustomerNeeds(prev => ({
          ...prev,
          [customerId]: needs[Math.floor(Math.random() * needs.length)],
        }))
      }, 8000)
    }
  }

  const handleCustomerChatClose = (exchangeCount: number) => {
    const id = activeCustomerChat!
    setActiveCustomerChat(null)
    setCustomerNeeds(prev => ({ ...prev, [id]: 'happy' }))
    setXp(prev => prev + 60)
    setServedTotal(prev => prev + 1)
    setJustServed(true)
    setShiftServed(prev => prev + 1)
    setShiftExchanges(prev => prev + exchangeCount)
    audio.playSend()
    setTimeout(() => setJustServed(false), 1000)
    const needs: CustomerNeed[] = ['drink', 'towel', 'menu']
    setTimeout(() => {
      setCustomerNeeds(prev => ({
        ...prev,
        [id]: needs[Math.floor(Math.random() * needs.length)],
      }))
    }, 10000)
  }

  const handleMobileMove = (dx: number, dz: number) => {
    mobileInputRef.current = { x: dx, z: dz }
  }

  const handlePinchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchStart.current = { dist: Math.sqrt(dx*dx + dy*dy), zoom: zoomRef.current }
    }
  }

  const handlePinchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.sqrt(dx*dx + dy*dy)
      zoomRef.current = Math.min(3, Math.max(0.35, pinchStart.current.zoom * (dist / pinchStart.current.dist)))
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 2) {
      dragRef.current = { x: e.clientX, yaw: camYawRef.current, type: 'orbit' }
    } else if (e.button === 0 && camMode === 'pov') {
      if (!isLockedRef.current) wrapperRef.current?.requestPointerLock()
      dragRef.current = { x: e.clientX, yaw: facingRef.current, type: 'pov' }
    }
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return
    if (dragRef.current.type === 'orbit') {
      camYawRef.current = dragRef.current.yaw - (e.clientX - dragRef.current.x) * 0.003
    } else if (!isLockedRef.current) {
      facingRef.current = dragRef.current.yaw + (e.clientX - dragRef.current.x) * 0.008
    }
  }
  const handleMouseUp = () => { dragRef.current = null }

  const handleMobileTalk = () => {
    if (nearbyNpc && !chatOpenRef.current) {
      setActiveChatNpc(nearbyNpc)
      chatOpenRef.current = true
      audio.playOpen()
    } else if (nearbyPlayerId && !chatOpenRef.current) {
      setActiveDMId(nearbyPlayerId)
      chatOpenRef.current = true
      audio.playOpen()
      socket.emit('getDMHistory', { withId: nearbyPlayerId })
    } else if (nearbyCustomerId && customerNeeds[nearbyCustomerId] !== 'happy') {
      handleServeCustomer(nearbyCustomerId)
    }
  }

  const [hudVisible, setHudVisible] = useState({ cam: true, topRight: true, mission: true })
  const toggleHud = (key: keyof typeof hudVisible) =>
    setHudVisible(prev => ({ ...prev, [key]: !prev[key] }))

  // Show profile setup on first visit or when editing
  if (!myProfile || showProfileSetup) {
    return <ProfileSetup initial={myProfile} onSave={handleSaveProfile} />
  }

  const restorePill = (key: keyof typeof hudVisible, icon: string, style: React.CSSProperties) => (
    <button
      onClick={() => toggleHud(key)}
      style={{
        position: 'absolute', zIndex: 15,
        background: 'rgba(0,0,0,0.5)', color: 'rgba(255,255,255,0.7)',
        border: '1px solid rgba(255,255,255,0.18)', borderRadius: 20,
        padding: '5px 12px', fontSize: 14, cursor: 'pointer',
        backdropFilter: 'blur(8px)', fontFamily: 'sans-serif',
        ...style,
      }}
    >{icon}</button>
  )

  return (
    <div
      ref={wrapperRef}
      style={{ width: '100vw', height: '100vh', position: 'relative', background: '#f4a460' }}
      onTouchStart={handlePinchStart}
      onTouchMove={handlePinchMove}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={e => { zoomRef.current = Math.min(3, Math.max(0.35, zoomRef.current * (1 - e.deltaY * 0.001))) }}
      onContextMenu={e => e.preventDefault()}
    >
      <style>{`
        @keyframes floatXp  { 0%{transform:translateY(0) translateX(-50%);opacity:1} 100%{transform:translateY(-70px) translateX(-50%);opacity:0} }
        @keyframes slideDown { 0%{transform:translateX(-50%) translateY(-20px);opacity:0} 100%{transform:translateX(-50%) translateY(0);opacity:1} }
      `}</style>

      {/* Minimap */}
      <Minimap position={position} facingRef={facingRef} players={players} myId={myId.current} customerNeeds={customerNeeds} camMode={camMode} />

      {/* Floating XP */}
      {justServed && (
        <div style={{
          position: 'absolute', top: '42%', left: '50%', zIndex: 30,
          animation: 'floatXp 1s ease-out forwards',
          color: '#f1c40f', fontSize: 26, fontWeight: 900,
          fontFamily: '-apple-system, sans-serif',
          textShadow: '0 2px 10px rgba(0,0,0,0.6)',
          pointerEvents: 'none', whiteSpace: 'nowrap',
        }}>+60 XP ⭐</div>
      )}

      {/* POV crosshair + click-to-lock hint */}
      {camMode === 'pov' && (
        <>
          <div style={{
            position: 'absolute', top: '50%', left: '50%', zIndex: 5,
            transform: 'translate(-50%,-50%)', width: 18, height: 18, pointerEvents: 'none',
          }}>
            <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: 'rgba(255,255,255,0.55)', transform: 'translateY(-50%)' }} />
            <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.55)', transform: 'translateX(-50%)' }} />
          </div>
          {!isPointerLocked && (
            <div style={{
              position: 'absolute', top: 'calc(50% + 22px)', left: '50%',
              transform: 'translateX(-50%)', zIndex: 5,
              color: 'rgba(255,255,255,0.45)', fontSize: 11,
              fontFamily: '-apple-system, sans-serif', pointerEvents: 'none',
              letterSpacing: 0.4,
            }}>Click to look freely · ESC to release</div>
          )}
        </>
      )}
      {/* HUD — top right */}
      {hudVisible.topRight ? (
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Avatar button */}
          <button onClick={() => setShowProfileSetup(true)} title="Editar perfil" style={{
            width: 38, height: 38, borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.3)',
            background: myOutfit.bodyColor, cursor: 'pointer', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
          }}>{myProfile.faceEmoji}</button>
          {/* People panel button */}
          <button onClick={() => setShowPeoplePanel(true)} title="Quem está no club" style={{
            width: 38, height: 38, borderRadius: '50%', position: 'relative',
            border: '2px solid rgba(255,255,255,0.15)',
            background: 'rgba(0,0,0,0.4)',
            cursor: 'pointer', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
          }}>👥</button>
          {/* Matches button */}
          <button onClick={() => setShowMatches(true)} title="Ver matches" style={{
            width: 38, height: 38, borderRadius: '50%', position: 'relative',
            border: matches.size > 0 ? '2px solid rgba(231,76,60,0.6)' : '2px solid rgba(255,255,255,0.15)',
            background: matches.size > 0 ? 'rgba(231,76,60,0.18)' : 'rgba(0,0,0,0.4)',
            cursor: 'pointer', fontSize: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.35)',
            backdropFilter: 'blur(8px)',
          }}>
            ❤️
            {matches.size > 0 && (
              <div style={{
                position: 'absolute', top: -4, right: -4,
                width: 17, height: 17, borderRadius: '50%',
                background: '#e74c3c', fontSize: 9, fontWeight: 800, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1.5px solid rgba(0,0,0,0.3)',
              }}>{matches.size}</div>
            )}
          </button>
          {/* Pill bar: Shop + Online + Collapse */}
          <div style={{
            display: 'flex', gap: 0, alignItems: 'center',
            background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(12px)',
            borderRadius: 26, padding: '4px 6px',
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <button onClick={() => setShowShop(true)} style={{
              padding: '5px 13px', borderRadius: 22, border: 'none',
              background: 'transparent', color: 'rgba(255,255,255,0.7)',
              fontFamily: '-apple-system, sans-serif', fontSize: 12,
              fontWeight: 600, cursor: 'pointer', letterSpacing: 0.3,
            }}>Loja</button>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)' }} />
            <div style={{
              padding: '5px 13px', color: 'rgba(255,255,255,0.55)',
              fontFamily: '-apple-system, sans-serif', fontSize: 12,
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4caf50', display: 'inline-block' }} />
              {Object.keys(players).length}
            </div>
            <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)' }} />
            <button onClick={() => toggleHud('topRight')} style={{
              width: 26, height: 26, borderRadius: '50%', border: 'none',
              background: 'transparent', color: 'rgba(255,255,255,0.35)',
              cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>−</button>
          </div>
        </div>
      ) : restorePill('topRight', '≡', { top: 16, right: 16 })}

      <div style={{
        position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, color: 'rgba(255,255,255,0.28)',
        fontFamily: '-apple-system, sans-serif', fontSize: 11,
        letterSpacing: 0.5, pointerEvents: 'none', whiteSpace: 'nowrap',
      }}>
        WASD · mover &nbsp;|&nbsp; E · interagir &nbsp;|&nbsp; C · câmera &nbsp;|&nbsp; drag direito · orbitar
      </div>

      {/* Camera mode selector */}
      {hudVisible.cam ? (
        <div style={{
          position: 'absolute', top: 16, left: 16, zIndex: 10,
          display: 'flex', gap: 2, alignItems: 'center',
          background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(12px)',
          borderRadius: 26, padding: '4px 5px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {CAM_KEYS.map(m => (
            <button key={m} onClick={() => setCamMode(m)} style={{
              padding: '5px 13px', borderRadius: 22, border: 'none',
              background: camMode === m ? '#f39c12' : 'transparent',
              color: camMode === m ? '#111' : 'rgba(255,255,255,0.5)',
              fontFamily: '-apple-system, sans-serif', fontSize: 11,
              fontWeight: camMode === m ? 800 : 500,
              cursor: 'pointer', letterSpacing: 0.6, textTransform: 'uppercase',
              transition: 'background 0.15s, color 0.15s',
            }}>{m}</button>
          ))}
          <div style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.12)', margin: '0 3px' }} />
          <button onClick={() => toggleHud('cam')} style={{
            width: 26, height: 26, borderRadius: '50%', border: 'none',
            background: 'transparent', color: 'rgba(255,255,255,0.35)',
            cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>−</button>
        </div>
      ) : restorePill('cam', '⊹', { top: 16, left: 16 })}

      {/* Shop */}
      {showShop && (
        <Shop myProfile={myProfile!} onChangeOutfit={handleChangeOutfit} onClose={() => setShowShop(false)} />
      )}

      {/* Matches panel */}
      {showMatches && !activeDMId && (() => {
        const cardProfiles: Record<string, CardProfile> = {}
        Object.entries(remoteProfiles).forEach(([id, rp]) => {
          const outfit = getOutfit(rp.outfitId)
          cardProfiles[id] = { name: rp.name, faceEmoji: rp.faceEmoji, bodyColor: outfit.bodyColor, headColor: outfit.headColor, bio: rp.bio, interests: rp.interests, isNpc: false }
        })
        return (
          <MatchesPanel
            matches={matches}
            profiles={cardProfiles}
            myInterests={myProfile?.interests ?? []}
            unreadDMs={unreadDMs}
            onOpenDM={id => {
              setActiveDMId(id)
              setUnreadDMs(prev => { const s = new Set(prev); s.delete(id); return s })
              socket.emit('getDMHistory', { withId: id })
            }}
            onClose={() => setShowMatches(false)}
          />
        )
      })()}

      {/* DM panel */}
      {activeDMId && (() => {
        const rp = remoteProfiles[activeDMId]
        const outfit = rp ? getOutfit(rp.outfitId) : getOutfit('beach')
        const partnerCard: CardProfile = {
          name: rp?.name ?? 'Player', faceEmoji: rp?.faceEmoji ?? '🙂',
          bodyColor: outfit.bodyColor, headColor: outfit.headColor,
          bio: rp?.bio ?? '', interests: rp?.interests ?? [], isNpc: false,
          photoUrl: rp?.photoUrl,
        }
        const myOutfitColors = getOutfit(myProfile!.outfitId)
        return (
          <DMPanel
            partnerProfile={partnerCard}
            partnerPhotos={rp?.photos}
            isMatch={matches.has(activeDMId)}
            myId={myId.current}
            myEmoji={myProfile!.faceEmoji}
            myBodyColor={myOutfitColors.bodyColor}
            myHeadColor={myOutfitColors.headColor}
            messages={dmMessages[activeDMId] ?? []}
            onSend={text => {
              const msg: DMMessage = { fromId: myId.current, text, timestamp: Date.now() }
              setDmMessages(prev => ({ ...prev, [activeDMId]: [...(prev[activeDMId] ?? []), msg] }))
              socket.emit('sendDM', { toId: activeDMId, text })
            }}
            onBack={() => { setActiveDMId(null); chatOpenRef.current = false }}
            onClose={() => { setActiveDMId(null); setShowMatches(false); chatOpenRef.current = false }}
          />
        )
      })()}

      {/* Match notification overlay */}
      {matchNotify && myProfile && (() => {
        const myOutfitColors = getOutfit(myProfile.outfitId)
        return (
          <MatchNotification
            myName={myProfile.name}
            myEmoji={myProfile.faceEmoji}
            myBodyColor={myOutfitColors.bodyColor}
            myHeadColor={myOutfitColors.headColor}
            matchName={matchNotify.name}
            matchEmoji={matchNotify.faceEmoji}
            matchBodyColor={matchNotify.bodyColor}
            matchHeadColor={matchNotify.headColor}
            onContinue={() => setMatchNotify(null)}
          />
        )
      })()}

      {/* Notification toast */}
      {notification && (
        <div style={{
          position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)',
          zIndex: 60, background: 'rgba(6,6,18,0.92)', backdropFilter: 'blur(12px)',
          color: '#fff', padding: '12px 24px', borderRadius: 20,
          fontFamily: '-apple-system, sans-serif', fontSize: 15, fontWeight: 700,
          border: '1.5px solid rgba(243,156,18,0.5)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          animation: 'slideDown 0.25s ease',
          pointerEvents: 'none',
        }}>{notification}</div>
      )}

      {/* Customer chat (during shift) */}
      {activeCustomerChat && (
        <CustomerChat customerId={activeCustomerChat} onClose={handleCustomerChatClose} />
      )}

      {/* Shift performance report */}
      {showReport && shiftPhase === 'ended' && (
        <ShiftReport
          stats={{
            served: shiftServed,
            missed: shiftMissed,
            exchanges: shiftExchanges,
            shiftDuration: 180 - shiftTimeLeft,
            quitEarly: _quitEarlyRef.current,
          }}
          onClose={() => { setShowReport(false); setShiftPhase('idle') }}
        />
      )}

      {/* Chat panel */}
      {activeChatNpc && <ChatPanel npc={activeChatNpc} onClose={closeChat} />}

      {/* People panel — opt-in directory */}
      {showPeoplePanel && (
        <PeoplePanel
          players={players}
          profiles={remoteProfiles}
          myId={myId.current}
          matches={matches}
          likedIds={likedIds}
          likedNpcIds={likedNpcIds}
          myInterests={myProfile?.interests ?? []}
          onLikePlayer={id => handleLike(id)}
          onLikeNpc={id => setLikedNpcIds(prev => new Set(prev).add(id))}
          onChatNpc={npc => { setActiveChatNpc(npc); chatOpenRef.current = true; audio.playOpen(); setShowPeoplePanel(false) }}
          onOpenDM={id => {
            setActiveDMId(id)
            setUnreadDMs(prev => { const s = new Set(prev); s.delete(id); return s })
            socket.emit('getDMHistory', { withId: id })
            setShowPeoplePanel(false)
          }}
          onClose={() => setShowPeoplePanel(false)}
        />
      )}

      {/* Mission / shift panel */}
      {hudVisible.mission ? (
        <div style={{ position: 'absolute', top: 60, right: 16, zIndex: 10 }}>
          <button
            onClick={() => toggleHud('mission')}
            style={{
              position: 'absolute', top: 6, right: 6, zIndex: 15,
              width: 22, height: 22, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(0,0,0,0.3)', color: 'rgba(255,255,255,0.45)',
              cursor: 'pointer', fontSize: 11,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'sans-serif',
            }}
          >−</button>
          <MissionPanel
            xp={xp} servedTotal={servedTotal} justServed={justServed}
            shiftPhase={shiftPhase} shiftTimeLeft={shiftTimeLeft}
            shiftServed={shiftServed} shiftMissed={shiftMissed}
            onStartShift={startShift}
            onEndShift={() => { endShift(true); setShowReport(true) }}
            onShowReport={() => setShowReport(true)}
          />
        </div>
      ) : restorePill('mission', '🎯', { top: 60, right: 16 })}

      {/* Mobile controls */}
      {isMobile && (
        <MobileControls
          onMove={handleMobileMove}
          onTalk={handleMobileTalk}
          nearNpc={!!nearbyNpc || !!nearbyPlayerId || (!!nearbyCustomerId && customerNeeds[nearbyCustomerId] !== 'happy')}
        />
      )}

      <Canvas shadows camera={{ position: [0, 14, 12], fov: 50 }}>
        <fog attach="fog" args={['#f4a460', 45, 95]} />
        <DayNight />
        <Sky />
        {/* Pool area — cool aqua fill */}
        <pointLight position={[0, 4, -10]} intensity={6} distance={20} color="#40e0d0" decay={2} />
        {/* Bar — warm amber */}
        <pointLight position={[16, 4, -4]} intensity={5} distance={14} color="#ff9944" decay={2} />
        {/* Reception arch — soft white */}
        <pointLight position={[0, 5, 17]} intensity={4} distance={16} color="#ffe8b0" decay={2} />
        <DJLights />

        <CameraRig targetRef={positionRef} mode={camMode} facingRef={facingRef} zoomRef={zoomRef} camYawRef={camYawRef} velMagRef={velMagRef} hasInputRef={hasInputRef} />
        <MovementSystem keysRef={keysRef} mobileInputRef={mobileInputRef} velocityRef={velocityRef} positionRef={positionRef} facingRef={facingRef} velMagRef={velMagRef} camYawRef={camYawRef} hasInputRef={hasInputRef} camModeRef={camModeRef} setPosition={setPosition} chatOpenRef={chatOpenRef} />
        <BeachClub />
        <ReceptionArea />
        <ValentinaBuggy />

        {NPCS.map(npc => (
          <NPCCharacter key={npc.id} npc={npc} nearby={nearbyNpc?.id === npc.id} playerPosRef={positionRef} />
        ))}

        <AICustomers
          needs={customerNeeds} nearbyId={nearbyCustomerId}
          missionActive={shiftPhase === 'active'}
          onPatienceOut={handlePatienceOut}
        />
        {camMode !== 'pov' && <LocalPlayer positionRef={positionRef} facingRef={facingRef} velMagRef={velMagRef} bodyColor={myOutfit.bodyColor} headColor={myOutfit.headColor} hairColor={myOutfit.hairColor} pantsColor={myOutfit.pantsColor} />}
        {Object.entries(players).map(([id, player]) => {
          if (id === myId.current) return null
          const rProfile = remoteProfiles[id]
          const rOutfit = getOutfit(rProfile?.outfitId ?? 'ocean')
          return <RemotePlayer key={id} targetPosition={player} bodyColor={rOutfit.bodyColor} headColor={rOutfit.headColor} hairColor={rOutfit.hairColor} pantsColor={rOutfit.pantsColor} name={rProfile?.name} photoUrl={rProfile?.photoUrl} nationality={rProfile?.nationality} showNameplate={rProfile?.showNameplate} nearby={nearbyPlayerId === id} />
        })}
      </Canvas>
    </div>
  )
}
