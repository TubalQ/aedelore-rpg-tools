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
        if (input.id) data[input.id] = input.value;
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

    // Save relationships (stored in window._relationships)
    const rels = window._relationships || [];
    if (rels.length > 0) {
        data.relationships = JSON.stringify(rels);
    }

    // Save archived relationships
    const relsArchived = window._relationshipsArchived || [];
    if (relsArchived.length > 0) {
        data.relationships_archived = JSON.stringify(relsArchived);
    }

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
        // Skip relationship edit modal fields (not character data)
        if (key.startsWith('rel-edit-')) return;

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

    // Restore relationships
    window._relationships = [];
    if (data.relationships) {
        try {
            const rels = typeof data.relationships === 'string' ? JSON.parse(data.relationships) : data.relationships;
            if (Array.isArray(rels)) window._relationships = rels;
        } catch (e) { /* ignore parse errors */ }
    }
    window._relationshipsArchived = [];
    if (data.relationships_archived) {
        try {
            const ra = typeof data.relationships_archived === 'string' ? JSON.parse(data.relationships_archived) : data.relationships_archived;
            if (Array.isArray(ra)) window._relationshipsArchived = ra;
        } catch (e) { /* ignore parse errors */ }
    }
    renderRelationships();

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

// ============================================
// Relationships (button-based with modals)
// ============================================

window._relationships = [];
window._relationshipsArchived = [];
window._currentRelIndex = null;

function renderRelationships() {
    const container = document.getElementById('relationships-container');
    if (!container) return;

    const rels = window._relationships || [];
    if (rels.length === 0) {
        container.innerHTML = '<p style="color: var(--text-muted); font-style: italic; text-align: center; padding: var(--space-4);">No relationships yet.</p>';
        return;
    }

    const dispositionColors = {
        'ally': 'var(--primary-green)',
        'friend': 'var(--primary-green)',
        'friendly': 'var(--primary-green)',
        'mentor': 'var(--accent-gold)',
        'rival': 'var(--accent-orange)',
        'enemy': 'var(--accent-red)',
        'hostile': 'var(--accent-red)',
        'mate': 'var(--accent-pink, #ec4899)',
        'partner': 'var(--accent-pink, #ec4899)',
        'lover': 'var(--accent-pink, #ec4899)',
        'spouse': 'var(--accent-pink, #ec4899)',
        'family': 'var(--accent-purple)',
    };

    container.innerHTML = `<div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${rels.map((r, i) => {
            const relLower = (r.relation || '').toLowerCase();
            const color = dispositionColors[relLower] || 'var(--accent-blue)';
            return `<div onclick="showRelDetail(${i})" style="padding: 8px 12px; background: linear-gradient(135deg, color-mix(in srgb, ${color} 15%, transparent) 0%, color-mix(in srgb, ${color} 5%, transparent) 100%); border: 1px solid color-mix(in srgb, ${color} 30%, transparent); border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: transform 0.1s, box-shadow 0.1s;" onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 2px 8px rgba(0,0,0,0.2)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
                <span style="font-weight: 600; font-size: 0.9rem; color: ${color};">${escapeHtml(r.name || 'Unknown')}</span>
                ${r.relation ? `<span style="font-size: 0.75rem; color: var(--text-muted);">${escapeHtml(r.relation)}</span>` : ''}
            </div>`;
        }).join('')}
    </div>`;
}

function showRelDetail(index) {
    const rel = window._relationships?.[index];
    if (!rel) return;
    window._currentRelIndex = index;

    document.getElementById('rel-detail-title').textContent = rel.name || 'Unknown';
    document.getElementById('rel-detail-relation').textContent = rel.relation || '';
    document.getElementById('rel-detail-notes').textContent = rel.notes || 'No notes.';
    document.getElementById('rel-detail-modal').style.display = 'flex';
}

function hideRelDetailModal() {
    document.getElementById('rel-detail-modal').style.display = 'none';
    window._currentRelIndex = null;
}

const REL_TYPE_OPTIONS = ['Ally', 'Friend', 'Mentor', 'Partner', 'Spouse', 'Family', 'Rival', 'Enemy', 'Neutral'];

function setRelEditRelation(value) {
    const select = document.getElementById('rel-edit-relation-select');
    const other = document.getElementById('rel-edit-relation-other');
    if (REL_TYPE_OPTIONS.includes(value)) {
        select.value = value;
        other.style.display = 'none';
        other.value = '';
    } else if (value) {
        select.value = '_other';
        other.style.display = '';
        other.value = value;
    } else {
        select.value = '';
        other.style.display = 'none';
        other.value = '';
    }
}

function getRelEditRelation() {
    const select = document.getElementById('rel-edit-relation-select');
    if (select.value === '_other') {
        return document.getElementById('rel-edit-relation-other').value.trim();
    }
    return select.value;
}

function onRelTypeChange() {
    const select = document.getElementById('rel-edit-relation-select');
    const other = document.getElementById('rel-edit-relation-other');
    if (select.value === '_other') {
        other.style.display = '';
        other.focus();
    } else {
        other.style.display = 'none';
        other.value = '';
    }
}

function showRelEditModal(index) {
    const isEdit = index !== undefined && index !== null;
    window._currentRelIndex = isEdit ? index : null;

    document.getElementById('rel-edit-title').textContent = isEdit ? 'Edit Relationship' : 'Add Relationship';
    document.getElementById('rel-edit-delete-btn').style.display = isEdit ? '' : 'none';

    if (isEdit) {
        const rel = window._relationships[index];
        document.getElementById('rel-edit-name').value = rel.name || '';
        setRelEditRelation(rel.relation || '');
        document.getElementById('rel-edit-notes').value = rel.notes || '';
    } else {
        document.getElementById('rel-edit-name').value = '';
        setRelEditRelation('');
        document.getElementById('rel-edit-notes').value = '';
    }

    hideRelDetailModal();
    document.getElementById('rel-edit-modal').style.display = 'flex';
    setTimeout(() => document.getElementById('rel-edit-name').focus(), 100);
}

function hideRelEditModal() {
    document.getElementById('rel-edit-modal').style.display = 'none';
}

function saveRelEdit() {
    const name = document.getElementById('rel-edit-name').value.trim();
    const relation = getRelEditRelation();
    const notes = document.getElementById('rel-edit-notes').value.trim();

    if (!name) return;

    const rel = { name, relation, notes };
    if (window._currentRelIndex !== null && window._currentRelIndex !== undefined) {
        window._relationships[window._currentRelIndex] = rel;
    } else {
        window._relationships.push(rel);
    }

    hideRelEditModal();
    renderRelationships();
    if (typeof window.debouncedSave === 'function') window.debouncedSave();
}

function editCurrentRel() {
    showRelEditModal(window._currentRelIndex);
}

function deleteCurrentRel() {
    if (window._currentRelIndex === null || window._currentRelIndex === undefined) return;
    if (!confirm('Delete this relationship?')) return;

    window._relationships.splice(window._currentRelIndex, 1);
    hideRelEditModal();
    renderRelationships();
    if (typeof window.debouncedSave === 'function') window.debouncedSave();
}

function archiveCurrentRel() {
    if (window._currentRelIndex === null || window._currentRelIndex === undefined) return;

    const rel = window._relationships.splice(window._currentRelIndex, 1)[0];
    rel.archivedAt = new Date().toLocaleDateString();
    window._relationshipsArchived.push(rel);

    hideRelDetailModal();
    renderRelationships();
    if (typeof window.debouncedSave === 'function') window.debouncedSave();
}

function showRelArchive() {
    const archived = window._relationshipsArchived || [];
    const content = document.getElementById('rel-archive-content');

    if (archived.length === 0) {
        content.innerHTML = '<p style="color: var(--text-muted); font-style: italic; text-align: center; padding: 20px;">No archived relationships.</p>';
    } else {
        content.innerHTML = archived.map((r, i) => `
            <div style="padding: 10px; background: rgba(50, 50, 50, 0.3); border-radius: 6px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="flex: 1;">
                    <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(r.name || 'Unknown')}</div>
                    ${r.relation ? `<div style="font-size: 0.85rem; color: var(--accent-blue);">${escapeHtml(r.relation)}</div>` : ''}
                    ${r.notes ? `<div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 4px;">${escapeHtml(r.notes)}</div>` : ''}
                    ${r.archivedAt ? `<div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 6px;">Archived: ${r.archivedAt}</div>` : ''}
                </div>
                <button onclick="unarchiveRel(${i})" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(34, 197, 94, 0.2); border: 1px solid rgba(34, 197, 94, 0.3); border-radius: 4px; color: var(--primary-green); cursor: pointer; white-space: nowrap; margin-left: 10px;">Restore</button>
            </div>
        `).join('');
    }

    document.getElementById('rel-archive-modal').style.display = 'flex';
}

function hideRelArchive() {
    document.getElementById('rel-archive-modal').style.display = 'none';
}

function unarchiveRel(index) {
    const rel = window._relationshipsArchived.splice(index, 1)[0];
    delete rel.archivedAt;
    window._relationships.push(rel);

    renderRelationships();
    showRelArchive(); // Refresh archive modal
    if (typeof window.debouncedSave === 'function') window.debouncedSave();
}

// Export to global scope
window.escapeHtml = escapeHtml;
window.getAllFields = getAllFields;
window.setAllFields = setAllFields;
window.syncNotesToMobile = syncNotesToMobile;
window.renderRelationships = renderRelationships;
window.showRelDetail = showRelDetail;
window.hideRelDetailModal = hideRelDetailModal;
window.onRelTypeChange = onRelTypeChange;
window.showRelEditModal = showRelEditModal;
window.hideRelEditModal = hideRelEditModal;
window.saveRelEdit = saveRelEdit;
window.editCurrentRel = editCurrentRel;
window.deleteCurrentRel = deleteCurrentRel;
window.archiveCurrentRel = archiveCurrentRel;
window.showRelArchive = showRelArchive;
window.hideRelArchive = hideRelArchive;
window.unarchiveRel = unarchiveRel;
