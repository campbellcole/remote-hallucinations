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

  var octaves = document.getElementById('oct').value
  var octScale = document.getElementById('octs').value
  var iterations = document.getElementById('itr').value
  var blend = document.getElementById('blend').value

  document.getElementById('hit_that_yeet').onclick = function() {
    socket.emit('dream', octaves, octScale, iterations, blend)
  }
  log('ready.', false)
}

var file
var ext

function chosen(event) {
  file = event.target.files[0]
  var spl = file.name.split('.')
  ext = spl[spl.length-1]
  if (ext != "mp4" && ext != "mov") {
    log('wrong file type. you gotta use .mp4 holmes.')
    file = null
  } else {
    document.getElementById('submit').disabled = false
  }
}

function submit() {
  socket.emit('upload data', file, ext)
}

socket.on('saved', () => {
  log('BOP yeah aight, blueface baby. let\'s get dreaming.')
  log('choose some settings, or just leave them default')
  log('NOTE: i am not gonna write code that checks for invalid arguments. don\'t mess up.')
  log('WARNING: changing the values too high will cause memory errors.')
  document.getElementById('hit_that_yeet').disabled = false
})

socket.on('log', (msg) => log(msg))

socket.on('done', () => {
  document.getElementById('download').disabled = false
  document.getElementById('download').onclick = () => { window.location = "output.mp4" }
})
