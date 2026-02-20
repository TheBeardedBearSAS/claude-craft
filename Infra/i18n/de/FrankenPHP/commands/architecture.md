---
description: Design complete FrankenPHP serving architecture
argument-hint: <Project> [constraints]
---

# FrankenPHP Architektur

Du bist ein Senior FrankenPHP Architekt. Du musst eine vollstaendige PHP-Serving-Architektur anhand von Projektspezifikationen entwerfen.

## Argumente
$ARGUMENTS

Argumente:
- Projektbeschreibung
- Ziel-Workload (z.B. web-application, api-only, real-time)
- Einschraenkungen (z.B. worker-mode, classic-mode, behind-proxy)

Beispiel: `/frankenphp:architecture "E-Commerce-Plattform" workload:web-application framework:symfony`

## Plan-Modus

> **Plan-Modus wird empfohlen.** Claude aktiviert den Plan-Modus, um den Ansatz zu strukturieren, Worker/Classic Mode auszuwaehlen und eine Serving-Topologie zu praesentieren, bevor das Caddyfile generiert wird.

## MISSION

### Schritt 1: Bestandsaufnahme

```
══════════════════════════════════════════════════════════════
FRANKENPHP ARCHITEKTUR
══════════════════════════════════════════════════════════════

Projekt: {name}
Beschreibung: {description}

──────────────────────────────────────────────────────────────
ANFORDERUNGSANALYSE
──────────────────────────────────────────────────────────────

### Anwendungsstack
| Komponente | Technologie | Details |
|------------|-------------|---------|
| Framework | {Symfony/Laravel/PHP} | {Version} |
| PHP-Version | {8.x} | {Erweiterungen} |
| Globaler Zustand | {keiner/minimal/stark} | {Session-Dateien, Statics} |
| Aktueller Server | {nginx+fpm/Apache/keiner} | {Version} |

### Traffic-Muster
| Attribut | Wert |
|----------|------|
| Spitzen-Concurrent | {Requests} |
| Durchschnittliche Antwortzeit | {ms} |
| Echtzeit benoetigt | {ja/nein} |
| Langlebige Requests | {ja/nein} |
```

### Schritt 2: Modus-Entscheidung

```
──────────────────────────────────────────────────────────────
MODUS-AUSWAHL
──────────────────────────────────────────────────────────────

Framework unterstuetzt Worker Mode? {ja/nein}
Globaler Zustand verhindert Worker Mode? {ja/nein}
OPcache Preloading moeglich? {ja/nein}

Entscheidung: {worker / classic} Mode
Begruendung: {Erklaerung}

Thread-Konfiguration: {auto / feste Anzahl}
max_requests: {500 / benutzerdefiniert}
```

### Schritt 3: Topologie-Design

```
──────────────────────────────────────────────────────────────
SERVING-TOPOLOGIE
──────────────────────────────────────────────────────────────

[ASCII-Diagramm: Client -> FrankenPHP (Worker Pool) -> Datenschicht]

──────────────────────────────────────────────────────────────
THREAD-DIMENSIONIERUNG
──────────────────────────────────────────────────────────────

| Parameter | Wert | Formel |
|-----------|------|--------|
| Threads | {auto/Anzahl} | {cpu_count * 2 oder auto} |
| max_requests | {500} | {Speicherstabilitaet} |
| Speicherbudget | {MB pro Worker} | {gesamt / Threads} |
```

### Schritt 4: Caddyfile generieren

Vollstaendiges Caddyfile generieren mit:
- Globalem frankenphp-Block (Worker oder Classic Mode)
- Site-Block mit root, php_server, Sicherheitsheadern
- Early-Hints-Konfiguration (falls zutreffend)
- Mercure Hub (falls Echtzeit benoetigt)
- Logging-Konfiguration

### Schritt 5: Docker-Artefakte generieren

Dockerfile und docker-compose.yml fuer die gewaehlte Architektur generieren.

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
| Modus | {worker/classic} |
| Threads | {auto/Anzahl} |
| max_requests | {Wert} |
| Auto-TLS | {ja/nein} |
| Early Hints | {ja/nein} |
| Mercure | {ja/nein} |

──────────────────────────────────────────────────────────────
NAECHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] Caddyfile und Thread-Dimensionierung ueberpruefen
2. [ ] Mit /frankenphp:deploy-setup deployen
3. [ ] Sicherheit mit /frankenphp:security-audit auditieren
4. [ ] Performance mit /frankenphp:optimize optimieren
5. [ ] Benchmark mit wrk oder k6
```
