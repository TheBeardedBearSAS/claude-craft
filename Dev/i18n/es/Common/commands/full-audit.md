# Auditoría Completa Multi-Tecnología

Eres un auditor de código experto. Debes realizar una auditoría completa de cumplimiento del proyecto, detectando automáticamente las tecnologías presentes y aplicando las reglas correspondientes.

## Argumentos
$ARGUMENTS

Si no se proporcionan argumentos, detectar automáticamente todas las tecnologías.

## MISIÓN

### Paso 1: Detección de Tecnologías

Escanear el proyecto para identificar tecnologías presentes:

| Archivo | Tecnología |
|---------|-------------|
| `composer.json` + `symfony/*` | Symfony |
| `pubspec.yaml` + `flutter:` | Flutter |
| `pyproject.toml` o `requirements.txt` | Python |
| `package.json` + `react` (sin `react-native`) | React |
| `package.json` + `react-native` | React Native |

Para cada tecnología detectada:
1. Cargar reglas desde `.claude/rules/`
2. Aplicar auditoría específica

### Paso 2: Auditoría por Tecnología

Para CADA tecnología detectada, verificar:

#### Arquitectura (25 puntos)
- [ ] Capas separadas (Dominio/Aplicación/Infraestructura)
- [ ] Dependencias apuntando hacia dentro (hacia dominio)
- [ ] Estructura de carpetas conforme a convenciones
- [ ] Sin acoplamiento de framework en dominio
- [ ] Patrones arquitectónicos respetados

#### Calidad de Código (25 puntos)
- [ ] Estándares de nomenclatura respetados
- [ ] Linting/Analyze sin errores críticos
- [ ] Type hints/anotaciones presentes
- [ ] Clases públicas documentadas
- [ ] Complejidad ciclomática < 10

#### Testing (25 puntos)
- [ ] Cobertura ≥ 80%
- [ ] Pruebas unitarias para dominio
- [ ] Pruebas de integración presentes
- [ ] Pruebas E2E/Widget para UI
- [ ] Pirámide de pruebas respetada

#### Seguridad (25 puntos)
- [ ] Sin secretos en código fuente
- [ ] Validación de entrada en todas las entradas
- [ ] Protecciones OWASP (XSS, CSRF, inyección)
- [ ] Datos sensibles cifrados
- [ ] Dependencias sin vulnerabilidades conocidas

### Paso 3: Ejecutar Herramientas

```bash
# Symfony
docker compose exec php php bin/console lint:container
docker compose exec php vendor/bin/phpstan analyse
docker compose exec php vendor/bin/phpunit --coverage-text

# Flutter
docker run --rm -v $(pwd):/app -w /app dart dart analyze
docker run --rm -v $(pwd):/app -w /app dart flutter test --coverage

# Python
docker compose exec app ruff check .
docker compose exec app mypy .
docker compose exec app pytest --cov

# React/React Native
docker compose exec node npm run lint
docker compose exec node npm run test -- --coverage
```

### Paso 4: Calcular Puntuaciones

Para cada tecnología, calcular:
- Puntuación Arquitectura: X/25
- Puntuación Calidad Código: X/25
- Puntuación Testing: X/25
- Puntuación Seguridad: X/25
- **Puntuación Total: X/100**

### Paso 5: Generar Reporte

```
══════════════════════════════════════════════════════════════
📊 AUDITORÍA MULTI-TECNOLOGÍA - Puntuación Global: XX/100
══════════════════════════════════════════════════════════════

Tecnologías detectadas: [lista]
Fecha: AAAA-MM-DD

──────────────────────────────────────────────────────────────
🔷 SYMFONY - Puntuación: XX/100
──────────────────────────────────────────────────────────────

🏗️ Arquitectura (XX/25)
  ✅ Arquitectura Limpia respetada
  ✅ CQRS implementado correctamente
  ⚠️ 2 servicios acceden directamente a Repository

📝 Calidad de Código (XX/25)
  ✅ PHPStan nivel 8 - 0 errores
  ✅ Convenciones PSR-12 respetadas
  ⚠️ 5 métodos > 20 líneas

🧪 Testing (XX/25)
  ✅ Cobertura: 85%
  ✅ Pruebas unitarias de dominio
  ⚠️ Sin pruebas E2E Panther

🔒 Seguridad (XX/25)
  ✅ Sin secretos en código
  ✅ CSRF habilitado
  ⚠️ Dependencia con CVE menor

──────────────────────────────────────────────────────────────
🔷 FLUTTER - Puntuación: XX/100
──────────────────────────────────────────────────────────────

[Misma estructura]

══════════════════════════════════════════════════════════════
📋 RESUMEN GLOBAL
══════════════════════════════════════════════════════════════

| Tecnología | Arquitectura | Código | Pruebas | Seguridad | Total |
|-------------|--------------|------|-------|----------|-------|
| Symfony     | XX/25        | XX/25| XX/25 | XX/25    | XX/100|
| Flutter     | XX/25        | XX/25| XX/25 | XX/25    | XX/100|
| PROMEDIO    | XX/25        | XX/25| XX/25 | XX/25    | XX/100|

══════════════════════════════════════════════════════════════
🎯 TOP 5 ACCIONES PRIORITARIAS
══════════════════════════════════════════════════════════════

1. [CRÍTICO] Descripción acción 1
   → Impacto: +X puntos | Esfuerzo: Bajo/Medio/Alto

2. [ALTO] Descripción acción 2
   → Impacto: +X puntos | Esfuerzo: Bajo/Medio/Alto

3. [MEDIO] Descripción acción 3
   → Impacto: +X puntos | Esfuerzo: Bajo/Medio/Alto

4. [MEDIO] Descripción acción 4
   → Impacto: +X puntos | Esfuerzo: Bajo/Medio/Alto

5. [BAJO] Descripción acción 5
   → Impacto: +X puntos | Esfuerzo: Bajo/Medio/Alto
```

## Reglas de Puntuación

### Deducciones por Categoría

| Violación | Puntos Perdidos |
|-----------|---------------|
| Patrón arquitectónico violado | -5 |
| Acoplamiento framework/dominio | -3 |
| Error crítico de linting | -2 |
| Advertencia de linting | -1 |
| Método > 30 líneas | -1 |
| Cobertura < 80% | -5 |
| Sin pruebas unitarias de dominio | -5 |
| Secreto en código | -10 |
| Vulnerabilidad CVE crítica | -10 |
| Vulnerabilidad CVE alta | -5 |

### Umbrales de Calidad

| Puntuación | Evaluación |
|-------|------------|
| 90-100 | Excelente |
| 75-89 | Bueno |
| 60-74 | Aceptable |
| 40-59 | Necesita mejora |
| < 40 | Crítico |
