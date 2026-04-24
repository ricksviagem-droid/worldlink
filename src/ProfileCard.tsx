import { getOutfit, type PlayerProfile } from './outfits'

interface Props {
  profile: PlayerProfile
  myInterests: string[]
  isLiked: boolean
  isMatch: boolean
  onLike: () => void
  onSuperLike: () => void
  onClose: () => void
}

export function ProfileCard({ profile, myInterests, isLiked, isMatch, onLike, onSuperLike, onClose }: Props) {
  const outfit = getOutfit(profile.outfitId)
  const common = profile.interests.filter(i => myInterests.includes(i))
  const rest   = profile.interests.filter(i => !myInterests.includes(i))

  return (
    <div style={{
      position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
      zIndex: 30, width: 230,
      background: 'rgba(6,6,18,0.93)', backdropFilter: 'blur(18px)',
      borderRadius: 22, padding: '20px 18px',
      border: isMatch ? '1.5px solid #f39c12' : '1.5px solid rgba(255,255,255,0.11)',
      boxShadow: isMatch ? '0 0 32px rgba(243,156,18,0.28)' : '0 8px 40px rgba(0,0,0,0.5)',
      fontFamily: '-apple-system, sans-serif', color: '#fff',
      animation: 'fadeInRight 0.2s ease',
    }}>
      <button onClick={onClose} style={{
        position: 'absolute', top: 10, right: 12,
        background: 'none', border: 'none', color: 'rgba(255,255,255,0.28)',
        cursor: 'pointer', fontSize: 20, lineHeight: 1,
      }}>×</button>

      {isMatch && (
        <div style={{
          textAlign: 'center', color: '#f39c12', fontSize: 11, fontWeight: 800,
          letterSpacing: 1.5, marginBottom: 10,
          textShadow: '0 0 12px rgba(243,156,18,0.5)',
        }}>✨ MATCH!</div>
      )}

      {/* Avatar */}
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{
          width: 62, height: 62, borderRadius: '50%', margin: '0 auto 8px',
          background: outfit.bodyColor, fontSize: 26,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '3px solid rgba(255,255,255,0.13)',
        }}>{profile.faceEmoji}</div>
        <div style={{ fontWeight: 700, fontSize: 16 }}>{profile.name}</div>
        {profile.bio && (
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)', marginTop: 5, lineHeight: 1.45 }}>
            {profile.bio}
          </div>
        )}
      </div>

      {/* Common interests */}
      {common.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 9, color: '#f39c12', letterSpacing: 1.5, marginBottom: 5, fontWeight: 700 }}>
            EM COMUM
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {common.map(i => (
              <span key={i} style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 10,
                background: 'rgba(243,156,18,0.18)', color: '#f39c12',
                border: '1px solid rgba(243,156,18,0.35)',
              }}>{i}</span>
            ))}
          </div>
        </div>
      )}

      {/* Other interests */}
      {rest.length > 0 && (
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {rest.map(i => (
              <span key={i} style={{
                fontSize: 10, padding: '3px 8px', borderRadius: 10,
                background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)',
              }}>{i}</span>
            ))}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button onClick={onSuperLike} title="Super Like" style={{
          flex: 1, padding: '11px 0', borderRadius: 12, cursor: 'pointer', fontSize: 18,
          background: 'rgba(243,156,18,0.1)', border: '1.5px solid rgba(243,156,18,0.4)',
          transition: 'all 0.15s',
        }}>⭐</button>
        <button onClick={onLike} disabled={isLiked} style={{
          flex: 2.5, padding: '11px 0', borderRadius: 12, cursor: isLiked ? 'default' : 'pointer',
          border: 'none', fontSize: 13, fontWeight: 700, color: '#fff',
          background: isLiked ? 'rgba(231,76,60,0.45)' : '#e74c3c',
          transition: 'all 0.15s',
        }}>{isLiked ? '❤️ Curtido' : '❤️ Curtir'}</button>
      </div>
    </div>
  )
}
