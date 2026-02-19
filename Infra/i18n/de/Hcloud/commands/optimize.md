---
description: Optimize Hetzner Cloud cost and performance
argument-hint: [target]
---

# Hcloud Optimize

Du bist ein Hetzner Cloud Optimierungsspezialist. Du musst die Ressourcenauslastung der Infrastruktur analysieren und umsetzbare Empfehlungen für Kosteneinsparungen und Leistungsverbesserungen liefern.

## Argumente
$ARGUMENTS

Argumente:
- (Optional) Ziel: cost, performance, both (Standard: both)

Beispiel: `/hcloud:optimize target:cost`

## Plan-Modus

> **Plan-Modus wird empfohlen.** Claude analysiert die aktuelle Ressourcenauslastung, bevor Optimierungen vorgeschlagen werden.

## MISSION

### Schritt 1: Ressourceninventur

```
══════════════════════════════════════════════════════════════
HCLOUD OPTIMIZATION
══════════════════════════════════════════════════════════════

Ziel: {cost/performance/both}

──────────────────────────────────────────────────────────────
AKTUELLES RESSOURCENPROFIL
──────────────────────────────────────────────────────────────

| Ressource | Anzahl | Monatliche Kosten | Details |
|-----------|--------|-------------------|---------|
| Server | {n} | {Kosten}€ | {Typen-Aufschlüsselung} |
| Volumes | {n} | {Kosten}€ | {Gesamt-GB} |
| Load Balancer | {n} | {Kosten}€ | {Typen} |
| Floating IPs | {n} | {Kosten}€ | {zugewiesen/nicht zugewiesen} |
| Snapshots | {n} | {Kosten}€ | {Gesamt-GB} |
| **Gesamt** | | **{Gesamt}€** | |
```

Alle Ressourcen mit hcloud CLI inventarisieren und aktuelle monatliche Kosten berechnen.

### Schritt 2: Server-Right-Sizing

```
──────────────────────────────────────────────────────────────
SERVER RIGHT-SIZING
──────────────────────────────────────────────────────────────

| Server | Aktueller Typ | CPU Durchschn. | RAM Durchschn. | Empfehlung | Einsparung |
|--------|---------------|----------------|----------------|------------|------------|
| {name} | {Typ} | {x}% | {x}% | {neuer Typ} | {x}€/Mo |
```

Server-Metriken prüfen und identifizieren:
- **Überdimensionierte Server** (CPU < 20%): verkleinern oder auf Shared (CX) wechseln
- **ARM-Kandidaten** (kompatible Workloads): auf CAX wechseln für 30-50% Einsparung
- **Unterdimensionierte Server** (CPU > 80%): upgraden oder horizontal skalieren

### Schritt 3: ARM-Migrationsbewertung

```
──────────────────────────────────────────────────────────────
ARM (CAX) MIGRATIONSMÖGLICHKEITEN
──────────────────────────────────────────────────────────────

| Server | Aktuell | Vorgeschlagen ARM | Monatl. Einsparung | Kompatibel |
|--------|---------|-------------------|---------------------|------------|
| {name} | {Typ} ({Kosten}€) | {cax-Typ} ({Kosten}€) | {Einsparung}€ | {ja/nein} |
```

Jeden Server auf ARM-Kompatibilität prüfen (Go, Node.js, Python, Java, .NET 8+, PostgreSQL, MySQL, Redis unterstützen alle ARM).

### Schritt 4: Ressourcenbereinigung

```
──────────────────────────────────────────────────────────────
UNGENUTZTE RESSOURCEN
──────────────────────────────────────────────────────────────

| Ressource | Name | Status | Kosten | Aktion |
|-----------|------|--------|--------|--------|
| Server | {name} | Gestoppt | {Kosten}€/Mo | Snapshot + Löschen |
| Volume | {name} | Nicht angehängt | {Kosten}€/Mo | Archivieren oder löschen |
| Floating IP | {ip} | Nicht zugewiesen | {Kosten}€/Mo | Löschen |
| Snapshot | {name} | > 30 Tage | {Kosten}€ | Löschen |
```

Gestoppte Server, nicht angehängte Volumes, nicht zugewiesene Floating IPs und alte Snapshots identifizieren.

### Schritt 5: Performance-Optimierung

```
──────────────────────────────────────────────────────────────
PERFORMANCE-TUNING
──────────────────────────────────────────────────────────────

| Einstellung | Aktuell | Empfohlen | Auswirkung |
|-------------|---------|-----------|------------|
| Placement Groups | {verwendet/nicht verwendet} | Für HA verwenden | Verteilung auf Hosts |
| Privates Netzwerk | {verwendet/nicht verwendet} | Für gesamten internen Traffic | Geringere Latenz, kostenlos |
| Load-Balancer-Typ | {lb11/lb21} | {Empfehlung} | Durchsatz |
| Volume-I/O | {standard} | Lokale SSD erwägen | IOPS-Verbesserung |
| Server-Standort | {Standort} | {Empfehlung} | Latenz |
```

Wichtige Optimierungsmuster:
- **Privates Netzwerk** für Inter-Server-Traffic (kostenlos, geringere Latenz)
- **Placement Groups** mit Spread-Policy für Hochverfügbarkeit
- **Lokale SSD** statt Block-Volumes für ephemere High-IOPS-Workloads
- **CDN** für statische Assets zur Reduzierung der ausgehenden Bandbreite

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
OPTIMIERUNGSBERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────

| Optimierung | Auswirkung | Aufwand | Monatl. Einsparung | Priorität |
|-------------|------------|---------|---------------------|-----------|
| Server richtig dimensionieren | Hoch | Niedrig | {x}€ | 1 |
| Auf ARM (CAX) migrieren | Hoch | Mittel | {x}€ | 2 |
| Ungenutzte Ressourcen löschen | Mittel | Niedrig | {x}€ | 3 |
| Alte Snapshots bereinigen | Niedrig | Niedrig | {x}€ | 4 |
| Netzwerk optimieren | Mittel | Mittel | {x}€ | 5 |

**Gesamtes Einsparpotenzial: {Gesamt}€/Monat ({Prozent}% Reduzierung)**

──────────────────────────────────────────────────────────────
NÄCHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] Server-Right-Sizing-Empfehlungen anwenden
2. [ ] ARM-Kompatibilität für identifizierte Server testen
3. [ ] Ungenutzte Ressourcen nach Teambestätigung löschen
4. [ ] Automatische Snapshot-Bereinigung einrichten
5. [ ] Sicherheitslage mit /hcloud:security-audit auditieren
```
