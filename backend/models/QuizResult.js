const mongoose = require('mongoose');

const quizResultSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    topic: {
        type: String,
        required: true
    },
    score: {
        type: Number,
        required: true
    },
    totalQuestions: {
        type: Number,
        required: true
    },
    answers: [{
        question: String,
        userAnswer: String,
        correctAnswer: String,
        isCorrect: Boolean
    }],
    date: {
        type: Date,
        default: Date.now
    }
});

quizResultSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('QuizResult', quizResultSchema);
