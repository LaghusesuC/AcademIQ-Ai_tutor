const { askAI } = require('../services/geminiService');
const ChatHistory = require('../models/ChatHistory');
const User = require('../models/User');

exports.chat = async (req, res) => {
    try {
        const { question, topic } = req.body;

        if (!question) {
            return res.status(400).json({ message: 'Please provide a question' });
        }

        const systemPrompt = `You are an expert academic tutor AI. You help students understand concepts in Mathematics, Computer Science, Data Structures & Algorithms, Programming, and Engineering.

Rules:
- Explain concepts step-by-step
- Use clear examples
- Provide clean, well-commented code when relevant
- Encourage understanding over memorization
- Be friendly and supportive
- Use markdown formatting for better readability

Student's question: ${question}`;

        const answer = await askAI(systemPrompt);

        // Save to history
        const chatEntry = await ChatHistory.create({
            userId: req.user ? req.user._id : null,
            question,
            answer,
            topic: topic || 'General'
        });

        // Update user stats if authenticated
        if (req.user) {
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { totalQuestionsAsked: 1 }
            });

            // Track topic for learning path
            if (topic) {
                const progressKey = `learningProgress.${topic}`;
                await User.findByIdAndUpdate(req.user._id, {
                    $inc: { [progressKey]: 1 }
                });
            }
        }

        res.json({ question, answer, topic: chatEntry.topic, timestamp: chatEntry.timestamp });
    } catch (error) {
        res.status(500).json({ message: 'Chat failed', error: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const history = await ChatHistory.find({ userId: req.user._id })
            .sort({ timestamp: -1 })
            .limit(50);
        res.json(history);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get history', error: error.message });
    }
};
