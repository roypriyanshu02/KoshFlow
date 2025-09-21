import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Test database client
export const testPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://username:password@localhost:5432/koshflow_test?schema=public'
    }
  }
});

// Test data factories
export const createTestCompany = async (overrides = {}) => {
  const defaultData = {
    name: 'Test Company',
    email: 'test@company.com',
    phone: '+919876543210',
    gstin: '29ABCDE1234F1Z5',
    pan: 'ABCDE1234F'
  };

  return await testPrisma.company.create({
    data: { ...defaultData, ...overrides }
  });
};

export const createTestUser = async (companyId, overrides = {}) => {
  const defaultData = {
    companyId,
    email: 'test@user.com',
    password: await bcrypt.hash('password123', 12),
    name: 'Test User',
    phone: '+919876543210',
    role: 'ADMIN',
    isActive: true
  };

  return await testPrisma.user.create({
    data: { ...defaultData, ...overrides }
  });
};

export const createTestContact = async (companyId, overrides = {}) => {
  const defaultData = {
    companyId,
    name: 'Test Contact',
    email: 'contact@test.com',
    phone: '+919876543210',
    isCustomer: true,
    isVendor: false
  };

  return await testPrisma.contact.create({
    data: { ...defaultData, ...overrides }
  });
};

export const createTestProduct = async (companyId, overrides = {}) => {
  const defaultData = {
    companyId,
    sku: 'TEST-SKU-001',
    name: 'Test Product',
    description: 'Test product description',
    salePrice: 100.00,
    purchasePrice: 80.00,
    unit: 'pcs',
    hsnCode: '1234',
    isService: false,
    trackInventory: true,
    currentStock: 100,
    minStockLevel: 10
  };

  return await testPrisma.product.create({
    data: { ...defaultData, ...overrides }
  });
};

// Generate test JWT token
export const generateTestToken = (userId, companyId, expiresIn = '1h') => {
  return jwt.sign(
    { userId, companyId, type: 'access' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn }
  );
};

// Clean up test data
export const cleanupTestData = async () => {
  // Delete in reverse order of dependencies
  await testPrisma.session.deleteMany();
  await testPrisma.auditLog.deleteMany();
  await testPrisma.notification.deleteMany();
  await testPrisma.ledgerEntry.deleteMany();
  await testPrisma.transactionItem.deleteMany();
  await testPrisma.transaction.deleteMany();
  await testPrisma.product.deleteMany();
  await testPrisma.contact.deleteMany();
  await testPrisma.account.deleteMany();
  await testPrisma.tax.deleteMany();
  await testPrisma.user.deleteMany();
  await testPrisma.company.deleteMany();
};

// Setup test environment
export const setupTestEnvironment = async () => {
  // Clean up any existing test data
  await cleanupTestData();
  
  // Create test company
  const company = await createTestCompany();
  
  // Create test admin user
  const adminUser = await createTestUser(company.id, {
    email: 'admin@test.com',
    role: 'ADMIN'
  });
  
  // Create test accountant user
  const accountantUser = await createTestUser(company.id, {
    email: 'accountant@test.com',
    role: 'ACCOUNTANT'
  });
  
  // Create test viewer user
  const viewerUser = await createTestUser(company.id, {
    email: 'viewer@test.com',
    role: 'VIEWER'
  });
  
  return {
    company,
    adminUser,
    accountantUser,
    viewerUser
  };
};

// Test utilities
export const expectValidationError = (response, expectedFields = []) => {
  expect(response.status).toBe(400);
  expect(response.body.error).toBe('Validation failed');
  expect(response.body.details).toBeDefined();
  
  if (expectedFields.length > 0) {
    const fieldNames = response.body.details.map(detail => detail.field);
    expectedFields.forEach(field => {
      expect(fieldNames).toContain(field);
    });
  }
};

export const expectUnauthorizedError = (response) => {
  expect(response.status).toBe(401);
  expect(response.body.error).toBeDefined();
  expect(response.body.code).toBeDefined();
};

export const expectForbiddenError = (response) => {
  expect(response.status).toBe(403);
  expect(response.body.error).toBe('Insufficient permissions');
  expect(response.body.code).toBe('INSUFFICIENT_PERMISSIONS');
};

export const expectNotFoundError = (response) => {
  expect(response.status).toBe(404);
  expect(response.body.error).toBeDefined();
};

export const expectRateLimitError = (response) => {
  expect(response.status).toBe(429);
  expect(response.body.error).toBe('Too many requests');
};

// Mock functions for testing
export const mockRequest = (overrides = {}) => ({
  body: {},
  query: {},
  params: {},
  headers: {},
  ip: '127.0.0.1',
  get: jest.fn(),
  ...overrides
});

export const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.end = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  res.removeHeader = jest.fn().mockReturnValue(res);
  return res;
};

export const mockNext = jest.fn();

// Test database connection
export const testDatabaseConnection = async () => {
  try {
    await testPrisma.$connect();
    console.log('✅ Test database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Test database connection failed:', error);
    return false;
  }
};

// Close test database connection
export const closeTestDatabase = async () => {
  await testPrisma.$disconnect();
};

export default {
  testPrisma,
  createTestCompany,
  createTestUser,
  createTestContact,
  createTestProduct,
  generateTestToken,
  cleanupTestData,
  setupTestEnvironment,
  expectValidationError,
  expectUnauthorizedError,
  expectForbiddenError,
  expectNotFoundError,
  expectRateLimitError,
  mockRequest,
  mockResponse,
  mockNext,
  testDatabaseConnection,
  closeTestDatabase
};
