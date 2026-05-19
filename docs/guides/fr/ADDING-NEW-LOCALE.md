# Ajouter une nouvelle locale (traduction en attente)

> **Note :** Ce guide est en attente de traduction complète. Voir la version anglaise : [ADDING-NEW-LOCALE.md](../en/ADDING-NEW-LOCALE.md).

## Référence rapide

Pour ajouter une nouvelle locale au projet Claude Craft, suivre la checklist en 5 étapes documentée dans la version anglaise :

1. **Modifier `cli/lib/constants.js`** — ajouter le code locale dans l'array `LANGUAGES`.
2. **Créer les dossiers** — `Dev/i18n/<lang>/`, `Infra/i18n/<lang>/`, `Project/i18n/<lang>/`.
3. **Traduire les ~325 fichiers** depuis l'anglais (déléguable à un agent traducteur).
4. **Vérifier la parité** — `bash scripts/verify-i18n-parity.sh`.
5. **Mettre à jour la CI** — `.github/workflows/i18n-parity.yml` + `detectLocale()` dans `cli/lib/installer.js` + entrée README.

Pour les exemples détaillés et la checklist complète, consulter [docs/guides/en/ADDING-NEW-LOCALE.md](../en/ADDING-NEW-LOCALE.md).
