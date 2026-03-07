import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { User, Mail, Calendar, BookOpen, Target, TrendingUp, LogOut, Brain } from 'lucide-react';

export default function ProfilePage() {
    const { theme } = useTheme();
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const isDark = theme === 'dark';
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }
        api.get('/auth/me')
            .then(res => setProfile(res.data))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [isAuthenticated, navigate]);

    if (loading) {
        return (
            <div className="min-h-screen pt-24 flex items-center justify-center">
                <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#818cf8', borderTopColor: 'transparent' }} />
            </div>
        );
    }

    const data = profile || user || {};

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 relative overflow-hidden">
                    {/* Banner */}
                    <div className="absolute inset-x-0 top-0 h-28" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', opacity: 0.15 }} />

                    <div className="relative text-center mb-8">
                        <div className="w-20 h-20 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: 'white', fontSize: '1.75rem', fontWeight: 700 }}>
                            {data.name ? data.name.charAt(0).toUpperCase() : <User size={32} />}
                        </div>
                        <h1 className="text-2xl font-bold" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{data.name || 'Student'}</h1>
                        <p className="text-sm flex items-center justify-center gap-1.5 mt-1" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                            <Mail size={14} /> {data.email}
                        </p>
                        <p className="text-xs flex items-center justify-center gap-1.5 mt-2" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                            <Calendar size={12} /> Joined {new Date(data.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-8">
                        {[
                            { icon: BookOpen, label: 'Questions', value: data.totalQuestionsAsked || 0, color: '#818cf8' },
                            { icon: Target, label: 'Quizzes', value: data.totalQuizzesTaken || 0, color: '#22d3ee' },
                            { icon: TrendingUp, label: 'Weak Topics', value: data.weakTopics?.length || 0, color: '#f59e0b' }
                        ].map((s, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                                className="text-center p-4 rounded-xl" style={{ background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)' }}>
                                <s.icon size={20} className="mx-auto mb-2" style={{ color: s.color }} />
                                <div className="text-xl font-bold" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{s.value}</div>
                                <div className="text-xs" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{s.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Weak Topics */}
                    {data.weakTopics && data.weakTopics.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>
                                <Brain size={16} style={{ color: '#818cf8' }} /> Topics to Improve
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {data.weakTopics.map((t, i) => (
                                    <span key={i} className="px-3 py-1 rounded-lg text-xs font-medium"
                                        style={{ background: 'rgba(245,158,11,0.1)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.2)' }}>
                                        {t}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Logout */}
                    <motion.button whileTap={{ scale: 0.98 }}
                        onClick={() => { logout(); navigate('/'); }}
                        className="w-full p-3 rounded-xl border-none cursor-pointer flex items-center justify-center gap-2 font-medium text-sm transition-all"
                        style={{
                            background: isDark ? 'rgba(248,113,113,0.08)' : 'rgba(248,113,113,0.05)',
                            color: '#f87171',
                            border: '1px solid rgba(248,113,113,0.15)'
                        }}>
                        <LogOut size={16} /> Sign Out
                    </motion.button>
                </motion.div>
            </div>
        </div>
    );
}
