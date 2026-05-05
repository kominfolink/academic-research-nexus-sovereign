// ACADEMIC_NEXUS_SERVER v21.15 [SOVEREIGN_FAILSAFE]
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

app.get('/health', (req, res) => res.json({ status: 'UP', infrastructure: 'SOVEREIGN' }));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/process-v1', async (req, res) => {
    const { messages, model, intensity, persona } = req.body;
    console.log(`[AI_REQ] Incoming: ${persona} | Model: ${model}`);

    const systemPrompt = `You are ${persona || 'Nexus Oracle'}. Intensity: ${intensity}. Provide elite insights.`;
    const fullMessages = [{ role: 'system', content: systemPrompt }, ...messages];

    // --- STRATEGY 1: LITELLM ---
    try {
        console.log('[AI_STRATEGY] Attempting LiteLLM...');
        const response = await fetch(`${process.env.LITELLM_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LITELLM_API_KEY}`
            },
            body: JSON.stringify({ model: model || 'gpt-4o', messages: fullMessages }),
            signal: AbortSignal.timeout(10000) // 10s timeout
        });

        if (response.ok) {
            const data = await response.json();
            return res.json({ content: data.choices[0].message.content });
        }
        console.warn('[AI_WARN] LiteLLM failed, falling back...');
    } catch (e) {
        console.error('[AI_ERR_LITELLM]', e.message);
    }

    // --- STRATEGY 2: OPENROUTER ---
    try {
        console.log('[AI_STRATEGY] Attempting OpenRouter...');
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                'HTTP-Referer': 'https://github.com/kominfolink',
                'X-Title': 'Sovereign Nexus'
            },
            body: JSON.stringify({ model: 'google/gemini-2.0-flash-001', messages: fullMessages }),
            signal: AbortSignal.timeout(10000)
        });

        if (response.ok) {
            const data = await response.json();
            return res.json({ content: data.choices[0].message.content });
        }
        console.warn('[AI_WARN] OpenRouter failed, falling back to Heuristic...');
    } catch (e) {
        console.error('[AI_ERR_OPENROUTER]', e.message);
    }

    // --- STRATEGY 3: HEURISTIC FALLBACK ---
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    let reply = "The Neural Bridge is currently experiencing high turbulence. However, my local heuristic engine remains active. Please re-verify your API credentials in .env.";
    if (lastMsg.includes('hi') || lastMsg.includes('hello')) reply = "Greetings. Connection is unstable, but I am here. How can I assist in offline mode?";
    
    res.json({ content: `[HEURISTIC_MODE] ${reply}` });
});

const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/analyze', upload.single('file'), (req, res) => {
    res.json({ status: 'PROCESSING', detail: 'Neural bridge operational.' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYS] Nexus Core v21.15 FAILSAFE ACTIVE on port ${PORT}`);
});