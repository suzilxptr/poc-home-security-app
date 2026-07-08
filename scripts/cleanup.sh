#!/bin/bash

set -e

echo "🧹 Cleaning up..."
echo ""

# Stop Docker containers
echo "Stopping Docker containers..."
docker-compose down -v

# Remove node_modules
echo "Removing node_modules..."
rm -rf node_modules

# Remove dist
echo "Removing build output..."
rm -rf dist

echo ""
echo "✅ Cleanup complete"
echo ""
