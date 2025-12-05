# Docker & Hadolint - Atoll Tourisme

## Descripción General

El uso de **Docker es OBLIGATORIO** para todo el proyecto Atoll Tourisme. Ningún comando debe ejecutarse directamente en la máquina local.

> **Recordatorio usuario global (CLAUDE.md):**
> - SIEMPRE usar docker para los comandos para abstraerse del entorno local
> - No almacenar archivos en /tmp

> **Referencias:**
> - `01-symfony-best-practices.md` - Estándares Symfony
> - `08-quality-tools.md` - Validación de calidad
> - `07-testing-tdd-bdd.md` - Tests con Docker

---

## Tabla de contenidos

1. [Reglas Docker obligatorias](#reglas-docker-obligatorias)
2. [Estructura Docker](#estructura-docker)
3. [Makefile obligatorio](#makefile-obligatorio)
4. [Configuración Hadolint](#configuracion-hadolint)
5. [Best practices Dockerfile](#best-practices-dockerfile)
6. [Docker Compose](#docker-compose)
7. [Checklist de validación](#checklist-de-validación)

---

## Reglas Docker obligatorias

### 1. TODO pasa por Docker

```bash
# ❌ PROHIBIDO: Comandos directos
php bin/console cache:clear
composer install
npm run dev

# ✅ OBLIGATORIO: Vía Docker
make console CMD="cache:clear"
make composer-install
make npm-dev
```

### 2. TODO pasa por Makefile

```bash
# ❌ PROHIBIDO: docker-compose directamente
docker-compose exec php bin/console cache:clear

# ✅ OBLIGATORIO: Vía Makefile
make console CMD="cache:clear"
```

### 3. Sin archivos locales en /tmp

```bash
# ❌ PROHIBIDO
docker-compose exec php php -r "file_put_contents('/tmp/export.csv', 'data');"

# ✅ OBLIGATORIO: Volúmenes montados
docker-compose exec php php -r "file_put_contents('/app/var/export.csv', 'data');"
```

---

## Estructura Docker

```
atoll-symfony/
├── Dockerfile                      # Producción
├── Dockerfile.dev                  # Desarrollo
├── docker-compose.yml              # Servicios
├── compose.override.yaml           # Local overrides
├── Makefile                        # Comandos obligatorios
├── .hadolint.yaml                  # Configuración Hadolint
└── docker/
    ├── nginx/
    │   └── nginx.conf
    ├── php/
    │   ├── php.ini
    │   ├── php-fpm.conf
    │   └── www.conf
    └── postgres/
        └── init.sql
```

---

## Makefile obligatorio

### Uso del Makefile

```bash
# Inicio proyecto
make build
make up
make composer-install
make npm-install
make db-reset

# Desarrollo diario
make console CMD="make:entity Participant"
make migration-diff
make migration-migrate
make test

# Calidad código
make quality
make quality-fix

# CI
make ci
```

---

## Configuración Hadolint

### .hadolint.yaml

```yaml
# .hadolint.yaml - Configuración Hadolint para Atoll Tourisme

# Ignorar ciertas reglas si es necesario
ignored:
  # DL3008: Pin versions apt packages - OK en dev
  # - DL3008

# Reglas estrictas
failure-threshold: warning

# Registries de confianza
trustedRegistries:
  - docker.io
  - ghcr.io

# Labels obligatorios
label-schema:
  author: required
  version: required
  description: required
```

### Validación Hadolint

```bash
# Vía Makefile (OBLIGATORIO)
make hadolint

# Directo (solo para debug)
docker run --rm -i hadolint/hadolint < Dockerfile
```

---

## Best practices Dockerfile

### Reglas Hadolint aplicadas

| Regla | Descripción | Aplicación |
|-------|-------------|-------------|
| **DL3006** | Always tag image version | `php:8.2-fpm-alpine` |
| **DL3008** | Pin apt/apk packages | Extensiones PHP versionadas |
| **DL3009** | Delete apt cache | `rm -rf /tmp/pear` |
| **DL3013** | Pin pip versions | N/A (no Python) |
| **DL3018** | Pin apk packages | `redis-6.0.2`, `xdebug-3.3.1` |
| **DL3020** | Use COPY not ADD | `COPY` usado en todo |
| **DL3025** | Use CMD/ENTRYPOINT array | `CMD ["php-fpm"]` |
| **DL4006** | Set SHELL option | Alpine usa sh |
| **SC2046** | Quote to prevent splitting | Quotes en variables |

---

## Docker Compose

### Características principales

- ✅ Versiones de imágenes fijadas (no `latest`)
- ✅ Healthchecks configurados para todos los servicios
- ✅ Contenedores no-root
- ✅ Networks aislados
- ✅ Volúmenes persistentes

---

## Checklist de validación

### Antes de cada commit

- [ ] **Makefile:** Todos los comandos pasan por `make`
- [ ] **Hadolint:** `make hadolint` pasa sin error
- [ ] **Docker:** Sin comandos directos (php, composer, npm)
- [ ] **Volúmenes:** Sin archivos en `/tmp`
- [ ] **Imágenes:** Versiones fijadas (no `latest`)
- [ ] **User:** Contenedores non-root
- [ ] **Healthchecks:** Configurados para todos los servicios
- [ ] **Networks:** Servicios aislados en un network

### Validación Hadolint

```bash
# ✅ Debe pasar
make hadolint

# Salida esperada:
# Validating Dockerfile...
# ✅ No issues found
# Validating Dockerfile.dev...
# ✅ No issues found
```

### Tests Docker

```bash
# Build y inicio
make build
make up

# Verificación servicios
make ps

# Debe mostrar:
#       Name                     State          Ports
# atoll_php         Up (healthy)   9000/tcp
# atoll_nginx       Up (healthy)   0.0.0.0:8080->80/tcp
# atoll_postgres    Up (healthy)   0.0.0.0:5432->5432/tcp
# atoll_redis       Up (healthy)   0.0.0.0:6379->6379/tcp
```

---

## Comandos prohibidos

```bash
# ❌ PROHIBIDOS (NUNCA USAR)
php bin/console cache:clear
composer install
npm run dev
./vendor/bin/phpunit
psql -U atoll

# ✅ OBLIGATORIOS (SIEMPRE USAR)
make console CMD="cache:clear"
make composer-install
make npm-dev
make test
make shell  # luego psql
```

---

## Recursos

- **Documentación:** [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- **Hadolint:** [GitHub](https://github.com/hadolint/hadolint)
- **Composer Docker:** [Official Image](https://hub.docker.com/_/composer)
- **PHP Docker:** [Official Image](https://hub.docker.com/_/php)

---

**Fecha de última actualización:** 2025-01-26
**Versión:** 1.0.0
**Autor:** The Bearded CTO
