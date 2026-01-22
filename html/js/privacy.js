// Aedelore Privacy Module
// Handles cookie-less analytics consent and Umami integration

(function() {
    'use strict';

    const CONSENT_KEY = 'aedelore_analytics_consent';
    const UMAMI_WEBSITE_ID = 'f46295f7-66da-4539-948d-b1981a4de56d';
    const UMAMI_SCRIPT_URL = '/umami-script.js';

    // Get current consent status
    function getConsent() {
        const value = localStorage.getItem(CONSENT_KEY);
        if (value === 'true') return true;
        if (value === 'false') return false;
        return null; // No decision yet
    }

    // Set consent status
    function setConsent(value) {
        localStorage.setItem(CONSENT_KEY, value ? 'true' : 'false');
        if (value) {
            loadUmami();
        } else {
            removeUmami();
        }
        hideBanner();
        updatePrivacyDetailsModal();
    }

    // Load Umami analytics script
    function loadUmami() {
        if (document.getElementById('umami-script')) return;

        const script = document.createElement('script');
        script.id = 'umami-script';
        script.async = true;
        script.defer = true;
        script.src = UMAMI_SCRIPT_URL;
        script.setAttribute('data-website-id', UMAMI_WEBSITE_ID);
        document.head.appendChild(script);
    }

    // Remove Umami analytics script
    function removeUmami() {
        const script = document.getElementById('umami-script');
        if (script) {
            script.remove();
        }
    }

    // Show the privacy banner
    function showBanner() {
        const banner = document.getElementById('privacy-banner');
        if (banner) {
            banner.classList.add('visible');
        }
    }

    // Hide the privacy banner
    function hideBanner() {
        const banner = document.getElementById('privacy-banner');
        if (banner) {
            banner.classList.remove('visible');
        }
    }

    // Show privacy details modal
    function showPrivacyDetails() {
        const modal = document.getElementById('privacy-details-modal');
        if (modal) {
            modal.style.display = 'flex';
            updatePrivacyDetailsModal();
        }
    }

    // Hide privacy details modal
    function hidePrivacyDetails() {
        const modal = document.getElementById('privacy-details-modal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Update privacy details modal with current status
    function updatePrivacyDetailsModal() {
        const statusEl = document.getElementById('privacy-analytics-status');
        const toggleBtn = document.getElementById('privacy-analytics-toggle');

        if (statusEl && toggleBtn) {
            const consent = getConsent();
            if (consent === true) {
                statusEl.textContent = 'Enabled';
                statusEl.className = 'privacy-status-enabled';
                toggleBtn.textContent = 'Disable';
                toggleBtn.className = 'privacy-btn privacy-btn-secondary';
            } else {
                statusEl.textContent = 'Disabled';
                statusEl.className = 'privacy-status-disabled';
                toggleBtn.textContent = 'Enable';
                toggleBtn.className = 'privacy-btn privacy-btn-primary';
            }
        }
    }

    // Toggle analytics on/off
    function toggleAnalytics() {
        const currentConsent = getConsent();
        setConsent(!currentConsent);
    }

    // Initialize on page load
    function init() {
        const consent = getConsent();

        if (consent === null) {
            // First visit, show banner
            showBanner();
        } else if (consent === true) {
            // User consented, load analytics
            loadUmami();
        }
        // If consent is false, do nothing (analytics disabled)
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose public API
    window.AedelorePrivacy = {
        getConsent: getConsent,
        setConsent: setConsent,
        showBanner: showBanner,
        hideBanner: hideBanner,
        showPrivacyDetails: showPrivacyDetails,
        hidePrivacyDetails: hidePrivacyDetails,
        toggleAnalytics: toggleAnalytics,
        acceptAnalytics: function() { setConsent(true); },
        declineAnalytics: function() { setConsent(false); }
    };
})();
