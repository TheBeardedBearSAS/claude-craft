---
description: Verificación Pre-Merge
argument-hint: [arguments]
---

# Verificación Pre-Merge

Eres un asistente de calidad de código. Debes realizar todas las verificaciones necesarias ANTES de fusionar una rama, para asegurar la calidad y evitar regresiones.

## Argumentos
$ARGUMENTS

Argumentos esperados:
- Rama origen (predeterminado: rama actual)
- Rama destino (predeterminado: main o master)

Ejemplo: `/common:pre-merge-check feature/auth main`

## MISIÓN

### Paso 1: Analizar el Diff

```bash
# Identificar ramas
SOURCE_BRANCH=$(git branch --show-current)
TARGET_BRANCH=${2:-main}

# Commits a fusionar
git log $TARGET_BRANCH..$SOURCE_BRANCH --oneline

# Archivos modificados
git diff $TARGET_BRANCH...$SOURCE_BRANCH --stat

# Líneas agregadas/eliminadas
git diff $TARGET_BRANCH...$SOURCE_BRANCH --shortstat
```

### Paso 2: Verificaciones de Calidad

#### 2.1 Pruebas Completas
```bash
# Ejecutar TODAS las pruebas
# Symfony
docker compose exec php vendor/bin/phpunit --coverage-text

# Flutter
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage

# Python
docker compose exec app pytest --cov --cov-report=term

# React/RN
docker compose exec node npm run test -- --coverage
```

#### 2.2 Análisis Estático Completo
```bash
# PHPStan (nivel máximo)
docker compose exec php vendor/bin/phpstan analyse -l max

# Dart Analyzer
docker run --rm -v $(pwd):/app -w /app dart dart analyze --fatal-infos

# Mypy (strict)
docker compose exec app mypy --strict .

# TypeScript
docker compose exec node npx tsc --noEmit
```

#### 2.3 Verificación de Dependencias
```bash
# Auditoría de seguridad
# PHP
docker compose exec php composer audit

# Python
docker compose exec app pip-audit

# Node
docker compose exec node npm audit

# Flutter
docker run --rm -v $(pwd):/app -w /app dart dart pub outdated
```

### Paso 3: Verificaciones Específicas

#### Migraciones BD (si presentes)
```bash
# Verificar migraciones Doctrine
git diff $TARGET_BRANCH...$SOURCE_BRANCH -- migrations/

# Si hay migraciones presentes
docker compose exec php php bin/console doctrine:migrations:diff --no-interaction
docker compose exec php php bin/console doctrine:schema:validate
```

#### Cambios Breaking en API
```bash
# Comparar specs OpenAPI
git diff $TARGET_BRANCH...$SOURCE_BRANCH -- openapi.yaml docs/api/
```

#### Cambios de Configuración
```bash
# Archivos de config modificados
git diff $TARGET_BRANCH...$SOURCE_BRANCH -- config/ .env.example docker-compose*.yml
```

### Paso 4: Análisis de Commits

```bash
# Verificar mensajes de commit
git log $TARGET_BRANCH..$SOURCE_BRANCH --pretty=format:"%s" | while read msg; do
    # Patrón convencional: type(scope): description
    if ! echo "$msg" | grep -qE "^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .+"; then
        echo "⚠️ Mensaje no convencional: $msg"
    fi
done
```

### Paso 5: Verificación de Cobertura

```bash
# Comparar cobertura antes/después
# La cobertura no debería disminuir
```

### Paso 6: Generar Reporte

```
══════════════════════════════════════════════════════════════
🔀 VERIFICACIÓN PRE-MERGE
══════════════════════════════════════════════════════════════

📌 Origen: feature/user-auth
📌 Destino: main
📅 Fecha: AAAA-MM-DD HH:MM

──────────────────────────────────────────────────────────────
📊 ESTADÍSTICAS
──────────────────────────────────────────────────────────────

Commits: 12
Archivos modificados: 45
Líneas agregadas: +1,234
Líneas eliminadas: -567

──────────────────────────────────────────────────────────────
🧪 PRUEBAS
──────────────────────────────────────────────────────────────

| Suite | Pruebas | Pasadas | Fallidas | Omitidas |
|-------|-------|--------|----------|----------|
| Unit  | 234   | 234    | 0        | 0        |
| Integ | 45    | 45     | 0        | 0        |
| E2E   | 12    | 12     | 0        | 0        |

Cobertura: 85.2% (anterior: 84.8%) ✅ +0.4%

──────────────────────────────────────────────────────────────
🔍 ANÁLISIS ESTÁTICO
──────────────────────────────────────────────────────────────

| Herramienta | Errores | Advertencias | Estado |
|-------|---------|----------|--------|
| PHPStan | 0 | 2 | ✅ |
| ESLint | 0 | 5 | ⚠️ |
| Mypy | 0 | 0 | ✅ |

──────────────────────────────────────────────────────────────
🔒 SEGURIDAD
──────────────────────────────────────────────────────────────

Auditoría dependencias: ✅ Sin vulnerabilidades
Secretos detectados: ✅ Ninguno
Archivos sensibles: ✅ Ninguno

──────────────────────────────────────────────────────────────
📦 MIGRACIONES
──────────────────────────────────────────────────────────────

Nuevas migraciones: 2
  - Version20240115_AddUserRoles.php
  - Version20240116_CreateAuditLog.php

Validación esquema: ✅ OK
Rollback posible: ✅ Sí

──────────────────────────────────────────────────────────────
⚠️ PUNTOS DE ATENCIÓN
──────────────────────────────────────────────────────────────

1. [MEDIO] 5 advertencias ESLint a corregir
2. [BAJO] 2 TODOs agregados en código
3. [INFO] 2 nuevas migraciones - verificar en staging primero

──────────────────────────────────────────────────────────────
📋 CHECKLIST FINAL
──────────────────────────────────────────────────────────────

- [x] Todas las pruebas pasan
- [x] Cobertura mantenida o mejorada
- [x] Sin errores de análisis estático
- [x] Sin vulnerabilidades de seguridad
- [x] Sin secretos commiteados
- [ ] Code review aprobado (verificar manualmente)
- [ ] Probado en staging (verificar manualmente)

──────────────────────────────────────────────────────────────
🎯 VEREDICTO
──────────────────────────────────────────────────────────────

Merge autorizado: ✅ SÍ

Recomendaciones antes del merge:
1. Resolver 5 advertencias ESLint
2. Probar migraciones en staging
3. Obtener aprobación de code review
```

## Reglas de Bloqueo

### Bloqueantes (merge prohibido)
- ❌ Pruebas fallidas
- ❌ Caída significativa de cobertura (> 2%)
- ❌ Errores de análisis estático
- ❌ Vulnerabilidades críticas/altas
- ❌ Secretos en código
- ❌ Migraciones no reversibles

### No bloqueantes (advertencia)
- ⚠️ Advertencias de análisis estático
- ⚠️ TODO/FIXME agregados
- ⚠️ Vulnerabilidades bajas/medias
- ⚠️ Cobertura ligeramente disminuida (< 2%)
