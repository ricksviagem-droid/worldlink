import { useGLTF } from '@react-three/drei'
import { Component, Suspense, useMemo, type ReactNode } from 'react'

class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }
  static getDerivedStateFromError() { return { hasError: true } }
  render() {
    if (this.state.hasError) return null
    return this.props.children
  }
}

function GlbMesh({ url, position, scale, rotation }: {
  url: string
  position: [number, number, number]
  scale: number
  rotation?: [number, number, number]
}) {
  const { scene } = useGLTF(url)
  const cloned = useMemo(() => scene.clone(true), [scene])
  return <primitive object={cloned} position={position} scale={scale} rotation={rotation ?? [0, 0, 0]} />
}

export function GlbNPC({ url, position, scale = 1, rotation }: {
  url: string
  position: [number, number, number]
  scale?: number
  rotation?: [number, number, number]
}) {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <GlbMesh url={url} position={position} scale={scale} rotation={rotation} />
      </Suspense>
    </ErrorBoundary>
  )
}
