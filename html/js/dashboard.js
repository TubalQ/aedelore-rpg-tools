// Dashboard and Status Bar functionality

// ===========================================
// STATUS BAR SYNC
// ===========================================

function updateStatusBar() {
    // HP
    const hpSlider = document.getElementById('hp_slider');
    const hpMax = hpSlider ? parseInt(hpSlider.max) : 24;
    const hpCurrent = hpSlider ? parseInt(hpSlider.value) : 0;
    const hpValueEl = document.getElementById('status-hp-value');
    const hpBar = document.getElementById('status-hp-bar');

    if (hpValueEl) hpValueEl.textContent = `${hpCurrent}/${hpMax}`;
    if (hpBar) hpBar.style.width = `${(hpCurrent / hpMax) * 100}%`;

    // Arcana
    const arcanaSlider = document.getElementById('arcana_slider');
    const arcanaMax = arcanaSlider ? parseInt(arcanaSlider.max) : 16;
    const arcanaCurrent = arcanaSlider ? parseInt(arcanaSlider.value) : 0;
    const arcanaValueEl = document.getElementById('status-arcana-value');
    const arcanaBar = document.getElementById('status-arcana-bar');
    const arcanaContainer = document.getElementById('status-arcana-container');

    if (arcanaValueEl) arcanaValueEl.textContent = `${arcanaCurrent}/${arcanaMax}`;
    if (arcanaBar) arcanaBar.style.width = `${(arcanaCurrent / arcanaMax) * 100}%`;

    // Hide arcana for non-magic classes
    const selectedClass = document.getElementById('class')?.value;
    const isMagicClass = selectedClass === 'Mage' || selectedClass === 'Druid';
    if (arcanaContainer) {
        arcanaContainer.classList.toggle('status-arcana-hidden', !isMagicClass);
    }

    // Willpower
    const willSlider = document.getElementById('willpower_slider');
    const willMax = willSlider ? parseInt(willSlider.max) : 3;
    const willCurrent = willSlider ? parseInt(willSlider.value) : 0;
    const willDots = document.getElementById('status-willpower-dots');

    if (willDots) {
        willDots.innerHTML = '';
        for (let i = 0; i < willMax; i++) {
            const dot = document.createElement('span');
            dot.className = `dot ${i < willCurrent ? 'filled' : 'empty'}`;
            willDots.appendChild(dot);
        }
    }

    // Bleed
    const bleedSlider = document.getElementById('bleed_slider');
    const bleedMax = bleedSlider ? parseInt(bleedSlider.max) : 6;
    const bleedCurrent = bleedSlider ? parseInt(bleedSlider.value) : 0;
    const bleedValueEl = document.getElementById('status-bleed-value');

    if (bleedValueEl) {
        bleedValueEl.textContent = `${bleedCurrent}/${bleedMax}`;
        // Highlight when bleeding
        bleedValueEl.style.opacity = bleedCurrent > 0 ? '1' : '0.5';
    }

    // Weakened (Exhaustion)
    const weakSlider = document.getElementById('weakened_slider');
    const weakMax = weakSlider ? parseInt(weakSlider.max) : 6;
    const weakCurrent = weakSlider ? parseInt(weakSlider.value) : 0;
    const weakValueEl = document.getElementById('status-weak-value');

    if (weakValueEl) {
        weakValueEl.textContent = `${weakCurrent}/${weakMax}`;
        weakValueEl.style.opacity = weakCurrent > 0 ? '1' : '0.5';
    }

    // Worthiness
    const worthSlider = document.getElementById('worthiness_slider');
    const worthCurrent = worthSlider ? parseInt(worthSlider.value) : 0;
    const worthValueEl = document.getElementById('status-worthiness-value');

    if (worthValueEl) {
        const sign = worthCurrent >= 0 ? '+' : '';
        worthValueEl.textContent = `${sign}${worthCurrent}`;
        // Color based on positive/negative
        if (worthCurrent > 0) {
            worthValueEl.style.color = 'var(--accent-green)';
        } else if (worthCurrent < 0) {
            worthValueEl.style.color = '#ef4444';
        } else {
            worthValueEl.style.color = 'var(--accent-primary)';
        }
    }

    // Update Quick Action values (mobile dashboard)
    const quickHpValue = document.getElementById('quick-hp-value');
    const quickArcanaValue = document.getElementById('quick-arcana-value');
    const quickWillValue = document.getElementById('quick-will-value');
    const quickBleedValue = document.getElementById('quick-bleed-value');
    const quickWeakValue = document.getElementById('quick-weak-value');
    const quickWorthValue = document.getElementById('quick-worth-value');

    if (quickHpValue) quickHpValue.textContent = `${hpCurrent}/${hpMax}`;
    if (quickArcanaValue) quickArcanaValue.textContent = `${arcanaCurrent}/${arcanaMax}`;
    if (quickWillValue) quickWillValue.textContent = `${willCurrent}/${willMax}`;
    if (quickBleedValue) quickBleedValue.textContent = bleedCurrent;
    if (quickWeakValue) quickWeakValue.textContent = weakCurrent;
    if (quickWorthValue) {
        const worthSign = worthCurrent >= 0 ? '+' : '';
        quickWorthValue.textContent = `${worthSign}${worthCurrent}`;
    }

    // Update equipment damage display
    if (typeof updateQuickEquipment === 'function') {
        updateQuickEquipment();
    }

    // Update weapons and abilities display
    if (typeof updateWeaponsAndAbilities === 'function') {
        updateWeaponsAndAbilities();
    }
}

// ===========================================
// DESKTOP SIDEBAR SYNC (for large screens)
// ===========================================

function updateDesktopSidebar() {
    // Only update if sidebar exists (large screens)
    const sidebar = document.getElementById('desktop-sidebar');
    if (!sidebar) return;

    // Character info
    const charName = document.getElementById('character_name')?.value || 'New Character';
    const race = document.getElementById('race')?.value || 'Race';
    const charClass = document.getElementById('class')?.value || 'Class';

    const sidebarName = document.getElementById('sidebar-char-name');
    const sidebarDetails = document.getElementById('sidebar-char-details');

    if (sidebarName) sidebarName.textContent = charName || 'New Character';
    if (sidebarDetails) sidebarDetails.textContent = `${race || 'Race'} • ${charClass || 'Class'}`;

    // HP Bar
    const hpSlider = document.getElementById('hp_slider');
    const hpMax = hpSlider ? parseInt(hpSlider.max) : 24;
    const hpCurrent = hpSlider ? parseInt(hpSlider.value) : 0;
    const sidebarHpValue = document.getElementById('sidebar-hp-value');
    const sidebarHpBar = document.getElementById('sidebar-hp-bar');

    if (sidebarHpValue) sidebarHpValue.textContent = `${hpCurrent}/${hpMax}`;
    if (sidebarHpBar) sidebarHpBar.style.width = `${(hpCurrent / hpMax) * 100}%`;

    // Arcana Bar
    const arcanaSlider = document.getElementById('arcana_slider');
    const arcanaMax = arcanaSlider ? parseInt(arcanaSlider.max) : 16;
    const arcanaCurrent = arcanaSlider ? parseInt(arcanaSlider.value) : 0;
    const sidebarArcanaValue = document.getElementById('sidebar-arcana-value');
    const sidebarArcanaBar = document.getElementById('sidebar-arcana-bar');
    const sidebarArcanaRow = document.getElementById('sidebar-arcana-row');

    if (sidebarArcanaValue) sidebarArcanaValue.textContent = `${arcanaCurrent}/${arcanaMax}`;
    if (sidebarArcanaBar) sidebarArcanaBar.style.width = `${(arcanaCurrent / arcanaMax) * 100}%`;

    // Hide arcana for non-magic classes
    const selectedClass = document.getElementById('class')?.value;
    const isMagicClass = selectedClass === 'Mage' || selectedClass === 'Druid';
    if (sidebarArcanaRow) {
        sidebarArcanaRow.style.display = isMagicClass ? 'flex' : 'none';
    }

    // Willpower Bar
    const willSlider = document.getElementById('willpower_slider');
    const willMax = willSlider ? parseInt(willSlider.max) : 3;
    const willCurrent = willSlider ? parseInt(willSlider.value) : 0;
    const sidebarWillValue = document.getElementById('sidebar-will-value');
    const sidebarWillBar = document.getElementById('sidebar-will-bar');

    if (sidebarWillValue) sidebarWillValue.textContent = `${willCurrent}/${willMax}`;
    if (sidebarWillBar) sidebarWillBar.style.width = `${(willCurrent / willMax) * 100}%`;

    // Worthiness Bar (range -10 to +10, center at 50%)
    const worthSlider = document.getElementById('worthiness_slider');
    const worthCurrent = worthSlider ? parseInt(worthSlider.value) : 0;
    const sidebarWorthValue = document.getElementById('sidebar-worth-value');
    const sidebarWorthBar = document.getElementById('sidebar-worth-bar');

    if (sidebarWorthValue) {
        const sign = worthCurrent >= 0 ? '+' : '';
        sidebarWorthValue.textContent = `${sign}${worthCurrent}`;
    }
    if (sidebarWorthBar) {
        // Map -10 to +10 to 0% to 100%
        const worthPercent = ((worthCurrent + 10) / 20) * 100;
        sidebarWorthBar.style.width = `${worthPercent}%`;
    }

    // Status indicators (Bleed/Weak)
    const bleedSlider = document.getElementById('bleed_slider');
    const bleedCurrent = bleedSlider ? parseInt(bleedSlider.value) : 0;
    const weakSlider = document.getElementById('weakened_slider');
    const weakCurrent = weakSlider ? parseInt(weakSlider.value) : 0;

    const sidebarBleed = document.getElementById('sidebar-bleed');
    const sidebarBleedVal = document.getElementById('sidebar-bleed-val');
    const sidebarWeak = document.getElementById('sidebar-weak');
    const sidebarWeakVal = document.getElementById('sidebar-weak-val');
    const sidebarStatusOk = document.getElementById('sidebar-status-ok');

    if (sidebarBleed) sidebarBleed.style.display = bleedCurrent > 0 ? 'inline' : 'none';
    if (sidebarBleedVal) sidebarBleedVal.textContent = bleedCurrent;
    if (sidebarWeak) sidebarWeak.style.display = weakCurrent > 0 ? 'inline' : 'none';
    if (sidebarWeakVal) sidebarWeakVal.textContent = weakCurrent;
    if (sidebarStatusOk) sidebarStatusOk.style.display = (bleedCurrent === 0 && weakCurrent === 0) ? 'inline' : 'none';

    // Attribute bars (max 12 for percentage calculation)
    const attributes = [
        { bar: 'sidebar-str-bar', val: 'sidebar-str-val', field: 'strength_value' },
        { bar: 'sidebar-dex-bar', val: 'sidebar-dex-val', field: 'dexterity_value' },
        { bar: 'sidebar-int-bar', val: 'sidebar-int-val', field: 'intelligence_value' },
        { bar: 'sidebar-wis-bar', val: 'sidebar-wis-val', field: 'wisdom_value' },
        { bar: 'sidebar-fow-bar', val: 'sidebar-fow-val', field: 'force_of_will_value' },
        { bar: 'sidebar-tgh-bar', val: 'sidebar-tgh-val', field: 'toughness_value' }
    ];

    const attrMax = 12; // Maximum attribute value
    attributes.forEach(attr => {
        const field = document.getElementById(attr.field);
        const value = field ? parseInt(field.value) || 0 : 0;
        const barEl = document.getElementById(attr.bar);
        const valEl = document.getElementById(attr.val);

        if (barEl) barEl.style.width = `${(value / attrMax) * 100}%`;
        if (valEl) valEl.textContent = value;
    });

    // Skill values
    const skills = [
        // Strength skills
        { sidebar: 'sidebar-str-athletics', field: 'strength_athletics' },
        { sidebar: 'sidebar-str-raw_power', field: 'strength_raw_power' },
        { sidebar: 'sidebar-str-unarmed', field: 'strength_unarmed' },
        // Dexterity skills
        { sidebar: 'sidebar-dex-endurance', field: 'dexterity_endurance' },
        { sidebar: 'sidebar-dex-acrobatics', field: 'dexterity_acrobatics' },
        { sidebar: 'sidebar-dex-sleight_of_hand', field: 'dexterity_sleight_of_hand' },
        { sidebar: 'sidebar-dex-stealth', field: 'dexterity_stealth' },
        // Intelligence skills
        { sidebar: 'sidebar-int-arcana', field: 'intelligence_arcana' },
        { sidebar: 'sidebar-int-history', field: 'intelligence_history' },
        { sidebar: 'sidebar-int-investigation', field: 'intelligence_investigation' },
        { sidebar: 'sidebar-int-nature', field: 'intelligence_nature' },
        { sidebar: 'sidebar-int-religion', field: 'intelligence_religion' },
        // Wisdom skills
        { sidebar: 'sidebar-wis-luck', field: 'wisdom_luck' },
        { sidebar: 'sidebar-wis-animal_handling', field: 'wisdom_animal_handling' },
        { sidebar: 'sidebar-wis-insight', field: 'wisdom_insight' },
        { sidebar: 'sidebar-wis-medicine', field: 'wisdom_medicine' },
        { sidebar: 'sidebar-wis-perception', field: 'wisdom_perception' },
        { sidebar: 'sidebar-wis-survival', field: 'wisdom_survival' },
        // Force of Will skills
        { sidebar: 'sidebar-fow-deception', field: 'force_of_will_deception' },
        { sidebar: 'sidebar-fow-intimidation', field: 'force_of_will_intimidation' },
        { sidebar: 'sidebar-fow-performance', field: 'force_of_will_performance' },
        { sidebar: 'sidebar-fow-persuasion', field: 'force_of_will_persuasion' },
        // Toughness skills
        { sidebar: 'sidebar-tgh-bonus_injured', field: 'toughness_bonus_while_injured' },
        { sidebar: 'sidebar-tgh-resistance', field: 'toughness_resistance' }
    ];

    skills.forEach(skill => {
        const field = document.getElementById(skill.field);
        const sidebarEl = document.getElementById(skill.sidebar);
        if (sidebarEl && field) {
            sidebarEl.textContent = field.value || '0';
        }
    });
}

// ===========================================
// QUICK ACTIONS (sidebar buttons)
// ===========================================

// quickRest() and quickHeal() are defined later in this file

function showPotionPopup() {
    // Use the existing potion system from dashboard.js
    // This calls usePotion() which shows a proper inventory-based selector
    if (typeof usePotion === 'function') {
        usePotion();
    } else {
        showQuickActionFeedback('Potion system not available');
    }
}

// ===========================================
// SIDEBAR TOGGLE
// ===========================================

function isTabletView() {
    return window.innerWidth >= 768 && window.innerWidth <= 1399;
}

function isDesktopView() {
    return window.innerWidth >= 1400;
}

function toggleSidebar() {
    const sidebar = document.getElementById('desktop-sidebar') || document.getElementById('dm-desktop-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (!sidebar || !toggleBtn) return;

    if (isTabletView()) {
        // Tablet mode: toggle open class (overlay)
        const isOpen = sidebar.classList.toggle('open');
        toggleBtn.classList.toggle('open', isOpen);
        if (backdrop) {
            backdrop.classList.toggle('visible', isOpen);
        }
    } else if (isDesktopView()) {
        // Desktop mode: toggle collapsed class (push content)
        const isCollapsed = sidebar.classList.toggle('collapsed');
        toggleBtn.classList.toggle('collapsed', isCollapsed);
        // Save desktop preference to localStorage
        localStorage.setItem('aedelore_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    }
}

function closeSidebarOnTablet() {
    if (!isTabletView()) return;

    const sidebar = document.getElementById('desktop-sidebar') || document.getElementById('dm-desktop-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (sidebar) sidebar.classList.remove('open');
    if (toggleBtn) toggleBtn.classList.remove('open');
    if (backdrop) backdrop.classList.remove('visible');
}

function initSidebarState() {
    const sidebar = document.getElementById('desktop-sidebar') || document.getElementById('dm-desktop-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');

    if (!sidebar || !toggleBtn) return;

    // Only restore collapsed state on desktop
    if (isDesktopView()) {
        const isCollapsed = localStorage.getItem('aedelore_sidebar_collapsed') === 'true';
        if (isCollapsed) {
            sidebar.classList.add('collapsed');
            toggleBtn.classList.add('collapsed');
        }
    }

    // Add backdrop click handler for tablet
    const backdrop = document.getElementById('sidebar-backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', closeSidebarOnTablet);
    }

    // Handle window resize
    window.addEventListener('resize', handleSidebarResize);
}

function handleSidebarResize() {
    const sidebar = document.getElementById('desktop-sidebar') || document.getElementById('dm-desktop-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (!sidebar || !toggleBtn) return;

    if (isDesktopView()) {
        // Switching to desktop: remove tablet classes, restore desktop state
        sidebar.classList.remove('open');
        toggleBtn.classList.remove('open');
        if (backdrop) backdrop.classList.remove('visible');

        const isCollapsed = localStorage.getItem('aedelore_sidebar_collapsed') === 'true';
        sidebar.classList.toggle('collapsed', isCollapsed);
        toggleBtn.classList.toggle('collapsed', isCollapsed);
    } else if (isTabletView()) {
        // Switching to tablet: remove desktop classes, start closed
        sidebar.classList.remove('collapsed');
        toggleBtn.classList.remove('collapsed');
    }
}

// Initialize sidebar state on load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebarState);
} else {
    initSidebarState();
}

function showQuickActionFeedback(message) {
    // Remove existing feedback
    const existing = document.querySelector('.quick-action-feedback');
    if (existing) existing.remove();

    const feedback = document.createElement('div');
    feedback.className = 'quick-action-feedback';
    feedback.textContent = message;
    document.body.appendChild(feedback);

    // Animate out
    setTimeout(() => {
        feedback.classList.add('fade-out');
        setTimeout(() => feedback.remove(), 300);
    }, 2000);
}

function focusSlider(sliderId) {
    const slider = document.getElementById(sliderId);
    if (!slider) return;

    // Find which tab the slider is in
    let tabId = 'page-attributes';
    if (sliderId === 'arcana_slider') tabId = 'page-spells';
    if (sliderId === 'bleed_slider' || sliderId === 'weakened_slider') tabId = 'page-combat';
    if (sliderId === 'worthiness_slider') tabId = 'page-attributes';

    // Switch to that tab
    switchTab(tabId);

    // Scroll to and focus the slider
    setTimeout(() => {
        slider.scrollIntoView({ behavior: 'smooth', block: 'center' });
        slider.focus();
    }, 100);
}

// ===========================================
// DASHBOARD UPDATES
// ===========================================

function updateDashboard() {
    // Hero name
    const charName = document.getElementById('character_name')?.value || 'New Character';
    const heroName = document.getElementById('hero-name');
    if (heroName) heroName.textContent = charName || 'New Character';

    // Hero avatar (first letter of name as fallback, or custom avatar)
    const heroAvatar = document.getElementById('hero-avatar');
    if (heroAvatar) {
        const initial = charName ? charName.charAt(0).toUpperCase() : '?';
        heroAvatar.innerHTML = `<span class="avatar-placeholder">${initial}</span>`;
        // Apply custom avatar if one is set (applyAvatar is defined in main.js)
        if (typeof applyAvatar === 'function') {
            applyAvatar();
        }
    }

    // Hero details
    const race = document.getElementById('race')?.value || 'Race';
    const charClass = document.getElementById('class')?.value || 'Class';
    const religion = document.getElementById('religion')?.value || 'Religion';

    const heroRace = document.getElementById('hero-race');
    const heroClass = document.getElementById('hero-class');
    const heroReligion = document.getElementById('hero-religion');

    if (heroRace) heroRace.textContent = race || 'Race';
    if (heroClass) heroClass.textContent = charClass || 'Class';
    if (heroReligion) heroReligion.textContent = religion ? religion.split('(')[0].trim() : 'Religion';

    // Quick stats (main attributes)
    const stats = [
        { id: 'dash-str', field: 'strength_value' },
        { id: 'dash-dex', field: 'dexterity_value' },
        { id: 'dash-tough', field: 'toughness_value' },
        { id: 'dash-int', field: 'intelligence_value' },
        { id: 'dash-wis', field: 'wisdom_value' },
        { id: 'dash-fow', field: 'force_of_will_value' }
    ];

    stats.forEach(stat => {
        const el = document.getElementById(stat.id);
        const field = document.getElementById(stat.field);
        if (el && field) {
            el.textContent = field.value || '0';
        }
    });

    // Update skill values in expanded stat cards
    const skillMappings = {
        // Strength skills
        'dash-str-athletics': 'strength_athletics',
        'dash-str-raw_power': 'strength_raw_power',
        'dash-str-unarmed': 'strength_unarmed',
        // Dexterity skills
        'dash-dex-endurance': 'dexterity_endurance',
        'dash-dex-acrobatics': 'dexterity_acrobatics',
        'dash-dex-sleight_of_hand': 'dexterity_sleight_of_hand',
        'dash-dex-stealth': 'dexterity_stealth',
        // Toughness skills
        'dash-tough-bonus_injured': 'toughness_bonus_while_injured',
        'dash-tough-resistance': 'toughness_resistance',
        // Intelligence skills
        'dash-int-arcana': 'intelligence_arcana',
        'dash-int-history': 'intelligence_history',
        'dash-int-investigation': 'intelligence_investigation',
        'dash-int-nature': 'intelligence_nature',
        'dash-int-religion': 'intelligence_religion',
        // Wisdom skills
        'dash-wis-luck': 'wisdom_luck',
        'dash-wis-animal_handling': 'wisdom_animal_handling',
        'dash-wis-insight': 'wisdom_insight',
        'dash-wis-medicine': 'wisdom_medicine',
        'dash-wis-perception': 'wisdom_perception',
        'dash-wis-survival': 'wisdom_survival',
        // Force of Will skills
        'dash-fow-deception': 'force_of_will_deception',
        'dash-fow-intimidation': 'force_of_will_intimidation',
        'dash-fow-performance': 'force_of_will_performance',
        'dash-fow-persuasion': 'force_of_will_persuasion'
    };

    Object.entries(skillMappings).forEach(([dashId, fieldId]) => {
        const dashEl = document.getElementById(dashId);
        const field = document.getElementById(fieldId);
        if (dashEl && field) {
            dashEl.textContent = field.value || '0';
        }
    });

    // Update magic card description based on class
    const magicDesc = document.getElementById('nav-magic-desc');
    if (magicDesc) {
        if (charClass === 'Mage' || charClass === 'Druid') {
            magicDesc.textContent = `${charClass} spells & abilities`;
        } else if (charClass) {
            magicDesc.textContent = `${charClass} abilities`;
        } else {
            magicDesc.textContent = 'Spells & abilities';
        }
    }
}

// ===========================================
// STAT CARD POPOVER
// ===========================================

function toggleStatCard(card, attrName) {
    // Close any existing popover
    const existingPopover = document.querySelector('.skill-popover');
    const wasThisCard = card.classList.contains('expanded');

    // Remove expanded from all cards
    document.querySelectorAll('.stat-card.expanded').forEach(c => {
        c.classList.remove('expanded');
    });

    // Remove existing popover
    if (existingPopover) {
        existingPopover.remove();
    }

    // If clicking same card, just close
    if (wasThisCard) {
        return;
    }

    // Mark card as expanded
    card.classList.add('expanded');

    // Get skills from the hidden stat-skills div
    const skillsDiv = card.querySelector('.stat-skills');
    if (!skillsDiv) return;

    const skillItems = skillsDiv.querySelectorAll('.skill-item');
    if (skillItems.length === 0) return;

    // Create popover
    const popover = document.createElement('div');
    popover.className = 'skill-popover';

    // Title
    const title = document.createElement('div');
    title.className = 'skill-popover-title';
    title.textContent = card.querySelector('.stat-label').textContent + ' Skills';
    popover.appendChild(title);

    // Skill items
    skillItems.forEach(item => {
        const name = item.querySelector('.skill-name')?.textContent || '';
        const value = item.querySelector('.skill-value')?.textContent || '0';

        const itemDiv = document.createElement('div');
        itemDiv.className = 'skill-popover-item';
        itemDiv.innerHTML = `
            <span class="skill-popover-name">${name}</span>
            <span class="skill-popover-value">${value}</span>
        `;
        popover.appendChild(itemDiv);
    });

    // Position popover
    document.body.appendChild(popover);

    const isMobile = window.innerWidth <= 600;

    if (!isMobile) {
        // Desktop: position below the card
        const cardRect = card.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();

        // Center below the card
        let left = cardRect.left + (cardRect.width / 2) - (popoverRect.width / 2);
        let top = cardRect.bottom + 8;

        // Keep within viewport
        if (left < 10) left = 10;
        if (left + popoverRect.width > window.innerWidth - 10) {
            left = window.innerWidth - popoverRect.width - 10;
        }

        // If would go below viewport, show above instead
        if (top + popoverRect.height > window.innerHeight - 10) {
            top = cardRect.top - popoverRect.height - 8;
            popover.insertAdjacentHTML('beforeend', `
                <style>.skill-popover::before { top: auto; bottom: -6px; border-bottom: none; border-top: 6px solid var(--accent-primary); }</style>
            `);
        }

        popover.style.position = 'fixed';
        popover.style.left = left + 'px';
        popover.style.top = top + 'px';
    } else {
        // Mobile: Add backdrop overlay
        const backdrop = document.createElement('div');
        backdrop.className = 'popover-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 999;
            animation: fadeIn 0.2s ease-out;
        `;
        document.body.insertBefore(backdrop, popover);

        // Close on backdrop tap
        backdrop.addEventListener('click', () => {
            backdrop.remove();
            popover.remove();
            card.classList.remove('expanded');
        });
    }

    // Close on click outside (desktop)
    if (!isMobile) {
        setTimeout(() => {
            document.addEventListener('click', function closePopover(e) {
                if (!popover.contains(e.target) && !card.contains(e.target)) {
                    popover.remove();
                    card.classList.remove('expanded');
                    document.removeEventListener('click', closePopover);
                }
            });
        }, 10);
    }
}

// ===========================================
// QUICK ACTIONS
// ===========================================

function quickRest() {
    // Rest: +2 HP and +2 Arcana
    let messages = [];

    // Restore HP
    const hpSlider = document.getElementById('hp_slider');
    if (hpSlider) {
        const hpMax = parseInt(hpSlider.max);
        const hpCurrent = parseInt(hpSlider.value);
        if (hpCurrent < hpMax) {
            const hpNew = Math.min(hpMax, hpCurrent + 2);
            hpSlider.value = hpNew;
            hpSlider.dispatchEvent(new Event('input'));
            messages.push(`HP +${hpNew - hpCurrent} (${hpNew}/${hpMax})`);
        }
    }

    // Restore Arcana
    const arcanaSlider = document.getElementById('arcana_slider');
    if (arcanaSlider && !arcanaSlider.disabled) {
        const arcMax = parseInt(arcanaSlider.max);
        const arcCurrent = parseInt(arcanaSlider.value);
        if (arcCurrent < arcMax) {
            const arcNew = Math.min(arcMax, arcCurrent + 2);
            arcanaSlider.value = arcNew;
            arcanaSlider.dispatchEvent(new Event('input'));
            messages.push(`Arcana +${arcNew - arcCurrent} (${arcNew}/${arcMax})`);
        }
    }

    updateStatusBar();

    if (messages.length > 0) {
        showQuickMessage(`Rested! ${messages.join(', ')}`);
        // Trigger immediate save
        if (typeof triggerImmediateSave === 'function') triggerImmediateSave();
    } else {
        showQuickMessage('Already at full HP and Arcana!');
    }
}

function quickHalfRest() {
    // Half Rest: +1 HP and +1 Arcana
    let messages = [];

    // Restore HP
    const hpSlider = document.getElementById('hp_slider');
    if (hpSlider) {
        const hpMax = parseInt(hpSlider.max);
        const hpCurrent = parseInt(hpSlider.value);
        if (hpCurrent < hpMax) {
            const hpNew = Math.min(hpMax, hpCurrent + 1);
            hpSlider.value = hpNew;
            hpSlider.dispatchEvent(new Event('input'));
            messages.push(`HP +1 (${hpNew}/${hpMax})`);
        }
    }

    // Restore Arcana (if character has arcana)
    const arcanaSlider = document.getElementById('arcana_slider');
    if (arcanaSlider && !arcanaSlider.disabled) {
        const arcMax = parseInt(arcanaSlider.max);
        const arcCurrent = parseInt(arcanaSlider.value);
        if (arcCurrent < arcMax) {
            const arcNew = Math.min(arcMax, arcCurrent + 1);
            arcanaSlider.value = arcNew;
            arcanaSlider.dispatchEvent(new Event('input'));
            messages.push(`Arcana +1 (${arcNew}/${arcMax})`);
        }
    }

    updateStatusBar();

    if (messages.length > 0) {
        showQuickMessage(`Half Rest: ${messages.join(', ')}`);
        // Trigger immediate save
        if (typeof triggerImmediateSave === 'function') triggerImmediateSave();
    } else {
        showQuickMessage('Already at full HP and Arcana!');
    }
}

function quickHeal() {
    // Heal: +1 HP
    const hpSlider = document.getElementById('hp_slider');
    if (hpSlider) {
        const max = parseInt(hpSlider.max);
        const current = parseInt(hpSlider.value);
        if (current >= max) {
            showQuickMessage('Already at full HP!');
            return;
        }
        const newValue = Math.min(max, current + 1);
        hpSlider.value = newValue;
        hpSlider.dispatchEvent(new Event('input'));
        updateStatusBar();
        showQuickMessage(`Healed! HP +1 (now ${newValue}/${max})`);
        // Trigger immediate save
        if (typeof triggerImmediateSave === 'function') triggerImmediateSave();
    }
}

function usePotion() {
    // All potion types
    const potions = [
        { name: 'Adrenaline', slider: 'pot_adrenaline_slider', effect: 'Ignore 1 HP damage', icon: '💉' },
        { name: 'Antidote', slider: 'pot_antidote_slider', effect: 'Halt poison 1 round', icon: '🧪' },
        { name: 'Poison', slider: 'pot_poison_slider', effect: 'Apply 1 HP dmg/round', icon: '☠️' },
        { name: 'Arcane Elixir', slider: 'pot_arcane_slider', effect: '+10 Arcana', icon: '✨' }
    ];

    // Find available potions
    let available = [];
    potions.forEach(p => {
        const slider = document.getElementById(p.slider);
        if (slider && parseInt(slider.value) > 0) {
            p.count = parseInt(slider.value);
            available.push(p);
        }
    });

    if (available.length === 0) {
        showQuickMessage('No potions available!');
        return;
    }

    // Show potion selector popup
    showPotionSelector(available);
}

function showPotionSelector(potions) {
    // Remove existing popup if any
    const existing = document.getElementById('potion-selector-popup');
    if (existing) existing.remove();

    // Create popup
    const popup = document.createElement('div');
    popup.id = 'potion-selector-popup';
    popup.className = 'quick-popup';
    popup.innerHTML = `
        <div class="quick-popup-content">
            <h3>🧪 Choose Potion</h3>
            <div class="potion-options">
                ${potions.map(p => `
                    <button class="potion-option" onclick="consumePotion('${p.slider}', '${p.name}', '${p.effect}')">
                        <span class="potion-icon">${p.icon}</span>
                        <span class="potion-name">${p.name}</span>
                        <span class="potion-count">x${p.count}</span>
                        <small class="potion-effect">${p.effect}</small>
                    </button>
                `).join('')}
            </div>
            <button class="popup-cancel" onclick="closePotionSelector()">Cancel</button>
        </div>
    `;

    document.body.appendChild(popup);

    // Close on click outside
    popup.addEventListener('click', (e) => {
        if (e.target === popup) closePotionSelector();
    });
}

function closePotionSelector() {
    const popup = document.getElementById('potion-selector-popup');
    if (popup) popup.remove();
}

function consumePotion(sliderId, name, effect) {
    const slider = document.getElementById(sliderId);
    if (!slider || parseInt(slider.value) <= 0) {
        showQuickMessage('No more of this potion!');
        closePotionSelector();
        return;
    }

    // Reduce potion count
    slider.value = parseInt(slider.value) - 1;
    slider.dispatchEvent(new Event('input'));

    // Apply special effects
    if (name === 'Arcane Elixir') {
        const arcanaSlider = document.getElementById('arcana_slider');
        if (arcanaSlider && !arcanaSlider.disabled) {
            const max = parseInt(arcanaSlider.max);
            const current = parseInt(arcanaSlider.value);
            arcanaSlider.value = Math.min(max, current + 10);
            arcanaSlider.dispatchEvent(new Event('input'));
            updateStatusBar();
        }
    }

    closePotionSelector();
    showQuickMessage(`Used ${name}! ${effect}`);

    // Trigger immediate save after using potion
    if (typeof triggerImmediateSave === 'function') {
        triggerImmediateSave();
    }
}

// ===========================================
// SPEND/DAMAGE QUICK ACTIONS
// ===========================================

function spendHP() {
    const hpSlider = document.getElementById('hp_slider');
    if (hpSlider) {
        const current = parseInt(hpSlider.value);
        if (current <= 0) {
            showQuickMessage('HP already at 0!');
            return;
        }
        hpSlider.value = current - 1;
        hpSlider.dispatchEvent(new Event('input'));
        updateStatusBar();
        showQuickMessage(`Took damage! HP now ${current - 1}`);
    }
}

function spendArcana() {
    const arcanaSlider = document.getElementById('arcana_slider');
    if (arcanaSlider && !arcanaSlider.disabled) {
        const current = parseInt(arcanaSlider.value);
        if (current <= 0) {
            showQuickMessage('No Arcana left!');
            return;
        }
        arcanaSlider.value = current - 1;
        arcanaSlider.dispatchEvent(new Event('input'));
        updateStatusBar();
        showQuickMessage(`Spent 1 Arcana (now ${current - 1})`);
    } else {
        showQuickMessage('Arcana not available for this class');
    }
}

function spendWillpower() {
    const willSlider = document.getElementById('willpower_slider');
    if (willSlider) {
        const current = parseInt(willSlider.value);
        if (current <= 0) {
            showQuickMessage('No Willpower left!');
            return;
        }
        willSlider.value = current - 1;
        willSlider.dispatchEvent(new Event('input'));
        updateStatusBar();
        showQuickMessage(`Spent 1 Willpower (now ${current - 1})`);
    }
}

function gainHP() {
    const hpSlider = document.getElementById('hp_slider');
    if (hpSlider) {
        const max = parseInt(hpSlider.max);
        const current = parseInt(hpSlider.value);
        if (current >= max) {
            showQuickMessage('HP already at maximum!');
            return;
        }
        hpSlider.value = current + 1;
        hpSlider.dispatchEvent(new Event('input'));
        updateStatusBar();
        showQuickMessage(`Healed +1 HP (now ${current + 1})`);
    }
}

function gainArcana() {
    const arcanaSlider = document.getElementById('arcana_slider');
    if (arcanaSlider && !arcanaSlider.disabled) {
        const max = parseInt(arcanaSlider.max);
        const current = parseInt(arcanaSlider.value);
        if (current >= max) {
            showQuickMessage('Arcana already at maximum!');
            return;
        }
        arcanaSlider.value = current + 1;
        arcanaSlider.dispatchEvent(new Event('input'));
        updateStatusBar();
        showQuickMessage(`Gained +1 Arcana (now ${current + 1})`);
    } else {
        showQuickMessage('Arcana not available for this class');
    }
}

function gainWillpower() {
    const willSlider = document.getElementById('willpower_slider');
    if (willSlider) {
        const max = parseInt(willSlider.max);
        const current = parseInt(willSlider.value);
        if (current >= max) {
            showQuickMessage('Willpower already at maximum!');
            return;
        }
        willSlider.value = current + 1;
        willSlider.dispatchEvent(new Event('input'));
        updateStatusBar();
        showQuickMessage(`Gained +1 Willpower (now ${current + 1})`);
    }
}

function removeBleed() {
    const bleedSlider = document.getElementById('bleed_slider');
    if (bleedSlider) {
        const current = parseInt(bleedSlider.value);
        if (current <= 0) {
            showQuickMessage('No bleeding to remove!');
            return;
        }
        bleedSlider.value = current - 1;
        bleedSlider.dispatchEvent(new Event('input'));
        updateStatusBar();
        showQuickMessage(`Bleeding -1 (now ${current - 1})`);
    }
}

function removeWeakened() {
    const weakSlider = document.getElementById('weakened_slider');
    if (weakSlider) {
        const current = parseInt(weakSlider.value);
        if (current <= 0) {
            showQuickMessage('No exhaustion to remove!');
            return;
        }
        weakSlider.value = current - 1;
        weakSlider.dispatchEvent(new Event('input'));
        updateStatusBar();
        showQuickMessage(`Exhaustion -1 (now ${current - 1})`);
    }
}

function addBleed() {
    const bleedSlider = document.getElementById('bleed_slider');
    if (bleedSlider) {
        const max = parseInt(bleedSlider.max);
        const current = parseInt(bleedSlider.value);
        if (current >= max) {
            showQuickMessage('Maximum bleeding reached!');
            return;
        }
        bleedSlider.value = current + 1;
        bleedSlider.dispatchEvent(new Event('input'));
        updateStatusBar();
        showQuickMessage(`Bleeding +1 (now ${current + 1})`);
    }
}

function addWeakened() {
    const weakSlider = document.getElementById('weakened_slider');
    if (weakSlider) {
        const max = parseInt(weakSlider.max);
        const current = parseInt(weakSlider.value);
        if (current >= max) {
            showQuickMessage('Maximum exhaustion reached!');
            return;
        }
        weakSlider.value = current + 1;
        weakSlider.dispatchEvent(new Event('input'));
        updateStatusBar();
        showQuickMessage(`Exhaustion +1 (now ${current + 1})`);
    }
}

function adjustWorthiness(amount) {
    const worthSlider = document.getElementById('worthiness_slider');
    if (worthSlider) {
        const min = parseInt(worthSlider.min) || -10;
        const max = parseInt(worthSlider.max) || 10;
        const current = parseInt(worthSlider.value);
        const newValue = Math.max(min, Math.min(max, current + amount));

        if (newValue === current) {
            showQuickMessage(amount > 0 ? 'Maximum worthiness!' : 'Minimum worthiness!');
            return;
        }

        worthSlider.value = newValue;
        worthSlider.dispatchEvent(new Event('input'));
        updateStatusBar();

        const sign = newValue >= 0 ? '+' : '';
        showQuickMessage(`Worthiness ${amount > 0 ? '+1' : '-1'} (now ${sign}${newValue})`);
    }
}

function showQuickMessage(message) {
    // Create toast notification
    let toast = document.getElementById('quick-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'quick-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            font-size: 0.9rem;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';

    setTimeout(() => {
        toast.style.opacity = '0';
    }, 2500);
}

// ===========================================
// EQUIPMENT DAMAGE QUICK ACTIONS
// ===========================================

function quickArmorDmg(slot, amount) {
    let dmgField, hpField, brokenCheckbox, rowId, label;

    if (slot === 'shield') {
        dmgField = document.getElementById('shield_dmg_taken');
        hpField = document.getElementById('shield_hp');
        brokenCheckbox = document.getElementById('shield_broken');
        rowId = 'quick-shield-row';
        label = 'Shield';
    } else {
        // armor_1 through armor_5
        dmgField = document.getElementById(`${slot}_dmg`);
        hpField = document.getElementById(`${slot}_hp`);
        brokenCheckbox = document.getElementById(`${slot}_broken`);
        rowId = `quick-${slot.replace('_', '-')}-row`;
        const slotLabels = { 'armor_1': 'Head', 'armor_2': 'Shoulders', 'armor_3': 'Chest', 'armor_4': 'Hands', 'armor_5': 'Legs' };
        label = slotLabels[slot] || slot;
    }

    if (!dmgField || !hpField) return;

    const hp = parseInt(hpField.value) || 0;
    const currentDmg = parseInt(dmgField.value) || 0;
    const newDmg = Math.max(0, currentDmg + amount);

    if (amount > 0 && currentDmg >= hp && hp > 0) {
        showQuickMessage(`${label} already broken!`);
        return;
    }

    if (amount < 0 && currentDmg <= 0) {
        showQuickMessage(`${label} has no damage to repair!`);
        return;
    }

    dmgField.value = newDmg;
    dmgField.dispatchEvent(new Event('input'));
    dmgField.dispatchEvent(new Event('change'));

    // Check and update broken status
    if (typeof checkEquipmentBroken === 'function') {
        checkEquipmentBroken(slot === 'shield' ? 'shield_dmg_taken' : `${slot}_dmg`);
    }

    updateQuickEquipment();

    if (amount > 0) {
        showQuickMessage(`${label} took ${amount} damage (${newDmg}/${hp})`);
    } else {
        showQuickMessage(`${label} repaired! (${newDmg}/${hp})`);
    }
}

function updateQuickEquipment() {
    // Update Shield
    const shieldHp = parseInt(document.getElementById('shield_hp')?.value) || 0;
    const shieldDmg = parseInt(document.getElementById('shield_dmg_taken')?.value) || 0;
    const shieldRow = document.getElementById('quick-shield-row');
    const shieldValue = document.getElementById('quick-shield-value');

    if (shieldRow) {
        if (shieldHp > 0) {
            shieldRow.style.display = 'flex';
            if (shieldValue) shieldValue.textContent = `${shieldDmg}/${shieldHp}`;
            updateEquipRowBroken(shieldRow, shieldDmg, shieldHp);
        } else {
            shieldRow.style.display = 'none';
        }
    }

    // Update Armor slots 1-5
    const slotLabels = ['Head', 'Shoulders', 'Chest', 'Hands', 'Legs'];
    for (let i = 1; i <= 5; i++) {
        const hp = parseInt(document.getElementById(`armor_${i}_hp`)?.value) || 0;
        const dmg = parseInt(document.getElementById(`armor_${i}_dmg`)?.value) || 0;
        const row = document.getElementById(`quick-armor-${i}-row`);
        const value = document.getElementById(`quick-armor-${i}-value`);

        if (row) {
            if (hp > 0) {
                row.style.display = 'flex';
                if (value) value.textContent = `${dmg}/${hp}`;
                updateEquipRowBroken(row, dmg, hp);
            } else {
                row.style.display = 'none';
            }
        }
    }

    // Hide section header if no equipment
    const subtitle = document.querySelector('.quick-actions-subtitle');
    const grid = document.getElementById('quick-equipment-grid');
    if (subtitle && grid) {
        const hasVisibleEquip = grid.querySelector('.stat-adjust-row[style*="display: flex"]');
        subtitle.style.display = hasVisibleEquip ? 'block' : 'none';
    }
}

function updateEquipRowBroken(row, dmg, hp) {
    if (dmg >= hp && hp > 0) {
        row.classList.add('stat-equip-broken');
    } else {
        row.classList.remove('stat-equip-broken');
    }
}

// ===========================================
// WEAPONS AND ABILITIES DISPLAY
// ===========================================

function updateWeaponsAndAbilities() {
    updateQuickWeapons();
    updateQuickAbilities();
}

function updateQuickWeapons() {
    const container = document.getElementById('quick-weapons-list');
    if (!container) return;

    const weapons = [];

    // Collect equipped weapons (up to 3)
    for (let i = 1; i <= 3; i++) {
        const typeEl = document.getElementById(`weapon_${i}_type`);
        const atkEl = document.getElementById(`weapon_${i}_atk`);
        const dmgEl = document.getElementById(`weapon_${i}_dmg`);
        const rangeEl = document.getElementById(`weapon_${i}_range`);

        const type = typeEl?.value;
        if (type) {
            weapons.push({
                name: type,
                atk: atkEl?.value || '',
                dmg: dmgEl?.value || '',
                range: rangeEl?.value || ''
            });
        }
    }

    if (weapons.length === 0) {
        container.innerHTML = '<p class="empty-state">No weapons equipped</p>';
        return;
    }

    let html = '<div class="quick-weapons-grid">';
    weapons.forEach(w => {
        html += `
            <div class="quick-weapon-card">
                <div class="weapon-name">⚔️ ${w.name}</div>
                <div class="weapon-stats">
                    ${w.atk ? `<span class="weapon-stat"><span class="stat-label">ATK</span> ${w.atk}</span>` : ''}
                    ${w.dmg ? `<span class="weapon-stat"><span class="stat-label">DMG</span> ${w.dmg}</span>` : ''}
                    ${w.range ? `<span class="weapon-stat"><span class="stat-label">RNG</span> ${w.range}</span>` : ''}
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

function updateQuickAbilities() {
    const container = document.getElementById('quick-abilities-list');
    if (!container) return;

    const selectedClass = document.getElementById('class')?.value;
    const isConjurer = selectedClass && typeof CLASSES !== 'undefined' && CLASSES[selectedClass] && CLASSES[selectedClass].abilityType === "arcana";
    const maxSpells = selectedClass === 'Mage' ? 10 : 5;

    const abilities = [];

    // Collect selected abilities
    for (let i = 1; i <= maxSpells; i++) {
        const typeEl = document.getElementById(`spell_${i}_type`);
        const arcanaEl = document.getElementById(`spell_${i}_arcana`);
        const gainEl = document.getElementById(`spell_${i}_gain`);
        const weakenedEl = document.getElementById(`spell_${i}_weakened`);

        const name = typeEl?.value;
        if (name) {
            abilities.push({
                name: name,
                cost: isConjurer ? (arcanaEl?.value || '') : '',
                effect: isConjurer ? '' : (arcanaEl?.value || ''),
                gain: gainEl?.value || '',
                weakened: weakenedEl?.value || '',
                isConjurer: isConjurer
            });
        }
    }

    if (abilities.length === 0) {
        container.innerHTML = '<p class="empty-state">No abilities selected</p>';
        return;
    }

    let html = '<div class="quick-abilities-grid">';
    abilities.forEach(a => {
        if (a.isConjurer) {
            // Conjurer: show arcana cost and spelldamage
            html += `
                <div class="quick-ability-card conjurer">
                    <div class="ability-name">✨ ${a.name}</div>
                    <div class="ability-details">
                        ${a.cost ? `<span class="ability-cost">Cost: ${a.cost}</span>` : ''}
                        ${a.weakened ? `<span class="ability-dmg">Dmg: ${a.weakened}</span>` : ''}
                    </div>
                    <div class="ability-check">Check: Arkana + 1D10</div>
                </div>
            `;
        } else {
            // Melee: show effect, gain, and weakened cost
            html += `
                <div class="quick-ability-card melee">
                    <div class="ability-name">💪 ${a.name}</div>
                    <div class="ability-details">
                        ${a.effect ? `<div class="ability-effect">${a.effect}</div>` : ''}
                        ${a.gain ? `<span class="ability-gain">Gain: ${a.gain}</span>` : ''}
                        ${a.weakened ? `<span class="ability-weak">Weak: ${a.weakened}</span>` : ''}
                    </div>
                </div>
            `;
        }
    });
    html += '</div>';
    container.innerHTML = html;
}

// ===========================================
// TOOLS TAB SWITCHING
// ===========================================

function switchToolsTab(tabId) {
    // Remove active from all tabs and content
    document.querySelectorAll('.tools-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tools-content').forEach(content => content.classList.remove('active'));

    // Add active to clicked tab
    event.target.classList.add('active');

    // Show corresponding content
    const content = document.getElementById(tabId);
    if (content) content.classList.add('active');
}

// Tools dice roller (simplified version)
function toolsRollDice() {
    const d10Count = parseInt(document.getElementById('tools-d10-slider')?.value || 0);
    const d12Count = parseInt(document.getElementById('tools-d12-slider')?.value || 0);
    const d20Count = parseInt(document.getElementById('tools-d20-slider')?.value || 0);

    if (d10Count + d12Count + d20Count === 0) {
        showQuickMessage('Select some dice to roll!');
        return;
    }

    let results = [];
    let successes = 0;
    let barelys = 0;

    // Roll d10s
    for (let i = 0; i < d10Count; i++) {
        const roll = Math.floor(Math.random() * 10) + 1;
        if (roll >= 8) successes++;
        else if (roll >= 6) barelys++;
        results.push({ die: 'd10', value: roll });
    }

    // Roll d12s
    for (let i = 0; i < d12Count; i++) {
        const roll = Math.floor(Math.random() * 12) + 1;
        results.push({ die: 'd12', value: roll });
    }

    // Roll d20s
    for (let i = 0; i < d20Count; i++) {
        const roll = Math.floor(Math.random() * 20) + 1;
        results.push({ die: 'd20', value: roll });
    }

    // Show results
    const resultsDiv = document.getElementById('tools-dice-results');
    const contentDiv = document.getElementById('tools-results-content');

    if (resultsDiv && contentDiv) {
        resultsDiv.style.display = 'block';

        let html = `<p style="font-size: 1.2rem; color: var(--accent-gold); margin-bottom: 10px;">
            <strong>Successes: ${successes}</strong> | Barely: ${barelys}
        </p>`;
        html += '<div style="display: flex; flex-wrap: wrap; gap: 8px;">';

        results.forEach(r => {
            let color = '#ef4444'; // fail
            if (r.die === 'd10') {
                if (r.value >= 8) color = 'var(--accent-green)';
                else if (r.value >= 6) color = 'var(--accent-blue)';
            }
            html += `<span style="
                display: inline-block;
                padding: 8px 12px;
                background: var(--bg-highlight);
                border: 2px solid ${color};
                border-radius: 6px;
                color: ${color};
                font-weight: bold;
            ">${r.die}: ${r.value}</span>`;
        });

        html += '</div>';
        contentDiv.innerHTML = html;
    }
}

// ===========================================
// GEAR PAGE SETUP
// ===========================================

function initGearPage() {
    // Initialize inventory fields in Gear page
    const gearInvContainer = document.getElementById('gear-inventory-container');
    const gearRemContainer = document.getElementById('gear-reminders-container');

    if (gearInvContainer && gearInvContainer.children.length === 0) {
        for (let i = 1; i <= 10; i++) {
            const fieldGroup = document.createElement('div');
            fieldGroup.className = 'field-group';
            fieldGroup.innerHTML = `
                <label>Item ${i}</label>
                <input type="text" id="inventory_${i}" placeholder="Item description">
            `;
            gearInvContainer.appendChild(fieldGroup);
        }
    }

    if (gearRemContainer && gearRemContainer.children.length === 0) {
        for (let i = 1; i <= 10; i++) {
            const fieldGroup = document.createElement('div');
            fieldGroup.className = 'field-group';
            fieldGroup.innerHTML = `
                <label>Reminder ${i}</label>
                <input type="text" id="reminder_${i}" placeholder="Important reminder">
            `;
            gearRemContainer.appendChild(fieldGroup);
        }
    }
}

// ===========================================
// INITIALIZATION
// ===========================================

function initDashboard() {
    // Initialize gear page
    initGearPage();

    // Set up status bar sync with sliders
    const hpSlider = document.getElementById('hp_slider');
    const arcanaSlider = document.getElementById('arcana_slider');
    const willSlider = document.getElementById('willpower_slider');

    if (hpSlider) {
        hpSlider.addEventListener('input', updateStatusBar);
    }
    if (arcanaSlider) {
        arcanaSlider.addEventListener('input', updateStatusBar);
    }
    if (willSlider) {
        willSlider.addEventListener('input', updateStatusBar);
    }

    // Add listeners for new status sliders
    const bleedSlider = document.getElementById('bleed_slider');
    const weakSlider = document.getElementById('weakened_slider');
    const worthSlider = document.getElementById('worthiness_slider');

    if (bleedSlider) {
        bleedSlider.addEventListener('input', updateStatusBar);
    }
    if (weakSlider) {
        weakSlider.addEventListener('input', updateStatusBar);
    }
    if (worthSlider) {
        worthSlider.addEventListener('input', updateStatusBar);
    }

    // Set up dashboard updates when fields change
    const watchFields = ['character_name', 'race', 'class', 'religion',
                         'strength_value', 'dexterity_value', 'toughness_value',
                         'intelligence_value', 'wisdom_value', 'force_of_will_value'];

    watchFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', updateDashboard);
            field.addEventListener('input', updateDashboard);
        }
    });

    // Tools dice sliders
    ['tools-d10-slider', 'tools-d12-slider', 'tools-d20-slider'].forEach(sliderId => {
        const slider = document.getElementById(sliderId);
        if (slider) {
            slider.addEventListener('input', () => {
                const countId = sliderId.replace('-slider', '-count');
                const countEl = document.getElementById(countId);
                if (countEl) countEl.textContent = slider.value;
            });
        }
    });

    // Add listeners for sidebar sync
    const sidebarWatchFields = [
        'character_name', 'race', 'class',
        // Core attributes
        'strength_value', 'dexterity_value', 'toughness_value',
        'intelligence_value', 'wisdom_value', 'force_of_will_value',
        // Strength skills
        'strength_athletics', 'strength_raw_power', 'strength_unarmed',
        // Dexterity skills
        'dexterity_endurance', 'dexterity_acrobatics', 'dexterity_sleight_of_hand', 'dexterity_stealth',
        // Intelligence skills
        'intelligence_arcana', 'intelligence_history', 'intelligence_investigation', 'intelligence_nature', 'intelligence_religion',
        // Wisdom skills
        'wisdom_luck', 'wisdom_animal_handling', 'wisdom_insight', 'wisdom_medicine', 'wisdom_perception', 'wisdom_survival',
        // Force of Will skills
        'force_of_will_deception', 'force_of_will_intimidation', 'force_of_will_performance', 'force_of_will_persuasion',
        // Toughness skills
        'toughness_bonus_while_injured', 'toughness_resistance'
    ];

    sidebarWatchFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('change', updateDesktopSidebar);
            field.addEventListener('input', updateDesktopSidebar);
        }
    });

    // Add slider listeners for sidebar
    [hpSlider, arcanaSlider, willSlider, bleedSlider, weakSlider, worthSlider].forEach(slider => {
        if (slider) {
            slider.addEventListener('input', updateDesktopSidebar);
        }
    });

    // Initial updates
    setTimeout(() => {
        updateStatusBar();
        updateDashboard();
        updateDesktopSidebar();
    }, 100);
}

// Run init when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboard);
} else {
    initDashboard();
}
