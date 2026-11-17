# Mise à jour de la commande mainteneur `/common:add-technology`

## Contexte

`.claude/commands/common/add-technology.md` (297 lignes, FR, réservée au mainteneur : listée dans `config/removed-commands.yaml` et donc retirée des installations utilisateurs) a servi à ajouter le stack Ruby / Rails en v9.1.0 (PR #212, commit 08268980). Elle est en partie périmée. Le travail réel s'est écarté du prompt sur ces points :

1. **`docs/index.html` n'existe plus.** Le site est en VitePress (`website/`). Seuls `website/.vitepress/theme/LandingPage.vue`, `components/AgentShowcase.vue`, `components/StatsGrid.vue` (compteur « Tech Stacks ») et `components/TechGrid.vue` (nécessite un logo `website/public/logos/<tech>.svg`) sont suivis par git. `website/<lang>/` est généré par `website/scripts/sync-docs.sh` : ne pas l'éditer.
2. **Layout des commandes v9.** On ne génère plus `check-compliance/architecture/code-quality/testing/security.md`. Le format attendu :
   - `commands/check.md` : routeur `/<tech>:check <architecture|code-quality|security|testing|all>` ;
   - `checks/<axe>.md` pour les 4 axes et `checks/all.md` (agrégat noté sur 100), installés dans `.claude/references/<tech>/checks/`.
   Modèle : `Dev/i18n/{base,en}/PHP/` et `Dev/i18n/{base,en}/Ruby/`.
3. **Couche `base/` vs langues.** Les contenus en anglais neutre (checks par axe, checklists, templates, `rules/00-project-context.md.template`) vont dans `Dev/i18n/base/<Tech>/`. Ces fichiers ne doivent exister dans aucune langue (test i18n-base-overlay), sauf les deux replis surchargeables `commands/check.md` et `checks/all.md`.
4. **Tiers** (`cli/lib/tech-registry.js`) :
   - Tier 2 : rules 02/03/06/07/08/11 + CLAUDE.md.template + agent + check.md + checks/all.md traduits ×5 ;
   - Tier 3 : rules en anglais dans `base/` (cf. Vite/Vercel).
   La commande doit demander le tier (et le périmètre langage/framework) avant de générer.
5. **Couche mainteneur `.claude/` optionnelle** (commands, agents, references). Si on l'ajoute : mettre à jour les compteurs « N commands / N namespaces » de `.claude/CLAUDE.md` ligne 5 et du README (test `tests/content/doc-counts`).
6. **Points d'intégration manquants dans le prompt** (tous vérifiés avec Ruby) :
   - `cli/lib/tech-registry.js` et `config/versions.yaml` (`stacks.<key>.registry` doit être strictement égal à `version`, gate `node scripts/verify-versions.mjs`) ;
   - `Dev/scripts/install-<tech>-rules.sh` : copie de `install-php-rules.sh`, pilotée par `tcl-common.sh` et `lib/install-tech-common.sh`. Variables : `TECH_RULE_MAPPINGS`, `DEFAULT_STACK`, `HELP_DESCRIPTION`, `AVAILABLE_COMMANDS`, `ARCHITECTURE_SUMMARY`, `FILE_CONTEXTS`… ;
   - `Makefile` `TECHS` (la cible générique `install-%` existe déjà : pas de nouvelle cible), `Dev/scripts/check-config.sh` `DEV_TECHS`, `Dev/scripts/install-from-config.sh` (case par tech), mots-clés de `.claude-plugin/plugin.json` ;
   - **`Dev/stack-profiles/<tech>/stack.txt`** (obligatoire, testé), plus `permissions.txt` (règles `Bash(...)` uniquement) et `quality.md` ;
   - tests à listes en dur : `tests/cli/constants.test.mjs`, `tests/cli/tech-registry.test.mjs` (compteurs + tiers), `tests/cli/__snapshots__/snapshot.test.mjs.snap`, `tests/scripts/namespace-integrity.test.mjs` (map `TECH`, liste base/, `NO_MAINTAINER_LAYER`), `tests/scripts/command-refs.test.mjs`, `tests/scripts/install-tech-rules.test.mjs` ;
   - docs : README (table des stacks, total installable « N total »), `.claude/CLAUDE.md` (« N technology stacks » + table), `docs/COMMANDS.md` (table des namespaces + section + liste « any of the N stacks »), `docs/AGENTS.md`, `docs/CHEAT-SHEET.md`, `node scripts/generate-references.mjs`, `CHANGELOG.md` `[Unreleased]`.
7. **Placeholders.** `CLAUDE.md.template` peut contenir des placeholders non remplis par le script (ex. `{{PHP_VERSION}}`, `{{RUBY_VERSION}}`). Seuls `{{PROJECT_NAME}}` et `{{TECH_STACK}}` sont substitués par `install-tech-common.sh`.
8. **Vérification réelle** (Docker uniquement, jamais `/tmp`, scratchpad pour les sorties) :
   - `npx vitest run` complet en `node:24` (en root : `node_modules` appartient à root) ;
   - `bash scripts/verify-i18n-parity.sh` (strict, ratio ≥ 0.80) ;
   - `node scripts/verify-versions.mjs`, `node scripts/generate-references.mjs --check`, `npx prettier --check cli/` ;
   - frontmatter validé avec js-yaml (`node_modules/js-yaml/dist/js-yaml.mjs`, `import * as yaml`) ; quoter les `argument-hint` qui commencent par `[` ou `<` ;
   - install réelle `--lang=fr` dans le scratchpad, arborescence comparée à PHP.
9. **Orchestration éprouvée.** Recherche des versions (Context7 + web, rien d'inventé). Puis 2 agents en parallèle : `base/` et `en/`. Puis 4 agents de traduction fr/es/de/pt avec consignes accents, ratio ≥ 0.80 et éléments à ne pas traduire. L'intégration se fait en parallèle par l'agent principal, tests d'abord (TDD).
10. **Piège du hook Bash.** Le hook bloque `docker run --rm` quand la commande contient d'autres jetons ressemblant à `-r`/`-f` (chemins, noms de paquets), ainsi que les redirections vers `/dev/null`. Passer par un script écrit avec Write dans le scratchpad.

## Tâche

Réécrire `.claude/commands/common/add-technology.md` pour qu'il reflète l'état réel du dépôt (v9.1.0) :

- garder la structure actuelle (frontmatter, Mode Plan obligatoire, étapes, DoD, format de sortie), le français avec tous les accents et le ton des autres commandes de `.claude/commands/common/` ;
- **Étape 1** : ajouter des questions de cadrage (périmètre langage/framework, tier 2 ou 3, couche `.claude/` oui/non, catégorie) ;
- **Étape 4** : remplacer l'arborescence par le layout v9 `base/` + langues, en distinguant tier 2 et tier 3 ;
- **Étape 5** : décrire le script d'install à partir de `install-php-rules.sh` (variables à renseigner) plutôt que la liste d'options génériques ;
- **Étape 6** : remplacer la section `docs/index.html` par la liste du point 6 et les fichiers `website/` du point 1 ;
- **Étape 7** : remplacer la DoD par une checklist alignée sur les vrais livrables (pas de « 35 fichiers rules » fixes : calcul selon le tier), avec les commandes de vérification du point 8 ;
- ajouter une section « Orchestration » (point 9) et une section « Pièges connus » (points 3, 7 et 10) ;
- supprimer toute mention de `check-compliance` et des commandes `check-*` ;
- viser ≤ 300 lignes, pointeurs vers les fichiers modèles plutôt que copies de code (règle 12).

## Avant d'écrire

- Lire la commande actuelle, `Dev/scripts/install-php-rules.sh`, `Dev/scripts/lib/install-tech-common.sh` (substitution des placeholders), `Dev/i18n/base/Ruby/` et `Dev/i18n/en/Ruby/` (arborescence), ainsi que le diff du commit 08268980 (`git show --stat 08268980`). Ne citer que des chemins qui existent.
- Vérifier qu'aucun test ne dépend du contenu de `add-technology.md` (seuls `removed-commands` et `namespace-integrity` le référencent, comme commande mainteneur).

## Après

- `npx vitest run` complet (Docker `node:24`), en particulier `tests/content/`.
- Le nombre de fichiers de commandes ne change pas : aucun compteur à toucher.
- Branche `docs/add-technology-v9`, commit `docs(commands): align /common:add-technology with v9 layout and real integration points`, PR vers `main`.
