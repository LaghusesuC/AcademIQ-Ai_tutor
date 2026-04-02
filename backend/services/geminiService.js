const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
let model = null;

function getModel() {
    if (!model) {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey || apiKey === 'your_gemini_api_key_here') {
            return null;
        }
        genAI = new GoogleGenerativeAI(apiKey);
        const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
        console.log(`Using Gemini model: ${modelName}`);
        model = genAI.getGenerativeModel({ model: modelName });
    }
    return model;
}

async function askAI(prompt) {
    const m = getModel();
    if (!m) {
        return getFallbackResponse(prompt);
    }
    try {
        const result = await m.generateContent(prompt);
        return result.response.text();
    } catch (err) {
        console.error('Gemini API error:', err.message);
        return getFallbackResponse(prompt);
    }
}

function getFallbackResponse(prompt) {
    return `I'm currently running in offline mode (no API key configured). Here's a general response:\n\nYour question: "${prompt.substring(0, 100)}..."\n\nTo get full AI-powered responses, please configure your GEMINI_API_KEY in the backend .env file.\n\nIn the meantime, I can still help you navigate the platform — try the Quiz Generator or Code Analyzer!`;
}

async function generateQuiz(topic, numQuestions = 5) {
    const prompt = `Generate a quiz about "${topic}" for a student. Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "topic": "${topic}",
  "questions": [
    {
      "id": 1,
      "type": "mcq",
      "question": "question text",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": "Option A text",
      "explanation": "why this is correct"
    }
  ]
}

IMPORTANT RULES:
- Generate exactly ${numQuestions} questions, ALL must be multiple choice (type: "mcq")
- Each question must have exactly 4 options
- The "correctAnswer" field MUST be the EXACT same string as one of the options (copy-paste the option text exactly)
- Make questions progressively harder
- Do NOT generate short answer or open-ended questions
- Ensure each question has a clear, unambiguous correct answer`;

    const m = getModel();
    if (!m) {
        return getDefaultQuiz(topic);
    }
    try {
        const result = await m.generateContent(prompt);
        const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(text);
    } catch (err) {
        console.error('Quiz generation error:', err.message);
        return getDefaultQuiz(topic);
    }
}

function getDefaultQuiz(topic) {
    return {
        topic,
        questions: [
            { id: 1, type: 'mcq', question: `What is the primary concept behind ${topic}?`, options: ['Concept A', 'Concept B', 'Concept C', 'Concept D'], correctAnswer: 'Concept A', explanation: 'Configure GEMINI_API_KEY for real quizzes.' },
            { id: 2, type: 'mcq', question: `Which data structure is commonly associated with ${topic}?`, options: ['Array', 'Tree', 'Graph', 'Stack'], correctAnswer: 'Array', explanation: 'Configure GEMINI_API_KEY for real quizzes.' },
            { id: 3, type: 'mcq', question: `What is the typical time complexity of ${topic}?`, options: ['O(1)', 'O(n)', 'O(log n)', 'O(n²)'], correctAnswer: 'O(n)', explanation: 'Configure GEMINI_API_KEY for real quizzes.' },
            { id: 4, type: 'mcq', question: `Which programming paradigm is most relevant to ${topic}?`, options: ['Object-Oriented', 'Functional', 'Procedural', 'Declarative'], correctAnswer: 'Object-Oriented', explanation: 'Configure GEMINI_API_KEY for real quizzes.' },
            { id: 5, type: 'mcq', question: `What is a common application of ${topic}?`, options: ['Web Development', 'Database Management', 'Algorithm Design', 'Network Security'], correctAnswer: 'Algorithm Design', explanation: 'Configure GEMINI_API_KEY for real quizzes.' },
        ]
    };
}

async function analyzeCode(code, language) {
    const prompt = `You are an expert code reviewer. Analyze this ${language} code and return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "language": "${language}",
  "errors": [
    {
      "line": 1,
      "type": "syntax|logic|runtime|style",
      "message": "short description of the error",
      "errorLine": "the exact source code text on that line that has the error",
      "fix": "the corrected version of that line",
      "details": [
        "Bullet point 1 explaining the issue in detail",
        "Bullet point 2 explaining why this is problematic",
        "Bullet point 3 suggesting the correct approach"
      ]
    }
  ],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "optimizedCode": "the corrected and optimized version of the code",
  "explanation": "A markdown summary with bullet points explaining all issues found"
}

IMPORTANT:
- For each error, include the "errorLine" field with the EXACT source code text from that line
- For each error, include a "details" array with 2-3 bullet points explaining the issue
- The "fix" field should show the corrected version of that specific line
- Be thorough but concise in explanations

Code to analyze:
\`\`\`${language}
${code}
\`\`\``;

    const m = getModel();
    if (!m) {
        return {
            language,
            errors: [{ line: 1, type: 'info', message: 'API key not configured — unable to analyze code.', fix: 'Set GEMINI_API_KEY in backend .env' }],
            suggestions: ['Configure your Gemini API key for full code analysis.'],
            optimizedCode: code,
            explanation: 'Running in offline mode. Configure GEMINI_API_KEY for AI-powered analysis.'
        };
    }
    try {
        const result = await m.generateContent(prompt);
        const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(text);
    } catch (err) {
        console.error('Code analysis error:', err.message);
        return {
            language,
            errors: [{ line: 1, type: 'error', message: 'Analysis failed: ' + err.message, fix: 'Try again or check your API key.' }],
            suggestions: [],
            optimizedCode: code,
            explanation: 'An error occurred during analysis.'
        };
    }
}

async function getLearningRecommendations(weakTopics, progress) {
    const prompt = `You are an AI learning advisor. A student has these weak topics: ${JSON.stringify(weakTopics)} and this learning progress: ${JSON.stringify(progress)}.

Return ONLY valid JSON (no markdown, no code fences):
{
  "recommendations": [
    {
      "topic": "topic name",
      "reason": "why this is recommended",
      "resources": ["resource 1", "resource 2"],
      "difficulty": "beginner|intermediate|advanced"
    }
  ],
  "overallAdvice": "personalized learning advice paragraph",
  "nextSteps": ["step 1", "step 2", "step 3"]
}

Give 3–5 recommendations. Be specific and encouraging.`;

    const m = getModel();
    if (!m) {
        return {
            recommendations: weakTopics.map(t => ({
                topic: t,
                reason: `You need more practice with ${t}`,
                resources: ['Practice problems', 'Review lecture notes'],
                difficulty: 'intermediate'
            })),
            overallAdvice: 'Configure GEMINI_API_KEY for personalized AI recommendations.',
            nextSteps: ['Review your weak topics', 'Take practice quizzes', 'Ask the chatbot for explanations']
        };
    }
    try {
        const result = await m.generateContent(prompt);
        const text = result.response.text().replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        return JSON.parse(text);
    } catch (err) {
        console.error('Recommendations error:', err.message);
        return {
            recommendations: [],
            overallAdvice: 'Unable to generate recommendations right now.',
            nextSteps: ['Try again later']
        };
    }
}

module.exports = { askAI, generateQuiz, analyzeCode, getLearningRecommendations };
