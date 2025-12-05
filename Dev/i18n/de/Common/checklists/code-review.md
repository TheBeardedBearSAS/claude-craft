# Code Review Checkliste

## Vor Beginn des Reviews

- [ ] Ich habe die PR-Beschreibung gelesen
- [ ] Ich verstehe das Ziel der Änderungen
- [ ] Ich habe die zugehörigen Tickets überprüft
- [ ] Ich habe den notwendigen Kontext für das Review

---

## Review-Checkliste

### 1. Design & Architektur

- [ ] Änderungen sind konsistent mit der bestehenden Architektur
- [ ] Verantwortlichkeiten sind gut getrennt (SRP)
- [ ] Keine starke Kopplung eingeführt
- [ ] Abstraktionen befinden sich auf der richtigen Ebene
- [ ] Verwendete Patterns sind angemessen
- [ ] Kein Over-Engineering

### 2. Code-Qualität

#### Lesbarkeit
- [ ] Code ist leicht zu lesen und zu verstehen
- [ ] Variablen-/Funktionsnamen sind aussagekräftig
- [ ] Funktionen tun nur eine Sache
- [ ] Funktionen haben eine angemessene Länge (< 50 Zeilen)
- [ ] Code ist selbstdokumentierend

#### Wartbarkeit
- [ ] Code ist leicht modifizierbar
- [ ] Kein duplizierter Code
- [ ] Magic Numbers werden vermieden (benannte Konstanten)
- [ ] Abhängigkeiten sind korrekt verwaltet

#### Standards
- [ ] Namenskonventionen werden eingehalten
- [ ] Formatierung ist korrekt (Linter)
- [ ] Imports sind organisiert
- [ ] Kein unnötiger auskommentierter Code
- [ ] Keine TODOs ohne zugehöriges Ticket

### 3. Logik & Funktionalität

- [ ] Geschäftslogik ist korrekt
- [ ] Edge Cases werden behandelt
- [ ] Grenzbedingungen werden überprüft
- [ ] Keine offensichtlichen Bugs
- [ ] Erwartetes Verhalten ist implementiert

### 4. Fehlerbehandlung

- [ ] Fehler werden angemessen behandelt
- [ ] Fehlermeldungen sind klar und hilfreich
- [ ] Exceptions werden korrekt verwendet
- [ ] Fehlerfälle sind abgedeckt
- [ ] Angemessenes Logging bei Fehlern

### 5. Sicherheit

- [ ] Keine SQL-Injection möglich
- [ ] Kein XSS möglich
- [ ] Keine Secrets im Code
- [ ] Validierung von Benutzereingaben
- [ ] Autorisierung geprüft falls notwendig
- [ ] Sensible Daten geschützt

### 6. Performance

- [ ] Keine N+1 Queries
- [ ] Keine teuren Operationen in Schleifen
- [ ] Indizes korrekt verwendet
- [ ] Angemessenes Caching
- [ ] Keine Memory Leaks
- [ ] Akzeptable algorithmische Komplexität

### 7. Tests

- [ ] Unit Tests vorhanden und relevant
- [ ] Tests decken Normalfälle ab
- [ ] Tests decken Fehlerfälle ab
- [ ] Tests sind lesbar
- [ ] Tests sind unabhängig
- [ ] Keine flaky Tests

### 8. Dokumentation

- [ ] Code selbstdokumentierend oder kommentiert bei Komplexität
- [ ] API dokumentiert falls öffentlich
- [ ] README aktualisiert falls notwendig
- [ ] Konfigurationsänderungen dokumentiert

---

## Kommentartypen

### Blockierend (❌)
Muss vor dem Merge behoben werden.
```
❌ Diese Query kann SQL-Injection verursachen
```

### Wichtig (⚠️)
Sollte behoben werden, außer begründet.
```
⚠️ Diese Funktion könnte von Extraktion profitieren
```

### Vorschlag (💡)
Mögliche Verbesserung, nicht verpflichtend.
```
💡 Wir könnten diese Bedingung vereinfachen
```

### Frage (❓)
Bitte um Klärung.
```
❓ Warum diese Implementierungswahl?
```

### Positiv (✅)
Positives Feedback zum Code.
```
✅ Gute Verwendung des Patterns hier!
```

---

## Best Practices für Reviewer

1. **Seien Sie konstruktiv** - Kritisieren Sie den Code, nicht die Person
2. **Seien Sie präzise** - Geben Sie Beispiele oder Vorschläge
3. **Seien Sie respektvoll** - Verwenden Sie einen wohlwollenden Ton
4. **Seien Sie reaktionsschnell** - Antworten Sie schnell auf Diskussionen
5. **Seien Sie konsistent** - Wenden Sie die gleichen Standards bei allen an

## Best Practices für Autoren

1. **Kontext bereitstellen** - Klare PR-Beschreibung
2. **Kleine PRs** - Leichter zu reviewen
3. **Self-Review** - Vor Anforderung eines Reviews erneut durchlesen
4. **Auf Kommentare antworten** - Nicht ignorieren
5. **Lernen** - Feedback zur Verbesserung nutzen

---

## Review-Entscheidung

- [ ] **Genehmigt** - Bereit zum Merge
- [ ] **Änderungen anfordern** - Änderungen erforderlich
- [ ] **Kommentar** - Fragen oder Vorschläge ohne Blockierung
