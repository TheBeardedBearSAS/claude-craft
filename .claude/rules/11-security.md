# Securite — Quick Reference

La securite est une **priorite absolue**. References : **OWASP Top 10:2025** (10 categories, publie nov. 2025) | CWE/SANS Top 25 | SLSA 1.2.

## OWASP Top 10:2025 — Toutes les categories (10/10)

| # | Menace | Defense |
|---|--------|---------|
| A01 | Broken Access Control (inclut **SSRF** consolidé) | Vérifier les permissions à CHAQUE requête, deny by default |
| A02 | Security Misconfiguration | Hardening, erreurs génériques en prod |
| A03 | **Software Supply Chain Failures** (nouveau 2025) | SLSA 1.2, SBOM (CycloneDX 1.7 / SPDX 3), Sigstore keyless signing, reproducible builds, Dependabot/Renovate, `npm audit --audit-level=moderate`, Trivy, Grype |
| A04 | Cryptographic Failures | TLS 1.3, **Argon2id** (minimum OWASP 19 MiB / t=2 / p=1 ; recommandation interne 128 MiB / t>=3 / p=1), secrets dans vault |
| A05 | Injection | Requêtes paramétrées, validation/sanitization |
| A06 | Insecure Design | Threat modeling, defense in depth, rate limiting |
| A07 | **Authentication Failures** | MFA obligatoire, brute-force protection, sessions invalidées à la déconnexion |
| A08 | **Software or Data Integrity Failures** | Vérification des signatures/checksums, CI/CD sécurisé, mises à jour signées |
| A09 | **Security Logging and Alerting Failures** | Centraliser les logs, alertes sur anomalies, rétention >= 1 an |
| A10 | **Mishandling of Exceptional Conditions** (nouveau 2025) | Logger les erreurs, ne jamais exposer la stack trace en prod |

> La liste 2025 intègre SSRF dans A01, remonte Security Misconfiguration en A02, ajoute Supply Chain (A03, qui remplace « Vulnerable and Outdated Components ») et Exceptional Conditions (A10). Toujours référencer les 10 catégories. Code d'agents IA/LLM : OWASP Top 10 for Agentic Applications 2026 et OWASP LLM Top 10 (genai.owasp.org) ; exigences de vérification : OWASP ASVS 5.0.0.

Sources : [OWASP Top 10:2025](https://owasp.org/Top10/2025/), [Supply Chain 2026](https://kawaldeepsingh.medium.com/practical-software-supply-chain-security-2026-sboms-signing-slsa-reproducible-builds-a-0416cfac32dc).

## Regles non-negociables

- **Ne JAMAIS faire confiance aux donnees utilisateur** — valider cote serveur
- **Requetes parametrees** — JAMAIS de concatenation SQL
- **Mots de passe** : hash **Argon2id** RECOMMANDE pour tout nouveau code (minimum OWASP Password Storage : 19 MiB RAM / t=2 / p=1 ; recommandation interne plus stricte : 128 MiB RAM, t>=3, p=1, t=4 en haute sécurité ; le paramètre RAM est le levier principal). **BRISES — jamais** : MD5, SHA1 (collisions/preimage). **bcrypt = LEGACY acceptable** uniquement si Argon2id/scrypt indisponibles (OWASP : work factor >= 10 ; recommandation interne cost >=12 ; entrée max 72 octets) — ce n'est PAS un algorithme casse, contrairement a MD5/SHA1. **Pas de regles de complexite obligatoires** (NIST SP 800-63B-4, 2024 : elles favorisent `P@ssw0rd!` plutot que des phrases fortes) ; minimum 12 caracteres (NIST SHOULD : 15 si seul facteur), autoriser tout caractere imprimable, pas de rotation periodique sauf compromission.
- **Sessions** : **HTTP-only cookies** (jamais localStorage pour tokens), secure, sameSite strict, expiration 15-30 min
- **JWT** : **EdDSA (Ed25519) prioritaire** > ES256 > RS256 **MOINS PREFERE** (non deprecie par l'IETF/NIST — reste le defaut d'Entra ID, Google, Auth0 ; acceptable quand l'IdP l'impose, preferer EdDSA/ES256 pour les implementations autonomes). L'algorithm-confusion est un bug d'implementation (ne pas verifier `alg`), pas un defaut de RS256 — la mitigation (pinner `algorithms` cote verifieur) s'applique a tous. Expiration courte (15 min), **DPoP** (RFC 9449) pour tokens sensibles, refresh token securise. **Toujours specifier explicitement l'algorithme cote verifieur** (`{ algorithms: ["EdDSA"] }`) — ne jamais faire confiance au header `alg` du token (CVE-2022-21449 class).
- **Secrets** : variables d'environnement ou Vault, JAMAIS dans le code

Sources : [Argon2id 2026](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/), [RFC 9449 DPoP](https://datatracker.ietf.org/doc/html/rfc9449), [JWT 2026](https://duendesoftware.com/learn/best-practices-using-jwts-with-web-and-mobile-apps).

## Headers obligatoires (2026)

CSP Level 3, X-Content-Type-Options: nosniff, X-Frame-Options: DENY, HSTS, Referrer-Policy strict, **COOP** (Cross-Origin-Opener-Policy: same-origin), **COEP** (Cross-Origin-Embedder-Policy: require-corp), **CORP** (Cross-Origin-Resource-Policy), **Permissions-Policy** granulaire.

Source : [HTTP Security Headers 2026](https://thibautprobst.fr/en/posts/http-security-headers/).

## Supply Chain

- **SLSA** 1.2 : niveau L1 atteint via `npm publish --provenance` (OIDC-based). L2/L3 sont des objectifs aspirationnels — ne pas sur-clamer.
- **SBOM** automatique (CycloneDX 1.7 JSON) a chaque build — SPDX 3 comme format alternatif recommande
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
Utiliser Claude Code **v2.1.260+** minimum avec des serveurs MCP + hooks + plugins (CVE-2026-86063 pin SHA plugins, CVE-2026-103435 symlink TOCTOU, CVE-2026-88968 TOCTOU de l'outil Edit, CVE-2026-103012 managed settings). Ces CVE ne concernent que Claude Code ; pour les CVE de frameworks (ex. React2Shell CVE-2025-55182), voir `skills/security-react`.

> Details complets, checklists, CVE, patterns supply-chain : `@.claude/references/base/security.md`
