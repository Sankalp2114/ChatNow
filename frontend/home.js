if(!localStorage.getItem('username')){
   window.location.replace('index.html')
}

const socket = io('http://localhost:3000');

const addUser = document.getElementById('addUser')

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
      if(user.username == localStorage.getItem('username')){
         listItem.innerHTML=''
      }

      listItem.addEventListener('click', () => {
      
         const usernameInList = listItem.querySelector('#listUsername');
         selectedUsername = usernameInList.textContent;

         socket.emit('get-chat-history', { username: localStorage.getItem('username'), sentTo: selectedUsername });

         document.getElementById('current-user').innerText=`${selectedUsername}`
     });
   });
}

const username = localStorage.getItem('username');
fetch(`http://localhost:3000/getusers?username=${username}`)
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
   if(messageInput.value.trim() != ''){
      appendMessage({ type: 'sent', message });

   }


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

async function displayFriends() {
   try {
       const username = localStorage.getItem('username');
       const response = await fetch(`http://localhost:3000/getusers?username=${username}`);
       const users = await response.json();
       updateUsersList(users);
   } catch (error) {
       console.error('Error fetching users:', error);
   }
}

displayFriends();


addUser.addEventListener('click',async ()=>{
   const username = localStorage.getItem('username')
   
   const friend = prompt('Enter username to add your friend:')
   
   const result = await fetch('http://localhost:3000/addFriend',{
      method:'POST',
      headers:{
         'Content-Type':'application/json'
      },
      body :JSON.stringify({
         username,
         friend
      })
   })
   if(result.ok){
      alert("Friend added.")
      displayFriends();
   }else{
      alert("No such user exists.")
   }
})