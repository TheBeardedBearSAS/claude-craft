# Primeros Pasos con Claude-Craft

Bienvenido a Claude-Craft. Esta guía te ayudará a entender qué es Claude-Craft y a poner en marcha tu primer proyecto en solo 5 minutos.

---

## ¿Qué es Claude-Craft?

Claude-Craft es un framework completo para desarrollo asistido por IA con Claude Code. Proporciona:

- **204+ Comandos Slash** - Acciones rápidas en 26 namespaces para generación, análisis y calidad de código
- **63 Agentes IA** - Asistentes especializados para diferentes tareas (diseño de API, arquitectura, revisión de código, DevOps, etc.)
- **18 Stacks Tecnológicos** - De .NET/C# a Vue.js, con reglas y agentes dedicados
- **37 Skills** - Mejores prácticas para arquitectura, pruebas, seguridad y calidad de código
- **21 Plantillas** - Patrones de código listos para usar
- **10 Checklists** - Puertas de calidad para funcionalidades y releases

### Tecnologías Soportadas

| Tecnología | Enfoque | Casos de Uso |
|------------|---------|--------------|
| **Symfony / PHP** | Clean Architecture + DDD | APIs, Apps web, Servicios backend |
| **React** | Hooks + State Management | SPAs web, Dashboards |
| **Flutter / Dart** | Patrón BLoC | Apps móviles (iOS/Android) |
| **Python** | FastAPI + async/await | APIs, Servicios de datos, ML |
| **Angular** | Signals + Standalone | SPAs enterprise |
| **Vue.js** | Composition API + Pinia | SPAs web, Dashboards |
| **React Native** | New Architecture | Apps móviles multiplataforma |
| **C# / .NET** | Clean Architecture + CQRS | APIs enterprise, Microservicios |
| **Laravel** | Actions Pattern | APIs, CMS, E-commerce |
| **PHP** | PSR-12 + PHPStan | Librerías, APIs |
| **Docker** | Contenedorización | Dev local, CI/CD |
| **Coolify** | PaaS auto-hospedado | Despliegues simples |
| **Kubernetes** | Orquestación | Microservicios, Scale |
| **OpenTofu** | IaC | Multi-cloud |
| **Ansible** | Automatización | Gestión de configuración |
| **Hcloud** | Hetzner Cloud | Hosting europeo |
| **PgBouncer** | Connection pooling | PostgreSQL alta carga |
| **FrankenPHP** | Servidor PHP/Go | Rendimiento PHP |

### Idiomas Soportados

Todo el contenido está disponible en 5 idiomas: Inglés (en), Francés (fr), Español (es), Alemán (de), Portugués (pt)

---

## Prerrequisitos

### Obligatorios
- **Bash** - Shell para ejecutar scripts de instalación
- **Claude Code** - El asistente de codificación IA de Anthropic

### Opcionales (Recomendados)
```bash
# yq - Procesador YAML
brew install yq  # macOS
sudo apt install yq  # Linux

# jq - Procesador JSON (para StatusLine)
brew install jq  # macOS
sudo apt install jq  # Linux
```

---

## Instalación Rápida

### Método 1: Makefile (Recomendado)

```bash
git clone https://github.com/thebeardedcto/claude-craft.git
cd claude-craft

# Instalar para proyecto Symfony (en español)
make install-symfony TARGET=~/mi-proyecto LANG=es
```

### Método 2: Script Directo

```bash
./Dev/scripts/install-symfony-rules.sh --lang=es ~/mi-proyecto
```

### Método 3: Configuración YAML (para Monorepos)

```bash
cp claude-projects.yaml.example claude-projects.yaml
nano claude-projects.yaml
make config-install CONFIG=claude-projects.yaml PROJECT=mi-proyecto
```

---

## Tu Primer Proyecto en 5 Minutos

```bash
# Paso 1: Crear directorio del proyecto
mkdir ~/mi-api && cd ~/mi-api && git init

# Paso 2: Instalar reglas Claude-Craft
make install-symfony TARGET=~/mi-api LANG=es

# Paso 3: Verificar instalación
ls -la ~/mi-api/.claude/

# Paso 4: Configurar contexto del proyecto (elige una opción)
# Opción A: Interactiva (recomendada)
cd ~/mi-api && claude
# Luego ejecuta: /common:setup-project-context

# Opción B: Manual
nano ~/mi-api/.claude/rules/00-project-context.md

# Paso 5: Iniciar Claude Code
cd ~/mi-api && claude
```

---

## Entendiendo la Estructura

### Reglas (`rules/`)
Directrices que Claude sigue al trabajar en tu proyecto, numeradas por prioridad (00-12+).

### Agentes (`agents/`)
```markdown
@api-designer Diseña la API REST para gestión de usuarios
@database-architect Crea el esquema para el agregado Pedido
@symfony-reviewer Revisa mi implementación de UserService
```

### Comandos (`commands/`)
```bash
/symfony:generate-crud User
/symfony:check-compliance
/common:architecture-decision
```

### Plantillas (`templates/`)
service.md, value-object.md, aggregate-root.md, test-unit.md

### Checklists (`checklists/`)
feature-checklist.md, pre-commit.md, release.md, security-audit.md

---

## Conceptos Clave

### 1. Flujo de Trabajo TDD
```
1. Analizar → 2. Tests → 3. Implementar → 4. Refactorizar → 5. Revisar
```

### 2. Clean Architecture
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
- 80%+ cobertura de tests
- Análisis estático aprobado
- Auditoría de seguridad clara
- Documentación actualizada

---

## Próximos Pasos

1. **[Guía de Creación de Proyecto](02-project-creation.md)**
2. **[Guía de Desarrollo de Funcionalidades](03-feature-development.md)**
3. **[Guía de Corrección de Bugs](04-bug-fixing.md)**

---

[Siguiente: Creación de Proyecto &rarr;](02-project-creation.md)
