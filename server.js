// ACADEMIC_NEXUS_SERVER v21.20 [DIAGNOSTIC_RESILIENCE]
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

app.get('/health', (req, res) => res.json({ status: 'UP', infrastructure: 'DIAGNOSTIC' }));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/api/process-v1', async (req, res) => {
    const { messages, model, intensity, persona } = req.body;
    const systemPrompt = `You are ${persona || 'Nexus Oracle'}. Intensity: ${intensity}.`;
    const fullMessages = [{ role: 'system', content: systemPrompt }, ...messages];

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');

    try {
        console.log('[AI_REQ] Connecting to LiteLLM Bridge...');
        let aiResponse = await fetch(`${process.env.LITELLM_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LITELLM_API_KEY}`
            },
            body: JSON.stringify({ model: model || 'gpt-4o', messages: fullMessages, stream: true }),
            signal: AbortSignal.timeout(10000)
        });

        if (!aiResponse.ok) {
            const errText = await aiResponse.text();
            console.error('[BRIDGE_FAIL] LiteLLM rejected:', aiResponse.status, errText);
            
            console.log('[AI_REQ] Trying OpenRouter Failover...');
            aiResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
                },
                body: JSON.stringify({ model: 'google/gemini-2.0-flash-001', messages: fullMessages, stream: true }),
                signal: AbortSignal.timeout(10000)
            });
        }

        if (!aiResponse.ok) {
            const errText = await aiResponse.text();
            throw new Error(`ALL_API_BRIDGES_FAILED (${aiResponse.status}): ${errText.slice(0, 50)}`);
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
        
        // HEURISTIC FALLBACK (Local Intelligence)
        const lastMsg = messages[messages.length - 1].content.toLowerCase();
        let heuristicReply = "My neural bridges are currently offline, but my local node is active. How can I assist you in emergency mode?";
        if (lastMsg.includes('hi') || lastMsg.includes('hello')) heuristicReply = "Greetings. Connection is unstable, but the Nexus is operational.";
        
        const fallbackJSON = JSON.stringify({
            choices: [{ delta: { content: `[LOCAL_NODE] ${heuristicReply}\n\n*Error Diagnostic: ${error.message}*` } }]
        });
        res.write(`data: ${fallbackJSON}\n\n`);
    } finally {
        res.write('data: [DONE]\n\n');
        res.end();
    }
});

app.listen(PORT, '0.0.0.0', () => console.log(`[SYS] Diagnostic Core v21.20 ACTIVE on port ${PORT}`));