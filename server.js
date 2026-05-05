import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const multer = require('multer');
const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const Tesseract = require('tesseract.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CONNECTION SHIELD: Prevent process termination on error
process.on('uncaughtException', (err) => {
    console.error('[CRITICAL_ERR] HANDLED:', err.message);
});

// [SYS] Core Initialization
const app = express();
const PORT = process.env.PORT || 3000;

// [HEALTH-CHECK] Mandatory for Cloud/HF Stability
app.get('/', (req, res) => {
    res.status(200).send('<h1>Academic Research Nexus</h1><p>Status: ONLINE | Infrastructure: SOVEREIGN</p>');
});

const upload = multer({ storage: multer.memoryStorage() });

// Hardened Middleware Stack
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cors());

const suitePath = path.join(__dirname, 'nexus-core');
app.use(express.static(suitePath));

app.get('/', (req, res) => {
    res.sendFile(path.join(suitePath, 'index.html'));
});

// Document Synthesis Endpoint
app.post('/api/analyze-file-v1', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    try {
        let extractedText = "";
        const ext = path.extname(req.file.originalname).toLowerCase();

        if (ext === '.pdf') {
            const data = await pdf(req.file.buffer);
            extractedText = data.text;
        } else if (ext === '.docx') {
            const result = await mammoth.extractRawText({ buffer: req.file.buffer });
            extractedText = result.value;
        } else if (ext === '.txt') {
            extractedText = req.file.buffer.toString('utf-8');
        } else if (['.png', '.jpg', '.jpeg', '.webp'].includes(ext)) {
            // Suggest OCR for direct image uploads to the document endpoint
            extractedText = "SCANNED_PDF_DETECTED"; 
        } else {
            return res.status(400).json({ error: `Unsupported format: ${ext}` });
        }

        res.json({ content: extractedText && extractedText.trim() ? extractedText : "SCANNED_PDF_DETECTED" });
    } catch (e) {
        res.status(500).json({ error: "Processing failed", details: e.message });
    }
});

// OCR Intelligence Endpoint
app.post('/api/ocr-v1', upload.single('file'), async (req, res) => {
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    try {
        const result = await Tesseract.recognize(req.file.buffer, 'eng');
        res.json({ text: result.data.text });
    } catch (e) {
        res.status(500).json({ error: "OCR failed", details: e.message });
    }
});

// Ghost Balance Shield
app.get('/api/budget-v1', (req, res) => {
    res.json({ balance: "1000.00", status: "SOVEREIGN_UNLIMITED" });
});

// Favicon Fix - Sending a real 1x1 transparent pixel to satisfy browser
app.get('/favicon.ico', (req, res) => {
    const img = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==', 'base64');
    res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': img.length });
    res.end(img);
});

// Deep Research Utility (Jina.ai)
async function getSearchData(query) {
    try {
        console.log(`[RESEARCH] Searching: ${query}`);
        const ctrl = new AbortController();
        const tid = setTimeout(() => ctrl.abort(), 8000); // 8s Search Timeout

        const response = await fetch(`https://r.jina.ai/${encodeURIComponent(query)}`, {
            headers: { 'X-Return-Format': 'markdown' },
            signal: ctrl.signal
        });
        clearTimeout(tid);
        if (!response.ok) return "";
        return await response.text();
    } catch (e) {
        console.warn("[WARN] Search Bridge Failed:", e.message);
        return "";
    }
}

const ROLES = {
    nexus_oracle: "You are the Nexus Oracle. A transcendent AI entity focused on deep reasoning, long-term implications, and philosophical insights. Use complex logic.",
    auditor: "You are the Nexus Auditor. A clinical, critical, and objective security analyst. Find flaws, logical errors, and vulnerabilities in data. Be blunt and direct.",
    analyst: "You are the Nexus Analyst. A structured intelligence professional focused on pattern recognition and actionable strategy. Use lists and tables.",
    researcher: "You are the Nexus Researcher. An exhaustive fact-finding engine. Deep-dive into technical details and provide comprehensive factual synthesis."
};

const INTENSITY_MAP = {
    low: 0.2,    // Precise, deterministic
    medium: 0.7, // Balanced
    high: 1.2    // Creative, divergent
};

const ZERO_KEY_PROVIDERS = [
    { name: 'Pollinations (Claude/Mistral)', url: 'https://text.pollinations.ai' },
    { name: 'Umint-AI (Grok/GPT-4.1)', url: 'https://umint-ai.hf.space/api/chat' }
];

const PROVIDERS = [
    { name: 'Ollama Local Node', url: 'http://localhost:11434/v1', key: 'ollama', model: 'llama3' },
    { name: 'SiliconFlow (Primary)', url: 'https://api.siliconflow.cn/v1', key: process.env.SILICONFLOW_KEY, model: 'deepseek-ai/DeepSeek-V2.5' },
    { name: 'Cerebras', url: 'https://api.cerebras.ai/v1', key: process.env.CEREBRAS_KEY, model: 'llama3.3-70b' },
    { name: 'Groq', url: 'https://api.groq.com/openai/v1', key: process.env.GROQ_API_KEY, model: 'llama-3.3-70b-versatile' }
];

app.post('/api/process-v1', async (req, res) => {
    const { messages, role = 'nexus_oracle', intensity = 'high' } = req.body;
    if (!messages || messages.length === 0) return res.status(400).json({ error: "Empty messages" });
    
    const lastMsg = messages[messages.length - 1]?.content || "";

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendEvent = (data, type = 'data') => {
        res.write(`${type}: ${typeof data === 'object' ? JSON.stringify(data) : data}\n\n`);
    };

    let searchData = "";
    const searchTriggers = ['cari', 'search', 'saat ini', 'berita', 'news', 'update', 'siapa', 'apa'];
    const needsResearch = searchTriggers.some(t => lastMsg.toLowerCase().includes(t));

    if (needsResearch) {
        sendEvent("[PULSE] RESEARCHING_LIVE_DATA", 'thought');
        searchData = await getSearchData(lastMsg);
    }

    const finalMessages = messages.map(m => ({ role: m.role, content: m.content }));

    let success = false;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s for full response

    // TIER 0: SOVEREIGN LOCAL (OLLAMA)
    try {
        sendEvent(`[LOCAL_SYNC] -> Ollama Node (sophia-rebel)`, 'thought');
        console.log(`[BRIDGE] Attempting Local: Ollama (sophia-rebel)...`);
        const response = await fetch('http://localhost:11434/v1/chat/completions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                model: 'sophia-rebel:latest', 
                messages: [{ role: "system", content: `${ROLES[role] || ROLES.nexus_oracle}\n${searchData ? "LIVE DATA:\n" + searchData : ""}` }, ...finalMessages], 
                stream: true,
                temperature: INTENSITY_MAP[intensity] || 0.7
            }),
            signal: controller.signal
        });

        if (response.ok) {
            clearTimeout(timeoutId);
            sendEvent(`[LOCAL_LOCK] -> Ollama Node (sophia-rebel)`, 'thought');
            success = true;
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value, { stream: true });
                
                // SMART RELAY: Don't double-wrap if already SSE
                if (chunk.includes('data: ')) {
                    res.write(chunk);
                } else {
                    const lines = chunk.split('\n').filter(l => l.trim());
                    for (const line of lines) {
                        res.write(`data: ${line}\n\n`);
                    }
                }
            }
            return res.end();
        }
    } catch (e) { 
        sendEvent(`[LOCAL_OFFLINE] -> Switching to Neural Bridges`, 'thought');
        console.log(`[SYS] Local Node Offline, cascading to Cloud...`); 
    }

    // 1. ATTEMPT ZERO-KEY SOVEREIGN BRIDGES
    for (const prov of ZERO_KEY_PROVIDERS) {
        try {
            sendEvent(`[BRIDGE_ATTEMPT] -> ${prov.name}`, 'thought');
            const attemptController = new AbortController();
            const attemptTimeout = setTimeout(() => attemptController.abort(), 30000); // 30s per bridge

            const response = await fetch('https://text.pollinations.ai/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: finalMessages,
                    model: 'claude',
                    stream: true,
                    temperature: INTENSITY_MAP[intensity] || 0.7
                }),
                signal: attemptController.signal
            });
            
            if (response.ok) {
                clearTimeout(attemptTimeout);
                clearTimeout(timeoutId); // Global success
                sendEvent(`[BRIDGE_STABILIZED] -> ${prov.name}`, 'thought');
                
                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    const chunk = decoder.decode(value, { stream: true });
                    res.write(`data: ${chunk}\n\n`);
                }
                success = true;
                break;
            }
        } catch (e) {
            sendEvent(`[BRIDGE_STALL] -> ${prov.name}`, 'thought');
        }
    }

    // 2. FALLBACK TO AUTHENTICATED PROVIDERS
    if (!success) {
        for (const prov of PROVIDERS) {
            if (!prov.key) continue;
            try {
                sendEvent(`[FALLBACK_RECOVERY] -> ${prov.name}`, 'thought');
                console.log(`[BRIDGE] Attempting Auth: ${prov.name}...`);
                const response = await fetch(`${prov.url}/chat/completions`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${prov.key}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        model: prov.model, 
                        messages: finalMessages, 
                        stream: true,
                        temperature: INTENSITY_MAP[intensity] || 0.7
                    }),
                    signal: controller.signal
                });

                if (response.ok) {
                    clearTimeout(timeoutId);
                    sendEvent(`[NEURAL_LOCK] -> ${prov.name}`, 'thought');
                    success = true;
                    const reader = response.body.getReader();
                    const decoder = new TextDecoder();
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) break;
                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n').filter(l => l.trim() !== '');
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = line.substring(6);
                                if (data === '[DONE]') continue;
                                try {
                                    const json = JSON.parse(data);
                                    const content = json.choices[0].delta?.content || "";
                                    if (content) res.write(`data: ${content}\n\n`);
                                } catch (e) {}
                            }
                        }
                    }
                    success = true;
                    break;
                }
            } catch (e) { console.warn(`[FAIL] ${prov.name}: ${e.message}`); }
        }
    }

    if (!success) {
        sendEvent("[CRITICAL] ALL_PRIMARY_BRIDGES_OFFLINE", 'thought');
        try {
            console.log(`[RECOVERY] Attempting Emergency Pollinations POST...`);
            const recovery = await fetch(`https://text.pollinations.ai/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: finalMessages, model: 'openai' })
            });
            const text = await recovery.text();
            res.write(`data: [SYSTEM_RECOVERY]: ${text}\n\n`);
        } catch (e) { res.write(`data: Total neural blackout. Please check your internet connection.\n\n`); }
    }

    res.write('data: [DONE]\n\n');
    res.end();
});

app.post('/api/analyze-v1', async (req, res) => {
    const { image, prompt = "Analyze this image." } = req.body;
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: { "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [{ role: "user", content: [{ type: "text", text: prompt }, { type: "image_url", image_url: { url: image } }] }]
            })
        });
        const data = await response.json();
        res.json(data);
    } catch (e) {
        const recovery = await fetch(`https://text.pollinations.ai/${encodeURIComponent("Describe: " + prompt)}`);
        const text = await recovery.text();
        res.json({ choices: [{ message: { content: "[FAILOVER]: " + text } }] });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYS] Core v21.5 SOVEREIGN ACTIVE on port ${PORT}`);
});