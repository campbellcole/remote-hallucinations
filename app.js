var express = require('express');
var app = express();
var http = require('http').Server(app)
var io = require('socket.io')(http)
var fs = require('fs')

app.use(express.static('public'))

function isTraining(callback) {
  fs.exists('private/processing.lock', (exists) => callback(exists))
}

io.on('connection', (socket) => {
  socket.on('upload data', (dat) => {
    socket.emit('log', 'received data. processing...')
    isTraining((training) => {
      if (!training) {
        fs.writeFile('private/vid.mp4', dat, (err) => {
          if (err) throw err
          socket.emit('log', 'saved')
          socket.emit('saved')
        })
      } else {
        socket.emit('log', 'already training. not gonna save the file.')
      }
    })
  })
  socket.on('dream', () => {
    isTraining((training) => {
      if (training) socket.emit('log', 'already training. this button is useless now.')
      else {
        fs.writeFile('private/processing.lock', 0xDEADBEEFDEADBEEF, (err) => {
          if (err) throw err
          socket.emit('log', 'locked...')
          socket.emit('log', 'let\'s get this bread.')
          training = true
        })
      }
    })
  })
  console.log('connected')
})

http.listen(3000, () => {
  console.log('listening')
})
