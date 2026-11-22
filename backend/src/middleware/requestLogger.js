const logger = require('../utils/logger');

function requestLogger(req, res, next) {
    const start = Date.now();

    // 'finish' fires after the response is sent, so the status code is known
    res.on('finish', () => {
        logger.info('HTTP request', {
            method: req.method,
            path: req.originalUrl,
            status: res.statusCode,
            durationMs: Date.now() - start,
            ip: req.ip,
        });
    });

    next();
}
module.exports = requestLogger;