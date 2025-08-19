#!/bin/bash

echo "====================================================="
echo "FASHION PARK INVENTORY SYSTEM - QUICK START"
echo "====================================================="
echo

echo "🚀 Starting Fashion Park Inventory System..."
echo

echo "📦 Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo
echo "✅ Dependencies installed successfully!"
echo

echo "🔧 Setting up environment..."
if [ ! -f .env ]; then
    cp env-template.txt .env
    echo "⚠️  Please edit .env file with your MySQL credentials"
    echo
    read -p "Press Enter to continue..."
fi

echo
echo "🗄️  Starting server..."
echo "📍 Server will run on http://localhost:3000"
echo "📊 Health check: http://localhost:3000/"
echo
echo "Press Ctrl+C to stop the server"
echo

npm start
