import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';
import { validateTransaction } from '../middleware/validation.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get all transactions
router.get('/', async (req, res) => {
  try {
    const { 
      type, 
      status, 
      contactId, 
      startDate, 
      endDate, 
      page = 1, 
      limit = 50,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      companyId: req.user.companyId,
      ...(type && { type }),
      ...(status && { status }),
      ...(contactId && { contactId }),
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const orderBy = {};
    orderBy[sortBy] = sortOrder;

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy,
        include: {
          contact: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          createdBy: {
            select: {
              id: true,
              name: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true
                }
              }
            }
          }
        }
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({
      error: 'Failed to fetch transactions',
      message: 'Failed to get transactions'
    });
  }
});

// Get single transaction
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        companyId: req.user.companyId
      },
      include: {
        contact: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approvedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true,
                unit: true
              }
            },
            tax: true
          },
          orderBy: { sortOrder: 'asc' }
        },
        payments: {
          orderBy: { paymentDate: 'desc' }
        },
        parent: {
          select: {
            id: true,
            transactionNumber: true,
            type: true
          }
        },
        children: {
          select: {
            id: true,
            transactionNumber: true,
            type: true,
            status: true
          }
        }
      }
    });

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'The requested transaction does not exist'
      });
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({
      error: 'Failed to fetch transaction',
      message: 'Failed to get transaction'
    });
  }
});

// Create new transaction
router.post('/', requireRole(['ADMIN', 'ACCOUNTANT']), validateTransaction, async (req, res) => {
  try {
    const {
      type,
      contactId,
      date = new Date(),
      dueDate,
      referenceNumber,
      parentId,
      items,
      notes,
      termsAndConditions
    } = req.body;

    // Validate contact if provided
    if (contactId) {
      const contact = await prisma.contact.findFirst({
        where: {
          id: contactId,
          companyId: req.user.companyId,
          isActive: true
        }
      });

      if (!contact) {
        return res.status(400).json({
          error: 'Invalid contact',
          message: 'The specified contact does not exist'
        });
      }
    }

    // Validate parent transaction if provided
    if (parentId) {
      const parentTransaction = await prisma.transaction.findFirst({
        where: {
          id: parentId,
          companyId: req.user.companyId
        }
      });

      if (!parentTransaction) {
        return res.status(400).json({
          error: 'Invalid parent transaction',
          message: 'The specified parent transaction does not exist'
        });
      }
    }

    // Generate transaction number
    const transactionCount = await prisma.transaction.count({
      where: {
        companyId: req.user.companyId,
        type
      }
    });

    const typePrefix = {
      'SALES_ORDER': 'SO',
      'PURCHASE_ORDER': 'PO',
      'INVOICE': 'INV',
      'BILL': 'BILL',
      'PAYMENT': 'PAY',
      'RECEIPT': 'RCP',
      'JOURNAL': 'JRN'
    };

    const prefix = typePrefix[type] || 'TXN';
    const transactionNumber = `${prefix}-${new Date().getFullYear()}-${String(transactionCount + 1).padStart(3, '0')}`;

    // Calculate totals
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    const processedItems = items.map((item, index) => {
      const itemSubtotal = parseFloat(item.quantity) * parseFloat(item.rate);
      const itemDiscount = item.discountAmount || (itemSubtotal * (parseFloat(item.discountPercent) || 0) / 100);
      const itemTax = item.taxAmount || 0;
      const itemTotal = itemSubtotal - itemDiscount + itemTax;

      subtotal += itemSubtotal;
      discountAmount += itemDiscount;
      taxAmount += itemTax;

      return {
        ...item,
        quantity: parseFloat(item.quantity),
        rate: parseFloat(item.rate),
        discountAmount: itemDiscount,
        taxAmount: itemTax,
        amount: itemTotal,
        sortOrder: index
      };
    });

    const totalAmount = subtotal - discountAmount + taxAmount;

    // Create transaction with items
    const transaction = await prisma.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          companyId: req.user.companyId,
          transactionNumber,
          type,
          status: 'DRAFT',
          contactId: contactId || null,
          date: new Date(date),
          dueDate: dueDate ? new Date(dueDate) : null,
          referenceNumber: referenceNumber || null,
          parentId: parentId || null,
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount,
          balanceAmount: totalAmount,
          notes: notes || null,
          termsAndConditions: termsAndConditions || null,
          createdById: req.user.id
        }
      });

      // Create transaction items
      await tx.transactionItem.createMany({
        data: processedItems.map(item => ({
          transactionId: newTransaction.id,
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || 'Nos',
          rate: item.rate,
          discountPercent: parseFloat(item.discountPercent) || 0,
          discountAmount: item.discountAmount,
          taxId: item.taxId || null,
          taxAmount: item.taxAmount,
          amount: item.amount,
          notes: item.notes || null,
          sortOrder: item.sortOrder
        }))
      });

      return newTransaction;
    });

    // Fetch the complete transaction with relations
    const completeTransaction = await prisma.transaction.findUnique({
      where: { id: transaction.id },
      include: {
        contact: true,
        createdBy: {
          select: {
            id: true,
            name: true
          }
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                sku: true
              }
            },
            tax: true
          }
        }
      }
    });

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction: completeTransaction
    });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      error: 'Failed to create transaction',
      message: 'Failed to create transaction'
    });
  }
});

// Update transaction
router.put('/:id', requireRole(['ADMIN', 'ACCOUNTANT']), validateTransaction, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      contactId,
      date,
      dueDate,
      referenceNumber,
      items,
      notes,
      termsAndConditions
    } = req.body;

    // Check if transaction exists and belongs to company
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        id,
        companyId: req.user.companyId
      }
    });

    if (!existingTransaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'The requested transaction does not exist'
      });
    }

    // Check if transaction can be modified
    if (['SENT', 'ACCEPTED', 'PAID'].includes(existingTransaction.status)) {
      return res.status(400).json({
        error: 'Cannot modify transaction',
        message: 'Transaction cannot be modified in its current status'
      });
    }

    // Validate contact if provided
    if (contactId) {
      const contact = await prisma.contact.findFirst({
        where: {
          id: contactId,
          companyId: req.user.companyId,
          isActive: true
        }
      });

      if (!contact) {
        return res.status(400).json({
          error: 'Invalid contact',
          message: 'The specified contact does not exist'
        });
      }
    }

    // Calculate new totals
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    const processedItems = items.map((item, index) => {
      const itemSubtotal = parseFloat(item.quantity) * parseFloat(item.rate);
      const itemDiscount = item.discountAmount || (itemSubtotal * (parseFloat(item.discountPercent) || 0) / 100);
      const itemTax = item.taxAmount || 0;
      const itemTotal = itemSubtotal - itemDiscount + itemTax;

      subtotal += itemSubtotal;
      discountAmount += itemDiscount;
      taxAmount += itemTax;

      return {
        ...item,
        quantity: parseFloat(item.quantity),
        rate: parseFloat(item.rate),
        discountAmount: itemDiscount,
        taxAmount: itemTax,
        amount: itemTotal,
        sortOrder: index
      };
    });

    const totalAmount = subtotal - discountAmount + taxAmount;
    const balanceAmount = totalAmount - existingTransaction.paidAmount;

    // Update transaction and items
    const transaction = await prisma.$transaction(async (tx) => {
      // Update transaction
      const updatedTransaction = await tx.transaction.update({
        where: { id },
        data: {
          contactId: contactId || null,
          date: date ? new Date(date) : existingTransaction.date,
          dueDate: dueDate ? new Date(dueDate) : existingTransaction.dueDate,
          referenceNumber: referenceNumber || null,
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount,
          balanceAmount,
          notes: notes || null,
          termsAndConditions: termsAndConditions || null
        }
      });

      // Delete existing items
      await tx.transactionItem.deleteMany({
        where: { transactionId: id }
      });

      // Create new items
      await tx.transactionItem.createMany({
        data: processedItems.map(item => ({
          transactionId: id,
          productId: item.productId || null,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit || 'Nos',
          rate: item.rate,
          discountPercent: parseFloat(item.discountPercent) || 0,
          discountAmount: item.discountAmount,
          taxId: item.taxId || null,
          taxAmount: item.taxAmount,
          amount: item.amount,
          notes: item.notes || null,
          sortOrder: item.sortOrder
        }))
      });

      return updatedTransaction;
    });

    res.json({
      message: 'Transaction updated successfully',
      transaction
    });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({
      error: 'Failed to update transaction',
      message: 'Failed to update transaction'
    });
  }
});

// Update transaction status
router.patch('/:id/status', requireRole(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, comments } = req.body;

    const validStatuses = [
      'DRAFT', 'PENDING_APPROVAL', 'APPROVED', 'SENT', 'CHANGES_REQUESTED',
      'REJECTED', 'ACCEPTED', 'PARTIALLY_PAID', 'PAID', 'CANCELLED', 'OVERDUE'
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'The specified status is not valid'
      });
    }

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        companyId: req.user.companyId
      }
    });

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'The requested transaction does not exist'
      });
    }

    const updateData = { status };

    // Set appropriate timestamps
    if (status === 'APPROVED') {
      updateData.approvedAt = new Date();
      updateData.approvedById = req.user.id;
    } else if (status === 'SENT') {
      updateData.sentAt = new Date();
    } else if (status === 'ACCEPTED') {
      updateData.acceptedAt = new Date();
    } else if (status === 'REJECTED') {
      updateData.rejectedAt = new Date();
      updateData.rejectionReason = comments;
    }

    const updatedTransaction = await prisma.transaction.update({
      where: { id },
      data: updateData
    });

    // Create approval history entry
    await prisma.approvalHistory.create({
      data: {
        transactionId: id,
        action: status,
        performedBy: req.user.name,
        performedByRole: req.user.role,
        comments: comments || null
      }
    });

    res.json({
      message: 'Transaction status updated successfully',
      transaction: updatedTransaction
    });
  } catch (error) {
    console.error('Update transaction status error:', error);
    res.status(500).json({
      error: 'Failed to update transaction status',
      message: 'Failed to update transaction status'
    });
  }
});

// Delete transaction
router.delete('/:id', requireRole(['ADMIN', 'ACCOUNTANT']), async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        companyId: req.user.companyId
      }
    });

    if (!transaction) {
      return res.status(404).json({
        error: 'Transaction not found',
        message: 'The requested transaction does not exist'
      });
    }

    // Check if transaction can be deleted
    if (['SENT', 'ACCEPTED', 'PAID'].includes(transaction.status)) {
      return res.status(400).json({
        error: 'Cannot delete transaction',
        message: 'Transaction cannot be deleted in its current status'
      });
    }

    // Delete transaction and related records
    await prisma.$transaction(async (tx) => {
      // Delete related records
      await tx.transactionItem.deleteMany({ where: { transactionId: id } });
      await tx.payment.deleteMany({ where: { transactionId: id } });
      await tx.ledgerEntry.deleteMany({ where: { transactionId: id } });
      await tx.approvalHistory.deleteMany({ where: { transactionId: id } });
      await tx.reminder.deleteMany({ where: { transactionId: id } });

      // Delete transaction
      await tx.transaction.delete({ where: { id } });
    });

    res.json({
      message: 'Transaction deleted successfully'
    });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({
      error: 'Failed to delete transaction',
      message: 'Failed to delete transaction'
    });
  }
});

// Get transaction summary
router.get('/summary/overview', async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;

    const where = {
      companyId: req.user.companyId,
      ...(type && { type }),
      ...(startDate && endDate && {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      })
    };

    const [
      totalRevenue,
      totalExpenses,
      pendingInvoices,
      overdueInvoices,
      totalCustomers,
      totalProducts
    ] = await Promise.all([
      // Total revenue (sales orders and invoices)
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: { in: ['SALES_ORDER', 'INVOICE'] },
          status: { in: ['SENT', 'ACCEPTED', 'PARTIALLY_PAID', 'PAID'] }
        },
        _sum: { totalAmount: true }
      }),
      // Total expenses (purchase orders and bills)
      prisma.transaction.aggregate({
        where: {
          ...where,
          type: { in: ['PURCHASE_ORDER', 'BILL'] },
          status: { in: ['SENT', 'ACCEPTED', 'PARTIALLY_PAID', 'PAID'] }
        },
        _sum: { totalAmount: true }
      }),
      // Pending invoices
      prisma.transaction.count({
        where: {
          ...where,
          type: 'INVOICE',
          status: { in: ['DRAFT', 'SENT', 'CHANGES_REQUESTED'] }
        }
      }),
      // Overdue invoices
      prisma.transaction.count({
        where: {
          ...where,
          type: 'INVOICE',
          status: { in: ['SENT', 'CHANGES_REQUESTED'] },
          dueDate: { lt: new Date() }
        }
      }),
      // Total customers
      prisma.contact.count({
        where: {
          companyId: req.user.companyId,
          isActive: true,
          isCustomer: true
        }
      }),
      // Total products
      prisma.product.count({
        where: {
          companyId: req.user.companyId,
          isActive: true
        }
      })
    ]);

    const revenue = totalRevenue._sum.totalAmount || 0;
    const expenses = totalExpenses._sum.totalAmount || 0;
    const netProfit = revenue - expenses;

    res.json({
      totalRevenue: revenue,
      totalExpenses: expenses,
      netProfit,
      pendingInvoices,
      overdueInvoices,
      totalCustomers,
      totalProducts
    });
  } catch (error) {
    console.error('Get transaction summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch transaction summary',
      message: 'Failed to get transaction summary'
    });
  }
});

export default router;
