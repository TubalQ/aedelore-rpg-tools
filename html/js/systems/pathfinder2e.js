// ===========================================
// Pathfinder 2nd Edition Character Sheet Renderer
// ===========================================

function renderPathfinder2eSheet(config) {
    return `
        <!-- OVERVIEW TAB -->
        <div class="tab-content active" id="system-overview" style="display: block;">
            <div class="system-dashboard pf2e-dashboard">
                <!-- Character Summary -->
                <div class="dashboard-card character-summary">
                    <div class="summary-avatar" id="pf-avatar">
                        <span class="avatar-initial">?</span>
                    </div>
                    <div class="summary-info">
                        <h2 class="summary-name" id="pf-summary-name">New Character</h2>
                        <div class="summary-details">
                            <span id="pf-summary-ancestry">-</span>
                            <span id="pf-summary-class">-</span>
                            <span class="summary-level">Lvl <span id="pf-summary-level">1</span></span>
                        </div>
                    </div>
                    <div class="hero-points-display">
                        <span class="hero-label">Hero Points</span>
                        <div class="hero-dots" id="pf-hero-points">
                            <span class="hero-dot" onclick="setPFHeroPoints(1)">○</span>
                            <span class="hero-dot" onclick="setPFHeroPoints(2)">○</span>
                            <span class="hero-dot" onclick="setPFHeroPoints(3)">○</span>
                        </div>
                    </div>
                </div>

                <!-- Combat Stats Grid -->
                <div class="dashboard-row combat-row">
                    <div class="dashboard-stat hp-stat">
                        <div class="stat-label">HP</div>
                        <div class="stat-adjuster">
                            <button class="adj-btn" onclick="adjustPFHP(-1)">−</button>
                            <span class="stat-value">
                                <span id="pf-overview-hp">10</span>/<span id="pf-overview-hp-max">10</span>
                            </span>
                            <button class="adj-btn" onclick="adjustPFHP(1)">+</button>
                        </div>
                        <div class="temp-hp" id="pf-temp-hp-display" style="display: none;">
                            +<span id="pf-overview-temp-hp">0</span> temp
                        </div>
                    </div>
                    <div class="dashboard-stat">
                        <div class="stat-label">AC</div>
                        <div class="stat-value-large" id="pf-overview-ac">10</div>
                    </div>
                    <div class="dashboard-stat" onclick="rollPFPerception()">
                        <div class="stat-label">Perception</div>
                        <div class="stat-value-large" id="pf-overview-perception">+0</div>
                    </div>
                    <div class="dashboard-stat">
                        <div class="stat-label">Speed</div>
                        <div class="stat-value-large" id="pf-overview-speed">25</div>
                    </div>
                    <div class="dashboard-stat">
                        <div class="stat-label">Class DC</div>
                        <div class="stat-value-large" id="pf-overview-class-dc">10</div>
                    </div>
                </div>

                <!-- Ability Scores -->
                <div class="dashboard-section">
                    <h3 class="section-header">Ability Modifiers</h3>
                    <div class="ability-grid">
                        ${config.attributes.map(attr => `
                            <div class="ability-card" onclick="rollPFCheck('${attr.id}')">
                                <div class="ability-abbr">${attr.abbr}</div>
                                <div class="ability-mod" id="pf-overview-mod-${attr.id}">+0</div>
                                <div class="ability-score" id="pf-overview-score-${attr.id}">10</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Saving Throws -->
                <div class="dashboard-section">
                    <h3 class="section-header">Saving Throws</h3>
                    <div class="pf-saves-row">
                        ${config.savingThrows.map(save => `
                            <div class="pf-save-card" onclick="rollPFSaveCheck('${save.id}')">
                                <div class="save-name">${save.name}</div>
                                <div class="save-total-large" id="pf-overview-save-${save.id}">+0</div>
                                <div class="save-prof-badge" id="pf-overview-save-prof-${save.id}">U</div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Focus Points (if applicable) -->
                <div class="dashboard-section" id="pf-focus-section" style="display: none;">
                    <h3 class="section-header">Focus Points</h3>
                    <div class="focus-points-display">
                        <div class="stat-adjuster">
                            <button class="adj-btn" onclick="adjustPFFocus(-1)">−</button>
                            <span class="stat-value">
                                <span id="pf-overview-focus">0</span>/<span id="pf-overview-focus-max">0</span>
                            </span>
                            <button class="adj-btn" onclick="adjustPFFocus(1)">+</button>
                        </div>
                    </div>
                </div>

                <!-- Resistances/Weaknesses (if any) -->
                <div class="dashboard-row">
                    <div class="dashboard-section compact" id="pf-resistances-section" style="display: none;">
                        <h3 class="section-header">Resistances</h3>
                        <div class="resistances-list" id="pf-overview-resistances">-</div>
                    </div>
                    <div class="dashboard-section compact" id="pf-weaknesses-section" style="display: none;">
                        <h3 class="section-header">Weaknesses</h3>
                        <div class="weaknesses-list" id="pf-overview-weaknesses">-</div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="dashboard-section">
                    <h3 class="section-header">Quick Actions</h3>
                    <div class="quick-actions-grid">
                        <button class="quick-action-btn" onclick="rollPFDice(20)">
                            <span class="action-icon">🎲</span>
                            <span class="action-label">d20</span>
                        </button>
                        <button class="quick-action-btn" onclick="pfRefocus()">
                            <span class="action-icon">🧘</span>
                            <span class="action-label">Refocus</span>
                        </button>
                        <button class="quick-action-btn" onclick="pfTreatWounds()">
                            <span class="action-icon">🩹</span>
                            <span class="action-label">Treat Wounds</span>
                        </button>
                        <button class="quick-action-btn" onclick="pfRest()">
                            <span class="action-icon">🛏️</span>
                            <span class="action-label">Rest</span>
                        </button>
                    </div>
                </div>

                <!-- Degrees of Success Reference -->
                <div class="dashboard-section">
                    <h3 class="section-header">Degrees of Success</h3>
                    <div class="degrees-reference">
                        <div class="degree crit-success">Critical Success: Beat DC by 10+</div>
                        <div class="degree success">Success: Meet or beat DC</div>
                        <div class="degree failure">Failure: Below DC</div>
                        <div class="degree crit-fail">Critical Failure: Below DC by 10+</div>
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
                        <label for="pf_ancestry">Ancestry</label>
                        <input type="text" id="pf_ancestry" placeholder="e.g., Human, Elf">
                    </div>
                    <div class="field-group">
                        <label for="pf_heritage">Heritage</label>
                        <input type="text" id="pf_heritage" placeholder="e.g., Versatile, Seer">
                    </div>
                    <div class="field-group">
                        <label for="pf_background">Background</label>
                        <input type="text" id="pf_background" placeholder="e.g., Scholar, Guard">
                    </div>
                </div>
                <div class="grid-2">
                    <div class="field-group">
                        <label for="pf_class">Class</label>
                        <input type="text" id="pf_class" placeholder="e.g., Fighter, Wizard">
                    </div>
                    <div class="field-group">
                        <label for="pf_level">Level</label>
                        <input type="number" id="pf_level" min="1" max="20" value="1">
                    </div>
                </div>
                <div class="grid-2">
                    <div class="field-group">
                        <label for="pf_deity">Deity</label>
                        <input type="text" id="pf_deity" placeholder="e.g., Sarenrae">
                    </div>
                    <div class="field-group">
                        <label for="pf_alignment">Alignment/Edicts</label>
                        <input type="text" id="pf_alignment" placeholder="e.g., NG, Edicts: Help others">
                    </div>
                </div>
                <div class="field-group">
                    <label for="pf_xp">Experience Points</label>
                    <input type="number" id="pf_xp" min="0" value="0">
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
                <p class="section-hint">Modifier = (Score - 10) / 2</p>
                <div class="pf-attributes-grid">
                    ${config.attributes.map(attr => `
                        <div class="pf-attribute-card" data-attr="${attr.id}">
                            <div class="attr-name">${attr.abbr}</div>
                            <input type="number" class="attr-score" id="pf_attr_${attr.id}" min="1" max="30" value="10"
                                   onchange="updatePFModifier('${attr.id}')" oninput="updatePFModifier('${attr.id}')">
                            <div class="attr-modifier" id="pf_mod_${attr.id}">+0</div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Saving Throws</h2>
                <div class="saves-grid">
                    ${config.savingThrows.map(save => `
                        <div class="save-row">
                            <span class="save-name">${save.name}</span>
                            <span class="save-attr">(${save.attribute.substring(0,3).toUpperCase()})</span>
                            <select id="pf_save_${save.id}_prof" class="prof-select" onchange="updatePFSave('${save.id}', '${save.attribute}')">
                                ${config.proficiencyRanks.map(rank => `
                                    <option value="${rank.bonus}">${rank.name[0]}</option>
                                `).join('')}
                            </select>
                            <span class="save-total" id="pf_save_${save.id}_total">+0</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Skills</h2>
                <p class="section-hint">Proficiency: U=Untrained, T=Trained (+2+lvl), E=Expert (+4+lvl), M=Master (+6+lvl), L=Legendary (+8+lvl)</p>
                <div class="skills-list pf-skills">
                    ${renderPF2eSkills(config)}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Lore Skills</h2>
                <div class="lore-skills">
                    ${[1,2,3].map(i => `
                        <div class="lore-row">
                            <input type="text" id="pf_lore_${i}_name" placeholder="Lore (e.g., Warfare)">
                            <select id="pf_lore_${i}_prof" class="prof-select">
                                ${config.proficiencyRanks.map(rank => `
                                    <option value="${rank.bonus}">${rank.name[0]}</option>
                                `).join('')}
                            </select>
                        </div>
                    `).join('')}
                </div>
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
                        <input type="number" id="pf_ac" value="10">
                    </div>
                    <div class="combat-stat-card">
                        <label>Perception</label>
                        <div class="perception-row">
                            <select id="pf_perception_prof" class="prof-select">
                                ${config.proficiencyRanks.map(rank => `
                                    <option value="${rank.bonus}">${rank.name[0]}</option>
                                `).join('')}
                            </select>
                            <span class="perception-total" id="pf_perception_total">+0</span>
                        </div>
                    </div>
                    <div class="combat-stat-card">
                        <label>Speed</label>
                        <input type="text" id="pf_speed" value="25 ft">
                    </div>
                    <div class="combat-stat-card">
                        <label>Class DC</label>
                        <input type="number" id="pf_class_dc" value="10">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    Hit Points
                </h2>
                <div class="hp-container pf-hp">
                    <div class="hp-main">
                        <div class="field-group">
                            <label>Current HP</label>
                            <input type="number" id="pf_hp_current" min="0" value="15">
                        </div>
                        <div class="hp-separator">/</div>
                        <div class="field-group">
                            <label>Max HP</label>
                            <input type="number" id="pf_hp_max" min="1" value="15">
                        </div>
                    </div>
                    <div class="field-group">
                        <label>Temporary HP</label>
                        <input type="number" id="pf_hp_temp" min="0" value="0">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Hero Points</h2>
                <div class="hero-points">
                    <div class="hero-point-boxes">
                        ${[1,2,3].map(i => `
                            <input type="checkbox" id="pf_hero_point_${i}" class="hero-point-box">
                        `).join('')}
                    </div>
                    <span class="hero-hint">(Max 3, regain 1 at session start)</span>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Resistances, Immunities & Weaknesses</h2>
                <div class="grid-3">
                    <div class="field-group">
                        <label>Resistances</label>
                        <input type="text" id="pf_resistances" placeholder="e.g., Fire 5">
                    </div>
                    <div class="field-group">
                        <label>Immunities</label>
                        <input type="text" id="pf_immunities" placeholder="e.g., Sleep">
                    </div>
                    <div class="field-group">
                        <label>Weaknesses</label>
                        <input type="text" id="pf_weaknesses" placeholder="e.g., Cold Iron 5">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Strikes</h2>
                <table class="strikes-table">
                    <thead>
                        <tr>
                            <th>Weapon</th>
                            <th>Prof</th>
                            <th>Attack</th>
                            <th>Damage</th>
                            <th>Traits</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${[1,2,3,4].map(i => `
                            <tr>
                                <td><input type="text" id="pf_strike_${i}_name" placeholder="Weapon"></td>
                                <td>
                                    <select id="pf_strike_${i}_prof" class="prof-select-small">
                                        ${config.proficiencyRanks.map(rank => `
                                            <option value="${rank.bonus}">${rank.name[0]}</option>
                                        `).join('')}
                                    </select>
                                </td>
                                <td><input type="text" id="pf_strike_${i}_attack" placeholder="+5"></td>
                                <td><input type="text" id="pf_strike_${i}_damage" placeholder="1d8+3 S"></td>
                                <td><input type="text" id="pf_strike_${i}_traits" placeholder="Versatile P"></td>
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
                        <label>Tradition</label>
                        <select id="pf_spell_tradition">
                            <option value="">None</option>
                            <option value="arcane">Arcane</option>
                            <option value="divine">Divine</option>
                            <option value="occult">Occult</option>
                            <option value="primal">Primal</option>
                        </select>
                    </div>
                    <div class="field-group">
                        <label>Spell DC</label>
                        <input type="number" id="pf_spell_dc" value="10">
                    </div>
                    <div class="field-group">
                        <label>Spell Attack</label>
                        <input type="text" id="pf_spell_attack" value="+0">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Focus Points</h2>
                <div class="focus-points">
                    <div class="field-group">
                        <label>Current / Max</label>
                        <div class="focus-inputs">
                            <input type="number" id="pf_focus_current" min="0" value="0" style="width: 60px;">
                            <span>/</span>
                            <input type="number" id="pf_focus_max" min="0" max="3" value="0" style="width: 60px;">
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Spell Slots</h2>
                <div class="spell-slots-grid pf-slots">
                    ${[1,2,3,4,5,6,7,8,9,10].map(level => `
                        <div class="spell-slot-row">
                            <span class="slot-level">${level === 10 ? '10th' : level + getOrdinalSuffix(level)}</span>
                            <div class="slot-checkboxes">
                                ${[1,2,3,4].map(slot => `
                                    <input type="checkbox" id="pf_slot_${level}_${slot}" class="slot-checkbox">
                                `).join('')}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Cantrips</h2>
                <textarea id="pf_cantrips" rows="4" placeholder="List your cantrips..."></textarea>
            </div>

            <div class="section">
                <h2 class="section-title">Spells</h2>
                <textarea id="pf_spells" rows="10" placeholder="List your spells by rank..."></textarea>
            </div>

            <div class="section">
                <h2 class="section-title">Focus Spells</h2>
                <textarea id="pf_focus_spells" rows="4" placeholder="List your focus spells..."></textarea>
            </div>
        </div>

        <!-- INVENTORY TAB -->
        <div class="tab-content" id="system-inventory" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
                    Currency
                </h2>
                <div class="currency-grid pf-currency">
                    <div class="currency-item">
                        <label>CP</label>
                        <input type="number" id="pf_cp" min="0" value="0">
                    </div>
                    <div class="currency-item">
                        <label>SP</label>
                        <input type="number" id="pf_sp" min="0" value="0">
                    </div>
                    <div class="currency-item">
                        <label>GP</label>
                        <input type="number" id="pf_gp" min="0" value="0">
                    </div>
                    <div class="currency-item">
                        <label>PP</label>
                        <input type="number" id="pf_pp" min="0" value="0">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Bulk</h2>
                <div class="bulk-tracker">
                    <div class="field-group">
                        <label>Current Bulk</label>
                        <input type="number" id="pf_bulk_current" min="0" value="0" step="0.1">
                    </div>
                    <div class="field-group">
                        <label>Encumbered At</label>
                        <span id="pf_bulk_encumbered">5</span>
                    </div>
                    <div class="field-group">
                        <label>Maximum</label>
                        <span id="pf_bulk_max">10</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Equipment</h2>
                <textarea id="pf_equipment" rows="10" placeholder="Item (Bulk)..."></textarea>
            </div>

            <div class="section">
                <h2 class="section-title">Feats & Abilities</h2>
                <div class="grid-2">
                    <div class="field-group">
                        <label>Ancestry Feats</label>
                        <textarea id="pf_ancestry_feats" rows="4" placeholder="Ancestry feats..."></textarea>
                    </div>
                    <div class="field-group">
                        <label>Class Feats</label>
                        <textarea id="pf_class_feats" rows="4" placeholder="Class feats..."></textarea>
                    </div>
                </div>
                <div class="grid-2">
                    <div class="field-group">
                        <label>Skill Feats</label>
                        <textarea id="pf_skill_feats" rows="4" placeholder="Skill feats..."></textarea>
                    </div>
                    <div class="field-group">
                        <label>General Feats</label>
                        <textarea id="pf_general_feats" rows="4" placeholder="General feats..."></textarea>
                    </div>
                </div>
            </div>
        </div>

        <!-- DICE TAB -->
        <div class="tab-content" id="system-dice" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8" cy="8" r="1.5"/><circle cx="16" cy="8" r="1.5"/><circle cx="8" cy="16" r="1.5"/><circle cx="16" cy="16" r="1.5"/><circle cx="12" cy="12" r="1.5"/></svg>
                    Dice Roller
                </h2>
                <p class="section-hint">d20 + modifier vs DC. Beat DC by 10+ = Critical Success. Fail by 10+ = Critical Failure.</p>

                <div class="dice-roller-pf">
                    <div class="quick-dice">
                        <button class="dice-btn" onclick="rollPFDice(20)">d20</button>
                        <button class="dice-btn" onclick="rollPFDice(12)">d12</button>
                        <button class="dice-btn" onclick="rollPFDice(10)">d10</button>
                        <button class="dice-btn" onclick="rollPFDice(8)">d8</button>
                        <button class="dice-btn" onclick="rollPFDice(6)">d6</button>
                        <button class="dice-btn" onclick="rollPFDice(4)">d4</button>
                    </div>

                    <div class="check-roller">
                        <div class="field-group">
                            <label>d20 + Modifier vs DC</label>
                            <div class="check-inputs">
                                <span>d20 +</span>
                                <input type="number" id="pf_check_mod" value="5" style="width: 60px;">
                                <span>vs DC</span>
                                <input type="number" id="pf_check_dc" value="15" style="width: 60px;">
                                <button class="dice-btn roll-check" onclick="rollPFCheck()">Roll Check</button>
                            </div>
                        </div>
                    </div>

                    <div class="roll-result-container pf-result">
                        <div class="roll-result" id="pf_roll_result">-</div>
                        <div class="roll-outcome" id="pf_outcome"></div>
                        <div class="roll-details" id="pf_roll_details"></div>
                    </div>

                    <div class="roll-history" id="pf_roll_history">
                        <h3>Roll History</h3>
                        <div class="history-list" id="pf_history_list"></div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Quick Checks</h2>
                <div class="quick-checks pf-checks">
                    <button class="check-btn" onclick="rollPFSaveCheck('fortitude')">Fortitude</button>
                    <button class="check-btn" onclick="rollPFSaveCheck('reflex')">Reflex</button>
                    <button class="check-btn" onclick="rollPFSaveCheck('will')">Will</button>
                    <button class="check-btn" onclick="rollPFPerception()">Perception</button>
                </div>
            </div>
        </div>

        <!-- RULES TAB -->
        <div class="tab-content" id="system-rules" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    Pathfinder 2e Quick Reference
                </h2>

                <div class="rules-accordion">
                    <details class="rules-section">
                        <summary>Degrees of Success</summary>
                        <div class="rules-content">
                            <p><strong>Critical Success:</strong> Beat DC by 10+ OR natural 20 upgrades success to crit</p>
                            <p><strong>Success:</strong> Meet or exceed DC</p>
                            <p><strong>Failure:</strong> Below DC</p>
                            <p><strong>Critical Failure:</strong> Fail by 10+ OR natural 1 downgrades failure to crit fail</p>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Proficiency</summary>
                        <div class="rules-content">
                            <ul>
                                <li><strong>Untrained:</strong> +0</li>
                                <li><strong>Trained:</strong> +2 + level</li>
                                <li><strong>Expert:</strong> +4 + level</li>
                                <li><strong>Master:</strong> +6 + level</li>
                                <li><strong>Legendary:</strong> +8 + level</li>
                            </ul>
                            <p>Total = Ability Modifier + Proficiency + Item Bonus + Other</p>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Actions in Combat</summary>
                        <div class="rules-content">
                            <p><strong>3 Actions per turn</strong> (plus 1 reaction)</p>
                            <p><strong>Common Actions:</strong></p>
                            <ul>
                                <li><strong>Stride:</strong> Move up to your Speed (1 action)</li>
                                <li><strong>Strike:</strong> Make an attack (1 action)</li>
                                <li><strong>Step:</strong> Move 5 feet without triggering reactions (1 action)</li>
                                <li><strong>Interact:</strong> Draw/stow items, open doors (1 action)</li>
                                <li><strong>Cast a Spell:</strong> 1-3 actions depending on spell</li>
                                <li><strong>Raise a Shield:</strong> +2 AC until next turn (1 action)</li>
                            </ul>
                            <p><strong>Multiple Attack Penalty:</strong></p>
                            <ul>
                                <li>2nd attack: -5 (-4 with agile)</li>
                                <li>3rd+ attack: -10 (-8 with agile)</li>
                            </ul>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Hero Points</summary>
                        <div class="rules-content">
                            <p><strong>Start each session with 1 Hero Point</strong></p>
                            <p><strong>Maximum:</strong> 3 Hero Points</p>
                            <p><strong>Uses:</strong></p>
                            <ul>
                                <li><strong>Reroll:</strong> Spend 1 Hero Point to reroll a check (must use new result)</li>
                                <li><strong>Avoid Death:</strong> Spend all Hero Points when dying to stabilize at 0 HP and become conscious</li>
                            </ul>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Conditions</summary>
                        <div class="rules-content">
                            <ul>
                                <li><strong>Blinded:</strong> -4 to Perception, Seek to know location</li>
                                <li><strong>Clumsy X:</strong> -X to DEX-based checks</li>
                                <li><strong>Drained X:</strong> -X to CON-based checks, lose X x level HP</li>
                                <li><strong>Enfeebled X:</strong> -X to STR-based checks</li>
                                <li><strong>Frightened X:</strong> -X to all checks, reduces by 1/turn</li>
                                <li><strong>Sickened X:</strong> -X to all checks, can retch to reduce</li>
                                <li><strong>Slowed X:</strong> Lose X actions per turn</li>
                                <li><strong>Stunned X:</strong> Lose X actions total</li>
                            </ul>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Dying & Recovery</summary>
                        <div class="rules-content">
                            <p><strong>At 0 HP:</strong> Gain Dying 1 (or Dying 2 from crit)</p>
                            <p><strong>Each Turn:</strong> Roll flat DC 10 check</p>
                            <ul>
                                <li><strong>Crit Success:</strong> Reduce dying by 2</li>
                                <li><strong>Success:</strong> Reduce dying by 1</li>
                                <li><strong>Failure:</strong> Increase dying by 1</li>
                                <li><strong>Crit Failure:</strong> Increase dying by 2</li>
                            </ul>
                            <p><strong>Dying 4:</strong> You die</p>
                            <p><strong>Wounded X:</strong> Add X to dying value when you gain dying</p>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Resting</summary>
                        <div class="rules-content">
                            <p><strong>10-Minute Rest:</strong> Refocus (regain 1 Focus Point), Treat Wounds, Repair</p>
                            <p><strong>Daily Preparations (8 hours):</strong></p>
                            <ul>
                                <li>Regain all HP</li>
                                <li>Regain all spell slots</li>
                                <li>Regain all Focus Points</li>
                                <li>Reduce some conditions</li>
                            </ul>
                        </div>
                    </details>
                </div>

                <div class="rules-links">
                    <a href="https://2e.aonprd.com/" target="_blank" class="rules-link">Archives of Nethys</a>
                    <a href="https://2e.aonprd.com/Rules.aspx" target="_blank" class="rules-link">Core Rules</a>
                </div>
            </div>
        </div>
    `;
}

// Render PF2e skills
function renderPF2eSkills(config) {
    let html = '';
    const skillsByAttr = config.skills;

    for (const [attrId, skills] of Object.entries(skillsByAttr)) {
        const attr = config.attributes.find(a => a.id === attrId);
        if (!attr || skills.length === 0) continue;

        skills.forEach(skill => {
            const skillId = skill.toLowerCase().replace(/\s+/g, '_');
            html += `
                <div class="skill-row pf-skill">
                    <span class="skill-name">${skill}</span>
                    <span class="skill-attr">(${attr.abbr})</span>
                    <select id="pf_skill_${skillId}_prof" class="prof-select" onchange="updatePFSkill('${skillId}', '${attrId}')">
                        ${config.proficiencyRanks.map(rank => `
                            <option value="${rank.bonus}">${rank.name[0]}</option>
                        `).join('')}
                    </select>
                    <span class="skill-total" id="pf_skill_${skillId}_total">+0</span>
                </div>
            `;
        });
    }

    return html;
}

// Helper for ordinal suffix
function getOrdinalSuffix(n) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return s[(v - 20) % 10] || s[v] || s[0];
}

// Update PF modifier
function updatePFModifier(attrId) {
    const scoreInput = document.getElementById(`pf_attr_${attrId}`);
    const modDisplay = document.getElementById(`pf_mod_${attrId}`);

    if (scoreInput && modDisplay) {
        const score = parseInt(scoreInput.value) || 10;
        const mod = Math.floor((score - 10) / 2);
        modDisplay.textContent = formatModifier(mod);
    }

    // Update bulk limits if strength changed
    if (attrId === 'strength') {
        updatePFBulk();
    }

    // Update related skills and saves
    updatePFSkillsForAttribute(attrId);
    updatePFSavesForAttribute(attrId);
}

// Update PF skill
function updatePFSkill(skillId, attrId) {
    const profSelect = document.getElementById(`pf_skill_${skillId}_prof`);
    const scoreInput = document.getElementById(`pf_attr_${attrId}`);
    const levelInput = document.getElementById('pf_level');
    const totalDisplay = document.getElementById(`pf_skill_${skillId}_total`);

    if (profSelect && scoreInput && totalDisplay) {
        const profBonus = parseInt(profSelect.value) || 0;
        const score = parseInt(scoreInput.value) || 10;
        const mod = Math.floor((score - 10) / 2);
        const level = parseInt(levelInput?.value) || 1;

        let total = mod;
        if (profBonus > 0) {
            total += profBonus + level;
        }

        totalDisplay.textContent = formatModifier(total);
    }
}

// Update skills for an attribute
function updatePFSkillsForAttribute(attrId) {
    const config = SYSTEM_CONFIGS.pathfinder2e;
    const skills = config.skills[attrId] || [];

    skills.forEach(skill => {
        const skillId = skill.toLowerCase().replace(/\s+/g, '_');
        updatePFSkill(skillId, attrId);
    });
}

// Update PF save
function updatePFSave(saveId, attrId) {
    const profSelect = document.getElementById(`pf_save_${saveId}_prof`);
    const scoreInput = document.getElementById(`pf_attr_${attrId}`);
    const levelInput = document.getElementById('pf_level');
    const totalDisplay = document.getElementById(`pf_save_${saveId}_total`);

    if (profSelect && scoreInput && totalDisplay) {
        const profBonus = parseInt(profSelect.value) || 0;
        const score = parseInt(scoreInput.value) || 10;
        const mod = Math.floor((score - 10) / 2);
        const level = parseInt(levelInput?.value) || 1;

        let total = mod;
        if (profBonus > 0) {
            total += profBonus + level;
        }

        totalDisplay.textContent = formatModifier(total);
    }
}

// Update saves for attribute change
function updatePFSavesForAttribute(attrId) {
    const config = SYSTEM_CONFIGS.pathfinder2e;
    config.savingThrows.forEach(save => {
        if (save.attribute === attrId) {
            updatePFSave(save.id, attrId);
        }
    });
}

// Update PF bulk limits
function updatePFBulk() {
    const strScore = document.getElementById('pf_attr_strength');
    const encumberedDisplay = document.getElementById('pf_bulk_encumbered');
    const maxDisplay = document.getElementById('pf_bulk_max');

    if (strScore) {
        const score = parseInt(strScore.value) || 10;
        const mod = Math.floor((score - 10) / 2);
        const encumbered = 5 + mod;
        const max = 10 + mod;

        if (encumberedDisplay) encumberedDisplay.textContent = encumbered;
        if (maxDisplay) maxDisplay.textContent = max;
    }
}

// Roll PF dice
function rollPFDice(sides) {
    const result = Math.floor(Math.random() * sides) + 1;
    displayPFRoll(`1d${sides}`, result, null, '');
}

// Roll PF check with degrees of success
function rollPFCheck() {
    const mod = parseInt(document.getElementById('pf_check_mod').value) || 0;
    const dc = parseInt(document.getElementById('pf_check_dc').value) || 15;

    const roll = Math.floor(Math.random() * 20) + 1;
    const total = roll + mod;

    // Determine degree of success
    let outcome = '';
    let outcomeClass = '';

    const diff = total - dc;

    if (roll === 20 && diff >= 0) {
        outcome = 'Critical Success!';
        outcomeClass = 'crit-success';
    } else if (roll === 1 && diff < 0) {
        outcome = 'Critical Failure!';
        outcomeClass = 'crit-fail';
    } else if (diff >= 10) {
        outcome = 'Critical Success!';
        outcomeClass = 'crit-success';
    } else if (diff >= 0) {
        outcome = 'Success';
        outcomeClass = 'success';
    } else if (diff >= -9) {
        outcome = 'Failure';
        outcomeClass = 'failure';
    } else {
        outcome = 'Critical Failure!';
        outcomeClass = 'crit-fail';
    }

    // Natural 20/1 upgrade/downgrade
    if (roll === 20 && outcomeClass === 'success') {
        outcome = 'Critical Success! (nat 20)';
        outcomeClass = 'crit-success';
    } else if (roll === 1 && outcomeClass === 'failure') {
        outcome = 'Critical Failure! (nat 1)';
        outcomeClass = 'crit-fail';
    }

    displayPFRoll(`d20${formatModifier(mod)} vs DC ${dc}`, total, roll, outcome, outcomeClass);
}

// Roll save check
function rollPFSaveCheck(saveId) {
    const totalDisplay = document.getElementById(`pf_save_${saveId}_total`);
    if (totalDisplay) {
        const mod = parseInt(totalDisplay.textContent) || 0;
        document.getElementById('pf_check_mod').value = mod;
        rollPFCheck();
    }
}

// Roll perception
function rollPFPerception() {
    const totalDisplay = document.getElementById('pf_perception_total');
    if (totalDisplay) {
        const mod = parseInt(totalDisplay.textContent) || 0;
        document.getElementById('pf_check_mod').value = mod;
        rollPFCheck();
    }
}

// Display PF roll result
function displayPFRoll(label, total, roll, outcome, outcomeClass = '') {
    const resultDisplay = document.getElementById('pf_roll_result');
    const outcomeDisplay = document.getElementById('pf_outcome');
    const detailsDisplay = document.getElementById('pf_roll_details');
    const historyList = document.getElementById('pf_history_list');

    if (resultDisplay) {
        resultDisplay.textContent = total;
        resultDisplay.className = `roll-result ${outcomeClass}`;
    }

    if (outcomeDisplay) {
        outcomeDisplay.textContent = outcome;
        outcomeDisplay.className = `roll-outcome ${outcomeClass}`;
    }

    if (detailsDisplay && roll !== null) {
        detailsDisplay.textContent = `Natural roll: ${roll}`;
    } else if (detailsDisplay) {
        detailsDisplay.textContent = label;
    }

    // Add to history
    if (historyList) {
        const historyItem = document.createElement('div');
        historyItem.className = `history-item ${outcomeClass}`;
        historyItem.innerHTML = `<span class="history-label">${label}</span><span class="history-result">${total}</span>`;
        historyList.insertBefore(historyItem, historyList.firstChild);

        while (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
    }
}

// Update perception
function updatePFPerception() {
    const profSelect = document.getElementById('pf_perception_prof');
    const wisScore = document.getElementById('pf_attr_wisdom');
    const levelInput = document.getElementById('pf_level');
    const totalDisplay = document.getElementById('pf_perception_total');

    if (profSelect && wisScore && totalDisplay) {
        const profBonus = parseInt(profSelect.value) || 0;
        const score = parseInt(wisScore.value) || 10;
        const mod = Math.floor((score - 10) / 2);
        const level = parseInt(levelInput?.value) || 1;

        let total = mod;
        if (profBonus > 0) {
            total += profBonus + level;
        }

        totalDisplay.textContent = formatModifier(total);
    }
}

// Initialize PF2e sheet
function initializePF2e() {
    const config = SYSTEM_CONFIGS.pathfinder2e;

    // Set up attribute listeners
    config.attributes.forEach(attr => {
        const input = document.getElementById(`pf_attr_${attr.id}`);
        if (input) {
            input.addEventListener('change', () => updatePFModifier(attr.id));
            input.addEventListener('input', () => updatePFModifier(attr.id));
            updatePFModifier(attr.id);
        }
    });

    // Set up level listener
    const levelInput = document.getElementById('pf_level');
    if (levelInput) {
        levelInput.addEventListener('change', () => {
            config.attributes.forEach(attr => {
                updatePFSkillsForAttribute(attr.id);
                updatePFSavesForAttribute(attr.id);
            });
            updatePFPerception();
        });
    }

    // Set up perception listener
    const perceptionProf = document.getElementById('pf_perception_prof');
    if (perceptionProf) {
        perceptionProf.addEventListener('change', updatePFPerception);
    }

    // Initial bulk calculation
    updatePFBulk();
}

// Update the overview tab with current values
function updatePFOverview() {
    const config = SYSTEM_CONFIGS.pathfinder2e;

    // Character summary
    const name = document.getElementById('character_name')?.value || 'New Character';
    const ancestry = document.getElementById('pf_ancestry')?.value || '-';
    const charClass = document.getElementById('pf_class')?.value || '-';
    const level = document.getElementById('pf_level')?.value || '1';

    const nameEl = document.getElementById('pf-summary-name');
    const ancestryEl = document.getElementById('pf-summary-ancestry');
    const classEl = document.getElementById('pf-summary-class');
    const levelEl = document.getElementById('pf-summary-level');
    const avatarEl = document.getElementById('pf-avatar');

    if (nameEl) nameEl.textContent = name || 'New Character';
    if (ancestryEl) ancestryEl.textContent = ancestry || '-';
    if (classEl) classEl.textContent = charClass || '-';
    if (levelEl) levelEl.textContent = level;
    if (avatarEl) {
        const initial = name ? name.charAt(0).toUpperCase() : '?';
        avatarEl.querySelector('.avatar-initial').textContent = initial;
    }

    // Combat stats
    const hp = document.getElementById('pf_hp_current')?.value || '10';
    const hpMax = document.getElementById('pf_hp_max')?.value || '10';
    const tempHp = document.getElementById('pf_hp_temp')?.value || '0';
    const ac = document.getElementById('pf_ac')?.value || '10';
    const speed = document.getElementById('pf_speed')?.value || '25';
    const classDC = document.getElementById('pf_class_dc')?.value || '10';

    const hpEl = document.getElementById('pf-overview-hp');
    const hpMaxEl = document.getElementById('pf-overview-hp-max');
    const acEl = document.getElementById('pf-overview-ac');
    const speedEl = document.getElementById('pf-overview-speed');
    const classDCEl = document.getElementById('pf-overview-class-dc');

    if (hpEl) hpEl.textContent = hp;
    if (hpMaxEl) hpMaxEl.textContent = hpMax;
    if (acEl) acEl.textContent = ac;
    if (speedEl) speedEl.textContent = speed.replace(' ft', '').replace(' feet', '');
    if (classDCEl) classDCEl.textContent = classDC;

    // Temp HP
    const tempHpDisplay = document.getElementById('pf-temp-hp-display');
    const tempHpValue = document.getElementById('pf-overview-temp-hp');
    if (tempHpDisplay && tempHpValue) {
        if (parseInt(tempHp) > 0) {
            tempHpDisplay.style.display = 'block';
            tempHpValue.textContent = tempHp;
        } else {
            tempHpDisplay.style.display = 'none';
        }
    }

    // Perception
    const perceptionTotal = document.getElementById('pf_perception_total')?.textContent || '+0';
    const perceptionEl = document.getElementById('pf-overview-perception');
    if (perceptionEl) perceptionEl.textContent = perceptionTotal;

    // Ability scores and mods
    config.attributes.forEach(attr => {
        const score = parseInt(document.getElementById(`pf_attr_${attr.id}`)?.value) || 10;
        const mod = Math.floor((score - 10) / 2);

        const scoreEl = document.getElementById(`pf-overview-score-${attr.id}`);
        const modEl = document.getElementById(`pf-overview-mod-${attr.id}`);

        if (scoreEl) scoreEl.textContent = score;
        if (modEl) modEl.textContent = formatModifier(mod);
    });

    // Saving throws
    config.savingThrows.forEach(save => {
        const totalEl = document.getElementById(`pf_save_${save.id}_total`);
        const profSelect = document.getElementById(`pf_save_${save.id}_prof`);

        const overviewTotalEl = document.getElementById(`pf-overview-save-${save.id}`);
        const overviewProfEl = document.getElementById(`pf-overview-save-prof-${save.id}`);

        if (totalEl && overviewTotalEl) {
            overviewTotalEl.textContent = totalEl.textContent;
        }

        if (profSelect && overviewProfEl) {
            const profRanks = ['U', 'T', 'E', 'M', 'L'];
            const profIndex = profSelect.selectedIndex;
            overviewProfEl.textContent = profRanks[profIndex] || 'U';
            overviewProfEl.className = 'save-prof-badge prof-' + profRanks[profIndex]?.toLowerCase();
        }
    });

    // Hero points
    const heroPoints = parseInt(document.getElementById('pf_hero_points')?.value) || 0;
    updatePFHeroPointsDisplay(heroPoints);

    // Focus points
    const focusCurrent = document.getElementById('pf_focus_current')?.value;
    const focusMax = document.getElementById('pf_focus_max')?.value;
    const focusSection = document.getElementById('pf-focus-section');
    if (focusMax && parseInt(focusMax) > 0) {
        if (focusSection) focusSection.style.display = 'block';
        const focusCurrentEl = document.getElementById('pf-overview-focus');
        const focusMaxEl = document.getElementById('pf-overview-focus-max');
        if (focusCurrentEl) focusCurrentEl.textContent = focusCurrent || '0';
        if (focusMaxEl) focusMaxEl.textContent = focusMax;
    } else {
        if (focusSection) focusSection.style.display = 'none';
    }

    // Resistances/Weaknesses
    const resistances = document.getElementById('pf_resistances')?.value;
    const weaknesses = document.getElementById('pf_weaknesses')?.value;

    const resistSection = document.getElementById('pf-resistances-section');
    const weakSection = document.getElementById('pf-weaknesses-section');
    const resistList = document.getElementById('pf-overview-resistances');
    const weakList = document.getElementById('pf-overview-weaknesses');

    if (resistances && resistances.trim()) {
        if (resistSection) resistSection.style.display = 'block';
        if (resistList) resistList.textContent = resistances;
    } else {
        if (resistSection) resistSection.style.display = 'none';
    }

    if (weaknesses && weaknesses.trim()) {
        if (weakSection) weakSection.style.display = 'block';
        if (weakList) weakList.textContent = weaknesses;
    } else {
        if (weakSection) weakSection.style.display = 'none';
    }
}

// Update hero points display
function updatePFHeroPointsDisplay(points) {
    const dots = document.querySelectorAll('#pf-hero-points .hero-dot');
    dots.forEach((dot, index) => {
        dot.textContent = index < points ? '●' : '○';
        dot.classList.toggle('filled', index < points);
    });
}

// Set hero points from overview
function setPFHeroPoints(points) {
    const currentPoints = parseInt(document.getElementById('pf_hero_points')?.value) || 0;
    const newPoints = (points === currentPoints) ? points - 1 : points;

    const heroInput = document.getElementById('pf_hero_points');
    if (heroInput) {
        heroInput.value = Math.max(0, Math.min(3, newPoints));
    }
    updatePFOverview();
}

// Adjust HP from overview
function adjustPFHP(delta) {
    const hpInput = document.getElementById('pf_hp_current');
    const maxHpInput = document.getElementById('pf_hp_max');

    if (hpInput) {
        const current = parseInt(hpInput.value) || 0;
        const max = parseInt(maxHpInput?.value) || 999;
        const newValue = Math.max(0, Math.min(max, current + delta));
        hpInput.value = newValue;
        updatePFOverview();
    }
}

// Adjust Focus from overview
function adjustPFFocus(delta) {
    const focusInput = document.getElementById('pf_focus_current');
    const maxFocusInput = document.getElementById('pf_focus_max');

    if (focusInput) {
        const current = parseInt(focusInput.value) || 0;
        const max = parseInt(maxFocusInput?.value) || 3;
        const newValue = Math.max(0, Math.min(max, current + delta));
        focusInput.value = newValue;
        updatePFOverview();
    }
}

// Refocus action
function pfRefocus() {
    const focusInput = document.getElementById('pf_focus_current');
    const maxFocusInput = document.getElementById('pf_focus_max');

    if (focusInput && maxFocusInput) {
        const current = parseInt(focusInput.value) || 0;
        const max = parseInt(maxFocusInput.value) || 0;

        if (current < max) {
            focusInput.value = Math.min(max, current + 1);
            updatePFOverview();
            alert('Refocus: Regained 1 Focus Point.\n\nYou can Refocus during exploration by spending 10 minutes.');
        } else {
            alert('Focus Pool is already full!');
        }
    } else {
        alert('No Focus Pool set up.\n\nAdd Focus Points in the Combat tab if your class uses them.');
    }
}

// Treat Wounds
function pfTreatWounds() {
    alert('Treat Wounds (Medicine check):\n\n' +
          '• DC 15: Heal 2d8\n' +
          '• DC 20 (Expert): Heal 2d8+10\n' +
          '• DC 30 (Master): Heal 2d8+30\n' +
          '• DC 40 (Legendary): Heal 2d8+50\n\n' +
          'Critical Success: Double healing\n' +
          'Critical Failure: Deal 1d8 damage\n\n' +
          'Takes 10 minutes. Target is immune for 1 hour.');
}

// Rest
function pfRest() {
    const hpMax = document.getElementById('pf_hp_max')?.value || '10';
    const hpInput = document.getElementById('pf_hp_current');
    const focusInput = document.getElementById('pf_focus_current');
    const focusMax = document.getElementById('pf_focus_max')?.value || '0';

    if (confirm('Take a full 8-hour rest?\n\n• Regain all HP\n• Regain all Focus Points\n• Regain all spell slots')) {
        if (hpInput) hpInput.value = hpMax;
        if (focusInput && parseInt(focusMax) > 0) focusInput.value = focusMax;

        updatePFOverview();
        alert('Rest complete!\n\nHP and Focus Points restored.');
    }
}

// Set up overview listeners
function setupPFOverviewListeners() {
    const fieldsToWatch = [
        'character_name', 'pf_ancestry', 'pf_class', 'pf_level',
        'pf_hp_current', 'pf_hp_max', 'pf_hp_temp',
        'pf_ac', 'pf_speed', 'pf_class_dc',
        'pf_hero_points', 'pf_focus_current', 'pf_focus_max',
        'pf_resistances', 'pf_weaknesses'
    ];

    fieldsToWatch.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', updatePFOverview);
            field.addEventListener('input', updatePFOverview);
        }
    });
}

// Extend initializePF2e to include overview
const originalInitializePF2e = initializePF2e;
initializePF2e = function() {
    originalInitializePF2e();
    setupPFOverviewListeners();
    setTimeout(updatePFOverview, 100);
};

// Export functions
if (typeof window !== 'undefined') {
    window.renderPathfinder2eSheet = renderPathfinder2eSheet;
    window.initializePF2e = initializePF2e;
    window.updatePFModifier = updatePFModifier;
    window.updatePFSkill = updatePFSkill;
    window.updatePFSave = updatePFSave;
    window.rollPFDice = rollPFDice;
    window.rollPFCheck = rollPFCheck;
    window.rollPFSaveCheck = rollPFSaveCheck;
    window.rollPFPerception = rollPFPerception;
    window.updatePFOverview = updatePFOverview;
    window.setPFHeroPoints = setPFHeroPoints;
    window.adjustPFHP = adjustPFHP;
    window.adjustPFFocus = adjustPFFocus;
    window.pfRefocus = pfRefocus;
    window.pfTreatWounds = pfTreatWounds;
    window.pfRest = pfRest;
}
