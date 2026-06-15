# Sécurité — Atlas

## Authentification & Autorisation

- **JWT ES256** (EdDSA recommandé pour une migration future) — expiration 15 min, refresh token HTTP-only cookie
- **OAuth 2.0 PKCE** via AuthProvider — pas de secret côté client
- **DPoP** (RFC 9449) envisagé pour les tokens premium
- Validation des permissions à chaque requête — pas de cache de rôle

## Stockage des mots de passe

- **Argon2id** : 128 MiB RAM, t=3, p=1 (OWASP 2026)
- Longueur minimale : 12 caractères

## Headers de sécurité HTTP

```
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Strict-Transport-Security: max-age=31536000; includeSubDomains
Referrer-Policy: strict-origin-when-cross-origin
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Permissions-Policy: geolocation=(), camera=(), microphone=()
```

## RGPD

- Consentement explicite collecté à l'inscription
- Export des données sur demande (délai ≤ 72 h)
- Suppression irréversible après 30 jours de délai de rétractation
- DPO désigné, registre de traitement à jour

## Audit & Logging

Chaque accès aux données personnelles est journalisé avec `account_id`, `action`, `timestamp` et `ip_hash`.
