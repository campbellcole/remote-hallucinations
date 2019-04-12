var express = require('express');
var app = express();
var http = require('http').Server(app)
var io = require('socket.io')(http)
var fs = require('fs')

var { spawn } = require('child_process')

app.use(express.static('public'))

function isTraining(callback) {
  fs.exists('private/processing.lock', (exists) => callback(false)) // temp
}

var extension

io.on('connection', (socket) => {
  socket.on('upload data', (dat, ext) => {
    extension = ext
    socket.emit('log', 'received data. processing...')
    isTraining((training) => {
      if (!training) {
        fs.writeFile(`private/vid.${ext}`, dat, (err) => {
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
          dream((out) => {
            socket.emit('log', out)
          })
        })
      }
    })
  })
  console.log('connected')
})

http.listen(3000, () => {
  console.log('listening')
})

/* DREAMING */

function dream(log) {
  log('starting dream process. (ALL CREDITS TO GRAPHIFIC)')
  log('disassembling video...')
  var proc = spawn('bash', [__dirname + '/deepdream/1_movie2frames.sh', 'ffmpeg', __dirname + '/private/vid.' + extension, __dirname + '/deepdream/processing/proc', 'png'])
  proc.stdout.on('data', (dat) => log(''+dat))
  proc.stderr.on('data', (dat) => log('error: ' + dat))
  proc.on('close', (code) => {
    log(`exited with code ${code}`)
    if (code==0) {

    } else {
      log('failed to disassemble video')
    }
  })
}
