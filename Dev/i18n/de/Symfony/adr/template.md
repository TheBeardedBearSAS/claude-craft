# ADR-NNNN: [Kurzer Entscheidungstitel]

**Status**: Proposed | Accepted | Deprecated | Superseded by [ADR-YYYY](YYYY-titel.md)

**Datum**: YYYY-MM-DD

**Entscheider**: [Liste der Personen, die die Entscheidung getroffen haben]

**Tags**: `tag1`, `tag2`, `tag3`

---

## Kontext und Problem

[Beschreiben Sie den Kontext und das Problem, das eine architektonische Entscheidung erfordert. Verwenden Sie 2-3 Absätze zur Erklärung:]
- Was ist die aktuelle Situation?
- Welches Problem haben wir?
- Was sind die Einschränkungen (technisch, geschäftlich, regulatorisch)?
- Warum jetzt? (Dringlichkeit, Gelegenheit)

## Betrachtete Optionen

**Wichtig**: Mindestens 2 Optionen müssen dokumentiert werden, um eine vergleichende Analyse zu demonstrieren.

### Option 1: [Optionsname]

**Beschreibung**: [Kurze Beschreibung der Option]

**Vorteile**:
- ✅ [Vorteil 1]
- ✅ [Vorteil 2]
- ✅ [Vorteil 3]

**Nachteile**:
- ❌ [Nachteil 1]
- ❌ [Nachteil 2]
- ❌ [Nachteil 3]

**Aufwand**: [Schätzung: Niedrig / Mittel / Hoch]

---

### Option 2: [Optionsname]

**Beschreibung**: [Kurze Beschreibung der Option]

**Vorteile**:
- ✅ [Vorteil 1]
- ✅ [Vorteil 2]

**Nachteile**:
- ❌ [Nachteil 1]
- ❌ [Nachteil 2]

**Aufwand**: [Schätzung: Niedrig / Mittel / Hoch]

---

### Option 3: [Optionsname] (Optional)

**Beschreibung**: [Kurze Beschreibung der Option]

**Vorteile**:
- ✅ [Vorteil 1]

**Nachteile**:
- ❌ [Nachteil 1]

**Aufwand**: [Schätzung]

---

## Entscheidung

**Gewählte Option**: [Name der gewählten Option]

**Begründung**:

[Erklären Sie WARUM diese Option gewählt wurde. Verwenden Sie 2-4 Absätze, die Folgendes abdecken:]
- Warum ist diese Option den anderen überlegen?
- Welche Kriterien waren ausschlaggebend? (Performance, Wartbarkeit, Kosten, Compliance)
- Welche Annahmen liegen dieser Entscheidung zugrunde?
- Wie stimmt diese Entscheidung mit der Gesamtvision/-strategie überein?

**Entscheidungskriterien**:
1. [Kriterium 1 und seine Wichtigkeit]
2. [Kriterium 2 und seine Wichtigkeit]
3. [Kriterium 3 und seine Wichtigkeit]

---

## Konsequenzen

### Positive ✅

- **[Positive Konsequenz 1]**: [Erklärung]
- **[Positive Konsequenz 2]**: [Erklärung]
- **[Positive Konsequenz 3]**: [Erklärung]

### Negative ⚠️

**Seien Sie ehrlich**: Jede Entscheidung hat Kompromisse. Dokumentieren Sie diese klar.

- **[Negative Konsequenz 1]**: [Erklärung + Mitigation wenn möglich]
- **[Negative Konsequenz 2]**: [Erklärung + Mitigation wenn möglich]
- **[Negative Konsequenz 3]**: [Erklärung + Mitigation wenn möglich]

### Identifizierte Risiken 🔴

| Risiko | Auswirkung | Wahrscheinlichkeit | Mitigation |
|--------|------------|-------------------|------------|
| [Risikobeschreibung 1] | Hoch/Mittel/Niedrig | Hoch/Mittel/Niedrig | [Mitigationsmaßnahmen] |
| [Risikobeschreibung 2] | Hoch/Mittel/Niedrig | Hoch/Mittel/Niedrig | [Mitigationsmaßnahmen] |

---

## Implementierung

### Betroffene Dateien

**Zu erstellen**:
- `pfad/zur/datei1.php` - [Beschreibung]
- `pfad/zur/datei2.yaml` - [Beschreibung]

**Zu ändern**:
- `pfad/zur/datei3.php` - [Was ändert sich]
- `pfad/zur/datei4.yaml` - [Was ändert sich]

**Zu löschen**:
- `pfad/zur/alte-datei.php` - [Grund]

### Abhängigkeiten

**Composer**:
```bash
composer require vendor/package:^version
```

**NPM**:
```bash
npm install package@version
```

**Konfiguration**:
- Umgebungsvariable: `VARIABLE_NAME` (.env)
- Symfony-Service zu konfigurieren
- Doctrine-Migration zu erstellen

### Codebeispiel

```php
<?php
// Konkretes Beispiel aus dem Projekt (NICHT generisch)
namespace App\Infrastructure\...;

class BeispielImplementierung
{
    public function beispielMethode(): void
    {
        // Konkreter Code, der die Verwendung zeigt
    }
}
```

**Verwendung**:
```php
// In einer Entity, einem Service, etc.
$beispiel = new BeispielImplementierung();
$beispiel->beispielMethode();
```

---

## Validierung und Tests

### Akzeptanzkriterien

- [ ] [Testbares Kriterium 1]
- [ ] [Testbares Kriterium 2]
- [ ] [Testbares Kriterium 3]

### Erforderliche Tests

**Unit-Tests**:
- `tests/Unit/...Test.php` - [Was getestet wird]

**Integrationstests**:
- `tests/Integration/...Test.php` - [Was getestet wird]

**Funktionale Tests**:
- `tests/Functional/...Test.php` - [Was getestet wird]

### Erfolgsmetriken

| Metrik | Vorher | Ziel | Wie messen |
|--------|--------|------|------------|
| [Metrik 1] | [Wert] | [Wert] | [Tool/Befehl] |
| [Metrik 2] | [Wert] | [Wert] | [Tool/Befehl] |

---

## Referenzen

### Interne Regeln
- [Regel `.claude/rules/XX-name.md`](./../rules/XX-name.md) - [Beschreibung]
- [Template `.claude/templates/name.md`](./../templates/name.md) - [Beschreibung]

### Externe Dokumentation
- [Dokumentationstitel](https://url.com) - [Beschreibung]
- [Relevanter Artikel/Blog](https://url.com) - [Beschreibung]

### Verwandte ADRs
- [ADR-XXXX: Titel](XXXX-titel.md) - [Beziehung: hängt ab von / ersetzt / ergänzt]

### Quellcode
- Implementierung: `src/pfad/zur/datei.php:zeile`
- Tests: `tests/pfad/zum/test.php:zeile`
- Konfiguration: `config/packages/package.yaml`

---

## Änderungshistorie

| Datum | Autor | Änderung |
|-------|-------|----------|
| YYYY-MM-DD | [Name] | Erstellt |
| YYYY-MM-DD | [Name] | [Änderungsbeschreibung] |

---

## Zusätzliche Anmerkungen

[Optionaler Abschnitt für zusätzliche Informationen, die nicht in die vorherigen Abschnitte passen:]
- Wichtige Diskussionen, die zur Entscheidung führten
- Zusätzlicher historischer Kontext
- Referenzen zu POCs oder Experimenten
- Feedback nach der Implementierung (nach dem Produktiv-Deployment hinzufügen)
