import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateAccount } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all accounts
router.get('/', async (req, res) => {
  try {
    const { type, parentId, page = 1, limit = 100 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      companyId: req.user.companyId,
      isActive: true,
      ...(type && { type }),
      ...(parentId && { parentId })
    };

    const [accounts, total] = await Promise.all([
      prisma.account.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { code: 'asc' },
        include: {
          parent: {
            select: {
              id: true,
              name: true,
              code: true
            }
          },
          children: {
            select: {
              id: true,
              name: true,
              code: true,
              currentBalance: true
            },
            orderBy: { code: 'asc' }
          },
          _count: {
            select: {
              children: true,
              ledgerEntries: true
            }
          }
        }
      }),
      prisma.account.count({ where })
    ]);

    res.json({
      accounts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({
      error: 'Failed to fetch accounts',
      message: 'Failed to get accounts'
    });
  }
});

// Get single account
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const account = await prisma.account.findFirst({
      where: {
        id,
        companyId: req.user.companyId,
        isActive: true
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true
          }
        },
        children: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            currentBalance: true
          },
          orderBy: { code: 'asc' }
        },
        ledgerEntries: {
          take: 20,
          orderBy: { date: 'desc' },
          include: {
            transaction: {
              select: {
                id: true,
                transactionNumber: true,
                type: true
              }
            }
          }
        },
        _count: {
          select: {
            children: true,
            ledgerEntries: true
          }
        }
      }
    });

    if (!account) {
      return res.status(404).json({
        error: 'Account not found',
        message: 'The requested account does not exist'
      });
    }

    res.json({ account });
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({
      error: 'Failed to fetch account',
      message: 'Failed to get account'
    });
  }
});

// Create new account
router.post('/', requireRole(['ADMIN', 'ACCOUNTANT']), validateAccount, async (req, res) => {
  try {
    const {
      code,
      name,
      type,
      parentId,
      description,
      openingBalance = 0
    } = req.body;

    // Check if account code already exists for this company
    const existingAccount = await prisma.account.findFirst({
      where: {
        companyId: req.user.companyId,
        code,
        isActive: true
      }
    });

    if (existingAccount) {
      return res.status(400).json({
        error: 'Account already exists',
        message: 'An account with this code already exists'
      });
    }

    // Validate parent account if provided
    if (parentId) {
      const parentAccount = await prisma.account.findFirst({
        where: {
          id: parentId,
          companyId: req.user.companyId,
          isActive: true
        }
      });

      if (!parentAccount) {
        return res.status(400).json({
          error: 'Invalid parent account',
          message: 'The specified parent account does not exist'
        });
      }
    }

    const account = await prisma.account.create({
      data: {
        companyId: req.user.companyId,
        code,
        name,
        type,
        parentId: parentId || null,
        description: description || null,
        openingBalance: parseFloat(openingBalance),
        currentBalance: parseFloat(openingBalance)
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Account created successfully',
      account
    });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({
      error: 'Failed to create account',
      message: 'Failed to create account'
    });
  }
});

// Update account
router.put('/:id', requireRole(['ADMIN', 'ACCOUNTANT']), validateAccount, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      type,
      parentId,
      description
    } = req.body;

    // Check if account exists and belongs to company
    const existingAccount = await prisma.account.findFirst({
      where: {
        id,
        companyId: req.user.companyId,
        isActive: true
      }
    });

    if (!existingAccount) {
      return res.status(404).json({
        error: 'Account not found',
        message: 'The requested account does not exist'
      });
    }

    // Check if account code already exists for another account
    if (code !== existingAccount.code) {
      const duplicateAccount = await prisma.account.findFirst({
        where: {
          companyId: req.user.companyId,
          code,
          isActive: true,
          id: { not: id }
        }
      });

      if (duplicateAccount) {
        return res.status(400).json({
          error: 'Account already exists',
          message: 'An account with this code already exists'
        });
      }
    }

    // Validate parent account if provided
    if (parentId && parentId !== existingAccount.parentId) {
      const parentAccount = await prisma.account.findFirst({
        where: {
          id: parentId,
          companyId: req.user.companyId,
          isActive: true
        }
      });

      if (!parentAccount) {
        return res.status(400).json({
          error: 'Invalid parent account',
          message: 'The specified parent account does not exist'
        });
      }

      // Prevent circular references
      if (parentId === id) {
        return res.status(400).json({
          error: 'Invalid parent account',
          message: 'Account cannot be its own parent'
        });
      }
    }

    const account = await prisma.account.update({
      where: { id },
      data: {
        code,
        name,
        type,
        parentId: parentId || null,
        description: description || null
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    });

    res.json({
      message: 'Account updated successfully',
      account
    });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({
      error: 'Failed to update account',
      message: 'Failed to update account'
    });
  }
});

// Delete account (soft delete)
router.delete('/:id', requireRole(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if account exists and belongs to company
    const existingAccount = await prisma.account.findFirst({
      where: {
        id,
        companyId: req.user.companyId,
        isActive: true
      }
    });

    if (!existingAccount) {
      return res.status(404).json({
        error: 'Account not found',
        message: 'The requested account does not exist'
      });
    }

    // Check if account is a system account
    if (existingAccount.isSystemAccount) {
      return res.status(400).json({
        error: 'Cannot delete account',
        message: 'System accounts cannot be deleted'
      });
    }

    // Check if account has children
    const childrenCount = await prisma.account.count({
      where: {
        parentId: id,
        isActive: true
      }
    });

    if (childrenCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete account',
        message: 'Account has child accounts and cannot be deleted'
      });
    }

    // Check if account has ledger entries
    const ledgerEntryCount = await prisma.ledgerEntry.count({
      where: { accountId: id }
    });

    if (ledgerEntryCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete account',
        message: 'Account has ledger entries and cannot be deleted'
      });
    }

    // Soft delete
    await prisma.account.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      error: 'Failed to delete account',
      message: 'Failed to delete account'
    });
  }
});

// Get account hierarchy
router.get('/hierarchy/tree', async (req, res) => {
  try {
    const accounts = await prisma.account.findMany({
      where: {
        companyId: req.user.companyId,
        isActive: true
      },
      orderBy: { code: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        type: true,
        parentId: true,
        currentBalance: true,
        isSystemAccount: true
      }
    });

    // Build hierarchy tree
    const accountMap = new Map();
    const rootAccounts = [];

    // Create map of all accounts
    accounts.forEach(account => {
      accountMap.set(account.id, { ...account, children: [] });
    });

    // Build tree structure
    accounts.forEach(account => {
      if (account.parentId) {
        const parent = accountMap.get(account.parentId);
        if (parent) {
          parent.children.push(accountMap.get(account.id));
        }
      } else {
        rootAccounts.push(accountMap.get(account.id));
      }
    });

    res.json({ accounts: rootAccounts });
  } catch (error) {
    console.error('Get account hierarchy error:', error);
    res.status(500).json({
      error: 'Failed to fetch account hierarchy',
      message: 'Failed to get account hierarchy'
    });
  }
});

// Get account balance
router.get('/:id/balance', async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const account = await prisma.account.findFirst({
      where: {
        id,
        companyId: req.user.companyId,
        isActive: true
      }
    });

    if (!account) {
      return res.status(404).json({
        error: 'Account not found',
        message: 'The requested account does not exist'
      });
    }

    const where = {
      accountId: id,
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where,
      orderBy: { date: 'asc' }
    });

    const totalDebit = ledgerEntries.reduce((sum, entry) => sum + parseFloat(entry.debitAmount), 0);
    const totalCredit = ledgerEntries.reduce((sum, entry) => sum + parseFloat(entry.creditAmount), 0);
    
    let balance;
    if (account.type === 'ASSET' || account.type === 'EXPENSE') {
      balance = totalDebit - totalCredit;
    } else {
      balance = totalCredit - totalDebit;
    }

    res.json({
      account: {
        id: account.id,
        name: account.name,
        code: account.code,
        type: account.type
      },
      balance,
      totalDebit,
      totalCredit,
      entryCount: ledgerEntries.length,
      period: {
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      }
    });
  } catch (error) {
    console.error('Get account balance error:', error);
    res.status(500).json({
      error: 'Failed to fetch account balance',
      message: 'Failed to get account balance'
    });
  }
});

export default router;
