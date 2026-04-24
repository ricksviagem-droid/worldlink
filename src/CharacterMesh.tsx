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
    const headBobY = moving ? Math.abs(Math.sin(walkT.current)) * 0.022 : 0
    const breathY  = Math.sin(breathT.current) * 0.008
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
      const targetY = 1.62 + headBobY + breathY
      headGrpRef.current.position.y += (targetY - headGrpRef.current.position.y) * 0.14
      const talkNod = talking ? Math.sin(talkT.current) * 0.045 : 0
      headGrpRef.current.rotation.x += (talkNod - headGrpRef.current.rotation.x) * 0.14
    }
  })

  const shoeColor  = '#1a1a1a'
  const soleColor  = '#ffffff'

  return (
    <>
      {/* ── LEGS — hip pivot at y=0.90 ── */}
      <group ref={leftLegRef} position={[-0.110, 0.90, 0]}>
        {/* Thigh — pants */}
        <mesh position={[0, -0.200, 0]} castShadow>
          <capsuleGeometry args={[0.090, 0.260, 6, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.62} />
        </mesh>
        {/* Calf — pants (slightly slimmer) */}
        <mesh position={[0, -0.570, 0]}>
          <capsuleGeometry args={[0.076, 0.270, 6, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.62} />
        </mesh>
        {/* Pant cuff */}
        <mesh position={[0, -0.745, 0]}>
          <cylinderGeometry args={[0.082, 0.080, 0.04, 10]} />
          <meshStandardMaterial color={pantsColor} roughness={0.55} />
        </mesh>
        {/* Shoe upper */}
        <mesh position={[0, -0.855, 0.048]} rotation={[Math.PI / 2 - 0.18, 0, 0]}>
          <capsuleGeometry args={[0.062, 0.165, 6, 12]} />
          <meshStandardMaterial color={shoeColor} roughness={0.55} />
        </mesh>
        {/* Shoe sole — flat white strip */}
        <mesh position={[0, -0.892, 0.058]} rotation={[Math.PI / 2 - 0.18, 0, 0]}>
          <boxGeometry args={[0.118, 0.175, 0.022]} />
          <meshStandardMaterial color={soleColor} roughness={0.6} />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.110, 0.90, 0]}>
        <mesh position={[0, -0.200, 0]} castShadow>
          <capsuleGeometry args={[0.090, 0.260, 6, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.62} />
        </mesh>
        <mesh position={[0, -0.570, 0]}>
          <capsuleGeometry args={[0.076, 0.270, 6, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.62} />
        </mesh>
        <mesh position={[0, -0.745, 0]}>
          <cylinderGeometry args={[0.082, 0.080, 0.04, 10]} />
          <meshStandardMaterial color={pantsColor} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.855, 0.048]} rotation={[Math.PI / 2 - 0.18, 0, 0]}>
          <capsuleGeometry args={[0.062, 0.165, 6, 12]} />
          <meshStandardMaterial color={shoeColor} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.892, 0.058]} rotation={[Math.PI / 2 - 0.18, 0, 0]}>
          <boxGeometry args={[0.118, 0.175, 0.022]} />
          <meshStandardMaterial color={soleColor} roughness={0.6} />
        </mesh>
      </group>

      {/* ── TORSO — shirt/hoodie shape ── */}
      <mesh position={[0, 1.18, 0]} castShadow>
        <capsuleGeometry args={[0.196, 0.462, 8, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.65} metalness={0.02} />
      </mesh>
      {/* Shirt bottom hem */}
      <mesh position={[0, 0.94, 0]}>
        <cylinderGeometry args={[0.198, 0.194, 0.032, 14]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      {/* Belt */}
      <mesh position={[0, 0.975, 0]}>
        <cylinderGeometry args={[0.150, 0.150, 0.048, 14]} />
        <meshStandardMaterial color="#2a1a08" roughness={0.5} metalness={0.15} />
      </mesh>
      {/* Belt buckle */}
      <mesh position={[0, 0.975, 0.150]}>
        <boxGeometry args={[0.055, 0.038, 0.014]} />
        <meshStandardMaterial color="#c8a840" roughness={0.3} metalness={0.7} />
      </mesh>
      {/* Front hoodie pocket */}
      <mesh position={[0, 1.01, 0.196]} rotation={[-0.06, 0, 0]}>
        <boxGeometry args={[0.200, 0.088, 0.015]} />
        <meshStandardMaterial color={bodyColor} roughness={0.70} />
      </mesh>
      {/* Collar / neckline edge */}
      <mesh position={[0, 1.40, 0.08]}>
        <torusGeometry args={[0.082, 0.018, 6, 14, Math.PI]} />
        <meshStandardMaterial color={bodyColor} roughness={0.6} />
      </mesh>

      {/* ── ARMS — shoulder at y=1.33 ── */}
      <group ref={leftArmRef} position={[-0.288, 1.330, 0]}>
        {/* Upper arm — sleeve */}
        <mesh position={[0, -0.115, 0]}>
          <capsuleGeometry args={[0.065, 0.185, 6, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.62} />
        </mesh>
        {/* Sleeve cuff */}
        <mesh position={[0, -0.228, 0]}>
          <cylinderGeometry args={[0.068, 0.066, 0.028, 10]} />
          <meshStandardMaterial color={bodyColor} roughness={0.58} />
        </mesh>
        {/* Forearm — skin */}
        <mesh position={[0, -0.365, 0]}>
          <capsuleGeometry args={[0.053, 0.192, 6, 12]} />
          <meshStandardMaterial color={headColor} roughness={0.40} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.525, 0]}>
          <sphereGeometry args={[0.060, 10, 8]} />
          <meshStandardMaterial color={headColor} roughness={0.38} />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.288, 1.330, 0]}>
        <mesh position={[0, -0.115, 0]}>
          <capsuleGeometry args={[0.065, 0.185, 6, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.62} />
        </mesh>
        <mesh position={[0, -0.228, 0]}>
          <cylinderGeometry args={[0.068, 0.066, 0.028, 10]} />
          <meshStandardMaterial color={bodyColor} roughness={0.58} />
        </mesh>
        <mesh position={[0, -0.365, 0]}>
          <capsuleGeometry args={[0.053, 0.192, 6, 12]} />
          <meshStandardMaterial color={headColor} roughness={0.40} />
        </mesh>
        <mesh position={[0, -0.525, 0]}>
          <sphereGeometry args={[0.060, 10, 8]} />
          <meshStandardMaterial color={headColor} roughness={0.38} />
        </mesh>
      </group>

      {/* ── NECK ── */}
      <mesh position={[0, 1.465, 0]}>
        <cylinderGeometry args={[0.068, 0.085, 0.130, 12]} />
        <meshStandardMaterial color={headColor} roughness={0.40} />
      </mesh>

      {/* ── HEAD ── */}
      <group ref={headGrpRef} position={[0, 1.62, 0]}>

        {/* Face */}
        <mesh castShadow>
          <sphereGeometry args={[0.205, 22, 16]} />
          <meshStandardMaterial color={headColor} roughness={0.35} />
        </mesh>

        {/* Ears */}
        <mesh position={[-0.198, 0.010, 0.008]} scale={[0.45, 0.72, 0.5]}>
          <sphereGeometry args={[0.060, 8, 7]} />
          <meshStandardMaterial color={headColor} roughness={0.38} />
        </mesh>
        <mesh position={[ 0.198, 0.010, 0.008]} scale={[0.45, 0.72, 0.5]}>
          <sphereGeometry args={[0.060, 8, 7]} />
          <meshStandardMaterial color={headColor} roughness={0.38} />
        </mesh>

        {/* Hair — back/top dome */}
        <mesh position={[0, 0.090, -0.018]}>
          <sphereGeometry args={[0.198, 18, 13]} />
          <meshStandardMaterial color={hairColor} roughness={0.58} />
        </mesh>
        {/* Hair — front fringe */}
        <mesh position={[0, 0.038, 0.095]} scale={[1.06, 0.62, 0.78]}>
          <sphereGeometry args={[0.185, 12, 9]} />
          <meshStandardMaterial color={hairColor} roughness={0.60} />
        </mesh>
        {/* Hair — side left */}
        <mesh position={[-0.155, 0.025, 0.060]} scale={[0.5, 0.8, 0.75]}>
          <sphereGeometry args={[0.155, 10, 8]} />
          <meshStandardMaterial color={hairColor} roughness={0.60} />
        </mesh>
        {/* Hair — side right */}
        <mesh position={[ 0.155, 0.025, 0.060]} scale={[0.5, 0.8, 0.75]}>
          <sphereGeometry args={[0.155, 10, 8]} />
          <meshStandardMaterial color={hairColor} roughness={0.60} />
        </mesh>

        {/* Eyes — whites */}
        <mesh position={[-0.075, 0.042, 0.172]}>
          <sphereGeometry args={[0.048, 10, 8]} />
          <meshStandardMaterial color="#f4f4f4" roughness={0.12} />
        </mesh>
        <mesh position={[ 0.075, 0.042, 0.172]}>
          <sphereGeometry args={[0.048, 10, 8]} />
          <meshStandardMaterial color="#f4f4f4" roughness={0.12} />
        </mesh>
        {/* Iris */}
        <mesh position={[-0.075, 0.040, 0.183]}>
          <sphereGeometry args={[0.034, 10, 8]} />
          <meshStandardMaterial color="#3a6a9a" roughness={0.18} />
        </mesh>
        <mesh position={[ 0.075, 0.040, 0.183]}>
          <sphereGeometry args={[0.034, 10, 8]} />
          <meshStandardMaterial color="#3a6a9a" roughness={0.18} />
        </mesh>
        {/* Pupil */}
        <mesh position={[-0.075, 0.039, 0.188]}>
          <sphereGeometry args={[0.022, 8, 6]} />
          <meshStandardMaterial color="#08080f" roughness={0.08} />
        </mesh>
        <mesh position={[ 0.075, 0.039, 0.188]}>
          <sphereGeometry args={[0.022, 8, 6]} />
          <meshStandardMaterial color="#08080f" roughness={0.08} />
        </mesh>
        {/* Eye shine */}
        <mesh position={[-0.068, 0.052, 0.193]}>
          <sphereGeometry args={[0.007, 5, 4]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1} roughness={0} />
        </mesh>
        <mesh position={[ 0.068, 0.052, 0.193]}>
          <sphereGeometry args={[0.007, 5, 4]} />
          <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={1} roughness={0} />
        </mesh>

        {/* Eyelids — thin dark arc above each eye */}
        <mesh position={[-0.075, 0.074, 0.190]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.036, 0.007, 4, 10, Math.PI]} />
          <meshStandardMaterial color="#2a1a10" roughness={0.5} />
        </mesh>
        <mesh position={[ 0.075, 0.074, 0.190]} rotation={[0, 0, 0]}>
          <torusGeometry args={[0.036, 0.007, 4, 10, Math.PI]} />
          <meshStandardMaterial color="#2a1a10" roughness={0.5} />
        </mesh>

        {/* Eyebrows */}
        <mesh position={[-0.075, 0.118, 0.176]} rotation={[0, 0.08, 0.14]}>
          <capsuleGeometry args={[0.009, 0.055, 4, 8]} />
          <meshStandardMaterial color={hairColor} roughness={0.5} />
        </mesh>
        <mesh position={[ 0.075, 0.118, 0.176]} rotation={[0, -0.08, -0.14]}>
          <capsuleGeometry args={[0.009, 0.055, 4, 8]} />
          <meshStandardMaterial color={hairColor} roughness={0.5} />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.020, 0.192]}>
          <sphereGeometry args={[0.022, 8, 6]} />
          <meshStandardMaterial color={headColor} roughness={0.36} />
        </mesh>

        {/* Mouth — lips */}
        <mesh position={[0, -0.080, 0.186]} rotation={[0.12, 0, 0]} scale={[1.0, 0.4, 0.7]}>
          <torusGeometry args={[0.030, 0.012, 4, 12, Math.PI]} />
          <meshStandardMaterial color="#c07060" roughness={0.4} />
        </mesh>

      </group>
    </>
  )
}
