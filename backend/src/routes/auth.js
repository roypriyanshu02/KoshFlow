import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../config/database.js';
import { validateLogin, validateRegister } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Register new company and admin user
router.post('/register', validateRegister, async (req, res) => {
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
      return res.status(400).json({
        error: 'Company already exists',
        message: 'A company with this email already exists'
      });
    }

    // Check if admin email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: adminEmail }
    });

    if (existingUser) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'A user with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

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

    // Generate JWT token
    const token = jwt.sign(
      { userId: result.user.id, companyId: result.company.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Create session
    await prisma.session.create({
      data: {
        userId: result.user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      }
    });

    // Return user and company data (without password)
    const { password: _, ...userWithoutPassword } = result.user;
    const { ...companyWithoutSensitive } = result.company;

    res.status(201).json({
      message: 'Registration successful',
      user: userWithoutPassword,
      company: companyWithoutSensitive,
      accessToken: token,
      refreshToken: token // For now, using same token for both
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: 'Failed to create account. Please try again.'
    });
  }
});

// Login user
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user with company
    const user = await prisma.user.findUnique({
      where: { email },
      include: { company: true }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        error: 'Invalid credentials',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, companyId: user.companyId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      }
    });

    // Return user and company data (without password)
    const { password: _, ...userWithoutPassword } = user;
    const { ...companyWithoutSensitive } = user.company;

    res.json({
      message: 'Login successful',
      user: userWithoutPassword,
      company: companyWithoutSensitive,
      accessToken: token,
      refreshToken: token // For now, using same token for both
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: 'Failed to login. Please try again.'
    });
  }
});

// Get current user profile
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
      message: 'Failed to get user profile'
    });
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      // Delete session
      await prisma.session.deleteMany({
        where: { token }
      });
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: 'Failed to logout'
    });
  }
});

export default router;
