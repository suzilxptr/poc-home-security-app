#!/bin/sh

# Set MongoDB connection URL - this is what GenieACS expects
export MONGODB_CONNECTION_URL="${MONGODB_CONNECTION_URL:-mongodb://localhost/genieacs}"
export NODE_ENV="${NODE_ENV:-production}"

echo "================================"
echo "Starting GenieACS Backend"
echo "================================"
echo "MongoDB: $MONGODB_CONNECTION_URL"
echo "Node Environment: $NODE_ENV"
echo "================================"
echo ""

# Make sure we're in the right directory
cd /genieacs

# Start CWMP and NBI on separate ports
# CWMP listens on 7547
# NBI listens on 7557

echo "[$(date)] Starting genieacs-cwmp (port 7547)..."
node dist/bin/genieacs-cwmp &
CWMP_PID=$!

echo "[$(date)] Waiting 3 seconds..."
sleep 3

echo "[$(date)] Starting genieacs-nbi (port 7557)..."
node dist/bin/genieacs-nbi &
NBI_PID=$!

echo "[$(date)] Both services started. PIDs: CWMP=$CWMP_PID, NBI=$NBI_PID"
echo "[$(date)] Waiting for processes..."

# Wait for both to complete
wait
