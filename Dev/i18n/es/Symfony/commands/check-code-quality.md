---
description: Auditoría de Calidad del Código Symfony
argument-hint: [arguments]
---

# Auditoría de Calidad del Código Symfony

## Argumentos

$ARGUMENTS: Ruta del proyecto Symfony a auditar (opcional, por defecto: directorio actual)

## MISIÓN

Eres un experto en calidad de software encargado de auditar la calidad del código de un proyecto Symfony según los estándares PSR-12, PHPStan nivel 9 y las mejores prácticas PHP modernas.

### Paso 1: Verificación del Entorno

1. Identifica el directorio del proyecto
2. Verifica la presencia de las herramientas de calidad en composer.json
3. Verifica la versión de PHP utilizada

**Referencia a las reglas**: `.claude/rules/symfony-code-quality.md`

### Paso 2: Verificación PSR-12

Ejecuta PHP_CodeSniffer para verificar el respeto de PSR-12:

```bash
# Verificar si phpcs está instalado
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/vendor/bin/phpcs && echo "✅ phpcs encontrado" || echo "❌ phpcs faltante"

# Ejecutar phpcs
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpcs --standard=PSR12 src/ --report=summary
```

#### Estándares PSR-12 (5 puntos)

- [ ] Indentación con 4 espacios (no tabs)
- [ ] Longitud de línea ≤ 120 caracteres
- [ ] Llaves en nuevas líneas para clases y métodos
- [ ] Use statements ordenados alfabéticamente
- [ ] No hay espacios al final de línea
- [ ] Los archivos terminan con una línea vacía
- [ ] Declaración `declare(strict_types=1)` después del tag PHP
- [ ] Una clase por archivo
- [ ] Namespace corresponde a la arborescencia
- [ ] Nomenclatura camelCase para métodos, PascalCase para clases

**Puntos obtenidos**: ___/5

### Paso 3: Análisis Estático con PHPStan

Ejecuta PHPStan al nivel 9:

```bash
# Verificar si PHPStan está instalado
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/vendor/bin/phpstan && echo "✅ PHPStan encontrado" || echo "❌ PHPStan faltante"

# Ejecutar PHPStan nivel 9
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=9 --error-format=table
```

#### PHPStan Nivel 9 (10 puntos)

- [ ] Ningún error PHPStan nivel 9
- [ ] Todos los tipos de retorno declarados
- [ ] Todos los parámetros tipados
- [ ] No hay tipos mixed
- [ ] No hay código muerto detectado
- [ ] No hay variables no definidas
- [ ] No hay propiedades no definidas
- [ ] No hay métodos no definidos
- [ ] Genéricos correctamente utilizados (templates PHPDoc)
- [ ] Nullabilidad explícita (? o union types)

**Puntos obtenidos**: ___/10

Configuración PHPStan esperada en `phpstan.neon`:

```neon
parameters:
    level: 9
    paths:
        - src
    excludePaths:
        - src/Kernel.php
    checkMissingIterableValueType: true
    checkGenericClassInNonGenericObjectType: true
    reportUnmatchedIgnoredErrors: true
```

### Paso 4: Type Hints y Strict Types

Verifica el uso estricto de tipos:

```bash
# Verificar declare(strict_types=1)
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "declare(strict_types=1)" /app/src --include="*.php" | wc -l

# Contar el número de archivos PHP
docker run --rm -v $(pwd):/app php:8.2-cli find /app/src -name "*.php" | wc -l

# Los dos números deben ser idénticos
```

#### Type Hints Estrictos (5 puntos)

- [ ] `declare(strict_types=1)` en 100% de los archivos PHP
- [ ] Type hints en todos los parámetros de métodos públicos
- [ ] Type hints en todos los retornos de métodos públicos
- [ ] Type hints en todas las propiedades de clase (PHP 7.4+)
- [ ] Uso de union types (PHP 8.0+) en lugar de mixed
- [ ] No hay docblock @param/@return redundantes con los tipos nativos
- [ ] Uso de readonly para propiedades inmutables (PHP 8.1+)
- [ ] No hay supresión de errores con @phpstan-ignore
- [ ] Tipos estrictos en los arrays: array<string, int>
- [ ] Uso del tipo never para métodos que nunca retornan (PHP 8.1+)

**Puntos obtenidos**: ___/5

### Paso 5: Complejidad y Mantenibilidad

Analiza la complejidad del código:

```bash
# Instalar phpmetrics si es necesario
# Analizar la complejidad
docker run --rm -v $(pwd):/app php:8.2-cli php -r "
require '/app/vendor/autoload.php';
// Análisis básico de complejidad
"
```

#### Métricas de Código (3 puntos)

- [ ] Complejidad ciclomática promedio < 5 por método
- [ ] Complejidad ciclomática máx < 10 por método
- [ ] Longitud promedio de los métodos < 15 líneas
- [ ] Longitud máx de los métodos < 30 líneas
- [ ] Clases con < 10 métodos públicos
- [ ] No hay métodos con más de 5 parámetros
- [ ] Índice de mantenibilidad > 70
- [ ] Acoplamiento aferente/eferente equilibrado
- [ ] No hay clases "God Object" (> 500 líneas)
- [ ] Respeto del principio Single Responsibility

**Puntos obtenidos**: ___/3

### Paso 6: Documentación y PHPDoc

Verifica la calidad de la documentación:

```bash
# Verificar los PHPDoc faltantes
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=9 | grep -i "phpdoc"
```

#### Documentación (2 puntos)

- [ ] PHPDoc para todas las clases (descripción del rol)
- [ ] PHPDoc para todos los métodos públicos complejos
- [ ] @param con descripción para parámetros no evidentes
- [ ] @return con descripción para retornos complejos
- [ ] @throws para todas las excepciones
- [ ] PHPDoc actualizado (no hay parámetros obsoletos)
- [ ] No hay TODO/FIXME en el código de producción
- [ ] Ejemplos de uso para APIs públicas
- [ ] Genéricos documentados: @template, @extends, @implements
- [ ] README.md con documentación de arquitectura

**Puntos obtenidos**: ___/2

### Paso 7: Cálculo de la Puntuación de Calidad del Código

**PUNTUACIÓN CALIDAD DEL CÓDIGO**: ___/25 puntos

Detalles:
- Estándares PSR-12: ___/5
- PHPStan Nivel 9: ___/10
- Type Hints Estrictos: ___/5
- Métricas de Código: ___/3
- Documentación: ___/2

### Paso 8: Informe Detallado

```
=================================================
   AUDITORÍA CALIDAD DEL CÓDIGO SYMFONY
=================================================

📊 PUNTUACIÓN: ___/25

📏 Estándares PSR-12     : ___/5  [✅|⚠️|❌]
🔍 PHPStan Nivel 9       : ___/10 [✅|⚠️|❌]
🏷️  Type Hints Estrictos  : ___/5  [✅|⚠️|❌]
📊 Métricas de Código    : ___/3  [✅|⚠️|❌]
📝 Documentación         : ___/2  [✅|⚠️|❌]

=================================================
   ERRORES PSR-12 DETECTADOS
=================================================

[Número total de errores]: ___

Ejemplos:
❌ src/Controller/UserController.php:45 - Línea demasiado larga (145 caracteres)
❌ src/Domain/Entity/Order.php:12 - Llave mal colocada
⚠️ src/Application/Service/EmailService.php - Use statements no ordenados

=================================================
   ERRORES PHPSTAN DETECTADOS
=================================================

[Número total de errores]: ___

Ejemplos:
❌ src/Domain/Entity/User.php:32 - Tipo de retorno faltante
❌ src/Application/UseCase/CreateOrder.php:45 - Parámetro $data no está tipado
⚠️ src/Infrastructure/Repository/UserRepository.php:78 - Property $entityManager tiene tipo mixed

=================================================
   TYPE HINTS FALTANTES
=================================================

Archivos sin declare(strict_types=1): ___
Métodos sin tipo de retorno: ___
Parámetros sin tipo: ___
Propiedades sin tipo: ___

Ejemplos:
❌ src/Application/Service/OrderService.php:15 - No hay declare(strict_types=1)
❌ src/Domain/ValueObject/Email.php:23 - Método getValue() sin tipo de retorno
⚠️ src/Infrastructure/Adapter/EmailAdapter.php:34 - Propiedad $mailer no tipada

=================================================
   COMPLEJIDAD EXCESIVA
=================================================

Métodos con complejidad > 10: ___

Ejemplos:
❌ src/Application/UseCase/ProcessOrder.php:execute() - Complejidad 15
⚠️ src/Domain/Service/PriceCalculator.php:calculate() - Complejidad 12
⚠️ src/Controller/ApiController.php:handleRequest() - 95 líneas

=================================================
   TOP 3 ACCIONES PRIORITARIAS
=================================================

1. 🎯 [ACCIÓN CRÍTICA] - Corregir los errores PHPStan nivel 9
   Impacto: ⭐⭐⭐⭐⭐ | Esfuerzo: 🔥🔥🔥
   Comando: docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=9

2. 🎯 [ACCIÓN IMPORTANTE] - Añadir declare(strict_types=1) en todos los archivos
   Impacto: ⭐⭐⭐⭐ | Esfuerzo: 🔥
   Script: find src -name "*.php" -exec sed -i '2i\\declare(strict_types=1);' {} \;

3. 🎯 [ACCIÓN RECOMENDADA] - Formatear el código según PSR-12
   Impacto: ⭐⭐⭐ | Esfuerzo: 🔥
   Comando: docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpcbf --standard=PSR12 src/

=================================================
   RECOMENDACIONES
=================================================

Herramientas a instalar:
```bash
composer require --dev phpstan/phpstan ^1.10
composer require --dev phpstan/phpstan-symfony
composer require --dev phpstan/phpstan-doctrine
composer require --dev squizlabs/php_codesniffer ^3.7
composer require --dev friendsofphp/php-cs-fixer ^3.0
```

Configuración PHP CS Fixer (.php-cs-fixer.php):
```php
<?php
return (new PhpCsFixer\Config())
    ->setRules([
        '@PSR12' => true,
        'strict_param' => true,
        'array_syntax' => ['syntax' => 'short'],
        'declare_strict_types' => true,
    ])
    ->setFinder(
        PhpCsFixer\Finder::create()->in(__DIR__ . '/src')
    );
```

CI/CD:
- Añadir PHPStan en el pipeline
- Bloquear los merges si PHPStan falla
- Ejecutar PHP CS Fixer en modo check
- Generar informes de calidad

=================================================
```

## Comandos Docker Útiles

```bash
# Verificar PSR-12
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpcs --standard=PSR12 src/ --report=summary

# Corregir automáticamente PSR-12
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/phpcbf --standard=PSR12 src/

# PHPStan nivel 9
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=9 --error-format=table

# Generar una baseline PHPStan (para proyectos legacy)
docker run --rm -v $(pwd):/app phpstan/phpstan analyse src --level=9 --generate-baseline

# PHP CS Fixer
docker run --rm -v $(pwd):/app php:8.2-cli /app/vendor/bin/php-cs-fixer fix src --dry-run --diff

# Verificar declare(strict_types=1) en todos los archivos
docker run --rm -v $(pwd):/app php:8.2-cli sh -c 'for f in $(find /app/src -name "*.php"); do grep -q "declare(strict_types=1)" "$f" || echo "❌ Faltante: $f"; done'
```

## IMPORTANTE

- Usa SIEMPRE Docker para los comandos
- NO almacenes NUNCA archivos en /tmp
- Proporciona ejemplos concretos con números de línea
- Prioriza las correcciones automatizables
- Distingue los errores críticos de las advertencias
