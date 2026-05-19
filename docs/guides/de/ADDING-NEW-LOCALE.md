# Adding a New Locale (Translation Pending)

> **Hinweis:** Diese Anleitung wartet auf vollständige Übersetzung. Siehe die englische Version: [ADDING-NEW-LOCALE.md](../en/ADDING-NEW-LOCALE.md).

## Schnellreferenz

Um eine neue Locale zum Claude-Craft-Projekt hinzuzufügen, folgen Sie der 5-Schritte-Checkliste in der englischen Version:

1. **`cli/lib/constants.js` ändern** — den Locale-Code zum `LANGUAGES`-Array hinzufügen.
2. **Verzeichnisse erstellen** — `Dev/i18n/<lang>/`, `Infra/i18n/<lang>/`, `Project/i18n/<lang>/`.
3. **Die ~325 Dateien übersetzen** aus dem Englischen (an einen Übersetzungsagenten delegierbar).
4. **Parität prüfen** — `bash scripts/verify-i18n-parity.sh`.
5. **CI aktualisieren** — `.github/workflows/i18n-parity.yml` + `detectLocale()` in `cli/lib/installer.js` + README-Eintrag.

Für detaillierte Beispiele und die vollständige Checkliste, siehe [docs/guides/en/ADDING-NEW-LOCALE.md](../en/ADDING-NEW-LOCALE.md).
