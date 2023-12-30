const mongoose = require('mongoose');
const cors = require('cors');
const user = require('./models/user');
const Chat = require('./models/chat');
const express = require('express');
const {createServer} = require('http');
const {Server} = require('socket.io');
const {join} = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
      origin: 'http://127.0.0.1:5500',
      methods: ['GET', 'POST'],
      credentials: true,
      allowedHeaders: ['my-custom-header'],
    },
  });

const PORT = 3000;

app.use(express.json());
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
}));

app.options('*', cors());

mongoose.connect('mongodb+srv://sankalp2114:Sanku1744@ChatNow.x1bfsss.mongodb.net/ChatNow', {});

const db = mongoose.connection;

db.once('open', () => {
    console.log("Database connected");
});


app.get('/get-users', async (req, res) => {
    try {
        const users = await user.find({}, 'username');
        res.json(users);
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Server Error' });
    }
});


io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.emit('user-list', getUsersList());
    socket.on('get-previous-messages', async (username) => {
        try {
            const messages = await Chat.find({}).sort({ createdAt: 1 }).exec();
            socket.emit('previous-messages', messages);
        } catch (error) {
            console.error('Error getting previous messages:', error);
        }
    });
    socket.on('chat-message', async (data) => {

        socket.broadcast.emit('chat-message', { type: 'received', message: data.message });

        const chatMessage = new Chat({
            username: data.username,
            message: data.message,
        });
    
        try {
            await chatMessage.save();
            console.log('Message saved to MongoDB');
        } catch (error) {
            console.error('Error saving message to MongoDB:', error);
        }
    });
 
    socket.on('disconnect', () => {
       console.log(`User disconnected: ${socket.id}`);
    });
 });
 async function getUsersList() {
    try {
        const users = await user.find({}, 'username');
        return users.map(user => user.username);
    } catch (error) {
        console.error('Error getting users:', error);
        return [];
    }
}
 
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, 'index.html'));
});

app.post("/signup" , async (req,res) =>{
    const {username , password } = req.body
    try{

        const userInDB = await user.findOne({username})
        if(userInDB){
            return res.status(409).json({
                message:"user already exists"
            })
        }

        const newUser = await user.create({
            username,
            password
        })
        res.status(201).json({
            message:"User created successfully"
        })

    }catch(error){
        res.status(401).json({
            message:"Error creating user"
        })
    }
})

app.post('/login', async (req, res) => {
    console.log(req.body)
    const { username, password } = req.body;
    try {
        const isUser = await user.findOne({ username });
        if (isUser) {
            if (isUser.password == password) {
                return res.status(200).json({
                    message: "Successful Login",
                    username: username,
                });
            } else {
                return res.status(409).json({
                    message: "Invalid username or password"
                });
            }
        } else {
            return res.status(404).json({
                message: "User not found"
            });
        }
    } catch (error) {
        return res.status(500).json({
            message: "Server Error"
        });
    }
});



server.listen(PORT, () => {
    console.log(`Server is listening on port: ${PORT}`);
});