---
description: Diagnose PgBouncer connection pool issues from symptoms
argument-hint: <Symptom> [resource]
---

# PgBouncer Debug

Du bist ein PgBouncer-Troubleshooting-Spezialist. Du musst systematisch Connection-Pool-Probleme anhand der gegebenen Symptome diagnostizieren und beheben.

## Argumente
$ARGUMENTS

Argumente:
- Symptombeschreibung (z.B. "clients waiting", "authentication failed", "prepared statement error")
- (Optional) Datenbankname
- (Optional) Pool-Modus

Beispiel: `/pgbouncer:debug "clients waiting for connections, cl_waiting=50"`

## Plan-Modus

> **Plan-Modus ist nicht erforderlich.** Dies ist ein Diagnosebefehl, der sofort mit der Untersuchung fortfaehrt.

## MISSION

### Schritt 1: Informationen sammeln

```
══════════════════════════════════════════════════════════════
PGBOUNCER DEBUG
══════════════════════════════════════════════════════════════

Symptom: {beschreibung}
Datenbank: {datenbank}
Pool-Modus: {transaction/session}

──────────────────────────────────────────────────────────────
POOL-STATUS
──────────────────────────────────────────────────────────────
```

Diagnosebefehle ueber die PgBouncer-Admin-Konsole ausfuehren:
```sql
SHOW POOLS;
SHOW CLIENTS;
SHOW SERVERS;
SHOW STATS;
SHOW CONFIG;
SHOW DATABASES;
```

### Schritt 2: Ursachenanalyse

```
──────────────────────────────────────────────────────────────
DIAGNOSE
──────────────────────────────────────────────────────────────

| Pruefung | Status | Details |
|----------|--------|---------|
| PgBouncer laeuft | {ja/nein} | {pid, uptime} |
| Pool-Auslastung | {x}% | {sv_active/pool_size} |
| Wartende Clients | {anzahl} | {max. Wartezeit} |
| Auth-Status | {ok/fehlerhaft} | {methode} |
| Server-Konnektivitaet | {ok/fehlerhaft} | {PG erreichbar} |
| Transaction-Modus-Compat. | {ok/probleme} | {prepared stmts, SET} |

──────────────────────────────────────────────────────────────
ENTSCHEIDUNGSBAUM
──────────────────────────────────────────────────────────────

Symptom: {symptom}
  ├── Pool-Erschoepfung? (cl_waiting > 0)
  │   ├── Alle Server-Connections belegt → Pool-Groesse erhoehen oder Queries optimieren
  │   ├── Server-Connections haengen → PostgreSQL-Last pruefen
  │   └── Zu viele Pools → Datenbanken konsolidieren
  ├── Authentifizierungsfehler?
  │   ├── SCRAM-Mismatch → auth_type an PG anpassen
  │   ├── Falsche Zugangsdaten → userlist.txt aktualisieren
  │   └── auth_query-Fehler → Lookup-Funktion pruefen
  ├── Transaction-Modus-Fehler?
  │   ├── Prepared Statement → DISCARD ALL oder im ORM deaktivieren
  │   ├── SET/Session-Variablen → server_reset_query verwenden
  │   └── LISTEN/NOTIFY → Auf Session-Modus wechseln
  └── Server-Konnektivitaet?
      ├── PG max_connections erreicht → pool_size reduzieren
      ├── Netzwerk-/DNS-Problem → Konnektivitaet pruefen
      └── TLS-Fehler → Zertifikate pruefen

Ursache: {erklaerung}
```

### Schritt 3: Behebung

```
──────────────────────────────────────────────────────────────
LOESUNG
──────────────────────────────────────────────────────────────
```

Liefere:
1. **Sofortloesung** -- PgBouncer-Admin-Befehle oder Konfigurationsaenderungen zur sofortigen Behebung
2. **Erklaerung** -- Warum dies passiert ist, PgBouncer-spezifisches Verhalten
3. **Praevention** -- Konfigurationsoptimierung, Monitoring-Alerts

### Schritt 4: Verifizierung

```sql
-- Pool-Gesundheit verifizieren
SHOW POOLS;
-- cl_waiting sollte 0 sein

-- Konnektivitaet verifizieren
SHOW SERVERS;
-- sv_active sollte < pool_size sein

-- Statistiken verifizieren
SHOW STATS;
-- avg_wait_time sollte < 100ms sein
```

### Schritt 5: Abschlussbericht

```
══════════════════════════════════════════════════════════════
DEBUG-BERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────

| Element | Wert |
|---------|------|
| Symptom | {symptom} |
| Ursache | {ursache} |
| Angewendete Loesung | {loesung} |
| Status | Behoben / Aktion erforderlich |

──────────────────────────────────────────────────────────────
PRAEVENTION
──────────────────────────────────────────────────────────────

- [ ] Monitoring-Alert fuer {bedingung} hinzufuegen
- [ ] {parameter} optimieren, um {problem} zu verhindern
- [ ] Loesung fuer @pgbouncer-debug-Referenz dokumentieren
```
