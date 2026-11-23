const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login, me } = require('../controllers/authController');
const requireAuth = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

// 10 failed attempts per IP per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    skipSuccessfulRequests: true, // only failures count toward the limit
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next, options) => {
        logger.warn('Rate limit exceeded', {ip: req.ip, path: req.originalUrl});
        res.status(options.statusCode).json({message: 'Too many attempts. Please try again later.'});
    },
});

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', requireAuth, me);

module.exports = router;