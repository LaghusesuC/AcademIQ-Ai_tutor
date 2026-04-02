import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import ReactMarkdown from 'react-markdown';
import api from '../services/api';
import Editor from '@monaco-editor/react';
import {
    Code2, Play, AlertTriangle, CheckCircle, Lightbulb, Loader2,
    Copy, Check, ChevronDown, ChevronUp, Sparkles, Zap, FileCode,
    Terminal, RefreshCcw
} from 'lucide-react';

const languages = [
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'javascript', label: 'JavaScript', icon: '⚡' },
    { value: 'java', label: 'Java', icon: '☕' },
    { value: 'cpp', label: 'C++', icon: '⚙️' }
];

const sampleCode = {
    python: `def binary_search(arr, target):
    left = 0
    right = len(arr)  # Bug: should be len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
    javascript: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length; // Bug: should be arr.length - 1
  while (left <= right) {
    let mid = Math.floor((left + right) / 2);
    if (arr[mid] === target) return mid;
    else if (arr[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`,
    java: `public static int binarySearch(int[] arr, int target) {
    int left = 0;
    int right = arr.length; // Bug: should be arr.length - 1
    while (left <= right) {
        int mid = (left + right) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`,
    cpp: `int binarySearch(int arr[], int n, int target) {
    int left = 0;
    int right = n; // Bug: should be n - 1
    while (left <= right) {
        int mid = (left + right) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}`
};

const severityConfig = {
    syntax: { bg: '#f87171', bgLight: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', label: 'Syntax', icon: '🔴' },
    logic: { bg: '#fb923c', bgLight: 'rgba(251,146,60,0.08)', border: 'rgba(251,146,60,0.2)', label: 'Logic', icon: '🟠' },
    runtime: { bg: '#f43f5e', bgLight: 'rgba(244,63,94,0.08)', border: 'rgba(244,63,94,0.2)', label: 'Runtime', icon: '🟡' },
    style: { bg: '#a78bfa', bgLight: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.2)', label: 'Style', icon: '🟣' },
    error: { bg: '#f87171', bgLight: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.2)', label: 'Error', icon: '🔴' },
    info: { bg: '#38bdf8', bgLight: 'rgba(56,189,248,0.08)', border: 'rgba(56,189,248,0.2)', label: 'Info', icon: '🔵' }
};

export default function CodeAnalyzerPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(sampleCode.python);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [expandedErrors, setExpandedErrors] = useState({});
    const editorRef = useRef(null);
    const decorationsRef = useRef([]);

    // Restore state
    useEffect(() => {
        const saved = localStorage.getItem('codeAnalyzerState');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                if (parsed.language) setLanguage(parsed.language);
                if (parsed.code) setCode(parsed.code);
                if (parsed.analysis) setAnalysis(parsed.analysis);
            } catch (e) { console.error(e); }
        }
    }, []);

    // Save state
    useEffect(() => {
        localStorage.setItem('codeAnalyzerState', JSON.stringify({ language, code, analysis }));
    }, [language, code, analysis]);

    // Highlight error lines in Monaco
    useEffect(() => {
        if (editorRef.current && analysis && analysis.errors) {
            const editor = editorRef.current;
            const monaco = window.monaco;
            if (!monaco) return;
            decorationsRef.current = editor.deltaDecorations(decorationsRef.current, []);
            const decorations = analysis.errors
                .filter(err => err.line && err.line > 0)
                .map(err => ({
                    range: new monaco.Range(err.line, 1, err.line, 1),
                    options: {
                        isWholeLine: true,
                        className: 'error-line-highlight',
                        glyphMarginClassName: 'error-line-glyph',
                        overviewRuler: { color: '#f87171', position: 4 }
                    }
                }));
            decorationsRef.current = editor.deltaDecorations([], decorations);
        }
    }, [analysis]);

    const handleEditorMount = (editor) => { editorRef.current = editor; };

    const analyzeCode = async () => {
        if (!code.trim()) return;
        setLoading(true);
        setAnalysis(null);
        setExpandedErrors({});
        try {
            const res = await api.post('/code/analyze', { code, language });
            setAnalysis(res.data);
            const expanded = {};
            (res.data.errors || []).forEach((_, i) => { expanded[i] = true; });
            setExpandedErrors(expanded);
        } catch {
            setAnalysis({
                errors: [{
                    type: 'error', message: 'Analysis failed. Check backend connection.',
                    details: ['Could not connect to the backend server', 'Ensure the server is running on the correct port']
                }],
                suggestions: [], optimizedCode: code, explanation: 'Error during analysis.'
            });
        } finally {
            setLoading(false);
        }
    };

    const copyCode = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleError = (index) => {
        setExpandedErrors(prev => ({ ...prev, [index]: !prev[index] }));
    };

    const getSeverity = (type) => severityConfig[type] || severityConfig.error;
    const errorCount = analysis?.errors?.length || 0;
    const suggestionCount = analysis?.suggestions?.length || 0;

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl font-extrabold mb-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                                Code <span className="animated-gradient-text">Analyzer</span>
                            </h1>
                            <p className="text-lg" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                Paste your code to detect errors, see exact errored lines, and get fixes.
                            </p>
                        </div>
                        {analysis && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-3 self-start">
                                <span className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                                    style={{ background: errorCount > 0 ? 'rgba(248,113,113,0.1)' : 'rgba(52,211,153,0.1)', color: errorCount > 0 ? '#f87171' : '#34d399' }}>
                                    {errorCount > 0 ? <AlertTriangle size={12} /> : <CheckCircle size={12} />}
                                    {errorCount} {errorCount === 1 ? 'Error' : 'Errors'}
                                </span>
                                <span className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                                    style={{ background: 'rgba(56,189,248,0.1)', color: '#38bdf8' }}>
                                    <Lightbulb size={12} /> {suggestionCount} Tips
                                </span>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* ===== Editor Panel ===== */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <div className="glass-card overflow-hidden">
                            {/* Language tabs */}
                            <div className="flex items-center justify-between p-3 sm:p-4"
                                style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                                <div className="flex items-center gap-2">
                                    <FileCode size={16} style={{ color: '#818cf8' }} />
                                    <span className="font-semibold text-sm hidden sm:inline" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>Editor</span>
                                </div>
                                <div className="flex gap-1.5">
                                    {languages.map(l => (
                                        <motion.button
                                            key={l.value}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => { setLanguage(l.value); setCode(sampleCode[l.value]); setAnalysis(null); }}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border-none cursor-pointer transition-all"
                                            style={{
                                                background: language === l.value ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                                                color: language === l.value ? 'white' : isDark ? '#94a3b8' : '#64748b',
                                                boxShadow: language === l.value ? '0 2px 10px rgba(99,102,241,0.25)' : 'none'
                                            }}>
                                            <span className="text-xs">{l.icon}</span> {l.label}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* Monaco Editor */}
                            <div style={{ height: '420px' }}>
                                <Editor
                                    height="100%"
                                    language={language === 'cpp' ? 'cpp' : language}
                                    value={code}
                                    onChange={v => setCode(v || '')}
                                    theme={isDark ? 'vs-dark' : 'light'}
                                    onMount={handleEditorMount}
                                    options={{
                                        fontSize: 14,
                                        minimap: { enabled: false },
                                        padding: { top: 16 },
                                        scrollBeyondLastLine: false,
                                        wordWrap: 'on',
                                        lineNumbers: 'on',
                                        renderWhitespace: 'selection',
                                        glyphMargin: true,
                                        fontFamily: "'Fira Code', 'Consolas', monospace"
                                    }}
                                />
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center gap-3 p-3 sm:p-4"
                                style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={analyzeCode}
                                    disabled={loading || !code.trim()}
                                    className="btn-primary flex-1 justify-center"
                                    style={{ opacity: loading ? 0.7 : 1 }}>
                                    {loading
                                        ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</>
                                        : <><Zap size={16} /> Analyze Code</>}
                                </motion.button>
                                {analysis && (
                                    <motion.button
                                        initial={{ scale: 0 }} animate={{ scale: 1 }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => { setAnalysis(null); }}
                                        className="w-10 h-10 rounded-xl flex items-center justify-center border-none cursor-pointer"
                                        style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: isDark ? '#94a3b8' : '#64748b' }}>
                                        <RefreshCcw size={16} />
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </motion.div>

                    {/* ===== Results Panel ===== */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <AnimatePresence mode="wait">
                            {/* Empty state */}
                            {!analysis && !loading && (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="glass-card p-12 text-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '420px' }}>
                                    <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
                                        <Terminal size={52} className="mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />
                                    </motion.div>
                                    <h3 className="font-bold text-lg mb-2" style={{ color: isDark ? '#475569' : '#94a3b8' }}>Ready to Analyze</h3>
                                    <p className="text-sm max-w-xs mx-auto" style={{ color: isDark ? '#334155' : '#cbd5e1' }}>
                                        Paste your code in the editor and click <strong>Analyze Code</strong> to get AI-powered feedback with error highlighting.
                                    </p>
                                </motion.div>
                            )}

                            {/* Loading state */}
                            {loading && (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="glass-card p-12 text-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '420px' }}>
                                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}>
                                        <Sparkles size={44} className="mb-4" style={{ color: '#818cf8' }} />
                                    </motion.div>
                                    <p className="font-semibold" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>Analyzing your code...</p>
                                    <p className="text-sm mt-1" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                                        Scanning for errors, optimizations, and improvements
                                    </p>
                                    <div className="flex gap-1.5 mt-4">
                                        {[0, 1, 2].map(j => (
                                            <div key={j} className="w-2 h-2 rounded-full" style={{
                                                background: '#818cf8',
                                                animation: `typing-dot 1.2s ease-in-out ${j * 0.25}s infinite`
                                            }} />
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Results */}
                            {analysis && !loading && (
                                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 160px)' }}>

                                    {/* Errors */}
                                    {analysis.errors && analysis.errors.length > 0 && (
                                        <div className="glass-card p-5">
                                            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#f87171' }}>
                                                <AlertTriangle size={16} /> Errors Found ({analysis.errors.length})
                                            </h3>
                                            <div className="space-y-3">
                                                {analysis.errors.map((err, i) => {
                                                    const severity = getSeverity(err.type);
                                                    return (
                                                        <motion.div
                                                            key={i}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: i * 0.08 }}
                                                            className="rounded-xl overflow-hidden"
                                                            style={{ border: `1px solid ${severity.border}` }}>
                                                            {/* Header */}
                                                            <div className="flex items-center justify-between p-3 cursor-pointer"
                                                                onClick={() => toggleError(i)}
                                                                style={{ background: severity.bgLight }}>
                                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                                    {err.line && (
                                                                        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold flex-shrink-0"
                                                                            style={{ background: `${severity.bg}18`, color: severity.bg }}>
                                                                            L{err.line}
                                                                        </span>
                                                                    )}
                                                                    <span className="px-2 py-0.5 rounded text-xs uppercase font-bold flex-shrink-0"
                                                                        style={{ background: `${severity.bg}18`, color: severity.bg }}>
                                                                        {severity.icon} {err.type}
                                                                    </span>
                                                                    <span className="text-sm font-medium truncate" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>
                                                                        {err.message}
                                                                    </span>
                                                                </div>
                                                                {expandedErrors[i] ? <ChevronUp size={14} style={{ color: severity.bg }} /> : <ChevronDown size={14} style={{ color: severity.bg }} />}
                                                            </div>

                                                            {/* Details */}
                                                            <AnimatePresence>
                                                                {expandedErrors[i] && (
                                                                    <motion.div
                                                                        initial={{ height: 0, opacity: 0 }}
                                                                        animate={{ height: 'auto', opacity: 1 }}
                                                                        exit={{ height: 0, opacity: 0 }}
                                                                        transition={{ duration: 0.2 }}
                                                                        className="overflow-hidden"
                                                                    >
                                                                        <div className="p-3 space-y-3" style={{ borderTop: `1px solid ${severity.border}` }}>
                                                                            {/* Errored line */}
                                                                            {err.errorLine && (
                                                                                <div>
                                                                                    <p className="text-xs font-semibold mb-1.5 uppercase tracking-wide flex items-center gap-1"
                                                                                        style={{ color: severity.bg }}>
                                                                                        ✗ Errored Line:
                                                                                    </p>
                                                                                    <pre className="text-xs p-3 rounded-lg overflow-x-auto font-mono"
                                                                                        style={{
                                                                                            background: isDark ? 'rgba(248,113,113,0.06)' : 'rgba(248,113,113,0.04)',
                                                                                            color: '#f87171',
                                                                                            border: '1px solid rgba(248,113,113,0.12)',
                                                                                            textDecoration: 'line-through',
                                                                                            textDecorationColor: 'rgba(248,113,113,0.5)'
                                                                                        }}>
                                                                                        {err.errorLine}
                                                                                    </pre>
                                                                                </div>
                                                                            )}

                                                                            {/* Fix */}
                                                                            {err.fix && (
                                                                                <div>
                                                                                    <p className="text-xs font-semibold mb-1.5 uppercase tracking-wide flex items-center gap-1"
                                                                                        style={{ color: '#34d399' }}>
                                                                                        ✓ Corrected Line:
                                                                                    </p>
                                                                                    <pre className="text-xs p-3 rounded-lg overflow-x-auto font-mono"
                                                                                        style={{
                                                                                            background: isDark ? 'rgba(52,211,153,0.06)' : 'rgba(52,211,153,0.04)',
                                                                                            color: '#34d399',
                                                                                            border: '1px solid rgba(52,211,153,0.12)'
                                                                                        }}>
                                                                                        {err.fix}
                                                                                    </pre>
                                                                                </div>
                                                                            )}

                                                                            {/* Bullet explanations */}
                                                                            {err.details && err.details.length > 0 && (
                                                                                <div>
                                                                                    <p className="text-xs font-semibold mb-1.5 uppercase tracking-wide"
                                                                                        style={{ color: '#818cf8' }}>
                                                                                        Explanation:
                                                                                    </p>
                                                                                    <ul className="space-y-1.5">
                                                                                        {err.details.map((detail, di) => (
                                                                                            <motion.li
                                                                                                key={di}
                                                                                                initial={{ opacity: 0, x: -5 }}
                                                                                                animate={{ opacity: 1, x: 0 }}
                                                                                                transition={{ delay: di * 0.08 }}
                                                                                                className="text-xs flex items-start gap-2"
                                                                                                style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                                                                                <span className="mt-0.5 flex-shrink-0" style={{ color: '#818cf8' }}>•</span>
                                                                                                <span>{detail}</span>
                                                                                            </motion.li>
                                                                                        ))}
                                                                                    </ul>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </motion.div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* Summary */}
                                    {analysis.explanation && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                            className="glass-card p-5">
                                            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#818cf8' }}>
                                                <Lightbulb size={16} /> Analysis Summary
                                            </h3>
                                            <div className="text-sm leading-relaxed chat-markdown" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                                <ReactMarkdown>{analysis.explanation}</ReactMarkdown>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Suggestions */}
                                    {analysis.suggestions && analysis.suggestions.length > 0 && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                            className="glass-card p-5">
                                            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#22d3ee' }}>
                                                <CheckCircle size={16} /> Suggestions
                                            </h3>
                                            <ul className="space-y-2">
                                                {analysis.suggestions.map((s, i) => (
                                                    <motion.li key={i}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: i * 0.08 }}
                                                        className="text-sm flex items-start gap-2"
                                                        style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                                        <span className="mt-0.5 flex-shrink-0" style={{ color: '#22d3ee' }}>•</span> {s}
                                                    </motion.li>
                                                ))}
                                            </ul>
                                        </motion.div>
                                    )}

                                    {/* Optimized Code */}
                                    {analysis.optimizedCode && (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                                            className="glass-card overflow-hidden">
                                            <div className="flex items-center justify-between p-4"
                                                style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                                                <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: '#34d399' }}>
                                                    <CheckCircle size={16} /> Optimized Code
                                                </h3>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => copyCode(analysis.optimizedCode)}
                                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border-none cursor-pointer font-medium"
                                                    style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: isDark ? '#94a3b8' : '#64748b' }}>
                                                    {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                                </motion.button>
                                            </div>
                                            <pre className="text-sm p-5 overflow-x-auto" style={{
                                                background: '#0f172a', color: '#e2e8f0',
                                                fontFamily: "'Fira Code', 'Consolas', monospace",
                                                fontSize: '0.8rem', lineHeight: 1.7, margin: 0
                                            }}>
                                                {analysis.optimizedCode}
                                            </pre>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>

            <style>{`
                .error-line-highlight {
                    background: rgba(248, 113, 113, 0.12) !important;
                    border-left: 3px solid #f87171 !important;
                }
                .error-line-glyph {
                    background: #f87171;
                    border-radius: 50%;
                    width: 8px !important;
                    height: 8px !important;
                    margin-left: 4px;
                    margin-top: 6px;
                }
            `}</style>
        </div>
    );
}
