---
description: Auditoría de Testing Symfony
argument-hint: [arguments]
---

# Auditoría de Testing Symfony

## Argumentos

$ARGUMENTS : Ruta del proyecto Symfony a auditar (opcional, por defecto: directorio actual)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Eres un experto en pruebas de software encargado de auditar la estrategia de testing de un proyecto Symfony: pruebas unitarias, de integración, funcionales, cobertura de código y pruebas de mutación.

### Paso 1: Verificación del Entorno de Pruebas

1. Identificar el directorio del proyecto
2. Verificar la presencia de PHPUnit en composer.json
3. Verificar la configuración de PHPUnit (phpunit.xml.dist)
4. Verificar la presencia del directorio tests/

**Referencia a las reglas**: `.claude/rules/symfony-testing.md`

### Paso 2: Estructura de las Pruebas

Analizar la estructura del directorio tests/:

```bash
# Listar la estructura de las pruebas
docker run --rm -v $(pwd):/app php:8.2-cli find /app/tests -type d
```

#### Organización de las Pruebas (3 puntos)

- [ ] Directorio `tests/Unit/` para pruebas unitarias
- [ ] Directorio `tests/Integration/` para pruebas de integración
- [ ] Directorio `tests/Functional/` para pruebas funcionales
- [ ] Estructura espejo de src/ en tests/
- [ ] Namespace correctamente configurado
- [ ] Fixtures en tests/Fixtures/
- [ ] Mocks en tests/Mock/ o en línea
- [ ] Configuración de prueba separada (config/packages/test/)
- [ ] Base de datos de prueba separada
- [ ] Pruebas aisladas e independientes

**Puntos obtenidos**: ___/3

### Paso 3: Pruebas Unitarias

Ejecutar las pruebas unitarias:

```bash
# Ejecutar solo las pruebas unitarias
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Unit --testdox

# Contar las pruebas unitarias
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Unit --list-tests | wc -l
```

#### Pruebas Unitarias del Dominio (7 puntos)

- [ ] Pruebas para todas las Entidades del Dominio
- [ ] Pruebas para todos los Value Objects
- [ ] Pruebas para todos los Servicios de Dominio
- [ ] Pruebas para los Use Cases / Application Services
- [ ] Sin dependencias externas (BD, API, filesystem)
- [ ] Uso de mocks para las dependencias
- [ ] Pruebas de casos límite y errores
- [ ] Pruebas de las validaciones de negocio
- [ ] Retroalimentación rápida (< 1 segundo para todas las pruebas unitarias)
- [ ] Cobertura de las pruebas unitarias > 90%

Número de pruebas unitarias: ___
Tiempo de ejecución: ___ segundos

**Puntos obtenidos**: ___/7

### Paso 4: Pruebas de Integración

Ejecutar las pruebas de integración:

```bash
# Ejecutar las pruebas de integración
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Integration --testdox
```

#### Pruebas de Integración de Infraestructura (5 puntos)

- [ ] Pruebas para todos los Repositorios (con base de datos)
- [ ] Pruebas para los Adaptadores externos (Email, API, etc.)
- [ ] Pruebas para los Event Listeners / Subscribers
- [ ] Pruebas para los Servicios con dependencias de Symfony
- [ ] Uso de base de datos de prueba
- [ ] Rollback o reset después de cada prueba
- [ ] Fixtures para datos de prueba
- [ ] Pruebas de transacciones y restricciones de BD
- [ ] Aislamiento de pruebas (sin orden requerido)
- [ ] Pruebas de casos de error (conexión fallida, etc.)

Número de pruebas de integración: ___
Tiempo de ejecución: ___ segundos

**Puntos obtenidos**: ___/5

### Paso 5: Pruebas Funcionales

Ejecutar las pruebas funcionales:

```bash
# Ejecutar las pruebas funcionales
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Functional --testdox

# Verificar si Behat está instalado
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/vendor/bin/behat && echo "✅ Behat encontrado" || echo "⚠️ Behat ausente"
```

#### Pruebas Funcionales (5 puntos)

- [ ] Pruebas para todas las rutas API/Web importantes
- [ ] Pruebas de los controladores con WebTestCase
- [ ] Pruebas de los formularios
- [ ] Pruebas de autenticaciones y autorizaciones
- [ ] Pruebas de flujos completos (recorridos de usuario)
- [ ] Pruebas con Behat para escenarios de negocio (opcional)
- [ ] Pruebas de respuestas HTTP (códigos, cabeceras, cuerpo)
- [ ] Pruebas de validaciones del lado de la API
- [ ] Pruebas de casos de error (404, 403, 500)
- [ ] Pruebas de redirecciones

Número de pruebas funcionales: ___
Pruebas Behat presentes: [SÍ|NO]

**Puntos obtenidos**: ___/5

### Paso 6: Cobertura de Código

Generar el informe de cobertura:

```bash
# Generar la cobertura de código (requiere xdebug o pcov)
docker run --rm -v $(pwd):/app php:8.2-cli php -d memory_limit=-1 /app/vendor/bin/phpunit --coverage-text --coverage-html=/app/var/coverage

# Mostrar el resumen de cobertura
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit --coverage-text | grep "Lines:"
```

#### Cobertura de Código (5 puntos)

- [ ] Cobertura global ≥ 80%
- [ ] Cobertura del Dominio ≥ 90%
- [ ] Cobertura de la Aplicación ≥ 85%
- [ ] Cobertura de la Infraestructura ≥ 70%
- [ ] Cobertura de ramas (condicionales) ≥ 75%
- [ ] Informe de cobertura generado (HTML)
- [ ] Exclusión explícita del código no testable
- [ ] Sin código crítico sin cobertura
- [ ] Pruebas de excepciones y casos de error
- [ ] Configuración de cobertura en phpunit.xml

Cobertura global: ___%
Cobertura del Dominio: ___%
Cobertura de la Aplicación: ___%
Cobertura de la Infraestructura: ___%

**Puntos obtenidos**: ___/5

Configuración PHPUnit esperada:

```xml
<coverage processUncoveredFiles="true">
    <include>
        <directory suffix=".php">src</directory>
    </include>
    <exclude>
        <directory>src/Kernel.php</directory>
        <directory>src/DataFixtures</directory>
    </exclude>
    <report>
        <html outputDirectory="var/coverage"/>
        <text outputFile="php://stdout" showUncoveredFiles="false"/>
    </report>
</coverage>
```

### Paso 7: Pruebas de Mutación con Infection

Ejecutar las pruebas de mutación:

```bash
# Verificar si Infection está instalado
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/vendor/bin/infection && echo "✅ Infection encontrado" || echo "❌ Infection ausente"

# Ejecutar Infection
docker run --rm -v $(pwd):/app infection/infection --min-msi=70 --min-covered-msi=80 --threads=4
```

#### Pruebas de Mutación (5 puntos)

- [ ] Infection instalado y configurado
- [ ] MSI (Mutation Score Indicator) ≥ 70%
- [ ] Covered MSI ≥ 80%
- [ ] Las pruebas detectan mutaciones en el Dominio
- [ ] Las pruebas detectan mutaciones en la Aplicación
- [ ] Sin mutantes escapados en el código crítico
- [ ] Archivo infection.json presente con configuración
- [ ] Timeout configurado correctamente
- [ ] Exclusiones justificadas en la configuración
- [ ] Informe de mutación generado

MSI: ___%
Covered MSI: ___%
Mutantes eliminados: ___
Mutantes escapados: ___

**Puntos obtenidos**: ___/5

Configuración esperada de Infection (infection.json):

```json
{
    "source": {
        "directories": ["src"]
    },
    "logs": {
        "text": "var/infection.log",
        "html": "var/infection-report.html"
    },
    "mutators": {
        "@default": true
    },
    "minMsi": 70,
    "minCoveredMsi": 80
}
```

### Paso 8: Cálculo de la Puntuación de Testing

**PUNTUACIÓN TESTING**: ___/25 puntos

Detalles:
- Organización de las Pruebas: ___/3
- Pruebas Unitarias del Dominio: ___/7
- Pruebas de Integración de Infraestructura: ___/5
- Pruebas Funcionales: ___/5
- Cobertura de Código: ___/5
- Pruebas de Mutación: ___/5

### Paso 9: Informe Detallado

```
=================================================
   AUDITORÍA DE TESTING SYMFONY
=================================================

📊 PUNTUACIÓN: ___/25

📁 Organización de las Pruebas              : ___/3 [✅|⚠️|❌]
🎯 Pruebas Unitarias del Dominio            : ___/7 [✅|⚠️|❌]
🔌 Pruebas de Integración de Infraestructura: ___/5 [✅|⚠️|❌]
🌐 Pruebas Funcionales                      : ___/5 [✅|⚠️|❌]
📊 Cobertura de Código                      : ___/5 [✅|⚠️|❌]
🦠 Pruebas de Mutación                      : ___/5 [✅|⚠️|❌]

=================================================
   ESTADÍSTICAS GLOBALES
=================================================

Número total de pruebas       : ___
Pruebas unitarias             : ___
Pruebas de integración        : ___
Pruebas funcionales           : ___
Pruebas Behat                 : ___

Tiempo total de ejecución     : ___ segundos
Cobertura global              : ___%
MSI (Mutation Score)          : ___%

=================================================
   COBERTURA POR CAPA
=================================================

Dominio         : ___% [✅|⚠️|❌] (objetivo: 90%)
Aplicación      : ___% [✅|⚠️|❌] (objetivo: 85%)
Infraestructura : ___% [✅|⚠️|❌] (objetivo: 70%)
Presentación    : ___% [✅|⚠️|❌] (objetivo: 70%)

Archivos sin cobertura : ___
Métodos sin cobertura  : ___
Líneas sin cobertura   : ___

=================================================
   PRUEBAS DE MUTACIÓN
=================================================

MSI (Mutation Score)       : ___% [✅|⚠️|❌] (objetivo: 70%)
Covered MSI                : ___% [✅|⚠️|❌] (objetivo: 80%)

Mutantes generados         : ___
Mutantes eliminados        : ___ (detectados por las pruebas)
Mutantes escapados         : ___ (no detectados)
Mutantes timeout           : ___
Mutantes con error         : ___

Archivos con mutantes escapados críticos:
❌ src/Domain/Entity/Order.php - 3 mutantes escapados
❌ src/Application/UseCase/CreateUser.php - 2 mutantes escapados

=================================================
   PROBLEMAS DETECTADOS
=================================================

Pruebas Faltantes:
❌ Sin pruebas para src/Domain/Entity/Invoice.php
❌ Sin pruebas para src/Application/UseCase/ProcessPayment.php
⚠️ Baja cobertura para src/Infrastructure/Repository/OrderRepository.php (45%)

Pruebas Lentas:
⚠️ tests/Integration/RepositoryTest.php - 15s (optimizar con fixtures)
⚠️ tests/Functional/ApiTest.php - 12s (usar cliente HTTP simulado)

Pruebas Inestables (Flaky):
❌ tests/Integration/EmailServiceTest.php - falla a veces
⚠️ tests/Functional/CheckoutTest.php - dependiente del orden de ejecución

Configuración:
❌ Infection no instalado
⚠️ Cobertura de código no configurada en phpunit.xml
❌ Base de datos de prueba no separada

=================================================
   TOP 3 ACCIONES PRIORITARIAS
=================================================

1. 🎯 [ACCIÓN CRÍTICA] - Alcanzar el 80% de cobertura de código
   Impacto: ⭐⭐⭐⭐⭐ | Esfuerzo: 🔥🔥🔥🔥
   - Añadir pruebas para Invoice, ProcessPayment
   - Probar todos los casos de error
   - Probar todas las ramas condicionales

2. 🎯 [ACCIÓN IMPORTANTE] - Instalar y configurar Infection
   Impacto: ⭐⭐⭐⭐ | Esfuerzo: 🔥🔥
   Comando: composer require --dev infection/infection
   Objetivo MSI ≥ 70%

3. 🎯 [ACCIÓN RECOMENDADA] - Separar y optimizar las pruebas
   Impacto: ⭐⭐⭐ | Esfuerzo: 🔥🔥
   - Separar Unit/Integration/Functional
   - Usar base de datos en memoria para las pruebas
   - Optimizar los fixtures

=================================================
   RECOMENDACIONES
=================================================

Instalación de herramientas:
```bash
composer require --dev phpunit/phpunit ^10.0
composer require --dev infection/infection
composer require --dev symfony/test-pack
composer require --dev behat/behat
composer require --dev friends-of-behat/symfony-extension
composer require --dev doctrine/doctrine-fixtures-bundle
```

Configuración phpunit.xml.dist:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="tests/bootstrap.php"
         colors="true">
    <testsuites>
        <testsuite name="unit">
            <directory>tests/Unit</directory>
        </testsuite>
        <testsuite name="integration">
            <directory>tests/Integration</directory>
        </testsuite>
        <testsuite name="functional">
            <directory>tests/Functional</directory>
        </testsuite>
    </testsuites>
    <coverage processUncoveredFiles="true">
        <include>
            <directory suffix=".php">src</directory>
        </include>
    </coverage>
</phpunit>
```

Buenas prácticas:
- Usar factories para crear los objetos de prueba
- Usar builders para los objetos complejos
- Crear aserciones personalizadas reutilizables
- Aislar las pruebas con setUp/tearDown
- Usar data providers para probar múltiples casos
- Simular solo las dependencias externas
- Probar primero el Happy Path, luego los casos de error

CI/CD:
- Ejecutar las pruebas en cada commit
- Bloquear los merges si las pruebas fallan
- Generar y publicar los informes de cobertura
- Ejecutar Infection en las Pull Requests
- Alertar si la cobertura disminuye

=================================================
```

## Comandos Docker Útiles

```bash
# Ejecutar todas las pruebas
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit

# Solo pruebas unitarias
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Unit

# Pruebas con cobertura
docker run --rm -v $(pwd):/app php:8.2-cli php -d xdebug.mode=coverage /app/vendor/bin/phpunit --coverage-text

# Infection (mutation testing)
docker run --rm -v $(pwd):/app infection/infection --threads=4 --min-msi=70

# Behat (pruebas BDD)
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/behat

# Listar todas las pruebas
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit --list-tests

# Ejecutar una prueba específica
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit tests/Unit/Domain/Entity/UserTest.php

# Pruebas con salida detallada
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpunit --testdox
```

## IMPORTANTE

- Usar SIEMPRE Docker para los comandos
- NUNCA almacenar archivos en /tmp (usar var/ del proyecto)
- Proporcionar estadísticas precisas
- Identificar los archivos críticos sin pruebas
- Sugerir pruebas concretas a añadir
