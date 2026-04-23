import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' },
})

app.use(express.static(join(__dirname, 'dist')))
app.get(/(.*)/, (_req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

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

const PORT = process.env.PORT || 3000
httpServer.listen(PORT, () => {
  console.log(`Casa Blanca running on port ${PORT}`)
})
