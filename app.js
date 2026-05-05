// ZETA SOVEREIGN CORE LOGIC v21.11
document.addEventListener('DOMContentLoaded', () => {
    const unleashBtn = document.getElementById('unleashBtn');
    const cloakBtn = document.getElementById('cloakBtn');
    const logChannel = document.getElementById('logOutput');

    const addLog = (msg, status = 'INFO', color = '#00f2fe') => {
        const entry = document.createElement('div');
        entry.style.marginBottom = '0.5rem';
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        
        entry.innerHTML = `[${time}] ${msg} <span style="color: ${color}; font-weight: bold;">${status}</span>`;
        
        logChannel.appendChild(entry);
        logChannel.scrollTop = logChannel.scrollHeight;
    };

    if (unleashBtn) {
        unleashBtn.addEventListener('click', () => {
            unleashBtn.innerText = 'EXECUTING...';
            unleashBtn.disabled = true;
            unleashBtn.style.opacity = '0.5';

            addLog('Initializing Sovereign AI Vector sequence...', 'ORCHESTRATOR', '#6366f1');
            
            setTimeout(() => {
                addLog('Neural bridge established via Gemini-4-Thinking.', 'LLM_AGENT', '#0ea5e9');
            }, 1000);

            setTimeout(() => {
                addLog('Offensive research modules loaded successfully.', 'SUCCESS', '#10b981');
                unleashBtn.innerText = 'AGENT UNLEASHED';
                unleashBtn.style.opacity = '1';
                unleashBtn.style.background = 'rgba(16, 185, 129, 0.2)';
                unleashBtn.style.color = '#10b981';
                unleashBtn.style.border = '1px solid #10b981';
            }, 2500);
        });
    }

    if (cloakBtn) {
        let cloaked = true;
        cloakBtn.addEventListener('click', () => {
            cloaked = !cloaked;
            if (cloaked) {
                cloakBtn.innerText = 'CLOAK PROTOCOL: ACTIVE';
                cloakBtn.style.background = 'linear-gradient(135deg, #4facfe, #00f2fe)';
                cloakBtn.style.color = '#000';
                addLog('Stealth masking protocols RE-ENGAGED.', 'CLOAK_SYS', '#00f2fe');
            } else {
                cloakBtn.innerText = 'CLOAK PROTOCOL: DISABLED';
                cloakBtn.style.background = 'rgba(244, 63, 94, 0.2)';
                cloakBtn.style.color = '#f43f5e';
                cloakBtn.style.border = '1px solid #f43f5e';
                addLog('WARNING: Stealth masking DISABLED. Signature exposed.', 'WARNING', '#f43f5e');
            }
        });
    }
});
