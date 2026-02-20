---
description: Diagnose FrankenPHP worker and Caddyfile issues from symptoms
argument-hint: <Symptom> [context]
---

# FrankenPHP Debug

Du bist ein FrankenPHP-Troubleshooting-Spezialist. Du musst FrankenPHP-Probleme anhand der gegebenen Symptome systematisch diagnostizieren und beheben.

## Argumente
$ARGUMENTS

Argumente:
- Symptombeschreibung (z.B. "worker crashes", "memory leak", "Caddyfile error", "503 errors")
- (Optional) Framework: symfony, laravel, php
- (Optional) Modus: worker, classic

Beispiel: `/frankenphp:debug "worker memory keeps growing, RSS at 2GB after 1 hour"`

## Plan-Modus

> **Plan-Modus ist nicht erforderlich.** Dies ist ein Diagnosebefehl, der sofort mit der Untersuchung beginnt.

## MISSION

### Schritt 1: Informationen sammeln

```
══════════════════════════════════════════════════════════════
FRANKENPHP DEBUG
══════════════════════════════════════════════════════════════

Symptom: {Beschreibung}
Framework: {symfony/laravel/php}
Modus: {worker/classic}

──────────────────────────────────────────────────────────────
SYSTEMSTATUS
──────────────────────────────────────────────────────────────
```

Diagnosebefehle ausfuehren:
```bash
# Prozessstatus
ps aux | grep frankenphp

# Aktuelle Logs
docker logs frankenphp-app --tail 50
# oder: journalctl -u frankenphp --since "10 minutes ago"

# Caddyfile-Validierung
frankenphp validate --config /etc/caddy/Caddyfile

# Speicherverbrauch
ps -o pid,rss,vsz -p $(pidof frankenphp)

# PHP-Erweiterungen
frankenphp php-cli -m
```

### Schritt 2: Ursachenanalyse

```
──────────────────────────────────────────────────────────────
DIAGNOSE
──────────────────────────────────────────────────────────────

| Pruefung | Status | Details |
|----------|--------|---------|
| FrankenPHP laeuft | {ja/nein} | {PID, Laufzeit} |
| Worker Mode aktiv | {ja/nein} | {Thread-Anzahl} |
| Caddyfile gueltig | {ja/nein} | {Fehler} |
| Speicher stabil | {ja/nein} | {RSS-Trend} |
| Framework-Integration | {ok/fehlerhaft} | {Runtime/Octane} |
| TLS-Status | {ok/fehlerhaft} | {auto/proxy} |

──────────────────────────────────────────────────────────────
ENTSCHEIDUNGSBAUM
──────────────────────────────────────────────────────────────

Symptom: {Symptom}
  ├── Worker-Absturz? → PHP-Fehler, Speicher, Segfaults pruefen
  ├── Memory Leak? → max_requests setzen, globalen Zustand auditieren
  ├── Caddyfile-Fehler? → Syntax validieren, Direktiven-Reihenfolge pruefen
  ├── TLS-Fehler? → auto_https, Proxy-Konfiguration pruefen
  ├── Framework-Problem? → Runtime/Octane-Installation verifizieren
  └── Performance? → Code profilieren, OPcache pruefen, Benchmark

Ursache: {Erklaerung}
```

### Schritt 3: Behebung

```
──────────────────────────────────────────────────────────────
LOESUNG
──────────────────────────────────────────────────────────────
```

Bereitstellen:
1. **Sofortloesung** -- Konfigurationsaenderungen oder Befehle zur sofortigen Behebung
2. **Erklaerung** -- Warum dies passiert ist, FrankenPHP-spezifisches Verhalten
3. **Praevention** -- Konfigurationsoptimierung, Monitoring-Alerts

### Schritt 4: Verifikation

```bash
# Verifizieren, dass FrankenPHP gesund ist
frankenphp validate --config /etc/caddy/Caddyfile
curl -f http://localhost/healthz
ps -o pid,rss -p $(pidof frankenphp)
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
| Symptom | {Symptom} |
| Ursache | {Ursache} |
| Angewendete Loesung | {Loesung} |
| Status | Behoben / Aktion erforderlich |

──────────────────────────────────────────────────────────────
PRAEVENTION
──────────────────────────────────────────────────────────────

- [ ] Monitoring-Alert fuer {Bedingung} hinzufuegen
- [ ] {Parameter} optimieren, um {Problem} zu verhindern
- [ ] Loesung fuer @frankenphp-debug-Referenz dokumentieren
```
