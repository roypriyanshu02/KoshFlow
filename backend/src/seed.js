import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create a test company
  const company = await prisma.company.create({
    data: {
      name: 'Test Company Pvt Ltd',
      email: 'test@company.com',
      phone: '+91-9876543210',
      gstin: '29ABCDE1234F1Z5',
      pan: 'ABCDE1234F',
      address: '123 Business Street, Mumbai',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      country: 'India',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
    }
  });

  console.log('✅ Created company:', company.name);

  // Create admin user
  const hashedPassword = await bcrypt.hash('password123', 12);
  const adminUser = await prisma.user.create({
    data: {
      companyId: company.id,
      email: 'admin@company.com',
      password: hashedPassword,
      name: 'Admin User',
      phone: '+91-9876543210',
      role: 'ADMIN',
      isActive: true,
    }
  });

  console.log('✅ Created admin user:', adminUser.email);

  // Create some test contacts
  const customer1 = await prisma.contact.create({
    data: {
      companyId: company.id,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+91-9876543211',
      isCustomer: true,
      isVendor: false,
      city: 'Delhi',
      state: 'Delhi',
      pincode: '110001',
      country: 'India',
    }
  });

  const vendor1 = await prisma.contact.create({
    data: {
      companyId: company.id,
      name: 'ABC Suppliers',
      email: 'suppliers@abc.com',
      phone: '+91-9876543212',
      isCustomer: false,
      isVendor: true,
      gstin: '29XYZ1234G1H6',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001',
      country: 'India',
    }
  });

  console.log('✅ Created contacts:', customer1.name, vendor1.name);

  // Create some test products
  const product1 = await prisma.product.create({
    data: {
      companyId: company.id,
      sku: 'PROD001',
      name: 'Wooden Chair',
      description: 'High quality wooden chair',
      hsnCode: '94013000',
      unit: 'Nos',
      salePrice: 2500,
      purchasePrice: 1800,
      openingStock: 50,
      currentStock: 50,
      minStockLevel: 10,
      isService: false,
    }
  });

  const product2 = await prisma.product.create({
    data: {
      companyId: company.id,
      sku: 'SERV001',
      name: 'Consulting Service',
      description: 'Business consulting service',
      hsnCode: '99841000',
      unit: 'Hours',
      salePrice: 2000,
      purchasePrice: 1200,
      openingStock: 0,
      currentStock: 0,
      isService: true,
    }
  });

  console.log('✅ Created products:', product1.name, product2.name);

  // Create some basic accounts
  const cashAccount = await prisma.account.create({
    data: {
      companyId: company.id,
      code: '1001',
      name: 'Cash in Hand',
      type: 'ASSET',
      openingBalance: 100000,
      currentBalance: 100000,
      isSystemAccount: true,
    }
  });

  const salesAccount = await prisma.account.create({
    data: {
      companyId: company.id,
      code: '4001',
      name: 'Sales Revenue',
      type: 'REVENUE',
      openingBalance: 0,
      currentBalance: 0,
      isSystemAccount: true,
    }
  });

  console.log('✅ Created accounts:', cashAccount.name, salesAccount.name);

  // Create some test taxes
  const gst18 = await prisma.tax.create({
    data: {
      companyId: company.id,
      name: 'GST 18%',
      type: 'GST',
      rate: 18,
      description: 'Goods and Services Tax 18%',
      isCompound: false,
    }
  });

  console.log('✅ Created tax:', gst18.name);

  console.log('🎉 Database seeded successfully!');
  console.log('');
  console.log('Test credentials:');
  console.log('Email: admin@company.com');
  console.log('Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });