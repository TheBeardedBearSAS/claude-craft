---
description: Ajouter une nouvelle technologie à claude-craft avec les best practices de Context7 et recherche web
argument-hint: "<nom-technologie> [catégorie]"
---

# Ajouter une Technologie

Vous êtes un expert intégrateur de technologies pour claude-craft. Votre mission est d'ajouter une nouvelle stack technologique en :
1. Cadrant le périmètre et le tier avec le mainteneur
2. Recherchant les best practices via Context7 MCP et recherche web (rien d'inventé)
3. Générant les fichiers selon le layout v9 (`base/` + 5 langues)
4. Créant le script d'installation et branchant tous les points d'intégration
5. Mettant à jour tests, documentation et site, puis vérifiant en Docker

> **Commande mainteneur** : listée dans `config/removed-commands.yaml`, elle n'est jamais installée chez les utilisateurs. Modèle de référence : l'ajout de Ruby / Rails en v9.1.0 (`git show --stat 08268980`).

## Arguments
$ARGUMENTS

- `nom-technologie` : nom de la technologie (ex : `nestjs`, `golang`, `django`)
- (Optionnel) `catégorie` : frontend, backend, mobile, devops, fullstack

Exemple : `/common:add-technology nestjs` ou `/common:add-technology golang backend`

## Mode Plan

> **Le mode plan est obligatoire.** Avant l'exécution, Claude active le mode plan pour analyser le code impacté, proposer un plan d'implémentation et attendre votre validation avant toute modification.

## MISSION

### Étape 1 : Cadrer la Technologie

Identifier : nom officiel et alias, type (framework, bibliothèque, langage, outil), écosystème (test, qualité, déploiement), public cible.

**Puis poser ces questions de cadrage (AskUserQuestion) avant toute génération :**

| Question | Options | Impact |
|----------|---------|--------|
| **Périmètre** | Langage seul / framework seul / langage + framework (ex : Ruby / Rails) | Nom du dossier `Dev/i18n/<lang>/<Tech>/`, `displayName`, `DEFAULT_STACK` |
| **Tier** (`cli/lib/tech-registry.js`) | Tier 2 (supporté) / Tier 3 (communautaire) | Rules traduites ×5 (tier 2) ou en anglais dans `base/` (tier 3) |
| **Couche mainteneur `.claude/`** | Oui / Non (défaut : non, comme Ruby et Paperclip) | Copie dans `.claude/commands/<ns>/`, `.claude/agents/`, `.claude/references/<ns>/` + compteurs |
| **Catégorie** | frontend, backend, mobile, devops, fullstack | `desc` du registry, mots-clés `plugin.json`, docs |

Le tier 1 (core) n'est jamais attribué à un nouveau stack.

### Étape 2 : Rechercher avec Context7 (MCP)

Interroger Context7 (`resolve-library-id` puis `query-docs`) pour : structure de projet recommandée, patterns d'architecture, standards de code, outillage (CLI, formateur, linter), stratégies de test, sécurité, qualité/CI.

### Étape 3 : Compléter avec Recherche Web

- **Versions** : version stable actuelle et date de sortie, sources officielles (release notes, changelog). Ces versions alimentent `config/versions.yaml`.
- **Dépréciations et migrations** en cours.
- **Pratiques communautaires** : boilerplates, configurations de production, pièges courants, anti-patterns.
- **Écosystème** : bibliothèques, outils de test, intégrations DevOps.

Toute version ou affirmation non sourcée est exclue.

### Étape 4 : Générer les Fichiers (layout v9)

Modèles : `Dev/i18n/{base,en}/Ruby/` et `Dev/i18n/{base,en}/PHP/` (tier 2), `Dev/i18n/{base,en}/Vite/` et `Vercel/` (tier 3).

**Couche `base/` (anglais neutre, une seule copie) — commune aux deux tiers :**

```
Dev/i18n/base/<Tech>/
├── checks/
│   ├── architecture.md      # checklist par axe
│   ├── code-quality.md
│   ├── security.md
│   ├── testing.md
│   └── all.md               # repli anglais : agrégat noté sur 100
├── commands/
│   └── check.md             # repli anglais : routeur /<ns>:check <axe>
├── checklists/
│   ├── pre-commit.md
│   └── new-feature.md
├── rules/
│   └── 00-project-context.md.template
└── templates/               # modèles de code spécifiques (2 à 3)
```

**Couche langues (`en`, `fr`, `es`, `de`, `pt`) — tier 2 :**

```
Dev/i18n/<lang>/<Tech>/
├── CLAUDE.md.template
├── agents/<ns>-reviewer.md
├── commands/check.md        # traduction du routeur
├── checks/all.md            # traduction de l'agrégat
└── rules/
    ├── 02-architecture-<ns>.md
    ├── 03-coding-standards.md
    ├── 06-tooling.md
    ├── 07-testing-<ns>.md
    ├── 08-quality-tools.md
    └── 11-security-<ns>.md
```

**Tier 3** : même couche langues **sans** `rules/` ; les 6 rules (02/03/06/07/08/11) vont en anglais dans `Dev/i18n/base/<Tech>/rules/`.

**Routeur `/<ns>:check`** : `commands/check.md` lit le premier argument (`architecture|code-quality|security|testing|all`) et suit `.claude/references/<ns>/checks/<axe>.md`. C'est la **seule** commande d'audit du stack : un fichier par axe va dans `checks/`, jamais dans `commands/`. Reprendre la structure de `Dev/i18n/base/Ruby/commands/check.md`.

**Agent reviewer** : frontmatter `name: <ns>-reviewer`, `tools: [Read, Glob, Grep, WebFetch, WebSearch]`, grille de revue notée sur 100 (cf. `Dev/i18n/en/Ruby/agents/ruby-reviewer.md`).

### Étape 5 : Créer le Script d'Installation

Copier `Dev/scripts/install-php-rules.sh` en `Dev/scripts/install-<ns>-rules.sh`. Le script ne contient que des données : `source tcl-common.sh` (version), puis `source lib/install-tech-common.sh` et `run_tech_install "$@"` font tout le travail (options, copie base + overlay langue, génération de CLAUDE.md).

| Variable | Contenu |
|----------|---------|
| `TECH_NAME` | Nom du dossier i18n (`Ruby`) |
| `TECH_DISPLAY_NAME` | Libellé affiché (`Ruby / Rails`) |
| `TECH_NAMESPACE` | Namespace des commandes (`ruby`) |
| `DEFAULT_STACK` | Stack par défaut, substituée dans `{{TECH_STACK}}` |
| `TECH_RULE_MAPPINGS` | `source:destination` des 6 rules (`02-architecture-<ns>.md:architecture.md`…) |
| `TECH_RULES` | Liste des 6 rules sources (vérifiées en langue **ou** en `base/`) |
| `HELP_DESCRIPTION` | Texte de `--help` |
| `AVAILABLE_COMMANDS` | Ligne `/<ns>:check <architecture\|code-quality\|security\|testing\|all>` |
| `ARCHITECTURE_SUMMARY`, `CODING_STANDARDS_SUMMARY`, `TESTING_STACK` | Résumés injectés dans le CLAUDE.md généré |
| `TECH_REFERENCES` | Liste des fichiers `.claude/references/<ns>/` |
| `FILE_CONTEXTS` | Bloc YAML glob → `suggest_skills` / `quick_tips` |
| `TECH_EXTRA_SED_ARGS`, `TECH_VERIFY_FILE` | Optionnelles (défauts dans `lib/install-tech-common.sh`) |

Pas de cible Makefile dédiée : la cible générique `install-%` couvre tout stack listé dans `TECHS`.

### Étape 6 : Points d'Intégration, Tests et Documentation

**Tests d'abord (TDD)** : mettre à jour les tests à listes en dur, constater l'échec, puis intégrer.

| Fichier | Modification |
|---------|--------------|
| `tests/cli/constants.test.mjs` | Liste des techs installables |
| `tests/cli/tech-registry.test.mjs` | Compteurs totaux et par tier |
| `tests/cli/__snapshots__/snapshot.test.mjs.snap` | Message d'erreur « Available: … » (liste des techs) |
| `tests/scripts/namespace-integrity.test.mjs` | Map `TECH`, liste des dossiers `base/`, `NO_MAINTAINER_LAYER` (si pas de couche `.claude/`) |
| `tests/scripts/command-refs.test.mjs` | Liste des stacks |
| `tests/scripts/install-tech-rules.test.mjs` | Liste des scripts d'install + `it.each` des techs testées |

**Intégration :**

| Fichier | Modification |
|---------|--------------|
| `cli/lib/tech-registry.js` | Entrée `name`, `displayName`, `desc`, `namespace`, `i18nDir`, `installScript`, `version`, `tier` |
| `config/versions.yaml` | `stacks.<ns>.registry` **strictement égal** à `version` du registry + ligne d'historique datée en tête |
| `Makefile` | Ajouter `<ns>` à `TECHS` |
| `Dev/scripts/check-config.sh` | Ajouter `<ns>` à `DEV_TECHS` |
| `Dev/scripts/install-from-config.sh` | Nouveau `case` pointant vers `install-<ns>-rules.sh` |
| `.claude-plugin/plugin.json` | Mots-clés |
| `Dev/stack-profiles/<ns>/stack.txt` | **Obligatoire** (testé par `tests/content/stack-profiles.test.mjs`) : ligne 1 libellé, ligne 2 stack |
| `Dev/stack-profiles/<ns>/permissions.txt` | Règles `Bash(...)` uniquement |
| `Dev/stack-profiles/<ns>/quality.md` | Outils qualité en liste |

**Documentation :**

| Fichier | Modification |
|---------|--------------|
| `README.md` | Table des stacks, total installable « N total » |
| `.claude/CLAUDE.md` | « N technology stacks » (ligne 5) + table des technologies |
| `docs/COMMANDS.md` | Table des namespaces, section `/<ns>:*`, liste « any of the N stacks » |
| `docs/AGENTS.md` | Agent `<ns>-reviewer` |
| `docs/CHEAT-SHEET.md` | Commandes du stack |
| `docs/COMMANDS-FULL-REFERENCE.md` | Régénéré par `node scripts/generate-references.mjs` (ne pas éditer à la main) |
| `CHANGELOG.md` | Entrée sous `[Unreleased]` |

**Site VitePress** (`website/`) — seuls ces fichiers sont suivis par git :

| Fichier | Modification |
|---------|--------------|
| `website/.vitepress/theme/components/StatsGrid.vue` | Compteur « Tech Stacks » |
| `website/.vitepress/theme/components/TechGrid.vue` | Carte du stack (exige `website/public/logos/<ns>.svg`) |
| `website/.vitepress/theme/LandingPage.vue`, `components/AgentShowcase.vue` | Versions et compteurs figés, si concernés |

`website/<lang>/` est généré par `website/scripts/sync-docs.sh` : ne jamais l'éditer.

**Couche `.claude/` (seulement si choisie à l'étape 1)** : copier commands, agent et references sous `.claude/`, retirer `<ns>` de `NO_MAINTAINER_LAYER`, puis mettre à jour les compteurs « N commands / N namespaces » de `.claude/CLAUDE.md` ligne 5 et du README (test `tests/content/doc-counts.test.mjs`).

### Étape 7 : Validation

#### Calcul des livrables

| Bloc | Tier 2 | Tier 3 |
|------|--------|--------|
| `base/` : checks (5) + check.md + checklists (2) + 00-project-context + templates (T) | 9 + T | 9 + T |
| `base/` : rules 02/03/06/07/08/11 | — | 6 |
| Par langue : CLAUDE.md.template + agent + check.md + checks/all.md | 4 × 5 = 20 | 4 × 5 = 20 |
| Par langue : rules | 6 × 5 = 30 | — |
| **Total i18n** | **59 + T** | **35 + T** |

#### Checklist Definition of Done

```
══════════════════════════════════════════════════════════════
✅ DEFINITION OF DONE : Ajout Technologie [{NOM_TECH}] — Tier {N}
══════════════════════════════════════════════════════════════

📁 CONTENU
- [ ] base/ : checks/{architecture,code-quality,security,testing,all}.md
- [ ] base/ : commands/check.md, checklists (2), 00-project-context, templates
- [ ] Langues ×5 : CLAUDE.md.template, agent, commands/check.md, checks/all.md
- [ ] Rules 02/03/06/07/08/11 : ×5 langues (tier 2) ou base/ (tier 3)
- [ ] commands/ ne contient que check.md (+ generate-* éventuels)

🔌 INTÉGRATION
- [ ] install-<ns>-rules.sh, tech-registry.js, versions.yaml
- [ ] Makefile TECHS, check-config.sh, install-from-config.sh, plugin.json
- [ ] Dev/stack-profiles/<ns>/{stack.txt,permissions.txt,quality.md}
- [ ] 6 tests à listes en dur mis à jour (avant l'intégration)

📄 DOCUMENTATION
- [ ] README, .claude/CLAUDE.md, COMMANDS, AGENTS, CHEAT-SHEET, CHANGELOG
- [ ] COMMANDS-FULL-REFERENCE régénéré
- [ ] website : StatsGrid (+ TechGrid et logo si carte ajoutée)

🧪 VÉRIFICATION (Docker uniquement)
- [ ] npx vitest run complet (node:24)
- [ ] bash scripts/verify-i18n-parity.sh (strict, ratio ≥ 0.80)
- [ ] node scripts/verify-versions.mjs
- [ ] node scripts/generate-references.mjs --check
- [ ] npx prettier --check cli/
- [ ] Frontmatter validé avec js-yaml
- [ ] Install réelle --lang=fr dans le scratchpad, arborescence comparée à PHP
══════════════════════════════════════════════════════════════
```

#### Commandes de vérification

Toutes en Docker `node:24`, en root (`node_modules` appartient à root), sorties dans le scratchpad, jamais dans `/tmp` :

- `npx vitest run` (suite complète, pas seulement `tests/scripts/`) ;
- `bash scripts/verify-i18n-parity.sh` ;
- `node scripts/verify-versions.mjs`, `node scripts/generate-references.mjs --check`, `npx prettier --check cli/` ;
- frontmatter : charger `node_modules/js-yaml/dist/js-yaml.mjs` (`import * as yaml`) et parser chaque frontmatter généré ;
- `./Dev/scripts/install-<ns>-rules.sh --lang=fr <scratchpad>/<ns>-project`, puis comparer l'arborescence `.claude/` avec une install PHP.

## Orchestration

1. **Recherche** (agent principal) : versions et pratiques via Context7 + web, sources notées. Rien d'inventé.
2. **Génération en parallèle (2 agents)** : un agent pour `base/`, un pour `en/`. Leur fournir les résultats de recherche et les fichiers modèles Ruby/PHP (chemins, pas copies).
3. **Traduction en parallèle (4 agents)** : `fr`, `es`, `de`, `pt` depuis `en/`. Consignes : accents et diacritiques obligatoires, ratio de taille ≥ 0.80 par fichier, ne pas traduire le code, les commandes, les chemins, les noms d'outils, les clés de frontmatter (`name`, `tools`) ni les axes `architecture|code-quality|security|testing|all`.
4. **Intégration** : menée par l'agent principal pendant les étapes 2 et 3, tests d'abord (TDD).
5. **Vérification** finale (étape 7), puis relecture des diffs générés par les agents (`git status` : un agent peut laisser des fichiers parasites).

## Pièges connus

- **`base/` exclusif** : un fichier présent dans `Dev/i18n/base/<Tech>/` ne doit exister dans aucune langue (`tests/scripts/i18n-base-overlay.test.mjs`), sauf les deux replis surchargeables `commands/check.md` et `checks/all.md`.
- **Placeholders** : `lib/install-tech-common.sh` ne substitue que `{{PROJECT_NAME}}` et `{{TECH_STACK}}`. Les autres (ex : `{{PHP_VERSION}}`, `{{RUBY_VERSION}}`) restent tels quels dans le CLAUDE.md installé : les réserver à ce que l'utilisateur doit remplir.
- **Frontmatter YAML strict** : le parseur maison des tests est tolérant, js-yaml ne l'est pas. Quoter les `description` et `argument-hint` qui commencent par `[` ou `<` ou contiennent `:`.
- **Hook Bash** : `docker run --rm` est bloqué quand la commande contient d'autres jetons ressemblant à `-r`/`-f` (chemins, noms de paquets), de même que les redirections vers `/dev/null`. Écrire la commande dans un script du scratchpad (outil Write) et l'exécuter.
- **Versions** : `config/versions.yaml` est la source unique ; la gate `verify-versions.mjs` échoue si le registry diverge.

## Format de Sortie

```
══════════════════════════════════════════════════════════════
🎉 TECHNOLOGIE AJOUTÉE : {NOM_TECH}
══════════════════════════════════════════════════════════════

📊 RÉSUMÉ
Technologie : {NOM_TECH}            Namespace : /{ns}:*
Catégorie   : {CATÉGORIE}           Tier      : {2|3}
Version     : {VERSION} (source : {URL})
Couche .claude/ : {oui|non}

📁 FICHIERS
Dev/i18n/base/{Tech}/    : {N} fichiers
Dev/i18n/{en,fr,es,de,pt}/{Tech}/ : {N} fichiers
Dev/scripts/install-{ns}-rules.sh
Dev/stack-profiles/{ns}/

🔧 INSTALLATION
make install-{ns} TARGET=~/mon-projet RULES_LANG=fr
./Dev/scripts/install-{ns}-rules.sh --lang=fr ~/mon-projet

🧪 VÉRIFICATION
vitest : {N} tests ✅ | parité i18n ✅ | versions ✅ | références ✅ | prettier ✅

✅ DEFINITION OF DONE : COMPLÈTE
══════════════════════════════════════════════════════════════
```

## Gestion des Erreurs

Si la recherche échoue :
- Indiquer clairement les informations manquantes
- Proposer des sources alternatives
- Demander des clarifications au mainteneur
- NE JAMAIS générer de fichiers avec du contenu placeholder ou inventé
