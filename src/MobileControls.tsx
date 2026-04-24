import { useEffect, useRef, useState } from 'react'

const RADIUS = 52
const MAX_R  = 46

interface Props {
  onMove: (x: number, z: number) => void
  onTalk: () => void
  nearNpc: boolean
}

export function MobileControls({ onMove, onTalk, nearNpc }: Props) {
  const [touch, setTouch] = useState<{ ox: number; oy: number; dx: number; dy: number } | null>(null)
  const moveRef    = useRef({ x: 0, z: 0 })
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current) }
  }, [])

  const startMove = (ox: number, oy: number) => {
    setTouch({ ox, oy, dx: 0, dy: 0 })
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const { x, z } = moveRef.current
      if (Math.abs(x) > 0.05 || Math.abs(z) > 0.05) onMove(x, z)
    }, 80)
  }

  const updateMove = (cx: number, cy: number, ox: number, oy: number) => {
    const raw  = { dx: cx - ox, dy: cy - oy }
    const dist = Math.sqrt(raw.dx ** 2 + raw.dy ** 2)
    const clamped = dist > MAX_R
      ? { dx: (raw.dx / dist) * MAX_R, dy: (raw.dy / dist) * MAX_R }
      : raw
    setTouch(prev => prev ? { ...prev, dx: clamped.dx, dy: clamped.dy } : null)
    const norm  = Math.max(dist, 0.01)
    const speed = Math.min(dist / MAX_R, 1) * 0.7
    moveRef.current = {
      x: (raw.dx / norm) * speed,
      z: (raw.dy / norm) * speed,
    }
  }

  const endMove = () => {
    setTouch(null)
    moveRef.current = { x: 0, z: 0 }
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }

  const arrowStyle = (side: 'top' | 'bottom' | 'left' | 'right'): React.CSSProperties => {
    const base: React.CSSProperties = {
      position: 'absolute',
      color: 'rgba(255,255,255,0.35)',
      fontSize: 13,
      lineHeight: 1,
      userSelect: 'none',
    }
    if (side === 'top')    return { ...base, top: -18, left: '50%', transform: 'translateX(-50%)' }
    if (side === 'bottom') return { ...base, bottom: -18, left: '50%', transform: 'translateX(-50%)' }
    if (side === 'left')   return { ...base, left: -18, top: '50%', transform: 'translateY(-50%)' }
    return { ...base, right: -18, top: '50%', transform: 'translateY(-50%)' }
  }

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }}>

      {/* Static hint ring — always visible when not touching */}
      {!touch && (
        <div style={{
          position: 'absolute', bottom: 36, left: 36,
          width: RADIUS * 2, height: RADIUS * 2,
          pointerEvents: 'none',
        }}>
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            border: '1.5px dashed rgba(255,255,255,0.2)',
          }} />
          <span style={arrowStyle('top')}>▲</span>
          <span style={arrowStyle('bottom')}>▼</span>
          <span style={arrowStyle('left')}>◀</span>
          <span style={arrowStyle('right')}>▶</span>
        </div>
      )}

      {/* Joystick zone — left half */}
      <div
        style={{ position: 'absolute', left: 0, bottom: 0, width: '55%', height: '50%', pointerEvents: 'auto' }}
        onTouchStart={e => { e.preventDefault(); const t = e.touches[0]; startMove(t.clientX, t.clientY) }}
        onTouchMove={e => { e.preventDefault(); if (!touch) return; const t = e.touches[0]; updateMove(t.clientX, t.clientY, touch.ox, touch.oy) }}
        onTouchEnd={endMove}
      >
        {/* Active joystick at touch origin */}
        {touch && (
          <div style={{
            position: 'absolute',
            left: touch.ox - RADIUS,
            top: touch.oy - (window.innerHeight * 0.5) - RADIUS,
            width: RADIUS * 2, height: RADIUS * 2,
            pointerEvents: 'none',
          }}>
            {/* Outer ring */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1.5px solid rgba(255,255,255,0.2)',
            }} />
            {/* Thumb */}
            <div style={{
              position: 'absolute',
              left: RADIUS + touch.dx - 24,
              top:  RADIUS + touch.dy - 24,
              width: 48, height: 48, borderRadius: '50%',
              background: 'rgba(255,255,255,0.32)',
              border: '2px solid rgba(255,255,255,0.55)',
            }} />
          </div>
        )}
      </div>

      {/* Talk / Serve button */}
      {nearNpc && (
        <div style={{ position: 'absolute', right: 28, bottom: 36, pointerEvents: 'auto' }}>
          <button
            onTouchStart={e => { e.preventDefault(); onTalk() }}
            style={{
              width: 68, height: 68, borderRadius: '50%',
              border: '2.5px solid rgba(243,156,18,0.7)',
              background: 'rgba(243,156,18,0.18)',
              color: '#f39c12',
              fontSize: 12, fontWeight: 700, fontFamily: 'sans-serif',
              backdropFilter: 'blur(6px)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 2,
            }}
          >
            <span style={{ fontSize: 22 }}>💬</span>
            <span style={{ fontSize: 10 }}>Talk</span>
          </button>
        </div>
      )}
    </div>
  )
}
