# Phase 1 — Survie (0-1 mois, ~79h)

> **Source** : `audit/00-SYNTHESIS.md` §"0-1 Mois : Survie (Quick Wins Critiques)"
> **Objectif** : Résoudre les bloqueurs P0 qui empêchent adoption immédiate (DPO enterprise, RSSI, ergonomie, accessibilité EAA 2025).
> **Owner-types requis** : Dev senior, Legal, Community Manager, QA.
> **Rapports sources** : 01 (Sécurité), 02 (Ergonomie), 11 (Accessibilité), 13 (Légal), 10 (Communauté), 12 (Dette).

## Pourquoi cette phase

Sans ces 10 actions en 30 jours :
- **RSSI bloquent** l'adoption (pipe curl RTK non signé).
- **DPO bloquent** l'adoption (pas de PRIVACY.md, pas de CLA, ToS Anthropic non validé).
- **60-70% des primo-utilisateurs abandonnent** avant TTFV (Time To First Value).
- **EAA 2025 (juin) non conforme** → obligation légale EU violée.
- **Burnout imminent** du mainteneur unique (rythme 1.89 release/jour).

## Prérequis

- [ ] Accès admin repo GitHub (secrets, settings, branch protection).
- [ ] Accès NPM `@the-bearded-bear/claude-craft` (2FA).
- [ ] Email de contact legal Anthropic disponible (trademark@anthropic.com ou via support).
- [ ] Compte Discord / Slack prêt à être créé.
- [ ] Budget traduction disponible si action 5 nécessite (non bloquant pour phase 1).

## Actions (10)

| ID | Action | Effort | Impact | Rapport | Agent principal |
|----|--------|--------|--------|---------|-----------------|
| P1-01 | Remplacer pipe `curl \| sh` RTK par checksum SHA256 + Sigstore | 4h | Débloque RSSI | 01 SEC-001 | `@security-auditor` |
| P1-02 | CLA/DCO intégré (`.github/CLA.md` + bot) | 8h | Débloque DPO contributions | 13 LEG-003/004 | `@research-assistant` |
| P1-03 | `PRIVACY.md` avec GDPR compliance (Ralph logs chiffrés, durée conservation) | 12h | Débloque DPO données | 13 LEG-018/019 | `@research-assistant` |
| P1-04 | Valider usage "Claude" via ToS Anthropic (email legal) | 4h | Trademark risque éliminé | 13 LEG-011 | `@research-assistant` |
| P1-05 | Wizard `/getting-started` interactif TTFV < 10min | 24h | Abandon 60% → 30% | 02 E01/E06 | `@ui-designer` + `@ux-ergonome` |
| P1-06 | Symboles CLI ✓/✗/⚠ (couleur + texte, daltoniens) | 2h | Débloque a11y daltoniens | 11 A11Y-001 | `@accessibility-expert` |
| P1-07 | Menu clavier Kanban déplacement cartes (WCAG 2.1.1) | 16h | Débloque a11y clavier-only | 11 A11Y-002 | `@accessibility-expert` |
| P1-08 | Ralentir cadence releases à 1/semaine max | 0h discipline | Burnout évité | 12 M-02 | humain (mainteneur) |
| P1-09 | Ouvrir Discord + 10 "good first issues" | 8h | Communauté amorcée | 10 COMM-002/011 | `@research-assistant` |
| P1-10 | Disclaimer warranty visible dans README | 1h | Legal clarity | 13 LEG-033 | `@research-assistant` |

**Total** : ~79h.

## Batches parallèles

### Batch A — Sécurité & Légal (parallèle, 3 agents)

Indépendants, zéro conflit de fichiers :

```
Agent({
  subagent_type: "security-auditor",
  description: "SEC-001 pipe curl RTK",
  prompt: `
Contexte : Claude Craft installe le binaire RTK via 'curl ... | sh' (non sécurisé, SEC-001 rapport 01).
Fichiers concernés : Tools/install-rtk.sh (ou équivalent), Makefile, docs/PREREQUISITES.md.
Tâche :
  1. Identifier exactement où le pipe curl|sh est exécuté.
  2. Remplacer par téléchargement + vérification SHA256 (checksum pinné dans le script).
  3. Optionnel : intégrer Sigstore cosign si RTK publie des signatures.
  4. Ajouter test shellcheck + test E2E dockerisé qui vérifie que le binaire attendu est bien installé.
  5. Mettre à jour docs/PREREQUISITES.md avec la nouvelle méthode.
DoD : shellcheck passe, SHA256 vérifié en CI, aucun 'curl | sh' ne subsiste (grep -r).
Sortie : PR prête à merger avec diff complet.
`
})

Agent({
  subagent_type: "research-assistant",
  description: "LEG CLA+PRIVACY+ToS+README",
  prompt: `
Contexte : 4 bloqueurs légaux P0 (rapport 13). Drafter les documents, pas exécuter.
Actions à produire :
  1. .github/CLA.md — Contributor License Agreement basé sur modèle Apache ICLA, compatible MIT (LEG-003).
  2. PRIVACY.md racine — GDPR compliance : données collectées (Ralph logs, telemetry si opt-in), base légale, durée conservation (90j logs), droits (accès, rectif, effac, portab), DPO contact (LEG-018/019).
  3. Draft email à Anthropic legal/trademark pour valider usage du mot "Claude" (LEG-011) — ton courtois, liste les usages (nom de package, docs, README).
  4. Patch README.md : bloc 'Warranty Disclaimer' visible en haut, standard MIT AS-IS (LEG-033).
  5. Configurer bot CLA-assistant (lien vers CLA.md) dans .github/workflows/cla.yml.
Références à chercher :
  - EasyCLA, CLA-assistant-lite : WebSearch "github CLA assistant 2026"
  - GDPR Art. 13/14 : WebSearch "GDPR privacy policy developer tool template 2026"
  - Sigstore trademark guidelines comme exemple ToS : WebSearch "third party trademark policy open source 2026"
DoD : 4 fichiers créés, bot CLA actif, email pré-rédigé prêt à envoyer.
`
})

Agent({
  subagent_type: "research-assistant",
  description: "COMM Discord + good first issues",
  prompt: `
Contexte : Communauté inexistante (rapport 10 COMM-002/011). Bus factor 1.
Actions :
  1. Rédiger un guide CONTRIBUTING.md (si absent) avec onboarding contributeur 15 min.
  2. Créer 10 templates de 'good first issue' dans .github/ISSUE_TEMPLATE/ couvrant :
     - 3 doc fixes (typos i18n ES/DE/PT, ADR manquants)
     - 3 tests unitaires manquants (ciblant C-05 rapport 05)
     - 2 refactors mineurs (install scripts dupliqués ARCH-003)
     - 2 traductions ES/DE/PT partielles
  3. Draft README Discord : règles, salons (#help, #showcase, #contrib, #releases), code de conduite basé sur Contributor Covenant 2.1.
  4. Lister dans docs/COMMUNITY.md les canaux : Discord (placeholder URL), GitHub Discussions, Twitter/X @claudecraft.
DoD : CONTRIBUTING.md, 10 issues drafts committables, DISCORD.md rules, COMMUNITY.md channels.
`
})
```

### Batch B — Ergonomie (séquentiel, 1 feature complexe)

Nécessite un seul agent avec contexte complet car c'est un feature transverse.

```
Agent({
  subagent_type: "general-purpose",
  description: "Wizard /getting-started TTFV <10min",
  prompt: `
Contexte : TTFV réel 45-90 min vs 10 min annoncé (rapport 02 E01/E06). 214 commandes = paralysie.
Objectif : créer un slash command '/getting-started' qui guide un nouvel utilisateur en < 10 min.
Scope livrable :
  1. Créer .claude/commands/common/getting-started.md avec wizard interactif :
     - Étape 1 : détecter stack projet (package.json, composer.json, pyproject.toml, pubspec.yaml)
     - Étape 2 : proposer 3 actions contextualisées (ex. Symfony → /symfony:check-architecture)
     - Étape 3 : exécuter avec commentaires pédagogiques
     - Étape 4 : montrer résultat + prochaine étape suggérée
  2. Ajouter chapitre 'First 10 Minutes' en haut de docs/QUICKSTART.md.
  3. Ajouter métrique TTFV trackée via telemetry opt-in (préparer hook, pas activer).
  4. Référence commande dans README § Quick Start.
Contraintes :
  - Respecter .claude/rules/12-context-management.md (CLAUDE.md <200L).
  - i18n : EN + FR minimum pour cette phase 1 (ES/DE/PT en phase 2).
  - Accessible : symboles ✓/✗ en plus des couleurs (aligné avec A11Y-001).
DoD :
  - /getting-started existe et fonctionne sur 3 stacks (Symfony, React, Python) testé manuellement.
  - Chapitre QUICKSTART.md à jour.
  - Screen recording / GIF preuve du TTFV < 10 min (optionnel mais souhaité).
Références à consulter :
  - audit/02-ergonomics-dx.md rapport complet
  - .claude/commands/common/init.md (pattern existant)
`
})
```

### Batch C — Accessibilité (parallèle, 1 agent)

```
Agent({
  subagent_type: "accessibility-expert",
  description: "A11Y-001 CLI symbols + A11Y-002 Kanban clavier",
  prompt: `
Contexte : EAA 2025 (juin) obligatoire EU. Rapport 11 A11Y-001, A11Y-002.
Actions :
  1. CLI symbols (2h) :
     - Identifier tous les outputs colorés dans scripts Tools/, CLI Node, etc.
     - Remplacer les codes couleur-only par couleur + symbole texte : ✓ success, ✗ error, ⚠ warning, ℹ info.
     - Respecter NO_COLOR env var.
     - Tester avec simulateur daltonien (chrome devtools).
  2. Kanban clavier (16h) :
     - Localiser composant Kanban (probablement .claude/commands/gate/ ou dashboard/).
     - Ajouter menu contextuel clavier (Alt+M) : "Déplacer → À faire / En cours / Review / Done".
     - Tabindex cohérent, roving tabindex sur les cartes.
     - aria-live pour annoncer les déplacements.
     - Tests : vérifier avec axe-core ou pa11y que WCAG 2.1.1, 2.4.3, 4.1.3 passent.
DoD :
  - Tous les CLI outputs affichent symboles texte (grep confirm).
  - Kanban navigable 100% au clavier, testé manuellement + axe-core rapport 0 erreur AA.
  - .claude/rules/a11y.md mis à jour si existe, sinon créer docs/ACCESSIBILITY.md.
Recherche préalable :
  - WebSearch "WCAG 2.2 AA kanban drag drop keyboard 2026"
  - WebSearch "NO_COLOR standard CLI accessibility"
`
})
```

### Batch D — Discipline (humain, 0h)

Action P1-08 : décision managériale — **mainteneur limite releases à 1/semaine**. Communiquer dans Discord + CHANGELOG. Aucun agent.

## Équipe d'agents recommandée

| Rôle | Agent | Scope précis |
|------|-------|--------------|
| Sécurité supply chain | `@security-auditor` | P1-01 (RTK) |
| Legal drafts | `@research-assistant` | P1-02, P1-03, P1-04, P1-10, P1-09 |
| Ergonomie wizard | `@ui-designer` + `@ux-ergonome` | P1-05 |
| Accessibilité | `@accessibility-expert` | P1-06, P1-07 |
| DevOps validation (CI) | `@devops-engineer` | Validation P1-01 (CI signature), P1-02 (CLA bot workflow) |
| Tech lead coordination | `@tech-lead` | Arbitrage + review PRs |

## Recherches web / MCP pré-rédigées

À exécuter en tout début de phase :

```javascript
WebSearch({ query: "Anthropic trademark policy third-party Claude 2026" })
WebSearch({ query: "GitHub CLA assistant bot 2026 MIT compatible" })
WebSearch({ query: "GDPR Article 13 privacy policy SaaS template 2026" })
WebSearch({ query: "Sigstore cosign shell install script verification 2026" })
WebSearch({ query: "WCAG 2.2 AA kanban drag drop keyboard navigation pattern" })
WebSearch({ query: "European Accessibility Act 2025 software developer tools compliance" })
ToolSearch({ query: "select:mcp__context7__resolve-library-id", max_results: 1 })
// puis : mcp__context7__query-docs pour 'sigstore/cosign' (vérif install patterns)
```

## DoD & Validation

### Par action

- **P1-01** : `grep -r "curl.*|.*sh" Tools/ docs/` renvoie 0, CI publie SHA256 check.
- **P1-02** : `.github/CLA.md` existe, bot CLA-assistant actif (PR test triggered).
- **P1-03** : `PRIVACY.md` à la racine, lié dans README, couvre les 6 droits GDPR.
- **P1-04** : email envoyé à Anthropic, preuve d'envoi dans `audit/legal/anthropic-tos-request.eml`.
- **P1-05** : `/getting-started` répond sur 3 stacks, QUICKSTART.md §"First 10 minutes" ajouté.
- **P1-06** : aucun output CLI ne dépend de la couleur seule (NO_COLOR=1 test passe).
- **P1-07** : axe-core rapport Kanban = 0 violation AA, test clavier manuel OK.
- **P1-08** : release cadence documentée dans CONTRIBUTING.md, dernière release >7j.
- **P1-09** : Discord ouvert (URL publique), 10 issues `good-first-issue` labellées.
- **P1-10** : README contient bloc Warranty disclaimer visible sans scroll initial.

### Validation globale

```bash
# Lancer la suite complète
cd claude-craft
npm test
make lint
/team:security --scope=phase-1
/team:audit --focus=security,legal,accessibility

# Vérifier checklist
test -f PRIVACY.md && echo "OK PRIVACY"
test -f .github/CLA.md && echo "OK CLA"
test -f .claude/commands/common/getting-started.md && echo "OK wizard"
grep -q "Warranty" README.md && echo "OK disclaimer"
```

## Risques & rollback

| Risque | Probabilité | Mitigation |
|--------|-------------|------------|
| Anthropic refuse usage "Claude" | Faible | Plan B : rebrand partiel "AI Craft" + attribution explicite |
| CLA bloque contributeurs existants | Moyenne | Grandfather clause pour contributeurs historiques |
| Wizard /getting-started pas clair | Moyenne | Itérer avec 5 testeurs externes avant release |
| Kanban keyboard refactor casse feature existante | Moyenne | Feature flag + tests de régression avant merge |

## Prochaine phase

**Conditions de passage vers phase 2** :
- [ ] ≥8/10 actions avec DoD satisfait (80%)
- [ ] Aucun blocker P0 restant (sécurité, légal, a11y)
- [ ] Discord ≥10 membres
- [ ] 1 contributeur externe a soumis une PR via CLA (preuve que l'amorçage communautaire fonctionne)

→ [phase-2-stabilisation.md](phase-2-stabilisation.md)
