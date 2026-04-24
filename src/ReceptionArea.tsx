import * as THREE from 'three'

function WelcomeArch() {
  return (
    <group position={[0, 0, 17]}>
      {/* Left column */}
      <mesh position={[-4, 1.8, 0]} castShadow>
        <boxGeometry args={[0.5, 3.6, 0.5]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.6} />
      </mesh>
      {/* Right column */}
      <mesh position={[4, 1.8, 0]} castShadow>
        <boxGeometry args={[0.5, 3.6, 0.5]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.6} />
      </mesh>
      {/* Arch beam */}
      <mesh position={[0, 3.8, 0]} castShadow>
        <boxGeometry args={[8.5, 0.45, 0.45]} />
        <meshStandardMaterial color="#f5f0e8" roughness={0.6} />
      </mesh>
      {/* Gold trim on beam */}
      <mesh position={[0, 4.08, 0]}>
        <boxGeometry args={[8.6, 0.1, 0.5]} />
        <meshStandardMaterial color="#d4a017" roughness={0.3} metalness={0.6} />
      </mesh>
      {/* Column base caps */}
      <mesh position={[-4, 0.05, 0]}>
        <boxGeometry args={[0.75, 0.1, 0.75]} />
        <meshStandardMaterial color="#d4a017" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[4, 0.05, 0]}>
        <boxGeometry args={[0.75, 0.1, 0.75]} />
        <meshStandardMaterial color="#d4a017" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Column top caps */}
      <mesh position={[-4, 3.65, 0]}>
        <boxGeometry args={[0.75, 0.12, 0.75]} />
        <meshStandardMaterial color="#d4a017" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[4, 3.65, 0]}>
        <boxGeometry args={[0.75, 0.12, 0.75]} />
        <meshStandardMaterial color="#d4a017" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  )
}

function ReceptionBuilding() {
  return (
    <group position={[0, 0, 23]}>
      {/* Main building */}
      <mesh position={[0, 1.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[12, 3, 5]} />
        <meshStandardMaterial color="#fef9f0" roughness={0.7} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 3.25, 0]} castShadow>
        <boxGeometry args={[12.6, 0.3, 5.6]} />
        <meshStandardMaterial color="#c8a05a" roughness={0.6} />
      </mesh>
      {/* Roof overhang front */}
      <mesh position={[0, 3.1, -2.8]}>
        <boxGeometry args={[12.6, 0.15, 0.8]} />
        <meshStandardMaterial color="#b89048" roughness={0.5} />
      </mesh>
      {/* Reception desk */}
      <mesh position={[0, 1.0, -1.8]} castShadow>
        <boxGeometry args={[5, 1.0, 0.7]} />
        <meshStandardMaterial color="#8b5a2b" roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.55, -1.8]}>
        <boxGeometry args={[5.3, 0.12, 0.9]} />
        <meshStandardMaterial color="#5a3010" roughness={0.4} />
      </mesh>
      {/* Door opening */}
      <mesh position={[0, 1.1, -2.51]}>
        <boxGeometry args={[1.6, 2.2, 0.1]} />
        <meshStandardMaterial color="#2c2010" roughness={0.8} />
      </mesh>
      {/* Windows */}
      {([-4, -2.5, 2.5, 4] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 1.6, -2.51]}>
          <boxGeometry args={[1.4, 1.0, 0.08]} />
          <meshStandardMaterial color="#b3d9f5" transparent opacity={0.7} />
        </mesh>
      ))}
      {/* Sign above door */}
      <mesh position={[0, 3.0, -2.51]}>
        <boxGeometry args={[4, 0.55, 0.1]} />
        <meshStandardMaterial color="#d4a017" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  )
}

function RedCarpet() {
  return (
    <mesh position={[0, 0.01, 13]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[3.5, 10]} />
      <meshStandardMaterial color="#c0392b" roughness={0.8} />
    </mesh>
  )
}

function SidePath() {
  // Road for the buggy on the left side
  return (
    <mesh position={[-5, 0.01, 13]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[2.5, 26]} />
      <meshStandardMaterial color="#d4c9a8" roughness={0.9} />
    </mesh>
  )
}

function ReceptionPalm({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 5, 8]} />
        <meshStandardMaterial color="#9b7a2e" />
      </mesh>
      {[0, 60, 120, 180, 240, 300].map((angle, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((angle * Math.PI) / 180) * 1.6,
            5.0,
            Math.sin((angle * Math.PI) / 180) * 1.6,
          ]}
          rotation={[-0.5, (angle * Math.PI) / 180, 0.1]}
          castShadow
        >
          <boxGeometry args={[0.15, 0.05, 3.0]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#2d7a2f' : '#3a9e3c'} />
        </mesh>
      ))}
    </group>
  )
}

function FlowerPot({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.22, 0.18, 0.5, 10]} />
        <meshStandardMaterial color="#c87941" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.28, 8, 8]} />
        <meshStandardMaterial color="#e74c3c" roughness={0.6} />
      </mesh>
    </group>
  )
}

export function ReceptionArea() {
  return (
    <>
      <WelcomeArch />
      <ReceptionBuilding />
      <RedCarpet />
      <SidePath />

      <ReceptionPalm x={-6} z={17} />
      <ReceptionPalm x={6} z={17} />
      <ReceptionPalm x={-8} z={22} />
      <ReceptionPalm x={8} z={22} />

      <FlowerPot position={[-4.5, 0, 16.5]} />
      <FlowerPot position={[4.5, 0, 16.5]} />
      <FlowerPot position={[-4.5, 0, 17.5]} />
      <FlowerPot position={[4.5, 0, 17.5]} />

      {/* Decorative stones along path */}
      {([14.5, 13, 11.5, 10] as number[]).map((z, i) => (
        <group key={i}>
          <mesh position={[-2.2, 0.06, z]}>
            <sphereGeometry args={[0.2, 6, 6]} />
            <meshStandardMaterial color="#aaa090" roughness={0.9} />
          </mesh>
          <mesh position={[2.2, 0.06, z]}>
            <sphereGeometry args={[0.2, 6, 6]} />
            <meshStandardMaterial color="#aaa090" roughness={0.9} />
          </mesh>
        </group>
      ))}
    </>
  )
}
