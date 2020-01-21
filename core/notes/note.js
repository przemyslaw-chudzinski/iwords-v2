const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String},
    userId: {type: mongoose.Schema.Types.ObjectID, required: true},
    expressionId: {type: mongoose.Schema.Types.ObjectID},
    createdAt: {type: Date, default: new Date().toISOString()},
    updatedAt: {type: Date, default: new Date().toISOString()}
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;
