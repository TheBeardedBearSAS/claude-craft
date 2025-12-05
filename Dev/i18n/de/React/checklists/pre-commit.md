# Pre-Commit-Checkliste - React

## Schnellvalidierung vor jedem Commit

### Code-Qualität

- [ ] Code ist formatiert (`npm run format` oder `pnpm format`)
- [ ] Keine Linting-Fehler (`npm run lint`)
- [ ] TypeScript kompiliert ohne Fehler (`npm run type-check`)
- [ ] Keine ungenutzten Imports oder Variablen
- [ ] Keine `console.log` oder `debugger` Anweisungen

### Tests

- [ ] Alle Tests bestehen (`npm test`)
- [ ] Neue Tests für neue Features hinzugefügt
- [ ] Geänderte Tests spiegeln Änderungen wider
- [ ] Testabdeckung beibehalten oder verbessert

### Build

- [ ] Anwendung baut erfolgreich (`npm run build`)
- [ ] Keine Build-Warnungen
- [ ] Bundle-Größe ist akzeptabel

### Sicherheit

- [ ] Keine hartcodierten Secrets oder API-Keys
- [ ] Keine sensiblen Daten in Kommentaren
- [ ] Benutzereingaben werden validiert

### Dokumentation

- [ ] Code-Kommentare sind klar und nützlich
- [ ] Props sind dokumentiert (JSDoc/TSDoc)
- [ ] README bei Bedarf aktualisiert
- [ ] CHANGELOG bei Bedarf aktualisiert

### Git

- [ ] Commit-Nachricht ist klar und folgt Konventionen
- [ ] Branch ist mit main/develop aktuell
- [ ] Keine unnötigen Dateien committed
- [ ] .gitignore wird respektiert

## Automatische Validierung (Husky + Lint-staged)

### Konfigurationsbeispiel

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "vitest related --run"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

## Schnellbefehle

```bash
# Vollständige Validierung
npm run quality    # lint + type-check + test

# Schnellkorrektur
npm run lint:fix   # Auto-Fix von Lint-Fehlern
npm run format     # Alle Dateien formatieren

# Build überprüfen
npm run build      # Produktions-Build
```

## Häufige Probleme

### Formatierung

```bash
# Alle Dateien formatieren
npm run format

# Formatierung prüfen ohne zu ändern
npm run format:check
```

### Linting

```bash
# Fehler automatisch beheben
npm run lint:fix

# Spezifische Datei prüfen
eslint src/components/MyComponent.tsx
```

### TypeScript

```bash
# Typen prüfen
npm run type-check

# Watch-Modus
tsc --noEmit --watch
```

### Tests

```bash
# Alle Tests ausführen
npm test

# Spezifischen Test ausführen
npm test -- Button.test.tsx

# Snapshots aktualisieren
npm test -- -u
```

## Vor dem Push

- [ ] Alle Commits folgen Konventionen
- [ ] Branch ist auf main/develop rebased
- [ ] Konflikte sind gelöst
- [ ] CI/CD-Pipeline wird durchlaufen

## Hinweise

- Konfigurieren Sie Pre-Commit-Hooks mit Husky für automatische Validierung
- Verwenden Sie lint-staged, um nur geänderte Dateien zu prüfen
- Halten Sie Commits klein und fokussiert
- Schreiben Sie klare Commit-Nachrichten
