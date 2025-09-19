const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { createLogger } = require('./middleware/logger');
const urlRoutes = require('./routes/urlRoutes');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;


const logger = createLogger();


app.use(helmet());
app.use(cors());


const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 
  max: 100, 
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);


app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  next();
});


app.use('/shorturls', urlRoutes);


app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'URL Shortener Microservice'
  });
});


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


app.get('/:shortcode', require('./routes/redirect'));


app.use(errorHandler);


app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested endpoint does not exist',
    path: req.originalUrl
  });
});


app.listen(PORT, () => {
  logger.info(`URL Shortener Microservice running on port ${PORT}`);
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
