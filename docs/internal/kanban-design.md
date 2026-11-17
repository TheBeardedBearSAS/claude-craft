# Kanban — conception détaillée (document de travail local, non versionné)

Contrat commun des agents des lots 2 à 4. Rapport d'audit : `docs/audits/KANBAN-AUDIT-2026-11.md`.
Le lot 1 est livré (commit `0c0e8f29`) : `shared/ids.js` (`STORY_ID_RE`, `EPIC_ID_RE`, `TASK_ID_RE`, `storyIdFromFilename`, `nextStoryId(existingIds, epicId)`), `shared/transitions.js` (`STATUSES`, `TRANSITIONS`, `allowedTargets(story)`), `services/lock.js` (`acquireLock(lockPath, opts) → release()`, `LockedError`), `repository.diagnostics()`, `GET /api/health → {ok, readonly, user}`, `GET /api/diagnostics`, `hostGuard`, `bodyLimit` 64 Ko, `safeError`, watcher sur `.bmad/sprint-status.yaml` (événement `file:changed {rel, event, category:'sprint-status'}`), `cli-options.js` (`parsePort`, `resolveUser`).

## Règles communes

- Dépôt : `/home/flavien-metiiver/Documents/Company/TheBeardedCTO/Tools/claude-craft`. Ne touche que TES fichiers ; d'autres agents travaillent en parallèle dans le même répertoire.
- Toute commande passe par Docker, jamais node/npm en local : `docker run --rm -v "$PWD":/app -w /app node:24 npx vitest run <fichiers>` (sans couverture). Jamais `npm install`. Rien dans `/tmp` de l'hôte.
- TDD : test rouge d'abord. Pas de lib de test de composants Svelte : la logique va dans des modules `.js` purs (`cli/kanban/client/src/lib/`) testés dans `tests/kanban/<module>.test.js`.
- KISS/YAGNI, fonctions courtes (< 20 lignes visées), aucune nouvelle dépendance (sauf `yaml`, lot 3, déjà décidée).
- Avant de finir, sur tes fichiers `.js` : `npx prettier --check` et `npx eslint` (prettier : singleQuote, printWidth 120, trailingComma es5). Les `.svelte` ne sont ni lintés ni formatés par prettier : garde le style existant.
- `tests/kanban/lighthouse-regressions.test.js` doit rester vert : un seul `<main>`, CSP en `<meta>` (aucun script ni style inline nouveau incompatible), import dynamique de cytoscape, contrastes AA.
- Aucun commit, aucune opération git modifiant l'index.
- Harness navigateur : `bash website/tests/kanban/run.sh` (Playwright + axe en Docker, ~1 min, build compris). `UPDATE_KNOWN=1` régénère `known-violations.json`.
- Rapport final court : fichiers modifiés, fait / non fait par point, résultat des tests réellement exécutés, changements requis hors de tes fichiers, ce qui est supposé et non vérifié.

## 1. Écriture serveur (lot 3)

### 1.1 `cli/kanban/server/services/status-store.js`

```js
export async function mutateSprintStatus(projectRoot, mutate, { now, lockTtlMs = 10_000 } = {})
// mutate(tx) peut être async ; tx.data = instantané JS (lecture seule)
// tx.setStory(id, fields)       fusionne des champs dans stories.<id> (null supprime la clé ? non : null est écrit tel quel)
// tx.addStory(id, entry)        ordre des clés : title, status, previous_status, sprint_id, puis le reste
// tx.removeStory(id)
// tx.appendHistory(id, entry)   {timestamp, from, to, by, reason}
// tx.setMetadata(fields) | tx.setRoot(key, value)
// → { data, version }           version = sha1 (12 hex) du texte écrit
export function revOf(value)     // sha1 (12 hex) du JSON à clés triées
export class ConflictError / InvalidStatusFileError   (+ réexport de LockedError)
```

Séquence : verrou `acquireLock(yamlPath + '.lock')` → relecture sous verrou → si `SprintStatusSchema` échoue AVANT mutation : `InvalidStatusFileError` (on n'écrit jamais sur un fichier incompris) → mutation → revalidation du schéma → écriture dans `${yaml}.tmp-${pid}-${randomUUID()}` + fsync + rename → release en `finally`, tmp supprimé si échec.

Bibliothèque `yaml` (eemeli v2, API `Document` / `parseDocument`) confinée à ce module : commentaires, ordre des clés et style flow/bloc préservés. Les lectures du reste du serveur restent sur `js-yaml`.

Contraintes de format (d'autres outils lisent/écrivent ce fichier avec `yq -i` et un fallback `grep -A 5 "^  ${id}:" | grep "status:" | head -1`) : `stories` = map indexée par id, indentation 2, style bloc pour les stories, `status` avant `previous_status` et dans les 5 premières lignes d'une story, clés inconnues préservées (`claimed_by`, `claimed_at`, `tdd_updated_at`, `completed_at`, `failed_at`, `gates`, `routing`, `archived_sprints`).

Conflits **par story** : les routes comparent `revOf(tx.data.stories[id])` à l'en-tête `If-Match` → `ConflictError` (409 `conflict`, corps `{error, current}`). Sans `If-Match`, dernier écrivain gagne. La `version` globale sert aux opérations de sprint (`expected_version`).

`updateSprintStatusStory` et `rebuildSprintStatus` de `sprint-cache.js` sont supprimés (le second est non atomique et efface `archived_sprints`) ; le PATCH de statut passe par `mutateSprintStatus`.

### 1.2 Modèle

- **Appartenance au sprint** : `stories.<id>.sprint_id`. Précédence : clé YAML présente (y compris `null` = backlog) > ligne `Sprint` du md > `metadata.sprint_id` pour une story YAML-only (comportement actuel conservé quand la clé est absente).
- **Précédence des champs** pour une story suivie par le YAML : le YAML gagne sur `title, story_points, priority, assigned_to, epic_id, tasks, sprint_id` QUAND la clé est présente ; le md garde persona, traçabilité, corps. À l'écriture, les lignes `## Metadata` du md (`Points`, `EPIC`, `Sprint`, `Updated`) sont resynchronisées par la fonction pure `patchMetadataList(text, fields)`, qui n'écrit JAMAIS de ligne `Status` (test `tests/content/ssy-source-of-truth.test.mjs`).
- **Priorité** : écrite en MoSCoW (`must|should|could|wont`). `priority_raw` (P0..P3) conservé tant que la priorité n'est pas éditée.
- **Limites WIP** : `.bmad/kanban.yaml` → `version: 1`, `wip_limits: {in-progress: 3, review: 2}`. Indicatives : la réponse d'un déplacement porte `warnings: ['wip_exceeded']`, sans blocage.
- **Identité** : `history.by = 'kanban:<user>'` (`'kanban'` si user vaut `kanban`). Le champ `reason` de la requête alimente `history.reason`.
- **État d'un sprint** (`sprintState(id, ss, sprintDirs)`, pur) : `active` si `metadata.sprint_id === id` sans `metadata.closed_date` ; `closed` s'il est dans `archived_sprints` ou si `closed_date` est posé ; `planned` s'il n'existe que comme dossier `sprints/<id>/`.
- **Clôture** : stories `done` → `archived_sprints.<id>.stories.<US>: {status, points}` et retirées de `stories` ; sur l'entrée archivée `name, epic, closed_date, points_committed, points_delivered` ; stories non terminées : restent dans `stories` avec `sprint_id: null` (ou le sprint cible via `carry_over`), statut conservé ; `metadata.closed_date` posé.
- **Suppression** = archivage récupérable : entrée YAML retirée, md déplacé vers `backlog/user-stories/.trash/`. 409 `story_active` si statut `in-progress` ou `review` sauf `?force=1` ; 409 `has_dependents` (avec la liste) si d'autres stories en dépendent.
- **Création** : id par `nextStoryId` (max calculé sur stories + archives + fichiers md), md créé depuis le template `Project/i18n/en/templates/user-story.md` (sans frontmatter, section `## Metadata`, pas de statut), `wx`, chemin `project-management/backlog/user-stories/US-{ID}-{slug}.md` (slug ASCII ≤ 50, via `resolveSafe`), puis entrée YAML `status: backlog` + history « Story created ». Si l'écriture YAML échoue, le md est supprimé.

### 1.3 Routes

Communs : `hostGuard`, `csrfGuard`, `readonlyGuard`, `bodyLimit` (64 Ko ; 512 Ko pour le corps md). Erreurs `{error: <code>, ...}` : 400 `invalid_json` / `invalid_payload` (+ `issues`), 403 `forbidden` / `readonly`, 404 `not_found`, 409 `conflict` / `sprint_status_invalid`, 413 `payload_too_large`, 422 `invalid_result`, 423 `locked`, 500 `write_failed` (code seul). Réponse d'une mutation : `{story|sprint, version, warnings?}` + événement SSE (`story:updated`, `sprint:updated`, `settings:updated`). Chaque story renvoyée par l'API porte `_rev`.

| Méthode et chemin | Schéma zod (`shared/schemas.js`) | Écrit | Erreurs spécifiques |
|---|---|---|---|
| `GET /api/health` | — | — | `{ok, readonly, user, wip_limits}` |
| `GET /api/velocity` | — | — | `{sprints:[{id, name, closed_date, committed, delivered}], average}` |
| `PATCH /api/stories/:id/status` (existant) | `TransitionRequestSchema` | YAML ou frontmatter legacy | 409 `invalid_transition` + `allowed[]` ; 409 `archived` |
| `PATCH /api/stories/:id` | `StoryPatchSchema` strict : `title` (1..200), `story_points` (0..21), `assigned_to` (nullable), `priority`, `tdd_phase`, `epic_id` (nullable), `sprint_id` (nullable), `dependencies[]` | YAML + synchro `## Metadata` du md | 409 `sprint_not_found` ; 409 `archived` |
| `PUT /api/stories/:id/body` | `{markdown: string ≤ 500k, expected_mtime}` | md (verrou, tmp + rename) | 409 `conflict` ; 409 `no_backing_file` ; 422 `status_line_forbidden` |
| `POST /api/stories` | `StoryCreateSchema {title, epic_id?, story_points?, priority?, persona?, sprint_id?}` | md + YAML | 409 `id_collision` (nouvel essai) |
| `DELETE /api/stories/:id` | query `force` | YAML + md → `.trash/` | 409 `story_active`, `has_dependents` |
| `PATCH /api/stories/:id/tasks/:taskId` | `{status: TASK_STATUSES}` | YAML `tasks.status[taskId]`, `tasks.completed` recalculé | 404 `task_not_found` |
| `POST /api/sprints` | `SprintCreateSchema {name, start_date, end_date, goal?, capacity_points?}` (dates ISO, fin ≥ début) | `sprints/sprint-<N>-<slug>/sprint-goal.md` (état `planned`, pas de YAML) | 409 `sprint_exists` |
| `POST /api/sprints/:id/start` | `{expected_version?}` | YAML `metadata` | 409 `sprint_already_active` + `{active}` ; 409 `conflict` |
| `POST /api/sprints/:id/close` | `{carry_over: 'backlog' \| <sprintId>, expected_version?}` | YAML (§1.2) | 409 `not_active` |
| `PUT /api/settings/wip` | `record<status, int 1..99 \| null>` | `.bmad/kanban.yaml` | — |

Découpage : `cli/kanban/server/routes/{stories,sprints,settings}.js`, chacune `export function register(app, deps)` ; `createApp` garde middlewares + GET existants. Modules purs : `services/story-files.js` (`renderStoryMarkdown`, `patchMetadataList`, `slugify`), `services/sprint-ops.js` (`startSprint`, `closeSprint`, `velocity`, `sprintState` sur données simples), `services/kanban-config.js` (lecture/écriture de `.bmad/kanban.yaml`).

## 2. Client (lots 2 et 4)

### 2.1 Modules purs — `cli/kanban/client/src/lib/`

| Module | Exports | Lot |
|---|---|---|
| `query.js` | `parseQuery(str)`, `buildQuery(obj)`, `filtersFromQuery(q)`, `mergeQuery(q, patch)` | 2 |
| `filter.js` | `matchStory(story, filters)`, `sortStories(list, key, dir)`, `facets(stories)` | 2 |
| `points.js` | `sumPoints(stories, pred?)` (remplace 5 duplications) | 2 |
| `markdown.js` | `renderMarkdown(src)` (marked + DOMPurify, import paresseux), `linkifyStoryIds(html)` → liens `?story=<id>` (remplace 3 duplications) | 2 |
| `api.js` | `request(url, init)` (lit le JSON d'erreur, `AbortController`), `storyUrl(id)` avec `encodeURIComponent`, `latestOnly()` (ignore les réponses périmées), `errorKey(err)` → clé i18n `error.<code>` | 2 |
| `optimistic.js` | `applyPatch(stories, id, patch)`, `restore(stories, before)` — par id, jamais par index | 2 |
| `toasts.js` | modèle de minuterie avec pause/reprise ; les erreurs persistent | 2 |
| `announce.js` | file unique pour la région live, avec `clearTimeout` | 2 |
| `board-nav.js` | `reduceKey` (remplace `kanban-nav.js`) : flèches inertes menu ouvert, `event.code === 'KeyM'`, chiffres ignorés pendant un prompt, Entrée/Espace laissés aux boutons natifs | 2 |
| `i18n/translate.js` | `translate(catalog, fallback, key, params)`, `pluralKey(locale, key, n)`, `formatDate(locale, iso, opts)`, `formatNumber`, `pickLocale(saved, navigatorLangs)` | 2 |
| `story-form.js` | `validateDraft(draft)`, `diffPatch(original, draft)` | 4 |
| `sprint-plan.js` | `capacityState(committed, capacity)` | 4 |
| `wip.js` | `wipState(count, limit)` → `'ok' \| 'at' \| 'over' \| 'none'` | 4 |
| `velocity.js` | `averageVelocity(sprints, n)`, `forecastSprints(remaining, avg)` | 4 |

Stores (`.svelte.js`) : `store.svelte.js` (debounce 150 ms des rechargements SSE, resynchronisation à l'événement `open` après une déconnexion, compteur `store.revision` incrémenté à chaque rechargement — les vues Sprints, Deps, Docs, Burndown l'observent pour se recharger ; `store.loading` enfin lu), `router.svelte.js` (`route.name`, `route.params`, `route.query` ; `setQuery(patch)` via `history.replaceState` sans polluer l'historique ; `#/docs/<rel encodé>` ; route inconnue → `name: 'not-found'`), `detail.svelte.js` (erreurs exposées), `health.svelte.js` (`health.readonly`, `health.user`, chargé une fois via `/api/health`), `i18n/index.svelte.js`.

### 2.2 URL

`#/kanban?q=auth&prio=must,should&who=alice&epic=E4&sort=priority&dir=desc&story=US-E4-03`

- `story=` ouvre le détail depuis toute vue (lien profond) ; fermer la modale retire le paramètre. Les liens `US-xxx` des docs pointent dessus.
- Recherche : champ de la topbar, filtrant en direct Board et Backlog via `?q=` ; sur les autres vues, Entrée navigue vers `#/backlog?q=…`. `Ctrl/⌘+K` et `/` y placent le focus. Pas de palette.

### 2.3 i18n

- `lib/i18n/locales/{en,fr,es,de,pt}.js` : `export default { 'board.column.backlog': 'Backlog', … }`. Clés plates, pointées, préfixées par zone : `app.`, `nav.`, `board.`, `backlog.`, `sprint.`, `burndown.`, `deps.`, `docs.`, `story.`, `form.`, `error.`, `a11y.`, `settings.`, `status.`, `priority.`, `tdd.`, `toast.`, `common.`.
- Paramètres `{name}`. Pluriels : suffixes `.one` / `.other` choisis par `Intl.PluralRules`, repli `.other`.
- `en` importé statiquement (référence et repli) ; les autres en `import()` dynamique (un chunk par langue).
- `lib/i18n/index.svelte.js` : `i18n.locale` (`$state`), `t(key, params)`, `setLocale(code)` → persiste dans le localStorage des Tweaks (`cc-kanban-tweaks`, clé `lang`), met à jour `document.documentElement.lang`. Locale initiale : sauvegardée > `navigator.languages` > `en`.
- `<title>` par vue : `{vue} — {sprint} · claude-craft kanban`.
- Erreurs serveur : le client traduit par code via `error.<code>` (repli `error.unknown`).
- Le contenu des stories (titres, markdown) n'est pas traduit et ne reçoit pas d'attribut `lang`.
- Test `tests/kanban/i18n-parity.test.js` : mêmes clés dans les 5 langues, mêmes jetons `{param}` par clé, aucune valeur vide, toute clé `t('…')` littérale trouvée dans `src/**` existe dans `en`, aucun `aria-label="texte"` / `placeholder="texte"` / `title="texte"` littéral dans les `.svelte`.

### 2.4 Composants et vues

| Besoin | Emplacement | Lot |
|---|---|---|
| Shell : nav responsive, recherche, `<title>`, focus au changement de vue, toasts, bandeaux diagnostics / lecture seule | `App.svelte`, `index.html`, `app.css` | 2 |
| Filtres + tri (partagé Board et Backlog) | `components/FilterBar.svelte` | 2 |
| Page inconnue | `components/NotFound.svelte` | 2 |
| Confirmation | `components/ConfirmDialog.svelte` (à côté de `PromptDialog`) | 2 |
| Ligne de story du Backlog (dédupliquée) | `components/StoryRow.svelte` | 2 |
| Sélecteur de langue | `components/TweaksPanel.svelte` | 2 |
| Édition / création de story | `components/StoryForm.svelte` dans `StoryDetail.svelte` ; bouton « Nouvelle story » (Board, Backlog) | 4 |
| Planification backlog ↔ sprint | `BacklogView` : bouton par ligne, sélection multiple, barre de capacité | 4 |
| Cycle de sprint | `SprintsView` : créer, démarrer, clôturer (choix du report) | 4 |
| WIP | en-tête de colonne `3/3` + texte/icône ; réglage dans `TweaksPanel` | 4 |
| Vélocité | `BurndownView` : barres uPlot + tableau équivalent | 4 |

## 3. Accessibilité (lot 2, relue aux lots 2 et 4)

### 3.1 Board : liste et boutons natifs (pas de `grid`, pas de roving tabindex)

- Colonne : `<section aria-labelledby>` + `<h2>` (nom et compteur en texte) + `<ul>`.
- Carte : `<li>` sans rôle, sans tabindex, sans onclick, contenant un `<button class="card-open">` (nom = id + titre, `aria-describedby` → métadonnées en texte : priorité, points, phase TDD, assigné, blocage) et un `<button aria-haspopup="menu" aria-expanded>` « Déplacer ».
- Menu « Déplacer » : `role="menu"` / `menuitem`, limité à `allowedTargets(story)` (import de `cli/kanban/shared/transitions.js`), Entrée et Espace natifs, Échap rend le focus au bouton. C'est l'alternative au glisser-déposer (WCAG 2.5.7, K-34). En `--readonly`, bouton absent et cartes non déplaçables.
- Flèches et `Alt+M` restent des accélérateurs. Suppression des `svelte-ignore` a11y et du drapeau mort `CC_A11Y_KANBAN`.

### 3.2 Correctifs par constat

| Constat | Correctif | Critères |
|---|---|---|
| K-24 reflow | Sous 980 px : la sidebar devient une barre `<nav>` horizontale à retour à la ligne, toujours visible, sans JS ; recherche sur sa propre ligne ; `.docs-tree` en `<details>` ; `body{overflow:hidden}` seulement ≥ 980 px ; colonnes du board empilées < 640 px ; PromptDialog `min-width: min(320px, 100vw - 32px)` ; plus de région défilante non focalisable (`scrollable-region-focusable`) | 1.4.10 |
| K-26 toasts | Une région `role="status"` + une `role="alert"` (erreurs), sans imbrication ; `<button>` de fermeture ; pause au survol et au focus ; erreurs persistantes | 2.2.1, 4.1.3, 2.1.1 |
| K-27 | `aria-label` sur `span`/`div` → texte `.sr-only` ou `role="img"` ; `.epic-head` ne contient que du contenu phrasé ; lignes d'un épic replié non rendues (`{#if}`) | 4.1.2, 1.3.1, 2.4.3 |
| K-28 | Graphe `role="img"` + résumé ; tableau équivalent « Story / dépend de / bloque / statut / cycle » avec liens `?story=` ; statut en texte ; `.t-over` avec icône + texte | 1.1.1, 2.1.1, 1.4.1 |
| K-29 | `<title>` dynamique ; `lang` synchronisé ; `h1` unique (topbar) ; `h2` dans Backlog et Docs (le `h1` du markdown rendu est rétrogradé) ; `<nav>` sorti de l'`aside` ; `<main tabindex="-1">` focalisé + annonce au changement de vue | 2.4.2, 3.1.1, 1.3.1, 2.4.6, 2.4.3 |
| K-30 | Tokens : texte ≥ 4,5:1 (viser 4,6) pour les 4 accents (lime, cyan, violet, amber), chips Must et Won't, texte sur sprint sélectionné ; bordures de champs / boutons / toggles ≥ 3:1 ; champ de recherche avec anneau `:focus-visible`. Verrouillé par `tests/kanban/contrast.test.js` | 1.4.3, 1.4.11, 2.4.7 |
| K-31 | Cibles ≥ 24 px (`.toggle`) ; corps de police minimal 12 px, en `rem` ; `ping` coupé sous `prefers-reduced-motion` ; l'aide clavier fixe passe dans le panneau Réglages | 2.5.8, 1.4.4, 2.3.3, 2.4.11 |
| K-32 | Mises à jour SSE annoncées, regroupées par `announce.js` | 4.1.3 |
| K-18 | `aria-busy` + squelette quand `store.loading` ; erreurs du détail affichées dans la modale | 4.1.3 |

## 4. Guide i18n pour les vues (livré, vague A)

Fichiers livrés : `lib/i18n/translate.js`, `lib/i18n/index.svelte.js`, `lib/i18n/locales/en.js` (463 clés, 18 sections commentées), `tweaks.lang`.

```svelte
<script>
  import { t, tn, fmtDate, fmtNumber } from '../lib/i18n/index.svelte.js';
</script>
<h2>{t('backlog.title')}</h2>
<input placeholder={t('app.search.placeholder')} aria-label={t('app.search.label')} />
<span>{tn('common.stories', count)}</span>   <!-- common.stories.one / .other, {n} injecté -->
<button aria-label={t('a11y.openCard', { id: s.id, title: s.title })}>
```

- Appelle `t()` dans le template ou dans un `$derived` (réactif au changement de langue). Jamais au niveau module.
- Clés LITTÉRALES autant que possible (le test de parité les vérifie). Clés dynamiques tolérées pour `status.<s>`, `priority.<p>`, `tdd.<p>`, `error.<code>` : vérifie toi-même qu'elles existent dans `en.js`.
- Clé manquante : ajoute-la dans la bonne section de `locales/en.js` avec l'outil Edit (jamais de réécriture complète du fichier : d'autres agents y ajoutent des clés en même temps). Ne crée pas les fichiers fr/es/de/pt.
- Plus aucun `aria-label="texte"`, `placeholder="texte"`, `title="texte"` littéral dans un `.svelte` (test « no hard-coded attribute strings »).
- Dates : `fmtDate(iso, { dateStyle: 'medium' })` ; nombres : `fmtNumber(n)`.
- Statuts, priorités, TDD : `t('status.' + s)`, `t('priority.' + p)`, `t('tdd.' + p)` — ne plus utiliser les `label` en dur de `config.js`.
- Erreur serveur : `t(errorKey(err))` avec `errorKey` de `lib/api.js` ; détail d'une transition refusée : `error.hint.allowed` avec `{allowed}`.
- Initialisation (dans `App.svelte`) : `initTweaks()` puis `initI18n()`. Sélecteur de langue : `setLocale('fr')`, `setLocale(null)` = automatique.
- Préfixes : `app.` `nav.` `board.` `backlog.` `sprint.` `burndown.` `deps.` `docs.` `story.` `form.` `error.` `a11y.` `settings.` `status.` `priority.` `tdd.` `toast.` `common.`.

## 5. Socle client livré (vague A) — exports réels

Tous dans `cli/kanban/client/src/lib/`. Lis le fichier source en cas de doute ; cette liste fait foi sur le §2.1.

- `query.js` : `parseQuery(str)`, `buildQuery(obj)`, `mergeQuery(q, patch)`, `filtersFromQuery(q)` → `{ q, prio: string[], who, epic, sort, dir: 'asc'|'desc', story }`, `parseHash(hash)`, `formatHash(name, params, query)`. Valeur vide (`null`, `''`, `[]`) = clé supprimée.
- `filter.js` : `matchStory(story, filters)`, `sortStories(list, key, dir)` (clés `id`, `priority`, `points`, `status`, `title`), `facets(stories)` → `{ assignees, epics }`, `fold(str)`.
- `points.js` : `sumPoints(stories, pred?)`.
- `optimistic.js` : `applyPatch(stories, id, patch)` → `{ stories, before }`, `restore(stories, before)`, `replaceStory(stories, story)`.
- `toasts.js` : `createToasts({ onChange, defaultTtlMs, timers })` → `{ push, dismiss, pause, resume }` ; les erreurs n'expirent pas.
- `announce.js` : `createAnnouncer({ onChange, ttlMs, timers })` → `{ say, clear }`.
- `markdown.js` : `renderMarkdown(src, { linkRoute?, demote? })` (async, import paresseux de marked + DOMPurify), `linkifyStoryIds(html, route)`, `demoteHeadings(html, by = 1)`, `RENDER_ERROR_HTML`. `linkRoute` = `{ name, params, query }` (passer `route`) pour que les ids deviennent des liens `?story=<id>`.
- `api.js` : `ApiError` (`status`, `code`, `body`), `request(url, init)`, `isAbort(err)`, `storyUrl(id, suffix = '')`, `errorKey(err)` → `error.<code>` | `error.unknown`, `latestOnly()` → `run()` qui donne un ticket `{ signal, current }` et annule le précédent.
- `board-nav.js` : `reduceKey`, `locateCard`, `buildCardDetails` (remplace `kanban-nav.js`, même forme ; règles en tête de fichier ; contexte `ctx.promptOpen`).
- `events.js` : `classifyKanbanEvent(msg)`, `createRefreshQueue(...)`.
- `router.svelte.js` : `route` (`name` ∈ kanban | backlog | sprints | burndown | deps | docs | not-found, `params` (`{id}` sprints, `{rel}` docs), `query` objet), `navigate(path)`, `setQuery(patch)` (replaceState).
- `store.svelte.js` : `store` (`stories`, `epics`, `sprint`, `burndown`, `connected`, `loading`, `error`, `toasts`, `revision`), `loadStories()`, `loadSprint()`, `patchStatus(id, body)`, `toast(t)`, `dismissToast(id)`, `pauseToast(id)`, `resumeToast(id)`, `connectEvents()`, `disconnectEvents()`. `store.toasts` = `[{ id, kind, message, key, params }]` : afficher `key ? t(key, params) : message`. Clés émises par le store : `toast.moved`, `toast.transition_failed`, `toast.load_failed`, `toast.sprint_failed`. `store.revision` augmente à chaque rechargement réussi : les vues à fetch local (Sprints, Deps, Docs) le lisent dans leur `$effect` pour se recharger.
- `detail.svelte.js` : `detail` (dont `error: { code, status, key, message } | null`), `openDetail`, `closeDetail`, `consumeTrigger`, `loadDetail(id)`.
- `health.svelte.js` : `health` (`loaded`, `readonly`, `user`, `wipLimits`), `loadHealth()`.
- `shared` : `cli/kanban/shared/transitions.js` → `STATUSES`, `allowedTargets(story)` ; `cli/kanban/shared/ids.js`.

## 6. API d'écriture des stories — formes réelles (livré, lot 3)

Toute story suivie par le YAML porte `_rev` (absent pour les archivées et les md seuls) ; envoyer `If-Match: <_rev>` sur les mutations. Champs de vue : `_rev`, `_mtime`, `_writable`, `_source`, `_statusSource`. Mutations → `{story, version, warnings?}` + événement SSE `story:updated` (`{id, story}`, `deleted: true` pour un DELETE). Codes communs : 400 `invalid_json` / `invalid_payload` (+ `issues`), 403 `forbidden` / `readonly`, 404 `not_found`, 413 `payload_too_large`, 422 `invalid_result`, 423 `locked`, 500 `write_failed`.

| Route | Corps | Succès | Erreurs spécifiques |
|---|---|---|---|
| `PATCH /api/stories/:id/status` | `{status, blocked_reason?, reason?}` | 200 `{story, version, warnings?}` (`wip_exceeded`) | 409 `invalid_transition` (`reason`, `gate`, `missing`, `allowed[]`) ; 409 `archived` / `read_only_source` ; 409 `conflict` (`reason`: `status_changed` \| `stale`, `current`) |
| `PATCH /api/stories/:id` | `title`, `story_points`, `assigned_to` (nullable), `priority`, `tdd_phase`, `epic_id` (nullable), `sprint_id` (nullable = backlog), `dependencies[]` | 200 `{story, version, warnings?}` (`metadata_sync_failed`) | 400 `invalid_payload` (clé inconnue, patch vide, auto-dépendance) ; 409 `archived`, `read_only_source`, `sprint_not_found` ; 409 `conflict` (`stale` \| `removed`, `current`) |
| `PUT /api/stories/:id/body` | `{markdown, expected_mtime}` (`expected_mtime` = `story._mtime`) | 200 `{story}` | 409 `archived`, `no_backing_file`, `conflict` ; 422 `status_line_forbidden` ; 413 > 512 Ko |
| `POST /api/stories` | `{title, epic_id?, story_points?, priority?, persona?, sprint_id?}` | 201 `{story, version}` | 409 `sprint_status_missing`, `sprint_not_found`, `sprint_status_invalid` (+ `issues`) |
| `DELETE /api/stories/:id[?force=1]` | — | 200 `{deleted, version, warnings?}` (`trash_failed`) | 409 `story_active` (+ `status`) ; 409 `has_dependents` (+ `dependents[]`) ; 409 `archived` |
| `PATCH /api/stories/:id/tasks/:taskId` | `{status: to-do\|in-progress\|done\|blocked}` | 200 `{story, version}` | 404 `task_not_found` ; 409 `archived`, `read_only_source`, `conflict` |

## 7. API sprints, réglages, vélocité — formes réelles (livré, lot 3)

- `GET /api/sprints` (chaque sprint), `/api/sprints/:id` (`sprint.state`), `/api/sprints/current` (`sprint.state`) : `state: 'active' | 'closed' | 'planned'`.
- `POST /api/sprints` `{name, start_date, end_date, goal?, capacity_points?}` → 201 `{sprint:{id, name, start_date, end_date, goal, capacity_points?, state:'planned'}}` ; 409 `sprint_exists`.
- `POST /api/sprints/:id/start` (corps vide accepté, `{expected_version?}`) → 200 `{sprint:{…, state:'active'}, version}` ; 404 `not_found` ; 409 `sprint_already_active` (+ `active:{id, name}`) ; 409 `sprint_closed` ; 409 `conflict`.
- `POST /api/sprints/:id/close` `{carry_over?: 'backlog' | <sprintId>, expected_version?}` → 200 `{sprint:{id, name, state:'closed', closed_date, points_committed, points_delivered}, archived:[ids], carried_over:{to, stories:[ids]}, version}` ; 409 `not_active` ; 409 `sprint_not_found` ; 409 `conflict`.
- `GET /api/velocity` → `{sprints:[{id, name, closed_date, committed, delivered}], average}` (moyenne des 3 derniers sprints clos, `null` possible).
- `PUT /api/settings/wip` `{<statut>: 1..99 | null}` (fusion partielle) → 200 `{wip_limits}` ; 400 `invalid_payload`.
- `GET /api/health` → `{ok, readonly, user, wip_limits}`.
- SSE : `sprint:updated {id, state}`, `settings:updated {wip_limits}`, `story:updated {id, story, deleted?}`.
- Erreurs communes : 400 `invalid_json` / `invalid_payload` (+ `issues`), 403, 413, 423 `locked`, 409 `sprint_status_invalid`.
