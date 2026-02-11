# Traefik Setup för Aedelore

Instruktioner för att konfigurera Traefik som reverse proxy för aedelore.nu.

---

## Arkitektur

```
Internet → Traefik (extern VM) → nginx (Docker) → API/Static files
                ↓
         TLS termination
         Security headers
         Load balancing
```

---

## 1. Traefik Router Configuration

### docker-compose.yml (Traefik-sidan)

```yaml
services:
  traefik:
    image: traefik:v3.0
    command:
      - "--api.dashboard=true"
      - "--providers.docker=true"
      - "--providers.docker.exposedbydefault=false"
      - "--providers.file.directory=/etc/traefik/dynamic"
      - "--entrypoints.web.address=:80"
      - "--entrypoints.websecure.address=:443"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge=true"
      - "--certificatesresolvers.letsencrypt.acme.httpchallenge.entrypoint=web"
      - "--certificatesresolvers.letsencrypt.acme.email=your-email@example.com"
      - "--certificatesresolvers.letsencrypt.acme.storage=/letsencrypt/acme.json"
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./letsencrypt:/letsencrypt
      - ./dynamic:/etc/traefik/dynamic
```

### dynamic/aedelore.yml

```yaml
http:
  routers:
    aedelore:
      rule: "Host(`aedelore.nu`)"
      entryPoints:
        - websecure
      service: aedelore-service
      middlewares:
        - aedelore-headers
        - aedelore-compress
      tls:
        certResolver: letsencrypt

    aedelore-http:
      rule: "Host(`aedelore.nu`)"
      entryPoints:
        - web
      middlewares:
        - redirect-to-https
      service: aedelore-service

  services:
    aedelore-service:
      loadBalancer:
        servers:
          - url: "http://AEDELORE_SERVER_IP:9020"
        healthCheck:
          path: /
          interval: "30s"
          timeout: "5s"

  middlewares:
    redirect-to-https:
      redirectScheme:
        scheme: https
        permanent: true

    aedelore-compress:
      compress:
        excludedContentTypes:
          - text/event-stream

    aedelore-headers:
      headers:
        # HSTS
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        stsPreload: true

        # Security
        frameDeny: false
        customFrameOptionsValue: "SAMEORIGIN"
        contentTypeNosniff: true
        browserXssFilter: true

        # Referrer
        referrerPolicy: "strict-origin-when-cross-origin"

        # Permissions
        permissionsPolicy: "camera=(), microphone=(), geolocation=(), payment=()"

        # CSP - matchar nginx.conf
        customResponseHeaders:
          Content-Security-Policy: "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'self';"
```

---

## 2. Viktiga punkter

### Real IP Forwarding

Traefik måste skicka klientens riktiga IP till nginx. Detta görs automatiskt via `X-Forwarded-For` header.

I nginx.conf (redan konfigurerat):
```nginx
set_real_ip_from 172.18.0.1;  # Ändra till Traefik's IP
real_ip_header X-Forwarded-For;
real_ip_recursive on;
```

**VIKTIGT:** Uppdatera `set_real_ip_from` till Traefik-serverns IP-adress.

### Dubbletter av Headers

Om både Traefik OCH nginx sätter samma headers kan det bli problem. Två alternativ:

**Alternativ A: Låt nginx hantera allt (rekommenderat)**
```yaml
# I Traefik - ta bort header-middleware
middlewares:
  - aedelore-compress
  # INTE aedelore-headers
```

**Alternativ B: Låt Traefik hantera allt**
```nginx
# I nginx.conf - ta bort security headers
# add_header X-Frame-Options ...
# add_header X-Content-Type-Options ...
# etc.
```

---

## 3. Statiska filer som måste fungera

Dessa URLs måste returnera HTTP 200:

| URL | Content-Type | Beskrivning |
|-----|--------------|-------------|
| `/robots.txt` | text/plain | Crawler-regler |
| `/sitemap.xml` | text/xml | SEO sitemap |
| `/favicon.ico` | image/svg+xml | Favicon |
| `/manifest.json` | application/json | PWA manifest |
| `/icons/icon.svg` | image/svg+xml | App-ikon |
| `/icons/icon-32.png` | image/png | Favicon 32x32 |
| `/icons/apple-touch-icon.png` | image/png | iOS ikon |

### Testa från Traefik-servern:
```bash
curl -I https://aedelore.nu/robots.txt
curl -I https://aedelore.nu/sitemap.xml
curl -I https://aedelore.nu/favicon.ico
curl -I https://aedelore.nu/manifest.json
```

---

## 4. Rate Limiting (valfritt)

Om du vill ha rate limiting i Traefik (utöver nginx):

```yaml
middlewares:
  aedelore-ratelimit:
    rateLimit:
      average: 100
      burst: 200
      period: 1s
      sourceCriterion:
        ipStrategy:
          depth: 1
```

**OBS:** nginx har redan rate limiting konfigurerat. Använd endast ett lager.

---

## 5. Health Check

Traefik kan övervaka att aedelore är uppe:

```yaml
services:
  aedelore-service:
    loadBalancer:
      servers:
        - url: "http://AEDELORE_SERVER_IP:9020"
      healthCheck:
        path: /
        interval: "30s"
        timeout: "5s"
        headers:
          Host: aedelore.nu
```

---

## 6. Felsökning

### Problem: Headers dupliceras
**Symptom:** `Strict-Transport-Security` visas två gånger
**Lösning:** Ta bort headers från antingen Traefik eller nginx

### Problem: Real IP är fel
**Symptom:** Rate limiting blockerar alla från samma IP
**Lösning:** Uppdatera `set_real_ip_from` i nginx.conf till Traefik's IP

### Problem: Favicon returnerar 404
**Symptom:** Webbläsare visar ingen favicon
**Lösning:** Verifiera att nginx-containern har startats om efter config-ändring:
```bash
docker compose restart aedelore-proffs-web
```

### Problem: CORS-fel
**Symptom:** API-anrop blockeras
**Lösning:** CSP är konfigurerad för `connect-src 'self'`. Om du behöver externa API:er, uppdatera CSP.

---

## 7. Komplett checklista

- [ ] Traefik router pekar på rätt IP:port (9020)
- [ ] TLS-certifikat fungerar (Let's Encrypt)
- [ ] HTTP → HTTPS redirect aktivt
- [ ] Real IP forwarding konfigurerat
- [ ] Security headers (välj Traefik ELLER nginx, inte båda)
- [ ] Compression aktivt
- [ ] Health check konfigurerat
- [ ] Testa alla statiska filer (robots.txt, sitemap.xml, favicon.ico)
- [ ] Testa API: `curl https://aedelore.nu/api/me`

---

## 8. Exempel: Minimal Traefik-config

Om du bara vill ha basic routing utan extra headers (låt nginx hantera allt):

```yaml
http:
  routers:
    aedelore:
      rule: "Host(`aedelore.nu`)"
      entryPoints:
        - websecure
      service: aedelore-service
      tls:
        certResolver: letsencrypt

    aedelore-http:
      rule: "Host(`aedelore.nu`)"
      entryPoints:
        - web
      middlewares:
        - redirect-to-https
      service: aedelore-service

  services:
    aedelore-service:
      loadBalancer:
        servers:
          - url: "http://AEDELORE_SERVER_IP:9020"

  middlewares:
    redirect-to-https:
      redirectScheme:
        scheme: https
        permanent: true
```

Detta ger:
- TLS termination
- HTTP → HTTPS redirect
- All trafik vidarebefordras till nginx
- nginx hanterar alla security headers
