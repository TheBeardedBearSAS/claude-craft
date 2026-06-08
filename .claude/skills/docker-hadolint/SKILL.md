---
name: docker-hadolint
description: Docker & Hadolint validation (2026). Use when working with Docker, containers, or validating Dockerfiles.
---

# Docker & Hadolint (2026)

## Versions (avril 2026)

- **Docker Engine** : 29.5.2 (patch sécurité, juin 2026)  
  Source : https://docs.docker.com/engine/release-notes/29/
- **Docker Compose** : Spec v5.0.0 "Mont Blanc" (champ `version:` obsolète depuis v2.40+)  
  Source : https://www.compose-spec.io/
- **Hadolint** : v2.12.0 (version stable pinnée)  
  Source : https://github.com/hadolint/hadolint/releases/tag/v2.12.0

## Validation Hadolint

**TOUJOURS utiliser la version pinnée `v2.12.0`** (jamais `latest` ou sans tag).

```bash
# Validation Dockerfile
docker run --rm -i hadolint/hadolint:v2.12.0 < Dockerfile

# Validation via Makefile (recommandé)
make hadolint
```

## Best Practices 2026

### BuildKit Cache Mounts
```dockerfile
RUN --mount=type=cache,target=/var/cache/apk \
    apk add --no-cache postgresql-dev
```
**Bénéfice** : Réduction temps build de 40-60%  
**Source** : https://docs.docker.com/build/cache/

### BuildKit Secrets
```dockerfile
RUN --mount=type=secret,id=composer_token \
    COMPOSER_AUTH="$(cat /run/secrets/composer_token)" composer install
```
**Bénéfice** : Aucun secret dans l'image finale  
**Source** : https://docs.docker.com/build/building/secrets/

### Multi-Stage Builds
```dockerfile
FROM php:8.4-fpm-alpine AS builder
RUN composer install

FROM php:8.4-fpm-alpine AS runtime
COPY --from=builder /app /app
```
**Bénéfice** : Réduction taille image de 60-97%  
**Source** : https://docs.docker.com/build/building/multi-stage/

### Images Distroless
```dockerfile
FROM gcr.io/distroless/php8.4-fpm
COPY --from=builder /app /app
```
**Bénéfice** : Surface d'attaque minimale, CVE réduites de 90%  
**Source** : https://github.com/GoogleContainerTools/distroless

## Documentation Complète

Voir `@.claude/references/symfony/docker.md` pour architecture complète et exemples.
