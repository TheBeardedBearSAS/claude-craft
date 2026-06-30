# Configuración de Claude-Craft en un Proyecto Nuevo

Este tutorial paso a paso te guiará a través de la instalación de Claude-Craft en un proyecto completamente nuevo. Al final, tendrás un entorno de desarrollo totalmente configurado con asistencia de IA.

**Tiempo requerido:** ~10 minutos

---

## Tabla de Contenidos

1. [Lista de Requisitos Previos](#1-lista-de-requisitos-previos)
2. [Crear el Directorio de tu Proyecto](#2-crear-el-directorio-de-tu-proyecto)
3. [Inicializar el Repositorio Git](#3-inicializar-el-repositorio-git)
4. [Elegir tu Stack Tecnológico](#4-elegir-tu-stack-tecnológico)
5. [Instalar Claude-Craft](#5-instalar-claude-craft)
   - [Método A: NPX (Sin Clonar)](#método-a-npx-sin-clonar)
   - [Método B: Makefile (Más Control)](#método-b-makefile-más-control)
6. [Verificar la Instalación](#6-verificar-la-instalación)
7. [Configurar el Contexto del Proyecto](#7-configurar-el-contexto-del-proyecto)
8. [Primer Lanzamiento con Claude Code](#8-primer-lanzamiento-con-claude-code)
9. [Probar tu Configuración](#9-probar-tu-configuración)
10. [Solución de Problemas](#10-solución-de-problemas)
11. [Próximos Pasos](#11-próximos-pasos)

---

## 1. Lista de Requisitos Previos

Antes de comenzar, asegúrate de tener lo siguiente instalado:

### Requerido

- [ ] **Terminal/Línea de Comandos** - Cualquier aplicación de terminal
- [ ] **Node.js 20+** - Requerido para instalación NPX
- [ ] **Git** - Para control de versiones
- [ ] **Claude Code** - El asistente de codificación con IA

### Verificar tus Requisitos Previos

Abre tu terminal y ejecuta estos comandos:

```bash
# Verificar versión de Node.js (debe ser 16 o superior)
node --version
```
Salida esperada: `v20.x.x` o superior (ej: `v20.10.0`)

```bash
# Verificar versión de Git
git --version
```
Salida esperada: `git version 2.x.x` (ej: `git version 2.43.0`)

```bash
# Verificar que Claude Code está instalado
claude --version
```
Salida esperada: Número de versión (ej: `1.0.x`)

### Instalar Requisitos Previos Faltantes

Si algún comando anterior falla:

**Node.js:** Descarga desde [nodejs.org](https://nodejs.org/) o usa:
```bash
# macOS con Homebrew
brew install node

# Ubuntu/Debian
sudo apt install nodejs npm
```

**Git:** Descarga desde [git-scm.com](https://git-scm.com/) o usa:
```bash
# macOS con Homebrew
brew install git

# Ubuntu/Debian
sudo apt install git
```

**Claude Code:** Sigue la [guía de instalación oficial](https://code.claude.com/docs/en/installation)

---

## 2. Crear el Directorio de tu Proyecto

Elige dónde quieres crear tu proyecto y ejecuta:

```bash
# Crear directorio del proyecto
mkdir ~/mi-proyecto

# Navegar dentro
cd ~/mi-proyecto
```

**Verificación:** Ejecuta `pwd` para confirmar que estás en el directorio correcto:
```bash
pwd
```
Salida esperada: `/home/tunombre/mi-proyecto` (o `/Users/tunombre/mi-proyecto` en macOS)

---

## 3. Inicializar el Repositorio Git

Claude-Craft funciona mejor con proyectos rastreados por Git:

```bash
# Inicializar repositorio Git
git init
```

Salida esperada:
```
Initialized empty Git repository in /home/tunombre/mi-proyecto/.git/
```

**Verificación:** Comprueba que la carpeta `.git` existe:
```bash
ls -la
```
Deberías ver un directorio `.git/` en la salida.

---

## 4. Elegir tu Stack Tecnológico

Claude-Craft soporta múltiples stacks tecnológicos. Elige el que coincida con tu proyecto:

| Stack | Ideal Para | Flag de Comando |
|-------|------------|-----------------|
| **C# / .NET** | APIs Enterprise, Microservicios | `--tech=csharp` |
| **Symfony / PHP** | APIs PHP, Apps Web, Servicios Backend | `--tech=symfony` |
| **Laravel / PHP** | Apps Web, APIs rápidas | `--tech=laravel` |
| **PHP** | Clean Architecture genérica | `--tech=php` |
| **Flutter / Dart** | Apps móviles (iOS/Android) | `--tech=flutter` |
| **Python** | APIs, Servicios de datos, Backends ML | `--tech=python` |
| **React** | SPAs Web, Dashboards | `--tech=react` |
| **React Native** | Apps móviles multiplataforma | `--tech=reactnative` |
| **Angular** | Apps empresariales, SPAs | `--tech=angular` |
| **Vue.js** | SPAs Web, Dashboards | `--tech=vuejs` |
| **Solo Common** | Cualquier proyecto (reglas genéricas) | `--tech=common` |

**Elige tu idioma:**

| Idioma | Flag |
|--------|------|
| Inglés | `--lang=en` |
| Francés | `--lang=fr` |
| Español | `--lang=es` |
| Alemán | `--lang=de` |
| Portugués | `--lang=pt` |

---

## 5. Instalar Claude-Craft

Tienes dos métodos de instalación. Elige el que se ajuste a tus necesidades:

### Método A: NPX (Sin Clonar)

**Ideal para:** Configuración rápida, usuarios nuevos, pipelines CI/CD

Este método descarga y ejecuta Claude-Craft directamente sin clonar el repositorio.

```bash
# Reemplaza 'symfony' con tu stack tech y 'es' con tu idioma
npx @the-bearded-bear/claude-craft install ~/mi-proyecto --tech=symfony --lang=es
```

**Ejemplo para un proyecto Flutter en inglés:**
```bash
npx @the-bearded-bear/claude-craft install ~/mi-proyecto --tech=flutter --lang=en
```

Salida esperada:
```
Installing Claude-Craft rules...
  ✓ Common rules installed
  ✓ Symfony rules installed
  ✓ Agents installed
  ✓ Commands installed
  ✓ Templates installed
  ✓ Checklists installed
  ✓ CLAUDE.md generated

Installation complete! Run 'claude' in your project directory to start.
```

**Si ves un error:**
- `npm ERR! 404` → Verifica tu conexión a internet
- `EACCES: permission denied` → Ejecuta con `sudo` o corrige permisos npm
- `command not found: npx` → Instala Node.js primero

---

### Método B: Makefile (Más Control)

**Ideal para:** Personalización, contribuidores al proyecto, uso offline

Este método requiere clonar el repositorio de Claude-Craft primero.

#### Paso B.1: Clonar Claude-Craft

```bash
# Clonar a una ubicación permanente
git clone https://github.com/TheBeardedBearSAS/claude-craft.git ~/claude-craft
```

Salida esperada:
```
Cloning into '/home/tunombre/claude-craft'...
remote: Enumerating objects: XXX, done.
...
Resolving deltas: 100% (XXX/XXX), done.
```

#### Paso B.2: Ejecutar la Instalación

```bash
# Navegar al directorio de Claude-Craft
cd ~/claude-craft

# Instalar reglas en tu proyecto
# Reemplaza 'symfony' con tu tech y 'es' con tu idioma
make install-symfony TARGET=~/mi-proyecto RULES_LANG=es
```

**Ejemplos para otros stacks:**
```bash
# Flutter en inglés
make install-flutter TARGET=~/mi-proyecto RULES_LANG=en

# React en francés
make install-react TARGET=~/mi-proyecto RULES_LANG=fr

# Python en alemán
make install-python TARGET=~/mi-proyecto RULES_LANG=de

# Solo reglas comunes (cualquier proyecto)
make install-common TARGET=~/mi-proyecto RULES_LANG=es
```

Salida esperada:
```
Installing Symfony rules to /home/tunombre/mi-proyecto...
  Creating .claude directory...
  Copying rules... done
  Copying agents... done
  Copying commands... done
  Copying templates... done
  Copying checklists... done
  Generating CLAUDE.md... done

Installation complete!
```

---

## 6. Verificar la Instalación

Después de la instalación, verifica que todo está en su lugar:

```bash
# Navegar a tu proyecto
cd ~/mi-proyecto

# Listar el directorio .claude
ls -la .claude/
```

Salida esperada:
```
total XX
drwxr-xr-x  8 user user 4096 Jan 12 10:00 .
drwxr-xr-x  3 user user 4096 Jan 12 10:00 ..
-rw-r--r--  1 user user 2048 Jan 12 10:00 CLAUDE.md
drwxr-xr-x  2 user user 4096 Jan 12 10:00 agents
drwxr-xr-x  2 user user 4096 Jan 12 10:00 checklists
drwxr-xr-x  4 user user 4096 Jan 12 10:00 commands
drwxr-xr-x  2 user user 4096 Jan 12 10:00 rules
drwxr-xr-x  2 user user 4096 Jan 12 10:00 templates
```

### Verificar Cada Componente

```bash
# Contar reglas (debería ser 15-25 según el stack)
ls .claude/rules/*.md | wc -l

# Contar agentes (debería ser 5-12)
ls .claude/agents/*.md | wc -l

# Contar comandos (debería tener subdirectorios)
ls .claude/commands/
```

**Si faltan archivos:**
- Vuelve a ejecutar el comando de instalación
- Verifica que tienes permisos de escritura en el directorio
- Ver la sección [Solución de Problemas](#10-solución-de-problemas)

---

## 7. Configurar el Contexto del Proyecto

El archivo más importante a personalizar es el contexto de tu proyecto. Esto le dice a Claude sobre TU proyecto específico.

### Opción A: Configuración Interactiva (Recomendada)

Usa el comando integrado para auto-detectar tu stack y responder preguntas específicas:

```bash
# Iniciar Claude Code
claude

# Ejecutar el comando de configuración
/common:setup-project-context
```

El comando va a:
1. **Auto-detectar** tu stack técnico, framework, base de datos y CI/CD
2. **Hacer preguntas** para información faltante (tipo de app, dominio, usuarios, cumplimiento)
3. **Generar** un archivo `.claude/references/<your-tech>/project-context.md` completo
4. **Sugerir próximos pasos** (agentes a ejecutar, secciones a completar)

**Modos disponibles:**
- `(defecto)` - Detección equilibrada + preguntas esenciales
- `--auto` - Detección máxima, preguntas mínimas
- `--full` - Cuestionario completo incluyendo objetivos y glosario

### Opción B: Configuración Manual

Si prefieres configurar manualmente, abre el archivo directamente:

```bash
# Abrir en tu editor (reemplaza 'nano' con 'code', 'vim', etc.)
nano .claude/references/<your-tech>/project-context.md
```

### Secciones a Personalizar

Encuentra y actualiza estas secciones:

```markdown
## Resumen del Proyecto
- **Nombre**: [Nombre de tu proyecto]
- **Descripción**: [¿Qué hace tu proyecto?]
- **Tipo**: [API / App Web / App Móvil / CLI / Biblioteca]

## Stack Técnico
- **Framework**: [ej: Symfony 7.0, Flutter 3.16]
- **Versión del Lenguaje**: [ej: PHP 8.3, Dart 3.2]
- **Base de Datos**: [ej: PostgreSQL 16, MySQL 8]

## Convenciones del Equipo
- **Estilo de Código**: [ej: PSR-12, Effective Dart]
- **Estrategia de Ramas**: [ej: GitFlow, Trunk-based]
- **Formato de Commits**: [ej: Conventional Commits]

## Reglas Específicas del Proyecto
- [Agrega cualquier regla personalizada para tu proyecto]
```

### Ejemplo: API de E-commerce

```markdown
## Resumen del Proyecto
- **Nombre**: ShopAPI
- **Descripción**: API RESTful para plataforma de e-commerce
- **Tipo**: API

## Stack Técnico
- **Framework**: Symfony 7.0 con API Platform
- **Versión del Lenguaje**: PHP 8.3
- **Base de Datos**: PostgreSQL 16

## Convenciones del Equipo
- **Estilo de Código**: PSR-12
- **Estrategia de Ramas**: GitFlow
- **Formato de Commits**: Conventional Commits

## Reglas Específicas del Proyecto
- Todos los precios deben almacenarse en centavos (entero)
- Usar UUID v7 para todos los identificadores de entidades
- Eliminación suave requerida para todas las entidades
```

Guarda el archivo cuando termines (en nano: `Ctrl+O`, luego `Enter`, luego `Ctrl+X`).

---

## 8. Primer Lanzamiento con Claude Code

Ahora iniciemos Claude Code y verifiquemos que todo funciona:

```bash
# Asegúrate de estar en el directorio de tu proyecto
cd ~/mi-proyecto

# Lanzar Claude Code
claude
```

Deberías ver Claude Code iniciar con un prompt.

### Probar que las Reglas Están Activas

Escribe este mensaje a Claude:

```
¿Qué reglas y directrices estás siguiendo para este proyecto?
```

Claude debería responder mencionando:
- Contexto del proyecto desde `00-project-context.md`
- Reglas de arquitectura
- Requisitos de testing
- Directrices específicas de la tecnología

**Si Claude no menciona tus reglas:**
- Asegúrate de estar en la raíz del proyecto (no en un subdirectorio)
- Verifica que el directorio `.claude/` existe
- Reinicia Claude Code

---

## 9. Probar tu Configuración

Ejecuta estas pruebas rápidas para verificar que todo funciona:

### Prueba 1: Verificar Comandos Disponibles

Pregunta a Claude:
```
Lista todos los comandos slash disponibles para este proyecto
```

Esperado: Claude debería listar comandos como `/common:analyze-feature`, `/{tech}:generate-crud`, etc.

### Prueba 2: Usar un Agente

Intenta invocar un agente:
```
@tdd-coach Ayúdame a entender cómo escribir tests para este proyecto
```

Esperado: Claude debería responder como el agente TDD Coach con orientación sobre testing.

### Prueba 3: Ejecutar un Comando

Prueba un comando simple:
```
/common:pre-commit-check
```

Esperado: Claude debería ejecutar una verificación de calidad pre-commit (puede reportar sin cambios si el proyecto está vacío).

### Checklist de Validación

- [ ] Claude Code inicia sin errores
- [ ] Claude menciona las reglas del proyecto cuando se le pregunta
- [ ] Los comandos slash son reconocidos
- [ ] Los agentes responden con conocimiento especializado
- [ ] El contexto del proyecto se refleja en las respuestas

---

## 10. Solución de Problemas

### Problemas de Instalación

**Problema:** `Permission denied` durante la instalación
```bash
# Solución 1: Corregir permisos del directorio
chmod 755 ~/mi-proyecto

# Solución 2: Ejecutar con sudo (no recomendado para npm)
sudo npx @the-bearded-bear/claude-craft install ...
```

**Problema:** `Command not found: npx`
```bash
# Solución: Instalar Node.js
brew install node  # macOS
sudo apt install nodejs npm  # Ubuntu/Debian
```

**Problema:** `ENOENT: no such file or directory`
```bash
# Solución: Crear el directorio destino primero
mkdir -p ~/mi-proyecto
```

### Problemas en Tiempo de Ejecución

**Problema:** Claude no ve las reglas
- Verifica que estás en la raíz del proyecto: `pwd`
- Verifica que `.claude/` existe: `ls -la .claude/`
- Reinicia Claude Code: sal y ejecuta `claude` de nuevo

**Problema:** Comandos no reconocidos
- Verifica el directorio de comandos: `ls .claude/commands/`
- Verifica permisos de archivos: `ls -la .claude/commands/*.md`

**Problema:** Agentes no responden
- Verifica el directorio de agentes: `ls .claude/agents/`
- Usa la sintaxis correcta: `@nombre-agente mensaje`

### Obtener Ayuda

Si aún estás atascado:
1. Consulta la [Guía de Solución de Problemas](06-troubleshooting.md)
2. Busca en [GitHub Issues](https://github.com/TheBeardedBearSAS/claude-craft/issues)
3. Abre un nuevo issue con tu mensaje de error

---

## 11. Próximos Pasos

¡Felicitaciones! Tu entorno Claude-Craft está listo. Esto es lo que sigue:

### Próximos Pasos Inmediatos

1. **Commitea tu configuración:**
   ```bash
   git add .claude/
   git commit -m "feat: add Claude-Craft configuration"
   ```

2. **Comienza a construir tu proyecto** con asistencia de IA

3. **Lee la Guía de Desarrollo de Funcionalidades** para aprender el flujo de trabajo TDD

### Lecturas Recomendadas

| Guía | Descripción |
|------|-------------|
| [Desarrollo de Funcionalidades](03-feature-development.md) | Flujo TDD con agentes y comandos |
| [Corrección de Bugs](04-bug-fixing.md) | Diagnóstico y tests de regresión |
| [Referencia de Herramientas](05-tools-reference.md) | Utilidades Multi-cuenta, StatusLine |
| [Añadir a Proyecto Existente](09-setup-existing-project.md) | Para tus otros proyectos |

### Tarjeta de Referencia Rápida

```bash
# Lanzar Claude Code
claude

# Agentes comunes
@api-designer      # Diseño de API
@database-architect # Esquema de base de datos
@tdd-coach         # Ayuda con testing
@{tech}-reviewer   # Revisión de código

# Comandos comunes
/common:analyze-feature     # Analizar requisitos
/{tech}:generate-crud       # Generar código CRUD
/common:pre-commit-check    # Verificación de calidad
/common:security-audit      # Auditoría de seguridad
```

---

[&larr; Anterior: Gestión del Backlog](07-backlog-management.md) | [Siguiente: Añadir a Proyecto Existente &rarr;](09-setup-existing-project.md)
