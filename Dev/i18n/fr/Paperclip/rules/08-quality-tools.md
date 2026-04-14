# Outils de qualité — Paperclip

Analyse statique, vérification de types, et barrières CI qui maintiennent les contributions Paperclip saines.

## Outils requis

| Outil | Objectif | Barrière |
|---|---|---|
| `tsc --noEmit` | Correction des types | Échec CI sur erreur |
| ESLint flat config | Lint (règles typées) | Échec CI sur erreur, warnings autorisés ≤ 0 |
| Prettier | Formatage | Échec CI sur diff |
| Vitest + couverture v8 | Tests + couverture | Échec CI en dessous des seuils |
| knip | Code mort / exports inutilisés | Warn en CI, corriger avant release |
| `pnpm audit` (high/critical) | Dépendances vulnérables | Échec CI sur high / critical |
| commitlint | Conventional Commits | Échec CI sur mauvais commit |

Optionnel mais recommandé : **Stryker** mutation testing sur modules core (agents, approvals, costs) — cible mutation score ≥ 70%.

---

## Complexité cognitive

Source : plugin SonarJS ou `eslint-plugin-sonarjs`.

- Limite fonction : **< 10** (warn à 8).
- Limite fichier : **< 200** (warn à 150).

Au-delà de la limite → refactoriser, ne pas silencer.

---

## Strictness TypeScript Ratchet

Le `tsconfig.base.json` de base doit garder ceci ACTIVÉ :

```
"strict": true,
"noUncheckedIndexedAccess": true,
"noImplicitOverride": true,
"exactOptionalPropertyTypes": true,
"noFallthroughCasesInSwitch": true,
"noImplicitReturns": true
```

Le `tsconfig.json` par package peut resserrer davantage mais jamais desserrer.

---

## ESLint — Règles non négociables

```js
rules: {
  '@typescript-eslint/no-explicit-any': 'error',
  '@typescript-eslint/no-floating-promises': 'error',
  '@typescript-eslint/no-misused-promises': 'error',
  '@typescript-eslint/consistent-type-imports': 'error',
  '@typescript-eslint/explicit-module-boundary-types': 'error',
  '@typescript-eslint/no-unnecessary-condition': 'error',
  '@typescript-eslint/switch-exhaustiveness-check': 'error',
  'no-restricted-syntax': ['error', {
    selector: "TSAsExpression[typeAnnotation.typeName.name='any']",
    message: 'No casts to any. Model the type properly.',
  }],
}
```

---

## Pipeline CI

```yaml
- pnpm install --frozen-lockfile
- pnpm format --check           # Prettier
- pnpm lint                     # ESLint
- pnpm typecheck                # tsc --noEmit
- pnpm test --coverage          # Vitest
- pnpm build                    # Assure qu'il n'y a pas de cassures build-only
- pnpm knip                     # Code mort (warn)
- pnpm audit --prod --audit-level=high
```

Toute étape qui échoue bloque la fusion. Pas de « surcharges » sauf via une PR étiquetée `tech-debt` avec une issue liée.

---

## Seuils de couverture

Appliqués dans `vitest.config.ts` :

- Lines : 80
- Functions : 80
- Branches : 75
- Statements : 80

Cible par module (plus stricte) : agents, approvals, costs, adapters → 90%.

---

## Hygiène des dépendances

- `pnpm up -iL` hebdomadaire (patch/minor uniquement sans revue PR).
- Bumps majeurs = PR dédiée avec notes de migration.
- Renovate ou Dependabot configuré avec PRs groupées.
- Dérive peer-dep rejetée (`pnpm install` doit être propre).

---

## Barrière de release

Avant de couper une release :

- [ ] `pnpm ci` vert sur main pour les 10 derniers commits
- [ ] Pas de `TODO: remove before release` dans le diff
- [ ] CHANGELOG mis à jour (Keep a Changelog)
- [ ] Les tests de contrat adaptateur passent pour tous les adaptateurs livrés
- [ ] `pnpm audit` propre au niveau `high`
- [ ] Guide de migration écrit si migration DB ou cassure API

---

## Checklist

- [ ] ESLint flat config avec strict-type-checked
- [ ] `tsc --noEmit` passe à travers espaces de travail
- [ ] Seuils de couverture appliqués en CI
- [ ] Rapports knip résolus avant release
- [ ] `pnpm audit` vert à `high`
- [ ] Commitlint activé

---

**Dernière mise à jour :** 2026-04 | **Version :** 1.0.0 | **Auteur :** The Bearded CTO
