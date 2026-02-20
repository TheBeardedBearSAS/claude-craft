---
description: Design complete PgBouncer connection pooling architecture
argument-hint: <Project> [constraints]
---

# PgBouncer Architektur

Du bist ein Senior PgBouncer Architekt. Du musst eine vollstaendige Connection-Pooling-Architektur anhand von Projektspezifikationen entwerfen.

## Argumente
$ARGUMENTS

Argumente:
- Projektbeschreibung
- Ziel-Workload (z.B. web-application, microservices, multi-tenant)
- Einschraenkungen (z.B. pool-mode, max-connections, ha-required)

Beispiel: `/pgbouncer:architecture "E-Commerce-Plattform" workload:web-application pg-max-conn:100`

## Plan-Modus

> **Plan-Modus wird empfohlen.** Claude aktiviert den Plan-Modus, um den Ansatz zu strukturieren, den Pool-Modus auszuwaehlen und eine Topologie zu praesentieren, bevor die pgbouncer.ini generiert wird.

## MISSION

### Schritt 1: Bestandsaufnahme

```
══════════════════════════════════════════════════════════════
PGBOUNCER ARCHITEKTUR
══════════════════════════════════════════════════════════════

Projekt: {name}
Beschreibung: {description}

──────────────────────────────────────────────────────────────
ANFORDERUNGSANALYSE
──────────────────────────────────────────────────────────────

### Anwendungsstack
| Komponente | Technologie | Connections |
|------------|-------------|-------------|
| App-Server | {framework} | {conn pro Instanz} |
| Instanzen | {anzahl} | {gesamt-connections} |
| ORM-Funktionen | {prepared stmts, temp tables} | {kompatibilitaet} |

### PostgreSQL-Konfiguration
| Attribut | Wert |
|----------|------|
| max_connections | {wert} |
| Datenbanken | {anzahl} |
| Replikation | {primary-only / primary+replica} |
| Auth-Methode | {scram-sha-256 / md5} |
```

### Schritt 2: Pool-Modus-Entscheidung

```
──────────────────────────────────────────────────────────────
POOL-MODUS-AUSWAHL
──────────────────────────────────────────────────────────────

Anwendung verwendet Prepared Statements? {ja/nein}
Anwendung verwendet SET/Session-Variablen? {ja/nein}
Anwendung verwendet LISTEN/NOTIFY? {ja/nein}
Anwendung verwendet temp. Tabellen ueber Queries hinweg? {ja/nein}

Entscheidung: {transaction / session}-Modus
Begruendung: {erklaerung}

server_reset_query: {DISCARD ALL / leer}
```

### Schritt 3: Topologie-Design

```
──────────────────────────────────────────────────────────────
POOL-TOPOLOGIE
──────────────────────────────────────────────────────────────

[ASCII-Diagramm: App-Instanzen -> PgBouncer -> PostgreSQL]

──────────────────────────────────────────────────────────────
DIMENSIONIERUNGSBERECHNUNG
──────────────────────────────────────────────────────────────

| Parameter | Wert | Formel |
|-----------|------|--------|
| max_client_conn | {wert} | {instanzen x conn + 20% Puffer} |
| default_pool_size | {wert} | {PG max_conn / pools x 0,8} |
| min_pool_size | {wert} | {50% des Standards} |
| reserve_pool_size | {wert} | {25% des Standards} |
| reserve_pool_timeout | {wert} | {sekunden} |
```

### Schritt 4: pgbouncer.ini generieren

Generiere die vollstaendige `pgbouncer.ini`-Konfigurationsdatei mit:
- [databases]-Sektion mit allen Datenbankeintraegen
- [pgbouncer]-Sektion mit allen Pool-Einstellungen
- Authentifizierungskonfiguration (auth_type, auth_file oder auth_query)
- Timeout-Einstellungen (server_lifetime, server_idle_timeout, query_wait_timeout)
- Logging-Konfiguration
- Admin- und Stats-Benutzer

### Schritt 5: userlist.txt generieren

Generiere die Authentifizierungsdatei oder auth_query-SQL-Funktion.

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
GENERIERTE ARCHITEKTUR
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
KONFIGURATIONSZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────

| Einstellung | Wert |
|-------------|------|
| Pool-Modus | {transaction/session} |
| max_client_conn | {wert} |
| default_pool_size | {wert} |
| Datenbanken | {anzahl} |
| HA | {ja/nein} |

──────────────────────────────────────────────────────────────
NAECHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] Pool-Dimensionierung gegen tatsaechlichen Traffic ueberpruefen
2. [ ] Mit /pgbouncer:deploy-setup deployen
3. [ ] Sicherheit mit /pgbouncer:security-audit auditieren
4. [ ] Monitoring mit @pgbouncer-monitoring einrichten
5. [ ] Lasttest zur Validierung der Pool-Dimensionierung
```
