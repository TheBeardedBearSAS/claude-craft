---
description: OpenTofu cost optimization and resource analysis
argument-hint: [Target]
---

# OpenTofu Optimize

Sie sind ein OpenTofu-Kostenoptimierungsspezialist. Sie mussen Infrastrukturkonfigurationen analysieren und umsetzbare Kostenreduktionsempfehlungen liefern.

## Arguments
$ARGUMENTS

Argumente:
- (Optional) Ziel: resources, costs, tags, full (Standard: full)
- (Optional) Pfad zum Konfigurationsverzeichnis

Beispiel: `/opentofu:optimize target:full path:infra/`

## Plan Mode

> **Plan-Modus wird empfohlen.** Claude analysiert aktuelle Konfigurationen, bevor Optimierungen vorgeschlagen werden.

## MISSION

### Schritt 1: Ressourcenanalyse

```
══════════════════════════════════════════════════════════════
OPENTOFU OPTIMIZATION
══════════════════════════════════════════════════════════════

Ziel: {resources/costs/tags/full}
Pfad: {Konfigurationspfad}

──────────────────────────────────────────────────────────────
RESSOURCENINVENTAR
──────────────────────────────────────────────────────────────
```

Analyse mit:
```bash
tofu state list | sort
infracost breakdown --path=. --format=table
```

### Schritt 2: Kostenaufschlusselung

```
──────────────────────────────────────────────────────────────
KOSTENANALYSE
──────────────────────────────────────────────────────────────

| Ressourcentyp | Anzahl | Monatliche Kosten | % Gesamt |
|---------------|--------|-------------------|----------|
| Compute | {n} | ${x} | {y}% |
| Datenbank | {n} | ${x} | {y}% |
| Speicher | {n} | ${x} | {y}% |
| Netzwerk | {n} | ${x} | {y}% |
| **Gesamt** | | **${x}** | **100%** |
```

### Schritt 3: Right-Sizing-Empfehlungen

```
──────────────────────────────────────────────────────────────
RIGHT-SIZING
──────────────────────────────────────────────────────────────

| Ressource | Aktuell | Empfohlen | Einsparungen |
|-----------|---------|-----------|--------------|
| {resource} | {type} | {type} | {x}% |
```

### Schritt 4: Tag-Compliance

```
──────────────────────────────────────────────────────────────
TAG-COMPLIANCE
──────────────────────────────────────────────────────────────

| Erforderlicher Tag | Abdeckung | Fehlende Ressourcen |
|-------------------|-----------|---------------------|
| CostCenter | {x}% | {Liste} |
| Environment | {x}% | {Liste} |
| Project | {x}% | {Liste} |
```

### Schritt 5: Optimierungsmassnahmen

Spezifische OpenTofu-Konfigurationsanderungen generieren:
- Richtig dimensionierte Ressourcendefinitionen
- Spot/Preemptible-Instanz-Konfigurationen
- Speicherebenen-Optimierung
- Standard-Tags am Provider
- OPA-Kosten-Policies

### Schritt 6: Abschlussbericht

```
══════════════════════════════════════════════════════════════
OPTIMIERUNGSBERICHT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ZUSAMMENFASSUNG
──────────────────────────────────────────────────────────────

| Optimierung | Auswirkung | Aufwand | Prioritat |
|-------------|------------|---------|-----------|
| Instanzen richtig dimensionieren | Hoch | Niedrig | 1 |
| Spot-Instanzen aktivieren | Hoch | Mittel | 2 |
| Tag-Compliance | Mittel | Niedrig | 3 |
| Infracost-CI-Gate | Mittel | Mittel | 4 |

──────────────────────────────────────────────────────────────
GESCHATZTE EINSPARUNGEN
──────────────────────────────────────────────────────────────

| Bereich | Aktuell | Optimiert | Monatliche Einsparungen |
|---------|---------|-----------|------------------------|
| Compute | ${x} | ${y} | ${z} |
| Datenbank | ${x} | ${y} | ${z} |
| Speicher | ${x} | ${y} | ${z} |
| **Gesamt** | **${x}** | **${y}** | **${z}** |

──────────────────────────────────────────────────────────────
NACHSTE SCHRITTE
──────────────────────────────────────────────────────────────

1. [ ] Right-Sizing zuerst in Dev anwenden
2. [ ] Infracost in CI/CD integrieren
3. [ ] Tag-Compliance uber OPA erzwingen
4. [ ] Moglichkeiten fur reservierte Instanzen prufen
5. [ ] Monatliche Kostenprufung planen
```
