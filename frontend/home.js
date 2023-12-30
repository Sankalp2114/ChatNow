const socket = io('http://localhost:3000');

socket.on('user-list', (users) => {
   updateUsersList(users);
});

function updateUsersList(users) {
   const sidePanel = document.querySelector('.side-panel ul');

   sidePanel.innerHTML = '';
   users.forEach((user) => {
       const listItem = document.createElement('li');
       listItem.innerHTML = `
           <div class="added-user">
               <img src="Ellipse 8.png" alt="">
               <p>${user.username}</p>
           </div>
       `;
       sidePanel.appendChild(listItem);
   });
}

fetch('http://localhost:3000/get-users')
   .then(response => response.json())
   .then(users => updateUsersList(users))
   .catch(error => console.error('Error fetching users:', error));

document.addEventListener('DOMContentLoaded', async () => {
   const username = localStorage.getItem('username');

   if (username) {
      try {
      
         socket.emit('get-previous-messages', username);

         socket.on('previous-messages', (messages) => {

            messages.forEach((message) => {

               const messageType = message.username === username ? 'sent' : 'received';
               appendMessage({ type: messageType, message: message.message });
            });

            scrollBottom();
         });
      } catch (error) {
         console.error('Error loading messages:', error);
      }
   }
});


const messageInput = document.querySelector('form input');
const form = document.querySelector('form');
const messageArea = document.querySelector('.message-area');

function scrollBottom() {
   const messageArea = document.querySelector('.message-area');
   messageArea.scrollTop = messageArea.scrollHeight;
}

form.addEventListener('submit', (e) => {
   e.preventDefault();

   const message = messageInput.value;
   const username = localStorage.getItem('username'); 

   appendMessage({ type: 'sent', message });

   socket.emit('chat-message', { type: 'sent', message, username });

   messageInput.value = '';
});


socket.on('chat-message', (data) => {

    if (data.type === 'received') {

        appendMessage({ type: 'received', message: data.message });
    }
});

function appendMessage(data) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = data.message;

    messageDiv.classList.add(data.type);

    messageArea.appendChild(messageDiv);
    scrollBottom()
}
