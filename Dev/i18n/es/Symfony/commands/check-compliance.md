---
description: Auditoría Completa de Cumplimiento Symfony
argument-hint: [arguments]
---

# Auditoría Completa de Cumplimiento Symfony

## Argumentos

$ARGUMENTS : Ruta del proyecto Symfony a auditar (opcional, por defecto: directorio actual)

## MISIÓN

Eres un auditor experto de Symfony encargado de realizar una auditoría completa de cumplimiento de un proyecto Symfony.

### Paso 1: Verificación del proyecto

1. Identifica el directorio del proyecto a auditar
2. Verifica que se trata de un proyecto Symfony (presencia de composer.json con symfony/*)
3. Verifica la versión de Symfony utilizada

### Paso 2: Auditoría de Arquitectura (25 puntos)

Ejecuta la auditoría de arquitectura verificando:

**Referencia a las reglas**: `.claude/rules/symfony-architecture.md`

- [ ] La estructura de carpetas respeta Clean Architecture
- [ ] Separación Domain / Application / Infrastructure
- [ ] Respeto de los principios DDD (Entities, Value Objects, Aggregates)
- [ ] Arquitectura Hexagonal (Ports & Adapters)
- [ ] Uso de Deptrac para verificar las dependencias
- [ ] Ausencia de acoplamiento entre capas
- [ ] Interfaces correctamente definidas para los puertos
- [ ] Use Cases / Application Services bien definidos
- [ ] Repositories con interfaces en el domain
- [ ] DTOs para las transferencias de datos

**Puntuación Arquitectura**: ___/25 puntos

### Paso 3: Auditoría de Calidad del Código (25 puntos)

Ejecuta la auditoría de calidad del código verificando:

**Referencia a las reglas**: `.claude/rules/symfony-code-quality.md`

- [ ] Respeto de PSR-12
- [ ] PHPStan nivel 9 sin errores
- [ ] Type hints estrictos en todos los parámetros y retornos
- [ ] Declaración `declare(strict_types=1)` en todos los archivos
- [ ] Sin código muerto (detectado por PHPStan)
- [ ] Sin dependencias no utilizadas
- [ ] Complejidad ciclomática < 10 por método
- [ ] Longitud de métodos < 20 líneas
- [ ] Clases con responsabilidad única
- [ ] Documentación PHPDoc completa y actualizada

**Puntuación Calidad del Código**: ___/25 puntos

### Paso 4: Auditoría de Testing (25 puntos)

Ejecuta la auditoría de tests verificando:

**Referencia a las reglas**: `.claude/rules/symfony-testing.md`

- [ ] Cobertura de código ≥ 80%
- [ ] Tests unitarios para el Domain
- [ ] Tests de integración para la Infrastructure
- [ ] Tests funcionales con Behat o Symfony WebTestCase
- [ ] Tests de mutación con Infection (MSI ≥ 70%)
- [ ] Fixtures para los tests
- [ ] Tests aislados (sin dependencias entre tests)
- [ ] Base de datos de test separada
- [ ] Mocks y Stubs apropiados
- [ ] CI/CD con ejecución automática de tests

**Puntuación Testing**: ___/25 puntos

### Paso 5: Auditoría de Seguridad (25 puntos)

Ejecuta la auditoría de seguridad verificando:

**Referencia a las reglas**: `.claude/rules/symfony-security.md`

- [ ] Symfony Security Bundle correctamente configurado
- [ ] OWASP Top 10: Protección contra inyección SQL
- [ ] OWASP Top 10: Protección XSS
- [ ] OWASP Top 10: Protección CSRF
- [ ] OWASP Top 10: Autenticación segura
- [ ] OWASP Top 10: Control de acceso (Voters, ACL)
- [ ] RGPD: Consentimiento del usuario
- [ ] RGPD: Derecho al olvido implementado
- [ ] RGPD: Exportación de datos personales
- [ ] Secrets externalizados (no en el código)

**Puntuación Seguridad**: ___/25 puntos

### Paso 6: Cálculo de la Puntuación Global

**PUNTUACIÓN GLOBAL**: ___/100 puntos

Interpretación:
- ✅ 90-100: Excelente - Cumplimiento ejemplar
- ✅ 75-89: Bueno - Algunas mejoras menores
- ⚠️ 60-74: Medio - Mejoras necesarias
- ⚠️ 40-59: Insuficiente - Refactoring importante requerido
- ❌ 0-39: Crítico - Refactorización completa necesaria

### Paso 7: Informe Detallado

Genera un informe estructurado con:

```
=================================================
   AUDITORÍA DE CUMPLIMIENTO SYMFONY
=================================================

📊 PUNTUACIÓN GLOBAL: ___/100

📐 Arquitectura        : ___/25 [✅|⚠️|❌]
🎯 Calidad del Código  : ___/25 [✅|⚠️|❌]
🧪 Testing             : ___/25 [✅|⚠️|❌]
🔒 Seguridad           : ___/25 [✅|⚠️|❌]

=================================================
   DETALLES POR CATEGORÍA
=================================================

[Insertar los detalles de cada auditoría]

=================================================
   TOP 3 ACCIONES PRIORITARIAS
=================================================

1. [Acción prioritaria #1 con impacto estimado]
2. [Acción prioritaria #2 con impacto estimado]
3. [Acción prioritaria #3 con impacto estimado]

=================================================
   RECOMENDACIONES TÉCNICAS
=================================================

- [Recomendación técnica específica]
- [Recomendación técnica específica]
- [Recomendación técnica específica]

=================================================
```

### Paso 8: Comandos Docker para Verificaciones

Para cada verificación, utiliza Docker para abstraerse del entorno local:

```bash
# PHPStan
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=9

# PHP_CodeSniffer (PSR-12)
docker run --rm -v $(pwd):/project php:8.2-cli vendor/bin/phpcs --standard=PSR12 src/

# PHPUnit con cobertura
docker run --rm -v $(pwd):/app php:8.2-cli vendor/bin/phpunit --coverage-text --coverage-html=coverage

# Infection (mutation testing)
docker run --rm -v $(pwd):/app infection/infection --min-msi=70

# Deptrac
docker run --rm -v $(pwd):/app qossmic/deptrac analyse
```

## IMPORTANTE

- Utiliza SIEMPRE Docker para los comandos para abstraerse del entorno local
- NO almacenes NUNCA archivos en /tmp
- Proporciona ejemplos concretos de problemas detectados
- Prioriza las acciones según el impacto y el esfuerzo
- Sé factual y objetivo en la evaluación
