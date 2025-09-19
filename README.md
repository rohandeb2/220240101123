# URL Shortener Microservice

A robust HTTP URL Shortener Microservice built for Affordmed's campus hiring evaluation. This service provides URL shortening functionality with comprehensive analytics and robust error handling.

## Features

- ✅ **URL Shortening**: Convert long URLs into short, manageable links
- ✅ **Custom Shortcodes**: Support for user-defined shortcodes
- ✅ **Automatic Generation**: Auto-generate unique shortcodes when not provided
- ✅ **Expiration Control**: Configurable validity period (default: 30 minutes)
- ✅ **Click Analytics**: Track clicks with timestamps, referrers, and location data
- ✅ **Comprehensive Logging**: Extensive logging using Winston middleware
- ✅ **Error Handling**: Robust error handling with appropriate HTTP status codes
- ✅ **Rate Limiting**: Built-in rate limiting for API protection
- ✅ **Security**: Helmet.js security headers and input validation

## API Endpoints

### 1. Create Short URL
```http
POST /shorturls
Content-Type: application/json

{
  "url": "https://very-very-very-long-and-descriptive-subdomain-that-goes-on-and-on.somedomain.com/additional/directory/levels/for/more/length/really-log-sub-domain/a-really-log-page",
  "validity": 30,
  "shortcode": "abcd1"
}
```

**Response:**
```json
{
  "shortLink": "https://hostname:port/abcd1",
  "expiry": "2025-01-01T00:30:00Z"
}
```

### 2. Get URL Statistics
```http
GET /shorturls/:shortcode
```

**Response:**
```json
{
  "shortcode": "abcd1",
  "originalUrl": "https://example.com/very-long-url",
  "createdAt": "2025-01-01T00:00:00Z",
  "expiresAt": "2025-01-01T00:30:00Z",
  "clickCount": 5,
  "clicks": [
    {
      "id": "uuid",
      "timestamp": "2025-01-01T00:15:00Z",
      "referrer": "https://google.com",
      "location": "Unknown",
      "userAgent": "Mozilla/5.0..."
    }
  ]
}
```

### 3. Redirect to Original URL
```http
GET /:shortcode
```

**Response:** 302 Redirect to original URL

### 4. Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-01-01T00:00:00Z",
  "service": "URL Shortener Microservice"
}
```

## Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd url-shortener-microservice
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the server:**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

4. **Run tests:**
   ```bash
   npm test
   ```

## Configuration

The service can be configured using environment variables:

- `PORT`: Server port (default: 3000)
- `LOG_LEVEL`: Logging level (default: 'info')

## Usage Examples

### Creating a Short URL

```bash
curl -X POST http://localhost:3000/shorturls \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.example.com/very-long-url",
    "validity": 60,
    "shortcode": "mycode123"
  }'
```

### Getting Statistics

```bash
curl http://localhost:3000/shorturls/mycode123
```

### Accessing Short URL

```bash
curl -L http://localhost:3000/mycode123
```

## Error Handling

The service returns appropriate HTTP status codes and descriptive error messages:

- **400 Bad Request**: Invalid input data
- **404 Not Found**: Shortcode doesn't exist
- **409 Conflict**: Shortcode already exists
- **410 Gone**: URL has expired
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error

## Logging

The service uses Winston for comprehensive logging:

- **Console**: Development and debugging
- **Files**: Persistent storage with rotation
  - `logs/combined.log`: All logs
  - `logs/error.log`: Error logs only
  - `logs/info.log`: Info logs only

## Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Comprehensive validation for all inputs
- **CORS**: Configurable cross-origin resource sharing
- **Request Size Limiting**: 10MB limit on request body

## Architecture

The service follows a layered architecture:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client        │    │   Express.js    │    │   Data Layer    │
│   (Browser/API) │◄──►│   Application   │◄──►│   (In-Memory)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │  Logging Layer  │
                       │   (Winston)     │
                       └─────────────────┘
```

## Data Model

```javascript
{
  id: "uuid",                    // Unique identifier
  originalUrl: "string",         // Original long URL
  shortcode: "string",           // Short identifier (3-20 chars)
  createdAt: "Date",             // Creation timestamp
  expiresAt: "Date",             // Expiration timestamp
  clickCount: "number",          // Total click count
  clicks: [                      // Array of click records
    {
      id: "uuid",
      timestamp: "Date",
      referrer: "string",
      location: "string",
      userAgent: "string"
    }
  ]
}
```

## Testing

The service includes comprehensive tests:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Performance Considerations

- **In-Memory Storage**: Fast read/write operations
- **Dual Indexing**: O(1) lookup by ID or shortcode
- **Rate Limiting**: Protection against abuse
- **Request Size Limiting**: Memory protection

## Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- Authentication and authorization
- Bulk URL operations
- Custom domain support
- QR code generation
- Advanced analytics and reporting

## License

MIT License - See LICENSE file for details

## Contact

For questions or support, please contact the development team.

---

**Note**: This service was developed as part of Affordmed's campus hiring evaluation. It demonstrates production-ready patterns and practices while meeting all specified requirements.
