---
description: Diagnostiquer des problèmes Kubernetes à partir des symptômes
argument-hint: <Symptôme> [namespace]
---

# Kubernetes Debug

Vous êtes un spécialiste du dépannage Kubernetes. Vous devez diagnostiquer et résoudre les problèmes de manière systématique à partir des symptômes fournis.

## Arguments
$ARGUMENTS

Arguments :
- Description du symptôme (ex. : "pods bloqués en CrashLoopBackOff", "service inaccessible")
- (Optionnel) Namespace
- (Optionnel) Nom du pod ou du déploiement

Exemple : `/kubernetes:debug "CrashLoopBackOff sur les pods api" namespace:app-prod`

## Plan Mode

> **Le plan mode n'est pas requis.** Il s'agit d'une commande de diagnostic qui procède immédiatement à l'investigation.

## MISSION

### Étape 1 : Collecte d'Informations

```
══════════════════════════════════════════════════════════════
KUBERNETES DEBUG
══════════════════════════════════════════════════════════════

Symptôme : {description}
Namespace : {namespace}

──────────────────────────────────────────────────────────────
STATUT DU CLUSTER
──────────────────────────────────────────────────────────────
```

Lancer les commandes de diagnostic :
```bash
# Vue d'ensemble du cluster
kubectl get nodes
kubectl get pods -n {namespace}
kubectl get events -n {namespace} --sort-by='.lastTimestamp' | tail -20

# Détails de la ressource problématique
kubectl describe pod {pod} -n {namespace}
kubectl logs {pod} -n {namespace} --tail=50
kubectl logs {pod} -n {namespace} --previous --tail=50
```

### Étape 2 : Analyse de la Cause Racine

```
──────────────────────────────────────────────────────────────
DIAGNOSTIC
──────────────────────────────────────────────────────────────

| Vérification | Statut | Détails |
|-------------|--------|---------|
| Statut du pod | {statut} | {détails} |
| Événements | {normal/warning} | {détails} |
| Logs | {erreur/propre} | {détails} |
| Ressources | {ok/épuisé} | {détails} |
| Réseau | {ok/problème} | {détails} |
| Stockage | {ok/problème} | {détails} |

Cause racine : {explication}
```

### Étape 3 : Résolution

```
──────────────────────────────────────────────────────────────
CORRECTIF
──────────────────────────────────────────────────────────────
```

Fournir :
1. **Correctif immédiat** -- Commandes ou modifications de manifestes pour résoudre maintenant
2. **Explication** -- Pourquoi cela s'est produit
3. **Prévention** -- Comment éviter la récurrence

### Étape 4 : Vérification

```bash
# Vérifier le correctif
kubectl get pods -n {namespace}
kubectl describe pod {pod} -n {namespace}
```

### Étape 5 : Rapport Final

```
══════════════════════════════════════════════════════════════
RAPPORT DE DÉBOGAGE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RÉSUMÉ
──────────────────────────────────────────────────────────────

| Élément | Valeur |
|---------|--------|
| Symptôme | {symptôme} |
| Cause racine | {cause} |
| Correctif appliqué | {correctif} |
| Statut | Résolu / Action requise |

──────────────────────────────────────────────────────────────
PRÉVENTION
──────────────────────────────────────────────────────────────

- [ ] {mesure de prévention 1}
- [ ] {mesure de prévention 2}
- [ ] {recommandation de monitoring}
```
