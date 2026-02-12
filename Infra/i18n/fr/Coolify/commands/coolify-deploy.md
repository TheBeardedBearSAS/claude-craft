---
description: Deploy application to Coolify
argument-hint: [arguments]
---

# Coolify Deploy

Tu es un expert en deploiement Coolify. Tu dois guider le deploiement d'une application sur une instance Coolify PaaS auto-hebergee.

## Arguments
$ARGUMENTS

Arguments :
- Nom de l'application ou depot
- (Optionnel) Environnement : production, staging, preview
- (Optionnel) Branche : main, develop, feature/*

Exemple : `/coolify:deploy "my-app" env:production branch:main` ou `/coolify:deploy . env:staging`

## MISSION

### Etape 1 : Verifier les Prerequis

```
══════════════════════════════════════════════════════════════
DEPLOIEMENT COOLIFY
══════════════════════════════════════════════════════════════

Application : {name}
Environnement : {production/staging/preview}
Branche : {branch}

──────────────────────────────────────────────────────────────
VERIFICATION DES PREREQUIS
──────────────────────────────────────────────────────────────

| Prerequis | Statut | Details |
|-----------|--------|---------|
| Instance Coolify | {OK/ECHEC} | {url} |
| Git provider | {OK/ECHEC} | {GitHub/GitLab/Bitbucket} |
| Enregistrements DNS | {OK/ECHEC} | {domain} → {ip} |
| Capacite SSL | {OK/ECHEC} | {Let's Encrypt / custom} |
| Configuration build | {OK/ECHEC} | {Nixpacks/Dockerfile/Compose} |
```

### Etape 2 : Configurer la Connexion Git Provider

```
──────────────────────────────────────────────────────────────
CONFIGURATION DU GIT PROVIDER
──────────────────────────────────────────────────────────────

Provider : {GitHub / GitLab / Bitbucket}

### GitHub App (Recommande)
1. Coolify Dashboard > Sources > Add
2. Selectionner "GitHub App"
3. Autoriser la Coolify GitHub App
4. Selectionner les depots auxquels accorder l'acces
5. Verifier la livraison du webhook : GitHub > Settings > GitHub Apps > Recent deliveries

### GitLab (Deploy Key)
1. Coolify Dashboard > Sources > Add
2. Selectionner "GitLab"
3. Copier la cle publique SSH generee
4. GitLab > Repository > Settings > Repository > Deploy Keys > Add
5. Configurer le webhook :
   - URL : https://coolify.example.com/webhooks/source/gitlab
   - Secret : {depuis Coolify}
   - Declencheurs : Push events, Merge request events

Statut : {configure / necessite configuration}
```

### Etape 3 : Definir les Variables d'Environnement

```
──────────────────────────────────────────────────────────────
VARIABLES D'ENVIRONNEMENT
──────────────────────────────────────────────────────────────

### Variables Requises
| Variable | Valeur | Type |
|----------|--------|------|
| {VAR_NAME} | {valeur ou instruction} | Build / Runtime |

### Connexion Base de Donnees
DATABASE_URL=postgresql://{user}:{password}@{host}:5432/{database}
→ Utiliser la reference de service Coolify : $SERVICE_URL_POSTGRES

### Connexion Cache
REDIS_URL=redis://{host}:6379
→ Utiliser la reference de service Coolify : $SERVICE_URL_REDIS

### Secrets
{SECRET_NAME}={instruction pour generer}
→ openssl rand -hex 32

### Variables Partagees (entre environnements)
Configurer dans : Settings > Shared Variables
```

### Etape 4 : Choisir et Configurer le Build Pack

```
──────────────────────────────────────────────────────────────
CONFIGURATION DU BUILD
──────────────────────────────────────────────────────────────

Build Pack : {Nixpacks / Dockerfile / Docker Compose}

### Configuration Nixpacks
| Parametre | Valeur |
|-----------|--------|
| Base Directory | {/} |
| Build Command | {auto-detecte ou personnalise} |
| Start Command | {auto-detecte ou personnalise} |
| Install Command | {auto-detecte ou personnalise} |
| Port | {auto-detecte ou personnalise} |

### Configuration Dockerfile
| Parametre | Valeur |
|-----------|--------|
| Dockerfile Location | {./Dockerfile} |
| Build Target | {production} |
| Build Args | {KEY=value} |
| Port | {depuis EXPOSE ou manuel} |

### Configuration Docker Compose
| Parametre | Valeur |
|-----------|--------|
| Compose File | {./docker-compose.yml} |
| Services | {liste des services a deployer} |
```

### Etape 5 : Configurer le Domaine et SSL

```
──────────────────────────────────────────────────────────────
CONFIGURATION DOMAINE & SSL
──────────────────────────────────────────────────────────────

### Configuration du Domaine
| Parametre | Valeur |
|-----------|--------|
| Domaine | {app.example.com} |
| Forcer HTTPS | Oui |
| Redirection WWW | {Oui/Non} |
| Port | {port de l'application} |

### Certificat SSL
Methode : {Let's Encrypt HTTP / Let's Encrypt DNS / Custom}

Pour le HTTP challenge (par defaut) :
- Automatique, pas de configuration supplementaire
- Le port 80 doit etre accessible

Pour le DNS challenge (wildcard) :
- Fournisseur : {Cloudflare / DigitalOcean / Hetzner}
- Token API : {configure dans les parametres Coolify}
- Domaine wildcard : *.example.com

### Deploiements Preview (optionnel)
- Activer : {Oui/Non}
- Pattern de domaine : pr-{{PR_NUMBER}}.preview.example.com
- DNS : *.preview.example.com → {server-ip}
```

### Etape 6 : Declencher le Deploiement et Verifier

```
──────────────────────────────────────────────────────────────
DEPLOIEMENT
──────────────────────────────────────────────────────────────

### Methode de Deploiement
Option A : Git Push (automatique)
  git push origin {branch}
  → Le webhook declenche le build + deploiement Coolify

Option B : Manuel (Dashboard Coolify)
  Dashboard > Service > Deploy

Option C : API
  curl -X POST https://coolify.example.com/api/v1/deploy \
    -H "Authorization: Bearer {api-token}" \
    -H "Content-Type: application/json" \
    -d '{"uuid": "{service-uuid}"}'

### Verification de Sante
# Attendre la fin du deploiement
# Verifier les logs de deploiement dans le Dashboard Coolify

# Verifier la sante de l'application
curl -s -o /dev/null -w "%{http_code}" https://{domain}/health

# Verifier le certificat SSL
openssl s_client -connect {domain}:443 -servername {domain} 2>/dev/null | \
  openssl x509 -noout -dates

# Smoke test rapide
curl -s https://{domain}/
```

### Etape 7 : Rapport Final

```
══════════════════════════════════════════════════════════════
RAPPORT DE DEPLOIEMENT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
STATUT DU DEPLOIEMENT
──────────────────────────────────────────────────────────────

| Element | Statut |
|---------|--------|
| Build | {SUCCES / ECHEC} |
| Deploiement | {SUCCES / ECHEC} |
| Health Check | {OK / ECHEC} |
| SSL | {VALIDE / INVALIDE} |

──────────────────────────────────────────────────────────────
URLS
──────────────────────────────────────────────────────────────

| Environnement | URL |
|---------------|-----|
| Production | https://{domain} |
| Dashboard Coolify | https://coolify.example.com |
| Logs de Deploiement | https://coolify.example.com/project/... |

──────────────────────────────────────────────────────────────
INSTRUCTIONS DE ROLLBACK
──────────────────────────────────────────────────────────────

En cas de probleme :
1. Dashboard > Service > Deployments
2. Selectionner le deploiement precedent reussi
3. Cliquer sur "Rollback"

Ou via Git :
  git revert HEAD
  git push origin {branch}

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Verifier que tous les endpoints fonctionnent
2. [ ] Executer les migrations de base de donnees (si applicable)
3. [ ] Configurer le monitoring avec /coolify:backup
4. [ ] Configurer les deploiements preview (si non fait)
5. [ ] Documenter le deploiement dans le README du projet
```
