# Fonctionnalités Claude Craft Enterprise

**Version :** 1.0.0  
**Date :** 15 avril 2026  
**Statut :** Catalogue produit — Phase 4 P4-31

## 1. Vue d'Ensemble

Ce document détaille les fonctionnalités exclusives à **Claude Craft Enterprise** (licence commerciale propriétaire), par opposition aux fonctionnalités du **core MIT** (gratuit, open-source).

**Principe de différenciation :** Les fonctionnalités Enterprise sont des **extensions optionnelles** qui ne font pas partie du workflow de développement standard. Un développeur ou une petite équipe peut utiliser Claude Craft en production avec uniquement la version MIT.

## 2. Catalogue des Fonctionnalités par Tier

| Fonctionnalité | MIT | Starter | Pro | Enterprise | Description |
|----------------|-----|---------|-----|------------|-------------|
| **BMAD Framework complet** | ✅ | ✅ | ✅ | ✅ | Plan → Design → Implement, workflows, sprints |
| **10 stacks Tier 1** | ✅ | ✅ | ✅ | ✅ | Symfony, React, Flutter, Python, Angular, Vue, Laravel, React Native, C#, PHP |
| **67 agents** | ✅ | ✅ | ✅ | ✅ | API designer, database architect, TDD coach, reviewers, etc. |
| **214 commandes** | ✅ | ✅ | ✅ | ✅ | CLI complet avec skills, audits, génération code |
| **QA Recette** | ✅ | ✅ | ✅ | ✅ | Tests acceptance automatisés via Chrome |
| **Plugin System** | ✅ | ✅ | ✅ | ✅ | Marketplace skills public |
| **SSO SAML/OIDC** | ❌ | ✅ | ✅ | ✅ | Authentification centralisée entreprise |
| **SCIM Provisioning** | ❌ | ❌ | ✅ | ✅ | Auto-sync utilisateurs depuis IdP |
| **Audit Log Immuable** | ❌ | ✅ (90j) | ✅ (1 an) | ✅ (7 ans) | Traçabilité complète avec hash chain |
| **Export SIEM** | ❌ | ❌ | ✅ | ✅ | JSON Lines, CEF, LEEF pour Splunk/Elastic |
| **Multi-Tenant Dashboard** | ❌ | ❌ | ✅ | ✅ | Admin centralisé, RBAC, vue usage/cost |
| **Priority Support** | ❌ | Email 24h | Email + Slack 4h | Dedicated + on-call 1h | Support technique avec SLA |
| **Quarterly Business Review (QBR)** | ❌ | ❌ | ❌ | ✅ | Meeting CTO + stakeholders |
| **Advanced Analytics** | ❌ | ❌ | ✅ | ✅ | Posthog Enterprise feed, cost attribution |
| **Custom Skills privés** | ❌ | ❌ | ✅ | ✅ | Marketplace skills privé par organisation |
| **On-Premise Deployment Support** | ❌ | ❌ | ❌ | ✅ | Assistance déploiement air-gapped |
| **SLA contractuel** | ❌ | ✅ | ✅ | ✅ | Engagement temps réponse + uptime |
| **Indemnification IP** | ❌ | ❌ | ❌ | ✅ | Protection contre réclamations tiers |

## 3. Détail des Fonctionnalités Enterprise

### 3.1 SSO (Single Sign-On)

**Problème résolu :** Les grandes organisations ne peuvent pas demander à chaque développeur de créer un compte individuel. Elles ont besoin d'une authentification centralisée via leur Identity Provider (IdP).

**Implémentation :**

- **SAML 2.0 :** Support Okta, Azure AD, OneLogin, JumpCloud, Google Workspace SAML.
- **OIDC (OpenID Connect) :** Support Google Workspace, Auth0, Keycloak, AWS Cognito.
- **Mécanisme :** Le CLI déclenche un flux browser-based OAuth2 ou SAML, récupère un token ID, le valide, et stocke les credentials dans `~/.claude-craft/auth.json`.

**Use case :**

> *"Nous avons 150 développeurs. Impossible de gérer 150 comptes individuels. Avec SSO Azure AD, l'onboarding prend 2 minutes : ils se connectent avec leur email @company.com, et c'est tout."*

**Tiers disponibles :** Starter, Pro, Enterprise.

**Configuration exemple :**

```bash
claude-craft auth sso --provider=okta --domain=mycompany.okta.com
# Ouvre navigateur → login Okta → callback → credentials stockés
```

### 3.2 SCIM Provisioning

**Problème résolu :** Quand un employé rejoint/quitte l'organisation, synchroniser manuellement les accès Claude Craft est fastidieux et risqué (oubli de désactiver un compte → fuite de données).

**Implémentation :**

- **SCIM 2.0 :** API `/scim/v2/Users` et `/scim/v2/Groups` pour création/mise à jour/suppression automatique.
- **Support IdP :** Okta, Azure AD, OneLogin (tous supportent SCIM 2.0).
- **Workflow :** Admin RH ajoute un user dans l'IdP → SCIM push vers Claude Craft → compte créé automatiquement avec permissions par défaut (rôle "Developer").

**Use case :**

> *"Avec 500 employés et un turnover de 10%/an, on doit onboard/offboard 50 personnes. SCIM automatise tout. Plus d'accès orphelins."*

**Tiers disponibles :** Pro, Enterprise.

### 3.3 Audit Log Immuable

**Problème résolu :** Compliance (SOC 2, ISO 27001, HIPAA) exige une traçabilité complète de toutes les actions sensibles. Un audit log modifiable n'est pas acceptable.

**Implémentation :**

- **Events trackés :**
  - Authentification (login, logout, failed attempts)
  - Commandes exécutées (y compris arguments, sauf secrets redactés)
  - Installation de skills/agents
  - Modifications de configuration
  - Accès à des données sensibles (si applicables)
- **Stockage :** Append-only avec hash chain (chaque event inclut le hash du précédent, style blockchain simplifié).
- **Export :** JSON Lines (newline-delimited JSON), CEF (Common Event Format pour ArcSight), LEEF (Log Event Extended Format pour QRadar).
- **Rétention :** Configurable par tier (90j Starter, 1 an Pro, 7 ans Enterprise).

**Use case :**

> *"Notre auditeur SOC 2 demande : 'Qui a exécuté cette commande de migration DB le 12 mars à 14h37 ?' Avec audit log, on répond en 30 secondes."*

**Tiers disponibles :** Starter (90j), Pro (1 an), Enterprise (7 ans).

**Format JSON Lines exemple :**

```json
{"timestamp":"2026-04-15T10:23:45Z","user":"alice@company.com","event":"command.executed","command":"team:audit --scope=phase-4","hash":"a3f5d9...","prev_hash":"b2c4e1..."}
{"timestamp":"2026-04-15T10:24:12Z","user":"alice@company.com","event":"skill.installed","skill":"symfony:generate-crud","hash":"c6d8f2...","prev_hash":"a3f5d9..."}
```

### 3.4 Multi-Tenant Dashboard

**Problème résolu :** Dans une organisation de 100+ développeurs, le CTO/Engineering Manager a besoin d'une vue centralisée : qui utilise quoi, combien ça coûte (tokens API Anthropic), quelles équipes ont des erreurs fréquentes.

**Implémentation :**

- **Dashboard web** : Interface admin accessible via https://dashboard.claude-craft.dev (self-hosted ou cloud).
- **Vues disponibles :**
  - **Users :** Liste tous les users, statut actif/inactif, dernière connexion, nombre de commandes/jour.
  - **Usage :** Graphes d'utilisation par équipe (commandes, tokens consommés, skills installés).
  - **Costs :** Attribution des coûts API Anthropic par équipe/projet (si telemetry activée).
  - **Audit Events :** Recherche full-text dans les logs (filtres par user, date, type event).
  - **RBAC :** Attribution de rôles (Admin, Manager, Developer, Read-Only) avec permissions granulaires.
- **RBAC fine-grained :** Par exemple, un Manager peut voir les métriques de son équipe uniquement, pas celles des autres équipes.

**Use case :**

> *"On a 5 équipes produit. Chaque équipe doit voir ses métriques sans voir celles des autres (confidentialité). Le CTO voit tout. Le dashboard multi-tenant gère ça nativement."*

**Tiers disponibles :** Pro, Enterprise.

**Capture d'écran mockup (ASCII art) :**

```
┌─────────────────────────────────────────────────────────────────┐
│ Claude Craft Enterprise Dashboard — Acme Corp                  │
├─────────────────────────────────────────────────────────────────┤
│ Users: 127 active | Teams: 5 | Usage this month: 1.2M tokens   │
├─────────────────────────────────────────────────────────────────┤
│ Top Commands (30 days):                                        │
│   1. /team:audit              3,456 runs                        │
│   2. /symfony:generate-crud   2,341 runs                        │
│   3. /react:generate-component 1,987 runs                       │
├─────────────────────────────────────────────────────────────────┤
│ Cost Attribution:                                               │
│   Team Product A: €1,234 (tokens: 456K)                         │
│   Team Product B: €987 (tokens: 321K)                           │
│   Team Infra: €543 (tokens: 198K)                               │
├─────────────────────────────────────────────────────────────────┤
│ Recent Audit Events:                                            │
│   [2026-04-15 10:23] alice@acme.com executed /team:audit        │
│   [2026-04-15 09:45] bob@acme.com installed skill sso-okta      │
└─────────────────────────────────────────────────────────────────┘
```

### 3.5 Priority Support avec SLA

**Problème résolu :** Un bug bloquant en production peut coûter des milliers d'euros par heure. Les grandes organisations ont besoin d'un engagement contractuel de temps de réponse.

**Implémentation :**

- **Canaux :**
  - **Starter :** Email support@thebeardedcto.com, réponse 24h business hours.
  - **Pro :** Email + Slack Connect (canal privé), réponse 4h business hours.
  - **Enterprise :** Dedicated Slack channel + PagerDuty on-call 24/7, réponse 1h critical.
- **Ticketing :** Intercom ou Zendesk pour tracking, SLA automatique (alertes si dépassement).
- **Escalation :** Si SLA dépassé, email automatique au VP Engineering + CTO client.

**Use case :**

> *"Notre pipeline CI a crashé à cause d'un bug Claude Craft. On a contacté le support Enterprise à 3h du matin. Réponse en 45 minutes, hotfix déployé en 2h. Sans ça, on perdait 10K€/heure."*

**Tiers disponibles :** Tous (SLA varie selon tier, voir LICENSE-ENTERPRISE.md §5).

### 3.6 Advanced Analytics

**Problème résolu :** Les organisations data-driven veulent comprendre l'adoption de Claude Craft, identifier les bottlenecks, optimiser les workflows.

**Implémentation :**

- **Posthog Enterprise feed :** Si le client a déjà Posthog (outil analytics), Claude Craft envoie les events directement dans leur instance (telemetry opt-in).
- **Métriques disponibles :**
  - **Adoption :** % développeurs actifs/semaine, courbe d'activation (time-to-first-command).
  - **Retention :** Cohort analysis (utilisateurs J+7, J+30).
  - **Feature usage :** Quelles commandes/skills sont les plus utilisées (priorisation roadmap).
  - **Error rate :** % commandes en échec par type (détecter patterns).
  - **Cost attribution :** Coût API Anthropic par équipe/projet/developer (nécessite telemetry activée).
- **Privacy :** Toutes les données restent dans l'infra du client (self-hosted Posthog ou Posthog Cloud EU).

**Use case :**

> *"On voulait savoir si l'équipe Frontend utilise vraiment les skills React. Posthog nous a montré que 80% ignoraient leur existence. On a organisé une formation, adoption +300% en 2 semaines."*

**Tiers disponibles :** Pro, Enterprise.

## 4. Matrice Tarifaire Indicative (DRAFT)

> **⚠️ AVERTISSEMENT :** Tarifs indicatifs, soumis à validation par avocat/fiscaliste et ajustements selon le marché. Ne constitue pas une offre ferme.

| Tier | Seats | Prix Annuel HT | Prix Mensuel HT | Support | SLA Response | Audit Log Retention |
|------|-------|----------------|-----------------|---------|--------------|---------------------|
| **MIT (gratuit)** | Illimité | €0 | €0 | Community (GitHub Discussions, Discord) | Best effort | N/A |
| **Starter** | 1-10 | €5 000 | €417 | Email | 24h business | 90 jours |
| **Pro** | 11-50 | €12 000 | €1 000 | Email + Slack Connect | 4h business | 1 an |
| **Enterprise** | 51+ | Sur devis (min. €25 000) | Sur devis | Dedicated + on-call | 1h critical 24/7 | 7 ans |

**Seats additionnels :**

- Starter/Pro : €500/seat/an (facturation prorata).
- Enterprise : Tarif dégressif négocié au contrat.

**Réductions volume (Enterprise uniquement) :**

- 100-250 seats : -10%
- 251-500 seats : -15%
- 501+ seats : -20% (négociable)

**Formation & Certification (add-ons) :**

- Formation on-site 2 jours (max 20 personnes) : €8 000
- Certification Claude Craft Developer (examen + badge) : €500/personne
- Certification Claude Craft Architect (examen avancé) : €1 000/personne

**Services professionnels (add-ons) :**

- Migration projet existant vers Claude Craft : Sur devis (€10K-50K selon taille projet)
- Custom skills développement : €5 000/skill
- Audit de sécurité tiers (pentest + code review) : €15 000

## 5. Comparaison avec Concurrents

| Fonctionnalité | Claude Craft MIT | Claude Craft Enterprise | Cursor Pro | GitHub Copilot Enterprise | Cody Enterprise |
|----------------|------------------|-------------------------|------------|---------------------------|-----------------|
| **Prix** | Gratuit | €5K-25K+/an | $20/user/mois (€228/user/an) | $39/user/mois (€468/user/an) | $19/user/mois (€228/user/an) |
| **SSO SAML/OIDC** | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Audit Log** | ❌ | ✅ (immuable) | ❌ | ✅ (basique) | ❌ |
| **Multi-tenant dashboard** | ❌ | ✅ | ❌ | ✅ | ❌ |
| **BMAD Framework** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **QA Recette automatisée** | ✅ | ✅ | ❌ | ❌ | ❌ |
| **67 agents spécialisés** | ✅ | ✅ | ~5 | ~10 (Copilot Workspace) | ~5 |
| **Support multi-stacks (10+)** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **On-premise deployment** | ✅ | ✅ (support dédié) | ❌ | ❌ (GitHub Enterprise Server uniquement) | ✅ |

**Avantage compétitif Claude Craft Enterprise :**

1. **Open-core :** Core MIT gratuit, pas de lock-in → confiance communauté.
2. **BMAD Framework :** Méthodologie complète vs simple autocomplétion.
3. **Audit log immuable :** Compliance SOC 2/ISO 27001 native, pas un add-on.
4. **Prix compétitif :** €5K/an pour 10 seats vs €2,280/an chez Cursor pour même nombre (mais Cursor = autocomplétion uniquement, pas d'agents/BMAD).

## 6. Roadmap Fonctionnalités Enterprise (12 mois)

| Trimestre | Fonctionnalité | Statut |
|-----------|----------------|--------|
| **Q2 2026** | SSO SAML/OIDC + Audit Log immuable | ✅ Planifié P4-31 |
| **Q2 2026** | Multi-tenant dashboard (MVP) | ✅ Planifié P4-31 |
| **Q3 2026** | SCIM provisioning | 🔄 Roadmap |
| **Q3 2026** | Export SIEM (CEF/LEEF) | 🔄 Roadmap |
| **Q4 2026** | Advanced analytics (Posthog feed) | 🔄 Roadmap |
| **Q4 2026** | Custom skills marketplace privé | 🔄 Roadmap |
| **Q1 2027** | On-premise air-gapped deployment kit | 🔄 Roadmap |
| **Q1 2027** | RBAC fine-grained (policies custom) | 🔄 Roadmap |

## 7. Validation et Prochaines Étapes

### 7.1 Validation Légale

- [ ] Revue tarifs par fiscaliste (TVA, prix HT/TTC, conformité EU).
- [ ] Revue fonctionnalités par avocat IP (pas de promesses intenables dans LICENSE-ENTERPRISE.md).
- [ ] Validation RGPD pour audit log et analytics (DPO consulté).

### 7.2 Validation Commerciale

- [ ] Enquête auprès de 10 early adopters : quelles fonctionnalités Enterprise sont prioritaires ?
- [ ] A/B testing tarifs (€5K vs €7K pour Starter).
- [ ] Comparaison benchmarks concurrents (mise à jour Q2 2026).

### 7.3 Validation Technique

- [ ] PoC SSO SAML avec Okta (1 semaine).
- [ ] PoC Audit Log avec hash chain (1 semaine).
- [ ] Architecture review avec `@security-auditor` (2 jours).

## 8. FAQ

**Q : Un client Starter peut-il upgrader vers Pro en cours d'année ?**

R : Oui, upgrade prorata. Exemple : Starter souscrit le 1er janvier (€5K), upgrade vers Pro le 1er juillet → paie (€12K - €5K) × 6/12 = €3,5K pour les 6 mois restants.

**Q : Les features Enterprise sont-elles disponibles on-premise (air-gapped) ?**

R : Tier Enterprise uniquement. Nécessite support dédié pour l'installation (inclus dans le contrat).

**Q : L'audit log est-il RGPD-compliant ?**

R : Oui, les données personnelles (emails, noms) peuvent être pseudonymisées ou supprimées sur demande (droit à l'oubli Art. 17). Les logs techniques (commandes, timestamps) sont conservés pour compliance.

**Q : Puis-je utiliser Claude Craft Enterprise sans internet (offline) ?**

R : Oui, la vérification de licence est offline-first (JWT signé). Seule la révocation nécessite une connexion quotidienne (CRL fetch), mais cache de 24h permet de travailler offline temporairement.

---

**Auteur :** The Bearded Bear SAS — Product Team  
**Reviewers :** `@product-owner`, Legal counsel, Sales team  
**Dernière mise à jour :** 15 avril 2026
