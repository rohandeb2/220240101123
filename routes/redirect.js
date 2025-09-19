const { urlModel } = require('../models');
const { createLogger } = require('../middleware/logger');

const logger = createLogger();


const handleRedirect = async (req, res, next) => {
  try {
    const { shortcode } = req.params;

    logger.info('Processing redirect request', {
      shortcode,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      referrer: req.get('Referer') || 'Direct'
    });

    
    const urlData = urlModel.getUrlByShortcode(shortcode);

    
    const clickData = {
      referrer: req.get('Referer') || 'Direct',
        userAgent: req.get('User-Agent') || 'Unknown',
      location: getLocationFromIP(req.ip) 
    };

    urlModel.recordClick(shortcode, clickData);

    logger.info('Redirect successful', {
      shortcode,
      originalUrl: urlData.originalUrl,
      clickCount: urlData.clickCount + 1,
      ip: req.ip
    });


    res.redirect(302, urlData.originalUrl);

  } catch (error) {
    logger.error('Error processing redirect', {
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
};


const getLocationFromIP = (ip) => {
  
  if (ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1') {
    return 'Local';
  }
  
  
  return 'Unknown';
};

module.exports = handleRedirect;
