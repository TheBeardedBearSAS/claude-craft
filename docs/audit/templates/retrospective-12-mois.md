# Rétrospective Annuelle — Claude Craft

**Période** : [Date début] - [Date fin]
**Version auditée** : [Version actuelle]
**Participants** : [Maintainers, contributeurs, community champions]

---

## Métriques vs Cibles

### North Star Metrics

| Métrique | Cible Année 1 | Réalisé | Écart | Statut |
|----------|---------------|---------|-------|--------|
| **ARR** | €50K | €[X] | +/- [%] | 🟢/🟡/🔴 |
| **WAU (Weekly Active Users)** | 1000 | [X] | +/- [%] | 🟢/🟡/🔴 |
| **Stars GitHub** | 2000 | [X] | +/- [%] | 🟢/🟡/🔴 |
| **Discord membres** | 500 | [X] | +/- [%] | 🟢/🟡/🔴 |
| **Contributeurs actifs** | 20 | [X] | +/- [%] | 🟢/🟡/🔴 |
| **Bus factor** | ≥ 3 | [X] | +/- [X] | 🟢/🟡/🔴 |
| **Stacks Tier 1** | 4 | [X] | +/- [X] | 🟢/🟡/🔴 |
| **MCP servers publiés** | 4 | [X] | +/- [X] | 🟢/🟡/🔴 |

### Métriques Qualité

| Métrique | Cible | Réalisé | Écart | Statut |
|----------|-------|---------|-------|--------|
| **Test Coverage** | ≥ 80% | [X]% | +/- [%] | 🟢/🟡/🔴 |
| **SonarQube Score** | A | [Grade] | - | 🟢/🟡/🔴 |
| **CVE critiques** | 0 | [X] | +/- [X] | 🟢/🟡/🔴 |
| **Docs freshness** | ≥ 95% | [X]% | +/- [%] | 🟢/🟡/🔴 |
| **i18n drift** | < 5% | [X]% | +/- [%] | 🟢/🟡/🔴 |
| **CLAUDE.md size** | < 200 lignes | [X] lignes | +/- [X] | 🟢/🟡/🔴 |
| **Rules auto-chargées** | < 5K tokens | [X] tokens | +/- [X] | 🟢/🟡/🔴 |

### Métriques Performance

| Métrique | Cible | Réalisé | Écart | Statut |
|----------|-------|---------|-------|--------|
| **CLI startup time** | < 500ms | [X]ms | +/- [%] | 🟢/🟡/🔴 |
| **Commande moyenne** | < 2s | [X]s | +/- [%] | 🟢/🟡/🔴 |
| **RTK token savings** | 60-90% | [X]% | +/- [%] | 🟢/🟡/🔴 |
| **Context overhead** | < 15% | [X]% | +/- [%] | 🟢/🟡/🔴 |

---

## ROI par Investissement

### Phase 1 — Stabilisation & Fondations

| Action | Effort prévu | Effort réel | ROI | Impact |
|--------|--------------|-------------|-----|--------|
| Corriger tests CI | 16h | [X]h | [Qualitatif] | 🟢/🟡/🔴 |
| Épingler actions GitHub | 8h | [X]h | Sécurité +[X]% | 🟢/🟡/🔴 |
| Convertir rules → skills | 40h | [X]h | Tokens -[X]% | 🟢/🟡/🔴 |
| Bus factor → 3 | 80h | [X]h | Champions +[X] | 🟢/🟡/🔴 |

### Phase 2 — Qualité & Performance

| Action | Effort prévu | Effort réel | ROI | Impact |
|--------|--------------|-------------|-----|--------|
| Test coverage ≥80% | 120h | [X]h | Bugs -[X]% | 🟢/🟡/🔴 |
| Auto-complétion shell | 40h | [X]h | DX +[X]% | 🟢/🟡/🔴 |
| Benchmark RTK | 32h | [X]h | Insights +[X] | 🟢/🟡/🔴 |

### Phase 3 — DX & Ergonomie

| Action | Effort prévu | Effort réel | ROI | Impact |
|--------|--------------|-------------|-----|--------|
| LSP guides interactifs | 80h | [X]h | Onboarding -[X]% time | 🟢/🟡/🔴 |
| Skills Hub (10 skills) | 60h | [X]h | Distribution +[X] users | 🟢/🟡/🔴 |
| Réduire à 4 stacks Tier 1 | 40h | [X]h | Focus +[X]% | 🟢/🟡/🔴 |

### Phase 4 — Différenciation & Écosystème

| Action | Effort prévu | Effort réel | ROI | Impact |
|--------|--------------|-------------|-----|--------|
| Marketplace skills | 160h | [X]h | Revenue €[X] | 🟢/🟡/🔴 |
| Multi-IDE (Cursor, Windsurf) | 120h | [X]h | Marché +[X]% | 🟢/🟡/🔴 |
| Plugins Code Intelligence | 80h | [X]h | Précision +[X]% | 🟢/🟡/🔴 |

### Phase 5 — Innovation & Croissance

| Action | Effort prévu | Effort réel | ROI | Impact |
|--------|--------------|-------------|-----|--------|
| MCP servers (4) | 100h | [X]h | WAU +[X]% | 🟢/🟡/🔴 |
| QA Recette standalone | 120h | [X]h | ARR €[X] | 🟢/🟡/🔴 |
| Autonomous Sprint v0.1 | 80h | [X]h | Différenciateur | 🟢/🟡/🔴 |
| Open-core pivot | 60h | [X]h | Enterprise leads +[X] | 🟢/🟡/🔴 |

---

## Top 10 Leçons Apprises

### What Worked

1. **[Leçon #1]** : [Description de ce qui a bien fonctionné]
   - **Impact** : [Quantitatif ou qualitatif]
   - **Reproductibilité** : [Comment répliquer]

2. **[Leçon #2]** : [...]

3. **[Leçon #3]** : [...]

### What Didn't Work

1. **[Échec #1]** : [Description de ce qui a échoué]
   - **Cause racine** : [Analyse]
   - **Leçon** : [Ce qu'on ferait différemment]

2. **[Échec #2]** : [...]

3. **[Échec #3]** : [...]

### Surprises (Positives & Négatives)

1. **[Surprise #1]** : [Non anticipé mais impactant]
2. **[Surprise #2]** : [...]

---

## Rétrospective Format 4L

### Liked (Ce qui a plu)

- [Item 1]
- [Item 2]
- [Item 3]

### Learned (Ce qu'on a appris)

- [Apprentissage 1]
- [Apprentissage 2]
- [Apprentissage 3]

### Lacked (Ce qui a manqué)

- [Manque 1]
- [Manque 2]
- [Manque 3]

### Longed For (Ce qu'on aimerait avoir)

- [Désir 1]
- [Désir 2]
- [Désir 3]

---

## What Worked / What Didn't / What to Change

### What Worked ✅

| Catégorie | Détail | Métrique Impact |
|-----------|--------|-----------------|
| **Méthodologie** | BMAD v6 (Plan → Design → Implement) | Qualité code +[X]% |
| **Tooling** | RTK token optimization | Tokens -[X]% |
| **Community** | Champions program | Contributeurs +[X] |
| **Documentation** | Rules modulaires | Maintenabilité +[X]% |

### What Didn't Work ❌

| Catégorie | Détail | Cause | Solution proposée |
|-----------|--------|-------|-------------------|
| **Scope** | 19 stacks trop large | Bus factor 1 | Réduire à 4 Tier 1 |
| **i18n** | 5 langues insoutenable | Maintenance manuelle | Geler 3 langues, garder EN+FR |
| **Tests** | Coverage insuffisante | Priorisation features | TDD strict Phase 2 |
| **Lock-in** | Claude Code uniquement | Architecture initiale | Multi-IDE Phase 4 |

### What to Change 🔄

| Changement | Raison | Effort | Priorité |
|------------|--------|--------|----------|
| Rules → Skills | Overhead contexte 20K tokens | 40h | P0 |
| Bus factor → 5 | Risque existentiel | 200h | P0 |
| Skills Hub publish | Distribution virale | 60h | P1 |
| Test coverage ≥80% | Fiabilité production | 120h | P1 |

---

## Next Year Priorities (Top 5)

### 1. [Priorité #1]

**Objectif** : [Description]
**Métriques de succès** :
- [Métrique 1] : cible [X]
- [Métrique 2] : cible [Y]

**Effort estimé** : [X]h
**Horizon** : Q[X] 2027

---

### 2. [Priorité #2]

**Objectif** : [Description]
**Métriques de succès** :
- [Métrique 1] : cible [X]
- [Métrique 2] : cible [Y]

**Effort estimé** : [X]h
**Horizon** : Q[X] 2027

---

### 3. [Priorité #3]

**Objectif** : [Description]
**Métriques de succès** :
- [Métrique 1] : cible [X]
- [Métrique 2] : cible [Y]

**Effort estimé** : [X]h
**Horizon** : Q[X] 2027

---

### 4. [Priorité #4]

**Objectif** : [Description]
**Métriques de succès** :
- [Métrique 1] : cible [X]
- [Métrique 2] : cible [Y]

**Effort estimé** : [X]h
**Horizon** : Q[X] 2027

---

### 5. [Priorité #5]

**Objectif** : [Description]
**Métriques de succès** :
- [Métrique 1] : cible [X]
- [Métrique 2] : cible [Y]

**Effort estimé** : [X]h
**Horizon** : Q[X] 2027

---

## Décision Stratégique : Capital & Croissance

### Options évaluées

| Option | Avantages | Inconvénients | Décision |
|--------|-----------|---------------|----------|
| **Bootstrap** | Indépendance, 100% ownership | Croissance lente, ressources limitées | ☐ Retenu ☐ Écarté |
| **Series A** | Accélération, recrutement, marketing | Dilution, pression croissance | ☐ Retenu ☐ Écarté |
| **Fondation** | Mission-driven, communauté forte | Governance complexe, donations incertaines | ☐ Retenu ☐ Écarté |
| **Corporate sponsor** | Ressources, crédibilité | Dépendance, influence externe | ☐ Retenu ☐ Écarté |

### Décision retenue

**Choix** : [Bootstrap / Series A / Fondation / Corporate sponsor]

**Justification** :
- [Raison 1]
- [Raison 2]
- [Raison 3]

**Plan d'action** :
1. [Action 1]
2. [Action 2]
3. [Action 3]

**Timeline** : Q[X]-Q[Y] 2027

---

## Risques Identifiés pour l'Année 2

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| Bus factor reste à 1 | Élevée | Critique | Champions program, doc exhaustive |
| Marché AI coding tools saturé | Moyenne | Majeur | Différenciateurs (QA Recette, Autonomous Sprint) |
| Claude Code deprecated | Faible | Critique | Multi-IDE support Phase 4 |
| Compliance ISO non atteinte | Moyenne | Majeur | Pre-audit consultant externe |
| ARR < €200K | Moyenne | Majeur | Open-core + enterprise features |

---

## Validation & Approbation

**Rétrospective validée par** :
- [Nom maintainer 1] — [Date]
- [Nom maintainer 2] — [Date]
- [Nom contributor 1] — [Date]

**Prochaine rétrospective** : [Date] (trimestrielle recommandée, annuelle obligatoire)

---

**Template version** : 1.0.0
**Auteur** : The Bearded CTO
**Dernière mise à jour** : 2026-04-17
