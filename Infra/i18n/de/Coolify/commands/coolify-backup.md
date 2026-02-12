---
description: Configure and manage Coolify backups
argument-hint: [arguments]
---

# Coolify Backup-Konfiguration

Du bist ein Coolify-Backup- und Disaster-Recovery-Experte. Du musst Backup-Strategien konfigurieren, Wiederherstellungen testen und Wiederherstellungsverfahren fur Coolify-verwaltete Services dokumentieren.

## Argumente
$ARGUMENTS

Argumente:
- Aktion: audit, configure, test, restore
- (Optional) Service-Name oder Typ
- (Optional) S3-Provider: backblaze, wasabi, aws, minio

Beispiel: `/coolify:backup audit` oder `/coolify:backup configure provider:backblaze` oder `/coolify:backup test service:postgres`

## MISSION

### Schritt 1: Aktuellen Backup-Zustand prufen

```bash
# Alle Services inventarisieren
docker ps --format "table {{.Names}}\t{{.Status}}" | sort

# Datenbanken identifizieren
docker ps --filter "ancestor=postgres" --filter "ancestor=mysql" --filter "ancestor=mongo" --filter "ancestor=redis" --format "{{.Names}}"

# Vorhandene Volumes prufen
docker volume ls --format "table {{.Name}}\t{{.Driver}}"

# Aktuelle Festplattennutzung
df -h /var/lib/docker
du -sh /var/lib/docker/volumes/* 2>/dev/null | sort -rh | head -20
```

```
══════════════════════════════════════════════════════════════
COOLIFY BACKUP-AUDIT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SERVICE-INVENTAR
──────────────────────────────────────────────────────────────

| Service | Typ | Datengrosse | Backup-Status |
|---------|-----|-------------|---------------|
| {name} | {PostgreSQL/MySQL/Redis/App} | {grosse} | {konfiguriert/fehlend} |

──────────────────────────────────────────────────────────────
AKTUELLER BACKUP-STATUS
──────────────────────────────────────────────────────────────

| Element | Status | Details |
|---------|--------|---------|
| S3-Speicher | {konfiguriert/fehlend} | {Anbietername oder N/A} |
| DB-Backups | {aktiv/inaktiv} | {Haufigkeit oder N/A} |
| Volume-Backups | {aktiv/inaktiv} | {Haufigkeit oder N/A} |
| Letztes Backup | {datum} | {grosse} |
| Aufbewahrung | {X Tage} | {Richtlinie oder keine} |
| Wiederherstellung getestet | {ja/nein/nie} | {Letztes Testdatum} |
```

### Schritt 2: S3-kompatiblen Speicher konfigurieren

```
──────────────────────────────────────────────────────────────
S3-SPEICHER-KONFIGURATION
──────────────────────────────────────────────────────────────

### Anbieterauswahl

| Anbieter | Monatliche Kosten (50GB) | Egress | Optimal fur |
|----------|--------------------------|--------|-------------|
| Backblaze B2 | 0,25 $ | Kostenlos uber CF | Budget |
| Wasabi | 0,35 $ | Kostenlos | Keine Egress-Gebuhren |
| Hetzner | 0,25 $ | Inklusive | EU-Compliance |
| AWS S3 | 1,15 $ | 0,09 $/GB | AWS-Okosystem |
| MinIO | Kostenlos (Self-Host) | N/A | Volle Kontrolle |

### Coolify-Konfiguration
Dashboard > Settings > S3 Storage > Add New:

| Feld | Wert |
|------|------|
| Name | {production-backups} |
| Endpoint | {Anbieter-Endpunkt-URL} |
| Bucket | {bucket-name} |
| Region | {region} |
| Access Key | {access-key} |
| Secret Key | {secret-key} |

### Verbindung testen
→ "Test Connection" im Coolify-Dashboard klicken
→ Verifizieren: Testdatei wurde erfolgreich hochgeladen und geloscht
```

### Schritt 3: Backup-Zeitplan und Aufbewahrung setzen

```
──────────────────────────────────────────────────────────────
BACKUP-ZEITPLAN
──────────────────────────────────────────────────────────────

### Datenbank-Backups (Coolify integriert)
Fur jeden Datenbank-Service:
Dashboard > Database > Backups

| Datenbank | Haufigkeit | Aufbewahrung | S3-Ziel |
|-----------|------------|-------------|---------|
| {PostgreSQL} | {Cron-Ausdruck} | {N Backups} | {Speichername} |
| {MySQL} | {Cron-Ausdruck} | {N Backups} | {Speichername} |
| {Redis} | {Cron-Ausdruck} | {N Backups} | {Speichername} |

Haufige Zeitplane:
- Kleines Projekt: 0 3 * * *        (taglich um 3 Uhr)
- Produktion:      0 */6 * * *      (alle 6 Stunden)
- Kritisch:        0 * * * *        (stundlich)

### Volume-Backups (Benutzerdefiniert)
Uber Coolify Scheduled Task oder Cron konfigurieren:

| Volume | Haufigkeit | Aufbewahrung | Methode |
|--------|------------|-------------|---------|
| {uploads} | Taglich | 14 Tage | tar + S3 |
| {config} | Wochentlich | 4 Wochen | tar + S3 |

### Aufbewahrungsrichtlinie

| Backup-Typ | Behalten | Geschatzter Speicher |
|------------|----------|---------------------|
| Stundliche DB | 24 Backups | {Grossenschatzung} |
| Tagliche DB | 30 Backups | {Grossenschatzung} |
| Wochentliche Volumes | 4 Backups | {Grossenschatzung} |
| Monatliches Vollbackup | 3 Backups | {Grossenschatzung} |
| Gesamt | - | {Gesamtschatzung} |
| Monatliche Kosten | - | {Kostenschatzung} |
```

### Schritt 4: Backup und Wiederherstellung testen

```
──────────────────────────────────────────────────────────────
BACKUP-VERIFIZIERUNG
──────────────────────────────────────────────────────────────

### 1. Backup-Existenz verifizieren
\`\`\`bash
# Kurzliche Backups in S3 auflisten
aws s3 ls s3://{bucket}/databases/ --recursive --human-readable | tail -5

# Oder uber Coolify-Dashboard
# Database > Backups > Liste anzeigen
\`\`\`

### 2. Herunterladen und Integritat verifizieren
\`\`\`bash
# Letztes Backup herunterladen
aws s3 cp s3://{bucket}/databases/postgresql/{latest}.sql.gz /tmp/

# Verifizieren, dass Datei nicht beschadigt ist
gunzip -t /tmp/{latest}.sql.gz && echo "Integritat OK" || echo "BESCHADIGT"
\`\`\`

### 3. Datenbank-Wiederherstellung testen
\`\`\`bash
# Testdatenbank erstellen
docker exec {postgres-container} psql -U {user} -c "CREATE DATABASE restore_test;"

# Backup wiederherstellen
gunzip -c /tmp/{latest}.sql.gz | \
  docker exec -i {postgres-container} psql -U {user} -d restore_test

# Daten verifizieren
docker exec {postgres-container} psql -U {user} -d restore_test \
  -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname='public';"

# Zeilenanzahl-Verifizierung
docker exec {postgres-container} psql -U {user} -d restore_test \
  -c "SELECT count(*) as rows FROM {main_table};"

# Testdatenbank bereinigen
docker exec {postgres-container} psql -U {user} -c "DROP DATABASE restore_test;"
\`\`\`

### 4. Volume-Wiederherstellung testen
\`\`\`bash
# Volume-Backup herunterladen
aws s3 cp s3://{bucket}/volumes/{latest}.tar.gz /tmp/

# In Test-Volume wiederherstellen
docker volume create test_restore
docker run --rm -v test_restore:/data -v /tmp:/backup:ro \
  alpine tar xzf /backup/{latest}.tar.gz -C /data

# Inhalte verifizieren
docker run --rm -v test_restore:/data alpine ls -la /data/

# Bereinigung
docker volume rm test_restore
\`\`\`
```

### Schritt 5: Alarme konfigurieren

```
──────────────────────────────────────────────────────────────
ALARM-KONFIGURATION
──────────────────────────────────────────────────────────────

### Coolify-Benachrichtigungen
Dashboard > Settings > Notifications:

| Kanal | Typ | Ereignisse |
|-------|-----|-----------|
| {Slack/Discord/E-Mail} | {Webhook-URL} | Backup-Erfolg/-Fehler |

### Backup-Uberwachungsskript
\`\`\`bash
#!/bin/bash
# check-backups.sh - Taglich uber Cron ausfuhren

BUCKET="s3://{bucket}"
MAX_AGE_HOURS=24
WEBHOOK_URL="{slack-webhook-url}"

# Alter des letzten PostgreSQL-Backups prufen
LATEST=$(aws s3 ls ${BUCKET}/databases/postgresql/ | sort | tail -1 | awk '{print $1" "$2}')
LATEST_EPOCH=$(date -d "$LATEST" +%s 2>/dev/null || echo 0)
NOW_EPOCH=$(date +%s)
AGE_HOURS=$(( (NOW_EPOCH - LATEST_EPOCH) / 3600 ))

if [ "$AGE_HOURS" -gt "$MAX_AGE_HOURS" ]; then
  curl -s -X POST "$WEBHOOK_URL" \
    -d "{\"text\": \"BACKUP-ALARM: PostgreSQL-Backup ist ${AGE_HOURS}h alt (max: ${MAX_AGE_HOURS}h)\"}"
fi
\`\`\`
```

### Schritt 6: Disaster-Recovery-Plan dokumentieren

```
══════════════════════════════════════════════════════════════
DISASTER-RECOVERY-PLAN
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
WIEDERHERSTELLUNGSMETRIKEN
──────────────────────────────────────────────────────────────

| Metrik | Ziel | Erreicht |
|--------|------|----------|
| RPO (Datenverlusttoleranz) | {Stunden} | {Stunden} |
| RTO (Wiederherstellungszeit) | {Stunden} | {Stunden} |

──────────────────────────────────────────────────────────────
WIEDERHERSTELLUNGSVERFAHREN
──────────────────────────────────────────────────────────────

### Einzelne Service-Wiederherstellung
1. Ausgefallenen Service im Coolify-Dashboard identifizieren
2. Deployment-Logs auf Fehler prufen
3. Redeployen oder auf vorherige Version zurucksetzen
4. Bei Datenproblem: Datenbank aus S3-Backup wiederherstellen
Dauer: 15-30 Minuten

### Komplette Server-Wiederherstellung
1. Neuen VPS bereitstellen (gleiche Spezifikationen)
2. Coolify installieren
3. S3-Speicherverbindung konfigurieren
4. Datenbanken aus Backup wiederherstellen
5. Git-Quellen neu verbinden und Apps redeployen
6. DNS-Eintrage aktualisieren
Dauer: 1-2 Stunden

──────────────────────────────────────────────────────────────
BACKUP-ZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────

| Komponente | Zeitplan | Aufbewahrung | S3-Pfad |
|------------|----------|-------------|---------|
| {datenbank} | {haufigkeit} | {tage/anzahl} | {s3://pfad} |
| {volumes} | {haufigkeit} | {tage/anzahl} | {s3://pfad} |

──────────────────────────────────────────────────────────────
NACHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] Backup-Zeitplan verifiziert und aktiv
2. [ ] Wiederherstellungsverfahren erfolgreich getestet
3. [ ] Alarm-Benachrichtigungen verifiziert
4. [ ] DR-Plan mit dem Team geteilt
5. [ ] Nachster Wiederherstellungstest geplant: {datum}
```
