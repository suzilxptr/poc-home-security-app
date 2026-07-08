const http = require('http');
const https = require('https');

const NBI_URL = 'http://localhost:7557';
const ALLOWED_ORIGINS = [
  'https://poc-home-security-app.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

const proxyServer = http.createServer((req, res) => {
  const origin = req.headers.origin;

  // Set CORS headers
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Forward request to NBI
  const url = new URL(NBI_URL + req.url);
  const proxyReq = http.request(url, {
    method: req.method,
    headers: req.headers
  }, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err);
    res.writeHead(502);
    res.end('Bad Gateway');
  });

  req.pipe(proxyReq);
});

const PORT = process.env.PORT || 7558;
proxyServer.listen(PORT, () => {
  console.log(`CORS proxy listening on port ${PORT}, forwarding to ${NBI_URL}`);
});
