---
description: Audit Sécurité PHP
argument-hint: [arguments]
---

# Audit Sécurité PHP

## Arguments

$ARGUMENTS (optionnel : chemin du projet PHP à auditer, répertoire courant par défaut)

## Mode Plan

> Le mode plan est activé automatiquement lorsque le périmètre couvre plusieurs modules ou nécessite une investigation transversale.

## MISSION

Audit de sécurité d'un projet PHP natif basé sur **OWASP Top 10:2025** (incluant Software Supply Chain Failures et Mishandling of Exceptional Conditions), CWE/SANS Top 25, et SLSA 1.0. Produire un rapport avec un score sur 25 et un plan de remédiation priorisé.

**Règles de référence** : `.claude/rules/php-security.md`

### Étape 1 : Scan des Dépendances (4 pts)

```bash
docker compose exec app composer audit
docker compose exec app composer outdated --direct
```

Optionnel (SBOM + CVE) :

```bash
docker compose exec app trivy fs --scanners vuln,secret,config .
```

Vérifier :
- [ ] `composer audit` rapporte 0 vulnérabilité critique / élevée
- [ ] Toutes les dépendances directes pinées en versions exactes ou caret (pas de `*`)
- [ ] Aucun package abandonné
- [ ] SBOM généré (SPDX 3 ou CycloneDX) et versionné en CI
- [ ] Signature Sigstore / cosign configurée pour les artefacts de release (SLSA 1.0)

### Étape 2 : Injections — SQL, Command, LDAP, Header (5 pts)

Rechercher les patterns dangereux :

```bash
docker compose exec app grep -rn "PDO.*->query\|mysqli_query\|->prepare.*\$_" src/
docker compose exec app grep -rn "shell_exec\|passthru\|system\|exec\|popen" src/
```

Vérifier :
- [ ] 100 % des requêtes paramétrées — **aucune concaténation de chaîne en SQL**
- [ ] Exécution de commandes évitée ; si nécessaire, `escapeshellarg()` + whitelist
- [ ] Injection d'en-têtes HTTP évitée (pas de CR/LF brut dans `header()`)
- [ ] Filtres LDAP échappés via `ldap_escape()`
- [ ] Parsers XML désactivent les entités externes (`libxml_disable_entity_loader(true)` / `LIBXML_NONET`)

### Étape 3 : Authentification & Autorisation (4 pts)

- [ ] Mots de passe hashés avec **Argon2id** (OWASP 2026 : 128 MiB RAM, t=3-5, p=1)
- [ ] `password_hash($p, PASSWORD_ARGON2ID)` utilisé ; **pas de MD5/SHA1/bcrypt en nouveau code**
- [ ] Longueur minimale de mot de passe ≥ 12 caractères
- [ ] Cookies de session : `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] Expiration de session 15–30 minutes
- [ ] JWT : **EdDSA (Ed25519)** > ES256 > RS256 ; expiration courte (15 min)
- [ ] **DPoP (RFC 9449)** pour les tokens sensibles
- [ ] Permissions vérifiées à chaque requête (deny-by-default, pas uniquement au login)

**Commande de détection** :

```bash
docker compose exec app grep -rn "md5\|sha1\|password_hash.*BCRYPT" src/
```

### Étape 4 : Secrets & Cryptographie (4 pts)

- [ ] Aucun secret dans l'historique git (`gitleaks detect --log-opts='--all'` / `trufflehog`)
- [ ] Secrets chargés depuis des variables d'environnement ou un vault (HashiCorp Vault, AWS Secrets Manager)
- [ ] TLS 1.3 imposé ; TLS 1.2 uniquement si rétrocompatibilité requise
- [ ] Génération aléatoire via `random_bytes()` / `random_int()` — **jamais `rand()`/`mt_rand()` pour la sécurité**
- [ ] Stratégie de rotation des clés documentée
- [ ] Chiffrement au repos pour les champs sensibles (ex. `paragonie/halite` pour AEAD field-level)

### Étape 5 : Validation des Entrées & Encodage des Sorties (3 pts)

- [ ] Toutes les entrées utilisateur validées côté serveur (jamais faire confiance à la validation client)
- [ ] Les Value Objects imposent les invariants dans leurs constructeurs
- [ ] Sorties HTML échappées avec `htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')`
- [ ] Sorties JSON via `json_encode()` avec `JSON_THROW_ON_ERROR`
- [ ] Uploads de fichiers : sniffing MIME, limite de taille, nom aléatoire, hors webroot

### Étape 6 : En-têtes de Sécurité & Configuration (3 pts)

- [ ] `Content-Security-Policy` (Level 3) avec nonces, pas de `unsafe-inline`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY` (ou CSP `frame-ancestors 'none'`)
- [ ] `Strict-Transport-Security` (HSTS, 1 an min, preload si applicable)
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Cross-Origin-Opener-Policy: same-origin` (COOP)
- [ ] `Cross-Origin-Embedder-Policy: require-corp` (COEP)
- [ ] `Cross-Origin-Resource-Policy` (CORP)
- [ ] `Permissions-Policy` granulaire
- [ ] `display_errors=Off`, `expose_php=Off` en production
- [ ] Pages d'erreur génériques — **ne jamais exposer de stack trace en production**

### Étape 7 : Logging & Supply Chain (2 pts)

- [ ] Les logs contiennent : connexions, changements de permissions, accès données sensibles, erreurs d'autorisation
- [ ] Les logs **ne contiennent jamais** : mots de passe, tokens, PII complètes, stack traces en prod
- [ ] Logs structurés (JSON) avec des IDs de corrélation
- [ ] Provenance SLSA 1.0 niveau 1+ sur les builds CI
- [ ] Dependabot / Renovate avec scan CVE (Trivy, Grype)
- [ ] Reproducible builds vérifiés sur les releases

## FORMAT DE SORTIE

```
AUDIT SÉCURITÉ PHP — OWASP TOP 10:2025
=======================================

SCORE : XX/25
SÉVÉRITÉ : [Critique / Élevée / Moyenne / Faible]

SCAN DES DÉPENDANCES (X/4)
  composer audit : N critiques, N élevées
  Packages abandonnés : N
  SBOM présent : oui/non

INJECTIONS (X/5)
  SQL non paramétré : N
  Appels de commande dangereux : N
  Risque XXE : oui/non

AUTH & AUTORISATION (X/4)
  Hashs faibles (MD5/SHA1/bcrypt) : N
  Vérifications de permissions manquantes : N
  Algorithme JWT : [EdDSA/ES256/RS256/none]

SECRETS & CRYPTO (X/4)
  Secrets dans l'historique : N
  Usages de RNG faible : N

ENTRÉES / SORTIES (X/3)
  Validations manquantes : N
  Sorties non échappées : N

EN-TÊTES & CONFIG (X/3)
  CSP / HSTS / COOP manquants : N
  display_errors leaking : oui/non

LOGGING & SUPPLY CHAIN (X/2)
  PII dans les logs : N
  Niveau SLSA : [0/1/2/3]

TOP 3 ACTIONS CRITIQUES :
1. [CRITIQUE] Remplacer les hashs MD5 par Argon2id
   Fichiers : src/Infrastructure/Auth/...:ligne
   Impact : ÉLEVÉ — Effort : MOYEN
2. [...]
3. [...]

QUICK WINS :
- Exécuter `composer audit` en CI (effort nul)
- Ajouter `declare(strict_types=1);` partout (imposé par Rector)
- Activer HSTS en production (1 ligne de config)

ROADMAP DE REMÉDIATION :
Semaine 1  — Patcher tous les CVE CRITIQUES de composer audit
Semaine 2  — Migration Argon2id + rotation d'algorithme JWT
Mois 2     — SBOM + signature Sigstore + SLSA niveau 2
```

## NOTES IMPORTANTES

- **Les problèmes de sécurité sont TOUJOURS prioritaires** — ils passent avant les préoccupations architecturales
- Utiliser Docker pour tous les scans ; **ne jamais** laisser fuir de vrais secrets dans la sortie des scans
- OWASP Top 10:2025 consolide SSRF dans Broken Access Control
- **Mishandling Exceptional Conditions** (nouveau 2025) : une stack trace en production est une vulnérabilité de divulgation
- Supply Chain (nouveau 2025) : signer les artefacts avec Sigstore/cosign, générer un SBOM à chaque build
- Relancer cet audit à chaque bump majeur de dépendance et trimestriellement en régime de croisière
