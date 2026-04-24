import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

const PICKUP = new THREE.Vector3(-5, 0, 20)
const DROPOFF = new THREE.Vector3(-5, 0, 8)
const SPEED = 3.5  // units per second

type Phase = 'to_club' | 'waiting_club' | 'to_reception' | 'waiting_reception'

function BuggyBody() {
  return (
    <>
      {/* Main body */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[2.3, 0.6, 1.25]} />
        <meshStandardMaterial color="#f48fb1" roughness={0.35} metalness={0.15} />
      </mesh>
      {/* Front hood */}
      <mesh position={[0.95, 0.58, 0]} castShadow>
        <boxGeometry args={[0.42, 0.28, 1.18]} />
        <meshStandardMaterial color="#f48fb1" roughness={0.35} metalness={0.15} />
      </mesh>
      {/* Roof canopy */}
      <mesh position={[-0.15, 1.08, 0]} castShadow>
        <boxGeometry args={[1.7, 0.07, 1.22]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      {/* Roof supports */}
      {([[-0.9, 0.6], [0.6, 0.6]] as [number, number][]).map(([x, z_off], i) => (
        <group key={i}>
          <mesh position={[x, 0.84, 0.58]} castShadow>
            <boxGeometry args={[0.06, 0.56, 0.06]} />
            <meshStandardMaterial color="#f8bbd0" />
          </mesh>
          <mesh position={[x, 0.84, -0.58]} castShadow>
            <boxGeometry args={[0.06, 0.56, 0.06]} />
            <meshStandardMaterial color="#f8bbd0" />
          </mesh>
        </group>
      ))}
      {/* Windshield */}
      <mesh position={[0.62, 0.82, 0]} rotation={[0, 0, -0.32]}>
        <boxGeometry args={[0.05, 0.44, 1.12]} />
        <meshStandardMaterial color="#b3e5fc" transparent opacity={0.55} />
      </mesh>
      {/* Seats front */}
      <mesh position={[0.25, 0.76, 0.32]}>
        <boxGeometry args={[0.5, 0.1, 0.42]} />
        <meshStandardMaterial color="#fce4ec" roughness={0.7} />
      </mesh>
      <mesh position={[0.25, 0.76, -0.32]}>
        <boxGeometry args={[0.5, 0.1, 0.42]} />
        <meshStandardMaterial color="#fce4ec" roughness={0.7} />
      </mesh>
      {/* Seats back */}
      <mesh position={[-0.55, 0.76, 0.32]}>
        <boxGeometry args={[0.5, 0.1, 0.42]} />
        <meshStandardMaterial color="#fce4ec" roughness={0.7} />
      </mesh>
      <mesh position={[-0.55, 0.76, -0.32]}>
        <boxGeometry args={[0.5, 0.1, 0.42]} />
        <meshStandardMaterial color="#fce4ec" roughness={0.7} />
      </mesh>
      {/* Wheels */}
      {([
        [0.85, 0.22, 0.7],
        [-0.85, 0.22, 0.7],
        [0.85, 0.22, -0.7],
        [-0.85, 0.22, -0.7],
      ] as [number, number, number][]).map((p, i) => (
        <group key={i}>
          <mesh position={p} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.22, 0.22, 0.16, 16]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          <mesh position={p} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.12, 0.12, 0.18, 10]} />
            <meshStandardMaterial color="#888" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
      ))}
      {/* Bumper front */}
      <mesh position={[1.22, 0.3, 0]}>
        <boxGeometry args={[0.06, 0.2, 1.3]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Bumper back */}
      <mesh position={[-1.22, 0.3, 0]}>
        <boxGeometry args={[0.06, 0.2, 1.3]} />
        <meshStandardMaterial color="#e0e0e0" metalness={0.7} roughness={0.2} />
      </mesh>
      {/* Headlights */}
      <mesh position={[1.17, 0.48, 0.42]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff88" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[1.17, 0.48, -0.42]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ffffcc" emissive="#ffff88" emissiveIntensity={0.5} />
      </mesh>

      {/* Valentina passenger (back-right seat) */}
      <mesh position={[-0.55, 1.02, -0.32]} castShadow>
        <capsuleGeometry args={[0.12, 0.28, 6, 8]} />
        <meshStandardMaterial color="#f4a0c0" roughness={0.7} />
      </mesh>
      <mesh position={[-0.55, 1.38, -0.32]} castShadow>
        <sphereGeometry args={[0.16, 12, 12]} />
        <meshStandardMaterial color="#d88060" roughness={0.6} />
      </mesh>
    </>
  )
}

export function ValentinaBuggy() {
  const groupRef = useRef<THREE.Group>(null)
  const posRef = useRef(PICKUP.clone())
  const phase = useRef<Phase>('to_club')
  const waitTimer = useRef(0)

  useFrame((_, delta) => {
    if (!groupRef.current) return

    if (phase.current === 'to_club' || phase.current === 'to_reception') {
      const target = phase.current === 'to_club' ? DROPOFF : PICKUP
      const dir = new THREE.Vector3().subVectors(target, posRef.current)
      const dist = dir.length()

      if (dist < 0.15) {
        posRef.current.copy(target)
        phase.current = phase.current === 'to_club' ? 'waiting_club' : 'waiting_reception'
        waitTimer.current = 0
      } else {
        const step = Math.min(dist, delta * SPEED)
        posRef.current.addScaledVector(dir.normalize(), step)
        groupRef.current.rotation.y = Math.atan2(dir.x, dir.z)
      }
    } else {
      waitTimer.current += delta
      const waitTime = phase.current === 'waiting_club' ? 5 : 4
      if (waitTimer.current > waitTime) {
        phase.current = phase.current === 'waiting_club' ? 'to_reception' : 'to_club'
      }
    }

    groupRef.current.position.copy(posRef.current)
  })

  return (
    <group ref={groupRef} position={[-5, 0, 20]}>
      <BuggyBody />
    </group>
  )
}
