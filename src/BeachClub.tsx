import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function Ground() {
  return (
    <>
      {/* Main club floor — warm sand */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, -5]}>
        <planeGeometry args={[90, 70]} />
        <meshStandardMaterial color="#e8d590" roughness={0.9} />
      </mesh>
      {/* Beach strip — lighter fine sand */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.003, -37]}>
        <planeGeometry args={[90, 24]} />
        <meshStandardMaterial color="#f2e8b0" roughness={0.95} />
      </mesh>
      {/* Ocean seabed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.4, -64]}>
        <planeGeometry args={[130, 36]} />
        <meshStandardMaterial color="#155a8a" roughness={0.5} />
      </mesh>
    </>
  )
}

function Ocean() {
  const waterRef = useRef<THREE.MeshStandardMaterial>(null)
  const foamRef  = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (waterRef.current) {
      waterRef.current.color.setHSL(0.575 + Math.sin(t * 0.25) * 0.018, 0.82, 0.38 + Math.sin(t * 0.45) * 0.04)
      waterRef.current.opacity = 0.92 + Math.sin(t * 0.7) * 0.04
    }
    if (foamRef.current) {
      foamRef.current.opacity = 0.45 + Math.sin(t * 1.2) * 0.2
    }
  })

  return (
    <group>
      {/* Deep ocean surface */}
      <mesh position={[0, -0.3, -64]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[130, 36]} />
        <meshStandardMaterial
          ref={waterRef} color="#0a72b8"
          transparent opacity={0.93}
          roughness={0.08} metalness={0.25}
        />
      </mesh>
      {/* Shore water — shallow turquoise */}
      <mesh position={[0, -0.08, -49]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 7]} />
        <meshStandardMaterial color="#3ec8dc" transparent opacity={0.55} roughness={0.15} />
      </mesh>
      {/* Wave foam line */}
      <mesh position={[0, -0.05, -48]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 2.5]} />
        <meshStandardMaterial ref={foamRef} color="#ffffff" transparent opacity={0.5} roughness={0.9} />
      </mesh>
    </group>
  )
}

function Pool() {
  const waterRef = useRef<THREE.MeshStandardMaterial>(null)
  const c1 = useRef<THREE.PointLight>(null)
  const c2 = useRef<THREE.PointLight>(null)
  const c3 = useRef<THREE.PointLight>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (waterRef.current) {
      waterRef.current.color.setHSL(0.535 + Math.sin(t * 0.32) * 0.02, 0.82, 0.50 + Math.sin(t * 0.58) * 0.04)
      waterRef.current.opacity = 0.86 + Math.sin(t * 0.85) * 0.05
    }
    // Caustic light animation — 3 slowly orbiting lights inside pool
    ;[c1, c2, c3].forEach((r, i) => {
      if (!r.current) return
      const a = t * 0.55 + i * (Math.PI * 2 / 3)
      r.current.position.x = Math.cos(a) * 2.8
      r.current.position.z = -10 + Math.sin(a) * 1.9
      r.current.intensity = 2.2 + Math.sin(t * 2.4 + i * 1.3) * 0.9
    })
  })

  const rim = '#c4b49a'
  const deck = '#d8ccb8'

  return (
    <group>
      {/* Tile deck around pool */}
      <mesh position={[0, 0.01, -10]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color={deck} roughness={0.55} />
      </mesh>

      {/* Pool bottom (deep look) */}
      <mesh position={[0, 0.02, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 8]} />
        <meshStandardMaterial color="#0b4d7a" roughness={0.45} />
      </mesh>

      {/* Pool rim — 4 sides */}
      <mesh position={[0,    0.27, -5.95]}  castShadow><boxGeometry args={[11.6, 0.44, 0.2]} /><meshStandardMaterial color={rim} roughness={0.5} /></mesh>
      <mesh position={[0,    0.27, -14.05]} castShadow><boxGeometry args={[11.6, 0.44, 0.2]} /><meshStandardMaterial color={rim} roughness={0.5} /></mesh>
      <mesh position={[5.9,  0.27, -10]}    castShadow><boxGeometry args={[0.2,  0.44, 8.3]} /><meshStandardMaterial color={rim} roughness={0.5} /></mesh>
      <mesh position={[-5.9, 0.27, -10]}    castShadow><boxGeometry args={[0.2,  0.44, 8.3]} /><meshStandardMaterial color={rim} roughness={0.5} /></mesh>

      {/* Water surface */}
      <mesh position={[0, 0.2, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 8]} />
        <meshStandardMaterial
          ref={waterRef} color="#18c8ea"
          transparent opacity={0.88}
          roughness={0.05} metalness={0.18}
        />
      </mesh>

      {/* Pool steps (NE corner) */}
      <mesh position={[4.5, 0.08, -6.5]}>
        <boxGeometry args={[1.3, 0.14, 1.3]} />
        <meshStandardMaterial color={rim} roughness={0.5} />
      </mesh>
      <mesh position={[4.5, 0.15, -6.5]}>
        <boxGeometry args={[0.95, 0.13, 0.95]} />
        <meshStandardMaterial color={rim} roughness={0.5} />
      </mesh>

      {/* Pool underwater light glow + 3 caustic orbits */}
      <pointLight position={[0, 0.15, -10]} intensity={7} distance={14} color="#00ddee" decay={2} />
      <pointLight ref={c1} position={[0, 0.3, -10]} intensity={2} distance={9} color="#40e8ff" decay={2} />
      <pointLight ref={c2} position={[2, 0.3, -11]} intensity={2} distance={9} color="#30d8f0" decay={2} />
      <pointLight ref={c3} position={[-2, 0.3, -9]} intensity={2} distance={9} color="#55eeff" decay={2} />
    </group>
  )
}

function Bar() {
  return (
    <group position={[16, 0, -4]}>
      {/* Counter body */}
      <mesh position={[0, 0.56, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 1.12, 11.2]} />
        <meshStandardMaterial color="#7a4818" roughness={0.65} />
      </mesh>
      {/* Counter top — dark marble */}
      <mesh position={[0, 1.18, 0]} castShadow>
        <boxGeometry args={[1.65, 0.1, 11.6]} />
        <meshStandardMaterial color="#2a1808" roughness={0.25} metalness={0.1} />
      </mesh>
      {/* Back-bar shelving */}
      <mesh position={[0.76, 1.7, 0]} castShadow>
        <boxGeometry args={[0.2, 1.22, 10.8]} />
        <meshStandardMaterial color="#4e2c0a" roughness={0.7} />
      </mesh>
      {[1.32, 1.72, 2.12].map((y, i) => (
        <mesh key={i} position={[0.76, y, 0]}>
          <boxGeometry args={[0.22, 0.04, 10.7]} />
          <meshStandardMaterial color="#2a1408" roughness={0.4} />
        </mesh>
      ))}
      {/* Bottles */}
      {([-4, -2.8, -1.6, -0.4, 0.8, 2.0, 3.2] as number[]).map((z, i) => (
        <mesh key={i} position={[0.7, 1.55, z]}>
          <cylinderGeometry args={[0.055, 0.065, 0.34, 8]} />
          <meshStandardMaterial
            color={(['#1a9944','#cc3318','#1a44cc','#cc7a18','#882acc','#18ccbb','#cc4488'] as string[])[i]}
            transparent opacity={0.82} roughness={0.15}
          />
        </mesh>
      ))}
      {/* Bar stools */}
      {([-4, -2, 0, 2, 4] as number[]).map((z, i) => (
        <group key={i} position={[-0.92, 0, z]}>
          <mesh position={[0, 0.68, 0]}>
            <cylinderGeometry args={[0.19, 0.19, 0.07, 12]} />
            <meshStandardMaterial color="#999" metalness={0.55} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.34, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.65, 8]} />
            <meshStandardMaterial color="#bbb" metalness={0.75} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.17, 0.21, 0.08, 10]} />
            <meshStandardMaterial color="#888" metalness={0.55} />
          </mesh>
        </group>
      ))}
      {/* Under-counter LED strip */}
      <mesh position={[-0.76, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.05, 11]} />
        <meshStandardMaterial color="#ff8800" emissive="#ff5500" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

function PalmTree({ position, lean = 0, seed = 0 }: {
  position: [number, number, number]
  lean?: number
  seed?: number
}) {
  const treeRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!treeRef.current) return
    const t = clock.elapsedTime * 0.28 + seed * 1.9
    treeRef.current.rotation.z = Math.sin(t) * 0.022
    treeRef.current.rotation.x = Math.sin(t * 0.68 + 1.3) * 0.014
  })
  return (
    <group ref={treeRef} position={position}>
      {/* Trunk — only this casts shadow */}
      <mesh
        position={[lean * 0.08, 2.8, lean * 0.04]}
        rotation={[lean * 0.04, 0, lean * 0.052]}
        castShadow
      >
        <cylinderGeometry args={[0.14, 0.27, 5.6, 8]} />
        <meshStandardMaterial color="#8a6314" roughness={0.88} />
      </mesh>
      {/* Crown blob — gives the tree visual mass */}
      <mesh position={[lean * 0.08, 5.6, lean * 0.04]}>
        <sphereGeometry args={[1.1, 7, 5]} />
        <meshStandardMaterial color="#2a8030" roughness={0.85} />
      </mesh>
      {/* Fronds — plane geometry, NO castShadow, DoubleSide */}
      {Array.from({ length: 7 }, (_, i) => {
        const deg = (i / 7) * 360 + seed * 18
        const rad = (deg * Math.PI) / 180
        return (
          <mesh
            key={i}
            position={[lean * 0.08 + Math.cos(rad) * 1.0, 5.55, lean * 0.04 + Math.sin(rad) * 1.0]}
            rotation={[-0.52 + (i % 2) * 0.12, rad, 0]}
          >
            <planeGeometry args={[0.6, 3.0]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#2a8030' : '#349038'}
              roughness={0.78}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
    </group>
  )
}

function Sunbed({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const towelColors = ['#2277cc', '#cc3333', '#f0bb20', '#22aa66', '#cc44aa', '#4488cc', '#e05522']
  const ci = Math.abs(Math.floor(position[0] * 3 + position[2])) % towelColors.length
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh position={[0, 0.23, 0]} castShadow>
        <boxGeometry args={[0.7, 0.07, 2.08]} />
        <meshStandardMaterial color="#ccc0a0" roughness={0.65} />
      </mesh>
      {/* Reclining back */}
      <mesh position={[0, 0.34, 0.87]} rotation={[-0.26, 0, 0]}>
        <boxGeometry args={[0.62, 0.09, 0.44]} />
        <meshStandardMaterial color="#bfb898" roughness={0.65} />
      </mesh>
      {/* Towel */}
      <mesh position={[0, 0.28, -0.08]}>
        <boxGeometry args={[0.62, 0.04, 1.52]} />
        <meshStandardMaterial color={towelColors[ci]} roughness={0.9} />
      </mesh>
      {/* Legs */}
      {([[-0.29, 0.12, 0.76], [0.29, 0.12, 0.76], [-0.29, 0.12, -0.76], [0.29, 0.12, -0.76]] as [number, number, number][]).map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.05, 0.24, 0.05]} />
          <meshStandardMaterial color="#a89878" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function Umbrella({ position, color }: { position: [number, number, number]; color: string }) {
  const fringeAngles = Array.from({ length: 12 }, (_, i) => (i / 12) * 360)
  return (
    <group position={position}>
      <mesh position={[0, 1.65, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.028, 3.3, 7]} />
        <meshStandardMaterial color="#b8a880" roughness={0.75} />
      </mesh>
      <mesh position={[0, 3.22, 0]} castShadow>
        <coneGeometry args={[2.05, 0.72, 14]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.72} />
      </mesh>
      {/* Fringe */}
      {fringeAngles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return (
          <mesh key={i} position={[Math.cos(rad) * 1.82, 2.88, Math.sin(rad) * 1.82]}>
            <boxGeometry args={[0.11, 0.2, 0.03]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        )
      })}
    </group>
  )
}

function ShoreFoam() {
  const COUNT   = 80
  const ptsRef  = useRef<THREE.Points>(null)
  const origPos = useRef((() => {
    const a = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      a[i*3]   = (Math.random() - 0.5) * 82
      a[i*3+1] = 0.06
      a[i*3+2] = -46.5 - Math.random() * 2.5
    }
    return a
  })())
  const phases = useRef(Array.from({ length: COUNT }, () => Math.random() * Math.PI * 2))
  useFrame(({ clock }) => {
    if (!ptsRef.current) return
    const t    = clock.elapsedTime
    const attr = ptsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const o    = origPos.current
    for (let i = 0; i < COUNT; i++) {
      const wave = Math.sin(t * 0.85 + phases.current[i]) * 1.2
      attr.setXYZ(i, o[i*3], o[i*3+1], o[i*3+2] + wave)
    }
    attr.needsUpdate = true
    ;(ptsRef.current.material as THREE.PointsMaterial).opacity = 0.45 + Math.sin(t * 0.85) * 0.28
  })
  return (
    <points ref={ptsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[origPos.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ddf4ff" size={0.28} transparent opacity={0.5} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function TikiTorch({ position }: { position: [number, number, number] }) {
  const flameRef = useRef<THREE.Mesh>(null)
  const lightRef = useRef<THREE.PointLight>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const f = 0.88 + Math.sin(t * 18.3) * 0.07 + Math.sin(t * 25.7) * 0.05
    if (flameRef.current) {
      flameRef.current.scale.setScalar(f)
      flameRef.current.position.y = 2.88 + Math.sin(t * 12.1) * 0.03
      ;(flameRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = 0.85 + Math.sin(t * 14.4) * 0.15
    }
    if (lightRef.current) {
      lightRef.current.intensity = 4.2 + Math.sin(t * 18.3) * 0.9 + Math.sin(t * 25.7) * 0.6
      lightRef.current.color.setHSL(0.075 + Math.sin(t * 6.2) * 0.018, 1, 0.54)
    }
  })
  return (
    <group position={position}>
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.038, 0.058, 2.7, 6]} />
        <meshStandardMaterial color="#7a5218" roughness={0.92} />
      </mesh>
      <mesh position={[0, 2.75, 0]}>
        <cylinderGeometry args={[0.13, 0.09, 0.28, 8]} />
        <meshStandardMaterial color="#503510" roughness={0.85} />
      </mesh>
      <mesh ref={flameRef} position={[0, 2.88, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ff7700" emissive="#ff4400" emissiveIntensity={1.0} />
      </mesh>
      <pointLight ref={lightRef} position={[0, 2.9, 0]} intensity={4} distance={7} color="#ff8800" decay={2} />
    </group>
  )
}

function DancingFigure({ position, bodyColor, headColor, phase = 0 }: {
  position: [number, number, number]; bodyColor: string; headColor: string; phase?: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const lArmRef  = useRef<THREE.Group>(null)
  const rArmRef  = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime * 1.933 + phase  // 116 BPM
    if (!groupRef.current) return
    groupRef.current.position.y = Math.abs(Math.sin(t * Math.PI)) * 0.12
    groupRef.current.rotation.y = Math.sin(t * Math.PI * 0.5) * 0.3
    if (lArmRef.current) lArmRef.current.rotation.x = Math.sin(t * Math.PI + 0.9) * 0.85
    if (rArmRef.current) rArmRef.current.rotation.x = Math.sin(t * Math.PI - 0.9) * 0.85
  })
  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0.62, 0]}>
        <capsuleGeometry args={[0.14, 0.48, 4, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.34, 0]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color={headColor} roughness={0.65} />
      </mesh>
      <group ref={lArmRef} position={[-0.22, 1.02, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.05, 0.32, 4, 6]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} />
        </mesh>
      </group>
      <group ref={rArmRef} position={[0.22, 1.02, 0]}>
        <mesh position={[0, -0.18, 0]}>
          <capsuleGeometry args={[0.05, 0.32, 4, 6]} />
          <meshStandardMaterial color={bodyColor} roughness={0.7} />
        </mesh>
      </group>
    </group>
  )
}

function DanceFloor() {
  const matRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([])
  const TILES: [number, number][] = []
  for (let col = -3; col <= 3; col += 2)
    for (let row = 0; row < 4; row++)
      TILES.push([col, -17.2 - row * 1.85])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const beat = Math.pow(Math.max(0, Math.cos((t * 116 / 60) * Math.PI * 2)), 4)
    matRefs.current.forEach((mat, i) => {
      if (!mat) return
      mat.emissive.setHSL((t * 0.05 + i * 0.07) % 1, 1, 0.5)
      mat.emissiveIntensity = 0.12 + beat * 1.4
    })
  })
  return (
    <>
      <mesh position={[0, 0.005, -20]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[9, 8.5]} />
        <meshStandardMaterial color="#06061a" roughness={0.18} metalness={0.35} />
      </mesh>
      {TILES.map(([x, z], i) => (
        <mesh key={i} position={[x, 0.012, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.6, 1.6]} />
          <meshStandardMaterial
            ref={el => { matRefs.current[i] = el }}
            color="#0a0a22" emissive="#0055ff" emissiveIntensity={0.12}
            roughness={0.1} metalness={0.55}
          />
        </mesh>
      ))}
    </>
  )
}

function DanceSparkles() {
  const COUNT   = 70
  const ptsRef  = useRef<THREE.Points>(null)
  const origPos = useRef((() => {
    const a = new Float32Array(COUNT * 3)
    for (let i = 0; i < COUNT; i++) {
      a[i*3]   = (Math.random() - 0.5) * 8.5
      a[i*3+1] = Math.random() * 4.2
      a[i*3+2] = -17 - Math.random() * 6.5
    }
    return a
  })())
  const phases = useRef(Array.from({ length: COUNT }, () => Math.random() * Math.PI * 2))
  const spds   = useRef(Array.from({ length: COUNT }, () => 0.5 + Math.random() * 0.9))
  useFrame(({ clock }) => {
    if (!ptsRef.current) return
    const t   = clock.elapsedTime
    const attr = ptsRef.current.geometry.attributes.position as THREE.BufferAttribute
    const o   = origPos.current
    for (let i = 0; i < COUNT; i++) {
      attr.setXYZ(
        i,
        o[i*3] + Math.sin(t * 0.7 + phases.current[i]) * 0.25,
        (o[i*3+1] + t * spds.current[i]) % 4.5,
        o[i*3+2],
      )
    }
    attr.needsUpdate = true
  })
  return (
    <points ref={ptsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[origPos.current, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#ffdd44" size={0.07} transparent opacity={0.7} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function DJBooth() {
  return (
    <group position={[0, 0, -20]}>
      {/* Raised stage */}
      <mesh position={[0, 0.13, 0]} castShadow receiveShadow>
        <boxGeometry args={[9.5, 0.26, 3.5]} />
        <meshStandardMaterial color="#16162a" roughness={0.5} />
      </mesh>
      {/* Stage LED edge front */}
      <mesh position={[0, 0.27, 1.75]}>
        <boxGeometry args={[9.5, 0.05, 0.06]} />
        <meshStandardMaterial color="#8888ff" emissive="#5555ff" emissiveIntensity={1.4} />
      </mesh>
      {/* Stage LED sides */}
      <mesh position={[-4.75, 0.27, 0]}>
        <boxGeometry args={[0.06, 0.05, 3.5]} />
        <meshStandardMaterial color="#8888ff" emissive="#5555ff" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[4.75, 0.27, 0]}>
        <boxGeometry args={[0.06, 0.05, 3.5]} />
        <meshStandardMaterial color="#8888ff" emissive="#5555ff" emissiveIntensity={1.4} />
      </mesh>
      {/* Console */}
      <mesh position={[0, 0.72, -0.4]} castShadow>
        <boxGeometry args={[7.2, 1.18, 2.4]} />
        <meshStandardMaterial color="#0e0e20" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.34, -0.72]} castShadow>
        <boxGeometry args={[6.4, 0.28, 1.5]} />
        <meshStandardMaterial color="#080818" roughness={0.3} />
      </mesh>
      {/* Screens */}
      {([-2.4, 0, 2.4] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 1.86, -1.1]}>
          <boxGeometry args={[1.6, 0.82, 0.06]} />
          <meshStandardMaterial
            color="#050520"
            emissive={(['#440099','#006644','#990022'] as string[])[i]}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
      {/* Speaker stacks */}
      {([-4.5, 4.5] as number[]).map((x, i) => (
        <group key={i} position={[x, 0, -0.5]}>
          <mesh position={[0, 1.08, 0]} castShadow>
            <boxGeometry args={[0.95, 2.3, 0.88]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.08, 0.44]}>
            <boxGeometry args={[0.72, 1.9, 0.03]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
          </mesh>
        </group>
      ))}
      {/* Floor glow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.5, 3]} />
        <meshStandardMaterial color="#090920" roughness={0.8} />
      </mesh>
    </group>
  )
}

function WaveAnimation() {
  const refs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ]
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const speed = 2.8
    refs.forEach((r, i) => {
      if (!r.current) return
      r.current.position.z = -56 + ((t * speed + i * 3) % 9)
      const prog = (r.current.position.z + 56) / 9
      const mat = r.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.18 + prog * 0.28
    })
  })
  return (
    <>
      {refs.map((r, i) => (
        <mesh key={i} ref={r} position={[0, 0.03, -56 + i * 3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[90, 2.2]} />
          <meshStandardMaterial color="#aaddee" transparent opacity={0.25} roughness={0.2} />
        </mesh>
      ))}
    </>
  )
}

function ThatchKiosk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Support posts */}
      {([[-1, -0.8], [1, -0.8], [-1, 0.8], [1, 0.8]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 1.3, z]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, 2.6, 7]} />
          <meshStandardMaterial color="#7a5218" roughness={0.85} />
        </mesh>
      ))}
      {/* Thatch cone roof — semi-transparent so guests visible from top view */}
      <mesh position={[0, 2.7, 0]}>
        <coneGeometry args={[2.1, 0.95, 8]} />
        <meshStandardMaterial color="#c8a060" roughness={0.9} side={THREE.DoubleSide} transparent opacity={0.52} />
      </mesh>
      {/* Fringe */}
      {Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * 1.8, 2.27, Math.sin(angle) * 1.8]}>
            <boxGeometry args={[0.1, 0.24, 0.07]} />
            <meshStandardMaterial color="#a07030" roughness={0.9} />
          </mesh>
        )
      })}
      {/* Round kiosk counter */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.68, 0.68, 1.04, 10]} />
        <meshStandardMaterial color="#8a5a20" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.06, 0]}>
        <cylinderGeometry args={[0.78, 0.78, 0.09, 10]} />
        <meshStandardMaterial color="#5a3010" roughness={0.4} metalness={0.05} />
      </mesh>
    </group>
  )
}

function BeachRestaurant() {
  return (
    <group position={[-17, 0, -18]}>
      {/* Deck floor */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 7.5]} />
        <meshStandardMaterial color="#c8aa7a" roughness={0.72} />
      </mesh>
      {/* Deck border */}
      <mesh position={[0, 0.07, 3.75]}>
        <boxGeometry args={[10.2, 0.1, 0.14]} />
        <meshStandardMaterial color="#a08050" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.07, -3.75]}>
        <boxGeometry args={[10.2, 0.1, 0.14]} />
        <meshStandardMaterial color="#a08050" roughness={0.7} />
      </mesh>

      {/* 6 roof support posts */}
      {([[-4, -3], [0, -3], [4, -3], [-4, 3], [0, 3], [4, 3]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 1.7, z]} castShadow>
          <cylinderGeometry args={[0.1, 0.13, 3.4, 8]} />
          <meshStandardMaterial color="#7a5218" roughness={0.82} />
        </mesh>
      ))}
      {/* Thatch roof — two overlapping layers for thickness */}
      <mesh position={[0, 3.4, 0]} castShadow>
        <boxGeometry args={[10.6, 0.18, 8.0]} />
        <meshStandardMaterial color="#b88c48" roughness={0.9} />
      </mesh>
      {/* Thatch texture strips */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[0, 3.5, -3.0 + i * 1.0]}>
          <boxGeometry args={[10.4, 0.12, 0.16]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#a07838' : '#b88c48'} roughness={0.92} />
        </mesh>
      ))}
      {/* Roof fringe front */}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[-4.5 + i * 0.72, 3.3, 4.1]}>
          <boxGeometry args={[0.14, 0.28, 0.09]} />
          <meshStandardMaterial color="#9a7030" roughness={0.92} />
        </mesh>
      ))}
      {/* Roof fringe back */}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[-4.5 + i * 0.72, 3.3, -4.1]}>
          <boxGeometry args={[0.14, 0.28, 0.09]} />
          <meshStandardMaterial color="#9a7030" roughness={0.92} />
        </mesh>
      ))}

      {/* Bar counter along back wall */}
      <mesh position={[0, 0.57, -3.0]} castShadow>
        <boxGeometry args={[8.5, 1.14, 0.75]} />
        <meshStandardMaterial color="#7a4818" roughness={0.65} />
      </mesh>
      <mesh position={[0, 1.18, -3.0]}>
        <boxGeometry args={[8.8, 0.1, 0.98]} />
        <meshStandardMaterial color="#2a1808" roughness={0.25} metalness={0.1} />
      </mesh>

      {/* Restaurant tables */}
      {([[-3, 0.5], [0, 0.5], [3, 0.5], [-1.5, -1.5], [1.5, -1.5]] as [number, number][]).map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.72, 0]}>
            <cylinderGeometry args={[0.52, 0.52, 0.07, 10]} />
            <meshStandardMaterial color="#d4caa0" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.37, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.74, 6]} />
            <meshStandardMaterial color="#a08060" roughness={0.75} />
          </mesh>
          {/* Chairs */}
          {([[0.75, 0], [-0.75, 0], [0, 0.75], [0, -0.75]] as [number, number][]).map(([cx, cz], ci) => (
            <group key={ci} position={[cx, 0, cz]} rotation={[0, Math.atan2(-cx, -cz), 0]}>
              <mesh position={[0, 0.38, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.06, 8]} />
                <meshStandardMaterial color="#e8dcc8" roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.22, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.44, 6]} />
                <meshStandardMaterial color="#aaa090" roughness={0.7} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Guests */}
      <mesh position={[-3, 0.88, 0.5]} castShadow>
        <capsuleGeometry args={[0.13, 0.3, 4, 8]} />
        <meshStandardMaterial color="#5a6aaa" roughness={0.7} />
      </mesh>
      <mesh position={[-3, 1.35, 0.5]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#c8a07a" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.88, 0.5]} castShadow>
        <capsuleGeometry args={[0.13, 0.3, 4, 8]} />
        <meshStandardMaterial color="#aa5a5a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.35, 0.5]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#d4a08a" roughness={0.65} />
      </mesh>

      {/* Restaurant sign */}
      <mesh position={[0, 3.58, -3.02]}>
        <boxGeometry args={[4.5, 0.55, 0.1]} />
        <meshStandardMaterial color="#d4a017" metalness={0.5} roughness={0.4} />
      </mesh>
      <pointLight position={[0, 2.8, -2]} intensity={5} distance={10} color="#ffcc88" decay={2} />
    </group>
  )
}

function BoundaryWalls() {
  const stucco = '#f5efe0'
  const cap    = '#d4c8a0'
  const wH = 2.6
  const wT = 0.4
  const mid = -7  // center of z range: -48 to 35 → center at -6.5
  const len = 84
  return (
    <>
      {/* East wall */}
      <mesh position={[31.5, wH / 2, mid]} castShadow receiveShadow>
        <boxGeometry args={[wT, wH, len]} />
        <meshStandardMaterial color={stucco} roughness={0.78} />
      </mesh>
      <mesh position={[31.5, wH, mid]}>
        <boxGeometry args={[wT + 0.14, 0.14, len]} />
        <meshStandardMaterial color={cap} roughness={0.55} />
      </mesh>
      {/* West wall */}
      <mesh position={[-31.5, wH / 2, mid]} castShadow receiveShadow>
        <boxGeometry args={[wT, wH, len]} />
        <meshStandardMaterial color={stucco} roughness={0.78} />
      </mesh>
      <mesh position={[-31.5, wH, mid]}>
        <boxGeometry args={[wT + 0.14, 0.14, len]} />
        <meshStandardMaterial color={cap} roughness={0.55} />
      </mesh>
      {/* North wall (behind street/parking) */}
      <mesh position={[0, wH / 2, 35.5]} castShadow receiveShadow>
        <boxGeometry args={[63.4, wH, wT]} />
        <meshStandardMaterial color={stucco} roughness={0.78} />
      </mesh>
      <mesh position={[0, wH, 35.5]}>
        <boxGeometry args={[63.8, 0.14, wT + 0.14]} />
        <meshStandardMaterial color={cap} roughness={0.55} />
      </mesh>
    </>
  )
}

function BackgroundCustomer({ position, color, rotation = 0 }: {
  position: [number, number, number]; color: string; rotation?: number
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.56, 0]}>
        <capsuleGeometry args={[0.15, 0.66, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.19, 10, 10]} />
        <meshStandardMaterial color="#c8a07a" roughness={0.65} />
      </mesh>
    </group>
  )
}

const BLOB_OFFSETS: [number, number, number, number][] = [
  [0, 0, 0, 1], [2.3, 0.4, 0, 0.82], [-2.0, 0.3, 0, 0.75],
  [1.1, 1.2, 0.5, 0.68], [-0.9, 0.9, -0.4, 0.62], [3.2, 0.0, 0.3, 0.58],
]

const CLOUD_DATA = [
  { x0: -70, y: 32, z: -72,  speed: 0.9,  scale: 5.0 },
  { x0:  30, y: 44, z: -96,  speed: 0.55, scale: 7.5 },
  { x0: -10, y: 28, z: -62,  speed: 1.15, scale: 4.2 },
  { x0:  65, y: 38, z: -84,  speed: 0.7,  scale: 6.0 },
  { x0: -50, y: 52, z: -118, speed: 0.38, scale: 9.0 },
  { x0:  15, y: 24, z: -55,  speed: 1.4,  scale: 3.8 },
]

function Clouds() {
  const grpRefs  = useRef<(THREE.Group | null)[]>([])
  const matRefs  = useRef<(THREE.MeshStandardMaterial | null)[][]>(CLOUD_DATA.map(() => []))

  useFrame(({ clock }) => {
    const t = (clock.elapsedTime / 300) % 1
    let night = 0
    if      (t >= 0.42 && t < 0.52) night = (t - 0.42) / 0.10
    else if (t >= 0.52 && t < 0.78) night = 1.0
    else if (t >= 0.78 && t < 0.90) night = 1 - (t - 0.78) / 0.12
    const opacity = Math.max(0, 1 - night * 2.0) * 0.62

    CLOUD_DATA.forEach(({ x0, speed }, i) => {
      const grp = grpRefs.current[i]
      if (grp) grp.position.x = ((x0 + clock.elapsedTime * speed + 220) % 440) - 220
      matRefs.current[i].forEach(m => { if (m) m.opacity = opacity })
    })
  })

  return (
    <>
      {CLOUD_DATA.map(({ x0, y, z, scale }, ci) => (
        <group key={ci} ref={el => { grpRefs.current[ci] = el }} position={[x0, y, z]}>
          {BLOB_OFFSETS.map(([bx, by, bz, br], bi) => (
            <mesh key={bi} position={[bx * scale, by * scale, bz * scale]}>
              <sphereGeometry args={[br * scale, 7, 5]} />
              <meshStandardMaterial
                ref={el => { matRefs.current[ci][bi] = el }}
                color="#ffffff" transparent opacity={0.62}
                roughness={1} fog={false} depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      ))}
    </>
  )
}

// ── GLB Athlete NPC — static mesh + procedural idle ──────────────────────────
function AthleteNPC({ position, rotation = 0, phase = 0 }: {
  position: [number, number, number]; rotation?: number; phase?: number
}) {
  const { scene } = useGLTF('/athlete_in_black_and_red_activewear.glb')
  const groupRef   = useRef<THREE.Group>(null)
  const cloned     = useRef(scene.clone(true))

  // Model bounding box: Y min=-0.95 max=0.95 → lift by 0.95 so feet sit on ground
  const BASE_Y = position[1] + 0.95

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime + phase
    groupRef.current.scale.y    = 1 + Math.sin(t * 1.6) * 0.012
    groupRef.current.rotation.z = Math.sin(t * 0.9 + 1.1) * 0.018
    groupRef.current.position.y = BASE_Y + Math.abs(Math.sin(t * 1.6)) * 0.03
  })

  return (
    <group ref={groupRef} position={[position[0], BASE_Y, position[2]]} rotation={[0, rotation, 0]}>
      <primitive object={cloned.current} />
    </group>
  )
}

export function BeachClub() {
  return (
    <>
      <Ground />
      <Ocean />
      <WaveAnimation />
      <ShoreFoam />
      <Clouds />
      <Pool />
      <Bar />
      <DJBooth />
      <BeachRestaurant />
      <BoundaryWalls />
      {/* Pool-side thatch kiosks — semi-transparent roof */}
      <ThatchKiosk position={[-11, 0, -8]} />
      <ThatchKiosk position={[11, 0, -12]} />

      {/* Club guests */}
      <BackgroundCustomer position={[14.5, 0, -6]}  color="#3a5a8a" rotation={Math.PI} />
      <BackgroundCustomer position={[14.5, 0, -4]}  color="#8a3a5a" rotation={Math.PI} />
      <BackgroundCustomer position={[14.5, 0, -2]}  color="#5a8a3a" rotation={Math.PI} />
      <BackgroundCustomer position={[-3,   0, -5]}  color="#6a4a2a" rotation={0.3} />
      <BackgroundCustomer position={[3,    0, -5]}  color="#2a4a6a" rotation={-0.3} />
      <BackgroundCustomer position={[-2,   0, -12]} color="#8a6a2a" rotation={0.8} />
      <BackgroundCustomer position={[2,    0, -12]} color="#4a2a8a" rotation={-0.5} />
      {/* Dancing crowd on the dance floor */}
      <DanceFloor />
      <DanceSparkles />
      <DancingFigure position={[-3,   0, -17.5]} bodyColor="#e91e8c" headColor="#d4a07a" phase={0.0} />
      <DancingFigure position={[ 0,   0, -17.5]} bodyColor="#2196f3" headColor="#f0c27f" phase={0.7} />
      <DancingFigure position={[ 3,   0, -17.5]} bodyColor="#ff5722" headColor="#c8a07a" phase={1.4} />
      <DancingFigure position={[-2,   0, -19.8]} bodyColor="#9c27b0" headColor="#d4a07a" phase={2.1} />
      <DancingFigure position={[ 2,   0, -19.8]} bodyColor="#4caf50" headColor="#c0885a" phase={2.8} />
      <DancingFigure position={[ 0,   0, -21.8]} bodyColor="#ff9800" headColor="#e8b88a" phase={3.5} />
      <BackgroundCustomer position={[-6,   0, -28]} color="#3a7a4a" rotation={1.2} />
      <BackgroundCustomer position={[6,    0, -28]} color="#7a3a4a" rotation={-0.7} />

      {/* Club-perimeter palms */}
      <PalmTree position={[-14, 0, -16]} lean={-1} seed={0} />
      <PalmTree position={[14,  0, -16]} lean={1}  seed={1} />
      <PalmTree position={[-16, 0,  0]}  lean={0}  seed={2} />
      <PalmTree position={[16,  0,  0]}  lean={1}  seed={3} />
      <PalmTree position={[-12, 0,  10]} lean={0}  seed={4} />
      <PalmTree position={[12,  0,  10]} lean={-1} seed={5} />
      <PalmTree position={[0,   0, -22]} lean={0}  seed={6} />
      <PalmTree position={[-6,  0,  12]} lean={0.5} seed={7} />
      <PalmTree position={[6,   0,  12]} lean={-0.5} seed={8} />

      {/* Beach palms */}
      <PalmTree position={[-20, 0, -28]} lean={-2}  seed={9}  />
      <PalmTree position={[-12, 0, -32]} lean={1}   seed={10} />
      <PalmTree position={[0,   0, -38]} lean={0.5} seed={11} />
      <PalmTree position={[12,  0, -32]} lean={-1}  seed={12} />
      <PalmTree position={[20,  0, -28]} lean={2}   seed={13} />
      <PalmTree position={[-24, 0, -36]} lean={-1.5} seed={14} />
      <PalmTree position={[24,  0, -36]} lean={1.5} seed={15} />
      <PalmTree position={[-8,  0, -42]} lean={0.8} seed={16} />
      <PalmTree position={[8,   0, -42]} lean={-0.8} seed={17} />

      {/* Pool-side sunbeds */}
      <Sunbed position={[-8,  0, -6]}  rotation={Math.PI / 2} />
      <Sunbed position={[-8,  0, -9]}  rotation={Math.PI / 2} />
      <Sunbed position={[-8,  0, -12]} rotation={Math.PI / 2} />
      <Sunbed position={[8,   0, -6]}  rotation={Math.PI / 2} />
      <Sunbed position={[8,   0, -9]}  rotation={Math.PI / 2} />
      <Sunbed position={[8,   0, -12]} rotation={Math.PI / 2} />
      <Sunbed position={[-4,  0,  2]} />
      <Sunbed position={[4,   0,  2]} />

      {/* Beach sunbeds */}
      <Sunbed position={[-13, 0, -27]} rotation={0.15} />
      <Sunbed position={[-9.5, 0, -28.5]} rotation={-0.1} />
      <Sunbed position={[-6,  0, -30]} rotation={0.2} />
      <Sunbed position={[6,   0, -30]} rotation={-0.2} />
      <Sunbed position={[9.5, 0, -28.5]} rotation={0.1} />
      <Sunbed position={[13,  0, -27]} rotation={-0.15} />
      <Sunbed position={[-4,  0, -35]} rotation={0.3} />
      <Sunbed position={[4,   0, -35]} rotation={-0.3} />

      {/* Pool umbrellas */}
      <Umbrella position={[-8,  0, -7]}   color="#e74c3c" />
      <Umbrella position={[8,   0, -10.5]} color="#2980b9" />
      <Umbrella position={[-8,  0, -13]}  color="#f39c12" />
      <Umbrella position={[8,   0, -5]}   color="#8e44ad" />
      <Umbrella position={[-4,  0,  2]}   color="#c0392b" />
      <Umbrella position={[4,   0,  2]}   color="#16a085" />

      {/* Beach umbrellas */}
      <Umbrella position={[-12, 0, -27.5]} color="#ff7f50" />
      <Umbrella position={[-5,  0, -30]}   color="#40e0d0" />
      <Umbrella position={[5,   0, -30]}   color="#ffd700" />
      <Umbrella position={[12,  0, -27.5]} color="#ff69b4" />
      <Umbrella position={[-3,  0, -35]}   color="#7ec8e3" />
      <Umbrella position={[3,   0, -35]}   color="#ff9966" />

      {/* Tiki torches — 4 only (performance) */}
      <TikiTorch position={[-7, 0, -17]} />
      <TikiTorch position={[7,  0, -17]} />
      <TikiTorch position={[-7, 0,  -4]} />
      <TikiTorch position={[7,  0,  -4]} />

      {/* GLB Athletes — pool area and beach */}
      <AthleteNPC position={[6,   0, -8]}  rotation={-0.8} phase={0.0} />
      <AthleteNPC position={[-10, 0, -30]} rotation={0.4}  phase={1.3} />
      <AthleteNPC position={[10,  0, -30]} rotation={2.8}  phase={2.6} />
    </>
  )
}

useGLTF.preload('/athlete_in_black_and_red_activewear.glb')
