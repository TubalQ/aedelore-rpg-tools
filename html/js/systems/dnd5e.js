// ===========================================
// D&D 5th Edition Character Sheet Renderer
// ===========================================

function renderDnD5eSheet(config) {
    return `
        <!-- OVERVIEW TAB -->
        <div class="tab-content active" id="system-overview" style="display: block;">
            <div class="system-dashboard dnd5e-dashboard">
                <!-- Character Summary -->
                <div class="dashboard-card character-summary">
                    <div class="summary-avatar" id="dnd-avatar">
                        <span class="avatar-initial">?</span>
                    </div>
                    <div class="summary-info">
                        <h2 class="summary-name" id="dnd-summary-name">New Character</h2>
                        <div class="summary-details">
                            <span id="dnd-summary-race">-</span>
                            <span id="dnd-summary-class">-</span>
                            <span class="summary-level">Lvl <span id="dnd-summary-level">1</span></span>
                        </div>
                    </div>
                    <div class="inspiration-toggle" title="Inspiration">
                        <input type="checkbox" id="dnd-overview-inspiration" onchange="syncDnDInspiration(this)">
                        <label for="dnd-overview-inspiration">✨</label>
                    </div>
                </div>

                <!-- Combat Stats Grid -->
                <div class="dashboard-row combat-row">
                    <div class="dashboard-stat hp-stat">
                        <div class="stat-label">HP</div>
                        <div class="stat-adjuster">
                            <button class="adj-btn" onclick="adjustDnDHP(-1)">−</button>
                            <span class="stat-value">
                                <span id="dnd-overview-hp">10</span>/<span id="dnd-overview-hp-max">10</span>
                            </span>
                            <button class="adj-btn" onclick="adjustDnDHP(1)">+</button>
                        </div>
                        <div class="temp-hp" id="dnd-temp-hp-display" style="display: none;">
                            +<span id="dnd-overview-temp-hp">0</span> temp
                        </div>
                    </div>
                    <div class="dashboard-stat">
                        <div class="stat-label">AC</div>
                        <div class="stat-value-large" id="dnd-overview-ac">10</div>
                    </div>
                    <div class="dashboard-stat">
                        <div class="stat-label">Init</div>
                        <div class="stat-value-large" id="dnd-overview-init">+0</div>
                    </div>
                    <div class="dashboard-stat">
                        <div class="stat-label">Speed</div>
                        <div class="stat-value-large" id="dnd-overview-speed">30</div>
                    </div>
                    <div class="dashboard-stat">
                        <div class="stat-label">Prof</div>
                        <div class="stat-value-large" id="dnd-overview-prof">+2</div>
                    </div>
                </div>

                <!-- Ability Scores -->
                <div class="dashboard-section">
                    <h3 class="section-header">Ability Scores</h3>
                    <div class="ability-grid">
                        ${config.attributes.map(attr => `
                            <div class="ability-card" onclick="rollDnDCheck('${attr.id}')">
                                <div class="ability-abbr">${attr.abbr}</div>
                                <div class="ability-mod" id="dnd-overview-mod-${attr.id}">+0</div>
                                <div class="ability-score" id="dnd-overview-score-${attr.id}">10</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Saving Throws -->
                <div class="dashboard-section">
                    <h3 class="section-header">Saving Throws</h3>
                    <div class="saves-grid grid grid-3">
                        ${config.attributes.map(attr => `
                            <div class="save-item" onclick="rollDnDSave('${attr.id}')">
                                <span class="save-prof" id="dnd-overview-save-prof-${attr.id}">○</span>
                                <span class="save-abbr">${attr.abbr}</span>
                                <span class="save-mod" id="dnd-overview-save-${attr.id}">+0</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Death Saves & Hit Dice -->
                <div class="dashboard-row">
                    <div class="dashboard-section compact">
                        <h3 class="section-header">Death Saves</h3>
                        <div class="death-saves-compact">
                            <div class="death-row">
                                <span class="death-label">✓</span>
                                <span class="death-boxes-compact" id="dnd-overview-death-success">○○○</span>
                            </div>
                            <div class="death-row">
                                <span class="death-label">✗</span>
                                <span class="death-boxes-compact" id="dnd-overview-death-fail">○○○</span>
                            </div>
                        </div>
                    </div>
                    <div class="dashboard-section compact">
                        <h3 class="section-header">Hit Dice</h3>
                        <div class="hit-dice-compact">
                            <span id="dnd-overview-hit-dice">-</span>
                        </div>
                    </div>
                </div>

                <!-- Spell Slots (if caster) -->
                <div class="dashboard-section spell-slots-section" id="dnd-spell-slots-overview">
                    <h3 class="section-header">Spell Slots</h3>
                    <div class="spell-slots-compact">
                        ${[1,2,3,4,5,6,7,8,9].map(level => `
                            <div class="slot-level-compact" id="dnd-slot-${level}-container" style="display: none;">
                                <span class="slot-lvl">${level}</span>
                                <span class="slot-boxes" id="dnd-overview-slots-${level}">-</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Conditions -->
                <div class="dashboard-section conditions-section">
                    <h3 class="section-header">Conditions</h3>
                    <div class="conditions-compact" id="dnd-overview-conditions">
                        <span class="no-conditions">None</span>
                    </div>
                    <div class="exhaustion-display" id="dnd-exhaustion-display" style="display: none;">
                        <span class="exhaustion-label">Exhaustion:</span>
                        <span class="exhaustion-level" id="dnd-overview-exhaustion">0</span>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="dashboard-section">
                    <h3 class="section-header">Quick Actions</h3>
                    <div class="quick-actions-grid">
                        <button class="quick-action-btn" onclick="rollDnDDice(20)">
                            <span class="action-icon">🎲</span>
                            <span class="action-label">d20</span>
                        </button>
                        <button class="quick-action-btn" onclick="dndShortRest()">
                            <span class="action-icon">☕</span>
                            <span class="action-label">Short Rest</span>
                        </button>
                        <button class="quick-action-btn" onclick="dndLongRest()">
                            <span class="action-icon">🛏️</span>
                            <span class="action-label">Long Rest</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- INFO TAB -->
        <div class="tab-content" id="system-info" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    Character Info
                </h2>
                <div class="grid-2">
                    <div class="field-group">
                        <label for="character_name">Character Name</label>
                        <input type="text" id="character_name" placeholder="Enter character name">
                    </div>
                    <div class="field-group">
                        <label for="player_name">Player Name</label>
                        <input type="text" id="player_name" placeholder="Enter player name">
                    </div>
                </div>
                <div class="grid-3">
                    <div class="field-group">
                        <label for="dnd_race">Race</label>
                        <select id="dnd_race">
                            <option value="">Select Race</option>
                            ${config.races.map(r => `<option value="${r}">${r}</option>`).join('')}
                        </select>
                    </div>
                    <div class="field-group">
                        <label for="dnd_class">Class</label>
                        <select id="dnd_class">
                            <option value="">Select Class</option>
                            ${config.classes.map(c => `<option value="${c}">${c}</option>`).join('')}
                        </select>
                    </div>
                    <div class="field-group">
                        <label for="dnd_level">Level</label>
                        <input type="number" id="dnd_level" min="1" max="20" value="1">
                    </div>
                </div>
                <div class="grid-3">
                    <div class="field-group">
                        <label for="dnd_background">Background</label>
                        <input type="text" id="dnd_background" placeholder="e.g., Soldier, Sage">
                    </div>
                    <div class="field-group">
                        <label for="dnd_alignment">Alignment</label>
                        <select id="dnd_alignment">
                            <option value="">Select Alignment</option>
                            <option value="LG">Lawful Good</option>
                            <option value="NG">Neutral Good</option>
                            <option value="CG">Chaotic Good</option>
                            <option value="LN">Lawful Neutral</option>
                            <option value="N">True Neutral</option>
                            <option value="CN">Chaotic Neutral</option>
                            <option value="LE">Lawful Evil</option>
                            <option value="NE">Neutral Evil</option>
                            <option value="CE">Chaotic Evil</option>
                        </select>
                    </div>
                    <div class="field-group">
                        <label for="dnd_xp">Experience Points</label>
                        <input type="number" id="dnd_xp" min="0" value="0">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"/><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"/></svg>
                    Character Details
                </h2>
                <div class="grid-2">
                    <div class="field-group">
                        <label for="dnd_personality">Personality Traits</label>
                        <textarea id="dnd_personality" rows="3" placeholder="Describe your character's personality..."></textarea>
                    </div>
                    <div class="field-group">
                        <label for="dnd_ideals">Ideals</label>
                        <textarea id="dnd_ideals" rows="3" placeholder="What does your character believe in?"></textarea>
                    </div>
                </div>
                <div class="grid-2">
                    <div class="field-group">
                        <label for="dnd_bonds">Bonds</label>
                        <textarea id="dnd_bonds" rows="3" placeholder="What ties your character to the world?"></textarea>
                    </div>
                    <div class="field-group">
                        <label for="dnd_flaws">Flaws</label>
                        <textarea id="dnd_flaws" rows="3" placeholder="What are your character's weaknesses?"></textarea>
                    </div>
                </div>
            </div>
        </div>

        <!-- ATTRIBUTES TAB -->
        <div class="tab-content" id="system-attributes" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Ability Scores
                </h2>
                <div class="dnd-attributes-grid grid grid-3">
                    ${config.attributes.map(attr => `
                        <div class="dnd-attribute-card" data-attr="${attr.id}">
                            <div class="attr-name">${attr.abbr}</div>
                            <input type="number" class="attr-score" id="attr_${attr.id}" min="1" max="30" value="10"
                                   onchange="updateDnDModifier('${attr.id}')" oninput="updateDnDModifier('${attr.id}')">
                            <div class="attr-modifier" id="mod_${attr.id}">+0</div>
                            <label class="save-proficiency">
                                <input type="checkbox" id="save_prof_${attr.id}" onchange="updateDnDSave('${attr.id}')">
                                <span class="save-label">Save</span>
                                <span class="save-value" id="save_${attr.id}">+0</span>
                            </label>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                    Skills
                </h2>
                <div class="skills-list">
                    ${renderDnD5eSkills(config)}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Other Proficiencies & Languages</h2>
                <textarea id="dnd_proficiencies" rows="4" placeholder="Languages, tools, weapons, armor..."></textarea>
            </div>
        </div>

        <!-- COMBAT TAB -->
        <div class="tab-content" id="system-combat" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Combat Stats
                </h2>
                <div class="combat-stats-grid">
                    <div class="combat-stat-card">
                        <label>Armor Class</label>
                        <input type="number" id="dnd_ac" value="10">
                    </div>
                    <div class="combat-stat-card">
                        <label>Initiative</label>
                        <input type="text" id="dnd_initiative" value="+0" readonly>
                    </div>
                    <div class="combat-stat-card">
                        <label>Speed</label>
                        <input type="text" id="dnd_speed" value="30 ft">
                    </div>
                    <div class="combat-stat-card">
                        <label>Proficiency Bonus</label>
                        <input type="text" id="dnd_proficiency" value="+2" readonly title="Auto-calculated from level">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    Hit Points
                </h2>
                <div class="hp-container">
                    <div class="hp-main">
                        <div class="field-group">
                            <label>Current HP</label>
                            <input type="number" id="dnd_hp_current" min="0" value="10">
                        </div>
                        <div class="hp-separator">/</div>
                        <div class="field-group">
                            <label>Max HP</label>
                            <input type="number" id="dnd_hp_max" min="1" value="10">
                        </div>
                    </div>
                    <div class="field-group">
                        <label>Temporary HP</label>
                        <input type="number" id="dnd_hp_temp" min="0" value="0">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Hit Dice</h2>
                <div class="grid-2">
                    <div class="field-group">
                        <label>Total</label>
                        <input type="text" id="dnd_hit_dice_total" placeholder="e.g., 5d8">
                    </div>
                    <div class="field-group">
                        <label>Remaining</label>
                        <input type="text" id="dnd_hit_dice_remaining" placeholder="e.g., 3d8">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Death Saves</h2>
                <div class="death-saves">
                    <div class="death-save-row">
                        <span class="death-label success-label">Successes</span>
                        <div class="death-boxes">
                            <input type="checkbox" id="death_success_1" class="death-checkbox success">
                            <input type="checkbox" id="death_success_2" class="death-checkbox success">
                            <input type="checkbox" id="death_success_3" class="death-checkbox success">
                        </div>
                    </div>
                    <div class="death-save-row">
                        <span class="death-label failure-label">Failures</span>
                        <div class="death-boxes">
                            <input type="checkbox" id="death_failure_1" class="death-checkbox failure">
                            <input type="checkbox" id="death_failure_2" class="death-checkbox failure">
                            <input type="checkbox" id="death_failure_3" class="death-checkbox failure">
                        </div>
                    </div>
                    <button class="dice-btn death-save-roll" onclick="rollDnDDeathSave()" style="margin-top: 12px;">Roll Death Save</button>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Conditions</h2>
                <div class="conditions-grid">
                    ${config.conditions.map(c => `
                        <label class="condition-checkbox">
                            <input type="checkbox" id="condition_${c.toLowerCase().replace(/\s+/g, '_')}">
                            <span>${c}</span>
                        </label>
                    `).join('')}
                </div>
                <div class="grid-2" style="margin-top: 16px;">
                    <div class="field-group">
                        <label>Exhaustion Level (0-6)</label>
                        <input type="number" id="dnd_exhaustion" min="0" max="6" value="0">
                    </div>
                    <div class="field-group">
                        <label class="condition-checkbox" style="margin-top: 24px;">
                            <input type="checkbox" id="dnd_inspiration">
                            <span>Inspiration</span>
                        </label>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                    Attacks & Weapons
                </h2>
                <table class="attacks-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Atk Bonus</th>
                            <th>Damage/Type</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${[1,2,3,4,5].map(i => `
                            <tr>
                                <td><input type="text" id="weapon_${i}_name" placeholder="Weapon name"></td>
                                <td><input type="text" id="weapon_${i}_atk" placeholder="+5"></td>
                                <td><input type="text" id="weapon_${i}_dmg" placeholder="1d8+3 slashing"></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>

        <!-- SPELLS TAB -->
        <div class="tab-content" id="system-spells" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                    Spellcasting
                </h2>
                <div class="grid-3">
                    <div class="field-group">
                        <label>Spellcasting Ability</label>
                        <select id="dnd_spellcasting_ability">
                            <option value="">None</option>
                            <option value="intelligence">Intelligence</option>
                            <option value="wisdom">Wisdom</option>
                            <option value="charisma">Charisma</option>
                        </select>
                    </div>
                    <div class="field-group">
                        <label>Spell Save DC</label>
                        <input type="number" id="dnd_spell_dc" value="8">
                    </div>
                    <div class="field-group">
                        <label>Spell Attack Bonus</label>
                        <input type="text" id="dnd_spell_attack" value="+0">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Spell Slots</h2>
                <div class="spell-slots-grid">
                    ${[1,2,3,4,5,6,7,8,9].map(level => `
                        <div class="spell-slot-row">
                            <span class="slot-level">${level}${getOrdinalSuffix(level)}</span>
                            <div class="slot-inputs">
                                <input type="number" id="spell_slots_${level}_used" min="0" value="0" class="slot-used">
                                <span>/</span>
                                <input type="number" id="spell_slots_${level}_max" min="0" value="0" class="slot-max">
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Cantrips</h2>
                <textarea id="dnd_cantrips" rows="4" placeholder="List your cantrips..."></textarea>
            </div>

            <div class="section">
                <h2 class="section-title">Known/Prepared Spells</h2>
                <textarea id="dnd_spells" rows="10" placeholder="List your spells by level..."></textarea>
            </div>
        </div>

        <!-- INVENTORY TAB -->
        <div class="tab-content" id="system-inventory" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                    Currency
                </h2>
                <div class="currency-grid">
                    <div class="currency-item">
                        <label>CP</label>
                        <input type="number" id="dnd_cp" min="0" value="0">
                    </div>
                    <div class="currency-item">
                        <label>SP</label>
                        <input type="number" id="dnd_sp" min="0" value="0">
                    </div>
                    <div class="currency-item">
                        <label>EP</label>
                        <input type="number" id="dnd_ep" min="0" value="0">
                    </div>
                    <div class="currency-item">
                        <label>GP</label>
                        <input type="number" id="dnd_gp" min="0" value="0">
                    </div>
                    <div class="currency-item">
                        <label>PP</label>
                        <input type="number" id="dnd_pp" min="0" value="0">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                    Equipment
                </h2>
                <textarea id="dnd_equipment" rows="10" placeholder="List your equipment and items..."></textarea>
            </div>

            <div class="section">
                <h2 class="section-title">Features & Traits</h2>
                <textarea id="dnd_features" rows="10" placeholder="Racial traits, class features, feats..."></textarea>
            </div>
        </div>

        <!-- DICE TAB -->
        <div class="tab-content" id="system-dice" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8" cy="8" r="1.5"/><circle cx="16" cy="8" r="1.5"/><circle cx="8" cy="16" r="1.5"/><circle cx="16" cy="16" r="1.5"/><circle cx="12" cy="12" r="1.5"/></svg>
                    Dice Roller
                </h2>
                <div class="dice-roller-dnd">
                    <div class="quick-dice">
                        <button class="dice-btn" onclick="rollDnDDice(20)">d20</button>
                        <button class="dice-btn" onclick="rollDnDDice(12)">d12</button>
                        <button class="dice-btn" onclick="rollDnDDice(10)">d10</button>
                        <button class="dice-btn" onclick="rollDnDDice(8)">d8</button>
                        <button class="dice-btn" onclick="rollDnDDice(6)">d6</button>
                        <button class="dice-btn" onclick="rollDnDDice(4)">d4</button>
                    </div>

                    <div class="custom-roll">
                        <div class="field-group">
                            <label>Custom Roll</label>
                            <div class="custom-roll-inputs">
                                <input type="number" id="dnd_roll_count" min="1" value="1" style="width: 60px;">
                                <span>d</span>
                                <input type="number" id="dnd_roll_sides" min="2" value="20" style="width: 60px;">
                                <span>+</span>
                                <input type="number" id="dnd_roll_modifier" value="0" style="width: 60px;">
                                <button class="dice-btn roll-custom" onclick="rollDnDCustom()">Roll</button>
                            </div>
                        </div>
                    </div>

                    <div class="roll-result-container">
                        <div class="roll-result" id="dnd_roll_result">-</div>
                        <div class="roll-details" id="dnd_roll_details"></div>
                    </div>

                    <div class="roll-history" id="dnd_roll_history">
                        <h3>Roll History</h3>
                        <div class="history-list" id="dnd_history_list"></div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Quick Checks</h2>
                <div class="quick-checks">
                    ${config.attributes.map(attr => `
                        <button class="check-btn" onclick="rollDnDCheck('${attr.id}')">${attr.abbr} Check</button>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- RULES TAB -->
        <div class="tab-content" id="system-rules" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    D&D 5e Quick Reference
                </h2>

                <div class="rules-accordion">
                    <details class="rules-section">
                        <summary>Ability Checks</summary>
                        <div class="rules-content">
                            <p><strong>Basic Check:</strong> d20 + ability modifier + proficiency bonus (if proficient)</p>
                            <p><strong>Difficulty Classes (DC):</strong></p>
                            <ul>
                                <li>Very Easy: 5</li>
                                <li>Easy: 10</li>
                                <li>Medium: 15</li>
                                <li>Hard: 20</li>
                                <li>Very Hard: 25</li>
                                <li>Nearly Impossible: 30</li>
                            </ul>
                            <p><strong>Advantage/Disadvantage:</strong> Roll 2d20, take highest/lowest</p>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Combat</summary>
                        <div class="rules-content">
                            <p><strong>Attack Roll:</strong> d20 + ability modifier + proficiency bonus vs AC</p>
                            <p><strong>Critical Hit:</strong> Natural 20, roll damage dice twice</p>
                            <p><strong>Critical Miss:</strong> Natural 1, automatic miss</p>
                            <p><strong>Actions in Combat:</strong></p>
                            <ul>
                                <li>Action (Attack, Cast Spell, Dash, Disengage, Dodge, Help, Hide, Ready, Search, Use Object)</li>
                                <li>Bonus Action (if available)</li>
                                <li>Reaction (1 per round)</li>
                                <li>Movement (up to your speed)</li>
                                <li>Free Object Interaction</li>
                            </ul>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Conditions</summary>
                        <div class="rules-content">
                            <ul>
                                <li><strong>Blinded:</strong> Auto-fail sight checks, disadvantage on attacks, attacks against you have advantage</li>
                                <li><strong>Charmed:</strong> Can't attack charmer, charmer has advantage on social checks</li>
                                <li><strong>Frightened:</strong> Disadvantage while source visible, can't willingly move closer</li>
                                <li><strong>Grappled:</strong> Speed 0, ends if grappler incapacitated or moved out of reach</li>
                                <li><strong>Incapacitated:</strong> Can't take actions or reactions</li>
                                <li><strong>Invisible:</strong> Impossible to see without magic, heavily obscured for hiding</li>
                                <li><strong>Paralyzed:</strong> Incapacitated, auto-fail STR/DEX saves, attacks have advantage, crits within 5ft</li>
                                <li><strong>Poisoned:</strong> Disadvantage on attacks and ability checks</li>
                                <li><strong>Prone:</strong> Can only crawl, disadvantage on attacks, melee has advantage, ranged has disadvantage</li>
                                <li><strong>Restrained:</strong> Speed 0, disadvantage on attacks and DEX saves, attacks have advantage</li>
                                <li><strong>Stunned:</strong> Incapacitated, auto-fail STR/DEX saves, attacks have advantage</li>
                                <li><strong>Unconscious:</strong> Incapacitated, drop items, prone, auto-fail STR/DEX saves, crits within 5ft</li>
                            </ul>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Exhaustion</summary>
                        <div class="rules-content">
                            <ul>
                                <li><strong>1:</strong> Disadvantage on ability checks</li>
                                <li><strong>2:</strong> Speed halved</li>
                                <li><strong>3:</strong> Disadvantage on attacks and saves</li>
                                <li><strong>4:</strong> HP maximum halved</li>
                                <li><strong>5:</strong> Speed reduced to 0</li>
                                <li><strong>6:</strong> Death</li>
                            </ul>
                            <p>Long rest removes 1 level (with food/drink)</p>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Resting</summary>
                        <div class="rules-content">
                            <p><strong>Short Rest:</strong> 1+ hours</p>
                            <ul>
                                <li>Spend Hit Dice to heal</li>
                                <li>Some abilities recharge</li>
                            </ul>
                            <p><strong>Long Rest:</strong> 8+ hours (sleep 6h minimum)</p>
                            <ul>
                                <li>Regain all HP</li>
                                <li>Regain up to half total Hit Dice</li>
                                <li>Most abilities recharge</li>
                                <li>Reduce exhaustion by 1</li>
                            </ul>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Spellcasting</summary>
                        <div class="rules-content">
                            <p><strong>Spell Save DC:</strong> 8 + proficiency + spellcasting modifier</p>
                            <p><strong>Spell Attack:</strong> d20 + proficiency + spellcasting modifier</p>
                            <p><strong>Concentration:</strong> Some spells require concentration</p>
                            <ul>
                                <li>Only one concentration spell at a time</li>
                                <li>Ends if: cast another concentration spell, incapacitated, or killed</li>
                                <li>Taking damage: CON save (DC 10 or half damage, whichever higher)</li>
                            </ul>
                        </div>
                    </details>
                </div>

                <div class="rules-links">
                    <a href="https://5e.d20srd.org/" target="_blank" class="rules-link">D&D 5e SRD</a>
                    <a href="https://www.dndbeyond.com/sources/basic-rules" target="_blank" class="rules-link">D&D Beyond Basic Rules</a>
                </div>
            </div>
        </div>
    `;
}

// Render D&D 5e skills list
function renderDnD5eSkills(config) {
    const skillsByAttr = config.skills;
    let html = '';

    for (const [attrId, skills] of Object.entries(skillsByAttr)) {
        const attr = config.attributes.find(a => a.id === attrId);
        if (!attr || skills.length === 0) continue;

        skills.forEach(skill => {
            const skillId = skill.toLowerCase().replace(/\s+/g, '_');
            html += `
                <div class="skill-row">
                    <label class="skill-proficiency">
                        <input type="checkbox" id="skill_prof_${skillId}" onchange="updateDnDSkill('${skillId}', '${attrId}')">
                    </label>
                    <span class="skill-modifier" id="skill_mod_${skillId}">+0</span>
                    <span class="skill-name">${skill}</span>
                    <span class="skill-attr">(${attr.abbr})</span>
                </div>
            `;
        });
    }

    // Add Passive Perception
    html += `
        <div class="skill-row passive">
            <span class="skill-modifier" id="passive_perception">10</span>
            <span class="skill-name">Passive Perception</span>
        </div>
    `;

    return html;
}

// Helper function for ordinal suffixes
function getOrdinalSuffix(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

// Calculate proficiency bonus based on level
function calculateDnDProficiency(level) {
    // Level 1-4: +2, 5-8: +3, 9-12: +4, 13-16: +5, 17-20: +6
    return Math.floor((level - 1) / 4) + 2;
}

// Update proficiency bonus from level
function updateDnDProficiency() {
    const levelInput = document.getElementById('dnd_level');
    const profInput = document.getElementById('dnd_proficiency');

    if (levelInput && profInput) {
        const level = parseInt(levelInput.value) || 1;
        const profBonus = calculateDnDProficiency(level);
        profInput.value = formatModifier(profBonus);

        // Update all saves and skills that use proficiency
        const config = SYSTEM_CONFIGS.dnd5e;
        config.attributes.forEach(attr => {
            updateDnDSave(attr.id);
            updateDnDSkillsForAttribute(attr.id);
        });
    }
}

// Update D&D modifier display
function updateDnDModifier(attrId) {
    const scoreInput = document.getElementById(`attr_${attrId}`);
    const modDisplay = document.getElementById(`mod_${attrId}`);

    if (scoreInput && modDisplay) {
        const score = parseInt(scoreInput.value) || 10;
        const mod = Math.floor((score - 10) / 2);
        modDisplay.textContent = formatModifier(mod);
    }

    // Update related skills
    updateDnDSkillsForAttribute(attrId);

    // Update save
    updateDnDSave(attrId);

    // Update initiative if DEX
    if (attrId === 'dexterity') {
        updateDnDInitiative();
    }
}

// Update D&D save
function updateDnDSave(attrId) {
    const scoreInput = document.getElementById(`attr_${attrId}`);
    const profCheckbox = document.getElementById(`save_prof_${attrId}`);
    const saveDisplay = document.getElementById(`save_${attrId}`);
    const profInput = document.getElementById('dnd_proficiency');

    if (scoreInput && saveDisplay) {
        const score = parseInt(scoreInput.value) || 10;
        const mod = Math.floor((score - 10) / 2);
        const profBonus = profCheckbox && profCheckbox.checked ? (parseInt(profInput?.value) || 2) : 0;
        const total = mod + profBonus;
        saveDisplay.textContent = formatModifier(total);
    }
}

// Update skills for an attribute
function updateDnDSkillsForAttribute(attrId) {
    const config = SYSTEM_CONFIGS.dnd5e;
    const skills = config.skills[attrId] || [];

    skills.forEach(skill => {
        const skillId = skill.toLowerCase().replace(/\s+/g, '_');
        updateDnDSkill(skillId, attrId);
    });
}

// Update a single skill
function updateDnDSkill(skillId, attrId) {
    const scoreInput = document.getElementById(`attr_${attrId}`);
    const profCheckbox = document.getElementById(`skill_prof_${skillId}`);
    const modDisplay = document.getElementById(`skill_mod_${skillId}`);
    const profInput = document.getElementById('dnd_proficiency');

    if (scoreInput && modDisplay) {
        const score = parseInt(scoreInput.value) || 10;
        const mod = Math.floor((score - 10) / 2);
        const profBonus = profCheckbox && profCheckbox.checked ? (parseInt(profInput?.value) || 2) : 0;
        const total = mod + profBonus;
        modDisplay.textContent = formatModifier(total);
    }

    // Update passive perception
    if (skillId === 'perception') {
        updateDnDPassivePerception();
    }
}

// Update passive perception
function updateDnDPassivePerception() {
    const perceptionMod = document.getElementById('skill_mod_perception');
    const passiveDisplay = document.getElementById('passive_perception');

    if (perceptionMod && passiveDisplay) {
        const mod = parseInt(perceptionMod.textContent) || 0;
        passiveDisplay.textContent = 10 + mod;
    }
}

// Update initiative
function updateDnDInitiative() {
    const dexScore = document.getElementById('attr_dexterity');
    const initDisplay = document.getElementById('dnd_initiative');

    if (dexScore && initDisplay) {
        const score = parseInt(dexScore.value) || 10;
        const mod = Math.floor((score - 10) / 2);
        initDisplay.value = formatModifier(mod);
    }
}

// Roll a single die
function rollDnDDice(sides) {
    const result = Math.floor(Math.random() * sides) + 1;
    displayDnDRoll(`1d${sides}`, [result], result, 0);
}

// Roll custom dice
function rollDnDCustom() {
    const count = parseInt(document.getElementById('dnd_roll_count').value) || 1;
    const sides = parseInt(document.getElementById('dnd_roll_sides').value) || 20;
    const modifier = parseInt(document.getElementById('dnd_roll_modifier').value) || 0;

    const rolls = [];
    for (let i = 0; i < count; i++) {
        rolls.push(Math.floor(Math.random() * sides) + 1);
    }

    const sum = rolls.reduce((a, b) => a + b, 0);
    const total = sum + modifier;

    displayDnDRoll(`${count}d${sides}${modifier >= 0 ? '+' : ''}${modifier}`, rolls, total, modifier);
}

// Roll an ability check
function rollDnDCheck(attrId) {
    const scoreInput = document.getElementById(`attr_${attrId}`);
    const config = SYSTEM_CONFIGS.dnd5e;
    const attr = config.attributes.find(a => a.id === attrId);

    if (scoreInput && attr) {
        const score = parseInt(scoreInput.value) || 10;
        const mod = Math.floor((score - 10) / 2);
        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + mod;

        let resultClass = '';
        if (roll === 20) resultClass = 'crit-success';
        else if (roll === 1) resultClass = 'crit-fail';

        displayDnDRoll(`${attr.name} Check (d20${formatModifier(mod)})`, [roll], total, mod, resultClass);
    }
}

// Display roll result
function displayDnDRoll(label, rolls, total, modifier, extraClass = '') {
    const resultDisplay = document.getElementById('dnd_roll_result');
    const detailsDisplay = document.getElementById('dnd_roll_details');
    const historyList = document.getElementById('dnd_history_list');

    if (resultDisplay) {
        resultDisplay.textContent = total;
        resultDisplay.className = `roll-result ${extraClass}`;
    }

    if (detailsDisplay) {
        let details = `${label}: [${rolls.join(', ')}]`;
        if (modifier !== 0) {
            details += ` ${modifier >= 0 ? '+' : ''}${modifier}`;
        }
        details += ` = ${total}`;
        detailsDisplay.textContent = details;
    }

    // Add to history
    if (historyList) {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${extraClass}`;
        historyItem.innerHTML = `<span class="history-label">${label}</span><span class="history-result">${total}</span>`;
        historyList.insertBefore(historyItem, historyList.firstChild);

        // Keep only last 10 rolls
        while (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
    }
}

// Initialize D&D 5e sheet
function initializeDnD5e() {
    const config = SYSTEM_CONFIGS.dnd5e;

    // Set up attribute listeners
    config.attributes.forEach(attr => {
        const input = document.getElementById(`attr_${attr.id}`);
        if (input) {
            input.addEventListener('change', () => {
                updateDnDModifier(attr.id);
                updateDnDOverview();
            });
            input.addEventListener('input', () => {
                updateDnDModifier(attr.id);
                updateDnDOverview();
            });
            // Initial update
            updateDnDModifier(attr.id);
        }
    });

    // Set up level listener for auto-proficiency calculation
    const levelInput = document.getElementById('dnd_level');
    if (levelInput) {
        levelInput.addEventListener('change', () => {
            updateDnDProficiency();
            updateDnDOverview();
        });
        levelInput.addEventListener('input', () => {
            updateDnDProficiency();
            updateDnDOverview();
        });
    }

    // Initial proficiency calculation
    updateDnDProficiency();

    // Set up other field listeners for overview sync
    setupDnDOverviewListeners();

    // Initial overview update
    setTimeout(updateDnDOverview, 100);
}

// Set up listeners for overview sync
function setupDnDOverviewListeners() {
    const fieldsToWatch = [
        'character_name', 'dnd_race', 'dnd_class', 'dnd_level',
        'dnd_hp_current', 'dnd_hp_max', 'dnd_hp_temp',
        'dnd_ac', 'dnd_speed', 'dnd_proficiency',
        'dnd_hit_dice_total', 'dnd_hit_dice_remaining',
        'dnd_exhaustion', 'dnd_inspiration'
    ];

    fieldsToWatch.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', updateDnDOverview);
            field.addEventListener('input', updateDnDOverview);
        }
    });

    // Watch death saves
    for (let i = 1; i <= 3; i++) {
        const success = document.getElementById(`death_success_${i}`);
        const failure = document.getElementById(`death_failure_${i}`);
        if (success) success.addEventListener('change', updateDnDOverview);
        if (failure) failure.addEventListener('change', updateDnDOverview);
    }

    // Watch spell slots
    for (let level = 1; level <= 9; level++) {
        const used = document.getElementById(`spell_slots_${level}_used`);
        const max = document.getElementById(`spell_slots_${level}_max`);
        if (used) used.addEventListener('change', updateDnDOverview);
        if (max) max.addEventListener('change', updateDnDOverview);
    }

    // Watch conditions
    const config = SYSTEM_CONFIGS.dnd5e;
    config.conditions.forEach(c => {
        const checkbox = document.getElementById(`condition_${c.toLowerCase().replace(/\s+/g, '_')}`);
        if (checkbox) checkbox.addEventListener('change', updateDnDOverview);
    });

    // Watch save proficiencies
    config.attributes.forEach(attr => {
        const saveProfCheckbox = document.getElementById(`save_prof_${attr.id}`);
        if (saveProfCheckbox) {
            saveProfCheckbox.addEventListener('change', updateDnDOverview);
        }
    });
}

// Update the overview tab with current values
function updateDnDOverview() {
    const config = SYSTEM_CONFIGS.dnd5e;

    // Character summary
    const nameEl = document.getElementById('dnd-summary-name');
    const raceEl = document.getElementById('dnd-summary-race');
    const classEl = document.getElementById('dnd-summary-class');
    const levelEl = document.getElementById('dnd-summary-level');
    const avatarEl = document.getElementById('dnd-avatar');

    const name = document.getElementById('character_name')?.value || 'New Character';
    const race = document.getElementById('dnd_race')?.value || '-';
    const charClass = document.getElementById('dnd_class')?.value || '-';
    const level = document.getElementById('dnd_level')?.value || '1';

    if (nameEl) nameEl.textContent = name || 'New Character';
    if (raceEl) raceEl.textContent = race || '-';
    if (classEl) classEl.textContent = charClass || '-';
    if (levelEl) levelEl.textContent = level;
    if (avatarEl) {
        const initial = name ? name.charAt(0).toUpperCase() : '?';
        avatarEl.querySelector('.avatar-initial').textContent = initial;
    }

    // Combat stats
    const hp = document.getElementById('dnd_hp_current')?.value || '10';
    const hpMax = document.getElementById('dnd_hp_max')?.value || '10';
    const tempHp = document.getElementById('dnd_hp_temp')?.value || '0';
    const ac = document.getElementById('dnd_ac')?.value || '10';
    const speed = document.getElementById('dnd_speed')?.value || '30 ft';
    const prof = document.getElementById('dnd_proficiency')?.value || '+2';

    document.getElementById('dnd-overview-hp').textContent = hp;
    document.getElementById('dnd-overview-hp-max').textContent = hpMax;
    document.getElementById('dnd-overview-ac').textContent = ac;
    document.getElementById('dnd-overview-speed').textContent = speed.replace(' ft', '');
    document.getElementById('dnd-overview-prof').textContent = prof;

    // Temp HP
    const tempHpDisplay = document.getElementById('dnd-temp-hp-display');
    const tempHpValue = document.getElementById('dnd-overview-temp-hp');
    if (tempHpDisplay && tempHpValue) {
        if (parseInt(tempHp) > 0) {
            tempHpDisplay.style.display = 'block';
            tempHpValue.textContent = tempHp;
        } else {
            tempHpDisplay.style.display = 'none';
        }
    }

    // Initiative (from DEX)
    const dexScore = parseInt(document.getElementById('attr_dexterity')?.value) || 10;
    const dexMod = Math.floor((dexScore - 10) / 2);
    document.getElementById('dnd-overview-init').textContent = formatModifier(dexMod);

    // Ability scores and mods
    config.attributes.forEach(attr => {
        const score = parseInt(document.getElementById(`attr_${attr.id}`)?.value) || 10;
        const mod = Math.floor((score - 10) / 2);

        const scoreEl = document.getElementById(`dnd-overview-score-${attr.id}`);
        const modEl = document.getElementById(`dnd-overview-mod-${attr.id}`);

        if (scoreEl) scoreEl.textContent = score;
        if (modEl) modEl.textContent = formatModifier(mod);

        // Saving throws
        const saveProfCheckbox = document.getElementById(`save_prof_${attr.id}`);
        const isProficient = saveProfCheckbox?.checked || false;
        const profBonus = parseInt(prof) || 2;
        const saveTotal = mod + (isProficient ? profBonus : 0);

        const saveProfEl = document.getElementById(`dnd-overview-save-prof-${attr.id}`);
        const saveModEl = document.getElementById(`dnd-overview-save-${attr.id}`);

        if (saveProfEl) saveProfEl.textContent = isProficient ? '●' : '○';
        if (saveModEl) saveModEl.textContent = formatModifier(saveTotal);
    });

    // Death saves
    let successCount = 0;
    let failCount = 0;
    for (let i = 1; i <= 3; i++) {
        if (document.getElementById(`death_success_${i}`)?.checked) successCount++;
        if (document.getElementById(`death_failure_${i}`)?.checked) failCount++;
    }
    document.getElementById('dnd-overview-death-success').textContent = '●'.repeat(successCount) + '○'.repeat(3 - successCount);
    document.getElementById('dnd-overview-death-fail').textContent = '●'.repeat(failCount) + '○'.repeat(3 - failCount);

    // Hit dice
    const hitDiceTotal = document.getElementById('dnd_hit_dice_total')?.value || '-';
    const hitDiceRemaining = document.getElementById('dnd_hit_dice_remaining')?.value || '-';
    document.getElementById('dnd-overview-hit-dice').textContent = hitDiceRemaining ? `${hitDiceRemaining} / ${hitDiceTotal}` : hitDiceTotal;

    // Spell slots
    let hasSpellSlots = false;
    for (let level = 1; level <= 9; level++) {
        const max = parseInt(document.getElementById(`spell_slots_${level}_max`)?.value) || 0;
        const used = parseInt(document.getElementById(`spell_slots_${level}_used`)?.value) || 0;
        const container = document.getElementById(`dnd-slot-${level}-container`);
        const slotsEl = document.getElementById(`dnd-overview-slots-${level}`);

        if (max > 0) {
            hasSpellSlots = true;
            if (container) container.style.display = 'flex';
            if (slotsEl) slotsEl.textContent = `${max - used}/${max}`;
        } else {
            if (container) container.style.display = 'none';
        }
    }
    const spellSection = document.getElementById('dnd-spell-slots-overview');
    if (spellSection) spellSection.style.display = hasSpellSlots ? 'block' : 'none';

    // Conditions
    const activeConditions = [];
    config.conditions.forEach(c => {
        const checkbox = document.getElementById(`condition_${c.toLowerCase().replace(/\s+/g, '_')}`);
        if (checkbox?.checked) activeConditions.push(c);
    });

    const conditionsEl = document.getElementById('dnd-overview-conditions');
    if (conditionsEl) {
        if (activeConditions.length > 0) {
            conditionsEl.innerHTML = activeConditions.map(c => `<span class="condition-tag">${c}</span>`).join('');
        } else {
            conditionsEl.innerHTML = '<span class="no-conditions">None</span>';
        }
    }

    // Exhaustion
    const exhaustion = parseInt(document.getElementById('dnd_exhaustion')?.value) || 0;
    const exhaustionDisplay = document.getElementById('dnd-exhaustion-display');
    const exhaustionLevel = document.getElementById('dnd-overview-exhaustion');
    if (exhaustionDisplay && exhaustionLevel) {
        if (exhaustion > 0) {
            exhaustionDisplay.style.display = 'flex';
            exhaustionLevel.textContent = exhaustion;
        } else {
            exhaustionDisplay.style.display = 'none';
        }
    }

    // Inspiration
    const inspirationMain = document.getElementById('dnd_inspiration');
    const inspirationOverview = document.getElementById('dnd-overview-inspiration');
    if (inspirationMain && inspirationOverview) {
        inspirationOverview.checked = inspirationMain.checked;
    }
}

// Sync inspiration from overview to main form
function syncDnDInspiration(checkbox) {
    const mainInspiration = document.getElementById('dnd_inspiration');
    if (mainInspiration) {
        mainInspiration.checked = checkbox.checked;
    }
}

// Adjust HP from overview
function adjustDnDHP(delta) {
    const hpInput = document.getElementById('dnd_hp_current');
    const maxHpInput = document.getElementById('dnd_hp_max');

    if (hpInput) {
        const current = parseInt(hpInput.value) || 0;
        const max = parseInt(maxHpInput?.value) || 999;
        const newValue = Math.max(0, Math.min(max, current + delta));
        hpInput.value = newValue;
        updateDnDOverview();
    }
}

// Roll a saving throw
function rollDnDSave(attrId) {
    const scoreInput = document.getElementById(`attr_${attrId}`);
    const profCheckbox = document.getElementById(`save_prof_${attrId}`);
    const profInput = document.getElementById('dnd_proficiency');
    const config = SYSTEM_CONFIGS.dnd5e;
    const attr = config.attributes.find(a => a.id === attrId);

    if (scoreInput && attr) {
        const score = parseInt(scoreInput.value) || 10;
        const mod = Math.floor((score - 10) / 2);
        const profBonus = profCheckbox?.checked ? (parseInt(profInput?.value) || 2) : 0;
        const totalMod = mod + profBonus;

        const roll = Math.floor(Math.random() * 20) + 1;
        const total = roll + totalMod;

        let resultClass = '';
        if (roll === 20) resultClass = 'crit-success';
        else if (roll === 1) resultClass = 'crit-fail';

        displayDnDRoll(`${attr.name} Save (d20${formatModifier(totalMod)})`, [roll], total, totalMod, resultClass);
    }
}

// Roll death save with nat 1/20 handling
function rollDnDDeathSave() {
    const roll = Math.floor(Math.random() * 20) + 1;

    // Natural 20: Regain 1 HP and wake up
    if (roll === 20) {
        const hpInput = document.getElementById('dnd_hp_current');
        if (hpInput) hpInput.value = 1;

        // Clear all death saves
        for (let i = 1; i <= 3; i++) {
            const success = document.getElementById(`death_success_${i}`);
            const failure = document.getElementById(`death_failure_${i}`);
            if (success) success.checked = false;
            if (failure) failure.checked = false;
        }

        updateDnDOverview();
        alert(`Death Save: Natural 20!\n\nYou regain 1 HP and wake up!`);
        return;
    }

    // Natural 1: Count as 2 failures
    if (roll === 1) {
        let failuresAdded = 0;
        for (let i = 1; i <= 3 && failuresAdded < 2; i++) {
            const failure = document.getElementById(`death_failure_${i}`);
            if (failure && !failure.checked) {
                failure.checked = true;
                failuresAdded++;
            }
        }

        updateDnDOverview();

        // Check if dead
        let totalFails = 0;
        for (let i = 1; i <= 3; i++) {
            if (document.getElementById(`death_failure_${i}`)?.checked) totalFails++;
        }

        if (totalFails >= 3) {
            alert(`Death Save: Natural 1! (2 failures)\n\nRoll: ${roll}\n\n💀 You have died.`);
        } else {
            alert(`Death Save: Natural 1! (2 failures)\n\nRoll: ${roll}\nTotal failures: ${totalFails}/3`);
        }
        return;
    }

    // Normal roll: 10+ = success, <10 = failure
    if (roll >= 10) {
        // Add a success
        for (let i = 1; i <= 3; i++) {
            const success = document.getElementById(`death_success_${i}`);
            if (success && !success.checked) {
                success.checked = true;
                break;
            }
        }

        updateDnDOverview();

        // Check if stabilized
        let totalSuccesses = 0;
        for (let i = 1; i <= 3; i++) {
            if (document.getElementById(`death_success_${i}`)?.checked) totalSuccesses++;
        }

        if (totalSuccesses >= 3) {
            alert(`Death Save: Success!\n\nRoll: ${roll}\n\n🛡️ You are stabilized!`);
        } else {
            alert(`Death Save: Success!\n\nRoll: ${roll}\nTotal successes: ${totalSuccesses}/3`);
        }
    } else {
        // Add a failure
        for (let i = 1; i <= 3; i++) {
            const failure = document.getElementById(`death_failure_${i}`);
            if (failure && !failure.checked) {
                failure.checked = true;
                break;
            }
        }

        updateDnDOverview();

        // Check if dead
        let totalFails = 0;
        for (let i = 1; i <= 3; i++) {
            if (document.getElementById(`death_failure_${i}`)?.checked) totalFails++;
        }

        if (totalFails >= 3) {
            alert(`Death Save: Failure\n\nRoll: ${roll}\n\n💀 You have died.`);
        } else {
            alert(`Death Save: Failure\n\nRoll: ${roll}\nTotal failures: ${totalFails}/3`);
        }
    }
}

// Short rest
function dndShortRest() {
    alert('Short Rest: You can spend Hit Dice to heal.\nSelect Hit Dice in the Combat tab to roll for healing.');
}

// Long rest
function dndLongRest() {
    const hpMax = document.getElementById('dnd_hp_max')?.value || '10';
    const hpInput = document.getElementById('dnd_hp_current');
    const hdTotalInput = document.getElementById('dnd_hit_dice_total');
    const hdRemainingInput = document.getElementById('dnd_hit_dice_remaining');

    if (confirm('Take a Long Rest?\n\n• Restore all HP\n• Regain half total Hit Dice (minimum 1)\n• Regain all spell slots\n• Reduce exhaustion by 1')) {
        // Restore HP
        if (hpInput) hpInput.value = hpMax;

        // Restore Hit Dice (regain half total, minimum 1)
        if (hdTotalInput && hdRemainingInput) {
            const total = parseInt(hdTotalInput.value) || 1;
            const remaining = parseInt(hdRemainingInput.value) || 0;
            const regain = Math.max(1, Math.floor(total / 2));
            const newRemaining = Math.min(total, remaining + regain);
            hdRemainingInput.value = newRemaining;
        }

        // Restore spell slots
        for (let level = 1; level <= 9; level++) {
            const usedInput = document.getElementById(`spell_slots_${level}_used`);
            if (usedInput) usedInput.value = 0;
        }

        // Reduce exhaustion
        const exhaustionInput = document.getElementById('dnd_exhaustion');
        if (exhaustionInput) {
            const current = parseInt(exhaustionInput.value) || 0;
            exhaustionInput.value = Math.max(0, current - 1);
        }

        // Clear death saves
        for (let i = 1; i <= 3; i++) {
            const success = document.getElementById(`death_success_${i}`);
            const failure = document.getElementById(`death_failure_${i}`);
            if (success) success.checked = false;
            if (failure) failure.checked = false;
        }

        updateDnDOverview();

        const regained = hdTotalInput ? Math.max(1, Math.floor(parseInt(hdTotalInput.value) / 2)) : 0;
        alert(`Long Rest complete!\n\n• HP restored to ${hpMax}\n• Regained ${regained} Hit Dice\n• Spell slots restored\n• Exhaustion reduced by 1`);
    }
}

// Export functions
if (typeof window !== 'undefined') {
    window.renderDnD5eSheet = renderDnD5eSheet;
    window.initializeDnD5e = initializeDnD5e;
    window.updateDnDModifier = updateDnDModifier;
    window.updateDnDProficiency = updateDnDProficiency;
    window.updateDnDSave = updateDnDSave;
    window.updateDnDSkill = updateDnDSkill;
    window.rollDnDDice = rollDnDDice;
    window.rollDnDCustom = rollDnDCustom;
    window.rollDnDCheck = rollDnDCheck;
    window.updateDnDOverview = updateDnDOverview;
    window.syncDnDInspiration = syncDnDInspiration;
    window.adjustDnDHP = adjustDnDHP;
    window.rollDnDSave = rollDnDSave;
    window.rollDnDDeathSave = rollDnDDeathSave;
    window.dndShortRest = dndShortRest;
    window.dndLongRest = dndLongRest;
}
