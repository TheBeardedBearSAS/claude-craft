---
description: Setup CI/CD pipeline for OpenTofu
argument-hint: <Platform> [environments]
---

# OpenTofu Deploy Setup

Vous etes un specialiste du deploiement OpenTofu. Vous devez configurer un pipeline CI/CD complet pour un deploiement securise de l'infrastructure.

## Arguments
$ARGUMENTS

Arguments :
- Plateforme CI/CD (github-actions, gitlab-ci)
- (Optionnel) Environnements : dev,staging,prod
- (Optionnel) Strategie d'approbation : manual, auto-dev-manual-prod

Exemple : `/opentofu:deploy-setup "github-actions" envs:dev,staging,prod approval:manual-prod`

## Plan Mode

> **Le mode plan est obligatoire.** Avant l'execution, Claude active le mode plan pour analyser le projet, proposer une strategie de deploiement et attendre la validation.

## MISSION

### Etape 1 : Analyser le Projet

```
══════════════════════════════════════════════════════════════
CONFIGURATION DU DEPLOIEMENT OPENTOFU
══════════════════════════════════════════════════════════════

Projet : {name}

──────────────────────────────────────────────────────────────
DETECTION DU PROJET
──────────────────────────────────────────────────────────────

| Composant | Detecte | Details |
|-----------|---------|---------|
| Version OpenTofu | {version} | versions.tf |
| Backend | {type} | {S3/GCS/Azure} |
| Environnements | {nombre} | {liste} |
| Chiffrement de l'etat | {oui/non} | {methode} |
| Modules | {nombre} | {liste} |
```

### Etape 2 : Concevoir la Strategie du Pipeline

```
──────────────────────────────────────────────────────────────
STRATEGIE DU PIPELINE
──────────────────────────────────────────────────────────────

Plateforme : {GitHub Actions / GitLab CI}
Approbation : {auto-dev / manual-staging / manual-prod}

Pipeline :
  PR ouverte
    -> Valider (fmt, validate)
    -> Plan (par environnement)
    -> Commenter la PR avec la sortie du plan

  PR mergee sur main
    -> Plan (artefact sauvegarde)
    -> Apply dev (auto)
    -> Apply staging (auto/manuel)
    -> Apply prod (approbation manuelle)
```

### Etape 3 : Generer le Pipeline CI/CD

Generer la configuration complete du pipeline avec :
- Etape de setup OpenTofu (`opentofu/setup-opentofu@v1`)
- Stages init, plan, apply
- Artefact du plan pour des applies securises
- Commentaire PR avec la sortie du plan
- Portes d'approbation par environnement
- Authentification OIDC (pas de secrets a longue duree)

### Etape 4 : Generer la Detection de Derive

Generer le workflow de detection de derive planifie :
- Execution basee sur un cron (ex : matins en semaine)
- Plan avec `-detailed-exitcode`
- Notification en cas de derive detectee

### Etape 5 : Generer la Procedure de Rollback

Documenter la strategie de rollback :
- Versionnage et restauration de l'etat
- Destroy cible pour les nouvelles ressources
- Procedures d'intervention manuelle

### Etape 6 : Rapport Final

```
══════════════════════════════════════════════════════════════
RAPPORT DE CONFIGURATION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
FICHIERS CREES
──────────────────────────────────────────────────────────────

| Fichier | Description |
|---------|-------------|
| .github/workflows/tofu-plan.yml | Workflow de plan PR |
| .github/workflows/tofu-apply.yml | Workflow d'apply |
| .github/workflows/tofu-drift.yml | Detection de derive |

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Configurer le fournisseur OIDC dans le compte cloud
2. [ ] Creer les roles IAM pour le plan et l'apply
3. [ ] Definir les regles de protection d'environnement GitHub
4. [ ] Tester le pipeline avec un changement sans effet
5. [ ] Configurer le monitoring avec la detection de derive
```
