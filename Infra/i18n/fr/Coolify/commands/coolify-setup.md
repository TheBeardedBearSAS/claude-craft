---
description: Initialize project for Coolify deployment
argument-hint: [arguments]
---

# Coolify Setup

Tu es un specialiste du deploiement Coolify. Tu dois analyser le projet et le preparer pour un deploiement sur une instance Coolify PaaS auto-hebergee.

## Arguments
$ARGUMENTS

Arguments :
- Description ou chemin du projet
- (Optionnel) Build pack cible : nixpacks, dockerfile, compose
- (Optionnel) Services necessaires : postgres, redis, mysql, mongodb

Exemple : `/coolify:setup "API Node.js avec PostgreSQL et Redis"` ou `/coolify:setup . buildpack:dockerfile services:postgres,redis`

## Mode Plan

> **Le mode plan est obligatoire.** Avant l'exécution, Claude active le mode plan pour analyser le code impacté, proposer un plan d'implémentation et attendre votre validation avant toute modification.

## MISSION

### Etape 1 : Analyser la Stack du Projet

```bash
# Detecter le type de projet
ls -la package.json composer.json requirements.txt go.mod Cargo.toml Gemfile *.csproj 2>/dev/null

# Verifier les fichiers Docker existants
ls -la Dockerfile* docker-compose*.yml .dockerignore nixpacks.toml 2>/dev/null

# Verifier la configuration d'environnement
ls -la .env .env.example .env.local 2>/dev/null

# Identifier les services depuis le code
grep -r "DATABASE_URL\|REDIS_URL\|MONGODB_URI\|MYSQL_" .env* 2>/dev/null
```

```
══════════════════════════════════════════════════════════════
CONFIGURATION DU PROJET COOLIFY
══════════════════════════════════════════════════════════════

Projet : {name}
Chemin : {path}

──────────────────────────────────────────────────────────────
DETECTION DE LA STACK
──────────────────────────────────────────────────────────────

| Composant | Detecte | Version |
|-----------|---------|---------|
| Langage | {language} | {version} |
| Framework | {framework} | {version} |
| Gestionnaire de paquets | {npm/yarn/pnpm/composer/pip} | {version} |

| Service | Detecte | Source |
|---------|---------|--------|
| {database} | {oui/non} | {var env / fichier config} |
| {cache} | {oui/non} | {var env / fichier config} |
| {queue} | {oui/non} | {var env / fichier config} |
```

### Etape 2 : Recommander le Build Pack

```
──────────────────────────────────────────────────────────────
RECOMMANDATION DU BUILD PACK
──────────────────────────────────────────────────────────────

Recommande : {Nixpacks / Dockerfile / Docker Compose}

Justification :
- {raison 1}
- {raison 2}

| Build Pack | Avantages | Inconvenients |
|------------|-----------|---------------|
| Nixpacks | Zero-config, auto-detection | Moins de controle |
| Dockerfile | Controle total, reproductible | Configuration manuelle |
| Docker Compose | Multi-services, config existante | Plus complexe |

Selectionne : {build pack}
```

### Etape 3 : Generer/Valider la Configuration

Pour Nixpacks :
```toml
# nixpacks.toml (si personnalisation necessaire)
[phases.setup]
nixPkgs = ["..."]

[phases.install]
cmds = ["npm ci"]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

Pour Dockerfile (si absent) :
```dockerfile
# Generer un Dockerfile adapte a la stack detectee
# Build multi-stage optimise pour le deploiement Coolify
```

Pour Docker Compose (valider l'existant) :
```yaml
# Valider le docker-compose.yml pour la compatibilite Coolify
# Verifier les conflits de ports, definitions de volumes, config reseau
```

### Etape 4 : Creer le Template d'Environnement

```
──────────────────────────────────────────────────────────────
VARIABLES D'ENVIRONNEMENT
──────────────────────────────────────────────────────────────
```

Generer le template `.env.coolify` :
```bash
# =============================================================================
# Template de Variables d'Environnement Coolify
# =============================================================================
# Copier ces variables dans la configuration de votre service Coolify
# Dashboard > Service > Environment Variables

# Application
NODE_ENV=production
APP_URL=https://{your-domain}
PORT=3000

# Base de donnees (utiliser PostgreSQL gere par Coolify)
DATABASE_URL=postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${SERVICE_URL_POSTGRES}:5432/${POSTGRES_DB}

# Cache (utiliser Redis gere par Coolify)
REDIS_URL=redis://${SERVICE_URL_REDIS}:6379

# Secrets (generer des valeurs uniques)
SECRET_KEY={generate-with: openssl rand -hex 32}
JWT_SECRET={generate-with: openssl rand -hex 64}

# Services Externes (configurer selon les besoins)
# SMTP_HOST=
# SMTP_PORT=587
# S3_ENDPOINT=
# S3_BUCKET=
```

### Etape 5 : Generer la Checklist de Deploiement

```
──────────────────────────────────────────────────────────────
CHECKLIST DE DEPLOIEMENT
──────────────────────────────────────────────────────────────

### Prerequis Serveur
- [ ] VPS provisionne (min 4 Go RAM, 2 vCPU, 50 Go SSD)
- [ ] Coolify installe : curl -fsSL https://cdn.coolify.io/install.sh | bash
- [ ] Firewall configure : ports 22, 80, 443 ouverts
- [ ] Authentification SSH par cle activee

### Configuration DNS
- [ ] Enregistrement A : {domain} → {server-ip}
- [ ] (Optionnel) Wildcard : *.{domain} → {server-ip}
- [ ] Propagation DNS verifiee : dig +short {domain}

### Configuration Coolify
- [ ] Source Git connectee (GitHub App / deploy key)
- [ ] Projet cree dans le dashboard Coolify
- [ ] Environnement cree (production/staging)
- [ ] Service application ajoute

### Configuration du Service
- [ ] Build pack selectionne : {recommendation}
- [ ] Commandes de build/demarrage verifiees
- [ ] Port configure : {port}
- [ ] Variables d'environnement definies
- [ ] Domaine configure avec SSL
- [ ] Endpoint de health check : /health

### Configuration Base de Donnees (si applicable)
- [ ] Service de base de donnees cree dans Coolify
- [ ] URL de connexion definie dans les variables d'environnement
- [ ] Migration/seed initiale prete
- [ ] Planning de sauvegarde configure

### Post-Deploiement
- [ ] Health check repond
- [ ] Certificat SSL valide
- [ ] Application fonctionnelle
- [ ] Monitoring configure
```

### Etape 6 : Rapport Final

```
══════════════════════════════════════════════════════════════
RAPPORT DE CONFIGURATION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
FICHIERS CREES/VERIFIES
──────────────────────────────────────────────────────────────

| Fichier | Statut | Description |
|---------|--------|-------------|
| {file} | {cree/verifie/modifie} | {description} |

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Examiner .env.coolify et definir les valeurs de production
2. [ ] Completer la checklist des prerequis serveur
3. [ ] Configurer les enregistrements DNS
4. [ ] Deployer avec /coolify:deploy
5. [ ] Configurer les sauvegardes avec /coolify:backup
```
