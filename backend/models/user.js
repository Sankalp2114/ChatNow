const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

const user = mongoose.model('Users',userSchema)

module.exports = user