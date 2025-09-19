const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const moment = require('moment');

class UrlModel {
  constructor() {
   
    this.urls = new Map();
    this.shortcodes = new Set();
  }


  generateShortcode(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let shortcode;
    
    do {
      shortcode = '';
      for (let i = 0; i < length; i++) {
        shortcode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
    } while (this.shortcodes.has(shortcode));
    
    return shortcode;
  }


  validateUrl(url) {
    if (!url || typeof url !== 'string') {
      throw new Error('URL is required and must be a string');
    }
    
    if (!validator.isURL(url, { 
      protocols: ['http', 'https'],
      require_protocol: true 
    })) {
      throw new Error('Invalid URL format. Must include http:// or https://');
    }
    
    return true;
  }

  validateShortcode(shortcode) {
    if (!shortcode || typeof shortcode !== 'string') {
      throw new Error('Shortcode must be a non-empty string');
    }
    
    if (shortcode.length < 3 || shortcode.length > 20) {
      throw new Error('Shortcode must be between 3 and 20 characters');
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(shortcode)) {
      throw new Error('Shortcode must contain only alphanumeric characters');
    }
    
    return true;
  }

  createShortUrl(originalUrl, validityMinutes = 30, customShortcode = null) {

    this.validateUrl(originalUrl);
    
    if (validityMinutes < 1 || validityMinutes > 10080) { // Max 7 days
      throw new Error('Validity must be between 1 and 10080 minutes (7 days)');
    }

    let shortcode;
    
    if (customShortcode) {
      this.validateShortcode(customShortcode);
      
      if (this.shortcodes.has(customShortcode)) {
        throw new Error('Shortcode already exists. Please choose a different one.');
      }
      
      shortcode = customShortcode;
    } else {
      shortcode = this.generateShortcode();
    }

    const id = uuidv4();
    const createdAt = new Date();
    const expiresAt = moment(createdAt).add(validityMinutes, 'minutes').toDate();

    const urlData = {
      id,
      originalUrl,
      shortcode,
      createdAt,
      expiresAt,
      clickCount: 0,
      clicks: []
    };

  
    this.urls.set(id, urlData);
    this.urls.set(shortcode, urlData); 
    this.shortcodes.add(shortcode);

    return {
      id,
      shortcode,
      originalUrl,
      createdAt,
      expiresAt,
      clickCount: 0,
      clicks: []
    };
  }


  getUrlByShortcode(shortcode) {
    const urlData = this.urls.get(shortcode);
    
    if (!urlData) {
      throw new Error('Short URL not found');
    }


    if (new Date() > urlData.expiresAt) {
      throw new Error('Short URL has expired');
    }

    return urlData;
  }

  
  recordClick(shortcode, clickData) {
    const urlData = this.urls.get(shortcode);
    
    if (!urlData) {
      throw new Error('Short URL not found');
    }

    if (new Date() > urlData.expiresAt) {
      throw new Error('Short URL has expired');
    }

    const click = {
      id: uuidv4(),
      timestamp: new Date(),
      ...clickData
    };

    urlData.clicks.push(click);
    urlData.clickCount++;

    return click;
  }


  getUrlStats(shortcode) {
    const urlData = this.getUrlByShortcode(shortcode);
    
    return {
      shortcode: urlData.shortcode,
      originalUrl: urlData.originalUrl,
      createdAt: urlData.createdAt,
      expiresAt: urlData.expiresAt,
      clickCount: urlData.clickCount,
      clicks: urlData.clicks.map(click => ({
        id: click.id,
        timestamp: click.timestamp,
        referrer: click.referrer || 'Direct',
        location: click.location || 'Unknown',
        userAgent: click.userAgent || 'Unknown'
      }))
    };
  }


  cleanupExpiredUrls() {
    const now = new Date();
    const expiredIds = [];
    
    for (const [key, urlData] of this.urls.entries()) {
      if (urlData.id && now > urlData.expiresAt) {
        expiredIds.push(key);
        this.shortcodes.delete(urlData.shortcode);
      }
    }
    
    expiredIds.forEach(id => this.urls.delete(id));
    
    return expiredIds.length;
  }
}

module.exports = UrlModel;
