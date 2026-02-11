const rateLimit = require('express-rate-limit');
const { RedisStore } = require('rate-limit-redis');
const Redis = require('ioredis');
const db = require('../db');
const { loggers } = require('../logger');

const log = loggers.auth;

// Security: Account lockout settings
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60; // 15 minutes in seconds

// Skip rate limiting in test and development environments
const skipRateLimiting = () => process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';

// Redis client (null in test environment)
let redis = null;
if (!isTest && process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
        maxRetriesPerRequest: 3,
        retryDelayOnFailover: 100,
        enableReadyCheck: true,
        lazyConnect: true
    });

    redis.on('error', (err) => {
        log.error({ err }, 'Redis connection error');
    });

    redis.on('connect', () => {
        log.info('Redis connected');
    });

    // Connect immediately
    redis.connect().catch((err) => {
        log.error({ err }, 'Redis initial connection failed');
    });
}

// In-memory fallback for login attempts (used when Redis unavailable or in test)
const loginAttemptsMemory = new Map();

// Create rate limiter with Redis store (or memory fallback)
function createLimiter(options) {
    const config = {
        ...options,
        standardHeaders: true,
        legacyHeaders: false,
        skip: skipRateLimiting
    };

    // Use Redis store if available
    if (redis && !isTest) {
        config.store = new RedisStore({
            sendCommand: (...args) => redis.call(...args),
            prefix: 'rl:'
        });
    }

    return rateLimit(config);
}

// Rate limiters
const generalLimiter = createLimiter({
    windowMs: 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please slow down' }
});

const authLimiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { error: 'Too many authentication attempts, please try again later' }
});

const passwordResetLimiter = createLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: { error: 'Too many password reset attempts, please try again later' }
});

const errorLogLimiter = createLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: { error: 'Too many error reports' }
});

// Auth cookie name (must match routes/auth.js)
const AUTH_COOKIE_NAME = 'auth_token';

// Authentication middleware
// Reads token from: 1) Authorization header, 2) Cookie, 3) Query param
async function authenticate(req, res, next) {
    const token = req.headers.authorization?.replace('Bearer ', '')
                || req.cookies?.[AUTH_COOKIE_NAME]
                || req.query.token;

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const session = await db.get(
            "SELECT user_id, created_at FROM auth_tokens WHERE token = $1 AND created_at > NOW() - INTERVAL '24 hours'",
            [token]
        );

        if (!session) {
            await db.query('DELETE FROM auth_tokens WHERE token = $1', [token]);
            // Clear stale auth cookie to prevent repeated 401 errors
            res.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
            return res.status(401).json({ error: 'Unauthorized' });
        }

        req.userId = session.user_id;
        next();
    } catch (error) {
        log.error({ err: error }, 'Auth error');
        return res.status(500).json({ error: 'Server error' });
    }
}

// Account lockout helpers - Redis with memory fallback
async function isAccountLocked(username) {
    const key = `lockout:${username}`;

    // Try Redis first
    if (redis && redis.status === 'ready') {
        try {
            const data = await redis.get(key);
            if (!data) return false;
            const attempts = JSON.parse(data);
            return attempts.count >= MAX_LOGIN_ATTEMPTS;
        } catch (err) {
            log.error({ err }, 'Redis isAccountLocked error, using memory fallback');
        }
    }

    // Memory fallback
    const attempts = loginAttemptsMemory.get(username);
    if (!attempts) return false;
    if (Date.now() - attempts.lastAttempt > LOCKOUT_DURATION * 1000) {
        loginAttemptsMemory.delete(username);
        return false;
    }
    return attempts.count >= MAX_LOGIN_ATTEMPTS;
}

async function recordFailedAttempt(username) {
    const key = `lockout:${username}`;

    // Try Redis first
    if (redis && redis.status === 'ready') {
        try {
            const data = await redis.get(key);
            const attempts = data ? JSON.parse(data) : { count: 0 };
            attempts.count++;
            attempts.lastAttempt = Date.now();
            await redis.setex(key, LOCKOUT_DURATION, JSON.stringify(attempts));
            return;
        } catch (err) {
            log.error({ err }, 'Redis recordFailedAttempt error, using memory fallback');
        }
    }

    // Memory fallback
    const attempts = loginAttemptsMemory.get(username) || { count: 0, lastAttempt: 0 };
    attempts.count++;
    attempts.lastAttempt = Date.now();
    loginAttemptsMemory.set(username, attempts);
}

async function clearLoginAttempts(username) {
    const key = `lockout:${username}`;

    // Try Redis first
    if (redis && redis.status === 'ready') {
        try {
            await redis.del(key);
            return;
        } catch (err) {
            log.error({ err }, 'Redis clearLoginAttempts error, using memory fallback');
        }
    }

    // Memory fallback
    loginAttemptsMemory.delete(username);
}

module.exports = {
    generalLimiter,
    authLimiter,
    passwordResetLimiter,
    errorLogLimiter,
    authenticate,
    isAccountLocked,
    recordFailedAttempt,
    clearLoginAttempts,
    redis // Export for cleanup in tests
};
