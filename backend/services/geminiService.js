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
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A",
      "explanation": "why this is correct"
    }
  ]
}
Generate ${numQuestions} questions. Mix MCQ (4 options) and short answer types. For short answer, set type to "short_answer", omit options, and set correctAnswer to the expected answer. Make questions progressively harder.`;

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
            { id: 3, type: 'short_answer', question: `Explain the time complexity of ${topic} in one sentence.`, correctAnswer: 'O(n)', explanation: 'Configure GEMINI_API_KEY for real quizzes.' },
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
      "message": "description of the error",
      "fix": "how to fix it"
    }
  ],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "optimizedCode": "the corrected and optimized version of the code",
  "explanation": "overall explanation of what was found and fixed"
}

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
