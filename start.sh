#!/bin/bash

# Render passes environment variables correctly to shell scripts
echo "Starting GenieACS with MongoDB: $MONGODB_CONNECTION_URL"

# Clone and build GenieACS if not already done
if [ ! -d "/genieacs" ]; then
  echo "Cloning GenieACS..."
  git clone https://github.com/genieacs/genieacs.git /genieacs
  cd /genieacs
  npm install
  npm run build
else
  cd /genieacs
fi

# Start both services
echo "Starting CWMP..."
node dist/bin/genieacs-cwmp &

sleep 2

echo "Starting NBI..."
node dist/bin/genieacs-nbi &

wait
