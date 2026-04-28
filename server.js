import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { OpenAI, toFile } from 'openai'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: '*' } })

app.use(express.json())
app.use(express.static(join(__dirname, 'dist')))

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const NPC_PROMPTS = {
  rick: `You are Rick, the charismatic Brazilian owner of Casa Blanca Beach Club — a luxury beach club. You're warm, welcoming, and genuinely proud of what you built. You love telling short stories about the club. You speak fluent English with natural Brazilian warmth — "my friend", "welcome welcome". If the player makes a clear grammar mistake, naturally rephrase it in your response ("Ah, you mean you went there? Cool!") — subtly, never as a lesson. Keep responses to 2-4 sentences. Be real, warm, and interesting.`,

  valentina: `You are Valentina, a glamorous Italian woman visiting Casa Blanca Beach Club from Milan. Effortlessly stylish, slightly cold at first but warm up when someone impresses you. You reference fashion, Italy, and European life naturally. Speak perfect English with Italian soul — occasional "mamma mia" or "bellissimo" when natural. 2-3 sentences max. You have standards — not everyone gets your warmth.`,

  bartender: `You are the Bartender at Casa Blanca Beach Club. Experienced, smooth, dry humor. You've seen everything from behind this bar. Speak with slow American confidence. 1-3 sentences. Not easily impressed. Your humor is deadpan. You notice when people say something interesting or wrong.`,

  waiter: `You are the Waiter at Casa Blanca Beach Club. Friendly, professional, observant. You adapt to whoever you're talking to. You know the menu, the drinks, the regulars. Warm but not over the top. 2-3 sentences max.`,
}

const CUSTOMER_PROMPTS = {
  c1: `You are Carlos, a beach club customer at Casa Blanca. You've been waiting 10 minutes for your Mojito. You're polite but getting impatient. If the waiter is friendly and takes your order properly, you'll be satisfied. If they ignore you or are rude, you'll complain and leave. 2-3 sentences max.`,
  c2: `You are Sofia, a Brazilian influencer visiting Casa Blanca. You want a Caesar salad with no croutons and extra dressing, plus sparkling water. You have high standards but reward good service with enthusiasm. 2-3 sentences max.`,
  c3: `You are Jake, an American tourist at Casa Blanca for the first time. You want drink recommendations and have questions about the menu. Very friendly and talkative. 2-3 sentences max.`,
  c4: `You are Marina, a regular guest at Casa Blanca. You want still water and a sunbed towel replacement. Calm and direct. You appreciate efficiency — small talk is fine but you value your time. 2-3 sentences max.`,
  c5: `You are Pedro, an executive at Casa Blanca for a business lunch. You need a bottle of champagne brought quickly, and you're judging the service carefully. Professional, exacting, but fair. 2-3 sentences max.`,
}

app.post('/api/chat', async (req, res) => {
  const { npcId, messages } = req.body

  if (!openai) {
    const fallbacks = {
      rick: "Welcome to Casa Blanca, my friend! The OPENAI_API_KEY needs to be set to chat.",
      valentina: "I'm not in the mood. Come back when the API key is configured.",
      bartender: "Bar's closed for now. Need that API key.",
      waiter: "I'll be right with you — just need the API key set up first!",
    }
    return res.json({ reply: fallbacks[npcId] || "Sorry, can't talk right now." })
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: NPC_PROMPTS[npcId] || NPC_PROMPTS.waiter },
        ...messages,
      ],
      max_tokens: 180,
      temperature: 0.85,
    })
    res.json({ reply: completion.choices[0].message.content || '' })
  } catch {
    res.status(500).json({ reply: "Sorry, I can't talk right now." })
  }
})

const NPC_VOICES = {
  rick: 'echo',
  valentina: 'shimmer',
  bartender: 'onyx',
  waiter: 'nova',
}

app.post('/api/help', async (req, res) => {
  const { type, npcId, text, conversation } = req.body
  if (!openai) return res.status(503).json({ error: 'No API key' })

  let prompt = ''
  if (type === 'translate') {
    prompt = `Translate this to Brazilian Portuguese. Reply with ONLY the translation, nothing else:\n\n"${text}"`
  } else if (type === 'suggest') {
    const last = (conversation || []).filter((m) => m.role === 'assistant').slice(-1)[0]?.content || ''
    prompt = `A ${npcId} at a luxury beach club just said: "${last}"\n\nGive exactly 3 natural English replies a learner could say. Make them vary in tone (casual, curious, friendly). Reply with ONLY the 3 sentences, one per line, no numbers or bullets.`
  } else if (type === 'fix') {
    prompt = `Fix this English to sound natural and fluent. Reply with ONLY the corrected sentence:\n\n"${text}"`
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.4,
    })
    res.json({ result: completion.choices[0].message.content?.trim() || '' })
  } catch {
    res.status(500).json({ error: 'Help failed' })
  }
})

app.post('/api/transcribe', async (req, res) => {
  const { audio, mimeType } = req.body
  if (!openai) return res.status(503).json({ error: 'No API key' })
  try {
    const buffer = Buffer.from(audio, 'base64')
    const file = await toFile(buffer, 'voice.webm', { type: mimeType || 'audio/webm' })
    const result = await openai.audio.transcriptions.create({
      file,
      model: 'whisper-1',
      language: 'en',
    })
    res.json({ text: result.text })
  } catch {
    res.status(500).json({ error: 'Transcription failed' })
  }
})

app.post('/api/customer-chat', async (req, res) => {
  const { customerId, messages } = req.body
  if (!openai) return res.json({ reply: "One moment please, I'll be right with you." })
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: CUSTOMER_PROMPTS[customerId] || CUSTOMER_PROMPTS.c1 },
        ...messages,
      ],
      max_tokens: 100,
      temperature: 0.85,
    })
    res.json({ reply: completion.choices[0].message.content || '' })
  } catch {
    res.status(500).json({ reply: "Sorry, give me a moment." })
  }
})

app.post('/api/report', async (req, res) => {
  const { served, missed, exchanges, shiftDuration, quitEarly } = req.body
  const total = served + missed
  const passed = served >= Math.ceil(total * 0.6) && !quitEarly
  if (!openai) return res.json({ report: passed ? "Good trial shift, my friend!" : "Need more practice, come back tomorrow.", passed })
  const prompt = `You are Rick, Brazilian owner of Casa Blanca Beach Club. You just observed a new waiter's 3-minute trial shift. Stats:
- Customers served: ${served} out of ${total}
- Customers who left unhappy: ${missed}
- Total customer conversations: ${exchanges}
- Quit early: ${quitEarly ? 'yes' : 'no'}
- Result: ${passed ? 'PASSED' : 'FAILED'}

Write a 3-4 sentence performance review in Rick's warm, honest Brazilian style. Be specific about what was good and what needs work. End by saying if they're hired or need another chance.`
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.75,
    })
    res.json({ report: completion.choices[0].message.content?.trim() || '', passed })
  } catch {
    res.status(500).json({ report: 'Great effort on the trial!', passed })
  }
})

app.post('/api/session-report', async (req, res) => {
  const { npcMessages, playerName, durationMinutes } = req.body

  // Build a fallback without API
  if (!openai) {
    return res.json({
      phrases: [],
      rickMessage: `Great session, ${playerName || 'friend'}! Every minute you spend here, your English gets stronger. I'll be waiting for you to come back. 🌴`,
      rickMessagePt: `Ótima sessão, ${playerName || 'amigo(a)'}! Cada minuto que você passa aqui, seu inglês fica mais forte. Estarei esperando você voltar. 🌴`,
    })
  }

  const allText = (npcMessages || []).join('\n')
  const prompt = `You are Rick, the charismatic Brazilian owner of Casa Blanca Beach Club. A guest named "${playerName || 'friend'}" just spent ${durationMinutes || '?'} minutes at the club practicing English by talking to the NPCs.

Here are the English phrases/expressions they encountered during NPC conversations:
---
${allText || '(no conversations recorded)'}
---

Your task:
1. Extract 4 to 7 interesting or useful English expressions, phrasal verbs, idioms, or vocabulary from the text above (choose the most useful/learnable ones). If there are none, make 4 common beach/social English phrases they would encounter at a beach club.
2. For each phrase, write a short explanation in PORTUGUESE (1 sentence).
3. Write a warm, encouraging closing message from Rick IN ENGLISH (2-3 sentences). Be personal and mention the session. End with a variation of "I'll be waiting for you to come back."
4. Write the same closing message in PORTUGUESE.

Reply in this exact JSON format:
{
  "phrases": [
    {"en": "the expression", "pt": "explicação em português"},
    ...
  ],
  "rickMessage": "Rick's English closing message",
  "rickMessagePt": "Mensagem do Rick em português"
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 700,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    })
    const data = JSON.parse(completion.choices[0].message.content || '{}')
    res.json({
      phrases: data.phrases || [],
      rickMessage: data.rickMessage || "See you next time, my friend!",
      rickMessagePt: data.rickMessagePt || "Até a próxima, meu amigo!",
    })
  } catch {
    res.status(500).json({
      phrases: [],
      rickMessage: `It was a pleasure having you here, ${playerName || 'friend'}. Keep practicing — every conversation makes you stronger. I'll be waiting for you to come back! 🌴`,
      rickMessagePt: `Foi um prazer ter você aqui, ${playerName || 'amigo(a)'}. Continue praticando — cada conversa te deixa mais forte. Estarei esperando você voltar! 🌴`,
    })
  }
})

app.post('/api/tts', async (req, res) => {
  const { text, npcId } = req.body
  if (!openai) return res.status(503).json({ error: 'No API key' })
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: NPC_VOICES[npcId] || 'nova',
      input: text,
    })
    const buffer = Buffer.from(await mp3.arrayBuffer())
    res.setHeader('Content-Type', 'audio/mpeg')
    res.send(buffer)
  } catch {
    res.status(500).json({ error: 'TTS failed' })
  }
})

app.get(/(.*)/, (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

// Multiplayer
const players  = {}
const profiles = {}
const likes    = {}   // { socketId: Set<targetId> }
const dms      = {}   // { roomKey: [{ fromId, text, timestamp }] }

const dmRoom = (a, b) => [a, b].sort().join('__')

io.on('connection', (socket) => {
  console.log('player connected:', socket.id)
  players[socket.id] = { x: 0, z: 0 }
  socket.emit('currentPlayers', players)
  socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] })

  // Send existing profiles to the newcomer
  const existingProfiles = {}
  Object.entries(profiles).forEach(([id, p]) => { if (id !== socket.id) existingProfiles[id] = p })
  if (Object.keys(existingProfiles).length) socket.emit('existingProfiles', existingProfiles)

  socket.on('move', (data) => {
    if (players[socket.id]) {
      players[socket.id] = data
      io.emit('updatePlayers', players)
    }
  })

  socket.on('setProfile', (profile) => {
    profiles[socket.id] = profile
    socket.broadcast.emit('playerProfile', { id: socket.id, profile })
  })

  socket.on('sendLike', ({ targetId, isSuper }) => {
    if (!likes[socket.id]) likes[socket.id] = new Set()
    likes[socket.id].add(targetId)
    io.to(targetId).emit('receiveLike', { fromId: socket.id, isSuper })
    // Check mutual like → match
    if (likes[targetId]?.has(socket.id)) {
      io.to(targetId).emit('newMatch', { withId: socket.id })
      socket.emit('newMatch', { withId: targetId })
    }
  })

  socket.on('sendDM', ({ toId, text }) => {
    const msg = { fromId: socket.id, text, timestamp: Date.now() }
    const key = dmRoom(socket.id, toId)
    if (!dms[key]) dms[key] = []
    dms[key].push(msg)
    io.to(toId).emit('receiveDM', { fromId: socket.id, text, timestamp: msg.timestamp })
  })

  socket.on('sendFlirt', ({ toId, emoji }) => {
    const name = profiles[socket.id]?.name ?? 'Alguém'
    io.to(toId).emit('receiveFlirt', { fromId: socket.id, emoji, name })
  })

  socket.on('getDMHistory', ({ withId }) => {
    const key = dmRoom(socket.id, withId)
    socket.emit('dmHistory', { withId, messages: dms[key] || [] })
  })

  socket.on('disconnect', () => {
    console.log('player disconnected:', socket.id)
    const leftId = socket.id
    delete players[leftId]
    delete profiles[leftId]
    delete likes[leftId]
    io.emit('playerLeft', leftId)
  })
})

const PORT = Number(process.env.PORT) || 3000
httpServer.listen(PORT, () => console.log(`Casa Blanca running on port ${PORT}`))
