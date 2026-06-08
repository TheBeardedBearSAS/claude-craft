---
description: Generer les fichiers de deploiement FrankenPHP pour Docker, Kubernetes ou standalone
argument-hint: <Plateforme> [methode]
---

# FrankenPHP Deploy Setup

Vous etes un specialiste du deploiement FrankenPHP. Vous devez configurer un deploiement complet de FrankenPHP dans l'environnement cible.

## Arguments
$ARGUMENTS

Arguments :
- Description de la plateforme
- (Optionnel) Methode : docker-compose, kubernetes, standalone-binary (par defaut : docker-compose)
- (Optionnel) Framework : symfony, laravel, php (par defaut : auto-detect)

Exemple : `/frankenphp:deploy-setup "API de production" method:kubernetes framework:symfony`

## Plan Mode

> **Le plan mode est obligatoire.** Avant d'executer, Claude active le plan mode pour analyser l'environnement cible, proposer une strategie de deploiement et attendre la validation.

## MISSION

### Etape 1 : Analyser l'environnement

```
══════════════════════════════════════════════════════════════
FRANKENPHP DEPLOY SETUP
══════════════════════════════════════════════════════════════

Projet : {nom}

──────────────────────────────────────────────────────────────
DETECTION DE L'ENVIRONNEMENT
──────────────────────────────────────────────────────────────

| Composant | Detecte | Details |
|-----------|---------|---------|
| Framework PHP | {Symfony/Laravel/PHP} | {version} |
| Cible de deploiement | {Docker/K8s/standalone} | {details} |
| FrankenPHP existant | {oui/non} | {version} |
| Strategie TLS | {auto/proxy/manuelle} | {details} |
| Gestion des secrets | {methode} | {K8s Secrets/Vault/env} |
```

### Etape 2 : Choisir la strategie de deploiement

```
──────────────────────────────────────────────────────────────
STRATEGIE DE DEPLOIEMENT
──────────────────────────────────────────────────────────────

Methode : {Docker Compose / Kubernetes / Binaire standalone}
Image : dunglas/frankenphp:1.12-php8.5-bookworm
Worker mode : {oui/non}

| Decision | Choix | Justification |
|----------|-------|---------------|
| Methode de deploiement | {methode} | {raison} |
| Replicas | {nombre} | {raison} |
| Health check | {HTTP /healthz} | {raison} |
| Terminaison TLS | {FrankenPHP/proxy} | {raison} |
```

### Etape 3 : Generer les fichiers de deploiement

Generer tous les fichiers de configuration de deploiement :
- Dockerfile (multi-stage, optimise pour la production)
- docker-compose.yml (si methode Docker)
- Manifestes Kubernetes : Deployment, Service, HPA (si methode K8s)
- Caddyfile pour l'environnement
- Configuration PHP (opcache, securite)
- Endpoint de health check

### Etape 4 : Generer le health check

Generer le health check adapte a la cible de deploiement :
- Docker : instruction HEALTHCHECK
- Kubernetes : livenessProbe + readinessProbe (HTTP)
- Standalone : verification systemd

### Etape 5 : Generer le script de reload

Generer le script de reload sans interruption :
```bash
#!/bin/bash
# reload-frankenphp.sh
# Recharge les workers FrankenPHP sans couper les connexions (SIGUSR1)
```

### Etape 6 : Rapport final

```
══════════════════════════════════════════════════════════════
RAPPORT DE SETUP
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
FICHIERS CREES
──────────────────────────────────────────────────────────────

| Fichier | Description |
|---------|-------------|
| {fichier} | {description} |

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Configurer les variables d'environnement (SERVER_NAME, secrets)
2. [ ] Construire et deployer l'image FrankenPHP
3. [ ] Verifier que les health checks passent
4. [ ] Auditer la securite avec /frankenphp:security-audit
5. [ ] Optimiser la performance avec /frankenphp:optimize
```
