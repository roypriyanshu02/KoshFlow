import express from 'express';
import prisma from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Dashboard summary
router.get('/dashboard', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Default to current month if no dates provided
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getFullYear(), now.getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const where = {
      companyId: req.user.companyId,
      date: {
        gte: start,
        lte: end
      }
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
          companyId: req.user.companyId,
          type: 'INVOICE',
          status: { in: ['DRAFT', 'SENT', 'CHANGES_REQUESTED'] }
        }
      }),
      // Overdue invoices
      prisma.transaction.count({
        where: {
          companyId: req.user.companyId,
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
      totalProducts,
      period: {
        startDate: start,
        endDate: end
      }
    });
  } catch (error) {
    console.error('Get dashboard summary error:', error);
    res.status(500).json({
      error: 'Failed to fetch dashboard summary',
      message: 'Failed to get dashboard summary'
    });
  }
});

// Profit & Loss Report
router.get('/profit-loss', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Date range required',
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get revenue accounts
    const revenueAccounts = await prisma.account.findMany({
      where: {
        companyId: req.user.companyId,
        type: 'REVENUE',
        isActive: true
      }
    });

    // Get expense accounts
    const expenseAccounts = await prisma.account.findMany({
      where: {
        companyId: req.user.companyId,
        type: 'EXPENSE',
        isActive: true
      }
    });

    // Calculate revenue
    const revenueData = await Promise.all(
      revenueAccounts.map(async (account) => {
        const ledgerEntries = await prisma.ledgerEntry.findMany({
          where: {
            accountId: account.id,
            date: { gte: start, lte: end }
          }
        });

        const totalCredit = ledgerEntries.reduce((sum, entry) => sum + parseFloat(entry.creditAmount), 0);
        const totalDebit = ledgerEntries.reduce((sum, entry) => sum + parseFloat(entry.debitAmount), 0);
        const balance = totalCredit - totalDebit;

        return {
          accountId: account.id,
          accountName: account.name,
          accountCode: account.code,
          balance
        };
      })
    );

    // Calculate expenses
    const expenseData = await Promise.all(
      expenseAccounts.map(async (account) => {
        const ledgerEntries = await prisma.ledgerEntry.findMany({
          where: {
            accountId: account.id,
            date: { gte: start, lte: end }
          }
        });

        const totalCredit = ledgerEntries.reduce((sum, entry) => sum + parseFloat(entry.creditAmount), 0);
        const totalDebit = ledgerEntries.reduce((sum, entry) => sum + parseFloat(entry.debitAmount), 0);
        const balance = totalDebit - totalCredit;

        return {
          accountId: account.id,
          accountName: account.name,
          accountCode: account.code,
          balance
        };
      })
    );

    const totalRevenue = revenueData.reduce((sum, item) => sum + item.balance, 0);
    const totalExpenses = expenseData.reduce((sum, item) => sum + item.balance, 0);
    const netProfit = totalRevenue - totalExpenses;

    res.json({
      period: { startDate: start, endDate: end },
      revenue: {
        accounts: revenueData.filter(item => item.balance > 0),
        total: totalRevenue
      },
      expenses: {
        accounts: expenseData.filter(item => item.balance > 0),
        total: totalExpenses
      },
      netProfit
    });
  } catch (error) {
    console.error('Get profit-loss report error:', error);
    res.status(500).json({
      error: 'Failed to fetch profit-loss report',
      message: 'Failed to get profit-loss report'
    });
  }
});

// Balance Sheet Report
router.get('/balance-sheet', async (req, res) => {
  try {
    const { asOfDate } = req.query;

    const asOf = asOfDate ? new Date(asOfDate) : new Date();

    // Get all accounts by type
    const accounts = await prisma.account.findMany({
      where: {
        companyId: req.user.companyId,
        isActive: true
      },
      orderBy: { code: 'asc' }
    });

    const accountTypes = ['ASSET', 'LIABILITY', 'EQUITY'];
    const balanceSheet = {};

    for (const type of accountTypes) {
      const typeAccounts = accounts.filter(account => account.type === type);
      
      balanceSheet[type.toLowerCase()] = await Promise.all(
        typeAccounts.map(async (account) => {
          const ledgerEntries = await prisma.ledgerEntry.findMany({
            where: {
              accountId: account.id,
              date: { lte: asOf }
            }
          });

          const totalCredit = ledgerEntries.reduce((sum, entry) => sum + parseFloat(entry.creditAmount), 0);
          const totalDebit = ledgerEntries.reduce((sum, entry) => sum + parseFloat(entry.debitAmount), 0);
          
          let balance;
          if (type === 'ASSET' || type === 'EXPENSE') {
            balance = totalDebit - totalCredit;
          } else {
            balance = totalCredit - totalDebit;
          }

          return {
            accountId: account.id,
            accountName: account.name,
            accountCode: account.code,
            balance
          };
        })
      );
    }

    // Calculate totals
    const totalAssets = balanceSheet.asset.reduce((sum, item) => sum + item.balance, 0);
    const totalLiabilities = balanceSheet.liability.reduce((sum, item) => sum + item.balance, 0);
    const totalEquity = balanceSheet.equity.reduce((sum, item) => sum + item.balance, 0);
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    res.json({
      asOfDate: asOf,
      assets: {
        accounts: balanceSheet.asset.filter(item => item.balance !== 0),
        total: totalAssets
      },
      liabilities: {
        accounts: balanceSheet.liability.filter(item => item.balance !== 0),
        total: totalLiabilities
      },
      equity: {
        accounts: balanceSheet.equity.filter(item => item.balance !== 0),
        total: totalEquity
      },
      totalAssets,
      totalLiabilitiesAndEquity,
      isBalanced: Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01
    });
  } catch (error) {
    console.error('Get balance sheet error:', error);
    res.status(500).json({
      error: 'Failed to fetch balance sheet',
      message: 'Failed to get balance sheet'
    });
  }
});

// Cash Flow Report
router.get('/cash-flow', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Date range required',
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get cash accounts
    const cashAccounts = await prisma.account.findMany({
      where: {
        companyId: req.user.companyId,
        type: 'ASSET',
        isActive: true,
        name: {
          contains: 'cash',
          mode: 'insensitive'
        }
      }
    });

    // Get cash movements
    const cashMovements = await prisma.ledgerEntry.findMany({
      where: {
        accountId: { in: cashAccounts.map(acc => acc.id) },
        date: { gte: start, lte: end }
      },
      include: {
        account: true,
        transaction: {
          select: {
            type: true,
            transactionNumber: true
          }
        }
      },
      orderBy: { date: 'asc' }
    });

    // Categorize cash flows
    const operatingActivities = [];
    const investingActivities = [];
    const financingActivities = [];

    let openingBalance = 0;
    let closingBalance = 0;

    for (const movement of cashMovements) {
      const amount = parseFloat(movement.debitAmount) - parseFloat(movement.creditAmount);
      
      // Categorize based on transaction type
      if (['SALES_ORDER', 'INVOICE', 'PURCHASE_ORDER', 'BILL'].includes(movement.transaction?.type)) {
        operatingActivities.push({
          date: movement.date,
          description: movement.description,
          amount,
          account: movement.account.name
        });
      } else if (['PAYMENT', 'RECEIPT'].includes(movement.transaction?.type)) {
        financingActivities.push({
          date: movement.date,
          description: movement.description,
          amount,
          account: movement.account.name
        });
      } else {
        investingActivities.push({
          date: movement.date,
          description: movement.description,
          amount,
          account: movement.account.name
        });
      }

      closingBalance += amount;
    }

    const netOperatingCashFlow = operatingActivities.reduce((sum, item) => sum + item.amount, 0);
    const netInvestingCashFlow = investingActivities.reduce((sum, item) => sum + item.amount, 0);
    const netFinancingCashFlow = financingActivities.reduce((sum, item) => sum + item.amount, 0);
    const netCashFlow = netOperatingCashFlow + netInvestingCashFlow + netFinancingCashFlow;

    res.json({
      period: { startDate: start, endDate: end },
      openingBalance,
      closingBalance,
      operatingActivities: {
        items: operatingActivities,
        total: netOperatingCashFlow
      },
      investingActivities: {
        items: investingActivities,
        total: netInvestingCashFlow
      },
      financingActivities: {
        items: financingActivities,
        total: netFinancingCashFlow
      },
      netCashFlow
    });
  } catch (error) {
    console.error('Get cash flow report error:', error);
    res.status(500).json({
      error: 'Failed to fetch cash flow report',
      message: 'Failed to get cash flow report'
    });
  }
});

// Aging Report
router.get('/aging', async (req, res) => {
  try {
    const { asOfDate } = req.query;

    const asOf = asOfDate ? new Date(asOfDate) : new Date();

    // Get all outstanding invoices
    const outstandingInvoices = await prisma.transaction.findMany({
      where: {
        companyId: req.user.companyId,
        type: 'INVOICE',
        status: { in: ['SENT', 'CHANGES_REQUESTED', 'PARTIALLY_PAID'] },
        balanceAmount: { gt: 0 }
      },
      include: {
        contact: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { dueDate: 'asc' }
    });

    // Categorize by age
    const agingCategories = {
      current: [], // 0-30 days
      days31to60: [], // 31-60 days
      days61to90: [], // 61-90 days
      over90: [] // Over 90 days
    };

    for (const invoice of outstandingInvoices) {
      const daysPastDue = Math.floor((asOf.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysPastDue <= 30) {
        agingCategories.current.push(invoice);
      } else if (daysPastDue <= 60) {
        agingCategories.days31to60.push(invoice);
      } else if (daysPastDue <= 90) {
        agingCategories.days61to90.push(invoice);
      } else {
        agingCategories.over90.push(invoice);
      }
    }

    // Calculate totals
    const totals = {
      current: agingCategories.current.reduce((sum, inv) => sum + parseFloat(inv.balanceAmount), 0),
      days31to60: agingCategories.days31to60.reduce((sum, inv) => sum + parseFloat(inv.balanceAmount), 0),
      days61to90: agingCategories.days61to90.reduce((sum, inv) => sum + parseFloat(inv.balanceAmount), 0),
      over90: agingCategories.over90.reduce((sum, inv) => sum + parseFloat(inv.balanceAmount), 0)
    };

    const grandTotal = Object.values(totals).reduce((sum, total) => sum + total, 0);

    res.json({
      asOfDate: asOf,
      aging: {
        current: {
          invoices: agingCategories.current,
          total: totals.current
        },
        days31to60: {
          invoices: agingCategories.days31to60,
          total: totals.days31to60
        },
        days61to90: {
          invoices: agingCategories.days61to90,
          total: totals.days61to90
        },
        over90: {
          invoices: agingCategories.over90,
          total: totals.over90
        }
      },
      totals: {
        ...totals,
        grandTotal
      }
    });
  } catch (error) {
    console.error('Get aging report error:', error);
    res.status(500).json({
      error: 'Failed to fetch aging report',
      message: 'Failed to get aging report'
    });
  }
});

// Sales Report
router.get('/sales', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Date range required',
        message: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get sales transactions
    const salesTransactions = await prisma.transaction.findMany({
      where: {
        companyId: req.user.companyId,
        type: { in: ['SALES_ORDER', 'INVOICE'] },
        status: { in: ['SENT', 'ACCEPTED', 'PARTIALLY_PAID', 'PAID'] },
        date: { gte: start, lte: end }
      },
      include: {
        contact: {
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
      },
      orderBy: { date: 'asc' }
    });

    // Group by specified period
    const groupedData = {};
    const productSales = {};
    const customerSales = {};

    for (const transaction of salesTransactions) {
      let groupKey;
      
      if (groupBy === 'day') {
        groupKey = transaction.date.toISOString().split('T')[0];
      } else if (groupBy === 'week') {
        const weekStart = new Date(transaction.date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        groupKey = weekStart.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        groupKey = `${transaction.date.getFullYear()}-${String(transaction.date.getMonth() + 1).padStart(2, '0')}`;
      } else {
        groupKey = 'all';
      }

      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {
          period: groupKey,
          totalAmount: 0,
          transactionCount: 0,
          transactions: []
        };
      }

      groupedData[groupKey].totalAmount += parseFloat(transaction.totalAmount);
      groupedData[groupKey].transactionCount += 1;
      groupedData[groupKey].transactions.push(transaction);

      // Product sales
      for (const item of transaction.items) {
        if (item.product) {
          const productKey = item.product.id;
          if (!productSales[productKey]) {
            productSales[productKey] = {
              product: item.product,
              totalAmount: 0,
              totalQuantity: 0
            };
          }
          productSales[productKey].totalAmount += parseFloat(item.amount);
          productSales[productKey].totalQuantity += parseFloat(item.quantity);
        }
      }

      // Customer sales
      if (transaction.contact) {
        const customerKey = transaction.contact.id;
        if (!customerSales[customerKey]) {
          customerSales[customerKey] = {
            customer: transaction.contact,
            totalAmount: 0,
            transactionCount: 0
          };
        }
        customerSales[customerKey].totalAmount += parseFloat(transaction.totalAmount);
        customerSales[customerKey].transactionCount += 1;
      }
    }

    const totalSales = salesTransactions.reduce((sum, txn) => sum + parseFloat(txn.totalAmount), 0);

    res.json({
      period: { startDate: start, endDate: end },
      groupBy,
      summary: {
        totalSales,
        totalTransactions: salesTransactions.length,
        averageTransactionValue: salesTransactions.length > 0 ? totalSales / salesTransactions.length : 0
      },
      byPeriod: Object.values(groupedData),
      topProducts: Object.values(productSales)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10),
      topCustomers: Object.values(customerSales)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 10)
    });
  } catch (error) {
    console.error('Get sales report error:', error);
    res.status(500).json({
      error: 'Failed to fetch sales report',
      message: 'Failed to get sales report'
    });
  }
});

export default router;
