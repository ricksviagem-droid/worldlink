import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Component, Suspense, useEffect, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js'

const BONE_VARIANTS: Record<string, string[]> = {
  hips:      ['Hips', 'mixamorig:Hips', 'Pelvis', 'hip'],
  spine2:    ['Spine2', 'mixamorig:Spine2', 'Spine1', 'mixamorig:Spine1', 'chest'],
  neck:      ['Neck', 'mixamorig:Neck', 'neck_01'],
  head:      ['Head', 'mixamorig:Head', 'head'],
  leftUpLeg: ['LeftUpLeg', 'mixamorig:LeftUpLeg', 'Thigh_L', 'thigh_l'],
  rightUpLeg:['RightUpLeg', 'mixamorig:RightUpLeg', 'Thigh_R', 'thigh_r'],
  leftArm:   ['LeftArm', 'mixamorig:LeftArm', 'UpperArm_L', 'upperarm_l'],
  rightArm:  ['RightArm', 'mixamorig:RightArm', 'UpperArm_R', 'upperarm_r'],
}

function findBone(root: THREE.Object3D, names: string[]): THREE.Bone | null {
  let found: THREE.Bone | null = null
  root.traverse(o => { if (!found && names.includes(o.name)) found = o as THREE.Bone })
  return found
}

function findClip(clips: THREE.AnimationClip[], ...keys: string[]) {
  for (const k of keys)
    for (const c of clips)
      if (c.name.toLowerCase().includes(k.toLowerCase())) return c
  return null
}

class ErrBound extends Component<{ children: ReactNode }, { err: boolean }> {
  state = { err: false }
  static getDerivedStateFromError() { return { err: true } }
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

function RPMMesh({ url, scale = 1, yOffset = 0, tint, movingRef, talkingRef }: RPMCharacterProps) {
  const { scene, animations } = useGLTF(url)
  const groupRef = useRef<THREE.Group>(null)

  // ── Clone with proper skeleton rebinding ─────────────────────────────────
  const { clone, autoYOffset } = useMemo(() => {
    const c = SkeletonUtils.clone(scene) as THREE.Object3D
    const tintColor = tint ? new THREE.Color(tint) : null
    c.traverse(obj => {
      const m = obj as THREE.SkinnedMesh
      if (!m.isMesh) return
      m.castShadow = true
      m.receiveShadow = false
      m.frustumCulled = false
      if (tintColor) {
        const mat = (m.material as THREE.MeshStandardMaterial).clone()
        mat.color.multiply(tintColor)
        m.material = mat
      }
    })
    c.updateMatrixWorld(true)
    const box = new THREE.Box3()
    c.traverse(obj => {
      const m = obj as THREE.Mesh
      if (!m.isMesh || !m.geometry) return
      if (!m.geometry.boundingBox) m.geometry.computeBoundingBox()
      if (m.geometry.boundingBox)
        box.union(m.geometry.boundingBox.clone().applyMatrix4(m.matrixWorld))
    })
    const auto = !box.isEmpty() && isFinite(box.min.y) && box.min.y < -0.05 ? -box.min.y : 0
    return { clone: c, autoYOffset: auto }
  }, [scene, tint])

  // ── AnimationMixer attached directly to the clone ─────────────────────────
  // This guarantees bone name resolution uses the clone's own hierarchy,
  // not the shared cached scene from useGLTF.
  const mixerRef   = useRef<THREE.AnimationMixer | null>(null)
  const idleRef    = useRef<THREE.AnimationAction | null>(null)
  const walkRef    = useRef<THREE.AnimationAction | null>(null)
  const hasClips   = animations.length > 0
  const wasMoving  = useRef<boolean | null>(null)

  useEffect(() => {
    if (!animations.length) return
    const mixer = new THREE.AnimationMixer(clone)
    mixerRef.current = mixer

    const idleClip = findClip(animations, 'idle', 'stand', 'tpose')
                  ?? findClip(animations, 'gesture', 'pose', 'wave', 'dance')
                  ?? animations[0]           // fallback: first clip (e.g. gesture_1 on Avaturn)
    const walkClip = findClip(animations, 'walk', 'run', 'jog', 'move')

    if (idleClip) {
      idleRef.current = mixer.clipAction(idleClip)
      idleRef.current.reset().play()
    }
    if (walkClip) {
      walkRef.current = mixer.clipAction(walkClip)
      walkRef.current.enabled = false
    }

    return () => { mixer.stopAllAction(); mixerRef.current = null }
  }, [clone, animations])

  // ── Bone refs for procedural animation (models without usable clips) ──────
  const bones = useMemo(() => {
    const b: Partial<Record<keyof typeof BONE_VARIANTS, THREE.Bone>> = {}
    for (const [key, names] of Object.entries(BONE_VARIANTS)) {
      const bone = findBone(clone, names)
      if (bone) b[key as keyof typeof BONE_VARIANTS] = bone
    }
    return b
  }, [clone])
  const hasRig = Object.keys(bones).length >= 4
  // Use procedural bones only when no recognized idle/walk clips exist
  const hasUsefulClips = !!(findClip(animations, 'idle', 'stand', 'tpose', 'gesture', 'pose', 'wave', 'dance', 'walk', 'run', 'jog', 'move') || animations[0])

  // ── Timers ────────────────────────────────────────────────────────────────
  const walkT      = useRef(Math.random() * Math.PI * 2)
  const breathT    = useRef(Math.random() * Math.PI * 2)
  const talkT      = useRef(0)
  const speedBlend = useRef(0)

  useFrame((_, delta) => {
    const moving  = movingRef?.current ?? false
    const talking = talkingRef?.current ?? false

    mixerRef.current?.update(delta)

    breathT.current  += delta * 1.1
    if (moving) walkT.current += delta * 8.0
    if (talking) talkT.current += delta * 3.5
    speedBlend.current += ((moving ? 1 : 0) - speedBlend.current) * Math.min(1, 8 * delta)
    const spd = speedBlend.current

    // ── Crossfade idle ↔ walk ─────────────────────────────────────────────
    if (hasClips && moving !== wasMoving.current) {
      wasMoving.current = moving
      const idle = idleRef.current
      const walk = walkRef.current
      if (walk) {
        if (moving) {
          idle?.fadeOut(0.3)
          walk.reset().setEffectiveWeight(1).fadeIn(0.3).play()
        } else {
          walk.fadeOut(0.3)
          idle?.reset().setEffectiveWeight(1).fadeIn(0.3).play()
        }
      }
    }

    // ── Whole-body group animation ────────────────────────────────────────
    if (groupRef.current) {
      const g = groupRef.current
      const bounce   = Math.abs(Math.sin(walkT.current)) * 0.08 * spd
      const sideTilt = Math.sin(walkT.current) * 0.06 * spd
      const fwdLean  = spd * 0.09
      const idleSway = Math.sin(breathT.current * 0.7) * 0.016 * (1 - spd)
      const talkNod  = talking ? Math.sin(talkT.current) * 0.025 : 0

      const enhance = hasUsefulClips ? 0.35 : 1.0
      g.position.y = autoYOffset + yOffset + bounce * enhance
      g.rotation.x = (-fwdLean + talkNod) * enhance
      g.rotation.z = (sideTilt + idleSway) * enhance
      if (!moving && !talking)
        g.rotation.y += (Math.sin(breathT.current * 0.18) * 0.12 - g.rotation.y) * 0.04
      else
        g.rotation.y += (0 - g.rotation.y) * 0.1
    }

    // ── Procedural bone animation (only when no clips at all) ─────────────
    if (!hasRig || hasUsefulClips) return
    const swing    = moving ? Math.sin(walkT.current) * 0.42 : 0
    const idleSway = !moving ? Math.sin(breathT.current * 0.7) * 0.018 : 0
    const breathZ  = Math.sin(breathT.current) * 0.006
    const lr       = 0.18
    if (bones.leftUpLeg)  bones.leftUpLeg.rotation.x  += ( swing * 0.65 - bones.leftUpLeg.rotation.x)  * lr
    if (bones.rightUpLeg) bones.rightUpLeg.rotation.x += (-swing * 0.65 - bones.rightUpLeg.rotation.x) * lr
    if (bones.leftArm)    bones.leftArm.rotation.x    += (-swing * 0.28 + idleSway * 0.5 - bones.leftArm.rotation.x) * lr
    if (bones.rightArm)   bones.rightArm.rotation.x   += ( swing * 0.28 - idleSway * 0.5 - bones.rightArm.rotation.x) * lr
    if (bones.spine2) {
      bones.spine2.rotation.y += (Math.sin(walkT.current * 0.5) * (moving ? 0.04 : 0) + idleSway * 0.6 - bones.spine2.rotation.y) * lr * 0.4
      bones.spine2.rotation.z += (breathZ - bones.spine2.rotation.z) * lr * 0.3
    }
    if (bones.head) {
      const bob = moving ? Math.abs(Math.sin(walkT.current)) * 0.014 : Math.sin(breathT.current * 0.5) * 0.008
      bones.head.rotation.x += (bob - bones.head.rotation.x) * 0.14
      if (!moving) bones.head.rotation.y += (Math.sin(breathT.current * 0.22) * 0.12 - bones.head.rotation.y) * 0.04
    }
  })

  return (
    <group ref={groupRef} position={[0, autoYOffset + yOffset, 0]}>
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
