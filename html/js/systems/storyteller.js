// ===========================================
// Storyteller System (Classic World of Darkness) Character Sheet Renderer
// ===========================================

function renderStorytellerSheet(config) {
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
                        <label for="character_name">Name</label>
                        <input type="text" id="character_name" placeholder="Character name">
                    </div>
                    <div class="field-group">
                        <label for="player_name">Player</label>
                        <input type="text" id="player_name" placeholder="Player name">
                    </div>
                </div>
                <div class="grid-3">
                    <div class="field-group">
                        <label for="st_nature">Nature</label>
                        <input type="text" id="st_nature" placeholder="True self">
                    </div>
                    <div class="field-group">
                        <label for="st_demeanor">Demeanor</label>
                        <input type="text" id="st_demeanor" placeholder="Outward persona">
                    </div>
                    <div class="field-group">
                        <label for="st_concept">Concept</label>
                        <input type="text" id="st_concept" placeholder="Character concept">
                    </div>
                </div>
                <div class="grid-3">
                    <div class="field-group">
                        <label for="st_clan">Clan/Tribe/Tradition</label>
                        <input type="text" id="st_clan" placeholder="e.g., Brujah, Bone Gnawer">
                    </div>
                    <div class="field-group">
                        <label for="st_generation">Generation/Rank</label>
                        <input type="text" id="st_generation" placeholder="e.g., 10th Gen">
                    </div>
                    <div class="field-group">
                        <label for="st_sire">Sire/Mentor</label>
                        <input type="text" id="st_sire" placeholder="Who made/taught you">
                    </div>
                </div>
                <div class="field-group">
                    <label for="st_chronicle">Chronicle</label>
                    <input type="text" id="st_chronicle" placeholder="Chronicle name">
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

                <div class="wod-attributes-grid classic">
                    <!-- Header Row -->
                    <div class="attr-header"></div>
                    <div class="attr-header">Physical</div>
                    <div class="attr-header">Social</div>
                    <div class="attr-header">Mental</div>

                    <!-- Power Row -->
                    <div class="attr-category">Power</div>
                    ${renderSTDotRating('strength', 'Strength')}
                    ${renderSTDotRating('charisma', 'Charisma')}
                    ${renderSTDotRating('intelligence', 'Intelligence')}

                    <!-- Finesse Row -->
                    <div class="attr-category">Finesse</div>
                    ${renderSTDotRating('dexterity', 'Dexterity')}
                    ${renderSTDotRating('manipulation', 'Manipulation')}
                    ${renderSTDotRating('wits', 'Wits')}

                    <!-- Resistance Row -->
                    <div class="attr-category">Resistance</div>
                    ${renderSTDotRating('stamina', 'Stamina')}
                    ${renderSTDotRating('appearance', 'Appearance')}
                    ${renderSTDotRating('perception', 'Perception')}
                </div>
            </div>
        </div>

        <!-- ABILITIES TAB -->
        <div class="tab-content" id="system-abilities" style="display: none;">
            <div class="section">
                <h2 class="section-title">Abilities</h2>
                <p class="section-hint">Talents are innate, Skills are learned, Knowledges are studied</p>

                <div class="abilities-columns">
                    <!-- Talents -->
                    <div class="ability-category">
                        <h3 class="ability-category-title talents">Talents</h3>
                        <div class="ability-list">
                            ${config.abilityCategories.talents.map(ability => renderSTAbilityRow(ability, 'talent')).join('')}
                        </div>
                    </div>

                    <!-- Skills -->
                    <div class="ability-category">
                        <h3 class="ability-category-title skills">Skills</h3>
                        <div class="ability-list">
                            ${config.abilityCategories.skills.map(ability => renderSTAbilityRow(ability, 'skill')).join('')}
                        </div>
                    </div>

                    <!-- Knowledges -->
                    <div class="ability-category">
                        <h3 class="ability-category-title knowledges">Knowledges</h3>
                        <div class="ability-list">
                            ${config.abilityCategories.knowledges.map(ability => renderSTAbilityRow(ability, 'knowledge')).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Secondary Abilities</h2>
                <textarea id="st_secondary_abilities" rows="3" placeholder="Custom abilities, specialties..."></textarea>
            </div>
        </div>

        <!-- COMBAT TAB -->
        <div class="tab-content" id="system-combat" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                    Health
                </h2>
                <div class="health-track-classic">
                    ${renderSTHealthTrack(config.healthLevels)}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Willpower</h2>
                <div class="willpower-container">
                    <div class="willpower-permanent">
                        <label>Permanent</label>
                        <div class="wod-dots large" data-id="willpower_permanent" data-value="5" data-max="10">
                            ${renderSTLargeDots(10, 5)}
                        </div>
                    </div>
                    <div class="willpower-current">
                        <label>Current</label>
                        <div class="willpower-boxes">
                            ${[1,2,3,4,5,6,7,8,9,10].map(i => `
                                <input type="checkbox" id="st_willpower_${i}" class="willpower-box">
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Blood Pool / Gnosis / Quintessence</h2>
                <div class="resource-pool">
                    <div class="field-group">
                        <label for="st_resource_current">Current</label>
                        <input type="number" id="st_resource_current" min="0" value="10">
                    </div>
                    <div class="field-group">
                        <label for="st_resource_max">Maximum</label>
                        <input type="number" id="st_resource_max" min="1" value="10">
                    </div>
                    <div class="field-group">
                        <label for="st_blood_per_turn">Per Turn</label>
                        <input type="number" id="st_blood_per_turn" min="1" value="1">
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Virtues</h2>
                <div class="virtues-grid">
                    ${renderSTVirtue('conscience', 'Conscience/Conviction')}
                    ${renderSTVirtue('self_control', 'Self-Control/Instinct')}
                    ${renderSTVirtue('courage', 'Courage')}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Humanity / Path</h2>
                <div class="humanity-track">
                    <div class="wod-dots large" data-id="humanity" data-value="7" data-max="10">
                        ${renderSTLargeDots(10, 7)}
                    </div>
                    <div class="field-group" style="margin-top: 12px;">
                        <label for="st_path_name">Path Name</label>
                        <input type="text" id="st_path_name" placeholder="Humanity or Path of...">
                    </div>
                </div>
            </div>
        </div>

        <!-- INVENTORY TAB -->
        <div class="tab-content" id="system-inventory" style="display: none;">
            <div class="section">
                <h2 class="section-title">Backgrounds</h2>
                <div class="backgrounds-list">
                    ${config.backgrounds.map(bg => renderSTBackgroundRow(bg)).join('')}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Disciplines / Gifts / Spheres</h2>
                <div class="powers-list">
                    ${[1,2,3,4,5,6].map(i => `
                        <div class="power-row">
                            <input type="text" id="st_power_${i}_name" placeholder="Power name">
                            ${renderSTDotRatingSmall(`power_${i}`, 5)}
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Merits & Flaws</h2>
                <div class="grid-2">
                    <div class="field-group">
                        <label>Merits</label>
                        <textarea id="st_merits" rows="5" placeholder="Merit (points)..."></textarea>
                    </div>
                    <div class="field-group">
                        <label>Flaws</label>
                        <textarea id="st_flaws" rows="5" placeholder="Flaw (points)..."></textarea>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Equipment & Possessions</h2>
                <textarea id="st_equipment" rows="6" placeholder="Weapons, gear, items..."></textarea>
            </div>

            <div class="section">
                <h2 class="section-title">Experience</h2>
                <div class="grid-2">
                    <div class="field-group">
                        <label>Total Earned</label>
                        <input type="number" id="st_xp_total" min="0" value="0">
                    </div>
                    <div class="field-group">
                        <label>Unspent</label>
                        <input type="number" id="st_xp_unspent" min="0" value="0">
                    </div>
                </div>
            </div>
        </div>

        <!-- DICE TAB -->
        <div class="tab-content" id="system-dice" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="8" cy="8" r="1.5"/><circle cx="16" cy="16" r="1.5"/></svg>
                    Dice Pool Roller
                </h2>
                <p class="section-hint">Roll d10s. Results of difficulty or higher = success. 1s cancel successes.</p>

                <div class="dice-pool-roller">
                    <div class="pool-builder">
                        <div class="grid-2">
                            <div class="field-group">
                                <label>Dice Pool</label>
                                <input type="number" id="st_dice_pool" min="1" value="5">
                            </div>
                            <div class="field-group">
                                <label>Difficulty</label>
                                <select id="st_difficulty">
                                    <option value="4">4 (Easy)</option>
                                    <option value="5">5 (Routine)</option>
                                    <option value="6" selected>6 (Standard)</option>
                                    <option value="7">7 (Challenging)</option>
                                    <option value="8">8 (Difficult)</option>
                                    <option value="9">9 (Extremely Difficult)</option>
                                </select>
                            </div>
                        </div>
                        <div class="modifier-options">
                            <label class="modifier-checkbox">
                                <input type="checkbox" id="st_specialty">
                                <span>Specialty (10s count twice)</span>
                            </label>
                        </div>
                        <button class="dice-btn roll-pool" onclick="rollSTPool()">Roll Dice Pool</button>
                    </div>

                    <div class="roll-result-container st-result">
                        <div class="successes-display">
                            <span class="successes-label">Successes:</span>
                            <span class="successes-value" id="st_successes">0</span>
                        </div>
                        <div class="roll-outcome" id="st_outcome"></div>
                        <div class="dice-results" id="st_dice_results"></div>
                    </div>

                    <div class="roll-history" id="st_roll_history">
                        <h3>Roll History</h3>
                        <div class="history-list" id="st_history_list"></div>
                    </div>
                </div>
            </div>

            <div class="section">
                <h2 class="section-title">Common Rolls</h2>
                <div class="quick-rolls-grid">
                    <button class="quick-roll-btn" onclick="rollSTQuick('strength', 'brawl')">Strength + Brawl</button>
                    <button class="quick-roll-btn" onclick="rollSTQuick('dexterity', 'melee')">Dex + Melee</button>
                    <button class="quick-roll-btn" onclick="rollSTQuick('dexterity', 'firearms')">Dex + Firearms</button>
                    <button class="quick-roll-btn" onclick="rollSTQuick('manipulation', 'subterfuge')">Manip + Subterfuge</button>
                    <button class="quick-roll-btn" onclick="rollSTQuick('charisma', 'leadership')">Charisma + Leadership</button>
                    <button class="quick-roll-btn" onclick="rollSTQuick('perception', 'alertness')">Perception + Alertness</button>
                </div>
            </div>
        </div>

        <!-- RULES TAB -->
        <div class="tab-content" id="system-rules" style="display: none;">
            <div class="section">
                <h2 class="section-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    Storyteller System Quick Reference
                </h2>

                <div class="rules-accordion">
                    <details class="rules-section">
                        <summary>Dice Rolling</summary>
                        <div class="rules-content">
                            <p><strong>Dice Pool:</strong> Attribute + Ability</p>
                            <p><strong>Standard Difficulty:</strong> 6</p>
                            <p><strong>Success:</strong> Each die showing difficulty or higher</p>
                            <p><strong>Failure:</strong> No successes</p>
                            <p><strong>Botch:</strong> 1s appear with no successes</p>
                            <p><strong>1s Cancel Successes:</strong> Each 1 removes a success</p>
                            <p><strong>Specialty:</strong> When applicable, 10s count as 2 successes</p>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Difficulty Levels</summary>
                        <div class="rules-content">
                            <ul>
                                <li><strong>3:</strong> Trivial (walking)</li>
                                <li><strong>4:</strong> Easy</li>
                                <li><strong>5:</strong> Routine</li>
                                <li><strong>6:</strong> Standard</li>
                                <li><strong>7:</strong> Challenging</li>
                                <li><strong>8:</strong> Difficult</li>
                                <li><strong>9:</strong> Extremely Difficult</li>
                                <li><strong>10:</strong> Nearly Impossible</li>
                            </ul>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Combat</summary>
                        <div class="rules-content">
                            <p><strong>Initiative:</strong> Wits + Alertness (or 1d10 + Dex + Wits)</p>
                            <p><strong>Attack Pools:</strong></p>
                            <ul>
                                <li>Brawl: Dexterity + Brawl</li>
                                <li>Melee: Dexterity + Melee</li>
                                <li>Firearms: Dexterity + Firearms</li>
                            </ul>
                            <p><strong>Damage:</strong> Successes + weapon damage rating</p>
                            <p><strong>Soak:</strong> Roll Stamina vs difficulty 6 (lethal may not be soakable by mortals)</p>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Health Levels</summary>
                        <div class="rules-content">
                            <ul>
                                <li><strong>Bruised:</strong> No penalty</li>
                                <li><strong>Hurt:</strong> -1 die</li>
                                <li><strong>Injured:</strong> -1 die</li>
                                <li><strong>Wounded:</strong> -2 dice</li>
                                <li><strong>Mauled:</strong> -2 dice</li>
                                <li><strong>Crippled:</strong> -5 dice</li>
                                <li><strong>Incapacitated:</strong> Cannot act</li>
                            </ul>
                            <p><strong>Damage Types:</strong></p>
                            <ul>
                                <li><strong>Bashing:</strong> Fists, clubs - heals quickly</li>
                                <li><strong>Lethal:</strong> Knives, bullets - heals slowly</li>
                                <li><strong>Aggravated:</strong> Fire, sunlight, claws - very slow to heal</li>
                            </ul>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Willpower</summary>
                        <div class="rules-content">
                            <p><strong>Spending Willpower:</strong></p>
                            <ul>
                                <li>1 point = 1 automatic success</li>
                                <li>Resist certain supernatural powers</li>
                                <li>Activate some Disciplines/Gifts</li>
                            </ul>
                            <p><strong>Regaining Willpower:</strong></p>
                            <ul>
                                <li>Acting according to Nature</li>
                                <li>Full night's rest (at ST discretion)</li>
                            </ul>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Blood Points (Vampire)</summary>
                        <div class="rules-content">
                            <p><strong>Uses:</strong></p>
                            <ul>
                                <li>Wake for the night (1 point)</li>
                                <li>Heal 1 bashing/lethal (1 point)</li>
                                <li>Increase Physical Attribute (+1 per point, 1 turn)</li>
                                <li>Power Disciplines</li>
                            </ul>
                            <p><strong>Blood Per Turn:</strong> Limited by Generation</p>
                            <p><strong>Frenzy:</strong> When starving or provoked, roll Self-Control to avoid</p>
                        </div>
                    </details>

                    <details class="rules-section">
                        <summary>Experience Costs</summary>
                        <div class="rules-content">
                            <ul>
                                <li><strong>New Ability:</strong> 3 XP</li>
                                <li><strong>New Discipline (in-clan):</strong> 10 XP</li>
                                <li><strong>New Discipline (out-of-clan):</strong> 15 XP</li>
                                <li><strong>Attribute:</strong> current rating x 4</li>
                                <li><strong>Ability:</strong> current rating x 2</li>
                                <li><strong>Clan Discipline:</strong> current rating x 5</li>
                                <li><strong>Other Discipline:</strong> current rating x 7</li>
                                <li><strong>Willpower:</strong> current rating</li>
                            </ul>
                        </div>
                    </details>
                </div>

                <div class="rules-links">
                    <a href="https://whitewolf.fandom.com/wiki/Storyteller_System" target="_blank" class="rules-link">White Wolf Wiki</a>
                </div>
            </div>
        </div>
    `;
}

// Render dot rating for Storyteller attributes
function renderSTDotRating(id, name) {
    let dots = '';
    for (let i = 1; i <= 5; i++) {
        const filled = i === 1 ? 'filled' : '';
        dots += `<span class="wod-dot ${filled}" data-value="${i}"></span>`;
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

// Render small dot rating
function renderSTDotRatingSmall(id, maxDots = 5) {
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

// Render large dots (for willpower, humanity)
function renderSTLargeDots(count, filled = 0) {
    let dots = '';
    for (let i = 1; i <= count; i++) {
        const filledClass = i <= filled ? 'filled' : '';
        dots += `<span class="wod-dot large ${filledClass}" data-value="${i}"></span>`;
    }
    return dots;
}

// Render ability row
function renderSTAbilityRow(abilityName, category) {
    const abilityId = abilityName.toLowerCase().replace(/\s+/g, '_');
    return `
        <div class="ability-row">
            <span class="ability-name">${abilityName}</span>
            ${renderSTDotRatingSmall(`${category}_${abilityId}`, 5)}
        </div>
    `;
}

// Render health track
function renderSTHealthTrack(healthLevels) {
    return `
        <div class="health-levels">
            ${healthLevels.map((level, index) => `
                <div class="health-level-row">
                    <span class="level-name">${level.name}</span>
                    <span class="level-penalty">${level.penalty !== null ? level.penalty : '-'}</span>
                    <div class="health-boxes">
                        <input type="checkbox" class="health-box bashing" data-level="${index}" data-type="bashing">
                        <input type="checkbox" class="health-box lethal" data-level="${index}" data-type="lethal">
                        <input type="checkbox" class="health-box aggravated" data-level="${index}" data-type="aggravated">
                    </div>
                </div>
            `).join('')}
        </div>
        <div class="health-legend">
            <span class="legend-item"><span class="box-label">[ ]</span> Bashing</span>
            <span class="legend-item"><span class="box-label">[/]</span> Lethal</span>
            <span class="legend-item"><span class="box-label">[X]</span> Aggravated</span>
        </div>
    `;
}

// Render virtue
function renderSTVirtue(id, name) {
    return `
        <div class="virtue-row">
            <span class="virtue-name">${name}</span>
            <div class="wod-dots" data-id="${id}" data-value="1" data-max="5">
                ${renderSTLargeDots(5, 1)}
            </div>
        </div>
    `;
}

// Render background row
function renderSTBackgroundRow(bgName) {
    const bgId = bgName.toLowerCase().replace(/\s+/g, '_');
    return `
        <div class="background-row">
            <span class="background-name">${bgName}</span>
            ${renderSTDotRatingSmall(`bg_${bgId}`, 5)}
        </div>
    `;
}

// Roll Storyteller dice pool
function rollSTPool() {
    const poolSize = parseInt(document.getElementById('st_dice_pool').value) || 1;
    const difficulty = parseInt(document.getElementById('st_difficulty').value) || 6;
    const specialty = document.getElementById('st_specialty').checked;

    const rolls = [];
    for (let i = 0; i < poolSize; i++) {
        rolls.push(Math.floor(Math.random() * 10) + 1);
    }

    let successes = 0;
    let ones = 0;

    rolls.forEach(roll => {
        if (roll >= difficulty) {
            successes++;
            if (specialty && roll === 10) {
                successes++; // Specialty: 10s count twice
            }
        }
        if (roll === 1) {
            ones++;
        }
    });

    // 1s cancel successes
    successes = Math.max(0, successes - ones);

    // Determine outcome
    let outcome = '';
    let outcomeClass = '';
    if (successes === 0 && ones > 0) {
        outcome = 'Botch!';
        outcomeClass = 'botch';
    } else if (successes === 0) {
        outcome = 'Failure';
        outcomeClass = 'failure';
    } else if (successes >= 5) {
        outcome = 'Exceptional Success!';
        outcomeClass = 'exceptional';
    } else {
        outcome = 'Success';
        outcomeClass = 'success';
    }

    displaySTResult(successes, rolls, difficulty, outcome, outcomeClass);
}

// Roll quick pool
function rollSTQuick(attrId, abilityId) {
    const attrValue = getSTAttributeValue(attrId);
    const abilityValue = getSTAbilityValue(abilityId);
    const pool = attrValue + abilityValue;

    document.getElementById('st_dice_pool').value = pool;
    rollSTPool();
}

// Get attribute value
function getSTAttributeValue(attrId) {
    const dots = document.querySelector(`.wod-dots[data-id="${attrId}"]`);
    return dots ? parseInt(dots.dataset.value) || 1 : 1;
}

// Get ability value
function getSTAbilityValue(abilityId) {
    // Try talent, skill, knowledge
    for (const category of ['talent', 'skill', 'knowledge']) {
        const dots = document.querySelector(`.wod-dots[data-id="${category}_${abilityId}"]`);
        if (dots) return parseInt(dots.dataset.value) || 0;
    }
    return 0;
}

// Display Storyteller roll result
function displaySTResult(successes, rolls, difficulty, outcome, outcomeClass) {
    const successesDisplay = document.getElementById('st_successes');
    const outcomeDisplay = document.getElementById('st_outcome');
    const diceResults = document.getElementById('st_dice_results');
    const historyList = document.getElementById('st_history_list');

    if (successesDisplay) {
        successesDisplay.textContent = successes;
        successesDisplay.className = 'successes-value ' + outcomeClass;
    }

    if (outcomeDisplay) {
        outcomeDisplay.textContent = outcome;
        outcomeDisplay.className = 'roll-outcome ' + outcomeClass;
    }

    if (diceResults) {
        diceResults.innerHTML = rolls.map(roll => {
            let classes = 'die-result';
            if (roll >= difficulty) classes += ' success';
            if (roll === 10) classes += ' critical';
            if (roll === 1) classes += ' botch';
            return `<span class="${classes}">${roll}</span>`;
        }).join('');
    }

    // Add to history
    if (historyList) {
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item ' + outcomeClass;
        historyItem.innerHTML = `
            <span class="history-label">${rolls.length}d10 vs ${difficulty}</span>
            <span class="history-result">${successes} success${successes !== 1 ? 'es' : ''}</span>
        `;
        historyList.insertBefore(historyItem, historyList.firstChild);

        while (historyList.children.length > 10) {
            historyList.removeChild(historyList.lastChild);
        }
    }
}

// Initialize Storyteller dot ratings
function initializeSTDotRatings() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('wod-dot')) {
            const value = parseInt(e.target.dataset.value);
            const container = e.target.closest('.wod-dots');
            if (container) {
                const currentValue = parseInt(container.dataset.value) || 0;
                const maxValue = parseInt(container.dataset.max) || 5;
                const id = container.dataset.id;

                // Determine minimum value
                const isAttribute = !id.includes('_') || ['willpower_permanent', 'humanity'].includes(id);
                const minValue = isAttribute && !id.includes('bg_') && !id.includes('power_') ? 1 : 0;

                // Toggle: clicking same value sets to value-1
                const newValue = (value === currentValue) ? Math.max(minValue, value - 1) : Math.min(value, maxValue);

                container.dataset.value = newValue;

                // Update dot visuals
                container.querySelectorAll('.wod-dot').forEach((dot, index) => {
                    if (index < newValue) {
                        dot.classList.add('filled');
                    } else {
                        dot.classList.remove('filled');
                    }
                });
            }
        }
    });
}

// Initialize Storyteller sheet
function initializeST() {
    initializeSTDotRatings();

    // Scope to system-content to avoid affecting other systems
    const systemContent = document.getElementById('system-content');
    if (!systemContent) return;

    // Set initial attribute values to 1 (attributes start at 1, abilities/backgrounds start at 0)
    systemContent.querySelectorAll('.wod-dots').forEach(container => {
        const id = container.dataset.id;
        // Attributes don't have underscores in their IDs
        // Skills/talents/knowledges use: talent_, skill_, knowledge_
        // Backgrounds use: bg_
        // Powers use: power_
        const isAttribute = id && !id.includes('_');
        if (isAttribute) {
            container.dataset.value = 1;
            const firstDot = container.querySelector('.wod-dot');
            if (firstDot) firstDot.classList.add('filled');
        }
    });
}

// Export functions
if (typeof window !== 'undefined') {
    window.renderStorytellerSheet = renderStorytellerSheet;
    window.initializeST = initializeST;
    window.rollSTPool = rollSTPool;
    window.rollSTQuick = rollSTQuick;
}
