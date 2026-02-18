---
name: workflow-analyze
description: Die Analysephase durchführen - Recherche, Exploration und Identifikation von Einschränkungen
arguments:
  - name: focus
    description: Spezifischer Bereich zur Analyse (market, technical, competitors)
    required: false
---

# /workflow:analyze

## Mission

Die Analysephase des Enterprise-Workflow-Tracks durchführen. Diese Phase konzentriert sich auf Recherche, Exploration und die Identifikation von Einschränkungen, bevor die detaillierte Planung beginnt.

## Wann verwenden

- **Enterprise-Track**-Projekte
- Neue Plattformen oder größere Initiativen
- Wenn das Domänenwissen begrenzt ist
- Vor der Festlegung auf einen technischen Ansatz

## Plan-Modus

> Der Plan-Modus wird automatisch aktiviert, wenn der Umfang mehrere Module umfasst oder eine modulübergreifende Untersuchung erfordert.

## Workflow

### Schritt 1: Analyse-Setup

```
╔══════════════════════════════════════════════════════════╗
║            ANALYSEPHASE - START                           ║
╠══════════════════════════════════════════════════════════╣
║ Track: Enterprise                                         ║
║ Phase: 1 von 4 - Analyse                                  ║
║                                                           ║
║ Ziele:                                                    ║
║ • Die Problemdomäne verstehen                             ║
║ • Bestehende Lösungen recherchieren                       ║
║ • Technische Einschränkungen identifizieren               ║
║ • Risiken und Chancen dokumentieren                       ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 2: Recherchebereiche

**Geführte Recherchefragen:**

```
┌─────────────────────────────────────────────────────────┐
│ DOMÄNEN-RECHERCHE                                        │
├─────────────────────────────────────────────────────────┤
│ 1. Welches Problem lösen wir?                            │
│ 2. Wer sind die wichtigsten Stakeholder?                 │
│ 3. Was sind die geschäftlichen Treiber?                  │
│ 4. Wie sieht Erfolg aus?                                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ MARKT-RECHERCHE                                          │
├─────────────────────────────────────────────────────────┤
│ 1. Welche bestehenden Lösungen gibt es?                  │
│ 2. Was machen die Wettbewerber?                          │
│ 3. Was sind die Best Practices der Branche?              │
│ 4. Welche aufkommenden Trends gibt es?                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ TECHNISCHE RECHERCHE                                     │
├─────────────────────────────────────────────────────────┤
│ 1. Welche Technologien könnten wir einsetzen?            │
│ 2. Welche Integrationsanforderungen gibt es?             │
│ 3. Welche Skalierbarkeitsanforderungen bestehen?         │
│ 4. Welche Sicherheits-/Compliance-Anforderungen gibt es? │
└─────────────────────────────────────────────────────────┘
```

### Schritt 3: Context7-Recherche (Optional)

Wenn MCP Context7 konfiguriert ist, für technische Recherche verwenden:

```
Context7 MCP für aktuelle Dokumentation verwenden...

Recherche:
• Neueste Stripe API Best Practices
• Aktuelle Sicherheitsstandards für Zahlungsverarbeitung
• PCI DSS Compliance-Anforderungen
```

### Schritt 4: Identifikation von Einschränkungen

Entdeckte Einschränkungen dokumentieren:

```
╔══════════════════════════════════════════════════════════╗
║          IDENTIFIZIERTE EINSCHRÄNKUNGEN                   ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ TECHNISCHE EINSCHRÄNKUNGEN:                               ║
║ • Muss in bestehendes Symfony 7.x Backend integriert werden║
║ • Datenbank: PostgreSQL (bestehend, nicht änderbar)       ║
║ • Muss Mobile Apps über bestehende API unterstützen       ║
║                                                           ║
║ GESCHÄFTLICHE EINSCHRÄNKUNGEN:                            ║
║ • Budget: Auf bestehendes Team beschränkt                 ║
║ • Zeitplan: MVP benötigt in Q2 2026                       ║
║ • Abwärtskompatibilität muss erhalten bleiben             ║
║                                                           ║
║ REGULATORISCHE EINSCHRÄNKUNGEN:                           ║
║ • DSGVO-Konformität erforderlich (EU-Benutzer)            ║
║ • PCI DSS für Zahlungsverarbeitung                        ║
║                                                           ║
║ RESSOURCEN-EINSCHRÄNKUNGEN:                               ║
║ • Team: 2 Backend-, 1 Frontend-Entwickler                 ║
║ • Keine dedizierte DevOps-Ressource                       ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 5: Risiko- & Chancenanalyse

```
╔══════════════════════════════════════════════════════════╗
║            RISIKEN & CHANCEN                              ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ RISIKEN:                                                  ║
║ ┌─────────┬──────────┬────────────┬───────────────────┐  ║
║ │ Risiko  │ Auswirk. │ Wahrsch.   │ Maßnahme          │  ║
║ ├─────────┼──────────┼────────────┼───────────────────┤  ║
║ │ Stripe  │ Hoch     │ Niedrig    │ Fallback-Anbieter │  ║
║ │ Ausfall │          │            │                   │  ║
║ ├─────────┼──────────┼────────────┼───────────────────┤  ║
║ │ Zeitplan│ Mittel   │ Mittel     │ MVP-Umfang        │  ║
║ │ Verzug  │          │            │ reduzieren        │  ║
║ └─────────┴──────────┴────────────┴───────────────────┘  ║
║                                                           ║
║ CHANCEN:                                                  ║
║ • Stripe's neue Payment Elements nutzen                   ║
║ • Potenzial für Abo-Modell-Erweiterung                    ║
║ • Mobile Payment (Apple Pay, Google Pay) bereit           ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Schritt 6: Analyse-Artefakte erstellen

Analysedokumente erstellen:

```
project-management/
└── analysis/
    ├── research-summary.md      # Wichtigste Ergebnisse
    ├── constraints.md           # Alle identifizierten Einschränkungen
    ├── risks-opportunities.md   # Risikoregister & Chancen
    └── technical-options.md     # Technologiebewertung
```

### Schritt 7: Phasenabschluss

```
╔══════════════════════════════════════════════════════════╗
║            ANALYSEPHASE ABGESCHLOSSEN                     ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Erstellte Artefakte:                                      ║
║ ✅ research-summary.md                                    ║
║ ✅ constraints.md                                         ║
║ ✅ risks-opportunities.md                                 ║
║ ✅ technical-options.md                                   ║
║                                                           ║
║ Wichtigste Ergebnisse:                                    ║
║ • 4 technische Einschränkungen identifiziert              ║
║ • 3 geschäftliche Einschränkungen identifiziert           ║
║ • 5 Risiken mit Maßnahmen dokumentiert                    ║
║ • 3 Chancen zur Berücksichtigung                          ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ NÄCHSTE PHASE: Planung                                    ║
║ Befehl: /workflow:plan                                    ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ Die Analyse wird die PRD-Erstellung und Architektur       ║
║ informieren.                                              ║
╚══════════════════════════════════════════════════════════╝
```

## Beteiligte Agenten

- **research-assistant**: Technische Recherche und Dokumentationssuche
- **product-owner**: Geschäftskontext und Stakeholder-Analyse

## Ausgabedateien

| Datei | Zweck |
|-------|-------|
| `analysis/research-summary.md` | Zusammengefasste Rechercheergebnisse |
| `analysis/constraints.md` | Technische, geschäftliche, regulatorische Einschränkungen |
| `analysis/risks-opportunities.md` | Risikoregister mit Maßnahmen |
| `analysis/technical-options.md` | Technologiebewertung und Empfehlungen |

## Verwandte Befehle

- `/workflow:init` - Workflow initialisieren (muss zuerst ausgeführt werden)
- `/workflow:plan` - Nächste Phase: Planung
- `/workflow:status` - Fortschritt prüfen
- `/common:research-context7` - Vertiefte Recherche mit Context7 MCP
