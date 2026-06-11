# Incident Response Plan (IRP)

**DRAFT — Review Legal/CTO + cabinet audit obligatoire**

**Date :** 2026-04-15  
**Version :** 1.0.0  
**Projet :** Claude Craft v8.1.0  
**Référence :** ISO 27001:2022 A.16  
**Owner :** CTO (Incident Commander)  
**Revue :** Annuelle (avril) + post-incident majeur  

---

## 1. Objectif

Cet Incident Response Plan (IRP) définit le processus de détection, réponse, résolution et apprentissage des incidents de sécurité affectant Claude Craft, conformément ISO 27001 A.16 et RGPD (notification <72h).

---

## 2. Scope

**Types d'incidents couverts :**
- **Data breach :** Accès non autorisé données utilisateurs (emails, analytics)
- **Compromission comptes :** Phishing, credential stuffing, MFA bypass
- **Malware/Ransomware :** Infection laptop employé, tentative propagation cloud
- **DDoS :** Attaque déni service (Cloudflare mitige mais impact résiduel)
- **Supply chain :** Package NPM malveillant, compromission GitHub Actions
- **Vulnérabilité 0-day :** Exploitation critique non patchée (Log4Shell-like)
- **Insider threat :** Exfiltration intentionnelle données, sabotage
- **Interruption service :** Indisponibilité Anthropic API, GitHub, Cloudflare >4h

**Hors scope :**
- Incidents purement IT (crash serveur sans impact sécurité) → runbook ops standard
- Bugs applicatifs sans implications sécurité → backlog BMAD
- Social media crises sans cyber → communication équipe marketing

---

## 3. Classification Incidents

### 3.1 Niveaux de Gravité (Severity)

| Sev | Définition | Exemples | RTO (Response Time Objective) | Escalation |
|-----|------------|----------|-------------------------------|------------|
| **Sev1 — Critique** | Impact business majeur, données sensibles exposées, service down >4h | Data breach 10K+ utilisateurs, ransomware production, compromission GitHub org | 15 min détection → réponse | Incident Commander (CTO) + CSIRT + CEO |
| **Sev2 — Élevée** | Impact business modéré, potentiel exposition données, service dégradé | Phishing réussi 1 employé, vulnérabilité critique CVE ≥9.0 non patchée, DDoS partiel | 1h détection → réponse | CSIRT (CTO + IT Admin + Dev Lead) |
| **Sev3 — Moyenne** | Impact business faible, pas d'exposition données confirmée, service intermittent | Tentative phishing échouée, scan vulnérabilités détecté, laptop volé (chiffrement OK) | 4h détection → réponse | IT Admin + Dev Lead |
| **Sev4 — Faible** | Impact négligeable, monitoring détection seule, pas de compromission | Échecs authentification répétés (brute force bloqué), scan ports externe détecté | 24h détection → réponse | IT Admin (triage, log) |

### 3.2 Critères Escalation

**Sev4 → Sev3 :**
- Répétition incidents Sev4 >5 occurrences en 7j (pattern attaque coordonnée)
- Détection activité post-scan (attaquant progresse)

**Sev3 → Sev2 :**
- Confirmation compromission compte (non-admin)
- Découverte vulnérabilité critique exploitable depuis internet

**Sev2 → Sev1 :**
- Confirmation exfiltration données sensibles (emails utilisateurs, secrets API)
- Propagation latérale (de laptop compromis vers systèmes cloud)
- Indisponibilité service >4h (SLA breach, impact client)

---

## 4. CSIRT (Computer Security Incident Response Team)

### 4.1 Composition

| Rôle | Personne | Responsabilités | Disponibilité |
|------|----------|-----------------|---------------|
| **Incident Commander (IC)** | CTO | Décisions finales, coordination, communication direction/clients | 24/7 on-call Sev1/2 |
| **Tech Lead** | Dev Lead | Investigation technique, forensics, remediation code | On-call Sev1/2 (rotation si >3 devs) |
| **Operations Lead** | IT Admin | Révocation accès, rotation secrets, infrastructure remediation | 24/7 on-call Sev1/2 |
| **Communications Lead** | Legal (ou Product si >10 personnes) | Notification CNIL, communication clients, rédaction post-mortem public | Best effort (délai 4h Sev1) |
| **Legal Advisor** | Legal Counsel | Conformité RGPD (DPO), implications juridiques, notification autorités | Best effort (délai 8h Sev1) |

**Backup Incident Commander :** CEO (si CTO indisponible ou conflit d'intérêt).

### 4.2 Formation CSIRT

**Onboarding :**
- Lecture IRP complète (2h)
- Simulation tabletop 1 scénario (2h)
- Accès outils CSIRT (runbooks, playbooks, contacts d'urgence)

**Maintenance :**
- Simulation trimestrielle (section 10)
- Revue post-incident (section 8)
- Formation continue 4h/an (SANS Incident Response, NIST 800-61)

---

## 5. Process Incident Response — NIST 800-61

### 5.1 Vue d'ensemble

```
Preparation → Detection → Analysis → Containment → Eradication → Recovery → Lessons Learned
     ↑______________________________________________________________________________|
                                    (amélioration continue)
```

---

### 5.2 Phase 1 — Preparation

**Objectifs :**
- Outils CSIRT opérationnels
- Équipe formée
- Contacts d'urgence à jour
- Playbooks testés

**Actions continues :**
- Maintenir SIEM alertes (Wazuh futur M3, ou GitHub audit log + Cloudflare logs actuel)
- Mettre à jour contacts CSIRT trimestriellement
- Revoir playbooks post-incidents ou changements infrastructure
- Tester communication crise (email, Slack, phone tree)

**Checklist préparation :**
- [ ] CSIRT membres identifiés, formés, on-call rotation configurée
- [ ] Playbooks Sev1/2 rédigés et accessibles (Google Drive CSIRT folder + 1Password emergency)
- [ ] Canaux communication : Slack #security-incidents (privé, CSIRT only), email security@the-bearded-bear.com, phone tree
- [ ] Contacts externes : ANSSI CERT-FR (+33 1 71 75 84 68), CNIL (+33 1 53 73 22 22), cabinet forensics (TBD)
- [ ] Backup outils : laptop CSIRT isolé (forensics, pas utilisé quotidiennement), clés USB bootable (Kali Linux, Tails)
- [ ] Assurance cyber : contrat souscrit (montant couverture, SLA expertise externe)

---

### 5.3 Phase 2 — Detection & Analysis

**Détection (automated + manual) :**

| Source | Déclencheurs | Fréquence | Responsable |
|--------|--------------|-----------|-------------|
| **GitHub Audit Log** | Login admin hors horaires, bulk permissions changes | Real-time webhook | IT Admin |
| **Cloudflare Logs** | Spike requests (DDoS), WAF blocks >1000/min | Real-time alerting | Dev Lead |
| **Sentry** | Spike erreurs app (possible exploitation vulnérabilité) | Real-time alerting | Dev on-call |
| **1Password Activity Log** | Accès vault anormal (IP géo, horaires) | Daily review | IT Admin |
| **Employés** | Reporting phishing, device volé, activité suspecte | Immédiat (Slack #security-incidents) | Tous |
| **External researcher** | Vulnerability disclosure (security@the-bearded-bear.com) | Variable | CTO |

**Analysis (triage <15min Sev1, <1h Sev2) :**

1. **Collecte informations initiales :**
   - Quoi : Quel système affecté ? (GitHub, Cloudflare, laptop, etc.)
   - Quand : Timestamp premier événement suspect
   - Qui : Utilisateur/IP/device concerné
   - Comment : Vecteur attaque supposé (phishing, exploit, brute force)

2. **Classification Severity :**
   - Appliquer grille section 3.1
   - Si doute entre Sev2/Sev1 → escalader Sev1 (principe précaution)

3. **Containment decision :**
   - Isolation nécessaire ? (révocation compte, blocage IP, shutdown service)
   - Impact business isolation vs. laisser attaquant progresser
   - **Règle :** Sev1 → isoler immédiatement, investiguer après. Sev2+ → investiguer puis isoler.

4. **Activation CSIRT :**
   - Sev1/2 : Notification tous CSIRT membres sous 15min (Slack @channel #security-incidents + SMS/call si pas de réponse 5min)
   - Sev3 : IT Admin + Dev Lead (pas besoin IC)
   - Sev4 : IT Admin seul (log, monitoring)

---

### 5.4 Phase 3 — Containment

**Objectif :** Limiter propagation, préserver preuves forensics.

**Short-Term Containment (Sev1/2, immédiat <30min) :**

| Scénario | Actions Containment |
|----------|---------------------|
| **Compte compromis** | Révocation accès immédiate (section 6.2), invalidation sessions, rotation MFA recovery codes |
| **Malware laptop** | Isolation réseau (déconnexion WiFi, VPN kill), pas de wipe (préserver forensics), laptop scellé sac Faraday si disponible |
| **Vulnérabilité exploitée** | Patch urgent ou désactivation fonctionnalité affectée (feature flag), WAF rule blocking exploitation pattern |
| **DDoS** | Cloudflare "Under Attack Mode", rate limiting agressif, challenge CAPTCHA |
| **Supply chain (package malveillant)** | Rollback version précédente package, pin version saine, scan dependencies malware (Trivy, Snyk) |
| **Data exfiltration en cours** | Blocage IP attaquant (Cloudflare, AWS Security Groups), révocation API keys, monitoring transferts sortants |

**Long-Term Containment (post-24h, stabilisation) :**
- Patch temporaire custom si patch officiel indisponible (backport fix)
- Migration infrastructure non compromise (ex: nouveau VPC AWS si VPC actuel suspect)
- Monitoring renforcé (logs verbeux, session recording admin)

**Forensics preservation :**
- **Images disques :** `dd` laptop suspect avant toute manipulation
- **Logs export :** GitHub audit log 30j, Cloudflare logs 7j, Sentry events 90j (export immédiat S3 immutable)
- **Chain of custody :** Document qui accède preuves quand, signatures SHA256 images

---

### 5.5 Phase 4 — Eradication

**Objectif :** Supprimer cause racine compromission.

**Actions type :**

| Scénario | Eradication |
|----------|-------------|
| **Malware** | Wipe laptop (NIST 800-88 DoD 5220.22-M 3-pass), reinstall OS from scratch, restore données backup sain (pre-infection) |
| **Vulnérabilité exploitée** | Déploiement patch officiel (SLA 48h CVE critique), code review fix custom, tests régression |
| **Backdoor code** | Suppression backdoor, audit complet codebase (recherche patterns similaires), revue toutes PRs 90j précédents |
| **Credentials compromises** | Rotation tous secrets accessibles compte (API keys, DB passwords, SSH keys), audit logs accès frauduleux |
| **Insider threat** | Licenciement employé, révocation totale accès, rotation secrets, audit forensics activité 12 derniers mois |

**Validation eradication :**
- Scan malware (ClamAV, Malwarebytes) : 0 détection
- Tests exploitation post-patch : échec (vulnérabilité non reproductible)
- Monitoring 72h post-eradication : aucune récidive activité malveillante

---

### 5.6 Phase 5 — Recovery

**Objectif :** Restaurer opérations normales, confirmer systèmes sains.

**Recovery steps :**

1. **Validation systèmes nettoyés :**
   - Tests intrusion (scan Nmap, OWASP ZAP) : aucune nouvelle vulnérabilité
   - Code review déploiement post-incident : 100% PRs reviewées par ≥2 personnes
   - Backup restore test : succès restauration backup propre (pre-incident)

2. **Reprovisionning accès :**
   - Comptes révoqués containment → re-provisioning si employés légitimes (nouveaux MFA, passwords)
   - Secrets rotés → distribution nouveaux secrets équipe (1Password vaults updated)

3. **Communication reprise :**
   - **Interne :** All-hands brief (timeline incident, actions prises, retour normal), Q&A équipe
   - **Externe clients (si applicable) :** Email notification fin incident, mesures correctives, excuses (template section 9.2)
   - **Régulateurs (si RGPD breach) :** Notification complémentaire CNIL fin investigation (mesures prises)

4. **Monitoring post-recovery (30j renforcé) :**
   - Logs review daily (au lieu weekly standard)
   - Alertes seuils abaissés (sensibilité accrue détection récidive)
   - Tests intrusion hebdomadaires (au lieu trimestriels)

**SLA Recovery :**
- **Sev1 :** Service nominal <24h post-containment (si infra compromise : <72h)
- **Sev2 :** Service nominal <48h
- **Sev3/4 :** Best effort <7j

---

### 5.7 Phase 6 — Lessons Learned (Post-Mortem)

**Timing :** Sous 7j après recovery complète.

**Participants :** CSIRT complet + personnes impliquées incident + optionnel équipe élargie si learnings applicables.

**Format post-mortem (blameless culture) :**

```markdown
# Post-Mortem Incident [ID] — [Titre Court]

**Date incident :** YYYY-MM-DD  
**Severity :** Sev1/2/3/4  
**Durée :** Xh Ym détection → recovery  
**Impact :** [Clients affectés, données exposées, downtime]  
**Auteurs :** CSIRT  
**Revue :** [Date] — Approuvé CTO  

---

## Timeline

| Timestamp | Événement | Acteur | Action |
|-----------|-----------|--------|--------|
| 2026-04-15 14:32 | Détection alerte GitHub audit log : admin login IP Russie | SIEM | Alerte Slack #security-incidents |
| 2026-04-15 14:35 | Triage : compte CTO compromis (phishing email 13h45) | IT Admin | Classification Sev1, activation CSIRT |
| 2026-04-15 14:40 | Containment : révocation compte CTO, rotation recovery codes | IT Admin | Accès bloqué attaquant |
| 2026-04-15 15:00 | Investigation : phishing email "GitHub Security Alert" lien fake OAuth | CTO (compte backup) | Identification vecteur |
| 2026-04-15 16:00 | Eradication : révocation OAuth apps non autorisées, MFA enforcement all org | Dev Lead | Suppression persistance attaquant |
| 2026-04-15 18:00 | Recovery : CTO re-provisionning nouveau compte, MFA YubiKey | IT Admin | Service nominal |
| 2026-04-16 10:00 | Communication : Email all-hands incident résolu, formation phishing renforcée | CTO | Équipe informée |

---

## Root Cause

**Cause directe :** Phishing email GitHub fake, CTO cliqué lien OAuth malveillant, accordé permissions read/write org.

**Causes contributives :**
1. Manque formation anti-phishing CTO (dernier training 6 mois)
2. Absence hardware key MFA CTO (TOTP bypassable OAuth flow)
3. GitHub OAuth apps non reviewées trimestriellement (app malveillante 3 semaines non détectée)

---

## Impact

- **Confidentialité :** Attaquant accès lecture repos privés 2h (commits, issues, pas de secrets exposés : 1Password séparé)
- **Intégrité :** Aucune modification code (branch protection bloqué pushs malveillants)
- **Disponibilité :** Aucune (service non affecté)
- **Business :** Impact reputationnel faible (pas de communication publique nécessaire, pas de clients affectés)
- **RGPD :** Pas de breach données personnelles utilisateurs (repos internes uniquement)

---

## Remediations

| ID | Action | Owner | Deadline | Statut |
|----|--------|-------|----------|--------|
| R1 | Hardware keys MFA (YubiKey) tous admins GitHub/Google | IT Admin | 2026-04-30 | ✅ Done |
| R2 | Formation anti-phishing trimestrielle obligatoire (simulations KnowBe4) | CTO | 2026-05-15 | 🚧 In Progress |
| R3 | Revue OAuth apps GitHub monthly automated (script alerte apps non whitelistées) | Dev Lead | 2026-05-01 | ✅ Done |
| R4 | GitHub Advanced Security (secret scanning, push protection) activé | CTO | 2026-04-20 | ✅ Done |
| R5 | Playbook "Compromission compte admin" mis à jour (leçons incident) | CTO | 2026-04-22 | ✅ Done |

---

## What Went Well

- ✅ Détection rapide (3min alerte → triage)
- ✅ Activation CSIRT efficace (5min notification → assembled)
- ✅ Containment immédiat (8min triage → révocation compte)
- ✅ Aucune donnée client exposée (segmentation repos internes/externes efficace)
- ✅ Communication transparente équipe post-incident

---

## What Went Wrong

- ❌ CTO cliqué phishing (formation insuffisante, email convaincant)
- ❌ MFA TOTP bypassable OAuth flow (hardware key aurait bloqué)
- ❌ OAuth apps non reviewées → détection tardive app malveillante

---

## Action Items (hors remediations)

- [ ] Partage post-mortem sanitized blog public (sensibilisation communauté phishing GitHub) — CTO — 2026-05-30
- [ ] Revue budget cybersécurité (hardware keys, formation, assurance cyber) — CTO+Finance — 2026-05-15

---

## Signatures

| Rôle | Nom | Date |
|------|-----|------|
| **Incident Commander** | CTO | 2026-04-18 |
| **Approbation** | CEO | 2026-04-19 |
```

**Distribution post-mortem :**
- **Interne :** Équipe complète (all-hands presentation + document Google Drive)
- **Externe (optionnel) :** Blog public version sanitisée (pas de détails techniques exploitables, focus learnings)
- **Archive :** Conservation 3 ans (compliance ISO 27001, forensics potentiels)

---

## 6. Playbooks par Scénario

### 6.1 Playbook Data Breach (Sev1)

**Déclencheur :** Suspicion accès non autorisé base données utilisateurs (emails, analytics).

**Containment (immédiat <30min) :**
1. Isoler base données compromise (revoke DB credentials, security group block)
2. Snapshot DB état actuel (forensics)
3. Identifier scope breach : requêtes SQL suspectes logs (Posthog query logs, Sentry DB slow queries)

**Analysis :**
- Nombre utilisateurs affectés (query impactées records)
- Données exposées (emails, noms, analytics comportementaux, pas de passwords/paiements)
- Vecteur accès (SQLi, credentials volées, insider)

**Eradication :**
- Patch vulnérabilité SQLi (si applicable)
- Rotation credentials DB
- Revue permissions DB (principle least privilege)

**Notification RGPD (<72h CNIL) :**
- **Si ≥100 utilisateurs affectés ET données sensibles (RGPD art. 9) :** Notification obligatoire CNIL
- **Si <100 utilisateurs OU données non-sensibles :** Évaluation risque, notification si risque élevé droits/libertés

**Communication clients :**
- Email notification breach (template section 9.2)
- Mesures correctives prises
- Actions recommandées utilisateurs (changement passwords si credentials exposées, surveillance phishing)

**Recovery :**
- Service DB restauré avec credentials rotées
- Monitoring renforcé 30j (alertes requêtes anormales)

---

### 6.2 Playbook Compromission Compte (Sev2)

**Déclencheur :** Alerte login anormal (IP géo, horaires) ou employé reporte phishing réussi.

**Containment (immédiat <15min) :**
1. Révocation compte concerné (GitHub, Google Workspace, 1Password, Slack, Stripe, etc.)
2. Invalidation sessions actives (force logout)
3. Blocage IP attaquant (Cloudflare, AWS Security Groups)

**Analysis :**
- Vecteur compromission (phishing, credential stuffing, malware laptop)
- Scope accès attaquant (repos lus, données téléchargées, modifications effectuées)
- Durée compromission (premier login suspect → détection)

**Eradication :**
- Rotation secrets accessibles compte (API keys, tokens)
- Audit activité compte 30j précédents (commits, downloads, permissions changes)
- Formation employé victime (si phishing)

**Recovery :**
- Re-provisionning compte employé (nouveau password, MFA setup, YubiKey si admin)
- Monitoring activité 7j (détection récidive)

---

### 6.3 Playbook Ransomware (Sev1)

**Déclencheur :** Laptop employé affiche demande rançon, ou détection chiffrement fichiers massif.

**Containment (immédiat <5min) :**
1. **NE PAS éteindre laptop** (perte RAM forensics)
2. Isolation réseau immédiate (déconnexion WiFi/Ethernet physiquement)
3. Sac Faraday si disponible (bloquer communications cellulaires ransomware)
4. Révocation accès cloud employé (prévention propagation latérale)

**Analysis :**
- Variant ransomware (screenshot demande rançon, hash binaires)
- Vecteur infection (phishing email, RDP bruteforce, drive-by download)
- Données chiffrées laptop (scope : documents locaux uniquement, ou réplication cloud ?)

**Eradication :**
- **NE JAMAIS payer rançon** (politique entreprise, financing crime)
- Wipe laptop (NIST 800-88)
- Scan backups malware (vérifier pas de réinfection)

**Recovery :**
- Restore données backup propre (pre-infection, tests intégrité)
- Reinstall OS laptop from scratch
- Formation employé (éviter réinfection)

**Communication :**
- Notification assurance cyber sous 48h (clause contrat)
- Notification ANSSI CERT-FR (volontaire, contribution statistiques)
- PAS de communication publique (sauf si données clients chiffrées → Sev1 Data Breach process)

---

### 6.4 Playbook DDoS (Sev2)

**Déclencheur :** Spike trafic anormal (>10x baseline), slow response times, Cloudflare alerte.

**Containment (immédiat <15min) :**
1. Cloudflare "Under Attack Mode" activé (challenge CAPTCHA agressif)
2. Rate limiting par IP : 10 req/min (au lieu 100 req/min standard)
3. Geo-blocking pays source attaque (si 90%+ trafic malveillant 1 pays)

**Analysis :**
- Type DDoS (volumetric L3/L4, applicative L7, amplification DNS/NTP)
- Amplitude (Gbps, requests/sec)
- Durée estimée (DDoS <1h usually, >4h = extorsion potentielle)

**Eradication :**
- Cloudflare mitige automatiquement (infrastructure anti-DDoS)
- Si DDoS L7 sophistiqué : WAF rules custom (block User-Agent patterns, query params)

**Recovery :**
- Désactivation "Under Attack Mode" graduel (monitoring si récidive)
- Post-mortem : budget Cloudflare upgrade (si plan gratuit insufficient, passer Pro/Business)

**Communication :**
- Status page (status.claude-craft.com si existe) : "Investigating connectivity issues"
- Résolution <4h : pas de communication clients proactive
- Résolution >4h : Email clients notification dégradation + ETA

---

### 6.5 Playbook Supply Chain Attack (Sev1)

**Déclencheur :** Alerte Dependabot/Snyk package malveillant, ou détection comportement anormal CI/CD.

**Containment (immédiat <30min) :**
1. Rollback package version précédente saine (pinning `package.json`, `requirements.txt`)
2. Blocage déploiements CI/CD (manual approval obligatoire)
3. Scan malware codebase (`grep -r` patterns suspects, Trivy scan containers)

**Analysis :**
- Package compromis (nom, version, registry NPM/PyPI/GitHub Packages)
- Payload malware (exfiltration secrets, backdoor, cryptominer)
- Scope infection (dev laptops, CI/CD runners, production déployée ?)

**Eradication :**
- Suppression package malveillant toutes dépendances
- Audit `node_modules`, `venv` : vérifier pas de persistence
- Rotation secrets CI/CD (GitHub Actions secrets, Anthropic API keys si exposées)

**Recovery :**
- Redéploiement version saine avec dependencies auditées
- SBOM generation post-incident (lock dependencies versions exactes)
- Monitoring 30j (détection C2 communications malware résiduel)

**Communication :**
- Notification communauté open-source (GitHub Security Advisory si package maintenu Claude Craft)
- Signalement registry (NPM, PyPI) package malveillant

---

### 6.6 Playbook Insider Threat (Sev1)

**Déclencheur :** Suspicion exfiltration intentionnelle données (employé télécharge backup DB complet, clone tous repos), ou alerte RH comportement anormal.

**Containment (immédiat <1h) :**
1. Révocation totale accès employé (section 6.2 offboarding urgence)
2. Préservation preuves : audit logs 12 mois, emails, Slack DMs (coordination Legal)
3. Séquestration laptop/devices employé (saisie physique, pas remote wipe)

**Analysis (avec Legal) :**
- Motivation (financière, vengeance, espionnage concurrent)
- Données exfiltrées (scope, sensibilité)
- Destination exfiltration (cloud personnel, email externe, USB)

**Eradication :**
- Rotation tous secrets accessibles employé
- Revue permissions équipe (detection comptes similaires risque)

**Recovery :**
- Embauche remplacement (screening renforcé)
- Revue culture équipe (exit interviews, satisfaction surveys)

**Legal actions :**
- Mise en demeure (cease & desist)
- Plainte pénale si vol données clients (RGPD art. 84, Code Pénal art. 323-1)
- Poursuites civiles dommages & intérêts

**Communication :**
- **Interne :** Annonce départ employé (raisons confidentielles), renforcement sécurité
- **Externe :** Aucune (sauf si breach données clients → process Data Breach)

---

## 7. Contacts d'Urgence

### 7.1 CSIRT Interne

| Rôle | Nom | Email | Mobile | Backup |
|------|-----|-------|--------|--------|
| **Incident Commander** | CTO | cto@the-bearded-bear.com | [À compléter] | CEO |
| **Tech Lead** | Dev Lead | devlead@the-bearded-bear.com | [À compléter] | Senior Dev |
| **Operations Lead** | IT Admin | it@the-bearded-bear.com | [À compléter] | CTO |
| **Communications Lead** | Legal Counsel | legal@the-bearded-bear.com | [À compléter] | Product Manager |

**Slack channel :** #security-incidents (privé, CSIRT only)

**Email groupe :** security@the-bearded-bear.com (forwardé CSIRT members)

### 7.2 Autorités et Partenaires Externes

| Organisme | Contact | Téléphone | Email | Usage |
|-----------|---------|-----------|-------|-------|
| **ANSSI CERT-FR** | Hotline cyber | +33 1 71 75 84 68 | cert-fr.cossi@ssi.gouv.fr | Notification incidents critiques (volontaire), conseil technique |
| **CNIL** | Service plaintes | +33 1 53 73 22 22 | [Formulaire web](https://www.cnil.fr/) | Notification breach RGPD <72h |
| **Police Cybercriminalité (OCLCTIC)** | Plainte | Commissariat local ou [service-public.fr](https://www.service-public.fr) | Via PHAROS portail | Plainte pénale (ransomware, insider threat) |
| **Cloudflare Support** | Account team (si Business plan) | Via dashboard | support@cloudflare.com | Assistance DDoS, WAF tuning |
| **GitHub Support** | Enterprise support (si plan) | Via ticket | support@github.com | Compromission organization, forensics logs |
| **Anthropic Support** | Account manager | Via dashboard | support@anthropic.com | Incident API, compromission clés |

### 7.3 Prestataires Urgence

| Service | Prestataire | Contact | SLA | Coût estimé |
|---------|-------------|---------|-----|-------------|
| **Forensics cyber** | TBD (sélection post-certification ISO) | [À compléter] | Intervention <24h France | €5-15K/incident |
| **Assurance cyber** | TBD (souscription M3) | [À compléter] | Déclaration <48h | Prime annuelle €3-8K |
| **Cabinet avocat cyber** | TBD (si besoin poursuites) | [À compléter] | Consultation <48h | Honoraires variables |

---

## 8. Métriques et KPIs

### 8.1 KPIs Incidents

| Métrique | Cible | Mesure |
|----------|-------|--------|
| **MTTD (Mean Time To Detect)** | <15min Sev1, <1h Sev2 | Temps alerte → triage confirmé |
| **MTTR (Mean Time To Respond)** | <30min Sev1, <2h Sev2 | Temps triage → containment actif |
| **MTTR (Mean Time To Recover)** | <24h Sev1, <48h Sev2 | Temps detection → service nominal |
| **Incidents Sev1/an** | 0 (objectif), <2 acceptable | Count incidents Sev1 année calendaire |
| **Incidents Sev2/an** | <5 | Count incidents Sev2 année calendaire |
| **Post-mortem complétude** | 100% Sev1/2 | Post-mortem rédigé <7j recovery |
| **Remediations completion** | 100% <90j post-incident | Actions post-mortem implémentées délai |

### 8.2 Reporting

**Mensuel :** Dashboard incidents (Notion ou Google Sheets) :
- Nombre incidents par Sev
- MTTD/MTTR moyens
- Top 3 types incidents (phishing, vulnérabilités, accès non autorisés)
- Remediations en cours

**Trimestriel :** Présentation CTO → CEO/Board (si board existe) :
- Tendances incidents (amélioration/dégradation)
- Budget sécurité vs. incidents évités (ROI)
- Recommandations investissements (formations, outils, assurance)

**Annuel :** Management review ISO 27001 (section 11 ISP) :
- Efficacité IRP (KPIs vs. cibles)
- Incidents majeurs année, learnings
- Mises à jour IRP nécessaires

---

## 9. Communication Crise

### 9.1 Principes

**Transparence :** Communication honnête, pas de minimisation incident (compliance RGPD, confiance clients).

**Rapidité :** Notification clients <24h confirmation impact (ou <72h CNIL si breach).

**Empathie :** Excuses sincères, reconnaissance impact utilisateurs.

**Clarté :** Langage simple (pas de jargon technique), actions concrètes.

### 9.2 Templates Communication

**Template Email Clients (Data Breach) :**

```
Objet : [Action Requise] Incident de sécurité Claude Craft — Vos données

Bonjour [Nom Utilisateur],

Nous vous contactons concernant un incident de sécurité affectant Claude Craft survenu le [DATE].

**Ce qui s'est passé :**
Le [DATE], nous avons détecté un accès non autorisé à [SYSTÈME]. Notre équipe a immédiatement 
pris des mesures pour sécuriser nos systèmes et lancer une investigation complète.

**Vos données concernées :**
Après investigation, nous avons déterminé que les données suivantes vous concernant ont pu être 
exposées : [LISTE : ex. adresse email, données d'utilisation anonymisées]. 
Vos mots de passe et informations de paiement n'ont PAS été affectés (stockés séparément, chiffrés).

**Ce que nous avons fait :**
- Correction de la vulnérabilité exploitée
- Rotation de toutes les clés d'accès
- Renforcement de notre monitoring de sécurité
- Notification des autorités compétentes (CNIL)

**Ce que vous devez faire :**
- Aucune action immédiate requise de votre part
- Par précaution, nous recommandons de surveiller tout email suspect usurpant Claude Craft
- Si vous réutilisiez votre mot de passe Claude Craft ailleurs : changez-le sur ces services

**Plus d'informations :**
Post-mortem détaillé (anonymisé) : [LIEN BLOG]
Questions : security@the-bearded-bear.com

Nous sommes profondément désolés pour cet incident. La sécurité de vos données est notre 
priorité absolue, et nous avons pris des mesures pour qu'un tel incident ne se reproduise pas.

Cordialement,
[CTO NAME]
Co-founder & CTO, The Bearded CTO
```

**Template Notification CNIL (RGPD art. 33) :**

```
[Via formulaire en ligne CNIL : https://www.cnil.fr/fr/notifier-une-violation-de-donnees-personnelles]

**1. Description violation :**
Le [DATE HEURE UTC+1], accès non autorisé base de données utilisateurs via [VECTEUR]. 
Détection [DATE HEURE], containment [DATE HEURE].

**2. Catégories et nombre personnes concernées :**
[NOMBRE] personnes concernées (utilisateurs Claude Craft, résidents UE majoritairement).

**3. Catégories données concernées :**
- Données identification : emails, noms (si collectés)
- Données d'utilisation : analytics anonymisées (commandes exécutées, timestamps)
- Pas de données sensibles (RGPD art. 9), pas de mots de passe, pas de paiements

**4. Conséquences probables :**
Risque phishing ciblé (emails exposés), risque faible pour droits/libertés (pas de données financières/santé).

**5. Mesures prises/envisagées :**
- Containment : révocation accès [DATE HEURE], rotation credentials
- Notification utilisateurs : [DATE] (email template joint)
- Remediations : patch vulnérabilité, MFA renforcé, monitoring accrue

**6. Contact DPO :**
[NOM DPO], legal@the-bearded-bear.com, +33 [TÉLÉPHONE]
```

---

## 10. Exercices et Simulations

### 10.1 Tabletop Exercises (Trimestriel)

**Format :** 2h, discussion scénario hypothétique, pas de systèmes réels touchés.

**Participants :** CSIRT complet + invités selon scénario (ex: CEO si communication crise).

**Scénarios rotation :**
- **Q1 :** Data breach (SQLi)
- **Q2 :** Ransomware laptop + propagation cloud
- **Q3 :** Supply chain (package NPM malveillant)
- **Q4 :** Insider threat (employé exfiltre données avant démission)

**Déroulé :**
1. **Présentation scénario** (10min) : IC lit description incident hypothétique
2. **Discussion réponse** (60min) : Équipe discute actions (containment, analysis, eradication, communication)
3. **Gaps identification** (30min) : Noter lacunes (outils manquants, contacts obsolètes, playbook incomplet)
4. **Action plan** (20min) : Assigner remediations gaps

**Livrable :** Rapport tabletop (scénario, gaps identifiés, actions correctives, deadline) — archivé 3 ans.

### 10.2 Red Team Exercise (Annuel)

**Format :** Pentest + social engineering, attaque réelle systèmes (autorisation préalable).

**Prestataire :** Cabinet externe (éviter conflit d'intérêt équipe interne).

**Scope :**
- Reconnaissance OSINT (GitHub, LinkedIn, site web)
- Phishing spear-phishing employés
- Exploitation vulnérabilités web/infra
- Post-exploitation (lateral movement, privilege escalation)

**Règles engagement :**
- Pas de destruction données
- Pas d'interruption service production (tests staging/dev acceptables)
- Notification CEO + CTO + Legal avant démarrage
- Communication équipe post-exercice (learnings)

**Livrable :** Rapport pentest (vulnérabilités, exploitations réussies, recommandations) + présentation équipe.

**SLA remediation :** Vulnérabilités critiques détectées <30j, hautes <90j.

---

## 11. Amélioration Continue

### 11.1 Revue Post-Incident

Chaque incident Sev1/2 → post-mortem obligatoire (section 5.7).

**Tracking remediations :** Backlog BMAD ou Jira, tag `security-remediation`, priorité élevée.

**Revue trimestrielle remediations :** CTO vérifie 100% actions post-mortems complétées <90j.

### 11.2 Mise à Jour IRP

**Déclencheurs revue IRP :**
- Post-incident majeur (Sev1) : mise à jour playbook dans 7j
- Revue annuelle (avril, aligné ISP)
- Changement infrastructure (ex: migration AWS → GCP)
- Nouvelle réglementation (ex: NIS 2 applicable)

**Process amendements :** Section 10 ISP (revue CTO + Legal, approbation, versioning, communication).

---

## 12. Annexes

### Annexe A — Checklist Incident Commander

**Phase Detection & Analysis :**
- [ ] Alerte reçue, severity confirmée (Sev1/2/3/4)
- [ ] CSIRT activé si Sev1/2 (Slack @channel, SMS backups)
- [ ] War room ouvert (Slack thread dédié, Google Meet bridge si remote)
- [ ] Scribe désigné (notes timeline en temps réel)

**Phase Containment :**
- [ ] Actions containment exécutées (playbook section 6)
- [ ] Forensics preservation (logs export, images disques si applicable)
- [ ] Communication interne (équipe notifiée, pas de détails publics prématurés)

**Phase Eradication :**
- [ ] Root cause identifiée
- [ ] Fix déployé (patch, rotation secrets, etc.)
- [ ] Validation eradication (tests, scans)

**Phase Recovery :**
- [ ] Service nominal confirmé (monitoring, tests)
- [ ] Communication clients (si applicable, template section 9.2)
- [ ] Notification régulateurs (CNIL si RGPD breach)

**Phase Post-Mortem :**
- [ ] Post-mortem rédigé <7j recovery
- [ ] Présentation équipe (all-hands)
- [ ] Remediations assignées, deadlines
- [ ] Archivage post-mortem (Google Drive CSIRT folder)

---

### Annexe B — Glossary

| Terme | Définition |
|-------|------------|
| **CSIRT** | Computer Security Incident Response Team |
| **Incident Commander (IC)** | Responsable décisions finales incident, coordination |
| **Containment** | Limitation propagation incident, isolation systèmes compromis |
| **Eradication** | Suppression cause racine compromission |
| **Forensics** | Investigation technique post-incident, collecte preuves |
| **Post-mortem** | Rapport blameless post-incident, learnings et remediations |
| **MTTD** | Mean Time To Detect — délai moyen détection incident |
| **MTTR** | Mean Time To Respond/Recover — délai moyen réponse/recovery |
| **Sev1/2/3/4** | Severity levels (criticité incidents) |
| **Playbook** | Procédure pré-établie réponse scénario incident spécifique |

---

### Annexe C — Outils CSIRT

| Outil | Usage | Accès |
|-------|-------|-------|
| **GitHub Audit Log** | Monitoring accès repos, permissions changes | GitHub Settings > Logs (admins only) |
| **Cloudflare Logs** | Monitoring trafic, DDoS detection | Cloudflare Dashboard > Analytics > Logs |
| **1Password Activity Log** | Monitoring accès vaults, secrets | 1Password Admin Console > Activity |
| **Sentry** | Monitoring erreurs app, spike anomalies | [sentry.io](https://sentry.io) |
| **Wazuh** (futur M3) | SIEM centralisé, corrélation logs | [wazuh.com](https://wazuh.com) |
| **Kali Linux (laptop forensics)** | Investigation malware, network analysis | USB bootable (CSIRT kit physique) |
| **Trivy** | Scan vulnérabilités containers, dependencies | CI/CD ou CLI local |
| **HaveIBeenPwned API** | Vérification credentials compromises | [haveibeenpwned.com/API](https://haveibeenpwned.com/API) |

---

## 13. Approbation

**Version :** 1.0.0  
**Date création :** 2026-04-15  
**Prochaine revue :** 2027-04-15 ou post-incident Sev1  

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| **Rédaction** | CTO (Incident Commander) | 2026-04-15 | ________________ |
| **Revue Legal** | Legal Counsel (DPO) | 2026-04-__ | ________________ |
| **Approbation** | CEO / CTO | 2026-04-__ | ________________ |

---

**FIN DU DOCUMENT — DRAFT v1.0.0**

**Contact urgence 24/7 :** security@the-bearded-bear.com | Slack #security-incidents  
**Confidentialité :** Internal — CSIRT + Management uniquement
