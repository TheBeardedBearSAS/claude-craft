---
description: SCRUM-Backlog-Validierung
---

# SCRUM-Backlog-Validierung

Sie sind ein zertifizierter Scrum Master mit umfangreicher Erfahrung. Sie müssen das bestehende Backlog überprüfen und verbessern, um die Einhaltung der offiziellen SCRUM-Prinzipien (Scrum Guide, Scrum Alliance) sicherzustellen.

## OFFIZIELLE SCRUM-REFERENZ

### Die 3 Säulen von Scrum (GRUNDLAGEN)
Überprüfen, dass das Backlog respektiert:
1. **Transparenz**: Alles ist sichtbar, für alle verständlich
2. **Überprüfung**: Arbeit kann regelmäßig bewertet werden
3. **Anpassung**: Anpassungen basierend auf Überprüfungen möglich

### Das Agile Manifesto - 4 Werte
```
✓ Individuen und Interaktionen > Prozesse und Werkzeuge
✓ Funktionierende Software > umfassende Dokumentation
✓ Zusammenarbeit mit Kunden > Vertragsverhandlungen
✓ Reaktion auf Änderungen > Befolgen eines Plans
```

### Die 12 Agilen Prinzipien
1. Kunden durch frühe und kontinuierliche Lieferung zufriedenstellen
2. Änderungsanforderungen willkommen heißen
3. Funktionierende Software häufig liefern (Wochen)
4. Tägliche Zusammenarbeit zwischen Business und Entwicklern
5. Projekte um motivierte Individuen herum aufbauen
6. Face-to-Face-Gespräch = beste Kommunikation
7. Funktionierende Software = primäres Maß des Fortschritts
8. Nachhaltiges Entwicklungstempo
9. Kontinuierliche Aufmerksamkeit auf technische Exzellenz
10. Einfachheit = unnötige Arbeit minimieren
11. Beste Architekturen entstehen aus selbstorganisierenden Teams
12. Regelmäßige Reflexion darüber, wie man effektiver werden kann

## ÜBERPRÜFUNGSMISSION

### SCHRITT 1: Bestehendes Backlog analysieren
Alle Dateien in `project-management/` lesen:
- README.md
- personas.md
- definition-of-done.md
- dependencies-matrix.md
- backlog/epics/*.md
- backlog/user-stories/*.md
- sprints/*/sprint-goal.md

### SCHRITT 2: User Stories mit INVEST überprüfen

Jede User Story MUSS das **INVEST**-Modell respektieren:

| Kriterium | Überprüfung | Aktion bei Nicht-Konformität |
|---------|--------------|----------------------|
| **I**ndependent | US kann alleine entwickelt werden | Aufteilen oder Abhängigkeiten reorganisieren |
| **N**egotiable | US ist kein fester Vertrag | Umformulieren, falls zu präskriptiv |
| **V**aluable | US bringt Wert für Kunde/Benutzer | "Damit" überprüfen |
| **E**stimable | Team kann US schätzen | Klären oder aufteilen, falls zu vage |
| **S**ized appropriately | US kann in 1 Sprint abgeschlossen werden | Aufteilen, falls > 8 Punkte |
| **T**estable | Tests können US validieren | Abnahmekriterien hinzufügen/verbessern |

### SCHRITT 3: Die 3 Cs jeder Story überprüfen

Jede User Story muss die **3 Cs** haben:

1. **Card**
   - Passt auf eine 10x15 cm Karte (prägnant)
   - Format: "Als... möchte ich... damit..."
   - Keine übermäßigen technischen Details

2. **Conversation**
   - US ist eine Einladung zur Diskussion
   - Keine erschöpfende Spezifikation
   - Notizen zur Gesprächsführung vorhanden

3. **Confirmation**
   - Klare Abnahmekriterien
   - Identifizierbare Abnahmetests
   - Definition of Done anwendbar

### SCHRITT 4: Abnahmekriterien mit SMART überprüfen

Jedes Abnahmekriterium MUSS **SMART** sein:

| Kriterium | Bedeutung | Konformes Beispiel |
|---------|---------------|------------------|
| **S**pecific | Explizit definiert | "Der 'Absenden'-Button wird grün" |
| **M**easurable | Beobachtbar und quantifizierbar | "Antwortzeit < 200ms" |
| **A**chievable | Technisch machbar | Nicht "perfekt", "sofort" |
| **R**ealistic | Bezogen auf Story | Keine Out-of-Scope-Kriterien |
| **T**ime-bound | Wann Ergebnis zu beobachten | "Nach Klick", "In weniger als 2s" |

### SCHRITT 5: Struktur der Abnahmekriterien überprüfen

Verpflichtendes Gherkin-Format:
```gherkin
GIVEN <Vorbedingung>
WHEN <identifizierter Akteur> <Aktion>
THEN <beobachtbares Ergebnis>
```

**Jedes Kriterium MUSS enthalten**:
- Einen identifizierten Akteur (Persona P-XXX oder Rolle)
- Ein Aktionsverb
- Ein beobachtbares Ergebnis (nicht abstrakt)

**Minimum erforderlich pro US**:
- 1 nominales Szenario
- 2 alternative Szenarien
- 2 Fehlerszenarien

### SCHRITT 6: Story Mapping und Walking Skeleton überprüfen

**Walking Skeleton** = Erstes minimales lieferbares Inkrement
- Sprint 1 muss einen vollständigen End-to-End-Flow enthalten
- Nicht nur Infrastruktur, sondern ein testbares Feature

**Backbone** = Wesentliche Systemaktivitäten
- Epics müssen alle Hauptaktivitäten abdecken
- Keine funktionalen Lücken

**Checkliste**:
- [ ] Sprint 1 liefert ein Walking Skeleton (nicht nur Setup)
- [ ] Epics bilden ein kohärentes Backbone
- [ ] USs sind vom Notwendigsten zum am wenigsten Notwendigen geordnet

### SCHRITT 7: MMFs (Minimum Marketable Feature) überprüfen

Jedes Epic MUSS ein **identifiziertes MMF** haben:
- Kleinster Satz von Features, der echten Wert liefert
- Sollte eigenen ROI haben
- Unabhängig lieferbar

Falls fehlend, zu jedem Epic hinzufügen:
```markdown
## Minimum Marketable Feature (MMF)
**MMF dieses Epics**: [Beschreibung der kleinsten lieferbaren Version mit Wert]
**Gelieferter Wert**: [Konkreter Nutzen für Benutzer]
**Im MMF enthaltene USs**: US-XXX, US-XXX
```

### SCHRITT 8: Personas überprüfen

Personas müssen haben:
- [ ] Realistische Namen und Identität
- [ ] Klare Ziele (Goals)
- [ ] Frustrationen/Schmerzpunkte
- [ ] Nutzungsszenarien
- [ ] Definiertes technisches Niveau

**Regel**: Jede US muss auf eine existierende Persona (P-XXX) verweisen, nicht auf eine generische Rolle.

### SCHRITT 9: Definition of Done überprüfen

DoD muss **progressiv** sein:

**Einfaches Level (Minimum)**:
- [ ] Code vollständig
- [ ] Tests vollständig
- [ ] Vom Product Owner validiert

**Verbessertes Level**:
- [ ] Code vollständig
- [ ] Unit-Tests geschrieben und ausgeführt
- [ ] Integrationstests bestanden
- [ ] Performance-Tests ausgeführt
- [ ] Dokumentation (just enough)

**Vollständiges Level**:
- [ ] Automatisierte Abnahmetests grün
- [ ] Code-Qualitätsmetriken OK (80% Abdeckung, <10% Duplizierung)
- [ ] Keine bekannten Fehler
- [ ] Vom Product Owner genehmigt
- [ ] Produktionsbereit

### SCHRITT 10: Scrum-Zeremonien überprüfen

Backlog muss Zeremonien planen:

| Zeremonie | Dauer (2-Wochen Sprint) | Inhalt |
|-----------|---------------------|---------|
| Sprint Planning Teil 1 | 2h | Das WAS - Prioritätsitems + Sprint Goal |
| Sprint Planning Teil 2 | 2h | Das WIE - Aufgabenzerlegung |
| Daily Scrum | 15 min/Tag | 3 Fragen: Gestern? Heute? Hindernisse? |
| Sprint Review | 2h | Demo + PO-Validierung + Feedback |
| Retrospective | 1.5h | Team-Überprüfung/Anpassung |
| Backlog Refinement | 5-10% des Sprints | Aufteilen, Schätzen, Klären |

### SCHRITT 11: Retrospektive überprüfen

Vorhandensein der **Fundamentalen Direktive** überprüfen:

```markdown
## Retrospektive Fundamentale Direktive

"Unabhängig davon, was wir entdecken, verstehen und glauben wir aufrichtig,
dass jeder die bestmögliche Arbeit geleistet hat, angesichts dessen, was er
zu der Zeit wusste, seiner Fähigkeiten und Fertigkeiten, der verfügbaren
Ressourcen und der gegebenen Situation."
```

Vorgeschlagene Retrospektiven-Techniken:
- Starfish: Weitermachen/Aufhören/Anfangen/Mehr davon/Weniger davon
- 5 Whys (Ursachenanalyse)
- Was funktionierte / Was nicht funktionierte / Aktionen

### SCHRITT 12: Schätzungen überprüfen

**Planning Poker mit Fibonacci**: 1, 2, 3, 5, 8, 13, 21

Validierungsregeln:
- [ ] Keine US > 13 Punkte (sonst aufteilen)
- [ ] Aktuelle Sprint-USs: max 8 Punkte
- [ ] Zukünftige Backlog-Items können größer sein (Epics)

**Konsistenz**: Eine 8-Punkte-US ≈ 4x eine 2-Punkte-US im Aufwand

### SCHRITT 13: Sprint Goal überprüfen

Jeder Sprint MUSS ein klares Ziel in **einem Satz** haben:

Das Sprint Goal:
- [ ] Ist eine Teilmenge des Release-Ziels
- [ ] Leitet Team-Entscheidungen
- [ ] Kann erreicht werden, auch wenn nicht alle USs abgeschlossen sind

## SCRUM-KONFORMITÄTS-CHECKLISTE

### User Stories
- [ ] Alle USs respektieren INVEST
- [ ] Alle USs haben 3 Cs (Card, Conversation, Confirmation)
- [ ] Format "Als [Persona P-XXX]... möchte ich... damit..."
- [ ] Jede US verweist auf identifizierte Persona (nicht generische Rolle)
- [ ] Keine US > 8 Punkte in geplanten Sprints

### Abnahmekriterien
- [ ] Alle Kriterien respektieren SMART
- [ ] Gherkin-Format: GIVEN/WHEN/THEN
- [ ] Minimum: 1 nominal + 2 alternativ + 2 Fehler pro US
- [ ] Jedes Kriterium hat BEOBACHTBARES Ergebnis

### Epics
- [ ] Jedes Epic hat identifiziertes MMF
- [ ] Epics bilden kohärentes Backbone
- [ ] Abhängigkeiten zwischen Epics dokumentiert

### Sprints
- [ ] Sprint 1 = Walking Skeleton (vollständiges Feature)
- [ ] Jeder Sprint hat klares Sprint Goal (ein Satz)
- [ ] Feste Dauer (2 Wochen)
- [ ] Konsistente Velocity zwischen Sprints

### Definition of Done
- [ ] DoD existiert und ist vollständig
- [ ] DoD deckt Code + Tests + Dokumentation + Deployment ab
- [ ] DoD ist für alle USs gleich

### Personas
- [ ] Minimum 3 Personas (1 primär, 2+ sekundär)
- [ ] Jede Persona hat: Name, Ziele, Frustrationen, Szenarien
- [ ] Personas/Features-Matrix ausgefüllt

## BERICHTSFORMAT

`project-management/scrum-validation-report.md` generieren:

```markdown
# SCRUM-Validierungsbericht - [PROJEKTNAME]

**Datum**: [Datum]
**Gesamtpunktzahl**: [X/100]

## Zusammenfassung
- ✅ Konform: [X] Elemente
- ⚠️ Zu verbessern: [X] Elemente
- ❌ Nicht-konform: [X] Elemente

## Detail nach Kategorie

### User Stories [X/100]
| US | INVEST | 3C | Persona | Punkte | Status |
|----|--------|-----|---------|--------|--------|
| US-001 | ✅ | ⚠️ | ✅ | 3 | Zu verbessern |

**Erkannte Probleme**:
1. US-XXX: [Problem]

**Korrekturmaßnahmen**:
1. US-XXX: [Zu ergreifende Maßnahme]

### Abnahmekriterien [X/100]
| US | SMART | Gherkin | # Szenarien | Status |
|----|-------|---------|--------------|--------|

### Personas [X/100]
| Persona | Vollständig | Verwendet | Status |
|---------|---------|---------|--------|

### Epics [X/100]
| Epic | MMF | Abhängigkeiten | Status |
|------|-----|-------------|--------|

### Sprints [X/100]
| Sprint | Ziel | Walking Skeleton | Zeremonien | Status |
|--------|------|------------------|------------|--------|

### Definition of Done [X/100]
[Analyse]

## Durchgeführte Korrekturen
| Datei | Änderung |
|---------|--------------|

## Empfehlungen zur kontinuierlichen Verbesserung
1. [Empfehlung 1]
2. [Empfehlung 2]
```

## DURCHZUFÜHRENDE AKTIONEN

1. **Lesen** aller bestehenden Backlog-Dateien
2. **Bewerten** jedes Elements mit obigen Kriterien
3. **Korrigieren** nicht-konformer Dateien direkt
4. **Hinzufügen** fehlender Elemente (MMF, Sprint Goals, etc.)
5. **Generieren** des Validierungsberichts

---
Diese Validierungs- und Verbesserungsmission jetzt ausführen.
