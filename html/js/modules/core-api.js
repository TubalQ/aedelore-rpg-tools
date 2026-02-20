// ============================================
// Core API Module
// Handles CSRF tokens and API requests
// ============================================

// Get CSRF token from cookie
function getCsrfToken() {
    const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
    return match ? decodeURIComponent(match[1]) : null;
}

// Ensure CSRF cookie is set (call on page load)
// This fixes the issue where page is loaded from cache without CSRF cookie
async function ensureCsrfToken() {
    if (!getCsrfToken()) {
        try {
            await fetch('/api/health', { credentials: 'include' });
        } catch (e) {
            // Ignore errors - offline or network issue
        }
    }
}

// Validate stored auth token on page load
// If token is invalid/expired, clear it immediately to avoid 401 loops
async function validateStoredToken() {
    const token = localStorage.getItem('aedelore_auth_token');
    if (!token) return false;

    try {
        const res = await fetch('/api/me', {
            headers: { 'Authorization': `Bearer ${token}` },
            credentials: 'include'
        });

        if (res.ok) {
            return true; // Token is valid
        } else {
            // Token invalid - clear it from localStorage
            // (server will clear the cookie via the response)
            localStorage.removeItem('aedelore_auth_token');
            window.authToken = null;
            return false;
        }
    } catch (e) {
        // Network error - don't clear, might be offline
        console.warn('Could not validate token (network error)');
        return false;
    }
}

// Initialize on page load
ensureCsrfToken();

// Validate token early (runs async, doesn't block page load)
// This helps clear stale tokens before user interacts with the page
validateStoredToken().then(valid => {
    if (!valid && localStorage.getItem('aedelore_auth_token') === null) {
        // Token was cleared - update UI if the function exists
        if (typeof window.updateAuthUI === 'function') {
            window.updateAuthUI();
        }
    }
});

// API request helper with CSRF protection
async function apiRequest(url, options = {}) {
    const csrfToken = getCsrfToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
    };

    // Add auth token if available
    if (window.authToken && !headers['Authorization']) {
        headers['Authorization'] = `Bearer ${window.authToken}`;
    }

    // Add CSRF token for non-GET requests
    if (options.method && options.method !== 'GET' && csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
    }

    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'  // Include cookies in request
    });

    // Global 401 interceptor: clear auth state on expired/invalid token
    if (response.status === 401) {
        localStorage.removeItem('aedelore_auth_token');
        window.authToken = null;
        if (typeof window.updateAuthUI === 'function') {
            window.updateAuthUI();
        }
    }

    return response;
}

// Export to global scope for other modules
window.getCsrfToken = getCsrfToken;
window.apiRequest = apiRequest;
