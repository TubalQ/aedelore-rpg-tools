# Aedelore RPG Tools

A complete digital toolkit for tabletop RPG players and game masters. Manage your characters, run campaigns, and play sessions - all from your browser or phone.

![Aedelore Character Sheet](aedelore.png)

![Aedelore DM Tools](DMtool.png)

## What is this?

**For Players:** A digital character sheet that works offline, syncs across devices, and keeps your character safe in the cloud. No more lost paper sheets or forgetting your character at home.

**For Game Masters:** A complete campaign management system with session planning, encounter tracking, NPC management, and tools to share session summaries with your players.

Built for the Aedelore RPG system, but supports other systems like D&D 5e, Pathfinder 2e, and Storyteller.

## Links

| | |
|---|---|
| **Main Site** | [aedelore.nu](https://aedelore.nu) |
| **Wiki** | [wiki.aedelore.nu](https://wiki.aedelore.nu) |
| **Character Sheet** | [aedelore.nu/character-sheet](https://aedelore.nu/character-sheet) |
| **DM Session Tools** | [aedelore.nu/dm-session](https://aedelore.nu/dm-session) |

## Features

### Character Sheet (PWA)

**Character Management**
- Full character creation with stats, skills, abilities, and inventory
- Lock system for campaign play (DM controls when choices are final)
- Quest items received from your DM appear automatically
- Auto-refresh keeps your sheet in sync during play

**Works Everywhere**
- Install as an app on mobile, tablet, or desktop
- Works offline - no internet required during sessions
- Cloud sync across all your devices
- Local backup to browser storage

**Customization**
- 12 visual themes (Aedelore, Midnight, Ember, Forest, Void, and more)
- Custom avatar (emoji or image upload)
- Multiple game system support

**Tools**
- Integrated dice roller with success levels
- Quick actions for Rest, Heal, Potions
- Export/import characters as JSON
- Print-friendly layout

**Account Features**
- Cloud save with automatic sync
- Password reset via email
- Trash bin with restore option

### DM Session Tools

**Campaign Management**
- Create and manage multiple campaigns
- Invite players via shareable links
- Track all characters in your campaign
- Give XP and items directly to player inventories

**Session Planning**
- Day/time-based session timeline
- Places, encounters, NPCs, and items
- Read-aloud text sections
- Session prolog for recaps

**During Play**
- Live encounter tracking with HP management
- Mark NPCs as met, places as visited
- Give loot items to specific players
- Event log and turning points

**AI Assistant (MCP)**
- Model Context Protocol server for direct AI integration
- 39 tools (24 DM + 15 player) and 12 prompt templates
- OAuth 2.0 with PKCE authentication
- DM tools: plan sessions, create NPCs/encounters, import content, manage campaigns
- Player tools: build characters, equip gear, track HP/inventory, run solo adventures
- AI updates the character sheet in real-time during play
- Works with Claude Desktop, Cursor, and other MCP-compatible clients

**Player View**
- Share session summaries with players
- Lock sessions to control what players see
- Players see their quest items, visited places, met NPCs

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vanilla HTML/CSS/JavaScript (PWA) |
| Backend API | Node.js + Express |
| Database | PostgreSQL 16 |
| Web Server | nginx |
| MCP Server | Node.js + @modelcontextprotocol/sdk |
| Auth | OAuth 2.0 with PKCE, OIDC/Keycloak |
| Cache | Redis 7 |
| Email | Nodemailer (SMTP) |
| Container | Docker Compose |

## Quick Start

### Prerequisites
- Docker and Docker Compose

### Setup

1. Clone the repository:
```bash
git clone https://github.com/TubalQ/aedelore-rpg-tools.git
cd aedelore-rpg-tools
```

2. Create and configure environment file:
```bash
cp .env.example .env
```

3. Edit `.env` and set your values:
```bash
# Generate secure passwords with:
openssl rand -base64 32 | tr -d '/+=' | head -c 40

# Required:
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgres://aedelore:your_secure_password@aedelore-proffs-db:5432/aedelore
CORS_ORIGIN=http://localhost:9020  # Your domain in production

# For password reset (optional but recommended):
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=your-app-password
SMTP_FROM=YourApp <your-email@example.com>
APP_URL=http://localhost:9020  # Your domain in production
```

4. Start the services:
```bash
docker compose up -d
```

5. Access the app at `http://localhost:9020`

### Configuration for Production

| File | What to change |
|------|----------------|
| `.env` | Set `CORS_ORIGIN` and `APP_URL` to your domain |
| `.env` | Configure SMTP for password reset emails |
| `html/manifest.json` | Update `name`, `short_name`, and `start_url` |
| `html/robots.txt` | Update sitemap URL |
| `html/sitemap.xml` | Update all URLs to your domain |
| `nginx.conf` | Set `set_real_ip_from` to your reverse proxy IP |

## Android App

The native Android app is currently under development. The `android/` directory contains a Kotlin/Jetpack Compose application that will provide a native mobile experience for Aedelore character sheets and campaign tools. It is not yet ready for use.

## Project Structure

```
aedelore-rpg-tools/
├── android/                # Native Android app (under development)
├── html/                   # Frontend PWA
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript modules
│   ├── data/              # Game data (weapons, spells, etc.)
│   ├── character-sheet.html
│   ├── dm-session.html
│   ├── reset-password.html
│   ├── manifest.json      # PWA manifest
│   └── service-worker.js  # Offline support
├── api/                    # Backend API
│   ├── server.js          # Express server
│   ├── db.js              # Database connection
│   └── email.js           # Email sending (password reset)
├── docs/                   # Documentation
├── compose.yml            # Docker Compose config
├── nginx.conf             # Web server config
└── .env.example           # Environment template
```

## API Endpoints

### Authentication
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Create account (requires email) |
| `/api/login` | POST | Authenticate user |
| `/api/logout` | POST | End session |
| `/api/forgot-password` | POST | Request password reset email |
| `/api/reset-password` | POST | Reset password with token |
| `/api/account/email` | PUT | Update account email |

### Characters
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/characters` | GET | List user's characters |
| `/api/characters` | POST | Create character |
| `/api/characters/:id` | GET | Load character |
| `/api/characters/:id` | PUT | Update character |
| `/api/characters/:id` | DELETE | Soft delete character |

### Campaigns & Sessions
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/campaigns` | GET/POST | List/create campaigns |
| `/api/campaigns/:id` | GET/PUT/DELETE | Manage campaign |
| `/api/campaigns/:id/sessions` | GET/POST | List/create sessions |
| `/api/sessions/:id` | GET/PUT/DELETE | Manage session |

### DM Tools
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/dm/characters/:id/give-xp` | POST | Award XP to player |
| `/api/dm/characters/:id/give-item` | POST | Give item to player |
| `/api/dm/characters/:id/unlock` | POST | Unlock character sections |

## Documentation

For detailed technical documentation including architecture, API endpoints, database schema, and development guides, see [docs/DEVELOPER.md](docs/DEVELOPER.md).

## Development

Want to see what we're currently working on? Check out the [development repository](https://github.com/TubalQ/aedelore-rpg-tool-development-suite) for upcoming features, testing, and experimental changes.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License with Attribution - see the [LICENSE](LICENSE) file for details.

**You are free to use, modify, and distribute this software, but you must give appropriate credit to Aedelore and TubalQ as the original creators.**

## Credits

Created by **TubalQ** for the **Aedelore** RPG system.

- Website: [https://aedelore.nu](https://aedelore.nu)
- GitHub: [@TubalQ](https://github.com/TubalQ)
