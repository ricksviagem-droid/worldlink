import { useEffect, useRef, useState } from 'react'

interface Props {
  onMove: (x: number, z: number) => void
  onTalk: () => void
  nearNpc: boolean
}

export function MobileControls({ onMove, onTalk, nearNpc }: Props) {
  const [touch, setTouch] = useState<{ ox: number; oy: number; dx: number; dy: number } | null>(null)
  const moveRef = useRef({ x: 0, z: 0 })
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
    const raw = { dx: cx - ox, dy: cy - oy }
    const dist = Math.sqrt(raw.dx ** 2 + raw.dy ** 2)
    const maxR = 45
    const clamped = dist > maxR ? { dx: (raw.dx / dist) * maxR, dy: (raw.dy / dist) * maxR } : raw
    setTouch(prev => prev ? { ...prev, dx: clamped.dx, dy: clamped.dy } : null)
    const norm = Math.max(dist, 0.01)
    const speed = Math.min(dist / maxR, 1) * 0.7
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

  const RADIUS = 50

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 20, pointerEvents: 'none' }}>
      {/* Joystick zone — left half */}
      <div
        style={{ position: 'absolute', left: 0, bottom: 0, width: '50%', height: '45%', pointerEvents: 'auto' }}
        onTouchStart={e => { e.preventDefault(); const t = e.touches[0]; startMove(t.clientX, t.clientY) }}
        onTouchMove={e => { e.preventDefault(); if (!touch) return; const t = e.touches[0]; updateMove(t.clientX, t.clientY, touch.ox, touch.oy) }}
        onTouchEnd={endMove}
      >
        {/* Joystick visual */}
        {touch && (
          <div style={{ position: 'absolute', left: touch.ox - RADIUS, top: touch.oy - RADIUS - (window.innerHeight - (window.innerHeight * 0.45)), width: RADIUS * 2, height: RADIUS * 2 }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: '2px solid rgba(255,255,255,0.25)' }} />
            <div style={{
              position: 'absolute',
              left: RADIUS + touch.dx - 22,
              top: RADIUS + touch.dy - 22,
              width: 44, height: 44, borderRadius: '50%',
              background: 'rgba(255,255,255,0.45)',
              border: '2px solid rgba(255,255,255,0.7)',
            }} />
          </div>
        )}
        {!touch && (
          <div style={{ position: 'absolute', bottom: 30, left: 40, width: RADIUS * 2, height: RADIUS * 2, borderRadius: '50%', border: '2px dashed rgba(255,255,255,0.2)' }} />
        )}
      </div>

      {/* Talk button — when near NPC */}
      {nearNpc && (
        <div style={{ position: 'absolute', right: 30, bottom: 100, pointerEvents: 'auto' }}>
          <button
            onTouchStart={e => { e.preventDefault(); onTalk() }}
            style={{
              width: 72, height: 72, borderRadius: '50%', border: '3px solid #f39c12',
              background: 'rgba(243,156,18,0.25)', color: '#f39c12',
              fontSize: 13, fontWeight: 700, fontFamily: 'sans-serif',
              backdropFilter: 'blur(8px)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 2,
              boxShadow: '0 0 20px rgba(243,156,18,0.4)',
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
