const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();
const db = require('../db');
const { sendPasswordResetEmail } = require('../email');
const { generateToken, generateResetToken, validateUsername, validatePassword, validateEmail } = require('../helpers');
const { authLimiter, passwordResetLimiter, authenticate, isAccountLocked, recordFailedAttempt, clearLoginAttempts } = require('../middleware/auth');
const oidc = require('../middleware/oidc');
const { loggers } = require('../logger');

const log = loggers.auth;

const SALT_ROUNDS = 10;

// Auth cookie settings
const AUTH_COOKIE_NAME = 'auth_token';
const AUTH_COOKIE_OPTIONS = {
    httpOnly: true,           // Not accessible via JavaScript (XSS protection)
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    sameSite: 'lax',          // 'lax' protects CSRF while allowing normal navigation
    maxAge: 24 * 60 * 60 * 1000,  // 24 hours
    path: '/'
};

// Metrics reference (will be set by server.js)
let metrics = null;
let writeMetricsFile = null;

function setMetrics(m, writeFn) {
    metrics = m;
    writeMetricsFile = writeFn;
}

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password, email]
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 30
 *               password:
 *                 type: string
 *                 minLength: 8
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       200:
 *         description: Registration successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 token: { type: string }
 *                 userId: { type: integer }
 *       400:
 *         description: Validation error
 */
router.post('/register', authLimiter, async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        return res.status(400).json({ error: 'Username, password, and email required' });
    }

    if (!validateUsername(username)) {
        return res.status(400).json({ error: 'Username must be 3-30 characters (letters, numbers, underscores only)' });
    }

    if (!validatePassword(password)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters with letters and numbers' });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    try {
        const existing = await db.get('SELECT id FROM users WHERE username = $1', [username]);
        if (existing) {
            return res.status(400).json({ error: 'Registration failed. Please try different credentials.' });
        }

        const existingEmail = await db.get('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existingEmail) {
            return res.status(400).json({ error: 'Registration failed. Please try different credentials.' });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
        const result = await db.get(
            'INSERT INTO users (username, password_hash, email) VALUES ($1, $2, $3) RETURNING id',
            [username, passwordHash, email.toLowerCase()]
        );

        const token = generateToken();
        await db.query(
            'INSERT INTO auth_tokens (token, user_id) VALUES ($1, $2)',
            [token, result.id]
        );

        if (metrics) {
            metrics.auth.registrations++;
            writeMetricsFile?.();
        }

        // Set httpOnly cookie for auth token
        res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

        res.json({ success: true, token, userId: result.id });
    } catch (error) {
        log.error({ err: error }, 'Register error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login with username and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username: { type: string }
 *               password: { type: string }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 token: { type: string }
 *                 userId: { type: integer }
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Account locked (too many failed attempts)
 */
router.post('/login', authLimiter, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    if (await isAccountLocked(username)) {
        return res.status(429).json({ error: 'Account temporarily locked. Please try again later.' });
    }

    try {
        const user = await db.get('SELECT id, password_hash FROM users WHERE username = $1', [username]);
        if (!user) {
            await recordFailedAttempt(username);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            await recordFailedAttempt(username);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        await clearLoginAttempts(username);

        // Log login history
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
        const userAgent = req.headers['user-agent'] || null;
        await db.query(
            'INSERT INTO login_history (user_id, ip_address, user_agent) VALUES ($1, $2, $3)',
            [user.id, ip, userAgent]
        );

        const token = generateToken();
        await db.query(
            'INSERT INTO auth_tokens (token, user_id) VALUES ($1, $2)',
            [token, user.id]
        );

        if (metrics) {
            metrics.auth.logins++;
            writeMetricsFile?.();
        }

        // Set httpOnly cookie for auth token
        res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

        res.json({ success: true, token, userId: user.id });
    } catch (error) {
        log.error({ err: error }, 'Login error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Logout current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', authenticate, async (req, res) => {
    // Get token from header or cookie
    const token = req.headers.authorization?.replace('Bearer ', '') || req.cookies?.[AUTH_COOKIE_NAME];
    try {
        if (token) {
            await db.query('DELETE FROM auth_tokens WHERE token = $1', [token]);
        }
    } catch (e) {
        // Ignore errors, token may already be deleted
    }
    if (metrics) {
        metrics.auth.logouts++;
        writeMetricsFile?.();
    }

    // Clear the auth cookie
    res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });

    res.json({ success: true });
});

/**
 * @swagger
 * /me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user: { $ref: '#/components/schemas/User' }
 *                 characters: { type: array }
 *                 campaigns: { type: array }
 *       401:
 *         description: Unauthorized
 */
router.get('/me', authenticate, async (req, res) => {
    try {
        const userId = req.userId;

        const userResult = await db.query('SELECT username, email, created_at FROM users WHERE id = $1', [userId]);
        if (!userResult.rows.length) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = userResult.rows[0];

        const campaignsResult = await db.query(`
            SELECT c.id, c.name, c.description, c.created_at,
                   (SELECT COUNT(*) FROM sessions WHERE campaign_id = c.id AND deleted_at IS NULL) as session_count
            FROM campaigns c
            WHERE c.user_id = $1 AND c.deleted_at IS NULL
            ORDER BY c.updated_at DESC
        `, [userId]);

        const charactersResult = await db.query(`
            SELECT id, name, updated_at
            FROM characters
            WHERE user_id = $1 AND deleted_at IS NULL
            ORDER BY updated_at DESC
        `, [userId]);

        const sessionsResult = await db.query(`
            SELECT COUNT(*) as total
            FROM sessions s
            JOIN campaigns c ON s.campaign_id = c.id
            WHERE c.user_id = $1 AND s.deleted_at IS NULL AND c.deleted_at IS NULL
        `, [userId]);

        res.json({
            id: userId,
            username: user.username,
            email: user.email || null,
            createdAt: user.created_at,
            stats: {
                campaigns: campaignsResult.rows.length,
                sessions: parseInt(sessionsResult.rows[0].total) || 0,
                characters: charactersResult.rows.length
            },
            campaigns: campaignsResult.rows,
            characters: charactersResult.rows.map(c => ({
                id: c.id,
                name: c.name || 'Unnamed Character',
                updatedAt: c.updated_at
            }))
        });
    } catch (error) {
        log.error({ err: error }, 'Get profile error');
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/account/password
router.put('/account/password', authenticate, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new password required' });
    }

    if (!validatePassword(newPassword)) {
        return res.status(400).json({ error: 'New password must be at least 8 characters with letters and numbers' });
    }

    try {
        const user = await db.get('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const newHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.userId]);

        res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
        log.error({ err: error }, 'Change password error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/account/email
router.put('/account/email', authenticate, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    try {
        const user = await db.get('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        const existingEmail = await db.get('SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase(), req.userId]);
        if (existingEmail) {
            return res.status(400).json({ error: 'This email is already in use' });
        }

        await db.query('UPDATE users SET email = $1 WHERE id = $2', [email.toLowerCase(), req.userId]);

        res.json({ success: true, message: 'Email updated successfully' });
    } catch (error) {
        log.error({ err: error }, 'Update email error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/forgot-password
router.post('/forgot-password', passwordResetLimiter, async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email required' });
    }

    const genericResponse = { success: true, message: 'If an account with this email exists, a reset link has been sent.' };

    try {
        const user = await db.get('SELECT id, username, email FROM users WHERE email = $1', [email.toLowerCase()]);

        if (!user) {
            return res.json(genericResponse);
        }

        await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);

        const token = generateResetToken();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await db.query(
            'INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
            [token, user.id, expiresAt]
        );

        const emailSent = await sendPasswordResetEmail(user.email, token, user.username);

        if (!emailSent) {
            log.error({ email: user.email }, 'Failed to send password reset email');
        }

        res.json(genericResponse);
    } catch (error) {
        log.error({ err: error }, 'Forgot password error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/reset-password/validate
router.get('/reset-password/validate', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: 'Token required', valid: false });
    }

    try {
        const resetToken = await db.get(
            'SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = $1',
            [token]
        );

        if (!resetToken) {
            return res.json({ valid: false, error: 'Invalid or expired reset link' });
        }

        if (resetToken.used) {
            return res.json({ valid: false, error: 'This reset link has already been used' });
        }

        if (new Date(resetToken.expires_at) < new Date()) {
            return res.json({ valid: false, error: 'This reset link has expired' });
        }

        res.json({ valid: true });
    } catch (error) {
        log.error({ err: error }, 'Validate reset token error');
        res.status(500).json({ error: 'Server error', valid: false });
    }
});

// POST /api/reset-password
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'Token and new password required' });
    }

    if (!validatePassword(newPassword)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters with letters and numbers' });
    }

    try {
        const resetToken = await db.get(
            'SELECT user_id, expires_at, used FROM password_reset_tokens WHERE token = $1',
            [token]
        );

        if (!resetToken) {
            return res.status(400).json({ error: 'Invalid or expired reset link' });
        }

        if (resetToken.used) {
            return res.status(400).json({ error: 'This reset link has already been used' });
        }

        if (new Date(resetToken.expires_at) < new Date()) {
            return res.status(400).json({ error: 'This reset link has expired' });
        }

        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, resetToken.user_id]);
        await db.query('UPDATE password_reset_tokens SET used = TRUE WHERE token = $1', [token]);
        await db.query('DELETE FROM auth_tokens WHERE user_id = $1', [resetToken.user_id]);
        await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1 AND token != $2', [resetToken.user_id, token]);

        res.json({ success: true, message: 'Password reset successfully. Please log in with your new password.' });
    } catch (error) {
        log.error({ err: error }, 'Reset password error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/account
router.delete('/account', authenticate, async (req, res) => {
    const { password } = req.body;

    if (!password) {
        return res.status(400).json({ error: 'Password required to delete account' });
    }

    try {
        const user = await db.get('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Soft delete all user data
        await db.query('UPDATE characters SET deleted_at = NOW() WHERE user_id = $1', [req.userId]);
        await db.query('UPDATE sessions SET deleted_at = NOW() WHERE user_id = $1', [req.userId]);
        await db.query('UPDATE campaigns SET deleted_at = NOW() WHERE user_id = $1', [req.userId]);

        // Delete auth tokens
        await db.query('DELETE FROM auth_tokens WHERE user_id = $1', [req.userId]);

        // Delete the user
        await db.query('DELETE FROM users WHERE id = $1', [req.userId]);

        if (metrics) {
            metrics.auth.deletedAccounts++;
            writeMetricsFile?.();
        }

        res.json({ success: true, message: 'Account deleted' });
    } catch (error) {
        log.error({ err: error }, 'Delete account error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// OIDC Endpoints
// ============================================

// GET /api/auth/oidc/config — public endpoint, returns OIDC config for frontend
router.get('/auth/oidc/config', async (req, res) => {
    if (!oidc.isOidcEnabled()) {
        return res.json({ enabled: false, providers: [] });
    }

    const providers = oidc.loadProviders();
    const configs = [];

    for (const provider of providers) {
        try {
            const discovery = await oidc.discoverOidc(provider);
            configs.push({
                id: provider.id,
                providerName: provider.providerName,
                authorizationEndpoint: discovery.authorization_endpoint,
                clientId: provider.clientId
            });
        } catch (err) {
            log.error({ err, providerId: provider.id }, 'Failed to discover OIDC provider');
        }
    }

    res.json({
        enabled: true,
        localEnabled: oidc.isLocalEnabled(),
        providers: configs,
        callbackUrl: process.env.OIDC_CALLBACK_URL || `${process.env.APP_URL || 'https://aedelore.nu'}/character-sheet`
    });
});

// POST /api/auth/oidc/callback — exchange code for tokens, JIT provision, return local session
router.post('/auth/oidc/callback', authLimiter, async (req, res) => {
    const { code, codeVerifier, redirectUri, providerId } = req.body;

    if (!code || !codeVerifier || !redirectUri || !providerId) {
        return res.status(400).json({ error: 'Missing required fields: code, codeVerifier, redirectUri, providerId' });
    }

    if (!oidc.isOidcEnabled()) {
        return res.status(400).json({ error: 'OIDC authentication is not enabled' });
    }

    const provider = oidc.getProvider(providerId);
    if (!provider) {
        return res.status(400).json({ error: 'Unknown OIDC provider' });
    }

    try {
        // Exchange authorization code for tokens
        const tokens = await oidc.exchangeCodeForTokens(code, redirectUri, codeVerifier, provider);

        if (!tokens.id_token) {
            return res.status(400).json({ error: 'No ID token received from provider' });
        }

        // Validate the ID token
        const claims = await oidc.validateIdToken(tokens.id_token, provider);

        const sub = claims.sub;
        const username = claims.preferred_username || claims.name || null;
        const email = claims.email || null;

        if (!sub) {
            return res.status(400).json({ error: 'No subject claim in ID token' });
        }

        // JIT provisioning: find or create local user
        const user = await oidc.findOrCreateUser(sub, username, email, provider.id);

        // Log login history
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip;
        const userAgent = req.headers['user-agent'] || null;
        await db.query(
            'INSERT INTO login_history (user_id, ip_address, user_agent) VALUES ($1, $2, $3)',
            [user.id, ip, userAgent]
        );

        // Create local session token (same system as regular login)
        const token = generateToken();
        await db.query(
            'INSERT INTO auth_tokens (token, user_id) VALUES ($1, $2)',
            [token, user.id]
        );

        if (metrics) {
            metrics.auth.logins++;
            writeMetricsFile?.();
        }

        // Set httpOnly cookie
        res.cookie(AUTH_COOKIE_NAME, token, AUTH_COOKIE_OPTIONS);

        res.json({
            success: true,
            token,
            userId: user.id,
            username: user.username
        });
    } catch (err) {
        log.error({ err, providerId }, 'OIDC callback error');
        return res.status(401).json({ error: 'OIDC authentication failed' });
    }
});

// POST /api/auth/oidc/jit — internal endpoint for MCP to JIT provision users
// Accepts sub, username, email from a validated JWT and returns a local token
router.post('/auth/oidc/jit', async (req, res) => {
    const { sub, username, email } = req.body;

    if (!sub) {
        return res.status(400).json({ error: 'Subject (sub) required' });
    }

    if (!oidc.isOidcEnabled()) {
        return res.status(400).json({ error: 'OIDC not enabled' });
    }

    try {
        const user = await oidc.findOrCreateUser(sub, username, email);

        const token = generateToken();
        await db.query(
            'INSERT INTO auth_tokens (token, user_id) VALUES ($1, $2)',
            [token, user.id]
        );

        if (metrics) {
            metrics.auth.logins++;
            writeMetricsFile?.();
        }

        res.json({ success: true, token, userId: user.id, username: user.username });
    } catch (err) {
        log.error({ err }, 'OIDC JIT provisioning error');
        res.status(500).json({ error: 'JIT provisioning failed' });
    }
});

module.exports = router;
module.exports.setMetrics = setMetrics;
