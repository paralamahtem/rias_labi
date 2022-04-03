const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Получение имя пользователя и комнаты из URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Присоединиться к чату
socket.emit('joinRoom', { username, room });

// Получение комнаты и пользователей
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Сообщение с сервера
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Пролистать вниз
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Отправка сообщения
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Получить текст сообщения
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Отправить сообщение на сервер
  socket.emit('chatMessage', msg);

  // Очистить инпут
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Вывести сообщение в DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Добавить комнату в DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Добавить юзера в DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

// Запрашивать пользователя, прежде чем покинуть чат 
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Вы уверены, что хотите покинуть комнату?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});