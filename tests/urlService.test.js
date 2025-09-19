const request = require('supertest');
const app = require('../server');

describe('URL Shortener Microservice', () => {
  let testShortcode;

  describe('POST /shorturls', () => {
    it('should create a short URL with default validity', async () => {
      const response = await request(app)
        .post('/shorturls')
        .send({
          url: 'https://www.example.com/very-long-url-that-needs-shortening'
        })
        .expect(201);

      expect(response.body).toHaveProperty('shortLink');
      expect(response.body).toHaveProperty('expiry');
      expect(response.body.shortLink).toMatch(/^https?:\/\/.+\/[a-zA-Z0-9]+$/);
      expect(new Date(response.body.expiry)).toBeInstanceOf(Date);
      
      
      testShortcode = response.body.shortLink.split('/').pop();
    });

    it('should create a short URL with custom validity', async () => {
      const response = await request(app)
        .post('/shorturls')
        .send({
          url: 'https://www.google.com',
          validity: 60
        })
        .expect(201);

      expect(response.body).toHaveProperty('shortLink');
      expect(response.body).toHaveProperty('expiry');
    });

    it('should create a short URL with custom shortcode', async () => {
      const response = await request(app)
        .post('/shorturls')
        .send({
          url: 'https://www.github.com',
          validity: 120,
          shortcode: 'github123'
        })
        .expect(201);

      expect(response.body.shortLink).toContain('github123');
    });

    it('should reject invalid URL', async () => {
      const response = await request(app)
        .post('/shorturls')
        .send({
          url: 'not-a-valid-url'
        })
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.message).toContain('Invalid URL');
    });

    it('should reject missing URL', async () => {
      const response = await request(app)
        .post('/shorturls')
        .send({})
        .expect(400);

      expect(response.body.message).toContain('URL is required');
    });

    it('should reject invalid shortcode format', async () => {
      const response = await request(app)
        .post('/shorturls')
        .send({
          url: 'https://www.example.com',
          shortcode: 'ab' 
        })
        .expect(400);

      expect(response.body.message).toContain('between 3 and 20');
    });

    it('should reject duplicate shortcode', async () => {
      
      await request(app)
        .post('/shorturls')
        .send({
          url: 'https://www.example1.com',
          shortcode: 'duplicate123'
        })
        .expect(201);

      
      const response = await request(app)
        .post('/shorturls')
        .send({
          url: 'https://www.example2.com',
          shortcode: 'duplicate123'
        })
        .expect(409);

      expect(response.body.message).toContain('already exists');
    });

    it('should reject invalid validity range', async () => {
      const response = await request(app)
        .post('/shorturls')
        .send({
          url: 'https://www.example.com',
          validity: 0
        })
        .expect(400);

      expect(response.body.message).toContain('between 1 and 10080');
    });
  });

  describe('GET /shorturls/:shortcode', () => {
    it('should return URL statistics', async () => {
      const response = await request(app)
        .get(`/shorturls/${testShortcode}`)
        .expect(200);

      expect(response.body).toHaveProperty('shortcode');
      expect(response.body).toHaveProperty('originalUrl');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('expiresAt');
      expect(response.body).toHaveProperty('clickCount');
      expect(response.body).toHaveProperty('clicks');
      expect(response.body.clickCount).toBe(0);
    });

    it('should return 404 for non-existent shortcode', async () => {
      const response = await request(app)
        .get('/shorturls/nonexistent123')
        .expect(404);

      expect(response.body.message).toContain('not found');
    });
  });

  describe('GET /:shortcode (Redirect)', () => {
    it('should redirect to original URL', async () => {
      const response = await request(app)
        .get(`/${testShortcode}`)
        .expect(302);

      expect(response.headers.location).toContain('example.com');
    });

    it('should return 404 for non-existent shortcode', async () => {
      const response = await request(app)
        .get('/nonexistent123')
        .expect(404);

      expect(response.body.message).toContain('not found');
    });
  });

  describe('Health Check', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'OK');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('service');
    });
  });

  describe('Root Endpoint', () => {
    it('should return API information', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('endpoints');
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 for unknown routes', async () => {
      const response = await request(app)
        .get('/unknown-route')
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Not Found');
    });
  });
});
