const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Parse allowed email domains from env (comma-separated)
const getAllowedDomains = () => {
    const raw = process.env.ALLOWED_EMAIL_DOMAINS || '';
    return raw.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);
};

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide name, email, and password' });
        }

        // Validate email domain for manual registration too
        const allowedDomains = getAllowedDomains();
        if (allowedDomains.length > 0) {
            const emailDomain = email.split('@')[1]?.toLowerCase();
            if (!allowedDomains.includes(emailDomain)) {
                return res.status(403).json({
                    message: `Only emails from these domains are allowed: ${allowedDomains.join(', ')}`
                });
            }
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }

        const user = await User.create({ name, email, password });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            learningProgress: user.learningProgress,
            weakTopics: user.weakTopics,
            totalQuizzesTaken: user.totalQuizzesTaken,
            totalQuestionsAsked: user.totalQuestionsAsked,
            createdAt: user.createdAt
        });
    } catch (error) {
        res.status(500).json({ message: 'Failed to get user', error: error.message });
    }
};

exports.googleAuth = async (req, res) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ message: 'Google credential is required' });
        }

        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        const { sub: googleId, email, name, picture: avatar } = payload;

        // Validate email domain
        const allowedDomains = getAllowedDomains();
        if (allowedDomains.length > 0) {
            const emailDomain = email.split('@')[1]?.toLowerCase();
            if (!allowedDomains.includes(emailDomain)) {
                return res.status(403).json({
                    message: `Only institutional emails are allowed (${allowedDomains.join(', ')}). You signed in with ${email}.`
                });
            }
        }

        let user = await User.findOne({ $or: [{ googleId }, { email }] });
        if (user) {
            // Link Google ID if this was originally an email/password account
            if (!user.googleId) {
                user.googleId = googleId;
                if (!user.avatar) user.avatar = avatar;
                await user.save();
            }
        } else {
            user = await User.create({ name, email, googleId, avatar });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            avatar: user.avatar,
            token: generateToken(user._id)
        });
    } catch (error) {
        res.status(401).json({ message: 'Google authentication failed', error: error.message });
    }
};

