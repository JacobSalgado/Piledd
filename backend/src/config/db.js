const mongoose = require('mongoose');
const logger = require('../utils/logger');

// second layer of NoSQL-injection defense
// any $operator objects that end up inside query filters
mongoose.set('sanitizeFilter', true);
mongoose.set('strictQuery', true);

mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
mongoose.connection.on('reconnected', () => logger.info('MongoDB reconnected'));

async function connectDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000});
        logger.info('Connected to MongoDB', { host: mongoose.connection.host});
    } catch (err) {
        logger.error('MongoDB connection failed', {error: err.message});
        process.exit(1);
    }
}
module.exports = connectDB;