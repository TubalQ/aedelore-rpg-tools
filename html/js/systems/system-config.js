// ===========================================
// SYSTEM CONFIGURATION - Multi-System RPG Character Sheet
// ===========================================

const SYSTEM_CONFIGS = {
    // -------------------------------------------
    // AEDELORE (default - existing system)
    // -------------------------------------------
    aedelore: {
        id: 'aedelore',
        name: 'Aedelore',
        description: 'Fantasy RPG med D10-system',
        icon: '🎲',
        color: '#a855f7', // Purple
        rulesUrl: 'https://wiki.aedelore.nu/books/miscs-of-aedelore/chapter/rules',
        dice: {
            primary: 'd10',
            pool: true,
            successThreshold: 6,
            criticalThreshold: 10
        },
        // Aedelore uses the existing character-sheet.html without modifications
        useExistingSheet: true
    },

    // -------------------------------------------
    // D&D 5th Edition
    // -------------------------------------------
    dnd5e: {
        id: 'dnd5e',
        name: 'D&D 5th Edition',
        description: 'Dungeons & Dragons d20-system',
        icon: '🐉',
        color: '#ff5757', // Red
        rulesUrl: 'https://5e.d20srd.org/',
        dice: {
            primary: 'd20',
            pool: false,
            modifier: true
        },
        attributes: [
            { id: 'strength', name: 'Strength', abbr: 'STR' },
            { id: 'dexterity', name: 'Dexterity', abbr: 'DEX' },
            { id: 'constitution', name: 'Constitution', abbr: 'CON' },
            { id: 'intelligence', name: 'Intelligence', abbr: 'INT' },
            { id: 'wisdom', name: 'Wisdom', abbr: 'WIS' },
            { id: 'charisma', name: 'Charisma', abbr: 'CHA' }
        ],
        skills: {
            strength: ['Athletics'],
            dexterity: ['Acrobatics', 'Sleight of Hand', 'Stealth'],
            constitution: [],
            intelligence: ['Arcana', 'History', 'Investigation', 'Nature', 'Religion'],
            wisdom: ['Animal Handling', 'Insight', 'Medicine', 'Perception', 'Survival'],
            charisma: ['Deception', 'Intimidation', 'Performance', 'Persuasion']
        },
        savingThrows: ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'],
        combatStats: [
            { id: 'hp_current', name: 'Current HP', type: 'number' },
            { id: 'hp_max', name: 'Max HP', type: 'number' },
            { id: 'hp_temp', name: 'Temp HP', type: 'number' },
            { id: 'ac', name: 'Armor Class', type: 'number' },
            { id: 'initiative', name: 'Initiative', type: 'number', derived: 'dexterity_mod' },
            { id: 'speed', name: 'Speed', type: 'text', default: '30 ft' },
            { id: 'proficiency', name: 'Proficiency Bonus', type: 'number', default: 2 },
            { id: 'passive_perception', name: 'Passive Perception', type: 'number', derived: '10 + perception' }
        ],
        hitDice: ['d6', 'd8', 'd10', 'd12'],
        deathSaves: { successes: 3, failures: 3 },
        spellSlots: [1, 2, 3, 4, 5, 6, 7, 8, 9],
        spellStats: ['spell_dc', 'spell_attack', 'spellcasting_ability'],
        conditions: [
            'Blinded', 'Charmed', 'Deafened', 'Frightened', 'Grappled',
            'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified', 'Poisoned',
            'Prone', 'Restrained', 'Stunned', 'Unconscious'
        ],
        exhaustionLevels: 6,
        inspiration: true,
        classes: [
            'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter', 'Monk',
            'Paladin', 'Ranger', 'Rogue', 'Sorcerer', 'Warlock', 'Wizard'
        ],
        races: [
            'Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome', 'Half-Elf',
            'Half-Orc', 'Tiefling', 'Dragonborn'
        ]
    },

    // -------------------------------------------
    // Pathfinder 2nd Edition
    // -------------------------------------------
    pathfinder2e: {
        id: 'pathfinder2e',
        name: 'Pathfinder 2e',
        description: 'Paizos d20-system med degrees of success',
        icon: '⚔️',
        color: '#3b9eff', // Blue
        rulesUrl: 'https://2e.aonprd.com/',
        dice: {
            primary: 'd20',
            pool: false,
            modifier: true,
            degreesOfSuccess: true // crit fail, fail, success, crit success
        },
        attributes: [
            { id: 'strength', name: 'Strength', abbr: 'STR' },
            { id: 'dexterity', name: 'Dexterity', abbr: 'DEX' },
            { id: 'constitution', name: 'Constitution', abbr: 'CON' },
            { id: 'intelligence', name: 'Intelligence', abbr: 'INT' },
            { id: 'wisdom', name: 'Wisdom', abbr: 'WIS' },
            { id: 'charisma', name: 'Charisma', abbr: 'CHA' }
        ],
        skills: {
            strength: ['Athletics'],
            dexterity: ['Acrobatics', 'Stealth', 'Thievery'],
            constitution: [],
            intelligence: ['Arcana', 'Crafting', 'Lore', 'Occultism', 'Society'],
            wisdom: ['Medicine', 'Nature', 'Religion', 'Survival'],
            charisma: ['Deception', 'Diplomacy', 'Intimidation', 'Performance']
        },
        proficiencyRanks: [
            { id: 'untrained', name: 'Untrained', bonus: 0 },
            { id: 'trained', name: 'Trained', bonus: 2 },
            { id: 'expert', name: 'Expert', bonus: 4 },
            { id: 'master', name: 'Master', bonus: 6 },
            { id: 'legendary', name: 'Legendary', bonus: 8 }
        ],
        savingThrows: [
            { id: 'fortitude', name: 'Fortitude', attribute: 'constitution' },
            { id: 'reflex', name: 'Reflex', attribute: 'dexterity' },
            { id: 'will', name: 'Will', attribute: 'wisdom' }
        ],
        combatStats: [
            { id: 'hp_current', name: 'Current HP', type: 'number' },
            { id: 'hp_max', name: 'Max HP', type: 'number' },
            { id: 'ac', name: 'Armor Class', type: 'number' },
            { id: 'perception', name: 'Perception', type: 'number' },
            { id: 'speed', name: 'Speed', type: 'text', default: '25 ft' },
            { id: 'class_dc', name: 'Class DC', type: 'number' },
            { id: 'hero_points', name: 'Hero Points', type: 'slider', min: 0, max: 3 }
        ],
        spellStats: ['spell_dc', 'spell_attack'],
        resistances: true,
        immunities: true,
        weaknesses: true
    },

    // -------------------------------------------
    // Storyteller System (Classic World of Darkness)
    // -------------------------------------------
    storyteller: {
        id: 'storyteller',
        name: 'Storyteller (Classic WoD)',
        description: 'Vampire, Werewolf, Mage - d10 dice pool',
        icon: '🧛',
        color: '#8b0000', // Dark red
        rulesUrl: 'https://whitewolf.fandom.com/wiki/Storyteller_System',
        dice: {
            primary: 'd10',
            pool: true,
            difficulty: { min: 6, max: 9, default: 6 },
            successOn: 'difficulty+',
            botchOn: 1
        },
        // 3x3 Attribute Matrix
        attributeCategories: ['Physical', 'Social', 'Mental'],
        attributeTypes: ['Power', 'Finesse', 'Resistance'],
        attributes: [
            // Physical
            { id: 'strength', name: 'Strength', category: 'Physical', type: 'Power' },
            { id: 'dexterity', name: 'Dexterity', category: 'Physical', type: 'Finesse' },
            { id: 'stamina', name: 'Stamina', category: 'Physical', type: 'Resistance' },
            // Social
            { id: 'charisma', name: 'Charisma', category: 'Social', type: 'Power' },
            { id: 'manipulation', name: 'Manipulation', category: 'Social', type: 'Finesse' },
            { id: 'appearance', name: 'Appearance', category: 'Social', type: 'Resistance' },
            // Mental
            { id: 'intelligence', name: 'Intelligence', category: 'Mental', type: 'Power' },
            { id: 'wits', name: 'Wits', category: 'Mental', type: 'Finesse' },
            { id: 'perception', name: 'Perception', category: 'Mental', type: 'Resistance' }
        ],
        abilityCategories: {
            talents: [
                'Alertness', 'Athletics', 'Awareness', 'Brawl', 'Empathy',
                'Expression', 'Intimidation', 'Leadership', 'Streetwise', 'Subterfuge'
            ],
            skills: [
                'Animal Ken', 'Crafts', 'Drive', 'Etiquette', 'Firearms',
                'Larceny', 'Melee', 'Performance', 'Stealth', 'Survival'
            ],
            knowledges: [
                'Academics', 'Computer', 'Finance', 'Investigation', 'Law',
                'Medicine', 'Occult', 'Politics', 'Science', 'Technology'
            ]
        },
        // Dots system (1-5)
        maxDots: 5,
        combatStats: [
            { id: 'willpower_permanent', name: 'Willpower (Permanent)', type: 'dots', max: 10 },
            { id: 'willpower_current', name: 'Willpower (Current)', type: 'boxes', max: 10 }
        ],
        healthLevels: [
            { name: 'Bruised', penalty: 0 },
            { name: 'Hurt', penalty: -1 },
            { name: 'Injured', penalty: -1 },
            { name: 'Wounded', penalty: -2 },
            { name: 'Mauled', penalty: -2 },
            { name: 'Crippled', penalty: -5 },
            { name: 'Incapacitated', penalty: null }
        ],
        virtues: [
            { id: 'conscience', name: 'Conscience/Conviction', max: 5 },
            { id: 'self_control', name: 'Self-Control/Instinct', max: 5 },
            { id: 'courage', name: 'Courage', max: 5 }
        ],
        morality: { id: 'humanity', name: 'Humanity/Path', max: 10 },
        resourcePool: { id: 'blood_pool', name: 'Blood Pool', max: 20 }, // Changes by splat
        backgrounds: [
            'Allies', 'Contacts', 'Fame', 'Generation', 'Herd',
            'Influence', 'Mentor', 'Resources', 'Retainers', 'Status'
        ]
    },

    // -------------------------------------------
    // Chronicles of Darkness (nWoD 2.0)
    // -------------------------------------------
    cod: {
        id: 'cod',
        name: 'Chronicles of Darkness',
        description: 'New World of Darkness 2.0 - d10 dice pool',
        icon: '🌙',
        color: '#1a1a2e', // Dark blue
        rulesUrl: 'https://whitewolf.fandom.com/wiki/Storytelling_System',
        dice: {
            primary: 'd10',
            pool: true,
            targetNumber: 8,
            tenAgain: true, // 10s explode
            exceptionalSuccess: 5 // 5+ successes
        },
        // 3x3 Attribute Matrix (different order than Storyteller)
        attributeCategories: ['Mental', 'Physical', 'Social'],
        attributeTypes: ['Power', 'Finesse', 'Resistance'],
        attributes: [
            // Mental
            { id: 'intelligence', name: 'Intelligence', category: 'Mental', type: 'Power' },
            { id: 'wits', name: 'Wits', category: 'Mental', type: 'Finesse' },
            { id: 'resolve', name: 'Resolve', category: 'Mental', type: 'Resistance' },
            // Physical
            { id: 'strength', name: 'Strength', category: 'Physical', type: 'Power' },
            { id: 'dexterity', name: 'Dexterity', category: 'Physical', type: 'Finesse' },
            { id: 'stamina', name: 'Stamina', category: 'Physical', type: 'Resistance' },
            // Social
            { id: 'presence', name: 'Presence', category: 'Social', type: 'Power' },
            { id: 'manipulation', name: 'Manipulation', category: 'Social', type: 'Finesse' },
            { id: 'composure', name: 'Composure', category: 'Social', type: 'Resistance' }
        ],
        skillCategories: {
            mental: [
                'Academics', 'Computer', 'Crafts', 'Investigation',
                'Medicine', 'Occult', 'Politics', 'Science'
            ],
            physical: [
                'Athletics', 'Brawl', 'Drive', 'Firearms',
                'Larceny', 'Stealth', 'Survival', 'Weaponry'
            ],
            social: [
                'Animal Ken', 'Empathy', 'Expression', 'Intimidation',
                'Persuasion', 'Socialize', 'Streetwise', 'Subterfuge'
            ]
        },
        // Dots system (1-5)
        maxDots: 5,
        // Derived stats (automatically calculated)
        derivedStats: [
            { id: 'willpower', name: 'Willpower', formula: 'resolve + composure' },
            { id: 'health', name: 'Health', formula: 'stamina + size' },
            { id: 'defense', name: 'Defense', formula: 'min(wits, dexterity) + athletics' },
            { id: 'initiative', name: 'Initiative', formula: 'dexterity + composure' },
            { id: 'speed', name: 'Speed', formula: 'strength + dexterity + 5' }
        ],
        combatStats: [
            { id: 'size', name: 'Size', type: 'number', default: 5 },
            { id: 'armor', name: 'Armor', type: 'text' }
        ],
        integrity: { id: 'integrity', name: 'Integrity', max: 10 },
        anchors: [
            { id: 'virtue', name: 'Virtue', type: 'text' },
            { id: 'vice', name: 'Vice', type: 'text' }
        ],
        beats: { id: 'beats', name: 'Beats', max: 4 },
        experiences: { id: 'experiences', name: 'Experiences', type: 'number' },
        conditions: true, // Freeform list
        tilts: true // Combat conditions
    }
};

// Helper function to get modifier from D&D/PF2e attribute score
function getModifier(score) {
    return Math.floor((score - 10) / 2);
}

// Helper function to format modifier with + or -
function formatModifier(mod) {
    return mod >= 0 ? `+${mod}` : `${mod}`;
}

// Export for use in other files
if (typeof window !== 'undefined') {
    window.SYSTEM_CONFIGS = SYSTEM_CONFIGS;
    window.getModifier = getModifier;
    window.formatModifier = formatModifier;
}
