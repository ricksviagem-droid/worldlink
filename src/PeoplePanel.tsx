import { useState } from 'react'
import { NPCS, type NpcDef } from './npcData'
import { getOutfit, toFlag, type PlayerProfile } from './outfits'
import { ProfileCard, type CardProfile } from './ProfileCard'

interface Props {
  players: Record<string, { x: number; z: number }>
  profiles: Record<string, PlayerProfile>
  myId: string
  matches: Set<string>
  likedIds: Set<string>
  likedNpcIds: Set<string>
  myInterests: string[]
  onLikePlayer: (id: string) => void
  onLikeNpc: (id: string) => void
  onChatNpc: (npc: NpcDef) => void
  onOpenDM: (id: string) => void
  onClose: () => void
}

type View = 'list' | { type: 'npc'; npc: NpcDef } | { type: 'player'; id: string }

export function PeoplePanel({
  players, profiles, myId, matches, likedIds, likedNpcIds, myInterests,
  onLikePlayer, onLikeNpc, onChatNpc, onOpenDM, onClose,
}: Props) {
  const [view, setView] = useState<View>('list')

  const onlinePlayers = Object.entries(players).filter(([id]) => id !== myId && profiles[id])

  if (view !== 'list') {
    const npc    = view.type === 'npc' ? view.npc : null
    const pid    = view.type === 'player' ? view.id : null
    const rp     = pid ? profiles[pid] : null
    const outfit = rp ? getOutfit(rp.outfitId) : null

    const card: CardProfile = npc
      ? { name: npc.name, bodyColor: npc.bodyColor, headColor: npc.headColor, bio: npc.bio, age: npc.age, role: npc.role, personality: npc.personality, interests: npc.interests, story: npc.story, isNpc: true }
      : { name: rp!.name, faceEmoji: rp!.faceEmoji, bodyColor: outfit!.bodyColor, headColor: outfit!.headColor, bio: rp!.bio, interests: rp!.interests, photoUrl: rp!.photoUrl, nationality: rp!.nationality, isNpc: false }

    return (
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 272, zIndex: 40,
        background: 'rgba(5,5,16,0.97)', backdropFilter: 'blur(22px)',
        borderLeft: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', flexDirection: 'column',
        fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
        animation: 'slideInRight 0.2s ease',
      }}>
        {/* Back bar */}
        <div style={{
          padding: '14px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <button onClick={() => setView('list')} style={{
            width: 30, height: 30, borderRadius: '50%', border: 'none',
            background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)',
            cursor: 'pointer', fontSize: 15,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>‹</button>
          <span style={{ color: '#fff', fontWeight: 600, fontSize: 14 }}>{card.name}</span>
          <button onClick={onClose} style={{
            marginLeft: 'auto', width: 28, height: 28, borderRadius: '50%', border: 'none',
            background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)',
            cursor: 'pointer', fontSize: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>×</button>
        </div>

        {/* ProfileCard rendered inline (no absolute positioning) */}
        <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
          {/* Gradient header */}
          <div style={{
            height: 80, background: `linear-gradient(135deg, ${card.headColor}bb, ${card.bodyColor}99)`,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}>
            <div style={{
              width: 66, height: 66, borderRadius: '50%', overflow: 'hidden',
              background: `radial-gradient(circle at 38% 32%, ${card.headColor}, ${card.bodyColor})`,
              border: '3px solid rgba(255,255,255,0.22)', fontSize: 26,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', top: 33, boxShadow: '0 6px 20px rgba(0,0,0,0.4)',
            }}>
              {card.photoUrl
                ? <img src={card.photoUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                : (card.faceEmoji ?? card.name[0])
              }
            </div>
          </div>

          {/* Info */}
          <div style={{ textAlign: 'center', paddingTop: 40, paddingBottom: 10, paddingInline: 16, color: '#fff' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 7 }}>
              <span style={{ fontWeight: 700, fontSize: 17 }}>{card.name}</span>
              {card.age != null && <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>{card.age}</span>}
              {card.nationality && <span style={{ fontSize: 16 }}>{toFlag(card.nationality)}</span>}
            </div>
            {(card.role || card.city) && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 3 }}>{card.role ?? `📍 ${card.city}`}</div>}
            {card.personality && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.26)', marginTop: 3, fontStyle: 'italic' }}>{card.personality}</div>}
          </div>

          {/* Bio */}
          {card.bio && (
            <div style={{ padding: '0 16px 12px', color: 'rgba(255,255,255,0.65)', fontSize: 12, lineHeight: 1.55 }}>
              {card.bio}
            </div>
          )}

          {/* Interests */}
          {card.interests.length > 0 && (
            <div style={{ padding: '0 16px 12px' }}>
              <div style={{ fontSize: 9, color: '#f39c12', letterSpacing: 1.5, marginBottom: 6, fontWeight: 700 }}>INTERESSES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {card.interests.map(i => {
                  const isCommon = myInterests.includes(i)
                  return (
                    <span key={i} style={{
                      fontSize: 10, padding: '3px 9px', borderRadius: 10,
                      background: isCommon ? 'rgba(243,156,18,0.15)' : 'rgba(255,255,255,0.07)',
                      color: isCommon ? '#f39c12' : 'rgba(255,255,255,0.4)',
                      border: `1px solid ${isCommon ? 'rgba(243,156,18,0.3)' : 'transparent'}`,
                    }}>{i}</span>
                  )
                })}
              </div>
            </div>
          )}

          {/* Story (NPC only) */}
          {card.story && (
            <div style={{ padding: '0 16px 16px' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', letterSpacing: 1.5, marginBottom: 6, fontWeight: 700 }}>HISTÓRIA</div>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.62, margin: 0 }}>{card.story}</p>
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, padding: '8px 13px 20px' }}>
            {npc ? (
              <>
                <button onClick={() => { onLikeNpc(npc.id); setView('list') }} disabled={likedNpcIds.has(npc.id)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 14, border: 'none', fontFamily: 'inherit',
                  background: likedNpcIds.has(npc.id) ? 'rgba(231,76,60,0.3)' : 'rgba(231,76,60,0.85)',
                  color: '#fff', fontSize: 13, fontWeight: 700, cursor: likedNpcIds.has(npc.id) ? 'default' : 'pointer',
                }}>{likedNpcIds.has(npc.id) ? '❤️ Curtido' : '❤️ Curtir'}</button>
                <button onClick={() => { onChatNpc(npc); onClose() }} style={{
                  flex: 1, padding: '10px 0', borderRadius: 14, fontFamily: 'inherit',
                  border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)',
                  color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                }}>💬 Falar</button>
              </>
            ) : pid ? (
              <>
                <button onClick={() => { onLikePlayer(pid); }} disabled={likedIds.has(pid)} style={{
                  flex: 1, padding: '10px 0', borderRadius: 14, border: 'none', fontFamily: 'inherit',
                  background: likedIds.has(pid) ? 'rgba(231,76,60,0.3)' : 'rgba(231,76,60,0.85)',
                  color: '#fff', fontSize: 13, fontWeight: 700, cursor: likedIds.has(pid) ? 'default' : 'pointer',
                }}>{likedIds.has(pid) ? '❤️ Curtido' : '❤️ Curtir'}</button>
                {matches.has(pid) && (
                  <button onClick={() => { onOpenDM(pid); onClose() }} style={{
                    flex: 1, padding: '10px 0', borderRadius: 14, fontFamily: 'inherit',
                    border: '1.5px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.07)',
                    color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  }}>💬 Mensagem</button>
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>
    )
  }

  // ── List view ─────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'absolute', right: 0, top: 0, bottom: 0, width: 272, zIndex: 40,
      background: 'rgba(5,5,16,0.97)', backdropFilter: 'blur(22px)',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', color: '#fff',
      animation: 'slideInRight 0.2s ease',
    }}>
      <div style={{
        padding: '20px 16px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontWeight: 700, fontSize: 17 }}>👥 No Club</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.32)', marginTop: 2 }}>
            {onlinePlayers.length} jogador{onlinePlayers.length !== 1 ? 'es' : ''} · {NPCS.length} staff
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 30, height: 30, borderRadius: '50%', border: 'none',
          background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.55)',
          cursor: 'pointer', fontSize: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 10px' }}>
        {/* Staff */}
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', letterSpacing: 1.6, fontWeight: 700, marginBottom: 8, paddingLeft: 4 }}>
          STAFF
        </div>
        {NPCS.map(npc => (
          <PersonRow
            key={npc.id}
            avatar={<ColorAvatar bodyColor={npc.bodyColor} headColor={npc.headColor} />}
            name={npc.name}
            sub={npc.role}
            onClick={() => setView({ type: 'npc', npc })}
          />
        ))}

        {/* Players */}
        <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', letterSpacing: 1.6, fontWeight: 700, margin: '14px 0 8px', paddingLeft: 4 }}>
          JOGADORES ONLINE
        </div>
        {onlinePlayers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '24px 16px', color: 'rgba(255,255,255,0.22)', fontSize: 12 }}>
            Nenhum outro jogador online
          </div>
        )}
        {onlinePlayers.map(([id]) => {
          const rp = profiles[id]
          const outfit = getOutfit(rp.outfitId)
          return (
            <PersonRow
              key={id}
              avatar={
                rp.photoUrl
                  ? <PhotoAvatar url={rp.photoUrl} bodyColor={outfit.bodyColor} headColor={outfit.headColor} />
                  : <ColorAvatar bodyColor={outfit.bodyColor} headColor={outfit.headColor} emoji={rp.faceEmoji} />
              }
              name={rp.name}
              sub={rp.nationality ? toFlag(rp.nationality) : undefined}
              badge={matches.has(id) ? '💫' : undefined}
              onClick={() => setView({ type: 'player', id })}
            />
          )
        })}
      </div>
    </div>
  )
}

// ── Small reusable row ────────────────────────────────────────────────────────
function PersonRow({ avatar, name, sub, badge, onClick }: {
  avatar: React.ReactNode; name: string; sub?: string; badge?: string; onClick: () => void
}) {
  return (
    <div onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 11,
      padding: '10px 10px', borderRadius: 14, marginBottom: 6,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)',
      cursor: 'pointer', transition: 'background 0.15s',
    }}
      onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.08)')}
      onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.04)')}
    >
      {avatar}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
        {sub && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 1 }}>{sub}</div>}
      </div>
      {badge && <span style={{ fontSize: 14 }}>{badge}</span>}
      <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 14 }}>›</span>
    </div>
  )
}

function ColorAvatar({ bodyColor, headColor, emoji }: { bodyColor: string; headColor: string; emoji?: string }) {
  return (
    <div style={{
      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
      background: `radial-gradient(circle at 35% 30%, ${headColor}, ${bodyColor})`,
      border: '2px solid rgba(255,255,255,0.12)', fontSize: 18,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>{emoji}</div>
  )
}

function PhotoAvatar({ url, bodyColor, headColor }: { url: string; bodyColor: string; headColor: string }) {
  return (
    <div style={{
      width: 44, height: 44, borderRadius: '50%', flexShrink: 0, overflow: 'hidden',
      background: `radial-gradient(circle at 35% 30%, ${headColor}, ${bodyColor})`,
      border: '2px solid rgba(255,255,255,0.15)',
    }}>
      <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
    </div>
  )
}
