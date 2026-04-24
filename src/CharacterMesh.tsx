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

  return (
    <>
      {/* ── LEFT LEG — group pivot at hip (y=0.94) ───────────────────
          Shoe is a child so it follows the foot through the walk arc  */}
      <group ref={leftLegRef} position={[-0.115, 0.94, 0]}>
        {/* Thigh — shorts colour */}
        <mesh position={[0, -0.175, 0]} castShadow>
          <capsuleGeometry args={[0.100, 0.230, 4, 8]} />
          <meshStandardMaterial color={pantsColor} roughness={0.72} />
        </mesh>
        {/* Calf — skin (shorts + bare legs look) */}
        <mesh position={[0, -0.570, 0]}>
          <capsuleGeometry args={[0.086, 0.295, 4, 8]} />
          <meshStandardMaterial color={headColor} roughness={0.70} />
        </mesh>
        {/* Shoe — box, slightly forward offset */}
        <mesh position={[0, -0.854, 0.046]}>
          <boxGeometry args={[0.152, 0.114, 0.268]} />
          <meshStandardMaterial color="#141414" roughness={0.88} />
        </mesh>
      </group>

      {/* ── RIGHT LEG ─────────────────────────────────────────────── */}
      <group ref={rightLegRef} position={[0.115, 0.94, 0]}>
        <mesh position={[0, -0.175, 0]} castShadow>
          <capsuleGeometry args={[0.100, 0.230, 4, 8]} />
          <meshStandardMaterial color={pantsColor} roughness={0.72} />
        </mesh>
        <mesh position={[0, -0.570, 0]}>
          <capsuleGeometry args={[0.086, 0.295, 4, 8]} />
          <meshStandardMaterial color={headColor} roughness={0.70} />
        </mesh>
        <mesh position={[0, -0.854, 0.046]}>
          <boxGeometry args={[0.152, 0.114, 0.268]} />
          <meshStandardMaterial color="#141414" roughness={0.88} />
        </mesh>
      </group>

      {/* ── TORSO / SHIRT ─────────────────────────────────────────── */}
      <mesh position={[0, 1.195, 0]} castShadow>
        <capsuleGeometry args={[0.198, 0.440, 6, 12]} />
        <meshStandardMaterial color={bodyColor} roughness={0.62} />
      </mesh>

      {/* ── LEFT ARM — group pivot at shoulder (y=1.34) ───────────── */}
      <group ref={leftArmRef} position={[-0.296, 1.340, 0]}>
        {/* Sleeve — shirt colour */}
        <mesh position={[0, -0.108, 0]}>
          <capsuleGeometry args={[0.070, 0.176, 4, 8]} />
          <meshStandardMaterial color={bodyColor} roughness={0.65} />
        </mesh>
        {/* Forearm — skin */}
        <mesh position={[0, -0.338, 0]}>
          <capsuleGeometry args={[0.057, 0.198, 4, 8]} />
          <meshStandardMaterial color={headColor} roughness={0.68} />
        </mesh>
        {/* Hand */}
        <mesh position={[0, -0.506, 0]}>
          <sphereGeometry args={[0.062, 9, 7]} />
          <meshStandardMaterial color={headColor} roughness={0.65} />
        </mesh>
      </group>

      {/* ── RIGHT ARM ─────────────────────────────────────────────── */}
      <group ref={rightArmRef} position={[0.296, 1.340, 0]}>
        <mesh position={[0, -0.108, 0]}>
          <capsuleGeometry args={[0.070, 0.176, 4, 8]} />
          <meshStandardMaterial color={bodyColor} roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.338, 0]}>
          <capsuleGeometry args={[0.057, 0.198, 4, 8]} />
          <meshStandardMaterial color={headColor} roughness={0.68} />
        </mesh>
        <mesh position={[0, -0.506, 0]}>
          <sphereGeometry args={[0.062, 9, 7]} />
          <meshStandardMaterial color={headColor} roughness={0.65} />
        </mesh>
      </group>

      {/* ── NECK ──────────────────────────────────────────────────── */}
      <mesh position={[0, 1.460, 0]}>
        <cylinderGeometry args={[0.074, 0.092, 0.132, 8]} />
        <meshStandardMaterial color={headColor} roughness={0.65} />
      </mesh>

      {/* ── HEAD GROUP — position animated in useFrame ───────────── */}
      <group ref={headGrpRef} position={[0, 1.615, 0]}>

        {/* Face */}
        <mesh castShadow>
          <sphereGeometry args={[0.215, 18, 14]} />
          <meshStandardMaterial color={headColor} roughness={0.50} />
        </mesh>

        {/* Hair — covers crown + back, face shows through at front */}
        <mesh position={[0, 0.096, -0.020]}>
          <sphereGeometry args={[0.200, 14, 10]} />
          <meshStandardMaterial color={hairColor} roughness={0.88} />
        </mesh>

        {/* Eye whites */}
        <mesh position={[-0.080, 0.050, 0.177]}>
          <sphereGeometry args={[0.051, 9, 7]} />
          <meshStandardMaterial color="#f3f3f3" roughness={0.80} />
        </mesh>
        <mesh position={[ 0.080, 0.050, 0.177]}>
          <sphereGeometry args={[0.051, 9, 7]} />
          <meshStandardMaterial color="#f3f3f3" roughness={0.80} />
        </mesh>

        {/* Iris */}
        <mesh position={[-0.080, 0.048, 0.190]}>
          <sphereGeometry args={[0.040, 9, 7]} />
          <meshStandardMaterial color="#3a6a8a" roughness={0.85} />
        </mesh>
        <mesh position={[ 0.080, 0.048, 0.190]}>
          <sphereGeometry args={[0.040, 9, 7]} />
          <meshStandardMaterial color="#3a6a8a" roughness={0.85} />
        </mesh>

        {/* Pupils */}
        <mesh position={[-0.080, 0.047, 0.193]}>
          <sphereGeometry args={[0.033, 9, 7]} />
          <meshStandardMaterial color="#0a0a14" roughness={0.9} />
        </mesh>
        <mesh position={[ 0.080, 0.047, 0.193]}>
          <sphereGeometry args={[0.033, 9, 7]} />
          <meshStandardMaterial color="#0a0a14" roughness={0.9} />
        </mesh>

        {/* Eye shine — tiny emissive dot gives life */}
        <mesh position={[-0.072, 0.060, 0.202]}>
          <sphereGeometry args={[0.009, 6, 5]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.7} roughness={0.1} />
        </mesh>
        <mesh position={[ 0.072, 0.060, 0.202]}>
          <sphereGeometry args={[0.009, 6, 5]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.7} roughness={0.1} />
        </mesh>

      </group>
    </>
  )
}
