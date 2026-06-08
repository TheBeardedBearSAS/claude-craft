# Claude Craft — Roadmap publique

> Roadmap vivante. Chaque item correspond à une issue GitHub avec vote via 👍 reactions.
>
> **GitHub Project** : https://github.com/users/Flavien-Metivier/projects (lien à publier à l'activation du board).

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

> **État actuel (2026-05) : v8.7.1 livrée.** Les Phases 1→5 de l'audit 2026-05-18 ont été livrées dans les versions v8.4.0 → v8.7.1 (références paperclip/RN/Vue Vapor, CI durcie CodeQL+Trivy, mutation testing bloquant, `install --auto`/`--from`, marketplace skills, rollback auto, 937 tests). Voir le [CHANGELOG](../CHANGELOG.md). Les milestones ci-dessous reflètent le board de vote communautaire restant.

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

> Source détaillée et sévérités : `docs/audit/2026-06-08-comprehensive/02-domaines.md` (Domaine: Concurrentiel).

### v9.0 (legacy) — Différenciation

Issue de `audit/phases/phase-3-differenciation.md` — à détailler.

### v10.0 — Domination (Q4 2026)

Issue de `audit/phases/phase-4-domination.md` — à détailler.

## Comment voter

1. Aller dans [GitHub Issues](https://github.com/Flavien-Metivier/claude-craft/issues?q=is%3Aissue+label%3Aenhancement).
2. Cliquer sur une feature request qui vous intéresse.
3. Réagir avec 👍 sur la description de l'issue (pas dans les commentaires).
4. Optionnel : commenter avec votre use-case précis.

Les issues passent en colonne **Voting** à partir de 10 votes, en **In Progress** à partir de 25 votes ou par décision maintainer.

## Setup initial du GitHub Project (maintainer)

```bash
# Créer le project board via gh CLI
gh project create --owner Flavien-Metivier --title "Claude Craft Roadmap"
# Ajouter colonnes via UI : https://github.com/users/Flavien-Metivier/projects/new
# Activer Discussions :
gh api -X PATCH /repos/Flavien-Metivier/claude-craft -f has_discussions=true
```

## Gouvernance

- **Review mensuelle** : premier lundi du mois, revue roadmap dans `#announcements` Discord.
- **Review trimestrielle** : passage de phase (ex: v8.2 → v9.0) conditionné par DoD audit.
- **Veto maintainer** : un maintainer peut déprioriser un item très voté s'il viole les principes (sécurité, KISS, charge de maintenance).

## Historique

| Date | Changement |
|------|------------|
| 2026-04-15 | Création de la roadmap publique (P2-18). |
