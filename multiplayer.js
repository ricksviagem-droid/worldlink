import { Server } from 'socket.io'

const io = new Server(3002, {
  cors: {
    origin: '*',
  },
})

const players = {}

io.on('connection', (socket) => {
  console.log('player connected:', socket.id)

  players[socket.id] = {
    x: 0,
    z: 0,
  }

  socket.emit('currentPlayers', players)

  socket.broadcast.emit('newPlayer', {
    id: socket.id,
    player: players[socket.id],
  })

  socket.on('move', (data) => {
    if (players[socket.id]) {
      players[socket.id] = data
      io.emit('updatePlayers', players)
    }
  })

  socket.on('disconnect', () => {
    console.log('player disconnected:', socket.id)
    delete players[socket.id]
    io.emit('updatePlayers', players)
  })
})

console.log('Multiplayer running on port 3002')
