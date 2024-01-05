const mongoose = require('mongoose');
const cors = require('cors');
const user = require('./models/user');
const Chat = require('./models/chat');
const userList =  require('./models/userlist');
const express = require('express');
const {createServer} = require('http');
const {Server} = require('socket.io');
const {join} = require('path');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
      origin: '*',
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

mongoose.connect('Your mongodb url', {});

const db = mongoose.connection;

db.once('open', () => {
    console.log("Database connected");
});


io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.id}`);
    
    socket.on('chat-message', async (data) => {
        socket.broadcast.emit('chat-message', { type: 'received', message: data.message });

        const chatMessage = new Chat({
            username: data.username,
            message: data.message,
            sentTo: data.sentTo,
        });

        try {
            await chatMessage.save();
            console.log('Message saved to MongoDB');
        } catch (error) {
            console.error('Error saving message to MongoDB:', error);
        }
    });

    socket.on('get-chat-history', async ({ username, sentTo }) => {
        try {
        
            const chatHistory = await Chat.find({
                $or: [
                    { username, sentTo },
                    { username: sentTo, sentTo: username },
                ],
            }).sort({ timestamp: 1 }).exec();

            socket.emit('chat-history', chatHistory);
        } catch (error) {
            console.error('Error getting chat history:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

app.get('/getusers', async (req, res) => {
    try {
        const username = req.query.username;
        const userFriends = await userList.findOne({ username }, 'ChattingTo');
        
        if (userFriends) {
            const friendUsernames = userFriends.ChattingTo;
            const friends = await user.find({ username: { $in: friendUsernames } }, 'username');
            res.json(friends);
        } else {
            res.json([]);
        }
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ message: 'Server Error' });
    }
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
app.post('/addFriend', async (req, res) => {
    const { username, friend } = req.body;

    try {

        const isUser = await user.findOne({ username: friend });
        if (!isUser) {
            return res.status(404).json({
                message: "No such user",
            });
        }
        const isInUserList = await userList.findOne({ username });

        if (!isInUserList) {

            await userList.create({
                username,
                ChattingTo: [friend],
            });
        } else {

            await userList.updateOne(
                { username },
                { $push: { ChattingTo: friend } }
            );
        }
        const isFriendInUserList = await userList.findOne({ username: friend });
        if (!isFriendInUserList) {
            await userList.create({
                username: friend,
                ChattingTo: [username],
            });
        } else {
            await userList.updateOne(
                { username: friend },
                { $push: { ChattingTo: username } }
            );
        }

        return res.status(201).json({
            message: 'Friend added',
        });
    } catch (error) {
        return res.status(500).json({
            message: 'Internal server error',
        });
    }
});

