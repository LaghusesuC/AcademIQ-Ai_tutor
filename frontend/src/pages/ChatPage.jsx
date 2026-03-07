import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import { Send, Bot, User, Sparkles, Trash2, BookOpen } from 'lucide-react';

const suggestedQuestions = [
    'Explain Big O notation simply',
    'How does binary search work?',
    'Write a Python function for Fibonacci',
    'What is the difference between stack and queue?',
    'Explain OOP concepts with examples'
];

export default function ChatPage() {
    const { theme } = useTheme();
    const { isAuthenticated } = useAuth();
    const isDark = theme === 'dark';
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: "👋 Hi! I'm **AcademIQ**, your AI academic tutor. I can help you with:\n\n- 📐 **Mathematics** — calculus, linear algebra, statistics\n- 💻 **Computer Science** — algorithms, data structures, OS\n- 🔧 **Programming** — Python, Java, C++, JavaScript\n- ⚙️ **Engineering** — circuits, mechanics, thermodynamics\n\nAsk me anything! I'll explain step-by-step. 🚀"
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text) => {
        const question = text || input.trim();
        if (!question || loading) return;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: question }]);
        setLoading(true);

        try {
            const endpoint = isAuthenticated ? '/chat' : '/chat/public';
            const res = await api.post(endpoint, { question, topic: 'General' });
            setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please try again or check that the backend server is running.'
            }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = () => {
        setMessages([{
            role: 'assistant',
            content: "🔄 Chat cleared. Ask me a new question!"
        }]);
    };

    return (
        <div className="min-h-screen pt-16 flex flex-col" style={{ maxHeight: '100vh' }}>
            {/* Header */}
            <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between"
                style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center animate-pulse-glow">
                        <Bot size={22} color="white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>AcademIQ Chat</h1>
                        <p className="text-xs" style={{ color: '#818cf8' }}>● Online — Ready to help</p>
                    </div>
                </div>
                <button onClick={clearChat} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border-none cursor-pointer transition-all"
                    style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: isDark ? '#94a3b8' : '#64748b' }}>
                    <Trash2 size={14} /> Clear
                </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                <AnimatePresence>
                    {messages.map((msg, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 16, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-1"
                                style={{
                                    background: msg.role === 'assistant'
                                        ? 'linear-gradient(135deg, #6366f1, #06b6d4)'
                                        : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                    color: msg.role === 'assistant' ? 'white' : isDark ? '#94a3b8' : '#64748b'
                                }}>
                                {msg.role === 'assistant' ? <Bot size={16} /> : <User size={16} />}
                            </div>

                            <div className="max-w-[80%] rounded-2xl px-4 py-3"
                                style={{
                                    background: msg.role === 'user'
                                        ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                                        : isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.9)',
                                    color: msg.role === 'user' ? 'white' : isDark ? '#e2e8f0' : '#1e293b',
                                    border: msg.role === 'assistant' ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` : 'none',
                                    borderRadius: msg.role === 'user' ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem'
                                }}>
                                <div className="chat-markdown text-sm leading-relaxed">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {loading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: 'white' }}>
                            <Bot size={16} />
                        </div>
                        <div className="rounded-2xl px-5 py-4 flex gap-1.5"
                            style={{
                                background: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.9)',
                                border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                borderRadius: '1.25rem 1.25rem 1.25rem 0.25rem'
                            }}>
                            {[0, 1, 2].map(j => (
                                <div key={j} className="w-2 h-2 rounded-full" style={{
                                    background: '#818cf8',
                                    animation: `typing-dot 1.2s ease-in-out ${j * 0.2}s infinite`
                                }} />
                            ))}
                        </div>
                    </motion.div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Suggestions */}
            {messages.length <= 1 && (
                <div className="px-4 sm:px-6 lg:px-8 py-3" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                    <p className="text-xs font-medium mb-2 flex items-center gap-1.5" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                        <BookOpen size={12} /> Suggested questions
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {suggestedQuestions.map((q, i) => (
                            <motion.button
                                key={i}
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() => sendMessage(q)}
                                className="px-3 py-1.5 rounded-lg text-xs border-none cursor-pointer transition-all"
                                style={{
                                    background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.06)',
                                    color: '#818cf8',
                                    border: `1px solid ${isDark ? 'rgba(99,102,241,0.2)' : 'rgba(99,102,241,0.15)'}`
                                }}
                            >
                                {q}
                            </motion.button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="px-4 sm:px-6 lg:px-8 py-4" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                <div className="flex gap-3 items-end">
                    <div className="flex-1 relative">
                        <textarea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                            placeholder="Ask anything academic..."
                            rows={1}
                            className="input-field resize-none pr-4"
                            style={{ minHeight: '48px', maxHeight: '120px', paddingRight: '1rem' }}
                        />
                    </div>
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => sendMessage()}
                        disabled={loading || !input.trim()}
                        className="w-12 h-12 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all flex-shrink-0"
                        style={{
                            background: input.trim() ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                            color: input.trim() ? 'white' : isDark ? '#475569' : '#94a3b8',
                            opacity: loading ? 0.5 : 1
                        }}
                    >
                        <Send size={18} />
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
