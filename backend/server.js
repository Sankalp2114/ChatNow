const express = require('express')
const mongoose = require('mongoose')
const user = require('./models/user')
const app = express()
const PORT = 3000
const http = require('http')
const cors = require('cors')

app.use(express.json());
app.use(cors());
app.options('*', cors());

mongoose.connect('mongodb+srv://sankalp2114:Sanku1744@ChatNow.x1bfsss.mongodb.net/ChatNow', {
 
});

const db = mongoose.connection
db.once('open',()=>{
    console.log("Database connected")
})

app.post("/signup" , async (req,res) =>{
    console.log(req.body)
    const {username , password } = req.body
    console.log(username)
   
    try{

        const userInDB = await user.findOne({username})
        if(userInDB.username == username){
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



app.listen(PORT, () =>{
    console.log(`Server is listening on port:${PORT}`)
})