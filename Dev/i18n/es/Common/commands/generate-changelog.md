---
description: Generación Automática de Changelog
argument-hint: [arguments]
---

# Generación Automática de Changelog

Eres un asistente de documentación. Debes analizar commits de git y generar un changelog formateado siguiendo las convenciones de Conventional Commits y Keep a Changelog.

## Argumentos
$ARGUMENTS

Argumentos:
- Versión objetivo (ej: `1.2.0`)
- Desde (tag anterior, predeterminado: último tag)

Ejemplo: `/bear-common:generate-changelog 1.2.0 v1.1.0`

## MISIÓN

### Paso 1: Recuperar Commits

```bash
# Identificar último tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

# Listar commits desde último tag
if [ -z "$LAST_TAG" ]; then
    git log --pretty=format:"%H|%s|%an|%ad" --date=short
else
    git log ${LAST_TAG}..HEAD --pretty=format:"%H|%s|%an|%ad" --date=short
fi
```

### Paso 2: Parsear Commits (Conventional Commits)

Formato esperado: `type(scope): description`

| Tipo | Categoría Changelog |
|------|---------------------|
| feat | Added |
| fix | Fixed |
| docs | Documentation |
| style | (ignorado) |
| refactor | Changed |
| perf | Performance |
| test | (ignorado) |
| chore | (ignorado) |
| build | Build |
| ci | (ignorado) |
| revert | Removed |
| BREAKING CHANGE | Breaking Changes |

### Paso 3: Analizar PRs (si disponibles)

```bash
# Recuperar PRs fusionados
gh pr list --state merged --base main --json number,title,labels,author
```

### Paso 4: Generar Changelog

Formato Keep a Changelog:

```markdown
# Changelog

Todos los cambios notables de este proyecto se documentarán en este archivo.

El formato está basado en [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
y este proyecto adhiere a [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [{VERSION}] - {FECHA}

### Breaking Changes
- **{scope}**: {descripción} ({autor}) - #{PR}

### Added
- **{scope}**: {descripción} ({autor}) - #{PR}
- **{scope}**: {descripción} ({autor}) - #{PR}

### Changed
- **{scope}**: {descripción} ({autor}) - #{PR}

### Deprecated
- **{scope}**: {descripción} ({autor}) - #{PR}

### Removed
- **{scope}**: {descripción} ({autor}) - #{PR}

### Fixed
- **{scope}**: {descripción} ({autor}) - #{PR}

### Security
- **{scope}**: {descripción} ({autor}) - #{PR}

### Performance
- **{scope}**: {descripción} ({autor}) - #{PR}

## [{PREVIOUS_VERSION}] - {FECHA}
...

[Unreleased]: https://github.com/{owner}/{repo}/compare/v{VERSION}...HEAD
[{VERSION}]: https://github.com/{owner}/{repo}/compare/v{PREVIOUS_VERSION}...v{VERSION}
```

### Paso 5: Ejemplo de Salida

```markdown
## [1.2.0] - 2024-01-15

### Breaking Changes
- **api**: Cambiado autenticación de sesión a JWT (#123) - @john

### Added
- **auth**: Agregar soporte login social OAuth2 (#145) - @jane
- **users**: Agregar carga de foto de perfil usuario (#142) - @john
- **dashboard**: Agregar notificaciones en tiempo real (#138) - @alice

### Changed
- **api**: Actualizar API Platform a v3.2 (#150) - @bob
- **ui**: Migrar a TailwindCSS v3 (#148) - @jane

### Fixed
- **auth**: Corregir email de restablecimiento contraseña no enviado (#141) - @john
- **orders**: Corregir cálculo de total con descuentos (#139) - @alice
- **mobile**: Corregir crash en iOS 17 (#137) - @bob

### Security
- **deps**: Actualizar symfony/http-kernel para CVE-2024-1234 (#146) - @security-bot

### Performance
- **api**: Agregar caché Redis para sesiones usuario (#144) - @alice
- **db**: Optimizar consultas N+1 en lista órdenes (#140) - @bob

---

**Changelog Completo**: https://github.com/org/repo/compare/v1.1.0...v1.2.0

### Colaboradores
- @john (4 commits)
- @jane (3 commits)
- @alice (3 commits)
- @bob (3 commits)

### Estadísticas
- Commits: 13
- Archivos cambiados: 87
- Líneas agregadas: +2,345
- Líneas eliminadas: -876
```

### Paso 6: Acciones Sugeridas

```
══════════════════════════════════════════════════════════════
📝 CHANGELOG GENERADO
══════════════════════════════════════════════════════════════

Versión: 1.2.0
Período: 2024-01-01 → 2024-01-15
Commits analizados: 13

──────────────────────────────────────────────────────────────
📊 RESUMEN POR CATEGORÍA
──────────────────────────────────────────────────────────────

| Categoría | Cantidad |
|-----------|--------|
| Added | 3 |
| Changed | 2 |
| Fixed | 3 |
| Security | 1 |
| Performance | 2 |
| Breaking | 1 |

──────────────────────────────────────────────────────────────
⚠️ PUNTOS DE ATENCIÓN
──────────────────────────────────────────────────────────────

1. ⚠️ BREAKING CHANGE detectado - ¿requiere versión MAJOR?
2. 🔒 1 corrección de seguridad - mencionar en notas release
3. 📝 5 commits sin formato convencional (a mejorar)

──────────────────────────────────────────────────────────────
🎯 PRÓXIMOS PASOS
──────────────────────────────────────────────────────────────

1. Verificar y editar changelog generado
2. Crear o actualizar archivo CHANGELOG.md
3. Commit: git commit -am "docs: actualizar changelog para v1.2.0"
4. Crear tag: git tag -a v1.2.0 -m "Release v1.2.0"
```

## Comandos Asociados

```bash
# Guardar el changelog
# El contenido se mostrará, puedes copiarlo a CHANGELOG.md

# Herramientas recomendadas para automatización
# - git-cliff: https://github.com/orhun/git-cliff
# - conventional-changelog: https://github.com/conventional-changelog/conventional-changelog
# - release-please: https://github.com/googleapis/release-please
```

## Recordatorio Conventional Commits

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]

# Tipos estándar
feat:     Nueva funcionalidad
fix:      Corrección de bug
docs:     Solo documentación
style:    Formateo (sin cambio código)
refactor: Refactorización (sin nueva funcionalidad o corrección)
perf:     Mejora de rendimiento
test:     Agregar/modificar pruebas
chore:    Mantenimiento (deps, config, etc.)
build:    Sistema build, deps externas
ci:       Configuración CI/CD
revert:   Revertir commit anterior

# Cambio breaking
feat!: descripción
# o
feat: descripción

BREAKING CHANGE: explicación del cambio breaking
```
