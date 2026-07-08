#!/bin/bash

# Exit on any error
set -e

# Use writable directory for GenieACS
GENIEACS_DIR="/tmp/genieacs"

echo "Starting GenieACS with MongoDB: $MONGODB_CONNECTION_URL"

# ALWAYS rebuild - don't cache in /tmp
echo "Removing any existing GenieACS build..."
rm -rf "$GENIEACS_DIR"

echo "================================"
echo "Cloning GenieACS from GitHub..."
echo "================================"
git clone --depth 1 https://github.com/genieacs/genieacs.git "$GENIEACS_DIR" || {
  echo "ERROR: Failed to clone GenieACS"
  exit 1
}

cd "$GENIEACS_DIR"

echo ""
echo "================================"
echo "Installing dependencies (including dev)..."
echo "================================"
npm install --include=dev || {
  echo "ERROR: npm install failed"
  exit 1
}

echo ""
echo "================================"
echo "Building GenieACS..."
echo "================================"
npm run build || {
  echo "ERROR: Build failed"
  exit 1
}

echo ""
echo "================================"
echo "Verifying build..."
echo "================================"
ls -la dist/bin/ || {
  echo "ERROR: dist/bin directory not found after build"
  exit 1
}

echo "Build verified! Files found:"
ls -1 dist/bin/

echo ""
echo "================================"
echo "Starting GenieACS Services"
echo "MongoDB URL: $MONGODB_CONNECTION_URL"
echo "Node version: $(node --version)"
echo "================================"
echo ""

# Start CWMP service (port 7547)
echo "[$(date)] Starting CWMP server on port 7547..."
node dist/bin/genieacs-cwmp &
CWMP_PID=$!
echo "[$(date)] CWMP started with PID $CWMP_PID"

sleep 2

# Start NBI service (port 7557)
echo "[$(date)] Starting NBI server on port 7557..."
node dist/bin/genieacs-nbi &
NBI_PID=$!
echo "[$(date)] NBI started with PID $NBI_PID"

echo "[$(date)] Both services running. Waiting..."

# Wait for both processes
wait $CWMP_PID $NBI_PID
EXIT_CODE=$?

echo "[$(date)] Services exited with code $EXIT_CODE"
exit $EXIT_CODE
