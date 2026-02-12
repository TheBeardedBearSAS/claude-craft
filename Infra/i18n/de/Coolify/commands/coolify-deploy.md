---
description: Deploy application to Coolify
argument-hint: [arguments]
---

# Coolify Deploy

Du bist ein Coolify-Deployment-Experte. Du musst das Deployment einer Anwendung auf einer Coolify Self-Hosted-PaaS-Instanz anleiten.

## Argumente
$ARGUMENTS

Argumente:
- Anwendungsname oder Repository
- (Optional) Umgebung: production, staging, preview
- (Optional) Branch: main, develop, feature/*

Beispiel: `/coolify:deploy "my-app" env:production branch:main` oder `/coolify:deploy . env:staging`

## MISSION

### Schritt 1: Voraussetzungen prufen

```
══════════════════════════════════════════════════════════════
COOLIFY DEPLOYMENT
══════════════════════════════════════════════════════════════

Anwendung: {name}
Umgebung: {production/staging/preview}
Branch: {branch}

──────────────────────────────────────────────────────────────
VORAUSSETZUNGSPRUFUNG
──────────────────────────────────────────────────────────────

| Voraussetzung | Status | Details |
|---------------|--------|---------|
| Coolify-Instanz | {OK/FEHLER} | {url} |
| Git-Provider | {OK/FEHLER} | {GitHub/GitLab/Bitbucket} |
| DNS-Eintrage | {OK/FEHLER} | {domain} → {ip} |
| SSL-Fahigkeit | {OK/FEHLER} | {Let's Encrypt / custom} |
| Build-Konfiguration | {OK/FEHLER} | {Nixpacks/Dockerfile/Compose} |
```

### Schritt 2: Git-Provider-Verbindung konfigurieren

```
──────────────────────────────────────────────────────────────
GIT-PROVIDER-EINRICHTUNG
──────────────────────────────────────────────────────────────

Provider: {GitHub / GitLab / Bitbucket}

### GitHub App (Empfohlen)
1. Coolify Dashboard > Sources > Add
2. "GitHub App" auswahlen
3. Coolify GitHub App autorisieren
4. Repositories fur Zugriff auswahlen
5. Webhook-Zustellung verifizieren: GitHub > Settings > GitHub Apps > Recent deliveries

### GitLab (Deploy Key)
1. Coolify Dashboard > Sources > Add
2. "GitLab" auswahlen
3. Generierten offentlichen SSH-Schlussel kopieren
4. GitLab > Repository > Settings > Repository > Deploy Keys > Add
5. Webhook konfigurieren:
   - URL: https://coolify.example.com/webhooks/source/gitlab
   - Secret: {aus Coolify}
   - Triggers: Push-Events, Merge-Request-Events

Status: {konfiguriert / Einrichtung notig}
```

### Schritt 3: Umgebungsvariablen setzen

```
──────────────────────────────────────────────────────────────
UMGEBUNGSVARIABLEN
──────────────────────────────────────────────────────────────

### Erforderliche Variablen
| Variable | Wert | Typ |
|----------|------|-----|
| {VAR_NAME} | {Wert oder Anweisung} | Build / Runtime |

### Datenbankverbindung
DATABASE_URL=postgresql://{user}:{password}@{host}:5432/{database}
→ Coolify-Service-Referenz verwenden: $SERVICE_URL_POSTGRES

### Cache-Verbindung
REDIS_URL=redis://{host}:6379
→ Coolify-Service-Referenz verwenden: $SERVICE_URL_REDIS

### Secrets
{SECRET_NAME}={Anweisung zur Generierung}
→ openssl rand -hex 32

### Gemeinsame Variablen (uber Umgebungen hinweg)
Konfigurieren unter: Settings > Shared Variables
```

### Schritt 4: Build-Pack wahlen und konfigurieren

```
──────────────────────────────────────────────────────────────
BUILD-KONFIGURATION
──────────────────────────────────────────────────────────────

Build Pack: {Nixpacks / Dockerfile / Docker Compose}

### Nixpacks-Konfiguration
| Einstellung | Wert |
|-------------|------|
| Base Directory | {/} |
| Build Command | {automatisch erkannt oder benutzerdefiniert} |
| Start Command | {automatisch erkannt oder benutzerdefiniert} |
| Install Command | {automatisch erkannt oder benutzerdefiniert} |
| Port | {automatisch erkannt oder benutzerdefiniert} |

### Dockerfile-Konfiguration
| Einstellung | Wert |
|-------------|------|
| Dockerfile Location | {./Dockerfile} |
| Build Target | {production} |
| Build Args | {KEY=value} |
| Port | {aus EXPOSE oder manuell} |

### Docker-Compose-Konfiguration
| Einstellung | Wert |
|-------------|------|
| Compose File | {./docker-compose.yml} |
| Services | {Liste der zu deployenden Services} |
```

### Schritt 5: Domain und SSL konfigurieren

```
──────────────────────────────────────────────────────────────
DOMAIN- & SSL-KONFIGURATION
──────────────────────────────────────────────────────────────

### Domain-Einrichtung
| Einstellung | Wert |
|-------------|------|
| Domain | {app.example.com} |
| HTTPS erzwingen | Ja |
| WWW-Weiterleitung | {Ja/Nein} |
| Port | {Anwendungsport} |

### SSL-Zertifikat
Methode: {Let's Encrypt HTTP / Let's Encrypt DNS / Custom}

Fur HTTP-Challenge (Standard):
- Automatisch, keine zusatzliche Konfiguration notig
- Port 80 muss erreichbar sein

Fur DNS-Challenge (Wildcard):
- Provider: {Cloudflare / DigitalOcean / Hetzner}
- API-Token: {in Coolify-Einstellungen konfiguriert}
- Wildcard-Domain: *.example.com

### Preview-Deployments (optional)
- Aktivieren: {Ja/Nein}
- Domain-Pattern: pr-{{PR_NUMBER}}.preview.example.com
- DNS: *.preview.example.com → {server-ip}
```

### Schritt 6: Deployment auslosen und verifizieren

```
──────────────────────────────────────────────────────────────
DEPLOYMENT
──────────────────────────────────────────────────────────────

### Deploy-Methode
Option A: Git Push (automatisch)
  git push origin {branch}
  → Webhook lost Coolify Build + Deploy aus

Option B: Manuell (Coolify-Dashboard)
  Dashboard > Service > Deploy

Option C: API
  curl -X POST https://coolify.example.com/api/v1/deploy \
    -H "Authorization: Bearer {api-token}" \
    -H "Content-Type: application/json" \
    -d '{"uuid": "{service-uuid}"}'

### Health-Verifizierung
# Auf Deployment-Abschluss warten
# Deployment-Logs im Coolify-Dashboard prufen

# Anwendungs-Health verifizieren
curl -s -o /dev/null -w "%{http_code}" https://{domain}/health

# SSL-Zertifikat verifizieren
openssl s_client -connect {domain}:443 -servername {domain} 2>/dev/null | \
  openssl x509 -noout -dates

# Schneller Smoke-Test
curl -s https://{domain}/
```

### Schritt 7: Abschlussbericht

```
══════════════════════════════════════════════════════════════
DEPLOYMENT-BERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
DEPLOYMENT-STATUS
──────────────────────────────────────────────────────────────

| Element | Status |
|---------|--------|
| Build | {ERFOLG / FEHLGESCHLAGEN} |
| Deploy | {ERFOLG / FEHLGESCHLAGEN} |
| Health Check | {BESTANDEN / FEHLGESCHLAGEN} |
| SSL | {GULTIG / UNGULTIG} |

──────────────────────────────────────────────────────────────
URLS
──────────────────────────────────────────────────────────────

| Umgebung | URL |
|----------|-----|
| Produktion | https://{domain} |
| Coolify-Dashboard | https://coolify.example.com |
| Deployment-Logs | https://coolify.example.com/project/... |

──────────────────────────────────────────────────────────────
ROLLBACK-ANWEISUNGEN
──────────────────────────────────────────────────────────────

Bei Problemen:
1. Dashboard > Service > Deployments
2. Vorheriges erfolgreiches Deployment auswahlen
3. "Rollback" klicken

Oder uber Git:
  git revert HEAD
  git push origin {branch}

──────────────────────────────────────────────────────────────
NACHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] Alle Endpunkte auf Funktionalitat prufen
2. [ ] Datenbank-Migrationen ausfuhren (falls zutreffend)
3. [ ] Monitoring mit /coolify:backup konfigurieren
4. [ ] Preview-Deployments einrichten (falls noch nicht geschehen)
5. [ ] Deployment im Projekt-README dokumentieren
```
