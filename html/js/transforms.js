// Generic Transform System (Wildshape, future Berserk, etc.)

// Initialize transform state
window._transformState = window._transformState || {
    active: null,
    charges: 2,
    maxCharges: 2,
    original: null
};

// ---- Helpers ----

function getClassTransform() {
    const cls = document.getElementById('class')?.value;
    return (cls && typeof TRANSFORMS !== 'undefined' && TRANSFORMS[cls]) || null;
}

function hasTransformSpell() {
    const t = getClassTransform();
    if (!t || !t.triggerSpell) return false;
    const cls = document.getElementById('class')?.value;
    const classData = cls && typeof CLASSES !== 'undefined' && CLASSES[cls];
    const maxSlots = classData?.startingEquipment
        ? (classData.startingEquipment.spells || classData.startingEquipment.abilities || 5)
        : 12;
    for (let i = 1; i <= maxSlots; i++) {
        const sel = document.getElementById('spell_' + i + '_type');
        if (sel && sel.value === t.triggerSpell) return true;
    }
    return false;
}

function isTransformed() {
    return !!window._transformState?.active;
}

// ---- Readable field labels ----

const _ATTR_LABELS = {
    strength_value: 'STR', dexterity_value: 'DEX', toughness_value: 'TOU'
};

const _SKILL_LABELS = {
    strength_athletics: 'Athletics', strength_raw_power: 'Raw Power', strength_unarmed: 'Unarmed',
    dexterity_endurance: 'Endurance', dexterity_acrobatics: 'Acrobatics',
    dexterity_sleight_of_hand: 'Sleight of Hand', dexterity_stealth: 'Stealth',
    toughness_bonus_while_injured: 'While Injured', toughness_resistance: 'Resistance'
};

// ---- Fields to save/restore ----

const TRANSFORM_FIELDS = {
    attributes: ['strength_value', 'dexterity_value', 'toughness_value'],
    skills: [
        'strength_athletics', 'strength_raw_power', 'strength_unarmed',
        'dexterity_endurance', 'dexterity_acrobatics', 'dexterity_sleight_of_hand', 'dexterity_stealth',
        'toughness_bonus_while_injured', 'toughness_resistance'
    ],
    weapons: [
        'weapon_1_type', 'weapon_1_atk', 'weapon_1_dmg', 'weapon_1_range',
        'weapon_2_type', 'weapon_2_atk', 'weapon_2_dmg', 'weapon_2_range',
        'weapon_3_type', 'weapon_3_atk', 'weapon_3_dmg', 'weapon_3_range'
    ],
    armor: [
        'shield_type', 'shield_hp', 'shield_block', 'shield_defence',
        'armor_1_type', 'armor_1_hp', 'armor_1_bonus', 'armor_1_current',
        'armor_2_type', 'armor_2_hp', 'armor_2_bonus', 'armor_2_current',
        'armor_3_type', 'armor_3_hp', 'armor_3_bonus', 'armor_3_current',
        'armor_4_type', 'armor_4_hp', 'armor_4_bonus', 'armor_4_current',
        'armor_5_type', 'armor_5_hp', 'armor_5_bonus', 'armor_5_current'
    ]
};

function _saveOriginalFields() {
    const orig = {};
    const allFields = [
        ...TRANSFORM_FIELDS.attributes,
        ...TRANSFORM_FIELDS.skills,
        ...TRANSFORM_FIELDS.weapons,
        ...TRANSFORM_FIELDS.armor
    ];
    allFields.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) orig[id] = el.value;
    });
    // Save HP slider value + max
    const hp = document.getElementById('hp_slider');
    if (hp) {
        orig._hp_value = hp.value;
        orig._hp_max = hp.max;
    }
    // Save arcana disabled state
    const arc = document.getElementById('arcana_slider');
    if (arc) orig._arcana_disabled = arc.disabled;
    return orig;
}

function _restoreOriginalFields(orig) {
    if (!orig) return;
    Object.keys(orig).forEach(function(key) {
        if (key.startsWith('_')) return; // special keys handled below
        const el = document.getElementById(key);
        if (el) {
            el.value = orig[key];
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }
    });
    // Restore HP
    const hp = document.getElementById('hp_slider');
    if (hp && orig._hp_max !== undefined) {
        hp.max = orig._hp_max;
        hp.value = orig._hp_value;
        hp.dispatchEvent(new Event('input', { bubbles: true }));
    }
    // Restore arcana
    const arc = document.getElementById('arcana_slider');
    if (arc && orig._arcana_disabled !== undefined) {
        arc.disabled = orig._arcana_disabled;
    }
}

// ---- Confirmation modal ----

function _showTransformConfirm(formKey) {
    const t = getClassTransform();
    if (!t || !t.forms[formKey]) return;
    const form = t.forms[formKey];
    const state = window._transformState;

    // Check charges before showing modal
    if (!state.active && state.charges <= 0) {
        if (typeof showToast === 'function') {
            showToast('No ' + t.name + ' charges remaining', 'warning');
        }
        return;
    }

    // Already in this form
    if (state.active === formKey) return;

    // Build the modal using safe DOM methods
    var overlay = document.createElement('div');
    overlay.className = 'confirm-overlay transform-confirm-overlay';

    var dialog = document.createElement('div');
    dialog.className = 'confirm-dialog transform-confirm-dialog';

    // Title
    var title = document.createElement('div');
    title.className = 'transform-confirm-title';
    title.textContent = form.icon + ' Transform into ' + form.name;
    dialog.appendChild(title);

    // Two-column body
    var body = document.createElement('div');
    body.className = 'transform-confirm-body';

    // — Left column: YOU GAIN —
    var gainCol = document.createElement('div');
    gainCol.className = 'transform-confirm-col';
    var gainHeader = document.createElement('div');
    gainHeader.className = 'transform-confirm-col-header transform-confirm-gain';
    gainHeader.textContent = 'You gain';
    gainCol.appendChild(gainHeader);

    // Attributes
    Object.entries(form.attributes || {}).forEach(function(entry) {
        var id = entry[0], val = entry[1];
        var row = document.createElement('div');
        row.className = 'transform-confirm-row';
        row.textContent = (_ATTR_LABELS[id] || id) + ': ' + val;
        gainCol.appendChild(row);
    });

    // HP
    var hpRow = document.createElement('div');
    hpRow.className = 'transform-confirm-row';
    hpRow.textContent = 'HP: ' + form.hp;
    gainCol.appendChild(hpRow);

    // Attack
    if (form.attack) {
        var atkRow = document.createElement('div');
        atkRow.className = 'transform-confirm-row';
        atkRow.textContent = form.attack.name + ' ' + form.attack.atk + ' (' + form.attack.damage + ')';
        gainCol.appendChild(atkRow);
    }

    // Block
    if (form.block) {
        var blockRow = document.createElement('div');
        blockRow.className = 'transform-confirm-row';
        blockRow.textContent = 'Block: ' + form.block;
        gainCol.appendChild(blockRow);
    }

    // Skills > 0
    Object.entries(form.skills || {}).forEach(function(entry) {
        var id = entry[0], val = entry[1];
        if (val > 0) {
            var row = document.createElement('div');
            row.className = 'transform-confirm-row transform-confirm-skill';
            row.textContent = (_SKILL_LABELS[id] || id) + ': ' + val;
            gainCol.appendChild(row);
        }
    });

    body.appendChild(gainCol);

    // — Right column: TEMPORARILY SUSPENDED —
    var loseCol = document.createElement('div');
    loseCol.className = 'transform-confirm-col';
    var loseHeader = document.createElement('div');
    loseHeader.className = 'transform-confirm-col-header transform-confirm-lose';
    loseHeader.textContent = 'Temporarily suspended';
    loseCol.appendChild(loseHeader);

    // Current attributes (show current -> new)
    TRANSFORM_FIELDS.attributes.forEach(function(id) {
        var el = document.getElementById(id);
        var current = el ? el.value : '0';
        var newVal = (form.attributes && form.attributes[id] !== undefined) ? form.attributes[id] : current;
        if (current !== String(newVal)) {
            var row = document.createElement('div');
            row.className = 'transform-confirm-row';
            row.textContent = (_ATTR_LABELS[id] || id) + ': ' + current + ' \u2192 ' + newVal;
            loseCol.appendChild(row);
        }
    });

    // Weapons
    var w1 = document.getElementById('weapon_1_type');
    if (w1 && w1.value) {
        var wRow = document.createElement('div');
        wRow.className = 'transform-confirm-row';
        wRow.textContent = 'Weapons (stored)';
        loseCol.appendChild(wRow);
    }

    // Armor
    var hasArmor = false;
    for (var i = 1; i <= 5; i++) {
        var a = document.getElementById('armor_' + i + '_type');
        if (a && a.value) { hasArmor = true; break; }
    }
    var shield = document.getElementById('shield_type');
    if (hasArmor || (shield && shield.value)) {
        var aRow = document.createElement('div');
        aRow.className = 'transform-confirm-row';
        aRow.textContent = 'Armor & Shield (stored)';
        loseCol.appendChild(aRow);
    }

    // Spells locked
    if (t.disableArcana) {
        var sRow = document.createElement('div');
        sRow.className = 'transform-confirm-row transform-confirm-warning';
        sRow.textContent = 'Spells locked while transformed';
        loseCol.appendChild(sRow);
    }

    // Auto-revert note
    var noteRow = document.createElement('div');
    noteRow.className = 'transform-confirm-row transform-confirm-note';
    noteRow.textContent = 'Auto-reverts if beast HP reaches 0';
    loseCol.appendChild(noteRow);

    body.appendChild(loseCol);
    dialog.appendChild(body);

    // Actions
    var actions = document.createElement('div');
    actions.className = 'confirm-actions';

    var cancelBtn = document.createElement('button');
    cancelBtn.className = 'confirm-btn confirm-cancel';
    cancelBtn.textContent = 'Cancel';
    actions.appendChild(cancelBtn);

    var confirmBtn = document.createElement('button');
    confirmBtn.className = 'confirm-btn confirm-ok';
    confirmBtn.textContent = 'Transform!';
    actions.appendChild(confirmBtn);

    dialog.appendChild(actions);
    overlay.appendChild(dialog);

    // Handlers
    function cleanup() {
        overlay.classList.add('confirm-closing');
        overlay.addEventListener('transitionend', function() { overlay.remove(); }, { once: true });
        setTimeout(function() { if (overlay.parentNode) overlay.remove(); }, 300);
    }

    cancelBtn.addEventListener('click', cleanup);
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay) cleanup();
    });
    confirmBtn.addEventListener('click', function() {
        cleanup();
        activateTransform(formKey);
    });

    document.body.appendChild(overlay);
    requestAnimationFrame(function() { overlay.classList.add('confirm-active'); });
    confirmBtn.focus();
}

// ---- Core transform actions ----

function activateTransform(formKey) {
    const t = getClassTransform();
    if (!t || !t.forms[formKey]) return;

    const state = window._transformState;

    // Already in this form?
    if (state.active === formKey) return;

    // Check charges (only consume if not already transformed)
    if (!state.active && state.charges <= 0) {
        if (typeof showToast === 'function') {
            showToast('No ' + t.name + ' charges remaining', 'warning');
        }
        return;
    }

    // If already in another form, restore original first (no extra charge)
    if (state.active && state.original) {
        _restoreOriginalFields(state.original);
    }

    const form = t.forms[formKey];

    // Save originals (only if first shift, not form-to-form swap)
    if (!state.active) {
        state.original = _saveOriginalFields();
        state.charges--;
    }

    // Apply attributes
    if (form.type === 'replace') {
        Object.entries(form.attributes || {}).forEach(function(entry) {
            var el = document.getElementById(entry[0]);
            if (el) {
                el.value = entry[1];
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
        Object.entries(form.skills || {}).forEach(function(entry) {
            var el = document.getElementById(entry[0]);
            if (el) {
                el.value = entry[1];
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });
    }

    // HP
    const hp = document.getElementById('hp_slider');
    if (hp) {
        hp.max = form.hp;
        hp.value = form.hp;
        hp.dispatchEvent(new Event('input', { bubbles: true }));
    }

    // Weapon 1 = beast attack
    const atk = form.attack || {};
    _setField('weapon_1_type', atk.name || '');
    _setField('weapon_1_atk', atk.atk || '');
    _setField('weapon_1_dmg', atk.damage || '');
    _setField('weapon_1_range', atk.range || '');
    // Clear weapons 2-3
    for (var i = 2; i <= 3; i++) {
        _setField('weapon_' + i + '_type', '');
        _setField('weapon_' + i + '_atk', '');
        _setField('weapon_' + i + '_dmg', '');
        _setField('weapon_' + i + '_range', '');
    }

    // Clear armor, set block
    TRANSFORM_FIELDS.armor.forEach(function(id) {
        if (id === 'shield_block') {
            _setField(id, form.block || 0);
        } else {
            _setField(id, '');
        }
    });

    // Disable arcana if configured
    if (t.disableArcana) {
        const arc = document.getElementById('arcana_slider');
        if (arc) arc.disabled = true;
    }

    state.active = formKey;
    document.body.classList.add('transformed');
    updateTransformPanel();
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof updateStatusBar === 'function') updateStatusBar();
    if (typeof triggerImmediateSave === 'function') triggerImmediateSave();

    if (typeof showToast === 'function') {
        showToast('Transformed into ' + form.name + ' ' + form.icon, 'success');
    }
}

function deactivateTransform(reason) {
    const state = window._transformState;
    if (!state.active) return;

    const t = getClassTransform();
    _restoreOriginalFields(state.original);

    state.active = null;
    state.original = null;

    // Re-enable arcana
    if (t?.disableArcana) {
        const arc = document.getElementById('arcana_slider');
        if (arc) arc.disabled = false;
    }

    document.body.classList.remove('transformed');
    updateTransformPanel();
    if (typeof updateDashboard === 'function') updateDashboard();
    if (typeof updateStatusBar === 'function') updateStatusBar();
    if (typeof triggerImmediateSave === 'function') triggerImmediateSave();

    if (reason === 'hp0') {
        if (typeof showToast === 'function') {
            showToast('Beast form destroyed! Reverted to humanoid.', 'warning');
        }
    } else {
        if (typeof showToast === 'function') {
            showToast('Reverted to humanoid form', 'info');
        }
    }
}

function resetTransformCharges() {
    const t = getClassTransform();
    if (!t) return;
    window._transformState.maxCharges = t.maxCharges;
    window._transformState.charges = t.maxCharges;
    updateTransformPanel();
}

// ---- Auto-revert on 0 HP ----

function _checkTransformHP() {
    if (!isTransformed()) return;
    const hp = document.getElementById('hp_slider');
    if (hp && parseInt(hp.value) <= 0) {
        deactivateTransform('hp0');
    }
}

// ---- UI ----

function updateTransformPanel() {
    const panel = document.getElementById('transform-panel');
    if (!panel) return;

    const t = getClassTransform();
    if (!t || !hasTransformSpell()) {
        panel.style.display = 'none';
        return;
    }

    panel.style.display = '';
    const state = window._transformState;

    // Sync maxCharges from config
    state.maxCharges = t.maxCharges;

    // Update header
    const nameEl = document.getElementById('transform-name');
    if (nameEl) nameEl.textContent = t.name;
    const chargesEl = document.getElementById('transform-charges');
    if (chargesEl) chargesEl.textContent = state.charges + '/' + state.maxCharges;

    // Render form buttons using safe DOM methods
    const formsEl = document.getElementById('transform-forms');
    if (formsEl) {
        formsEl.textContent = '';
        Object.entries(t.forms).forEach(function(entry) {
            var key = entry[0], form = entry[1];
            var btn = document.createElement('button');
            btn.className = 'beast-btn';
            btn.dataset.form = key;

            var iconSpan = document.createElement('span');
            iconSpan.className = 'beast-icon';
            iconSpan.textContent = form.icon;
            btn.appendChild(iconSpan);

            var nameSpan = document.createElement('span');
            nameSpan.className = 'beast-name';
            nameSpan.textContent = form.name;
            btn.appendChild(nameSpan);

            if (state.active === key) {
                btn.classList.add('active');
            }
            // Disable if no charges and not currently transformed
            if (!state.active && state.charges <= 0) {
                btn.disabled = true;
            }
            formsEl.appendChild(btn);
        });
    }

    // Revert button
    const revertBtn = document.getElementById('transform-revert');
    if (revertBtn) {
        revertBtn.style.display = state.active ? '' : 'none';
    }
}

function _setField(id, val) {
    const el = document.getElementById(id);
    if (el) {
        el.value = val;
        el.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

// ---- Event listeners ----

document.addEventListener('DOMContentLoaded', function() {
    // Click delegation for beast buttons -> show confirmation modal
    const formsEl = document.getElementById('transform-forms');
    if (formsEl) {
        formsEl.addEventListener('click', function(e) {
            const btn = e.target.closest('.beast-btn');
            if (!btn || btn.disabled) return;
            _showTransformConfirm(btn.dataset.form);
        });
    }

    // Revert button
    const revertBtn = document.getElementById('transform-revert');
    if (revertBtn) {
        revertBtn.addEventListener('click', function() { deactivateTransform(); });
    }

    // HP slider: auto-revert on 0 HP while transformed
    const hpSlider = document.getElementById('hp_slider');
    if (hpSlider) {
        hpSlider.addEventListener('input', _checkTransformHP);
    }

    // Class change: deactivate if transformed + update panel
    const classSelect = document.getElementById('class');
    if (classSelect) {
        classSelect.addEventListener('change', function() {
            if (isTransformed()) deactivateTransform();
            // Reset charges for new class
            const t = getClassTransform();
            if (t) {
                window._transformState.charges = t.maxCharges;
                window._transformState.maxCharges = t.maxCharges;
            }
            updateTransformPanel();
        });
    }

    // Spell slot changes: update panel visibility
    document.addEventListener('change', function(e) {
        if (e.target && e.target.id && e.target.id.match(/^spell_\d+_type$/)) {
            updateTransformPanel();
        }
    });

    // Initial panel update (delayed to ensure other scripts have loaded)
    setTimeout(updateTransformPanel, 100);
});
