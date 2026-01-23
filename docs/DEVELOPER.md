# Aedelore Developer Documentation

Complete technical documentation for developers who want to understand, modify, or extend the Aedelore RPG Tools.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Project Structure](#project-structure)
3. [Frontend (PWA)](#frontend-pwa)
4. [Backend API](#backend-api)
5. [Database Schema](#database-schema)
6. [Docker Infrastructure](#docker-infrastructure)
7. [Game Data](#game-data)
8. [How Components Connect](#how-components-connect)
9. [Development Guide](#development-guide)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        nginx (port 9020)                        │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐  │
│  │   /api/*     │  /umami/*    │  Static      │  PWA Cache   │  │
│  │   → API      │  → Analytics │  HTML/JS/CSS │  Service     │  │
│  │   (3000)     │  (3000)      │  Files       │  Worker      │  │
│  └──────┬───────┴──────┬───────┴──────────────┴──────────────┘  │
└─────────┼──────────────┼────────────────────────────────────────┘
          │              │
          ▼              ▼
┌─────────────────┐  ┌─────────────────┐
│  Express API    │  │  Umami Analytics│
│  (Node.js)      │  │  (Optional)     │
└────────┬────────┘  └────────┬────────┘
         │                    │
         ▼                    ▼
┌─────────────────┐  ┌─────────────────┐
│  PostgreSQL 16  │  │  PostgreSQL 16  │
│  (Main DB)      │  │  (Analytics DB) │
└─────────────────┘  └─────────────────┘
```

---

## Project Structure

```
/opt/aedelore/
├── api/                          # Backend API
│   ├── server.js                 # Express server (all routes)
│   ├── db.js                     # PostgreSQL connection wrapper
│   ├── package.json              # Dependencies
│   └── Dockerfile                # API container build
│
├── html/                         # Frontend PWA
│   ├── index.html                # Landing page
│   ├── character-sheet.html      # Character sheet (243 KB)
│   ├── dm-session.html           # DM tools (237 KB)
│   ├── manifest.json             # PWA manifest
│   ├── service-worker.js         # Offline caching (v201)
│   │
│   ├── css/
│   │   └── styles.css            # All styling (214 KB)
│   │
│   ├── js/
│   │   ├── main.js               # Character sheet logic
│   │   ├── dashboard.js          # Status bar & dashboard
│   │   ├── dm-session.js         # DM tools logic (393 KB)
│   │   ├── tabs.js               # Tab navigation
│   │   ├── sliders.js            # HP/Arcana sliders
│   │   ├── weapons.js            # Weapon auto-fill
│   │   ├── armor.js              # Armor auto-fill
│   │   ├── spells.js             # Spell management
│   │   ├── diceroller.js         # Dice mechanics
│   │   ├── system-selector.js    # Multi-system support
│   │   ├── privacy.js            # Analytics consent
│   │   ├── init.js               # Initialization
│   │   ├── focus-fix.js          # Table cell focus
│   │   └── systems/              # Game system configs
│   │       ├── system-config.js
│   │       ├── dnd5e.js
│   │       ├── pathfinder2e.js
│   │       ├── storyteller.js
│   │       └── cod.js
│   │
│   ├── data/                     # Game data (JS objects)
│   │   ├── weapons.js            # 58 weapons
│   │   ├── armor.js              # 47 armor + 5 shields
│   │   ├── spells.js             # 150+ spells/abilities
│   │   ├── races.js              # 7 races
│   │   ├── classes.js            # 6 classes
│   │   ├── religions.js          # 14 religions
│   │   └── npc-names.js          # 1000+ NPC names
│   │
│   └── icons/
│       └── icon.svg              # App icon
│
├── db/
│   └── schema.sql                # Database schema
│
├── docs/                         # Documentation
│   ├── DEVELOPER.md              # This file
│   ├── rules/                    # Game rules
│   ├── security/                 # Security docs
│   └── game-data/                # Data documentation
│
├── compose.yml                   # Docker Compose
├── nginx.conf                    # Web server config
├── .env.example                  # Environment template
└── .gitignore                    # Git ignore rules
```

---

## Frontend (PWA)

### HTML Pages

| File | Purpose | Size |
|------|---------|------|
| `index.html` | Landing page with world info | 38 KB |
| `character-sheet.html` | Character creation/management | 243 KB |
| `dm-session.html` | DM campaign/session tools | 237 KB |

### JavaScript Modules

#### Core Logic

**main.js** - Character sheet core
- Character data CRUD (load, save, export, import)
- Auto-fill equipment based on race/class
- Lock system (race/class → attributes → abilities)
- localStorage persistence
- Cloud sync integration

**dashboard.js** - Status bar & dashboard
- `updateStatusBar()` - Sync stats to status bar
- `updateDashboard()` - Render character overview
- `getSimpleWorthiness(value)` - Reputation text
- Real-time stat synchronization

**dm-session.js** - DM tools (393 KB)
- Campaign CRUD operations
- Session management and locking
- Combat tracker with initiative
- NPC manager with stat generation
- AI-powered content suggestions
- Player campaign view mode
- Reference tables

#### UI Components

**tabs.js** - Page navigation
```javascript
switchTab(tabId)  // Switch between character sheet pages
```

**sliders.js** - Slider management
- HP slider with color gradient (red→orange→green)
- Arcana, Willpower, Bleed, Weakened sliders
- Worthiness slider (-10 to +10)
- Potion sliders

**diceroller.js** - Dice mechanics
- Pool-based rolls (D10, D12, D20)
- Success counting with thresholds
- Open-ended and critical modes

#### Data Binding

**weapons.js** - Auto-fills weapon stats from `WEAPONS_DATA`
**armor.js** - Auto-fills armor stats from `ARMOR_DATA`
**spells.js** - Manages spell selection per class

#### Multi-System Support

**system-selector.js** - System selection modal
- Aedelore (default)
- D&D 5th Edition
- Pathfinder 2e
- Storyteller (World of Darkness)
- Chronicles of Darkness

**systems/*.js** - System-specific configurations

### CSS Structure (styles.css)

**Design System Variables:**
```css
/* Colors */
--bg-base: #141420;
--text-base: #ffffff;
--accent-gold: #f0c040;
--accent-purple: #a855f7;
--accent-blue: #3b9eff;
--accent-green: #22d97f;

/* Spacing */
--space-1 to --space-12 (4px to 48px)

/* Typography */
--font-size-xs to --font-size-3xl
```

**Theme Variants:**
- Aedelore (default dark)
- Midnight Blue
- Dark Glass
- Ember (warm orange/red)

### Service Worker

**Cache Strategy:** Cache-first with network fallback

```javascript
const CACHE_NAME = 'aedelore-v201';

const STATIC_ASSETS = [
  '/character-sheet',
  '/css/styles.css',
  '/js/main.js',
  // ... all JS and data files
];
```

**Behavior:**
1. Cache static assets on install
2. Serve from cache if available
3. Fetch from network in background (update cache)
4. Skip caching for `/api/*` requests
5. Offline fallback to cached character sheet

**Version Management:** Increment `CACHE_NAME` version after frontend changes.

### PWA Manifest

```json
{
  "name": "Aedelore Character Sheet",
  "short_name": "Aedelore",
  "start_url": "/character-sheet",
  "display": "standalone",
  "background_color": "#0a0a0f",
  "theme_color": "#8b5cf6"
}
```

---

## Backend API

### Technology Stack

- **Framework:** Express.js 5.0.1
- **Database:** PostgreSQL via `pg` package
- **Security:** Helmet, bcrypt, CORS, rate limiting
- **Authentication:** Bearer token (24h expiry)

### Security Features

| Feature | Setting |
|---------|---------|
| Token expiry | 24 hours |
| Account lockout | 5 failed attempts → 15 min lockout |
| Password requirements | Min 8 chars, letters + numbers |
| Rate limiting (general) | 100 requests/minute |
| Rate limiting (auth) | 10 requests/15 minutes |

### API Endpoints

#### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Create account |
| POST | `/api/login` | Authenticate |
| POST | `/api/logout` | End session |
| GET | `/api/me` | Get user profile |
| PUT | `/api/account/password` | Change password |
| DELETE | `/api/account` | Delete account (soft delete) |

#### Characters

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/characters` | List user's characters |
| GET | `/api/characters/:id` | Get character |
| POST | `/api/characters` | Create character |
| PUT | `/api/characters/:id` | Update character |
| DELETE | `/api/characters/:id` | Soft delete character |

#### Character Progression

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/characters/:id/lock-race-class` | Lock race/class |
| POST | `/api/characters/:id/lock-attributes` | Lock attributes |
| POST | `/api/characters/:id/lock-abilities` | Lock abilities |
| POST | `/api/characters/:id/spend-attribute-points` | Spend XP on points |
| POST | `/api/characters/:id/link-campaign` | Link to campaign |
| DELETE | `/api/characters/:id/link-campaign` | Unlink from campaign |
| GET | `/api/characters/:id/party` | Get party members |

#### Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | List DM's campaigns |
| GET | `/api/campaigns/:id` | Get campaign details |
| POST | `/api/campaigns` | Create campaign |
| PUT | `/api/campaigns/:id` | Update campaign |
| DELETE | `/api/campaigns/:id` | Soft delete campaign |
| POST | `/api/campaigns/:id/share` | Generate share code |
| DELETE | `/api/campaigns/:id/share` | Revoke share code |
| POST | `/api/campaigns/join` | Join via share code |
| DELETE | `/api/campaigns/:id/leave` | Leave campaign |
| GET | `/api/campaigns/:id/players` | List players |
| DELETE | `/api/campaigns/:id/players/:playerId` | Remove player |

#### Sessions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns/:campaignId/sessions` | List sessions |
| GET | `/api/sessions/:id` | Get session |
| POST | `/api/campaigns/:campaignId/sessions` | Create session |
| PUT | `/api/sessions/:id` | Update session |
| PUT | `/api/sessions/:id/lock` | Lock session |
| PUT | `/api/sessions/:id/unlock` | Unlock session |
| DELETE | `/api/sessions/:id` | Soft delete session |

#### DM Tools

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/dm/characters/:id/give-xp` | Award XP |
| POST | `/api/dm/characters/:id/unlock` | Unlock progression |
| POST | `/api/dm/characters/:id/give-item` | Give quest item |
| GET | `/api/dm/campaigns/:id/characters` | List campaign characters |

#### Player View

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/player/campaigns` | List joined campaigns |
| GET | `/api/player/campaigns/:id` | Get campaign (player view) |

#### Trash/Restore

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trash/characters` | List deleted characters |
| POST | `/api/trash/characters/:id/restore` | Restore character |
| DELETE | `/api/trash/characters/:id` | Permanent delete |
| GET | `/api/trash/campaigns` | List deleted campaigns |
| POST | `/api/trash/campaigns/:id/restore` | Restore campaign |
| DELETE | `/api/trash/campaigns/:id` | Permanent delete |
| GET | `/api/trash/sessions` | List deleted sessions |
| POST | `/api/trash/sessions/:id/restore` | Restore session |
| DELETE | `/api/trash/sessions/:id` | Permanent delete |

### Request/Response Examples

**Register:**
```json
// POST /api/register
{ "username": "player1", "password": "SecurePass123" }

// Response
{ "success": true, "token": "abc123...", "userId": 1 }
```

**Save Character:**
```json
// POST /api/characters
{
  "name": "Thorin",
  "data": { /* character JSON */ },
  "system": "aedelore"
}

// Response
{ "success": true, "id": 42 }
```

**Error Response:**
```json
{ "error": "Invalid credentials" }
```

---

## Database Schema

### Tables

**users**
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**characters**
```sql
CREATE TABLE characters (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  data JSONB NOT NULL,
  system TEXT DEFAULT 'aedelore',
  campaign_id INTEGER REFERENCES campaigns(id) ON DELETE SET NULL,
  xp INTEGER DEFAULT 0,
  xp_spent INTEGER DEFAULT 0,
  race_class_locked BOOLEAN DEFAULT FALSE,
  attributes_locked BOOLEAN DEFAULT FALSE,
  abilities_locked BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP  -- Soft delete
);
```

**campaigns**
```sql
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  share_code TEXT,  -- 8-char hex for player access
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP  -- Soft delete
);
```

**campaign_players**
```sql
CREATE TABLE campaign_players (
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (campaign_id, user_id)
);
```

**sessions**
```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_number INTEGER NOT NULL,
  date TEXT,
  location TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'locked')),
  data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP  -- Soft delete
);
```

**auth_tokens**
```sql
CREATE TABLE auth_tokens (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  -- Expires: created_at + 24 hours
);
```

### Soft Delete Pattern

All main tables use `deleted_at` for soft delete:
- `NULL` = active record
- `TIMESTAMP` = deleted (recoverable)

Queries filter with `WHERE deleted_at IS NULL`.

---

## Docker Infrastructure

### Services (compose.yml)

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| aedelore-proffs-db | postgres:16-alpine | 5432 (internal) | Main database |
| aedelore-proffs-api | ./api (custom) | 3000 (internal) | Backend API |
| aedelore-proffs-web | nginx:alpine | 9020 → 80 | Web server |
| aedelore-umami-db | postgres:16-alpine | 5432 (internal) | Analytics DB |
| aedelore-umami | umami:postgresql-latest | 3000 (internal) | Analytics |

### Volumes

- `aedelore-pgdata` - Main PostgreSQL data
- `aedelore-umami-pgdata` - Analytics PostgreSQL data

### nginx Routing

| Path | Target |
|------|--------|
| `/api/*` | API server (port 3000) |
| `/umami/*` | Umami dashboard |
| `/umami-script.js` | Analytics script (cached 1h) |
| `/*` | Static files |

### Environment Variables

```bash
# Database
POSTGRES_DB=aedelore
POSTGRES_USER=aedelore
POSTGRES_PASSWORD=<secure-password>
DATABASE_URL=postgres://user:pass@host:5432/db

# API
CORS_ORIGIN=https://yourdomain.com

# Analytics (optional)
UMAMI_DB_PASSWORD=<secure-password>
UMAMI_APP_SECRET=<secure-secret>
```

---

## Game Data

### Weapons (data/weapons.js)

```javascript
WEAPONS_DATA = {
  "Longsword": {
    type: "Martial Melee",
    ability: "Strength",
    bonus: "+2",
    damage: "1d8",
    range: "1",
    break: "2"
  },
  // ... 58 weapons total
}
```

**Categories:** Simple Melee, Martial Melee, Ranged, Fantasy

### Armor (data/armor.js)

```javascript
ARMOR_DATA = {
  "Chainmail": {
    bodypart: "chest",
    type: "Medium",
    hp: "20",
    bonus: "4+block",
    disadvantage: "-1 Stealth"
  },
  // ... 47 armor pieces
}

SHIELD_DATA = {
  "Metal Shield": { hp: "25", block: "6", defense: "3" },
  // ... 5 shields
}
```

**Body Parts:** Head, Shoulders, Chest, Hands, Legs

### Races (data/races.js)

```javascript
RACES = {
  "Human": {
    bonuses: ["+1 Strength", "+1 Dexterity", ...],
    startingEquipment: {
      weapon: "Longsword",
      food: "1D6",
      gold: 0,
      worthiness: 5,
      hp: 20
    }
  },
  // ... 7 races: Human, Dwarf, Halfling, High Elf, Moon Elf, Orc, Troll
}
```

### Classes (data/classes.js)

```javascript
CLASSES = {
  "Warrior": {
    bonuses: ["+1 Strength", "+1 Toughness"],
    startingEquipment: {
      armor: { chest: "Chainmail", ... },
      shield: "Metal Shield",
      weapon: "Longsword",
      gold: 5,
      hpBonus: 5,
      abilities: 3
    },
    abilityType: "weakened"
  },
  // ... 6 classes: Warrior, Thief/Rogue, Outcast, Mage, Hunter, Druid
}
```

### Spells (data/spells.js)

```javascript
SPELLS_BY_CLASS = {
  "Warrior": [
    { name: "Last Stand", weakened: "3", desc: "..." },
    // ... 14 abilities (use Weakened resource)
  ],
  "Mage": [
    { name: "Fireball", arcana: "3", damage: "3/D10", desc: "..." },
    // ... 40+ spells (use Arcana resource)
  ],
  // ...
}
```

**Resource Types:**
- **Arcana** - Mage/Druid spells (cost 1-5 Arcana)
- **Weakened** - Melee abilities (cost 2-4 Weakened stacks)

### Religions (data/religions.js)

```javascript
RELIGIONS = {
  "Creed of Shadows": {
    bonuses: ["+1 Stealth", "+1 Deception"]
  },
  "The Abyssal Veil": {
    bonuses: ["+2 Deception", "-5 Worthiness"]
  },
  // ... 14 religions + "None"
}
```

---

## How Components Connect

### Character Creation Flow

```
1. User visits /character-sheet
2. system-selector.js checks localStorage for saved system
3. If new → show system selector modal
4. Load system config from /js/systems/
5. main.js initializes character data
6. init.js runs after DOM ready:
   - Initialize sliders (sliders.js)
   - Set up auto-fill (weapons.js, armor.js, spells.js)
   - Initialize dice roller (diceroller.js)
7. User selects race → main.js applies race bonuses
8. User selects class → spells.js updates available spells
9. Character auto-saves to localStorage
10. Service worker caches for offline use
```

### Data Binding

```
Race Selection → RACES[selectedRace] from races.js
Class Selection → CLASSES[selectedClass] from classes.js
Spell Selection → SPELLS_BY_CLASS[selectedClass] from spells.js
Weapon Entry → WEAPONS_DATA[weaponName] from weapons.js
Armor Entry → ARMOR_DATA[armorName] from armor.js
Religion Selection → RELIGIONS[selectedReligion] from religions.js
```

### State Management

| Data | Storage | Scope |
|------|---------|-------|
| Character data | localStorage | Persists offline |
| View state | localStorage | Survives refresh |
| Theme preference | localStorage | Per browser |
| Auth token | localStorage | 24h expiry |
| Offline cache | Service Worker Cache | Static assets |

---

## Development Guide

### Local Development

```bash
# Start services
docker compose up -d

# View logs
docker compose logs -f aedelore-proffs-api

# Rebuild API after changes
docker compose build --no-cache aedelore-proffs-api && docker compose up -d aedelore-proffs-api

# Access database
docker exec -it aedelore-proffs-db psql -U aedelore -d aedelore
```

### Frontend Changes

1. Edit files in `html/`
2. Increment version in `service-worker.js`:
   ```javascript
   const CACHE_NAME = 'aedelore-v202';  // Was v201
   ```
3. Hard refresh browser (Ctrl+Shift+R) to clear cache

### API Changes

1. Edit `api/server.js`
2. Rebuild container:
   ```bash
   docker compose build --no-cache aedelore-proffs-api
   docker compose up -d aedelore-proffs-api
   ```

### Database Changes

1. Edit `db/schema.sql` for documentation
2. Apply changes directly:
   ```bash
   docker exec -it aedelore-proffs-db psql -U aedelore -d aedelore
   ```
   ```sql
   ALTER TABLE characters ADD COLUMN new_field TEXT;
   ```

### Adding New Game Data

**New Weapon:**
```javascript
// data/weapons.js
WEAPONS_DATA["New Sword"] = {
  type: "Martial Melee",
  ability: "Strength",
  bonus: "+2",
  damage: "1d10",
  range: "1",
  break: "3"
};
```

**New Spell:**
```javascript
// data/spells.js
SPELLS_BY_CLASS["Mage"].push({
  name: "New Spell",
  arcana: "2",
  damage: "2/D10",
  desc: "Description here"
});
```

### Common Tasks

| Task | Command/Action |
|------|----------------|
| Check service status | `docker compose ps` |
| View API logs | `docker compose logs -f aedelore-proffs-api` |
| Restart all | `docker compose restart` |
| Stop all | `docker compose down` |
| Clear browser cache | DevTools → Application → Clear Storage |
| Update service worker | Increment `CACHE_NAME` version |

---

## Security Notes

- Never commit `.env` files
- Database ports are internal only (not exposed to host)
- API uses parameterized queries (SQL injection protection)
- Passwords hashed with bcrypt (10 rounds)
- Rate limiting prevents brute force attacks
- CORS restricts API access to configured origin
- Helmet adds security headers

---

*Last updated: 2026-01-23*
