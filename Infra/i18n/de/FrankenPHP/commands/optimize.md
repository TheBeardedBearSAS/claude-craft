---
description: Optimize FrankenPHP worker performance and throughput
argument-hint: [target]
---

# FrankenPHP Optimierung

Du bist ein FrankenPHP-Optimierungsspezialist. Du musst Worker-Performance-Metriken analysieren und umsetzbare Empfehlungen fuer Thread-Tuning, OPcache-Optimierung, Early-Hints-Konfiguration und Mercure-Performance liefern.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Ziel: worker-tuning, opcache, early-hints, mercure, full (Standard: full)

Beispiel: `/frankenphp:optimize target:worker-tuning`

## Plan-Modus

> **Plan-Modus wird empfohlen.** Claude analysiert das aktuelle Performance-Profil, bevor Optimierungen vorgeschlagen werden.

## MISSION

### Schritt 1: Profil erfassen

```
══════════════════════════════════════════════════════════════
FRANKENPHP OPTIMIERUNG
══════════════════════════════════════════════════════════════

Ziel: {worker-tuning/opcache/early-hints/mercure/full}

──────────────────────────────────────────────────────────────
AKTUELLES PROFIL
──────────────────────────────────────────────────────────────

| Einstellung | Wert |
|-------------|------|
| FrankenPHP-Version | {Version} |
| PHP-Version | {Version} |
| Modus | {worker/classic} |
| Threads | {auto/Anzahl} |
| max_requests | {Wert} |
| CPU-Anzahl | {n} |
| Verfuegbarer Speicher | {GB} |
```

Metriken erfassen:
```bash
nproc && free -h
ps -o pid,rss,vsz -p $(pidof frankenphp)
frankenphp php-cli -i | grep -E "opcache|memory_limit"
grep -E "worker|thread" /etc/caddy/Caddyfile
```

### Schritt 2: Baseline-Benchmark

```
──────────────────────────────────────────────────────────────
BASELINE-BENCHMARK
──────────────────────────────────────────────────────────────

| Metrik | Wert | Methode |
|--------|------|---------|
| RPS | {n} | wrk -t4 -c100 -d30s |
| p50-Latenz | {ms} | wrk --latency |
| p99-Latenz | {ms} | wrk --latency |
| Speicher (RSS) | {MB} | ps -o rss |
| TTFB | {ms} | curl-Timing |
```

### Schritt 3: Worker-Tuning-Analyse

```
──────────────────────────────────────────────────────────────
WORKER-ANALYSE
──────────────────────────────────────────────────────────────

| Parameter | Aktuell | Empfohlen | Auswirkung |
|-----------|---------|-----------|------------|
| Modus | {worker/classic} | {Empfehlung} | {Beschreibung} |
| Threads | {aktuell} | {auto/Anzahl} | {Beschreibung} |
| max_requests | {aktuell} | {500} | {Beschreibung} |
| Speicher pro Thread | {MB} | {Zielwert} | {Beschreibung} |
```

### Schritt 4: OPcache-Analyse

```
──────────────────────────────────────────────────────────────
OPCACHE-OPTIMIERUNG
──────────────────────────────────────────────────────────────

| Einstellung | Aktuell | Empfohlen | Begruendung |
|-------------|---------|-----------|-------------|
| opcache.enable | {Wert} | 1 | {Grund} |
| opcache.memory_consumption | {Wert} | 256 | {Grund} |
| opcache.max_accelerated_files | {Wert} | 20000 | {Grund} |
| opcache.validate_timestamps | {Wert} | 0 (Prod) | {Grund} |
| opcache.preload | {Wert} | /app/config/preload.php | {Grund} |
| opcache.jit | {Wert} | 1255 | {Grund} |
| opcache.jit_buffer_size | {Wert} | 128M | {Grund} |
```

### Schritt 5: Early Hints und Netzwerk

```
──────────────────────────────────────────────────────────────
EARLY HINTS UND NETZWERK
──────────────────────────────────────────────────────────────

| Feature | Status | Empfehlung |
|---------|--------|------------|
| Early Hints (103) | {aktiviert/deaktiviert} | {Aktion} |
| HTTP/2 | {aktiviert/deaktiviert} | {Aktion} |
| HTTP/3 | {aktiviert/deaktiviert} | {Aktion} |
| Komprimierung | {aktiviert/deaktiviert} | {Aktion} |
| push-Direktive | {konfiguriert/fehlt} | {Aktion} |
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
| {Optimierung 1} | {hoch/mittel/niedrig} | {hoch/mittel/niedrig} | 1 |
| {Optimierung 2} | {hoch/mittel/niedrig} | {hoch/mittel/niedrig} | 2 |

──────────────────────────────────────────────────────────────
ERWARTETE VERBESSERUNG
──────────────────────────────────────────────────────────────

| Metrik | Vorher | Erwartet nachher | Aenderung |
|--------|--------|------------------|-----------|
| RPS | {n} | {n} | +{x}% |
| p99-Latenz | {ms} | {ms} | -{x}% |
| Speicher | {MB} | {MB} | {stabil} |

──────────────────────────────────────────────────────────────
NAECHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] Worker-Tuning anwenden (Thread-Anzahl, max_requests)
2. [ ] OPcache Preloading und JIT konfigurieren
3. [ ] Early Hints fuer kritische Ressourcen aktivieren
4. [ ] Nach jeder Aenderung erneut benchmarken
5. [ ] Speicherstabilitaet ueber 24 Stunden ueberwachen
```
