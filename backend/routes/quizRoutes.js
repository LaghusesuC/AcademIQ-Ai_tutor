const express = require('express');
const router = express.Router();
const { generate, submit, getResults } = require('../controllers/quizController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/generate', optionalAuth, generate);
router.post('/submit', protect, submit);
router.get('/results', protect, getResults);

module.exports = router;
