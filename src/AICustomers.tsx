import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { useRef } from 'react'
import * as THREE from 'three'
import { RPMCharacter } from './RPMCharacter'

export type CustomerNeed = 'drink' | 'towel' | 'menu' | 'happy' | 'left'

export const SERVE_DISTANCE = 4.5
export const PATIENCE_SECONDS = 40

// Alternates between chill guy and anime girl models
const GLB_POOL = [
  '/Meshy_AI_Chill_guy_0424232958_texture.glb',
  '/Meshy_AI_chill_anime_girl_cur_0424233138_texture.glb',
]

export const CUSTOMER_DEFS = [
  { id: 'c1', glbUrl: GLB_POOL[0], bodyColor: '#e74c3c', headColor: '#f0c27f', hairColor: '#3a1808', pantsColor: '#1a1828', spawn: [8,  0,  1] as [number, number, number] },
  { id: 'c2', glbUrl: GLB_POOL[1], bodyColor: '#27ae60', headColor: '#d4a076', hairColor: '#2a1a08', pantsColor: '#c0a870', spawn: [-8, 0,  2] as [number, number, number] },
  { id: 'c3', glbUrl: GLB_POOL[0], bodyColor: '#8e44ad', headColor: '#f0c27f', hairColor: '#1a0818', pantsColor: '#1a0a1a', spawn: [10, 0, -2] as [number, number, number] },
  { id: 'c4', glbUrl: GLB_POOL[1], bodyColor: '#16a085', headColor: '#e8b88a', hairColor: '#5a3010', pantsColor: '#f0e8d8', spawn: [3,  0,  4] as [number, number, number] },
  { id: 'c5', glbUrl: GLB_POOL[0], bodyColor: '#d35400', headColor: '#c8855a', hairColor: '#0a0808', pantsColor: '#1a1a18', spawn: [11, 0,  2] as [number, number, number] },
]

const POOL = { x1: -6, x2: 6, z1: -14.5, z2: -5.5 }
function isInPool(x: number, z: number) {
  return x > POOL.x1 && x < POOL.x2 && z > POOL.z1 && z < POOL.z2
}

const NEED_ICONS: Record<CustomerNeed, string> = {
  drink: '🍹', towel: '🏖️', menu: '📋', happy: '😊', left: '😤',
}

function CustomerCharacter({
  def, need, isNearby, missionActive, onPatienceOut,
}: {
  def: typeof CUSTOMER_DEFS[0]
  need: CustomerNeed
  isNearby: boolean
  missionActive: boolean
  onPatienceOut: (id: string) => void
}) {
  const groupRef  = useRef<THREE.Group>(null)
  const pos       = useRef({ x: def.spawn[0], z: def.spawn[2] })
  const target    = useRef({ x: def.spawn[0], z: def.spawn[2] })
  const timer     = useRef(Math.random() * 4)
  const patience  = useRef(1.0)
  const barRef    = useRef<HTMLDivElement>(null)
  const firedRef  = useRef(false)
  const movingRef = useRef(false)

  const prevNeed  = useRef(need)
  if (prevNeed.current !== need) {
    patience.current = 1.0
    firedRef.current = false
    prevNeed.current = need
  }

  useFrame((_, delta) => {
    if (!groupRef.current) return

    timer.current += delta
    if (timer.current > 3 + Math.random() * 4) {
      const angle = Math.random() * Math.PI * 2
      const r = Math.random() * 2.5
      const nx = def.spawn[0] + Math.cos(angle) * r
      const nz = def.spawn[2] + Math.sin(angle) * r
      if (!isInPool(nx, nz)) target.current = { x: nx, z: nz }
      timer.current = 0
    }
    pos.current.x += (target.current.x - pos.current.x) * 0.015
    pos.current.z += (target.current.z - pos.current.z) * 0.015
    groupRef.current.position.x = pos.current.x
    groupRef.current.position.z = pos.current.z
    const dx = target.current.x - pos.current.x
    const dz = target.current.z - pos.current.z
    movingRef.current = Math.abs(dx) + Math.abs(dz) > 0.005
    if (movingRef.current) groupRef.current.rotation.y = Math.atan2(dx, dz)
    groupRef.current.position.y = Math.sin(Date.now() * 0.001 + def.spawn[0]) * 0.03

    const waiting = need !== 'happy' && need !== 'left'
    if (missionActive && waiting && !firedRef.current) {
      patience.current = Math.max(0, patience.current - delta / PATIENCE_SECONDS)
      if (barRef.current) {
        const pct = patience.current
        barRef.current.style.width = `${pct * 100}%`
        barRef.current.style.background =
          pct > 0.55 ? '#27ae60' : pct > 0.28 ? '#f39c12' : '#e74c3c'
      }
      if (patience.current === 0 && !firedRef.current) {
        firedRef.current = true
        onPatienceOut(def.id)
      }
    }
  })

  const canServe = isNearby && need !== 'happy' && need !== 'left'
  const showBar  = missionActive && need !== 'happy' && need !== 'left'

  return (
    <group ref={groupRef} position={def.spawn}>
      <RPMCharacter url={def.glbUrl} scale={1.0} movingRef={movingRef} />
      <Html position={[0, 2.4, 0]} center distanceFactor={12}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, minWidth: 52 }}>
          {showBar && (
            <div style={{
              width: 48, height: 4, background: 'rgba(0,0,0,0.4)', borderRadius: 3, overflow: 'hidden',
            }}>
              <div ref={barRef} style={{ height: '100%', borderRadius: 3, width: '100%', background: '#27ae60', transition: 'background 0.3s' }} />
            </div>
          )}
          <div style={{
            background: canServe ? 'rgba(39,174,96,0.92)' : need === 'happy' ? 'rgba(243,156,18,0.85)' : need === 'left' ? 'rgba(100,100,100,0.7)' : 'rgba(0,0,0,0.65)',
            padding: '4px 12px', borderRadius: 18, fontSize: 16,
            fontFamily: 'sans-serif', backdropFilter: 'blur(6px)',
            transition: 'all 0.2s',
            boxShadow: canServe ? '0 2px 14px rgba(39,174,96,0.5)' : 'none',
            textAlign: 'center',
          }}>
            {NEED_ICONS[need]}
            {canServe && <div style={{ fontSize: 9, color: '#fff', marginTop: 2 }}>Press E</div>}
          </div>
        </div>
      </Html>
    </group>
  )
}

export function AICustomers({
  needs, nearbyId, missionActive, onPatienceOut,
}: {
  needs: Record<string, CustomerNeed>
  nearbyId: string | null
  missionActive: boolean
  onPatienceOut: (id: string) => void
}) {
  return (
    <>
      {CUSTOMER_DEFS.map(def => (
        <CustomerCharacter
          key={def.id}
          def={def}
          need={needs[def.id] ?? 'drink'}
          isNearby={nearbyId === def.id}
          missionActive={missionActive}
          onPatienceOut={onPatienceOut}
        />
      ))}
    </>
  )
}
