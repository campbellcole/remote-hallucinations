var express = require('express');
var app = express();
var http = require('http').Server(app)
var io = require('socket.io')(http)
var fs = require('fs')

var { spawn } = require('child_process')

app.use(express.static('public'))

function isTraining(callback) {
  fs.exists('private/processing.lock', (exists) => callback(exists))
}

var extension

io.on('connection', (socket) => {
  socket.on('upload data', (dat, ext) => {
    extension = ext
    socket.emit('log', 'uploading...')
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
  socket.on('dream', (octaves, octScale, iterations, blend, crush, verbose) => {
    isTraining((training) => {
      if (training) socket.emit('log', 'already training. this button is useless now.')
      else {
        fs.writeFile('private/processing.lock', 0xDEADBEEFDEADBEEF, (err) => {
          if (err) throw err
          socket.emit('log', 'locked.')
          socket.emit('log', 'let\'s get this bread.')
          training = true
          dream(octaves, octScale, iterations, blend, crush, verbose, (out) => {
            socket.emit('log', out)
          }, () => {
            fs.rename(__dirname + "/proc_done.mp4", __dirname + "/public/output.mp4", (err) => {
              if (err) throw err
              socket.emit('done')
            })
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

function dream(octaves, octScale, iterations, blend, crush, verbose, log, callback) {
  log('starting dream process. (ALL CREDITS TO GRAPHIFIC)')
  log('disassembling...')
  var part1 = spawn('bash', [__dirname + '/deepdream/1_movie2frames.sh', 'ffmpeg', __dirname + '/private/vid.' + extension, __dirname + '/deepdream/processing/out', 'png', crush])
  if (verbose) {
    part1.stdout.on('data', (dat) => log(''+dat))
    part1.stderr.on('data', (dat) => log('error: ' + dat))
  }
  part1.on('close', (code1) => {
    if (verbose) {
      log(`disassembly exited with code ${code1}`)
    }
    if (code1==0) {
      log('dreaming...')
      var part2 = spawn('python', [__dirname + '/deepdream/2_dreaming_time.py', '-i', __dirname + '/deepdream/processing/out', '-o', __dirname + '/deepdream/processing/proc', '-it', 'png', '-oct', octaves, '-itr', iterations, '-octs', octScale, '-b', blend, '--gpu', '0'])
      if (verbose) {
        part2.stdout.on('data', (dat) => log(''+dat))
        part2.stderr.on('data', (dat) => log('error: ' + dat))
      } else { // for some reason an stdout has to be set up for this to work
        part2.stdout.on('data', (dat) => {})
        part2.stderr.on('data', (dat) => {})
      }
      part2.on('close', (code2) => {
        if (verbose) {
          log(`dreaming exited with code ${code2}`)
        }
        if (code2==0) {
          log('reassembling...')
          var part3 = spawn('bash', [__dirname + '/deepdream/3_frames2movie.sh', 'ffmpeg', __dirname + '/deepdream/processing/proc', __dirname + '/private/vid.' + extension, 'png'])
          if (verbose) {
            part3.stdout.on('data', (dat) => log(''+dat))
            part3.stderr.on('data', (dat) => log('error: ' + dat))
          }
          part3.on('close', (code3) => {
            if (verbose) {
              log(`reassembly exited with code ${code3}`)
            }
            if (code3==0) {
              log('process completed successfully!')
              fs.unlink('private/processing.lock', (err) => { if (err) throw err })
              fs.unlink('private/vid.mov', (err) => { if (err) throw err })
              callback()
            } else {
              log('failed to reassemble')
            }
          })
        } else {
          log('failed to run dream script')
        }
      })
    } else {
      log('failed to disassemble video')
    }
  })
}
