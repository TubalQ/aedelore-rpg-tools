const crypto = require('crypto');

// CSRF Protection using Double Submit Cookie pattern
// - A CSRF token is generated and stored in a non-httpOnly cookie (readable by JS)
// - Client must read the cookie and send the token in X-CSRF-Token header
// - Server validates that header matches cookie value

const CSRF_COOKIE_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';

// Skip CSRF protection for safe methods (GET, HEAD, OPTIONS) and in test environment
const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

// Endpoints that don't require CSRF protection (pre-authentication endpoints)
const CSRF_EXEMPT_PATHS = [
    '/api/login',
    '/api/register',
    '/api/forgot-password',
    '/api/reset-password',
    '/api/errors'  // Error logging from frontend
];

function generateCsrfToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Middleware to set CSRF cookie if not present
function csrfCookieSetter(req, res, next) {
    if (!req.cookies[CSRF_COOKIE_NAME]) {
        const token = generateCsrfToken();
        res.cookie(CSRF_COOKIE_NAME, token, {
            httpOnly: false,  // Must be readable by JavaScript
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',  // 'lax' still protects against CSRF but works better in dev
            maxAge: 24 * 60 * 60 * 1000  // 24 hours
        });
        req.csrfToken = token;
    } else {
        req.csrfToken = req.cookies[CSRF_COOKIE_NAME];
    }
    next();
}

// Middleware to validate CSRF token
function csrfProtection(req, res, next) {
    // Skip for safe methods
    if (SAFE_METHODS.includes(req.method)) {
        return next();
    }

    // Skip in test environment
    if (process.env.NODE_ENV === 'test') {
        return next();
    }

    // Skip for exempt paths (login, register, etc.)
    if (CSRF_EXEMPT_PATHS.some(path => req.path === path || req.path.startsWith(path + '/'))) {
        return next();
    }

    // Skip for Bearer token auth (API/MCP calls) — CSRF only protects cookie-based browser auth
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return next();
    }

    const cookieToken = req.cookies[CSRF_COOKIE_NAME];
    // Accept CSRF token from header OR query param (for sendBeacon which can't set headers)
    const headerToken = req.headers[CSRF_HEADER_NAME] || req.query.csrf_token;

    if (!cookieToken || !headerToken) {
        return res.status(403).json({ error: 'CSRF token missing' });
    }

    // Use timing-safe comparison to prevent timing attacks
    if (cookieToken.length !== headerToken.length) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    const isValid = crypto.timingSafeEqual(
        Buffer.from(cookieToken),
        Buffer.from(headerToken)
    );

    if (!isValid) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    next();
}

module.exports = {
    csrfCookieSetter,
    csrfProtection,
    generateCsrfToken,
    CSRF_COOKIE_NAME,
    CSRF_HEADER_NAME
};
