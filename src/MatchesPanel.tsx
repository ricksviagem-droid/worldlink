import { useEffect } from 'react'
import type { CardProfile } from './ProfileCard'

// ─── "It's a Match!" overlay ─────────────────────────────────────────────────
interface MatchNotifProps {
  myName: string
  myEmoji?: string
  myBodyColor: string
  myHeadColor: string
  matchName: string
  matchEmoji?: string
  matchBodyColor: string
  matchHeadColor: string
  onContinue: () => void
}

export function MatchNotification({
  myName, myEmoji, myBodyColor, myHeadColor,
  matchName, matchEmoji, matchBodyColor, matchHeadColor,
  onContinue,
}: MatchNotifProps) {
  useEffect(() => {
    const t = setTimeout(onContinue, 5500)
    return () => clearTimeout(t)
  }, [onContinue])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'radial-gradient(ellipse at center, rgba(243,156,18,0.12) 0%, rgba(0,0,0,0.92) 70%)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    }}>
      <style>{`
        @keyframes matchPop {
          0%   { transform: scale(0.5); opacity: 0 }
          65%  { transform: scale(1.06) }
          100% { transform: scale(1); opacity: 1 }
        }
        @keyframes floatA { 0%,100% { transform: translateY(0px) rotate(-6deg) } 50% { transform: translateY(-8px) rotate(-6deg) } }
        @keyframes floatB { 0%,100% { transform: translateY(-4px) rotate(6deg) } 50% { transform: translateY(4px) rotate(6deg) } }
        @keyframes heartPulse { 0%,100% { transform: scale(1) } 50% { transform: scale(1.25) } }
        @keyframes shimmer { 0%,100% { opacity: 0.6 } 50% { opacity: 1 } }
      `}</style>

      <div style={{ textAlign: 'center', animation: 'matchPop 0.55s cubic-bezier(0.34,1.56,0.64,1)' }}>
        {/* Sparkle line */}
        <div style={{ fontSize: 22, marginBottom: 8, animation: 'shimmer 1.6s ease-in-out infinite' }}>
          ✨ &nbsp; ✨ &nbsp; ✨
        </div>

        {/* Main text */}
        <div style={{ fontSize: 40, fontWeight: 800, color: '#fff', letterSpacing: -1, marginBottom: 4 }}>
          É um Match!
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.52)', marginBottom: 44 }}>
          Você e <strong style={{ color: '#f39c12' }}>{matchName}</strong> se curtiram 🎉
        </div>

        {/* Avatars */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginBottom: 44 }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, ${myHeadColor}, ${myBodyColor})`,
            border: '4px solid rgba(255,255,255,0.9)', fontSize: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            animation: 'floatA 2.4s ease-in-out infinite',
          }}>{myEmoji ?? myName[0]}</div>

          <div style={{ fontSize: 26, animation: 'heartPulse 1.1s ease-in-out infinite', margin: '0 4px' }}>❤️</div>

          <div style={{
            width: 88, height: 88, borderRadius: '50%',
            background: `radial-gradient(circle at 35% 30%, ${matchHeadColor}, ${matchBodyColor})`,
            border: '4px solid rgba(255,255,255,0.9)', fontSize: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            animation: 'floatB 2.4s ease-in-out infinite',
          }}>{matchEmoji ?? matchName[0]}</div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={onContinue} style={{
            padding: '12px 28px', borderRadius: 30, cursor: 'pointer',
            border: '2px solid rgba(255,255,255,0.22)', background: 'rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.75)', fontSize: 13, fontWeight: 600,
            fontFamily: 'inherit',
          }}>Continuar</button>
        </div>
      </div>
    </div>
  )
}

// ─── Matches Panel (slide-in from right) ─────────────────────────────────────
interface MatchesPanelProps {
  matches: Set<string>
  profiles: Record<string, CardProfile>
  myInterests: string[]
  unreadDMs: Set<string>
  onOpenDM: (id: string) => void
  onClose: () => void
}

export function MatchesPanel({ matches, profiles, myInterests, unreadDMs, onOpenDM, onClose }: MatchesPanelProps) {
  const matchList = [...matches].filter(id => profiles[id])

  return (
    <div style={{
      position: 'absolute', right: 0, top: 0, bottom: 0, width: 272, zIndex: 40,
      background: 'rgba(5,5,16,0.97)', backdropFilter: 'blur(22px)',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', color: '#fff',
      display: 'flex', flexDirection: 'column',
      animation: 'slideInRight 0.22s ease',
    }}>
      {/* Header */}
      <div style={{
        padding: '22px 18px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>💫 Matches</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 2 }}>
            {matchList.length === 0
              ? 'Explore o club!'
              : `${matchList.length} match${matchList.length > 1 ? 'es' : ''}`}
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 30, height: 30, borderRadius: '50%', border: 'none',
          background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)',
          cursor: 'pointer', fontSize: 17,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
        {matchList.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            color: 'rgba(255,255,255,0.25)', fontSize: 13, lineHeight: 1.65,
          }}>
            <div style={{ fontSize: 40, marginBottom: 14 }}>💔</div>
            Nenhum match ainda.<br />
            Curta outros jogadores<br />e torça pelo mutual!
          </div>
        ) : matchList.map(id => {
          const p = profiles[id]
          const common = p.interests.filter(i => myInterests.includes(i))
          return (
            <div key={id} style={{
              display: 'flex', alignItems: 'center', gap: 11,
              padding: '11px 10px', borderRadius: 16, marginBottom: 7,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              transition: 'background 0.15s',
            }}>
              {/* Avatar */}
              <div style={{
                width: 50, height: 50, borderRadius: '50%', flexShrink: 0,
                background: `radial-gradient(circle at 35% 30%, ${p.headColor}, ${p.bodyColor})`,
                border: '2px solid rgba(255,255,255,0.16)', fontSize: 21,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}>{p.faceEmoji ?? p.name[0]}</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</div>
                {common.length > 0 ? (
                  <div style={{
                    fontSize: 10, color: '#f39c12', marginTop: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{common.slice(0, 2).join(' · ')}</div>
                ) : p.bio ? (
                  <div style={{
                    fontSize: 10, color: 'rgba(255,255,255,0.35)', marginTop: 2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>{p.bio}</div>
                ) : null}
              </div>

              {/* DM button */}
              <button onClick={() => onOpenDM(id)} style={{
                width: 34, height: 34, borderRadius: '50%', border: 'none', flexShrink: 0,
                background: unreadDMs.has(id) ? 'rgba(243,156,18,0.35)' : 'rgba(243,156,18,0.14)',
                color: '#f39c12', fontSize: 15, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', transition: 'background 0.15s',
              }}>
                💬
                {unreadDMs.has(id) && (
                  <div style={{
                    position: 'absolute', top: -2, right: -2,
                    width: 9, height: 9, borderRadius: '50%', background: '#e74c3c',
                    border: '1.5px solid rgba(5,5,16,0.9)',
                  }} />
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
