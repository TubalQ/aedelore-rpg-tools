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

3. Edit `.env` and set your own values:
```bash
# Generate secure passwords with:
openssl rand -base64 32 | tr -d '/+=' | head -c 40

# Required changes in .env:
POSTGRES_PASSWORD=your_secure_password_here
DATABASE_URL=postgres://aedelore:your_secure_password_here@aedelore-proffs-db:5432/aedelore
CORS_ORIGIN=http://localhost:9020   # Change to your domain in production
```

4. (Optional) Remove Umami analytics if not needed:

Comment out or delete the `aedelore-umami-db` and `aedelore-umami` services in `compose.yml` if you don't need analytics.

5. Start the services:
```bash
docker compose up -d
```

6. Access the app at `http://localhost:9020`

### Configuration for Production

If deploying to your own domain:

| File | What to change |
|------|----------------|
| `.env` | Set `CORS_ORIGIN` to your domain (e.g., `https://yourdomain.com`) |
| `html/manifest.json` | Update `name`, `short_name`, and `start_url` |
| `html/robots.txt` | Update sitemap URL |
| `html/sitemap.xml` | Update all URLs to your domain |
| `nginx.conf` | Adjust if needed for your setup |

### Verify Installation

After starting, check that all services are running:
```bash
docker compose ps
```

The database tables are created automatically when the API starts.

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
