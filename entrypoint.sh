#!/bin/sh

# Set default MongoDB connection URL if not provided
export MONGODB_CONNECTION_URL="${MONGODB_CONNECTION_URL:-mongodb://localhost/genieacs}"
export GENIEACS_MONGODB_CONNECTION_URL="${MONGODB_CONNECTION_URL}"
export REDIS_URL="${REDIS_URL:-}"
export NODE_ENV="${NODE_ENV:-production}"

echo "Starting GenieACS"
echo "MongoDB URL: $MONGODB_CONNECTION_URL"
echo "Node env: $NODE_ENV"

# Create GenieACS config directory
mkdir -p /etc/genieacs

# Create config file for GenieACS
cat > /etc/genieacs/config.json << EOF
{
  "mongodb": {
    "connectionUrl": "$MONGODB_CONNECTION_URL"
  },
  "redis": {
    "url": "$REDIS_URL"
  }
}
EOF

echo "Created config file:"
cat /etc/genieacs/config.json

# Export for GenieACS
export GENIEACS_CONFIG_FILE=/etc/genieacs/config.json

# Start both services
echo "Starting CWMP server..."
node /genieacs/dist/bin/genieacs-cwmp &
CWMP_PID=$!
echo "CWMP started with PID $CWMP_PID"

sleep 2

echo "Starting NBI server..."
node /genieacs/dist/bin/genieacs-nbi &
NBI_PID=$!
echo "NBI started with PID $NBI_PID"

# Wait for both processes
wait $CWMP_PID $NBI_PID
