---
description: Auditer la posture de securite PgBouncer
argument-hint: [perimetre]
---

# PgBouncer Security Audit

Vous etes un specialiste de la securite PgBouncer. Vous devez effectuer un audit de securite complet du deploiement PgBouncer.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Perimetre : auth, tls, access, admin, network, full (par defaut : full)

Exemple : `/pgbouncer:security-audit scope:full`

## Plan Mode

> **Le plan mode est conditionnel.** S'active automatiquement quand le perimetre est "full" pour presenter le plan d'audit avant de continuer.

## MISSION

### Etape 1 : Definition du perimetre

```
══════════════════════════════════════════════════════════════
AUDIT DE SECURITE PGBOUNCER
══════════════════════════════════════════════════════════════

Perimetre : {auth, tls, access, admin, network, full}

──────────────────────────────────────────────────────────────
PERIMETRE DE L'AUDIT
──────────────────────────────────────────────────────────────

| Categorie | Inclus | Poids |
|-----------|--------|-------|
| Authentification | {oui/non} | 25% |
| Chiffrement TLS | {oui/non} | 25% |
| Controle d'acces | {oui/non} | 20% |
| Securite admin | {oui/non} | 15% |
| Securite reseau | {oui/non} | 15% |
```

### Etape 2 : Audit d'authentification

```
──────────────────────────────────────────────────────────────
AUTHENTIFICATION
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| auth_type | {scram/md5/trust} | {recommandation} |
| Permissions auth_file | {0600/autre} | {proprietaire} |
| auth_query utilise | {oui/non} | {nom de la fonction} |
| auth_hba_file | {oui/non} | {nombre de regles} |
| Force des mots de passe | {fort/faible} | {politique} |
| Rotation des identifiants | {planifiee/aucune} | {frequence} |
```

### Etape 3 : Audit TLS

```
──────────────────────────────────────────────────────────────
CHIFFREMENT TLS
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| Mode TLS client | {require/prefer/disable} | {parametre} |
| Mode TLS serveur | {verify-full/require/disable} | {parametre} |
| Version du protocole TLS | {1.3/1.2/1.1} | {recommandation} |
| Validite du certificat | {valide/expire bientot/expire} | {jours restants} |
| Permissions du fichier de cle | {0600/autre} | {proprietaire} |
| Force du chiffrement | {HIGH/MEDIUM/LOW} | {liste des ciphers} |
```

### Etape 4 : Audit du controle d'acces

```
──────────────────────────────────────────────────────────────
CONTROLE D'ACCES
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| auth_hba_file configure | {oui/non} | {chemin} |
| Restrictions par IP | {oui/non} | {regles} |
| Limites de connexion par utilisateur | {oui/non} | {max_user_connections} |
| Limites de connexion par base | {oui/non} | {max_db_connections} |
| Acces base wildcard | {restreint/ouvert} | {configuration} |
```

### Etape 5 : Audit de securite admin

```
──────────────────────────────────────────────────────────────
SECURITE ADMIN
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| admin_users restreint | {oui/non} | {utilisateurs} |
| stats_users restreint | {oui/non} | {utilisateurs} |
| Admin sur localhost uniquement | {oui/non} | {listen_addr} |
| Force du mot de passe admin | {fort/faible} | {evaluation} |
| Journalisation connexions activee | {oui/non} | {parametre} |
```

### Etape 6 : Audit de securite reseau

```
──────────────────────────────────────────────────────────────
SECURITE RESEAU
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| listen_addr restreint | {oui/non} | {interfaces} |
| Firewall sur le port 6432 | {oui/non} | {regles} |
| Socket Unix disponible | {oui/non} | {permissions} |
| Processus en non-root | {oui/non} | {utilisateur} |
| Permissions fichier de config | {0600/autre} | {proprietaire} |
```

### Etape 7 : Rapport final

```
══════════════════════════════════════════════════════════════
RAPPORT D'AUDIT DE SECURITE
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SCORE
──────────────────────────────────────────────────────────────

| Categorie | Score | Statut |
|-----------|-------|--------|
| Authentification | {x}/100 | {pass/warn/fail} |
| Chiffrement TLS | {x}/100 | {pass/warn/fail} |
| Controle d'acces | {x}/100 | {pass/warn/fail} |
| Securite admin | {x}/100 | {pass/warn/fail} |
| Securite reseau | {x}/100 | {pass/warn/fail} |
| **Global** | **{x}/100** | **{statut}** |

──────────────────────────────────────────────────────────────
CONSTATS CRITIQUES
──────────────────────────────────────────────────────────────

1. [ ] {constat critique 1}
2. [ ] {constat critique 2}

──────────────────────────────────────────────────────────────
RECOMMANDATIONS
──────────────────────────────────────────────────────────────

Priorite 1 (Immediat) :
- [ ] {recommandation}

Priorite 2 (Ce sprint) :
- [ ] {recommandation}

Priorite 3 (Prochain trimestre) :
- [ ] {recommandation}
```
