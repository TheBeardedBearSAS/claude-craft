---
description: User Flow Design
argument-hint: [arguments]
---

# User Flow Design

Du bist ein UX/Ergonomie-Experte. Du musst einen vollständigen und optimierten User Flow entwerfen.

## Argumente
$ARGUMENTS

Argumente:
- Name des zu gestaltenden Flows
- (Optional) Ziel-Persona
- (Optional) Spezifische Einschränkungen

Beispiel: `/common:ux-user-flow "Benutzerregistrierung"` oder `/common:ux-user-flow "Checkout" persona:"Mobile Benutzer" einschraenkung:"< 30 Sekunden"`

## MISSION

### Schritt 1: Kontext definieren

- Benutzerziel
- Ziel-Persona
- Nutzungskontext (Gerät, Umgebung)
- Geschäftseinschränkungen

### Schritt 2: Flow entwerfen

```
══════════════════════════════════════════════════════════════
🧭 USER FLOW: {NAME}
══════════════════════════════════════════════════════════════

Datum: {datum}
Version: 1.0

──────────────────────────────────────────────────────────────
👤 KONTEXT
──────────────────────────────────────────────────────────────

### Persona
| Attribut | Wert |
|----------|------|
| Name | {persona} |
| Rolle | {rolle} |
| Technisches Niveau | Anfänger / Fortgeschritten / Experte |
| Hauptgerät | Mobil / Desktop / Beide |
| Kontext | {Nutzungsumgebung} |

### Benutzerziel
> "{Was der Benutzer erreichen möchte}"

### Geschäftsziel
> "{Was das Unternehmen erreichen möchte}"

──────────────────────────────────────────────────────────────
📋 DETAILLIERTER FLOW
──────────────────────────────────────────────────────────────

### Schritt 0: Auslöser
**Einstiegspunkt**: {Wie der Benutzer ankommt}

### Schritt 1: {Schrittname}
**Bildschirm**: {Bildschirmname}
**Ziel**: {Was der Benutzer tun muss}

#### Verfügbare Aktionen
| Aktion | UI-Element | Ergebnis |
|--------|------------|----------|
| Primär | {Button/Link} | Weiter zu Schritt 2 |

#### System-Feedback
| Ereignis | Feedback | Typ |
|----------|----------|-----|
| Validierungsfehler | {Nachricht} | Inline |

──────────────────────────────────────────────────────────────
📊 METRIKEN & KPIs
──────────────────────────────────────────────────────────────

| Metrik | Ziel | Messung |
|--------|------|---------|
| Abschlusszeit | < {X} Sek | Time-on-task |
| Abschlussrate | > {Y}% | Funnel Analytics |
| Anzahl Klicks | ≤ {N} | Click Tracking |

──────────────────────────────────────────────────────────────
✅ VALIDIERUNGS-CHECKLISTE
──────────────────────────────────────────────────────────────

### UX
- [ ] Klares Benutzerziel
- [ ] Minimale notwendige Schritte
- [ ] Feedback bei jeder Aktion
- [ ] Fehlerpfade dokumentiert

### Barrierefreiheit
- [ ] Tastaturnavigation
- [ ] SR-Ankündigungen
- [ ] Keine Zeitlimits
```

### Schritt 3: Validierung

- Review mit Stakeholdern
- Benutzertest (min. 5 Benutzer)
- Iteration basierend auf Feedback
