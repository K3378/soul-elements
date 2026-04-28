/**
 * Soul Elements — Main Server Entry
 * 
 * Unified server that runs Express API + Next.js frontend.
 * In production, the Next.js standalone server is started as a child process
 * and Express proxies frontend requests to it.
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { fork } = require('child_process');
const http = require('http');

const app = express();
const PORT = process.env.PORT || 3001;

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// ========== API Routes ==========
const analyzeRouter = require('./routes/analyze');
app.use('/api', analyzeRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stripe webhook (raw body needed for signature verification)
app.post('/webhook/stripe', express.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  // TODO: Verify webhook signature when Kevin provides the secret
  res.json({ received: true });
});

// Report status endpoint
app.get('/api/report/status', (req, res) => {
  res.json({ status: 'ready', message: 'Report generation endpoint ready.' });
});

// ========== Frontend (Next.js) ==========
// In production, proxy to the Next.js standalone server
let nextServerUrl = `http://127.0.0.1:${PORT + 1}`;
let nextServerReady = false;

function proxyToNext(req, res) {
  if (!nextServerReady) {
    // Serve a loading page if Next.js isn't ready yet
    return res.send(`<!DOCTYPE html><html><head><title>Soul Elements</title><style>
      body{background:#0B0E1A;color:#F5F0E5;display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:system-ui,sans-serif;text-align:center}
      h1{font-family:Georgia,serif;color:#C9A84C;font-size:2rem}
      .spinner{width:40px;height:40px;border:3px solid rgba(201,168,76,0.2);border-top-color:#C9A84C;border-radius:50%;animation:spin .8s linear infinite;margin:20px auto}
      @keyframes spin{to{transform:rotate(360deg)}}
    </style></head><body>
    <div><div class="spinner"></div><h1>Awakening the Cosmos...</h1><p style="color:#8B8FA3">Your reading is being prepared</p></div>
    </body></html>`);
  }

  const options = {
    hostname: '127.0.0.1',
    port: PORT + 1,
    path: req.url,
    method: req.method,
    headers: req.headers,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    // Remove chunked encoding for 1:1 passthrough
    delete proxyRes.headers['content-length'];
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });

  proxyReq.on('error', (err) => {
    console.error('Proxy error:', err.message);
    res.status(502).send('Frontend unavailable');
  });

  req.pipe(proxyReq);
}

// Catch-all: proxy everything except API routes to Next.js
app.use((req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/webhook')) {
    return next();
  }
  proxyToNext(req, res);
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// ========== Start ==========
async function start() {
  // Start Next.js standalone server
  const frontendDir = path.join(__dirname, '..', 'frontend');
  const standaloneServer = path.join(frontendDir, 'server.js');

  try {
    const fs = require('fs');
    if (fs.existsSync(standaloneServer)) {
      const child = fork(standaloneServer, [], {
        env: { ...process.env, PORT: String(PORT + 1) },
        cwd: path.dirname(standaloneServer),
        stdio: 'pipe',
      });

      child.stdout.on('data', (data) => {
        const msg = data.toString();
        process.stdout.write(`[Next.js] ${msg}`);
        if (msg.includes('started') || msg.includes('listening') || msg.includes('ready')) {
          nextServerReady = true;
        }
      });

      child.stderr.on('data', (data) => {
        process.stderr.write(`[Next.js] ${data}`);
      });

      child.on('exit', (code) => {
        console.log(`Next.js server exited with code ${code}`);
        nextServerReady = false;
      });

      // Give Next.js time to start, then mark ready
      setTimeout(() => { nextServerReady = true; }, 5000);
    } else {
      console.log('Frontend standalone build not found. API-only mode.');
      console.log('Expected at:', standaloneServer);
    }
  } catch (err) {
    console.error('Failed to start Next.js:', err.message);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Soul Elements running on port ${PORT}`);
    console.log(`Health check: http://0.0.0.0:${PORT}/health`);
  });
}

start();
