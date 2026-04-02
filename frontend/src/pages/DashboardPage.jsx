import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
    BarChart3, Brain, Target, TrendingUp, BookOpen, AlertTriangle,
    Lightbulb, CheckCircle, Trophy, ArrowRight, Star, Clock, Zap,
    Code2, Sparkles, ChevronRight, Flame, Award, GraduationCap, XCircle, Play
} from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5, ease: 'easeOut' } })
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
};

const staggerItem = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 }
};

// Predefined smart learning paths
const learningPaths = [
    {
        id: 'dsa',
        title: 'Data Structures & Algorithms',
        icon: Code2,
        color: '#818cf8',
        gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        milestones: [
            { title: 'Arrays & Strings', desc: 'Master array manipulation and string processing', topics: ['Arrays', 'Strings', 'Two Pointers'] },
            { title: 'Linked Lists & Stacks', desc: 'Understand pointer-based data structures', topics: ['Linked Lists', 'Stack and Queue'] },
            { title: 'Trees & Graphs', desc: 'Navigate hierarchical and network structures', topics: ['Binary Trees', 'BST', 'Graph Traversal'] },
            { title: 'Sorting & Searching', desc: 'Efficient data retrieval and ordering', topics: ['Binary Search', 'Sorting Algorithms', 'Merge Sort'] },
            { title: 'Dynamic Programming', desc: 'Solve optimization problems systematically', topics: ['Memoization', 'Tabulation', 'DP Patterns'] }
        ]
    },
    {
        id: 'webdev',
        title: 'Full-Stack Web Development',
        icon: Zap,
        color: '#22d3ee',
        gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)',
        milestones: [
            { title: 'HTML, CSS & JavaScript', desc: 'Build the web foundation', topics: ['HTML5', 'CSS3', 'JavaScript ES6'] },
            { title: 'React Fundamentals', desc: 'Component-based UI development', topics: ['React Components', 'State & Props', 'Hooks'] },
            { title: 'Backend with Node.js', desc: 'Server-side scripting and APIs', topics: ['Node.js', 'Express.js', 'REST APIs'] },
            { title: 'Databases', desc: 'Persist and query data', topics: ['MongoDB', 'SQL', 'Mongoose'] },
            { title: 'Deployment & DevOps', desc: 'Ship your projects to production', topics: ['Docker', 'CI/CD', 'Cloud Hosting'] }
        ]
    },
    {
        id: 'python',
        title: 'Python Mastery',
        icon: Brain,
        color: '#34d399',
        gradient: 'linear-gradient(135deg, #10b981, #059669)',
        milestones: [
            { title: 'Python Basics', desc: 'Variables, loops, and functions', topics: ['Syntax', 'Data Types', 'Control Flow'] },
            { title: 'OOP in Python', desc: 'Classes, inheritance, polymorphism', topics: ['Classes', 'Inheritance', 'Magic Methods'] },
            { title: 'Data Structures', desc: 'Lists, dicts, sets, and comprehensions', topics: ['Collections', 'Comprehensions', 'Generators'] },
            { title: 'Libraries & Frameworks', desc: 'NumPy, Pandas, Flask/Django', topics: ['NumPy', 'Pandas', 'Flask'] },
            { title: 'Advanced Python', desc: 'Decorators, async, and testing', topics: ['Decorators', 'AsyncIO', 'Unit Testing'] }
        ]
    }
];

function getQuizHistory() {
    try {
        const data = localStorage.getItem('quizHistory');
        return data ? JSON.parse(data) : [];
    } catch { return []; }
}

function getLearningProgress() {
    try {
        const data = localStorage.getItem('learningPathProgress');
        return data ? JSON.parse(data) : {};
    } catch { return {}; }
}

function saveLearningProgress(progress) {
    localStorage.setItem('learningPathProgress', JSON.stringify(progress));
}

// Mini circular progress ring component
function ProgressRing({ percent, size = 60, strokeWidth = 5, color = '#818cf8' }) {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (percent / 100) * circumference;
    return (
        <svg width={size} height={size} className="transform -rotate-90">
            <circle cx={size / 2} cy={size / 2} r={radius}
                fill="transparent" stroke="currentColor" strokeWidth={strokeWidth}
                style={{ color: 'rgba(148,163,184,0.15)' }} />
            <motion.circle
                cx={size / 2} cy={size / 2} r={radius}
                fill="transparent" stroke={color} strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: offset }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
            />
        </svg>
    );
}

export default function DashboardPage() {
    const { theme } = useTheme();
    const { isAuthenticated } = useAuth();
    const isDark = theme === 'dark';
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activePath, setActivePath] = useState(null);
    const [pathProgress, setPathProgress] = useState(getLearningProgress());
    const [quizHistory] = useState(() => getQuizHistory());
    const [activeTab, setActiveTab] = useState('overview');

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

    const toggleMilestone = (pathId, milestoneIdx) => {
        setPathProgress(prev => {
            const key = `${pathId}-${milestoneIdx}`;
            const updated = { ...prev, [key]: !prev[key] };
            saveLearningProgress(updated);
            return updated;
        });
    };

    const getPathCompletion = (pathId, totalMilestones) => {
        let completed = 0;
        for (let i = 0; i < totalMilestones; i++) {
            if (pathProgress[`${pathId}-${i}`]) completed++;
        }
        return Math.round((completed / totalMilestones) * 100);
    };

    // Calculate overall stats from quiz history
    const totalAttempts = quizHistory.length;
    const totalQuestions = quizHistory.reduce((sum, q) => sum + (q.totalQuestions || 0), 0);
    const totalCorrect = quizHistory.reduce((sum, q) => sum + (q.correctAnswers || 0), 0);
    const avgScore = totalAttempts > 0 ? Math.round(totalCorrect / totalQuestions * 100) : 0;
    const streak = (() => {
        let s = 0;
        for (const q of quizHistory) {
            if (q.percentage >= 60) s++;
            else break;
        }
        return s;
    })();

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center px-4">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-card p-12 text-center max-w-md">
                    <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                        <Brain size={48} className="mx-auto mb-4" style={{ color: '#818cf8' }} />
                    </motion.div>
                    <h2 className="text-2xl font-bold mb-3" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>Sign In Required</h2>
                    <p className="mb-6" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Login to access your personalized learning dashboard and track your progress.</p>
                    <Link to="/login" className="btn-primary no-underline">Sign In <ArrowRight size={16} /></Link>
                </motion.div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}>
                    <Sparkles size={36} style={{ color: '#818cf8' }} />
                </motion.div>
            </div>
        );
    }

    const user = data?.user || {};
    const stats = data?.stats || {};
    const recommendations = data?.recommendations || {};

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BarChart3 },
        { id: 'learning', label: 'Learning Paths', icon: GraduationCap },
        { id: 'quizzes', label: 'Quiz History', icon: Trophy }
    ];

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                Learning <span className="animated-gradient-text">Dashboard</span>
                            </h1>
                            <p className="text-lg" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                Welcome back, <strong style={{ color: '#818cf8' }}>{user.name || 'Student'}</strong>! Track your progress and discover new learning paths.
                            </p>
                        </div>
                        {streak > 0 && (
                            <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, delay: 0.3 }}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl self-start"
                                style={{ background: isDark ? 'rgba(251,191,36,0.1)' : 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)' }}>
                                <Flame size={18} style={{ color: '#fbbf24' }} />
                                <span className="font-bold text-sm" style={{ color: '#fbbf24' }}>{streak} Quiz Streak 🔥</span>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* Tab Navigation */}
                <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="mb-8">
                    <div className="flex gap-2 p-1 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)' }}>
                        {tabs.map(tab => (
                            <motion.button
                                key={tab.id}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => setActiveTab(tab.id)}
                                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium border-none cursor-pointer transition-all relative"
                                style={{
                                    background: activeTab === tab.id ? isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)' : 'transparent',
                                    color: activeTab === tab.id ? '#818cf8' : isDark ? '#64748b' : '#94a3b8'
                                }}>
                                {activeTab === tab.id && (
                                    <motion.div
                                        layoutId="dashboard-tab-bg"
                                        className="absolute inset-0 rounded-lg"
                                        style={{ background: isDark ? 'rgba(99,102,241,0.12)' : 'rgba(99,102,241,0.08)' }}
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <tab.icon size={16} className="relative z-10" />
                                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                            </motion.button>
                        ))}
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {/* ========== OVERVIEW TAB ========== */}
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                            {/* Stats Row */}
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                {[
                                    { icon: BookOpen, label: 'Questions Asked', value: user.totalQuestionsAsked || 0, color: '#818cf8', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
                                    { icon: Target, label: 'Quiz Attempts', value: user.totalQuizzesTaken || totalAttempts || 0, color: '#22d3ee', gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)' },
                                    { icon: TrendingUp, label: 'Avg Score', value: `${stats.averageQuizScore || avgScore}%`, color: '#34d399', gradient: 'linear-gradient(135deg, #10b981, #059669)' },
                                    { icon: Star, label: 'Total Questions', value: totalQuestions || stats.topicsExplored || 0, color: '#fbbf24', gradient: 'linear-gradient(135deg, #f59e0b, #d97706)' }
                                ].map((s, i) => (
                                    <motion.div
                                        key={i}
                                        initial="hidden" animate="visible" custom={i + 2} variants={fadeUp}
                                        whileHover={{ y: -4, transition: { duration: 0.2 } }}
                                        className="glass-card p-5 relative overflow-hidden group"
                                    >
                                        {/* Subtle bg glow on hover */}
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ background: s.gradient }} />
                                        <div className="relative flex items-center gap-4">
                                            <motion.div
                                                whileHover={{ rotate: 10, scale: 1.1 }}
                                                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                                                style={{ background: `${s.color}15`, color: s.color }}>
                                                <s.icon size={22} />
                                            </motion.div>
                                            <div>
                                                <div className="text-2xl font-bold" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{s.value}</div>
                                                <div className="text-xs font-medium" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{s.label}</div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="grid lg:grid-cols-3 gap-6 mb-8">
                                {/* Weak Topics */}
                                <motion.div initial="hidden" animate="visible" custom={6} variants={fadeUp} className="glass-card p-6">
                                    <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                        <AlertTriangle size={18} style={{ color: '#f59e0b' }} /> Weak Topics
                                    </h3>
                                    {user.weakTopics && user.weakTopics.length > 0 ? (
                                        <div className="space-y-2.5">
                                            {user.weakTopics.map((topic, i) => (
                                                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
                                                    className="flex items-center justify-between p-3 rounded-xl"
                                                    style={{ background: isDark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.04)' }}>
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: '#f59e0b' }} />
                                                        <span className="text-sm font-medium" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{topic}</span>
                                                    </div>
                                                    <Link to="/quiz" className="text-xs font-medium no-underline" style={{ color: '#818cf8' }}>
                                                        Practice →
                                                    </Link>
                                                </motion.div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-6">
                                            <Trophy size={28} className="mx-auto mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                                            <p className="text-sm" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                                                No weak topics yet! Take quizzes to track your knowledge gaps.
                                            </p>
                                        </div>
                                    )}
                                </motion.div>

                                {/* AI Recommendations */}
                                <motion.div initial="hidden" animate="visible" custom={7} variants={fadeUp} className="lg:col-span-2 glass-card p-6">
                                    <h3 className="text-base font-bold mb-4 flex items-center gap-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                        <Lightbulb size={18} style={{ color: '#818cf8' }} /> AI Recommendations
                                    </h3>
                                    {recommendations.recommendations && recommendations.recommendations.length > 0 ? (
                                        <div className="space-y-3">
                                            {recommendations.recommendations.map((rec, i) => (
                                                <motion.div key={i}
                                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                                                    className="p-4 rounded-xl relative overflow-hidden group"
                                                    style={{ background: isDark ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.03)', border: `1px solid ${isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)'}` }}>
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="font-semibold text-sm" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{rec.topic}</span>
                                                        <span className="text-xs px-2.5 py-0.5 rounded-full font-medium"
                                                            style={{
                                                                background: rec.difficulty === 'beginner' ? 'rgba(52,211,153,0.12)' : rec.difficulty === 'advanced' ? 'rgba(245,158,11,0.12)' : 'rgba(129,140,248,0.12)',
                                                                color: rec.difficulty === 'beginner' ? '#34d399' : rec.difficulty === 'advanced' ? '#f59e0b' : '#818cf8'
                                                            }}>
                                                            {rec.difficulty}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{rec.reason}</p>
                                                </motion.div>
                                            ))}
                                            {recommendations.overallAdvice && (
                                                <div className="p-4 rounded-xl" style={{ background: isDark ? 'rgba(34,211,238,0.05)' : 'rgba(34,211,238,0.03)', border: '1px solid rgba(34,211,238,0.1)' }}>
                                                    <p className="text-sm" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                                        <strong style={{ color: '#22d3ee' }}>💡 AI Advice:</strong> {recommendations.overallAdvice}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8">
                                            <Lightbulb size={28} className="mx-auto mb-2" style={{ color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                                            <p className="text-sm" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                                                Ask questions and take quizzes to receive personalized AI recommendations!
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            </div>

                            {/* Quick Actions */}
                            <motion.div initial="hidden" animate="visible" custom={8} variants={fadeUp}>
                                <h3 className="text-base font-bold mb-4" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>Quick Actions</h3>
                                <div className="grid sm:grid-cols-3 gap-4">
                                    {[
                                        { to: '/chat', icon: Brain, title: 'Ask AI Tutor', desc: 'Get instant academic help', color: '#818cf8', gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)' },
                                        { to: '/quiz', icon: Target, title: 'Take a Quiz', desc: 'Test your knowledge', color: '#22d3ee', gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)' },
                                        { to: '/code-analyzer', icon: Code2, title: 'Analyze Code', desc: 'Debug your code', color: '#34d399', gradient: 'linear-gradient(135deg, #10b981, #059669)' }
                                    ].map((action, i) => (
                                        <Link key={i} to={action.to} className="no-underline">
                                            <motion.div
                                                whileHover={{ y: -4, scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="glass-card p-5 flex items-center gap-4 cursor-pointer relative overflow-hidden group"
                                            >
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ background: action.gradient }} />
                                                <div className="w-11 h-11 rounded-xl flex items-center justify-center relative z-10" style={{ background: action.gradient }}>
                                                    <action.icon size={20} color="white" />
                                                </div>
                                                <div className="relative z-10">
                                                    <div className="font-semibold text-sm" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{action.title}</div>
                                                    <div className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{action.desc}</div>
                                                </div>
                                                <ChevronRight size={16} className="ml-auto relative z-10" style={{ color: isDark ? '#334155' : '#cbd5e1' }} />
                                            </motion.div>
                                        </Link>
                                    ))}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {/* ========== LEARNING PATHS TAB ========== */}
                    {activeTab === 'learning' && (
                        <motion.div key="learning" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                            <div className="grid md:grid-cols-3 gap-6 mb-8">
                                {learningPaths.map((path, pi) => {
                                    const completion = getPathCompletion(path.id, path.milestones.length);
                                    return (
                                        <motion.div
                                            key={path.id}
                                            initial="hidden" animate="visible" custom={pi + 1} variants={fadeUp}
                                            whileHover={{ y: -4 }}
                                            onClick={() => setActivePath(activePath === path.id ? null : path.id)}
                                            className="glass-card p-6 cursor-pointer relative overflow-hidden group gradient-border"
                                        >
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-8 transition-opacity duration-500" style={{ background: path.gradient }} />
                                            <div className="flex items-start justify-between mb-4 relative z-10">
                                                <motion.div
                                                    whileHover={{ rotate: 10 }}
                                                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                                                    style={{ background: path.gradient }}>
                                                    <path.icon size={22} color="white" />
                                                </motion.div>
                                                <div className="relative">
                                                    <ProgressRing percent={completion} size={52} strokeWidth={4} color={path.color} />
                                                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                                                        style={{ color: path.color }}>{completion}%</span>
                                                </div>
                                            </div>
                                            <h3 className="font-bold text-base mb-1 relative z-10" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                                {path.title}
                                            </h3>
                                            <p className="text-xs relative z-10" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                                                {path.milestones.length} milestones • {completion === 100 ? 'Completed! 🎉' : `${Math.round(completion / (100 / path.milestones.length))} done`}
                                            </p>
                                            <div className="w-full h-1.5 rounded-full mt-3 overflow-hidden relative z-10" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }}>
                                                <motion.div className="h-full rounded-full" style={{ background: path.gradient }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${completion}%` }}
                                                    transition={{ duration: 1, ease: 'easeOut', delay: pi * 0.15 }} />
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>

                            {/* Expanded path milestones */}
                            <AnimatePresence>
                                {activePath && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.35 }}
                                        className="overflow-hidden"
                                    >
                                        {(() => {
                                            const path = learningPaths.find(p => p.id === activePath);
                                            if (!path) return null;
                                            return (
                                                <div className="glass-card p-6">
                                                    <h3 className="font-bold text-lg mb-5 flex items-center gap-3" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                                        <GraduationCap size={20} style={{ color: path.color }} />
                                                        {path.title} — Milestones
                                                    </h3>
                                                    <div className="space-y-3">
                                                        {path.milestones.map((m, mi) => {
                                                            const done = pathProgress[`${path.id}-${mi}`];
                                                            return (
                                                                <motion.div
                                                                    key={mi}
                                                                    initial={{ opacity: 0, x: -20 }}
                                                                    animate={{ opacity: 1, x: 0 }}
                                                                    transition={{ delay: mi * 0.08 }}
                                                                    className="flex items-start gap-4 p-4 rounded-xl transition-all"
                                                                    style={{
                                                                        background: done
                                                                            ? isDark ? 'rgba(52,211,153,0.06)' : 'rgba(52,211,153,0.04)'
                                                                            : isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                                                        border: done ? '1px solid rgba(52,211,153,0.15)' : `1px solid ${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                                                                    }}>
                                                                    <motion.button
                                                                        whileTap={{ scale: 0.85 }}
                                                                        onClick={() => toggleMilestone(path.id, mi)}
                                                                        className="w-7 h-7 rounded-lg flex items-center justify-center border-none cursor-pointer flex-shrink-0 mt-0.5"
                                                                        style={{
                                                                            background: done ? path.gradient : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                                                                            color: done ? 'white' : isDark ? '#475569' : '#94a3b8'
                                                                        }}>
                                                                        {done ? <CheckCircle size={14} /> : <span className="text-xs font-bold">{mi + 1}</span>}
                                                                    </motion.button>
                                                                    <div className="flex-1">
                                                                        <div className="font-semibold text-sm mb-0.5" style={{
                                                                            color: done ? '#34d399' : isDark ? '#e2e8f0' : '#334155',
                                                                            textDecoration: done ? 'line-through' : 'none'
                                                                        }}>
                                                                            {m.title}
                                                                        </div>
                                                                        <p className="text-xs mb-2" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{m.desc}</p>
                                                                        <div className="flex flex-wrap gap-1.5 mb-3">
                                                                            {m.topics.map((t, ti) => (
                                                                                <span key={ti} className="px-2 py-0.5 rounded text-xs"
                                                                                    style={{
                                                                                        background: `${path.color}10`,
                                                                                        color: path.color,
                                                                                        border: `1px solid ${path.color}20`
                                                                                    }}>
                                                                                    {t}
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                        <motion.button
                                                                            whileHover={{ scale: 1.05, x: 4 }}
                                                                            whileTap={{ scale: 0.95 }}
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                navigate(`/chat?topic=${encodeURIComponent(m.title)}`);
                                                                            }}
                                                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer transition-all"
                                                                            style={{
                                                                                background: path.gradient,
                                                                                color: 'white',
                                                                                boxShadow: `0 3px 10px ${path.color}30`
                                                                            }}
                                                                        >
                                                                            <Play size={12} /> Start Learning
                                                                        </motion.button>
                                                                    </div>
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            );
                                        })()}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {/* ========== QUIZ HISTORY TAB ========== */}
                    {activeTab === 'quizzes' && (
                        <motion.div key="quizzes" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.3 }}>
                            {/* Quiz stats summary row */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                                {[
                                    { label: 'Total Attempts', value: totalAttempts || (stats.recentQuizzes || []).length, icon: Target, color: '#818cf8' },
                                    { label: 'Questions Answered', value: totalQuestions || '—', icon: BookOpen, color: '#22d3ee' },
                                    { label: 'Correct Answers', value: totalCorrect || '—', icon: CheckCircle, color: '#34d399' },
                                    { label: 'Average Score', value: `${stats.averageQuizScore || avgScore}%`, icon: Award, color: '#fbbf24' }
                                ].map((s, i) => (
                                    <motion.div key={i} initial="hidden" animate="visible" custom={i} variants={fadeUp}
                                        className="glass-card p-4 text-center">
                                        <s.icon size={20} className="mx-auto mb-2" style={{ color: s.color }} />
                                        <div className="text-xl font-bold" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{s.value}</div>
                                        <div className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{s.label}</div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Recent quiz results from API */}
                            {stats.recentQuizzes && stats.recentQuizzes.length > 0 && (
                                <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}
                                    className="glass-card p-6 mb-6">
                                    <h3 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                        <Trophy size={18} style={{ color: '#fbbf24' }} /> Recent Quiz Results
                                    </h3>
                                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
                                        {stats.recentQuizzes.map((q, i) => (
                                            <motion.div key={i} variants={staggerItem}
                                                className="flex items-center justify-between p-4 rounded-xl transition-all"
                                                style={{
                                                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`
                                                }}>
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <ProgressRing
                                                            percent={q.percentage}
                                                            size={48} strokeWidth={4}
                                                            color={q.percentage >= 80 ? '#34d399' : q.percentage >= 60 ? '#fbbf24' : '#f87171'} />
                                                        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold"
                                                            style={{ color: q.percentage >= 80 ? '#34d399' : q.percentage >= 60 ? '#fbbf24' : '#f87171' }}>
                                                            {q.percentage}%
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-sm" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{q.topic}</div>
                                                        <div className="flex items-center gap-3 mt-0.5">
                                                            <span className="text-xs flex items-center gap-1" style={{ color: '#34d399' }}>
                                                                <CheckCircle size={10} /> {q.score} correct
                                                            </span>
                                                            <span className="text-xs flex items-center gap-1" style={{ color: '#f87171' }}>
                                                                <XCircle size={10} /> {q.total - q.score} wrong
                                                            </span>
                                                            <span className="text-xs flex items-center gap-1" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                                                                <Clock size={10} /> {new Date(q.date).toLocaleDateString()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="hidden sm:flex items-center gap-1.5">
                                                    {q.percentage >= 80 ? (
                                                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399' }}>Excellent</span>
                                                    ) : q.percentage >= 60 ? (
                                                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(251,191,36,0.1)', color: '#fbbf24' }}>Good</span>
                                                    ) : (
                                                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>Needs Work</span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </motion.div>
                            )}

                            {/* Local quiz history */}
                            {quizHistory.length > 0 ? (
                                <motion.div initial="hidden" animate="visible" custom={5} variants={fadeUp}
                                    className="glass-card p-6">
                                    <h3 className="font-bold text-base mb-4 flex items-center gap-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                        <Clock size={18} style={{ color: '#818cf8' }} /> Local Quiz History
                                    </h3>
                                    <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-3">
                                        {quizHistory.map((q, i) => (
                                            <motion.div key={i} variants={staggerItem}
                                                className="flex items-center justify-between p-4 rounded-xl"
                                                style={{
                                                    background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}`
                                                }}>
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold"
                                                        style={{
                                                            background: (q.percentage || 0) >= 80 ? 'rgba(52,211,153,0.12)' : (q.percentage || 0) >= 60 ? 'rgba(251,191,36,0.12)' : 'rgba(248,113,113,0.12)',
                                                            color: (q.percentage || 0) >= 80 ? '#34d399' : (q.percentage || 0) >= 60 ? '#fbbf24' : '#f87171'
                                                        }}>
                                                        {q.percentage || 0}%
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-sm" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>
                                                            {q.topic || 'Quiz'}
                                                        </div>
                                                        <div className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                                                            {q.correctAnswers || 0}/{q.totalQuestions || 0} correct • {q.totalQuestions || 0} questions
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                </motion.div>
                            ) : (
                                (!stats.recentQuizzes || stats.recentQuizzes.length === 0) && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
                                        <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                                            <Target size={42} className="mx-auto mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
                                        </motion.div>
                                        <h3 className="font-bold text-lg mb-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>No Quiz History Yet</h3>
                                        <p className="text-sm mb-6" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                                            Take your first quiz to start tracking your progress!
                                        </p>
                                        <Link to="/quiz" className="btn-primary no-underline">
                                            <Target size={16} /> Take a Quiz
                                        </Link>
                                    </motion.div>
                                )
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
