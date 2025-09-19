# URL Shortener Microservice - Design Document

## Overview
This document outlines the url shortener microservice showing how the url shortening works that are build using express.js


##Architecture


| Client |    <-----> | Express.js |           <-----> | Data Layer |
| (API) |              | Application |                 | (In-Memory/DB) |
                          |
                          |
                          |
                    | Logging Layer |
                    | (Winston/Custom) 

                    
### Technology Stack

#### Core Technologies
- **Node.js**: Runtime environment for JavaScript execution
- **Express.js**: Web application framework for handling HTTP requests


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

## API Design


#### 1. Create Short URL
- **Method**: POST
- **Path**: `/shorturls`
- **Request Body**:
  ```json
  {
    "url": "https://google.com/",
    "validity": 30,
    "shortcode": "custom123"
  }
  ```
- **Response**: 201 Created
  ```json
  {
    "shortLink": "https://localhost:3000/abkda",
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
    "originalUrl": "https://bing.com/koiuydtuyoiygfxghjlg",
    "createdAt": "2025-09-19T07:09:55.206Z",
    "expiresAt": "2025-09-19T07:09:56.206Z",
    "clickCount": 5,
    "clicks": [...]
  }
  ```

#### 3. Redirect to Original URL
- **Method**: GET
- **Path**: `/:shortcode`
- **Response**: 302 Redirect to original URL



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
