// ACADEMIC_NEXUS_SERVER v21.16 [STREAMING_CORE]
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
    const { messages, model, intensity, persona, stream } = req.body;
    console.log(`[AI_STREAM] Req: ${persona} | Model: ${model}`);

    const systemPrompt = `You are ${persona || 'Nexus Oracle'}. Intensity: ${intensity}. Provide elite insights.`;
    const fullMessages = [{ role: 'system', content: systemPrompt }, ...messages];

    // Set headers for SSE (Server-Sent Events)
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    try {
        const aiResponse = await fetch(`${process.env.LITELLM_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LITELLM_API_KEY}`
            },
            body: JSON.stringify({
                model: model || 'gpt-4o',
                messages: fullMessages,
                stream: true 
            })
        });

        if (!aiResponse.ok) throw new Error('LiteLLM Stream Failed');

        const reader = aiResponse.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            res.write(chunk); // Forward the chunk directly to the frontend
        }

    } catch (error) {
        console.error('[STREAM_ERR]', error.message);
        // Fallback to static response if stream fails
        res.write(`data: ${JSON.stringify({ choices: [{ delta: { content: "[ERROR] Neural Bridge Interrupted. Re-verify API keys." } }] })}\n\n`);
    } finally {
        res.write('data: [DONE]\n\n');
        res.end();
    }
});

const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/analyze', upload.single('file'), (req, res) => {
    res.json({ status: 'PROCESSING', detail: 'Neural bridge operational.' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYS] Nexus Core v21.16 STREAMING ACTIVE on port ${PORT}`);
});