const { createLogger } = require('./logger');

const logger = createLogger();

const errorHandler = (err, req, res, next) => {
  // Log the error
  logger.error('Error occurred', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Default error
  let error = {
    message: 'Internal Server Error',
    status: 500
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.status = 400;
    error.details = err.details || err.message;
  } else if (err.name === 'CastError') {
    error.message = 'Invalid ID format';
    error.status = 400;
  } else if (err.code === 11000) {
    error.message = 'Duplicate entry';
    error.status = 409;
  } else if (err.status) {
    error.status = err.status;
    error.message = err.message;
  }

  // Send error response
  res.status(error.status).json({
    error: error.message,
    status: error.status,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    ...(error.details && { details: error.details })
  });
};

module.exports = { errorHandler };
