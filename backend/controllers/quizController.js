const { generateQuiz } = require('../services/geminiService');
const QuizResult = require('../models/QuizResult');
const User = require('../models/User');

exports.generate = async (req, res) => {
    try {
        const { topic, numQuestions } = req.body;

        if (!topic) {
            return res.status(400).json({ message: 'Please provide a topic' });
        }

        const quiz = await generateQuiz(topic, numQuestions || 5);
        res.json(quiz);
    } catch (error) {
        res.status(500).json({ message: 'Quiz generation failed', error: error.message });
    }
};

exports.submit = async (req, res) => {
    try {
        const { topic, answers, totalQuestions } = req.body;

        if (!topic || !answers) {
            return res.status(400).json({ message: 'Please provide topic and answers' });
        }

        const score = answers.filter(a => a.isCorrect).length;

        const quizResult = await QuizResult.create({
            userId: req.user._id,
            topic,
            score,
            totalQuestions: totalQuestions || answers.length,
            answers
        });

        // Update user stats
        await User.findByIdAndUpdate(req.user._id, {
            $inc: { totalQuizzesTaken: 1 }
        });

        // If score is low, add to weak topics
        const percentage = (score / (totalQuestions || answers.length)) * 100;
        if (percentage < 60) {
            await User.findByIdAndUpdate(req.user._id, {
                $addToSet: { weakTopics: topic }
            });
        } else if (percentage >= 80) {
            // Remove from weak topics if mastered
            await User.findByIdAndUpdate(req.user._id, {
                $pull: { weakTopics: topic }
            });
        }

        res.json({
            score,
            totalQuestions: totalQuestions || answers.length,
            percentage: Math.round(percentage),
            result: quizResult
        });
    } catch (error) {
        res.status(500).json({ message: 'Quiz submission failed', error: error.message });
    }
};

exports.getResults = async (req, res) => {
    try {
        const results = await QuizResult.find({ userId: req.user._id })
            .sort({ date: -1 })
            .limit(20);
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: 'Failed to get results', error: error.message });
    }
};
