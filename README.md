# कोषFLOW - Smart Indian Accounting Platform

A modern, full-stack financial management application built specifically for Indian businesses. कोषFLOW provides comprehensive accounting, invoicing, and financial reporting capabilities with a focus on simplicity, performance, and user experience.

Video link: https://drive.google.com/drive/folders/1TPs8d6JEJBRN_s15u9QE6h_Y8dPQGv69?usp=sharing

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Automated Setup

Run the optimized setup script to automatically configure everything:

```bash
./dev-setup.sh
```

### Manual Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment:**

   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Set up database:**

   ```bash
   # Generate Prisma client
   npm run db:generate

   # Push schema to database
   npm run db:push

   # Seed with sample data (optional)
   npm run db:seed
   ```

4. **Start the application:**

   ```bash
   # Start both frontend and backend
   npm run dev
   ```

5. **Access the application:**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001
   - Database Studio: `npm run db:studio`

## 🔐 Authentication

कोषFLOW features a streamlined authentication system:

- **Ultra-simplified signup**: Only 4+ character passwords required
- **Modal-based flow**: All authentication happens through landing page modals
- **Intelligent fallbacks**: Mock data ensures smooth demo experience
- **Auto-redirect**: Seamless navigation to dashboard after login

## ✨ Features

### 🏢 Multi-tenant Architecture

- Company-based data isolation
- Role-based access control (Admin, Accountant, Viewer)
- Secure authentication with JWT

### 📊 Complete Accounting System

- **Chart of Accounts** - Hierarchical account structure
- **Double-entry Bookkeeping** - Automated ledger entries
- **Transaction Management** - Sales orders, invoices, bills, payments
- **Inventory Management** - Stock tracking with movements
- **Tax Calculations** - GST, CGST, SGST, IGST compliance

### 👥 Contact Management

- Customer and vendor management
- Portal access for external users
- Credit limits and payment terms
- Contact activity tracking

### 📈 Financial Reporting

- **Dashboard** - Real-time business overview
- **Profit & Loss Statement** - Revenue and expense analysis
- **Balance Sheet** - Assets, liabilities, and equity
- **Cash Flow Statement** - Cash flow analysis
- **Aging Reports** - Outstanding receivables/payables
- **Sales Reports** - Revenue analysis by customer/product

### 🔧 Advanced Features

- **Payment Processing** - Multiple payment methods
- **Recurring Transactions** - Automated recurring entries
- **Audit Trail** - Complete activity logging
- **File Attachments** - Document management
- **Notifications** - Email and in-app notifications
- **API Integration** - RESTful API for all operations

## 🏗️ Architecture

### Frontend (React + TypeScript)

- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite with optimized configuration
- **UI Library:** Radix UI + Tailwind CSS
- **State Management:** React Query with optimized caching
- **Routing:** React Router v6 with lazy loading
- **Performance:** Memoization, code splitting, bundle optimization

### Backend (Node.js + Express)

- **Runtime:** Node.js with Express.js
- **Database:** SQLite with Prisma ORM (optimized for development)
- **Authentication:** JWT with bcrypt password hashing
- **Validation:** express-validator with simplified rules
- **Security:** Helmet, CORS, rate limiting, compression
- **Performance:** Request timeouts, memory monitoring, optimized middleware

### Database Schema

- **Multi-tenant** design with company isolation
- **Comprehensive** accounting entities
- **Audit logging** for compliance
- **Optimized** indexes for performance

## 📁 Project Structure

```
koshflow/
├── backend/                 # Backend API
│   ├── src/
│   │   ├── routes/         # API route handlers
│   │   ├── middleware/     # Auth & error handling
│   │   └── server.js       # Main server file
│   └── uploads/            # File uploads
├── prisma/                 # Database schema
│   └── schema.prisma       # Prisma schema
├── src/                    # Frontend React app
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── contexts/          # React contexts
│   ├── lib/               # Utilities and API client
│   └── hooks/             # Custom React hooks
└── public/                # Static assets
```

## 🔌 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new company
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Company Management

- `GET /api/companies/profile` - Get company profile
- `PUT /api/companies/profile` - Update company profile
- `GET /api/companies/stats` - Get company statistics

### Contact Management

- `GET /api/contacts` - List contacts
- `POST /api/contacts` - Create contact
- `PUT /api/contacts/:id` - Update contact
- `DELETE /api/contacts/:id` - Delete contact

### Transaction Management

- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `PATCH /api/transactions/:id/status` - Update status

### Financial Reports

- `GET /api/reports/dashboard` - Dashboard summary
- `GET /api/reports/profit-loss` - P&L statement
- `GET /api/reports/balance-sheet` - Balance sheet
- `GET /api/reports/aging` - Aging report

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend

# Building
npm run build           # Production build with linting and type checking
npm run build:dev       # Development build
npm run build:analyze   # Build with bundle analysis

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues
npm run type-check      # TypeScript type checking

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run database migrations
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset database

# Utilities
npm run clean           # Clean build artifacts
npm run reset           # Reset dependencies and reinstall
npm run health          # Check backend health
npm run start           # Production start
```

### Environment Configuration

Copy `.env.example` to `.env` and configure:

```env
# Application
NODE_ENV=development
APP_NAME="कोषFLOW"

# Frontend Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_ENABLE_MOCK_DATA=true

# Backend Configuration
PORT=3001
CORS_ORIGIN=http://localhost:8080

# Database
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Performance & Security
ENABLE_COMPRESSION=true
ENABLE_DEBUG=true
```

## 🚀 Deployment

### Production Checklist

1. **Environment Variables**

   - Set `NODE_ENV=production`
   - Use strong JWT secret
   - Configure production database
   - Set proper CORS origins

2. **Database**

   - Set up production PostgreSQL
   - Run migrations: `npm run db:migrate`
   - Configure connection pooling

3. **Security**

   - Enable HTTPS
   - Configure firewall
   - Set up monitoring
   - Regular backups

4. **Performance**
   - Enable gzip compression
   - Configure CDN for static assets
   - Set up caching
   - Monitor performance

### Docker Deployment

```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3001
CMD ["npm", "run", "server"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue on GitHub
- Check the documentation
- Review the API documentation

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced reporting with charts
- [ ] Integration with payment gateways
- [ ] Multi-currency support
- [ ] Advanced inventory management
- [ ] AI-powered insights
- [ ] API webhooks
- [ ] Advanced user permissions

---

**Built with ❤️ for Indian businesses**
