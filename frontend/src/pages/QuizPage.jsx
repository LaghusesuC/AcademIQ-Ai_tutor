import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { Target, CheckCircle, XCircle, RotateCcw, Loader2, Trophy, ArrowRight } from 'lucide-react';

const topics = [
    'Binary Search', 'Recursion', 'Linked Lists', 'Stack and Queue', 'Sorting Algorithms',
    'Tree Traversal', 'Graph Algorithms', 'Dynamic Programming', 'Object-Oriented Programming',
    'SQL Queries', 'Python Basics', 'JavaScript ES6', 'Operating Systems', 'Computer Networks'
];

export default function QuizPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [selectedTopic, setSelectedTopic] = useState('');
    const [customTopic, setCustomTopic] = useState('');
    const [quiz, setQuiz] = useState(null);
    const [currentQ, setCurrentQ] = useState(0);
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);
    const [loading, setLoading] = useState(false);

    const generateQuiz = async () => {
        const topic = selectedTopic || customTopic.trim();
        if (!topic) return;
        setLoading(true);
        setShowResults(false);
        setUserAnswers({});
        setCurrentQ(0);
        try {
            const res = await api.post('/quiz/generate', { topic, numQuestions: 5 });
            setQuiz(res.data);
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
    };

    const getScore = () => {
        if (!quiz) return { correct: 0, total: 0 };
        let correct = 0;
        quiz.questions.forEach(q => {
            if (userAnswers[q.id] === q.correctAnswer) correct++;
        });
        return { correct, total: quiz.questions.length };
    };

    const resetQuiz = () => {
        setQuiz(null);
        setSelectedTopic('');
        setCustomTopic('');
        setUserAnswers({});
        setShowResults(false);
        setCurrentQ(0);
    };

    const score = getScore();

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                        Quiz <span className="gradient-text">Generator</span>
                    </h1>
                    <p style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Test your knowledge with AI-generated quizzes on any topic.</p>
                </motion.div>

                {/* Topic Selection */}
                {!quiz && !loading && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div className="glass-card p-8">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                <Target size={20} style={{ color: '#818cf8' }} /> Choose a Topic
                            </h3>
                            <div className="flex flex-wrap gap-2 mb-6">
                                {topics.map(t => (
                                    <motion.button
                                        key={t}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => { setSelectedTopic(t); setCustomTopic(''); }}
                                        className="px-3 py-1.5 rounded-lg text-sm border-none cursor-pointer transition-all"
                                        style={{
                                            background: selectedTopic === t
                                                ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                                                : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                            color: selectedTopic === t ? 'white' : isDark ? '#94a3b8' : '#64748b',
                                            border: selectedTopic === t ? 'none' : `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`
                                        }}
                                    >
                                        {t}
                                    </motion.button>
                                ))}
                            </div>
                            <div className="flex gap-3">
                                <input
                                    className="input-field"
                                    placeholder="Or type a custom topic..."
                                    value={customTopic}
                                    onChange={e => { setCustomTopic(e.target.value); setSelectedTopic(''); }}
                                />
                                <button
                                    onClick={generateQuiz}
                                    disabled={!selectedTopic && !customTopic.trim()}
                                    className="btn-primary whitespace-nowrap"
                                    style={{ opacity: (selectedTopic || customTopic.trim()) ? 1 : 0.5 }}
                                >
                                    Generate Quiz <ArrowRight size={16} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Loading */}
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
                        <Loader2 size={40} className="mx-auto mb-4 animate-spin" style={{ color: '#818cf8' }} />
                        <p className="font-medium" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>Generating your quiz...</p>
                        <p className="text-sm mt-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>AI is crafting questions on {selectedTopic || customTopic}</p>
                    </motion.div>
                )}

                {/* Quiz Questions */}
                {quiz && !showResults && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="glass-card p-8">
                            {/* Progress */}
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-sm font-medium" style={{ color: '#818cf8' }}>
                                    Question {currentQ + 1} of {quiz.questions.length}
                                </span>
                                <div className="flex gap-1">
                                    {quiz.questions.map((_, i) => (
                                        <div key={i} className="w-8 h-1.5 rounded-full cursor-pointer" onClick={() => setCurrentQ(i)}
                                            style={{
                                                background: i === currentQ
                                                    ? '#818cf8'
                                                    : userAnswers[quiz.questions[i].id]
                                                        ? '#34d399'
                                                        : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>

                            <AnimatePresence mode="wait">
                                <motion.div key={currentQ} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                                    {(() => {
                                        const q = quiz.questions[currentQ];
                                        return (
                                            <div>
                                                <h3 className="text-lg font-semibold mb-6" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                                    {q.question}
                                                </h3>

                                                {q.type === 'mcq' && q.options ? (
                                                    <div className="space-y-3">
                                                        {q.options.map((opt, oi) => (
                                                            <motion.button
                                                                key={oi}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={() => handleAnswer(q.id, opt)}
                                                                className="w-full text-left p-4 rounded-xl border-none cursor-pointer transition-all"
                                                                style={{
                                                                    background: userAnswers[q.id] === opt
                                                                        ? 'rgba(99,102,241,0.15)'
                                                                        : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                                                    border: userAnswers[q.id] === opt
                                                                        ? '2px solid #818cf8'
                                                                        : `2px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                                                    color: isDark ? '#e2e8f0' : '#334155'
                                                                }}
                                                            >
                                                                <span className="font-medium">{String.fromCharCode(65 + oi)}.</span> {opt}
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <textarea
                                                        className="input-field"
                                                        rows={3}
                                                        placeholder="Type your answer..."
                                                        value={userAnswers[q.id] || ''}
                                                        onChange={e => handleAnswer(q.id, e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        );
                                    })()}
                                </motion.div>
                            </AnimatePresence>

                            {/* Navigation */}
                            <div className="flex justify-between mt-8">
                                <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
                                    className="btn-secondary" style={{ opacity: currentQ === 0 ? 0.5 : 1 }}>
                                    Previous
                                </button>
                                {currentQ < quiz.questions.length - 1 ? (
                                    <button onClick={() => setCurrentQ(currentQ + 1)} className="btn-primary">
                                        Next <ArrowRight size={16} />
                                    </button>
                                ) : (
                                    <button onClick={submitQuiz} className="btn-primary"
                                        style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                                        Submit Quiz <CheckCircle size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Results */}
                {showResults && quiz && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <div className="glass-card p-8 text-center mb-6">
                            <Trophy size={48} className="mx-auto mb-4" style={{ color: score.correct / score.total >= 0.8 ? '#fbbf24' : '#818cf8' }} />
                            <h2 className="text-3xl font-bold mb-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                {Math.round(score.correct / score.total * 100)}%
                            </h2>
                            <p className="text-lg" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                You got <strong>{score.correct}</strong> out of <strong>{score.total}</strong> correct
                            </p>
                            <p className="text-sm mt-2" style={{ color: score.correct / score.total >= 0.8 ? '#34d399' : score.correct / score.total >= 0.6 ? '#fbbf24' : '#f87171' }}>
                                {score.correct / score.total >= 0.8 ? '🎉 Excellent! Great job!' : score.correct / score.total >= 0.6 ? '👍 Good effort! Keep practicing.' : '📚 Keep studying! You\'ll get there.'}
                            </p>
                        </div>

                        {/* Answers review */}
                        <div className="space-y-4">
                            {quiz.questions.map((q, i) => {
                                const isCorrect = userAnswers[q.id] === q.correctAnswer;
                                return (
                                    <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                        className="glass-card p-5">
                                        <div className="flex items-start gap-3 mb-3">
                                            {isCorrect ? <CheckCircle size={20} style={{ color: '#34d399', flexShrink: 0, marginTop: 2 }} /> : <XCircle size={20} style={{ color: '#f87171', flexShrink: 0, marginTop: 2 }} />}
                                            <div className="font-medium text-sm" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{q.question}</div>
                                        </div>
                                        <div className="ml-8 space-y-1 text-sm">
                                            <p><span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Your answer:</span>{' '}
                                                <span style={{ color: isCorrect ? '#34d399' : '#f87171' }}>{userAnswers[q.id] || 'Not answered'}</span></p>
                                            {!isCorrect && (
                                                <p><span style={{ color: isDark ? '#64748b' : '#94a3b8' }}>Correct answer:</span>{' '}
                                                    <span style={{ color: '#34d399' }}>{q.correctAnswer}</span></p>
                                            )}
                                            {q.explanation && (
                                                <p className="mt-2 p-2 rounded-lg" style={{ background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)', color: isDark ? '#94a3b8' : '#64748b' }}>
                                                    💡 {q.explanation}
                                                </p>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="text-center mt-6">
                            <button onClick={resetQuiz} className="btn-primary">
                                <RotateCcw size={16} /> Take Another Quiz
                            </button>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
