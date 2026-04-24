import { useEffect, useRef, useState } from 'react'
import { audio } from './audio'

const CUSTOMER_NAMES: Record<string, string> = {
  c1: 'Carlos', c2: 'Sofia', c3: 'Jake', c4: 'Marina', c5: 'Pedro',
}
const CUSTOMER_EMOJIS: Record<string, string> = {
  c1: '🧔', c2: '💁‍♀️', c3: '🤙', c4: '🧘‍♀️', c5: '💼',
}

type Msg = { role: 'user' | 'assistant'; content: string }

interface Props {
  customerId: string
  onClose: (exchangeCount: number) => void
}

export function CustomerChat({ customerId, onClose }: Props) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [opening, setOpening] = useState(true)
  const endRef = useRef<HTMLDivElement>(null)
  const exchangeCount = useRef(0)
  const name = CUSTOMER_NAMES[customerId] ?? 'Customer'
  const emoji = CUSTOMER_EMOJIS[customerId] ?? '🙂'

  // Customer greets first
  useEffect(() => {
    fetch('/api/customer-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, messages: [] }),
    })
      .then(r => r.json())
      .then(({ reply }) => {
        setMessages([{ role: 'assistant', content: reply }])
        setOpening(false)
      })
  }, [])

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || loading) return
    const next: Msg[] = [...messages, { role: 'user', content: text }]
    setMessages(next)
    setInput('')
    setLoading(true)
    exchangeCount.current++
    audio.playSend()
    try {
      const r = await fetch('/api/customer-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, messages: next }),
      })
      const { reply } = await r.json()
      setMessages(m => [...m, { role: 'assistant', content: reply }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        width: '100%', maxWidth: 420, margin: '0 16px',
        background: 'rgba(8,8,20,0.72)', backdropFilter: 'blur(24px)',
        borderRadius: 22, overflow: 'hidden',
        border: '1.5px solid rgba(255,255,255,0.1)',
        fontFamily: '-apple-system, sans-serif',
        display: 'flex', flexDirection: 'column', maxHeight: '70vh',
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 18px', borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontSize: 28 }}>{emoji}</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: 15 }}>{name}</div>
              <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>Cliente · Casa Blanca</div>
            </div>
          </div>
          <button onClick={() => { audio.playClose(); onClose(exchangeCount.current) }} style={{
            background: 'rgba(255,255,255,0.08)', border: 'none', color: 'rgba(255,255,255,0.5)',
            borderRadius: 10, padding: '6px 12px', cursor: 'pointer', fontSize: 13,
          }}>✕ Fechar</button>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {opening && (
            <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: 13 }}>...</div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '82%',
            }}>
              <div style={{
                padding: '10px 14px', borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                background: m.role === 'user' ? 'rgba(243,156,18,0.85)' : 'rgba(255,255,255,0.1)',
                color: m.role === 'user' ? '#111' : '#fff',
                fontSize: 14, lineHeight: 1.45, fontWeight: m.role === 'user' ? 600 : 400,
              }}>{m.content}</div>
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', color: 'rgba(255,255,255,0.35)', fontSize: 13, padding: '4px 8px' }}>...</div>
          )}
          <div ref={endRef} />
        </div>

        {/* Input */}
        <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: 8 }}>
          <input
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Responda ao cliente..."
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 14,
              border: '1.5px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.07)',
              color: '#fff', fontSize: 14, fontFamily: '-apple-system, sans-serif', outline: 'none',
            }}
          />
          <button onClick={send} disabled={loading || !input.trim()} style={{
            padding: '10px 16px', borderRadius: 14, border: 'none',
            background: input.trim() ? '#f39c12' : 'rgba(255,255,255,0.1)',
            color: input.trim() ? '#111' : 'rgba(255,255,255,0.3)',
            fontWeight: 700, cursor: input.trim() ? 'pointer' : 'default', fontSize: 14,
          }}>Enviar</button>
        </div>
      </div>
    </div>
  )
}
