import os from 'os';
import { performance } from 'perf_hooks';
import prisma from '../config/database.js';
import logger from './logger.js';

// System metrics collection
export const getSystemMetrics = () => {
  const memoryUsage = process.memoryUsage();
  const cpuUsage = process.cpuUsage();
  const uptime = process.uptime();
  
  return {
    timestamp: new Date().toISOString(),
    process: {
      pid: process.pid,
      uptime: uptime,
      memory: {
        rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memoryUsage.external / 1024 / 1024), // MB
        arrayBuffers: Math.round(memoryUsage.arrayBuffers / 1024 / 1024) // MB
      },
      cpu: {
        user: cpuUsage.user / 1000000, // seconds
        system: cpuUsage.system / 1000000 // seconds
      }
    },
    system: {
      platform: os.platform(),
      arch: os.arch(),
      totalMemory: Math.round(os.totalmem() / 1024 / 1024), // MB
      freeMemory: Math.round(os.freemem() / 1024 / 1024), // MB
      loadAverage: os.loadavg(),
      uptime: os.uptime()
    },
    node: {
      version: process.version,
      versions: process.versions
    }
  };
};

// Database health check
export const checkDatabaseHealth = async () => {
  const startTime = performance.now();
  
  try {
    // Simple query to check database connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    const responseTime = performance.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime: `${responseTime.toFixed(2)}ms`,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Database health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Redis health check (if configured)
export const checkRedisHealth = async () => {
  try {
    if (!process.env.REDIS_URL) {
      return {
        status: 'not_configured',
        message: 'Redis not configured'
      };
    }

    // This would need to be implemented based on your Redis client
    // For now, return not configured
    return {
      status: 'not_configured',
      message: 'Redis health check not implemented'
    };
  } catch (error) {
    logger.error('Redis health check failed:', error);
    return {
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Application health check
export const getApplicationHealth = async () => {
  const [dbHealth, redisHealth] = await Promise.all([
    checkDatabaseHealth(),
    checkRedisHealth()
  ]);

  const systemMetrics = getSystemMetrics();
  
  const overallStatus = dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy';
  
  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    services: {
      database: dbHealth,
      redis: redisHealth
    },
    metrics: systemMetrics
  };
};

// Performance monitoring middleware
export const performanceMonitoring = (req, res, next) => {
  const startTime = performance.now();
  const startMemory = process.memoryUsage();
  
  res.on('finish', () => {
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    const duration = endTime - startTime;
    
    const memoryDelta = {
      rss: endMemory.rss - startMemory.rss,
      heapUsed: endMemory.heapUsed - startMemory.heapUsed
    };
    
    // Log slow requests
    if (duration > 1000) { // 1 second
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        duration: `${duration.toFixed(2)}ms`,
        memoryDelta: `${Math.round(memoryDelta.heapUsed / 1024)}KB`,
        ip: req.ip,
        userId: req.user?.id || null
      });
    }
    
    // Log high memory usage
    if (memoryDelta.heapUsed > 10 * 1024 * 1024) { // 10MB
      logger.warn('High memory usage detected', {
        method: req.method,
        url: req.originalUrl,
        memoryDelta: `${Math.round(memoryDelta.heapUsed / 1024 / 1024)}MB`,
        ip: req.ip,
        userId: req.user?.id || null
      });
    }
  });
  
  next();
};

// Memory usage monitoring
export const memoryMonitoring = () => {
  const memoryUsage = process.memoryUsage();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  
  const memoryUsagePercent = ((memoryUsage.rss / totalMemory) * 100).toFixed(2);
  const systemMemoryUsagePercent = (((totalMemory - freeMemory) / totalMemory) * 100).toFixed(2);
  
  // Alert if memory usage is high
  if (memoryUsagePercent > 80) {
    logger.warn('High process memory usage', {
      processMemoryUsage: `${memoryUsagePercent}%`,
      systemMemoryUsage: `${systemMemoryUsagePercent}%`,
      rss: `${Math.round(memoryUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`
    });
  }
  
  return {
    processMemoryUsage: `${memoryUsagePercent}%`,
    systemMemoryUsage: `${systemMemoryUsagePercent}%`,
    rss: Math.round(memoryUsage.rss / 1024 / 1024),
    heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
    totalMemory: Math.round(totalMemory / 1024 / 1024),
    freeMemory: Math.round(freeMemory / 1024 / 1024)
  };
};

// Error rate monitoring
let errorCount = 0;
let requestCount = 0;
const errorWindow = 5 * 60 * 1000; // 5 minutes
let lastReset = Date.now();

export const trackError = () => {
  errorCount++;
  requestCount++;
  
  // Reset counters every 5 minutes
  if (Date.now() - lastReset > errorWindow) {
    errorCount = 0;
    requestCount = 0;
    lastReset = Date.now();
  }
  
  const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;
  
  // Alert if error rate is high
  if (errorRate > 10 && requestCount > 10) {
    logger.error('High error rate detected', {
      errorRate: `${errorRate.toFixed(2)}%`,
      errorCount,
      requestCount,
      window: '5 minutes'
    });
  }
  
  return {
    errorRate: errorRate.toFixed(2),
    errorCount,
    requestCount,
    window: '5 minutes'
  };
};

export const trackRequest = () => {
  requestCount++;
};

// Health check endpoint handler
export const healthCheckHandler = async (req, res) => {
  try {
    const health = await getApplicationHealth();
    const statusCode = health.status === 'healthy' ? 200 : 503;
    
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Health check failed',
      timestamp: new Date().toISOString()
    });
  }
};

// Detailed health check endpoint
export const detailedHealthCheckHandler = async (req, res) => {
  try {
    const [dbHealth, redisHealth] = await Promise.all([
      checkDatabaseHealth(),
      checkRedisHealth()
    ]);

    const systemMetrics = getSystemMetrics();
    const memoryMetrics = memoryMonitoring();
    const errorMetrics = trackError();
    
    const health = {
      status: dbHealth.status === 'healthy' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      services: {
        database: dbHealth,
        redis: redisHealth
      },
      metrics: {
        system: systemMetrics,
        memory: memoryMetrics,
        errors: errorMetrics
      }
    };
    
    const statusCode = health.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Detailed health check failed:', error);
    res.status(503).json({
      status: 'unhealthy',
      error: 'Detailed health check failed',
      timestamp: new Date().toISOString()
    });
  }
};

// Metrics endpoint
export const metricsHandler = (req, res) => {
  try {
    const systemMetrics = getSystemMetrics();
    const memoryMetrics = memoryMonitoring();
    const errorMetrics = trackError();
    
    const metrics = {
      timestamp: new Date().toISOString(),
      system: systemMetrics,
      memory: memoryMetrics,
      errors: errorMetrics
    };
    
    res.json(metrics);
  } catch (error) {
    logger.error('Metrics collection failed:', error);
    res.status(500).json({
      error: 'Metrics collection failed',
      message: error.message
    });
  }
};

// Start monitoring
export const startMonitoring = () => {
  // Monitor memory usage every 30 seconds
  setInterval(() => {
    memoryMonitoring();
  }, 30000);
  
  // Log system metrics every 5 minutes
  setInterval(() => {
    const metrics = getSystemMetrics();
    logger.info('System metrics', metrics);
  }, 300000);
  
  logger.info('Monitoring started');
};

export default {
  getSystemMetrics,
  checkDatabaseHealth,
  checkRedisHealth,
  getApplicationHealth,
  performanceMonitoring,
  memoryMonitoring,
  trackError,
  trackRequest,
  healthCheckHandler,
  detailedHealthCheckHandler,
  metricsHandler,
  startMonitoring
};
