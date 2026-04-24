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
import { ProfileCard } from './ProfileCard'
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
function CameraRig({ target, mode, facingRef, zoomRef, camYawRef }: {
  target: PlayerState
  mode: CamMode
  facingRef: React.RefObject<number>
  zoomRef: React.RefObject<number>
  camYawRef: React.RefObject<number>
}) {
  const { camera } = useThree()
  const cam = camera as THREE.PerspectiveCamera
  const t = useRef(target); t.current = target
  const m = useRef(mode); m.current = mode
  // Smoothed player position — eliminates camera shake on discrete key steps
  const smooth = useRef({ x: target.x, z: target.z })

  useFrame(() => {
    const zoom = zoomRef.current ?? 1.0

    // Double-smooth the target so camera never jerks on discrete moves
    smooth.current.x += (t.current.x - smooth.current.x) * 0.10
    smooth.current.z += (t.current.z - smooth.current.z) * 0.10

    if (m.current === 'pov') {
      const angle = facingRef.current ?? 0
      camera.position.x += (t.current.x - camera.position.x) * 0.22
      camera.position.y += (1.5  - camera.position.y) * 0.22
      camera.position.z += (t.current.z - camera.position.z) * 0.22
      camera.lookAt(
        t.current.x + Math.sin(angle) * 8,
        1.4,
        t.current.z - Math.cos(angle) * 8,
      )
      cam.fov += (80 / zoom - cam.fov) * 0.12
      cam.updateProjectionMatrix()
      return
    }

    const cfg = CAM[m.current as Exclude<CamMode,'pov'>]
    const yaw = camYawRef.current ?? 0
    const tx = smooth.current.x
    const tz = smooth.current.z
    const idealX = tx + Math.sin(yaw) * cfg.dz
    const idealZ = tz + Math.cos(yaw) * cfg.dz
    camera.position.x += (idealX - camera.position.x) * cfg.speed
    camera.position.y += (cfg.y   - camera.position.y) * cfg.speed
    camera.position.z += (idealZ  - camera.position.z) * cfg.speed
    camera.lookAt(tx, 0, tz)
    cam.fov += (50 / zoom - cam.fov) * 0.10
    cam.updateProjectionMatrix()
  })
  return null
}

// ─── Disco lights ────────────────────────────────────────────────────────────
function DJLights() {
  const refs = [
    useRef<THREE.PointLight>(null),
    useRef<THREE.PointLight>(null),
    useRef<THREE.PointLight>(null),
  ]
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    refs.forEach((r, i) => {
      if (!r.current) return
      const angle = t * 0.65 + (i * Math.PI * 2) / 3
      r.current.position.x = Math.cos(angle) * 5
      r.current.position.z = -19 + Math.sin(angle * 1.3) * 1.5
      r.current.color.setHSL((t * 0.07 + i * 0.33) % 1, 1, 0.55)
    })
  })
  return (
    <>
      {refs.map((r, i) => (
        <pointLight key={i} ref={r} position={[0, 5, -19]} intensity={12} distance={20} decay={2} />
      ))}
    </>
  )
}

// ─── Players ─────────────────────────────────────────────────────────────────
function LocalPlayer({ position, bodyColor, headColor, hairColor, pantsColor }: {
  position: PlayerState; bodyColor: string; headColor: string; hairColor?: string; pantsColor?: string
}) {
  const movingRef = useRef(false)
  const prevPos = useRef(position)
  const stopTimer = useRef<ReturnType<typeof setTimeout>>()

  if (position.x !== prevPos.current.x || position.z !== prevPos.current.z) {
    movingRef.current = true
    prevPos.current = position
    clearTimeout(stopTimer.current)
    stopTimer.current = setTimeout(() => { movingRef.current = false }, 180)
  }

  return (
    <group position={[position.x, 0, position.z]}>
      <CharacterMesh bodyColor={bodyColor} headColor={headColor} hairColor={hairColor} pantsColor={pantsColor} movingRef={movingRef} />
    </group>
  )
}

function RemotePlayer({ targetPosition, bodyColor, headColor, hairColor, pantsColor, name }: {
  targetPosition: PlayerState; bodyColor: string; headColor: string; hairColor?: string; pantsColor?: string; name?: string
}) {
  const groupRef = useRef<THREE.Group>(null)
  const lp = useRef({ x: targetPosition.x, z: targetPosition.z })
  const movingRef = useRef(false)
  useFrame(() => {
    if (!groupRef.current) return
    const dx = targetPosition.x - lp.current.x
    const dz = targetPosition.z - lp.current.z
    movingRef.current = Math.abs(dx) + Math.abs(dz) > 0.01
    lp.current.x += dx * 0.15
    lp.current.z += dz * 0.15
    groupRef.current.position.x = lp.current.x
    groupRef.current.position.z = lp.current.z
  })
  return (
    <group ref={groupRef} position={[targetPosition.x, 0, targetPosition.z]}>
      <CharacterMesh bodyColor={bodyColor} headColor={headColor} hairColor={hairColor} pantsColor={pantsColor} movingRef={movingRef} />
      <Html position={[0, 2.4, 0]} center distanceFactor={12}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 5,
          background: 'rgba(10,10,20,0.72)', backdropFilter: 'blur(8px)',
          color: '#fff', padding: '3px 10px', borderRadius: 20, fontSize: 12,
          fontFamily: '-apple-system, sans-serif', fontWeight: 600,
          whiteSpace: 'nowrap', border: '1px solid rgba(76,175,80,0.4)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4caf50', display: 'inline-block', flexShrink: 0, boxShadow: '0 0 5px #4caf50' }} />
          {name ?? 'Player'}
        </div>
      </Html>
    </group>
  )
}

// ─── NPC ─────────────────────────────────────────────────────────────────────
function NPCCharacter({ npc, nearby }: { npc: NpcDef; nearby: boolean }) {
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
      groupRef.current.rotation.y = Math.atan2(dx, dz)
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

// ─── App ─────────────────────────────────────────────────────────────────────
export default function App() {
  const myId = useRef('')
  const facingRef   = useRef(0)         // player facing angle (radians)
  const zoomRef     = useRef(1.0)       // camera zoom level
  const camYawRef   = useRef(0)         // camera orbit angle (right-drag / two-finger swipe)
  const pinchStart  = useRef({ dist: 0, zoom: 1.0 })
  const dragRef     = useRef<{ x: number; yaw: number; type: 'orbit' | 'pov' } | null>(null)
  const [position, setPosition] = useState<PlayerState>({ x: 0, z: 0 })
  const [players, setPlayers] = useState<PlayersMap>({})
  const [nearbyNpc, setNearbyNpc] = useState<NpcDef | null>(null)
  const [activeChatNpc, setActiveChatNpc] = useState<NpcDef | null>(null)
  const [camMode, setCamMode] = useState<CamMode>('iso')
  const chatOpenRef = useRef(false)

  // Profile
  const [myProfile, setMyProfile] = useState<PlayerProfile | null>(() => {
    try { const s = localStorage.getItem(STORAGE_KEY); return s ? JSON.parse(s) : null } catch { return null }
  })
  const [showProfileSetup, setShowProfileSetup] = useState(false)
  const [remoteProfiles, setRemoteProfiles] = useState<Record<string, PlayerProfile>>({})
  const [nearbyPlayerId, setNearbyPlayerId] = useState<string | null>(null)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [matches, setMatches] = useState<Set<string>>(new Set())
  const [showShop, setShowShop] = useState(false)
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
      setNotification('💞 É um Match!')
      setTimeout(() => setNotification(null), 5000)
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
    return () => {
      socket.off('connect', onConnect)
      socket.off('currentPlayers', onCurrentPlayers)
      socket.off('newPlayer', onNewPlayer)
      socket.off('updatePlayers', onUpdatePlayers)
      socket.off('playerLeft', onPlayerLeft)
      socket.off('playerProfile', onPlayerProfile)
      socket.off('existingProfiles', onExistingProfiles)
      socket.off('receiveLike', onReceiveLike)
      socket.off('newMatch', onNewMatch)
    }
  }, [])

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

      if (e.key === 'c' || e.key === 'C') {
        setCamMode(prev => CAM_KEYS[(CAM_KEYS.indexOf(prev) + 1) % CAM_KEYS.length])
        return
      }

      if (e.key === 'e' || e.key === 'E') {
        if (nearbyNpc) {
          setActiveChatNpc(nearbyNpc)
          chatOpenRef.current = true
          audio.playOpen()
        } else if (nearbyCustomerId && customerNeeds[nearbyCustomerId] !== 'happy') {
          handleServeCustomer(nearbyCustomerId)
        }
        return
      }

      setPosition(prev => {
        const step = 0.6
        if (e.key === 'w' || e.key === 'ArrowUp')    { facingRef.current = 0;          const nz = prev.z - step; return canMove(prev.x, nz) ? { ...prev, z: nz } : prev }
        if (e.key === 's' || e.key === 'ArrowDown')  { facingRef.current = Math.PI;    const nz = prev.z + step; return canMove(prev.x, nz) ? { ...prev, z: nz } : prev }
        if (e.key === 'a' || e.key === 'ArrowLeft')  { facingRef.current = -Math.PI/2; const nx = prev.x - step; return canMove(nx, prev.z) ? { ...prev, x: nx } : prev }
        if (e.key === 'd' || e.key === 'ArrowRight') { facingRef.current =  Math.PI/2; const nx = prev.x + step; return canMove(nx, prev.z) ? { ...prev, x: nx } : prev }
        return prev
      })
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
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
    if (chatOpenRef.current) return
    if (Math.abs(dx) + Math.abs(dz) > 0.01) facingRef.current = Math.atan2(dx, -dz)
    setPosition(prev => {
      const nx = prev.x + dx, nz = prev.z + dz
      if (canMove(nx, nz)) return { x: nx, z: nz }
      if (canMove(nx, prev.z)) return { x: nx, z: prev.z }
      if (canMove(prev.x, nz)) return { x: prev.x, z: nz }
      return prev
    })
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
      dragRef.current = { x: e.clientX, yaw: facingRef.current, type: 'pov' }
    }
  }
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current) return
    if (dragRef.current.type === 'orbit') {
      camYawRef.current = dragRef.current.yaw - (e.clientX - dragRef.current.x) * 0.007
    } else {
      facingRef.current = dragRef.current.yaw + (e.clientX - dragRef.current.x) * 0.008
    }
  }
  const handleMouseUp = () => { dragRef.current = null }

  const handleMobileTalk = () => {
    if (nearbyNpc && !chatOpenRef.current) {
      setActiveChatNpc(nearbyNpc)
      chatOpenRef.current = true
      audio.playOpen()
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
      style={{ width: '100vw', height: '100vh', position: 'relative', background: '#f4a460' }}
      onTouchStart={handlePinchStart}
      onTouchMove={handlePinchMove}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onContextMenu={e => e.preventDefault()}
    >
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

      {/* Notification toast */}
      {notification && (
        <div style={{
          position: 'absolute', top: 70, left: '50%', transform: 'translateX(-50%)',
          zIndex: 60, background: 'rgba(6,6,18,0.92)', backdropFilter: 'blur(12px)',
          color: '#fff', padding: '12px 24px', borderRadius: 20,
          fontFamily: '-apple-system, sans-serif', fontSize: 15, fontWeight: 700,
          border: '1.5px solid rgba(243,156,18,0.5)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.2s ease',
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

      {/* Nearby player profile card */}
      {nearbyPlayerId && remoteProfiles[nearbyPlayerId] && (
        <ProfileCard
          profile={remoteProfiles[nearbyPlayerId]}
          myInterests={myProfile?.interests ?? []}
          isLiked={likedIds.has(nearbyPlayerId)}
          isMatch={matches.has(nearbyPlayerId)}
          onLike={() => handleLike(nearbyPlayerId)}
          onSuperLike={() => handleLike(nearbyPlayerId, true)}
          onClose={() => setNearbyPlayerId(null)}
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
          nearNpc={!!nearbyNpc || (!!nearbyCustomerId && customerNeeds[nearbyCustomerId] !== 'happy')}
        />
      )}

      <Canvas shadows camera={{ position: [0, 14, 12], fov: 50 }}>
        <color attach="background" args={['#f4a460']} />
        <fog attach="fog" args={['#f4a460', 45, 95]} />
        <ambientLight intensity={0.55} color="#ffe8c0" />
        <directionalLight
          position={[12, 22, 8]} intensity={2.0} color="#ffcc88" castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={90} shadow-camera-left={-35}
          shadow-camera-right={35} shadow-camera-top={35} shadow-camera-bottom={-35}
        />
        <directionalLight position={[-10, 8, -5]} intensity={0.25} color="#a0c8ff" />
        {/* Pool area — cool aqua fill */}
        <pointLight position={[0, 4, -10]} intensity={6} distance={20} color="#40e0d0" decay={2} />
        {/* Bar — warm amber */}
        <pointLight position={[16, 4, -4]} intensity={5} distance={14} color="#ff9944" decay={2} />
        {/* Reception arch — soft white */}
        <pointLight position={[0, 5, 17]} intensity={4} distance={16} color="#ffe8b0" decay={2} />
        <DJLights />

        <CameraRig target={position} mode={camMode} facingRef={facingRef} zoomRef={zoomRef} camYawRef={camYawRef} />
        <BeachClub />
        <ReceptionArea />
        <ValentinaBuggy />

        {NPCS.map(npc => (
          <NPCCharacter key={npc.id} npc={npc} nearby={nearbyNpc?.id === npc.id} />
        ))}

        <AICustomers
          needs={customerNeeds} nearbyId={nearbyCustomerId}
          missionActive={shiftPhase === 'active'}
          onPatienceOut={handlePatienceOut}
        />
        {camMode !== 'pov' && <LocalPlayer position={position} bodyColor={myOutfit.bodyColor} headColor={myOutfit.headColor} hairColor={myOutfit.hairColor} pantsColor={myOutfit.pantsColor} />}
        {Object.entries(players).map(([id, player]) => {
          if (id === myId.current) return null
          const rProfile = remoteProfiles[id]
          const rOutfit = getOutfit(rProfile?.outfitId ?? 'ocean')
          return <RemotePlayer key={id} targetPosition={player} bodyColor={rOutfit.bodyColor} headColor={rOutfit.headColor} hairColor={rOutfit.hairColor} pantsColor={rOutfit.pantsColor} name={rProfile?.name} />
        })}
      </Canvas>
    </div>
  )
}
