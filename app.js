/* app.js - GEMINI PRO INSPIRED SOVEREIGN NEXUS v21.0 */
const ICONS = {
    copy: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`,
    share: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" x2="12" y1="2" y2="15"/></svg>`,
    like: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.53l-1.6 7A2 2 0 0 1 18.23 21H7a2 2 0 0 1-2-2V11a2 2 0 0 1 .59-1.41L11.41 4c.47-.47 1.23-.47 1.7 0l2.35 2.36c.41.41.47 1.05.21 1.52Z"/></svg>`,
    dislike: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 14V2"/><path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.53l1.6-7A2 2 0 0 1 5.77 3H17a2 2 0 0 1 2 2v8a2 2 0 0 1-.59 1.41L12.59 20c-.47.47-1.23.47-1.7 0l-2.35-2.36c-.41-.41-.47-1.05-.21-1.52Z"/></svg>`,
    regenerate: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>`,
    volume: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`,
    more: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>`
};

document.addEventListener('DOMContentLoaded', () => {
    // 1. STATE & DOM ELEMENTS
    const chatInput = document.getElementById('chat-input');
    const chatForm = document.getElementById('chat-form');
    const btnSend = document.getElementById('btn-send');
    const chatMessages = document.getElementById('chat-messages');
    const chatWindow = document.getElementById('chat-window');
    const modelToggle = document.getElementById('model-toggle');
    const intensityToggle = document.getElementById('intensity-toggle');
    const personaToggle = document.getElementById('persona-toggle');
    const btnNewChat = document.getElementById('btn-new-chat');
    const imageUpload = document.getElementById('image-upload');
    const budgetValue = document.getElementById('budget-value');
    const bridgeStatus = document.getElementById('bridge-status');
    const latencyTelemetry = document.getElementById('latency-telemetry');
    const sessionList = document.getElementById('recent-sessions');
    const modalSettings = document.getElementById('modal-settings');
    const modalRoot = document.getElementById('modal-root');
    const btnSettings = document.getElementById('btn-settings');
    const btnRoot = document.getElementById('btn-root');
    const terminalInput = document.getElementById('terminal-input');
    const terminalOutput = document.getElementById('terminal-output');
    
    let isProcessing = false;
    let chatHistory = [];
    let currentThoughtBlock = null;

    // 2. CORE UTILITY FUNCTIONS
    const scrollToBottom = () => { chatWindow.scrollTop = chatWindow.scrollHeight; };
    const updateTelemetry = (status, latency = null) => {
        if (bridgeStatus) bridgeStatus.innerHTML = `<span class="pulse"></span> BRIDGE: ${status}`;
        if (latency !== null && latencyTelemetry) latencyTelemetry.innerText = `LATENCY: ${latency}ms`;
    };
    const updateBudget = () => {
        if (budgetValue) budgetValue.textContent = '$1000.00';
    };
    const saveSession = () => {
        localStorage.setItem('nexus_session', JSON.stringify(chatHistory));
    };
    const loadSession = () => {
        const saved = localStorage.getItem('nexus_session');
        if (saved) {
            chatHistory = JSON.parse(saved);
            chatHistory.forEach(msg => appendMessage(msg.role, msg.content));
        }
    };
    const saveToArchive = () => {
        if (chatHistory.length === 0) return;
        const saved = localStorage.getItem('nexus_archive') || '[]';
        const archive = JSON.parse(saved);
        const title = chatHistory[0].content.substring(0, 25) + "...";
        archive.unshift({ title, history: chatHistory });
        if (archive.length > 10) archive.pop();
        localStorage.setItem('nexus_archive', JSON.stringify(archive));
        updateSessionList();
    };
    const updateSessionList = () => {
        const saved = localStorage.getItem('nexus_archive') || '[]';
        const archive = JSON.parse(saved);
        const budgetCard = sessionList.querySelector('.budget-card');
        sessionList.innerHTML = '';
        if (budgetCard) sessionList.appendChild(budgetCard);
        archive.forEach((session, index) => {
            const item = document.createElement('div');
            item.className = 'sidebar-item session-item';
            item.innerHTML = `
                <span class="session-title">📂 ${session.title}</span>
                <button class="delete-btn" onclick="event.stopPropagation(); window.deleteArchivedSession(${index})">🗑️</button>
            `;
            item.onclick = () => loadArchivedSession(index);
            sessionList.appendChild(item);
        });
    };
    const loadArchivedSession = (index) => {
        const saved = localStorage.getItem('nexus_archive') || '[]';
        const archive = JSON.parse(saved);
        chatHistory = archive[index].history;
        chatMessages.innerHTML = '';
        chatHistory.forEach(msg => appendMessage(msg.role, msg.content));
        modalSettings.style.display = 'none';
    };
    const clearHistory = () => {
        if (confirm("SOVEREIGN WARNING: Permanent erasure of all research history. Proceed?")) {
            localStorage.removeItem('nexus_archive');
            localStorage.removeItem('nexus_session');
            chatHistory = [];
            chatMessages.innerHTML = '';
            updateSessionList();
            alert("HISTORY OBLITERATED.");
        }
    };

    // 3. GLOBAL ACTION LOGIC
    window.copyToClipboard = (btn) => {
        const text = btn.closest('.msg-content-wrapper').querySelector('.msg-content').innerText;
        navigator.clipboard.writeText(text).then(() => {
            btn.style.color = 'var(--accent-blue)';
            btn.title = 'Copied!';
            setTimeout(() => { btn.style.color = ''; btn.title = 'Copy'; }, 2000);
        });
    };
    window.shareMessage = async (btn) => {
        const text = btn.closest('.msg-content-wrapper').querySelector('.msg-content').innerText;
        if (navigator.share) {
            try { await navigator.share({ title: 'Nexus Research', text: text }); } catch (e) {}
        } else {
            navigator.clipboard.writeText(text);
            alert("Content copied to clipboard.");
        }
    };
    window.likeMessage = (btn) => {
        btn.style.color = '#4ade80';
        if (btn.nextElementSibling) btn.nextElementSibling.style.color = '';
    };
    window.dislikeMessage = (btn) => {
        btn.style.color = '#f87171';
        if (btn.previousElementSibling) btn.previousElementSibling.style.color = '';
    };
    window.regenerateMessage = (btn) => {
        const lastUser = chatHistory.filter(m => m.role === 'user').pop();
        if (lastUser && !isProcessing) {
            btn.style.color = 'var(--accent-blue)';
            btn.style.transform = 'rotate(180deg)';
            chatInput.value = lastUser.content;
            handleSynthesis();
            setTimeout(() => { btn.style.color = ''; btn.style.transform = ''; }, 1000);
        }
    };
    window.speakText = (btn) => {
        const text = btn.closest('.msg-content-wrapper').querySelector('.msg-content').innerText;
        if (window.speechSynthesis.speaking) {
            window.speechSynthesis.cancel();
            btn.style.color = '';
        } else {
            const ut = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(ut);
            btn.style.color = 'var(--accent-blue)';
            ut.onend = () => btn.style.color = '';
        }
    };
    window.toggleMoreDropdown = (btn) => {
        const dropdown = btn.querySelector('.more-dropdown');
        const isActive = dropdown.classList.contains('active');
        document.querySelectorAll('.more-dropdown').forEach(d => d.classList.remove('active'));
        if (!isActive) dropdown.classList.add('active');
        const close = (e) => {
            if (!btn.contains(e.target)) {
                dropdown.classList.remove('active');
                document.removeEventListener('click', close);
            }
        };
        setTimeout(() => document.addEventListener('click', close), 10);
    };
    window.deleteArchivedSession = (index) => {
        const saved = localStorage.getItem('nexus_archive') || '[]';
        let archive = JSON.parse(saved);
        archive.splice(index, 1);
        localStorage.setItem('nexus_archive', JSON.stringify(archive));
        updateSessionList();
    };
    window.exportToPDF = () => {
        if (typeof html2pdf === 'undefined') return alert("PDF Engine loading...");
        html2pdf().set({
            margin: 1, filename: 'Nexus_Export.pdf',
            html2canvas: { scale: 2, backgroundColor: '#0d1117' },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        }).from(chatMessages).save();
    };
    window.reportIssue = () => alert("Neural report captured for audit.");

    // 4. CORE ENGINES
    const handleSynthesis = async (e) => {
        if (e) e.preventDefault();
        const msg = chatInput.value.trim();
        if (!msg || isProcessing) return;
        isProcessing = true;
        chatInput.value = '';
        appendMessage('user', msg);
        chatHistory.push({ role: 'user', content: msg });
        const botMsgDiv = appendMessage('bot', '');
        const contentArea = botMsgDiv.querySelector('.msg-content');
        updateTelemetry('CONNECTING...');
        const startTime = performance.now();
        try {
            const response = await fetch('/api/process-v1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: chatHistory,
                    model: modelToggle.value,
                    role: personaToggle.value,
                    intensity: intensityToggle.value,
                    stream: true
                })
            });
            if (!response.ok) throw new Error('BRIDGE_OFFLINE');
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';
            let buffer = '';
            let firstChunkReceived = false;
            contentArea.innerHTML = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                if (!firstChunkReceived) {
                    updateTelemetry('ACTIVE', Math.round(performance.now() - startTime));
                    firstChunkReceived = true;
                }
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();
                lines.forEach(line => {
                    if (line.startsWith('data: ')) {
                        const blocks = line.split('data: ').filter(b => b.trim());
                        blocks.forEach(block => {
                            let data = block.trim();
                            if (data === '[DONE]') return;
                            try {
                                const json = JSON.parse(data);
                                data = json.choices?.[0]?.delta?.content || json.choices?.[0]?.message?.content || json.message?.content || "";
                            } catch (e) {}
                            if (!data) return;
                            data = data.replace(/<assistant<\|channel\|>[\s\S]*?<\|message\|>/g, '').replace(/<\|[\s\S]*?\|>/g, '');
                            fullContent += data;
                            contentArea.innerHTML = marked.parse(fullContent);
                            scrollToBottom();
                        });
                    } else if (line.startsWith('thought: ')) {
                        updateThoughtBlock(botMsgDiv, line.slice(9).trim());
                    }
                });
            }
            chatHistory.push({ role: 'assistant', content: fullContent });
            saveSession();
            saveToArchive();
        } catch (error) {
            contentArea.textContent = `Nexus Stalled: ${error.message}`;
        } finally {
            isProcessing = false;
            updateTelemetry('STABLE');
        }
    };

    function appendMessage(role, text) {
        const div = document.createElement('div');
        div.className = `msg ${role}`;
        const avatar = role === 'user' ? '👤' : '✦';
        let actionHtml = '';
        if (role === 'bot') {
            actionHtml = `
                <div class="msg-actions">
                    <button class="action-btn" title="Copy" onclick="window.copyToClipboard(this)">${ICONS.copy}</button>
                    <button class="action-btn" title="Share" onclick="window.shareMessage(this)">${ICONS.share}</button>
                    <button class="action-btn" title="Like" onclick="window.likeMessage(this)">${ICONS.like}</button>
                    <button class="action-btn" title="Dislike" onclick="window.dislikeMessage(this)">${ICONS.dislike}</button>
                    <button class="action-btn" title="Regenerate" onclick="window.regenerateMessage(this)">${ICONS.regenerate}</button>
                    <button class="action-btn" title="Volume" onclick="window.speakText(this)">${ICONS.volume}</button>
                    <button class="action-btn more-btn" title="More" onclick="window.toggleMoreDropdown(this)">
                        ${ICONS.more}
                        <div class="more-dropdown">
                            <div class="dropdown-item" onclick="window.reportIssue()">Report Issue</div>
                            <div class="dropdown-item" onclick="window.exportToPDF()">Export to PDF</div>
                        </div>
                    </button>
                </div>
            `;
        }
        div.innerHTML = `<div class="avatar">${avatar}</div><div class="msg-content-wrapper"><div class="msg-content">${marked.parse(text)}</div>${actionHtml}</div>`;
        chatMessages.appendChild(div);
        scrollToBottom();
        return div;
    }

    function updateThoughtBlock(parentDiv, text) {
        let block = parentDiv.querySelector('.reasoning-block');
        if (!block) {
            block = document.createElement('div');
            block.className = 'reasoning-block terminal-logs';
            parentDiv.querySelector('.msg-content').prepend(block);
        }
        if (text.startsWith('[') && text.includes(']')) {
            const logEntry = document.createElement('div');
            logEntry.className = 'log-entry';
            logEntry.textContent = text;
            block.appendChild(logEntry);
        } else {
            const span = document.createElement('span');
            span.textContent = text + " ";
            block.appendChild(span);
        }
        scrollToBottom();
    }

    const runNeuralAnalysis = async (context, contentArea) => {
        try {
            const responseStream = await fetch('/api/process-v1', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [{ role: "user", content: context + "\n\nAnalyze this data." }],
                    model: modelToggle.value,
                    role: personaToggle.value,
                    intensity: intensityToggle.value, stream: true
                })
            });
            const reader = responseStream.body.getReader();
            const decoder = new TextDecoder();
            let fullContent = '';
            let buffer = '';
            contentArea.innerHTML = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6).trim();
                        if (data === '[DONE]') break;
                        fullContent += data;
                        contentArea.innerHTML = marked.parse(fullContent);
                        scrollToBottom();
                    }
                }
            }
            chatHistory.push({ role: 'assistant', content: fullContent });
            saveSession();
            saveToArchive();
        } catch (e) { contentArea.textContent = "Neural Analysis Pulse Interrupted."; }
    };

    const performOCR = async (file, contentArea) => {
        contentArea.innerHTML = "Initializing OCR Engine...";
        const formData = new FormData();
        formData.append('file', file);
        try {
            const response = await fetch('/api/ocr-v1', { method: 'POST', body: formData });
            const data = await response.json();
            runNeuralAnalysis(`[OCR_EXTRACTION_DATA]:\n${data.text}`, contentArea);
        } catch (e) { contentArea.textContent = "OCR Synthesis Failed."; }
    };

    // 5. EVENT LISTENERS
    chatForm?.addEventListener('submit', handleSynthesis);
    btnSend?.addEventListener('click', handleSynthesis);
    chatInput?.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleSynthesis(); });
    
    btnNewChat?.addEventListener('click', () => {
        saveToArchive();
        localStorage.removeItem('nexus_session');
        chatMessages.innerHTML = `<div class="msg bot"><div class="avatar">✦</div><div class="msg-content"><p>Session reset. How can I help?</p></div></div>`;
        chatHistory = [];
    });

    imageUpload?.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const botMsgDiv = appendMessage('bot', '');
        const contentArea = botMsgDiv.querySelector('.msg-content');
        contentArea.innerHTML = `Synthesizing ${file.name}...`;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const base64 = ev.target.result;
                appendMessage('user', `![Uploaded Image](${base64})`);
                try {
                    const response = await fetch('/api/analyze-v1', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: base64, prompt: "Analyze this image." })
                    });
                    const data = await response.json();
                    const content = data.choices[0].message.content;
                    contentArea.innerHTML = marked.parse(content);
                    chatHistory.push({ role: 'assistant', content: content });
                    saveSession();
                    saveToArchive();
                } catch (err) { contentArea.textContent = 'Visual synthesis failed.'; }
            };
            reader.readAsDataURL(file);
        } else {
            appendMessage('user', `📎 Attached File: **${file.name}**`);
            const formData = new FormData();
            formData.append('file', file);
            try {
                const resp = await fetch('/api/analyze-file-v1', { method: 'POST', body: formData });
                const data = await resp.json();
                if (data.content.includes("SCANNED_PDF_DETECTED")) {
                    contentArea.innerHTML = `<div style="color:var(--accent-blue)"><strong>[SCANNED_PDF]</strong><br><button id="btn-run-ocr-new">RUN OCR</button></div>`;
                    document.getElementById('btn-run-ocr-new').onclick = () => performOCR(file, contentArea);
                } else {
                    runNeuralAnalysis(`[FILE: ${file.name}]\n${data.content}`, contentArea);
                }
            } catch (err) { contentArea.textContent = 'File analysis failed.'; }
        }
    });

    document.getElementById('btn-menu')?.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.getElementById('btn-clear-history')?.addEventListener('click', clearHistory);
    btnSettings?.addEventListener('click', () => { modalSettings.style.display = 'flex'; startMatrix('matrix-settings'); });
    btnRoot?.addEventListener('click', () => { modalRoot.style.display = 'flex'; startMatrix('matrix-root'); });
    window.addEventListener('click', (e) => {
        if (e.target === modalSettings) modalSettings.style.display = 'none';
        if (e.target === modalRoot) modalRoot.style.display = 'none';
    });

    terminalInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            terminalOutput.innerHTML += `<br>> ${terminalInput.value}<br>> EXECUTING... OK`;
            terminalInput.value = '';
            terminalOutput.scrollTop = terminalOutput.scrollHeight;
        }
    });

    // 6. INITIALIZATION
    const startMatrix = (id) => {
        const canvas = document.getElementById(id);
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
        const drops = Array(Math.floor(canvas.width/14)).fill(1);
        const draw = () => {
            ctx.fillStyle = "rgba(0,10,20,0.05)"; ctx.fillRect(0,0,canvas.width,canvas.height);
            ctx.fillStyle = "#00a3ff"; ctx.font = "14px monospace";
            drops.forEach((y, i) => {
                ctx.fillText("01"[Math.floor(Math.random()*2)], i*14, y*14);
                if (y*14 > canvas.height && Math.random() > 0.975) drops[i] = 0;
                drops[i]++;
            });
        };
        setInterval(draw, 33);
    };

    updateSessionList();
    loadSession();
    updateBudget();
});
