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

    if (moving)  walkT.current  += delta * 8.5
    breathT.current += delta * 1.1
    if (talking) talkT.current  += delta * 3.5

    const swing    = moving ? Math.sin(walkT.current) * 0.48 : 0
    const headBobY = moving ? Math.abs(Math.sin(walkT.current)) * 0.020 : 0
    const breathY  = Math.sin(breathT.current) * 0.007
    const lerp     = 0.18

    if (leftLegRef.current)  leftLegRef.current.rotation.x  += ( swing - leftLegRef.current.rotation.x)  * lerp
    if (rightLegRef.current) rightLegRef.current.rotation.x += (-swing - rightLegRef.current.rotation.x) * lerp
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x += (-swing * 0.40 - leftArmRef.current.rotation.x) * lerp
      leftArmRef.current.rotation.z  =  0.22
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x += ( swing * 0.40 - rightArmRef.current.rotation.x) * lerp
      rightArmRef.current.rotation.z  = -0.22
    }
    if (headGrpRef.current) {
      const targetY = 1.63 + headBobY + breathY
      headGrpRef.current.position.y += (targetY - headGrpRef.current.position.y) * 0.14
      const talkNod = talking ? Math.sin(talkT.current) * 0.040 : 0
      headGrpRef.current.rotation.x += (talkNod - headGrpRef.current.rotation.x) * 0.14
    }
  })

  const shoeTop  = '#1c1c1c'
  const soleclr  = '#f0f0f0'

  return (
    <>
      {/* ── LEGS ── */}
      <group ref={leftLegRef} position={[-0.108, 0.90, 0]}>
        <mesh position={[0, -0.200, 0]} castShadow>
          <capsuleGeometry args={[0.088, 0.265, 6, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.570, 0]}>
          <capsuleGeometry args={[0.074, 0.275, 6, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.750, 0]}>
          <cylinderGeometry args={[0.080, 0.078, 0.038, 10]} />
          <meshStandardMaterial color={pantsColor} roughness={0.58} />
        </mesh>
        <mesh position={[0, -0.852, 0.050]} rotation={[Math.PI / 2 - 0.18, 0, 0]}>
          <capsuleGeometry args={[0.060, 0.162, 6, 10]} />
          <meshStandardMaterial color={shoeTop} roughness={0.58} />
        </mesh>
        <mesh position={[0, -0.890, 0.060]} rotation={[Math.PI / 2 - 0.18, 0, 0]}>
          <boxGeometry args={[0.115, 0.172, 0.020]} />
          <meshStandardMaterial color={soleclr} roughness={0.62} />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.108, 0.90, 0]}>
        <mesh position={[0, -0.200, 0]} castShadow>
          <capsuleGeometry args={[0.088, 0.265, 6, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.570, 0]}>
          <capsuleGeometry args={[0.074, 0.275, 6, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.750, 0]}>
          <cylinderGeometry args={[0.080, 0.078, 0.038, 10]} />
          <meshStandardMaterial color={pantsColor} roughness={0.58} />
        </mesh>
        <mesh position={[0, -0.852, 0.050]} rotation={[Math.PI / 2 - 0.18, 0, 0]}>
          <capsuleGeometry args={[0.060, 0.162, 6, 10]} />
          <meshStandardMaterial color={shoeTop} roughness={0.58} />
        </mesh>
        <mesh position={[0, -0.890, 0.060]} rotation={[Math.PI / 2 - 0.18, 0, 0]}>
          <boxGeometry args={[0.115, 0.172, 0.020]} />
          <meshStandardMaterial color={soleclr} roughness={0.62} />
        </mesh>
      </group>

      {/* ── TORSO ── */}
      {/* Waist / hips — slightly wider */}
      <mesh position={[0, 1.00, 0]}>
        <capsuleGeometry args={[0.175, 0.10, 6, 12]} />
        <meshStandardMaterial color={pantsColor} roughness={0.62} />
      </mesh>
      {/* Belt */}
      <mesh position={[0, 0.975, 0]}>
        <cylinderGeometry args={[0.148, 0.148, 0.045, 14]} />
        <meshStandardMaterial color="#2a1a08" roughness={0.45} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.975, 0.148]}>
        <boxGeometry args={[0.052, 0.036, 0.014]} />
        <meshStandardMaterial color="#c8a840" roughness={0.28} metalness={0.75} />
      </mesh>
      {/* Shirt body */}
      <mesh position={[0, 1.185, 0]} castShadow>
        <capsuleGeometry args={[0.190, 0.420, 8, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.68} />
      </mesh>
      {/* Shirt hem */}
      <mesh position={[0, 0.960, 0]}>
        <cylinderGeometry args={[0.192, 0.188, 0.030, 14]} />
        <meshStandardMaterial color={bodyColor} roughness={0.70} />
      </mesh>
      {/* Front pocket */}
      <mesh position={[0, 1.025, 0.192]} rotation={[-0.05, 0, 0]}>
        <boxGeometry args={[0.195, 0.085, 0.014]} />
        <meshStandardMaterial color={bodyColor} roughness={0.72} />
      </mesh>
      {/* Collar */}
      <mesh position={[0, 1.400, 0.082]}>
        <torusGeometry args={[0.079, 0.017, 6, 14, Math.PI]} />
        <meshStandardMaterial color={bodyColor} roughness={0.62} />
      </mesh>

      {/* ── ARMS ── */}
      <group ref={leftArmRef} position={[-0.283, 1.325, 0]}>
        <mesh position={[0, -0.112, 0]}>
          <capsuleGeometry args={[0.064, 0.182, 6, 10]} />
          <meshStandardMaterial color={bodyColor} roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.225, 0]}>
          <cylinderGeometry args={[0.067, 0.065, 0.026, 10]} />
          <meshStandardMaterial color={bodyColor} roughness={0.60} />
        </mesh>
        <mesh position={[0, -0.362, 0]}>
          <capsuleGeometry args={[0.051, 0.188, 6, 10]} />
          <meshPhysicalMaterial color={headColor} roughness={0.45} clearcoat={0.12} clearcoatRoughness={0.80} />
        </mesh>
        <mesh position={[0, -0.522, 0]}>
          <sphereGeometry args={[0.058, 12, 9]} />
          <meshPhysicalMaterial color={headColor} roughness={0.42} clearcoat={0.10} clearcoatRoughness={0.80} />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.283, 1.325, 0]}>
        <mesh position={[0, -0.112, 0]}>
          <capsuleGeometry args={[0.064, 0.182, 6, 10]} />
          <meshStandardMaterial color={bodyColor} roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.225, 0]}>
          <cylinderGeometry args={[0.067, 0.065, 0.026, 10]} />
          <meshStandardMaterial color={bodyColor} roughness={0.60} />
        </mesh>
        <mesh position={[0, -0.362, 0]}>
          <capsuleGeometry args={[0.051, 0.188, 6, 10]} />
          <meshPhysicalMaterial color={headColor} roughness={0.45} clearcoat={0.12} clearcoatRoughness={0.80} />
        </mesh>
        <mesh position={[0, -0.522, 0]}>
          <sphereGeometry args={[0.058, 12, 9]} />
          <meshPhysicalMaterial color={headColor} roughness={0.42} clearcoat={0.10} clearcoatRoughness={0.80} />
        </mesh>
      </group>

      {/* ── NECK ── */}
      <mesh position={[0, 1.458, 0]}>
        <cylinderGeometry args={[0.065, 0.082, 0.125, 12]} />
        <meshPhysicalMaterial color={headColor} roughness={0.44} clearcoat={0.10} clearcoatRoughness={0.82} />
      </mesh>

      {/* ── HEAD — oval, not spherical ── */}
      <group ref={headGrpRef} position={[0, 1.63, 0]}>

        {/* Cranium — taller oval */}
        <mesh castShadow scale={[0.91, 1.08, 0.88]}>
          <sphereGeometry args={[0.207, 24, 18]} />
          <meshPhysicalMaterial color={headColor} roughness={0.50} clearcoat={0.10} clearcoatRoughness={0.82} />
        </mesh>

        {/* Jaw / cheek width — slightly wider at cheeks */}
        <mesh position={[0, -0.062, 0.025]} scale={[1.06, 0.52, 0.85]}>
          <sphereGeometry args={[0.190, 14, 10]} />
          <meshPhysicalMaterial color={headColor} roughness={0.50} clearcoat={0.08} clearcoatRoughness={0.84} />
        </mesh>

        {/* Chin — pointed oval */}
        <mesh position={[0, -0.178, 0.055]} scale={[0.58, 0.44, 0.62]}>
          <sphereGeometry args={[0.112, 10, 8]} />
          <meshPhysicalMaterial color={headColor} roughness={0.50} clearcoat={0.08} clearcoatRoughness={0.84} />
        </mesh>

        {/* Forehead brow ridge — subtle */}
        <mesh position={[0, 0.110, 0.160]} scale={[1, 0.28, 0.45]}>
          <sphereGeometry args={[0.168, 12, 8]} />
          <meshPhysicalMaterial color={headColor} roughness={0.52} clearcoat={0.06} clearcoatRoughness={0.86} />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.188, 0.008, 0.010]} scale={[0.42, 0.70, 0.48]}>
          <sphereGeometry args={[0.062, 8, 7]} />
          <meshPhysicalMaterial color={headColor} roughness={0.48} clearcoat={0.08} clearcoatRoughness={0.84} />
        </mesh>
        <mesh position={[ 0.188, 0.008, 0.010]} scale={[0.42, 0.70, 0.48]}>
          <sphereGeometry args={[0.062, 8, 7]} />
          <meshPhysicalMaterial color={headColor} roughness={0.48} clearcoat={0.08} clearcoatRoughness={0.84} />
        </mesh>

        {/* ── HAIR ── */}
        {/* Main crown */}
        <mesh position={[0, 0.100, -0.014]} scale={[0.95, 0.88, 0.95]}>
          <sphereGeometry args={[0.215, 18, 14]} />
          <meshStandardMaterial color={hairColor} roughness={0.62} />
        </mesh>
        {/* Top volume */}
        <mesh position={[0, 0.170, 0.025]} scale={[0.78, 0.58, 0.80]}>
          <sphereGeometry args={[0.210, 14, 10]} />
          <meshStandardMaterial color={hairColor} roughness={0.64} />
        </mesh>
        {/* Back flow */}
        <mesh position={[0, 0.020, -0.155]} scale={[0.78, 1.05, 0.70]}>
          <sphereGeometry args={[0.185, 14, 10]} />
          <meshStandardMaterial color={hairColor} roughness={0.65} />
        </mesh>
        {/* Side left */}
        <mesh position={[-0.148, 0.022, 0.055]} scale={[0.50, 0.88, 0.78]}>
          <sphereGeometry args={[0.165, 12, 9]} />
          <meshStandardMaterial color={hairColor} roughness={0.64} />
        </mesh>
        {/* Side right */}
        <mesh position={[ 0.148, 0.022, 0.055]} scale={[0.50, 0.88, 0.78]}>
          <sphereGeometry args={[0.165, 12, 9]} />
          <meshStandardMaterial color={hairColor} roughness={0.64} />
        </mesh>
        {/* Front fringe */}
        <mesh position={[0, 0.068, 0.118]} scale={[0.88, 0.45, 0.62]}>
          <sphereGeometry args={[0.188, 12, 9]} />
          <meshStandardMaterial color={hairColor} roughness={0.66} />
        </mesh>

        {/* ── EYES — whites ── */}
        <mesh position={[-0.074, 0.042, 0.168]}>
          <sphereGeometry args={[0.046, 12, 9]} />
          <meshPhysicalMaterial color="#f8f8f6" roughness={0.08} clearcoat={0.3} clearcoatRoughness={0.1} />
        </mesh>
        <mesh position={[ 0.074, 0.042, 0.168]}>
          <sphereGeometry args={[0.046, 12, 9]} />
          <meshPhysicalMaterial color="#f8f8f6" roughness={0.08} clearcoat={0.3} clearcoatRoughness={0.1} />
        </mesh>

        {/* Iris */}
        <mesh position={[-0.074, 0.040, 0.178]}>
          <sphereGeometry args={[0.032, 10, 8]} />
          <meshPhysicalMaterial color="#3a6a9a" roughness={0.15} clearcoat={0.5} clearcoatRoughness={0.05} />
        </mesh>
        <mesh position={[ 0.074, 0.040, 0.178]}>
          <sphereGeometry args={[0.032, 10, 8]} />
          <meshPhysicalMaterial color="#3a6a9a" roughness={0.15} clearcoat={0.5} clearcoatRoughness={0.05} />
        </mesh>

        {/* Pupil */}
        <mesh position={[-0.074, 0.039, 0.183]}>
          <sphereGeometry args={[0.020, 8, 6]} />
          <meshStandardMaterial color="#060609" roughness={0.06} />
        </mesh>
        <mesh position={[ 0.074, 0.039, 0.183]}>
          <sphereGeometry args={[0.020, 8, 6]} />
          <meshStandardMaterial color="#060609" roughness={0.06} />
        </mesh>

        {/* Eye shine */}
        <mesh position={[-0.066, 0.052, 0.188]}>
          <sphereGeometry args={[0.007, 5, 4]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1.2} roughness={0} />
        </mesh>
        <mesh position={[ 0.066, 0.052, 0.188]}>
          <sphereGeometry args={[0.007, 5, 4]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1.2} roughness={0} />
        </mesh>
        {/* Small secondary shine */}
        <mesh position={[-0.079, 0.046, 0.187]}>
          <sphereGeometry args={[0.004, 4, 3]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1} roughness={0} />
        </mesh>
        <mesh position={[ 0.079, 0.046, 0.187]}>
          <sphereGeometry args={[0.004, 4, 3]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1} roughness={0} />
        </mesh>

        {/* Eyelids */}
        <mesh position={[-0.074, 0.072, 0.185]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.034, 0.008, 4, 12, Math.PI]} />
          <meshStandardMaterial color="#2a1a0e" roughness={0.5} />
        </mesh>
        <mesh position={[ 0.074, 0.072, 0.185]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.034, 0.008, 4, 12, Math.PI]} />
          <meshStandardMaterial color="#2a1a0e" roughness={0.5} />
        </mesh>

        {/* Eyebrows */}
        <mesh position={[-0.074, 0.120, 0.172]} rotation={[0, 0.10, 0.16]}>
          <capsuleGeometry args={[0.0085, 0.052, 4, 8]} />
          <meshStandardMaterial color={hairColor} roughness={0.5} />
        </mesh>
        <mesh position={[ 0.074, 0.120, 0.172]} rotation={[0, -0.10, -0.16]}>
          <capsuleGeometry args={[0.0085, 0.052, 4, 8]} />
          <meshStandardMaterial color={hairColor} roughness={0.5} />
        </mesh>

        {/* Nose — bridge + tip */}
        <mesh position={[0, 0.025, 0.186]} rotation={[0.35, 0, 0]}>
          <capsuleGeometry args={[0.012, 0.045, 4, 8]} />
          <meshPhysicalMaterial color={headColor} roughness={0.50} clearcoat={0.08} clearcoatRoughness={0.84} />
        </mesh>
        <mesh position={[0, -0.014, 0.193]}>
          <sphereGeometry args={[0.021, 8, 6]} />
          <meshPhysicalMaterial color={headColor} roughness={0.50} clearcoat={0.08} clearcoatRoughness={0.84} />
        </mesh>
        {/* Nostrils */}
        <mesh position={[-0.015, -0.022, 0.190]}>
          <sphereGeometry args={[0.010, 6, 5]} />
          <meshStandardMaterial color="#c08868" roughness={0.55} />
        </mesh>
        <mesh position={[ 0.015, -0.022, 0.190]}>
          <sphereGeometry args={[0.010, 6, 5]} />
          <meshStandardMaterial color="#c08868" roughness={0.55} />
        </mesh>

        {/* Upper lip */}
        <mesh position={[0, -0.072, 0.185]} rotation={[0.10, 0, 0]} scale={[1.0, 0.38, 0.65]}>
          <torusGeometry args={[0.028, 0.013, 4, 14, Math.PI]} />
          <meshPhysicalMaterial color="#c07868" roughness={0.38} clearcoat={0.15} clearcoatRoughness={0.45} />
        </mesh>
        {/* Lower lip */}
        <mesh position={[0, -0.090, 0.185]} rotation={[-0.14, 0, 0]} scale={[0.85, 0.50, 0.65]}>
          <sphereGeometry args={[0.030, 10, 7]} />
          <meshPhysicalMaterial color="#c07868" roughness={0.36} clearcoat={0.15} clearcoatRoughness={0.45} />
        </mesh>

        {/* Cheek blush — very subtle */}
        <mesh position={[-0.125, -0.015, 0.145]} scale={[0.72, 0.55, 0.4]}>
          <sphereGeometry args={[0.058, 8, 7]} />
          <meshStandardMaterial color="#e89080" transparent opacity={0.18} roughness={0.8} />
        </mesh>
        <mesh position={[ 0.125, -0.015, 0.145]} scale={[0.72, 0.55, 0.4]}>
          <sphereGeometry args={[0.058, 8, 7]} />
          <meshStandardMaterial color="#e89080" transparent opacity={0.18} roughness={0.8} />
        </mesh>

      </group>
    </>
  )
}
