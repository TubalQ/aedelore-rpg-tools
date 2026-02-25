// Dice Roller functionality — D20 System

// Current roll mode
let currentRollMode = 'd20check';

// Selected dice for single-die modes
let selectedSingleDie = null;
let selectedFoodDie = null;
let selectedWaterDie = null;

// Adjust modifier with +/- buttons
function adjustModifier(delta) {
    const input = document.getElementById('d20-modifier');
    if (!input) return;
    let val = parseInt(input.value) || 0;
    val = Math.max(-10, Math.min(20, val + delta));
    input.value = val;
}

// Adjust DC with +/- buttons
function adjustDC(delta) {
    const input = document.getElementById('d20-dc');
    if (!input) return;
    let val = parseInt(input.value) || 10;
    val = Math.max(1, Math.min(30, val + delta));
    input.value = val;
}

// Adjust damage dice count
function adjustDamageDice(delta) {
    const input = document.getElementById('damage-dice-count');
    if (!input) return;
    let val = parseInt(input.value) || 1;
    val = Math.max(1, Math.min(10, val + delta));
    input.value = val;
}

// Initialize dice controls
function initializeDiceSliders() {
    // Initialize roll mode selector
    const rollModeSelect = document.getElementById('roll-mode');
    if (rollModeSelect) {
        rollModeSelect.addEventListener('change', function() {
            currentRollMode = this.value;
            updateModeUI();
        });
        updateModeUI();
    }

    console.log('✓ Dice controls initialized (D20 system)');
}

// Select single die for initiative/arrows
function selectSingleDie(diceType) {
    selectedSingleDie = diceType;

    // Update button states
    document.getElementById('select-d6-single').classList.remove('selected');
    document.getElementById('select-d10-single').classList.remove('selected');
    document.getElementById(`select-${diceType}-single`).classList.add('selected');

    // Update display
    document.getElementById('selected-die-display').textContent = `Selected: ${diceType.toUpperCase()}`;
}

// Select die for food/water
function selectFoodWaterDie(category, diceType) {
    if (category === 'food') {
        selectedFoodDie = diceType;
        document.getElementById('select-d6-food').classList.remove('selected');
        document.getElementById('select-d10-food').classList.remove('selected');
        document.getElementById(`select-${diceType}-food`).classList.add('selected');
        document.getElementById('food-die-display').textContent = `Selected: ${diceType.toUpperCase()}`;
    } else {
        selectedWaterDie = diceType;
        document.getElementById('select-d6-water').classList.remove('selected');
        document.getElementById('select-d10-water').classList.remove('selected');
        document.getElementById(`select-${diceType}-water`).classList.add('selected');
        document.getElementById('water-die-display').textContent = `Selected: ${diceType.toUpperCase()}`;
    }
}

// Update UI based on current mode
function updateModeUI() {
    const modeDesc = document.getElementById('mode-description');
    if (!modeDesc) return;

    const descriptions = {
        'd20check': 'Roll 1D20 + modifier vs DC. Nat 20 = Critical hit! Nat 1 = Auto-miss.',
        'damage': 'Roll damage dice (D6 or D10). Used after a successful attack or spell.',
        'initiative': 'Roll D6 (≤6 players) or D10 (>6 players). Highest roll goes first.',
        'food-water': 'Roll one die for food and one for water. 6-10 = keep at 1D10, 1-5 = reduce to 1D6.',
        'arrows': 'Roll after battle to determine arrow losses or gains.'
    };

    modeDesc.textContent = descriptions[currentRollMode] || '';

    // Show/hide different UI elements based on mode
    const d20UI = document.getElementById('dice-d20-check');
    const damageUI = document.getElementById('dice-damage-roll');
    const singleUI = document.getElementById('dice-selector-single');
    const foodWaterUI = document.getElementById('dice-selector-food-water');

    // Hide all first
    if (d20UI) d20UI.style.display = 'none';
    if (damageUI) damageUI.style.display = 'none';
    if (singleUI) singleUI.style.display = 'none';
    if (foodWaterUI) foodWaterUI.style.display = 'none';

    // Show appropriate UI
    if (currentRollMode === 'd20check') {
        if (d20UI) d20UI.style.display = 'block';
    } else if (currentRollMode === 'damage') {
        if (damageUI) damageUI.style.display = 'block';
    } else if (currentRollMode === 'initiative' || currentRollMode === 'arrows') {
        if (singleUI) singleUI.style.display = 'block';
        selectedSingleDie = null;
        document.getElementById('select-d6-single')?.classList.remove('selected');
        document.getElementById('select-d10-single')?.classList.remove('selected');
        document.getElementById('selected-die-display').textContent = 'Selected: None';
    } else if (currentRollMode === 'food-water') {
        if (foodWaterUI) foodWaterUI.style.display = 'block';
        selectedFoodDie = null;
        selectedWaterDie = null;
        document.getElementById('select-d6-food')?.classList.remove('selected');
        document.getElementById('select-d10-food')?.classList.remove('selected');
        document.getElementById('select-d6-water')?.classList.remove('selected');
        document.getElementById('select-d10-water')?.classList.remove('selected');
        document.getElementById('food-die-display').textContent = 'Selected: None';
        document.getElementById('water-die-display').textContent = 'Selected: None';
    }
}

// Roll a single die (fair roll for all dice)
function rollDie(sides) {
    return Math.floor(Math.random() * sides) + 1;
}

// Main function to roll all dice
function rollAllDice() {
    const resultsContainer = document.getElementById('dice-results-container');
    const resultsSection = document.getElementById('dice-results-section');
    const successSummary = document.getElementById('success-summary');
    const rerollContainer = document.getElementById('reroll-buttons-container');

    // Clear previous results
    resultsContainer.innerHTML = '';
    if (rerollContainer) rerollContainer.innerHTML = '';

    if (currentRollMode === 'd20check') {
        rollD20Check(resultsContainer, successSummary);
    } else if (currentRollMode === 'damage') {
        rollDamage(resultsContainer, successSummary);
    } else if (currentRollMode === 'initiative' || currentRollMode === 'arrows') {
        rollSingleDie(resultsContainer, successSummary);
    } else if (currentRollMode === 'food-water') {
        rollFoodWater(resultsContainer, successSummary);
    }

    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// D20 Check: 1D20 + modifier vs DC
function rollD20Check(container, summary) {
    const modifier = parseInt(document.getElementById('d20-modifier')?.value) || 0;
    const dc = parseInt(document.getElementById('d20-dc')?.value) || 10;

    const roll = rollDie(20);
    const total = roll + modifier;

    const isNat20 = roll === 20;
    const isNat1 = roll === 1;
    const success = isNat20 || (!isNat1 && total >= dc);

    // Build result display
    const diceContainer = document.createElement('div');
    diceContainer.className = 'dice-container';

    const header = document.createElement('div');
    header.className = 'dice-type-header';
    header.textContent = `1D20 + ${modifier} vs DC ${dc}`;
    diceContainer.appendChild(header);

    const diceGrid = document.createElement('div');
    diceGrid.className = 'dice-results-grid';

    // The D20 die
    const diceElement = document.createElement('div');
    let resultType = 'failure';
    if (isNat20) resultType = 'critical';
    else if (isNat1) resultType = 'failure';
    else if (success) resultType = 'success';
    diceElement.className = `dice ${resultType}`;
    diceElement.textContent = roll;

    const label = document.createElement('div');
    label.className = 'dice-result-label';
    if (isNat20) label.textContent = 'NAT 20!';
    else if (isNat1) label.textContent = 'NAT 1';
    else label.textContent = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    diceElement.appendChild(label);

    diceGrid.appendChild(diceElement);
    diceContainer.appendChild(diceGrid);
    container.appendChild(diceContainer);

    // Summary
    if (summary) {
        summary.style.display = 'block';
        const totalSpan = document.getElementById('total-successes');
        const barelyLine = document.getElementById('total-barely')?.parentElement;
        const breakdown = document.getElementById('success-breakdown');

        if (barelyLine) barelyLine.style.display = 'none';

        if (totalSpan) totalSpan.textContent = total;
        // Rename label for D20 mode
        const totalLabel = totalSpan?.previousElementSibling || totalSpan?.parentElement?.querySelector('.summary-label');

        let resultHTML = '';
        if (isNat20) {
            resultHTML = `<span class="success-type critical">🌟 CRITICAL HIT! (Natural 20) — Total: ${total}</span>`;
        } else if (isNat1) {
            resultHTML = `<span style="color: var(--text-secondary);">✗ AUTO-MISS (Natural 1) — Total: ${total}</span>`;
        } else if (success) {
            resultHTML = `<span class="success-type success">✓ HIT! ${total} vs DC ${dc} (beat by ${total - dc})</span>`;
        } else {
            resultHTML = `<span style="color: var(--text-secondary);">✗ MISS. ${total} vs DC ${dc} (short by ${dc - total})</span>`;
        }
        if (breakdown) breakdown.innerHTML = resultHTML;
    }

    // Show damage roll button on hit
    if (success && document.getElementById('reroll-buttons-container')) {
        const rerollContainer = document.getElementById('reroll-buttons-container');
        rerollContainer.style.display = 'block';
        const dmgBtn = document.createElement('button');
        dmgBtn.textContent = isNat20 ? '⚔️ Roll Critical Damage (double dice)' : '⚔️ Roll Damage';
        dmgBtn.style.fontSize = '1.2rem';
        dmgBtn.style.padding = '15px 40px';
        dmgBtn.onclick = () => {
            // Switch to damage mode with critical flag
            currentRollMode = 'damage';
            const rollModeSelect = document.getElementById('roll-mode');
            if (rollModeSelect) rollModeSelect.value = 'damage';
            updateModeUI();
            if (isNat20) {
                // Double the dice count for critical
                const countInput = document.getElementById('damage-dice-count');
                if (countInput) {
                    const current = parseInt(countInput.value) || 1;
                    countInput.value = current * 2;
                }
            }
        };
        rerollContainer.appendChild(dmgBtn);
    }
}

// Damage roll: XdY
function rollDamage(container, summary) {
    const count = parseInt(document.getElementById('damage-dice-count')?.value) || 1;
    const dieType = document.getElementById('damage-die-type')?.value || 'd6';
    const sides = parseInt(dieType.substring(1));

    const diceContainer = document.createElement('div');
    diceContainer.className = 'dice-container';

    const header = document.createElement('div');
    header.className = 'dice-type-header';
    header.textContent = `${count}${dieType.toUpperCase()} Damage`;
    diceContainer.appendChild(header);

    const diceGrid = document.createElement('div');
    diceGrid.className = 'dice-results-grid';

    let total = 0;
    let animationDelay = 0;

    for (let i = 0; i < count; i++) {
        const result = rollDie(sides);
        total += result;

        setTimeout(() => {
            const diceElement = document.createElement('div');
            diceElement.className = 'dice success';
            diceElement.textContent = result;
            diceGrid.appendChild(diceElement);
        }, animationDelay);
        animationDelay += 100;
    }

    diceContainer.appendChild(diceGrid);
    container.appendChild(diceContainer);

    // Summary
    setTimeout(() => {
        if (summary) {
            summary.style.display = 'block';
            const totalSpan = document.getElementById('total-successes');
            const barelyLine = document.getElementById('total-barely')?.parentElement;
            const breakdown = document.getElementById('success-breakdown');

            if (barelyLine) barelyLine.style.display = 'none';
            if (totalSpan) totalSpan.textContent = total;
            if (breakdown) breakdown.innerHTML = `<span class="success-type success">⚔️ ${total} damage (${count}${dieType.toUpperCase()})</span>`;
        }
    }, animationDelay + 100);
}

// Roll single die (initiative / arrows)
function rollSingleDie(container, summary) {
    if (!selectedSingleDie) {
        showToast('Please select a die type first!', 'warning');
        return;
    }
    const sides = selectedSingleDie === 'd6' ? 6 : 10;
    const result = rollDie(sides);

    const diceContainer = document.createElement('div');
    diceContainer.className = 'dice-container';

    const header = document.createElement('div');
    header.className = 'dice-type-header';
    header.textContent = currentRollMode === 'initiative' ? 'Initiative' : 'Arrows';
    diceContainer.appendChild(header);

    const diceGrid = document.createElement('div');
    diceGrid.className = 'dice-results-grid';

    const diceElement = document.createElement('div');
    diceElement.className = 'dice neutral';
    diceElement.textContent = result;
    diceGrid.appendChild(diceElement);

    diceContainer.appendChild(diceGrid);
    container.appendChild(diceContainer);

    if (summary) {
        summary.style.display = 'block';
        const totalSpan = document.getElementById('total-successes');
        const barelyLine = document.getElementById('total-barely')?.parentElement;
        const breakdown = document.getElementById('success-breakdown');

        if (barelyLine) barelyLine.style.display = 'none';
        if (totalSpan) totalSpan.textContent = result;
        if (breakdown) breakdown.innerHTML = `<span class="success-type full">${currentRollMode === 'initiative' ? '⚡' : '🏹'} ${result}</span>`;
    }
}

// Roll food/water dice
function rollFoodWater(container, summary) {
    if (!selectedFoodDie || !selectedWaterDie) {
        showToast('Please select both food and water die types!', 'warning');
        return;
    }

    const foodSides = selectedFoodDie === 'd6' ? 6 : 10;
    const waterSides = selectedWaterDie === 'd6' ? 6 : 10;
    const foodResult = rollDie(foodSides);
    const waterResult = rollDie(waterSides);

    const diceContainer = document.createElement('div');
    diceContainer.className = 'dice-container';

    const header = document.createElement('div');
    header.className = 'dice-type-header';
    header.textContent = 'Food & Water';
    diceContainer.appendChild(header);

    const diceGrid = document.createElement('div');
    diceGrid.className = 'dice-results-grid';

    // Food die
    const foodElement = document.createElement('div');
    foodElement.className = `dice ${foodResult >= 6 ? 'success' : 'failure'}`;
    foodElement.textContent = foodResult;
    const foodLabel = document.createElement('div');
    foodLabel.className = 'dice-result-label';
    foodLabel.textContent = foodResult >= 6 ? 'Food OK' : 'Food ↓';
    foodElement.appendChild(foodLabel);
    diceGrid.appendChild(foodElement);

    // Water die
    const waterElement = document.createElement('div');
    waterElement.className = `dice ${waterResult >= 6 ? 'success' : 'failure'}`;
    waterElement.textContent = waterResult;
    const waterLabel = document.createElement('div');
    waterLabel.className = 'dice-result-label';
    waterLabel.textContent = waterResult >= 6 ? 'Water OK' : 'Water ↓';
    waterElement.appendChild(waterLabel);
    diceGrid.appendChild(waterElement);

    diceContainer.appendChild(diceGrid);
    container.appendChild(diceContainer);

    if (summary) {
        summary.style.display = 'block';
        const breakdown = document.getElementById('success-breakdown');
        const barelyLine = document.getElementById('total-barely')?.parentElement;
        const totalSpan = document.getElementById('total-successes');

        if (barelyLine) barelyLine.style.display = 'none';
        if (totalSpan) totalSpan.textContent = '';

        let html = '';
        html += foodResult >= 6
            ? `<span class="success-type success">🍖 Food: ${foodResult} — keep 1D10</span>`
            : `<span style="color: var(--text-secondary);">🍖 Food: ${foodResult} — reduce to 1D6</span>`;
        html += waterResult >= 6
            ? `<span class="success-type success">💧 Water: ${waterResult} — keep 1D10</span>`
            : `<span style="color: var(--text-secondary);">💧 Water: ${waterResult} — reduce to 1D6</span>`;
        if (breakdown) breakdown.innerHTML = html;
    }
}

// Expose functions to global scope for onclick handlers
window.adjustModifier = adjustModifier;
window.adjustDC = adjustDC;
window.adjustDamageDice = adjustDamageDice;
window.selectSingleDie = selectSingleDie;
window.selectFoodWaterDie = selectFoodWaterDie;
window.rollAllDice = rollAllDice;

// Note: Initialization is handled by init.js after all DOM elements are created
