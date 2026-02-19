---
description: Optimize Hetzner Cloud cost and performance
argument-hint: [target]
---

# Hcloud Optimize

Vous etes un specialiste de l'optimisation Hetzner Cloud. Vous devez analyser l'utilisation des ressources de l'infrastructure et fournir des recommandations actionnables pour les economies de couts et les ameliorations de performance.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Cible : cost, performance, both (defaut : both)

Exemple : `/hcloud:optimize target:cost`

## Plan Mode

> **Le mode plan est recommande.** Claude analyse l'utilisation actuelle des ressources avant de proposer des optimisations.

## MISSION

### Etape 1 : Inventaire des ressources

```
══════════════════════════════════════════════════════════════
HCLOUD OPTIMIZATION
══════════════════════════════════════════════════════════════

Cible : {cost/performance/both}

──────────────────────────────────────────────────────────────
PROFIL DES RESSOURCES ACTUELLES
──────────────────────────────────────────────────────────────

| Ressource | Nombre | Cout mensuel | Details |
|-----------|--------|-------------|---------|
| Servers | {n} | {cout}€ | {detail des types} |
| Volumes | {n} | {cout}€ | {total Go} |
| Load Balancers | {n} | {cout}€ | {types} |
| Floating IPs | {n} | {cout}€ | {assignees/non assignees} |
| Snapshots | {n} | {cout}€ | {total Go} |
| **Total** | | **{total}€** | |
```

Inventorier toutes les ressources en utilisant le CLI hcloud et calculer les couts mensuels actuels.

### Etape 2 : Dimensionnement des serveurs

```
──────────────────────────────────────────────────────────────
DIMENSIONNEMENT DES SERVEURS
──────────────────────────────────────────────────────────────

| Server | Current Type | CPU Avg | RAM Avg | Recommendation | Savings |
|--------|-------------|---------|---------|----------------|---------|
| {name} | {type} | {x}% | {x}% | {new type} | {x}€/mo |
```

Verifier les metriques serveur et identifier :
- **Serveurs surdimensionnes** (CPU < 20%) : reduire ou passer en shared (CX)
- **Candidats ARM** (charges compatibles) : passer en CAX pour 30-50% d'economies
- **Serveurs sous-dimensionnes** (CPU > 80%) : augmenter ou scaler horizontalement

### Etape 3 : Evaluation de la migration ARM

```
──────────────────────────────────────────────────────────────
OPPORTUNITES DE MIGRATION ARM (CAX)
──────────────────────────────────────────────────────────────

| Server | Current | Proposed ARM | Monthly Savings | Compatible |
|--------|---------|-------------|-----------------|------------|
| {name} | {type} ({cout}€) | {cax type} ({cout}€) | {economies}€ | {oui/non} |
```

Evaluer chaque serveur pour la compatibilite ARM (Go, Node.js, Python, Java, .NET 8+, PostgreSQL, MySQL, Redis supportent tous ARM).

### Etape 4 : Nettoyage des ressources

```
──────────────────────────────────────────────────────────────
RESSOURCES INUTILISEES
──────────────────────────────────────────────────────────────

| Ressource | Nom | Statut | Cout | Action |
|-----------|-----|--------|------|--------|
| Server | {nom} | Arrete | {cout}€/mo | Snapshot + suppression |
| Volume | {nom} | Non attache | {cout}€/mo | Archiver ou supprimer |
| Floating IP | {ip} | Non assignee | {cout}€/mo | Supprimer |
| Snapshot | {nom} | > 30 jours | {cout}€ | Supprimer |
```

Identifier les serveurs arretes, les volumes non attaches, les floating IPs non assignees et les anciens snapshots.

### Etape 5 : Optimisation de la performance

```
──────────────────────────────────────────────────────────────
REGLAGE DE LA PERFORMANCE
──────────────────────────────────────────────────────────────

| Parametre | Actuel | Recommande | Impact |
|-----------|--------|------------|--------|
| Placement groups | {utilise/non utilise} | Utilise pour la HA | Repartition sur les hotes |
| Reseau prive | {utilise/non utilise} | Utilise pour tout l'interne | Latence reduite, gratuit |
| Type load balancer | {lb11/lb21} | {recommandation} | Debit |
| I/O volume | {standard} | Considerer le SSD local | Amelioration IOPS |
| Localisation serveur | {localisation} | {recommandation} | Latence |
```

Patterns d'optimisation cles :
- **Reseau prive** pour le trafic inter-serveurs (gratuit, latence reduite)
- **Placement groups** avec spread policy pour la haute disponibilite
- **SSD local** plutot que les block volumes pour les charges ephemeres a haut IOPS
- **CDN** pour les assets statiques afin de reduire la bande passante sortante

### Etape 6 : Rapport final

```
══════════════════════════════════════════════════════════════
RAPPORT D'OPTIMISATION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUME
──────────────────────────────────────────────────────────────

| Optimisation | Impact | Effort | Economies mensuelles | Priorite |
|-------------|--------|--------|---------------------|----------|
| Dimensionner les serveurs | Eleve | Faible | {x}€ | 1 |
| Migrer vers ARM (CAX) | Eleve | Moyen | {x}€ | 2 |
| Supprimer les ressources inutilisees | Moyen | Faible | {x}€ | 3 |
| Nettoyer les anciens snapshots | Faible | Faible | {x}€ | 4 |
| Optimiser le reseau | Moyen | Moyen | {x}€ | 5 |

**Economies potentielles totales : {total}€/mois ({pourcentage}% de reduction)**

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Appliquer les recommandations de dimensionnement des serveurs
2. [ ] Tester la compatibilite ARM pour les serveurs identifies
3. [ ] Supprimer les ressources inutilisees apres confirmation de l'equipe
4. [ ] Mettre en place l'automatisation du nettoyage des snapshots
5. [ ] Auditer la posture de securite avec /hcloud:security-audit
```
