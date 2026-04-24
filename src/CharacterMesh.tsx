export function CharacterMesh({ bodyColor, headColor }: { bodyColor: string; headColor: string }) {
  return (
    <>
      <mesh position={[-0.13, 0.22, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.3, 6, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.13, 0.22, 0]} castShadow>
        <capsuleGeometry args={[0.09, 0.3, 6, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.85, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.5, 8, 12]} />
        <meshStandardMaterial color={bodyColor} roughness={0.7} />
      </mesh>
      <mesh position={[-0.3, 0.82, 0]} rotation={[0, 0, 0.4]} castShadow>
        <capsuleGeometry args={[0.07, 0.4, 6, 8]} />
        <meshStandardMaterial color={bodyColor} roughness={0.8} />
      </mesh>
      <mesh position={[0.3, 0.82, 0]} rotation={[0, 0, -0.4]} castShadow>
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
