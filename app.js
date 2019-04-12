var app = require('express')();
var http = require('http').Server(app)
var io = require('socket.io')(http)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

io.on('connection', (socket) => {
  socket.on('testdata', (dat) => {
    console.log(`received: ${dat}`)
  })
  console.log('connected')
})

http.listen(3000, () => {
  console.log('listening')
})
