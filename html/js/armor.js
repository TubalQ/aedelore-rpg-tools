// Armor and Shield auto-fill functionality

function setupArmorAutofill() {
    // Armor autofill (5 armor slots: Head, Shoulders, Chest, Hands, Legs)
    for (let i = 1; i <= 5; i++) {
        const armorInput = document.getElementById(`armor_${i}_type`);
        if (armorInput) {
            const fillArmorData = function() {
                const armorName = armorInput.value.trim();

                if (armorName && ARMOR_DATA && ARMOR_DATA[armorName]) {
                    const armor = ARMOR_DATA[armorName];
                    console.log(`Auto-filling armor ${i}: ${armorName}`, armor);

                    // Auto-fill HP
                    const hpInput = document.getElementById(`armor_${i}_hp`);
                    if (hpInput) {
                        hpInput.value = armor.hp;
                    }

                    // Auto-fill AC
                    const acInput = document.getElementById(`armor_${i}_ac`);
                    if (acInput) {
                        acInput.value = armor.ac;
                    }

                    // Auto-fill disadvantage
                    const disadvantageInput = document.getElementById(`armor_${i}_disadvantage`);
                    if (disadvantageInput) {
                        disadvantageInput.value = armor.disadvantage || 'None';
                    }

                    // Set current HP to max HP
                    const currentInput = document.getElementById(`armor_${i}_current`);
                    if (currentInput) {
                        currentInput.value = armor.hp;
                    }
                } else {
                    // Clear fields if armor name is empty
                    const hpInput = document.getElementById(`armor_${i}_hp`);
                    if (hpInput) {
                        hpInput.value = '';
                    }

                    const acInput = document.getElementById(`armor_${i}_ac`);
                    if (acInput) {
                        acInput.value = '';
                    }

                    const disadvantageInput = document.getElementById(`armor_${i}_disadvantage`);
                    if (disadvantageInput) {
                        disadvantageInput.value = '';
                    }

                    const currentInput = document.getElementById(`armor_${i}_current`);
                    if (currentInput) {
                        currentInput.value = '';
                    }
                }

                // Update Total AC after any armor change
                if (typeof updateTotalAC === 'function') updateTotalAC();
            };

            // Listen to multiple events
            armorInput.addEventListener('change', fillArmorData);
            armorInput.addEventListener('blur', fillArmorData);
            armorInput.addEventListener('input', function() {
                setTimeout(fillArmorData, 100);
            });
        }
    }

    // Shield autofill
    const shieldInput = document.getElementById('shield_type');
    if (shieldInput) {
        const fillShieldData = function() {
            const shieldName = shieldInput.value.trim();

            if (shieldName && SHIELD_DATA && SHIELD_DATA[shieldName]) {
                const shield = SHIELD_DATA[shieldName];
                console.log(`Auto-filling shield: ${shieldName}`, shield);

                // Auto-fill HP
                const hpInput = document.getElementById('shield_hp');
                if (hpInput) {
                    hpInput.value = shield.hp;
                }

                // Auto-fill AC
                const acInput = document.getElementById('shield_ac');
                if (acInput) {
                    acInput.value = shield.ac;
                }

                // Auto-fill damage
                const dmgInput = document.getElementById('shield_dmg');
                if (dmgInput) {
                    dmgInput.value = shield.damage;
                }

                // Auto-fill disadvantage (if available)
                const disadvantageInput = document.getElementById('shield_disadvantage');
                if (disadvantageInput && shield.disadvantage) {
                    disadvantageInput.value = shield.disadvantage;
                }

                // Set current HP to max HP
                const currentInput = document.getElementById('shield_current');
                if (currentInput) {
                    currentInput.value = shield.hp;
                }
            } else {
                // Clear fields if shield name is empty
                const hpInput = document.getElementById('shield_hp');
                if (hpInput) {
                    hpInput.value = '';
                }

                const acInput = document.getElementById('shield_ac');
                if (acInput) {
                    acInput.value = '';
                }

                const dmgInput = document.getElementById('shield_dmg');
                if (dmgInput) {
                    dmgInput.value = '';
                }

                const disadvantageInput = document.getElementById('shield_disadvantage');
                if (disadvantageInput) {
                    disadvantageInput.value = '';
                }

                const currentInput = document.getElementById('shield_current');
                if (currentInput) {
                    currentInput.value = '';
                }
            }

            // Update Total AC after shield change
            if (typeof updateTotalAC === 'function') updateTotalAC();
        };

        // Listen to multiple events
        shieldInput.addEventListener('change', fillShieldData);
        shieldInput.addEventListener('blur', fillShieldData);
        shieldInput.addEventListener('input', function() {
            setTimeout(fillShieldData, 100);
        });
    }

    // Listen for manual AC field edits to update Total AC
    for (let i = 1; i <= 5; i++) {
        const acInput = document.getElementById('armor_' + i + '_ac');
        if (acInput) {
            acInput.addEventListener('input', function() {
                if (typeof updateTotalAC === 'function') updateTotalAC();
            });
        }
    }
    const shieldAcInput = document.getElementById('shield_ac');
    if (shieldAcInput) {
        shieldAcInput.addEventListener('input', function() {
            if (typeof updateTotalAC === 'function') updateTotalAC();
        });
    }
}

// Note: Initialization is handled by init.js after all DOM elements are created
