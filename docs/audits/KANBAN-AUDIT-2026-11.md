# Audit de l'interface Kanban — novembre 2026

Audit de `claude-craft kanban` (`cli/kanban/`, `cli/lib/kanban.js`) au commit `origin/main` **8ec26ae5** (9.2.1). Toutes les références `fichier:ligne` portent sur cette version, et non sur le répertoire de travail.

## 1. Résumé

**Ce qui fonctionne.** Le serveur écoute uniquement sur `127.0.0.1` (`cli/lib/kanban.js:80`). Les requêtes mutantes sont protégées par un contrôle d'origine (`middleware/security.js:7-29`) et par un mode `--readonly` (`:53-60`). Le chemin des documents est borné par `resolveSafe` (`:38-48`). Le Markdown rendu est assaini par DOMPurify et une CSP est posée (`index.html:16-19`). La machine à états est validée côté serveur (`state-machine.js`), et l'écriture YAML passe par un renommage atomique (`sprint-cache.js:65-67`). Le client dispose d'un lien d'évitement, de `<dialog>` natifs pour les modales et d'une alternative clavier au glisser-déposer. Une vingtaine de fichiers de tests couvrent le serveur et la logique pure du client.

**Ce qui empêche un usage réel comme outil de gestion de projet.**

1. L'outil ne sait faire qu'une chose : changer le statut d'une story (K-13). Il n'existe ni création, ni édition, ni suppression, ni assignation, ni planification de sprint, ni limite de WIP, ni vélocité (K-22). Le champ de recherche est inerte (K-14).
2. L'écriture du fichier de vérité `.bmad/sprint-status.yaml` n'est ni protégée contre les écritures concurrentes des commandes LLM et des scripts shell, ni revalidée, et elle perd les commentaires (K-03).
3. Un frontmatter malformé vide le board ou empêche le démarrage (K-04). Les identifiants BMAD réels (`US-E4-02`) sont ignorés (K-09). Les changements externes du YAML ne sont pas poussés au client (K-01).
4. Sous 980 px de large (donc à 400 % de zoom), toute la navigation disparaît (K-24).

**Décompte des constats (34).**

| Sévérité | Nombre | Constats |
|---|---|---|
| Bloquant | 4 | K-03, K-04, K-13, K-24 |
| Majeur | 16 | K-01, K-02, K-07, K-09, K-10, K-14, K-16, K-17, K-22, K-25, K-26, K-27, K-28, K-29, K-30, K-34 |
| Mineur | 14 | K-05, K-06, K-08, K-11, K-12, K-15, K-18, K-19, K-20, K-21, K-23, K-31, K-32, K-33 |

Définitions : *bloquant* = perte de données, board inutilisable ou fonction essentielle inaccessible à une catégorie d'utilisateurs ; *majeur* = fonction dégradée ou non-conformité AA nette ; *mineur* = gêne, dette, cas limite. Par rapport à la liste brute, K-27 et K-29 passent de mineur à majeur (focus sur des éléments masqués ; langue de page erronée), et K-34 est ajouté.

**Bilan de vérification.** Sur les 33 constats initiaux, 24 sont confirmés tels quels et 9 sont confirmés avec correction (K-01, K-04, K-06, K-08, K-11, K-28, K-30, K-31, K-33). Aucun n'est entièrement infirmé ; trois sous-points sont non confirmés (K-11, K-31 ×2). Un constat est ajouté (K-34). Le détail des corrections figure dans chaque fiche, champ « Vérification ».

## 2. Périmètre et méthode

**Périmètre.** `cli/kanban/` (serveur Hono, schémas partagés, client Svelte 5), `cli/lib/kanban.js`, `cli/lib/parse-args.js`, tests `tests/kanban/`, workflows CI, documentation (`docs/`). Référentiels : WCAG 2.2 niveau AA et RGAA 4.1.

**Méthode.** Revue de code statique de `origin/main` (`git show origin/main:<chemin>`, `git grep … origin/main`). Chaque constat a été relu dans le code ; le `fichier:ligne` a été confirmé ou corrigé. Les ratios de contraste ont été recalculés (annexe A) à partir des tokens oklch de `app.css`, par un script Node exécuté dans un conteneur Docker `node:24` (rien d'installé, rien d'écrit sur l'hôte).

**Ce qui n'a pas été fait.**

- Aucun test avec un lecteur d'écran réel (NVDA, VoiceOver, JAWS) : les constats ARIA sont déduits du code et des règles ARIA 1.2.
- Aucune exécution dans un navigateur : pas de mesure axe, pas de test à 320 px réels, pas de vérification visuelle du focus masqué ni de l'effet du `<details>` fixe (K-31). Le harnais navigateur + axe est créé au lot L1.
- Contrastes calculés, non mesurés à l'écran : conversion oklch vers sRGB (matrices d'Ottosson), alpha composité en sRGB encodé ; la correspondance de gamut du navigateur n'est pas simulée (vérifié hors gamut uniquement pour `--pri-must` et `--danger` : dans le gamut).
- Aucune exécution des commandes LLM concurrentes ni des scripts `.bmad/lib/*.sh` : le risque de course de K-03 est établi par lecture, pas reproduit.
- Les numéros RGAA ont été vérifiés sur le référentiel officiel 4.1 (accessibilite.numerique.gouv.fr, « Critères et tests »). RGAA 4.1 repose sur WCAG 2.1 : les critères WCAG 2.2 (2.4.11, 2.5.7, 2.5.8) n'ont pas d'équivalent RGAA.
- Pas d'audit des dépendances ni du bundle.

## 3. Tableau de synthèse

| ID | Domaine | Sévérité | Constat | Lot | Statut |
|---|---|---|---|---|---|
| K-01 | Serveur | Majeur | `.bmad/sprint-status.yaml` non surveillé : changements externes non poussés au client | L1 | corrigé (PR 1) |
| K-02 | Serveur | Majeur | Verrous `.lock` orphelins après crash : 423 permanent, sans TTL | L1 (md) / L3 (YAML) | corrigé (PR 1 et 3) |
| K-03 | Serveur | Bloquant | Écriture YAML sans détection de conflit ni revalidation, `.tmp` à nom fixe, commentaires perdus | L3 | corrigé (PR 3) |
| K-04 | Serveur | Bloquant | `#rebuild` vide les Maps avant de reparser : frontmatter malformé = démarrage planté ou board vidé | L1 | corrigé (PR 1) |
| K-05 | Serveur | Mineur | YAML invalide avalé en silence hors `/api/sprints/current` | L1 | corrigé (PR 1) |
| K-06 | Serveur | Mineur | Burndown : division par zéro et exception sur dates invalides | L1 | corrigé (PR 1) |
| K-07 | Serveur | Majeur | Pas de contrôle `Host`, pas de limite de corps, chemins absolus dans erreurs et SSE | L1 | corrigé (PR 1) |
| K-08 | Serveur | Mineur | `--port 4000` (espace) : `Number(true)` = 1, liaison au port 1 | L1 | corrigé (PR 1) |
| K-09 | Serveur | Majeur | Identifiants `US-E4-02` rejetés par schéma, scanner et repository | L1 | corrigé (PR 1) |
| K-10 | Serveur | Majeur | Stories YAML-only sans `invest_score` : gate backlog vers ready-for-dev toujours refusée | L1 | corrigé (PR 1) |
| K-11 | Serveur | Mineur | Dette diverse : doublons, champ `reason` mort, `by` figé, 409 trompeur, `catch` vides | L1 | corrigé (PR 1 et 5) |
| K-12 | CI | Mineur | Build client jamais vérifié sur PR ; aucun test navigateur ni axe | L1 | corrigé (PR 1) |
| K-13 | Serveur | Bloquant | Une seule mutation exposée ; `StoryPatchSchema` non branché ; `rebuildSprintStatus` non atomique | L3 | corrigé (PR 3 et 4) |
| K-14 | Client | Majeur | Champ de recherche et raccourci ⌘K inertes | L2 | corrigé (PR 2) |
| K-15 | Client | Mineur | Filtre priorité seul et non persisté, pas de tri, `route.query` jamais lu, pas de lien profond, route inconnue = page vide | L2 | corrigé (PR 2) |
| K-16 | Client | Majeur | Clavier du menu « Déplacer » : mauvaise carte ciblée, Entrée neutralisée, chiffres captés pendant le prompt, Alt+M inopérant sur macOS, drapeau mort | L2 | corrigé (PR 2) |
| K-17 | Client | Majeur | Déblocage : six colonnes proposées pour un seul choix valide ; `--readonly` ignoré par l'UI | L2 | corrigé (PR 2) |
| K-18 | Client | Mineur | États de chargement et d'erreur absents ou silencieux | L2 | corrigé (PR 2) |
| K-19 | Client | Mineur | Réseau : pas d'encodage, courses, pas d'annulation, SSE sans resynchronisation ni debounce, vues non rafraîchies | L2 | corrigé (PR 2) |
| K-20 | Client | Mineur | Sprint « actif » déduit de `done_points > 0` ; liens `US-xxx` inopérants ; accent non répercuté sur le burndown | L2 | corrigé (PR 2) |
| K-21 | Client | Mineur | Code et CSS morts, duplications | L2 | corrigé (PR 2 et 5) |
| K-22 | Client | Majeur | Fonctions de gestion de projet absentes de l'UI | L4 | corrigé (PR 4) |
| K-23 | Client | Mineur | Chaînes mêlant français et anglais, pas d'i18n, dates sans `Intl` | L2 | corrigé (PR 2) |
| K-24 | A11y | Bloquant | Sous 980 px : sidebar, recherche et arbre des docs masqués sans remplacement | L2 | corrigé (PR 2) |
| K-25 | A11y | Majeur | Carte = `li[role=listitem][tabindex][onclick]`, `aria-label` écrase le contenu | L2 | corrigé (PR 2) |
| K-26 | A11y | Majeur | Toasts : `div` cliquable sans clavier, régions live imbriquées, disparition sans pause | L2 | corrigé (PR 2) |
| K-27 | A11y | Majeur | `aria-label` sur éléments génériques, `div` dans `button`, lignes d'épic repliées focalisables | L2 | corrigé (PR 2) |
| K-28 | A11y | Majeur | Graphe de dépendances inaccessible au clavier ; statut et cycle par la couleur seule ; dépassement d'heures par la couleur seule | L2 | corrigé (PR 2) |
| K-29 | A11y | Majeur | `<title>` statique, `lang="en"` sur contenu mixte, titres manquants, double `h1`, pas de gestion du focus | L2 | corrigé (PR 2) |
| K-30 | A11y | Majeur | Contrastes : texte sur accent violet 2,34 ; chip Won't 4,00 ; bordures 1,09 à 2,28 ; recherche sans `outline` | L2 | corrigé (PR 2) |
| K-31 | A11y | Mineur | Cibles de 16 px, polices de 9,5 à 10,5 px, animation `ping` infinie malgré `prefers-reduced-motion`, aide fixe | L2 | corrigé (PR 2) |
| K-32 | A11y | Mineur | Mises à jour temps réel non annoncées ; minuteries sans `clearTimeout` | L2 | corrigé (PR 2) |
| K-33 | Docs | Mineur | FAQ, TROUBLESHOOTING, ACCESSIBILITY, CHEAT-SHEET inexacts ; vue Sprints non documentée | L5 | corrigé (PR 5) |
| K-34 | A11y | Majeur | Aucune alternative à un seul pointeur au glisser-déposer (nouveau) | L2 | corrigé (PR 2) |

## 4. Détail des constats

Statut de chaque constat : voir le champ « Statut » de sa fiche et la dernière colonne du tableau de synthèse (état à la fin du chantier : 34 corrigés ; les fiches conservent le texte d'origine). Les chemins sont relatifs à `cli/kanban/` sauf mention contraire.

### 4.1 Serveur et sécurité

#### K-01 — `.bmad/sprint-status.yaml` non surveillé
Majeur · Lot L1 · Statut : corrigé (PR 1)

- **Constat.** Le watcher est lancé sur `project-management/` (`rootDir: pmDir`), alors que `.bmad/` est un dossier frère à la racine du projet. Même surveillé, le fichier serait écarté : `classify` renvoie `other` pour un `.yaml` hors des chemins connus et `onEvent` ignore cette catégorie.
- **Preuve.** `cli/lib/kanban.js:74` ; `server/services/file-watcher.js:20-21, 42-43` ; `server/services/file-scanner.js:45, 76`.
- **Impact.** Quand une commande `/team:*` ou `/qa:*` modifie le YAML, le board n'est pas actualisé. Seuls les déplacements faits depuis l'UI publient `story:updated` (`server/app.js:157`).
- **Correctif prévu.** Surveiller aussi `.bmad/sprint-status.yaml` (et le futur `.bmad/kanban.yaml`) et le classer comme catégorie dédiée ; test sur fixture.
- **Vérification.** Corrigé : la liste brute attribuait le défaut aux dotdirs ignorés (`file-watcher.js:43`) ; la cause première est le périmètre `pmDir` et la classification.

#### K-02 — Verrous `.lock` orphelins
Majeur · Lot L1 (verrou markdown) puis L3 (verrou YAML partagé) · Statut : corrigé (PR 1 : verrou markdown, reprise des verrous périmés ; PR 3 : verrou YAML partagé avec les scripts)

- **Constat.** Le verrou est un fichier créé en `wx` et sans contenu. Après un crash entre la création et le `unlink`, le fichier subsiste et toute écriture suivante renvoie 423, indéfiniment.
- **Preuve.** `server/services/file-writer.js:30-40` (création), `:42-48` (libération) ; `server/services/sprint-cache.js:43-48` ; mappage 423 : `server/app.js:160`.
- **Impact.** Les déplacements de cartes échouent jusqu'à suppression manuelle du `.lock`, sans message actionnable.
- **Correctif prévu.** `services/lock.js` : contenu `{pid, ts}`, TTL de 10 s et test `process.kill(pid, 0)` pour reprendre un verrou périmé ; verrou YAML via le point d'écriture unique `status-store.js` et côté shell (`with_status_lock`).
- **Vérification.** Confirmé.

#### K-03 — Écriture YAML sans conflit ni revalidation
Bloquant · Lot L3 · Statut : corrigé (PR 3)

- **Constat.** `updateSprintStatusStory` lit le fichier, applique le patch, le réécrit en entier avec `yaml.dump` et le renomme, sans comparer avec l'état vu par le client, sans revalider `SprintStatusSchema` et sans verrou côté scripts shell. Le fichier temporaire a un nom fixe (`<yaml>.tmp`). Les commentaires et la mise en forme sont perdus.
- **Preuve.** `server/services/sprint-cache.js:50` (lecture), `:54-64` (mutation), `:65-67` (écriture `.tmp` fixe puis rename). Aucun appel à `SprintStatusSchema` dans ce chemin.
- **Impact.** Une commande LLM ou un script qui réécrit le YAML entre la lecture et le rename voit sa modification écrasée (mise à jour perdue) ; un YAML valide pour `yaml.load` mais invalide pour le schéma est réécrit sans contrôle ; chaque déplacement détruit les commentaires du fichier de vérité.
- **Correctif prévu.** Point d'écriture unique `status-store.js` : verrou, relecture sous verrou, refus si le fichier ne valide pas le schéma, mutation par la bibliothèque `yaml` (API `Document`, commentaires préservés), revalidation, écriture `tmp-<pid>-<uuid>` + fsync + rename ; contrôle par story via `If-Match` (révision) et 409 `conflict`.
- **Vérification.** Confirmé ; la course est établie par lecture, non reproduite.

#### K-04 — `#rebuild` non résilient
Bloquant · Lot L1 · Statut : corrigé (PR 1)

- **Constat.** `#rebuild` vide toutes les Maps (`:41-46`) puis reparse chaque fichier. Un frontmatter YAML syntaxiquement invalide fait lever `yaml.load` dans `parseFile`, donc `parseAndValidate`, donc `#rebuild`, alors que les Maps sont déjà vides ou à moitié remplies. Au démarrage, `await repository.refresh()` n'est pas protégé (`cli/lib/kanban.js:67`) : le processus plante. Sous le watcher, l'erreur est seulement écrite sur la console (`file-watcher.js:34-36`) et le board reste partiel.
- **Preuve.** `server/services/repository.js:39-46`, `:52` ; `server/services/frontmatter.js:30` (levée), `:57-58` ; `:145-157` (une story invalide en markdown mais présente dans le YAML est enregistrée avec `ok:false`, puis ignorée par `continue`) ; `:231` (`listStories` écarte `!entry.ok`). Les erreurs de validation (`errors`) sont stockées mais jamais exposées par l'API (`getStory` renvoie `null`, `:247`).
- **Impact.** Une faute de frappe dans un fichier fait disparaître des stories (ou tout le board), sans explication. Les requêtes servies pendant la reconstruction asynchrone voient des Maps vides.
- **Correctif prévu.** Construire dans de nouvelles Maps puis échanger atomiquement ; isoler l'échec par fichier ; exposer les erreurs (`GET /api/diagnostics`, bandeau de diagnostics) ; démarrage tolérant.
- **Vérification.** Confirmé, avec un ajout : la lecture concurrente d'un état vidé pendant le rebuild.

#### K-05 — YAML invalide avalé en silence
Mineur · Lot L1 · Statut : corrigé (PR 1)

- **Constat.** `loadSprintStatus` lève sur un YAML syntaxiquement invalide ; `#loadStatusOnce` et `loadStatusSafe` transforment l'exception en `null`. Seule `/api/sprints/current` répond 503.
- **Preuve.** `server/services/repository.js:124-126` ; `server/app.js:255-261` (silencieux), `:197-199` (503 avec `err.message`).
- **Impact.** Le board est vide ou incomplet sans indication de la cause.
- **Correctif prévu.** Remonter l'erreur dans `/api/diagnostics` et le bandeau de diagnostics.
- **Vérification.** Confirmé.

#### K-06 — Burndown : dates dégénérées
Mineur · Lot L1 · Statut : corrigé (PR 1)

- **Constat.** Avec `start_date == end_date`, `totalDays` vaut 0 et `totalPoints / totalDays` produit `Infinity`/`NaN`. Avec une date invalide, `startDate.toISOString()` lève `RangeError`, et l'appel n'est pas protégé : `/api/sprints/current` répond 500.
- **Preuve.** `server/services/sprint-cache.js:145` (`totalDays`), `:151` (division), `:243` (`toISOString` hors boucle) ; appel non gardé : `server/app.js:211`.
- **Impact.** Burndown « NaN » ou perte de toute la vue sprint pour une date mal saisie.
- **Correctif prévu.** Validation des dates et garde sur `totalDays <= 0` (retour vide, `on_track: null`).
- **Vérification.** Corrigé : lignes `:145/:151/:243` au lieu de `:151-153`.

#### K-07 — Hôte, taille du corps, fuite de chemins
Majeur · Lot L1 · Statut : corrigé (PR 1)

- **Constat.** (a) Aucun contrôle de l'en-tête `Host` : `csrfGuard` ne s'applique qu'aux méthodes mutantes, donc un rebinding DNS permet de lire les GET (stories, docs, flux SSE) depuis une page tierce. (b) Aucune limite de taille du corps : `c.req.json()` lit tout. (c) `err.message` est renvoyé au client : erreurs d'écriture (chemins absolus des messages `fs`, `story X not found in <yamlPath>`) et erreur de lecture du YAML. (d) Le SSE publie le chemin absolu du fichier modifié.
- **Preuve.** `server/middleware/security.js:10-12` ; `server/app.js:106` (`await c.req.json()`), `:162` (`message: err.message`), `:199` (`reason: err.message`) ; `server/services/file-watcher.js:33` ; `server/services/sprint-cache.js:52`.
- **Impact.** Lecture des données du projet par une page web malveillante ouverte pendant que le Kanban tourne ; fuite d'arborescence locale ; corps volumineux non borné.
- **Correctif prévu.** `hostGuard` (hôtes `127.0.0.1`/`localhost` avec le port), `bodyLimit` (hono), erreurs par code sans chemin absolu, chemins relatifs dans l'événement SSE.
- **Vérification.** Confirmé.

#### K-08 — Analyse de `--port`
Mineur · Lot L1 · Statut : corrigé (PR 1)

- **Constat.** `parseArgs` n'accepte que `--clé=valeur` ; `--port` seul vaut `true` et `Number(true)` vaut 1, entier valide dans la plage. Avec `kanban . --port 4000`, la valeur `4000` est ignorée (chemin déjà renseigné) et le serveur tente de se lier au port 1. Avec `kanban --port 4000`, `4000` devient le chemin cible et l'erreur affichée est « no project-management/ directory » sous `<cwd>/4000`.
- **Preuve.** `cli/lib/parse-args.js:68-79` ; `cli/lib/kanban.js:51-52`.
- **Impact.** Message trompeur ou échec de liaison sans lien évident avec la saisie.
- **Correctif prévu.** `server/cli-options.js` : refuser `--port` sans valeur et accepter la forme `--port 4000`.
- **Vérification.** Corrigé : deux comportements distincts selon la place de la valeur.

#### K-09 — Identifiants BMAD réels rejetés
Majeur · Lot L1 · Statut : corrigé (PR 1)

- **Constat.** Le schéma exige `^US-\d{3,}$` ; le scanner exige `US-\d+` (non ancré, donc `US-E4-02.md` ne correspond pas) ; `repository.js` utilise `/US-\d+/` pour enregistrer une story invalide. Or `shared/deps.js` accepte déjà `US-E4-02`.
- **Preuve.** `shared/schemas.js:9` (`idPattern`), `:25` ; `server/services/file-scanner.js:47-48` ; `server/services/repository.js:57` ; `shared/deps.js:9`.
- **Impact.** Les fichiers de stories et d'épics à identifiant composé sont classés `other`, absents du board et du backlog ; les dépendances pointent vers des nœuds inexistants.
- **Correctif prévu.** `shared/ids.js` (`STORY_ID_RE`, `nextStoryId`) comme source unique, utilisée par le schéma, le scanner et le repository.
- **Vérification.** Confirmé.

#### K-10 — Gate INVEST toujours refusée pour les stories YAML-only
Majeur · Lot L1 · Statut : corrigé (PR 1)

- **Constat.** Les stories issues uniquement du YAML n'ont pas de champ `invest_score` ; la gate calcule `Number(undefined ?? 0)`, soit 0 < 6, et refuse toujours backlog vers ready-for-dev.
- **Preuve.** `server/services/state-machine.js:33-38` ; `server/services/repository.js:165-182` (aucun `invest_score`).
- **Impact.** Sur un projet BMAD v6, aucune story du backlog ne peut être préparée depuis le board.
- **Correctif prévu.** À préciser au lot L1 (le plan ne détaille pas la règle) : traiter l'absence d'`invest_score` comme « non évaluable » plutôt que comme zéro, dans `shared/transitions.js`.
- **Vérification.** Confirmé.

#### K-11 — Dette diverse
Mineur · Lot L1 · Statut : corrigé (PR 1, puis PR 5 pour les blocs `catch`, voir § 7.5) : corrigés `STATUSES` unique, champ `reason` dans l'historique, identité `kanban:<nom>`, message `archived`, journalisation des échecs d'écriture ; reste 8 blocs `catch` réduits à un commentaire et l'historique du chemin markdown seul, non constaté

- **Constat et preuves.**
  - `STATUSES` dupliqué : `server/services/state-machine.js:19` et `shared/schemas.js:3`.
  - Le champ `reason` de la requête est accepté mais jamais lu : `shared/schemas.js:137`, `server/app.js:115` (seul `blocked_reason` est extrait).
  - `by: 'kanban'` en dur par défaut : `server/services/sprint-cache.js:61` ; l'appelant ne passe jamais `by` (`server/app.js:151`).
  - Le chemin markdown n'ajoute aucun historique : `server/app.js:153`.
  - Message 409 trompeur pour les stories archivées : une story `archived` n'a ni fichier ni `statusSource` et reçoit le texte « gérée par sprint-status.yaml… » (`server/app.js:91-101`, ternaire `:96-98`).
  - `index.html` relu en synchrone à chaque requête : `server/app.js:347`.
  - Aucun journal des échecs d'écriture : `server/app.js:159-163`.
  - 13 blocs `catch` vides ou réduits à un commentaire dans `server/` (`app.js` ×5, `security.js`, `event-bus.js`, `file-writer.js` ×4, `repository.js`, `sprint-cache.js`).
- **Impact.** Maintenance coûteuse ; diagnostics impossibles.
- **Correctif prévu.** Reprise dans `shared/transitions.js`, journalisation des échecs, identité `kanban:<nom>` (`--user` > `CLAUDE_CRAFT_USER` > `git config user.name` > utilisateur OS), historique sur les deux chemins.
- **Vérification.** Corrigé / sous-point non confirmé : la liste brute disait « `reason` jamais utilisé ». Dans l'historique, la raison est bien renseignée (`sprint-cache.js:62` utilise `blocked_reason`) ; seul le champ `reason` de la requête est mort.

#### K-12 — Build client et navigateur jamais vérifiés sur PR
Mineur · Lot L1 · Statut : corrigé (PR 1)

- **Constat.** `npm run kanban:build` n'est exécuté que dans le workflow de publication ; `ci.yml` ne mentionne pas le Kanban. Aucun test navigateur ni axe ne couvre le Kanban (`tests/kanban/*` est exécuté par Vitest, côté serveur et logique pure).
- **Preuve.** `.github/workflows/npm-publish.yml:255-257` ; absence de « kanban » dans `.github/workflows/ci.yml` ; `website/tests/` ne contient que `e2e/` et `lighthouse/` pour le site.
- **Impact.** Un client qui ne compile plus, ou une régression d'accessibilité, ne sont détectés qu'au moment de la publication.
- **Correctif prévu.** Job CI `kanban-e2e` (Playwright + axe sur 6 vues et modales, à 1280 px et 320 px) avec build du client ; violations connues figées dans `known-violations.json` jusqu'au lot L2.
- **Vérification.** Confirmé.

#### K-13 — Une seule mutation exposée
Bloquant · Lot L3 (API), L4 (UI) · Statut : corrigé (PR 3 : API ; PR 4 : interface)

- **Constat.** La seule route d'écriture est `PATCH /api/stories/:id/status`. `StoryPatchSchema` n'est branché sur aucune route (utilisé seulement dans ses tests). `rebuildSprintStatus` n'est utilisé que par ses tests, n'est pas atomique (`writeFile` direct) et reconstruit le fichier sans `archived_sprints`.
- **Preuve.** Routes : `server/app.js:43-347` (un seul `patch`, `:84`) ; `shared/schemas.js:140-147` ; `server/services/sprint-cache.js:80-123` (`:120` écriture directe, `:106-116` objet sans les clés inconnues).
- **Impact.** On ne peut ni créer ni éditer ni supprimer une story, ni assigner, estimer, changer la priorité, changer le statut d'une tâche, planifier backlog et sprint, ni démarrer ou clôturer un sprint : l'outil n'est qu'un tableau de bord.
- **Correctif prévu.** Routes `PATCH /api/stories/:id`, `PUT /api/stories/:id/body`, `POST/DELETE /api/stories`, `PATCH …/tasks/:taskId`, `POST /api/sprints` et `…/start`, `…/close`, `PUT /api/settings/wip`, toutes via `status-store.js` ; retrait de `rebuildSprintStatus` et de `updateSprintStatusStory`.
- **Vérification.** Confirmé.

### 4.2 Fonctionnel client

#### K-14 — Recherche inerte
Majeur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.** Le champ « Rechercher des stories… » et le badge ⌘K n'ont aucun gestionnaire ; aucune valeur n'est lue.
- **Preuve.** `client/src/App.svelte:111-115`.
- **Impact.** Un contrôle visible ne fait rien ; la recherche est attendue sur tout outil de gestion de backlog.
- **Correctif prévu.** Champ filtrant de la barre supérieure (raccourcis `Ctrl/⌘+K` et `/`), état dans le hash (`#/kanban?q=…`).
- **Vérification.** Confirmé.

#### K-15 — Filtres, tri, liens profonds
Mineur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.** Le board n'a qu'un filtre de priorité, non persisté, et aucun tri. `route.query` est calculé mais jamais lu. Aucun lien profond vers une story ni `#/docs/<chemin>`. Une route inconnue affiche une page vide (aucun `{:else}`, titre « Board » par défaut).
- **Preuve.** `client/src/views/KanbanView.svelte:43-48` ; `client/src/lib/router.svelte.js:6-8` (aucune lecture ailleurs, vérifié par `git grep`) ; `client/src/App.svelte:46-47, 143-175`.
- **Impact.** Impossible de partager ou de retrouver une vue filtrée ; erreur de saisie d'URL sans message.
- **Correctif prévu.** État filtres/tri/recherche/story dans le hash, page `NotFound`.
- **Vérification.** Confirmé.

#### K-16 — Clavier du menu « Déplacer »
Majeur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.**
  1. Menu ouvert, les flèches modifient la carte ciblée : le traitement des flèches précède celui du menu, et les boutons du menu agissent sur `focusedCardIndex`. On peut déplacer une carte autre que celle du menu.
  2. `preventDefault` s'applique à Entrée même menu ouvert (la touche est dans `HANDLED`), ce qui empêche d'activer les boutons du menu au clavier.
  3. Quand « Déplacer vers Blocked » ouvre le prompt de raison, le menu reste ouvert : les chiffres 1 à 6 saisis dans la raison sont capturés (et interdits à la saisie), et déclenchent un autre déplacement.
  4. `Alt+M` utilise `key === 'm'` : sur macOS, Option+M produit `µ`.
  5. `import.meta.env.CC_A11Y_KANBAN` est toujours `undefined` (Vite n'expose que le préfixe `VITE_`) : le drapeau n'a aucun effet.
- **Preuve.** `client/src/lib/kanban-nav.js:40, 50-69, 72-85` ; `client/src/views/KanbanView.svelte:114, 117-134, 194-203, 377-382` ; `client/vite.config.js` (aucun `envPrefix`).
- **Impact.** Déplacement d'une mauvaise carte, menu non utilisable au clavier, saisie de raison impossible avec des chiffres, raccourci inaccessible aux utilisateurs de macOS.
- **Correctif prévu.** `board-nav.js` (remplace `kanban-nav.js`) : menu modal isolé du reste de la navigation, cible figée à l'ouverture, `event.code === 'KeyM'`, suppression du drapeau mort et des `svelte-ignore`.
- **Critères liés.** WCAG 2.1.1 Clavier (A), 2.1.4 Raccourcis clavier avec caractères (A) pour le point 3 ; RGAA 7.3 ; 12.10.
- **Vérification.** Confirmé ; points 3 et 5 précisés (portée du handler, absence de préfixe Vite).

#### K-17 — Déblocage et `--readonly` côté UI
Majeur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.** Le menu propose les six colonnes pour une story bloquée alors que le serveur n'accepte que `previous_status` (409 sinon). L'UI n'appelle jamais `/api/health` : en `--readonly`, tous les contrôles d'écriture restent affichés et échouent en 403.
- **Preuve.** `client/src/views/KanbanView.svelte:376-385` ; `server/app.js:117-131` (restriction), `:43` (`health` expose `readonly`) ; `git grep` : aucune occurrence de `health` ni de `readonly` configuré dans `client/src`.
- **Impact.** Actions proposées qui échouent systématiquement.
- **Correctif prévu.** `shared/transitions.js` partagé (cibles autorisées = `allowedTargets(story)`), `allowed[]` dans le 409, `health.svelte.js` qui masque les écritures en `--readonly`.
- **Vérification.** Confirmé.

#### K-18 — États de chargement et erreurs
Mineur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.** `store.loading` est écrit mais jamais lu : les colonnes affichent « No stories » avant la réponse. Le burndown affiche « No burndown data » tant que `store.burndown` est `null`. Le détail d'une story ignore silencieusement une réponse en erreur ou une exception.
- **Preuve.** `client/src/lib/store.svelte.js:12, 55, 65` (aucune lecture) ; `client/src/views/KanbanView.svelte:339-341` ; `client/src/views/BurndownView.svelte:100-101` ; `client/src/lib/detail.svelte.js:49, 58-60`.
- **Impact.** Faux messages d'état vide, échecs invisibles.
- **Correctif prévu.** États chargement/erreur par vue, erreur du détail affichée.
- **Vérification.** Confirmé.

#### K-19 — Réseau et temps réel
Mineur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.** `patchStatus` n'encode pas l'identifiant et mémorise un index de tableau (`idx`) qui peut devenir faux si le store est rechargé pendant la requête. `selectDoc`, `loadDetail` et `loadList` n'annulent ni ne désordonnent leurs réponses (aucun `AbortController`). Le SSE ne resynchronise pas à la reconnexion et déclenche un rechargement par événement, sans debounce. Les vues Sprints, Dépendances et Docs ne chargent qu'à l'ouverture (`$effect` unique).
- **Preuve.** `client/src/lib/store.svelte.js:85-97` (index), `:89` (pas d'`encodeURIComponent`), `:104-131` (SSE) ; `client/src/views/DocsView.svelte:45-57, 78` ; `client/src/views/SprintsView.svelte:41-58, 91-92` ; `client/src/views/DepsView.svelte:55-78`.
- **Impact.** Affichages périmés ou incohérents après une reconnexion ou des mises à jour rapprochées.
- **Correctif prévu.** `api.js` (annulation, encodage, `latestOnly`), `optimistic.js` par identifiant, debounce de 150 ms, resynchronisation à la reconnexion, compteur `revision` observé par toutes les vues.
- **Vérification.** Confirmé.

#### K-20 — Sprint actif, liens, accent
Mineur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.** Un sprint est « actif » dès que `done_points > 0` ; un sprint démarré sans story terminée est « planned ». Les liens `US-xxx` des documents pointent vers `#/kanban` sans ouvrir la story (et ne reconnaissent pas `US-E4-02`). Changer l'accent ne redessine pas le burndown, dont les couleurs sont lues une fois.
- **Preuve.** `client/src/views/SprintsView.svelte:19-23` ; `client/src/views/DocsView.svelte:86-92` ; `client/src/views/BurndownView.svelte:27-41` (l'effet ne dépend pas de `tweaks`).
- **Impact.** État de sprint faux, navigation par liens inopérante.
- **Correctif prévu.** État de sprint issu des métadonnées (début, clôture) ; liens `?story=` ; effet dépendant de l'accent.
- **Vérification.** Confirmé.

#### K-21 — Code mort et duplications
Mineur · Lot L2 (nettoyage final L5) · Statut : corrigé (PR 2 et PR 5) : CSS mort retiré, `markdown.js`, `points.js` et `StoryRow.svelte` en place ; icônes inutilisées, variables CSS héritées et clés i18n mortes supprimées (§ 7.5)

- **Constat.** `.kbd-hint` (`views.css:381`) et `.btn-primary` (`app.css:577`) n'ont aucun usage dans le client. Duplications : ligne de story du Backlog écrite deux fois (`BacklogView.svelte:62-72` et `:98-108`) ; rendu `marked` + DOMPurify trois fois (`detail.svelte.js:54-56`, `DocsView.svelte:62`, `SprintsView.svelte:63`) ; sommes de points répétées (`KanbanView.svelte:68`, `BacklogView.svelte:31`, `SprintsView.svelte:79-80`, au moins).
- **Impact.** Dette de maintenance.
- **Correctif prévu.** Modules `markdown.js`, `points.js`, composant `StoryRow.svelte` ; suppression du CSS mort.
- **Vérification.** Confirmé en partie : les icônes inutilisées, les variables legacy (`app.css:79-84`) et le total « ×5 » des sommes n'ont pas été recomptés.

#### K-22 — Fonctions de gestion de projet absentes de l'UI
Majeur · Lot L4 · Statut : corrigé (PR 4) : `StoryForm.svelte`, `SprintForm.svelte`, `CloseSprintDialog.svelte` et `WipSettings.svelte` existent et sont branchés

- **Constat.** Aucun écran ne permet de créer, éditer, supprimer ou assigner une story, de planifier un sprint, de fixer des limites de WIP, de suivre la vélocité ni de trier (conséquence de K-13 ; vues existantes en lecture seule hors déplacement).
- **Preuve.** Absence de formulaire et d'appel d'écriture dans `client/src/` hormis `patchStatus` (`store.svelte.js:81-102`).
- **Impact.** L'outil ne peut pas remplacer une ligne de commande ou un éditeur pour piloter un projet.
- **Correctif prévu.** `StoryForm`, planification dans `BacklogView`, cycle de sprint dans `SprintsView`, WIP en en-tête de colonne, vélocité dans `BurndownView`, `ConfirmDialog`, `FilterBar`.
- **Vérification.** Confirmé.

#### K-23 — Langues mêlées, pas d'i18n
Mineur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.** Les chaînes mélangent français et anglais (« Workspace », « Rechercher des stories… », « Blocked reason? », « Aide clavier »), sans mécanisme d'internationalisation ; les dates sont affichées brutes, sans `Intl`.
- **Preuve.** `client/src/App.svelte:79, 113, 132, 149` ; `client/src/views/KanbanView.svelte:25-31, 102, 352, 375` ; `client/src/views/SprintsView.svelte:150-151`.
- **Impact.** Interface incohérente, incompatible avec un `lang` unique (voir K-29).
- **Correctif prévu.** Catalogue en `en`, `fr`, `es`, `de`, `pt` (`lib/i18n/`), `Intl.PluralRules` et `Intl.DateTimeFormat`, sélecteur dans le panneau de réglages.
- **Vérification.** Confirmé.

### 4.3 Accessibilité (WCAG 2.2 AA, RGAA 4.1)

#### K-24 — Navigation supprimée sous 980 px
Bloquant · Lot L2 · Statut : corrigé (PR 2)

- **Constat.** Sous 980 px, `.sidebar` (seule navigation entre vues), `.search` et `.docs-tree` passent en `display: none` sans remplacement. `body { overflow: hidden }`. À 400 % de zoom sur un écran de 1280 px, la largeur utile est de 320 px.
- **Preuve.** `client/src/app.css:111, 606-617` ; `client/src/views.css:1382-1384` ; `client/src/components/PromptDialog.svelte:87-88` (`min-width: 320px` plus `padding: 24px`).
- **Impact.** Sur mobile, fenêtre étroite ou zoom, on ne peut plus changer de vue ni choisir un document : perte de fonction pour les personnes qui zooment.
- **Correctif prévu.** Sous 980 px, navigation horizontale visible ; arbre des docs en `<details>` ; `overflow: hidden` seulement au-dessus de 980 px ; colonnes empilées sous 640 px ; modales sans largeur minimale.
- **WCAG.** 1.4.10 Redimensionnement/Reflow (AA). **RGAA 4.1.** 10.11. La perte de navigation n'a pas de critère RGAA dédié : elle relève de 10.11.
- **Vérification.** Confirmé.

#### K-25 — Cartes du board
Majeur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.** Chaque carte est un `<li role="listitem" tabindex="0" onclick>` (avertissements Svelte masqués par trois `svelte-ignore`). Aucun rôle interactif. Espace n'est pas géré (Entrée passe par un gestionnaire global). Chaque carte est un arrêt de tabulation. `aria-label` remplace le contenu accessible : priorité, points, assigné et avancement des tâches ne sont pas annoncés.
- **Preuve.** `client/src/views/KanbanView.svelte:297-315` ; `client/src/lib/kanban-nav.js:88-92`.
- **Impact.** Les utilisateurs de lecteurs d'écran perdent l'essentiel de l'information d'une carte ; une colonne de 30 cartes impose 30 tabulations.
- **Correctif prévu.** `section > h2 + ul > li` ; deux boutons natifs par carte (ouvrir, « Déplacer » avec `aria-haspopup="menu"`) ; plus de `tabindex` sur `li`.
- **WCAG.** 4.1.2 Nom, rôle et valeur (A) ; 1.3.1 Information et relations (A). **RGAA 4.1.** 7.1, 7.3.
- **Vérification.** Confirmé.

#### K-26 — Toasts
Majeur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.** Chaque toast est un `div` cliquable sans équivalent clavier (`svelte-ignore`) ; une région `aria-live="polite"` englobe des éléments `role="status"` (annonces doublées possibles) ; les toasts disparaissent après 3,5 s (5 s pour certains messages d'erreur) sans pause au survol ni au focus.
- **Preuve.** `client/src/App.svelte:180-191` ; `client/src/lib/store.svelte.js:20-27`.
- **Impact.** Une erreur (« Transition failed… ») peut disparaître avant d'être lue ; fermeture impossible au clavier.
- **Correctif prévu.** Une région `status` et une région `alert`, bouton de fermeture, pause au survol et au focus, erreurs persistantes.
- **WCAG.** 4.1.3 Messages d'état (AA) ; 2.2.1 Délai réglable (A) ; 2.1.1 Clavier (A). **RGAA 4.1.** 7.5 ; 13.1 (correspondant de 2.2.1, dont les tests visent rafraîchissements, redirections et sessions) ; 7.3.
- **Vérification.** Confirmé.

#### K-27 — ARIA et structure invalides
Majeur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.** (a) `aria-label` sur des éléments sans rôle : `div.coding-legend` (`KanbanView.svelte:270`), `span.col-count` (`:292`), `span.tdd-pip` (`TddPip.svelte:13`). (b) Des `<div>` sont placés dans `<button class="epic-head">` (contenu non phrasé, HTML invalide). (c) Les lignes d'un épic replié restent dans l'arbre d'accessibilité et focalisables : le repli est un `grid-template-rows: 0fr` avec `overflow: hidden`, sans `visibility` ni `inert`, donc le focus peut aller sur des éléments invisibles.
- **Preuve.** `client/src/views/BacklogView.svelte:44-58` ; `client/src/views.css:759-769`.
- **Impact.** Annonces ignorées ou erronées ; focus « perdu » dans un contenu invisible.
- **Correctif prévu.** Rôles ou texte visible à la place de `aria-label` ; structure sans `div` dans `button` ; contenu replié `inert`/`visibility: hidden`.
- **WCAG.** 1.3.1 (A) ; 4.1.2 (A) ; 2.4.7 Focus visible (AA) pour (c). **RGAA 4.1.** 7.1 ; 8.2 ; 10.7 ; 10.8.
- **Vérification.** Confirmé ; sévérité relevée à majeur (focus sur contenu masqué = non-conformité AA nette).

#### K-28 — Graphe de dépendances et information par la couleur seule
Majeur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.** Le graphe est un canvas (`role="img"`) : les nœuds ne sont accessibles qu'au pointeur (`cy.on('tap', 'node')`) ; il n'existe aucune navigation clavier. Le statut d'un nœud n'est porté que par sa couleur et son libellé n'est donné qu'au clic. Une liste `sr-only` des arêtes existe (« X depends on Y »), mais elle n'indique ni statut ni appartenance à un cycle. Dans la modale, un dépassement d'heures (`t-over`) n'est signalé que par la couleur.
- **Preuve.** `client/src/views/DepsView.svelte:126-165` (couleur de fond par statut), `:172-175` (tap seul), `:216-221`, `:248-254` ; `client/src/components/StoryDetail.svelte:95, 114`.
- **Impact.** Les utilisateurs de lecteurs d'écran et de clavier n'accèdent pas au statut ni aux cycles ; les personnes daltoniennes ne perçoivent pas le dépassement.
- **Correctif prévu.** Équivalent liste/tableau avec statut en texte et liens `?story=` ; mention textuelle du dépassement.
- **WCAG.** 1.1.1 Contenu non textuel (A) ; 2.1.1 Clavier (A) ; 1.4.1 Utilisation de la couleur (A). **RGAA 4.1.** 1.1 ; 1.6 ; 7.3 ; 3.1.
- **Vérification.** Corrigé : une alternative textuelle partielle existe (liste des arêtes, compteur de cycles dans `aria-label` et en-tête).

#### K-29 — Titre, langue, titres, focus de vue
Majeur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.** `<title>` statique ; `lang="en"` alors que l'interface mêle français et anglais ; aucun titre propre dans Backlog et Docs ; Docs peut afficher un second `h1` (le Markdown rendu) ; `nav` imbriqué dans `aside` ; `main` sans `tabindex="-1"` ; le focus n'est pas déplacé au changement de vue.
- **Preuve.** `client/index.html:2, 6` ; `client/src/App.svelte:69-78, 107, 137` ; `client/src/views/BacklogView.svelte` (aucun titre) ; `client/src/views/DocsView.svelte:150` (`{@html renderedContent}`).
- **Impact.** Navigation par titres et annonce de la langue erronées ; changement de vue silencieux pour un lecteur d'écran.
- **Correctif prévu.** `<title>` dynamique par vue, `lang` synchronisé avec la langue choisie, `h1` unique, `h2` dans Backlog et Docs (titres Markdown décalés), `main[tabindex=-1]` focalisé au changement de vue.
- **WCAG.** 2.4.2 Titre de page (A) ; 3.1.1 Langue de la page (A) ; 3.1.2 Langue d'un passage (AA) ; 1.3.1 (A) ; 2.4.6 En-têtes et étiquettes (AA) ; 2.4.3 Ordre du focus (A). **RGAA 4.1.** 8.5 ; 8.6 ; 8.3 ; 8.4 ; 8.7 ; 9.1 ; 12.6 pour `nav` dans `aside`.
- **Vérification.** Confirmé ; sévérité relevée à majeur (critères de niveau A en échec).

#### K-30 — Contrastes
Majeur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.** Voir l'annexe A. En échec : `--accent-fg` sur `--accent` violet (2,34:1, bouton de confirmation du prompt) ; chip priorité Won't (4,00:1) ; bordures de composants (cartes, boutons, filtres, champs : 1,09 à 2,28:1, seuil de 3:1 pour une bordure qui identifie le composant) ; champ de recherche : `outline: none` et bordure qui passe de 1,19:1 à 2,28:1 au focus. En limite : chip Must (4,498:1) et `--fg-faint` sur le sprint sélectionné (4,36 à 4,75 selon l'accent).
- **Preuve.** `client/src/app.css:7-60` (tokens), `:403-427` (recherche, `outline: none` en `:424`) ; `client/src/lib/tweaks.svelte.js:12-17, 57` ; `client/src/components/PriorityChip.svelte:13` ; `client/src/views.css:847-850`.
- **Impact.** Texte et composants difficiles à distinguer, notamment avec l'accent violet ; bouton de confirmation illisible pour une partie des utilisateurs.
- **Correctif prévu.** Tokens corrigés (texte de 4,5:1, composants de 3:1 au minimum), verrouillés par `tests/kanban/contrast.test.js` ; `:focus-visible` partout.
- **WCAG.** 1.4.3 Contraste minimum (AA) ; 1.4.11 Contraste des éléments non textuels (AA) ; 2.4.7 (AA) pour la recherche. **RGAA 4.1.** 3.2 ; 3.3 ; 10.7.
- **Vérification.** Corrigé : voir annexe A ; Must 4,498 (et non 4,36), `fg-faint` sur sprint sélectionné 4,36 pour lime (et non 3,92), bordures de 1,09 à 2,28 (et non 1,17 à 2,28).

#### K-31 — Cibles, tailles, animation, aide fixe
Mineur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.**
  1. Le bouton `.toggle` des tâches fait 16 px de large.
  2. Polices de 9,5 à 10,5 px (`.tag-mini` 9,5 px, `.si-state` 10 px, `.toggle` 10 px, `.ro-lock` 10,5 px, `kbd` 10,5 px). Ce n'est pas en soi une non-conformité WCAG ; c'est un problème de lisibilité.
  3. L'animation `ping` de l'indicateur « Live » est infinie : la règle `prefers-reduced-motion` cible `*`, qui ne s'applique pas aux pseudo-éléments `::after`.
  4. Le `<details>` d'aide est `position: fixed` en bas de page et peut masquer un élément focalisé (à vérifier au navigateur, non testé).
- **Preuve.** `client/src/views/SprintsView.svelte:241-249` (`.tag-mini`, `.toggle`) ; `client/src/views.css:861-869` (`.si-state`), `:407-420` (aide fixe) ; `client/src/app.css:596-603` (`.ro-lock`), `:204-209, 484-492` (animation).
- **Impact.** Cibles difficiles à atteindre ; mouvement permanent non désactivable.
- **Correctif prévu.** Cibles d'au moins 24 px, police d'au moins 12 px, `ping` coupé sous `prefers-reduced-motion` (y compris `::after`), aide non masquante.
- **WCAG.** 2.5.8 Taille de la cible (AA, WCAG 2.2) ; 2.2.2 Pause, arrêt, masquage (A) ; 2.4.11 Focus non masqué (AA, WCAG 2.2). **RGAA 4.1.** 13.8 pour l'animation ; 2.5.8 et 2.4.11 sans équivalent RGAA 4.1.
- **Vérification.** Corrigé, deux sous-points non confirmés : (i) « focus non restitué au déclencheur du PromptDialog » : `<dialog>.close()` restitue nativement le focus à l'élément précédent, et le menu « Déplacer » le restitue lui-même (`KanbanView.svelte:241-249`) ; (ii) « `:focus` au lieu de `:focus-visible` » (`PromptDialog.svelte:116, 142, 155`) n'est pas un défaut de conformité (le focus est visible, parfois aussi à la souris).

#### K-32 — Mises à jour temps réel non annoncées
Mineur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.** Un déplacement fait par un tiers (SSE) recharge le store mais ne produit aucune annonce : la région live n'est alimentée que par les actions locales. Les `setTimeout` qui vident cette région ne sont jamais annulés, et un nouveau message peut être effacé par la minuterie du précédent.
- **Preuve.** `client/src/lib/store.svelte.js:113-130` ; `client/src/views/KanbanView.svelte:210-231, 356`.
- **Impact.** Un utilisateur de lecteur d'écran ignore que le board a changé.
- **Correctif prévu.** `announce.js` (une file, minuterie annulable) et annonce des changements entrants.
- **WCAG.** 4.1.3 Messages d'état (AA). **RGAA 4.1.** 7.5.
- **Vérification.** Confirmé.

#### K-34 — Pas d'alternative à un seul pointeur au glisser-déposer (nouveau)
Majeur · Lot L2 · Statut : corrigé (PR 2)

- **Constat.** Pour déplacer une carte avec la souris ou au toucher, la seule voie est le glisser-déposer HTML5 (`draggable`, `ondragstart`, `ondrop`). La seule alternative est clavier (`Alt+M`, menu). Il n'existe aucun bouton ou menu cliquable par carte ; sur écran tactile, le glisser-déposer HTML5 est peu fiable.
- **Preuve.** `client/src/views/KanbanView.svelte:83-110, 306-307, 285-287` ; aucun bouton « Déplacer » dans le gabarit de carte (`:301-337`).
- **Impact.** Les personnes qui ne peuvent pas maintenir un clic enfoncé et glisser (tremblements, commande vocale, pointeur de substitution) ne peuvent pas changer le statut d'une story.
- **Correctif prévu.** Bouton natif « Déplacer » `aria-haspopup="menu"` dans chaque carte, menu limité aux cibles autorisées (alternative au glisser-déposer).
- **WCAG.** 2.5.7 Mouvements de glissement (AA, WCAG 2.2). **RGAA 4.1.** pas d'équivalent (13.10 ne vise que les gestes multipoints ou à tracé, pas le glisser-déposer).
- **Vérification.** Ajouté à la vérification du code ; non listé dans la liste brute (le plan d'implémentation le prévoit déjà au point « Board »).

### 4.4 Documentation

#### K-33 — Documentation inexacte
Mineur · Lot L5 · Statut : corrigé (PR 5)

- **Constat.**
  - `docs/FAQ.md:301` : « lecture seule — pas de modification de données » ; le Kanban écrit les transitions (`README.md:74`).
  - `docs/TROUBLESHOOTING.md:898-914` : schéma `version: 2 / current_sprint / sprints:` que `SprintStatusSchema` rejette (il exige `metadata{…}` et `stories` en table par identifiant : `shared/schemas.js:80-129`).
  - `docs/ACCESSIBILITY.md:83-89` : documente `CC_A11Y_KANBAN=0`, sans effet (voir K-16).
  - `docs/FAQ.md:297` et `docs/CHEAT-SHEET.md:463` : « port 3141 » alors que le port par défaut est 3737 (`cli/lib/kanban.js:51`).
  - La vue Sprints n'est documentée nulle part.
- **Impact.** Dépannage trompeur ; attentes erronées.
- **Correctif prévu.** Mise à jour en cinq langues (parité i18n 0,80) : `docs/CLI-REFERENCE.md`, `docs/FAQ.md`, `docs/TROUBLESHOOTING.md`, `docs/ACCESSIBILITY.md`, `README.md`, guides, templates, `CHANGELOG.md`.
- **Vérification.** Corrigé : le port erroné (FAQ.md:297, CHEAT-SHEET.md:463) est un ajout à la liste brute.

## 5. Annexe A — Contrastes

Méthode : tokens de `client/src/app.css:7-60` et `client/src/lib/tweaks.svelte.js:12-17` (accents) ; alpha composité en sRGB encodé : chips de priorité 16 % (`PriorityChip.svelte:13`) et pips TDD 15 % (`TddPip.svelte:14`) sur `--bg-elev` (fond des cartes, `views.css:287`) ; `--accent-soft` 13 % (`tweaks.svelte.js:57`) sur `--bg`, car l'état sélectionné du sprint remplace le fond (`views.css:847-850`). Seuils : 4,5:1 (texte, WCAG 1.4.3 / RGAA 3.2), 3:1 (composants et bordures identifiantes, WCAG 1.4.11 / RGAA 3.3). Précision attendue : environ ±0,05 (arrondis et gamut).

### Texte

| Paire (texte / fond) | Ratio | Seuil | Résultat |
|---|---|---|---|
| `fg` / `bg` | 17,41 | 4,5 | OK |
| `fg-dim` / `bg` | 7,77 | 4,5 | OK |
| `fg-dim` / `bg-elev` (carte) | 7,22 | 4,5 | OK |
| `fg-faint` / `bg` | 5,73 | 4,5 | OK |
| `fg-faint` / `bg-sidebar` | 5,95 | 4,5 | OK |
| `fg-faint` / `bg-elev` (carte) | 5,33 | 4,5 | OK |
| `fg-faint` / `bg-elev-2` | 4,82 | 4,5 | OK |
| `fg-faint` / `bg-inset` (placeholder, état « planned ») | 6,01 | 4,5 | OK |
| `accent-fg` / `accent` — lime | 12,52 | 4,5 | OK |
| `accent-fg` / `accent` — cyan | 11,55 | 4,5 | OK |
| `accent-fg` / `accent` — **violet** | **2,34** | 4,5 | **Échec** |
| `accent-fg` / `accent` — amber | 9,82 | 4,5 | OK |
| `accent-fg` / `accent-dim` (survol) — lime / cyan / amber | 7,21 / 6,76 / 6,77 | 4,5 | OK |
| `accent-fg` / `accent-dim` (survol) — **violet** | **3,64** | 4,5 | **Échec** |
| `fg-faint` / `accent-soft` sur `bg` (sprint sélectionné) — **lime** | **4,36** | 4,5 | **Échec (limite)** |
| idem — cyan | 4,48 | 4,5 | Échec (limite, −0,02) |
| idem — violet / amber | 4,75 / 4,52 | 4,5 | OK (marge faible) |
| `accent` / `accent-soft` sur `bg` (état « active ») — lime / cyan / violet / amber | 10,69 / 9,37 / 6,45 / 9,01 | 4,5 | OK |
| `accent` / `bg` (texte accent) — lime / cyan / violet / amber | 14,05 / 11,97 / 7,78 / 11,43 | 4,5 | OK |
| Chip priorité **Must** (texte / fond 16 % sur carte) | **4,498** | 4,5 | **Échec (limite, −0,002)** |
| Chip priorité Should | 7,28 | 4,5 | OK |
| Chip priorité Could | 5,97 | 4,5 | OK |
| Chip priorité **Won't** | **4,00** | 4,5 | **Échec** |
| Pip TDD red / green / refactor | 4,56 / 6,73 / 6,14 | 4,5 | OK (red : marge de 0,06) |
| `danger` / `bg` ; `success` / `bg` ; `warning` / `bg` | 5,59 ; 9,58 ; 10,90 | 4,5 | OK |
| `danger` / `bg-elev` (note « Bloqué » en modale) | 5,20 | 4,5 | OK |

### Composants et bordures

| Paire (bordure ou indicateur / fond) | Ratio | Seuil | Résultat |
|---|---|---|---|
| `border-faint` / `bg-elev` (carte, chip, filtre) | 1,09 | 3 | Échec |
| `border-faint` / `bg-sidebar` (colonne) | 1,22 | 3 | Échec |
| `border-faint` / `bg` (sprint-item) | 1,17 | 3 | Échec |
| `border-faint` / `bg-topbar` (champ de recherche) | 1,19 | 3 | Échec |
| `border` / `bg-elev` (bouton `.btn`, dialogues) | 1,31 | 3 | Échec |
| `border` / `bg-sidebar` (champ du prompt) | 1,47 | 3 | Échec |
| `border-strong` / `bg-elev` | 2,12 | 3 | Échec |
| `border-strong` / `bg` (focus de la recherche) | 2,28 | 3 | Échec |
| `accent` (anneau de focus) / `bg-elev` — lime / cyan / violet / amber | 13,06 / 11,13 / 7,23 / 10,62 | 3 | OK |
| `accent-ring` 55 % / `bg` — lime / cyan / violet / amber | 4,81 / 4,24 / 3,10 / 4,09 | 3 | OK |
| Pastilles de statut (6 teintes) / `bg-sidebar` | 6,04 à 11,34 | 3 | OK |

**Remarques.** Une bordure n'est soumise à 1.4.11 que lorsqu'elle est le seul indice visuel de la limite du composant. Pour les cartes et colonnes, le fond distinct et la structure peuvent suffire ; pour le champ de recherche, le champ du prompt et les boutons `.btn`, la bordure est l'indice principal, d'où l'échec retenu en K-30. Le tableau est donc un plafond de risque, à confirmer par l'audit axe du lot L1.

**Écarts avec la liste brute.** Chip Must : 4,498 (liste : ≈ 4,36). `fg-faint` sur sprint sélectionné : 4,36 en lime, 4,48 cyan, 4,75 violet, 4,52 amber (liste : ≈ 3,92). Bordures : 1,09 à 2,28 (liste : 1,17 à 2,28). Violet 2,34 et Won't 4,00 : confirmés.

## 6. Limites et suites

- **Limites.** Voir le § 2 : revue statique, pas d'exécution navigateur ni de lecteur d'écran, contrastes calculés. Les constats d'exécution (K-03 course, K-31 point 4, K-24 rendu à 320 px) sont déduits du code.
- **Suites.** L1 : durcissement serveur (K-01, K-02 partie markdown, K-04 à K-12), harnais navigateur et axe, présent rapport. L2 : i18n, accessibilité et corrections client (K-14 à K-21, K-23 à K-32, K-34). L3 : API d'écriture sûre (K-02 partie YAML, K-03, K-13). L4 : UI d'édition, planification, limites WIP, vélocité (K-22). L5 : documentation (K-33), nettoyage du code mort, et mise à jour de la colonne « Statut » de chaque fiche (actuellement « à corriger » partout).
- **À confirmer avant publication du rapport final.** La mesure axe à 1280 px et 320 px pour valider l'annexe A.

## 7. Constats ajoutés pendant l'implémentation

Ces points n'étaient pas dans la liste initiale ; ils ont été trouvés en écrivant ou en relisant les correctifs.

### 7.1 Revue de sécurité du lot 3 (API d'écriture)

Statut : **corrigé (PR 3)** pour les neuf points.

- **Fichier `.bak` (faille préexistante).** Lors de l'écriture d'un frontmatter, la copie de sauvegarde `<story>.md.bak` suivait un lien symbolique posé à cet emplacement (branche hostile) : l'écriture pouvait sortir du fichier de la story. Test : `tests/kanban/security-write-api.test.js`.
- **Expressions régulières quadratiques** sur le markdown : l'analyse de la liste de métadonnées reste linéaire sur les longues lignes, les suites de lignes vides et les marqueurs de commentaire.
- **Bombe d'alias YAML** : un `sprint-status.yaml` ou un frontmatter de story à alias imbriqués est déclaré invalide au lieu d'être développé (la story concernée devient invalide, le tableau reste réactif).
- **FIFO à la place du YAML ou du verrou** : un `sprint-status.yaml` qui pointe vers un tube nommé est signalé invalide au lieu de bloquer le rafraîchissement ; un fichier `.lock` qui pointe vers un tube nommé est jugé périmé et remplacé.
- **Corps contenant un frontmatter** : `PUT /api/stories/:id/body` refuse un corps qui deviendrait un frontmatter dans un fichier qui n'en a pas.
- **Ligne `Status` masquée par un commentaire** : une ligne de statut coupée par un commentaire HTML est refusée (`status_line_forbidden`), le lecteur retirant les commentaires avant d'analyser.
- **`.bmad/` absent** : le déplacement ou l'édition d'une story suivie par le YAML renvoyait un 500 ; la réponse est 409 `sprint_status_missing`.
- **Épic invalide** : `PATCH /api/stories/:id` refuse un identifiant d'épic `E<n>` que le schéma du frontmatter rejetterait (la story aurait disparu du tableau).
- **Markdown supprimé à tort** : à la création d'une story, le fichier markdown est conservé quand seul le rafraîchissement du tableau échoue après l'écriture du YAML ; le retour arrière ne concerne que l'échec de cette écriture.

### 7.2 Relecture accessibilité du lot 2

Statut : **corrigé (PR 2)** pour les huit points.

1. Focus perdu après la fermeture d'une notification.
2. Focus perdu après l'effacement des filtres.
3. Déplacement d'une carte annoncé deux fois.
4. Animation `ping` encore active sous `prefers-reduced-motion` (pseudo-élément `::after` du témoin « Live »).
5. Cible de 23 px, sous le minimum de 24 px (WCAG 2.5.8).
6. Zone de recherche sans nom accessible.
7. Régions live créées avec leur message déjà dedans, donc non annoncées.
8. Fenêtre Réglages non centrée.

### 7.3 Minuteries non liées (« Illegal invocation »)

Statut : **corrigé (PR 2)**. Les modèles de minuterie (`toasts.js`, `announce.js`) recevaient `setTimeout` et `clearTimeout` sans leur objet global ; appelés comme méthodes d'un autre objet, ils lèvent `TypeError: Illegal invocation` dans un navigateur, ce que les tests sous Node ne voient pas.

### 7.4 Test instable du watcher

Statut : **corrigé (commit `20c75d1e`)**. Le test du watcher attendait par une pause fixe ; il attend maintenant que le watcher soit prêt.

### 7.5 Revue finale du lot 4 (parcours de bout en bout)

Statut : **corrigé** pour les points ci-dessous. Le parcours complet d'un chef de projet est joué par `website/tests/kanban/journey.spec.ts` (création, estimation, priorisation, assignation, création et planification d'un sprint, clôture avec report, démarrage, passage des gates jusqu'à « done », blocage et déblocage, limite WIP, burndown et vélocité, filtre, recherche, lien profond, rechargement, contrôle des fichiers sur disque), puis en français et à 320 px.

1. **Gate « tâches terminées » infranchissable depuis l'interface (bloquant).** Une story créée sur le tableau n'avait aucune tâche et aucun moyen d'en ajouter : elle restait en « in-progress ». Ajout de `POST /api/stories/:id/tasks` et d'un champ « Nouvelle tâche » dans le détail. Une story qui n'avait qu'un compteur de tâches reçoit, à la première modification et dans la même mutation, un statut par tâche (les premières tâches, autant que le compteur, comptent comme terminées) : le compteur n'est plus remis à 1. Tests : `routes-stories.test.js`, `journey.spec.ts`.
2. **Saisie perdue au changement d'URL ou par Échap.** Retour arrière, lien vers une autre story, nouveau `?story=` fermaient le formulaire d'édition sans confirmation ; Échap et le fond fermaient le formulaire de sprint sans confirmation. Le routeur retient désormais la navigation tant qu'un formulaire modifié n'a pas été abandonné (`lib/leave-guard.js`). Tests : `leave-guard.test.js`, `unsaved.spec.ts`.
3. **Faux conflit 409 après un déplacement.** Un rechargement du tableau lancé avant une écriture et reçu après remettait l'ancienne version de la story (et son ancien `_rev`) : la modification suivante affichait « modifiée entre-temps ». Ces rechargements sont maintenant ignorés et relancés. Test : `crud.spec.ts`.
4. **Focus volé après un déplacement** : la réponse du serveur ramenait le focus sur la carte même si l'utilisateur était passé à un autre contrôle (WCAG 2.4.3). **Focus perdu sur `<body>`** à la fermeture du détail d'une story qui vient d'être créée. Tests : `a11y-review.spec.ts`.
5. **Explication des gates en anglais technique** (`missing`) dans un toast non traduit : le refus nomme maintenant ce qu'il faut faire, dans la langue de l'interface. Les toasts sont traduits à l'affichage (pluriels compris) et suivent un changement de langue ; trois confirmations au plus à l'écran pour ne plus masquer le tableau. Tests : `toasts.test.js`, `journey.spec.ts`.
6. **WIP compté différemment par le serveur et la colonne** (toutes les stories contre celles du sprint actif) : le serveur compte comme la colonne et le client affiche son avertissement. Tests : `kanban-config.test.js`, `routes-stories.test.js`.
7. **API** : `GET /api/sprints` et `/api/sprints/:id` donnent les dates et la capacité (le client ne relit plus le markdown) ; un 409 `conflict` porte la story au format de l'API (avec `_rev`). Tests : `routes-sprints.test.js`, `routes-stories.test.js`.
8. **Formulaires** : boîte d'alerte vide dessinée sous le formulaire d'édition ; « Titre(obligatoire) » sans espace ; boutons radio de la clôture écrasés à 13 px à 320 px ; texte indicatif du champ de recherche tronqué en français et en portugais ; suppression d'une story en cours confirmée en deux questions au lieu d'une ; ids en dur de `PromptDialog`. Tests : `a11y-review.spec.ts`, `crud.spec.ts`.
9. **Test instable du lot 2 (arbre des Docs à 320 px)** : une fois sur quatre passages complets, l'arbre restait ouvert après le choix d'un document. Cause probable : `bind:open` apprend l'ouverture par l'événement asynchrone `toggle`, qui pouvait réécrire `open` après la fermeture ; l'élément est maintenant fermé directement. Non reproduit de façon déterministe (25 répétitions ciblées vertes avant et après la correction).
10. **Dette K-11 et K-21** : `catch` silencieux justifiés ou journalisés (abonné SSE en échec) ; icônes, variables CSS et 40 clés i18n mortes supprimées, garde-fou `every en key is used` dans `i18n-parity.test.js`.

### 7.6 Courses révélées par le navigateur de la CI

Les tests navigateur du lot 4 passaient en local et échouaient sur GitHub Actions. Le harnais local utilisait le Chromium de l'image Docker, plus ancien que celui livré par Playwright et utilisé en CI. Les minutages différents ont mis en évidence des défauts du produit, pas des tests. Tous sont corrigés dans la PR 4, chacun avec un test qui échouait d'abord (`unsaved.spec.ts`, `crud.spec.ts`, `keyboard.spec.ts`, `planning.spec.ts`, `tests/kanban/optimistic.test.js`).

1. **Confirmation résolue trop tard.** `ConfirmDialog` ne prenait sa réponse qu'à l'événement `close` du dialogue, émis une image plus tard. Pendant cet intervalle, un retour arrière ou un lien était annulé sans question, et l'événement tardif répondait « continuer la saisie » à la question suivante : « abandonner » ne faisait alors plus rien. La réponse est désormais prise au clic.
2. **Échap répété.** Le navigateur n'honore l'annulation de la fermeture d'un dialogue qu'une fois par geste utilisateur : après plusieurs appuis sur Échap, un formulaire rempli se fermait sans question. Les formulaires traitent maintenant Échap à l'appui de touche.
3. **Faux conflit après un déplacement.** Ouvrir le formulaire d'édition pendant qu'un déplacement était encore en cours figeait l'ancienne révision ; l'enregistrement suivant annonçait « modifiée ailleurs » alors que l'auteur était l'utilisateur lui-même. L'édition attend désormais la fin des écritures en cours sur la story.
4. **Planification.** Un clic sur une ligne du backlog pendant une requête de planification était ignoré sans retour ; un rechargement temps réel reçu pendant une écriture annulait visuellement le déplacement. Les appels sont mis en file et le rechargement est reporté.
5. **Focus repris.** La fermeture des Réglages ou du détail d'une story reprenait le focus même si l'utilisateur était déjà allé ailleurs.

Le harnais local utilise maintenant par défaut le même Chromium que la CI (`KANBAN_BROWSER=system` conserve l'ancien). Motif encore présent, sans défaillance observée : `PromptDialog` et `CloseSprintDialog` résolvent toujours leur réponse à l'événement `close`.

## 8. Non vérifié / limites

**Non vérifié.**

- Lecteurs d'écran réels (NVDA, JAWS, VoiceOver, TalkBack) : le comportement ARIA est déduit du code et des règles ARIA 1.2.
- Firefox, Safari et appareils tactiles : les contrôles automatiques (axe, tests clavier) ne tournent que sous Chromium.
- Mode contrastes forcés de Windows.
- Score de mutation (Stryker) : non mesuré en local ; il est calculé par la CI.

**Limites connues de l'interface.**

- Une tâche ajoutée ne peut être ni renommée ni supprimée depuis l'interface (seul son statut change) ; une tâche saisie par erreur doit être passée à « terminée » ou retirée du YAML.
- Le bundle principal (`index-*.js`) est passé de 87,4 kB à 110,7 kB (35,5 kB gzip) avec les formulaires du lot 4 ; leur chargement différé n'a pas été fait (composants liés par `bind:this` et `bind:draft`, gain modeste pour un outil local).

- Le panneau d'un nœud du graphe de dépendances ne s'ouvre qu'au pointeur ; le tableau équivalent est l'alternative au clavier et au lecteur d'écran.
- Le contenu des stories (titres, markdown) n'a pas d'attribut `lang`, même s'il est rédigé dans une autre langue que l'interface.

**Risques résiduels de l'écriture.**

- Un dossier remplacé par un lien symbolique dans une branche hostile n'est pas détecté sur tout le chemin d'écriture : la protection porte sur le fichier, pas sur chaque dossier parent.
- `POST` n'est pas idempotent : un envoi répété (double clic, nouvelle tentative réseau) crée deux stories ou deux sprints ; seule une collision de nom de sprint est refusée (`sprint_exists`).
- Le YAML et le markdown peuvent diverger (par exemple une ligne `Points` du markdown différente de la YAML) ; la divergence est signalée par un avertissement (`metadata_sync_failed`), pas réparée.
- La reprise d'un verrou périmé (plus de 10 s) n'est pas atomique : deux processus qui reprennent le même verrou au même instant peuvent s'écrire dessus ; la revalidation du schéma et la détection de conflit par story limitent les dégâts.
