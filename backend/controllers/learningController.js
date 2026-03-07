const { getLearningRecommendations } = require('../services/geminiService');
const User = require('../models/User');
const QuizResult = require('../models/QuizResult');
const ChatHistory = require('../models/ChatHistory');

exports.getDashboard = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        // Get recent quiz results
        const recentQuizzes = await QuizResult.find({ userId: req.user._id })
            .sort({ date: -1 })
            .limit(10);

        // Get chat topic frequency
        const topicCounts = await ChatHistory.aggregate([
            { $match: { userId: user._id } },
            { $group: { _id: '$topic', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        // Calculate average quiz score
        const avgScore = recentQuizzes.length > 0
            ? Math.round(recentQuizzes.reduce((sum, q) => sum + (q.score / q.totalQuestions * 100), 0) / recentQuizzes.length)
            : 0;

        // Get AI recommendations
        const progressObj = Object.fromEntries(user.learningProgress || new Map());
        const recommendations = await getLearningRecommendations(user.weakTopics, progressObj);

        res.json({
            user: {
                name: user.name,
                totalQuestionsAsked: user.totalQuestionsAsked,
                totalQuizzesTaken: user.totalQuizzesTaken,
                weakTopics: user.weakTopics,
                learningProgress: progressObj
            },
            stats: {
                averageQuizScore: avgScore,
                topicsExplored: topicCounts.length,
                recentQuizzes: recentQuizzes.map(q => ({
                    topic: q.topic,
                    score: q.score,
                    total: q.totalQuestions,
                    percentage: Math.round(q.score / q.totalQuestions * 100),
                    date: q.date
                }))
            },
            topicCounts,
            recommendations
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get dashboard', error: error.message });
    }
};
