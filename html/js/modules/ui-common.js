// ============================================
// UI Common Module
// Handles common UI interactions: mobile menu, collapsibles, dropdowns, themes, avatar
// ============================================

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
            if (e.target.closest('.dropdown-trigger')) {
                return;
            }
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

        if (!section.querySelector('.section-content')) {
            const content = document.createElement('div');
            content.className = 'section-content';
            let sibling = title.nextElementSibling;
            while (sibling) {
                const next = sibling.nextElementSibling;
                content.appendChild(sibling);
                sibling = next;
            }
            section.appendChild(content);
        }

        function toggleSection(e) {
            if (window.innerWidth > 1024) return;
            e.preventDefault();
            e.stopPropagation();
            section.classList.toggle('collapsed');

            const sectionId = section.getAttribute('data-section-id');
            if (sectionId) {
                try {
                    const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
                    collapsedSections[sectionId] = section.classList.contains('collapsed');
                    localStorage.setItem('collapsedSections', JSON.stringify(collapsedSections));
                } catch (err) {}
            }
        }

        title.addEventListener('click', toggleSection);
        title.setAttribute('tabindex', '0');
        title.setAttribute('role', 'button');
        title.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                toggleSection(e);
            }
        });

        const sectionId = section.getAttribute('data-section-id');
        if (sectionId && window.innerWidth <= 1024) {
            const collapsedSections = JSON.parse(localStorage.getItem('collapsedSections') || '{}');
            if (collapsedSections[sectionId] === undefined || collapsedSections[sectionId] === true) {
                section.classList.add('collapsed');
            }
        } else if (window.innerWidth <= 1024) {
            section.classList.add('collapsed');
        }
    });
}

function handleCollapsibleResize() {
    const sections = document.querySelectorAll('.section.collapsible');
    if (window.innerWidth > 1024) {
        sections.forEach(section => section.classList.remove('collapsed'));
    } else {
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

function initCollapsibleAttributes() {
    const attributes = document.querySelectorAll('.attribute-section.collapsible');

    attributes.forEach(attr => {
        const header = attr.querySelector('.attribute-header');
        const attrName = attr.querySelector('.attribute-name');
        if (!header || !attrName) return;

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.className = 'attr-collapse-btn';
        toggleBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>';
        toggleBtn.setAttribute('aria-label', 'Toggle skills');
        header.appendChild(toggleBtn);

        function toggleAttribute(e) {
            const isMobileOrTablet = window.matchMedia('(max-width: 1024px)').matches;
            if (!isMobileOrTablet) return;
            e.preventDefault();
            e.stopPropagation();
            attr.classList.toggle('collapsed');

            const attrId = attr.getAttribute('data-attr-id');
            if (attrId) {
                try {
                    const collapsedAttrs = JSON.parse(localStorage.getItem('collapsedAttributes') || '{}');
                    collapsedAttrs[attrId] = attr.classList.contains('collapsed');
                    localStorage.setItem('collapsedAttributes', JSON.stringify(collapsedAttrs));
                } catch (err) {}
            }
        }

        attrName.addEventListener('click', toggleAttribute);
        attrName.style.cursor = 'pointer';
        toggleBtn.addEventListener('click', toggleAttribute);

        const isMobileOrTablet = window.matchMedia('(max-width: 1024px)').matches;
        if (isMobileOrTablet) {
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
        }
    });
}

function handleAttributeResize() {
    const attributes = document.querySelectorAll('.attribute-section.collapsible');
    const isMobileOrTablet = window.matchMedia('(max-width: 1024px)').matches;

    if (!isMobileOrTablet) {
        attributes.forEach(attr => attr.classList.remove('collapsed'));
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

function initAllCollapsibles() {
    initCollapsibleSections();
    initCollapsibleAttributes();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllCollapsibles);
} else {
    initAllCollapsibles();
}

let resizeTimeout;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(function() {
        handleCollapsibleResize();
        handleAttributeResize();
    }, 150);
});

// ============================================
// Dropdown Menu Functions
// ============================================
function toggleDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const isOpen = dropdown.classList.contains('open');
    closeDropdowns();
    if (!isOpen) {
        dropdown.classList.add('open');
    }
}

function closeDropdowns() {
    document.querySelectorAll('.dropdown.open').forEach(d => d.classList.remove('open'));
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
        closeDropdowns();
    }
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeDropdowns();
    }
});

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

    if (themeName === 'aedelore') {
        document.documentElement.removeAttribute('data-theme');
    } else {
        document.documentElement.setAttribute('data-theme', themeName);
    }

    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
        themeColorMeta.setAttribute('content', THEME_COLORS[themeName]);
    }

    THEMES.forEach(theme => {
        const check = document.getElementById(`theme-check-${theme}`);
        if (check) {
            check.textContent = (theme === themeName) ? '✓' : '';
        }
    });

    localStorage.setItem('aedelore_theme', themeName);
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('aedelore_theme') || 'aedelore';
    setTheme(savedTheme);
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadSavedTheme);
} else {
    loadSavedTheme();
}

// ============================================
// Avatar Selection Functions
// ============================================
let currentAvatar = null;
let pendingAvatarUpload = null;

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

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
        alert('Please select a valid image file (JPG, PNG, WebP, or GIF)');
        return;
    }

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('Image is too large. Maximum size is 2MB.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        pendingAvatarUpload = e.target.result;
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
    let avatarDisplay = document.getElementById('avatar-display');
    if (!avatarDisplay) {
        avatarDisplay = document.querySelector('#hero-avatar .avatar-placeholder');
    }
    if (!avatarDisplay) {
        const heroAvatar = document.getElementById('hero-avatar');
        if (heroAvatar) {
            avatarDisplay = heroAvatar.querySelector('span');
        }
    }
    if (!avatarDisplay) return;

    if (!currentAvatar) {
        avatarDisplay.textContent = '?';
    } else if (currentAvatar.type === 'emoji') {
        avatarDisplay.textContent = currentAvatar.value;
    } else if (currentAvatar.type === 'image') {
        const url = currentAvatar.value;
        if (url && (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('data:image/'))) {
            avatarDisplay.innerHTML = '';
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Avatar';
            avatarDisplay.appendChild(img);
        } else {
            avatarDisplay.textContent = '?';
        }
    }
    updateSidebarAvatar();
}

function updateSidebarAvatar() {}

function updateAvatarCurrentPreview() {
    const preview = document.getElementById('avatar-current-preview');
    if (!preview) return;

    if (!currentAvatar) {
        preview.textContent = '?';
    } else if (currentAvatar.type === 'emoji') {
        preview.textContent = currentAvatar.value;
    } else if (currentAvatar.type === 'image') {
        const url = currentAvatar.value;
        if (url && (url.startsWith('https://') || url.startsWith('http://') || url.startsWith('data:image/'))) {
            preview.innerHTML = '';
            const img = document.createElement('img');
            img.src = url;
            img.alt = 'Avatar';
            preview.appendChild(img);
        } else {
            preview.textContent = '?';
        }
    }
}

function getAvatarData() {
    return currentAvatar;
}

function setAvatarData(data) {
    currentAvatar = data;
    applyAvatar();
}

// ========================================
// Wiki Search Modal
// ========================================

let wikiSearchTimeout = null;

function openWikiSearch() {
    const modal = document.getElementById('wiki-search-modal');
    if (modal) {
        modal.style.display = 'flex';
        const input = document.getElementById('wiki-search-input');
        if (input) {
            input.value = '';
            input.focus();
        }
        // Reset results
        const results = document.getElementById('wiki-search-results');
        if (results) {
            results.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px 20px;">Type at least 2 characters to search...</p>';
        }
    }
}

function closeWikiSearch() {
    const modal = document.getElementById('wiki-search-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function handleWikiSearch(query) {
    clearTimeout(wikiSearchTimeout);
    const results = document.getElementById('wiki-search-results');

    if (!query || query.length < 2) {
        results.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px 20px;">Type at least 2 characters to search...</p>';
        return;
    }

    // Debounce search
    wikiSearchTimeout = setTimeout(async () => {
        results.innerHTML = '<p style="color: var(--text-secondary); text-align: center; padding: 40px 20px;">Searching...</p>';

        try {
            const response = await fetch(`/api/wiki/search?q=${encodeURIComponent(query)}`);
            if (!response.ok) throw new Error('Search failed');

            const data = await response.json();

            if (!data.results || data.results.length === 0) {
                results.innerHTML = `<p style="color: var(--text-secondary); text-align: center; padding: 40px 20px;">No results found for "${escapeHtmlWiki(query)}"</p>`;
                return;
            }

            results.innerHTML = data.results.map(result => `
                <a href="/wiki#${result.book_slug}/${result.slug}" target="_blank" class="wiki-search-result-item" style="display: block; padding: 12px 16px; margin-bottom: 8px; background: var(--bg-elevated); border-radius: 8px; text-decoration: none; color: inherit; border: 1px solid var(--border-default); transition: all 0.2s;">
                    <div style="font-weight: 500; color: var(--text-primary); margin-bottom: 4px;">${escapeHtmlWiki(result.title)}</div>
                    ${result.summary ? `<div style="font-size: 0.85rem; color: var(--text-secondary); overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtmlWiki(result.summary.substring(0, 100))}${result.summary.length > 100 ? '...' : ''}</div>` : ''}
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 4px;">${escapeHtmlWiki(result.book_title)}</div>
                </a>
            `).join('');

        } catch (error) {
            console.error('Wiki search error:', error);
            results.innerHTML = '<p style="color: var(--accent-red); text-align: center; padding: 40px 20px;">Search failed. Please try again.</p>';
        }
    }, 300);
}

function escapeHtmlWiki(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Export to global scope
window.toggleMobileMenu = toggleMobileMenu;
window.initCollapsibleSections = initCollapsibleSections;
window.initCollapsibleAttributes = initCollapsibleAttributes;
window.handleCollapsibleResize = handleCollapsibleResize;
window.handleAttributeResize = handleAttributeResize;
window.toggleDropdown = toggleDropdown;
window.closeDropdowns = closeDropdowns;
window.THEMES = THEMES;
window.THEME_COLORS = THEME_COLORS;
window.setTheme = setTheme;
window.loadSavedTheme = loadSavedTheme;
window.showAvatarModal = showAvatarModal;
window.hideAvatarModal = hideAvatarModal;
window.selectAvatar = selectAvatar;
window.handleAvatarUpload = handleAvatarUpload;
window.useUploadedAvatar = useUploadedAvatar;
window.clearAvatar = clearAvatar;
window.applyAvatar = applyAvatar;
window.getAvatarData = getAvatarData;
window.setAvatarData = setAvatarData;
window.openWikiSearch = openWikiSearch;
window.closeWikiSearch = closeWikiSearch;
window.handleWikiSearch = handleWikiSearch;
