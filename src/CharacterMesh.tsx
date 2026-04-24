import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type * as THREE from 'three'

interface Props {
  bodyColor: string
  headColor: string
  hairColor?: string
  pantsColor?: string
  movingRef?: React.RefObject<boolean>
  talkingRef?: React.RefObject<boolean>
}

export function CharacterMesh({
  bodyColor,
  headColor,
  hairColor  = '#2a1208',
  pantsColor = '#1e2a3a',
  movingRef,
  talkingRef,
}: Props) {
  const leftLegRef  = useRef<THREE.Group>(null)
  const rightLegRef = useRef<THREE.Group>(null)
  const leftArmRef  = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const headGrpRef  = useRef<THREE.Group>(null)

  const walkT   = useRef(Math.random() * Math.PI * 2)
  const breathT = useRef(Math.random() * Math.PI * 2)
  const talkT   = useRef(0)

  useFrame((_, delta) => {
    const moving  = movingRef?.current  ?? false
    const talking = talkingRef?.current ?? false

    if (moving)  walkT.current  += delta * 9.0
    breathT.current += delta * 1.1
    if (talking) talkT.current  += delta * 3.5

    const swing    = moving ? Math.sin(walkT.current) * 0.52 : 0
    const headBobY = moving ? Math.abs(Math.sin(walkT.current)) * 0.022 : 0
    const breathY  = Math.sin(breathT.current) * 0.008
    const lerp     = 0.20

    if (leftLegRef.current)  leftLegRef.current.rotation.x  += ( swing - leftLegRef.current.rotation.x)  * lerp
    if (rightLegRef.current) rightLegRef.current.rotation.x += (-swing - rightLegRef.current.rotation.x) * lerp
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x += (-swing * 0.44 - leftArmRef.current.rotation.x) * lerp
      leftArmRef.current.rotation.z  =  0.30
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x += ( swing * 0.44 - rightArmRef.current.rotation.x) * lerp
      rightArmRef.current.rotation.z  = -0.30
    }
    if (headGrpRef.current) {
      const targetY = 1.08 + headBobY + breathY
      headGrpRef.current.position.y += (targetY - headGrpRef.current.position.y) * 0.14
      const talkNod = talking ? Math.sin(talkT.current) * 0.055 : 0
      headGrpRef.current.rotation.x += (talkNod - headGrpRef.current.rotation.x) * 0.14
    }
  })

  // ── Sims proportions: 5-head-tall, big round head, compact body ──────────
  // Total height ~1.65:  feet=0, hip=0.60, shoulder=1.02, head-center=1.30, top=1.62

  return (
    <>
      {/* ── LEGS — short and chunky, hip pivot at y=0.60 ── */}
      <group ref={leftLegRef} position={[-0.105, 0.60, 0]}>
        {/* Upper leg */}
        <mesh position={[0, -0.130, 0]} castShadow>
          <capsuleGeometry args={[0.095, 0.180, 6, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.28} />
        </mesh>
        {/* Lower leg */}
        <mesh position={[0, -0.400, 0]}>
          <capsuleGeometry args={[0.080, 0.200, 6, 12]} />
          <meshStandardMaterial color={headColor} roughness={0.26} />
        </mesh>
        {/* Shoe — round capsule */}
        <mesh position={[0, -0.590, 0.042]} rotation={[Math.PI / 2 - 0.22, 0, 0]}>
          <capsuleGeometry args={[0.072, 0.160, 6, 12]} />
          <meshStandardMaterial color="#111111" roughness={0.30} />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.105, 0.60, 0]}>
        <mesh position={[0, -0.130, 0]} castShadow>
          <capsuleGeometry args={[0.095, 0.180, 6, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.28} />
        </mesh>
        <mesh position={[0, -0.400, 0]}>
          <capsuleGeometry args={[0.080, 0.200, 6, 12]} />
          <meshStandardMaterial color={headColor} roughness={0.26} />
        </mesh>
        <mesh position={[0, -0.590, 0.042]} rotation={[Math.PI / 2 - 0.22, 0, 0]}>
          <capsuleGeometry args={[0.072, 0.160, 6, 12]} />
          <meshStandardMaterial color="#111111" roughness={0.30} />
        </mesh>
      </group>

      {/* ── TORSO — short and wide, Sims style ── */}
      <mesh position={[0, 0.82, 0]} castShadow>
        <capsuleGeometry args={[0.220, 0.360, 8, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.28} />
      </mesh>

      {/* ── ARMS — pivot at shoulder y=1.00 ── */}
      <group ref={leftArmRef} position={[-0.305, 1.00, 0]}>
        <mesh position={[0, -0.095, 0]}>
          <capsuleGeometry args={[0.068, 0.150, 6, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.28} />
        </mesh>
        <mesh position={[0, -0.295, 0]}>
          <capsuleGeometry args={[0.055, 0.170, 6, 12]} />
          <meshStandardMaterial color={headColor} roughness={0.26} />
        </mesh>
        {/* Round hand */}
        <mesh position={[0, -0.440, 0]}>
          <sphereGeometry args={[0.060, 12, 10]} />
          <meshStandardMaterial color={headColor} roughness={0.26} />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.305, 1.00, 0]}>
        <mesh position={[0, -0.095, 0]}>
          <capsuleGeometry args={[0.068, 0.150, 6, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.28} />
        </mesh>
        <mesh position={[0, -0.295, 0]}>
          <capsuleGeometry args={[0.055, 0.170, 6, 12]} />
          <meshStandardMaterial color={headColor} roughness={0.26} />
        </mesh>
        <mesh position={[0, -0.440, 0]}>
          <sphereGeometry args={[0.060, 12, 10]} />
          <meshStandardMaterial color={headColor} roughness={0.26} />
        </mesh>
      </group>

      {/* ── NECK ── */}
      <mesh position={[0, 1.065, 0]}>
        <cylinderGeometry args={[0.068, 0.088, 0.120, 12]} />
        <meshStandardMaterial color={headColor} roughness={0.26} />
      </mesh>

      {/* ── HEAD — BIG round Sims head, animated ── */}
      <group ref={headGrpRef} position={[0, 1.08, 0]}>

        {/* Main face sphere — big and round */}
        <mesh castShadow>
          <sphereGeometry args={[0.310, 24, 18]} />
          <meshStandardMaterial color={headColor} roughness={0.22} />
        </mesh>

        {/* Hair dome — full coverage */}
        <mesh position={[0, 0.130, -0.014]}>
          <sphereGeometry args={[0.298, 20, 14]} />
          <meshStandardMaterial color={hairColor} roughness={0.35} />
        </mesh>
        {/* Fringe / front hair */}
        <mesh position={[0, 0.060, 0.140]} scale={[1.10, 0.68, 0.80]}>
          <sphereGeometry args={[0.265, 14, 10]} />
          <meshStandardMaterial color={hairColor} roughness={0.38} />
        </mesh>
        {/* Side hair left */}
        <mesh position={[-0.245, -0.040, 0.020]} scale={[0.55, 0.90, 0.70]}>
          <sphereGeometry args={[0.240, 10, 8]} />
          <meshStandardMaterial color={hairColor} roughness={0.38} />
        </mesh>
        {/* Side hair right */}
        <mesh position={[0.245, -0.040, 0.020]} scale={[0.55, 0.90, 0.70]}>
          <sphereGeometry args={[0.240, 10, 8]} />
          <meshStandardMaterial color={hairColor} roughness={0.38} />
        </mesh>

        {/* ── Eyes — large, Sims-style ── */}
        {/* Whites */}
        <mesh position={[-0.100, 0.062, 0.248]}>
          <sphereGeometry args={[0.066, 12, 10]} />
          <meshStandardMaterial color="#f8f8f8" roughness={0.15} />
        </mesh>
        <mesh position={[ 0.100, 0.062, 0.248]}>
          <sphereGeometry args={[0.066, 12, 10]} />
          <meshStandardMaterial color="#f8f8f8" roughness={0.15} />
        </mesh>
        {/* Iris — coloured */}
        <mesh position={[-0.100, 0.060, 0.264]}>
          <sphereGeometry args={[0.050, 12, 10]} />
          <meshStandardMaterial color="#2a7aaa" roughness={0.20} />
        </mesh>
        <mesh position={[ 0.100, 0.060, 0.264]}>
          <sphereGeometry args={[0.050, 12, 10]} />
          <meshStandardMaterial color="#2a7aaa" roughness={0.20} />
        </mesh>
        {/* Pupils */}
        <mesh position={[-0.100, 0.059, 0.270]}>
          <sphereGeometry args={[0.032, 10, 8]} />
          <meshStandardMaterial color="#060608" roughness={0.10} />
        </mesh>
        <mesh position={[ 0.100, 0.059, 0.270]}>
          <sphereGeometry args={[0.032, 10, 8]} />
          <meshStandardMaterial color="#060608" roughness={0.10} />
        </mesh>
        {/* Eye shine */}
        <mesh position={[-0.090, 0.074, 0.278]}>
          <sphereGeometry args={[0.010, 6, 5]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.0} roughness={0.0} />
        </mesh>
        <mesh position={[ 0.090, 0.074, 0.278]}>
          <sphereGeometry args={[0.010, 6, 5]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={1.0} roughness={0.0} />
        </mesh>

        {/* Eyebrows */}
        <mesh position={[-0.100, 0.148, 0.256]} rotation={[0, 0, 0.12]}>
          <capsuleGeometry args={[0.012, 0.068, 4, 8]} />
          <meshStandardMaterial color={hairColor} roughness={0.40} />
        </mesh>
        <mesh position={[ 0.100, 0.148, 0.256]} rotation={[0, 0, -0.12]}>
          <capsuleGeometry args={[0.012, 0.068, 4, 8]} />
          <meshStandardMaterial color={hairColor} roughness={0.40} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.028, 0.272]}>
          <sphereGeometry args={[0.030, 8, 6]} />
          <meshStandardMaterial color={headColor} roughness={0.22} />
        </mesh>

        {/* Cheek blush */}
        <mesh position={[-0.168, -0.008, 0.240]} scale={[1.4, 0.8, 0.4]}>
          <sphereGeometry args={[0.040, 8, 6]} />
          <meshStandardMaterial color="#ffaaaa" roughness={0.9} transparent opacity={0.28} />
        </mesh>
        <mesh position={[ 0.168, -0.008, 0.240]} scale={[1.4, 0.8, 0.4]}>
          <sphereGeometry args={[0.040, 8, 6]} />
          <meshStandardMaterial color="#ffaaaa" roughness={0.9} transparent opacity={0.28} />
        </mesh>

      </group>
    </>
  )
}
