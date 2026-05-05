// ZETA SOVEREIGN CORE LOGIC v21.12 [BOT EDITION]
document.addEventListener('DOMContentLoaded', () => {
    const unleashBtn = document.getElementById('unleashBtn');
    const cloakBtn = document.getElementById('cloakBtn');
    const logChannel = document.getElementById('logOutput');
    const chatContainer = document.getElementById('chatContainer');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');

    const addLog = (msg, status = 'INFO', color = '#00f2fe') => {
        const entry = document.createElement('div');
        entry.style.marginBottom = '0.5rem';
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        entry.innerHTML = `[${time}] ${msg} <span style="color: ${color}; font-weight: bold;">${status}</span>`;
        logChannel.appendChild(entry);
        logChannel.scrollTop = logChannel.scrollHeight;
    };

    const addChatMessage = (msg, sender = 'BOT', color = '#00f2fe') => {
        const entry = document.createElement('div');
        entry.style.marginBottom = '1rem';
        entry.innerHTML = `<span style="color: ${color}; font-weight: bold;">[${sender}]</span> ${msg}`;
        chatContainer.appendChild(entry);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    };

    const handleBotResponse = (prompt) => {
        const p = prompt.toLowerCase();
        addChatMessage('Analysing command sequence...', 'SYS', '#6366f1');
        
        setTimeout(() => {
            if (p.includes('hello') || p.includes('hi')) {
                addChatMessage('Greetings, Alpha. Bot Alpha-7 is online and ready for deployment. What is our objective?');
            } else if (p.includes('search') || p.includes('find')) {
                addChatMessage('Initiating global search protocols via Jina.ai nodes... Accessing restricted archives.');
                addLog('Search pulse emitted to 128 nodes.', 'NETWORK', '#10b981');
            } else if (p.includes('status')) {
                addChatMessage('All systems operational. Sovereign layer 7 encryption active. 16GB VRAM ready for heavy synthesis.');
            } else {
                addChatMessage("Command received. Processing via Neural Bridge. I'm ready to assist with research, code, or data synthesis.");
            }
        }, 1000);
    };

    sendBtn.addEventListener('click', () => {
        const val = userInput.value.trim();
        if (val) {
            addChatMessage(val, 'YOU', '#fff');
            userInput.value = '';
            handleBotResponse(val);
        }
    });

    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendBtn.click();
    });

    // ... (keep previous cloak/unleash logic)
    if (unleashBtn) {
        unleashBtn.addEventListener('click', () => {
            addLog('Initializing Sovereign AI Vector sequence...', 'ORCHESTRATOR', '#6366f1');
            addChatMessage('Agent Unleashed. I am now monitoring all local signals.', 'BOT');
        });
    }

    if (cloakBtn) {
        cloakBtn.addEventListener('click', () => {
            addLog('Stealth toggle triggered.', 'CLOAK_SYS');
        });
    }
});
