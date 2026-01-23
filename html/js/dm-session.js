// ============================================
// Aedelore DM Session Tool - JavaScript
// ============================================

// Global state
let authToken = localStorage.getItem('aedelore_auth_token');
let currentCampaignId = null;
let currentCampaignName = '';
let currentCampaignDescription = '';
let currentSessionId = null;
let isSessionLocked = false;
let isEditingCampaign = false;
let allCampaigns = []; // Store all campaigns for dashboard
let joinedCampaigns = []; // Campaigns the user has joined as a player
let viewingAsPlayer = false; // Whether we're in player view mode
let playerCampaignId = null; // Current player campaign being viewed

// Session data structure
let sessionData = getEmptySessionData();

// ============================================
// View State Persistence (survive page refresh)
// ============================================
function saveViewState() {
    const state = {
        viewingAsPlayer,
        playerCampaignId,
        currentCampaignId,
        currentSessionId
    };
    localStorage.setItem('aedelore_dm_view_state', JSON.stringify(state));
}

function clearViewState() {
    localStorage.removeItem('aedelore_dm_view_state');
}

async function restoreViewState() {
    const saved = localStorage.getItem('aedelore_dm_view_state');
    if (!saved) return false;

    try {
        const state = JSON.parse(saved);

        // Restore player view
        if (state.viewingAsPlayer && state.playerCampaignId) {
            // Verify the campaign still exists in joined campaigns
            const campaign = joinedCampaigns.find(c => c.id === state.playerCampaignId);
            if (campaign) {
                await openPlayerCampaignView(state.playerCampaignId);
                return true;
            }
        }

        // Restore DM session view
        if (state.currentCampaignId && state.currentSessionId) {
            // Verify the campaign still exists
            const campaign = allCampaigns.find(c => c.id === state.currentCampaignId);
            if (campaign) {
                await openSession(state.currentCampaignId, state.currentSessionId);
                return true;
            }
        }
    } catch (e) {
        console.error('Error restoring view state:', e);
        clearViewState();
    }

    return false;
}

// ============================================
// Theme Functions
// ============================================
const THEMES = ['aedelore', 'dark-glass', 'midnight', 'ember'];
const THEME_COLORS = {
    'aedelore': '#8b5cf6',
    'dark-glass': '#1a1a1f',
    'midnight': '#0a1628',
    'ember': '#1a0c08'
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

// Mobile menu toggle
function toggleMobileMenu() {
    const actions = document.getElementById('mobile-actions');
    const closeBtn = document.getElementById('mobile-menu-close');

    if (actions.classList.contains('mobile-open')) {
        actions.classList.remove('mobile-open');
        closeBtn.classList.remove('visible');
        document.body.style.overflow = '';
    } else {
        actions.classList.add('mobile-open');
        closeBtn.classList.add('visible');
        document.body.style.overflow = 'hidden';
    }
}

// Close mobile menu when clicking a button inside it
function closeMobileMenuOnAction() {
    if (window.innerWidth <= 768) {
        const actions = document.getElementById('mobile-actions');
        const closeBtn = document.getElementById('mobile-menu-close');
        if (actions && actions.classList.contains('mobile-open')) {
            actions.classList.remove('mobile-open');
            closeBtn.classList.remove('visible');
            document.body.style.overflow = '';
        }
    }
}

// Setup mobile menu event delegation
function setupMobileMenuCloseOnClick() {
    const actions = document.getElementById('mobile-actions');
    if (actions) {
        actions.addEventListener('click', function(e) {
            if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                closeMobileMenuOnAction();
            }
        });
    }
}

// ============================================
// HEADER DROPDOWN MENUS
// ============================================

function toggleHeaderDropdown(dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    const trigger = dropdown.previousElementSibling;
    const isOpen = dropdown.classList.contains('open');

    // Close all other dropdowns first
    closeAllHeaderDropdowns();

    // Toggle this dropdown
    if (!isOpen) {
        dropdown.classList.add('open');
        trigger.classList.add('open');
    }
}

function closeAllHeaderDropdowns() {
    document.querySelectorAll('.header-dropdown-menu').forEach(menu => {
        menu.classList.remove('open');
    });
    document.querySelectorAll('.header-dropdown-trigger').forEach(trigger => {
        trigger.classList.remove('open');
    });
}

// Close dropdowns when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.header-dropdown')) {
        closeAllHeaderDropdowns();
    }
});

// Close dropdowns on Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        closeAllHeaderDropdowns();
    }
});

function getEmptySessionData() {
    return {
        // Adventure goal - the constant
        hook: '',

        // Session prolog - recap of previous session, sets the scene
        prolog: '',

        // Players (kept for tracking who played)
        players: [],

        // NPCs with planning + live tracking
        npcs: [], // { name, role, description, plannedLocation, actualLocation, disposition, status: 'unused'|'used', day, notes }

        // Places/Locations
        places: [], // { name, description, visited: false, day, notes }

        // Combat Encounters with status
        encounters: [], // { name, location, enemies: [], tactics, loot, status: 'planned'|'started'|'completed', day, notes }

        // Items/Clues with tracking
        items: [], // { name, description, plannedLocation, actualLocation, found: false, givenTo, day, notes }

        // Read-aloud text with read tracking
        readAloud: [], // { title, text, read: false, day }

        // Event log - chronological events during play
        eventLog: [], // { timestamp, text }

        // Turning points - key decisions/moments
        turningPoints: [], // { description, consequence }

        // Session notes (post-session)
        sessionNotes: {
            summary: '',
            wentWell: '',
            improve: '',
            followUp: ''
        },

        // Legacy fields for backwards compatibility
        scenes: [],
        decisionPoints: [],
        keyItems: [],
        combatEncounters: [],
        readAloudText: [],
        lootRewards: []
    };
}

// ============================================
// Authentication
// ============================================

function updateAuthUI() {
    const loginBtn = document.getElementById('server-login-btn');
    const logoutBtn = document.getElementById('server-logout-btn');
    const passwordBtn = document.getElementById('change-password-btn');
    const saveBtn = document.getElementById('save-btn');
    const loginRequired = document.getElementById('login-required');
    const dashboard = document.getElementById('dashboard');
    const sidebar = document.getElementById('dm-desktop-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');

    const myDataBtn = document.getElementById('my-data-btn');
    const trashBtn = document.getElementById('trash-btn');

    if (authToken) {
        if (loginBtn) loginBtn.style.display = 'none';
        if (logoutBtn) logoutBtn.style.display = 'inline-flex';
        if (passwordBtn) passwordBtn.style.display = 'inline-flex';
        if (myDataBtn) myDataBtn.style.display = 'inline-flex';
        if (trashBtn) trashBtn.style.display = 'inline-flex';
        if (saveBtn) saveBtn.style.display = 'inline-flex';
        if (loginRequired) loginRequired.style.display = 'none';
        // Show sidebar when logged in
        if (sidebar) sidebar.classList.add('auth-visible');
        if (sidebarToggle) sidebarToggle.style.display = '';
        loadCampaignsAndShowDashboard();
    } else {
        if (loginBtn) loginBtn.style.display = 'inline-flex';
        if (logoutBtn) logoutBtn.style.display = 'none';
        if (passwordBtn) passwordBtn.style.display = 'none';
        if (myDataBtn) myDataBtn.style.display = 'none';
        if (trashBtn) trashBtn.style.display = 'none';
        if (saveBtn) saveBtn.style.display = 'none';
        if (loginRequired) loginRequired.style.display = 'block';
        if (dashboard) dashboard.style.display = 'none';
        // Hide sidebar when logged out
        if (sidebar) sidebar.classList.remove('auth-visible');
        if (sidebarToggle) sidebarToggle.style.display = 'none';
        hideSessionContent();
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
        submitBtn.onclick = doLogin;
        toggleText.innerHTML = 'No account? <a href="#" onclick="showAuthModal(\'register\'); return false;">Register here</a>';
    } else {
        title.textContent = 'Register';
        submitBtn.textContent = 'Register';
        submitBtn.onclick = doRegister;
        toggleText.innerHTML = 'Have an account? <a href="#" onclick="showAuthModal(\'login\'); return false;">Login here</a>';
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
        hideAuthModal();
        updateAuthUI();
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
        hideAuthModal();
        updateAuthUI();
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
    } catch (e) {}

    authToken = null;
    currentCampaignId = null;
    currentCampaignName = '';
    currentSessionId = null;
    localStorage.removeItem('aedelore_auth_token');
    updateAuthUI();
}

// ============================================
// Password Change
// ============================================

function showPasswordModal() {
    const currentInput = document.getElementById('current-password');
    const newInput = document.getElementById('new-password');
    const confirmInput = document.getElementById('confirm-password');

    currentInput.value = '';
    newInput.value = '';
    confirmInput.value = '';
    document.getElementById('password-error').textContent = '';

    // Handle Enter key on inputs
    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            changePassword();
        }
    };
    currentInput.onkeydown = handleEnter;
    newInput.onkeydown = handleEnter;
    confirmInput.onkeydown = handleEnter;

    document.getElementById('password-modal').style.display = 'flex';
    currentInput.focus();
}

function hidePasswordModal() {
    document.getElementById('password-modal').style.display = 'none';
}

async function changePassword() {
    const currentPassword = document.getElementById('current-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const errorEl = document.getElementById('password-error');

    if (!currentPassword || !newPassword || !confirmPassword) {
        errorEl.textContent = 'Please fill in all fields';
        return;
    }

    if (newPassword !== confirmPassword) {
        errorEl.textContent = 'New passwords do not match';
        return;
    }

    if (newPassword.length < 8) {
        errorEl.textContent = 'New password must be at least 8 characters';
        return;
    }

    try {
        const res = await fetch('/api/account/password', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.error || 'Failed to change password';
            return;
        }

        alert('Password changed successfully!');
        hidePasswordModal();
    } catch (error) {
        errorEl.textContent = 'Connection error. Please try again.';
    }
}

// ============================================
// My Data Modal
// ============================================

async function showMyDataModal() {
    const modal = document.getElementById('mydata-modal');
    const content = document.getElementById('mydata-content');

    content.innerHTML = '<p style="color: var(--text-muted);">Loading...</p>';
    modal.style.display = 'flex';

    try {
        const res = await fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) {
            content.innerHTML = '<p style="color: var(--accent-red);">Failed to load data</p>';
            return;
        }

        const data = await res.json();

        // Format the date
        const createdDate = new Date(data.createdAt).toLocaleDateString();

        content.innerHTML = `
            <div style="margin-bottom: var(--space-6);">
                <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
                    <div style="width: 50px; height: 50px; background: linear-gradient(135deg, var(--accent-purple), var(--accent-blue)); border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    </div>
                    <div>
                        <h3 style="margin: 0; color: var(--text-base);">${escapeHtml(data.username)}</h3>
                        <p style="margin: 0; font-size: 0.85rem; color: var(--text-muted);">Member since ${createdDate}</p>
                    </div>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-3); margin-bottom: var(--space-6);">
                <div style="background: var(--bg-elevated); padding: var(--space-4); border-radius: var(--radius-lg); text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--accent-cyan);">${data.stats.campaigns}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Campaigns</div>
                </div>
                <div style="background: var(--bg-elevated); padding: var(--space-4); border-radius: var(--radius-lg); text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--accent-purple);">${data.stats.sessions}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Sessions</div>
                </div>
                <div style="background: var(--bg-elevated); padding: var(--space-4); border-radius: var(--radius-lg); text-align: center;">
                    <div style="font-size: 1.5rem; font-weight: 600; color: var(--accent-green);">${data.stats.characters}</div>
                    <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;">Characters</div>
                </div>
            </div>

            ${data.campaigns.length > 0 ? `
                <div style="margin-bottom: var(--space-4);">
                    <h4 style="color: var(--text-subdued); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-2);">Campaigns</h4>
                    <div style="background: var(--bg-elevated); border-radius: var(--radius-lg); overflow: hidden;">
                        ${data.campaigns.map(c => `
                            <div style="padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: var(--text-base);">${escapeHtml(c.name)}</span>
                                <span style="color: var(--text-muted); font-size: 0.85rem;">${c.session_count} sessions</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            ${data.characters.length > 0 ? `
                <div>
                    <h4 style="color: var(--text-subdued); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-2);">Characters</h4>
                    <div style="background: var(--bg-elevated); border-radius: var(--radius-lg); overflow: hidden;">
                        ${data.characters.map(c => `
                            <div style="padding: var(--space-3) var(--space-4); border-bottom: 1px solid var(--border-subtle); display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: var(--text-base);">${escapeHtml(c.name)}</span>
                                <span style="color: var(--text-muted); font-size: 0.85rem;">${new Date(c.updatedAt).toLocaleDateString()}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            ` : ''}

            <div style="margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px solid var(--border-subtle);">
                <h4 style="color: var(--text-subdued); font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: var(--space-3);">Privacy Settings</h4>
                <div style="background: var(--bg-elevated); border-radius: var(--radius-lg); padding: var(--space-4);">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
                        <div>
                            <div style="color: var(--text-base); font-weight: 500;">Anonymous Analytics</div>
                            <div style="color: var(--text-muted); font-size: 0.85rem;">Help improve Aedelore by sharing anonymous usage data</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: var(--space-3);">
                            <span id="mydata-analytics-status" style="font-weight: 600; ${window.AedelorePrivacy && window.AedelorePrivacy.getConsent() === true ? 'color: var(--accent-green);' : 'color: var(--text-muted);'}">${window.AedelorePrivacy && window.AedelorePrivacy.getConsent() === true ? 'Enabled' : 'Disabled'}</span>
                            <button onclick="toggleMyDataAnalytics()" style="padding: 6px 12px; border-radius: 6px; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: all 0.2s; border: none; ${window.AedelorePrivacy && window.AedelorePrivacy.getConsent() === true ? 'background: var(--bg-surface); color: var(--text-subdued); border: 1px solid var(--border-default);' : 'background: linear-gradient(135deg, var(--accent-purple) 0%, var(--accent-blue) 100%); color: white;'}">${window.AedelorePrivacy && window.AedelorePrivacy.getConsent() === true ? 'Disable' : 'Enable'}</button>
                        </div>
                    </div>
                    <a onclick="window.AedelorePrivacy && window.AedelorePrivacy.showPrivacyDetails(); hideMyDataModal();" style="color: var(--accent-cyan); font-size: 0.85rem; cursor: pointer;">View privacy details</a>
                </div>
            </div>
        `;
    } catch (error) {
        console.error('My Data error:', error);
        content.innerHTML = '<p style="color: var(--accent-red);">Connection error</p>';
    }
}

function toggleMyDataAnalytics() {
    if (window.AedelorePrivacy) {
        window.AedelorePrivacy.toggleAnalytics();
        // Refresh the My Data modal to show updated status
        showMyDataModal();
    }
}

function hideMyDataModal() {
    document.getElementById('mydata-modal').style.display = 'none';
}

// ============================================
// Trash Modal Functions
// ============================================

async function showDMTrashModal() {
    const modal = document.getElementById('dm-trash-modal');
    modal.style.display = 'flex';
    await Promise.all([loadTrashCampaigns(), loadTrashSessions()]);
}

function hideDMTrashModal() {
    document.getElementById('dm-trash-modal').style.display = 'none';
}

async function loadTrashCampaigns() {
    const list = document.getElementById('trash-campaigns-list');
    list.innerHTML = '<p class="trash-loading">Loading...</p>';

    try {
        const res = await fetch('/api/trash/campaigns', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) throw new Error('Failed to load trash');

        const campaigns = await res.json();

        if (campaigns.length === 0) {
            list.innerHTML = '<p class="trash-empty">No deleted campaigns</p>';
            return;
        }

        list.innerHTML = campaigns.map(camp => {
            const deletedDate = new Date(camp.deleted_at).toLocaleDateString();
            return `
                <div class="trash-item">
                    <div class="trash-item-info">
                        <span class="trash-item-name">${escapeHtml(camp.name)}</span>
                        <span class="trash-item-date">Deleted: ${deletedDate}</span>
                    </div>
                    <div class="trash-item-actions">
                        <button class="trash-btn trash-btn-restore" onclick="restoreCampaign(${camp.id})" title="Restore">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                            Restore
                        </button>
                        <button class="trash-btn trash-btn-delete" onclick="permanentDeleteCampaign(${camp.id}, '${escapeHtml(camp.name).replace(/'/g, "\\'")}')" title="Delete permanently">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading trash campaigns:', err);
        list.innerHTML = '<p class="trash-error">Failed to load deleted campaigns</p>';
    }
}

async function loadTrashSessions() {
    const list = document.getElementById('trash-sessions-list');
    list.innerHTML = '<p class="trash-loading">Loading...</p>';

    try {
        const res = await fetch('/api/trash/sessions', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) throw new Error('Failed to load trash');

        const sessions = await res.json();

        if (sessions.length === 0) {
            list.innerHTML = '<p class="trash-empty">No deleted sessions</p>';
            return;
        }

        list.innerHTML = sessions.map(sess => {
            const deletedDate = new Date(sess.deleted_at).toLocaleDateString();
            const sessionName = `Session ${sess.session_number}` + (sess.campaign_name ? ` (${sess.campaign_name})` : '');
            return `
                <div class="trash-item">
                    <div class="trash-item-info">
                        <span class="trash-item-name">${escapeHtml(sessionName)}</span>
                        <span class="trash-item-date">Deleted: ${deletedDate}</span>
                    </div>
                    <div class="trash-item-actions">
                        <button class="trash-btn trash-btn-restore" onclick="restoreSession(${sess.id})" title="Restore">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
                            Restore
                        </button>
                        <button class="trash-btn trash-btn-delete" onclick="permanentDeleteSession(${sess.id}, '${escapeHtml(sessionName).replace(/'/g, "\\'")}')" title="Delete permanently">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                            Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Error loading trash sessions:', err);
        list.innerHTML = '<p class="trash-error">Failed to load deleted sessions</p>';
    }
}

async function restoreCampaign(id) {
    try {
        const res = await fetch(`/api/trash/campaigns/${id}/restore`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) throw new Error('Failed to restore');

        alert('Campaign restored successfully!');
        await loadTrashCampaigns();
        await loadCampaigns(); // Refresh campaign list
    } catch (err) {
        console.error('Error restoring campaign:', err);
        alert('Failed to restore campaign');
    }
}

async function permanentDeleteCampaign(id, name) {
    if (!confirm(`Are you sure you want to PERMANENTLY delete "${name}"?\n\nThis will also delete all sessions in this campaign!\n\nThis cannot be undone!`)) {
        return;
    }

    try {
        const res = await fetch(`/api/trash/campaigns/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) throw new Error('Failed to delete');

        alert('Campaign permanently deleted.');
        await loadTrashCampaigns();
    } catch (err) {
        console.error('Error deleting campaign:', err);
        alert('Failed to delete campaign');
    }
}

async function restoreSession(id) {
    try {
        const res = await fetch(`/api/trash/sessions/${id}/restore`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) throw new Error('Failed to restore');

        alert('Session restored successfully!');
        await loadTrashSessions();
        // If we're viewing a campaign, refresh the session list
        if (currentCampaign) {
            await loadCampaignSessions(currentCampaign.id);
        }
    } catch (err) {
        console.error('Error restoring session:', err);
        alert('Failed to restore session');
    }
}

async function permanentDeleteSession(id, name) {
    if (!confirm(`Are you sure you want to PERMANENTLY delete "${name}"?\n\nThis cannot be undone!`)) {
        return;
    }

    try {
        const res = await fetch(`/api/trash/sessions/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) throw new Error('Failed to delete');

        alert('Session permanently deleted.');
        await loadTrashSessions();
    } catch (err) {
        console.error('Error deleting session:', err);
        alert('Failed to delete session');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Dashboard
// ============================================

async function loadCampaignsAndShowDashboard() {
    if (!authToken) return;

    try {
        // Load DM campaigns
        const res = await fetch('/api/campaigns', {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (res.status === 401) {
            authToken = null;
            localStorage.removeItem('aedelore_auth_token');
            updateAuthUI();
            return;
        }

        allCampaigns = await res.json();

        // Fetch sessions for each campaign
        for (let campaign of allCampaigns) {
            try {
                const sessRes = await fetch(`/api/campaigns/${campaign.id}/sessions`, {
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });
                if (sessRes.ok) {
                    campaign.sessions = await sessRes.json();
                } else {
                    campaign.sessions = [];
                }
            } catch (e) {
                campaign.sessions = [];
            }
        }

        // Load joined campaigns (as player)
        try {
            const playerRes = await fetch('/api/player/campaigns', {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (playerRes.ok) {
                joinedCampaigns = await playerRes.json();
            } else {
                joinedCampaigns = [];
            }
        } catch (e) {
            joinedCampaigns = [];
        }

        // Try to restore previous view state (e.g., after page refresh)
        const restored = await restoreViewState();
        if (!restored) {
            showDashboard();
        }

    } catch (error) {
        console.error('Load campaigns error:', error);
    }
}

function showDashboard() {
    // Hide session view
    hideSessionContent();
    document.getElementById('back-to-dashboard').style.display = 'none';

    // Show dashboard
    document.getElementById('dashboard').style.display = 'block';
    renderDashboard();

    // Reset current selection
    currentCampaignId = null;
    currentSessionId = null;

    // Clear saved view state (user explicitly went back to dashboard)
    clearViewState();
}

function renderDashboard() {
    const grid = document.getElementById('campaign-grid');

    let html = '';

    // Render campaign cards
    allCampaigns.forEach(campaign => {
        const sessionCount = campaign.sessions ? campaign.sessions.length : 0;
        const lastSession = campaign.sessions && campaign.sessions.length > 0
            ? campaign.sessions[campaign.sessions.length - 1]
            : null;
        const lastDate = lastSession ? formatDate(lastSession.date) : 'No sessions';

        // Find the last active (unlocked) session for continue button
        const activeSession = campaign.sessions
            ? [...campaign.sessions].reverse().find(s => s.status === 'active')
            : null;

        html += `
            <div class="campaign-card" data-campaign-id="${campaign.id}">
                <div class="campaign-card-header">
                    <h3 class="campaign-card-title">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                        ${escapeHtml(campaign.name)}
                    </h3>
                    <div class="campaign-card-menu">
                        <button class="campaign-card-menu-btn" onclick="toggleCampaignMenu(${campaign.id}, event)">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
                        </button>
                        <div class="campaign-card-dropdown" id="campaign-menu-${campaign.id}">
                            <button onclick="shareCampaignFromDashboard(${campaign.id})">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                                Share
                            </button>
                            <button onclick="editCampaignFromDashboard(${campaign.id})">Edit</button>
                            <button class="danger" onclick="deleteCampaignFromDashboard(${campaign.id})">Delete</button>
                        </div>
                    </div>
                </div>
                <p class="campaign-card-description">${escapeHtml(campaign.description) || 'No description'}</p>
                <div class="campaign-card-stats">
                    <div class="campaign-card-stat">
                        <span class="campaign-card-stat-value">${sessionCount}</span>
                        <span class="campaign-card-stat-label">Sessions</span>
                    </div>
                    <div class="campaign-card-stat">
                        <span class="campaign-card-stat-value">${lastDate}</span>
                        <span class="campaign-card-stat-label">Last Session</span>
                    </div>
                </div>
                ${sessionCount > 0 ? renderSessionChips(campaign) : ''}
                <div class="campaign-card-actions">
                    ${activeSession
                        ? `<button class="campaign-card-btn primary" onclick="openSession(${campaign.id}, ${activeSession.id})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                            Continue
                        </button>`
                        : `<button class="campaign-card-btn primary" onclick="createNewSessionForCampaign(${campaign.id})">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                            New Session
                        </button>`
                    }
                    <button class="campaign-card-btn secondary" onclick="createNewSessionForCampaign(${campaign.id})">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        + Session
                    </button>
                </div>
            </div>
        `;
    });

    // Add "New Campaign" card
    html += `
        <div class="campaign-card new-card" onclick="showNewCampaignModal()">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            <span>New Campaign</span>
        </div>
    `;

    grid.innerHTML = html;

    // Render joined campaigns section
    renderJoinedCampaigns();
}

function renderJoinedCampaigns() {
    let container = document.getElementById('joined-campaigns-section');
    if (!container) {
        // Create the container if it doesn't exist
        const dashboard = document.getElementById('dashboard');
        container = document.createElement('div');
        container.id = 'joined-campaigns-section';
        container.style.marginTop = 'var(--space-8)';
        dashboard.appendChild(container);
    }

    let html = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
            <h2 style="color: var(--text-primary); font-size: 1.2rem; display: flex; align-items: center; gap: 8px;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Joined Campaigns
            </h2>
            <button onclick="showJoinCampaignModal()" style="background: linear-gradient(135deg, var(--primary-purple) 0%, var(--primary-blue) 100%); display: flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                Join Campaign
            </button>
        </div>
    `;

    if (joinedCampaigns.length === 0) {
        html += `
            <div style="background: var(--bg-elevated); border-radius: 12px; padding: var(--space-6); text-align: center; color: var(--text-muted);">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom: var(--space-2); opacity: 0.5;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                <p>No campaigns joined yet</p>
                <p style="font-size: 0.85rem; margin-top: var(--space-2);">Enter a share code to join a campaign and view session summaries.</p>
            </div>
        `;
    } else {
        html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-4);">';

        joinedCampaigns.forEach(campaign => {
            html += `
                <div class="campaign-card player-card" onclick="openPlayerCampaignView(${campaign.id})" style="cursor: pointer; border-left: 3px solid var(--accent-cyan);">
                    <div class="campaign-card-header">
                        <h3 class="campaign-card-title">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                            ${escapeHtml(campaign.name)}
                        </h3>
                        <button class="campaign-card-menu-btn" onclick="leaveCampaign(${campaign.id}, event)" title="Leave campaign" style="color: var(--accent-red);">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        </button>
                    </div>
                    <p class="campaign-card-description" style="font-size: 0.85rem;">${escapeHtml(campaign.description) || 'No description'}</p>
                    <div style="color: var(--text-muted); font-size: 0.8rem; margin-top: var(--space-2);">
                        <span>DM: ${escapeHtml(campaign.dm_name)}</span>
                        <span style="margin-left: var(--space-3);">Joined: ${formatDate(campaign.joined_at)}</span>
                    </div>
                    <div style="margin-top: var(--space-3); display: flex; align-items: center; gap: 6px; color: var(--accent-cyan); font-size: 0.85rem;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        View Summaries
                    </div>
                </div>
            `;
        });

        html += '</div>';
    }

    container.innerHTML = html;
}

function renderSessionChips(campaign) {
    if (!campaign.sessions || campaign.sessions.length === 0) return '';

    const chips = campaign.sessions.slice(-5).map(session => {
        const isLocked = session.status === 'locked';
        const icon = isLocked
            ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>'
            : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>';

        return `<span class="session-chip ${isLocked ? 'locked' : ''}" onclick="openSession(${campaign.id}, ${session.id})" title="${isLocked ? 'Locked' : 'Active'}">
            ${icon} #${session.session_number}
        </span>`;
    }).join('');

    return `
        <div class="campaign-sessions-preview">
            <div class="campaign-sessions-preview-title">Recent Sessions</div>
            ${chips}
        </div>
    `;
}

function formatDate(dateStr) {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function toggleCampaignMenu(campaignId, event) {
    event.stopPropagation();
    // Close all other menus
    closeCampaignMenus();
    // Toggle this menu
    const menu = document.getElementById(`campaign-menu-${campaignId}`);
    menu.classList.toggle('open');
}

function closeCampaignMenus() {
    document.querySelectorAll('.campaign-card-dropdown').forEach(d => d.classList.remove('open'));
}

// Close campaign menus when clicking outside
document.addEventListener('click', function(e) {
    if (!e.target.closest('.campaign-card-menu')) {
        closeCampaignMenus();
    }
});

async function openSession(campaignId, sessionId) {
    // Hide dashboard, show session
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('back-to-dashboard').style.display = 'inline-flex';

    // Find campaign info
    const campaign = allCampaigns.find(c => c.id == campaignId);
    if (campaign) {
        currentCampaignId = campaignId;
        currentCampaignName = campaign.name;
        currentCampaignDescription = campaign.description || '';
    }

    currentSessionId = sessionId;
    await loadSession(sessionId);

    // Save view state for page refresh persistence
    saveViewState();
}

async function createNewSessionForCampaign(campaignId) {
    // Set current campaign
    const campaign = allCampaigns.find(c => c.id == campaignId);
    if (campaign) {
        currentCampaignId = campaignId;
        currentCampaignName = campaign.name;
        currentCampaignDescription = campaign.description || '';
    }

    // Create new session
    await createNewSession();

    // Hide dashboard, show session
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('back-to-dashboard').style.display = 'inline-flex';
}

function editCampaignFromDashboard(campaignId) {
    const campaign = allCampaigns.find(c => c.id == campaignId);
    if (campaign) {
        currentCampaignId = campaignId;
        currentCampaignName = campaign.name;
        currentCampaignDescription = campaign.description || '';
        showEditCampaignModal();
    }
    // Close menu
    document.querySelectorAll('.campaign-card-dropdown').forEach(d => d.classList.remove('open'));
}

async function deleteCampaignFromDashboard(campaignId) {
    const campaign = allCampaigns.find(c => c.id == campaignId);
    if (!campaign) return;

    // Close menu
    document.querySelectorAll('.campaign-card-dropdown').forEach(d => d.classList.remove('open'));

    if (!confirm(`Delete campaign "${campaign.name}" and all its sessions? This cannot be undone.`)) {
        return;
    }

    try {
        const res = await fetch(`/api/campaigns/${campaignId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (res.ok) {
            // Reload dashboard
            await loadCampaignsAndShowDashboard();
        } else {
            alert('Failed to delete campaign');
        }
    } catch (error) {
        console.error('Delete campaign error:', error);
        alert('Error deleting campaign');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// Campaign Management
// ============================================

// Keep loadCampaigns for backwards compatibility but it now just calls the dashboard function
async function loadCampaigns() {
    await loadCampaignsAndShowDashboard();
}

function setupCampaignModalEnterKey() {
    const nameInput = document.getElementById('campaign-name');
    const descInput = document.getElementById('campaign-description');
    const handleEnter = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveCampaign();
        }
    };
    nameInput.onkeydown = handleEnter;
    // Description can be multiline, so only trigger on Enter without Shift
    descInput.onkeydown = handleEnter;
}

function showNewCampaignModal() {
    isEditingCampaign = false;
    document.getElementById('campaign-modal-title').textContent = 'New Campaign';
    document.getElementById('campaign-submit-btn').textContent = 'Create Campaign';
    document.getElementById('campaign-name').value = '';
    document.getElementById('campaign-description').value = '';
    document.getElementById('campaign-error').textContent = '';
    document.getElementById('campaign-modal').style.display = 'flex';
    setupCampaignModalEnterKey();
    document.getElementById('campaign-name').focus();
}

function showEditCampaignModal() {
    if (!currentCampaignId) return;

    isEditingCampaign = true;
    document.getElementById('campaign-modal-title').textContent = 'Edit Campaign';
    document.getElementById('campaign-submit-btn').textContent = 'Save Changes';
    document.getElementById('campaign-name').value = currentCampaignName;
    document.getElementById('campaign-description').value = currentCampaignDescription;
    document.getElementById('campaign-error').textContent = '';
    document.getElementById('campaign-modal').style.display = 'flex';
    setupCampaignModalEnterKey();
    document.getElementById('campaign-name').focus();
}

function hideCampaignModal() {
    document.getElementById('campaign-modal').style.display = 'none';
    isEditingCampaign = false;
}

async function saveCampaign() {
    const name = document.getElementById('campaign-name').value.trim();
    const description = document.getElementById('campaign-description').value.trim();
    const errorEl = document.getElementById('campaign-error');

    if (!name) {
        errorEl.textContent = 'Campaign name is required';
        return;
    }

    try {
        let res;
        if (isEditingCampaign && currentCampaignId) {
            // Update existing campaign
            res = await fetch(`/api/campaigns/${currentCampaignId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ name, description })
            });
        } else {
            // Create new campaign
            res = await fetch('/api/campaigns', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({ name, description })
            });
        }

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.error || 'Failed to save campaign';
            return;
        }

        hideCampaignModal();

        if (isEditingCampaign) {
            // Update local state and UI
            currentCampaignName = name;
            currentCampaignDescription = description;
            const headerName = document.getElementById('header-campaign-name');
            if (headerName) headerName.textContent = name;
        }

        // Refresh dashboard
        await loadCampaignsAndShowDashboard();

    } catch (error) {
        errorEl.textContent = 'Connection error. Please try again.';
    }
}

// Keep old function name for backwards compatibility
async function createCampaign() {
    await saveCampaign();
}

async function deleteCampaign() {
    if (!currentCampaignId) return;

    showConfirmModal(
        'Delete Campaign',
        `Are you sure you want to delete "${currentCampaignName}"? This will also delete ALL sessions in this campaign. This action cannot be undone.`,
        async () => {
            try {
                const res = await fetch(`/api/campaigns/${currentCampaignId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });

                if (!res.ok) {
                    const data = await res.json();
                    alert('Failed to delete: ' + (data.error || 'Unknown error'));
                    return;
                }

                currentCampaignId = null;
                currentCampaignName = '';
                currentCampaignDescription = '';
                currentSessionId = null;
                const campaignSelect = document.getElementById('campaign-select');
                const sessionSelect = document.getElementById('session-select');
                const editCampaignBtn = document.getElementById('edit-campaign-btn');
                const deleteCampaignBtn = document.getElementById('delete-campaign-btn');
                const newSessionBtn = document.getElementById('new-session-btn');
                const deleteSessionBtn = document.getElementById('delete-session-btn');
                if (campaignSelect) campaignSelect.value = '';
                if (sessionSelect) sessionSelect.innerHTML = '<option value="">Select session...</option>';
                if (editCampaignBtn) editCampaignBtn.style.display = 'none';
                if (deleteCampaignBtn) deleteCampaignBtn.style.display = 'none';
                if (newSessionBtn) newSessionBtn.style.display = 'none';
                if (deleteSessionBtn) deleteSessionBtn.style.display = 'none';
                hideSessionContent();
                await loadCampaigns();
                const noCampaign = document.getElementById('no-campaign');
                if (noCampaign) noCampaign.style.display = 'block';
            } catch (error) {
                alert('Connection error. Please try again.');
            }
        }
    );
}

async function onCampaignChange() {
    const campaignSelect = document.getElementById('campaign-select');
    const campaignId = campaignSelect ? campaignSelect.value : null;

    if (!campaignId) {
        currentCampaignId = null;
        currentCampaignName = '';
        currentCampaignDescription = '';
        const sessionSelect = document.getElementById('session-select');
        const newSessionBtn = document.getElementById('new-session-btn');
        const editCampaignBtn = document.getElementById('edit-campaign-btn');
        const deleteCampaignBtn = document.getElementById('delete-campaign-btn');
        const deleteSessionBtn = document.getElementById('delete-session-btn');
        const noCampaign = document.getElementById('no-campaign');
        const noSession = document.getElementById('no-session');
        if (sessionSelect) sessionSelect.innerHTML = '<option value="">Select session...</option>';
        if (newSessionBtn) newSessionBtn.style.display = 'none';
        if (editCampaignBtn) editCampaignBtn.style.display = 'none';
        if (deleteCampaignBtn) deleteCampaignBtn.style.display = 'none';
        if (deleteSessionBtn) deleteSessionBtn.style.display = 'none';
        if (noCampaign) noCampaign.style.display = 'block';
        if (noSession) noSession.style.display = 'none';
        hideSessionContent();
        return;
    }

    currentCampaignId = campaignId;
    const noCampaign = document.getElementById('no-campaign');
    const newSessionBtn = document.getElementById('new-session-btn');
    const editCampaignBtn = document.getElementById('edit-campaign-btn');
    const deleteCampaignBtn = document.getElementById('delete-campaign-btn');
    const deleteSessionBtn = document.getElementById('delete-session-btn');
    if (noCampaign) noCampaign.style.display = 'none';
    if (newSessionBtn) newSessionBtn.style.display = 'inline-flex';
    if (editCampaignBtn) editCampaignBtn.style.display = 'inline-flex';
    if (deleteCampaignBtn) deleteCampaignBtn.style.display = 'inline-flex';
    if (deleteSessionBtn) deleteSessionBtn.style.display = 'none';

    // Fetch campaign details to get name and description
    try {
        const res = await fetch(`/api/campaigns/${campaignId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (res.ok) {
            const campaign = await res.json();
            currentCampaignName = campaign.name;
            currentCampaignDescription = campaign.description || '';
        }
    } catch (e) {
        console.error('Failed to fetch campaign details:', e);
    }

    await loadSessions(campaignId);
}

// ============================================
// Session Management
// ============================================

async function loadSessions(campaignId) {
    try {
        const res = await fetch(`/api/campaigns/${campaignId}/sessions`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const sessions = await res.json();
        const select = document.getElementById('session-select');

        select.innerHTML = '<option value="">Select session...</option>';
        sessions.forEach(s => {
            const option = document.createElement('option');
            option.value = s.id;
            const status = s.status === 'locked' ? ' [LOCKED]' : '';
            const date = s.date ? ` - ${s.date}` : '';
            option.textContent = `Session ${s.session_number}${date}${status}`;
            select.appendChild(option);
        });

        const noSession = document.getElementById('no-session');
        if (sessions.length === 0) {
            if (noSession) noSession.style.display = 'block';
        } else {
            if (noSession) noSession.style.display = 'none';
        }

        hideSessionContent();

    } catch (error) {
        console.error('Load sessions error:', error);
    }
}

async function createNewSession() {
    if (!currentCampaignId) return;

    sessionData = getEmptySessionData();

    try {
        const res = await fetch(`/api/campaigns/${currentCampaignId}/sessions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ data: sessionData })
        });

        const data = await res.json();

        if (!res.ok) {
            alert('Failed to create session: ' + (data.error || 'Unknown error'));
            return;
        }

        // Load the newly created session
        currentSessionId = data.id;
        await loadSession(data.id);

        // Save view state for page refresh persistence
        saveViewState();
    } catch (error) {
        console.error('Create session error:', error);
        alert('Connection error. Please try again.');
    }
}

async function onSessionChange() {
    const sessionSelect = document.getElementById('session-select');
    const sessionId = sessionSelect ? sessionSelect.value : null;
    const noSession = document.getElementById('no-session');
    const deleteSessionBtn = document.getElementById('delete-session-btn');

    if (!sessionId) {
        currentSessionId = null;
        hideSessionContent();
        if (noSession) noSession.style.display = 'block';
        if (deleteSessionBtn) deleteSessionBtn.style.display = 'none';
        return;
    }

    currentSessionId = sessionId;
    if (noSession) noSession.style.display = 'none';
    if (deleteSessionBtn) deleteSessionBtn.style.display = 'inline-flex';

    await loadSession(sessionId);
}

async function loadSession(sessionId) {
    try {
        const res = await fetch(`/api/sessions/${sessionId}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const session = await res.json();

        if (!res.ok) {
            alert('Failed to load session');
            return;
        }

        currentSessionId = session.id;
        isSessionLocked = session.status === 'locked';
        sessionData = session.data || getEmptySessionData();

        // Populate basic fields
        document.getElementById('session_number').value = session.session_number || '';
        document.getElementById('session_date').value = session.date || '';
        document.getElementById('session_location').value = session.location || '';

        // Update header with campaign name
        document.getElementById('header-campaign-name').textContent = currentCampaignName;

        // Sync campaign players (adds campaign members to players list)
        await syncCampaignPlayers();

        // Populate all dynamic lists
        renderAllLists();
        populateSessionNotes();

        showSessionContent();
        updateLockUI();

        // Show import button if this isn't the first session
        updateImportPlayersButton();

    } catch (error) {
        console.error('Load session error:', error);
        alert('Connection error. Please try again.');
    }
}

async function updateImportPlayersButton() {
    const importBtn = document.getElementById('import-players-btn');
    if (!importBtn || !currentCampaignId) return;

    try {
        const res = await fetch(`/api/campaigns/${currentCampaignId}/sessions`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const sessions = await res.json();

        const currentSessionNumber = parseInt(document.getElementById('session_number').value) || 0;
        const hasPreviousSession = sessions.some(s => s.session_number < currentSessionNumber);

        importBtn.style.display = hasPreviousSession && !isSessionLocked ? 'inline-flex' : 'none';
    } catch (error) {
        importBtn.style.display = 'none';
    }
}

async function saveSession() {
    if (!currentSessionId || !currentCampaignId) {
        alert('No session selected');
        return;
    }

    if (isSessionLocked) {
        alert('Session is locked and cannot be edited');
        return;
    }

    collectAllData();

    const sessionNumber = document.getElementById('session_number').value;
    const date = document.getElementById('session_date').value;
    const location = document.getElementById('session_location').value;

    try {
        const res = await fetch(`/api/sessions/${currentSessionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                session_number: sessionNumber,
                date: date,
                location: location,
                data: sessionData
            })
        });

        const result = await res.json();

        if (!res.ok) {
            alert('Failed to save: ' + (result.error || 'Unknown error'));
            return;
        }

        alert('Session saved!');

    } catch (error) {
        console.error('Save session error:', error);
        alert('Connection error. Please try again.');
    }
}

async function lockCurrentSession() {
    if (!currentSessionId) return;

    if (!confirm('Lock this session? It will become read-only.')) return;

    try {
        const res = await fetch(`/api/sessions/${currentSessionId}/lock`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (res.ok) {
            isSessionLocked = true;
            updateLockUI();
            await refreshSessionList();
            showSaveIndicator('Session locked');
        } else {
            alert('Failed to lock session');
        }
    } catch (error) {
        alert('Failed to lock session');
    }
}

async function unlockCurrentSession() {
    if (!currentSessionId) return;

    if (!confirm('Unlock this session? It will become editable again.')) return;

    try {
        const res = await fetch(`/api/sessions/${currentSessionId}/unlock`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (res.ok) {
            isSessionLocked = false;
            updateLockUI();
            await refreshSessionList();
            showSaveIndicator('Session unlocked');
        } else {
            alert('Failed to unlock session');
        }
    } catch (error) {
        alert('Failed to unlock session');
    }
}

// Refresh session list - no longer needed with card-based UI
// Kept for backwards compatibility with lock/unlock functions
async function refreshSessionList() {
    // Dashboard will refresh when user goes back to it
    // No need to update anything while viewing a session
}

async function deleteSession() {
    if (!currentSessionId || !currentCampaignId) return;

    const sessionNumber = document.getElementById('session_number').value || currentSessionId;

    showConfirmModal(
        'Delete Session',
        `Are you sure you want to delete Session ${sessionNumber}? This action cannot be undone.`,
        async () => {
            try {
                const res = await fetch(`/api/sessions/${currentSessionId}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${authToken}` }
                });

                if (!res.ok) {
                    const data = await res.json();
                    alert('Failed to delete: ' + (data.error || 'Unknown error'));
                    return;
                }

                currentSessionId = null;
                hideSessionContent();
                // Go back to dashboard
                await loadCampaignsAndShowDashboard();
            } catch (error) {
                console.error('Delete session error:', error);
                alert('Connection error. Please try again.');
            }
        }
    );
}

function updateLockUI() {
    const statusEl = document.getElementById('session-status');
    const statusGroup = document.getElementById('session-status-group');
    const lockGroup = document.getElementById('lock-group');
    const lockBtn = document.getElementById('lock-btn');
    const unlockBtn = document.getElementById('unlock-btn');
    const importBtn = document.getElementById('import-players-btn');
    const addButtons = document.querySelectorAll('.quick-add-btn:not(#import-players-btn)');
    const removeButtons = document.querySelectorAll('.remove-btn');
    const inputs = document.querySelectorAll('#session-content input, #session-content textarea, #session-content select, #session-header input');

    if (currentSessionId) {
        statusGroup.style.display = 'flex';
        lockGroup.style.display = 'flex';
    } else {
        statusGroup.style.display = 'none';
        lockGroup.style.display = 'none';
        return;
    }

    if (isSessionLocked) {
        statusEl.textContent = 'LOCKED';
        statusEl.classList.remove('unlocked');
        lockBtn.style.display = 'none';
        unlockBtn.style.display = 'inline-flex';

        addButtons.forEach(b => b.style.display = 'none');
        removeButtons.forEach(b => b.style.display = 'none');
        if (importBtn) importBtn.style.display = 'none';
        inputs.forEach(i => i.disabled = true);
    } else {
        statusEl.textContent = 'ACTIVE';
        statusEl.classList.add('unlocked');
        lockBtn.style.display = 'inline-flex';
        unlockBtn.style.display = 'none';

        addButtons.forEach(b => b.style.display = 'inline-flex');
        removeButtons.forEach(b => b.style.display = 'flex');
        inputs.forEach(i => i.disabled = false);
        // Import button visibility is handled by updateImportPlayersButton
    }
}

function showSessionContent() {
    document.getElementById('session-header').style.display = 'block';
    document.getElementById('tab-container').style.display = 'flex';
    document.getElementById('session-content').style.display = 'block';
}

function hideSessionContent() {
    document.getElementById('session-header').style.display = 'none';
    document.getElementById('tab-container').style.display = 'none';
    document.getElementById('session-content').style.display = 'none';
    document.getElementById('session-status-group').style.display = 'none';
    document.getElementById('lock-group').style.display = 'none';
}

// ============================================
// Tab Switching
// ============================================

function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    event.target.closest('.tab').classList.add('active');
    document.getElementById(tabId).classList.add('active');

    // Sync views when switching to play mode
    if (tabId === 'page-play') {
        renderPlayLists();
    }
}

// Programmatic tab switch (without event)
function switchToTab(tabId) {
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Find and activate the correct tab button
    const tabButton = document.querySelector(`.tab[onclick*="${tabId}"]`);
    if (tabButton) tabButton.classList.add('active');

    const tabContent = document.getElementById(tabId);
    if (tabContent) tabContent.classList.add('active');

    // Sync views when switching to play mode
    if (tabId === 'page-play') {
        renderPlayLists();
    }
}

// Navigate to specific encounter in Planning tab
function goToEncounterInPlanning(index) {
    hideEncounterModal();
    switchToTab('page-planning');

    // Wait for tab to render, then scroll to encounter
    setTimeout(() => {
        const encounterEl = document.getElementById(`planning-encounter-${index}`);
        if (encounterEl) {
            encounterEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Highlight it briefly
            encounterEl.style.boxShadow = '0 0 0 3px var(--accent-gold)';
            setTimeout(() => {
                encounterEl.style.boxShadow = '';
            }, 2000);
        }
    }, 100);
}

// ============================================
// Dynamic List Rendering
// ============================================

function renderAllLists() {
    // Planning tab - day-based view
    renderPlanningByDay();
    renderPlayersList();

    // Legacy list renders (for hidden containers and backwards compat)
    renderNPCsList();
    renderPlacesList();
    renderEncountersList();
    renderItemsList();
    renderReadAloudList();

    // During Play tab lists
    renderPlayLists();
    renderTurningPointsList();
    renderEventLogList();

    // Update hook and prolog displays
    updateHookDisplay();
    updatePrologueDisplay();

    // Update desktop sidebar (large screens)
    updateDMSidebar();
}

function updateHookDisplay() {
    const hookDisplay = document.getElementById('play-hook-display');
    const hookInput = document.getElementById('session_hook');
    if (hookDisplay) {
        hookDisplay.textContent = sessionData.hook || 'No goal set';
    }
    if (hookInput) {
        hookInput.value = sessionData.hook || '';
    }
}

function updatePrologueDisplay() {
    const prologContainer = document.getElementById('play-prolog-container');
    const prologText = document.getElementById('play-prolog-text');
    const prologInput = document.getElementById('session_prolog');

    // Update During Play display
    if (prologContainer && prologText) {
        if (sessionData.prolog && sessionData.prolog.trim()) {
            prologContainer.style.display = 'block';
            prologText.textContent = sessionData.prolog;
        } else {
            prologContainer.style.display = 'none';
        }
    }

    // Update Planning textarea
    if (prologInput) {
        prologInput.value = sessionData.prolog || '';
    }
}

function renderPlayLists() {
    renderDayTimeline();
    updateHookDisplay();
    updatePrologueDisplay();
}

// ============================================
// Day-based Planning View
// ============================================

// Time of day order for sorting
const TIME_ORDER = {
    'dawn': 1,
    'morning': 2,
    'noon': 3,
    'afternoon': 4,
    'dusk': 5,
    'evening': 6,
    'night': 7
};

const TIME_LABELS = {
    'dawn': '🌅 Dawn',
    'morning': '☀️ Morning',
    'noon': '🌞 Noon',
    'afternoon': '🌤️ Afternoon',
    'dusk': '🌆 Dusk',
    'evening': '🌙 Evening',
    'night': '🌑 Night'
};

function getSelectedPlanningDay() {
    const select = document.getElementById('planning-default-day');
    return select && select.value ? parseInt(select.value) : null;
}

function getSelectedPlanningTime() {
    const select = document.getElementById('planning-default-time');
    return select && select.value ? select.value : null;
}

function getSelectedPlanningPlace() {
    const select = document.getElementById('planning-default-place');
    return select && select.value ? select.value : null;
}

function updatePlaceDropdowns() {
    const places = sessionData.places || [];
    const defaultSelect = document.getElementById('planning-default-place');
    if (defaultSelect) {
        const currentValue = defaultSelect.value;
        let options = '<option value="">No place</option>';
        places.forEach(p => {
            if (p.name) {
                options += `<option value="${escapeHtml(p.name)}">${escapeHtml(p.name)}</option>`;
            }
        });
        defaultSelect.innerHTML = options;
        if (currentValue && defaultSelect.querySelector(`option[value="${currentValue}"]`)) {
            defaultSelect.value = currentValue;
        }
    }
}

function clearAllPlanning() {
    if (!confirm('Are you sure you want to clear ALL planning content?\n\nThis will remove all:\n- Places\n- Encounters\n- NPCs\n- Items & Clues\n- Read-Aloud texts\n\nThis cannot be undone!')) {
        return;
    }

    sessionData.places = [];
    sessionData.encounters = [];
    sessionData.npcs = [];
    sessionData.items = [];
    sessionData.readAloud = [];

    renderPlanningByDay();
    renderPlayLists();
    updateLockUI();
    triggerAutoSave();
    showSaveIndicator('All planning content cleared');
}

function addPlaceWithDay() {
    const day = getSelectedPlanningDay();
    const time = getSelectedPlanningTime();
    if (!sessionData.places) sessionData.places = [];
    sessionData.places.push({ name: '', description: '', visited: false, day: day, time: time, notes: '' });
    renderPlanningByDay();
    renderPlayLists();
    updateLockUI();
    triggerAutoSave();
}

function addEncounterWithDay() {
    const day = getSelectedPlanningDay();
    const time = getSelectedPlanningTime();
    const place = getSelectedPlanningPlace();
    if (!sessionData.encounters) sessionData.encounters = [];
    sessionData.encounters.push({ name: '', location: place || '', enemies: [], tactics: '', loot: '', status: 'planned', day: day, time: time, notes: '' });
    renderPlanningByDay();
    renderPlayLists();
    updateLockUI();
    triggerAutoSave();
}

function addReadAloudWithDay() {
    const day = getSelectedPlanningDay();
    const time = getSelectedPlanningTime();
    const place = getSelectedPlanningPlace();
    if (!sessionData.readAloud) sessionData.readAloud = [];
    sessionData.readAloud.push({
        title: '',
        text: '',
        read: false,
        day: day,
        time: time,
        linkedType: place ? 'place' : null,
        linkedTo: place || ''
    });
    renderPlanningByDay();
    renderPlayLists();
    updateLockUI();
    triggerAutoSave();
}

function addNPCWithDay() {
    const day = getSelectedPlanningDay();
    const time = getSelectedPlanningTime();
    const place = getSelectedPlanningPlace();
    sessionData.npcs.push({ name: '', role: '', plannedLocation: place || '', actualLocation: '', disposition: '', description: '', status: 'unused', day: day, time: time, notes: '' });
    renderPlanningByDay();
    renderPlayLists();
    updateLockUI();
    triggerAutoSave();
}

function addItemWithDay() {
    const day = getSelectedPlanningDay();
    const time = getSelectedPlanningTime();
    const place = getSelectedPlanningPlace();
    if (!sessionData.items) sessionData.items = [];
    sessionData.items.push({ name: '', description: '', plannedLocation: place || '', actualLocation: '', found: false, givenTo: '', day: day, time: time, notes: '' });
    renderPlanningByDay();
    renderPlayLists();
    updateLockUI();
    triggerAutoSave();
}

function generateAndAddNPCWithDay() {
    const race = document.getElementById('npc-gen-race').value;
    const gender = document.getElementById('npc-gen-gender').value;
    const day = getSelectedPlanningDay();
    const time = getSelectedPlanningTime();
    const place = getSelectedPlanningPlace();
    const generatedName = generateNPCName(race, gender);

    const preview = document.getElementById('npc-gen-preview');
    if (preview) preview.textContent = generatedName;

    sessionData.npcs.push({
        name: generatedName,
        role: '',
        plannedLocation: place || '',
        actualLocation: '',
        disposition: '',
        description: '',
        status: 'unused',
        day: day,
        time: time,
        notes: ''
    });

    renderPlanningByDay();
    renderPlayLists();
    updateLockUI();
    triggerAutoSave();
}

// Generate time options HTML
function getTimeOptions(selectedTime) {
    let options = '<option value="">No time</option>';
    Object.keys(TIME_ORDER).forEach(time => {
        const selected = selectedTime === time ? 'selected' : '';
        options += `<option value="${time}" ${selected}>${TIME_LABELS[time]}</option>`;
    });
    return options;
}

// Get the currently selected day filter for planning
function getPlanningDayFilter() {
    const select = document.getElementById('planning-day-filter');
    return select && select.value ? (select.value === 'all' ? 'all' : parseInt(select.value)) : 'all';
}

// Get list of all places for dropdowns
function getPlaceOptions(selectedPlace) {
    const places = sessionData.places || [];
    let options = '<option value="">-- No place --</option>';
    places.forEach((p, i) => {
        if (p.name) {
            const selected = selectedPlace === p.name ? 'selected' : '';
            options += `<option value="${escapeHtml(p.name)}" ${selected}>${escapeHtml(p.name)}${p.day ? ` (Day ${p.day})` : ''}</option>`;
        }
    });
    return options;
}

function renderPlanningByDay() {
    const container = document.getElementById('planning-timeline-container');
    if (!container) return;

    const dayFilter = getPlanningDayFilter();

    // Collect all days used
    const days = new Set();
    (sessionData.places || []).forEach(p => { if (p.day) days.add(p.day); });
    (sessionData.encounters || []).forEach(e => { if (e.day) days.add(e.day); });
    (sessionData.readAloud || []).forEach(r => { if (r.day) days.add(r.day); });
    (sessionData.npcs || []).forEach(n => { if (n.day) days.add(n.day); });
    (sessionData.items || []).forEach(i => { if (i.day) days.add(i.day); });

    // Check for unscheduled items
    const hasUnscheduled =
        (sessionData.places || []).some(p => !p.day) ||
        (sessionData.encounters || []).some(e => !e.day) ||
        (sessionData.readAloud || []).some(r => !r.day) ||
        (sessionData.npcs || []).some(n => !n.day) ||
        (sessionData.items || []).some(i => !i.day);

    const sortedDays = Array.from(days).sort((a, b) => a - b);

    // Update day filter dropdown options
    updatePlanningDayFilterOptions(sortedDays, hasUnscheduled);

    if (sortedDays.length === 0 && !hasUnscheduled) {
        container.innerHTML = `
            <div style="text-align: center; padding: var(--space-6); color: var(--text-secondary);">
                <p style="font-size: 1.1rem; margin-bottom: var(--space-2);">No content yet</p>
                <p style="font-size: 0.9rem;">Use the toolbar above to add places, encounters, NPCs, and more.</p>
            </div>`;
        return;
    }

    let html = '';

    // Render filtered days
    if (dayFilter === 'all') {
        sortedDays.forEach(day => {
            html += renderPlanningDaySection(day);
        });
        if (hasUnscheduled) {
            html += renderPlanningDaySection(null);
        }
    } else if (dayFilter === 0 || dayFilter === null) {
        // Show unscheduled only
        if (hasUnscheduled) {
            html += renderPlanningDaySection(null);
        }
    } else {
        // Show specific day
        if (days.has(dayFilter)) {
            html += renderPlanningDaySection(dayFilter);
        } else {
            html += `<div style="text-align: center; padding: var(--space-4); color: var(--text-secondary);">No content for Day ${dayFilter}</div>`;
        }
    }

    container.innerHTML = html;

    // Update place dropdown in toolbar
    updatePlaceDropdowns();
}

function updatePlanningDayFilterOptions(sortedDays, hasUnscheduled) {
    const select = document.getElementById('planning-day-filter');
    if (!select) return;

    const currentValue = select.value;
    let options = '<option value="all">All Days</option>';
    sortedDays.forEach(day => {
        options += `<option value="${day}">Day ${day}</option>`;
    });
    if (hasUnscheduled) {
        options += '<option value="0">Unscheduled</option>';
    }
    select.innerHTML = options;

    // Restore selection if still valid
    if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
        select.value = currentValue;
    }
}

function renderPlanningDaySection(day) {
    // Get all items for this day
    const allPlaces = (sessionData.places || []).map((p, i) => ({...p, _index: i})).filter(p => day === null ? !p.day : p.day === day);
    const allEncounters = (sessionData.encounters || []).map((e, i) => ({...e, _index: i})).filter(e => day === null ? !e.day : e.day === day);
    const allReadAloud = (sessionData.readAloud || []).map((r, i) => ({...r, _index: i})).filter(r => day === null ? !r.day : r.day === day);
    const allNpcs = (sessionData.npcs || []).map((n, i) => ({...n, _index: i})).filter(n => day === null ? !n.day : n.day === day);
    const allItems = (sessionData.items || []).map((item, i) => ({...item, _index: i})).filter(item => day === null ? !item.day : item.day === day);

    if (allPlaces.length === 0 && allEncounters.length === 0 && allReadAloud.length === 0 && allNpcs.length === 0 && allItems.length === 0) {
        return '';
    }

    const dayLabel = day === null ? 'Unscheduled' : `Day ${day}`;
    const dayColor = day === null ? 'var(--text-muted)' : 'var(--accent-purple)';

    // Group items by time of day
    const timeGroups = {};
    const noTimeItems = { places: [], encounters: [], readAloud: [], npcs: [], items: [] };

    // Sort places by time
    allPlaces.forEach(p => {
        if (p.time && TIME_ORDER[p.time]) {
            if (!timeGroups[p.time]) timeGroups[p.time] = { places: [], encounters: [], readAloud: [], npcs: [], items: [] };
            timeGroups[p.time].places.push(p);
        } else {
            noTimeItems.places.push(p);
        }
    });

    // Sort other items by time, linking to places
    allEncounters.forEach(e => {
        if (e.time && TIME_ORDER[e.time]) {
            if (!timeGroups[e.time]) timeGroups[e.time] = { places: [], encounters: [], readAloud: [], npcs: [], items: [] };
            timeGroups[e.time].encounters.push(e);
        } else {
            noTimeItems.encounters.push(e);
        }
    });

    allReadAloud.forEach(r => {
        if (r.time && TIME_ORDER[r.time]) {
            if (!timeGroups[r.time]) timeGroups[r.time] = { places: [], encounters: [], readAloud: [], npcs: [], items: [] };
            timeGroups[r.time].readAloud.push(r);
        } else {
            noTimeItems.readAloud.push(r);
        }
    });

    allNpcs.forEach(n => {
        if (n.time && TIME_ORDER[n.time]) {
            if (!timeGroups[n.time]) timeGroups[n.time] = { places: [], encounters: [], readAloud: [], npcs: [], items: [] };
            timeGroups[n.time].npcs.push(n);
        } else {
            noTimeItems.npcs.push(n);
        }
    });

    allItems.forEach(item => {
        if (item.time && TIME_ORDER[item.time]) {
            if (!timeGroups[item.time]) timeGroups[item.time] = { places: [], encounters: [], readAloud: [], npcs: [], items: [] };
            timeGroups[item.time].items.push(item);
        } else {
            noTimeItems.items.push(item);
        }
    });

    // Sort times
    const sortedTimes = Object.keys(timeGroups).sort((a, b) => TIME_ORDER[a] - TIME_ORDER[b]);

    let html = `
        <div class="planning-day-section subsection" style="margin-top: var(--space-4); border-left: 4px solid ${dayColor}; padding-left: var(--space-4);">
            <h3 style="color: ${dayColor}; font-size: 1.1rem; margin-bottom: var(--space-4); display: flex; align-items: center; gap: var(--space-2);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ${dayLabel}
            </h3>`;

    // Render each time group
    sortedTimes.forEach(time => {
        const group = timeGroups[time];
        html += renderTimeGroup(time, group, day);
    });

    // Render items without time
    const hasNoTimeItems = noTimeItems.places.length > 0 || noTimeItems.encounters.length > 0 ||
                          noTimeItems.readAloud.length > 0 || noTimeItems.npcs.length > 0 || noTimeItems.items.length > 0;
    if (hasNoTimeItems) {
        html += renderTimeGroup(null, noTimeItems, day);
    }

    html += '</div>';
    return html;
}

function renderTimeGroup(time, group, day) {
    const timeLabel = time ? TIME_LABELS[time] : '⏰ No specific time';
    const timeColor = time ? 'var(--accent-gold)' : 'var(--text-muted)';

    let html = `
        <div class="time-group" style="margin-bottom: var(--space-4); padding: var(--space-3); background: var(--bg-elevated); border-radius: var(--radius-md);">
            <h4 style="color: ${timeColor}; font-size: 0.9rem; margin-bottom: var(--space-3); font-weight: 600;">${timeLabel}</h4>`;

    // Render places as main containers
    group.places.forEach(place => {
        html += renderPlaceWithLinkedContent(place, group, day);
    });

    // Render unlinked content (not connected to any place)
    const placeNames = group.places.map(p => p.name).filter(n => n);

    const unlinkedEnc = group.encounters.filter(e => !placeNames.includes(e.location));
    // Read-Aloud linked to places not in this group, or linked to encounters/npcs that aren't in places
    const linkedEncounterNames = group.encounters.map(e => e.name).filter(n => n);
    const linkedNpcNames = group.npcs.map(n => n.name).filter(n => n);
    const unlinkedRA = group.readAloud.filter(r => {
        const type = r.linkedType || (r.place ? 'place' : null);
        const target = r.linkedTo || r.place || '';
        if (!type || !target) return true; // Not linked to anything
        if (type === 'place') return !placeNames.includes(target);
        if (type === 'encounter') return !linkedEncounterNames.includes(target);
        if (type === 'npc') return !linkedNpcNames.includes(target);
        return true;
    });
    const unlinkedNpcs = group.npcs.filter(n => !placeNames.includes(n.plannedLocation));

    // Collect all item names that are already shown inside encounters (via findItemsForEncounter)
    const itemsShownInEncounters = new Set();
    group.encounters.forEach(enc => {
        const encItems = findItemsForEncounter(enc);
        encItems.forEach(item => itemsShownInEncounters.add(item.name));
    });

    // Filter out items that are linked to a place OR already shown in an encounter
    const unlinkedItems = group.items.filter(i =>
        !placeNames.includes(i.plannedLocation) && !itemsShownInEncounters.has(i.name)
    );

    if (unlinkedEnc.length > 0 || unlinkedRA.length > 0 || unlinkedNpcs.length > 0 || unlinkedItems.length > 0) {
        html += renderUnlinkedContent(unlinkedEnc, unlinkedRA, unlinkedNpcs, unlinkedItems, day);
    }

    html += '</div>';
    return html;
}

function renderPlaceWithLinkedContent(place, group, day) {
    // Find content linked to this place
    const linkedEnc = group.encounters.filter(e => e.location === place.name);
    // Read-Aloud linked directly to this place
    const linkedRAtoPlace = group.readAloud.filter(r => {
        const type = r.linkedType || (r.place ? 'place' : null);
        const target = r.linkedTo || r.place || '';
        return type === 'place' && target === place.name;
    });
    // Read-Aloud linked to encounters at this place
    const linkedEncounterNames = linkedEnc.map(e => e.name).filter(n => n);
    const linkedRAtoEncounters = group.readAloud.filter(r => r.linkedType === 'encounter' && linkedEncounterNames.includes(r.linkedTo));
    // Read-Aloud linked to NPCs at this place
    const linkedNpcs = group.npcs.filter(n => n.plannedLocation === place.name);
    const linkedNpcNames = linkedNpcs.map(n => n.name).filter(n => n);
    const linkedRAtoNPCs = group.readAloud.filter(r => r.linkedType === 'npc' && linkedNpcNames.includes(r.linkedTo));

    // Collect items that are shown inside encounters at this place
    const itemsInEncounters = new Set();
    linkedEnc.forEach(enc => {
        const encItems = findItemsForEncounter(enc);
        encItems.forEach(item => itemsInEncounters.add(item.name));
    });

    // Filter out items that are already shown inside encounters
    const linkedItems = group.items.filter(i =>
        i.plannedLocation === place.name && !itemsInEncounters.has(i.name)
    );

    let html = `
        <div class="place-container" style="margin-bottom: var(--space-3); border: 1px solid var(--accent-cyan); border-radius: var(--radius-md); overflow: hidden;">
            <!-- Place Header -->
            <div style="padding: var(--space-3); background: linear-gradient(135deg, rgba(0, 188, 212, 0.15) 0%, rgba(0, 188, 212, 0.05) 100%); border-bottom: 1px solid var(--border-subtle); position: relative;">
                <button class="remove-btn" onclick="removePlace(${place._index}); renderPlanningByDay();">&times;</button>
                <div style="display: flex; gap: var(--space-2); flex-wrap: wrap; align-items: center;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-cyan)" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <input type="text" value="${escapeHtml(place.name || '')}" onchange="sessionData.places[${place._index}].name = this.value; updatePlaceDropdowns(); renderPlanningByDay(); renderPlayLists();" placeholder="Place name" style="flex: 1; min-width: 150px; font-weight: 600; font-size: 1rem; background: transparent; border: none; border-bottom: 1px dashed var(--border-subtle);">
                    <select onchange="sessionData.places[${place._index}].time = this.value || null; renderPlanningByDay(); renderPlayLists();" style="width: 120px; font-size: 0.8rem;">
                        ${getTimeOptions(place.time)}
                    </select>
                    <select onchange="sessionData.places[${place._index}].day = this.value ? parseInt(this.value) : null; renderPlanningByDay(); renderPlayLists();" style="width: 80px; font-size: 0.8rem;">
                        <option value="" ${!place.day ? 'selected' : ''}>No day</option>
                        ${[1,2,3,4,5].map(d => `<option value="${d}" ${place.day === d ? 'selected' : ''}>Day ${d}</option>`).join('')}
                    </select>
                </div>
                <input type="text" value="${escapeHtml(place.description || '')}" onchange="sessionData.places[${place._index}].description = this.value" placeholder="Description..." style="width: 100%; margin-top: var(--space-2); font-size: 0.85rem; background: transparent; border: none; border-bottom: 1px dashed var(--border-subtle); color: var(--text-secondary);">
            </div>

            <!-- Linked Content -->
            <div style="padding: var(--space-2);">`;

    // 1. Read-Aloud linked directly to this place
    if (linkedRAtoPlace.length > 0) {
        html += linkedRAtoPlace.map(ra => renderReadAloudCompact(ra, day, place.name)).join('');
    }

    // 2. Encounters (with their Read-Aloud nested)
    if (linkedEnc.length > 0) {
        html += linkedEnc.map(enc => {
            const encRA = group.readAloud.filter(r => r.linkedType === 'encounter' && r.linkedTo === enc.name);
            return renderEncounterCompact(enc, day, place.name, encRA);
        }).join('');
    }

    // 3. NPCs (with their Read-Aloud nested)
    if (linkedNpcs.length > 0) {
        html += linkedNpcs.map(npc => {
            const npcRA = group.readAloud.filter(r => r.linkedType === 'npc' && r.linkedTo === npc.name);
            return renderNPCCompact(npc, day, place.name, npcRA);
        }).join('');
    }

    // 4. Items
    if (linkedItems.length > 0) {
        html += linkedItems.map(item => renderItemCompact(item, day, place.name)).join('');
    }

    // Add buttons for this place
    html += `
                <div style="display: flex; gap: var(--space-1); flex-wrap: wrap; margin-top: var(--space-2); padding-top: var(--space-2); border-top: 1px dashed var(--border-subtle);">
                    <button onclick="addReadAloudToPlace('${escapeHtml(place.name)}', ${day}, '${place.time || ''}')" style="padding: 2px 8px; font-size: 0.75rem; background: var(--accent-purple-20); color: var(--accent-purple); border: none; border-radius: 4px; cursor: pointer;">+ Read-Aloud</button>
                    <button onclick="addEncounterToPlace('${escapeHtml(place.name)}', ${day}, '${place.time || ''}')" style="padding: 2px 8px; font-size: 0.75rem; background: var(--accent-red-20); color: var(--accent-red); border: none; border-radius: 4px; cursor: pointer;">+ Encounter</button>
                    <button onclick="addNPCToPlace('${escapeHtml(place.name)}', ${day}, '${place.time || ''}')" style="padding: 2px 8px; font-size: 0.75rem; background: var(--primary-blue-20); color: var(--primary-blue); border: none; border-radius: 4px; cursor: pointer;">+ NPC</button>
                    <button onclick="addItemToPlace('${escapeHtml(place.name)}', ${day}, '${place.time || ''}')" style="padding: 2px 8px; font-size: 0.75rem; background: var(--accent-gold-20); color: var(--accent-gold); border: none; border-radius: 4px; cursor: pointer;">+ Item</button>
                </div>
            </div>
        </div>`;

    return html;
}

// Find items that match an encounter by location or by name appearing in loot text
function findItemsForEncounter(enc) {
    if (!sessionData.items || sessionData.items.length === 0) return [];

    const matchingItems = [];
    const lootText = (enc.loot || '').toLowerCase();
    const encLocation = (enc.location || '').toLowerCase();
    const encName = (enc.name || '').toLowerCase();

    sessionData.items.forEach((item, index) => {
        if (!item.name) return;

        const itemLocation = (item.plannedLocation || '').toLowerCase();
        const itemName = item.name.toLowerCase();

        // Match by: plannedLocation matches encounter location OR item name appears in loot text
        const locationMatch = itemLocation && (itemLocation === encLocation || itemLocation === encName);
        const nameInLoot = lootText.includes(itemName);

        if (locationMatch || nameInLoot) {
            matchingItems.push({ ...item, _index: index });
        }
    });

    return matchingItems;
}

function renderEncounterCompact(enc, day, placeName, linkedRA = []) {
    const participants = enc.enemies || [];
    const matchingItems = findItemsForEncounter(enc);

    let html = `
        <div style="padding: var(--space-3); margin-bottom: var(--space-2); background: var(--bg-surface); border-radius: var(--radius-md); border-left: 3px solid var(--accent-red); position: relative;">
            <button class="remove-btn" onclick="removeEncounter(${enc._index}); renderPlanningByDay();" style="top: 8px; right: 8px; width: 20px; height: 20px; font-size: 14px;">&times;</button>

            <!-- Encounter Name & Location -->
            <div style="display: flex; gap: var(--space-2); align-items: center; margin-bottom: var(--space-2); flex-wrap: wrap;">
                <span style="color: var(--accent-red); font-size: 1rem;">⚔️</span>
                <input type="text" value="${escapeHtml(enc.name || '')}" onchange="sessionData.encounters[${enc._index}].name = this.value; renderPlayLists();" placeholder="Encounter name" style="flex: 1; min-width: 120px; font-size: 0.95rem; font-weight: 600; background: transparent; border: none; border-bottom: 1px solid var(--border-subtle); padding: 2px 0;">
                <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="font-size: 0.75rem; color: var(--accent-cyan);">📍</span>
                    <input type="text" value="${escapeHtml(enc.location || '')}" onchange="sessionData.encounters[${enc._index}].location = this.value; renderPlanningByDay(); renderPlayLists();" placeholder="Location" style="width: 120px; font-size: 0.8rem; background: transparent; border: none; border-bottom: 1px dashed var(--border-subtle); color: var(--accent-cyan);">
                </div>
            </div>

            <!-- Participants section -->
            <div style="margin-bottom: var(--space-2);">
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: var(--space-1);">👥 Participants:</div>`;

    participants.forEach((p, pIndex) => {
        html += `
                <div style="padding: 8px; background: var(--bg-elevated); border-radius: 4px; margin-bottom: 4px; position: relative;">
                    <button onclick="removeEncounterEnemy(${enc._index}, ${pIndex}); renderPlanningByDay();" style="position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border: none; background: var(--accent-red-20); color: var(--accent-red); border-radius: 50%; cursor: pointer; font-size: 12px; line-height: 1;">×</button>
                    <!-- Row 1: Identity -->
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 6px;">
                        <input type="text" value="${escapeHtml(p.name || '')}" onchange="sessionData.encounters[${enc._index}].enemies[${pIndex}].name = this.value; renderPlayLists();" placeholder="Name" style="flex: 1; min-width: 100px; font-size: 0.85rem; font-weight: 500; padding: 6px 8px;">
                        <select onchange="sessionData.encounters[${enc._index}].enemies[${pIndex}].disposition = this.value; renderPlanningByDay();" style="font-size: 0.8rem; padding: 6px 8px;">
                            <option value="enemy" ${p.disposition !== 'neutral' ? 'selected' : ''}>Enemy</option>
                            <option value="neutral" ${p.disposition === 'neutral' ? 'selected' : ''}>Neutral</option>
                        </select>
                        <select onchange="sessionData.encounters[${enc._index}].enemies[${pIndex}].role = this.value;" style="font-size: 0.8rem; padding: 6px 8px;">
                            <option value="" ${!p.role ? 'selected' : ''}>Role</option>
                            <option value="Warrior" ${p.role === 'Warrior' ? 'selected' : ''}>Warrior</option>
                            <option value="Rogue" ${p.role === 'Rogue' ? 'selected' : ''}>Rogue</option>
                            <option value="Mage" ${p.role === 'Mage' ? 'selected' : ''}>Mage</option>
                            <option value="Healer" ${p.role === 'Healer' ? 'selected' : ''}>Healer</option>
                            <option value="Ranger" ${p.role === 'Ranger' ? 'selected' : ''}>Ranger</option>
                            <option value="Beast" ${p.role === 'Beast' ? 'selected' : ''}>Beast</option>
                            <option value="Civilian" ${p.role === 'Civilian' ? 'selected' : ''}>Civilian</option>
                            <option value="Other" ${p.role === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                    <!-- Row 2: Combat stats -->
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        <input type="text" value="${escapeHtml(p.hp || '')}" onchange="updateParticipantHP(${enc._index}, ${pIndex}, this.value);" placeholder="HP" style="width: 45px; font-size: 0.8rem; text-align: center; padding: 6px;">
                        <input type="text" value="${escapeHtml(p.armor || '')}" onchange="sessionData.encounters[${enc._index}].enemies[${pIndex}].armor = this.value;" placeholder="Armor" style="width: 70px; font-size: 0.8rem; padding: 6px;">
                        <input type="text" value="${escapeHtml(p.weapon || '')}" onchange="sessionData.encounters[${enc._index}].enemies[${pIndex}].weapon = this.value;" placeholder="Weapon" style="width: 70px; font-size: 0.8rem; padding: 6px;">
                        <input type="text" value="${escapeHtml(p.atkBonus || '')}" onchange="sessionData.encounters[${enc._index}].enemies[${pIndex}].atkBonus = this.value;" placeholder="Atk" style="width: 40px; font-size: 0.8rem; text-align: center; padding: 6px;">
                        <input type="text" value="${escapeHtml(p.dmg || '')}" onchange="sessionData.encounters[${enc._index}].enemies[${pIndex}].dmg = this.value;" placeholder="Dmg" style="width: 50px; font-size: 0.8rem; padding: 6px;">
                    </div>
                </div>`;
    });

    html += `
                <button onclick="addEncounterEnemy(${enc._index}); renderPlanningByDay();" style="padding: 4px 8px; font-size: 0.7rem; background: var(--bg-elevated); color: var(--text-secondary); border: 1px dashed var(--border-default); border-radius: 4px; cursor: pointer;">+ Add Participant</button>
            </div>

            <!-- Tactics -->
            <div style="margin-bottom: var(--space-2);">
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 2px;">📋 Tactics:</div>
                <textarea rows="2" onchange="sessionData.encounters[${enc._index}].tactics = this.value;" placeholder="How do they fight?" style="width: 100%; font-size: 0.8rem; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; padding: 6px 8px; resize: vertical;">${escapeHtml(enc.tactics || '')}</textarea>
            </div>

            <!-- Loot -->
            <div style="margin-bottom: var(--space-2);">
                <div style="font-size: 0.75rem; color: var(--accent-gold); margin-bottom: 2px;">💰 Loot:</div>
                <input type="text" value="${escapeHtml(enc.loot || '')}" onchange="sessionData.encounters[${enc._index}].loot = this.value;" placeholder="Gold, items, etc." style="width: 100%; font-size: 0.8rem; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; padding: 4px 8px;">
            </div>`;

    // Show matching items with descriptions (read-only, from items array)
    if (matchingItems.length > 0) {
        html += `<div style="margin-bottom: var(--space-2);">
            <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">📜 Linked Items:</div>`;
        matchingItems.forEach(item => {
            const foundStyle = item.found ? 'opacity: 0.6;' : '';
            html += `<div style="margin-left: var(--space-2); padding: 4px 8px; background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0.02) 100%); border-radius: 4px; border-left: 2px solid var(--accent-gold); margin-bottom: 2px; ${foundStyle}">
                <span style="font-size: 0.75rem; color: var(--accent-gold);">${escapeHtml(item.name)}${item.found ? ' ✓' : ''}</span>
                ${item.description ? `<span style="font-size: 0.7rem; color: var(--text-muted);"> - ${escapeHtml(item.description.substring(0, 60))}${item.description.length > 60 ? '...' : ''}</span>` : ''}
            </div>`;
        });
        html += `</div>`;
    }

    // Nested Read-Aloud for this encounter
    if (linkedRA.length > 0) {
        html += `<div style="margin-top: var(--space-2); padding-left: var(--space-2); border-left: 2px solid var(--accent-purple);">`;
        html += linkedRA.map(ra => renderReadAloudCompact(ra, day, enc.name)).join('');
        html += `</div>`;
    }

    // Add Read-Aloud button for encounter
    if (enc.name) {
        html += `<button onclick="addReadAloudToEncounter('${escapeHtml(enc.name)}', ${day}, '${enc.time || ''}')" style="margin-top: var(--space-2); padding: 4px 8px; font-size: 0.7rem; background: var(--accent-purple-20); color: var(--accent-purple); border: none; border-radius: 4px; cursor: pointer;">+ Read-Aloud</button>`;
    }

    html += `</div>`;
    return html;
}

function renderReadAloudCompact(ra, day, placeName) {
    return `
        <div style="padding: var(--space-2); margin-bottom: var(--space-1); background: linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.02) 100%); border-radius: var(--radius-sm); border-left: 3px solid var(--accent-purple); position: relative;">
            <button class="remove-btn" onclick="removeReadAloud(${ra._index}); renderPlanningByDay();" style="top: 4px; right: 4px; width: 18px; height: 18px; font-size: 12px;">&times;</button>
            <div style="display: flex; gap: var(--space-2); align-items: center;">
                <span style="color: var(--accent-purple); font-size: 0.75rem;">📖</span>
                <input type="text" value="${escapeHtml(ra.title || '')}" onchange="updateReadAloud(${ra._index}, 'title', this.value); renderPlayLists();" placeholder="Title" style="flex: 1; font-size: 0.85rem; font-weight: 500; color: var(--accent-gold);">
            </div>
            <textarea rows="2" onchange="updateReadAloud(${ra._index}, 'text', this.value)" placeholder="Text..." style="width: 100%; margin-top: var(--space-1); font-size: 0.8rem; font-style: italic;">${escapeHtml(ra.text || '')}</textarea>
        </div>`;
}

function renderNPCCompact(npc, day, placeName, linkedRA = []) {
    let html = `
        <div style="padding: var(--space-2); margin-bottom: var(--space-1); background: var(--bg-surface); border-radius: var(--radius-sm); border-left: 3px solid var(--primary-blue); position: relative;">
            <button class="remove-btn" onclick="removeNPC(${npc._index}); renderPlanningByDay();" style="top: 4px; right: 4px; width: 18px; height: 18px; font-size: 12px;">&times;</button>
            <div style="display: flex; gap: var(--space-2); align-items: center; flex-wrap: wrap; margin-bottom: var(--space-1);">
                <span style="color: var(--primary-blue); font-size: 0.75rem;">👤</span>
                <input type="text" value="${escapeHtml(npc.name || '')}" onchange="sessionData.npcs[${npc._index}].name = this.value; renderPlayLists();" placeholder="Name" style="flex: 1; min-width: 80px; font-size: 0.85rem; font-weight: 500;">
                <input type="text" value="${escapeHtml(npc.role || '')}" onchange="sessionData.npcs[${npc._index}].role = this.value" placeholder="Role" style="width: 80px; font-size: 0.8rem;">
                <select onchange="sessionData.npcs[${npc._index}].disposition = this.value; renderPlanningByDay();" style="font-size: 0.75rem; padding: 2px 6px; background: ${npc.disposition === 'friendly' ? 'var(--accent-green-20)' : npc.disposition === 'hostile' ? 'var(--accent-red-20)' : 'var(--bg-elevated)'}; border: 1px solid var(--border-subtle); border-radius: 4px; color: ${npc.disposition === 'friendly' ? 'var(--accent-green)' : npc.disposition === 'hostile' ? 'var(--accent-red)' : 'var(--text-secondary)'};">
                    <option value="neutral" ${!npc.disposition || npc.disposition === 'neutral' ? 'selected' : ''}>Neutral</option>
                    <option value="friendly" ${npc.disposition === 'friendly' ? 'selected' : ''}>Friendly</option>
                    <option value="hostile" ${npc.disposition === 'hostile' ? 'selected' : ''}>Hostile</option>
                </select>
            </div>
            <textarea rows="2" onchange="sessionData.npcs[${npc._index}].description = this.value;" placeholder="Description..." style="width: 100%; font-size: 0.8rem; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; padding: 4px 8px; resize: vertical;">${escapeHtml(npc.description || '')}</textarea>`;

    // Nested Read-Aloud for this NPC
    if (linkedRA.length > 0) {
        html += `<div style="margin-left: var(--space-3); margin-top: var(--space-1); padding-left: var(--space-2); border-left: 2px solid var(--accent-purple);">`;
        html += linkedRA.map(ra => renderReadAloudCompact(ra, day, npc.name)).join('');
        html += `</div>`;
    }

    // Add Read-Aloud button for NPC
    if (npc.name) {
        html += `<button onclick="addReadAloudToNPC('${escapeHtml(npc.name)}', ${day}, '${npc.time || ''}')" style="margin-top: var(--space-1); padding: 2px 6px; font-size: 0.7rem; background: var(--accent-purple-20); color: var(--accent-purple); border: none; border-radius: 3px; cursor: pointer;">+ Read-Aloud</button>`;
    }

    html += `</div>`;
    return html;
}

function renderItemCompact(item, day, placeName) {
    const foundStyle = item.found ? 'opacity: 0.6;' : '';
    return `
        <div style="padding: var(--space-3); margin-bottom: var(--space-2); background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0.02) 100%); border-radius: var(--radius-md); border-left: 3px solid var(--accent-gold); position: relative; ${foundStyle}">
            <button class="remove-btn" onclick="removeItem(${item._index}); renderPlanningByDay();" style="top: 8px; right: 8px; width: 20px; height: 20px; font-size: 14px;">&times;</button>
            <div style="display: flex; gap: var(--space-2); align-items: center; margin-bottom: var(--space-2);">
                <span style="color: var(--accent-gold); font-size: 1rem;">💎</span>
                <input type="text" value="${escapeHtml(item.name || '')}" onchange="sessionData.items[${item._index}].name = this.value; renderPlayLists();" placeholder="Item name" style="flex: 1; font-size: 0.9rem; font-weight: 600; background: transparent; border: none; border-bottom: 1px solid var(--border-subtle); padding: 2px 0; ${item.found ? 'text-decoration: line-through;' : ''}">
                ${item.found ? '<span style="color: var(--accent-green); font-size: 0.8rem;">✓ Found</span>' : ''}
            </div>
            <textarea rows="2" onchange="sessionData.items[${item._index}].description = this.value;" placeholder="Description (what it does, what info it contains...)" style="width: 100%; font-size: 0.8rem; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; padding: 6px 8px; resize: vertical; font-style: italic;">${escapeHtml(item.description || '')}</textarea>
            ${item.plannedLocation ? `<div style="font-size: 0.7rem; color: var(--text-muted); margin-top: var(--space-1);">📍 ${escapeHtml(item.plannedLocation)}</div>` : ''}
        </div>`;
}

function renderUnlinkedContent(encounters, readAloud, npcs, items, day) {
    let html = '<div style="margin-top: var(--space-2); padding: var(--space-3); background: var(--bg-surface); border-radius: var(--radius-md); border: 1px dashed var(--border-subtle);">';
    html += '<div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: var(--space-3); font-weight: 500;">📌 Not linked to a place:</div>';

    // Encounters with full editing
    encounters.forEach(enc => {
        const participants = enc.enemies || [];
        const matchingItems = findItemsForEncounter(enc);

        html += `
            <div style="padding: var(--space-3); margin-bottom: var(--space-2); background: var(--bg-elevated); border-radius: var(--radius-md); border-left: 3px solid var(--accent-red); position: relative;">
                <button class="remove-btn" onclick="removeEncounter(${enc._index}); renderPlanningByDay();" style="top: 8px; right: 8px; width: 20px; height: 20px; font-size: 14px;">&times;</button>

                <!-- Header with name and location -->
                <div style="display: flex; gap: var(--space-2); align-items: center; margin-bottom: var(--space-2); flex-wrap: wrap;">
                    <span style="color: var(--accent-red); font-size: 1rem;">⚔️</span>
                    <input type="text" value="${escapeHtml(enc.name || '')}" onchange="sessionData.encounters[${enc._index}].name = this.value; renderPlayLists();" placeholder="Encounter name" style="flex: 1; min-width: 120px; font-size: 0.9rem; font-weight: 600; background: transparent; border: none; border-bottom: 1px solid var(--border-subtle); padding: 2px 0;">
                    <div style="display: flex; align-items: center; gap: 4px;">
                        <span style="font-size: 0.75rem; color: var(--accent-cyan);">📍</span>
                        <input type="text" value="${escapeHtml(enc.location || '')}" onchange="sessionData.encounters[${enc._index}].location = this.value; renderPlanningByDay(); renderPlayLists();" placeholder="Location" style="width: 120px; font-size: 0.8rem; background: transparent; border: none; border-bottom: 1px dashed var(--border-subtle); color: var(--accent-cyan);">
                    </div>
                </div>

                <!-- Participants section -->
                <div style="margin-bottom: var(--space-2);">
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: var(--space-1);">👥 Participants:</div>`;

        participants.forEach((p, pIndex) => {
            html += `
                    <div style="padding: 8px; background: var(--bg-surface); border-radius: 4px; margin-bottom: 4px; position: relative;">
                        <button onclick="removeEncounterEnemy(${enc._index}, ${pIndex}); renderPlanningByDay();" style="position: absolute; top: 4px; right: 4px; width: 20px; height: 20px; border: none; background: var(--accent-red-20); color: var(--accent-red); border-radius: 50%; cursor: pointer; font-size: 12px; line-height: 1;">×</button>
                        <!-- Row 1: Identity -->
                        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap; margin-bottom: 6px;">
                            <input type="text" value="${escapeHtml(p.name || '')}" onchange="sessionData.encounters[${enc._index}].enemies[${pIndex}].name = this.value; renderPlayLists();" placeholder="Name" style="flex: 1; min-width: 100px; font-size: 0.85rem; font-weight: 500; padding: 6px 8px;">
                            <select onchange="sessionData.encounters[${enc._index}].enemies[${pIndex}].disposition = this.value; renderPlanningByDay();" style="font-size: 0.8rem; padding: 6px 8px;">
                                <option value="enemy" ${p.disposition !== 'neutral' ? 'selected' : ''}>Enemy</option>
                                <option value="neutral" ${p.disposition === 'neutral' ? 'selected' : ''}>Neutral</option>
                            </select>
                            <select onchange="sessionData.encounters[${enc._index}].enemies[${pIndex}].role = this.value;" style="font-size: 0.8rem; padding: 6px 8px;">
                                <option value="" ${!p.role ? 'selected' : ''}>Role</option>
                                <option value="Warrior" ${p.role === 'Warrior' ? 'selected' : ''}>Warrior</option>
                                <option value="Rogue" ${p.role === 'Rogue' ? 'selected' : ''}>Rogue</option>
                                <option value="Mage" ${p.role === 'Mage' ? 'selected' : ''}>Mage</option>
                                <option value="Healer" ${p.role === 'Healer' ? 'selected' : ''}>Healer</option>
                                <option value="Ranger" ${p.role === 'Ranger' ? 'selected' : ''}>Ranger</option>
                                <option value="Beast" ${p.role === 'Beast' ? 'selected' : ''}>Beast</option>
                                <option value="Civilian" ${p.role === 'Civilian' ? 'selected' : ''}>Civilian</option>
                                <option value="Other" ${p.role === 'Other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                        <!-- Row 2: Combat stats -->
                        <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                            <input type="text" value="${escapeHtml(p.hp || '')}" onchange="updateParticipantHP(${enc._index}, ${pIndex}, this.value);" placeholder="HP" style="width: 45px; font-size: 0.8rem; text-align: center; padding: 6px;">
                            <input type="text" value="${escapeHtml(p.armor || '')}" onchange="sessionData.encounters[${enc._index}].enemies[${pIndex}].armor = this.value;" placeholder="Armor" style="width: 70px; font-size: 0.8rem; padding: 6px;">
                            <input type="text" value="${escapeHtml(p.weapon || '')}" onchange="sessionData.encounters[${enc._index}].enemies[${pIndex}].weapon = this.value;" placeholder="Weapon" style="width: 70px; font-size: 0.8rem; padding: 6px;">
                            <input type="text" value="${escapeHtml(p.atkBonus || '')}" onchange="sessionData.encounters[${enc._index}].enemies[${pIndex}].atkBonus = this.value;" placeholder="Atk" style="width: 40px; font-size: 0.8rem; text-align: center; padding: 6px;">
                            <input type="text" value="${escapeHtml(p.dmg || '')}" onchange="sessionData.encounters[${enc._index}].enemies[${pIndex}].dmg = this.value;" placeholder="Dmg" style="width: 50px; font-size: 0.8rem; padding: 6px;">
                        </div>
                    </div>`;
        });

        html += `
                    <button onclick="addEncounterEnemy(${enc._index}); renderPlanningByDay();" style="padding: 4px 8px; font-size: 0.7rem; background: var(--bg-surface); color: var(--text-secondary); border: 1px dashed var(--border-default); border-radius: 4px; cursor: pointer;">+ Add Participant</button>
                </div>

                <!-- Tactics -->
                <div style="margin-bottom: var(--space-2);">
                    <div style="font-size: 0.75rem; color: var(--text-muted); margin-bottom: 2px;">📋 Tactics:</div>
                    <textarea rows="2" onchange="sessionData.encounters[${enc._index}].tactics = this.value;" placeholder="How do they fight?" style="width: 100%; font-size: 0.8rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 4px; padding: 6px 8px; resize: vertical;">${escapeHtml(enc.tactics || '')}</textarea>
                </div>

                <!-- Loot -->
                <div style="margin-bottom: var(--space-2);">
                    <div style="font-size: 0.75rem; color: var(--accent-gold); margin-bottom: 2px;">💰 Loot:</div>
                    <input type="text" value="${escapeHtml(enc.loot || '')}" onchange="sessionData.encounters[${enc._index}].loot = this.value;" placeholder="Gold, items, etc." style="width: 100%; font-size: 0.8rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 4px; padding: 4px 8px;">
                </div>`;

        // Show matching items
        if (matchingItems.length > 0) {
            html += `<div style="margin-bottom: var(--space-1);">
                <div style="font-size: 0.7rem; color: var(--text-muted); margin-bottom: 2px;">📜 Linked Items:</div>`;
            matchingItems.forEach(item => {
                html += `<div style="margin-left: var(--space-2); padding: 4px 8px; background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0.02) 100%); border-radius: 4px; border-left: 2px solid var(--accent-gold); margin-bottom: 2px;">
                    <span style="font-size: 0.75rem; color: var(--accent-gold);">${escapeHtml(item.name)}</span>
                    ${item.description ? `<span style="font-size: 0.7rem; color: var(--text-muted);"> - ${escapeHtml(item.description.substring(0, 60))}${item.description.length > 60 ? '...' : ''}</span>` : ''}
                </div>`;
            });
            html += `</div>`;
        }

        html += `</div>`;
    });

    // NPCs with full editing
    npcs.forEach(npc => {
        html += `
            <div style="padding: var(--space-3); margin-bottom: var(--space-2); background: var(--bg-elevated); border-radius: var(--radius-md); border-left: 3px solid var(--primary-blue); position: relative;">
                <button class="remove-btn" onclick="removeNPC(${npc._index}); renderPlanningByDay();" style="top: 8px; right: 8px; width: 20px; height: 20px; font-size: 14px;">&times;</button>
                <div style="display: flex; gap: var(--space-2); align-items: center; margin-bottom: var(--space-1); flex-wrap: wrap;">
                    <span style="color: var(--primary-blue); font-size: 1rem;">👤</span>
                    <input type="text" value="${escapeHtml(npc.name || '')}" onchange="sessionData.npcs[${npc._index}].name = this.value; renderPlayLists();" placeholder="NPC name" style="flex: 1; min-width: 80px; font-size: 0.9rem; font-weight: 600; background: transparent; border: none; border-bottom: 1px solid var(--border-subtle); padding: 2px 0;">
                    <input type="text" value="${escapeHtml(npc.role || '')}" onchange="sessionData.npcs[${npc._index}].role = this.value" placeholder="Role" style="width: 80px; font-size: 0.8rem;">
                    <select onchange="sessionData.npcs[${npc._index}].disposition = this.value; renderPlanningByDay();" style="font-size: 0.75rem; padding: 2px 6px; background: ${npc.disposition === 'friendly' ? 'var(--accent-green-20)' : npc.disposition === 'hostile' ? 'var(--accent-red-20)' : 'var(--bg-surface)'}; border: 1px solid var(--border-subtle); border-radius: 4px; color: ${npc.disposition === 'friendly' ? 'var(--accent-green)' : npc.disposition === 'hostile' ? 'var(--accent-red)' : 'var(--text-secondary)'};">
                        <option value="neutral" ${!npc.disposition || npc.disposition === 'neutral' ? 'selected' : ''}>Neutral</option>
                        <option value="friendly" ${npc.disposition === 'friendly' ? 'selected' : ''}>Friendly</option>
                        <option value="hostile" ${npc.disposition === 'hostile' ? 'selected' : ''}>Hostile</option>
                    </select>
                    <select onchange="sessionData.npcs[${npc._index}].plannedLocation = this.value; renderPlanningByDay(); renderPlayLists();" style="font-size: 0.75rem; padding: 4px 8px; background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: 4px;">
                        ${getPlaceOptions(npc.plannedLocation)}
                    </select>
                </div>
                <textarea rows="2" onchange="sessionData.npcs[${npc._index}].description = this.value;" placeholder="Description..." style="width: 100%; font-size: 0.8rem; background: var(--bg-surface); border: 1px solid var(--border-subtle); border-radius: 4px; padding: 4px 8px; resize: vertical;">${escapeHtml(npc.description || '')}</textarea>
            </div>`;
    });

    // Items with full editing
    items.forEach(item => {
        html += `
            <div style="padding: var(--space-3); margin-bottom: var(--space-2); background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0.02) 100%); border-radius: var(--radius-md); border-left: 3px solid var(--accent-gold); position: relative;">
                <button class="remove-btn" onclick="removeItem(${item._index}); renderPlanningByDay();" style="top: 8px; right: 8px; width: 20px; height: 20px; font-size: 14px;">&times;</button>
                <div style="display: flex; gap: var(--space-2); align-items: center; margin-bottom: var(--space-2); flex-wrap: wrap;">
                    <span style="color: var(--accent-gold); font-size: 1rem;">💎</span>
                    <input type="text" value="${escapeHtml(item.name || '')}" onchange="sessionData.items[${item._index}].name = this.value; renderPlayLists();" placeholder="Item name" style="flex: 1; min-width: 100px; font-size: 0.9rem; font-weight: 600; background: transparent; border: none; border-bottom: 1px solid var(--border-subtle); padding: 2px 0;">
                    <select onchange="sessionData.items[${item._index}].plannedLocation = this.value; renderPlanningByDay(); renderPlayLists();" style="font-size: 0.75rem; padding: 4px 8px; background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: 4px;">
                        ${getPlaceOptions(item.plannedLocation)}
                    </select>
                </div>
                <textarea rows="2" onchange="sessionData.items[${item._index}].description = this.value;" placeholder="Description (what it does, what info it contains...)" style="width: 100%; font-size: 0.8rem; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px; padding: 6px 8px; resize: vertical; font-style: italic;">${escapeHtml(item.description || '')}</textarea>
            </div>`;
    });

    // Read-Aloud
    readAloud.forEach(ra => {
        html += `
            <div style="padding: var(--space-3); margin-bottom: var(--space-2); background: linear-gradient(135deg, rgba(168, 85, 247, 0.08) 0%, rgba(168, 85, 247, 0.02) 100%); border-radius: var(--radius-md); border-left: 3px solid var(--accent-purple); position: relative;">
                <button class="remove-btn" onclick="removeReadAloud(${ra._index}); renderPlanningByDay();" style="top: 8px; right: 8px; width: 20px; height: 20px; font-size: 14px;">&times;</button>
                <div style="display: flex; gap: var(--space-2); align-items: center; margin-bottom: var(--space-2);">
                    <span style="color: var(--accent-purple); font-size: 1rem;">📖</span>
                    <input type="text" value="${escapeHtml(ra.title || '')}" onchange="updateReadAloud(${ra._index}, 'title', this.value); renderPlayLists();" placeholder="Title" style="flex: 1; font-size: 0.9rem; font-weight: 600; background: transparent; border: none; border-bottom: 1px solid var(--border-subtle); padding: 2px 0; color: var(--accent-gold);">
                    <select onchange="updateReadAloud(${ra._index}, 'place', this.value); renderPlanningByDay(); renderPlayLists();" style="font-size: 0.75rem; padding: 4px 8px; background: var(--bg-surface); border: 1px solid var(--border-default); border-radius: 4px;">
                        ${getPlaceOptions(ra.place)}
                    </select>
                </div>
                <textarea rows="2" onchange="updateReadAloud(${ra._index}, 'text', this.value)" placeholder="Text..." style="width: 100%; font-size: 0.8rem; font-style: italic; padding: 8px; background: var(--bg-elevated); border: 1px solid var(--border-subtle); border-radius: 4px;">${escapeHtml(ra.text || '')}</textarea>
            </div>`;
    });

    html += '</div>';
    return html;
}

// Helper functions to add content to a specific place
function addEncounterToPlace(placeName, day, time) {
    if (!sessionData.encounters) sessionData.encounters = [];
    sessionData.encounters.push({ name: '', location: placeName, enemies: [], tactics: '', loot: '', status: 'planned', day: day, time: time || null, notes: '' });
    renderPlanningByDay();
    renderPlayLists();
    triggerAutoSave();
}

function addReadAloudToPlace(placeName, day, time) {
    if (!sessionData.readAloud) sessionData.readAloud = [];
    sessionData.readAloud.push({ title: '', text: '', read: false, day: day, time: time || null, linkedType: 'place', linkedTo: placeName });
    renderPlanningByDay();
    renderPlayLists();
    triggerAutoSave();
}

function addNPCToPlace(placeName, day, time) {
    sessionData.npcs.push({ name: '', role: '', plannedLocation: placeName, actualLocation: '', disposition: '', description: '', status: 'unused', day: day, time: time || null, notes: '' });
    renderPlanningByDay();
    renderPlayLists();
    triggerAutoSave();
}

function addItemToPlace(placeName, day, time) {
    if (!sessionData.items) sessionData.items = [];
    sessionData.items.push({ name: '', description: '', plannedLocation: placeName, actualLocation: '', found: false, givenTo: '', day: day, time: time || null, notes: '' });
    renderPlanningByDay();
    renderPlayLists();
    triggerAutoSave();
}

function addReadAloudToEncounter(encounterName, day, time) {
    if (!sessionData.readAloud) sessionData.readAloud = [];
    sessionData.readAloud.push({ title: '', text: '', read: false, day: day, time: time || null, linkedType: 'encounter', linkedTo: encounterName });
    renderPlanningByDay();
    renderPlayLists();
    triggerAutoSave();
}

function addReadAloudToNPC(npcName, day, time) {
    if (!sessionData.readAloud) sessionData.readAloud = [];
    sessionData.readAloud.push({ title: '', text: '', read: false, day: day, time: time || null, linkedType: 'npc', linkedTo: npcName });
    renderPlanningByDay();
    renderPlayLists();
    triggerAutoSave();
}

// ============================================
// Day-based timeline for During Play
// ============================================

function getPlayDayFilter() {
    const select = document.getElementById('play-day-filter');
    return select && select.value ? (select.value === 'all' ? 'all' : parseInt(select.value)) : 'all';
}

function updatePlayDayFilterOptions(sortedDays, hasUnscheduled) {
    const select = document.getElementById('play-day-filter');
    if (!select) return;

    const currentValue = select.value;
    let options = '<option value="all">All Days</option>';
    sortedDays.forEach(day => {
        options += `<option value="${day}">Day ${day}</option>`;
    });
    if (hasUnscheduled) {
        options += '<option value="0">Unscheduled</option>';
    }
    select.innerHTML = options;

    // Restore selection if still valid
    if (currentValue && select.querySelector(`option[value="${currentValue}"]`)) {
        select.value = currentValue;
    }
}

function renderDayTimeline() {
    const container = document.getElementById('day-timeline-container');
    if (!container) return;

    const dayFilter = getPlayDayFilter();

    // Collect all days used
    const days = new Set();
    (sessionData.places || []).forEach(p => { if (p.day) days.add(p.day); });
    (sessionData.encounters || []).forEach(e => { if (e.day) days.add(e.day); });
    (sessionData.readAloud || []).forEach(r => { if (r.day) days.add(r.day); });
    (sessionData.npcs || []).forEach(n => { if (n.day) days.add(n.day); });
    (sessionData.items || []).forEach(i => { if (i.day) days.add(i.day); });

    // Check if we have unscheduled items
    const hasUnscheduled =
        (sessionData.places || []).some(p => !p.day) ||
        (sessionData.encounters || []).some(e => !e.day) ||
        (sessionData.readAloud || []).some(r => !r.day) ||
        (sessionData.npcs || []).some(n => !n.day) ||
        (sessionData.items || []).some(i => !i.day);

    const sortedDays = Array.from(days).sort((a, b) => a - b);

    // Update day filter dropdown
    updatePlayDayFilterOptions(sortedDays, hasUnscheduled);

    if (sortedDays.length === 0 && !hasUnscheduled) {
        container.innerHTML = `
            <div style="text-align: center; padding: var(--space-6); color: var(--text-secondary);">
                <p style="font-size: 1.1rem; margin-bottom: var(--space-2);">No content scheduled yet</p>
                <p style="font-size: 0.9rem;">Add items in the Planning tab and assign them to days.</p>
            </div>`;
        return;
    }

    let html = '';

    // Render filtered days
    if (dayFilter === 'all') {
        sortedDays.forEach(day => {
            html += renderDaySection(day);
        });
        if (hasUnscheduled) {
            html += renderDaySection(null);
        }
    } else if (dayFilter === 0) {
        // Show unscheduled only
        if (hasUnscheduled) {
            html += renderDaySection(null);
        }
    } else {
        // Show specific day
        if (days.has(dayFilter)) {
            html += renderDaySection(dayFilter);
        } else {
            html += `<div style="text-align: center; padding: var(--space-4); color: var(--text-secondary);">No content for Day ${dayFilter}</div>`;
        }
    }

    container.innerHTML = html;
}

function renderDaySection(day) {
    const dayLabel = day ? `Day ${day}` : 'Unscheduled';
    const dayClass = day ? 'day-scheduled' : 'day-unscheduled';

    // Filter items for this day
    const allPlaces = (sessionData.places || [])
        .map((p, i) => ({...p, _index: i}))
        .filter(p => day ? p.day === day : !p.day);
    const allEncounters = (sessionData.encounters || [])
        .map((e, i) => ({...e, _index: i}))
        .filter(e => day ? e.day === day : !e.day);
    const allReadAloud = (sessionData.readAloud || [])
        .map((r, i) => ({...r, _index: i}))
        .filter(r => day ? r.day === day : !r.day);
    const allNpcs = (sessionData.npcs || [])
        .map((n, i) => ({...n, _index: i}))
        .filter(n => day ? n.day === day : !n.day);
    const allItems = (sessionData.items || [])
        .map((it, i) => ({...it, _index: i}))
        .filter(it => day ? it.day === day : !it.day);

    const hasContent = allPlaces.length || allEncounters.length || allReadAloud.length || allNpcs.length || allItems.length;
    if (!hasContent) return '';

    // Group by time
    const timeGroups = {};
    const noTimeGroup = { places: [], encounters: [], readAloud: [], npcs: [], items: [] };

    allPlaces.forEach(p => {
        if (p.time && TIME_ORDER[p.time]) {
            if (!timeGroups[p.time]) timeGroups[p.time] = { places: [], encounters: [], readAloud: [], npcs: [], items: [] };
            timeGroups[p.time].places.push(p);
        } else {
            noTimeGroup.places.push(p);
        }
    });

    allEncounters.forEach(e => {
        if (e.time && TIME_ORDER[e.time]) {
            if (!timeGroups[e.time]) timeGroups[e.time] = { places: [], encounters: [], readAloud: [], npcs: [], items: [] };
            timeGroups[e.time].encounters.push(e);
        } else {
            noTimeGroup.encounters.push(e);
        }
    });

    allReadAloud.forEach(r => {
        if (r.time && TIME_ORDER[r.time]) {
            if (!timeGroups[r.time]) timeGroups[r.time] = { places: [], encounters: [], readAloud: [], npcs: [], items: [] };
            timeGroups[r.time].readAloud.push(r);
        } else {
            noTimeGroup.readAloud.push(r);
        }
    });

    allNpcs.forEach(n => {
        if (n.time && TIME_ORDER[n.time]) {
            if (!timeGroups[n.time]) timeGroups[n.time] = { places: [], encounters: [], readAloud: [], npcs: [], items: [] };
            timeGroups[n.time].npcs.push(n);
        } else {
            noTimeGroup.npcs.push(n);
        }
    });

    allItems.forEach(item => {
        if (item.time && TIME_ORDER[item.time]) {
            if (!timeGroups[item.time]) timeGroups[item.time] = { places: [], encounters: [], readAloud: [], npcs: [], items: [] };
            timeGroups[item.time].items.push(item);
        } else {
            noTimeGroup.items.push(item);
        }
    });

    // Sort times
    const sortedTimes = Object.keys(timeGroups).sort((a, b) => TIME_ORDER[a] - TIME_ORDER[b]);

    let html = `
        <div class="day-section ${dayClass}" style="margin-bottom: var(--space-6); border: 1px solid ${day ? 'var(--accent-blue)' : 'var(--border-default)'}; border-radius: var(--radius-lg); overflow: hidden;">
            <div class="day-header" style="background: ${day ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.05) 100%)' : 'var(--bg-elevated)'}; padding: var(--space-3) var(--space-4); border-bottom: 1px solid ${day ? 'var(--accent-blue)' : 'var(--border-default)'};">
                <h3 style="margin: 0; color: ${day ? 'var(--accent-blue)' : 'var(--text-secondary)'}; font-size: 1.1rem; display: flex; align-items: center; gap: var(--space-2);">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                    ${dayLabel}
                </h3>
            </div>
            <div class="day-content" style="padding: var(--space-4);">`;

    // Render each time group
    sortedTimes.forEach(time => {
        html += renderPlayTimeGroup(time, timeGroups[time], day);
    });

    // Render content without specific time
    const hasNoTimeContent = noTimeGroup.places.length || noTimeGroup.encounters.length || noTimeGroup.readAloud.length || noTimeGroup.npcs.length || noTimeGroup.items.length;
    if (hasNoTimeContent) {
        html += renderPlayTimeGroup(null, noTimeGroup, day);
    }

    html += `
            </div>
        </div>`;

    return html;
}

// During Play: Render a time group with nested structure
function renderPlayTimeGroup(time, group, day) {
    const timeLabel = time ? TIME_LABELS[time] : '⏰ No specific time';
    const timeColor = time ? 'var(--accent-gold)' : 'var(--text-muted)';

    let html = `
        <div class="time-group" style="margin-bottom: var(--space-4); padding: var(--space-3); background: var(--bg-elevated); border-radius: var(--radius-md);">
            <h4 style="color: ${timeColor}; font-size: 0.9rem; margin-bottom: var(--space-3); font-weight: 600;">${timeLabel}</h4>`;

    // Render places as main containers with linked content nested inside
    group.places.forEach(place => {
        html += renderPlayPlaceWithLinkedContent(place, group, day);
    });

    // Render unlinked content (not connected to any place)
    const placeNames = group.places.map(p => p.name).filter(n => n);

    const unlinkedEnc = group.encounters.filter(e => !placeNames.includes(e.location));
    const linkedEncounterNames = group.encounters.map(e => e.name).filter(n => n);
    const linkedNpcNames = group.npcs.map(n => n.name).filter(n => n);
    const unlinkedRA = group.readAloud.filter(r => {
        const type = r.linkedType || (r.place ? 'place' : null);
        const target = r.linkedTo || r.place || '';
        if (!type || !target) return true;
        if (type === 'place') return !placeNames.includes(target);
        if (type === 'encounter') return !linkedEncounterNames.includes(target);
        if (type === 'npc') return !linkedNpcNames.includes(target);
        return true;
    });
    const unlinkedNpcs = group.npcs.filter(n => !placeNames.includes(n.plannedLocation));

    // Collect all item names that are already shown inside encounters (via findItemsForEncounter)
    const itemsShownInEncounters = new Set();
    group.encounters.forEach(enc => {
        const encItems = findItemsForEncounter(enc);
        encItems.forEach(item => itemsShownInEncounters.add(item.name));
    });

    // Filter out items that are linked to a place OR already shown in an encounter
    const unlinkedItems = group.items.filter(i =>
        !placeNames.includes(i.plannedLocation) && !itemsShownInEncounters.has(i.name)
    );

    if (unlinkedEnc.length > 0 || unlinkedRA.length > 0 || unlinkedNpcs.length > 0 || unlinkedItems.length > 0) {
        html += renderPlayUnlinkedContent(unlinkedEnc, unlinkedRA, unlinkedNpcs, unlinkedItems, day);
    }

    html += '</div>';
    return html;
}

// During Play: Render a place with its linked content
function renderPlayPlaceWithLinkedContent(place, group, day) {
    // Find content linked to this place
    const linkedEnc = group.encounters.filter(e => e.location === place.name);
    const linkedRAtoPlace = group.readAloud.filter(r => {
        const type = r.linkedType || (r.place ? 'place' : null);
        const target = r.linkedTo || r.place || '';
        return type === 'place' && target === place.name;
    });
    const linkedEncounterNames = linkedEnc.map(e => e.name).filter(n => n);
    const linkedRAtoEncounters = group.readAloud.filter(r => r.linkedType === 'encounter' && linkedEncounterNames.includes(r.linkedTo));
    const linkedNpcs = group.npcs.filter(n => n.plannedLocation === place.name);
    const linkedNpcNames = linkedNpcs.map(n => n.name).filter(n => n);
    const linkedRAtoNPCs = group.readAloud.filter(r => r.linkedType === 'npc' && linkedNpcNames.includes(r.linkedTo));

    // Collect items that are shown inside encounters at this place
    const itemsInEncounters = new Set();
    linkedEnc.forEach(enc => {
        const encItems = findItemsForEncounter(enc);
        encItems.forEach(item => itemsInEncounters.add(item.name));
    });

    // Filter out items that are already shown inside encounters
    const linkedItems = group.items.filter(i =>
        i.plannedLocation === place.name && !itemsInEncounters.has(i.name)
    );

    let html = `
        <div class="place-container" style="margin-bottom: var(--space-3); border: 1px solid ${place.visited ? 'var(--accent-green)' : 'var(--accent-cyan)'}; border-radius: var(--radius-md); overflow: hidden;">
            <!-- Place Header -->
            <div style="padding: var(--space-3); background: linear-gradient(135deg, ${place.visited ? 'rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05)' : 'rgba(0, 188, 212, 0.15) 0%, rgba(0, 188, 212, 0.05)'} 100%); border-bottom: 1px solid var(--border-subtle);">
                <div style="display: flex; gap: var(--space-2); align-items: center;">
                    <input type="checkbox" ${place.visited ? 'checked' : ''} onchange="sessionData.places[${place._index}].visited = this.checked; renderDayTimeline(); triggerAutoSave();" style="width: 18px; height: 18px; cursor: pointer;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${place.visited ? 'var(--accent-green)' : 'var(--accent-cyan)'}" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    <span style="font-weight: 600; font-size: 1rem; ${place.visited ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${escapeHtml(place.name || 'Unnamed Place')}</span>
                </div>
                ${place.description ? `<p style="margin: var(--space-1) 0 0 28px; font-size: 0.85rem; color: var(--text-secondary); ${place.visited ? 'opacity: 0.6;' : ''}">${escapeHtml(place.description)}</p>` : ''}
            </div>

            <!-- Linked Content -->
            <div style="padding: var(--space-2);">`;

    // 1. Read-Aloud linked directly to this place
    if (linkedRAtoPlace.length > 0) {
        html += linkedRAtoPlace.map(ra => renderPlayReadAloud(ra)).join('');
    }

    // 2. Encounters (with their items and Read-Aloud nested)
    if (linkedEnc.length > 0) {
        html += linkedEnc.map(enc => {
            const encRA = group.readAloud.filter(r => r.linkedType === 'encounter' && r.linkedTo === enc.name);
            // Find items for this encounter
            const encItems = findItemsForEncounter(enc);
            return renderPlayEncounter(enc, encRA, encItems);
        }).join('');
    }

    // 3. NPCs (with their Read-Aloud nested)
    if (linkedNpcs.length > 0) {
        html += linkedNpcs.map(npc => {
            const npcRA = group.readAloud.filter(r => r.linkedType === 'npc' && r.linkedTo === npc.name);
            return renderPlayNPC(npc, npcRA);
        }).join('');
    }

    // 4. Items linked to this place (not via encounter)
    if (linkedItems.length > 0) {
        html += linkedItems.map(item => renderPlayItem(item)).join('');
    }

    html += `
            </div>
        </div>`;

    return html;
}

// During Play: Render unlinked content
function renderPlayUnlinkedContent(encounters, readAloud, npcs, items, day) {
    if (!encounters.length && !readAloud.length && !npcs.length && !items.length) return '';

    let html = `
        <div class="unlinked-content" style="margin-top: var(--space-3); padding: var(--space-3); background: var(--bg-surface); border-radius: var(--radius-md); border: 1px dashed var(--border-default);">
            <div style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: var(--space-2);">📌 Not linked to a place</div>`;

    // Encounters
    encounters.forEach(enc => {
        const encItems = findItemsForEncounter(enc);
        html += renderPlayEncounter(enc, [], encItems);
    });

    // Read-Aloud
    readAloud.forEach(ra => {
        html += renderPlayReadAloud(ra);
    });

    // NPCs
    npcs.forEach(npc => {
        html += renderPlayNPC(npc, []);
    });

    // Items
    items.forEach(item => {
        html += renderPlayItem(item);
    });

    html += `</div>`;
    return html;
}

// During Play: Render a single encounter with full interactivity
function renderPlayEncounter(enc, linkedRA = [], linkedItems = []) {
    const statusColor = enc.status === 'completed' ? 'var(--accent-green)' : enc.status === 'started' ? 'var(--accent-gold)' : 'var(--accent-red)';
    const statusIcon = enc.status === 'completed' ? '✓' : enc.status === 'started' ? '⚔️' : '○';
    const enemies = enc.enemies || [];

    let html = `
        <div style="padding: var(--space-3); margin-bottom: var(--space-2); background: var(--bg-surface); border-radius: var(--radius-md); border-left: 3px solid ${statusColor};">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
                <span style="font-weight: 600; ${enc.status === 'completed' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">⚔️ ${escapeHtml(enc.name || 'Unnamed Encounter')}</span>
                <select onchange="sessionData.encounters[${enc._index}].status = this.value; renderDayTimeline(); triggerAutoSave();" style="padding: 2px 8px; font-size: 0.75rem; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 4px; color: var(--text-base);">
                    <option value="planned" ${enc.status !== 'started' && enc.status !== 'completed' ? 'selected' : ''}>Planned</option>
                    <option value="started" ${enc.status === 'started' ? 'selected' : ''}>⚔️ In Progress</option>
                    <option value="completed" ${enc.status === 'completed' ? 'selected' : ''}>✓ Completed</option>
                </select>
            </div>`;

    // Participants with HP controls
    if (enemies.length > 0) {
        html += `<div style="margin: var(--space-2) 0;">`;
        enemies.forEach((e, eIndex) => {
            const hp = parseInt(e.hp) || 0;
            const maxHp = parseInt(e.maxHp) || parseInt(e.hp) || 1;
            const hpPercent = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;
            const isDead = hp <= 0 && maxHp > 0;
            const isWounded = hpPercent > 0 && hpPercent < 50;
            let hpColor = 'var(--accent-green)';
            if (isDead) hpColor = 'var(--accent-red)';
            else if (isWounded) hpColor = 'var(--accent-gold)';
            const dispIcon = e.disposition === 'neutral' ? '😐' : (isDead ? '💀' : '⚔️');

            html += `
                <div style="padding: 8px; background: var(--bg-elevated); border-radius: 6px; margin-bottom: 4px; ${isDead ? 'opacity: 0.6;' : ''}">
                    <div style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
                        <span style="font-size: 0.9rem;">${dispIcon}</span>
                        <span style="flex: 1; min-width: 100px; font-size: 0.85rem; font-weight: 500; ${isDead ? 'text-decoration: line-through;' : ''}">${escapeHtml(e.name || 'Unknown')}${e.role ? ` <span style="color: var(--text-muted); font-weight: normal;">(${escapeHtml(e.role)})</span>` : ''}</span>
                        <div style="display: flex; align-items: center; gap: 4px;">
                            <button onclick="adjustParticipantHP(${enc._index}, ${eIndex}, -5); event.stopPropagation();" style="width: 32px; height: 32px; border-radius: 4px; border: 1px solid var(--border-default); background: var(--bg-surface); color: var(--text-primary); cursor: pointer; font-size: 0.75rem;">-5</button>
                            <button onclick="adjustParticipantHP(${enc._index}, ${eIndex}, -1); event.stopPropagation();" style="width: 32px; height: 32px; border-radius: 4px; border: 1px solid var(--border-default); background: var(--bg-surface); color: var(--text-primary); cursor: pointer; font-weight: bold; font-size: 1rem;">−</button>
                            <div style="min-width: 50px; text-align: center; font-weight: 600; font-size: 0.85rem; color: ${hpColor};">${hp}/${maxHp}</div>
                            <button onclick="adjustParticipantHP(${enc._index}, ${eIndex}, 1); event.stopPropagation();" style="width: 32px; height: 32px; border-radius: 4px; border: 1px solid var(--border-default); background: var(--bg-surface); color: var(--text-primary); cursor: pointer; font-weight: bold; font-size: 1rem;">+</button>
                            <button onclick="adjustParticipantHP(${enc._index}, ${eIndex}, 5); event.stopPropagation();" style="width: 32px; height: 32px; border-radius: 4px; border: 1px solid var(--border-default); background: var(--bg-surface); color: var(--text-primary); cursor: pointer; font-size: 0.75rem;">+5</button>
                        </div>
                    </div>
                </div>`;
        });
        html += `</div>`;
    }

    // Tactics
    if (enc.tactics) {
        html += `<div style="font-size: 0.8rem; color: var(--text-subdued); margin-bottom: var(--space-1);"><strong>Tactics:</strong> ${escapeHtml(enc.tactics)}</div>`;
    }

    // Loot and linked items
    if (enc.loot || linkedItems.length > 0) {
        html += `<div style="margin-top: var(--space-2);">
            <div style="font-size: 0.75rem; color: var(--accent-gold); margin-bottom: 2px;">💰 Loot:</div>`;

        if (enc.loot) {
            html += `<div style="font-size: 0.8rem; color: var(--text-secondary); padding: 4px 8px; background: var(--bg-elevated); border-radius: 4px; margin-bottom: var(--space-1);">${escapeHtml(enc.loot)}</div>`;
        }

        // Show linked items with found checkbox and "Given to" dropdown
        linkedItems.forEach(item => {
            html += renderPlayItemInline(item);
        });
        html += `</div>`;
    }

    // Nested Read-Aloud for this encounter
    if (linkedRA.length > 0) {
        html += `<div style="margin-top: var(--space-2); padding-left: var(--space-2); border-left: 2px solid var(--accent-purple);">`;
        html += linkedRA.map(ra => renderPlayReadAloud(ra)).join('');
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

// During Play: Render a single Read-Aloud
function renderPlayReadAloud(ra) {
    return `
        <div style="padding: var(--space-3); margin-bottom: var(--space-2); background: ${ra.read ? 'var(--bg-surface)' : 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(168, 85, 247, 0.02) 100%)'}; border-radius: var(--radius-sm); border-left: 3px solid ${ra.read ? 'var(--accent-green)' : 'var(--accent-purple)'}; ${ra.read ? 'opacity: 0.6;' : ''}">
            <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);">
                <input type="checkbox" ${ra.read ? 'checked' : ''} onchange="updateReadAloud(${ra._index}, 'read', this.checked); renderDayTimeline(); triggerAutoSave();" style="width: 18px; height: 18px; cursor: pointer;">
                <span style="font-weight: 500; color: var(--accent-gold); ${ra.read ? 'text-decoration: line-through;' : ''}">📖 ${escapeHtml(ra.title || 'Untitled')}</span>
            </div>
            <div style="font-style: italic; color: var(--text-base); white-space: pre-wrap; font-size: 0.9rem; padding: var(--space-2); background: var(--bg-elevated); border-radius: var(--radius-sm);">${escapeHtml(ra.text || '')}</div>
        </div>`;
}

// During Play: Render a single NPC
function renderPlayNPC(npc, linkedRA = []) {
    let html = `
        <div style="padding: var(--space-2) var(--space-3); margin-bottom: var(--space-2); background: var(--bg-surface); border-radius: var(--radius-sm); border-left: 3px solid ${npc.status === 'used' ? 'var(--accent-green)' : 'var(--primary-blue)'};">
            <div style="display: flex; align-items: center; gap: var(--space-2);">
                <input type="checkbox" ${npc.status === 'used' ? 'checked' : ''} onchange="sessionData.npcs[${npc._index}].status = this.checked ? 'used' : 'unused'; renderDayTimeline(); triggerAutoSave();" style="width: 18px; height: 18px; cursor: pointer;">
                <span style="font-weight: 500; ${npc.status === 'used' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">👤 ${escapeHtml(npc.name || 'Unnamed NPC')}</span>
                ${npc.role ? `<span style="font-size: 0.75rem; color: var(--text-subdued);">(${escapeHtml(npc.role)})</span>` : ''}
                ${npc.disposition ? `<span style="font-size: 0.7rem; padding: 1px 6px; border-radius: 4px; background: ${npc.disposition === 'friendly' ? 'var(--accent-green-20)' : npc.disposition === 'hostile' ? 'var(--accent-red-20)' : 'var(--bg-elevated)'}; color: ${npc.disposition === 'friendly' ? 'var(--accent-green)' : npc.disposition === 'hostile' ? 'var(--accent-red)' : 'var(--text-subdued)'};">${escapeHtml(npc.disposition)}</span>` : ''}
            </div>
            ${npc.description ? `<p style="margin: var(--space-1) 0 0 24px; font-size: 0.85rem; color: var(--text-subdued); ${npc.status === 'used' ? 'opacity: 0.6;' : ''}">${escapeHtml(npc.description)}</p>` : ''}`;

    // Nested Read-Aloud for this NPC
    if (linkedRA.length > 0) {
        html += `<div style="margin-top: var(--space-2); padding-left: var(--space-2); border-left: 2px solid var(--accent-purple);">`;
        html += linkedRA.map(ra => renderPlayReadAloud(ra)).join('');
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

// During Play: Render a single item (standalone)
function renderPlayItem(item) {
    const players = sessionData.players || [];
    return `
        <div style="padding: var(--space-3); margin-bottom: var(--space-2); background: var(--bg-surface); border-radius: var(--radius-sm); border-left: 3px solid ${item.found ? 'var(--accent-green)' : 'var(--accent-gold)'};">
            <div style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
                <input type="checkbox" ${item.found ? 'checked' : ''} onchange="sessionData.items[${item._index}].found = this.checked; renderDayTimeline(); triggerAutoSave();" style="width: 20px; height: 20px; cursor: pointer;">
                <span style="flex: 1; min-width: 120px; font-weight: 500; ${item.found ? 'text-decoration: line-through; opacity: 0.6;' : ''}">📜 ${escapeHtml(item.name || 'Unnamed Item')}</span>
                ${item.found ? `
                    <div style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
                        <span style="font-size: 0.8rem; color: var(--text-muted);">Given to:</span>
                        <select onchange="sessionData.items[${item._index}].givenTo = this.value; if(this.value) giveItemToPlayer(${item._index}, this.value); renderDayTimeline(); triggerAutoSave();" style="padding: 8px 12px; font-size: 0.85rem; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 6px; color: var(--text-base); min-width: 120px;">
                            <option value="">-- Select --</option>
                            ${players.map(p => {
                                const playerName = p.character || p.player || 'Unknown';
                                return `<option value="${escapeHtml(playerName)}" ${item.givenTo === playerName ? 'selected' : ''}>${escapeHtml(playerName)}</option>`;
                            }).join('')}
                        </select>
                    </div>
                ` : ''}
            </div>
            ${item.description ? `<p style="margin: var(--space-2) 0 0 28px; font-size: 0.9rem; color: var(--text-subdued); ${item.found ? 'opacity: 0.6;' : ''}">${escapeHtml(item.description)}</p>` : ''}
            ${item.found && item.givenTo ? `<div style="margin-left: 28px; margin-top: var(--space-1); font-size: 0.85rem; color: var(--accent-green);">✓ Given to ${escapeHtml(item.givenTo)}</div>` : ''}
        </div>`;
}

// During Play: Render an item inline (inside encounter loot section)
function renderPlayItemInline(item) {
    const players = sessionData.players || [];
    return `
        <div style="margin-left: var(--space-2); padding: 10px; background: linear-gradient(135deg, rgba(251, 191, 36, 0.08) 0%, rgba(251, 191, 36, 0.02) 100%); border-radius: 6px; border-left: 2px solid var(--accent-gold); margin-bottom: 6px; ${item.found ? 'opacity: 0.7;' : ''}">
            <div style="display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
                <input type="checkbox" ${item.found ? 'checked' : ''} onchange="sessionData.items[${item._index}].found = this.checked; renderDayTimeline(); triggerAutoSave();" style="width: 18px; height: 18px; cursor: pointer;">
                <span style="flex: 1; min-width: 100px; font-size: 0.9rem; font-weight: 500; color: var(--accent-gold); ${item.found ? 'text-decoration: line-through;' : ''}">📜 ${escapeHtml(item.name)}</span>
                ${item.found ? `
                    <div style="display: flex; align-items: center; gap: var(--space-1); flex-wrap: wrap;">
                        <span style="font-size: 0.8rem; color: var(--text-muted);">Given to:</span>
                        <select onchange="sessionData.items[${item._index}].givenTo = this.value; if(this.value) giveItemToPlayer(${item._index}, this.value); renderDayTimeline(); triggerAutoSave();" style="padding: 6px 10px; font-size: 0.8rem; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 4px; color: var(--text-base); min-width: 100px;">
                            <option value="">--</option>
                            ${players.map(p => {
                                const playerName = p.character || p.player || 'Unknown';
                                return `<option value="${escapeHtml(playerName)}" ${item.givenTo === playerName ? 'selected' : ''}>${escapeHtml(playerName)}</option>`;
                            }).join('')}
                        </select>
                    </div>
                ` : ''}
            </div>
            ${item.description ? `<div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 4px; font-style: italic;">"${escapeHtml(item.description)}"</div>` : ''}
        </div>`;
}

// Players
function renderPlayersList() {
    const container = document.getElementById('players-list');
    if (!sessionData.players || sessionData.players.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No players added yet. Campaign members will appear automatically when they join.</p>';
        return;
    }

    container.innerHTML = sessionData.players.map((p, i) => {
        const isCampaignMember = p.isCampaignMember || p.userId;
        const memberBadge = isCampaignMember
            ? '<span style="background: var(--accent-green-20); color: var(--accent-green); padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; margin-left: 8px;">MEMBER</span>'
            : '';
        const removeBtn = isCampaignMember
            ? `<button class="remove-btn" onclick="removeSessionPlayer(${i}, true)" title="Force remove">&times;</button>`
            : `<button class="remove-btn" onclick="removeSessionPlayer(${i})">&times;</button>`;
        const playerInputReadonly = isCampaignMember ? 'readonly style="background: var(--bg-highlight);"' : '';

        // Background section if filled in
        let backgroundSection = '';
        if (p.background && p.background.trim()) {
            backgroundSection = `
                <div class="player-background-section" style="margin-top: 8px; padding: 10px; background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border-subtle); border-left: 3px solid var(--accent-purple);">
                    <div style="font-size: 0.7rem; color: var(--accent-purple); font-weight: 600; margin-bottom: 4px; text-transform: uppercase;">Background</div>
                    <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.4;">${escapeHtml(p.background)}</div>
                </div>
            `;
        }

        // XP and lock info for campaign members with linked characters
        let xpSection = '';
        if (isCampaignMember && p.characterId) {
            const xp = p.xp || 0;
            const xpSpent = p.xp_spent || 0;
            const remainingXP = xp - xpSpent;
            const availablePoints = Math.floor(xp / 10) - Math.floor(xpSpent / 10);
            const rcLocked = p.race_class_locked;
            const atLocked = p.attributes_locked;
            const abLocked = p.abilities_locked;

            // Build warning message for unlocked items
            let unlockWarnings = [];
            if (!rcLocked) unlockWarnings.push('Race/Class');
            if (!atLocked) unlockWarnings.push('Attributes');
            if (!abLocked) unlockWarnings.push('Abilities');

            const warningSection = unlockWarnings.length > 0 ? `
                <div style="margin-bottom: 6px; padding: 6px 10px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 4px;">
                    <span style="font-size: 0.75rem; color: #ef4444;">⚠️ Not locked: <strong>${unlockWarnings.join(', ')}</strong></span>
                </div>
            ` : '';

            xpSection = `
                <div class="player-xp-section" style="margin-top: 8px; padding: 8px; background: var(--bg-surface); border-radius: 6px; border: 1px solid var(--border-subtle);">
                    ${warningSection}
                    <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap;">
                        <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                            <span style="font-size: 0.75rem; color: var(--text-muted);">
                                XP: <strong style="color: var(--accent-gold);">${remainingXP}</strong>
                                ${availablePoints > 0 ? `<span style="color: var(--accent-green);">(${availablePoints}pt)</span>` : ''}
                            </span>
                            <span style="font-size: 0.7rem; color: ${rcLocked ? 'var(--text-muted)' : '#ef4444'};">${rcLocked ? '🔒' : '🔓'}R/C</span>
                            <span style="font-size: 0.7rem; color: ${atLocked ? 'var(--text-muted)' : '#ef4444'};">${atLocked ? '🔒' : '🔓'}Attr</span>
                            <span style="font-size: 0.7rem; color: ${abLocked ? 'var(--text-muted)' : '#ef4444'};">${abLocked ? '🔒' : '🔓'}Abil</span>
                        </div>
                        <div style="display: flex; gap: 6px;">
                            <button class="btn-small btn-gold" onclick="showGiveXPModal(${p.characterId}, '${escapeHtml(p.character || p.player)}')" title="Give XP">✨ XP</button>
                            <button class="btn-small btn-secondary" onclick="unlockCharacter(${p.characterId}, '${escapeHtml(p.character || p.player)}')" title="Unlock">🔓</button>
                        </div>
                    </div>
                </div>
            `;
        }

        return `
        <div class="dynamic-item" ${isCampaignMember ? 'style="border-left: 3px solid var(--accent-green);"' : ''}>
            ${removeBtn}
            <div class="grid grid-3" style="gap: var(--space-2);">
                <div class="field-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.7rem;">Player${memberBadge}</label>
                    <input type="text" value="${escapeHtml(p.player || '')}" ${playerInputReadonly} ${isCampaignMember ? '' : `onchange="sessionData.players[${i}].player = this.value"`} placeholder="Player name">
                </div>
                <div class="field-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.7rem;">Character</label>
                    <input type="text" value="${escapeHtml(p.character || '')}" onchange="sessionData.players[${i}].character = this.value" placeholder="${isCampaignMember ? 'Waiting for character...' : 'Character name'}">
                </div>
                <div class="field-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.7rem;">Race</label>
                    <input type="text" value="${escapeHtml(p.race || '')}" onchange="sessionData.players[${i}].race = this.value" placeholder="Race">
                </div>
                <div class="field-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.7rem;">Class</label>
                    <input type="text" value="${escapeHtml(p.class || '')}" onchange="sessionData.players[${i}].class = this.value" placeholder="Class">
                </div>
                <div class="field-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.7rem;">Religion</label>
                    <input type="text" value="${escapeHtml(p.religion || '')}" onchange="sessionData.players[${i}].religion = this.value" placeholder="Religion">
                </div>
                <div class="field-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.7rem;">Notes</label>
                    <input type="text" value="${escapeHtml(p.notes || '')}" onchange="sessionData.players[${i}].notes = this.value" placeholder="Notes">
                </div>
            </div>
            ${backgroundSection}
            ${xpSection}
        </div>
    `}).join('');
}

function addPlayer() {
    sessionData.players.push({ player: '', character: '', race: '', class: '', religion: '', notes: '' });
    renderPlayersList();
    updateLockUI();
    triggerAutoSave();
}

function removeSessionPlayer(index, isMember = false) {
    if (isMember) {
        if (!confirm('This player is a campaign member. Remove from this session?')) {
            return;
        }
    }
    sessionData.players.splice(index, 1);
    renderPlayersList();
    triggerAutoSave();
}

// Sync campaign members to players list
async function syncCampaignPlayers() {
    if (!currentCampaignId) return;

    try {
        const res = await fetch(`/api/campaigns/${currentCampaignId}/players`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (!res.ok) return;

        const data = await res.json();
        const campaignPlayers = data.players || [];

        // Initialize players array if empty
        if (!sessionData.players) {
            sessionData.players = [];
        }

        // Create a map of existing players by username (for campaign members)
        const existingByUsername = new Map();
        sessionData.players.forEach((p, i) => {
            if (p.userId) {
                existingByUsername.set(p.userId, i);
            }
        });

        // Add/update campaign members
        campaignPlayers.forEach(cp => {
            const existingIndex = existingByUsername.get(cp.id);

            if (existingIndex !== undefined) {
                // Update existing player with character data if they linked a character
                if (cp.character) {
                    sessionData.players[existingIndex].character = cp.character.name || '';
                    sessionData.players[existingIndex].characterId = cp.character.id;
                    sessionData.players[existingIndex].race = cp.character.race || '';
                    sessionData.players[existingIndex].class = cp.character.class || '';
                    sessionData.players[existingIndex].religion = cp.character.religion || '';
                    sessionData.players[existingIndex].background = cp.character.background || '';
                    sessionData.players[existingIndex].xp = cp.character.xp || 0;
                    sessionData.players[existingIndex].xp_spent = cp.character.xp_spent || 0;
                    sessionData.players[existingIndex].race_class_locked = cp.character.race_class_locked || false;
                    sessionData.players[existingIndex].attributes_locked = cp.character.attributes_locked || false;
                    sessionData.players[existingIndex].abilities_locked = cp.character.abilities_locked || false;
                }
            } else {
                // Add new campaign member
                const newPlayer = {
                    player: cp.username,
                    userId: cp.id,
                    isCampaignMember: true,
                    character: cp.character ? cp.character.name : '',
                    characterId: cp.character ? cp.character.id : null,
                    race: cp.character ? cp.character.race : '',
                    class: cp.character ? cp.character.class : '',
                    religion: cp.character ? cp.character.religion : '',
                    background: cp.character ? cp.character.background : '',
                    xp: cp.character ? cp.character.xp : 0,
                    xp_spent: cp.character ? cp.character.xp_spent : 0,
                    race_class_locked: cp.character ? cp.character.race_class_locked : false,
                    attributes_locked: cp.character ? cp.character.attributes_locked : false,
                    abilities_locked: cp.character ? cp.character.abilities_locked : false,
                    notes: ''
                };
                sessionData.players.push(newPlayer);
            }
        });

        // Remove campaign members who are no longer in the campaign
        const campaignUserIds = new Set(campaignPlayers.map(cp => cp.id));
        sessionData.players = sessionData.players.filter(p => {
            if (p.isCampaignMember && p.userId && !campaignUserIds.has(p.userId)) {
                return false;
            }
            return true;
        });

        renderPlayersList();
    } catch (error) {
        console.error('Error syncing campaign players:', error);
    }
}

async function importPlayersFromPrevious() {
    if (!currentCampaignId) return;

    try {
        // Fetch all sessions for this campaign
        const res = await fetch(`/api/campaigns/${currentCampaignId}/sessions`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const sessions = await res.json();

        // Find the previous session (the one before current)
        const currentSessionNumber = parseInt(document.getElementById('session_number').value) || 0;
        const previousSession = sessions
            .filter(s => s.session_number < currentSessionNumber)
            .sort((a, b) => b.session_number - a.session_number)[0];

        if (!previousSession) {
            alert('No previous session found to import players from.');
            return;
        }

        // Fetch the previous session data
        const sessionRes = await fetch(`/api/sessions/${previousSession.id}`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const prevSessionData = await sessionRes.json();

        if (!prevSessionData.data || !prevSessionData.data.players || prevSessionData.data.players.length === 0) {
            alert('No players found in the previous session.');
            return;
        }

        // Import players (clear notes field for new session)
        const importedPlayers = prevSessionData.data.players.map(p => ({
            player: p.player || '',
            character: p.character || '',
            race: p.race || '',
            class: p.class || '',
            religion: p.religion || '',
            notes: ''  // Clear notes for new session
        }));

        // Ask if they want to replace or add to existing players
        if (sessionData.players && sessionData.players.length > 0) {
            showConfirmModal(
                'Import Players',
                `Found ${importedPlayers.length} players in Session ${previousSession.session_number}. Do you want to replace your current players or add to them?`,
                () => {
                    // Replace existing
                    sessionData.players = importedPlayers;
                    renderPlayersList();
                    updateLockUI();
                }
            );
            // Add option to add instead of replace
            document.getElementById('confirm-btn').textContent = 'Replace';
        } else {
            sessionData.players = importedPlayers;
            renderPlayersList();
            updateLockUI();
            alert(`Imported ${importedPlayers.length} players from Session ${previousSession.session_number}!`);
        }

    } catch (error) {
        console.error('Import players error:', error);
        alert('Failed to import players. Please try again.');
    }
}

// Scenes
function renderScenesList() {
    const container = document.getElementById('scenes-list');
    if (!sessionData.scenes || sessionData.scenes.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No scenes added yet.</p>';
        return;
    }

    container.innerHTML = sessionData.scenes.map((s, i) => `
        <div class="dynamic-item">
            <button class="remove-btn" onclick="removeScene(${i})">&times;</button>
            <div class="field-group" style="margin-bottom: var(--space-2);">
                <label style="color: var(--accent-gold);">Scene ${i + 1} Title</label>
                <input type="text" value="${escapeHtml(s.title || '')}" onchange="sessionData.scenes[${i}].title = this.value" placeholder="Scene title">
            </div>
            <div class="field-group" style="margin-bottom: 0;">
                <label>Notes</label>
                <textarea rows="4" onchange="sessionData.scenes[${i}].notes = this.value" placeholder="What happens in this scene?">${escapeHtml(s.notes || '')}</textarea>
            </div>
        </div>
    `).join('');
}

function addScene() {
    sessionData.scenes.push({ title: '', notes: '' });
    renderScenesList();
    updateLockUI();
    triggerAutoSave();
}

function removeScene(index) {
    sessionData.scenes.splice(index, 1);
    renderScenesList();
    triggerAutoSave();
}

// Decisions
function renderDecisionsList() {
    const container = document.getElementById('decisions-list');
    if (!sessionData.decisionPoints || sessionData.decisionPoints.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No decision points added yet.</p>';
        return;
    }

    container.innerHTML = sessionData.decisionPoints.map((d, i) => `
        <div class="decision-card">
            <button class="remove-btn" onclick="removeDecision(${i})">&times;</button>
            <h3 style="color: var(--primary-purple); margin-bottom: var(--space-3);">Decision ${i + 1}</h3>
            <div class="field-group">
                <label>Trigger</label>
                <input type="text" value="${escapeHtml(d.trigger || '')}" onchange="sessionData.decisionPoints[${i}].trigger = this.value" placeholder="What triggers this decision?">
            </div>
            <div class="decision-options">
                <div class="decision-option">
                    <label>Option A</label>
                    <input type="text" value="${escapeHtml(d.optionA || '')}" onchange="sessionData.decisionPoints[${i}].optionA = this.value" placeholder="Option A" style="margin-bottom: var(--space-2);">
                    <input type="text" value="${escapeHtml(d.consequenceA || '')}" onchange="sessionData.decisionPoints[${i}].consequenceA = this.value" placeholder="Leads to...">
                </div>
                <div class="decision-option">
                    <label>Option B</label>
                    <input type="text" value="${escapeHtml(d.optionB || '')}" onchange="sessionData.decisionPoints[${i}].optionB = this.value" placeholder="Option B" style="margin-bottom: var(--space-2);">
                    <input type="text" value="${escapeHtml(d.consequenceB || '')}" onchange="sessionData.decisionPoints[${i}].consequenceB = this.value" placeholder="Leads to...">
                </div>
                <div class="decision-option">
                    <label>Option C</label>
                    <input type="text" value="${escapeHtml(d.optionC || '')}" onchange="sessionData.decisionPoints[${i}].optionC = this.value" placeholder="Option C" style="margin-bottom: var(--space-2);">
                    <input type="text" value="${escapeHtml(d.consequenceC || '')}" onchange="sessionData.decisionPoints[${i}].consequenceC = this.value" placeholder="Leads to...">
                </div>
            </div>
            <div class="field-group" style="margin-top: var(--space-4);">
                <label style="color: var(--accent-green);">What they chose</label>
                <input type="text" value="${escapeHtml(d.chosen || '')}" onchange="sessionData.decisionPoints[${i}].chosen = this.value" placeholder="Record their decision here">
            </div>
        </div>
    `).join('');
}

function addDecision() {
    sessionData.decisionPoints.push({ trigger: '', optionA: '', consequenceA: '', optionB: '', consequenceB: '', optionC: '', consequenceC: '', chosen: '' });
    renderDecisionsList();
    updateLockUI();
    triggerAutoSave();
}

function removeDecision(index) {
    sessionData.decisionPoints.splice(index, 1);
    renderDecisionsList();
    triggerAutoSave();
}

// NPCs
function renderNPCsList() {
    const container = document.getElementById('npcs-list');
    if (!sessionData.npcs || sessionData.npcs.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No NPCs added yet.</p>';
        return;
    }

    container.innerHTML = sessionData.npcs.map((npc, i) => `
        <div class="npc-card">
            <button class="remove-btn" onclick="removeNPC(${i})">&times;</button>
            <div class="grid grid-2" style="gap: var(--space-2);">
                <div class="field-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.7rem; color: var(--primary-blue);">Name</label>
                    <input type="text" value="${escapeHtml(npc.name || '')}" onchange="sessionData.npcs[${i}].name = this.value; renderPlayLists();" placeholder="NPC name">
                </div>
                <div class="field-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.7rem;">Role</label>
                    <input type="text" value="${escapeHtml(npc.role || '')}" onchange="sessionData.npcs[${i}].role = this.value" placeholder="Merchant, guard, etc.">
                </div>
                <div class="field-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.7rem;">Planned Location</label>
                    <input type="text" value="${escapeHtml(npc.plannedLocation || npc.location || '')}" onchange="sessionData.npcs[${i}].plannedLocation = this.value" placeholder="Where might they be?">
                </div>
                <div class="field-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.7rem;">Disposition</label>
                    <input type="text" value="${escapeHtml(npc.disposition || '')}" onchange="sessionData.npcs[${i}].disposition = this.value" placeholder="Friendly, hostile, etc.">
                </div>
            </div>
            <div class="grid grid-2" style="gap: var(--space-2); margin-top: var(--space-2);">
                <div class="field-group" style="margin-bottom: 0; flex: 1;">
                    <label style="font-size: 0.7rem;">Description / Info</label>
                    <textarea rows="2" onchange="sessionData.npcs[${i}].description = this.value" placeholder="What do they know? What can they provide?">${escapeHtml(npc.description || npc.info || '')}</textarea>
                </div>
                <div class="field-group" style="margin-bottom: 0; max-width: 80px;">
                    <label style="font-size: 0.7rem; color: var(--accent-blue);">Day</label>
                    <input type="number" min="1" value="${npc.day || ''}" onchange="sessionData.npcs[${i}].day = this.value ? parseInt(this.value) : null; renderPlayLists();" placeholder="-" style="text-align: center;">
                </div>
            </div>
        </div>
    `).join('');
}

function addNPC() {
    sessionData.npcs.push({ name: '', role: '', plannedLocation: '', actualLocation: '', disposition: '', description: '', status: 'unused', day: null, notes: '' });
    renderPlanningByDay();
    renderNPCsList();
    renderPlayLists();
    updateLockUI();
    triggerAutoSave();
}

function generateAndAddNPC() {
    const race = document.getElementById('npc-gen-race').value;
    const gender = document.getElementById('npc-gen-gender').value;

    // Generate name using the NPC_NAMES data
    const generatedName = generateNPCName(race, gender);

    // Show preview
    const preview = document.getElementById('npc-gen-preview');
    if (preview) {
        preview.textContent = generatedName;
    }

    // Add NPC with the generated name
    sessionData.npcs.push({
        name: generatedName,
        role: '',
        plannedLocation: '',
        actualLocation: '',
        disposition: '',
        description: '',
        status: 'unused',
        day: null,
        notes: ''
    });

    renderPlanningByDay();
    renderNPCsList();
    renderPlayLists();
    updateLockUI();
    triggerAutoSave();
}

function removeNPC(index) {
    sessionData.npcs.splice(index, 1);
    renderPlanningByDay();
    renderNPCsList();
    renderPlayLists();
    triggerAutoSave();
}

// Play mode NPC list (compact with status)
function renderPlayNPCsList() {
    const container = document.getElementById('play-npcs-list');
    if (!container) return;

    if (!sessionData.npcs || sessionData.npcs.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic; font-size: 0.85rem;">No NPCs yet</p>';
        return;
    }

    // Progress indicator
    const usedCount = sessionData.npcs.filter(n => n.status === 'used').length;
    const totalCount = sessionData.npcs.length;

    let html = `<div style="font-size: 0.75rem; color: var(--accent-cyan); margin-bottom: var(--space-2);">${usedCount}/${totalCount} introduced</div>`;

    html += sessionData.npcs.map((npc, i) => `
        <div class="play-item ${npc.status === 'used' ? 'used' : ''}" style="padding: var(--space-2); margin-bottom: var(--space-2); background: var(--bg-surface); border-radius: var(--radius-sm); border-left: 3px solid ${npc.status === 'used' ? 'var(--accent-green)' : 'var(--accent-cyan)'}; cursor: pointer;" onclick="toggleNPCDetails(${i})">
            <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-1);">
                <input type="checkbox" ${npc.status === 'used' ? 'checked' : ''} onclick="event.stopPropagation(); sessionData.npcs[${i}].status = this.checked ? 'used' : 'unused'; renderNPCsList(); renderPlayNPCsList(); triggerAutoSave();" style="width: 18px; height: 18px; cursor: pointer;">
                <span style="flex: 1; font-weight: 500; ${npc.status === 'used' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${escapeHtml(npc.name || 'Unnamed NPC')}</span>
                <span style="font-size: 0.75rem; color: var(--text-muted);">📍 ${escapeHtml(npc.actualLocation || npc.plannedLocation || '?')}</span>
            </div>
            <div style="font-size: 0.8rem; color: var(--accent-gold); margin-bottom: var(--space-1);">${escapeHtml(npc.role || '')} ${npc.disposition ? '• ' + escapeHtml(npc.disposition) : ''}</div>
            <div style="font-size: 0.85rem; color: var(--text-subdued); ${npc.status === 'used' ? 'opacity: 0.6;' : ''}">${escapeHtml(npc.description || npc.info || 'No description')}</div>
        </div>
        <div id="npc-details-${i}" class="play-item-details" style="display: none; padding: var(--space-3); margin-bottom: var(--space-2); margin-top: -8px; background: var(--bg-elevated); border-radius: 0 0 var(--radius-md) var(--radius-md); border: 1px solid var(--border-default); border-top: none;">
            <div class="field-group" style="margin-bottom: var(--space-2);">
                <label style="font-size: 0.7rem;">Actual Location</label>
                <input type="text" value="${escapeHtml(npc.actualLocation || '')}" onchange="sessionData.npcs[${i}].actualLocation = this.value; renderNPCsList(); renderPlayNPCsList();" placeholder="Where did they actually appear?">
            </div>
            <div class="field-group" style="margin-bottom: 0;">
                <label style="font-size: 0.7rem;">Session Notes</label>
                <input type="text" value="${escapeHtml(npc.notes || '')}" onchange="sessionData.npcs[${i}].notes = this.value" placeholder="What happened with this NPC?">
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function toggleNPCDetails(index) {
    const details = document.getElementById(`npc-details-${index}`);
    if (details) {
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
    }
}

// Places
function renderPlacesList() {
    const container = document.getElementById('places-list');
    if (!container) return;

    if (!sessionData.places || sessionData.places.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No places added yet.</p>';
        return;
    }

    container.innerHTML = sessionData.places.map((place, i) => `
        <div class="dynamic-item">
            <button class="remove-btn" onclick="removePlace(${i})">&times;</button>
            <div style="display: flex; gap: var(--space-2); align-items: flex-end;">
                <div class="field-group" style="margin-bottom: 0; flex: 1;">
                    <label style="font-size: 0.7rem; color: var(--accent-cyan);">Name</label>
                    <input type="text" value="${escapeHtml(place.name || '')}" onchange="sessionData.places[${i}].name = this.value; renderPlayLists();" placeholder="Place name">
                </div>
                <div class="field-group" style="margin-bottom: 0; flex: 2;">
                    <label style="font-size: 0.7rem;">Description</label>
                    <input type="text" value="${escapeHtml(place.description || '')}" onchange="sessionData.places[${i}].description = this.value" placeholder="What's here?">
                </div>
                <div class="field-group" style="margin-bottom: 0; max-width: 70px;">
                    <label style="font-size: 0.7rem; color: var(--accent-blue);">Day</label>
                    <input type="number" min="1" value="${place.day || ''}" onchange="sessionData.places[${i}].day = this.value ? parseInt(this.value) : null; renderPlayLists();" placeholder="-" style="text-align: center;">
                </div>
            </div>
        </div>
    `).join('');
}

function addPlace() {
    if (!sessionData.places) sessionData.places = [];
    sessionData.places.push({ name: '', description: '', visited: false, day: null, notes: '' });
    renderPlanningByDay();
    renderPlacesList();
    renderPlayLists();
    updateLockUI();
    triggerAutoSave();
}

function removePlace(index) {
    sessionData.places.splice(index, 1);
    renderPlanningByDay();
    renderPlacesList();
    renderPlayLists();
    triggerAutoSave();
}

function renderPlayPlacesList() {
    const container = document.getElementById('play-places-list');
    if (!container) return;

    if (!sessionData.places || sessionData.places.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic; font-size: 0.85rem;">No places yet</p>';
        return;
    }

    // Progress indicator
    const visitedCount = sessionData.places.filter(p => p.visited).length;
    const totalCount = sessionData.places.length;

    let html = `<div style="font-size: 0.75rem; color: var(--accent-cyan); margin-bottom: var(--space-2);">${visitedCount}/${totalCount} visited</div>`;

    html += sessionData.places.map((place, i) => `
        <div class="play-item" style="padding: var(--space-2); margin-bottom: var(--space-2); background: var(--bg-surface); border-radius: var(--radius-sm); border-left: 3px solid ${place.visited ? 'var(--accent-green)' : 'var(--accent-purple)'};">
            <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: ${place.description ? 'var(--space-1)' : '0'};">
                <input type="checkbox" ${place.visited ? 'checked' : ''} onchange="sessionData.places[${i}].visited = this.checked; renderPlacesList(); renderPlayPlacesList(); triggerAutoSave();" style="width: 18px; height: 18px; cursor: pointer;">
                <span style="flex: 1; font-weight: 500; ${place.visited ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${escapeHtml(place.name || 'Unnamed Place')}</span>
            </div>
            ${place.description ? `<div style="font-size: 0.85rem; color: var(--text-subdued); margin-left: 24px; ${place.visited ? 'opacity: 0.6;' : ''}">${escapeHtml(place.description)}</div>` : ''}
        </div>
    `).join('');

    container.innerHTML = html;
}

// Encounters (new format)
function renderEncountersList() {
    const container = document.getElementById('encounters-list');
    if (!container) return;

    if (!sessionData.encounters || sessionData.encounters.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No encounters added yet.</p>';
        return;
    }

    container.innerHTML = sessionData.encounters.map((enc, i) => `
        <div class="combat-encounter" id="planning-encounter-${i}">
            <button class="remove-btn" onclick="removeEncounter(${i})">&times;</button>
            <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-3);">
                <div class="field-group" style="margin-bottom: 0; flex: 1;">
                    <label style="font-size: 0.7rem; color: var(--accent-red);">Encounter Name</label>
                    <input type="text" value="${escapeHtml(enc.name || '')}" onchange="sessionData.encounters[${i}].name = this.value; renderPlayLists();" placeholder="e.g., Tavern Ambush">
                </div>
                <div class="field-group" style="margin-bottom: 0; flex: 1;">
                    <label style="font-size: 0.7rem;">Location</label>
                    <input type="text" value="${escapeHtml(enc.location || '')}" onchange="sessionData.encounters[${i}].location = this.value" placeholder="Where does this happen?">
                </div>
                <div class="field-group" style="margin-bottom: 0; max-width: 70px;">
                    <label style="font-size: 0.7rem; color: var(--accent-blue);">Day</label>
                    <input type="number" min="1" value="${enc.day || ''}" onchange="sessionData.encounters[${i}].day = this.value ? parseInt(this.value) : null; renderPlayLists();" placeholder="-" style="text-align: center;">
                </div>
            </div>
            <div class="field-group">
                <label>Participants</label>
                <div id="encounter-enemies-${i}">
                    ${(enc.enemies || []).map((e, j) => `
                        <div class="participant-row" style="background: var(--bg-elevated); padding: var(--space-2); border-radius: var(--radius-sm); margin-bottom: var(--space-2); position: relative;">
                            <button class="remove-btn" onclick="removeEncounterEnemy(${i}, ${j})">&times;</button>
                            <div style="display: grid; grid-template-columns: 1fr auto auto auto; gap: var(--space-2); margin-bottom: var(--space-2);">
                                <input type="text" value="${escapeHtml(e.name || '')}" onchange="sessionData.encounters[${i}].enemies[${j}].name = this.value" placeholder="Name (e.g., Bandit, Vince)" style="font-weight: 500;">
                                <select onchange="sessionData.encounters[${i}].enemies[${j}].disposition = this.value; renderEncountersList();" style="padding: 4px 8px; min-width: 90px;">
                                    <option value="enemy" ${(e.disposition || 'enemy') === 'enemy' ? 'selected' : ''}>⚔️ Enemy</option>
                                    <option value="neutral" ${e.disposition === 'neutral' ? 'selected' : ''}>😐 Neutral</option>
                                </select>
                                <select onchange="sessionData.encounters[${i}].enemies[${j}].role = this.value;" style="padding: 4px 8px; min-width: 100px;">
                                    <option value="" ${!e.role ? 'selected' : ''}>Role...</option>
                                    <option value="Warrior" ${e.role === 'Warrior' ? 'selected' : ''}>Warrior</option>
                                    <option value="Rogue" ${e.role === 'Rogue' ? 'selected' : ''}>Rogue</option>
                                    <option value="Mage" ${e.role === 'Mage' ? 'selected' : ''}>Mage</option>
                                    <option value="Healer" ${e.role === 'Healer' ? 'selected' : ''}>Healer</option>
                                    <option value="Ranger" ${e.role === 'Ranger' ? 'selected' : ''}>Ranger</option>
                                    <option value="Beast" ${e.role === 'Beast' ? 'selected' : ''}>Beast</option>
                                    <option value="Civilian" ${e.role === 'Civilian' ? 'selected' : ''}>Civilian</option>
                                    <option value="Historian" ${e.role === 'Historian' ? 'selected' : ''}>Historian</option>
                                    <option value="Other" ${e.role === 'Other' ? 'selected' : ''}>Other</option>
                                </select>
                                <input type="text" value="${escapeHtml(e.hp || '')}" onchange="updateParticipantHP(${i}, ${j}, this.value)" placeholder="HP" style="width: 50px; text-align: center;">
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr 60px 60px; gap: var(--space-2);">
                                <input type="text" value="${escapeHtml(e.armor || '')}" onchange="sessionData.encounters[${i}].enemies[${j}].armor = this.value" placeholder="Armor">
                                <input type="text" value="${escapeHtml(e.weapon || '')}" onchange="sessionData.encounters[${i}].enemies[${j}].weapon = this.value" placeholder="Weapon">
                                <input type="text" value="${escapeHtml(e.atkBonus || '')}" onchange="sessionData.encounters[${i}].enemies[${j}].atkBonus = this.value" placeholder="Atk">
                                <input type="text" value="${escapeHtml(e.dmg || '')}" onchange="sessionData.encounters[${i}].enemies[${j}].dmg = this.value" placeholder="Dmg">
                            </div>
                        </div>
                    `).join('')}
                </div>
                <button class="quick-add-btn" onclick="addEncounterEnemy(${i})" style="margin-top: var(--space-2); padding: 4px 12px; font-size: 0.8rem;">+ Participant</button>
            </div>
            <div class="grid grid-2" style="margin-top: var(--space-3);">
                <div class="field-group" style="margin-bottom: 0;">
                    <label>Tactics</label>
                    <textarea rows="2" onchange="sessionData.encounters[${i}].tactics = this.value" placeholder="How do they fight?">${escapeHtml(enc.tactics || '')}</textarea>
                </div>
                <div class="field-group" style="margin-bottom: 0;">
                    <label>Loot</label>
                    <textarea rows="2" onchange="sessionData.encounters[${i}].loot = this.value" placeholder="What can be looted?">${escapeHtml(enc.loot || '')}</textarea>
                </div>
            </div>
        </div>
    `).join('');
}

function addEncounter() {
    if (!sessionData.encounters) sessionData.encounters = [];
    sessionData.encounters.push({ name: '', location: '', enemies: [], tactics: '', loot: '', status: 'planned', day: null, notes: '' });
    renderPlanningByDay();
    renderEncountersList();
    renderPlayLists();
    updateLockUI();
    triggerAutoSave();
}

function removeEncounter(index) {
    sessionData.encounters.splice(index, 1);
    renderPlanningByDay();
    renderEncountersList();
    renderPlayLists();
    triggerAutoSave();
}

function addEncounterEnemy(encIndex) {
    if (!sessionData.encounters[encIndex].enemies) {
        sessionData.encounters[encIndex].enemies = [];
    }
    sessionData.encounters[encIndex].enemies.push({
        name: '',
        disposition: 'enemy',
        role: '',
        hp: '',
        maxHp: '',
        armor: '',
        weapon: '',
        atkBonus: '',
        dmg: ''
    });
    renderPlanningByDay();
    renderEncountersList();
    updateLockUI();
    triggerAutoSave();
}

// Update participant HP and set maxHp if not already set
function updateParticipantHP(encIndex, enemyIndex, value) {
    const enemy = sessionData.encounters[encIndex].enemies[enemyIndex];
    enemy.hp = value;
    // Set maxHp if it's empty or if hp is higher than current maxHp
    if (!enemy.maxHp || (value && parseInt(value) > parseInt(enemy.maxHp || 0))) {
        enemy.maxHp = value;
    }
    triggerAutoSave();
}

// Adjust participant HP by delta (used by +/- buttons in During Play)
function adjustParticipantHP(encIndex, enemyIndex, delta, refreshModal = false) {
    const enemy = sessionData.encounters[encIndex].enemies[enemyIndex];
    const currentHP = parseInt(enemy.hp) || 0;
    const maxHP = parseInt(enemy.maxHp) || parseInt(enemy.hp) || 0;
    const newHP = Math.max(0, Math.min(maxHP, currentHP + delta));
    enemy.hp = newHP.toString();
    // Only re-render modal if explicitly requested
    if (refreshModal) {
        showEncounterDetail(encIndex);
    }
    renderPlayEncountersList();
    renderDayTimeline();
    triggerAutoSave();
}

function removeEncounterEnemy(encIndex, enemyIndex) {
    sessionData.encounters[encIndex].enemies.splice(enemyIndex, 1);
    renderPlanningByDay();
    renderEncountersList();
    triggerAutoSave();
}

function renderPlayEncountersList() {
    const container = document.getElementById('play-encounters-list');
    if (!container) return;

    if (!sessionData.encounters || sessionData.encounters.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic; font-size: 0.85rem;">No encounters yet</p>';
        return;
    }

    // Progress indicator
    const completedCount = sessionData.encounters.filter(e => e.status === 'completed').length;
    const inProgressCount = sessionData.encounters.filter(e => e.status === 'started').length;
    const totalCount = sessionData.encounters.length;

    let html = `<div style="font-size: 0.75rem; color: var(--accent-cyan); margin-bottom: var(--space-2);">${completedCount}/${totalCount} completed${inProgressCount > 0 ? ` • ${inProgressCount} in progress` : ''}</div>`;

    html += sessionData.encounters.map((enc, i) => {
        const statusColors = {
            'planned': 'var(--text-muted)',
            'started': 'var(--accent-gold)',
            'completed': 'var(--accent-green)'
        };
        const statusColor = statusColors[enc.status] || statusColors.planned;

        // Calculate participant stats
        const enemies = enc.enemies || [];
        const enemyCount = enemies.filter(e => e.disposition === 'enemy' || !e.disposition).length;
        const neutralCount = enemies.filter(e => e.disposition === 'neutral').length;
        const aliveCount = enemies.filter(e => {
            const hp = parseInt(e.hp) || 0;
            return hp > 0;
        }).length;
        const deadCount = enemies.length - aliveCount;

        // Build participant summary
        let participantSummary = '';
        if (enemies.length > 0) {
            const parts = [];
            if (enemyCount > 0) parts.push(`${enemyCount} enemy`);
            if (neutralCount > 0) parts.push(`${neutralCount} neutral`);
            participantSummary = parts.join(', ');
            if (deadCount > 0) {
                participantSummary += ` (${deadCount} 💀)`;
            }
        } else {
            participantSummary = 'No participants';
        }

        // Build compact participant HP list for active encounters
        let participantList = '';
        if (enc.status === 'started' && enemies.length > 0) {
            participantList = `<div style="margin-top: var(--space-2); display: flex; flex-wrap: wrap; gap: var(--space-1);">` +
                enemies.map((enemy, ei) => {
                    const hp = parseInt(enemy.hp) || 0;
                    const maxHp = parseInt(enemy.maxHp) || hp || 1;
                    const hpPercent = maxHp > 0 ? (hp / maxHp) * 100 : 0;
                    const isDead = hp <= 0;
                    let hpColor = 'var(--accent-green)';
                    if (isDead) hpColor = 'var(--accent-red)';
                    else if (hpPercent < 50) hpColor = 'var(--accent-gold)';
                    const dispIcon = enemy.disposition === 'neutral' ? '🟡' : '🔴';

                    return `<span style="font-size: 0.7rem; padding: 2px 6px; background: var(--bg-elevated); border-radius: var(--radius-sm); ${isDead ? 'opacity: 0.5; text-decoration: line-through;' : ''}" title="${escapeHtml(enemy.name || 'Unknown')}">${dispIcon} ${escapeHtml((enemy.name || 'Unknown').substring(0, 10))} <span style="color: ${hpColor};">${hp}/${maxHp}</span></span>`;
                }).join('') +
            `</div>`;
        }

        return `
            <div class="play-item" style="padding: var(--space-2); margin-bottom: var(--space-2); background: var(--bg-surface); border-radius: var(--radius-sm); border-left: 3px solid ${statusColor}; cursor: pointer;" onclick="showEncounterDetail(${i})">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-1);">
                    <span style="font-weight: 500; ${enc.status === 'completed' ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${escapeHtml(enc.name || 'Unnamed Encounter')}</span>
                    <select onclick="event.stopPropagation();" onchange="sessionData.encounters[${i}].status = this.value; renderEncountersList(); renderPlayEncountersList(); triggerAutoSave();" style="padding: 2px 8px; font-size: 0.75rem; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: var(--radius-sm); color: var(--text-base);">
                        <option value="planned" ${enc.status === 'planned' ? 'selected' : ''}>Planned</option>
                        <option value="started" ${enc.status === 'started' ? 'selected' : ''}>⚔️ In Progress</option>
                        <option value="completed" ${enc.status === 'completed' ? 'selected' : ''}>✓ Completed</option>
                    </select>
                </div>
                <div style="font-size: 0.8rem; color: var(--text-subdued); margin-bottom: var(--space-1);">
                    📍 ${escapeHtml(enc.location || 'Unknown')} • ${participantSummary}
                </div>
                ${enc.tactics ? `<div style="font-size: 0.8rem; color: var(--accent-gold);">⚔️ ${escapeHtml(enc.tactics.substring(0, 80))}${enc.tactics.length > 80 ? '...' : ''}</div>` : ''}
                ${participantList}
                <div style="font-size: 0.75rem; color: var(--accent-cyan); margin-top: var(--space-1); text-align: right;">Click for details & HP management →</div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;
}

// Items (updated for new structure)
function renderItemsList() {
    const container = document.getElementById('items-list');
    if (!container) return;

    if (!sessionData.items || sessionData.items.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No items/clues added yet.</p>';
        return;
    }

    container.innerHTML = sessionData.items.map((item, i) => `
        <div class="dynamic-item">
            <button class="remove-btn" onclick="removeItem(${i})">&times;</button>
            <div style="display: flex; gap: var(--space-2);">
                <div class="field-group" style="margin-bottom: 0; flex: 1;">
                    <label style="font-size: 0.7rem; color: var(--accent-gold);">Item/Clue</label>
                    <input type="text" value="${escapeHtml(item.name || item.item || '')}" onchange="sessionData.items[${i}].name = this.value; renderPlayLists();" placeholder="Item name">
                </div>
                <div class="field-group" style="margin-bottom: 0; flex: 1;">
                    <label style="font-size: 0.7rem;">Planned Location</label>
                    <input type="text" value="${escapeHtml(item.plannedLocation || item.location || '')}" onchange="sessionData.items[${i}].plannedLocation = this.value" placeholder="Where is it?">
                </div>
                <div class="field-group" style="margin-bottom: 0; max-width: 70px;">
                    <label style="font-size: 0.7rem; color: var(--accent-blue);">Day</label>
                    <input type="number" min="1" value="${item.day || ''}" onchange="sessionData.items[${i}].day = this.value ? parseInt(this.value) : null; renderPlayLists();" placeholder="-" style="text-align: center;">
                </div>
            </div>
            <div class="field-group" style="margin-top: var(--space-2); margin-bottom: 0;">
                <label style="font-size: 0.7rem;">Description</label>
                <input type="text" value="${escapeHtml(item.description || '')}" onchange="sessionData.items[${i}].description = this.value" placeholder="What is it? Why is it important?">
            </div>
        </div>
    `).join('');
}

function addItem() {
    if (!sessionData.items) sessionData.items = [];
    sessionData.items.push({ name: '', description: '', plannedLocation: '', actualLocation: '', found: false, givenTo: '', day: null, notes: '' });
    renderPlanningByDay();
    renderItemsList();
    renderPlayLists();
    updateLockUI();
    triggerAutoSave();
}

function removeItem(index) {
    sessionData.items.splice(index, 1);
    renderPlanningByDay();
    renderItemsList();
    renderPlayLists();
    triggerAutoSave();
}

function toggleItemFound(index) {
    if (sessionData.items && sessionData.items[index]) {
        sessionData.items[index].found = !sessionData.items[index].found;
        renderPlanningByDay();
        renderItemsList();
        renderPlayLists();
        triggerAutoSave();
    }
}

function renderPlayItemsList() {
    const container = document.getElementById('play-items-list');
    if (!container) return;

    if (!sessionData.items || sessionData.items.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic; font-size: 0.85rem;">No items yet</p>';
        return;
    }

    // Progress indicator
    const foundCount = sessionData.items.filter(item => item.found).length;
    const totalCount = sessionData.items.length;

    let html = `<div style="font-size: 0.75rem; color: var(--accent-cyan); margin-bottom: var(--space-2);">${foundCount}/${totalCount} found</div>`;

    html += sessionData.items.map((item, i) => `
        <div class="play-item" style="padding: var(--space-2); margin-bottom: var(--space-2); background: var(--bg-surface); border-radius: var(--radius-sm); border-left: 3px solid ${item.found ? 'var(--accent-green)' : 'var(--accent-gold)'};">
            <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-1);">
                <input type="checkbox" ${item.found ? 'checked' : ''} onchange="sessionData.items[${i}].found = this.checked; renderItemsList(); renderPlayItemsList(); triggerAutoSave();" style="width: 18px; height: 18px; cursor: pointer;">
                <span style="flex: 1; font-weight: 500; ${item.found ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${escapeHtml(item.name || item.item || 'Unnamed Item')}</span>
            </div>
            <div style="margin-left: 24px; ${item.found ? 'opacity: 0.6;' : ''}">
                ${item.plannedLocation || item.location ? `<div style="font-size: 0.8rem; color: var(--accent-gold); margin-bottom: var(--space-1);">📍 ${escapeHtml(item.plannedLocation || item.location)}</div>` : ''}
                ${item.description ? `<div style="font-size: 0.85rem; color: var(--text-subdued);">${escapeHtml(item.description)}</div>` : ''}
            </div>
            ${item.found ? `
                <div style="margin-top: var(--space-2); margin-left: 24px; display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap;">
                    <span style="font-size: 0.85rem; color: var(--text-subdued);">Given to:</span>
                    <select onchange="sessionData.items[${i}].givenTo = this.value; if(this.value) giveItemToPlayer(${i}, this.value); renderPlayItemsList(); triggerAutoSave();" style="padding: 8px 12px; font-size: 0.85rem; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: var(--radius-sm); color: var(--text-base); min-width: 130px;">
                        <option value="">-- Select player --</option>
                        ${(sessionData.players || []).map(p => {
                            const playerName = p.character || p.player || 'Unknown';
                            return `<option value="${escapeHtml(playerName)}" ${item.givenTo === playerName ? 'selected' : ''}>${escapeHtml(playerName)}</option>`;
                        }).join('')}
                    </select>
                </div>
            ` : ''}
        </div>
    `).join('');

    container.innerHTML = html;
}

// Read-Aloud (updated with linkedType/linkedTo)
function renderReadAloudList() {
    const container = document.getElementById('read-aloud-list');
    if (!container) return;

    // Support both new (readAloud) and legacy (readAloudText) arrays
    const readAloudData = sessionData.readAloud && sessionData.readAloud.length > 0 ? sessionData.readAloud : sessionData.readAloudText;

    if (!readAloudData || readAloudData.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No read-aloud text added yet.</p>';
        return;
    }

    // Get available options for linking
    const placeOptions = (sessionData.places || []).map(p => p.name).filter(n => n);
    const encounterOptions = (sessionData.encounters || []).map(e => e.name).filter(n => n);
    const npcOptions = (sessionData.npcs || []).map(n => n.name).filter(n => n);

    container.innerHTML = readAloudData.map((ra, i) => {
        // Migrate old 'place' field to new linkedType/linkedTo
        const linkedType = ra.linkedType || (ra.place ? 'place' : null);
        const linkedTo = ra.linkedTo || ra.place || '';

        return `
        <div class="read-aloud-box">
            <button class="remove-btn" onclick="removeReadAloud(${i})">&times;</button>
            <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-2); flex-wrap: wrap;">
                <div class="field-group" style="margin-bottom: 0; flex: 1; min-width: 150px;">
                    <label style="color: var(--accent-gold);">Title</label>
                    <input type="text" value="${escapeHtml(ra.title || '')}" onchange="updateReadAloud(${i}, 'title', this.value); renderPlayLists(); renderPlanningByDay();" placeholder="Scene intro, NPC dialogue, etc.">
                </div>
                <div class="field-group" style="margin-bottom: 0; max-width: 70px;">
                    <label style="color: var(--accent-blue);">Day</label>
                    <input type="number" min="1" value="${ra.day || ''}" onchange="updateReadAloud(${i}, 'day', this.value ? parseInt(this.value) : null); renderPlayLists(); renderPlanningByDay();" placeholder="-" style="text-align: center;">
                </div>
                <div class="field-group" style="margin-bottom: 0; min-width: 120px;">
                    <label style="color: var(--accent-purple);">Time</label>
                    <select onchange="updateReadAloud(${i}, 'time', this.value || null); renderPlayLists(); renderPlanningByDay();">
                        <option value="">No time</option>
                        <option value="dawn" ${ra.time === 'dawn' ? 'selected' : ''}>🌅 Dawn</option>
                        <option value="morning" ${ra.time === 'morning' ? 'selected' : ''}>☀️ Morning</option>
                        <option value="noon" ${ra.time === 'noon' ? 'selected' : ''}>🌞 Noon</option>
                        <option value="afternoon" ${ra.time === 'afternoon' ? 'selected' : ''}>🌤️ Afternoon</option>
                        <option value="dusk" ${ra.time === 'dusk' ? 'selected' : ''}>🌆 Dusk</option>
                        <option value="evening" ${ra.time === 'evening' ? 'selected' : ''}>🌙 Evening</option>
                        <option value="night" ${ra.time === 'night' ? 'selected' : ''}>🌑 Night</option>
                    </select>
                </div>
            </div>
            <div style="display: flex; gap: var(--space-2); margin-bottom: var(--space-2); flex-wrap: wrap;">
                <div class="field-group" style="margin-bottom: 0; min-width: 120px;">
                    <label style="color: var(--accent-green);">Linked to</label>
                    <select onchange="updateReadAloudLinkedType(${i}, this.value);">
                        <option value="">Not linked</option>
                        <option value="place" ${linkedType === 'place' ? 'selected' : ''}>📍 Place</option>
                        <option value="encounter" ${linkedType === 'encounter' ? 'selected' : ''}>⚔️ Encounter</option>
                        <option value="npc" ${linkedType === 'npc' ? 'selected' : ''}>👤 NPC</option>
                    </select>
                </div>
                <div class="field-group" style="margin-bottom: 0; flex: 1; min-width: 150px;">
                    <label style="color: var(--text-secondary);">Select ${linkedType || 'item'}</label>
                    <select onchange="updateReadAloud(${i}, 'linkedTo', this.value); renderPlayLists(); renderPlanningByDay();" ${!linkedType ? 'disabled' : ''}>
                        <option value="">Select...</option>
                        ${linkedType === 'place' ? placeOptions.map(p => `<option value="${escapeHtml(p)}" ${linkedTo === p ? 'selected' : ''}>${escapeHtml(p)}</option>`).join('') : ''}
                        ${linkedType === 'encounter' ? encounterOptions.map(e => `<option value="${escapeHtml(e)}" ${linkedTo === e ? 'selected' : ''}>${escapeHtml(e)}</option>`).join('') : ''}
                        ${linkedType === 'npc' ? npcOptions.map(n => `<option value="${escapeHtml(n)}" ${linkedTo === n ? 'selected' : ''}>${escapeHtml(n)}</option>`).join('') : ''}
                    </select>
                </div>
            </div>
            <div class="field-group" style="margin-bottom: 0;">
                <label>Text to read aloud</label>
                <textarea rows="5" onchange="updateReadAloud(${i}, 'text', this.value); renderPlanningByDay();" placeholder="Write atmospheric text here...">${escapeHtml(ra.text || '')}</textarea>
            </div>
        </div>
    `}).join('');
}

function updateReadAloudLinkedType(index, newType) {
    if (sessionData.readAloud && sessionData.readAloud.length > 0) {
        sessionData.readAloud[index].linkedType = newType || null;
        sessionData.readAloud[index].linkedTo = ''; // Reset linkedTo when type changes
    }
    renderReadAloudList();
    renderPlayLists();
    renderPlanningByDay();
}

function updateReadAloud(index, field, value) {
    // Use the new array if it exists, otherwise fall back to legacy
    if (sessionData.readAloud && sessionData.readAloud.length > 0) {
        sessionData.readAloud[index][field] = value;
    } else if (sessionData.readAloudText && sessionData.readAloudText.length > 0) {
        sessionData.readAloudText[index][field] = value;
    }
}

function addReadAloud() {
    // Add to new array
    if (!sessionData.readAloud) sessionData.readAloud = [];
    sessionData.readAloud.push({ title: '', text: '', read: false, day: null, time: null, linkedType: null, linkedTo: '' });
    renderPlanningByDay();
    renderReadAloudList();
    renderPlayLists();
    updateLockUI();
    triggerAutoSave();
}

function removeReadAloud(index) {
    // Remove from whichever array has data
    if (sessionData.readAloud && sessionData.readAloud.length > 0) {
        sessionData.readAloud.splice(index, 1);
    } else if (sessionData.readAloudText && sessionData.readAloudText.length > 0) {
        sessionData.readAloudText.splice(index, 1);
    }
    renderPlanningByDay();
    renderReadAloudList();
    renderPlayLists();
    triggerAutoSave();
}

function renderPlayReadAloudList() {
    const container = document.getElementById('play-read-aloud-list');
    if (!container) return;

    // Support both new (readAloud) and legacy (readAloudText) arrays
    const readAloudData = sessionData.readAloud && sessionData.readAloud.length > 0 ? sessionData.readAloud : sessionData.readAloudText;

    if (!readAloudData || readAloudData.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No read-aloud text yet.</p>';
        return;
    }

    // Progress indicator
    const readCount = readAloudData.filter(ra => ra.read).length;
    const totalCount = readAloudData.length;

    let html = `<div style="font-size: 0.75rem; color: var(--accent-cyan); margin-bottom: var(--space-2);">${readCount}/${totalCount} read</div>`;

    html += readAloudData.map((ra, i) => `
        <div class="read-aloud-box" style="padding: var(--space-3); margin-bottom: var(--space-3); border-left: 3px solid ${ra.read ? 'var(--accent-green)' : 'var(--accent-gold)'}; ${ra.read ? 'opacity: 0.5;' : ''}">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
                <span style="color: var(--accent-gold); font-weight: 500;">${escapeHtml(ra.title || 'Untitled')}</span>
                <label style="display: flex; align-items: center; gap: var(--space-1); font-size: 0.8rem; color: var(--text-muted);">
                    <input type="checkbox" ${ra.read ? 'checked' : ''} onchange="markReadAloudAsRead(${i}, this.checked)" style="width: 18px; height: 18px; cursor: pointer;">
                    Read
                </label>
            </div>
            <div style="font-style: italic; color: var(--text-base); line-height: 1.8; white-space: pre-wrap;">${escapeHtml(ra.text || '')}</div>
        </div>
    `).join('');

    container.innerHTML = html;
}

function markReadAloudAsRead(index, isRead) {
    if (sessionData.readAloud && sessionData.readAloud.length > 0) {
        sessionData.readAloud[index].read = isRead;
    } else if (sessionData.readAloudText && sessionData.readAloudText.length > 0) {
        sessionData.readAloudText[index].read = isRead;
    }
    renderReadAloudList();
    renderPlayReadAloudList();
    triggerAutoSave();
}

// Turning Points
function renderTurningPointsList() {
    const container = document.getElementById('turning-points-list');
    if (!container) return;

    if (!sessionData.turningPoints || sessionData.turningPoints.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No turning points recorded yet.</p>';
        return;
    }

    container.innerHTML = sessionData.turningPoints.map((tp, i) => `
        <div class="decision-card" style="padding: var(--space-3);">
            <button class="remove-btn" onclick="removeTurningPoint(${i})">&times;</button>
            <div class="field-group" style="margin-bottom: var(--space-2);">
                <label style="font-size: 0.7rem; color: var(--accent-purple);">What happened?</label>
                <input type="text" value="${escapeHtml(tp.description || '')}" onchange="sessionData.turningPoints[${i}].description = this.value" placeholder="Key decision or important moment">
            </div>
            <div class="field-group" style="margin-bottom: 0;">
                <label style="font-size: 0.7rem;">Consequence</label>
                <input type="text" value="${escapeHtml(tp.consequence || '')}" onchange="sessionData.turningPoints[${i}].consequence = this.value" placeholder="What does this lead to?">
            </div>
        </div>
    `).join('');
}

function addTurningPoint() {
    if (!sessionData.turningPoints) sessionData.turningPoints = [];
    sessionData.turningPoints.push({ description: '', consequence: '' });
    renderTurningPointsList();
    updateLockUI();
    triggerAutoSave();
}

function removeTurningPoint(index) {
    sessionData.turningPoints.splice(index, 1);
    renderTurningPointsList();
    triggerAutoSave();
}

// Event Log
function renderEventLogList() {
    const container = document.getElementById('event-log-list');
    if (!container) return;

    if (!sessionData.eventLog || sessionData.eventLog.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No events logged yet.</p>';
        return;
    }

    container.innerHTML = sessionData.eventLog.map((event, i) => `
        <div style="display: flex; align-items: flex-start; gap: var(--space-2); padding: var(--space-2); margin-bottom: var(--space-1); background: var(--bg-surface); border-radius: var(--radius-sm);">
            <span style="font-size: 0.7rem; color: var(--text-muted); min-width: 50px;">${escapeHtml(event.timestamp || '')}</span>
            <span style="flex: 1; font-size: 0.85rem;">${escapeHtml(event.text || '')}</span>
            <button onclick="removeEventLog(${i})" style="background: none; border: none; color: var(--accent-red); cursor: pointer; padding: 0; font-size: 1rem;">&times;</button>
        </div>
    `).join('');
}

function addEventLog() {
    const input = document.getElementById('new-event-input');
    if (!input || !input.value.trim()) return;

    if (!sessionData.eventLog) sessionData.eventLog = [];

    const now = new Date();
    const timestamp = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });

    sessionData.eventLog.push({ timestamp, text: input.value.trim() });
    input.value = '';
    renderEventLogList();
    triggerAutoSave();
}

function removeEventLog(index) {
    sessionData.eventLog.splice(index, 1);
    renderEventLogList();
    triggerAutoSave();
}

// Combat Encounters (legacy - keep for backwards compatibility)
function renderCombatList() {
    const container = document.getElementById('combat-list');
    if (!sessionData.combatEncounters || sessionData.combatEncounters.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No combat encounters added yet.</p>';
        return;
    }

    container.innerHTML = sessionData.combatEncounters.map((enc, i) => `
        <div class="combat-encounter">
            <button class="remove-btn" onclick="removeCombatEncounter(${i})">&times;</button>
            <h3 style="color: var(--accent-red); margin-bottom: var(--space-3);">Encounter ${i + 1}</h3>
            <div class="field-group">
                <label>Location</label>
                <input type="text" value="${escapeHtml(enc.location || '')}" onchange="sessionData.combatEncounters[${i}].location = this.value" placeholder="Where does the fight happen?">
            </div>
            <div class="field-group">
                <label>Enemies</label>
                <div id="enemies-${i}">
                    ${(enc.enemies || []).map((e, j) => `
                        <div class="enemy-row">
                            <input type="text" value="${escapeHtml(e.name || '')}" onchange="sessionData.combatEncounters[${i}].enemies[${j}].name = this.value" placeholder="Enemy name">
                            <input type="text" value="${escapeHtml(e.hp || '')}" onchange="sessionData.combatEncounters[${i}].enemies[${j}].hp = this.value" placeholder="HP">
                            <input type="text" value="${escapeHtml(e.armor || '')}" onchange="sessionData.combatEncounters[${i}].enemies[${j}].armor = this.value" placeholder="Armor">
                            <input type="text" value="${escapeHtml(e.weapon || '')}" onchange="sessionData.combatEncounters[${i}].enemies[${j}].weapon = this.value" placeholder="Weapon">
                            <input type="text" value="${escapeHtml(e.atkBonus || '')}" onchange="sessionData.combatEncounters[${i}].enemies[${j}].atkBonus = this.value" placeholder="Atk">
                            <input type="text" value="${escapeHtml(e.dmg || '')}" onchange="sessionData.combatEncounters[${i}].enemies[${j}].dmg = this.value" placeholder="Dmg">
                            <button class="remove-btn" onclick="removeEnemy(${i}, ${j})" style="position: static; width: 24px; height: 24px;">&times;</button>
                        </div>
                    `).join('')}
                </div>
                <button class="quick-add-btn" onclick="addEnemy(${i})" style="margin-top: var(--space-2); padding: 4px 12px; font-size: 0.8rem;">+ Enemy</button>
            </div>
            <div class="grid grid-2" style="margin-top: var(--space-3);">
                <div class="field-group" style="margin-bottom: 0;">
                    <label>Tactics</label>
                    <textarea rows="2" onchange="sessionData.combatEncounters[${i}].tactics = this.value" placeholder="How do they fight?">${escapeHtml(enc.tactics || '')}</textarea>
                </div>
                <div class="field-group" style="margin-bottom: 0;">
                    <label>Loot</label>
                    <textarea rows="2" onchange="sessionData.combatEncounters[${i}].loot = this.value" placeholder="What can be looted?">${escapeHtml(enc.loot || '')}</textarea>
                </div>
            </div>
        </div>
    `).join('');
}

function addCombatEncounter() {
    sessionData.combatEncounters.push({ location: '', enemies: [], tactics: '', loot: '' });
    renderCombatList();
    updateLockUI();
    triggerAutoSave();
}

function removeCombatEncounter(index) {
    sessionData.combatEncounters.splice(index, 1);
    renderCombatList();
    triggerAutoSave();
}

function addEnemy(encIndex) {
    if (!sessionData.combatEncounters[encIndex].enemies) {
        sessionData.combatEncounters[encIndex].enemies = [];
    }
    sessionData.combatEncounters[encIndex].enemies.push({ name: '', hp: '', armor: '', weapon: '', atkBonus: '', dmg: '' });
    renderCombatList();
    updateLockUI();
    triggerAutoSave();
}

function removeEnemy(encIndex, enemyIndex) {
    sessionData.combatEncounters[encIndex].enemies.splice(enemyIndex, 1);
    renderCombatList();
    triggerAutoSave();
}

// Loot
function renderLootList() {
    const container = document.getElementById('loot-list');
    if (!sessionData.lootRewards || sessionData.lootRewards.length === 0) {
        container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No loot recorded yet.</p>';
        return;
    }

    container.innerHTML = sessionData.lootRewards.map((l, i) => `
        <div class="dynamic-item">
            <button class="remove-btn" onclick="removeLoot(${i})">&times;</button>
            <div class="grid grid-3" style="gap: var(--space-2);">
                <div class="field-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.7rem;">Item</label>
                    <input type="text" value="${escapeHtml(l.item || '')}" onchange="sessionData.lootRewards[${i}].item = this.value" placeholder="Item name">
                </div>
                <div class="field-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.7rem;">Value</label>
                    <input type="text" value="${escapeHtml(l.value || '')}" onchange="sessionData.lootRewards[${i}].value = this.value" placeholder="Gold value">
                </div>
                <div class="field-group" style="margin-bottom: 0;">
                    <label style="font-size: 0.7rem;">Given to</label>
                    <input type="text" value="${escapeHtml(l.givenTo || '')}" onchange="sessionData.lootRewards[${i}].givenTo = this.value" placeholder="Who got it?">
                </div>
            </div>
        </div>
    `).join('');
}

function addLoot() {
    sessionData.lootRewards.push({ item: '', value: '', givenTo: '' });
    renderLootList();
    updateLockUI();
    triggerAutoSave();
}

function removeLoot(index) {
    sessionData.lootRewards.splice(index, 1);
    renderLootList();
    triggerAutoSave();
}

// Session Notes
function populateSessionNotes() {
    const notes = sessionData.sessionNotes || {};
    const summaryEl = document.getElementById('notes_summary');
    const wentWellEl = document.getElementById('notes_went_well');
    const improveEl = document.getElementById('notes_improve');
    const followupEl = document.getElementById('notes_followup');

    if (summaryEl) summaryEl.value = notes.summary || '';
    if (wentWellEl) wentWellEl.value = notes.wentWell || '';
    if (improveEl) improveEl.value = notes.improve || '';
    if (followupEl) followupEl.value = notes.followUp || '';
}

function collectSessionNotes() {
    const summaryEl = document.getElementById('notes_summary');
    const wentWellEl = document.getElementById('notes_went_well');
    const improveEl = document.getElementById('notes_improve');
    const followupEl = document.getElementById('notes_followup');

    sessionData.sessionNotes = {
        summary: summaryEl ? summaryEl.value : '',
        wentWell: wentWellEl ? wentWellEl.value : '',
        improve: improveEl ? improveEl.value : '',
        followUp: followupEl ? followupEl.value : ''
    };
}

function collectAllData() {
    // Collect hook/goal
    const hookEl = document.getElementById('session_hook');
    if (hookEl) sessionData.hook = hookEl.value;

    // Collect session notes
    collectSessionNotes();

    // Other data is collected via onchange handlers
}

// ============================================
// Export
// ============================================

function showExportModal() {
    document.getElementById('export-modal').style.display = 'flex';
}

function hideExportModal() {
    document.getElementById('export-modal').style.display = 'none';
}

function sessionToMarkdown(session, campaignName) {
    const data = session.data || {};
    let md = '';

    // Header
    md += `# ${campaignName} - Session ${session.session_number}\n\n`;

    if (session.date) md += `**Date:** ${session.date}\n`;
    if (session.location) md += `**Location:** ${session.location}\n`;
    if (session.status) md += `**Status:** ${session.status}\n`;
    md += '\n---\n\n';

    // Hook/Goal (new structure)
    if (data.hook) {
        md += '## Session Goal\n\n';
        md += `${data.hook}\n\n`;
    }

    // Players
    if (data.players && data.players.length > 0) {
        md += '## Players\n\n';
        md += '| Player | Character | Race | Class | Religion | Notes |\n';
        md += '|--------|-----------|------|-------|----------|-------|\n';
        data.players.forEach(p => {
            md += `| ${p.player || ''} | ${p.character || ''} | ${p.race || ''} | ${p.class || ''} | ${p.religion || ''} | ${p.notes || ''} |\n`;
        });
        md += '\n';
    }

    // NPCs (supports both old and new structure)
    if (data.npcs && data.npcs.length > 0) {
        md += '## NPCs\n\n';
        data.npcs.forEach(npc => {
            md += `### ${npc.name || 'Unnamed NPC'}\n`;
            if (npc.role) md += `- **Role:** ${npc.role}\n`;
            const location = npc.actualLocation || npc.plannedLocation || npc.location;
            if (location) md += `- **Location:** ${location}\n`;
            if (npc.disposition) md += `- **Disposition:** ${npc.disposition}\n`;
            const info = npc.description || npc.info;
            if (info) md += `- **Info:** ${info}\n`;
            if (npc.status === 'used') md += `- **Status:** Used\n`;
            if (npc.notes) md += `- **Notes:** ${npc.notes}\n`;
            md += '\n';
        });
    }

    // Places (new structure)
    if (data.places && data.places.length > 0) {
        md += '## Places\n\n';
        md += '| Place | Description | Visited |\n';
        md += '|-------|-------------|:-------:|\n';
        data.places.forEach(place => {
            md += `| ${place.name || ''} | ${place.description || ''} | ${place.visited ? '✓' : ''} |\n`;
        });
        md += '\n';
    }

    // Encounters (new structure)
    if (data.encounters && data.encounters.length > 0) {
        md += '## Encounters\n\n';
        data.encounters.forEach((enc, i) => {
            md += `### ${enc.name || `Encounter ${i + 1}`}\n\n`;
            if (enc.location) md += `**Location:** ${enc.location}\n`;
            if (enc.status) md += `**Status:** ${enc.status}\n\n`;

            if (enc.enemies && enc.enemies.length > 0) {
                md += '**Enemies:**\n\n';
                md += '| Name | HP | Armor | Weapon | Atk | Dmg |\n';
                md += '|------|----:|-------|--------|----:|-----|\n';
                enc.enemies.forEach(e => {
                    md += `| ${e.name || ''} | ${e.hp || ''} | ${e.armor || ''} | ${e.weapon || ''} | ${e.atkBonus || ''} | ${e.dmg || ''} |\n`;
                });
                md += '\n';
            }

            if (enc.tactics) md += `**Tactics:** ${enc.tactics}\n\n`;
            if (enc.loot) md += `**Loot:** ${enc.loot}\n\n`;
        });
    }

    // Legacy Combat Encounters (for backwards compatibility)
    if (data.combatEncounters && data.combatEncounters.length > 0) {
        md += '## Combat Encounters\n\n';
        data.combatEncounters.forEach((enc, i) => {
            md += `### Encounter ${i + 1}\n\n`;
            if (enc.location) md += `**Location:** ${enc.location}\n\n`;

            if (enc.enemies && enc.enemies.length > 0) {
                md += '**Enemies:**\n\n';
                md += '| Name | HP | Armor | Weapon | Atk | Dmg |\n';
                md += '|------|----:|-------|--------|----:|-----|\n';
                enc.enemies.forEach(e => {
                    md += `| ${e.name || ''} | ${e.hp || ''} | ${e.armor || ''} | ${e.weapon || ''} | ${e.atkBonus || ''} | ${e.dmg || ''} |\n`;
                });
                md += '\n';
            }

            if (enc.tactics) md += `**Tactics:** ${enc.tactics}\n\n`;
            if (enc.loot) md += `**Loot:** ${enc.loot}\n\n`;
        });
    }

    // Items (new structure)
    if (data.items && data.items.length > 0) {
        md += '## Items & Clues\n\n';
        md += '| Item | Location | Found | Given To |\n';
        md += '|------|----------|:-----:|----------|\n';
        data.items.forEach(item => {
            const location = item.actualLocation || item.plannedLocation;
            md += `| ${item.name || ''} | ${location || ''} | ${item.found ? '✓' : ''} | ${item.givenTo || ''} |\n`;
        });
        md += '\n';
    }

    // Legacy Key Items (for backwards compatibility)
    if (data.keyItems && data.keyItems.length > 0) {
        md += '## Key Items & Clues\n\n';
        md += '| Item | Location | Found | Given To |\n';
        md += '|------|----------|:-----:|----------|\n';
        data.keyItems.forEach(item => {
            md += `| ${item.item || ''} | ${item.location || ''} | ${item.found ? '✓' : ''} | ${item.givenTo || ''} |\n`;
        });
        md += '\n';
    }

    // Read-Aloud Text (supports both old and new arrays)
    const readAloudData = data.readAloud && data.readAloud.length > 0 ? data.readAloud : data.readAloudText;
    if (readAloudData && readAloudData.length > 0) {
        md += '## Read-Aloud Text\n\n';
        readAloudData.forEach(ra => {
            if (ra.title) md += `### ${ra.title}${ra.read ? ' ✓' : ''}\n\n`;
            if (ra.text) md += `> *${ra.text.replace(/\n/g, '*\n> *')}*\n\n`;
        });
    }

    // Turning Points (new structure)
    if (data.turningPoints && data.turningPoints.length > 0) {
        md += '## Turning Points\n\n';
        data.turningPoints.forEach((tp, i) => {
            md += `### ${i + 1}. ${tp.description || 'Unnamed turning point'}\n`;
            if (tp.consequence) md += `**Consequence:** ${tp.consequence}\n`;
            md += '\n';
        });
    }

    // Event Log (new structure)
    if (data.eventLog && data.eventLog.length > 0) {
        md += '## Event Log\n\n';
        data.eventLog.forEach(event => {
            md += `- **${event.timestamp || ''}** - ${event.text || ''}\n`;
        });
        md += '\n';
    }

    // Legacy: Scenes (for backwards compatibility)
    if (data.scenes && data.scenes.length > 0) {
        md += '## Scenes\n\n';
        data.scenes.forEach((scene, i) => {
            md += `### Scene ${i + 1}: ${scene.title || 'Untitled'}\n\n`;
            if (scene.notes) md += `${scene.notes}\n\n`;
        });
    }

    // Legacy: Decision Points (for backwards compatibility)
    if (data.decisionPoints && data.decisionPoints.length > 0) {
        md += '## Decision Points\n\n';
        data.decisionPoints.forEach((d, i) => {
            md += `### Decision ${i + 1}\n\n`;
            if (d.trigger) md += `**Trigger:** ${d.trigger}\n\n`;
            md += '| Option | Consequence |\n';
            md += '|--------|-------------|\n';
            if (d.optionA) md += `| A: ${d.optionA} | ${d.consequenceA || ''} |\n`;
            if (d.optionB) md += `| B: ${d.optionB} | ${d.consequenceB || ''} |\n`;
            if (d.optionC) md += `| C: ${d.optionC} | ${d.consequenceC || ''} |\n`;
            if (d.chosen) md += `\n**Chosen:** ${d.chosen}\n`;
            md += '\n';
        });
    }

    // Legacy: Loot
    if (data.lootRewards && data.lootRewards.length > 0) {
        md += '## Loot & Rewards\n\n';
        md += '| Item | Value | Given To |\n';
        md += '|------|-------|----------|\n';
        data.lootRewards.forEach(l => {
            md += `| ${l.item || ''} | ${l.value || ''} | ${l.givenTo || ''} |\n`;
        });
        md += '\n';
    }

    // Session Notes (supports both old and new structure)
    if (data.sessionNotes) {
        const notes = data.sessionNotes;
        if (notes.summary || notes.wentWell || notes.improve || notes.reactions || notes.unexpected || notes.followUp) {
            md += '## Session Notes\n\n';
            if (notes.summary) md += `### Summary\n${notes.summary}\n\n`;
            if (notes.wentWell) md += `### What Went Well\n${notes.wentWell}\n\n`;
            if (notes.improve) md += `### What to Improve\n${notes.improve}\n\n`;
            if (notes.reactions) md += `### Player Reactions\n${notes.reactions}\n\n`;
            if (notes.unexpected) md += `### Unexpected Choices\n${notes.unexpected}\n\n`;
            if (notes.followUp) md += `### Follow Up Next Session\n${notes.followUp}\n\n`;
        }
    }

    return md;
}

function exportSessionMarkdown() {
    if (!currentSessionId) {
        alert('No session selected');
        hideExportModal();
        return;
    }

    collectAllData();

    const session = {
        session_number: document.getElementById('session_number').value,
        date: document.getElementById('session_date').value,
        location: document.getElementById('session_location').value,
        status: isSessionLocked ? 'locked' : 'active',
        data: sessionData
    };

    const markdown = sessionToMarkdown(session, currentCampaignName);
    downloadFile(markdown, `${currentCampaignName}-session-${session.session_number}.md`, 'text/markdown');
    hideExportModal();
}

async function exportCampaignMarkdown() {
    if (!currentCampaignId) {
        alert('No campaign selected');
        hideExportModal();
        return;
    }

    try {
        // Fetch all sessions for this campaign
        const res = await fetch(`/api/campaigns/${currentCampaignId}/sessions`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        const sessionList = await res.json();

        if (sessionList.length === 0) {
            alert('No sessions found in this campaign');
            hideExportModal();
            return;
        }

        // Sort by session number
        sessionList.sort((a, b) => a.session_number - b.session_number);

        let fullMarkdown = `# ${currentCampaignName}\n\n`;
        fullMarkdown += `**Total Sessions:** ${sessionList.length}\n`;
        fullMarkdown += `**Exported:** ${new Date().toLocaleDateString()}\n\n`;
        fullMarkdown += '---\n\n';

        // Table of contents
        fullMarkdown += '## Table of Contents\n\n';
        sessionList.forEach(s => {
            const date = s.date ? ` (${s.date})` : '';
            fullMarkdown += `- [Session ${s.session_number}${date}](#session-${s.session_number})\n`;
        });
        fullMarkdown += '\n---\n\n';

        // Fetch and add each session
        for (const sessionInfo of sessionList) {
            const sessionRes = await fetch(`/api/sessions/${sessionInfo.id}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            const session = await sessionRes.json();

            // Add anchor for TOC linking
            fullMarkdown += `<a id="session-${session.session_number}"></a>\n\n`;
            fullMarkdown += sessionToMarkdown(session, currentCampaignName);
            fullMarkdown += '\n---\n\n';
        }

        downloadFile(fullMarkdown, `${currentCampaignName}-full-campaign.md`, 'text/markdown');
        hideExportModal();

    } catch (error) {
        console.error('Export error:', error);
        alert('Failed to export campaign. Please try again.');
    }
}

function downloadFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================================
// Confirm Modal
// ============================================

let confirmCallback = null;

function showConfirmModal(title, message, callback) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-message').textContent = message;
    confirmCallback = callback;
    document.getElementById('confirm-btn').onclick = () => {
        const cb = confirmCallback; // Save callback before hiding
        hideConfirmModal();
        if (cb) cb();
    };
    document.getElementById('confirm-modal').style.display = 'flex';
}

function hideConfirmModal() {
    document.getElementById('confirm-modal').style.display = 'none';
    confirmCallback = null;
}

// ============================================
// Give XP & Unlock Character (DM Functions)
// ============================================

let giveXPCharacterId = null;

function showGiveXPModal(characterId, characterName) {
    giveXPCharacterId = characterId;
    document.getElementById('give-xp-character-name').textContent = `To: ${characterName}`;
    document.getElementById('xp-amount').value = 10;
    document.getElementById('give-xp-modal').style.display = 'flex';
}

function hideGiveXPModal() {
    document.getElementById('give-xp-modal').style.display = 'none';
    giveXPCharacterId = null;
}

async function confirmGiveXP() {
    if (!giveXPCharacterId || !authToken) return;

    const amount = parseInt(document.getElementById('xp-amount').value);
    if (!amount || amount < 1) {
        alert('Enter a valid XP amount');
        return;
    }

    try {
        const res = await fetch(`/api/dm/characters/${giveXPCharacterId}/give-xp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({ amount })
        });

        if (!res.ok) {
            const data = await res.json();
            alert(`Error: ${data.error || 'Could not give XP'}`);
            return;
        }

        const data = await res.json();
        alert(`Gave ${amount} XP!`);
        hideGiveXPModal();

        // Refresh player list to show updated XP
        await syncCampaignPlayers();
    } catch (error) {
        alert('Connection error. Try again.');
    }
}

// Give a quest item to a player's character inventory
async function giveItemToPlayer(itemIndex, playerName) {
    if (!playerName || !authToken) return;

    const item = sessionData.items[itemIndex];
    if (!item) return;

    // Find the player and their characterId
    const player = (sessionData.players || []).find(p =>
        (p.character === playerName || p.player === playerName) && p.characterId
    );

    if (!player || !player.characterId) {
        // Player doesn't have a linked character - just save locally
        console.log('Player has no linked character, saving locally only');
        return;
    }

    try {
        const res = await fetch(`/api/dm/characters/${player.characterId}/give-item`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                name: item.name,
                description: item.description || '',
                campaign_id: currentCampaignId
            })
        });

        if (!res.ok) {
            const data = await res.json();
            console.error('Give item error:', data.error);
            // Don't alert, item is still tracked in session
            return;
        }

        showSaveIndicator(`${item.name} → ${playerName}'s inventory`);
    } catch (error) {
        console.error('Give item connection error:', error);
    }
}

let pendingUnlockCharacterId = null;

function unlockCharacter(characterId, characterName) {
    if (!authToken) return;

    pendingUnlockCharacterId = characterId;

    // Show custom unlock modal
    const modal = document.getElementById('confirm-modal');
    document.getElementById('confirm-title').textContent = 'Unlock Character';
    document.getElementById('confirm-message').textContent = `What do you want to unlock for ${characterName}?`;

    const btnContainer = modal.querySelector('div[style*="flex"]');
    btnContainer.style.flexWrap = 'wrap';
    btnContainer.innerHTML = `
        <button onclick="doUnlock('race_class')" style="background: var(--accent-blue); flex: 1; min-width: 80px;">Race/Class</button>
        <button onclick="doUnlock('attributes')" style="background: var(--accent-green); flex: 1; min-width: 80px;">Attributes</button>
        <button onclick="doUnlock('abilities')" style="background: var(--primary-purple); flex: 1; min-width: 80px;">Abilities</button>
        <button onclick="doUnlock('all')" class="modal-submit" style="flex: 1; min-width: 80px;">All</button>
        <button onclick="hideConfirmModal(); pendingUnlockCharacterId = null;" style="background: var(--bg-elevated); width: 100%; margin-top: 8px;">Cancel</button>
    `;

    modal.style.display = 'flex';
}

async function doUnlock(unlockChoice) {
    hideConfirmModal();

    if (!pendingUnlockCharacterId || !authToken) return;

    const characterId = pendingUnlockCharacterId;
    pendingUnlockCharacterId = null;

    try {
        const body = {};
        if (unlockChoice === 'race_class' || unlockChoice === 'all') {
            body.unlock_race_class = true;
        }
        if (unlockChoice === 'attributes' || unlockChoice === 'all') {
            body.unlock_attributes = true;
        }
        if (unlockChoice === 'abilities' || unlockChoice === 'all') {
            body.unlock_abilities = true;
        }

        const res = await fetch(`/api/dm/characters/${characterId}/unlock`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const data = await res.json();
            alert(`Error: ${data.error || 'Could not unlock'}`);
            return;
        }

        alert('Character has been unlocked!');

        // Refresh player list to show updated lock status
        await syncCampaignPlayers();
    } catch (error) {
        alert('Connection error. Try again.');
    }
}

// ============================================
// Utilities
// ============================================

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function toggleAccordion(element) {
    // Don't toggle if clicking inside the content area
    if (event.target.closest('.ref-accordion-content')) return;
    element.classList.toggle('open');
}

// ============================================
// Auto-save
// ============================================

let saveTimeout = null;
let isSaving = false;

// Debounced auto-save to server (waits 2 seconds after last change)
function triggerAutoSave() {
    if (!currentSessionId || isSessionLocked || !authToken) return;

    // Clear any pending save
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    // Schedule save after 2 seconds of no changes
    saveTimeout = setTimeout(async () => {
        await autoSaveToServer();
    }, 2000);
}

async function autoSaveToServer() {
    if (!currentSessionId || isSessionLocked || !authToken || isSaving) return;

    isSaving = true;
    collectAllData();

    const sessionNumber = document.getElementById('session_number').value;
    const date = document.getElementById('session_date').value;
    const location = document.getElementById('session_location').value;

    try {
        const res = await fetch(`/api/sessions/${currentSessionId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                session_number: sessionNumber,
                date: date,
                location: location,
                data: sessionData
            })
        });

        if (res.ok) {
            // Show brief save indicator
            showSaveIndicator('Saved');
        }
    } catch (error) {
        console.error('Auto-save error:', error);
        showSaveIndicator('Save failed', true);
    } finally {
        isSaving = false;
    }
}

function showSaveIndicator(text, isError = false) {
    let indicator = document.getElementById('save-indicator');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'save-indicator';
        indicator.style.cssText = 'position: fixed; bottom: 20px; right: 20px; padding: 8px 16px; border-radius: 4px; font-size: 14px; z-index: 1000; transition: opacity 0.3s;';
        document.body.appendChild(indicator);
    }

    indicator.textContent = text;
    indicator.style.background = isError ? 'var(--accent-red, #e74c3c)' : 'var(--accent-green, #27ae60)';
    indicator.style.color = 'white';
    indicator.style.opacity = '1';

    setTimeout(() => {
        indicator.style.opacity = '0';
    }, 2000);
}

// Listen for changes in session content
function setupAutoSaveListeners() {
    const sessionContent = document.getElementById('session-content');
    const sessionHeader = document.getElementById('session-header');

    if (sessionContent) {
        sessionContent.addEventListener('input', triggerAutoSave);
        sessionContent.addEventListener('change', triggerAutoSave);
    }

    if (sessionHeader) {
        sessionHeader.addEventListener('input', triggerAutoSave);
        sessionHeader.addEventListener('change', triggerAutoSave);
    }
}

// Also keep localStorage backup every 30 seconds
setInterval(() => {
    if (currentSessionId && !isSessionLocked) {
        collectAllData();
        localStorage.setItem('aedelore_dm_session_autosave', JSON.stringify({
            campaignId: currentCampaignId,
            campaignName: currentCampaignName,
            sessionId: currentSessionId,
            sessionNumber: document.getElementById('session_number').value,
            date: document.getElementById('session_date').value,
            location: document.getElementById('session_location').value,
            data: sessionData
        }));
    }
}, 30000);

// ============================================
// Session Summary Functions
// ============================================

function renderSessionSummary() {
    const container = document.getElementById('session-summary-content');
    if (!container) return;

    collectAllData();

    const sessionNum = document.getElementById('session_number').value || '?';
    const sessionDate = document.getElementById('session_date').value || 'No date';
    const sessionLocation = document.getElementById('session_location').value || 'Unknown location';

    // Get used/completed items
    const usedNPCs = (sessionData.npcs || []).filter(npc => npc.status === 'used' && npc.name);
    const visitedPlaces = (sessionData.places || []).filter(place => place.visited && place.name);
    const completedEncounters = (sessionData.encounters || []).filter(enc => enc.status === 'completed' && enc.name);
    const startedEncounters = (sessionData.encounters || []).filter(enc => enc.status === 'started' && enc.name);
    const foundItems = (sessionData.items || []).filter(item => item.found && item.name);
    const readTexts = (sessionData.readAloud || []).filter(ra => ra.read && ra.title);
    const turningPoints = sessionData.turningPoints || [];
    const eventLog = sessionData.eventLog || [];

    let html = `
        <div class="summary-section" style="background: var(--bg-elevated); border-radius: var(--radius-lg); padding: var(--space-4); margin-bottom: var(--space-4);">
            <h4 style="color: var(--accent-gold); margin-bottom: var(--space-2);">
                Session ${sessionNum} - ${sessionDate}
            </h4>
            <p style="color: var(--text-secondary); font-size: 0.9rem;">Location: ${escapeHtml(sessionLocation)}</p>
            ${sessionData.hook ? `<p style="color: var(--text-base); margin-top: var(--space-2);"><strong>Goal:</strong> ${escapeHtml(sessionData.hook)}</p>` : ''}
        </div>
    `;

    // NPCs encountered
    if (usedNPCs.length > 0) {
        html += `
            <div class="summary-section" style="margin-bottom: var(--space-4);">
                <h4 style="color: var(--accent-cyan); margin-bottom: var(--space-2);">
                    <span style="margin-right: 8px;">👤</span>NPCs Encountered (${usedNPCs.length})
                </h4>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${usedNPCs.map(npc => `
                        <li style="padding: var(--space-2) 0; border-bottom: 1px solid var(--border-subtle);">
                            <strong style="color: var(--text-base);">${escapeHtml(npc.name)}</strong>
                            ${npc.role ? `<span style="color: var(--text-muted);"> - ${escapeHtml(npc.role)}</span>` : ''}
                            ${npc.actualLocation ? `<span style="color: var(--accent-blue);"> @ ${escapeHtml(npc.actualLocation)}</span>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    // Places visited
    if (visitedPlaces.length > 0) {
        html += `
            <div class="summary-section" style="margin-bottom: var(--space-4);">
                <h4 style="color: var(--accent-green); margin-bottom: var(--space-2);">
                    <span style="margin-right: 8px;">📍</span>Places Visited (${visitedPlaces.length})
                </h4>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${visitedPlaces.map(place => `
                        <li style="padding: var(--space-2) 0; border-bottom: 1px solid var(--border-subtle);">
                            <strong style="color: var(--text-base);">${escapeHtml(place.name)}</strong>
                            ${place.notes ? `<p style="color: var(--text-muted); margin: 4px 0 0 0; font-size: 0.85rem;">${escapeHtml(place.notes)}</p>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    // Encounters
    if (completedEncounters.length > 0 || startedEncounters.length > 0) {
        html += `
            <div class="summary-section" style="margin-bottom: var(--space-4);">
                <h4 style="color: var(--accent-red); margin-bottom: var(--space-2);">
                    <span style="margin-right: 8px;">⚔️</span>Encounters (${completedEncounters.length + startedEncounters.length})
                </h4>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${completedEncounters.map(enc => `
                        <li style="padding: var(--space-2) 0; border-bottom: 1px solid var(--border-subtle);">
                            <strong style="color: var(--accent-green);">✓ ${escapeHtml(enc.name)}</strong>
                            ${enc.location ? `<span style="color: var(--text-muted);"> @ ${escapeHtml(enc.location)}</span>` : ''}
                            ${enc.loot ? `<p style="color: var(--accent-gold); margin: 4px 0 0 0; font-size: 0.85rem;">Loot: ${escapeHtml(enc.loot)}</p>` : ''}
                        </li>
                    `).join('')}
                    ${startedEncounters.map(enc => `
                        <li style="padding: var(--space-2) 0; border-bottom: 1px solid var(--border-subtle);">
                            <strong style="color: var(--accent-orange);">⏳ ${escapeHtml(enc.name)}</strong> (in progress)
                            ${enc.location ? `<span style="color: var(--text-muted);"> @ ${escapeHtml(enc.location)}</span>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    // Items found
    if (foundItems.length > 0) {
        html += `
            <div class="summary-section" style="margin-bottom: var(--space-4);">
                <h4 style="color: var(--accent-gold); margin-bottom: var(--space-2);">
                    <span style="margin-right: 8px;">📦</span>Items Found (${foundItems.length})
                </h4>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${foundItems.map(item => `
                        <li style="padding: var(--space-2) 0; border-bottom: 1px solid var(--border-subtle);">
                            <strong style="color: var(--text-base);">${escapeHtml(item.name)}</strong>
                            ${item.givenTo ? `<span style="color: var(--accent-cyan);"> → ${escapeHtml(item.givenTo)}</span>` : ''}
                            ${item.description ? `<p style="color: var(--text-muted); margin: 4px 0 0 0; font-size: 0.85rem;">${escapeHtml(item.description)}</p>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    // Turning points
    if (turningPoints.length > 0) {
        html += `
            <div class="summary-section" style="margin-bottom: var(--space-4);">
                <h4 style="color: var(--primary-purple); margin-bottom: var(--space-2);">
                    <span style="margin-right: 8px;">🔀</span>Key Turning Points (${turningPoints.length})
                </h4>
                <ul style="list-style: none; padding: 0; margin: 0;">
                    ${turningPoints.map(tp => `
                        <li style="padding: var(--space-2) 0; border-bottom: 1px solid var(--border-subtle);">
                            <strong style="color: var(--text-base);">${escapeHtml(tp.description)}</strong>
                            ${tp.consequence ? `<p style="color: var(--accent-orange); margin: 4px 0 0 0; font-size: 0.85rem;">→ ${escapeHtml(tp.consequence)}</p>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    // Event log
    if (eventLog.length > 0) {
        html += `
            <div class="summary-section" style="margin-bottom: var(--space-4);">
                <h4 style="color: var(--text-secondary); margin-bottom: var(--space-2);">
                    <span style="margin-right: 8px;">📝</span>Event Log (${eventLog.length})
                </h4>
                <ul style="list-style: none; padding: 0; margin: 0; max-height: 300px; overflow-y: auto;">
                    ${eventLog.map(event => `
                        <li style="padding: var(--space-1) 0; font-size: 0.85rem;">
                            ${event.timestamp ? `<span style="color: var(--text-muted);">[${event.timestamp}]</span> ` : ''}
                            <span style="color: var(--text-base);">${escapeHtml(event.text)}</span>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `;
    }

    // Empty state
    if (usedNPCs.length === 0 && visitedPlaces.length === 0 && completedEncounters.length === 0 &&
        startedEncounters.length === 0 && foundItems.length === 0 && turningPoints.length === 0 && eventLog.length === 0) {
        html += `
            <div style="text-align: center; padding: var(--space-6); color: var(--text-muted);">
                <p>No activity recorded yet.</p>
                <p style="font-size: 0.85rem; margin-top: var(--space-2);">
                    Mark NPCs as "used", places as "visited", encounters as "completed", and items as "found" in the During Play tab.
                </p>
            </div>
        `;
    }

    container.innerHTML = html;
}

function generateSummaryText() {
    collectAllData();

    const sessionNum = document.getElementById('session_number').value || '?';
    const sessionDate = document.getElementById('session_date').value || 'No date';
    const sessionLocation = document.getElementById('session_location').value || 'Unknown location';

    const usedNPCs = (sessionData.npcs || []).filter(npc => npc.status === 'used' && npc.name);
    const visitedPlaces = (sessionData.places || []).filter(place => place.visited && place.name);
    const completedEncounters = (sessionData.encounters || []).filter(enc => enc.status === 'completed' && enc.name);
    const foundItems = (sessionData.items || []).filter(item => item.found && item.name);
    const turningPoints = sessionData.turningPoints || [];
    const eventLog = sessionData.eventLog || [];

    let text = `# Session ${sessionNum} Summary\n`;
    text += `**Date:** ${sessionDate}\n`;
    text += `**Location:** ${sessionLocation}\n`;
    if (sessionData.hook) text += `**Goal:** ${sessionData.hook}\n`;
    text += '\n';

    if (usedNPCs.length > 0) {
        text += `## NPCs Encountered\n`;
        usedNPCs.forEach(npc => {
            text += `- **${npc.name}**${npc.role ? ` (${npc.role})` : ''}${npc.actualLocation ? ` @ ${npc.actualLocation}` : ''}\n`;
        });
        text += '\n';
    }

    if (visitedPlaces.length > 0) {
        text += `## Places Visited\n`;
        visitedPlaces.forEach(place => {
            text += `- **${place.name}**${place.notes ? `: ${place.notes}` : ''}\n`;
        });
        text += '\n';
    }

    if (completedEncounters.length > 0) {
        text += `## Encounters\n`;
        completedEncounters.forEach(enc => {
            text += `- **${enc.name}**${enc.location ? ` @ ${enc.location}` : ''}${enc.loot ? ` - Loot: ${enc.loot}` : ''}\n`;
        });
        text += '\n';
    }

    if (foundItems.length > 0) {
        text += `## Items Found\n`;
        foundItems.forEach(item => {
            text += `- **${item.name}**${item.givenTo ? ` → ${item.givenTo}` : ''}\n`;
        });
        text += '\n';
    }

    if (turningPoints.length > 0) {
        text += `## Key Turning Points\n`;
        turningPoints.forEach(tp => {
            text += `- ${tp.description}${tp.consequence ? ` → ${tp.consequence}` : ''}\n`;
        });
        text += '\n';
    }

    if (eventLog.length > 0) {
        text += `## Event Log\n`;
        eventLog.forEach(event => {
            text += `- ${event.timestamp ? `[${event.timestamp}] ` : ''}${event.text}\n`;
        });
    }

    return text;
}

function copySummaryToClipboard() {
    const text = generateSummaryText();
    navigator.clipboard.writeText(text).then(() => {
        showSaveIndicator('Summary copied to clipboard!');
    }).catch(err => {
        console.error('Copy failed:', err);
        showSaveIndicator('Failed to copy', true);
    });
}

function exportSummaryToAI() {
    const summaryText = generateSummaryText();

    const aiPrompt = `# SESSION NOTES REQUEST

I just finished a session and want you to help me write proper session notes based on what happened.

${summaryText}

Please write:
1. A narrative summary (2-3 paragraphs) of what happened this session
2. Key plot developments to remember
3. Loose threads or unresolved questions
4. Suggestions for follow-up in the next session

Keep the tone fitting for Aedelore (dark fantasy with moral complexity).`;

    // Open AI modal with the prompt
    document.getElementById('ai-modal').style.display = 'flex';
    switchAITab('export');
    populateAISessionSelect();
    toggleAISessionSelect();
    document.getElementById('ai-task-type').value = 'custom';
    updateAITaskDescription();
    document.getElementById('ai-custom-prompt').value = 'Write session notes based on the summary below';
    document.getElementById('ai-export-text').value = aiPrompt;
    document.getElementById('ai-export-output').style.display = 'block';
}

// ============================================
// AI Assistant Functions
// ============================================

const AI_WIKI_LINKS = {
    races: 'https://wiki.aedelore.nu/books/aedelore/chapter/races',
    classes: 'https://wiki.aedelore.nu/books/aedelore/chapter/classes',
    religions: 'https://wiki.aedelore.nu/books/aedelore/chapter/religions',
    folkLore: 'https://wiki.aedelore.nu/books/aedelore/chapter/folk-lore',
    rivermountLibrary: 'https://wiki.aedelore.nu/books/aedelore/chapter/rivermount-library',
    characters: 'https://wiki.aedelore.nu/books/characters-of-aedelore',
    world: 'https://wiki.aedelore.nu/books/aedelore/chapter/the-world',
    weapons: 'https://wiki.aedelore.nu/books/miscs-of-aedelore/page/weapons',
    armor: 'https://wiki.aedelore.nu/books/miscs-of-aedelore/page/armor-shields'
};

const AI_TASK_DESCRIPTIONS = {
    'plan-session': 'AI will suggest hooks, NPCs, encounters, and read-aloud text for your next session.',
    'create-npcs': 'AI will create NPCs with names, roles, descriptions, and dispositions fitting your campaign.',
    'create-encounters': 'AI will design combat encounters with enemies, tactics, and loot.',
    'write-readaloud': 'AI will write atmospheric read-aloud text for locations and scenes.',
    'organize-timeline': 'AI will help assign day and time-of-day values to your existing content so it appears in the right order.',
    'rewrite': 'AI will rewrite and adapt your existing session content based on your instructions. Use the text field to describe what changes you want.',
    'summarize': 'AI will create a summary of your campaign so far.',
    'custom': 'Describe what you need help with in the text field below.'
};

const AI_TASK_PROMPTS = {
    'plan-session': 'Help me plan my next session. Based on the campaign context and what has happened so far, suggest:\n1. A hook/goal for the session\n2. 2-3 NPCs that might appear\n3. 1-2 potential encounters\n4. 2-3 read-aloud texts for key moments',
    'create-npcs': 'Create 3-4 NPCs that would fit this campaign. For each NPC, include:\n- Name (fitting for their race)\n- Role (merchant, guard, villain, etc.)\n- Description and personality\n- What they know or want\n- Disposition (friendly, neutral, hostile)',
    'create-encounters': 'Create 2-3 combat encounters that would fit this campaign. For each encounter include:\n- Name and location\n- Enemies with HP, armor, weapons\n- Tactics they use\n- Simple loot (gold, potions) in the "loot" field\n- Story items (diaries, keys, maps) ONLY in the "items" array with descriptions - NOT in loot!',
    'write-readaloud': 'Write 3-4 atmospheric read-aloud texts for this session. These should be evocative descriptions I can read aloud to my players to set the mood. Include texts for:\n- Arriving at a new location\n- Meeting an important NPC\n- A tense or dramatic moment',
    'organize-timeline': 'Help me organize my session content chronologically. Look at all my places, encounters, NPCs, items, and read-aloud texts above. Suggest which DAY (1, 2, 3...) and TIME OF DAY (dawn, morning, noon, afternoon, dusk, evening, night) each item should have.\n\nFor each item, tell me:\n- Current: [item name]\n- Suggested: Day X, [time]\n- Reason: Why it fits there\n\nThen when I approve, export ALL items with their new day/time values so I can import them. Keep existing content unchanged except for day/time fields.',
    'rewrite': 'I want you to REWRITE and IMPROVE my existing session content. All my current session data is included above.\n\n**READ THE "DM\'S SPECIFIC INSTRUCTIONS" SECTION BELOW** - it contains exactly what I want you to change or improve.\n\nPlease:\n1. Review all the content I have (NPCs, encounters, places, items, read-aloud texts)\n2. Follow my specific instructions from the section below\n3. Keep the same structure but apply the changes I requested\n4. When done, provide the improved content in import format so I can replace the old content\n\n**IMPORTANT:** This is about improving EXISTING content based on my instructions, not creating new content from scratch.',
    'summarize': 'Summarize this campaign based on the session notes provided. Include:\n- Major events and turning points\n- Key NPCs and their roles\n- Ongoing plot threads\n- Unresolved mysteries',
    'custom': ''
};

// ============================================
// Encounter Detail Modal
// ============================================

function showEncounterDetail(index) {
    const enc = sessionData.encounters[index];
    if (!enc) return;

    const modal = document.getElementById('encounter-modal');
    const titleEl = document.getElementById('encounter-modal-title');
    const contentEl = document.getElementById('encounter-modal-content');

    titleEl.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
        ${escapeHtml(enc.name || 'Encounter')}
    `;

    let html = '';

    // Status badge
    const statusLabels = { planned: 'Planned', started: 'In Progress', completed: 'Completed' };
    const statusColors = { planned: 'var(--text-muted)', started: 'var(--accent-gold)', completed: 'var(--accent-green)' };
    html += `<div style="margin-bottom: var(--space-4);"><span style="display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; background: ${statusColors[enc.status] || statusColors.planned}; color: #000;">${statusLabels[enc.status] || 'Planned'}</span></div>`;

    // Location
    if (enc.location) {
        html += `
            <div style="margin-bottom: var(--space-4);">
                <h4 style="color: var(--accent-cyan); margin: 0 0 var(--space-1) 0; font-size: 0.85rem;">Location</h4>
                <p style="margin: 0; color: var(--text-secondary);">${escapeHtml(enc.location)}</p>
            </div>
        `;
    }

    // Participants - grouped by disposition
    if (enc.enemies && enc.enemies.length > 0) {
        const enemies = enc.enemies.filter(e => e.disposition !== 'neutral');
        const neutrals = enc.enemies.filter(e => e.disposition === 'neutral');

        // Helper function to render a participant card
        const renderParticipantCard = (e, eIndex) => {
            const hp = parseInt(e.hp) || 0;
            const maxHp = parseInt(e.maxHp) || parseInt(e.hp) || 1;
            const hpPercent = maxHp > 0 ? Math.max(0, Math.min(100, (hp / maxHp) * 100)) : 0;
            const isDead = hp <= 0 && maxHp > 0;
            const isWounded = hpPercent > 0 && hpPercent < 50;

            // Color coding
            let hpColor = 'var(--accent-green)';
            let bgColor = 'var(--bg-elevated)';
            let icon = e.disposition === 'neutral' ? '😐' : '⚔️';

            if (isDead) {
                hpColor = 'var(--accent-red)';
                bgColor = 'rgba(239, 68, 68, 0.15)';
                icon = '💀';
            } else if (isWounded) {
                hpColor = 'var(--accent-gold)';
            }

            return `
                <div style="background: ${bgColor}; border-radius: 8px; padding: var(--space-3); margin-bottom: var(--space-2); ${isDead ? 'opacity: 0.7;' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-2);">
                        <div>
                            <span style="font-size: 1.1rem; margin-right: 6px;">${icon}</span>
                            <span style="font-weight: 600; color: ${isDead ? 'var(--accent-red)' : 'var(--text-primary)'}; ${isDead ? 'text-decoration: line-through;' : ''}">${escapeHtml(e.name || 'Unknown')}</span>
                            ${e.role ? `<span style="color: var(--text-muted); margin-left: 8px;">(${escapeHtml(e.role)})</span>` : ''}
                        </div>
                    </div>
                    ${e.armor || e.weapon ? `
                        <div style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: var(--space-2);">
                            ${e.armor ? `<span style="color: var(--accent-cyan);">${escapeHtml(e.armor)}</span>` : ''}
                            ${e.armor && e.weapon ? ' • ' : ''}
                            ${e.weapon ? `${escapeHtml(e.weapon)}${e.atkBonus ? ` ${escapeHtml(e.atkBonus)}` : ''}${e.dmg ? ` (${escapeHtml(e.dmg)})` : ''}` : ''}
                        </div>
                    ` : ''}
                    <div style="display: flex; align-items: center; gap: var(--space-2);">
                        <button onclick="adjustParticipantHP(${index}, ${eIndex}, -1, true); event.stopPropagation();" style="width: 28px; height: 28px; border-radius: 4px; border: 1px solid var(--border-default); background: var(--bg-surface); color: var(--text-primary); cursor: pointer; font-weight: bold;">−</button>
                        <div style="flex: 1; position: relative; height: 24px; background: var(--bg-surface); border-radius: 4px; overflow: hidden;">
                            <div style="position: absolute; top: 0; left: 0; height: 100%; width: ${hpPercent}%; background: ${hpColor}; transition: width 0.2s, background 0.2s;"></div>
                            <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; font-weight: 600; font-size: 0.85rem; color: var(--text-primary);">
                                ${hp}/${maxHp}
                            </div>
                        </div>
                        <button onclick="adjustParticipantHP(${index}, ${eIndex}, 1, true); event.stopPropagation();" style="width: 28px; height: 28px; border-radius: 4px; border: 1px solid var(--border-default); background: var(--bg-surface); color: var(--text-primary); cursor: pointer; font-weight: bold;">+</button>
                    </div>
                </div>
            `;
        };

        // Render enemies
        if (enemies.length > 0) {
            const deadCount = enemies.filter(e => (parseInt(e.hp) || 0) <= 0 && (parseInt(e.maxHp) || parseInt(e.hp) || 0) > 0).length;
            html += `
                <div style="margin-bottom: var(--space-4);">
                    <h4 style="color: var(--accent-red); margin: 0 0 var(--space-2) 0; font-size: 0.85rem;">
                        ⚔️ Enemies (${enemies.length}${deadCount > 0 ? `, ${deadCount} dead` : ''})
                    </h4>
                    ${enemies.map((e, i) => {
                        const actualIndex = enc.enemies.indexOf(e);
                        return renderParticipantCard(e, actualIndex);
                    }).join('')}
                </div>
            `;
        }

        // Render neutrals
        if (neutrals.length > 0) {
            html += `
                <div style="margin-bottom: var(--space-4);">
                    <h4 style="color: var(--text-muted); margin: 0 0 var(--space-2) 0; font-size: 0.85rem;">
                        😐 Neutral (${neutrals.length})
                    </h4>
                    ${neutrals.map((e, i) => {
                        const actualIndex = enc.enemies.indexOf(e);
                        return renderParticipantCard(e, actualIndex);
                    }).join('')}
                </div>
            `;
        }
    }

    // Tactics
    if (enc.tactics) {
        html += `
            <div style="margin-bottom: var(--space-4);">
                <h4 style="color: var(--accent-gold); margin: 0 0 var(--space-1) 0; font-size: 0.85rem;">Tactics</h4>
                <p style="margin: 0; color: var(--text-secondary); white-space: pre-wrap;">${escapeHtml(enc.tactics)}</p>
            </div>
        `;
    }

    // Loot with matching items
    const matchingItems = findItemsForEncounter(enc);
    if (enc.loot || matchingItems.length > 0) {
        html += `
            <div style="margin-bottom: var(--space-4);">
                <h4 style="color: var(--accent-gold); margin: 0 0 var(--space-2) 0; font-size: 0.85rem;">💰 Loot</h4>`;

        // Show loot text if present
        if (enc.loot) {
            html += `<p style="margin: 0 0 var(--space-2) 0; color: var(--text-secondary); white-space: pre-wrap;">${escapeHtml(enc.loot)}</p>`;
        }

        // Show matching items with descriptions and Found checkbox
        if (matchingItems.length > 0) {
            matchingItems.forEach(item => {
                const isFound = item.found;
                const foundStyle = isFound ? 'opacity: 0.7;' : '';
                const strikeStyle = isFound ? 'text-decoration: line-through;' : '';

                html += `
                    <div style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.02) 100%); border-radius: 8px; padding: var(--space-3); margin-bottom: var(--space-2); border-left: 3px solid var(--accent-gold); ${foundStyle}">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: ${item.description ? 'var(--space-2)' : '0'};">
                            <div>
                                <span style="font-size: 1rem; margin-right: 6px;">📜</span>
                                <span style="font-weight: 600; color: var(--accent-gold); ${strikeStyle}">${escapeHtml(item.name)}</span>
                            </div>
                            <button onclick="toggleItemFound(${item._index}); showEncounterDetail(${index});" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 4px; border: 1px solid ${isFound ? 'var(--accent-green)' : 'var(--border-default)'}; background: ${isFound ? 'var(--accent-green)' : 'var(--bg-surface)'}; color: ${isFound ? '#000' : 'var(--text-primary)'}; cursor: pointer;">
                                ${isFound ? '✓ Found' : '☐ Mark Found'}
                            </button>
                        </div>
                        ${item.description ? `
                            <div style="font-size: 0.85rem; color: var(--text-secondary); padding: 8px 12px; background: var(--bg-elevated); border-radius: 6px; font-style: italic; white-space: pre-wrap;">"${escapeHtml(item.description)}"</div>
                        ` : ''}
                    </div>
                `;
            });
        }

        html += `</div>`;
    }

    // Notes
    if (enc.notes) {
        html += `
            <div style="margin-bottom: var(--space-4);">
                <h4 style="color: var(--text-muted); margin: 0 0 var(--space-1) 0; font-size: 0.85rem;">Notes</h4>
                <p style="margin: 0; color: var(--text-secondary); white-space: pre-wrap;">${escapeHtml(enc.notes)}</p>
            </div>
        `;
    }

    if (!enc.location && (!enc.enemies || enc.enemies.length === 0) && !enc.tactics && !enc.loot && !enc.notes) {
        html = '<p style="color: var(--text-muted); text-align: center;">No details added for this encounter yet.</p>';
    }

    // Add "Go to Encounter" button
    html += `
        <div style="margin-top: var(--space-4); padding-top: var(--space-3); border-top: 1px solid var(--border-subtle); text-align: center;">
            <button onclick="goToEncounterInPlanning(${index})" style="padding: 8px 20px; background: var(--accent-cyan); color: #000; border: none; border-radius: var(--radius-md); cursor: pointer; font-weight: 500;">
                ✏️ Go to Encounter
            </button>
        </div>
    `;

    contentEl.innerHTML = html;
    modal.style.display = 'flex';
}

function hideEncounterModal() {
    document.getElementById('encounter-modal').style.display = 'none';
}

function showAIExportModal() {
    document.getElementById('ai-modal').style.display = 'flex';
    switchAITab('export');
    document.getElementById('ai-export-output').style.display = 'none';
    document.getElementById('ai-import-preview').style.display = 'none';
    populateAISessionSelect();
    toggleAISessionSelect();
}

function hideAIModal() {
    document.getElementById('ai-modal').style.display = 'none';
}

function switchAITab(tab) {
    document.getElementById('ai-tab-export').classList.toggle('active', tab === 'export');
    document.getElementById('ai-tab-import').classList.toggle('active', tab === 'import');
    document.getElementById('ai-export-tab').style.display = tab === 'export' ? 'block' : 'none';
    document.getElementById('ai-import-tab').style.display = tab === 'import' ? 'block' : 'none';
}

function updateAITaskDescription() {
    const taskType = document.getElementById('ai-task-type').value;
    document.getElementById('ai-task-description').textContent = AI_TASK_DESCRIPTIONS[taskType];
}

// Toggle and populate AI session selector
function toggleAISessionSelect() {
    const checkbox = document.getElementById('ai-include-previous');
    const select = document.getElementById('ai-session-select');
    if (select) {
        select.disabled = !checkbox.checked;
        select.style.opacity = checkbox.checked ? '1' : '0.5';
    }
}

function populateAISessionSelect() {
    const select = document.getElementById('ai-session-select');
    if (!select) return;

    let html = '<option value="all">All previous sessions</option>';
    html += '<option value="none">None (current session only)</option>';

    if (allCampaigns && allCampaigns.length > 0) {
        const campaign = allCampaigns.find(c => c.id === currentCampaignId);
        if (campaign && campaign.sessions && campaign.sessions.length > 0) {
            const currentSessionNum = parseInt(document.getElementById('session_number')?.value) || 0;

            // Add previous sessions (sorted by session number descending)
            const previousSessions = campaign.sessions
                .filter(s => s.session_number < currentSessionNum || s.id !== currentSessionId)
                .sort((a, b) => b.session_number - a.session_number);

            if (previousSessions.length > 0) {
                html += '<optgroup label="Specific Session">';
                previousSessions.forEach(s => {
                    const date = s.date ? ` - ${s.date}` : '';
                    const status = s.status === 'locked' ? ' [Completed]' : '';
                    html += `<option value="${s.id}">Session #${s.session_number}${date}${status}</option>`;
                });
                html += '</optgroup>';
            }
        }
    }

    select.innerHTML = html;
}

// ============================================
// Prologue Session Selector
// ============================================

let prologueSessionsCache = [];

async function showPrologueSessionModal() {
    const modal = document.getElementById('prologue-session-modal');
    const select = document.getElementById('prologue-session-select');

    // Fetch all sessions for current campaign
    try {
        const res = await fetch(`/api/campaigns/${currentCampaignId}/sessions`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (res.ok) {
            const sessions = await res.json();
            prologueSessionsCache = sessions;

            // Build options - current session first, then previous sessions
            const currentSessionNum = parseInt(document.getElementById('session_number').value) || 0;

            let html = `<option value="current">Current session (#${currentSessionNum})</option>`;

            // Add previous sessions (sorted by session number descending)
            const previousSessions = sessions
                .filter(s => s.session_number < currentSessionNum)
                .sort((a, b) => b.session_number - a.session_number);

            if (previousSessions.length > 0) {
                html += `<optgroup label="Previous Sessions">`;
                previousSessions.forEach(s => {
                    const date = s.date ? ` - ${s.date}` : '';
                    const status = s.status === 'locked' ? ' [Completed]' : '';
                    html += `<option value="${s.id}">Session #${s.session_number}${date}${status}</option>`;
                });
                html += `</optgroup>`;
            }

            select.innerHTML = html;
        }
    } catch (error) {
        console.error('Failed to fetch sessions for prologue:', error);
    }

    modal.style.display = 'flex';
}

function closePrologueSessionModal() {
    document.getElementById('prologue-session-modal').style.display = 'none';
}

async function generatePrologueFromSelectedSession() {
    const select = document.getElementById('prologue-session-select');
    const selectedValue = select.value;

    closePrologueSessionModal();

    let sourceSessionData;
    let sourceSessionNumber;

    if (selectedValue === 'current') {
        // Use current session data
        collectAllData();
        sourceSessionData = sessionData;
        sourceSessionNumber = document.getElementById('session_number').value || '?';
    } else {
        // Fetch the selected session's data
        try {
            const res = await fetch(`/api/sessions/${selectedValue}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });

            if (res.ok) {
                const session = await res.json();
                sourceSessionData = session.data || {};
                sourceSessionNumber = session.session_number;
            } else {
                alert('Failed to load selected session');
                return;
            }
        } catch (error) {
            console.error('Failed to fetch session:', error);
            alert('Failed to load selected session');
            return;
        }
    }

    // Generate the prologue prompt with the selected session's data
    generateProloguePrompt(sourceSessionData, sourceSessionNumber);
}

function generateProloguePrompt(sourceData, sourceSessionNumber) {
    collectAllData();

    let output = `# AEDELORE DM ASSISTANT - QUICK REQUEST

**IMPORTANT:** Before responding, you MUST:
1. Read and fetch ALL the wiki links below
2. Start your response with: "I have read the Aedelore wiki and reviewed your campaign data."

## WORLD REFERENCE (READ ALL LINKS)
- Races: ${AI_WIKI_LINKS.races}
- Classes: ${AI_WIKI_LINKS.classes}
- Religions: ${AI_WIKI_LINKS.religions}
- The World (cities & places): ${AI_WIKI_LINKS.world}
- Weapons: ${AI_WIKI_LINKS.weapons}
- Armor: ${AI_WIKI_LINKS.armor}

## GAME RULES
**Potions (no health potions!):**
- Adrenaline Potion: Ignore 1 HP damage per dose (max 10)
- Antidote: Halts poison 1 round per dose (max 10)
- Poison Potion: Poison weapons/food (max 10)
- Arcane Elixir: +10 Arcana for Mages/Druids (max 10)

**Currency:** Gold > Silver > Copper (10:1 ratio)

## CAMPAIGN CONTEXT
**Campaign:** ${currentCampaignName || 'Unnamed'}
**Current Location:** ${document.getElementById('session_location')?.value || 'Unknown'}
`;

    // Add player info for context
    if (sessionData.players && sessionData.players.length > 0) {
        output += `\n**Party:** `;
        output += sessionData.players
            .filter(p => p.character)
            .map(p => `${p.character} (${p.race} ${p.class})`)
            .join(', ');
        output += '\n';
    }

    output += `
## REQUEST: Create Session Prologue

Write a compelling read-aloud prologue for the CURRENT session. This will be read to the players at the start to:
1. Remind them what happened in Session #${sourceSessionNumber}
2. Set the scene for where they are now
3. Build anticipation for the session ahead

**Tone:** Dark fantasy, evocative, second person ("You stand at the crossroads...")

**Format:** 2-4 paragraphs, suitable for reading aloud (about 1-2 minutes)

**Include:**
- Brief recap of key events from Session #${sourceSessionNumber}
- Where the party currently is
- Sensory details (what they see, hear, feel)
- A hook or tension point leading into this session

## DATA FROM SESSION #${sourceSessionNumber}
`;

    // Add source session's events
    if (sourceData.eventLog && sourceData.eventLog.length > 0) {
        output += `\n**Events that happened:**\n`;
        sourceData.eventLog.forEach(e => {
            output += `- ${e.text}\n`;
        });
    } else {
        output += `\n**Events:** (No events logged)\n`;
    }

    // Add source session's turning points
    if (sourceData.turningPoints && sourceData.turningPoints.length > 0) {
        output += `\n**Key turning points:**\n`;
        sourceData.turningPoints.forEach(tp => {
            output += `- ${tp.description}${tp.consequence ? ' → ' + tp.consequence : ''}\n`;
        });
    }

    // Add NPCs met
    const usedNPCs = (sourceData.npcs || []).filter(n => n.status === 'used' && n.name);
    if (usedNPCs.length > 0) {
        output += `\n**NPCs encountered:**\n`;
        usedNPCs.forEach(npc => {
            output += `- ${npc.name}${npc.role ? ' (' + npc.role + ')' : ''}\n`;
        });
    }

    // Add places visited
    const visitedPlaces = (sourceData.places || []).filter(p => p.visited && p.name);
    if (visitedPlaces.length > 0) {
        output += `\n**Places visited:**\n`;
        visitedPlaces.forEach(place => {
            output += `- ${place.name}\n`;
        });
    }

    // Add encounters
    const completedEncounters = (sourceData.encounters || []).filter(e => e.status === 'completed' && e.name);
    if (completedEncounters.length > 0) {
        output += `\n**Encounters:**\n`;
        completedEncounters.forEach(enc => {
            output += `- ${enc.name}\n`;
        });
    }

    output += `\n**Current session goal:** ${sessionData.hook || 'Not set'}\n`;
    output += `**Session location:** ${document.getElementById('session_location')?.value || 'Not set'}\n`;

    output += `\nWrite the prologue and then ask if I want to copy it to the Session Prologue field.`;

    document.getElementById('ai-task-type').value = 'custom';
    updateAITaskDescription();
    document.getElementById('ai-custom-prompt').value = '';
    document.getElementById('ai-export-text').value = output;
    document.getElementById('ai-export-output').style.display = 'block';
}

// Helper function to get content guidelines based on session type and length
function getSessionContentGuidelines() {
    const sessionType = document.getElementById('ai-session-type')?.value || 'mixed';
    const sessionLength = parseInt(document.getElementById('ai-session-length')?.value) || 3;

    // Base content amounts per hour
    const contentPerHour = {
        combat: {
            encounters: 1.5,
            npcs: 1.5,
            places: 1,
            readAloud: 2,
            items: 1
        },
        roleplay: {
            encounters: 0.3,
            npcs: 3,
            places: 1.5,
            readAloud: 2.5,
            items: 0.5
        },
        mixed: {
            encounters: 0.7,
            npcs: 2,
            places: 1.5,
            readAloud: 2,
            items: 1
        }
    };

    const base = contentPerHour[sessionType] || contentPerHour.mixed;

    // Calculate amounts (round to reasonable numbers)
    const amounts = {
        encounters: Math.max(1, Math.round(base.encounters * sessionLength)),
        npcs: Math.max(2, Math.round(base.npcs * sessionLength)),
        places: Math.max(1, Math.round(base.places * sessionLength)),
        readAloud: Math.max(2, Math.round(base.readAloud * sessionLength)),
        items: Math.max(1, Math.round(base.items * sessionLength))
    };

    const typeDescriptions = {
        combat: 'Combat-focused session with tactical encounters and action',
        roleplay: 'Roleplay-focused session with dialogue, intrigue, and character moments',
        mixed: 'Balanced session mixing combat, exploration, and roleplay'
    };

    return {
        type: sessionType,
        hours: sessionLength,
        description: typeDescriptions[sessionType],
        amounts: amounts,
        text: `
## SESSION PLANNING PARAMETERS
**Session Type:** ${typeDescriptions[sessionType]}
**Session Length:** ${sessionLength} hour${sessionLength > 1 ? 's' : ''}

**Content Guidelines for ${sessionLength}h ${sessionType} session:**
- Encounters: ${amounts.encounters} (${sessionType === 'combat' ? 'main focus' : sessionType === 'roleplay' ? 'optional/avoidable' : 'balanced pacing'})
- NPCs: ${amounts.npcs} (${sessionType === 'roleplay' ? 'main focus - varied personalities' : 'supporting cast'})
- Places: ${amounts.places} (locations to explore)
- Read-aloud texts: ${amounts.readAloud} (atmospheric descriptions)
- Story items: ${amounts.items} (diaries, keys, clues - NOT in encounter loot)

**Pacing tip:** For ${sessionLength}h, plan for ${Math.ceil(sessionLength * 2)} "beats" or scene changes.
`
    };
}

// Helper function to get session summary for AI context
function getSelectedSessionSummary(selectedSessionId) {
    let output = '';

    if (!allCampaigns || allCampaigns.length === 0) return output;

    const campaign = allCampaigns.find(c => c.id === currentCampaignId);
    if (!campaign || !campaign.sessions || campaign.sessions.length === 0) return output;

    if (selectedSessionId === 'all') {
        // Include all previous sessions
        output += `\n### Previous Sessions\n`;
        campaign.sessions.forEach(session => {
            if (session.id !== currentSessionId) {
                output += `\n**Session ${session.session_number}** (${session.date || 'No date'})\n`;
                if (session.data) {
                    if (session.data.sessionNotes && session.data.sessionNotes.summary) {
                        output += `Summary: ${session.data.sessionNotes.summary}\n`;
                    }
                    if (session.data.turningPoints && session.data.turningPoints.length > 0) {
                        output += `Key moments: ${session.data.turningPoints.map(tp => tp.description).join('; ')}\n`;
                    }
                }
            }
        });
    } else if (selectedSessionId && selectedSessionId !== 'none') {
        // Include specific session
        const session = campaign.sessions.find(s => s.id == selectedSessionId);
        if (session && session.id !== currentSessionId) {
            output += `\n### Previous Session Context\n`;
            output += `\n**Session ${session.session_number}** (${session.date || 'No date'})\n`;
            if (session.data) {
                if (session.data.sessionNotes && session.data.sessionNotes.summary) {
                    output += `Summary: ${session.data.sessionNotes.summary}\n`;
                }
                if (session.data.turningPoints && session.data.turningPoints.length > 0) {
                    output += `Key moments: ${session.data.turningPoints.map(tp => tp.description).join('; ')}\n`;
                }
                if (session.data.eventLog && session.data.eventLog.length > 0) {
                    output += `Events: ${session.data.eventLog.map(e => e.text).join('; ')}\n`;
                }
            }
        }
    }

    return output;
}

// Quick AI Actions - generates focused prompts for specific tasks
function quickAIAction(action, buttonEl) {
    collectAllData();

    // Highlight the selected quick action button
    const allQuickButtons = document.querySelectorAll('#quick-action-buttons button[data-quick-action]');
    allQuickButtons.forEach(btn => {
        btn.style.background = 'var(--bg-elevated)';
        btn.style.borderColor = 'var(--border-default)';
        btn.style.color = 'var(--text-secondary)';
    });
    if (buttonEl) {
        buttonEl.style.background = 'var(--accent-primary)';
        buttonEl.style.borderColor = 'var(--accent-primary)';
        buttonEl.style.color = 'white';
    }

    // Respect the checkbox setting
    const includePrevious = document.getElementById('ai-include-previous')?.checked;
    const selectedSessionId = document.getElementById('ai-session-select')?.value;

    let output = `# AEDELORE DM ASSISTANT - QUICK REQUEST

**IMPORTANT:** Before responding, you MUST:
1. Read and fetch ALL the wiki links below
2. Start your response with: "I have read the Aedelore wiki and reviewed your campaign data."

## WORLD REFERENCE (READ ALL LINKS)
- Races: ${AI_WIKI_LINKS.races}
- Classes: ${AI_WIKI_LINKS.classes}
- Religions: ${AI_WIKI_LINKS.religions}
- The World (cities & places): ${AI_WIKI_LINKS.world}
- Weapons: ${AI_WIKI_LINKS.weapons}
- Armor: ${AI_WIKI_LINKS.armor}

## GAME RULES
**Potions (no health potions!):**
- Adrenaline Potion: Ignore 1 HP damage per dose (max 10)
- Antidote: Halts poison 1 round per dose (max 10)
- Poison Potion: Poison weapons/food (max 10)
- Arcane Elixir: +10 Arcana for Mages/Druids (max 10)

**Currency:** Gold > Silver > Copper (10:1 ratio)

## CAMPAIGN CONTEXT
**Campaign:** ${currentCampaignName || 'Unnamed'}
**Current Location:** ${document.getElementById('session_location')?.value || 'Unknown'}
`;

    // Add player info for context
    if (sessionData.players && sessionData.players.length > 0) {
        output += `\n**Party:** `;
        output += sessionData.players
            .filter(p => p.character)
            .map(p => `${p.character} (${p.race} ${p.class})`)
            .join(', ');
        output += '\n';
    }

    // Add previous session data if checkbox is checked
    if (includePrevious) {
        output += getSelectedSessionSummary(selectedSessionId);
    }

    // Add session planning guidelines
    const guidelines = getSessionContentGuidelines();
    output += guidelines.text;

    // Current session number for day suggestions
    const currentDay = document.getElementById('session_number')?.value || 1;

    switch(action) {
        case 'random-npc':
            output += `
## REQUEST: Create 1 Random NPC

Create ONE interesting NPC for my current session. Include:
- Name (fitting for Aedelore's dark fantasy setting)
- Race and apparent age
- Role (merchant, guard, beggar, noble, etc.)
- Brief description (appearance, mannerisms)
- What they want or know
- Disposition (friendly/neutral/hostile)
- Suggested day and time when party meets them
- Location where they can be found

Make them memorable with a quirk or secret.

When done, offer to export in this format:
---IMPORT_START---
{"npcs": [{"name": "...", "role": "...", "description": "...", "disposition": "friendly", "day": ${currentDay}, "time": "evening", "plannedLocation": "The Tavern"}]}
---IMPORT_END---

**TIME VALUES:** dawn, morning, noon, afternoon, dusk, evening, night`;
            break;

        case 'random-encounter':
            output += `
## REQUEST: Create 1 Combat Encounter

Create ONE balanced combat encounter. Include:
- Encounter name and location description
- 2-4 participants with: Name, Disposition (enemy/neutral), Role (Warrior/Rogue/Mage/etc.), HP, Armor, Weapon, Attack Bonus, Damage
- Tactics (how they fight)
- Simple loot (gold, potions) - put ONLY in the encounter's "loot" field
- Story-important items (diaries, maps, keys, letters) - put ONLY in the "items" array with descriptions, NOT in "loot"
- Suggested day and time for the encounter

**IMPORTANT:** Do NOT duplicate items! Simple loot goes in "loot" field, story items go ONLY in "items" array.

Balance for a party of ${sessionData.players?.length || 4} adventurers.

When done, offer to export in this format:
---IMPORT_START---
{"encounters": [{"name": "...", "location": "Forest Road", "day": ${currentDay}, "time": "dusk", "enemies": [{"name": "...", "disposition": "enemy", "role": "Warrior", "hp": "15", "armor": "Leather", "weapon": "Sword", "atkBonus": "+2", "dmg": "1d6"}], "tactics": "...", "loot": "25 gold, 2 antidotes"}], "items": [{"name": "Mysterious Letter", "description": "Details about what the letter says and why it matters...", "day": ${currentDay}, "time": "dusk", "plannedLocation": "Forest Road"}]}
---IMPORT_END---

**TIME VALUES:** dawn, morning, noon, afternoon, dusk, evening, night`;
            break;

        case 'describe-location':
            const currentLoc = document.getElementById('session_location')?.value || '';
            output += `
## REQUEST: Atmospheric Location Description

Write an evocative read-aloud description for: "${currentLoc || 'a location the party is entering'}"

The description should:
- Set the mood (dark fantasy tone)
- Appeal to multiple senses (sight, sound, smell)
- Be 2-3 paragraphs, suitable for reading aloud
- Hint at possible dangers or mysteries

When done, offer to export in this format:
---IMPORT_START---
{"readAloud": [{"title": "Entering ${currentLoc || 'the Location'}", "text": "...", "day": ${currentDay}, "time": "evening", "linkedType": "place", "linkedTo": "${currentLoc || ''}"}]}
---IMPORT_END---

**TIME VALUES:** dawn, morning, noon, afternoon, dusk, evening, night
**LINKED TYPE:** place, encounter, npc`;
            break;

        case 'session-recap':
            output += `\n## REQUEST: Session Recap for Players

Based on what happened this session, write a brief recap I can share with players. Include:
- Main events in narrative form
- Key decisions the party made
- Unresolved plot threads
- A hook for next session

Keep it engaging and in-world (as if told by a bard).

**What happened this session:**\n`;

            if (sessionData.eventLog && sessionData.eventLog.length > 0) {
                sessionData.eventLog.forEach(e => {
                    output += `- ${e.text}\n`;
                });
            } else {
                output += `(No events logged yet)\n`;
            }

            if (sessionData.turningPoints && sessionData.turningPoints.length > 0) {
                output += `\n**Key Moments:**\n`;
                sessionData.turningPoints.forEach(tp => {
                    output += `- ${tp.description}\n`;
                });
            }
            break;

        case 'new-session':
            output += `
## REQUEST: Generate Complete Starting Session

Create a COMPLETE session ready to play, following the content guidelines above. Include:

### Required Content:
1. **Session Hook** - A compelling reason for the party to get involved
2. **Places** (${guidelines.amounts.places}) - Locations with atmospheric descriptions
3. **NPCs** (${guidelines.amounts.npcs}) - Interesting characters with motivations
4. **Encounters** (${guidelines.amounts.encounters}) - ${guidelines.type === 'combat' ? 'Tactical combat encounters' : guidelines.type === 'roleplay' ? 'Social/exploration encounters (combat optional)' : 'Mix of combat and social encounters'}
5. **Read-aloud texts** (${guidelines.amounts.readAloud}) - Atmospheric descriptions for key moments
6. **Story items** (${guidelines.amounts.items}) - Clues, letters, keys that advance the plot

### Structure:
- Create a clear narrative flow from hook to climax
- Link encounters, NPCs, and items to specific places
- Include day and time values for all content
- Make sure content fits a ${guidelines.hours}-hour ${guidelines.type} session

### Important:
- Simple loot (gold, potions) goes in encounter "loot" field
- Story items (diaries, keys) go ONLY in "items" array with descriptions
- Each NPC should have a purpose in the story

When done, provide the full export format so I can import everything at once.

---IMPORT_START---
{
  "hook": "The session hook text",
  "places": [...],
  "npcs": [...],
  "encounters": [...],
  "readAloud": [...],
  "items": [...]
}
---IMPORT_END---

**TIME VALUES:** dawn, morning, noon, afternoon, dusk, evening, night`;
            break;
    }

    document.getElementById('ai-task-type').value = 'custom';
    updateAITaskDescription();
    document.getElementById('ai-custom-prompt').value = '';
    document.getElementById('ai-export-text').value = output;
    document.getElementById('ai-export-output').style.display = 'block';
}

function generateAIExport() {
    collectAllData();

    const taskType = document.getElementById('ai-task-type').value;
    const customPrompt = document.getElementById('ai-custom-prompt').value.trim();
    const includePrevious = document.getElementById('ai-include-previous').checked;
    const selectedSessionId = document.getElementById('ai-session-select')?.value || 'all';

    let output = `# AEDELORE DM ASSISTANT

## INSTRUCTIONS
You are a DM assistant for the Aedelore tabletop RPG system. Your role is to help the DM plan sessions, create content, and develop their campaign.

**IMPORTANT RULES:**
1. **FIRST:** Read and fetch ALL the wiki links below before responding. You MUST understand the world.
2. **START YOUR RESPONSE** by confirming: "I have read the Aedelore wiki pages for [list what you read] and reviewed your campaign data."
3. Base your suggestions on the CAMPAIGN DATA below - this is the DM's actual game
4. Use the wiki links to understand the world's tone, setting, locations, and lore
5. Keep suggestions dark fantasy themed with moral complexity
6. Give your suggestions in clear, readable prose
7. When the DM approves your suggestions, ask: "Should I export this in import format for the DM tool?"
8. If they say yes, output the data between ---IMPORT_START--- and ---IMPORT_END--- markers
9. **CRITICAL JSON RULE:** In the JSON export, NEVER use double quotes (") inside text strings. Use SINGLE quotes (') for all dialogue and speech. Example: 'Gå inte ner i mörkret' NOT "Gå inte ner i mörkret". Double quotes inside strings break JSON parsing!
10. **LOOT RULE - NO DUPLICATES:** Simple loot (gold, potions, basic gear) goes ONLY in the encounter's "loot" field. Story items (diaries, keys, maps, letters) go ONLY in the "items" array with descriptions - NEVER put them in the "loot" field. Example: loot="25 gold, 2 antidotes" and items=[{"name": "Aldrich's Diary", "description": "Contains secret meeting notes..."}]

## WORLD REFERENCE (MUST READ ALL LINKS)
**Read ALL these links before responding:**
- Races: ${AI_WIKI_LINKS.races}
- Classes: ${AI_WIKI_LINKS.classes}
- Religions: ${AI_WIKI_LINKS.religions}
- The World (cities & places): ${AI_WIKI_LINKS.world}
- Folk Lore: ${AI_WIKI_LINKS.folkLore}
- History: ${AI_WIKI_LINKS.rivermountLibrary}
- Important Characters: ${AI_WIKI_LINKS.characters}
- Weapons: ${AI_WIKI_LINKS.weapons}
- Armor & Shields: ${AI_WIKI_LINKS.armor}

## GAME ITEMS (use ONLY these)
**Potions in Aedelore (no health potions exist!):**
- Adrenaline Potion: Ignore 1 HP damage per dose (max 10)
- Antidote: Halts poison effect for 1 round per dose (max 10)
- Poison Potion: Can be used to poison weapons or food (max 10)
- Arcane Elixir: Restores 10 Arcana points, only for Mages/Druids (max 10)

**Currency:** Gold, Silver, Copper (10 copper = 1 silver, 10 silver = 1 gold)

## CAMPAIGN DATA

**Campaign:** ${currentCampaignName || 'Unnamed Campaign'}
`;

    // Add campaign description if available
    if (currentCampaignDescription) {
        output += `**Description:** ${currentCampaignDescription}\n`;
    }

    // Add previous sessions if requested
    if (includePrevious) {
        output += getSelectedSessionSummary(selectedSessionId);
    }

    // Add current session data
    output += `\n### Current Session (${document.getElementById('session_number').value || 'New'})
**Date:** ${document.getElementById('session_date').value || 'Not set'}
**Location:** ${document.getElementById('session_location').value || 'Not set'}
`;

    if (sessionData.hook) {
        output += `**Hook/Goal:** ${sessionData.hook}\n`;
    }

    // Players
    if (sessionData.players && sessionData.players.length > 0) {
        output += `\n**Player Characters:**\n`;
        sessionData.players.forEach(p => {
            if (p.character) {
                output += `- ${p.character} (${p.race} ${p.class}${p.religion ? ', ' + p.religion : ''})${p.notes ? ' - ' + p.notes : ''}\n`;
            }
        });
    }

    // NPCs
    if (sessionData.npcs && sessionData.npcs.length > 0) {
        output += `\n**NPCs in this session:**\n`;
        sessionData.npcs.forEach(npc => {
            if (npc.name) {
                const dayInfo = npc.day ? `[Day ${npc.day}]` : '';
                const timeInfo = npc.time ? `[${TIME_LABELS[npc.time] || npc.time}]` : '';
                const placeInfo = npc.plannedLocation ? `@ ${npc.plannedLocation}` : '';
                output += `- ${npc.name} (${npc.role || 'Unknown role'}) ${dayInfo} ${timeInfo} ${placeInfo} - ${npc.description || 'No description'}\n`;
            }
        });
    }

    // Places
    if (sessionData.places && sessionData.places.length > 0) {
        output += `\n**Locations:**\n`;
        sessionData.places.forEach(place => {
            if (place.name) {
                const dayInfo = place.day ? `[Day ${place.day}]` : '';
                const timeInfo = place.time ? `[${TIME_LABELS[place.time] || place.time}]` : '';
                output += `- ${place.name} ${dayInfo} ${timeInfo}${place.visited ? ' [VISITED]' : ''}: ${place.description || 'No description'}\n`;
            }
        });
    }

    // Encounters (with full details)
    if (sessionData.encounters && sessionData.encounters.length > 0) {
        output += `\n**Planned Encounters:**\n`;
        sessionData.encounters.forEach((enc, idx) => {
            if (enc.name) {
                const dayInfo = enc.day ? `[Day ${enc.day}]` : '';
                const timeInfo = enc.time ? `[${TIME_LABELS[enc.time] || enc.time}]` : '';
                output += `\n### ${idx + 1}. ${enc.name} ${dayInfo} ${timeInfo}\n`;
                output += `- **Location:** ${enc.location || 'Unknown'}\n`;
                output += `- **Status:** ${enc.status || 'planned'}\n`;
                if (enc.time) output += `- **Time of day:** ${TIME_LABELS[enc.time] || enc.time}\n`;
                if (enc.tactics) output += `- **Tactics:** ${enc.tactics}\n`;
                if (enc.loot) output += `- **Loot:** ${enc.loot}\n`;
                if (enc.notes) output += `- **Notes:** ${enc.notes}\n`;

                if (enc.enemies && enc.enemies.length > 0) {
                    output += `- **Enemies (${enc.enemies.length}):**\n`;
                    enc.enemies.forEach(enemy => {
                        const stats = [];
                        if (enemy.hp) stats.push(`HP: ${enemy.hp}`);
                        if (enemy.armor) stats.push(`Armor: ${enemy.armor}`);
                        if (enemy.weapon) stats.push(`Weapon: ${enemy.weapon}`);
                        if (enemy.atkBonus) stats.push(`Atk: ${enemy.atkBonus}`);
                        if (enemy.dmg) stats.push(`Dmg: ${enemy.dmg}`);
                        output += `  - ${enemy.name || 'Unknown'} (${stats.join(', ') || 'no stats'})\n`;
                    });
                }
            }
        });
    }

    // Items/Clues
    if (sessionData.items && sessionData.items.length > 0) {
        output += `\n**Items & Clues:**\n`;
        sessionData.items.forEach(item => {
            if (item.name) {
                const dayInfo = item.day ? `[Day ${item.day}]` : '';
                const timeInfo = item.time ? `[${TIME_LABELS[item.time] || item.time}]` : '';
                const placeInfo = item.plannedLocation ? `@ ${item.plannedLocation}` : '';
                output += `- ${item.name} ${dayInfo} ${timeInfo} ${placeInfo}${item.found ? ' [FOUND]' : ''}: ${item.description || 'No description'}\n`;
            }
        });
    }

    // Read-Aloud texts
    if (sessionData.readAloud && sessionData.readAloud.length > 0) {
        output += `\n**Read-Aloud Texts:**\n`;
        sessionData.readAloud.forEach(ra => {
            if (ra.title || ra.text) {
                const dayInfo = ra.day ? `[Day ${ra.day}]` : '';
                const timeInfo = ra.time ? `[${TIME_LABELS[ra.time] || ra.time}]` : '';
                const linkedType = ra.linkedType || (ra.place ? 'place' : null);
                const linkedTo = ra.linkedTo || ra.place || '';
                let linkedInfo = '';
                if (linkedType && linkedTo) {
                    const typeLabel = linkedType === 'place' ? '📍' : linkedType === 'encounter' ? '⚔️' : '👤';
                    linkedInfo = `[${typeLabel} ${linkedTo}]`;
                }
                output += `- **${ra.title || 'Untitled'}** ${dayInfo} ${timeInfo} ${linkedInfo}${ra.read ? ' [READ]' : ''}\n`;
                if (ra.text) output += `  "${ra.text.substring(0, 150)}${ra.text.length > 150 ? '...' : ''}"\n`;
            }
        });
    }

    // Event log
    if (sessionData.eventLog && sessionData.eventLog.length > 0) {
        output += `\n**What has happened this session:**\n`;
        sessionData.eventLog.forEach(event => {
            output += `- ${event.timestamp ? '[' + event.timestamp + '] ' : ''}${event.text}\n`;
        });
    }

    // Turning points
    if (sessionData.turningPoints && sessionData.turningPoints.length > 0) {
        output += `\n**Key turning points:**\n`;
        sessionData.turningPoints.forEach(tp => {
            output += `- ${tp.description}${tp.consequence ? ' → ' + tp.consequence : ''}\n`;
        });
    }

    // Add session planning guidelines
    const guidelines = getSessionContentGuidelines();
    output += guidelines.text;

    // Task
    output += `\n## TASK
${AI_TASK_PROMPTS[taskType]}
`;

    // Always add DM instructions section
    output += `\n## DM'S SPECIFIC INSTRUCTIONS
${customPrompt || '(No specific instructions provided - use your best judgment)'}
`;

    // Import format instructions
    output += `
## IMPORT FORMAT (use when DM asks for export)
When the DM approves your suggestions and wants to import them, output ONLY this format:

### HOW CONTENT IS ORGANIZED IN THE DM TOOL
The DM tool displays content organized by **DAY → TIME → PLACE** with nested structure:

1. **Time of day:** dawn, morning, noon, afternoon, dusk, evening, night
2. **Places** are containers - encounters, NPCs, items, and read-aloud can be nested INSIDE places
3. **Encounters** can contain items (from loot) and read-aloud

### CRITICAL LINKING RULES
For content to appear **NESTED UNDER A PLACE**:
- Set \`"location"\` (for encounters) or \`"plannedLocation"\` (for NPCs/items) to the EXACT name of the place
- Both the place AND the linked content must have the SAME \`"day"\` and \`"time"\` values!

For read-aloud to appear **NESTED UNDER encounters/NPCs**:
- Use \`"linkedType": "encounter"\` or \`"linkedType": "npc"\`
- Set \`"linkedTo"\` to the EXACT name of the encounter/NPC

**EXAMPLE:** If you have a place called "The Rusty Anchor" at day 1, evening, then an NPC at that tavern should have:
\`"plannedLocation": "The Rusty Anchor", "day": 1, "time": "evening"\`

### VALUES
- **TIME:** dawn, morning, noon, afternoon, dusk, evening, night
- **LINKED TYPE (readAloud):** place, encounter, npc
- **DISPOSITION (participants):** enemy, neutral
- **ROLES (participants):** Warrior, Rogue, Mage, Healer, Ranger, Beast, Civilian, Historian, Other

### CRITICAL JSON RULES
- Use SINGLE quotes (') for dialogue, NEVER double quotes. Example: 'Hello traveler' NOT "Hello traveler"
- **LOOT vs ITEMS - NO DUPLICATES!**
  - \`"loot"\` field = ONLY simple items (gold, silver, potions, basic gear)
  - \`"items"\` array = ONLY story-important items (diaries, keys, maps, letters) with descriptions
  - NEVER put the same item in both places!

---IMPORT_START---
{
  "hook": "The session hook/goal text",
  "places": [
    {"name": "The Rusty Anchor", "description": "A weathered tavern by the docks", "day": 1, "time": "evening"},
    {"name": "Forest Road", "description": "A dark path through the woods", "day": 1, "time": "dusk"}
  ],
  "npcs": [
    {"name": "Old Marta", "role": "Tavern keeper", "description": "Knows everyone's secrets", "disposition": "friendly", "day": 1, "time": "evening", "plannedLocation": "The Rusty Anchor"}
  ],
  "encounters": [
    {
      "name": "Bandit Ambush",
      "location": "Forest Road",
      "day": 1,
      "time": "dusk",
      "enemies": [
        {"name": "Bandit Leader", "disposition": "enemy", "role": "Warrior", "hp": "15", "armor": "Leather", "weapon": "Sword", "atkBonus": "+3", "dmg": "1d8"},
        {"name": "Captured Merchant", "disposition": "neutral", "role": "Civilian", "hp": "5"}
      ],
      "tactics": "Leader fights while others flank",
      "loot": "25 gold, 2 antidotes"
    }
  ],
  "readAloud": [
    {"title": "Entering the Tavern", "text": "Warm light spills from the windows...", "day": 1, "time": "evening", "linkedType": "place", "linkedTo": "The Rusty Anchor"},
    {"title": "Ambush!", "text": "Shadows move in the underbrush...", "day": 1, "time": "dusk", "linkedType": "encounter", "linkedTo": "Bandit Ambush"}
  ],
  "items": [
    {"name": "Aldrich's Diary", "description": "Contains notes about a secret meeting with the Baron. Mentions 'the shipment arrives at midnight' and password: 'Crimson Dawn'.", "day": 1, "time": "dusk", "plannedLocation": "Forest Road"},
    {"name": "Rusty Key", "description": "Opens the cellar door in the abandoned mill.", "day": 1, "time": "dusk", "plannedLocation": "Forest Road"}
  ]
}
---IMPORT_END---

Only include the categories that are relevant. The DM tool will parse this and let them choose what to import.
`;

    document.getElementById('ai-export-text').value = output;
    document.getElementById('ai-export-output').style.display = 'block';
}

function copyAIExport() {
    const text = document.getElementById('ai-export-text').value;
    navigator.clipboard.writeText(text).then(() => {
        showSaveIndicator('Copied to clipboard!');
    }).catch(err => {
        // Fallback for older browsers
        const textarea = document.getElementById('ai-export-text');
        textarea.select();
        document.execCommand('copy');
        showSaveIndicator('Copied to clipboard!');
    });
}

let parsedAIData = null;
let aiImportSelections = {}; // Track what user wants to import

function parseAIImport() {
    const text = document.getElementById('ai-import-text').value;

    // Try multiple methods to find JSON
    let jsonText = null;
    let parseMethod = '';

    // Method 1: Look for the import markers
    const startMarker = '---IMPORT_START---';
    const endMarker = '---IMPORT_END---';
    let startIndex = text.indexOf(startMarker);
    let endIndex = text.indexOf(endMarker);

    if (startIndex !== -1 && endIndex !== -1) {
        jsonText = text.substring(startIndex + startMarker.length, endIndex).trim();
        parseMethod = 'markers';
    }

    // Method 2: Try to find JSON code block ```json ... ```
    if (!jsonText) {
        const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonBlockMatch) {
            jsonText = jsonBlockMatch[1].trim();
            parseMethod = 'codeblock';
        }
    }

    // Method 3: Try to find raw JSON object { ... }
    if (!jsonText) {
        const jsonMatch = text.match(/\{[\s\S]*"(?:hook|npcs|places|encounters|readAloud|items)"[\s\S]*\}/);
        if (jsonMatch) {
            jsonText = jsonMatch[0];
            parseMethod = 'raw';
        }
    }

    if (!jsonText) {
        showSaveIndicator('Could not find import data. Ask the AI to "export in import format"', true);
        return;
    }

    // Make sure we start at the actual JSON object
    const jsonStartIndex = jsonText.indexOf('{');
    const jsonEndIndex = jsonText.lastIndexOf('}');
    if (jsonStartIndex !== -1 && jsonEndIndex !== -1 && jsonEndIndex > jsonStartIndex) {
        jsonText = jsonText.substring(jsonStartIndex, jsonEndIndex + 1);
    }

    // Clean up common JSON issues from AI
    jsonText = jsonText
        .replace(/,\s*}/g, '}')  // Remove trailing commas before }
        .replace(/,\s*]/g, ']')  // Remove trailing commas before ]
        .replace(/[\u201C\u201D]/g, '"')  // Replace smart quotes
        .replace(/[\u2018\u2019]/g, "'") // Replace smart apostrophes
        .replace(/[\u2013\u2014]/g, '-') // Replace en-dash and em-dash
        .replace(/[\u00A0]/g, ' ')       // Replace non-breaking space
        .replace(/\r\n/g, '\n')          // Normalize line endings
        .replace(/\r/g, '\n');           // Normalize line endings

    // Fix unescaped newlines within JSON strings (critical for multi-line text)
    // This regex finds strings and escapes any newlines inside them
    jsonText = jsonText.replace(/"([^"\\]|\\.)*"/g, (match) => {
        return match.replace(/\n/g, '\\n').replace(/\t/g, '\\t');
    });

    try {
        parsedAIData = JSON.parse(jsonText);
    } catch (e) {
        // First parse failed, try more aggressive cleanup
        console.log('First parse failed, trying aggressive cleanup...', e.message);
        console.log('JSON text (first 1000 chars):', jsonText.substring(0, 1000));

        try {
            // Method 2: Try without the string newline escaping (in case it broke something)
            // This regex finds content between quotes and escapes newlines within
            let cleanJson = jsonText.replace(/"([^"\\]*(?:\\.[^"\\]*)*)"/g, (match) => {
                return match
                    .replace(/\r\n/g, '\\n')
                    .replace(/\r/g, '\\n')
                    .replace(/\n/g, '\\n')
                    .replace(/\t/g, '\\t');
            });

            parsedAIData = JSON.parse(cleanJson);
            console.log('Parsed with string newline escaping');
        } catch (e2) {
            console.log('Second parse also failed, trying whitespace collapse...', e2.message);

            try {
                // Method 3: Replace all newlines with spaces, collapse whitespace
                let fixedJson = jsonText
                    .replace(/[\r\n]+/g, ' ')  // Replace newlines with spaces
                    .replace(/\t/g, ' ')       // Replace tabs with spaces
                    .replace(/\s+/g, ' ')      // Collapse whitespace
                    .trim();

                parsedAIData = JSON.parse(fixedJson);
                console.log('Parsed with whitespace collapse');
            } catch (e3) {
                console.log('Third parse also failed, trying line-by-line rebuild...', e3.message);

                try {
                    // Method 4: Fix unescaped quotes inside strings
                    // First collapse to single line
                    let fixedQuotesJson = jsonText
                        .replace(/[\r\n]+/g, ' ')
                        .replace(/\s+/g, ' ')
                        .trim();

                    // Replace unescaped quotes inside strings with escaped ones
                    // This is a simplified approach: replace " followed by text and : with \"
                    // Also handle quotes that appear after ': "' pattern inside text
                    fixedQuotesJson = fixedQuotesJson.replace(/: "(.*?)"/g, (match, content) => {
                        // Escape any unescaped quotes in the content (quotes not preceded by \)
                        const escapedContent = content.replace(/(?<!\\)"/g, '\\"');
                        return ': "' + escapedContent + '"';
                    });

                    parsedAIData = JSON.parse(fixedQuotesJson);
                    console.log('Parsed with quote escaping fix');
                } catch (e4) {
                    console.log('Fourth parse failed, trying line-by-line rebuild...', e4.message);

                    try {
                        // Method 5: Rebuild JSON line by line, handling each string properly
                        let rebuildJson = text.substring(text.indexOf('{'), text.lastIndexOf('}') + 1);

                        // Remove all newlines first, then clean
                        rebuildJson = rebuildJson
                            .split('\n')
                            .map(line => line.trim())
                            .join(' ')
                        .replace(/\s+/g, ' ')
                        .replace(/,\s*}/g, '}')
                        .replace(/,\s*]/g, ']')
                        .replace(/[\u201C\u201D]/g, '"')
                        .replace(/[\u2018\u2019]/g, "'")
                        .replace(/[\u2013\u2014]/g, '-')
                        .replace(/[\u00A0]/g, ' ');

                        parsedAIData = JSON.parse(rebuildJson);
                        console.log('Parsed with line-by-line rebuild');
                    } catch (e5) {
                        // Still failed, show detailed error
                        console.error('All parse attempts failed');
                        console.error('Original error:', e.message);
                        console.error('Full JSON text:', jsonText);

                        // Try to find the error position
                        let errorInfo = '';
                        const posMatch = e.message.match(/position\s*(\d+)/i) || e.message.match(/column\s*(\d+)/i);
                        if (posMatch) {
                            const pos = parseInt(posMatch[1]);
                            const start = Math.max(0, pos - 50);
                            const end = Math.min(jsonText.length, pos + 50);
                            const before = jsonText.substring(start, pos);
                            const after = jsonText.substring(pos, end);
                            errorInfo = `\n\nError near position ${pos}:\n...${before}>>>HERE>>>${after}...`;
                        }

                        showSaveIndicator(`JSON parse error. Check console (F12).`, true);
                        alert(`Could not parse AI response.\n\nError: ${e.message}${errorInfo}\n\nTip: Copy the JSON from AI again, or ask AI to "reformat the JSON export"`);
                        return;
                    }
                }
            }
        }
    }

    console.log(`AI Import: Parsed using ${parseMethod} method`);

    // Reset selections
    aiImportSelections = {};

    // Build preview with checkboxes and validation
    const previewContainer = document.getElementById('ai-import-items');
    previewContainer.innerHTML = '';

    let itemCount = 0;
    let warnings = [];

    // Validate weapons and armor against game data
    function validateWeapon(weaponName) {
        if (!weaponName) return { valid: true };
        // Check if WEAPONS_DATA exists (may not be loaded in DM session)
        if (typeof WEAPONS_DATA !== 'undefined') {
            const found = Object.keys(WEAPONS_DATA).some(w =>
                w.toLowerCase() === weaponName.toLowerCase()
            );
            if (!found) return { valid: false, warning: `Unknown weapon: "${weaponName}"` };
        }
        return { valid: true };
    }

    function validateArmor(armorName) {
        if (!armorName) return { valid: true };
        // Check if ARMOR_DATA exists
        if (typeof ARMOR_DATA !== 'undefined') {
            const found = Object.keys(ARMOR_DATA).some(a =>
                a.toLowerCase() === armorName.toLowerCase()
            );
            if (!found) return { valid: false, warning: `Unknown armor: "${armorName}"` };
        }
        return { valid: true };
    }

    // Hook
    if (parsedAIData.hook) {
        aiImportSelections['hook'] = true;
        previewContainer.innerHTML += `
            <div class="ai-import-item">
                <div class="ai-import-item-header">
                    <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                        <input type="checkbox" checked onchange="aiImportSelections['hook'] = this.checked">
                        <span class="ai-import-item-type">Hook</span>
                    </label>
                </div>
                <div class="ai-import-item-details">${escapeHtml(parsedAIData.hook)}</div>
            </div>`;
        itemCount++;
    }

    // Helper to create day/time/place badges
    const dayBadge = (day) => day ? `<span style="background: var(--accent-blue-20, rgba(59,130,246,0.2)); color: var(--accent-blue, #3b82f6); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-left: 8px;">Day ${day}</span>` : '';
    const timeBadge = (time) => time && TIME_LABELS[time] ? `<span style="background: var(--accent-purple-20, rgba(168,85,247,0.2)); color: var(--accent-purple, #a855f7); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-left: 4px;">${TIME_LABELS[time]}</span>` : '';
    const placeBadge = (place) => place ? `<span style="background: var(--accent-green-20, rgba(34,197,94,0.2)); color: var(--accent-green, #22c55e); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-left: 4px;">@ ${escapeHtml(place)}</span>` : '';

    // NPCs
    if (parsedAIData.npcs && parsedAIData.npcs.length > 0) {
        parsedAIData.npcs.forEach((npc, i) => {
            aiImportSelections[`npc_${i}`] = true;
            previewContainer.innerHTML += `
                <div class="ai-import-item">
                    <div class="ai-import-item-header">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; flex-wrap: wrap;">
                            <input type="checkbox" checked onchange="aiImportSelections['npc_${i}'] = this.checked">
                            <span class="ai-import-item-type">NPC</span>
                            <span class="ai-import-item-name">${escapeHtml(npc.name || '')}</span>
                            ${dayBadge(npc.day)}${timeBadge(npc.time)}${placeBadge(npc.plannedLocation)}
                        </label>
                    </div>
                    <div class="ai-import-item-details">${escapeHtml(npc.role || '')} - ${escapeHtml(npc.description || '')}</div>
                </div>`;
            itemCount++;
        });
    }

    // Places
    if (parsedAIData.places && parsedAIData.places.length > 0) {
        parsedAIData.places.forEach((place, i) => {
            aiImportSelections[`place_${i}`] = true;
            previewContainer.innerHTML += `
                <div class="ai-import-item">
                    <div class="ai-import-item-header">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; flex-wrap: wrap;">
                            <input type="checkbox" checked onchange="aiImportSelections['place_${i}'] = this.checked">
                            <span class="ai-import-item-type">Place</span>
                            <span class="ai-import-item-name">${escapeHtml(place.name || '')}</span>
                            ${dayBadge(place.day)}${timeBadge(place.time)}
                        </label>
                    </div>
                    <div class="ai-import-item-details">${escapeHtml(place.description || '')}</div>
                </div>`;
            itemCount++;
        });
    }

    // Encounters with validation
    if (parsedAIData.encounters && parsedAIData.encounters.length > 0) {
        parsedAIData.encounters.forEach((enc, i) => {
            aiImportSelections[`encounter_${i}`] = true;
            const participants = enc.enemies || [];
            const enemyCount = participants.filter(e => e.disposition !== 'neutral').length;
            const neutralCount = participants.filter(e => e.disposition === 'neutral').length;

            // Validate enemies' weapons and armor
            let encWarnings = [];
            if (enc.enemies) {
                enc.enemies.forEach(enemy => {
                    const weaponCheck = validateWeapon(enemy.weapon);
                    const armorCheck = validateArmor(enemy.armor);
                    if (!weaponCheck.valid) encWarnings.push(weaponCheck.warning);
                    if (!armorCheck.valid) encWarnings.push(armorCheck.warning);
                });
            }

            const warningHtml = encWarnings.length > 0
                ? `<div style="color: #f59e0b; font-size: 0.75rem; margin-top: 4px;">⚠️ ${encWarnings.join(', ')}</div>`
                : '';

            if (encWarnings.length > 0) warnings.push(...encWarnings);

            // Build participant summary
            let participantSummary = '';
            if (enemyCount > 0 || neutralCount > 0) {
                const parts = [];
                if (enemyCount > 0) parts.push(`${enemyCount} enemy`);
                if (neutralCount > 0) parts.push(`${neutralCount} neutral`);
                participantSummary = parts.join(', ');
            }

            // List participant names and roles
            const participantList = participants.map(p => {
                const icon = p.disposition === 'neutral' ? '😐' : '⚔️';
                return `${icon} ${escapeHtml(p.name || 'Unknown')}${p.role ? ' (' + escapeHtml(p.role) + ')' : ''}`;
            }).join(', ');

            previewContainer.innerHTML += `
                <div class="ai-import-item">
                    <div class="ai-import-item-header">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; flex-wrap: wrap;">
                            <input type="checkbox" checked onchange="aiImportSelections['encounter_${i}'] = this.checked">
                            <span class="ai-import-item-type">Encounter</span>
                            <span class="ai-import-item-name">${escapeHtml(enc.name || '')}</span>
                            ${dayBadge(enc.day)}${timeBadge(enc.time)}${placeBadge(enc.location)}
                        </label>
                    </div>
                    <div class="ai-import-item-details">
                        ${participantSummary ? `<div style="margin-bottom: 4px;">${participantSummary}</div>` : ''}
                        ${participantList ? `<div style="font-size: 0.8rem; color: var(--text-muted);">${participantList}</div>` : ''}
                        ${warningHtml}
                    </div>
                </div>`;
            itemCount++;
        });
    }

    // Read-Aloud
    if (parsedAIData.readAloud && parsedAIData.readAloud.length > 0) {
        parsedAIData.readAloud.forEach((ra, i) => {
            aiImportSelections[`readAloud_${i}`] = true;
            // Support both old (place) and new (linkedType/linkedTo) formats
            const linkedType = ra.linkedType || (ra.place ? 'place' : null);
            const linkedTo = ra.linkedTo || ra.place || '';
            const linkedBadge = linkedType && linkedTo ? `<span style="background: var(--accent-cyan-20, rgba(0,188,212,0.2)); color: var(--accent-cyan, #00bcd4); padding: 2px 6px; border-radius: 4px; font-size: 0.7rem; margin-left: 4px;">${linkedType === 'place' ? '📍' : linkedType === 'encounter' ? '⚔️' : '👤'} ${escapeHtml(linkedTo)}</span>` : '';
            previewContainer.innerHTML += `
                <div class="ai-import-item">
                    <div class="ai-import-item-header">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; flex-wrap: wrap;">
                            <input type="checkbox" checked onchange="aiImportSelections['readAloud_${i}'] = this.checked">
                            <span class="ai-import-item-type">Read-Aloud</span>
                            <span class="ai-import-item-name">${escapeHtml(ra.title || '')}</span>
                            ${dayBadge(ra.day)}${timeBadge(ra.time)}${linkedBadge}
                        </label>
                    </div>
                    <div class="ai-import-item-details">${escapeHtml(ra.text ? ra.text.substring(0, 100) + '...' : '')}</div>
                </div>`;
            itemCount++;
        });
    }

    // Items
    if (parsedAIData.items && parsedAIData.items.length > 0) {
        parsedAIData.items.forEach((item, i) => {
            aiImportSelections[`item_${i}`] = true;
            previewContainer.innerHTML += `
                <div class="ai-import-item">
                    <div class="ai-import-item-header">
                        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; flex-wrap: wrap;">
                            <input type="checkbox" checked onchange="aiImportSelections['item_${i}'] = this.checked">
                            <span class="ai-import-item-type">Item</span>
                            <span class="ai-import-item-name">${escapeHtml(item.name || '')}</span>
                            ${dayBadge(item.day)}${timeBadge(item.time)}${placeBadge(item.plannedLocation)}
                        </label>
                    </div>
                    <div class="ai-import-item-details">${escapeHtml(item.description || '')}</div>
                </div>`;
            itemCount++;
        });
    }

    if (itemCount === 0) {
        previewContainer.innerHTML = '<p style="color: var(--text-secondary);">No importable items found in the response.</p>';
    } else {
        // Add select all/none buttons
        previewContainer.innerHTML = `
            <div style="display: flex; gap: 8px; margin-bottom: 12px;">
                <button onclick="toggleAllAIImports(true)" style="padding: 4px 12px; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 4px; color: var(--text-secondary); cursor: pointer; font-size: 0.8rem;">Select All</button>
                <button onclick="toggleAllAIImports(false)" style="padding: 4px 12px; background: var(--bg-elevated); border: 1px solid var(--border-default); border-radius: 4px; color: var(--text-secondary); cursor: pointer; font-size: 0.8rem;">Select None</button>
            </div>
        ` + previewContainer.innerHTML;

        // Add warning summary if any
        if (warnings.length > 0) {
            previewContainer.innerHTML += `
                <div style="margin-top: 12px; padding: 10px; background: rgba(245, 158, 11, 0.15); border: 1px solid rgba(245, 158, 11, 0.4); border-radius: 6px;">
                    <div style="color: #f59e0b; font-size: 0.85rem; font-weight: 600;">⚠️ ${warnings.length} validation warning(s)</div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 4px;">Some weapons/armor may not exist in game data. They will still be imported but may need manual adjustment.</div>
                </div>`;
        }
    }

    document.getElementById('ai-import-preview').style.display = 'block';
}

function toggleAllAIImports(checked) {
    for (let key in aiImportSelections) {
        aiImportSelections[key] = checked;
    }
    // Update checkboxes
    document.querySelectorAll('#ai-import-items input[type="checkbox"]').forEach(cb => {
        cb.checked = checked;
    });
}

function importSelectedAIItems() {
    if (!parsedAIData) {
        console.log('No parsed AI data');
        return;
    }

    let importedCount = 0;
    let skippedCount = 0;

    try {
        // Import hook if selected
        if (parsedAIData.hook && aiImportSelections['hook']) {
            sessionData.hook = parsedAIData.hook;
            const hookEl = document.getElementById('session_hook');
            if (hookEl) hookEl.value = parsedAIData.hook;
            importedCount++;
            console.log('Imported hook');
        } else if (parsedAIData.hook) {
            skippedCount++;
        }

        // Import NPCs - only selected ones, ADD to existing (don't replace)
        if (parsedAIData.npcs && parsedAIData.npcs.length > 0) {
            if (!sessionData.npcs) sessionData.npcs = [];
            parsedAIData.npcs.forEach((npc, i) => {
                if (aiImportSelections[`npc_${i}`]) {
                    sessionData.npcs.push({
                        name: npc.name || '',
                        role: npc.role || '',
                        plannedLocation: npc.plannedLocation || '',
                        actualLocation: '',
                        disposition: npc.disposition || 'neutral',
                        description: npc.description || '',
                        status: 'unused',
                        day: npc.day || null,
                        time: npc.time || null,
                        notes: ''
                    });
                    importedCount++;
                } else {
                    skippedCount++;
                }
            });
            if (typeof renderNPCsList === 'function') renderNPCsList();
            if (typeof renderPlayNPCsList === 'function') renderPlayNPCsList();
        }

        // Import places - ADD to existing
        if (parsedAIData.places && parsedAIData.places.length > 0) {
            if (!sessionData.places) sessionData.places = [];
            parsedAIData.places.forEach((place, i) => {
                if (aiImportSelections[`place_${i}`]) {
                    sessionData.places.push({
                        name: place.name || '',
                        description: place.description || '',
                        visited: false,
                        day: place.day || null,
                        time: place.time || null,
                        notes: ''
                    });
                    importedCount++;
                } else {
                    skippedCount++;
                }
            });
            if (typeof renderPlacesList === 'function') renderPlacesList();
            if (typeof renderPlayPlacesList === 'function') renderPlayPlacesList();
        }

        // Import encounters - ADD to existing
        if (parsedAIData.encounters && parsedAIData.encounters.length > 0) {
            if (!sessionData.encounters) sessionData.encounters = [];
            parsedAIData.encounters.forEach((enc, i) => {
                if (aiImportSelections[`encounter_${i}`]) {
                    // Ensure each enemy has proper defaults for disposition, role, and maxHp
                    const enemies = (enc.enemies || []).map(e => ({
                        name: e.name || '',
                        disposition: e.disposition || 'enemy',
                        role: e.role || '',
                        hp: e.hp || '',
                        maxHp: e.maxHp || e.hp || '',
                        armor: e.armor || '',
                        weapon: e.weapon || '',
                        atkBonus: e.atkBonus || '',
                        dmg: e.dmg || ''
                    }));
                    sessionData.encounters.push({
                        name: enc.name || '',
                        location: enc.location || '',
                        enemies: enemies,
                        tactics: enc.tactics || '',
                        loot: enc.loot || '',
                        status: 'planned',
                        day: enc.day || null,
                        time: enc.time || null,
                        notes: ''
                    });
                    importedCount++;
                } else {
                    skippedCount++;
                }
            });
            if (typeof renderEncountersList === 'function') renderEncountersList();
            if (typeof renderPlayEncountersList === 'function') renderPlayEncountersList();
        }

        // Import read-aloud - ADD to existing
        if (parsedAIData.readAloud && parsedAIData.readAloud.length > 0) {
            if (!sessionData.readAloud) sessionData.readAloud = [];
            parsedAIData.readAloud.forEach((ra, i) => {
                if (aiImportSelections[`readAloud_${i}`]) {
                    // Support both old (place) and new (linkedType/linkedTo) formats
                    const linkedType = ra.linkedType || (ra.place ? 'place' : null);
                    const linkedTo = ra.linkedTo || ra.place || '';
                    sessionData.readAloud.push({
                        title: ra.title || '',
                        text: ra.text || '',
                        read: false,
                        day: ra.day || null,
                        time: ra.time || null,
                        linkedType: linkedType,
                        linkedTo: linkedTo
                    });
                    importedCount++;
                } else {
                    skippedCount++;
                }
            });
            if (typeof renderReadAloudList === 'function') renderReadAloudList();
            if (typeof renderPlayReadAloudList === 'function') renderPlayReadAloudList();
        }

        // Import items - ADD to existing
        if (parsedAIData.items && parsedAIData.items.length > 0) {
            if (!sessionData.items) sessionData.items = [];
            parsedAIData.items.forEach((item, i) => {
                if (aiImportSelections[`item_${i}`]) {
                    sessionData.items.push({
                        name: item.name || '',
                        description: item.description || '',
                        plannedLocation: item.plannedLocation || '',
                        actualLocation: '',
                        found: false,
                        givenTo: '',
                        day: item.day || null,
                        time: item.time || null,
                        notes: ''
                    });
                    importedCount++;
                } else {
                    skippedCount++;
                }
            });
            if (typeof renderItemsList === 'function') renderItemsList();
            if (typeof renderPlayItemsList === 'function') renderPlayItemsList();
        }

        // Render the new day-based views
        if (typeof renderPlanningByDay === 'function') renderPlanningByDay();
        if (typeof renderDayTimeline === 'function') renderDayTimeline();

        triggerAutoSave();
        const msg = skippedCount > 0
            ? `Imported ${importedCount} items (${skippedCount} skipped)`
            : `Imported ${importedCount} items!`;
        showSaveIndicator(msg);
        console.log(`Imported: ${importedCount}, Skipped: ${skippedCount}`);

    } catch (error) {
        console.error('Import error:', error);
        showSaveIndicator('Import error: ' + error.message, true);
    }

    // Always close modal
    hideAIModal();
}

// Keep old function name for backwards compatibility
function importAllAIItems() {
    importSelectedAIItems();
}

// ============================================
// Share Campaign Functions
// ============================================

let shareCampaignId = null;

function shareCampaignFromDashboard(campaignId) {
    closeCampaignMenus();
    shareCampaignId = campaignId;
    showShareModal(campaignId);
}

async function showShareModal(campaignId) {
    const modal = document.getElementById('share-modal');
    modal.style.display = 'flex';

    // Find the campaign
    const campaign = allCampaigns.find(c => c.id === campaignId);
    if (!campaign) return;

    const codeSection = document.getElementById('share-code-section');
    const generateSection = document.getElementById('share-generate-section');
    const playersSection = document.getElementById('share-players-section');
    const revokeSection = document.getElementById('share-revoke-section');

    // Show appropriate sections based on whether share code exists
    if (campaign.share_code) {
        document.getElementById('share-code-display').value = campaign.share_code;
        codeSection.style.display = 'block';
        generateSection.style.display = 'none';
        playersSection.style.display = 'block';
        revokeSection.style.display = 'block';

        // Load players
        await loadCampaignPlayers(campaignId);
    } else {
        codeSection.style.display = 'none';
        generateSection.style.display = 'block';
        playersSection.style.display = 'none';
        revokeSection.style.display = 'none';
    }
}

function hideShareModal() {
    document.getElementById('share-modal').style.display = 'none';
    shareCampaignId = null;
}

async function generateShareCode() {
    if (!shareCampaignId) return;

    try {
        const res = await fetch(`/api/campaigns/${shareCampaignId}/share`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (res.ok) {
            const data = await res.json();

            // Update the campaign in our local data
            const campaign = allCampaigns.find(c => c.id === shareCampaignId);
            if (campaign) {
                campaign.share_code = data.share_code;
            }

            // Update the modal display
            document.getElementById('share-code-display').value = data.share_code;
            document.getElementById('share-code-section').style.display = 'block';
            document.getElementById('share-generate-section').style.display = 'none';
            document.getElementById('share-players-section').style.display = 'block';
            document.getElementById('share-revoke-section').style.display = 'block';

            // Load players (empty initially)
            await loadCampaignPlayers(shareCampaignId);

            showSaveIndicator('Share code generated!');
        } else {
            const error = await res.json();
            alert('Failed to generate share code: ' + error.error);
        }
    } catch (error) {
        console.error('Error generating share code:', error);
        alert('Failed to generate share code');
    }
}

function copyShareCode() {
    const codeInput = document.getElementById('share-code-display');
    codeInput.select();
    document.execCommand('copy');

    showSaveIndicator('Code copied!');
}

async function revokeShareCode() {
    if (!shareCampaignId) return;

    if (!confirm('This will remove all players and generate a new code when sharing is enabled again. Continue?')) {
        return;
    }

    try {
        const res = await fetch(`/api/campaigns/${shareCampaignId}/share`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (res.ok) {
            // Update the campaign in our local data
            const campaign = allCampaigns.find(c => c.id === shareCampaignId);
            if (campaign) {
                campaign.share_code = null;
            }

            // Update the modal display
            document.getElementById('share-code-section').style.display = 'none';
            document.getElementById('share-generate-section').style.display = 'block';
            document.getElementById('share-players-section').style.display = 'none';
            document.getElementById('share-revoke-section').style.display = 'none';

            showSaveIndicator('Access revoked');
        } else {
            const error = await res.json();
            alert('Failed to revoke access: ' + error.error);
        }
    } catch (error) {
        console.error('Error revoking share code:', error);
        alert('Failed to revoke access');
    }
}

async function loadCampaignPlayers(campaignId) {
    try {
        const res = await fetch(`/api/campaigns/${campaignId}/players`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (res.ok) {
            const data = await res.json();
            renderSharePlayersList(data.players || []);
        } else {
            renderSharePlayersList([]);
        }
    } catch (error) {
        console.error('Error loading players:', error);
        renderSharePlayersList([]);
    }
}

function renderSharePlayersList(players) {
    const container = document.getElementById('share-players-list');
    const countEl = document.getElementById('share-player-count');

    if (!container || !countEl || !players) {
        return;
    }

    countEl.textContent = `${players.length} player${players.length !== 1 ? 's' : ''}`;

    if (players.length === 0) {
        container.innerHTML = `<p style="color: var(--text-muted); text-align: center; padding: var(--space-2);">No players have joined yet</p>`;
        return;
    }

    container.innerHTML = players.map(player => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-2); border-bottom: 1px solid var(--border-subtle);">
            <div>
                <span style="color: var(--text-primary);">${escapeHtml(player.username)}</span>
                <span style="color: var(--text-muted); font-size: 0.8rem; margin-left: var(--space-2);">
                    joined ${formatDate(player.joined_at)}
                </span>
            </div>
            <button onclick="removeCampaignPlayer(${player.id})" style="background: transparent; color: var(--accent-red); padding: 4px 8px; font-size: 0.8rem;">
                Remove
            </button>
        </div>
    `).join('');
}

async function removeCampaignPlayer(playerId) {
    if (!shareCampaignId) return;

    if (!confirm('Remove this player from the campaign?')) {
        return;
    }

    try {
        const res = await fetch(`/api/campaigns/${shareCampaignId}/players/${playerId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (res.ok) {
            await loadCampaignPlayers(shareCampaignId);
            showSaveIndicator('Player removed');
        } else {
            const error = await res.json();
            alert('Failed to remove player: ' + error.error);
        }
    } catch (error) {
        console.error('Error removing player:', error);
        alert('Failed to remove player');
    }
}

// ============================================
// Join Campaign Functions (Player)
// ============================================

function showJoinCampaignModal() {
    document.getElementById('join-modal').style.display = 'flex';
    document.getElementById('join-code-input').value = '';
    document.getElementById('join-error').textContent = '';
    document.getElementById('join-code-input').focus();
}

function hideJoinModal() {
    document.getElementById('join-modal').style.display = 'none';
}

// ============================================
// HELP MODAL
// ============================================

function showHelpModal() {
    document.getElementById('help-modal').style.display = 'flex';
    showHelpSection('getting-started');
}

function hideHelpModal() {
    document.getElementById('help-modal').style.display = 'none';
}

function showHelpSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.help-section').forEach(section => {
        section.style.display = 'none';
    });

    // Remove active from all nav buttons
    document.querySelectorAll('.help-nav-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // Show selected section
    const section = document.getElementById(`help-${sectionId}`);
    if (section) {
        section.style.display = 'block';
    }

    // Mark clicked button as active (find by matching onclick attribute)
    const buttons = document.querySelectorAll('.help-nav-btn');
    buttons.forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick && onclick.includes(`'${sectionId}'`)) {
            btn.classList.add('active');
        }
    });
}

// Close help modal with Escape key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const helpModal = document.getElementById('help-modal');
        if (helpModal && helpModal.style.display === 'flex') {
            hideHelpModal();
        }
    }
});

async function joinCampaign() {
    const code = document.getElementById('join-code-input').value.trim().toUpperCase();
    const errorEl = document.getElementById('join-error');

    if (!code) {
        errorEl.textContent = 'Please enter a share code';
        return;
    }

    try {
        const res = await fetch('/api/campaigns/join', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ share_code: code })
        });

        const data = await res.json();

        if (res.ok) {
            hideJoinModal();
            showSaveIndicator('Joined campaign!');
            // Reload to show the joined campaign
            await loadCampaignsAndShowDashboard();
        } else {
            errorEl.textContent = data.error || 'Failed to join campaign';
        }
    } catch (error) {
        console.error('Error joining campaign:', error);
        errorEl.textContent = 'Failed to join campaign';
    }
}

async function leaveCampaign(campaignId, event) {
    event.stopPropagation();

    if (!confirm('Leave this campaign? You will no longer see session summaries.')) {
        return;
    }

    try {
        const res = await fetch(`/api/campaigns/${campaignId}/leave`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        if (res.ok) {
            showSaveIndicator('Left campaign');
            // Remove from local list and re-render
            joinedCampaigns = joinedCampaigns.filter(c => c.id !== campaignId);
            renderJoinedCampaigns();
        } else {
            const error = await res.json();
            alert('Failed to leave campaign: ' + error.error);
        }
    } catch (error) {
        console.error('Error leaving campaign:', error);
        alert('Failed to leave campaign');
    }
}

// ============================================
// Player Campaign View
// ============================================

let playerCampaignData = null;
let playerRefreshInterval = null;

async function openPlayerCampaignView(campaignId) {
    playerCampaignId = campaignId;
    viewingAsPlayer = true;

    // Hide dashboard, show player view
    document.getElementById('dashboard').style.display = 'none';
    document.getElementById('player-view').style.display = 'block';

    // Hide DM sidebar (players shouldn't see NPCs, encounters, etc.)
    const sidebar = document.getElementById('dm-desktop-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarBackdrop = document.getElementById('sidebar-backdrop');
    if (sidebar) sidebar.style.display = 'none';
    if (sidebarToggle) sidebarToggle.style.display = 'none';
    if (sidebarBackdrop) sidebarBackdrop.style.display = 'none';

    // Load the campaign data
    await loadPlayerCampaignData(campaignId);

    // Start auto-refresh for live updates (every 10 seconds)
    if (playerRefreshInterval) clearInterval(playerRefreshInterval);
    playerRefreshInterval = setInterval(() => {
        loadPlayerCampaignData(campaignId);
    }, 10000);

    // Save view state for page refresh persistence
    saveViewState();
}

function closePlayerView() {
    viewingAsPlayer = false;
    playerCampaignId = null;
    playerCampaignData = null;

    // Stop auto-refresh
    if (playerRefreshInterval) {
        clearInterval(playerRefreshInterval);
        playerRefreshInterval = null;
    }

    // Show dashboard, hide player view
    document.getElementById('player-view').style.display = 'none';
    document.getElementById('dashboard').style.display = 'block';

    // Restore sidebar toggle visibility (sidebar itself stays hidden until session is loaded)
    const sidebarToggle = document.getElementById('sidebar-toggle');
    if (sidebarToggle) sidebarToggle.style.display = '';

    // Clear saved view state (user explicitly went back)
    clearViewState();
}

async function loadPlayerCampaignData(campaignId) {
    try {
        // Fetch campaign data and players in parallel
        const [campaignRes, playersRes] = await Promise.all([
            fetch(`/api/player/campaigns/${campaignId}`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }),
            fetch(`/api/campaigns/${campaignId}/players`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            })
        ]);

        if (campaignRes.ok) {
            playerCampaignData = await campaignRes.json();

            // Add players data if available
            if (playersRes.ok) {
                const playersData = await playersRes.json();
                playerCampaignData.partyMembers = playersData.players || [];
            }

            renderPlayerCampaignView();
        } else {
            const error = await campaignRes.json();
            alert('Failed to load campaign: ' + error.error);
            closePlayerView();
        }
    } catch (error) {
        console.error('Error loading player campaign:', error);
    }
}

// Track which session is selected for summary display
let selectedPlayerSessionId = null;

function renderPlayerCampaignView() {
    if (!playerCampaignData) return;

    const campaign = playerCampaignData.campaign;
    const lockedSessions = playerCampaignData.locked_sessions || [];
    const latestSession = playerCampaignData.latest_session;

    // Combine sessions for display - locked ones + latest (if exists and not already in locked)
    let allSessions = [...lockedSessions];
    if (latestSession && latestSession.status !== 'locked') {
        allSessions.push(latestSession);
    }
    // Sort by session number
    allSessions.sort((a, b) => a.session_number - b.session_number);

    // Auto-select latest session if none selected
    if (!selectedPlayerSessionId && latestSession) {
        selectedPlayerSessionId = latestSession.id;
    }

    // Update header
    document.getElementById('player-view-title').textContent = campaign.name;
    document.getElementById('player-view-dm').textContent = campaign.dm_name;

    // Render party members
    const partyList = document.getElementById('player-party-list');
    const partyMembers = playerCampaignData.partyMembers || [];

    if (partyMembers.length === 0) {
        partyList.innerHTML = `
            <div style="background: var(--bg-elevated); border-radius: 8px; padding: var(--space-4); text-align: center; color: var(--text-muted);">
                No other players yet
            </div>
        `;
    } else {
        partyList.innerHTML = partyMembers.map(member => {
            const char = member.character;
            const hasCharacter = char && char.name;

            return `
                <div style="background: var(--bg-elevated); border-radius: 8px; padding: var(--space-3); margin-bottom: var(--space-2); display: flex; align-items: center; gap: var(--space-3);">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--accent-green), var(--accent-cyan)); display: flex; align-items: center; justify-content: center; font-weight: 600; color: #000; font-size: 1.1rem;">
                        ${escapeHtml((member.username || '?')[0].toUpperCase())}
                    </div>
                    <div style="flex: 1;">
                        <div style="color: var(--text-primary); font-weight: 600;">${escapeHtml(member.username)}</div>
                        ${hasCharacter ? `
                            <div style="color: var(--accent-gold); font-size: 0.9rem;">${escapeHtml(char.name)}</div>
                            <div style="color: var(--text-muted); font-size: 0.8rem;">
                                ${char.race ? escapeHtml(char.race) : ''}${char.race && char.class ? ' • ' : ''}${char.class ? escapeHtml(char.class) : ''}${(char.race || char.class) && char.religion ? ' • ' : ''}${char.religion ? escapeHtml(char.religion) : ''}
                            </div>
                        ` : `
                            <div style="color: var(--text-muted); font-size: 0.85rem; font-style: italic;">No character linked yet</div>
                        `}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Render sessions list
    const sessionsList = document.getElementById('player-sessions-list');

    if (allSessions.length === 0) {
        sessionsList.innerHTML = `
            <div style="background: var(--bg-elevated); border-radius: 8px; padding: var(--space-4); text-align: center; color: var(--text-muted);">
                No sessions yet
            </div>
        `;
    } else {
        sessionsList.innerHTML = allSessions.map(session => {
            const isLocked = session.status === 'locked';
            const isLatest = latestSession && session.id === latestSession.id;
            const isSelected = session.id === selectedPlayerSessionId;
            const summary = session.summary;

            // Count stats from summary
            const npcCount = summary?.npcs?.length || 0;
            const placeCount = summary?.places?.length || 0;
            const encounterCount = summary?.encounters?.length || 0;
            const itemCount = summary?.items?.length || 0;

            return `
                <div onclick="selectPlayerSession(${session.id})" style="background: var(--bg-elevated); border-radius: 8px; padding: var(--space-3); margin-bottom: var(--space-2); cursor: pointer; border: 2px solid ${isSelected ? 'var(--accent-gold)' : 'transparent'}; ${isLatest && !isSelected ? 'border-left: 3px solid var(--accent-green);' : ''} transition: border-color 0.2s;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: var(--space-2);">
                        <div>
                            <span style="color: var(--text-primary); font-weight: 600; font-size: 1.1rem;">Session #${session.session_number}</span>
                            ${isLatest && !isLocked ? '<span style="background: var(--accent-green); color: #000; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; margin-left: 8px;">LIVE</span>' : ''}
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px;">
                            ${isLocked ?
                                `<span style="color: var(--text-muted); font-size: 0.75rem; display: flex; align-items: center; gap: 4px;">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                    Completed
                                </span>` :
                                `<span style="color: var(--accent-green); font-size: 0.75rem; display: flex; align-items: center; gap: 4px;">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                                    In Progress
                                </span>`
                            }
                        </div>
                    </div>
                    <div style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: var(--space-2);">
                        📅 ${formatDate(session.date)}${session.location ? ` • 📍 ${escapeHtml(session.location)}` : ''}
                    </div>
                    ${isLocked && summary?.hook ? `<div style="color: var(--accent-gold); font-size: 0.85rem; margin-bottom: var(--space-2); font-style: italic;">"${escapeHtml(summary.hook.substring(0, 100))}${summary.hook.length > 100 ? '...' : ''}"</div>` : ''}
                    <div style="display: flex; gap: var(--space-3); font-size: 0.8rem; color: var(--text-subdued);">
                        ${npcCount > 0 ? `<span>👤 ${npcCount} NPCs</span>` : ''}
                        ${placeCount > 0 ? `<span>🗺️ ${placeCount} places</span>` : ''}
                        ${encounterCount > 0 ? `<span>⚔️ ${encounterCount} encounters</span>` : ''}
                        ${itemCount > 0 ? `<span>💎 ${itemCount} items</span>` : ''}
                        ${npcCount === 0 && placeCount === 0 && encounterCount === 0 && itemCount === 0 ? '<span>No activity yet</span>' : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    // Find the selected session
    const selectedSession = allSessions.find(s => s.id === selectedPlayerSessionId) || latestSession;

    // Render selected session's summary
    const summaryContainer = document.getElementById('player-summary-content');

    if (!selectedSession || !selectedSession.summary) {
        summaryContainer.innerHTML = `
            <p style="color: var(--text-muted); text-align: center;">No summary available yet</p>
        `;
    } else {
        const summary = selectedSession.summary;
        let summaryHtml = '';

        // Session header
        summaryHtml += `
            <div style="margin-bottom: var(--space-4); padding-bottom: var(--space-3); border-bottom: 1px solid var(--border-subtle);">
                <h4 style="color: var(--accent-gold); margin: 0;">Session #${selectedSession.session_number}</h4>
                <div style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">
                    ${formatDate(selectedSession.date)}${selectedSession.location ? ` @ ${escapeHtml(selectedSession.location)}` : ''}
                </div>
                ${selectedSession.status === 'locked' && summary.hook ? `<div style="color: var(--text-secondary); font-size: 0.9rem; margin-top: var(--space-2); font-style: italic;">"${escapeHtml(summary.hook)}"</div>` : ''}
            </div>
        `;

        // Prolog (if exists)
        if (summary.prolog && summary.prolog.trim()) {
            summaryHtml += `
                <div style="margin-bottom: var(--space-4); background: linear-gradient(135deg, rgba(59, 158, 255, 0.1) 0%, rgba(99, 102, 241, 0.15) 100%); border-left: 4px solid var(--primary-blue); border-radius: var(--radius-md); padding: var(--space-4);">
                    <h5 style="color: var(--primary-blue); margin: 0 0 var(--space-2) 0; font-size: 0.9rem; display: flex; align-items: center; gap: 6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
                        Session Prologue
                    </h5>
                    <p style="margin: 0; color: var(--text-base); font-style: italic; white-space: pre-wrap; line-height: 1.6;">${escapeHtml(summary.prolog)}</p>
                </div>
            `;
        }

        // NPCs Met
        if (summary.npcs && summary.npcs.length > 0) {
            summaryHtml += `
                <div style="margin-bottom: var(--space-4);">
                    <h5 style="color: var(--primary-purple); margin: 0 0 var(--space-2) 0; font-size: 0.9rem;">👤 NPCs Met (${summary.npcs.length})</h5>
                    <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                        ${summary.npcs.map(npc => `
                            <div style="background: var(--bg-surface); border-radius: var(--radius-sm); padding: var(--space-2); border-left: 3px solid var(--primary-purple);">
                                <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(npc.name)}</div>
                                ${npc.role || npc.disposition ? `<div style="font-size: 0.8rem; color: var(--accent-gold);">${escapeHtml(npc.role || '')}${npc.role && npc.disposition ? ' • ' : ''}${escapeHtml(npc.disposition || '')}</div>` : ''}
                                ${npc.description ? `<div style="font-size: 0.85rem; color: var(--text-subdued); margin-top: 4px;">${escapeHtml(npc.description)}</div>` : ''}
                                ${npc.actualLocation ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">📍 ${escapeHtml(npc.actualLocation)}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Places Visited
        if (summary.places && summary.places.length > 0) {
            summaryHtml += `
                <div style="margin-bottom: var(--space-4);">
                    <h5 style="color: var(--accent-cyan); margin: 0 0 var(--space-2) 0; font-size: 0.9rem;">🗺️ Places Visited (${summary.places.length})</h5>
                    <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                        ${summary.places.map(place => `
                            <div style="background: var(--bg-surface); border-radius: var(--radius-sm); padding: var(--space-2); border-left: 3px solid var(--accent-cyan);">
                                <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(place.name)}</div>
                                ${place.description ? `<div style="font-size: 0.85rem; color: var(--text-subdued); margin-top: 4px;">${escapeHtml(place.description)}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Encounters
        if (summary.encounters && summary.encounters.length > 0) {
            summaryHtml += `
                <div style="margin-bottom: var(--space-4);">
                    <h5 style="color: var(--accent-red); margin: 0 0 var(--space-2) 0; font-size: 0.9rem;">⚔️ Encounters (${summary.encounters.length})</h5>
                    <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                        ${summary.encounters.map(enc => `
                            <div style="background: var(--bg-surface); border-radius: var(--radius-sm); padding: var(--space-2); border-left: 3px solid var(--accent-red);">
                                <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(enc.name)}</div>
                                ${enc.location ? `<div style="font-size: 0.8rem; color: var(--text-muted);">📍 ${escapeHtml(enc.location)}</div>` : ''}
                                ${enc.enemies && enc.enemies.length > 0 ? `<div style="font-size: 0.85rem; color: var(--accent-red); margin-top: 4px;">Enemies: ${enc.enemies.map(e => escapeHtml(e)).join(', ')}</div>` : ''}
                                ${enc.loot ? `<div style="font-size: 0.85rem; color: var(--accent-gold); margin-top: 4px;">💰 ${escapeHtml(enc.loot)}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Items Found
        if (summary.items && summary.items.length > 0) {
            summaryHtml += `
                <div style="margin-bottom: var(--space-4);">
                    <h5 style="color: var(--accent-gold); margin: 0 0 var(--space-2) 0; font-size: 0.9rem;">💎 Items Found (${summary.items.length})</h5>
                    <div style="display: flex; flex-direction: column; gap: var(--space-2);">
                        ${summary.items.map(item => `
                            <div style="background: var(--bg-surface); border-radius: var(--radius-sm); padding: var(--space-2); border-left: 3px solid var(--accent-gold);">
                                <div style="font-weight: 600; color: var(--text-primary);">${escapeHtml(item.name)}</div>
                                ${item.description ? `<div style="font-size: 0.85rem; color: var(--text-subdued); margin-top: 4px;">${escapeHtml(item.description)}</div>` : ''}
                                ${item.location ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 4px;">📍 Found at: ${escapeHtml(item.location)}</div>` : ''}
                                ${item.givenTo ? `<div style="font-size: 0.8rem; color: var(--accent-green); margin-top: 4px;">✓ Given to: ${escapeHtml(item.givenTo)}</div>` : ''}
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        // Turning Points
        if (summary.turning_points && summary.turning_points.length > 0) {
            summaryHtml += `
                <div style="margin-bottom: var(--space-4);">
                    <h5 style="color: var(--accent-green); margin: 0 0 var(--space-2) 0; font-size: 0.9rem;">Key Moments</h5>
                    <ul style="margin: 0; padding-left: var(--space-4); color: var(--text-secondary);">
                        ${summary.turning_points.map(tp => `<li>${escapeHtml(tp.description)}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        // Event Log
        if (summary.event_log && summary.event_log.length > 0) {
            summaryHtml += `
                <div style="margin-bottom: var(--space-4);">
                    <h5 style="color: var(--text-muted); margin: 0 0 var(--space-2) 0; font-size: 0.9rem;">Session Log</h5>
                    <div style="color: var(--text-secondary); font-size: 0.85rem;">
                        ${summary.event_log.map(e => `<div style="margin-bottom: 4px;">• ${escapeHtml(e.text)}</div>`).join('')}
                    </div>
                </div>
            `;
        }

        // Session Notes (follow-up)
        if (summary.session_notes && summary.session_notes.followUp) {
            summaryHtml += `
                <div style="margin-bottom: var(--space-4);">
                    <h5 style="color: var(--primary-purple); margin: 0 0 var(--space-2) 0; font-size: 0.9rem;">What's Next</h5>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">${escapeHtml(summary.session_notes.followUp)}</p>
                </div>
            `;
        }

        // Check if summary is empty
        const hasSummaryContent = (summary.npcs && summary.npcs.length > 0) ||
            (summary.places && summary.places.length > 0) ||
            (summary.encounters && summary.encounters.length > 0) ||
            (summary.items && summary.items.length > 0) ||
            (summary.turning_points && summary.turning_points.length > 0) ||
            (summary.event_log && summary.event_log.length > 0) ||
            (summary.session_notes && summary.session_notes.followUp);

        if (!hasSummaryContent) {
            summaryHtml += `<p style="color: var(--text-muted); text-align: center;">Session in progress - no events marked yet</p>`;
        }

        summaryContainer.innerHTML = summaryHtml;
    }
}

// Select a session to view its summary
function selectPlayerSession(sessionId) {
    selectedPlayerSessionId = sessionId;
    renderPlayerCampaignView();

    // Scroll summary into view on mobile
    setTimeout(() => {
        const summarySection = document.getElementById('player-summary-content');
        if (summarySection && window.innerWidth < 768) {
            summarySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
}

// ============================================
// DESKTOP SIDEBAR SYNC (for large screens)
// ============================================

function updateDMSidebar() {
    // Only update if sidebar exists (large screens)
    const sidebar = document.getElementById('dm-desktop-sidebar');
    if (!sidebar) return;

    // Campaign and Session info
    const sidebarCampaign = document.getElementById('dm-sidebar-campaign');
    const sidebarSession = document.getElementById('dm-sidebar-session');
    const sidebarStatus = document.getElementById('dm-sidebar-status');

    if (sidebarCampaign) sidebarCampaign.textContent = currentCampaignName || 'No campaign loaded';
    if (sidebarSession) {
        const sessionNum = document.getElementById('session_number')?.value;
        sidebarSession.textContent = sessionNum ? `#${sessionNum}` : '—';
    }
    if (sidebarStatus) {
        sidebarStatus.textContent = isSessionLocked ? 'Locked' : 'Active';
        sidebarStatus.style.color = isSessionLocked ? 'var(--text-muted)' : 'var(--accent-green)';
    }

    // Quick stats
    const players = sessionData.players || [];
    const npcs = sessionData.npcs || [];
    const encounters = sessionData.encounters || [];
    const items = sessionData.items || [];

    const sidebarPlayers = document.getElementById('dm-sidebar-players');
    const sidebarNpcs = document.getElementById('dm-sidebar-npcs');
    const sidebarEncounters = document.getElementById('dm-sidebar-encounters');
    const sidebarItems = document.getElementById('dm-sidebar-items');

    if (sidebarPlayers) sidebarPlayers.textContent = players.filter(p => p.player || p.character).length;
    if (sidebarNpcs) sidebarNpcs.textContent = npcs.filter(n => n.name).length;
    if (sidebarEncounters) sidebarEncounters.textContent = encounters.filter(e => e.name).length;
    if (sidebarItems) sidebarItems.textContent = items.filter(i => i.name).length;

    // Turning Points
    const turningPoints = sessionData.turningPoints || [];
    const tpContainer = document.getElementById('dm-sidebar-turning-points');
    if (tpContainer) {
        if (turningPoints.length === 0 || !turningPoints.some(tp => tp.description)) {
            tpContainer.innerHTML = '<div class="sidebar-event" style="color: var(--text-muted); font-style: italic;">No turning points yet</div>';
        } else {
            tpContainer.innerHTML = turningPoints
                .filter(tp => tp.description)
                .slice(-5) // Show last 5
                .map(tp => `
                    <div class="sidebar-event">
                        <div class="sidebar-event-text" style="color: var(--accent-gold);">⚡ ${escapeHtml(tp.description)}</div>
                        ${tp.consequence ? `<div style="font-size: 0.7rem; color: var(--text-muted); margin-top: 2px;">→ ${escapeHtml(tp.consequence)}</div>` : ''}
                    </div>
                `).join('');
        }
    }

    // Event Log
    const eventLog = sessionData.eventLog || [];
    const eventContainer = document.getElementById('dm-sidebar-events');
    if (eventContainer) {
        if (eventLog.length === 0) {
            eventContainer.innerHTML = '<div class="sidebar-event" style="color: var(--text-muted); font-style: italic;">No events logged yet</div>';
        } else {
            eventContainer.innerHTML = eventLog
                .slice(-5) // Show last 5
                .reverse() // Newest first
                .map(event => `
                    <div class="sidebar-event">
                        <div class="sidebar-event-time">${escapeHtml(event.timestamp)}</div>
                        <div class="sidebar-event-text">${escapeHtml(event.text)}</div>
                    </div>
                `).join('');
        }
    }
}

// Quick actions for sidebar
function quickAddEvent() {
    const text = prompt('Enter event note:');
    if (text && text.trim()) {
        if (!sessionData.eventLog) sessionData.eventLog = [];
        const now = new Date();
        const timestamp = now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        sessionData.eventLog.push({ timestamp, text: text.trim() });
        renderEventLogList();
        updateDMSidebar();
        triggerAutoSave();
    }
}

function quickAddTurningPoint() {
    const description = prompt('Enter turning point:');
    if (description && description.trim()) {
        if (!sessionData.turningPoints) sessionData.turningPoints = [];
        sessionData.turningPoints.push({ description: description.trim(), consequence: '' });
        renderTurningPointsList();
        updateDMSidebar();
        triggerAutoSave();
    }
}

// Note: switchToTab is defined earlier in the file (around line 1557)

// ============================================
// SIDEBAR TOGGLE
// ============================================

function isTabletView() {
    return window.innerWidth >= 768 && window.innerWidth <= 1399;
}

function isDesktopView() {
    return window.innerWidth >= 1400;
}

function toggleSidebar() {
    const sidebar = document.getElementById('dm-desktop-sidebar');
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
        localStorage.setItem('aedelore_sidebar_collapsed', isCollapsed ? 'true' : 'false');
    }
}

function closeSidebarOnTablet() {
    if (!isTabletView()) return;

    const sidebar = document.getElementById('dm-desktop-sidebar');
    const toggleBtn = document.getElementById('sidebar-toggle');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (sidebar) sidebar.classList.remove('open');
    if (toggleBtn) toggleBtn.classList.remove('open');
    if (backdrop) backdrop.classList.remove('visible');
}

function initSidebarState() {
    const sidebar = document.getElementById('dm-desktop-sidebar');
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
    const sidebar = document.getElementById('dm-desktop-sidebar');
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

// ============================================
// Initialize
// ============================================

window.addEventListener('load', () => {
    updateAuthUI();
    setupAutoSaveListeners();
    setupMobileMenuCloseOnClick();
    initSidebarState();
    // Initialize sidebar on load
    setTimeout(updateDMSidebar, 200);
});
