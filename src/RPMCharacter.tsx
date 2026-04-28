import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { Component, Suspense, useMemo, useRef, type ReactNode } from 'react'
import * as THREE from 'three'

const BONE_VARIANTS: Record<string, string[]> = {
  hips:         ['Hips',         'mixamorig:Hips',         'Pelvis',       'hip'],
  spine2:       ['Spine2',       'mixamorig:Spine2',       'Spine1',       'mixamorig:Spine1', 'chest'],
  neck:         ['Neck',         'mixamorig:Neck',         'neck_01'],
  head:         ['Head',         'mixamorig:Head',         'head'],
  leftUpLeg:    ['LeftUpLeg',    'mixamorig:LeftUpLeg',    'Thigh_L',      'thigh_l'],
  rightUpLeg:   ['RightUpLeg',   'mixamorig:RightUpLeg',   'Thigh_R',      'thigh_r'],
  leftArm:      ['LeftArm',      'mixamorig:LeftArm',      'UpperArm_L',   'upperarm_l'],
  rightArm:     ['RightArm',     'mixamorig:RightArm',     'UpperArm_R',   'upperarm_r'],
}

function findBone(root: THREE.Object3D, names: string[]): THREE.Bone | null {
  let found: THREE.Bone | null = null
  root.traverse(obj => {
    if (!found && names.includes(obj.name)) found = obj as THREE.Bone
  })
  return found
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
  const { scene } = useGLTF(url)

  const clone = useMemo(() => {
    const c = scene.clone(true)
    const tintColor = tint ? new THREE.Color(tint) : null
    c.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) {
        const m = obj as THREE.Mesh
        m.castShadow = true
        m.receiveShadow = false
        if (tintColor) {
          // Clone material so we don't affect the original shared material
          const mat = (m.material as THREE.MeshStandardMaterial).clone()
          mat.color.multiply(tintColor)
          m.material = mat
        }
      }
    })
    return c
  }, [scene, tint])

  const walkT   = useRef(Math.random() * Math.PI * 2)
  const breathT = useRef(Math.random() * Math.PI * 2)
  const talkT   = useRef(0)

  const bones = useMemo(() => {
    const b: Partial<Record<keyof typeof BONE_VARIANTS, THREE.Bone>> = {}
    for (const [key, names] of Object.entries(BONE_VARIANTS)) {
      const bone = findBone(clone, names)
      if (bone) b[key as keyof typeof BONE_VARIANTS] = bone
    }
    return b
  }, [clone])

  const hasRig = Object.keys(bones).length >= 4

  useFrame((_, delta) => {
    const moving  = movingRef?.current  ?? false
    const talking = talkingRef?.current ?? false

    if (moving)  walkT.current  += delta * 7.5
    breathT.current += delta * 1.1
    if (talking) talkT.current  += delta * 3.5

    if (!hasRig) return

    const swing    = moving ? Math.sin(walkT.current) * 0.42 : 0
    const idleSway = !moving ? Math.sin(breathT.current * 0.7) * 0.018 : 0
    const breathZ  = Math.sin(breathT.current) * 0.006
    const talkNod  = talking ? Math.sin(talkT.current) * 0.035 : 0
    const lr       = 0.18

    if (bones.leftUpLeg)  bones.leftUpLeg.rotation.x  += ( swing * 0.65 - bones.leftUpLeg.rotation.x)  * lr
    if (bones.rightUpLeg) bones.rightUpLeg.rotation.x += (-swing * 0.65 - bones.rightUpLeg.rotation.x) * lr
    if (bones.leftArm) {
      bones.leftArm.rotation.x += (-swing * 0.28 + idleSway * 0.5 - bones.leftArm.rotation.x) * lr
      bones.leftArm.rotation.z += (0.04 - bones.leftArm.rotation.z) * lr * 0.1
    }
    if (bones.rightArm) {
      bones.rightArm.rotation.x += ( swing * 0.28 - idleSway * 0.5 - bones.rightArm.rotation.x) * lr
      bones.rightArm.rotation.z += (-0.04 - bones.rightArm.rotation.z) * lr * 0.1
    }
    if (bones.spine2) {
      bones.spine2.rotation.y += (Math.sin(walkT.current * 0.5) * (moving ? 0.04 : 0) + idleSway * 0.6 - bones.spine2.rotation.y) * lr * 0.4
      bones.spine2.rotation.z += (breathZ - bones.spine2.rotation.z) * lr * 0.3
    }
    if (bones.head) {
      const bob = moving ? Math.abs(Math.sin(walkT.current)) * 0.014 : Math.sin(breathT.current * 0.5) * 0.008
      bones.head.rotation.x += (talkNod + bob - bones.head.rotation.x) * 0.14
      if (!moving && !talking)
        bones.head.rotation.y += (Math.sin(breathT.current * 0.22) * 0.12 - bones.head.rotation.y) * 0.04
    }
  })

  return <primitive object={clone} position={[0, yOffset, 0]} scale={scale} />
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
