#!/bin/bash

set -e

echo "🚀 Setting up Home Security Dashboard..."
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo ""

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ Docker is installed"
echo ""

# Install npm dependencies
echo "📦 Installing npm dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Start Docker containers
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo "✅ Docker containers started"
echo ""

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:7557/devices > /dev/null 2>&1; then
        echo "✅ GenieACS NBI is ready"
        break
    fi
    echo "   Waiting... (attempt $((attempt + 1))/$max_attempts)"
    sleep 1
    attempt=$((attempt + 1))
done

if [ $attempt -eq $max_attempts ]; then
    echo "⚠️  Warning: GenieACS NBI did not respond in time"
    echo "   This is okay - it may take longer to start"
    echo "   Check docker-compose logs if you have issues"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "📍 Next steps:"
echo "   1. Start the dev server: npm run dev"
echo "   2. Open http://localhost:5173 in your browser"
echo "   3. Click Settings to configure NBI URL (http://localhost:7557)"
echo "   4. Wait 30-60 seconds for devices to appear"
echo ""
echo "📊 View GenieACS Admin UI: http://localhost:3000"
echo "📡 API Health: curl http://localhost:7557/devices"
echo ""
