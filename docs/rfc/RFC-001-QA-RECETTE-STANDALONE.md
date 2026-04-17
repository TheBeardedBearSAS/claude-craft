# RFC-001: QA Recette Standalone

**Status**: Draft  
**Created**: 2026-04-17  
**Author**: The Bearded CTO  
**Phase**: OPP-04 (Innovation & Croissance), R3 (Génération de revenus)

---

## Résumé exécutif

QA Recette est le **killer feature** de Claude Craft : automated acceptance testing via Chrome automation avec regression tracking. Actuellement locked dans Claude Craft, ce RFC propose de le séparer en **produit standalone** avec modèle freemium pour générer des revenus récurrents.

**Objectifs** :
- Rendre QA Recette accessible hors de Claude Craft
- Générer des revenus via modèle freemium
- Élargir l'audience (QA teams, non-Claude Code users)
- Simplifier l'adoption (SDK npm + Chrome extension)

---

## Problem

### État actuel

QA Recette est intégré dans Claude Craft et nécessite :
- Claude Code installé
- Claude Craft framework complet
- Commande `/qa:recette` dans Claude Code

**Limitations** :
- ❌ Locked-in à Claude Code (friction élevée)
- ❌ Pas accessible aux QA teams sans dev setup
- ❌ Pas de revenus générés
- ❌ Complexité d'adoption pour tester uniquement QA Recette

### Opportunité

**Golden Rule QA Recette** : "A fixed bug should NEVER reappear."

Cette règle résonne avec toutes les équipes QA. En séparant QA Recette en produit standalone, on peut :
- ✅ Toucher un marché plus large (QA teams, non-devs)
- ✅ Générer des revenus récurrents (freemium)
- ✅ Simplifier l'onboarding (npm install + Chrome extension)
- ✅ Garder la puissance de l'intégration Claude Craft pour les power users

---

## Solution proposée

### Architecture standalone

```
┌─────────────────────────────────────────────────────────────┐
│                    QA Recette Standalone                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. SDK npm (@qa-recette/sdk)                               │
│     ├── API client (REST)                                   │
│     ├── TypeScript types                                    │
│     └── CLI (npx qa-recette)                                │
│                                                             │
│  2. Chrome Extension (qa-recette-extension)                 │
│     ├── Chrome automation                                   │
│     ├── Screenshot capture                                  │
│     ├── Visual regression detection                         │
│     └── Session recording                                   │
│                                                             │
│  3. API Backend (OpenAPI 3.2)                               │
│     ├── Session management                                  │
│     ├── Test scenario storage                               │
│     ├── Regression tracking                                 │
│     └── Reporting                                           │
│                                                             │
│  4. Web Dashboard                                           │
│     ├── Test results visualization                          │
│     ├── Regression history                                  │
│     ├── Team collaboration                                  │
│     └── Billing & subscriptions                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Composants

#### 1. SDK npm (`@qa-recette/sdk`)

```bash
npm install -g @qa-recette/sdk
```

```javascript
// API programmatique
import { QARecette } from '@qa-recette/sdk';

const recette = new QARecette({
  apiKey: process.env.QA_RECETTE_API_KEY
});

const session = await recette.run({
  scope: 'story',
  id: 'US-001',
  scenarios: ['login', 'checkout'],
  headless: true
});

console.log(session.results); // Pass/Fail + screenshots
```

```bash
# CLI
npx qa-recette run --scope=story --id=US-001
npx qa-recette report --session=REC-20260417-123456
npx qa-recette resume --session=REC-20260417-123456
```

#### 2. Chrome Extension

**Installation** : Chrome Web Store

**Fonctionnalités** :
- Enregistrement de scénarios (record mode)
- Exécution de tests (playback mode)
- Screenshot automatique
- Visual regression detection (pixel diff)
- Session export (JSON)

**Usage** :
1. Installer l'extension
2. Ouvrir l'application à tester
3. Cliquer "Record scenario"
4. Effectuer les actions manuellement
5. Sauvegarder le scénario
6. Rejouer automatiquement

#### 3. API Backend (OpenAPI 3.2)

**Endpoints** :

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/sessions` | Créer une session de test |
| GET | `/api/v1/sessions/{id}` | Récupérer une session |
| POST | `/api/v1/sessions/{id}/resume` | Reprendre une session |
| GET | `/api/v1/sessions/{id}/report` | Générer un rapport |
| GET | `/api/v1/scenarios` | Lister les scénarios |
| POST | `/api/v1/scenarios` | Créer un scénario |
| GET | `/api/v1/regressions` | Historique régressions |

**Authentication** : Bearer token (API key)

**Storage** :
- PostgreSQL (sessions, scenarios, users)
- S3 (screenshots, recordings)

#### 4. Web Dashboard

**URL** : https://app.qa-recette.com

**Features** :
- Overview des tests (pass/fail ratio)
- Détail par session (screenshots, logs)
- Historique régressions (timeline)
- Team management (invitations, roles)
- Billing (plans, invoices)

---

## Pricing — Modèle freemium

### Free Plan

**Cible** : Indie developers, petits projets

**Limites** :
- 5 tests/mois
- 1 user
- 7 jours de rétention sessions
- Pas de visual regression
- Support community

**Prix** : $0/mois

### Pro Plan

**Cible** : SMB, équipes QA

**Limites** :
- Illimité tests/mois
- 5 users
- 90 jours de rétention sessions
- Visual regression incluse
- Support email (48h)
- Intégration CI/CD (GitHub Actions, GitLab CI)

**Prix** : $9/user/mois (billing mensuel)

### Enterprise Plan

**Cible** : Grandes entreprises

**Limites** :
- Illimité tests/mois
- Illimité users
- Rétention illimitée
- Visual regression + AI-powered suggestions
- Support prioritaire (4h)
- Intégration CI/CD + webhooks
- SSO (SAML)
- On-premise deployment

**Prix** : Custom (contact sales)

---

## Migration path

### Depuis Claude Craft intégré

**Étape 1** : Exporter les scénarios

```bash
# Dans Claude Craft
/qa:recette export --format=json --output=scenarios.json
```

**Étape 2** : Importer dans QA Recette Standalone

```bash
# Standalone
npx qa-recette import --file=scenarios.json
```

**Étape 3** : Configurer l'API key

```bash
# Générer API key depuis dashboard
export QA_RECETTE_API_KEY="qar_live_..."

# Tester
npx qa-recette run --scope=story --id=US-001
```

### Rétro-compatibilité

Claude Craft continuera à supporter QA Recette intégré via :
- `/qa:recette` (commande existante, mode legacy)
- `/qa:recette --cloud` (délégation au service cloud standalone)

**Dépréciation** :
- v8.5 : Legacy mode (warning)
- v9.0 : Cloud mode par défaut
- v10.0 : Legacy mode supprimé

---

## Timeline

### Alpha (mois 7)

**Objectif** : MVP fonctionnel pour early adopters

**Deliverables** :
- [x] SDK npm (`@qa-recette/sdk`) v0.1.0
- [x] Chrome extension v0.1.0 (private beta)
- [x] API backend (core endpoints)
- [ ] Web dashboard (basique)
- [ ] Documentation (getting started)
- [ ] 10 alpha testers

**Success metrics** :
- 10 alpha testers actifs
- 50 tests exécutés
- < 5% crash rate

### Beta (mois 8)

**Objectif** : Stabilisation + freemium launch

**Deliverables** :
- [ ] SDK npm v0.5.0 (stable API)
- [ ] Chrome extension v0.5.0 (Chrome Web Store)
- [ ] API backend (complet)
- [ ] Web dashboard (complet + billing)
- [ ] Documentation (complète)
- [ ] 100 beta testers

**Success metrics** :
- 100 beta users
- 1000 tests exécutés
- < 1% crash rate
- 20 paying users (Pro plan)

### GA (mois 9)

**Objectif** : Production-ready + marketing

**Deliverables** :
- [ ] SDK npm v1.0.0
- [ ] Chrome extension v1.0.0
- [ ] API backend v1.0.0 (SLA 99.9%)
- [ ] Web dashboard v1.0.0
- [ ] Documentation (complète + tutorials)
- [ ] Marketing (landing page, blog posts)

**Success metrics** :
- 500 users
- 5000 tests/mois
- 50 paying users
- < 5% churn rate
- $450 MRR (50 users × $9)

---

## Success metrics

### Métriques produit

| Metric | Q1 | Q2 | Q3 | Q4 |
|--------|----|----|----|----|
| **Total users** | 100 | 500 | 2000 | 5000 |
| **Paying users** | 20 | 50 | 200 | 500 |
| **MRR** | $180 | $450 | $1800 | $4500 |
| **Tests/mois** | 1K | 5K | 20K | 50K |
| **Churn rate** | <10% | <5% | <3% | <2% |

### Métriques techniques

| Metric | Target |
|--------|--------|
| **API uptime** | 99.9% |
| **Crash rate** | < 1% |
| **P95 latency** | < 500ms |
| **Visual regression accuracy** | > 95% |

---

## Risques & mitigations

### Risque 1 : Adoption faible

**Impact** : Moyen  
**Probabilité** : Moyenne

**Mitigation** :
- Freemium pour réduire friction
- Documentation complète + tutorials
- Integration avec CI/CD populaires (GitHub Actions)
- Marketing ciblé (QA communities, Reddit, Twitter)

### Risque 2 : Cannibalisation Claude Craft

**Impact** : Faible  
**Probabilité** : Faible

**Mitigation** :
- QA Recette Standalone = gateway drug vers Claude Craft
- Intégration privilégiée pour Claude Craft users (features early access)
- Cross-promotion (dashboard → Claude Craft)

### Risque 3 : Concurrence (Playwright, Cypress)

**Impact** : Élevé  
**Probabilité** : Élevée

**Mitigation** :
- **Différenciation** : AI-powered regression detection (unique)
- **Simplicité** : No-code scenario recording (vs Playwright script)
- **Claude integration** : Génération automatique de tests depuis specs
- **Golden Rule** : Focus regression tracking (pas juste E2E testing)

### Risque 4 : Coûts infrastructure (screenshots, S3)

**Impact** : Moyen  
**Probabilité** : Moyenne

**Mitigation** :
- Compression images (WebP, lossy)
- Retention limitée (7j Free, 90j Pro)
- Pricing ajusté pour couvrir infra
- Optimisation stockage (dedupe, CDN)

---

## Alternatives considérées

### Alternative 1 : QA Recette reste intégré à Claude Craft

**Pros** :
- Pas de développement additionnel
- Cohérence avec l'écosystème Claude Craft

**Cons** :
- ❌ Friction élevée (setup complet requis)
- ❌ Pas de revenus générés
- ❌ Audience limitée aux Claude Craft users

**Décision** : Rejetée (opportunité manquée)

### Alternative 2 : QA Recette open-source (GitHub)

**Pros** :
- Community contributions
- Adoption rapide

**Cons** :
- ❌ Pas de revenus directs
- ❌ Support community-based (moins fiable)
- ❌ Concurrence directe Playwright/Cypress

**Décision** : Rejetée (pas de business model)

### Alternative 3 : Licensing QA Recette à d'autres frameworks

**Pros** :
- Revenus B2B
- Partenariats stratégiques

**Cons** :
- ❌ Complexité contractuelle
- ❌ Dépendance aux partenaires
- ❌ Marché niche

**Décision** : Rejetée (marché trop restreint)

---

## Conséquences

### Positives

- ✅ **Revenus récurrents** : $450 MRR (mois 9) → $4500 MRR (mois 12)
- ✅ **Élargissement audience** : QA teams, non-Claude Code users
- ✅ **Gateway drug** : QA Recette Standalone → Claude Craft complet
- ✅ **Simplification adoption** : npm install + Chrome extension (vs full Claude Craft setup)

### Négatives

- ❌ **Développement additionnel** : SDK npm, API backend, dashboard (effort XL)
- ❌ **Maintenance** : 2 produits (Claude Craft + QA Recette Standalone)
- ❌ **Infrastructure costs** : Hosting, S3, CDN (mitigé par pricing)

### Neutres

- 🔄 **Rétro-compatibilité** : Migration path requis pour Claude Craft users
- 🔄 **Marketing** : Effort marketing pour lancer le produit standalone

---

## Open questions

1. **Self-hosted option** : Proposer une version on-premise pour Enterprise ?
2. **AI-powered test generation** : Générer automatiquement des tests depuis specs/PRD ?
3. **Integration Jira/Linear** : Sync automatique avec outils PM ?
4. **Multi-browser support** : Firefox, Safari en plus de Chrome ?

---

## Next steps

### Immédiat (mois 7)

- [ ] Créer repo `qa-recette-standalone`
- [ ] Développer SDK npm v0.1.0
- [ ] Développer Chrome extension v0.1.0
- [ ] Développer API backend (core endpoints)
- [ ] Recruter 10 alpha testers

### Court terme (mois 8)

- [ ] Stabiliser SDK + extension (v0.5.0)
- [ ] Développer dashboard + billing
- [ ] Lancer beta publique (Chrome Web Store)
- [ ] Marketing (landing page, blog posts)

### Moyen terme (mois 9)

- [ ] Release v1.0 (GA)
- [ ] Monitoring + alerting (uptime, crash rate)
- [ ] Support client (email, chat)
- [ ] Itérer sur feedback beta

---

**Date de création** : 2026-04-17  
**Version** : 1.0.0  
**Auteur** : The Bearded CTO  
**Statut** : Draft (en attente validation)
