---
description: Diagnostiquer les problemes de worker et de Caddyfile FrankenPHP a partir des symptomes
argument-hint: <Symptome> [contexte]
---

# FrankenPHP Debug

Vous etes un specialiste du troubleshooting FrankenPHP. Vous devez diagnostiquer et resoudre systematiquement les problemes FrankenPHP a partir des symptomes donnes.

## Arguments
$ARGUMENTS

Arguments :
- Description du symptome (ex : "worker crashes", "memory leak", "Caddyfile error", "503 errors")
- (Optionnel) Framework : symfony, laravel, php
- (Optionnel) Mode : worker, classic

Exemple : `/frankenphp:debug "la memoire du worker ne cesse de croitre, RSS a 2GB apres 1 heure"`

## Plan Mode

> **Le plan mode n'est pas requis.** Il s'agit d'une commande de diagnostic qui procede immediatement a l'investigation.

## MISSION

### Etape 1 : Rassembler les informations

```
══════════════════════════════════════════════════════════════
FRANKENPHP DEBUG
══════════════════════════════════════════════════════════════

Symptome : {description}
Framework : {symfony/laravel/php}
Mode : {worker/classic}

──────────────────────────────────────────────────────────────
ETAT DU SYSTEME
──────────────────────────────────────────────────────────────
```

Executer les commandes de diagnostic :
```bash
# Statut du processus
ps aux | grep frankenphp

# Logs recents
docker logs frankenphp-app --tail 50
# ou : journalctl -u frankenphp --since "10 minutes ago"

# Validation du Caddyfile
frankenphp validate --config /etc/caddy/Caddyfile

# Utilisation memoire
ps -o pid,rss,vsz -p $(pidof frankenphp)

# Extensions PHP
frankenphp php-cli -m
```

### Etape 2 : Analyse de la cause racine

```
──────────────────────────────────────────────────────────────
DIAGNOSTIC
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| FrankenPHP en execution | {oui/non} | {pid, uptime} |
| Worker mode actif | {oui/non} | {nombre de threads} |
| Caddyfile valide | {oui/non} | {erreurs} |
| Memoire stable | {oui/non} | {tendance RSS} |
| Integration framework | {ok/en echec} | {Runtime/Octane} |
| Statut TLS | {ok/en echec} | {auto/proxy} |

──────────────────────────────────────────────────────────────
ARBRE DE DECISION
──────────────────────────────────────────────────────────────

Symptome : {symptome}
  ├── Crash worker ? → Verifier les erreurs PHP, memoire, segfaults
  ├── Fuite memoire ? → Definir max_requests, auditer l'etat global
  ├── Erreur Caddyfile ? → Valider la syntaxe, verifier l'ordre des directives
  ├── Echec TLS ? → Verifier auto_https, configuration proxy
  ├── Probleme framework ? → Verifier l'installation Runtime/Octane
  └── Performance ? → Profiler le code, verifier OPcache, benchmarker

Cause racine : {explication}
```

### Etape 3 : Resolution

```
──────────────────────────────────────────────────────────────
CORRECTIF
──────────────────────────────────────────────────────────────
```

Fournir :
1. **Correctif immediat** -- Changements de configuration ou commandes pour resoudre maintenant
2. **Explication** -- Pourquoi cela s'est produit, comportement specifique a FrankenPHP
3. **Prevention** -- Ajustement de configuration, alertes de monitoring

### Etape 4 : Verification

```bash
# Verifier que FrankenPHP est sain
frankenphp validate --config /etc/caddy/Caddyfile
curl -f http://localhost/healthz
ps -o pid,rss -p $(pidof frankenphp)
```

### Etape 5 : Rapport final

```
══════════════════════════════════════════════════════════════
RAPPORT DE DEBUG
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUME
──────────────────────────────────────────────────────────────

| Element | Valeur |
|---------|--------|
| Symptome | {symptome} |
| Cause racine | {cause} |
| Correctif applique | {correctif} |
| Statut | Resolu / Action necessaire |

──────────────────────────────────────────────────────────────
PREVENTION
──────────────────────────────────────────────────────────────

- [ ] Ajouter une alerte de monitoring pour {condition}
- [ ] Ajuster {parametre} pour prevenir {probleme}
- [ ] Documenter le correctif pour reference @frankenphp-debug
```
