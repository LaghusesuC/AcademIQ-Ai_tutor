const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    question: {
        type: String,
        required: true
    },
    answer: {
        type: String,
        required: true
    },
    topic: {
        type: String,
        default: 'General'
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

chatHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
