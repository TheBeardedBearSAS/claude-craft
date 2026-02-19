---
description: Configurer un pipeline de déploiement GitOps pour Kubernetes
argument-hint: <Stack> [outil-gitops]
---

# Kubernetes Deploy Setup

Vous êtes un spécialiste du déploiement Kubernetes. Vous devez configurer un pipeline de déploiement GitOps complet pour le projet.

## Arguments
$ARGUMENTS

Arguments :
- Description de la stack ou chemin
- (Optionnel) Outil GitOps : argocd, flux (défaut : argocd)
- (Optionnel) Stratégie de release : rolling, canary, blue-green

Exemple : `/kubernetes:deploy-setup "API Node.js" gitops:argocd strategy:canary`

## Plan Mode

> **Le plan mode est obligatoire.** Avant d'exécuter, Claude active le plan mode pour analyser le projet, proposer une stratégie de déploiement et attendre la validation.

## MISSION

### Étape 1 : Analyser le Projet

```
══════════════════════════════════════════════════════════════
KUBERNETES DEPLOY SETUP
══════════════════════════════════════════════════════════════

Projet : {name}

──────────────────────────────────────────────────────────────
DÉTECTION DE LA STACK
──────────────────────────────────────────────────────────────

| Composant | Détecté | Version |
|-----------|---------|---------|
| Langage | {language} | {version} |
| Framework | {framework} | {version} |
| Dockerfile | {oui/non} | {chemin} |
| Manifestes K8s | {oui/non} | {chemin} |
```

### Étape 2 : Concevoir la Stratégie de Déploiement

```
──────────────────────────────────────────────────────────────
STRATÉGIE DE DÉPLOIEMENT
──────────────────────────────────────────────────────────────

Outil GitOps : {ArgoCD / Flux}
Stratégie de release : {Rolling / Canary / Blue-Green}

Pipeline :
  Push sur main
    → CI : Tests → Build → Push image
    → CD : Mise à jour manifeste → Sync vers cluster
    → Vérification : Health checks → Tests de fumée
    → Promotion : Staging → Production
```

### Étape 3 : Générer le Pipeline CI

Générer le workflow GitHub Actions / GitLab CI :
- Construire et tester l'application
- Construire et pousser l'image Docker avec le tag SHA
- Mettre à jour les manifestes Kubernetes avec le nouveau tag d'image
- Déclencher la synchronisation GitOps

### Étape 4 : Générer la Configuration GitOps

Générer l'Application ArgoCD ou le HelmRelease Flux :
- Définition de l'application
- Politiques de synchronisation (auto-sync, prune, self-heal)
- Stratégie de promotion entre environnements
- Configuration du rollback

### Étape 5 : Générer la Stratégie de Rollout

Si canary ou blue-green, générer la configuration Argo Rollouts :
- Étapes de livraison progressive
- Templates d'analyse pour la promotion basée sur les métriques
- Intégration service mesh (si applicable)

### Étape 6 : Rapport Final

```
══════════════════════════════════════════════════════════════
RAPPORT DE CONFIGURATION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
FICHIERS CRÉÉS
──────────────────────────────────────────────────────────────

| Fichier | Description |
|---------|-------------|
| .github/workflows/deploy.yml | Pipeline CI/CD |
| k8s/argocd/application.yaml | Application ArgoCD |
| k8s/argocd/project.yaml | Projet ArgoCD |

──────────────────────────────────────────────────────────────
PROCHAINES ÉTAPES
──────────────────────────────────────────────────────────────

1. [ ] Installer ArgoCD/Flux sur le cluster cible
2. [ ] Configurer l'accès au dépôt Git (clé de déploiement ou GitHub App)
3. [ ] Mettre en place les credentials du registry d'images
4. [ ] Configurer les secrets avec External Secrets Operator
5. [ ] Tester le pipeline de déploiement de bout en bout
6. [ ] Configurer le monitoring avec @kubernetes-monitoring
```
