import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { BarChart3, Brain, Target, TrendingUp, BookOpen, AlertTriangle, Lightbulb, CheckCircle } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } })
};

export default function DashboardPage() {
    const { theme } = useTheme();
    const { isAuthenticated } = useAuth();
    const isDark = theme === 'dark';
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            setLoading(false);
            return;
        }
        api.get('/learning/dashboard')
            .then(res => setData(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center px-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 text-center max-w-md">
                    <Brain size={48} className="mx-auto mb-4" style={{ color: '#818cf8' }} />
                    <h2 className="text-2xl font-bold mb-3" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>Sign In Required</h2>
                    <p style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Login to access your personalized learning dashboard and track your progress.</p>
                </motion.div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#818cf8', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    const user = data?.user || {};
    const stats = data?.stats || {};
    const recommendations = data?.recommendations || {};

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                        Learning <span className="gradient-text">Dashboard</span>
                    </h1>
                    <p style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                        Welcome back, <strong>{user.name || 'Student'}</strong>! Here's your personalized learning overview.
                    </p>
                </motion.div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                    {[
                        { icon: BookOpen, label: 'Questions Asked', value: user.totalQuestionsAsked || 0, color: '#818cf8' },
                        { icon: Target, label: 'Quizzes Taken', value: user.totalQuizzesTaken || 0, color: '#22d3ee' },
                        { icon: TrendingUp, label: 'Avg Quiz Score', value: `${stats.averageQuizScore || 0}%`, color: '#34d399' },
                        { icon: BarChart3, label: 'Topics Explored', value: stats.topicsExplored || 0, color: '#fbbf24' }
                    ].map((s, i) => (
                        <motion.div key={i} initial="hidden" animate="visible" custom={i + 1} variants={fadeUp}
                            className="glass-card p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{ background: `${s.color}18`, color: s.color }}>
                                <s.icon size={24} />
                            </div>
                            <div>
                                <div className="text-2xl font-bold" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{s.value}</div>
                                <div className="text-sm" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{s.label}</div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Weak Topics */}
                    <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp} className="glass-card p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                            <AlertTriangle size={18} style={{ color: '#f59e0b' }} /> Weak Topics
                        </h3>
                        {user.weakTopics && user.weakTopics.length > 0 ? (
                            <div className="space-y-3">
                                {user.weakTopics.map((topic, i) => (
                                    <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                                        style={{ background: isDark ? 'rgba(245,158,11,0.08)' : 'rgba(245,158,11,0.06)' }}>
                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#f59e0b' }} />
                                        <span className="text-sm font-medium" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{topic}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                                No weak topics detected yet. Keep taking quizzes to track your progress!
                            </p>
                        )}
                    </motion.div>

                    {/* AI Recommendations */}
                    <motion.div initial="hidden" animate="visible" custom={6} variants={fadeUp} className="lg:col-span-2 glass-card p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                            <Lightbulb size={18} style={{ color: '#818cf8' }} /> AI Recommendations
                        </h3>
                        {recommendations.recommendations && recommendations.recommendations.length > 0 ? (
                            <div className="space-y-4">
                                {recommendations.recommendations.map((rec, i) => (
                                    <div key={i} className="p-4 rounded-xl"
                                        style={{ background: isDark ? 'rgba(99,102,241,0.06)' : 'rgba(99,102,241,0.04)', border: `1px solid ${isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)'}` }}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold text-sm" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{rec.topic}</span>
                                            <span className="text-xs px-2 py-0.5 rounded-full"
                                                style={{
                                                    background: rec.difficulty === 'beginner' ? '#34d39918' : rec.difficulty === 'advanced' ? '#f5990b18' : '#818cf818',
                                                    color: rec.difficulty === 'beginner' ? '#34d399' : rec.difficulty === 'advanced' ? '#f59e0b' : '#818cf8'
                                                }}>
                                                {rec.difficulty}
                                            </span>
                                        </div>
                                        <p className="text-sm mb-2" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{rec.reason}</p>
                                    </div>
                                ))}

                                {recommendations.overallAdvice && (
                                    <div className="p-4 rounded-xl mt-4" style={{ background: isDark ? 'rgba(34,211,238,0.06)' : 'rgba(34,211,238,0.04)' }}>
                                        <p className="text-sm" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                            <strong style={{ color: '#22d3ee' }}>💡 AI Advice:</strong> {recommendations.overallAdvice}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-sm" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                                Ask questions and take quizzes to receive personalized AI recommendations!
                            </p>
                        )}
                    </motion.div>
                </div>

                {/* Recent Quizzes */}
                {stats.recentQuizzes && stats.recentQuizzes.length > 0 && (
                    <motion.div initial="hidden" animate="visible" custom={7} variants={fadeUp} className="glass-card p-6 mt-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                            <CheckCircle size={18} style={{ color: '#34d399' }} /> Recent Quiz Results
                        </h3>
                        <div className="space-y-3">
                            {stats.recentQuizzes.map((q, i) => (
                                <div key={i} className="flex items-center justify-between p-3 rounded-xl"
                                    style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold"
                                            style={{
                                                background: q.percentage >= 80 ? '#34d39918' : q.percentage >= 60 ? '#fbbf2418' : '#f8717118',
                                                color: q.percentage >= 80 ? '#34d399' : q.percentage >= 60 ? '#fbbf24' : '#f87171'
                                            }}>
                                            {q.percentage}%
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{q.topic}</div>
                                            <div className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                                                {q.score}/{q.total} correct • {new Date(q.date).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                                        <div className="h-full rounded-full transition-all" style={{
                                            width: `${q.percentage}%`,
                                            background: q.percentage >= 80 ? '#34d399' : q.percentage >= 60 ? '#fbbf24' : '#f87171'
                                        }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
