---
description: Configure and manage Coolify backups
argument-hint: [arguments]
---

# Configuration des Sauvegardes Coolify

Tu es un expert en sauvegarde et reprise d'activite Coolify. Tu dois configurer les strategies de sauvegarde, tester les restaurations et documenter les procedures de reprise pour les services geres par Coolify.

## Arguments
$ARGUMENTS

Arguments :
- Action : audit, configure, test, restore
- (Optionnel) Nom ou type de service
- (Optionnel) Fournisseur S3 : backblaze, wasabi, aws, minio

Exemple : `/coolify:backup audit` ou `/coolify:backup configure provider:backblaze` ou `/coolify:backup test service:postgres`

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

### Etape 1 : Auditer l'Etat Actuel des Sauvegardes

```bash
# Inventaire de tous les services
docker ps --format "table {{.Names}}\t{{.Status}}" | sort

# Identifier les bases de donnees
docker ps --filter "ancestor=postgres" --filter "ancestor=mysql" --filter "ancestor=mongo" --filter "ancestor=redis" --format "{{.Names}}"

# Verifier les volumes existants
docker volume ls --format "table {{.Name}}\t{{.Driver}}"

# Utilisation disque actuelle
df -h /var/lib/docker
du -sh /var/lib/docker/volumes/* 2>/dev/null | sort -rh | head -20
```

```
══════════════════════════════════════════════════════════════
AUDIT DES SAUVEGARDES COOLIFY
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
INVENTAIRE DES SERVICES
──────────────────────────────────────────────────────────────

| Service | Type | Taille Donnees | Statut Sauvegarde |
|---------|------|----------------|-------------------|
| {name} | {PostgreSQL/MySQL/Redis/App} | {size} | {configure/manquant} |

──────────────────────────────────────────────────────────────
STATUT ACTUEL DES SAUVEGARDES
──────────────────────────────────────────────────────────────

| Element | Statut | Details |
|---------|--------|---------|
| Stockage S3 | {configure/manquant} | {nom du fournisseur ou N/A} |
| Sauvegardes BD | {actives/inactives} | {frequence ou N/A} |
| Sauvegardes volumes | {actives/inactives} | {frequence ou N/A} |
| Derniere sauvegarde | {date} | {taille} |
| Retention | {X jours} | {politique ou aucune} |
| Restauration testee | {oui/non/jamais} | {date du dernier test} |
```

### Etape 2 : Configurer le Stockage Compatible S3

```
──────────────────────────────────────────────────────────────
CONFIGURATION DU STOCKAGE S3
──────────────────────────────────────────────────────────────

### Selection du Fournisseur

| Fournisseur | Cout Mensuel (50 Go) | Egress | Ideal Pour |
|-------------|----------------------|--------|------------|
| Backblaze B2 | 0,25 $ | Gratuit via CF | Budget |
| Wasabi | 0,35 $ | Gratuit | Pas de frais d'egress |
| Hetzner | 0,25 $ | Inclus | Conformite EU |
| AWS S3 | 1,15 $ | 0,09 $/Go | Ecosysteme AWS |
| MinIO | Gratuit (auto-heberge) | N/A | Controle total |

### Configuration Coolify
Dashboard > Settings > S3 Storage > Add New :

| Champ | Valeur |
|-------|--------|
| Nom | {production-backups} |
| Endpoint | {URL de l'endpoint du fournisseur} |
| Bucket | {bucket-name} |
| Region | {region} |
| Access Key | {access-key} |
| Secret Key | {secret-key} |

### Tester la Connexion
→ Cliquer sur "Test Connection" dans le dashboard Coolify
→ Verifier : fichier test uploade et supprime avec succes
```

### Etape 3 : Definir le Planning et la Retention des Sauvegardes

```
──────────────────────────────────────────────────────────────
PLANNING DES SAUVEGARDES
──────────────────────────────────────────────────────────────

### Sauvegardes de Base de Donnees (Integre Coolify)
Pour chaque service de base de donnees :
Dashboard > Database > Backups

| Base de Donnees | Frequence | Retention | Destination S3 |
|-----------------|-----------|-----------|----------------|
| {PostgreSQL} | {expression cron} | {N sauvegardes} | {nom du stockage} |
| {MySQL} | {expression cron} | {N sauvegardes} | {nom du stockage} |
| {Redis} | {expression cron} | {N sauvegardes} | {nom du stockage} |

Plannings courants :
- Petit projet : 0 3 * * *        (quotidien a 3h)
- Production :   0 */6 * * *      (toutes les 6 heures)
- Critique :     0 * * * *        (toutes les heures)

### Sauvegardes de Volumes (Personnalise)
Configurer via tache planifiee Coolify ou cron :

| Volume | Frequence | Retention | Methode |
|--------|-----------|-----------|---------|
| {uploads} | Quotidien | 14 jours | tar + S3 |
| {config} | Hebdomadaire | 4 semaines | tar + S3 |

### Politique de Retention

| Type de Sauvegarde | Conserver | Stockage Estime |
|--------------------|----------|-----------------|
| BD horaire | 24 sauvegardes | {estimation taille} |
| BD quotidienne | 30 sauvegardes | {estimation taille} |
| Volumes hebdomadaire | 4 sauvegardes | {estimation taille} |
| Complet mensuel | 3 sauvegardes | {estimation taille} |
| Total | - | {estimation totale} |
| Cout mensuel | - | {estimation cout} |
```

### Etape 4 : Tester la Sauvegarde et la Restauration

```
──────────────────────────────────────────────────────────────
VERIFICATION DES SAUVEGARDES
──────────────────────────────────────────────────────────────

### 1. Verifier que la Sauvegarde Existe
\`\`\`bash
# Lister les sauvegardes recentes dans S3
aws s3 ls s3://{bucket}/databases/ --recursive --human-readable | tail -5

# Ou via le dashboard Coolify
# Database > Backups > View list
\`\`\`

### 2. Telecharger et Verifier l'Integrite
\`\`\`bash
# Telecharger la derniere sauvegarde
aws s3 cp s3://{bucket}/databases/postgresql/{latest}.sql.gz /tmp/

# Verifier que le fichier n'est pas corrompu
gunzip -t /tmp/{latest}.sql.gz && echo "Integrite OK" || echo "CORROMPU"
\`\`\`

### 3. Tester la Restauration de Base de Donnees
\`\`\`bash
# Creer une base de donnees de test
docker exec {postgres-container} psql -U {user} -c "CREATE DATABASE restore_test;"

# Restaurer la sauvegarde
gunzip -c /tmp/{latest}.sql.gz | \
  docker exec -i {postgres-container} psql -U {user} -d restore_test

# Verifier les donnees
docker exec {postgres-container} psql -U {user} -d restore_test \
  -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname='public';"

# Verification du nombre de lignes
docker exec {postgres-container} psql -U {user} -d restore_test \
  -c "SELECT count(*) as rows FROM {main_table};"

# Nettoyer la base de test
docker exec {postgres-container} psql -U {user} -c "DROP DATABASE restore_test;"
\`\`\`

### 4. Tester la Restauration de Volume
\`\`\`bash
# Telecharger la sauvegarde de volume
aws s3 cp s3://{bucket}/volumes/{latest}.tar.gz /tmp/

# Restaurer vers un volume de test
docker volume create test_restore
docker run --rm -v test_restore:/data -v /tmp:/backup:ro \
  alpine tar xzf /backup/{latest}.tar.gz -C /data

# Verifier le contenu
docker run --rm -v test_restore:/data alpine ls -la /data/

# Nettoyage
docker volume rm test_restore
\`\`\`
```

### Etape 5 : Configurer les Alertes

```
──────────────────────────────────────────────────────────────
CONFIGURATION DES ALERTES
──────────────────────────────────────────────────────────────

### Notifications Coolify
Dashboard > Settings > Notifications :

| Canal | Type | Evenements |
|-------|------|------------|
| {Slack/Discord/Email} | {URL webhook} | Succes/echec de sauvegarde |

### Script de Monitoring des Sauvegardes
\`\`\`bash
#!/bin/bash
# check-backups.sh - Executer quotidiennement via cron

BUCKET="s3://{bucket}"
MAX_AGE_HOURS=24
WEBHOOK_URL="{slack-webhook-url}"

# Verifier l'age de la derniere sauvegarde PostgreSQL
LATEST=$(aws s3 ls ${BUCKET}/databases/postgresql/ | sort | tail -1 | awk '{print $1" "$2}')
LATEST_EPOCH=$(date -d "$LATEST" +%s 2>/dev/null || echo 0)
NOW_EPOCH=$(date +%s)
AGE_HOURS=$(( (NOW_EPOCH - LATEST_EPOCH) / 3600 ))

if [ "$AGE_HOURS" -gt "$MAX_AGE_HOURS" ]; then
  curl -s -X POST "$WEBHOOK_URL" \
    -d "{\"text\": \"ALERTE SAUVEGARDE : La sauvegarde PostgreSQL a ${AGE_HOURS}h (max : ${MAX_AGE_HOURS}h)\"}"
fi
\`\`\`
```

### Etape 6 : Documenter le Plan de Reprise d'Activite

```
══════════════════════════════════════════════════════════════
PLAN DE REPRISE D'ACTIVITE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
METRIQUES DE REPRISE
──────────────────────────────────────────────────────────────

| Metrique | Objectif | Atteint |
|----------|----------|--------|
| RPO (tolerance de perte de donnees) | {heures} | {heures} |
| RTO (temps de reprise) | {heures} | {heures} |

──────────────────────────────────────────────────────────────
PROCEDURES DE REPRISE
──────────────────────────────────────────────────────────────

### Reprise d'un Seul Service
1. Identifier le service en echec dans le dashboard Coolify
2. Verifier les logs de deploiement pour l'erreur
3. Redeployer ou revenir a la version precedente
4. Si probleme de donnees : restaurer la base de donnees depuis la sauvegarde S3
Temps : 15-30 minutes

### Reprise Complete du Serveur
1. Provisionner un nouveau VPS (memes specs)
2. Installer Coolify
3. Configurer la connexion au stockage S3
4. Restaurer les bases de donnees depuis la sauvegarde
5. Reconnecter les sources Git et redeployer les apps
6. Mettre a jour les enregistrements DNS
Temps : 1-2 heures

──────────────────────────────────────────────────────────────
RESUME DES SAUVEGARDES
──────────────────────────────────────────────────────────────

| Composant | Planning | Retention | Chemin S3 |
|-----------|----------|-----------|-----------|
| {database} | {frequence} | {jours/nombre} | {s3://path} |
| {volumes} | {frequence} | {jours/nombre} | {s3://path} |

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Planning de sauvegarde verifie et actif
2. [ ] Procedure de restauration testee avec succes
3. [ ] Notifications d'alerte verifiees
4. [ ] Plan DR partage avec l'equipe
5. [ ] Prochain test de restauration planifie : {date}
```
