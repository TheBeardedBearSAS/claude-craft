---
description: Diagnostiquer les problemes de pool de connexions PgBouncer a partir des symptomes
argument-hint: <Symptome> [ressource]
---

# PgBouncer Debug

Vous etes un specialiste du troubleshooting PgBouncer. Vous devez diagnostiquer et resoudre systematiquement les problemes de pool de connexions a partir des symptomes donnes.

## Arguments
$ARGUMENTS

Arguments :
- Description du symptome (ex : "clients waiting", "authentication failed", "prepared statement error")
- (Optionnel) Nom de la base de donnees
- (Optionnel) Pool mode

Exemple : `/pgbouncer:debug "clients waiting for connections, cl_waiting=50"`

## Plan Mode

> **Le plan mode n'est pas requis.** Il s'agit d'une commande de diagnostic qui procede immediatement a l'investigation.

## MISSION

### Etape 1 : Rassembler les informations

```
══════════════════════════════════════════════════════════════
PGBOUNCER DEBUG
══════════════════════════════════════════════════════════════

Symptome : {description}
Base de donnees : {database}
Pool mode : {transaction/session}

──────────────────────────────────────────────────────────────
ETAT DU POOL
──────────────────────────────────────────────────────────────
```

Executer les commandes de diagnostic via la console admin PgBouncer :
```sql
SHOW POOLS;
SHOW CLIENTS;
SHOW SERVERS;
SHOW STATS;
SHOW CONFIG;
SHOW DATABASES;
```

### Etape 2 : Analyse de la cause racine

```
──────────────────────────────────────────────────────────────
DIAGNOSTIC
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| PgBouncer en execution | {oui/non} | {pid, uptime} |
| Utilisation du pool | {x}% | {sv_active/pool_size} |
| Clients en attente | {nombre} | {temps d'attente max} |
| Statut auth | {ok/en echec} | {methode} |
| Connectivite serveur | {ok/en echec} | {PG joignable} |
| Compat transaction mode | {ok/problemes} | {prepared stmts, SET} |

──────────────────────────────────────────────────────────────
ARBRE DE DECISION
──────────────────────────────────────────────────────────────

Symptome : {symptome}
  ├── Epuisement du pool ? (cl_waiting > 0)
  │   ├── Toutes les connexions serveur occupees → Augmenter pool_size ou optimiser les requetes
  │   ├── Connexions serveur bloquees → Verifier la charge PostgreSQL
  │   └── Trop de pools → Consolider les bases de donnees
  ├── Echec d'authentification ?
  │   ├── Mismatch SCRAM → Faire correspondre auth_type avec PG
  │   ├── Mauvais identifiants → Mettre a jour userlist.txt
  │   └── Erreur auth_query → Verifier la fonction de lookup
  ├── Erreur transaction mode ?
  │   ├── Prepared statement → DISCARD ALL ou desactiver dans l'ORM
  │   ├── SET/variables de session → Utiliser server_reset_query
  │   └── LISTEN/NOTIFY → Passer en session mode
  └── Connectivite serveur ?
      ├── max_connections PG atteint → Reduire pool_size
      ├── Probleme reseau/DNS → Verifier la connectivite
      └── Echec TLS → Verifier les certificats

Cause racine : {explication}
```

### Etape 3 : Resolution

```
──────────────────────────────────────────────────────────────
CORRECTIF
──────────────────────────────────────────────────────────────
```

Fournir :
1. **Correctif immediat** -- Commandes admin PgBouncer ou changements de config pour resoudre maintenant
2. **Explication** -- Pourquoi cela s'est produit, comportement specifique a PgBouncer
3. **Prevention** -- Ajustement de configuration, alertes de monitoring

### Etape 4 : Verification

```sql
-- Verifier la sante du pool
SHOW POOLS;
-- cl_waiting devrait etre 0

-- Verifier la connectivite
SHOW SERVERS;
-- sv_active devrait etre < pool_size

-- Verifier les statistiques
SHOW STATS;
-- avg_wait_time devrait etre < 100ms
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
- [ ] Documenter le correctif pour reference @pgbouncer-debug
```
