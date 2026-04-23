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
const players = {}

io.on('connection', (socket) => {
  console.log('player connected:', socket.id)
  players[socket.id] = { x: 0, z: 0 }
  socket.emit('currentPlayers', players)
  socket.broadcast.emit('newPlayer', { id: socket.id, player: players[socket.id] })

  socket.on('move', (data) => {
    if (players[socket.id]) {
      players[socket.id] = data
      io.emit('updatePlayers', players)
    }
  })

  socket.on('disconnect', () => {
    console.log('player disconnected:', socket.id)
    const leftId = socket.id
    delete players[leftId]
    io.emit('playerLeft', leftId)
  })
})

const PORT = Number(process.env.PORT) || 3000
httpServer.listen(PORT, () => console.log(`Casa Blanca running on port ${PORT}`))
