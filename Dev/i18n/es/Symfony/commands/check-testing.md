---
description: Auditoría de Testing Symfony
argument-hint: [arguments]
---

# Auditoría de Testing Symfony

## Argumentos

$ARGUMENTS : Ruta del proyecto Symfony a auditar (opcional, por defecto: directorio actual)

## MISIÓN

Eres un experto en tests de software encargado de auditar la estrategia de testing de un proyecto Symfony: tests unitarios, de integración, funcionales, cobertura de código y tests de mutación.

### Paso 1: Verificación del Entorno de Test

1. Identifica el directorio del proyecto
2. Verifica la presencia de PHPUnit en composer.json
3. Verifica la configuración de PHPUnit (phpunit.xml.dist)
4. Verifica la presencia de la carpeta tests/

**Referencia a las reglas**: `.claude/rules/symfony-testing.md`

### Paso 2: Estructura de Tests

Analiza la estructura de la carpeta tests/:

```bash
# Listar la estructura de tests
docker run --rm -v $(pwd):/app php:8.2-cli find /app/tests -type d
```

#### Organización de Tests (3 puntos)

- [ ] Carpeta `tests/Unit/` para tests unitarios
- [ ] Carpeta `tests/Integration/` para tests de integración
- [ ] Carpeta `tests/Functional/` para tests funcionales
- [ ] Estructura espejo de src/ en tests/
- [ ] Namespace correctamente configurado
- [ ] Fixtures en tests/Fixtures/
- [ ] Mocks en tests/Mock/ o inline
- [ ] Configuración de test separada (config/packages/test/)
- [ ] Base de datos de test separada
- [ ] Tests aislados e independientes

**Puntos obtenidos**: ___/3

### Paso 3: Tests Unitarios

Ejecuta los tests unitarios:

```bash
# Ejecutar tests unitarios únicamente
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Unit --testdox

# Contar tests unitarios
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Unit --list-tests | wc -l
```

#### Tests Unitarios Domain (7 puntos)

- [ ] Tests para todas las Entities del Domain
- [ ] Tests para todos los Value Objects
- [ ] Tests para todos los Domain Services
- [ ] Tests para los Use Cases / Application Services
- [ ] Sin dependencias externas (BD, API, filesystem)
- [ ] Uso de mocks para las dependencias
- [ ] Tests de casos límite y errores
- [ ] Tests de validaciones de negocio
- [ ] Fast feedback (< 1 segundo para todos los tests unitarios)
- [ ] Cobertura de tests unitarios > 90%

Número de tests unitarios: ___
Tiempo de ejecución: ___ segundos

**Puntos obtenidos**: ___/7

### Paso 4: Tests de Integración

Ejecuta los tests de integración:

```bash
# Ejecutar tests de integración
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Integration --testdox
```

#### Tests de Integración Infrastructure (5 puntos)

- [ ] Tests para todos los Repositories (con base de datos)
- [ ] Tests para los Adapters externos (Email, API, etc.)
- [ ] Tests para los Event Listeners / Subscribers
- [ ] Tests para los Services con dependencias Symfony
- [ ] Uso de base de datos de test
- [ ] Rollback o reset después de cada test
- [ ] Fixtures para datos de test
- [ ] Tests de transacciones y restricciones BD
- [ ] Aislamiento de tests (sin orden requerido)
- [ ] Tests de casos de error (conexión fallida, etc.)

Número de tests de integración: ___
Tiempo de ejecución: ___ segundos

**Puntos obtenidos**: ___/5

### Paso 5: Tests Funcionales

Ejecuta los tests funcionales:

```bash
# Ejecutar tests funcionales
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Functional --testdox

# Verificar si Behat está instalado
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/vendor/bin/behat && echo "✅ Behat encontrado" || echo "⚠️ Behat faltante"
```

#### Tests Funcionales (5 puntos)

- [ ] Tests para todas las rutas API/Web importantes
- [ ] Tests de controllers con WebTestCase
- [ ] Tests de formularios
- [ ] Tests de autenticaciones y autorizaciones
- [ ] Tests de workflows completos (recorrido de usuario)
- [ ] Tests con Behat para escenarios de negocio (opcional)
- [ ] Tests de respuestas HTTP (códigos, headers, body)
- [ ] Tests de validaciones del lado API
- [ ] Tests de casos de error (404, 403, 500)
- [ ] Tests de redirecciones

Número de tests funcionales: ___
Tests Behat presentes: [SÍ|NO]

**Puntos obtenidos**: ___/5

### Paso 6: Cobertura de Código

Genera el informe de cobertura:

```bash
# Generar cobertura de código (requiere xdebug o pcov)
docker run --rm -v $(pwd):/app php:8.2-cli php -d memory_limit=-1 /app/vendor/bin/phpunit --coverage-text --coverage-html=/app/var/coverage

# Mostrar resumen de cobertura
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit --coverage-text | grep "Lines:"
```

#### Cobertura de Código (5 puntos)

- [ ] Cobertura global ≥ 80%
- [ ] Cobertura Domain ≥ 90%
- [ ] Cobertura Application ≥ 85%
- [ ] Cobertura Infrastructure ≥ 70%
- [ ] Cobertura de branches (condicionales) ≥ 75%
- [ ] Informe de cobertura generado (HTML)
- [ ] Exclusión explícita del código no testeable
- [ ] Sin código crítico no cubierto
- [ ] Tests de excepciones y casos de error
- [ ] Configuración de cobertura en phpunit.xml

Cobertura global: ___%
Cobertura Domain: ___%
Cobertura Application: ___%
Cobertura Infrastructure: ___%

**Puntos obtenidos**: ___/5

### Paso 7: Tests de Mutación con Infection

Ejecuta los tests de mutación:

```bash
# Verificar si Infection está instalado
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/vendor/bin/infection && echo "✅ Infection encontrado" || echo "❌ Infection faltante"

# Ejecutar Infection
docker run --rm -v $(pwd):/app infection/infection --min-msi=70 --min-covered-msi=80 --threads=4
```

#### Tests de Mutación (5 puntos)

- [ ] Infection instalado y configurado
- [ ] MSI (Mutation Score Indicator) ≥ 70%
- [ ] Covered MSI ≥ 80%
- [ ] Tests detectan mutaciones en Domain
- [ ] Tests detectan mutaciones en Application
- [ ] Sin mutantes escapados en el código crítico
- [ ] Configuración infection.json presente
- [ ] Timeout configurado correctamente
- [ ] Exclusiones justificadas en config
- [ ] Informe de mutación generado

MSI: ___%
Covered MSI: ___%
Mutantes eliminados: ___
Mutantes escapados: ___

**Puntos obtenidos**: ___/5

### Paso 8: Cálculo de la Puntuación Testing

**PUNTUACIÓN TESTING**: ___/25 puntos

Detalles:
- Organización de Tests: ___/3
- Tests Unitarios Domain: ___/7
- Tests de Integración Infrastructure: ___/5
- Tests Funcionales: ___/5
- Cobertura de Código: ___/5
- Tests de Mutación: ___/5

## Comandos Docker Útiles

```bash
# Ejecutar todos los tests
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit

# Tests unitarios únicamente
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Unit

# Tests con cobertura
docker run --rm -v $(pwd):/app php:8.2-cli php -d xdebug.mode=coverage /app/vendor/bin/phpunit --coverage-text

# Infection (mutation testing)
docker run --rm -v $(pwd):/app infection/infection --threads=4 --min-msi=70

# Behat (tests BDD)
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/behat

# Listar todos los tests
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit --list-tests

# Ejecutar un test específico
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Unit/Domain/Entity/UserTest.php

# Tests con salida detallada
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit --testdox
```

## IMPORTANTE

- Utiliza SIEMPRE Docker para los comandos
- NO almacenes NUNCA archivos en /tmp (usar var/ del proyecto)
- Proporciona estadísticas precisas
- Identifica archivos críticos sin tests
- Sugiere tests concretos a añadir
