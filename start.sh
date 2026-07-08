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
export GENIEACS_NBI_PORT=8000
export GENIEACS_NBI_INTERFACE=127.0.0.1

# Create CORS proxy
cat > /tmp/cors-proxy.js << 'PROXY_EOF'
const http = require('http');
const net = require('net');

const BACKEND_HOST = 'localhost';
const BACKEND_PORT = 8000;

const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Forward request
  const options = {
    hostname: BACKEND_HOST,
    port: BACKEND_PORT,
    path: req.url,
    method: req.method,
    headers: req.headers
  };

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    res.writeHead(502);
    res.end('Bad Gateway');
  });

  req.pipe(proxyReq);
});

server.listen(80, '0.0.0.0', () => {
  console.log('CORS proxy listening on port 80, forwarding to ' + BACKEND_HOST + ':' + BACKEND_PORT);
});
PROXY_EOF

# Use exec to replace shell process
exec node -e "
const cwmp = require('child_process').spawn('node', ['dist/bin/genieacs-cwmp'], {
  stdio: 'inherit',
  env: Object.assign({}, process.env, { GENIEACS_MONGODB_CONNECTION_URL: '$GENIEACS_MONGODB_CONNECTION_URL' })
});

setTimeout(() => {
  const nbi = require('child_process').spawn('node', ['dist/bin/genieacs-nbi'], {
    stdio: 'inherit',
    env: Object.assign({}, process.env, {
      GENIEACS_MONGODB_CONNECTION_URL: '$GENIEACS_MONGODB_CONNECTION_URL',
      GENIEACS_NBI_PORT: '8000',
      GENIEACS_NBI_INTERFACE: '127.0.0.1'
    })
  });

  setTimeout(() => {
    const proxy = require('child_process').spawn('node', ['/tmp/cors-proxy.js'], {
      stdio: 'inherit'
    });
  }, 2000);
}, 2000);

process.on('SIGTERM', () => {
  cwmp.kill();
  process.exit(0);
});
"
