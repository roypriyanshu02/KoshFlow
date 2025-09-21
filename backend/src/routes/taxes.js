import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateTax } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all taxes
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
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(type && { type })
    };

    const [taxes, total] = await Promise.all([
      prisma.tax.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              products: true,
              transactionItems: true
            }
          }
        }
      }),
      prisma.tax.count({ where })
    ]);

    res.json({
      taxes,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get taxes error:', error);
    res.status(500).json({
      error: 'Failed to fetch taxes',
      message: 'Failed to get taxes'
    });
  }
});

// Get single tax
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const tax = await prisma.tax.findFirst({
      where: {
        id,
        companyId: req.user.companyId,
        isActive: true
      },
      include: {
        products: {
          take: 10,
          select: {
            id: true,
            name: true,
            sku: true
          }
        },
        _count: {
          select: {
            products: true,
            transactionItems: true
          }
        }
      }
    });

    if (!tax) {
      return res.status(404).json({
        error: 'Tax not found',
        message: 'The requested tax does not exist'
      });
    }

    res.json({ tax });
  } catch (error) {
    console.error('Get tax error:', error);
    res.status(500).json({
      error: 'Failed to fetch tax',
      message: 'Failed to get tax'
    });
  }
});

// Create new tax
router.post('/', requireRole(['ADMIN', 'ACCOUNTANT']), validateTax, async (req, res) => {
  try {
    const {
      name,
      type,
      rate,
      description,
      isCompound = false
    } = req.body;

    // Check if tax name already exists for this company
    const existingTax = await prisma.tax.findFirst({
      where: {
        companyId: req.user.companyId,
        name,
        isActive: true
      }
    });

    if (existingTax) {
      return res.status(400).json({
        error: 'Tax already exists',
        message: 'A tax with this name already exists'
      });
    }

    const tax = await prisma.tax.create({
      data: {
        companyId: req.user.companyId,
        name,
        type,
        rate: parseFloat(rate),
        description: description || null,
        isCompound
      }
    });

    res.status(201).json({
      message: 'Tax created successfully',
      tax
    });
  } catch (error) {
    console.error('Create tax error:', error);
    res.status(500).json({
      error: 'Failed to create tax',
      message: 'Failed to create tax'
    });
  }
});

// Update tax
router.put('/:id', requireRole(['ADMIN', 'ACCOUNTANT']), validateTax, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      type,
      rate,
      description,
      isCompound
    } = req.body;

    // Check if tax exists and belongs to company
    const existingTax = await prisma.tax.findFirst({
      where: {
        id,
        companyId: req.user.companyId,
        isActive: true
      }
    });

    if (!existingTax) {
      return res.status(404).json({
        error: 'Tax not found',
        message: 'The requested tax does not exist'
      });
    }

    // Check if tax name already exists for another tax
    if (name !== existingTax.name) {
      const duplicateTax = await prisma.tax.findFirst({
        where: {
          companyId: req.user.companyId,
          name,
          isActive: true,
          id: { not: id }
        }
      });

      if (duplicateTax) {
        return res.status(400).json({
          error: 'Tax already exists',
          message: 'A tax with this name already exists'
        });
      }
    }

    const tax = await prisma.tax.update({
      where: { id },
      data: {
        name,
        type,
        rate: parseFloat(rate),
        description: description || null,
        isCompound
      }
    });

    res.json({
      message: 'Tax updated successfully',
      tax
    });
  } catch (error) {
    console.error('Update tax error:', error);
    res.status(500).json({
      error: 'Failed to update tax',
      message: 'Failed to update tax'
    });
  }
});

// Delete tax (soft delete)
router.delete('/:id', requireRole(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if tax exists and belongs to company
    const existingTax = await prisma.tax.findFirst({
      where: {
        id,
        companyId: req.user.companyId,
        isActive: true
      }
    });

    if (!existingTax) {
      return res.status(404).json({
        error: 'Tax not found',
        message: 'The requested tax does not exist'
      });
    }

    // Check if tax has associated products or transaction items
    const [productCount, transactionItemCount] = await Promise.all([
      prisma.product.count({
        where: { defaultTaxId: id }
      }),
      prisma.transactionItem.count({
        where: { taxId: id }
      })
    ]);

    if (productCount > 0 || transactionItemCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete tax',
        message: 'Tax has associated products or transactions and cannot be deleted'
      });
    }

    // Soft delete
    await prisma.tax.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      message: 'Tax deleted successfully'
    });
  } catch (error) {
    console.error('Delete tax error:', error);
    res.status(500).json({
      error: 'Failed to delete tax',
      message: 'Failed to delete tax'
    });
  }
});

export default router;
