# Securite — Quick Reference

La securite est une **priorite absolue**. References : **OWASP Top 10:2025** (publie nov. 2025) | CWE/SANS Top 25 | SLSA 1.0.

## OWASP Top 10:2025 — Essentiels

| # | Menace | Defense |
|---|--------|---------|
| 1 | Broken Access Control (inclut **SSRF** consolide) | Verifier permissions a CHAQUE requete, deny by default |
| 2 | Cryptographic Failures | TLS 1.3, **Argon2id** (128 MiB RAM, t=3-5, p=1), secrets dans vault |
| 3 | Injection | Requetes parametrees, validation/sanitization |
| 4 | Insecure Design | Threat modeling, defense in depth, rate limiting |
| 5 | Security Misconfiguration | Hardening, erreurs generiques en prod |
| 6 | **Software Supply Chain Failures** (nouveau 2025) | SLSA 1.0, SBOM (SPDX 3 / CycloneDX), Sigstore keyless signing, reproducible builds |
| 7 | **Mishandling of Exceptional Conditions** (nouveau 2025) | Logger les erreurs, ne jamais exposer la stack trace en prod |

Sources : [OWASP Top 10:2025](https://owasp.org/Top10/2025/), [Supply Chain 2026](https://kawaldeepsingh.medium.com/practical-software-supply-chain-security-2026-sboms-signing-slsa-reproducible-builds-a-0416cfac32dc).

## Regles non-negociables

- **Ne JAMAIS faire confiance aux donnees utilisateur** — valider cote serveur
- **Requetes parametrees** — JAMAIS de concatenation SQL
- **Mots de passe** : hash **Argon2id** (OWASP 2026 : 128 MiB RAM, t=3-5, p=1), JAMAIS MD5/SHA1/bcrypt en nouveau code, minimum 12 caracteres
- **Sessions** : **HTTP-only cookies** (jamais localStorage pour tokens), secure, sameSite strict, expiration 15-30 min
- **JWT** : **EdDSA (Ed25519) prioritaire** > ES256 > RS256, expiration courte (15 min), **DPoP** (RFC 9449) pour tokens sensibles, refresh token securise
- **Secrets** : variables d'environnement ou Vault, JAMAIS dans le code

Sources : [Argon2id 2026](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/), [RFC 9449 DPoP](https://datatracker.ietf.org/doc/html/rfc9449), [JWT 2026](https://duendesoftware.com/learn/best-practices-using-jwts-with-web-and-mobile-apps).

## Headers obligatoires (2026)

CSP Level 3, X-Content-Type-Options: nosniff, X-Frame-Options: DENY, HSTS, Referrer-Policy strict, **COOP** (Cross-Origin-Opener-Policy: same-origin), **COEP** (Cross-Origin-Embedder-Policy: require-corp), **CORP** (Cross-Origin-Resource-Policy), **Permissions-Policy** granulaire.

Source : [HTTP Security Headers 2026](https://thibautprobst.fr/en/posts/http-security-headers/).

## Supply Chain

- **SLSA** 1.0 niveaux 1-3 (sources verifiables, builds reproductibles, provenance)
- **SBOM** automatique (SPDX 3 ou CycloneDX) a chaque build
- **Sigstore** keyless signing (cosign) pour artefacts et images
- Dependabot / Renovate avec scan CVE (Trivy, Grype)

## Logging

Logger : connexions, changements permissions, acces donnees sensibles, erreurs autorisation.
Ne PAS logger : mots de passe, tokens, donnees personnelles completes, stack traces en prod.

## MCP & Plugins

Avant d'installer un serveur MCP tiers : code source auditable, version pinee, permissions minimales.
Utiliser Claude Code **v2.1.97+** minimum avec des serveurs MCP + hooks.

> Details complets, checklists, CVE, patterns supply-chain : `@.claude/references/base/security.md`
