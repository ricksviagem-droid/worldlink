const XP_PER_LEVEL = 300

interface Props {
  xp: number
  servedTotal: number
  justServed: boolean
}

export function MissionPanel({ xp, servedTotal, justServed }: Props) {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpInLevel = xp % XP_PER_LEVEL
  const progress = xpInLevel / XP_PER_LEVEL
  const stars = Math.min(5, Math.floor(servedTotal / 2))

  return (
    <div style={{
      position: 'absolute', top: 60, right: 16, zIndex: 10,
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
      borderRadius: 18, padding: '14px 18px', minWidth: 190,
      fontFamily: '-apple-system, sans-serif', color: '#fff',
      border: justServed ? '1.5px solid rgba(243,156,18,0.7)' : '1.5px solid transparent',
      transition: 'border 0.3s',
    }}>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5, marginBottom: 5 }}>
        MISSÃO ATIVA
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>🍹 Servir clientes</span>
        <span style={{ color: '#f39c12' }}>{servedTotal}</span>
      </div>

      <div style={{ fontSize: 20, letterSpacing: 3, marginBottom: 10 }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{
            opacity: i < stars ? 1 : 0.2,
            color: i < stars ? '#f39c12' : '#fff',
            textShadow: i < stars ? '0 0 8px rgba(243,156,18,0.6)' : 'none',
            transition: 'all 0.3s',
          }}>★</span>
        ))}
      </div>

      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginBottom: 5, display: 'flex', justifyContent: 'space-between' }}>
        <span>LVL {level}</span>
        <span>{xpInLevel} / {XP_PER_LEVEL} XP</span>
      </div>
      <div style={{ height: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{
          height: '100%', borderRadius: 3,
          background: 'linear-gradient(90deg, #f39c12, #e74c3c)',
          width: `${progress * 100}%`,
          transition: 'width 0.5s ease',
        }} />
      </div>

      {servedTotal >= 10 && (
        <div style={{
          marginTop: 10, textAlign: 'center', fontSize: 12,
          color: '#f39c12', fontWeight: 700,
          textShadow: '0 0 10px rgba(243,156,18,0.5)',
        }}>
          🏆 Contratado pelo Rick!
        </div>
      )}
    </div>
  )
}
