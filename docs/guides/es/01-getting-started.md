# Primeros Pasos con Claude-Craft

¡Bienvenido a Claude-Craft! Esta guía te ayudará a entender qué es Claude-Craft y a poner en marcha tu primer proyecto en tan solo 5 minutos.

---

## ¿Qué es Claude-Craft?

Claude-Craft es un framework completo para el desarrollo asistido por IA con Claude Code. Proporciona:

- **125 Comandos Slash** - Acciones rápidas en 15 espacios de nombres para generación de código, análisis y controles de calidad
- **70 Agentes IA (31 especializados + 39 de infra a demanda)** - Asistentes especializados con niveles de esfuerzo optimizados y memoria persistente
- **11 Stacks Tecnológicos** - De .NET/C# a Vue.js, con reglas y agentes dedicados
- **55 skills** - Mejores prácticas de arquitectura, testing y seguridad
- **21 Plantillas** - Patrones de código listos para usar para componentes comunes
- **10 Checklists** - Puertas de calidad para funcionalidades, releases y auditorías de seguridad
- **Suite de 937 Tests** - Validación completa (vitest + bats)

### Tecnologías Soportadas

| Tecnología | Enfoque | Casos de Uso |
|------------|---------|--------------|
| **.NET / C#** | Clean Architecture + CQRS | APIs, aplicaciones enterprise |
| **Symfony** | Clean Architecture + DDD | APIs, aplicaciones web, servicios backend |
| **Flutter** | Patrón BLoC | Aplicaciones móviles (iOS/Android) |
| **Python** | FastAPI + async/await | APIs, servicios de datos, backends de ML |
| **React** | Hooks + State Management | SPAs web, dashboards |
| **React Native** | New Architecture multiplataforma | Aplicaciones móviles con JS |
| **Angular** | Signals + Standalone | Aplicaciones web enterprise |
| **Vue.js** | Composition API + Pinia | SPAs web, aplicaciones progresivas |
| **Laravel** | Clean Architecture + Actions | APIs, aplicaciones web |
| **PHP** | PSR-12 + PHPStan | Librerías, servicios backend |
| **Docker** | Infraestructura | Contenedorización, CI/CD |

### Idiomas Soportados

Todo el contenido está disponible en 5 idiomas:
- Inglés (en)
- Francés (fr)
- Español (es)
- Alemán (de)
- Portugués (pt)

---

## Prerrequisitos

### Obligatorios

- **Bash** - Shell para ejecutar los scripts de instalación
- **Claude Code** - El asistente de codificación IA de Anthropic

### Compatibilidad con Claude Code

| Versión | Estado |
|---------|--------|
| **2.1.193** | Recomendada (soporte completo de funcionalidades) |
| **2.1.97+** | Mínima soportada (CVE-2025-59536 parcheado) |

### Opcionales (Recomendados)

- **yq** - Procesador YAML para archivos de configuración
  ```bash
  # macOS
  brew install yq

  # Linux (Debian/Ubuntu)
  sudo apt install yq

  # Linux (snap)
  sudo snap install yq
  ```

- **jq** - Procesador JSON (para la herramienta StatusLine)
  ```bash
  # macOS
  brew install jq

  # Linux
  sudo apt install jq
  ```

---

## Instalación Rápida

### Método 1: Makefile (Recomendado)

```bash
# Clonar Claude-Craft
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft

# Instalar para un proyecto Symfony (en francés)
make install-symfony TARGET=~/mi-proyecto LANG=fr

# O para un proyecto Flutter (en inglés)
make install-flutter TARGET=~/mi-app LANG=en
```

### Método 2: Script Directo

```bash
# Navegar a Claude-Craft
cd claude-craft

# Ejecutar el script de instalación
./Dev/scripts/install-symfony-rules.sh --lang=fr ~/mi-proyecto
```

### Método 3: Configuración YAML (para Monorepos)

```bash
# Crear el archivo de configuración
cp claude-projects.yaml.example claude-projects.yaml

# Editar con tus proyectos
nano claude-projects.yaml

# Instalar desde la configuración
make config-install CONFIG=claude-projects.yaml PROJECT=mi-proyecto
```

---

## Tu Primer Proyecto en 5 Minutos

Vamos a crear un nuevo proyecto de API Symfony con reglas en francés.

### Paso 1: Crear el Directorio del Proyecto

```bash
mkdir ~/mi-api
cd ~/mi-api
git init
```

### Paso 2: Instalar las Reglas de Claude-Craft

```bash
# Desde el directorio claude-craft
make install-symfony TARGET=~/mi-api LANG=fr
```

### Paso 3: Verificar la Instalación

```bash
ls -la ~/mi-api/.claude/
```

Deberías ver:
```
.claude/
├── CLAUDE.md           # Configuración principal
├── .claudeignore       # Patrones de ignorado para reducir el contexto
├── settings.json       # Valores predeterminados optimizados con hook PostCompact
├── settings.local.json # Permisos locales (patrones con comodín)
├── rules/              # 21 archivos de reglas
├── agents/             # Agentes IA con optimización de esfuerzo/memoria
├── commands/           # Comandos slash
│   ├── common/         # Comandos transversales
│   └── symfony/        # Comandos específicos de Symfony
├── templates/          # Plantillas de código
└── checklists/         # Puertas de calidad
```

### Paso 4: Configurar el Contexto de tu Proyecto

Puedes configurar el contexto del proyecto de forma interactiva o manual:

**Opción A: Interactiva (Recomendada)**
```bash
cd ~/mi-api && claude
# Luego ejecuta:
/common:setup-project-context
```

**Opción B: Manual**
```bash
nano ~/mi-api/.claude/rules/00-project-context.md
```

Actualiza estas secciones:
- Nombre y descripción del proyecto
- Detalles del stack técnico
- Convenciones del equipo
- Restricciones específicas

### Paso 5: Iniciar Claude Code

```bash
cd ~/mi-api
claude
```

¡Ahora puedes usar todos los comandos y agentes instalados!

---

## Entendiendo la Estructura

### Reglas (`rules/`)

Las reglas son directrices que Claude sigue al trabajar en tu proyecto. Están numeradas por prioridad:

| Número | Tema |
|--------|------|
| 00 | Contexto del proyecto (¡personaliza esto!) |
| 01 | Flujo de trabajo y análisis |
| 02 | Arquitectura |
| 03 | Estándares de código |
| 04 | Principios SOLID |
| 05 | KISS, DRY, YAGNI |
| 06 | Docker y herramientas |
| 07 | Testing |
| 08 | Herramientas de calidad |
| 09 | Flujo de trabajo Git |
| 10 | Documentación |
| 11 | Seguridad |
| 12+ | Temas avanzados (DDD, CQRS, etc.) |

### Agentes (`agents/`)

Los agentes son personas especializadas de IA que puedes invocar para tareas específicas:

```markdown
@api-designer Diseña la API REST para la gestión de usuarios
@database-architect Crea el esquema para el agregado Pedido
@symfony-reviewer Revisa mi implementación de UserService
@tdd-coach Ayúdame a escribir tests para el flujo de autenticación
```

### Comandos (`commands/`)

Los comandos slash son acciones rápidas:

```bash
# Generar código
/symfony:generate-crud User

# Verificar calidad
/symfony:check-compliance

# Analizar arquitectura
/common:architecture-decision
```

### Plantillas (`templates/`)

Las plantillas proporcionan patrones de código:
- `service.md` - Plantilla de clase de servicio
- `value-object.md` - Plantilla de Value Object
- `aggregate-root.md` - Plantilla de Aggregate Root DDD
- `test-unit.md` - Plantilla de test unitario

### Checklists (`checklists/`)

Puertas de calidad para diferentes escenarios:
- `feature-checklist.md` - Antes de completar una funcionalidad
- `pre-commit.md` - Antes de hacer commit del código
- `release.md` - Antes de publicar una release
- `security-audit.md` - Revisión de seguridad

---

## Conceptos Clave

### 1. Flujo de Trabajo TDD

Claude-Craft aplica el Desarrollo Guiado por Tests:

```
1. Analizar requisitos
2. Escribir tests que fallen
3. Implementar el código
4. Refactorizar
5. Revisar
```

### 2. Clean Architecture

Todos los stacks tecnológicos siguen los principios de Clean Architecture:

```
┌─────────────────────────────────────┐
│           Presentación              │
├─────────────────────────────────────┤
│           Aplicación                │
├─────────────────────────────────────┤
│             Dominio                 │
├─────────────────────────────────────┤
│          Infraestructura            │
└─────────────────────────────────────┘
```

### 3. Calidad Primero

Cada funcionalidad debe superar las puertas de calidad:
- 80%+ de cobertura de tests
- Análisis estático superado
- Auditoría de seguridad sin hallazgos
- Documentación actualizada

---

## Optimizaciones Automáticas (v8.7)

Claude-Craft ahora incluye valores predeterminados optimizados de fábrica:

**Instalados automáticamente:**
- ✓ `.claudeignore` para reducir el ruido en el contexto
- ✓ `settings.json` con hook PostCompact para reinyección del contexto
- ✓ `settings.local.json` con permisos con comodín
- ✓ `CLAUDE_CODE_SUBAGENT_MODEL=sonnet` aplicado para reducir costes
- ✓ RTK `--ultra-compact` parcheado automáticamente durante la instalación

**Opcional: Integración RTK**

Para la máxima reducción de salida CLI (ahorro del 60-90%):

```bash
# En Claude Code, ejecuta el comando de configuración
/common:setup-rtk
```

**Ahorros esperados:** Reducción global de tokens del 55-65% con RTK completo + optimizaciones. Consulta la [Guía de Configuración](08-setup-new-project.md) para más detalles.

---

## Próximos Pasos

Ahora que entiendes los conceptos básicos, continúa con:

1. **[Guía de Creación de Proyecto](02-project-creation.md)** - Configuración detallada para diferentes escenarios
2. **[Guía de Desarrollo de Funcionalidades](03-feature-development.md)** - Flujo de trabajo TDD con agentes y comandos
3. **[Guía de Corrección de Bugs](04-bug-fixing.md)** - Flujo de trabajo de diagnóstico y testing de regresión

---

## Referencia Rápida

### Comandos Comunes

```bash
# Instalación
make install-{tech} TARGET=ruta LANG=xx

# Listar opciones disponibles
make help

# Validar configuración YAML
make config-validate CONFIG=archivo.yaml
```

### Agentes Útiles

| Agente | Propósito |
|--------|-----------|
| `@api-designer` | Diseño y documentación de API |
| `@database-architect` | Diseño de esquema de base de datos |
| `@tdd-coach` | Ayuda para escribir tests |
| `@{tech}-reviewer` | Revisión de código para tecnología específica |

### Comandos Esenciales

| Comando | Propósito |
|---------|-----------|
| `/common:analyze-feature` | Analizar requisitos |
| `/{tech}:generate-crud` | Generar código CRUD |
| `/{tech}:check-compliance` | Auditoría completa de calidad |
| `/common:security-audit` | Revisión de seguridad |

---

[Siguiente: Guía de Creación de Proyecto &rarr;](02-project-creation.md)
