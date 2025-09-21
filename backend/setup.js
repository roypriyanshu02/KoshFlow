#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Setting up KoshFlow Backend...\n');

// Create .env file if it doesn't exist
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env file from template');
  } else {
    const envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/koshflow?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Server
PORT=3001
NODE_ENV="development"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Email (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH="./uploads"
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env file');
  }
} else {
  console.log('✅ .env file already exists');
}

// Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
} else {
  console.log('✅ Uploads directory already exists');
}

console.log('\n📋 Next Steps:');
console.log('1. Update the DATABASE_URL in .env file with your PostgreSQL connection string');
console.log('2. Change the JWT_SECRET to a secure random string');
console.log('3. Run: npm install');
console.log('4. Run: npm run db:push');
console.log('5. Run: npm run db:seed');
console.log('6. Run: npm run dev');
console.log('\n🔑 Default login credentials after seeding:');
console.log('   Email: admin@koshflow.com');
console.log('   Password: admin123');
console.log('\n🎉 Setup complete!');
