// ACADEMIC_NEXUS_SERVER v21.22 [SOVEREIGN_DIRECT_OPENCODE]
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
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

app.get('/health', (req, res) => res.json({ status: 'UP', infrastructure: 'DIRECT_OPENCODE' }));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/process-v1', async (req, res) => {
    const { messages, model, intensity, persona } = req.body;
    const systemPrompt = `You are ${persona || 'Nexus Oracle'}. Priority: High. Provide exhaustive research analysis.`;
    const fullMessages = [{ role: 'system', content: systemPrompt }, ...messages];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    try {
        console.log('[AI_REQ] Establishing Sovereign Direct Link (OpenCode)...');
        
        // Map common models to OpenCode compatible ones if needed
        const targetModel = (model && model.includes('gemini')) ? 'google/gemini-2.0-flash' : (model || 'gpt-4o-mini');

        let aiResponse = await fetch(`https://opencode.ai/zen/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer public',
                'x-opencode-client': 'desktop',
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify({ 
                model: targetModel, 
                messages: fullMessages, 
                stream: true 
            }),
            signal: AbortSignal.timeout(30000)
        });

        if (!aiResponse.ok) {
            const err = await aiResponse.text();
            throw new Error(`DIRECT_LINK_REJECTED: ${aiResponse.status} - ${err.slice(0, 100)}`);
        }

        const reader = aiResponse.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            res.write(decoder.decode(value));
        }

    } catch (error) {
        console.error('[CRITICAL_ERR]', error.message);
        
        // HEURISTIC FALLBACK
        const fallbackJSON = JSON.stringify({
            choices: [{ delta: { content: `[NEXUS_CORE] Establishing manual bridge due to: ${error.message}. Please retry in 5 seconds.` } }]
        });
        res.write(`data: ${fallbackJSON}\n\n`);
    } finally {
        res.write('data: [DONE]\n\n');
        res.end();
    }
});

app.listen(PORT, '0.0.0.0', () => console.log(`[SYS] Sovereign Direct Core v21.22 ACTIVE on port ${PORT}`));