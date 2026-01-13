# Guía de Creación de Proyecto

Esta guía te acompaña en la configuración de un nuevo proyecto con Claude-Craft.

---

## Elegir Tu Tecnología

| Tecnología | Ideal Para | Arquitectura |
|------------|------------|--------------|
| **Symfony** | APIs backend, Apps web | Clean Architecture + DDD |
| **Flutter** | Apps móviles | Feature-based + BLoC |
| **Python** | APIs, Servicios de datos | Arquitectura en capas |
| **React** | SPAs web | Feature-based + Hooks |
| **React Native** | Móvil multiplataforma | Basado en navegación |

---

## Métodos de Instalación

### Método 1: Makefile (Recomendado)

```bash
make install-{tecnología} TARGET=ruta LANG=idioma

# Ejemplos
make install-symfony TARGET=./backend LANG=es
make install-flutter TARGET=./mobile LANG=es
```

#### Opciones
```bash
OPTIONS="--dry-run"      # Vista previa sin cambios
OPTIONS="--force"        # Sobrescribir archivos
OPTIONS="--backup"       # Crear respaldo
OPTIONS="--interactive"  # Modo interactivo
OPTIONS="--update"       # Solo actualizar
```

### Método 2: Script Directo

```bash
./Dev/scripts/install-symfony-rules.sh --lang=es ~/mi-proyecto
```

### Método 3: Configuración YAML

```yaml
# claude-projects.yaml
settings:
  default_lang: "es"

projects:
  - name: "mi-plataforma"
    path: "~/Proyectos/mi-plataforma"
    modules:
      - name: "api"
        path: "backend"
        technologies: ["symfony"]
      - name: "mobile"
        path: "app"
        technologies: ["flutter"]
```

```bash
make config-install CONFIG=claude-projects.yaml PROJECT=mi-plataforma
```

---

## Proyectos Mono-Tecnología

### Proyecto Symfony
```bash
mkdir ~/mi-api && cd ~/mi-api && git init
make install-symfony TARGET=. LANG=es
```

### Proyecto Flutter
```bash
flutter create mi_app && cd mi_app && git init
make install-flutter TARGET=. LANG=es
```

### Proyecto Python
```bash
mkdir ~/mi-api-python && cd ~/mi-api-python && git init
make install-python TARGET=. LANG=es
```

---

## Configuración Post-Instalación

### 1. Contexto del Proyecto (`rules/00-project-context.md`)

Este es el archivo más importante a personalizar.

**Opción A: Configuración Interactiva (Recomendada)**

Ejecuta este comando en Claude Code para detectar tu stack y responder preguntas específicas:
```bash
/common:setup-project-context
```

**Opción B: Configuración Manual**

Edita el archivo directamente con los detalles de tu proyecto:

```markdown
# Contexto del Proyecto

## Información
- **Nombre**: Mi API E-commerce
- **Tipo**: API REST para plataforma e-commerce

## Stack Técnico
- PHP 8.3 con Symfony 7.0
- PostgreSQL 16
- Redis para caché

## Convenciones
- Código en inglés, documentación en español
```

### 2. Configuración Principal (`CLAUDE.md`)

Revisar y ajustar:
- Configuración de idioma
- Requisitos de arquitectura
- Requisitos de calidad
- Requisitos Docker

---

## Checklist de Inicio

### Pre-Instalación
- [ ] Directorio del proyecto creado
- [ ] Repositorio Git inicializado
- [ ] Stack tecnológico decidido

### Instalación
- [ ] Reglas Claude-Craft instaladas
- [ ] Instalación verificada (`ls .claude/`)

### Configuración
- [ ] `00-project-context.md` personalizado
- [ ] `CLAUDE.md` revisado

### Verificación
- [ ] Claude Code iniciado en el directorio
- [ ] Comandos disponibles
- [ ] Agentes respondiendo

---

[&larr; Primeros Pasos](01-getting-started.md) | [Desarrollo de Funcionalidades &rarr;](03-feature-development.md)
