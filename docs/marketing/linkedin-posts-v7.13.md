# Claude-Craft : La Route vers la v7 (v5.8 → v7.13) — Série LinkedIn

**Série** : 5 posts | **Langue** : Français | **Rythme** : 3-4 jours d'espacement

---

## Calendrier de publication

| # | Post | Date | Heure | Thème |
|---|------|------|-------|-------|
| 1/5 | v5.8 → v5.19 — L'audit qualité | Lundi 24 fév 2026 | 08h30 | Quand l'IA s'audite elle-même |
| 2/5 | v6.0 → v6.2 — Le grand nettoyage | Jeudi 27 fév 2026 | 12h30 | Supprimer du code, c'est une feature |
| 3/5 | v7.0 → v7.3 — L'architecture namespace | Lundi 3 mars 2026 | 08h30 | 160 commandes sans le chaos |
| 4/5 | v7.4 → v7.10 — L'écosystème | Jeudi 6 mars 2026 | 12h30 | Du dev local au déploiement prod |
| 5/5 | v7.11 → v7.13 — La maturité | Lundi 10 mars 2026 | 08h30 | 33 agents, 519 tests, et un site de docs |

---

## Charte visuelle (Prompts Gemini)

Éléments constants :
- **Fond** : dark background (#0a0a1a / #0d1117 / #1a1a2e)
- **Accents** : electric cyan (#00d4ff) + warm orange (#ff6b35)
- **Style** : flat design, minimal, professional, no text overlay
- **Format** : paysage LinkedIn (1200x627px)

---

## Post 1/5 — L'Audit Qualité (v5.8 → v5.19)

### Texte du post

[1/5] La Route vers la v7 — Claude-Craft

Quand l'IA s'audite elle-même : 21 phases de remédiation en une semaine.

Claude-Craft avait un problème. 157 commandes, 40 agents, 10 stacks technos... et une dette technique accumulée sur 20+ releases. Alors on a fait ce qu'on recommande à nos utilisateurs : un audit exhaustif.

Le verdict initial : scripts shell sans set -euo pipefail, code CommonJS dans un monde ESM, i18n dupliqué 5 fois, CLI monolithique de 595 lignes, et des failles de sécurité dans les scripts Ralph.

— 21 phases, 7 jours —

Phase 1-2 : les fondations (CODE_OF_CONDUCT, SECURITY.md, shell hardening sur 20 modules Ralph)
Phase 3-5 : testabilité (vitest, 168 tests, commitlint, Vale linter, i18n parity)
Phase 6-8 : architecture (CLI refactoring 595 → 222 lignes, 10 install scripts consolidés en wrappers + lib partagée, -57% de lignes)
Phase 9-10 : sécurité (injection YAML, validation CLI, DATABASE_URL retiré du allowlist)
Phase 11 : migration ESM (CommonJS → "type": "module" sur 6 modules)
Phase 13 : i18n déduplication (570 fichiers supprimés, base+overlay resolution)
Phase 14-21 : couverture, CI hardening, doc accuracy, ESLint

— Les chiffres —

- Tests : 168 → 387 (+130%)
- Couverture : 81% → 93%
- Fichiers i18n : 2035 → 1584 (-22%)
- Lignes install scripts : -57%
- CLI index.js : 595 → 222 lignes
- Grade audit final : A (~9 points)

La dette technique n'est pas un problème futur. C'est un problème présent que vous payez à chaque commit.

#ClaudeCode #AI #CodeQuality #TechDebt #DevTools #OpenSource

---
Claude-Craft : https://github.com/TheBeardedBearSAS/claude-craft

---

### Prompt Gemini (illustration)

> Create a clean, modern tech illustration for a LinkedIn post about code quality audit. The scene shows a vertical progress bar divided into 21 segments, filling from bottom (red/orange) to top (green/cyan), representing phases of remediation. On the left, tangled messy code lines gradually transform into clean, organized structures on the right. A large "Grade A" badge glows in electric cyan (#00d4ff) at the top right. Small metrics float around: "93%", "387 tests", "-57%". Color palette: dark background (#0a0a1a), cyan (#00d4ff), orange (#ff6b35) for problem areas, green (#00ff88) for resolved areas. Style: flat design, minimal, professional, no text overlay. Aspect ratio 1200x627.

---

## Post 2/5 — Le Grand Nettoyage (v6.0 → v6.2)

### Texte du post

[2/5] La Route vers la v7 — Claude-Craft

Supprimer du code, c'est une feature.

Après 21 phases d'audit qualité, on avait un framework propre. Mais propre ne suffit pas. Il faut être honnête sur ce qui sert vraiment.

La v6.0 est un BREAKING CHANGE volontaire. 3 suppressions :

1. /common:full-audit : remplacé par /team:audit --sequential (Agent Teams fait mieux)
2. /common:ralph-sprint : remplacé par /team:sprint --ralph-mode (unifié avec les Teams)
3. @workflow-orchestrator : les commandes /workflow:* font le même travail sans couche intermédiaire

15 fichiers i18n supprimés, 1 doc entier supprimé, un guide de migration fourni.

— v6.1 : corriger ce qui manque —

3 commandes QA Recette ajoutées (status, regression, report) : 155 → 158 commandes. Et correction des tests flaky qui faisaient échouer la CI de manière aléatoire.

— v6.2 : nettoyer les fantômes —

Le nettoyage en profondeur : 3 commandes alias/redondantes supprimées, les 10 agents BMAD fantômes retirés de la doc (39 → 28 agents réels). /sprint:transition absorbe /project:move-story.

Résultat final : 155 commandes, 28 agents. Moins, mais mieux.

La v5 avait construit. La v6 a simplifié. C'était nécessaire pour ce qui allait suivre : une refonte complète de l'architecture dans la v7.

Le meilleur code est celui qu'on n'a pas à maintenir.

#ClaudeCode #AI #Refactoring #BreakingChanges #DevTools #OpenSource

---
Claude-Craft : https://github.com/TheBeardedBearSAS/claude-craft

---

### Prompt Gemini (illustration)

> Create a modern tech illustration for a LinkedIn post about code cleanup and simplification. The scene shows a large digital trash bin in the center, glowing with warm orange (#ff6b35), receiving falling code blocks and file icons that dissolve into particles. On the right side, a clean, minimal architecture diagram emerges from the chaos — fewer boxes, cleaner connections, all in electric cyan (#00d4ff). A prominent "v6.0 BREAKING" badge floats above. The transformation from complex (left) to simple (right) is the visual narrative. Color palette: dark background (#0d1117), cyan (#00d4ff), orange (#ff6b35). Style: flat design, clean vector, professional, no text overlay. Aspect ratio 1200x627.

---

## Post 3/5 — L'Architecture Namespace (v7.0 → v7.3)

### Texte du post

[3/5] La Route vers la v7 — Claude-Craft

160 commandes. 20 namespaces. Zéro chaos.

La v7.0 est le deuxième BREAKING CHANGE consécutif, et le plus important de l'histoire de claude-craft.

Le problème : /common: contenait 38 commandes. Du workflow, de la QA, du Docker, de l'UI/UX, du sprint... tout au même endroit. Impossible de s'y retrouver.

La solution : un namespace par domaine.

/common: 38 → 12 commandes (le socle)
/workflow: 9 commandes (init, plan, design, implement...)
/team: 4 commandes (audit, sprint, security, delivery)
/qa: 6 commandes (recette, fix, tdd, status...)
/uiux: 7 commandes (audit, a11y, component-spec...)
/sprint: 5 commandes (next-story, transition, dev...)
/gate: 6 commandes (validate-prd, validate-story...)
/docker: 5 commandes (compose, architecture, debug...)

41 fichiers i18n réorganisés. Guide de migration avec les 41 correspondances ancien → nouveau.

— v7.1-7.3 : consolider —

v7.1 : tech-registry.js comme Single Source of Truth (10 technos, 1 seul endroit). Couverture 81% → 93%.
v7.2 : DRY consolidation — constants.js dérivé du registre, detect-project étendu à 10 technos (Angular, Vue.js, C#, Laravel, PHP).
v7.3 : shell-ui.sh — une lib partagée pour tous les scripts. Zéro couleur dupliquée. CLI `check` command pour vérifier l'installation.

— Les chiffres v7.3 —

155 commandes, 28 agents, 480 tests. Et surtout : chaque commande est exactement où vous l'attendez.

L'organisation n'est pas du luxe. C'est ce qui fait la différence entre un outil que vous adoptez et un outil que vous abandonnez.

#ClaudeCode #AI #Architecture #DeveloperExperience #DevTools #OpenSource

---
Claude-Craft : https://github.com/TheBeardedBearSAS/claude-craft

---

### Prompt Gemini (illustration)

> Create a striking tech illustration for a LinkedIn post about namespace architecture. The scene shows a central hub connected to 8 satellite clusters arranged in a circle, each cluster representing a namespace domain: workflow (gear icon), team (people icon), QA (checkmark icon), UI/UX (palette icon), sprint (kanban icon), gate (shield icon), docker (container icon), common (star icon). Each cluster has a distinct subtle color tint but all connected by electric cyan (#00d4ff) pathways to the center. The old architecture (a single tangled cluster) fades in the background. Color palette: dark background (#0a0a1a), cyan (#00d4ff) connections, orange (#ff6b35) for namespace labels. Style: isometric, clean vector, professional, no text overlay. Aspect ratio 1200x627.

---

## Post 4/5 — L'Écosystème (v7.4 → v7.10)

### Texte du post

[4/5] La Route vers la v7 — Claude-Craft

Du CLI local au déploiement prod. Claude-Craft est devenu un écosystème.

7 releases, 7 briques complémentaires.

— CLI intelligent (v7.4-7.6) —

`npx @the-bearded-bear/claude-craft list` : voir ce qui est installé
`npx @the-bearded-bear/claude-craft doctor` : diagnostic complet
`npx @the-bearded-bear/claude-craft update` : rafraîchir sans réinstaller

20 namespaces documentés, couverture doctor à 96%, seuils vitest remontés à 90/90/90/90.

— L'arsenal .claude (v7.7) —

247 fichiers .claude/ livrés en un `npm install` : agents, checklists, commands, rules, skills, templates. Votre projet est configuré en une commande.

— Coolify (v7.8) —

4 agents (@coolify-architect, @coolify-deployment, @coolify-debug, @coolify-monitoring), 5 commandes, install script complet. i18n 5 langues. 160 commandes, 33 agents.

— Multi-account v2 (v7.9) —

Gérez plusieurs comptes Claude Code : `doctor` diagnostique votre configuration, `.claude-profile` pour le switch automatique par projet, complétions bash/zsh. 23 bats tests.

— Status Line v2.0 (v7.10) —

13 toggles, burn rate en temps réel, progress bar (percentage/bar/both), vim mode, agent name, git cache 5s. Un seul appel jq au lieu de 7. Compatible locales non-anglophones (fix du bug LC_NUMERIC pour les francophones).

— Les chiffres v7.10 —

160 commandes, 33 agents, 519 tests, 20 namespaces, 10 stacks technos.

Chaque brique résout un vrai problème. Pas de gold plating, pas de speculative generality. Juste ce dont vous avez besoin.

#ClaudeCode #AI #DevOps #Coolify #CLI #DevTools #OpenSource

---
Claude-Craft : https://github.com/TheBeardedBearSAS/claude-craft

---

### Prompt Gemini (illustration)

> Create a modern tech illustration for a LinkedIn post about a growing developer ecosystem. The scene shows a layered stack building upward like a city skyline: at the base, a CLI terminal window; above it, a Docker container layer; then a cloud/Coolify deployment layer; and at the top, a monitoring dashboard with status bars and metrics. Each layer is connected by glowing electric cyan (#00d4ff) vertical beams. Small icons float around: a wrench (doctor), a list (inventory), a rocket (deploy), a user badge (multi-account). Warm orange (#ff6b35) accents highlight the newest additions. Color palette: dark background (#1a1a2e), cyan (#00d4ff), orange (#ff6b35). Style: isometric, clean vector, professional, no text overlay. Aspect ratio 1200x627.

---

## Post 5/5 — La Maturité (v7.11 → v7.13)

### Texte du post

[5/5] La Route vers la v7 — Claude-Craft

33 agents, 519 tests, 160 commandes, 36 skills. Et un site de documentation complet.

Les 3 dernières releases racontent l'histoire d'un framework qui atteint sa maturité.

— Agent Teams optimisé (v7.11) —

Le token overhead des équipes d'agents est passé de ~30% à ~15-20%. Comment ?

- Lean context loading : chaque worker reçoit uniquement les tokens de son type de tâche (audit=4K, sprint=5K, security=3.5K)
- Overhead adaptatif : 5% + 3.5% par worker (au lieu d'un flat 15%)
- Fast Mode blocking guard : un dashboard 6x compare le coût avant de lancer en mode rapide
- Budget guard --max-cost : abort automatique si le coût estimé dépasse le seuil

Le reviewer de la Phase 1 Delivery tourne sur Haiku au lieu de Sonnet : -15% sur le coût.

138 bats tests couvrent les 5 modules Agent Teams.

— Site de documentation (v7.12) —

VitePress génère le site. 119 tests Playwright E2E couvrent les 89 pages en 5 locales. Axe-core valide l'accessibilité WCAG 2.1 AA. Layout mobile responsive. Landmarks, aria-labels, SVGs décoratifs corrigés.

La CI bloque le déploiement si un test E2E échoue.

— Sonnet 4.6 et compatibilité (v7.13) —

Claude Sonnet 4.6 : les performances coding d'Opus à $3/$15M (au lieu de $5/$25M). Le cost-estimator a été corrigé pour refléter les vrais prix Opus 4.6 et Haiku 4.5.

Compatibilité Claude Code 2.1.42-2.1.45 : auth token refresh, plugin hot-reload, Agent SDK rate limiting.

— Bilan de la série —

De la v5.8 à la v7.13, claude-craft est passé de la dette technique à la maturité :

v5.8 : audit, 168 tests, Grade C
v6.0 : nettoyage, 155 commandes, 28 agents
v7.0 : namespace split, 20 domaines
v7.10 : écosystème complet, 519 tests, 33 agents
v7.13 : documentation, optimisation, Sonnet 4.6

25 releases. Un framework qui s'auto-améliore.

#ClaudeCode #AI #AgentTeams #VitePress #DevTools #OpenSource

---
Claude-Craft : https://github.com/TheBeardedBearSAS/claude-craft

---

### Prompt Gemini (illustration)

> Create a culminating tech illustration for a LinkedIn post about framework maturity. The scene shows a mountain summit view with a flag planted at the peak, the flag bearing a subtle version badge concept. The path up the mountain shows milestone markers at different heights, each glowing with different intensities — the bottom ones dim orange (#ff6b35), the top ones bright cyan (#00d4ff). At the summit, a constellation of 33 connected nodes (representing agents) orbits the flag. Below the mountain, a solid foundation shows testing bars (519 blocks) and documentation pages. The sky has aurora-like waves in cyan and green. Color palette: dark background (#0a0a1a), cyan (#00d4ff), orange (#ff6b35), green (#00ff88). Style: flat design, epic but clean, professional, no text overlay. Aspect ratio 1200x627.

---

## Vérification

### Compteur de caractères

| Post | Caractères | Limite LinkedIn |
|------|------------|-----------------|
| 1/5 | ~1550 | < 3000 |
| 2/5 | ~1450 | < 3000 |
| 3/5 | ~1650 | < 3000 |
| 4/5 | ~1620 | < 3000 |
| 5/5 | ~1900 | < 3000 |

### Correspondance features/CHANGELOG

| Feature citée | Version | Confirmé |
|---------------|---------|----------|
| Shell hardening 20 modules Ralph | v5.9.2 | oui |
| CLI refactoring 595 → 222 lignes | v5.12.0 | oui |
| ESM migration | v5.10.0 | oui |
| i18n dédup 570 fichiers supprimés | v5.11.0 | oui |
| Install scripts -57% | v5.9.7 | oui |
| Tests 168 → 387 | v5.9.3 → v5.19 | oui |
| Couverture 81% → 93% | v7.1.0 | oui |
| Grade A ~9pts | v5.19 | oui |
| SEC-6 YAML injection fix | v5.9.8 | oui |
| v6.0 BREAKING 3 suppressions | v6.0.0 | oui |
| v6.1 QA Recette 155→158 | v6.1.1 | oui |
| v6.2 phantom BMAD 39→28 | v6.2.0 | oui |
| v7.0 namespace split /common: 38→12 | v7.0.0 | oui |
| tech-registry SSOT | v7.1.0 | oui |
| shell-ui.sh zéro duplicate | v7.3.0 | oui |
| CLI list/doctor/update | v7.4.0 | oui |
| 247 fichiers .claude/ | v7.7.0 | oui |
| Coolify 4 agents + 5 commandes | v7.8.0 | oui |
| Multi-account doctor | v7.9.0 | oui |
| Status Line 13 toggles, 1 jq | v7.10.0 | oui |
| LC_NUMERIC fix | v7.10.1 | oui |
| Agent Teams overhead 30% → 15-20% | v7.11.0 | oui |
| Lean context loading | v7.11.0 | oui |
| --max-cost budget guard | v7.11.0 | oui |
| Fast Mode blocking guard | v7.11.0 | oui |
| 138 bats tests Agent Teams | v7.11.0 | oui |
| VitePress 119 Playwright E2E tests | v7.12.0 | oui |
| Axe-core WCAG 2.1 AA | v7.12.0 | oui |
| Sonnet 4.6 $3/$15 | v7.13.0 | oui |
| Cost-estimator pricing fix | v7.13.0 | oui |
| CC 2.1.42-2.1.45 compat | v7.13.0 | oui |
| 519 vitest tests | v7.5.0+ | oui |
| 160 commandes, 33 agents | v7.8.0 | oui |

---

## Notes de stratégie

### Engagement

- **Espacer de 3-4 jours** pour maximiser la visibilité LinkedIn
- **Répondre à chaque commentaire** dans l'heure qui suit la publication
- **Liker les reposts** et remercier les partages
- **Post 1 = l'accroche** : les chiffres d'audit sont impactants et relatables
- **Post 5 = la clôture** : le récapitulatif donne une vue d'ensemble impressionnante
- **Cross-poster** un thread récapitulatif sur X après le post 5/5

### Réponses FAQ anticipées

| Question probable | Réponse suggérée |
|-------------------|------------------|
| "C'est gratuit ?" | "Oui, claude-craft est 100% open source sous licence MIT. Le seul coût est l'abonnement Claude Code (API Anthropic)." |
| "Ça marche avec GPT/Copilot ?" | "Non, claude-craft est conçu spécifiquement pour Claude Code d'Anthropic. Il exploite les hooks, agents et MCP propres à Claude." |
| "Quelles technos ?" | "10 stacks : .NET/C#, Symfony, Flutter, React, React Native, Angular, Vue.js, Laravel, Python, PHP. Plus Docker et Coolify." |
| "L'audit, c'était automatisé ?" | "L'audit initial était manuel. La remédiation était guidée par Claude Code lui-même. C'est ce qu'on appelle 'le framework qui s'améliore avec ses propres outils'." |
| "Sonnet 4.6 vs Opus ?" | "Sonnet 4.6 offre des performances coding proches d'Opus à $3/$15M vs $5/$25M. Idéal pour les workers dans Agent Teams. Les leaders restent sur Opus." |
| "Le site de docs ?" | "https://thebeardedbearsas.github.io/claude-craft/ — généré par VitePress, 119 tests E2E, accessible WCAG 2.1 AA." |
| "Comment commencer ?" | "`npx @the-bearded-bear/claude-craft install . --tech=react --lang=fr` et c'est parti." |
| "Ça remplace un dev ?" | "Non. Ça automatise les tâches répétitives et permet au dev de se concentrer sur les décisions d'architecture et la logique métier." |

### Hashtags récurrents

Primaires (tous les posts) : `#ClaudeCode` `#DevTools` `#AI` `#OpenSource`
Secondaires (alternés) : `#CodeQuality` `#TechDebt` `#Refactoring` `#Architecture` `#DevOps` `#AgentTeams` `#VitePress`

### Stratégie narrative

La série raconte une histoire en 5 actes :

1. **L'introspection** : on audite, on mesure, on corrige (relatable pour tout tech lead)
2. **Le courage** : on ose supprimer, même si ça casse la compatibilité
3. **L'organisation** : on structure pour scaler
4. **L'expansion** : on ajoute ce qui manquait (infra, multi-account, monitoring)
5. **La maturité** : on optimise, on documente, on prépare l'avenir

Chaque post peut se lire indépendamment, mais ensemble ils racontent l'évolution d'un outil open source sur 25 releases.
