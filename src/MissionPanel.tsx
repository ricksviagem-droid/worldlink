import type { CSSProperties } from 'react'

const XP_PER_LEVEL = 300

interface Props {
  xp: number
  servedTotal: number
  justServed: boolean
  shiftPhase: 'idle' | 'active' | 'ended'
  shiftTimeLeft: number
  shiftServed: number
  shiftMissed: number
  onStartShift: () => void
  onEndShift: () => void
  onShowReport: () => void
}

export function MissionPanel({
  xp, servedTotal, justServed,
  shiftPhase, shiftTimeLeft, shiftServed, shiftMissed,
  onStartShift, onEndShift, onShowReport,
}: Props) {
  const level    = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpInLevel = xp % XP_PER_LEVEL
  const progress = xpInLevel / XP_PER_LEVEL
  const stars    = Math.min(5, Math.floor(servedTotal / 2))

  const mins = Math.floor(shiftTimeLeft / 60)
  const secs = String(shiftTimeLeft % 60).padStart(2, '0')
  const urgent = shiftTimeLeft <= 30

  const base: CSSProperties = {
    background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(12px)',
    borderRadius: 16, padding: '10px 14px', minWidth: 170,
    fontFamily: '-apple-system, sans-serif', color: '#fff',
    border: justServed
      ? '1.5px solid rgba(243,156,18,0.7)'
      : shiftPhase === 'active' && urgent
        ? '1.5px solid rgba(231,76,60,0.7)'
        : '1px solid rgba(255,255,255,0.1)',
    transition: 'border 0.3s',
  }

  return (
    <div style={base}>

      {/* SHIFT ACTIVE */}
      {shiftPhase === 'active' && (
        <>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, marginBottom: 4 }}>
            TURNO EM CURSO
          </div>
          <div style={{
            fontSize: 30, fontWeight: 800, textAlign: 'center', marginBottom: 3,
            color: urgent ? '#e74c3c' : '#f39c12',
            textShadow: urgent ? '0 0 14px rgba(231,76,60,0.5)' : 'none',
          }}>{mins}:{secs}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 10 }}>
            <span>✅ {shiftServed}</span>
            <span style={{ color: shiftMissed > 0 ? '#e74c3c' : 'rgba(255,255,255,0.35)' }}>
              😤 {shiftMissed}
            </span>
          </div>
          <button onClick={onEndShift} style={{
            width: '100%', padding: '7px', borderRadius: 10, border: '1px solid rgba(231,76,60,0.4)',
            background: 'rgba(231,76,60,0.22)', color: '#e74c3c',
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}>⏹ Encerrar Turno</button>
        </>
      )}

      {/* SHIFT ENDED */}
      {shiftPhase === 'ended' && (
        <>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, marginBottom: 6 }}>
            TURNO ENCERRADO
          </div>
          <div style={{ fontSize: 12, marginBottom: 10, color: 'rgba(255,255,255,0.65)' }}>
            ✅ {shiftServed} &nbsp;·&nbsp; 😤 {shiftMissed}
          </div>
          <button onClick={onShowReport} style={{
            width: '100%', padding: '8px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg,#f39c12,#e74c3c)',
            color: '#111', fontSize: 12, fontWeight: 800, cursor: 'pointer',
          }}>📋 Ver Relatório</button>
        </>
      )}

      {/* IDLE */}
      {shiftPhase === 'idle' && (
        <>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: 1.5, marginBottom: 4 }}>
            MISSÃO
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3, display: 'flex', justifyContent: 'space-between' }}>
            <span>🍹 Servir</span>
            <span style={{ color: '#f39c12' }}>{servedTotal}</span>
          </div>
          <div style={{ fontSize: 17, letterSpacing: 2, marginBottom: 8 }}>
            {[...Array(5)].map((_, i) => (
              <span key={i} style={{
                opacity: i < stars ? 1 : 0.2,
                color: i < stars ? '#f39c12' : '#fff',
                textShadow: i < stars ? '0 0 7px rgba(243,156,18,0.6)' : 'none',
                transition: 'all 0.3s',
              }}>★</span>
            ))}
          </div>
          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
            <span>LVL {level}</span><span>{xpInLevel}/{XP_PER_LEVEL} XP</span>
          </div>
          <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginBottom: 10, overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: 2, background: 'linear-gradient(90deg,#f39c12,#e74c3c)', width: `${progress * 100}%`, transition: 'width 0.5s ease' }} />
          </div>
          <button onClick={onStartShift} style={{
            width: '100%', padding: '8px', borderRadius: 10,
            border: '1px solid rgba(243,156,18,0.35)',
            background: 'rgba(243,156,18,0.18)', color: '#f39c12',
            fontSize: 11, fontWeight: 700, cursor: 'pointer',
          }}>▶ Iniciar Turno (3 min)</button>
        </>
      )}
    </div>
  )
}
