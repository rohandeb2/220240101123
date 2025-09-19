const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createLogger } = require('./middleware/logger');
const urlRoutes = require('./routes/urlRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize logger
const logger = createLogger();

// Security middleware
app.use(helmet());
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});

// Routes
app.use('/shorturls', urlRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'URL Shortener Microservice'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'URL Shortener Microservice',
    version: '1.0.0',
    endpoints: {
      'POST /shorturls': 'Create a short URL',
      'GET /shorturls/:shortcode': 'Get URL statistics',
      'GET /:shortcode': 'Redirect to original URL',
      'GET /health': 'Health check'
    }
  });
});

// Catch-all for short URL redirection (must be before 404 handler)
app.get('/:shortcode', require('./routes/redirect'));

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`URL Shortener Microservice running on port ${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
