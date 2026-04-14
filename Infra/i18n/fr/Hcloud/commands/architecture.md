---
description: Design complete Hetzner Cloud infrastructure architecture
argument-hint: <Project> [constraints]
---

# Hcloud Architecture

> ⚠️ **Migration obligatoire avant 2026-07-01** : le paramètre `datacenter` est déprécié au profit de `location`. Provider Terraform Hetzner Cloud >= 1.58.0. Source : https://github.com/hetznercloud/terraform-provider-hcloud/releases

Vous etes un architecte senior Hetzner Cloud. Vous devez concevoir une architecture d'infrastructure cloud complete a partir des specifications du projet.

## Arguments
$ARGUMENTS

Arguments :
- Description du projet
- Charge de travail cible (ex. web-application, microservices, database-cluster)
- Contraintes (ex. budget, location, conformite)

Exemple : `/hcloud:architecture "Plateforme e-commerce" workload:web-application location:fsn1 budget:100eur`

## Plan Mode

> **Le mode plan est recommande.** Claude active le mode plan pour structurer l'approche, identifier les types de serveurs et presenter une topologie reseau avant de generer les commandes CLI hcloud.

## MISSION

### Etape 1 : Decouverte

```
══════════════════════════════════════════════════════════════
HCLOUD ARCHITECTURE
══════════════════════════════════════════════════════════════

Project: {name}
Description: {description}

──────────────────────────────────────────────────────────────
ANALYSE DES EXIGENCES
──────────────────────────────────────────────────────────────

### Stack applicatif
| Component | Technology | Requirements |
|-----------|------------|-------------|
| Web Server | {tech} | {besoins cpu/ram} |
| Application | {tech} | {besoins cpu/ram} |
| Database | {tech} | {besoins stockage/iops} |

### Environnement cible
| Attribut | Valeur |
|----------|--------|
| Location | {fsn1/nbg1/hel1/ash/hil/sin} |
| Budget | {limite mensuelle} |
| HA requis | {oui/non} |
| Conformite | {RGPD/aucune} |
```

### Etape 2 : Conception de l'architecture

```
──────────────────────────────────────────────────────────────
TOPOLOGIE D'INFRASTRUCTURE
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                    HETZNER CLOUD                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Load Balancer│  │  Firewalls   │  │ Floating IPs │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│  NETWORK → SERVERS → VOLUMES → SNAPSHOTS                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ Private  │  │ CX/CPX/  │  │ Block    │  │ Backup   │   │
│  │ Subnets  │  │ CAX/CCX  │  │ Storage  │  │ Images   │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
SELECTION DES TYPES DE SERVEURS
──────────────────────────────────────────────────────────────

| Role | Server Type | Count | Justification |
|------|-------------|-------|---------------|
| Web | {cax21/cx22} | {n} | {raison} |
| App | {cpx31/cax31} | {n} | {raison} |
| DB | {ccx23/ccx33} | {n} | {raison} |

──────────────────────────────────────────────────────────────
CONCEPTION RESEAU
──────────────────────────────────────────────────────────────

| Subnet | IP Range | Objectif | Servers |
|--------|----------|----------|---------|
| web | 10.0.1.0/24 | Frontends web | web-01, web-02 |
| app | 10.0.2.0/24 | Tier applicatif | app-01 |
| data | 10.0.3.0/24 | Bases de donnees, cache | db-01, redis-01 |
```

### Etape 3 : Regles de firewall

```
──────────────────────────────────────────────────────────────
CONCEPTION DES FIREWALLS
──────────────────────────────────────────────────────────────

| Firewall | Direction | Protocol | Port | Source | Applied To |
|----------|-----------|----------|------|--------|------------|
| fw-web | in | TCP | 80,443 | 0.0.0.0/0 | label:role=web |
| fw-web | in | TCP | 22 | {office-ip}/32 | label:role=web |
| fw-db | in | TCP | 5432 | 10.0.0.0/8 | label:role=db |
| fw-db | in | TCP | 22 | 10.0.0.0/8 | label:role=db |
```

### Etape 4 : Generer les commandes CLI hcloud

Generer le script de provisionnement complet avec les commandes CLI hcloud pour :
- Creation du reseau et des sous-reseaux
- Regles de firewall avec label selectors
- Enregistrement de la cle SSH
- Placement groups pour les services critiques
- Creation de serveurs avec cloud-init
- Creation et attachement des volumes
- Load balancer avec health checks
- Assignation de floating IP (si necessaire)

### Etape 5 : Generer le Cloud-Init

Generer des templates `cloud-init.yml` pour chaque role de serveur avec l'installation des paquets, le durcissement de la securite (fail2ban, UFW) et la configuration applicative.

### Etape 6 : Rapport final

```
══════════════════════════════════════════════════════════════
ARCHITECTURE GENEREE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUME DES RESSOURCES
──────────────────────────────────────────────────────────────

| Ressource | Nombre | Cout mensuel |
|-----------|--------|-------------|
| Servers | {n} | {cout}€ |
| Volumes | {n} | {cout}€ |
| Load Balancers | {n} | {cout}€ |
| Floating IPs | {n} | {cout}€ |
| **Total** | | **{total}€** |

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Revoir les types de serveurs et ajuster selon le budget
2. [ ] Auditer la posture de securite avec /hcloud:security-audit
3. [ ] Configurer le pipeline CI/CD avec /hcloud:deploy-setup
4. [ ] Optimiser les couts avec @hcloud-cost
5. [ ] Mettre en place le monitoring et l'alerting
```
