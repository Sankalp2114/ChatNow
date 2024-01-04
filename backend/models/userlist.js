const mongoose = require('mongoose')

const userlistSchema = new mongoose.Schema({
    username: String,
    ChattingTo: [String],

});

const userList = mongoose.model('userList',userlistSchema)

module.exports = userList