import { useEffect, useRef, useState } from 'react'
import type { NpcDef } from './npcData'
import { audio } from './audio'

type Message = { role: 'user' | 'assistant'; content: string }
type HelpMode = 'translate' | 'suggest' | 'fix' | 'hear' | null

interface ChatPanelProps {
  npc: NpcDef
  onClose: () => void
}

export function ChatPanel({ npc, onClose }: ChatPanelProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [helpMode, setHelpMode] = useState<HelpMode>(null)
  const [helpResult, setHelpResult] = useState('')
  const [helpLoading, setHelpLoading] = useState(false)
  const [fixInput, setFixInput] = useState('')
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

  const sendMessage = (text?: string) => {
    const userMsg = (text ?? input).trim()
    if (!userMsg || loading) return
    audio.playSend()
    setInput('')
    const updated: Message[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(updated)
    fetchReply(updated, updated)
    setHelpMode(null)
    setHelpResult('')
  }

  const handleKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  const lastNpcMsg = () =>
    [...messages].reverse().find(m => m.role === 'assistant')?.content || ''

  // ── Help handlers ────────────────────────────────────────────────────────
  const openHelp = (mode: HelpMode) => {
    setHelpMode(prev => prev === mode ? null : mode)
    setHelpResult('')
    setFixInput('')
  }

  const runTranslate = async () => {
    const text = lastNpcMsg()
    if (!text) return
    setHelpLoading(true)
    try {
      const res = await fetch('/api/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'translate', text }),
      })
      const data = await res.json()
      setHelpResult(data.result || '')
    } catch { setHelpResult('Translation failed.') }
    setHelpLoading(false)
  }

  const runSuggest = async () => {
    setHelpLoading(true)
    try {
      const res = await fetch('/api/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'suggest', npcId: npc.id, conversation: messages }),
      })
      const data = await res.json()
      setHelpResult(data.result || '')
    } catch { setHelpResult('') }
    setHelpLoading(false)
  }

  const runFix = async () => {
    if (!fixInput.trim()) return
    setHelpLoading(true)
    try {
      const res = await fetch('/api/help', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'fix', text: fixInput }),
      })
      const data = await res.json()
      setHelpResult(data.result || '')
    } catch { setHelpResult('Fix failed.') }
    setHelpLoading(false)
  }

  const runHear = async () => {
    const text = lastNpcMsg()
    if (!text) return
    setHelpLoading(true)
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, npcId: npc.id }),
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      new Audio(url).play()
    } catch { /* silent fail */ }
    setHelpLoading(false)
  }

  const handleHelpClick = (mode: HelpMode) => {
    openHelp(mode)
    if (mode === 'translate') runTranslate()
    if (mode === 'suggest') runSuggest()
    if (mode === 'hear') { setHelpMode('hear'); runHear() }
  }

  const suggestions = helpResult.split('\n').filter(s => s.trim())

  // ── Styles ───────────────────────────────────────────────────────────────
  const panel: React.CSSProperties = {
    position: 'absolute', bottom: 20, right: 20, width: 360,
    background: 'rgba(8,8,24,0.94)',
    borderRadius: 18,
    border: '1px solid rgba(255,255,255,0.09)',
    backdropFilter: 'blur(14px)',
    display: 'flex', flexDirection: 'column',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    zIndex: 100,
    boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
  }

  return (
    <div style={panel}>
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
          fontSize: 17, fontWeight: 700, color: '#111', flexShrink: 0,
          border: '2px solid rgba(255,255,255,0.15)',
        }}>
          {npc.name[0]}
        </div>
        <div>
          <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>{npc.name}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>{npc.role} · Casa Blanca</div>
        </div>
        <button onClick={onClose} style={{
          marginLeft: 'auto', background: 'none', border: 'none',
          color: 'rgba(255,255,255,0.4)', fontSize: 22, cursor: 'pointer', padding: '0 4px',
        }}>×</button>
      </div>

      {/* Messages */}
      <div style={{
        height: 220, overflowY: 'auto', padding: '14px',
        display: 'flex', flexDirection: 'column', gap: 10,
        scrollbarWidth: 'none',
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{
              maxWidth: '80%', padding: '9px 14px',
              borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
              background: msg.role === 'user' ? 'rgba(243,156,18,0.2)' : 'rgba(255,255,255,0.07)',
              color: msg.role === 'user' ? '#f8d580' : 'rgba(255,255,255,0.88)',
              fontSize: 14, lineHeight: 1.55,
              border: msg.role === 'user' ? '1px solid rgba(243,156,18,0.25)' : '1px solid rgba(255,255,255,0.06)',
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex' }}>
            <div style={{
              padding: '10px 16px', borderRadius: '14px 14px 14px 4px',
              background: 'rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.3)', fontSize: 20, letterSpacing: 4,
            }}>···</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Help result panel */}
      {helpMode && (
        <div style={{
          margin: '0 10px', padding: '10px 12px',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 10, border: '1px solid rgba(255,255,255,0.08)',
          marginBottom: 4,
        }}>
          {helpLoading && (
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, textAlign: 'center' }}>···</div>
          )}

          {/* Translate result */}
          {helpMode === 'translate' && !helpLoading && helpResult && (
            <div style={{ color: '#7dd3a8', fontSize: 13, lineHeight: 1.5 }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, display: 'block', marginBottom: 4 }}>🇧🇷 Tradução</span>
              {helpResult}
            </div>
          )}

          {/* Suggest result */}
          {helpMode === 'suggest' && !helpLoading && suggestions.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginBottom: 2 }}>💬 Sugestões — clique para usar</span>
              {suggestions.map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)} style={{
                  textAlign: 'left', padding: '7px 10px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 8, color: 'rgba(255,255,255,0.85)',
                  fontSize: 13, cursor: 'pointer', lineHeight: 1.4,
                }}>{s}</button>
              ))}
            </div>
          )}

          {/* Fix input + result */}
          {helpMode === 'fix' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11 }}>✏️ Digite o que quer dizer</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  value={fixInput}
                  onChange={e => setFixInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && runFix()}
                  placeholder="I want say..."
                  style={{
                    flex: 1, padding: '7px 10px',
                    background: 'rgba(255,255,255,0.07)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 8, color: '#fff', fontSize: 13, outline: 'none',
                  }}
                  autoFocus
                />
                <button onClick={runFix} style={{
                  padding: '7px 12px', background: '#f39c12',
                  border: 'none', borderRadius: 8,
                  color: '#111', fontWeight: 700, fontSize: 12, cursor: 'pointer',
                }}>Fix</button>
              </div>
              {helpResult && !helpLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#7dd3a8', fontSize: 13, flex: 1 }}>→ {helpResult}</span>
                  <button onClick={() => { setInput(helpResult); setHelpMode(null) }} style={{
                    padding: '5px 10px', background: 'rgba(125,211,168,0.2)',
                    border: '1px solid rgba(125,211,168,0.4)',
                    borderRadius: 7, color: '#7dd3a8', fontSize: 11, cursor: 'pointer',
                  }}>Use</button>
                </div>
              )}
            </div>
          )}

          {/* Hear */}
          {helpMode === 'hear' && !helpLoading && (
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, textAlign: 'center' }}>
              🔊 Playing {npc.name}'s voice...
            </div>
          )}
        </div>
      )}

      {/* Help buttons */}
      <div style={{ display: 'flex', gap: 6, padding: '8px 14px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {([
          { mode: 'translate' as HelpMode, icon: '🇧🇷', label: 'Translate' },
          { mode: 'suggest' as HelpMode, icon: '💬', label: 'Suggest' },
          { mode: 'fix' as HelpMode, icon: '✏️', label: 'Fix' },
          { mode: 'hear' as HelpMode, icon: '🔊', label: 'Hear' },
        ]).map(btn => (
          <button key={btn.label} onClick={() => handleHelpClick(btn.mode)} style={{
            flex: 1, padding: '7px 4px',
            background: helpMode === btn.mode ? 'rgba(243,156,18,0.2)' : 'rgba(255,255,255,0.05)',
            border: helpMode === btn.mode ? '1px solid rgba(243,156,18,0.4)' : '1px solid rgba(255,255,255,0.08)',
            borderRadius: 8,
            color: helpMode === btn.mode ? '#f8d580' : 'rgba(255,255,255,0.5)',
            fontSize: 10, cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            transition: 'all 0.15s',
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
            borderRadius: 10, color: '#fff', fontSize: 14, outline: 'none',
          }}
        />
        <button onClick={() => sendMessage()} disabled={loading || !input.trim()} style={{
          padding: '10px 16px',
          background: loading || !input.trim() ? 'rgba(243,156,18,0.3)' : '#f39c12',
          border: 'none', borderRadius: 10,
          color: '#111', fontWeight: 700, fontSize: 13,
          cursor: loading ? 'default' : 'pointer',
        }}>Send</button>
      </div>
    </div>
  )
}
