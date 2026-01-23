// Main character sheet management functions

// ============================================
// Mobile Menu Toggle
// ============================================
function toggleMobileMenu() {
    const menu = document.getElementById('header-menu');
    const closeBtn = document.getElementById('mobile-menu-close');

    if (menu.classList.contains('mobile-open')) {
        menu.classList.remove('mobile-open');
        closeBtn.classList.remove('visible');
        document.body.style.overflow = '';
    } else {
        menu.classList.add('mobile-open');
        closeBtn.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }
}

// Close mobile menu when clicking a menu item (but not dropdown triggers)
document.addEventListener('DOMContentLoaded', function() {
    const menu = document.getElementById('header-menu');
    if (menu) {
        menu.addEventListener('click', function(e) {
            // Don't close menu when clicking dropdown triggers - they toggle sections
            if (e.target.closest('.dropdown-trigger')) {
                return;
            }
            // Close menu when clicking actual menu items
            if (e.target.closest('.dropdown-item')) {
                const closeBtn = document.getElementById('mobile-menu-close');
                if (menu.classList.contains('mobile-open')) {
                    menu.classList.remove('mobile-open');
                    closeBtn.classList.remove('visible');
                    document.body.style.overflow = '';
                }
            }
        });
    }
});

// ============================================
// Collapsible Sections (Mobile/Tablet only)
// ============================================
function initCollapsibleSections() {
    const sections = document.querySelectorAll('.section.collapsible');

    sections.forEach(section => {
        const title = section.querySelector('.section-title');
        if (!title) return;

        // Wrap content after title in a container if not already wrapped
        if (!section.querySelector('.section-content')) {
            const content = document.createElement('div');
            content.className = 'section-content';

            // Move all siblings after title into content wrapper
            let sibling = title.nextElementSibling;
            while (sibling) {
                const next = sibling.nextElementSibling;
                content.appendChild(sibling);
                sibling = next;
            }
            section.appendChild(content);
        }

        // Add click handler to title
        function toggleSection(e) {
            // Only toggle on mobile/tablet
            if (window.innerWidth > 1024) return;

            e.preventDefault();
            e.stopPropagation();
            section.classList.toggle('collapsed');

            // Save state to localStorage
            const sectionId = section.getAttribute('data-section-id');
            if (sectionId) {
                try {
                    const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
                    collapsedSections[sectionId] = section.classList.contains('collapsed');
                    localStorage.setItem('collapsedSections', JSON.stringify(collapsedSections));
                } catch (err) {
                    // localStorage not available
                }
            }
        }

        title.addEventListener('click', toggleSection);

        // Make title focusable and handle keyboard
        title.setAttribute('tabindex', '0');
        title.setAttribute('role', 'button');
        title.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                toggleSection(e);
            }
        });

        // Restore saved state or collapse by default on mobile/tablet
        const sectionId = section.getAttribute('data-section-id');
        if (sectionId && window.innerWidth <= 1024) {
            const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
            // Default to collapsed if no saved state
            if (collapsedSections[sectionId] === undefined || collapsedSections[sectionId] === true) {
                section.classList.add('collapsed');
            }
        } else if (window.innerWidth <= 1024) {
            // No ID, just collapse by default
            section.classList.add('collapsed');
        }
    });
}

// Handle window resize - remove collapsed state when going to desktop
function handleCollapsibleResize() {
    const sections = document.querySelectorAll('.section.collapsible');
    if (window.innerWidth > 1024) {
        sections.forEach(section => {
            section.classList.remove('collapsed');
        });
    } else {
        // Re-apply collapsed state when going back to mobile/tablet
        sections.forEach(section => {
            const sectionId = section.getAttribute('data-section-id');
            if (sectionId) {
                const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
                if (collapsedSections[sectionId] === undefined || collapsedSections[sectionId] === true) {
                    section.classList.add('collapsed');
                }
            } else {
                section.classList.add('collapsed');
            }
        });
    }
}

// Initialize collapsible attributes (Strength, Dexterity, etc.)
function initCollapsibleAttributes() {
    const attributes = document.querySelectorAll('.attribute-section.collapsible');

    attributes.forEach(attr => {
        const header = attr.querySelector('.attribute-header');
        const attrName = attr.querySelector('.attribute-name');
        if (!header || !attrName) return;

        // Create a toggle button/arrow
        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'attr-collapse-btn';
        toggleBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
        toggleBtn.setAttribute('aria-label', 'Toggle skills');
        header.appendChild(toggleBtn);

        function toggleAttribute(e) {
            // Only toggle on mobile/tablet
            const isMobileOrTablet = window.matchMedia('(max-width: 1024px)').matches;
            if (!isMobileOrTablet) return;

            e.preventDefault();
            e.stopPropagation();
            attr.classList.toggle('collapsed');

            // Save state to localStorage
            const attrId = attr.getAttribute('data-attr-id');
            if (attrId) {
                try {
                    const collapsedAttrs = JSON.parse(localStorage.getItem('collapsedAttributes') || '{}');
                    collapsedAttrs[attrId] = attr.classList.contains('collapsed');
                    localStorage.setItem('collapsedAttributes', JSON.stringify(collapsedAttrs));
                } catch (err) {
                    // localStorage not available
                }
            }
        }

        // Click on attribute name toggles
        attrName.addEventListener('click', toggleAttribute);
        attrName.style.cursor = 'pointer';

        // Click on toggle button toggles
        toggleBtn.addEventListener('click', toggleAttribute);

        // Restore saved state or collapse by default on mobile/tablet
        // Use matchMedia for more reliable detection
        const isMobileOrTablet = window.matchMedia('(max-width: 1024px)').matches;

        if (isMobileOrTablet) {
            const attrId = attr.getAttribute('data-attr-id');
            if (attrId) {
                try {
                    const collapsedAttrs = JSON.parse(localStorage.getItem('collapsedAttributes') || '{}');
                    // Default to collapsed if no saved state
                    if (collapsedAttrs[attrId] === undefined || collapsedAttrs[attrId] === true) {
                        attr.classList.add('collapsed');
                    }
                } catch (err) {
                    attr.classList.add('collapsed');
                }
            } else {
                attr.classList.add('collapsed');
            }
        }
    });
}

// Handle attribute resize
function handleAttributeResize() {
    const attributes = document.querySelectorAll('.attribute-section.collapsible');
    const isMobileOrTablet = window.matchMedia('(max-width: 1024px)').matches;

    if (!isMobileOrTablet) {
        attributes.forEach(attr => {
            attr.classList.remove('collapsed');
        });
    } else {
        attributes.forEach(attr => {
            const attrId = attr.getAttribute('data-attr-id');
            if (attrId) {
                try {
                    const collapsedAttrs = JSON.parse(localStorage.getItem('collapsedAttributes') || '{}');
                    if (collapsedAttrs[attrId] === undefined || collapsedAttrs[attrId] === true) {
                        attr.classList.add('collapsed');
                    }
                } catch (err) {
                    attr.classList.add('collapsed');
                }
            } else {
                attr.classList.add('collapsed');
            }
        });
    }
}

// Initialize on page load - handle case where DOMContentLoaded already fired
function initAllCollapsibles() {
    initCollapsibleSections();
    initCollapsibleAttributes();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllCollapsibles);
} else {
    // DOM already loaded
    initAllCollapsibles();
}

// Handle resize
let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        handleCollapsibleResize();
        handleAttributeResize();
    }, 150);
});

// Security: Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Avatar Selection Functions
// ============================================
let currentAvatar = null; // Can be emoji string or base64 image data
let pendingAvatarUpload = null; // Temporary storage for uploaded image before confirmation

function showAvatarModal() {
    document.getElementById('avatar-modal').style.display = 'flex';
    updateAvatarCurrentPreview();
}

function hideAvatarModal() {
    document.getElementById('avatar-modal').style.display = 'none';
    pendingAvatarUpload = null;
    document.getElementById('avatar-preview-area').style.display = 'none';
}

function selectAvatar(emoji) {
    currentAvatar = { type: 'emoji', value: emoji };
    applyAvatar();
    updateAvatarCurrentPreview();
    hideAvatarModal();
}

function handleAvatarUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, WebP, or GIF)');
        return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('Image is too large. Maximum size is 2MB.');
        return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = function(e) {
        pendingAvatarUpload = e.target.result;

        // Show preview
        const previewArea = document.getElementById('avatar-preview-area');
        const previewImg = document.getElementById('avatar-preview-img');
        previewImg.src = pendingAvatarUpload;
        previewArea.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

function useUploadedAvatar() {
    if (pendingAvatarUpload) {
        currentAvatar = { type: 'image', value: pendingAvatarUpload };
        applyAvatar();
        updateAvatarCurrentPreview();
        hideAvatarModal();
    }
}

function clearAvatar() {
    currentAvatar = null;
    applyAvatar();
    updateAvatarCurrentPreview();
}

function applyAvatar() {
    // Try multiple ways to find the avatar display element
    let avatarDisplay = document.getElementById('avatar-display');

    // Fallback: try querySelector
    if (!avatarDisplay) {
        avatarDisplay = document.querySelector('#hero-avatar .avatar-placeholder');
    }

    // Fallback: try finding by class inside hero-avatar
    if (!avatarDisplay) {
        const heroAvatar = document.getElementById('hero-avatar');
        if (heroAvatar) {
            avatarDisplay = heroAvatar.querySelector('span');
        }
    }

    if (!avatarDisplay) return;

    if (!currentAvatar) {
        avatarDisplay.innerHTML = '?';
    } else if (currentAvatar.type === 'emoji') {
        avatarDisplay.innerHTML = currentAvatar.value;
    } else if (currentAvatar.type === 'image') {
        avatarDisplay.innerHTML = `<img src="${currentAvatar.value}" alt="Avatar">`;
    }

    // Also update sidebar avatar if it exists
    updateSidebarAvatar();
}

function updateSidebarAvatar() {
    // The sidebar shows character name, we could optionally show avatar there too
    // For now, this is a placeholder for future enhancement
}

function updateAvatarCurrentPreview() {
    const preview = document.getElementById('avatar-current-preview');
    if (!preview) return;

    if (!currentAvatar) {
        preview.innerHTML = '?';
    } else if (currentAvatar.type === 'emoji') {
        preview.innerHTML = currentAvatar.value;
    } else if (currentAvatar.type === 'image') {
        preview.innerHTML = `<img src="${currentAvatar.value}" alt="Avatar">`;
    }
}

function getAvatarData() {
    return currentAvatar;
}

function setAvatarData(data) {
    currentAvatar = data;
    applyAvatar();
}

// ============================================
// Theme Functions
// ============================================
const THEMES = ['aedelore', 'dark-glass', 'midnight', 'ember', 'forest', 'frost', 'void', 'pure-darkness', 'blood', 'necro', 'royal', 'crimson'];
const THEME_COLORS = {
    'aedelore': '#8b5cf6',
    'dark-glass': '#1a1a1f',
    'midnight': '#0a1628',
    'ember': '#1a0c08',
    'forest': '#0a1208',
    'frost': '#0a1018',
    'void': '#050510',
    'pure-darkness': '#000000',
    'blood': '#080404',
    'necro': '#050805',
    'royal': '#0a0610',
    'crimson': '#0c0506'
};
let currentTheme = 'aedelore';

function setTheme(themeName) {
    if (!THEMES.includes(themeName)) {
        themeName = 'aedelore';
    }

    currentTheme = themeName;

    // Apply theme to document
    if (themeName === 'aedelore') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', themeName);
    }

    // Update browser theme-color
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
        themeColorMeta.setAttribute('content', THEME_COLORS[themeName]);
    }

    // Update checkmarks in theme selector
    THEMES.forEach(theme => {
        const check = document.getElementById(`theme-check-${theme}`);
        if (check) {
            check.textContent = (theme === themeName) ? '✓' : '';
        }
    });

    // Save preference
    localStorage.setItem('aedelore_theme', themeName);
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('aedelore_theme') || 'aedelore';
    setTheme(savedTheme);
}

// Initialize theme on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSavedTheme);
} else {
    loadSavedTheme();
}

// ============================================
// Dropdown Menu Functions
// ============================================
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const isOpen = dropdown.classList.contains('open');

    // Close all dropdowns first
    closeDropdowns();

    // Toggle the clicked dropdown
    if (!isOpen) {
        dropdown.classList.add('open');
    }
}

function closeDropdowns() {
    document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
        closeDropdowns();
    }
});

// Close dropdowns on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDropdowns();
    }
});

// Get all form fields
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
    data._avatar = getAvatarData();

    return data;
}

// Set all form fields
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
        setAvatarData(data._avatar);
    } else {
        setAvatarData(null);
    }
}

// Save character to localStorage
function saveCharacter() {
    const data = getAllFields();
    localStorage.setItem('aedelore_character', JSON.stringify(data));
    alert('✅ Character saved successfully!');
}

// Load character from localStorage
function loadCharacter() {
    const saved = localStorage.getItem('aedelore_character');
    if (saved) {
        const data = JSON.parse(saved);
        setAllFields(data);
        alert('✅ Character loaded successfully!');
    } else {
        alert('❌ No saved character found!');
    }
}

// Export character as JSON file
function exportCharacter() {
    const data = getAllFields();
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
                setAllFields(data);
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

// Auto-save to localStorage every 30 seconds
setInterval(() => {
    const data = getAllFields();
    localStorage.setItem('aedelore_character_autosave', JSON.stringify(data));
}, 30000);

// Interval-based cloud autosave (checks every 5 seconds)
let lastSavedData = null;
let autoSaveInterval = null;

function showCloudSaveIndicator(status) {
    const indicator = document.getElementById('cloud-save-indicator');
    if (!indicator) return;

    const textSpan = indicator.querySelector('span');

    if (status === 'saving') {
        indicator.classList.add('show', 'saving');
        indicator.classList.remove('saved');
        if (textSpan) textSpan.textContent = 'Saving...';
    } else if (status === 'saved') {
        indicator.classList.remove('saving');
        indicator.classList.add('show', 'saved');
        if (textSpan) textSpan.textContent = 'Saved ✓';
        // Hide after 2 seconds
        setTimeout(() => {
            indicator.classList.remove('show', 'saved');
        }, 2000);
    } else {
        indicator.classList.remove('show', 'saving', 'saved');
    }
}

async function checkAndSaveToCloud() {
    // Only autosave if logged in and has a character loaded
    if (!authToken || !currentCharacterId) return;

    const currentData = JSON.stringify(getAllFields());

    // Only save if data actually changed
    if (currentData === lastSavedData) return;

    // Show saving indicator
    showCloudSaveIndicator('saving');

    try {
        const data = getAllFields();
        const characterName = data.character_name || 'Unnamed Character';
        const system = localStorage.getItem('aedelore_selected_system') || 'aedelore';

        const res = await fetch(`/api/characters/${currentCharacterId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ name: characterName, data, system })
        });

        if (res.ok) {
            lastSavedData = currentData;
            console.log('Cloud autosave completed');
            showCloudSaveIndicator('saved');
        } else {
            showCloudSaveIndicator('hide');
        }
    } catch (error) {
        console.error('Cloud autosave failed:', error);
        showCloudSaveIndicator('hide');
    }
}

function startAutoSave() {
    if (autoSaveInterval) return; // Already running
    autoSaveInterval = setInterval(checkAndSaveToCloud, 5000); // Every 5 seconds
}

function stopAutoSave() {
    if (autoSaveInterval) {
        clearInterval(autoSaveInterval);
        autoSaveInterval = null;
    }
}

// Trigger immediate save (call this after important actions like using potions)
function triggerImmediateSave() {
    // Save to localStorage immediately
    const data = getAllFields();
    localStorage.setItem('aedelore_character_autosave', JSON.stringify(data));

    // Also save to cloud if logged in
    if (authToken && currentCharacterId) {
        checkAndSaveToCloud();
    }
}

// Debounced save - triggers 1 second after last input
let debouncedSaveTimeout = null;
function debouncedSave() {
    if (debouncedSaveTimeout) clearTimeout(debouncedSaveTimeout);
    debouncedSaveTimeout = setTimeout(() => {
        triggerImmediateSave();
    }, 1000);
}

// Start autosave when page loads (if logged in)
document.addEventListener('DOMContentLoaded', () => {
    if (authToken && currentCharacterId) {
        startAutoSave();
    }
});

// Load autosave on page load
window.addEventListener('load', async () => {
    const autosave = localStorage.getItem('aedelore_character_autosave');
    if (autosave) {
        const data = JSON.parse(autosave);
        setAllFields(data);
    }
    // Check if user is logged in
    updateAuthUI();

    // Check if there's a pending character to load (after save/reload)
    const pendingCharId = localStorage.getItem('aedelore_current_character_id');
    if (pendingCharId && authToken) {
        await loadCharacterById(parseInt(pendingCharId));
    }

    // Update campaign section visibility
    updateCampaignDisplay();

    // Update progression section
    updateProgressionSection();
});

// ============================================
// Mobile-friendly save triggers
// ============================================

// Save when page becomes hidden (user switches apps/tabs on mobile)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        // Immediate save when page is hidden
        if (authToken && currentCharacterId) {
            checkAndSaveToCloud();
        }
        // Also save to localStorage as backup
        const data = getAllFields();
        localStorage.setItem('aedelore_character_autosave', JSON.stringify(data));
    }
});

// Save before page unload (refresh, close, navigate away)
window.addEventListener('pagehide', () => {
    // Use sendBeacon for reliable save during page unload
    if (authToken && currentCharacterId) {
        const data = getAllFields();
        const characterName = data.character_name || 'Unnamed Character';
        const system = localStorage.getItem('aedelore_selected_system') || 'aedelore';

        // sendBeacon is more reliable than fetch during page unload
        const payload = JSON.stringify({ name: characterName, data, system });
        navigator.sendBeacon(
            `/api/characters/${currentCharacterId}?token=${authToken}`,
            new Blob([payload], { type: 'application/json' })
        );
    }
    // Also save to localStorage
    const data = getAllFields();
    localStorage.setItem('aedelore_character_autosave', JSON.stringify(data));
});

// Backup: beforeunload for desktop browsers
window.addEventListener('beforeunload', () => {
    if (authToken && currentCharacterId) {
        const data = getAllFields();
        localStorage.setItem('aedelore_character_autosave', JSON.stringify(data));
    }
});

// Debounced save on any input change (for sliders, text fields, etc.)
document.addEventListener('DOMContentLoaded', () => {
    // Add input listener to the entire character sheet form
    const characterForm = document.querySelector('.character-sheet') || document.body;

    characterForm.addEventListener('input', (e) => {
        // Only trigger for relevant input types
        const tagName = e.target.tagName.toLowerCase();
        const inputType = e.target.type;

        if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') {
            // Trigger debounced save
            if (typeof debouncedSave === 'function') {
                debouncedSave();
            }
        }
    });

    characterForm.addEventListener('change', (e) => {
        // Also save on change (for selects and checkboxes)
        if (typeof debouncedSave === 'function') {
            debouncedSave();
        }
    });
});

// ============================================
// Server Authentication & Cloud Save Functions
// ============================================

let authToken = localStorage.getItem('aedelore_auth_token');
let currentCharacterId = null;
let currentCampaign = null;

function updateAuthUI() {
    // New dropdown-based UI elements
    const loggedOutDiv = document.getElementById('server-logged-out');
    const loggedInDiv = document.getElementById('server-logged-in');
    const serverBtnText = document.getElementById('server-btn-text');

    if (authToken) {
        // Logged in state
        if (loggedOutDiv) loggedOutDiv.style.display = 'none';
        if (loggedInDiv) loggedInDiv.style.display = 'block';
        if (serverBtnText) serverBtnText.textContent = 'Cloud ✓';
    } else {
        // Logged out state
        if (loggedOutDiv) loggedOutDiv.style.display = 'block';
        if (loggedInDiv) loggedInDiv.style.display = 'none';
        if (serverBtnText) serverBtnText.textContent = 'Cloud';
    }
}

function showAuthModal(mode = 'login') {
    const modal = document.getElementById('auth-modal');
    const title = document.getElementById('auth-modal-title');
    const submitBtn = document.getElementById('auth-submit-btn');
    const toggleText = document.getElementById('auth-toggle-text');
    const usernameInput = document.getElementById('auth-username');
    const passwordInput = document.getElementById('auth-password');

    usernameInput.value = '';
    passwordInput.value = '';
    document.getElementById('auth-error').textContent = '';

    // Handle Enter key on inputs
    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    };
    usernameInput.onkeydown = handleEnter;
    passwordInput.onkeydown = handleEnter;

    if (mode === 'login') {
        title.textContent = 'Login';
        submitBtn.textContent = 'Login';
        toggleText.innerHTML = 'No account? <a href="#" onclick="showAuthModal(\'register\'); return false;">Register here</a>';
        submitBtn.onclick = doLogin;
    } else {
        title.textContent = 'Register';
        submitBtn.textContent = 'Register';
        toggleText.innerHTML = 'Have an account? <a href="#" onclick="showAuthModal(\'login\'); return false;">Login here</a>';
        submitBtn.onclick = doRegister;
    }

    modal.style.display = 'flex';
    usernameInput.focus();
}

function hideAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

async function doLogin() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error');

    if (!username || !password) {
        errorEl.textContent = 'Please enter username and password';
        return;
    }

    try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.error || 'Login failed';
            return;
        }

        authToken = data.token;
        localStorage.setItem('aedelore_auth_token', authToken);
        location.reload();
    } catch (error) {
        errorEl.textContent = 'Connection error. Please try again.';
    }
}

async function doRegister() {
    const username = document.getElementById('auth-username').value.trim();
    const password = document.getElementById('auth-password').value;
    const errorEl = document.getElementById('auth-error');

    if (!username || !password) {
        errorEl.textContent = 'Please enter username and password';
        return;
    }

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.error || 'Registration failed';
            return;
        }

        authToken = data.token;
        localStorage.setItem('aedelore_auth_token', authToken);
        location.reload();
    } catch (error) {
        errorEl.textContent = 'Connection error. Please try again.';
    }
}

async function doLogout() {
    try {
        await fetch('/api/logout', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
    } catch (e) {
        // Ignore errors
    }

    authToken = null;
    currentCharacterId = null;
    currentCampaign = null;
    localStorage.removeItem('aedelore_auth_token');
    localStorage.removeItem('aedelore_current_character_id');
    location.reload();
}

async function saveToServer(skipReload = false) {
    if (!authToken) {
        showAuthModal('login');
        return false;
    }

    const data = getAllFields();
    const characterName = data.character_name || 'Unnamed Character';
    const system = localStorage.getItem('aedelore_selected_system') || 'aedelore';

    try {
        let res;
        if (currentCharacterId) {
            // Update existing character
            res = await fetch(`/api/characters/${currentCharacterId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ name: characterName, data, system })
            });
        } else {
            // Create new character
            res = await fetch('/api/characters', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ name: characterName, data, system })
            });
        }

        if (res.status === 401) {
            authToken = null;
            localStorage.removeItem('aedelore_auth_token');
            updateAuthUI();
            alert('❌ Session expired. Please login again.');
            showAuthModal('login');
            return false;
        }

        const result = await res.json();

        if (!res.ok) {
            alert(`❌ Error: ${result.error}`);
            return false;
        }

        if (result.id) {
            currentCharacterId = result.id;
            // Store character ID for reload
            localStorage.setItem('aedelore_current_character_id', result.id);
        }

        // Update lastSavedData to prevent immediate re-save
        lastSavedData = JSON.stringify(getAllFields());

        if (!skipReload) {
            location.reload();
        } else {
            // Start autosave if not reloading
            startAutoSave();
        }
        return true;
    } catch (error) {
        alert('❌ Connection error. Please try again.');
        return false;
    }
}

async function loadFromServer() {
    if (!authToken) {
        showAuthModal('login');
        return;
    }

    try {
        const res = await fetch('/api/characters', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (res.status === 401) {
            authToken = null;
            localStorage.removeItem('aedelore_auth_token');
            updateAuthUI();
            alert('❌ Session expired. Please login again.');
            showAuthModal('login');
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

    // Store character names for delete confirmation (avoids XSS in onclick)
    window._characterNames = {};
    characters.forEach(char => {
        window._characterNames[char.id] = char.name;
    });

    // System display names
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
                    <span class="character-name">${escapeHtml(char.name)}</span>
                    <span class="character-system" data-system="${systemId}">${escapeHtml(systemName)}</span>
                </div>
                <span class="character-date">${escapeHtml(new Date(char.updated_at).toLocaleDateString())}</span>
                <button class="delete-char-btn" onclick="event.stopPropagation(); deleteCharacterById(${parseInt(char.id)})">🗑️</button>
            </div>
        `;
    }).join('');

    modal.style.display = 'flex';
}

function hideCharacterListModal() {
    document.getElementById('character-list-modal').style.display = 'none';
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
        const res = await fetch('/api/trash/characters', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

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
                        <span class="trash-item-name">${escapeHtml(charName)}</span>
                        <span class="trash-item-date">Deleted: ${deletedDate}</span>
                    </div>
                    <div class="trash-item-actions">
                        <button class="trash-btn trash-btn-restore" onclick="restoreCharacter(${char.id})" title="Restore">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                            Restore
                        </button>
                        <button class="trash-btn trash-btn-delete" onclick="permanentDeleteCharacter(${char.id}, '${escapeHtml(charName).replace(/'/g, "\\'")}')" title="Delete permanently">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading trash:', err);
        list.innerHTML = '<p class="trash-error">Failed to load deleted characters</p>';
    }
}

async function restoreCharacter(id) {
    try {
        const res = await fetch(`/api/trash/characters/${id}/restore`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
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
        const res = await fetch(`/api/trash/characters/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) throw new Error('Failed to delete');

        alert('Character permanently deleted.');
        await loadTrashCharacters();
    } catch (err) {
        console.error('Error deleting character:', err);
        alert('Failed to delete character');
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function loadCharacterById(id) {
    try {
        const res = await fetch(`/api/characters/${id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) {
            alert('❌ Error loading character');
            return;
        }

        const character = await res.json();
        const currentSystem = localStorage.getItem('aedelore_selected_system') || 'aedelore';
        const charSystem = character.system || 'aedelore';

        // Check if character's system matches current system
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
                // Switch system and reload
                localStorage.setItem('aedelore_selected_system', charSystem);
                localStorage.setItem('aedelore_pending_character_id', id);
                location.reload();
                return;
            } else {
                return;
            }
        }

        // Parse data if it's a string (API returns JSON string for mobile app compatibility)
        const charData = typeof character.data === 'string' ? JSON.parse(character.data) : character.data;
        setAllFields(charData);
        renderQuestItems(charData.quest_items || []);
        currentCharacterId = id;
        currentCampaign = character.campaign || null;

        // Load character progression data
        characterXP = character.xp || 0;
        characterXPSpent = character.xp_spent || 0;
        raceClassLocked = character.race_class_locked || false;
        attributesLocked = character.attributes_locked || false;
        abilitiesLocked = character.abilities_locked || false;

        // Calculate base attribute values if race/class is locked
        if (raceClassLocked) {
            baseAttributeValues = calculateBaseAttributeValues();
        }

        // If attributes are locked, store current total for XP spending tracking
        if (attributesLocked) {
            attributeTotalAtSpendStart = getCurrentAttributeTotal();
        }

        // Store character ID for persistence across reloads
        localStorage.setItem('aedelore_current_character_id', id);
        updateCampaignDisplay();
        updateProgressionSection();
        updatePointsDisplay();
        loadPartyMembers();
        hideCharacterListModal();

        // Initialize lastSavedData to prevent unnecessary autosave on load
        lastSavedData = JSON.stringify(getAllFields());

        // Start autosave interval
        startAutoSave();
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}

async function deleteCharacterById(id) {
    const name = window._characterNames?.[id] || 'this character';
    if (!confirm(`Are you sure you want to delete "${name}"?`)) {
        return;
    }

    try {
        const res = await fetch(`/api/characters/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) {
            alert('❌ Error deleting character');
            return;
        }

        if (currentCharacterId === id) {
            currentCharacterId = null;
            currentCampaign = null;
            localStorage.removeItem('aedelore_current_character_id');
            updateCampaignDisplay();
        }

        // Refresh the list
        loadFromServer();
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}

// ============================================
// Campaign Linking Functions
// ============================================

function updateCampaignDisplay() {
    const campaignSection = document.getElementById('campaign-section');
    const campaignInfo = document.getElementById('campaign-info');
    const linkBtn = document.getElementById('campaign-link-btn');
    const unlinkBtn = document.getElementById('campaign-unlink-btn');
    const partySection = document.getElementById('party-section');

    if (!campaignSection) return;

    // Show campaign section if logged in
    if (!authToken) {
        campaignSection.style.display = 'none';
        return;
    }

    campaignSection.style.display = 'block';

    // If character not saved to server yet, show message
    if (!currentCharacterId) {
        campaignInfo.innerHTML = '<span class="no-campaign">Save your character to cloud first to link to a campaign</span>';
        linkBtn.style.display = 'none';
        unlinkBtn.style.display = 'none';
        if (partySection) partySection.style.display = 'none';
        return;
    }

    if (partySection) partySection.style.display = 'block';

    if (currentCampaign) {
        campaignInfo.innerHTML = `
            <div class="campaign-details">
                <span class="campaign-name">${escapeHtml(currentCampaign.name)}</span>
                <span class="campaign-dm">DM: ${escapeHtml(currentCampaign.dm_name)}</span>
            </div>
            <a href="dm-session.html" class="campaign-link-btn">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                View Campaign Sessions
            </a>
        `;
        linkBtn.style.display = 'none';
        unlinkBtn.style.display = 'inline-flex';
    } else {
        campaignInfo.innerHTML = '<span class="no-campaign">Not linked to any campaign</span>';
        linkBtn.style.display = 'inline-flex';
        unlinkBtn.style.display = 'none';
    }
}

function showLinkCampaignModal() {
    const modal = document.getElementById('link-campaign-modal');
    document.getElementById('campaign-share-code').value = '';
    modal.style.display = 'flex';
}

function hideLinkCampaignModal() {
    document.getElementById('link-campaign-modal').style.display = 'none';
}

async function linkCharacterToCampaign() {
    if (!currentCharacterId || !authToken) {
        alert('You must save your character to the server first.');
        return;
    }

    const shareCode = document.getElementById('campaign-share-code').value.trim();
    if (!shareCode) {
        alert('Please enter a campaign code.');
        return;
    }

    try {
        const res = await fetch(`/api/characters/${currentCharacterId}/link-campaign`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ share_code: shareCode })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(`❌ ${data.error || 'Failed to link campaign'}`);
            return;
        }

        // Reload page to refresh everything
        hideLinkCampaignModal();
        location.reload();
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}

async function unlinkCharacterFromCampaign() {
    if (!currentCharacterId || !authToken) return;

    if (!confirm('Are you sure you want to unlink this character from the campaign?')) {
        return;
    }

    try {
        const res = await fetch(`/api/characters/${currentCharacterId}/link-campaign`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) {
            const data = await res.json();
            alert(`❌ ${data.error || 'Failed to unlink campaign'}`);
            return;
        }

        // Reload page to refresh everything
        location.reload();
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}

async function loadPartyMembers() {
    if (!currentCharacterId || !authToken || !currentCampaign) {
        updatePartyDisplay([]);
        return;
    }

    try {
        const res = await fetch(`/api/characters/${currentCharacterId}/party`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) {
            updatePartyDisplay([]);
            return;
        }

        const data = await res.json();
        updatePartyDisplay(data.party || []);
    } catch (error) {
        updatePartyDisplay([]);
    }
}

function updatePartyDisplay(party) {
    const partyList = document.getElementById('party-list');

    if (!partyList) return;

    if (party.length === 0) {
        partyList.innerHTML = '<p class="no-party">No other characters in this campaign yet.</p>';
        return;
    }

    partyList.innerHTML = party.map(member => `
        <div class="party-member">
            <span class="party-member-name">${escapeHtml(member.name)}</span>
            <span class="party-member-player">(${escapeHtml(member.player_name)})</span>
        </div>
    `).join('');
}

async function deleteAccount() {
    if (!authToken) {
        alert('You must be logged in to delete your account.');
        return;
    }

    const password = prompt('⚠️ WARNING: This will permanently delete your account and ALL saved characters!\n\nEnter your password to confirm:');

    if (!password) {
        return;
    }

    if (!confirm('Are you ABSOLUTELY sure? This cannot be undone!')) {
        return;
    }

    try {
        const res = await fetch('/api/account', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(`❌ ${data.error || 'Failed to delete account'}`);
            return;
        }

        authToken = null;
        currentCharacterId = null;
        localStorage.removeItem('aedelore_auth_token');
        updateAuthUI();
        alert('✅ Account deleted successfully.');
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}

// ============================================
// Character Progression & Locking System
// ============================================

let characterXP = 0;
let characterXPSpent = 0;
let raceClassLocked = false;
let attributesLocked = false;
let abilitiesLocked = false;

// Point tracking system
// All attribute and skill field IDs that count towards free points
const ALL_ATTRIBUTE_IDS = [
    // Main attributes
    'strength_value', 'dexterity_value', 'toughness_value',
    'intelligence_value', 'wisdom_value', 'force_of_will_value',
    // Strength skills
    'strength_athletics', 'strength_raw_power', 'strength_unarmed',
    // Dexterity skills
    'dexterity_endurance', 'dexterity_acrobatics', 'dexterity_sleight_of_hand', 'dexterity_stealth',
    // Toughness skills
    'toughness_bonus_while_injured', 'toughness_resistance',
    // Intelligence skills
    'intelligence_arcana', 'intelligence_history', 'intelligence_investigation', 'intelligence_nature', 'intelligence_religion',
    // Wisdom skills
    'wisdom_luck', 'wisdom_animal_handling', 'wisdom_insight', 'wisdom_medicine', 'wisdom_perception', 'wisdom_survival',
    // Force of Will skills
    'force_of_will_deception', 'force_of_will_intimidation', 'force_of_will_performance', 'force_of_will_persuasion'
];
const FREE_POINTS_TOTAL = 10;
const MAX_POINTS_PER_ATTRIBUTE = 5;
let baseAttributeValues = {}; // Stores values after race/class bonuses (before free points)
let xpSpendingMode = false; // True when player clicked "Spend Point"
let attributeTotalAtSpendStart = 0; // Total attribute points when XP spending started
let xpPointsAvailableAtSpendStart = 0; // How many XP points available when spending started

// Mapping from bonus names to field IDs
const ATTRIBUTE_NAME_TO_ID = {
    'Strength': 'strength_value',
    'Dexterity': 'dexterity_value',
    'Agility': 'dexterity_value',
    'Toughness': 'toughness_value',
    'Intelligence': 'intelligence_value',
    'Wisdom': 'wisdom_value',
    'Force of Will': 'force_of_will_value',
    'Athletics': 'strength_athletics',
    'Raw Power': 'strength_raw_power',
    'Unarmed': 'strength_unarmed',
    'Endurance': 'dexterity_endurance',
    'Acrobatics': 'dexterity_acrobatics',
    'Sleight of Hand': 'dexterity_sleight_of_hand',
    'Stealth': 'dexterity_stealth',
    'Bonus While Injured': 'toughness_bonus_while_injured',
    'Resistance': 'toughness_resistance',
    'Arcana': 'intelligence_arcana',
    'History': 'intelligence_history',
    'Investigation': 'intelligence_investigation',
    'Nature': 'intelligence_nature',
    'Religion': 'intelligence_religion',
    'Luck': 'wisdom_luck',
    'Animal Handling': 'wisdom_animal_handling',
    'Insight': 'wisdom_insight',
    'Medicine': 'wisdom_medicine',
    'Perception': 'wisdom_perception',
    'Survival': 'wisdom_survival',
    'Deception': 'force_of_will_deception',
    'Intimidation': 'force_of_will_intimidation',
    'Performance': 'force_of_will_performance',
    'Persuasion': 'force_of_will_persuasion'
};

// Calculate base attribute values from race/class/religion (without free points)
function calculateBaseAttributeValues() {
    const base = {};
    ALL_ATTRIBUTE_IDS.forEach(id => base[id] = 0);

    // Get race/class/religion selections
    const raceValue = document.getElementById('race')?.value;
    const classValue = document.getElementById('class')?.value;
    const religionValue = document.getElementById('religion')?.value;

    // Helper to apply bonuses
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

    // Apply race bonuses
    if (raceValue && typeof RACES !== 'undefined' && RACES[raceValue]) {
        applyBonuses(RACES[raceValue].bonuses);
    }

    // Apply class bonuses
    if (classValue && typeof CLASSES !== 'undefined' && CLASSES[classValue]) {
        applyBonuses(CLASSES[classValue].bonuses);
    }

    // Apply religion bonuses
    if (religionValue && typeof RELIGIONS !== 'undefined' && RELIGIONS[religionValue]) {
        applyBonuses(RELIGIONS[religionValue].bonuses);
    }

    return base;
}

// Helper to map attribute names to field IDs
function getAttributeFieldId(attrName) {
    return ATTRIBUTE_NAME_TO_ID[attrName] || null;
}

// Get current total of all attribute and skill points
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

// Get base total (sum of base values)
function getBaseAttributeTotal() {
    let total = 0;
    for (const id of ALL_ATTRIBUTE_IDS) {
        total += baseAttributeValues[id] || 0;
    }
    return total;
}

// Calculate how many free points have been used
function getFreePointsUsed() {
    const currentTotal = getCurrentAttributeTotal();
    const baseTotal = getBaseAttributeTotal();
    return currentTotal - baseTotal;
}

// Check if we can add a point to this field
function canAddAttributePoint(fieldId, delta) {
    // Only check attributes and skills (not other fields like HP, armor damage, etc.)
    if (!ALL_ATTRIBUTE_IDS.includes(fieldId)) {
        return true; // Other fields are not limited
    }

    // If decreasing, always allow (down to base value)
    if (delta < 0) {
        const field = document.getElementById(fieldId);
        const currentValue = parseInt(field?.value) || 0;
        const baseValue = baseAttributeValues[fieldId] || 0;
        return currentValue > baseValue;
    }

    // If race/class not locked, allow freely (character creation phase)
    if (!raceClassLocked) {
        return true;
    }

    // XP spending mode (attributes were locked, now temporarily unlocked to spend points)
    // Check this FIRST because attributesLocked is false during XP spending
    if (xpSpendingMode) {
        const currentTotal = getCurrentAttributeTotal();
        const pointsAddedSinceSpend = currentTotal - attributeTotalAtSpendStart;
        // Allow up to the number of available XP points (no max-5 limit for XP points)
        return pointsAddedSinceSpend < xpPointsAvailableAtSpendStart;
    }

    // If race/class locked but attributes not locked: initial 10 point distribution
    if (!attributesLocked) {
        const pointsUsed = getFreePointsUsed();
        if (pointsUsed >= FREE_POINTS_TOTAL) {
            return false;
        }

        // Check max per attribute (5 points TOTAL at character creation)
        const field = document.getElementById(fieldId);
        const currentValue = parseInt(field?.value) || 0;
        if (currentValue >= MAX_POINTS_PER_ATTRIBUTE) {
            return false;
        }

        return true;
    }

    // Attributes locked and not in spending mode: disallow
    return false;
}

// Update the points display in the badge next to Attributes title
function updatePointsDisplay() {
    updateAttributeBadge();
}

// Render quest items given by DM (compact grid, click for details)
function renderQuestItems(questItems) {
    const container = document.getElementById('quest-items-container');
    if (!container) return;

    if (!questItems || questItems.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); font-style: italic; text-align: center; padding: var(--space-4);">No quest items yet. Your DM can give you items during sessions.</p>`;
        return;
    }

    container.innerHTML = `
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
            ${questItems.map((item, i) => `
                <div onclick="showQuestItemDetails(${i})" style="padding: 8px 12px; background: linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(251, 191, 36, 0.05) 100%); border: 1px solid rgba(251, 191, 36, 0.3); border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: transform 0.1s, box-shadow 0.1s;" onmouseover="this.style.transform='scale(1.02)'; this.style.boxShadow='0 2px 8px rgba(251, 191, 36, 0.2)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='none';">
                    <span style="font-size: 1rem;">🗝️</span>
                    <span style="font-weight: 600; font-size: 0.9rem; color: var(--accent-gold);">${escapeHtml(item.name || 'Unknown Item')}</span>
                </div>
            `).join('')}
        </div>
    `;

    // Store quest items for detail view
    window._questItems = questItems;
}

// Show quest item details in a modal/alert
function showQuestItemDetails(index) {
    const item = window._questItems?.[index];
    if (!item) return;

    let message = item.name || 'Unknown Item';
    if (item.description) {
        message += '\n\n' + item.description;
    }
    if (item.givenAt) {
        message += '\n\nReceived: ' + item.givenAt;
    }
    alert(message);
}


// Update the badge next to Attributes title with current state
function updateAttributeBadge() {
    const badge = document.getElementById('attr-locked-badge');
    if (!badge) return;

    // Only show for cloud-saved characters
    if (!currentCharacterId || !authToken) {
        badge.style.display = 'none';
        return;
    }

    const earnedPoints = Math.floor(characterXP / 10);
    const usedPoints = Math.floor(characterXPSpent / 10);
    const availableXPPoints = earnedPoints - usedPoints;

    if (!raceClassLocked) {
        // Race/class not locked
        badge.style.display = 'inline';
        badge.innerHTML = '⚠️ Lock Race/Class first';
    } else if (xpSpendingMode) {
        // XP spending mode
        const currentTotal = getCurrentAttributeTotal();
        const pointsAdded = currentTotal - attributeTotalAtSpendStart;
        badge.style.display = 'inline';
        badge.innerHTML = `✨ <strong>${pointsAdded}/${xpPointsAvailableAtSpendStart}</strong> pt <button class="btn-tiny btn-gold" onclick="lockAttributes()">🔒 Lock</button>`;
    } else if (!attributesLocked) {
        // Initial 10 point distribution
        const pointsUsed = getFreePointsUsed();
        badge.style.display = 'inline';
        badge.innerHTML = `✓ <strong>${pointsUsed}/${FREE_POINTS_TOTAL}</strong> pts <button class="btn-tiny btn-gold" onclick="lockAttributes()">🔒 Lock</button>`;
    } else {
        // Fully locked
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

    // Only show for cloud-saved characters
    if (!currentCharacterId || !authToken) {
        if (badge) badge.style.display = 'none';
        if (progressMsg) progressMsg.style.display = 'none';
        return;
    }

    if (!raceClassLocked) {
        // Race/class not locked yet
        if (badge) {
            badge.style.display = 'inline';
            badge.innerHTML = '⚠️ Lock Race/Class first';
        }
        if (progressMsg) {
            progressMsg.style.display = 'block';
            progressMsg.innerHTML = '📋 <strong>Step 1:</strong> Go to Character tab, select race and class, then lock.';
        }
    } else if (!attributesLocked && !xpSpendingMode) {
        // Attributes not locked yet
        if (badge) {
            badge.style.display = 'inline';
            badge.innerHTML = '⚠️ Lock Attributes first';
        }
        if (progressMsg) {
            progressMsg.style.display = 'block';
            progressMsg.innerHTML = '📋 <strong>Step 2:</strong> Go to Attributes tab, distribute 10 points, then lock.';
        }
    } else if (xpSpendingMode) {
        // XP spending mode
        if (badge) {
            badge.style.display = 'inline';
            badge.innerHTML = '⚠️ Finish spending points';
        }
        if (progressMsg) {
            progressMsg.style.display = 'none';
        }
    } else if (!abilitiesLocked) {
        // Attributes locked, abilities not locked
        if (badge) {
            badge.style.display = 'inline';
            badge.innerHTML = `<button class="btn-tiny btn-gold" onclick="lockAbilities()">🔒 Lock Abilities</button>`;
        }
        if (progressMsg) {
            progressMsg.style.display = 'block';
            progressMsg.innerHTML = '📋 <strong>Step 3:</strong> Select your abilities below, then lock to complete.';
        }
    } else {
        // Fully locked
        if (badge) {
            badge.style.display = 'inline';
            badge.innerHTML = '🔒 Locked';
        }
        if (progressMsg) {
            progressMsg.style.display = 'block';
            progressMsg.innerHTML = '✅ <strong>Complete!</strong> All locked.';
        }
    }
}

function updateAttributesProgressionMsg() {
    const progressMsg = document.getElementById('attributes-progression-msg');

    // Only show for cloud-saved characters
    if (!currentCharacterId || !authToken) {
        if (progressMsg) progressMsg.style.display = 'none';
        return;
    }

    if (!raceClassLocked) {
        // Race/class not locked yet
        if (progressMsg) {
            progressMsg.style.display = 'block';
            progressMsg.innerHTML = '📋 <strong>Step 1:</strong> Go to Character tab, select race and class, then lock.';
        }
    } else if (!attributesLocked && !xpSpendingMode) {
        // Attributes not locked yet - show step 2
        if (progressMsg) {
            progressMsg.style.display = 'block';
            progressMsg.innerHTML = '📋 <strong>Step 2:</strong> Distribute your 10 points below, then lock.';
        }
    } else {
        // Attributes locked or XP spending mode - hide message
        if (progressMsg) {
            progressMsg.style.display = 'none';
        }
    }
}

function updateProgressionSection() {
    const section = document.getElementById('progression-section');
    const attrLockBar = document.getElementById('attr-lock-bar');

    // Only show progression elements for cloud-saved characters
    if (!currentCharacterId || !authToken) {
        if (section) section.style.display = 'none';
        if (attrLockBar) attrLockBar.style.display = 'none';
        return;
    }

    // Show progression section in Character tab
    if (section) section.style.display = 'block';

    // Update XP display
    const xpValue = document.getElementById('xp-value');
    const xpAvailable = document.getElementById('xp-available');
    const availablePointsEl = document.getElementById('available-points');

    // Show remaining XP (total - spent)
    const remainingXP = characterXP - characterXPSpent;
    if (xpValue) xpValue.textContent = `${remainingXP} XP`;

    // Calculate available attribute points (10 XP = 1 point)
    const earnedPoints = Math.floor(characterXP / 10);
    const usedPoints = Math.floor(characterXPSpent / 10);
    const availableAttributePoints = earnedPoints - usedPoints;

    if (xpAvailable && availablePointsEl) {
        if (availableAttributePoints > 0) {
            xpAvailable.style.display = 'inline';
            availablePointsEl.textContent = availableAttributePoints;
        } else {
            xpAvailable.style.display = 'none';
        }
    }

    // Update lock icons in Character tab
    const raceClassIcon = document.getElementById('lock-rc-icon');
    const attrIcon = document.getElementById('lock-attr-icon');
    const abilIcon = document.getElementById('lock-abil-icon');

    if (raceClassIcon) raceClassIcon.textContent = raceClassLocked ? '🔒' : '🔓';
    if (attrIcon) attrIcon.textContent = attributesLocked ? '🔒' : '🔓';
    if (abilIcon) abilIcon.textContent = abilitiesLocked ? '🔒' : '🔓';

    // Update Lock Race/Class button in Character tab
    const lockRaceBtn = document.getElementById('lock-race-class-btn');
    if (lockRaceBtn) {
        lockRaceBtn.style.display = raceClassLocked ? 'none' : 'inline-flex';
    }

    // Hide the old lock bar - everything now in badge
    if (attrLockBar) {
        attrLockBar.style.display = 'none';
    }

    // Update badge next to Attributes title with all states
    updateAttributeBadge();

    // Update abilities badge and progression message
    updateAbilitiesBadge();

    // Update attributes progression message
    updateAttributesProgressionMsg();

    // Hide the "10 free points" note after attributes are locked or during XP spending
    const freePointsNote = document.getElementById('free-points-note');
    if (freePointsNote) {
        // Show only during initial point distribution (not when XP spending or fully locked)
        const showNote = raceClassLocked && !attributesLocked && !xpSpendingMode;
        freePointsNote.style.display = showNote ? 'block' : 'none';
    }

    // Apply lock state to form fields
    applyLockState();
}

function applyLockState() {
    // Only apply lock state for cloud-saved characters
    if (!currentCharacterId || !authToken) return;

    // Lock race and class dropdowns if locked
    const raceSelect = document.getElementById('race');
    const classSelect = document.getElementById('class');

    if (raceSelect) {
        raceSelect.disabled = raceClassLocked;
        if (raceClassLocked) {
            raceSelect.classList.add('locked');
        } else {
            raceSelect.classList.remove('locked');
        }
    }

    if (classSelect) {
        classSelect.disabled = raceClassLocked;
        if (raceClassLocked) {
            classSelect.classList.add('locked');
        } else {
            classSelect.classList.remove('locked');
        }
    }

    // Lock attribute inputs based on progression state
    const attributeInputs = document.querySelectorAll('.attribute-value input[type="number"], .skill-value');
    const earnedPoints = Math.floor(characterXP / 10);
    const usedPoints = Math.floor(characterXPSpent / 10);
    const availablePoints = earnedPoints - usedPoints;

    attributeInputs.forEach(input => {
        // Lock if: race/class NOT locked, OR (attributes locked AND no available points)
        const shouldLock = !raceClassLocked || (attributesLocked && availablePoints <= 0);
        input.disabled = shouldLock;
        if (shouldLock) {
            input.classList.add('locked');
        } else {
            input.classList.remove('locked');
        }
    });

    // Also disable +/- buttons for attributes when locked
    const valueButtons = document.querySelectorAll('.attribute-section .value-btn');
    valueButtons.forEach(btn => {
        const shouldLock = !raceClassLocked || (attributesLocked && availablePoints <= 0);
        btn.disabled = shouldLock;
        if (shouldLock) {
            btn.classList.add('locked');
        } else {
            btn.classList.remove('locked');
        }
    });

    // Lock abilities (spell dropdowns) based on progression state
    // Abilities are disabled until attributes are locked
    // Once abilities are locked, they stay locked unless DM unlocks
    const shouldLockAbilities = !attributesLocked || abilitiesLocked || xpSpendingMode;
    for (let i = 1; i <= 10; i++) {
        const spellSelect = document.getElementById(`spell_${i}_type`);
        if (spellSelect) {
            spellSelect.disabled = shouldLockAbilities;
            if (shouldLockAbilities) {
                spellSelect.classList.add('locked');
            } else {
                spellSelect.classList.remove('locked');
            }
        }
    }
}

async function lockRaceClass() {
    if (!currentCharacterId || !authToken) {
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
        const res = await fetch(`/api/characters/${currentCharacterId}/lock-race-class`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!res.ok) {
            const data = await res.json();
            alert(`❌ ${data.error || 'Could not lock race/class'}`);
            return;
        }

        raceClassLocked = true;

        // Store base attribute values (from race/class/religion bonuses)
        baseAttributeValues = calculateBaseAttributeValues();

        updateProgressionSection();
        updatePointsDisplay();
        alert('✅ Race and class locked. You can now distribute your 10 attribute points.');
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}

async function lockAttributes() {
    if (!currentCharacterId || !authToken) {
        alert('You must save your character to cloud first.');
        return;
    }

    if (!raceClassLocked) {
        alert('You must lock race and class first.');
        return;
    }

    // Calculate points added
    const currentTotal = getCurrentAttributeTotal();
    const pointsAdded = currentTotal - attributeTotalAtSpendStart;

    // Validate point distribution
    if (xpSpendingMode) {
        // XP spending mode: must have added at least 1 point, max available
        if (pointsAdded < 1) {
            alert('You must add at least 1 point to an attribute before locking.');
            return;
        }
        if (pointsAdded > xpPointsAvailableAtSpendStart) {
            alert(`You can only add ${xpPointsAvailableAtSpendStart} points. Please remove ${pointsAdded - xpPointsAvailableAtSpendStart} points.`);
            return;
        }
    } else {
        // Initial lock: must have used exactly 10 free points
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

    // Save current character data first (without reload)
    const saved = await saveToServer(true);
    if (!saved) {
        return; // saveToServer already showed error
    }

    try {
        console.log('Lock: characterId=', currentCharacterId, 'authToken=', authToken ? 'set' : 'missing');

        // If in XP spending mode, spend the XP first
        if (xpSpendingMode && pointsAdded > 0) {
            console.log('Lock: spending XP points:', pointsAdded);
            const spendRes = await fetch(`/api/characters/${currentCharacterId}/spend-attribute-points`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ count: pointsAdded })
            });

            if (!spendRes.ok) {
                const data = await spendRes.json();
                alert(`❌ ${data.error || 'Could not spend XP'}`);
                return;
            }

            const spendData = await spendRes.json();
            characterXPSpent = spendData.xp_spent;
        }

        // Now lock attributes
        console.log('Lock: calling lock-attributes API');
        const res = await fetch(`/api/characters/${currentCharacterId}/lock-attributes`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        console.log('Lock: response status=', res.status);

        if (!res.ok) {
            const data = await res.json();
            alert(`❌ ${data.error || 'Could not lock attributes'}`);
            return;
        }

        attributesLocked = true;
        xpSpendingMode = false; // Reset spending mode
        xpPointsAvailableAtSpendStart = 0;
        updateProgressionSection();
        alert('✅ Attributes locked!');
    } catch (error) {
        console.error('Lock attributes error:', error);
        alert(`❌ Error: ${error.name}: ${error.message}`);
    }
}

async function lockAbilities() {
    if (!currentCharacterId || !authToken) {
        alert('You must save your character to cloud first.');
        return;
    }

    if (!raceClassLocked) {
        alert('You must lock race and class first.');
        return;
    }

    if (!attributesLocked) {
        alert('You must lock attributes first.');
        return;
    }

    if (!confirm('Are you sure you want to lock abilities? Only your DM can unlock this.')) {
        return;
    }

    // Save current character data first (without reload)
    const saved = await saveToServer(true);
    if (!saved) {
        return;
    }

    try {
        const res = await fetch(`/api/characters/${currentCharacterId}/lock-abilities`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!res.ok) {
            const data = await res.json();
            alert(`❌ ${data.error || 'Could not lock abilities'}`);
            return;
        }

        abilitiesLocked = true;
        updateProgressionSection();
        alert('✅ Abilities locked! Character creation complete.');
    } catch (error) {
        console.error('Lock abilities error:', error);
        alert(`❌ Error: ${error.name}: ${error.message}`);
    }
}

function spendAttributePoint() {
    if (!currentCharacterId || !authToken) {
        alert('You must save your character to cloud first.');
        return;
    }

    if (!attributesLocked) {
        alert('Attributes must be locked before spending XP points.');
        return;
    }

    const earnedPoints = Math.floor(characterXP / 10);
    const usedPoints = Math.floor(characterXPSpent / 10);
    const availablePoints = earnedPoints - usedPoints;

    if (availablePoints <= 0) {
        alert('You have no attribute points to spend.');
        return;
    }

    // Enter XP spending mode - no API call yet, just unlock for editing
    xpSpendingMode = true;
    xpPointsAvailableAtSpendStart = availablePoints;
    attributeTotalAtSpendStart = getCurrentAttributeTotal();
    attributesLocked = false; // Temporarily unlocked to spend points

    updateProgressionSection();
}

// ============================================
// ONBOARDING GUIDE
// ============================================

function initOnboarding() {
    // Check if user has dismissed the guide permanently
    const dismissed = localStorage.getItem('onboarding_dismissed');
    if (dismissed === 'true') {
        return;
    }

    // Check if user already has significant data (not a new user)
    const hasCharacter = localStorage.getItem('characterName') ||
                         document.getElementById('character_name')?.value;
    const isLoggedIn = !!authToken;

    // Show guide for new users or those who haven't completed setup
    if (!dismissed) {
        showOnboarding();
    }

    // Set up auto-check for completed steps
    setInterval(updateOnboardingProgress, 1000);

    // Also clone content for mobile
    cloneOnboardingForMobile();
}

function cloneOnboardingForMobile() {
    const mobileContent = document.getElementById('onboarding-mobile-content');
    const steps = document.querySelector('.onboarding-steps');
    const footer = document.querySelector('.onboarding-footer');

    if (mobileContent && steps && footer) {
        mobileContent.innerHTML = `
            <div class="onboarding-steps">${steps.innerHTML}</div>
            <div class="onboarding-footer">${footer.innerHTML}</div>
        `;
    }
}

function showOnboarding() {
    const sidebar = document.getElementById('onboarding-sidebar');
    const mobile = document.getElementById('onboarding-mobile');

    if (window.innerWidth > 768) {
        sidebar?.classList.add('visible');
        document.body.classList.add('onboarding-active');
    } else {
        mobile?.classList.add('visible');
    }

    updateOnboardingProgress();
}

function hideOnboarding() {
    const sidebar = document.getElementById('onboarding-sidebar');
    const mobile = document.getElementById('onboarding-mobile');

    sidebar?.classList.remove('visible');
    mobile?.classList.remove('visible', 'expanded');
    document.body.classList.remove('onboarding-active');
}

function hideOnboardingPermanent() {
    localStorage.setItem('onboarding_dismissed', 'true');
    hideOnboarding();
}

function toggleOnboardingMobile() {
    const mobile = document.getElementById('onboarding-mobile');
    mobile?.classList.toggle('expanded');
}

function updateOnboardingProgress() {
    const steps = {
        'register': checkStepRegister(),
        'name': checkStepName(),
        'save': checkStepSave(),
        'race-class': checkStepRaceClass(),
        'lock-rc': checkStepLockRaceClass(),
        'attributes': checkStepAttributes(),
        'lock-attr': checkStepLockAttributes(),
        'campaign': checkStepCampaign(),
        'overview': checkStepOverview()
    };

    let firstIncomplete = null;

    Object.keys(steps).forEach((stepId, index) => {
        const stepEl = document.querySelector(`[data-step="${stepId}"]`);
        const mobileStepEl = document.querySelector(`#onboarding-mobile-content [data-step="${stepId}"]`);

        if (stepEl) {
            stepEl.classList.toggle('completed', steps[stepId]);
            stepEl.classList.remove('current');
        }
        if (mobileStepEl) {
            mobileStepEl.classList.toggle('completed', steps[stepId]);
            mobileStepEl.classList.remove('current');
        }

        if (!steps[stepId] && !firstIncomplete) {
            firstIncomplete = stepId;
            stepEl?.classList.add('current');
            mobileStepEl?.classList.add('current');
        }
    });

    // Check if all steps are complete
    const allComplete = Object.values(steps).every(v => v);
    if (allComplete) {
        // Auto-hide after a delay when all complete
        setTimeout(() => {
            hideOnboardingPermanent();
        }, 2000);
    }
}

function checkStepRegister() {
    return !!authToken;
}

function checkStepName() {
    const nameField = document.getElementById('character_name');
    return nameField && nameField.value.trim().length > 0;
}

function checkStepSave() {
    return !!currentCharacterId;
}

function checkStepRaceClass() {
    const race = document.getElementById('race')?.value;
    const charClass = document.getElementById('class')?.value;
    const religion = document.getElementById('religion')?.value;
    return race && charClass && religion;
}

function checkStepLockRaceClass() {
    return raceClassLocked === true;
}

function checkStepAttributes() {
    // Must have locked race/class first (otherwise baseAttributeValues is empty)
    if (!raceClassLocked) return false;

    // Check if user has distributed all 10 free points
    const pointsUsed = getFreePointsUsed();
    return pointsUsed >= FREE_POINTS_TOTAL;
}

function checkStepLockAttributes() {
    return attributesLocked === true;
}

function checkStepCampaign() {
    // Check if character is linked to a campaign
    const campaignInfo = document.getElementById('campaign-info');
    if (campaignInfo) {
        const noCampaign = campaignInfo.querySelector('.no-campaign');
        return !noCampaign || noCampaign.style.display === 'none';
    }
    return false;
}

function checkStepOverview() {
    // Check if Overview tab has been visited (is currently active)
    const overviewTab = document.querySelector('[data-tab="overview"]');
    return overviewTab && overviewTab.classList.contains('active');
}

// Initialize onboarding when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Delay slightly to let other initialization complete
    setTimeout(initOnboarding, 500);
});

// Handle window resize for responsive switching
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('onboarding-sidebar');
    const mobile = document.getElementById('onboarding-mobile');

    if (document.body.classList.contains('onboarding-active') ||
        mobile?.classList.contains('visible')) {
        if (window.innerWidth > 768) {
            sidebar?.classList.add('visible');
            mobile?.classList.remove('visible', 'expanded');
            document.body.classList.add('onboarding-active');
        } else {
            sidebar?.classList.remove('visible');
            mobile?.classList.add('visible');
            document.body.classList.remove('onboarding-active');
        }
    }
});
