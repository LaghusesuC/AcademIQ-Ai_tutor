const express = require('express');
const router = express.Router();
const { chat, getHistory, createSession, getSessions, getSession, deleteSession } = require('../controllers/chatController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

router.post('/', optionalAuth, chat);
router.post('/public', chat);
router.get('/history', protect, getHistory);

// Session endpoints
router.post('/sessions', optionalAuth, createSession);
router.get('/sessions', protect, getSessions);
router.get('/sessions/:id', protect, getSession);
router.delete('/sessions/:id', protect, deleteSession);

module.exports = router;
