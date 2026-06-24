# Securite — Quick Reference

La securite est une **priorite absolue**. References : **OWASP Top 10:2025** (10 categories, publie nov. 2025) | CWE/SANS Top 25 | SLSA 1.0.

## OWASP Top 10:2025 — Toutes les categories (10/10)

| # | Menace | Defense |
|---|--------|---------|
| 1 | Broken Access Control (inclut **SSRF** consolide) | Verifier permissions a CHAQUE requete, deny by default |
| 2 | Cryptographic Failures | TLS 1.3, **Argon2id** (128 MiB RAM, t>=3, p=1), secrets dans vault |
| 3 | Injection | Requetes parametrees, validation/sanitization |
| 4 | Insecure Design | Threat modeling, defense in depth, rate limiting |
| 5 | Security Misconfiguration | Hardening, erreurs generiques en prod |
| 6 | **Software Supply Chain Failures** (nouveau 2025) | SLSA 1.0, SBOM (CycloneDX 1.6+ / SPDX 3), Sigstore keyless signing, reproducible builds |
| 7 | **Mishandling of Exceptional Conditions** (nouveau 2025) | Logger les erreurs, ne jamais exposer la stack trace en prod |
| 8 | **Authentication Failures** | MFA obligatoire, brute-force protection, sessions invalidees a la deconnexion |
| 9 | **Security Logging and Monitoring Failures** | Centraliser les logs, alertes sur anomalies, retention >= 1 an |
| 10 | **Vulnerable and Outdated Components** | Dependabot/Renovate, `npm audit --audit-level=moderate`, Trivy, Grype |

> La liste 2025 integre SSRF dans la categorie #1, ajoute Supply Chain (#6) et Exceptional Conditions (#7). Les categories #8-#10 etaient presentes dans OWASP 2021 et restent en vigueur. Toujours referencer les 10 categories.

Sources : [OWASP Top 10:2025](https://owasp.org/Top10/2025/), [Supply Chain 2026](https://kawaldeepsingh.medium.com/practical-software-supply-chain-security-2026-sboms-signing-slsa-reproducible-builds-a-0416cfac32dc).

## Regles non-negociables

- **Ne JAMAIS faire confiance aux donnees utilisateur** — valider cote serveur
- **Requetes parametrees** — JAMAIS de concatenation SQL
- **Mots de passe** : hash **Argon2id** (OWASP 2026 : 128 MiB RAM, t>=3 minimum — t=4 recommande haute securite, p=1), JAMAIS MD5/SHA1/bcrypt en nouveau code, minimum 12 caracteres. Le parametre RAM (128 MiB) est le levier de securite principal.
- **Sessions** : **HTTP-only cookies** (jamais localStorage pour tokens), secure, sameSite strict, expiration 15-30 min
- **JWT** : **EdDSA (Ed25519) prioritaire** > ES256 > RS256 **DEPRECATED** (ne pas utiliser en nouveau code — risque d'algorithm confusion). Expiration courte (15 min), **DPoP** (RFC 9449) pour tokens sensibles, refresh token securise. **Toujours specifier explicitement l'algorithme cote verifieur** (`{ algorithms: ["EdDSA"] }`) — ne jamais faire confiance au header `alg` du token (CVE-2022-21449 class).
- **Secrets** : variables d'environnement ou Vault, JAMAIS dans le code

Sources : [Argon2id 2026](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/), [RFC 9449 DPoP](https://datatracker.ietf.org/doc/html/rfc9449), [JWT 2026](https://duendesoftware.com/learn/best-practices-using-jwts-with-web-and-mobile-apps).

## Headers obligatoires (2026)

CSP Level 3, X-Content-Type-Options: nosniff, X-Frame-Options: DENY, HSTS, Referrer-Policy strict, **COOP** (Cross-Origin-Opener-Policy: same-origin), **COEP** (Cross-Origin-Embedder-Policy: require-corp), **CORP** (Cross-Origin-Resource-Policy), **Permissions-Policy** granulaire.

Source : [HTTP Security Headers 2026](https://thibautprobst.fr/en/posts/http-security-headers/).

## Supply Chain

- **SLSA** 1.0 : niveau L1 atteint via `npm publish --provenance` (OIDC-based). L2/L3 sont des objectifs aspirationnels — ne pas sur-clamer.
- **SBOM** automatique (CycloneDX 1.6+ JSON) a chaque build — SPDX 3 comme format alternatif recommande
- **Sigstore** keyless signing (cosign) pour artefacts et images ; signer le SBOM lui-meme pour l'integrite
- Dependabot / Renovate avec scan CVE (Trivy, Grype)
- Gate CI : `npm audit --omit=dev --audit-level=moderate` (bloquer moderate + high, pas seulement high)

## Logging

Logger : connexions, changements permissions, acces donnees sensibles, erreurs autorisation, anomalies (OWASP #9).
Ne PAS logger : mots de passe, tokens, donnees personnelles completes, stack traces en prod.
Retention des logs : >= 1 an pour la conformite. Alertes sur anomalies (echecs auth repetes, acces hors-horaire).

## Hooks Claude Code — Anti-pattern critique

> **$TOOL_INPUT / $TOOL_OUTPUT ne sont PAS des variables d'environnement shell** dans Claude Code.
> Le payload du hook est passe sur **stdin** en JSON. Lire avec `jq` depuis stdin.

```bash
# CORRECT — lire depuis stdin
INPUT=$(jq -r '.tool_input.command // empty')

# INCORRECT — $TOOL_INPUT est toujours vide, le hook ne fonctionne pas
FILEPATH=$(echo '$TOOL_INPUT' | jq ...)
```

Voir les templates corrects dans `.claude/templates/hooks/block-dangerous-commands.json`.

## MCP & Plugins

Avant d'installer un serveur MCP tiers : code source auditable, version pinee, permissions minimales.
Utiliser Claude Code **v2.1.97+** minimum avec des serveurs MCP + hooks.

> Details complets, checklists, CVE, patterns supply-chain : `@.claude/references/base/security.md`
