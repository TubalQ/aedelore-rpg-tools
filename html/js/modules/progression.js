// ============================================
// Progression Module
// Handles XP, attributes, locking, and quest items
// ============================================

// Progression state
window.characterXP = 0;
window.characterXPSpent = 0;
window.raceClassLocked = false;
window.attributesLocked = false;
window.abilitiesLocked = false;

// Point tracking system
const ALL_ATTRIBUTE_IDS = [
    'strength_value', 'dexterity_value', 'toughness_value',
    'intelligence_value', 'wisdom_value', 'force_of_will_value',
    'strength_athletics', 'strength_raw_power', 'strength_unarmed',
    'dexterity_endurance', 'dexterity_acrobatics', 'dexterity_sleight_of_hand', 'dexterity_stealth',
    'toughness_bonus_while_injured', 'toughness_resistance',
    'intelligence_arcana', 'intelligence_history', 'intelligence_investigation', 'intelligence_nature', 'intelligence_religion',
    'wisdom_luck', 'wisdom_animal_handling', 'wisdom_insight', 'wisdom_medicine', 'wisdom_perception', 'wisdom_survival',
    'force_of_will_deception', 'force_of_will_intimidation', 'force_of_will_performance', 'force_of_will_persuasion'
];

const FREE_POINTS_TOTAL = 10;
const MAX_POINTS_PER_ATTRIBUTE = 5;
window.baseAttributeValues = {};
let xpSpendingMode = false;
window.attributeTotalAtSpendStart = 0;
let xpPointsAvailableAtSpendStart = 0;

const ATTRIBUTE_NAME_TO_ID = {
    'Strength': 'strength_value', 'Dexterity': 'dexterity_value', 'Agility': 'dexterity_value',
    'Toughness': 'toughness_value', 'Intelligence': 'intelligence_value', 'Wisdom': 'wisdom_value',
    'Force of Will': 'force_of_will_value', 'Athletics': 'strength_athletics', 'Raw Power': 'strength_raw_power',
    'Unarmed': 'strength_unarmed', 'Endurance': 'dexterity_endurance', 'Acrobatics': 'dexterity_acrobatics',
    'Sleight of Hand': 'dexterity_sleight_of_hand', 'Stealth': 'dexterity_stealth',
    'Bonus While Injured': 'toughness_bonus_while_injured', 'Resistance': 'toughness_resistance',
    'Arcana': 'intelligence_arcana', 'History': 'intelligence_history', 'Investigation': 'intelligence_investigation',
    'Nature': 'intelligence_nature', 'Religion': 'intelligence_religion', 'Luck': 'wisdom_luck',
    'Animal Handling': 'wisdom_animal_handling', 'Insight': 'wisdom_insight', 'Medicine': 'wisdom_medicine',
    'Perception': 'wisdom_perception', 'Survival': 'wisdom_survival', 'Deception': 'force_of_will_deception',
    'Intimidation': 'force_of_will_intimidation', 'Performance': 'force_of_will_performance',
    'Persuasion': 'force_of_will_persuasion'
};

function calculateBaseAttributeValues() {
    const base = {};
    ALL_ATTRIBUTE_IDS.forEach(id => base[id] = 0);

    const raceValue = document.getElementById('race')?.value;
    const classValue = document.getElementById('class')?.value;
    const religionValue = document.getElementById('religion')?.value;

    function applyBonuses(bonuses) {
        if (!bonuses) return;
        bonuses.forEach(bonus => {
            const match = bonus.match(/^\+(\d+)\s+(.+)$/);
            if (match) {
                const value = parseInt(match[1]);
                const attrName = match[2];
                const fieldId = ATTRIBUTE_NAME_TO_ID[attrName];
                if (fieldId && base.hasOwnProperty(fieldId)) {
                    base[fieldId] += value;
                }
            }
        });
    }

    if (raceValue && typeof RACES !== 'undefined' && RACES[raceValue]) {
        applyBonuses(RACES[raceValue].bonuses);
    }
    if (classValue && typeof CLASSES !== 'undefined' && CLASSES[classValue]) {
        applyBonuses(CLASSES[classValue].bonuses);
    }
    if (religionValue && typeof RELIGIONS !== 'undefined' && RELIGIONS[religionValue]) {
        applyBonuses(RELIGIONS[religionValue].bonuses);
    }

    return base;
}

function getAttributeFieldId(attrName) {
    return ATTRIBUTE_NAME_TO_ID[attrName] || null;
}

function getCurrentAttributeTotal() {
    let total = 0;
    ALL_ATTRIBUTE_IDS.forEach(id => {
        const field = document.getElementById(id);
        if (field) {
            total += parseInt(field.value) || 0;
        }
    });
    return total;
}

function getBaseAttributeTotal() {
    let total = 0;
    for (const id of ALL_ATTRIBUTE_IDS) {
        total += window.baseAttributeValues[id] || 0;
    }
    return total;
}

function getFreePointsUsed() {
    const currentTotal = getCurrentAttributeTotal();
    const baseTotal = getBaseAttributeTotal();
    return currentTotal - baseTotal;
}

function canAddAttributePoint(fieldId, delta) {
    if (!ALL_ATTRIBUTE_IDS.includes(fieldId)) {
        return true;
    }

    if (delta < 0) {
        const field = document.getElementById(fieldId);
        const currentValue = parseInt(field?.value) || 0;
        const baseValue = window.baseAttributeValues[fieldId] || 0;
        return currentValue > baseValue;
    }

    if (!window.raceClassLocked) {
        return true;
    }

    if (xpSpendingMode) {
        const currentTotal = getCurrentAttributeTotal();
        const pointsAddedSinceSpend = currentTotal - window.attributeTotalAtSpendStart;
        return pointsAddedSinceSpend < xpPointsAvailableAtSpendStart;
    }

    if (!window.attributesLocked) {
        const pointsUsed = getFreePointsUsed();
        if (pointsUsed >= FREE_POINTS_TOTAL) {
            return false;
        }
        const field = document.getElementById(fieldId);
        const currentValue = parseInt(field?.value) || 0;
        if (currentValue >= MAX_POINTS_PER_ATTRIBUTE) {
            return false;
        }
        return true;
    }

    return false;
}

function updatePointsDisplay() {
    updateAttributeBadge();
}

// Quest items
function renderQuestItems(questItems) {
    const containers = [
        document.getElementById('quest-items-container'),
        document.getElementById('quest-items-container-mobile')
    ];

    const emptyHtml = `<p style="color: var(--text-muted); font-style: italic; text-align: center; padding: var(--space-4);">No quest items yet. Your DM can give you items during sessions.</p>`;

    const itemsHtml = (!questItems || questItems.length === 0) ? emptyHtml : `
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${questItems.map((item, i) => `
                <div onclick="showQuestItemDetails(${i})" style="padding: 8px 12px; background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: transform 0.1s, box-shadow 0.1s;" onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 2px 8px rgba(251, 191, 36, 0.2)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
                    <span style="font-size: 1rem;">🗝️</span>
                    <span style="font-weight: 600; font-size: 0.9rem; color: var(--accent-gold);">${window.escapeHtml(item.name || 'Unknown Item')}</span>
                </div>
            `).join('')}
        </div>
    `;

    containers.forEach(container => {
        if (container) container.innerHTML = itemsHtml;
    });

    window._questItems = questItems;
}

function showQuestItemDetails(index) {
    const item = window._questItems?.[index];
    if (!item) return;

    window._currentQuestItemIndex = index;
    document.getElementById('quest-item-modal-title').textContent = '🗝️ ' + (item.name || 'Unknown Item');
    document.getElementById('quest-item-modal-description').textContent = item.description || 'No description.';

    let receivedText = '';
    if (item.givenAt) receivedText = 'Received: ' + item.givenAt;
    if (item.sessionName) {
        receivedText += receivedText ? ' • ' : '';
        receivedText += 'Session: ' + item.sessionName;
    }
    document.getElementById('quest-item-modal-received').textContent = receivedText;
    document.getElementById('quest-item-modal').style.display = 'flex';
}

function hideQuestItemModal() {
    document.getElementById('quest-item-modal').style.display = 'none';
    window._currentQuestItemIndex = null;
}

async function archiveCurrentQuestItem() {
    const index = window._currentQuestItemIndex;
    if (index === null || index === undefined) return;

    if (!window.currentCharacterId || !window.authToken) {
        alert('Please save character to cloud first');
        return;
    }

    try {
        const response = await window.apiRequest(`/api/characters/${window.currentCharacterId}/archive-item`, {
            method: 'POST',
            body: JSON.stringify({ itemIndex: index })
        });

        const data = await response.json();
        if (data.success) {
            window._questItems = data.quest_items || [];
            window._questItemsArchived = data.quest_items_archived || [];
            renderQuestItems(window._questItems);
            hideQuestItemModal();
        } else {
            alert('Failed to archive: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Archive error:', error);
        alert('Failed to archive item');
    }
}

function showQuestArchive() {
    const archived = window._questItemsArchived || [];
    const content = document.getElementById('quest-archive-content');

    if (archived.length === 0) {
        content.innerHTML = '<p style="color: var(--text-muted); font-style: italic; text-align: center; padding: 20px;">No archived items yet.</p>';
    } else {
        const bySession = {};
        archived.forEach((item, index) => {
            const session = item.sessionName || 'Unknown Session';
            if (!bySession[session]) bySession[session] = [];
            bySession[session].push({ ...item, archiveIndex: index });
        });

        let html = '';
        for (const session of Object.keys(bySession)) {
            html += `<div style="margin-bottom: 16px;">
                <h3 style="color: var(--accent-gold); font-size: 0.95rem; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid rgba(251, 191, 36, 0.2);">${window.escapeHtml(session)}</h3>
                <div style="display: flex; flex-direction: column; gap: 8px;">`;

            for (const item of bySession[session]) {
                html += `<div style="padding: 10px; background: rgba(50, 50, 50, 0.3); border-radius: 6px; display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; color: var(--text-primary);">🗝️ ${window.escapeHtml(item.name || 'Unknown Item')}</div>
                        ${item.description ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">${window.escapeHtml(item.description)}</div>` : ''}
                        <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">
                            ${item.givenAt ? 'Received: ' + item.givenAt : ''}
                            ${item.archivedAt ? ' • Archived: ' + item.archivedAt : ''}
                        </div>
                    </div>
                    <button onclick="unarchiveQuestItem(${item.archiveIndex})" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 4px; color: var(--primary-green); cursor: pointer; white-space: nowrap; margin-left: 10px;">↩️ Restore</button>
                </div>`;
            }
            html += '</div></div>';
        }
        content.innerHTML = html;
    }

    document.getElementById('quest-archive-modal').style.display = 'flex';
}

function hideQuestArchive() {
    document.getElementById('quest-archive-modal').style.display = 'none';
}

async function unarchiveQuestItem(archiveIndex) {
    if (!window.currentCharacterId || !window.authToken) {
        alert('Please save character to cloud first');
        return;
    }

    try {
        const response = await window.apiRequest(`/api/characters/${window.currentCharacterId}/unarchive-item`, {
            method: 'POST',
            body: JSON.stringify({ archiveIndex: archiveIndex })
        });

        const data = await response.json();
        if (data.success) {
            window._questItems = data.quest_items || [];
            window._questItemsArchived = data.quest_items_archived || [];
            renderQuestItems(window._questItems);
            showQuestArchive();
        } else {
            alert('Failed to restore: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Unarchive error:', error);
        alert('Failed to restore item');
    }
}

function updateAttributeBadge() {
    const badge = document.getElementById('attr-locked-badge');
    if (!badge) return;

    if (!window.currentCharacterId || !window.authToken) {
        badge.style.display = 'none';
        return;
    }

    const earnedPoints = Math.floor(window.characterXP / 10);
    const usedPoints = Math.floor(window.characterXPSpent / 10);
    const availableXPPoints = earnedPoints - usedPoints;

    if (!window.raceClassLocked) {
        badge.style.display = 'inline';
        badge.innerHTML = '⚠️ Lock Race/Class first';
    } else if (xpSpendingMode) {
        const currentTotal = getCurrentAttributeTotal();
        const pointsAdded = currentTotal - window.attributeTotalAtSpendStart;
        badge.style.display = 'inline';
        badge.innerHTML = `✨ <strong>${pointsAdded}/${xpPointsAvailableAtSpendStart}</strong> pt <button class="btn-tiny btn-gold" onclick="lockAttributes()">🔒 Lock</button>`;
    } else if (!window.attributesLocked) {
        const pointsUsed = getFreePointsUsed();
        badge.style.display = 'inline';
        badge.innerHTML = `✓ <strong>${pointsUsed}/${FREE_POINTS_TOTAL}</strong> pts <button class="btn-tiny btn-gold" onclick="lockAttributes()">🔒 Lock</button>`;
    } else {
        badge.style.display = 'inline';
        if (availableXPPoints > 0) {
            badge.innerHTML = `🔒 <strong>${availableXPPoints}</strong> pt <button class="btn-tiny btn-gold" onclick="spendAttributePoint()">✨ Spend</button>`;
        } else {
            badge.innerHTML = '🔒 Locked';
        }
    }
}

function updateAbilitiesBadge() {
    const badge = document.getElementById('abil-locked-badge');
    const progressMsg = document.getElementById('abilities-progression-msg');

    if (!window.currentCharacterId || !window.authToken) {
        if (badge) badge.style.display = 'none';
        if (progressMsg) progressMsg.style.display = 'none';
        return;
    }

    if (!window.raceClassLocked) {
        if (badge) { badge.style.display = 'inline'; badge.innerHTML = '⚠️ Lock Race/Class first'; }
        if (progressMsg) { progressMsg.style.display = 'block'; progressMsg.innerHTML = '📋 <strong>Step 1:</strong> Go to Character tab, select race and class, then lock.'; }
    } else if (!window.attributesLocked && !xpSpendingMode) {
        if (badge) { badge.style.display = 'inline'; badge.innerHTML = '⚠️ Lock Attributes first'; }
        if (progressMsg) { progressMsg.style.display = 'block'; progressMsg.innerHTML = '📋 <strong>Step 2:</strong> Go to Attributes tab, distribute 10 points, then lock.'; }
    } else if (xpSpendingMode) {
        if (badge) { badge.style.display = 'inline'; badge.innerHTML = '⚠️ Finish spending points'; }
        if (progressMsg) progressMsg.style.display = 'none';
    } else if (!window.abilitiesLocked) {
        if (badge) { badge.style.display = 'inline'; badge.innerHTML = `<button class="btn-tiny btn-gold" onclick="lockAbilities()">🔒 Lock Abilities</button>`; }
        if (progressMsg) { progressMsg.style.display = 'block'; progressMsg.innerHTML = '📋 <strong>Step 3:</strong> Select your abilities below, then lock to complete.'; }
    } else {
        if (badge) { badge.style.display = 'inline'; badge.innerHTML = '🔒 Locked'; }
        if (progressMsg) { progressMsg.style.display = 'block'; progressMsg.innerHTML = '✅ <strong>Complete!</strong> All locked.'; }
    }
}

function updateAttributesProgressionMsg() {
    const progressMsg = document.getElementById('attributes-progression-msg');
    if (!window.currentCharacterId || !window.authToken) {
        if (progressMsg) progressMsg.style.display = 'none';
        return;
    }

    if (!window.raceClassLocked) {
        if (progressMsg) { progressMsg.style.display = 'block'; progressMsg.innerHTML = '📋 <strong>Step 1:</strong> Go to Character tab, select race and class, then lock.'; }
    } else if (!window.attributesLocked && !xpSpendingMode) {
        if (progressMsg) { progressMsg.style.display = 'block'; progressMsg.innerHTML = '📋 <strong>Step 2:</strong> Distribute your 10 points below, then lock.'; }
    } else {
        if (progressMsg) progressMsg.style.display = 'none';
    }
}

function updateProgressionSection() {
    const section = document.getElementById('progression-section');
    const attrLockBar = document.getElementById('attr-lock-bar');

    if (!window.currentCharacterId || !window.authToken) {
        if (section) section.style.display = 'none';
        if (attrLockBar) attrLockBar.style.display = 'none';
        return;
    }

    if (section) section.style.display = 'block';

    const xpValue = document.getElementById('xp-value');
    const xpAvailable = document.getElementById('xp-available');
    const availablePointsEl = document.getElementById('available-points');

    const remainingXP = window.characterXP - window.characterXPSpent;
    if (xpValue) xpValue.textContent = `${remainingXP} XP`;

    const earnedPoints = Math.floor(window.characterXP / 10);
    const usedPoints = Math.floor(window.characterXPSpent / 10);
    const availableAttributePoints = earnedPoints - usedPoints;

    if (xpAvailable && availablePointsEl) {
        if (availableAttributePoints > 0) {
            xpAvailable.style.display = 'inline';
            availablePointsEl.textContent = availableAttributePoints;
        } else {
            xpAvailable.style.display = 'none';
        }
    }

    const raceClassIcon = document.getElementById('lock-rc-icon');
    const attrIcon = document.getElementById('lock-attr-icon');
    const abilIcon = document.getElementById('lock-abil-icon');

    if (raceClassIcon) raceClassIcon.textContent = window.raceClassLocked ? '🔒' : '🔓';
    if (attrIcon) attrIcon.textContent = window.attributesLocked ? '🔒' : '🔓';
    if (abilIcon) abilIcon.textContent = window.abilitiesLocked ? '🔒' : '🔓';

    const lockRaceBtn = document.getElementById('lock-race-class-btn');
    if (lockRaceBtn) lockRaceBtn.style.display = window.raceClassLocked ? 'none' : 'inline-flex';

    if (attrLockBar) attrLockBar.style.display = 'none';

    updateAttributeBadge();
    updateAbilitiesBadge();
    updateAttributesProgressionMsg();

    const freePointsNote = document.getElementById('free-points-note');
    if (freePointsNote) {
        const showNote = window.raceClassLocked && !window.attributesLocked && !xpSpendingMode;
        freePointsNote.style.display = showNote ? 'block' : 'none';
    }

    applyLockState();
}

function applyLockState() {
    if (!window.currentCharacterId || !window.authToken) return;

    const raceSelect = document.getElementById('race');
    const classSelect = document.getElementById('class');

    if (raceSelect) {
        raceSelect.disabled = window.raceClassLocked;
        raceSelect.classList.toggle('locked', window.raceClassLocked);
    }
    if (classSelect) {
        classSelect.disabled = window.raceClassLocked;
        classSelect.classList.toggle('locked', window.raceClassLocked);
    }

    const attributeInputs = document.querySelectorAll('.attribute-value input[type="number"], .skill-value');
    const earnedPoints = Math.floor(window.characterXP / 10);
    const usedPoints = Math.floor(window.characterXPSpent / 10);
    const availablePoints = earnedPoints - usedPoints;

    attributeInputs.forEach(input => {
        const shouldLock = !window.raceClassLocked || (window.attributesLocked && availablePoints <= 0);
        input.disabled = shouldLock;
        input.classList.toggle('locked', shouldLock);
    });

    const valueButtons = document.querySelectorAll('.attribute-section .value-btn');
    valueButtons.forEach(btn => {
        const shouldLock = !window.raceClassLocked || (window.attributesLocked && availablePoints <= 0);
        btn.disabled = shouldLock;
        btn.classList.toggle('locked', shouldLock);
    });

    const shouldLockAbilities = !window.attributesLocked || window.abilitiesLocked || xpSpendingMode;
    for (let i = 1; i <= 10; i++) {
        const spellSelect = document.getElementById(`spell_${i}_type`);
        if (spellSelect) {
            spellSelect.disabled = shouldLockAbilities;
            spellSelect.classList.toggle('locked', shouldLockAbilities);
        }
    }
}

async function lockRaceClass() {
    if (!window.currentCharacterId || !window.authToken) {
        alert('You must save your character to cloud first.');
        return;
    }

    const raceSelect = document.getElementById('race');
    const classSelect = document.getElementById('class');

    if (!raceSelect?.value || !classSelect?.value) {
        alert('You must select race and class before locking.');
        return;
    }

    if (!confirm('Are you sure you want to lock race and class? Only your DM can unlock this.')) {
        return;
    }

    try {
        const res = await window.apiRequest(`/api/characters/${window.currentCharacterId}/lock-race-class`, {
            method: 'POST'
        });

        if (!res.ok) {
            const data = await res.json();
            alert(`❌ ${data.error || 'Could not lock race/class'}`);
            return;
        }

        window.raceClassLocked = true;
        window.baseAttributeValues = calculateBaseAttributeValues();
        updateProgressionSection();
        updatePointsDisplay();
        alert('✅ Race and class locked. You can now distribute your 10 attribute points.');
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}

async function lockAttributes() {
    if (!window.currentCharacterId || !window.authToken) {
        alert('You must save your character to cloud first.');
        return;
    }

    if (!window.raceClassLocked) {
        alert('You must lock race and class first.');
        return;
    }

    const currentTotal = getCurrentAttributeTotal();
    const pointsAdded = currentTotal - window.attributeTotalAtSpendStart;

    if (xpSpendingMode) {
        if (pointsAdded < 1) {
            alert('You must add at least 1 point to an attribute before locking.');
            return;
        }
        if (pointsAdded > xpPointsAvailableAtSpendStart) {
            alert(`You can only add ${xpPointsAvailableAtSpendStart} points. Please remove ${pointsAdded - xpPointsAvailableAtSpendStart} points.`);
            return;
        }
    } else {
        const pointsUsed = getFreePointsUsed();
        if (pointsUsed < FREE_POINTS_TOTAL) {
            alert(`You still have ${FREE_POINTS_TOTAL - pointsUsed} points to distribute. Use all 10 points before locking.`);
            return;
        }
        if (pointsUsed > FREE_POINTS_TOTAL) {
            alert(`You have distributed ${pointsUsed} points, but only ${FREE_POINTS_TOTAL} are allowed. Please remove ${pointsUsed - FREE_POINTS_TOTAL} points.`);
            return;
        }
    }

    if (!confirm('Are you sure you want to lock attributes? Only your DM can unlock this.')) {
        return;
    }

    const saved = await window.saveToServer(true);
    if (!saved) return;

    try {
        if (xpSpendingMode && pointsAdded > 0) {
            const spendRes = await window.apiRequest(`/api/characters/${window.currentCharacterId}/spend-attribute-points`, {
                method: 'POST',
                body: JSON.stringify({ count: pointsAdded })
            });

            if (!spendRes.ok) {
                const data = await spendRes.json();
                alert(`❌ ${data.error || 'Could not spend XP'}`);
                return;
            }

            const spendData = await spendRes.json();
            window.characterXPSpent = spendData.xp_spent;
        }

        const res = await window.apiRequest(`/api/characters/${window.currentCharacterId}/lock-attributes`, {
            method: 'POST'
        });

        if (!res.ok) {
            const data = await res.json();
            alert(`❌ ${data.error || 'Could not lock attributes'}`);
            return;
        }

        window.attributesLocked = true;
        xpSpendingMode = false;
        xpPointsAvailableAtSpendStart = 0;
        updateProgressionSection();
        alert('✅ Attributes locked!');
    } catch (error) {
        console.error('Lock attributes error:', error);
        alert(`❌ Error: ${error.name}: ${error.message}`);
    }
}

async function lockAbilities() {
    if (!window.currentCharacterId || !window.authToken) {
        alert('You must save your character to cloud first.');
        return;
    }

    if (!window.raceClassLocked) {
        alert('You must lock race and class first.');
        return;
    }

    if (!window.attributesLocked) {
        alert('You must lock attributes first.');
        return;
    }

    if (!confirm('Are you sure you want to lock abilities? Only your DM can unlock this.')) {
        return;
    }

    const saved = await window.saveToServer(true);
    if (!saved) return;

    try {
        const res = await window.apiRequest(`/api/characters/${window.currentCharacterId}/lock-abilities`, {
            method: 'POST'
        });

        if (!res.ok) {
            const data = await res.json();
            alert(`❌ ${data.error || 'Could not lock abilities'}`);
            return;
        }

        window.abilitiesLocked = true;
        updateProgressionSection();
        alert('✅ Abilities locked! Character creation complete.');
    } catch (error) {
        console.error('Lock abilities error:', error);
        alert(`❌ Error: ${error.name}: ${error.message}`);
    }
}

function spendAttributePoint() {
    if (!window.currentCharacterId || !window.authToken) {
        alert('You must save your character to cloud first.');
        return;
    }

    if (!window.attributesLocked) {
        alert('Attributes must be locked before spending XP points.');
        return;
    }

    const earnedPoints = Math.floor(window.characterXP / 10);
    const usedPoints = Math.floor(window.characterXPSpent / 10);
    const availablePoints = earnedPoints - usedPoints;

    if (availablePoints <= 0) {
        alert('You have no attribute points to spend.');
        return;
    }

    xpSpendingMode = true;
    xpPointsAvailableAtSpendStart = availablePoints;
    window.attributeTotalAtSpendStart = getCurrentAttributeTotal();
    window.attributesLocked = false;

    updateProgressionSection();
}

// Export to global scope
window.calculateBaseAttributeValues = calculateBaseAttributeValues;
window.getAttributeFieldId = getAttributeFieldId;
window.getCurrentAttributeTotal = getCurrentAttributeTotal;
window.getBaseAttributeTotal = getBaseAttributeTotal;
window.getFreePointsUsed = getFreePointsUsed;
window.canAddAttributePoint = canAddAttributePoint;
window.updatePointsDisplay = updatePointsDisplay;
window.renderQuestItems = renderQuestItems;
window.showQuestItemDetails = showQuestItemDetails;
window.hideQuestItemModal = hideQuestItemModal;
window.archiveCurrentQuestItem = archiveCurrentQuestItem;
window.showQuestArchive = showQuestArchive;
window.hideQuestArchive = hideQuestArchive;
window.unarchiveQuestItem = unarchiveQuestItem;
window.updateAttributeBadge = updateAttributeBadge;
window.updateAbilitiesBadge = updateAbilitiesBadge;
window.updateAttributesProgressionMsg = updateAttributesProgressionMsg;
window.updateProgressionSection = updateProgressionSection;
window.applyLockState = applyLockState;
window.lockRaceClass = lockRaceClass;
window.lockAttributes = lockAttributes;
window.lockAbilities = lockAbilities;
window.spendAttributePoint = spendAttributePoint;
window.ALL_ATTRIBUTE_IDS = ALL_ATTRIBUTE_IDS;
window.FREE_POINTS_TOTAL = FREE_POINTS_TOTAL;
