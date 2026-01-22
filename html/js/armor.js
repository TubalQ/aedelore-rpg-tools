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

                    // Auto-fill bonus
                    const bonusInput = document.getElementById(`armor_${i}_bonus`);
                    if (bonusInput) {
                        bonusInput.value = armor.bonus;
                    }

                    // Auto-fill disadvantage
                    const disadvantageInput = document.getElementById(`armor_${i}_disadvantage`);
                    if (disadvantageInput) {
                        disadvantageInput.value = armor.disadvantage || 'None';
                    }

                    // Auto-fill damage (if available)
                    const dmgInput = document.getElementById(`armor_${i}_dmg`);
                    if (dmgInput && armor.damage) {
                        dmgInput.value = armor.damage;
                    }
                } else {
                    // Clear fields if armor name is empty
                    const hpInput = document.getElementById(`armor_${i}_hp`);
                    if (hpInput) {
                        hpInput.value = '';
                    }

                    const bonusInput = document.getElementById(`armor_${i}_bonus`);
                    if (bonusInput) {
                        bonusInput.value = '';
                    }

                    const disadvantageInput = document.getElementById(`armor_${i}_disadvantage`);
                    if (disadvantageInput) {
                        disadvantageInput.value = '';
                    }

                    const dmgInput = document.getElementById(`armor_${i}_dmg`);
                    if (dmgInput) {
                        dmgInput.value = '';
                    }
                }
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

                // Auto-fill block value
                const blockInput = document.getElementById('shield_block');
                if (blockInput) {
                    blockInput.value = shield.block;
                }

                // Auto-fill defence value
                const defenceInput = document.getElementById('shield_defence');
                if (defenceInput) {
                    defenceInput.value = shield.defence;
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
            } else {
                // Clear fields if shield name is empty
                const hpInput = document.getElementById('shield_hp');
                if (hpInput) {
                    hpInput.value = '';
                }

                const blockInput = document.getElementById('shield_block');
                if (blockInput) {
                    blockInput.value = '';
                }

                const defenceInput = document.getElementById('shield_defence');
                if (defenceInput) {
                    defenceInput.value = '';
                }

                const dmgInput = document.getElementById('shield_dmg');
                if (dmgInput) {
                    dmgInput.value = '';
                }

                const disadvantageInput = document.getElementById('shield_disadvantage');
                if (disadvantageInput) {
                    disadvantageInput.value = '';
                }
            }
        };

        // Listen to multiple events
        shieldInput.addEventListener('change', fillShieldData);
        shieldInput.addEventListener('blur', fillShieldData);
        shieldInput.addEventListener('input', function() {
            setTimeout(fillShieldData, 100);
        });
    }
}

// Note: Initialization is handled by init.js after all DOM elements are created
