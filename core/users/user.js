const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    // roles: {type: [String], required: true},
    // apiKeys: {
    //     chromeExt: {
    //         token: {type: String, required: false},
    //         createdAt: {type: Date, default: new Date().toISOString()}
    //     }
    // }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
