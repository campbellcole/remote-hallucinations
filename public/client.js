var socket = io();

window.addEventListener('load', ready)

function ready() {
  document.getElementById('inp').addEventListener('change', chosen)
  document.getElementById('submit').onclick = submit

  document.getElementById('hit_that_yeet').onclick = function() {
    socket.emit('dream')
  }
}

var file
var didChoose = false

function chosen(event) {
  file = event.target.files[0]
  if (file.name.split('.')[file.name.split('.').length-1] != "mp4") { // don't do this kids...
    alert('wrong file type. you gotta use .mp4 holmes.')
    didChoose = false
    file = null
  } else {
    didChoose = true
  }
}

function submit() {
  if (didChoose) {
    socket.emit('upload data', file)
  } else {
    alert('choose a file first dummy')
  }
}

socket.on('saved', () => {
  console.log('BOP yeah aight, blueface baby. let\'s get dreaming.')
  document.getElementById('hit_that_yeet').hidden = false
})

socket.on('alert', (msg) => alert(msg))
