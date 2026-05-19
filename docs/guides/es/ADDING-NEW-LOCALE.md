# Adding a New Locale (Translation Pending)

> **Note:** Esta guía está pendiente de traducción completa. Consulte la versión en inglés: [ADDING-NEW-LOCALE.md](../en/ADDING-NEW-LOCALE.md).

## Referencia rápida

Para añadir una nueva locale al proyecto Claude Craft, siga la checklist de 5 pasos documentada en la versión en inglés:

1. **Modificar `cli/lib/constants.js`** — añadir el código de locale al array `LANGUAGES`.
2. **Crear las carpetas** — `Dev/i18n/<lang>/`, `Infra/i18n/<lang>/`, `Project/i18n/<lang>/`.
3. **Traducir los ~325 archivos** desde el inglés (delegable a un agente traductor).
4. **Verificar la paridad** — `bash scripts/verify-i18n-parity.sh`.
5. **Actualizar la CI** — `.github/workflows/i18n-parity.yml` + `detectLocale()` en `cli/lib/installer.js` + entrada README.

Para los ejemplos detallados y la checklist completa, consulte [docs/guides/en/ADDING-NEW-LOCALE.md](../en/ADDING-NEW-LOCALE.md).
