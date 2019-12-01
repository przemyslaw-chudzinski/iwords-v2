const mongoose = require('mongoose');
const uuid = require('uuid');

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true},
    password: {type: String, required: true},
    // roles: {type: [String], required: true},
    apiKeys: {
        chromeExt: {
            token: {type: String, default: uuid()},
            createdAt: {type: Date, default: new Date().toISOString()}
        }
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
