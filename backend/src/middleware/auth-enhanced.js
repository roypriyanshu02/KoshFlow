import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import qrcode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database.js';
import { createClient } from 'redis';

// Redis client for token blacklisting
let redisClient = null;
if (process.env.REDIS_URL) {
  redisClient = createClient({ url: process.env.REDIS_URL });
  redisClient.on('error', (err) => console.error('Redis Client Error:', err));
  redisClient.connect();
}

// Token types
const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  RESET: 'reset',
  VERIFY: 'verify'
};

// Generate token pair
export const generateTokenPair = (userId, companyId) => {
  const accessToken = jwt.sign(
    { 
      userId, 
      companyId, 
      type: TOKEN_TYPES.ACCESS,
      jti: uuidv4() // JWT ID for token tracking
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m' }
  );

  const refreshToken = jwt.sign(
    { 
      userId, 
      companyId, 
      type: TOKEN_TYPES.REFRESH,
      jti: uuidv4()
    },
    process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// Verify and decode token
export const verifyToken = (token, type = TOKEN_TYPES.ACCESS) => {
  try {
    const secret = type === TOKEN_TYPES.REFRESH 
      ? (process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET)
      : process.env.JWT_SECRET;
    
    const decoded = jwt.verify(token, secret);
    
    if (decoded.type !== type) {
      throw new Error('Invalid token type');
    }
    
    return decoded;
  } catch (error) {
    throw error;
  }
};

// Check if token is blacklisted
export const isTokenBlacklisted = async (jti) => {
  if (!redisClient) return false;
  
  try {
    const result = await redisClient.get(`blacklist:${jti}`);
    return result !== null;
  } catch (error) {
    console.error('Redis error:', error);
    return false;
  }
};

// Blacklist token
export const blacklistToken = async (jti, expiresIn) => {
  if (!redisClient) return;
  
  try {
    await redisClient.setEx(`blacklist:${jti}`, expiresIn, 'true');
  } catch (error) {
    console.error('Redis error:', error);
  }
};

// Enhanced authentication middleware
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        error: 'Access token required',
        code: 'NO_TOKEN'
      });
    }

    const decoded = verifyToken(token, TOKEN_TYPES.ACCESS);
    
    // Check if token is blacklisted
    if (await isTokenBlacklisted(decoded.jti)) {
      return res.status(401).json({ 
        error: 'Token has been revoked',
        code: 'TOKEN_REVOKED'
      });
    }
    
    // Get user from database with additional security checks
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: { 
        company: true,
        sessions: {
          where: {
            token: token,
            expiresAt: { gt: new Date() }
          }
        }
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({ 
        error: 'Invalid or inactive user',
        code: 'USER_INVALID'
      });
    }

    // Check if session exists and is valid
    if (user.sessions.length === 0) {
      return res.status(401).json({ 
        error: 'Invalid session',
        code: 'SESSION_INVALID'
      });
    }

    // Check for suspicious activity (multiple failed logins, etc.)
    const recentFailedLogins = await prisma.auditLog.count({
      where: {
        userId: user.id,
        action: 'LOGIN_FAILED',
        createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) } // Last 15 minutes
      }
    });

    if (recentFailedLogins > 5) {
      return res.status(429).json({ 
        error: 'Account temporarily locked due to suspicious activity',
        code: 'ACCOUNT_LOCKED'
      });
    }

    req.user = user;
    req.company = user.company;
    req.token = token;
    req.tokenData = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        code: 'TOKEN_INVALID'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        code: 'TOKEN_EXPIRED'
      });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      error: 'Authentication failed',
      code: 'AUTH_ERROR'
    });
  }
};

// Role-based access control
export const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const userRole = req.user.role;
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `Required role: ${allowedRoles.join(' or ')}, Current role: ${userRole}`,
        code: 'INSUFFICIENT_PERMISSIONS'
      });
    }

    next();
  };
};

// Company-based access control
export const requireCompany = (req, res, next) => {
  if (!req.user || !req.company) {
    return res.status(401).json({ 
      error: 'Company context required',
      code: 'COMPANY_REQUIRED'
    });
  }
  next();
};

// 2FA setup
export const setup2FA = async (userId) => {
  const secret = speakeasy.generateSecret({
    name: 'KoshFlow',
    issuer: 'KoshFlow Accounting',
    length: 32
  });

  // Store secret temporarily (will be confirmed after verification)
  await prisma.user.update({
    where: { id: userId },
    data: { 
      twoFactorSecret: secret.base32,
      twoFactorSecretTemp: secret.base32
    }
  });

  const qrCodeUrl = await qrcode.toDataURL(secret.otpauth_url);
  
  return {
    secret: secret.base32,
    qrCode: qrCodeUrl,
    manualEntryKey: secret.base32
  };
};

// Verify 2FA token
export const verify2FA = (secret, token) => {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2 // Allow 2 time windows for clock skew
  });
};

// Enable 2FA after verification
export const enable2FA = async (userId, token) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user.twoFactorSecretTemp) {
    throw new Error('No pending 2FA setup');
  }

  const isValid = verify2FA(user.twoFactorSecretTemp, token);
  if (!isValid) {
    throw new Error('Invalid 2FA token');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { 
      isTwoFactorEnabled: true,
      twoFactorSecret: user.twoFactorSecretTemp,
      twoFactorSecretTemp: null
    }
  });

  return true;
};

// Disable 2FA
export const disable2FA = async (userId, token) => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user.isTwoFactorEnabled || !user.twoFactorSecret) {
    throw new Error('2FA not enabled');
  }

  const isValid = verify2FA(user.twoFactorSecret, token);
  if (!isValid) {
    throw new Error('Invalid 2FA token');
  }

  await prisma.user.update({
    where: { id: userId },
    data: { 
      isTwoFactorEnabled: false,
      twoFactorSecret: null
    }
  });

  return true;
};

// Refresh token middleware
export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ 
        error: 'Refresh token required',
        code: 'REFRESH_TOKEN_REQUIRED'
      });
    }

    const decoded = verifyToken(refreshToken, TOKEN_TYPES.REFRESH);
    
    // Check if refresh token is blacklisted
    if (await isTokenBlacklisted(decoded.jti)) {
      return res.status(401).json({ 
        error: 'Refresh token has been revoked',
        code: 'REFRESH_TOKEN_REVOKED'
      });
    }

    // Verify session exists
    const session = await prisma.session.findFirst({
      where: {
        userId: decoded.userId,
        token: refreshToken,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!session || !session.user.isActive) {
      return res.status(401).json({ 
        error: 'Invalid refresh token',
        code: 'REFRESH_TOKEN_INVALID'
      });
    }

    // Generate new token pair
    const { accessToken, refreshToken: newRefreshToken } = generateTokenPair(
      decoded.userId, 
      decoded.companyId
    );

    // Blacklist old refresh token
    await blacklistToken(decoded.jti, 7 * 24 * 60 * 60); // 7 days

    // Create new session
    await prisma.session.create({
      data: {
        userId: decoded.userId,
        token: newRefreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      }
    });

    res.json({
      accessToken,
      refreshToken: newRefreshToken,
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || '15m'
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(401).json({ 
      error: 'Invalid refresh token',
      code: 'REFRESH_TOKEN_INVALID'
    });
  }
};

// Logout and revoke tokens
export const logout = async (req, res, next) => {
  try {
    const { allDevices = false } = req.body;
    const userId = req.user?.id;

    if (allDevices) {
      // Revoke all sessions for user
      await prisma.session.deleteMany({
        where: { userId }
      });
    } else {
      // Revoke current session only
      const token = req.token;
      if (token) {
        await prisma.session.deleteMany({
          where: { token }
        });
      }
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Logout failed',
      code: 'LOGOUT_ERROR'
    });
  }
};

export default {
  generateTokenPair,
  verifyToken,
  authenticateToken,
  requireRole,
  requireCompany,
  setup2FA,
  verify2FA,
  enable2FA,
  disable2FA,
  refreshToken,
  logout,
  TOKEN_TYPES
};
