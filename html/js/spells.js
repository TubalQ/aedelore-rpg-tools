// Spell/Ability management functions

// Store original worthiness value for Hero ability
let originalWorthinessValue = null;

// Update spell select dropdowns based on selected class
function updateSpellsList() {
    const selectedClass = document.getElementById('class').value;

    // Check if class is a conjurer (uses arcana) or melee (uses weakened)
    const isConjurer = selectedClass && CLASSES && CLASSES[selectedClass] && CLASSES[selectedClass].abilityType === "arcana";

    // Toggle conjurer class on page-spells for mobile CSS labels
    const spellsPage = document.getElementById('page-spells');
    if (spellsPage) {
        spellsPage.classList.toggle('conjurer-mode', isConjurer);
    }

    // Update table headers
    const column2Header = document.getElementById('spell-column-2');
    const column3Header = document.getElementById('spell-column-3');
    const column4Header = document.getElementById('spell-column-4');

    if (column2Header) {
        if (isConjurer) {
            column2Header.textContent = 'Arcana Cost';
            column2Header.style.color = 'var(--primary-purple)';
            // Hide gain column for conjurers
            if (column3Header) column3Header.style.display = 'none';
            // Change to Spelldamage for conjurers
            if (column4Header) {
                column4Header.textContent = 'Spelldamage';
                column4Header.style.color = '#ef4444';
            }
        } else {
            column2Header.textContent = 'What it does / gives';
            column2Header.style.color = 'var(--accent-gold)';
            // Show gain column for melee
            if (column3Header) column3Header.style.display = 'table-cell';
            // Keep Weakened Cost for melee
            if (column4Header) {
                column4Header.textContent = 'Weakened Cost';
                column4Header.style.color = '#ef4444';
            }
        }
    }

    // Determine max number of spells: Mage gets 10, others get 5
    const maxSpells = selectedClass === 'Mage' ? 10 : 5;

    // Collect all currently selected spells
    const selectedSpells = [];
    for (let i = 1; i <= maxSpells; i++) {
        const spellSelect = document.getElementById(`spell_${i}_type`);
        if (spellSelect && spellSelect.value) {
            selectedSpells.push(spellSelect.value);
        }
    }

    // Show/hide gain cells for all rows
    for (let i = 1; i <= maxSpells; i++) {
        const gainCell = document.getElementById(`spell_${i}_gain_cell`);
        if (gainCell) {
            gainCell.style.display = isConjurer ? 'none' : 'table-cell';
        }
    }

    // Update all spell dropdowns
    for (let i = 1; i <= maxSpells; i++) {
        const spellSelect = document.getElementById(`spell_${i}_type`);
        if (!spellSelect) continue;

        // Save current value
        const currentValue = spellSelect.value;

        // Clear existing options except the placeholder
        spellSelect.innerHTML = `<option value="">Spell/Ability ${i}</option>`;

        // Add spells for selected class
        if (selectedClass && SPELLS_BY_CLASS && SPELLS_BY_CLASS[selectedClass]) {
            const spells = SPELLS_BY_CLASS[selectedClass];
            spells.forEach(spell => {
                const option = document.createElement('option');
                option.value = spell.name;

                // Check if spell is already selected in another slot
                const isSelected = selectedSpells.includes(spell.name) && spell.name !== currentValue;

                if (isSelected) {
                    option.textContent = spell.name + ' (Already Selected)';
                    option.disabled = true;
                    option.style.color = '#94a3b8';
                } else {
                    option.textContent = spell.name;
                }

                spellSelect.appendChild(option);
            });

            // Restore previous value if it still exists in the new list
            if (currentValue && spells.find(s => s.name === currentValue)) {
                spellSelect.value = currentValue;
            }
        }
    }
}

// Auto-fill spell data when a spell is selected
function autoFillSpellData(spellIndex) {
    const selectedClass = document.getElementById('class').value;
    const spellInput = document.getElementById(`spell_${spellIndex}_type`);

    if (!spellInput || !selectedClass || !SPELLS_BY_CLASS[selectedClass]) {
        return;
    }

    const spellName = spellInput.value.trim();
    const spells = SPELLS_BY_CLASS[selectedClass];
    const spell = spells.find(s => s.name === spellName);

    // Check if class is a conjurer
    const isConjurer = CLASSES && CLASSES[selectedClass] && CLASSES[selectedClass].abilityType === "arcana";

    if (spell) {
        // Auto-fill second column (arcana for spells, description for abilities)
        const arcanaInput = document.getElementById(`spell_${spellIndex}_arcana`);
        if (arcanaInput) {
            if (isConjurer) {
                // For conjurers: show arcana cost
                arcanaInput.value = spell.arcana;
            } else {
                // For melee: show what it does (use desc which has full detail)
                arcanaInput.value = spell.desc || spell.damage || '';
            }
        }

        // Auto-fill gain (only for melee abilities)
        const gainInput = document.getElementById(`spell_${spellIndex}_gain`);
        if (gainInput && !isConjurer) {
            gainInput.value = spell.gain !== undefined ? `${spell.gain}D10` : '';
        }

        // Auto-fill last column (Spelldamage for conjurers, Weakened Cost for melee)
        const weakenedInput = document.getElementById(`spell_${spellIndex}_weakened`);
        if (weakenedInput) {
            if (isConjurer) {
                // For conjurers (Mage/Druid): show spelldamage (2/D10 format)
                weakenedInput.value = spell.damage || '';
            } else {
                // For melee (Warrior/Thief/Hunter/Outcast): show weakened cost (numeric or special)
                weakenedInput.value = spell.weakened || '';
            }
        }

        // Show spell info box if function exists
        if (typeof showSpellInfo === 'function') {
            showSpellInfo(spell, spellIndex);
        }

        // Special handling for Hero ability (locks worthiness to 10)
        if (spell.name === "Hero") {
            const worthinessSlider = document.getElementById('worthiness_slider');
            if (worthinessSlider) {
                // Save original value only if not already saved
                if (originalWorthinessValue === null) {
                    originalWorthinessValue = parseInt(worthinessSlider.value);
                }
                // Lock to 10
                worthinessSlider.value = 10;
                worthinessSlider.disabled = true;
                worthinessSlider.dispatchEvent(new Event('input'));
            }
        }
    } else {
        // Check if we're clearing Hero ability
        const currentSpellInput = document.getElementById(`spell_${spellIndex}_type`);
        const previousValue = currentSpellInput ? currentSpellInput.dataset.previousValue : null;

        if (previousValue === "Hero") {
            const worthinessSlider = document.getElementById('worthiness_slider');
            if (worthinessSlider && originalWorthinessValue !== null) {
                // Unlock and restore original value
                worthinessSlider.disabled = false;
                worthinessSlider.value = originalWorthinessValue;
                worthinessSlider.dispatchEvent(new Event('input'));
                originalWorthinessValue = null;
            }
        }
        // Clear fields if spell name is empty or not found
        const arcanaInput = document.getElementById(`spell_${spellIndex}_arcana`);
        if (arcanaInput) {
            arcanaInput.value = '';
        }

        const gainInput = document.getElementById(`spell_${spellIndex}_gain`);
        if (gainInput) {
            gainInput.value = '';
        }

        const weakenedInput = document.getElementById(`spell_${spellIndex}_weakened`);
        if (weakenedInput) {
            weakenedInput.value = '';
        }

        // Hide info box if no spell is selected
        const infoRow = document.getElementById(`spell_${spellIndex}_info_row`);
        if (infoRow) {
            infoRow.style.display = 'none';
        }
    }

    // Store current value for next time
    const currentSpellInput = document.getElementById(`spell_${spellIndex}_type`);
    if (currentSpellInput) {
        currentSpellInput.dataset.previousValue = spellName;
    }

    // Check if Hero is still selected in ANY slot (Mages can have up to 10 slots)
    let heroStillSelected = false;
    for (let i = 1; i <= 10; i++) {
        const input = document.getElementById(`spell_${i}_type`);
        if (input && input.value === "Hero") {
            heroStillSelected = true;
            break;
        }
    }

    // If Hero is not selected anywhere, unlock worthiness
    if (!heroStillSelected && originalWorthinessValue !== null) {
        const worthinessSlider = document.getElementById('worthiness_slider');
        if (worthinessSlider) {
            worthinessSlider.disabled = false;
            worthinessSlider.value = originalWorthinessValue;
            worthinessSlider.dispatchEvent(new Event('input'));
            originalWorthinessValue = null;
        }
    }
}

// Note: Initialization is handled by init.js after all DOM elements are created
