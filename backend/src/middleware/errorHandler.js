const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ message: 'Malformed JSON.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ message: 'Request body too large.' });
  }

  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    path: req.originalUrl,
  });

  // Never send stack traces to the client; they reveal your internals
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
}

module.exports = errorHandler;