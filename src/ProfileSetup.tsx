import { useState } from 'react'
import { OUTFITS, INTERESTS, FACE_EMOJIS, getOutfit, type PlayerProfile } from './outfits'

interface Props {
  initial?: PlayerProfile | null
  onSave: (profile: PlayerProfile) => void
}

const STEPS = ['Avatar', 'Perfil', 'Interesses']

export function ProfileSetup({ initial, onSave }: Props) {
  const [step, setStep] = useState(0)
  const [outfitId, setOutfitId] = useState(initial?.outfitId ?? 'beach')
  const [faceEmoji, setFaceEmoji] = useState(initial?.faceEmoji ?? '😎')
  const [name, setName] = useState(initial?.name ?? '')
  const [bio, setBio] = useState(initial?.bio ?? '')
  const [interests, setInterests] = useState<string[]>(initial?.interests ?? [])

  const outfit = getOutfit(outfitId)

  const toggleInterest = (i: string) =>
    setInterests(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : prev.length < 5 ? [...prev, i] : prev
    )

  const handleSave = () => {
    if (!name.trim()) return
    onSave({ name: name.trim(), bio, interests, outfitId, faceEmoji })
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      background: 'rgba(6,6,18,0.97)', backdropFilter: 'blur(24px)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      fontFamily: '-apple-system, sans-serif', color: '#fff',
      padding: '24px 16px', overflowY: 'auto',
    }}>
      <div style={{ fontSize: 28, fontWeight: 800, marginBottom: 4, letterSpacing: -0.5 }}>
        Casa Blanca 🌴
      </div>
      <div style={{ color: 'rgba(255,255,255,0.38)', fontSize: 13, marginBottom: 28 }}>
        {initial ? 'Editar perfil' : 'Bem-vindo — crie seu perfil'}
      </div>

      {/* Step dots */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {STEPS.map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%', transition: 'all 0.3s',
            background: i === step ? '#f39c12' : i < step ? '#27ae60' : 'rgba(255,255,255,0.18)',
          }} />
        ))}
      </div>
      <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 22 }}>{STEPS[step]}</div>

      {/* STEP 0 — Avatar */}
      {step === 0 && (
        <div style={{ width: '100%', maxWidth: 480 }}>
          {/* Face emoji */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 18 }}>
            {FACE_EMOJIS.map(e => (
              <button key={e} onClick={() => setFaceEmoji(e)} style={{
                fontSize: 22, padding: '7px 9px', borderRadius: 12, cursor: 'pointer',
                background: faceEmoji === e ? 'rgba(243,156,18,0.28)' : 'rgba(255,255,255,0.07)',
                border: faceEmoji === e ? '2px solid #f39c12' : '2px solid transparent',
              }}>{e}</button>
            ))}
          </div>
          {/* Preview */}
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto',
              background: outfit.bodyColor, fontSize: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid rgba(255,255,255,0.15)',
            }}>{faceEmoji}</div>
          </div>
          {/* Outfit grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 9, marginBottom: 4 }}>
            {OUTFITS.map(o => (
              <button key={o.id} onClick={() => setOutfitId(o.id)} style={{
                borderRadius: 14, padding: '10px 6px', cursor: 'pointer', color: '#fff',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5,
                background: outfitId === o.id ? 'rgba(243,156,18,0.16)' : 'rgba(255,255,255,0.05)',
                border: outfitId === o.id ? '2px solid #f39c12' : '2px solid rgba(255,255,255,0.1)',
                transition: 'all 0.15s',
              }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: o.bodyColor }} />
                <div style={{ fontSize: 13 }}>{o.emoji}</div>
                <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.55)', lineHeight: 1 }}>{o.name}</div>
              </button>
            ))}
          </div>
          <button onClick={() => setStep(1)} style={btn}>Próximo →</button>
        </div>
      )}

      {/* STEP 1 — Name + Bio */}
      {step === 1 && (
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 10px',
              background: outfit.bodyColor, fontSize: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>{faceEmoji}</div>
          </div>
          <label style={label}>Seu nome *</label>
          <input
            value={name} onChange={e => setName(e.target.value)}
            placeholder="Como você se chama?" maxLength={24}
            style={input}
          />
          <label style={label}>Sobre você (opcional)</label>
          <textarea
            value={bio} onChange={e => setBio(e.target.value)}
            placeholder="O que você faz? O que gosta?" maxLength={120} rows={3}
            style={{ ...input, resize: 'none' }}
          />
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(0)} style={{ ...btn, background: 'rgba(255,255,255,0.1)', flex: 1 }}>← Voltar</button>
            <button onClick={() => name.trim() && setStep(2)} style={{ ...btn, flex: 2, opacity: name.trim() ? 1 : 0.4 }}>
              Próximo →
            </button>
          </div>
        </div>
      )}

      {/* STEP 2 — Interests */}
      {step === 2 && (
        <div style={{ width: '100%', maxWidth: 480 }}>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
            Escolha até 5 interesses para conectar com pessoas
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 24 }}>
            {INTERESTS.map(i => {
              const sel = interests.includes(i)
              return (
                <button key={i} onClick={() => toggleInterest(i)} style={{
                  padding: '8px 14px', borderRadius: 20, cursor: 'pointer', fontSize: 13,
                  background: sel ? 'rgba(243,156,18,0.22)' : 'rgba(255,255,255,0.07)',
                  border: sel ? '1.5px solid #f39c12' : '1.5px solid rgba(255,255,255,0.14)',
                  color: sel ? '#f39c12' : 'rgba(255,255,255,0.7)',
                  transition: 'all 0.15s',
                }}>{i}</button>
              )
            })}
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(1)} style={{ ...btn, background: 'rgba(255,255,255,0.1)', flex: 1 }}>← Voltar</button>
            <button onClick={handleSave} style={{ ...btn, flex: 2, background: 'linear-gradient(135deg,#f39c12,#e74c3c)' }}>
              Entrar no Club 🏖️
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const btn: React.CSSProperties = {
  marginTop: 16, padding: '14px 20px', borderRadius: 14, border: 'none',
  background: 'rgba(243,156,18,0.85)', color: '#111', fontSize: 15, fontWeight: 700,
  cursor: 'pointer', width: '100%',
}

const input: React.CSSProperties = {
  width: '100%', padding: '12px 14px', borderRadius: 12,
  border: '1.5px solid rgba(255,255,255,0.13)', background: 'rgba(255,255,255,0.07)',
  color: '#fff', fontSize: 15, marginBottom: 14,
  fontFamily: '-apple-system, sans-serif', outline: 'none', boxSizing: 'border-box',
}

const label: React.CSSProperties = {
  display: 'block', fontSize: 11, color: 'rgba(255,255,255,0.4)',
  marginBottom: 6, letterSpacing: 0.6, textTransform: 'uppercase',
}
