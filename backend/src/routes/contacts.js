import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateContact } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all contacts
router.get('/', async (req, res) => {
  try {
    const { search, type, page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      companyId: req.user.companyId,
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } }
        ]
      }),
      ...(type && {
        ...(type === 'customer' && { isCustomer: true }),
        ...(type === 'vendor' && { isVendor: true }),
        ...(type === 'both' && { isCustomer: true, isVendor: true })
      })
    };

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              transactions: true
            }
          }
        }
      }),
      prisma.contact.count({ where })
    ]);

    res.json({
      contacts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({
      error: 'Failed to fetch contacts',
      message: 'Failed to get contacts'
    });
  }
});

// Get single contact
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await prisma.contact.findFirst({
      where: {
        id,
        companyId: req.user.companyId,
        isActive: true
      },
      include: {
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            transactionNumber: true,
            type: true,
            status: true,
            totalAmount: true,
            date: true
          }
        },
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });

    if (!contact) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'The requested contact does not exist'
      });
    }

    res.json({ contact });
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({
      error: 'Failed to fetch contact',
      message: 'Failed to get contact'
    });
  }
});

// Create new contact
router.post('/', requireRole(['ADMIN', 'ACCOUNTANT']), validateContact, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      isCustomer = false,
      isVendor = false,
      city,
      state,
      pincode,
      country = 'India',
      gstin,
      pan,
      creditLimit,
      creditDays = 30,
      address,
      notes
    } = req.body;

    // Check if email already exists for this company
    if (email) {
      const existingContact = await prisma.contact.findFirst({
        where: {
          companyId: req.user.companyId,
          email,
          isActive: true
        }
      });

      if (existingContact) {
        return res.status(400).json({
          error: 'Contact already exists',
          message: 'A contact with this email already exists'
        });
      }
    }

    const contact = await prisma.contact.create({
      data: {
        companyId: req.user.companyId,
        name,
        email: email || null,
        phone: phone || null,
        isCustomer,
        isVendor,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        country,
        gstin: gstin || null,
        pan: pan || null,
        creditLimit: creditLimit ? parseFloat(creditLimit) : null,
        creditDays,
        address: address || null,
        notes: notes || null
      }
    });

    res.status(201).json({
      message: 'Contact created successfully',
      contact
    });
  } catch (error) {
    console.error('Create contact error:', error);
    res.status(500).json({
      error: 'Failed to create contact',
      message: 'Failed to create contact'
    });
  }
});

// Update contact
router.put('/:id', requireRole(['ADMIN', 'ACCOUNTANT']), validateContact, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      phone,
      isCustomer,
      isVendor,
      city,
      state,
      pincode,
      country,
      gstin,
      pan,
      creditLimit,
      creditDays,
      address,
      notes
    } = req.body;

    // Check if contact exists and belongs to company
    const existingContact = await prisma.contact.findFirst({
      where: {
        id,
        companyId: req.user.companyId,
        isActive: true
      }
    });

    if (!existingContact) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'The requested contact does not exist'
      });
    }

    // Check if email already exists for another contact
    if (email && email !== existingContact.email) {
      const duplicateContact = await prisma.contact.findFirst({
        where: {
          companyId: req.user.companyId,
          email,
          isActive: true,
          id: { not: id }
        }
      });

      if (duplicateContact) {
        return res.status(400).json({
          error: 'Contact already exists',
          message: 'A contact with this email already exists'
        });
      }
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: {
        name,
        email: email || null,
        phone: phone || null,
        isCustomer,
        isVendor,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        country,
        gstin: gstin || null,
        pan: pan || null,
        creditLimit: creditLimit ? parseFloat(creditLimit) : null,
        creditDays,
        address: address || null,
        notes: notes || null
      }
    });

    res.json({
      message: 'Contact updated successfully',
      contact
    });
  } catch (error) {
    console.error('Update contact error:', error);
    res.status(500).json({
      error: 'Failed to update contact',
      message: 'Failed to update contact'
    });
  }
});

// Delete contact (soft delete)
router.delete('/:id', requireRole(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if contact exists and belongs to company
    const existingContact = await prisma.contact.findFirst({
      where: {
        id,
        companyId: req.user.companyId,
        isActive: true
      }
    });

    if (!existingContact) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'The requested contact does not exist'
      });
    }

    // Check if contact has transactions
    const transactionCount = await prisma.transaction.count({
      where: {
        contactId: id,
        companyId: req.user.companyId
      }
    });

    if (transactionCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete contact',
        message: 'Contact has associated transactions and cannot be deleted'
      });
    }

    // Soft delete
    await prisma.contact.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      message: 'Contact deleted successfully'
    });
  } catch (error) {
    console.error('Delete contact error:', error);
    res.status(500).json({
      error: 'Failed to delete contact',
      message: 'Failed to delete contact'
    });
  }
});

// Get contact summary
router.get('/:id/summary', async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await prisma.contact.findFirst({
      where: {
        id,
        companyId: req.user.companyId,
        isActive: true
      }
    });

    if (!contact) {
      return res.status(404).json({
        error: 'Contact not found',
        message: 'The requested contact does not exist'
      });
    }

    // Get transaction summary
    const [transactionStats, recentTransactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          contactId: id,
          companyId: req.user.companyId
        },
        _sum: {
          totalAmount: true,
          paidAmount: true
        },
        _count: true
      }),
      prisma.transaction.findMany({
        where: {
          contactId: id,
          companyId: req.user.companyId
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          transactionNumber: true,
          type: true,
          status: true,
          totalAmount: true,
          date: true
        }
      })
    ]);

    const totalAmount = transactionStats._sum.totalAmount || 0;
    const paidAmount = transactionStats._sum.paidAmount || 0;
    const balanceAmount = totalAmount - paidAmount;

    res.json({
      contact,
      summary: {
        totalTransactions: transactionStats._count,
        totalAmount,
        paidAmount,
        balanceAmount,
        recentTransactions
      }
    });
  } catch (error) {
    console.error('Get contact summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch contact summary',
      message: 'Failed to get contact summary'
    });
  }
});

export default router;
