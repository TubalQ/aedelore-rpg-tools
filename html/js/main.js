// ============================================
// Main.js - Entry Point
// ============================================
// This file serves as the entry point for the character sheet.
// All functionality has been modularized into separate files in js/modules/
//
// Module load order (handled by script tags in HTML):
// 1. modules/core-api.js      - API requests, CSRF tokens
// 2. modules/character-data.js - Form field serialization
// 3. modules/ui-common.js     - UI interactions (menu, themes, avatar, collapsibles)
// 4. modules/auth.js          - Authentication (login, register, logout)
// 5. modules/persistence.js   - Save/load (localStorage, cloud, trash)
// 6. modules/campaigns.js     - Campaign linking, party members
// 7. modules/progression.js   - XP, attributes, locking, quest items
// 8. modules/onboarding.js    - Getting started guide
//
// Game data files (loaded before modules):
// - data/races.js
// - data/classes.js
// - data/religions.js
// - data/weapons.js
// - data/armor.js
// - data/spells.js
// - data/starting-equipment.js
//
// ============================================

console.log('Aedelore character sheet modules loaded');
