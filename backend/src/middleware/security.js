import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import xss from 'xss';
import compression from 'compression';
import { createClient } from 'redis';

// Redis client for advanced rate limiting
let redisClient = null;
if (process.env.REDIS_URL) {
  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  redisClient.connect();
}

// Enhanced CORS configuration
export const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || [process.env.CORS_ORIGIN || 'http://localhost:5173'];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count']
};

// Enhanced Helmet configuration
export const helmetOptions = {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
};

// Rate limiting configurations
export const createRateLimit = (windowMs, max, message, skipSuccessfulRequests = false) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests',
      message,
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Too many requests',
        message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// General API rate limiting
export const generalLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  100, // 100 requests per window
  'Too many requests from this IP, please try again later.'
);

// Strict rate limiting for auth endpoints
export const authLimiter = createRateLimit(
  15 * 60 * 1000, // 15 minutes
  5, // 5 requests per window
  'Too many authentication attempts, please try again later.',
  true // Skip successful requests
);

// Password reset rate limiting
export const passwordResetLimiter = createRateLimit(
  60 * 60 * 1000, // 1 hour
  3, // 3 requests per hour
  'Too many password reset attempts, please try again later.'
);

// Slow down configuration
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per 15 minutes, then...
  delayMs: 500 // Add 500ms delay per request above delayAfter
});

// XSS protection middleware
export const xssProtection = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeObject(req.body);
  }
  if (req.query) {
    req.query = sanitizeObject(req.query);
  }
  if (req.params) {
    req.params = sanitizeObject(req.params);
  }
  next();
};

// Recursively sanitize objects
const sanitizeObject = (obj) => {
  if (typeof obj === 'string') {
    return xss(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeObject);
  }
  if (obj && typeof obj === 'object') {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  return obj;
};

// Request size limiter
export const requestSizeLimiter = (req, res, next) => {
  const contentLength = parseInt(req.get('content-length') || '0');
  const maxSize = parseInt(process.env.MAX_REQUEST_SIZE) || 10 * 1024 * 1024; // 10MB default
  
  if (contentLength > maxSize) {
    return res.status(413).json({
      error: 'Request too large',
      message: `Request size exceeds ${maxSize / 1024 / 1024}MB limit`
    });
  }
  next();
};

// IP whitelist middleware (for admin endpoints)
export const ipWhitelist = (allowedIPs = []) => {
  return (req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
      return next();
    }
    
    const clientIP = req.ip || req.connection.remoteAddress;
    if (allowedIPs.length === 0 || allowedIPs.includes(clientIP)) {
      next();
    } else {
      res.status(403).json({
        error: 'Access denied',
        message: 'Your IP address is not authorized'
      });
    }
  };
};

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  // Add custom security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  next();
};

// Request logging for security monitoring
export const securityLogger = (req, res, next) => {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.originalUrl,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userId: req.user?.id || null,
      companyId: req.company?.id || null
    };
    
    // Log suspicious activities
    if (res.statusCode >= 400) {
      console.warn('Security Warning:', logData);
    }
    
    // Log successful requests in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Request:', logData);
    }
  });
  
  next();
};

// Database query protection
export const queryProtection = (req, res, next) => {
  // Check for potential NoSQL injection patterns
  const suspiciousPatterns = [
    /\$where/i,
    /\$ne/i,
    /\$gt/i,
    /\$lt/i,
    /\$regex/i,
    /javascript:/i,
    /<script/i,
    /on\w+\s*=/i
  ];
  
  const checkForSuspiciousContent = (obj, path = '') => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(obj[key])) {
            console.warn(`Suspicious pattern detected in ${path}.${key}:`, obj[key]);
            return res.status(400).json({
              error: 'Invalid request',
              message: 'Request contains potentially malicious content'
            });
          }
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        const result = checkForSuspiciousContent(obj[key], `${path}.${key}`);
        if (result) return result;
      }
    }
    return null;
  };
  
  if (req.body) {
    const result = checkForSuspiciousContent(req.body, 'body');
    if (result) return result;
  }
  
  if (req.query) {
    const result = checkForSuspiciousContent(req.query, 'query');
    if (result) return result;
  }
  
  next();
};

export default {
  corsOptions,
  helmetOptions,
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  speedLimiter,
  xssProtection,
  requestSizeLimiter,
  ipWhitelist,
  securityHeaders,
  securityLogger,
  queryProtection
};
