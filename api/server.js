const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const helmet = require('helmet');
const swaggerUi = require('swagger-ui-express');
const db = require('./db');
const { loggers } = require('./logger');
const swaggerSpec = require('./swagger');

const log = loggers.server;

// Import routes
const authRoutes = require('./routes/auth');
const characterRoutes = require('./routes/characters');
const dmRoutes = require('./routes/dm');
const campaignRoutes = require('./routes/campaigns');
const sessionRoutes = require('./routes/sessions');
const trashRoutes = require('./routes/trash');
const errorRoutes = require('./routes/errors');

// Import middleware
const { generalLimiter, authenticate } = require('./middleware/auth');
const { csrfCookieSetter, csrfProtection } = require('./middleware/csrf');

const app = express();
const PORT = 3000;
const METRICS_FILE = path.join(__dirname, 'data', 'metrics.txt');
const METRICS_JSON = path.join(__dirname, 'data', 'metrics.json');

// Security: Add helmet for security headers
app.use(helmet());

// Trust nginx proxy
app.set('trust proxy', 1);

// Security: CORS - explicit origin required
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'https://aedelore.nu',
    credentials: true
}));

app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// CSRF protection (skips safe methods and test environment)
app.use(csrfCookieSetter);
app.use(csrfProtection);

// Skip rate limiting in test environment
if (process.env.NODE_ENV !== 'test') {
    app.use(generalLimiter);
}

// Token cleanup: Remove expired tokens periodically
async function cleanupExpiredTokens() {
    try {
        await db.query(
            "DELETE FROM auth_tokens WHERE created_at < NOW() - INTERVAL '24 hours'"
        );
    } catch (e) {
        log.error({ err: e }, 'Token cleanup error');
    }
}

// Run cleanup every hour (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
    setInterval(cleanupExpiredTokens, 60 * 60 * 1000);
}

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

// Load saved metrics
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
    log.info('Starting with fresh metrics');
}

// Request counting middleware
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

// Write metrics every 30 seconds (skip in test environment)
if (process.env.NODE_ENV !== 'test') {
    setInterval(writeMetricsFile, 30000);
}

// ============================================
// Set metrics on route modules
// ============================================

authRoutes.setMetrics(metrics, writeMetricsFile);
characterRoutes.setMetrics(metrics, writeMetricsFile);
campaignRoutes.setMetrics(metrics, writeMetricsFile);
sessionRoutes.setMetrics(metrics, writeMetricsFile);
errorRoutes.setMetrics(metrics);

// ============================================
// Mount Routes
// ============================================

// API Documentation (Swagger UI)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Aedelore API Documentation'
}));
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec));

// Auth routes (register, login, logout, me, password, email, forgot-password, reset-password, account)
app.use('/api', authRoutes);

// Character routes
app.use('/api/characters', characterRoutes);

// DM routes
app.use('/api/dm', dmRoutes);

// Campaign routes
app.use('/api/campaigns', campaignRoutes);

// Player campaign routes
app.get('/api/player/campaigns', authenticate, campaignRoutes.playerCampaignsList);
app.get('/api/player/campaigns/:id', authenticate, campaignRoutes.playerCampaignDetail);

// Session routes
app.get('/api/campaigns/:campaignId/sessions', (req, res, next) => {
    req.url = `/campaign/${req.params.campaignId}`;
    sessionRoutes(req, res, next);
});
app.post('/api/campaigns/:campaignId/sessions', (req, res, next) => {
    req.url = `/campaign/${req.params.campaignId}`;
    sessionRoutes(req, res, next);
});
app.use('/api/sessions', sessionRoutes);

// Trash routes
app.use('/api/trash', trashRoutes);

// Error logging routes
app.use('/api/errors', errorRoutes);

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', database: 'postgresql' });
});

// GET /api/csrf-token - Get CSRF token (also available in csrf_token cookie)
app.get('/api/csrf-token', (req, res) => {
    res.json({ csrfToken: req.csrfToken });
});

// ============================================
// Start Server
// ============================================

async function start() {
    try {
        await db.initialize();
        log.info('Database initialized');

        await writeMetricsFile();

        const server = app.listen(PORT, '0.0.0.0', () => {
            log.info({ port: PORT }, 'Aedelore API running');
        });

        // Security: Set server timeouts to prevent slowloris/slow POST attacks
        server.headersTimeout = 60000;    // 60 seconds for headers
        server.requestTimeout = 30000;    // 30 seconds for full request
        server.keepAliveTimeout = 65000;  // 65 seconds keep-alive
        server.timeout = 120000;          // 2 minutes overall timeout

        return server;
    } catch (error) {
        log.fatal({ err: error }, 'Failed to start server');
        process.exit(1);
    }
}

// Only start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
    start();
}

// Export for testing
module.exports = { app, db, start };
