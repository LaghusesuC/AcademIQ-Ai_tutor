const { askAI } = require('../services/geminiService');
const ChatHistory = require('../models/ChatHistory');
const ChatSession = require('../models/ChatSession');
const User = require('../models/User');

exports.chat = async (req, res) => {
    try {
        const { question, topic, sessionId, history } = req.body;

        if (!question) {
            return res.status(400).json({ message: 'Please provide a question' });
        }

        // Build conversation context from history
        let conversationContext = '';
        if (history && Array.isArray(history) && history.length > 0) {
            conversationContext = '\n\nPrevious conversation:\n';
            for (const msg of history) {
                const role = msg.role === 'user' ? 'Student' : 'Tutor';
                // Truncate very long messages in history to save tokens
                const content = msg.content.length > 500 ? msg.content.substring(0, 500) + '...' : msg.content;
                conversationContext += `${role}: ${content}\n`;
            }
            conversationContext += '\n';
        }

        const systemPrompt = `You are an expert academic tutor AI. You help students understand concepts in Mathematics, Computer Science, Data Structures & Algorithms, Programming, and Engineering.

Rules:
- Explain concepts step-by-step
- Use clear examples
- Provide clean, well-commented code when relevant
- Encourage understanding over memorization
- Be friendly and supportive
- Use markdown formatting for better readability
- When referencing previous conversation, maintain context and continuity
${conversationContext}
Student's current question: ${question}`;

        const answer = await askAI(systemPrompt);

        // Save to legacy history
        await ChatHistory.create({
            userId: req.user ? req.user._id : null,
            question,
            answer,
            topic: topic || 'General'
        });

        // Save to session if sessionId provided and user is authenticated
        if (sessionId && req.user) {
            const session = await ChatSession.findOne({ _id: sessionId, userId: req.user._id });
            if (session) {
                session.messages.push({ role: 'user', content: question });
                session.messages.push({ role: 'assistant', content: answer });
                // Auto-title from first user message
                if (session.title === 'New Chat' && session.messages.length <= 2) {
                    session.title = question.length > 50 ? question.substring(0, 50) + '...' : question;
                }
                await session.save();
            }
        }

        // Update user stats if authenticated
        if (req.user) {
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { totalQuestionsAsked: 1 }
            });

            if (topic) {
                const progressKey = `learningProgress.${topic}`;
                await User.findByIdAndUpdate(req.user._id, {
                    $inc: { [progressKey]: 1 }
                });
            }
        }

        res.json({ question, answer, topic: topic || 'General', timestamp: new Date() });
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

// Session-based endpoints
exports.createSession = async (req, res) => {
    try {
        const session = await ChatSession.create({
            userId: req.user ? req.user._id : null,
            title: 'New Chat',
            messages: [{
                role: 'assistant',
                content: "👋 Hi! I'm **AcademIQ**, your AI academic tutor. I can help you with:\n\n- 📐 **Mathematics** — calculus, linear algebra, statistics\n- 💻 **Computer Science** — algorithms, data structures, OS\n- 🔧 **Programming** — Python, Java, C++, JavaScript\n- ⚙️ **Engineering** — circuits, mechanics, thermodynamics\n\nAsk me anything! I'll explain step-by-step. 🚀"
            }]
        });
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create session', error: error.message });
    }
};

exports.getSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.find({ userId: req.user._id })
            .select('title createdAt updatedAt messages')
            .sort({ updatedAt: -1 })
            .limit(50);
        // Return lightweight list with message count
        const list = sessions.map(s => ({
            _id: s._id,
            title: s.title,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
            messageCount: s.messages.length,
            lastMessage: s.messages.length > 0 ? s.messages[s.messages.length - 1].content.substring(0, 80) : ''
        }));
        res.json(list);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get sessions', error: error.message });
    }
};

exports.getSession = async (req, res) => {
    try {
        const session = await ChatSession.findOne({
            _id: req.params.id,
            userId: req.user._id
        });
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }
        res.json(session);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get session', error: error.message });
    }
};

exports.deleteSession = async (req, res) => {
    try {
        await ChatSession.findOneAndDelete({
            _id: req.params.id,
            userId: req.user._id
        });
        res.json({ message: 'Session deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete session', error: error.message });
    }
};
