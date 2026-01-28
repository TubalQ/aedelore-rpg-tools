// ===========================================
// Chronicles of Darkness Character Sheet Renderer
// ===========================================

function renderCoDSheet(config) {
    return `
        <!-- OVERVIEW TAB -->
        <div class="tab-content active" id="system-overview" style="display: block;">
            <div class="system-dashboard cod-dashboard">
                <!-- Character Summary -->
                <div class="dashboard-card character-summary cod-summary">
                    <div class="summary-avatar cod-avatar" id="cod-avatar">
                        <span class="avatar-initial">?</span>
                    </div>
                    <div class="summary-info">
                        <h2 class="summary-name" id="cod-summary-name">New Character</h2>
                        <div class="summary-details">
                            <span id="cod-summary-concept">-</span>
                            <span id="cod-summary-faction">-</span>
                        </div>
                        <div class="cod-anchors">
                            <span class="virtue-badge" id="cod-summary-virtue">Virtue: -</span>
                            <span class="vice-badge" id="cod-summary-vice">Vice: -</span>
                        </div>
                    </div>
                </div>

                <!-- Health & Willpower -->
                <div class="dashboard-row">
                    <div class="dashboard-section compact">
                        <h3 class="section-header">Health</h3>
                        <div class="cod-health-track" id="cod-overview-health">
                            <!-- Filled by JS based on Stamina + Size -->
                        </div>
                    </div>
                    <div class="dashboard-section compact">
                        <h3 class="section-header">Willpower</h3>
                        <div class="cod-willpower-track">
                            <div class="wp-dots" id="cod-overview-wp-dots"></div>
                            <div class="wp-spent" id="cod-overview-wp-spent"></div>
                        </div>
                    </div>
                </div>

                <!-- Derived Stats -->
                <div class="dashboard-row combat-row cod-derived">
                    <div class="dashboard-stat">
                        <div class="stat-label">Defense</div>
                        <div class="stat-value-large" id="cod-overview-defense">1</div>
                    </div>
                    <div class="dashboard-stat">
                        <div class="stat-label">Initiative</div>
                        <div class="stat-value-large" id="cod-overview-initiative">1</div>
                    </div>
                    <div class="dashboard-stat">
                        <div class="stat-label">Speed</div>
                        <div class="stat-value-large" id="cod-overview-speed">5</div>
                    </div>
                    <div class="dashboard-stat">
                        <div class="stat-label">Armor</div>
                        <div class="stat-value-large" id="cod-overview-armor">0</div>
                    </div>
                    <div class="dashboard-stat">
                        <div class="stat-label">Size</div>
                        <div class="stat-value-large" id="cod-overview-size">5</div>
                    </div>
                </div>

                <!-- Integrity -->
                <div class="dashboard-section">
                    <h3 class="section-header">Integrity</h3>
                    <div class="cod-integrity-track">
                        ${[...Array(10)].map((_, i) => `
                            <span class="integrity-dot ${i < 7 ? 'filled' : ''}" data-value="${10-i}" onclick="setCoDIntegrity(${10-i})">${10-i}</span>
                        `).join('')}
                    </div>
                    <div class="integrity-value">Current: <span id="cod-overview-integrity">7</span></div>
                </div>

                <!-- Attributes -->
                <div class="dashboard-section">
                    <h3 class="section-header">Attributes</h3>
                    <div class="cod-attributes-grid">
                        ${['Mental', 'Physical', 'Social'].map(cat => `
                            <div class="attr-category">
                                <div class="cat-header">${cat}</div>
                                ${config.attributes.filter(a => a.category === cat).map(attr => `
                                    <div class="attr-row" onclick="rollCoDAttribute('${attr.id}')">
                                        <span class="attr-name">${attr.name}</span>
                                        <span class="attr-dots" id="cod-overview-${attr.id}">○○○○○</span>
                                    </div>
                                `).join('')}
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Beats / Experiences -->
                <div class="dashboard-row">
                    <div class="dashboard-section compact">
                        <h3 class="section-header">Beats</h3>
                        <div class="beats-track">
                            <div class="beat-dots" id="cod-overview-beats">○○○○○</div>
                            <span class="beat-hint">(5 beats = 1 XP)</span>
                        </div>
                    </div>
                    <div class="dashboard-section compact">
                        <h3 class="section-header">Experiences</h3>
                        <div class="xp-value" id="cod-overview-xp">0</div>
                    </div>
                </div>

                <!-- Conditions -->
                <div class="dashboard-section" id="cod-conditions-section" style="display: none;">
                    <h3 class="section-header">Conditions</h3>
                    <div class="conditions-list" id="cod-overview-conditions">-</div>
                </div>

                <!-- Quick Actions -->
                <div class="dashboard-section">
                    <h3 class="section-header">Quick Actions</h3>
                    <div class="quick-actions-grid">
                        <button class="quick-action-btn" onclick="rollCoDSimple(1)">
                            <span class="action-icon">🎲</span>
                            <span class="action-label">1 die</span>
                        </button>
                        <button class="quick-action-btn" onclick="rollCoDSimple(3)">
                            <span class="action-icon">🎲</span>
                            <span class="action-label">3 dice</span>
                        </button>
                        <button class="quick-action-btn" onclick="rollCoDChance()">
                            <span class="action-icon">🍀</span>
                            <span class="action-label">Chance</span>
                        </button>
                        <button class="quick-action-btn" onclick="codSpendWillpower()">
                            <span class="action-icon">💪</span>
                            <span class="action-label">Spend WP</span>
                        </button>
                    </div>
                </div>

                <!-- Success Reference -->
                <div class="dashboard-section">
                    <h3 class="section-header">Success Reference</h3>
                    <div class="cod-reference">
                        <div class="ref-item">Target: <strong>8+</strong></div>
                        <div class="ref-item">10s explode (roll again)</div>
                        <div class="ref-item">5+ successes = Exceptional</div>
                        <div class="ref-item">Chance die: only 10 succeeds, 1 = dramatic failure</div>
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
                        <label for="cod_concept">Concept</label>
                        <input type="text" id="cod_concept" placeholder="Character concept">
                    </div>
                    <div class="field-group">
                        <label for="cod_chronicle">Chronicle</label>
                        <input type="text" id="cod_chronicle" placeholder="Chronicle name">
                    </div>
                    <div class="field-group">
                        <label for="cod_faction">Faction/Group</label>
                        <input type="text" id="cod_faction" placeholder="Faction or group">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Anchors</h2>
                <div class="grid-2">
                    <div class="field-group">
                        <label for="cod_virtue">Virtue</label>
                        <input type="text" id="cod_virtue" placeholder="e.g., Generous, Hopeful">
                    </div>
                    <div class="field-group">
                        <label for="cod_vice">Vice</label>
                        <input type="text" id="cod_vice" placeholder="e.g., Greedy, Cruel">
                    </div>
                </div>
                <div class="field-group">
                    <label for="cod_backstory">Backstory</label>
                    <textarea id="cod_backstory" rows="4" placeholder="Character background..."></textarea>
                </div>
            </div>
        </div>

        <!-- ATTRIBUTES TAB -->
        <div class="tab-content" id="system-attributes" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    Attributes
                </h2>
                <p class="section-hint">Click dots to set values (1-5)</p>

                <div class="wod-attributes-grid">
                    <!-- Header Row -->
                    <div class="attr-header"></div>
                    <div class="attr-header">Power</div>
                    <div class="attr-header">Finesse</div>
                    <div class="attr-header">Resistance</div>

                    <!-- Mental Row -->
                    <div class="attr-category">Mental</div>
                    ${renderCoDDotRating('intelligence', 'Intelligence')}
                    ${renderCoDDotRating('wits', 'Wits')}
                    ${renderCoDDotRating('resolve', 'Resolve')}

                    <!-- Physical Row -->
                    <div class="attr-category">Physical</div>
                    ${renderCoDDotRating('strength', 'Strength')}
                    ${renderCoDDotRating('dexterity', 'Dexterity')}
                    ${renderCoDDotRating('stamina', 'Stamina')}

                    <!-- Social Row -->
                    <div class="attr-category">Social</div>
                    ${renderCoDDotRating('presence', 'Presence')}
                    ${renderCoDDotRating('manipulation', 'Manipulation')}
                    ${renderCoDDotRating('composure', 'Composure')}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Derived Traits</h2>
                <div class="derived-stats-grid grid grid-3">
                    <div class="derived-stat">
                        <span class="derived-label">Willpower</span>
                        <span class="derived-value" id="willpower-display">2</span>
                        <span class="derived-formula">(Resolve + Composure)</span>
                    </div>
                    <div class="derived-stat">
                        <span class="derived-label">Health</span>
                        <span class="derived-value" id="health-display">6</span>
                        <span class="derived-formula">(Stamina + Size)</span>
                    </div>
                    <div class="derived-stat">
                        <span class="derived-label">Defense</span>
                        <span class="derived-value" id="defense-display">1</span>
                        <span class="derived-formula">(Lower of Wits/Dex + Athletics)</span>
                    </div>
                    <div class="derived-stat">
                        <span class="derived-label">Initiative</span>
                        <span class="derived-value" id="initiative-display">2</span>
                        <span class="derived-formula">(Dexterity + Composure)</span>
                    </div>
                    <div class="derived-stat">
                        <span class="derived-label">Speed</span>
                        <span class="derived-value" id="speed-display">7</span>
                        <span class="derived-formula">(Strength + Dexterity + 5)</span>
                    </div>
                    <div class="derived-stat">
                        <span class="derived-label">Size</span>
                        <input type="number" id="cod_size" value="5" min="1" max="10" style="width: 50px; text-align: center;">
                    </div>
                </div>
            </div>
        </div>

        <!-- SKILLS TAB -->
        <div class="tab-content" id="system-skills" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                    Skills
                </h2>
                <p class="section-hint">Unskilled penalties: Mental -3, Physical -1, Social -1</p>

                <div class="skills-columns grid grid-3">
                    <!-- Mental Skills -->
                    <div class="skill-category">
                        <h3 class="skill-category-title mental">Mental (-3 unskilled)</h3>
                        <div class="skill-list">
                            ${config.skillCategories.mental.map(skill => renderCoDSkillRow(skill, 'mental')).join('')}
                        </div>
                    </div>

                    <!-- Physical Skills -->
                    <div class="skill-category">
                        <h3 class="skill-category-title physical">Physical (-1 unskilled)</h3>
                        <div class="skill-list">
                            ${config.skillCategories.physical.map(skill => renderCoDSkillRow(skill, 'physical')).join('')}
                        </div>
                    </div>

                    <!-- Social Skills -->
                    <div class="skill-category">
                        <h3 class="skill-category-title social">Social (-1 unskilled)</h3>
                        <div class="skill-list">
                            ${config.skillCategories.social.map(skill => renderCoDSkillRow(skill, 'social')).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Skill Specialties</h2>
                <textarea id="cod_specialties" rows="4" placeholder="e.g., Drive (Motorcycles), Firearms (Pistols), Persuasion (Seduction)..."></textarea>
            </div>
        </div>

        <!-- COMBAT TAB -->
        <div class="tab-content" id="system-combat" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    Health
                </h2>
                <div class="health-track">
                    <div class="health-boxes" id="cod_health_boxes">
                        ${renderCoDHealthBoxes(7)}
                    </div>
                    <div class="health-legend">
                        <span class="legend-item"><span class="box empty"></span> Healthy</span>
                        <span class="legend-item"><span class="box bashing"></span> Bashing</span>
                        <span class="legend-item"><span class="box lethal"></span> Lethal</span>
                        <span class="legend-item"><span class="box aggravated"></span> Aggravated</span>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Willpower</h2>
                <div class="willpower-track">
                    <div class="willpower-dots" id="cod_willpower_dots">
                        ${renderCoDWillpowerDots(7)}
                    </div>
                    <div class="willpower-current">
                        <label>Current:</label>
                        <input type="number" id="cod_willpower_current" min="0" max="10" value="7">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Integrity</h2>
                <div class="integrity-track">
                    ${renderCoDIntegrityTrack()}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Armor</h2>
                <div class="grid-2">
                    <div class="field-group">
                        <label>General Armor</label>
                        <input type="number" id="cod_armor_general" value="0" min="0">
                    </div>
                    <div class="field-group">
                        <label>Ballistic Armor</label>
                        <input type="number" id="cod_armor_ballistic" value="0" min="0">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Weapons</h2>
                <table class="weapons-table">
                    <thead>
                        <tr>
                            <th>Weapon</th>
                            <th>Damage</th>
                            <th>Range</th>
                            <th>Clip</th>
                            <th>Init</th>
                            <th>Str</th>
                            <th>Size</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${[1,2,3,4].map(i => `
                            <tr>
                                <td><input type="text" id="cod_weapon_${i}_name" placeholder="Name"></td>
                                <td><input type="text" id="cod_weapon_${i}_damage" placeholder="2L"></td>
                                <td><input type="text" id="cod_weapon_${i}_range" placeholder="-"></td>
                                <td><input type="text" id="cod_weapon_${i}_clip" placeholder="-"></td>
                                <td><input type="text" id="cod_weapon_${i}_init" placeholder="-1"></td>
                                <td><input type="text" id="cod_weapon_${i}_str" placeholder="2"></td>
                                <td><input type="text" id="cod_weapon_${i}_size" placeholder="2"></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>

            <div class="section">
                <h2 class="section-title">Conditions & Tilts</h2>
                <div class="grid-2">
                    <div class="field-group">
                        <label>Conditions</label>
                        <textarea id="cod_conditions" rows="4" placeholder="Shaken, Guilty, Informed..."></textarea>
                    </div>
                    <div class="field-group">
                        <label>Tilts</label>
                        <textarea id="cod_tilts" rows="4" placeholder="Knocked Down, Stunned, Blinded..."></textarea>
                    </div>
                </div>
            </div>
        </div>

        <!-- INVENTORY TAB -->
        <div class="tab-content" id="system-inventory" style="display: none;">
            <div class="section">
                <h2 class="section-title">Merits</h2>
                <div class="merits-list grid grid-2">
                    ${[1,2,3,4,5,6,7,8].map(i => `
                        <div class="merit-row">
                            <input type="text" id="cod_merit_${i}_name" placeholder="Merit name">
                            ${renderCoDDotRatingSmall(`merit_${i}`, 5)}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Experience</h2>
                <div class="grid-2">
                    <div class="field-group">
                        <label>Beats</label>
                        <div class="beats-boxes">
                            ${[1,2,3,4,5].map(i => `
                                <input type="checkbox" id="cod_beat_${i}" class="beat-checkbox">
                            `).join('')}
                        </div>
                        <span class="field-hint">(5 Beats = 1 Experience)</span>
                    </div>
                    <div class="field-group">
                        <label>Experiences</label>
                        <input type="number" id="cod_experiences" value="0" min="0">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Equipment & Possessions</h2>
                <textarea id="cod_equipment" rows="8" placeholder="List your equipment..."></textarea>
            </div>

            <div class="section">
                <h2 class="section-title">Notes</h2>
                <textarea id="cod_notes" rows="6" placeholder="Additional notes..."></textarea>
            </div>
        </div>

        <!-- DICE TAB -->
        <div class="tab-content" id="system-dice" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8" cy="8" r="1.5"/><circle cx="16" cy="16" r="1.5"/></svg>
                    Dice Pool Roller
                </h2>
                <p class="section-hint">Roll d10s. 8+ = success. 10s explode (roll again). 5+ successes = exceptional.</p>

                <div class="dice-pool-roller">
                    <div class="pool-builder">
                        <div class="field-group">
                            <label>Dice Pool</label>
                            <input type="number" id="cod_dice_pool" min="0" value="5">
                        </div>
                        <div class="modifier-options">
                            <label class="modifier-checkbox">
                                <input type="checkbox" id="cod_nine_again">
                                <span>9-again</span>
                            </label>
                            <label class="modifier-checkbox">
                                <input type="checkbox" id="cod_eight_again">
                                <span>8-again</span>
                            </label>
                            <label class="modifier-checkbox">
                                <input type="checkbox" id="cod_rote">
                                <span>Rote</span>
                            </label>
                            <label class="modifier-checkbox">
                                <input type="checkbox" id="cod_no_again">
                                <span>No 10-again</span>
                            </label>
                        </div>
                        <div class="cod-penalties-display" id="cod-penalties-display" style="display: none; margin: 8px 0; padding: 8px; background: rgba(255,100,100,0.1); border-radius: 4px;">
                            <span class="penalties-label" style="color: var(--error-color, #ff6b6b);">Active Penalties: </span>
                            <span id="cod-current-penalties">None</span>
                        </div>
                        <button class="dice-btn roll-pool" onclick="rollCoDPool()">Roll Dice Pool</button>
                    </div>

                    <div class="roll-result-container cod-result">
                        <div class="successes-display">
                            <span class="successes-label">Successes:</span>
                            <span class="successes-value" id="cod_successes">0</span>
                        </div>
                        <div class="roll-outcome" id="cod_outcome"></div>
                        <div class="dice-results" id="cod_dice_results"></div>
                    </div>

                    <div class="roll-history" id="cod_roll_history">
                        <h3>Roll History</h3>
                        <div class="history-list" id="cod_history_list"></div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Quick Rolls</h2>
                <div class="quick-rolls-grid">
                    <button class="quick-roll-btn" onclick="rollCoDQuick('Strength', 'Brawl')">Strength + Brawl</button>
                    <button class="quick-roll-btn" onclick="rollCoDQuick('Dexterity', 'Firearms')">Dex + Firearms</button>
                    <button class="quick-roll-btn" onclick="rollCoDQuick('Wits', 'Composure')">Wits + Composure</button>
                    <button class="quick-roll-btn" onclick="rollCoDQuick('Presence', 'Intimidation')">Presence + Intimidation</button>
                    <button class="quick-roll-btn" onclick="rollCoDQuick('Manipulation', 'Persuasion')">Manip + Persuasion</button>
                    <button class="quick-roll-btn" onclick="rollCoDQuick('Intelligence', 'Investigation')">Int + Investigation</button>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Chance Die</h2>
                <p class="section-hint">When your pool is reduced to 0 or less, roll a single die. Only 10 = 1 success. 1 = dramatic failure.</p>
                <button class="dice-btn chance-die" onclick="rollCoDChance()">Roll Chance Die</button>
            </div>
        </div>

        <!-- RULES TAB -->
        <div class="tab-content" id="system-rules" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    Chronicles of Darkness Quick Reference
                </h2>

                <div class="rules-accordion">
                    <details class="rules-section">
                        <summary>Dice Rolling Basics</summary>
                        <div class="rules-content">
                            <p><strong>Dice Pool:</strong> Attribute + Skill (+ Equipment) - Penalties</p>
                            <p><strong>Success:</strong> Each die showing 8, 9, or 10</p>
                            <p><strong>10-Again:</strong> 10s "explode" - roll again and add successes</p>
                            <p><strong>9-Again:</strong> 9s and 10s explode (from equipment/merits)</p>
                            <p><strong>8-Again:</strong> 8s, 9s, and 10s explode (rare)</p>
                            <p><strong>Rote:</strong> Re-roll all failed dice once</p>
                            <p><strong>Exceptional Success:</strong> 5+ successes</p>
                            <p><strong>Dramatic Failure:</strong> Roll 1 on a chance die</p>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Unskilled Rolls</summary>
                        <div class="rules-content">
                            <ul>
                                <li><strong>Mental Skills:</strong> -3 dice if unskilled</li>
                                <li><strong>Physical Skills:</strong> -1 die if unskilled</li>
                                <li><strong>Social Skills:</strong> -1 die if unskilled</li>
                            </ul>
                            <p>If penalty reduces pool to 0 or below, roll a chance die.</p>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Combat</summary>
                        <div class="rules-content">
                            <p><strong>Initiative:</strong> Dexterity + Composure</p>
                            <p><strong>Defense:</strong> Lower of Wits or Dexterity + Athletics</p>
                            <p><strong>Attack Pools:</strong></p>
                            <ul>
                                <li>Unarmed: Strength + Brawl</li>
                                <li>Melee: Strength + Weaponry</li>
                                <li>Firearms: Dexterity + Firearms</li>
                                <li>Thrown: Dexterity + Athletics</li>
                            </ul>
                            <p><strong>Damage Types:</strong></p>
                            <ul>
                                <li><strong>Bashing (B):</strong> Fists, clubs, falls</li>
                                <li><strong>Lethal (L):</strong> Knives, bullets, fire</li>
                                <li><strong>Aggravated (A):</strong> Supernatural, acid</li>
                            </ul>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Health & Damage</summary>
                        <div class="rules-content">
                            <p><strong>Health:</strong> Stamina + Size (usually 5 for humans)</p>
                            <p><strong>Wound Penalties:</strong></p>
                            <ul>
                                <li>Last 3 boxes filled: -1 die</li>
                                <li>Last 2 boxes filled: -2 dice</li>
                                <li>Last box filled: -3 dice</li>
                            </ul>
                            <p><strong>Damage Upgrade:</strong> If all boxes have bashing and you take more bashing, leftmost upgrades to lethal.</p>
                            <p><strong>Incapacitated:</strong> All boxes filled with lethal = bleeding out (roll Stamina each minute).</p>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Willpower</summary>
                        <div class="rules-content">
                            <p><strong>Permanent:</strong> Resolve + Composure (max 10)</p>
                            <p><strong>Uses:</strong></p>
                            <ul>
                                <li>+3 dice to a roll</li>
                                <li>+2 to resistance trait for a turn</li>
                                <li>Activate some Merits</li>
                            </ul>
                            <p><strong>Regain:</strong></p>
                            <ul>
                                <li>1 point per scene from Virtue (once per session)</li>
                                <li>1 point per scene from Vice</li>
                                <li>All Willpower at end of story</li>
                            </ul>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Conditions & Tilts</summary>
                        <div class="rules-content">
                            <p><strong>Conditions:</strong> Persistent or temporary states affecting character</p>
                            <ul>
                                <li>Resolving a Condition grants 1 Beat</li>
                                <li>Persistent Conditions grant Beats for complications</li>
                            </ul>
                            <p><strong>Tilts:</strong> Combat-specific conditions</p>
                            <ul>
                                <li><strong>Knocked Down:</strong> Prone, must spend action to stand</li>
                                <li><strong>Stunned:</strong> Lose next action</li>
                                <li><strong>Blinded:</strong> -2 to sight-based actions</li>
                            </ul>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Experience & Beats</summary>
                        <div class="rules-content">
                            <p><strong>5 Beats = 1 Experience</strong></p>
                            <p><strong>Gain Beats from:</strong></p>
                            <ul>
                                <li>Resolving Conditions</li>
                                <li>Dramatic failures</li>
                                <li>Fulfilling Aspirations</li>
                                <li>Exceptional roleplay (Storyteller award)</li>
                            </ul>
                            <p><strong>Experience Costs:</strong></p>
                            <ul>
                                <li>Attribute: 4 XP per dot</li>
                                <li>Skill: 2 XP per dot</li>
                                <li>Skill Specialty: 1 XP</li>
                                <li>Merit: 1 XP per dot</li>
                            </ul>
                        </div>
                    </details>
                </div>

                <div class="rules-links">
                    <a href="https://whitewolf.fandom.com/wiki/Storytelling_System" target="_blank" class="rules-link">White Wolf Wiki</a>
                    <a href="https://www.drivethrurpg.com/product/114078/World-of-Darkness-GodMachine-Rules-Update" target="_blank" class="rules-link">Free Rules PDF</a>
                </div>
            </div>
        </div>
    `;
}

// Render a dot rating for CoD attributes
function renderCoDDotRating(id, name) {
    let dots = '';
    for (let i = 1; i <= 5; i++) {
        dots += `<span class="wod-dot" data-value="${i}"></span>`;
    }
    return `
        <div class="attr-cell" data-attr="${id}">
            <span class="attr-name">${name}</span>
            <div class="wod-dots" data-id="${id}" data-value="1">
                ${dots}
            </div>
        </div>
    `;
}

// Render a small dot rating for merits/skills
function renderCoDDotRatingSmall(id, maxDots = 5) {
    let dots = '';
    for (let i = 1; i <= maxDots; i++) {
        dots += `<span class="wod-dot small" data-value="${i}"></span>`;
    }
    return `
        <div class="wod-dots small" data-id="${id}" data-value="0">
            ${dots}
        </div>
    `;
}

// Render skill row
function renderCoDSkillRow(skillName, category) {
    const skillId = skillName.toLowerCase().replace(/\s+/g, '_');
    return `
        <div class="skill-row">
            <span class="skill-name">${skillName}</span>
            ${renderCoDDotRatingSmall(`skill_${skillId}`, 5)}
        </div>
    `;
}

// Render health boxes
function renderCoDHealthBoxes(count) {
    let boxes = '';
    for (let i = 1; i <= count; i++) {
        boxes += `<div class="health-box" data-index="${i}" data-state="0" onclick="cycleHealthBox(this)"></div>`;
    }
    return boxes;
}

// Render willpower dots
function renderCoDWillpowerDots(count) {
    let dots = '';
    for (let i = 1; i <= count; i++) {
        dots += `<span class="willpower-dot" data-index="${i}"></span>`;
    }
    return dots;
}

// Render integrity track
function renderCoDIntegrityTrack() {
    let track = '<div class="integrity-dots">';
    for (let i = 10; i >= 1; i--) {
        const filled = i <= 7 ? 'filled' : '';
        track += `<div class="integrity-level">
            <span class="integrity-number">${i}</span>
            <span class="integrity-dot ${filled}" data-value="${i}" onclick="setIntegrity(${i})"></span>
        </div>`;
    }
    track += '</div>';
    track += '<div class="field-group" style="margin-top: 12px;"><label>Breaking Points</label><textarea id="cod_breaking_points" rows="3" placeholder="What could threaten your integrity?"></textarea></div>';
    return track;
}

// Update penalties display
function updateCoDPenaltiesDisplay() {
    const woundPenalty = getCoDWoundPenalty();
    const displayEl = document.getElementById('cod-penalties-display');
    const penaltiesEl = document.getElementById('cod-current-penalties');

    if (displayEl && penaltiesEl) {
        if (woundPenalty < 0) {
            displayEl.style.display = 'block';
            penaltiesEl.textContent = `Wound penalty: ${woundPenalty}`;
        } else {
            displayEl.style.display = 'none';
        }
    }
}

// Cycle health box state (empty -> bashing -> lethal -> aggravated -> empty)
function cycleHealthBox(box) {
    const state = parseInt(box.dataset.state) || 0;
    const newState = (state + 1) % 4;
    box.dataset.state = newState;
    box.className = 'health-box';
    if (newState === 1) box.classList.add('bashing');
    else if (newState === 2) box.classList.add('lethal');
    else if (newState === 3) box.classList.add('aggravated');

    // Update penalties display
    updateCoDPenaltiesDisplay();

    // Sync to Overview health track
    syncCoDHealthToOverview();
}

// Sync Combat health boxes to Overview
function syncCoDHealthToOverview() {
    const combatBoxes = document.querySelectorAll('#cod_health_boxes .health-box');
    const overviewContainer = document.getElementById('cod-overview-health');
    if (!overviewContainer) return;

    const overviewBoxes = overviewContainer.querySelectorAll('.health-box-mini');

    combatBoxes.forEach((combatBox, idx) => {
        if (overviewBoxes[idx]) {
            const state = parseInt(combatBox.dataset.state) || 0;
            const overviewBox = overviewBoxes[idx];
            overviewBox.className = 'health-box-mini';
            if (state === 0) {
                overviewBox.textContent = '☐';
            } else if (state === 1) {
                overviewBox.textContent = '/';
                overviewBox.classList.add('bashing');
            } else if (state === 2) {
                overviewBox.textContent = 'X';
                overviewBox.classList.add('lethal');
            } else if (state === 3) {
                overviewBox.textContent = '*';
                overviewBox.classList.add('aggravated');
            }
        }
    });
}

// Set integrity level (syncs both Combat and Overview displays)
function setIntegrity(level) {
    // Update all integrity dots in Combat tab
    document.querySelectorAll('.integrity-track .integrity-dot').forEach(dot => {
        const dotLevel = parseInt(dot.dataset.value);
        dot.classList.toggle('filled', dotLevel <= level);
    });

    // Update Overview integrity display
    const integrityValue = document.getElementById('cod-overview-integrity');
    if (integrityValue) integrityValue.textContent = level;

    document.querySelectorAll('.cod-integrity-track .integrity-dot').forEach(dot => {
        const dotValue = parseInt(dot.dataset.value);
        dot.classList.toggle('filled', dotValue <= level);
    });
}

// Roll CoD dice pool
function rollCoDPool() {
    const poolSize = parseInt(document.getElementById('cod_dice_pool').value) || 0;
    const nineAgain = document.getElementById('cod_nine_again').checked;
    const eightAgain = document.getElementById('cod_eight_again').checked;
    const rote = document.getElementById('cod_rote').checked;
    const noAgain = document.getElementById('cod_no_again').checked;

    if (poolSize <= 0) {
        // Chance die
        rollCoDChance();
        return;
    }

    let againThreshold = noAgain ? 11 : (eightAgain ? 8 : (nineAgain ? 9 : 10));
    let allRolls = [];
    let successes = 0;

    // Initial rolls
    let currentRolls = [];
    for (let i = 0; i < poolSize; i++) {
        currentRolls.push(Math.floor(Math.random() * 10) + 1);
    }

    // Rote: re-roll failures once
    if (rote) {
        const newRolls = [];
        currentRolls.forEach(roll => {
            if (roll < 8) {
                const reroll = Math.floor(Math.random() * 10) + 1;
                newRolls.push({ original: roll, reroll: reroll, final: reroll });
            } else {
                newRolls.push({ original: roll, reroll: null, final: roll });
            }
        });
        currentRolls = newRolls.map(r => r.final);
        allRolls = newRolls;
    } else {
        allRolls = currentRolls.map(r => ({ original: r, reroll: null, final: r }));
    }

    // Count successes and handle explosions
    let explosions = [];
    currentRolls.forEach(roll => {
        if (roll >= 8) successes++;
        if (roll >= againThreshold && !noAgain) {
            explosions.push(roll);
        }
    });

    // Roll explosions
    while (explosions.length > 0) {
        const newExplosions = [];
        explosions.forEach(() => {
            const roll = Math.floor(Math.random() * 10) + 1;
            allRolls.push({ original: null, reroll: null, final: roll, explosion: true });
            if (roll >= 8) successes++;
            if (roll >= againThreshold) {
                newExplosions.push(roll);
            }
        });
        explosions = newExplosions;
    }

    // Display results
    displayCoDResult(successes, allRolls, poolSize);
}

// Roll simple dice pool (for quick actions)
function rollCoDSimple(poolSize) {
    document.getElementById('cod_dice_pool').value = poolSize;
    rollCoDPool();
}

// Roll chance die
function rollCoDChance() {
    const roll = Math.floor(Math.random() * 10) + 1;
    let outcome = '';
    let successes = 0;

    if (roll === 10) {
        successes = 1;
        outcome = 'Success!';
    } else if (roll === 1) {
        outcome = 'Dramatic Failure!';
    } else {
        outcome = 'Failure';
    }

    displayCoDResult(successes, [{ original: roll, final: roll, chance: true }], 0, outcome);
}

// Roll quick pool with automatic penalties
function rollCoDQuick(attr1, attr2) {
    const attrValue = getCoDAttributeValue(attr1);
    const skillValue = getCoDSkillValue(attr2);
    let pool = attrValue + skillValue;

    let penalties = [];

    // Apply unskilled penalty if skill is 0
    if (skillValue === 0) {
        const unskilledPenalty = getCoDUnskilledPenalty(attr2);
        pool += unskilledPenalty;
        const category = getCoDSkillCategory(attr2);
        penalties.push(`Unskilled ${category} (${unskilledPenalty})`);
    }

    // Apply wound penalty
    const woundPenalty = getCoDWoundPenalty();
    if (woundPenalty < 0) {
        pool += woundPenalty;
        penalties.push(`Wounds (${woundPenalty})`);
    }

    // Show penalty notification if any
    if (penalties.length > 0) {
        console.log(`CoD Roll: ${attr1} + ${attr2}, Penalties: ${penalties.join(', ')}, Final pool: ${pool}`);
    }

    document.getElementById('cod_dice_pool').value = Math.max(0, pool);
    rollCoDPool();
}

// Get attribute value
function getCoDAttributeValue(attrName) {
    const id = attrName.toLowerCase();
    const dots = document.querySelector(`.wod-dots[data-id="${id}"]`);
    return dots ? parseInt(dots.dataset.value) || 1 : 1;
}

// Get skill value
function getCoDSkillValue(skillName) {
    const id = 'skill_' + skillName.toLowerCase().replace(/\s+/g, '_');
    const dots = document.querySelector(`.wod-dots[data-id="${id}"]`);
    return dots ? parseInt(dots.dataset.value) || 0 : 0;
}

// Get skill category for unskilled penalty
function getCoDSkillCategory(skillName) {
    const config = SYSTEM_CONFIGS.cod;
    const normalizedName = skillName.toLowerCase().replace(/\s+/g, '_');

    if (config.skillCategories.mental.some(s => s.toLowerCase().replace(/\s+/g, '_') === normalizedName)) {
        return 'mental';
    }
    if (config.skillCategories.physical.some(s => s.toLowerCase().replace(/\s+/g, '_') === normalizedName)) {
        return 'physical';
    }
    if (config.skillCategories.social.some(s => s.toLowerCase().replace(/\s+/g, '_') === normalizedName)) {
        return 'social';
    }
    return 'physical'; // Default
}

// Get unskilled penalty based on skill category
function getCoDUnskilledPenalty(skillName) {
    const category = getCoDSkillCategory(skillName);
    // Mental: -3, Physical/Social: -1
    return category === 'mental' ? -3 : -1;
}

// Calculate wound penalty based on health boxes
function getCoDWoundPenalty() {
    const healthContainer = document.getElementById('cod_health_boxes');
    if (!healthContainer) return 0;

    const boxes = healthContainer.querySelectorAll('.health-box');
    const totalBoxes = boxes.length;

    // Count filled boxes (any damage state > 0)
    let filledCount = 0;
    boxes.forEach(box => {
        const state = parseInt(box.dataset.state) || 0;
        if (state > 0) filledCount++;
    });

    // Calculate remaining empty boxes
    const emptyBoxes = totalBoxes - filledCount;

    // Wound penalties: last 3 boxes = -1, last 2 = -2, last 1 = -3
    if (emptyBoxes <= 1) return -3;
    if (emptyBoxes <= 2) return -2;
    if (emptyBoxes <= 3) return -1;
    return 0;
}

// Display CoD roll result
function displayCoDResult(successes, rolls, poolSize, customOutcome = null) {
    const successesDisplay = document.getElementById('cod_successes');
    const outcomeDisplay = document.getElementById('cod_outcome');
    const diceResults = document.getElementById('cod_dice_results');
    const historyList = document.getElementById('cod_history_list');

    if (successesDisplay) {
        successesDisplay.textContent = successes;
        successesDisplay.className = 'successes-value';
        if (successes >= 5) successesDisplay.classList.add('exceptional');
        else if (successes === 0) successesDisplay.classList.add('failure');
    }

    let outcome = customOutcome;
    if (!outcome) {
        if (successes >= 5) outcome = 'Exceptional Success!';
        else if (successes > 0) outcome = 'Success';
        else outcome = 'Failure';
    }

    if (outcomeDisplay) {
        outcomeDisplay.textContent = outcome;
        outcomeDisplay.className = 'roll-outcome';
        if (outcome.includes('Exceptional')) outcomeDisplay.classList.add('exceptional');
        else if (outcome.includes('Dramatic')) outcomeDisplay.classList.add('dramatic');
        else if (outcome === 'Failure') outcomeDisplay.classList.add('failure');
    }

    // Display individual dice
    if (diceResults) {
        diceResults.innerHTML = rolls.map(roll => {
            let classes = 'die-result';
            if (roll.final >= 8) classes += ' success';
            if (roll.final === 10) classes += ' exploded';
            if (roll.explosion) classes += ' explosion';
            if (roll.chance && roll.final === 1) classes += ' dramatic';
            return `<span class="${classes}">${roll.final}</span>`;
        }).join('');
    }

    // Add to history
    if (historyList) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        if (successes >= 5) historyItem.classList.add('exceptional');
        else if (successes === 0) historyItem.classList.add('failure');
        historyItem.innerHTML = `
            <span class="history-label">${poolSize > 0 ? poolSize + ' dice' : 'Chance'}</span>
            <span class="history-result">${successes} success${successes !== 1 ? 'es' : ''}</span>
        `;
        historyList.insertBefore(historyItem, historyList.firstChild);

        while (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
    }
}

// Initialize CoD dot ratings
function initializeCoDDotRatings() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('wod-dot')) {
            const value = parseInt(e.target.dataset.value);
            const container = e.target.closest('.wod-dots');
            if (container) {
                const currentValue = parseInt(container.dataset.value) || 0;
                // Toggle: clicking same value sets to value-1 (minimum 0 for skills, 1 for attributes)
                const isSkill = container.dataset.id && container.dataset.id.startsWith('skill_');
                const minValue = isSkill || container.dataset.id.startsWith('merit_') ? 0 : 1;
                const newValue = (value === currentValue) ? Math.max(minValue, value - 1) : value;

                container.dataset.value = newValue;

                // Update dot visuals
                container.querySelectorAll('.wod-dot').forEach((dot, index) => {
                    if (index < newValue) {
                        dot.classList.add('filled');
                    } else {
                        dot.classList.remove('filled');
                    }
                });

                // Trigger derived stats update
                updateCoDDerivedStats();
            }
        }
    });
}

// Update CoD derived stats
function updateCoDDerivedStats() {
    const resolve = getCoDAttributeValue('resolve');
    const composure = getCoDAttributeValue('composure');
    const stamina = getCoDAttributeValue('stamina');
    const wits = getCoDAttributeValue('wits');
    const dexterity = getCoDAttributeValue('dexterity');
    const strength = getCoDAttributeValue('strength');
    const athletics = getCoDSkillValue('Athletics');
    const size = parseInt(document.getElementById('cod_size')?.value) || 5;

    // Willpower
    const willpower = resolve + composure;
    const willpowerDisplay = document.getElementById('willpower-display');
    if (willpowerDisplay) willpowerDisplay.textContent = willpower;

    // Health
    const health = stamina + size;
    const healthDisplay = document.getElementById('health-display');
    if (healthDisplay) healthDisplay.textContent = health;

    // Update health boxes
    updateCoDHealthBoxes(health);

    // Defense
    const defense = Math.min(wits, dexterity) + athletics;
    const defenseDisplay = document.getElementById('defense-display');
    if (defenseDisplay) defenseDisplay.textContent = defense;

    // Initiative
    const initiative = dexterity + composure;
    const initiativeDisplay = document.getElementById('initiative-display');
    if (initiativeDisplay) initiativeDisplay.textContent = initiative;

    // Speed
    const speed = strength + dexterity + 5;
    const speedDisplay = document.getElementById('speed-display');
    if (speedDisplay) speedDisplay.textContent = speed;

    // Update willpower dots
    updateCoDWillpowerDots(willpower);
}

// Update health boxes count
function updateCoDHealthBoxes(count) {
    const container = document.getElementById('cod_health_boxes');
    if (!container) return;

    const currentBoxes = container.querySelectorAll('.health-box');
    const currentCount = currentBoxes.length;

    if (count > currentCount) {
        // Add boxes
        for (let i = currentCount + 1; i <= count; i++) {
            const box = document.createElement('div');
            box.className = 'health-box';
            box.dataset.index = i;
            box.dataset.state = '0';
            box.onclick = function() { cycleHealthBox(this); };
            container.appendChild(box);
        }
    } else if (count < currentCount) {
        // Remove boxes
        for (let i = currentCount; i > count; i--) {
            container.removeChild(container.lastChild);
        }
    }
}

// Update willpower dots
function updateCoDWillpowerDots(count) {
    const container = document.getElementById('cod_willpower_dots');
    if (!container) return;

    container.innerHTML = '';
    for (let i = 1; i <= count; i++) {
        const dot = document.createElement('span');
        dot.className = 'willpower-dot';
        dot.dataset.index = i;
        container.appendChild(dot);
    }
}

// Initialize CoD sheet
function initializeCoD() {
    initializeCoDDotRatings();

    // Set initial attribute values (only within system-content)
    const systemContent = document.getElementById('system-content');
    if (!systemContent) return;

    systemContent.querySelectorAll('.wod-dots').forEach(container => {
        const id = container.dataset.id;
        if (id && !id.startsWith('skill_') && !id.startsWith('merit_')) {
            // Attributes start at 1
            container.dataset.value = 1;
            const firstDot = container.querySelector('.wod-dot');
            if (firstDot) firstDot.classList.add('filled');
        }
    });

    // Set up size listener
    const sizeInput = document.getElementById('cod_size');
    if (sizeInput) {
        sizeInput.addEventListener('change', updateCoDDerivedStats);
        sizeInput.addEventListener('input', updateCoDDerivedStats);
    }

    // Initial derived stats calculation
    setTimeout(updateCoDDerivedStats, 100);

    // Initial penalties display
    setTimeout(updateCoDPenaltiesDisplay, 150);
}

// Update overview with current values
function updateCoDOverview() {
    const config = SYSTEM_CONFIGS.cod;

    // Character summary
    const name = document.getElementById('character_name')?.value || 'New Character';
    const concept = document.getElementById('cod_concept')?.value || '-';
    const faction = document.getElementById('cod_faction')?.value || '-';
    const virtue = document.getElementById('cod_virtue')?.value || '-';
    const vice = document.getElementById('cod_vice')?.value || '-';

    const nameEl = document.getElementById('cod-summary-name');
    const conceptEl = document.getElementById('cod-summary-concept');
    const factionEl = document.getElementById('cod-summary-faction');
    const virtueEl = document.getElementById('cod-summary-virtue');
    const viceEl = document.getElementById('cod-summary-vice');
    const avatarEl = document.getElementById('cod-avatar');

    if (nameEl) nameEl.textContent = name || 'New Character';
    if (conceptEl) conceptEl.textContent = concept || '-';
    if (factionEl) factionEl.textContent = faction || '-';
    if (virtueEl) virtueEl.textContent = 'Virtue: ' + (virtue || '-');
    if (viceEl) viceEl.textContent = 'Vice: ' + (vice || '-');
    if (avatarEl) {
        const initial = name ? name.charAt(0).toUpperCase() : '?';
        avatarEl.querySelector('.avatar-initial').textContent = initial;
    }

    // Derived stats (read from Attributes tab display elements)
    const defense = document.getElementById('defense-display')?.textContent || '1';
    const initiative = document.getElementById('initiative-display')?.textContent || '1';
    const speed = document.getElementById('speed-display')?.textContent || '7';
    const size = document.getElementById('cod_size')?.value || '5';
    const armorGeneral = parseInt(document.getElementById('cod_armor_general')?.value) || 0;
    const armorBallistic = parseInt(document.getElementById('cod_armor_ballistic')?.value) || 0;
    const armor = armorGeneral + '/' + armorBallistic;

    const defenseEl = document.getElementById('cod-overview-defense');
    const initEl = document.getElementById('cod-overview-initiative');
    const speedEl = document.getElementById('cod-overview-speed');
    const sizeEl = document.getElementById('cod-overview-size');
    const armorEl = document.getElementById('cod-overview-armor');

    if (defenseEl) defenseEl.textContent = defense;
    if (initEl) initEl.textContent = initiative;
    if (speedEl) speedEl.textContent = speed;
    if (sizeEl) sizeEl.textContent = size;
    if (armorEl) armorEl.textContent = armor;

    // Attributes
    config.attributes.forEach(attr => {
        const dotsContainer = document.querySelector(`.wod-dots[data-id="${attr.id}"]`);
        const overviewEl = document.getElementById(`cod-overview-${attr.id}`);
        if (dotsContainer && overviewEl) {
            const value = parseInt(dotsContainer.dataset.value) || 1;
            overviewEl.textContent = '●'.repeat(value) + '○'.repeat(5 - value);
        }
    });

    // Health track
    const healthContainer = document.getElementById('cod-overview-health');
    const staminaContainer = document.querySelector('.wod-dots[data-id="stamina"]');
    const stamina = staminaContainer ? parseInt(staminaContainer.dataset.value) || 1 : 1;
    const sizeVal = parseInt(size) || 5;
    const maxHealth = stamina + sizeVal;

    if (healthContainer) {
        healthContainer.innerHTML = '';
        for (let i = 0; i < maxHealth; i++) {
            const box = document.createElement('span');
            box.className = 'health-box-mini';
            box.textContent = '☐';
            box.onclick = () => cycleOverviewHealth(i);
            healthContainer.appendChild(box);
        }
    }

    // Willpower
    const resolveContainer = document.querySelector('.wod-dots[data-id="resolve"]');
    const composureContainer = document.querySelector('.wod-dots[data-id="composure"]');
    const resolve = resolveContainer ? parseInt(resolveContainer.dataset.value) || 1 : 1;
    const composure = composureContainer ? parseInt(composureContainer.dataset.value) || 1 : 1;
    const maxWP = resolve + composure;
    const currentWP = parseInt(document.getElementById('cod_willpower_current')?.value) || maxWP;
    const spentWP = maxWP - currentWP;

    const wpDotsEl = document.getElementById('cod-overview-wp-dots');
    if (wpDotsEl) {
        wpDotsEl.innerHTML = '';
        for (let i = 0; i < maxWP; i++) {
            const dot = document.createElement('span');
            dot.className = 'wp-dot-mini' + (i >= currentWP ? ' spent' : '');
            dot.textContent = i < currentWP ? '●' : '○';
            wpDotsEl.appendChild(dot);
        }
    }

    const wpSpentEl = document.getElementById('cod-overview-wp-spent');
    if (wpSpentEl) {
        wpSpentEl.textContent = spentWP > 0 ? `(${spentWP} spent)` : '';
    }

    // Integrity
    const integrityContainer = document.querySelector('.wod-dots[data-id="integrity"]');
    const integrity = integrityContainer ? parseInt(integrityContainer.dataset.value) || 7 : 7;
    const integrityValue = document.getElementById('cod-overview-integrity');
    if (integrityValue) integrityValue.textContent = integrity;

    document.querySelectorAll('.cod-integrity-track .integrity-dot').forEach(dot => {
        const dotValue = parseInt(dot.dataset.value);
        dot.classList.toggle('filled', dotValue <= integrity);
    });

    // Beats (count checked checkboxes)
    let beats = 0;
    for (let i = 1; i <= 5; i++) {
        const checkbox = document.getElementById(`cod_beat_${i}`);
        if (checkbox && checkbox.checked) beats++;
    }
    const beatsDisplay = document.getElementById('cod-overview-beats');
    if (beatsDisplay) {
        beatsDisplay.textContent = '●'.repeat(beats) + '○'.repeat(5 - beats);
    }

    // XP
    const xp = document.getElementById('cod_experiences')?.value || '0';
    const xpEl = document.getElementById('cod-overview-xp');
    if (xpEl) xpEl.textContent = xp;

    // Conditions
    const conditions = document.getElementById('cod_conditions')?.value || '';
    const conditionsSection = document.getElementById('cod-conditions-section');
    const conditionsList = document.getElementById('cod-overview-conditions');
    if (conditions.trim()) {
        if (conditionsSection) conditionsSection.style.display = 'block';
        if (conditionsList) conditionsList.textContent = conditions;
    } else {
        if (conditionsSection) conditionsSection.style.display = 'none';
    }

    // Sync health state from Combat tab to Overview
    syncCoDHealthToOverview();
}

// Cycle overview health box (syncs to Combat tab)
function cycleOverviewHealth(index) {
    const container = document.getElementById('cod-overview-health');
    if (!container) return;

    const boxes = container.querySelectorAll('.health-box-mini');
    const box = boxes[index];
    if (!box) return; // Bounds check

    let newState = 0;
    if (box.textContent === '☐') {
        box.textContent = '/';
        box.className = 'health-box-mini bashing';
        newState = 1;
    } else if (box.textContent === '/') {
        box.textContent = 'X';
        box.className = 'health-box-mini lethal';
        newState = 2;
    } else if (box.textContent === 'X') {
        box.textContent = '*';
        box.className = 'health-box-mini aggravated';
        newState = 3;
    } else {
        box.textContent = '☐';
        box.className = 'health-box-mini';
        newState = 0;
    }

    // Sync to Combat tab health box
    const combatBoxes = document.querySelectorAll('#cod_health_boxes .health-box');
    if (combatBoxes[index]) {
        const combatBox = combatBoxes[index];
        combatBox.dataset.state = newState;
        combatBox.className = 'health-box';
        if (newState === 1) combatBox.classList.add('bashing');
        else if (newState === 2) combatBox.classList.add('lethal');
        else if (newState === 3) combatBox.classList.add('aggravated');
    }

    // Update penalties display
    updateCoDPenaltiesDisplay();
}

// Set integrity from overview (syncs to all integrity displays)
function setCoDIntegrity(value) {
    // Update all integrity dots (Overview and Combat tabs)
    setIntegrity(value);

    // Update Overview integrity value display
    const integrityValue = document.getElementById('cod-overview-integrity');
    if (integrityValue) integrityValue.textContent = value;

    // Update Overview integrity dots highlight
    document.querySelectorAll('.cod-integrity-track .integrity-dot').forEach(dot => {
        const dotValue = parseInt(dot.dataset.value);
        dot.classList.toggle('filled', dotValue <= value);
    });
}

// Roll an attribute
function rollCoDAttribute(attrId) {
    const dotsContainer = document.querySelector(`.wod-dots[data-id="${attrId}"]`);
    if (dotsContainer) {
        const pool = parseInt(dotsContainer.dataset.value) || 1;
        rollCoDPool(pool);
    }
}

// Spend willpower
function codSpendWillpower() {
    alert('Willpower spent!\n\n+3 dice to your next roll.\n\n(Track spent WP manually in the Combat tab)');
}

// Set up overview listeners
function setupCoDOverviewListeners() {
    const fieldsToWatch = [
        'character_name', 'cod_concept', 'cod_faction',
        'cod_virtue', 'cod_vice', 'cod_size',
        'cod_armor_general', 'cod_armor_ballistic',
        'cod_experiences', 'cod_conditions',
        'cod_willpower_current'
    ];
    fieldsToWatch.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', updateCoDOverview);
            field.addEventListener('input', updateCoDOverview);
        }
    });

    // Watch beat checkboxes
    for (let i = 1; i <= 5; i++) {
        const checkbox = document.getElementById(`cod_beat_${i}`);
        if (checkbox) {
            checkbox.addEventListener('change', updateCoDOverview);
        }
    }

    // Watch dot ratings
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('wod-dot')) {
            setTimeout(updateCoDOverview, 50);
        }
    });
}

// Extend initializeCoD
const originalInitializeCoD = initializeCoD;
initializeCoD = function() {
    originalInitializeCoD();
    setupCoDOverviewListeners();
    setTimeout(updateCoDOverview, 100);
};

// Export functions
if (typeof window !== 'undefined') {
    window.renderCoDSheet = renderCoDSheet;
    window.initializeCoD = initializeCoD;
    window.cycleHealthBox = cycleHealthBox;
    window.setIntegrity = setIntegrity;
    window.rollCoDPool = rollCoDPool;
    window.rollCoDSimple = rollCoDSimple;
    window.rollCoDChance = rollCoDChance;
    window.rollCoDQuick = rollCoDQuick;
    window.getCoDWoundPenalty = getCoDWoundPenalty;
    window.getCoDUnskilledPenalty = getCoDUnskilledPenalty;
    window.updateCoDPenaltiesDisplay = updateCoDPenaltiesDisplay;
    window.updateCoDDerivedStats = updateCoDDerivedStats;
    window.updateCoDOverview = updateCoDOverview;
    window.setCoDIntegrity = setCoDIntegrity;
    window.rollCoDAttribute = rollCoDAttribute;
    window.codSpendWillpower = codSpendWillpower;
    window.cycleOverviewHealth = cycleOverviewHealth;
    window.syncCoDHealthToOverview = syncCoDHealthToOverview;
}
