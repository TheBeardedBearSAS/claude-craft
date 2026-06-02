# Guía de Creación de Proyectos

Esta guía te lleva paso a paso por la configuración de un nuevo proyecto con Claude-Craft, desde la elección de tu stack tecnológico hasta la configuración de tu entorno de desarrollo.

---

## Tabla de Contenidos

1. [Elegir tu Tecnología](#elegir-tu-tecnología)
2. [Métodos de Instalación](#métodos-de-instalación)
3. [Proyectos de Tecnología Única](#proyectos-de-tecnología-única)
4. [Proyectos Monorepo](#proyectos-monorepo)
5. [Configuración Post-Instalación](#configuración-post-instalación)
6. [Lista de Verificación de Inicio de Proyecto](#lista-de-verificación-de-inicio-de-proyecto)

---

## Elegir tu Tecnología

### Comparación de Tecnologías

| Tecnología | Ideal Para | Arquitectura | Características Clave |
|------------|-----------|--------------|----------------------|
| **.NET / C#** | APIs empresariales | Clean Architecture + CQRS | MediatR, EF Core, C# 14 |
| **Symfony** | APIs backend, aplicaciones web | Clean Architecture + DDD | Doctrine, Messenger, API Platform |
| **Flutter** | Aplicaciones móviles | Feature-based + BLoC | Material/Cupertino, gestión de estado |
| **Python** | APIs, servicios de datos | Clean Architecture | FastAPI, async/await, Pydantic |
| **React** | SPAs web | Feature-based + Hooks | Gestión de estado, accesibilidad |
| **React Native** | Móvil multiplataforma | Basado en navegación | Módulos nativos, código específico de plataforma |
| **Angular** | Aplicaciones web empresariales | Domain-driven | Signals, Standalone, RxJS |
| **Vue.js** | SPAs web | Composition API | Pinia, Vitest, TypeScript |
| **Laravel** | APIs PHP, aplicaciones web | Clean Architecture | Actions, Pest PHP, Sanctum |
| **PHP** | Librerías, backend | Clean Architecture | PSR-12, PHPStan, Pest PHP |

### Elegir Según el Tipo de Proyecto

| Tipo de Proyecto | Stack Recomendado |
|-----------------|-------------------|
| API REST | Symfony o Python |
| Aplicación móvil (sensación nativa) | Flutter |
| Aplicación móvil (equipo JS) | React Native |
| SPA web | React |
| Full-stack web | Symfony + React |
| Full-stack móvil | Symfony + Flutter |
| Microservicios | Python (FastAPI) |

### Combinaciones Comunes

```
Aplicación Web:      Symfony (backend) + React (frontend)
Aplicación Móvil:    Symfony (API) + Flutter (móvil)
Plataforma Completa: Symfony (API) + React (web) + Flutter (móvil)
Plataforma de Datos: Python (API) + React (dashboard)
```

---

## Métodos de Instalación

Claude-Craft ofrece múltiples métodos de instalación para adaptarse a diferentes flujos de trabajo.

### Método 1: Makefile (Recomendado)

El enfoque más sencillo y flexible.

```bash
# Sintaxis básica
make install-{technology} TARGET=ruta LANG=idioma

# Ejemplos
make install-symfony TARGET=./backend LANG=en
make install-flutter TARGET=./mobile LANG=fr
make install-python TARGET=./api LANG=es
make install-react TARGET=./frontend LANG=de
make install-reactnative TARGET=./app LANG=pt
```

#### Opciones Disponibles

| Opción | Descripción | Ejemplo |
|--------|-------------|---------|
| `TARGET` | Ruta de instalación | `TARGET=~/projects/myapp` |
| `LANG` | Código de idioma | `LANG=fr` |
| `OPTIONS` | Indicadores adicionales | `OPTIONS="--force --backup"` |

#### Indicadores de Opción

```bash
# Previsualizar cambios sin aplicar
make install-symfony TARGET=./backend OPTIONS="--dry-run"

# Forzar sobrescritura de archivos existentes (crea copia de seguridad)
make install-symfony TARGET=./backend OPTIONS="--force"

# Crear copia de seguridad antes de la instalación
make install-symfony TARGET=./backend OPTIONS="--backup"

# Modo interactivo (solicita información del proyecto)
make install-symfony TARGET=./backend OPTIONS="--interactive"

# Solo actualizar (preservar archivos específicos del proyecto)
make install-symfony TARGET=./backend OPTIONS="--update"
```

### Método 2: Ejecución Directa del Script

Ejecutar los scripts de instalación directamente para mayor control.

```bash
# Sintaxis
./Dev/scripts/install-{technology}-rules.sh [OPTIONS] [TARGET]

# Ejemplos
./Dev/scripts/install-symfony-rules.sh --lang=fr ~/mi-proyecto
./Dev/scripts/install-flutter-rules.sh --lang=en --dry-run .
./Dev/scripts/install-python-rules.sh --force --backup ~/api
```

#### Opciones del Script

```bash
--lang=XX       # Idioma (en, fr, es, de, pt)
--install       # Modo de instalación completa
--update        # Actualizar solo las reglas comunes
--force         # Sobrescribir todos los archivos
--dry-run       # Previsualizar sin cambios
--backup        # Crear copia de seguridad primero
--interactive   # Solicitar información del proyecto
--help          # Mostrar ayuda
--version       # Mostrar versión
```

### Método 3: Configuración YAML

Ideal para monorepos y configuraciones multi-proyecto.

```bash
# Crear configuración
cp claude-projects.yaml.example claude-projects.yaml

# Editar configuración
nano claude-projects.yaml

# Validar configuración
make config-validate CONFIG=claude-projects.yaml

# Instalar proyecto específico
make config-install CONFIG=claude-projects.yaml PROJECT=mi-proyecto

# Instalar todos los proyectos
make config-install-all CONFIG=claude-projects.yaml
```

---

## Proyectos de Tecnología Única

### Proyecto Symfony

```bash
# Crear directorio del proyecto
mkdir ~/mi-api-symfony
cd ~/mi-api-symfony
composer create-project symfony/skeleton .
git init

# Instalar las reglas de Claude-Craft
make install-symfony TARGET=. LANG=fr

# Verificar instalación
ls -la .claude/
```

**Contenido instalado:**
- 21 reglas específicas de Symfony (Clean Architecture, DDD, CQRS, etc.)
- 10+ comandos Symfony (`/symfony:generate-crud`, `/symfony:check-compliance`, etc.)
- Agente revisor de Symfony
- Plantillas de código (Service, ValueObject, Aggregate, etc.)
- Listas de verificación de calidad

### Proyecto Flutter

```bash
# Crear proyecto
flutter create my_flutter_app
cd my_flutter_app
git init

# Instalar las reglas de Claude-Craft
make install-flutter TARGET=. LANG=en

# Verificar
ls -la .claude/
```

**Contenido instalado:**
- 13 reglas específicas de Flutter (BLoC, gestión de estado, testing)
- 10 comandos Flutter
- Agente revisor de Flutter
- Plantillas de Widget y BLoC
- Listas de verificación de calidad

### Proyecto Python

```bash
# Crear proyecto
mkdir ~/mi-api-python
cd ~/mi-api-python
python -m venv venv
git init

# Instalar las reglas de Claude-Craft
make install-python TARGET=. LANG=en

# Verificar
ls -la .claude/
```

**Contenido instalado:**
- 12 reglas específicas de Python (FastAPI, async, tipado)
- 10 comandos Python
- Agente revisor de Python
- Plantillas de servicio y API
- Listas de verificación de calidad

### Proyecto React

```bash
# Crear proyecto
npx create-react-app my-react-app
cd my-react-app

# Instalar las reglas de Claude-Craft
make install-react TARGET=. LANG=en

# Verificar
ls -la .claude/
```

### Proyecto React Native

```bash
# Crear proyecto
npx react-native init MyApp
cd MyApp

# Instalar las reglas de Claude-Craft
make install-reactnative TARGET=. LANG=en

# Verificar
ls -la .claude/
```

---

## Proyectos Monorepo

### Entendiendo la Estructura del Monorepo

Un monorepo típico podría verse así:

```
mi-plataforma/
├── backend/          # API Symfony
├── web/              # Frontend React
├── mobile/           # Aplicación Flutter
├── shared/           # Tipos/contratos compartidos
└── claude-projects.yaml
```

### Estructura de Configuración YAML

```yaml
# claude-projects.yaml

settings:
  default_lang: "fr"              # Idioma predeterminado para todos los proyectos
  claude_craft_path: "~/claude-craft"  # Ruta a claude-craft (opcional)

projects:
  - name: "mi-plataforma"
    description: "Plataforma SaaS full-stack"
    path: "~/Projects/mi-plataforma"
    modules:
      - name: "api"
        path: "backend"
        technologies: ["symfony"]
        lang: "en"                # Sobrescribir idioma predeterminado

      - name: "web"
        path: "web"
        technologies: ["react"]

      - name: "mobile"
        path: "mobile"
        technologies: ["flutter"]
```

### Campos de Configuración

#### Nivel de Proyecto

| Campo | Requerido | Descripción |
|-------|----------|-------------|
| `name` | Sí | Identificador del proyecto |
| `description` | No | Descripción del proyecto |
| `path` | Sí | Ruta absoluta a la raíz del proyecto |
| `lang` | No | Sobrescritura de idioma |
| `modules` | No | Lista de módulos (para monorepos) |
| `technologies` | No | Tecnologías si no hay módulos |

#### Nivel de Módulo

| Campo | Requerido | Descripción |
|-------|----------|-------------|
| `name` | Sí | Identificador del módulo |
| `path` | Sí | Ruta relativa desde la raíz del proyecto |
| `technologies` | Sí | Lista de tecnologías |
| `lang` | No | Sobrescritura de idioma |
| `skip_common` | No | Omitir reglas comunes (predeterminado: false) |

### Comandos de Instalación

```bash
# Validar configuración
make config-validate CONFIG=claude-projects.yaml

# Listar proyectos configurados
make config-list CONFIG=claude-projects.yaml

# Instalar proyecto específico
make config-install CONFIG=claude-projects.yaml PROJECT=mi-plataforma

# Instalar módulo específico
make config-install CONFIG=claude-projects.yaml PROJECT=mi-plataforma MODULE=api

# Dry-run para previsualizar
make config-install CONFIG=claude-projects.yaml PROJECT=mi-plataforma OPTIONS="--dry-run"

# Instalar todos los proyectos
make config-install-all CONFIG=claude-projects.yaml
```

### Ejemplos del Mundo Real

#### Ejemplo 1: Plataforma SaaS

```yaml
projects:
  - name: "saas-platform"
    path: "~/Projects/saas"
    modules:
      - name: "api"
        path: "services/api"
        technologies: ["symfony"]
      - name: "admin"
        path: "apps/admin"
        technologies: ["react"]
      - name: "mobile"
        path: "apps/mobile"
        technologies: ["flutter"]
```

#### Ejemplo 2: Microservicios

```yaml
projects:
  - name: "microservices"
    path: "~/Projects/micro"
    modules:
      - name: "gateway"
        path: "gateway"
        technologies: ["python"]
      - name: "users"
        path: "services/users"
        technologies: ["symfony"]
      - name: "orders"
        path: "services/orders"
        technologies: ["symfony"]
      - name: "analytics"
        path: "services/analytics"
        technologies: ["python"]
```

#### Ejemplo 3: Múltiples Proyectos Independientes

```yaml
settings:
  default_lang: "fr"

projects:
  - name: "client-a"
    path: "~/Clients/client-a"
    technologies: ["symfony", "react"]

  - name: "client-b"
    path: "~/Clients/client-b"
    technologies: ["flutter"]
    lang: "en"

  - name: "internal-tool"
    path: "~/Internal/tool"
    technologies: ["python"]
```

---

## Configuración Post-Instalación

Después de la instalación, configura estos archivos para tu proyecto específico.

### 1. Contexto del Proyecto (`rules/00-project-context.md`)

Este es el archivo más importante a personalizar. Le indica a Claude los detalles de tu proyecto específico.

**Opción A: Configuración Interactiva (Recomendada)**

Ejecuta este comando en Claude Code para autodetectar tu stack y responder preguntas específicas:
```bash
/common:setup-project-context
```

**Opción B: Configuración Manual**

Edita el archivo directamente con los detalles de tu proyecto:

```markdown
# Contexto del Proyecto

## Información del Proyecto
- **Nombre**: Mi Awesome API
- **Tipo**: API REST para plataforma de e-commerce
- **Tamaño del Equipo**: 3 desarrolladores

## Stack Técnico
- PHP 8.3 con Symfony 7.0
- PostgreSQL 16
- Redis para caché
- RabbitMQ para mensajería

## Convenciones
- Estándar de código PSR-12
- Tipado estricto habilitado
- Código en inglés, documentación en francés

## Restricciones
- Cumplimiento RGPD obligatorio
- Debe soportar arquitectura multi-tenant
- Tiempo máximo de respuesta: 200ms

## Dependencias Externas
- Stripe para pagos
- SendGrid para correos electrónicos
- S3 para almacenamiento de archivos
```

### 2. Configuración Principal (`CLAUDE.md`)

El archivo CLAUDE.md en el directorio `.claude/` contiene la configuración principal. Secciones clave a revisar:

```markdown
# Configuración del Proyecto

## Configuración de Idioma
- Código: Inglés
- Documentación: Francés
- Comentarios: Inglés

## Arquitectura
Clean Architecture + DDD + Hexagonal

## Requisitos de Calidad
- Cobertura de tests: 80%+
- Nivel PHPStan: 9
- Sin problemas críticos de seguridad

## Requisitos Docker
Todos los comandos deben usar Docker a través de targets de make.
```

### 3. Configuración de Agentes

Revisa los agentes instalados en `.claude/agents/` y personaliza si es necesario:

```bash
ls .claude/agents/
# api-designer.md
# database-architect.md
# symfony-reviewer.md
# tdd-coach.md
# ...
```

---

## Lista de Verificación de Inicio de Proyecto

Usa esta lista al configurar un nuevo proyecto:

### Pre-Instalación

- [ ] Directorio del proyecto creado
- [ ] Repositorio Git inicializado
- [ ] Stack tecnológico decidido
- [ ] Preferencia de idioma elegida

### Instalación

- [ ] Reglas de Claude-Craft instaladas
- [ ] Instalación verificada (`ls .claude/`)
- [ ] Sin errores en la salida de instalación

### Configuración

- [ ] `00-project-context.md` personalizado con detalles del proyecto
- [ ] `CLAUDE.md` revisado y ajustado
- [ ] Convenciones del equipo documentadas
- [ ] Restricciones y requisitos listados

### Verificación

- [ ] Claude Code iniciado en el directorio del proyecto
- [ ] Comandos disponibles (prueba `/symfony:check-compliance`)
- [ ] Agentes respondiendo (prueba `@symfony-reviewer hello`)

### Configuración del Equipo

- [ ] Directorio `.claude/` confirmado en git
- [ ] Miembros del equipo informados sobre los comandos disponibles
- [ ] README actualizado con información de uso de Claude-Craft

---

## Patrones Comunes

### Instalar Solo Reglas Comunes

Para librerías compartidas o paquetes que no encajan en una tecnología específica:

```bash
make install-common TARGET=./shared-lib LANG=en
```

### Instalar Herramientas de Gestión de Proyectos

Para seguimiento de sprints y gestión de backlog:

```bash
make install-project TARGET=. LANG=fr
```

### Instalar Herramientas de Infraestructura

Para soporte de Docker y CI/CD:

```bash
make install-infra TARGET=. LANG=en
```

### Instalación Completa (Todas las Tecnologías)

```bash
make install-all TARGET=. LANG=fr
```

---

### Configuración de Optimización de Tokens

Después de instalar las reglas, opcionalmente configura RTK para ahorrar tokens:

```bash
# En sesión de Claude Code
/common:setup-rtk
```

Esto configura el proxy RTK, la optimización del modelo de sub-agente y plantillas de hooks para una reducción total de tokens del 55-65%.

---

## Actualizar Reglas

Cuando Claude-Craft publica nuevas versiones:

```bash
# Actualizar a la última versión (preserva archivos específicos del proyecto)
make install-symfony TARGET=./backend OPTIONS="--update"

# Forzar reinstalación completa (copia de seguridad creada automáticamente)
make install-symfony TARGET=./backend OPTIONS="--force"
```

---

## Próximos Pasos

¡Tu proyecto ya está configurado! Continúa con:

1. **[Guía de Desarrollo de Funcionalidades](03-feature-development.md)** - Aprende el flujo de trabajo TDD
2. **[Guía de Corrección de Errores](04-bug-fixing.md)** - Maneja los errores de forma efectiva
3. **[Referencia de Herramientas](05-tools-reference.md)** - Explora herramientas adicionales

---

[&larr; Primeros Pasos](01-getting-started.md) | [Desarrollo de Funcionalidades &rarr;](03-feature-development.md)
