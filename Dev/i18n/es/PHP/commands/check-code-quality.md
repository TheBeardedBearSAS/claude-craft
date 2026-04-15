---
description: Análisis de Calidad de Código PHP
argument-hint: [argumentos]
---

# Análisis de Calidad de Código PHP

## Argumentos

$ARGUMENTS (opcional: ruta al proyecto PHP a analizar, por defecto el directorio actual)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca múltiples módulos o requiere una investigación transversal.

## MISIÓN

Analizar la calidad de código de un proyecto PHP nativo. Combinar análisis estático (PHPStan), verificaciones de estilo (PSR-12), sugerencias de modernización (Rector) y métricas de complejidad. Producir un informe accionable con una puntuación sobre 25.

**Reglas de referencia**: `.claude/rules/php-coding-standards.md`, `.claude/rules/php-quality-tools.md`

### Paso 1: Inventario de Herramientas

- [ ] Leer dependencias de desarrollo de `composer.json`
- [ ] Verificar PHPStan (`phpstan.neon` / `phpstan.neon.dist`)
- [ ] Verificar PHP-CS-Fixer (`.php-cs-fixer.dist.php`) o PHP_CodeSniffer (`phpcs.xml`)
- [ ] Verificar Rector (`rector.php`)
- [ ] Verificar Psalm (opcional) (`psalm.xml`)

**Stack esperado (2026)**:
- PHPStan nivel 10 (o Psalm nivel 1)
- PHP-CS-Fixer con PSR-12 + reglas `@PHP85Migration`
- Rector con `LevelSetList::UP_TO_PHP_85`

### Paso 2: Conformidad PSR-12 (5 pts)

```bash
docker compose exec app vendor/bin/php-cs-fixer fix --dry-run --diff --verbose
```

Verificar:
- [ ] 0 violaciones de estilo
- [ ] `declare(strict_types=1);` en cada archivo
- [ ] Indentación de 4 espacios, finales de línea LF
- [ ] Visibilidad de clase / método / propiedad siempre explícita

### Paso 3: Análisis Estático — PHPStan (5 pts)

```bash
docker compose exec app vendor/bin/phpstan analyse --level=max
```

Verificar:
- [ ] Nivel 10 (o max) pasa con 0 errores
- [ ] Sin `@phpstan-ignore` sin comentario de justificación
- [ ] Genéricos correctamente tipados (`@template`, `@param T`, `@return T`)
- [ ] Sin tipos de retorno `mixed` en APIs públicas

### Paso 4: Seguridad de Tipos (4 pts)

- [ ] 100% de los parámetros tipados
- [ ] 100% de los tipos de retorno declarados
- [ ] Tipos de propiedades declarados (PHP 7.4+)
- [ ] Propiedades readonly usadas donde la mutación está prohibida (PHP 8.1+)
- [ ] Property Hooks usados para propiedades computadas (PHP 8.4+)
- [ ] Visibilidad asimétrica usada cuando sea relevante (PHP 8.4+)

### Paso 5: KISS / DRY / YAGNI (4 pts)

- [ ] Complejidad cognitiva < 7 por método (objetivo), < 10 máx.
- [ ] Métodos < 20 líneas
- [ ] Complejidad ciclomática < 10
- [ ] Sin código muerto (verificar con `vimeo/psalm --find-dead-code` o `rector`)
- [ ] DRY: reglas de negocio en un solo lugar (Value Objects para validación)
- [ ] YAGNI: sin abstracción especulativa — regla de 3 antes de extraer

**Comando de detección**:

```bash
docker compose exec app vendor/bin/phpmetrics --report-cli src/
```

### Paso 6: Nombrado y Documentación (4 pts)

- [ ] Nombres de clases en `PascalCase`, métodos en `camelCase`, constantes `UPPER_SNAKE_CASE`
- [ ] Los nombres son explícitos (sin `getData`, `process`, `manager` sin contexto)
- [ ] PHPDoc en APIs públicas solo con genéricos complejos (tipos ya en la firma)
- [ ] Sin comentarios huérfanos describiendo QUÉ (explicar solo POR QUÉ)

### Paso 7: Manejo de Errores (3 pts)

- [ ] Excepciones específicas del dominio, no `\Exception` genérica
- [ ] Sin errores silenciados (operador `@` prohibido)
- [ ] Seguridad de null: preferir tipos `Option`/`Maybe` o nullable explícito + retorno temprano
- [ ] Excepciones nunca capturadas para ser ignoradas silenciosamente

## FORMATO DE SALIDA

```
AUDITORÍA DE CALIDAD DE CÓDIGO PHP
===================================

PUNTUACIÓN: XX/25

PSR-12 (X/5)
  Violaciones de php-cs-fixer: N
  Problemas críticos:
  - [archivo:línea] descripción

PHPSTAN (X/5)
  Nivel alcanzado: N/10
  Errores restantes: N
  Principales bloqueadores:
  - [archivo:línea] descripción

SEGURIDAD DE TIPOS (X/4)
  Parámetros sin tipo: N
  Retornos sin tipo: N
  Tipos de propiedad faltantes: N

KISS / DRY / YAGNI (X/4)
  Métodos de alta complejidad (>10): N
  Bloques duplicados: N
  Código muerto: N

NOMBRADO Y DOCS (X/4)
  Nombres no explícitos: N
  PHPDoc obsoleto: N

MANEJO DE ERRORES (X/3)
  Usos de @: N
  \Exception genérica lanzada: N

TOP 3 VICTORIAS RÁPIDAS:
1. Ejecutar `vendor/bin/php-cs-fixer fix` — 0 esfuerzo, corrige N violaciones
2. [...]
3. [...]

TOP 3 ACCIONES A LARGO PLAZO:
1. Alcanzar PHPStan nivel max — dividir en 3 sprints
2. [...]
3. [...]
```

## NOTAS IMPORTANTES

- Usar siempre Docker (`docker compose exec app ...`)
- Nunca bajar niveles de PHPStan sin mensaje de commit justificado
- Preferir Rector para modernización masiva (sets de migración PHP 8.5)
- Cobertura 100% sin mutation testing es una falsa red de seguridad — reportar mutation score si Infection está configurado
