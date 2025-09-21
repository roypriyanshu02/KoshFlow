#!/bin/bash

# कोषFLOW Development Setup Script
# This script sets up the development environment for the कोषFLOW application

set -e  # Exit on any error

echo "🚀 Setting up कोषFLOW Development Environment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) detected"

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    print_status "Creating .env file from .env.example..."
    cp .env.example .env
    print_success ".env file created"
else
    print_warning ".env file already exists"
fi

# Install frontend dependencies
print_status "Installing frontend dependencies..."
npm install
print_success "Frontend dependencies installed"

# Install backend dependencies
print_status "Installing backend dependencies..."
cd backend
npm install
cd ..
print_success "Backend dependencies installed"

# Generate Prisma client
print_status "Generating Prisma client..."
npm run db:generate
print_success "Prisma client generated"

# Push database schema
print_status "Setting up database..."
npm run db:push
print_success "Database schema applied"

# Seed database with sample data
print_status "Seeding database with sample data..."
npm run db:seed || print_warning "Database seeding failed (this is optional)"

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p logs uploads
print_success "Directories created"

# Check if ports are available
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        print_warning "Port $1 is already in use"
        return 1
    else
        return 0
    fi
}

print_status "Checking if required ports are available..."
check_port 8080 || print_warning "Frontend port 8080 is in use"
check_port 3001 || print_warning "Backend port 3001 is in use"

print_success "Development environment setup complete!"
echo ""
echo "🎉 कोषFLOW is ready for development!"
echo ""
echo "📋 Next steps:"
echo "   1. Review and update .env file with your configuration"
echo "   2. Start the development server: npm run dev"
echo "   3. Open http://localhost:8080 in your browser"
echo ""
echo "🔧 Useful commands:"
echo "   npm run dev          - Start both frontend and backend"
echo "   npm run dev:frontend - Start only frontend"
echo "   npm run dev:backend  - Start only backend"
echo "   npm run db:studio    - Open Prisma Studio"
echo "   npm run lint         - Run ESLint"
echo "   npm run build        - Build for production"
echo ""
echo "📚 Documentation: README.md"
echo "🐛 Issues: Check the logs/ directory for error logs"
