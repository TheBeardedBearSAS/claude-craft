---
description: PRD gegen Quality Gate validieren (≥80%)
argument-hint: [prd-datei]
---

# PRD-Gate validieren

Ein Produktanforderungsdokument gegen das PRD Quality Gate validieren.
Das PRD muss mindestens 80% erreichen, um zu bestehen.

## Argumente

$ARGUMENTS (format: [prd-datei])
- **prd-datei** (optional): Pfad zur PRD-Datei. Standard: `docs/prd.md`

## Gate-Kriterien

| Kriterium | Gewicht | Erforderlich | Beschreibung |
|-----------|---------|--------------|--------------|
| Problemstellung | 15% | Ja | Klare Artikulation des Problems |
| Zielbenutzer | 15% | Ja | Definierte Zielgruppe/Personas |
| Ziele | 15% | Ja | Messbare Ziele |
| Erfolgsmetriken | 15% | Ja | KPIs und Messungen |
| Umfang | 10% | Ja | Was ist ein-/ausgeschlossen |
| User Stories-Ueberblick | 10% | Ja | Feature-Liste |
| Annahmen | 10% | Nein | Dokumentierte Annahmen |
| Risiken | 10% | Nein | Risikoidentifikation |

**Schwelle: 80%**

## Prozess

### Schritt 1: PRD-Datei lokalisieren

1. Angegebenen Pfad oder Standard `docs/prd.md` verwenden
2. Pruefen, ob Datei existiert
3. Inhalt zur Analyse laden

### Schritt 2: Jedes Kriterium validieren

Fuer jedes Kriterium pruefen:
- Inhalt existiert mit relevanten Schluesselwoertern
- Abschnitt hat minimale Inhaltslaenge
- Erforderliche Elemente sind vorhanden

### Schritt 3: Punktzahl berechnen

Punktzahlberechnung:
- Jedes Kriterium hat ein Gewicht (Prozentsatz)
- Bestehen eines Kriteriums addiert sein Gewicht zur Punktzahl
- Endpunktzahl = Summe der bestandenen Gewichte

### Schritt 4: Bericht generieren

Anzeigen:
- Ergebnisse pro Kriterium
- Gesamtpunktzahl und Schwelle
- Bestanden/Fehlgeschlagen-Status
- Verbesserungsvorschlaege

## Ausgabeformat

### PRD validiert

```
═══════════════════════════════════════════════════════
            PRD-Gate-Validierung
═══════════════════════════════════════════════════════

Datei: docs/prd.md
Schwelle: 80%

Validierungsergebnisse:
──────────────────────────────────────────────────────
✅ Problemstellung (15%)
✅ Zielbenutzer (15%)
✅ Ziele (15%)
✅ Erfolgsmetriken (15%)
✅ Umfang (10%)
✅ User Stories-Ueberblick (10%)
✅ Annahmen (10%)
⚠️ Risiken (10%) - Teilweise

Punktzahl: 90/100 (90%)
──────────────────────────────────────────────────────

✅ PRD-GATE BESTANDEN

Bereit fuer die Tech Spec-Phase.
Naechster Schritt: /pm:handoff architect
═══════════════════════════════════════════════════════
```

### PRD fehlgeschlagen

```
═══════════════════════════════════════════════════════
            PRD-Gate-Validierung
═══════════════════════════════════════════════════════

Datei: docs/prd.md
Schwelle: 80%

Punktzahl: 50/100 (50%)
──────────────────────────────────────────────────────

❌ PRD-GATE FEHLGESCHLAGEN (80% erforderlich, 50% erreicht)

Erforderliche Massnahmen:
──────────────────────────────────────────────────────
1. Messbare Ziele hinzufuegen
2. Erfolgsmetriken und KPIs definieren
3. Annahmen dokumentieren
4. Risikobewertung hinzufuegen

Nach Korrekturen erneut ausfuehren: /gate:validate-prd
═══════════════════════════════════════════════════════
```

## Beispiel

```
/gate:validate-prd
/gate:validate-prd docs/feature-prd.md
```
