import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Component, Fragment, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'

const BONE_VARIANTS = {
  hips:       ['Hips', 'mixamorig:Hips', 'Pelvis', 'hip'],
  spine2:     ['Spine2', 'mixamorig:Spine2', 'Spine1', 'mixamorig:Spine1', 'chest'],
  neck:       ['Neck', 'mixamorig:Neck', 'neck_01'],
  head:       ['Head', 'mixamorig:Head', 'head'],
  leftUpLeg:  ['LeftUpLeg', 'mixamorig:LeftUpLeg', 'Thigh_L', 'thigh_l'],
  rightUpLeg: ['RightUpLeg', 'mixamorig:RightUpLeg', 'Thigh_R', 'thigh_r'],
  leftArm:    ['LeftArm', 'mixamorig:LeftArm', 'UpperArm_L', 'upperarm_l'],
  rightArm:   ['RightArm', 'mixamorig:RightArm', 'UpperArm_R', 'upperarm_r'],
}

function findBone(root: THREE.Object3D, names: string[]): THREE.Bone | null {
  let found: THREE.Bone | null = null
  root.traverse(o => { if (!found && names.includes(o.name)) found = o as THREE.Bone })
  return found
}

class ErrBound extends Component<
  { children: ReactNode; url: string },
  { err: boolean; retry: number }
> {
  state = { err: false, retry: 0 }
  private timer: ReturnType<typeof setTimeout> | null = null

  static getDerivedStateFromError() { return { err: true } }

  componentDidCatch(e: Error) {
    console.error(`[RPMCharacter] ERRO ao carregar "${this.props.url}":`, e.message)
    useGLTF.clear(this.props.url)
    this.timer = setTimeout(() => {
      console.log(`[RPMCharacter] Tentando novamente: "${this.props.url}"`)
      this.setState(s => ({ err: false, retry: s.retry + 1 }))
    }, 4000)
  }

  componentWillUnmount() {
    if (this.timer) clearTimeout(this.timer)
  }

  render() {
    if (this.state.err) {
      return (
        <mesh>
          <boxGeometry args={[0.4, 1.8, 0.4]} />
          <meshStandardMaterial color="#ff2222" wireframe />
        </mesh>
      )
    }
    return <Fragment key={this.state.retry}>{this.props.children}</Fragment>
  }
}

export interface RPMCharacterProps {
  url: string
  scale?: number
  yOffset?: number
  tint?: string
  movingRef?: React.RefObject<boolean>
  talkingRef?: React.RefObject<boolean>
}

function RPMMesh({ url, scale = 1, yOffset = 0, tint, movingRef, talkingRef }: RPMCharacterProps) {
  const { scene, animations } = useGLTF(url)
  const groupRef = useRef<THREE.Group>(null)

  const clone = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Object3D
    const tintColor = tint ? new THREE.Color(tint) : null
    c.traverse(obj => {
      const m = obj as THREE.SkinnedMesh
      if (!m.isMesh) return
      m.castShadow = true
      m.receiveShadow = false
      m.frustumCulled = false
      if (tintColor && !Array.isArray(m.material)) {
        const mat = (m.material as THREE.MeshStandardMaterial).clone()
        mat.color.multiply(tintColor)
        m.material = mat
      }
    })
    return c
  }, [scene, tint])

  const hasSkin = useMemo(() => {
    let found = false
    clone.traverse(o => { if ((o as THREE.SkinnedMesh).isSkinnedMesh) found = true })
    return found
  }, [clone])

  const mixerRef      = useRef<THREE.AnimationMixer | null>(null)
  const idleActionRef = useRef<THREE.AnimationAction | null>(null)
  const walkActionRef = useRef<THREE.AnimationAction | null>(null)
  const hasClipsRef   = useRef(false)
  const wasMoving     = useRef<boolean>(false)

  useEffect(() => {
    if (!hasSkin || animations.length === 0) return

    const findClip = (...keys: string[]) => {
      for (const k of keys) {
        const c = animations.find(a => a.name.toLowerCase().includes(k.toLowerCase()))
        if (c) return c
      }
      return null
    }

    const mixer = new THREE.AnimationMixer(clone)
    mixerRef.current = mixer

    const idleClip = findClip('idle', 'stand', 'gesture') ?? animations[0]
    const walkClip = findClip('walk', 'run', 'jog', 'move')

    const idleAction = mixer.clipAction(idleClip)
    idleAction.setLoop(THREE.LoopRepeat, Infinity)
    idleAction.clampWhenFinished = false
    idleAction.reset().play()
    idleActionRef.current = idleAction

    if (walkClip) {
      const wa = mixer.clipAction(walkClip)
      wa.setLoop(THREE.LoopRepeat, Infinity)
      walkActionRef.current = wa
    }
    hasClipsRef.current = true

    return () => {
      mixer.stopAllAction()
      mixer.uncacheRoot(clone)
      mixerRef.current      = null
      idleActionRef.current = null
      walkActionRef.current = null
      hasClipsRef.current   = false
    }
  }, [animations, clone, hasSkin])

  const bones = useMemo(() => {
    if (!hasSkin) return {} as Partial<Record<keyof typeof BONE_VARIANTS, THREE.Bone>>
    const b: Partial<Record<keyof typeof BONE_VARIANTS, THREE.Bone>> = {}
    for (const [key, names] of Object.entries(BONE_VARIANTS)) {
      const bone = findBone(clone, names)
      if (bone) b[key as keyof typeof BONE_VARIANTS] = bone
    }
    return b
  }, [clone, hasSkin])

  const hasRig = Object.keys(bones).length >= 4

  const walkT      = useRef(Math.random() * Math.PI * 2)
  const breathT    = useRef(Math.random() * Math.PI * 2)
  const talkT      = useRef(0)
  const speedBlend = useRef(0)

  useFrame((_, delta) => {
    if (!hasSkin) return
    mixerRef.current?.update(delta)

    const moving  = movingRef?.current ?? false
    const talking = talkingRef?.current ?? false

    breathT.current += delta * 1.1
    if (moving) walkT.current += delta * 8.0
    if (talking) talkT.current += delta * 3.5
    speedBlend.current += ((moving ? 1 : 0) - speedBlend.current) * Math.min(1, 8 * delta)
    const spd = speedBlend.current

    const hasClips = hasClipsRef.current
    if (hasClips) {
      if (moving !== wasMoving.current) {
        wasMoving.current = moving
        if (moving) {
          idleActionRef.current?.fadeOut(0.3)
          walkActionRef.current?.reset().setEffectiveWeight(1).fadeIn(0.3).play()
        } else {
          walkActionRef.current?.fadeOut(0.3)
          idleActionRef.current?.reset().setEffectiveWeight(1).fadeIn(0.3).play()
        }
      }
      // Safety: restart idle if it stopped unexpectedly
      if (!moving && idleActionRef.current && !idleActionRef.current.isRunning()) {
        idleActionRef.current.reset().setLoop(THREE.LoopRepeat, Infinity).play()
      }
    }

    if (groupRef.current) {
      const g = groupRef.current
      const bounce = Math.abs(Math.sin(walkT.current)) * 0.08 * spd * (hasClips ? 0.35 : 1.0)
      g.position.y = yOffset + bounce
      g.rotation.x = 0
      g.rotation.z = 0
      g.rotation.y += (0 - g.rotation.y) * 0.1
    }

    if (!hasRig || hasClips) return
    const swing    = moving ? Math.sin(walkT.current) * 0.42 : 0
    const boneSway = !moving ? Math.sin(breathT.current * 0.7) * 0.018 : 0
    const breathZ  = Math.sin(breathT.current) * 0.006
    const lr       = 0.18
    if (bones.leftUpLeg)  bones.leftUpLeg.rotation.x  += ( swing * 0.65 - bones.leftUpLeg.rotation.x)  * lr
    if (bones.rightUpLeg) bones.rightUpLeg.rotation.x += (-swing * 0.65 - bones.rightUpLeg.rotation.x) * lr
    if (bones.leftArm)    bones.leftArm.rotation.x    += (-swing * 0.28 + boneSway * 0.5 - bones.leftArm.rotation.x)  * lr
    if (bones.rightArm)   bones.rightArm.rotation.x   += ( swing * 0.28 - boneSway * 0.5 - bones.rightArm.rotation.x) * lr
    if (bones.spine2) {
      bones.spine2.rotation.y += (Math.sin(walkT.current * 0.5) * (moving ? 0.04 : 0) + boneSway * 0.6 - bones.spine2.rotation.y) * lr * 0.4
      bones.spine2.rotation.z += (breathZ - bones.spine2.rotation.z) * lr * 0.3
    }
    if (bones.head) {
      const bob = moving ? Math.abs(Math.sin(walkT.current)) * 0.014 : Math.sin(breathT.current * 0.5) * 0.008
      bones.head.rotation.x += (bob - bones.head.rotation.x) * 0.14
      if (!moving) bones.head.rotation.y += (Math.sin(breathT.current * 0.22) * 0.12 - bones.head.rotation.y) * 0.04
    }
  })

  return (
    <group ref={groupRef} position={[0, yOffset, 0]}>
      <primitive object={clone} scale={scale} />
    </group>
  )
}

export function RPMCharacter(props: RPMCharacterProps) {
  return (
    <ErrBound url={props.url}>
      <Suspense fallback={null}>
        <RPMMesh {...props} />
      </Suspense>
    </ErrBound>
  )
}
