const winston = require('winston');
const path = require('path');


const fs = require('fs');
const logDir = 'logs';
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}


const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...meta
    });
  })
);


const createLogger = () => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'url-shortener' },
    transports: [
     
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple()
        )
      }),
      

      new winston.transports.File({
        filename: path.join(logDir, 'combined.log'),
        maxsize: 5242880, 
        maxFiles: 5,
        tailable: true
      }),

      new winston.transports.File({
        filename: path.join(logDir, 'error.log'),
        level: 'error',
        maxsize: 5242880, 
        maxFiles: 5,
        tailable: true
      }),

      new winston.transports.File({
        filename: path.join(logDir, 'info.log'),
        level: 'info',
        maxsize: 5242880, 
        maxFiles: 5,
        tailable: true
      })
    ],
    
    
    exceptionHandlers: [
      new winston.transports.File({
        filename: path.join(logDir, 'exceptions.log')
      })
    ],
    
    
    rejectionHandlers: [
      new winston.transports.File({
        filename: path.join(logDir, 'rejections.log')
      })
    ]
  });
};

module.exports = { createLogger };
