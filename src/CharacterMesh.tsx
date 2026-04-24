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

  // Human proportions: ~1.80 total height, head ~1/8 of body
  return (
    <>
      {/* ── LEGS — long, human proportions, hip at y=0.90 ── */}
      <group ref={leftLegRef} position={[-0.110, 0.90, 0]}>
        <mesh position={[0, -0.200, 0]} castShadow>
          <capsuleGeometry args={[0.092, 0.260, 6, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.45} metalness={0.05} />
        </mesh>
        <mesh position={[0, -0.580, 0]}>
          <capsuleGeometry args={[0.078, 0.280, 6, 12]} />
          <meshStandardMaterial color={headColor} roughness={0.42} />
        </mesh>
        {/* Shoe */}
        <mesh position={[0, -0.865, 0.052]} rotation={[Math.PI / 2 - 0.20, 0, 0]}>
          <capsuleGeometry args={[0.065, 0.170, 6, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.45} />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.110, 0.90, 0]}>
        <mesh position={[0, -0.200, 0]} castShadow>
          <capsuleGeometry args={[0.092, 0.260, 6, 12]} />
          <meshStandardMaterial color={pantsColor} roughness={0.45} metalness={0.05} />
        </mesh>
        <mesh position={[0, -0.580, 0]}>
          <capsuleGeometry args={[0.078, 0.280, 6, 12]} />
          <meshStandardMaterial color={headColor} roughness={0.42} />
        </mesh>
        <mesh position={[0, -0.865, 0.052]} rotation={[Math.PI / 2 - 0.20, 0, 0]}>
          <capsuleGeometry args={[0.065, 0.170, 6, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.45} />
        </mesh>
      </group>

      {/* ── TORSO — natural human shape ── */}
      <mesh position={[0, 1.18, 0]} castShadow>
        <capsuleGeometry args={[0.195, 0.460, 8, 16]} />
        <meshStandardMaterial color={bodyColor} roughness={0.42} metalness={0.04} />
      </mesh>

      {/* ── ARMS — shoulder at y=1.33 ── */}
      <group ref={leftArmRef} position={[-0.285, 1.330, 0]}>
        <mesh position={[0, -0.115, 0]}>
          <capsuleGeometry args={[0.066, 0.185, 6, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.42} />
        </mesh>
        <mesh position={[0, -0.360, 0]}>
          <capsuleGeometry args={[0.054, 0.195, 6, 12]} />
          <meshStandardMaterial color={headColor} roughness={0.40} />
        </mesh>
        <mesh position={[0, -0.520, 0]}>
          <sphereGeometry args={[0.058, 10, 8]} />
          <meshStandardMaterial color={headColor} roughness={0.40} />
        </mesh>
      </group>

      <group ref={rightArmRef} position={[0.285, 1.330, 0]}>
        <mesh position={[0, -0.115, 0]}>
          <capsuleGeometry args={[0.066, 0.185, 6, 12]} />
          <meshStandardMaterial color={bodyColor} roughness={0.42} />
        </mesh>
        <mesh position={[0, -0.360, 0]}>
          <capsuleGeometry args={[0.054, 0.195, 6, 12]} />
          <meshStandardMaterial color={headColor} roughness={0.40} />
        </mesh>
        <mesh position={[0, -0.520, 0]}>
          <sphereGeometry args={[0.058, 10, 8]} />
          <meshStandardMaterial color={headColor} roughness={0.40} />
        </mesh>
      </group>

      {/* ── NECK ── */}
      <mesh position={[0, 1.465, 0]}>
        <cylinderGeometry args={[0.068, 0.085, 0.130, 12]} />
        <meshStandardMaterial color={headColor} roughness={0.40} />
      </mesh>

      {/* ── HEAD — human size, animated ── */}
      <group ref={headGrpRef} position={[0, 1.62, 0]}>

        {/* Face */}
        <mesh castShadow>
          <sphereGeometry args={[0.205, 22, 16]} />
          <meshStandardMaterial color={headColor} roughness={0.36} />
        </mesh>

        {/* Hair — back/top */}
        <mesh position={[0, 0.090, -0.018]}>
          <sphereGeometry args={[0.198, 18, 13]} />
          <meshStandardMaterial color={hairColor} roughness={0.55} />
        </mesh>
        {/* Hair — front fringe */}
        <mesh position={[0, 0.038, 0.095]} scale={[1.06, 0.62, 0.78]}>
          <sphereGeometry args={[0.185, 12, 9]} />
          <meshStandardMaterial color={hairColor} roughness={0.58} />
        </mesh>

        {/* Eyes — whites */}
        <mesh position={[-0.075, 0.042, 0.172]}>
          <sphereGeometry args={[0.048, 10, 8]} />
          <meshStandardMaterial color="#f4f4f4" roughness={0.15} />
        </mesh>
        <mesh position={[ 0.075, 0.042, 0.172]}>
          <sphereGeometry args={[0.048, 10, 8]} />
          <meshStandardMaterial color="#f4f4f4" roughness={0.15} />
        </mesh>
        {/* Iris */}
        <mesh position={[-0.075, 0.040, 0.183]}>
          <sphereGeometry args={[0.034, 10, 8]} />
          <meshStandardMaterial color="#3a6a9a" roughness={0.20} />
        </mesh>
        <mesh position={[ 0.075, 0.040, 0.183]}>
          <sphereGeometry args={[0.034, 10, 8]} />
          <meshStandardMaterial color="#3a6a9a" roughness={0.20} />
        </mesh>
        {/* Pupil */}
        <mesh position={[-0.075, 0.039, 0.188]}>
          <sphereGeometry args={[0.022, 8, 6]} />
          <meshStandardMaterial color="#08080f" roughness={0.10} />
        </mesh>
        <mesh position={[ 0.075, 0.039, 0.188]}>
          <sphereGeometry args={[0.022, 8, 6]} />
          <meshStandardMaterial color="#08080f" roughness={0.10} />
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

      </group>
    </>
  )
}
