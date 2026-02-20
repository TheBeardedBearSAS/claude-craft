---
description: Setup PgBouncer deployment with Docker, Kubernetes, or systemd
argument-hint: <Platform> [method]
---

# PgBouncer Deploy-Setup

Du bist ein PgBouncer-Deployment-Spezialist. Du musst ein vollstaendiges Deployment fuer PgBouncer in der Zielumgebung konfigurieren.

## Argumente
$ARGUMENTS

Argumente:
- Plattformbeschreibung
- (Optional) Methode: docker-compose, kubernetes-standalone, kubernetes-sidecar, systemd (Standard: docker-compose)
- (Optional) HA: yes, no (Standard: no)

Beispiel: `/pgbouncer:deploy-setup "Produktions-Webanwendung" method:kubernetes-standalone ha:yes`

## Plan-Modus

> **Plan-Modus ist obligatorisch.** Vor der Ausfuehrung aktiviert Claude den Plan-Modus, um die Zielumgebung zu analysieren, eine Deployment-Strategie vorzuschlagen und auf Validierung zu warten.

## MISSION

### Schritt 1: Umgebung analysieren

```
══════════════════════════════════════════════════════════════
PGBOUNCER DEPLOY-SETUP
══════════════════════════════════════════════════════════════

Projekt: {name}

──────────────────────────────────────────────────────────────
UMGEBUNGSERKENNUNG
──────────────────────────────────────────────────────────────

| Komponente | Erkannt | Details |
|------------|---------|---------|
| PostgreSQL | {version} | {host, port} |
| Deployment-Ziel | {Docker/K8s/systemd} | {details} |
| Bestehendes PgBouncer | {ja/nein} | {version} |
| Netzwerk | {topologie} | {privat/oeffentlich} |
| Secret-Management | {methode} | {K8s Secrets/Vault/env} |
```

### Schritt 2: Deployment-Strategie waehlen

```
──────────────────────────────────────────────────────────────
DEPLOYMENT-STRATEGIE
──────────────────────────────────────────────────────────────

Methode: {Docker Compose / K8s Standalone / K8s Sidecar / Systemd}
HA: {Active-Passive / Mehrere Replicas / Einzelinstanz}
Image: bitnami/pgbouncer:1.25.1

| Entscheidung | Wahl | Begruendung |
|-------------|------|-------------|
| Deployment-Methode | {methode} | {grund} |
| Replicas | {anzahl} | {grund} |
| Health Check | {pg_isready / TCP} | {grund} |
| Konfigurationsmanagement | {ConfigMap/env/file} | {grund} |
```

### Schritt 3: Deployment-Dateien generieren

Alle Deployment-Konfigurationsdateien generieren:
- Docker-Compose-Service-Definition (falls Docker)
- Kubernetes-Manifeste: Deployment, Service, ConfigMap, Secret (falls K8s)
- Systemd-Unit-Datei (falls Bare Metal)
- pgbouncer.ini-Konfiguration
- Health-Check-Skript
- Reload-Skript fuer Zero-Downtime-Konfigurationsaenderungen

### Schritt 4: Health Check generieren

Health-Check-Konfiguration passend zum Deployment-Ziel generieren:
- Docker: HEALTHCHECK-Anweisung
- Kubernetes: livenessProbe + readinessProbe
- Systemd: ExecStartPost-Check

### Schritt 5: Reload-Skript generieren

Zero-Downtime-Reload-Skript generieren:
```bash
#!/bin/bash
# reload-pgbouncer.sh
# Laedt PgBouncer-Konfiguration neu, ohne Verbindungen zu trennen
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
| {datei} | {beschreibung} |

──────────────────────────────────────────────────────────────
NAECHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] Datenbank-Zugangsdaten in Secrets konfigurieren
2. [ ] PgBouncer in Zielumgebung deployen
3. [ ] Health Checks verifizieren
4. [ ] Anwendungs-DATABASE_URL auf PgBouncer umstellen
5. [ ] Sicherheit mit /pgbouncer:security-audit auditieren
6. [ ] Monitoring mit /pgbouncer:optimize einrichten
```
