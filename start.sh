#!/bin/bash

# Exit on any error
set -e

# Use writable directory for GenieACS
GENIEACS_DIR="/tmp/genieacs"

echo "Starting GenieACS with MongoDB: $MONGODB_CONNECTION_URL"
echo "GenieACS directory: $GENIEACS_DIR"

# Clone and build GenieACS if not already done
if [ ! -d "$GENIEACS_DIR" ]; then
  echo "Cloning GenieACS to $GENIEACS_DIR..."
  git clone https://github.com/genieacs/genieacs.git "$GENIEACS_DIR"

  cd "$GENIEACS_DIR"

  echo "Installing dependencies..."
  npm install 2>&1 | tail -20

  echo "Building GenieACS..."
  npm run build 2>&1 | tail -20

  if [ ! -f "dist/bin/genieacs-nbi" ]; then
    echo "ERROR: Build failed! genieacs-nbi not found"
    ls -la dist/bin/ 2>/dev/null || echo "dist/bin directory not found"
    exit 1
  fi

  echo "Build successful!"
else
  echo "GenieACS already exists, skipping clone..."
  cd "$GENIEACS_DIR"
fi

echo "================================"
echo "Starting GenieACS Services"
echo "MongoDB URL: $MONGODB_CONNECTION_URL"
echo "Node version: $(node --version)"
echo "================================"

# Start CWMP service (port 7547)
echo "Starting CWMP server..."
node dist/bin/genieacs-cwmp &
CWMP_PID=$!
echo "CWMP started with PID $CWMP_PID"

sleep 2

# Start NBI service (port 7557)
echo "Starting NBI server..."
node dist/bin/genieacs-nbi &
NBI_PID=$!
echo "NBI started with PID $NBI_PID"

echo "Both services running. Waiting..."

# Wait for both processes
wait
