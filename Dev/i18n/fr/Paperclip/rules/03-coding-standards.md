# Standards de Codage — Paperclip (TypeScript)

## Langage & Versions

| Élément | Standard |
|---|---|
| Node.js | 20+ (LTS) |
| TypeScript | 5.x |
| Gestionnaire de packages | pnpm 9.15+ (monorepo workspace) |
| Système de modules | ESM uniquement (`"type": "module"`) |

---

## TypeScript

Le mode strict est **obligatoire**. `tsconfig.base.json` :

```jsonc
{
  "compilerOptions": {
    "target": "ES2023",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  }
}
```

**Interdit :** `any`, casts `as unknown as X` sans commentaire expliquant pourquoi, `// @ts-ignore`, `// @ts-expect-error` sans issue liée.

**Requis :** types de retour explicites sur les fonctions exportées, `readonly` sur les props / types domaine, unions discriminées pour types variants.

---

## Nommage

| Type | Convention | Exemple |
|---|---|---|
| Fichiers | kebab-case | `agent-registry.ts`, `approval-service.ts` |
| Répertoires | kebab-case | `src/modules/approvals/` |
| Types / Interfaces | PascalCase | `AgentConfig`, `HeartbeatPayload` |
| Composants React | PascalCase (fichier + symbole) | `OrgChart.tsx` exporte `OrgChart` |
| Fonctions / variables | camelCase | `reportCost`, `isApproved` |
| Constantes | UPPER_SNAKE_CASE | `DEFAULT_BUDGET_TOKENS`, `HEARTBEAT_INTERVAL_MS` |
| Variables d'env | UPPER_SNAKE_CASE, préfixées | `PAPERCLIP_DATABASE_URL`, `PAPERCLIP_SECRET_KEY` |
| Tables DB | snake_case pluriel | `activity_log`, `agent_registrations` |
| Événements domaine | `PastTense` (passé) | `AgentHired`, `BudgetExceeded` |

**Pas de préfixes/suffixes :** n'écrivez pas `IAgent` ou `AgentType` — écrivez `Agent`. Utilisez `Props`, `State`, `Result` comme suffixes explicites uniquement quand ils clarifient (`LoginFormProps`, `AgentsQueryResult`).

---

## Fichiers

- Un export public par fichier préféré. Un module peut exporter plusieurs symboles quand ils forment une unité cohésive (ex. `agent-service.ts` exporte `AgentService` + ses DTOs).
- Longueur cible de fichier : **< 300 lignes**. Au-delà, séparer par responsabilité.
- Ordre à l'intérieur d'un fichier :
  1. Imports (externes → internes → relatifs)
  2. Types / interfaces
  3. Constantes
  4. Exports publics
  5. Helpers privés

---

## Imports

- Imports absolus à l'intérieur d'un package utilisant les alias de chemins TS (`@/modules/...`).
- Imports relatifs uniquement pour fichiers frères dans le même dossier.
- Pas de fichiers barrel (`index.ts`) sauf aux frontières de packages — ils cassent le tree-shaking et la détection de dépendances circulaires.
- Imports nommés uniquement ; pas d'exports par défaut sauf pour composants React requis par les frameworks.

---

## Gestion des erreurs

Deux styles acceptés — choisir un par module et rester cohérent :

1. **Lever `DomainError`** — préféré pour les services serveur.
   ```ts
   export class BudgetExceededError extends DomainError {
     readonly code = 'BUDGET_EXCEEDED';
     constructor(public readonly agentId: string, public readonly limit: number) {
       super(`Agent ${agentId} exceeded budget (${limit} tokens)`);
     }
   }
   ```

2. **Type `Result<T, E>`** — préféré pour code adaptateur et chemins de bord où lever traverse les frontières de processus.

**Jamais :**
- Avaler les erreurs avec des blocs `catch {}` vides.
- Lever des chaînes ou objets simples.
- Re-emballer une erreur et perdre la `cause` originale (toujours passer `{ cause: err }`).

---

## React (web UI)

- Composants fonctionnels uniquement. Pas de composants classe.
- Props typées via `readonly`, pas de `React.FC`.
- Hooks nommés `useX`, une responsabilité chacun.
- Dériver l'état ; ne pas le dupliquer. Pas de useState qui duplique props ou données serveur.
- L'état serveur vit dans React Query (ou équivalent). L'état client dans un store minimal (Zustand ou React context).
- **L'UI est stupide** : aucune décision de gouvernance dans le navigateur. Les vérifications d'approbation, budget et permissions font un aller-retour au serveur.

---

## Async

- `async`/`await` uniquement. Pas de chaînes `.then()` brutes.
- Toutes les frontières async qui peuvent échouer retournent des erreurs typées ou lèvent `DomainError`.
- Pas de promesses non gérées — toujours `await`, `.catch`, ou `void` (avec un commentaire si intentionnel).
- Les timeouts sont explicites (`AbortController`) ; pas d'attentes indéfinies.

---

## Journalisation (Logging)

- Logs JSON structurés (pino ou équivalent).
- Logger des **événements**, pas des chaînes : `log.info({ agentId, event: 'agent.hired' })`.
- Ne jamais logger de secrets, clés API brutes, ou corps de requête complets contenant des PII.
- Chaque mutation log un événement `activity_log` (niveau domaine) ; les logs niveau OS sont pour diagnostics uniquement.

---

## Configuration

- Toute config via variables d'env, chargées via un parseur typé (zod) au démarrage.
- Pas de lectures de config au moment de la requête — injecter la config résolue.
- Paperclip injecte `PAPERCLIP_WORKSPACE_*` et `PAPERCLIP_RUNTIME_*` dans les processus agents lancés pour outillage côté agent ; conservez ce préfixe pour toute variable que vous ajoutez côté agent.

### Variables d'env canoniques (observées dans `.env.example`)

| Nom | Objectif |
|---|---|
| `DATABASE_URL` | Chaîne de connexion PostgreSQL. Omis → Postgres embarqué (dev uniquement). |
| `PORT` | Port HTTP pour le serveur (défaut `3100`). |
| `SERVE_UI` | `true` pour que le serveur serve aussi le bundle UI construit. |
| `BETTER_AUTH_SECRET` | Secret pour [Better Auth](https://better-auth.com). **Doit être rotaté par environnement.** |

La config plugin / adaptateur vit **à l'intérieur** du package plugin ou adaptateur, pas dans l'env de niveau supérieur. Référencez vos propres variables d'env depuis le `configSchema` (zod) de votre plugin plutôt que de lire `process.env` au runtime.

---

## Linting & Formatage

- ESLint flat config (`eslint.config.js`) avec `@typescript-eslint/strict-type-checked`.
- Prettier pour le formatage (pas de `semi: false` — garder les point-virgules).
- Appliqué en CI + hook pre-commit.

---

## Checklist

- [ ] `strict: true` + `noUncheckedIndexedAccess` actif
- [ ] Pas de `any`, pas de casts silencieux
- [ ] Types de retour explicites sur fonctions exportées
- [ ] Fichiers kebab-case, types PascalCase, vars camelCase
- [ ] Une responsabilité par fichier, < 300 lignes
- [ ] Logs structurés, pas de secrets dans les logs
- [ ] Tout async awaité ou explicitement `void`
- [ ] ESLint + Prettier passent

---

**Dernière mise à jour :** 2026-04 | **Version :** 1.0.0 | **Auteur :** The Bearded CTO
