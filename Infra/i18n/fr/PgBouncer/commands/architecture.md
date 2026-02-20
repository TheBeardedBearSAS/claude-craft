---
description: Concevoir une architecture complete de connection pooling PgBouncer
argument-hint: <Projet> [contraintes]
---

# PgBouncer Architecture

Vous etes un architecte PgBouncer senior. Vous devez concevoir une architecture complete de connection pooling a partir des specifications du projet.

## Arguments
$ARGUMENTS

Arguments :
- Description du projet
- Charge de travail cible (ex : web-application, microservices, multi-tenant)
- Contraintes (ex : pool-mode, max-connections, ha-required)

Exemple : `/pgbouncer:architecture "Plateforme e-commerce" workload:web-application pg-max-conn:100`

## Plan Mode

> **Le plan mode est recommande.** Claude active le plan mode pour structurer l'approche, selectionner le pool mode et presenter une topologie avant de generer le pgbouncer.ini.

## MISSION

### Etape 1 : Decouverte

```
══════════════════════════════════════════════════════════════
ARCHITECTURE PGBOUNCER
══════════════════════════════════════════════════════════════

Projet : {nom}
Description : {description}

──────────────────────────────────────────────────────────────
ANALYSE DES EXIGENCES
──────────────────────────────────────────────────────────────

### Stack applicatif
| Composant | Technologie | Connexions |
|-----------|-------------|------------|
| Serveur applicatif | {framework} | {conn par instance} |
| Instances | {nombre} | {total connexions} |
| Fonctionnalites ORM | {prepared stmts, temp tables} | {compatibilite} |

### Configuration PostgreSQL
| Attribut | Valeur |
|----------|--------|
| max_connections | {valeur} |
| Bases de donnees | {nombre} |
| Replication | {primary-only / primary+replica} |
| Methode d'auth | {scram-sha-256 / md5} |
```

### Etape 2 : Decision du pool mode

```
──────────────────────────────────────────────────────────────
SELECTION DU POOL MODE
──────────────────────────────────────────────────────────────

L'application utilise des prepared statements ? {oui/non}
L'application utilise SET/variables de session ? {oui/non}
L'application utilise LISTEN/NOTIFY ? {oui/non}
L'application utilise des temp tables entre requetes ? {oui/non}

Decision : mode {transaction / session}
Justification : {explication}

server_reset_query : {DISCARD ALL / vide}
```

### Etape 3 : Conception de la topologie

```
──────────────────────────────────────────────────────────────
TOPOLOGIE DU POOL
──────────────────────────────────────────────────────────────

[Diagramme ASCII : Instances App -> PgBouncer -> PostgreSQL]

──────────────────────────────────────────────────────────────
CALCUL DU DIMENSIONNEMENT
──────────────────────────────────────────────────────────────

| Parametre | Valeur | Formule |
|-----------|--------|---------|
| max_client_conn | {valeur} | {instances x conn + 20% marge} |
| default_pool_size | {valeur} | {PG max_conn / pools x 0.8} |
| min_pool_size | {valeur} | {50% du default} |
| reserve_pool_size | {valeur} | {25% du default} |
| reserve_pool_timeout | {valeur} | {secondes} |
```

### Etape 4 : Generer le pgbouncer.ini

Generer le fichier de configuration `pgbouncer.ini` complet avec :
- Section [databases] avec toutes les entrees de bases de donnees
- Section [pgbouncer] avec tous les parametres de pool
- Configuration d'authentification (auth_type, auth_file ou auth_query)
- Parametres de timeout (server_lifetime, server_idle_timeout, query_wait_timeout)
- Configuration de journalisation
- Utilisateurs admin et stats

### Etape 5 : Generer le userlist.txt

Generer le fichier d'authentification ou la fonction SQL auth_query.

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
| Pool mode | {transaction/session} |
| max_client_conn | {valeur} |
| default_pool_size | {valeur} |
| Bases de donnees | {nombre} |
| HA | {oui/non} |

──────────────────────────────────────────────────────────────
PROCHAINES ETAPES
──────────────────────────────────────────────────────────────

1. [ ] Verifier le dimensionnement du pool par rapport au trafic reel
2. [ ] Deployer avec /pgbouncer:deploy-setup
3. [ ] Auditer la securite avec /pgbouncer:security-audit
4. [ ] Configurer le monitoring avec @pgbouncer-monitoring
5. [ ] Effectuer un test de charge pour valider le dimensionnement du pool
```
