// ACADEMIC_NEXUS_SERVER v21.21 [9ROUTER_CORE_INTEGRATION]
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

app.get('/health', (req, res) => res.json({ status: 'UP', infrastructure: '9ROUTER_STABLE' }));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/process-v1', async (req, res) => {
    const { messages, model, intensity, persona } = req.body;
    const systemPrompt = `You are ${persona || 'Nexus Oracle'}. Intensity: ${intensity}. Provide high-fidelity research synthesis.`;
    const fullMessages = [{ role: 'system', content: systemPrompt }, ...messages];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    try {
        console.log('[AI_REQ] Connecting to 9Router Sovereign Engine...');
        // Default to kr/claude-sonnet-4.5 if no model specified or using a default one
        const targetModel = model === 'gemini-2.0-flash' ? 'kr/claude-sonnet-4.5' : (model || 'kr/claude-sonnet-4.5');
        
        let aiResponse = await fetch(`http://localhost:20128/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer sovereign-key` // 9Router default is often open or uses internal keys
            },
            body: JSON.stringify({ 
                model: targetModel, 
                messages: fullMessages, 
                stream: true 
            }),
            signal: AbortSignal.timeout(15000)
        });

        if (!aiResponse.ok) {
            console.log('[BRIDGE_WARN] 9Router Busy, falling back to LiteLLM...');
            aiResponse = await fetch(`${process.env.LITELLM_BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.LITELLM_API_KEY}`
                },
                body: JSON.stringify({ model: 'gpt-4o', messages: fullMessages, stream: true }),
                signal: AbortSignal.timeout(10000)
            });
        }

        if (!aiResponse.ok) {
            throw new Error(`CORE_COLLAPSE: ${aiResponse.status}`);
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
        const fallbackJSON = JSON.stringify({
            choices: [{ delta: { content: `[ERROR] Neural Bridge Overload. Ensure '9router' is running in the background.\n\n*System Log: ${error.message}*` } }]
        });
        res.write(`data: ${fallbackJSON}\n\n`);
    } finally {
        res.write('data: [DONE]\n\n');
        res.end();
    }
});

app.listen(PORT, '0.0.0.0', () => console.log(`[SYS] Nexus Sovereign Core v21.21 ACTIVE on port ${PORT}`));