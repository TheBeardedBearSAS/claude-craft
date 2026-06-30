---
description: "Optimiser l'utilisation des ressources et les coûts Kubernetes"
argument-hint: "[namespace] [cible]"
---

# Kubernetes Optimize

Vous êtes un spécialiste de l'optimisation Kubernetes. Vous devez analyser l'utilisation des ressources et fournir des recommandations concrètes pour le right-sizing, l'autoscaling et la réduction des coûts.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Namespace à optimiser (défaut : tous les namespaces)
- (Optionnel) Cible : resources, autoscaling, costs, full (défaut : full)

Exemple : `/kubernetes:optimize namespace:app-prod target:resources`

## Plan Mode

> **Le plan mode est recommandé.** Claude analyse l'utilisation actuelle des ressources avant de proposer des modifications.

## MISSION

### Étape 1 : Analyse des Ressources

```
══════════════════════════════════════════════════════════════
OPTIMISATION KUBERNETES
══════════════════════════════════════════════════════════════

Namespace : {namespace}
Cible : {resources/autoscaling/costs/full}

──────────────────────────────────────────────────────────────
UTILISATION ACTUELLE DES RESSOURCES
──────────────────────────────────────────────────────────────
```

Analyser avec :
```bash
kubectl top pods -n {namespace}
kubectl top nodes
kubectl get hpa -n {namespace}
kubectl get pdb -n {namespace}
kubectl get vpa -n {namespace}
```

### Étape 2 : Analyse du Right-Sizing

```
──────────────────────────────────────────────────────────────
RECOMMANDATIONS DE RIGHT-SIZING
──────────────────────────────────────────────────────────────

| Workload | Req. actuel | Limit. actuelle | Usage réel | Recommandé |
|----------|-------------|-----------------|------------|------------|
| api | 500m/512Mi | 1/1Gi | 120m/200Mi | 200m/300Mi |
| worker | 250m/256Mi | 500m/512Mi | 50m/100Mi | 100m/150Mi |

Économies potentielles : {estimation}
```

### Étape 3 : Configuration de l'Autoscaling

```
──────────────────────────────────────────────────────────────
RECOMMANDATIONS D'AUTOSCALING
──────────────────────────────────────────────────────────────

| Workload | Actuel | HPA recommandé | Suggestion VPA |
|----------|--------|----------------|----------------|
| api | 3 fixe | 2-10, CPU 70% | mode: Auto |
| worker | 2 fixe | 1-5, longueur file | mode: Auto |
```

Générer les manifestes HPA :
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
  behavior:
    scaleDown:
      stabilizationWindowSeconds: 300
```

### Étape 4 : PodDisruptionBudget

```
──────────────────────────────────────────────────────────────
RECOMMANDATIONS PDB
──────────────────────────────────────────────────────────────

| Workload | Réplicas | PDB | Recommandation |
|----------|----------|-----|----------------|
| api | 3 | aucun | minAvailable: 2 |
| worker | 2 | aucun | minAvailable: 1 |
```

Générer les manifestes PDB.

### Étape 5 : Optimisation des Coûts

```
──────────────────────────────────────────────────────────────
ANALYSE DES COÛTS
──────────────────────────────────────────────────────────────

| Domaine | Actuel | Optimisé | Économies |
|---------|--------|----------|-----------|
| Calcul (CPU) | {x} cœurs | {y} cœurs | {z}% |
| Mémoire | {x} Gi | {y} Gi | {z}% |
| Stockage | {x} Gi | {y} Gi | {z}% |
| Spot/Préemptible | {non} | {recommandé} | {z}% |
```

### Étape 6 : Rapport Final

```
══════════════════════════════════════════════════════════════
RAPPORT D'OPTIMISATION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RÉSUMÉ
──────────────────────────────────────────────────────────────

| Optimisation | Impact | Effort | Priorité |
|-------------|--------|--------|----------|
| Right-sizing des requests | Élevé | Faible | 1 |
| Ajouter HPA | Élevé | Moyen | 2 |
| Ajouter PDB | Moyen | Faible | 3 |
| Instances Spot | Élevé | Moyen | 4 |

──────────────────────────────────────────────────────────────
FICHIERS GÉNÉRÉS
──────────────────────────────────────────────────────────────

| Fichier | Description |
|---------|-------------|
| {fichier} | {description} |

──────────────────────────────────────────────────────────────
PROCHAINES ÉTAPES
──────────────────────────────────────────────────────────────

1. [ ] Appliquer le right-sizing en staging d'abord
2. [ ] Activer HPA et surveiller pendant 24h
3. [ ] Ajouter les PDB avant la prochaine fenêtre de maintenance
4. [ ] Configurer le monitoring avec @kubernetes-monitoring
```
