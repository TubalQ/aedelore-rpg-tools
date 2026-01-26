const express = require('express');
const crypto = require('crypto');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { loggers } = require('../logger');

const log = loggers.campaigns;

// Metrics reference (will be set by server.js)
let metrics = null;
let writeMetricsFile = null;

function setMetrics(m, writeFn) {
    metrics = m;
    writeMetricsFile = writeFn;
}

// Helper function to generate summary from session data
function generateSessionSummary(data, playerCharacterName = null) {
    if (!data) return null;

    // Helper to check if content is visible to player
    const isVisibleToPlayer = (visibleTo) => {
        if (!playerCharacterName) return true;
        if (!visibleTo || visibleTo === 'all') return true;

        const playerNameLower = playerCharacterName.toLowerCase().trim();

        if (Array.isArray(visibleTo)) {
            return visibleTo.some(name => name.toLowerCase().trim() === playerNameLower);
        }

        return visibleTo.toLowerCase().trim() === playerNameLower;
    };

    // Get marked items only, then filter by visibility
    let usedNPCs = (data.npcs || []).filter(npc => npc.status === 'used' && npc.name);
    let visitedPlaces = (data.places || []).filter(place => place.visited && place.name);
    let completedEncounters = (data.encounters || []).filter(enc => enc.status === 'completed' && enc.name);
    let foundItems = (data.items || []).filter(item => item.found && item.name);
    let readAloud = (data.readAloud || []).filter(ra => ra.read && ra.title);
    const turningPoints = data.turningPoints || [];
    const eventLog = data.eventLog || [];

    // If player character name is provided, filter by visibility
    if (playerCharacterName) {
        const playerNameLower = playerCharacterName.toLowerCase().trim();

        usedNPCs = usedNPCs.filter(npc => isVisibleToPlayer(npc.visibleTo));
        visitedPlaces = visitedPlaces.filter(place => isVisibleToPlayer(place.visibleTo));
        completedEncounters = completedEncounters.filter(enc => isVisibleToPlayer(enc.visibleTo));
        foundItems = foundItems.filter(item => {
            const givenToLower = (item.givenTo || '').toLowerCase().trim();
            return givenToLower === playerNameLower;
        });
        readAloud = readAloud.filter(ra => isVisibleToPlayer(ra.visibleTo));
    }

    const summary = {
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
            location: item.actualLocation || item.plannedLocation || item.location || ''
        })),
        read_aloud: readAloud.map(ra => ({
            title: ra.title,
            text: ra.text || ''
        }))
    };

    // Only include DM-only fields if not player view
    if (!playerCharacterName) {
        summary.turning_points = turningPoints.map(tp => ({ description: tp.description, consequence: tp.consequence }));
        summary.event_log = eventLog.map(e => ({ text: e.text, timestamp: e.timestamp }));
        summary.session_notes = data.sessionNotes || null;
    } else {
        if (data.sessionNotes && data.sessionNotes.followUp) {
            summary.session_notes = { followUp: data.sessionNotes.followUp };
        }
    }

    return summary;
}

// GET /api/campaigns
router.get('/', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Get campaigns error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/campaigns/:id
router.get('/:id', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Get campaign error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/campaigns
router.post('/', authenticate, async (req, res) => {
    const { name, description } = req.body;

    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Campaign name required' });
    }
    const trimmedName = name.trim();
    if (trimmedName.length === 0 || trimmedName.length > 100) {
        return res.status(400).json({ error: 'Campaign name must be 1-100 characters' });
    }

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
        log.error({ err: error }, 'Create campaign error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// PUT /api/campaigns/:id
router.put('/:id', authenticate, async (req, res) => {
    const { name, description } = req.body;

    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Campaign name required' });
    }
    const trimmedName = name.trim();
    if (trimmedName.length === 0 || trimmedName.length > 100) {
        return res.status(400).json({ error: 'Campaign name must be 1-100 characters' });
    }

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

        await db.query(
            'UPDATE campaigns SET name = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 AND user_id = $4',
            [trimmedName, trimmedDesc, req.params.id, req.userId]
        );

        res.json({ success: true });
    } catch (error) {
        log.error({ err: error }, 'Update campaign error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/campaigns/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
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
        log.error({ err: error }, 'Delete campaign error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/campaigns/:id/share
router.post('/:id/share', authenticate, async (req, res) => {
    try {
        const campaign = await db.get(
            'SELECT id, share_code FROM campaigns WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

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
        log.error({ err: error }, 'Generate share code error');
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/campaigns/:id/share
router.delete('/:id/share', authenticate, async (req, res) => {
    try {
        const result = await db.query(
            'UPDATE campaigns SET share_code = NULL WHERE id = $1 AND user_id = $2',
            [req.params.id, req.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        await db.query('DELETE FROM campaign_players WHERE campaign_id = $1', [req.params.id]);

        res.json({ success: true });
    } catch (error) {
        log.error({ err: error }, 'Revoke share code error');
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/campaigns/join
router.post('/join', authenticate, async (req, res) => {
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

        if (campaign.user_id === req.userId) {
            return res.status(400).json({ error: 'You own this campaign' });
        }

        const existing = await db.get(
            'SELECT id FROM campaign_players WHERE campaign_id = $1 AND user_id = $2',
            [campaign.id, req.userId]
        );

        if (existing) {
            return res.status(400).json({ error: 'Already joined this campaign' });
        }

        await db.query(
            'INSERT INTO campaign_players (campaign_id, user_id) VALUES ($1, $2)',
            [campaign.id, req.userId]
        );

        res.json({ success: true, campaign_name: campaign.name, campaign_id: campaign.id });
    } catch (error) {
        log.error({ err: error }, 'Join campaign error');
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/campaigns/:id/leave
router.delete('/:id/leave', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Leave campaign error');
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/campaigns/:id/players
router.get('/:id/players', authenticate, async (req, res) => {
    try {
        const campaign = await db.get(
            'SELECT id, user_id FROM campaigns WHERE id = $1 AND deleted_at IS NULL',
            [req.params.id]
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        const isDM = campaign.user_id === req.userId;

        if (!isDM) {
            const membership = await db.get(
                'SELECT id FROM campaign_players WHERE campaign_id = $1 AND user_id = $2',
                [req.params.id, req.userId]
            );
            if (!membership) {
                return res.status(403).json({ error: 'Not authorized' });
            }
        }

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
        log.error({ err: error }, 'Get campaign players error');
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/campaigns/:id/players/:playerId
router.delete('/:id/players/:playerId', authenticate, async (req, res) => {
    try {
        const campaign = await db.get(
            'SELECT id FROM campaigns WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

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
        log.error({ err: error }, 'Remove player error');
        res.status(500).json({ error: 'Server error' });
    }
});

// These routes will be mounted separately at /api/player/campaigns
// GET /api/player/campaigns (list)
const playerCampaignsList = async (req, res) => {
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
        log.error({ err: error }, 'Get player campaigns error');
        res.status(500).json({ error: 'Server error' });
    }
};

// GET /api/player/campaigns/:id
const playerCampaignDetail = async (req, res) => {
    try {
        const membership = await db.get(
            'SELECT id FROM campaign_players WHERE campaign_id = $1 AND user_id = $2',
            [req.params.id, req.userId]
        );

        if (!membership) {
            return res.status(403).json({ error: 'Not a member of this campaign' });
        }

        const playerCharacter = await db.get(
            'SELECT name FROM characters WHERE campaign_id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        const playerCharacterName = playerCharacter ? playerCharacter.name : '';

        const campaign = await db.get(`
            SELECT c.id, c.name, c.description, u.username as dm_name
            FROM campaigns c
            JOIN users u ON c.user_id = u.id
            WHERE c.id = $1 AND c.deleted_at IS NULL
        `, [req.params.id]);

        if (!campaign) {
            return res.status(404).json({ error: 'Campaign not found' });
        }

        const lockedSessionsRaw = await db.all(`
            SELECT id, session_number, date, location, status, data
            FROM sessions
            WHERE campaign_id = $1 AND status = 'locked' AND deleted_at IS NULL
            ORDER BY session_number DESC
        `, [req.params.id]);

        const lockedSessions = lockedSessionsRaw.map(session => ({
            id: session.id,
            session_number: session.session_number,
            date: session.date,
            location: session.location,
            status: session.status,
            summary: generateSessionSummary(session.data, playerCharacterName)
        }));

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
                summary: generateSessionSummary(latestSession.data, playerCharacterName)
            } : null
        });
    } catch (error) {
        log.error({ err: error }, 'Get player campaign error');
        res.status(500).json({ error: 'Server error' });
    }
};

module.exports = router;
module.exports.setMetrics = setMetrics;
module.exports.playerCampaignsList = playerCampaignsList;
module.exports.playerCampaignDetail = playerCampaignDetail;
