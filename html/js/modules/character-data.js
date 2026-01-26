// ============================================
// Character Data Module
// Handles form field serialization/deserialization
// ============================================

// Security: Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Get all form fields as an object
function getAllFields() {
    const data = {};
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea');
    inputs.forEach(input => {
        data[input.id] = input.value;
    });

    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        data[checkbox.id] = checkbox.checked;
    });

    // Save select/dropdown values (race, class, religion)
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        data[select.id] = select.value;
    });

    // Save range sliders
    const ranges = document.querySelectorAll('input[type="range"]');
    ranges.forEach(range => {
        data[range.id] = range.value;
    });

    // Save avatar data
    data._avatar = window.getAvatarData ? window.getAvatarData() : null;

    // Note: quest_items and quest_items_archived are NOT included here
    // They are managed via dedicated API endpoints (/give-item, /archive-item, etc.)
    // and preserved server-side in PUT /api/characters/:id

    return data;
}

// Set all form fields from an object
function setAllFields(data) {
    // First, set race and class to ensure proper initialization
    // This is critical for Mage class (which needs 10 spell slots) and race-specific HP
    const priorityFields = ['race', 'class'];
    priorityFields.forEach(key => {
        if (data[key]) {
            const element = document.getElementById(key);
            if (element && element.tagName === 'SELECT') {
                element.value = data[key];
                // Trigger change event to update bonuses, spell table, HP max, etc.
                element.dispatchEvent(new Event('change'));
            }
        }
    });

    // Then set all other fields
    Object.keys(data).forEach(key => {
        // Skip race and class since we already set them
        if (priorityFields.includes(key)) return;
        // Skip avatar (handled separately)
        if (key === '_avatar') return;

        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = data[key];
                // Trigger change event for armor broken checkboxes to restore visual state
                if (key.includes('armor_') && key.includes('_broken')) {
                    element.dispatchEvent(new Event('change'));
                }
            } else if (element.type === 'range') {
                element.value = data[key];
                // Trigger input event to update display
                element.dispatchEvent(new Event('input'));
            } else if (element.tagName === 'SELECT') {
                element.value = data[key];
                // Trigger change event to update bonuses and auto-fill
                element.dispatchEvent(new Event('change'));
            } else {
                element.value = data[key];
            }
        }
    });

    // Restore avatar if present
    if (data._avatar) {
        if (window.setAvatarData) window.setAvatarData(data._avatar);
    } else {
        if (window.setAvatarData) window.setAvatarData(null);
    }

    // Update Quick Stats to reflect loaded values
    if (typeof window.updateDashboard === 'function') {
        window.updateDashboard();
    }

    // Sync notes between desktop and mobile
    syncNotesToMobile();
}

// Sync notes textareas from desktop to mobile
function syncNotesToMobile() {
    const syncPairs = [
        ['inventory_freetext', 'inventory_freetext_mobile'],
        ['notes_freetext', 'notes_freetext_mobile']
    ];
    syncPairs.forEach(([desktopId, mobileId]) => {
        const desktop = document.getElementById(desktopId);
        const mobile = document.getElementById(mobileId);
        if (desktop && mobile) {
            mobile.value = desktop.value;
        }
    });
}

// Export to global scope
window.escapeHtml = escapeHtml;
window.getAllFields = getAllFields;
window.setAllFields = setAllFields;
window.syncNotesToMobile = syncNotesToMobile;
