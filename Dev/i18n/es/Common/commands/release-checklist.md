# Lista de Verificación de Release

Eres un Release Manager experto. Debes guiar al equipo a través de todos los pasos de un release de calidad, verificando cada punto crítico.

## Argumentos
$ARGUMENTS

Argumentos:
- Versión (ej: `1.2.0`, `2.0.0-beta.1`)
- Tipo (patch, minor, major)

Ejemplo: `/common:release-checklist 1.2.0 minor`

## MISIÓN

### Paso 1: Validación Pre-Release

#### 1.1 Estado del Código
```bash
# Verificar en rama correcta
git branch --show-current  # Debe ser main/master o release/*

# Verificar sin cambios sin commit
git status

# Verificar que todas las pruebas pasan
# [Ejecutar pruebas según tecnología]
```

#### 1.2 Changelog
```bash
# Verificar CHANGELOG.md actualizado
cat CHANGELOG.md | head -50

# Generar changelog desde último tag
git log $(git describe --tags --abbrev=0)..HEAD --pretty=format:"- %s"
```

#### 1.3 Archivos de Versión
```bash
# Verificar/actualizar archivos de versión
# PHP: composer.json
# Python: pyproject.toml, __version__.py
# Node: package.json
# Flutter: pubspec.yaml
# iOS: Info.plist
# Android: build.gradle
```

### Paso 2: Pruebas Exhaustivas

```bash
# Pruebas unitarias
# Pruebas de integración
# Pruebas E2E
# Pruebas de rendimiento
# Pruebas de seguridad
```

### Paso 3: Documentación

```bash
# Verificar documentación
# - README actualizado
# - Docs API generadas
# - Guía de migración (si hay cambios breaking)
```

### Paso 4: Generar Lista de Verificación Interactiva

```
══════════════════════════════════════════════════════════════
🚀 LISTA DE VERIFICACIÓN RELEASE - v{VERSION}
══════════════════════════════════════════════════════════════

Tipo: {TYPE} (patch/minor/major)
Fecha: AAAA-MM-DD
Rama: main

══════════════════════════════════════════════════════════════
📋 PRE-RELEASE
══════════════════════════════════════════════════════════════

## Calidad de Código
- [ ] Todas las pruebas pasan (unit, integration, e2e)
- [ ] Cobertura de pruebas ≥ 80%
- [ ] Análisis estático sin errores
- [ ] Code review completado en todos los PRs
- [ ] Sin TODO/FIXME bloqueantes

## Seguridad
- [ ] Auditoría de dependencias (sin CVEs críticos)
- [ ] Sin secretos en código
- [ ] Pruebas de seguridad pasadas (OWASP)
- [ ] Certificados SSL válidos

## Documentación
- [ ] CHANGELOG.md actualizado
- [ ] README.md actualizado
- [ ] Documentación API generada
- [ ] Guía de migración (si hay cambios breaking)
- [ ] Notas de release escritas

## Versionado
- [ ] Número de versión incrementado
- [ ] Tags git preparados
- [ ] Ramas de release creadas (si aplica)

══════════════════════════════════════════════════════════════
📦 BUILD & PACKAGE
══════════════════════════════════════════════════════════════

## Backend
- [ ] Build de producción exitoso
- [ ] Assets compilados y minificados
- [ ] Migraciones BD preparadas
- [ ] Variables de entorno documentadas

## Frontend Web
- [ ] Bundle optimizado (code splitting, tree shaking)
- [ ] Assets listos para CDN
- [ ] Service worker actualizado
- [ ] Sourcemaps generados (pero no desplegados a prod)

## Mobile (si aplica)
- [ ] Build iOS firmado
- [ ] Build Android firmado
- [ ] Screenshots de tienda actualizados
- [ ] Metadata de tienda lista

══════════════════════════════════════════════════════════════
🔧 VALIDACIÓN EN STAGING
══════════════════════════════════════════════════════════════

- [ ] Despliegue en staging exitoso
- [ ] Migraciones BD ejecutadas exitosamente
- [ ] Pruebas manuales de humo OK
- [ ] Pruebas de regresión pasadas
- [ ] Rendimiento aceptable (< umbrales definidos)
- [ ] Monitoreo funciona (logs, métricas)
- [ ] Rollback probado

══════════════════════════════════════════════════════════════
🚀 DESPLIEGUE EN PRODUCCIÓN
══════════════════════════════════════════════════════════════

## Pre-Deploy
- [ ] Modo mantenimiento activado (si necesario)
- [ ] Backup de base de datos realizado
- [ ] Comunicación a equipo de soporte
- [ ] Ventana de despliegue validada

## Deploy
- [ ] Despliegue en producción lanzado
- [ ] Migraciones BD ejecutadas
- [ ] Health checks pasan
- [ ] Modo mantenimiento desactivado

## Post-Deploy
- [ ] Pruebas de humo en producción OK
- [ ] Monitoreo verificado (sin errores)
- [ ] Rendimiento nominal
- [ ] Tag git creado y pusheado
- [ ] Release GitHub/GitLab creado

══════════════════════════════════════════════════════════════
📢 COMUNICACIÓN
══════════════════════════════════════════════════════════════

- [ ] Notas de release publicadas
- [ ] Equipo de soporte informado
- [ ] Clientes notificados (si aplica)
- [ ] Documentación pública actualizada
- [ ] Anuncio blog/redes sociales (si aplica)

══════════════════════════════════════════════════════════════
🔙 PLAN DE ROLLBACK
══════════════════════════════════════════════════════════════

En caso de problema crítico:

1. Identificar problema
   - Logs: [URL monitoreo]
   - Alertas: [URL alerting]

2. Decisión de rollback
   - Umbral: > 5% errores 5xx por 5 min
   - Decisor: [Nombre]

3. Ejecutar rollback
   ```bash
   # Comando de rollback
   [Adaptar según infraestructura]
   ```

4. Rollback BD (si necesario)
   ```bash
   # Migraciones down
   [Adaptar según ORM]
   ```

5. Comunicación
   - Notificar equipo
   - Abrir incidente
   - Post-mortem

══════════════════════════════════════════════════════════════
✅ VALIDACIÓN FINAL
══════════════════════════════════════════════════════════════

[ ] Todas las casillas marcadas
[ ] Release validado por: _______________
[ ] Fecha/hora release: _______________

Notas:
_________________________________________________
_________________________________________________
```

## Comandos Útiles

```bash
# Crear tag
git tag -a v{VERSION} -m "Release v{VERSION}"
git push origin v{VERSION}

# Crear release GitHub
gh release create v{VERSION} --title "v{VERSION}" --notes-file RELEASE_NOTES.md

# Generar changelog automático
git-cliff --unreleased --tag v{VERSION} > CHANGELOG.md
```

## Recordatorio Semantic Versioning

| Tipo | Cuándo | Ejemplo |
|------|-------|---------|
| MAJOR | Cambios breaking | 1.0.0 → 2.0.0 |
| MINOR | Nueva funcionalidad | 1.0.0 → 1.1.0 |
| PATCH | Corrección de bug | 1.0.0 → 1.0.1 |
