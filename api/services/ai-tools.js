// AI tool definitions for player chat
// Each tool has: name, description, input_schema (JSON Schema), execute(input, context)
// context = { token, characterId, apiBaseUrl }

const API_BASE = 'http://localhost:3000';

async function apiCall(path, token, options = {}) {
    const url = `${API_BASE}${path}`;
    const res = await fetch(url, {
        method: options.method || 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: options.body ? JSON.stringify(options.body) : undefined
    });
    if (!res.ok) {
        const text = await res.text().catch(() => '');
        throw new Error(`API ${res.status}: ${text || res.statusText}`);
    }
    return res.json();
}

// Roll dice tool — local, no API call needed
// D20-based system: 1D20 + modifier vs DC

function rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

function rollDice(count, sides) {
    const rolls = [];
    for (let i = 0; i < count; i++) {
        rolls.push(rollDie(sides));
    }
    return rolls;
}

const TOOLS = [
    // ── Dice Rolling ──
    {
        name: 'roll_dice',
        description: 'Roll dice using the Aedelore D20 system. For checks: rolls 1D20 + modifier vs DC. Natural 20 = critical hit (double damage), Natural 1 = auto-miss. For damage: rolls the specified dice and returns the total.',
        input_schema: {
            type: 'object',
            properties: {
                count: { type: 'number', description: 'Number of dice to roll (default: 1)' },
                sides: { type: 'number', description: 'Die sides: 20 for checks, 6 or 10 for damage, 6 for initiative' },
                modifier: { type: 'number', description: 'Modifier to add to the roll (for D20 checks)' },
                dc: { type: 'number', description: 'Difficulty Class to beat (for D20 checks)' },
                context: { type: 'string', description: 'What the roll is for (e.g. "attack", "stealth check", "damage")' }
            },
            required: ['sides']
        },
        execute: async ({ count, sides, modifier, dc, context }) => {
            const numDice = count || 1;
            const rolls = rollDice(numDice, sides);
            const total = rolls.reduce((a, b) => a + b, 0);
            const mod = modifier || 0;
            const result = { rolls, total, context: context || 'roll' };

            if (sides === 20 && numDice === 1) {
                // D20 check mode
                result.natural = rolls[0];
                result.modified_total = rolls[0] + mod;
                result.modifier = mod;
                result.critical = rolls[0] === 20;
                result.fumble = rolls[0] === 1;
                if (dc) {
                    result.dc = dc;
                    if (rolls[0] === 20) result.success = true;
                    else if (rolls[0] === 1) result.success = false;
                    else result.success = (rolls[0] + mod) >= dc;
                }
            }
            return result;
        }
    },

    // ── Character Data ──
    {
        name: 'get_my_character',
        description: 'Get the current character\'s full data including stats, equipment, abilities, HP, arcana, inventory, and lock status.',
        input_schema: {
            type: 'object',
            properties: {
                character_id: { type: 'number', description: 'Character ID' }
            },
            required: ['character_id']
        },
        execute: async ({ character_id }, ctx) => {
            const char = await apiCall(`/api/characters/${character_id}`, ctx.token);
            if (typeof char.data === 'string') {
                try { char.data = JSON.parse(char.data); } catch {}
            }
            return formatCharacterSummary(char);
        }
    },

    // ── HP & Status ──
    {
        name: 'update_hp',
        description: 'Update HP, arcana, willpower, worthiness, bleed, weakened, or injuries. Only include fields you want to change.',
        input_schema: {
            type: 'object',
            properties: {
                character_id: { type: 'number', description: 'Character ID' },
                hp: { type: 'number', description: 'Set HP value' },
                arcana: { type: 'number', description: 'Set arcana value' },
                willpower: { type: 'number', description: 'Set willpower (0-3)' },
                worthiness: { type: 'number', description: 'Set worthiness (-10 to 10)' },
                bleed: { type: 'number', description: 'Set bleed level (0-6)' },
                weakened: { type: 'number', description: 'Set weakened level (0-6)' },
                injuries: { type: 'string', description: 'Injury description text' }
            },
            required: ['character_id']
        },
        execute: async ({ character_id, ...updates }, ctx) => {
            const char = await apiCall(`/api/characters/${character_id}`, ctx.token);
            if (typeof char.data === 'string') {
                try { char.data = JSON.parse(char.data); } catch {}
            }
            const data = { ...char.data };

            const changes = [];
            const fieldMap = {
                hp: 'hp_slider', arcana: 'arcana_slider', willpower: 'willpower_slider',
                worthiness: 'worthiness_slider', bleed: 'bleed_slider', weakened: 'weakened_slider',
                injuries: 'injuries'
            };
            for (const [key, field] of Object.entries(fieldMap)) {
                if (updates[key] !== undefined) {
                    const old = data[field];
                    data[field] = updates[key];
                    changes.push(`${key}: ${old} → ${updates[key]}`);
                }
            }

            if (changes.length === 0) return { message: 'No changes specified' };

            await apiCall(`/api/characters/${character_id}`, ctx.token, {
                method: 'PUT',
                body: { name: char.name, data, system: char.system || 'aedelore' }
            });

            return { message: `Updated: ${changes.join(', ')}` };
        }
    },

    // ── Equipment HP ──
    {
        name: 'update_equipment_hp',
        description: 'Update current HP for armor pieces or shield (track damage during combat). Armor slots: 1=Head, 2=Shoulders, 3=Chest, 4=Hands, 5=Legs.',
        input_schema: {
            type: 'object',
            properties: {
                character_id: { type: 'number', description: 'Character ID' },
                armor_slot: { type: 'number', description: 'Armor slot (1-5)' },
                armor_current_hp: { type: 'number', description: 'Set armor current HP' },
                armor_broken: { type: 'boolean', description: 'Mark armor as broken' },
                shield_current_hp: { type: 'number', description: 'Set shield current HP' },
                shield_broken: { type: 'boolean', description: 'Mark shield as broken' }
            },
            required: ['character_id']
        },
        execute: async ({ character_id, armor_slot, armor_current_hp, armor_broken, shield_current_hp, shield_broken }, ctx) => {
            const char = await apiCall(`/api/characters/${character_id}`, ctx.token);
            if (typeof char.data === 'string') {
                try { char.data = JSON.parse(char.data); } catch {}
            }
            const data = { ...char.data };
            const changes = [];

            if (armor_slot && armor_current_hp !== undefined) {
                data[`armor_${armor_slot}_current_hp`] = armor_current_hp;
                changes.push(`armor slot ${armor_slot} HP → ${armor_current_hp}`);
            }
            if (armor_slot && armor_broken !== undefined) {
                data[`armor_${armor_slot}_broken`] = armor_broken;
                changes.push(`armor slot ${armor_slot} broken: ${armor_broken}`);
            }
            if (shield_current_hp !== undefined) {
                data.shield_current_hp = shield_current_hp;
                changes.push(`shield HP → ${shield_current_hp}`);
            }
            if (shield_broken !== undefined) {
                data.shield_broken = shield_broken;
                changes.push(`shield broken: ${shield_broken}`);
            }

            if (changes.length === 0) return { message: 'No changes specified' };

            await apiCall(`/api/characters/${character_id}`, ctx.token, {
                method: 'PUT',
                body: { name: char.name, data, system: char.system || 'aedelore' }
            });

            return { message: `Updated: ${changes.join(', ')}` };
        }
    },

    // ── Inventory ──
    {
        name: 'update_inventory',
        description: 'Update gold, silver, copper, potions, arrows, or food/water. Only include fields you want to change.',
        input_schema: {
            type: 'object',
            properties: {
                character_id: { type: 'number', description: 'Character ID' },
                gold: { type: 'number', description: 'Set gold amount' },
                silver: { type: 'number', description: 'Set silver amount' },
                copper: { type: 'number', description: 'Set copper amount' },
                pot_adrenaline: { type: 'number', description: 'Adrenaline potions (0-3)' },
                pot_antidote: { type: 'number', description: 'Antidote potions (0-3)' },
                pot_poison: { type: 'number', description: 'Poison potions (0-3)' },
                pot_arcane: { type: 'number', description: 'Arcane elixir (0-2)' },
                arrows: { type: 'string', description: 'Arrow count text' },
                poison_arrows: { type: 'number', description: 'Poison arrows (0-6)' },
                food_water_1: { type: 'string', description: 'Food/water slot 1' },
                food_water_2: { type: 'string', description: 'Food/water slot 2' }
            },
            required: ['character_id']
        },
        execute: async ({ character_id, ...updates }, ctx) => {
            const char = await apiCall(`/api/characters/${character_id}`, ctx.token);
            if (typeof char.data === 'string') {
                try { char.data = JSON.parse(char.data); } catch {}
            }
            const data = { ...char.data };
            const changes = [];

            const fieldMap = {
                gold: 'gold', silver: 'silver', copper: 'copper',
                pot_adrenaline: 'pot_adrenaline', pot_antidote: 'pot_antidote',
                pot_poison: 'pot_poison', pot_arcane: 'pot_arcane',
                arrows: 'arrows', poison_arrows: 'poison_arrows',
                food_water_1: 'food_water_1', food_water_2: 'food_water_2'
            };

            for (const [key, field] of Object.entries(fieldMap)) {
                if (updates[key] !== undefined) {
                    const old = data[field];
                    data[field] = updates[key];
                    changes.push(`${key}: ${old ?? 0} → ${updates[key]}`);
                }
            }

            if (changes.length === 0) return { message: 'No changes specified' };

            await apiCall(`/api/characters/${character_id}`, ctx.token, {
                method: 'PUT',
                body: { name: char.name, data, system: char.system || 'aedelore' }
            });

            return { message: `Updated: ${changes.join(', ')}` };
        }
    },

    // ── Equip Weapon ──
    {
        name: 'equip_weapon',
        description: 'Equip a weapon in a slot (1-3). The weapon name must exist in Aedelore game data.',
        input_schema: {
            type: 'object',
            properties: {
                character_id: { type: 'number', description: 'Character ID' },
                slot: { type: 'number', description: 'Weapon slot (1-3)' },
                weapon_name: { type: 'string', description: 'Weapon name from game data' }
            },
            required: ['character_id', 'slot', 'weapon_name']
        },
        execute: async ({ character_id, slot, weapon_name }, ctx) => {
            const char = await apiCall(`/api/characters/${character_id}`, ctx.token);
            if (typeof char.data === 'string') {
                try { char.data = JSON.parse(char.data); } catch {}
            }
            const data = { ...char.data };
            data[`weapon_${slot}_type`] = weapon_name;

            await apiCall(`/api/characters/${character_id}`, ctx.token, {
                method: 'PUT',
                body: { name: char.name, data, system: char.system || 'aedelore' }
            });

            return { message: `Equipped ${weapon_name} in weapon slot ${slot}` };
        }
    },

    // ── Equip Armor ──
    {
        name: 'equip_armor',
        description: 'Equip armor or shield. Armor slots: 1=Head, 2=Shoulders, 3=Chest, 4=Hands, 5=Legs. Provide armor_name for armor, shield_name for shield.',
        input_schema: {
            type: 'object',
            properties: {
                character_id: { type: 'number', description: 'Character ID' },
                slot: { type: 'number', description: 'Armor slot (1-5)' },
                armor_name: { type: 'string', description: 'Armor name from game data' },
                shield_name: { type: 'string', description: 'Shield name from game data' }
            },
            required: ['character_id']
        },
        execute: async ({ character_id, slot, armor_name, shield_name }, ctx) => {
            const char = await apiCall(`/api/characters/${character_id}`, ctx.token);
            if (typeof char.data === 'string') {
                try { char.data = JSON.parse(char.data); } catch {}
            }
            const data = { ...char.data };
            const changes = [];

            if (armor_name && slot) {
                data[`armor_${slot}_type`] = armor_name;
                changes.push(`Equipped ${armor_name} in armor slot ${slot}`);
            }
            if (shield_name) {
                data.shield_type = shield_name;
                changes.push(`Equipped shield: ${shield_name}`);
            }

            await apiCall(`/api/characters/${character_id}`, ctx.token, {
                method: 'PUT',
                body: { name: char.name, data, system: char.system || 'aedelore' }
            });

            return { message: changes.join('; ') || 'No changes' };
        }
    },

    // ── Notes ──
    {
        name: 'add_notes',
        description: 'Add text to the character\'s notes or inventory freetext. Text is appended to existing content.',
        input_schema: {
            type: 'object',
            properties: {
                character_id: { type: 'number', description: 'Character ID' },
                text: { type: 'string', description: 'Text to append' },
                field: { type: 'string', enum: ['inventory', 'notes'], description: 'Which field to update' }
            },
            required: ['character_id', 'text', 'field']
        },
        execute: async ({ character_id, text, field }, ctx) => {
            const char = await apiCall(`/api/characters/${character_id}`, ctx.token);
            if (typeof char.data === 'string') {
                try { char.data = JSON.parse(char.data); } catch {}
            }
            const data = { ...char.data };
            const fieldKey = field === 'notes' ? 'notes' : 'inventory_other';
            const existing = data[fieldKey] || '';
            data[fieldKey] = existing ? `${existing}\n${text}` : text;

            await apiCall(`/api/characters/${character_id}`, ctx.token, {
                method: 'PUT',
                body: { name: char.name, data, system: char.system || 'aedelore' }
            });

            return { message: `Added to ${field}: "${text}"` };
        }
    },

    // ── Relationships ──
    {
        name: 'update_relationships',
        description: 'Update NPC relationships on the character sheet. Replaces the entire relationship list — always include existing relationships plus new ones.',
        input_schema: {
            type: 'object',
            properties: {
                character_id: { type: 'number', description: 'Character ID' },
                relationships: {
                    type: 'array',
                    description: 'Full array of relationships (replaces all existing)',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string', description: 'NPC name' },
                            relation: { type: 'string', description: 'Relation type (Ally, Rival, Mentor, Enemy, etc.)' },
                            notes: { type: 'string', description: 'Notes about this relationship' }
                        },
                        required: ['name']
                    }
                }
            },
            required: ['character_id', 'relationships']
        },
        execute: async ({ character_id, relationships }, ctx) => {
            const char = await apiCall(`/api/characters/${character_id}`, ctx.token);
            if (typeof char.data === 'string') {
                try { char.data = JSON.parse(char.data); } catch {}
            }
            const data = { ...char.data };
            data.relationships = relationships;

            await apiCall(`/api/characters/${character_id}`, ctx.token, {
                method: 'PUT',
                body: { name: char.name, data, system: char.system || 'aedelore' }
            });

            return { message: `Updated ${relationships.length} relationships: ${relationships.map(r => r.name).join(', ')}` };
        }
    },

    // ── Game Data (served via wiki/static) ──
    {
        name: 'get_game_data',
        description: 'Get Aedelore game data: weapons, armor, shields, spells, races, classes, religions, npc_names',
        input_schema: {
            type: 'object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['weapons', 'armor', 'shields', 'spells', 'races', 'classes', 'religions', 'npc_names'],
                    description: 'Type of game data'
                }
            },
            required: ['type']
        },
        execute: async ({ type }, ctx) => {
            // Load from the game data files mounted in the container
            return loadGameData(type);
        }
    },

    // ── World Lore ──
    {
        name: 'get_world_lore',
        description: 'Get Aedelore world lore: world locations, bestiary, history, religion, organizations, nature, artifacts. Use "all_basics" for a quick overview.',
        input_schema: {
            type: 'object',
            properties: {
                topic: {
                    type: 'string',
                    enum: ['world', 'bestiary', 'lore', 'religion', 'organizations', 'nature', 'artifacts', 'all_basics'],
                    description: 'Lore topic'
                }
            },
            required: ['topic']
        },
        execute: async ({ topic }, ctx) => {
            return loadLorePage(topic);
        }
    },

    // ── Rules ──
    {
        name: 'get_rules',
        description: 'Get Aedelore game rules: dice system, combat, defense options, healing, status effects, resources, character creation.',
        input_schema: {
            type: 'object',
            properties: {},
            required: []
        },
        execute: async (_, ctx) => {
            return loadLorePage('rules');
        }
    },

    // ── Party ──
    {
        name: 'get_party',
        description: 'Get other characters in the same campaign as your character.',
        input_schema: {
            type: 'object',
            properties: {
                character_id: { type: 'number', description: 'Character ID' }
            },
            required: ['character_id']
        },
        execute: async ({ character_id }, ctx) => {
            return apiCall(`/api/characters/${character_id}/party`, ctx.token);
        }
    },

    // ── Search Sessions ──
    {
        name: 'search_sessions',
        description: 'Search across all sessions in a campaign for NPCs, places, items, or text.',
        input_schema: {
            type: 'object',
            properties: {
                campaign_id: { type: 'number', description: 'Campaign ID' },
                query: { type: 'string', description: 'Search term' }
            },
            required: ['campaign_id', 'query']
        },
        execute: async ({ campaign_id, query }, ctx) => {
            const sessions = await apiCall(`/api/sessions/campaign/${campaign_id}`, ctx.token);
            if (!sessions?.length) return { message: 'No sessions found.' };

            const results = [];
            // Split query into words for OR matching (matches if ANY word is found)
            const words = query.toLowerCase().split(/\s+/).filter(w => w.length >= 2);
            if (words.length === 0) return { message: 'Query too short.' };

            function matchesAny(text) {
                const lower = text.toLowerCase();
                return words.some(w => lower.includes(w));
            }

            for (const s of sessions) {
                try {
                    const full = await apiCall(`/api/sessions/${s.id}`, ctx.token);
                    const data = full.data || {};
                    const matches = [];

                    // Search hook/summary
                    if (data.hook && matchesAny(data.hook)) {
                        matches.push({ type: 'hook', text: data.hook.substring(0, 300) });
                    }
                    if (data.sessionNotes?.summary && matchesAny(data.sessionNotes.summary)) {
                        matches.push({ type: 'summary', text: data.sessionNotes.summary.substring(0, 300) });
                    }
                    // Search NPCs
                    for (const npc of (data.npcs || [])) {
                        if (matchesAny(JSON.stringify(npc))) {
                            matches.push({ type: 'npc', name: npc.name, role: npc.role, description: (npc.description || '').substring(0, 150), disposition: npc.disposition });
                        }
                    }
                    // Search places
                    for (const place of (data.places || [])) {
                        if (matchesAny(JSON.stringify(place))) {
                            matches.push({ type: 'place', name: place.name, description: (place.description || '').substring(0, 150) });
                        }
                    }
                    // Search encounters
                    for (const enc of (data.encounters || [])) {
                        if (matchesAny(JSON.stringify(enc))) {
                            matches.push({ type: 'encounter', name: enc.name, location: enc.location, status: enc.status });
                        }
                    }
                    // Search events
                    for (const evt of (data.eventLog || [])) {
                        if (matchesAny(evt.text || '')) {
                            matches.push({ type: 'event', text: evt.text });
                        }
                    }
                    // Search turning points
                    for (const tp of (data.turningPoints || [])) {
                        if (matchesAny(tp.description || '')) {
                            matches.push({ type: 'turning_point', description: tp.description, consequence: tp.consequence });
                        }
                    }

                    if (matches.length > 0) {
                        results.push({ session: full.session_number, id: full.id, location: full.location, matches });
                    }
                } catch {}
            }

            return results.length > 0 ? results : { message: `No matches for "${query}". Try simpler/shorter search terms (single words work best).` };
        }
    },

    // ── DM Tools (character management) ──

    {
        name: 'set_character_locks',
        description: 'Lock or unlock character sheet sections (race/class, attributes, abilities). Use to unlock sections so the player can edit them, or lock after setup is complete.',
        input_schema: {
            type: 'object',
            properties: {
                character_id: { type: 'number', description: 'Character ID' },
                race_class_locked: { type: 'boolean', description: 'Lock/unlock race & class section' },
                attributes_locked: { type: 'boolean', description: 'Lock/unlock attributes section' },
                abilities_locked: { type: 'boolean', description: 'Lock/unlock abilities section' }
            },
            required: ['character_id']
        },
        execute: async ({ character_id, race_class_locked, attributes_locked, abilities_locked }, ctx) => {
            const body = {};
            if (typeof race_class_locked === 'boolean') body.race_class_locked = race_class_locked;
            if (typeof attributes_locked === 'boolean') body.attributes_locked = attributes_locked;
            if (typeof abilities_locked === 'boolean') body.abilities_locked = abilities_locked;
            return apiCall(`/api/dm/characters/${character_id}/set-locks`, ctx.token, {
                method: 'POST',
                body
            });
        }
    },
    {
        name: 'give_xp',
        description: 'Award XP to a character after combat, exploration, or story milestones.',
        input_schema: {
            type: 'object',
            properties: {
                character_id: { type: 'number', description: 'Character ID' },
                amount: { type: 'number', description: 'XP amount to award (1-10000)' }
            },
            required: ['character_id', 'amount']
        },
        execute: async ({ character_id, amount }, ctx) => {
            return apiCall(`/api/dm/characters/${character_id}/give-xp`, ctx.token, {
                method: 'POST',
                body: { amount }
            });
        }
    },
    {
        name: 'give_item',
        description: 'Give a quest item to a character. Use for story-important items, keys, artifacts, letters, etc.',
        input_schema: {
            type: 'object',
            properties: {
                character_id: { type: 'number', description: 'Character ID' },
                name: { type: 'string', description: 'Item name' },
                description: { type: 'string', description: 'Item description' }
            },
            required: ['character_id', 'name']
        },
        execute: async ({ character_id, name, description }, ctx) => {
            const body = { name };
            if (description) body.description = description;
            return apiCall(`/api/dm/characters/${character_id}/give-item`, ctx.token, {
                method: 'POST',
                body
            });
        }
    },
    {
        name: 'remove_item',
        description: 'Remove a quest item from a character. Use when an item is consumed, destroyed, or given away.',
        input_schema: {
            type: 'object',
            properties: {
                character_id: { type: 'number', description: 'Character ID' },
                name: { type: 'string', description: 'Exact item name to remove' }
            },
            required: ['character_id', 'name']
        },
        execute: async ({ character_id, name }, ctx) => {
            return apiCall(`/api/dm/characters/${character_id}/remove-item`, ctx.token, {
                method: 'POST',
                body: { name }
            });
        }
    },
    {
        name: 'get_session_history',
        description: 'Get all sessions for a campaign formatted as readable context. Use to understand what happened in previous sessions.',
        input_schema: {
            type: 'object',
            properties: {
                campaign_id: { type: 'number', description: 'Campaign ID' }
            },
            required: ['campaign_id']
        },
        execute: async ({ campaign_id }, ctx) => {
            const sessions = await apiCall(`/api/sessions/campaign/${campaign_id}`, ctx.token);
            if (!sessions?.length) return { message: 'No sessions found.' };

            const history = [];
            for (const s of sessions) {
                try {
                    const full = await apiCall(`/api/sessions/${s.id}`, ctx.token);
                    const data = full.data || {};
                    const entry = {
                        session: full.session_number,
                        id: full.id,
                        date: full.date,
                        location: full.location
                    };
                    if (data.hook) entry.hook = data.hook;
                    if (data.sessionNotes?.summary) entry.summary = data.sessionNotes.summary;
                    if (data.sessionNotes?.followUp) entry.followUp = data.sessionNotes.followUp;
                    if (data.eventLog?.length) entry.events = data.eventLog.map(e => e.text);
                    if (data.turningPoints?.length) entry.turningPoints = data.turningPoints.map(tp => ({ description: tp.description, consequence: tp.consequence }));
                    history.push(entry);
                } catch {}
            }
            return history;
        }
    },

    // ── Campaign management ──

    {
        name: 'create_campaign',
        description: 'Create a new campaign for the player. Use when the player wants to start a new campaign.',
        input_schema: {
            type: 'object',
            properties: {
                name: { type: 'string', description: 'Campaign name (1-100 characters)' },
                description: { type: 'string', description: 'Campaign description (max 2000 characters)' }
            },
            required: ['name']
        },
        execute: async ({ name, description }, ctx) => {
            const body = { name };
            if (description) body.description = description;
            return apiCall('/api/campaigns', ctx.token, {
                method: 'POST',
                body
            });
        }
    },

    // ── Session management tools (for saving solo adventure progress) ──

    {
        name: 'create_session',
        description: 'Create a new session in a campaign. Use this when starting a solo adventure to log events and progress.',
        input_schema: {
            type: 'object',
            properties: {
                campaign_id: { type: 'number', description: 'Campaign ID' },
                date: { type: 'string', description: 'Session date (YYYY-MM-DD), defaults to today' },
                location: { type: 'string', description: 'Starting location name' },
                hook: { type: 'string', description: 'Session hook/goal summary' }
            },
            required: ['campaign_id']
        },
        execute: async ({ campaign_id, date, location, hook }, ctx) => {
            const today = new Date().toISOString().split('T')[0];
            const body = {
                date: date || today,
                location: location || '',
                data: {}
            };
            if (hook) body.data.hook = hook;
            return apiCall('/api/sessions/campaign/' + campaign_id, ctx.token, {
                method: 'POST',
                body
            });
        }
    },
    {
        name: 'update_session',
        description: 'Update a session with new data. Use to save hook, summary, or session notes.',
        input_schema: {
            type: 'object',
            properties: {
                session_id: { type: 'number', description: 'Session ID' },
                location: { type: 'string', description: 'Session location' },
                hook: { type: 'string', description: 'Session hook/goal' },
                summary: { type: 'string', description: 'Session summary text' },
                follow_up: { type: 'string', description: 'Follow-up notes for next session' }
            },
            required: ['session_id']
        },
        execute: async ({ session_id, location, hook, summary, follow_up }, ctx) => {
            // Fetch current session, merge
            const session = await apiCall('/api/sessions/' + session_id, ctx.token);
            const data = session.data || {};
            if (hook) data.hook = hook;
            if (!data.sessionNotes) data.sessionNotes = {};
            if (summary) data.sessionNotes.summary = summary;
            if (follow_up) data.sessionNotes.followUp = follow_up;
            const body = {
                session_number: session.session_number,
                date: session.date,
                location: location || session.location,
                data
            };
            return apiCall('/api/sessions/' + session_id, ctx.token, {
                method: 'PUT',
                body
            });
        }
    },
    {
        name: 'add_event',
        description: 'Add an event log entry to a session. Use to record what happened during the adventure.',
        input_schema: {
            type: 'object',
            properties: {
                session_id: { type: 'number', description: 'Session ID' },
                text: { type: 'string', description: 'Event description — be specific, e.g. "Aelindra cast Ice Knife for 6 damage"' }
            },
            required: ['session_id', 'text']
        },
        execute: async ({ session_id, text }, ctx) => {
            const session = await apiCall('/api/sessions/' + session_id, ctx.token);
            const data = session.data || {};
            if (!data.eventLog) data.eventLog = [];
            const now = new Date();
            const timestamp = now.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
            data.eventLog.push({ timestamp, text, visibleTo: 'all' });
            await apiCall('/api/sessions/' + session_id, ctx.token, {
                method: 'PUT',
                body: {
                    session_number: session.session_number,
                    date: session.date,
                    location: session.location,
                    data
                }
            });
            return { message: 'Event added: "' + text + '"' };
        }
    },
    {
        name: 'add_turning_point',
        description: 'Add a major turning point/decision to a session. Use for significant story moments.',
        input_schema: {
            type: 'object',
            properties: {
                session_id: { type: 'number', description: 'Session ID' },
                description: { type: 'string', description: 'What happened' },
                consequence: { type: 'string', description: 'What this leads to' }
            },
            required: ['session_id', 'description']
        },
        execute: async ({ session_id, description, consequence }, ctx) => {
            const session = await apiCall('/api/sessions/' + session_id, ctx.token);
            const data = session.data || {};
            if (!data.turningPoints) data.turningPoints = [];
            data.turningPoints.push({ description, consequence: consequence || '', visibleTo: 'all' });
            await apiCall('/api/sessions/' + session_id, ctx.token, {
                method: 'PUT',
                body: {
                    session_number: session.session_number,
                    date: session.date,
                    location: session.location,
                    data
                }
            });
            return { message: 'Turning point added: "' + description + '"' };
        }
    },
    {
        name: 'save_adventure_progress',
        description: 'Save the current solo adventure progress. Creates a session summary with events, NPCs met, items found, and story progress. Call this when the player asks to save, or when the adventure reaches a natural stopping point.',
        input_schema: {
            type: 'object',
            properties: {
                session_id: { type: 'number', description: 'Session ID (if already created)' },
                campaign_id: { type: 'number', description: 'Campaign ID (if no session exists yet)' },
                summary: { type: 'string', description: 'Summary of what happened in the adventure so far' },
                location: { type: 'string', description: 'Current location where the character is' },
                npcs_met: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            role: { type: 'string' },
                            description: { type: 'string' },
                            disposition: { type: 'string' }
                        },
                        required: ['name']
                    },
                    description: 'NPCs encountered during the adventure'
                },
                events: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'List of key events that happened'
                },
                turning_points: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            description: { type: 'string' },
                            consequence: { type: 'string' }
                        },
                        required: ['description']
                    },
                    description: 'Major decisions/turning points'
                }
            },
            required: []
        },
        execute: async (input, ctx) => {
            let sessionId = input.session_id;

            // Create session if needed
            if (!sessionId && input.campaign_id) {
                const today = new Date().toISOString().split('T')[0];
                const result = await apiCall('/api/sessions/campaign/' + input.campaign_id, ctx.token, {
                    method: 'POST',
                    body: {
                        date: today,
                        location: input.location || '',
                        data: { hook: input.summary || 'Solo adventure' }
                    }
                });
                sessionId = result.id;
            }

            if (!sessionId) return { error: 'No session_id or campaign_id provided' };

            // Fetch and update session
            const session = await apiCall('/api/sessions/' + sessionId, ctx.token);
            const data = session.data || {};

            // Update summary
            if (input.summary) {
                if (!data.sessionNotes) data.sessionNotes = {};
                data.sessionNotes.summary = input.summary;
            }

            // Add NPCs
            if (input.npcs_met && input.npcs_met.length > 0) {
                if (!data.npcs) data.npcs = [];
                const existingNames = data.npcs.map(n => n.name);
                for (const npc of input.npcs_met) {
                    if (!existingNames.includes(npc.name)) {
                        data.npcs.push({
                            name: npc.name,
                            role: npc.role || '',
                            description: npc.description || '',
                            disposition: npc.disposition || 'neutral',
                            day: 1,
                            time: 'morning',
                            plannedLocation: '',
                            actualLocation: '',
                            status: 'used',
                            notes: ''
                        });
                    }
                }
            }

            // Add events
            if (input.events && input.events.length > 0) {
                if (!data.eventLog) data.eventLog = [];
                const now = new Date();
                const timestamp = now.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
                for (const evt of input.events) {
                    data.eventLog.push({ timestamp, text: evt, visibleTo: 'all' });
                }
            }

            // Add turning points
            if (input.turning_points && input.turning_points.length > 0) {
                if (!data.turningPoints) data.turningPoints = [];
                for (const tp of input.turning_points) {
                    data.turningPoints.push({
                        description: tp.description,
                        consequence: tp.consequence || '',
                        visibleTo: 'all'
                    });
                }
            }

            await apiCall('/api/sessions/' + sessionId, ctx.token, {
                method: 'PUT',
                body: {
                    session_number: session.session_number,
                    date: session.date,
                    location: input.location || session.location,
                    data
                }
            });

            const counts = [];
            if (input.summary) counts.push('summary');
            if (input.npcs_met?.length) counts.push(input.npcs_met.length + ' NPCs');
            if (input.events?.length) counts.push(input.events.length + ' events');
            if (input.turning_points?.length) counts.push(input.turning_points.length + ' turning points');

            return {
                message: 'Adventure saved! Session ID: ' + sessionId + '. Saved: ' + (counts.join(', ') || 'session updated'),
                session_id: sessionId
            };
        }
    }
];

// ── Game data loading (from container-mounted /game-data) ──

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const DATA_DIR = process.env.GAME_DATA_DIR || '/app/game-data';
const LORE_DIR = process.env.LORE_DIR || '/app/lore-pages';

// Cache loaded data
const gameDataCache = {};
const loreCache = {};

// Strip HTML to markdown-like text (matches MCP server logic)
function stripHtml(html) {
    let text = html.replace(/<script[\s\S]*?<\/script>/gi, '');
    text = text.replace(/<style[\s\S]*?<\/style>/gi, '');
    text = text.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n');
    text = text.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n');
    text = text.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n');
    text = text.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n');
    text = text.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    text = text.replace(/<\/?(p|div|br|tr|section)[^>]*>/gi, '\n');
    text = text.replace(/<[^>]+>/g, '');
    text = text.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ');
    text = text.replace(/\n{3,}/g, '\n\n').trim();
    return text;
}

function loadGameData(type) {
    if (gameDataCache[type]) return gameDataCache[type];

    const fileMap = {
        weapons: ['weapons.js', 'WEAPONS_DATA'],
        armor: ['armor.js', 'ARMOR_DATA'],
        shields: ['armor.js', 'SHIELD_DATA'],
        spells: ['spells.js', 'SPELLS_BY_CLASS'],
        races: ['races.js', 'RACES'],
        classes: ['classes.js', 'CLASSES'],
        religions: ['religions.js', 'RELIGIONS'],
        npc_names: ['npc-names.js', 'NPC_NAMES']
    };

    const entry = fileMap[type];
    if (!entry) return { error: `Unknown game data type: ${type}` };

    try {
        const filePath = path.join(DATA_DIR, entry[0]);
        const content = fs.readFileSync(filePath, 'utf-8');
        const wrapped = `${content};\ntypeof ${entry[1]} !== 'undefined' ? ${entry[1]} : undefined;`;
        const script = new vm.Script(wrapped, { filename: entry[0], timeout: 2000 });
        const result = script.runInNewContext({}, { timeout: 2000 });
        if (result !== undefined) {
            gameDataCache[type] = result;
            return result;
        }
        return { error: `Could not find ${entry[1]} in ${entry[0]}` };
    } catch (err) {
        return { error: `Failed to load ${type}: ${err.message}` };
    }
}

function loadLorePage(topic) {
    if (topic === 'all_basics') {
        const races = loadGameData('races');
        const classes = loadGameData('classes');
        const religions = loadGameData('religions');
        let text = '# AEDELORE WORLD BASICS\n\n';
        text += '## Races\n' + JSON.stringify(races, null, 2) + '\n\n';
        text += '## Classes\n' + JSON.stringify(classes, null, 2) + '\n\n';
        text += '## Religions\n' + JSON.stringify(religions, null, 2) + '\n\n';
        const world = loadLorePage('world');
        if (typeof world === 'string') {
            text += '## World (Key Locations)\n' + world.substring(0, 8000) + '\n';
        }
        return text;
    }

    if (loreCache[topic]) return loreCache[topic];

    // Lore files are HTML — strip to text (matches MCP server logic)
    const fileMap = {
        world: 'world.html',
        bestiary: 'bestiary.html',
        lore: 'lore.html',
        religion: 'religion.html',
        organizations: 'organizations.html',
        nature: 'nature.html',
        artifacts: 'artifacts.html',
        rules: 'index.html'  // Rules are in index.html
    };

    const file = fileMap[topic];
    if (!file) return { error: `Unknown lore topic: ${topic}` };

    try {
        const filePath = path.join(LORE_DIR, file);
        const html = fs.readFileSync(filePath, 'utf-8');
        const text = stripHtml(html);
        loreCache[topic] = text;
        return text;
    } catch (err) {
        return { error: `Lore topic "${topic}" not found: ${err.message}` };
    }
}

// ── Character summary formatter ──

function formatCharacterSummary(char) {
    const d = char.data || {};
    let summary = `# ${d.character_name || char.name || 'Unnamed'}\n`;
    summary += `**Race:** ${d.race || 'Not set'} | **Class:** ${d.class || 'Not set'}`;
    if (d.religion) summary += ` | **Religion:** ${d.religion}`;
    summary += '\n';

    summary += `**Locks:** Race/Class: ${char.race_class_locked ? 'LOCKED' : 'unlocked'} | Attributes: ${char.attributes_locked ? 'LOCKED' : 'unlocked'} | Abilities: ${char.abilities_locked ? 'LOCKED' : 'unlocked'}\n`;

    summary += `\n**HP:** ${d.hp_slider || 0} | **Arcana:** ${d.arcana_slider || 0} | **Willpower:** ${d.willpower_slider || 0}/3 | **Worthiness:** ${d.worthiness_slider || 0} | **Bleed:** ${d.bleed_slider || 0} | **Weakened:** ${d.weakened_slider || 0}\n`;

    if (d.strength_value || d.dexterity_value) {
        summary += `**Attributes:** STR:${d.strength_value || 0} DEX:${d.dexterity_value || 0} TOU:${d.toughness_value || 0} INT:${d.intelligence_value || 0} WIS:${d.wisdom_value || 0} FOW:${d.force_of_will_value || 0} TE:${d.third_eye_value || 0}\n`;
    }

    for (let i = 1; i <= 3; i++) {
        const wType = d['weapon_' + i + '_type'];
        if (wType) {
            const wAtk = d['weapon_' + i + '_atk'] || '?';
            const wDmg = d['weapon_' + i + '_dmg'] || '?';
            summary += '**Weapon ' + i + ':** ' + wType + ' (ATK:' + wAtk + ' DMG:' + wDmg + ')\n';
        }
    }

    const armorSlots = { 1: 'Head', 2: 'Shoulders', 3: 'Chest', 4: 'Hands', 5: 'Legs' };
    for (const [slot, label] of Object.entries(armorSlots)) {
        const aType = d['armor_' + slot + '_type'];
        if (aType) {
            const aCurrentHp = d['armor_' + slot + '_current_hp'];
            const aHp = d['armor_' + slot + '_hp'];
            const hpDisplay = (aCurrentHp ?? aHp) || '?';
            summary += '**Armor ' + label + ':** ' + aType + ' (HP:' + hpDisplay + '/' + (aHp || '?') + ')\n';
        }
    }

    if (d.shield_type) {
        const sHpDisplay = (d.shield_current_hp ?? d.shield_hp) || '?';
        summary += '**Shield:** ' + d.shield_type + ' (HP:' + sHpDisplay + '/' + (d.shield_hp || '?') + ')\n';
    }

    for (let i = 1; i <= 10; i++) {
        const aName = d['ability_' + i + '_name'];
        if (aName) {
            summary += '**Ability ' + i + ':** ' + aName;
            const aArcana = d['ability_' + i + '_arcana'];
            if (aArcana) summary += ' (Arcana: ' + aArcana + ')';
            summary += '\n';
        }
    }

    summary += `\n**Gold:** ${d.gold || 0} | **Silver:** ${d.silver || 0} | **Copper:** ${d.copper || 0}\n`;

    const potions = [];
    if (d.pot_adrenaline) potions.push(`Adrenaline: ${d.pot_adrenaline}`);
    if (d.pot_antidote) potions.push(`Antidote: ${d.pot_antidote}`);
    if (d.pot_poison) potions.push(`Poison: ${d.pot_poison}`);
    if (d.pot_arcane) potions.push(`Arcane Elixir: ${d.pot_arcane}`);
    if (potions.length > 0) summary += `**Potions:** ${potions.join(', ')}\n`;

    if (d.notes) summary += `\n**Notes:** ${d.notes}\n`;

    if (d.relationships?.length > 0) {
        summary += `\n**Relationships:**\n`;
        for (const r of d.relationships) {
            summary += `- ${r.name}${r.relation ? ` (${r.relation})` : ''}${r.notes ? `: ${r.notes}` : ''}\n`;
        }
    }

    return summary;
}

// Find a tool by name
function getTool(name) {
    return TOOLS.find(t => t.name === name);
}

// Get all tool definitions (for sending to LLM)
function getToolDefinitions() {
    return TOOLS.map(t => ({
        name: t.name,
        description: t.description,
        input_schema: t.input_schema
    }));
}

// Execute a tool
async function executeTool(name, input, context) {
    const tool = getTool(name);
    if (!tool) throw new Error(`Unknown tool: ${name}`);
    return tool.execute(input, context);
}

module.exports = { getToolDefinitions, executeTool, getTool, TOOLS, formatCharacterSummary };
