const mongoose = require('mongoose');

const expressionSchema = new mongoose.Schema({
    expression: {type: String, required: true},
    translations: {type: [String], required: true},
    description: {type: String, required: false},
    correctAnswers: {type: Number, default: 0},
    incorrectAnswers: {type: Number, default: 0},
    createdAt: {type: Date, default: new Date().toISOString()},
    updatedAt: {type: Date, default: new Date().toISOString()},
    repeat: {
        state: {type: Boolean, default: false},
        repeatedAt: {type: Date, default: new Date().toISOString()},
        correctAnswers: {type: Number, default: 0},
        incorrectAnswers: {type: Number, default: 0}
    }
});

const Expression = mongoose.model('Expression', expressionSchema);

module.exports = Expression;
