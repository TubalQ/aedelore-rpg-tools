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

// Initialize CSRF on load
ensureCsrfToken();

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

    return fetch(url, {
        ...options,
        headers,
        credentials: 'include'  // Include cookies in request
    });
}

// Export to global scope for other modules
window.getCsrfToken = getCsrfToken;
window.apiRequest = apiRequest;
