const jwt = require(jsonwebtoken);
const User = require('../models/User');
const logger = require('../utils/logger');

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;

const createToken = (user) =>
    jwt.sign({id: user._id.toString()}, process.env.JWT_SECRET, {
        algorithm: 'HS256',
        expiresIn: '2h',
    });

// fields only sent to client
const publicUser = (user) => ({
    id: user._id.toString(),
    username: user.username,
    email: user.email,
});

exports.register = async (req, res) => {
    const { username, email, password } = req.body ?? {};

    // layer 1 of injection defense
    if (![username, email, password].every(isNonEmptyString)) {
        return res.status(400).json({ message: 'Username, email, and password are required'});
    }
    try {
        // pick fields explicitly
        const user = await User.create({ username, email, password });
        logger.info('User registered', { userId: user._id.toString(), username: user.username, ip: req.ip});
        return res.status(201).json({message: 'ACCOUNT CREATED'});
    } catch (err) {
        if (err.code === 11000) {
            logger.warn('Registration conflict', { ip: req.ip });
            return res.status(409).json({ message: 'Username or email is already in use.'});
        }
        if (err.name === 'ValidationError') {
            const firstError = Object.values(err.errors)[0];
            return res.status(400).json({ message: firstError.message });
        }
        throw err;
    }
};

exports.login = async (req, res) => {
    const {email, password} = req.body ?? {};

    if (!isNonEmptyString(email) || !isNonEmptyString(password)) {
        return res.status(400).json({ message: 'Email and password are required.'});
    }

    const user = await User.findOne({email: email.trim().toLowerCase()}).select('+password');
    const valid = user ? await user.comparePassword(password) : false;

    if (!valid) {
        logger.warn('Failed login', { email, ip: req.ip });
        // same message whether email or password was wrong
        return res.status(401).json({ message: 'Inavlid email or password' });
    }

    logger.info('Successful login', { userId: user._id.toString(), ip: req.ip});
    return res.json({token: createToken(user), user: publicUser(user)});
};

exports.me = async(req,res) => {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({message: 'User not found'});
    return res.json({user: publicUser(user)});
};