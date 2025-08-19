#!/bin/bash

# POS System Setup Script
echo "🚀 Setting up POS System..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js version 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "📁 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and set your JWT_SECRET before proceeding."
    echo "   You can generate a secure secret with: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""
    echo ""
    read -p "Press Enter after you've updated the .env file..."
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npm run db:generate

if [ $? -ne 0 ]; then
    echo "❌ Failed to generate Prisma client."
    exit 1
fi

# Setup database
echo "🗄️  Setting up database..."
npm run db:push

if [ $? -ne 0 ]; then
    echo "❌ Failed to setup database."
    exit 1
fi

# Seed database
echo "🌱 Seeding database with sample data..."
npm run db:seed

if [ $? -ne 0 ]; then
    echo "❌ Failed to seed database."
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "🔐 Default login credentials:"
echo "   Admin - Username: admin, Password: admin123"
echo "   Cashier - Username: kasir1, Password: kasir123"
echo ""
echo "🚀 To start the development server, run:"
echo "   npm run dev"
echo ""
echo "📚 Open http://localhost:3000 in your browser"
echo ""
echo "Happy coding! 🎉"
