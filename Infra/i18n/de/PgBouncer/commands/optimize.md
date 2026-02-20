---
description: Optimize PgBouncer pool performance and connection utilization
argument-hint: [target]
---

# PgBouncer Optimierung

Du bist ein PgBouncer-Optimierungsspezialist. Du musst Pool-Auslastungsmetriken analysieren und umsetzbare Empfehlungen fuer Performance-Tuning, Timeout-Optimierung und Transaction-Modus-Migrationsbewertung liefern.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Ziel: pool-sizing, timeouts, txn-mode-migration, full (Standard: full)

Beispiel: `/pgbouncer:optimize target:pool-sizing`

## Plan-Modus

> **Plan-Modus wird empfohlen.** Claude analysiert die aktuellen Pool-Metriken, bevor Optimierungen vorgeschlagen werden.

## MISSION

### Schritt 1: Metriken sammeln

```
══════════════════════════════════════════════════════════════
PGBOUNCER OPTIMIERUNG
══════════════════════════════════════════════════════════════

Ziel: {pool-sizing/timeouts/txn-mode-migration/full}

──────────────────────────────────────────────────────────────
AKTUELLES POOL-PROFIL
──────────────────────────────────────────────────────────────

| Datenbank | Pool-Modus | Pool-Groesse | cl_active | cl_waiting | sv_active | sv_idle | Auslastung |
|-----------|-----------|-------------|-----------|------------|-----------|---------|------------|
| {db} | {modus} | {groesse} | {n} | {n} | {n} | {n} | {%} |
```

Metriken ueber SHOW-Befehle sammeln:
```sql
SHOW POOLS;
SHOW STATS;
SHOW CONFIG;
SHOW LISTS;
```

### Schritt 2: Pool-Auslastungsanalyse

```
──────────────────────────────────────────────────────────────
POOL-AUSLASTUNG
──────────────────────────────────────────────────────────────

| Datenbank | Aktuelle Groesse | Spitze sv_active | Durchschn. Auslastung | Empfehlung | Aktion |
|-----------|-----------------|------------------|----------------------|------------|--------|
| {db} | {groesse} | {spitze} | {%} | {neue groesse} | {erhoehen/senken/beibehalten} |

──────────────────────────────────────────────────────────────
DIMENSIONIERUNGSEMPFEHLUNGEN
──────────────────────────────────────────────────────────────

| Parameter | Aktuell | Empfohlen | Auswirkung |
|-----------|---------|-----------|------------|
| default_pool_size | {aktuell} | {neu} | {beschreibung} |
| min_pool_size | {aktuell} | {neu} | {beschreibung} |
| reserve_pool_size | {aktuell} | {neu} | {beschreibung} |
| max_client_conn | {aktuell} | {neu} | {beschreibung} |
| max_db_connections | {aktuell} | {neu} | {beschreibung} |
```

### Schritt 3: Timeout-Optimierung

```
──────────────────────────────────────────────────────────────
TIMEOUT-ANALYSE
──────────────────────────────────────────────────────────────

| Timeout | Aktuell | Empfohlen | Begruendung |
|---------|---------|-----------|-------------|
| server_lifetime | {aktuell} | {neu} | {grund} |
| server_idle_timeout | {aktuell} | {neu} | {grund} |
| client_idle_timeout | {aktuell} | {neu} | {grund} |
| query_wait_timeout | {aktuell} | {neu} | {grund} |
| client_login_timeout | {aktuell} | {neu} | {grund} |
| server_connect_timeout | {aktuell} | {neu} | {grund} |
| reserve_pool_timeout | {aktuell} | {neu} | {grund} |
```

### Schritt 4: Transaction-Modus-Migrationsbewertung

```
──────────────────────────────────────────────────────────────
TRANSACTION-MODUS-MIGRATION
──────────────────────────────────────────────────────────────

Aktueller Modus: {session/transaction}

| Kompatibilitaetspruefung | Status | Details |
|--------------------------|--------|---------|
| Prepared Statements | {kompatibel/anpassung noetig} | {details} |
| SET-Befehle | {kompatibel/anpassung noetig} | {details} |
| LISTEN/NOTIFY | {kompatibel/inkompatibel} | {details} |
| Temporaere Tabellen | {kompatibel/inkompatibel} | {details} |
| Advisory Locks | {kompatibel/benoetigt session} | {details} |

Migration moeglich: {ja/nein/teilweise}
Geschaetzter Multiplexing-Gewinn: {x}x Connection-Reduktion
server_reset_query erforderlich: {DISCARD ALL / benutzerdefiniert}
```

### Schritt 5: Performance-Statistiken

```
──────────────────────────────────────────────────────────────
PERFORMANCE-METRIKEN
──────────────────────────────────────────────────────────────

| Metrik | Aktuell | Ziel | Status |
|--------|---------|------|--------|
| avg_wait_time | {ms} | < 100ms | {ok/hoch} |
| avg_xact_time | {ms} | < 500ms | {ok/hoch} |
| avg_query_time | {ms} | < 100ms | {ok/hoch} |
| xact/s-Durchsatz | {n} | {ziel} | {ok/niedrig} |
| Connection-Wiederverwendungsrate | {x}:1 | > 10:1 | {ok/niedrig} |
```

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
OPTIMIERUNGSBERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────

| Optimierung | Auswirkung | Aufwand | Prioritaet |
|-------------|------------|---------|------------|
| {optimierung 1} | {hoch/mittel/niedrig} | {hoch/mittel/niedrig} | 1 |
| {optimierung 2} | {hoch/mittel/niedrig} | {hoch/mittel/niedrig} | 2 |

──────────────────────────────────────────────────────────────
NAECHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] Pool-Dimensionierungsempfehlungen anwenden (RELOAD, kein Neustart)
2. [ ] Timeouts fuer Anwendungsprofil optimieren
3. [ ] Transaction-Modus-Migration evaluieren (falls Session-Modus)
4. [ ] Monitoring mit @pgbouncer-monitoring einrichten
5. [ ] Nach 1 Woche Produktionstraffic erneut bewerten
```
