# Adding a New Locale (Translation Pending)

> **Nota:** Este guia está aguardando tradução completa. Veja a versão em inglês: [ADDING-NEW-LOCALE.md](../en/ADDING-NEW-LOCALE.md).

## Referência rápida

Para adicionar uma nova locale ao projeto Claude Craft, siga a checklist de 5 etapas documentada na versão em inglês:

1. **Modificar `cli/lib/constants.js`** — adicionar o código da locale ao array `LANGUAGES`.
2. **Criar as pastas** — `Dev/i18n/<lang>/`, `Infra/i18n/<lang>/`, `Project/i18n/<lang>/`.
3. **Traduzir os ~325 arquivos** a partir do inglês (delegável a um agente tradutor).
4. **Verificar a paridade** — `bash scripts/verify-i18n-parity.sh`.
5. **Atualizar o CI** — `.github/workflows/i18n-parity.yml` + `detectLocale()` em `cli/lib/installer.js` + entrada README.

Para exemplos detalhados e a checklist completa, consulte [docs/guides/en/ADDING-NEW-LOCALE.md](../en/ADDING-NEW-LOCALE.md).
