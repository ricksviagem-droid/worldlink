import { Canvas } from '@react-three/fiber'
import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'

const socket = io('http://localhost:3002')

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

function RemotePlayer({ position }: { position: PlayerState }) {
  return (
    <mesh position={[position.x, 0.5, position.z]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="deepskyblue" />
    </mesh>
  )
}

export default function App() {
  const [myId, setMyId] = useState('')
  const [position, setPosition] = useState<PlayerState>({ x: 0, z: 0 })
  const [players, setPlayers] = useState<PlayersMap>({})

  // identifica seu socket
  useEffect(() => {
    const onConnect = () => {
      setMyId(socket.id || '')
      console.log('connected:', socket.id)
    }

    socket.on('connect', onConnect)

    return () => {
      socket.off('connect', onConnect)
    }
  }, [])

  // recebe lista inicial e updates
  useEffect(() => {
    const onCurrentPlayers = (data: PlayersMap) => {
      console.log('currentPlayers', data)
      setPlayers(data)
    }

    const onUpdatePlayers = (data: PlayersMap) => {
      console.log('updatePlayers', data)
      setPlayers(data)
    }

    socket.on('currentPlayers', onCurrentPlayers)
    socket.on('updatePlayers', onUpdatePlayers)

    return () => {
      socket.off('currentPlayers', onCurrentPlayers)
      socket.off('updatePlayers', onUpdatePlayers)
    }
  }, [])

  // movimentação local
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      setPosition((prev) => {
        if (e.key === 'w') return { ...prev, z: prev.z - 0.5 }
        if (e.key === 's') return { ...prev, z: prev.z + 0.5 }
        if (e.key === 'a') return { ...prev, x: prev.x - 0.5 }
        if (e.key === 'd') return { ...prev, x: prev.x + 0.5 }
        if (e.key === 'ArrowUp') return { ...prev, z: prev.z - 0.5 }
        if (e.key === 'ArrowDown') return { ...prev, z: prev.z + 0.5 }
        if (e.key === 'ArrowLeft') return { ...prev, x: prev.x - 0.5 }
        if (e.key === 'ArrowRight') return { ...prev, x: prev.x + 0.5 }
        return prev
      })
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // envia sua posição para o servidor sempre que mudar
  useEffect(() => {
    socket.emit('move', position)
  }, [position])

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas camera={{ position: [0, 8, 8], fov: 50 }}>
        <ambientLight intensity={1.2} />
        <directionalLight position={[5, 10, 5]} intensity={1.5} />

        {/* chão */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#ddd" />
        </mesh>

        {/* você */}
        <LocalPlayer position={position} />

        {/* outros players */}
        {Object.entries(players).map(([id, player]) => {
          if (id === myId) return null

          return <RemotePlayer key={id} position={player} />
        })}
      </Canvas>
    </div>
  )
}
