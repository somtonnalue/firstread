#!/bin/bash

# 🚀 Production Setup Script for AI Document Generator
# This script helps set up the project for production deployment

set -e  # Exit on any error

echo "🚀 Setting up AI Document Generator for production..."

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

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    print_error ".env.local file not found!"
    echo "Please create .env.local with the following variables:"
    echo "DATABASE_URL=your_database_url"
    echo "NEXTAUTH_URL=your_app_url"
    echo "NEXTAUTH_SECRET=your_secret"
    echo "GOOGLE_GENERATIVE_AI_API_KEY=your_api_key"
    exit 1
fi

print_status "Checking environment variables..."

# Check if DATABASE_URL is set
if ! grep -q "DATABASE_URL=" .env.local; then
    print_error "DATABASE_URL not found in .env.local"
    exit 1
fi

# Check if NEXTAUTH_SECRET is set
if ! grep -q "NEXTAUTH_SECRET=" .env.local; then
    print_warning "NEXTAUTH_SECRET not found in .env.local"
    print_status "Generating a secure secret..."
    SECRET=$(openssl rand -base64 32)
    echo "NEXTAUTH_SECRET=$SECRET" >> .env.local
    print_success "Generated and added NEXTAUTH_SECRET to .env.local"
fi

print_status "Installing dependencies..."
bun install

print_status "Generating Prisma client..."
bunx prisma generate

print_status "Checking database connection..."
if bunx prisma db push --accept-data-loss; then
    print_success "Database schema updated successfully"
else
    print_error "Failed to update database schema"
    print_status "Trying to create initial migration..."
    if bunx prisma migrate dev --name init; then
        print_success "Initial migration created successfully"
    else
        print_error "Failed to create migration"
        exit 1
    fi
fi

print_status "Building the application..."
if bun run build; then
    print_success "Build completed successfully"
else
    print_error "Build failed"
    exit 1
fi

print_success "🎉 Production setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Deploy to Vercel"
echo "2. Set environment variables in Vercel dashboard"
echo "3. Run 'bunx prisma migrate deploy' in production"
echo ""
echo "For detailed instructions, see DEPLOYMENT_GUIDE.md"
