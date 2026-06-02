---
description: Benutzerfluss-Design
argument-hint: [arguments]
---

# Benutzerfluss-Design

Sie sind ein UX/Ergonomie-Experte. Sie müssen einen vollständigen und optimierten Benutzerfluss entwerfen.

## Argumente
$ARGUMENTS

Argumente:
- Name des zu gestaltenden Flusses
- (Optional) Ziel-Persona
- (Optional) Spezifische Einschränkungen

Beispiel: `/uiux:user-flow "Benutzerregistrierung"` oder `/uiux:user-flow "Checkout" persona:"Mobile Benutzer" constraint:"< 30 Sekunden"`

## Plan-Modus

> **Der Plan-Modus wird empfohlen.** Claude aktiviert den Plan-Modus, um den Ansatz zu strukturieren, Abhängigkeiten zu identifizieren und eine Generierungsstrategie vorzustellen, bevor Artefakte erstellt werden.

## AUFTRAG

### Schritt 1: Kontext definieren

- Benutzerziel
- Ziel-Persona
- Nutzungskontext (Gerät, Umgebung)
- Geschäftseinschränkungen

### Schritt 2: Fluss entwerfen

```
══════════════════════════════════════════════════════════════
🧭 BENUTZERFLUSS: {NAME}
══════════════════════════════════════════════════════════════

Datum: {date}
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

### Einschränkungen
- Max. Zeit: {X Sekunden/Minuten}
- Max. Schritte: {Y}
- Gerät: {technische Einschränkungen}
- Offline: Ja / Nein

──────────────────────────────────────────────────────────────
🗺️ ÜBERSICHT
──────────────────────────────────────────────────────────────

```
┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐    ┌──────┐
│Start │───▶│Schr 1│───▶│Schr 2│───▶│Schr 3│───▶│ Ende │
└──────┘    └──────┘    └──────┘    └──────┘    └──────┘
                │            │
                ▼            ▼
           ┌────────┐   ┌────────┐
           │Fehler A│   │Fehler B│
           └────────┘   └────────┘
```

──────────────────────────────────────────────────────────────
📋 DETAILLIERTER FLUSS
──────────────────────────────────────────────────────────────

### Schritt 0: Auslöser

**Einstiegspunkt**: {Wie der Benutzer ankommt}
- Über: {Menü / Link / CTA / Deep-Link}
- Vorheriger Zustand: {angemeldet / anonym / vorhandene Daten}
- Vorbedingungen: {was erfüllt sein muss}

---

### Schritt 1: {Schrittname}

**Bildschirm**: {Bildschirmname}
**Ziel**: {Was der Benutzer tun muss}

#### Verfügbare Aktionen
| Aktion | UI-Element | Ergebnis |
|--------|------------|----------|
| Primär | {Schaltfläche/Link} | Weiter zu Schritt 2 |
| Sekundär | {Schaltfläche/Link} | {Alternative} |
| Tertiär | {Link} | {Andere Option} |

#### Erforderliche Daten
| Feld | Typ | Validierung | Pflichtfeld |
|------|-----|-------------|-------------|
| {Feld} | {Typ} | {Regeln} | Ja/Nein |

#### System-Feedback
| Ereignis | Feedback | Typ |
|----------|----------|-----|
| Eingabe-Fokus | {Feedback} | Visuell |
| Validierungsfehler | {Meldung} | Inline |
| Erfolg | {Feedback} | Toast/Inline |

#### Aufmerksamkeitspunkte
- ⚠️ {potenzielle Reibung}
- 💡 {Verbesserungsmöglichkeit}

---

### Schritt 2: {Schrittname}

{Gleiche Struktur …}

---

### Schritt N: Bestätigung (Ende)

**Bildschirm**: {Bestätigung / Erfolg}
**Endzustand**: {Was erreicht wurde}

#### Inhalt
- Erfolgsmeldung
- Aktionszusammenfassung
- Vorgeschlagene nächste Schritte

#### Nächste Aktionen
| Aktion | Ziel |
|--------|------|
| Primärer CTA | {nächster Fluss} |
| Zurück | {Dashboard/Liste} |
| Teilen | {falls zutreffend} |

──────────────────────────────────────────────────────────────
⚠️ ALTERNATIVE PFADE
──────────────────────────────────────────────────────────────

### Fehler: {Fehlertyp}

**Auslöser**: {Was den Fehler verursacht}
**Bildschirm**: {Inline / Modal / Dedizierte Seite}

#### Fehlermeldung
```
Titel: {Klarer Titel}
Beschreibung: {Erklärung des Problems}
Aktion: {Wie zu lösen}
```

#### Benutzeroptionen
- Erneut versuchen: {Verhalten}
- Ändern: {Zurück zu Schritt X}
- Abbrechen: {Zustand gespeichert?}

---

### Abbruch: Zustand speichern

**Verhalten**:
- Entwurf automatisch gespeichert
- Aufbewahrungsdauer: {X Tage}
- Erinnerungsbenachrichtigung: Ja / Nein

---

### Randfall: {Beschreibung}

**Situation**: {Besonderer Kontext}
**Verhalten**: {Flussanpassung}

──────────────────────────────────────────────────────────────
📊 METRIKEN & KPIs
──────────────────────────────────────────────────────────────

### Quantitative Ziele

| Metrik | Ziel | Messung |
|--------|------|---------|
| Abschlusszeit | < {X} Sek | Time-on-task |
| Abschlussrate | > {Y}% | Trichteranalyse |
| Fehlerrate | < {Z}% | Fehlerrate |
| Anzahl Klicks | ≤ {N} | Klickverfolgung |
| Zufriedenheitsbewertung | > {S}/5 | Umfrage nach Aufgabe |

### Messpunkte

| Schritt | Zu verfolgender Ereignis |
|---------|--------------------------|
| Einstieg | `flow_started` |
| Schritt 1 | `step_1_completed` |
| Schritt 2 | `step_2_completed` |
| Erfolg | `flow_completed` |
| Abbruch | `flow_abandoned` mit `last_step` |
| Fehler | `flow_error` mit `error_type` |

──────────────────────────────────────────────────────────────
🧠 ERGONOMIE
──────────────────────────────────────────────────────────────

### Kognitive Belastung

| Schritt | Komplexität | Begründung |
|---------|-------------|------------|
| 1 | Niedrig | {1–2 einfache Aktionen} |
| 2 | Mittel | {kurzes Formular} |
| 3 | Niedrig | {nur Bestätigung} |

### Angewandte Prinzipien

| Prinzip | Anwendung |
|---------|-----------|
| Schrittweise Offenlegung | {wie} |
| Standardwerte | {welche} |
| Inline-Validierung | {wann} |
| Automatisches Speichern | {Häufigkeit} |

──────────────────────────────────────────────────────────────
♿ BARRIEREFREIHEIT
──────────────────────────────────────────────────────────────

### Tastaturnavigation
- Tab-Reihenfolge: {logische Sequenz}
- Sprunglinks: {bei langem Formular}
- Fokusverwaltung: {bei Schrittwechsel}

### Screenreader
- Schrittankündigung: „Schritt X von Y"
- Fehler: aria-live="assertive"
- Fortschritt: aria-describedby

### Zeit
- Kein automatisches Zeitlimit
- Falls Verzögerung: verlängerbar oder deaktivierbar

──────────────────────────────────────────────────────────────
✅ VALIDIERUNGS-CHECKLISTE
──────────────────────────────────────────────────────────────

### UX
- [ ] Klares Benutzerziel
- [ ] Minimale notwendige Schritte
- [ ] Feedback bei jeder Aktion
- [ ] Fehlerpfade dokumentiert
- [ ] Abbruch mit Speichern

### Messbarkeit
- [ ] KPIs definiert
- [ ] Tracking-Ereignisse aufgelistet
- [ ] Ziele quantifiziert

### Barrierefreiheit
- [ ] Tastaturnavigation
- [ ] SR-Ankündigungen
- [ ] Keine Zeitlimits
```

### Schritt 3: Validierung

- Überprüfung mit Stakeholdern
- Benutzertest (mind. 5 Benutzer)
- Iteration basierend auf Feedback
