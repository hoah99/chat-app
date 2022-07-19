const express = require('express')
const app = express()
const port = 3000
const path = require('path')
const socketio = require('socket.io')
const formatMessage = require('./utils/messages')
const { userJoin, getCurrentUser, userLeave, getRoomUser } = require('./utils/users')

const http = require('http');
const { format } = require('path')
const server = http.createServer(app);
const io = socketio(server)
const botName = 'CHAT BOT'

// Set static folders
app.use(express.static(path.join(__dirname, 'public')))

app.set('views', path.join(__dirname, 'public'));
app.set('view engine', 'pug');

// Run when client connects
io.on('connection', socket => {
  console.log('New WS connection...')

  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room)
    socket.join(user.room)

    // Welcome current user 
    socket.emit('message', formatMessage(botName, 'Welcome to chat app'))
  
    // Broadcast when user connects
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatMessage(botName, `${user.username} has joined the chat`)
      )
      // Send users and room info
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUser(user.room)
      })
  })


  // Run when client disconnects
  socket.on('disconnect', () => {
    const user = userLeave(socket.id)
    if(user) {
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`))
      
      // Send users and room info
      io.to(user.room).emit('roomUsers', {
       room: user.room,
       users: getRoomUser(user.room)
     })
    }
  })

  // Listen for chatMessage
  socket.on('chatMessage', message => {
    const user = getCurrentUser(socket.id)
    io.to(user.room).emit('message', formatMessage(user.username, message))
  })

})

app.get('/', (req, res) => {
  res.render('index')
})

app.get('/chat', (req, res) => {
  res.render('chat')
})

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})