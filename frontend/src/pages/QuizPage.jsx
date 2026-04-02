import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import {
    Target, CheckCircle, XCircle, RotateCcw, Trophy, ArrowRight,
    Sparkles, Clock, BookOpen, Flame, Award, Hash, Lightbulb
} from 'lucide-react';

const topics = [
    { name: 'Binary Search', category: 'DSA' },
    { name: 'Recursion', category: 'DSA' },
    { name: 'Linked Lists', category: 'DSA' },
    { name: 'Stack and Queue', category: 'DSA' },
    { name: 'Sorting Algorithms', category: 'DSA' },
    { name: 'Tree Traversal', category: 'DSA' },
    { name: 'Graph Algorithms', category: 'DSA' },
    { name: 'Dynamic Programming', category: 'DSA' },
    { name: 'Object-Oriented Programming', category: 'CS' },
    { name: 'SQL Queries', category: 'DB' },
    { name: 'Python Basics', category: 'Lang' },
    { name: 'JavaScript ES6', category: 'Lang' },
    { name: 'Operating Systems', category: 'CS' },
    { name: 'Computer Networks', category: 'CS' }
];

const categories = ['All', 'DSA', 'CS', 'Lang', 'DB'];
const questionCounts = [5, 10, 15];

function saveQuizToHistory(topic, correctAnswers, totalQuestions) {
    try {
        const history = JSON.parse(localStorage.getItem('quizHistory') || '[]');
        history.unshift({
            topic,
            correctAnswers,
            totalQuestions,
            percentage: Math.round((correctAnswers / totalQuestions) * 100),
            date: new Date().toISOString()
        });
        // Keep last 50 entries
        if (history.length > 50) history.length = 50;
        localStorage.setItem('quizHistory', JSON.stringify(history));
    } catch (e) { console.error('quiz history save error', e); }
}

function getRecommendedTopics() {
    try {
        const chatTopics = JSON.parse(localStorage.getItem('chatLearningTopics') || '[]');
        const quizHistory = JSON.parse(localStorage.getItem('quizHistory') || '[]');
        // Get topics quizzed in the last 24 hours
        const recentlyQuizzed = new Set(
            quizHistory
                .filter(q => (Date.now() - new Date(q.date).getTime()) < 86400000)
                .map(q => q.topic.toLowerCase())
        );
        // Return chat topics not recently quizzed, max 5
        return chatTopics
            .filter(t => !recentlyQuizzed.has(t.topic.toLowerCase()))
            .slice(0, 5)
            .map(t => t.topic);
    } catch { return []; }
}

export default function QuizPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [selectedTopic, setSelectedTopic] = useState('');
    const [customTopic, setCustomTopic] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');
    const [numQuestions, setNumQuestions] = useState(5);
    const [quiz, setQuiz] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [timerActive, setTimerActive] = useState(false);
    const [recommendedTopics] = useState(() => getRecommendedTopics());

    // Load state on mount
    useEffect(() => {
        const saved = localStorage.getItem('quizState');
        if (saved) {
            try {
                const p = JSON.parse(saved);
                if (p.selectedTopic !== undefined) setSelectedTopic(p.selectedTopic);
                if (p.customTopic !== undefined) setCustomTopic(p.customTopic);
                if (p.numQuestions !== undefined) setNumQuestions(p.numQuestions);
                if (p.quiz !== undefined) setQuiz(p.quiz);
                if (p.currentQ !== undefined) setCurrentQ(p.currentQ);
                if (p.userAnswers !== undefined) setUserAnswers(p.userAnswers);
                if (p.showResults !== undefined) setShowResults(p.showResults);
                if (p.timeElapsed !== undefined) setTimeElapsed(p.timeElapsed);
                if (p.quiz && !p.showResults) setTimerActive(true);
            } catch (e) { console.error(e); }
        }
    }, []);

    // Save state
    useEffect(() => {
        localStorage.setItem('quizState', JSON.stringify({
            selectedTopic, customTopic, numQuestions, quiz, currentQ, userAnswers, showResults, timeElapsed
        }));
    }, [selectedTopic, customTopic, numQuestions, quiz, currentQ, userAnswers, showResults, timeElapsed]);

    // Timer
    useEffect(() => {
        if (!timerActive) return;
        const interval = setInterval(() => setTimeElapsed(t => t + 1), 1000);
        return () => clearInterval(interval);
    }, [timerActive]);

    const formatTime = (s) => {
        const m = Math.floor(s / 60);
        const sec = s % 60;
        return `${m}:${sec.toString().padStart(2, '0')}`;
    };

    const generateQuiz = async () => {
        const topic = selectedTopic || customTopic.trim();
        if (!topic) return;
        setLoading(true);
        setShowResults(false);
        setUserAnswers({});
        setCurrentQ(0);
        setTimeElapsed(0);
        try {
            const res = await api.post('/quiz/generate', { topic, numQuestions });
            setQuiz(res.data);
            setTimerActive(true);
        } catch {
            setQuiz(null);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (qId, answer) => {
        setUserAnswers(prev => ({ ...prev, [qId]: answer }));
    };

    const submitQuiz = () => {
        setShowResults(true);
        setTimerActive(false);
        // Save to history
        const score = getScore();
        const topic = selectedTopic || customTopic || 'General';
        saveQuizToHistory(topic, score.correct, score.total);
    };

    const getScore = () => {
        if (!quiz) return { correct: 0, total: 0 };
        let correct = 0;
        quiz.questions.forEach(q => {
            const u = (userAnswers[q.id] || '').trim().toLowerCase();
            const c = (q.correctAnswer || '').trim().toLowerCase();
            if (u === c) correct++;
        });
        return { correct, total: quiz.questions.length };
    };

    const isAnswerCorrect = (q) => {
        const u = (userAnswers[q.id] || '').trim().toLowerCase();
        const c = (q.correctAnswer || '').trim().toLowerCase();
        return u === c;
    };

    const resetQuiz = () => {
        setQuiz(null);
        setSelectedTopic('');
        setCustomTopic('');
        setUserAnswers({});
        setShowResults(false);
        setCurrentQ(0);
        setTimeElapsed(0);
        setTimerActive(false);
        localStorage.removeItem('quizState');
    };

    const answeredCount = Object.keys(userAnswers).length;
    const score = getScore();
    const filteredTopics = activeCategory === 'All' ? topics : topics.filter(t => t.category === activeCategory);

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                        Quiz <span className="animated-gradient-text">Generator</span>
                    </h1>
                    <p className="text-lg" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                        Test your knowledge with AI-generated MCQ quizzes on any topic.
                    </p>
                </motion.div>

                {/* ======== Topic Selection ======== */}
                {!quiz && !loading && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="glass-card p-6 sm:p-8">
                            {/* Choose topic section */}
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                <Target size={20} style={{ color: '#818cf8' }} /> Choose a Topic
                            </h3>

                            {/* Recommended Quizzes based on chat history */}
                            {recommendedTopics.length > 0 && (
                                <div className="mb-6">
                                    <p className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-1.5"
                                        style={{ color: '#818cf8' }}>
                                        <Lightbulb size={13} /> Recommended Based on Your Learning
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {recommendedTopics.map((topic, i) => (
                                            <motion.button
                                                key={`rec-${i}`}
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: i * 0.06 }}
                                                whileHover={{ scale: 1.05, y: -2 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => { setSelectedTopic(topic); setCustomTopic(''); }}
                                                className="px-3.5 py-2 rounded-xl text-sm border-none cursor-pointer transition-all flex items-center gap-1.5"
                                                style={{
                                                    background: selectedTopic === topic
                                                        ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                                                        : isDark ? 'rgba(99,102,241,0.08)' : 'rgba(99,102,241,0.05)',
                                                    color: selectedTopic === topic ? 'white' : '#818cf8',
                                                    border: selectedTopic === topic
                                                        ? 'none'
                                                        : '1px solid rgba(99,102,241,0.2)',
                                                    boxShadow: selectedTopic === topic ? '0 4px 15px rgba(99,102,241,0.3)' : 'none'
                                                }}
                                            >
                                                <Sparkles size={12} /> {topic}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Category filter */}
                            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                                {categories.map(cat => (
                                    <motion.button
                                        key={cat}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setActiveCategory(cat)}
                                        className="px-3 py-1 rounded-lg text-xs font-medium border-none cursor-pointer transition-all whitespace-nowrap"
                                        style={{
                                            background: activeCategory === cat ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                            color: activeCategory === cat ? 'white' : isDark ? '#64748b' : '#94a3b8'
                                        }}>
                                        {cat}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Topic pills */}
                            <div className="flex flex-wrap gap-2 mb-6">
                                {filteredTopics.map((t, i) => (
                                    <motion.button
                                        key={t.name}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => { setSelectedTopic(t.name); setCustomTopic(''); }}
                                        className="px-3.5 py-2 rounded-xl text-sm border-none cursor-pointer transition-all"
                                        style={{
                                            background: selectedTopic === t.name
                                                ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                                                : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                            color: selectedTopic === t.name ? 'white' : isDark ? '#cbd5e1' : '#475569',
                                            border: selectedTopic === t.name ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                            boxShadow: selectedTopic === t.name ? '0 4px 15px rgba(99,102,241,0.3)' : 'none'
                                        }}>
                                        {t.name}
                                    </motion.button>
                                ))}
                            </div>

                            {/* Custom topic + question count */}
                            <div className="space-y-4">
                                <input
                                    className="input-field"
                                    placeholder="Or type a custom topic..."
                                    value={customTopic}
                                    onChange={e => { setCustomTopic(e.target.value); setSelectedTopic(''); }}
                                />

                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                    <div>
                                        <label className="text-xs font-semibold uppercase tracking-wider mb-2 block"
                                            style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                                            <Hash size={12} className="inline mr-1" style={{ verticalAlign: 'middle' }} />
                                            Number of Questions
                                        </label>
                                        <div className="flex gap-2">
                                            {questionCounts.map(n => (
                                                <motion.button
                                                    key={n}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => setNumQuestions(n)}
                                                    className="w-12 h-10 rounded-xl text-sm font-bold border-none cursor-pointer transition-all"
                                                    style={{
                                                        background: numQuestions === n ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                                        color: numQuestions === n ? 'white' : isDark ? '#94a3b8' : '#64748b',
                                                        boxShadow: numQuestions === n ? '0 3px 10px rgba(99,102,241,0.25)' : 'none'
                                                    }}>
                                                    {n}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={generateQuiz}
                                        disabled={!selectedTopic && !customTopic.trim()}
                                        className="btn-primary whitespace-nowrap sm:ml-auto sm:mt-6"
                                        style={{ opacity: (selectedTopic || customTopic.trim()) ? 1 : 0.5, padding: '0.75rem 2rem' }}>
                                        Generate Quiz <ArrowRight size={16} />
                                    </motion.button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ======== Loading ======== */}
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                            className="inline-block"
                        >
                            <Sparkles size={40} style={{ color: '#818cf8' }} />
                        </motion.div>
                        <p className="font-semibold mt-4" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>Generating your quiz...</p>
                        <p className="text-sm mt-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                            Creating {numQuestions} MCQ questions on <strong>{selectedTopic || customTopic}</strong>
                        </p>
                    </motion.div>
                )}

                {/* ======== Quiz In Progress ======== */}
                {quiz && !showResults && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="glass-card overflow-hidden">
                            {/* Quiz header bar */}
                            <div className="flex items-center justify-between px-6 py-3"
                                style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)' }}>
                                <div className="flex items-center gap-3">
                                    <span className="text-sm font-bold" style={{ color: '#818cf8' }}>
                                        Q{currentQ + 1}/{quiz.questions.length}
                                    </span>
                                    <span className="text-xs px-2.5 py-0.5 rounded-full" style={{ background: isDark ? 'rgba(129,140,248,0.1)' : 'rgba(99,102,241,0.08)', color: '#818cf8' }}>
                                        {selectedTopic || customTopic}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs flex items-center gap-1" style={{ color: '#34d399' }}>
                                        <CheckCircle size={12} /> {answeredCount}/{quiz.questions.length}
                                    </span>
                                    <span className="text-xs flex items-center gap-1 font-mono font-medium" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                        <Clock size={12} /> {formatTime(timeElapsed)}
                                    </span>
                                </div>
                            </div>

                            {/* Progress track */}
                            <div className="flex gap-1 px-6 pt-4">
                                {quiz.questions.map((_, i) => (
                                    <motion.div
                                        key={i}
                                        whileHover={{ scale: 1.4 }}
                                        className="flex-1 h-1.5 rounded-full cursor-pointer transition-all"
                                        onClick={() => setCurrentQ(i)}
                                        style={{
                                            background: i === currentQ
                                                ? 'linear-gradient(135deg, #6366f1, #818cf8)'
                                                : userAnswers[quiz.questions[i].id]
                                                    ? '#34d399'
                                                    : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'
                                        }}
                                    />
                                ))}
                            </div>

                            {/* Question + options */}
                            <div className="p-6 sm:p-8">
                                <AnimatePresence mode="wait">
                                    <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
                                        {(() => {
                                            const q = quiz.questions[currentQ];
                                            return (
                                                <>
                                                    <h3 className="text-lg sm:text-xl font-semibold mb-6 leading-relaxed" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                                        {q.question}
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {(q.options || []).map((opt, oi) => (
                                                            <motion.button
                                                                key={oi}
                                                                whileHover={{ scale: 1.01, x: 6 }}
                                                                whileTap={{ scale: 0.99 }}
                                                                onClick={() => handleAnswer(q.id, opt)}
                                                                className="w-full text-left p-4 rounded-xl border-none cursor-pointer transition-all flex items-center gap-3"
                                                                style={{
                                                                    background: userAnswers[q.id] === opt
                                                                        ? 'rgba(99,102,241,0.12)'
                                                                        : isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                                                    border: userAnswers[q.id] === opt
                                                                        ? '2px solid #818cf8'
                                                                        : `2px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}`,
                                                                    color: isDark ? '#e2e8f0' : '#334155',
                                                                    boxShadow: userAnswers[q.id] === opt ? '0 2px 12px rgba(99,102,241,0.12)' : 'none'
                                                                }}
                                                            >
                                                                <span className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                                                                    style={{
                                                                        background: userAnswers[q.id] === opt
                                                                            ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                                                                            : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                                                        color: userAnswers[q.id] === opt ? 'white' : isDark ? '#94a3b8' : '#64748b'
                                                                    }}>
                                                                    {String.fromCharCode(65 + oi)}
                                                                </span>
                                                                <span className="font-medium text-sm">{opt}</span>
                                                                {userAnswers[q.id] === opt && (
                                                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="ml-auto">
                                                                        <CheckCircle size={16} style={{ color: '#818cf8' }} />
                                                                    </motion.div>
                                                                )}
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </motion.div>
                                </AnimatePresence>

                                {/* Navigation */}
                                <div className="flex justify-between mt-8 pt-4" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)' }}>
                                    <motion.button
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                        onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
                                        className="btn-secondary" style={{ opacity: currentQ === 0 ? 0.4 : 1 }}>
                                        Previous
                                    </motion.button>
                                    {currentQ < quiz.questions.length - 1 ? (
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={() => setCurrentQ(currentQ + 1)} className="btn-primary">
                                            Next <ArrowRight size={16} />
                                        </motion.button>
                                    ) : (
                                        <motion.button
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.97 }}
                                            onClick={submitQuiz} className="btn-primary"
                                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', boxShadow: '0 4px 15px rgba(16,185,129,0.3)' }}>
                                            Submit Quiz <CheckCircle size={16} />
                                        </motion.button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ======== Results ======== */}
                {showResults && quiz && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        {/* Score card */}
                        <div className="glass-card p-8 text-center mb-6 relative overflow-hidden">
                            <motion.div className="absolute inset-0 opacity-5"
                                animate={{ opacity: [0.03, 0.08, 0.03] }}
                                transition={{ duration: 3, repeat: Infinity }}
                                style={{ background: score.correct / score.total >= 0.8 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'linear-gradient(135deg, #6366f1, #06b6d4)' }} />
                            <div className="relative">
                                <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                                >
                                    <Trophy size={52} className="mx-auto mb-4"
                                        style={{ color: score.correct / score.total >= 0.8 ? '#fbbf24' : '#818cf8' }} />
                                </motion.div>
                                <motion.h2
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="text-5xl font-extrabold mb-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                    {Math.round(score.correct / score.total * 100)}%
                                </motion.h2>
                                <p className="text-lg" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                    You got <strong>{score.correct}</strong> out of <strong>{score.total}</strong> correct
                                </p>

                                {/* Stats row */}
                                <div className="flex justify-center gap-6 mt-4">
                                    <div className="flex items-center gap-1.5 text-xs" style={{ color: '#34d399' }}>
                                        <CheckCircle size={14} /> {score.correct} Correct
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs" style={{ color: '#f87171' }}>
                                        <XCircle size={14} /> {score.total - score.correct} Wrong
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                        <Clock size={14} /> {formatTime(timeElapsed)}
                                    </div>
                                </div>

                                <p className="text-sm mt-3 font-medium" style={{
                                    color: score.correct / score.total >= 0.8 ? '#34d399' : score.correct / score.total >= 0.6 ? '#fbbf24' : '#f87171'
                                }}>
                                    {score.correct / score.total >= 0.8 ? '🎉 Excellent! Outstanding performance!' : score.correct / score.total >= 0.6 ? '👍 Good effort! Room for improvement.' : '📚 Keep studying! Practice makes perfect.'}
                                </p>
                            </div>
                        </div>

                        {/* Answers review */}
                        <div className="space-y-4">
                            {quiz.questions.map((q, i) => {
                                const correct = isAnswerCorrect(q);
                                return (
                                    <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                                        className="glass-card p-5 relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-1 h-full rounded-r" style={{ background: correct ? '#34d399' : '#f87171' }} />
                                        <div className="flex items-start gap-3 mb-3 pl-2">
                                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.08 + 0.2, type: 'spring' }}>
                                                {correct
                                                    ? <CheckCircle size={20} style={{ color: '#34d399', flexShrink: 0, marginTop: 2 }} />
                                                    : <XCircle size={20} style={{ color: '#f87171', flexShrink: 0, marginTop: 2 }} />}
                                            </motion.div>
                                            <div className="font-medium text-sm" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{q.question}</div>
                                        </div>

                                        <div className="ml-8 space-y-2 mb-3 pl-2">
                                            {(q.options || []).map((opt, oi) => {
                                                const isUser = (userAnswers[q.id] || '').trim().toLowerCase() === opt.trim().toLowerCase();
                                                const isCorrectOpt = (q.correctAnswer || '').trim().toLowerCase() === opt.trim().toLowerCase();
                                                return (
                                                    <div key={oi} className="flex items-center gap-2.5 text-sm p-2.5 rounded-lg"
                                                        style={{
                                                            background: isCorrectOpt ? 'rgba(52,211,153,0.08)' : isUser && !correct ? 'rgba(248,113,113,0.08)' : 'transparent',
                                                            border: isCorrectOpt ? '1px solid rgba(52,211,153,0.2)' : isUser && !correct ? '1px solid rgba(248,113,113,0.2)' : '1px solid transparent'
                                                        }}>
                                                        <span className="w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0"
                                                            style={{
                                                                background: isCorrectOpt ? '#34d399' : isUser && !correct ? '#f87171' : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                                                                color: (isCorrectOpt || (isUser && !correct)) ? 'white' : isDark ? '#94a3b8' : '#64748b'
                                                            }}>
                                                            {String.fromCharCode(65 + oi)}
                                                        </span>
                                                        <span style={{ color: isCorrectOpt ? '#34d399' : isUser && !correct ? '#f87171' : isDark ? '#94a3b8' : '#64748b' }}>
                                                            {opt}
                                                        </span>
                                                        {isCorrectOpt && <CheckCircle size={14} style={{ color: '#34d399', marginLeft: 'auto' }} />}
                                                        {isUser && !correct && <XCircle size={14} style={{ color: '#f87171', marginLeft: 'auto' }} />}
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        {q.explanation && (
                                            <div className="ml-8 pl-2 p-3 rounded-lg text-sm" style={{ background: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)', color: isDark ? '#94a3b8' : '#64748b' }}>
                                                💡 {q.explanation}
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="text-center mt-8">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={resetQuiz} className="btn-primary" style={{ padding: '0.85rem 2rem' }}>
                                <RotateCcw size={16} /> Take Another Quiz
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
