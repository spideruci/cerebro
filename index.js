var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var readline = require('readline');
var message_count = 0;

var clients = [];
var latest_client;

var send_msg = function(msg) {
  if(clients === null || clients.length === 0) {
    console.log('clients are empty')
    return;
  }
    
  var first_client = clients[0];
  var socket = latest_client.socket;
  message_count += 1;
  socket.emit('private server message', 
    {"text" : msg, "msg_count" : message_count});
}

console.log(__dirname);

app.use(express.static(__dirname));

app.get('/', function(req, res) {
  console.log('sending index.html.');
  res.sendFile(__dirname + '/index.html');
});

http.listen(8080, function(){
  console.log('listening on *:8080');
});

io.on('connection', function(socket) {
  console.log('a user is connected.');

  latest_client = {'date' : Date.now(), 'socket' : socket};
  clients.push(latest_client);

  socket.on('client message', function(message) {
    console.log(message.text);
    console.log(io.clients);
    io.emit('server message', {"text" : "Hello from the server!"});
  });

  socket.on('private client message', function(message) {
    console.log("Incoming private message from server!")
    console.log(message);
    socket.emit('private server message', {'text' : 'Hello!' + message.date})
  });

  socket.on('disconnect', function() {
    message_count = 0;
    console.log('user disconnected');
  });
});


var rl = readline.createInterface({
  input: process.stdin //, output: process.stdout
});

rl.on('line', function (str) {
  console.log('You just entered: '+ str);
  send_msg(str);
});

rl.on('close', function() {
  console.log("Isn't The Brain AWESOME FUN!?!");
  process.exit(0);
});
