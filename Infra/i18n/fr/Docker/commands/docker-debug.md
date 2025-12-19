---
description: Diagnostic Docker
argument-hint: [arguments]
---

# Diagnostic Docker

Tu es un expert en debugging Docker. Tu dois diagnostiquer et résoudre les problèmes liés aux conteneurs.

## Arguments
$ARGUMENTS

Arguments :
- Symptôme ou message d'erreur
- (Optionnel) Nom du conteneur
- (Optionnel) Contexte (dev/prod)

Exemple : `/docker:debug "Container exits with code 137"` ou `/docker:debug app "Connection refused"`

## MISSION

### Étape 1 : Collecter les Informations

```bash
# État des conteneurs
docker ps -a

# Logs récents
docker logs <container> --tail 100 2>&1

# Inspection complète
docker inspect <container>

# Ressources
docker stats --no-stream
```

### Étape 2 : Identifier le Problème

```
══════════════════════════════════════════════════════════════
🔍 DIAGNOSTIC DOCKER
══════════════════════════════════════════════════════════════

Container : {nom}
Image : {image}
État : {running|exited|restarting}
Uptime : {durée}

──────────────────────────────────────────────────────────────
🚨 SYMPTÔME RAPPORTÉ
──────────────────────────────────────────────────────────────

{description du problème}

──────────────────────────────────────────────────────────────
📋 ANALYSE
──────────────────────────────────────────────────────────────
```

### Étape 3 : Arbres de Décision

#### Container Ne Démarre Pas

| Exit Code | Signification | Actions |
|-----------|---------------|---------|
| 0 | Terminé normalement | Vérifier CMD/ENTRYPOINT |
| 1 | Erreur application | Analyser logs |
| 126 | Permission denied | Vérifier permissions |
| 127 | Command not found | Vérifier PATH et binaire |
| 137 | SIGKILL (OOM ou stop) | Vérifier mémoire |
| 139 | SIGSEGV | Debug code |

```bash
# Vérifier exit code
docker inspect --format='{{.State.ExitCode}}' <container>

# Vérifier OOM
docker inspect --format='{{.State.OOMKilled}}' <container>

# Logs détaillés
docker logs <container> 2>&1
```

#### Problèmes Réseau

```bash
# Résolution DNS
docker exec <container> nslookup <service>
docker exec <container> cat /etc/resolv.conf

# Connectivité
docker exec <container> ping -c 3 <host>
docker exec <container> nc -zv <host> <port>

# Configuration réseau
docker network inspect <network>
docker inspect --format='{{json .NetworkSettings.Networks}}' <container>
```

#### Problèmes de Ressources

```bash
# Monitoring temps réel
docker stats <container>

# Processus dans le container
docker exec <container> ps aux
docker exec <container> top -bn1

# Mémoire détaillée
docker exec <container> free -m
docker exec <container> cat /proc/meminfo
```

#### Problèmes de Volumes

```bash
# Modifications filesystem
docker diff <container>

# Espace disque
docker exec <container> df -h

# Permissions
docker exec <container> ls -la /path/to/data

# Inspecter le volume
docker volume inspect <volume>
```

### Étape 4 : Solutions Courantes

```
──────────────────────────────────────────────────────────────
💡 HYPOTHÈSES & SOLUTIONS
──────────────────────────────────────────────────────────────

### Hypothèse 1 : [Plus probable]
**Cause** : {description}
**Vérification** :
\`\`\`bash
{commande de diagnostic}
\`\`\`
**Solution** :
\`\`\`bash
{commande de résolution}
\`\`\`

### Hypothèse 2 : [Alternative]
**Cause** : {description}
**Vérification** :
\`\`\`bash
{commande}
\`\`\`
**Solution** :
\`\`\`bash
{commande}
\`\`\`
```

### Étape 5 : Rapport Final

```
══════════════════════════════════════════════════════════════
📊 RAPPORT DE DIAGNOSTIC
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🎯 CAUSE IDENTIFIÉE
──────────────────────────────────────────────────────────────

{Description de la cause racine}

──────────────────────────────────────────────────────────────
✅ SOLUTION APPLIQUÉE
──────────────────────────────────────────────────────────────

{Étapes de résolution}

──────────────────────────────────────────────────────────────
🛡️ PRÉVENTION
──────────────────────────────────────────────────────────────

Pour éviter ce problème à l'avenir :
- [ ] {Recommandation 1}
- [ ] {Recommandation 2}
- [ ] {Recommandation 3}

──────────────────────────────────────────────────────────────
🔧 COMMANDES UTILES
──────────────────────────────────────────────────────────────

# Recréer le conteneur
docker compose up -d --force-recreate <service>

# Rebuild complet
docker compose build --no-cache <service>

# Nettoyer ressources
docker system prune -af

# Vérifier l'état
docker compose ps
docker compose logs -f <service>
```

## Checklist de Diagnostic

### Information de Base
- [ ] Message d'erreur exact noté
- [ ] Timestamp du problème
- [ ] Changements récents identifiés
- [ ] Reproductibilité vérifiée

### Environnement
- [ ] Version Docker (`docker version`)
- [ ] OS host vérifié
- [ ] Ressources disponibles
- [ ] Mode (Compose/Swarm)

### Vérifications Effectuées
- [ ] Logs analysés
- [ ] État container vérifié
- [ ] Ressources vérifiées
- [ ] Réseau testé (si applicable)
- [ ] Volumes vérifiés (si applicable)
