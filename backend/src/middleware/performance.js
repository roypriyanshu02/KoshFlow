/**
 * Performance monitoring middleware
 * Tracks response times and adds performance headers
 */

export const performanceMiddleware = (req, res, next) => {
  const start = Date.now();
  
  // Add performance headers
  res.setHeader('X-Response-Time-Start', start);
  
  // Override res.end to calculate response time
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    // Log slow requests (> 1000ms)
    if (duration > 1000) {
      console.warn(`Slow request: ${req.method} ${req.originalUrl} - ${duration}ms`);
    }
    
    originalEnd.apply(this, args);
  };
  
  next();
};

/**
 * Request timeout middleware
 * Prevents requests from hanging indefinitely
 */
export const timeoutMiddleware = (timeout = 30000) => {
  return (req, res, next) => {
    // Set timeout for the request
    req.setTimeout(timeout, () => {
      if (!res.headersSent) {
        res.status(408).json({
          error: 'Request timeout',
          message: 'The request took too long to process'
        });
      }
    });
    
    next();
  };
};

/**
 * Memory usage monitoring (development only)
 */
export const memoryMonitorMiddleware = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    const memUsage = process.memoryUsage();
    res.setHeader('X-Memory-Usage', JSON.stringify({
      rss: Math.round(memUsage.rss / 1024 / 1024) + 'MB',
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + 'MB',
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + 'MB'
    }));
  }
  next();
};
