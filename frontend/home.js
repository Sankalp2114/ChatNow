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
            <img src="assets/Ellipse 8.png" alt="">
            <p id="listUsername">${user.username}</p>
         </div>
         `;
      sidePanel.appendChild(listItem);

      listItem.addEventListener('click', () => {
      
         const usernameInList = listItem.querySelector('#listUsername');
         selectedUsername = usernameInList.textContent;

         socket.emit('get-chat-history', { username: localStorage.getItem('username'), sentTo: selectedUsername });

         console.log(`Selected Username: ${selectedUsername}`);
         document.getElementById('current-user').innerText=`${selectedUsername}`
     });
   });
}

fetch('http://localhost:3000/getusers')
   .then(response => response.json())
   .then(users => updateUsersList(users))
   .catch(error => console.error('Error fetching users:', error));


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

   socket.emit('chat-message', { type: 'sent', message, username, sentTo: selectedUsername });


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

socket.on('chat-history', (chatHistory) => {
   clearMessages();

   chatHistory.forEach((message) => {
       const messageType = message.username === localStorage.getItem('username') ? 'sent' : 'received';
       appendMessage({ type: messageType, message: message.message });
   });

   scrollBottom();
});

function clearMessages() {
   const messageArea = document.querySelector('.message-area');
   messageArea.innerHTML = '';
}