window.addEventListener('load', ready)

function ready() {
  if (!window.File || !window.FileReader) {
    alert('update your browser man it\'s not that hard')
  } else {
    console.log('good to go babyyyyy')
  }
}

var file
var didChoose = false

function chosen(event) {
  file = event.target.files[0]
  didChoose = true
}

function submit() {
  if (didChoose) {
    socket.emit('testdata', file)
  } else {
    alert('choose a file first dummy')
  }
}

document.getElementById('inp').addEventListener('change', chosen)
document.getElementById('submit').onclick = submit

var socket = io();
