# Pre-Commit Checkliste

Diese Checkliste muss **vor jedem Commit** validiert werden.

---

## Code-Qualität

- [ ] Code gelintet mit 0 Fehlern (`npm run lint`)
- [ ] Code mit Prettier formatiert (`npm run format`)
- [ ] TypeScript kompiliert ohne Fehler (`npm run type-check`)
- [ ] Keine vergessenen `console.log` (außer beabsichtigte Logs)
- [ ] Keine `// TODO` oder `// FIXME` ohne zugehöriges Issue hinzugefügt
- [ ] Kein auskommentierter Code (löschen oder Issue erstellen)

---

## Tests

- [ ] Unit Tests für neue Logik hinzugefügt
- [ ] Komponententests für neue UI hinzugefügt
- [ ] Alle Tests bestanden (`npm test`)
- [ ] Coverage aufrechterhalten oder verbessert
- [ ] E2E Tests aktualisiert falls notwendig

---

## Code-Standards

- [ ] Namenskonventionen eingehalten
- [ ] Imports korrekt organisiert
- [ ] Keine Code-Duplizierung (DRY)
- [ ] JSDoc-Kommentare für öffentliche Funktionen
- [ ] Vollständige TypeScript-Typen (kein `any`)
- [ ] React.memo Komponenten falls notwendig
- [ ] useCallback/useMemo korrekt verwendet

---

## Performance

- [ ] Keine teuren Berechnungen ohne Memoization
- [ ] Bilder optimiert (Größe, Format)
- [ ] FlatList optimiert (falls zutreffend)
- [ ] Keine Inline-Funktionen in Renders
- [ ] Keine Inline-Style-Objekte
- [ ] Animationen verwenden `useNativeDriver`

---

## Sicherheit

- [ ] Keine Secrets/Tokens im Code
- [ ] Eingabevalidierung vorhanden
- [ ] Sensible Daten in SecureStore
- [ ] API-Calls verwenden HTTPS
- [ ] Keine Dependency-Schwachstellen (`npm audit`)

---

## Architektur

- [ ] Etablierte Architektur respektieren
- [ ] Single Responsibility (SRP)
- [ ] Trennung der Belange
- [ ] Keine enge Kopplung
- [ ] Dependency Injection verwendet

---

## Dokumentation

- [ ] README aktualisiert falls notwendig
- [ ] JSDoc für neue APIs hinzugefügt
- [ ] Kommentare für komplexe Logik
- [ ] CHANGELOG aktualisiert
- [ ] Types dokumentiert

---

## Git

- [ ] Commit-Message folgt Conventional Commits
- [ ] Atomarer Commit (einzelnes Feature/Fix)
- [ ] Keine irrelevanten Dateien committed
- [ ] .gitignore respektiert
- [ ] Branch aktuell mit main/develop

---

## Abschließende Prüfung

- [ ] Vollständiges Diff überprüft
- [ ] Feature manuell getestet
- [ ] Keine undokumentierten Breaking Changes
- [ ] Bereit für Code Review

---

**Wenn alle Punkte abgehakt sind ✅ → Commit autorisiert**
