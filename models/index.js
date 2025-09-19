const UrlModel = require('./UrlModel');

// Create a singleton instance to share across the application
const urlModel = new UrlModel();

module.exports = { urlModel };
