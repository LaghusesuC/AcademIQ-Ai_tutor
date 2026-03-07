import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Sun, Moon, Bot, LogOut, User } from 'lucide-react';

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();

    const isLanding = location.pathname === '/';

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="fixed top-0 left-0 right-0 z-50"
            style={{
                background: theme === 'dark' ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.8)',
                backdropFilter: 'blur(16px)',
                borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 no-underline">
                        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center">
                            <Bot size={20} color="white" />
                        </div>
                        <span className="text-lg font-bold gradient-text">AcademIQ</span>
                    </Link>

                    {/* Nav Links */}
                    <div className="hidden md:flex items-center gap-1">
                        {[
                            { to: '/chat', label: 'Chat' },
                            { to: '/dashboard', label: 'Dashboard' },
                            { to: '/quiz', label: 'Quiz' },
                            { to: '/code-analyzer', label: 'Code Analyzer' },
                        ].map(link => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 no-underline"
                                style={{
                                    color: location.pathname === link.to
                                        ? '#818cf8'
                                        : theme === 'dark' ? '#94a3b8' : '#64748b',
                                    background: location.pathname === link.to
                                        ? theme === 'dark' ? 'rgba(129,140,248,0.1)' : 'rgba(99,102,241,0.08)'
                                        : 'transparent'
                                }}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={toggleTheme}
                            className="w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all"
                            style={{
                                background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                color: theme === 'dark' ? '#fbbf24' : '#6366f1'
                            }}
                        >
                            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                        </motion.button>

                        {isAuthenticated ? (
                            <div className="flex items-center gap-2">
                                <Link
                                    to="/profile"
                                    className="w-9 h-9 rounded-xl flex items-center justify-center no-underline"
                                    style={{
                                        background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                                        color: 'white'
                                    }}
                                >
                                    <User size={16} />
                                </Link>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={logout}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer"
                                    style={{
                                        background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                        color: theme === 'dark' ? '#f87171' : '#ef4444'
                                    }}
                                >
                                    <LogOut size={16} />
                                </motion.button>
                            </div>
                        ) : (
                            !isLanding && (
                                <Link to="/login" className="btn-primary text-sm no-underline" style={{ padding: '0.5rem 1rem' }}>
                                    Sign In
                                </Link>
                            )
                        )}
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
