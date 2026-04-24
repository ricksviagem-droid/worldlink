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

const socket = io()
const isMobile = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)

type PlayerState = { x: number; z: number }
type PlayersMap = Record<string, PlayerState>
type CamMode = 'iso' | 'top' | 'close' | 'wide'

const CAM: Record<CamMode, { y: number; dz: number; speed: number }> = {
  iso:   { y: 14, dz: 12, speed: 0.07 },
  top:   { y: 24, dz: 2,  speed: 0.06 },
  close: { y: 6,  dz: 5,  speed: 0.10 },
  wide:  { y: 20, dz: 20, speed: 0.05 },
}
const CAM_KEYS: CamMode[] = ['iso', 'top', 'close', 'wide']

// ─── Camera ─────────────────────────────────────────────────────────────────
function CameraRig({ target, mode }: { target: PlayerState; mode: CamMode }) {
  const { camera } = useThree()
  const t = useRef(target); t.current = target
  const m = useRef(mode); m.current = mode
  useFrame(() => {
    const cfg = CAM[m.current]
    camera.position.x += (t.current.x - camera.position.x) * cfg.speed
    camera.position.y += (cfg.y - camera.position.y) * cfg.speed
    camera.position.z += (t.current.z + cfg.dz - camera.position.z) * cfg.speed
    camera.lookAt(t.current.x, 0, t.current.z - 1)
  })
  return null
}

// ─── Character shape (capsule body + sphere head) ────────────────────────────
function CharacterMesh({ bodyColor, headColor }: { bodyColor: string; headColor: string }) {
  return (
    <>
      {/* Legs */}
      <mesh position={[-0.13, 0.22, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.3, 6, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.13, 0.22, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.3, 6, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 0.85, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.5, 8, 12]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.3, 0.82, 0]} rotation={[0, 0, 0.4]} castShadow>
        <capsuleGeometry args={[0.07, 0.4, 6, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.3, 0.82, 0]} rotation={[0, 0, -0.4]} castShadow>
        <capsuleGeometry args={[0.07, 0.4, 6, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.42, 0]} castShadow>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshStandardMaterial color={headColor} roughness={0.6} />
      </mesh>
    </>
  )
}

// ─── Players ─────────────────────────────────────────────────────────────────
function LocalPlayer({ position }: { position: PlayerState }) {
  return (
    <group position={[position.x, 0, position.z]}>
      <CharacterMesh bodyColor="#e67e22" headColor="#f0c27f" />
    </group>
  )
}

function RemotePlayer({ targetPosition }: { targetPosition: PlayerState }) {
  const groupRef = useRef<THREE.Group>(null)
  const lp = useRef({ x: targetPosition.x, z: targetPosition.z })
  useFrame(() => {
    if (!groupRef.current) return
    lp.current.x += (targetPosition.x - lp.current.x) * 0.15
    lp.current.z += (targetPosition.z - lp.current.z) * 0.15
    groupRef.current.position.x = lp.current.x
    groupRef.current.position.z = lp.current.z
  })
  return (
    <group ref={groupRef} position={[targetPosition.x, 0, targetPosition.z]}>
      <CharacterMesh bodyColor="#2980b9" headColor="#f0c27f" />
    </group>
  )
}

// ─── NPC ─────────────────────────────────────────────────────────────────────
function NPCCharacter({ npc, nearby }: { npc: NpcDef; nearby: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const pos = useRef({ x: npc.position[0], z: npc.position[2] })
  const target = useRef({ x: npc.position[0], z: npc.position[2] })
  const timer = useRef(Math.random() * 3)
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
    // Face direction of movement
    const dx = target.current.x - pos.current.x
    const dz = target.current.z - pos.current.z
    if (Math.abs(dx) + Math.abs(dz) > 0.005) {
      groupRef.current.rotation.y = Math.atan2(dx, dz)
    }
    // Gentle idle bob
    groupRef.current.position.y = Math.sin(Date.now() * 0.0015 + npc.position[0]) * 0.04
  })

  return (
    <group ref={groupRef} position={npc.position}>
      <CharacterMesh bodyColor={npc.bodyColor} headColor={npc.headColor} />
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
  const [position, setPosition] = useState<PlayerState>({ x: 0, z: 0 })
  const [players, setPlayers] = useState<PlayersMap>({})
  const [nearbyNpc, setNearbyNpc] = useState<NpcDef | null>(null)
  const [activeChatNpc, setActiveChatNpc] = useState<NpcDef | null>(null)
  const [camMode, setCamMode] = useState<CamMode>('iso')
  const chatOpenRef = useRef(false)

  // Socket
  useEffect(() => {
    const onConnect = () => { myId.current = socket.id || '' }
    const onCurrentPlayers = (data: PlayersMap) => setPlayers(data)
    const onNewPlayer = ({ id, player }: { id: string; player: PlayerState }) =>
      setPlayers(prev => ({ ...prev, [id]: player }))
    const onUpdatePlayers = (data: PlayersMap) => setPlayers(data)
    const onPlayerLeft = (id: string) =>
      setPlayers(prev => { const n = { ...prev }; delete n[id]; return n })

    socket.on('connect', onConnect)
    socket.on('currentPlayers', onCurrentPlayers)
    socket.on('newPlayer', onNewPlayer)
    socket.on('updatePlayers', onUpdatePlayers)
    socket.on('playerLeft', onPlayerLeft)
    return () => {
      socket.off('connect', onConnect)
      socket.off('currentPlayers', onCurrentPlayers)
      socket.off('newPlayer', onNewPlayer)
      socket.off('updatePlayers', onUpdatePlayers)
      socket.off('playerLeft', onPlayerLeft)
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
  }, [position])

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

      if ((e.key === 'e' || e.key === 'E') && nearbyNpc) {
        setActiveChatNpc(nearbyNpc)
        chatOpenRef.current = true
        audio.playOpen()
        return
      }

      setPosition(prev => {
        if (e.key === 'w' || e.key === 'ArrowUp')    return { ...prev, z: prev.z - 0.6 }
        if (e.key === 's' || e.key === 'ArrowDown')  return { ...prev, z: prev.z + 0.6 }
        if (e.key === 'a' || e.key === 'ArrowLeft')  return { ...prev, x: prev.x - 0.6 }
        if (e.key === 'd' || e.key === 'ArrowRight') return { ...prev, x: prev.x + 0.6 }
        return prev
      })
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [nearbyNpc])

  useEffect(() => { socket.emit('move', position) }, [position])

  const closeChat = () => {
    setActiveChatNpc(null)
    chatOpenRef.current = false
    audio.playClose()
  }

  const handleMobileMove = (x: number, z: number) => {
    if (chatOpenRef.current) return
    setPosition(prev => ({ x: prev.x + x, z: prev.z + z }))
  }

  const handleMobileTalk = () => {
    if (nearbyNpc && !chatOpenRef.current) {
      setActiveChatNpc(nearbyNpc)
      chatOpenRef.current = true
      audio.playOpen()
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#87ceeb' }}>
      {/* HUD */}
      <div style={{
        position: 'absolute', top: 16, right: 16, zIndex: 10,
        background: 'rgba(0,0,0,0.45)', color: 'white',
        padding: '6px 16px', borderRadius: 20,
        fontFamily: 'sans-serif', fontSize: 14,
        backdropFilter: 'blur(6px)',
      }}>
        {Object.keys(players).length} online
      </div>

      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, background: 'rgba(0,0,0,0.35)', color: 'rgba(255,255,255,0.6)',
        padding: '5px 18px', borderRadius: 20,
        fontFamily: 'sans-serif', fontSize: 12,
        backdropFilter: 'blur(4px)', pointerEvents: 'none',
      }}>
        WASD move &nbsp;·&nbsp; E talk &nbsp;·&nbsp; C camera
      </div>

      {/* Camera mode selector */}
      <div style={{
        position: 'absolute', top: 16, left: 16, zIndex: 10,
        display: 'flex', gap: 6,
      }}>
        {CAM_KEYS.map(m => (
          <button key={m} onClick={() => setCamMode(m)} style={{
            padding: '5px 12px', borderRadius: 16, border: 'none',
            background: camMode === m ? 'rgba(243,156,18,0.85)' : 'rgba(0,0,0,0.45)',
            color: camMode === m ? '#111' : 'rgba(255,255,255,0.6)',
            fontFamily: 'sans-serif', fontSize: 12, fontWeight: camMode === m ? 700 : 400,
            cursor: 'pointer', backdropFilter: 'blur(6px)',
          }}>{m}</button>
        ))}
      </div>

      {/* Chat panel */}
      {activeChatNpc && <ChatPanel npc={activeChatNpc} onClose={closeChat} />}

      {/* Mobile controls */}
      {isMobile && (
        <MobileControls onMove={handleMobileMove} onTalk={handleMobileTalk} nearNpc={!!nearbyNpc} />
      )}

      <Canvas shadows camera={{ position: [0, 14, 12], fov: 50 }}>
        <color attach="background" args={['#87ceeb']} />
        <fog attach="fog" args={['#87ceeb', 40, 90]} />
        <ambientLight intensity={0.7} color="#fff4e0" />
        <directionalLight
          position={[10, 20, 10]} intensity={1.8} color="#fff8e7" castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={80} shadow-camera-left={-30}
          shadow-camera-right={30} shadow-camera-top={30} shadow-camera-bottom={-30}
        />
        <directionalLight position={[-8, 10, -5]} intensity={0.3} color="#c8e6ff" />

        <CameraRig target={position} mode={camMode} />
        <BeachClub />

        {NPCS.map(npc => (
          <NPCCharacter key={npc.id} npc={npc} nearby={nearbyNpc?.id === npc.id} />
        ))}

        <LocalPlayer position={position} />
        {Object.entries(players).map(([id, player]) => {
          if (id === myId.current) return null
          return <RemotePlayer key={id} targetPosition={player} />
        })}
      </Canvas>
    </div>
  )
}
