import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type * as THREE from 'three'

interface Props {
  bodyColor: string    // shirt / top
  headColor: string    // skin tone
  hairColor?: string   // hair
  pantsColor?: string  // shorts / pants
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
    const headBobY = moving ? Math.abs(Math.sin(walkT.current)) * 0.026 : 0
    const breathY  = Math.sin(breathT.current) * 0.009
    const lerp     = 0.20

    // Legs — pivot at hip
    if (leftLegRef.current)  leftLegRef.current.rotation.x  += ( swing - leftLegRef.current.rotation.x)  * lerp
    if (rightLegRef.current) rightLegRef.current.rotation.x += (-swing - rightLegRef.current.rotation.x) * lerp

    // Arms — counter-swing; Z splay set every frame so it never drifts
    if (leftArmRef.current) {
      leftArmRef.current.rotation.x += (-swing * 0.44 - leftArmRef.current.rotation.x) * lerp
      leftArmRef.current.rotation.z  =  0.27
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.x += ( swing * 0.44 - rightArmRef.current.rotation.x) * lerp
      rightArmRef.current.rotation.z  = -0.27
    }

    // Head — bobs during walk, breathes idle, nods while talking
    if (headGrpRef.current) {
      const targetY = 1.615 + headBobY + breathY
      headGrpRef.current.position.y += (targetY - headGrpRef.current.position.y) * 0.14
      const talkNod = talking ? Math.sin(talkT.current) * 0.055 : 0
      headGrpRef.current.rotation.x += (talkNod - headGrpRef.current.rotation.x) * 0.14
    }
  })

  // Eyebrow color: slightly darker than hair
  const eyebrowColor = hairColor

  return (
    <>
      {/* ── LEFT LEG — group pivot at hip (y=0.94) ───────────────────
          Shoe is a child so it follows the foot through the walk arc  */}
      <group ref={leftLegRef} position={[-0.115, 0.94, 0]}>
        {/* Thigh — shorts colour */}
        <mesh position={[0, -0.175, 0]} castShadow>
          <capsuleGeometry args={[0.100, 0.230, 4, 8]} />
          <meshStandardMaterial color={pantsColor} roughness={0.30} />
        </mesh>
        {/* Calf — skin */}
        <mesh position={[0, -0.570, 0]}>
          <capsuleGeometry args={[0.086, 0.295, 4, 8]} />
          <meshStandardMaterial color={headColor} roughness={0.28} />
        </mesh>
        {/* Shoe — capsule rotated to sit like a shoe */}
        <mesh position={[0, -0.856, 0.055]} rotation={[Math.PI / 2 - 0.18, 0, 0]}>
          <capsuleGeometry args={[0.068, 0.14, 4, 8]} />
          <meshStandardMaterial color="#141414" roughness={0.32} />
        </mesh>
      </group>

      {/* ── RIGHT LEG ─────────────────────────────────────────────── */}
      <group ref={rightLegRef} position={[0.115, 0.94, 0]}>
        <mesh position={[0, -0.175, 0]} castShadow>
          <capsuleGeometry args={[0.100, 0.230, 4, 8]} />
          <meshStandardMaterial color={pantsColor} roughness={0.30} />
        </mesh>
        <mesh position={[0, -0.570, 0]}>
          <capsuleGeometry args={[0.086, 0.295, 4, 8]} />
          <meshStandardMaterial color={headColor} roughness={0.28} />
        </mesh>
        <mesh position={[0, -0.856, 0.055]} rotation={[Math.PI / 2 - 0.18, 0, 0]}>
          <capsuleGeometry args={[0.068, 0.14, 4, 8]} />
          <meshStandardMaterial color="#141414" roughness={0.32} />
        </mesh>
      </group>

      {/* ── TORSO / SHIRT ─────────────────────────────────────────── */}
      <mesh position={[0, 1.195, 0]} castShadow>
        <capsuleGeometry args={[0.21, 0.46, 8, 14]} />
        <meshStandardMaterial color={bodyColor} roughness={0.35} />
      </mesh>

      {/* ── LEFT ARM — group pivot at shoulder (y=1.34) ───────────── */}
      <group ref={leftArmRef} position={[-0.296, 1.340, 0]}>
        {/* Sleeve — shirt colour */}
        <mesh position={[0, -0.108, 0]}>
          <capsuleGeometry args={[0.070, 0.176, 6, 10]} />
          <meshStandardMaterial color={bodyColor} roughness={0.35} />
        </mesh>
        {/* Forearm — skin */}
        <mesh position={[0, -0.338, 0]}>
          <capsuleGeometry args={[0.057, 0.198, 6, 10]} />
          <meshStandardMaterial color={headColor} roughness={0.28} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.506, 0]}>
          <sphereGeometry args={[0.062, 9, 7]} />
          <meshStandardMaterial color={headColor} roughness={0.30} />
        </mesh>
      </group>

      {/* ── RIGHT ARM ─────────────────────────────────────────────── */}
      <group ref={rightArmRef} position={[0.296, 1.340, 0]}>
        <mesh position={[0, -0.108, 0]}>
          <capsuleGeometry args={[0.070, 0.176, 6, 10]} />
          <meshStandardMaterial color={bodyColor} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.338, 0]}>
          <capsuleGeometry args={[0.057, 0.198, 6, 10]} />
          <meshStandardMaterial color={headColor} roughness={0.28} />
        </mesh>
        <mesh position={[0, -0.506, 0]}>
          <sphereGeometry args={[0.062, 9, 7]} />
          <meshStandardMaterial color={headColor} roughness={0.30} />
        </mesh>
      </group>

      {/* ── NECK ──────────────────────────────────────────────────── */}
      <mesh position={[0, 1.460, 0]}>
        <cylinderGeometry args={[0.072, 0.1, 0.14, 10]} />
        <meshStandardMaterial color={headColor} roughness={0.28} />
      </mesh>

      {/* ── HEAD GROUP — position animated in useFrame ───────────── */}
      <group ref={headGrpRef} position={[0, 1.64, 0]}>

        {/* Face — bigger, rounder Sims head */}
        <mesh castShadow>
          <sphereGeometry args={[0.26, 20, 16]} />
          <meshStandardMaterial color={headColor} roughness={0.25} />
        </mesh>

        {/* Hair — main dome covering crown and back */}
        <mesh position={[0, 0.11, -0.018]}>
          <sphereGeometry args={[0.245, 16, 12]} />
          <meshStandardMaterial color={hairColor} roughness={0.38} />
        </mesh>

        {/* Hair — front fringe overhang */}
        <mesh position={[0, 0.04, 0.12]} scale={[1.08, 0.72, 0.82]}>
          <sphereGeometry args={[0.22, 10, 8]} />
          <meshStandardMaterial color={hairColor} roughness={0.40} />
        </mesh>

        {/* Nose — subtle small sphere */}
        <mesh position={[0, -0.02, 0.205]}>
          <sphereGeometry args={[0.028, 6, 5]} />
          <meshStandardMaterial color={headColor} roughness={0.25} />
        </mesh>

        {/* Eye whites — left */}
        <mesh position={[-0.088, 0.054, 0.202]}>
          <sphereGeometry args={[0.056, 10, 8]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.20} />
        </mesh>
        {/* Eye whites — right */}
        <mesh position={[ 0.088, 0.054, 0.202]}>
          <sphereGeometry args={[0.056, 10, 8]} />
          <meshStandardMaterial color="#f5f5f5" roughness={0.20} />
        </mesh>

        {/* Iris — left */}
        <mesh position={[-0.088, 0.052, 0.218]}>
          <sphereGeometry args={[0.044, 10, 8]} />
          <meshStandardMaterial color="#3a6a8a" roughness={0.30} />
        </mesh>
        {/* Iris — right */}
        <mesh position={[ 0.088, 0.052, 0.218]}>
          <sphereGeometry args={[0.044, 10, 8]} />
          <meshStandardMaterial color="#3a6a8a" roughness={0.30} />
        </mesh>

        {/* Pupils — left */}
        <mesh position={[-0.088, 0.051, 0.224]}>
          <sphereGeometry args={[0.028, 9, 7]} />
          <meshStandardMaterial color="#080810" roughness={0.15} />
        </mesh>
        {/* Pupils — right */}
        <mesh position={[ 0.088, 0.051, 0.224]}>
          <sphereGeometry args={[0.028, 9, 7]} />
          <meshStandardMaterial color="#080810" roughness={0.15} />
        </mesh>

        {/* Eye shine — tiny emissive dot gives life — left */}
        <mesh position={[-0.079, 0.064, 0.232]}>
          <sphereGeometry args={[0.009, 6, 5]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} roughness={0.05} />
        </mesh>
        {/* Eye shine — right */}
        <mesh position={[ 0.079, 0.064, 0.232]}>
          <sphereGeometry args={[0.009, 6, 5]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} roughness={0.05} />
        </mesh>

        {/* Eyebrow — thin flat box above left eye */}
        <mesh position={[-0.088, 0.118, 0.212]} rotation={[0.22, 0, 0.08]}>
          <boxGeometry args={[0.072, 0.014, 0.018]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.40} />
        </mesh>
        {/* Eyebrow — right eye */}
        <mesh position={[ 0.088, 0.118, 0.212]} rotation={[0.22, 0, -0.08]}>
          <boxGeometry args={[0.072, 0.014, 0.018]} />
          <meshStandardMaterial color={eyebrowColor} roughness={0.40} />
        </mesh>

      </group>
    </>
  )
}
