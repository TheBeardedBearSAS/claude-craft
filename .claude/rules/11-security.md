# Securite — Quick Reference

La securite est une **priorite absolue**. References : OWASP Top 10 | CWE/SANS Top 25.

## OWASP Top 10 — Essentiels

| # | Menace | Defense |
|---|--------|---------|
| 1 | Broken Access Control | Verifier permissions a CHAQUE requete, deny by default |
| 2 | Cryptographic Failures | TLS 1.3, bcrypt/Argon2, secrets dans vault |
| 3 | Injection | Requetes parametrees, validation/sanitization |
| 4 | Insecure Design | Threat modeling, defense in depth, rate limiting |
| 5 | Security Misconfiguration | Hardening, erreurs generiques en prod |

## Regles non-negociables

- **Ne JAMAIS faire confiance aux donnees utilisateur** — valider cote serveur
- **Requetes parametrees** — JAMAIS de concatenation SQL
- **Mots de passe** : hash bcrypt/Argon2, JAMAIS MD5/SHA1, minimum 12 caracteres
- **Sessions** : httpOnly, secure, sameSite strict, expiration 15-30 min
- **JWT** : RS256/ES256, expiration courte (15 min), refresh token securise
- **Secrets** : variables d'environnement ou Vault, JAMAIS dans le code

## Headers obligatoires

CSP, X-Content-Type-Options: nosniff, X-Frame-Options: DENY, HSTS, Referrer-Policy strict.

## Logging

Logger : connexions, changements permissions, acces donnees sensibles, erreurs autorisation.
Ne PAS logger : mots de passe, tokens, donnees personnelles completes.

## MCP & Plugins

Avant d'installer un serveur MCP tiers : code source auditable, version pinee, permissions minimales.
Utiliser Claude Code **v2.1.97+** minimum avec des serveurs MCP + hooks.

> Details complets, checklists et CVE : `@.claude/references/base/security.md`
