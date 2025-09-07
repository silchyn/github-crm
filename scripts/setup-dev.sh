#!/bin/bash

# GitHub CRM Development Setup Script

echo "🚀 Setting up GitHub CRM for development..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create root .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating root .env file..."
    cp env.example .env
    echo "✅ Root .env file created. Please review and update if needed."
else
    echo "✅ Root .env file already exists."
fi

# Create backend .env file if it doesn't exist
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend .env file..."
    cp backend/env.example backend/.env
    echo "✅ Backend .env file created. Please review and update if needed."
else
    echo "✅ Backend .env file already exists."
fi

# Create frontend .env file if it doesn't exist
if [ ! -f "frontend/.env" ]; then
    echo "📝 Creating frontend .env file..."
    cp frontend/env.example frontend/.env
    echo "✅ Frontend .env file created. Please review and update if needed."
else
    echo "✅ Frontend .env file already exists."
fi

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the application:"
echo "  Development mode: npm run dev"
echo "  Docker mode:      docker-compose up -d"
echo ""
echo "Access the application at:"
echo "  Frontend: http://localhost:3000"
echo "  Backend:  http://localhost:3001"
echo ""
