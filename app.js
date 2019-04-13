var express = require('express');
var app = express();
var http = require('http').Server(app)
var io = require('socket.io')(http)
var fs = require('fs')

var { spawn } = require('child_process')

app.use(express.static('public'))

const dd = `${__dirname}/deepdream`
const priv = `${__dirname}/private`
const pub = `${__dirname}/public`

const disasm = `${dd}/disasm.sh`
const dreampy = `${dd}/dream.py`
const reasm = `${dd}/reasm.sh`

const disasmOut = `${dd}/processing/out`
const dreamOut = `${dd}/processing/proc`

fs.unlink(`${priv}/processing.lock`, (err) => {})

function isTraining(callback) {
  fs.exists(`${priv}/processing.lock`, (exists) => callback(exists))
}

var extension

var state = "idle"

io.on('connection', (socket) => {
  socket.on('getstate', () => {
    var exists = false
    fs.exists(`${disasmOut}/00000001.png`, (exst) => {
      socket.emit('state', state, exst)
    })
  })
  socket.on('upload data', (dat, ext) => {
    socket.emit('log', 'uploading...')
    isTraining((training) => {
      if (!training) {
        fs.writeFile(`private/vid.${ext}`, dat, (err) => {
          if (err) throw err
          socket.emit('log', 'saved')
          extension = ext
          socket.emit('saved')
        })
      } else {
        socket.emit('log', 'can\' upload while training.')
      }
    })
  })
  socket.on('dream', (octaves, octScale, iterations, blend, crush, verbose, dostep1, dostep2, dostep3) => {
    isTraining((training) => {
      if (training) socket.emit('log', 'already training.')
      else {
        fs.writeFile('private/processing.lock', 0xDEADBEEFDEADBEEF, (err) => {
          if (err) throw err
          socket.emit('log', 'locked.')
          socket.emit('log', 'let\'s get this bread.')
          state = "processing."
          training = true
          socket.emit('log', 'deleting old files...')
          dream(octaves, octScale, iterations, blend, crush, verbose, dostep1, dostep2, dostep3, (out) => {
            socket.emit('log', out)
          }, (succ) => {
            if (succ) {
              fs.rename(__dirname + '/proc_done.mp4', __dirname + '/public/output.mp4', (err) => {
                if (err) socket.emit('log', `${err}`)
                else socket.emit('done')
              })
              fs.unlink('private/processing.lock', (err) => {})
              fs.unlink(`private/vid.${extension}`, (err) => {})
              state = "idle"
            }
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

function dream(octaves, octScale, iterations, blend, crush, verbose, dostep1, dostep2, dostep3, log, callback) { // don't get mad at me for repeating code pls
  log('starting dream process. (ALL CREDITS TO GRAPHIFIC)')
  if (dostep1) {
    log('disassembling...')
    _disasm(extension, crush, verbose, log, (excode) => {
      if (excode != 0) {
        log('failed to disassemble.')
        if (verbose) {
          log(`exited with error code: ${excode}`)
        }
        callback(false)
      }
      if (dostep2) {
        log('dreaming...')
        _dream(octaves, iterations, octScale, blend, verbose, log, (excode1) => {
          if (excode1 != 0) {
            log('failed to dream.')
            if (verbose) {
              log(`exited with error code: ${excode1}`)
            }
            callback(false)
          }
          if (dostep3) {
            log('reassembling...')
            _reasm(extension, verbose, log, (excode2) => {
              if (excode2 != 0) {
                log('failed to reassemble.')
                if (verbose) {
                  log(`exited with error code: ${excode2}`)
                }
                callback(false)
              }
              log('done.')
              callback(true)
            })
          }
        })
      }
    })
  }
  if (!dostep1 && dostep2) {
    log('dreaming...')
    _dream(octaves, iterations, octScale, blend, verbose, log, (excode1) => {
      if (excode1 != 0) {
        log('failed to dream.')
        if (verbose) {
          log(`exited with error code: ${excode1}`)
        }
        callback(false)
      }
      if (dostep3) {
        log('reassembling...')
        _reasm(extension, verbose, log, (excode2) => {
          if (excode2 != 0) {
            log('failed to reassemble.')
            if (verbose) {
              log(`exited with error code: ${excode2}`)
            }
            callback(false)
          }
          log('done.')
          callback(true)
        })
      }
    })
  }
  if (!dostep1 && !dostep2 && dostep3) {
    log('reassembling...')
    _reasm(extension, verbose, log, (excode2) => {
      if (excode2 != 0) {
        log('failed to reassemble.')
        if (verbose) {
          log(`exited with error code: ${excode2}`)
        }
        callback(false)
      }
      log('done.')
      callback(true)
    })
  }
}

function _disasm(ext, crush, verbose, log, callback) {
  if (!verbose) log = (dat) => {}
  var args = [
    `${disasm}`,
    'ffmpeg',
    `${priv}/vid.${ext}`,
    `${disasmOut}`,
    'png',
    `${crush}`
  ]
  try {
    fs.readdirSync('deepdream/processing/proc').forEach((file, index) => {
      fs.unlinkSync('deepdream/processing/proc/' + file)
    })
    fs.rmdirSync('deepdream/processing/proc')
  } catch (err) {}
  var proc = spawn('bash', args)
  proc.stdout.on('data', (dat) => log(`${dat}`))
  proc.stderr.on('data', (dat) => log(`error: ${dat}`))
  proc.on('close', (excode) => {
    log('completed disassembly.')
    callback(excode)
  })
}

function _dream(octaves, iterations, octScale, blend, verbose, log, callback) {
  if (!verbose) log = (dat) => {}
  var args = [
    `${dreampy}`,
    '-i', `${disasmOut}`,
    '-o', `${dreamOut}`,
    '-it', 'png',
    '-oct', `${octaves}`,
    '-itr', `${iterations}`,
    '-octs', `${octScale}`,
    '-b', `${blend}`,
    '--gpu', '0'
  ]
  var proc = spawn('python', args)
  proc.stdout.on('data', (dat) => log(`${dat}`))
  proc.stderr.on('data', (dat) => log(`error: ${dat}`))
  proc.on('close', (excode) => {
    log('completed dreaming.')
    callback(excode)
  })
}

function _reasm(ext, verbose, log, callback) {
  if (!verbose) log = (dat) => {}
  var args = [
    `${reasm}`,
    'ffmpeg',
    `${dreamOut}`,
    `${priv}/vid.${ext}`,
    'png'
  ]
  var proc = spawn('bash', args)
  proc.stdout.on('data', (dat) => log(`${dat}`))
  proc.stderr.on('data', (dat) => log(`error: ${dat}`))
  proc.on('close', (excode) => {
    log('completed reassembly.')
    callback(excode)
  })
}
