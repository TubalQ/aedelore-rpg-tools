// API client wrapper for Aedelore REST API
// All requests are scoped to the authenticated user via their Bearer token

const API_URL = process.env.API_URL || 'http://aedelore-proffs-api:3000';

async function apiRequest(path, token, options = {}) {
    const url = `${API_URL}${path}`;
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
    };

    const res = await fetch(url, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`API ${res.status}: ${text || res.statusText}`);
    }

    return res.json();
}

// --- Campaigns ---

export async function listCampaigns(token) {
    return apiRequest('/api/campaigns', token);
}

export async function getCampaign(token, campaignId) {
    return apiRequest(`/api/campaigns/${campaignId}`, token);
}

export async function createCampaign(token, name, description) {
    return apiRequest('/api/campaigns', token, {
        method: 'POST',
        body: { name, description }
    });
}

export async function generateShareCode(token, campaignId) {
    return apiRequest(`/api/campaigns/${campaignId}/share`, token, { method: 'POST' });
}

// --- Sessions ---

export async function listSessions(token, campaignId) {
    return apiRequest(`/api/sessions/campaign/${campaignId}`, token);
}

export async function getSession(token, sessionId) {
    return apiRequest(`/api/sessions/${sessionId}`, token);
}

export async function createSession(token, campaignId, data) {
    return apiRequest(`/api/sessions/campaign/${campaignId}`, token, {
        method: 'POST',
        body: data
    });
}

export async function updateSession(token, sessionId, data) {
    return apiRequest(`/api/sessions/${sessionId}`, token, {
        method: 'PUT',
        body: data
    });
}

export async function lockSession(token, sessionId) {
    return apiRequest(`/api/sessions/${sessionId}/lock`, token, { method: 'PUT' });
}

export async function unlockSession(token, sessionId) {
    return apiRequest(`/api/sessions/${sessionId}/unlock`, token, { method: 'PUT' });
}

// --- Characters (DM) ---

export async function listCampaignCharacters(token, campaignId) {
    return apiRequest(`/api/dm/campaigns/${campaignId}/characters`, token);
}

export async function getCharacterBuild(token, characterId) {
    return apiRequest(`/api/dm/characters/${characterId}/build`, token);
}

export async function giveXP(token, characterId, amount) {
    return apiRequest(`/api/dm/characters/${characterId}/give-xp`, token, {
        method: 'POST',
        body: { amount }
    });
}

export async function giveItem(token, characterId, name, description, sessionName) {
    return apiRequest(`/api/dm/characters/${characterId}/give-item`, token, {
        method: 'POST',
        body: { name, description, sessionName }
    });
}

export async function removeItem(token, characterId, name) {
    return apiRequest(`/api/dm/characters/${characterId}/remove-item`, token, {
        method: 'POST',
        body: { name }
    });
}

export async function setCharacterLocks(token, characterId, locks) {
    return apiRequest(`/api/dm/characters/${characterId}/set-locks`, token, {
        method: 'POST',
        body: locks
    });
}

// --- Player Characters ---

export async function listMyCharacters(token) {
    return apiRequest('/api/characters', token);
}

export async function getMyCharacter(token, characterId) {
    const result = await apiRequest(`/api/characters/${characterId}`, token);
    // API returns data as JSON string — parse it
    if (typeof result.data === 'string') {
        try {
            result.data = JSON.parse(result.data);
        } catch (e) {
            console.error(`Failed to parse character ${characterId} data:`, e.message);
            throw new Error(`Character data corrupted (invalid JSON). Contact support.`);
        }
    }
    return result;
}

export async function saveMyCharacter(token, characterId, name, data, system) {
    return apiRequest(`/api/characters/${characterId}`, token, {
        method: 'PUT',
        body: { name, data, system: system || 'aedelore' }
    });
}

export async function createMyCharacter(token, name, data) {
    return apiRequest('/api/characters', token, {
        method: 'POST',
        body: { name, data, system: 'aedelore' }
    });
}

export async function lockCharacterStep(token, characterId, step) {
    return apiRequest(`/api/characters/${characterId}/lock-${step}`, token, {
        method: 'POST'
    });
}

export async function getParty(token, characterId) {
    return apiRequest(`/api/characters/${characterId}/party`, token);
}

export async function joinCampaign(token, characterId, shareCode) {
    return apiRequest(`/api/characters/${characterId}/link-campaign`, token, {
        method: 'POST',
        body: { share_code: shareCode }
    });
}

// --- Helpers ---

export function formatSessionForAI(session) {
    let output = '';
    const data = session.data;
    if (!data) return output;

    if (data.prolog) output += `\n**Prolog:** ${data.prolog}\n`;
    if (data.hook) output += `\n**Hook:** ${data.hook}\n`;

    if (data.sessionNotes) {
        if (data.sessionNotes.summary) output += `\n**Summary:** ${data.sessionNotes.summary}\n`;
        if (data.sessionNotes.followUp) output += `\n**Follow-up:** ${data.sessionNotes.followUp}\n`;
    }

    if (data.turningPoints?.length > 0) {
        output += `\n**Key Moments:** ${data.turningPoints.map(tp => (tp.linkedTo ? `[${tp.linkedTo}] ` : '') + tp.description).filter(Boolean).join('; ')}\n`;
    }

    if (data.eventLog?.length > 0) {
        output += `\n**Events:** ${data.eventLog.map(e => (e.linkedTo ? `[${e.linkedTo}] ` : '') + e.text).filter(Boolean).join('; ')}\n`;
    }

    if (data.dmNotes?.length > 0) {
        output += `\n**DM Notes (private):**\n`;
        data.dmNotes.forEach(n => {
            output += `- [${n.category || 'reminder'}] ${n.text}\n`;
        });
    }

    if (data.npcs?.length > 0) {
        output += `\n**NPCs:**\n`;
        data.npcs.forEach(npc => {
            output += `- ${npc.name}`;
            if (npc.role) output += ` (${npc.role})`;
            if (npc.disposition) output += ` [${npc.disposition}]`;
            if (npc.description) output += `: ${npc.description}`;
            if (npc.plannedLocation) output += ` — at ${npc.plannedLocation}`;
            output += '\n';
        });
    }

    if (data.places?.length > 0) {
        output += `\n**Places:**\n`;
        data.places.forEach(p => {
            output += `- ${p.name}${p.visited ? ' ✓' : ''}`;
            if (p.description) output += `: ${p.description}`;
            output += '\n';
        });
    }

    if (data.encounters?.length > 0) {
        output += `\n**Encounters:**\n`;
        data.encounters.forEach(enc => {
            output += `- ${enc.name} [${enc.status || 'planned'}]`;
            if (enc.location) output += ` at ${enc.location}`;
            if (enc.enemies?.length > 0) output += ` — Enemies: ${enc.enemies.map(e => `${e.name} (HP:${e.hp || '?'})`).join(', ')}`;
            if (enc.tactics) output += `\n  Tactics: ${enc.tactics}`;
            if (enc.loot) output += `\n  Loot: ${enc.loot}`;
            output += '\n';
        });
    }

    if (data.readAloud?.length > 0) {
        output += `\n**Read-Aloud:**\n`;
        data.readAloud.forEach(ra => {
            output += `- "${ra.title || 'Untitled'}": ${(ra.text || '').substring(0, 200)}${(ra.text || '').length > 200 ? '...' : ''}\n`;
        });
    }

    if (data.items?.length > 0) {
        output += `\n**Items/Clues:**\n`;
        data.items.forEach(item => {
            output += `- ${item.name}${item.found ? ' ✓' : ''}`;
            if (item.description) output += `: ${item.description}`;
            if (item.givenTo) output += ` (given to ${item.givenTo})`;
            output += '\n';
        });
    }

    return output;
}

export async function getSessionHistory(token, campaignId) {
    const sessions = await listSessions(token, campaignId);
    if (!sessions?.length) return 'No sessions found.';

    // Sort by session number
    sessions.sort((a, b) => a.session_number - b.session_number);

    let output = '';
    for (const s of sessions) {
        try {
            const full = await getSession(token, s.id);
            output += `\n---\n### Session #${full.session_number} (${full.date || 'no date'}) — ${full.status}\n`;
            if (full.location) output += `Location: ${full.location}\n`;
            output += formatSessionForAI(full);
        } catch (e) {
            console.warn(`Failed to fetch session ${s.id}:`, e.message);
            output += `\n---\n### Session #${s.session_number || '?'} — (failed to load)\n`;
        }
    }
    return output;
}
