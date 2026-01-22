// Central initialization function for all auto-fill features
// This runs AFTER all DOM elements are created

function initializeAllAutoFills() {
    console.log('Initializing all auto-fill features...');

    // Initialize sliders
    if (typeof initializeSliders === 'function') {
        initializeSliders();
        console.log('✓ Sliders initialized');
    } else {
        console.error('✗ initializeSliders not found');
    }

    // Initialize spell auto-fill
    if (typeof initSpellAutoFill === 'function') {
        initSpellAutoFill();
        console.log('✓ Spell auto-fill initialized');
    } else {
        console.error('✗ initSpellAutoFill not found');
    }

    // Initialize weapon auto-fill
    if (typeof setupWeaponAutofill === 'function') {
        setupWeaponAutofill();
        console.log('✓ Weapon auto-fill initialized');
    } else {
        console.error('✗ setupWeaponAutofill not found');
    }

    // Initialize armor auto-fill
    if (typeof setupArmorAutofill === 'function') {
        setupArmorAutofill();
        console.log('✓ Armor auto-fill initialized');
    } else {
        console.error('✗ setupArmorAutofill not found');
    }

    // Initialize dice roller
    if (typeof initializeDiceSliders === 'function') {
        initializeDiceSliders();
        console.log('✓ Dice sliders initialized');
    } else {
        console.error('✗ initializeDiceSliders not found');
    }

    console.log('All auto-fill features initialized!');
}

function initSpellAutoFill() {
    // Update spells list when class changes
    const classSelect = document.getElementById('class');
    if (classSelect) {
        classSelect.addEventListener('change', function() {
            updateSpellsList();
            updateArcaneElixirForClass(this.value);
        });

        // Initialize if class is already selected
        if (classSelect.value) {
            updateSpellsList();
        }
    }

    // Initial setup of spell listeners (will be called again when table rebuilds)
    setupSpellListeners();
}

// Set starting Arcane Elixir pots based on class
function updateArcaneElixirForClass(selectedClass) {
    const arcaneSlider = document.getElementById('pot_arcane_slider');
    const arcaneValue = document.getElementById('pot-arcane-value');

    if (!arcaneSlider) return;

    let startingPots = 0;
    if (selectedClass === 'Mage') {
        startingPots = 2;
    } else if (selectedClass === 'Druid') {
        startingPots = 1;
    }

    arcaneSlider.value = startingPots;
    if (arcaneValue) {
        arcaneValue.textContent = startingPots;
    }
    // Trigger input event to update slider display
    arcaneSlider.dispatchEvent(new Event('input'));
}

// Setup listeners for all spell selects dynamically
function setupSpellListeners(numSpells = 5) {
    // Add auto-fill listeners to all spell inputs
    for (let i = 1; i <= numSpells; i++) {
        const spellInput = document.getElementById(`spell_${i}_type`);
        if (spellInput) {
            // Remove old listeners to avoid duplicates
            const newSpellInput = spellInput.cloneNode(true);
            spellInput.parentNode.replaceChild(newSpellInput, spellInput);

            // Add new listeners
            newSpellInput.addEventListener('change', function() {
                autoFillSpellData(i);
                // Update all dropdowns to mark already selected spells
                updateSpellsList();
            });
        }
    }
}
