// ===========================================
// Pathfinder 2nd Edition Character Sheet Renderer
// ===========================================

function renderPathfinder2eSheet(config) {
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
}
