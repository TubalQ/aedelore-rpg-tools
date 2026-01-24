// Aedelore Frontend Error Logger
// Captures JavaScript errors and sends them to the API

(function() {
    'use strict';

    const API_URL = '/api/errors';
    const BATCH_DELAY = 5000; // Send errors in batches every 5 seconds
    const MAX_QUEUE_SIZE = 20; // Max errors to queue before forcing send
    const DEDUP_WINDOW = 60000; // Deduplicate same errors within 1 minute

    let errorQueue = [];
    let batchTimeout = null;
    let recentErrors = new Map(); // For deduplication

    // Get auth token if available
    function getAuthToken() {
        return localStorage.getItem('authToken') || null;
    }

    // Create error fingerprint for deduplication
    function getErrorFingerprint(type, message) {
        return `${type}:${message}`.slice(0, 200);
    }

    // Check if error was recently logged (deduplication)
    function isDuplicate(type, message) {
        const fingerprint = getErrorFingerprint(type, message);
        const lastSeen = recentErrors.get(fingerprint);

        if (lastSeen && Date.now() - lastSeen < DEDUP_WINDOW) {
            return true;
        }

        recentErrors.set(fingerprint, Date.now());

        // Clean old entries
        if (recentErrors.size > 100) {
            const now = Date.now();
            for (const [key, time] of recentErrors) {
                if (now - time > DEDUP_WINDOW) {
                    recentErrors.delete(key);
                }
            }
        }

        return false;
    }

    // Queue an error for sending
    function queueError(type, message, stack) {
        // Skip if duplicate
        if (isDuplicate(type, message)) {
            return;
        }

        errorQueue.push({
            type: type,
            message: message,
            stack: stack || null,
            url: window.location.href,
            timestamp: new Date().toISOString()
        });

        // Force send if queue is full
        if (errorQueue.length >= MAX_QUEUE_SIZE) {
            sendErrors();
        } else if (!batchTimeout) {
            // Schedule batch send
            batchTimeout = setTimeout(sendErrors, BATCH_DELAY);
        }
    }

    // Send queued errors to API
    async function sendErrors() {
        if (batchTimeout) {
            clearTimeout(batchTimeout);
            batchTimeout = null;
        }

        if (errorQueue.length === 0) {
            return;
        }

        const errorsToSend = errorQueue.splice(0, MAX_QUEUE_SIZE);
        const token = getAuthToken();

        for (const error of errorsToSend) {
            try {
                const headers = {
                    'Content-Type': 'application/json'
                };

                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                // Use sendBeacon for reliability (won't be cancelled on page unload)
                // Fall back to fetch for browsers that don't support it
                const payload = JSON.stringify(error);

                if (navigator.sendBeacon) {
                    // sendBeacon doesn't support custom headers, so use fetch
                    fetch(API_URL, {
                        method: 'POST',
                        headers: headers,
                        body: payload,
                        keepalive: true // Allows request to outlive the page
                    }).catch(() => {
                        // Silently fail - don't create infinite error loop
                    });
                } else {
                    fetch(API_URL, {
                        method: 'POST',
                        headers: headers,
                        body: payload
                    }).catch(() => {
                        // Silently fail
                    });
                }
            } catch (e) {
                // Never throw from error logger
                console.warn('Failed to send error log:', e);
            }
        }
    }

    // Global error handler for uncaught exceptions
    window.onerror = function(message, source, lineno, colno, error) {
        const stack = error?.stack || `at ${source}:${lineno}:${colno}`;
        queueError('unhandled', String(message), stack);
        return false; // Let default handler run too
    };

    // Global handler for unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        const reason = event.reason;
        let message = 'Unhandled Promise Rejection';
        let stack = null;

        if (reason instanceof Error) {
            message = reason.message;
            stack = reason.stack;
        } else if (typeof reason === 'string') {
            message = reason;
        } else if (reason) {
            try {
                message = JSON.stringify(reason).slice(0, 500);
            } catch (e) {
                message = String(reason);
            }
        }

        queueError('promise', message, stack);
    });

    // Send any queued errors before page unload
    window.addEventListener('beforeunload', function() {
        if (errorQueue.length > 0) {
            sendErrors();
        }
    });

    // Also try to send on visibility change (user switches tab)
    document.addEventListener('visibilitychange', function() {
        if (document.visibilityState === 'hidden' && errorQueue.length > 0) {
            sendErrors();
        }
    });

    // Public API for manual error logging
    window.AedeloreErrors = {
        // Log a manual error
        log: function(message, type, stack) {
            queueError(type || 'manual', String(message), stack || null);
        },

        // Log a fetch/API error
        logFetch: function(url, status, message) {
            queueError('fetch', `${status} ${message} - ${url}`, null);
        },

        // Force send all queued errors immediately
        flush: function() {
            sendErrors();
        }
    };

    // Log that error logger is initialized (for debugging)
    console.log('Aedelore Error Logger initialized');
})();
