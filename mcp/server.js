import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express from 'express';
import { randomUUID, createHash, createVerify, createPublicKey } from 'crypto';
import { z } from 'zod';
import * as api from './api-client.js';
import { PROMPT_TEMPLATES, IMPORT_FORMAT, PLAYER_PROMPT_TEMPLATES, PLAYER_SYSTEM_PREAMBLE } from './prompts.js';

const PORT = parseInt(process.env.PORT) || 3100;
const PUBLIC_URL = process.env.PUBLIC_URL || 'https://aedelore.nu';

// --- OIDC Configuration for MCP ---
const AUTH_MODE = process.env.AUTH_MODE || 'local';

// PKCE verifier store for MCP→Keycloak flow (keyed by nonce, TTL 5min)
const pkceStore = new Map();
function storePkceVerifier(nonce, verifier) {
    pkceStore.set(nonce, verifier);
    setTimeout(() => pkceStore.delete(nonce), 5 * 60 * 1000);
}
function generatePkce() {
    const verifier = randomUUID() + randomUUID(); // 72 chars
    const challenge = createHash('sha256').update(verifier).digest('base64url');
    return { verifier, challenge };
}

function loadOidcProviders() {
    const providers = [];
    for (let i = 1; i <= 20; i++) {
        const issuerUrl = process.env[`OIDC_${i}_ISSUER_URL`];
        if (!issuerUrl) continue;
        providers.push({
            id: String(i),
            issuerUrl: issuerUrl.replace(/\/$/, ''),
            clientId: process.env[`OIDC_${i}_CLIENT_ID`] || '',
            clientSecret: process.env[`OIDC_${i}_CLIENT_SECRET`] || '',
            providerName: process.env[`OIDC_${i}_PROVIDER_NAME`] || `OIDC Provider ${i}`
        });
    }
    return providers;
}

const oidcEnabled = AUTH_MODE === 'oidc' || AUTH_MODE === 'both';
const localEnabled = AUTH_MODE === 'local' || AUTH_MODE === 'both';
const oidcProviders = loadOidcProviders();

// OIDC discovery + JWKS cache for MCP JWT validation
const mcpDiscoveryCache = new Map();
const mcpJwksCache = new Map();

async function mcpDiscoverOidc(provider) {
    const cached = mcpDiscoveryCache.get(provider.issuerUrl);
    if (cached && cached.expiresAt > Date.now()) return cached.data;
    const url = `${provider.issuerUrl}/.well-known/openid-configuration`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OIDC discovery failed: ${res.status}`);
    const data = await res.json();
    mcpDiscoveryCache.set(provider.issuerUrl, { data, expiresAt: Date.now() + 3600000 });
    return data;
}

async function mcpGetJwks(jwksUri) {
    const cached = mcpJwksCache.get(jwksUri);
    if (cached && cached.expiresAt > Date.now()) return cached.keys;
    const res = await fetch(jwksUri);
    if (!res.ok) throw new Error(`JWKS fetch failed: ${res.status}`);
    const data = await res.json();
    mcpJwksCache.set(jwksUri, { keys: data.keys, expiresAt: Date.now() + 3600000 });
    return data.keys;
}

function base64urlDecode(str) {
    const padded = str + '='.repeat((4 - str.length % 4) % 4);
    return Buffer.from(padded, 'base64url');
}

const ALG_MAP = { RS256: 'RSA-SHA256', RS384: 'RSA-SHA384', RS512: 'RSA-SHA512', ES256: 'SHA256', ES384: 'SHA384', ES512: 'SHA512' };

async function mcpValidateJwt(token, provider) {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT');
    const header = JSON.parse(base64urlDecode(parts[0]).toString());
    const payload = JSON.parse(base64urlDecode(parts[1]).toString());
    const signatureInput = parts[0] + '.' + parts[1];
    const signature = base64urlDecode(parts[2]);

    const config = await mcpDiscoverOidc(provider);
    if (payload.iss !== provider.issuerUrl && payload.iss !== config.issuer) throw new Error('Invalid issuer');
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!aud.includes(provider.clientId)) throw new Error('Invalid audience');
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');

    const keys = await mcpGetJwks(config.jwks_uri);
    const key = header.kid ? keys.find(k => k.kid === header.kid) : keys[0];
    if (!key) throw new Error('No matching JWKS key');
    const nodeAlg = ALG_MAP[header.alg];
    if (!nodeAlg) throw new Error(`Unsupported alg: ${header.alg}`);

    const publicKey = createPublicKey({ key, format: 'jwk' });
    const valid = createVerify(nodeAlg).update(signatureInput).verify(publicKey, signature);
    if (!valid) throw new Error('Invalid signature');
    return payload;
}

// Validate a bearer token: try local API first, then try OIDC JWT
async function validateMcpToken(token) {
    // Try local token validation via API
    if (localEnabled) {
        try {
            await api.listCampaigns(token);
            return { type: 'local', token };
        } catch {
            // Local token invalid, try OIDC
        }
    }

    // Try OIDC JWT validation
    if (oidcEnabled && token.includes('.')) {
        for (const provider of oidcProviders) {
            try {
                const claims = await mcpValidateJwt(token, provider);
                if (claims.sub) {
                    // JIT provision via API - exchange JWT for local token
                    const provisionRes = await fetch(`${process.env.API_URL || 'http://aedelore-proffs-api:3000'}/api/auth/oidc/jit`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer internal' },
                        body: JSON.stringify({
                            sub: claims.sub,
                            username: claims.preferred_username || claims.name,
                            email: claims.email
                        })
                    });
                    if (provisionRes.ok) {
                        const data = await provisionRes.json();
                        return { type: 'oidc', token: data.token, claims };
                    }
                    // If JIT endpoint doesn't exist, try using the JWT directly as bearer
                    return { type: 'oidc_jwt', token, claims };
                }
            } catch {
                // Try next provider
            }
        }
    }

    throw new Error('Invalid token');
}

// Allowed redirect URI hosts for OAuth (prevent authorization code theft)
const ALLOWED_REDIRECT_HOSTS = (process.env.ALLOWED_REDIRECT_HOSTS || 'claude.ai,localhost,127.0.0.1').split(',').map(h => h.trim());

// --- OAuth 2.0 for MCP ---
// Temporary auth codes: code -> { token, redirectUri, clientId, expiresAt }
const authCodes = new Map();

// HTML escape to prevent XSS in OAuth form
function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

// OAuth rate limiting (in-memory, per IP)
const oauthAttempts = new Map();
const OAUTH_RATE_LIMIT = 10; // max attempts per window
const OAUTH_RATE_WINDOW = 15 * 60 * 1000; // 15 minutes

function checkOAuthRateLimit(ip) {
    const now = Date.now();
    const entry = oauthAttempts.get(ip);
    if (!entry || now - entry.windowStart > OAUTH_RATE_WINDOW) {
        oauthAttempts.set(ip, { windowStart: now, count: 1 });
        return true;
    }
    entry.count++;
    if (entry.count > OAUTH_RATE_LIMIT) return false;
    return true;
}

// Cleanup rate limit entries every 30 minutes
setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of oauthAttempts) {
        if (now - entry.windowStart > OAUTH_RATE_WINDOW) oauthAttempts.delete(ip);
    }
}, 30 * 60 * 1000);

// Cleanup expired auth codes every 5 minutes
setInterval(() => {
    const now = Date.now();
    for (const [code, data] of authCodes) {
        if (data.expiresAt < now) authCodes.delete(code);
    }
}, 5 * 60 * 1000);

// --- Auth helper: extract token from request ---
function getTokenFromRequest(req) {
    const auth = req.headers.authorization;
    if (auth?.startsWith('Bearer ')) return auth.slice(7);
    return null;
}

// --- Session store: maps sessionId -> { transport, server, token, createdAt } ---
const sessions = new Map();
const SESSION_MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours
const MAX_SESSIONS = 100;

// Cleanup stale sessions every 15 minutes
setInterval(() => {
    const now = Date.now();
    for (const [id, session] of sessions) {
        if (now - session.createdAt > SESSION_MAX_AGE) {
            sessions.delete(id);
        }
    }
}, 15 * 60 * 1000);

// --- Create and configure an MCP server instance for a user ---
function createMcpServer(token) {
    const server = new McpServer({
        name: 'aedelore-dm',
        version: '1.0.0'
    });

    // Helper: wrap tool handler with try-catch for safe error responses
    function safeTool(name, description, schema, handler) {
        server.tool(name, description, schema, async (args) => {
            try {
                return await handler(args);
            } catch (err) {
                const status = err.message?.match(/^API (\d+):/)?.[1] || '';
                const safeMsg = status ? `Error (${status}): Operation failed` : 'Error: Operation failed';
                console.error(`[Tool ${name}] ${err.message}`);
                return { content: [{ type: 'text', text: safeMsg }], isError: true };
            }
        });
    }

    // ============================
    // TOOLS: Campaigns
    // ============================

    safeTool('list_campaigns',
        'List all your campaigns with session counts',
        {},
        async () => {
            const campaigns = await api.listCampaigns(token);
            return { content: [{ type: 'text', text: JSON.stringify(campaigns, null, 2) }] };
        }
    );

    safeTool('get_campaign',
        'Get campaign details with list of sessions',
        { campaign_id: z.number().describe('Campaign ID') },
        async ({ campaign_id }) => {
            const campaign = await api.getCampaign(token, campaign_id);
            return { content: [{ type: 'text', text: JSON.stringify(campaign, null, 2) }] };
        }
    );

    safeTool('create_campaign',
        'Create a new campaign',
        {
            name: z.string().min(1).max(100).describe('Campaign name'),
            description: z.string().optional().describe('Campaign description')
        },
        async ({ name, description }) => {
            const result = await api.createCampaign(token, name, description || '');
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
    );

    safeTool('generate_share_code',
        'Generate a share code for a campaign so players can join it',
        { campaign_id: z.number().describe('Campaign ID') },
        async ({ campaign_id }) => {
            const result = await api.generateShareCode(token, campaign_id);
            return { content: [{ type: 'text', text: `Share code: ${result.share_code || result.shareCode || JSON.stringify(result)}\nPlayers can join using: join_campaign(character_id, "${result.share_code || result.shareCode || ''}")` }] };
        }
    );

    // ============================
    // TOOLS: Sessions
    // ============================

    safeTool('get_session',
        'Get full session data including NPCs, encounters, places, items, events',
        { session_id: z.number().describe('Session ID') },
        async ({ session_id }) => {
            const session = await api.getSession(token, session_id);
            return { content: [{ type: 'text', text: JSON.stringify(session, null, 2) }] };
        }
    );

    safeTool('get_session_history',
        'Get all sessions for a campaign formatted as readable context for AI planning',
        { campaign_id: z.number().describe('Campaign ID') },
        async ({ campaign_id }) => {
            const history = await api.getSessionHistory(token, campaign_id);
            return { content: [{ type: 'text', text: history }] };
        }
    );

    safeTool('create_session',
        'Create a new session in a campaign',
        {
            campaign_id: z.number().describe('Campaign ID'),
            date: z.string().optional().describe('Session date (YYYY-MM-DD)'),
            location: z.string().optional().describe('Session location'),
            data: z.record(z.string(), z.unknown()).optional().describe('Initial session data (hook, npcs, etc.)')
        },
        async ({ campaign_id, date, location, data }) => {
            const result = await api.createSession(token, campaign_id, { date, location, data: data || {} });
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
    );

    safeTool('update_session',
        'Update session data. Merges with existing data — send full session_data object.',
        {
            session_id: z.number().describe('Session ID'),
            session_number: z.number().optional().describe('Session number'),
            date: z.string().optional().describe('Session date'),
            location: z.string().optional().describe('Session location'),
            data: z.record(z.string(), z.unknown()).describe('Full session data object')
        },
        async ({ session_id, session_number, date, location, data }) => {
            const body = { data };
            if (session_number !== undefined) body.session_number = session_number;
            if (date !== undefined) body.date = date;
            if (location !== undefined) body.location = location;
            const result = await api.updateSession(token, session_id, body);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
    );

    const timeEnum = z.enum(['dawn', 'morning', 'noon', 'afternoon', 'dusk', 'evening', 'night']);

    const placeSchema = z.object({
        name: z.string().describe('Place name'),
        description: z.string().describe('Place description'),
        day: z.number().int().describe('Day number (integer)'),
        time: timeEnum.describe('Time of day')
    });

    const npcSchema = z.object({
        name: z.string().describe('NPC name'),
        role: z.string().optional().describe('NPC role'),
        description: z.string().optional().describe('NPC description'),
        disposition: z.string().optional().describe('friendly, neutral, or hostile'),
        day: z.number().int().describe('Day number — MUST match the place day'),
        time: timeEnum.describe('Time of day — MUST match the place time'),
        plannedLocation: z.string().describe('EXACT name of the place where this NPC is found')
    });

    const enemySchema = z.object({
        name: z.string().describe('Enemy name'),
        disposition: z.string().optional().default('enemy'),
        role: z.string().optional().describe('Warrior, Rogue, Mage, Healer, Ranger, Beast, Civilian, Historian, Other'),
        hp: z.string().describe('Hit points as string'),
        armor: z.string().optional(),
        weapon: z.string().optional(),
        atkBonus: z.string().optional().describe('Attack bonus as string like "+3"'),
        dmg: z.string().optional().describe('Damage like "1d8"')
    });

    const encounterSchema = z.object({
        name: z.string().describe('Encounter name'),
        location: z.string().describe('EXACT name of the place where this encounter happens'),
        day: z.number().int().describe('Day number — MUST match the place day'),
        time: timeEnum.describe('Time of day — MUST match the place time'),
        enemies: z.array(enemySchema).optional().describe('List of enemies with stats'),
        tactics: z.string().optional(),
        loot: z.string().optional().describe('Simple loot only: gold, potions. Story items go in items array.')
    });

    const readAloudSchema = z.object({
        title: z.string().describe('Title for the read-aloud text'),
        text: z.string().describe('The atmospheric text to read aloud'),
        day: z.number().int().describe('Day number — MUST match linked content day'),
        time: timeEnum.describe('Time of day — MUST match linked content time'),
        linkedType: z.enum(['place', 'encounter', 'npc']).describe('What this text is linked to'),
        linkedTo: z.string().describe('EXACT name of the place, encounter, or NPC')
    });

    const itemSchema = z.object({
        name: z.string().describe('Item name'),
        description: z.string().describe('Item description'),
        day: z.number().int().describe('Day number — MUST match the place/encounter day'),
        time: timeEnum.describe('Time of day — MUST match the place/encounter time'),
        plannedLocation: z.string().describe('EXACT name of the place or encounter where this item is found')
    });

    safeTool('import_content',
        'Import AI-generated content into a session. EVERY piece of content MUST have day (integer) and time (dawn/morning/noon/afternoon/dusk/evening/night). NPCs/items need plannedLocation, encounters need location, readAloud needs linkedType+linkedTo. All names must match exactly.',
        {
            session_id: z.number().describe('Session ID'),
            content: z.object({
                hook: z.string().optional(),
                places: z.array(placeSchema).optional().describe('Places are containers — define these FIRST, then link other content to them'),
                npcs: z.array(npcSchema).optional(),
                encounters: z.array(encounterSchema).optional(),
                readAloud: z.array(readAloudSchema).optional(),
                items: z.array(itemSchema).optional()
            }).describe('All content must have day + time. Content links to places by exact name match + same day/time.')
        },
        async ({ session_id, content }) => {
            // Fetch current session, merge arrays, then update
            const session = await api.getSession(token, session_id);
            const data = session.data || {};

            // Collect place names for validation warnings
            const existingPlaces = (data.places || []).map(p => p.name);
            const newPlaces = (content.places || []).map(p => p.name);
            const allPlaces = [...existingPlaces, ...newPlaces];
            const warnings = [];

            if (content.hook) data.hook = content.hook;

            if (content.places?.length) {
                const places = content.places.map(p => ({
                    ...p,
                    visited: false,
                    notes: ''
                }));
                data.places = [...(data.places || []), ...places];
            }

            if (content.npcs?.length) {
                content.npcs.forEach(npc => {
                    if (npc.plannedLocation && !allPlaces.includes(npc.plannedLocation)) {
                        warnings.push(`NPC "${npc.name}" links to unknown place "${npc.plannedLocation}"`);
                    }
                });
                const npcs = content.npcs.map(npc => ({
                    ...npc,
                    actualLocation: '',
                    status: 'unused',
                    notes: ''
                }));
                data.npcs = [...(data.npcs || []), ...npcs];
            }

            if (content.encounters?.length) {
                content.encounters.forEach(enc => {
                    if (enc.location && !allPlaces.includes(enc.location)) {
                        warnings.push(`Encounter "${enc.name}" links to unknown place "${enc.location}"`);
                    }
                });
                const encounters = content.encounters.map(enc => ({
                    ...enc,
                    status: enc.status || 'planned',
                    notes: '',
                    enemies: (enc.enemies || []).map(e => ({
                        ...e,
                        disposition: e.disposition || 'enemy',
                        maxHp: e.maxHp || e.hp
                    }))
                }));
                data.encounters = [...(data.encounters || []), ...encounters];
            }

            if (content.readAloud?.length) {
                // Validate linkedTo references
                const allNames = [...allPlaces];
                (data.encounters || []).concat(content.encounters || []).forEach(e => allNames.push(e.name));
                (data.npcs || []).concat(content.npcs || []).forEach(n => allNames.push(n.name));
                content.readAloud.forEach(ra => {
                    if (ra.linkedTo && !allNames.includes(ra.linkedTo)) {
                        warnings.push(`Read-aloud "${ra.title}" links to unknown ${ra.linkedType} "${ra.linkedTo}"`);
                    }
                });
                const readAloud = content.readAloud.map(ra => ({
                    ...ra,
                    read: false
                }));
                data.readAloud = [...(data.readAloud || []), ...readAloud];
            }

            if (content.items?.length) {
                // Validate plannedLocation references
                const allLocNames = [...allPlaces];
                (data.encounters || []).concat(content.encounters || []).forEach(e => allLocNames.push(e.name));
                content.items.forEach(item => {
                    if (item.plannedLocation && !allLocNames.includes(item.plannedLocation)) {
                        warnings.push(`Item "${item.name}" links to unknown location "${item.plannedLocation}"`);
                    }
                });
                const items = content.items.map(item => ({
                    ...item,
                    actualLocation: '',
                    found: false,
                    givenTo: '',
                    notes: ''
                }));
                data.items = [...(data.items || []), ...items];
            }

            const result = await api.updateSession(token, session_id, {
                session_number: session.session_number,
                date: session.date,
                location: session.location,
                data
            });

            const counts = [];
            if (content.hook) counts.push('hook');
            if (content.places?.length) counts.push(`${content.places.length} places`);
            if (content.npcs?.length) counts.push(`${content.npcs.length} NPCs`);
            if (content.encounters?.length) counts.push(`${content.encounters.length} encounters`);
            if (content.readAloud?.length) counts.push(`${content.readAloud.length} read-aloud`);
            if (content.items?.length) counts.push(`${content.items.length} items`);

            let msg = `Imported: ${counts.join(', ')}`;
            if (warnings.length) msg += `\n\nWarnings:\n${warnings.join('\n')}`;
            msg += `\n\n💡 Reminder: All locations and creatures must exist in Aedelore. If you used any names you haven't verified, call get_world_lore("world") or get_world_lore("bestiary") to check.`;

            return { content: [{ type: 'text', text: msg }] };
        }
    );

    safeTool('lock_session',
        'Lock a session (prevents further editing)',
        { session_id: z.number().describe('Session ID') },
        async ({ session_id }) => {
            const result = await api.lockSession(token, session_id);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
    );

    safeTool('unlock_session',
        'Unlock a locked session for editing',
        { session_id: z.number().describe('Session ID') },
        async ({ session_id }) => {
            const result = await api.unlockSession(token, session_id);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
    );

    // ============================
    // TOOLS: Session content shortcuts
    // ============================

    safeTool('add_dm_note',
        'Add a private DM note to a session. These are NEVER shown to players — use for internal tracking, hidden plot threads, NPC motivations, planned twists, mechanic tracking, and session continuity notes.',
        {
            session_id: z.number().describe('Session ID'),
            text: z.string().describe('Note content'),
            category: z.enum(['plot', 'mechanic', 'npc', 'plan', 'reminder']).optional()
                .describe('Note category: plot (hidden story threads), mechanic (HP/resource tracking), npc (secret motivations), plan (upcoming events), reminder (things to remember)')
        },
        async ({ session_id, text, category }) => {
            const session = await api.getSession(token, session_id);
            const data = session.data || {};
            if (!data.dmNotes) data.dmNotes = [];

            const now = new Date();
            const timestamp = now.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

            data.dmNotes.push({ timestamp, text, category: category || 'reminder' });
            await api.updateSession(token, session_id, {
                session_number: session.session_number,
                date: session.date,
                location: session.location,
                data
            });
            return { content: [{ type: 'text', text: `DM note added [${category || 'reminder'}]: "${text}"` }] };
        }
    );

    safeTool('add_event',
        'Add an event log entry to a session',
        {
            session_id: z.number().describe('Session ID'),
            text: z.string().describe('Event description'),
            linked_type: z.enum(['place', 'encounter', 'npc']).optional().describe('What this event is linked to'),
            linked_to: z.string().optional().describe('Name of the linked place/encounter/NPC'),
            visible_to: z.union([z.literal('all'), z.array(z.string())]).optional().describe('Who can see this: "all" or array of character names')
        },
        async ({ session_id, text, linked_type, linked_to, visible_to }) => {
            const session = await api.getSession(token, session_id);
            const data = session.data || {};
            if (!data.eventLog) data.eventLog = [];

            const now = new Date();
            const timestamp = now.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });

            const entry = { timestamp, text, visibleTo: visible_to || 'all' };
            if (linked_type) entry.linkedType = linked_type;
            if (linked_to) entry.linkedTo = linked_to;

            data.eventLog.push(entry);
            await api.updateSession(token, session_id, {
                session_number: session.session_number,
                date: session.date,
                location: session.location,
                data
            });
            return { content: [{ type: 'text', text: `Event added: "${text}"\n\n💡 Tip: Use only real Aedelore locations and creatures. If unsure, verify with get_world_lore("world") or get_world_lore("bestiary").` }] };
        }
    );

    safeTool('add_turning_point',
        'Add a turning point to a session',
        {
            session_id: z.number().describe('Session ID'),
            description: z.string().describe('What happened'),
            consequence: z.string().optional().describe('What this leads to'),
            linked_type: z.enum(['place', 'encounter', 'npc']).optional(),
            linked_to: z.string().optional(),
            visible_to: z.union([z.literal('all'), z.array(z.string())]).optional()
        },
        async ({ session_id, description, consequence, linked_type, linked_to, visible_to }) => {
            const session = await api.getSession(token, session_id);
            const data = session.data || {};
            if (!data.turningPoints) data.turningPoints = [];

            const entry = { description, consequence: consequence || '', visibleTo: visible_to || 'all' };
            if (linked_type) entry.linkedType = linked_type;
            if (linked_to) entry.linkedTo = linked_to;

            data.turningPoints.push(entry);
            await api.updateSession(token, session_id, {
                session_number: session.session_number,
                date: session.date,
                location: session.location,
                data
            });
            return { content: [{ type: 'text', text: `Turning point added: "${description}"` }] };
        }
    );

    // ============================
    // TOOLS: Characters
    // ============================

    safeTool('list_campaign_characters',
        'List all player characters in a campaign with XP and lock status',
        { campaign_id: z.number().describe('Campaign ID') },
        async ({ campaign_id }) => {
            const chars = await api.listCampaignCharacters(token, campaign_id);
            return { content: [{ type: 'text', text: JSON.stringify(chars, null, 2) }] };
        }
    );

    safeTool('get_character_build',
        'Get a character\'s full build (stats, equipment, abilities)',
        { character_id: z.number().describe('Character ID') },
        async ({ character_id }) => {
            const build = await api.getCharacterBuild(token, character_id);
            return { content: [{ type: 'text', text: JSON.stringify(build, null, 2) }] };
        }
    );

    safeTool('give_xp',
        'Award XP to a character',
        {
            character_id: z.number().describe('Character ID'),
            amount: z.number().min(1).max(10000).describe('XP amount (1-10000)')
        },
        async ({ character_id, amount }) => {
            const result = await api.giveXP(token, character_id, amount);
            return { content: [{ type: 'text', text: result.message || JSON.stringify(result) }] };
        }
    );

    safeTool('give_item',
        'Give a quest item to a character',
        {
            character_id: z.number().describe('Character ID'),
            name: z.string().describe('Item name'),
            description: z.string().optional().describe('Item description'),
            session_name: z.string().optional().describe('Session name for tracking')
        },
        async ({ character_id, name, description, session_name }) => {
            const result = await api.giveItem(token, character_id, name, description, session_name);
            return { content: [{ type: 'text', text: result.message || JSON.stringify(result) }] };
        }
    );

    safeTool('remove_item',
        'Remove a quest item from a character',
        {
            character_id: z.number().describe('Character ID'),
            name: z.string().describe('Item name to remove')
        },
        async ({ character_id, name }) => {
            const result = await api.removeItem(token, character_id, name);
            return { content: [{ type: 'text', text: result.message || JSON.stringify(result) }] };
        }
    );

    safeTool('set_character_locks',
        'Lock or unlock character sheet sections',
        {
            character_id: z.number().describe('Character ID'),
            race_class_locked: z.boolean().optional(),
            attributes_locked: z.boolean().optional(),
            abilities_locked: z.boolean().optional()
        },
        async ({ character_id, ...locks }) => {
            const result = await api.setCharacterLocks(token, character_id, locks);
            return { content: [{ type: 'text', text: result.message || JSON.stringify(result) }] };
        }
    );

    // ============================
    // TOOLS: Utilities
    // ============================

    safeTool('get_campaign_state',
        'Get a combined overview of a campaign: info, active session, characters, recent events',
        { campaign_id: z.number().describe('Campaign ID') },
        async ({ campaign_id }) => {
            const [campaign, chars] = await Promise.all([
                api.getCampaign(token, campaign_id),
                api.listCampaignCharacters(token, campaign_id)
            ]);

            const sessions = campaign.sessions || [];
            const activeSessions = sessions.filter(s => s.status !== 'locked');
            const lockedSessions = sessions.filter(s => s.status === 'locked');

            let output = `# Campaign: ${campaign.name}\n`;
            if (campaign.description) output += `${campaign.description}\n`;
            output += `\nSessions: ${sessions.length} total (${lockedSessions.length} completed, ${activeSessions.length} active)\n`;

            // Characters
            if (chars?.length) {
                output += `\n## Characters (${chars.length})\n`;
                chars.forEach(c => {
                    const d = c.data || {};
                    output += `- **${d.character_name || c.name}** — ${d.race || '?'} ${d.class || '?'}`;
                    if (d.religion) output += ` (${d.religion})`;
                    output += ` | XP: ${c.xp || 0}`;
                    output += '\n';
                });
            }

            // Latest session summary
            if (activeSessions.length > 0) {
                const latest = activeSessions[activeSessions.length - 1];
                const full = await api.getSession(token, latest.id);
                output += `\n## Active Session #${full.session_number}\n`;
                output += api.formatSessionForAI(full);
            }

            output += `\n---\n## 🎲 GM INSTRUCTIONS (if you are running a game for this player)\n`;
            output += `Before you start playing, you MUST:\n`;
            output += `1. **Ask the player what to load:** "Should I load game rules, game data (weapons/armor/spells), world lore, bestiary, campaign history (which sessions?), or everything?"\n`;
            output += `2. **Load what they choose** using get_rules, get_game_data, get_world_lore, get_session / get_session_history.\n`;
            output += `3. **Confirm what you loaded** ("I have loaded the game rules, your spells, and sessions 1-3. Ready to begin.")\n`;
            output += `4. **Tell the player:** "If I ever seem to forget details, make things up, or get rules wrong, just tell me to reload — for example 'read the bestiary again', 'check the combat rules', or 'reload my character sheet'. I will re-fetch the data immediately."\n`;
            output += `5. **NEVER invent locations, creatures, or NPCs.** Only use content from Aedelore game data and lore. If you cannot point to a tool call that gave you the information, you are making it up.\n`;
            output += `6. **Log everything** with add_event and add_turning_point as the adventure progresses. Be specific, not vague.\n`;

            return { content: [{ type: 'text', text: output }] };
        }
    );

    safeTool('search_sessions',
        'Search across all sessions in a campaign for NPCs, places, items, or text',
        {
            campaign_id: z.number().describe('Campaign ID'),
            query: z.string().describe('Search term')
        },
        async ({ campaign_id, query }) => {
            const sessionList = await api.listSessions(token, campaign_id);
            const q = query.toLowerCase();
            const results = [];

            for (const s of sessionList) {
                const full = await api.getSession(token, s.id);
                const data = full.data || {};
                const matches = [];

                // Search NPCs
                (data.npcs || []).forEach(npc => {
                    if ([npc.name, npc.role, npc.description].filter(Boolean).join(' ').toLowerCase().includes(q)) {
                        matches.push(`NPC: ${npc.name} (${npc.role || 'no role'})`);
                    }
                });
                // Search places
                (data.places || []).forEach(p => {
                    if ([p.name, p.description].filter(Boolean).join(' ').toLowerCase().includes(q)) {
                        matches.push(`Place: ${p.name}`);
                    }
                });
                // Search encounters
                (data.encounters || []).forEach(enc => {
                    if ([enc.name, enc.description, enc.tactics, enc.loot].filter(Boolean).join(' ').toLowerCase().includes(q)) {
                        matches.push(`Encounter: ${enc.name}`);
                    }
                });
                // Search items
                (data.items || []).forEach(item => {
                    if ([item.name, item.description].filter(Boolean).join(' ').toLowerCase().includes(q)) {
                        matches.push(`Item: ${item.name}`);
                    }
                });
                // Search events
                (data.eventLog || []).forEach(e => {
                    if ((e.text || '').toLowerCase().includes(q)) {
                        matches.push(`Event: ${e.text}`);
                    }
                });
                // Search turning points
                (data.turningPoints || []).forEach(tp => {
                    if ([tp.description, tp.consequence].filter(Boolean).join(' ').toLowerCase().includes(q)) {
                        matches.push(`Turning Point: ${tp.description}`);
                    }
                });

                if (matches.length > 0) {
                    results.push(`### Session #${full.session_number} (${full.date || ''})\n${matches.map(m => `- ${m}`).join('\n')}`);
                }
            }

            if (results.length === 0) return { content: [{ type: 'text', text: `No results for "${query}"` }] };
            return { content: [{ type: 'text', text: results.join('\n\n') }] };
        }
    );

    safeTool('generate_markdown_export',
        'Export a session as readable Markdown',
        { session_id: z.number().describe('Session ID') },
        async ({ session_id }) => {
            const session = await api.getSession(token, session_id);
            const data = session.data || {};
            let md = `# Session #${session.session_number}\n`;
            md += `Date: ${session.date || 'N/A'} | Location: ${session.location || 'N/A'} | Status: ${session.status}\n\n`;

            if (data.hook) md += `## Hook\n${data.hook}\n\n`;
            if (data.prolog) md += `## Prolog\n${data.prolog}\n\n`;

            if (data.places?.length) {
                md += '## Places\n';
                data.places.forEach(p => {
                    md += `### ${p.name}${p.visited ? ' ✓' : ''}\n`;
                    if (p.description) md += `${p.description}\n`;
                    md += '\n';
                });
            }

            if (data.npcs?.length) {
                md += '## NPCs\n';
                data.npcs.forEach(npc => {
                    md += `### ${npc.name}`;
                    if (npc.role) md += ` (${npc.role})`;
                    if (npc.disposition) md += ` [${npc.disposition}]`;
                    md += '\n';
                    if (npc.description) md += `${npc.description}\n`;
                    md += '\n';
                });
            }

            if (data.encounters?.length) {
                md += '## Encounters\n';
                data.encounters.forEach(enc => {
                    md += `### ${enc.name} [${enc.status || 'planned'}]\n`;
                    if (enc.location) md += `Location: ${enc.location}\n`;
                    if (enc.enemies?.length) {
                        md += 'Enemies:\n';
                        enc.enemies.forEach(e => md += `- ${e.name} HP:${e.hp || '?'} ${e.weapon || ''} ${e.armor || ''}\n`);
                    }
                    if (enc.tactics) md += `Tactics: ${enc.tactics}\n`;
                    if (enc.loot) md += `Loot: ${enc.loot}\n`;
                    md += '\n';
                });
            }

            if (data.items?.length) {
                md += '## Items\n';
                data.items.forEach(item => {
                    md += `- **${item.name}**${item.found ? ' ✓' : ''}`;
                    if (item.description) md += `: ${item.description}`;
                    if (item.givenTo) md += ` (given to ${item.givenTo})`;
                    md += '\n';
                });
                md += '\n';
            }

            if (data.turningPoints?.length) {
                md += '## Turning Points\n';
                data.turningPoints.forEach((tp, i) => {
                    const prefix = tp.linkedTo ? `[${tp.linkedTo}] ` : '';
                    md += `${i + 1}. ${prefix}${tp.description}\n`;
                    if (tp.consequence) md += `   → ${tp.consequence}\n`;
                });
                md += '\n';
            }

            if (data.eventLog?.length) {
                md += '## Event Log\n';
                data.eventLog.forEach(e => {
                    const prefix = e.linkedTo ? `[${e.linkedTo}] ` : '';
                    md += `- **${e.timestamp || ''}** ${prefix}${e.text}\n`;
                });
                md += '\n';
            }

            if (data.dmNotes?.length) {
                md += '## DM Notes (Private)\n';
                data.dmNotes.forEach(n => {
                    md += `- **${n.timestamp || ''}** [${n.category || 'reminder'}] ${n.text}\n`;
                });
                md += '\n';
            }

            return { content: [{ type: 'text', text: md }] };
        }
    );

    // ============================
    // TOOLS: Game Data
    // ============================

    safeTool('get_game_data',
        'Get Aedelore game data: weapons, armor, spells, races, classes, religions',
        {
            type: z.enum(['weapons', 'armor', 'shields', 'spells', 'races', 'classes', 'religions', 'npc_names']).describe('Type of game data')
        },
        async ({ type }) => {
            // Game data is loaded from the static JS files
            const data = gameData[type];
            if (!data) return { content: [{ type: 'text', text: `Unknown game data type: ${type}` }] };
            return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
        }
    );

    safeTool('get_world_lore',
        'Get Aedelore world lore: world locations, bestiary, history, religion, organizations, nature, artifacts. ALWAYS use this to understand the Aedelore setting before creating content.',
        {
            topic: z.enum(['world', 'bestiary', 'lore', 'religion', 'organizations', 'nature', 'artifacts', 'all_basics']).describe('Lore topic. Use "all_basics" for a summary of races, classes, religions, and key world info.')
        },
        async ({ topic }) => {
            if (topic === 'all_basics') {
                // Return compact essential world data for session planning
                let text = '# AEDELORE WORLD BASICS\n\n';
                text += '## Races\n' + JSON.stringify(gameData.races, null, 2) + '\n\n';
                text += '## Classes\n' + JSON.stringify(gameData.classes, null, 2) + '\n\n';
                text += '## Religions\n' + JSON.stringify(gameData.religions, null, 2) + '\n\n';
                if (lorePages.world) {
                    text += '## World (Key Locations)\n' + lorePages.world.substring(0, 8000) + '\n';
                }
                return { content: [{ type: 'text', text }] };
            }
            const page = lorePages[topic];
            if (!page) return { content: [{ type: 'text', text: `Lore topic "${topic}" not found.` }] };
            return { content: [{ type: 'text', text: page }] };
        }
    );

    safeTool('get_rules',
        'Get Aedelore game rules and reference: dice system, combat, defense, HP calculation, status effects, healing, resources, character creation steps, and quick reference for attack/defense/spell sequences.',
        {},
        async () => {
            const page = lorePages.rules;
            if (!page) return { content: [{ type: 'text', text: 'Rules page not loaded. Check server configuration.' }] };
            return { content: [{ type: 'text', text: page }] };
        }
    );

    // ============================
    // TOOLS: Player Characters
    // ============================

    safeTool('create_my_character',
        'Create a new character with a name. Returns the new character ID.',
        {
            name: z.string().min(1).max(100).describe('Character name'),
            character_name: z.string().optional().describe('In-game character name (if different from display name)'),
            player_name: z.string().optional().describe('Player name')
        },
        async ({ name, character_name, player_name }) => {
            const data = {};
            if (character_name) data.character_name = character_name;
            if (player_name) data.player_name = player_name;
            const result = await api.createMyCharacter(token, name, data);
            return { content: [{ type: 'text', text: `Character created! ID: ${result.id}, Name: "${name}"` }] };
        }
    );

    safeTool('list_my_characters',
        'List your own characters with ID, name, system, and last updated',
        {},
        async () => {
            const chars = await api.listMyCharacters(token);
            return { content: [{ type: 'text', text: JSON.stringify(chars, null, 2) }] };
        }
    );

    safeTool('get_my_character',
        'Get your character\'s full data including stats, equipment, abilities, and lock status',
        { character_id: z.number().describe('Character ID') },
        async ({ character_id }) => {
            const char = await api.getMyCharacter(token, character_id);
            const d = char.data || {};

            // Build readable summary
            let summary = `# ${d.character_name || char.name || 'Unnamed'}\n`;
            summary += `**Race:** ${d.race || 'Not set'} | **Class:** ${d.class || 'Not set'}`;
            if (d.religion) summary += ` | **Religion:** ${d.religion}`;
            summary += '\n';

            // Lock status
            summary += `\n**Locks:** Race/Class: ${char.race_class_locked ? 'LOCKED' : 'unlocked'} | Attributes: ${char.attributes_locked ? 'LOCKED' : 'unlocked'} | Abilities: ${char.abilities_locked ? 'LOCKED' : 'unlocked'}\n`;

            // HP and status
            summary += `\n**HP:** ${d.hp_slider || 0}`;
            summary += ` | **Arcana:** ${d.arcana_slider || 0}`;
            summary += ` | **Willpower:** ${d.willpower_slider || 0}/3`;
            summary += ` | **Worthiness:** ${d.worthiness_slider || 0}`;
            summary += ` | **Bleed:** ${d.bleed_slider || 0}`;
            summary += ` | **Weakened:** ${d.weakened_slider || 0}`;
            summary += '\n';

            // Attributes
            if (d.strength_value || d.dexterity_value) {
                summary += `\n**Attributes:** STR:${d.strength_value || 0} DEX:${d.dexterity_value || 0} TOU:${d.toughness_value || 0} INT:${d.intelligence_value || 0} WIS:${d.wisdom_value || 0} FOW:${d.force_of_will_value || 0} TE:${d.third_eye_value || 0}\n`;
            }

            // Weapons
            for (let i = 1; i <= 3; i++) {
                if (d[`weapon_${i}_type`]) {
                    summary += `**Weapon ${i}:** ${d[`weapon_${i}_type`]} (ATK:${d[`weapon_${i}_atk`] || '?'} DMG:${d[`weapon_${i}_dmg`] || '?'} RNG:${d[`weapon_${i}_range`] || '?'} BRK:${d[`weapon_${i}_break`] || '?'})\n`;
                }
            }

            // Armor
            const armorSlots = { 1: 'Head', 2: 'Shoulders', 3: 'Chest', 4: 'Hands', 5: 'Legs' };
            for (let i = 1; i <= 5; i++) {
                if (d[`armor_${i}_type`]) {
                    summary += `**Armor (${armorSlots[i]}):** ${d[`armor_${i}_type`]} (HP:${d[`armor_${i}_hp`] || '?'} Current:${d[`armor_${i}_current`] || '?'} Bonus:${d[`armor_${i}_bonus`] || '?'}${d[`armor_${i}_broken`] ? ' BROKEN' : ''})\n`;
                }
            }

            // Shield
            if (d.shield_type) {
                summary += `**Shield:** ${d.shield_type} (HP:${d.shield_hp || '?'} Current:${d.shield_current || '?'} Block:${d.shield_block || '?'} Def:${d.shield_defence || '?'}${d.shield_broken ? ' BROKEN' : ''})\n`;
            }

            // Abilities
            for (let i = 1; i <= 10; i++) {
                if (d[`spell_${i}_type`]) {
                    summary += `**Ability ${i}:** ${d[`spell_${i}_type`]} (Arcana:${d[`spell_${i}_arcana`] || '-'} Weakened:${d[`spell_${i}_weakened`] || '-'}${d[`spell_${i}_gain`] ? ` Gain:${d[`spell_${i}_gain`]}` : ''})\n`;
                }
            }

            // Inventory
            summary += `\n**Gold:** ${d.gold || 0} | **Silver:** ${d.silver || 0} | **Copper:** ${d.copper || 0}\n`;
            summary += `**Potions:** Adrenaline:${d.pot_adrenaline_slider || 0} Antidote:${d.pot_antidote_slider || 0} Poison:${d.pot_poison_slider || 0} Arcane:${d.pot_arcane_slider || 0}\n`;

            // Relationships
            if (d.relationships) {
                try {
                    const rels = typeof d.relationships === 'string' ? JSON.parse(d.relationships) : d.relationships;
                    if (Array.isArray(rels) && rels.length > 0) {
                        summary += '\n**Relationships:**\n';
                        rels.forEach(r => {
                            summary += `- **${r.name}**${r.relation ? ` (${r.relation})` : ''}${r.notes ? `: ${r.notes}` : ''}\n`;
                        });
                    }
                } catch (e) { /* ignore */ }
            }

            // Campaign info
            if (char.campaign) {
                summary += `\n**Campaign:** ${char.campaign.name} (DM: ${char.campaign.dm_name})\n`;
            }

            summary += `\n---\n💡 **Remember:** Before playing, load the game rules with get_rules, and the data relevant to this character's class using get_game_data("spells"), get_game_data("weapons"), get_game_data("armor"). Never guess spell costs, weapon stats, or combat mechanics — always verify from game data and rules. Use update_relationships to track NPC bonds.\n`;

            return { content: [{ type: 'text', text: summary + '\n---\n' + JSON.stringify(char, null, 2) }] };
        }
    );

    safeTool('get_party',
        'Get other characters in the same campaign as your character',
        { character_id: z.number().describe('Character ID') },
        async ({ character_id }) => {
            const result = await api.getParty(token, character_id);
            return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
        }
    );

    // --- Character Building ---

    safeTool('set_race_class_religion',
        'Set race, class, and optionally religion for a character. Auto-applies starting equipment (weapon, armor, shield, HP, gold, worthiness) from game data.',
        {
            character_id: z.number().describe('Character ID'),
            race: z.string().describe('Race name (must exist in game data)'),
            character_class: z.string().describe('Class name (must exist in game data)'),
            religion: z.string().optional().describe('Religion name'),
            character_name: z.string().optional().describe('Character name'),
            player_name: z.string().optional().describe('Player name')
        },
        async ({ character_id, race, character_class, religion, character_name, player_name }) => {
            const char = await api.getMyCharacter(token, character_id);
            if (char.race_class_locked) {
                return { content: [{ type: 'text', text: 'ERROR: Race/class is already locked and cannot be changed.' }] };
            }

            // Validate race and class
            if (gameData.races && !gameData.races[race]) {
                return { content: [{ type: 'text', text: `ERROR: Unknown race "${race}". Valid races: ${Object.keys(gameData.races).join(', ')}` }] };
            }
            if (gameData.classes && !gameData.classes[character_class]) {
                return { content: [{ type: 'text', text: `ERROR: Unknown class "${character_class}". Valid classes: ${Object.keys(gameData.classes).join(', ')}` }] };
            }

            const data = char.data || {};
            data.race = race;
            data.class = character_class;
            if (religion) data.religion = religion;
            if (character_name) data.character_name = character_name;
            if (player_name) data.player_name = player_name;

            // Apply starting equipment from STARTING_EQUIPMENT table
            const startKey = `${race}_${character_class}`;
            const startEquip = gameData.starting_equipment?.[startKey];

            // Apply race starting data
            const raceData = gameData.races?.[race]?.startingEquipment;
            if (raceData) {
                if (raceData.hp) data.hp_slider = String(raceData.hp);
                if (raceData.food) data.food_water_1 = raceData.food + ' rations';
                if (raceData.worthiness !== undefined) data.worthiness_slider = String(raceData.worthiness);
            }

            // Apply class starting data
            const classData = gameData.classes?.[character_class]?.startingEquipment;
            if (classData) {
                if (classData.gold !== undefined) data.gold = String(classData.gold);
                if (classData.hpBonus && raceData?.hp) {
                    data.hp_slider = String(raceData.hp + classData.hpBonus);
                }
                if (classData.worthiness !== undefined && raceData?.worthiness !== undefined) {
                    data.worthiness_slider = String(raceData.worthiness + classData.worthiness);
                }
            }

            // Apply starting equipment (weapon, armor, shield)
            if (startEquip) {
                // Weapon slot 1
                if (startEquip.weapon) {
                    const weaponData = gameData.weapons?.[startEquip.weapon];
                    data.weapon_1_type = startEquip.weapon;
                    if (weaponData) {
                        data.weapon_1_atk = weaponData.bonus || '';
                        data.weapon_1_dmg = weaponData.damage || '';
                        data.weapon_1_range = weaponData.range || '';
                        data.weapon_1_break = weaponData.break || '';
                    }
                }

                // Race weapon in slot 2 (if different)
                const raceWeapon = raceData?.weapon;
                if (raceWeapon && raceWeapon !== startEquip.weapon) {
                    const weaponData = gameData.weapons?.[raceWeapon];
                    data.weapon_2_type = raceWeapon;
                    if (weaponData) {
                        data.weapon_2_atk = weaponData.bonus || '';
                        data.weapon_2_dmg = weaponData.damage || '';
                        data.weapon_2_range = weaponData.range || '';
                        data.weapon_2_break = weaponData.break || '';
                    }
                }

                // Armor slots: 1=Head, 2=Shoulders, 3=Chest, 4=Hands, 5=Legs
                const armorSlotMap = { head: 1, shoulders: 2, chest: 3, hands: 4, legs: 5 };
                if (startEquip.armor) {
                    for (const [bodypart, armorName] of Object.entries(startEquip.armor)) {
                        const slot = armorSlotMap[bodypart];
                        if (!slot) continue;
                        const armorInfo = gameData.armor?.[armorName];
                        data[`armor_${slot}_type`] = armorName;
                        if (armorInfo) {
                            data[`armor_${slot}_hp`] = armorInfo.hp || '';
                            data[`armor_${slot}_current`] = armorInfo.hp || '';
                            data[`armor_${slot}_bonus`] = armorInfo.bonus || '';
                            data[`armor_${slot}_disadvantage`] = armorInfo.disadvantage || '';
                        }
                    }
                }

                // Shield
                if (startEquip.shield) {
                    const shieldInfo = gameData.shields?.[startEquip.shield];
                    data.shield_type = startEquip.shield;
                    if (shieldInfo) {
                        data.shield_hp = shieldInfo.hp || '';
                        data.shield_current = shieldInfo.hp || '';
                        data.shield_block = shieldInfo.block || '';
                        data.shield_defence = shieldInfo.defence || '';
                        data.shield_dmg = shieldInfo.damage || '';
                    }
                }
            }

            const charName = character_name || data.character_name || char.name;
            await api.saveMyCharacter(token, character_id, charName, data);

            let msg = `Set ${race} ${character_class}`;
            if (religion) msg += ` (${religion})`;
            msg += `. Starting equipment applied.`;
            if (data.hp_slider) msg += ` HP: ${data.hp_slider}.`;
            if (data.gold) msg += ` Gold: ${data.gold}.`;
            return { content: [{ type: 'text', text: msg }] };
        }
    );

    safeTool('set_attributes',
        'Set attribute values for a character. Max 5 per base stat, 10 free points total. Third eye is separate (0-3).',
        {
            character_id: z.number().describe('Character ID'),
            strength: z.number().min(0).max(5).describe('Strength value (0-5)'),
            dexterity: z.number().min(0).max(5).describe('Dexterity value (0-5)'),
            toughness: z.number().min(0).max(5).describe('Toughness value (0-5)'),
            intelligence: z.number().min(0).max(5).describe('Intelligence value (0-5)'),
            wisdom: z.number().min(0).max(5).describe('Wisdom value (0-5)'),
            force_of_will: z.number().min(0).max(5).describe('Force of Will value (0-5)'),
            third_eye: z.number().min(0).max(3).optional().describe('Third Eye value (0-3, separate pool)')
        },
        async ({ character_id, strength, dexterity, toughness, intelligence, wisdom, force_of_will, third_eye }) => {
            const char = await api.getMyCharacter(token, character_id);
            if (char.attributes_locked) {
                return { content: [{ type: 'text', text: 'ERROR: Attributes are already locked and cannot be changed.' }] };
            }
            if (!char.race_class_locked) {
                return { content: [{ type: 'text', text: 'ERROR: Must lock race/class before setting attributes.' }] };
            }

            const total = strength + dexterity + toughness + intelligence + wisdom + force_of_will;
            if (total > 10) {
                return { content: [{ type: 'text', text: `ERROR: Total base points (${total}) exceeds maximum of 10. Reduce some values.` }] };
            }
            if (total < 10) {
                return { content: [{ type: 'text', text: `WARNING: Only ${total}/10 points used. Are you sure? All 10 free points should be allocated.` }] };
            }

            const data = char.data || {};
            data.strength_value = String(strength);
            data.dexterity_value = String(dexterity);
            data.toughness_value = String(toughness);
            data.intelligence_value = String(intelligence);
            data.wisdom_value = String(wisdom);
            data.force_of_will_value = String(force_of_will);
            if (third_eye !== undefined) data.third_eye_value = String(third_eye);

            await api.saveMyCharacter(token, character_id, data.character_name || char.name, data);
            return { content: [{ type: 'text', text: `Attributes set: STR:${strength} DEX:${dexterity} TOU:${toughness} INT:${intelligence} WIS:${wisdom} FOW:${force_of_will}${third_eye !== undefined ? ` TE:${third_eye}` : ''} (${total}/10 points used)` }] };
        }
    );

    safeTool('set_abilities',
        'Set spells/abilities for a character. Must match valid spells for their class.',
        {
            character_id: z.number().describe('Character ID'),
            abilities: z.array(z.object({
                slot: z.number().min(1).max(10).describe('Ability slot number (1-10)'),
                name: z.string().describe('Spell/ability name (must exist in SPELLS_BY_CLASS for the character class)')
            })).describe('Array of ability assignments')
        },
        async ({ character_id, abilities }) => {
            const char = await api.getMyCharacter(token, character_id);
            if (char.abilities_locked) {
                return { content: [{ type: 'text', text: 'ERROR: Abilities are already locked and cannot be changed.' }] };
            }

            const charClass = char.data?.class;
            if (!charClass) {
                return { content: [{ type: 'text', text: 'ERROR: Character has no class set. Set race/class first.' }] };
            }

            const classSpells = gameData.spells?.[charClass];
            if (!classSpells) {
                return { content: [{ type: 'text', text: `ERROR: No spells found for class "${charClass}".` }] };
            }

            const data = char.data || {};
            const applied = [];

            for (const { slot, name } of abilities) {
                const spell = classSpells.find(s => s.name === name);
                if (!spell) {
                    return { content: [{ type: 'text', text: `ERROR: Spell "${name}" is not valid for class "${charClass}". Valid spells: ${classSpells.map(s => s.name).join(', ')}` }] };
                }
                data[`spell_${slot}_type`] = spell.name;
                data[`spell_${slot}_arcana`] = spell.arcana || '-';
                data[`spell_${slot}_weakened`] = String(spell.weakened || '');
                if (spell.gain !== undefined) data[`spell_${slot}_gain`] = String(spell.gain);
                applied.push(`Slot ${slot}: ${spell.name}`);
            }

            await api.saveMyCharacter(token, character_id, data.character_name || char.name, data);
            return { content: [{ type: 'text', text: `Abilities set:\n${applied.join('\n')}` }] };
        }
    );

    safeTool('lock_character_step',
        'Lock a character build step (must follow order: race-class → attributes → abilities)',
        {
            character_id: z.number().describe('Character ID'),
            step: z.enum(['race-class', 'attributes', 'abilities']).describe('Step to lock')
        },
        async ({ character_id, step }) => {
            const result = await api.lockCharacterStep(token, character_id, step);
            return { content: [{ type: 'text', text: result.message || JSON.stringify(result) }] };
        }
    );

    // --- Equipment ---

    safeTool('equip_weapon',
        'Equip a weapon in a slot (1-3). Auto-fills attack, damage, range, and break from game data.',
        {
            character_id: z.number().describe('Character ID'),
            slot: z.number().min(1).max(3).describe('Weapon slot (1-3)'),
            weapon_name: z.string().describe('Weapon name (must exist in game data)')
        },
        async ({ character_id, slot, weapon_name }) => {
            const weaponData = gameData.weapons?.[weapon_name];
            if (!weaponData) {
                return { content: [{ type: 'text', text: `ERROR: Unknown weapon "${weapon_name}". Use get_game_data("weapons") to see valid weapons.` }] };
            }

            const char = await api.getMyCharacter(token, character_id);
            const data = char.data || {};

            data[`weapon_${slot}_type`] = weapon_name;
            data[`weapon_${slot}_atk`] = weaponData.bonus || '';
            data[`weapon_${slot}_dmg`] = weaponData.damage || '';
            data[`weapon_${slot}_range`] = weaponData.range || '';
            data[`weapon_${slot}_break`] = weaponData.break || '';

            await api.saveMyCharacter(token, character_id, data.character_name || char.name, data);
            return { content: [{ type: 'text', text: `Equipped ${weapon_name} in slot ${slot} (ATK:${weaponData.bonus} DMG:${weaponData.damage} RNG:${weaponData.range} BRK:${weaponData.break})` }] };
        }
    );

    safeTool('equip_armor',
        'Equip armor or shield. Slot: 1=Head, 2=Shoulders, 3=Chest, 4=Hands, 5=Legs. Auto-fills HP, bonus, disadvantage.',
        {
            character_id: z.number().describe('Character ID'),
            slot: z.number().min(1).max(5).optional().describe('Armor slot: 1=Head, 2=Shoulders, 3=Chest, 4=Hands, 5=Legs'),
            armor_name: z.string().optional().describe('Armor name (must exist in game data)'),
            shield_name: z.string().optional().describe('Shield name (must exist in game data)')
        },
        async ({ character_id, slot, armor_name, shield_name }) => {
            const char = await api.getMyCharacter(token, character_id);
            const data = char.data || {};
            const results = [];

            if (armor_name && slot) {
                const armorInfo = gameData.armor?.[armor_name];
                if (!armorInfo) {
                    return { content: [{ type: 'text', text: `ERROR: Unknown armor "${armor_name}". Use get_game_data("armor") to see valid armor.` }] };
                }
                data[`armor_${slot}_type`] = armor_name;
                data[`armor_${slot}_hp`] = armorInfo.hp || '';
                data[`armor_${slot}_current`] = armorInfo.hp || '';
                data[`armor_${slot}_bonus`] = armorInfo.bonus || '';
                data[`armor_${slot}_disadvantage`] = armorInfo.disadvantage || '';
                data[`armor_${slot}_broken`] = false;
                const slotNames = { 1: 'Head', 2: 'Shoulders', 3: 'Chest', 4: 'Hands', 5: 'Legs' };
                results.push(`Equipped ${armor_name} on ${slotNames[slot]} (HP:${armorInfo.hp} Bonus:${armorInfo.bonus})`);
            }

            if (shield_name) {
                const shieldInfo = gameData.shields?.[shield_name];
                if (!shieldInfo) {
                    return { content: [{ type: 'text', text: `ERROR: Unknown shield "${shield_name}". Use get_game_data("shields") to see valid shields.` }] };
                }
                data.shield_type = shield_name;
                data.shield_hp = shieldInfo.hp || '';
                data.shield_current = shieldInfo.hp || '';
                data.shield_block = shieldInfo.block || '';
                data.shield_defence = shieldInfo.defence || '';
                data.shield_dmg = shieldInfo.damage || '';
                data.shield_broken = false;
                results.push(`Equipped ${shield_name} (HP:${shieldInfo.hp} Block:${shieldInfo.block} Def:${shieldInfo.defence})`);
            }

            if (results.length === 0) {
                return { content: [{ type: 'text', text: 'ERROR: Must provide either armor_name+slot or shield_name.' }] };
            }

            await api.saveMyCharacter(token, character_id, data.character_name || char.name, data);
            return { content: [{ type: 'text', text: results.join('\n') }] };
        }
    );

    // --- Gameplay ---

    safeTool('update_hp',
        'Update HP, arcana, willpower, worthiness, bleed, weakened, or injuries for a character',
        {
            character_id: z.number().describe('Character ID'),
            hp: z.number().optional().describe('Set HP slider value'),
            arcana: z.number().optional().describe('Set arcana slider value'),
            willpower: z.number().min(0).max(3).optional().describe('Set willpower (0-3)'),
            worthiness: z.number().min(-10).max(10).optional().describe('Set worthiness (-10 to 10)'),
            bleed: z.number().min(0).max(6).optional().describe('Set bleed level (0-6)'),
            weakened: z.number().min(0).max(6).optional().describe('Set weakened level (0-6)'),
            injuries: z.string().optional().describe('Injury description text')
        },
        async ({ character_id, hp, arcana, willpower, worthiness, bleed, weakened, injuries }) => {
            const char = await api.getMyCharacter(token, character_id);
            const data = char.data || {};
            const changes = [];

            if (hp !== undefined) { data.hp_slider = String(hp); changes.push(`HP→${hp}`); }
            if (arcana !== undefined) { data.arcana_slider = String(arcana); changes.push(`Arcana→${arcana}`); }
            if (willpower !== undefined) { data.willpower_slider = String(willpower); changes.push(`Willpower→${willpower}`); }
            if (worthiness !== undefined) { data.worthiness_slider = String(worthiness); changes.push(`Worthiness→${worthiness}`); }
            if (bleed !== undefined) { data.bleed_slider = String(bleed); changes.push(`Bleed→${bleed}`); }
            if (weakened !== undefined) { data.weakened_slider = String(weakened); changes.push(`Weakened→${weakened}`); }
            if (injuries !== undefined) { data.injuries = injuries; changes.push(`Injuries: ${injuries}`); }

            if (changes.length === 0) {
                return { content: [{ type: 'text', text: 'No changes specified.' }] };
            }

            await api.saveMyCharacter(token, character_id, data.character_name || char.name, data);
            return { content: [{ type: 'text', text: `Updated: ${changes.join(', ')}\n\n💡 Reminder: Log what caused this change with add_event (e.g., "Took 5 damage from Grottväktare claw attack"). If unsure about defense or healing rules, call get_rules.` }] };
        }
    );

    safeTool('update_equipment_hp',
        'Update current HP for armor pieces or shield (track damage during combat)',
        {
            character_id: z.number().describe('Character ID'),
            armor_slot: z.number().min(1).max(5).optional().describe('Armor slot: 1=Head, 2=Shoulders, 3=Chest, 4=Hands, 5=Legs'),
            armor_current_hp: z.number().optional().describe('Set armor current HP'),
            armor_broken: z.boolean().optional().describe('Mark armor as broken'),
            shield_current_hp: z.number().optional().describe('Set shield current HP'),
            shield_broken: z.boolean().optional().describe('Mark shield as broken')
        },
        async ({ character_id, armor_slot, armor_current_hp, armor_broken, shield_current_hp, shield_broken }) => {
            const char = await api.getMyCharacter(token, character_id);
            const data = char.data || {};
            const changes = [];

            if (armor_slot && armor_current_hp !== undefined) {
                data[`armor_${armor_slot}_current`] = String(armor_current_hp);
                changes.push(`Armor slot ${armor_slot} HP→${armor_current_hp}`);
            }
            if (armor_slot && armor_broken !== undefined) {
                data[`armor_${armor_slot}_broken`] = armor_broken;
                changes.push(`Armor slot ${armor_slot} ${armor_broken ? 'BROKEN' : 'repaired'}`);
            }
            if (shield_current_hp !== undefined) {
                data.shield_current = String(shield_current_hp);
                changes.push(`Shield HP→${shield_current_hp}`);
            }
            if (shield_broken !== undefined) {
                data.shield_broken = shield_broken;
                changes.push(`Shield ${shield_broken ? 'BROKEN' : 'repaired'}`);
            }

            if (changes.length === 0) {
                return { content: [{ type: 'text', text: 'No changes specified.' }] };
            }

            await api.saveMyCharacter(token, character_id, data.character_name || char.name, data);
            return { content: [{ type: 'text', text: `Updated: ${changes.join(', ')}\n\n💡 Reminder: Log what caused this equipment damage with add_event. If unsure about defense or equipment damage rules, call get_rules.` }] };
        }
    );

    safeTool('update_inventory',
        'Update gold, silver, copper, potions, arrows, or food/water',
        {
            character_id: z.number().describe('Character ID'),
            gold: z.number().optional().describe('Set gold amount'),
            silver: z.number().optional().describe('Set silver amount'),
            copper: z.number().optional().describe('Set copper amount'),
            pot_adrenaline: z.number().min(0).max(3).optional().describe('Adrenaline potions (0-3)'),
            pot_antidote: z.number().min(0).max(3).optional().describe('Antidote potions (0-3)'),
            pot_poison: z.number().min(0).max(3).optional().describe('Poison potions (0-3)'),
            pot_arcane: z.number().min(0).max(2).optional().describe('Arcane elixir (0-2)'),
            arrows: z.string().optional().describe('Arrow count text (e.g., "1D10 arrows")'),
            poison_arrows: z.number().min(0).max(6).optional().describe('Poison arrows (0-6)'),
            food_water_1: z.string().optional().describe('Food/water slot 1'),
            food_water_2: z.string().optional().describe('Food/water slot 2')
        },
        async ({ character_id, gold, silver, copper, pot_adrenaline, pot_antidote, pot_poison, pot_arcane, arrows, poison_arrows, food_water_1, food_water_2 }) => {
            const char = await api.getMyCharacter(token, character_id);
            const data = char.data || {};
            const changes = [];

            if (gold !== undefined) { data.gold = String(gold); changes.push(`Gold→${gold}`); }
            if (silver !== undefined) { data.silver = String(silver); changes.push(`Silver→${silver}`); }
            if (copper !== undefined) { data.copper = String(copper); changes.push(`Copper→${copper}`); }
            if (pot_adrenaline !== undefined) { data.pot_adrenaline_slider = String(pot_adrenaline); changes.push(`Adrenaline→${pot_adrenaline}`); }
            if (pot_antidote !== undefined) { data.pot_antidote_slider = String(pot_antidote); changes.push(`Antidote→${pot_antidote}`); }
            if (pot_poison !== undefined) { data.pot_poison_slider = String(pot_poison); changes.push(`Poison→${pot_poison}`); }
            if (pot_arcane !== undefined) { data.pot_arcane_slider = String(pot_arcane); changes.push(`Arcane Elixir→${pot_arcane}`); }
            if (arrows !== undefined) { data.arrows = arrows; changes.push(`Arrows: ${arrows}`); }
            if (poison_arrows !== undefined) { data.poison_arrow_slider = String(poison_arrows); changes.push(`Poison Arrows→${poison_arrows}`); }
            if (food_water_1 !== undefined) { data.food_water_1 = food_water_1; changes.push(`Food/Water 1: ${food_water_1}`); }
            if (food_water_2 !== undefined) { data.food_water_2 = food_water_2; changes.push(`Food/Water 2: ${food_water_2}`); }

            if (changes.length === 0) {
                return { content: [{ type: 'text', text: 'No changes specified.' }] };
            }

            await api.saveMyCharacter(token, character_id, data.character_name || char.name, data);
            return { content: [{ type: 'text', text: `Updated: ${changes.join(', ')}\n\n💡 Reminder: Log what caused this change with add_event.` }] };
        }
    );

    safeTool('add_notes',
        'Add text to the character\'s notes or inventory freetext',
        {
            character_id: z.number().describe('Character ID'),
            text: z.string().describe('Text to append'),
            field: z.enum(['inventory', 'notes']).describe('Which field: inventory (additional gear/items) or notes (quest notes)')
        },
        async ({ character_id, text, field }) => {
            const char = await api.getMyCharacter(token, character_id);
            const data = char.data || {};

            const fieldId = field === 'inventory' ? 'inventory_freetext' : 'notes_freetext';
            const current = data[fieldId] || '';
            const newValue = current ? current + '\n' + text : text;

            if (newValue.length > 10000) {
                return { content: [{ type: 'text', text: `WARNING: ${field} field is very large (${newValue.length} chars). Consider summarizing old notes. Text was still added.` }] };
            }

            data[fieldId] = newValue;
            await api.saveMyCharacter(token, character_id, data.character_name || char.name, data);
            return { content: [{ type: 'text', text: `Added to ${field}: "${text}"` }] };
        }
    );

    safeTool('update_relationships',
        'Update NPC relationships on a character sheet. Replaces the entire list.',
        {
            character_id: z.number().describe('Character ID'),
            relationships: z.array(z.object({
                name: z.string().describe('NPC name'),
                relation: z.string().optional().describe('Relation type (e.g. Ally, Rival, Mentor, Enemy)'),
                notes: z.string().optional().describe('Notes about this relationship')
            })).describe('Array of relationships (replaces all existing)')
        },
        async ({ character_id, relationships }) => {
            const char = await api.getMyCharacter(token, character_id);
            const data = char.data || {};

            // Validate each entry has at least a name
            const valid = relationships.filter(r => r.name && r.name.trim());
            if (valid.length === 0 && relationships.length > 0) {
                return { content: [{ type: 'text', text: 'ERROR: Each relationship must have at least a name.' }] };
            }

            data.relationships = JSON.stringify(valid);
            await api.saveMyCharacter(token, character_id, data.character_name || char.name, data);
            return { content: [{ type: 'text', text: `Updated relationships (${valid.length} entries): ${valid.map(r => r.name).join(', ')}` }] };
        }
    );

    safeTool('join_campaign',
        'Join a campaign using a share code',
        {
            character_id: z.number().describe('Character ID'),
            share_code: z.string().describe('Campaign share code')
        },
        async ({ character_id, share_code }) => {
            const result = await api.joinCampaign(token, character_id, share_code);
            return { content: [{ type: 'text', text: result.campaign_name ? `Joined campaign: ${result.campaign_name}` : JSON.stringify(result) }] };
        }
    );

    // ============================
    // PROMPTS: DM
    // ============================

    for (const [name, template] of Object.entries(PROMPT_TEMPLATES)) {
        const argsSchema = {};
        // Add campaign_id as required arg for all prompts
        argsSchema.campaign_id = z.string().describe('Campaign ID');
        // Add template-specific args
        if (template.args) {
            for (const [key, desc] of Object.entries(template.args)) {
                argsSchema[key] = z.string().optional().describe(desc);
            }
        }

        server.prompt(name, template.description, argsSchema,
            async (args) => {
                const campaignId = parseInt(args.campaign_id);
                // Build context from campaign data
                const [campaign, chars] = await Promise.all([
                    api.getCampaign(token, campaignId),
                    api.listCampaignCharacters(token, campaignId)
                ]);

                let context = '';

                // Aedelore world essentials — races, classes, religions
                context += `## AEDELORE WORLD DATA\n`;
                if (gameData.races) {
                    context += `\n### Races: ${Object.keys(gameData.races).join(', ')}\n`;
                }
                if (gameData.classes) {
                    context += `### Classes: ${Object.keys(gameData.classes).join(', ')}\n`;
                }
                if (gameData.religions) {
                    context += `### Religions: ${Object.keys(gameData.religions).join(', ')}\n`;
                    for (const [name, r] of Object.entries(gameData.religions)) {
                        context += `- **${name}** (deity: ${r.deity || '?'}): ${r.description || ''}\n`;
                    }
                }
                if (lorePages.world) {
                    // Include first ~3000 chars of world locations
                    context += `\n### Key World Locations\n${lorePages.world.substring(0, 3000)}\n`;
                }

                context += `\n## CAMPAIGN: ${campaign.name}\n`;
                if (campaign.description) context += `${campaign.description}\n`;

                // Characters
                if (chars?.length) {
                    context += `\n## PLAYER CHARACTERS\n`;
                    for (const c of chars) {
                        const build = await api.getCharacterBuild(token, c.id).catch(() => null);
                        const d = build?.data || c.data || {};
                        context += `- **${d.character_name || c.name}**: ${d.race || '?'} ${d.class || '?'}`;
                        if (d.religion) context += ` (${d.religion})`;
                        context += ` | HP: ${d.hp_slider || '?'} | STR: ${d.strength_value || '?'} DEX: ${d.dexterity_value || '?'} TOU: ${d.toughness_value || '?'} INT: ${d.intelligence_value || '?'} WIS: ${d.wisdom_value || '?'}`;
                        context += '\n';
                    }
                }

                // Session history
                const history = await api.getSessionHistory(token, campaignId);
                if (history && history !== 'No sessions found.') {
                    context += `\n## SESSION HISTORY\n${history}`;
                }

                return {
                    messages: [{
                        role: 'user',
                        content: { type: 'text', text: template.buildPrompt(args, context) }
                    }]
                };
            }
        );
    }

    // ============================
    // PROMPTS: Player
    // ============================

    for (const [name, template] of Object.entries(PLAYER_PROMPT_TEMPLATES)) {
        const argsSchema = {};
        // All player prompts require character_id
        argsSchema.character_id = z.string().describe('Character ID');
        // Add template-specific args
        if (template.args) {
            for (const [key, desc] of Object.entries(template.args)) {
                argsSchema[key] = z.string().optional().describe(desc);
            }
        }

        server.prompt(`player_${name}`, `[Player] ${template.description}`, argsSchema,
            async (args) => {
                const characterId = parseInt(args.character_id);
                const char = await api.getMyCharacter(token, characterId);
                const d = char.data || {};

                let context = '';

                // Aedelore world essentials
                context += `## AEDELORE WORLD DATA\n`;
                if (gameData.races) {
                    context += `\n### Races: ${Object.keys(gameData.races).join(', ')}\n`;
                }
                if (gameData.classes) {
                    context += `### Classes: ${Object.keys(gameData.classes).join(', ')}\n`;
                }
                if (gameData.religions) {
                    context += `### Religions: ${Object.keys(gameData.religions).join(', ')}\n`;
                }

                // Character info
                context += `\n## YOUR CHARACTER\n`;
                context += `**Name:** ${d.character_name || char.name || 'Unnamed'}\n`;
                context += `**Race:** ${d.race || 'Not set'} | **Class:** ${d.class || 'Not set'}`;
                if (d.religion) context += ` | **Religion:** ${d.religion}`;
                context += '\n';
                context += `**Locks:** Race/Class: ${char.race_class_locked ? 'LOCKED' : 'unlocked'} | Attributes: ${char.attributes_locked ? 'LOCKED' : 'unlocked'} | Abilities: ${char.abilities_locked ? 'LOCKED' : 'unlocked'}\n`;

                // Stats
                if (d.strength_value || d.dexterity_value) {
                    context += `**Attributes:** STR:${d.strength_value || 0} DEX:${d.dexterity_value || 0} TOU:${d.toughness_value || 0} INT:${d.intelligence_value || 0} WIS:${d.wisdom_value || 0} FOW:${d.force_of_will_value || 0} TE:${d.third_eye_value || 0}\n`;
                }

                context += `**HP:** ${d.hp_slider || 0} | **Arcana:** ${d.arcana_slider || 0} | **Willpower:** ${d.willpower_slider || 0}/3 | **Worthiness:** ${d.worthiness_slider || 0} | **Bleed:** ${d.bleed_slider || 0} | **Weakened:** ${d.weakened_slider || 0}\n`;

                // Weapons
                for (let i = 1; i <= 3; i++) {
                    if (d[`weapon_${i}_type`]) {
                        context += `**Weapon ${i}:** ${d[`weapon_${i}_type`]} (ATK:${d[`weapon_${i}_atk`] || '?'} DMG:${d[`weapon_${i}_dmg`] || '?'} RNG:${d[`weapon_${i}_range`] || '?'})\n`;
                    }
                }

                // Armor
                const aSlots = { 1: 'Head', 2: 'Shoulders', 3: 'Chest', 4: 'Hands', 5: 'Legs' };
                for (let i = 1; i <= 5; i++) {
                    if (d[`armor_${i}_type`]) {
                        context += `**${aSlots[i]}:** ${d[`armor_${i}_type`]} (HP:${d[`armor_${i}_current`] || '?'}/${d[`armor_${i}_hp`] || '?'}${d[`armor_${i}_broken`] ? ' BROKEN' : ''})\n`;
                    }
                }
                if (d.shield_type) {
                    context += `**Shield:** ${d.shield_type} (HP:${d.shield_current || '?'}/${d.shield_hp || '?'}${d.shield_broken ? ' BROKEN' : ''})\n`;
                }

                // Abilities
                const abilities = [];
                for (let i = 1; i <= 10; i++) {
                    if (d[`spell_${i}_type`]) {
                        abilities.push(`${d[`spell_${i}_type`]} (Arcana:${d[`spell_${i}_arcana`] || '-'} Weakened:${d[`spell_${i}_weakened`] || '-'}${d[`spell_${i}_gain`] ? ` Gain:${d[`spell_${i}_gain`]}` : ''})`);
                    }
                }
                if (abilities.length) {
                    context += `**Abilities:** ${abilities.join(', ')}\n`;
                }

                // Inventory
                context += `**Gold:** ${d.gold || 0} | **Silver:** ${d.silver || 0} | **Copper:** ${d.copper || 0}\n`;
                context += `**Potions:** Adrenaline:${d.pot_adrenaline_slider || 0} Antidote:${d.pot_antidote_slider || 0} Poison:${d.pot_poison_slider || 0} Arcane:${d.pot_arcane_slider || 0}\n`;

                // Class-specific data for build prompts
                if (d.class && gameData.classes?.[d.class]) {
                    const cls = gameData.classes[d.class];
                    context += `\n### ${d.class} Class Info\n`;
                    context += `Bonuses: ${cls.bonuses.join(', ')}\n`;
                    context += `Ability type: ${cls.abilityType}\n`;
                    context += `Ability slots: ${cls.startingEquipment?.abilities || 3}\n`;
                }

                // Race data
                if (d.race && gameData.races?.[d.race]) {
                    context += `\n### ${d.race} Race Info\n`;
                    context += `Bonuses: ${gameData.races[d.race].bonuses.join(', ')}\n`;
                }

                // Campaign info
                if (char.campaign) {
                    context += `\n## CAMPAIGN: ${char.campaign.name}\n`;
                    if (char.campaign.dm_name) context += `DM: ${char.campaign.dm_name}\n`;
                }

                // Party
                try {
                    const partyData = await api.getParty(token, characterId);
                    if (partyData.party?.length) {
                        context += `\n## PARTY MEMBERS\n`;
                        partyData.party.forEach(p => {
                            context += `- ${p.name} (${p.player_name})\n`;
                        });
                    }
                } catch (e) {
                    // No party — that's fine
                }

                return {
                    messages: [{
                        role: 'user',
                        content: { type: 'text', text: template.buildPrompt(args, context) }
                    }]
                };
            }
        );
    }

    return server;
}

// ============================
// GAME DATA (loaded once at startup)
// ============================

const gameData = {};
const lorePages = {};

function stripHtml(html) {
    // Remove script/style tags and content
    let text = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
    // Convert headers to markdown
    text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
    text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
    text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
    text = text.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n');
    // Convert list items
    text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    // Convert paragraphs and divs to newlines
    text = text.replace(/<\/?(p|div|br|tr|section)[^>]*>/gi, '\n');
    // Remove all other tags
    text = text.replace(/<[^>]+>/g, '');
    // Decode HTML entities
    text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
    // Collapse multiple newlines
    text = text.replace(/\n{3,}/g, '\n\n').trim();
    return text;
}

async function loadLorePages() {
    const fs = await import('fs');
    const path = await import('path');
    const loreDir = process.env.LORE_DIR || '/lore-pages';
    const files = ['world', 'bestiary', 'lore', 'religion', 'organizations', 'nature', 'artifacts', 'rules'];

    for (const name of files) {
        try {
            const filename = name === 'rules' ? 'index.html' : `${name}.html`;
            const filePath = path.join(loreDir, filename);
            const html = fs.readFileSync(filePath, 'utf-8');
            lorePages[name] = stripHtml(html);
        } catch (err) {
            console.warn(`Could not load lore page ${name}:`, err.message);
        }
    }
    console.log(`Lore pages loaded: ${Object.keys(lorePages).join(', ')}`);
}

async function loadGameData() {
    const fs = await import('fs');
    const path = await import('path');
    const dataDir = process.env.GAME_DATA_DIR || '/game-data';

    // Each entry: [key, filename, variableName to extract]
    const files = [
        ['weapons', 'weapons.js', 'WEAPONS_DATA'],
        ['armor', 'armor.js', 'ARMOR_DATA'],
        ['shields', 'armor.js', 'SHIELD_DATA'],
        ['spells', 'spells.js', 'SPELLS_BY_CLASS'],
        ['races', 'races.js', 'RACES'],
        ['classes', 'classes.js', 'CLASSES'],
        ['religions', 'religions.js', 'RELIGIONS'],
        ['npc_names', 'npc-names.js', 'NPC_NAMES'],
        ['starting_equipment', 'starting-equipment.js', 'STARTING_EQUIPMENT']
    ];

    // Use vm module for sandboxed evaluation of game data files (safer than new Function)
    const vm = await import('vm');

    for (const [key, file, varName] of files) {
        try {
            const filePath = path.join(dataDir, file);
            const content = fs.readFileSync(filePath, 'utf-8');
            // Wrap in a function that returns the variable, run in sandbox
            // This handles const/let declarations that don't leak to sandbox
            const wrapped = `${content};\ntypeof ${varName} !== 'undefined' ? ${varName} : undefined;`;
            const script = new vm.Script(wrapped, { filename: file, timeout: 2000 });
            const result = script.runInNewContext({}, { timeout: 2000 });
            if (result !== undefined) {
                gameData[key] = result;
            } else {
                console.warn(`Could not find ${varName} in ${file}`);
                gameData[key] = { error: `Could not find ${varName} in ${file}` };
            }
        } catch (err) {
            console.warn(`Could not load game data ${file}:`, err.message);
            gameData[key] = { error: err.message };
        }
    }

    // Verify critical game data loaded
    const criticalKeys = ['weapons', 'armor', 'spells', 'races', 'classes'];
    const failed = criticalKeys.filter(k => gameData[k]?.error);
    if (failed.length) {
        console.error(`CRITICAL: Failed to load game data: ${failed.join(', ')}`);
    }
    console.log(`Game data loaded: ${Object.keys(gameData).join(', ')}`);
}

// ============================
// EXPRESS APP + STREAMABLE HTTP
// ============================

const app = express();
// NOTE: Do NOT use express.json() globally — StreamableHTTPServerTransport
// needs to parse the raw body itself. Only apply JSON parsing to non-MCP routes.

// Parse URL-encoded bodies for OAuth endpoints only
import { urlencoded } from 'express';
const parseForm = urlencoded({ extended: false });

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// --- OAuth 2.0 Discovery ---
app.get('/.well-known/oauth-authorization-server', async (req, res) => {
    // When OIDC-only mode and single provider, point directly to Keycloak
    if (AUTH_MODE === 'oidc' && oidcProviders.length === 1) {
        try {
            const discovery = await mcpDiscoverOidc(oidcProviders[0]);
            return res.json({
                issuer: discovery.issuer,
                authorization_endpoint: discovery.authorization_endpoint,
                token_endpoint: discovery.token_endpoint,
                registration_endpoint: `${PUBLIC_URL}/mcp/oauth/register`,
                response_types_supported: ['code'],
                grant_types_supported: ['authorization_code'],
                code_challenge_methods_supported: ['S256'],
                token_endpoint_auth_methods_supported: ['client_secret_post', 'none']
            });
        } catch (err) {
            console.error('OIDC discovery failed, falling back to local OAuth:', err.message);
        }
    }

    // Default: use MCP's own OAuth endpoints (local or both mode)
    res.json({
        issuer: PUBLIC_URL,
        authorization_endpoint: `${PUBLIC_URL}/mcp/oauth/authorize`,
        token_endpoint: `${PUBLIC_URL}/mcp/oauth/token`,
        registration_endpoint: `${PUBLIC_URL}/mcp/oauth/register`,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code'],
        code_challenge_methods_supported: ['S256'],
        token_endpoint_auth_methods_supported: ['client_secret_post', 'none']
    });
});

// --- OAuth 2.0 Dynamic Client Registration (RFC 7591) ---
app.post('/mcp/oauth/register', express.json(), (req, res) => {
    // Accept any client registration — return the client_id they sent or generate one
    const clientId = req.body.client_name || 'mcp-client-' + randomUUID().slice(0, 8);
    res.status(201).json({
        client_id: clientId,
        client_name: req.body.client_name || clientId,
        redirect_uris: req.body.redirect_uris || [],
        grant_types: ['authorization_code'],
        response_types: ['code'],
        token_endpoint_auth_method: 'none'
    });
});

// --- OAuth 2.0 Authorization Endpoint ---
app.get('/mcp/oauth/authorize', async (req, res) => {
    const { client_id, redirect_uri, state, code_challenge, code_challenge_method, response_type } = req.query;

    if (response_type !== 'code') {
        res.status(400).send('Unsupported response_type');
        return;
    }

    // Build OIDC buttons HTML for "both" mode
    let oidcButtonsHtml = '';
    let separatorHtml = '';
    let localFormDisplay = '';

    if (oidcEnabled && oidcProviders.length > 0) {
        const oidcButtons = [];
        for (const provider of oidcProviders) {
            try {
                const discovery = await mcpDiscoverOidc(provider);
                // Generate MCP's own PKCE pair for Keycloak communication
                const pkce = generatePkce();
                const pkceNonce = randomUUID();
                storePkceVerifier(pkceNonce, pkce.verifier);
                const oidcParams = new URLSearchParams({
                    response_type: 'code',
                    client_id: provider.clientId,
                    redirect_uri: `${PUBLIC_URL}/mcp/oauth/oidc-callback`,
                    state: JSON.stringify({ mcp_client_id: client_id, mcp_redirect_uri: redirect_uri, mcp_state: state, mcp_code_challenge: code_challenge, mcp_code_challenge_method: code_challenge_method, provider_id: provider.id, pkce_nonce: pkceNonce }),
                    scope: 'openid profile email',
                    code_challenge: pkce.challenge,
                    code_challenge_method: 'S256'
                });
                oidcButtons.push(`<a href="${escapeHtml(discovery.authorization_endpoint)}?${escapeHtml(oidcParams.toString())}" class="oidc-btn">Sign in with ${escapeHtml(provider.providerName)}</a>`);
            } catch (err) {
                console.error(`MCP OIDC discovery failed for provider ${provider.id}:`, err.message);
            }
        }
        if (oidcButtons.length > 0) {
            oidcButtonsHtml = oidcButtons.join('\n');
            if (localEnabled) {
                separatorHtml = '<div class="separator"><span>or</span></div>';
            } else {
                localFormDisplay = 'style="display:none"';
            }
        }
    }

    if (!localEnabled && !oidcButtonsHtml) {
        res.status(500).send('No authentication method available');
        return;
    }

    // Show login form
    res.send(`<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Aedelore - Connect AI</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0a0a0f; color: #e0e0e0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; }
        .card { background: #14141f; border: 1px solid #2a2a3a; border-radius: 12px; padding: 40px; max-width: 400px; width: 90%; }
        h1 { color: #ffd700; font-size: 1.5rem; margin-bottom: 8px; }
        .subtitle { color: #888; font-size: 0.9rem; margin-bottom: 24px; }
        label { display: block; color: #aaa; font-size: 0.85rem; margin-bottom: 6px; }
        input { width: 100%; padding: 10px 14px; background: #1a1a2e; border: 1px solid #333; border-radius: 8px; color: #fff; font-size: 1rem; margin-bottom: 16px; }
        input:focus { outline: none; border-color: #00bcd4; }
        button { width: 100%; padding: 12px; background: linear-gradient(135deg, #00bcd4, #3b9eff); border: none; border-radius: 8px; color: #000; font-weight: 600; font-size: 1rem; cursor: pointer; }
        button:hover { opacity: 0.9; }
        .error { color: #ef4444; font-size: 0.85rem; margin-bottom: 12px; display: none; }
        .info { color: #00bcd4; font-size: 0.8rem; margin-top: 16px; padding: 12px; background: rgba(0,188,212,0.1); border-radius: 8px; border-left: 3px solid #00bcd4; }
        .oidc-btn { display: block; width: 100%; padding: 12px; background: linear-gradient(135deg, #3b9eff, #00bcd4); border: none; border-radius: 8px; color: #000; font-weight: 600; font-size: 1rem; cursor: pointer; text-align: center; text-decoration: none; margin-bottom: 12px; }
        .oidc-btn:hover { opacity: 0.9; }
        .separator { display: flex; align-items: center; margin: 20px 0; gap: 12px; }
        .separator::before, .separator::after { content: ''; flex: 1; height: 1px; background: #333; }
        .separator span { color: #666; font-size: 0.85rem; }
    </style>
</head>
<body>
    <div class="card">
        <h1>Aedelore</h1>
        <p class="subtitle">Sign in to connect your AI assistant</p>
        ${oidcButtonsHtml}
        ${separatorHtml}
        <div class="error" id="error-msg"></div>
        <form id="login-form" ${localFormDisplay}>
            <input type="hidden" name="client_id" value="${escapeHtml(client_id)}">
            <input type="hidden" name="redirect_uri" value="${escapeHtml(redirect_uri)}">
            <input type="hidden" name="state" value="${escapeHtml(state)}">
            <input type="hidden" name="code_challenge" value="${escapeHtml(code_challenge)}">
            <input type="hidden" name="code_challenge_method" value="${escapeHtml(code_challenge_method)}">
            <label>Username</label>
            <input type="text" name="username" required autocomplete="username">
            <label>Password</label>
            <input type="password" name="password" required autocomplete="current-password">
            <button type="submit">Connect</button>
        </form>
        <div class="info">This will allow your AI assistant to access your campaigns, sessions, and characters on Aedelore.</div>
    </div>
    <script>
        document.getElementById('login-form')?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const form = e.target;
            const errEl = document.getElementById('error-msg');
            errEl.style.display = 'none';
            try {
                const res = await fetch(form.action || window.location.pathname, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams(new FormData(form)).toString(),
                    redirect: 'manual'
                });
                if (res.type === 'opaqueredirect' || res.status === 302 || res.status === 303) {
                    window.location.href = res.headers.get('Location') || '/';
                    return;
                }
                const data = await res.text();
                if (res.ok && data.startsWith('http')) {
                    window.location.href = data;
                } else {
                    errEl.textContent = data || 'Login failed';
                    errEl.style.display = 'block';
                }
            } catch (err) {
                errEl.textContent = 'Connection error';
                errEl.style.display = 'block';
            }
        });
    </script>
</body>
</html>`);
});

// --- OAuth 2.0 Authorization POST (login form submission) ---
app.post('/mcp/oauth/authorize', parseForm, async (req, res) => {
    const { username, password, client_id, redirect_uri, state, code_challenge, code_challenge_method } = req.body;

    if (!username || !password) {
        res.status(400).send('Username and password required');
        return;
    }

    // Rate limit login attempts by IP
    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
    if (!checkOAuthRateLimit(clientIp)) {
        res.status(429).send('Too many login attempts. Try again later.');
        return;
    }

    // Validate redirect_uri host
    if (redirect_uri) {
        try {
            const redirectHost = new URL(redirect_uri).hostname;
            if (!ALLOWED_REDIRECT_HOSTS.some(h => redirectHost === h || redirectHost.endsWith('.' + h))) {
                res.status(400).send('Invalid redirect URI');
                return;
            }
        } catch (e) {
            res.status(400).send('Invalid redirect URI format');
            return;
        }
    }

    // Authenticate via the Aedelore API
    try {
        const loginRes = await fetch(`${process.env.API_URL || 'http://aedelore-proffs-api:3000'}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!loginRes.ok) {
            res.status(401).send('Invalid username or password');
            return;
        }

        const loginData = await loginRes.json();
        const token = loginData.token;

        if (!token) {
            res.status(500).send('Login succeeded but no token received');
            return;
        }

        // Generate authorization code
        const code = randomUUID();
        authCodes.set(code, {
            token,
            redirectUri: redirect_uri,
            clientId: client_id,
            codeChallenge: code_challenge,
            codeChallengeMethod: code_challenge_method,
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 min expiry
        });

        // Redirect back to the client with the code
        const redirectUrl = new URL(redirect_uri);
        redirectUrl.searchParams.set('code', code);
        if (state) redirectUrl.searchParams.set('state', state);

        // Return redirect URL as text (the frontend JS will navigate)
        res.send(redirectUrl.toString());

    } catch (err) {
        console.error('OAuth login error:', err.message);
        res.status(500).send('Authentication service error');
    }
});

// --- OIDC Callback for MCP (Keycloak redirects here) ---
app.get('/mcp/oauth/oidc-callback', async (req, res) => {
    const { code, state: stateStr } = req.query;

    if (!code || !stateStr) {
        res.status(400).send('Missing code or state');
        return;
    }

    let mcpState;
    try {
        mcpState = JSON.parse(stateStr);
    } catch {
        res.status(400).send('Invalid state parameter');
        return;
    }

    const { mcp_client_id, mcp_redirect_uri, mcp_state, mcp_code_challenge, mcp_code_challenge_method, provider_id, pkce_nonce } = mcpState;
    const provider = oidcProviders.find(p => p.id === provider_id);
    if (!provider) {
        res.status(400).send('Unknown OIDC provider');
        return;
    }

    // Retrieve PKCE code_verifier
    const codeVerifier = pkce_nonce ? pkceStore.get(pkce_nonce) : null;
    if (pkce_nonce) pkceStore.delete(pkce_nonce);

    try {
        // Exchange OIDC code for tokens
        const config = await mcpDiscoverOidc(provider);
        const tokenParams = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: `${PUBLIC_URL}/mcp/oauth/oidc-callback`,
            client_id: provider.clientId
        });
        if (codeVerifier) tokenParams.set('code_verifier', codeVerifier);
        if (provider.clientSecret) tokenParams.set('client_secret', provider.clientSecret);

        const tokenRes = await fetch(config.token_endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: tokenParams.toString()
        });

        if (!tokenRes.ok) {
            const err = await tokenRes.text();
            console.error('OIDC token exchange failed:', err);
            res.status(401).send('OIDC authentication failed');
            return;
        }

        const tokens = await tokenRes.json();
        if (!tokens.id_token && !tokens.access_token) {
            res.status(401).send('No token received from OIDC provider');
            return;
        }

        // Validate ID token
        const claims = await mcpValidateJwt(tokens.id_token || tokens.access_token, provider);

        // JIT provision: create/find user via API
        const provisionRes = await fetch(`${process.env.API_URL || 'http://aedelore-proffs-api:3000'}/api/auth/oidc/jit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer internal' },
            body: JSON.stringify({
                sub: claims.sub,
                username: claims.preferred_username || claims.name,
                email: claims.email
            })
        });

        // Get local token - either from API JIT or login directly
        let localToken;
        if (provisionRes.ok) {
            const data = await provisionRes.json();
            localToken = data.token;
            console.log(`OIDC JIT provision successful for ${claims.preferred_username || claims.sub}`);
        } else {
            const errText = await provisionRes.text();
            console.error('OIDC JIT provision failed:', provisionRes.status, errText);
        }

        if (!localToken) {
            // Fallback: use access_token directly (API will validate JWT)
            localToken = tokens.access_token;
            console.log('Using Keycloak access_token as fallback');
        }

        // Generate MCP authorization code (same flow as local login)
        const mcpCode = randomUUID();
        authCodes.set(mcpCode, {
            token: localToken,
            redirectUri: mcp_redirect_uri,
            clientId: mcp_client_id,
            codeChallenge: mcp_code_challenge,
            codeChallengeMethod: mcp_code_challenge_method,
            expiresAt: Date.now() + 5 * 60 * 1000
        });

        // Redirect back to the MCP client with the code
        const redirectUrl = new URL(mcp_redirect_uri);
        redirectUrl.searchParams.set('code', mcpCode);
        if (mcp_state) redirectUrl.searchParams.set('state', mcp_state);

        res.redirect(redirectUrl.toString());
    } catch (err) {
        console.error('MCP OIDC callback error:', err.message);
        res.status(500).send('OIDC authentication failed');
    }
});

// --- OAuth 2.0 Token Endpoint ---
app.post('/mcp/oauth/token', parseForm, async (req, res) => {
    // Also accept JSON body
    let body = req.body;
    if (!body || (!body.grant_type && req.headers['content-type']?.includes('json'))) {
        // Try parsing as JSON manually
        try {
            const chunks = [];
            for await (const chunk of req) chunks.push(chunk);
            body = JSON.parse(Buffer.concat(chunks).toString());
        } catch (e) {
            // keep existing body
        }
    }

    const { grant_type, code, redirect_uri, client_id, code_verifier } = body;

    if (grant_type !== 'authorization_code') {
        res.status(400).json({ error: 'unsupported_grant_type' });
        return;
    }

    const authCode = authCodes.get(code);
    if (!authCode) {
        res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid or expired authorization code' });
        return;
    }

    // Verify code challenge (PKCE) — mandatory
    if (authCode.codeChallenge) {
        if (!code_verifier) {
            authCodes.delete(code);
            res.status(400).json({ error: 'invalid_grant', error_description: 'Code verifier required (PKCE)' });
            return;
        }
        const expected = createHash('sha256')
            .update(code_verifier)
            .digest('base64url');
        if (expected !== authCode.codeChallenge) {
            authCodes.delete(code);
            res.status(400).json({ error: 'invalid_grant', error_description: 'Code verifier mismatch' });
            return;
        }
    } else {
        // No code_challenge was provided during authorization — reject
        authCodes.delete(code);
        res.status(400).json({ error: 'invalid_grant', error_description: 'PKCE required: code_challenge must be provided during authorization' });
        return;
    }

    // Consume the code (one-time use)
    authCodes.delete(code);

    // Return the Aedelore auth token as the access token
    res.json({
        access_token: authCode.token,
        token_type: 'Bearer',
        expires_in: 86400
    });
});

// MCP endpoint — handles POST (messages), GET (SSE stream), DELETE (session close)
app.all('/mcp', async (req, res) => {
    let token = getTokenFromRequest(req);
    if (!token) {
        res.status(401).json({ error: 'Authorization header with Bearer token required' });
        return;
    }

    // Validate token (local or OIDC JWT)
    try {
        const result = await validateMcpToken(token);
        // If OIDC JWT was exchanged for a local token, use that
        if (result.type === 'oidc' && result.token !== token) {
            token = result.token;
        }
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }

    const sessionId = req.headers['mcp-session-id'];

    if (req.method === 'POST') {
        // Check for existing session
        if (sessionId && sessions.has(sessionId)) {
            const session = sessions.get(sessionId);
            // Verify token matches the session creator (prevent session hijacking)
            if (session.token !== token) {
                res.status(403).json({ error: 'Token does not match session owner' });
                return;
            }
            await session.transport.handleRequest(req, res);
            return;
        }

        // Enforce max session count
        if (sessions.size >= MAX_SESSIONS) {
            res.status(503).json({ error: 'Server at capacity. Try again later.' });
            return;
        }

        // New session — create server + transport
        const mcpServer = createMcpServer(token);
        const transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (newSessionId) => {
                sessions.set(newSessionId, { transport, server: mcpServer, token, createdAt: Date.now() });
            }
        });

        transport.onclose = () => {
            const sid = [...sessions.entries()].find(([, v]) => v.transport === transport)?.[0];
            if (sid) sessions.delete(sid);
        };

        await mcpServer.connect(transport);
        await transport.handleRequest(req, res);

    } else if (req.method === 'GET') {
        // SSE stream for server-to-client notifications
        if (!sessionId || !sessions.has(sessionId)) {
            res.status(400).json({ error: 'Invalid or missing session ID' });
            return;
        }
        const session = sessions.get(sessionId);
        if (session.token !== token) {
            res.status(403).json({ error: 'Token does not match session owner' });
            return;
        }
        await session.transport.handleRequest(req, res);

    } else if (req.method === 'DELETE') {
        // Close session
        if (sessionId && sessions.has(sessionId)) {
            const session = sessions.get(sessionId);
            await session.transport.handleRequest(req, res);
            sessions.delete(sessionId);
        } else {
            res.status(404).json({ error: 'Session not found' });
        }

    } else {
        res.status(405).json({ error: 'Method not allowed' });
    }
});

// ============================
// START
// ============================

await loadGameData();
await loadLorePages();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Aedelore MCP server running on port ${PORT}`);
});
