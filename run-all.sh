#!/bin/bash

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GENIEACS_DIR="/Users/sbastola/Private/genieacs"
LOG_DIR="/tmp/genieacs-logs"

# Create log directory
mkdir -p $LOG_DIR

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Home Security Dashboard - Starting All Services        ║"
echo "║                     (5 virtual devices)                         ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Start Docker containers (MongoDB, Redis, CPE Simulators)
echo "📦 Step 1: Starting MongoDB, Redis & 5 CPE Simulators..."
cd $PROJECT_DIR
docker-compose up -d mongodb redis cpe-simulator-1 cpe-simulator-2 cpe-simulator-3 cpe-simulator-4 cpe-simulator-5 > /dev/null 2>&1

echo "   ✅ MongoDB started (port 27017)"
echo "   ✅ Redis started (port 6379)"
echo "   ✅ 5 CPE Simulators started"
echo ""

# Wait for MongoDB to be ready
echo "⏳ Waiting for MongoDB to be ready..."
for i in {1..30}; do
  if docker exec genieacs-mongo mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "   ✅ MongoDB ready"
    break
  fi
  sleep 1
done
echo ""

# Step 2: Build GenieACS
echo "🔨 Step 2: Building GenieACS..."
cd $GENIEACS_DIR
npm run build > /dev/null 2>&1
echo "   ✅ Build complete"
echo ""

# Step 3: Start GenieACS CWMP
echo "🚀 Step 3: Starting GenieACS CWMP (port 7547)..."
export MONGODB_CONNECTION_URL="mongodb://localhost/genieacs"
export REDIS_URL="redis://localhost"

$GENIEACS_DIR/dist/bin/genieacs-cwmp > $LOG_DIR/cwmp.log 2>&1 &
CWMP_PID=$!

# Wait for CWMP to start
sleep 2
echo "   ✅ CWMP started (PID: $CWMP_PID)"
echo ""

# Step 4: Start GenieACS NBI
echo "📡 Step 4: Starting GenieACS NBI (port 7557)..."
$GENIEACS_DIR/dist/bin/genieacs-nbi > $LOG_DIR/nbi.log 2>&1 &
NBI_PID=$!

# Wait for NBI to start
sleep 2
echo "   ✅ NBI started (PID: $NBI_PID)"
echo ""

# Step 5: Wait for CPE Simulators to check in
echo "⏳ Step 5: Waiting for CPE Simulators to check in..."
sleep 5
echo "   ✅ CPE Simulators running"
echo ""

# Step 6: Start React App
echo "⚛️  Step 6: Starting React App (port 5173)..."
echo ""
cd $PROJECT_DIR
npm run dev

# Cleanup on exit
trap "
echo ''
echo '🛑 Stopping all services...'
kill $CWMP_PID $NBI_PID 2>/dev/null || true
cd $PROJECT_DIR && docker-compose down > /dev/null 2>&1
echo '✅ All services stopped'
" EXIT
