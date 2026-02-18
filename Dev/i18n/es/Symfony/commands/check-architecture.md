---
description: Auditoría de Arquitectura Symfony
argument-hint: [arguments]
---

# Auditoría de Arquitectura Symfony

## Argumentos

$ARGUMENTS: Ruta del proyecto Symfony a auditar (opcional, por defecto: directorio actual)

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Eres un arquitecto de software experto en Symfony encargado de auditar la arquitectura de un proyecto Symfony según los principios de Clean Architecture, DDD y Arquitectura Hexagonal.

### Paso 1: Análisis de la Estructura del Proyecto

1. Identifica el directorio del proyecto
2. Analiza la estructura de carpetas en `src/`
3. Verifica la presencia de la estructura esperada

**Referencia a las reglas**: `.claude/rules/symfony-architecture.md`

### Paso 2: Verificación Clean Architecture

#### Estructura de Capas (5 puntos)

- [ ] **Domain/**: Lógica de negocio pura (Entities, Value Objects, Domain Services)
- [ ] **Application/**: Use Cases, Application Services, DTOs
- [ ] **Infrastructure/**: Implementaciones concretas (Repositories, Controllers, Adapters)
- [ ] **Presentation/** o UI: Controllers, Templates, API Resources
- [ ] No hay dependencias invertidas (Domain no depende de nada)

**Puntos obtenidos**: ___/5

#### Separación de Responsabilidades (5 puntos)

- [ ] Domain contiene únicamente lógica de negocio
- [ ] Application orquesta los Use Cases
- [ ] Infrastructure gestiona la persistencia y los servicios externos
- [ ] No hay lógica de negocio en los controllers
- [ ] No hay acceso directo a Doctrine/ORM desde los controllers

**Puntos obtenidos**: ___/5

### Paso 3: Verificación Domain-Driven Design (DDD)

#### Entidades y Value Objects (5 puntos)

- [ ] Entities con identidad claramente definida
- [ ] Value Objects inmutables para conceptos de negocio
- [ ] No hay getters/setters sistemáticos (Tell Don't Ask)
- [ ] Métodos de negocio en las Entities
- [ ] Validación en el Domain (no solo en los formularios)

**Puntos obtenidos**: ___/5

#### Aggregates y Repositories (5 puntos)

- [ ] Aggregates correctamente definidos con Aggregate Root
- [ ] Interfaces de Repository en el Domain
- [ ] Implementaciones de Repository en Infrastructure
- [ ] No hay acceso directo al ORM desde el Domain
- [ ] Colecciones de Aggregates manipuladas vía Repository

**Puntos obtenidos**: ___/5

### Paso 4: Verificación Arquitectura Hexagonal

#### Ports (Interfaces) (2.5 puntos)

- [ ] Ports primarios (Application Services, Use Cases) definidos
- [ ] Ports secundarios (Repository, Email, Logger) definidos en interfaces
- [ ] Interfaces en el Domain o Application
- [ ] No hay acoplamiento a frameworks en las interfaces
- [ ] Nomenclatura clara (ej: `UserRepositoryInterface`, `EmailSenderInterface`)

**Puntos obtenidos**: ___/2.5

#### Adapters (Implementaciones) (2.5 puntos)

- [ ] Adapters primarios: Controllers REST/GraphQL, CLI Commands
- [ ] Adapters secundarios: DoctrineRepository, SymfonyMailer, etc.
- [ ] Adapters en la carpeta Infrastructure
- [ ] Configuración vía Dependency Injection
- [ ] Posibilidad de reemplazar un Adapter fácilmente

**Puntos obtenidos**: ___/2.5

### Paso 5: Verificación con Deptrac

Ejecuta Deptrac para verificar las dependencias entre capas:

```bash
# Verificar si deptrac.yaml existe
docker run --rm -v $(pwd):/app php:8.2-cli test -f /app/deptrac.yaml && echo "✅ deptrac.yaml encontrado" || echo "❌ deptrac.yaml faltante"

# Ejecutar Deptrac
docker run --rm -v $(pwd):/app qossmic/deptrac analyse
```

Configuración Deptrac esperada:

```yaml
deptrac:
  layers:
    - name: Domain
      collectors:
        - type: directory
          value: src/Domain/.*
    - name: Application
      collectors:
        - type: directory
          value: src/Application/.*
    - name: Infrastructure
      collectors:
        - type: directory
          value: src/Infrastructure/.*
  ruleset:
    Domain: []
    Application: [Domain]
    Infrastructure: [Domain, Application]
```

- [ ] deptrac.yaml presente y configurado
- [ ] Ninguna violación de dependencia detectada
- [ ] Domain completamente aislado
- [ ] Application solo depende del Domain
- [ ] Infrastructure puede depender de Domain y Application

**Puntos obtenidos**: ___/5

### Paso 6: Cálculo de la Puntuación de Arquitectura

**PUNTUACIÓN ARQUITECTURA**: ___/25 puntos

Detalles:
- Estructura de Capas: ___/5
- Separación de Responsabilidades: ___/5
- Entidades y Value Objects: ___/5
- Aggregates y Repositories: ___/5
- Ports (Interfaces): ___/2.5
- Adapters (Implementaciones): ___/2.5
- Deptrac: ___/5

### Paso 7: Informe Detallado

```
=================================================
   AUDITORÍA ARQUITECTURA SYMFONY
=================================================

📊 PUNTUACIÓN: ___/25

📐 Estructura de Capas              : ___/5  [✅|⚠️|❌]
🔄 Separación de Responsabilidades  : ___/5  [✅|⚠️|❌]
🎯 Entidades y Value Objects        : ___/5  [✅|⚠️|❌]
📦 Aggregates y Repositories        : ___/5  [✅|⚠️|❌]
🔌 Ports (Interfaces)               : ___/2.5 [✅|⚠️|❌]
🔧 Adapters (Implementaciones)      : ___/2.5 [✅|⚠️|❌]
🔍 Deptrac (Verificación dependencias): ___/5  [✅|⚠️|❌]

=================================================
   PROBLEMAS DETECTADOS
=================================================

[Lista de problemas con ejemplos de archivos]

Ejemplos:
❌ src/Infrastructure/Repository/UserDoctrineRepository.php usado directamente en Controller
⚠️ src/Domain/Entity/User.php contiene anotaciones Doctrine
❌ No hay separación Domain/Application/Infrastructure
⚠️ Value Objects mutables detectados
❌ Deptrac no está configurado

=================================================
   TOP 3 ACCIONES PRIORITARIAS
=================================================

1. 🎯 [ACCIÓN PRIORITARIA] - Reestructurar el proyecto según Clean Architecture
   Impacto: ⭐⭐⭐⭐⭐ | Esfuerzo: 🔥🔥🔥🔥

2. 🎯 [ACCIÓN PRIORITARIA] - Crear las interfaces de Repository en Domain
   Impacto: ⭐⭐⭐⭐ | Esfuerzo: 🔥🔥

3. 🎯 [ACCIÓN PRIORITARIA] - Configurar y ejecutar Deptrac
   Impacto: ⭐⭐⭐ | Esfuerzo: 🔥

=================================================
   RECOMENDACIONES
=================================================

Arquitectura:
- Crear una estructura Domain/Application/Infrastructure/Presentation
- Mover la lógica de negocio de los Controllers a Use Cases
- Aislar completamente el Domain de los frameworks

DDD:
- Transformar las entidades anémicas en Rich Domain Models
- Crear Value Objects para conceptos de negocio (Email, Money, etc.)
- Definir claramente los Aggregates y sus límites

Hexagonal:
- Crear interfaces para todos los servicios externos
- Implementar los Adapters en Infrastructure
- Usar la inyección de dependencias para conectar Ports y Adapters

Herramientas:
- Instalar y configurar Deptrac: composer require --dev qossmic/deptrac-shim
- Crear deptrac.yaml con las reglas de dependencias
- Integrar Deptrac en CI/CD

=================================================
```

## Comandos Docker Útiles

```bash
# Analizar la estructura del proyecto
docker run --rm -v $(pwd):/app php:8.2-cli find /app/src -type d -maxdepth 2

# Verificar las dependencias con Deptrac
docker run --rm -v $(pwd):/app qossmic/deptrac analyse --no-progress

# Listar las clases por namespace
docker run --rm -v $(pwd):/app php:8.2-cli find /app/src -name "*.php" -exec grep -l "namespace" {} \;

# Verificar la presencia de anotaciones Doctrine en Domain
docker run --rm -v $(pwd):/app php:8.2-cli grep -r "@ORM" /app/src/Domain/ || echo "✅ No hay anotaciones ORM en Domain"
```

## IMPORTANTE

- Usa SIEMPRE Docker para los comandos
- NO almacenes NUNCA archivos en /tmp
- Proporciona ejemplos concretos de archivos problemáticos
- Sugiere refactorizaciones progresivas y realistas
