// ============================================
// Structured Logging with Pino
// ============================================

const pino = require('pino');

// Determine log level based on environment
const level = process.env.NODE_ENV === 'production' ? 'info'
            : process.env.NODE_ENV === 'test' ? 'silent'
            : 'debug';

// Create logger instance with configuration
const logger = pino({
    level,
    // Use pretty printing in development
    transport: process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test' ? {
        target: 'pino/file',
        options: { destination: 1 } // stdout
    } : undefined,
    // Base fields included in every log
    base: {
        env: process.env.NODE_ENV || 'development'
    },
    // Timestamp format
    timestamp: pino.stdTimeFunctions.isoTime,
    // Redact sensitive fields
    redact: {
        paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token'],
        censor: '[REDACTED]'
    }
});

// Child loggers for different modules
const createModuleLogger = (moduleName) => logger.child({ module: moduleName });

// Pre-configured module loggers
const loggers = {
    auth: createModuleLogger('auth'),
    characters: createModuleLogger('characters'),
    campaigns: createModuleLogger('campaigns'),
    sessions: createModuleLogger('sessions'),
    dm: createModuleLogger('dm'),
    trash: createModuleLogger('trash'),
    errors: createModuleLogger('errors'),
    db: createModuleLogger('db'),
    email: createModuleLogger('email'),
    server: createModuleLogger('server')
};

module.exports = {
    logger,
    loggers,
    createModuleLogger
};
