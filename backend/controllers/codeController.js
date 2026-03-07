const { analyzeCode } = require('../services/geminiService');

exports.analyze = async (req, res) => {
    try {
        const { code, language } = req.body;

        if (!code || !language) {
            return res.status(400).json({ message: 'Please provide code and language' });
        }

        const analysis = await analyzeCode(code, language);
        res.json(analysis);
    } catch (error) {
        res.status(500).json({ message: 'Code analysis failed', error: error.message });
    }
};
