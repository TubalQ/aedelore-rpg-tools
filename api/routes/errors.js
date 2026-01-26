const express = require('express');
const router = express.Router();
const db = require('../db');
const { errorLogLimiter, authenticate } = require('../middleware/auth');
const { loggers } = require('../logger');

const log = loggers.errors;

// Metrics reference (will be set by server.js)
let metrics = null;

function setMetrics(m) {
    metrics = m;
}

// POST /api/errors - Log frontend error (auth optional)
router.post('/', errorLogLimiter, async (req, res) => {
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
        if (metrics) {
            metrics.frontendErrors.total++;
            metrics.frontendErrors.byType[safeType] = (metrics.frontendErrors.byType[safeType] || 0) + 1;
            if (safeUrl) {
                const pagePath = safeUrl.split('?')[0].split('#')[0];
                metrics.frontendErrors.byPage[pagePath] = (metrics.frontendErrors.byPage[pagePath] || 0) + 1;
            }
        }

        res.json({ success: true });
    } catch (error) {
        log.error({ err: error }, 'Error logging frontend error');
        res.status(500).json({ error: 'Failed to log error' });
    }
});

// GET /api/errors - Get recent frontend errors (requires auth)
router.get('/', authenticate, async (req, res) => {
    const limit = Math.min(parseInt(req.query.limit, 10) || 100, 500);

    try {
        const errors = await db.all(
            `SELECT id, user_id, error_type, message, stack, url, user_agent, created_at
             FROM frontend_errors
             ORDER BY created_at DESC
             LIMIT $1`,
            [limit]
        );

        res.json({ errors, total: metrics?.frontendErrors?.total || 0 });
    } catch (error) {
        log.error({ err: error }, 'Error fetching frontend errors');
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
module.exports.setMetrics = setMetrics;
