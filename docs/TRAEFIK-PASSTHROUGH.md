# Traefik Passthrough för Aedelore

Traefik måste vidarebefordra följande till aedelore.nu (port 9020) för att allt ska fungera.

---

## URLs som MÅSTE passera genom

### Kritiska för SEO/Crawlers

| Path | Syfte |
|------|-------|
| `/robots.txt` | Google/Bing crawler-regler |
| `/sitemap.xml` | SEO sitemap med alla sidor |
| `/favicon.ico` | Webbläsare frågar automatiskt |

### Kritiska för PWA/Mobil

| Path | Syfte |
|------|-------|
| `/manifest.json` | PWA installation |
| `/service-worker.js` | Offline-funktionalitet |
| `/icons/*` | App-ikoner (icon.svg, icon-32.png, apple-touch-icon.png) |

### Statiska resurser

| Path | Syfte |
|------|-------|
| `/css/*` | Stilmallar |
| `/js/*` | JavaScript |
| `/fonts/*` | Typsnitt |
| `/uploads/*` | Bilder |
| `/data/*` | Speldata |

### Sidor

| Path | Syfte |
|------|-------|
| `/` | Startsida |
| `/character-sheet` | Karaktärsblad (PWA) |
| `/dm-session` | DM-verktyg |
| `/wiki` | Wiki |
| `/reset-password` | Lösenordsåterställning |

### API

| Path | Syfte |
|------|-------|
| `/api/*` | Alla API-anrop |

---

## Traefik-regel

En enda regel räcker - vidarebefordra ALLT till nginx:

```yaml
http:
  routers:
    aedelore:
      rule: "Host(`aedelore.nu`)"
      service: aedelore
      tls:
        certResolver: letsencrypt

  services:
    aedelore:
      loadBalancer:
        servers:
          - url: "http://AEDELORE_IP:9020"
```

**Ingen path-filtrering behövs** - nginx hanterar all routing.

---

## Headers som Traefik INTE ska ändra

Nginx sätter dessa headers. Traefik ska INTE överskriva dem:

- `Content-Security-Policy`
- `Strict-Transport-Security`
- `X-Frame-Options`
- `X-Content-Type-Options`
- `Referrer-Policy`
- `Permissions-Policy`

**Rekommendation:** Använd INTE header-middleware i Traefik för aedelore.nu.

---

## Headers som Traefik MÅSTE skicka

Traefik måste vidarebefordra klientens IP:

```
X-Forwarded-For: <client-ip>
X-Forwarded-Proto: https
X-Real-IP: <client-ip>
```

Detta är standard i Traefik och kräver ingen extra konfiguration.

---

## Verifiera att allt fungerar

```bash
# SEO-filer
curl -I https://aedelore.nu/robots.txt      # Ska ge 200
curl -I https://aedelore.nu/sitemap.xml     # Ska ge 200
curl -I https://aedelore.nu/favicon.ico     # Ska ge 200

# PWA-filer
curl -I https://aedelore.nu/manifest.json   # Ska ge 200
curl -I https://aedelore.nu/icons/icon.svg  # Ska ge 200

# API
curl -I https://aedelore.nu/api/me          # Ska ge 401 (unauthorized)

# Sidor
curl -I https://aedelore.nu/                # Ska ge 200
curl -I https://aedelore.nu/wiki            # Ska ge 200
```

---

## Sammanfattning

| Vad | Traefik ska göra |
|-----|------------------|
| Routing | Vidarebefordra ALL trafik för `aedelore.nu` till port 9020 |
| TLS | Terminera HTTPS (Let's Encrypt) |
| Headers | INTE sätta egna security headers |
| IP | Skicka `X-Forwarded-For` (standard) |
