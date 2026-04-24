import { useState } from 'react'

export interface CardProfile {
  name: string
  faceEmoji?: string
  bodyColor: string
  headColor: string
  bio?: string
  age?: number
  role?: string
  city?: string
  personality?: string
  interests: string[]
  story?: string
  photoUrl?: string
  nationality?: string
  isNpc: boolean
}

interface Props {
  profile: CardProfile
  myInterests: string[]
  isLiked: boolean
  isMatch: boolean
  onLike: () => void
  onChat?: () => void
  onClose: () => void
}

type Tab = 'about' | 'interests' | 'story'

export function ProfileCard({ profile, myInterests, isLiked, isMatch, onLike, onChat, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('about')
  const common = profile.interests.filter(i => myInterests.includes(i))
  const rest   = profile.interests.filter(i => !myInterests.includes(i))

  const tabs: { id: Tab; label: string }[] = [
    { id: 'about',     label: 'Sobre' },
    { id: 'interests', label: 'Interesses' },
    ...(profile.story ? [{ id: 'story' as Tab, label: 'História' }] : []),
  ]

  return (
    <div style={{
      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
      zIndex: 30, width: 256,
      background: 'rgba(5,5,16,0.96)', backdropFilter: 'blur(22px)',
      borderRadius: 24,
      border: isMatch ? '1.5px solid #f39c12' : '1.5px solid rgba(255,255,255,0.09)',
      boxShadow: isMatch
        ? '0 0 40px rgba(243,156,18,0.2), 0 16px 56px rgba(0,0,0,0.65)'
        : '0 16px 56px rgba(0,0,0,0.65)',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', color: '#fff',
      overflow: 'hidden',
      animation: 'fadeInRight 0.22s ease',
    }}>

      {/* Gradient header */}
      <div style={{
        height: 88,
        background: `linear-gradient(135deg, ${profile.headColor}bb 0%, ${profile.bodyColor}99 100%)`,
        position: 'relative',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}>
        {/* Close */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 9, right: 10,
          background: 'rgba(0,0,0,0.35)', border: 'none', color: 'rgba(255,255,255,0.85)',
          cursor: 'pointer', fontSize: 15, width: 26, height: 26, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>

        {isMatch && (
          <div style={{
            position: 'absolute', top: 10, left: 11,
            background: 'rgba(243,156,18,0.92)', borderRadius: 10, padding: '2px 9px',
            fontSize: 9, fontWeight: 800, letterSpacing: 1.2, color: '#111',
          }}>✨ MATCH</div>
        )}

        {/* Avatar bubble — sits half in header, half below */}
        <div style={{
          width: 70, height: 70, borderRadius: '50%',
          background: `radial-gradient(circle at 38% 32%, ${profile.headColor}, ${profile.bodyColor})`,
          border: '3px solid rgba(255,255,255,0.22)',
          fontSize: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
          position: 'relative', top: 35,
          boxShadow: '0 6px 20px rgba(0,0,0,0.45)',
          flexShrink: 0, overflow: 'hidden',
        }}>
          {profile.photoUrl
            ? <img src={profile.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            : (profile.faceEmoji ?? profile.name[0])
          }
        </div>
      </div>

      {/* Name + info */}
      <div style={{ textAlign: 'center', paddingTop: 42, paddingBottom: 10, paddingInline: 16 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 7 }}>
          <span style={{ fontWeight: 700, fontSize: 17 }}>{profile.name}</span>
          {profile.age != null && (
            <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.42)' }}>{profile.age}</span>
          )}
        </div>
        {(profile.role || profile.city) && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 3, letterSpacing: 0.2 }}>
            {profile.role ?? `📍 ${profile.city}`}
          </div>
        )}
        {profile.personality && (
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.26)', marginTop: 3, fontStyle: 'italic' }}>
            {profile.personality}
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingInline: 6 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '8px 2px', background: 'none', border: 'none', cursor: 'pointer',
            color: tab === t.id ? '#f39c12' : 'rgba(255,255,255,0.3)',
            fontSize: 11, fontWeight: tab === t.id ? 700 : 400, letterSpacing: 0.2,
            borderBottom: tab === t.id ? '2px solid #f39c12' : '2px solid transparent',
            transition: 'color 0.15s, border-color 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding: '13px 16px', minHeight: 92 }}>
        {tab === 'about' && (
          profile.bio
            ? <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.68)', lineHeight: 1.58, margin: 0 }}>{profile.bio}</p>
            : <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', margin: 0 }}>Sem bio ainda.</p>
        )}

        {tab === 'interests' && (
          <div>
            {common.length > 0 && (
              <div style={{ marginBottom: 9 }}>
                <div style={{ fontSize: 9, color: '#f39c12', letterSpacing: 1.6, marginBottom: 5, fontWeight: 700 }}>
                  EM COMUM
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {common.map(i => (
                    <span key={i} style={{
                      fontSize: 10, padding: '3px 8px', borderRadius: 10,
                      background: 'rgba(243,156,18,0.15)', color: '#f39c12',
                      border: '1px solid rgba(243,156,18,0.28)',
                    }}>{i}</span>
                  ))}
                </div>
              </div>
            )}
            {rest.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {rest.map(i => (
                  <span key={i} style={{
                    fontSize: 10, padding: '3px 8px', borderRadius: 10,
                    background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.38)',
                  }}>{i}</span>
                ))}
              </div>
            )}
            {profile.interests.length === 0 && (
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.25)', fontStyle: 'italic', margin: 0 }}>
                Sem interesses cadastrados.
              </p>
            )}
          </div>
        )}

        {tab === 'story' && profile.story && (
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.62)', lineHeight: 1.62, margin: 0 }}>
            {profile.story}
          </p>
        )}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, padding: '0 13px 13px' }}>
        <button onClick={onLike} disabled={isLiked} style={{
          flex: 1, padding: '10px 0', borderRadius: 14,
          cursor: isLiked ? 'default' : 'pointer',
          border: 'none', fontSize: 13, fontWeight: 700, color: '#fff',
          background: isLiked ? 'rgba(231,76,60,0.3)' : 'rgba(231,76,60,0.85)',
          transition: 'background 0.15s',
        }}>{isLiked ? '❤️ Curtido' : '❤️ Curtir'}</button>

        {onChat && (
          <button onClick={onChat} style={{
            flex: 1, padding: '10px 0', borderRadius: 14, cursor: 'pointer',
            border: '1.5px solid rgba(255,255,255,0.15)', fontSize: 13, fontWeight: 700,
            color: 'rgba(255,255,255,0.85)', background: 'rgba(255,255,255,0.07)',
            transition: 'background 0.15s',
          }}>💬 Falar</button>
        )}
      </div>
    </div>
  )
}
