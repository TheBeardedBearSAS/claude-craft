---
description: Generate FrankenPHP deployment files for Docker, Kubernetes, or standalone
argument-hint: <Platform> [method]
---

# FrankenPHP Deploy-Setup

Du bist ein FrankenPHP-Deployment-Spezialist. Du musst ein vollstaendiges Deployment fuer FrankenPHP in der Zielumgebung konfigurieren.

## Argumente
$ARGUMENTS

Argumente:
- Plattformbeschreibung
- (Optional) Methode: docker-compose, kubernetes, standalone-binary (Standard: docker-compose)
- (Optional) Framework: symfony, laravel, php (Standard: automatische Erkennung)

Beispiel: `/frankenphp:deploy-setup "Produktions-API" method:kubernetes framework:symfony`

## Plan-Modus

> **Plan-Modus ist obligatorisch.** Vor der Ausfuehrung aktiviert Claude den Plan-Modus, um die Zielumgebung zu analysieren, eine Deployment-Strategie vorzuschlagen und auf Validierung zu warten.

## MISSION

### Schritt 1: Umgebung analysieren

```
══════════════════════════════════════════════════════════════
FRANKENPHP DEPLOY-SETUP
══════════════════════════════════════════════════════════════

Projekt: {name}

──────────────────────────────────────────────────────────────
UMGEBUNGSERKENNUNG
──────────────────────────────────────────────────────────────

| Komponente | Erkannt | Details |
|------------|---------|---------|
| PHP-Framework | {Symfony/Laravel/PHP} | {Version} |
| Deployment-Ziel | {Docker/K8s/Standalone} | {Details} |
| Bestehendes FrankenPHP | {ja/nein} | {Version} |
| TLS-Strategie | {auto/proxy/manuell} | {Details} |
| Secret-Management | {Methode} | {K8s Secrets/Vault/env} |
```

### Schritt 2: Deployment-Strategie waehlen

```
──────────────────────────────────────────────────────────────
DEPLOYMENT-STRATEGIE
──────────────────────────────────────────────────────────────

Methode: {Docker Compose / Kubernetes / Standalone Binary}
Image: dunglas/frankenphp:1.11-php8.5-bookworm
Worker Mode: {ja/nein}

| Entscheidung | Wahl | Begruendung |
|-------------|------|-------------|
| Deployment-Methode | {Methode} | {Grund} |
| Replicas | {Anzahl} | {Grund} |
| Health Check | {HTTP /healthz} | {Grund} |
| TLS-Terminierung | {FrankenPHP/Proxy} | {Grund} |
```

### Schritt 3: Deployment-Dateien generieren

Alle Deployment-Konfigurationsdateien generieren:
- Dockerfile (Multi-Stage, produktionsoptimiert)
- docker-compose.yml (falls Docker-Methode)
- Kubernetes-Manifeste: Deployment, Service, HPA (falls K8s-Methode)
- Caddyfile fuer die Umgebung
- PHP-Konfiguration (OPcache, Sicherheit)
- Health-Check-Endpunkt

### Schritt 4: Health Check generieren

Health Check passend zum Deployment-Ziel generieren:
- Docker: HEALTHCHECK-Anweisung
- Kubernetes: livenessProbe + readinessProbe (HTTP)
- Standalone: Systemd-Check

### Schritt 5: Reload-Skript generieren

Zero-Downtime-Reload-Skript generieren:
```bash
#!/bin/bash
# reload-frankenphp.sh
# Startet FrankenPHP-Worker neu, ohne Verbindungen zu trennen (SIGUSR1)
```

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
SETUP-BERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ERSTELLTE DATEIEN
──────────────────────────────────────────────────────────────

| Datei | Beschreibung |
|-------|-------------|
| {Datei} | {Beschreibung} |

──────────────────────────────────────────────────────────────
NAECHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] Umgebungsvariablen konfigurieren (SERVER_NAME, Secrets)
2. [ ] FrankenPHP-Image bauen und deployen
3. [ ] Health Checks verifizieren
4. [ ] Sicherheit mit /frankenphp:security-audit auditieren
5. [ ] Performance mit /frankenphp:optimize optimieren
```
