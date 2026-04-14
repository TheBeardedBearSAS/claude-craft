# Checklist nouvelle extension — Paperclip

Une "nouvelle extension" est soit un **adaptateur intégré** (runtime IA sous `packages/adapters/<nom>/`) soit un **plugin** (fonctionnalité, distribué via `@paperclipai/plugin-sdk` et `create-paperclip-plugin`). Choisir d'abord.

## 0. Décision

- [ ] Confirmer : s'agit-il d'un nouveau runtime IA (**adaptateur**) ou d'une fonctionnalité (**plugin**) ?
- [ ] Vérifier les adaptateurs Paperclip existants (`claude-local`, `codex-local`, `cursor-local`, `gemini-local`, `opencode-local`, `openclaw-gateway`, `pi-local`) — peut-être qu'un convient déjà
- [ ] Choisir un nom en kebab-case

---

## Piste A — Plugin (le plus courant)

### 1. Échafaudage

```bash
npm create paperclip-plugin@latest
```

- [ ] Le répertoire de sortie contient `src/worker.ts`, `src/manifest.ts`, `tests/`
- [ ] `pnpm install` réussit

### 2. Manifeste

- [ ] `id`, `name`, `version` définis ; `version` correspond à `package.json`
- [ ] `apiVersion: 1`
- [ ] `capabilities` déclarées **minimalement** (ne pas demander largement `network`, `filesystem`, etc.)
- [ ] `categories` appropriées
- [ ] `instanceConfigSchema` généré depuis un schéma Zod avec un `.describe(...)` clair sur chaque champ

### 3. Worker

- [ ] `definePlugin({ setup(ctx), onHealth })` export par défaut
- [ ] `runWorker(plugin, import.meta.url)` présent
- [ ] `setup(ctx)` enregistre les gestionnaires de manière synchrone (pas d'await d'appels amont pendant setup)
- [ ] Événements abonnés via `ctx.events.on(...)`
- [ ] Tâches enregistrées via `ctx.jobs.register(...)`
- [ ] Secrets résolus via `ctx.secrets.resolve(ref)` — pas de clés brutes dans le code
- [ ] État persisté via `ctx.state` avec le scope approprié (company / project / issue)
- [ ] Appels HTTP utilisent `ctx.http.fetch` (respecte les capacités et allowlist)

### 4. Tests

- [ ] `createTestHarness` de `@paperclipai/plugin-sdk/testing`
- [ ] Chemin heureux couvert
- [ ] Cas d'échec du gestionnaire d'événement couvert
- [ ] Le contrôle de santé retourne rapidement

### 5. Installer & vérifier

```bash
paperclipai plugin install ./<nom-plugin>
paperclipai plugin inspect <pluginKey>
paperclipai plugin enable <pluginKey>
paperclipai plugin list
```

- [ ] Le plugin apparaît en bonne santé dans le tableau de bord
- [ ] Les événements qu'il écoute déclenchent ses gestionnaires
- [ ] La désinstallation ne laisse pas d'état résiduel qu'il ne devrait pas garder

### 6. Docs

- [ ] `README.md` liste : objectif, champs de config, capacités requises, événements gérés, tâches exposées, limites connues
- [ ] `CHANGELOG.md` commence à `0.1.0`

---

## Piste B — Adaptateur intégré (runtime IA)

Ajouter un adaptateur intégré signifie contribuer à (ou forker) Paperclip.

### 1. Package

- [ ] Nouveau dossier `packages/adapters/<nom>/`
- [ ] `package.json` nommé `@paperclipai/adapter-<nom>`, dans le scope `@paperclipai/*`
- [ ] Exports : `.`, `./server`, `./ui`, `./cli` (uniquement ceux que vous implémentez)

### 2. Entrée (`src/index.ts`)

- [ ] Exporte `type` (identifiant stable sur le réseau, ex. `<nom>_local`)
- [ ] Exporte `label` (lisible par l'humain)
- [ ] Exporte `models` (liste id + label)
- [ ] Exporte `agentConfigurationDoc` (markdown décrivant tous les champs avec précision)

### 3. Surface serveur (`src/server/index.ts`)

- [ ] Code de spawn + supervise du processus
- [ ] Gestion du timeout + période de grâce SIGTERM
- [ ] Support de la stratégie d'espace de travail (`git_worktree` etc.)
- [ ] Variables d'env runtime Paperclip (`PAPERCLIP_WORKSPACE_*`, `PAPERCLIP_RUNTIME_*`) propagées à l'enfant
- [ ] **Aucune** vérification de budget / approbation / permission ici — le serveur en est propriétaire

### 4. Enregistrement

- [ ] Le démarrage du serveur enregistre l'adaptateur via `registerServerAdapter(adapter)`
- [ ] Les helpers de recherche d'adaptateur existants (`requireServerAdapter`, etc.) fonctionnent avec lui

### 5. Surfaces UI / CLI (optionnel)

- [ ] `src/ui/index.ts` — morceaux React pour le formulaire de config de l'adaptateur
- [ ] `src/cli/index.ts` — sous-commandes sous `paperclipai` si l'adaptateur en a besoin

### 6. Tests

- [ ] Tests unitaires pour la logique spawn / parse / env
- [ ] L'adaptateur est exercé de bout en bout dans les tests e2e du dépôt s'il est largement pertinent

### 7. Docs

- [ ] `agentConfigurationDoc` est complet et correct
- [ ] `CHANGELOG.md` commence à `0.1.0`
- [ ] Entrée ajoutée au site de docs Paperclip sous "Adaptateurs"
