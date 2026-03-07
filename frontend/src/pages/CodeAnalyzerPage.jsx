import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import Editor from '@monaco-editor/react';
import { Code2, Play, AlertTriangle, CheckCircle, Lightbulb, Loader2, Copy, Check } from 'lucide-react';

const languages = [
    { value: 'python', label: 'Python' },
    { value: 'javascript', label: 'JavaScript' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' }
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

export default function CodeAnalyzerPage() {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState(sampleCode.python);
    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const analyzeCode = async () => {
        if (!code.trim()) return;
        setLoading(true);
        setAnalysis(null);
        try {
            const res = await api.post('/code/analyze', { code, language });
            setAnalysis(res.data);
        } catch {
            setAnalysis({ errors: [{ type: 'error', message: 'Analysis failed. Check backend connection.' }], suggestions: [], optimizedCode: code, explanation: 'Error during analysis.' });
        } finally {
            setLoading(false);
        }
    };

    const copyCode = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                    <h1 className="text-3xl font-bold mb-2" style={{ color: isDark ? '#f1f5f9' : '#0f172a' }}>
                        Code <span className="gradient-text">Analyzer</span>
                    </h1>
                    <p style={{ color: isDark ? '#94a3b8' : '#64748b' }}>Paste your code to detect errors, get explanations, and see optimized solutions.</p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Editor Panel */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                        <div className="glass-card overflow-hidden">
                            {/* Language selector */}
                            <div className="flex items-center justify-between p-4"
                                style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                                <div className="flex items-center gap-2">
                                    <Code2 size={18} style={{ color: '#818cf8' }} />
                                    <span className="font-medium text-sm" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>Code Editor</span>
                                </div>
                                <div className="flex gap-2">
                                    {languages.map(l => (
                                        <button key={l.value} onClick={() => { setLanguage(l.value); setCode(sampleCode[l.value]); setAnalysis(null); }}
                                            className="px-3 py-1 rounded-lg text-xs border-none cursor-pointer transition-all"
                                            style={{
                                                background: language === l.value ? 'linear-gradient(135deg, #6366f1, #4f46e5)' : isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                                                color: language === l.value ? 'white' : isDark ? '#94a3b8' : '#64748b'
                                            }}>
                                            {l.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Monaco Editor */}
                            <div style={{ height: '400px' }}>
                                <Editor
                                    height="100%"
                                    language={language === 'cpp' ? 'cpp' : language}
                                    value={code}
                                    onChange={v => setCode(v || '')}
                                    theme={isDark ? 'vs-dark' : 'light'}
                                    options={{
                                        fontSize: 14,
                                        minimap: { enabled: false },
                                        padding: { top: 16 },
                                        scrollBeyondLastLine: false,
                                        wordWrap: 'on',
                                        lineNumbers: 'on',
                                        renderWhitespace: 'selection'
                                    }}
                                />
                            </div>

                            {/* Analyze button */}
                            <div className="p-4" style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)' }}>
                                <button onClick={analyzeCode} disabled={loading || !code.trim()} className="btn-primary w-full justify-center"
                                    style={{ opacity: loading ? 0.7 : 1 }}>
                                    {loading ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Play size={16} /> Analyze Code</>}
                                </button>
                            </div>
                        </div>
                    </motion.div>

                    {/* Results Panel */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                        <AnimatePresence mode="wait">
                            {!analysis && !loading && (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="glass-card p-12 text-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Code2 size={48} className="mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)' }} />
                                    <p className="font-medium" style={{ color: isDark ? '#64748b' : '#94a3b8' }}>
                                        Paste your code and click <strong>Analyze</strong> to get AI-powered feedback
                                    </p>
                                </motion.div>
                            )}

                            {loading && (
                                <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="glass-card p-12 text-center" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <Loader2 size={40} className="animate-spin mb-4" style={{ color: '#818cf8' }} />
                                    <p className="font-medium" style={{ color: isDark ? '#e2e8f0' : '#334155' }}>Analyzing your code...</p>
                                </motion.div>
                            )}

                            {analysis && !loading && (
                                <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 180px)' }}>
                                    {/* Errors */}
                                    {analysis.errors && analysis.errors.length > 0 && (
                                        <div className="glass-card p-5">
                                            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#f87171' }}>
                                                <AlertTriangle size={16} /> Errors Found ({analysis.errors.length})
                                            </h3>
                                            <div className="space-y-2">
                                                {analysis.errors.map((err, i) => (
                                                    <div key={i} className="p-3 rounded-xl text-sm"
                                                        style={{ background: isDark ? 'rgba(248,113,113,0.06)' : 'rgba(248,113,113,0.04)', border: `1px solid ${isDark ? 'rgba(248,113,113,0.15)' : 'rgba(248,113,113,0.1)'}` }}>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {err.line && <span className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>Line {err.line}</span>}
                                                            <span className="px-1.5 py-0.5 rounded text-xs" style={{ background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>{err.type}</span>
                                                        </div>
                                                        <p style={{ color: isDark ? '#e2e8f0' : '#334155' }}>{err.message}</p>
                                                        {err.fix && <p className="mt-1" style={{ color: '#34d399' }}>✅ Fix: {err.fix}</p>}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Explanation */}
                                    {analysis.explanation && (
                                        <div className="glass-card p-5">
                                            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#818cf8' }}>
                                                <Lightbulb size={16} /> Analysis
                                            </h3>
                                            <p className="text-sm leading-relaxed" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>{analysis.explanation}</p>
                                        </div>
                                    )}

                                    {/* Suggestions */}
                                    {analysis.suggestions && analysis.suggestions.length > 0 && (
                                        <div className="glass-card p-5">
                                            <h3 className="font-bold text-sm mb-3 flex items-center gap-2" style={{ color: '#22d3ee' }}>
                                                <CheckCircle size={16} /> Suggestions
                                            </h3>
                                            <ul className="space-y-1">
                                                {analysis.suggestions.map((s, i) => (
                                                    <li key={i} className="text-sm flex items-start gap-2" style={{ color: isDark ? '#94a3b8' : '#64748b' }}>
                                                        <span style={{ color: '#22d3ee', marginTop: 2, flexShrink: 0 }}>•</span> {s}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Optimized Code */}
                                    {analysis.optimizedCode && (
                                        <div className="glass-card p-5">
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: '#34d399' }}>
                                                    <CheckCircle size={16} /> Optimized Code
                                                </h3>
                                                <button onClick={() => copyCode(analysis.optimizedCode)} className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs border-none cursor-pointer"
                                                    style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)', color: isDark ? '#94a3b8' : '#64748b' }}>
                                                    {copied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy</>}
                                                </button>
                                            </div>
                                            <pre className="text-sm p-4 rounded-xl overflow-x-auto" style={{
                                                background: '#0f172a', color: '#e2e8f0', fontFamily: "'Fira Code', 'Consolas', monospace", fontSize: '0.8rem', lineHeight: 1.6
                                            }}>
                                                {analysis.optimizedCode}
                                            </pre>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
