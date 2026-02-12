---
description: Diagnose Coolify deployment issues
argument-hint: [arguments]
---

# Diagnostics Coolify

Tu es un expert en debug Coolify. Tu dois diagnostiquer et resoudre les problemes de deploiement et d'execution sur Coolify PaaS auto-heberge.

## Arguments
$ARGUMENTS

Arguments :
- Symptome ou message d'erreur
- (Optionnel) Nom du service
- (Optionnel) Contexte : build, runtime, networking, ssl

Exemple : `/coolify:debug "502 Bad Gateway sur app.example.com"` ou `/coolify:debug "Build echoue avec OOM" service:api`

## MISSION

### Etape 1 : Collecter les Symptomes

```
══════════════════════════════════════════════════════════════
DIAGNOSTICS COOLIFY
══════════════════════════════════════════════════════════════

Service : {name}
Type : {Application / Base de donnees / Docker Compose}
Build Pack : {Nixpacks / Dockerfile / Compose}

──────────────────────────────────────────────────────────────
SYMPTOME RAPPORTE
──────────────────────────────────────────────────────────────

{description du probleme}

### Classification du Symptome
| Categorie | Probabilite |
|-----------|-------------|
| Echec de build | {Haute/Moyenne/Faible} |
| Erreur runtime | {Haute/Moyenne/Faible} |
| Reseau | {Haute/Moyenne/Faible} |
| SSL/TLS | {Haute/Moyenne/Faible} |
| Webhook/Git | {Haute/Moyenne/Faible} |
| Stockage | {Haute/Moyenne/Faible} |
```

### Etape 2 : Verifier le Statut du Deploiement et les Logs

```bash
# Verifier les services Coolify
docker ps --filter "name=coolify" --format "table {{.Names}}\t{{.Status}}"

# Verifier les conteneurs applicatifs
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Logs de l'application (depuis le dashboard Coolify ou CLI)
docker logs <container-name> --tail 200 2>&1

# Logs du proxy Traefik
docker logs coolify-proxy --tail 100 2>&1 | grep -i "error\|warn"

# Ressources systeme
free -h
df -h /var/lib/docker
```

```
──────────────────────────────────────────────────────────────
STATUT DU DEPLOIEMENT
──────────────────────────────────────────────────────────────

| Verification | Resultat | Details |
|--------------|----------|---------|
| Etat du conteneur | {running/exited/restarting} | {uptime ou code de sortie} |
| Health check | {healthy/unhealthy/none} | {resultat du dernier check} |
| Route Traefik | {active/manquante} | {statut du routage du domaine} |
| Dernier deploiement | {succes/echec} | {horodatage} |
| Ressources | {OK/avertissement} | CPU : {%}, RAM : {utilise/total} |
| Disque | {OK/avertissement} | {utilise/total} ({pourcentage}) |
```

### Etape 3 : Verifier le Statut du Conteneur

```bash
# Inspection detaillee du conteneur
docker inspect <container-name> --format='
  State: {{.State.Status}}
  Exit Code: {{.State.ExitCode}}
  OOM Killed: {{.State.OOMKilled}}
  Started: {{.State.StartedAt}}
  Finished: {{.State.FinishedAt}}
  Restarts: {{.RestartCount}}
'

# Processus du conteneur
docker exec <container-name> ps aux 2>/dev/null || echo "Cannot exec (container not running)"

# Utilisation des ressources du conteneur
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
```

### Etape 4 : Verifier le Reseau

```bash
# Resolution DNS
dig +short {domain}
nslookup {domain} 8.8.8.8

# Accessibilite du port (depuis l'exterieur)
curl -s -o /dev/null -w "%{http_code}" https://{domain}
curl -s -o /dev/null -w "%{http_code}" http://{domain}

# Routage Traefik
docker logs coolify-proxy 2>&1 | grep "{domain}"

# Connectivite interne (depuis le conteneur)
docker exec <container-name> wget -q -O- http://localhost:{port}/health 2>/dev/null

# Verifier le firewall
sudo ufw status verbose
```

### Etape 5 : Verifier SSL et Let's Encrypt

```bash
# Details du certificat
openssl s_client -connect {domain}:443 -servername {domain} 2>/dev/null | \
  openssl x509 -noout -dates -subject -issuer

# Logs Let's Encrypt
docker logs coolify-proxy 2>&1 | grep -i "acme\|certificate\|letsencrypt"

# Stockage ACME
docker exec coolify-proxy cat /data/acme.json 2>/dev/null | jq '.[] | keys'

# Verification du DNS challenge (si wildcard)
dig TXT _acme-challenge.{domain}
```

### Etape 6 : Verifier les Webhooks et l'Integration Git

```
──────────────────────────────────────────────────────────────
STATUT GIT & WEBHOOK
──────────────────────────────────────────────────────────────

### GitHub App
- Verifier : GitHub > Settings > Applications > Coolify
- Livraisons recentes : Settings > Developer settings > GitHub Apps > Advanced
- Verifier : le depot a la Coolify app installee

### Livraison du Webhook
| Verification | Statut |
|--------------|--------|
| URL du webhook accessible | {oui/non} |
| Statut de la derniere livraison | {succes/echec} |
| Code de reponse | {200/404/500} |
| Correspondance de branche | {oui/non} |
| Auto-deploy active | {oui/non} |

### Test de Declenchement Manuel
curl -X POST https://coolify.example.com/api/v1/deploy \
  -H "Authorization: Bearer {token}" \
  -d '{"uuid": "{service-uuid}"}'
```

### Etape 7 : Proposer le Correctif

```
──────────────────────────────────────────────────────────────
DIAGNOSTIC
──────────────────────────────────────────────────────────────

### Cause Racine
{description de la cause racine}

### Preuves
- {preuve 1}
- {preuve 2}

──────────────────────────────────────────────────────────────
SOLUTION
──────────────────────────────────────────────────────────────

### Hypothese 1 : {La Plus Probable}
**Cause** : {description}
**Correctif** :
\`\`\`bash
{commandes de resolution}
\`\`\`

### Hypothese 2 : {Alternative}
**Cause** : {description}
**Correctif** :
\`\`\`bash
{commandes de resolution}
\`\`\`

──────────────────────────────────────────────────────────────
PREVENTION
──────────────────────────────────────────────────────────────

Pour eviter ce probleme a l'avenir :
- [ ] {Recommandation 1}
- [ ] {Recommandation 2}
- [ ] {Recommandation 3}

──────────────────────────────────────────────────────────────
COMMANDES UTILES
──────────────────────────────────────────────────────────────

# Redeployer le service
# Dashboard > Service > Deploy (ou Rebuild without cache)

# Redemarrer le proxy Traefik
docker restart coolify-proxy

# Nettoyer les ressources Docker
docker system prune -af

# Verifier la sante de tous les conteneurs
docker ps --format "{{.Names}}: {{.Status}}" | sort
```

## Checklist de Diagnostic

### Informations de Base
- [ ] Message d'erreur ou symptome exact note
- [ ] Moment de debut du probleme identifie
- [ ] Changements recents examines (deploiement, config, DNS)
- [ ] Reproductibilite confirmee

### Environnement
- [ ] Version de Coolify verifiee
- [ ] Ressources du serveur verifiees (RAM, disque, CPU)
- [ ] Statut de Docker verifie
- [ ] Connectivite reseau testee

### Verifications Effectuees
- [ ] Logs de deploiement analyses
- [ ] Etat du conteneur verifie
- [ ] Routage Traefik verifie
- [ ] Resolution DNS confirmee
- [ ] Certificat SSL valide
- [ ] Livraison des webhooks verifiee
