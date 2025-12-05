# Barrierefreiheits-Überprüfung (A11y)

Führe eine umfassende Barrierefreiheitsprüfung der React-Anwendung durch.

## Aufgabe

1. **Analyse der aktuellen Situation**
   - Prüfe auf WCAG 2.1 AA Konformität
   - Identifiziere alle Barrierefreiheitsprobleme
   - Bewerte den Schweregrad jedes Problems

2. **Semantisches HTML**
   - Verwende korrekte HTML5-Tags
   - Stelle sicher, dass Landmarks vorhanden sind
   - Überprüfe die Überschriftenhierarchie

3. **Tastaturnavigation**
   - Teste die vollständige Tastaturnavigation
   - Überprüfe focus-Indikatoren
   - Validiere Tab-Reihenfolge

4. **ARIA-Attribute**
   - Überprüfe korrekte ARIA-Nutzung
   - Validiere aria-labels und aria-describedby
   - Stelle sicher, dass Rollen korrekt sind

5. **Farben und Kontrast**
   - Prüfe Kontrastverhältnisse (mindestens 4.5:1)
   - Stelle sicher, dass Informationen nicht nur über Farbe vermittelt werden
   - Teste mit Farbenblindheitssimulator

6. **Formulare**
   - Überprüfe label-Verknüpfungen
   - Validiere Fehlermeldungen
   - Teste Formularvalidierung mit Screenreader

7. **Bilder und Medien**
   - Überprüfe Alt-Texte
   - Validiere dekorative vs. informative Bilder
   - Stelle sicher, dass Videos Untertitel haben

8. **Screenreader-Tests**
   - Teste mit NVDA (Windows)
   - Teste mit VoiceOver (macOS)
   - Dokumentiere Probleme

9. **Automatisierte Tools**
   - Führe axe-core aus
   - Nutze Lighthouse Accessibility
   - Verwende ESLint jsx-a11y Plugin

10. **Aktionsplan**
    - Priorisiere Probleme (kritisch, hoch, mittel, niedrig)
    - Erstelle Tickets für jeden Fix
    - Schätze Aufwand

## Zu liefern

1. Detaillierter Bericht zu Barrierefreiheitsproblemen
2. Priorisierte Aktionsliste
3. Code-Beispiele für Fixes
4. Testplan für Regression
