import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const { theme } = useTheme();
    const { login } = useAuth();
    const navigate = useNavigate();
    const isDark = theme === 'dark';
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/chat');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen pt-16 flex items-center justify-center px-4">
            {/* BG orbs */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
            </div>

            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
                className="glass-card p-8 sm:p-10 w-full max-w-md relative">
                <div className="text-center mb-8">
                    <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
                        <Bot size={28} color="white" />
                    </div>
                    <h1 className="text-2xl font-bold" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>Welcome Back</h1>
                    <p className="text-sm mt-1" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Sign in to continue learning</p>
                </div>

                {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                        className="p-3 rounded-xl mb-4 text-sm text-center" style={{ background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>
                        {error}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: isDark ? '#475569' : '#94a3b8' }} />
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                                className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder="you@example.com" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Password</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: isDark ? '#475569' : '#94a3b8' }} />
                            <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} required
                                className="input-field" style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }} placeholder="••••••••" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer p-0"
                                style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                        className="btn-primary w-full justify-center mt-6" style={{ padding: '0.85rem', opacity: loading ? 0.7 : 1 }}>
                        {loading ? 'Signing in...' : <>Sign In <ArrowRight size={16} /></>}
                    </motion.button>
                </form>

                <p className="text-center text-sm mt-6" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                    Don't have an account?{' '}
                    <Link to="/register" className="font-medium no-underline" style={{ color: '#818cf8' }}>Create one</Link>
                </p>
            </motion.div>
        </div>
    );
}
