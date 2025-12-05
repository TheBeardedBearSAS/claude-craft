# Reglas de Desarrollo Python para Claude Code

Este directorio contiene las reglas completas de desarrollo Python para Claude Code.

## Estructura

```
Python/
├── CLAUDE.md.template          # Plantilla principal para nuevos proyectos
├── README.md                   # Este archivo
│
├── rules/                      # Reglas de desarrollo
│   ├── 00-project-context.md.template
│   ├── 01-workflow-analysis.md
│   ├── 02-architecture.md
│   ├── 03-coding-standards.md
│   ├── 04-solid-principles.md
│   ├── 05-kiss-dry-yagni.md
│   ├── 06-tooling.md
│   ├── 07-testing.md
│   ├── 08-quality-tools.md
│   ├── 09-git-workflow.md
│   ├── 10-documentation.md
│   ├── 11-security.md
│   ├── 12-async.md
│   └── 13-frameworks.md
│
├── templates/                  # Plantillas de código
│   ├── service.md
│   ├── repository.md
│   ├── api-endpoint.md
│   ├── test-unit.md
│   └── test-integration.md
│
├── checklists/                 # Listas de verificación de procesos
│   ├── pre-commit.md
│   ├── new-feature.md
│   ├── refactoring.md
│   └── security.md
│
└── examples/                   # Ejemplos de código completos
    └── (próximamente)
```

## Uso

### Para un Nuevo Proyecto Python

1. **Copiar CLAUDE.md.template** al proyecto:
   ```bash
   cp Python/CLAUDE.md.template /path/to/project/CLAUDE.md
   ```

2. **Reemplazar los placeholders**:
   - `{{PROJECT_NAME}}` - Nombre del proyecto
   - `{{PROJECT_VERSION}}` - Versión (ej: 0.1.0)
   - `{{TECH_STACK}}` - Stack tecnológico
   - `{{WEB_FRAMEWORK}}` - FastAPI/Django/Flask
   - `{{PYTHON_VERSION}}` - Versión de Python (ej: 3.11)
   - `{{ORM}}` - SQLAlchemy/Django ORM/etc.
   - `{{TASK_QUEUE}}` - Celery/RQ/arq
   - `{{PACKAGE_MANAGER}}` - poetry/uv
   - etc.

3. **Personalizar** según las necesidades del proyecto:
   - Agregar reglas específicas en la sección `SPECIFIC_RULES`
   - Ajustar comandos Makefile si es necesario
   - Completar información de contacto

4. **Copiar 00-project-context.md.template** (opcional):
   ```bash
   cp Python/rules/00-project-context.md.template /path/to/project/docs/context.md
   ```
   Y completar toda la información específica.

### Para un Proyecto Existente

1. **Agregar CLAUDE.md** con las reglas
2. **Adaptar gradualmente** el código existente
3. **Usar las listas de verificación** para nuevas características

## Contenido de las Reglas

### Rules (Reglas Fundamentales)

#### 01-workflow-analysis.md
**Análisis Obligatorio Antes de Cualquier Modificación**

Metodología de 7 pasos:
1. Comprender la necesidad
2. Explorar el código existente
3. Identificar los impactos
4. Diseñar la solución
5. Planificar la implementación
6. Identificar los riesgos
7. Definir las pruebas

**Ejemplos completos** para:
- Nueva característica (sistema de notificación por correo electrónico)
- Corrección de errores
- Plantillas de documentación

#### 02-architecture.md
**Clean Architecture y Hexagonal**

- Estructura de proyecto completa
- Capas Domain/Application/Infrastructure
- Entidades, Value Objects, Servicios
- Patrón Repository
- Inyección de Dependencias
- Arquitectura Orientada a Eventos
- Patrón CQRS

**Más de 200 ejemplos de código** anotados.

#### 03-coding-standards.md
**Estándares de Código Python**

- PEP 8 completo
- Organización de importaciones
- Type hints (PEP 484, 585, 604)
- Docstrings estilo Google/NumPy
- Convenciones de nomenclatura
- Comprehensions
- Context managers
- Manejo de excepciones

#### 04-solid-principles.md
**Principios SOLID con Ejemplos Python**

Cada principio con:
- Explicación
- Ejemplo de violación
- Ejemplo correcto
- Casos de uso concretos

Además: Ejemplo completo de un sistema de notificación.

#### 05-kiss-dry-yagni.md
**Principios de Simplicidad**

- KISS: Preferir la simplicidad
- DRY: Evitar la duplicación
- YAGNI: Implementar solo lo necesario

Con numerosos ejemplos de violaciones y correcciones.

#### 06-tooling.md
**Herramientas de Desarrollo**

- Poetry / uv (gestión de paquetes)
- pyenv (gestión de versiones)
- Docker + docker-compose
- Makefile completo
- Pre-commit hooks
- Ruff, Black, isort (linting/formatting)
- mypy (verificación de tipos)
- Bandit (seguridad)
- CI/CD (GitHub Actions)

Configuración completa proporcionada.

#### 07-testing.md
**Estrategia de Pruebas**

- Configuración de pytest
- Pruebas unitarias (aislamiento completo)
- Pruebas de integración (BD real)
- Pruebas E2E (flujos completos)
- Fixtures avanzados
- Mocking con pytest-mock
- Cobertura con pytest-cov

**Numerosos ejemplos** de pruebas.

#### 09-git-workflow.md
**Workflow Git y Conventional Commits**

- Convención de nomenclatura de ramas
- Conventional Commits (tipos, ámbito, formato)
- Commits atómicos
- Pre-commit hooks
- Plantilla PR
- Comandos Git útiles

### Templates (Plantillas de Código)

#### service.md
Plantilla completa para crear un Domain Service:
- Cuándo usarlo
- Estructura completa
- Ejemplo concreto (PricingService)
- Pruebas unitarias
- Lista de verificación

#### repository.md
Plantilla completa para Repository Pattern:
- Interfaz (Protocol) en domain
- Implementación en infrastructure
- ORM Model
- Ejemplo concreto (UserRepository)
- Pruebas unitarias e integración
- Lista de verificación

### Checklists (Procesos)

#### pre-commit.md
**Lista de Verificación Antes de Cada Commit**

12 categorías:
1. Calidad del Código (lint, format, types, security)
2. Pruebas (unitarias, integración, cobertura)
3. Estándares de Código (PEP 8, type hints, docstrings)
4. Arquitectura (Clean, SOLID, KISS/DRY/YAGNI)
5. Seguridad (secretos, validación, contraseñas)
6. Base de datos (migraciones)
7. Rendimiento (N+1, paginación, cache)
8. Logging y Monitoreo
9. Documentación
10. Git (mensaje, atomicidad)
11. Dependencias
12. Limpieza (código muerto, debug)

#### new-feature.md
**Lista de Verificación Nueva Característica**

7 fases completas:
1. Análisis (obligatorio)
2. Implementación (Domain/Application/Infrastructure)
3. Pruebas (unitarias/integración/E2E)
4. Calidad (lint, types, review)
5. Documentación
6. Git y PR
7. Despliegue

## Reglas Clave

### 1. Análisis OBLIGATORIO

**NINGUNA modificación de código sin análisis previo.**

Ver `rules/01-workflow-analysis.md`.

### 2. Clean Architecture

```
Domain (lógica de negocio pura)
  ↑
Application (casos de uso)
  ↑
Infrastructure (adaptadores: API, BD, etc.)
```

Las dependencias **siempre apuntan hacia adentro**.

### 3. SOLID

- **S**ingle Responsibility
- **O**pen/Closed
- **L**iskov Substitution
- **I**nterface Segregation
- **D**ependency Inversion

### 4. Pruebas

- Unitarias: > 95% cobertura domain
- Integración: > 75% cobertura infrastructure
- E2E: Flujos críticos

### 5. Type Hints

**Obligatorios** en todas las funciones públicas.

```python
def my_function(param: str) -> int:
    """Docstring."""
    pass
```

### 6. Docstrings

**Estilo Google** en todas las funciones/clases públicas.

```python
def function(arg1: str) -> bool:
    """
    Resumen.

    Args:
        arg1: Descripción

    Returns:
        Descripción

    Raises:
        ValueError: Si condición
    """
    pass
```

## Comandos Rápidos

### Configuración del Proyecto

```bash
# Copiar plantilla
cp Python/CLAUDE.md.template myproject/CLAUDE.md

# Editar placeholders
vim myproject/CLAUDE.md

# Configurar proyecto
cd myproject
make setup
```

### Desarrollo

```bash
make dev          # Lanzar entorno
make test         # Todas las pruebas
make quality      # Lint + type-check + security
make test-cov     # Pruebas con cobertura
```

### Pre-commit

```bash
# Verificación rápida antes del commit
make quality && make test-cov

# O con pre-commit hooks
pre-commit run --all-files
```

## Recursos Adicionales

### Documentación Externa

- [PEP 8](https://pep8.org/)
- [Type Hints (PEP 484)](https://www.python.org/dev/peps/pep-0484/)
- [Protocols (PEP 544)](https://www.python.org/dev/peps/pep-0544/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)

### Herramientas

- [Poetry](https://python-poetry.org/)
- [uv](https://github.com/astral-sh/uv)
- [Ruff](https://github.com/astral-sh/ruff)
- [mypy](https://mypy.readthedocs.io/)
- [pytest](https://docs.pytest.org/)

## Contribución

Para mejorar estas reglas:

1. Crear un issue para discusión
2. Proponer ejemplos concretos
3. Enviar PR con modificaciones

## Licencia

Estas reglas están destinadas al uso interno de TheBeardedCTO Tools.

---

**Versión**: 1.0.0
**Última actualización**: 2025-12-03
