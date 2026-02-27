// ============================================
// Activity Monitor Module
// Auto-logout after 1 hour of inactivity
// ============================================

(function() {
    const TIMEOUT_MS = 60 * 60 * 1000;       // 60 minutes
    const WARNING_MS = 55 * 60 * 1000;        // Warning at 55 minutes
    const EVENTS = ['click', 'keypress', 'scroll', 'touchstart'];

    let timeoutId = null;
    let warningId = null;
    let warningBanner = null;

    function resetTimers() {
        if (timeoutId) clearTimeout(timeoutId);
        if (warningId) clearTimeout(warningId);
        hideWarning();

        warningId = setTimeout(showWarning, WARNING_MS);
        timeoutId = setTimeout(autoLogout, TIMEOUT_MS);
    }

    function showWarning() {
        if (warningBanner) return;
        warningBanner = document.createElement('div');
        warningBanner.id = 'activity-warning';
        warningBanner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:99999;background:#b45309;color:#fff;text-align:center;padding:10px 16px;font-size:14px;cursor:pointer;';
        warningBanner.textContent = 'You will be logged out in 5 minutes due to inactivity. Click anywhere to stay logged in.';
        document.body.appendChild(warningBanner);
    }

    function hideWarning() {
        if (warningBanner) {
            warningBanner.remove();
            warningBanner = null;
        }
    }

    async function autoLogout() {
        hideWarning();
        if (typeof doLogout === 'function') {
            await doLogout();
        } else if (typeof window.doLogout === 'function') {
            await window.doLogout();
        } else {
            // Fallback: clear auth and reload
            localStorage.removeItem('aedelore_auth_token');
            document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
            location.reload();
        }
    }

    // Only activate when user is logged in
    function init() {
        const token = localStorage.getItem('aedelore_auth_token');
        if (!token) return;

        EVENTS.forEach(evt => document.addEventListener(evt, resetTimers, { passive: true }));
        resetTimers();
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
