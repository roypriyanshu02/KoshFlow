import winston from 'winston';
import path from 'path';

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;
    
    if (Object.keys(meta).length > 0) {
      log += `\n${JSON.stringify(meta, null, 2)}`;
    }
    
    return log;
  })
);

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'koshflow-backend' },
  transports: [
    // Console transport
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    
    // File transport for errors
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5
    })
  ],
  
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'exceptions.log')
    })
  ],
  
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(process.cwd(), 'logs', 'rejections.log')
    })
  ]
});

// Security event logger
export const securityLogger = {
  loginAttempt: (ip, email, success, reason = null) => {
    logger.warn('Login attempt', {
      type: 'AUTH_LOGIN',
      ip,
      email,
      success,
      reason,
      timestamp: new Date().toISOString()
    });
  },

  loginSuccess: (ip, email, userId, userAgent) => {
    logger.info('Login successful', {
      type: 'AUTH_SUCCESS',
      ip,
      email,
      userId,
      userAgent,
      timestamp: new Date().toISOString()
    });
  },

  loginFailure: (ip, email, reason, userAgent) => {
    logger.warn('Login failed', {
      type: 'AUTH_FAILURE',
      ip,
      email,
      reason,
      userAgent,
      timestamp: new Date().toISOString()
    });
  },

  suspiciousActivity: (ip, userId, activity, details) => {
    logger.error('Suspicious activity detected', {
      type: 'SECURITY_ALERT',
      ip,
      userId,
      activity,
      details,
      timestamp: new Date().toISOString()
    });
  },

  tokenRefresh: (userId, ip, success) => {
    logger.info('Token refresh', {
      type: 'TOKEN_REFRESH',
      userId,
      ip,
      success,
      timestamp: new Date().toISOString()
    });
  },

  passwordChange: (userId, ip, success) => {
    logger.info('Password change', {
      type: 'PASSWORD_CHANGE',
      userId,
      ip,
      success,
      timestamp: new Date().toISOString()
    });
  },

  twoFactorSetup: (userId, ip, success) => {
    logger.info('2FA setup', {
      type: '2FA_SETUP',
      userId,
      ip,
      success,
      timestamp: new Date().toISOString()
    });
  },

  dataAccess: (userId, resource, action, ip) => {
    logger.info('Data access', {
      type: 'DATA_ACCESS',
      userId,
      resource,
      action,
      ip,
      timestamp: new Date().toISOString()
    });
  },

  adminAction: (adminId, action, targetId, ip, details) => {
    logger.info('Admin action', {
      type: 'ADMIN_ACTION',
      adminId,
      action,
      targetId,
      ip,
      details,
      timestamp: new Date().toISOString()
    });
  }
};

// Request logger middleware
export const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  
  // Log request
  logger.info('Incoming request', {
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    userId: req.user?.id || null,
    companyId: req.company?.id || null
  });

  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const duration = Date.now() - startTime;
    
    logger.info('Request completed', {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?.id || null,
      companyId: req.company?.id || null
    });

    // Log slow requests
    if (duration > 5000) { // 5 seconds
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration}ms`,
        ip: req.ip,
        userId: req.user?.id || null
      });
    }

    // Log error responses
    if (res.statusCode >= 400) {
      logger.error('Error response', {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: `${duration}ms`,
        ip: req.ip,
        userId: req.user?.id || null,
        error: res.error || 'Unknown error'
      });
    }

    originalEnd.call(this, chunk, encoding);
  };

  next();
};

// Error logger middleware
export const errorLogger = (err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    userId: req.user?.id || null,
    companyId: req.company?.id || null,
    body: req.body,
    query: req.query,
    params: req.params
  });

  next(err);
};

// Database query logger
export const queryLogger = (query, params, duration) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Database query', {
      query: query.replace(/\s+/g, ' ').trim(),
      params,
      duration: `${duration}ms`
    });
  }

  // Log slow queries
  if (duration > 1000) { // 1 second
    logger.warn('Slow database query', {
      query: query.replace(/\s+/g, ' ').trim(),
      params,
      duration: `${duration}ms`
    });
  }
};

// Performance logger
export const performanceLogger = {
  startTimer: (label) => {
    const start = process.hrtime.bigint();
    return {
      end: () => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1000000; // Convert to milliseconds
        logger.debug('Performance timing', {
          label,
          duration: `${duration.toFixed(2)}ms`
        });
        return duration;
      }
    };
  },

  memoryUsage: () => {
    const usage = process.memoryUsage();
    logger.debug('Memory usage', {
      rss: `${Math.round(usage.rss / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(usage.heapTotal / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(usage.heapUsed / 1024 / 1024)}MB`,
      external: `${Math.round(usage.external / 1024 / 1024)}MB`
    });
  }
};

// Audit logger for compliance
export const auditLogger = {
  create: (userId, action, resource, details = {}) => {
    logger.info('Audit log', {
      type: 'AUDIT',
      userId,
      action,
      resource,
      details,
      timestamp: new Date().toISOString()
    });
  },

  update: (userId, action, resource, oldData, newData) => {
    logger.info('Audit log', {
      type: 'AUDIT',
      userId,
      action,
      resource,
      changes: {
        old: oldData,
        new: newData
      },
      timestamp: new Date().toISOString()
    });
  },

  delete: (userId, action, resource, deletedData) => {
    logger.info('Audit log', {
      type: 'AUDIT',
      userId,
      action,
      resource,
      deletedData,
      timestamp: new Date().toISOString()
    });
  },

  access: (userId, action, resource, ip, userAgent) => {
    logger.info('Audit log', {
      type: 'AUDIT',
      userId,
      action,
      resource,
      ip,
      userAgent,
      timestamp: new Date().toISOString()
    });
  }
};

export default logger;
