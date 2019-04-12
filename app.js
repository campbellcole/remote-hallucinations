var express = require('express');
var app = express();
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.use(express.static('public'))

io.on('connection', (socket) => {
  socket.on('testdata', (dat) => {
    console.log(`received data. saving...`)
  })
  console.log('connected')
})

http.listen(3000, () => {
  console.log('listening')
})
