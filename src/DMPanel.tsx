import { useState, useEffect, useRef } from 'react'
import type { CardProfile } from './ProfileCard'

export interface DMMessage {
  fromId: string
  text: string
  timestamp: number
}

interface Props {
  partnerProfile: CardProfile
  myId: string
  myEmoji?: string
  myBodyColor: string
  myHeadColor: string
  messages: DMMessage[]
  onSend: (text: string) => void
  onBack: () => void
  onClose: () => void
}

export function DMPanel({
  partnerProfile, myId, myEmoji, myBodyColor, myHeadColor,
  messages, onSend, onBack, onClose,
}: Props) {
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLInputElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const send = () => {
    const t = text.trim()
    if (!t) return
    onSend(t)
    setText('')
  }

  return (
    <div style={{
      position: 'absolute', right: 0, top: 0, bottom: 0, width: 300, zIndex: 45,
      background: 'rgba(5,5,16,0.98)', backdropFilter: 'blur(22px)',
      borderLeft: '1px solid rgba(255,255,255,0.07)',
      display: 'flex', flexDirection: 'column',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif', color: '#fff',
      animation: 'slideInRight 0.2s ease',
    }}>

      {/* Header */}
      <div style={{
        padding: '14px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <button onClick={onBack} style={{
          width: 30, height: 30, borderRadius: '50%', border: 'none',
          background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)',
          cursor: 'pointer', fontSize: 14, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>‹</button>

        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: `radial-gradient(circle at 35% 30%, ${partnerProfile.headColor}, ${partnerProfile.bodyColor})`,
          border: '2px solid rgba(255,255,255,0.16)', fontSize: 17,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{partnerProfile.faceEmoji ?? partnerProfile.name[0]}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {partnerProfile.name}
          </div>
          <div style={{ fontSize: 10, color: '#f39c12', marginTop: 1 }}>💫 Match</div>
        </div>

        <button onClick={onClose} style={{
          width: 28, height: 28, borderRadius: '50%', border: 'none',
          background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)',
          cursor: 'pointer', fontSize: 15, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '14px 12px',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center', margin: 'auto', padding: '40px 20px',
            color: 'rgba(255,255,255,0.24)', fontSize: 12, lineHeight: 1.65,
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>💬</div>
            Vocês se curtiram!<br />Mande a primeira mensagem.
          </div>
        )}

        {messages.map((m, i) => {
          const isMe = m.fromId === myId
          return (
            <div key={i} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: 6 }}>
              {!isMe && (
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: `radial-gradient(circle at 35% 30%, ${partnerProfile.headColor}, ${partnerProfile.bodyColor})`,
                  border: '1px solid rgba(255,255,255,0.14)', fontSize: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{partnerProfile.faceEmoji ?? partnerProfile.name[0]}</div>
              )}

              <div style={{
                maxWidth: '74%', padding: '9px 13px',
                borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: isMe ? '#f39c12' : 'rgba(255,255,255,0.09)',
                color: isMe ? '#111' : '#fff',
                fontSize: 13, lineHeight: 1.45,
                fontWeight: isMe ? 500 : 400,
                wordBreak: 'break-word',
              }}>{m.text}</div>

              {isMe && (
                <div style={{
                  width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                  background: `radial-gradient(circle at 35% 30%, ${myHeadColor}, ${myBodyColor})`,
                  border: '1px solid rgba(255,255,255,0.14)', fontSize: 12,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>{myEmoji ?? '😊'}</div>
              )}
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px 14px', borderTop: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <input
          ref={inputRef}
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Mensagem..."
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 22,
            border: '1px solid rgba(255,255,255,0.11)',
            background: 'rgba(255,255,255,0.07)', color: '#fff', fontSize: 13,
            fontFamily: 'inherit', outline: 'none',
          }}
        />
        <button onClick={send} disabled={!text.trim()} style={{
          width: 38, height: 38, borderRadius: '50%', border: 'none', flexShrink: 0,
          background: text.trim() ? '#f39c12' : 'rgba(255,255,255,0.07)',
          color: text.trim() ? '#111' : 'rgba(255,255,255,0.25)',
          fontSize: 17, cursor: text.trim() ? 'pointer' : 'default',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s',
        }}>↑</button>
      </div>
    </div>
  )
}
