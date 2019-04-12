var socket = io();

window.addEventListener('load', ready)

function log(msg, linebreak = true) {
  var elem = document.getElementById('log')
  elem.innerHTML = elem.innerHTML + (linebreak ? `<br/>${msg}` : msg)
  elem.scrollTop = elem.scrollHeight
}

function ready() {
  document.getElementById('inp').addEventListener('change', chosen)
  document.getElementById('submit').onclick = submit

  document.getElementById('hit_that_yeet').onclick = () => { dream() }
  log('initialized.', false)
}

function dream() {
  var octaves = document.getElementById('oct').value
  var octScale = document.getElementById('octs').value
  var iterations = document.getElementById('itr').value
  var blend = document.getElementById('blend').value
  var crush = document.getElementById('crush').checked ? '1' : '0'
  var verbose = document.getElementById('verbose').checked
  var dostep1 = document.getElementById('dostep1C').checked
  var dostep2 = document.getElementById('dostep2C').checked
  var dostep3 = document.getElementById('dostep3C').checked

  socket.emit('dream', octaves, octScale, iterations, blend, crush, verbose, dostep1, dostep2, dostep3)
}

var file
var ext

function chosen(event) {
  file = event.target.files[0]
  var spl = file.name.split('.')
  ext = spl[spl.length-1]
  ext = ext.toLowerCase()
  if (ext != 'mp4' && ext != 'mov') {
    log(`invalid file type: ${ext}`)
    file = null
  } else {
    document.getElementById('submit').disabled = false
  }
}

function submit() {
  socket.emit('upload data', file, ext)
}

socket.on('saved', () => {
  log('ready to dream.')
  document.getElementById('hit_that_yeet').disabled = false
})

socket.on('log', (msg) => log('SERVER: ' + msg))

socket.on('done', () => {
  document.getElementById('download').disabled = false
  document.getElementById('download').onclick = () => { window.location = 'output.mp4' }
})
