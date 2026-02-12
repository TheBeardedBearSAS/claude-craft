---
description: Optimize Coolify deployment
argument-hint: [arguments]
---

# Coolify-Optimierung

Du bist ein DevOps-Ingenieur mit Expertise in Coolify-Optimierung. Du musst die Build-Performance, Ressourcennutzung, das Monitoring und die allgemeine Infrastruktureffizienz fur Coolify-Deployments analysieren und verbessern.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Fokusbereich: build, resources, cleanup, network, all
- (Optional) Service-Name

Beispiel: `/coolify:optimize` oder `/coolify:optimize focus:build service:api` oder `/coolify:optimize focus:cleanup`

## MISSION

### Schritt 1: Aktuelle Ressourcennutzung analysieren

```bash
# Server-Ressourcen
free -h
df -h /var/lib/docker
nproc
uptime

# Docker-Ressourcennutzung pro Container
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"

# Docker-Festplattennutzung aufgeschlusselt
docker system df -v

# Anzahl Images, Container, Volumes
docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Active}}\t{{.Size}}\t{{.Reclaimable}}"
```

```
══════════════════════════════════════════════════════════════
COOLIFY OPTIMIERUNGSANALYSE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
AKTUELLE RESSOURCENNUTZUNG
──────────────────────────────────────────────────────────────

### Server-Ressourcen
| Ressource | Verwendet | Gesamt | Status |
|-----------|-----------|--------|--------|
| CPU | {nutzung}% | {kerne} Kerne | {OK/WARNUNG/KRITISCH} |
| RAM | {verwendet} | {gesamt} | {OK/WARNUNG/KRITISCH} |
| Festplatte | {verwendet} | {gesamt} | {OK/WARNUNG/KRITISCH} |
| Swap | {verwendet} | {gesamt} | {OK/WARNUNG/KRITISCH} |

### Docker-Ressourcen
| Typ | Anzahl | Aktiv | Grosse | Ruckgewinnbar |
|-----|--------|-------|--------|---------------|
| Images | {n} | {n} | {grosse} | {grosse} |
| Container | {n} | {n} | {grosse} | {grosse} |
| Volumes | {n} | {n} | {grosse} | {grosse} |
| Build Cache | - | - | {grosse} | {grosse} |

### Nutzung pro Service
| Service | CPU | Speicher | Netz-I/O | Block-I/O |
|---------|-----|----------|----------|-----------|
| {name} | {%} | {verwendet}/{limit} | {ein/aus} | {lesen/schreiben} |
```

### Schritt 2: Build-Performance optimieren

```
──────────────────────────────────────────────────────────────
BUILD-OPTIMIERUNG
──────────────────────────────────────────────────────────────

### Aktuelle Build-Performance
| Service | Build-Zeit | Image-Grosse | Methode |
|---------|-----------|-------------|---------|
| {name} | {dauer} | {grosse} | {Nixpacks/Dockerfile} |

### Empfehlungen

#### Nixpacks-Optimierung
| Optimierung | Auswirkung | Wie |
|-------------|-----------|-----|
| Abhangigkeiten cachen | Build -50% | Automatisch (Nixpacks cached Layers) |
| .nixpacks ignore | Build -20% | .nixpacks-Datei zum Ausschliessen von Dateien hinzufugen |
| Vorgefertigtes Image | Build -80% | Vorgefertigtes Docker-Image stattdessen verwenden |

#### Dockerfile-Optimierung
| Optimierung | Auswirkung | Wie |
|-------------|-----------|-----|
| Multi-Stage Build | Grosse -60% | Build- und Runtime-Stages trennen |
| Layer-Reihenfolge | Cache-Hit +50% | Abhangigkeiten vor Quellcode |
| .dockerignore | Kontext -70% | node_modules, .git, Tests ausschliessen |
| Alpine-Basis | Grosse -40% | -alpine Image-Varianten verwenden |
| BuildKit-Cache | Build -30% | --mount=type=cache fur Paketmanager |

#### Dedizierter Build-Server
| Vorteil | Beschreibung |
|---------|-------------|
| Keine Prod-Auswirkung | Builds verbrauchen keine Prod-Ressourcen |
| Schnellere Builds | Mehr CPU/RAM fur Builds dediziert |
| Parallele Builds | Mehrere Apps gleichzeitig bauen |

Konfiguration:
1. Coolify Dashboard > Servers > Add Server
2. Als "Build Server" in Server-Einstellungen setzen
3. Anwendungen werden auf diesem Server gebaut, auf Produktion deployt
```

### Schritt 3: Auto-Bereinigung konfigurieren

```
──────────────────────────────────────────────────────────────
AUTO-BEREINIGUNGS-KONFIGURATION
──────────────────────────────────────────────────────────────

### Coolify integrierte Bereinigung
Dashboard > Settings > Configuration:
- Ungenutzte Docker-Images loschen: {aktivieren}
- Bereinigungshaufigkeit: {taglich/wochentlich}

### Docker-Bereinigungs-Skript
\`\`\`bash
#!/bin/bash
# docker-cleanup.sh - Taglich uber Cron ausfuhren

# Gestoppte Container alter als 24h entfernen
docker container prune -f --filter "until=24h"

# Ungenutzte Images entfernen (von keinem Container verwendet)
docker image prune -af --filter "until=72h"

# Ungenutzte Volumes entfernen (WARNUNG: verifizieren, dass keine wichtigen Daten)
# docker volume prune -f

# Build-Cache alter als 7 Tage entfernen
docker builder prune -f --filter "until=168h"

# Bereinigungsergebnisse protokollieren
echo "$(date): Docker-Ressourcen bereinigt" >> /var/log/docker-cleanup.log
docker system df --format "table {{.Type}}\t{{.Size}}\t{{.Reclaimable}}"
\`\`\`

### Cron-Konfiguration
\`\`\`bash
# Zu Crontab hinzufugen: crontab -e
0 4 * * * /opt/scripts/docker-cleanup.sh >> /var/log/docker-cleanup.log 2>&1
\`\`\`

### Geschatzte Bereinigungsauswirkung
| Ressource | Aktuell | Nach Bereinigung | Einsparung |
|-----------|---------|------------------|-----------|
| Images | {grosse} | {geschatzt} | {gespart} |
| Build Cache | {grosse} | {geschatzt} | {gespart} |
| Container | {grosse} | {geschatzt} | {gespart} |
| Gesamt | {gesamt} | {geschatzt} | {gespart} |
```

### Schritt 4: Monitoring uberprufen und verbessern

```
──────────────────────────────────────────────────────────────
MONITORING-UBERPRUFUNG
──────────────────────────────────────────────────────────────

### Health-Check-Audit
| Service | Health Check | Intervall | Status |
|---------|-------------|----------|--------|
| {name} | {Pfad oder keiner} | {intervall} | {OK/FEHLEND/FEHLSCHLAGEND} |

### Empfohlene Health Checks
Fur jeden Service ohne Health Check:
\`\`\`
Service: {name}
Path: /health (oder /api/health, /healthz)
Interval: 30s
Timeout: 10s
Retries: 3
Start Period: 60s
\`\`\`

### Ressourcenlimits
| Service | Aktuelles Limit | Empfohlen | Begrundung |
|---------|----------------|-----------|-----------|
| {name} | {keins/aktuell} | {empfohlen} | {basierend auf Nutzung} |

### Alarm-Lucken
| Alarm | Status | Empfohlen |
|-------|--------|-----------|
| Container-Crash | {konfiguriert/fehlend} | Coolify-Benachrichtigung |
| Festplatte > 85% | {konfiguriert/fehlend} | Cron + Webhook |
| RAM > 90% | {konfiguriert/fehlend} | Cron + Webhook |
| Backup-Fehler | {konfiguriert/fehlend} | Coolify-Benachrichtigung |
| SSL-Ablauf | {konfiguriert/fehlend} | Uptime Kuma |
```

### Schritt 5: Netzwerk optimieren

```
──────────────────────────────────────────────────────────────
NETZWERK-OPTIMIERUNG
──────────────────────────────────────────────────────────────

### Traefik-Konfiguration
| Einstellung | Aktuell | Empfohlen |
|-------------|---------|-----------|
| Komprimierung | {ein/aus} | gzip/brotli aktivieren |
| Rate-Limiting | {ein/aus} | Fur offentliche APIs aktivieren |
| Verbindungslimits | {wert} | Basierend auf Traffic anpassen |
| Access-Logs | {ein/aus} | Zum Debuggen aktivieren |

### Komprimierungs-Konfiguration
\`\`\`yaml
# Traefik-Middleware fur Komprimierung
http:
  middlewares:
    compress:
      compress:
        excludedContentTypes:
          - "text/event-stream"
\`\`\`

### Sicherheits-Header
\`\`\`yaml
# Traefik-Middleware fur Sicherheits-Header
http:
  middlewares:
    security-headers:
      headers:
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        contentTypeNosniff: true
        frameDeny: true
        browserXssFilter: true
        referrerPolicy: "strict-origin-when-cross-origin"
\`\`\`

### DNS-Optimierung
| Einstellung | Aktuell | Empfohlen |
|-------------|---------|-----------|
| TTL | {wert} | 300s (Prod), 60s (wahrend Migration) |
| CDN | {keins/Cloudflare} | Cloudflare (kostenlose Stufe) fur statische Assets |
| Proxy | {direkt/proxied} | Cloudflare-Proxy fur DDoS-Schutz |
```

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
OPTIMIERUNGSBERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ANGEWANDTE VERBESSERUNGEN
──────────────────────────────────────────────────────────────

| Kategorie | Vorher | Nachher | Verbesserung |
|-----------|--------|---------|-------------|
| Build-Zeit | {vorher} | {nachher} | {Reduzierung %} |
| Image-Grosse | {vorher} | {nachher} | {Reduzierung %} |
| Festplattennutzung | {vorher} | {nachher} | {freigemacht} |
| Speichernutzung | {vorher} | {nachher} | {freigemacht} |

──────────────────────────────────────────────────────────────
EMPFEHLUNGSZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────

### Sofort (jetzt umsetzen)
- [ ] {Empfehlung mit hoher Auswirkung, geringem Aufwand}

### Kurzfristig (diese Woche)
- [ ] {Empfehlung mit mittlerer Auswirkung}

### Langfristig (diesen Monat)
- [ ] {Empfehlung mit Planungsbedarf}

──────────────────────────────────────────────────────────────
MONITORING-BEFEHLE
──────────────────────────────────────────────────────────────

# Schneller Health Check
docker ps --format "{{.Names}}: {{.Status}}" | sort

# Ressourcen-Uberblick
docker stats --no-stream

# Festplattennutzung
docker system df

# Bereinigung (sicher)
docker system prune -f
docker image prune -f --filter "until=72h"
```
