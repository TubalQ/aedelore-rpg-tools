const crypto = require('crypto');
const db = require('../db');
const { generateToken } = require('../helpers');
const { loggers } = require('../logger');

const log = loggers.auth;

// --- Provider loading ---

function loadProviders() {
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

function getAuthMode() {
    return process.env.AUTH_MODE || 'local';
}

function isOidcEnabled() {
    const mode = getAuthMode();
    return mode === 'oidc' || mode === 'both';
}

function isLocalEnabled() {
    const mode = getAuthMode();
    return mode === 'local' || mode === 'both';
}

// --- OIDC Discovery cache ---
// Map<issuerUrl, { data, expiresAt }>
const discoveryCache = new Map();

async function discoverOidc(provider) {
    const cached = discoveryCache.get(provider.issuerUrl);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.data;
    }

    const url = `${provider.issuerUrl}/.well-known/openid-configuration`;
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`OIDC discovery failed for ${provider.issuerUrl}: ${res.status}`);
    }
    const data = await res.json();
    discoveryCache.set(provider.issuerUrl, {
        data,
        expiresAt: Date.now() + 60 * 60 * 1000 // 1h cache
    });
    return data;
}

// --- JWKS cache ---
// Map<jwksUri, { keys, expiresAt }>
const jwksCache = new Map();

async function getJwks(jwksUri) {
    const cached = jwksCache.get(jwksUri);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.keys;
    }

    const res = await fetch(jwksUri);
    if (!res.ok) {
        throw new Error(`JWKS fetch failed: ${res.status}`);
    }
    const data = await res.json();
    jwksCache.set(jwksUri, {
        keys: data.keys,
        expiresAt: Date.now() + 60 * 60 * 1000 // 1h cache
    });
    return data.keys;
}

// --- JWT validation ---

function base64urlDecode(str) {
    const padded = str + '='.repeat((4 - str.length % 4) % 4);
    return Buffer.from(padded, 'base64url');
}

function decodeJwtParts(token) {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('Invalid JWT format');
    return {
        header: JSON.parse(base64urlDecode(parts[0]).toString()),
        payload: JSON.parse(base64urlDecode(parts[1]).toString()),
        signatureInput: parts[0] + '.' + parts[1],
        signature: base64urlDecode(parts[2])
    };
}

function jwkToPublicKey(jwk) {
    if (jwk.kty === 'RSA') {
        return crypto.createPublicKey({ key: jwk, format: 'jwk' });
    } else if (jwk.kty === 'EC') {
        return crypto.createPublicKey({ key: jwk, format: 'jwk' });
    }
    throw new Error(`Unsupported key type: ${jwk.kty}`);
}

function algToNodeAlg(alg) {
    const map = {
        RS256: 'RSA-SHA256',
        RS384: 'RSA-SHA384',
        RS512: 'RSA-SHA512',
        ES256: 'SHA256',
        ES384: 'SHA384',
        ES512: 'SHA512'
    };
    return map[alg];
}

async function validateIdToken(idToken, provider) {
    const { header, payload, signatureInput, signature } = decodeJwtParts(idToken);

    // Get discovery config
    const config = await discoverOidc(provider);

    // Validate issuer
    if (payload.iss !== provider.issuerUrl && payload.iss !== config.issuer) {
        throw new Error(`Invalid issuer: ${payload.iss}`);
    }

    // Validate audience
    const aud = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
    if (!aud.includes(provider.clientId)) {
        throw new Error(`Invalid audience: ${payload.aud}`);
    }

    // Validate expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
    }

    // Verify signature
    const keys = await getJwks(config.jwks_uri);
    const key = header.kid ? keys.find(k => k.kid === header.kid) : keys[0];
    if (!key) {
        throw new Error('No matching key found in JWKS');
    }

    const nodeAlg = algToNodeAlg(header.alg);
    if (!nodeAlg) {
        throw new Error(`Unsupported algorithm: ${header.alg}`);
    }

    const publicKey = jwkToPublicKey(key);
    const isValid = crypto.createVerify(nodeAlg)
        .update(signatureInput)
        .verify(publicKey, signature);

    if (!isValid) {
        throw new Error('Invalid JWT signature');
    }

    return payload;
}

// --- Code exchange ---

async function exchangeCodeForTokens(code, redirectUri, codeVerifier, provider) {
    const config = await discoverOidc(provider);

    const params = new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: provider.clientId,
        code_verifier: codeVerifier
    });

    if (provider.clientSecret) {
        params.set('client_secret', provider.clientSecret);
    }

    const res = await fetch(config.token_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString()
    });

    if (!res.ok) {
        const err = await res.text();
        throw new Error(`Token exchange failed: ${res.status} ${err}`);
    }

    return await res.json();
}

// --- JIT User Provisioning ---

async function findOrCreateUser(sub, username, email, providerId) {
    // 1. Try to find by oidc_sub
    const existing = await db.get('SELECT id, username FROM users WHERE oidc_sub = $1', [sub]);
    if (existing) {
        return existing;
    }

    // 2. Auto-link: match by username
    if (username) {
        const byUsername = await db.get('SELECT id, username FROM users WHERE username = $1 AND oidc_sub IS NULL', [username]);
        if (byUsername) {
            await db.query('UPDATE users SET oidc_sub = $1 WHERE id = $2', [sub, byUsername.id]);
            log.info({ userId: byUsername.id, sub, username }, 'OIDC: linked existing user');
            return byUsername;
        }
    }

    // 3. Auto-link: match by email
    if (email) {
        const byEmail = await db.get('SELECT id, username FROM users WHERE email = $1 AND oidc_sub IS NULL', [email.toLowerCase()]);
        if (byEmail) {
            await db.query('UPDATE users SET oidc_sub = $1 WHERE id = $2', [sub, byEmail.id]);
            log.info({ userId: byEmail.id, sub, email }, 'OIDC: linked existing user by email');
            return byEmail;
        }
    }

    // 4. Create new user (no password — OIDC-only user)
    // Generate a unique username if the preferred one is taken
    let finalUsername = username || `oidc_${sub.substring(0, 8)}`;
    const usernameTaken = await db.get('SELECT id FROM users WHERE username = $1', [finalUsername]);
    if (usernameTaken) {
        finalUsername = `${finalUsername}_${crypto.randomBytes(3).toString('hex')}`;
    }

    // OIDC-only users get a random unusable password hash
    const randomHash = '$2b$10$' + crypto.randomBytes(30).toString('base64').substring(0, 53);

    const result = await db.get(
        'INSERT INTO users (username, password_hash, email, oidc_sub) VALUES ($1, $2, $3, $4) RETURNING id, username',
        [finalUsername, randomHash, email ? email.toLowerCase() : null, sub]
    );

    log.info({ userId: result.id, sub, username: finalUsername }, 'OIDC: created new user (JIT)');
    return result;
}

// --- Find provider by ID ---

function getProvider(providerId) {
    const providers = loadProviders();
    return providers.find(p => p.id === providerId);
}

module.exports = {
    loadProviders,
    getAuthMode,
    isOidcEnabled,
    isLocalEnabled,
    discoverOidc,
    getJwks,
    validateIdToken,
    exchangeCodeForTokens,
    findOrCreateUser,
    getProvider,
    decodeJwtParts
};
