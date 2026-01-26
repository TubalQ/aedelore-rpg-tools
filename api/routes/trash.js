const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { loggers } = require('../logger');

const log = loggers.trash;

// GET /api/trash/characters
router.get('/characters', authenticate, async (req, res) => {
    try {
        const characters = await db.all(
            'SELECT id, name, system, deleted_at FROM characters WHERE user_id = $1 AND deleted_at IS NOT NULL ORDER BY deleted_at DESC',
            [req.userId]
        );
        res.json(characters);
    } catch (error) {
        log.error({ err: error }, 'Get deleted characters error');
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/trash/campaigns
router.get('/campaigns', authenticate, async (req, res) => {
    try {
        const campaigns = await db.all(
            'SELECT id, name, description, deleted_at FROM campaigns WHERE user_id = $1 AND deleted_at IS NOT NULL ORDER BY deleted_at DESC',
            [req.userId]
        );
        res.json(campaigns);
    } catch (error) {
        log.error({ err: error }, 'Get deleted campaigns error');
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/trash/campaigns/:campaignId/sessions
router.get('/campaigns/:campaignId/sessions', authenticate, async (req, res) => {
    try {
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
        log.error({ err: error }, 'Get deleted sessions error');
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/trash/characters/:id/restore
router.post('/characters/:id/restore', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Restore character error');
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/trash/campaigns/:id/restore
router.post('/campaigns/:id/restore', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Restore campaign error');
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/trash/sessions/:id/restore
router.post('/sessions/:id/restore', authenticate, async (req, res) => {
    try {
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
        log.error({ err: error }, 'Restore session error');
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/trash/characters/:id (permanent delete)
router.delete('/characters/:id', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Permanent delete character error');
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/trash/campaigns/:id (permanent delete)
router.delete('/campaigns/:id', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Permanent delete campaign error');
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/trash/sessions/:id (permanent delete)
router.delete('/sessions/:id', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Permanent delete session error');
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
