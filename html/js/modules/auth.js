// ============================================
// Auth Module
// Handles login, register, logout and authentication UI
// ============================================

// Global auth state
window.authToken = localStorage.getItem('aedelore_auth_token');
window.currentCharacterId = null;
window.currentCampaign = null;

function updateAuthUI() {
    const loggedOutDiv = document.getElementById('server-logged-out');
    const loggedInDiv = document.getElementById('server-logged-in');
    const serverBtnText = document.getElementById('server-btn-text');

    if (window.authToken) {
        if (loggedOutDiv) loggedOutDiv.style.display = 'none';
        if (loggedInDiv) loggedInDiv.style.display = 'block';
        if (serverBtnText) serverBtnText.textContent = 'Cloud ✓';
    } else {
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
    const forgotText = document.getElementById('auth-forgot-text');
    const usernameInput = document.getElementById('auth-username');
    const emailInput = document.getElementById('auth-email');
    const emailGroup = document.getElementById('auth-email-group');
    const passwordInput = document.getElementById('auth-password');
    const confirmInput = document.getElementById('auth-confirm-password');
    const confirmGroup = document.getElementById('auth-confirm-group');

    usernameInput.value = '';
    if (emailInput) emailInput.value = '';
    passwordInput.value = '';
    if (confirmInput) confirmInput.value = '';
    document.getElementById('auth-error').textContent = '';

    const handleEnter = (e) => {
        if (e.key === 'Enter') {
            submitBtn.click();
        }
    };
    usernameInput.onkeydown = handleEnter;
    if (emailInput) emailInput.onkeydown = handleEnter;
    passwordInput.onkeydown = handleEnter;
    if (confirmInput) confirmInput.onkeydown = handleEnter;

    if (mode === 'login') {
        title.textContent = 'Login';
        submitBtn.textContent = 'Login';
        toggleText.innerHTML = 'No account? <a href="#" onclick="showAuthModal(\'register\'); return false;">Register here</a>';
        if (emailGroup) emailGroup.style.display = 'none';
        if (confirmGroup) confirmGroup.style.display = 'none';
        if (forgotText) forgotText.style.display = '';
        submitBtn.onclick = doLogin;
    } else {
        title.textContent = 'Register';
        submitBtn.textContent = 'Register';
        toggleText.innerHTML = 'Have an account? <a href="#" onclick="showAuthModal(\'login\'); return false;">Login here</a>';
        if (emailGroup) emailGroup.style.display = '';
        if (confirmGroup) confirmGroup.style.display = '';
        if (forgotText) forgotText.style.display = 'none';
        submitBtn.onclick = doRegister;
    }

    modal.style.display = 'flex';
    usernameInput.focus();
}

function hideAuthModal() {
    document.getElementById('auth-modal').style.display = 'none';
}

function showForgotPasswordModal() {
    hideAuthModal();
    const modal = document.getElementById('forgot-password-modal');
    const emailInput = document.getElementById('forgot-email');
    const errorEl = document.getElementById('forgot-error');
    const successEl = document.getElementById('forgot-success');
    const submitBtn = document.getElementById('forgot-submit-btn');

    if (emailInput) emailInput.value = '';
    if (errorEl) errorEl.textContent = '';
    if (successEl) successEl.textContent = '';
    if (submitBtn) submitBtn.disabled = false;

    modal.style.display = 'flex';
    if (emailInput) emailInput.focus();
}

function hideForgotPasswordModal() {
    document.getElementById('forgot-password-modal').style.display = 'none';
}

async function requestPasswordReset() {
    const emailInput = document.getElementById('forgot-email');
    const errorEl = document.getElementById('forgot-error');
    const successEl = document.getElementById('forgot-success');
    const submitBtn = document.getElementById('forgot-submit-btn');

    const email = emailInput.value.trim();

    if (!email) {
        errorEl.textContent = 'Please enter your email address';
        return;
    }

    submitBtn.disabled = true;
    errorEl.textContent = '';
    successEl.textContent = '';

    try {
        const res = await window.apiRequest('/api/forgot-password', {
            method: 'POST',
            body: JSON.stringify({ email })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.error || 'Request failed';
            submitBtn.disabled = false;
            return;
        }

        successEl.textContent = data.message || 'If an account with this email exists, a reset link has been sent.';
        emailInput.value = '';
    } catch (error) {
        errorEl.textContent = 'Connection error. Please try again.';
        submitBtn.disabled = false;
    }
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
        const res = await window.apiRequest('/api/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.error || 'Login failed';
            return;
        }

        window.authToken = data.token;
        localStorage.setItem('aedelore_auth_token', window.authToken);

        // Check for local character and migrate to cloud automatically
        if (window.hasLocalCharacter && window.hasLocalCharacter()) {
            console.log('Found local character, migrating to cloud...');
            const migrated = await window.migrateLocalToCloud();
            if (migrated) {
                console.log('Local character migrated successfully');
            }
        }

        // Remove sync notice if shown
        const notice = document.getElementById('sync-notice');
        if (notice) notice.remove();

        location.reload();
    } catch (error) {
        errorEl.textContent = 'Connection error. Please try again.';
    }
}

async function doRegister() {
    const username = document.getElementById('auth-username').value.trim();
    const emailInput = document.getElementById('auth-email');
    const email = emailInput ? emailInput.value.trim() : '';
    const password = document.getElementById('auth-password').value;
    const confirmInput = document.getElementById('auth-confirm-password');
    const confirmPassword = confirmInput ? confirmInput.value : '';
    const errorEl = document.getElementById('auth-error');

    if (!username || !password || !email) {
        errorEl.textContent = 'Please enter username, email, and password';
        return;
    }

    if (password !== confirmPassword) {
        errorEl.textContent = 'Passwords do not match';
        return;
    }

    try {
        const res = await window.apiRequest('/api/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();

        if (!res.ok) {
            errorEl.textContent = data.error || 'Registration failed';
            return;
        }

        window.authToken = data.token;
        localStorage.setItem('aedelore_auth_token', window.authToken);
        location.reload();
    } catch (error) {
        errorEl.textContent = 'Connection error. Please try again.';
    }
}

async function doLogout() {
    // Save any unsaved character changes first
    if (window.currentCharacterId && window.authToken) {
        try {
            await window.saveToServer(true);
        } catch (e) {
            console.error('Failed to save before logout:', e);
        }
    }

    // Clear character sheet fields (without confirmation)
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
    });

    // Call server logout
    try {
        await window.apiRequest('/api/logout', {
            method: 'POST'
        });
    } catch (e) {
        // Ignore errors
    }

    // Clear local state
    window.authToken = null;
    window.currentCharacterId = null;
    window.currentCampaign = null;
    localStorage.removeItem('aedelore_auth_token');
    localStorage.removeItem('aedelore_current_character_id');
    localStorage.removeItem('aedelore_character_autosave');

    // Clear local character data (already saved to cloud)
    if (window.clearLocalCharacter) {
        window.clearLocalCharacter();
    }

    // Clear Service Worker cache
    if ('caches' in window) {
        try {
            const cacheNames = await caches.keys();
            await Promise.all(cacheNames.map(name => caches.delete(name)));
        } catch (e) {
            console.error('Failed to clear cache:', e);
        }
    }

    location.reload();
}

async function deleteAccount() {
    if (!window.authToken) {
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
        const res = await window.apiRequest('/api/account', {
            method: 'DELETE',
            body: JSON.stringify({ password })
        });

        const data = await res.json();

        if (!res.ok) {
            alert(`❌ ${data.error || 'Failed to delete account'}`);
            return;
        }

        window.authToken = null;
        window.currentCharacterId = null;
        localStorage.removeItem('aedelore_auth_token');
        updateAuthUI();
        alert('✅ Account deleted successfully.');
    } catch (error) {
        alert('❌ Connection error. Please try again.');
    }
}

// Export to global scope
window.updateAuthUI = updateAuthUI;
window.showAuthModal = showAuthModal;
window.hideAuthModal = hideAuthModal;
window.showForgotPasswordModal = showForgotPasswordModal;
window.hideForgotPasswordModal = hideForgotPasswordModal;
window.requestPasswordReset = requestPasswordReset;
window.doLogin = doLogin;
window.doRegister = doRegister;
window.doLogout = doLogout;
window.deleteAccount = deleteAccount;
