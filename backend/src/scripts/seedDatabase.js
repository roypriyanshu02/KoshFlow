#!/usr/bin/env node

/**
 * कोषFLOW Database Seeding Script
 * Populates the database with sample data for testing and demonstration
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create a test company
    console.log('📊 Creating test company...');
    const company = await prisma.company.upsert({
      where: { email: 'demo@koshflow.com' },
      update: {},
      create: {
        name: 'कोषFLOW Demo Company',
        email: 'demo@koshflow.com',
        phone: '+91-9876543210',
        address: 'Demo Address, Mumbai, Maharashtra',
        gstin: '27ABCDE1234F1Z5',
        pan: 'ABCDE1234F',
        isActive: true
      }
    });

    console.log('✅ Company created:', company.name);

    // Create a test user
    console.log('👤 Creating test user...');
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const user = await prisma.user.upsert({
      where: { email: 'demo@koshflow.com' },
      update: {},
      create: {
        name: 'Demo User',
        email: 'demo@koshflow.com',
        password: hashedPassword,
        role: 'ADMIN',
        companyId: company.id,
        isActive: true
      }
    });

    console.log('✅ User created:', user.name);

    // Create sample contacts (customers and vendors)
    console.log('👥 Creating sample contacts...');
    const contacts = await Promise.all([
      prisma.contact.upsert({
        where: { 
          companyId_email: {
            companyId: company.id,
            email: 'customer1@example.com'
          }
        },
        update: {},
        create: {
          name: 'ABC Corporation',
          email: 'customer1@example.com',
          phone: '+91-9876543211',
          address: 'Customer Address 1, Delhi',
          gstin: '07ABCDE1234F1Z5',
          pan: 'ABCDE1234G',
          isCustomer: true,
          isVendor: false,
          isActive: true,
          companyId: company.id
        }
      }),
      prisma.contact.upsert({
        where: { 
          companyId_email: {
            companyId: company.id,
            email: 'customer2@example.com'
          }
        },
        update: {},
        create: {
          name: 'XYZ Limited',
          email: 'customer2@example.com',
          phone: '+91-9876543212',
          address: 'Customer Address 2, Bangalore',
          gstin: '29ABCDE1234F1Z5',
          isCustomer: true,
          isVendor: false,
          isActive: true,
          companyId: company.id
        }
      }),
      prisma.contact.upsert({
        where: { 
          companyId_email: {
            companyId: company.id,
            email: 'vendor1@example.com'
          }
        },
        update: {},
        create: {
          name: 'Office Supplies Co.',
          email: 'vendor1@example.com',
          phone: '+91-9876543213',
          address: 'Vendor Address 1, Mumbai',
          gstin: '27ABCDE1234F1Z6',
          isCustomer: false,
          isVendor: true,
          isActive: true,
          companyId: company.id
        }
      }),
      prisma.contact.upsert({
        where: { 
          companyId_email: {
            companyId: company.id,
            email: 'vendor2@example.com'
          }
        },
        update: {},
        create: {
          name: 'Tech Solutions Ltd.',
          email: 'vendor2@example.com',
          phone: '+91-9876543214',
          address: 'Vendor Address 2, Pune',
          isCustomer: false,
          isVendor: true,
          isActive: true,
          companyId: company.id
        }
      })
    ]);

    console.log(`✅ Created ${contacts.length} contacts`);

    // Create sample products
    console.log('📦 Creating sample products...');
    const products = await Promise.all([
      prisma.product.upsert({
        where: { 
          companyId_sku: {
            companyId: company.id,
            sku: 'PROD-001'
          }
        },
        update: {},
        create: {
          name: 'Wireless Headphones',
          sku: 'PROD-001',
          description: 'Premium wireless headphones with noise cancellation',
          category: 'Electronics',
          unit: 'PCS',
          salePrice: 2500.00,
          costPrice: 1800.00,
          purchasePrice: 1800.00,
          stockQuantity: 45,
          reorderLevel: 20,
          isActive: true,
          companyId: company.id
        }
      }),
      prisma.product.upsert({
        where: { 
          companyId_sku: {
            companyId: company.id,
            sku: 'PROD-002'
          }
        },
        update: {},
        create: {
          name: 'Office Chair',
          sku: 'PROD-002',
          description: 'Ergonomic office chair with lumbar support',
          category: 'Furniture',
          unit: 'PCS',
          salePrice: 7500.00,
          costPrice: 5500.00,
          purchasePrice: 5500.00,
          stockQuantity: 12,
          reorderLevel: 15,
          isActive: true,
          companyId: company.id
        }
      }),
      prisma.product.upsert({
        where: { 
          companyId_sku: {
            companyId: company.id,
            sku: 'PROD-003'
          }
        },
        update: {},
        create: {
          name: 'Laptop Stand',
          sku: 'PROD-003',
          description: 'Adjustable aluminum laptop stand',
          category: 'Accessories',
          unit: 'PCS',
          salePrice: 1500.00,
          costPrice: 1000.00,
          purchasePrice: 1000.00,
          stockQuantity: 28,
          reorderLevel: 25,
          isActive: true,
          companyId: company.id
        }
      })
    ]);

    console.log(`✅ Created ${products.length} products`);

    // Create sample accounts
    console.log('💰 Creating sample accounts...');
    const accounts = await Promise.all([
      prisma.account.upsert({
        where: { 
          companyId_code: {
            companyId: company.id,
            code: 'REV-001'
          }
        },
        update: {},
        create: {
          name: 'Sales Revenue',
          code: 'REV-001',
          type: 'REVENUE',
          description: 'Revenue from product sales',
          isActive: true,
          companyId: company.id
        }
      }),
      prisma.account.upsert({
        where: { 
          companyId_code: {
            companyId: company.id,
            code: 'EXP-001'
          }
        },
        update: {},
        create: {
          name: 'Cost of Goods Sold',
          code: 'EXP-001',
          type: 'EXPENSE',
          description: 'Direct costs of products sold',
          isActive: true,
          companyId: company.id
        }
      }),
      prisma.account.upsert({
        where: { 
          companyId_code: {
            companyId: company.id,
            code: 'EXP-002'
          }
        },
        update: {},
        create: {
          name: 'Office Expenses',
          code: 'EXP-002',
          type: 'EXPENSE',
          description: 'General office and administrative expenses',
          isActive: true,
          companyId: company.id
        }
      })
    ]);

    console.log(`✅ Created ${accounts.length} accounts`);

    // Create sample transactions
    console.log('💳 Creating sample transactions...');
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const transactions = await Promise.all([
      // Sales transactions (revenue)
      prisma.transaction.create({
        data: {
          type: 'INVOICE',
          number: 'INV-2024-001',
          date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          dueDate: new Date(now.getTime() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
          status: 'PAID',
          subtotal: 25000.00,
          taxAmount: 4500.00,
          totalAmount: 29500.00,
          notes: 'Payment for wireless headphones bulk order',
          contactId: contacts[0].id, // ABC Corporation
          companyId: company.id,
          createdBy: user.id
        }
      }),
      prisma.transaction.create({
        data: {
          type: 'INVOICE',
          number: 'INV-2024-002',
          date: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          dueDate: new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000),
          status: 'SENT',
          subtotal: 45000.00,
          taxAmount: 8100.00,
          totalAmount: 53100.00,
          notes: 'Office furniture order',
          contactId: contacts[1].id, // XYZ Limited
          companyId: company.id,
          createdBy: user.id
        }
      }),
      // Purchase transactions (expenses)
      prisma.transaction.create({
        data: {
          type: 'BILL',
          number: 'BILL-2024-001',
          date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          dueDate: new Date(now.getTime() + 27 * 24 * 60 * 60 * 1000),
          status: 'PAID',
          subtotal: 15000.00,
          taxAmount: 2700.00,
          totalAmount: 17700.00,
          notes: 'Office supplies purchase',
          contactId: contacts[2].id, // Office Supplies Co.
          companyId: company.id,
          createdBy: user.id
        }
      }),
      prisma.transaction.create({
        data: {
          type: 'BILL',
          number: 'BILL-2024-002',
          date: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
          dueDate: new Date(now.getTime() + 23 * 24 * 60 * 60 * 1000),
          status: 'SENT',
          subtotal: 35000.00,
          taxAmount: 6300.00,
          totalAmount: 41300.00,
          notes: 'Software licensing and support',
          contactId: contacts[3].id, // Tech Solutions Ltd.
          companyId: company.id,
          createdBy: user.id
        }
      }),
      // More recent transactions
      prisma.transaction.create({
        data: {
          type: 'INVOICE',
          number: 'INV-2024-003',
          date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
          dueDate: new Date(now.getTime() + 29 * 24 * 60 * 60 * 1000),
          status: 'PARTIALLY_PAID',
          subtotal: 12000.00,
          taxAmount: 2160.00,
          totalAmount: 14160.00,
          notes: 'Laptop accessories order',
          contactId: contacts[0].id,
          companyId: company.id,
          createdBy: user.id
        }
      })
    ]);

    console.log(`✅ Created ${transactions.length} transactions`);

    // Create sample taxes
    console.log('📋 Creating sample taxes...');
    const taxes = await Promise.all([
      prisma.tax.upsert({
        where: { 
          companyId_name: {
            companyId: company.id,
            name: 'GST 18%'
          }
        },
        update: {},
        create: {
          name: 'GST 18%',
          rate: 18.00,
          type: 'PERCENTAGE',
          description: 'Goods and Services Tax at 18%',
          isActive: true,
          companyId: company.id
        }
      }),
      prisma.tax.upsert({
        where: { 
          companyId_name: {
            companyId: company.id,
            name: 'GST 12%'
          }
        },
        update: {},
        create: {
          name: 'GST 12%',
          rate: 12.00,
          type: 'PERCENTAGE',
          description: 'Goods and Services Tax at 12%',
          isActive: true,
          companyId: company.id
        }
      })
    ]);

    console.log(`✅ Created ${taxes.length} tax configurations`);

    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Company: ${company.name}`);
    console.log(`   • User: ${user.email} (password: demo123)`);
    console.log(`   • Contacts: ${contacts.length} (customers and vendors)`);
    console.log(`   • Products: ${products.length}`);
    console.log(`   • Accounts: ${accounts.length}`);
    console.log(`   • Transactions: ${transactions.length}`);
    console.log(`   • Taxes: ${taxes.length}`);
    console.log('\n🔑 Login credentials:');
    console.log('   Email: demo@koshflow.com');
    console.log('   Password: demo123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeding
seedDatabase()
  .then(() => {
    console.log('\n✅ Seeding process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Seeding process failed:', error);
    process.exit(1);
  });
