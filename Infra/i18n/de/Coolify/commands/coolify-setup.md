---
description: Initialize project for Coolify deployment
argument-hint: [arguments]
---

# Coolify-Einrichtung

Du bist ein Coolify-Deployment-Spezialist. Du musst das Projekt analysieren und fur das Deployment auf einer Coolify Self-Hosted-PaaS-Instanz vorbereiten.

## Argumente
$ARGUMENTS

Argumente:
- Projektbeschreibung oder Pfad
- (Optional) Ziel-Build-Pack: nixpacks, dockerfile, compose
- (Optional) Benotigte Services: postgres, redis, mysql, mongodb

Beispiel: `/coolify:setup "Node.js API mit PostgreSQL und Redis"` oder `/coolify:setup . buildpack:dockerfile services:postgres,redis`

## MISSION

### Schritt 1: Projekt-Stack analysieren

```bash
# Projekttyp erkennen
ls -la package.json composer.json requirements.txt go.mod Cargo.toml Gemfile *.csproj 2>/dev/null

# Vorhandene Docker-Dateien prufen
ls -la Dockerfile* docker-compose*.yml .dockerignore nixpacks.toml 2>/dev/null

# Umgebungskonfiguration prufen
ls -la .env .env.example .env.local 2>/dev/null

# Services aus dem Code identifizieren
grep -r "DATABASE_URL\|REDIS_URL\|MONGODB_URI\|MYSQL_" .env* 2>/dev/null
```

```
══════════════════════════════════════════════════════════════
COOLIFY PROJEKT-EINRICHTUNG
══════════════════════════════════════════════════════════════

Projekt: {name}
Pfad: {pfad}

──────────────────────────────────────────────────────────────
STACK-ERKENNUNG
──────────────────────────────────────────────────────────────

| Komponente | Erkannt | Version |
|------------|---------|---------|
| Sprache | {sprache} | {version} |
| Framework | {framework} | {version} |
| Paketmanager | {npm/yarn/pnpm/composer/pip} | {version} |

| Service | Erkannt | Quelle |
|---------|---------|--------|
| {datenbank} | {ja/nein} | {Umgebungsvariable / Konfigurationsdatei} |
| {cache} | {ja/nein} | {Umgebungsvariable / Konfigurationsdatei} |
| {queue} | {ja/nein} | {Umgebungsvariable / Konfigurationsdatei} |
```

### Schritt 2: Build-Pack empfehlen

```
──────────────────────────────────────────────────────────────
BUILD-PACK-EMPFEHLUNG
──────────────────────────────────────────────────────────────

Empfohlen: {Nixpacks / Dockerfile / Docker Compose}

Begrundung:
- {Grund 1}
- {Grund 2}

| Build Pack | Vorteile | Nachteile |
|------------|----------|-----------|
| Nixpacks | Zero-Config, Auto-Erkennung | Weniger Kontrolle |
| Dockerfile | Volle Kontrolle, reproduzierbar | Manuelle Konfiguration |
| Docker Compose | Multi-Service, bestehendes Setup | Komplexer |

Ausgewahlt: {Build-Pack}
```

### Schritt 3: Konfiguration generieren/validieren

Fur Nixpacks:
```toml
# nixpacks.toml (falls Anpassung notig)
[phases.setup]
nixPkgs = ["..."]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

Fur Dockerfile (falls nicht vorhanden):
```dockerfile
# Passendes Dockerfile basierend auf erkanntem Stack generieren
# Multi-Stage-Build optimiert fur Coolify-Deployment
```

Fur Docker Compose (Bestehendes validieren):
```yaml
# docker-compose.yml auf Coolify-Kompatibilitat validieren
# Port-Konflikte, Volume-Definitionen, Netzwerk-Konfiguration prufen
```

### Schritt 4: Umgebungsvorlage erstellen

```
──────────────────────────────────────────────────────────────
UMGEBUNGSVARIABLEN
──────────────────────────────────────────────────────────────
```

`.env.coolify`-Vorlage generieren:
```bash
# =============================================================================
# Coolify Umgebungsvariablen-Vorlage
# =============================================================================
# Diese Variablen in die Coolify-Service-Konfiguration kopieren
# Dashboard > Service > Environment Variables

# Anwendung
NODE_ENV=production
APP_URL=https://{ihre-domain}
PORT=3000

# Datenbank (Coolify-verwaltete PostgreSQL verwenden)
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${SERVICE_URL_POSTGRES}:5432/${POSTGRES_DB}

# Cache (Coolify-verwaltete Redis verwenden)
REDIS_URL=redis://${SERVICE_URL_REDIS}:6379

# Secrets (eindeutige Werte generieren)
SECRET_KEY={generieren-mit: openssl rand -hex 32}
JWT_SECRET={generieren-mit: openssl rand -hex 64}

# Externe Services (nach Bedarf konfigurieren)
# SMTP_HOST=
# SMTP_PORT=587
# S3_ENDPOINT=
# S3_BUCKET=
```

### Schritt 5: Deployment-Checkliste generieren

```
──────────────────────────────────────────────────────────────
DEPLOYMENT-CHECKLISTE
──────────────────────────────────────────────────────────────

### Server-Voraussetzungen
- [ ] VPS bereitgestellt (min. 4 GB RAM, 2 vCPU, 50 GB SSD)
- [ ] Coolify installiert: curl -fsSL https://cdn.coolify.io/install.sh | bash
- [ ] Firewall konfiguriert: Ports 22, 80, 443 offen
- [ ] SSH-Schlussel-basierte Authentifizierung aktiviert

### DNS-Konfiguration
- [ ] A-Record: {domain} → {server-ip}
- [ ] (Optional) Wildcard: *.{domain} → {server-ip}
- [ ] DNS-Propagierung verifiziert: dig +short {domain}

### Coolify-Konfiguration
- [ ] Git-Quelle verbunden (GitHub App / Deploy Key)
- [ ] Projekt im Coolify-Dashboard erstellt
- [ ] Umgebung erstellt (production/staging)
- [ ] Anwendungs-Service hinzugefugt

### Service-Konfiguration
- [ ] Build-Pack ausgewahlt: {empfehlung}
- [ ] Build-/Start-Befehle verifiziert
- [ ] Port konfiguriert: {port}
- [ ] Umgebungsvariablen gesetzt
- [ ] Domain mit SSL konfiguriert
- [ ] Health-Check-Endpunkt: /health

### Datenbank-Einrichtung (falls zutreffend)
- [ ] Datenbank-Service in Coolify erstellt
- [ ] Verbindungs-URL in Umgebungsvariablen gesetzt
- [ ] Initiale Migration/Seed bereit
- [ ] Backup-Zeitplan konfiguriert

### Nach dem Deploy
- [ ] Health Check antwortet
- [ ] SSL-Zertifikat gultig
- [ ] Anwendung funktional
- [ ] Monitoring konfiguriert
```

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
EINRICHTUNGSBERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ERSTELLTE/VERIFIZIERTE DATEIEN
──────────────────────────────────────────────────────────────

| Datei | Status | Beschreibung |
|-------|--------|-------------|
| {datei} | {erstellt/verifiziert/geandert} | {beschreibung} |

──────────────────────────────────────────────────────────────
NACHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] .env.coolify uberprufent und Produktionswerte setzen
2. [ ] Server-Voraussetzungen-Checkliste abschliessen
3. [ ] DNS-Eintrage konfigurieren
4. [ ] Mit /coolify:deploy deployen
5. [ ] Backups mit /coolify:backup konfigurieren
```
