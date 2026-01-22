// ===========================================
// Chronicles of Darkness Character Sheet Renderer
// ===========================================

function renderCoDSheet(config) {
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
                <div class="derived-stats-grid">
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

                <div class="skills-columns">
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
                <div class="merits-list">
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

// Cycle health box state (empty -> bashing -> lethal -> aggravated -> empty)
function cycleHealthBox(box) {
    const state = parseInt(box.dataset.state) || 0;
    const newState = (state + 1) % 4;
    box.dataset.state = newState;
    box.className = 'health-box';
    if (newState === 1) box.classList.add('bashing');
    else if (newState === 2) box.classList.add('lethal');
    else if (newState === 3) box.classList.add('aggravated');
}

// Set integrity level
function setIntegrity(level) {
    document.querySelectorAll('.integrity-dot').forEach(dot => {
        const dotLevel = parseInt(dot.dataset.value);
        if (dotLevel <= level) {
            dot.classList.add('filled');
        } else {
            dot.classList.remove('filled');
        }
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

// Roll quick pool
function rollCoDQuick(attr1, attr2) {
    const attrValue = getCoDAttributeValue(attr1);
    const skillValue = getCoDSkillValue(attr2);
    const pool = attrValue + skillValue;

    document.getElementById('cod_dice_pool').value = pool;
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
}

// Export functions
if (typeof window !== 'undefined') {
    window.renderCoDSheet = renderCoDSheet;
    window.initializeCoD = initializeCoD;
    window.cycleHealthBox = cycleHealthBox;
    window.setIntegrity = setIntegrity;
    window.rollCoDPool = rollCoDPool;
    window.rollCoDChance = rollCoDChance;
    window.rollCoDQuick = rollCoDQuick;
    window.updateCoDDerivedStats = updateCoDDerivedStats;
}
