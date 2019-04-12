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

  document.getElementById('hit_that_yeet').onclick = function() {
    socket.emit('dream')
  }
  log('ready.', false)
}

var file

function chosen(event) {
  file = event.target.files[0]
  if (file.name.split('.')[file.name.split('.').length-1] != "mp4") { // don't do this kids...
    log('wrong file type. you gotta use .mp4 holmes.')
    file = null
  } else {
    document.getElementById('submit').hidden = false
  }
}

function submit() {
  socket.emit('upload data', file)
}

socket.on('saved', () => {
  log('BOP yeah aight, blueface baby. let\'s get dreaming.')
  document.getElementById('hit_that_yeet').hidden = false
})

socket.on('log', (msg) => log(msg))
