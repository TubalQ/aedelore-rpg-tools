// Weapon auto-fill functionality

function setupWeaponAutofill() {
    for (let i = 1; i <= 3; i++) {
        const weaponInput = document.getElementById(`weapon_${i}_type`);
        if (weaponInput) {
            const fillWeaponData = function() {
                const weaponName = weaponInput.value.trim();

                if (weaponName && WEAPONS_DATA && WEAPONS_DATA[weaponName]) {
                    const weapon = WEAPONS_DATA[weaponName];
                    console.log(`Auto-filling weapon ${i}: ${weaponName}`, weapon);

                    // Legendary glow
                    const isLegendary = weapon.type && weapon.type.startsWith('Legendary');
                    weaponInput.closest('tr')?.classList.toggle('legendary-weapon', isLegendary);

                    // Auto-fill attack bonus
                    const atkInput = document.getElementById(`weapon_${i}_atk`);
                    if (atkInput) {
                        atkInput.value = weapon.bonus;
                    }

                    // Auto-fill damage
                    const dmgInput = document.getElementById(`weapon_${i}_dmg`);
                    if (dmgInput) {
                        dmgInput.value = weapon.damage;
                    }

                    // Auto-fill range
                    const rangeInput = document.getElementById(`weapon_${i}_range`);
                    if (rangeInput) {
                        rangeInput.value = weapon.range;
                    }

                    // Auto-fill break
                    const breakInput = document.getElementById(`weapon_${i}_break`);
                    if (breakInput) {
                        breakInput.value = weapon.break;
                    }
                } else {
                    // Remove legendary glow
                    weaponInput.closest('tr')?.classList.remove('legendary-weapon');

                    // Clear fields if weapon name is empty
                    const atkInput = document.getElementById(`weapon_${i}_atk`);
                    if (atkInput) {
                        atkInput.value = '';
                    }

                    const dmgInput = document.getElementById(`weapon_${i}_dmg`);
                    if (dmgInput) {
                        dmgInput.value = '';
                    }

                    const rangeInput = document.getElementById(`weapon_${i}_range`);
                    if (rangeInput) {
                        rangeInput.value = '';
                    }

                    const breakInput = document.getElementById(`weapon_${i}_break`);
                    if (breakInput) {
                        breakInput.value = '';
                    }
                }
            };

            // Listen to multiple events
            weaponInput.addEventListener('change', fillWeaponData);
            weaponInput.addEventListener('blur', fillWeaponData);
            weaponInput.addEventListener('input', function() {
                setTimeout(fillWeaponData, 100);
            });
        }
    }
}

// Note: Initialization is handled by init.js after all DOM elements are created
