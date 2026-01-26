const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { loggers } = require('../logger');

const log = loggers.sessions;

// Metrics reference (will be set by server.js)
let metrics = null;
let writeMetricsFile = null;

function setMetrics(m, writeFn) {
    metrics = m;
    writeMetricsFile = writeFn;
}

// GET /api/campaigns/:campaignId/sessions
router.get('/campaign/:campaignId', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Get sessions error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/sessions/:id
router.get('/:id', authenticate, async (req, res) => {
    try {
        const session = await db.get(
            'SELECT * FROM sessions WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!session) {
            return res.status(404).json({ error: 'Session not found' });
        }

        if (metrics) {
            metrics.sessions.loads++;
            writeMetricsFile?.();
        }

        res.json({ ...session, data: session.data });
    } catch (error) {
        log.error({ err: error }, 'Get session error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/campaigns/:campaignId/sessions
router.post('/campaign/:campaignId', authenticate, async (req, res) => {
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

        if (metrics) {
            metrics.sessions.saves++;
            writeMetricsFile?.();
        }

        res.json({ success: true, id: result.id, session_number: sessionNum });
    } catch (error) {
        log.error({ err: error }, 'Create session error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/sessions/:id
router.put('/:id', authenticate, async (req, res) => {
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

        if (metrics) {
            metrics.sessions.saves++;
            writeMetricsFile?.();
        }

        res.json({ success: true });
    } catch (error) {
        log.error({ err: error }, 'Update session error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/sessions/:id/lock
router.put('/:id/lock', authenticate, async (req, res) => {
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

        if (metrics) {
            metrics.sessions.locks++;
            writeMetricsFile?.();
        }

        res.json({ success: true });
    } catch (error) {
        log.error({ err: error }, 'Lock session error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/sessions/:id/unlock
router.put('/:id/unlock', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Unlock session error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/sessions/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const existing = await db.get(
            'SELECT campaign_id FROM sessions WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!existing) {
            return res.status(404).json({ error: 'Session not found' });
        }

        await db.query('UPDATE sessions SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1', [req.params.id]);
        await db.query('UPDATE campaigns SET updated_at = CURRENT_TIMESTAMP WHERE id = $1', [existing.campaign_id]);

        if (metrics) {
            metrics.sessions.deletes++;
            writeMetricsFile?.();
        }

        res.json({ success: true });
    } catch (error) {
        log.error({ err: error }, 'Delete session error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
module.exports.setMetrics = setMetrics;
