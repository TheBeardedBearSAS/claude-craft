---
description: Optimiser les performances du pool PgBouncer et l'utilisation des connexions
argument-hint: [cible]
---

# PgBouncer Optimize

Vous etes un specialiste de l'optimisation PgBouncer. Vous devez analyser les metriques d'utilisation du pool et fournir des recommandations actionnables pour l'ajustement de performance, l'optimisation des timeouts et l'evaluation de migration vers le transaction mode.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Cible : pool-sizing, timeouts, txn-mode-migration, full (par defaut : full)

Exemple : `/pgbouncer:optimize target:pool-sizing`

## Plan Mode

> **Le plan mode est recommande.** Claude analyse les metriques actuelles du pool avant de proposer des optimisations.

## MISSION

### Etape 1 : Collecter les metriques

```
══════════════════════════════════════════════════════════════
OPTIMISATION PGBOUNCER
══════════════════════════════════════════════════════════════

Cible : {pool-sizing/timeouts/txn-mode-migration/full}

──────────────────────────────────────────────────────────────
PROFIL ACTUEL DU POOL
──────────────────────────────────────────────────────────────

| Base de donnees | Pool Mode | Pool Size | cl_active | cl_waiting | sv_active | sv_idle | Utilisation |
|-----------------|-----------|-----------|-----------|------------|-----------|---------|-------------|
| {db} | {mode} | {taille} | {n} | {n} | {n} | {n} | {%} |
```

Collecter les metriques via les commandes SHOW :
```sql
SHOW POOLS;
SHOW STATS;
SHOW CONFIG;
SHOW LISTS;
```

### Etape 2 : Analyse de l'utilisation du pool

```
──────────────────────────────────────────────────────────────
UTILISATION DU POOL
──────────────────────────────────────────────────────────────

| Base de donnees | Taille actuelle | Pic sv_active | Utilisation moy. | Recommandation | Action |
|-----------------|----------------|---------------|-------------------|----------------|--------|
| {db} | {taille} | {pic} | {%} | {nouvelle taille} | {augmenter/diminuer/conserver} |

──────────────────────────────────────────────────────────────
RECOMMANDATIONS DE DIMENSIONNEMENT
──────────────────────────────────────────────────────────────

| Parametre | Actuel | Recommande | Impact |
|-----------|--------|------------|--------|
| default_pool_size | {actuel} | {nouveau} | {description} |
| min_pool_size | {actuel} | {nouveau} | {description} |
| reserve_pool_size | {actuel} | {nouveau} | {description} |
| max_client_conn | {actuel} | {nouveau} | {description} |
| max_db_connections | {actuel} | {nouveau} | {description} |
```

### Etape 3 : Ajustement des timeouts

```
──────────────────────────────────────────────────────────────
ANALYSE DES TIMEOUTS
──────────────────────────────────────────────────────────────

| Timeout | Actuel | Recommande | Justification |
|---------|--------|------------|---------------|
| server_lifetime | {actuel} | {nouveau} | {raison} |
| server_idle_timeout | {actuel} | {nouveau} | {raison} |
| client_idle_timeout | {actuel} | {nouveau} | {raison} |
| query_wait_timeout | {actuel} | {nouveau} | {raison} |
| client_login_timeout | {actuel} | {nouveau} | {raison} |
| server_connect_timeout | {actuel} | {nouveau} | {raison} |
| reserve_pool_timeout | {actuel} | {nouveau} | {raison} |
```

### Etape 4 : Evaluation de la migration vers le transaction mode

```
──────────────────────────────────────────────────────────────
MIGRATION VERS LE TRANSACTION MODE
──────────────────────────────────────────────────────────────

Mode actuel : {session/transaction}

| Verification de compatibilite | Statut | Details |
|-------------------------------|--------|---------|
| Prepared statements | {compatible/a corriger} | {details} |
| Commandes SET | {compatible/a corriger} | {details} |
| LISTEN/NOTIFY | {compatible/incompatible} | {details} |
| Temp tables | {compatible/incompatible} | {details} |
| Advisory locks | {compatible/necessite session} | {details} |

Migration possible : {oui/non/partielle}
Gain de multiplexage estime : {x}x reduction de connexions
server_reset_query necessaire : {DISCARD ALL / personnalise}
```

### Etape 5 : Statistiques de performance

```
──────────────────────────────────────────────────────────────
METRIQUES DE PERFORMANCE
──────────────────────────────────────────────────────────────

| Metrique | Actuel | Cible | Statut |
|----------|--------|-------|--------|
| avg_wait_time | {ms} | < 100ms | {ok/eleve} |
| avg_xact_time | {ms} | < 500ms | {ok/eleve} |
| avg_query_time | {ms} | < 100ms | {ok/eleve} |
| Debit xact/s | {n} | {cible} | {ok/faible} |
| Ratio de reutilisation des connexions | {x}:1 | > 10:1 | {ok/faible} |
```

### Etape 6 : Rapport final

```
══════════════════════════════════════════════════════════════
RAPPORT D'OPTIMISATION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUME
──────────────────────────────────────────────────────────────

| Optimisation | Impact | Effort | Priorite |
|-------------|--------|--------|----------|
| {optimisation 1} | {eleve/moyen/faible} | {eleve/moyen/faible} | 1 |
| {optimisation 2} | {eleve/moyen/faible} | {eleve/moyen/faible} | 2 |

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Appliquer les recommandations de dimensionnement du pool (RELOAD, pas de redemarrage)
2. [ ] Ajuster les timeouts au profil applicatif
3. [ ] Evaluer la migration vers le transaction mode (si en session mode)
4. [ ] Configurer le monitoring avec @pgbouncer-monitoring
5. [ ] Re-evaluer apres 1 semaine de trafic en production
```
