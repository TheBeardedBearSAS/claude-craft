---
description: Setup CI/CD pipeline for Hetzner Cloud deployments
argument-hint: <Platform> [ci-tool]
---

# Hcloud Deploy Setup

Vous etes un specialiste du deploiement Hetzner Cloud. Vous devez configurer un pipeline CI/CD complet pour les deploiements d'infrastructure basee sur hcloud.

## Arguments
$ARGUMENTS

Arguments :
- Description de la plateforme
- (Optionnel) Outil CI : github-actions, gitlab-ci (defaut : github-actions)
- (Optionnel) Strategie : blue-green, snapshot, rebuild (defaut : blue-green)

Exemple : `/hcloud:deploy-setup "Plateforme web" ci:github-actions strategy:blue-green`

## Plan Mode

> **Le mode plan est obligatoire.** Avant d'executer, Claude active le mode plan pour analyser le projet, proposer une strategie de pipeline et attendre la validation.

## MISSION

### Etape 1 : Analyser le projet

```
══════════════════════════════════════════════════════════════
HCLOUD DEPLOY SETUP
══════════════════════════════════════════════════════════════

Project: {name}

──────────────────────────────────────────────────────────────
DETECTION DE L'INFRASTRUCTURE
──────────────────────────────────────────────────────────────

| Composant | Detecte | Details |
|-----------|---------|---------|
| Servers | {nombre} | {types, localisations} |
| Networks | {nombre} | {noms, sous-reseaux} |
| Load Balancers | {nombre} | {noms} |
| Firewalls | {nombre} | {noms} |
| Volumes | {nombre} | {tailles} |
| Floating IPs | {nombre} | {assignees/non assignees} |
| Snapshots | {nombre} | {date du dernier} |
```

### Etape 2 : Concevoir le pipeline

```
──────────────────────────────────────────────────────────────
STRATEGIE DE PIPELINE
──────────────────────────────────────────────────────────────

Outil CI : {GitHub Actions / GitLab CI}
Strategie : {Blue-Green / Snapshot / Rebuild}

Pipeline :
  Push / PR
    → Lint & Test (code applicatif)
    → Build Image (Packer, optionnel)
    → Deploy Staging (auto)
    → Smoke Tests
    → Approval Gate
    → Deploy Production

──────────────────────────────────────────────────────────────
SELECTION DE LA STRATEGIE
──────────────────────────────────────────────────────────────

| Etape | Outil | Declencheur | Artefacts |
|-------|-------|-------------|-----------|
| Build | Packer / cloud-init | On push | Snapshot ID |
| Deploy Staging | hcloud CLI | On merge to main | Statut serveur |
| Smoke Test | curl / health check | Apres staging | Rapport de test |
| Deploy Prod | hcloud CLI | Approbation manuelle | Statut serveur |
```

### Etape 3 : Generer le pipeline CI

Generer le fichier de configuration CI/CD :

Pour **GitHub Actions** (`.github/workflows/hcloud-deploy.yml`) :
- Installer le CLI hcloud via `hetznercloud/setup-hcloud@v1`
- Construire l'image Packer (optionnel) ou utiliser cloud-init
- Deployer sur le staging lors du merge sur main
- Executer les health checks sur le staging
- Deployer en production avec une porte d'approbation manuelle
- Blue-green : creer un nouveau serveur, basculer la floating IP, supprimer l'ancien
- Utiliser GitHub Secrets pour `HCLOUD_TOKEN` par environnement

Pour **GitLab CI** (`.gitlab-ci.yml`) :
- Utiliser les stages : build, deploy-staging, test, deploy-prod
- Installer le CLI hcloud via curl/pip
- Utiliser les variables protegees pour HCLOUD_TOKEN

### Etape 4 : Generer les scripts de deploiement

Generer les scripts d'aide au deploiement :
- `scripts/deploy.sh` -- Script principal de deploiement utilisant le CLI hcloud
- `scripts/rollback.sh` -- Rollback vers le snapshot precedent
- `scripts/health-check.sh` -- Verification de la sante du deploiement

### Etape 5 : Generer le template Packer (si base sur les images)

Generer le template Packer `hcloud.pkr.hcl` pour construire des images golden avec le plugin builder hcloud.

### Etape 6 : Rapport final

```
══════════════════════════════════════════════════════════════
RAPPORT DE CONFIGURATION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
FICHIERS CREES
──────────────────────────────────────────────────────────────

| Fichier | Description |
|---------|-------------|
| .github/workflows/hcloud-deploy.yml | Pipeline CI/CD |
| scripts/deploy.sh | Script de deploiement |
| scripts/rollback.sh | Script de rollback |
| scripts/health-check.sh | Script de health check |
| hcloud.pkr.hcl | Template Packer (si applicable) |
| cloud-init.yml | Template de provisionnement serveur |

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Stocker HCLOUD_TOKEN dans les secrets CI (par environnement)
2. [ ] Stocker la cle privee SSH dans les secrets CI
3. [ ] Tester le pipeline de bout en bout sur une branche feature
4. [ ] Auditer la posture de securite avec /hcloud:security-audit
5. [ ] Optimiser les couts avec /hcloud:optimize
```
