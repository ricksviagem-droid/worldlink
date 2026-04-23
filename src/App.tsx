import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import * as THREE from 'three'

const socket = io()

type PlayerState = { x: number; z: number }
type PlayersMap = Record<string, PlayerState>

// ─── Camera ────────────────────────────────────────────────────────────────
function CameraRig({ target }: { target: PlayerState }) {
  const { camera } = useThree()
  const t = useRef(target)
  t.current = target

  useFrame(() => {
    const tx = t.current.x
    const tz = t.current.z
    camera.position.x += (tx - camera.position.x) * 0.07
    camera.position.y = 14
    camera.position.z += (tz + 12 - camera.position.z) * 0.07
    camera.lookAt(tx, 0, tz - 1)
  })
  return null
}

// ─── Players ────────────────────────────────────────────────────────────────
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
  const lerpPos = useRef({ x: targetPosition.x, z: targetPosition.z })

  useFrame(() => {
    if (!groupRef.current) return
    lerpPos.current.x += (targetPosition.x - lerpPos.current.x) * 0.15
    lerpPos.current.z += (targetPosition.z - lerpPos.current.z) * 0.15
    groupRef.current.position.x = lerpPos.current.x
    groupRef.current.position.z = lerpPos.current.z
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

// ─── Environment ────────────────────────────────────────────────────────────
function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[80, 80]} />
      <meshStandardMaterial color="#e8d08a" />
    </mesh>
  )
}

function Pool() {
  return (
    <group>
      <mesh position={[0, 0.02, -8]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 11]} />
        <meshStandardMaterial color="#c8b89a" />
      </mesh>
      <mesh position={[0, 0.06, -8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 7]} />
        <meshStandardMaterial color="#2bbcd4" transparent opacity={0.88} />
      </mesh>
      <mesh position={[0, 0.18, -8]}>
        <boxGeometry args={[10.5, 0.25, 7.5]} />
        <meshStandardMaterial color="#b0a090" />
      </mesh>
    </group>
  )
}

function Bar() {
  return (
    <group position={[16, 0, -4]}>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.2, 1.1, 10]} />
        <meshStandardMaterial color="#7b4a1e" />
      </mesh>
      <mesh position={[0, 1.15, 0]} castShadow>
        <boxGeometry args={[1.5, 0.12, 10.3]} />
        <meshStandardMaterial color="#4a2c0a" />
      </mesh>
      <mesh position={[0.7, 1.6, 0]} castShadow>
        <boxGeometry args={[0.25, 1.1, 9.5]} />
        <meshStandardMaterial color="#7b4a1e" />
      </mesh>
      {[-3, -1, 1, 3].map((z, i) => (
        <group key={i} position={[-0.9, 0.3, z]}>
          <mesh>
            <cylinderGeometry args={[0.18, 0.22, 0.6, 12]} />
            <meshStandardMaterial color="#c0c0c0" />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function PalmTree({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.18, 0.28, 5, 8]} />
        <meshStandardMaterial color="#9b7a2e" />
      </mesh>
      {[0, 51, 103, 154, 206, 257, 309].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((angle * Math.PI) / 180) * 1.8,
            5.2 - i * 0.05,
            Math.sin((angle * Math.PI) / 180) * 1.8,
          ]}
          rotation={[
            -0.45 + (i % 2) * 0.1,
            (angle * Math.PI) / 180,
            0.1,
          ]}
          castShadow
        >
          <boxGeometry args={[0.18, 0.06, 3.5]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#2d7a2f' : '#3a9e3c'} />
        </mesh>
      ))}
    </group>
  )
}

function Sunbed({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.22, 0]} castShadow>
        <boxGeometry args={[0.75, 0.1, 2.1]} />
        <meshStandardMaterial color="#f0ead0" />
      </mesh>
      <mesh position={[0, 0.32, 0.88]}>
        <boxGeometry args={[0.65, 0.12, 0.4]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {([ [-0.32, 0.1, 0.75], [0.32, 0.1, 0.75], [-0.32, 0.1, -0.75], [0.32, 0.1, -0.75] ] as [number,number,number][]).map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.06, 0.22, 0.06]} />
          <meshStandardMaterial color="#c8bfa8" />
        </mesh>
      ))}
    </group>
  )
}

function Umbrella({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.6, 0]} castShadow>
        <cylinderGeometry args={[0.04, 0.04, 3.2, 8]} />
        <meshStandardMaterial color="#aaaaaa" />
      </mesh>
      <mesh position={[0, 3.1, 0]} castShadow>
        <coneGeometry args={[2.1, 0.9, 16]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

function DJBooth() {
  return (
    <group position={[0, 0, -20]}>
      <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
        <boxGeometry args={[7, 1.1, 2.2]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <mesh position={[0, 1.18, -0.4]} castShadow>
        <boxGeometry args={[6.2, 0.28, 1.5]} />
        <meshStandardMaterial color="#0d0d1a" />
      </mesh>
      {([-2, 0, 2] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 1.7, -0.7]}>
          <boxGeometry args={[1.4, 0.75, 0.08]} />
          <meshStandardMaterial
            color="#0a0a2a"
            emissive={['#1a0a4a', '#0a1a4a', '#1a0a4a'][i]}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 3]} />
        <meshStandardMaterial color="#111122" />
      </mesh>
    </group>
  )
}

function BeachClub() {
  return (
    <>
      <Ground />
      <Pool />
      <Bar />
      <DJBooth />

      <PalmTree position={[-14, 0, -15]} />
      <PalmTree position={[14, 0, -15]} />
      <PalmTree position={[-16, 0, 0]} />
      <PalmTree position={[16, 0, 0]} />
      <PalmTree position={[-12, 0, 10]} />
      <PalmTree position={[12, 0, 10]} />
      <PalmTree position={[0, 0, -22]} />
      <PalmTree position={[-6, 0, 12]} />
      <PalmTree position={[6, 0, 12]} />

      <Sunbed position={[-8, 0, -5]} rotation={Math.PI / 2} />
      <Sunbed position={[-8, 0, -8]} rotation={Math.PI / 2} />
      <Sunbed position={[-8, 0, -11]} rotation={Math.PI / 2} />
      <Sunbed position={[8, 0, -5]} rotation={Math.PI / 2} />
      <Sunbed position={[8, 0, -8]} rotation={Math.PI / 2} />
      <Sunbed position={[8, 0, -11]} rotation={Math.PI / 2} />
      <Sunbed position={[-4, 0, 2]} />
      <Sunbed position={[4, 0, 2]} />

      <Umbrella position={[-8, 0, -6.5]} color="#e74c3c" />
      <Umbrella position={[8, 0, -9.5]} color="#3498db" />
      <Umbrella position={[-8, 0, -12]} color="#f39c12" />
      <Umbrella position={[8, 0, -4]} color="#9b59b6" />
      <Umbrella position={[-4, 0, 2]} color="#e74c3c" />
      <Umbrella position={[4, 0, 2]} color="#1abc9c" />
    </>
  )
}

// ─── App ────────────────────────────────────────────────────────────────────
export default function App() {
  const myId = useRef('')
  const [position, setPosition] = useState<PlayerState>({ x: 0, z: 0 })
  const [players, setPlayers] = useState<PlayersMap>({})

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

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
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
  }, [])

  useEffect(() => { socket.emit('move', position) }, [position])

  const totalOnline = Object.keys(players).length

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', background: '#87ceeb' }}>
      <div style={{
        position: 'absolute', top: 16, right: 16, zIndex: 10,
        background: 'rgba(0,0,0,0.45)', color: 'white',
        padding: '6px 16px', borderRadius: 20,
        fontFamily: 'sans-serif', fontSize: 14,
        backdropFilter: 'blur(6px)',
      }}>
        {totalOnline} online
      </div>

      <div style={{
        position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, background: 'rgba(0,0,0,0.35)', color: 'rgba(255,255,255,0.7)',
        padding: '5px 18px', borderRadius: 20,
        fontFamily: 'sans-serif', fontSize: 12,
        backdropFilter: 'blur(4px)',
      }}>
        WASD / ↑↓←→ to move
      </div>

      <Canvas shadows camera={{ position: [0, 14, 12], fov: 50 }}>
        <color attach="background" args={['#87ceeb']} />
        <fog attach="fog" args={['#87ceeb', 40, 90]} />

        <ambientLight intensity={0.7} color="#fff4e0" />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.8}
          color="#fff8e7"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-far={80}
          shadow-camera-left={-30}
          shadow-camera-right={30}
          shadow-camera-top={30}
          shadow-camera-bottom={-30}
        />
        <directionalLight position={[-8, 10, -5]} intensity={0.3} color="#c8e6ff" />

        <CameraRig target={position} />
        <BeachClub />
        <LocalPlayer position={position} />

        {Object.entries(players).map(([id, player]) => {
          if (id === myId.current) return null
          return <RemotePlayer key={id} targetPosition={player} />
        })}
      </Canvas>
    </div>
  )
}
