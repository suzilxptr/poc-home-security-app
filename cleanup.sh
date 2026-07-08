#!/bin/bash

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🧹 Cleaning up Home Security Dashboard..."
echo ""

# Kill GenieACS processes
echo "🛑 Stopping GenieACS (CWMP + NBI)..."
pkill -f "genieacs-cwmp|genieacs-nbi" 2>/dev/null || true

# Kill CPE simulator
echo "🛑 Stopping CPE Simulator..."
pkill -f "cpe-simulator" 2>/dev/null || true

# Kill React dev server
echo "🛑 Stopping React dev server..."
pkill -f "vite" 2>/dev/null || true

# Stop Docker containers
echo "🛑 Stopping Docker containers..."
cd $PROJECT_DIR
docker-compose down 2>/dev/null || true

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "To start again, run:"
echo "  ./run-all.sh"
