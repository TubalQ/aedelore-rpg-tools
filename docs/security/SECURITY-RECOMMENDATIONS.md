# Aedelore - Säkerhetsrekommendationer

Senast uppdaterad: 2026-01-21 (efter fullständig säkerhetsaudit)

---

## Implementerade säkerhetsåtgärder

Följande har redan implementerats:

| Åtgärd | Status |
|--------|--------|
| Kryptografiskt säker token-generering (crypto.randomBytes) | ✅ |
| bcrypt lösenordshashning (10 rounds) | ✅ |
| Parameteriserade SQL-queries (pg) | ✅ |
| Rate limiting på auth-endpoints | ✅ |
| Account lockout efter 5 misslyckade försök | ✅ |
| CORS begränsad till explicit origin | ✅ |
| Helmet.js security headers | ✅ |
| 24-timmars token-expiry | ✅ |
| Input-validering (username/password) | ✅ |
| Filrättigheter på känsliga filer (chmod 600) | ✅ |
| .gitignore för att skydda .env | ✅ |

---

## Kvarstående rekommendationer

### Prioritet 1: Hög risk (bör åtgärdas)

#### 1. Ersätt eval() med säker expression parser

**Fil:** `html/js/system-selector.js` (rad 416-445)

**Problem:** `eval()` används för formelberäkning, vilket möjliggör kodinjection.

**Lösning:**
```bash
npm install mathjs
```

```javascript
// Ersätt:
return eval(expression);

// Med:
import { evaluate } from 'mathjs';
return evaluate(expression);
```

**Risk:** Kan bryta befintliga formler - testa noggrant.

#### 2. Migrera auth-token till HttpOnly cookies

**Problem:** Token lagras i localStorage, sårbart för XSS.

**Lösning (backend):**
```javascript
// Vid login, sätt cookie istället för att returnera token:
res.cookie('auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000
});
```

**Lösning (frontend):**
```javascript
// Ta bort localStorage-användning för token
// Cookies skickas automatiskt med credentials: 'include'
fetch('/api/me', { credentials: 'include' });
```

**Risk:** Kräver ändringar i både backend och frontend.

#### 3. Implementera CSRF-skydd

**Lösning:**
```javascript
// Backend: Generera CSRF-token
const csrfToken = crypto.randomBytes(32).toString('hex');

// Frontend: Skicka med varje state-changing request
headers: { 'X-CSRF-Token': csrfToken }
```

### Prioritet 2: Medium risk (bör planeras)

#### 4. Ta bort unsafe-inline från CSP

**Fil:** `nginx.conf`

**Nuvarande:**
```
script-src 'self' 'unsafe-inline';
```

**Rekommenderad:**
```
script-src 'self' 'nonce-<random>';
```

**Kräver:** Refaktorering av alla inline onclick-handlers till addEventListener.

#### 5. Kortare token-livstid med refresh tokens

**Rekommenderad arkitektur:**
- Access token: 15 minuter
- Refresh token: 7 dagar (lagras i HttpOnly cookie)
- Automatisk refresh vid utgång

#### 6. Flytta account lockout till databas

**Problem:** In-memory lockout försvinner vid omstart.

**Lösning:**
```sql
CREATE TABLE login_attempts (
    username VARCHAR(50),
    attempts INT DEFAULT 0,
    last_attempt TIMESTAMP,
    locked_until TIMESTAMP
);
```

### Prioritet 3: Låg risk (för framtida härdning)

- Implementera audit logging för känsliga operationer
- Lägg till Web Application Firewall (WAF)
- Implementera Content Security Policy reporting
- Skanna npm-beroenden regelbundet med `npm audit`
- Uppdatera Docker images regelbundet

---

## Filskydd

Känsliga filer ska ha restriktiva rättigheter:

```bash
chmod 600 /opt/aedelore/.env
chmod 600 /opt/aedelore/compose.yml
chmod 600 /opt/aedelore/nginx.conf
chmod 600 /opt/aedelore/backups/*.sql
```

---

## Lösenordsrotation

Vid misstänkt kompromittering:

```bash
# 1. Generera nya lösenord
NEW_PG_PASS=$(openssl rand -base64 32 | tr -d '/+=' | head -c 40)
NEW_UMAMI_PASS=$(openssl rand -hex 32)
NEW_UMAMI_SECRET=$(openssl rand -hex 32)

# 2. Uppdatera i körande databas FÖRST
docker exec aedelore-proffs-db psql -U aedelore -d aedelore -c "ALTER ROLE aedelore WITH PASSWORD '$NEW_PG_PASS';"

# 3. Uppdatera .env med nya värden

# 4. Starta om containers
docker compose up -d
```

---

## Säkerhetsaudit-historik

| Datum | Typ | Fynd | Status |
|-------|-----|------|--------|
| 2026-01-19 | Initial audit | XSS i character list, CSP headers | Fixat |
| 2026-01-21 | Full audit | 8 kritiska, 16 höga | 5 kritiska fixade |

Se `/opt/aedelore/Claude/MEMORY.md` för detaljerad historik.

---

## Kontakt

Vid säkerhetsincidenter, se även:
- `/opt/aedelore/docs/SECURITY-AUDIT-2026-01-19.md`
- `/opt/aedelore/Claude/MEMORY.md`
