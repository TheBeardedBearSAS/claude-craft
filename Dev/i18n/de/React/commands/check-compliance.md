---
description: Compliance-Überprüfung
---

# Compliance-Überprüfung

Überprüfe die Einhaltung von Coding-Standards und Best Practices.

## Aufgabe

1. **Coding-Standards**
   - Überprüfe ESLint-Regeln-Einhaltung
   - Validiere Prettier-Konfiguration
   - Prüfe Namenskonventionen
   - Bewerte Code-Konsistenz

2. **TypeScript-Strict Mode**
   - Validiere strict: true
   - Überprüfe noImplicitAny
   - Prüfe strictNullChecks
   - Bewerte Type-Safety

3. **React-Best-Practices**
   - Überprüfe Hook-Regeln
   - Validiere Komponenten-Patterns
   - Prüfe State-Management
   - Bewerte Prop-Types-Nutzung

4. **Barrierefreiheits-Standards**
   - Überprüfe WCAG 2.1 AA-Konformität
   - Validiere ARIA-Attribute
   - Prüfe Tastaturnavigation
   - Bewerte Screenreader-Kompatibilität

5. **Sicherheits-Standards**
   - Überprüfe OWASP-Best-Practices
   - Validiere Input-Sanitization
   - Prüfe XSS-Prävention
   - Bewerte CSRF-Schutz

6. **Performance-Standards**
   - Überprüfe Bundle-Größen-Limits
   - Validiere Lighthouse-Scores
   - Prüfe Core Web Vitals
   - Bewerte Ladezeiten

7. **Testing-Standards**
   - Überprüfe Test-Coverage-Limits (>80%)
   - Validiere Test-Organisation
   - Prüfe Test-Patterns
   - Bewerte Test-Qualität

8. **Dokumentations-Standards**
   - Überprüfe JSDoc/TSDoc-Vollständigkeit
   - Validiere README-Qualität
   - Prüfe API-Dokumentation
   - Bewerte Kommentar-Qualität

9. **Git-Workflow-Standards**
   - Überprüfe Conventional Commits
   - Validiere Branch-Namenskonventionen
   - Prüfe PR-Template-Nutzung
   - Bewerte Commit-Qualität

10. **Abhängigkeits-Standards**
    - Überprüfe Paket-Versionen
    - Validiere Sicherheits-Audits
    - Prüfe Lizenz-Compliance
    - Bewerte Abhängigkeits-Aktualität

## Compliance-Checkliste

```markdown
## Code-Standards
- [ ] ESLint: 0 Fehler, 0 Warnungen
- [ ] Prettier: Alle Dateien formatiert
- [ ] TypeScript: Strict Mode aktiviert
- [ ] Namenskonventionen: Konsistent

## Qualität
- [ ] Test-Coverage: >80%
- [ ] Type-Coverage: >95%
- [ ] Code-Duplikation: <3%
- [ ] Zyklomatische Komplexität: <10

## Sicherheit
- [ ] npm audit: 0 Schwachstellen
- [ ] OWASP-Checks: Bestanden
- [ ] Input-Validierung: Implementiert
- [ ] CSP-Headers: Konfiguriert

## Barrierefreiheit
- [ ] WCAG 2.1 AA: Konform
- [ ] Lighthouse A11y: >90
- [ ] Tastaturnavigation: Vollständig
- [ ] Screenreader: Getestet

## Performance
- [ ] Lighthouse Performance: >90
- [ ] Bundle-Größe: <500KB
- [ ] FCP: <1.8s
- [ ] LCP: <2.5s

## Dokumentation
- [ ] README: Vollständig
- [ ] API-Docs: Aktuell
- [ ] JSDoc: >80% Coverage
- [ ] CHANGELOG: Gepflegt
```

## Zu liefern

1. Compliance-Bericht mit Checkliste
2. Nicht-konforme Bereiche identifiziert
3. Aktionsplan zur Behebung
4. Automatisierungs-Vorschläge (CI/CD)
5. Aktualisierte Dokumentation
6. Compliance-Dashboard-Setup
