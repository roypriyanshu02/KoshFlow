import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateProduct } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all products
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
          { sku: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } }
        ]
      }),
      ...(type && {
        isService: type === 'service'
      })
    };

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          defaultTax: true,
          _count: {
            select: {
              transactionItems: true
            }
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    res.json({
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      message: 'Failed to get products'
    });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findFirst({
      where: {
        id,
        companyId: req.user.companyId,
        isActive: true
      },
      include: {
        defaultTax: true,
        stockMovements: {
          take: 10,
          orderBy: { movementDate: 'desc' }
        },
        _count: {
          select: {
            transactionItems: true
          }
        }
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    res.json({ product });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: 'Failed to fetch product',
      message: 'Failed to get product'
    });
  }
});

// Create new product
router.post('/', requireRole(['ADMIN', 'ACCOUNTANT']), validateProduct, async (req, res) => {
  try {
    const {
      sku,
      name,
      description,
      hsnCode,
      unit = 'Nos',
      salePrice,
      purchasePrice,
      openingStock = 0,
      minStockLevel,
      defaultTaxId,
      isService = false
    } = req.body;

    // Check if SKU already exists for this company
    const existingProduct = await prisma.product.findFirst({
      where: {
        companyId: req.user.companyId,
        sku,
        isActive: true
      }
    });

    if (existingProduct) {
      return res.status(400).json({
        error: 'Product already exists',
        message: 'A product with this SKU already exists'
      });
    }

    // Validate tax if provided
    if (defaultTaxId) {
      const tax = await prisma.tax.findFirst({
        where: {
          id: defaultTaxId,
          companyId: req.user.companyId,
          isActive: true
        }
      });

      if (!tax) {
        return res.status(400).json({
          error: 'Invalid tax',
          message: 'The specified tax does not exist'
        });
      }
    }

    const product = await prisma.product.create({
      data: {
        companyId: req.user.companyId,
        sku,
        name,
        description: description || null,
        hsnCode: hsnCode || null,
        unit,
        salePrice: parseFloat(salePrice),
        purchasePrice: parseFloat(purchasePrice),
        openingStock: parseFloat(openingStock),
        currentStock: parseFloat(openingStock),
        minStockLevel: minStockLevel ? parseFloat(minStockLevel) : null,
        defaultTaxId: defaultTaxId || null,
        isService
      },
      include: {
        defaultTax: true
      }
    });

    // Create initial stock movement
    if (parseFloat(openingStock) > 0) {
      await prisma.stockMovement.create({
        data: {
          productId: product.id,
          movementType: 'IN',
          quantity: parseFloat(openingStock),
          costPrice: parseFloat(purchasePrice),
          balanceQuantity: parseFloat(openingStock),
          notes: 'Opening stock',
          movementDate: new Date()
        }
      });
    }

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      error: 'Failed to create product',
      message: 'Failed to create product'
    });
  }
});

// Update product
router.put('/:id', requireRole(['ADMIN', 'ACCOUNTANT']), validateProduct, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      sku,
      name,
      description,
      hsnCode,
      unit,
      salePrice,
      purchasePrice,
      minStockLevel,
      defaultTaxId,
      isService
    } = req.body;

    // Check if product exists and belongs to company
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        companyId: req.user.companyId,
        isActive: true
      }
    });

    if (!existingProduct) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    // Check if SKU already exists for another product
    if (sku !== existingProduct.sku) {
      const duplicateProduct = await prisma.product.findFirst({
        where: {
          companyId: req.user.companyId,
          sku,
          isActive: true,
          id: { not: id }
        }
      });

      if (duplicateProduct) {
        return res.status(400).json({
          error: 'Product already exists',
          message: 'A product with this SKU already exists'
        });
      }
    }

    // Validate tax if provided
    if (defaultTaxId) {
      const tax = await prisma.tax.findFirst({
        where: {
          id: defaultTaxId,
          companyId: req.user.companyId,
          isActive: true
        }
      });

      if (!tax) {
        return res.status(400).json({
          error: 'Invalid tax',
          message: 'The specified tax does not exist'
        });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        sku,
        name,
        description: description || null,
        hsnCode: hsnCode || null,
        unit,
        salePrice: parseFloat(salePrice),
        purchasePrice: parseFloat(purchasePrice),
        minStockLevel: minStockLevel ? parseFloat(minStockLevel) : null,
        defaultTaxId: defaultTaxId || null,
        isService
      },
      include: {
        defaultTax: true
      }
    });

    res.json({
      message: 'Product updated successfully',
      product
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      error: 'Failed to update product',
      message: 'Failed to update product'
    });
  }
});

// Delete product (soft delete)
router.delete('/:id', requireRole(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists and belongs to company
    const existingProduct = await prisma.product.findFirst({
      where: {
        id,
        companyId: req.user.companyId,
        isActive: true
      }
    });

    if (!existingProduct) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    // Check if product has transaction items
    const transactionItemCount = await prisma.transactionItem.count({
      where: {
        productId: id
      }
    });

    if (transactionItemCount > 0) {
      return res.status(400).json({
        error: 'Cannot delete product',
        message: 'Product has associated transactions and cannot be deleted'
      });
    }

    // Soft delete
    await prisma.product.update({
      where: { id },
      data: { isActive: false }
    });

    res.json({
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      error: 'Failed to delete product',
      message: 'Failed to delete product'
    });
  }
});

// Adjust stock
router.post('/:id/adjust-stock', requireRole(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, type, notes, costPrice } = req.body;

    if (!['IN', 'OUT', 'ADJUSTMENT'].includes(type)) {
      return res.status(400).json({
        error: 'Invalid movement type',
        message: 'Movement type must be IN, OUT, or ADJUSTMENT'
      });
    }

    const product = await prisma.product.findFirst({
      where: {
        id,
        companyId: req.user.companyId,
        isActive: true
      }
    });

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'The requested product does not exist'
      });
    }

    const adjustmentQuantity = parseFloat(quantity);
    let newBalance;

    if (type === 'IN') {
      newBalance = product.currentStock + adjustmentQuantity;
    } else if (type === 'OUT') {
      if (product.currentStock < adjustmentQuantity) {
        return res.status(400).json({
          error: 'Insufficient stock',
          message: 'Not enough stock available for this adjustment'
        });
      }
      newBalance = product.currentStock - adjustmentQuantity;
    } else { // ADJUSTMENT
      newBalance = adjustmentQuantity;
    }

    // Update product stock and create movement record
    const result = await prisma.$transaction(async (tx) => {
      const updatedProduct = await tx.product.update({
        where: { id },
        data: { currentStock: newBalance }
      });

      const stockMovement = await tx.stockMovement.create({
        data: {
          productId: id,
          movementType: type,
          quantity: adjustmentQuantity,
          costPrice: costPrice ? parseFloat(costPrice) : null,
          balanceQuantity: newBalance,
          notes: notes || null,
          movementDate: new Date()
        }
      });

      return { updatedProduct, stockMovement };
    });

    res.json({
      message: 'Stock adjusted successfully',
      product: result.updatedProduct,
      movement: result.stockMovement
    });
  } catch (error) {
    console.error('Adjust stock error:', error);
    res.status(500).json({
      error: 'Failed to adjust stock',
      message: 'Failed to adjust stock'
    });
  }
});

// Get low stock products
router.get('/inventory/low-stock', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      where: {
        companyId: req.user.companyId,
        isActive: true,
        minStockLevel: { not: null },
        currentStock: { lte: prisma.product.fields.minStockLevel }
      },
      include: {
        defaultTax: true
      },
      orderBy: { currentStock: 'asc' }
    });

    res.json({ products });
  } catch (error) {
    console.error('Get low stock products error:', error);
    res.status(500).json({
      error: 'Failed to fetch low stock products',
      message: 'Failed to get low stock products'
    });
  }
});

export default router;
