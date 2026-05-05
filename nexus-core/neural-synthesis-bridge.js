const axios = require('axios');

/**
 * NEURAL_SYNTHESIS_BRIDGE v19.2 [ACADEMIC_STABLE]
 * Standardized High-Performance Failover.
 */

const healthCache = {};
const HEALTH_TTL_MS = 5 * 60 * 1000;

function isProviderHealthy(name) {
    const entry = healthCache[name];
    if (!entry) return true;
    if (Date.now() - entry.ts > HEALTH_TTL_MS) return true;
    return entry.ok;
}

function markProviderHealth(name, ok) {
    healthCache[name] = { ok, ts: Date.now() };
}

const PROVIDERS = {
    groq: {
        url: "https://api.groq.com/openai/v1/chat/completions",
        model: "llama-3.3-70b-versatile",
        getKey: () => process.env.GROQ_API_KEY,
        requiresKey: true
    },
    openrouter: {
        url: "https://openrouter.ai/api/v1/chat/completions",
        model: "anthropic/claude-3.5-sonnet",
        getKey: () => process.env.OPENROUTER_API_KEY,
        requiresKey: true
    },
    nvidia: {
        url: "https://integrate.api.nvidia.com/v1/chat/completions",
        model: "meta/llama-3.1-70b-instruct",
        getKey: () => process.env.NVIDIA_API_KEY,
        requiresKey: true
    },
    pollinations: {
        url: "https://text.pollinations.ai/openai",
        model: "openai-fast",
        getKey: () => "free",
        requiresKey: false
    },
    ollama: {
        url: process.env.REMOTE_OLLAMA_URL || "http://localhost:11434/v1/chat/completions",
        model: "qwen2.5:latest",
        getKey: () => "",
        requiresKey: false
    }
};


class NeuralSynthesisBridge {
    constructor() {}

    async generateStrategicResponse(messages, preferred = 'groq') {
        const candidates = Object.keys(PROVIDERS);
        const ordered = [preferred, ...candidates.filter(c => c !== preferred)];
        const chain = ordered.filter(name => {
            const p = PROVIDERS[name];
            if (p.requiresKey && !p.getKey()) return false;
            if (!isProviderHealthy(name)) return false;
            return true;
        });

        if (chain.length === 0) chain.push('pollinations');

        const systemPrompt = `You are the Nexus Academic Assistant. 
Your purpose is to provide structured, logical analysis and data synthesis for research purposes.
Focus on precision, integrity, and depth.`;


        const finalMessages = [
            { role: "system", content: systemPrompt },
            ...(Array.isArray(messages) ? messages : [{ role: "user", content: messages }])
        ];

        for (const name of chain) {
            const p = PROVIDERS[name];
            try {
                console.log(`[NEXUS-BRIDGE] 🚀 Routing to ${name}...`);
                const response = await axios.post(p.url, {
                    model: p.model,
                    messages: finalMessages,
                    temperature: 0.7,
                    stream: true
                }, {
                    headers: {
                        'Authorization': p.getKey() ? `Bearer ${p.getKey()}` : '',
                        'Content-Type': 'application/json',
                    },
                    responseType: 'stream',
                    timeout: name === 'ollama' ? 60000 : 4000
                });

                markProviderHealth(name, true);
                return response.data;
            } catch (error) {
                console.error(`[NEXUS-ERROR] ⚠️ ${name} Connection Terminated.`);
                markProviderHealth(name, false);
            }
        }
        throw new Error('All academic data paths severed.');
    }
}

module.exports = NeuralSynthesisBridge;
