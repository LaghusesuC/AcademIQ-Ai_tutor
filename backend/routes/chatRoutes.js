const express = require('express');
const router = express.Router();
const { chat, getHistory } = require('../controllers/chatController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, chat);
router.post('/public', chat);
router.get('/history', protect, getHistory);

module.exports = router;
