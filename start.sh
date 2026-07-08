#!/bin/bash

GENIEACS_DIR="/tmp/genieacs"

echo "======================================"
echo "GenieACS Deployment on Render"
echo "======================================"
echo ""

# Verify env var
if [ -z "$GENIEACS_MONGODB_CONNECTION_URL" ]; then
  echo "ERROR: GENIEACS_MONGODB_CONNECTION_URL environment variable is not set!"
  echo "Please set it in Render dashboard under Environment Variables"
  exit 1
fi

# Clean
rm -rf "$GENIEACS_DIR"

# Clone and build
echo "Setting up GenieACS..."
git clone --depth 1 https://github.com/genieacs/genieacs.git "$GENIEACS_DIR" 2>&1 | grep -E "(Cloning|done)" || true
cd "$GENIEACS_DIR"

npm install --include=dev --no-audit --no-fund > /dev/null 2>&1
npm run build > /dev/null 2>&1

echo "GenieACS ready!"
echo ""

# Pass MongoDB URL as env var to Node processes (GenieACS requires GENIEACS_ prefix)
export GENIEACS_MONGODB_CONNECTION_URL="$GENIEACS_MONGODB_CONNECTION_URL"

# Use exec to replace shell process
exec node -e "
const cwmp = require('child_process').spawn('node', ['dist/bin/genieacs-cwmp'], {
  stdio: 'inherit',
  env: Object.assign({}, process.env, { GENIEACS_MONGODB_CONNECTION_URL: '$GENIEACS_MONGODB_CONNECTION_URL' })
});

setTimeout(() => {
  const nbi = require('child_process').spawn('node', ['dist/bin/genieacs-nbi'], {
    stdio: 'inherit',
    env: Object.assign({}, process.env, { GENIEACS_MONGODB_CONNECTION_URL: '$GENIEACS_MONGODB_CONNECTION_URL' })
  });
}, 2000);

process.on('SIGTERM', () => {
  cwmp.kill();
  process.exit(0);
});
"
