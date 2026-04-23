import * as THREE from 'three'

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
      {([-3, -1, 1, 3] as number[]).map((z, i) => (
        <mesh key={i} position={[-0.9, 0.3, z]}>
          <cylinderGeometry args={[0.18, 0.22, 0.6, 12]} />
          <meshStandardMaterial color="#aaaaaa" />
        </mesh>
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
          rotation={[-0.45 + (i % 2) * 0.1, (angle * Math.PI) / 180, 0.1]}
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
      {([[-0.32, 0.1, 0.75], [0.32, 0.1, 0.75], [-0.32, 0.1, -0.75], [0.32, 0.1, -0.75]] as [number, number, number][]).map((p, i) => (
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
            emissive={(['#1a0a4a', '#0a1a4a', '#1a0a4a'] as string[])[i]}
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

function BackgroundCustomer({ position, color, rotation = 0 }: {
  position: [number, number, number]
  color: string
  rotation?: number
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[0.45, 0.9, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.25, 0]}>
        <sphereGeometry args={[0.22, 12, 12]} />
        <meshStandardMaterial color="#c8a07a" />
      </mesh>
    </group>
  )
}

export function BeachClub() {
  return (
    <>
      <Ground />
      <Pool />
      <Bar />
      <DJBooth />

      {/* Background customers — visual life */}
      <BackgroundCustomer position={[14.5, 0, -6]} color="#3a5a8a" rotation={Math.PI} />
      <BackgroundCustomer position={[14.5, 0, -4]} color="#8a3a5a" rotation={Math.PI} />
      <BackgroundCustomer position={[14.5, 0, -2]} color="#5a8a3a" rotation={Math.PI} />
      <BackgroundCustomer position={[-3, 0, -5]} color="#6a4a2a" rotation={0.3} />
      <BackgroundCustomer position={[3, 0, -5]} color="#2a4a6a" rotation={-0.3} />
      <BackgroundCustomer position={[-2, 0, -10]} color="#8a6a2a" rotation={0.8} />
      <BackgroundCustomer position={[2, 0, -10]} color="#4a2a8a" rotation={-0.5} />

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
