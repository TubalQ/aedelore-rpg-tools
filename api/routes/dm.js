const express = require('express');
const router = express.Router();
const db = require('../db');
const { authenticate } = require('../middleware/auth');
const { loggers } = require('../logger');

const log = loggers.dm;

// POST /api/dm/characters/:id/give-xp
router.post('/characters/:id/give-xp', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Give XP error');
        res.status(500).json({ error: 'Server error' });
    }
});

// GET /api/dm/characters/:id/build
router.get('/characters/:id/build', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Get character build error');
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/dm/characters/:id/set-locks
router.post('/characters/:id/set-locks', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Set locks error');
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/dm/characters/:id/unlock (legacy endpoint)
router.post('/characters/:id/unlock', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Unlock character error');
        res.status(500).json({ error: 'Server error' });
    }
});

// POST /api/dm/characters/:id/give-item
router.post('/characters/:id/give-item', authenticate, async (req, res) => {
    const { name, description, sessionName } = req.body;

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

        if (!character.campaign_id) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Character is not linked to any campaign' });
        }

        if (character.dm_id !== req.userId) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'Only the DM of the character\'s campaign can give items' });
        }

        // Parse character data and add quest item
        let charData;
        try {
            charData = typeof character.data === 'string' ? JSON.parse(character.data) : (character.data || {});
        } catch (parseErr) {
            log.error({ err: parseErr }, 'Failed to parse character data');
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
            charData.quest_items[existingIndex].sessionName = sessionName || 'Unknown Session';
        } else {
            // Add the new quest item
            charData.quest_items.push({
                name: trimmedName,
                description: (description || '').trim(),
                givenAt: new Date().toLocaleDateString('sv-SE'),
                sessionName: sessionName || 'Unknown Session'
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
        log.error({ err: error }, 'Give item error');
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// POST /api/dm/characters/:id/remove-item
router.post('/characters/:id/remove-item', authenticate, async (req, res) => {
    const { name } = req.body;

    // Validate inputs
    if (!name || typeof name !== 'string') {
        return res.status(400).json({ error: 'Item name is required' });
    }
    if (name.trim().length === 0 || name.length > 200) {
        return res.status(400).json({ error: 'Item name must be 1-200 characters' });
    }

    const client = await db.pool.connect();
    try {
        await client.query('BEGIN');

        // Get character with row lock AND verify it belongs to a campaign the DM owns
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

        if (!character.campaign_id) {
            await client.query('ROLLBACK');
            return res.status(400).json({ error: 'Character is not linked to any campaign' });
        }

        if (character.dm_id !== req.userId) {
            await client.query('ROLLBACK');
            return res.status(403).json({ error: 'Only the DM of the character\'s campaign can remove items' });
        }

        // Parse character data and remove quest item
        let charData;
        try {
            charData = typeof character.data === 'string' ? JSON.parse(character.data) : (character.data || {});
        } catch (parseErr) {
            log.error({ err: parseErr }, 'Failed to parse character data');
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
        log.error({ err: error }, 'Remove item error');
        res.status(500).json({ error: 'Server error' });
    } finally {
        client.release();
    }
});

// GET /api/dm/campaigns/:id/characters
router.get('/campaigns/:id/characters', authenticate, async (req, res) => {
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
        log.error({ err: error }, 'Get campaign characters error');
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
