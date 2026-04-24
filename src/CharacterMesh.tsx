import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type * as THREE from 'three'

interface Props {
  bodyColor: string
  headColor: string
  movingRef?: React.RefObject<boolean>
}

export function CharacterMesh({ bodyColor, headColor, movingRef }: Props) {
  const leftLegRef  = useRef<THREE.Mesh>(null)
  const rightLegRef = useRef<THREE.Mesh>(null)
  const leftArmRef  = useRef<THREE.Group>(null)
  const rightArmRef = useRef<THREE.Group>(null)
  const walkT   = useRef(Math.random() * Math.PI * 2)
  const breathT = useRef(Math.random() * Math.PI * 2)

  useFrame((_, delta) => {
    const moving = movingRef?.current ?? false
    if (moving) walkT.current += delta * 9
    breathT.current += delta * 1.0

    const swing  = moving ? Math.sin(walkT.current) * 0.50 : 0
    const lerp   = 0.22

    if (leftLegRef.current)  leftLegRef.current.rotation.x  += (swing         - leftLegRef.current.rotation.x)  * lerp
    if (rightLegRef.current) rightLegRef.current.rotation.x += (-swing        - rightLegRef.current.rotation.x) * lerp
    if (leftArmRef.current)  leftArmRef.current.rotation.x  += (-swing * 0.5  - leftArmRef.current.rotation.x)  * lerp
    if (rightArmRef.current) rightArmRef.current.rotation.x += (swing  * 0.5  - rightArmRef.current.rotation.x) * lerp
  })

  return (
    <>
      {/* ── Shoes ── */}
      <mesh position={[-0.12, 0.08, 0.04]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.88} />
      </mesh>
      <mesh position={[0.12, 0.08, 0.04]}>
        <sphereGeometry args={[0.1, 8, 6]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.88} />
      </mesh>

      {/* ── Legs ── */}
      <mesh ref={leftLegRef}  position={[-0.12, 0.40, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.5, 5, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.75} />
      </mesh>
      <mesh ref={rightLegRef} position={[0.12,  0.40, 0]} castShadow>
        <capsuleGeometry args={[0.1, 0.5, 5, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.75} />
      </mesh>

      {/* ── Torso ── */}
      <mesh position={[0, 1.05, 0]} castShadow>
        <capsuleGeometry args={[0.21, 0.52, 7, 12]} />
        <meshStandardMaterial color={bodyColor} roughness={0.65} />
      </mesh>

      {/* ── Arms — skin tone ── */}
      <group ref={leftArmRef}  position={[-0.30, 1.05, 0]}>
        <mesh rotation={[0, 0, 0.36]} castShadow>
          <capsuleGeometry args={[0.074, 0.46, 5, 8]} />
          <meshStandardMaterial color={headColor} roughness={0.72} />
        </mesh>
      </group>
      <group ref={rightArmRef} position={[0.30, 1.05, 0]}>
        <mesh rotation={[0, 0, -0.36]} castShadow>
          <capsuleGeometry args={[0.074, 0.46, 5, 8]} />
          <meshStandardMaterial color={headColor} roughness={0.72} />
        </mesh>
      </group>

      {/* ── Neck ── */}
      <mesh position={[0, 1.40, 0]}>
        <cylinderGeometry args={[0.075, 0.09, 0.13, 7]} />
        <meshStandardMaterial color={headColor} roughness={0.65} />
      </mesh>

      {/* ── Head ── */}
      <mesh position={[0, 1.63, 0]} castShadow>
        <sphereGeometry args={[0.225, 16, 14]} />
        <meshStandardMaterial color={headColor} roughness={0.52} />
      </mesh>

      {/* ── Eye whites ── */}
      <mesh position={[-0.082, 1.662, 0.178]}>
        <sphereGeometry args={[0.052, 7, 6]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
      </mesh>
      <mesh position={[0.082, 1.662, 0.178]}>
        <sphereGeometry args={[0.052, 7, 6]} />
        <meshStandardMaterial color="#f0f0f0" roughness={0.9} />
      </mesh>

      {/* ── Pupils ── */}
      <mesh position={[-0.082, 1.660, 0.192]}>
        <sphereGeometry args={[0.034, 7, 6]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
      <mesh position={[0.082, 1.660, 0.192]}>
        <sphereGeometry args={[0.034, 7, 6]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.9} />
      </mesh>
    </>
  )
}
