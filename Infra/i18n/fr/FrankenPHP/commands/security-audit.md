---
description: Auditer la posture de securite FrankenPHP
argument-hint: [perimetre]
---

# FrankenPHP Security Audit

Vous etes un specialiste de la securite FrankenPHP. Vous devez effectuer un audit de securite complet du deploiement FrankenPHP.

## Arguments
$ARGUMENTS

Arguments :
- (Optionnel) Perimetre : tls, headers, caddyfile, container, php, admin, full (par defaut : full)

Exemple : `/frankenphp:security-audit scope:full`

## Plan Mode

> **Le plan mode est conditionnel.** S'active automatiquement quand le perimetre est "full" pour presenter le plan d'audit avant de continuer.

## MISSION

### Etape 1 : Definition du perimetre

```
══════════════════════════════════════════════════════════════
AUDIT DE SECURITE FRANKENPHP
══════════════════════════════════════════════════════════════

Perimetre : {tls, headers, caddyfile, container, php, admin, full}

──────────────────────────────────────────────────────────────
PERIMETRE DE L'AUDIT
──────────────────────────────────────────────────────────────

| Categorie | Inclus | Poids |
|-----------|--------|-------|
| Configuration TLS | {oui/non} | 25% |
| Headers de securite | {oui/non} | 20% |
| Durcissement Caddyfile | {oui/non} | 20% |
| Securite conteneur | {oui/non} | 15% |
| Durcissement PHP | {oui/non} | 10% |
| API admin | {oui/non} | 10% |
```

### Etape 2 : Audit TLS

```
──────────────────────────────────────────────────────────────
CONFIGURATION TLS
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| Auto-HTTPS active | {oui/non/proxy} | {configuration} |
| Version du protocole TLS | {1.3/1.2} | {recommandation} |
| Header HSTS | {defini/manquant} | {max-age, preload} |
| Validite du certificat | {valide/expire bientot/expire} | {jours restants} |
| HTTP/3 active | {oui/non} | {statut UDP 443} |
| Support ECH | {oui/non} | {fonctionnalite v1.6+} |
| Support PQC | {oui/non} | {fonctionnalite v1.6+} |
```

### Etape 3 : Audit des headers de securite

```
──────────────────────────────────────────────────────────────
HEADERS DE SECURITE
──────────────────────────────────────────────────────────────

| Header | Statut | Valeur |
|--------|--------|--------|
| Strict-Transport-Security | {defini/manquant} | {valeur} |
| X-Content-Type-Options | {defini/manquant} | {valeur} |
| X-Frame-Options | {defini/manquant} | {valeur} |
| Content-Security-Policy | {defini/manquant} | {valeur} |
| Referrer-Policy | {defini/manquant} | {valeur} |
| Permissions-Policy | {defini/manquant} | {valeur} |
| Header Server supprime | {oui/non} | {valeur} |
```

### Etape 4 : Audit du Caddyfile

```
──────────────────────────────────────────────────────────────
DURCISSEMENT DU CADDYFILE
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| Rate limiting configure | {oui/non} | {limites} |
| Filtrage IP (si necessaire) | {oui/non} | {regles} |
| Endpoints de debug desactives | {oui/non} | {chemins} |
| Pages d'erreur personnalisees | {oui/non} | {pas de fuite d'info} |
| Secrets via variables d'env | {oui/non} | {pas de valeurs en dur} |
```

### Etape 5 : Audit conteneur

```
──────────────────────────────────────────────────────────────
SECURITE CONTENEUR
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| Utilisateur non-root | {oui/non} | {utilisateur} |
| Capabilities minimales | {oui/non} | {capabilities} |
| Filesystem en lecture seule | {oui/non} | {chemins modifiables} |
| Pas de secrets dans les couches | {oui/non} | {evaluation} |
| Scan de vulnerabilites de l'image | {pass/fail} | {nombre de CVE} |
```

### Etape 6 : Audit PHP

```
──────────────────────────────────────────────────────────────
SECURITE PHP
──────────────────────────────────────────────────────────────

| Verification | Statut | Details |
|--------------|--------|---------|
| disable_functions | {defini/vide} | {fonctions} |
| open_basedir | {defini/vide} | {chemins} |
| expose_php | {off/on} | {recommandation} |
| Cookies de session securises | {oui/non} | {httpOnly, secure, sameSite} |
| allow_url_include | {off/on} | {recommandation} |
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
| Configuration TLS | {x}/100 | {pass/warn/fail} |
| Headers de securite | {x}/100 | {pass/warn/fail} |
| Durcissement Caddyfile | {x}/100 | {pass/warn/fail} |
| Securite conteneur | {x}/100 | {pass/warn/fail} |
| Durcissement PHP | {x}/100 | {pass/warn/fail} |
| API admin | {x}/100 | {pass/warn/fail} |
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
