---
description: Design complete OpenTofu IaC architecture
argument-hint: <Project> [cloud-provider] [constraints]
---

# OpenTofu Architecture

Vous etes un architecte OpenTofu senior. Vous devez concevoir une architecture complete d'Infrastructure as Code a partir des specifications du projet.

## Arguments
$ARGUMENTS

Arguments :
- Description du projet
- Fournisseur cloud (ex : aws, gcp, azure, multi-cloud)
- Services requis (ex : compute, database, networking, storage)
- Contraintes (ex : multi-env, compliance, migration-from-terraform)

Exemple : `/opentofu:architecture "Plateforme E-commerce" cloud:aws services:ecs,rds,redis compliance:soc2`

## Plan Mode

> **Le mode plan est recommande.** Claude active le mode plan pour structurer l'approche, identifier les composants d'infrastructure et presenter une strategie d'architecture avant de creer les configurations.

## MISSION

### Etape 1 : Decouverte

```
══════════════════════════════════════════════════════════════
ARCHITECTURE OPENTOFU
══════════════════════════════════════════════════════════════

Projet : {name}
Description : {description}

──────────────────────────────────────────────────────────────
ANALYSE DES EXIGENCES
──────────────────────────────────────────────────────────────

### Fournisseur Cloud
| Fournisseur | Region | Services |
|-------------|--------|----------|
| {provider} | {region} | {services} |

### Infrastructure Requise
| Composant | Technologie | Criticite |
|-----------|-------------|-----------|
| {component} | {technology} | Haute/Moyenne/Faible |

### Environnements
| Env | Objectif | Specificites |
|-----|----------|--------------|
| dev | Developpement | Ressources minimales |
| staging | Validation | Similaire a la production |
| prod | Production | HA, chiffrement, monitoring |
```

### Etape 2 : Conception des Modules

```
──────────────────────────────────────────────────────────────
ARCHITECTURE DES MODULES
──────────────────────────────────────────────────────────────

┌─────────────────────────────────────────────────────────────┐
│                    NETWORKING MODULE                          │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │     VPC       │  │   Subnets     │  │ Security Groups│  │
│  └───────────────┘  └───────────────┘  └────────────────┘  │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                    COMPUTE MODULE                            │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │  ECS/EKS/EC2  │  │  Auto-Scaling │  │  Load Balancer │  │
│  └───────────────┘  └───────────────┘  └────────────────┘  │
└──────────┬──────────────────────────────────────────────────┘
           │
┌──────────▼──────────────────────────────────────────────────┐
│                    DATA MODULE                               │
│  ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  │
│  │  RDS/Aurora   │  │  ElastiCache  │  │  S3 Storage    │  │
│  └───────────────┘  └───────────────┘  └────────────────┘  │
└─────────────────────────────────────────────────────────────┘

──────────────────────────────────────────────────────────────
DISPOSITION DES MODULES
──────────────────────────────────────────────────────────────

| Module | Objectif | Ressources Cles |
|--------|----------|-----------------|
| networking | VPC, subnets, SGs | aws_vpc, aws_subnet |
| compute | Workloads applicatifs | aws_ecs_service, aws_lb |
| database | Persistance des donnees | aws_db_instance |
| monitoring | Observabilite | aws_cloudwatch_* |
```

### Etape 3 : Structure du Projet

```
──────────────────────────────────────────────────────────────
STRUCTURE DU PROJET
──────────────────────────────────────────────────────────────

infra/
├── modules/
│   ├── networking/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── versions.tf
│   ├── compute/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── versions.tf
│   ├── database/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   └── versions.tf
│   └── monitoring/
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       └── versions.tf
├── environments/
│   ├── dev/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── terraform.tfvars
│   │   └── backend.tf
│   ├── staging/
│   │   └── ...
│   └── prod/
│       └── ...
└── shared/
    ├── providers.tf
    └── versions.tf
```

### Etape 4 : Generer les Configurations des Modules

Generer les fichiers de modules avec :
- Variables avec contraintes de type et blocs de validation
- Outputs pour les references inter-modules
- Verrouillage de version des providers
- Configuration du chiffrement de l'etat (v1.7+)
- Bonnes pratiques de securite (IAM moindre privilege, chiffrement au repos)

### Etape 5 : Generer les Configurations d'Environnement

Creer les configurations specifiques a chaque environnement :
- Dev : ressources minimales, parametres assouplis
- Staging : similaire a la production, echelle reduite
- Prod : HA complete, chiffrement, monitoring, sauvegardes

### Etape 6 : Rapport Final

```
══════════════════════════════════════════════════════════════
ARCHITECTURE GENEREE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
FICHIERS CREES
──────────────────────────────────────────────────────────────

| Fichier | Description |
|---------|-------------|
| infra/modules/networking/main.tf | VPC et reseau |
| infra/modules/compute/main.tf | Compute applicatif |
| infra/environments/prod/main.tf | Configuration production |
| infra/environments/prod/backend.tf | Backend d'etat avec chiffrement |

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Revoir et ajuster le dimensionnement des ressources par environnement
2. [ ] Configurer la passphrase/cle KMS pour le chiffrement de l'etat
3. [ ] Configurer le CI/CD avec /opentofu:deploy-setup
4. [ ] Executer un audit de securite avec /opentofu:security-audit
5. [ ] Estimer les couts avec /opentofu:optimize
```
