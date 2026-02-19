---
description: OpenTofu cost optimization and resource analysis
argument-hint: [Target]
---

# OpenTofu Optimize

Vous etes un specialiste de l'optimisation des couts OpenTofu. Vous devez analyser les configurations d'infrastructure et fournir des recommandations actionnables de reduction des couts.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Cible : resources, costs, tags, full (par defaut : full)
- (Optionnel) Chemin vers le repertoire de configuration

Exemple : `/opentofu:optimize target:full path:infra/`

## Plan Mode

> **Le mode plan est recommande.** Claude analyse les configurations actuelles avant de proposer des optimisations.

## MISSION

### Etape 1 : Analyse des Ressources

```
══════════════════════════════════════════════════════════════
OPTIMISATION OPENTOFU
══════════════════════════════════════════════════════════════

Cible : {resources/costs/tags/full}
Chemin : {chemin de configuration}

──────────────────────────────────────────────────────────────
INVENTAIRE DES RESSOURCES
──────────────────────────────────────────────────────────────
```

Analyser avec :
```bash
tofu state list | sort
infracost breakdown --path=. --format=table
```

### Etape 2 : Ventilation des Couts

```
──────────────────────────────────────────────────────────────
ANALYSE DES COUTS
──────────────────────────────────────────────────────────────

| Type de Ressource | Nombre | Cout Mensuel | % Total |
|-------------------|--------|-------------|---------|
| Compute | {n} | ${x} | {y}% |
| Base de donnees | {n} | ${x} | {y}% |
| Stockage | {n} | ${x} | {y}% |
| Reseau | {n} | ${x} | {y}% |
| **Total** | | **${x}** | **100%** |
```

### Etape 3 : Recommandations de Dimensionnement

```
──────────────────────────────────────────────────────────────
DIMENSIONNEMENT ADEQUAT
──────────────────────────────────────────────────────────────

| Ressource | Actuel | Recommande | Economies |
|-----------|--------|------------|-----------|
| {ressource} | {type} | {type} | {x}% |
```

### Etape 4 : Conformite des Tags

```
──────────────────────────────────────────────────────────────
CONFORMITE DES TAGS
──────────────────────────────────────────────────────────────

| Tag Requis | Couverture | Ressources Manquantes |
|------------|------------|----------------------|
| CostCenter | {x}% | {liste} |
| Environment | {x}% | {liste} |
| Project | {x}% | {liste} |
```

### Etape 5 : Actions d'Optimisation

Generer les modifications specifiques de configuration OpenTofu :
- Definitions de ressources correctement dimensionnees
- Configurations d'instances spot/preemptible
- Optimisation des niveaux de stockage
- Tags par defaut sur le provider
- Politiques de cout OPA

### Etape 6 : Rapport Final

```
══════════════════════════════════════════════════════════════
RAPPORT D'OPTIMISATION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUME
──────────────────────────────────────────────────────────────

| Optimisation | Impact | Effort | Priorite |
|-------------|--------|--------|----------|
| Dimensionner les instances | Eleve | Faible | 1 |
| Activer les instances spot | Eleve | Moyen | 2 |
| Conformite des tags | Moyen | Faible | 3 |
| Porte de cout Infracost CI | Moyen | Moyen | 4 |

──────────────────────────────────────────────────────────────
ECONOMIES ESTIMEES
──────────────────────────────────────────────────────────────

| Domaine | Actuel | Optimise | Economies Mensuelles |
|---------|--------|----------|---------------------|
| Compute | ${x} | ${y} | ${z} |
| Base de donnees | ${x} | ${y} | ${z} |
| Stockage | ${x} | ${y} | ${z} |
| **Total** | **${x}** | **${y}** | **${z}** |

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Appliquer le dimensionnement adequat en dev d'abord
2. [ ] Integrer Infracost dans le CI/CD
3. [ ] Imposer la conformite des tags via OPA
4. [ ] Evaluer les opportunites d'instances reservees
5. [ ] Planifier une revue mensuelle des couts
```
