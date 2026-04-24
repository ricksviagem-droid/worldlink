import { useFrame } from '@react-three/fiber'
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
  const frondCount = 8
  const frondAngles = Array.from({ length: frondCount }, (_, i) => (i / frondCount) * 360)
  return (
    <group position={position}>
      {/* Trunk with ring texture suggestion */}
      <mesh position={[lean * 0.1, 2.6, 0]} rotation={[0, 0, lean * 0.055]} castShadow>
        <cylinderGeometry args={[0.155, 0.29, 5.4, 8]} />
        <meshStandardMaterial color="#8a6312" roughness={0.9} />
      </mesh>
      {[0.8, 1.5, 2.2, 2.9, 3.6, 4.3].map((y, i) => (
        <mesh key={i} position={[lean * 0.06 * (i / 5), y, 0]}>
          <torusGeometry args={[0.21 + (5 - i) * 0.013, 0.028, 5, 10]} />
          <meshStandardMaterial color="#6a4c0e" roughness={0.9} />
        </mesh>
      ))}
      {/* Fronds */}
      {frondAngles.map((deg, i) => {
        const rad = (deg * Math.PI) / 180
        const sway = Math.sin(seed + i) * 0.06
        return (
          <mesh
            key={i}
            position={[
              lean * 0.1 + Math.cos(rad) * 1.65,
              5.25 - (i % 3) * 0.08,
              Math.sin(rad) * 1.65,
            ]}
            rotation={[-0.44 + (i % 2) * 0.09 + sway, rad, (i % 3) * 0.04]}
            castShadow
          >
            <boxGeometry args={[0.14, 0.05, 3.3]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#28782a' : '#339636'} roughness={0.7} />
          </mesh>
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
      {/* Raised stage */}
      <mesh position={[0, 0.13, 0]} castShadow receiveShadow>
        <boxGeometry args={[9.5, 0.26, 3.5]} />
        <meshStandardMaterial color="#16162a" roughness={0.5} />
      </mesh>
      {/* Stage LED edge front */}
      <mesh position={[0, 0.27, 1.75]}>
        <boxGeometry args={[9.5, 0.05, 0.06]} />
        <meshStandardMaterial color="#8888ff" emissive="#5555ff" emissiveIntensity={1.4} />
      </mesh>
      {/* Stage LED sides */}
      <mesh position={[-4.75, 0.27, 0]}>
        <boxGeometry args={[0.06, 0.05, 3.5]} />
        <meshStandardMaterial color="#8888ff" emissive="#5555ff" emissiveIntensity={1.4} />
      </mesh>
      <mesh position={[4.75, 0.27, 0]}>
        <boxGeometry args={[0.06, 0.05, 3.5]} />
        <meshStandardMaterial color="#8888ff" emissive="#5555ff" emissiveIntensity={1.4} />
      </mesh>
      {/* Console */}
      <mesh position={[0, 0.72, -0.4]} castShadow>
        <boxGeometry args={[7.2, 1.18, 2.4]} />
        <meshStandardMaterial color="#0e0e20" roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.34, -0.72]} castShadow>
        <boxGeometry args={[6.4, 0.28, 1.5]} />
        <meshStandardMaterial color="#080818" roughness={0.3} />
      </mesh>
      {/* Screens */}
      {([-2.4, 0, 2.4] as number[]).map((x, i) => (
        <mesh key={i} position={[x, 1.86, -1.1]}>
          <boxGeometry args={[1.6, 0.82, 0.06]} />
          <meshStandardMaterial
            color="#050520"
            emissive={(['#440099','#006644','#990022'] as string[])[i]}
            emissiveIntensity={0.8}
          />
        </mesh>
      ))}
      {/* Speaker stacks */}
      {([-4.5, 4.5] as number[]).map((x, i) => (
        <group key={i} position={[x, 0, -0.5]}>
          <mesh position={[0, 1.08, 0]} castShadow>
            <boxGeometry args={[0.95, 2.3, 0.88]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.5} />
          </mesh>
          <mesh position={[0, 1.08, 0.44]}>
            <boxGeometry args={[0.72, 1.9, 0.03]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.85} />
          </mesh>
        </group>
      ))}
      {/* Floor glow */}
      <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8.5, 3]} />
        <meshStandardMaterial color="#090920" roughness={0.8} />
      </mesh>
    </group>
  )
}

function BackgroundCustomer({ position, color, rotation = 0 }: {
  position: [number, number, number]; color: string; rotation?: number
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, 0.56, 0]}>
        <capsuleGeometry args={[0.15, 0.66, 4, 8]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.3, 0]}>
        <sphereGeometry args={[0.19, 10, 10]} />
        <meshStandardMaterial color="#c8a07a" roughness={0.65} />
      </mesh>
    </group>
  )
}

export function BeachClub() {
  return (
    <>
      <Ground />
      <Ocean />
      <Pool />
      <Bar />
      <DJBooth />

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

      {/* Tiki torches — DJ area */}
      <TikiTorch position={[-7,  0, -17]} />
      <TikiTorch position={[7,   0, -17]} />
      <TikiTorch position={[-12, 0, -22]} />
      <TikiTorch position={[12,  0, -22]} />
      {/* Pool torches */}
      <TikiTorch position={[-7, 0, -4]} />
      <TikiTorch position={[7,  0, -4]} />
      {/* Beach torches */}
      <TikiTorch position={[-16, 0, -26]} />
      <TikiTorch position={[16,  0, -26]} />
    </>
  )
}
