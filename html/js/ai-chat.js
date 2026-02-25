// AI Chat functionality for character sheet

let aiCurrentConversation = null;
let aiIsStreaming = false;
let aiAbortController = null;

// ── Initialization ──

async function initAIChat() {
    await loadAIModels();
    await updateAICredits();

    // Check for purchase callback
    const params = new URLSearchParams(window.location.search);
    if (params.get('ai_purchase') === 'success') {
        await updateAICredits();
        window.history.replaceState({}, '', window.location.pathname);
    }
}

async function loadAIModels() {
    try {
        const res = await fetch('/api/ai/models', { headers: getAuthHeaders() });
        if (!res.ok) return;
        const models = await res.json();
        const select = document.getElementById('ai-model-select');
        if (!select || models.length === 0) return;

        select.innerHTML = models.map((m, i) =>
            `<option value="${escapeHtml(String(m.id))}"${i === 0 ? ' selected' : ''}>${escapeHtml(m.label)} (${escapeHtml(String(m.credits_per_1k))}/1k tokens)</option>`
        ).join('');
    } catch (e) {
        console.warn('Failed to load AI models:', e);
    }
}

async function updateAICredits() {
    try {
        const res = await fetch('/api/ai/credits', { headers: getAuthHeaders() });
        if (!res.ok) return;
        const data = await res.json();
        const el = document.getElementById('ai-credits-amount');
        if (el) el.textContent = data.balance;
    } catch (e) {
        console.warn('Failed to load AI credits:', e);
    }
}

// ── Message Sending ──

async function sendAIMessage() {
    if (aiIsStreaming) return;

    const input = document.getElementById('ai-input');
    const message = input.value.trim();
    if (!message) return;

    input.value = '';
    autoResizeAIInput();

    await doSendMessage(message);
}

function sendQuickMessage(message) {
    doSendMessage(message);
}

function saveAIAdventure() {
    if (aiIsStreaming) return;
    if (!aiCurrentConversation) {
        showAIError('No active conversation to save');
        return;
    }
    const saveBtn = document.getElementById('ai-save-btn');
    if (saveBtn) saveBtn.disabled = true;
    doSendMessage('[SAVE] Save all progress from this adventure. Use the save_adventure_progress tool to store a summary of everything that happened, all NPCs we met, key events, and turning points. Include where my character currently is.');
}

async function doSendMessage(message) {
    if (aiIsStreaming) return;
    aiIsStreaming = true;

    const model = document.getElementById('ai-model-select')?.value;
    if (!model) {
        showAIError('No model selected');
        aiIsStreaming = false;
        return;
    }

    // Hide welcome screen
    const welcome = document.getElementById('ai-welcome');
    if (welcome) welcome.style.display = 'none';

    // Show friendly text for internal commands
    const displayMessage = message.startsWith('[SAVE]') ? 'Saving adventure progress...' : message;

    // Add user message to UI
    appendMessage('user', displayMessage);

    // Prepare the assistant message container
    const assistantEl = appendMessage('assistant', '');
    const contentEl = assistantEl.querySelector('.ai-msg-content');

    // Switch send button to stop mode
    const sendBtn = document.getElementById('ai-send-btn');
    if (sendBtn) {
        sendBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>';
        sendBtn.classList.add('ai-stop-mode');
        sendBtn.onclick = () => { if (aiAbortController) aiAbortController.abort(); };
    }

    // Get character ID from the current character
    const characterId = window.currentCharacterId || null;

    aiAbortController = new AbortController();

    try {
        const res = await fetch('/api/ai/chat', {
            method: 'POST',
            headers: {
                ...getAuthHeaders(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                conversation_id: aiCurrentConversation,
                message,
                model,
                character_id: characterId
            }),
            signal: aiAbortController.signal
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({ error: 'Request failed' }));
            if (res.status === 402) {
                contentEl.innerHTML = '<em>Insufficient credits.</em> <button onclick="openBuyCredits()" style="color: var(--accent-gold); text-decoration: underline; background: none; border: none; cursor: pointer; padding: 0;">Buy more credits</button>';
            } else {
                contentEl.textContent = `Error: ${err.error || 'Unknown error'}`;
            }
            aiIsStreaming = false;
            if (sendBtn) {
                sendBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>';
                sendBtn.classList.remove('ai-stop-mode');
                sendBtn.onclick = sendAIMessage;
            }
            return;
        }

        // Read SSE stream
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let fullText = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });

            // Parse SSE lines
            const lines = buffer.split('\n');
            buffer = lines.pop(); // Keep incomplete line in buffer

            for (const line of lines) {
                if (!line.startsWith('data: ')) continue;
                const jsonStr = line.slice(6);
                if (!jsonStr) continue;

                let data;
                try { data = JSON.parse(jsonStr); } catch { continue; }

                if (data.type === 'conversation_id') {
                    aiCurrentConversation = data.id;
                } else if (data.type === 'text') {
                    fullText += data.content;
                    contentEl.innerHTML = renderMarkdown(fullText);
                    scrollAIToBottom();
                } else if (data.type === 'tool_call') {
                    appendToolCard(assistantEl, data.name, data.input, 'calling');
                } else if (data.type === 'tool_result') {
                    updateToolCard(assistantEl, data.name, data.result);
                    // Refresh character data if tools changed something
                    if (['update_hp', 'update_equipment_hp', 'update_inventory', 'equip_weapon', 'equip_armor', 'add_notes', 'update_relationships'].includes(data.name)) {
                        if (typeof refreshCharacterData === 'function') {
                            refreshCharacterData();
                        }
                    }
                } else if (data.type === 'done') {
                    collapseToolCards(assistantEl);
                    const creditsEl = document.getElementById('ai-credits-amount');
                    if (creditsEl && data.balance !== undefined) {
                        creditsEl.textContent = data.balance;
                    }
                } else if (data.type === 'error') {
                    contentEl.innerHTML += `<div class="ai-error">${escapeHtml(data.message)}</div>`;
                }
            }
        }

        // Final render
        if (fullText) {
            contentEl.innerHTML = renderMarkdown(fullText);
        }

    } catch (e) {
        if (e.name !== 'AbortError') {
            contentEl.textContent = `Error: ${e.message}`;
        }
    } finally {
        aiIsStreaming = false;
        aiAbortController = null;
        if (sendBtn) {
            sendBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 2L11 13"/><path d="M22 2L15 22L11 13L2 9L22 2Z"/></svg>';
            sendBtn.classList.remove('ai-stop-mode');
            sendBtn.onclick = sendAIMessage;
        }
        const saveBtn = document.getElementById('ai-save-btn');
        if (saveBtn) saveBtn.disabled = false;
        scrollAIToBottom();
    }
}

// ── UI Helpers ──

function appendMessage(role, content) {
    const container = document.getElementById('ai-messages');
    const el = document.createElement('div');
    el.className = `ai-msg ai-msg-${role}`;

    if (role === 'user') {
        el.innerHTML = `<div class="ai-msg-content">${escapeHtml(content)}</div>`;
    } else {
        el.innerHTML = `<div class="ai-msg-content">${content ? renderMarkdown(content) : '<span class="ai-typing"></span>'}</div>`;
    }

    container.appendChild(el);
    scrollAIToBottom();
    return el;
}

function appendToolCard(parentEl, toolName, input, status) {
    const card = document.createElement('div');
    card.className = 'ai-tool-card';
    card.dataset.toolName = toolName;

    const label = toolName.replace(/_/g, ' ');
    card.innerHTML = `
        <div class="ai-tool-header">
            <span class="ai-tool-icon">${getToolIcon(toolName)}</span>
            <span class="ai-tool-name">${label}</span>
            <span class="ai-tool-status ${status}">${status === 'calling' ? '...' : ''}</span>
        </div>
    `;

    // Insert before the content div
    const contentEl = parentEl.querySelector('.ai-msg-content');
    if (contentEl) {
        parentEl.insertBefore(card, contentEl.nextSibling);
    } else {
        parentEl.appendChild(card);
    }
    scrollAIToBottom();
}

function updateToolCard(parentEl, toolName, result) {
    const cards = parentEl.querySelectorAll('.ai-tool-card');
    for (const card of cards) {
        if (card.dataset.toolName === toolName) {
            const statusEl = card.querySelector('.ai-tool-status');
            if (statusEl) {
                statusEl.textContent = '';
                statusEl.className = 'ai-tool-status done';
            }

            // Show brief result for roll_dice
            if (toolName === 'roll_dice' && result && !result.error) {
                const resultEl = document.createElement('div');
                resultEl.className = 'ai-tool-result';
                if (result.rolls) {
                    if (result.natural !== undefined) {
                        // D20 check result
                        let text = `D20: ${result.natural}`;
                        if (result.modifier) text += ` + ${result.modifier}`;
                        text += ` = ${result.modified_total}`;
                        if (result.dc) text += ` vs DC ${result.dc}`;
                        if (result.critical) text += ' — CRITICAL!';
                        else if (result.fumble) text += ' — FUMBLE!';
                        else if (result.dc) text += result.success ? ' — Success' : ' — Fail';
                        resultEl.textContent = text;
                    } else {
                        // Damage or other roll
                        resultEl.textContent = `[${result.rolls.join(', ')}] = ${result.total}`;
                    }
                }
                card.appendChild(resultEl);
            }

            // Show summary for character-modifying tools
            if (['update_hp', 'update_equipment_hp', 'update_inventory', 'equip_weapon', 'equip_armor', 'give_xp', 'give_item', 'remove_item', 'add_notes', 'update_relationships', 'save_adventure_progress'].includes(toolName) && result) {
                const resultEl = document.createElement('div');
                resultEl.className = 'ai-tool-result';
                const msg = result.message || result.error || '';
                if (msg) resultEl.textContent = msg;
                else resultEl.textContent = 'Done';
                card.appendChild(resultEl);
            }
            break;
        }
    }
}

function collapseToolCards(parentEl) {
    const keepExpanded = ['roll_dice'];
    const cards = parentEl.querySelectorAll('.ai-tool-card');
    for (const card of cards) {
        if (keepExpanded.includes(card.dataset.toolName)) continue;
        // If the card has a result, collapse to just the header + result
        if (card.querySelector('.ai-tool-result')) {
            card.classList.add('ai-tool-compact');
        } else {
            card.classList.add('ai-tool-collapsed');
        }
    }
}

function getToolIcon(name) {
    const icons = {
        roll_dice: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="3"/><circle cx="8" cy="8" r="1.5"/><circle cx="16" cy="16" r="1.5"/><circle cx="12" cy="12" r="1.5"/></svg>',
        get_my_character: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
        update_hp: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>',
        get_rules: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
        get_world_lore: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
    };
    return icons[name] || '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.73 12.73l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
}

function showAIError(msg) {
    const container = document.getElementById('ai-messages');
    if (!container) return;
    const el = document.createElement('div');
    el.className = 'ai-msg ai-msg-error';
    el.innerHTML = `<div class="ai-msg-content" style="color: var(--accent-red, #ef4444); font-style: italic;">${escapeHtml(msg)}</div>`;
    container.appendChild(el);
    scrollAIToBottom();
}

function scrollAIToBottom() {
    const container = document.getElementById('ai-messages');
    if (container) {
        requestAnimationFrame(() => {
            container.scrollTop = container.scrollHeight;
        });
    }
}

function renderMarkdown(text) {
    // Simple markdown rendering — bold, italic, code, headers, lists
    let html = escapeHtml(text);

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    // Bold
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    // Italic
    html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    // Headers
    html = html.replace(/^### (.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h3>$1</h3>');
    // Lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br>');

    return `<p>${html}</p>`;
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// ── Conversations ──

function toggleAIConversations() {
    const sidebar = document.getElementById('ai-sidebar');
    if (!sidebar) return;

    const visible = sidebar.style.display !== 'none';
    sidebar.style.display = visible ? 'none' : 'flex';

    if (!visible) loadAIConversations();
}

async function loadAIConversations() {
    try {
        const res = await fetch('/api/ai/conversations', { headers: getAuthHeaders() });
        if (!res.ok) return;
        const conversations = await res.json();
        const list = document.getElementById('ai-conv-list');
        if (!list) return;

        if (conversations.length === 0) {
            list.innerHTML = '<div class="ai-conv-empty">No conversations yet</div>';
            return;
        }

        list.innerHTML = conversations.map(c => `
            <div class="ai-conv-item ${c.id === aiCurrentConversation ? 'active' : ''}"
                 onclick="loadAIConversation(${c.id})">
                <div class="ai-conv-title">${escapeHtml(c.title)}</div>
                <div class="ai-conv-meta">${c.model} &middot; ${formatTimeAgo(c.updated_at)}</div>
                <button class="ai-conv-delete" onclick="event.stopPropagation(); deleteAIConversation(${c.id})" title="Delete">&times;</button>
            </div>
        `).join('');
    } catch (e) {
        console.warn('Failed to load conversations:', e);
    }
}

async function loadAIConversation(id) {
    try {
        const res = await fetch(`/api/ai/conversations/${id}`, { headers: getAuthHeaders() });
        if (!res.ok) return;
        const conv = await res.json();

        aiCurrentConversation = id;

        // Set model
        const select = document.getElementById('ai-model-select');
        if (select) select.value = conv.model;

        // Clear and render messages
        const container = document.getElementById('ai-messages');
        container.innerHTML = '';
        const welcome = document.getElementById('ai-welcome');
        if (welcome) welcome.style.display = 'none';

        for (const msg of conv.messages || []) {
            if (msg.role === 'user') {
                appendMessage('user', msg.content);
            } else if (msg.role === 'assistant') {
                appendMessage('assistant', msg.content);
            }
            // tool_call and tool_result are shown inline with assistant messages
        }

        toggleAIConversations();
        scrollAIToBottom();
    } catch (e) {
        console.warn('Failed to load conversation:', e);
    }
}

async function newAIConversation() {
    aiCurrentConversation = null;
    const container = document.getElementById('ai-messages');
    container.innerHTML = '';

    // Show welcome
    const welcomeHtml = `
        <div class="ai-welcome" id="ai-welcome">
            <div class="ai-welcome-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-purple)" stroke-width="1.5"><path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-1.27A7 7 0 0 1 14 22h-4a7 7 0 0 1-6.73-3H2a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1h1a7 7 0 0 1 7-7h1V5.73c-.6-.34-1-.99-1-1.73a2 2 0 0 1 2-2z"/><circle cx="10" cy="15" r="1"/><circle cx="14" cy="15" r="1"/></svg>
            </div>
            <h3>Aedelore AI</h3>
            <p>Solo adventures, character help, lore questions, and rules.</p>
            <div class="ai-quick-actions">
                <button onclick="sendQuickMessage('Start a solo adventure for my character')">Solo Adventure</button>
                <button onclick="sendQuickMessage('Help me build my character')">Build Character</button>
                <button onclick="sendQuickMessage('What are the combat rules?')">Combat Rules</button>
                <button onclick="sendQuickMessage('Tell me about the world of Aedelore')">World Lore</button>
            </div>
        </div>
    `;
    container.innerHTML = welcomeHtml;

    toggleAIConversations();
}

async function deleteAIConversation(id) {
    if (!await showConfirm('Delete this conversation?', { confirmText: 'Delete', danger: true })) return;
    try {
        await fetch(`/api/ai/conversations/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (aiCurrentConversation === id) {
            newAIConversation();
        }
        loadAIConversations();
    } catch (e) {
        console.warn('Failed to delete conversation:', e);
    }
}

// ── Credits & Packages ──

async function openBuyCredits() {
    const modal = document.getElementById('ai-buy-modal');
    if (!modal) return;
    modal.style.display = 'flex';

    try {
        const res = await fetch('/api/ai/packages', { headers: getAuthHeaders() });
        if (!res.ok) return;
        const packages = await res.json();
        const container = document.getElementById('ai-packages');
        if (!container) return;

        container.innerHTML = packages.map(p => {
            const safeId = escapeHtml(String(p.id));
            return `
            <div class="ai-package-card" onclick="buyPackage('${safeId}')">
                <div class="ai-package-credits">${escapeHtml(String(p.credits))}</div>
                <div class="ai-package-name">credits</div>
                <div class="ai-package-price">${escapeHtml((p.price / 100).toFixed(0))} ${escapeHtml(p.currency.toUpperCase())}</div>
            </div>
        `;
        }).join('');
    } catch (e) {
        console.warn('Failed to load packages:', e);
    }
}

function closeBuyCredits() {
    const modal = document.getElementById('ai-buy-modal');
    if (modal) modal.style.display = 'none';
}

async function buyPackage(packageId) {
    try {
        const res = await fetch('/api/ai/checkout', {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ package_id: packageId })
        });
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            showToast(err.error || 'Payment error', 'error');
            return;
        }
        const data = await res.json();
        if (data.url && data.url.startsWith('https://checkout.stripe.com')) {
            window.location.href = data.url;
        }
    } catch (e) {
        showToast('Payment service error', 'error');
    }
}

// ── Input Handling ──

function handleAIKeydown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendAIMessage();
    }
}

function autoResizeAIInput() {
    const input = document.getElementById('ai-input');
    if (!input) return;
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 150) + 'px';
}

function onModelChange() {
    // Model changed — new messages will use the new model
}

// ── Auth helper ──

function getAuthHeaders() {
    const token = document.cookie.split('; ')
        .find(c => c.startsWith('auth_token='))
        ?.split('=')[1];
    const csrf = document.cookie.split('; ')
        .find(c => c.startsWith('csrf_token='))
        ?.split('=')[1];

    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (csrf) headers['X-CSRF-Token'] = csrf;
    return headers;
}

// ── Utilities ──

function formatTimeAgo(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString('sv-SE');
}

// Expose to global scope
window.initAIChat = initAIChat;
window.sendAIMessage = sendAIMessage;
window.sendQuickMessage = sendQuickMessage;
window.handleAIKeydown = handleAIKeydown;
window.autoResizeAIInput = autoResizeAIInput;
window.toggleAIConversations = toggleAIConversations;
window.loadAIConversation = loadAIConversation;
window.newAIConversation = newAIConversation;
window.deleteAIConversation = deleteAIConversation;
window.openBuyCredits = openBuyCredits;
window.closeBuyCredits = closeBuyCredits;
window.buyPackage = buyPackage;
window.onModelChange = onModelChange;
