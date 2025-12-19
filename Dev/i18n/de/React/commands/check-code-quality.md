---
description: Code-Qualitätsprüfung
---

# Code-Qualitätsprüfung

Führe eine umfassende Code-Qualitätsanalyse der React-Codebase durch.

## Aufgabe

1. **Linting und Formatierung**
   - Führe ESLint aus und behebe alle Fehler
   - Überprüfe Prettier-Konformität
   - Validiere Namenskonventionen
   - Prüfe auf ungenutzte Importe

2. **TypeScript-Qualität**
   - Führe Type-Check aus (`tsc --noEmit`)
   - Identifiziere `any`-Nutzung
   - Überprüfe fehlende Return-Typen
   - Validiere Interface-Definitionen

3. **Code-Duplikation**
   - Suche nach dupliziertem Code
   - Identifiziere Refactoring-Möglichkeiten
   - Schlage geteilte Utilities vor
   - Überprüfe DRY-Prinzip-Einhaltung

4. **Komplexität**
   - Analysiere zyklomatische Komplexität
   - Identifiziere zu lange Funktionen
   - Suche nach tief verschachteltem Code
   - Bewerte kognitive Belastung

5. **Komponenten-Qualität**
   - Überprüfe Komponenten-Größe
   - Validiere Props-Definitionen
   - Analysiere Hook-Nutzung
   - Prüfe auf Prop-Drilling

6. **Performance**
   - Identifiziere unnötige Re-Renders
   - Überprüfe Memoization-Nutzung
   - Analysiere Hook-Dependencies
   - Suche nach Performance-Anti-Patterns

7. **Best Practices**
   - Überprüfe React-Best-Practices
   - Validiere Hook-Regeln
   - Prüfe Event-Handler-Patterns
   - Analysiere State-Management

8. **Dokumentation**
   - Überprüfe JSDoc/TSDoc-Kommentare
   - Validiere README-Dokumentation
   - Prüfe auf fehlende Kommentare
   - Bewerte Code-Lesbarkeit

9. **Sicherheit**
   - Scanne auf bekannte Schwachstellen
   - Überprüfe Input-Validierung
   - Validiere XSS-Prävention
   - Prüfe sichere Abhängigkeiten

10. **Metriken**
    - Berechne Maintainability Index
    - Messe Code-Churn
    - Analysiere Test-Coverage
    - Bewerte technische Schuld

## Tools ausführen

```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Tests
npm run test:coverage

# Sicherheits-Audit
npm audit

# Bundle-Analyse
npm run build:analyze
```

## Zu liefern

1. Code-Qualitätsbericht mit Metriken
2. Liste der Probleme nach Schweregrad
3. Refactoring-Vorschläge
4. Performance-Optimierungen
5. Aktionsplan mit Priorisierung
6. Verbesserte Code-Beispiele
