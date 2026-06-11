# Access Control Policy

**DRAFT — Review Legal/CTO + cabinet audit obligatoire**

**Date :** 2026-04-15  
**Version :** 1.0.0  
**Projet :** Claude Craft v8.1.0  
**Référence :** ISO 27001:2022 A.9  
**Owner :** CTO  
**Revue :** Annuelle (avril)  

---

## 1. Objectif

Cette Access Control Policy définit les principes et processus de gestion des accès aux systèmes, applications et données de Claude Craft, conformément au principe de **least privilege** et **need-to-know**.

---

## 2. Scope

**Systèmes couverts :**
- GitHub organization (repos, packages, actions)
- Services cloud (Cloudflare, AWS/GCP si SaaS)
- Outils SaaS (Anthropic API, Posthog, Sentry, Stripe, 1Password)
- Infrastructure CI/CD (GitHub Actions, secrets)
- Communications (Google Workspace, Slack)

**Utilisateurs concernés :**
- Employés permanents
- Contractors (développeurs externes, consultants)
- Comptes service (bots CI/CD, monitoring)
- Fournisseurs tiers (support technique limité, audit temporaire)

---

## 3. Principes Fondamentaux

### 3.1 Need-to-Know

**Règle :** Accès accordé uniquement si nécessaire à l'exécution du travail.

**Exemple :**
- Developer backend : accès repos API, pas frontend
- Product Manager : accès analytics Posthog, pas Stripe dashboard
- Support : accès tickets Zendesk, pas base données production

### 3.2 Least Privilege

**Règle :** Permissions minimum requises, jamais admin par défaut.

**Exemple :**
- Nouveau developer : Read repos GitHub, Write après onboarding 1 semaine + approbation CTO
- IT Admin : Admin outils identité (Google Workspace), pas admin financier (Stripe)

### 3.3 Separation of Duties

**Règle :** Aucune personne ne peut exécuter seule une action critique.

**Exemple :**
- Release production : developer code + reviewer approve PR + CTO approve deployment
- Paiement fournisseur >€5K : Legal initiate + CTO approve Stripe
- Modification policy ISMS : CTO rédige + Legal approve

### 3.4 Defense in Depth

**Règle :** Authentification multi-couches (MFA, PAM, audit logs).

**Application :**
- Layer 1 : Password strong (NIST 800-63B compliant)
- Layer 2 : MFA obligatoire (TOTP minimum, hardware key admin)
- Layer 3 : PAM (Privileged Access Management) accès admin
- Layer 4 : Audit logs centralisés, alertes anomalies

---

## 4. Authentification

### 4.1 Passwords

**Politique :**
- **Longueur minimum :** 12 caractères (16 recommandé)
- **Complexité :** Pas d'exigence caractères spéciaux (NIST 800-63B : longueur > complexité)
- **Dictionnaire :** Interdiction passwords communs (HaveIBeenPwned API)
- **Expiration :** Aucune (NIST 800-63B : rotation forcée contre-productive sauf compromission)
- **Stockage :** Hash **Argon2id** (128 MiB RAM, t=3-5, p=1) — JAMAIS bcrypt/MD5/SHA1 en nouveau code

**Password Manager obligatoire :** 1Password Business (vaults par équipe : Dev, Infra, Finance, HR).

**Interdictions :**
- ❌ Réutilisation password entre services
- ❌ Partage credentials (utiliser partage 1Password sécurisé)
- ❌ Stockage passwords fichiers texte, post-it, emails

### 4.2 Multi-Factor Authentication (MFA)

**Obligatoire sur tous les comptes :**

| Service | MFA Type | Obligatoire | Hardware Key Admin |
|---------|----------|-------------|---------------------|
| GitHub | TOTP ou hardware key | ✅ | ✅ (organization owners) |
| Google Workspace | TOTP ou hardware key | ✅ | ✅ (super admin) |
| 1Password | TOTP ou hardware key | ✅ | ✅ (admins vault) |
| Stripe | TOTP | ✅ | ✅ (full account access) |
| Cloudflare | TOTP ou hardware key | ✅ | ✅ (global API keys) |
| Anthropic API | API key rotation 90j | N/A (API key) | N/A |
| Posthog | TOTP | ✅ | — |
| Sentry | TOTP | ✅ | — |

**Hardware Keys (FIDO2/WebAuthn) :**
- **Recommandation :** YubiKey 5 NFC (backup : YubiKey 5C Nano stocké coffre sécurisé)
- **Admin obligatoire :** GitHub org owners, Google Workspace super admins, 1Password admins
- **Budget :** €120/personne (2 clés : principale + backup)

**SMS MFA interdit :** Vulnérable SIM swapping (NIST 800-63B deprecated).

### 4.3 Single Sign-On (SSO)

**Statut actuel :** Non implémenté (équipe <10 personnes).

**Migration future (si >20 personnes) :**
- **Provider :** Google Workspace (SAML SSO) ou Okta
- **Services intégrés :** GitHub Enterprise, Slack, Posthog, Sentry
- **Bénéfices :** Provisionning/deprovisionning centralisé, audit logs unifié

---

## 5. Autorisation

### 5.1 RBAC (Role-Based Access Control)

**Rôles standards :**

| Rôle | GitHub | Google Workspace | 1Password | Stripe | Posthog | Sentry |
|------|--------|------------------|-----------|--------|---------|--------|
| **Developer** | Write repos | User | Vault Dev | — | — | Member |
| **Senior Developer** | Write repos + PR approval | User | Vault Dev | — | — | Admin project |
| **Tech Lead** | Write repos + branch protection | User | Vault Dev+Infra | — | Read analytics | Admin org |
| **Product Manager** | Read repos | User | Vault Internal | — | Admin analytics | Read events |
| **CTO (Admin)** | Owner org | Super Admin | Admin all vaults | Full access | Admin all | Owner |
| **Legal/Finance** | Read docs repos | User | Vault Finance+Legal | View-only | — | — |
| **Support** | — | User | Vault Support | — | — | Read events |
| **Contractor** | Read repos (temp) | External user | — | — | — | — |

**Attribution rôle :** Demande manager → approbation CTO (ou IT Admin si délégation) → provisionning IT sous 24h.

### 5.2 ABAC (Attribute-Based Access Control)

**Cas d'usage :** Permissions dynamiques basées attributs contextuels.

**Exemples :**
- **IP whitelisting :** Admin Stripe accessible uniquement IPs VPN entreprise (si VPN déployé)
- **Time-based :** Accès admin GitHub restreint horaires bureau (9h-19h UTC+1) sauf on-call
- **Device compliance :** Accès Google Workspace nécessite device managé (Jamf/Intune si déployé)

**Statut actuel :** Non implémenté (complexité vs. bénéfice faible équipe <10).

---

## 6. Provisioning et Deprovisioning

### 6.1 Provisioning (Onboarding)

**Processus :**

**J-7 avant arrivée :**
- HR notifie IT Admin : nom, poste, date début, manager
- IT crée ticket provisioning (checklist)

**J-1 :**
- Création compte Google Workspace (email @the-bearded-bear.com)
- Envoi invitation 1Password vault approprié
- Envoi hardware keys MFA (YubiKey si admin)

**J1 (premier jour) :**
- Manager demande accès GitHub (rôle Developer ou selon poste)
- IT provisionne accès sous 4h (SLA)
- Formation sécurité M1-M4 planifiée (complétude <30j)

**J+7 :**
- Revue accès IT : vérifier cohérence rôle/permissions
- Upgrade Developer → Write si onboarding validé + approbation CTO

**Checklist provisioning :**

```markdown
- [ ] Compte Google Workspace créé (email @the-bearded-bear.com)
- [ ] Invitation 1Password vault (Dev/Infra/Finance selon rôle)
- [ ] MFA activé Google Workspace + 1Password
- [ ] Hardware key envoyée (si admin)
- [ ] Accès GitHub (rôle Read initial, Write après J+7)
- [ ] Accès Slack (channel #general, #dev, autres selon équipe)
- [ ] Accès Posthog/Sentry si Product/Tech Lead
- [ ] Accès Stripe si Legal/Finance
- [ ] Formation sécurité M1-M4 planifiée (J+30 deadline)
- [ ] Signature NDA + attestation lecture ISP
- [ ] Laptop configuré (antivirus, chiffrement disque, VPN si applicable)
```

**SLA :** Provisioning complet sous 24h (hors hardware keys délai postal 3-5j).

### 6.2 Deprovisioning (Offboarding)

**Déclencheurs :**
- Démission (préavis variable)
- Licenciement
- Fin contrat contractor
- Congé longue durée (>6 mois)

**SLA :**
- **Urgence (licenciement, départ conflictuel) :** 1h révocation tous accès
- **Standard (démission préavis) :** 4h révocation, effectif dernier jour travail

**Processus :**

**H+0 (notification départ) :**
- HR notifie IT Admin : nom, raison départ, date effective
- IT crée ticket offboarding (checklist)

**H+1 (si urgence) ou J-1 dernier jour (si standard) :**
- Révocation accès GitHub (remove from organization)
- Suspension compte Google Workspace (emails forwarded manager 30j puis suppression)
- Révocation accès 1Password (remove from vaults)
- Révocation accès Stripe/Posthog/Sentry
- Rotation secrets auxquels personne avait accès (API keys GitHub, Anthropic si partagés)
- Invalidation sessions actives (force logout Google Workspace, GitHub)

**H+4 (si urgence) ou J0 (si standard) :**
- Audit logs : vérifier pas d'activité suspecte 7 derniers jours
- Récupération assets : laptop, hardware keys, badges (si locaux physiques futurs)
- Attestation retour assets signée (ou déclaration perte → facturation)

**J+7 :**
- Suppression définitive compte Google Workspace (après archivage emails si requis Legal)
- Suppression accès repositories GitHub (historique commits préservé, authorship préservé)
- Documentation offboarding complété, archivé HR

**Checklist offboarding :**

```markdown
- [ ] Révocation GitHub (remove organization)
- [ ] Suspension Google Workspace (forward emails manager 30j)
- [ ] Révocation 1Password (remove vaults)
- [ ] Révocation Slack (deactivate account)
- [ ] Révocation Stripe/Posthog/Sentry si applicable
- [ ] Rotation secrets partagés (API keys)
- [ ] Invalidation sessions actives (force logout)
- [ ] Audit logs 7 derniers jours (activité suspecte ?)
- [ ] Récupération laptop (wipe NIST 800-88 ou destruction certifiée)
- [ ] Récupération hardware keys MFA
- [ ] Attestation retour assets signée
- [ ] Suppression Google Workspace J+7
- [ ] Documentation archivée HR
```

**Audit post-offboarding :** IT Admin vérifie 0 accès persistant revue trimestrielle comptes (section 7).

---

## 7. Gestion Accès Privilégiés (PAM)

### 7.1 Définition Accès Privilégiés

**Comptes concernés :**
- GitHub organization owners (CTO + backup)
- Google Workspace super admins (CTO + IT Admin)
- 1Password admins vaults (CTO + IT Admin)
- Stripe full account access (CTO + Legal)
- Cloudflare global API keys (CTO)
- AWS/GCP root accounts (CTO si déployé SaaS)

**Principe :** Accès admin = surface attaque maximale → protections renforcées.

### 7.2 Contrôles PAM

| Contrôle | Implémentation Claude Craft | Statut |
|----------|------------------------------|--------|
| **MFA hardware keys** | YubiKey 5 obligatoire admin | ✅ Déployé |
| **Dual approval** | Actions critiques (delete org, release prod) nécessitent 2 personnes | 🚧 À déployer M2 |
| **Session recording** | Enregistrement sessions admin (Teleport, Boundary si infra complexe) | ❌ Futur (si >20 personnes) |
| **Just-In-Time (JIT)** | Élévation privilèges temporaire (1h), révocation auto | ❌ Futur |
| **Break-glass accounts** | Comptes urgence (root access) coffre physique scellé | 🚧 À déployer M2 |
| **Audit logs** | Tous accès admin loggés, alerte anomalies (hors horaires, IP anormale) | ✅ GitHub audit log, 🚧 alerting M3 |

### 7.3 Break-Glass Procedure

**Scénario :** CTO indisponible (accident, urgence médicale) + incident critique nécessitant accès admin.

**Process :**
1. **Déclenchement :** CEO ou Legal autorise break-glass
2. **Accès :** Coffre physique (bureau CEO ou notaire) contient enveloppe scellée :
   - Recovery codes Google Workspace super admin
   - Recovery codes GitHub organization owner
   - Backup hardware key YubiKey
3. **Utilisation :** IT Admin backup utilise credentials urgence
4. **Post-incident :** Rotation immédiate recovery codes, audit logs accès, post-mortem

**Test annuel :** Vérifier validité recovery codes, accessibilité coffre.

---

## 8. Revue Accès

### 8.1 Revue Trimestrielle

**Fréquence :** 1er jour chaque trimestre (janvier, avril, juillet, octobre).

**Responsable :** IT Admin (ou CTO si <10 personnes).

**Processus :**

**Semaine 1 trimestre :**
- Export liste comptes tous systèmes (GitHub, Google Workspace, 1Password, Stripe, etc.)
- Identification comptes inactifs (>90j sans login)
- Identification permissions excessives (admin sans justification)

**Semaine 2 trimestre :**
- Envoi questionnaire managers : "Confirmer équipe actuelle, rôles corrects ?"
- Validation réponses managers sous 7j

**Semaine 3 trimestre :**
- Révocation comptes inactifs validés (anciens contractors, employés oubliés)
- Downgrade permissions excessives (ex: admin GitHub jamais utilisé → Write)
- Rapport revue : nombre comptes audités, révoqués, modifiés

**Semaine 4 trimestre :**
- Présentation rapport CTO
- Archivage rapport (conservation 3 ans, audit ISO 27001)

**KPI :**
- **Taux comptes inactifs :** <5% (objectif 0%)
- **Délai correction :** 100% anomalies corrigées <30j post-revue

### 8.2 Attestation Annuelle Managers

**Fréquence :** Annuelle (avril, aligné revue ISP).

**Process :**
- Managers reçoivent liste accès équipe (email IT Admin)
- Validation : "Je certifie que tous accès listés sont nécessaires et appropriés"
- Signature attestation (délai 15j)
- Non-réponse → escalation CTO

**Archivage :** Attestations conservées HR 3 ans (compliance ISO 27001 A.9.5).

---

## 9. Accès Tiers et Fournisseurs

### 9.1 Principes

**Règle :** Fournisseurs = risque supply chain → accès minimal, durée limitée, audit strict.

**Catégories fournisseurs :**
- **Critiques :** Anthropic (API), GitHub (repos), Cloudflare (CDN), Stripe (paiements)
- **Support technique :** Posthog support (accès analytics temporaire), Sentry support
- **Audit externe :** Auditeur ISO 27001 (accès documentation, logs, entretiens équipe)

### 9.2 Accès Support Fournisseur

**Processus :**

**Demande accès :**
- Fournisseur demande accès (ticket support)
- CTO valide nécessité, durée, scope

**Provisioning temporaire :**
- Création compte temporaire (suffix `_vendor_YYYYMMDD`)
- Permissions minimum (read-only si possible)
- Durée fixe (24h, 7j max)
- MFA obligatoire

**Monitoring :**
- Surveillance activité temps réel (audit logs)
- Enregistrement sessions si accès production

**Révocation :**
- Auto-révocation expiration délai
- Révocation manuelle immédiate si abus détecté
- Rotation secrets accessibles post-accès

**Exemple :**
- Posthog support demande accès analytics debug incident
- CTO approuve 48h, read-only
- IT crée compte `posthog_support_20260415`, expiration auto 17/04/2026
- Audit logs : 3 connexions, 12 queries analytics, 0 anomalie
- Révocation auto 17/04 23:59 UTC

### 9.3 Audit Externe

**ISO 27001 certification :**
- Auditeur reçoit accès documentation (Google Drive folder temporaire, read-only)
- Accès logs limité période audit (GitHub audit log export, Cloudflare logs export)
- Entretiens équipe (pas d'accès systèmes production sauf observation supervisée)
- NDA signé (confidentialité informations vues)

**Post-audit :**
- Révocation accès documentation sous 7j
- Suppression exports logs auditor sous 30j (après délivrance certificat)

---

## 10. Accès Urgence et Révocation

### 10.1 Révocation Urgence

**Déclencheurs :**
- Compromission credentials suspectée (phishing, malware laptop)
- Employé départ conflictuel immédiat
- Device volé (laptop, smartphone)
- Alerte SIEM activité anormale compte

**SLA :** 1h révocation tous accès, 24/7 (on-call IT Admin).

**Process :**
1. **Alerte :** Employé, manager, ou SIEM notifie IT Admin (#security-incidents Slack ou security@the-bearded-bear.com)
2. **Triage :** IT Admin confirme urgence (15min)
3. **Révocation :** IT exécute checklist offboarding urgence (section 6.2)
4. **Notification :** CTO + Legal informés sous 30min
5. **Investigation :** Audit logs 7j précédents, détection exfiltration données
6. **Remediation :** Rotation secrets, notification clients si breach confirmé (voir `incident-response.md`)

**Backup on-call :** Si IT Admin indisponible, CTO assume révocation (accès admin backup).

### 10.2 Rotation Secrets Post-Compromission

**Secrets à rotationner immédiatement :**
- API keys Anthropic, Stripe, Cloudflare
- GitHub Personal Access Tokens (PAT)
- Secrets CI/CD (GitHub Actions secrets)
- Certificats TLS (si compromission clé privée)

**SLA rotation :** <4h post-confirmation compromission.

**Communication :** Équipe dev notifiée rotation (mise à jour `.env` local, redéploiement CI/CD).

---

## 11. Logging et Monitoring

### 11.1 Audit Logs Obligatoires

**Événements loggés :**
- Authentification (succès, échecs, MFA bypass tentatives)
- Élévation privilèges (sudo, admin access)
- Modifications permissions (grant/revoke roles)
- Accès données sensibles (Stripe transactions, emails utilisateurs Posthog)
- Modifications configuration critique (branch protection GitHub, Cloudflare WAF rules)
- Offboarding (révocation comptes)

**Rétention :** 1 an minimum (compliance ISO 27001 A.12.4), 3 ans données sensibles (RGPD art. 30).

**Protection logs :** Chiffrement at rest, immutabilité (append-only), accès restreint (IT Admin, CTO, audit externe).

### 11.2 Alertes Anomalies

**Déclencheurs alertes :**
- Login hors horaires (0h-6h UTC+1) pour comptes admin
- Login IP géo anormale (ex: Russie, Chine si équipe EU uniquement)
- Échecs MFA répétés (>3 en 1h)
- Modification bulk permissions (>5 users en <10min)
- Téléchargement massif données (>1GB analytics Posthog en 1h)

**Canaux alertes :**
- Slack #security-incidents (temps réel)
- Email IT Admin + CTO (backup si Slack down)
- PagerDuty (si déployé, on-call rotation)

**Statut actuel :** GitHub audit log activé, Cloudflare logs exportés, 🚧 SIEM centralisé (Wazuh open-source) M3.

---

## 12. Conformité et Sanctions

### 12.1 Violations Courantes

| Violation | Gravité | Sanction 1ère occurrence | Sanction récidive |
|-----------|---------|--------------------------|-------------------|
| Partage password (au lieu 1Password share) | Moyenne | Avertissement formel, formation MFA | Mise à pied 3j |
| MFA désactivé volontairement | Grave | Suspension privilèges 7j, formation obligatoire | Licenciement |
| Accès non autorisé données (curiosity snooping) | Grave | Mise à pied, rétrogradation | Licenciement pour faute grave |
| Non-révocation contractor fin mission | Mineure | Rappel process IT Admin | Avertissement formel |

**Référence complète :** ISP section 9 Sanctions.

### 12.2 Audit Conformité

**Interne :** Revue trimestrielle comptes (section 8.1).

**Externe :** Audit ISO 27001 annuel (surveillance certificat).

**KPI conformité :**
- 100% comptes MFA activé (tolérance 0%)
- 100% offboarding SLA respecté (<4h standard, <1h urgence)
- <5% comptes inactifs revue trimestrielle
- 0 violation grave accès données non autorisées

---

## 13. Références

### 13.1 Politiques Associées

- **Information Security Policy (ISP)** — `docs/compliance/policies/information-security.md`
- **Incident Response Plan** — `docs/compliance/policies/incident-response.md`
- **Supplier Management Policy** — `docs/compliance/policies/supplier-management.md`

### 13.2 Standards

- **ISO/IEC 27001:2022 A.9** — Access control
- **NIST 800-63B** — Digital Identity Guidelines (passwords, MFA)
- **CIS Controls v8** — Control 5: Account Management, Control 6: Access Control Management
- **OWASP** — Authentication Cheat Sheet

### 13.3 Outils

- **1Password Business** — Password manager
- **YubiKey 5** — Hardware MFA keys (FIDO2/WebAuthn)
- **GitHub Audit Log** — Access audit trails
- **Google Workspace Admin Console** — Identity management
- **Wazuh** (futur M3) — SIEM open-source

---

## 14. Approbation

**Version :** 1.0.0  
**Date création :** 2026-04-15  
**Prochaine revue :** 2027-04-15  

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| **Rédaction** | CTO | 2026-04-15 | ________________ |
| **Revue IT** | IT Admin | 2026-04-__ | ________________ |
| **Approbation** | CTO | 2026-04-__ | ________________ |

---

**FIN DU DOCUMENT — DRAFT v1.0.0**

**Contact :** cto@the-bearded-bear.com  
**Confidentialité :** Internal — Diffusion équipe uniquement
