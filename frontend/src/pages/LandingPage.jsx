import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { Bot, Brain, Code2, BookOpen, Sparkles, ArrowRight, Zap, Target, Trophy } from 'lucide-react';

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' } })
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
        desc: 'Generate MCQs, short answers, and coding quizzes on any topic with instant feedback.',
        color: '#22d3ee',
        gradient: 'linear-gradient(135deg, #06b6d4, #0ea5e9)'
    },
    {
        icon: Code2,
        title: 'Code Error Analyzer',
        desc: 'Paste your code, detect errors, get explanations, and see optimized solutions.',
        color: '#34d399',
        gradient: 'linear-gradient(135deg, #10b981, #059669)'
    }
];

const stats = [
    { icon: Zap, value: '10+', label: 'Subjects Covered' },
    { icon: BookOpen, value: 'AI', label: 'Powered Tutoring' },
    { icon: Trophy, value: '∞', label: 'Practice Quizzes' }
];

export default function LandingPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <div className="min-h-screen pt-16">
            {/* Hero */}
            <section className="relative overflow-hidden py-20 lg:py-32">
                {/* BG orbs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <div className="text-center max-w-4xl mx-auto">
                        <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-6">
                            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium"
                                style={{
                                    background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
                                    color: '#818cf8'
                                }}>
                                <Sparkles size={14} /> AI-Powered Academic Platform
                            </span>
                        </motion.div>

                        <motion.h1 initial="hidden" animate="visible" custom={1} variants={fadeUp}
                            className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight mb-6"
                            style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                            Your Smart{' '}
                            <span className="gradient-text">Academic</span>
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
                    <motion.div initial="hidden" animate="visible" custom={4} variants={fadeUp}
                        className="mt-16 grid grid-cols-3 gap-6 max-w-lg mx-auto">
                        {stats.map((s, i) => (
                            <div key={i} className="text-center">
                                <div className="w-12 h-12 mx-auto mb-2 rounded-xl flex items-center justify-center"
                                    style={{ background: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)' }}>
                                    <s.icon size={22} style={{ color: '#818cf8' }} />
                                </div>
                                <div className="text-2xl font-bold gradient-text">{s.value}</div>
                                <div className="text-xs mt-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>{s.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} custom={0} variants={fadeUp} className="text-center mb-14">
                        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                            Three Innovative <span className="gradient-text">Features</span>
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
                                viewport={{ once: true }}
                                custom={i + 1}
                                variants={fadeUp}
                                whileHover={{ y: -8, transition: { duration: 0.2 } }}
                                className="glass-card p-8 relative overflow-hidden group cursor-default"
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300" style={{ background: f.gradient }} />
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                                    style={{ background: `${f.color}18`, color: f.color }}>
                                    <f.icon size={26} />
                                </div>
                                <h3 className="text-xl font-bold mb-3" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>{f.title}</h3>
                                <p className="leading-relaxed" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{f.desc}</p>
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
                        <div className="absolute inset-0 opacity-5" style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)' }} />
                        <div className="relative">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-2xl gradient-bg flex items-center justify-center animate-float">
                                <Bot size={30} color="white" />
                            </div>
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
                <p>© 2025 AcademIQ — AI-Powered Academic Platform. Built with ❤️ for students.</p>
            </footer>
        </div>
    );
}
