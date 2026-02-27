// Weapon auto-fill functionality

// Get attribute modifier for a weapon's ability type
function getWeaponATKModifier(ability) {
    if (!ability) return 0;
    const strInput = document.getElementById('strength_value');
    const dexInput = document.getElementById('dexterity_value');
    const strVal = strInput ? parseInt(strInput.value) || 0 : 0;
    const dexVal = dexInput ? parseInt(dexInput.value) || 0 : 0;
    const strMod = Math.ceil(strVal / 2);
    const dexMod = Math.ceil(dexVal / 2);

    if (ability === 'Strength/Dexterity') return Math.max(strMod, dexMod);
    if (ability === 'Dexterity') return dexMod;
    return strMod; // Default to Strength
}

// Recalculate ATK for all weapon slots based on current attributes
function recalculateAllWeaponATK() {
    if (!WEAPONS_DATA) return;
    for (let i = 1; i <= 3; i++) {
        const weaponInput = document.getElementById(`weapon_${i}_type`);
        const atkInput = document.getElementById(`weapon_${i}_atk`);
        if (!weaponInput || !atkInput) continue;
        const weaponName = weaponInput.value.trim();
        if (weaponName && WEAPONS_DATA[weaponName]) {
            const weapon = WEAPONS_DATA[weaponName];
            const baseBonus = parseInt(weapon.bonus) || 0;
            const modifier = getWeaponATKModifier(weapon.ability);
            const total = baseBonus + modifier;
            atkInput.value = '+' + total;
        }
    }
}

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

                    // Auto-fill attack bonus (weapon base + attribute modifier)
                    const atkInput = document.getElementById(`weapon_${i}_atk`);
                    if (atkInput) {
                        const baseBonus = parseInt(weapon.bonus) || 0;
                        const modifier = getWeaponATKModifier(weapon.ability);
                        const total = baseBonus + modifier;
                        atkInput.value = '+' + total;
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

    // Recalculate weapon ATK when STR or DEX changes
    const strInput = document.getElementById('strength_value');
    const dexInput = document.getElementById('dexterity_value');
    if (strInput) {
        strInput.addEventListener('change', recalculateAllWeaponATK);
        strInput.addEventListener('input', recalculateAllWeaponATK);
    }
    if (dexInput) {
        dexInput.addEventListener('change', recalculateAllWeaponATK);
        dexInput.addEventListener('input', recalculateAllWeaponATK);
    }
}

// Expose for external use
window.recalculateAllWeaponATK = recalculateAllWeaponATK;

// Note: Initialization is handled by init.js after all DOM elements are created
