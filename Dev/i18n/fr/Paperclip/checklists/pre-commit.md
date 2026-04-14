# Checklist pré-commit — Paperclip

## Validation rapide avant chaque commit

### Qualité de code

- [ ] `pnpm format --check` passe
- [ ] `pnpm lint` passe (0 erreur, 0 avertissement)
- [ ] `pnpm typecheck` passe à travers les espaces de travail
- [ ] Pas de `any`, pas de `as any`, pas de `// @ts-ignore`
- [ ] Pas de `console.log` / `debugger` dans le code runtime
- [ ] Pas d'exports inutilisés (exécuter `pnpm knip` localement)

### Tests

- [ ] `pnpm test --changed` passe
- [ ] Nouvelle fonctionnalité → nouveau(x) test(s) ajouté(s)
- [ ] Correction de bug → test de régression ajouté
- [ ] Changement d'adaptateur → `contract.test.ts` toujours vert

### Gouvernance & Sécurité

- [ ] Aucune décision de gouvernance ajoutée à un adaptateur (`adapters/**`)
- [ ] Chaque nouvelle mutation DB émet un événement d'activité
- [ ] Aucun `companyId` venant du corps/query du client
- [ ] Aucune valeur de secret codée en dur
- [ ] Les logs n'exposent pas de secrets, tokens, ou corps complets

### Build

- [ ] `pnpm build` réussit
- [ ] Pas de nouveaux avertissements de dépréciation

### Docs

- [ ] Spec OpenAPI mise à jour pour les routes nouvelles/modifiées
- [ ] README de l'adaptateur mis à jour si les actions supportées ont changé
- [ ] Entrée CHANGELOG sous `## Unreleased`

### Git

- [ ] Message de commit suit Conventional Commits (`feat(adapters): …`, `fix(approvals): …`)
- [ ] Branche rebasée sur `main`
- [ ] Pas de `TODO: remove` ou d'instructions `console.log` de debug restantes
- [ ] `.env` n'est pas stagé

## Validation automatisée

`package.json` :

```jsonc
{
  "simple-git-hooks": {
    "pre-commit": "pnpm lint-staged",
    "commit-msg": "npx --no-install commitlint --edit \"$1\"",
    "pre-push": "pnpm typecheck && pnpm test --changed"
  },
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write", "vitest related --run"],
    "*.{json,md,yaml,yml}": ["prettier --write"]
  }
}
```

## Commandes rapides

```bash
pnpm lint
pnpm lint --fix
pnpm typecheck
pnpm test --changed
pnpm format
pnpm audit --audit-level=high
```

## Problèmes courants

### "Test nécessite une vraie DB" en CI
Utiliser testcontainers ou démarrer Postgres dans le workflow — ne jamais mocker la DB dans les tests d'intégration.

### "Test de contrat d'adaptateur échoue"
Ne pas baisser les attentes de la suite. Corriger l'adaptateur. La suite EST le contrat.

### "Entrée de journal d'activité manquante"
Ajouter `this.activity.emit({ event: '<domaine>.<action>', ... })` dans le service après la mutation réussie.

## Avant le push

- [ ] Tous les commits suivent Conventional Commits
- [ ] Branche rebasée sur `main`
- [ ] CI sera vert (lint + typecheck + test + build)
- [ ] Les tests de contrat d'adaptateur passent localement pour tout adaptateur touché

## Notes

- Garder les commits petits et focalisés
- Ne jamais sauter les hooks (`--no-verify`) — si un hook échoue, corriger la cause
- Les bugs de gouvernance sont des incidents de production, pas des avertissements — les traiter avec urgence
