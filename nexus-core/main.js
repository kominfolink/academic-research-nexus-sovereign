require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { initiateSecurityAudit } = require('./nexus-bridge-v3');
const { exec } = require('child_process');

const app = express();
const PORT = process.env.PORT || 7860;

// Serve the Nexus Dashboard on /dashboard
app.use('/dashboard', express.static(__dirname));
app.use(express.json());

/**
 * NEXUS-CORE COMMAND GATEWAY v4.1
 * Neural Analysis Layer for Academic Synthesis.
 */
app.post('/api/execute', async (req, res) => {
    const { target } = req.body;
    console.log(`\n[NEXUS-CORE] ◈ Data Verification Request: ${target}`);
    
    // Default: Status
    res.json({ 
        status: 'READY', 
        response: "Academic Nexus Core ready for data synthesis."
    });
});

/**
 * ACADEMIC PROXY LAYER
 */
app.use('/', createProxyMiddleware({
    target: 'https://en.wikipedia.org',
    changeOrigin: true,
    selfHandleResponse: true,
    onProxyReq: (proxyReq, req, res) => {
        proxyReq.setHeader('X-Forwarded-For', '127.0.0.1');
    },
    onProxyRes: (proxyRes, req, res) => {
        let body = [];
        proxyRes.on('data', (chunk) => body.push(chunk));
        proxyRes.on('end', () => {
            body = Buffer.concat(body).toString();
            if (proxyRes.headers['content-type'] && proxyRes.headers['content-type'].includes('text/html')) {
                body = body.replace('</body>', '<script src="/dashboard/app.js"></script></body>');
            }
            res.writeHead(proxyRes.statusCode, proxyRes.headers);
            res.end(body);
        });
    }
}));

app.listen(PORT, () => {
    console.log(`\n================================================`);
    console.log(`[NEXUS] ACADEMIC SYNTHESIS ENGINE v19.2 ONLINE`);
    console.log(`[NEXUS] Dashboard: http://localhost:${PORT}/dashboard`);
    console.log(`================================================\n`);
});
