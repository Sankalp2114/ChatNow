

const socket = io('http://localhost:3000');

const messageInput = document.querySelector('form input');
const form = document.querySelector('form');

form.addEventListener('submit', (e) => {
   e.preventDefault();

   const message = messageInput.value;


   socket.emit('chat-message', message);


   messageInput.value = '';
});

socket.on('chat-message', (message) => {
 
   appendMessage('received', message);
});

function appendMessage(type, message) {
   const messageArea = document.querySelector('.message-area');
   const messageDiv = document.createElement('div');
   messageDiv.textContent = message;


   messageDiv.classList.add(type);


   messageArea.appendChild(messageDiv);
};
