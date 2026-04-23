import { useEffect, useRef, useState } from 'react'
import type { NpcDef } from './npcData'

type Message = { role: 'user' | 'assistant'; content: string }

interface ChatPanelProps {
  npc: NpcDef
  onClose: () => void
}

export function ChatPanel({ npc, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchReply([{ role: 'user', content: '*approaches and makes eye contact*' }], [])
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const fetchReply = async (outgoing: Message[], existing: Message[]) => {
    setLoading(true)
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ npcId: npc.id, messages: outgoing }),
      })
      const data = await res.json()
      setMessages([...existing, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages([...existing, { role: 'assistant', content: `Hey, I'm ${npc.name}!` }])
    }
    setLoading(false)
  }

  const sendMessage = () => {
    if (!input.trim() || loading) return
    const userMsg = input.trim()
    setInput('')
    const updated: Message[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(updated)
    fetchReply(updated, updated)
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div style={{
      position: 'absolute', bottom: 20, right: 20, width: 360,
      background: 'rgba(8, 8, 24, 0.93)',
      borderRadius: 18,
      border: '1px solid rgba(255,255,255,0.09)',
      backdropFilter: 'blur(14px)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
      zIndex: 100,
      boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '14px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: npc.bodyColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 17, fontWeight: 700, color: '#111',
          flexShrink: 0, border: '2px solid rgba(255,255,255,0.15)',
        }}>
          {npc.name[0]}
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{npc.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{npc.role} · Casa Blanca</div>
        </div>
        <button onClick={onClose} style={{
          marginLeft: 'auto', background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.4)', fontSize: 22,
          cursor: 'pointer', padding: '0 4px', lineHeight: 1,
          transition: 'color 0.2s',
        }}>×</button>
      </div>

      {/* Messages */}
      <div style={{
        height: 260, overflowY: 'auto', padding: '14px',
        display: 'flex', flexDirection: 'column', gap: 10,
        scrollbarWidth: 'none',
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
          }}>
            <div style={{
              maxWidth: '80%', padding: '9px 14px',
              borderRadius: msg.role === 'user'
                ? '14px 14px 4px 14px'
                : '14px 14px 14px 4px',
              background: msg.role === 'user'
                ? 'rgba(243,156,18,0.2)'
                : 'rgba(255,255,255,0.07)',
              color: msg.role === 'user'
                ? '#f8d580'
                : 'rgba(255,255,255,0.88)',
              fontSize: 14, lineHeight: 1.55,
              border: msg.role === 'user'
                ? '1px solid rgba(243,156,18,0.25)'
                : '1px solid rgba(255,255,255,0.06)',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '10px 16px',
              borderRadius: '14px 14px 14px 4px',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.3)', fontSize: 20, letterSpacing: 4,
            }}>
              ···
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Help buttons */}
      <div style={{
        display: 'flex', gap: 6, padding: '8px 14px',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}>
        {[
          { icon: '🇧🇷', label: 'Translate' },
          { icon: '💬', label: 'Suggest' },
          { icon: '✏️', label: 'Fix' },
          { icon: '🔊', label: 'Hear' },
        ].map(btn => (
          <button key={btn.label} title={btn.label} style={{
            flex: 1, padding: '7px 4px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            color: 'rgba(255,255,255,0.5)',
            fontSize: 10, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
          }}>
            <span style={{ fontSize: 15 }}>{btn.icon}</span>
            <span>{btn.label}</span>
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: 'flex', gap: 8, padding: '10px 14px 14px' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Say something..."
          autoFocus
          style={{
            flex: 1, padding: '10px 14px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, color: '#fff',
            fontSize: 14, outline: 'none',
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '10px 16px',
            background: loading || !input.trim() ? 'rgba(243,156,18,0.3)' : '#f39c12',
            border: 'none', borderRadius: 10,
            color: '#111', fontWeight: 700,
            fontSize: 13, cursor: loading ? 'default' : 'pointer',
          }}
        >
          Send
        </button>
      </div>
    </div>
  )
}
