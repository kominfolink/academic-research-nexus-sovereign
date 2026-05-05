// ACADEMIC_NEXUS_SERVER v21.14 [SOVEREIGN_GLOBAL_AI]
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

// [HEALTH-CHECK]
app.get('/health', (req, res) => res.json({ status: 'UP', infrastructure: 'SOVEREIGN' }));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

// [AI PROCESSOR V1]
app.post('/api/process-v1', async (req, res) => {
    const { messages, model, intensity, persona } = req.body;
    console.log(`[AI] Processing request: ${model} | Intensity: ${intensity} | Persona: ${persona}`);

    try {
        // Prepare System Prompt based on Persona
        const systemPrompt = `You are ${persona || 'Nexus Oracle'}, an elite research intelligence. 
        Current operating intensity: ${intensity || 'high'}. 
        Provide exhaustive, accurate, and professional academic insights.`;

        const fullMessages = [
            { role: 'system', content: systemPrompt },
            ...messages
        ];

        // Attempt LiteLLM first
        const response = await fetch(`${process.env.LITELLM_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.LITELLM_API_KEY}`
            },
            body: JSON.stringify({
                model: model || 'gpt-4o',
                messages: fullMessages,
                stream: false
            })
        });

        const data = await response.json();
        
        if (data.choices && data.choices[0]) {
            res.json({ content: data.choices[0].message.content });
        } else {
            throw new Error('Invalid AI response structure');
        }

    } catch (error) {
        console.error('[AI_ERR]', error.message);
        res.status(500).json({ error: 'BRIDGE_STALLED', detail: error.message });
    }
});

const upload = multer({ storage: multer.memoryStorage() });
app.post('/api/analyze', upload.single('file'), (req, res) => {
    res.json({ status: 'PROCESSING', detail: 'Neural bridge operational.' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`[SYS] Nexus Core v21.14 ACTIVE on port ${PORT}`);
});