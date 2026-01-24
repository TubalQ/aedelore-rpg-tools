const express = require('express');
const bcrypt = require('bcrypt');
const cors = require('cors');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const os = require('os');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const db = require('./db');
const { sendPasswordResetEmail, isEmailConfigured } = require('./email');

const app = express();
const PORT = 3000;
const SALT_ROUNDS = 10;
const METRICS_FILE = path.join(__dirname, 'data', 'metrics.txt');
const METRICS_JSON = path.join(__dirname, 'data', 'metrics.json');

// Security: Token expiration (24 hours)
const TOKEN_EXPIRY = 24 * 60 * 60 * 1000;

// Security: Account lockout settings
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const loginAttempts = new Map();

// Security: Add helmet for security headers
app.use(helmet());

// Trust nginx proxy
app.set('trust proxy', 1);

// Security: CORS - explicit origin required, no fallback to allow all
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'https://aedelore.nu',
    credentials: true
}));

app.use(express.json({ limit: '1mb' }));

// Rate limiting
const generalLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please slow down' },
    standardHeaders: true,
    legacyHeaders: false
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    message: { error: 'Too many authentication attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting for password reset (3 requests per hour per IP)
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { error: 'Too many password reset attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

// Rate limiting for error logging (30 errors per minute per IP)
const errorLogLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: { error: 'Too many error reports' },
    standardHeaders: true,
    legacyHeaders: false
});

app.use(generalLimiter);

// Token storage: Now using PostgreSQL auth_tokens table for persistence
// Cleanup expired tokens periodically
async function cleanupExpiredTokens() {
    try {
        await db.query(
            "DELETE FROM auth_tokens WHERE created_at < NOW() - INTERVAL '24 hours'"
        );
    } catch (e) {
        console.error('Token cleanup error:', e.message);
    }
}

// Run cleanup every hour
setInterval(cleanupExpiredTokens, 60 * 60 * 1000);

// ============================================
// Metrics System
// ============================================

const metrics = {
    startTime: Date.now(),
    requests: { total: 0, byEndpoint: {}, byMethod: {} },
    auth: { logins: 0, registrations: 0, logouts: 0, deletedAccounts: 0 },
    characters: { saves: 0, loads: 0, deletes: 0 },
    sessions: { saves: 0, loads: 0, deletes: 0, locks: 0 },
    frontendErrors: { total: 0, byType: {}, byPage: {} },
    errors: 0
};

try {
    if (fs.existsSync(METRICS_JSON)) {
        const saved = JSON.parse(fs.readFileSync(METRICS_JSON, 'utf8'));
        Object.assign(metrics.requests, saved.requests || {});
        Object.assign(metrics.auth, saved.auth || {});
        Object.assign(metrics.characters, saved.characters || {});
        Object.assign(metrics.frontendErrors, saved.frontendErrors || { total: 0, byType: {}, byPage: {} });
        metrics.errors = saved.errors || 0;
    }
} catch (e) {
    console.log('Starting with fresh metrics');
}

app.use((req, res, next) => {
    metrics.requests.total++;
    metrics.requests.byEndpoint[req.path] = (metrics.requests.byEndpoint[req.path] || 0) + 1;
    metrics.requests.byMethod[req.method] = (metrics.requests.byMethod[req.method] || 0) + 1;
    next();
});

function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}

function formatUptime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ${hours % 24}h ${minutes % 60}m`;
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
}

async function getDbStats() {
    try {
        const userCount = await db.get('SELECT COUNT(*) as count FROM users');
        const charCount = await db.get('SELECT COUNT(*) as count FROM characters');
        const recentUsers = await db.get("SELECT COUNT(*) as count FROM users WHERE created_at > NOW() - INTERVAL '24 hours'");
        const activeSessions = await db.get("SELECT COUNT(*) as count FROM auth_tokens WHERE created_at > NOW() - INTERVAL '24 hours'");
        return {
            userCount: userCount?.count || 0,
            charCount: charCount?.count || 0,
            recentUsers: recentUsers?.count || 0,
            activeSessions: activeSessions?.count || 0
        };
    } catch (e) {
        return { userCount: 0, charCount: 0, recentUsers: 0, activeSessions: 0 };
    }
}

async function writeMetricsFile() {
    const now = new Date();
    const uptime = Date.now() - metrics.startTime;
    const memUsage = process.memoryUsage();
    const dbStats = await getDbStats();

    const report = `
╔══════════════════════════════════════════════════════════════╗
║                    AEDELORE API METRICS                       ║
║                   ${now.toISOString()}                   ║
╚══════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────┐
│  SERVER HEALTH                                               │
├─────────────────────────────────────────────────────────────┤
│  Status:          ✅ ONLINE                                  │
│  Database:        🐘 PostgreSQL                              │
│  Uptime:          ${formatUptime(uptime).padEnd(41)}│
│  Node Version:    ${process.version.padEnd(41)}│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  DATABASE STATS                                              │
├─────────────────────────────────────────────────────────────┤
│  Registered Users:     ${String(dbStats.userCount).padEnd(36)}│
│  Saved Characters:     ${String(dbStats.charCount).padEnd(36)}│
│  New Users (24h):      ${String(dbStats.recentUsers).padEnd(36)}│
│  Active Sessions:      ${String(dbStats.activeSessions).padEnd(36)}│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  REQUEST STATS                                               │
├─────────────────────────────────────────────────────────────┤
│  Total Requests:       ${String(metrics.requests.total).padEnd(36)}│
│  GET Requests:         ${String(metrics.requests.byMethod.GET || 0).padEnd(36)}│
│  POST Requests:        ${String(metrics.requests.byMethod.POST || 0).padEnd(36)}│
│  PUT Requests:         ${String(metrics.requests.byMethod.PUT || 0).padEnd(36)}│
│  DELETE Requests:      ${String(metrics.requests.byMethod.DELETE || 0).padEnd(36)}│
│  API Errors:           ${String(metrics.errors).padEnd(36)}│
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  FRONTEND ERRORS                                             │
├─────────────────────────────────────────────────────────────┤
│  Total Logged:         ${String(metrics.frontendErrors.total).padEnd(36)}│
│  - unhandled:          ${String(metrics.frontendErrors.byType.unhandled || 0).padEnd(36)}│
│  - promise:            ${String(metrics.frontendErrors.byType.promise || 0).padEnd(36)}│
│  - fetch:              ${String(metrics.frontendErrors.byType.fetch || 0).padEnd(36)}│
│  - manual:             ${String(metrics.frontendErrors.byType.manual || 0).padEnd(36)}│
└─────────────────────────────────────────────────────────────┘

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Last updated: ${now.toLocaleString('sv-SE')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`;

    fs.writeFileSync(METRICS_FILE, report);
    fs.writeFileSync(METRICS_JSON, JSON.stringify(metrics, null, 2));
}

setInterval(writeMetricsFile, 30000);

// ============================================
// Security Helpers
// ============================================

function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

function validateUsername(username) {
    return /^[a-zA-Z0-9_]{3,30}$/.test(username);
}

function validatePassword(password) {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

function validateEmail(email) {
    // Basic email validation
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

function isAccountLocked(username) {
    const attempts = loginAttempts.get(username);
    if (!attempts) return false;
    if (Date.now() - attempts.lastAttempt > LOCKOUT_DURATION) {
        loginAttempts.delete(username);
        return false;
    }
    return attempts.count >= MAX_LOGIN_ATTEMPTS;
}

function recordFailedAttempt(username) {
    const attempts = loginAttempts.get(username) || { count: 0, lastAttempt: 0 };
    attempts.count++;
    attempts.lastAttempt = Date.now();
    loginAttempts.set(username, attempts);
}

function clearLoginAttempts(username) {
    loginAttempts.delete(username);
}

async function authenticate(req, res, next) {
    // Support token from header (normal requests) or query param (sendBeacon for mobile)
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query.token;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const session = await db.get(
            "SELECT user_id, created_at FROM auth_tokens WHERE token = $1 AND created_at > NOW() - INTERVAL '24 hours'",
            [token]
        );

        if (!session) {
            // Clean up expired token if it exists
            await db.query('DELETE FROM auth_tokens WHERE token = $1', [token]);
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.userId = session.user_id;
        next();
    } catch (error) {
        console.error('Auth error:', error.message);
        return res.status(500).json({ error: 'Server error' });
    }
}

// ============================================
// Auth Endpoints
// ============================================

app.post('/api/register', authLimiter, async (req, res) => {
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

        // Check if email is already in use
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

        metrics.auth.registrations++;
        writeMetricsFile();

        res.json({ success: true, token, userId: result.id });
    } catch (error) {
        console.error('Register error:', error.message);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/login', authLimiter, async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    if (isAccountLocked(username)) {
        return res.status(429).json({ error: 'Account temporarily locked. Please try again later.' });
    }

    try {
        const user = await db.get('SELECT id, password_hash FROM users WHERE username = $1', [username]);
        if (!user) {
            recordFailedAttempt(username);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            recordFailedAttempt(username);
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        clearLoginAttempts(username);

        const token = generateToken();
        await db.query(
            'INSERT INTO auth_tokens (token, user_id) VALUES ($1, $2)',
            [token, user.id]
        );

        metrics.auth.logins++;
        writeMetricsFile();

        res.json({ success: true, token, userId: user.id });
    } catch (error) {
        console.error('Login error:', error.message);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/logout', authenticate, async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    try {
        await db.query('DELETE FROM auth_tokens WHERE token = $1', [token]);
    } catch (e) {
        // Ignore errors, token may already be deleted
    }
    metrics.auth.logouts++;
    writeMetricsFile();
    res.json({ success: true });
});

// Get user profile/data
app.get('/api/me', authenticate, async (req, res) => {
    try {
        const userId = req.userId;

        // Get user info
        const userResult = await db.query('SELECT username, email, created_at FROM users WHERE id = $1', [userId]);
        if (!userResult.rows.length) {
            return res.status(404).json({ error: 'User not found' });
        }
        const user = userResult.rows[0];

        // Get campaigns count and list
        const campaignsResult = await db.query(`
            SELECT c.id, c.name, c.description, c.created_at,
                   (SELECT COUNT(*) FROM sessions WHERE campaign_id = c.id AND deleted_at IS NULL) as session_count
            FROM campaigns c
            WHERE c.user_id = $1 AND c.deleted_at IS NULL
            ORDER BY c.updated_at DESC
        `, [userId]);

        // Get characters count and list
        const charactersResult = await db.query(`
            SELECT id, name, updated_at
            FROM characters
            WHERE user_id = $1 AND deleted_at IS NULL
            ORDER BY updated_at DESC
        `, [userId]);

        // Get total sessions count
        const sessionsResult = await db.query(`
            SELECT COUNT(*) as total
            FROM sessions s
            JOIN campaigns c ON s.campaign_id = c.id
            WHERE c.user_id = $1 AND s.deleted_at IS NULL AND c.deleted_at IS NULL
        `, [userId]);

        res.json({
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
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Change password
app.put('/api/account/password', authenticate, async (req, res) => {
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
        console.error('Change password error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// Password Reset Endpoints
// ============================================

// Request password reset (forgot password)
app.post('/api/forgot-password', passwordResetLimiter, async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'Email required' });
    }

    // Always return same response to prevent email enumeration
    const genericResponse = { success: true, message: 'If an account with this email exists, a reset link has been sent.' };

    try {
        // Find user by email
        const user = await db.get('SELECT id, username, email FROM users WHERE email = $1', [email.toLowerCase()]);

        if (!user) {
            // Return success even if email not found (prevent enumeration)
            return res.json(genericResponse);
        }

        // Delete any existing unused tokens for this user
        await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1', [user.id]);

        // Generate new token
        const token = generateResetToken();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        // Store token
        await db.query(
            'INSERT INTO password_reset_tokens (token, user_id, expires_at) VALUES ($1, $2, $3)',
            [token, user.id, expiresAt]
        );

        // Send email
        const emailSent = await sendPasswordResetEmail(user.email, token, user.username);

        if (!emailSent) {
            console.error('Failed to send password reset email to:', user.email);
            // Still return success to prevent enumeration
        }

        res.json(genericResponse);
    } catch (error) {
        console.error('Forgot password error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// Validate reset token
app.get('/api/reset-password/validate', async (req, res) => {
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
        console.error('Validate reset token error:', error);
        res.status(500).json({ error: 'Server error', valid: false });
    }
});

// Reset password with token
app.post('/api/reset-password', async (req, res) => {
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

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        // Update password
        await db.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, resetToken.user_id]);

        // Mark token as used
        await db.query('UPDATE password_reset_tokens SET used = TRUE WHERE token = $1', [token]);

        // Invalidate all existing auth tokens for this user (security: log out all sessions)
        await db.query('DELETE FROM auth_tokens WHERE user_id = $1', [resetToken.user_id]);

        // Delete all reset tokens for this user
        await db.query('DELETE FROM password_reset_tokens WHERE user_id = $1 AND token != $2', [resetToken.user_id, token]);

        res.json({ success: true, message: 'Password reset successfully. Please log in with your new password.' });
    } catch (error) {
        console.error('Reset password error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// Add/change email (requires password confirmation)
app.put('/api/account/email', authenticate, async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password required' });
    }

    if (!validateEmail(email)) {
        return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    try {
        // Verify password
        const user = await db.get('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        // Check if email is already in use by another user
        const existingEmail = await db.get('SELECT id FROM users WHERE email = $1 AND id != $2', [email.toLowerCase(), req.userId]);
        if (existingEmail) {
            return res.status(400).json({ error: 'This email is already in use' });
        }

        // Update email
        await db.query('UPDATE users SET email = $1 WHERE id = $2', [email.toLowerCase(), req.userId]);

        res.json({ success: true, message: 'Email updated successfully' });
    } catch (error) {
        console.error('Update email error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// Character Endpoints
// ============================================

app.get('/api/characters', authenticate, async (req, res) => {
    try {
        const characters = await db.all(
            'SELECT id, name, system, updated_at FROM characters WHERE user_id = $1 AND deleted_at IS NULL ORDER BY updated_at DESC',
            [req.userId]
        );
        res.json(characters);
    } catch (error) {
        console.error('Get characters error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/characters/:id', authenticate, async (req, res) => {
    try {
        const character = await db.get(
            'SELECT * FROM characters WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        // Get campaign info if linked
        let campaignInfo = null;
        if (character.campaign_id) {
            const campaign = await db.get(`
                SELECT c.id, c.name, c.description, u.username as dm_name
                FROM campaigns c
                JOIN users u ON c.user_id = u.id
                WHERE c.id = $1
            `, [character.campaign_id]);
            if (campaign) {
                campaignInfo = campaign;
            }
        }

        metrics.characters.loads++;
        writeMetricsFile();

        // Convert JSONB data to string for mobile app compatibility
        res.json({
            ...character,
            data: JSON.stringify(character.data),
            campaign: campaignInfo
        });
    } catch (error) {
        console.error('Get character error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// Valid game systems whitelist
const VALID_SYSTEMS = ['aedelore', 'dnd5e', 'pathfinder2e', 'storyteller', 'cod'];

app.post('/api/characters', authenticate, async (req, res) => {
    const { name, data, system } = req.body;

    // Validate name
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Name is required' });
    }
    const trimmedName = name.trim();
    if (trimmedName.length === 0 || trimmedName.length > 100) {
        return res.status(400).json({ error: 'Name must be 1-100 characters' });
    }

    // Validate data exists
    if (!data) {
        return res.status(400).json({ error: 'Character data is required' });
    }

    // Validate system
    const validSystem = VALID_SYSTEMS.includes(system) ? system : 'aedelore';

    try {
        const result = await db.get(
            'INSERT INTO characters (user_id, name, data, system) VALUES ($1, $2, $3, $4) RETURNING id',
            [req.userId, trimmedName, data, validSystem]
        );

        metrics.characters.saves++;
        writeMetricsFile();

        res.json({ success: true, id: result.id });
    } catch (error) {
        console.error('Save character error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/characters/:id', authenticate, async (req, res) => {
    const { name, data, system } = req.body;

    // Validate name
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Name is required' });
    }
    const trimmedName = name.trim();
    if (trimmedName.length === 0 || trimmedName.length > 100) {
        return res.status(400).json({ error: 'Name must be 1-100 characters' });
    }

    // Validate data exists
    if (!data) {
        return res.status(400).json({ error: 'Character data is required' });
    }

    // Validate system
    const validSystem = VALID_SYSTEMS.includes(system) ? system : 'aedelore';

    try {
        // Fetch existing character data to preserve DM-managed fields (quest_items)
        const existing = await db.get(
            'SELECT id, data FROM characters WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!existing) {
            return res.status(404).json({ error: 'Character not found' });
        }

        // Parse existing data to preserve quest_items (DM-managed, not client-managed)
        let existingData = {};
        try {
            existingData = typeof existing.data === 'string' ? JSON.parse(existing.data) : (existing.data || {});
        } catch (parseErr) {
            console.error('Failed to parse existing character data:', parseErr);
        }

        // Merge: keep quest_items from database (only DM can modify via /give-item endpoint)
        const mergedData = {
            ...data,
            quest_items: existingData.quest_items || []
        };

        // Include user_id in WHERE clause as additional safeguard
        await db.query(
            'UPDATE characters SET name = $1, data = $2, system = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND user_id = $5',
            [trimmedName, mergedData, validSystem, req.params.id, req.userId]
        );

        metrics.characters.saves++;
        writeMetricsFile();

        res.json({ success: true, id: parseInt(req.params.id) });
    } catch (error) {
        console.error('Update character error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/characters/:id', authenticate, async (req, res) => {
    try {
        // Soft delete - set deleted_at timestamp instead of removing
        const result = await db.query(
            'UPDATE characters SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Character not found' });
        }

        metrics.characters.deletes++;
        writeMetricsFile();

        res.json({ success: true });
    } catch (error) {
        console.error('Delete character error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// Link character to campaign via share code
app.post('/api/characters/:id/link-campaign', authenticate, async (req, res) => {
    const { share_code } = req.body;

    if (!share_code) {
        return res.status(400).json({ error: 'Share code required' });
    }

    try {
        // Check if character exists and belongs to user
        const character = await db.get(
            'SELECT id, campaign_id FROM characters WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        // Find campaign by share code
        const campaign = await db.get(
            'SELECT id, name, user_id FROM campaigns WHERE share_code = $1 AND deleted_at IS NULL',
            [share_code.toUpperCase()]
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Invalid share code' });
        }

        // Update character with campaign_id
        await db.query(
            'UPDATE characters SET campaign_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [campaign.id, req.params.id]
        );

        // Also add user as campaign player if not already
        const existingPlayer = await db.get(
            'SELECT id FROM campaign_players WHERE campaign_id = $1 AND user_id = $2',
            [campaign.id, req.userId]
        );

        if (!existingPlayer && campaign.user_id !== req.userId) {
            await db.query(
                'INSERT INTO campaign_players (campaign_id, user_id) VALUES ($1, $2)',
                [campaign.id, req.userId]
            );
        }

        res.json({ success: true, campaign_name: campaign.name, campaign_id: campaign.id });
    } catch (error) {
        console.error('Link character to campaign error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// Unlink character from campaign
app.delete('/api/characters/:id/link-campaign', authenticate, async (req, res) => {
    try {
        const character = await db.get(
            'SELECT id FROM characters WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        await db.query(
            'UPDATE characters SET campaign_id = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [req.params.id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Unlink character from campaign error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// Get party members (other characters in the same campaign)
app.get('/api/characters/:id/party', authenticate, async (req, res) => {
    try {
        // Get character and its campaign
        const character = await db.get(
            'SELECT id, campaign_id FROM characters WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        if (!character.campaign_id) {
            return res.json({ party: [], message: 'Character is not linked to a campaign' });
        }

        // Get all other characters in the same campaign
        const partyMembers = await db.all(`
            SELECT c.id, c.name, c.system, u.username as player_name
            FROM characters c
            JOIN users u ON c.user_id = u.id
            WHERE c.campaign_id = $1 AND c.id != $2 AND c.deleted_at IS NULL
            ORDER BY c.name
        `, [character.campaign_id, req.params.id]);

        res.json({ party: partyMembers });
    } catch (error) {
        console.error('Get party members error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// ===========================================
// CHARACTER LOCKING & XP SYSTEM
// ===========================================

// Player locks their race/class (required before spending initial 10 points)
app.post('/api/characters/:id/lock-race-class', authenticate, async (req, res) => {
    try {
        const character = await db.get(
            'SELECT id, race_class_locked FROM characters WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        if (character.race_class_locked) {
            return res.status(400).json({ error: 'Race/class already locked' });
        }

        await db.query(
            'UPDATE characters SET race_class_locked = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [req.params.id]
        );

        res.json({ success: true, message: 'Race and class locked' });
    } catch (error) {
        console.error('Lock race/class error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Player locks their attributes (after spending initial points)
app.post('/api/characters/:id/lock-attributes', authenticate, async (req, res) => {
    try {
        const character = await db.get(
            'SELECT id, race_class_locked, attributes_locked FROM characters WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        if (!character.race_class_locked) {
            return res.status(400).json({ error: 'Must lock race/class first' });
        }

        if (character.attributes_locked) {
            return res.status(400).json({ error: 'Attributes already locked' });
        }

        await db.query(
            'UPDATE characters SET attributes_locked = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [req.params.id]
        );

        res.json({ success: true, message: 'Attributes locked' });
    } catch (error) {
        console.error('Lock attributes error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Player locks their abilities (after locking attributes)
app.post('/api/characters/:id/lock-abilities', authenticate, async (req, res) => {
    try {
        const character = await db.get(
            'SELECT id, race_class_locked, attributes_locked, abilities_locked FROM characters WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        if (!character.race_class_locked) {
            return res.status(400).json({ error: 'Must lock race/class first' });
        }

        if (!character.attributes_locked) {
            return res.status(400).json({ error: 'Must lock attributes first' });
        }

        if (character.abilities_locked) {
            return res.status(400).json({ error: 'Abilities already locked' });
        }

        await db.query(
            'UPDATE characters SET abilities_locked = TRUE, updated_at = CURRENT_TIMESTAMP WHERE id = $1',
            [req.params.id]
        );

        res.json({ success: true, message: 'Abilities locked' });
    } catch (error) {
        console.error('Lock abilities error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Player spends attribute points (uses 10 XP per point)
app.post('/api/characters/:id/spend-attribute-points', authenticate, async (req, res) => {
    try {
        const { count } = req.body;
        const pointsToSpend = parseInt(count, 10);

        // Validate count is a positive integer within reasonable bounds
        if (!Number.isInteger(pointsToSpend) || pointsToSpend < 1 || pointsToSpend > 100) {
            return res.status(400).json({ error: 'Count must be between 1 and 100' });
        }

        const character = await db.get(
            'SELECT id, xp, xp_spent, attributes_locked FROM characters WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        const availablePoints = Math.floor(character.xp / 10) - Math.floor(character.xp_spent / 10);

        if (availablePoints < pointsToSpend) {
            return res.status(400).json({ error: `Not enough points. Available: ${availablePoints}` });
        }

        const newXpSpent = character.xp_spent + (pointsToSpend * 10);

        await db.query(
            'UPDATE characters SET xp_spent = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newXpSpent, req.params.id]
        );

        const newAvailablePoints = Math.floor(character.xp / 10) - Math.floor(newXpSpent / 10);

        res.json({
            success: true,
            xp: character.xp,
            xp_spent: newXpSpent,
            points_spent: pointsToSpend,
            available_points: newAvailablePoints
        });
    } catch (error) {
        console.error('Spend attribute points error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DM gives XP to a character (must be in DM's campaign)
app.post('/api/dm/characters/:id/give-xp', authenticate, async (req, res) => {
    const { amount } = req.body;

    // Validate amount is a positive integer within reasonable bounds
    const parsedAmount = parseInt(amount, 10);
    if (!Number.isInteger(parsedAmount) || parsedAmount < 1 || parsedAmount > 10000) {
        return res.status(400).json({ error: 'Amount must be between 1 and 10000' });
    }

    try {
        // Get character and verify DM owns the campaign
        const character = await db.get(`
            SELECT c.id, c.xp, c.campaign_id, camp.user_id as dm_id
            FROM characters c
            LEFT JOIN campaigns camp ON c.campaign_id = camp.id
            WHERE c.id = $1 AND c.deleted_at IS NULL
        `, [req.params.id]);

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        if (!character.campaign_id) {
            return res.status(400).json({ error: 'Character is not linked to a campaign' });
        }

        if (character.dm_id !== req.userId) {
            return res.status(403).json({ error: 'Only the campaign DM can give XP' });
        }

        const newXp = (character.xp || 0) + parsedAmount;

        await db.query(
            'UPDATE characters SET xp = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newXp, req.params.id]
        );

        res.json({
            success: true,
            xp: newXp,
            message: `Gave ${parsedAmount} XP to character`
        });
    } catch (error) {
        console.error('Give XP error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DM views a character's build (abilities and stats)
app.get('/api/dm/characters/:id/build', authenticate, async (req, res) => {
    try {
        // Get character and verify DM owns the campaign
        const character = await db.get(`
            SELECT c.id, c.name, c.data, c.campaign_id, camp.user_id as dm_id
            FROM characters c
            LEFT JOIN campaigns camp ON c.campaign_id = camp.id
            WHERE c.id = $1 AND c.deleted_at IS NULL
        `, [req.params.id]);

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        if (!character.campaign_id) {
            return res.status(400).json({ error: 'Character is not linked to a campaign' });
        }

        if (character.dm_id !== req.userId) {
            return res.status(403).json({ error: 'Only the campaign DM can view character builds' });
        }

        // Parse character data
        let charData = {};
        try {
            charData = typeof character.data === 'string' ? JSON.parse(character.data) : character.data;
        } catch (e) {
            charData = {};
        }

        res.json({
            id: character.id,
            name: character.name,
            data: charData
        });
    } catch (error) {
        console.error('Get character build error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DM sets lock state for a character (must be in DM's campaign)
app.post('/api/dm/characters/:id/set-locks', authenticate, async (req, res) => {
    const { race_class_locked, attributes_locked, abilities_locked } = req.body;

    try {
        // Get character and verify DM owns the campaign
        const character = await db.get(`
            SELECT c.id, c.campaign_id, camp.user_id as dm_id
            FROM characters c
            LEFT JOIN campaigns camp ON c.campaign_id = camp.id
            WHERE c.id = $1 AND c.deleted_at IS NULL
        `, [req.params.id]);

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        if (!character.campaign_id) {
            return res.status(400).json({ error: 'Character is not linked to a campaign' });
        }

        if (character.dm_id !== req.userId) {
            return res.status(403).json({ error: 'Only the campaign DM can change lock states' });
        }

        // Build update query for provided values only
        const updates = [];
        const values = [req.params.id];
        let paramIndex = 2;

        if (typeof race_class_locked === 'boolean') {
            updates.push(`race_class_locked = $${paramIndex++}`);
            values.push(race_class_locked);
        }
        if (typeof attributes_locked === 'boolean') {
            updates.push(`attributes_locked = $${paramIndex++}`);
            values.push(attributes_locked);
        }
        if (typeof abilities_locked === 'boolean') {
            updates.push(`abilities_locked = $${paramIndex++}`);
            values.push(abilities_locked);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'Specify at least one lock state to change' });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');

        await db.query(
            `UPDATE characters SET ${updates.join(', ')} WHERE id = $1`,
            values
        );

        res.json({
            success: true,
            message: 'Lock states updated'
        });
    } catch (error) {
        console.error('Set locks error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DM unlocks a character (legacy endpoint, kept for compatibility)
app.post('/api/dm/characters/:id/unlock', authenticate, async (req, res) => {
    const { unlock_race_class, unlock_attributes, unlock_abilities } = req.body;

    try {
        // Get character and verify DM owns the campaign
        const character = await db.get(`
            SELECT c.id, c.campaign_id, camp.user_id as dm_id
            FROM characters c
            LEFT JOIN campaigns camp ON c.campaign_id = camp.id
            WHERE c.id = $1 AND c.deleted_at IS NULL
        `, [req.params.id]);

        if (!character) {
            return res.status(404).json({ error: 'Character not found' });
        }

        if (!character.campaign_id) {
            return res.status(400).json({ error: 'Character is not linked to a campaign' });
        }

        if (character.dm_id !== req.userId) {
            return res.status(403).json({ error: 'Only the campaign DM can unlock characters' });
        }

        // Validate boolean inputs explicitly
        const doUnlockRaceClass = unlock_race_class === true;
        const doUnlockAttributes = unlock_attributes === true;
        const doUnlockAbilities = unlock_abilities === true;

        if (!doUnlockRaceClass && !doUnlockAttributes && !doUnlockAbilities) {
            return res.status(400).json({ error: 'Specify what to unlock' });
        }

        // Use parameterized query with CASE statements instead of dynamic SQL
        await db.query(`
            UPDATE characters SET
                race_class_locked = CASE WHEN $2 THEN FALSE ELSE race_class_locked END,
                attributes_locked = CASE WHEN $3 THEN FALSE ELSE attributes_locked END,
                abilities_locked = CASE WHEN $4 THEN FALSE ELSE abilities_locked END,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $1`,
            [req.params.id, doUnlockRaceClass, doUnlockAttributes, doUnlockAbilities]
        );

        res.json({
            success: true,
            message: 'Character unlocked'
        });
    } catch (error) {
        console.error('Unlock character error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// DM gives a quest item to a character (adds to quest_items array in character data)
app.post('/api/dm/characters/:id/give-item', authenticate, async (req, res) => {
    const { name, description } = req.body;
    // Note: campaign_id from request body is intentionally ignored to prevent authorization bypass

    // Validate inputs with length limits
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Item name is required' });
    }
    if (name.trim().length === 0 || name.length > 200) {
        return res.status(400).json({ error: 'Item name must be 1-200 characters' });
    }
    if (description && (typeof description !== 'string' || description.length > 2000)) {
        return res.status(400).json({ error: 'Description must be max 2000 characters' });
    }

    // Use a database transaction to prevent race conditions during read-modify-write
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Get character with row lock AND verify it belongs to a campaign the DM owns
        // Uses FOR UPDATE to lock the row during the transaction
        const characterResult = await client.query(`
            SELECT c.id, c.data, c.campaign_id, camp.user_id as dm_id
            FROM characters c
            LEFT JOIN campaigns camp ON c.campaign_id = camp.id AND camp.deleted_at IS NULL
            WHERE c.id = $1 AND c.deleted_at IS NULL
            FOR UPDATE OF c`,
            [req.params.id]
        );
        const character = characterResult.rows[0];

        if (!character) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Character not found' });
        }

        // Verify the character is linked to a campaign
        if (!character.campaign_id) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Character is not linked to any campaign' });
        }

        // Verify the requesting user is the DM of the character's campaign
        if (character.dm_id !== req.userId) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'Only the DM of the character\'s campaign can give items' });
        }

        // Parse character data and add quest item (with error handling)
        let charData;
        try {
            charData = typeof character.data === 'string' ? JSON.parse(character.data) : (character.data || {});
        } catch (parseErr) {
            console.error('Failed to parse character data:', parseErr);
            await client.query('ROLLBACK');
            return res.status(500).json({ error: 'Character data is corrupted' });
        }

        if (!charData.quest_items) {
            charData.quest_items = [];
        }

        // Check for duplicate item (same name already exists)
        const trimmedName = name.trim();
        const existingIndex = charData.quest_items.findIndex(
            qi => qi.name.toLowerCase() === trimmedName.toLowerCase()
        );

        if (existingIndex >= 0) {
            // Update existing item instead of adding duplicate
            charData.quest_items[existingIndex].description = (description || '').trim();
            charData.quest_items[existingIndex].givenAt = new Date().toLocaleDateString('sv-SE');
        } else {
            // Add the new quest item (trimmed and sanitized)
            charData.quest_items.push({
                name: trimmedName,
                description: (description || '').trim(),
                givenAt: new Date().toLocaleDateString('sv-SE')
            });
        }

        // Save back to database
        await client.query(
            'UPDATE characters SET data = $1 WHERE id = $2',
            [JSON.stringify(charData), req.params.id]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `Item "${name}" given to character`,
            quest_items: charData.quest_items
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Give item error:', error);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// DM removes a quest item from a character (removes from quest_items array in character data)
app.post('/api/dm/characters/:id/remove-item', authenticate, async (req, res) => {
    const { name } = req.body;

    // Validate inputs
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Item name is required' });
    }
    if (name.trim().length === 0 || name.length > 200) {
        return res.status(400).json({ error: 'Item name must be 1-200 characters' });
    }

    // Use a database transaction to prevent race conditions during read-modify-write
    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Get character with row lock AND verify it belongs to a campaign the DM owns
        // Uses FOR UPDATE to lock the row during the transaction
        const characterResult = await client.query(`
            SELECT c.id, c.data, c.campaign_id, camp.user_id as dm_id
            FROM characters c
            LEFT JOIN campaigns camp ON c.campaign_id = camp.id AND camp.deleted_at IS NULL
            WHERE c.id = $1 AND c.deleted_at IS NULL
            FOR UPDATE OF c`,
            [req.params.id]
        );
        const character = characterResult.rows[0];

        if (!character) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Character not found' });
        }

        // Verify the character is linked to a campaign
        if (!character.campaign_id) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Character is not linked to any campaign' });
        }

        // Verify the requesting user is the DM of the character's campaign
        if (character.dm_id !== req.userId) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'Only the DM of the character\'s campaign can remove items' });
        }

        // Parse character data and remove quest item (with error handling)
        let charData;
        try {
            charData = typeof character.data === 'string' ? JSON.parse(character.data) : (character.data || {});
        } catch (parseErr) {
            console.error('Failed to parse character data:', parseErr);
            await client.query('ROLLBACK');
            return res.status(500).json({ error: 'Character data is corrupted' });
        }

        if (!charData.quest_items || charData.quest_items.length === 0) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Character has no quest items' });
        }

        // Find and remove the item by name (case-insensitive)
        const trimmedName = name.trim().toLowerCase();
        const originalLength = charData.quest_items.length;
        charData.quest_items = charData.quest_items.filter(
            qi => qi.name.toLowerCase() !== trimmedName
        );

        if (charData.quest_items.length === originalLength) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Item not found in character inventory' });
        }

        // Save back to database
        await client.query(
            'UPDATE characters SET data = $1 WHERE id = $2',
            [JSON.stringify(charData), req.params.id]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: `Item "${name}" removed from character`,
            quest_items: charData.quest_items
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Remove item error:', error);
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// Get characters in a campaign (for DM to manage XP/unlocking)
app.get('/api/dm/campaigns/:id/characters', authenticate, async (req, res) => {
    try {
        // Verify user is DM of this campaign
        const campaign = await db.get(
            'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found or not authorized' });
        }

        const characters = await db.all(`
            SELECT c.id, c.name, c.xp, c.xp_spent, c.race_class_locked, c.attributes_locked, c.abilities_locked,
                   u.username as player_name
            FROM characters c
            JOIN users u ON c.user_id = u.id
            WHERE c.campaign_id = $1 AND c.deleted_at IS NULL
            ORDER BY c.name
        `, [req.params.id]);

        // Calculate available points for each character
        const result = characters.map(char => ({
            ...char,
            available_points: Math.floor(char.xp / 10) - Math.floor(char.xp_spent / 10)
        }));

        res.json(result);
    } catch (error) {
        console.error('Get campaign characters error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/account', authenticate, async (req, res) => {
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

        // Soft delete all user data (mark as deleted instead of removing)
        await db.query('UPDATE characters SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND deleted_at IS NULL', [req.userId]);
        await db.query('UPDATE sessions SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND deleted_at IS NULL', [req.userId]);
        await db.query('UPDATE campaigns SET deleted_at = CURRENT_TIMESTAMP WHERE user_id = $1 AND deleted_at IS NULL', [req.userId]);
        // Actually delete tokens and user (no need to soft delete these)
        await db.query('DELETE FROM auth_tokens WHERE user_id = $1', [req.userId]);
        await db.query('DELETE FROM users WHERE id = $1', [req.userId]);

        metrics.auth.deletedAccounts++;
        writeMetricsFile();

        res.json({ success: true, message: 'Account deleted' });
    } catch (error) {
        console.error('Delete account error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// Campaign Endpoints
// ============================================

app.get('/api/campaigns', authenticate, async (req, res) => {
    try {
        const campaigns = await db.all(`
            SELECT c.*,
                   (SELECT COUNT(*) FROM sessions WHERE campaign_id = c.id AND deleted_at IS NULL) as session_count
            FROM campaigns c
            WHERE c.user_id = $1 AND c.deleted_at IS NULL
            ORDER BY c.updated_at DESC
        `, [req.userId]);
        res.json(campaigns);
    } catch (error) {
        console.error('Get campaigns error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/campaigns/:id', authenticate, async (req, res) => {
    try {
        const campaign = await db.get(
            'SELECT * FROM campaigns WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        const sessions = await db.all(
            'SELECT id, session_number, date, location, status, updated_at FROM sessions WHERE campaign_id = $1 AND deleted_at IS NULL ORDER BY session_number DESC',
            [campaign.id]
        );

        res.json({ ...campaign, sessions });
    } catch (error) {
        console.error('Get campaign error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/campaigns', authenticate, async (req, res) => {
    const { name, description } = req.body;

    // Validate name
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Campaign name required' });
    }
    const trimmedName = name.trim();
    if (trimmedName.length === 0 || trimmedName.length > 100) {
        return res.status(400).json({ error: 'Campaign name must be 1-100 characters' });
    }

    // Validate description
    const trimmedDesc = (description || '').trim();
    if (trimmedDesc.length > 2000) {
        return res.status(400).json({ error: 'Description must be max 2000 characters' });
    }

    try {
        const result = await db.get(
            'INSERT INTO campaigns (user_id, name, description) VALUES ($1, $2, $3) RETURNING id',
            [req.userId, trimmedName, trimmedDesc]
        );

        res.json({ success: true, id: result.id });
    } catch (error) {
        console.error('Create campaign error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/campaigns/:id', authenticate, async (req, res) => {
    const { name, description } = req.body;

    // Validate name
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Campaign name required' });
    }
    const trimmedName = name.trim();
    if (trimmedName.length === 0 || trimmedName.length > 100) {
        return res.status(400).json({ error: 'Campaign name must be 1-100 characters' });
    }

    // Validate description
    const trimmedDesc = (description || '').trim();
    if (trimmedDesc.length > 2000) {
        return res.status(400).json({ error: 'Description must be max 2000 characters' });
    }

    try {
        const existing = await db.get(
            'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!existing) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Include user_id in WHERE clause as additional safeguard
        await db.query(
            'UPDATE campaigns SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4',
            [trimmedName, trimmedDesc, req.params.id, req.userId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Update campaign error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/campaigns/:id', authenticate, async (req, res) => {
    try {
        // Soft delete - set deleted_at timestamp instead of removing
        const result = await db.query(
            'UPDATE campaigns SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Also soft delete all sessions in this campaign
        await db.query(
            'UPDATE sessions SET deleted_at = CURRENT_TIMESTAMP WHERE campaign_id = $1 AND deleted_at IS NULL',
            [req.params.id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Delete campaign error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// Campaign Sharing (Player Access)
// ============================================

// Generate share code for a campaign
app.post('/api/campaigns/:id/share', authenticate, async (req, res) => {
    try {
        // Check ownership
        const campaign = await db.get(
            'SELECT id, share_code FROM campaigns WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Generate new code if none exists, or return existing
        let shareCode = campaign.share_code;
        if (!shareCode) {
            shareCode = crypto.randomBytes(4).toString('hex').toUpperCase();
            await db.query(
                'UPDATE campaigns SET share_code = $1 WHERE id = $2',
                [shareCode, req.params.id]
            );
        }

        res.json({ share_code: shareCode });
    } catch (error) {
        console.error('Generate share code error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Revoke share code
app.delete('/api/campaigns/:id/share', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'UPDATE campaigns SET share_code = NULL WHERE id = $1 AND user_id = $2',
            [req.params.id, req.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Also remove all players
        await db.query('DELETE FROM campaign_players WHERE campaign_id = $1', [req.params.id]);

        res.json({ success: true });
    } catch (error) {
        console.error('Revoke share code error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Join campaign as player
app.post('/api/campaigns/join', authenticate, async (req, res) => {
    const { share_code } = req.body;

    if (!share_code) {
        return res.status(400).json({ error: 'Share code required' });
    }

    try {
        const campaign = await db.get(
            'SELECT id, name, user_id FROM campaigns WHERE share_code = $1 AND deleted_at IS NULL',
            [share_code.toUpperCase()]
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Invalid share code' });
        }

        // Can't join own campaign
        if (campaign.user_id === req.userId) {
            return res.status(400).json({ error: 'You own this campaign' });
        }

        // Check if already joined
        const existing = await db.get(
            'SELECT id FROM campaign_players WHERE campaign_id = $1 AND user_id = $2',
            [campaign.id, req.userId]
        );

        if (existing) {
            return res.status(400).json({ error: 'Already joined this campaign' });
        }

        // Join
        await db.query(
            'INSERT INTO campaign_players (campaign_id, user_id) VALUES ($1, $2)',
            [campaign.id, req.userId]
        );

        res.json({ success: true, campaign_name: campaign.name, campaign_id: campaign.id });
    } catch (error) {
        console.error('Join campaign error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Leave campaign as player
app.delete('/api/campaigns/:id/leave', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM campaign_players WHERE campaign_id = $1 AND user_id = $2',
            [req.params.id, req.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Not a member of this campaign' });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Leave campaign error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get campaigns I'm a player in
app.get('/api/player/campaigns', authenticate, async (req, res) => {
    try {
        const campaigns = await db.all(`
            SELECT c.id, c.name, c.description, u.username as dm_name,
                   (SELECT COUNT(*) FROM sessions WHERE campaign_id = c.id AND status = 'locked' AND deleted_at IS NULL) as session_count
            FROM campaigns c
            JOIN campaign_players cp ON c.id = cp.campaign_id
            JOIN users u ON c.user_id = u.id
            WHERE cp.user_id = $1 AND c.deleted_at IS NULL
            ORDER BY cp.joined_at DESC
        `, [req.userId]);

        res.json(campaigns);
    } catch (error) {
        console.error('Get player campaigns error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get campaign summary for player (latest session + locked sessions list)
app.get('/api/player/campaigns/:id', authenticate, async (req, res) => {
    try {
        // Check if player is member
        const membership = await db.get(
            'SELECT id FROM campaign_players WHERE campaign_id = $1 AND user_id = $2',
            [req.params.id, req.userId]
        );

        if (!membership) {
            return res.status(403).json({ error: 'Not a member of this campaign' });
        }

        // Get campaign info
        const campaign = await db.get(`
            SELECT c.id, c.name, c.description, u.username as dm_name
            FROM campaigns c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = $1 AND c.deleted_at IS NULL
        `, [req.params.id]);

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Get locked sessions with data for summaries
        const lockedSessionsRaw = await db.all(`
            SELECT id, session_number, date, location, status, data
            FROM sessions
            WHERE campaign_id = $1 AND status = 'locked' AND deleted_at IS NULL
            ORDER BY session_number DESC
        `, [req.params.id]);

        // Process locked sessions to include summaries
        const lockedSessions = lockedSessionsRaw.map(session => ({
            id: session.id,
            session_number: session.session_number,
            date: session.date,
            location: session.location,
            status: session.status,
            summary: generateSessionSummary(session.data)
        }));

        // Get latest session (active or most recent) for live summary
        const latestSession = await db.get(`
            SELECT id, session_number, date, location, status, data
            FROM sessions
            WHERE campaign_id = $1 AND deleted_at IS NULL
            ORDER BY session_number DESC
            LIMIT 1
        `, [req.params.id]);

        res.json({
            campaign,
            locked_sessions: lockedSessions,
            latest_session: latestSession ? {
                id: latestSession.id,
                session_number: latestSession.session_number,
                date: latestSession.date,
                location: latestSession.location,
                status: latestSession.status,
                summary: generateSessionSummary(latestSession.data)
            } : null
        });
    } catch (error) {
        console.error('Get player campaign error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Helper function to generate summary from session data
// Only shows marked items (used NPCs, visited places, completed encounters, found items)
function generateSessionSummary(data) {
    if (!data) return null;

    // Get marked items only
    const usedNPCs = (data.npcs || []).filter(npc => npc.status === 'used' && npc.name);
    const visitedPlaces = (data.places || []).filter(place => place.visited && place.name);
    const completedEncounters = (data.encounters || []).filter(enc => enc.status === 'completed' && enc.name);
    const foundItems = (data.items || []).filter(item => item.found && item.name);
    const turningPoints = data.turningPoints || [];
    const eventLog = data.eventLog || [];

    return {
        hook: data.hook || '',
        prolog: data.prolog || '',
        npcs: usedNPCs.map(npc => ({
            name: npc.name,
            role: npc.role,
            description: npc.description || npc.info || '',
            disposition: npc.disposition || '',
            actualLocation: npc.actualLocation || npc.plannedLocation || ''
        })),
        places: visitedPlaces.map(place => ({
            name: place.name,
            description: place.description || ''
        })),
        encounters: completedEncounters.map(enc => ({
            name: enc.name,
            location: enc.location || '',
            enemies: (enc.enemies || []).map(e => e.name).filter(n => n),
            loot: enc.loot || ''
        })),
        items: foundItems.map(item => ({
            name: item.name,
            description: item.description || '',
            location: item.actualLocation || item.plannedLocation || item.location || '',
            givenTo: item.givenTo || ''
        })),
        turning_points: turningPoints.map(tp => ({ description: tp.description, consequence: tp.consequence })),
        event_log: eventLog.map(e => ({ text: e.text, timestamp: e.timestamp })),
        session_notes: data.sessionNotes || null
    };
}

// Get players in a campaign (for DM and campaign members)
app.get('/api/campaigns/:id/players', authenticate, async (req, res) => {
    try {
        // Check if user is DM (owner) or a campaign member
        const campaign = await db.get(
            'SELECT id, user_id FROM campaigns WHERE id = $1 AND deleted_at IS NULL',
            [req.params.id]
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        const isDM = campaign.user_id === req.userId;

        // If not DM, check if user is a member
        if (!isDM) {
            const membership = await db.get(
                'SELECT id FROM campaign_players WHERE campaign_id = $1 AND user_id = $2',
                [req.params.id, req.userId]
            );
            if (!membership) {
                return res.status(403).json({ error: 'Not authorized' });
            }
        }

        // Get players with their linked characters
        const players = await db.all(`
            SELECT
                u.id,
                u.username,
                cp.joined_at,
                c.id as character_id,
                c.name as character_name,
                c.data as character_data,
                c.xp as character_xp,
                c.xp_spent as character_xp_spent,
                c.race_class_locked as character_race_class_locked,
                c.attributes_locked as character_attributes_locked,
                c.abilities_locked as character_abilities_locked
            FROM users u
            JOIN campaign_players cp ON u.id = cp.user_id
            LEFT JOIN characters c ON c.user_id = u.id AND c.campaign_id = $1 AND c.deleted_at IS NULL
            WHERE cp.campaign_id = $1
            ORDER BY cp.joined_at
        `, [req.params.id]);

        // Extract race, class, religion from character data
        const playersWithCharacters = players.map(p => {
            let characterInfo = null;
            if (p.character_id && p.character_data) {
                const data = typeof p.character_data === 'string'
                    ? JSON.parse(p.character_data)
                    : p.character_data;
                characterInfo = {
                    id: p.character_id,
                    name: p.character_name || data.name || '',
                    race: data.race || '',
                    class: data.class || '',
                    religion: data.religion || '',
                    background: data.background || '',
                    xp: p.character_xp || 0,
                    xp_spent: p.character_xp_spent || 0,
                    race_class_locked: p.character_race_class_locked || false,
                    attributes_locked: p.character_attributes_locked || false,
                    abilities_locked: p.character_abilities_locked || false
                };
            }
            return {
                id: p.id,
                username: p.username,
                joined_at: p.joined_at,
                character: characterInfo
            };
        });

        res.json({ players: playersWithCharacters, isDM });
    } catch (error) {
        console.error('Get campaign players error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove player from campaign (for DM)
app.delete('/api/campaigns/:id/players/:playerId', authenticate, async (req, res) => {
    try {
        // Check ownership
        const campaign = await db.get(
            'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        // Verify player is actually a member of this campaign before removing
        const membership = await db.get(
            'SELECT id FROM campaign_players WHERE campaign_id = $1 AND user_id = $2',
            [req.params.id, req.params.playerId]
        );

        if (!membership) {
            return res.status(404).json({ error: 'Player not found in campaign' });
        }

        await db.query(
            'DELETE FROM campaign_players WHERE campaign_id = $1 AND user_id = $2',
            [req.params.id, req.params.playerId]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Remove player error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// Session Endpoints
// ============================================

app.get('/api/campaigns/:campaignId/sessions', authenticate, async (req, res) => {
    try {
        const campaign = await db.get(
            'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.campaignId, req.userId]
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        const sessions = await db.all(
            'SELECT id, session_number, date, location, status, updated_at FROM sessions WHERE campaign_id = $1 AND deleted_at IS NULL ORDER BY session_number DESC',
            [req.params.campaignId]
        );

        res.json(sessions);
    } catch (error) {
        console.error('Get sessions error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/sessions/:id', authenticate, async (req, res) => {
    try {
        const session = await db.get(
            'SELECT * FROM sessions WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        metrics.sessions.loads++;
        writeMetricsFile();

        res.json({ ...session, data: session.data });
    } catch (error) {
        console.error('Get session error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/campaigns/:campaignId/sessions', authenticate, async (req, res) => {
    const { session_number, date, location, data } = req.body;

    if (!data) {
        return res.status(400).json({ error: 'Session data required' });
    }

    try {
        const campaign = await db.get(
            'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
            [req.params.campaignId, req.userId]
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        let sessionNum = session_number;
        if (!sessionNum) {
            const lastSession = await db.get(
                'SELECT MAX(session_number) as max_num FROM sessions WHERE campaign_id = $1 AND deleted_at IS NULL',
                [req.params.campaignId]
            );
            sessionNum = (lastSession?.max_num || 0) + 1;
        }

        const result = await db.get(
            'INSERT INTO sessions (campaign_id, user_id, session_number, date, location, data) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [req.params.campaignId, req.userId, sessionNum, date || '', location || '', data]
        );

        await db.query('UPDATE campaigns SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [req.params.campaignId]);

        metrics.sessions.saves++;
        writeMetricsFile();

        res.json({ success: true, id: result.id, session_number: sessionNum });
    } catch (error) {
        console.error('Create session error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/sessions/:id', authenticate, async (req, res) => {
    const { session_number, date, location, data } = req.body;

    if (!data) {
        return res.status(400).json({ error: 'Session data required' });
    }

    try {
        const existing = await db.get(
            'SELECT id, campaign_id, status, session_number FROM sessions WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!existing) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (existing.status === 'locked') {
            return res.status(403).json({ error: 'Session is locked and cannot be edited' });
        }

        await db.query(
            'UPDATE sessions SET session_number = $1, date = $2, location = $3, data = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5',
            [session_number || existing.session_number, date || '', location || '', data, req.params.id]
        );

        await db.query('UPDATE campaigns SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [existing.campaign_id]);

        metrics.sessions.saves++;
        writeMetricsFile();

        res.json({ success: true });
    } catch (error) {
        console.error('Update session error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/sessions/:id/lock', authenticate, async (req, res) => {
    try {
        const existing = await db.get(
            'SELECT id FROM sessions WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!existing) {
            return res.status(404).json({ error: 'Session not found' });
        }

        await db.query(
            'UPDATE sessions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['locked', req.params.id]
        );

        metrics.sessions.locks++;
        writeMetricsFile();

        res.json({ success: true });
    } catch (error) {
        console.error('Lock session error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/sessions/:id/unlock', authenticate, async (req, res) => {
    try {
        const existing = await db.get(
            'SELECT id FROM sessions WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!existing) {
            return res.status(404).json({ error: 'Session not found' });
        }

        await db.query(
            'UPDATE sessions SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            ['active', req.params.id]
        );

        res.json({ success: true });
    } catch (error) {
        console.error('Unlock session error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api/sessions/:id', authenticate, async (req, res) => {
    try {
        const existing = await db.get(
            'SELECT campaign_id FROM sessions WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!existing) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Soft delete - set deleted_at timestamp instead of removing
        await db.query('UPDATE sessions SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [req.params.id]);
        await db.query('UPDATE campaigns SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [existing.campaign_id]);

        metrics.sessions.deletes++;
        writeMetricsFile();

        res.json({ success: true });
    } catch (error) {
        console.error('Delete session error:', error);
        metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// Trash / Restore Endpoints
// ============================================

// Get deleted characters (trash)
app.get('/api/trash/characters', authenticate, async (req, res) => {
    try {
        const characters = await db.all(
            'SELECT id, name, system, deleted_at FROM characters WHERE user_id = $1 AND deleted_at IS NOT NULL ORDER BY deleted_at DESC',
            [req.userId]
        );
        res.json(characters);
    } catch (error) {
        console.error('Get deleted characters error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get deleted campaigns (trash)
app.get('/api/trash/campaigns', authenticate, async (req, res) => {
    try {
        const campaigns = await db.all(
            'SELECT id, name, description, deleted_at FROM campaigns WHERE user_id = $1 AND deleted_at IS NOT NULL ORDER BY deleted_at DESC',
            [req.userId]
        );
        res.json(campaigns);
    } catch (error) {
        console.error('Get deleted campaigns error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get deleted sessions (trash) - for a specific campaign
app.get('/api/trash/campaigns/:campaignId/sessions', authenticate, async (req, res) => {
    try {
        // Verify user owns the campaign (even if deleted)
        const campaign = await db.get(
            'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2',
            [req.params.campaignId, req.userId]
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        const sessions = await db.all(
            'SELECT id, session_number, date, location, deleted_at FROM sessions WHERE campaign_id = $1 AND deleted_at IS NOT NULL ORDER BY deleted_at DESC',
            [req.params.campaignId]
        );
        res.json(sessions);
    } catch (error) {
        console.error('Get deleted sessions error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Restore a deleted character
app.post('/api/trash/characters/:id/restore', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'UPDATE characters SET deleted_at = NULL WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL',
            [req.params.id, req.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Deleted character not found' });
        }

        res.json({ success: true, message: 'Character restored' });
    } catch (error) {
        console.error('Restore character error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Restore a deleted campaign (and its sessions)
app.post('/api/trash/campaigns/:id/restore', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'UPDATE campaigns SET deleted_at = NULL WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL',
            [req.params.id, req.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Deleted campaign not found' });
        }

        // Also restore all sessions that were deleted at the same time as the campaign
        await db.query(
            'UPDATE sessions SET deleted_at = NULL WHERE campaign_id = $1 AND deleted_at IS NOT NULL',
            [req.params.id]
        );

        res.json({ success: true, message: 'Campaign and sessions restored' });
    } catch (error) {
        console.error('Restore campaign error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Restore a deleted session
app.post('/api/trash/sessions/:id/restore', authenticate, async (req, res) => {
    try {
        // First check if parent campaign exists and is not deleted
        const session = await db.get(
            'SELECT s.id, s.campaign_id, c.deleted_at as campaign_deleted FROM sessions s JOIN campaigns c ON s.campaign_id = c.id WHERE s.id = $1 AND s.user_id = $2 AND s.deleted_at IS NOT NULL',
            [req.params.id, req.userId]
        );

        if (!session) {
            return res.status(404).json({ error: 'Deleted session not found' });
        }

        if (session.campaign_deleted) {
            return res.status(400).json({ error: 'Cannot restore session - parent campaign is deleted. Restore the campaign first.' });
        }

        await db.query(
            'UPDATE sessions SET deleted_at = NULL WHERE id = $1',
            [req.params.id]
        );

        res.json({ success: true, message: 'Session restored' });
    } catch (error) {
        console.error('Restore session error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Permanently delete a character (from trash)
app.delete('/api/trash/characters/:id', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM characters WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL',
            [req.params.id, req.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Deleted character not found' });
        }

        res.json({ success: true, message: 'Character permanently deleted' });
    } catch (error) {
        console.error('Permanent delete character error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Permanently delete a campaign (from trash)
app.delete('/api/trash/campaigns/:id', authenticate, async (req, res) => {
    try {
        // First delete all sessions
        await db.query(
            'DELETE FROM sessions WHERE campaign_id = $1',
            [req.params.id]
        );

        const result = await db.query(
            'DELETE FROM campaigns WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL',
            [req.params.id, req.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Deleted campaign not found' });
        }

        res.json({ success: true, message: 'Campaign permanently deleted' });
    } catch (error) {
        console.error('Permanent delete campaign error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Permanently delete a session (from trash)
app.delete('/api/trash/sessions/:id', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'DELETE FROM sessions WHERE id = $1 AND user_id = $2 AND deleted_at IS NOT NULL',
            [req.params.id, req.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Deleted session not found' });
        }

        res.json({ success: true, message: 'Session permanently deleted' });
    } catch (error) {
        console.error('Permanent delete session error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// ============================================
// Frontend Error Logging
// ============================================

// Log frontend error (auth optional - works for both logged in and anonymous users)
app.post('/api/errors', errorLogLimiter, async (req, res) => {
    const { type, message, stack, url } = req.body;

    // Basic validation
    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message required' });
    }

    // Sanitize and limit input sizes
    const safeType = String(type || 'unknown').slice(0, 50);
    const safeMessage = String(message).slice(0, 2000);
    const safeStack = stack ? String(stack).slice(0, 5000) : null;
    const safeUrl = url ? String(url).slice(0, 500) : null;
    const userAgent = req.headers['user-agent']?.slice(0, 500) || null;

    // Try to get user_id from token (optional)
    let userId = null;
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (token) {
        try {
            const session = await db.get(
                "SELECT user_id FROM auth_tokens WHERE token = $1 AND created_at > NOW() - INTERVAL '24 hours'",
                [token]
            );
            if (session) {
                userId = session.user_id;
            }
        } catch (e) {
            // Ignore auth errors for error logging
        }
    }

    try {
        await db.query(
            `INSERT INTO frontend_errors (user_id, error_type, message, stack, url, user_agent)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, safeType, safeMessage, safeStack, safeUrl, userAgent]
        );

        // Update metrics
        metrics.frontendErrors.total++;
        metrics.frontendErrors.byType[safeType] = (metrics.frontendErrors.byType[safeType] || 0) + 1;
        if (safeUrl) {
            const pagePath = safeUrl.split('?')[0].split('#')[0];
            metrics.frontendErrors.byPage[pagePath] = (metrics.frontendErrors.byPage[pagePath] || 0) + 1;
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Error logging frontend error:', error);
        res.status(500).json({ error: 'Failed to log error' });
    }
});

// Get recent frontend errors (requires auth)
app.get('/api/errors', authenticate, async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);

    try {
        const errors = await db.all(
            `SELECT id, user_id, error_type, message, stack, url, user_agent, created_at
             FROM frontend_errors
             ORDER BY created_at DESC
             LIMIT $1`,
            [limit]
        );

        res.json({ errors, total: metrics.frontendErrors.total });
    } catch (error) {
        console.error('Error fetching frontend errors:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'postgresql' });
});

// ============================================
// Start Server
// ============================================

async function start() {
    try {
        await db.initialize();
        console.log('Database initialized');

        await writeMetricsFile();

        const server = app.listen(PORT, '0.0.0.0', () => {
            console.log(`Aedelore API running on port ${PORT}`);
        });

        // Security: Set server timeouts to prevent slowloris/slow POST attacks
        server.headersTimeout = 60000;    // 60 seconds for headers
        server.requestTimeout = 30000;    // 30 seconds for full request
        server.keepAliveTimeout = 65000;  // 65 seconds keep-alive (slightly longer than nginx)
        server.timeout = 120000;          // 2 minutes overall timeout
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

start();
