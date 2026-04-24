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
  const leftArmRef  = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const walkT = useRef(0)

  useFrame((_, delta) => {
    const moving = movingRef?.current ?? false
    if (moving) walkT.current += delta * 9

    const swing = moving ? Math.sin(walkT.current) * 0.48 : 0
    const lerp = 0.25

    if (leftLegRef.current)  leftLegRef.current.rotation.x  += (swing  - leftLegRef.current.rotation.x)  * lerp
    if (rightLegRef.current) rightLegRef.current.rotation.x += (-swing - rightLegRef.current.rotation.x) * lerp
    if (leftArmRef.current)  leftArmRef.current.rotation.x  += (-swing * 0.55 - leftArmRef.current.rotation.x)  * lerp
    if (rightArmRef.current) rightArmRef.current.rotation.x += (swing  * 0.55 - rightArmRef.current.rotation.x) * lerp
  })

  return (
    <>
      <mesh ref={leftLegRef} position={[-0.13, 0.22, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.3, 6, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>
      <mesh ref={rightLegRef} position={[0.13, 0.22, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.3, 6, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.5, 8, 12]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      <mesh ref={leftArmRef} position={[-0.3, 0.82, 0]} rotation={[0, 0, 0.4]} castShadow>
        <capsuleGeometry args={[0.07, 0.4, 6, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>
      <mesh ref={rightArmRef} position={[0.3, 0.82, 0]} rotation={[0, 0, -0.4]} castShadow>
        <capsuleGeometry args={[0.07, 0.4, 6, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.42, 0]} castShadow>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshStandardMaterial color={headColor} roughness={0.6} />
      </mesh>
    </>
  )
}
