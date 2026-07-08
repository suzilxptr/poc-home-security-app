#!/bin/sh

# Set default MongoDB connection URL if not provided
export MONGODB_CONNECTION_URL="${MONGODB_CONNECTION_URL:-mongodb://localhost/genieacs}"
export REDIS_URL="${REDIS_URL:-}"
export NODE_ENV="${NODE_ENV:-production}"

echo "Starting GenieACS with MongoDB: $MONGODB_CONNECTION_URL"

# Start both services
node /genieacs/dist/bin/genieacs-cwmp &
CWMP_PID=$!

node /genieacs/dist/bin/genieacs-nbi &
NBI_PID=$!

# Wait for both processes
wait $CWMP_PID $NBI_PID
