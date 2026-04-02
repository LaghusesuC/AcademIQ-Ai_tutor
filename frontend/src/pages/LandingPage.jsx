import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Bot, Brain, Code2, BookOpen, Sparkles, ArrowRight, Zap, Target, Trophy, Star } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' } })
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const staggerItem = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
};

const features = [
    {
        icon: Brain,
        title: 'Personalized Learning Path',
        desc: 'AI tracks your learning patterns and recommends topics to strengthen your weak areas.',
        color: '#818cf8',
        gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)'
    },
    {
        icon: Target,
        title: 'Auto Quiz Generator',
        desc: 'Generate AI-powered MCQ quizzes on any topic with instant feedback and explanations.',
        color: '#22d3ee',
        gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)'
    },
    {
        icon: Code2,
        title: 'Code Error Analyzer',
        desc: 'Paste your code, detect errors with exact line numbers, and see optimized solutions.',
        color: '#34d399',
        gradient: 'linear-gradient(135deg, #10b981, #059669)'
    }
];

const stats = [
    { icon: Zap, value: '10+', label: 'Subjects Covered' },
    { icon: BookOpen, value: 'AI', label: 'Powered Tutoring' },
    { icon: Trophy, value: '∞', label: 'Practice Quizzes' }
];

// Floating particle component
function FloatingParticle({ delay, x, y, size, color }) {
    return (
        <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
                width: size, height: size,
                background: color,
                left: x, top: y,
                filter: 'blur(1px)'
            }}
            animate={{
                y: [-20, 20, -20],
                x: [-10, 10, -10],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.2, 1]
            }}
            transition={{ duration: 4 + delay, repeat: Infinity, delay, ease: 'easeInOut' }}
        />
    );
}

export default function LandingPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    const particles = [
        { x: '10%', y: '20%', size: 6, color: 'rgba(99,102,241,0.4)', delay: 0 },
        { x: '80%', y: '15%', size: 4, color: 'rgba(6,182,212,0.4)', delay: 1 },
        { x: '60%', y: '70%', size: 8, color: 'rgba(99,102,241,0.3)', delay: 2 },
        { x: '25%', y: '80%', size: 5, color: 'rgba(34,211,238,0.3)', delay: 0.5 },
        { x: '90%', y: '50%', size: 3, color: 'rgba(139,92,246,0.4)', delay: 1.5 },
        { x: '45%', y: '30%', size: 4, color: 'rgba(99,102,241,0.3)', delay: 2.5 },
        { x: '15%', y: '55%', size: 6, color: 'rgba(6,182,212,0.3)', delay: 3 },
    ];

    return (
        <div className="min-h-screen pt-16">
            {/* Hero */}
            <section className="relative overflow-hidden py-20 lg:py-32">
                {/* BG orbs + particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
                        className="absolute -top-40 -right-40 w-96 h-96 rounded-full"
                        style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }}
                    />
                    <motion.div
                        animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.2, 0.1] }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
                        className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full"
                        style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }}
                    />
                    {particles.map((p, i) => (
                        <FloatingParticle key={i} {...p} />
                    ))}
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-6">
                            <motion.span
                                animate={{ backgroundPosition: ['0% center', '200% center'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
                                style={{
                                    background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
                                    color: '#818cf8'
                                }}>
                                <Sparkles size={14} className="animate-bounce-soft" /> AI-Powered Academic Platform
                            </motion.span>
                        </motion.div>

                        <motion.h1 initial="hidden" animate="visible" custom={1} variants={fadeUp}
                            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-6"
                            style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                            Your Smart{' '}
                            <span className="animated-gradient-text">Academic</span>
                            <br />
                            Study Companion
                        </motion.h1>

                        <motion.p initial="hidden" animate="visible" custom={2} variants={fadeUp}
                            className="text-lg sm:text-xl mb-10 max-w-2xl mx-auto"
                            style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                            Learn, practice, and debug with an AI that understands your learning style. Get personalized tutoring, auto-generated quizzes, and instant code analysis.
                        </motion.p>

                        <motion.div initial="hidden" animate="visible" custom={3} variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/chat" className="btn-primary text-base no-underline" style={{ padding: '0.85rem 2rem' }}>
                                Start Learning <ArrowRight size={18} />
                            </Link>
                            <Link to="/login" className="btn-secondary text-base no-underline" style={{ padding: '0.85rem 2rem' }}>
                                Create Account
                            </Link>
                        </motion.div>
                    </div>

                    {/* Stats */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={staggerContainer}
                        className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto"
                    >
                        {stats.map((s, i) => (
                            <motion.div key={i} variants={staggerItem} className="text-center">
                                <motion.div
                                    whileHover={{ scale: 1.1, rotate: 5 }}
                                    className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center"
                                    style={{ background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)' }}>
                                    <s.icon size={22} style={{ color: '#818cf8' }} />
                                </motion.div>
                                <div className="text-2xl font-bold gradient-text">{s.value}</div>
                                <div className="text-xs mt-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{s.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} custom={0} variants={fadeUp} className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                            Three Innovative <span className="animated-gradient-text">Features</span>
                        </h2>
                        <p className="text-lg max-w-xl mx-auto" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                            Designed to supercharge your academic learning journey
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-30px' }}
                                custom={i + 1}
                                variants={fadeUp}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                className="glass-card p-8 relative overflow-hidden group cursor-default gradient-border"
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500" style={{ background: f.gradient }} />
                                <motion.div
                                    whileHover={{ rotate: 10, scale: 1.1 }}
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                                    style={{ background: `${f.color}18`, color: f.color }}>
                                    <f.icon size={26} />
                                </motion.div>
                                <h3 className="text-xl font-bold mb-3" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{f.title}</h3>
                                <p className="leading-relaxed" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className="py-20">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                            How It <span className="animated-gradient-text">Works</span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { step: '01', title: 'Ask a Question', desc: 'Type any academic question — from algorithms to calculus.', icon: '💬' },
                            { step: '02', title: 'Get AI Explanation', desc: 'Receive step-by-step explanations with examples and code.', icon: '🧠' },
                            { step: '03', title: 'Practice & Master', desc: 'Take quizzes, analyze code, and track your progress.', icon: '🎯' }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                custom={i + 1}
                                variants={fadeUp}
                                className="text-center"
                            >
                                <motion.div
                                    animate={{ y: [0, -5, 0] }}
                                    transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                                    className="text-4xl mb-4"
                                >
                                    {item.icon}
                                </motion.div>
                                <div className="text-xs font-bold uppercase tracking-widest mb-2 gradient-text">{item.step}</div>
                                <h3 className="text-lg font-bold mb-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{item.title}</h3>
                                <p className="text-sm" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp}
                        className="glass-card p-12 text-center relative overflow-hidden">
                        <motion.div
                            animate={{ opacity: [0.03, 0.08, 0.03] }}
                            transition={{ duration: 4, repeat: Infinity }}
                            className="absolute inset-0"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }}
                        />
                        <div className="relative">
                            <motion.div
                                animate={{ y: [0, -8, 0], rotate: [0, 5, 0, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                                className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-bg flex items-center justify-center"
                                style={{ boxShadow: '0 8px 30px rgba(99,102,241,0.4)' }}
                            >
                                <Bot size={30} color="white" />
                            </motion.div>
                            <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                Ready to Learn Smarter?
                            </h2>
                            <p className="text-lg mb-8 max-w-lg mx-auto" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                Join thousands of students using AI-powered tutoring to ace their exams.
                            </p>
                            <Link to="/chat" className="btn-primary text-base no-underline" style={{ padding: '0.85rem 2.5rem' }}>
                                Get Started Free <ArrowRight size={18} />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center text-sm" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                <motion.p
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                >
                    © 2025 AcademIQ — AI-Powered Academic Platform. Built with ❤️ for students.
                </motion.p>
            </footer>
        </div>
    );
}
