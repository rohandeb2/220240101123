const express = require('express');
const { urlModel } = require('../models');
const { createLogger } = require('../middleware/logger');

const router = express.Router();
const logger = createLogger();

// GET /shorturls - Informational/guard route to prevent fall-through to redirect
router.get('/', (req, res) => {
  return res.status(405).json({
    error: 'Method Not Allowed',
    message: 'Use POST /shorturls to create a short URL or GET /shorturls/:shortcode for stats',
    status: 405,
    timestamp: new Date().toISOString()
  });
});

// POST /shorturls - Create a new short URL
router.post('/', async (req, res, next) => {
  try {
    const { url, validity, shortcode } = req.body;

    // Validate required fields
    if (!url) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'URL is required',
        status: 400,
        timestamp: new Date().toISOString()
      });
    }

    // Set default validity if not provided
    const validityMinutes = validity || 30;

    logger.info('Creating short URL', {
      originalUrl: url,
      validity: validityMinutes,
      customShortcode: shortcode || 'auto-generated',
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Create the short URL
    const urlData = urlModel.createShortUrl(url, validityMinutes, shortcode);

    // Generate the short link
    const shortLink = `${req.protocol}://${req.get('host')}/${urlData.shortcode}`;

    logger.info('Short URL created successfully', {
      shortcode: urlData.shortcode,
      shortLink,
      originalUrl: url,
      expiresAt: urlData.expiresAt
    });

    // Return the response as per API specification
    res.status(201).json({
      shortLink,
      expiry: urlData.expiresAt.toISOString()
    });

  } catch (error) {
    logger.error('Error creating short URL', {
      error: error.message,
      originalUrl: req.body.url,
      ip: req.ip
    });

    // Handle specific error cases
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Shortcode already exists. Please choose a different one.',
        status: 409,
        timestamp: new Date().toISOString()
      });
    }

    if (error.message.includes('Invalid URL') || error.message.includes('required')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: error.message,
        status: 400,
        timestamp: new Date().toISOString()
      });
    }

    if (error.message.includes('between 3 and 20') || error.message.includes('alphanumeric')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Invalid shortcode format. ' + error.message,
        status: 400,
        timestamp: new Date().toISOString()
      });
    }

    if (error.message.includes('between 1 and 10080')) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Validity must be between 1 and 10080 minutes (7 days)',
        status: 400,
        timestamp: new Date().toISOString()
      });
    }

    // Generic error response
    next(error);
  }
});

// GET /shorturls/:shortcode - Get URL statistics
router.get('/:shortcode', async (req, res, next) => {
  try {
    const { shortcode } = req.params;

    logger.info('Retrieving URL statistics', {
      shortcode,
      ip: req.ip,
      userAgent: req.get('User-Agent')
    });

    // Get URL statistics
    const stats = urlModel.getUrlStats(shortcode);

    logger.info('URL statistics retrieved successfully', {
      shortcode,
      clickCount: stats.clickCount,
      originalUrl: stats.originalUrl
    });

    // Return the statistics as per API specification
    res.status(200).json({
      shortcode: stats.shortcode,
      originalUrl: stats.originalUrl,
      createdAt: stats.createdAt,
      expiresAt: stats.expiresAt,
      clickCount: stats.clickCount,
      clicks: stats.clicks
    });

  } catch (error) {
    logger.error('Error retrieving URL statistics', {
      error: error.message,
      shortcode: req.params.shortcode,
      ip: req.ip
    });

    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Short URL not found',
        status: 404,
        timestamp: new Date().toISOString()
      });
    }

    if (error.message.includes('expired')) {
      return res.status(410).json({
        error: 'Gone',
        message: 'Short URL has expired',
        status: 410,
        timestamp: new Date().toISOString()
      });
    }

    next(error);
  }
});

module.exports = router;
