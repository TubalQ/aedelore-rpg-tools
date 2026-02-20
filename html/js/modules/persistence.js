// ============================================
// Persistence Module
// Handles localStorage and cloud save functionality
// Supports dual-mode: local save (not logged in) and cloud save (logged in)
// ============================================

// Auto-save state
let lastSavedData = null;
let lastLocalSavedData = null;
let autoSaveInterval = null;
let debouncedSaveTimeout = null;

// Local storage keys
const LOCAL_CHARACTER_KEY = 'aedelore_local_character';
const LOCAL_NOTICE_DISMISSED_KEY = 'aedelore_sync_notice_dismissed';

// ============================================
// Local Save Functions (for non-logged-in users)
// ============================================

// Save character to localStorage (for non-logged-in users)
function saveLocally() {
    const data = window.getAllFields();

    // Don't save empty character data (no name = nothing worth saving)
    if (!(data.character_name || '').trim()) return false;

    const currentData = JSON.stringify(data);

    // Skip if no changes
    if (currentData === lastLocalSavedData) return false;

    localStorage.setItem(LOCAL_CHARACTER_KEY, currentData);
    lastLocalSavedData = currentData;
    return true;
}

// Load local character data
function getLocalCharacter() {
    const saved = localStorage.getItem(LOCAL_CHARACTER_KEY);
    return saved ? JSON.parse(saved) : null;
}

// Check if local character exists
function hasLocalCharacter() {
    return localStorage.getItem(LOCAL_CHARACTER_KEY) !== null;
}

// Clear local character data
function clearLocalCharacter() {
    localStorage.removeItem(LOCAL_CHARACTER_KEY);
    lastLocalSavedData = null;
}

// Show save indicator (works for both local and cloud)
function showSaveIndicator(type, status) {
    const indicator = document.getElementById('cloud-save-indicator');
    if (!indicator) return;

    const textSpan = indicator.querySelector('span');
    const icon = type === 'cloud' ? '☁️' : '💾';

    if (status === 'saving') {
        indicator.classList.add('show', 'saving');
        indicator.classList.remove('saved');
        if (textSpan) textSpan.textContent = 'Saving...';
    } else if (status === 'saved') {
        indicator.classList.remove('saving');
        indicator.classList.add('show', 'saved');
        if (textSpan) textSpan.textContent = `${icon} Saved`;
        setTimeout(() => {
            indicator.classList.remove('show', 'saved');
        }, 2000);
    } else {
        indicator.classList.remove('show', 'saving', 'saved');
    }
}

// ============================================
// Sync Notice (for non-logged-in users)
// ============================================

function showSyncNotice() {
    // Don't show if logged in or already dismissed
    if (window.authToken) return;
    if (localStorage.getItem(LOCAL_NOTICE_DISMISSED_KEY) === 'true') return;

    // Check if notice already exists
    if (document.getElementById('sync-notice')) return;

    const notice = document.createElement('div');
    notice.id = 'sync-notice';
    notice.className = 'sync-notice';
    notice.innerHTML = `
        <span>Log in to sync your character across devices</span>
        <button onclick="dismissSyncNotice()" title="Dismiss">&times;</button>
    `;
    document.body.appendChild(notice);
}

function dismissSyncNotice() {
    const notice = document.getElementById('sync-notice');
    if (notice) {
        notice.classList.add('hiding');
        setTimeout(() => notice.remove(), 300);
    }
    localStorage.setItem(LOCAL_NOTICE_DISMISSED_KEY, 'true');
}

// ============================================
// Migration (local to cloud on login)
// ============================================

async function migrateLocalToCloud() {
    const localData = getLocalCharacter();
    if (!localData || !window.authToken) return false;

    // Don't migrate empty/blank character data (saved by autosave when logged out)
    const characterName = (localData.character_name || '').trim();
    if (!characterName) {
        clearLocalCharacter();
        return false;
    }

    try {
        const system = localStorage.getItem('aedelore_selected_system') || 'aedelore';

        const res = await window.apiRequest('/api/characters', {
            method: 'POST',
            body: JSON.stringify({ name: characterName, data: localData, system })
        });

        if (res.ok) {
            const result = await res.json();
            window.currentCharacterId = result.id;
            localStorage.setItem('aedelore_current_character_id', result.id);

            // Clear local data after successful migration
            clearLocalCharacter();

            console.log('Local character migrated to cloud successfully');
            return true;
        }
    } catch (error) {
        console.error('Failed to migrate local character to cloud:', error);
    }
    return false;
}

// ============================================
// Legacy functions (kept for compatibility)
// ============================================

// Save character to localStorage (manual save button)
function saveCharacter() {
    const data = window.getAllFields();
    localStorage.setItem('aedelore_character', JSON.stringify(data));
    alert('✅ Character saved successfully!');
}

// Load character from localStorage (manual load button)
function loadCharacter() {
    const saved = localStorage.getItem('aedelore_character');
    if (saved) {
        const data = JSON.parse(saved);
        window.setAllFields(data);
        alert('✅ Character loaded successfully!');
    } else {
        alert('❌ No saved character found!');
    }
}

// Export character as JSON file
function exportCharacter() {
    const data = window.getAllFields();
    const characterName = data.character_name || 'character';
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${characterName.replace(/\s+/g, '_')}_aedelore.json`;
    a.click();
    URL.revokeObjectURL(url);
}

// Import character from JSON file
function importCharacter() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                window.setAllFields(data);
                alert('✅ Character imported successfully!');
            } catch (error) {
                alert('❌ Error importing character: Invalid JSON file');
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Clear all fields
function clearCharacter() {
    if (confirm('⚠️ Are you sure you want to clear all fields? This cannot be undone.')) {
        document.querySelectorAll('input[type="text"], input[type="number"], textarea').forEach(input => {
            input.value = '';
        });
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        document.querySelectorAll('input[type="range"]').forEach(range => {
            range.value = range.min || 0;
            range.dispatchEvent(new Event('input'));
        });
        alert('✅ All fields cleared!');
    }
}

// Legacy 30-second backup autosave removed - now handled by unified 5-second autosave system

// Cloud save indicator (legacy wrapper)
function showCloudSaveIndicator(status) {
    showSaveIndicator('cloud', status);
}

// ============================================
// Unified Autosave System
// ============================================

// Check and save - works for both logged-in and not-logged-in users
async function checkAndSave() {
    if (window.authToken && window.currentCharacterId) {
        // Logged in with existing character -> save to cloud
        await checkAndSaveToCloud();
    } else if (!window.authToken) {
        // Not logged in -> save locally
        checkAndSaveLocally();
    }
    // If logged in but no character ID, do nothing (need to create first)
}

// Save to cloud (for logged-in users)
async function checkAndSaveToCloud() {
    if (!window.authToken || !window.currentCharacterId) return;

    const currentData = JSON.stringify(window.getAllFields());
    if (currentData === lastSavedData) return;

    showSaveIndicator('cloud', 'saving');

    try {
        const data = window.getAllFields();
        const characterName = data.character_name || 'Unnamed Character';
        const system = localStorage.getItem('aedelore_selected_system') || 'aedelore';

        const res = await window.apiRequest(`/api/characters/${window.currentCharacterId}`, {
            method: 'PUT',
            body: JSON.stringify({ name: characterName, data, system })
        });

        if (res.ok) {
            lastSavedData = currentData;
            console.log('Cloud autosave completed');
            showSaveIndicator('cloud', 'saved');
        } else {
            showSaveIndicator('cloud', 'hide');
        }
    } catch (error) {
        console.error('Cloud autosave failed:', error);
        showSaveIndicator('cloud', 'hide');
    }
}

// Save locally (for non-logged-in users)
function checkAndSaveLocally() {
    if (window.authToken) return; // Don't save locally if logged in

    const saved = saveLocally();
    if (saved) {
        showSaveIndicator('local', 'saved');
        console.log('Local autosave completed');
    }
}

function startAutoSave() {
    if (autoSaveInterval) return;
    // Use unified checkAndSave that handles both modes
    autoSaveInterval = setInterval(checkAndSave, 5000);
}

function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

async function refreshCharacterData() {
    if (!window.authToken || !window.currentCharacterId) return;

    try {
        await new Promise(resolve => setTimeout(resolve, 150));
        await checkAndSaveToCloud();
        await window.loadCharacterById(window.currentCharacterId);
        console.log('Character data refreshed from server');
    } catch (error) {
        console.error('Error refreshing character data:', error);
    }
}

function triggerImmediateSave() {
    // Always save to autosave backup
    const data = window.getAllFields();
    localStorage.setItem('aedelore_character_autosave', JSON.stringify(data));

    // Use unified save system
    checkAndSave();
}

function debouncedSave() {
    if (debouncedSaveTimeout) clearTimeout(debouncedSaveTimeout);
    debouncedSaveTimeout = setTimeout(() => {
        triggerImmediateSave();
    }, 1000);
}

// Save to server
async function saveToServer(skipReload = false) {
    if (!window.authToken) {
        window.showAuthModal('login');
        return false;
    }

    const data = window.getAllFields();
    const characterName = data.character_name || 'Unnamed Character';
    const system = localStorage.getItem('aedelore_selected_system') || 'aedelore';

    try {
        let res;
        if (window.currentCharacterId) {
            res = await window.apiRequest(`/api/characters/${window.currentCharacterId}`, {
                method: 'PUT',
                body: JSON.stringify({ name: characterName, data, system })
            });
        } else {
            res = await window.apiRequest('/api/characters', {
                method: 'POST',
                body: JSON.stringify({ name: characterName, data, system })
            });
        }

        if (res.status === 401) {
            window.authToken = null;
            localStorage.removeItem('aedelore_auth_token');
            window.updateAuthUI();
            alert('❌ Session expired. Please login again.');
            window.showAuthModal('login');
            return false;
        }

        const result = await res.json();

        if (!res.ok) {
            alert(`❌ Error: ${result.error}`);
            return false;
        }

        if (result.id) {
            window.currentCharacterId = result.id;
            localStorage.setItem('aedelore_current_character_id', result.id);
        }

        lastSavedData = JSON.stringify(window.getAllFields());

        if (!skipReload) {
            location.reload();
        } else {
            startAutoSave();
        }
        return true;
    } catch (error) {
        alert('❌ Connection error. Please try again.');
        return false;
    }
}

// Load from server (show character list)
async function loadFromServer() {
    if (!window.authToken) {
        window.showAuthModal('login');
        return;
    }

    try {
        const res = await window.apiRequest('/api/characters');

        if (res.status === 401) {
            window.authToken = null;
            localStorage.removeItem('aedelore_auth_token');
            window.updateAuthUI();
            alert('❌ Session expired. Please login again.');
            window.showAuthModal('login');
            return;
        }

        const characters = await res.json();

        if (characters.length === 0) {
            alert('No saved characters found on server.');
            return;
        }

        showCharacterListModal(characters);
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}

function showCharacterListModal(characters) {
    const modal = document.getElementById('character-list-modal');
    const list = document.getElementById('character-list');

    window._characterNames = {};
    characters.forEach(char => {
        window._characterNames[char.id] = char.name;
    });

    const systemNames = {
        'aedelore': 'Aedelore',
        'dnd5e': 'D&D 5e',
        'pathfinder2e': 'PF2e',
        'storyteller': 'WoD',
        'cod': 'CofD'
    };

    list.innerHTML = characters.map(char => {
        const systemId = char.system || 'aedelore';
        const systemName = systemNames[systemId] || systemId;
        return `
            <div class="character-list-item" onclick="loadCharacterById(${parseInt(char.id)})">
                <div class="character-info">
                    <span class="character-name">${window.escapeHtml(char.name)}</span>
                    <span class="character-system" data-system="${systemId}">${window.escapeHtml(systemName)}</span>
                </div>
                <span class="character-date">${window.escapeHtml(new Date(char.updated_at).toLocaleDateString())}</span>
                <button class="delete-char-btn" onclick="event.stopPropagation(); deleteCharacterById(${parseInt(char.id)})">🗑️</button>
            </div>
        `;
    }).join('');

    modal.style.display = 'flex';
}

function hideCharacterListModal() {
    document.getElementById('character-list-modal').style.display = 'none';
}

async function loadCharacterById(id) {
    try {
        const res = await window.apiRequest(`/api/characters/${id}`);

        if (!res.ok) {
            alert('❌ Error loading character');
            return false;
        }

        const character = await res.json();
        const currentSystem = localStorage.getItem('aedelore_selected_system') || 'aedelore';
        const charSystem = character.system || 'aedelore';

        if (charSystem !== currentSystem) {
            const systemNames = {
                'aedelore': 'Aedelore',
                'dnd5e': 'D&D 5e',
                'pathfinder2e': 'Pathfinder 2e',
                'storyteller': 'Storyteller (WoD)',
                'cod': 'Chronicles of Darkness'
            };
            const charSystemName = systemNames[charSystem] || charSystem;
            const currentSystemName = systemNames[currentSystem] || currentSystem;

            if (confirm(`This character was created in ${charSystemName}, but you're currently using ${currentSystemName}.\n\nSwitch to ${charSystemName} and load this character?`)) {
                localStorage.setItem('aedelore_selected_system', charSystem);
                localStorage.setItem('aedelore_current_character_id', id);
                location.reload();
                return true;
            } else {
                return true; // User declined — don't trigger fallback loading
            }
        }

        const charData = typeof character.data === 'string' ? JSON.parse(character.data) : character.data;
        window.setAllFields(charData);
        if (window.renderQuestItems) window.renderQuestItems(charData.quest_items || []);
        window._questItemsArchived = charData.quest_items_archived || [];
        window.currentCharacterId = id;
        window.currentCampaign = character.campaign || null;

        // Load character progression data
        window.characterXP = character.xp || 0;
        window.characterXPSpent = character.xp_spent || 0;
        window.raceClassLocked = character.race_class_locked || false;
        window.attributesLocked = character.attributes_locked || false;
        window.abilitiesLocked = character.abilities_locked || false;

        if (window.raceClassLocked && window.calculateBaseAttributeValues) {
            window.baseAttributeValues = window.calculateBaseAttributeValues();
        }

        if (window.attributesLocked && window.getCurrentAttributeTotal) {
            window.attributeTotalAtSpendStart = window.getCurrentAttributeTotal();
        }

        localStorage.setItem('aedelore_current_character_id', id);
        if (window.updateCampaignDisplay) window.updateCampaignDisplay();
        if (window.updateProgressionSection) window.updateProgressionSection();
        if (window.updatePointsDisplay) window.updatePointsDisplay();
        if (window.loadPartyMembers) window.loadPartyMembers();
        hideCharacterListModal();

        lastSavedData = JSON.stringify(window.getAllFields());
        startAutoSave();
        return true;
    } catch (error) {
        alert('❌ Connection error. Please try again.');
        return false;
    }
}

async function deleteCharacterById(id) {
    const name = window._characterNames?.[id] || 'this character';
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }

    try {
        const res = await window.apiRequest(`/api/characters/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) {
            alert('❌ Error deleting character');
            return;
        }

        if (window.currentCharacterId === id) {
            window.currentCharacterId = null;
            window.currentCampaign = null;
            localStorage.removeItem('aedelore_current_character_id');
            if (window.updateCampaignDisplay) window.updateCampaignDisplay();
        }

        loadFromServer();
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}

// ==========================================
// Trash Modal Functions
// ==========================================

async function showTrashModal() {
    const modal = document.getElementById('trash-modal');
    modal.style.display = 'flex';
    await loadTrashCharacters();
}

function hideTrashModal() {
    document.getElementById('trash-modal').style.display = 'none';
}

async function loadTrashCharacters() {
    const list = document.getElementById('trash-characters-list');
    list.innerHTML = '<p class="trash-loading">Loading...</p>';

    try {
        const res = await window.apiRequest('/api/trash/characters');
        if (!res.ok) throw new Error('Failed to load trash');

        const characters = await res.json();

        if (characters.length === 0) {
            list.innerHTML = '<p class="trash-empty">No deleted characters</p>';
            return;
        }

        list.innerHTML = characters.map(char => {
            const deletedDate = new Date(char.deleted_at).toLocaleDateString();
            const charName = char.char_data?.character_name || char.char_data?.name || 'Unnamed';
            return `
                <div class="trash-item">
                    <div class="trash-item-info">
                        <span class="trash-item-name">${window.escapeHtml(charName)}</span>
                        <span class="trash-item-date">Deleted: ${deletedDate}</span>
                    </div>
                    <div class="trash-item-actions">
                        <button class="trash-btn trash-btn-restore" data-action="restore" data-id="${parseInt(char.id, 10)}" title="Restore">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                            Restore
                        </button>
                        <button class="trash-btn trash-btn-delete" data-action="delete" data-id="${parseInt(char.id, 10)}" data-name="${window.escapeHtml(charName)}" title="Delete permanently">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        list.querySelectorAll('button[data-action]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = btn.dataset.action;
                const id = parseInt(btn.dataset.id, 10);
                if (action === 'restore') {
                    restoreCharacter(id);
                } else if (action === 'delete') {
                    const name = btn.dataset.name;
                    permanentDeleteCharacter(id, name);
                }
            });
        });
    } catch (err) {
        console.error('Error loading trash:', err);
        list.innerHTML = '<p class="trash-error">Failed to load deleted characters</p>';
    }
}

async function restoreCharacter(id) {
    try {
        const res = await window.apiRequest(`/api/trash/characters/${id}/restore`, {
            method: 'POST'
        });

        if (!res.ok) throw new Error('Failed to restore');

        alert('Character restored successfully!');
        await loadTrashCharacters();
    } catch (err) {
        console.error('Error restoring character:', err);
        alert('Failed to restore character');
    }
}

async function permanentDeleteCharacter(id, name) {
    if (!confirm(`Are you sure you want to PERMANENTLY delete "${name}"?\n\nThis cannot be undone!`)) {
        return;
    }

    try {
        const res = await window.apiRequest(`/api/trash/characters/${id}`, {
            method: 'DELETE'
        });

        if (!res.ok) throw new Error('Failed to delete');

        alert('Character permanently deleted.');
        await loadTrashCharacters();
    } catch (err) {
        console.error('Error deleting character:', err);
        alert('Failed to delete character');
    }
}

// ============================================
// Mobile-friendly save triggers
// ============================================

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        if (window.authToken && window.currentCharacterId) {
            checkAndSaveToCloud();
        }
        const data = window.getAllFields();
        localStorage.setItem('aedelore_character_autosave', JSON.stringify(data));
    } else if (!document.hidden) {
        refreshCharacterData();
    }
});

window.addEventListener('pagehide', () => {
    if (window.authToken && window.currentCharacterId) {
        const data = window.getAllFields();
        const characterName = data.character_name || 'Unnamed Character';
        const system = localStorage.getItem('aedelore_selected_system') || 'aedelore';
        const csrfToken = window.getCsrfToken ? window.getCsrfToken() : '';

        const payload = JSON.stringify({ name: characterName, data, system });
        navigator.sendBeacon(
            `/api/characters/${window.currentCharacterId}?token=${window.authToken}&csrf_token=${csrfToken}`,
            new Blob([payload], { type: 'application/json' })
        );
    }
    const data = window.getAllFields();
    localStorage.setItem('aedelore_character_autosave', JSON.stringify(data));
});

window.addEventListener('beforeunload', () => {
    if (window.authToken && window.currentCharacterId) {
        const data = window.getAllFields();
        localStorage.setItem('aedelore_character_autosave', JSON.stringify(data));
    }
});

// Load character on page load
window.addEventListener('load', async () => {
    window.updateAuthUI();

    if (window.authToken) {
        // Logged in: try loading last character, fall back to most recent
        let loaded = false;
        const pendingCharId = localStorage.getItem('aedelore_current_character_id');
        if (pendingCharId) {
            loaded = await loadCharacterById(parseInt(pendingCharId));
        }
        if (!loaded) {
            // No last character or load failed — auto-load most recently updated
            try {
                const res = await window.apiRequest('/api/characters');
                if (res.ok) {
                    const chars = await res.json();
                    const currentSystem = localStorage.getItem('aedelore_selected_system') || 'aedelore';
                    const match = chars.find(c => (c.system || 'aedelore') === currentSystem);
                    if (match) {
                        await loadCharacterById(parseInt(match.id));
                    }
                }
            } catch (e) {
                console.warn('Auto-load character failed:', e);
            }
        }
    } else {
        // Not logged in: load local character if exists
        const localChar = getLocalCharacter();
        if (localChar) {
            window.setAllFields(localChar);
            lastLocalSavedData = JSON.stringify(localChar);
            console.log('Loaded local character');
        } else {
            // Fall back to autosave backup
            const autosave = localStorage.getItem('aedelore_character_autosave');
            if (autosave) {
                const data = JSON.parse(autosave);
                window.setAllFields(data);
            }
        }

        // Show sync notice after a short delay
        setTimeout(showSyncNotice, 2000);
    }

    if (window.updateCampaignDisplay) window.updateCampaignDisplay();
    if (window.updateProgressionSection) window.updateProgressionSection();
});

document.addEventListener('DOMContentLoaded', () => {
    // Start autosave for ALL users (logged in or not)
    startAutoSave();

    const characterForm = document.querySelector('.character-sheet') || document.body;
    characterForm.addEventListener('input', (e) => {
        const tagName = e.target.tagName.toLowerCase();
        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
            debouncedSave();
        }
    });
    characterForm.addEventListener('change', (e) => {
        debouncedSave();
    });
});

// Export to global scope
window.saveCharacter = saveCharacter;
window.loadCharacter = loadCharacter;
window.exportCharacter = exportCharacter;
window.importCharacter = importCharacter;
window.clearCharacter = clearCharacter;
window.showCloudSaveIndicator = showCloudSaveIndicator;
window.showSaveIndicator = showSaveIndicator;
window.checkAndSaveToCloud = checkAndSaveToCloud;
window.checkAndSave = checkAndSave;
window.startAutoSave = startAutoSave;
window.stopAutoSave = stopAutoSave;
window.refreshCharacterData = refreshCharacterData;
window.triggerImmediateSave = triggerImmediateSave;
window.debouncedSave = debouncedSave;
window.saveToServer = saveToServer;
window.loadFromServer = loadFromServer;
window.showCharacterListModal = showCharacterListModal;
window.hideCharacterListModal = hideCharacterListModal;
window.loadCharacterById = loadCharacterById;
window.deleteCharacterById = deleteCharacterById;
window.showTrashModal = showTrashModal;
window.hideTrashModal = hideTrashModal;
window.loadTrashCharacters = loadTrashCharacters;
window.restoreCharacter = restoreCharacter;
window.permanentDeleteCharacter = permanentDeleteCharacter;
// Dual autosave functions
window.saveLocally = saveLocally;
window.getLocalCharacter = getLocalCharacter;
window.hasLocalCharacter = hasLocalCharacter;
window.clearLocalCharacter = clearLocalCharacter;
window.migrateLocalToCloud = migrateLocalToCloud;
window.showSyncNotice = showSyncNotice;
window.dismissSyncNotice = dismissSyncNotice;
