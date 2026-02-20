const express = require('express');
const router = express.Router();
const db = require('../db');
const { validateSystem, VALID_SYSTEMS } = require('../helpers');
const { authenticate } = require('../middleware/auth');
const { loggers } = require('../logger');

const log = loggers.characters;

// Metrics reference (will be set by server.js)
let metrics = null;
let writeMetricsFile = null;

function setMetrics(m, writeFn) {
    metrics = m;
    writeMetricsFile = writeFn;
}

/**
 * @swagger
 * /characters:
 *   get:
 *     summary: List all characters for current user
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of characters
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id: { type: integer }
 *                   name: { type: string }
 *                   system: { type: string }
 *                   updated_at: { type: string, format: date-time }
 */
router.get('/', authenticate, async (req, res) => {
    try {
        const characters = await db.all(
            'SELECT id, name, system, updated_at FROM characters WHERE user_id = $1 AND deleted_at IS NULL ORDER BY updated_at DESC',
            [req.userId]
        );
        res.json(characters);
    } catch (error) {
        log.error({ err: error }, 'Get characters error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /characters/{id}:
 *   get:
 *     summary: Get a character by ID
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Character details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Character'
 *       404:
 *         description: Character not found
 */
router.get('/:id', authenticate, async (req, res) => {
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

        if (metrics) {
            metrics.characters.loads++;
            writeMetricsFile?.();
        }

        // Convert JSONB data to string for mobile app compatibility
        res.json({
            ...character,
            data: JSON.stringify(character.data),
            campaign: campaignInfo
        });
    } catch (error) {
        log.error({ err: error }, 'Get character error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /characters:
 *   post:
 *     summary: Create a new character
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, data]
 *             properties:
 *               name: { type: string, maxLength: 100 }
 *               data: { type: object }
 *               system: { type: string, enum: [aedelore, dnd5e, pathfinder2e, storyteller, cod] }
 *     responses:
 *       200:
 *         description: Character created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 id: { type: integer }
 *       400:
 *         description: Validation error
 */
router.post('/', authenticate, async (req, res) => {
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

        if (metrics) {
            metrics.characters.saves++;
            writeMetricsFile?.();
        }

        res.json({ success: true, id: result.id });
    } catch (error) {
        log.error({ err: error }, 'Save character error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

/**
 * @swagger
 * /characters/{id}:
 *   put:
 *     summary: Update a character
 *     tags: [Characters]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, data]
 *             properties:
 *               name: { type: string }
 *               data: { type: object }
 *               system: { type: string }
 *     responses:
 *       200:
 *         description: Character updated
 *       404:
 *         description: Character not found
 */
router.put('/:id', authenticate, async (req, res) => {
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
            log.error({ err: parseErr }, 'Failed to parse existing character data');
        }

        // Merge: keep server-managed fields from database
        // quest_items: only DM can modify via /give-item endpoint
        // relationships: preserve if client doesn't send them (MCP may have updated)
        const mergedData = {
            ...data,
            quest_items: existingData.quest_items || [],
            quest_items_archived: data.quest_items_archived || existingData.quest_items_archived || [],
            relationships: data.relationships || existingData.relationships || ''
        };

        // Include user_id in WHERE clause as additional safeguard
        await db.query(
            'UPDATE characters SET name = $1, data = $2, system = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 AND user_id = $5',
            [trimmedName, mergedData, validSystem, req.params.id, req.userId]
        );

        if (metrics) {
            metrics.characters.saves++;
            writeMetricsFile?.();
        }

        res.json({ success: true, id: parseInt(req.params.id) });
    } catch (error) {
        log.error({ err: error }, 'Update character error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/characters/:id
router.delete('/:id', authenticate, async (req, res) => {
    try {
        // Soft delete - set deleted_at timestamp instead of removing
        const result = await db.query(
            'UPDATE characters SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Character not found' });
        }

        if (metrics) {
            metrics.characters.deletes++;
            writeMetricsFile?.();
        }

        res.json({ success: true });
    } catch (error) {
        log.error({ err: error }, 'Delete character error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/characters/:id/link-campaign
router.post('/:id/link-campaign', authenticate, async (req, res) => {
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

        // Update character and add as campaign player in a transaction
        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            await client.query(
                'UPDATE characters SET campaign_id = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
                [campaign.id, req.params.id]
            );

            // Add user as campaign player if not already (including DM playing their own campaign)
            const existingPlayer = await client.query(
                'SELECT id FROM campaign_players WHERE campaign_id = $1 AND user_id = $2',
                [campaign.id, req.userId]
            );

            if (existingPlayer.rows.length === 0) {
                await client.query(
                    'INSERT INTO campaign_players (campaign_id, user_id) VALUES ($1, $2)',
                    [campaign.id, req.userId]
                );
            }

            await client.query('COMMIT');
        } catch (txError) {
            await client.query('ROLLBACK');
            throw txError;
        } finally {
            client.release();
        }

        res.json({ success: true, campaign_name: campaign.name, campaign_id: campaign.id });
    } catch (error) {
        log.error({ err: error }, 'Link character to campaign error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// DELETE /api/characters/:id/link-campaign
router.delete('/:id/link-campaign', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Unlink character from campaign error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/characters/:id/party
router.get('/:id/party', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Get party members error');
        if (metrics) metrics.errors++;
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/characters/:id/lock-race-class
router.post('/:id/lock-race-class', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Lock race/class error');
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/characters/:id/lock-attributes
router.post('/:id/lock-attributes', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Lock attributes error');
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/characters/:id/lock-abilities
router.post('/:id/lock-abilities', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Lock abilities error');
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/characters/:id/spend-attribute-points
router.post('/:id/spend-attribute-points', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Spend attribute points error');
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/characters/:id/archive-item
router.post('/:id/archive-item', authenticate, async (req, res) => {
    const { itemIndex } = req.body;

    if (typeof itemIndex !== 'number' || itemIndex < 0) {
        return res.status(400).json({ error: 'Valid item index is required' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Get character with row lock - verify ownership
        const characterResult = await client.query(
            `SELECT id, data FROM characters WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL FOR UPDATE`,
            [req.params.id, req.userId]
        );
        const character = characterResult.rows[0];

        if (!character) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Character not found' });
        }

        let charData = {};
        try {
            charData = typeof character.data === 'string' ? JSON.parse(character.data) : (character.data || {});
        } catch (parseErr) {
            await client.query('ROLLBACK');
            return res.status(500).json({ error: 'Failed to parse character data' });
        }

        if (!charData.quest_items || itemIndex >= charData.quest_items.length) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Item not found' });
        }

        // Get the item and remove from active list
        const item = charData.quest_items.splice(itemIndex, 1)[0];

        // Add to archived list with archive date
        if (!charData.quest_items_archived) {
            charData.quest_items_archived = [];
        }
        charData.quest_items_archived.push({
            ...item,
            archivedAt: new Date().toLocaleDateString('sv-SE')
        });

        // Save back to database
        await client.query(
            'UPDATE characters SET data = $1 WHERE id = $2',
            [JSON.stringify(charData), req.params.id]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            quest_items: charData.quest_items,
            quest_items_archived: charData.quest_items_archived
        });
    } catch (error) {
        await client.query('ROLLBACK');
        log.error({ err: error }, 'Archive item error');
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// POST /api/characters/:id/unarchive-item
router.post('/:id/unarchive-item', authenticate, async (req, res) => {
    const { archiveIndex } = req.body;

    if (typeof archiveIndex !== 'number' || archiveIndex < 0) {
        return res.status(400).json({ error: 'Valid archive index is required' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Get character with row lock - verify ownership
        const characterResult = await client.query(
            `SELECT id, data FROM characters WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL FOR UPDATE`,
            [req.params.id, req.userId]
        );
        const character = characterResult.rows[0];

        if (!character) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Character not found' });
        }

        let charData = {};
        try {
            charData = typeof character.data === 'string' ? JSON.parse(character.data) : (character.data || {});
        } catch (parseErr) {
            await client.query('ROLLBACK');
            return res.status(500).json({ error: 'Failed to parse character data' });
        }

        if (!charData.quest_items_archived || archiveIndex >= charData.quest_items_archived.length) {
            await client.query('ROLLBACK');
            return res.status(404).json({ error: 'Archived item not found' });
        }

        // Get the item and remove from archived list
        const item = charData.quest_items_archived.splice(archiveIndex, 1)[0];

        // Remove archivedAt property
        delete item.archivedAt;

        // Add back to active list
        if (!charData.quest_items) {
            charData.quest_items = [];
        }
        charData.quest_items.push(item);

        // Save back to database
        await client.query(
            'UPDATE characters SET data = $1 WHERE id = $2',
            [JSON.stringify(charData), req.params.id]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            quest_items: charData.quest_items,
            quest_items_archived: charData.quest_items_archived
        });
    } catch (error) {
        await client.query('ROLLBACK');
        log.error({ err: error }, 'Unarchive item error');
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

module.exports = router;
module.exports.setMetrics = setMetrics;
