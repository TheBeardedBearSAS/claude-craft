# Business Continuity Plan (BCP) & Disaster Recovery Plan (DRP)

**DRAFT — Review Legal/CTO + cabinet audit obligatoire**

**Date :** 2026-04-15  
**Version :** 1.0.0  
**Projet :** Claude Craft v8.1.0  
**Référence :** ISO 27001:2022 A.17  
**Owner :** CTO  
**Revue :** Annuelle (avril) + post-DR test  

---

## 1. Objectif

Ce Business Continuity Plan (BCP) et Disaster Recovery Plan (DRP) garantissent la continuité des opérations critiques de Claude Craft en cas de sinistre majeur (catastrophe naturelle, cyberattaque, panne fournisseur critique).

**Objectifs :**
- **RTO (Recovery Time Objective) :** Service critique <4h, complet <24h
- **RPO (Recovery Point Objective) :** Perte données <15min (code source), <1h (analytics)
- Tests annuels DR drill complets, restauration backups trimestrielle

---

## 2. Scope

### 2.1 Fonctions Critiques

| Fonction | Criticité | RTO | RPO | Justification |
|----------|-----------|-----|-----|---------------|
| **Release Claude Craft** | Critique | 4h | 15min (code source Git) | Bloque développement utilisateurs, impact réputation |
| **Support utilisateurs** | Haute | 8h | 24h (tickets historique) | Impact satisfaction, mais backlog acceptable court terme |
| **Site web / docs** | Haute | 12h | 1h (contenu Markdown Git) | Information utilisateurs, SEO, mais cache CDN 24-48h |
| **Analytics produit** | Moyenne | 48h | 24h (Posthog events) | Décisions produit différables, perte analytics 1j acceptable |
| **Finances / paiements** | Haute | 8h | 0 (Stripe gère) | Stripe SLA 99.99%, pas de risque perte transactions |
| **RH / Légal** | Faible | 7j | 7j (documents Drive) | Pas d'impact opérationnel court terme |

### 2.2 Scénarios Sinistres Couverts

| Scénario | Probabilité | Impact | Mitigation BCP/DRP |
|----------|-------------|--------|---------------------|
| **Panne GitHub (>4h)** | Faible | Critique | Mirrors Git locaux, migration GitLab temporaire |
| **Compromission infrastructure Cloudflare** | Très Faible | Critique | Failover DNS provider (Route53), WAF alternatif |
| **Perte accès Anthropic API (shutdown)** | Très Faible | Critique | Fallback OpenAI/Gemini API (code adaptable), communication utilisateurs |
| **Ransomware infrastructure cloud** | Faible | Critique | Backups immutables 3-2-1, isolation environnements |
| **Catastrophe naturelle (bureaux)** | Très Faible | Faible | Remote-first, pas de single point of failure géographique |
| **Perte personnel clé (CTO)** | Faible | Haute | Documentation exhaustive (runbooks), backup roles définis |
| **Faillite fournisseur critique (Stripe)** | Très Faible | Haute | Exit strategy (migration PayPal/Paddle <30j), contrats backup |

---

## 3. Business Impact Analysis (BIA)

### 3.1 Dépendances Critiques

#### Infrastructure

| Asset | Criticité | Fournisseur | SLA | Mitigation Panne |
|-------|-----------|-------------|-----|------------------|
| **Repos Git** | Critique | GitHub | 99.95% | Mirrors locaux quotidiens (cron rsync), migration GitLab <4h |
| **CDN / DNS** | Critique | Cloudflare | 100% (guarantee) | Failover Route53 (DNS propagation 5min), origin AWS S3 |
| **API IA** | Critique | Anthropic | 99.9% | Fallback multi-provider (OpenAI, Gemini), abstraction layer code |
| **CI/CD** | Haute | GitHub Actions | 99.95% | Migration CircleCI/GitLab CI <8h (config YAML portable) |
| **Monitoring** | Moyenne | Sentry, Posthog | 99.9% | Perte temporaire acceptable (logs backup S3) |
| **Paiements** | Haute | Stripe | 99.99% | Migration PayPal <7j (API similaire), Paddle backup |

#### Personnel Clé

| Personne | Rôle | Connaissances critiques | Backup | Bus Factor |
|----------|------|-------------------------|--------|-----------|
| **CTO** | Architecture, infra, sécurité | ISMS complet, accès admin all | Dev Lead (documentation transfer 1 semaine) | 2 |
| **Dev Lead** | Codebase, releases | Architecture code, CI/CD pipelines | Senior Dev + docs runbooks | 2 |
| **Legal (DPO)** | RGPD, contrats | Registre RGPD, contrats fournisseurs | Cabinet externe (retainer) | 1 ⚠️ |
| **Product Manager** | Roadmap, clients | Feedback utilisateurs, priorités | CTO assume temporaire | 1 ⚠️ |

**Action P1 :** Augmenter bus factor Legal/Product (documentation knowledge transfer, contractors backup).

---

### 3.2 Impact Financier Downtime

| Downtime | Coût direct | Coût indirect | Total |
|----------|-------------|---------------|-------|
| **4h** | €0 (open-source gratuit) | Réputation faible (-5 GitHub stars estimé) | Négligeable |
| **24h** | €0 | Réputation modéré, perte momentum release | ~€500 (opportunité) |
| **7j** | €0 (si pas SaaS) | Réputation sévère, migration utilisateurs competitors | ~€5K (churn estimé) |
| **30j** | €0 (OSS) ou €50K (si SaaS pivot avec clients payants) | Perte irréversible confiance, shutdown possible | €50-100K |

**Conclusion :** Tolérance downtime <24h (gratuit OSS), <4h si SaaS payant (SLA 99.9% = 8.76h/an max).

---

## 4. Stratégies Continuité

### 4.1 Backups (3-2-1 Rule)

**Règle 3-2-1 :**
- **3 copies** : Production + Backup quotidien + Backup hebdomadaire
- **2 médias** : Cloud S3 + Git distributed (laptops équipe)
- **1 offsite** : S3 région différente (eu-west-1 prod, us-east-1 backup)

**Fréquence backups :**

| Asset | Fréquence | Retention | Méthode | Test Restore |
|-------|-----------|-----------|---------|--------------|
| **Code source** | Continu (Git push) | Infini (Git history) | GitHub + mirrors locaux quotidiens | Trimestriel (clone repo mirror) |
| **Documentation** | Continu (Git push) | Infini | GitHub + S3 static website backup | Trimestriel |
| **Configurations infra** | Quotidien (IaC Terraform) | 90j | S3 versioning + Git | Trimestriel (terraform plan dry-run) |
| **Analytics Posthog** | Hebdomadaire (export SQL) | 365j | S3 + PostgreSQL dump | Trimestriel (import staging DB) |
| **Logs Sentry** | Quotidien (API export) | 90j | S3 | Annuel (query S3 Select) |
| **Secrets 1Password** | Continu (auto-sync) | Infini (vault history) | 1Password cloud + export chiffré mensuel S3 | Annuel (restore vault test) |

**Immutabilité :** S3 Object Lock enabled (WORM - Write Once Read Many), retention 90j minimum (compliance ransomware).

**Chiffrement :** AES-256 at rest (S3 SSE-S3), TLS 1.3 in transit.

---

### 4.2 Redondance et Failover

#### DNS & CDN

**Actuel :** Cloudflare (single provider, mais SLA 100%).

**Failover plan :**
1. **Détection panne Cloudflare :** Monitoring externe (UptimeRobot, StatusCake) alerte si 5 checks consécutifs échec
2. **Basculement DNS :** Modification nameservers domaine `claude-craft.com` → Route53 AWS (TTL 300s = 5min propagation)
3. **Origin direct :** S3 static website hosting ou GitHub Pages (docs uniquement, pas d'API)
4. **Communication :** Status page (hébergé GitHub Pages, hors Cloudflare) notification utilisateurs

**SLA failover :** <30min détection → DNS modifié, <5-15min propagation DNS globale.

#### CI/CD

**Actuel :** GitHub Actions (single provider).

**Failover plan :**
1. **Migration config :** CircleCI ou GitLab CI (fichiers `.circleci/config.yml` ou `.gitlab-ci.yml` maintenus à jour trimestriellement)
2. **Secrets migration :** Export secrets GitHub Actions → import CircleCI/GitLab (process documenté runbook)
3. **Timeline :** <8h migration complète (tests, validation première release)

**Test :** Annuel, release test branche `ci-failover-test` via CircleCI, valider artefacts identiques GitHub Actions.

#### API Anthropic

**Actuel :** Anthropic Claude API (single provider criticalité haute).

**Fallback multi-provider :**

```typescript
// Abstraction layer (déjà implémenté partiel, à compléter M2)
interface LLMProvider {
  complete(prompt: string, options: CompletionOptions): Promise<string>;
}

class AnthropicProvider implements LLMProvider { /* ... */ }
class OpenAIProvider implements LLMProvider { /* ... */ }
class GeminiProvider implements LLMProvider { /* ... */ }

// Failover automatique
const providers = [
  new AnthropicProvider(), // Priorité 1
  new OpenAIProvider(),    // Fallback 1
  new GeminiProvider(),    // Fallback 2
];

async function completionWithFailover(prompt: string): Promise<string> {
  for (const provider of providers) {
    try {
      return await provider.complete(prompt);
    } catch (error) {
      console.error(`Provider ${provider.name} failed, trying next`);
    }
  }
  throw new Error('All LLM providers failed');
}
```

**SLA failover :** <1h détection indisponibilité Anthropic → activation fallback (config feature flag).

**Communication :** Email utilisateurs notification temporaire dégradation qualité (modèle fallback possiblement inférieur).

**Coût :** Budgéter API keys OpenAI/Gemini (dormantes, activation urgence), ~€200/mois standby si SaaS.

---

### 4.3 Work-from-Anywhere (Remote-First)

**Statut actuel :** Équipe 100% remote (pas de bureaux physiques).

**Avantages BCP :**
- ✅ Aucun single point of failure géographique (catastrophe naturelle localisée)
- ✅ Équipe distribuée fuseaux horaires (EU/US) → coverage 16h/jour

**Exigences devices :**
- Laptop chiffrement disque obligatoire (FileVault macOS, BitLocker Windows)
- VPN si déployé (accès ressources internes sécurisées)
- Backup laptop données critiques (Time Machine, cloud sync)

**Continuité communications :**
- **Primaire :** Slack (SLA 99.99%)
- **Backup :** Email Google Workspace (SLA 99.9%)
- **Urgence :** Phone tree (contacts mobiles CSIRT à jour trimestriellement)

---

## 5. Disaster Recovery Procedures

### 5.1 DR Scénario 1 — Perte GitHub (Panne >4h)

**Déclencheur :** GitHub status page indique "Major Outage" >2h, ou indisponibilité confirmée équipe.

**Actions immediates (<1h) :**

1. **Activation mirrors Git locaux :**
   ```bash
   # CTO ou Dev Lead exécute
   cd /backup/github-mirrors
   git clone --mirror github-mirror-latest/claude-craft.git
   ```

2. **Setup GitLab temporaire :**
   - Créer organization GitLab.com (gratuit)
   - Push repos depuis mirrors : `git push --mirror https://gitlab.com/claudecraft/claude-craft.git`
   - Configurer CI/CD GitLab (fichier `.gitlab-ci.yml` pré-testé)

3. **Migration équipe :**
   - Email all-hands : "GitHub down, switch GitLab temporaire : [LIEN]"
   - Provisionning accès GitLab équipe (invitations)
   - PRs en cours → recréer GitLab Merge Requests

**Timeline :**
- H+0 : Détection panne GitHub
- H+1 : Mirrors restaurés GitLab
- H+2 : CI/CD GitLab opérationnel
- H+3 : Équipe migrated, releases possibles

**Retour GitHub (recovery) :**
- Sync GitLab → GitHub (push --force si divergence mineure, ou merge si développements GitLab significatifs)
- Communication équipe retour GitHub
- Post-mortem : leçons panne, amélioration process

**Coût :** €0 (GitLab free tier), temps équipe ~8h CTO+DevLead.

---

### 5.2 DR Scénario 2 — Ransomware Production

**Déclencheur :** Détection chiffrement fichiers infrastructure cloud (S3, EC2 si déployé SaaS).

**Actions immediates (<15min) :**

1. **Isolation infrastructure :**
   ```bash
   # Révocation credentials AWS/GCP (CTO exécute)
   aws iam delete-access-key --access-key-id AKIA... --user-name prod-user
   
   # Shutdown instances EC2 compromises (si applicable)
   aws ec2 stop-instances --instance-ids i-1234567890abcdef0
   ```

2. **Activation backups immutables :**
   ```bash
   # Restore S3 depuis version pré-ransomware
   aws s3 sync s3://backup-bucket-versioned/ s3://prod-bucket/ --delete
   ```

3. **Forensics :**
   - Snapshot volumes EBS compromis (investigation post-recovery)
   - Export logs CloudTrail 7j précédents (identifier vecteur attaque)

**Timeline :**
- H+0 : Détection ransomware
- H+15min : Infrastructure isolée
- H+1 : Backups restaurés environnement staging (validation intégrité)
- H+4 : Production restaurée, services nominaux
- H+24 : Investigation forensics, identification vecteur
- J+7 : Post-mortem, remediations

**Communication :**
- Notification clients si downtime >4h (email, status page)
- Notification ANSSI CERT-FR (volontaire, contribution stats ransomware France)
- Notification assurance cyber <48h

**Coût :** Forensics externe €5-15K, temps équipe ~40h.

---

### 5.3 DR Scénario 3 — Perte CTO (Indisponibilité >7j)

**Déclencheur :** CTO accident, maladie, indisponibilité >7j.

**Actions immediates (<24h) :**

1. **Activation backup Incident Commander :**
   - CEO assume rôle IC temporaire
   - Dev Lead assume décisions techniques quotidiennes

2. **Accès urgence (break-glass) :**
   - Coffre physique CEO contient :
     * Recovery codes Google Workspace super admin
     * Recovery codes GitHub organization owner
     * Backup YubiKey admin
     * Liste credentials critiques (1Password master emergency kit)
   - CEO accède coffre, provisionne Dev Lead accès admin temporaire

3. **Documentation knowledge transfer :**
   - Runbooks (Google Drive CSIRT folder) :
     * Infrastructure setup (Cloudflare, AWS, GitHub)
     * Release process (CI/CD, deployment)
     * Incident response (IRP playbooks)
     * Contacts fournisseurs critiques
   - Dev Lead lit runbooks, Q&A avec équipe (si détails manquants)

4. **Communication :**
   - Interne : Email all-hands "CTO indisponible temporairement, Dev Lead assume technique"
   - Externe : Aucune (sauf si clients SaaS avec SLA support)
   - Fournisseurs critiques : Notification contact backup (Anthropic, GitHub account managers)

**Timeline :**
- J+0 : CTO indisponible, notification CEO
- J+1 : Break-glass activé, Dev Lead provisionned admin
- J+2 : Opérations stabilisées (releases possibles, support continue)
- J+7 : Évaluation besoin embauche CTO temporaire (contractor) ou promotion Dev Lead

**Retour CTO (recovery) :**
- Handover Dev Lead → CTO (briefing incidents, décisions prises)
- Révocation accès admin temporaire Dev Lead (retour permissions standard)
- Post-mortem : amélioration documentation, réduction bus factor

**Coût :** Contractor CTO temporaire €8-15K/mois si >30j, ou promotion Dev Lead (augmentation salaire).

---

## 6. Tests et Exercices

### 6.1 Tests Restauration Backups (Trimestriel)

**Scope :** Valider intégrité backups, RTO/RPO respectés.

**Process :**

**Semaine 1 trimestre :**
- Dev Lead planifie test (annonce équipe, créneau 2h)

**Jour test :**
1. **Restore code source :**
   - Clone repo depuis mirror local (simuler perte GitHub)
   - Vérifier `git log` cohérent, dernier commit <24h
   - Build projet depuis clone : succès (dépendances résolues)

2. **Restore configurations :**
   - `terraform plan` depuis backup S3 Terraform state
   - Dry-run : 0 changement détecté (state cohérent infrastructure actuelle)

3. **Restore analytics :**
   - Import dump PostgreSQL Posthog dans DB staging
   - Query événements 7j précédents : count cohérent prod

4. **Restore secrets :**
   - Export 1Password vault test
   - Import vault environnement isolé (1Password account test)
   - Vérifier secrets décryptables, pas de corruption

**Livrable :** Rapport test (succès/échec, RTO/RPO mesurés, anomalies) — archivé Google Drive.

**KPI :**
- **Succès restore :** 100% (tolérance 0% échec)
- **RTO mesuré :** ≤ RTO cible (4h code source, 24h analytics)
- **RPO mesuré :** ≤ RPO cible (15min code, 1h analytics)

---

### 6.2 DR Drill Complet (Annuel)

**Objectif :** Tester process DR end-to-end, identifier gaps.

**Scénario (rotation annuelle) :**
- **Année 1 (2026) :** Perte GitHub (migration GitLab)
- **Année 2 (2027) :** Ransomware production (restore backups immutables)
- **Année 3 (2028) :** Perte CTO (break-glass, knowledge transfer)

**Process DR Drill 2026 (Perte GitHub) :**

**J-7 :**
- CTO annonce DR drill date/heure (vendredi 16h, impact minimal)
- Briefing équipe : objectifs, timeline, critères succès

**J-0 16h00 (Kick-off) :**
- CTO simule panne GitHub (blocage accès via `/etc/hosts` override ou firewall règle)
- Timer démarre : mesure RTO

**J-0 16h15 (Detection) :**
- Équipe détecte "GitHub inaccessible"
- Dev Lead active playbook DR GitHub (section 5.1)

**J-0 16h30 (Containment) :**
- Mirrors Git restaurés localement
- Push repos GitLab

**J-0 17h30 (Recovery) :**
- CI/CD GitLab configuré
- Première release test via GitLab CI : succès
- Timer stop : RTO mesuré 1h30 (cible 4h ✅)

**J-0 18h00 (Debrief) :**
- Réunion équipe : retours, gaps identifiés (ex: fichier `.gitlab-ci.yml` obsolète, mise à jour nécessaire)
- Rédaction rapport DR drill

**Livrable :** Rapport DR drill (scénario, RTO mesuré, gaps, remediations, photos/screenshots) — archivé + présentation management.

**KPI :**
- **RTO respecté :** Oui/Non (cible <4h)
- **Gaps identifiés :** Liste, severity, deadline remediation
- **Participation équipe :** 100% CSIRT + 80% dev team

---

### 6.3 Chaos Engineering (Optionnel, si SaaS)

**Principe :** Introduire pannes contrôlées production pour tester résilience.

**Outils :** Chaos Monkey (Netflix), Gremlin, LitmusChaos (Kubernetes).

**Exemples expériences :**
- Shutdown aléatoire instance EC2 (valider auto-scaling)
- Latence réseau artificielle +200ms (valider timeouts)
- Indisponibilité API Anthropic simulée (valider fallback OpenAI)

**Statut :** Non applicable actuellement (pas d'infrastructure complexe), envisager si SaaS >100K utilisateurs.

---

## 7. Communication Crise

### 7.1 Canaux Communication

**Interne (équipe) :**
- **Primaire :** Slack #crisis-management (créé à la demande, archivé post-crise)
- **Backup :** Email Google Workspace all-hands
- **Urgence :** Phone tree (SMS/appels si Slack+email down)

**Externe (clients/utilisateurs) :**
- **Status page :** [status.claude-craft.com](https://status.claude-craft.com) (hébergé GitHub Pages, hors infrastructure principale)
- **Email :** Notification liste diffusion (si SaaS avec emails collectés)
- **Social media :** Twitter [@ClaudeCraft](https://twitter.com/claudecraft) updates (backup communication)

**Régulateurs/Partenaires :**
- **ANSSI CERT-FR :** cert-fr.cossi@ssi.gouv.fr (incidents cyber majeurs)
- **Fournisseurs critiques :** Account managers Anthropic, GitHub, Cloudflare

---

### 7.2 Templates Communication

**Template Status Page (Incident Majeur) :**

```markdown
## [DATE] — Major Service Disruption

**Status:** Investigating  
**Last Update:** [TIMESTAMP UTC]  
**Affected Services:** Claude Craft releases, documentation  

**Timeline:**
- 14:32 UTC: Issue detected (GitHub unavailable)
- 14:45 UTC: Engineering team activated
- 15:00 UTC: Failover to GitLab initiated
- 15:30 UTC: Partial service restored (docs accessible)
- 16:00 UTC: Full service restored (releases operational via GitLab)

**Next Update:** [TIMESTAMP] or when status changes

**Details:**
Our primary code hosting provider (GitHub) is experiencing a major outage. We have activated 
our disaster recovery plan and migrated to GitLab temporarily. Releases and documentation 
are now operational. No data loss. We will migrate back to GitHub once service is restored.

**Actions Required:**
- Developers: Use GitLab temporary repo: https://gitlab.com/claudecraft/claude-craft
- Users: No action needed, docs and downloads operational

**Apologies:**
We sincerely apologize for the inconvenience. Our team is monitoring the situation 24/7.

**Contact:** support@claudecraft.com
```

**Template Email Utilisateurs (Post-Recovery) :**

```
Objet : Claude Craft Service Restored — Incident Post-Mortem

Bonjour,

Le [DATE], Claude Craft a connu une interruption de service de [DURÉE] en raison de 
[CAUSE RÉSUMÉE : ex. panne fournisseur GitHub].

**Ce qui s'est passé :**
[TIMELINE SIMPLIFIÉE]

**Actions prises :**
Notre équipe a immédiatement activé notre plan de continuité, migrant vers une infrastructure 
de secours. Le service a été rétabli à [HEURE] avec zéro perte de données.

**Leçons et améliorations :**
- [REMEDIATION 1 : ex. Redondance fournisseurs renforcée]
- [REMEDIATION 2 : ex. Tests DR trimestriels au lieu annuels]

**Engagement :**
La disponibilité de Claude Craft est notre priorité absolue. Nous avons pris des mesures pour 
qu'un incident similaire ne se reproduise pas.

Post-mortem détaillé (technique) : [LIEN BLOG]

Merci de votre patience et confiance.

Cordialement,
[CTO NAME]
Co-founder & CTO, The Bearded CTO
```

---

## 8. Rôles et Responsabilités

### 8.1 Crisis Management Team

| Rôle | Personne | Responsabilités | Disponibilité |
|------|----------|-----------------|---------------|
| **Crisis Commander** | CTO | Décisions stratégiques, coordination, communication direction | 24/7 on-call |
| **Technical Recovery Lead** | Dev Lead | Exécution DR procedures, restauration systèmes | 24/7 on-call |
| **Communications Lead** | Product Manager (ou Legal si <10 personnes) | Status page updates, emails clients, social media | Best effort 8h |
| **Business Continuity Lead** | CEO | Évaluation impact business, décisions budgétaires urgentes, communication partenaires | On-demand |

**Backup roles :** CEO assume Crisis Commander si CTO indisponible, Senior Dev assume Technical Lead si Dev Lead indisponible.

---

## 9. Métriques et KPIs

### 9.1 Availability Metrics

| Métrique | Cible | Mesure | Fréquence |
|----------|-------|--------|-----------|
| **Uptime Claude Craft docs** | 99.9% (8.76h downtime/an) | UptimeRobot monitoring | Mensuel |
| **Uptime releases (CI/CD)** | 99.5% (43.8h downtime/an) | GitHub Actions status API | Mensuel |
| **RTO effectif (incidents)** | ≤4h | Temps detection → service nominal | Par incident |
| **RPO effectif (incidents)** | ≤15min code, ≤1h analytics | Delta dernier backup → incident | Par incident |
| **Backup success rate** | 100% | Monitoring cron jobs backups | Quotidien |
| **Restore test success rate** | 100% | Tests trimestriels | Trimestriel |

### 9.2 Reporting

**Mensuel :** Dashboard Google Sheets :
- Uptime % services critiques
- Incidents majeurs (>1h downtime), root causes
- Backup jobs succès/échecs

**Trimestriel :** Rapport BCP/DRP CTO → CEO :
- Tests restauration résultats
- Gaps identifiés, remediations
- Évolution dépendances critiques (nouveaux fournisseurs, bus factor)

**Annuel :** Management review ISO 27001 :
- DR drill résultats
- Efficacité BCP/DRP (RTO/RPO respectés ?)
- Recommandations investissements (redondance, assurance, formations)

---

## 10. Maintenance et Mise à Jour

### 10.1 Revue Annuelle BCP/DRP

**Calendrier :** Avril (aligné ISP, post-DR drill annuel).

**Process :**
1. **Audit dépendances :** Nouveaux fournisseurs critiques ? Changements SLA existants ?
2. **Mise à jour RTO/RPO :** Évolution criticité fonctions (ex: SaaS lancé → RTO 1h au lieu 4h)
3. **Revue contacts :** Phone tree, account managers fournisseurs, CSIRT à jour
4. **Mise à jour runbooks :** Changements infrastructure, nouveaux playbooks DR
5. **Validation équipe :** Présentation BCP/DRP updated, Q&A

**Approbation :** CTO rédige, CEO approuve, communication équipe.

### 10.2 Déclencheurs Revue Extraordinaire

- Incident DR activé (post-mortem intègre learnings BCP/DRP)
- Changement fournisseur critique (ex: migration AWS → GCP)
- Croissance significative (x10 utilisateurs → RTO/RPO plus stricts)
- Nouvelle réglementation (ex: NIS 2 impose RTO/RPO spécifiques)

---

## 11. Annexes

### Annexe A — Checklist Crisis Commander

**Activation DR :**
- [ ] Incident qualifié DR (downtime prévu >RTO ou perte données >RPO)
- [ ] Crisis Management Team activé (Slack #crisis-management, SMS si urgence)
- [ ] Runbook DR scénario identifié (section 5)
- [ ] Timer RTO démarré (horodatage détection incident)

**Execution DR :**
- [ ] Actions DR exécutées (Technical Recovery Lead coordonne)
- [ ] Communication interne (équipe informée, no panic)
- [ ] Communication externe (status page updated <30min détection)
- [ ] Monitoring recovery (RTO countdown, tests validation)

**Post-Recovery :**
- [ ] Service nominal confirmé (monitoring, tests utilisateurs)
- [ ] RTO/RPO mesurés, documentés
- [ ] Communication post-mortem clients (si applicable)
- [ ] Debrief équipe (<7j), rapport DR

---

### Annexe B — Contacts Urgence

**CSIRT (reprise Annexe Incident Response Plan) :**
- CTO (Crisis Commander) : [MOBILE]
- Dev Lead (Technical Recovery) : [MOBILE]
- CEO (Business Continuity) : [MOBILE]

**Fournisseurs Critiques :**
- **GitHub Support :** support@github.com (ticket) | @githubstatus Twitter
- **Cloudflare Support :** support@cloudflare.com | +1 (888) 993-5273
- **Anthropic Support :** support@anthropic.com (via dashboard) | Account Manager [NOM] [EMAIL]
- **Google Workspace Support :** Admin console > Support (chat 24/7 si Business plan)
- **Stripe Support :** support.stripe.com (chat) | +1 (888) 926-2289

**Prestataires Externes :**
- **Assurance Cyber :** [À compléter post-souscription] — Déclaration sinistre <48h
- **Forensics IT :** [À compléter post-sélection] — Intervention urgence <24h

---

### Annexe C — Glossary

| Terme | Définition |
|-------|------------|
| **BCP** | Business Continuity Plan — plan continuité activité |
| **DRP** | Disaster Recovery Plan — plan reprise après sinistre |
| **RTO** | Recovery Time Objective — délai maximum acceptable restauration service |
| **RPO** | Recovery Point Objective — perte données maximum acceptable |
| **3-2-1 Rule** | 3 copies données, 2 médias différents, 1 offsite |
| **Immutable backups** | Backups non modifiables (protection ransomware) |
| **Failover** | Basculement automatique/manuel infrastructure backup |
| **DR Drill** | Exercice test disaster recovery complet |
| **Bus factor** | Nombre personnes perdre = projet bloqué (cible ≥2) |

---

## 12. Approbation

**Version :** 1.0.0  
**Date création :** 2026-04-15  
**Prochaine revue :** 2027-04-15 ou post-DR activation  

| Rôle | Nom | Date | Signature |
|------|-----|------|-----------|
| **Rédaction** | CTO (Crisis Commander) | 2026-04-15 | ________________ |
| **Revue Business** | CEO | 2026-04-__ | ________________ |
| **Approbation** | CTO + CEO | 2026-04-__ | ________________ |

---

**FIN DU DOCUMENT — DRAFT v1.0.0**

**Contact urgence :** CTO [MOBILE] | crisis@the-bearded-bear.com  
**Confidentialité :** Internal — Management + CSIRT uniquement
