import { useState } from 'react'
import { OUTFITS, getOutfit, type PlayerProfile } from './outfits'

interface Props {
  myProfile: PlayerProfile
  onChangeOutfit: (outfitId: string) => void
  onClose: () => void
}

const FEATURES = [
  { emoji: '❤️',  name: 'Curtir Jogadores',   desc: 'Dê like em outros jogadores e receba de volta', active: true },
  { emoji: '⭐',  name: 'Super Like',          desc: 'Destaque interesse especial por alguém',         active: true },
  { emoji: '💞',  name: 'Match',               desc: 'Curtiram um ao outro? É um match!',              active: true },
  { emoji: '🃏',  name: 'Cartão de Perfil',    desc: 'Veja perfil de quem está perto',                 active: true },
  { emoji: '🌐',  name: 'Multiplayer',         desc: 'Interaja com jogadores reais em tempo real',     active: true },
  { emoji: '🎭',  name: 'Emotes',              desc: 'Animações e gestos especiais',                   active: false },
  { emoji: '🏠',  name: 'Área VIP',            desc: 'Acesso exclusivo à área privê do clube',         active: false },
  { emoji: '🎪',  name: 'Eventos Especiais',   desc: 'Festas e eventos temáticos',                     active: false },
]

export function Shop({ myProfile, onChangeOutfit, onClose }: Props) {
  const [tab, setTab] = useState(0)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 80,
      background: 'rgba(6,6,18,0.95)', backdropFilter: 'blur(22px)',
      fontFamily: '-apple-system, sans-serif', color: '#fff',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '22px 20px 0',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 16,
      }}>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800 }}>🛍️ Loja</div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
            Tudo liberado · Temporada de lançamento
          </div>
        </div>
        <button onClick={onClose} style={{
          background: 'rgba(255,255,255,0.08)', border: 'none', color: '#fff',
          borderRadius: 12, padding: '8px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600,
        }}>✕ Fechar</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, padding: '14px 20px 0' }}>
        {['👗 Roupas', '⚡ Features'].map((t, i) => (
          <button key={i} onClick={() => setTab(i)} style={{
            padding: '8px 18px', borderRadius: 20, border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            background: tab === i ? '#f39c12' : 'rgba(255,255,255,0.08)',
            color: tab === i ? '#111' : 'rgba(255,255,255,0.55)',
            transition: 'all 0.15s',
          }}>{t}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px 30px' }}>
        {tab === 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 11 }}>
            {OUTFITS.map(o => {
              const active = myProfile.outfitId === o.id
              return (
                <button key={o.id} onClick={() => onChangeOutfit(o.id)} style={{
                  borderRadius: 16, padding: '14px 8px', cursor: 'pointer', color: '#fff',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7,
                  background: active ? 'rgba(243,156,18,0.14)' : 'rgba(255,255,255,0.05)',
                  border: active ? '2px solid #f39c12' : '2px solid rgba(255,255,255,0.09)',
                  transition: 'all 0.15s',
                }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: '50%', background: o.bodyColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: active ? 22 : 20,
                  }}>{active ? '✓' : o.emoji}</div>
                  <div style={{ fontWeight: 600, fontSize: 12 }}>{o.name}</div>
                  <div style={{ fontSize: 10, color: '#4caf50', fontWeight: 700 }}>GRÁTIS</div>
                </button>
              )
            })}
          </div>
        )}

        {tab === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 520 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.05)', borderRadius: 14, padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 14,
                border: f.active ? '1px solid rgba(76,175,80,0.25)' : '1px solid rgba(255,255,255,0.07)',
                opacity: f.active ? 1 : 0.55,
              }}>
                <div style={{ fontSize: 26 }}>{f.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{f.name}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>{f.desc}</div>
                </div>
                <div style={{
                  fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 10,
                  background: f.active ? 'rgba(76,175,80,0.18)' : 'rgba(255,255,255,0.07)',
                  color: f.active ? '#4caf50' : 'rgba(255,255,255,0.25)',
                  border: f.active ? '1px solid rgba(76,175,80,0.28)' : 'none',
                  letterSpacing: 0.8,
                }}>{f.active ? 'ATIVO' : 'EM BREVE'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
