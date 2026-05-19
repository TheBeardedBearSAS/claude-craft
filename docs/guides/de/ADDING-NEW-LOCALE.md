# Eine neue Locale zu Claude Craft hinzufügen

Diese Anleitung erklärt, wie Sie eine neue Sprache zum i18n-System von Claude Craft hinzufügen. Claude Craft unterstützt derzeit 5 Sprachen (`en`, `fr`, `es`, `de`, `pt`) und ist so konzipiert, dass das Hinzufügen neuer Sprachen unkompliziert ist.

---

## Voraussetzungen

- Node.js 20+ mit Zugriff auf das Claude Craft Repository
- Vertrautheit mit der Projektstruktur (siehe `docs/guides/de/01-getting-started.md`)
- Ein Übersetzungsansatz: menschliche Übersetzer, ein Agent (`@research-assistant`) oder eine Kombination

---

## Schritt 1 — Den Locale-Code registrieren

Bearbeiten Sie `cli/lib/constants.js` und fügen Sie Ihren Sprachcode zum `LANGUAGES`-Objekt hinzu:

```js
const LANGUAGES = {
  en: 'English',
  fr: 'Français',
  es: 'Español',
  de: 'Deutsch',
  pt: 'Português',
  // Fügen Sie Ihre neue Locale hier hinzu, z.B.:
  // it: 'Italiano',
  // ja: '日本語',
};
```

Aktualisieren Sie auch `scripts/verify-i18n-parity.sh` — suchen Sie das `LANGS`-Array und fügen Sie Ihren Code hinzu:

```bash
LANGS=("en" "fr" "es" "de" "pt" "it")   # Beispiel: Italienisch hinzufügen
```

---

## Schritt 2 — Die Verzeichnisstruktur erstellen

Der i18n-Inhalt von Claude Craft lebt in drei Bäumen. Erstellen Sie passende Verzeichnisse für Ihre neue Locale:

```bash
# Dev-Regeln und -Referenzen
mkdir -p Dev/i18n/<lang>/

# Infrastruktur-Leitfäden
mkdir -p Infra/i18n/<lang>/

# Projektmanagement-Vorlagen
mkdir -p Project/i18n/<lang>/

# Benutzer-Dokumentationsleitfäden
mkdir -p docs/guides/<lang>/
```

Jeder Baum muss die englische (`en`) Referenz exakt widerspiegeln — gleiche Dateinamen, gleiche relative Pfade.

---

## Schritt 3 — Die Dateien übersetzen

Die Referenzlocale (`en`) enthält ungefähr **325 Dateien** in allen Bäumen. Sie können die Übersetzung an einen Claude-Agenten delegieren, um den Prozess zu beschleunigen:

```
@research-assistant Übersetze alle Dateien aus docs/guides/en/ ins Italienische (it).
Behalte die Struktur identisch. Gib jede Datei in docs/guides/it/ mit demselben Dateinamen aus.
Bewahre alle Codeblöcke, Befehlsbeispiele und relative Links unverändert.
```

**Übersetzungsregeln:**

| Regel | Detail |
|-------|--------|
| Codeblöcke | Niemals übersetzen — so belassen |
| CLI-Befehle | Niemals übersetzen |
| Dateipfade | Niemals übersetzen |
| Abschnittsüberschriften | Übersetzen, Markdown-Formatierung beibehalten |
| Links | Anzeigetext aktualisieren, relative Pfade identisch lassen |
| Fachbegriffe | Etablierte Community-Konvention der Zielsprache verwenden |

Beginnen Sie mit `docs/guides/<lang>/` (höchster Benutzer-Mehrwert), dann `Dev/i18n/<lang>/`, dann `Infra/` und `Project/`.

---

## Schritt 4 — Parität prüfen

Führen Sie das Parität-Prüfskript aus, um zu bestätigen, dass Ihre Locale vollständig ist und den Größenschwellenwert erfüllt:

```bash
# Dateianzahl-Parität prüfen (blockierend — muss 100% sein)
bash scripts/verify-i18n-parity.sh

# Größenparität im Strict-Modus prüfen (Verhältnis >= 0.80 pro Datei)
STRICT_SIZE=1 bash scripts/verify-i18n-parity.sh

# Im permissiven Modus während einer laufenden PR ausführen
I18N_PARITY_STRICT=0 bash scripts/verify-i18n-parity.sh
```

Das Skript generiert einen Lückenbericht unter `audit/phases/i18n-gap.csv`, der Dateien unterhalb des Größenschwellenwerts von 0.80 auflistet. Verwenden Sie ihn, um verbleibende Übersetzungsarbeiten zu priorisieren.

**Erwartete Ausgabe bei Vollständigkeit:**

```
✓ en: 325 Dateien
✓ it: 325 Dateien
✓ Alle Sprachen in Parität
```

---

## Schritt 5 — CI und Dokumentation aktualisieren

### GitHub Actions Workflow

Bearbeiten Sie `.github/workflows/i18n-parity.yml`. Im `paths`-Filter des `pull_request`-Auslösers deckt der Workflow bereits `Dev/i18n/**`, `docs/guides/**`, `Infra/i18n/**` und `Project/i18n/**` ab — für Standard-Locales sind keine weiteren Änderungen erforderlich.

Wenn Sie einen locale-spezifischen Filter an anderer Stelle im Workflow hinzugefügt haben, fügen Sie Ihren neuen Code zu einer Zulassungsliste oder Matrix hinzu.

### README

Aktualisieren Sie die mehrsprachige Führungstabelle in `README.md` (Abschnitt "User Guides (Multilingual)"), um Links zu Ihrer neuen Locale für jeden Leitfaden einzuschließen.

### CLI Locale-Erkennung

Wenn die neue Locale einem häufigen OS-Locale-Präfix entspricht (z.B. `it` für `it_IT.UTF-8`), fügen Sie das Mapping in `cli/lib/installer.js` innerhalb der Funktion `detectLocale()` hinzu:

```js
if (raw.startsWith('it')) return 'it';
```

Fügen Sie einen entsprechenden Testfall in `tests/cli/detect-locale.test.mjs` hinzu.

---

## Checkliste

- [ ] Code zu `LANGUAGES` in `cli/lib/constants.js` hinzugefügt
- [ ] Code zum `LANGS`-Array in `scripts/verify-i18n-parity.sh` hinzugefügt
- [ ] Verzeichnisse erstellt: `Dev/i18n/<lang>/`, `Infra/i18n/<lang>/`, `Project/i18n/<lang>/`, `docs/guides/<lang>/`
- [ ] Alle Dateien übersetzt (325 Dateien)
- [ ] `bash scripts/verify-i18n-parity.sh` endet mit 0
- [ ] `STRICT_SIZE=1 bash scripts/verify-i18n-parity.sh` endet mit 0 (oder Lücken sind dokumentiert)
- [ ] `audit/phases/i18n-gap.csv` geprüft und Lücken adressiert
- [ ] Mehrsprachige README-Tabelle aktualisiert
- [ ] `detectLocale()` aktualisiert + Test hinzugefügt (wenn OS-Locale-Erkennung relevant ist)
- [ ] PR mit Label `i18n/<lang>` geöffnet

---

> Verwandte Ressourcen: `.claude/rules/16-i18n.md` | `scripts/verify-i18n-parity.sh` | `.github/workflows/i18n-parity.yml`
