import { useState, useEffect } from 'react'

interface Phrase {
  en: string
  pt: string
}

interface Props {
  playerName: string
  durationMinutes: number
  npcMessages: string[]
  onClose: () => void
}

export function SessionReport({ playerName, durationMinutes, npcMessages, onClose }: Props) {
  const [loading, setLoading]       = useState(true)
  const [phrases, setPhrases]       = useState<Phrase[]>([])
  const [rickMsg, setRickMsg]       = useState('')
  const [rickMsgPt, setRickMsgPt]   = useState('')
  const [translated, setTranslated] = useState(false)
  const [error, setError]           = useState(false)

  useEffect(() => {
    fetch('/api/session-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ playerName, durationMinutes, npcMessages }),
    })
      .then(r => r.json())
      .then(data => {
        setPhrases(data.phrases || [])
        setRickMsg(data.rickMessage || '')
        setRickMsgPt(data.rickMessagePt || '')
        setLoading(false)
      })
      .catch(() => { setError(true); setLoading(false) })
  }, [])

  const mins = durationMinutes < 1 ? '<1' : Math.round(durationMinutes)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      background: 'rgba(4,8,20,0.97)', backdropFilter: 'blur(28px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', color: '#fff',
      padding: '24px 16px', overflowY: 'auto',
    }}>
      <div style={{ width: '100%', maxWidth: 440 }}>

        {/* Rick header */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28,
        }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', marginBottom: 14,
            background: 'radial-gradient(circle at 35% 30%, #c8855a, #f5e0b0)',
            border: '3px solid rgba(243,156,18,0.6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, boxShadow: '0 0 32px rgba(243,156,18,0.25)',
          }}>😎</div>
          <div style={{ fontSize: 20, fontWeight: 800, letterSpacing: -0.3 }}>Rick</div>
          <div style={{ fontSize: 12, color: '#f39c12', marginTop: 2 }}>Dono · Casa Blanca 🌴</div>
          <div style={{
            marginTop: 12, fontSize: 11, color: 'rgba(255,255,255,0.3)',
            background: 'rgba(255,255,255,0.06)', padding: '4px 14px', borderRadius: 20,
          }}>
            Sessão de {mins} min · {npcMessages.length} conversa{npcMessages.length !== 1 ? 's' : ''}
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.4)' }}>
            <div style={{ fontSize: 28, marginBottom: 12, animation: 'spin 1.2s linear infinite' }}>⏳</div>
            Rick está preparando seu relatório...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '24px 0', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>
            Não foi possível gerar o relatório desta vez.
          </div>
        ) : (
          <>
            {/* English phrases */}
            {phrases.length > 0 && (
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontSize: 10, color: '#f39c12', letterSpacing: 1.8, fontWeight: 700,
                  marginBottom: 12, textAlign: 'center',
                }}>VOCÊ PRATICOU HOJE</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {phrases.map((p, i) => (
                    <div key={i} style={{
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 14, padding: '12px 16px',
                    }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#f8d878', marginBottom: 4 }}>
                        "{p.en}"
                      </div>
                      <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5 }}>
                        {p.pt}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Rick's message */}
            {(rickMsg || rickMsgPt) && (
              <div style={{
                background: 'linear-gradient(135deg, rgba(243,156,18,0.12), rgba(231,76,60,0.08))',
                border: '1px solid rgba(243,156,18,0.22)', borderRadius: 18,
                padding: '18px 20px', marginBottom: 20, position: 'relative',
              }}>
                <div style={{ fontSize: 12, lineHeight: 1.7, color: 'rgba(255,255,255,0.88)' }}>
                  {translated ? rickMsgPt : rickMsg}
                </div>
                {/* Translation toggle */}
                {rickMsg && rickMsgPt && (
                  <button
                    onClick={() => setTranslated(v => !v)}
                    style={{
                      marginTop: 12, fontSize: 11, padding: '5px 12px', borderRadius: 10,
                      border: '1px solid rgba(243,156,18,0.3)', background: 'rgba(243,156,18,0.1)',
                      color: '#f39c12', cursor: 'pointer', fontFamily: 'inherit',
                    }}
                  >
                    {translated ? '🇺🇸 Ver em inglês' : '🇧🇷 Traduzir para português'}
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            width: '100%', padding: '15px 0', borderRadius: 16, border: 'none',
            background: 'linear-gradient(135deg, #f39c12, #e74c3c)',
            color: '#fff', fontSize: 15, fontWeight: 700,
            cursor: 'pointer', fontFamily: 'inherit',
            boxShadow: '0 4px 20px rgba(243,156,18,0.3)',
          }}
        >
          Até logo, Rick! 👋
        </button>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}
