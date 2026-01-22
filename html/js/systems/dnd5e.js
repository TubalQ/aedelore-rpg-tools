// ===========================================
// D&D 5th Edition Character Sheet Renderer
// ===========================================

function renderDnD5eSheet(config) {
    return `
        <!-- INFO TAB -->
        <div class="tab-content active" id="system-info" style="display: block;">
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
                <div class="grid-2">
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
                </div>
                <div class="field-group">
                    <label for="dnd_xp">Experience Points</label>
                    <input type="number" id="dnd_xp" min="0" value="0">
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
                <div class="dnd-attributes-grid">
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
                        <input type="text" id="dnd_proficiency" value="+2">
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
                <div class="field-group" style="margin-top: 16px;">
                    <label>Exhaustion Level (0-6)</label>
                    <input type="number" id="dnd_exhaustion" min="0" max="6" value="0">
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
            input.addEventListener('change', () => updateDnDModifier(attr.id));
            input.addEventListener('input', () => updateDnDModifier(attr.id));
            // Initial update
            updateDnDModifier(attr.id);
        }
    });

    // Set up proficiency bonus listener
    const profInput = document.getElementById('dnd_proficiency');
    if (profInput) {
        profInput.addEventListener('change', () => {
            config.attributes.forEach(attr => {
                updateDnDSave(attr.id);
                updateDnDSkillsForAttribute(attr.id);
            });
        });
    }
}

// Export functions
if (typeof window !== 'undefined') {
    window.renderDnD5eSheet = renderDnD5eSheet;
    window.initializeDnD5e = initializeDnD5e;
    window.updateDnDModifier = updateDnDModifier;
    window.updateDnDSave = updateDnDSave;
    window.updateDnDSkill = updateDnDSkill;
    window.rollDnDDice = rollDnDDice;
    window.rollDnDCustom = rollDnDCustom;
    window.rollDnDCheck = rollDnDCheck;
}
