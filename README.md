# Aedelore RPG Tools

A complete web-based toolkit for the Aedelore fantasy tabletop RPG system, featuring a Progressive Web App (PWA) character sheet and DM session management tools.

## Links

| | |
|---|---|
| **Main Site** | [aedelore.nu](https://aedelore.nu) |
| **Wiki** | [wiki.aedelore.nu](https://wiki.aedelore.nu) |
| **Character Sheet** | [aedelore.nu/character-sheet](https://aedelore.nu/character-sheet) |
| **DM Session Tools** | [aedelore.nu/dm-session](https://aedelore.nu/dm-session) |

## Features

### Character Sheet (PWA)
- Full character management with stats, skills, and inventory
- Works offline - install as an app on mobile or desktop
- Cloud sync across devices (optional account)
- Local browser storage for quick saves
- Export/import characters as JSON
- Multiple game system support (D&D 5e, Pathfinder 2e, Storyteller, Chronicles of Darkness)
- Integrated dice roller
- Quick actions for Rest, Half Rest, Heal, and Potions
- Customizable avatar (emoji or image upload)
- Multiple themes (Aedelore, Midnight Blue, Dark Glass, Ember)
- Print-friendly layout

### DM Session Tools
- Campaign and session management
- AI-assisted content generation (works with Claude and ChatGPT)
- Encounter builder with loot generation
- Session type configuration (Combat/Roleplay/Mixed)
- Session length planning (1-5 hours)
- Quick reference for game rules and data

## Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | Vanilla HTML/CSS/JavaScript (PWA) |
| Backend API | Node.js + Express |
| Database | PostgreSQL 16 |
| Web Server | nginx |
| Container | Docker Compose |

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/TubalQ/aedelore-rpg-tools.git
cd aedelore-rpg-tools
```

2. Copy environment template and configure:
```bash
cp .env.example .env
# Edit .env with your own secure passwords
```

3. Start the services:
```bash
docker compose up -d
```

4. Access the app at `http://localhost:9020`

## Project Structure

```
aedelore-rpg-tools/
├── html/                   # Frontend PWA
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript modules
│   ├── data/              # Game data (weapons, spells, etc.)
│   ├── character-sheet.html
│   ├── dm-session.html
│   ├── manifest.json      # PWA manifest
│   └── service-worker.js  # Offline support
├── api/                    # Backend API
│   ├── server.js          # Express server
│   └── db.js              # Database connection
├── db/                     # Database
│   └── schema.sql         # PostgreSQL schema
├── docs/                   # Documentation
├── compose.yml            # Docker Compose config
├── nginx.conf             # Web server config
└── .env.example           # Environment template
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Create new account |
| `/api/login` | POST | Authenticate user |
| `/api/logout` | POST | End session |
| `/api/characters` | GET | List user's characters |
| `/api/characters` | POST | Save character |
| `/api/characters/:id` | GET | Load character |
| `/api/characters/:id` | DELETE | Delete character |

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

This project is licensed under the MIT License with Attribution - see the [LICENSE](LICENSE) file for details.

**You are free to use, modify, and distribute this software, but you must give appropriate credit to Aedelore and TubalQ as the original creators.**

## Credits

Created by **TubalQ** for the **Aedelore** RPG system.

- Website: [https://aedelore.nu](https://aedelore.nu)
- GitHub: [@TubalQ](https://github.com/TubalQ)
