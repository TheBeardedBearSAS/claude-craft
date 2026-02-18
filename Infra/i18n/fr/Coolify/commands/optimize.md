---
description: Optimize Coolify deployment
argument-hint: [arguments]
---

# Optimisation Coolify

Tu es un Ingenieur DevOps expert en optimisation Coolify. Tu dois analyser et ameliorer les performances de build, l'utilisation des ressources, le monitoring et l'efficacite globale de l'infrastructure pour les deploiements Coolify.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Domaine de focus : build, resources, cleanup, network, all
- (Optionnel) Nom du service

Exemple : `/coolify:optimize` ou `/coolify:optimize focus:build service:api` ou `/coolify:optimize focus:cleanup`

## Mode Plan

> **Le mode plan est recommandé.** Claude active le mode plan pour structurer l'approche, identifier les dépendances et présenter une stratégie de génération avant de créer les artefacts.

## MISSION

### Etape 1 : Analyser l'Utilisation Actuelle des Ressources

```bash
# Ressources serveur
free -h
df -h /var/lib/docker
nproc
uptime

# Utilisation des ressources Docker par conteneur
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.NetIO}}\t{{.BlockIO}}"

# Detail de l'utilisation disque Docker
docker system df -v

# Nombre d'images, conteneurs, volumes
docker system df --format "table {{.Type}}\t{{.TotalCount}}\t{{.Active}}\t{{.Size}}\t{{.Reclaimable}}"
```

```
══════════════════════════════════════════════════════════════
ANALYSE D'OPTIMISATION COOLIFY
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
UTILISATION ACTUELLE DES RESSOURCES
──────────────────────────────────────────────────────────────

### Ressources Serveur
| Ressource | Utilise | Total | Statut |
|-----------|---------|-------|--------|
| CPU | {usage}% | {cores} coeurs | {OK/ATTENTION/CRITIQUE} |
| RAM | {utilise} | {total} | {OK/ATTENTION/CRITIQUE} |
| Disque | {utilise} | {total} | {OK/ATTENTION/CRITIQUE} |
| Swap | {utilise} | {total} | {OK/ATTENTION/CRITIQUE} |

### Ressources Docker
| Type | Nombre | Actifs | Taille | Recuperable |
|------|--------|--------|--------|-------------|
| Images | {n} | {n} | {taille} | {taille} |
| Conteneurs | {n} | {n} | {taille} | {taille} |
| Volumes | {n} | {n} | {taille} | {taille} |
| Cache de Build | - | - | {taille} | {taille} |

### Utilisation par Service
| Service | CPU | Memoire | E/S Reseau | E/S Disque |
|---------|-----|---------|------------|------------|
| {name} | {%} | {utilise}/{limite} | {entree/sortie} | {lecture/ecriture} |
```

### Etape 2 : Optimiser les Performances de Build

```
──────────────────────────────────────────────────────────────
OPTIMISATION DU BUILD
──────────────────────────────────────────────────────────────

### Performance de Build Actuelle
| Service | Temps de Build | Taille Image | Methode |
|---------|----------------|--------------|---------|
| {name} | {duree} | {taille} | {Nixpacks/Dockerfile} |

### Recommandations

#### Optimisation Nixpacks
| Optimisation | Impact | Comment |
|-------------|--------|---------|
| Cache des dependances | Build -50% | Automatique (Nixpacks met en cache les layers) |
| .nixpacks ignore | Build -20% | Ajouter un fichier .nixpacks pour exclure des fichiers |
| Image pre-construite | Build -80% | Utiliser une image Docker pre-construite a la place |

#### Optimisation Dockerfile
| Optimisation | Impact | Comment |
|-------------|--------|---------|
| Build multi-stage | Taille -60% | Separer les stages de build et runtime |
| Ordre des layers | Cache hit +50% | Dependances avant le code source |
| .dockerignore | Contexte -70% | Exclure node_modules, .git, tests |
| Base Alpine | Taille -40% | Utiliser les variantes d'image -alpine |
| Cache BuildKit | Build -30% | --mount=type=cache pour les gestionnaires de paquets |

#### Serveur de Build Dedie
| Avantage | Description |
|----------|-------------|
| Pas d'impact prod | Les builds ne consomment pas les ressources prod |
| Builds plus rapides | Plus de CPU/RAM dedies aux builds |
| Builds paralleles | Plusieurs apps buildent simultanement |

Configuration :
1. Coolify Dashboard > Servers > Add Server
2. Definir comme "Build Server" dans les parametres du serveur
3. Les applications builderont sur ce serveur, deploieront vers la production
```

### Etape 3 : Configurer le Nettoyage Automatique

```
──────────────────────────────────────────────────────────────
CONFIGURATION DU NETTOYAGE AUTOMATIQUE
──────────────────────────────────────────────────────────────

### Nettoyage Integre Coolify
Dashboard > Settings > Configuration :
- Supprimer les images Docker inutilisees : {activer}
- Frequence de nettoyage : {quotidien/hebdomadaire}

### Script de Nettoyage Docker
\`\`\`bash
#!/bin/bash
# docker-cleanup.sh - Executer via cron quotidiennement

# Supprimer les conteneurs arretes de plus de 24h
docker container prune -f --filter "until=24h"

# Supprimer les images inutilisees (non utilisees par un conteneur)
docker image prune -af --filter "until=72h"

# Supprimer les volumes inutilises (ATTENTION : verifier qu'aucune donnee importante)
# docker volume prune -f

# Supprimer le cache de build de plus de 7 jours
docker builder prune -f --filter "until=168h"

# Logger les resultats du nettoyage
echo "$(date): Ressources Docker nettoyees" >> /var/log/docker-cleanup.log
docker system df --format "table {{.Type}}\t{{.Size}}\t{{.Reclaimable}}"
\`\`\`

### Configuration Cron
\`\`\`bash
# Ajouter au crontab : crontab -e
0 4 * * * /opt/scripts/docker-cleanup.sh >> /var/log/docker-cleanup.log 2>&1
\`\`\`

### Estimation de l'Impact du Nettoyage
| Ressource | Actuel | Apres Nettoyage | Economies |
|-----------|--------|-----------------|-----------|
| Images | {taille} | {estime} | {economise} |
| Cache de Build | {taille} | {estime} | {economise} |
| Conteneurs | {taille} | {estime} | {economise} |
| Total | {total} | {estime} | {economise} |
```

### Etape 4 : Examiner et Ameliorer le Monitoring

```
──────────────────────────────────────────────────────────────
REVUE DU MONITORING
──────────────────────────────────────────────────────────────

### Audit des Health Checks
| Service | Health Check | Intervalle | Statut |
|---------|-------------|------------|--------|
| {name} | {chemin ou aucun} | {intervalle} | {OK/MANQUANT/ECHEC} |

### Health Checks Recommandes
Pour chaque service sans health check :
\`\`\`
Service : {name}
Path : /health (ou /api/health, /healthz)
Interval : 30s
Timeout : 10s
Retries : 3
Start Period : 60s
\`\`\`

### Limites de Ressources
| Service | Limite Actuelle | Recommandee | Raison |
|---------|----------------|-------------|--------|
| {name} | {aucune/actuelle} | {recommandee} | {basee sur l'utilisation} |

### Lacunes d'Alerting
| Alerte | Statut | Recommande |
|--------|--------|------------|
| Crash de conteneur | {configure/manquant} | Notification Coolify |
| Disque > 85% | {configure/manquant} | Cron + webhook |
| RAM > 90% | {configure/manquant} | Cron + webhook |
| Echec de sauvegarde | {configure/manquant} | Notification Coolify |
| Expiration SSL | {configure/manquant} | Uptime Kuma |
```

### Etape 5 : Optimiser le Reseau

```
──────────────────────────────────────────────────────────────
OPTIMISATION RESEAU
──────────────────────────────────────────────────────────────

### Configuration Traefik
| Parametre | Actuel | Recommande |
|-----------|--------|------------|
| Compression | {on/off} | Activer gzip/brotli |
| Rate limiting | {on/off} | Activer pour les APIs publiques |
| Limites de connexion | {valeur} | Ajuster selon le trafic |
| Logs d'acces | {on/off} | Activer pour le debug |

### Configuration de la Compression
\`\`\`yaml
# Middleware Traefik pour la compression
http:
  middlewares:
    compress:
      compress:
        excludedContentTypes:
          - "text/event-stream"
\`\`\`

### En-tetes de Securite
\`\`\`yaml
# Middleware Traefik pour les en-tetes de securite
http:
  middlewares:
    security-headers:
      headers:
        stsSeconds: 31536000
        stsIncludeSubdomains: true
        contentTypeNosniff: true
        frameDeny: true
        browserXssFilter: true
        referrerPolicy: "strict-origin-when-cross-origin"
\`\`\`

### Optimisation DNS
| Parametre | Actuel | Recommande |
|-----------|--------|------------|
| TTL | {valeur} | 300s (prod), 60s (pendant migration) |
| CDN | {aucun/Cloudflare} | Cloudflare (tier gratuit) pour les assets statiques |
| Proxy | {direct/proxied} | Proxy Cloudflare pour la protection DDoS |
```

### Etape 6 : Rapport Final

```
══════════════════════════════════════════════════════════════
RAPPORT D'OPTIMISATION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
AMELIORATIONS APPLIQUEES
──────────────────────────────────────────────────────────────

| Categorie | Avant | Apres | Amelioration |
|-----------|-------|-------|--------------|
| Temps de build | {avant} | {apres} | {reduction %} |
| Taille d'image | {avant} | {apres} | {reduction %} |
| Utilisation disque | {avant} | {apres} | {libere} |
| Utilisation memoire | {avant} | {apres} | {libere} |

──────────────────────────────────────────────────────────────
RESUME DES RECOMMANDATIONS
──────────────────────────────────────────────────────────────

### Immediat (a faire maintenant)
- [ ] {recommandation a fort impact, faible effort}

### Court terme (cette semaine)
- [ ] {recommandation a impact moyen}

### Long terme (ce mois-ci)
- [ ] {recommandation necessitant une planification}

──────────────────────────────────────────────────────────────
COMMANDES DE MONITORING
──────────────────────────────────────────────────────────────

# Verification rapide de sante
docker ps --format "{{.Names}}: {{.Status}}" | sort

# Vue d'ensemble des ressources
docker stats --no-stream

# Utilisation disque
docker system df

# Nettoyage (sur)
docker system prune -f
docker image prune -f --filter "until=72h"
```
