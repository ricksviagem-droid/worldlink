import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'

// Route: Valentina picks up guests on the street and drops them at the reception arch
const STREET     = new THREE.Vector3(-5, 0, 34) // outside — street stop
const RECEPTION  = new THREE.Vector3(-5, 0, 19) // near welcome arch (z:17)
const SPEED      = 3.8  // units/s

type Phase = 'arriving' | 'unloading' | 'departing' | 'loading'

// Golf cart faces +Z by default (front = headlights = +Z side)
// Math.atan2(dir.x, dir.z) will correctly orient it toward movement direction
function BuggyBody({ wheelRefs }: { wheelRefs: React.RefObject<THREE.Mesh>[] }) {
  const white  = '#f4f2ec'
  const gold   = '#d4a017'
  const seat   = '#e4dcc8'
  const chrome = '#cccccc'

  return (
    <>
      {/* ─── Chassis ──────────────────────────────────────────────── */}
      <mesh position={[0, 0.46, 0]} castShadow>
        <boxGeometry args={[1.42, 0.7, 2.65]} />
        <meshStandardMaterial color={white} roughness={0.28} metalness={0.08} />
      </mesh>

      {/* Gold accent stripe */}
      <mesh position={[0, 0.68, 0]}>
        <boxGeometry args={[1.44, 0.06, 2.67]} />
        <meshStandardMaterial color={gold} metalness={0.85} roughness={0.1} />
      </mesh>

      {/* Front hood (raised engine/battery cover) */}
      <mesh position={[0, 0.65, 1.0]} castShadow>
        <boxGeometry args={[1.34, 0.32, 0.62]} />
        <meshStandardMaterial color={white} roughness={0.28} metalness={0.08} />
      </mesh>

      {/* ─── Roof canopy ─────────────────────────────────────────── */}
      <mesh position={[0, 1.12, -0.06]} castShadow>
        <boxGeometry args={[1.38, 0.07, 1.8]} />
        <meshStandardMaterial color="#f8f5e8" roughness={0.55} />
      </mesh>
      {/* Canopy front valance */}
      <mesh position={[0, 1.05, 0.92]}>
        <boxGeometry args={[1.38, 0.14, 0.06]} />
        <meshStandardMaterial color="#efe8cc" roughness={0.6} />
      </mesh>
      {/* Fringe */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[-0.62 + i * 0.138, 0.97, 0.94]}>
          <boxGeometry args={[0.06, 0.12, 0.03]} />
          <meshStandardMaterial color="#e8dfc0" roughness={0.8} />
        </mesh>
      ))}

      {/* Roof pillars (4 corners) — gold */}
      {([[-0.64, 0.62], [0.64, 0.62], [-0.64, -0.56], [0.64, -0.56]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 0.86, z]} castShadow>
          <boxGeometry args={[0.06, 0.56, 0.06]} />
          <meshStandardMaterial color={gold} metalness={0.8} roughness={0.15} />
        </mesh>
      ))}

      {/* ─── Windshield ──────────────────────────────────────────── */}
      <mesh position={[0, 0.86, 0.68]} rotation={[-0.32, 0, 0]}>
        <boxGeometry args={[1.26, 0.48, 0.05]} />
        <meshStandardMaterial color="#b3e5fc" transparent opacity={0.5} roughness={0.05} />
      </mesh>

      {/* ─── Seats (front = +Z, driver = −X / left side) ─────────── */}
      {/* Front seats */}
      <mesh position={[-0.32, 0.79, 0.34]}>
        <boxGeometry args={[0.46, 0.1, 0.48]} />
        <meshStandardMaterial color={seat} roughness={0.7} />
      </mesh>
      <mesh position={[0.32, 0.79, 0.34]}>
        <boxGeometry args={[0.46, 0.1, 0.48]} />
        <meshStandardMaterial color={seat} roughness={0.7} />
      </mesh>
      {/* Front seat backrests */}
      <mesh position={[-0.32, 0.99, 0.08]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.46, 0.38, 0.08]} />
        <meshStandardMaterial color="#d8d0bc" roughness={0.7} />
      </mesh>
      <mesh position={[0.32, 0.99, 0.08]} rotation={[0.08, 0, 0]}>
        <boxGeometry args={[0.46, 0.38, 0.08]} />
        <meshStandardMaterial color="#d8d0bc" roughness={0.7} />
      </mesh>

      {/* Back seats */}
      <mesh position={[-0.32, 0.79, -0.48]}>
        <boxGeometry args={[0.46, 0.1, 0.46]} />
        <meshStandardMaterial color={seat} roughness={0.7} />
      </mesh>
      <mesh position={[0.32, 0.79, -0.48]}>
        <boxGeometry args={[0.46, 0.1, 0.46]} />
        <meshStandardMaterial color={seat} roughness={0.7} />
      </mesh>
      {/* Back seat backrests */}
      <mesh position={[-0.32, 0.99, -0.74]} rotation={[-0.08, 0, 0]}>
        <boxGeometry args={[0.46, 0.38, 0.08]} />
        <meshStandardMaterial color="#d8d0bc" roughness={0.7} />
      </mesh>
      <mesh position={[0.32, 0.99, -0.74]} rotation={[-0.08, 0, 0]}>
        <boxGeometry args={[0.46, 0.38, 0.08]} />
        <meshStandardMaterial color="#d8d0bc" roughness={0.7} />
      </mesh>

      {/* ─── Steering wheel (driver = front-left) ────────────────── */}
      <mesh position={[-0.32, 0.98, 0.6]} rotation={[-0.4, 0, 0]}>
        <torusGeometry args={[0.13, 0.024, 8, 24]} />
        <meshStandardMaterial color="#111" roughness={0.5} />
      </mesh>
      {/* Steering column */}
      <mesh position={[-0.32, 0.92, 0.64]} rotation={[-0.4, 0, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.28, 7]} />
        <meshStandardMaterial color="#333" />
      </mesh>

      {/* ─── Wheels (axis = X, roll in Z) ────────────────────────── */}
      {([
        [-0.8, 0.22,  0.9],   // front-left
        [ 0.8, 0.22,  0.9],   // front-right
        [-0.8, 0.22, -0.9],   // back-left
        [ 0.8, 0.22, -0.9],   // back-right
      ] as [number, number, number][]).map((p, i) => (
        <group key={i} position={p}>
          <mesh ref={wheelRefs[i]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.22, 0.22, 0.14, 16]} />
            <meshStandardMaterial color="#111" roughness={0.92} />
          </mesh>
          {/* Rim */}
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.12, 0.12, 0.16, 10]} />
            <meshStandardMaterial color="#aaa" metalness={0.65} roughness={0.25} />
          </mesh>
          {/* Hubcap accent */}
          <mesh position={[i % 2 === 0 ? -0.085 : 0.085, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.065, 0.065, 0.02, 8]} />
            <meshStandardMaterial color={gold} metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      ))}

      {/* ─── Bumpers ─────────────────────────────────────────────── */}
      <mesh position={[0, 0.32,  1.35]} castShadow>
        <boxGeometry args={[1.44, 0.24, 0.07]} />
        <meshStandardMaterial color={chrome} metalness={0.75} roughness={0.18} />
      </mesh>
      <mesh position={[0, 0.32, -1.35]} castShadow>
        <boxGeometry args={[1.44, 0.24, 0.07]} />
        <meshStandardMaterial color={chrome} metalness={0.75} roughness={0.18} />
      </mesh>

      {/* ─── Headlights ──────────────────────────────────────────── */}
      <mesh position={[-0.54, 0.5, 1.33]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#ffffee" emissive="#ffffaa" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0.54, 0.5, 1.33]}>
        <sphereGeometry args={[0.09, 8, 8]} />
        <meshStandardMaterial color="#ffffee" emissive="#ffffaa" emissiveIntensity={0.7} />
      </mesh>

      {/* ─── Taillights ──────────────────────────────────────────── */}
      <mesh position={[-0.54, 0.5, -1.33]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff0000" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0.54, 0.5, -1.33]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#ff2200" emissive="#ff0000" emissiveIntensity={0.6} />
      </mesh>

      {/* ─── Valentina — driver (front-left seat) ────────────────── */}
      <mesh position={[-0.32, 1.04, 0.34]} castShadow>
        <capsuleGeometry args={[0.12, 0.28, 6, 8]} />
        <meshStandardMaterial color="#f4a0c0" roughness={0.7} />
      </mesh>
      <mesh position={[-0.32, 1.4, 0.34]} castShadow>
        <sphereGeometry args={[0.155, 10, 10]} />
        <meshStandardMaterial color="#d88060" roughness={0.65} />
      </mesh>
      {/* Hair */}
      <mesh position={[-0.32, 1.56, 0.3]}>
        <sphereGeometry args={[0.14, 8, 8]} />
        <meshStandardMaterial color="#3a1a08" roughness={0.9} />
      </mesh>

      {/* ─── Passenger — back-right seat ─────────────────────────── */}
      <mesh position={[0.32, 1.02, -0.48]} castShadow>
        <capsuleGeometry args={[0.11, 0.24, 6, 8]} />
        <meshStandardMaterial color="#5a92e8" roughness={0.7} />
      </mesh>
      <mesh position={[0.32, 1.35, -0.48]} castShadow>
        <sphereGeometry args={[0.14, 10, 10]} />
        <meshStandardMaterial color="#c8a47a" roughness={0.65} />
      </mesh>

      {/* ─── "CASA BLANCA" branding badge ─────────────────────────── */}
      <mesh position={[0, 0.68, 1.33]}>
        <boxGeometry args={[0.82, 0.18, 0.04]} />
        <meshStandardMaterial color={gold} metalness={0.7} roughness={0.2} />
      </mesh>
    </>
  )
}

export function ValentinaBuggy() {
  const groupRef  = useRef<THREE.Group>(null)
  const posRef    = useRef(STREET.clone())
  const phase     = useRef<Phase>('loading')
  const waitTimer = useRef(6.0)   // start after initial load wait
  const wheelRefs = [
    useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null), useRef<THREE.Mesh>(null),
  ] as React.RefObject<THREE.Mesh>[]

  useFrame((_, delta) => {
    if (!groupRef.current) return

    const moving = phase.current === 'arriving' || phase.current === 'departing'

    if (moving) {
      const target = phase.current === 'arriving' ? RECEPTION : STREET
      const dir    = new THREE.Vector3().subVectors(target, posRef.current)
      const dist   = dir.length()

      if (dist < 0.18) {
        posRef.current.copy(target)
        phase.current   = phase.current === 'arriving' ? 'unloading' : 'loading'
        waitTimer.current = 0
      } else {
        const step = Math.min(dist, delta * SPEED)
        posRef.current.addScaledVector(dir.normalize(), step)
        groupRef.current.rotation.y = Math.atan2(dir.x, dir.z)

        // Roll wheels (rotate around their local X = world X here since group.rotation.y is set)
        wheelRefs.forEach(r => {
          if (r.current) r.current.rotation.x += delta * SPEED * 2.8 * (phase.current === 'arriving' ? -1 : 1)
        })
      }
    } else {
      waitTimer.current += delta
      const waitTime = phase.current === 'unloading' ? 5.5 : 8.0
      if (waitTimer.current >= waitTime) {
        phase.current = phase.current === 'unloading' ? 'departing' : 'arriving'
      }
    }

    groupRef.current.position.copy(posRef.current)
  })

  return (
    <group ref={groupRef} position={STREET.toArray()}>
      <BuggyBody wheelRefs={wheelRefs} />
    </group>
  )
}
