const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
    if (err.type === 'entity.parse.failed') {
        return res.status(400).json({message: 'Malformed JSON'});
    }
    if (err.type === 'entity.too.large') {
        return res.status(413).json({message: 'Request body too large'});
    }
    // this is so outside outages don't look like crashes and the frontend gets the exact status num error
    if (err.publicMessage && err.status) {
        logger.warn('Upstream API failure', { error: err.message, path: req.originalUrl});
        return res.status(err.status).json({message: err.publicMessage});
    }

    logger.error('Unhandled error', {
        error: err.message,
        stack: err.stack,
        method: req.method,
        path: req.originalUrl,
    });

    res.status(500).json({message: 'Something went wrong. Please try again'});
}

module.exports = errorHandler;