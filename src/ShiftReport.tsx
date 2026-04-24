import { useEffect, useState } from 'react'

interface Stats {
  served: number
  missed: number
  exchanges: number
  shiftDuration: number
  quitEarly: boolean
}

interface Props {
  stats: Stats
  onClose: () => void
}

export function ShiftReport({ stats, onClose }: Props) {
  const [report, setReport] = useState('')
  const [passed, setPassed] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(stats),
    })
      .then(r => r.json())
      .then(data => { setReport(data.report); setPassed(data.passed) })
      .finally(() => setLoading(false))
  }, [])

  const mins = Math.floor(stats.shiftDuration / 60)
  const secs = stats.shiftDuration % 60
  const total = stats.served + stats.missed

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 90,
      background: 'rgba(6,6,18,0.96)', backdropFilter: 'blur(24px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, sans-serif', color: '#fff', padding: 24,
    }}>
      {/* Result badge */}
      <div style={{
        fontSize: 52, marginBottom: 12,
      }}>{loading ? '⏳' : passed ? '🏆' : '📋'}</div>

      <div style={{
        fontSize: 22, fontWeight: 800, marginBottom: 6,
        color: loading ? '#fff' : passed ? '#f39c12' : 'rgba(255,255,255,0.7)',
      }}>
        {loading ? 'Rick está avaliando...' : passed ? 'APROVADO!' : 'PRECISA MELHORAR'}
      </div>
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 28 }}>
        Relatório do Turno — Casa Blanca
      </div>

      {/* Stats grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        width: '100%', maxWidth: 380, marginBottom: 24,
      }}>
        {[
          { label: 'Atendidos', value: `${stats.served}/${total}`, ok: stats.served >= total * 0.6 },
          { label: 'Perdidos', value: stats.missed.toString(), ok: stats.missed === 0 },
          { label: 'Conversas', value: stats.exchanges.toString(), ok: stats.exchanges >= 3 },
          { label: 'Duração', value: `${mins}:${String(secs).padStart(2,'0')}`, ok: !stats.quitEarly },
        ].map(({ label, value, ok }) => (
          <div key={label} style={{
            background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '14px 16px',
            border: `1px solid ${ok ? 'rgba(76,175,80,0.3)' : 'rgba(231,76,60,0.3)'}`,
          }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 4, letterSpacing: 0.5 }}>
              {label}
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: ok ? '#4caf50' : '#e74c3c' }}>
              {value}
            </div>
          </div>
        ))}
      </div>

      {/* Rick's feedback */}
      <div style={{
        background: 'rgba(255,255,255,0.05)', borderRadius: 18, padding: '18px 20px',
        width: '100%', maxWidth: 380, marginBottom: 24,
        border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ fontSize: 11, color: '#f39c12', letterSpacing: 1.5, fontWeight: 700, marginBottom: 10 }}>
          💬 RICK FALA
        </div>
        <div style={{ fontSize: 14, lineHeight: 1.6, color: loading ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.85)' }}>
          {loading ? 'Carregando feedback...' : report}
        </div>
      </div>

      {stats.quitEarly && (
        <div style={{
          fontSize: 12, color: 'rgba(231,76,60,0.8)', marginBottom: 16, textAlign: 'center',
          background: 'rgba(231,76,60,0.1)', padding: '8px 16px', borderRadius: 10,
        }}>
          ⚠️ Saiu antes do tempo — isso foi anotado na avaliação
        </div>
      )}

      <button onClick={onClose} style={{
        padding: '14px 40px', borderRadius: 16, border: 'none',
        background: passed ? 'linear-gradient(135deg,#f39c12,#e74c3c)' : 'rgba(255,255,255,0.12)',
        color: passed ? '#111' : '#fff', fontSize: 16, fontWeight: 700, cursor: 'pointer',
      }}>
        {passed ? '🏖️ Voltar ao Clube' : '🔄 Tentar Novamente'}
      </button>
    </div>
  )
}
