const crypto = require('crypto');

// Token generation
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

function generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Validation
function validateUsername(username) {
    return /^[a-zA-Z0-9_]{3,30}$/.test(username);
}

function validatePassword(password) {
    return password.length >= 8 && /[a-zA-Z]/.test(password) && /[0-9]/.test(password);
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Valid game systems
const VALID_SYSTEMS = ['aedelore', 'dnd5e', 'pathfinder2e', 'storyteller', 'cod'];

function validateSystem(system) {
    return VALID_SYSTEMS.includes(system);
}

module.exports = {
    generateToken,
    generateResetToken,
    validateUsername,
    validatePassword,
    validateEmail,
    validateSystem,
    VALID_SYSTEMS
};
