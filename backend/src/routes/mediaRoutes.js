const express = require('express');
const rateLimit = require('express-rate-limit');
const {getFeatured, search, getById} = require('../controllers/mediaController');

const router = express.Router();

const searchLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many searches. Slow down'},
});

router.get('/featured', getFeatured);
router.get('/search', searchLimiter, search);
router.get('/:id', getById);

module.exports = router;