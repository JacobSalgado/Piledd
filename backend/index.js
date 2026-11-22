const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const connectDB = require('./src/config/db');
const logger = require('./src/utils/logger');
const requestLogger = require('./src/middleware/requestLogger');
const sanitizeRequest = require('./src/middleware/sanitize');
const errorHandler = require('./src/middleware/errorHandler');
// const authRoutes = require('./src/routes/authRoutes');
// const mediaRoutes = require('./src/routes/mediaRoutes'); 

// refuse to start with missing config
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_ORIGIN'];
const missing =  REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length > 0) {
    logger.error('Missing required environment variables', { missing });
    process.exit(1);
}

const app = express();

// show the real client IP for logs and rate limits
app.set('trust proxy', process.env.TRUSTED_PROXY || false);

// middleware. security -> parsing -> sanitizing -> logging -> routes
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN}));
app.use(express.json({ limit: '10kb'}));
app.use(sanitizeRequest);
app.use(requestLogger);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// app.use('/api/auth', authRoutes);
// app.use('/api/media', mediaRoutes);

// 404 for unknown routes, then error handler
app.use((req, res) => res.status(404).json({message: 'ROUTE NOT FOUND'}));
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => logger.info('Server started', { port: PORT}));
});