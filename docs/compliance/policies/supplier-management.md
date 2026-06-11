# Supplier Management Policy

**DRAFT — Review Legal/CTO + cabinet audit obligatoire**

**Date :** 2026-04-15  
**Version :** 1.0.0  
**Projet :** Claude Craft v8.1.0  
**Référence :** ISO 27001:2022 A.15  
**Owner :** CTO  
**Revue :** Annuelle (avril)  

---

## 1. Objectif

Cette Supplier Management Policy définit les processus de sélection, évaluation, contractualisation et surveillance des fournisseurs critiques de Claude Craft, conformément ISO 27001 A.15 (Supplier Relationships) et RGPD (sous-traitants).

**Objectifs :**
- Assurer que les fournisseurs respectent nos exigences de sécurité et confidentialité
- Minimiser les risques supply chain (compromission, indisponibilité, non-conformité RGPD)
- Garantir continuité service via exit strategies documentées

---

## 2. Scope

### 2.1 Fournisseurs Couverts

**Critères inclusion :**
- Accès données utilisateurs Claude Craft (emails, analytics)
- Accès code source propriétaire ou configurations sensibles
- Service critique (downtime >4h impacte opérations)
- Traitement données personnelles (sous-traitant RGPD)

**Fournisseurs actuels (7 critiques) :**

| Fournisseur | Service | Criticité | Données traitées | Certification |
|-------------|---------|-----------|------------------|---------------|
| **Anthropic** | API Claude (LLM) | Critique | Prompts utilisateurs (éphémères, pas stockés Anthropic selon ToS) | SOC 2 Type II |
| **GitHub** | Repos code, CI/CD | Critique | Code source, issues, commits | ISO 27001, SOC 2 |
| **Cloudflare** | CDN, DNS, WAF | Critique | Logs trafic (IPs, User-Agents) | ISO 27001, SOC 2 |
| **Stripe** | Paiements (si SaaS) | Haute | Données paiement (cartes, emails clients) | PCI DSS Level 1, SOC 2 |
| **Posthog** | Analytics produit | Haute | Events utilisateurs (commandes, erreurs, anonymisées) | SOC 2 Type II |
| **Sentry** | Monitoring erreurs | Moyenne | Logs erreurs app (stack traces, contexte) | SOC 2 Type II |
| **Google Workspace** | Email, Drive, identité | Haute | Emails équipe, documents internes | ISO 27001, SOC 2 |

**Fournisseurs exclus (hors scope) :**
- Outils dev locaux (IDE, CLI) sans transmission données cloud
- Services gratuits usage faible (<100 req/mois, pas de données sensibles)

---

## 3. Classification Fournisseurs

### 3.1 Niveaux de Risque

| Niveau | Définition | Critères | Exigences Due Diligence |
|--------|------------|----------|-------------------------|
| **Critique** | Indisponibilité >4h bloque opérations, accès données clients | Anthropic, GitHub, Cloudflare | Certification SOC 2/ISO 27001 obligatoire, DPA RGPD, SLA <99.9%, audit annuel, exit strategy |
| **Haute** | Impact significatif opérations, données utilisateurs non-critiques | Stripe, Posthog, Google Workspace | SOC 2 recommandé, DPA RGPD, SLA contractuel, revue annuelle |
| **Moyenne** | Impact modéré, données internes uniquement | Sentry, outils dev (Notion, Slack) | Questionnaire sécurité, ToS review, revue biannuelle |
| **Faible** | Impact négligeable, pas de données sensibles | Outils gratuits, services ponctuels | ToS review basique, pas de due diligence formelle |

### 3.2 Reclassification

**Déclencheurs :**
- Changement usage (ex: Notion Faible → Moyenne si stockage specs confidentielles)
- Incident sécurité fournisseur (downgrade confiance)
- Croissance Claude Craft (dépendance accrue → criticité augmente)

**Process :** CTO revoit classification trimestriellement, reclassifie si critères évoluent, met à jour exigences contractuelles si upgrade criticité.

---

## 4. Processus Sélection Fournisseur

### 4.1 Étapes Sélection (Fournisseur Critique/Haute)

**Phase 1 — Besoin métier (J0) :**
- Équipe identifie besoin (ex: nouvel outil analytics)
- Rédaction cahier charges : fonctionnalités, budget, criticité, données traitées

**Phase 2 — Short-list (J+7) :**
- Identification 3-5 fournisseurs potentiels
- Vérification certifications (SOC 2, ISO 27001, RGPD compliance)
- Lecture ToS, Privacy Policy, SLA publics

**Phase 3 — Due Diligence (J+14) :**
- Envoi questionnaire sécurité (Annexe A)
- Demande certifications (copie SOC 2 report, ISO 27001 certificat)
- Revue DPA (Data Processing Agreement) RGPD
- Vérification incident history (Google "[fournisseur] data breach", HaveIBeenPwned)

**Phase 4 — Évaluation (J+21) :**
- Scoring fournisseurs (grille Annexe B)
- Sélection finale basée sur : sécurité (50%), fonctionnalités (30%), prix (20%)
- Validation CTO (Critique) ou Dev Lead (Haute/Moyenne)

**Phase 5 — Contractualisation (J+30) :**
- Négociation contrat (clauses section 5)
- Signature contrat + DPA RGPD
- Provisionning accès (onboarding technique)

**Phase 6 — Onboarding (J+45) :**
- Configuration sécurité (MFA, SSO si possible, permissions minimales)
- Documentation runbook (usage, contacts support, escalation)
- Ajout registre fournisseurs (section 7)

---

### 4.2 Sélection Accélérée (Urgence)

**Cas d'usage :** Incident production nécessite outil urgence (ex: forensics, DDoS mitigation).

**Process :**
- CTO approuve exception process standard (email justification)
- Due diligence allégée (vérification certification uniquement, pas questionnaire détaillé)
- Contrat temporaire 30j (clause résiliation sans pénalité)
- Post-urgence (J+30) : due diligence complète ou résiliation

**Exemple :** Attaque DDoS nécessite Cloudflare Enterprise upgrade immédiat → activation J0, due diligence complète J+7.

---

## 5. Exigences Contractuelles

### 5.1 Clauses Obligatoires (Fournisseurs Critiques/Hautes)

| Clause | Contenu | Justification |
|--------|---------|---------------|
| **SLA Disponibilité** | Uptime ≥99.9% (8.76h downtime/an max), pénalités si breach | Continuité service Claude Craft |
| **SLA Support** | Réponse <4h incidents critiques (Sev1), <24h Sev2 | Résolution rapide incidents |
| **Notification Breach** | Notification <24h si incident sécurité affectant nos données | Compliance RGPD art. 33 (notification CNIL <72h) |
| **Audit Rights** | Droit audit sécurité annuel (sur préavis 30j) ou acceptation audit tiers (SOC 2) | Vérification conformité continue |
| **Confidentialité** | NDA couvrant données clients Claude Craft, code source | Protection IP et privacy |
| **Sous-traitance** | Autorisation préalable sous-traitants, liste fournie, DPA cascade | Compliance RGPD art. 28 |
| **Data Residency** | Données stockées UE (RGPD) ou USA avec Standard Contractual Clauses (SCC) | Transferts internationaux RGPD |
| **Suppression Données** | Suppression <30j résiliation, attestation destruction | RGPD droit à l'oubli |
| **Résiliation** | Clause résiliation 30j préavis, pas de lock-in, export données | Exit strategy |
| **Responsabilité** | Limitation responsabilité raisonnable (pas "AS IS" zero liability) | Protection business |

### 5.2 DPA (Data Processing Agreement) RGPD

**Obligatoire si :** Fournisseur traite données personnelles pour compte Claude Craft (sous-traitant RGPD art. 28).

**Contenu DPA minimal :**
- **Objet traitement :** Décrire finalités (ex: analytics utilisateurs, support client)
- **Durée :** Durée contrat + 30j post-résiliation (suppression)
- **Nature données :** Catégories (emails, IPs, données usage)
- **Catégories personnes :** Utilisateurs Claude Craft (développeurs, entreprises)
- **Obligations sous-traitant :** Sécurité, confidentialité, assistance DPO, notification breach
- **Transferts hors UE :** SCC (Standard Contractual Clauses) si USA/autres pays non-adequacy decision
- **Sous-traitants ultérieurs :** Liste, autorisation préalable, responsabilité cascade

**Template DPA :** Utiliser modèle CNIL ou DPA standard fournisseur (vérifier compliance avant signature Legal).

**Validation :** Legal Counsel (DPO) revoit tous DPA avant signature.

---

### 5.3 SLA Détails

**SLA Uptime Stripe (Exemple Critique) :**

| Uptime Mensuel | Crédit SLA |
|----------------|------------|
| ≥99.95% | 0% (nominal) |
| 99.0%-99.94% | 10% frais mensuels |
| 95.0%-98.99% | 25% frais |
| <95.0% | 50% frais |

**Clause escalation :** Si 3 mois consécutifs <99.9%, droit résiliation sans pénalité + migration assistance (export données, support transition).

**Monitoring SLA :** Dashboard mensuel uptime fournisseurs (UptimeRobot, status pages), alerte si <99.9%.

---

## 6. Due Diligence Sécurité

### 6.1 Questionnaire Sécurité (Fournisseurs Critiques)

**Envoyé :** Phase sélection (section 4.1) ou revue annuelle fournisseur existant.

**Format :** Google Forms ou email, 25 questions, réponses attendues <7j.

**Questions clés (extrait, voir Annexe A complet) :**

1. **Certifications :** Détenez-vous SOC 2 Type II ou ISO 27001 ? (Copie rapport/certificat requise)
2. **Chiffrement :** Données chiffrées at rest (AES-256 ?) et in transit (TLS 1.3 ?) ?
3. **Accès :** MFA obligatoire employés ? PAM pour admins ?
4. **Backups :** Fréquence ? Tests restauration ? Immutabilité (protection ransomware) ?
5. **Incident Response :** IRP documenté ? Délai notification breach <24h garanti contractuellement ?
6. **Compliance RGPD :** DPO désigné ? DPIA réalisées ? Transferts hors UE (SCC) ?
7. **Pentest :** Fréquence audits sécurité externes ? Dernier rapport disponible ?
8. **Personnel :** Screening employés (background checks) ? Formation sécurité ?
9. **Sous-traitants :** Liste sous-traitants données ? Certifications équivalentes ?
10. **Business Continuity :** RTO/RPO ? DR tests annuels ?

**Scoring :** Grille Annexe B (100 points max, seuil acceptation ≥70 points Critique, ≥60 Haute).

**Red flags (rejet automatique) :**
- Aucune certification sécurité (SOC 2, ISO 27001, ou équivalent reconnu)
- Refus fournir DPA RGPD
- Incident breach majeur <12 mois non résolu
- Chiffrement absent ou algorithmes faibles (MD5, DES)

---

### 6.2 Vérification Certifications

**Process :**
1. **Demande copie :** Email fournisseur : "Merci fournir copie SOC 2 Type II report récent (<12 mois)"
2. **Validation authenticité :**
   - SOC 2 : Vérifier auditeur accrédité (Big Four, cabinets reconnus), date rapport <12 mois, scope couvre services utilisés
   - ISO 27001 : Vérifier certificat COFRAC/UKAS, numéro certificat valide (check registre accréditation)
3. **Lecture findings :** SOC 2 Section III (tests contrôles) → vérifier 0 exceptions majeures ou plan remediation acceptable
4. **Archivage :** Stocker copie certificats Google Drive `Legal/Suppliers/[Nom Fournisseur]/Certifications/`

**Fréquence revérification :** Annuelle (demander certificat updated), ou si incident sécurité public fournisseur.

---

## 7. Registre Fournisseurs

### 7.1 Contenu Registre

**Format :** Google Sheets ou Notion database, accès CTO + Legal + IT Admin.

**Colonnes obligatoires :**

| Colonne | Contenu | Exemple |
|---------|---------|---------|
| **Nom Fournisseur** | Raison sociale | Anthropic PBC |
| **Service** | Description service fourni | API Claude (LLM generation) |
| **Criticité** | Critique / Haute / Moyenne / Faible | Critique |
| **Catégorie** | Type service (Cloud, SaaS, Consulting, etc.) | SaaS API |
| **Données Traitées** | Nature données (RGPD) | Prompts utilisateurs (éphémères) |
| **Sous-traitant RGPD** | Oui/Non | Oui |
| **Certifications** | SOC 2, ISO 27001, PCI DSS, etc. | SOC 2 Type II (2025-12) |
| **DPA Signé** | Oui/Non + date | Oui (2025-06-15) |
| **Contrat** | Lien Google Drive contrat signé | [LIEN] |
| **Date Début** | Date activation service | 2025-06-01 |
| **Date Fin** | Date résiliation prévue ou renouvellement | 2026-06-01 (auto-renew) |
| **Contact Principal** | Account manager ou support | support@anthropic.com |
| **Contact Escalation** | Contact urgence (incidents Sev1) | [Account Manager Name] [Email] [Phone] |
| **SLA Uptime** | % contractuel | 99.9% |
| **Dernière Revue** | Date dernière revue annuelle | 2026-04-15 |
| **Prochaine Revue** | Date prévue revue | 2027-04-15 |
| **Statut** | Actif / En évaluation / Résilié | Actif |
| **Notes** | Commentaires, incidents, remediations | Incident 2025-11 (API down 2h), RCA reçu, acceptable |

### 7.2 Maintenance Registre

**Responsable :** IT Admin (mise à jour quotidienne si changements), CTO oversight mensuel.

**Mises à jour déclencheurs :**
- Nouveau fournisseur onboardé
- Résiliation fournisseur
- Renouvellement contrat (date fin updated)
- Incident fournisseur (notes updated)
- Revue annuelle complétée (dernière revue updated)
- Certification renouvelée (certifications column updated)

**Audit registre :** Trimestriel CTO, vérifier cohérence (contrats expirés ?, certifications à renouveler ?, revues en retard ?).

---

## 8. Surveillance Continue

### 8.1 Revue Annuelle Fournisseurs

**Scope :** Tous fournisseurs Critiques et Hautes, rotation 25% fournisseurs Moyennes chaque trimestre.

**Process (Fournisseur Critique, ex: Anthropic) :**

**Mois M-1 (mars si revue avril) :**
- IT Admin planifie revue (calendrier, assignation responsables)
- Collecte documents : contrat actuel, DPA, dernière certification SOC 2

**Mois M (avril) :**
- **Semaine 1 :** Envoi questionnaire sécurité updated (section 6.1)
- **Semaine 2 :** Réception réponses fournisseur, demande certificat SOC 2 updated
- **Semaine 3 :** Analyse réponses :
  - Scoring questionnaire (Annexe B)
  - Comparaison score année précédente (amélioration/dégradation ?)
  - Revue incidents 12 derniers mois (status pages, post-mortems publics)
  - Vérification SLA uptime (99.9% respecté ?)
- **Semaine 4 :** Décision continuation/renégociation/résiliation :
  - **Score ≥70 + SLA respecté :** Continuation (renouvellement auto)
  - **Score 60-69 ou 1 breach SLA :** Renégociation (amélioration exigences contractuelles)
  - **Score <60 ou breaches SLA multiples :** Résiliation (exit strategy activée, section 9)

**Livrable :** Rapport revue (1 page : scoring, incidents, décision, actions) — archivé Google Drive + registre fournisseurs updated.

**KPI :** 100% fournisseurs Critiques/Hautes reviewés annuellement (tolérance 0% retard).

---

### 8.2 Monitoring Continu

**Automated monitoring :**

| Métrique | Source | Fréquence | Alerte |
|----------|--------|-----------|--------|
| **Uptime fournisseur** | Status page (RSS), UptimeRobot | Temps réel | Downtime >1h → Slack #ops-alerts |
| **Incidents sécurité** | HaveIBeenPwned API (breach notifications), Google Alerts "[fournisseur] data breach" | Quotidien | Breach détecté → Slack #security-incidents |
| **Certificats expiration** | Registre fournisseurs (formule Google Sheets) | Hebdomadaire | Certificat expire <60j → Email CTO |
| **SLA uptime mensuel** | Dashboard (compile status pages) | Mensuel | Uptime <99.9% → Rapport CTO |

**Manual monitoring :**
- Lecture post-mortems incidents fournisseurs (si publics, ex: GitHub, Cloudflare blogs)
- Participation webinars sécurité fournisseurs (Anthropic AI safety, Stripe payment security)
- Revue changelog fournisseurs (breaking changes, nouvelles fonctionnalités sécurité)

---

## 9. Exit Strategy

### 9.1 Planification Exit Strategy (Fournisseurs Critiques)

**Obligation :** Chaque fournisseur Critique doit avoir exit strategy documentée (plan migration alternative <30j).

**Contenu exit strategy :**

| Section | Contenu |
|---------|---------|
| **Déclencheurs résiliation** | Breach SLA répété, incident sécurité majeur, faillite fournisseur, augmentation prix >50%, changement ToS inacceptable |
| **Fournisseurs alternatifs** | Liste 2-3 alternatives évaluées (scoring Annexe B), avantages/inconvénients |
| **Effort migration** | Estimation temps (heures dev), coût (licenses, consulting), risques |
| **Timeline migration** | Phases (evaluation 7j, setup 7j, migration 7j, validation 7j = 28j total) |
| **Export données** | Process export données complètes (API, CSV, SQL dump selon fournisseur) |
| **Validation migration** | Tests (feature parity, performance, sécurité) |
| **Rollback plan** | Si migration échoue, retour fournisseur initial possible <7j |

**Exemple Exit Strategy Anthropic (API LLM) :**

```markdown
## Exit Strategy — Anthropic API Claude

**Déclencheurs :**
- Indisponibilité prolongée (>7j)
- Shutdown service annoncé
- Augmentation tarifs >100% (insoutenable)
- Breach données prompts utilisateurs (perte confiance)

**Alternatives évaluées :**

| Fournisseur | Scoring | Avantages | Inconvénients |
|-------------|---------|-----------|---------------|
| **OpenAI (GPT-4.5)** | 85/100 | API similaire, pricing compétitif, disponibilité 99.99% | Qualité réponses légèrement inférieure (tests A/B internes) |
| **Google Gemini 2.5** | 78/100 | Intégration GCP facile si migration cloud | API différente (refactoring code), moins de contrôle safety |
| **Mistral AI (Large)** | 70/100 | EU-based (RGPD), open-source friendly | Performance inférieure tâches complexes, SLA 99.5% seulement |

**Décision :** OpenAI GPT-4.5 backup primary, Gemini fallback secondary.

**Effort migration :**
- Code : Abstraction layer LLM déjà implémenté partiel (section BCP/DRP 4.2), compléter 16h dev
- Tests : Validation qualité réponses échantillon 500 prompts, 8h QA
- Total : 24h dev + 8h QA = 32h = 4j ETP
- Coût : API keys OpenAI/Gemini standby €200/mois, migration 0€ (in-house)

**Timeline migration :**
- J+0 : Décision migration (CTO approval)
- J+1 : Activation API keys OpenAI, configuration feature flag
- J+2-3 : Tests QA qualité réponses
- J+4 : Déploiement production (rollout graduel 10% trafic)
- J+7 : 100% trafic OpenAI si validation OK, ou rollback Anthropic

**Export données :** Aucune (prompts éphémères, pas stockés Anthropic selon ToS).

**Tests migration :**
- Feature parity : 100% commandes Claude Craft fonctionnelles OpenAI
- Performance : Latency ≤ +20% vs. Anthropic (acceptable)
- Qualité : Score humain évaluation réponses ≥90% satisfaction (vs. 95% Anthropic baseline)

**Rollback plan :** Si score qualité <85%, rollback Anthropic J+5, renégociation contrat.
```

**Stockage exit strategies :** Google Drive `Tech/Exit-Strategies/[Fournisseur].md`, revue annuelle.

---

### 9.2 Résiliation Fournisseur (Process)

**Phase 1 — Décision Résiliation (J-30 avant fin contrat ou immédiat si urgence) :**
- CTO approuve résiliation (email justification)
- Notification fournisseur (email formel respectant clause résiliation contrat, généralement 30j préavis)
- Activation exit strategy (section 9.1)

**Phase 2 — Migration Alternative (J-30 → J-7) :**
- Setup fournisseur alternatif (onboarding section 4)
- Migration données (export fournisseur sortant, import alternatif)
- Tests validation (feature parity, performance)

**Phase 3 — Cutover (J-7 → J0) :**
- Bascule production vers fournisseur alternatif (rollout graduel recommandé : 10% J-7, 50% J-3, 100% J0)
- Monitoring renforcé 7j (détection régressions)

**Phase 4 — Offboarding Fournisseur Sortant (J0 → J+30) :**
- Demande suppression données (email formel, clause contractuelle)
- Réception attestation destruction données (compliance RGPD)
- Résiliation accès (révocation comptes, API keys)
- Archivage contrat, DPA, certificats (conservation 3 ans legal)
- Mise à jour registre fournisseurs (statut "Résilié")

**Phase 5 — Post-Mortem (J+30) :**
- Rapport résiliation (raisons, timeline, coût migration, learnings)
- Mise à jour exit strategy autres fournisseurs (leçons apprises)

---

## 10. Gestion Incidents Fournisseurs

### 10.1 Incident Fournisseur Catégories

| Catégorie | Exemples | Actions |
|-----------|----------|---------|
| **Indisponibilité** | Downtime >4h | Activation BCP/DRP failover (section BCP 5), communication clients |
| **Breach Sécurité** | Data breach fournisseur expose nos données | Activation IRP (section IRP 5.1), notification CNIL si RGPD, évaluation résiliation |
| **Non-Conformité Contrat** | SLA uptime <99.9% 3 mois consécutifs | Renégociation contrat, demande crédits SLA, escalation management fournisseur |
| **Changement ToS Inacceptable** | Nouvelles clauses contraires sécurité/privacy | Négociation exception, ou résiliation (exit strategy) |
| **Faillite Fournisseur** | Annonce shutdown service | Activation exit strategy urgence (<7j migration) |

### 10.2 Escalation Fournisseur (Incident Critique)

**Process :**
1. **Détection :** Monitoring (section 8.2) ou notification fournisseur
2. **Triage :** IT Admin confirme criticité (impact Claude Craft)
3. **Escalation interne :** Notification CTO si Sev1/2 (section IRP classification)
4. **Escalation fournisseur :**
   - **Support standard :** Ticket support (fournisseur Moyenne/Faible)
   - **Account Manager :** Email/call direct (fournisseur Haute/Critique)
   - **Executive escalation :** CTO → CTO fournisseur (si AM non-responsive <4h Sev1)
5. **Communication clients :** Si impact >1h, status page updated (section BCP 7)
6. **Post-incident :** Demande RCA (Root Cause Analysis) fournisseur, revue compliance SLA

**Exemple Escalation GitHub (Panne >4h) :**
- H+0 : Détection panne (UptimeRobot alerte)
- H+0:15 : IT Admin vérifie GitHub Status (confirme Major Outage)
- H+0:30 : Notification CTO (Sev1), activation CSIRT
- H+1 : Activation BCP failover GitLab (section BCP 5.1)
- H+2 : Email Account Manager GitHub (demande ETA résolution)
- H+4 : Si GitHub toujours down, CTO email CTO GitHub (executive escalation)
- H+8 : GitHub résolu, retour production
- J+1 : Demande RCA GitHub, vérification crédit SLA

---

## 11. Compliance RGPD — Sous-Traitants

### 11.1 Obligations RGPD Art. 28

**Claude Craft = Responsable traitement, Fournisseurs = Sous-traitants.**

**Obligations :**

| Obligation | Implémentation |
|------------|----------------|
| **DPA écrit** | Signature DPA avant activation service (section 5.2) |
| **Instructions documentées** | Scope traitement défini contrat (finalités, durées, données) |
| **Confidentialité** | Clause NDA, formation personnel fournisseur |
| **Sécurité** | Certification SOC 2/ISO 27001, chiffrement, MFA |
| **Sous-traitance ultérieure** | Autorisation préalable (liste sous-traitants fournie), DPA cascade |
| **Assistance DPO** | Fournisseur aide DPIA, réponses droits utilisateurs (accès, suppression) |
| **Notification breach** | Clause <24h notification (section 5.1) |
| **Suppression/restitution données** | Clause suppression <30j résiliation, attestation |
| **Audit** | Clause audit rights annuel ou acceptation audit tiers (SOC 2) |

### 11.2 Transferts Hors UE

**Principe RGPD :** Transfert données personnelles hors UE nécessite garanties appropriées.

**Mécanismes autorisés (post-Schrems II) :**

| Mécanisme | Application Claude Craft |
|-----------|--------------------------|
| **Adequacy Decision** | UK, Suisse, Japon OK (Commission UE décision adéquation) |
| **Standard Contractual Clauses (SCC)** | USA (Anthropic, GitHub, Stripe) : SCC 2021 obligatoires + Transfer Impact Assessment |
| **Binding Corporate Rules (BCR)** | Multinationales (ex: Google) : BCR approuvées CNIL |

**Anthropic (USA) — Exemple SCC :**
- DPA Anthropic inclut SCC 2021 (Module 2 : Controller to Processor)
- Transfer Impact Assessment (TIA) réalisé Legal : risque faible (données éphémères prompts, pas stockage long terme, chiffrement E2E)
- Surveillance gouvernementale USA : Anthropic garantit pas d'accès données sans legal process (clause contrat)

**Validation :** Legal Counsel (DPO) revoit tous transferts hors UE, approuve SCC + TIA avant signature.

**Registre transferts :** Section registre fournisseurs (colonne "Data Residency" : UE / USA-SCC / UK-Adequacy).

---

## 12. Responsabilités

### 12.1 RACI Matrix

| Responsabilité | CTO | Legal (DPO) | IT Admin | Dev Lead |
|----------------|-----|-------------|----------|----------|
| **Sélection fournisseur** | **A** | C (RGPD) | **R** (due diligence technique) | C (besoins métier) |
| **Contractualisation** | A | **R** (rédaction, revue DPA) | I | I |
| **Onboarding fournisseur** | A | I | **R** (config technique) | C |
| **Revue annuelle** | **A** | C (RGPD compliance) | **R** (questionnaire, scoring) | I |
| **Monitoring continu** | A | I | **R** (uptime, incidents) | I |
| **Incident fournisseur** | **A** (décision escalation) | C (breach notification) | **R** (triage, escalation support) | C (impact technique) |
| **Exit strategy** | **R/A** (décision résiliation) | C (clauses contractuelles) | C (migration technique) | **R** (migration code) |
| **Registre fournisseurs** | A (oversight) | C (DPA validity) | **R** (maintenance quotidienne) | I |

**Légende :** R = Responsible (exécute), A = Accountable (approuve), C = Consulted (avis), I = Informed (informé).

---

## 13. Formation

**Module obligatoire :** M8 — Supply Chain Security (30min, annuel, section Formation ISP).

**Contenu :**
- Risques supply chain (compromission Solarwinds, Log4j)
- Due diligence fournisseurs (certifications, questionnaire)
- Red flags sécurité (absence chiffrement, pas de DPA RGPD)
- Process escalation incidents fournisseurs

**Cible :** Dev team (choix outils dev), Product (outils SaaS), IT Admin (provisionning).

---

## 14. Métriques et KPIs

### 14.1 KPIs Fournisseurs

| Métrique | Cible | Mesure | Fréquence |
|----------|-------|--------|-----------|
| **% fournisseurs Critiques certifiés** | 100% SOC 2 ou ISO 27001 | Count fournisseurs / total Critiques | Trimestriel |
| **% DPA signés (sous-traitants RGPD)** | 100% | Count DPA / total sous-traitants | Trimestriel |
| **Revues annuelles à jour** | 100% | Count revues <12 mois / total fournisseurs Critiques | Mensuel |
| **Uptime moyen fournisseurs Critiques** | ≥99.9% | Moyenne uptime mensuel (status pages) | Mensuel |
| **Incidents fournisseurs Sev1/an** | <2 | Count incidents fournisseurs Sev1 année | Annuel |
| **Exit strategies documentées** | 100% fournisseurs Critiques | Count exit strategies / total Critiques | Annuel |
| **Délai moyen migration urgence** | <30j | Moyenne durée résiliation → alternative opérationnelle | Par incident |

### 14.2 Reporting

**Trimestriel :** Dashboard fournisseurs (Google Sheets) :
- Liste fournisseurs Critiques/Hautes, certifications expiration
- Uptime % trimestre (comparaison SLA contractuel)
- Incidents fournisseurs (summary, impact, résolutions)

**Annuel :** Management review ISO 27001 :
- Conformité fournisseurs (KPIs vs. cibles)
- Nouveaux fournisseurs onboardés année
- Résiliations année (raisons, coûts migration)
- Recommandations améliorations (diversification, renégociations)

---

## 15. Annexes

### Annexe A — Questionnaire Sécurité Fournisseur (25 Questions)

**Section 1 — Certifications et Compliance (5 questions) :**

1. Détenez-vous SOC 2 Type II ou ISO 27001 valide ? (Copie rapport/certificat requise)
2. Certifications additionnelles (PCI DSS, HIPAA, FedRAMP, etc.) ?
3. DPO (Data Protection Officer) désigné ? Contact ?
4. DPIA (Data Protection Impact Assessments) réalisées traitements à risque ?
5. Conformité RGPD : registre traitements, droits utilisateurs (accès, suppression), notification breach <72h ?

**Section 2 — Sécurité Infrastructure (8 questions) :**

6. Chiffrement données at rest : algorithme (AES-256 ?) et key management (HSM ?) ?
7. Chiffrement données in transit : TLS version (1.3 minimum ?) ?
8. Segmentation réseau : production/dev/test isolés ?
9. Firewalls : WAF activé ? Règles ingress/egress restrictives ?
10. Monitoring sécurité : SIEM ? SOC 24/7 ? Alerting temps réel ?
11. Vulnerability management : scans fréquence ? SLA patch critique (48h ?) ?
12. Pentests : fréquence (annuel minimum ?) ? Auditeur externe ? Rapport disponible ?
13. DDoS protection : fournisseur (Cloudflare, AWS Shield) ? Capacité mitigation (Tbps ?) ?

**Section 3 — Accès et Identité (4 questions) :**

14. MFA obligatoire employés ? Type (TOTP, hardware keys FIDO2 ?) ?
15. PAM (Privileged Access Management) : session recording admin ? Approval dual ?
16. SSO support (SAML, OIDC) ? Provisionning automatique (SCIM) ?
17. Revue accès : fréquence (trimestrielle ?) ? Offboarding SLA (1h ?) ?

**Section 4 — Backups et Continuité (3 questions) :**

18. Backups fréquence ? Rétention ? Tests restauration (trimestriel ?) ?
19. Immutabilité backups (protection ransomware) ?
20. DR tests : fréquence (annuel ?) ? RTO/RPO documentés ?

**Section 5 — Personnel et Processes (5 questions) :**

21. Screening employés : background checks ? Vérification références ?
22. Formation sécurité : fréquence (annuelle ?) ? Simulations phishing ?
23. Incident Response Plan : documenté ? Exercices (trimestriels ?) ?
24. Sous-traitants : liste fournie ? Certifications équivalentes ? DPA cascade ?
25. Changements infrastructure : notification clients préalable (7j ?) ? Changelog public ?

**Scoring :** Chaque question 4 points (Oui complet), 2 points (Partiel), 0 point (Non). Total 100 points.

---

### Annexe B — Grille Scoring Fournisseurs

| Catégorie | Poids | Questions | Points Max |
|-----------|-------|-----------|------------|
| **Certifications** | 25% | Q1-5 | 25 |
| **Sécurité Infrastructure** | 35% | Q6-13 | 35 |
| **Accès et Identité** | 15% | Q14-17 | 15 |
| **Backups et Continuité** | 10% | Q18-20 | 10 |
| **Personnel et Processes** | 15% | Q21-25 | 15 |
| **TOTAL** | 100% | 25 questions | **100** |

**Seuils acceptation :**
- **Critique :** ≥70 points (tolére 0 red flags)
- **Haute :** ≥60 points (max 1 red flag mineur)
- **Moyenne :** ≥50 points

**Red flags :**
- Q1 (Certifications) : 0 points → Rejet automatique
- Q6 ou Q7 (Chiffrement) : 0 points → Rejet automatique
- Q14 (MFA) : 0 points → Rejet Critique, acceptable Haute/Moyenne si remediation <90j

---

### Annexe C — Template Email Demande Due Diligence

```
Objet : [Claude Craft] Questionnaire Sécurité — Évaluation Fournisseur

Bonjour [Contact Fournisseur],

Dans le cadre de notre évaluation de [NOM SERVICE], nous souhaitons vérifier la conformité 
de vos pratiques de sécurité avec nos exigences internes (ISO 27001, RGPD).

**Documents requis :**
1. Copie SOC 2 Type II report ou ISO 27001 certificat (datant <12 mois)
2. DPA (Data Processing Agreement) RGPD si traitement données personnelles
3. Liste sous-traitants (si applicable)
4. Réponses questionnaire sécurité (25 questions, joint)

**Délai :** Merci de nous transmettre ces documents sous 7 jours ouvrés.

**Confidentialité :** Tous documents seront traités confidentiellement, usage interne uniquement 
(évaluation fournisseur), stockage sécurisé (chiffrement), suppression si évaluation négative.

**Contact :** Pour questions, contacter [IT ADMIN EMAIL] ou moi-même.

Cordialement,
[CTO NAME]
CTO, The Bearded CTO
cto@the-bearded-bear.com
```

---

### Annexe D — Glossary

| Terme | Définition |
|-------|------------|
| **Supply Chain** | Chaîne fournisseurs (software, hardware, services) |
| **Due Diligence** | Vérification approfondie sécurité/conformité fournisseur |
| **DPA** | Data Processing Agreement — contrat sous-traitance RGPD |
| **SCC** | Standard Contractual Clauses — mécanisme transferts hors UE RGPD |
| **SLA** | Service Level Agreement — engagement contractuel disponibilité/performance |
| **Exit Strategy** | Plan migration fournisseur alternatif (anticipation résiliation) |
| **Sous-traitant ultérieur** | Fournisseur du fournisseur (cascade RGPD) |
| **RCA** | Root Cause Analysis — analyse cause racine incident |
| **TIA** | Transfer Impact Assessment — analyse risques transferts hors UE |

---

## 16. Approbation

**Version :** 1.0.0  
**Date création :** 2026-04-15  
**Prochaine revue :** 2027-04-15  

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| **Rédaction** | CTO | 2026-04-15 | ________________ |
| **Revue Legal (DPO)** | Legal Counsel | 2026-04-__ | ________________ |
| **Approbation** | CTO + Legal | 2026-04-__ | ________________ |

---

**FIN DU DOCUMENT — DRAFT v1.0.0**

**Contact :** cto@the-bearded-bear.com  
**Confidentialité :** Internal — Management + Legal uniquement
