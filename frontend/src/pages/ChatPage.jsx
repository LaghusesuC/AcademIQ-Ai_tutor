import { useState, useRef, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import {
    Send, Bot, User, Sparkles, Trash2, BookOpen,
    Plus, MessageSquare, Clock, ChevronLeft, ChevronRight, Search, X
} from 'lucide-react';

const suggestedQuestions = [
    'Explain Big O notation simply',
    'How does binary search work?',
    'Write a Python function for Fibonacci',
    'What is the difference between stack and queue?',
    'Explain OOP concepts with examples'
];

const WELCOME_MSG = {
    role: 'assistant',
    content: "👋 Hi! I'm **AcademIQ**, your AI academic tutor. I can help you with:\n\n- 📐 **Mathematics** — calculus, linear algebra, statistics\n- 💻 **Computer Science** — algorithms, data structures, OS\n- 🔧 **Programming** — Python, Java, C++, JavaScript\n- ⚙️ **Engineering** — circuits, mechanics, thermodynamics\n\nAsk me anything! I'll explain step-by-step. 🚀",
    timestamp: new Date().toISOString()
};

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
}

function getStoredSessions() {
    try {
        const data = localStorage.getItem('chatSessions');
        return data ? JSON.parse(data) : [];
    } catch { return []; }
}

function storeSessions(sessions) {
    localStorage.setItem('chatSessions', JSON.stringify(sessions));
}

function formatTime(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now - d;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
    return d.toLocaleDateString();
}

export default function ChatPage() {
    const { theme } = useTheme();
    const { isAuthenticated } = useAuth();
    const isDark = theme === 'dark';
    const [searchParams, setSearchParams] = useSearchParams();

    // Sessions state (localStorage-based for all users)
    const [sessions, setSessions] = useState(() => getStoredSessions());
    const [activeSessionId, setActiveSessionId] = useState(null);
    const [messages, setMessages] = useState([WELCOME_MSG]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const chatEndRef = useRef(null);
    const lastUserMsgRef = useRef(null);
    const textareaRef = useRef(null);
    const topicHandledRef = useRef(false);

    // Initialize: load the most recent session or create one
    useEffect(() => {
        const stored = getStoredSessions();
        if (stored.length > 0) {
            setSessions(stored);
            const latest = stored[0];
            setActiveSessionId(latest.id);
            setMessages(latest.messages);
        } else {
            createNewChat();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Handle ?topic= query param for "Start Learning" from dashboard
    useEffect(() => {
        if (topicHandledRef.current) return;
        const topic = searchParams.get('topic');
        if (topic && sessions.length > 0 && activeSessionId) {
            topicHandledRef.current = true;
            // Clear the query param
            setSearchParams({}, { replace: true });
            // Force create a new session for the learning topic
            const newSession = {
                id: generateId(),
                title: topic,
                messages: [WELCOME_MSG],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            setSessions(prev => [newSession, ...prev]);
            setActiveSessionId(newSession.id);
            setMessages([WELCOME_MSG]);
            // Auto-send a learning prompt after a short delay
            setTimeout(() => {
                const prompt = `Explain "${topic}" in detail with examples. Break it down step-by-step so I can understand the concept clearly.`;
                setInput('');
                const userMsg = { role: 'user', content: prompt, timestamp: new Date().toISOString() };
                setMessages(prev => {
                    const updated = [...prev, userMsg];
                    return updated;
                });
                // We need to trigger the API call manually here
                (async () => {
                    setLoading(true);
                    try {
                        const endpoint = isAuthenticated ? '/chat' : '/chat/public';
                        const res = await api.post(endpoint, { question: prompt, topic: 'General', history: [] });
                        const assistantMsg = { role: 'assistant', content: res.data.answer, timestamp: new Date().toISOString() };
                        setMessages(prev => {
                            const updated = [...prev, assistantMsg];
                            // Update session
                            setSessions(ss => ss.map(s => {
                                if (s.id === newSession.id) {
                                    return { ...s, messages: updated, title: topic, updatedAt: new Date().toISOString() };
                                }
                                return s;
                            }));
                            return updated;
                        });
                    } catch {
                        setMessages(prev => [...prev, { role: 'assistant', content: '❌ Sorry, I encountered an error. Please try again.', timestamp: new Date().toISOString() }]);
                    } finally {
                        setLoading(false);
                    }
                })();
                // Save learning topic for quiz recommendations
                try {
                    const stored = JSON.parse(localStorage.getItem('chatLearningTopics') || '[]');
                    const exists = stored.some(t => t.topic.toLowerCase() === topic.toLowerCase());
                    if (!exists) {
                        stored.unshift({ topic, timestamp: new Date().toISOString() });
                        if (stored.length > 30) stored.length = 30;
                        localStorage.setItem('chatLearningTopics', JSON.stringify(stored));
                    }
                } catch { /* ignore */ }
            }, 300);
        }
    }, [searchParams, sessions, activeSessionId, isAuthenticated, setSearchParams]);

    // Save sessions to localStorage whenever they change
    useEffect(() => {
        if (sessions.length > 0) {
            storeSessions(sessions);
        }
    }, [sessions]);

    // Auto-scroll: scroll to user's message when loading starts (so response reads top-to-bottom)
    // Scroll to bottom only when loading finishes
    useEffect(() => {
        if (loading) {
            // Scroll to show the user's latest message at the top
            lastUserMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            // After response arrives, scroll the user message to top so they read response top-to-bottom
            lastUserMsgRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [messages, loading]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
        }
    }, [input]);

    const updateSessionMessages = useCallback((sessionId, newMessages) => {
        setSessions(prev => prev.map(s => {
            if (s.id === sessionId) {
                // Auto-title from first user message
                const firstUser = newMessages.find(m => m.role === 'user');
                const title = firstUser
                    ? (firstUser.content.length > 45 ? firstUser.content.substring(0, 45) + '...' : firstUser.content)
                    : s.title;
                return { ...s, messages: newMessages, title, updatedAt: new Date().toISOString() };
            }
            return s;
        }));
    }, []);

    const isCurrentChatEmpty = useCallback(() => {
        // Check if active session only has the welcome message (no user messages)
        const activeSession = sessions.find(s => s.id === activeSessionId);
        if (!activeSession) return true;
        const userMessages = activeSession.messages.filter(m => m.role === 'user');
        return userMessages.length === 0;
    }, [sessions, activeSessionId]);

    const createNewChat = useCallback(() => {
        // Don't create a new chat if the current one is already empty
        if (isCurrentChatEmpty()) return;

        const newSession = {
            id: generateId(),
            title: 'New Chat',
            messages: [WELCOME_MSG],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);
        setMessages([WELCOME_MSG]);
        setInput('');
    }, [isCurrentChatEmpty]);

    const switchToSession = useCallback((session) => {
        setActiveSessionId(session.id);
        setMessages(session.messages);
        setInput('');
        // On mobile, close sidebar
        if (window.innerWidth < 768) setSidebarOpen(false);
    }, []);

    const deleteSession = useCallback((sessionId, e) => {
        e.stopPropagation();
        setSessions(prev => {
            const filtered = prev.filter(s => s.id !== sessionId);
            if (sessionId === activeSessionId) {
                if (filtered.length > 0) {
                    setActiveSessionId(filtered[0].id);
                    setMessages(filtered[0].messages);
                } else {
                    // Create a fresh chat
                    const fresh = {
                        id: generateId(),
                        title: 'New Chat',
                        messages: [WELCOME_MSG],
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    };
                    setActiveSessionId(fresh.id);
                    setMessages([WELCOME_MSG]);
                    return [fresh];
                }
            }
            return filtered;
        });
    }, [activeSessionId]);

    // Save a topic to localStorage for quiz recommendations
    const saveLearningTopic = useCallback((question) => {
        try {
            const stored = JSON.parse(localStorage.getItem('chatLearningTopics') || '[]');
            // Extract a concise topic from the question (first 60 chars, cleaned)
            const topic = question.replace(/^(explain|what is|how does|describe|tell me about)\s+/i, '').trim();
            if (!topic || topic.length < 3) return;
            // Avoid duplicates (case-insensitive)
            const exists = stored.some(t => t.topic.toLowerCase() === topic.toLowerCase());
            if (!exists) {
                stored.unshift({ topic, timestamp: new Date().toISOString() });
                if (stored.length > 30) stored.length = 30;
                localStorage.setItem('chatLearningTopics', JSON.stringify(stored));
            }
        } catch { /* ignore */ }
    }, []);

    const sendMessage = async (text) => {
        const question = text || input.trim();
        if (!question || loading) return;
        setInput('');

        const userMsg = { role: 'user', content: question, timestamp: new Date().toISOString() };
        const newMessages = [...messages, userMsg];
        setMessages(newMessages);
        updateSessionMessages(activeSessionId, newMessages);
        setLoading(true);

        // Save the topic for quiz recommendations
        saveLearningTopic(question);

        // Build conversation history for context (last 10 messages)
        const history = messages
            .filter(m => m.role === 'user' || m.role === 'assistant')
            .slice(-10)
            .map(m => ({ role: m.role, content: m.content }));

        try {
            const endpoint = isAuthenticated ? '/chat' : '/chat/public';
            const res = await api.post(endpoint, { question, topic: 'General', history });
            const assistantMsg = { role: 'assistant', content: res.data.answer, timestamp: new Date().toISOString() };
            const updatedMessages = [...newMessages, assistantMsg];
            setMessages(updatedMessages);
            updateSessionMessages(activeSessionId, updatedMessages);
        } catch (err) {
            const errorMsg = {
                role: 'assistant',
                content: '❌ Sorry, I encountered an error. Please try again or check that the backend server is running.',
                timestamp: new Date().toISOString()
            };
            const updatedMessages = [...newMessages, errorMsg];
            setMessages(updatedMessages);
            updateSessionMessages(activeSessionId, updatedMessages);
        } finally {
            setLoading(false);
        }
    };

    const filteredSessions = sessions.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen pt-16 flex" style={{ height: '100vh' }}>
            {/* Sidebar */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 300, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="flex-shrink-0 flex flex-col overflow-hidden"
                        style={{
                            background: isDark ? 'rgba(10,15,30,0.95)' : 'rgba(241,245,249,0.98)',
                            borderRight: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.08)'
                        }}
                    >
                        {/* Sidebar Header */}
                        <div className="p-4 flex-shrink-0">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={createNewChat}
                                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-none cursor-pointer text-sm font-semibold transition-all"
                                style={{
                                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                                    color: 'white',
                                    boxShadow: '0 4px 15px rgba(99,102,241,0.3)'
                                }}
                            >
                                <Plus size={16} /> New Chat
                            </motion.button>

                            {/* Search */}
                            <div className="relative mt-3">
                                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                                    style={{ color: isDark ? '#475569' : '#94a3b8' }} />
                                <input
                                    type="text"
                                    placeholder="Search chats..."
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full py-2 pl-8 pr-3 rounded-lg text-xs border-none outline-none"
                                    style={{
                                        background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                        color: isDark ? '#e2e8f0' : '#334155'
                                    }}
                                />
                                {searchQuery && (
                                    <button onClick={() => setSearchQuery('')}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 border-none bg-transparent cursor-pointer"
                                        style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                                        <X size={12} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Sessions List */}
                        <div className="flex-1 overflow-y-auto px-3 pb-4">
                            <p className="text-xs font-semibold uppercase tracking-wider px-2 mb-2"
                                style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                                Recent Chats
                            </p>
                            <AnimatePresence>
                                {filteredSessions.map(session => (
                                    <motion.div
                                        key={session.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                        onClick={() => switchToSession(session)}
                                        className="group flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer mb-1 transition-all"
                                        style={{
                                            background: session.id === activeSessionId
                                                ? isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)'
                                                : 'transparent',
                                            borderLeft: session.id === activeSessionId
                                                ? '3px solid #6366f1'
                                                : '3px solid transparent'
                                        }}
                                    >
                                        <MessageSquare size={14} style={{
                                            color: session.id === activeSessionId ? '#818cf8' : isDark ? '#475569' : '#94a3b8',
                                            flexShrink: 0
                                        }} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium truncate"
                                                style={{ color: session.id === activeSessionId ? '#818cf8' : isDark ? '#cbd5e1' : '#334155' }}>
                                                {session.title}
                                            </p>
                                            <p className="text-xs truncate mt-0.5"
                                                style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                                                <Clock size={10} className="inline mr-1" style={{ verticalAlign: 'middle' }} />
                                                {formatTime(session.updatedAt)}
                                            </p>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={(e) => deleteSession(session.id, e)}
                                            className="opacity-0 group-hover:opacity-100 border-none bg-transparent cursor-pointer p-1 rounded transition-opacity"
                                            style={{ color: '#f87171' }}
                                        >
                                            <Trash2 size={12} />
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {filteredSessions.length === 0 && (
                                <div className="text-center py-8">
                                    <MessageSquare size={24} className="mx-auto mb-2"
                                        style={{ color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                                    <p className="text-xs" style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                                        {searchQuery ? 'No chats found' : 'No chats yet'}
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 flex-shrink-0"
                    style={{
                        borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
                        background: isDark ? 'rgba(15,23,42,0.5)' : 'rgba(255,255,255,0.5)',
                        backdropFilter: 'blur(10px)'
                    }}>
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer"
                            style={{
                                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                color: isDark ? '#94a3b8' : '#64748b'
                            }}
                        >
                            {sidebarOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
                        </motion.button>
                        <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center animate-pulse-glow">
                            <Bot size={18} color="white" />
                        </div>
                        <div>
                            <h1 className="text-sm font-bold" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                AcademIQ Chat
                            </h1>
                            <div className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full" style={{
                                    background: '#34d399',
                                    boxShadow: '0 0 6px rgba(52,211,153,0.5)',
                                    animation: 'pulse-glow 2s ease-in-out infinite'
                                }} />
                                <p className="text-xs" style={{ color: '#34d399' }}>Online</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={createNewChat}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border-none cursor-pointer font-medium transition-all"
                            style={{
                                background: isDark ? 'rgba(99,102,241,0.1)' : 'rgba(99,102,241,0.08)',
                                color: '#818cf8'
                            }}
                        >
                            <Plus size={13} /> New
                        </motion.button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4"
                    style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                    <AnimatePresence>
                        {messages.map((msg, i) => {
                            // Find the index of the last user message
                            const lastUserIdx = messages.reduce((acc, m, idx) => m.role === 'user' ? idx : acc, -1);
                            return (
                            <motion.div
                                key={i}
                                ref={i === lastUserIdx ? lastUserMsgRef : null}
                                initial={{ opacity: 0, y: 16, scale: 0.97 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.35, ease: 'easeOut' }}
                                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                                    className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center mt-1"
                                    style={{
                                        background: msg.role === 'assistant'
                                            ? 'linear-gradient(135deg, #6366f1, #06b6d4)'
                                            : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)',
                                        color: msg.role === 'assistant' ? 'white' : isDark ? '#94a3b8' : '#64748b'
                                    }}>
                                    {msg.role === 'assistant' ? <Bot size={15} /> : <User size={15} />}
                                </motion.div>

                                <div className="max-w-[80%]">
                                    <div className="rounded-2xl px-4 py-3"
                                        style={{
                                            background: msg.role === 'user'
                                                ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                                                : isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.95)',
                                            color: msg.role === 'user' ? 'white' : isDark ? '#e2e8f0' : '#1e293b',
                                            border: msg.role === 'assistant' ? `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` : 'none',
                                            borderRadius: msg.role === 'user' ? '1.25rem 1.25rem 0.25rem 1.25rem' : '1.25rem 1.25rem 1.25rem 0.25rem',
                                            boxShadow: msg.role === 'user'
                                                ? '0 4px 15px rgba(99,102,241,0.2)'
                                                : '0 2px 8px rgba(0,0,0,0.04)'
                                        }}>
                                        <div className="chat-markdown text-sm leading-relaxed">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    </div>
                                    {msg.timestamp && (
                                        <p className={`text-xs mt-1 ${msg.role === 'user' ? 'text-right' : ''}`}
                                            style={{ color: isDark ? '#475569' : '#94a3b8' }}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    {loading && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex gap-3"
                        >
                            <div className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center"
                                style={{ background: 'linear-gradient(135deg, #6366f1, #06b6d4)', color: 'white' }}>
                                <Bot size={15} />
                            </div>
                            <div className="rounded-2xl px-5 py-4 flex items-center gap-2"
                                style={{
                                    background: isDark ? 'rgba(30,41,59,0.8)' : 'rgba(255,255,255,0.95)',
                                    border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                                    borderRadius: '1.25rem 1.25rem 1.25rem 0.25rem'
                                }}>
                                <Sparkles size={14} style={{ color: '#818cf8', animation: 'pulse-glow 1.5s ease-in-out infinite' }} />
                                <span className="text-xs font-medium" style={{ color: '#818cf8' }}>Thinking</span>
                                <div className="flex gap-1">
                                    {[0, 1, 2].map(j => (
                                        <div key={j} className="w-1.5 h-1.5 rounded-full" style={{
                                            background: '#818cf8',
                                            animation: `typing-dot 1.2s ease-in-out ${j * 0.2}s infinite`
                                        }} />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                    <div ref={chatEndRef} />
                </div>

                {/* Suggestions - only show when chat has just the welcome message */}
                {messages.length <= 1 && (
                    <div className="px-4 sm:px-6 lg:px-8 py-2" style={{ maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                        <p className="text-xs font-medium mb-2 flex items-center gap-1.5"
                            style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                            <BookOpen size={12} /> Suggested questions
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {suggestedQuestions.map((q, i) => (
                                <motion.button
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.08 }}
                                    whileHover={{ scale: 1.04, y: -2 }}
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
                <div className="px-4 sm:px-6 lg:px-8 py-4 flex-shrink-0"
                    style={{
                        maxWidth: '900px', margin: '0 auto', width: '100%',
                        borderTop: isDark ? '1px solid rgba(255,255,255,0.04)' : '1px solid rgba(0,0,0,0.04)'
                    }}>
                    <div className="flex gap-3 items-end rounded-2xl p-2"
                        style={{
                            background: isDark ? 'rgba(30,41,59,0.6)' : 'rgba(255,255,255,0.8)',
                            border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.06)'
                        }}>
                        <textarea
                            ref={textareaRef}
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                            placeholder="Ask anything academic..."
                            rows={1}
                            className="flex-1 resize-none border-none outline-none text-sm py-2 px-3"
                            style={{
                                background: 'transparent',
                                color: isDark ? '#e2e8f0' : '#1e293b',
                                minHeight: '40px',
                                maxHeight: '120px'
                            }}
                        />
                        <motion.button
                            whileTap={{ scale: 0.85, rotate: -10 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={() => sendMessage()}
                            disabled={loading || !input.trim()}
                            className="w-10 h-10 rounded-xl flex items-center justify-center border-none cursor-pointer transition-all flex-shrink-0"
                            style={{
                                background: input.trim() ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                                color: input.trim() ? 'white' : isDark ? '#475569' : '#94a3b8',
                                opacity: loading ? 0.5 : 1,
                                boxShadow: input.trim() ? '0 4px 12px rgba(99,102,241,0.3)' : 'none'
                            }}
                        >
                            <Send size={16} />
                        </motion.button>
                    </div>
                    <p className="text-center text-xs mt-2" style={{ color: isDark ? '#334155' : '#cbd5e1' }}>
                        AcademIQ can make mistakes. Verify important information.
                    </p>
                </div>
            </div>
        </div>
    );
}
