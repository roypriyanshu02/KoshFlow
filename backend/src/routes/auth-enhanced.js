import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../config/database.js';
import { 
  generateTokenPair, 
  verifyToken, 
  authenticateToken, 
  requireRole,
  setup2FA, 
  verify2FA, 
  enable2FA, 
  disable2FA, 
  refreshToken, 
  logout,
  TOKEN_TYPES 
} from '../middleware/auth-enhanced.js';
import { validate, schemas } from '../middleware/validation-enhanced.js';
import { securityLogger, auditLogger } from '../middleware/logger.js';

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     tags: [Authentication]
 *     summary: Register new company and admin user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - companyName
 *               - companyEmail
 *               - adminName
 *               - adminEmail
 *               - password
 *             properties:
 *               companyName:
 *                 type: string
 *                 description: Company name
 *               companyEmail:
 *                 type: string
 *                 format: email
 *                 description: Company email address
 *               adminName:
 *                 type: string
 *                 description: Admin user name
 *               adminEmail:
 *                 type: string
 *                 format: email
 *                 description: Admin email address
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 description: Password (min 8 chars, must contain uppercase, lowercase, number, and special character)
 *               phone:
 *                 type: string
 *                 description: Phone number
 *               gstin:
 *                 type: string
 *                 description: GSTIN number
 *               pan:
 *                 type: string
 *                 description: PAN number
 *     responses:
 *       201:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 company:
 *                   $ref: '#/components/schemas/Company'
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         description: Company or user already exists
 */
router.post('/register', validate(schemas.register), async (req, res) => {
  try {
    const {
      companyName,
      companyEmail,
      adminName,
      adminEmail,
      password,
      phone,
      gstin,
      pan
    } = req.body;

    // Check if company email already exists
    const existingCompany = await prisma.company.findUnique({
      where: { email: companyEmail }
    });

    if (existingCompany) {
      securityLogger.suspiciousActivity(req.ip, null, 'DUPLICATE_COMPANY_REGISTRATION', { email: companyEmail });
      return res.status(409).json({
        error: 'Company already exists',
        message: 'A company with this email already exists',
        code: 'COMPANY_EXISTS'
      });
    }

    // Check if admin email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: adminEmail }
    });

    if (existingUser) {
      securityLogger.suspiciousActivity(req.ip, null, 'DUPLICATE_USER_REGISTRATION', { email: adminEmail });
      return res.status(409).json({
        error: 'User already exists',
        message: 'A user with this email already exists',
        code: 'USER_EXISTS'
      });
    }

    // Hash password with higher salt rounds for better security
    const hashedPassword = await bcrypt.hash(password, 14);

    // Create company and admin user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create company
      const company = await tx.company.create({
        data: {
          name: companyName,
          email: companyEmail,
          phone: phone || null,
          gstin: gstin || null,
          pan: pan || null,
        }
      });

      // Create admin user
      const user = await tx.user.create({
        data: {
          companyId: company.id,
          email: adminEmail,
          password: hashedPassword,
          name: adminName,
          phone: phone || null,
          role: 'ADMIN',
        }
      });

      return { company, user };
    });

    // Generate token pair
    const { accessToken, refreshToken } = generateTokenPair(
      result.user.id, 
      result.company.id
    );

    // Create session
    await prisma.session.create({
      data: {
        userId: result.user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      }
    });

    // Log successful registration
    securityLogger.loginSuccess(req.ip, adminEmail, result.user.id, req.get('User-Agent'));
    auditLogger.create(result.user.id, 'COMPANY_REGISTERED', 'COMPANY', { companyId: result.company.id });

    // Return user and company data (without password)
    const { password: _, ...userWithoutPassword } = result.user;
    const { ...companyWithoutSensitive } = result.company;

    res.status(201).json({
      message: 'Registration successful',
      user: userWithoutPassword,
      company: companyWithoutSensitive,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    securityLogger.suspiciousActivity(req.ip, null, 'REGISTRATION_ERROR', { error: error.message });
    res.status(500).json({
      error: 'Registration failed',
      message: 'Failed to create account. Please try again.',
      code: 'REGISTRATION_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     tags: [Authentication]
 *     summary: Login user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *               password:
 *                 type: string
 *                 description: User password
 *               twoFactorCode:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 description: 2FA code (required if 2FA is enabled)
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 company:
 *                   $ref: '#/components/schemas/Company'
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Account temporarily locked
 */
router.post('/login', validate(schemas.login), async (req, res) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    // Find user with company
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });

    if (!user || !user.isActive) {
      securityLogger.loginFailure(req.ip, email, 'USER_NOT_FOUND_OR_INACTIVE', req.get('User-Agent'));
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      securityLogger.loginFailure(req.ip, email, 'INVALID_PASSWORD', req.get('User-Agent'));
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check 2FA if enabled
    if (user.isTwoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          message: '2FA code required',
          requires2FA: true,
          code: '2FA_REQUIRED'
        });
      }

      const isValid2FA = verify2FA(user.twoFactorSecret, twoFactorCode);
      if (!isValid2FA) {
        securityLogger.loginFailure(req.ip, email, 'INVALID_2FA_CODE', req.get('User-Agent'));
        return res.status(401).json({
          error: 'Invalid 2FA code',
          message: 'The 2FA code provided is invalid',
          code: 'INVALID_2FA_CODE'
        });
      }
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate token pair
    const { accessToken, refreshToken } = generateTokenPair(
      user.id, 
      user.companyId
    );

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      }
    });

    // Log successful login
    securityLogger.loginSuccess(req.ip, email, user.id, req.get('User-Agent'));
    auditLogger.access(user.id, 'LOGIN', 'USER', req.ip, req.get('User-Agent'));

    // Return user and company data (without password)
    const { password: _, ...userWithoutPassword } = user;
    const { ...companyWithoutSensitive } = user.company;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      company: companyWithoutSensitive,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    securityLogger.suspiciousActivity(req.ip, req.body.email, 'LOGIN_ERROR', { error: error.message });
    res.status(500).json({
      error: 'Login failed',
      message: 'Failed to login. Please try again.',
      code: 'LOGIN_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     tags: [Authentication]
 *     summary: Refresh access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *                 expiresIn:
 *                   type: string
 *       401:
 *         description: Invalid refresh token
 */
router.post('/refresh', refreshToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     tags: [Authentication]
 *     summary: Logout user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               allDevices:
 *                 type: boolean
 *                 description: Whether to logout from all devices
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authenticateToken, logout);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     tags: [Authentication]
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 company:
 *                   $ref: '#/components/schemas/Company'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const { password: _, ...userWithoutPassword } = req.user;
    const { ...companyWithoutSensitive } = req.company;

    res.json({
      user: userWithoutPassword,
      company: companyWithoutSensitive
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: 'Failed to get user profile',
      code: 'PROFILE_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/auth/2fa/setup:
 *   post:
 *     tags: [Authentication]
 *     summary: Setup 2FA for user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/setup2FA'
 *     responses:
 *       200:
 *         description: 2FA setup initiated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 secret:
 *                   type: string
 *                 qrCode:
 *                   type: string
 *                 manualEntryKey:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post('/2fa/setup', authenticateToken, validate(schemas.setup2FA), async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    // Verify password
    const isValidPassword = await bcrypt.compare(password, req.user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid password',
        message: 'Password is incorrect',
        code: 'INVALID_PASSWORD'
      });
    }

    const result = await setup2FA(userId);
    
    securityLogger.twoFactorSetup(userId, req.ip, true);
    auditLogger.create(userId, '2FA_SETUP_INITIATED', 'USER', { userId });

    res.json(result);
  } catch (error) {
    console.error('2FA setup error:', error);
    res.status(500).json({
      error: '2FA setup failed',
      message: 'Failed to setup 2FA. Please try again.',
      code: '2FA_SETUP_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/auth/2fa/verify:
 *   post:
 *     tags: [Authentication]
 *     summary: Verify and enable 2FA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/verify2FA'
 *     responses:
 *       200:
 *         description: 2FA enabled successfully
 *       400:
 *         description: Invalid 2FA code
 */
router.post('/2fa/verify', authenticateToken, validate(schemas.verify2FA), async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    await enable2FA(userId, token);
    
    securityLogger.twoFactorSetup(userId, req.ip, true);
    auditLogger.create(userId, '2FA_ENABLED', 'USER', { userId });

    res.json({
      message: '2FA enabled successfully',
      enabled: true
    });
  } catch (error) {
    console.error('2FA verification error:', error);
    res.status(400).json({
      error: '2FA verification failed',
      message: error.message,
      code: '2FA_VERIFICATION_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/auth/2fa/disable:
 *   post:
 *     tags: [Authentication]
 *     summary: Disable 2FA
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/verify2FA'
 *     responses:
 *       200:
 *         description: 2FA disabled successfully
 *       400:
 *         description: Invalid 2FA code
 */
router.post('/2fa/disable', authenticateToken, validate(schemas.verify2FA), async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.id;

    await disable2FA(userId, token);
    
    securityLogger.twoFactorSetup(userId, req.ip, true);
    auditLogger.create(userId, '2FA_DISABLED', 'USER', { userId });

    res.json({
      message: '2FA disabled successfully',
      enabled: false
    });
  } catch (error) {
    console.error('2FA disable error:', error);
    res.status(400).json({
      error: '2FA disable failed',
      message: error.message,
      code: '2FA_DISABLE_ERROR'
    });
  }
});

/**
 * @swagger
 * /api/auth/change-password:
 *   post:
 *     tags: [Authentication]
 *     summary: Change user password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/changePassword'
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid current password or validation error
 */
router.post('/change-password', authenticateToken, validate(schemas.changePassword), async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, req.user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        error: 'Invalid current password',
        message: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 14);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedNewPassword }
    });

    // Invalidate all sessions except current one
    await prisma.session.deleteMany({
      where: {
        userId,
        token: { not: req.token }
      }
    });

    securityLogger.passwordChange(userId, req.ip, true);
    auditLogger.create(userId, 'PASSWORD_CHANGED', 'USER', { userId });

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({
      error: 'Password change failed',
      message: 'Failed to change password. Please try again.',
      code: 'PASSWORD_CHANGE_ERROR'
    });
  }
});

export default router;
