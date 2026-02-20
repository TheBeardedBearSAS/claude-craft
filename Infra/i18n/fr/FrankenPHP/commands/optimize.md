---
description: Optimiser la performance des workers FrankenPHP et le debit
argument-hint: [cible]
---

# FrankenPHP Optimize

Vous etes un specialiste de l'optimisation FrankenPHP. Vous devez analyser les metriques de performance des workers et fournir des recommandations actionnables pour l'ajustement des threads, l'optimisation OPcache, la configuration Early Hints et la performance Mercure.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Cible : worker-tuning, opcache, early-hints, mercure, full (par defaut : full)

Exemple : `/frankenphp:optimize target:worker-tuning`

## Plan Mode

> **Le plan mode est recommande.** Claude analyse le profil de performance actuel avant de proposer des optimisations.

## MISSION

### Etape 1 : Collecter le profil

```
══════════════════════════════════════════════════════════════
OPTIMISATION FRANKENPHP
══════════════════════════════════════════════════════════════

Cible : {worker-tuning/opcache/early-hints/mercure/full}

──────────────────────────────────────────────────────────────
PROFIL ACTUEL
──────────────────────────────────────────────────────────────

| Parametre | Valeur |
|-----------|--------|
| Version FrankenPHP | {version} |
| Version PHP | {version} |
| Mode | {worker/classic} |
| Threads | {auto/nombre} |
| max_requests | {valeur} |
| Nombre de CPU | {n} |
| Memoire disponible | {GB} |
```

Collecter les metriques :
```bash
nproc && free -h
ps -o pid,rss,vsz -p $(pidof frankenphp)
frankenphp php-cli -i | grep -E "opcache|memory_limit"
grep -E "worker|thread" /etc/caddy/Caddyfile
```

### Etape 2 : Benchmark baseline

```
──────────────────────────────────────────────────────────────
BENCHMARK BASELINE
──────────────────────────────────────────────────────────────

| Metrique | Valeur | Methode |
|----------|--------|---------|
| RPS | {n} | wrk -t4 -c100 -d30s |
| Latence p50 | {ms} | wrk --latency |
| Latence p99 | {ms} | wrk --latency |
| Memoire (RSS) | {MB} | ps -o rss |
| TTFB | {ms} | Timing curl |
```

### Etape 3 : Analyse de l'ajustement worker

```
──────────────────────────────────────────────────────────────
ANALYSE WORKER
──────────────────────────────────────────────────────────────

| Parametre | Actuel | Recommande | Impact |
|-----------|--------|------------|--------|
| Mode | {worker/classic} | {recommandation} | {description} |
| Threads | {actuel} | {auto/nombre} | {description} |
| max_requests | {actuel} | {500} | {description} |
| Memoire par thread | {MB} | {cible} | {description} |
```

### Etape 4 : Analyse OPcache

```
──────────────────────────────────────────────────────────────
OPTIMISATION OPCACHE
──────────────────────────────────────────────────────────────

| Parametre | Actuel | Recommande | Justification |
|-----------|--------|------------|---------------|
| opcache.enable | {valeur} | 1 | {raison} |
| opcache.memory_consumption | {valeur} | 256 | {raison} |
| opcache.max_accelerated_files | {valeur} | 20000 | {raison} |
| opcache.validate_timestamps | {valeur} | 0 (prod) | {raison} |
| opcache.preload | {valeur} | /app/config/preload.php | {raison} |
| opcache.jit | {valeur} | 1255 | {raison} |
| opcache.jit_buffer_size | {valeur} | 128M | {raison} |
```

### Etape 5 : Early Hints et reseau

```
──────────────────────────────────────────────────────────────
EARLY HINTS ET RESEAU
──────────────────────────────────────────────────────────────

| Fonctionnalite | Statut | Recommandation |
|----------------|--------|----------------|
| Early Hints (103) | {active/desactive} | {action} |
| HTTP/2 | {active/desactive} | {action} |
| HTTP/3 | {active/desactive} | {action} |
| Compression | {active/desactive} | {action} |
| Directive push | {configuree/manquante} | {action} |
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
AMELIORATION ATTENDUE
──────────────────────────────────────────────────────────────

| Metrique | Avant | Apres attendu | Evolution |
|----------|-------|----------------|-----------|
| RPS | {n} | {n} | +{x}% |
| Latence p99 | {ms} | {ms} | -{x}% |
| Memoire | {MB} | {MB} | {stable} |

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Appliquer l'ajustement worker (nombre de threads, max_requests)
2. [ ] Configurer OPcache preloading et JIT
3. [ ] Activer les Early Hints pour les ressources critiques
4. [ ] Re-benchmarker apres chaque changement
5. [ ] Surveiller la stabilite memoire sur 24 heures
```
