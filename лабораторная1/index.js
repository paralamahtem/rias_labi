const path = require('path');
const socketio = require('socket.io');
const express = require('express');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const users = [];

function newUser(id, username, room) {
  const user = { id, username, room };
  users.push(user);
  return user;
}

function getActiveUser(id) {
  return users.find(user => user.id === id);
}

function exitRoom(id) {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

function getIndividualRoomUsers(room) {
  return users.filter(user => user.room === room);
}

function formatMessage(username, text) {
  return {
    username, text, time: moment().format('h:mm a')
  };
}

app.use(express.static(path.join(__dirname, 'public')));

socket.on('chatMessage', msg => {
  const user = getActiveUser(socket.id);

  io.to(user.room).emit('message', formatMessage(user.username, msg));
});

socket.on('disconnect', () => {
  const user = exitRoom(socket.id);

  if (user) {
    io.to(user.room).emit(
      'message',
      formatMessage("Чат", `${user.username} покинул(-а) комнату`)
    );

    io.to(user.room).emit('roomUsers', {
      room: user.room, users: getIndividualRoomUsers(user.room)
    });
  }
});

io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = newUser(socket.id, username, room);

    socket.join(user.room);

    socket.broadcast
      .to(user.room)
      .emit('message', formatMessage("РИАС lab#1 - чат", `${user.username} присоединился(-ась) к комнате`));

    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getIndividualRoomUsers(user.room)
    });
  });
});

server.listen(3000, () => console.log(3000));