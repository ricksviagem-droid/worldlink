import { useState, useRef } from 'react'
import { OUTFITS, INTERESTS, FACE_EMOJIS, COUNTRIES, getOutfit, toFlag, type PlayerProfile } from './outfits'

interface Props {
  initial?: PlayerProfile | null
  onSave: (profile: PlayerProfile) => void
}

const STEPS = ['Avatar', 'Perfil', 'Interesses']

async function compressPhoto(file: File, maxPx = 480, quality = 0.78): Promise<string> {
  return new Promise(resolve => {
    const reader = new FileReader()
    reader.onload = e => {
      const img = new Image()
      img.onload = () => {
        const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width  = Math.round(img.width  * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', quality))
      }
      img.src = e.target!.result as string
    }
    reader.readAsDataURL(file)
  })
}

export function ProfileSetup({ initial, onSave }: Props) {
  const [step, setStep]           = useState(0)
  const [outfitId, setOutfitId]   = useState(initial?.outfitId ?? 'beach')
  const [faceEmoji, setFaceEmoji] = useState(initial?.faceEmoji ?? '😎')
  const [name, setName]           = useState(initial?.name ?? '')
  const [bio, setBio]             = useState(initial?.bio ?? '')
  const [interests, setInterests] = useState<string[]>(initial?.interests ?? [])
  const [photos, setPhotos]       = useState<string[]>(initial?.photos ?? (initial?.photoUrl ? [initial.photoUrl] : []))
  const [nationality, setNationality] = useState(initial?.nationality ?? '')
  const [showNameplate, setShowNameplate] = useState(initial?.showNameplate ?? true)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const outfit = getOutfit(outfitId)

  const toggleInterest = (i: string) =>
    setInterests(prev =>
      prev.includes(i) ? prev.filter(x => x !== i) : prev.length < 5 ? [...prev, i] : prev
    )

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    const slots = Math.min(files.length, 3 - photos.length)
    const compressed: string[] = []
    for (let i = 0; i < slots; i++) {
      compressed.push(await compressPhoto(files[i]))
    }
    setPhotos(prev => [...prev, ...compressed].slice(0, 3))
    setUploading(false)
  }

  const removePhoto = (idx: number) =>
    setPhotos(prev => prev.filter((_, i) => i !== idx))

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      name: name.trim(), bio, interests, outfitId, faceEmoji,
      photoUrl: photos[0] || undefined,
      photos: photos.length > 0 ? photos : undefined,
      nationality: nationality || undefined,
      showNameplate,
    })
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
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 18 }}>
            {FACE_EMOJIS.map(e => (
              <button key={e} onClick={() => setFaceEmoji(e)} style={{
                fontSize: 22, padding: '7px 9px', borderRadius: 12, cursor: 'pointer',
                background: faceEmoji === e ? 'rgba(243,156,18,0.28)' : 'rgba(255,255,255,0.07)',
                border: faceEmoji === e ? '2px solid #f39c12' : '2px solid transparent',
              }}>{e}</button>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%', margin: '0 auto',
              background: outfit.bodyColor, fontSize: 32,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '3px solid rgba(255,255,255,0.15)',
            }}>{faceEmoji}</div>
          </div>
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

      {/* STEP 1 — Name + Bio + Photos + Country */}
      {step === 1 && (
        <div style={{ width: '100%', maxWidth: 400 }}>
          {/* Photo upload grid */}
          <input
            ref={fileRef} type="file" accept="image/*" multiple
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
          />
          <label style={label}>Suas fotos (até 3) — direto do álbum</label>
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {[0, 1, 2].map(idx => (
              <div key={idx} style={{ position: 'relative', flex: 1 }}>
                {photos[idx] ? (
                  <>
                    <img src={photos[idx]} style={{
                      width: '100%', aspectRatio: '1', objectFit: 'cover',
                      borderRadius: 14, border: idx === 0 ? '2px solid #f39c12' : '2px solid rgba(255,255,255,0.12)',
                      display: 'block',
                    }} />
                    {idx === 0 && (
                      <div style={{
                        position: 'absolute', bottom: 4, left: 4, fontSize: 9,
                        background: '#f39c12', color: '#111', padding: '1px 5px', borderRadius: 4, fontWeight: 700,
                      }}>PRINCIPAL</div>
                    )}
                    <button onClick={() => removePhoto(idx)} style={{
                      position: 'absolute', top: 4, right: 4, width: 20, height: 20,
                      borderRadius: '50%', border: 'none', background: 'rgba(0,0,0,0.7)',
                      color: '#fff', fontSize: 11, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>×</button>
                  </>
                ) : (
                  <button onClick={() => fileRef.current?.click()} style={{
                    width: '100%', aspectRatio: '1', borderRadius: 14, cursor: 'pointer',
                    border: '2px dashed rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.04)',
                    color: 'rgba(255,255,255,0.3)', fontSize: 22,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4,
                  }}>
                    <span>📷</span>
                    <span style={{ fontSize: 10 }}>{idx === 0 ? 'Principal' : `Foto ${idx + 1}`}</span>
                  </button>
                )}
              </div>
            ))}
          </div>
          {uploading && <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>Comprimindo...</div>}

          <label style={label}>Seu nome *</label>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Como você se chama?" maxLength={24} style={input} />

          <label style={label}>Sobre você (opcional)</label>
          <textarea value={bio} onChange={e => setBio(e.target.value)} placeholder="O que você faz? O que gosta?" maxLength={120} rows={2} style={{ ...input, resize: 'none' }} />

          <label style={label}>País</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {COUNTRIES.map(c => (
              <button key={c.code} onClick={() => setNationality(nationality === c.code ? '' : c.code)} style={{
                padding: '5px 10px', borderRadius: 10, cursor: 'pointer', fontSize: 13,
                background: nationality === c.code ? 'rgba(243,156,18,0.22)' : 'rgba(255,255,255,0.07)',
                border: nationality === c.code ? '1.5px solid #f39c12' : '1.5px solid rgba(255,255,255,0.12)',
                color: '#fff',
              }}>{toFlag(c.code)} {c.name}</button>
            ))}
          </div>

          <button onClick={() => setShowNameplate(v => !v)} style={{
            ...input, textAlign: 'left', cursor: 'pointer', marginBottom: 16,
            border: showNameplate ? '1.5px solid #f39c12' : '1.5px solid rgba(255,255,255,0.12)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 18 }}>{showNameplate ? '👁️' : '🙈'}</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{showNameplate ? 'Mostrar meu nome e foto' : 'Ficar invisível para outros'}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                {showNameplate ? 'Seu nome e foto aparecem acima do avatar' : 'Só você se vê, ninguém sabe quem é você'}
              </div>
            </div>
          </button>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setStep(0)} style={{ ...btn, background: 'rgba(255,255,255,0.1)', flex: 1 }}>← Voltar</button>
            <button onClick={() => name.trim() && setStep(2)} style={{ ...btn, flex: 2, opacity: name.trim() ? 1 : 0.4 }}>Próximo →</button>
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
