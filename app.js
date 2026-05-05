// ZETA SOVEREIGN CORE LOGIC
document.addEventListener('DOMContentLoaded', () => {
    const deployBtn = document.getElementById('btn-deploy');
    const logChannel = document.getElementById('captured-log');

    const addLog = (msg, status = 'INFO', statusColor = '#94a3b8') => {
        const entry = document.createElement('div');
        entry.className = 'log-entry';
        const time = new Date().toLocaleTimeString('en-GB', { hour12: false });
        
        entry.innerHTML = `
            <span class="log-time">${time}</span>
            <span class="log-message">${msg}</span>
            <span class="log-status" style="background: ${statusColor}1A; color: ${statusColor};">${status}</span>
        `;
        
        logChannel.appendChild(entry);
        logChannel.scrollTop = logChannel.scrollHeight;
    };

    deployBtn.addEventListener('click', () => {
        deployBtn.innerText = 'EXECUTING...';
        deployBtn.style.opacity = '0.6';
        deployBtn.disabled = true;

        addLog('Requesting offensive AI vector sequence...', 'ORCHESTRATOR', '#6366f1');
        
        setTimeout(() => {
            addLog('AI Agent (Gemini 3.1 Pro) bypass verified. G3N3R4T1NG LUR3...', 'LLM_AGENT', '#0ea5e9');
        }, 1200);

        setTimeout(() => {
            const mimicUrl = 'http://localhost:9090/outlook_mimic.html';
            addLog(`Phishing asset deployed to Zeta node: ${mimicUrl}`, 'DEPLOYMENT', '#10b981');
            window.open(mimicUrl, '_blank');
        }, 2800);

        setTimeout(() => {
            addLog('Listening for exfiltration on P2P Bridge (Port 8080)', 'NET_LISTENER', '#f43f5e');
            deployBtn.innerText = 'OPERATIONAL';
            deployBtn.style.boxShadow = '0 0 30px rgba(16, 185, 129, 0.2)';
        }, 4500);

        setTimeout(() => {
            addLog('DATA CAPTURED: {target: "CEO_OFFICE", type: "JWT_TOKEN"}', 'EXFILTRATION', '#10b981');
            addLog('Relaying stolen unit to encrypted vault...', 'P2P_MESH', '#6366f1');
        }, 9000);
    });

    // Subtle micro-animation for panels
    const panels = document.querySelectorAll('.glass-panel');
    panels.forEach(p => {
        p.addEventListener('mousemove', (e) => {
            const rect = p.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            p.style.setProperty('--mouse-x', `${x}px`);
            p.style.setProperty('--mouse-y', `${y}px`);
        });
    });
});
