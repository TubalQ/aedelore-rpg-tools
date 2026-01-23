// ===========================================
// SYSTEM SELECTOR - Multi-System RPG Character Sheet
// ===========================================

(function() {
    'use strict';

    const STORAGE_KEY = 'aedelore_selected_system';
    const REMEMBER_KEY = 'aedelore_remember_system';

    // Get selected system from localStorage
    function getSelectedSystem() {
        return localStorage.getItem(STORAGE_KEY);
    }

    // Set selected system in localStorage
    function setSelectedSystem(systemId) {
        localStorage.setItem(STORAGE_KEY, systemId);
    }

    // Check if user wants to remember their choice
    function shouldRememberChoice() {
        return localStorage.getItem(REMEMBER_KEY) === 'true';
    }

    // Create and show the system selector modal
    function showSystemSelector() {
        // Hide the main container until system is selected
        const container = document.querySelector('.container');
        if (container) {
            container.style.display = 'none';
        }

        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'system-selector-modal';
        modal.className = 'modal-overlay';
        modal.style.display = 'flex';

        // Build modal content
        modal.innerHTML = `
            <div class="modal-content system-selector-content">
                <h2>Choose Your RPG System</h2>
                <p class="system-selector-subtitle">Select a game system to customize your character sheet</p>

                <div class="system-cards">
                    ${Object.values(SYSTEM_CONFIGS).map(system => `
                        <button class="system-card" data-system="${system.id}" style="--system-color: ${system.color}">
                            <span class="system-icon">${system.icon}</span>
                            <div class="system-info">
                                <span class="system-name">${system.name}</span>
                                <span class="system-desc">${system.description}</span>
                            </div>
                            <svg class="system-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M9 18l6-6-6-6"/>
                            </svg>
                        </button>
                    `).join('')}
                </div>

                <p class="system-selector-hint">You can change this later from the Menu</p>
            </div>
        `;

        document.body.appendChild(modal);

        // Add click handlers for system cards
        modal.querySelectorAll('.system-card').forEach(card => {
            card.addEventListener('click', function() {
                const systemId = this.dataset.system;
                // Always remember the choice
                localStorage.setItem(REMEMBER_KEY, 'true');
                setSelectedSystem(systemId);
                hideSystemSelector();
                loadSystem(systemId);
            });
        });
    }

    // Hide the system selector modal
    function hideSystemSelector() {
        const modal = document.getElementById('system-selector-modal');
        if (modal) {
            modal.remove();
        }

        const container = document.querySelector('.container');
        if (container) {
            container.style.display = '';
        }
    }

    // Load the appropriate system
    function loadSystem(systemId) {
        const config = SYSTEM_CONFIGS[systemId];

        if (!config) {
            console.error('Unknown system:', systemId);
            return;
        }

        // Update page title
        document.title = `${config.name} Character Sheet`;

        // Update header
        const headerH1 = document.querySelector('header h1');
        if (headerH1) {
            headerH1.innerHTML = `
                ${config.name}
                <span class="subtitle">Interactive Character Sheet</span>
            `;
        }

        // If Aedelore, just show the existing sheet
        if (config.useExistingSheet) {
            // Show the container and initialize Aedelore
            const container = document.querySelector('.container');
            if (container) {
                container.style.display = '';
            }
            // Show sidebar for Aedelore (it's designed for this system)
            const sidebar = document.getElementById('desktop-sidebar');
            const sidebarToggle = document.getElementById('sidebar-toggle');
            if (sidebar) sidebar.style.display = '';
            if (sidebarToggle) sidebarToggle.style.display = '';
            return;
        }

        // For other systems, render the custom sheet
        renderSystemSheet(systemId, config);

        // Hide sidebar for non-Aedelore systems (not compatible)
        const sidebar = document.getElementById('desktop-sidebar');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebar) sidebar.style.display = 'none';
        if (sidebarToggle) sidebarToggle.style.display = 'none';
    }

    // Render a custom character sheet for non-Aedelore systems
    function renderSystemSheet(systemId, config) {
        const container = document.querySelector('.container');
        if (!container) return;

        // Show container
        container.style.display = '';

        // Find the tab container and content areas
        const tabContainer = document.querySelector('.tab-container');
        const tabContents = document.querySelectorAll('.tab-content');

        // Hide all Aedelore-specific tabs and content
        tabContents.forEach(content => {
            content.style.display = 'none';
        });

        // Create new tabs for this system
        const systemTabs = getSystemTabs(systemId, config);

        // Clear and rebuild tab container
        if (tabContainer) {
            tabContainer.innerHTML = systemTabs.tabs;
        }

        // Create content container for the system
        let systemContent = document.getElementById('system-content');
        if (!systemContent) {
            systemContent = document.createElement('div');
            systemContent.id = 'system-content';
            // Insert after tab container
            if (tabContainer) {
                tabContainer.after(systemContent);
            } else {
                container.appendChild(systemContent);
            }
        }

        // Render the system content
        systemContent.innerHTML = systemTabs.content;

        // Initialize the system
        initializeSystem(systemId, config);

        // Set up tab switching
        setupSystemTabs(systemId);

        // Load saved character if exists
        loadSystemCharacter(systemId);
    }

    // Get tabs for a specific system
    function getSystemTabs(systemId, config) {
        let tabs = '';
        let content = '';

        switch (systemId) {
            case 'dnd5e':
                tabs = `
                    <button class="tab active" data-tab="info">Info</button>
                    <button class="tab" data-tab="attributes">Attributes</button>
                    <button class="tab" data-tab="combat">Combat</button>
                    <button class="tab" data-tab="spells">Spells</button>
                    <button class="tab" data-tab="inventory">Inventory</button>
                    <button class="tab" data-tab="dice">Dice</button>
                    <button class="tab" data-tab="rules">Rules</button>
                `;
                content = renderDnD5eSheet(config);
                break;

            case 'pathfinder2e':
                tabs = `
                    <button class="tab active" data-tab="info">Info</button>
                    <button class="tab" data-tab="attributes">Attributes</button>
                    <button class="tab" data-tab="combat">Combat</button>
                    <button class="tab" data-tab="spells">Spells</button>
                    <button class="tab" data-tab="inventory">Inventory</button>
                    <button class="tab" data-tab="dice">Dice</button>
                    <button class="tab" data-tab="rules">Rules</button>
                `;
                content = renderPathfinder2eSheet(config);
                break;

            case 'storyteller':
                tabs = `
                    <button class="tab active" data-tab="info">Info</button>
                    <button class="tab" data-tab="attributes">Attributes</button>
                    <button class="tab" data-tab="abilities">Abilities</button>
                    <button class="tab" data-tab="combat">Combat</button>
                    <button class="tab" data-tab="inventory">Inventory</button>
                    <button class="tab" data-tab="dice">Dice</button>
                    <button class="tab" data-tab="rules">Rules</button>
                `;
                content = renderStorytellerSheet(config);
                break;

            case 'cod':
                tabs = `
                    <button class="tab active" data-tab="info">Info</button>
                    <button class="tab" data-tab="attributes">Attributes</button>
                    <button class="tab" data-tab="skills">Skills</button>
                    <button class="tab" data-tab="combat">Combat</button>
                    <button class="tab" data-tab="inventory">Inventory</button>
                    <button class="tab" data-tab="dice">Dice</button>
                    <button class="tab" data-tab="rules">Rules</button>
                `;
                content = renderCoDSheet(config);
                break;

            default:
                tabs = '<button class="tab active" data-tab="info">Info</button>';
                content = '<div class="tab-content active" id="system-info"><p>System not implemented yet.</p></div>';
        }

        return { tabs, content };
    }

    // Set up tab switching for system sheets
    function setupSystemTabs(systemId) {
        const tabs = document.querySelectorAll('.tab-container .tab');
        const contents = document.querySelectorAll('#system-content .tab-content');

        tabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetTab = this.dataset.tab;

                // Update active tab
                tabs.forEach(t => t.classList.remove('active'));
                this.classList.add('active');

                // Show target content
                contents.forEach(c => {
                    c.classList.remove('active');
                    c.style.display = 'none';
                });

                const targetContent = document.getElementById(`system-${targetTab}`);
                if (targetContent) {
                    targetContent.classList.add('active');
                    targetContent.style.display = 'block';
                }
            });
        });

        // Show first tab content
        if (contents.length > 0) {
            contents[0].style.display = 'block';
        }
    }

    // Initialize system-specific functionality
    function initializeSystem(systemId, config) {
        // Call system-specific initializer
        switch (systemId) {
            case 'dnd5e':
                if (typeof initializeDnD5e === 'function') initializeDnD5e();
                break;
            case 'pathfinder2e':
                if (typeof initializePF2e === 'function') initializePF2e();
                break;
            case 'storyteller':
                if (typeof initializeST === 'function') initializeST();
                break;
            case 'cod':
                if (typeof initializeCoD === 'function') initializeCoD();
                break;
        }

        // Set up auto-save
        setupAutoSave(systemId);

        // Calculate derived stats
        calculateDerivedStats(systemId, config);

        // Set up input listeners for derived stat updates
        setupDerivedStatListeners(systemId, config);
    }

    // Auto-save functionality
    function setupAutoSave(systemId) {
        setInterval(() => {
            saveSystemCharacter(systemId);
        }, 30000); // Save every 30 seconds
    }

    // Save character data for a specific system
    function saveSystemCharacter(systemId) {
        const data = collectSystemData(systemId);
        data._system = systemId;
        data._timestamp = new Date().toISOString();

        localStorage.setItem(`aedelore_character_${systemId}_autosave`, JSON.stringify(data));
    }

    // Load character data for a specific system
    function loadSystemCharacter(systemId) {
        const savedData = localStorage.getItem(`aedelore_character_${systemId}_autosave`);
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                populateSystemData(systemId, data);
            } catch (e) {
                console.error('Failed to load saved character:', e);
            }
        }
    }

    // Collect all form data for a system
    function collectSystemData(systemId) {
        const data = {};
        const container = document.getElementById('system-content');
        if (!container) return data;

        // Collect all inputs, selects, textareas
        container.querySelectorAll('input, select, textarea').forEach(field => {
            if (field.id) {
                if (field.type === 'checkbox') {
                    data[field.id] = field.checked;
                } else if (field.type === 'number' || field.type === 'range') {
                    data[field.id] = parseFloat(field.value) || 0;
                } else {
                    data[field.id] = field.value;
                }
            }
        });

        // Collect dot ratings (WoD-style)
        container.querySelectorAll('.wod-dots').forEach(rating => {
            const id = rating.dataset.id;
            if (id) {
                const value = rating.dataset.value || 0;
                data[id] = parseInt(value);
            }
        });

        return data;
    }

    // Populate form fields from saved data
    function populateSystemData(systemId, data) {
        const container = document.getElementById('system-content');
        if (!container) return;

        Object.entries(data).forEach(([key, value]) => {
            if (key.startsWith('_')) return; // Skip metadata

            const field = container.querySelector(`#${key}`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = value;
                } else {
                    field.value = value;
                }
            }

            // Handle dot ratings (WoD-style)
            const wodDots = container.querySelector(`.wod-dots[data-id="${key}"]`);
            if (wodDots) {
                setWodDotRating(wodDots, value);
            }
        });

        // Recalculate derived stats
        const config = SYSTEM_CONFIGS[systemId];
        calculateDerivedStats(systemId, config);
    }

    // Calculate derived stats based on system rules
    function calculateDerivedStats(systemId, config) {
        if (!config.derivedStats) return;

        config.derivedStats.forEach(stat => {
            const result = evaluateFormula(stat.formula, systemId);
            const display = document.getElementById(`${stat.id}-display`);
            if (display) {
                display.textContent = result;
            }
        });
    }

    // Safe math expression evaluator (no eval())
    function safeMathEval(expr) {
        // Only allow: numbers, operators, parentheses, decimal points, spaces
        const sanitized = expr.replace(/\s+/g, '');
        if (!/^[\d+\-*/%().]+$/.test(sanitized)) {
            console.error('Invalid math expression:', expr);
            return 0;
        }

        // Use Function with strict number-only parsing
        try {
            // Tokenize and validate each part
            const tokens = sanitized.match(/(\d+\.?\d*|[+\-*/%()])/g);
            if (!tokens) return 0;

            // Rebuild expression from validated tokens
            const safeExpr = tokens.join('');

            // Use Function constructor (safer than eval, still sandboxed to expression)
            const result = new Function('return ' + safeExpr)();
            return typeof result === 'number' && isFinite(result) ? result : 0;
        } catch (e) {
            return 0;
        }
    }

    // Evaluate a formula like "resolve + composure"
    function evaluateFormula(formula, systemId) {
        const container = document.getElementById('system-content');
        if (!container) return 0;

        // Replace attribute names with values
        let expression = formula;

        // Handle floor() function
        const floorMatch = expression.match(/floor\(([^)]+)\)/);
        if (floorMatch) {
            const innerResult = evaluateFormula(floorMatch[1], systemId);
            expression = expression.replace(floorMatch[0], Math.floor(innerResult));
        }

        // Handle ceil() function
        const ceilMatch = expression.match(/ceil\(([^)]+)\)/);
        if (ceilMatch) {
            const innerResult = evaluateFormula(ceilMatch[1], systemId);
            expression = expression.replace(ceilMatch[0], Math.ceil(innerResult));
        }

        // Handle round() function
        const roundMatch = expression.match(/round\(([^)]+)\)/);
        if (roundMatch) {
            const innerResult = evaluateFormula(roundMatch[1], systemId);
            expression = expression.replace(roundMatch[0], Math.round(innerResult));
        }

        // Handle min() function
        const minMatch = expression.match(/min\((\w+),\s*(\w+)\)/);
        if (minMatch) {
            const val1 = getFieldValue(minMatch[1], container);
            const val2 = getFieldValue(minMatch[2], container);
            expression = expression.replace(minMatch[0], Math.min(val1, val2));
        }

        // Handle max() function
        const maxMatch = expression.match(/max\((\w+),\s*(\w+)\)/);
        if (maxMatch) {
            const val1 = getFieldValue(maxMatch[1], container);
            const val2 = getFieldValue(maxMatch[2], container);
            expression = expression.replace(maxMatch[0], Math.max(val1, val2));
        }

        // Replace remaining attribute names with values
        const words = expression.match(/[a-z_]+/g) || [];
        words.forEach(word => {
            const value = getFieldValue(word, container);
            expression = expression.replace(new RegExp(`\\b${word}\\b`), value);
        });

        // Use safe math evaluator instead of eval()
        try {
            return safeMathEval(expression);
        } catch (e) {
            console.error('Formula evaluation error:', formula, e);
            return 0;
        }
    }

    // Get field value from container
    function getFieldValue(fieldName, container) {
        // Try direct ID
        let field = container.querySelector(`#${fieldName}`);
        if (field) {
            return parseFloat(field.value) || 0;
        }

        // Try with system prefix
        field = container.querySelector(`#attr_${fieldName}`);
        if (field) {
            return parseFloat(field.value) || 0;
        }

        // Try dot rating (both styles)
        const dotRating = container.querySelector(`.dot-rating[data-id="${fieldName}"]`);
        if (dotRating) {
            return parseInt(dotRating.dataset.value) || 0;
        }

        // Try WoD-style dots
        const wodDots = container.querySelector(`.wod-dots[data-id="${fieldName}"]`);
        if (wodDots) {
            return parseInt(wodDots.dataset.value) || 0;
        }

        return 0;
    }

    // Set WoD dot rating value
    function setWodDotRating(ratingElement, value) {
        ratingElement.dataset.value = value;
        const dots = ratingElement.querySelectorAll('.wod-dot');
        dots.forEach((dot, index) => {
            if (index < value) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    // Set up listeners for derived stat updates
    function setupDerivedStatListeners(systemId, config) {
        if (!config.derivedStats) return;

        const container = document.getElementById('system-content');
        if (!container) return;

        // Listen to all inputs and dot ratings
        container.querySelectorAll('input, select').forEach(field => {
            field.addEventListener('change', () => {
                calculateDerivedStats(systemId, config);
            });
            field.addEventListener('input', () => {
                calculateDerivedStats(systemId, config);
            });
        });
    }

    // Create a dot rating component (1-5 dots)
    function createDotRating(id, name, maxDots = 5, currentValue = 0) {
        let dots = '';
        for (let i = 1; i <= maxDots; i++) {
            const filled = i <= currentValue ? 'filled' : '';
            dots += `<span class="dot ${filled}" data-value="${i}"></span>`;
        }

        return `
            <div class="dot-rating-container">
                <label>${name}</label>
                <div class="dot-rating" data-id="${id}" data-value="${currentValue}" data-max="${maxDots}">
                    ${dots}
                </div>
            </div>
        `;
    }

    // Set dot rating value
    function setDotRating(ratingElement, value) {
        ratingElement.dataset.value = value;
        const dots = ratingElement.querySelectorAll('.dot');
        dots.forEach((dot, index) => {
            if (index < value) {
                dot.classList.add('filled');
            } else {
                dot.classList.remove('filled');
            }
        });
    }

    // Initialize dot rating click handlers
    function initializeDotRatings() {
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('dot')) {
                const value = parseInt(e.target.dataset.value);
                const rating = e.target.closest('.dot-rating');
                if (rating) {
                    // Toggle: clicking same value clears it
                    const currentValue = parseInt(rating.dataset.value) || 0;
                    const newValue = (value === currentValue) ? value - 1 : value;
                    setDotRating(rating, newValue);

                    // Trigger change event
                    rating.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });
    }

    // Show system change dialog
    function showChangeSystemDialog() {
        if (confirm('Change system? Any unsaved changes will be lost.')) {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(REMEMBER_KEY);
            location.reload();
        }
    }

    // Initialize on page load
    function init() {
        // Initialize dot ratings
        initializeDotRatings();

        // Check if system is already selected
        const selectedSystem = getSelectedSystem();

        if (selectedSystem) {
            // Load the selected system directly (always remember choice)
            loadSystem(selectedSystem);
        } else {
            // Show system selector only on first visit
            showSystemSelector();
        }

        // Add "Change System" to menu if not already there
        addChangeSystemMenuItem();

        // Check for pending character to load (after system switch)
        const pendingCharId = localStorage.getItem('aedelore_pending_character_id');
        if (pendingCharId) {
            localStorage.removeItem('aedelore_pending_character_id');
            // Wait for page to fully load, then load the character
            setTimeout(() => {
                if (typeof loadCharacterById === 'function') {
                    loadCharacterById(parseInt(pendingCharId));
                }
            }, 500);
        }
    }

    // Add change system menu item
    function addChangeSystemMenuItem() {
        const menuDropdown = document.querySelector('#menu-dropdown .dropdown-menu');
        if (menuDropdown && !document.getElementById('change-system-btn')) {
            const divider = document.createElement('div');
            divider.className = 'dropdown-divider';

            const btn = document.createElement('button');
            btn.id = 'change-system-btn';
            btn.className = 'dropdown-item';
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9"/>
                </svg>
                Change System
            `;
            btn.onclick = function() {
                closeDropdowns();
                showChangeSystemDialog();
            };

            menuDropdown.appendChild(divider);
            menuDropdown.appendChild(btn);
        }
    }

    // Export functions for external use
    window.SystemSelector = {
        show: showSystemSelector,
        hide: hideSystemSelector,
        getSelected: getSelectedSystem,
        setSelected: setSelectedSystem,
        loadSystem: loadSystem,
        changeSystem: showChangeSystemDialog,
        saveCharacter: saveSystemCharacter,
        loadCharacter: loadSystemCharacter,
        createDotRating: createDotRating,
        setDotRating: setDotRating
    };

    // Run init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
