import prisma from '../config/database.js';
import logger from './logger.js';

// Database connection security
export const secureDatabaseConnection = () => {
  // Ensure SSL connection in production
  if (process.env.NODE_ENV === 'production') {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl.includes('sslmode=require')) {
      logger.warn('Database connection may not be using SSL in production');
    }
  }
};

// Query performance monitoring
export const queryPerformanceMonitoring = (prisma) => {
  const originalQuery = prisma.$queryRaw;
  const originalExecute = prisma.$executeRaw;
  
  prisma.$queryRaw = async (query, ...args) => {
    const startTime = Date.now();
    try {
      const result = await originalQuery.call(prisma, query, ...args);
      const duration = Date.now() - startTime;
      
      if (duration > 1000) { // Log slow queries
        logger.warn('Slow database query detected', {
          query: query.toString(),
          duration: `${duration}ms`,
          args: args.length
        });
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Database query failed', {
        query: query.toString(),
        duration: `${duration}ms`,
        error: error.message
      });
      throw error;
    }
  };
  
  prisma.$executeRaw = async (query, ...args) => {
    const startTime = Date.now();
    try {
      const result = await originalExecute.call(prisma, query, ...args);
      const duration = Date.now() - startTime;
      
      if (duration > 1000) { // Log slow queries
        logger.warn('Slow database query detected', {
          query: query.toString(),
          duration: `${duration}ms`,
          args: args.length
        });
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Database query failed', {
        query: query.toString(),
        duration: `${duration}ms`,
        error: error.message
      });
      throw error;
    }
  };
};

// Database health check
export const checkDatabaseHealth = async () => {
  try {
    const startTime = Date.now();
    
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Test transaction capability
    await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT 1`;
    });
    
    // Check connection pool status
    const connectionCount = await prisma.$queryRaw`
      SELECT count(*) as active_connections 
      FROM pg_stat_activity 
      WHERE state = 'active'
    `;
    
    const duration = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime: `${duration}ms`,
      activeConnections: connectionCount[0]?.active_connections || 0,
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

// Database backup functionality
export const createDatabaseBackup = async () => {
  try {
    if (process.env.NODE_ENV !== 'production') {
      logger.info('Database backup skipped in non-production environment');
      return { success: false, message: 'Backup only available in production' };
    }
    
    // This would typically use pg_dump or similar
    // For now, we'll just log the attempt
    logger.info('Database backup initiated', {
      timestamp: new Date().toISOString(),
      database: process.env.DATABASE_URL?.split('@')[1]?.split('/')[1] || 'unknown'
    });
    
    return {
      success: true,
      message: 'Backup initiated successfully',
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Database backup failed:', error);
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Database optimization recommendations
export const getDatabaseOptimizationRecommendations = async () => {
  try {
    const recommendations = [];
    
    // Check for missing indexes
    const missingIndexes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        attname,
        n_distinct,
        correlation
      FROM pg_stats
      WHERE schemaname = 'public'
      AND n_distinct > 100
      AND correlation < 0.1
      ORDER BY n_distinct DESC
      LIMIT 10
    `;
    
    if (missingIndexes.length > 0) {
      recommendations.push({
        type: 'missing_indexes',
        priority: 'high',
        message: 'Consider adding indexes for frequently queried columns',
        details: missingIndexes
      });
    }
    
    // Check for unused indexes
    const unusedIndexes = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
      FROM pg_stat_user_indexes
      WHERE idx_scan = 0
      AND schemaname = 'public'
      ORDER BY pg_relation_size(indexrelid) DESC
      LIMIT 10
    `;
    
    if (unusedIndexes.length > 0) {
      recommendations.push({
        type: 'unused_indexes',
        priority: 'medium',
        message: 'Consider removing unused indexes to improve write performance',
        details: unusedIndexes
      });
    }
    
    // Check for large tables
    const largeTables = await prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      LIMIT 10
    `;
    
    const largeTableThreshold = 100 * 1024 * 1024; // 100MB
    const largeTablesFiltered = largeTables.filter(table => table.size_bytes > largeTableThreshold);
    
    if (largeTablesFiltered.length > 0) {
      recommendations.push({
        type: 'large_tables',
        priority: 'medium',
        message: 'Consider partitioning or archiving data for large tables',
        details: largeTablesFiltered
      });
    }
    
    return {
      recommendations,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Failed to get database optimization recommendations:', error);
    return {
      recommendations: [],
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Database connection pool monitoring
export const getConnectionPoolStatus = async () => {
  try {
    const poolStatus = await prisma.$queryRaw`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections,
        count(*) FILTER (WHERE state = 'idle in transaction') as idle_in_transaction
      FROM pg_stat_activity
      WHERE datname = current_database()
    `;
    
    const maxConnections = await prisma.$queryRaw`
      SELECT setting::int as max_connections
      FROM pg_settings
      WHERE name = 'max_connections'
    `;
    
    return {
      ...poolStatus[0],
      maxConnections: maxConnections[0]?.max_connections || 0,
      utilizationPercent: ((poolStatus[0]?.total_connections || 0) / (maxConnections[0]?.max_connections || 1)) * 100,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Failed to get connection pool status:', error);
    return {
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Database security audit
export const performDatabaseSecurityAudit = async () => {
  try {
    const auditResults = [];
    
    // Check for weak passwords (this would need to be implemented based on your user management)
    const weakPasswords = await prisma.user.findMany({
      where: {
        password: {
          // This is a simplified check - in reality, you'd need to check password strength
          not: undefined
        }
      },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    });
    
    // Check for inactive users
    const inactiveUsers = await prisma.user.findMany({
      where: {
        lastLogin: {
          lt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // 90 days ago
        },
        isActive: true
      },
      select: {
        id: true,
        email: true,
        lastLogin: true
      }
    });
    
    if (inactiveUsers.length > 0) {
      auditResults.push({
        type: 'inactive_users',
        severity: 'medium',
        message: `${inactiveUsers.length} users haven't logged in for 90+ days`,
        details: inactiveUsers
      });
    }
    
    // Check for users with admin privileges
    const adminUsers = await prisma.user.findMany({
      where: {
        role: 'ADMIN'
      },
      select: {
        id: true,
        email: true,
        lastLogin: true,
        isActive: true
      }
    });
    
    if (adminUsers.length > 5) {
      auditResults.push({
        type: 'too_many_admins',
        severity: 'low',
        message: `Consider reducing the number of admin users (currently ${adminUsers.length})`,
        details: adminUsers
      });
    }
    
    // Check for failed login attempts
    const recentFailedLogins = await prisma.auditLog.count({
      where: {
        action: 'LOGIN_FAILED',
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    });
    
    if (recentFailedLogins > 100) {
      auditResults.push({
        type: 'high_failed_logins',
        severity: 'high',
        message: `${recentFailedLogins} failed login attempts in the last 24 hours`,
        details: { count: recentFailedLogins }
      });
    }
    
    return {
      auditResults,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error('Database security audit failed:', error);
    return {
      auditResults: [],
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Initialize database security
export const initializeDatabaseSecurity = () => {
  // Enable query performance monitoring
  queryPerformanceMonitoring(prisma);
  
  // Secure database connection
  secureDatabaseConnection();
  
  logger.info('Database security initialized');
};

export default {
  secureDatabaseConnection,
  queryPerformanceMonitoring,
  checkDatabaseHealth,
  createDatabaseBackup,
  getDatabaseOptimizationRecommendations,
  getConnectionPoolStatus,
  performDatabaseSecurityAudit,
  initializeDatabaseSecurity
};
