# URL Shortener Microservice - Design Document

## Overview
This document outlines the architectural and design decisions for the URL Shortener Microservice developed for Affordmed's campus hiring evaluation. The service provides URL shortening functionality with comprehensive analytics and robust error handling.

## Architecture

### High-Level Architecture
The microservice follows a layered architecture pattern with clear separation of concerns:

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

### Technology Stack

#### Core Technologies
- **Node.js**: Runtime environment for JavaScript execution
- **Express.js**: Web application framework for handling HTTP requests
- **Winston**: Comprehensive logging library (as required)

#### Supporting Libraries
- **UUID**: For generating unique identifiers
- **Validator**: For URL validation
- **Moment.js**: For date/time manipulation
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing
- **Express Rate Limit**: API rate limiting

#### Development Tools
- **Nodemon**: Development server with auto-restart
- **Jest**: Testing framework
- **Supertest**: HTTP assertion library

## Data Modeling

### URL Entity Structure
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

### Data Storage Strategy
- **Current Implementation**: In-memory storage using JavaScript Map
- **Production Recommendation**: Persistent database (MongoDB/PostgreSQL)
- **Indexing Strategy**: Dual indexing by ID and shortcode for O(1) lookups

## API Design

### Endpoints

#### 1. Create Short URL
- **Method**: POST
- **Path**: `/shorturls`
- **Request Body**:
  ```json
  {
    "url": "https://example.com/very-long-url",
    "validity": 30,
    "shortcode": "custom123"
  }
  ```
- **Response**: 201 Created
  ```json
  {
    "shortLink": "https://hostname:port/custom123",
    "expiry": "2025-01-01T00:30:00Z"
  }
  ```

#### 2. Get URL Statistics
- **Method**: GET
- **Path**: `/shorturls/:shortcode`
- **Response**: 200 OK
  ```json
  {
    "shortcode": "custom123",
    "originalUrl": "https://example.com/very-long-url",
    "createdAt": "2025-01-01T00:00:00Z",
    "expiresAt": "2025-01-01T00:30:00Z",
    "clickCount": 5,
    "clicks": [...]
  }
  ```

#### 3. Redirect to Original URL
- **Method**: GET
- **Path**: `/:shortcode`
- **Response**: 302 Redirect to original URL

### Error Handling Strategy

#### HTTP Status Codes
- **200**: Success
- **201**: Created
- **302**: Redirect
- **400**: Bad Request (validation errors)
- **404**: Not Found (shortcode doesn't exist)
- **409**: Conflict (shortcode already exists)
- **410**: Gone (URL expired)
- **429**: Too Many Requests (rate limiting)
- **500**: Internal Server Error

#### Error Response Format
```json
{
  "error": "Error Type",
  "message": "Human-readable error message",
  "status": 400,
  "timestamp": "2025-01-01T00:00:00Z",
  "path": "/shorturls"
}
```

## Security Considerations

### Implemented Security Measures
1. **Helmet.js**: Security headers (XSS protection, content type sniffing prevention)
2. **Rate Limiting**: 100 requests per 15 minutes per IP
3. **Input Validation**: Comprehensive validation for all inputs
4. **CORS**: Configurable cross-origin resource sharing
5. **Request Size Limiting**: 10MB limit on request body

### Additional Security Recommendations
1. **Authentication**: JWT-based authentication for production
2. **HTTPS**: SSL/TLS encryption for all communications
3. **Input Sanitization**: Additional XSS prevention
4. **Database Security**: Parameterized queries, connection encryption

## Logging Strategy

### Logging Levels
- **Error**: System errors, exceptions, failed operations
- **Warn**: Warning conditions, deprecated usage
- **Info**: General information, successful operations
- **Debug**: Detailed debugging information

### Log Structure
```json
{
  "timestamp": "2025-01-01T00:00:00.000Z",
  "level": "info",
  "message": "Short URL created successfully",
  "service": "url-shortener",
  "shortcode": "abc123",
  "ip": "127.0.0.1",
  "userAgent": "Mozilla/5.0...",
  "originalUrl": "https://example.com"
}
```

### Log Storage
- **Console**: Development and debugging
- **Files**: Persistent storage with rotation
  - `combined.log`: All logs
  - `error.log`: Error logs only
  - `info.log`: Info logs only
  - `exceptions.log`: Uncaught exceptions
  - `rejections.log`: Unhandled promise rejections

## Performance Considerations

### Optimization Strategies
1. **In-Memory Storage**: Fast read/write operations
2. **Dual Indexing**: O(1) lookup by ID or shortcode
3. **Connection Pooling**: For database connections (future)
4. **Caching**: Redis for frequently accessed URLs (future)
5. **CDN**: For static assets and global distribution

### Scalability Recommendations
1. **Horizontal Scaling**: Load balancer with multiple instances
2. **Database Sharding**: Partition data by shortcode ranges
3. **Microservices**: Split into separate services (auth, analytics, etc.)
4. **Message Queues**: Async processing for analytics

## Monitoring and Observability

### Metrics to Track
1. **Request Rate**: Requests per second/minute
2. **Response Time**: Average, P95, P99 response times
3. **Error Rate**: Percentage of failed requests
4. **Click Analytics**: Click-through rates, popular URLs
5. **System Health**: Memory usage, CPU utilization

### Health Checks
- **Endpoint**: `GET /health`
- **Response**: Service status, timestamp, version info
- **Monitoring**: External health check services

## Assumptions and Constraints

### Assumptions
1. **Pre-authorized Users**: No authentication required for this evaluation
2. **Single Instance**: No distributed system requirements
3. **Memory Storage**: Sufficient for evaluation purposes
4. **Short Validity**: URLs expire within 7 days maximum
5. **Alphanumeric Shortcodes**: Only letters and numbers allowed

### Constraints
1. **Time Limit**: 2-hour implementation window
2. **Mandatory Logging**: Must use Winston logging middleware
3. **No Database**: In-memory storage only
4. **Single Microservice**: Monolithic service architecture
5. **Global Uniqueness**: Shortcodes must be globally unique

## Future Enhancements

### Short-term Improvements
1. **Database Integration**: PostgreSQL or MongoDB
2. **Authentication**: JWT-based user authentication
3. **Bulk Operations**: Batch URL creation
4. **Custom Domains**: Support for custom short domains
5. **QR Code Generation**: Automatic QR code creation

### Long-term Roadmap
1. **Microservices Architecture**: Split into multiple services
2. **Event-Driven Architecture**: Async processing with message queues
3. **Machine Learning**: Click prediction and fraud detection
4. **Global CDN**: Worldwide distribution
5. **Advanced Analytics**: Detailed reporting and insights

## Testing Strategy

### Test Coverage
1. **Unit Tests**: Individual function testing
2. **Integration Tests**: API endpoint testing
3. **Error Handling**: Edge case and error scenario testing
4. **Performance Tests**: Load and stress testing
5. **Security Tests**: Vulnerability and penetration testing

### Test Data Management
- **Mock Data**: In-memory test data
- **Test Isolation**: Each test runs independently
- **Cleanup**: Automatic test data cleanup

## Deployment Considerations

### Environment Configuration
- **Development**: Local development with nodemon
- **Production**: PM2 or Docker containerization
- **Environment Variables**: Configuration management
- **Logging**: Structured logging for production

### Infrastructure Requirements
- **Minimum**: 1 CPU, 512MB RAM
- **Recommended**: 2 CPU, 1GB RAM
- **Storage**: Log file rotation and cleanup
- **Network**: HTTPS termination, load balancing

## Conclusion

This URL Shortener Microservice provides a robust, scalable foundation for URL shortening with comprehensive analytics. The design prioritizes simplicity for the evaluation while maintaining production-ready patterns and practices. The modular architecture allows for easy extension and enhancement as requirements evolve.

The implementation successfully meets all specified requirements:
- ✅ Mandatory logging integration with Winston
- ✅ Single microservice architecture
- ✅ Pre-authorized user assumption
- ✅ Globally unique short links
- ✅ 30-minute default validity
- ✅ Custom shortcode support
- ✅ Automatic shortcode generation
- ✅ URL redirection functionality
- ✅ Robust error handling
- ✅ Comprehensive API design
