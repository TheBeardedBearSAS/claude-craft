# Sécurité

## Vue d'ensemble

La sécurité est une **priorité absolue**. Ce document présente les principes généraux de sécurité applicables à tout projet.

> **Note:** Consultez les règles spécifiques à votre technologie pour les implémentations concrètes.

**Références:**
- OWASP Top 10
- CWE/SANS Top 25

---

## Table des matières

1. [OWASP Top 10](#owasp-top-10)
2. [Validation des entrées](#validation-des-entrées)
3. [Authentification](#authentification)
4. [Autorisation](#autorisation)
5. [Données sensibles](#données-sensibles)
6. [Headers de sécurité](#headers-de-sécurité)
7. [Logging et monitoring](#logging-et-monitoring)
8. [Securite MCP & Plugins](#securite-mcp--plugins)
9. [Checklist](#checklist)

---

## OWASP Top 10

### 1. Broken Access Control

```
❌ RISQUE
- Accès à des ressources sans vérification
- URLs prédictibles (/admin, /user/123/edit)
- Manipulation d'IDs dans les URLs

✅ PROTECTION
- Vérifier les permissions à CHAQUE requête
- Utiliser des identifiants non prédictibles (UUID)
- Deny by default
```

### 2. Cryptographic Failures

```
❌ RISQUE
- Données sensibles en clair
- Algorithmes obsolètes (MD5, SHA1)
- Clés dans le code source

✅ PROTECTION
- Chiffrer les données sensibles au repos
- Utiliser TLS 1.3 en transit
- Algorithmes modernes (bcrypt, Argon2, AES-256)
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

### 6. Vulnerable Components

```
❌ RISQUE
- Dépendances avec vulnérabilités connues
- Composants obsolètes
- Pas de suivi des CVE

✅ PROTECTION
- Audit régulier des dépendances
- Mise à jour automatique (Dependabot)
- SBOM (Software Bill of Materials)
```

### 7. Authentication Failures

```
❌ RISQUE
- Mots de passe faibles autorisés
- Pas de MFA
- Sessions qui n'expirent pas
- Credential stuffing possible

✅ PROTECTION
- Politique de mots de passe forts
- MFA pour accès sensibles
- Expiration des sessions
- Rate limiting sur login
- Détection de brute force
```

### 8. Data Integrity Failures

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

### 10. SSRF (Server-Side Request Forgery)

```
❌ RISQUE
- URLs fournies par l'utilisateur non validées
- Accès à des ressources internes

✅ PROTECTION
- Whitelist des destinations autorisées
- Validation stricte des URLs
- Pas d'accès réseau interne depuis les inputs
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
Règles:
- Minimum 12 caractères
- Majuscules, minuscules, chiffres, spéciaux
- Pas dans les listes de mots de passe compromis
- Hash avec bcrypt/Argon2 (JAMAIS MD5/SHA1)
- Salt unique par utilisateur

// ✅ BON
hash = bcrypt.hash(password, costFactor=12)

// ❌ MAUVAIS
hash = md5(password)
hash = sha1(password + "static_salt")
```

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
Règles:
- Algorithme: RS256 ou ES256 (pas HS256 avec secret faible)
- Expiration courte (15 min)
- Refresh token long (7 jours) stocké sécurisé
- Vérifier signature et claims
- Ne pas stocker de données sensibles dans le payload

// ❌ MAUVAIS
jwt.sign(payload, "secret123", { algorithm: "HS256" })

// ✅ BON
jwt.sign(payload, privateKey, {
  algorithm: "RS256",
  expiresIn: "15m"
})
```

### Multi-Factor Authentication (MFA)

```
Quand activer MFA:
- Accès admin
- Opérations sensibles (paiement, suppression)
- Changement de mot de passe
- Connexion depuis nouvel appareil

Méthodes:
- TOTP (Google Authenticator)
- SMS (moins sécurisé)
- Hardware keys (FIDO2)
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
| **Secret** | Mots de passe, clés | Vault, hash |

### Stockage

```
Mots de passe:
  → Hash avec bcrypt/Argon2
  → JAMAIS en clair

Données personnelles (RGPD):
  → Chiffrement au repos
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

### Headers recommandés

```http
# Protection XSS
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block

# Protection clickjacking
X-Frame-Options: DENY

# HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains

# Referrer
Referrer-Policy: strict-origin-when-cross-origin

# Permissions
Permissions-Policy: geolocation=(), camera=()
```

### Content-Security-Policy (CSP)

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
```

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

## Securite MCP & Plugins

### Risques des serveurs MCP tiers

> **Alerte:** Des recherches de securite (Snyk, 2026) ont identifie 76 payloads malicieux dans les registres publics de serveurs MCP. Les serveurs MCP tiers non verifies representent un risque significatif.

```
RISQUES:
- Injection de commandes via les parametres MCP
- Exfiltration de donnees (fichiers, secrets, contexte)
- Execution de code arbitraire sur la machine hote
- Escalade de privileges via les outils exposes

PROTECTION:
- Preferer ecrire ses propres serveurs MCP
- Auditer le code source avant d'installer un serveur tiers
- Limiter les permissions (tools allowlist)
- Utiliser le hook PreToolUse pour bloquer les patterns dangereux
```

### Checklist de vetting MCP/Plugin

Avant d'installer un serveur MCP tiers:

- [ ] Code source disponible et auditable
- [ ] Auteur/organisation verifiee
- [ ] Pas d'acces reseau non justifie
- [ ] Pas de lecture de fichiers sensibles (.env, secrets)
- [ ] Permissions minimales (principle of least privilege)
- [ ] Version pinee (pas de `latest`)
- [ ] Changelog et historique de securite

### Hook PreToolUse pour la securite

Utiliser les hooks Claude Code pour bloquer les patterns dangereux:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "command": "echo '$TOOL_INPUT' | grep -qE '(curl|wget).*\\.(sh|py|rb)' && echo 'BLOCKED: suspicious download' && exit 1 || exit 0"
      }
    ]
  }
}
```

### Vulnerabilites connues (CVE)

| CVE | Severite | Version corrigee | Impact |
|-----|----------|-----------------|--------|
| CVE-2025-59536 | 8.7/10 CVSS | v2.1.51 | Injection de commandes via inputs MCP dans le pipeline de hooks |
| CVE-2026-21852 | 5.3/10 CVSS | v2.0.65 | Exfiltration de cles API via traversee de chemin dans la resolution de hooks |
| CVE-2026-35020 | High | v2.1.97 | Compound command bypass — permissions not checked on compound bash commands |
| CVE-2026-35021 | High | v2.1.97 | Network redirect bypass in Bash tool |
| CVE-2026-35022 | High | v2.1.98 | Env-var prefix injection in Bash tool |
| N/A | High | v2.1.101 | Command injection via POSIX `which` fallback |

> **Incident (mars 2026):** Le code source complet de Claude Code a ete expose via le package npm v2.1.88 (fichier `.map` de 59.8 MB non exclu par `.npmignore`). Corrige dans v2.1.89.

> **Note:** L'installation via `npm install -g` est obsolete. Utilisez les installateurs natifs.
> **Recommandation:** Toujours utiliser Claude Code v2.1.97+ lorsque des serveurs MCP sont utilises avec des hooks.

### CLAUDE.md vs Hooks

| Mecanisme | Force | Usage |
|-----------|-------|-------|
| **CLAUDE.md** | Suggestion | Guidelines, conventions |
| **Rules** | Suggestion forte | Regles detaillees |
| **Hooks** | Enforcement | Blocage effectif, validation automatique |

> **Regle:** CLAUDE.md = suggestions. Hooks = requirements.
> Pour les contraintes de securite critiques, utiliser des hooks, pas des instructions textuelles.

### Auto Mode (v2.1.94+)

> **Auto Mode** est un classificateur de permissions propulse par l'IA qui remplace `--dangerously-skip-permissions` de maniere plus sure.

Disponible pour les plans Team (avec approbation admin).

```
Fonctionnement:
- Un modele de securite en arriere-plan evalue chaque appel d'outil
- ✅ Autorise les operations sures (lectures, tests)
- 🚫 Bloque les actions risquees (suppression massive, exfiltration)
- ⚠️ Escalade les cas ambigus pour approbation manuelle

Securite progressive:
- 3 blocages consecutifs → retour en mode manuel
- 20+ blocages dans une session → revert complet au mode manuel
```

| Mode | Protection | Vitesse | Usage |
|------|-----------|---------|-------|
| Manuel | Maximale | Lente | Workflows audites, haute securite |
| Auto Mode | Elevee | Rapide | Workflows de dev de confiance |
| Skip Permissions | Minimale | Maximale | Projets locaux/personnels uniquement |

### Sandboxing des sous-processus (v2.1.98+)

| Mecanisme | Description |
|-----------|-------------|
| Isolation PID namespace | Les sous-processus sont isoles dans un namespace PID dedie (Linux) |
| `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` | Supprime les credentials des variables d'environnement des sous-processus |
| `sandbox.failIfUnavailable` | Echoue si le sandbox ne peut pas etre initialise (v2.1.83+) |

---

## Checklist

### Développement

- [ ] Validation des entrées côté serveur
- [ ] Requêtes paramétrées (pas de concaténation SQL)
- [ ] Escape des outputs (prévention XSS)
- [ ] Mots de passe hashés (bcrypt/Argon2)
- [ ] Sessions sécurisées (httpOnly, secure, sameSite)
- [ ] Vérification des permissions à chaque requête
- [ ] Secrets dans variables d'environnement
- [ ] Dépendances auditées

### Configuration

- [ ] HTTPS activé (TLS 1.3)
- [ ] Headers de sécurité configurés
- [ ] Messages d'erreur génériques en prod
- [ ] Debug mode désactivé en prod
- [ ] Rate limiting activé
- [ ] CORS configuré strictement

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

- **OWASP Top 10:** [owasp.org/Top10](https://owasp.org/Top10/)
- **OWASP Cheat Sheets:** [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/)
- **CWE Top 25:** [cwe.mitre.org/top25](https://cwe.mitre.org/top25/)
- **NIST Guidelines:** [nist.gov](https://www.nist.gov/cyberframework)

---

**Date de derniere mise a jour:** 2026-04
**Version:** 1.2.0
**Auteur:** The Bearded CTO
