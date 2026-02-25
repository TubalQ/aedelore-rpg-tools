/**
 * Toast notifications & confirm dialogs
 * Replaces native alert() and confirm() with styled UI components.
 */

// ── Inject styles if not already present (e.g. wiki-admin) ──

(function injectToastStyles() {
    if (document.getElementById('toast-styles')) return;
    // Check if styles are already loaded from styles.css
    const testEl = document.createElement('div');
    testEl.className = 'toast';
    document.body.appendChild(testEl);
    const hasStyles = getComputedStyle(testEl).position === 'fixed' || getComputedStyle(testEl).pointerEvents === 'none';
    testEl.remove();
    // Always inject — duplicates are harmless and ensures correctness on all pages
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
#toast-container{position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:10000;display:flex;flex-direction:column-reverse;gap:8px;pointer-events:none;max-width:420px;width:calc(100% - 32px)}
.toast{display:flex;align-items:center;gap:10px;padding:12px 16px;border-radius:8px;background:#0f0f18;border:1px solid rgba(255,255,255,0.08);color:#fff;font-size:.88rem;line-height:1.4;pointer-events:auto;opacity:0;transform:translateY(12px);transition:opacity .25s,transform .25s;box-shadow:0 4px 20px rgba(0,0,0,.4);white-space:pre-line}
.toast-show{opacity:1;transform:translateY(0)}.toast-hide{opacity:0;transform:translateY(12px)}
.toast-icon{flex-shrink:0;display:flex}.toast-msg{flex:1;min-width:0}
.toast-success{border-color:#22d97f}.toast-success .toast-icon{color:#22d97f}
.toast-error{border-color:#ef4444}.toast-error .toast-icon{color:#ef4444}
.toast-warning{border-color:#f0c040}.toast-warning .toast-icon{color:#f0c040}
.toast-info{border-color:#06b6d4}.toast-info .toast-icon{color:#06b6d4}
.confirm-overlay{position:fixed;inset:0;z-index:10001;background:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;padding:16px;opacity:0;transition:opacity .2s}
.confirm-active{opacity:1}.confirm-closing{opacity:0}
.confirm-dialog{background:#0f0f18;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:24px;max-width:400px;width:100%;box-shadow:0 8px 32px rgba(0,0,0,.5)}
.confirm-msg{color:#fff;font-size:.92rem;line-height:1.5;margin-bottom:20px;white-space:pre-line}
.confirm-actions{display:flex;gap:10px;justify-content:flex-end}
.confirm-btn{padding:8px 20px;border-radius:6px;border:1px solid rgba(255,255,255,0.08);background:#141420;color:#fff;font-size:.85rem;cursor:pointer;transition:background .15s}
.confirm-btn:hover{background:#1a1a2e}
.confirm-ok{background:#f0c040;color:#000;border-color:#f0c040;font-weight:600}
.confirm-ok:hover{background:#ffd666}
.confirm-danger{background:#ef4444!important;border-color:#ef4444!important;color:#fff!important}
.confirm-danger:hover{opacity:.9}`;
    document.head.appendChild(style);
})();

// ── Toast notifications ──

let toastContainer = null;

function ensureToastContainer() {
    if (toastContainer && document.body.contains(toastContainer)) return toastContainer;
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
    return toastContainer;
}

/**
 * Show a toast notification.
 * @param {string} msg - Message text
 * @param {'success'|'error'|'info'|'warning'} [type='info']
 * @param {number} [duration=3500] - Auto-dismiss in ms (0 = no auto-dismiss)
 */
function showToast(msg, type = 'info', duration = 3500) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icons = {
        success: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>',
        error: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
        warning: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
        info: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
    };

    // Strip emoji prefixes that were used with the old alert() calls
    const cleanMsg = msg.replace(/^[✅❌⚠️🛡️💀]\s*/, '');

    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-msg">${escapeToastHtml(cleanMsg)}</span>
    `;

    container.appendChild(toast);

    // Trigger entrance animation
    requestAnimationFrame(() => toast.classList.add('toast-show'));

    if (duration > 0) {
        setTimeout(() => dismissToast(toast), duration);
    }

    return toast;
}

function dismissToast(toast) {
    toast.classList.remove('toast-show');
    toast.classList.add('toast-hide');
    toast.addEventListener('transitionend', () => toast.remove(), { once: true });
    // Fallback removal
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 400);
}

// ── Confirm dialog ──

/**
 * Show a confirm dialog. Returns a Promise<boolean>.
 * @param {string} msg - The question / warning
 * @param {object} [opts]
 * @param {string} [opts.confirmText='Confirm']
 * @param {string} [opts.cancelText='Cancel']
 * @param {boolean} [opts.danger=false] - Red confirm button
 */
function showConfirm(msg, opts = {}) {
    const { confirmText = 'Confirm', cancelText = 'Cancel', danger = false } = opts;

    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'confirm-overlay';

        // Strip emoji prefixes
        const cleanMsg = msg.replace(/^[⚠️]\s*/, '');

        overlay.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-msg">${escapeToastHtml(cleanMsg)}</div>
                <div class="confirm-actions">
                    <button class="confirm-btn confirm-cancel">${escapeToastHtml(cancelText)}</button>
                    <button class="confirm-btn confirm-ok ${danger ? 'confirm-danger' : ''}">${escapeToastHtml(confirmText)}</button>
                </div>
            </div>
        `;

        const cleanup = (result) => {
            overlay.classList.add('confirm-closing');
            overlay.addEventListener('transitionend', () => overlay.remove(), { once: true });
            setTimeout(() => { if (overlay.parentNode) overlay.remove(); }, 300);
            resolve(result);
        };

        overlay.querySelector('.confirm-cancel').onclick = () => cleanup(false);
        overlay.querySelector('.confirm-ok').onclick = () => cleanup(true);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) cleanup(false);
        });

        document.body.appendChild(overlay);
        requestAnimationFrame(() => overlay.classList.add('confirm-active'));

        // Focus the confirm button
        overlay.querySelector('.confirm-ok').focus();
    });
}

function escapeToastHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Expose globally
window.showToast = showToast;
window.showConfirm = showConfirm;
