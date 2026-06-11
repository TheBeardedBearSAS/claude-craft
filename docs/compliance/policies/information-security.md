# Information Security Policy (ISP)

**DRAFT — Review Legal/CTO + cabinet audit obligatoire**

**Date :** 2026-04-15  
**Version :** 1.0.0  
**Projet :** Claude Craft v8.1.0  
**Référence :** ISO 27001:2022 A.5.1  
**Owner :** CTO  
**Revue :** Annuelle (avril)  

---

## 1. Objectif

Cette Information Security Policy (ISP) définit l'engagement de The Bearded CTO à protéger la confidentialité, l'intégrité et la disponibilité de toutes les informations et systèmes de Claude Craft.

L'ISP s'applique à tous les employés, contractors, partenaires et fournisseurs ayant accès aux systèmes et données de Claude Craft.

---

## 2. Scope

### 2.1 Périmètre

**Systèmes couverts :**
- Repositories GitHub (github.com/TheBeardedBearSAS/claude-craft)
- Infrastructure cloud (Cloudflare, AWS/GCP si SaaS)
- Services tiers (Anthropic API, Posthog, Sentry, Stripe)
- Devices équipe (laptops, smartphones)
- Communications (email, Slack)

**Données couvertes :**
- Code source Claude Craft (propriété intellectuelle)
- Données utilisateurs (emails, usage analytics, support tickets)
- Secrets (API keys, tokens, credentials)
- Données internes (contrats, finances, RH)

**Personnes concernées :**
- Employés The Bearded CTO (8 personnes : 5 dev, 1 product, 1 legal, 1 admin)
- Contractors (développeurs externes occasionnels)
- Fournisseurs critiques (Anthropic, GitHub, Cloudflare, Stripe)

---

## 3. Principes Fondamentaux

### 3.1 CIA Triad

La sécurité de l'information repose sur trois piliers :

| Principe | Définition | Application Claude Craft |
|----------|------------|--------------------------|
| **Confidentialité** | Seules les personnes autorisées accèdent aux données | Classification données (section 5), access control (A.9), chiffrement (A.10) |
| **Intégrité** | Les données ne sont pas altérées de manière non autorisée | Git signatures commits, branch protection, audit logs |
| **Disponibilité** | Les systèmes et données sont accessibles quand nécessaires | Backups 3-2-1, BCP/DRP (voir `business-continuity.md`), SLA fournisseurs |

### 3.2 Least Privilege

**Principe :** Chaque utilisateur, programme, processus ne dispose que des droits minimums nécessaires à sa fonction.

**Application :**
- Permissions GitHub repos : Read par défaut, Write sur approbation, Admin CTO uniquement
- Accès données analytics (Posthog) : équipe product uniquement
- Secrets management : 1Password vaults segmentés (Dev, Infra, Finance)

### 3.3 Defense in Depth

**Principe :** Sécurité en couches multiples (pas de single point of failure).

**Application :**
- **Authentification :** MFA obligatoire (TOTP + hardware keys admin)
- **Réseau :** Cloudflare WAF + rate limiting
- **Application :** OWASP Top 10 mitigations, CSP headers, input validation
- **Données :** Chiffrement at rest + in transit (TLS 1.3)
- **Humain :** Formation sensibilisation, simulations phishing

### 3.4 Separation of Duties

**Principe :** Aucune personne ne doit avoir contrôle complet sur un processus critique.

**Application :**
- Release production : developer + reviewer + approval CTO (3 personnes)
- Accès financier Stripe : admin legal + CTO dual approval transactions >€5K
- Modification policies ISMS : rédaction CTO + approbation legal

---

## 4. Engagement Direction

**The Bearded CTO s'engage à :**

1. **Allouer les ressources** nécessaires à la sécurité de l'information (budget, temps, formation)
2. **Désigner un responsable sécurité** (CTO assume rôle CISO jusqu'à 20 personnes)
3. **Respecter les obligations légales** (RGPD, ePrivacy, NIS 2 si applicable)
4. **Réviser annuellement** cette politique et l'ISMS complet
5. **Communiquer** cette politique à tous les employés et contractors
6. **Sanctionner** les violations graves (voir section 8)

**Signature :**

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| **CEO / CTO** | [À compléter] | 2026-04-15 | ________________ |

---

## 5. Classification des Données

### 5.1 Niveaux de Classification

| Niveau | Définition | Exemples Claude Craft | Handling |
|--------|------------|------------------------|----------|
| **Public** | Information destinée au public, aucun impact si divulguée | Documentation Claude Craft publique (docs.claude-craft.com), blog posts, releases notes | Libre diffusion |
| **Internal** | Information usage interne, impact faible si divulguée | Roadmap produit interne, analytics agrégées, specs techniques internes | Partage équipe uniquement, NDA contractors |
| **Confidential** | Information sensible, impact moyen si divulguée | Liste utilisateurs emails, support tickets, contrats clients, finances | Accès restreint (need-to-know), chiffrement transferts, NDA obligatoire |
| **Restricted** | Information critique, impact sévère si divulguée | Secrets API (Anthropic, Stripe), données paiement, vulnérabilités 0-day, données personnelles sensibles (RGPD art. 9) | Accès minimal (dual approval), chiffrement E2E, MFA hardware keys, audit logs |

### 5.2 Labeling

**Obligation :** Toute donnée **Confidential** ou **Restricted** doit être labelée.

**Méthodes :**
- **Fichiers :** Préfixe nom fichier `[CONFIDENTIAL]` ou `[RESTRICTED]`
- **Emails :** Objet commence par `[CONFIDENTIAL]` ou `[RESTRICTED]`
- **Repos GitHub :** Tags `confidential`, `restricted` dans README + repo privé obligatoire
- **Documents Google Drive :** Metadata classification (custom property)

### 5.3 Downgrade / Déclassification

**Process :** Demande écrite au data owner → approbation CTO → mise à jour labels.

**Exemple :** Vulnerability report Restricted (0-day) → Public après patch déployé + 90 jours.

---

## 6. Rôles et Responsabilités

### 6.1 RACI Matrix

| Responsabilité | CTO (CISO) | Legal (DPO) | Dev Lead | IT Admin | Employés |
|----------------|-----------|-------------|----------|----------|----------|
| **Définir policies ISMS** | **R** | **A** | C | C | I |
| **Implémenter contrôles techniques** | A | I | **R** | **R** | I |
| **Formation sensibilisation sécurité** | **R/A** | C | C | C | **I** (participants) |
| **Incident response (IRP)** | **A** | C | **R** | **R** | I (reporting) |
| **Compliance RGPD (DPIA, registre)** | C | **R/A** | C | I | I |
| **Revue accès trimestrielle** | A | I | C | **R** | I |
| **Risk assessment annuel** | **R/A** | C | C | C | I |
| **Audit interne/externe** | **R/A** | C | C | C | I (disponibilité) |

**Légende :** R = Responsible (exécute), A = Accountable (approuve), C = Consulted (avis), I = Informed (informé)

### 6.2 Rôles Spécifiques

#### CTO (Chief Technology Officer) — CISO par intérim

**Responsabilités sécurité :**
- Définir et maintenir l'ISMS (ISO 27001)
- Approuver policies sécurité
- Gérer incidents sécurité critiques (Incident Commander)
- Superviser audits sécurité (internes/externes)
- Allouer budget sécurité
- Reporting risques sécurité à la direction

**Succession :** Si équipe >20 personnes, recruter CISO dédié.

#### Legal Counsel — DPO (Data Protection Officer)

**Responsabilités RGPD :**
- Tenir registre traitements RGPD
- Réaliser DPIA (Data Protection Impact Assessments)
- Liaison CNIL (notifications breaches <72h)
- Répondre demandes droits utilisateurs (RGPD art. 15-22)
- Revue contrats fournisseurs (DPA, clauses RGPD)

**Indépendance :** Rapporte au CEO, pas de conflit d'intérêt avec objectifs business.

#### Dev Lead — Security Champion

**Responsabilités développement sécurisé :**
- Appliquer OWASP Top 10 mitigations
- Code review sécurité (validation inputs, gestion secrets)
- Maintenir SBOM (Software Bill of Materials)
- Gérer Dependabot alerts, patching CVE
- Implémenter SAST/DAST CI/CD

#### IT Admin — Infrastructure Security

**Responsabilités infrastructure :**
- Provisionning/deprovisionning comptes (SLA 1h offboarding)
- Gestion MFA, PAM (Privileged Access Management)
- Monitoring logs sécurité (SIEM)
- Backup/restore tests trimestriels
- Hardening configurations (CIS benchmarks)

#### Tous Employés

**Responsabilités individuelles :**
- Respecter policies sécurité (ISP, Access Control, Acceptable Use)
- Compléter formation sensibilisation 8h/an
- Utiliser password manager (1Password) + MFA
- Reporter incidents sécurité sous 1h (#security-incidents Slack ou security@the-bearded-bear.com)
- Protéger devices (antivirus, mises à jour, chiffrement disque)

---

## 7. Obligations Légales et Réglementaires

### 7.1 RGPD (Règlement Général sur la Protection des Données)

**Applicabilité :** Claude Craft traite données personnelles utilisateurs EU (emails, analytics).

**Obligations :**
- **Licéité traitement :** Consentement ou intérêt légitime (analytics produit)
- **Minimisation données :** Collecter uniquement données nécessaires
- **Droit accès/rectification/suppression :** Répondre sous 30j
- **Notification breach :** CNIL <72h si risque utilisateurs (voir `incident-response.md`)
- **DPIA :** Obligatoire si traitement à haut risque (ex: analytics comportementales détaillées)
- **DPO :** Désigné (Legal Counsel)

**Sanctions :** Jusqu'à 4% CA mondial ou €20M (maximum des deux).

### 7.2 ePrivacy Directive (EU)

**Applicabilité :** Cookies analytics site web Claude Craft.

**Obligations :**
- Consentement explicite cookies non-essentiels (analytics Posthog)
- Banner cookies conforme (opt-in avant chargement trackers)

### 7.3 NIS 2 Directive (Network and Information Security)

**Applicabilité potentielle :** Si Claude Craft devient service numérique essentiel (>50 employés, CA >€10M).

**Obligations :**
- Mesures techniques sécurité (ISO 27001 couvre majoritairement)
- Notification incidents cyber ANSSI <24h
- Audits sécurité réguliers

**Statut actuel :** Non applicable (sous seuils), surveiller croissance.

### 7.4 DORA (Digital Operational Resilience Act)

**Applicabilité :** Si Claude Craft fournit services ICT à entités financières EU.

**Obligations :**
- Tests résilience opérationnelle
- Gestion risques tiers ICT

**Statut actuel :** Non applicable, surveiller si clients banques/assurances.

### 7.5 AI Act (Règlement IA EU 2024)

**Applicabilité :** Claude Craft utilise Anthropic API (modèles IA), potentiellement système IA "à risque limité".

**Obligations :**
- Transparence utilisation IA (disclosure utilisateurs)
- Documentation modèles utilisés (Anthropic Claude 4.6)

**Statut actuel :** Risque limité, obligations légères (transparence).

---

## 8. Communication et Formation

### 8.1 Communication Politique

**Méthodes :**
- **Onboarding :** ISP communiquée J1, signature attestation lecture obligatoire
- **Annuelle :** Email rappel policies + lien ISP actualisée
- **Modifications :** Notification équipe sous 7j, changelog policies publié

**Accessibilité :** ISP disponible 24/7 sur intranet (Google Drive Internal folder) et repos GitHub privé `.claude/compliance/`.

### 8.2 Formation Obligatoire

**Programme :** 8h/an tous employés (voir `ISO27001-GAP-ANALYSIS.md` section Formation, 12 modules).

**Modules obligatoires onboarding :**
- M1 — Security Fundamentals (45min)
- M2 — Password & MFA Best Practices (30min)
- M3 — Phishing & Social Engineering (45min)
- M4 — Data Classification & Handling (30min)

**Tracking :** Attestations formation signées, conservées RH 3 ans.

**KPI :** 100% complétude M1-M4 onboarding sous 30j embauche.

### 8.3 Sensibilisation Continue

**Méthodes :**
- Simulations phishing trimestrielles (objectif taux clic <5%)
- Newsletter sécurité mensuelle (tips, incidents publics récents, updates policies)
- Lunch & Learn sécurité semestriel (1h, présentation CTO)

---

## 9. Sanctions Non-Conformité

### 9.1 Principes

**Culture blameless :** Erreurs involontaires → formation renforcée, pas sanction.

**Violations intentionnelles :** Sanctions graduées selon gravité.

### 9.2 Grille Sanctions

| Gravité | Exemples | Sanction 1ère occurrence | Sanction récidive |
|---------|----------|--------------------------|-------------------|
| **Mineure** | Oubli MFA 1 fois, password faible détecté, email non chiffré données Confidential | Rappel écrit, formation complémentaire | Avertissement formel |
| **Moyenne** | Partage credentials, installation logiciel non autorisé, données Confidential exposées accidentellement | Avertissement formel, suspension privilèges 7j | Mise à pied 3j |
| **Grave** | Exfiltration données intentionnelle, contournement contrôles sécurité, non-report incident critique | Mise à pied, rétrogradation, ou licenciement | Licenciement pour faute grave |
| **Critique** | Sabotage, vol données, complicité attaque externe | Licenciement immédiat, poursuites pénales | N/A |

### 9.3 Process Disciplinaire

1. **Constatation violation :** Rapport incident sécurité (voir `incident-response.md`)
2. **Investigation :** CTO + Legal (délai 5j ouvrés)
3. **Audition employé :** Droit être assisté (délégué personnel, avocat)
4. **Décision :** CTO + HR (notification écrite sous 7j)
5. **Recours :** Appel possible sous 15j (CEO arbitre)

**Documentation :** Dossier disciplinaire conservé RH, confidentiel.

---

## 10. Revue et Amendements

### 10.1 Revue Annuelle

**Calendrier :** Avril chaque année (aligné timeline ISO 27001 surveillance audit).

**Processus :**
1. **Review CTO + Legal :** Vérifier conformité réglementation actuelle, retours incidents année écoulée
2. **Consultation équipe :** Feedback policies applicabilité, suggestions améliorations
3. **Mise à jour :** Amendements si nécessaires (section 10.2)
4. **Approbation :** CEO/CTO signature nouvelle version
5. **Communication :** Équipe notifiée, nouvelle version publiée

**Déclencheurs revue extraordinaire :**
- Incident sécurité majeur (data breach)
- Nouvelle réglementation applicable (ex: NIS 2 seuils atteints)
- Audit externe recommandations
- Changement organisationnel (acquisition, pivot SaaS)

### 10.2 Processus Amendements

**Proposition amendement :**
- Tout employé peut proposer (email CTO)
- CTO évalue sous 15j (accepter / rejeter / étudier)

**Approbation :**
- Amendements mineurs (typo, clarification) : CTO approuve seul
- Amendements majeurs (changement scope, nouveaux contrôles) : CTO + Legal + CEO

**Versioning :**
- Format `MAJOR.MINOR.PATCH` (ex: 1.0.0 → 1.1.0 amendement mineur)
- Changelog tenu dans header document

**Notification :**
- Amendements mineurs : email équipe, lien changelog
- Amendements majeurs : réunion all-hands, signature attestation lecture si changement obligations employés

---

## 11. Références

### 11.1 Politiques Associées

- **Access Control Policy** — `docs/compliance/policies/access-control.md` (ISO 27001 A.9)
- **Incident Response Plan** — `docs/compliance/policies/incident-response.md` (ISO 27001 A.16)
- **Business Continuity Plan** — `docs/compliance/policies/business-continuity.md` (ISO 27001 A.17)
- **Supplier Management Policy** — `docs/compliance/policies/supplier-management.md` (ISO 27001 A.15)
- **Cryptography Policy** — Section 10 Gap Analysis (ISO 27001 A.10)

### 11.2 Standards et Réglementations

- **ISO/IEC 27001:2022** — Information security management systems
- **ISO/IEC 27002:2022** — Information security controls
- **RGPD (GDPR)** — Règlement UE 2016/679
- **NIS 2 Directive** — UE 2022/2555
- **OWASP Top 10:2025** — Web application security risks
- **NIST Cybersecurity Framework 2.0** — US framework (référence facultative)

### 11.3 Documents Internes

- **ISO 27001 Gap Analysis** — `docs/compliance/ISO27001-GAP-ANALYSIS.md`
- **Risk Treatment Plan** — Section Registre Risques Gap Analysis
- **SBOM (Software Bill of Materials)** — Généré CI/CD, `.sbom/cyclonedx.json`
- **Asset Inventory** — `docs/compliance/asset-inventory.md` (à créer, A.8.1)

---

## 12. Glossary

| Terme | Définition |
|-------|------------|
| **ISMS** | Information Security Management System — système gestion sécurité ISO 27001 |
| **CIA Triad** | Confidentiality, Integrity, Availability — principes fondamentaux sécurité |
| **MFA** | Multi-Factor Authentication — authentification multi-facteurs |
| **PAM** | Privileged Access Management — gestion accès privilégiés |
| **DPO** | Data Protection Officer — délégué protection données RGPD |
| **DPIA** | Data Protection Impact Assessment — analyse impact vie privée RGPD |
| **SBOM** | Software Bill of Materials — inventaire composants logiciels |
| **SAST** | Static Application Security Testing — analyse code statique |
| **DAST** | Dynamic Application Security Testing — tests sécurité dynamiques |
| **CVE** | Common Vulnerabilities and Exposures — base vulnérabilités publiques |

---

## 13. Approbation

**Version :** 1.0.0  
**Date création :** 2026-04-15  
**Prochaine revue :** 2027-04-15  

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| **Rédaction** | CTO | 2026-04-15 | ________________ |
| **Revue Legal** | Legal Counsel (DPO) | 2026-04-__ | ________________ |
| **Approbation** | CEO / CTO | 2026-04-__ | ________________ |

---

## Annexe A — Attestation Lecture Employé

**Je soussigné(e), [NOM PRÉNOM], [POSTE], certifie avoir lu, compris et m'engage à respecter l'Information Security Policy de The Bearded CTO version 1.0.0.**

**Date :** _______________  
**Signature :** _______________

**À retourner HR sous 7j onboarding ou notification nouvelle version.**

---

**FIN DU DOCUMENT — DRAFT v1.0.0**

**Contact :** cto@the-bearded-bear.com  
**Confidentialité :** Internal — Diffusion équipe uniquement
