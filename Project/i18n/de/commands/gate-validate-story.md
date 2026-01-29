---
description: Story gegen die Definition of Done validieren
argument-hint: <story-id>
---

# Story-Gate (DoD) validieren

Eine User Story gegen die Definition of Done-Kriterien validieren.
Alle Kriterien muessen erfuellt sein, um die Story als erledigt zu markieren.

## Argumente

$ARGUMENTS (format: <story-id>)
- **story-id** (erforderlich): Story-Identifikator (z.B. US-001)

## Definition of Done-Kriterien

| Kriterium | Gewicht | Erforderlich | Beschreibung |
|-----------|---------|--------------|--------------|
| Aufgaben abgeschlossen | 20% | Ja | Alle Aufgaben als done markiert |
| Tests bestanden | 20% | Ja | TDD-Zyklus abgeschlossen (green/refactor) |
| AC validiert | 20% | Ja | Alle Akzeptanzkriterien validiert |
| Code reviewed | 15% | Ja | Peer-Review abgeschlossen |
| Keine Blocker | 10% | Ja | Nicht im Status blockiert |
| Dokumentation | 10% | Nein | Docs bei Bedarf aktualisiert |
| Sicherheits-Review | 5% | Nein | Sicherheitsauswirkungen geprueft |

**Schwelle: 100% (alle erforderlichen Kriterien)**

## Prozess

### Schritt 1: Story laden

1. `.bmad/sprint-status.yaml` lesen
2. Story nach ID finden
3. Alle Story-Felder laden

### Schritt 2: Jedes Kriterium validieren

Alle DoD-Kriterien pruefen:
- Aufgaben: `tasks.completed == tasks.total`
- Tests: `tdd_phase in ['green', 'refactor', 'done']`
- AC: `acceptance_criteria.validated == acceptance_criteria.total`
- Review: `status == 'review' or review.approved == true`
- Blocker: `blocked_reason == null`

### Schritt 3: Bericht generieren

Detaillierte Ergebnisse mit Bestanden/Fehlgeschlagen-Status anzeigen.

## Ausgabeformat

### Story erfuellt DoD

```
═══════════════════════════════════════════════════════
          Story DoD-Gate: US-005
═══════════════════════════════════════════════════════

📖 US-005: E-Mail-Verifizierung
Status: review → done (wartend)

Definition of Done:
──────────────────────────────────────────────────────
✅ Aufgaben abgeschlossen (20%)
   Alle Aufgaben erledigt: 4/4
   □ TASK-021: Backend-Endpoint ✓
   □ TASK-022: E-Mail-Service ✓
   □ TASK-023: Frontend-Flow ✓
   □ TASK-024: Tests ✓

✅ Tests bestanden (20%)
   TDD-Phase: refactor
   Alle Tests gruen

✅ Akzeptanzkriterien (20%)
   Validiert: 3/3
   ✓ AC1: Verifizierungs-E-Mail gesendet
   ✓ AC2: Link laeuft nach 24h ab
   ✓ AC3: Benutzerstatus aktualisiert

✅ Code reviewed (15%)
   PR #42 genehmigt von @reviewer
   Review-Status: genehmigt

✅ Keine Blocker (10%)
   Keine blockierenden Probleme

✅ Dokumentation (10%)
   API-Docs aktualisiert

✅ Sicherheits-Review (5%)
   Token-Generierung geprueft

Punktzahl: 100/100
──────────────────────────────────────────────────────

✅ STORY DoD-GATE VALIDIERT

Die Story kann in den Status 'done' uebergehen.
Ausfuehren: /sprint:transition US-005 done
═══════════════════════════════════════════════════════
```

### Story erfuellt DoD nicht

```
═══════════════════════════════════════════════════════
          Story DoD-Gate: US-005
═══════════════════════════════════════════════════════

📖 US-005: E-Mail-Verifizierung
Status: in-progress

Definition of Done:
──────────────────────────────────────────────────────
❌ Aufgaben abgeschlossen (20%)
   Erledigte Aufgaben: 2/4
   ✓ TASK-021: Backend-Endpoint
   ✓ TASK-022: E-Mail-Service
   □ TASK-023: Frontend-Flow (in Bearbeitung)
   □ TASK-024: Tests (wartend)

❌ Tests bestanden (20%)
   TDD-Phase: red
   Tests schlagen fehl

⚠️ Akzeptanzkriterien (20%)
   Validiert: 1/3
   ✓ AC1: Verifizierungs-E-Mail gesendet
   □ AC2: Link laeuft nach 24h ab
   □ AC3: Benutzerstatus aktualisiert

❌ Code reviewed (15%)
   Kein PR erstellt

✅ Keine Blocker (10%)
   Keine blockierenden Probleme

⏳ Dokumentation (10%)
   Nicht geprueft

⏳ Sicherheits-Review (5%)
   Nicht geprueft

Punktzahl: 25/100
──────────────────────────────────────────────────────

❌ STORY DoD-GATE FEHLGESCHLAGEN

Erforderliche Massnahmen:
──────────────────────────────────────────────────────
1. Verbleibende Aufgaben abschliessen
   - TASK-023: Frontend-Flow
   - TASK-024: Tests

2. Fehlgeschlagene Tests korrigieren
   Aktuelle TDD-Phase: red
   Tests ausfuehren und Korrekturen implementieren

3. Akzeptanzkriterien validieren
   - AC2: Link-Ablauf testen
   - AC3: Benutzerstatus-Aktualisierung testen

4. Pull Request fuer Review erstellen
   git push && gh pr create

Geschaetzter Restaufwand:
  Aufgaben: 2 verbleibend
  TDD-Zyklen: 2 (fuer verbleibende Aufgaben)

Arbeit fortsetzen: /sprint:dev US-005
═══════════════════════════════════════════════════════
```

## Beispiel

```
/gate:validate-story US-005
/gate:validate-story US-001
```

## TDD-Phasen-Leitfaden

| Phase | Bedeutung | Naechster Schritt |
|-------|-----------|-------------------|
| red | Tests schlagen fehl | Code implementieren |
| green | Tests bestehen | Refactoring durchfuehren |
| refactor | Bereinigung | Abschliessen oder naechste Aufgabe |
| done | Zyklus abgeschlossen | In Review uebergehen |

Phase aktualisieren:
```
/sprint:tdd US-005 green
```

## Integration

Dieses Gate wird geprueft:
1. Manuell ueber diesen Befehl
2. Im Stop-Hook (quality-gate.sh)
3. Vor `/sprint:transition <id> done`

Gate-Konfiguration: `.bmad/gates/story-gate.yaml`
