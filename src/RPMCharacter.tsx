import { useGLTF, useAnimations } from '@react-three/drei'
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'

class ErrBound extends Component<{ children: ReactNode }, { err: boolean }> {
  state = { err: false }
  static getDerivedStateFromError() { return { err: true } }
  componentDidCatch(e: Error) { console.error('[RPMCharacter]', e.message) }
  render() { return this.state.err ? null : this.props.children }
}

export interface RPMCharacterProps {
  url: string
  scale?: number
  yOffset?: number
  tint?: string
  movingRef?: React.RefObject<boolean>
  talkingRef?: React.RefObject<boolean>
}

function RPMMesh({ url, scale = 1, yOffset = 0, movingRef }: RPMCharacterProps) {
  const { scene, animations } = useGLTF(url)
  const groupRef = useRef<THREE.Group>(null)

  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Object3D
    c.traverse(o => {
      const m = o as THREE.Mesh
      if (m.isMesh) { m.castShadow = true; m.frustumCulled = false }
    })
    return c
  }, [scene])

  const { actions } = useAnimations(animations, groupRef)

  const idleRef   = useRef<THREE.AnimationAction | null>(null)
  const walkRef   = useRef<THREE.AnimationAction | null>(null)
  const wasMoving = useRef<boolean | null>(null)

  useEffect(() => {
    const names = Object.keys(actions)
    const SKIP  = ['dance', 'samba', 'tpose']
    const WALK  = ['walk', 'run', 'jog']

    const idleName = names.find(n => n.toLowerCase().includes('idle'))
                  ?? names.find(n =>
                       !SKIP.some(s => n.toLowerCase().includes(s)) &&
                       !WALK.some(s => n.toLowerCase().includes(s))
                     )
    const walkName = names.find(n => WALK.some(s => n.toLowerCase().includes(s)))

    const idle = idleName ? (actions[idleName] ?? null) : null
    const walk = walkName ? (actions[walkName] ?? null) : null

    idleRef.current = idle
    walkRef.current = walk
    wasMoving.current = null

    if (idle) idle.reset().play()

    return () => names.forEach(n => actions[n]?.stop())
  }, [actions])

  // Crossfade idle ↔ walk when movingRef changes
  useEffect(() => {
    if (!movingRef) return
    const interval = setInterval(() => {
      const moving = movingRef.current ?? false
      if (moving === wasMoving.current) return
      wasMoving.current = moving
      if (moving) {
        idleRef.current?.fadeOut(0.3)
        walkRef.current?.reset().setEffectiveWeight(1).fadeIn(0.3).play()
      } else {
        walkRef.current?.fadeOut(0.3)
        idleRef.current?.reset().setEffectiveWeight(1).fadeIn(0.3).play()
      }
    }, 100)
    return () => clearInterval(interval)
  }, [movingRef])

  return (
    <group ref={groupRef} position={[0, yOffset, 0]}>
      <primitive object={clone} scale={scale} />
    </group>
  )
}

export function RPMCharacter(props: RPMCharacterProps) {
  return (
    <ErrBound>
      <Suspense fallback={null}>
        <RPMMesh {...props} />
      </Suspense>
    </ErrBound>
  )
}
