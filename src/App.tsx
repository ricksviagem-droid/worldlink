import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import * as THREE from 'three'
import { BeachClub } from './BeachClub'
import { ChatPanel } from './ChatPanel'
import { NPCS, TALK_DISTANCE, type NpcDef } from './npcData'

const socket = io()

type PlayerState = { x: number; z: number }
type PlayersMap = Record<string, PlayerState>

// ─── Camera ─────────────────────────────────────────────────────────────────
function CameraRig({ target }: { target: PlayerState }) {
  const { camera } = useThree()
  const t = useRef(target)
  t.current = target
  useFrame(() => {
    camera.position.x += (t.current.x - camera.position.x) * 0.07
    camera.position.y = 14
    camera.position.z += (t.current.z + 12 - camera.position.z) * 0.07
    camera.lookAt(t.current.x, 0, t.current.z - 1)
  })
  return null
}

// ─── Players ─────────────────────────────────────────────────────────────────
function LocalPlayer({ position }: { position: PlayerState }) {
  return (
    <group position={[position.x, 0, position.z]}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.55, 1.1, 0.35]} />
        <meshStandardMaterial color="#f39c12" />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#f5cba7" />
      </mesh>
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
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.55, 1.1, 0.35]} />
        <meshStandardMaterial color="#3498db" />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color="#f5cba7" />
      </mesh>
    </group>
  )
}

// ─── NPC ─────────────────────────────────────────────────────────────────────
function NPCCharacter({ npc, nearby }: { npc: NpcDef; nearby: boolean }) {
  return (
    <group position={npc.position}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[0.55, 1.1, 0.35]} />
        <meshStandardMaterial color={npc.bodyColor} />
      </mesh>
      <mesh position={[0, 1.55, 0]} castShadow>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial color={npc.headColor} />
      </mesh>
      <Html position={[0, 2.2, 0]} center distanceFactor={12}>
        <div style={{
          background: nearby ? 'rgba(243,156,18,0.9)' : 'rgba(0,0,0,0.65)',
          color: nearby ? '#111' : '#fff',
          padding: '3px 11px',
          borderRadius: 20,
          fontSize: 12,
          fontFamily: '-apple-system, sans-serif',
          fontWeight: 600,
          whiteSpace: 'nowrap',
          backdropFilter: 'blur(6px)',
          transition: 'all 0.2s',
          boxShadow: nearby ? '0 2px 12px rgba(243,156,18,0.5)' : 'none',
        }}>
          {npc.name}
          {nearby && (
            <div style={{ fontSize: 10, fontWeight: 400, textAlign: 'center', marginTop: 1 }}>
              Press E to talk
            </div>
          )}
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

  // Proximity detection
  useEffect(() => {
    const nearby = NPCS.find(npc => {
      const dx = position.x - npc.position[0]
      const dz = position.z - npc.position[2]
      return Math.sqrt(dx * dx + dz * dz) < TALK_DISTANCE
    }) ?? null
    setNearbyNpc(nearby)
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

      if ((e.key === 'e' || e.key === 'E') && nearbyNpc) {
        setActiveChatNpc(nearbyNpc)
        chatOpenRef.current = true
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
        backdropFilter: 'blur(4px)',
        pointerEvents: 'none',
      }}>
        WASD / ↑↓←→ move &nbsp;·&nbsp; E talk
      </div>

      {/* Chat panel */}
      {activeChatNpc && <ChatPanel npc={activeChatNpc} onClose={closeChat} />}

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

        <CameraRig target={position} />
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
