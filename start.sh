#!/bin/bash

# Use writable directory for GenieACS
GENIEACS_DIR="/tmp/genieacs"

echo "Starting GenieACS with MongoDB: $MONGODB_CONNECTION_URL"
echo "GenieACS directory: $GENIEACS_DIR"

# Clone and build GenieACS if not already done
if [ ! -d "$GENIEACS_DIR" ]; then
  echo "================================"
  echo "Cloning GenieACS..."
  echo "================================"
  git clone https://github.com/genieacs/genieacs.git "$GENIEACS_DIR" || exit 1

  cd "$GENIEACS_DIR"

  echo "================================"
  echo "Installing dependencies..."
  echo "================================"
  npm install || exit 1

  echo "================================"
  echo "Building GenieACS..."
  echo "================================"
  npm run build || exit 1

  echo "================================"
  echo "Build complete. Checking files..."
  echo "================================"
  ls -la dist/bin/ 2>&1 || echo "ERROR: dist/bin directory not found!"

  if [ ! -f "dist/bin/genieacs-cwmp" ] || [ ! -f "dist/bin/genieacs-nbi" ]; then
    echo "ERROR: Build failed! Required files not found:"
    echo "  genieacs-cwmp: $([ -f dist/bin/genieacs-cwmp ] && echo 'EXISTS' || echo 'MISSING')"
    echo "  genieacs-nbi: $([ -f dist/bin/genieacs-nbi ] && echo 'EXISTS' || echo 'MISSING')"
    exit 1
  fi

  echo "Build verified successfully!"
else
  echo "GenieACS already exists at $GENIEACS_DIR"
  cd "$GENIEACS_DIR"
  echo "Checking if built files exist..."
  ls -la dist/bin/ 2>&1 || echo "ERROR: dist/bin not found!"
fi

echo ""
echo "================================"
echo "Starting GenieACS Services"
echo "MongoDB URL: $MONGODB_CONNECTION_URL"
echo "Node version: $(node --version)"
echo "PWD: $(pwd)"
echo "Files to run:"
echo "  - $(pwd)/dist/bin/genieacs-cwmp"
echo "  - $(pwd)/dist/bin/genieacs-nbi"
echo "================================"
echo ""

# Start CWMP service (port 7547)
echo "[$(date)] Starting CWMP server..."
node dist/bin/genieacs-cwmp &
CWMP_PID=$!
echo "[$(date)] CWMP started with PID $CWMP_PID"

sleep 2

# Start NBI service (port 7557)
echo "[$(date)] Starting NBI server..."
node dist/bin/genieacs-nbi &
NBI_PID=$!
echo "[$(date)] NBI started with PID $NBI_PID"

echo "[$(date)] Both services running. Waiting for them to exit..."

# Wait for both processes
wait $CWMP_PID $NBI_PID
EXIT_CODE=$?

echo "[$(date)] Services exited with code $EXIT_CODE"
exit $EXIT_CODE
