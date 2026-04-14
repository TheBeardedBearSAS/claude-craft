---
description: Audit de la qualité de code Paperclip
argument-hint: [chemin-projet]
---

# Audit de la qualité de code Paperclip

## MISSION

Mesurer la rigueur TypeScript, la conformité du linter, le nommage, la complexité et l'hygiène des logs dans un projet Paperclip.

## Procédure

### 1. Référence TypeScript

- [ ] `tsconfig.base.json` a `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`
- [ ] `pnpm typecheck` réussit (pas d'erreurs `tsc` à travers les espaces de travail)
- [ ] Aucun tsconfig par package n'assouplit la référence

### 2. Patterns interdits

Grep et rapporter :
- Annotations `: any`
- Casts `as any` / `as unknown as`
- `// @ts-ignore`, `// @ts-expect-error` sans issue GitHub liée dans le même commentaire de ligne
- Assertions non-null `!.` sur des valeurs retournées par la DB

### 3. Lint & format

- [ ] `pnpm lint` sort 0, zéro avertissement
- [ ] `pnpm format --check` ne rapporte aucun diff
- [ ] La config ESLint utilise `strict-type-checked`
- [ ] Les règles ESLint non négociables de `rules/08-quality-tools.md` sont activées

### 4. Nommage

Échantillonner 20 fichiers. Vérifier :
- Les fichiers sont en kebab-case (`agent-service.ts`, pas `AgentService.ts` ou `agent_service.ts`)
- Les types sont en PascalCase
- Les fonctions / vars sont en camelCase
- Les constantes sont en UPPER_SNAKE
- Les vars d'env lues via un module de config parsé, préfixées `PAPERCLIP_`

### 5. Complexité cognitive

Exécuter `eslint-plugin-sonarjs` (ou équivalent). Signaler toute fonction avec une complexité cognitive ≥ 10. Signaler tout fichier > 300 lignes.

### 6. Hygiène des logs

- [ ] Les logs utilisent un logger structuré (pino ou équivalent), jamais `console.log` dans le code runtime
- [ ] Aucun champ dont le nom correspond à `/key|token|secret|password|authorization/i` n'est loggé comme valeur
- [ ] Pas de logging du corps de requête complet

### 7. Correction asynchrone

- [ ] `@typescript-eslint/no-floating-promises` = error, passe
- [ ] Pas de chaînes `.then()` (grep `.then(`)
- [ ] Tous les timeouts utilisent `AbortController`

### 8. Modélisation des erreurs

- [ ] Les services du serveur lancent des sous-classes de `DomainError`, pas de simples `Error`
- [ ] Chaque erreur de domaine a un champ `code` stable
- [ ] Pas de `throw` de chaînes ou de littéraux

## Sortie

Rapport Markdown avec passe/échoue par section, fichiers/symboles incriminés, sévérité, et un score /20 pour `/paperclip:check-compliance`.
