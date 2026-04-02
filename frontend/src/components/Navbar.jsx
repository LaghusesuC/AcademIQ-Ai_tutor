import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Bot, LogOut, User, Menu, X } from 'lucide-react';

const navLinks = [
    { to: '/chat', label: 'Chat' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/quiz', label: 'Quiz' },
    { to: '/code-analyzer', label: 'Code Analyzer' },
];

export default function Navbar() {
    const { theme, toggleTheme } = useTheme();
    const { user, logout, isAuthenticated } = useAuth();
    const location = useLocation();
    const [mobileOpen, setMobileOpen] = useState(false);

    const isLanding = location.pathname === '/';

    return (
        <>
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="fixed top-0 left-0 right-0 z-50"
                style={{
                    background: theme === 'dark' ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.85)',
                    backdropFilter: 'blur(20px)',
                    borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'
                }}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-2 no-underline">
                            <motion.div
                                whileHover={{ rotate: 10, scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center"
                                style={{ boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
                            >
                                <Bot size={20} color="white" />
                            </motion.div>
                            <span className="text-lg font-bold animated-gradient-text">AcademIQ</span>
                        </Link>

                        {/* Nav Links (Desktop) */}
                        <div className="hidden md:flex items-center gap-1 relative">
                            {navLinks.map(link => {
                                const isActive = location.pathname === link.to;
                                return (
                                    <Link
                                        key={link.to}
                                        to={link.to}
                                        className="relative px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 no-underline"
                                        style={{
                                            color: isActive
                                                ? '#818cf8'
                                                : theme === 'dark' ? '#94a3b8' : '#64748b',
                                        }}
                                    >
                                        {/* Animated active background pill */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-active-pill"
                                                className="absolute inset-0 rounded-lg"
                                                style={{
                                                    background: theme === 'dark' ? 'rgba(129,140,248,0.12)' : 'rgba(99,102,241,0.08)',
                                                }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                        <span className="relative z-10">{link.label}</span>

                                        {/* Animated bottom indicator */}
                                        {isActive && (
                                            <motion.div
                                                layoutId="nav-underline"
                                                className="absolute -bottom-1 left-1/2 w-4 h-0.5 rounded-full"
                                                style={{
                                                    background: 'linear-gradient(90deg, #6366f1, #06b6d4)',
                                                    transform: 'translateX(-50%)'
                                                }}
                                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                            />
                                        )}
                                    </Link>
                                );
                            })}
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-3">
                            <motion.button
                                whileTap={{ scale: 0.85, rotate: 180 }}
                                whileHover={{ scale: 1.1 }}
                                onClick={toggleTheme}
                                className="w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all"
                                style={{
                                    background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                    color: theme === 'dark' ? '#fbbf24' : '#6366f1'
                                }}
                            >
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={theme}
                                        initial={{ rotate: -90, opacity: 0 }}
                                        animate={{ rotate: 0, opacity: 1 }}
                                        exit={{ rotate: 90, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                                    </motion.div>
                                </AnimatePresence>
                            </motion.button>

                            {isAuthenticated ? (
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/profile"
                                        className="w-9 h-9 rounded-xl flex items-center justify-center no-underline"
                                        style={{
                                            background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                                            color: 'white',
                                            boxShadow: '0 3px 10px rgba(99,102,241,0.3)'
                                        }}
                                    >
                                        <User size={16} />
                                    </Link>
                                    <motion.button
                                        whileTap={{ scale: 0.9 }}
                                        whileHover={{ scale: 1.05 }}
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

                            {/* Mobile menu toggle */}
                            <motion.button
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setMobileOpen(!mobileOpen)}
                                className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center border-none cursor-pointer"
                                style={{
                                    background: theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                    color: theme === 'dark' ? '#94a3b8' : '#64748b'
                                }}
                            >
                                {mobileOpen ? <X size={18} /> : <Menu size={18} />}
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.nav>

            {/* Mobile menu overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="fixed top-16 left-0 right-0 z-40 md:hidden p-4"
                        style={{
                            background: theme === 'dark' ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)',
                            backdropFilter: 'blur(20px)',
                            borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)'
                        }}
                    >
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link, i) => (
                                <motion.div
                                    key={link.to}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                >
                                    <Link
                                        to={link.to}
                                        onClick={() => setMobileOpen(false)}
                                        className="block px-4 py-3 rounded-xl text-sm font-medium no-underline transition-all"
                                        style={{
                                            color: location.pathname === link.to ? '#818cf8' : theme === 'dark' ? '#94a3b8' : '#64748b',
                                            background: location.pathname === link.to
                                                ? theme === 'dark' ? 'rgba(129,140,248,0.1)' : 'rgba(99,102,241,0.06)'
                                                : 'transparent'
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
