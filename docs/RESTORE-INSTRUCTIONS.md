# Aedelore Migration - Restore Instructions

> Migration date: 2026-01-20
> Source server: Original Aedelore server
> This file contains all instructions needed to restore Aedelore on a new server.

---

## Quick Overview

**What's included:**
- Full codebase (web, API, mobile apps)
- PostgreSQL database backup (15 users, 5 characters, 5 campaigns, 4 sessions)
- Docker configuration
- Android SDK & Gradle for mobile app builds
- All configuration files

**Services:**
- Web frontend (nginx) - Port 9020
- Node.js API - Port 3000 (internal)
- PostgreSQL database - Port 5432 (internal)

---

## Prerequisites on New Server

```bash
# Required software
- Docker & Docker Compose
- Git (optional, for future development)

# Verify Docker is installed
docker --version
docker compose version
```

---

## Step 1: Copy Files to New Server

```bash
# Create target directory
sudo mkdir -p /opt/aedelore

# Copy from USB (adjust mount point as needed)
sudo cp -r /mnt/usb/aedelore-migration/* /opt/aedelore/
sudo cp -r /mnt/usb/aedelore-migration/.env /opt/aedelore/
sudo cp -r /mnt/usb/aedelore-migration/.claude /opt/aedelore/

# Verify
ls -la /opt/aedelore/
```

---

## Step 2: Start Docker Containers

```bash
cd /opt/aedelore

# Start all services (database first, then API, then web)
docker compose up -d

# Verify all containers are running
docker ps

# Expected output:
# aedelore-proffs-db    - healthy
# aedelore-proffs-api   - running
# aedelore-proffs-web   - running (port 9020)
```

---

## Step 3: Restore Database

The database container starts empty. Restore from backup:

```bash
# Wait for database to be healthy (check status)
docker ps

# Restore the database from backup
docker exec -i aedelore-proffs-db psql -U aedelore -d aedelore < /opt/aedelore/backups/database-backup.sql

# Verify restoration
docker exec aedelore-proffs-db psql -U aedelore -d aedelore -c "\dt"

# Expected tables:
# - users (15 rows)
# - characters (5 rows)
# - campaigns (5 rows)
# - sessions (4 rows)
# - auth_tokens

# Verify row counts
docker exec aedelore-proffs-db psql -U aedelore -d aedelore -c "SELECT 'users' as table_name, COUNT(*) FROM users UNION ALL SELECT 'characters', COUNT(*) FROM characters UNION ALL SELECT 'campaigns', COUNT(*) FROM campaigns UNION ALL SELECT 'sessions', COUNT(*) FROM sessions;"
```

---

## Step 4: Verify Services

```bash
# Test API health
curl http://localhost:9020/api/health 2>/dev/null || curl http://localhost:9020/api/me

# Test web frontend
curl -I http://localhost:9020/

# Open in browser
# http://SERVER_IP:9020/              - Landing page
# http://SERVER_IP:9020/character-sheet - Character sheet
# http://SERVER_IP:9020/dm-session      - DM Session tool
```

---

## Step 5: Configure External Access (Optional)

If you need external access via domain (aedelore.nu):

### Option A: Cloudflare Tunnel (Recommended)
```bash
# Install cloudflared and create tunnel pointing to localhost:9020
```

### Option B: Reverse Proxy (nginx/Traefik)
```bash
# Configure reverse proxy to forward aedelore.nu -> localhost:9020
# Ensure SSL termination is handled
```

### Option C: Direct port exposure
```bash
# Edit compose.yml to change port if needed:
# ports:
#   - "80:80"   # Instead of 9020:80
```

---

## Directory Structure

```
/opt/aedelore/
├── api/                    # Node.js Backend API
│   ├── server.js           # Main server (Express)
│   ├── db.js               # PostgreSQL connection
│   ├── Dockerfile          # API container build
│   └── package.json        # Dependencies
│
├── html/                   # Web Frontend (nginx served)
│   ├── index.html          # Landing page
│   ├── character-sheet.html
│   ├── dm-session.html
│   ├── js/                 # JavaScript files
│   ├── css/                # Stylesheets
│   └── data/               # Game data (weapons, spells, etc.)
│
├── backups/                # Backups (secure, chmod 600)
│   └── 2026-01-21-kmp-app/ # Old mobile app backup
│
├── Claude/                 # Claude AI documentation
│   ├── INDEX.md            # Project index
│   └── MEMORY.md           # Project memory
│
├── data/                   # Game documentation
├── docs/                   # Project documentation
├── scripts/                # Utility scripts
│
├── compose.yml             # Docker Compose config
├── nginx.conf              # Nginx configuration
├── .env                    # Environment variables (DB credentials)
│
├── backups/                # Database backups (chmod 600)
│   └── database-backup.sql # Full database backup
└── database-schema.sql     # Schema only backup
```

---

## Configuration Files

### .env (Database Credentials)

**IMPORTANT:** Generate new secure passwords before production use!

```bash
# Copy template and edit with your passwords
cp .env.example .env

# Generate secure passwords:
# openssl rand -base64 32 | tr -d '/+=' | head -c 40

# Required variables:
POSTGRES_DB=aedelore
POSTGRES_USER=aedelore
POSTGRES_PASSWORD=<GENERATE_SECURE_PASSWORD>
DATABASE_URL=postgres://aedelore:<SAME_PASSWORD>@aedelore-proffs-db:5432/aedelore
CORS_ORIGIN=https://aedelore.nu

# For Umami analytics (optional):
UMAMI_DB_PASSWORD=<GENERATE_SECURE_PASSWORD>
UMAMI_APP_SECRET=<GENERATE_SECURE_HEX_32>
```

### Docker Images Used
- `postgres:16-alpine` - PostgreSQL database
- `nginx:alpine` - Web server
- `node:20-alpine` - API base (built locally from ./api)

---

## Mobile App (PWA)

The character sheet is now a Progressive Web App (PWA) - no separate mobile app build needed.

**Users can install it:**
- Android: Browser menu → "Add to Home Screen"
- iOS: Share → "Add to Home Screen"
- Desktop: Browser install prompt or menu

**PWA files:**
- `/html/manifest.json` - App manifest
- `/html/service-worker.js` - Offline caching
- `/html/icons/` - App icons

---

## Common Operations

### Rebuild API after code changes
```bash
docker compose build --no-cache aedelore-proffs-api
docker compose up -d aedelore-proffs-api
```

### View logs
```bash
docker compose logs -f                    # All services
docker compose logs -f aedelore-proffs-api # API only
```

### Access database directly
```bash
docker exec -it aedelore-proffs-db psql -U aedelore -d aedelore
```

### Stop all services
```bash
docker compose down
```

### Stop and remove volumes (DESTRUCTIVE)
```bash
docker compose down -v
```

---

## Troubleshooting

### API won't start
```bash
# Check logs
docker compose logs aedelore-proffs-api

# Common issue: Database not ready
# Solution: Wait for db to be healthy, then restart API
docker compose restart aedelore-proffs-api
```

### Database connection errors
```bash
# Verify database is healthy
docker exec aedelore-proffs-db pg_isready -U aedelore -d aedelore

# Check DATABASE_URL in .env matches compose.yml service name
```

### Port 9020 already in use
```bash
# Find what's using it
sudo lsof -i :9020

# Or change port in compose.yml:
# ports:
#   - "9021:80"
```

### Web pages not loading CSS/JS
```bash
# Check nginx logs
docker compose logs aedelore-proffs-web

# Verify html directory is mounted correctly
docker exec aedelore-proffs-web ls -la /usr/share/nginx/html/
```

---

## API Endpoints Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/register` | POST | Create account |
| `/api/login` | POST | Login, get token |
| `/api/logout` | POST | Logout |
| `/api/me` | GET | Get user profile |
| `/api/characters` | GET/POST | List/create characters |
| `/api/characters/:id` | GET/PUT/DELETE | Single character |
| `/api/campaigns` | GET/POST | List/create campaigns |
| `/api/campaigns/:id` | GET/PUT/DELETE | Single campaign |
| `/api/campaigns/:id/sessions` | GET/POST | Campaign sessions |
| `/api/sessions/:id` | GET/PUT/DELETE | Single session |

---

## Security Notes

- **CRITICAL:** Change ALL passwords in .env before production use
- Set file permissions: `chmod 600 .env compose.yml nginx.conf`
- Update CORS_ORIGIN to match new domain if different
- Ensure firewall only exposes necessary ports
- Database port (5432) should NOT be exposed externally
- Never commit .env to version control (see .gitignore)
- Database backups are stored in `/opt/aedelore/backups/` with restricted access
- See `/opt/aedelore/docs/SECURITY-RECOMMENDATIONS.md` for full security guidance

---

## Backup Commands (for future use)

```bash
# Export database
docker exec aedelore-proffs-db pg_dump -U aedelore -d aedelore > backup-$(date +%Y%m%d).sql

# Export schema only
docker exec aedelore-proffs-db pg_dump -U aedelore -d aedelore --schema-only > schema-$(date +%Y%m%d).sql
```

---

## Contact / Support

This restoration guide was created by Claude AI during migration on 2026-01-20.
For project documentation, see `/opt/aedelore/Claude/INDEX.md`
