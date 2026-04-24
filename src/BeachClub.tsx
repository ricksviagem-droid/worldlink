import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'

function Ground() {
  return (
    <>
      {/* Main club floor — warm sand */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, -5]}>
        <planeGeometry args={[90, 70]} />
        <meshStandardMaterial color="#e8d590" roughness={0.9} />
      </mesh>
      {/* Beach strip — lighter fine sand */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0.003, -37]}>
        <planeGeometry args={[90, 24]} />
        <meshStandardMaterial color="#f2e8b0" roughness={0.95} />
      </mesh>
      {/* Ocean seabed */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.4, -64]}>
        <planeGeometry args={[130, 36]} />
        <meshStandardMaterial color="#155a8a" roughness={0.5} />
      </mesh>
    </>
  )
}

function Ocean() {
  const waterRef = useRef<THREE.MeshStandardMaterial>(null)
  const foamRef  = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    if (waterRef.current) {
      waterRef.current.color.setHSL(0.575 + Math.sin(t * 0.25) * 0.018, 0.82, 0.38 + Math.sin(t * 0.45) * 0.04)
      waterRef.current.opacity = 0.92 + Math.sin(t * 0.7) * 0.04
    }
    if (foamRef.current) {
      foamRef.current.opacity = 0.45 + Math.sin(t * 1.2) * 0.2
    }
  })

  return (
    <group>
      {/* Deep ocean surface */}
      <mesh position={[0, -0.3, -64]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[130, 36]} />
        <meshStandardMaterial
          ref={waterRef} color="#0a72b8"
          transparent opacity={0.93}
          roughness={0.08} metalness={0.25}
        />
      </mesh>
      {/* Shore water — shallow turquoise */}
      <mesh position={[0, -0.08, -49]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 7]} />
        <meshStandardMaterial color="#3ec8dc" transparent opacity={0.55} roughness={0.15} />
      </mesh>
      {/* Wave foam line */}
      <mesh position={[0, -0.05, -48]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[90, 2.5]} />
        <meshStandardMaterial ref={foamRef} color="#ffffff" transparent opacity={0.5} roughness={0.9} />
      </mesh>
    </group>
  )
}

function Pool() {
  const waterRef = useRef<THREE.MeshStandardMaterial>(null)

  useFrame(({ clock }) => {
    if (!waterRef.current) return
    const t = clock.elapsedTime
    waterRef.current.color.setHSL(0.535 + Math.sin(t * 0.32) * 0.02, 0.82, 0.50 + Math.sin(t * 0.58) * 0.04)
    waterRef.current.opacity = 0.86 + Math.sin(t * 0.85) * 0.05
  })

  const rim = '#c4b49a'
  const deck = '#d8ccb8'

  return (
    <group>
      {/* Tile deck around pool */}
      <mesh position={[0, 0.01, -10]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 14]} />
        <meshStandardMaterial color={deck} roughness={0.55} />
      </mesh>

      {/* Pool bottom (deep look) */}
      <mesh position={[0, 0.02, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 8]} />
        <meshStandardMaterial color="#0b4d7a" roughness={0.45} />
      </mesh>

      {/* Pool rim — 4 sides */}
      <mesh position={[0,    0.27, -5.95]}  castShadow><boxGeometry args={[11.6, 0.44, 0.2]} /><meshStandardMaterial color={rim} roughness={0.5} /></mesh>
      <mesh position={[0,    0.27, -14.05]} castShadow><boxGeometry args={[11.6, 0.44, 0.2]} /><meshStandardMaterial color={rim} roughness={0.5} /></mesh>
      <mesh position={[5.9,  0.27, -10]}    castShadow><boxGeometry args={[0.2,  0.44, 8.3]} /><meshStandardMaterial color={rim} roughness={0.5} /></mesh>
      <mesh position={[-5.9, 0.27, -10]}    castShadow><boxGeometry args={[0.2,  0.44, 8.3]} /><meshStandardMaterial color={rim} roughness={0.5} /></mesh>

      {/* Water surface */}
      <mesh position={[0, 0.2, -10]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[11, 8]} />
        <meshStandardMaterial
          ref={waterRef} color="#18c8ea"
          transparent opacity={0.88}
          roughness={0.05} metalness={0.18}
        />
      </mesh>

      {/* Pool steps (NE corner) */}
      <mesh position={[4.5, 0.08, -6.5]}>
        <boxGeometry args={[1.3, 0.14, 1.3]} />
        <meshStandardMaterial color={rim} roughness={0.5} />
      </mesh>
      <mesh position={[4.5, 0.15, -6.5]}>
        <boxGeometry args={[0.95, 0.13, 0.95]} />
        <meshStandardMaterial color={rim} roughness={0.5} />
      </mesh>

      {/* Pool underwater light glow */}
      <pointLight position={[0, 0.15, -10]} intensity={8} distance={14} color="#00ddee" decay={2} />
    </group>
  )
}

function Bar() {
  return (
    <group position={[16, 0, -4]}>
      {/* Counter body */}
      <mesh position={[0, 0.56, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.35, 1.12, 11.2]} />
        <meshStandardMaterial color="#7a4818" roughness={0.65} />
      </mesh>
      {/* Counter top — dark marble */}
      <mesh position={[0, 1.18, 0]} castShadow>
        <boxGeometry args={[1.65, 0.1, 11.6]} />
        <meshStandardMaterial color="#2a1808" roughness={0.25} metalness={0.1} />
      </mesh>
      {/* Back-bar shelving */}
      <mesh position={[0.76, 1.7, 0]} castShadow>
        <boxGeometry args={[0.2, 1.22, 10.8]} />
        <meshStandardMaterial color="#4e2c0a" roughness={0.7} />
      </mesh>
      {[1.32, 1.72, 2.12].map((y, i) => (
        <mesh key={i} position={[0.76, y, 0]}>
          <boxGeometry args={[0.22, 0.04, 10.7]} />
          <meshStandardMaterial color="#2a1408" roughness={0.4} />
        </mesh>
      ))}
      {/* Bottles */}
      {([-4, -2.8, -1.6, -0.4, 0.8, 2.0, 3.2] as number[]).map((z, i) => (
        <mesh key={i} position={[0.7, 1.55, z]}>
          <cylinderGeometry args={[0.055, 0.065, 0.34, 8]} />
          <meshStandardMaterial
            color={(['#1a9944','#cc3318','#1a44cc','#cc7a18','#882acc','#18ccbb','#cc4488'] as string[])[i]}
            transparent opacity={0.82} roughness={0.15}
          />
        </mesh>
      ))}
      {/* Bar stools */}
      {([-4, -2, 0, 2, 4] as number[]).map((z, i) => (
        <group key={i} position={[-0.92, 0, z]}>
          <mesh position={[0, 0.68, 0]}>
            <cylinderGeometry args={[0.19, 0.19, 0.07, 12]} />
            <meshStandardMaterial color="#999" metalness={0.55} roughness={0.35} />
          </mesh>
          <mesh position={[0, 0.34, 0]}>
            <cylinderGeometry args={[0.035, 0.035, 0.65, 8]} />
            <meshStandardMaterial color="#bbb" metalness={0.75} roughness={0.2} />
          </mesh>
          <mesh position={[0, 0.07, 0]}>
            <cylinderGeometry args={[0.17, 0.21, 0.08, 10]} />
            <meshStandardMaterial color="#888" metalness={0.55} />
          </mesh>
        </group>
      ))}
      {/* Under-counter LED strip */}
      <mesh position={[-0.76, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.05, 11]} />
        <meshStandardMaterial color="#ff8800" emissive="#ff5500" emissiveIntensity={0.6} />
      </mesh>
    </group>
  )
}

function PalmTree({ position, lean = 0, seed = 0 }: {
  position: [number, number, number]
  lean?: number
  seed?: number
}) {
  const treeRef = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    if (!treeRef.current) return
    const t = clock.elapsedTime * 0.26 + seed * 1.9
    treeRef.current.rotation.z = Math.sin(t) * 0.020
    treeRef.current.rotation.x = Math.sin(t * 0.65 + 1.3) * 0.012
  })
  return (
    <group ref={treeRef} position={position}>
      {/* Lower trunk — wide base tapering */}
      <mesh position={[lean * 0.03, 1.85, lean * 0.015]} rotation={[lean * 0.03, 0, lean * 0.048 * 0.55]} castShadow>
        <cylinderGeometry args={[0.17, 0.30, 3.7, 8]} />
        <meshStandardMaterial color="#7a5c1e" roughness={0.92} />
      </mesh>
      {/* Upper trunk — thinner, lean increases */}
      <mesh position={[lean * 0.078, 4.55, lean * 0.039]} rotation={[lean * 0.028, 0, lean * 0.048 * 0.90]} castShadow>
        <cylinderGeometry args={[0.12, 0.17, 2.0, 8]} />
        <meshStandardMaterial color="#8a6824" roughness={0.90} />
      </mesh>
      {/* Bark rings */}
      {[0.7, 1.5, 2.3, 3.1, 3.9, 4.7].map((y, i) => (
        <mesh key={i} position={[lean * 0.08 * (y / 5.6), y, lean * 0.04 * (y / 5.6)]}>
          <torusGeometry args={[0.21 - i * 0.012, 0.025, 4, 8]} />
          <meshStandardMaterial color="#6a4812" roughness={0.96} />
        </mesh>
      ))}
      {/* Coconut cluster at crown base */}
      {[0, 1, 2].map(i => (
        <mesh key={i} position={[lean * 0.08 + Math.cos(i * 2.1 + seed) * 0.13, 5.38, lean * 0.04 + Math.sin(i * 2.1 + seed) * 0.13]}>
          <sphereGeometry args={[0.095, 7, 6]} />
          <meshStandardMaterial color="#5a3a10" roughness={0.8} />
        </mesh>
      ))}
      {/* Fronds — 9 arching leaves drooping from crown */}
      {Array.from({ length: 9 }, (_, i) => {
        const angle = (i / 9) * Math.PI * 2 + seed * 0.42
        const droop = -0.58 - (i % 3) * 0.13
        const length = 1.9 + (i % 3) * 0.28
        const green = i % 2 === 0 ? '#2a8f3a' : '#32a044'
        return (
          <group key={i} position={[lean * 0.08, 5.5, lean * 0.04]} rotation={[0, angle, droop]}>
            {/* Rachis (frond stem + body) */}
            <mesh position={[0, length * 0.52, 0]} scale={[0.36, 1, 0.20]}>
              <capsuleGeometry args={[0.11, length, 4, 8]} />
              <meshStandardMaterial color={green} roughness={0.70} />
            </mesh>
            {/* Leaflets — left */}
            {[0.35, 0.65, 0.90, 1.15].map((t, li) => (
              <mesh key={li}
                position={[-0.18, length * t * 0.95, 0]}
                rotation={[0, 0, -0.55 - t * 0.2]}
                scale={[1, 0.55 - t * 0.08, 0.16]}
              >
                <capsuleGeometry args={[0.06, 0.46, 3, 6]} />
                <meshStandardMaterial color={green} roughness={0.72} />
              </mesh>
            ))}
            {/* Leaflets — right */}
            {[0.35, 0.65, 0.90, 1.15].map((t, li) => (
              <mesh key={li + 10}
                position={[0.18, length * t * 0.95, 0]}
                rotation={[0, 0, 0.55 + t * 0.2]}
                scale={[1, 0.55 - t * 0.08, 0.16]}
              >
                <capsuleGeometry args={[0.06, 0.46, 3, 6]} />
                <meshStandardMaterial color={i % 2 === 0 ? '#288038' : '#309840'} roughness={0.72} />
              </mesh>
            ))}
          </group>
        )
      })}
    </group>
  )
}

function Sunbed({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  const towelColors = ['#2277cc', '#cc3333', '#f0bb20', '#22aa66', '#cc44aa', '#4488cc', '#e05522']
  const ci = Math.abs(Math.floor(position[0] * 3 + position[2])) % towelColors.length
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Frame */}
      <mesh position={[0, 0.23, 0]} castShadow>
        <boxGeometry args={[0.7, 0.07, 2.08]} />
        <meshStandardMaterial color="#ccc0a0" roughness={0.65} />
      </mesh>
      {/* Reclining back */}
      <mesh position={[0, 0.34, 0.87]} rotation={[-0.26, 0, 0]}>
        <boxGeometry args={[0.62, 0.09, 0.44]} />
        <meshStandardMaterial color="#bfb898" roughness={0.65} />
      </mesh>
      {/* Towel */}
      <mesh position={[0, 0.28, -0.08]}>
        <boxGeometry args={[0.62, 0.04, 1.52]} />
        <meshStandardMaterial color={towelColors[ci]} roughness={0.9} />
      </mesh>
      {/* Legs */}
      {([[-0.29, 0.12, 0.76], [0.29, 0.12, 0.76], [-0.29, 0.12, -0.76], [0.29, 0.12, -0.76]] as [number, number, number][]).map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.05, 0.24, 0.05]} />
          <meshStandardMaterial color="#a89878" roughness={0.7} />
        </mesh>
      ))}
    </group>
  )
}

function Umbrella({ position, color }: { position: [number, number, number]; color: string }) {
  const fringeAngles = Array.from({ length: 12 }, (_, i) => (i / 12) * 360)
  return (
    <group position={position}>
      <mesh position={[0, 1.65, 0]} castShadow>
        <cylinderGeometry args={[0.028, 0.028, 3.3, 7]} />
        <meshStandardMaterial color="#b8a880" roughness={0.75} />
      </mesh>
      <mesh position={[0, 3.22, 0]} castShadow>
        <coneGeometry args={[2.05, 0.72, 14]} />
        <meshStandardMaterial color={color} side={THREE.DoubleSide} roughness={0.72} />
      </mesh>
      {/* Fringe */}
      {fringeAngles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        return (
          <mesh key={i} position={[Math.cos(rad) * 1.82, 2.88, Math.sin(rad) * 1.82]}>
            <boxGeometry args={[0.11, 0.2, 0.03]} />
            <meshStandardMaterial color={color} roughness={0.8} />
          </mesh>
        )
      })}
    </group>
  )
}

function TikiTorch({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.35, 0]} castShadow>
        <cylinderGeometry args={[0.038, 0.058, 2.7, 6]} />
        <meshStandardMaterial color="#7a5218" roughness={0.92} />
      </mesh>
      <mesh position={[0, 2.75, 0]}>
        <cylinderGeometry args={[0.13, 0.09, 0.28, 8]} />
        <meshStandardMaterial color="#503510" roughness={0.85} />
      </mesh>
      <mesh position={[0, 2.88, 0]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#ff7700" emissive="#ff4400" emissiveIntensity={1.0} />
      </mesh>
      <pointLight position={[0, 2.9, 0]} intensity={4} distance={7} color="#ff8800" decay={2} />
    </group>
  )
}

function DJBooth() {
  return (
    <group position={[0, 0, -20]}>
      {/* Raised stage — dark polished wood */}
      <mesh position={[0, 0.13, 0]} castShadow receiveShadow>
        <boxGeometry args={[9.5, 0.26, 3.5]} />
        <meshStandardMaterial color="#2a1a0e" roughness={0.45} metalness={0.05} />
      </mesh>
      {/* Stage LED edge front — warm amber */}
      <mesh position={[0, 0.27, 1.75]}>
        <boxGeometry args={[9.5, 0.05, 0.06]} />
        <meshStandardMaterial color="#ffcc44" emissive="#ff9900" emissiveIntensity={1.2} />
      </mesh>
      {/* Stage LED sides */}
      <mesh position={[-4.75, 0.27, 0]}>
        <boxGeometry args={[0.06, 0.05, 3.5]} />
        <meshStandardMaterial color="#ffcc44" emissive="#ff9900" emissiveIntensity={1.2} />
      </mesh>
      <mesh position={[4.75, 0.27, 0]}>
        <boxGeometry args={[0.06, 0.05, 3.5]} />
        <meshStandardMaterial color="#ffcc44" emissive="#ff9900" emissiveIntensity={1.2} />
      </mesh>
      {/* Console — dark cedar wood */}
      <mesh position={[0, 0.72, -0.4]} castShadow>
        <boxGeometry args={[7.2, 1.18, 2.4]} />
        <meshStandardMaterial color="#1e1410" roughness={0.5} metalness={0.04} />
      </mesh>
      <mesh position={[0, 1.34, -0.72]} castShadow>
        <boxGeometry args={[6.4, 0.28, 1.5]} />
        <meshStandardMaterial color="#150e08" roughness={0.35} metalness={0.08} />
      </mesh>
      {/* Screens — warm teal/coral beach vibes */}
      {([-2.4, 0, 2.4] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 1.86, -1.1]}>
          <boxGeometry args={[1.6, 0.82, 0.06]} />
          <meshStandardMaterial
            color="#0a1218"
            emissive={(['#007788','#cc5500','#006644'] as string[])[i]}
            emissiveIntensity={0.85}
          />
        </mesh>
      ))}
      {/* Speaker stacks */}
      {([-4.5, 4.5] as number[]).map((x, i) => (
        <group key={i} position={[x, 0, -0.5]}>
          <mesh position={[0, 1.08, 0]} castShadow>
            <boxGeometry args={[0.95, 2.3, 0.88]} />
            <meshStandardMaterial color="#181210" roughness={0.6} />
          </mesh>
          <mesh position={[0, 1.08, 0.44]}>
            <boxGeometry args={[0.72, 1.9, 0.03]} />
            <meshStandardMaterial color="#282018" roughness={0.85} />
          </mesh>
        </group>
      ))}
      {/* Floor — dark parquet */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.5, 3]} />
        <meshStandardMaterial color="#16100a" roughness={0.65} />
      </mesh>
    </group>
  )
}

function WaveAnimation() {
  const refs = [
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
    useRef<THREE.Mesh>(null),
  ]
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const speed = 2.8
    refs.forEach((r, i) => {
      if (!r.current) return
      r.current.position.z = -56 + ((t * speed + i * 3) % 9)
      const prog = (r.current.position.z + 56) / 9
      const mat = r.current.material as THREE.MeshStandardMaterial
      mat.opacity = 0.18 + prog * 0.28
    })
  })
  return (
    <>
      {refs.map((r, i) => (
        <mesh key={i} ref={r} position={[0, 0.03, -56 + i * 3]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[90, 2.2]} />
          <meshStandardMaterial color="#aaddee" transparent opacity={0.25} roughness={0.2} />
        </mesh>
      ))}
    </>
  )
}

function ThatchKiosk({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Support posts */}
      {([[-1, -0.8], [1, -0.8], [-1, 0.8], [1, 0.8]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 1.3, z]} castShadow>
          <cylinderGeometry args={[0.07, 0.09, 2.6, 7]} />
          <meshStandardMaterial color="#7a5218" roughness={0.85} />
        </mesh>
      ))}
      {/* Thatch cone roof — semi-transparent so guests visible from top view */}
      <mesh position={[0, 2.7, 0]}>
        <coneGeometry args={[2.1, 0.95, 8]} />
        <meshStandardMaterial color="#c8a060" roughness={0.9} side={THREE.DoubleSide} transparent opacity={0.52} />
      </mesh>
      {/* Fringe */}
      {Array.from({ length: 10 }, (_, i) => {
        const angle = (i / 10) * Math.PI * 2
        return (
          <mesh key={i} position={[Math.cos(angle) * 1.8, 2.27, Math.sin(angle) * 1.8]}>
            <boxGeometry args={[0.1, 0.24, 0.07]} />
            <meshStandardMaterial color="#a07030" roughness={0.9} />
          </mesh>
        )
      })}
      {/* Round kiosk counter */}
      <mesh position={[0, 0.52, 0]} castShadow>
        <cylinderGeometry args={[0.68, 0.68, 1.04, 10]} />
        <meshStandardMaterial color="#8a5a20" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.06, 0]}>
        <cylinderGeometry args={[0.78, 0.78, 0.09, 10]} />
        <meshStandardMaterial color="#5a3010" roughness={0.4} metalness={0.05} />
      </mesh>
    </group>
  )
}

function BeachRestaurant() {
  return (
    <group position={[-17, 0, -18]}>
      {/* Deck floor */}
      <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[10, 7.5]} />
        <meshStandardMaterial color="#c8aa7a" roughness={0.72} />
      </mesh>
      {/* Deck border */}
      <mesh position={[0, 0.07, 3.75]}>
        <boxGeometry args={[10.2, 0.1, 0.14]} />
        <meshStandardMaterial color="#a08050" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.07, -3.75]}>
        <boxGeometry args={[10.2, 0.1, 0.14]} />
        <meshStandardMaterial color="#a08050" roughness={0.7} />
      </mesh>

      {/* 6 roof support posts */}
      {([[-4, -3], [0, -3], [4, -3], [-4, 3], [0, 3], [4, 3]] as [number, number][]).map(([x, z], i) => (
        <mesh key={i} position={[x, 1.7, z]} castShadow>
          <cylinderGeometry args={[0.1, 0.13, 3.4, 8]} />
          <meshStandardMaterial color="#7a5218" roughness={0.82} />
        </mesh>
      ))}
      {/* Thatch roof — two overlapping layers for thickness */}
      <mesh position={[0, 3.4, 0]} castShadow>
        <boxGeometry args={[10.6, 0.18, 8.0]} />
        <meshStandardMaterial color="#b88c48" roughness={0.9} />
      </mesh>
      {/* Thatch texture strips */}
      {Array.from({ length: 7 }, (_, i) => (
        <mesh key={i} position={[0, 3.5, -3.0 + i * 1.0]}>
          <boxGeometry args={[10.4, 0.12, 0.16]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#a07838' : '#b88c48'} roughness={0.92} />
        </mesh>
      ))}
      {/* Roof fringe front */}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[-4.5 + i * 0.72, 3.3, 4.1]}>
          <boxGeometry args={[0.14, 0.28, 0.09]} />
          <meshStandardMaterial color="#9a7030" roughness={0.92} />
        </mesh>
      ))}
      {/* Roof fringe back */}
      {Array.from({ length: 14 }, (_, i) => (
        <mesh key={i} position={[-4.5 + i * 0.72, 3.3, -4.1]}>
          <boxGeometry args={[0.14, 0.28, 0.09]} />
          <meshStandardMaterial color="#9a7030" roughness={0.92} />
        </mesh>
      ))}

      {/* Bar counter along back wall */}
      <mesh position={[0, 0.57, -3.0]} castShadow>
        <boxGeometry args={[8.5, 1.14, 0.75]} />
        <meshStandardMaterial color="#7a4818" roughness={0.65} />
      </mesh>
      <mesh position={[0, 1.18, -3.0]}>
        <boxGeometry args={[8.8, 0.1, 0.98]} />
        <meshStandardMaterial color="#2a1808" roughness={0.25} metalness={0.1} />
      </mesh>

      {/* Restaurant tables */}
      {([[-3, 0.5], [0, 0.5], [3, 0.5], [-1.5, -1.5], [1.5, -1.5]] as [number, number][]).map(([x, z], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, 0.72, 0]}>
            <cylinderGeometry args={[0.52, 0.52, 0.07, 10]} />
            <meshStandardMaterial color="#d4caa0" roughness={0.6} />
          </mesh>
          <mesh position={[0, 0.37, 0]}>
            <cylinderGeometry args={[0.04, 0.06, 0.74, 6]} />
            <meshStandardMaterial color="#a08060" roughness={0.75} />
          </mesh>
          {/* Chairs */}
          {([[0.75, 0], [-0.75, 0], [0, 0.75], [0, -0.75]] as [number, number][]).map(([cx, cz], ci) => (
            <group key={ci} position={[cx, 0, cz]} rotation={[0, Math.atan2(-cx, -cz), 0]}>
              <mesh position={[0, 0.38, 0]}>
                <cylinderGeometry args={[0.22, 0.22, 0.06, 8]} />
                <meshStandardMaterial color="#e8dcc8" roughness={0.7} />
              </mesh>
              <mesh position={[0, 0.22, 0]}>
                <cylinderGeometry args={[0.025, 0.025, 0.44, 6]} />
                <meshStandardMaterial color="#aaa090" roughness={0.7} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* Guests */}
      <mesh position={[-3, 0.88, 0.5]} castShadow>
        <capsuleGeometry args={[0.13, 0.3, 4, 8]} />
        <meshStandardMaterial color="#5a6aaa" roughness={0.7} />
      </mesh>
      <mesh position={[-3, 1.35, 0.5]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#c8a07a" roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.88, 0.5]} castShadow>
        <capsuleGeometry args={[0.13, 0.3, 4, 8]} />
        <meshStandardMaterial color="#aa5a5a" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.35, 0.5]}>
        <sphereGeometry args={[0.18, 10, 10]} />
        <meshStandardMaterial color="#d4a08a" roughness={0.65} />
      </mesh>

      {/* Restaurant sign */}
      <mesh position={[0, 3.58, -3.02]}>
        <boxGeometry args={[4.5, 0.55, 0.1]} />
        <meshStandardMaterial color="#d4a017" metalness={0.5} roughness={0.4} />
      </mesh>
      <pointLight position={[0, 2.8, -2]} intensity={5} distance={10} color="#ffcc88" decay={2} />
    </group>
  )
}

function BoundaryWalls() {
  const stucco = '#f5efe0'
  const cap    = '#d4c8a0'
  const wH = 2.6
  const wT = 0.4
  const mid = -7  // center of z range: -48 to 35 → center at -6.5
  const len = 84
  return (
    <>
      {/* East wall */}
      <mesh position={[31.5, wH / 2, mid]} castShadow receiveShadow>
        <boxGeometry args={[wT, wH, len]} />
        <meshStandardMaterial color={stucco} roughness={0.78} />
      </mesh>
      <mesh position={[31.5, wH, mid]}>
        <boxGeometry args={[wT + 0.14, 0.14, len]} />
        <meshStandardMaterial color={cap} roughness={0.55} />
      </mesh>
      {/* West wall */}
      <mesh position={[-31.5, wH / 2, mid]} castShadow receiveShadow>
        <boxGeometry args={[wT, wH, len]} />
        <meshStandardMaterial color={stucco} roughness={0.78} />
      </mesh>
      <mesh position={[-31.5, wH, mid]}>
        <boxGeometry args={[wT + 0.14, 0.14, len]} />
        <meshStandardMaterial color={cap} roughness={0.55} />
      </mesh>
      {/* North wall (behind street/parking) */}
      <mesh position={[0, wH / 2, 35.5]} castShadow receiveShadow>
        <boxGeometry args={[63.4, wH, wT]} />
        <meshStandardMaterial color={stucco} roughness={0.78} />
      </mesh>
      <mesh position={[0, wH, 35.5]}>
        <boxGeometry args={[63.8, 0.14, wT + 0.14]} />
        <meshStandardMaterial color={cap} roughness={0.55} />
      </mesh>
    </>
  )
}

function BackgroundCustomer({ position, color, rotation = 0 }: {
  position: [number, number, number]; color: string; rotation?: number
}) {
  const HAIR = ['#1a0c04','#2a1208','#8a5a2a','#c09060','#3a2010','#0a0808']
  const SKIN = ['#c8a07a','#d4a88a','#b87858','#e8c4a0','#a06040','#f0d0b0']
  const hi = Math.abs(Math.floor(position[0] * 7.3 + position[2] * 3.1)) % HAIR.length
  const si = Math.abs(Math.floor(position[0] * 5.1 + position[2] * 11.7)) % SKIN.length
  const hairColor = HAIR[hi]
  const headColor = SKIN[si]
  const pantsColor = '#1e2a3a'

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Legs */}
      <mesh position={[-0.10, 0.52, 0]}>
        <capsuleGeometry args={[0.075, 0.70, 4, 8]} />
        <meshStandardMaterial color={pantsColor} roughness={0.55} />
      </mesh>
      <mesh position={[0.10, 0.52, 0]}>
        <capsuleGeometry args={[0.075, 0.70, 4, 8]} />
        <meshStandardMaterial color={pantsColor} roughness={0.55} />
      </mesh>
      {/* Torso */}
      <mesh position={[0, 1.14, 0]}>
        <capsuleGeometry args={[0.155, 0.36, 6, 12]} />
        <meshStandardMaterial color={color} roughness={0.50} />
      </mesh>
      {/* Arms */}
      <mesh position={[-0.235, 1.08, 0]} rotation={[0.1, 0, 0.28]}>
        <capsuleGeometry args={[0.052, 0.50, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.52} />
      </mesh>
      <mesh position={[0.235, 1.08, 0]} rotation={[0.1, 0, -0.28]}>
        <capsuleGeometry args={[0.052, 0.50, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.52} />
      </mesh>
      {/* Neck */}
      <mesh position={[0, 1.43, 0]}>
        <cylinderGeometry args={[0.058, 0.072, 0.10, 8]} />
        <meshStandardMaterial color={headColor} roughness={0.42} />
      </mesh>
      {/* Head */}
      <mesh position={[0, 1.585, 0]}>
        <sphereGeometry args={[0.170, 16, 12]} />
        <meshStandardMaterial color={headColor} roughness={0.38} />
      </mesh>
      {/* Hair */}
      <mesh position={[0, 1.655, -0.015]} scale={[1.02, 0.68, 1.02]}>
        <sphereGeometry args={[0.172, 14, 10]} />
        <meshStandardMaterial color={hairColor} roughness={0.65} />
      </mesh>
      {/* Eyes (simple dots) */}
      <mesh position={[-0.062, 1.598, 0.156]}>
        <sphereGeometry args={[0.022, 6, 5]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.2} />
      </mesh>
      <mesh position={[0.062, 1.598, 0.156]}>
        <sphereGeometry args={[0.022, 6, 5]} />
        <meshStandardMaterial color="#1a1a2a" roughness={0.2} />
      </mesh>
    </group>
  )
}

function ClubBuilding() {
  const wall  = '#f8f0e0'
  const trim  = '#e8d8b8'
  const glass = '#6ab8d4'
  return (
    <group position={[0, 0, 28]}>
      {/* Main facade — 3 floors */}
      <mesh position={[0, 5.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[64, 11, 1.8]} />
        <meshStandardMaterial color={wall} roughness={0.72} />
      </mesh>
      {/* Floor dividers */}
      {[0, 3.5, 7.0, 10.5].map((y, i) => (
        <mesh key={i} position={[0, y, -0.08]}>
          <boxGeometry args={[64.4, 0.22, 2.0]} />
          <meshStandardMaterial color={trim} roughness={0.55} />
        </mesh>
      ))}
      {/* Ground-floor windows — large */}
      {[-24, -16, -8, 0, 8, 16, 24].map((x, i) => (
        <mesh key={i} position={[x, 1.8, -0.92]}>
          <boxGeometry args={[5.5, 2.8, 0.12]} />
          <meshStandardMaterial color={glass} metalness={0.22} roughness={0.06} transparent opacity={0.85} />
        </mesh>
      ))}
      {/* 2nd floor windows */}
      {[-22, -14, -6, 2, 10, 18, 26, -30].map((x, i) => (
        <mesh key={i} position={[x, 5.5, -0.92]}>
          <boxGeometry args={[4.2, 2.0, 0.12]} />
          <meshStandardMaterial color={glass} metalness={0.22} roughness={0.06} transparent opacity={0.80} />
        </mesh>
      ))}
      {/* 3rd floor — smaller windows */}
      {[-26, -18, -10, -2, 6, 14, 22, 30].map((x, i) => (
        <mesh key={i} position={[x, 8.8, -0.92]}>
          <boxGeometry args={[3.5, 1.6, 0.10]} />
          <meshStandardMaterial color={glass} metalness={0.25} roughness={0.05} transparent opacity={0.75} />
        </mesh>
      ))}
      {/* Roof parapet */}
      <mesh position={[0, 11.2, 0]}>
        <boxGeometry args={[64.5, 0.55, 2.2]} />
        <meshStandardMaterial color={trim} roughness={0.5} />
      </mesh>
      {/* CASA BLANCA sign */}
      <mesh position={[0, 10.3, -0.95]}>
        <boxGeometry args={[18, 1.4, 0.22]} />
        <meshStandardMaterial color="#d4a017" metalness={0.55} roughness={0.3} emissive="#aa7a00" emissiveIntensity={0.4} />
      </mesh>
      {/* Sign lights */}
      <pointLight position={[-8, 10.8, 0.5]} intensity={6} distance={12} color="#ffcc44" decay={2} />
      <pointLight position={[ 8, 10.8, 0.5]} intensity={6} distance={12} color="#ffcc44" decay={2} />
      {/* Entrance arch */}
      <mesh position={[0, 3.5, -0.85]}>
        <torusGeometry args={[3.2, 0.28, 8, 18, Math.PI]} />
        <meshStandardMaterial color={trim} roughness={0.45} />
      </mesh>
      {/* Entrance pillars */}
      <mesh position={[-3.2, 1.75, -0.85]} castShadow>
        <cylinderGeometry args={[0.28, 0.32, 3.5, 12]} />
        <meshStandardMaterial color={trim} roughness={0.45} />
      </mesh>
      <mesh position={[ 3.2, 1.75, -0.85]} castShadow>
        <cylinderGeometry args={[0.28, 0.32, 3.5, 12]} />
        <meshStandardMaterial color={trim} roughness={0.45} />
      </mesh>
    </group>
  )
}

function ParkedCar({ position, rotation = 0, bodyColor = '#e8e0d0' }: {
  position: [number, number, number]; rotation?: number; bodyColor?: string
}) {
  const glass = '#3a7a9a'
  const wheel = '#1a1a1a'
  const rim   = '#c8c8c8'
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Body lower */}
      <mesh position={[0, 0.42, 0]} castShadow>
        <boxGeometry args={[1.80, 0.62, 4.20]} />
        <meshStandardMaterial color={bodyColor} roughness={0.28} metalness={0.35} />
      </mesh>
      {/* Cabin / roof */}
      <mesh position={[0, 0.96, -0.15]} castShadow>
        <boxGeometry args={[1.62, 0.58, 2.45]} />
        <meshStandardMaterial color={bodyColor} roughness={0.25} metalness={0.38} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.96, 1.02]} rotation={[-0.24, 0, 0]}>
        <boxGeometry args={[1.55, 0.52, 0.08]} />
        <meshStandardMaterial color={glass} metalness={0.30} roughness={0.04} transparent opacity={0.78} />
      </mesh>
      {/* Rear window */}
      <mesh position={[0, 0.96, -1.28]} rotation={[0.24, 0, 0]}>
        <boxGeometry args={[1.55, 0.52, 0.08]} />
        <meshStandardMaterial color={glass} metalness={0.30} roughness={0.04} transparent opacity={0.75} />
      </mesh>
      {/* Side windows L */}
      <mesh position={[-0.82, 0.97, -0.15]}>
        <boxGeometry args={[0.08, 0.44, 1.85]} />
        <meshStandardMaterial color={glass} metalness={0.28} roughness={0.04} transparent opacity={0.72} />
      </mesh>
      {/* Side windows R */}
      <mesh position={[ 0.82, 0.97, -0.15]}>
        <boxGeometry args={[0.08, 0.44, 1.85]} />
        <meshStandardMaterial color={glass} metalness={0.28} roughness={0.04} transparent opacity={0.72} />
      </mesh>
      {/* Bumpers */}
      <mesh position={[0, 0.30, 2.18]}>
        <boxGeometry args={[1.75, 0.32, 0.16]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.55} roughness={0.28} />
      </mesh>
      <mesh position={[0, 0.30, -2.18]}>
        <boxGeometry args={[1.75, 0.32, 0.16]} />
        <meshStandardMaterial color="#aaaaaa" metalness={0.55} roughness={0.28} />
      </mesh>
      {/* Headlights */}
      <mesh position={[-0.55, 0.44, 2.12]}>
        <boxGeometry args={[0.35, 0.20, 0.06]} />
        <meshStandardMaterial color="#ffffee" emissive="#ffff88" emissiveIntensity={0.4} roughness={0.05} />
      </mesh>
      <mesh position={[ 0.55, 0.44, 2.12]}>
        <boxGeometry args={[0.35, 0.20, 0.06]} />
        <meshStandardMaterial color="#ffffee" emissive="#ffff88" emissiveIntensity={0.4} roughness={0.05} />
      </mesh>
      {/* Taillights */}
      <mesh position={[-0.55, 0.44, -2.12]}>
        <boxGeometry args={[0.35, 0.20, 0.06]} />
        <meshStandardMaterial color="#cc2200" emissive="#aa1100" emissiveIntensity={0.5} roughness={0.08} />
      </mesh>
      <mesh position={[ 0.55, 0.44, -2.12]}>
        <boxGeometry args={[0.35, 0.20, 0.06]} />
        <meshStandardMaterial color="#cc2200" emissive="#aa1100" emissiveIntensity={0.5} roughness={0.08} />
      </mesh>
      {/* Wheels — 4 */}
      {([[-0.94, 0.25, 1.35], [0.94, 0.25, 1.35], [-0.94, 0.25, -1.35], [0.94, 0.25, -1.35]] as [number,number,number][]).map((p, i) => (
        <group key={i} position={p} rotation={[Math.PI / 2, 0, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.30, 0.30, 0.22, 16]} />
            <meshStandardMaterial color={wheel} roughness={0.75} />
          </mesh>
          <mesh position={[0, 0, i % 2 === 0 ? 0.115 : -0.115]}>
            <cylinderGeometry args={[0.18, 0.18, 0.04, 12]} />
            <meshStandardMaterial color={rim} metalness={0.7} roughness={0.25} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

// ── GLB NPCs from Meshy AI ────────────────────────────────────────────────────

function ChillGuyNPC({ position, rotation = 0, phase = 0 }: {
  position: [number, number, number]; rotation?: number; phase?: number
}) {
  const { scene } = useGLTF('/Meshy_AI_Chill_guy_0424232958_texture.glb')
  const groupRef  = useRef<THREE.Group>(null)
  const cloned    = useRef(scene.clone(true))

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime + phase
    groupRef.current.position.y = position[1] + Math.sin(t * 1.1) * 0.008
    groupRef.current.rotation.y = rotation + Math.sin(t * 0.4) * 0.06
  })

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]} scale={1.0}>
      <primitive object={cloned.current} />
    </group>
  )
}

function AnimeGirlNPC({ position, rotation = 0, phase = 0 }: {
  position: [number, number, number]; rotation?: number; phase?: number
}) {
  const { scene } = useGLTF('/Meshy_AI_chill_anime_girl_cur_0424233138_texture.glb')
  const groupRef  = useRef<THREE.Group>(null)
  const cloned    = useRef(scene.clone(true))

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime + phase
    groupRef.current.position.y = position[1] + Math.sin(t * 1.3) * 0.007
    groupRef.current.rotation.y = rotation + Math.sin(t * 0.5 + 0.8) * 0.05
  })

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]} scale={1.0}>
      <primitive object={cloned.current} />
    </group>
  )
}

function ChihuahuaNPC({ position, rotation = 0, phase = 0 }: {
  position: [number, number, number]; rotation?: number; phase?: number
}) {
  const { scene } = useGLTF('/Meshy_AI_Chill_Chihuahua_0424232815_texture.glb')
  const groupRef  = useRef<THREE.Group>(null)
  const cloned    = useRef(scene.clone(true))

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime + phase
    // Dog tail-wag sway + gentle bob
    groupRef.current.rotation.y = rotation + Math.sin(t * 2.2) * 0.12
    groupRef.current.position.y = position[1] + Math.abs(Math.sin(t * 3.5)) * 0.012
  })

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]} scale={1.0}>
      <primitive object={cloned.current} />
    </group>
  )
}

export function BeachClub() {
  return (
    <>
      <Ground />
      <Ocean />
      <WaveAnimation />
      <Pool />
      <Bar />
      <DJBooth />
      <BeachRestaurant />
      <BoundaryWalls />
      <ClubBuilding />
      {/* Pool-side thatch kiosks — semi-transparent roof */}
      <ThatchKiosk position={[-11, 0, -8]} />
      <ThatchKiosk position={[11, 0, -12]} />

      {/* Club guests */}
      <BackgroundCustomer position={[14.5, 0, -6]}  color="#3a5a8a" rotation={Math.PI} />
      <BackgroundCustomer position={[14.5, 0, -4]}  color="#8a3a5a" rotation={Math.PI} />
      <BackgroundCustomer position={[14.5, 0, -2]}  color="#5a8a3a" rotation={Math.PI} />
      <BackgroundCustomer position={[-3,   0, -5]}  color="#6a4a2a" rotation={0.3} />
      <BackgroundCustomer position={[3,    0, -5]}  color="#2a4a6a" rotation={-0.3} />
      <BackgroundCustomer position={[-2,   0, -12]} color="#8a6a2a" rotation={0.8} />
      <BackgroundCustomer position={[2,    0, -12]} color="#4a2a8a" rotation={-0.5} />
      <BackgroundCustomer position={[-6,   0, -28]} color="#3a7a4a" rotation={1.2} />
      <BackgroundCustomer position={[6,    0, -28]} color="#7a3a4a" rotation={-0.7} />
      <BackgroundCustomer position={[0,    0, -32]} color="#4a5a8a" rotation={0.2} />
      <BackgroundCustomer position={[-10,  0, -30]} color="#aa5533" rotation={-0.4} />
      <BackgroundCustomer position={[10,   0, -30]} color="#335588" rotation={0.6} />

      {/* Club-perimeter palms */}
      <PalmTree position={[-14, 0, -16]} lean={-1} seed={0} />
      <PalmTree position={[14,  0, -16]} lean={1}  seed={1} />
      <PalmTree position={[-16, 0,  0]}  lean={0}  seed={2} />
      <PalmTree position={[16,  0,  0]}  lean={1}  seed={3} />
      <PalmTree position={[-12, 0,  10]} lean={0}  seed={4} />
      <PalmTree position={[12,  0,  10]} lean={-1} seed={5} />
      <PalmTree position={[0,   0, -22]} lean={0}  seed={6} />
      <PalmTree position={[-6,  0,  12]} lean={0.5} seed={7} />
      <PalmTree position={[6,   0,  12]} lean={-0.5} seed={8} />

      {/* Beach palms */}
      <PalmTree position={[-20, 0, -28]} lean={-2}  seed={9}  />
      <PalmTree position={[-12, 0, -32]} lean={1}   seed={10} />
      <PalmTree position={[0,   0, -38]} lean={0.5} seed={11} />
      <PalmTree position={[12,  0, -32]} lean={-1}  seed={12} />
      <PalmTree position={[20,  0, -28]} lean={2}   seed={13} />
      <PalmTree position={[-24, 0, -36]} lean={-1.5} seed={14} />
      <PalmTree position={[24,  0, -36]} lean={1.5} seed={15} />
      <PalmTree position={[-8,  0, -42]} lean={0.8} seed={16} />
      <PalmTree position={[8,   0, -42]} lean={-0.8} seed={17} />

      {/* Pool-side sunbeds */}
      <Sunbed position={[-8,  0, -6]}  rotation={Math.PI / 2} />
      <Sunbed position={[-8,  0, -9]}  rotation={Math.PI / 2} />
      <Sunbed position={[-8,  0, -12]} rotation={Math.PI / 2} />
      <Sunbed position={[8,   0, -6]}  rotation={Math.PI / 2} />
      <Sunbed position={[8,   0, -9]}  rotation={Math.PI / 2} />
      <Sunbed position={[8,   0, -12]} rotation={Math.PI / 2} />
      <Sunbed position={[-4,  0,  2]} />
      <Sunbed position={[4,   0,  2]} />

      {/* Beach sunbeds */}
      <Sunbed position={[-13, 0, -27]} rotation={0.15} />
      <Sunbed position={[-9.5, 0, -28.5]} rotation={-0.1} />
      <Sunbed position={[-6,  0, -30]} rotation={0.2} />
      <Sunbed position={[6,   0, -30]} rotation={-0.2} />
      <Sunbed position={[9.5, 0, -28.5]} rotation={0.1} />
      <Sunbed position={[13,  0, -27]} rotation={-0.15} />
      <Sunbed position={[-4,  0, -35]} rotation={0.3} />
      <Sunbed position={[4,   0, -35]} rotation={-0.3} />

      {/* Pool umbrellas */}
      <Umbrella position={[-8,  0, -7]}   color="#e74c3c" />
      <Umbrella position={[8,   0, -10.5]} color="#2980b9" />
      <Umbrella position={[-8,  0, -13]}  color="#f39c12" />
      <Umbrella position={[8,   0, -5]}   color="#8e44ad" />
      <Umbrella position={[-4,  0,  2]}   color="#c0392b" />
      <Umbrella position={[4,   0,  2]}   color="#16a085" />

      {/* Beach umbrellas */}
      <Umbrella position={[-12, 0, -27.5]} color="#ff7f50" />
      <Umbrella position={[-5,  0, -30]}   color="#40e0d0" />
      <Umbrella position={[5,   0, -30]}   color="#ffd700" />
      <Umbrella position={[12,  0, -27.5]} color="#ff69b4" />
      <Umbrella position={[-3,  0, -35]}   color="#7ec8e3" />
      <Umbrella position={[3,   0, -35]}   color="#ff9966" />

      {/* Tiki torches */}
      <TikiTorch position={[-7, 0, -17]} />
      <TikiTorch position={[7,  0, -17]} />
      <TikiTorch position={[-7, 0,  -4]} />
      <TikiTorch position={[7,  0,  -4]} />

      {/* Parked cars — entrance / parking area near front */}
      <ParkedCar position={[-22, 0, 20]} rotation={0}             bodyColor="#c8d8e8" />
      <ParkedCar position={[-16, 0, 20]} rotation={0}             bodyColor="#e8d8c8" />
      <ParkedCar position={[-10, 0, 20]} rotation={0}             bodyColor="#c8e8c8" />
      <ParkedCar position={[ 10, 0, 20]} rotation={Math.PI}       bodyColor="#e8c8c8" />
      <ParkedCar position={[ 16, 0, 20]} rotation={Math.PI}       bodyColor="#d0d0d0" />
      <ParkedCar position={[ 22, 0, 20]} rotation={Math.PI}       bodyColor="#e8e0a8" />

      {/* Entrance palms flanking the main gate */}
      <PalmTree position={[-5,  0, 22]} lean={-0.5} seed={20} />
      <PalmTree position={[ 5,  0, 22]} lean={0.5}  seed={21} />

      {/* Street lamps along entrance path */}
      {([-20, -12, -4, 4, 12, 20] as number[]).map((x, i) => (
        <group key={i} position={[x, 0, 15]}>
          <mesh position={[0, 2.4, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.075, 4.8, 8]} />
            <meshStandardMaterial color="#888888" metalness={0.6} roughness={0.35} />
          </mesh>
          <mesh position={[0, 4.85, 0.28]}>
            <boxGeometry args={[0.22, 0.18, 0.55]} />
            <meshStandardMaterial color="#cccccc" metalness={0.5} roughness={0.3} />
          </mesh>
          <mesh position={[0, 4.82, 0.38]}>
            <boxGeometry args={[0.18, 0.12, 0.04]} />
            <meshStandardMaterial color="#ffffcc" emissive="#ffff88" emissiveIntensity={1.2} roughness={0.1} />
          </mesh>
          <pointLight position={[0, 4.8, 0.4]} intensity={8} distance={12} color="#ffeeaa" decay={2} />
        </group>
      ))}

      {/* ── Meshy AI NPCs ── */}
      {/* Chill guys — by the bar and pool */}
      <ChillGuyNPC position={[13.5, 0, -3]}  rotation={Math.PI}       phase={0.0} />
      <ChillGuyNPC position={[13.5, 0, -1]}  rotation={Math.PI}       phase={1.2} />
      <ChillGuyNPC position={[-4,   0, -6]}  rotation={0.5}           phase={2.1} />
      <ChillGuyNPC position={[4,    0, -6]}  rotation={-0.4}          phase={0.7} />

      {/* Anime girls — pool deck + beach */}
      <AnimeGirlNPC position={[-3,  0, -12]} rotation={0.8}           phase={0.3} />
      <AnimeGirlNPC position={[3,   0, -12]} rotation={-0.5}          phase={1.5} />
      <AnimeGirlNPC position={[0,   0, -30]} rotation={0.2}           phase={2.8} />

      {/* Chihuahua — roaming near entrance */}
      <ChihuahuaNPC position={[2,   0,  8]}  rotation={-0.6}          phase={0.0} />
      <ChihuahuaNPC position={[-6,  0,  5]}  rotation={1.2}           phase={1.8} />
    </>
  )
}

useGLTF.preload('/Meshy_AI_Chill_guy_0424232958_texture.glb')
useGLTF.preload('/Meshy_AI_chill_anime_girl_cur_0424233138_texture.glb')
useGLTF.preload('/Meshy_AI_Chill_Chihuahua_0424232815_texture.glb')
