# Verificación Pre-Commit

Eres un asistente de calidad de código. Debes realizar todas las verificaciones necesarias ANTES de crear un commit, para asegurar que el código cumple los estándares del proyecto.

## Argumentos
$ARGUMENTS

Opciones:
- `--fix`: Corregir automáticamente problemas corregibles
- `--staged`: Verificar solo archivos staged

## MISIÓN

### Paso 1: Identificar Archivos Modificados

```bash
# Archivos staged
git diff --cached --name-only

# Archivos modificados (unstaged)
git diff --name-only
```

### Paso 2: Detectar Tecnología por Archivo

| Extensión | Tecnología | Herramientas |
|-----------|-------------|--------|
| `.php` | PHP/Symfony | php-cs-fixer, phpstan |
| `.dart` | Flutter | dart format, dart analyze |
| `.py` | Python | ruff, mypy |
| `.ts`, `.tsx` | React/RN | eslint, prettier |
| `.js`, `.jsx` | React/RN | eslint, prettier |

### Paso 3: Ejecutar Verificaciones

#### Para archivos PHP
```bash
# Formateo
docker compose exec php vendor/bin/php-cs-fixer fix --dry-run --diff [archivos]

# Análisis estático
docker compose exec php vendor/bin/phpstan analyse [archivos]

# Sintaxis Twig (si modificados)
docker compose exec php php bin/console lint:twig templates/

# Contenedor Symfony
docker compose exec php php bin/console lint:container
```

#### Para archivos Dart/Flutter
```bash
# Formateo
docker run --rm -v $(pwd):/app -w /app dart dart format --set-exit-if-changed [archivos]

# Análisis
docker run --rm -v $(pwd):/app -w /app dart dart analyze [archivos]

# Pruebas afectadas
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage
```

#### Para archivos Python
```bash
# Linting + formateo
docker compose exec app ruff check [archivos]
docker compose exec app ruff format --check [archivos]

# Tipos
docker compose exec app mypy [archivos]
```

#### Para archivos JS/TS
```bash
# Linting
docker compose exec node npx eslint [archivos]

# Formateo
docker compose exec node npx prettier --check [archivos]

# Tipos (si TypeScript)
docker compose exec node npx tsc --noEmit
```

### Paso 4: Verificaciones Globales

#### Secretos
```bash
# Buscar patrones de secretos
grep -rE "(password|secret|api_key|token)\s*[:=]\s*['\"][^'\"]+['\"]" --include="*.{php,py,ts,js,dart}" .
grep -rE "sk_live_|pk_live_|ghp_|gho_|AKIA" .
```

#### Archivos prohibidos
```bash
# Verificar que no hay archivos sensibles
git diff --cached --name-only | grep -E "\.(env|pem|key|p12)$"
```

#### Tamaño de archivo
```bash
# Archivos > 1MB
find . -type f -size +1M -name "*.{php,py,ts,js,dart}"
```

### Paso 5: Generar Reporte

```
══════════════════════════════════════════════════════════════
🔍 VERIFICACIÓN PRE-COMMIT
══════════════════════════════════════════════════════════════

📁 Archivos verificados: X
📅 Fecha: AAAA-MM-DD HH:MM

──────────────────────────────────────────────────────────────
✅ VERIFICACIONES EXITOSAS
──────────────────────────────────────────────────────────────

✅ Formateo PHP (php-cs-fixer)
✅ Análisis estático PHP (phpstan)
✅ Formateo TypeScript (prettier)
✅ Linting TypeScript (eslint)
✅ Sin secretos detectados

──────────────────────────────────────────────────────────────
⚠️ PROBLEMAS DETECTADOS
──────────────────────────────────────────────────────────────

❌ [PHP] src/Controller/UserController.php:45
   PHPStan: Parameter $id of method __construct() has no type hint

⚠️ [TS] src/components/Button.tsx:12
   ESLint: 'unused' is defined but never used (no-unused-vars)

──────────────────────────────────────────────────────────────
📋 RESUMEN
──────────────────────────────────────────────────────────────

| Categoría | Estado |
|-----------|--------|
| Formateo | ✅ OK |
| Linting   | ⚠️ 1 advertencia |
| Tipos     | ❌ 1 error |
| Secretos   | ✅ OK |

──────────────────────────────────────────────────────────────
🎯 ACCIONES REQUERIDAS
──────────────────────────────────────────────────────────────

1. Corregir error PHPStan en UserController.php
2. (Opcional) Corregir advertencia ESLint

Commit autorizado: ❌ NO (1 error bloqueante)
```

### Opción --fix

Si se pasa `--fix` como argumento:

```bash
# PHP
docker compose exec php vendor/bin/php-cs-fixer fix [archivos]

# Dart
docker run --rm -v $(pwd):/app -w /app dart dart format [archivos]

# Python
docker compose exec app ruff check --fix [archivos]
docker compose exec app ruff format [archivos]

# JS/TS
docker compose exec node npx eslint --fix [archivos]
docker compose exec node npx prettier --write [archivos]
```

## Reglas de Bloqueo

### Bloqueantes (commit prohibido)
- ❌ Errores de sintaxis
- ❌ Errores PHPStan/mypy/tsc
- ❌ Secretos detectados
- ❌ Archivos .env commiteados
- ❌ Claves privadas/certificados

### No bloqueantes (advertencia)
- ⚠️ Problemas de formateo
- ⚠️ Advertencias ESLint
- ⚠️ Cobertura de pruebas disminuida
- ⚠️ TODO/FIXME agregados

## Consejo

Para automatizar, configurar un hook pre-commit:

```bash
# .git/hooks/pre-commit
#!/bin/sh
claude-code "/common:pre-commit-check --staged"
```
