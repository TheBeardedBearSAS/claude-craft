# Sécurité

## Vue d'ensemble

La sécurité est une **priorité absolue**. Ce document présente les principes généraux de sécurité applicables à tout projet.

> **Note:** Consultez les règles spécifiques à votre technologie pour les implémentations concrètes.

**Références:**
- **OWASP Top 10:2025** (publié novembre 2025)
- CWE/SANS Top 25
- SLSA 1.0

---

## Table des matières

1. [OWASP Top 10:2025](#owasp-top-102025)
2. [Validation des entrées](#validation-des-entrées)
3. [Authentification](#authentification)
4. [Autorisation](#autorisation)
5. [Données sensibles](#données-sensibles)
6. [Headers de sécurité](#headers-de-sécurité)
7. [Supply Chain](#supply-chain)
8. [Logging et monitoring](#logging-et-monitoring)
9. [Sécurité MCP & Plugins](#sécurité-mcp--plugins)
10. [Checklist](#checklist)

---

## OWASP Top 10:2025

> **Source:** [OWASP Top 10:2025](https://owasp.org/Top10/2025/) — publié novembre 2025.
> Changements majeurs vs 2021 : SSRF consolidé dans #1, Supply Chain Failures nouveau en #6, Mishandling Exceptional Conditions nouveau en #7.

### 1. Broken Access Control (inclut SSRF consolidé)

```
❌ RISQUE
- Accès à des ressources sans vérification
- URLs prédictibles (/admin, /user/123/edit)
- Manipulation d'IDs dans les URLs
- SSRF : URLs fournies par l'utilisateur non validées, accès à des ressources internes

✅ PROTECTION
- Vérifier les permissions à CHAQUE requête
- Utiliser des identifiants non prédictibles (UUID)
- Deny by default
- SSRF : Whitelist des destinations autorisées, validation stricte des URLs
- Pas d'accès réseau interne depuis les inputs utilisateur
```

### 2. Cryptographic Failures

```
❌ RISQUE
- Données sensibles en clair
- Algorithmes obsolètes (MD5, SHA1, bcrypt en nouveau code)
- Clés dans le code source
- JWT avec algorithme faible (HS256, RS256)

✅ PROTECTION
- Chiffrer les données sensibles au repos
- Utiliser TLS 1.3 en transit
- Hachage mots de passe : Argon2id (128 MiB RAM, t=3-5, p=1) — JAMAIS MD5/SHA1/bcrypt
- JWT : EdDSA (Ed25519) prioritaire > ES256 > RS256
- Secrets dans un vault (pas dans le code)
```

### 3. Injection

```
❌ RISQUE
- SQL Injection
- Command Injection
- LDAP Injection

✅ PROTECTION
- Requêtes paramétrées (prepared statements)
- Validation et sanitization des entrées
- Principe du moindre privilège (DB)
- Escape des outputs
```

### 4. Insecure Design

```
❌ RISQUE
- Pas de threat modeling
- Fonctionnalités sensibles non protégées
- Rate limiting absent

✅ PROTECTION
- Threat modeling dès la conception
- Security by design
- Defense in depth
- Rate limiting
```

### 5. Security Misconfiguration

```
❌ RISQUE
- Configs par défaut non modifiées
- Fonctionnalités inutiles activées
- Messages d'erreur verbeux
- Permissions trop larges

✅ PROTECTION
- Hardening des configurations
- Désactiver le non nécessaire
- Messages d'erreur génériques en prod
- Principe du moindre privilège
```

### 6. Software Supply Chain Failures (nouveau 2025)

```
❌ RISQUE
- Dépendances avec vulnérabilités connues
- Composants sans provenance vérifiable
- CI/CD non sécurisé
- Artefacts non signés

✅ PROTECTION
- SLSA 1.0 niveaux 1-3 (sources vérifiables, builds reproductibles, provenance)
- SBOM automatique (SPDX 3 ou CycloneDX) à chaque build
- Sigstore keyless signing (cosign) pour artefacts et images
- Dependabot / Renovate avec scan CVE (Trivy, Grype)
- Version pinée sur toutes les dépendances (pas de "latest")
```

### 7. Mishandling of Exceptional Conditions (nouveau 2025)

```
❌ RISQUE
- Stack traces exposées en production
- Exceptions non gérées qui leakent des données internes
- Comportement undefined sur inputs mal formés

✅ PROTECTION
- Logger les erreurs, ne jamais exposer la stack trace en prod
- Gestionnaires d'exceptions globaux (error boundaries)
- Messages d'erreur génériques côté client
- Fail fast avec des erreurs métier claires
```

### 8. Authentication Failures

```
❌ RISQUE
- Mots de passe faibles autorisés
- Pas de MFA
- Sessions qui n'expirent pas
- Credential stuffing possible

✅ PROTECTION
- Politique de mots de passe forts (min 12 caractères)
- MFA pour accès sensibles
- Expiration des sessions
- Rate limiting sur login
- Détection de brute force
```

### 9. Logging & Monitoring Failures

```
❌ RISQUE
- Pas de logs des événements sécurité
- Logs non protégés
- Pas d'alerting

✅ PROTECTION
- Logger les événements de sécurité
- Protéger les logs (accès restreint)
- Alerting sur anomalies
- Retention appropriée
```

### 10. Data Integrity Failures

```
❌ RISQUE
- Dépendances non vérifiées
- CI/CD non sécurisé
- Updates non signés

✅ PROTECTION
- Vérification des signatures
- CI/CD sécurisé
- Integrity checks (checksums)
```

---

## Validation des entrées

### Règle d'or

> **Ne jamais faire confiance aux données utilisateur.**
> Valider côté serveur, TOUJOURS.

### Types de validation

| Type | Description | Exemple |
|------|-------------|---------|
| **Whitelist** | Accepter uniquement ce qui est attendu | `status in ["pending", "done"]` |
| **Type checking** | Vérifier le type | `typeof id === "number"` |
| **Format** | Vérifier le format | `email.matches(EMAIL_REGEX)` |
| **Range** | Vérifier les bornes | `1 <= page <= 100` |
| **Length** | Vérifier la longueur | `name.length <= 255` |

### Exemples

```
// ❌ MAUVAIS - Pas de validation
function getUser(id):
  return db.query("SELECT * FROM users WHERE id = " + id)

// ✅ BON - Validation + requête paramétrée
function getUser(id):
  if not isValidUUID(id):
    throw InvalidInput("Invalid user ID")

  return db.query(
    "SELECT * FROM users WHERE id = ?",
    [id]
  )
```

### Sanitization vs Validation

```
Validation: Rejeter les données invalides
  → "abc" comme ID numérique → ERREUR

Sanitization: Nettoyer les données
  → "<script>" dans un nom → "script"

Préférer VALIDATION (rejeter) à SANITIZATION (transformer)
```

---

## Authentification

### Mots de passe

```
Règles OWASP 2026:
- Minimum 12 caractères
- Majuscules, minuscules, chiffres, spéciaux
- Pas dans les listes de mots de passe compromis
- Hash avec Argon2id (128 MiB RAM, t=3-5, p=1)
- JAMAIS MD5/SHA1/bcrypt en nouveau code
- Salt unique par utilisateur (géré par Argon2id)

// ✅ BON
hash = argon2id.hash(password, memory=131072, iterations=3, parallelism=1)

// ❌ MAUVAIS
hash = md5(password)
hash = sha1(password + "static_salt")
hash = bcrypt.hash(password, costFactor=12)  // Ne pas utiliser en nouveau code
```

Sources : [Argon2id OWASP 2026](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/)

### Sessions

```
Règles:
- Token aléatoire cryptographiquement sûr
- Stockage côté serveur (pas dans cookies)
- Expiration: 15-30 min d'inactivité
- Renouvellement après login
- Invalidation après logout

Session config:
  cookie:
    httpOnly: true     # Pas accessible en JS
    secure: true       # HTTPS uniquement
    sameSite: strict   # Protection CSRF
```

### JWT (si utilisé)

```
Règles OWASP 2026:
- Algorithme : EdDSA (Ed25519) prioritaire > ES256 > RS256
- JAMAIS HS256 avec secret faible
- Expiration courte (15 min)
- Refresh token long (7 jours) stocké sécurisé
- DPoP (RFC 9449) pour tokens sensibles
- Vérifier signature et claims
- Ne pas stocker de données sensibles dans le payload

// ❌ MAUVAIS
jwt.sign(payload, "secret123", { algorithm: "HS256" })

// ✅ BON
jwt.sign(payload, ed25519PrivateKey, {
  algorithm: "EdDSA",
  expiresIn: "15m"
})
```

Sources : [JWT Best Practices 2026](https://duendesoftware.com/learn/best-practices-using-jwts-with-web-and-mobile-apps), [RFC 9449 DPoP](https://datatracker.ietf.org/doc/html/rfc9449)

### Multi-Factor Authentication (MFA)

```
Quand activer MFA:
- Accès admin
- Opérations sensibles (paiement, suppression)
- Changement de mot de passe
- Connexion depuis nouvel appareil

Méthodes (par niveau de sécurité):
- Hardware keys (FIDO2/WebAuthn) — le plus sûr
- TOTP (Google Authenticator, Authy)
- SMS (moins sécurisé — éviter si possible)
```

---

## Autorisation

### Principe du moindre privilège

```
Règle: Accorder uniquement les permissions NÉCESSAIRES.

❌ MAUVAIS
user.role = "admin"  # Accès à tout

✅ BON
user.permissions = ["read:users", "write:orders"]
```

### RBAC (Role-Based Access Control)

```
Rôles:
- admin: Toutes permissions
- manager: Gestion utilisateurs, lecture rapports
- user: Accès à ses propres données

Vérification:
function deleteUser(userId, currentUser):
  if not currentUser.hasPermission("delete:users"):
    throw Forbidden("Permission denied")

  // ... delete logic
```

### Row-Level Security

```
Règle: Vérifier que l'utilisateur a accès à LA ressource spécifique.

// ❌ MAUVAIS - Vérifie seulement l'authentification
function getOrder(orderId):
  return db.find("orders", orderId)

// ✅ BON - Vérifie l'appartenance
function getOrder(orderId, currentUser):
  order = db.find("orders", orderId)

  if order.userId != currentUser.id:
    throw Forbidden("Not your order")

  return order
```

---

## Données sensibles

### Classification

| Catégorie | Exemples | Protection |
|-----------|----------|------------|
| **Public** | Nom produit | Aucune |
| **Interne** | Emails | Accès restreint |
| **Confidentiel** | Données client | Chiffrement |
| **Secret** | Mots de passe, clés | Vault, hash Argon2id |

### Stockage

```
Mots de passe:
  → Hash avec Argon2id (128 MiB RAM, t=3-5, p=1)
  → JAMAIS en clair
  → JAMAIS bcrypt/MD5/SHA1 en nouveau code

Données personnelles (RGPD):
  → Chiffrement au repos (AES-256-GCM)
  → Pseudonymisation si possible
  → Retention limitée

Secrets (API keys, etc.):
  → Variables d'environnement
  → Vault (HashiCorp, AWS Secrets Manager)
  → JAMAIS dans le code source
```

### Transmission

```
Règles:
- HTTPS obligatoire (TLS 1.3)
- Certificats valides
- HSTS activé
- Pas de données sensibles dans URLs

// ❌ MAUVAIS
GET /api/users?password=secret123

// ✅ BON
POST /api/auth
Body: { "password": "..." }
```

---

## Headers de sécurité

### Headers obligatoires 2026

```http
# Protection XSS + CSP Level 3
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'
X-Content-Type-Options: nosniff

# Protection clickjacking
X-Frame-Options: DENY

# HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# Referrer
Referrer-Policy: strict-origin-when-cross-origin

# Permissions granulaires
Permissions-Policy: geolocation=(), camera=(), microphone=()

# Cross-Origin Isolation (2026 — obligatoires)
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

Source : [HTTP Security Headers 2026](https://thibautprobst.fr/en/posts/http-security-headers/)

### Content-Security-Policy (CSP) Level 3

```http
# Restrictif (recommandé)
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self' api.example.com;
  frame-ancestors 'none';
  upgrade-insecure-requests;
```

### Cross-Origin Headers (nouveaux en 2026)

| Header | Valeur recommandée | Protection |
|--------|-------------------|------------|
| **COOP** | `same-origin` | Isole le contexte de navigation (Spectre) |
| **COEP** | `require-corp` | Active Cross-Origin Isolation |
| **CORP** | `same-origin` | Protège les ressources contre les inclusions cross-origin |
| **Permissions-Policy** | Granulaire par feature | Contrôle l'accès aux APIs du navigateur |

---

## Supply Chain

> **Référence :** [Supply Chain Security 2026](https://kawaldeepsingh.medium.com/practical-software-supply-chain-security-2026-sboms-signing-slsa-reproducible-builds-a-0416cfac32dc)

### SLSA 1.0 (Supply-chain Levels for Software Artifacts)

| Niveau | Exigences | Impact |
|--------|-----------|--------|
| **Niveau 1** | Provenance documentée du build | Traçabilité basique |
| **Niveau 2** | Build sur plateforme vérifiable, signé | Résistance aux compromissions internes |
| **Niveau 3** | Build reproductible, infrastructure durcie | Résistance aux compromissions de la plateforme |

### SBOM (Software Bill of Materials)

```
Générer automatiquement à chaque build :
- Format SPDX 3 ou CycloneDX
- Liste toutes les dépendances directes et transitives
- Inclure les versions, licences, CVE connus
- Publier dans le registre artefact

Outils : syft, cdxgen, trivy --format cyclonedx
```

### Sigstore / cosign

```
Signer les artefacts et images Docker :
cosign sign --key cosign.key ghcr.io/org/image:tag
cosign verify --key cosign.pub ghcr.io/org/image:tag

Keyless signing (recommandé en CI/CD) :
cosign sign --identity-token=$(cat $ACTIONS_ID_TOKEN_REQUEST_TOKEN) \
  ghcr.io/org/image:tag
```

### Checklist Supply Chain

- [ ] SBOM généré automatiquement (SPDX 3 ou CycloneDX)
- [ ] Artefacts signés avec Sigstore/cosign
- [ ] Provenance SLSA 1+ documentée
- [ ] Dépendances avec versions pinées (hash ou version exacte)
- [ ] Scan CVE automatisé (Trivy, Grype) sur chaque build
- [ ] Dependabot / Renovate configuré
- [ ] Revue des dépendances avant merge

---

## Logging et monitoring

### Événements à logger

```
✅ À LOGGER:
- Tentatives de connexion (succès/échec)
- Changements de permissions
- Accès à données sensibles
- Erreurs d'autorisation
- Modifications de configuration
- Exports de données

❌ À NE PAS LOGGER:
- Mots de passe
- Tokens
- Données personnelles complètes
- Numéros de carte bancaire
- Stack traces complètes en prod
```

### Format de log

```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "WARN",
  "event": "login_failed",
  "user_id": "user_123",
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "details": {
    "reason": "invalid_password",
    "attempts": 3
  }
}
```

### Alerting

```
Alertes critiques:
- 5+ échecs de login sur même compte
- Accès admin depuis nouvelle IP
- Modification de permissions
- Erreurs 500 en série
- Volume anormal de requêtes
```

---

## Sécurité MCP & Plugins

### Risques des serveurs MCP tiers

> **Alerte:** Des recherches de sécurité (Snyk, 2026) ont identifié 76 payloads malicieux dans les registres publics de serveurs MCP. Les serveurs MCP tiers non vérifiés représentent un risque significatif.

```
RISQUES:
- Injection de commandes via les paramètres MCP
- Exfiltration de données (fichiers, secrets, contexte)
- Exécution de code arbitraire sur la machine hôte
- Escalade de privilèges via les outils exposés

PROTECTION:
- Préférer écrire ses propres serveurs MCP
- Auditer le code source avant d'installer un serveur tiers
- Limiter les permissions (tools allowlist)
- Utiliser le hook PreToolUse pour bloquer les patterns dangereux
```

### Checklist de vetting MCP/Plugin

Avant d'installer un serveur MCP tiers:

- [ ] Code source disponible et auditable
- [ ] Auteur/organisation vérifiée
- [ ] Pas d'accès réseau non justifié
- [ ] Pas de lecture de fichiers sensibles (.env, secrets)
- [ ] Permissions minimales (principe du moindre privilège)
- [ ] Version pinée (pas de `latest`)
- [ ] Changelog et historique de sécurité

### Hook PreToolUse pour la sécurité

Utiliser les hooks Claude Code pour bloquer les patterns dangereux.

> **Bonne pratique :** Les hooks reçoivent l'input de l'outil en JSON sur **stdin** — toujours utiliser `jq -r '.tool_input.<champ>'` (pas `echo '$TOOL_INPUT'`) pour lire les valeurs de façon sûre et éviter l'injection shell.
> **Important :** Utiliser `exit 2` (pas `exit 1`) pour bloquer réellement l'appel à l'outil dans Claude Code. `exit 1` ne fait que signaler une erreur mais **ne bloque pas** l'exécution.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(jq -r '.tool_input.command // empty'); printf '%s' \"$INPUT\" | grep -qE '(curl|wget).*\\.(sh|py|rb)' && echo 'BLOCKED: suspicious download' >&2 && exit 2 || exit 0"
          }
        ]
      }
    ]
  }
}
```

### CLAUDE.md vs Hooks

| Mécanisme | Force | Usage |
|-----------|-------|-------|
| **CLAUDE.md** | Suggestion | Guidelines, conventions |
| **Rules** | Suggestion forte | Règles détaillées |
| **Hooks** | Enforcement | Blocage effectif, validation automatique |

> **Règle:** CLAUDE.md = suggestions. Hooks = requirements.
> Pour les contraintes de sécurité critiques, utiliser des hooks, pas des instructions textuelles.

---

## Checklist

### Développement

- [ ] Validation des entrées côté serveur
- [ ] Requêtes paramétrées (pas de concaténation SQL)
- [ ] Escape des outputs (prévention XSS)
- [ ] Mots de passe hashés avec **Argon2id** (128 MiB, t=3-5, p=1)
- [ ] Sessions sécurisées (httpOnly, secure, sameSite)
- [ ] Vérification des permissions à chaque requête
- [ ] Secrets dans variables d'environnement ou Vault
- [ ] Dépendances auditées (scan CVE)
- [ ] JWT avec EdDSA ou ES256 (jamais HS256)
- [ ] DPoP (RFC 9449) pour tokens sensibles

### Configuration

- [ ] HTTPS activé (TLS 1.3)
- [ ] Headers de sécurité 2026 (CSP L3, HSTS, COOP, COEP, CORP, Permissions-Policy)
- [ ] Messages d'erreur génériques en prod
- [ ] Debug mode désactivé en prod
- [ ] Rate limiting activé
- [ ] CORS configuré strictement

### Supply Chain

- [ ] SBOM généré (SPDX 3 ou CycloneDX)
- [ ] Artefacts signés (Sigstore/cosign)
- [ ] Provenance SLSA 1+ documentée
- [ ] Dépendances pinées sur version exacte

### Monitoring

- [ ] Logging des événements de sécurité
- [ ] Alerting sur anomalies
- [ ] Audit régulier des accès
- [ ] Scan de vulnérabilités périodique

### Compliance (si applicable)

- [ ] RGPD: Consentement, droit à l'oubli
- [ ] PCI-DSS: Données de paiement
- [ ] HIPAA: Données de santé
- [ ] SOC2: Contrôles de sécurité

---

## Ressources

- **OWASP Top 10:2025:** [owasp.org/Top10/2025/](https://owasp.org/Top10/2025/)
- **OWASP Cheat Sheets:** [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/)
- **CWE Top 25:** [cwe.mitre.org/top25](https://cwe.mitre.org/top25/)
- **NIST Guidelines:** [nist.gov](https://www.nist.gov/cyberframework)
- **Argon2id 2026:** [Guide complet](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/)
- **RFC 9449 DPoP:** [datatracker.ietf.org](https://datatracker.ietf.org/doc/html/rfc9449)
- **JWT Best Practices 2026:** [duendesoftware.com](https://duendesoftware.com/learn/best-practices-using-jwts-with-web-and-mobile-apps)
- **HTTP Security Headers 2026:** [thibautprobst.fr](https://thibautprobst.fr/en/posts/http-security-headers/)
- **Supply Chain 2026:** [kawaldeepsingh.medium.com](https://kawaldeepsingh.medium.com/practical-software-supply-chain-security-2026-sboms-signing-slsa-reproducible-builds-a-0416cfac32dc)

---

**Date de dernière mise à jour:** 2026-06
**Version:** 1.2.0
**Auteur:** The Bearded CTO
