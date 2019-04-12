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
    console.log(`received data. saving...`)
    isTraining((training) => {
      if (!training) {
        fs.writeFile('private/vid.mp4', dat, (err) => {
          if (err) throw err
          console.log('saved')
          socket.emit('saved')
        })
      } else {
        socket.emit('alert', 'already training. not gonna save the file.')
      }
    })
  })
  socket.on('dream', () => {
    isTraining((training) => {
      if (training) socket.emit('alert', 'already training. this button is useless now.')
      else {
        fs.writeFile('private/processing.lock', 0xDEADBEEFDEADBEEF, (err) => {
          if (err) throw err
          console.log('locked...')
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
