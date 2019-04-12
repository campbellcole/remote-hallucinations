var express = require('express');
var app = express();
var http = require('http').Server(app)
var io = require('socket.io')(http)
var fs = require('fs')

var tempCounter = 1

app.use(express.static('public'))

io.on('connection', (socket) => {
  socket.on('testdata', (dat) => {
    console.log(`received data. saving...`)
    fs.writeFile(`uploads/file${tempCounter++}.test`, dat, (err) => {
      if (err) throw err
      console.log('saved')
    })
  })
  console.log('connected')
})

http.listen(3000, () => {
  console.log('listening')
})
