---
description: Concevoir une architecture complete de serving FrankenPHP
argument-hint: <Projet> [contraintes]
---

# FrankenPHP Architecture

Vous etes un architecte FrankenPHP senior. Vous devez concevoir une architecture complete de serving PHP a partir des specifications du projet.

## Arguments
$ARGUMENTS

Arguments :
- Description du projet
- Charge de travail cible (ex : web-application, api-only, real-time)
- Contraintes (ex : worker-mode, classic-mode, behind-proxy)

Exemple : `/frankenphp:architecture "Plateforme e-commerce" workload:web-application framework:symfony`

## Plan Mode

> **Le plan mode est recommande.** Claude active le plan mode pour structurer l'approche, selectionner le worker/classic mode et presenter une topologie de serving avant de generer le Caddyfile.

## MISSION

### Etape 1 : Decouverte

```
══════════════════════════════════════════════════════════════
ARCHITECTURE FRANKENPHP
══════════════════════════════════════════════════════════════

Projet : {nom}
Description : {description}

──────────────────────────────────────────────────────────────
ANALYSE DES EXIGENCES
──────────────────────────────────────────────────────────────

### Stack applicatif
| Composant | Technologie | Details |
|-----------|-------------|---------|
| Framework | {Symfony/Laravel/PHP} | {version} |
| Version PHP | {8.x} | {extensions} |
| Etat global | {aucun/minimal/important} | {fichiers de session, statiques} |
| Serveur actuel | {nginx+fpm/Apache/aucun} | {version} |

### Pattern de trafic
| Attribut | Valeur |
|----------|--------|
| Pic concurrent | {requetes} |
| Temps de reponse moyen | {ms} |
| Temps reel necessaire | {oui/non} |
| Requetes longues | {oui/non} |
```

### Etape 2 : Decision du mode

```
──────────────────────────────────────────────────────────────
SELECTION DU MODE
──────────────────────────────────────────────────────────────

Le framework supporte le worker mode ? {oui/non}
L'etat global empeche le worker mode ? {oui/non}
OPcache preloading possible ? {oui/non}

Decision : mode {worker / classic}
Justification : {explication}

Configuration des threads : {auto / nombre fixe}
max_requests : {500 / personnalise}
```

### Etape 3 : Conception de la topologie

```
──────────────────────────────────────────────────────────────
TOPOLOGIE DE SERVING
──────────────────────────────────────────────────────────────

[Diagramme ASCII : Client -> FrankenPHP (worker pool) -> Tier donnees]

──────────────────────────────────────────────────────────────
DIMENSIONNEMENT DES THREADS
──────────────────────────────────────────────────────────────

| Parametre | Valeur | Formule |
|-----------|--------|---------|
| Threads | {auto/nombre} | {cpu_count * 2 ou auto} |
| max_requests | {500} | {stabilite memoire} |
| Budget memoire | {MB par worker} | {total / threads} |
```

### Etape 4 : Generer le Caddyfile

Generer le Caddyfile complet avec :
- Bloc global frankenphp (worker ou classic mode)
- Bloc site avec root, php_server, headers de securite
- Configuration Early Hints (si applicable)
- Hub Mercure (si temps reel necessaire)
- Configuration de journalisation

### Etape 5 : Generer les artefacts Docker

Generer le Dockerfile et le docker-compose.yml pour l'architecture choisie.

### Etape 6 : Rapport final

```
══════════════════════════════════════════════════════════════
ARCHITECTURE GENEREE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUME DE LA CONFIGURATION
──────────────────────────────────────────────────────────────

| Parametre | Valeur |
|-----------|--------|
| Mode | {worker/classic} |
| Threads | {auto/nombre} |
| max_requests | {valeur} |
| Auto-TLS | {oui/non} |
| Early Hints | {oui/non} |
| Mercure | {oui/non} |

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Verifier le Caddyfile et le dimensionnement des threads
2. [ ] Deployer avec /frankenphp:deploy-setup
3. [ ] Auditer la securite avec /frankenphp:security-audit
4. [ ] Optimiser la performance avec /frankenphp:optimize
5. [ ] Benchmarker avec wrk ou k6
```
