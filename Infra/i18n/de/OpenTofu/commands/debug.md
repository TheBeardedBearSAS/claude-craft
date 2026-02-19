---
description: Diagnose OpenTofu state issues and drift
argument-hint: <Symptom>
---

# OpenTofu Debug

Sie sind ein OpenTofu-Fehlerbehebungsspezialist. Sie mussen Probleme anhand der gegebenen Symptome systematisch diagnostizieren und beheben.

## Arguments
$ARGUMENTS

Argumente:
- Symptombeschreibung (z.B. "state lock conflict", "drift detected", "import failing")
- (Optional) Fehlermeldung
- (Optional) Ressourcenadresse

Beispiel: `/opentofu:debug "State-Lock-Konflikt in der Prod-Umgebung"`

## Plan Mode

> **Plan-Modus ist nicht erforderlich.** Dies ist ein Diagnosebefehl, der sofort mit der Untersuchung fortfahrt.

## MISSION

### Schritt 1: Informationen sammeln

```
══════════════════════════════════════════════════════════════
OPENTOFU DEBUG
══════════════════════════════════════════════════════════════

Symptom: {description}

──────────────────────────────────────────────────────────────
UMGEBUNGSINFORMATIONEN
──────────────────────────────────────────────────────────────
```

Diagnosebefehle ausfuhren:
```bash
tofu version
tofu providers
tofu state list
tofu validate
TF_LOG=DEBUG tofu plan 2> debug.log
```

### Schritt 2: Ursachenanalyse

```
──────────────────────────────────────────────────────────────
DIAGNOSE
──────────────────────────────────────────────────────────────

| Prufung | Status | Details |
|---------|--------|---------|
| State-Gesundheit | {ok/korrupt} | {Details} |
| Lock-Status | {frei/gesperrt} | {Details} |
| Provider-Authentifizierung | {ok/fehlgeschlagen} | {Details} |
| Backend-Konnektivitat | {ok/fehlgeschlagen} | {Details} |
| Ressourcen-Drift | {keiner/erkannt} | {Details} |
| Konfigurations-Gultigkeit | {ok/Fehler} | {Details} |

Ursache: {Erklarung}
```

### Schritt 3: Behebung

```
──────────────────────────────────────────────────────────────
LOSUNG
──────────────────────────────────────────────────────────────
```

Bereitstellen:
1. **Sofortige Behebung** -- Befehle zur sofortigen Losung
2. **Erklarung** -- Warum dies passiert ist
3. **Pravention** -- Wie ein erneutes Auftreten verhindert werden kann

### Schritt 4: Verifizierung

```bash
# Losung uberprufen
tofu validate
tofu plan
tofu state list
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
| Ursache | {cause} |
| Angewendete Losung | {fix} |
| Status | Behoben / Aktion erforderlich |

──────────────────────────────────────────────────────────────
PRAVENTION
──────────────────────────────────────────────────────────────

- [ ] {Praventionsmassnahme 1}
- [ ] {Praventionsmassnahme 2}
- [ ] {Monitoring-Empfehlung}
```
