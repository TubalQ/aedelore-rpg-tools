// Dice Roller functionality

// Current roll mode
let currentRollMode = 'successes';

// Selected dice for single-die modes
let selectedSingleDie = null;
let selectedFoodDie = null;
let selectedWaterDie = null;

// Dice count limits
const DICE_MIN = 0;
const DICE_MAX = 10;

// Adjust dice count with +/- buttons
function adjustDice(diceType, delta) {
    const slider = document.getElementById(`${diceType}-slider`);
    const countDisplay = document.getElementById(`${diceType}-count`);

    if (!slider || !countDisplay) return;

    let currentValue = parseInt(slider.value) || 0;
    let newValue = currentValue + delta;

    // Clamp to min/max
    newValue = Math.max(DICE_MIN, Math.min(DICE_MAX, newValue));

    slider.value = newValue;
    countDisplay.textContent = newValue;
}

// Initialize dice controls
function initializeDiceSliders() {
    const diceTypes = ['d10', 'd12', 'd20'];

    diceTypes.forEach(type => {
        const slider = document.getElementById(`${type}-slider`);
        const count = document.getElementById(`${type}-count`);

        if (slider && count) {
            // Support both slider and stepper modes
            slider.addEventListener('input', function() {
                count.textContent = this.value;
            });

            // Initialize display
            count.textContent = slider.value;
        }
    });

    // Initialize roll mode selector
    const rollModeSelect = document.getElementById('roll-mode');
    if (rollModeSelect) {
        rollModeSelect.addEventListener('change', function() {
            currentRollMode = this.value;
            updateModeUI();
        });
        updateModeUI();
    }

    console.log('✓ Dice controls initialized');
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
        'successes': 'Roll D10/D12/D20 per ability point. D10: 10=critical (reroll), 8-9=success, 6-7=barely, 1-5=fail',
        'initiative': 'Roll D6 (≤6 players) or D10 (>6 players). Highest roll goes first.',
        'food-water': 'Roll one die for food and one for water. 6-10 = keep at 1D10, 1-5 = reduce to 1D6.',
        'arrows': 'Roll after battle to determine arrow losses or gains.'
    };

    modeDesc.textContent = descriptions[currentRollMode] || '';

    // Show/hide different UI elements based on mode
    const successesUI = document.getElementById('dice-sliders-successes');
    const singleUI = document.getElementById('dice-selector-single');
    const foodWaterUI = document.getElementById('dice-selector-food-water');

    // Hide all first
    if (successesUI) successesUI.style.display = 'none';
    if (singleUI) singleUI.style.display = 'none';
    if (foodWaterUI) foodWaterUI.style.display = 'none';

    // Show appropriate UI
    if (currentRollMode === 'successes') {
        if (successesUI) successesUI.style.display = 'grid';
    } else if (currentRollMode === 'initiative' || currentRollMode === 'arrows') {
        if (singleUI) singleUI.style.display = 'block';
        // Reset selection
        selectedSingleDie = null;
        document.getElementById('select-d6-single')?.classList.remove('selected');
        document.getElementById('select-d10-single')?.classList.remove('selected');
        document.getElementById('selected-die-display').textContent = 'Selected: None';
    } else if (currentRollMode === 'food-water') {
        if (foodWaterUI) foodWaterUI.style.display = 'block';
        // Reset selections
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

// Determine success level based on dice type, result, and current mode
function getSuccessLevel(diceType, result) {
    // Mode-specific logic
    if (currentRollMode === 'initiative') {
        // Initiative: just show the number, no label
        return { success: true, type: 'neutral', label: '' };
    }

    if (currentRollMode === 'food-water') {
        // Food & Water: 6-10 keep 1D10, 1-5 reduce to 1D6
        // Still track success/failure for summary, but don't show label on dice
        if (result >= 6) {
            return { success: true, type: 'neutral', label: '' };
        } else {
            return { success: false, type: 'neutral', label: '' };
        }
    }

    if (currentRollMode === 'arrows') {
        // Arrows: just show the number, no label
        return { success: true, type: 'neutral', label: '' };
    }

    // Successes mode (default for ability/spell checks)
    // All dice scaled to match D10 percentages: 50% fail, 20% barely, 20% success, 7% critical

    if (diceType === 'd10') {
        // D10: 1-5 fail, 6-7 barely, 8-9 success, 10 ALWAYS critical (but 10 is rare - 2% chance)
        if (result >= 10) return { success: true, type: 'critical', label: 'Critical!' };
        if (result >= 8) return { success: true, type: 'success', label: 'Success' };
        if (result >= 6) return { success: true, type: 'barely', label: 'Barely' };
        return { success: false, type: 'failure', label: 'Fail' };
    }

    if (diceType === 'd12') {
        // D12: 1-6 fail (50%), 7-8 barely (16.7%), 9-12 success (33.3%) - NO CRITICALS
        if (result >= 9) return { success: true, type: 'success', label: 'Success' };
        if (result >= 7) return { success: true, type: 'barely', label: 'Barely' };
        return { success: false, type: 'failure', label: 'Fail' };
    }

    if (diceType === 'd20') {
        // D20: 1-10 fail (50%), 11-14 barely (20%), 15-20 success (30%) - NO CRITICALS
        if (result >= 15) return { success: true, type: 'success', label: 'Success' };
        if (result >= 11) return { success: true, type: 'barely', label: 'Barely' };
        return { success: false, type: 'failure', label: 'Fail' };
    }

    // For other dice modes (initiative, food-water, arrows) - just return the value
    const max = parseInt(diceType.substring(1));
    const threshold = Math.ceil(max * 0.5);
    const successThreshold = Math.ceil(max * 0.7);

    if (result >= successThreshold) return { success: true, type: 'success', label: 'Success' };
    if (result >= threshold) return { success: true, type: 'barely', label: 'Barely' };
    return { success: false, type: 'failure', label: 'Fail' };
}

// Roll a single die
function rollDie(sides) {
    // Special weighted roll for D10: make 10 more rare (2% chance)
    if (sides === 10) {
        const random = Math.random();
        if (random < 0.02) {
            // 2% chance to roll a 10
            return 10;
        } else {
            // 98% chance to roll 1-9 (evenly distributed)
            return Math.floor(Math.random() * 9) + 1;
        }
    }

    // Regular dice rolling for other types
    return Math.floor(Math.random() * sides) + 1;
}

// Store critical information for rerolls
let criticalRerollData = {};

// Main function to roll all dice
function rollAllDice() {
    const resultsContainer = document.getElementById('dice-results-container');
    const resultsSection = document.getElementById('dice-results-section');
    const totalSuccessesSpan = document.getElementById('total-successes');
    const successBreakdown = document.getElementById('success-breakdown');

    // Clear previous results and critical data
    resultsContainer.innerHTML = '';
    criticalRerollData = {};

    let totalFullSuccesses = 0;
    let totalBarelySuccesses = 0;
    let criticalCount = 0;
    let fullSuccessCount = 0;
    let barelyCount = 0;
    let failCount = 0;
    let hasAnyDice = false;
    let animationDelay = 0;

    // Determine which dice to roll based on mode
    let diceToRoll = [];

    if (currentRollMode === 'successes') {
        // Get dice from sliders
        const diceTypes = [
            { name: 'd10', sides: 10 },
            { name: 'd12', sides: 12 },
            { name: 'd20', sides: 20 }
        ];
        diceTypes.forEach(diceType => {
            const slider = document.getElementById(`${diceType.name}-slider`);
            if (slider) {
                const count = parseInt(slider.value);
                if (count > 0) {
                    diceToRoll.push({ name: diceType.name, sides: diceType.sides, count: count });
                }
            }
        });
    } else if (currentRollMode === 'initiative' || currentRollMode === 'arrows') {
        // Single die selection
        if (!selectedSingleDie) {
            alert('Please select a die type first!');
            return;
        }
        const sides = selectedSingleDie === 'd6' ? 6 : 10;
        diceToRoll.push({ name: selectedSingleDie, sides: sides, count: 1, label: currentRollMode === 'initiative' ? 'Initiative' : 'Arrows' });
    } else if (currentRollMode === 'food-water') {
        // Food & Water: two separate rolls
        if (!selectedFoodDie || !selectedWaterDie) {
            alert('Please select both food and water die types!');
            return;
        }
        const foodSides = selectedFoodDie === 'd6' ? 6 : 10;
        const waterSides = selectedWaterDie === 'd6' ? 6 : 10;
        diceToRoll.push({ name: selectedFoodDie, sides: foodSides, count: 1, label: 'Food' });
        diceToRoll.push({ name: selectedWaterDie, sides: waterSides, count: 1, label: 'Water' });
    }

    if (diceToRoll.length === 0) {
        alert('Please select at least one die to roll!');
        return;
    }

    // Roll each dice type
    diceToRoll.forEach(diceType => {
        const count = diceType.count;

        if (count > 0) {
            hasAnyDice = true;
            const diceContainer = document.createElement('div');
            diceContainer.className = 'dice-container';
            diceContainer.id = `dice-container-${diceType.name}`;

            const header = document.createElement('div');
            header.className = 'dice-type-header';
            const displayLabel = diceType.label || diceType.name.toUpperCase();
            header.textContent = count === 1 ? displayLabel : `${diceType.name.toUpperCase()} (${count} dice)`;
            diceContainer.appendChild(header);

            const diceGrid = document.createElement('div');
            diceGrid.className = 'dice-results-grid';
            diceGrid.id = `dice-grid-${diceType.name}`;

            let diceTypeCriticals = 0;

            // Roll each die
            for (let i = 0; i < count; i++) {
                const result = rollDie(diceType.sides);
                const successInfo = getSuccessLevel(diceType.name, result);

                // Count successes
                if (successInfo.success) {
                    if (successInfo.type === 'critical') {
                        criticalCount++;
                        diceTypeCriticals++;
                        totalFullSuccesses++; // Criticals count as full successes
                    } else if (successInfo.type === 'success') {
                        fullSuccessCount++;
                        totalFullSuccesses++; // Full successes
                    } else if (successInfo.type === 'barely') {
                        barelyCount++;
                        totalBarelySuccesses++; // Barely successes counted separately
                    }
                } else {
                    failCount++;
                }

                // Create dice element with delay for animation
                setTimeout(() => {
                    const diceElement = document.createElement('div');
                    diceElement.className = `dice ${successInfo.type}`;
                    diceElement.textContent = result;

                    // Only show label for successes mode
                    if (successInfo.label) {
                        const label = document.createElement('div');
                        label.className = 'dice-result-label';
                        label.textContent = successInfo.label;
                        diceElement.appendChild(label);
                    }

                    diceGrid.appendChild(diceElement);
                }, animationDelay);

                animationDelay += 100;
            }

            // Store critical data for this dice type
            if (diceTypeCriticals > 0) {
                criticalRerollData[diceType.name] = {
                    count: diceTypeCriticals,
                    sides: diceType.sides
                };
            }

            diceContainer.appendChild(diceGrid);
            resultsContainer.appendChild(diceContainer);
        }
    });

    if (!hasAnyDice) {
        resultsSection.style.display = 'none';
        alert('Please select at least one die to roll!');
        return;
    }

    // Update success summary
    setTimeout(() => {
        const totalBarelySpan = document.getElementById('total-barely');
        const successSummary = document.getElementById('success-summary');

        // Mode-specific summary display
        if (currentRollMode === 'successes') {
            // Successes mode: show full summary
            successSummary.style.display = 'block';
            totalSuccessesSpan.textContent = totalFullSuccesses;
            totalBarelySpan.parentElement.style.display = 'block';
            totalBarelySpan.textContent = totalBarelySuccesses;

            let breakdownHTML = '';
            if (criticalCount > 0) {
                breakdownHTML += `<span class="success-type critical">🌟 ${criticalCount} Critical</span>`;
            }
            if (fullSuccessCount > 0) {
                breakdownHTML += `<span class="success-type full">✓ ${fullSuccessCount} Full Success</span>`;
            }
            if (barelyCount > 0) {
                breakdownHTML += `<span class="success-type barely">~ ${barelyCount} Barely</span>`;
            }
            if (failCount > 0) {
                breakdownHTML += `<span style="color: var(--text-secondary); margin: 0 10px;">✗ ${failCount} Failures</span>`;
            }
            successBreakdown.innerHTML = breakdownHTML;
        } else {
            // For all other modes: hide the summary completely
            successSummary.style.display = 'none';
        }

        resultsSection.style.display = 'block';

        // Show reroll buttons if there are criticals (successes mode only)
        showRerollButtons();

        // Scroll to results
        resultsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, animationDelay + 300);
}

// Show reroll button for all critical dice
function showRerollButtons() {
    const rerollContainer = document.getElementById('reroll-buttons-container');
    rerollContainer.innerHTML = '';

    // Only show reroll buttons in successes mode
    if (currentRollMode !== 'successes') {
        rerollContainer.style.display = 'none';
        return;
    }

    let totalCriticals = 0;
    Object.keys(criticalRerollData).forEach(diceType => {
        totalCriticals += criticalRerollData[diceType].count;
    });

    if (totalCriticals > 0) {
        rerollContainer.style.display = 'block';

        const button = document.createElement('button');
        button.textContent = `🎲 Reroll ${totalCriticals} Critical${totalCriticals > 1 ? 's' : ''}`;
        button.style.fontSize = '1.2rem';
        button.style.padding = '15px 40px';
        button.onclick = () => rerollAllCriticals();
        rerollContainer.appendChild(button);
    } else {
        rerollContainer.style.display = 'none';
    }
}

// Reroll all critical dice at once
function rerollAllCriticals() {
    const resultsContainer = document.getElementById('dice-results-container');

    // Create a reroll section for all criticals
    let rerollSection = document.getElementById('all-rerolls-section');
    if (!rerollSection) {
        rerollSection = document.createElement('div');
        rerollSection.id = 'all-rerolls-section';
        rerollSection.className = 'dice-container';
        rerollSection.style.marginTop = '30px';
        rerollSection.style.background = 'rgba(251, 191, 36, 0.1)';
        rerollSection.style.borderColor = 'var(--accent-gold)';

        const rerollHeader = document.createElement('div');
        rerollHeader.className = 'dice-type-header';
        rerollHeader.style.color = 'var(--accent-gold)';
        rerollHeader.textContent = '🌟 Critical Rerolls';
        rerollSection.appendChild(rerollHeader);

        const rerollGrid = document.createElement('div');
        rerollGrid.className = 'dice-results-grid';
        rerollGrid.id = 'all-rerolls-grid';
        rerollSection.appendChild(rerollGrid);

        resultsContainer.appendChild(rerollSection);
    }

    const rerollGrid = document.getElementById('all-rerolls-grid');

    let newCriticals = 0;
    let newFullSuccess = 0;
    let newBarely = 0;
    let newFullSuccessTotal = 0;  // Total full successes to add
    let newBarelyTotal = 0;       // Total barely successes to add
    let animationDelay = 0;
    const newCriticalData = {};

    // Roll all critical dice
    Object.keys(criticalRerollData).forEach(diceType => {
        const data = criticalRerollData[diceType];

        for (let i = 0; i < data.count; i++) {
            const result = rollDie(data.sides);
            const successInfo = getSuccessLevel(diceType, result);

            // Count what the reroll resulted in
            // Critical rerolls that result in success/critical/barely add to total
            if (successInfo.type === 'critical') {
                newCriticals++;
                newFullSuccessTotal++;
                if (!newCriticalData[diceType]) {
                    newCriticalData[diceType] = { count: 0, sides: data.sides };
                }
                newCriticalData[diceType].count++;
            } else if (successInfo.type === 'success') {
                newFullSuccess++;
                newFullSuccessTotal++;
            } else if (successInfo.type === 'barely') {
                newBarely++;
                newBarelyTotal++;
            }
            // Failures on reroll add nothing extra (original critical already counted)

            // Create dice element with delay for animation
            setTimeout(() => {
                const diceElement = document.createElement('div');
                diceElement.className = `dice ${successInfo.type}`;
                diceElement.textContent = result;

                // Only show label for successes mode
                if (successInfo.label) {
                    const label = document.createElement('div');
                    label.className = 'dice-result-label';
                    label.textContent = `${diceType.toUpperCase()}: ${successInfo.label}`;
                    diceElement.appendChild(label);
                }

                rerollGrid.appendChild(diceElement);
            }, animationDelay);

            animationDelay += 100;
        }
    });

    // Update total successes and breakdown
    setTimeout(() => {
        const totalSuccessesSpan = document.getElementById('total-successes');
        const totalBarelySpan = document.getElementById('total-barely');

        const currentFullTotal = parseInt(totalSuccessesSpan.textContent) || 0;
        const currentBarelyTotal = parseInt(totalBarelySpan.textContent) || 0;

        totalSuccessesSpan.textContent = currentFullTotal + newFullSuccessTotal;
        totalBarelySpan.textContent = currentBarelyTotal + newBarelyTotal;

        // Update breakdown with new counts
        updateBreakdown(newCriticals, newFullSuccess, newBarely);

        // Update critical reroll data with new criticals
        criticalRerollData = newCriticalData;
        showRerollButtons();
    }, animationDelay + 100);
}

// Update success breakdown display
function updateBreakdown(addCriticals, addFullSuccess, addBarely) {
    const successBreakdown = document.getElementById('success-breakdown');
    const breakdownHTML = successBreakdown.innerHTML;

    // Parse current counts from breakdown
    let criticalCount = 0;
    let fullSuccessCount = 0;
    let barelyCount = 0;

    const criticalMatch = breakdownHTML.match(/(\d+)\s+Critical/);
    if (criticalMatch) criticalCount = parseInt(criticalMatch[1]);

    const fullMatch = breakdownHTML.match(/(\d+)\s+Full Success/);
    if (fullMatch) fullSuccessCount = parseInt(fullMatch[1]);

    const barelyMatch = breakdownHTML.match(/(\d+)\s+Barely/);
    if (barelyMatch) barelyCount = parseInt(barelyMatch[1]);

    // Add new counts
    criticalCount += addCriticals;
    fullSuccessCount += addFullSuccess;
    barelyCount += addBarely;

    // Rebuild breakdown HTML
    let newBreakdownHTML = '';
    if (criticalCount > 0) {
        newBreakdownHTML += `<span class="success-type critical">🌟 ${criticalCount} Critical</span>`;
    }
    if (fullSuccessCount > 0) {
        newBreakdownHTML += `<span class="success-type full">✓ ${fullSuccessCount} Full Success</span>`;
    }
    if (barelyCount > 0) {
        newBreakdownHTML += `<span class="success-type barely">~ ${barelyCount} Barely</span>`;
    }

    // Keep failures display (we don't change it in rerolls)
    const failMatch = breakdownHTML.match(/✗\s+(\d+)\s+Failures/);
    if (failMatch) {
        newBreakdownHTML += `<span style="color: var(--text-secondary); margin: 0 10px;">✗ ${failMatch[1]} Failures</span>`;
    }

    successBreakdown.innerHTML = newBreakdownHTML;
}

// Expose functions to global scope for onclick handlers
window.adjustDice = adjustDice;
window.selectSingleDie = selectSingleDie;
window.selectFoodWaterDie = selectFoodWaterDie;
window.rollAllDice = rollAllDice;

// Note: Initialization is handled by init.js after all DOM elements are created
