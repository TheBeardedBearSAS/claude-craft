---
description: Configurer un deploiement PgBouncer avec Docker, Kubernetes ou systemd
argument-hint: <Plateforme> [methode]
---

# PgBouncer Deploy Setup

Vous etes un specialiste du deploiement PgBouncer. Vous devez configurer un deploiement complet de PgBouncer dans l'environnement cible.

## Arguments
$ARGUMENTS

Arguments :
- Description de la plateforme
- (Optionnel) Methode : docker-compose, kubernetes-standalone, kubernetes-sidecar, systemd (par defaut : docker-compose)
- (Optionnel) HA : yes, no (par defaut : no)

Exemple : `/pgbouncer:deploy-setup "Application web production" method:kubernetes-standalone ha:yes`

## Plan Mode

> **Le plan mode est obligatoire.** Avant l'execution, Claude active le plan mode pour analyser l'environnement cible, proposer une strategie de deploiement et attendre la validation.

## MISSION

### Etape 1 : Analyser l'environnement

```
══════════════════════════════════════════════════════════════
DEPLOIEMENT PGBOUNCER
══════════════════════════════════════════════════════════════

Projet : {nom}

──────────────────────────────────────────────────────────────
DETECTION DE L'ENVIRONNEMENT
──────────────────────────────────────────────────────────────

| Composant | Detecte | Details |
|-----------|---------|---------|
| PostgreSQL | {version} | {hote, port} |
| Cible de deploiement | {Docker/K8s/systemd} | {details} |
| PgBouncer existant | {oui/non} | {version} |
| Reseau | {topologie} | {prive/public} |
| Gestion des secrets | {methode} | {K8s Secrets/Vault/env} |
```

### Etape 2 : Choisir la strategie de deploiement

```
──────────────────────────────────────────────────────────────
STRATEGIE DE DEPLOIEMENT
──────────────────────────────────────────────────────────────

Methode : {Docker Compose / K8s Standalone / K8s Sidecar / Systemd}
HA : {Active-passif / Replicas multiples / Instance unique}
Image : bitnami/pgbouncer:1.25.1

| Decision | Choix | Justification |
|----------|-------|---------------|
| Methode de deploiement | {methode} | {raison} |
| Replicas | {nombre} | {raison} |
| Health check | {pg_isready / TCP} | {raison} |
| Gestion de la config | {ConfigMap/env/fichier} | {raison} |
```

### Etape 3 : Generer les fichiers de deploiement

Generer tous les fichiers de configuration de deploiement :
- Definition de service Docker Compose (si Docker)
- Manifestes Kubernetes : Deployment, Service, ConfigMap, Secret (si K8s)
- Fichier unit systemd (si bare metal)
- Configuration pgbouncer.ini
- Script de health check
- Script de reload pour les changements de configuration sans interruption

### Etape 4 : Generer le health check

Generer la configuration de health check appropriee pour la cible de deploiement :
- Docker : instruction HEALTHCHECK
- Kubernetes : livenessProbe + readinessProbe
- Systemd : verification ExecStartPost

### Etape 5 : Generer le script de reload

Generer le script de reload sans interruption :
```bash
#!/bin/bash
# reload-pgbouncer.sh
# Recharge la configuration PgBouncer sans couper les connexions
```

### Etape 6 : Rapport final

```
══════════════════════════════════════════════════════════════
RAPPORT DE DEPLOIEMENT
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

1. [ ] Configurer les identifiants de base de donnees dans les secrets
2. [ ] Deployer PgBouncer dans l'environnement cible
3. [ ] Verifier que les health checks fonctionnent
4. [ ] Mettre a jour le DATABASE_URL de l'application pour pointer vers PgBouncer
5. [ ] Auditer la securite avec /pgbouncer:security-audit
6. [ ] Configurer le monitoring avec /pgbouncer:optimize
```
