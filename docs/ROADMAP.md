# Claude Craft — Roadmap publique

> Roadmap vivante. Chaque item correspond à une issue GitHub avec vote via 👍 reactions.
>
> **GitHub Project** : https://github.com/orgs/TheBeardedBearSAS/projects (lien à publier à l'activation du board).

## Principes

- **Transparence** : toutes les décisions majeures apparaissent ici.
- **Vote communautaire** : les reactions 👍 sur les issues de type `enhancement` orientent la priorité.
- **Cycle trimestriel** : la roadmap est revue à chaque fin de phase (audit `audit/phases/*`).

## Colonnes (GitHub Project "Claude Craft Roadmap")

| Colonne | Description |
|---------|-------------|
| **Backlog** | Idées non priorisées, ouvertes au vote. |
| **Voting** | Top 5-10 les plus votés du backlog. Phase de collecte de feedback détaillé. |
| **In Progress** | En cours d'implémentation. Une issue → un PR. |
| **Shipped** | Livré dans une release, liée au CHANGELOG. |
| **Dropped** | Abandonné (duplicate, out of scope, obsolete). Doit inclure un commentaire. |

## Milestones

> **État actuel (2026-06) : v8.11.0 livrée.** Les Phases 1→5 de l'audit 2026-05-18 ont été livrées dans les versions v8.4.0 → v8.7.1 (références paperclip/RN/Vue Vapor, CI durcie CodeQL+Trivy, mutation testing bloquant, `install --auto`/`--from`, marketplace skills, rollback auto, 937 tests). Les versions v8.8.x→v8.11.0 ont apporté la parité i18n stricte (size-parity CI bloquante), la migration branding TheBeardedBearSAS, le Kanban BMAD v6 (ingestion `sprint-status.yaml` lecture seule), et la licence MIT-only. Voir le [CHANGELOG](../CHANGELOG.md). Les milestones ci-dessous reflètent le board de vote communautaire restant.

### v8.x — Stabilisation (livrée — Phases 1→5)

**Issus de `audit/phases/phase-2-stabilisation.md`** (livré majoritairement en v8.5.0) :

- [ ] P2-11 : E2E tests Tools/ dockerisés
- [ ] P2-12 : Bash hardening + shellcheck strict CI ✅
- [ ] P2-13 : Mutation testing Stryker
- [ ] P2-14 : Refactor install scripts DRY (23 → 3 génériques)
- [ ] P2-15 : I18n parity top 20 website/ traduit ✅ (audit livré)
- [ ] P2-16 : SBOM CycloneDX + SLSA L2 ✅
- [ ] P2-17 : 3 showcases clients
- [ ] P2-18 : Roadmap publique + vote ✅ (ce document)
- [ ] P2-19 : 2 co-mainteneurs
- [ ] P2-20 : 10 skills sur marketplace Anthropic

### v9.0 — Différenciation (Q3 2026)

**Items issus de l'audit concurrentiel 2026-06-08** (`docs/audit/2026-06-08-comprehensive/`). Ces chantiers stratégiques sont volontairement sur la roadmap (pas implémentés à la hâte) car ils engagent le positionnement produit :

- [ ] **DIFF-01 — Marketplace officielle Anthropic** : `.claude-plugin/marketplace.json` créé (permet `/plugin marketplace add TheBeardedBearSAS/claude-craft`). Reste : valider via `claude plugin validate`, soumettre à `claude-community` via le formulaire in-app ([claude.ai/settings/plugins/submit](https://claude.ai/settings/plugins/submit)). Objectif : voie d'entrée `/plugin install claude-craft`.
- [ ] **DIFF-02 — Multi-harness élargi** : `bundles/{cursor,gemini,chatgpt,claude}` existent déjà (via `scripts/export-multi-ide.sh`). Étendre à OpenCode et GitHub Copilot ; garder les CLAUDE.md comme source de vérité et générer les formats cibles. Prioriser Cursor (part de marché IDE) et Gemini CLI (free tier).
- [ ] **DIFF-03 — Orchestration multi-modèle** : les Dynamic Workflows (CC 2.1.154+, trigger `ultracode`) couvrent déjà le fan-out multi-agents avec tiering Haiku/Sonnet/Opus. Documenter explicitement le pattern « routing par complexité » dans `rules/12` + comparer à oh-my-claudecode (Claude+Gemini+Codex) dans `docs/ECOSYSTEM.md`.
- [ ] **DIFF-04 — Mémoire persistante inter-sessions** : évaluer un MCP de mémoire vectorielle légère (SQLite + embeddings) pour la persistance des décisions architecturales entre sessions BMAD ; positionner Ruflo comme moteur complémentaire. Référencer dans `docs/ECOSYSTEM.md`.
- [ ] **DIFF-05 — Différenciation BMAD & visibilité** : article comparatif « Claude Craft (BMAD intégré + 11 stacks + RTK) vs BMAD standalone vs oh-my-claudecode », tableau comparatif dans le README, soumissions awesome-claude-code / claudemarketplaces.com, démo vidéo Symfony+Flutter.
- [ ] **DIFF-06 — Coûts tokens BMAD documentés** : table des coûts token estimés par track (Quick/Standard/Enterprise) avec/sans RTK dans `docs/FAQ.md` ; envisager un mode `--lean` (templates BMAD allégés) pour les petites features.
- [ ] **DIFF-07 — i18n 5 langues comme argument commercial** : section « Global Teams » dans le README, landing localisée, ciblage ESN européennes (FR/ES/DE/PT) — différenciateur qu'aucun concurrent n'a.
- [ ] **DIFF-08 — Suite d'évaluation des skills en CI** (inspiré wshobson/agents) : lint statique des `SKILL.md` (longueur, sections requises, liens valides), test de prompt-injection par skill, scoring qualité. Fichiers : `.github/workflows/`, `scripts/`.
- [ ] **DIFF-09 — Démos par stack** : page « Générer un endpoint Symfony DDD en 3 commandes » (+ GIF/vidéo) pour chacun des 11 stacks ; benchmarks comparatifs — renforce le moat « 11 stacks ».
- [ ] **DIFF-10 — Anthropic Skills Marketplace** (mai 2026) : soumettre les 15-20 skills les plus utiles (coding-standards, security, testing, git-workflow, solid-principles…) — distribution gratuite + revenue share 15 %.

> Source détaillée et sévérités : `docs/audit/2026-06-08-comprehensive/02-domaines.md` (Domaine: Concurrentiel).

### Décisions de scope — audit 2026-07-03

Résolutions explicites des GAPs concurrentiels de l'audit du 2026-07-03 (vérifiés par devil's advocate). Conformément au principe « pas implémentés à la hâte », ces décisions sont documentées plutôt que codées en urgence :

- **GAP-01 — Manifeste marketplace** : dérive de version corrigée (`marketplace.json` 8.16.1 → 8.19.1). **À faire** : ajouter un gate CI qui échoue si `plugin.json` ↔ `marketplace.json` divergent, puis `claude plugin validate` + soumission (cf. DIFF-01).
- **GAP-02 — `.mcp.json` pré-configuré** : **décision = opt-in manuel maintenu** (règle 11 : auditer/épingler tout serveur MCP tiers avant usage — l'auto-install par défaut est un anti-pattern supply-chain). Les templates prêts existent (`.claude/templates/mcp/context7-with-tool-search.json`, `github-with-tool-search.json`) et `docs/MCP.md` documente la procédure. Évolution possible : un flag opt-in `--with-mcp` émettant un `.mcp.json` curé/épinglé (à spécifier + tester avant build).
- **GAP-04 — Skills marketplace** : **décision = parkée** (DRAFT P3-23, non annoncée publiquement, aucun user ne l'attend). Rejoint DIFF-10 (soumission des skills à l'Anthropic Skills Marketplace) plutôt qu'un marketplace maison à maintenir. Statut clarifié dans `skills-marketplace/README.md`.
- **GAP-06 — Scaffolding `claude-craft new`** : **décision = hors-scope**. Claude Craft est une **couche de configuration/augmentation** de projets existants (identité produit), pas un générateur d'application. Ne pas diluer le flow `install` avec de la génération d'app ; réévaluer seulement sur demande produit explicite.

### v9.0 (legacy) — Différenciation

Issue de `audit/phases/phase-3-differenciation.md` — à détailler.

### v10.0 — Domination (Q4 2026)

Issue de `audit/phases/phase-4-domination.md` — à détailler.

## Comment voter

1. Aller dans [GitHub Issues](https://github.com/TheBeardedBearSAS/claude-craft/issues?q=is%3Aissue+label%3Aenhancement).
2. Cliquer sur une feature request qui vous intéresse.
3. Réagir avec 👍 sur la description de l'issue (pas dans les commentaires).
4. Optionnel : commenter avec votre use-case précis.

Les issues passent en colonne **Voting** à partir de 10 votes, en **In Progress** à partir de 25 votes ou par décision maintainer.

## Setup initial du GitHub Project (maintainer)

```bash
# Créer le project board via gh CLI
gh project create --owner TheBeardedBearSAS --title "Claude Craft Roadmap"
# Ajouter colonnes via UI : https://github.com/orgs/TheBeardedBearSAS/projects/new
# Activer Discussions :
gh api -X PATCH /repos/TheBeardedBearSAS/claude-craft -f has_discussions=true
```

## Gouvernance

- **Review mensuelle** : premier lundi du mois, revue roadmap dans `#announcements` Discord.
- **Review trimestrielle** : passage de phase (ex: v8.2 → v9.0) conditionné par DoD audit.
- **Veto maintainer** : un maintainer peut déprioriser un item très voté s'il viole les principes (sécurité, KISS, charge de maintenance).

## Historique

| Date | Changement |
|------|------------|
| 2026-06-12 | Audit 2026-06-12 — 80 findings (P0×2, P1×22, P2×34, P3×22). Milestones v9.0 DIFF-01→10 ajoutés. |
| 2026-06-01 | v8.11.0 livrée — Kanban ingestion `.bmad/sprint-status.yaml` lecture seule (🔒), MIT-only strict. |
| 2026-05-06 | Audit adversarial 2026-06-01 — 5 phases livrées (v8.4.0→v8.7.1) : parité i18n, branding TheBeardedBearSAS, mutation testing bloquant. |
| 2026-04-15 | Création de la roadmap publique (P2-18). |
