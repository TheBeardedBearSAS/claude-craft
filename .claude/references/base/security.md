# Securite

## Vue d'ensemble

La securite est une **priorite absolue**. Ce document presente les principes generaux de securite applicables a tout projet.

> **Note:** Consultez les regles specifiques a votre technologie pour les implementations concretes.

**References:**
- **OWASP Top 10:2025** (publie novembre 2025)
- CWE/SANS Top 25
- SLSA 1.0

---

## Table des matieres

1. [OWASP Top 10:2025](#owasp-top-102025)
2. [Validation des entrees](#validation-des-entrees)
3. [Authentification](#authentification)
4. [Autorisation](#autorisation)
5. [Donnees sensibles](#donnees-sensibles)
6. [Headers de securite](#headers-de-securite)
7. [Supply Chain](#supply-chain)
8. [Logging et monitoring](#logging-et-monitoring)
9. [Securite MCP & Plugins](#securite-mcp--plugins)
10. [Checklist](#checklist)

---

## OWASP Top 10:2025

> **Source:** [OWASP Top 10:2025](https://owasp.org/Top10/2025/) — publie novembre 2025.
> Changements majeurs vs 2021 : SSRF consolide dans #1, Supply Chain Failures nouveau en #6, Mishandling Exceptional Conditions nouveau en #7.

### 1. Broken Access Control (inclut SSRF consolide)

```
RISQUE
- Acces a des ressources sans verification
- URLs predictibles (/admin, /user/123/edit)
- Manipulation d'IDs dans les URLs
- SSRF : URLs fournies par l'utilisateur non validees, acces a des ressources internes

PROTECTION
- Verifier les permissions a CHAQUE requete
- Utiliser des identifiants non predictibles (UUID)
- Deny by default
- SSRF : Whitelist des destinations autorisees, validation stricte des URLs
- Pas d'acces reseau interne depuis les inputs utilisateur
```

### 2. Cryptographic Failures

```
RISQUE
- Donnees sensibles en clair
- Algorithmes obsoletes (MD5, SHA1, bcrypt en nouveau code)
- Cles dans le code source
- JWT avec algorithme faible (HS256, RS256)

PROTECTION
- Chiffrer les donnees sensibles au repos
- Utiliser TLS 1.3 en transit
- Hachage mots de passe : Argon2id (128 MiB RAM, t=3-5, p=1) — JAMAIS MD5/SHA1/bcrypt
- JWT : EdDSA (Ed25519) prioritaire > ES256 > RS256
- Secrets dans un vault (pas dans le code)
```

### 3. Injection

```
RISQUE
- SQL Injection
- Command Injection
- LDAP Injection

PROTECTION
- Requetes parametrees (prepared statements)
- Validation et sanitization des entrees
- Principe du moindre privilege (DB)
- Escape des outputs
```

### 4. Insecure Design

```
RISQUE
- Pas de threat modeling
- Fonctionnalites sensibles non protegees
- Rate limiting absent

PROTECTION
- Threat modeling des la conception
- Security by design
- Defense in depth
- Rate limiting
```

### 5. Security Misconfiguration

```
RISQUE
- Configs par defaut non modifiees
- Fonctionnalites inutiles activees
- Messages d'erreur verbeux
- Permissions trop larges

PROTECTION
- Hardening des configurations
- Desactiver le non necessaire
- Messages d'erreur generiques en prod
- Principe du moindre privilege
```

### 6. Software Supply Chain Failures (nouveau 2025)

```
RISQUE
- Dependances avec vulnerabilites connues
- Composants sans provenance verifiable
- CI/CD non securise
- Artefacts non signes

PROTECTION
- SLSA 1.0 niveaux 1-3 (sources verifiables, builds reproductibles, provenance)
- SBOM automatique (SPDX 3 ou CycloneDX) a chaque build
- Sigstore keyless signing (cosign) pour artefacts et images
- Dependabot / Renovate avec scan CVE (Trivy, Grype)
- Version pinee sur toutes les dependances (pas de "latest")
```

### 7. Mishandling of Exceptional Conditions (nouveau 2025)

```
RISQUE
- Stack traces exposees en production
- Exceptions non gerees qui leakent des donnees internes
- Comportement undefined sur inputs mal formes

PROTECTION
- Logger les erreurs, ne jamais exposer la stack trace en prod
- Gestionnaires d'exceptions globaux (error boundaries)
- Messages d'erreur generiques cote client
- Fail fast avec des erreurs metier claires
```

### 8. Authentication Failures

```
RISQUE
- Mots de passe faibles autorises
- Pas de MFA
- Sessions qui n'expirent pas
- Credential stuffing possible

PROTECTION
- Politique de mots de passe forts (min 12 caracteres)
- MFA pour acces sensibles
- Expiration des sessions
- Rate limiting sur login
- Detection de brute force
```

### 9. Logging & Monitoring Failures

```
RISQUE
- Pas de logs des evenements securite
- Logs non proteges
- Pas d'alerting

PROTECTION
- Logger les evenements de securite
- Proteger les logs (acces restreint)
- Alerting sur anomalies
- Retention appropriee
```

### 10. Data Integrity Failures

```
RISQUE
- Dependances non verifiees
- CI/CD non securise
- Updates non signes

PROTECTION
- Verification des signatures
- CI/CD securise
- Integrity checks (checksums)
```

---

## Validation des entrees

### Regle d'or

> **Ne jamais faire confiance aux donnees utilisateur.**
> Valider cote serveur, TOUJOURS.

### Types de validation

| Type | Description | Exemple |
|------|-------------|---------|
| **Whitelist** | Accepter uniquement ce qui est attendu | `status in ["pending", "done"]` |
| **Type checking** | Verifier le type | `typeof id === "number"` |
| **Format** | Verifier le format | `email.matches(EMAIL_REGEX)` |
| **Range** | Verifier les bornes | `1 <= page <= 100` |
| **Length** | Verifier la longueur | `name.length <= 255` |

### Exemples

```
// MAUVAIS - Pas de validation
function getUser(id):
  return db.query("SELECT * FROM users WHERE id = " + id)

// BON - Validation + requete parametree
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
Validation: Rejeter les donnees invalides
  -> "abc" comme ID numerique -> ERREUR

Sanitization: Nettoyer les donnees
  -> "<script>" dans un nom -> "script"

Preferer VALIDATION (rejeter) a SANITIZATION (transformer)
```

---

## Authentification

### Mots de passe

```
Regles NIST SP 800-63B-4 (2024) + OWASP Authentication Cheat Sheet:
- Minimum 12 caracteres (NIST SHOULD : 15 si mot de passe seul facteur ; 8 si MFA)
- PAS de regles de complexite obligatoires — NIST 800-63B-4 les interdit (elles produisent 'P@ssw0rd!' plutot que des phrases fortes)
- Autoriser tous les caracteres imprimables (ASCII + Unicode), encourager les passphrases
- Pas de rotation periodique sauf compromission suspectee
- Bloquer les mots de passe des listes compromises (Have I Been Pwned k-anonymity)
- Hash avec Argon2id (128 MiB RAM, t=3-5, p=1)
- Salt unique par utilisateur (gere par Argon2id)

// BON
hash = argon2id.hash(password, memory=131072, iterations=3, parallelism=1)

// BRISES — jamais (collisions / preimage)
hash = md5(password)
hash = sha1(password + "static_salt")

// LEGACY — acceptable uniquement si Argon2id/scrypt indisponibles (bcrypt n'est PAS casse)
hash = bcrypt.hash(password, costFactor=12)  // cost >=12, entree max 72 octets
```

Sources : [NIST SP 800-63B-4](https://pages.nist.gov/800-63-4/sp800-63b.html), [Argon2id OWASP 2026](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/)

### Sessions

```
Regles:
- Token aleatoire cryptographiquement sur
- Stockage cote serveur (pas dans cookies)
- Expiration: 15-30 min d'inactivite
- Renouvellement apres login
- Invalidation apres logout

Session config:
  cookie:
    httpOnly: true     # Pas accessible en JS
    secure: true       # HTTPS uniquement
    sameSite: strict   # Protection CSRF
```

### JWT (si utilise)

```
Regles OWASP 2026:
- Algorithme : EdDSA (Ed25519) prioritaire > ES256 > RS256
- JAMAIS HS256 avec secret faible
- Expiration courte (15 min)
- Refresh token long (7 jours) stocke securise
- DPoP (RFC 9449) pour tokens sensibles
- Verifier signature et claims
- Ne pas stocker de donnees sensibles dans le payload

// MAUVAIS (secret faible, HS256 partage)
jwt.sign(payload, "secret123", { algorithm: "HS256" })

// ACCEPTABLE si l'IdP l'impose (Entra ID, Google, Auth0) — non deprecie, mais preferer EdDSA/ES256
jwt.sign(payload, privateKey, { algorithm: "RS256" })

// BON
jwt.sign(payload, ed25519PrivateKey, {
  algorithm: "EdDSA",
  expiresIn: "15m"
})
```

Sources : [JWT Best Practices 2026](https://duendesoftware.com/learn/best-practices-using-jwts-with-web-and-mobile-apps), [RFC 9449 DPoP](https://datatracker.ietf.org/doc/html/rfc9449)

### Multi-Factor Authentication (MFA)

```
Quand activer MFA:
- Acces admin
- Operations sensibles (paiement, suppression)
- Changement de mot de passe
- Connexion depuis nouvel appareil

Methodes (ordre de securite):
- Hardware keys (FIDO2/WebAuthn) — le plus sur
- TOTP (Google Authenticator, Authy)
- SMS (moins securise — eviter si possible)
```

---

## Autorisation

### Principe du moindre privilege

```
Regle: Accorder uniquement les permissions NECESSAIRES.

MAUVAIS
user.role = "admin"  # Acces a tout

BON
user.permissions = ["read:users", "write:orders"]
```

### RBAC (Role-Based Access Control)

```
Roles:
- admin: Toutes permissions
- manager: Gestion utilisateurs, lecture rapports
- user: Acces a ses propres donnees

Verification:
function deleteUser(userId, currentUser):
  if not currentUser.hasPermission("delete:users"):
    throw Forbidden("Permission denied")

  // ... delete logic
```

### Row-Level Security

```
Regle: Verifier que l'utilisateur a acces a LA ressource specifique.

// MAUVAIS - Verifie seulement l'authentification
function getOrder(orderId):
  return db.find("orders", orderId)

// BON - Verifie l'appartenance
function getOrder(orderId, currentUser):
  order = db.find("orders", orderId)

  if order.userId != currentUser.id:
    throw Forbidden("Not your order")

  return order
```

---

## Donnees sensibles

### Classification

| Categorie | Exemples | Protection |
|-----------|----------|------------|
| **Public** | Nom produit | Aucune |
| **Interne** | Emails | Acces restreint |
| **Confidentiel** | Donnees client | Chiffrement |
| **Secret** | Mots de passe, cles | Vault, hash Argon2id |

### Stockage

```
Mots de passe:
  -> Hash avec Argon2id (128 MiB RAM, t=3-5, p=1)
  -> JAMAIS en clair
  -> JAMAIS bcrypt/MD5/SHA1 en nouveau code

Donnees personnelles (RGPD):
  -> Chiffrement au repos (AES-256-GCM)
  -> Pseudonymisation si possible
  -> Retention limitee

Secrets (API keys, etc.):
  -> Variables d'environnement
  -> Vault (HashiCorp, AWS Secrets Manager)
  -> JAMAIS dans le code source
```

### Transmission

```
Regles:
- HTTPS obligatoire (TLS 1.3)
- Certificats valides
- HSTS active
- Pas de donnees sensibles dans URLs

// MAUVAIS
GET /api/users?password=secret123

// BON
POST /api/auth
Body: { "password": "..." }
```

---

## Headers de securite

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
# Restrictif (recommande)
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

| Header | Valeur recommandee | Protection |
|--------|-------------------|------------|
| **COOP** | `same-origin` | Isole le contexte de navigation (Spectre) |
| **COEP** | `require-corp` | Active Cross-Origin Isolation |
| **CORP** | `same-origin` | Protege les ressources contre les inclusions cross-origin |
| **Permissions-Policy** | Granulaire par feature | Controle l'acces aux APIs du navigateur |

---

## Supply Chain

> **Reference :** [Supply Chain Security 2026](https://kawaldeepsingh.medium.com/practical-software-supply-chain-security-2026-sboms-signing-slsa-reproducible-builds-a-0416cfac32dc)

### SLSA 1.0 (Supply-chain Levels for Software Artifacts)

| Niveau | Exigences | Impact |
|--------|-----------|--------|
| **Niveau 1** | Provenance documentee du build | Tracabilite basique |
| **Niveau 2** | Build sur plateforme verifiable, signe | Resistance aux compromissions internes |
| **Niveau 3** | Build reproductible, infrastructure durcie | Resistance aux compromissions de la plateforme |

### SBOM (Software Bill of Materials)

```
Generer automatiquement a chaque build :
- Format SPDX 3 ou CycloneDX
- Liste toutes les dependances directes et transitives
- Inclure les versions, licences, CVE connus
- Publier dans le registre artefact

Outils : syft, cdxgen, trivy --format cyclonedx
```

### Sigstore / cosign

```
Signer les artefacts et images Docker :
cosign sign --key cosign.key ghcr.io/org/image:tag
cosign verify --key cosign.pub ghcr.io/org/image:tag

Keyless signing (recommande en CI/CD) :
cosign sign --identity-token=$(cat $ACTIONS_ID_TOKEN_REQUEST_TOKEN) \
  ghcr.io/org/image:tag
```

### Checklist Supply Chain

- [ ] SBOM genere automatiquement (SPDX 3 ou CycloneDX)
- [ ] Artefacts signes avec Sigstore/cosign
- [ ] Provenance SLSA 1+ documentee
- [ ] Dependances avec versions pinnes (hash ou version exacte)
- [ ] Scan CVE automatise (Trivy, Grype) sur chaque build
- [ ] Dependabot / Renovate configure
- [ ] Revue des dependances avant merge

---

## Logging et monitoring

### Evenements a logger

```
A LOGGER:
- Tentatives de connexion (succes/echec)
- Changements de permissions
- Acces a donnees sensibles
- Erreurs d'autorisation
- Modifications de configuration
- Exports de donnees

A NE PAS LOGGER:
- Mots de passe
- Tokens
- Donnees personnelles completes
- Numeros de carte bancaire
- Stack traces completes en prod
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
- 5+ echecs de login sur meme compte
- Acces admin depuis nouvelle IP
- Modification de permissions
- Erreurs 500 en serie
- Volume anormal de requetes
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
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(jq -r '.tool_input.command // empty'); if printf '%s' \"$INPUT\" | grep -qE '(curl|wget).*\\.(sh|py|rb)'; then printf 'BLOCKED: suspicious download\\n' >&2; exit 2; fi; exit 0"
          }
        ]
      }
    ]
  }
}
```

> **Anti-pattern à éviter :** `echo '$TOOL_INPUT' | jq ...` — `$TOOL_INPUT` n'est PAS une variable d'environnement shell. Claude Code passe le payload du hook sur **stdin** en JSON. Lire avec `jq` depuis stdin (sans argument de fichier). Voir `.claude/templates/hooks/` pour des exemples corrects.

### Vulnerabilites connues (CVE)

| CVE | Severite | Version corrigee | Impact |
|-----|----------|-----------------|--------|
| CVE-2025-59536 | 8.7/10 CVSS | v2.1.51 | Injection de commandes via inputs MCP dans le pipeline de hooks |
| CVE-2026-21852 | 5.3/10 CVSS | v2.0.65 | Exfiltration de cles API via traversee de chemin dans la resolution de hooks |
| CVE-2026-35020 | High | v2.1.97 | Compound command bypass — permissions not checked on compound bash commands |
| CVE-2026-35021 | High | v2.1.97 | Network redirect bypass in Bash tool |
| CVE-2026-35022 | High | v2.1.98 | Env-var prefix injection in Bash tool |
| N/A | High | v2.1.101 | Command injection via POSIX `which` fallback |

> **Recommandation:** Toujours utiliser Claude Code v2.1.97+ lorsque des serveurs MCP sont utilises avec des hooks.

### CLAUDE.md vs Hooks

| Mecanisme | Force | Usage |
|-----------|-------|-------|
| **CLAUDE.md** | Suggestion | Guidelines, conventions |
| **Rules** | Suggestion forte | Regles detaillees |
| **Hooks** | Enforcement | Blocage effectif, validation automatique |

> **Regle:** CLAUDE.md = suggestions. Hooks = requirements.
> Pour les contraintes de securite critiques, utiliser des hooks, pas des instructions textuelles.

---

## Checklist

### Developpement

- [ ] Validation des entrees cote serveur
- [ ] Requetes parametrees (pas de concatenation SQL)
- [ ] Escape des outputs (prevention XSS)
- [ ] Mots de passe hashes avec **Argon2id** (128 MiB, t=3-5, p=1)
- [ ] Sessions securisees (httpOnly, secure, sameSite)
- [ ] Verification des permissions a chaque requete
- [ ] Secrets dans variables d'environnement ou Vault
- [ ] Dependances auditees (scan CVE)
- [ ] JWT avec EdDSA ou ES256 (jamais HS256)
- [ ] DPoP (RFC 9449) pour tokens sensibles

### Configuration

- [ ] HTTPS active (TLS 1.3)
- [ ] Headers de securite 2026 (CSP L3, HSTS, COOP, COEP, CORP, Permissions-Policy)
- [ ] Messages d'erreur generiques en prod
- [ ] Debug mode desactive en prod
- [ ] Rate limiting active
- [ ] CORS configure strictement

### Supply Chain

- [ ] SBOM genere (SPDX 3 ou CycloneDX)
- [ ] Artefacts signes (Sigstore/cosign)
- [ ] Provenance SLSA 1+ documentee
- [ ] Dependances pinnes sur version exacte

### Monitoring

- [ ] Logging des evenements de securite
- [ ] Alerting sur anomalies
- [ ] Audit regulier des acces
- [ ] Scan de vulnerabilites periodique

### Compliance (si applicable)

- [ ] RGPD: Consentement, droit a l'oubli
- [ ] PCI-DSS: Donnees de paiement
- [ ] HIPAA: Donnees de sante
- [ ] SOC2: Controles de securite

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

**Date de derniere mise a jour:** 2026-06
**Version:** 1.3.0
**Auteur:** The Bearded CTO
