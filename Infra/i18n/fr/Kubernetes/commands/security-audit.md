---
description: "Audit de la posture de sécurité Kubernetes"
argument-hint: "[namespace] [périmètre]"
---

# Kubernetes Security Audit

Vous êtes un spécialiste de la sécurité Kubernetes. Vous devez réaliser un audit de sécurité complet du cluster ou du namespace.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Namespace à auditer (défaut : tous les namespaces)
- (Optionnel) Périmètre : rbac, network, pods, secrets, images, full (défaut : full)

Exemple : `/kubernetes:security-audit namespace:app-prod scope:full`

## Plan Mode

> **Le plan mode est conditionnel.** S'active automatiquement quand le périmètre est "full" ou couvre plusieurs namespaces.

## MISSION

### Étape 1 : Définition du Périmètre

```
══════════════════════════════════════════════════════════════
AUDIT DE SÉCURITÉ KUBERNETES
══════════════════════════════════════════════════════════════

Périmètre : {namespace ou cluster entier}
Catégories : {rbac, network, pods, secrets, images}

──────────────────────────────────────────────────────────────
SCOPE DE L'AUDIT
──────────────────────────────────────────────────────────────
```

### Étape 2 : Audit RBAC

```
──────────────────────────────────────────────────────────────
ANALYSE RBAC
──────────────────────────────────────────────────────────────

| Vérification | Statut | Détails |
|-------------|--------|---------|
| Bindings cluster-admin | {nombre} | {détails} |
| Rôles trop permissifs | {nombre} | {détails} |
| ServiceAccounts inutilisés | {nombre} | {détails} |
| Montage automatique de token | {activé/désactivé} | {détails} |
```

### Étape 3 : Audit de la Sécurité des Pods

```
──────────────────────────────────────────────────────────────
SÉCURITÉ DES PODS
──────────────────────────────────────────────────────────────

| Vérification | Statut | Détails |
|-------------|--------|---------|
| Application PSS | {restricted/baseline/aucun} | {détails} |
| Conteneurs root | {nombre} | {liste des pods} |
| Conteneurs privilégiés | {nombre} | {liste des pods} |
| Système de fichiers racine en lecture seule | {%} | {détails} |
| Capabilities supprimées | {%} | {détails} |
| Profils seccomp | {%} | {détails} |
```

### Étape 4 : Audit de la Sécurité Réseau

```
──────────────────────────────────────────────────────────────
SÉCURITÉ RÉSEAU
──────────────────────────────────────────────────────────────

| Vérification | Statut | Détails |
|-------------|--------|---------|
| Politiques de refus par défaut | {oui/non par ns} | {détails} |
| Services exposés | {nombre} | {liste des services} |
| TLS Ingress | {%} | {détails} |
| Exposition de services internes | {nombre} | {détails} |
```

### Étape 5 : Audit des Secrets

```
──────────────────────────────────────────────────────────────
GESTION DES SECRETS
──────────────────────────────────────────────────────────────

| Vérification | Statut | Détails |
|-------------|--------|---------|
| Secrets dans les variables d'env | {nombre} | {détails} |
| Secrets externes | {oui/non} | {outil} |
| Chiffrement au repos | {activé/désactivé} | {détails} |
| Rotation des secrets | {automatique/manuelle/aucune} | {détails} |
```

### Étape 6 : Sécurité des Images

```
──────────────────────────────────────────────────────────────
SÉCURITÉ DES IMAGES
──────────────────────────────────────────────────────────────

| Vérification | Statut | Détails |
|-------------|--------|---------|
| Tags latest | {nombre} | {images} |
| Images non signées | {nombre} | {images} |
| Vulnérabilités connues | {nombre} | {répartition par sévérité} |
| Registries de confiance | {%} | {détails} |
```

### Étape 7 : Rapport Final

```
══════════════════════════════════════════════════════════════
RAPPORT D'AUDIT DE SÉCURITÉ
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SCORE
──────────────────────────────────────────────────────────────

| Catégorie | Score | Statut |
|-----------|-------|--------|
| RBAC | {x}/100 | {pass/warn/fail} |
| Sécurité des pods | {x}/100 | {pass/warn/fail} |
| Réseau | {x}/100 | {pass/warn/fail} |
| Secrets | {x}/100 | {pass/warn/fail} |
| Images | {x}/100 | {pass/warn/fail} |
| **Global** | **{x}/100** | **{statut}** |

──────────────────────────────────────────────────────────────
CONSTATATIONS CRITIQUES
──────────────────────────────────────────────────────────────

1. [ ] {constatation critique 1}
2. [ ] {constatation critique 2}

──────────────────────────────────────────────────────────────
RECOMMANDATIONS
──────────────────────────────────────────────────────────────

Priorité 1 (Immédiat) :
- [ ] {recommandation}

Priorité 2 (Ce sprint) :
- [ ] {recommandation}

Priorité 3 (Prochain trimestre) :
- [ ] {recommandation}
```
