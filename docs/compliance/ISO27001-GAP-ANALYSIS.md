# ISO 27001:2022 Gap Analysis — Claude Craft

**DRAFT — Review Legal/CTO + cabinet audit obligatoire**

**Date :** 2026-04-15  
**Version :** 1.0.0  
**Projet :** Claude Craft v8.1.0  
**Objectif :** Certification ISO 27001:2022 + SOC 2 Type II  
**Budget audit externe :** €15-30K  

---

## Executive Summary

Cette gap analysis identifie les écarts entre l'état actuel de Claude Craft et les exigences ISO 27001:2022 Annex A (93 contrôles). L'analyse prépare un audit de certification externe par cabinet accrédité COFRAC.

**Statut global :**
- **Conformité actuelle estimée :** 45% (contrôles basiques open-source présents)
- **Effort total requis :** ~480 heures (3 mois ETP)
- **Timeline certification :** 6 mois (gap closure + audit Stage 1/2)
- **Risques majeurs identifiés :** 15 (voir registre risques)

**Priorités immédiates (P0) :**
- Information Security Policy formalisée
- Risk Treatment Plan complet
- Incident Response Plan opérationnel
- Access Control Policy + revue comptes
- Supplier Management Policy (Anthropic, GitHub, etc.)

---

## Méthodologie

### Approche

1. **Phase 1 — Gap Analysis interne** (M1, avril 2026)
   - Audit auto-évaluation Annex A 14 domaines
   - Revue documentation existante (BMAD, CLAUDE.md, règles sécurité)
   - Identification écarts vs. ISO 27001:2022

2. **Phase 2 — Mise en conformité** (M2-M3, mai-juin 2026)
   - Implémentation contrôles manquants
   - Rédaction politiques ISMS (Information Security Management System)
   - Formation équipe sensibilisation sécurité

3. **Phase 3 — Stage 1 Audit** (M4, juillet 2026)
   - Documentation review par auditeur externe
   - Correction non-conformités mineures

4. **Phase 4 — Stage 2 Audit** (M5-M6, août-septembre 2026)
   - Audit terrain conformité contrôles
   - Tests efficacité, entretiens équipe
   - Délivrance certificat (si conforme)

### Référentiel

- **ISO/IEC 27001:2022** — ISMS requirements
- **ISO/IEC 27002:2022** — Annex A controls (93 contrôles, 14 domaines)
- **SOC 2 Type II** — Trust Services Criteria (Security, Availability, Confidentiality)
- **RGPD** — compatibilité CNIL (données personnelles utilisateurs Claude Craft)

---

## Mapping Annex A:2022 — 14 Domaines

### A.5 Information Security Policies (2 contrôles)

| Contrôle | Exigence | État actuel | Gap | Action requise | Priorité | Owner | Effort |
|----------|----------|-------------|-----|----------------|----------|-------|--------|
| **A.5.1** | Information security policy | Partiel (règles `.claude/rules/11-security.md`) | Politique formalisée absente, pas d'approbation direction | Rédiger ISP, approbation CTO, communication équipe | **P0** | CTO | 16h |
| **A.5.2** | Information security roles and responsibilities | Absent | Rôles CISO/DPO non définis | Définir rôles, RACI matrix, responsabilités | **P0** | CTO | 8h |

**Statut domaine A.5 :** 30% conforme  
**Total effort A.5 :** 24h

---

### A.6 Organization of Information Security (7 contrôles)

| Contrôle | Exigence | État actuel | Gap | Action requise | Priorité | Owner | Effort |
|----------|----------|-------------|-----|----------------|----------|-------|--------|
| **A.6.1** | Screening | Absent | Pas de vérification background employés/contractors | Process screening, vérification références | P1 | HR | 12h |
| **A.6.2** | Terms and conditions of employment | Partiel (contrats) | Clauses confidentialité/sécurité manquantes | Mise à jour contrats, NDA, acceptable use policy | **P0** | Legal | 16h |
| **A.6.3** | Information security awareness, education and training | Partiel (docs BMAD) | Formation structurée absente | Programme 8h/an, 12 modules, tracking complétude | **P0** | CTO | 40h |
| **A.6.4** | Disciplinary process | Absent | Sanctions non-conformité non définies | Politique sanctions, escalation process | P1 | HR | 8h |
| **A.6.5** | Responsibilities after termination | Partiel | Offboarding incomplet (accès révoqués mais pas audit) | Checklist offboarding, revue accès 0h, attestation retour assets | P1 | IT | 12h |
| **A.6.6** | Confidentiality or non-disclosure agreements | Partiel | NDA standard, pas spécifique ISMS | Template NDA sécurité, signature obligatoire onboarding | P1 | Legal | 8h |
| **A.6.7** | Remote working | Absent | Politique télétravail sécurisée manquante | Policy remote work, VPN obligatoire, device management | P1 | CTO | 16h |

**Statut domaine A.6 :** 25% conforme  
**Total effort A.6 :** 112h

---

### A.7 Asset Management (REMOVED in 2022, renuméroté en A.8)

### A.8 Asset Management (10 contrôles)

| Contrôle | Exigence | État actuel | Gap | Action requise | Priorité | Owner | Effort |
|----------|----------|-------------|-----|----------------|----------|-------|--------|
| **A.8.1** | Inventory of assets | Absent | Inventaire assets incomplet (repos GitHub oui, mais pas infrastructure, licenses) | Registre assets : repos, domaines, serveurs, licenses, données | **P0** | CTO | 24h |
| **A.8.2** | Ownership of assets | Absent | Owners non assignés | Assigner owner par asset, responsabilité protection | P1 | CTO | 8h |
| **A.8.3** | Acceptable use of assets | Absent | Politique usage acceptable manquante | Rédiger AUP (Acceptable Use Policy) | P1 | CTO | 12h |
| **A.8.4** | Return of assets | Partiel | Pas de tracking retour devices offboarding | Checklist retour laptop/clés/badges, attestation signée | P1 | IT | 8h |
| **A.8.5** | Classification of information | Absent | Données non classifiées (Public/Internal/Confidential/Restricted) | Schéma classification, labeling, handling rules | **P0** | CTO | 16h |
| **A.8.6** | Labelling of information | Absent | Pas de labels données sensibles | Tags classification automatiques (repos, docs) | P1 | Dev | 16h |
| **A.8.7** | Handling of assets | Absent | Règles handling/stockage/destruction manquantes | Procédures stockage sécurisé, destruction certifiée | P1 | CTO | 12h |
| **A.8.8** | Management of removable media | Absent | USB/disques externes non régulés | Policy média amovibles, chiffrement obligatoire | P2 | IT | 8h |
| **A.8.9** | Disposal of media | Absent | Destruction sécurisée non garantie | Contrat destruction certifiée (certificat CESG), SSD wipe NIST 800-88 | P1 | IT | 8h |
| **A.8.10** | Information transfer | Partiel (HTTPS/TLS) | Transferts fichiers sensibles non chiffrés E2E | Policy transfert sécurisé, E2E encryption obligatoire >Confidential | P1 | Dev | 16h |

**Statut domaine A.8 :** 20% conforme  
**Total effort A.8 :** 128h

---

### A.9 Access Control (14 contrôles)

| Contrôle | Exigence | État actuel | Gap | Action requise | Priorité | Owner | Effort |
|----------|----------|-------------|-----|----------------|----------|-------|--------|
| **A.9.1** | Access control policy | Absent | Politique formalisée manquante | Rédiger Access Control Policy (voir `policies/access-control.md`) | **P0** | CTO | 16h |
| **A.9.2** | User access provisioning | Partiel | Process provisioning manuel, pas d'approbation formelle | Workflow approval (manager+IT), SLA 24h provisioning | P1 | IT | 16h |
| **A.9.3** | Management of privileged access rights | Partiel | Admin GitHub oui, mais pas PAM, pas enregistrement sessions | Déployer PAM, session recording admin, approval dual | **P0** | CTO | 40h |
| **A.9.4** | Management of secret authentication information | Partiel (1Password) | Secrets non rotés régulièrement | Rotation secrets 90j, détection secrets hardcodés CI (GitLeaks) | **P0** | Dev | 24h |
| **A.9.5** | Review of user access rights | Absent | Revue comptes non formalisée | Revue trimestrielle comptes, attestation managers | **P0** | IT | 8h + 2h/trim |
| **A.9.6** | Removal or adjustment of access rights | Partiel | Offboarding révoque accès mais délai variable | SLA 1h révocation urgente, 4h standard | **P0** | IT | 12h |
| **A.9.7** | User authentication | Bon | MFA GitHub/Anthropic activé | Étendre MFA à tous les outils (npm, Cloudflare, Stripe) | P1 | IT | 8h |
| **A.9.8** | Use of privileged utility programs | Absent | Outils admin non restreints | Restriction outils système, audit usage | P1 | IT | 12h |
| **A.9.9** | Access to program source code | Bon | GitHub branch protection, code review obligatoire | Audit logs accès repos privés, alerte access anomalies | P2 | Dev | 16h |
| **A.9.10** | Secure log-on procedures | Bon | MFA + password policy conforme | RAS | — | — | 0h |
| **A.9.11** | Password management system | Bon | 1Password entreprise | RAS | — | — | 0h |
| **A.9.12** | Use of privileged access rights | Absent | Pas de supervision accès admin | Monitoring sessions admin, alerte usage hors horaires | P1 | IT | 16h |
| **A.9.13** | Access control to information | Partiel | Permissions GitHub correctes, mais données Posthog/Sentry non restreintes | Restreindre accès analytics/monitoring équipe réduite | P1 | IT | 8h |
| **A.9.14** | Secure authentication | Bon | TOTP + hardware keys admin | RAS | — | — | 0h |

**Statut domaine A.9 :** 55% conforme  
**Total effort A.9 :** 176h

---

### A.10 Cryptography (2 contrôles)

| Contrôle | Exigence | État actuel | Gap | Action requise | Priorité | Owner | Effort |
|----------|----------|-------------|-----|----------------|----------|-------|--------|
| **A.10.1** | Policy on the use of cryptographic controls | Absent | Pas de politique cryptographie formalisée | Rédiger Crypto Policy : Argon2id passwords, TLS 1.3, Ed25519 JWT, AES-256-GCM data at rest | **P0** | CTO | 16h |
| **A.10.2** | Key management | Absent | Gestion clés ad-hoc (secrets 1Password mais pas rotation/escrow) | Key management process : rotation annuelle, escrow clés critiques, HSM si SaaS | P1 | CTO | 24h |

**Statut domaine A.10 :** 30% conforme  
**Total effort A.10 :** 40h

---

### A.11 Physical and Environmental Security (7 contrôles)

| Contrôle | Exigence | État actuel | Gap | Action requise | Priorité | Owner | Effort |
|----------|----------|-------------|-----|----------------|----------|-------|--------|
| **A.11.1** | Physical security perimeters | N/A (remote) | Équipe remote, pas de bureaux | Documentation remote-first, exigences home office sécurisé | P2 | HR | 8h |
| **A.11.2** | Physical entry controls | N/A | Pas de datacenter propriétaire (GitHub/Cloudflare/AWS managed) | Attestation conformité fournisseurs (SOC 2 Cloudflare, AWS ISO 27001) | P1 | CTO | 4h |
| **A.11.3** | Securing offices, rooms and facilities | N/A | Remote-first | Policy remote work sécurisé (A.6.7) | P2 | HR | 0h (couvert A.6.7) |
| **A.11.4** | Protecting against external and environmental threats | N/A | Infrastructure cloud (providers gérent) | RAS | — | — | 0h |
| **A.11.5** | Working in secure areas | N/A | Remote | Policy confidentialité remote (pas de travail espaces publics données Restricted) | P2 | HR | 4h |
| **A.11.6** | Delivery and loading areas | N/A | Pas de locaux | RAS | — | — | 0h |
| **A.11.7** | Clear desk and clear screen policy | Absent | Pas de politique formalisée | Policy écran verrouillé auto 5min, pas de post-it passwords | P2 | HR | 4h |

**Statut domaine A.11 :** 60% conforme (N/A majoritaire)  
**Total effort A.11 :** 20h

---

### A.12 Operations Security (14 contrôles)

| Contrôle | Exigence | État actuel | Gap | Action requise | Priorité | Owner | Effort |
|----------|----------|-------------|-----|----------------|----------|-------|--------|
| **A.12.1** | Documented operating procedures | Partiel (BMAD workflows) | Procédures ops non exhaustives (manque DR, backup restore) | Documenter runbooks : backup restore, DR drill, incident response | **P0** | CTO | 32h |
| **A.12.2** | Change management | Bon | GitHub PR + CI/CD | Audit trail changes, approval matrix changes infrastructure | P1 | Dev | 8h |
| **A.12.3** | Capacity management | Absent | Pas de monitoring capacité (GitHub Actions minutes, Cloudflare quotas) | Alertes quotas, forecasting usage | P1 | Dev | 12h |
| **A.12.4** | Separation of development, testing and operational environments | Bon | Branches dev/staging/prod séparées | RAS | — | — | 0h |
| **A.12.5** | Information backup | Partiel | Git oui, mais données Posthog/Sentry non backupées | Backup 3-2-1 : GitHub auto, Posthog export mensuel, Sentry retention 90j | **P0** | Dev | 16h |
| **A.12.6** | Event logging | Bon | GitHub audit log, Cloudflare logs, Sentry | Centraliser logs SIEM (ex: Wazuh open-source), retention 1 an | P1 | Dev | 24h |
| **A.12.7** | Protection of log information | Partiel | Logs non chiffrés at rest | Chiffrement logs, accès restreint, immutabilité | P1 | Dev | 12h |
| **A.12.8** | Administrator and operator logs | Bon | GitHub admin actions loguées | RAS | — | — | 0h |
| **A.12.9** | Clock synchronisation | Bon | NTP serveurs cloud providers | RAS | — | — | 0h |
| **A.12.10** | Control of operational software | Bon | Dependabot, npm audit | Ajouter SBOM automatique (CycloneDX), Sigstore signing | P1 | Dev | 16h |
| **A.12.11** | Technical vulnerability management | Bon | Dependabot alerts, Trivy scans | Process patch management : SLA 7j vulns critiques, 30j hautes | P1 | Dev | 12h |
| **A.12.12** | Restrictions on software installation | Absent | Laptops équipe non managés (BYOD) | Policy logiciels autorisés, MDM si SaaS (Jamf/Intune) ou attestation compliance | P2 | IT | 24h |
| **A.12.13** | Information backup | (doublon A.12.5) | — | — | — | — | 0h |
| **A.12.14** | Logging and monitoring | Bon | Sentry, Posthog, GitHub Actions | RAS | — | — | 0h |

**Statut domaine A.12 :** 60% conforme  
**Total effort A.12 :** 156h

---

### A.13 Communications Security (7 contrôles)

| Contrôle | Exigence | État actuel | Gap | Action requise | Priorité | Owner | Effort |
|----------|----------|-------------|-----|----------------|----------|-------|--------|
| **A.13.1** | Network controls | Bon | HTTPS/TLS 1.3, Cloudflare WAF | RAS | — | — | 0h |
| **A.13.2** | Security of network services | Bon | Cloudflare managed, GitHub managed | Revue annuelle SLA providers | P2 | CTO | 4h |
| **A.13.3** | Segregation in networks | N/A | Pas de réseau interne (cloud-native) | RAS | — | — | 0h |
| **A.13.4** | Network connection control | Bon | API rate limiting Cloudflare | RAS | — | — | 0h |
| **A.13.5** | Confidentiality or non-disclosure agreements | (doublon A.6.6) | — | — | — | — | 0h |
| **A.13.6** | Electronic messaging | Absent | Emails équipe non chiffrés (Gmail standard) | Policy email sécurisé : S/MIME ou PGP pour données >Confidential | P2 | IT | 12h |
| **A.13.7** | Messaging security | Partiel | Slack standard, pas E2E | Migration Slack Enterprise (retention policies, eDiscovery) ou Matrix E2E | P2 | IT | 16h |

**Statut domaine A.13 :** 65% conforme  
**Total effort A.13 :** 32h

---

### A.14 System Acquisition, Development and Maintenance (13 contrôles)

| Contrôle | Exigence | État actuel | Gap | Action requise | Priorité | Owner | Effort |
|----------|----------|-------------|-----|----------------|----------|-------|--------|
| **A.14.1** | Information security requirements analysis and specification | Partiel (BMAD workflows) | Pas de threat modeling systématique | Intégrer threat modeling phase Design (STRIDE/DREAD) | P1 | CTO | 24h |
| **A.14.2** | Securing application services on public networks | Bon | Cloudflare WAF, HTTPS, CSP headers | RAS | — | — | 0h |
| **A.14.3** | Protecting application services transactions | Bon | JWT signatures Ed25519, HTTPS | RAS | — | — | 0h |
| **A.14.4** | Information in development and support processes | Absent | Données prod utilisées en dev (anonymisation manquante) | Process anonymisation données test, interdiction prod en dev | **P0** | Dev | 32h |
| **A.14.5** | Secure system engineering principles | Bon | SOLID, Clean Architecture, règles sécurité | RAS | — | — | 0h |
| **A.14.6** | Secure development environment | Bon | Branch protection, code review, CI SAST | Ajouter SCA (Software Composition Analysis) Snyk/OWASP Dependency-Check | P1 | Dev | 12h |
| **A.14.7** | Outsourced development | N/A | Pas de dev externalisé actuellement | Policy dev tiers si nécessaire futur (NDA, code ownership, audit) | P2 | CTO | 8h |
| **A.14.8** | System security testing | Partiel (tests unitaires, Vitest) | Pas de pentest, pas de DAST | Pentest annuel externe (€5-10K), DAST CI (OWASP ZAP) | P1 | CTO | 40h |
| **A.14.9** | System acceptance testing | Bon | QA recette BMAD | RAS | — | — | 0h |
| **A.14.10** | Principles of engineering secure systems | Bon | Defense in depth, least privilege | RAS | — | — | 0h |
| **A.14.11** | Secure development policy | Absent | Pas de SDL (Secure Development Lifecycle) formalisé | Rédiger SDL : threat model, SAST/DAST, code review sécurité, pentest | **P0** | CTO | 24h |
| **A.14.12** | Change control procedures | Bon | GitHub PR, CI/CD | RAS | — | — | 0h |
| **A.14.13** | Technical review of applications after operating platform changes | Absent | Pas de revue post-upgrade framework majeur | Checklist revue sécurité post-upgrade (ex: Symfony 8→9) | P1 | CTO | 8h |

**Statut domaine A.14 :** 50% conforme  
**Total effort A.14 :** 148h

---

### A.15 Supplier Relationships (5 contrôles)

| Contrôle | Exigence | État actuel | Gap | Action requise | Priorité | Owner | Effort |
|----------|----------|-------------|-----|----------------|----------|-------|--------|
| **A.15.1** | Information security policy for supplier relationships | Absent | Pas de politique fournisseurs formalisée | Rédiger Supplier Management Policy (voir `policies/supplier-management.md`) | **P0** | CTO | 16h |
| **A.15.2** | Addressing security within supplier agreements | Partiel (ToS standards) | Clauses sécurité manquantes contrats (SLA, notification breach, audit rights) | Template contrat fournisseur : SLA, DPA RGPD, notification <24h, audit right annuel | **P0** | Legal | 24h |
| **A.15.3** | Information and communication technology supply chain | Absent | Supply chain non auditée (npm packages, GitHub Actions) | SBOM automatique, scan CVE dependencies (Trivy), pinning versions | **P0** | Dev | 32h |
| **A.15.4** | Monitoring and review of supplier services | Absent | Pas de revue fournisseurs critiques | Revue annuelle : Anthropic, GitHub, Cloudflare, Stripe (conformité, SLA, incidents) | **P0** | CTO | 8h/an |
| **A.15.5** | Managing changes to supplier services | Absent | Pas de notification changements fournisseurs | Process suivi changements (ex: Anthropic API breaking changes), impact assessment | P1 | Dev | 12h |

**Statut domaine A.15 :** 15% conforme  
**Total effort A.15 :** 92h

---

### A.16 Information Security Incident Management (7 contrôles)

| Contrôle | Exigence | État actuel | Gap | Action requise | Priorité | Owner | Effort |
|----------|----------|-------------|-----|----------------|----------|-------|--------|
| **A.16.1** | Responsibilities and procedures | Absent | Pas d'IRP (Incident Response Plan) | Rédiger IRP (voir `policies/incident-response.md`), CSIRT team | **P0** | CTO | 32h |
| **A.16.2** | Reporting information security events | Absent | Pas de canal reporting incidents sécurité | Canal dédié Slack #security-incidents, email security@, on-call rotation | **P0** | IT | 8h |
| **A.16.3** | Reporting information security weaknesses | Absent | Pas de process vulnerability disclosure | Programme bug bounty (HackerOne/Intigriti) ou security.txt | P1 | CTO | 16h |
| **A.16.4** | Assessment of and decision on information security events | Absent | Pas de classification incidents (Sev1-4) | Grille classification, escalation matrix, SLA réponse | **P0** | CTO | 8h |
| **A.16.5** | Response to information security incidents | Absent | Playbooks manquants | Playbooks : data breach, ransomware, DDoS, supply chain (voir IRP) | **P0** | CTO | 40h |
| **A.16.6** | Learning from information security incidents | Absent | Pas de post-mortem systématique | Template post-mortem blameless, partage learnings public sanitisé | P1 | CTO | 8h |
| **A.16.7** | Collection of evidence | Absent | Pas de procédure forensics | Process chain of custody, conservation logs incidents 3 ans, partenariat forensics | P1 | CTO | 16h |

**Statut domaine A.16 :** 0% conforme  
**Total effort A.16 :** 128h

---

### A.17 Information Security Aspects of Business Continuity Management (4 contrôles)

| Contrôle | Exigence | État actuel | Gap | Action requise | Priorité | Owner | Effort |
|----------|----------|-------------|-----|----------------|----------|-------|--------|
| **A.17.1** | Planning information security continuity | Absent | Pas de BCP/DRP formalisé | Rédiger BCP/DRP (voir `policies/business-continuity.md`), BIA | **P0** | CTO | 40h |
| **A.17.2** | Implementing information security continuity | Absent | Pas de tests DR | DR drill annuel complet, restoration tests trimestriels | **P0** | CTO | 16h + 8h/an |
| **A.17.3** | Verify, review and evaluate information security continuity | Absent | Pas de revue BCP/DRP | Revue annuelle BCP/DRP, mise à jour post-incidents majeurs | P1 | CTO | 4h/an |
| **A.17.4** | Information and communication technology readiness for business continuity | Partiel | Backups Git, mais RTO/RPO non définis | Définir RTO/RPO par fonction (ex: RTO 4h release, RPO 1h code), tester | **P0** | CTO | 24h |

**Statut domaine A.17 :** 10% conforme  
**Total effort A.17 :** 80h

---

### A.18 Compliance (8 contrôles)

| Contrôle | Exigence | État actuel | Gap | Action requise | Priorité | Owner | Effort |
|----------|----------|-------------|-----|----------------|----------|-------|--------|
| **A.18.1** | Identification of applicable legislation and contractual requirements | Partiel (RGPD connu) | Pas d'inventaire obligations légales complet (RGPD, ePrivacy, NIS2 si SaaS, DORA si fintech) | Registre compliance : lois applicables, échéances, responsables | **P0** | Legal | 16h |
| **A.18.2** | Intellectual property rights | Bon | Licenses open-source MIT trackées | Audit licenses dependencies (FOSSA/BlackDuck), pas de GPL contaminant | P1 | Dev | 12h |
| **A.18.3** | Protection of records | Absent | Pas de politique rétention données | Data retention policy : logs 1 an, contrats 10 ans, données personnelles minimisation | P1 | Legal | 16h |
| **A.18.4** | Privacy and protection of personally identifiable information | Partiel (RGPD basique) | DPIA manquante, registre traitements incomplet | DPIA traitements à risque (analytics, emails), registre RGPD complet, DPO désigné | **P0** | Legal | 32h |
| **A.18.5** | Regulation of cryptographic controls | Bon | Pas de contraintes export (France/EU) | RAS | — | — | 0h |
| **A.18.6** | Independent review of information security | Absent | Pas d'audit interne indépendant | Audit interne annuel ISMS (consultant externe ou audit croisé si multi-produits) | P1 | CTO | 8h/an |
| **A.18.7** | Compliance with security policies and standards | Absent | Pas de monitoring conformité policies | Dashboard conformité (ex: compliance-as-code Vanta/Drata), KPIs trimestriels | P1 | CTO | 24h |
| **A.18.8** | Technical compliance review | Absent | Pas de scan compliance automatique | Scans CIS benchmarks, STIGs (si applicable), pentest annuel | P1 | CTO | 16h |

**Statut domaine A.18 :** 25% conforme  
**Total effort A.18 :** 124h

---

## Registre des Risques (Risk Treatment Plan)

### Méthodologie

**Calcul risque :** Probabilité (1-5) × Impact (1-5) = Score (1-25)

| Score | Niveau | Action |
|-------|--------|--------|
| 20-25 | Critique | Traiter immédiatement (P0) |
| 15-19 | Élevé | Traiter sous 30j (P1) |
| 10-14 | Moyen | Traiter sous 90j (P1-P2) |
| 5-9 | Faible | Accepter ou traiter opportunément (P2) |
| 1-4 | Très faible | Accepter |

---

### 15 Risques Majeurs Identifiés

| ID | Risque | Probabilité | Impact | Score | Traitement | Owner | Statut |
|----|--------|-------------|--------|-------|------------|-------|--------|
| **R01** | Perte accès compte GitHub organization (single point of failure) | 2 | 5 | **10** | Backup owners multiples (3 admins), MFA hardware keys, recovery codes vault | CTO | P1 |
| **R02** | Compromission supply chain (npm package malveillant) | 3 | 5 | **15** | SBOM auto, Trivy scans, pinning versions, audit manual packages critiques | Dev | **P0** |
| **R03** | Data breach données utilisateurs Claude Craft (emails, usage stats) | 2 | 5 | **10** | Chiffrement at rest, access control strict Posthog/Sentry, DPIA, notification CNIL <72h | CTO | **P0** |
| **R04** | Indisponibilité service Anthropic API (impact releases Claude Craft) | 3 | 4 | **12** | Monitoring SLA Anthropic, fallback docs offline, communication proactive users | CTO | P1 |
| **R05** | Absence IRP → délai réponse incident inacceptable (>48h) | 4 | 4 | **16** | Rédiger IRP, CSIRT team, on-call rotation, exercices trimestriels | CTO | **P0** |
| **R06** | Secrets hardcodés code (leak API keys GitHub public) | 2 | 4 | **8** | GitLeaks CI, pre-commit hooks, scan historique Git, rotation post-leak | Dev | P1 |
| **R07** | Perte données absence backups (Posthog analytics historique) | 2 | 3 | **6** | Backup 3-2-1 Posthog, export mensuel, tests restoration | Dev | P1 |
| **R08** | Non-conformité RGPD (absence DPIA, DPO) → sanction CNIL | 3 | 5 | **15** | Désigner DPO, DPIA traitements, registre RGPD, formation équipe | Legal | **P0** |
| **R09** | Vulnérabilité critique dependency non patchée (log4shell-like) | 3 | 4 | **12** | Dependabot auto-merge patch, SLA 7j CVE critiques, monitoring NVD | Dev | P1 |
| **R10** | Accès non autorisé repos privés (ex-employé accès persistant) | 2 | 4 | **8** | Offboarding SLA 1h, revue trimestrielle comptes, PAM | IT | P1 |
| **R11** | Ransomware laptop employé → propagation réseau cloud | 2 | 4 | **8** | EDR laptops (CrowdStrike/SentinelOne si budget), formation phishing, backups immutables | IT | P2 |
| **R12** | Fournisseur critique cesse activité (ex: Posthog shutdown) | 1 | 3 | **3** | Exit strategy fournisseurs critiques, export données régulier, alternatives identifiées | CTO | Accepter |
| **R13** | Pentest révèle vulnérabilités critiques (SQLi, RCE) | 3 | 5 | **15** | Pentest annuel externe, SAST/DAST CI, bug bounty, remediation <30j | CTO | P1 |
| **R14** | Absence formation sécurité équipe → erreur humaine (phishing) | 4 | 3 | **12** | Programme formation 8h/an, simulations phishing trimestrielles, KPIs awareness | CTO | P1 |
| **R15** | Échec audit ISO 27001 Stage 2 (gaps non corrigés) | 2 | 5 | **10** | Gap analysis complète (ce doc), plan action 6 mois, audit interne pré-certification | CTO | **P0** |

---

## Plan de Formation Sensibilisation Sécurité

### Objectif

**8h/an obligatoires** pour tous les employés (dev, product, marketing, support).

### 12 Modules (30-45min chacun)

| # | Module | Contenu | Durée | Fréquence | Owner |
|---|--------|---------|-------|-----------|-------|
| **M1** | Security Fundamentals | CIA triad, threat landscape 2026, responsabilités individuelles | 45min | Onboarding | CTO |
| **M2** | Password & MFA Best Practices | Password managers, MFA types, phishing résistant (hardware keys) | 30min | Onboarding | IT |
| **M3** | Phishing & Social Engineering | Exemples réels, red flags, reporting, simulations | 45min | Trimestriel | IT |
| **M4** | Data Classification & Handling | Public/Internal/Confidential/Restricted, labeling, transfert sécurisé | 30min | Onboarding | CTO |
| **M5** | Secure Development (devs) | OWASP Top 10, SAST/DAST, secrets management, code review sécurité | 60min | Annuel | CTO |
| **M6** | RGPD & Privacy | Principes RGPD, droits utilisateurs, DPIA, minimisation données | 45min | Onboarding | Legal |
| **M7** | Incident Response | Reconnaître incident, escalation, IRP, post-mortem | 30min | Annuel | CTO |
| **M8** | Supply Chain Security | Risques npm/GitHub Actions, SBOM, pinning, audit licenses | 30min | Annuel (devs) | Dev |
| **M9** | Remote Work Security | VPN, WiFi public, clear desk, device management | 30min | Onboarding | HR |
| **M10** | Access Control & Least Privilege | Permissions, PAM, offboarding, revue comptes | 30min | Annuel | IT |
| **M11** | Business Continuity | BCP/DRP, backups, DR drill, communication crise | 30min | Annuel | CTO |
| **M12** | Compliance & Policies | ISO 27001, SOC 2, policies ISMS, sanctions non-conformité | 30min | Annuel | Legal |

### KPIs Formation

- **Complétude :** 100% employés formés M1-M4 onboarding (SLA 30j embauche)
- **Phishing simulations :** Taux clic <5% (baseline 15-25%), amélioration trimestrielle
- **Incidents sécurité :** Réduction 50% incidents humains année 1
- **Attestations :** Signature attestation formation annuelle (compliance ISO 27001 A.6.3)

---

## Choix Cabinet Audit Externe

### Critères Sélection

| Critère | Exigence | Poids |
|---------|----------|-------|
| **Accréditation** | COFRAC ISO 27001, SOC 2 attesté | Obligatoire |
| **Expérience secteur** | Open-source, SaaS, dev tools | Élevé |
| **Références EU** | ≥5 certifications similaires France/EU derniers 3 ans | Élevé |
| **Prix** | €15-30K budget Stage 1+2 | Moyen |
| **Disponibilité** | Stage 1 juillet 2026, Stage 2 août-sept 2026 | Élevé |
| **Support français** | Auditeurs francophones, docs FR/EN | Moyen |
| **Réputation** | Pas de conflits d'intérêt, indépendance | Obligatoire |

### Short-List 5 Cabinets

| Cabinet | Accréditations | Expérience SaaS | Prix estimé | Contact | Notes |
|---------|----------------|-----------------|-------------|---------|-------|
| **TÜV Rheinland France** | COFRAC ISO 27001, SOC 2 | Élevée (OVHcloud, Scaleway) | €20-25K | certification@tuv.com | Leader EU, process rigoureux |
| **BSI Group France** | COFRAC ISO 27001, SOC 2, Cyber Essentials | Très élevée (Stripe EU, GitLab) | €25-30K | france@bsigroup.com | Standard britannique, reconnu international |
| **Bureau Veritas Certification** | COFRAC ISO 27001, TISAX | Moyenne (industrie, moins SaaS) | €18-22K | cybersecurity@bureauveritas.com | Prix compétitif, expertise variable |
| **DNV France (ex-DNV GL)** | COFRAC ISO 27001, SOC 2, ISO 42001 (AI) | Élevée (startups deep-tech) | €22-28K | certification.france@dnv.com | Spécialisation AI intéressante (Claude Craft use case) |
| **LNE (Laboratoire National de Métrologie et d'Essais)** | COFRAC ISO 27001, ANSSI qualifié | Moyenne (secteur public) | €15-20K | cyber@lne.fr | Organisme public, moins cher, délais plus longs |

**Recommandation :** **DNV France** (expertise AI/SaaS, budget acceptable, accréditations complètes) ou **TÜV Rheinland** (réputation solide, références OVH/Scaleway).

### Email Type Demande Devis

```
Objet : Demande devis certification ISO 27001:2022 + SOC 2 Type II — Claude Craft (SaaS dev tools)

Bonjour,

Nous sommes The Bearded CTO, éditeur de Claude Craft (framework open-source AI-assisted development, 
~5K utilisateurs, pivot SaaS en cours). Nous souhaitons obtenir les certifications ISO 27001:2022 
et SOC 2 Type II pour adresser marchés enterprise/publics EU.

Contexte :
- Périmètre : développement logiciel, infrastructure cloud (GitHub, Cloudflare, AWS), données 
  utilisateurs (emails, analytics)
- Effectif : 8 personnes (5 devs, 1 product, 1 legal, 1 admin)
- Maturité sécurité : ISMS basique, gap analysis interne réalisée (~45% conformité actuelle)
- Timeline souhaitée : Stage 1 juillet 2026, Stage 2 août-septembre 2026

Demande :
- Devis Stage 1 + Stage 2 ISO 27001:2022
- Devis additionnel SOC 2 Type II (si combinable)
- Méthodologie audit, planning type, livrables
- Références certifications similaires (SaaS/dev tools France/EU)

Budget indicatif : €15-30K (flexible selon scope).

Disponible pour appel préliminaire (présentation Claude Craft, questions périmètre).

Cordialement,
[CTO Name]
The Bearded CTO
cto@thebeardedcto.com
```

---

## Timeline 6 Mois Certification

### Vue d'ensemble

| Phase | Période | Activités | Livrables | Owner | Effort |
|-------|---------|-----------|-----------|-------|--------|
| **M1 — Gap Analysis** | Avril 2026 | Audit interne Annex A, ce document, priorisation actions | Gap analysis finalisée, risk treatment plan, plan formation | CTO | 80h |
| **M2-M3 — Mise en conformité** | Mai-Juin 2026 | Implémentation contrôles P0/P1, rédaction policies ISMS, formation équipe | 6 policies rédigées, contrôles P0 déployés, 100% équipe formée M1-M4 | CTO+équipe | 400h |
| **M4 — Stage 1 Audit** | Juillet 2026 | Documentation review auditeur externe, correction non-conformités mineures | Rapport Stage 1, liste non-conformités, plan correctif | Auditeur+CTO | 40h |
| **M5-M6 — Stage 2 + Certification** | Août-Sept 2026 | Audit terrain, tests efficacité contrôles, entretiens équipe, correction findings | Certificat ISO 27001:2022 (si succès), rapport final | Auditeur+CTO | 60h |

### Détail M1 — Gap Analysis (Avril 2026)

**Semaine 1-2 :**
- Audit auto-évaluation 93 contrôles Annex A
- Revue documentation existante (BMAD, rules, repos)
- Entretiens équipe (responsabilités sécurité actuelles)

**Semaine 3 :**
- Rédaction gap analysis (ce document)
- Identification 15 risques majeurs
- Priorisation actions (P0/P1/P2)

**Semaine 4 :**
- Validation gap analysis CTO+Legal
- Sélection cabinet audit (demandes devis, short-list)
- Planification phases M2-M6

**Livrable M1 :** Ce document finalisé, approuvé, communiqué équipe.

---

### Détail M2-M3 — Mise en Conformité (Mai-Juin 2026)

**Actions P0 (obligatoires avant Stage 1) :**

| Action | Effort | Owner | Deadline |
|--------|--------|-------|----------|
| Rédiger Information Security Policy | 16h | CTO | 15 mai |
| Rédiger Access Control Policy | 16h | CTO | 20 mai |
| Rédiger Incident Response Plan | 32h | CTO | 25 mai |
| Rédiger Supplier Management Policy | 16h | CTO | 30 mai |
| Rédiger Business Continuity Plan | 40h | CTO | 5 juin |
| Rédiger Crypto Policy | 16h | CTO | 10 juin |
| Déployer PAM (Privileged Access Management) | 40h | IT | 15 juin |
| Rotation secrets 90j + GitLeaks CI | 24h | Dev | 20 juin |
| Revue trimestrielle comptes (première itération) | 8h | IT | 25 juin |
| Offboarding SLA 1h (process + tooling) | 12h | IT | 25 juin |
| Backup 3-2-1 Posthog/Sentry | 16h | Dev | 28 juin |
| SBOM automatique + Trivy scans | 32h | Dev | 30 juin |
| Anonymisation données test (interdiction prod en dev) | 32h | Dev | 30 juin |
| Registre compliance RGPD (DPIA, DPO désigné) | 32h | Legal | 30 juin |
| Formation équipe M1-M4 (100% complétude) | 40h | CTO+IT | 30 juin |

**Total effort P0 :** ~372h (~9 semaines ETP, distribué sur équipe 5 dev + CTO + IT + Legal)

**Livrable M2-M3 :** 6 policies formalisées, contrôles P0 opérationnels, attestations formation équipe, runbooks IRP/BCP/DRP testés.

---

### Détail M4 — Stage 1 Audit (Juillet 2026)

**Objectif Stage 1 :** Documentation review, vérifier policies ISMS existent et sont alignées ISO 27001.

**Déroulé type (3-4 jours sur site ou remote) :**

**Jour 1 :**
- Présentation scope ISMS (périmètre Claude Craft, infrastructure, équipe)
- Revue Information Security Policy, Risk Treatment Plan
- Revue organisation sécurité (rôles CISO/DPO, RACI matrix)

**Jour 2 :**
- Revue policies Access Control, Incident Response, Supplier Management
- Revue Asset Management (inventaire assets, classification données)
- Revue Cryptography Policy

**Jour 3 :**
- Revue Business Continuity Plan, DR tests
- Revue Compliance (registre RGPD, obligations légales)
- Entretiens échantillon équipe (connaissance policies, formation)

**Jour 4 :**
- Synthèse findings, non-conformités identifiées
- Présentation rapport Stage 1 préliminaire
- Plan correctif, timeline Stage 2

**Livrables Stage 1 :**
- Rapport audit Stage 1 (non-conformités majeures/mineures, observations)
- Liste actions correctives requises avant Stage 2
- Approbation passage Stage 2 (si pas de non-conformité majeure bloquante)

**Effort interne :** ~40h (préparation dossier, disponibilité équipe, correction findings).

---

### Détail M5-M6 — Stage 2 + Certification (Août-Septembre 2026)

**Objectif Stage 2 :** Audit terrain, vérifier efficacité contrôles, tests techniques, entretiens équipe.

**Déroulé type (5-7 jours sur site ou remote) :**

**Semaine 1 (3j) :**
- Tests techniques : scan vulnérabilités, revue config infra (Cloudflare, GitHub)
- Tests accès : tentative accès non autorisé, vérification MFA, PAM
- Tests backup/restore : restauration échantillon backup, vérification 3-2-1
- Revue logs : audit trails GitHub, SIEM, incidents sécurité 12 derniers mois

**Semaine 2 (2-4j) :**
- Entretiens équipe étendus (tous dev, product, legal) : connaissance IRP, BCP, policies
- Revue change management : échantillon PRs, approbations, CI/CD
- Revue supplier management : contrats Anthropic/GitHub/Cloudflare, DPA, revue annuelle
- Revue formation : attestations, simulations phishing, KPIs awareness

**Semaine 3 :**
- Synthèse findings, non-conformités (majeures/mineures)
- Présentation rapport Stage 2 préliminaire
- Correction findings urgents (si non-conformités mineures)

**Semaine 4 :**
- Vérification corrections appliquées
- Décision certification (accordée / différée / refusée)
- Délivrance certificat ISO 27001:2022 (si succès)

**Livrables Stage 2 :**
- Rapport audit Stage 2 complet
- Certificat ISO 27001:2022 (validité 3 ans, surveillance annuelle)
- Plan surveillance (audit annuel maintenance certificat)

**Effort interne :** ~60h (disponibilité équipe, tests, correction findings).

---

## Surveillance Post-Certification

### Audits annuels maintenance (Surveillance Audits)

**Fréquence :** 1 fois/an (années 2, 3 post-certification)

**Scope :** ~30% contrôles Annex A revus chaque année (rotation), vérification pas de régression.

**Effort :** ~20h interne/an, €5-8K cabinet externe/an.

**Recertification :** Année 4, audit complet Stage 1+2 à nouveau.

---

## Budget Total Estimé

| Poste | Coût |
|-------|------|
| **Effort interne mise en conformité** | ~480h × €100/h (coût chargé CTO+équipe) = **€48K** |
| **Cabinet audit Stage 1+2** | **€20-25K** (DNV/TÜV) |
| **Formation externe** (si modules externalisés) | €5K (optionnel, modules internes CTO suffisants) |
| **Outils** (PAM, EDR, SIEM open-source) | €3-5K setup + €2K/an SaaS |
| **Pentest externe annuel** | €8K/an (prévoir avant Stage 2) |
| **Total première année** | **€70-85K** |
| **Surveillance annuelle (années 2-3)** | €5-8K cabinet + 20h interne (~€7-10K/an) |

**ROI attendu :**
- Accès marchés enterprise (contrats >€50K/an exigent ISO 27001)
- Conformité RGPD renforcée (réduction risque sanctions CNIL)
- Confiance utilisateurs SaaS (certification affichée site web)
- Réduction risque incidents sécurité (processes formalisés)

---

## Annexes

### Annexe A — Références

- **ISO/IEC 27001:2022** — Information security management systems — Requirements
- **ISO/IEC 27002:2022** — Information security controls (Annex A reference)
- **NIST Cybersecurity Framework 2.0** — Alignment ISO 27001 (optionnel)
- **SOC 2 Trust Services Criteria** — AICPA (si certification combinée)
- **RGPD (GDPR)** — Règlement UE 2016/679
- **NIS 2 Directive** — UE 2022/2555 (si applicable SaaS critique)

### Annexe B — Glossary

| Terme | Définition |
|-------|------------|
| **ISMS** | Information Security Management System — système de gestion sécurité ISO 27001 |
| **Annex A** | Liste 93 contrôles sécurité ISO 27002:2022 (14 domaines A.5 → A.18) |
| **SoA** | Statement of Applicability — déclaration contrôles applicables/non-applicables |
| **RTP** | Risk Treatment Plan — plan traitement risques identifiés |
| **CSIRT** | Computer Security Incident Response Team — équipe réponse incidents |
| **PAM** | Privileged Access Management — gestion accès privilégiés |
| **BCP** | Business Continuity Plan — plan continuité activité |
| **DRP** | Disaster Recovery Plan — plan reprise après sinistre |
| **DPIA** | Data Protection Impact Assessment — analyse impact RGPD |
| **SBOM** | Software Bill of Materials — inventaire composants logiciels |

### Annexe C — Templates Politiques

Voir fichiers séparés :
- `docs/compliance/policies/information-security.md`
- `docs/compliance/policies/access-control.md`
- `docs/compliance/policies/incident-response.md`
- `docs/compliance/policies/business-continuity.md`
- `docs/compliance/policies/supplier-management.md`

### Annexe D — Contacts Cabinets Audit

| Cabinet | Contact principal | Email | Téléphone |
|---------|-------------------|-------|-----------|
| DNV France | Certification Cybersécurité | certification.france@dnv.com | +33 1 55 24 76 00 |
| TÜV Rheinland | Département Certification IT | certification@tuv.com | +33 1 49 01 49 01 |
| BSI Group France | Cybersecurity Lead | france@bsigroup.com | +33 1 55 91 98 98 |
| Bureau Veritas | Cyber & Data Security | cybersecurity@bureauveritas.com | +33 1 42 91 59 00 |
| LNE | Pôle Cybersécurité | cyber@lne.fr | +33 1 40 43 37 00 |

---

## Signatures

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| **CTO** | [À compléter] | 2026-04-15 | ________________ |
| **Legal Counsel** | [À compléter] | 2026-04-15 | ________________ |
| **Auditeur Externe** (post-sélection) | [À compléter] | 2026-05-01 | ________________ |

---

**FIN DU DOCUMENT — DRAFT v1.0.0**

**Prochaines étapes :**
1. Review Legal/CTO (deadline : 22 avril 2026)
2. Sélection cabinet audit (devis comparatifs, décision : 30 avril)
3. Kick-off phase M2 mise en conformité (1er mai 2026)
4. Formation équipe M1-M4 (complétude : 15 mai 2026)
5. Rédaction policies P0 (complétude : 10 juin 2026)
6. Déploiement contrôles techniques P0 (complétude : 30 juin 2026)
7. Stage 1 Audit (juillet 2026)

---

**Contact :** cto@thebeardedcto.com  
**Dernière mise à jour :** 2026-04-15  
**Confidentialité :** Internal — Ne pas diffuser hors équipe sans approbation CTO
