const express = require('express');
const router = express.Router();
const { analyze } = require('../controllers/codeController');
const { optionalAuth } = require('../middleware/authMiddleware');

router.post('/analyze', optionalAuth, analyze);

module.exports = router;
