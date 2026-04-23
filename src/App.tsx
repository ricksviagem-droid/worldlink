import { Canvas, useFrame } from '@react-three/fiber'
import { useEffect, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import * as THREE from 'three'

const socket = io()

type PlayerState = {
  x: number
  z: number
}

type PlayersMap = Record<string, PlayerState>

function LocalPlayer({ position }: { position: PlayerState }) {
  return (
    <mesh position={[position.x, 0.5, position.z]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

function RemotePlayer({ targetPosition }: { targetPosition: PlayerState }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const lerpPos = useRef({ x: targetPosition.x, z: targetPosition.z })

  useFrame(() => {
    if (!meshRef.current) return
    lerpPos.current.x += (targetPosition.x - lerpPos.current.x) * 0.15
    lerpPos.current.z += (targetPosition.z - lerpPos.current.z) * 0.15
    meshRef.current.position.x = lerpPos.current.x
    meshRef.current.position.z = lerpPos.current.z
  })

  return (
    <mesh ref={meshRef} position={[targetPosition.x, 0.5, targetPosition.z]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="deepskyblue" />
    </mesh>
  )
}

export default function App() {
  const myId = useRef('')
  const [position, setPosition] = useState<PlayerState>({ x: 0, z: 0 })
  const [players, setPlayers] = useState<PlayersMap>({})

  useEffect(() => {
    const onConnect = () => {
      myId.current = socket.id || ''
    }

    const onCurrentPlayers = (data: PlayersMap) => {
      setPlayers(data)
    }

    const onNewPlayer = ({ id, player }: { id: string; player: PlayerState }) => {
      setPlayers((prev) => ({ ...prev, [id]: player }))
    }

    const onUpdatePlayers = (data: PlayersMap) => {
      setPlayers(data)
    }

    const onPlayerLeft = (id: string) => {
      setPlayers((prev) => {
        const next = { ...prev }
        delete next[id]
        return next
      })
    }

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
      setPosition((prev) => {
        if (e.key === 'w' || e.key === 'ArrowUp') return { ...prev, z: prev.z - 0.5 }
        if (e.key === 's' || e.key === 'ArrowDown') return { ...prev, z: prev.z + 0.5 }
        if (e.key === 'a' || e.key === 'ArrowLeft') return { ...prev, x: prev.x - 0.5 }
        if (e.key === 'd' || e.key === 'ArrowRight') return { ...prev, x: prev.x + 0.5 }
        return prev
      })
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  useEffect(() => {
    socket.emit('move', position)
  }, [position])

  const totalOnline = Object.keys(players).length

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 10,
          background: 'rgba(0,0,0,0.45)',
          color: 'white',
          padding: '6px 16px',
          borderRadius: 20,
          fontFamily: 'sans-serif',
          fontSize: 14,
          backdropFilter: 'blur(6px)',
        }}
      >
        {totalOnline} online
      </div>

      <Canvas camera={{ position: [0, 8, 8], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />

        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#ddd" />
        </mesh>

        <LocalPlayer position={position} />

        {Object.entries(players).map(([id, player]) => {
          if (id === myId.current) return null
          return <RemotePlayer key={id} targetPosition={player} />
        })}
      </Canvas>
    </div>
  )
}
