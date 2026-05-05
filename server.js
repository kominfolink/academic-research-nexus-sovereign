// ACADEMIC_NEXUS_SERVER v21.10 [SOVEREIGN_GLOBAL]
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.on('uncaughtException', (err) => {
    console.error('[CRITICAL_ERR] HANDLED:', err.message);
});

const app = express();
const PORT = process.env.PORT || 3000;

// [HEALTH-CHECK & UI]
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Hardened Middleware Stack
app.use(express.json());
app.use(express.static(__dirname)); 
app.use(express.static(path.join(__dirname, 'nexus-core')));

const upload = multer({ storage: multer.memoryStorage() });

// [API BRIDGE] 
app.post('/api/analyze', upload.single('file'), (req, res) => {
    console.log('[SYS] Analysis Request Received');
    res.json({ status: 'PROCESSING', detail: 'Neural bridge operational.' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYS] Core v21.10 SOVEREIGN ACTIVE on port ${PORT}`);
});