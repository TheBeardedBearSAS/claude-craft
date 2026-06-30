# Añadir Claude-Craft a un Proyecto Existente

Este tutorial completo te guía a través de añadir Claude-Craft a un proyecto que ya tiene código. Aprenderás a instalar de forma segura, hacer que Claude entienda tu codebase, y hacer push de tus primeras modificaciones asistidas por IA.

**Tiempo requerido:** ~20-30 minutos

---

## Tabla de Contenidos

1. [Antes de Empezar](#1-antes-de-empezar)
2. [Respaldar tu Proyecto](#2-respaldar-tu-proyecto)
3. [Analizar la Estructura de tu Proyecto](#3-analizar-la-estructura-de-tu-proyecto)
4. [Verificar Conflictos](#4-verificar-conflictos)
5. [Elegir tu Stack Tecnológico](#5-elegir-tu-stack-tecnológico)
6. [Instalar Claude-Craft](#6-instalar-claude-craft)
7. [Fusionar Configuraciones](#7-fusionar-configuraciones)
8. [Hacer que Claude Entienda tu Codebase](#8-hacer-que-claude-entienda-tu-codebase)
9. [Tu Primera Modificación](#9-tu-primera-modificación)
10. [Incorporación del Equipo](#10-incorporación-del-equipo)
11. [Migración desde Otras Herramientas de IA](#11-migración-desde-otras-herramientas-de-ia)
12. [Solución de Problemas](#12-solución-de-problemas)

---

## 1. Antes de Empezar

### Advertencias Importantes

> **Advertencia:** Instalar Claude-Craft creará un directorio `.claude/` en tu proyecto. Si ya existe uno, deberás decidir si fusionarlo, reemplazarlo o preservarlo.

> **Advertencia:** Siempre crea una rama de respaldo antes de la instalación. Esto permite un rollback fácil si algo sale mal.

### Checklist de Requisitos Previos

- [ ] Tu proyecto está rastreado en Git
- [ ] Has commiteado todos los cambios actuales
- [ ] Tienes acceso de escritura al directorio del proyecto
- [ ] Node.js 20+ instalado (para el método NPX)
- [ ] Claude Code instalado

### Cuándo NO Instalar

Considera posponer la instalación si:
- Tienes cambios sin commitear
- Estás en medio de un release crítico
- El proyecto tiene una configuración `.claude/` existente compleja
- Varios miembros del equipo están haciendo push activamente

---

## 2. Respaldar tu Proyecto

**Nunca omitas este paso.** Crea una rama de respaldo antes de la instalación.

### Crear Rama de Respaldo

```bash
# Navega a tu proyecto
cd ~/tu-proyecto-existente

# Asegúrate de que todo está commiteado
git status
```

Si ves cambios sin commitear:
```bash
git add .
git commit -m "chore: save work before Claude-Craft installation"
```

Ahora crea el respaldo:
```bash
# Crear y quedarse en la rama de respaldo
git checkout -b backup/before-claude-craft

# Volver a tu rama principal
git checkout main  # o 'master' o tu rama por defecto
```

### Verificar el Respaldo

```bash
# Confirmar que la rama de respaldo existe
git branch | grep backup
```

Salida esperada:
```
  backup/before-claude-craft
```

### Plan de Rollback

Si algo sale mal, puedes hacer rollback:
```bash
# Descartar todos los cambios y volver al respaldo
git checkout backup/before-claude-craft
git branch -D main
git checkout -b main
```

---

## 3. Analizar la Estructura de tu Proyecto

Antes de instalar, entiende lo que ya tienes.

### Verificar si Existe el Directorio .claude

```bash
# Verificar si .claude ya existe
ls -la .claude/ 2>/dev/null || echo "No .claude directory found"
```

**Si .claude existe:**
- Nota qué archivos hay dentro
- Decide: fusionar, reemplazar o preservar
- Ver [Sección 7: Fusionar Configuraciones](#7-fusionar-configuraciones)

### Identificar la Estructura de tu Proyecto

```bash
# Listar directorio raíz
ls -la

# Mostrar árbol de directorios (primeros 2 niveles)
find . -maxdepth 2 -type d | head -20
```

Toma nota de:
- Directorios fuente principales (`src/`, `app/`, `lib/`)
- Archivos de configuración (`.env`, `config/`, `settings/`)
- Directorios de tests (`tests/`, `test/`, `spec/`)
- Documentación (`docs/`, `README.md`)

### Verificar Otras Configuraciones de Herramientas IA

```bash
# Verificar reglas de Cursor
ls -la .cursorrules 2>/dev/null

# Verificar instrucciones de GitHub Copilot
ls -la .github/copilot-instructions.md 2>/dev/null

# Verificar otras configs de Claude
ls -la CLAUDE.md 2>/dev/null
```

Nota cualquier configuración existente - puede que quieras migrarlas (ver [Sección 11](#11-migración-desde-otras-herramientas-de-ia)).

---

## 4. Verificar Conflictos

### Archivos que Pueden Conflictar

| Archivo/Directorio | Claude-Craft Crea | Tu Proyecto Puede Tener |
|--------------------|-------------------|-------------------------|
| `.claude/` | Sí | Quizás |
| `.claude/CLAUDE.md` | Sí | Quizás |
| `.claude/rules/` | Sí | Quizás |
| `CLAUDE.md` (raíz) | No | Quizás |

### Matriz de Decisión

| Escenario | Recomendación |
|-----------|---------------|
| No existe `.claude/` | Instalar normalmente |
| `.claude/` vacío existe | Instalar con `--force` |
| `.claude/` tiene reglas personalizadas | Usar `--preserve-config` |
| `CLAUDE.md` raíz existe | Mantenerlo, no conflictará |

---

## 5. Elegir tu Stack Tecnológico

Identifica la tecnología principal de tu proyecto:

| Tu Proyecto Usa | Comando de Instalación |
|-----------------|------------------------|
| C#/.NET | `--tech=csharp` |
| PHP/Symfony | `--tech=symfony` |
| PHP/Laravel | `--tech=laravel` |
| PHP (genérico) | `--tech=php` |
| Dart/Flutter | `--tech=flutter` |
| Python/FastAPI/Django | `--tech=python` |
| JavaScript/React | `--tech=react` |
| JavaScript/React Native | `--tech=reactnative` |
| TypeScript/Angular | `--tech=angular` |
| JavaScript/Vue.js | `--tech=vuejs` |
| Múltiples/Otro | `--tech=common` |

**Para monorepos:** Instala en cada subproyecto por separado (ver abajo).

---

## 6. Instalar Claude-Craft

### Instalación Estándar

**Método A: NPX (Recomendado)**
```bash
cd ~/tu-proyecto-existente
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=es
```

**Método B: Makefile**
```bash
cd ~/claude-craft
make install-symfony TARGET=~/tu-proyecto-existente RULES_LANG=es
```

### Preservar Configuración Existente

Si tienes archivos `.claude/` existentes que quieres mantener:

```bash
# NPX con flag de preservación
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=es --preserve-config

# Makefile con flag de preservación
make install-symfony TARGET=~/tu-proyecto-existente RULES_LANG=es OPTIONS="--preserve-config"
```

**Lo que `--preserve-config` mantiene:**
- `CLAUDE.md` (tu descripción del proyecto)
- `rules/00-project-context.md` (tu contexto personalizado)
- Cualquier regla personalizada que hayas añadido

### Instalación en Monorepo

Para proyectos con múltiples apps:

```
mi-monorepo/
├── frontend/    (React)
├── backend/     (Symfony)
└── mobile/      (Flutter)
```

Instala en cada directorio:
```bash
# Instalar React en frontend
npx @the-bearded-bear/claude-craft install ./frontend --tech=react --lang=es

# Instalar Symfony en backend
npx @the-bearded-bear/claude-craft install ./backend --tech=symfony --lang=es

# Instalar Flutter en mobile
npx @the-bearded-bear/claude-craft install ./mobile --tech=flutter --lang=es
```

### Verificar la Instalación

```bash
ls -la .claude/
```

Estructura esperada:
```
.claude/
├── CLAUDE.md
├── agents/
├── checklists/
├── commands/
├── rules/
└── templates/
```

---

## 7. Fusionar Configuraciones

Si tenías configuraciones existentes, fusiónalas ahora.

### Fusionar CLAUDE.md

Si tenías un `CLAUDE.md` personalizado:

1. Abre ambos archivos:
   ```bash
   # Tu archivo antiguo (si está respaldado)
   cat .claude/CLAUDE.md.backup

   # Nuevo archivo Claude-Craft
   cat .claude/CLAUDE.md
   ```

2. Copia tus secciones personalizadas al nuevo archivo
3. Mantén la estructura de Claude-Craft, añade tu contenido

### Fusionar Reglas Personalizadas

Si tenías reglas personalizadas en `rules/`:

1. Las reglas de Claude-Craft están numeradas de `01-xx.md` a `12-xx.md`
2. Añade tus reglas personalizadas como `90-custom-rule.md`, `91-another-rule.md`
3. Números más altos = menor prioridad, pero aún incluidas

### Ejemplo de Fusión

```bash
# Renombrar tu antigua regla personalizada
mv .claude/rules/my-custom-rules.md .claude/rules/90-project-custom-rules.md
```

---

## 8. Hacer que Claude Entienda tu Codebase

**Esta es la sección más importante.** Una instalación exitosa de Claude-Craft no es solo instalar archivos—es hacer que Claude realmente entienda tu proyecto.

### 8.1 Exploración Inicial del Codebase

Lanza Claude Code en tu proyecto:

```bash
cd ~/tu-proyecto-existente
claude
```

Comienza con una exploración amplia:

```
Explora este codebase y dame un resumen completo de:
1. La estructura general del proyecto
2. Directorios principales y sus propósitos
3. Puntos de entrada clave
4. Archivos de configuración que encuentres
```

**Resultado esperado:** Claude debería describir la estructura de tu proyecto con precisión. Si se equivoca en algo, corrígelo—esto ayuda a Claude a aprender.

**Verifica la comprensión de Claude:**
```
Basándote en lo que encontraste, ¿qué tipo de proyecto es este?
¿Qué framework o stack tecnológico se usa?
```

### 8.2 Entender la Arquitectura

Pide a Claude que identifique patrones arquitectónicos:

```
Analiza la arquitectura de este proyecto:
1. ¿Qué patrón arquitectónico sigue? (MVC, Clean Architecture, etc.)
2. ¿Cuáles son las capas principales y sus responsabilidades?
3. ¿Cómo está organizado el código en módulos/dominios?
4. ¿Qué patrones de diseño ves que se usan?
```

**Verifica con preguntas específicas:**
```
Muéstrame un ejemplo de cómo una petición fluye a través del sistema,
desde el punto de entrada hasta la base de datos y de vuelta.
```

Si el análisis de Claude es preciso, ¡genial! Si no, corrígelo:
```
En realidad, este proyecto usa Clean Architecture con estas capas:
- Domain (src/Domain/)
- Application (src/Application/)
- Infrastructure (src/Infrastructure/)
- Presentation (src/Controller/)
Por favor actualiza tu comprensión.
```

### 8.3 Descubrir la Lógica de Negocio

Ayuda a Claude a entender qué hace realmente tu proyecto:

```
¿Cuáles son los principales dominios de negocio o funcionalidades en este codebase?
Lista las entidades principales y explica sus relaciones.
```

**Usa agentes especializados:**

```
@database-architect
Analiza el esquema de base de datos de este proyecto.
¿Cuáles son las entidades principales, sus relaciones y patrones que notas?
```

```
@api-designer
Revisa los endpoints de API de este proyecto.
¿Qué recursos se exponen? ¿Qué patrones se usan?
```

### 8.4 Documentar el Contexto

Tienes dos opciones para configurar el contexto del proyecto:

**Opción A: Configuración Interactiva (Recomendada)**

Usa el comando integrado para detectar automáticamente tu stack y responder preguntas específicas:

```bash
/common:setup-project-context
```

El comando analizará tu codebase existente, detectará tecnologías y preguntará solo por la información faltante.

**Opción B: Configuración Manual**

Crea o actualiza el archivo de contexto del proyecto manualmente:

```bash
nano .claude/references/<your-tech>/project-context.md
```

Completa la plantilla con lo que has descubierto:

```markdown
## Resumen del Proyecto
- **Nombre**: [Nombre de tu proyecto]
- **Descripción**: [Lo que Claude aprendió + tus añadidos]
- **Dominio**: [ej: E-commerce, Salud, FinTech]

## Arquitectura
- **Patrón**: [Lo que Claude identificó]
- **Capas**: [Lístalas]
- **Directorios Clave**:
  - `src/Domain/` - Lógica de negocio y entidades
  - `src/Application/` - Casos de uso y servicios
  - [etc.]

## Contexto de Negocio
- **Entidades Principales**: [Lista objetos de dominio principales]
- **Flujos Clave**: [Describe los principales journeys de usuario]
- **Integraciones Externas**: [APIs, servicios a los que te conectas]

## Convenciones de Desarrollo
- **Testing**: [Tu enfoque de testing]
- **Estilo de Código**: [Tus estándares]
- **Flujo Git**: [Tu estrategia de ramas]

## Notas Importantes para la IA
- [Cualquier cosa que Claude debería recordar siempre]
- [Trampas a evitar]
- [Consideraciones especiales]
```

Guarda y verifica que Claude lo ve:
```
Lee el archivo de contexto del proyecto y resume lo que entiendes
ahora sobre este proyecto.
```

---

## 9. Tu Primera Modificación

Ahora hagamos tu primer cambio asistido por IA y hagamos push.

### 9.1 Elegir una Tarea Simple

Buenos primeros tasks:
- [ ] Añadir un test unitario faltante
- [ ] Corregir un pequeño bug
- [ ] Añadir documentación a una función
- [ ] Refactorizar un método para mayor claridad
- [ ] Añadir validación de entrada

**Evitar para la primera tarea:**
- Funcionalidades grandes
- Cambios de seguridad críticos
- Migraciones de base de datos
- Cambios de API que rompen compatibilidad

### 9.2 Dejar que Claude Analice

Pide a Claude que analice antes de hacer cambios:

```
Quiero [describir tu tarea].

Antes de hacer cualquier cambio:
1. Analiza el código relevante
2. Explica tu enfoque
3. Lista los archivos que modificarás
4. Describe los tests que añadirás o actualizarás
```

**Revisa el plan de Claude cuidadosamente.** Haz preguntas:
```
¿Por qué elegiste este enfoque?
¿Hay riesgos con este cambio?
¿Qué tests verificarán que funciona?
```

### 9.3 Implementar el Cambio

Una vez satisfecho con el plan:
```
Adelante, implementa este cambio siguiendo TDD:
1. Primero escribe/actualiza los tests
2. Luego implementa el código
3. Ejecuta los tests para verificar
```

### 9.4 Revisar y Commitear

Antes de commitear, ejecuta verificaciones de calidad:

```
/common:pre-commit-check
```

Revisa todos los cambios:
```bash
git diff
git status
```

Si todo se ve bien:
```bash
# Stage los cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: [describe lo que hiciste]

- [punto sobre el cambio]
- [otro cambio]
- Added tests for [funcionalidad]

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 9.5 Hacer Push de tus Cambios

```bash
# Push al remoto
git push origin main
```

Si tu CI/CD se ejecuta, verifica que pase:
```bash
# Verificar estado de CI (si usas GitHub)
gh run list --limit 1
```

**¡Felicitaciones!** Has hecho tu primera modificación asistida por IA.

---

## 10. Incorporación del Equipo

Comparte Claude-Craft con tu equipo.

### Commitear la Configuración

```bash
# Añadir archivos de Claude-Craft a git
git add .claude/

# Commit
git commit -m "feat: add Claude-Craft AI development configuration

- Added rules for [tu stack tech]
- Configured project context
- Added agents and commands"

# Push
git push origin main
```

### Notificar a tu Equipo

Crea una guía breve para compañeros:

```markdown
## Usar Claude-Craft en Este Proyecto

1. Instalar Claude Code: [link]
2. Pull últimos cambios: `git pull`
3. Lanzar en el proyecto: `cd project && claude`

### Comandos Rápidos
- `/common:pre-commit-check` - Ejecutar antes de commitear
- `@tdd-coach` - Ayuda con tests
- `@{tech}-reviewer` - Revisión de código

### Contexto del Proyecto
Nuestro asistente de IA entiende:
- [Patrones de arquitectura que usamos]
- [Convenciones de código]
- [Dominio de negocio]
```

### Demo de Equipo

Considera hacer una demo corta:
1. Mostrar Claude explorando el codebase
2. Demostrar una tarea simple
3. Mostrar el flujo pre-commit
4. Responder preguntas

---

## 11. Migración desde Otras Herramientas de IA

Si usas otras herramientas de codificación con IA, migra sus configuraciones.

### Desde Cursor Rules (.cursorrules)

```bash
# Verificar si tienes reglas de Cursor
cat .cursorrules 2>/dev/null
```

Migración:
1. Abre `.cursorrules`
2. Copia las reglas relevantes
3. Añádelas a `.claude/rules/90-migrated-cursor-rules.md`
4. Adapta el formato al estilo de Claude-Craft

### Desde GitHub Copilot Instructions

```bash
# Verificar instrucciones de Copilot
cat .github/copilot-instructions.md 2>/dev/null
```

Migración:
1. Abre las instrucciones de Copilot
2. Extrae las directrices de codificación
3. Añade al contexto del proyecto o reglas personalizadas

### Desde Otras Configuraciones de Claude

Si tienes un `CLAUDE.md` en la raíz:
```bash
# Revisar config existente
cat CLAUDE.md 2>/dev/null
```

Migración:
1. Compara con el nuevo `.claude/CLAUDE.md`
2. Fusiona contenido único
3. Mantén el `CLAUDE.md` raíz si tiene documentación del proyecto
4. Elimínalo si es redundante con `.claude/`

### Tabla de Mapeo de Migración

| Ubicación Antigua | Ubicación Claude-Craft |
|-------------------|------------------------|
| `.cursorrules` | `.claude/rules/90-custom.md` |
| `.github/copilot-instructions.md` | `.claude/references/<your-tech>/project-context.md` |
| `CLAUDE.md` (raíz) | `.claude/CLAUDE.md` |
| Prompts personalizados | `.claude/commands/custom/` |

---

## 12. Solución de Problemas

### Problemas de Instalación

**Problema:** Error "Directory already exists"
```bash
# Solución: Usar flag force
npx @the-bearded-bear/claude-craft install . --tech=symfony --force
```

**Problema:** "Permission denied"
```bash
# Solución: Verificar propiedad
ls -la .claude/
# Corregir permisos
chmod -R 755 .claude/
```

**Problema:** "CLAUDE.md not found" después de instalar
```bash
# Solución: Re-ejecutar instalación
npx @the-bearded-bear/claude-craft install . --tech=symfony --lang=es
```

### Problemas de Comprensión de Claude

**Problema:** Claude no entiende la estructura de mi proyecto

Solución: Sé explícito en tu archivo de contexto y durante la conversación:
```
Este proyecto usa [patrón específico]. El código fuente principal está en [directorio].
Cuando pregunto sobre [término de dominio], me refiero a [explicación].
```

**Problema:** Claude sugiere patrones incorrectos

Solución: Corrige y refuerza:
```
No usamos [patrón] en este proyecto. Usamos [patrón correcto] porque [razón].
Por favor recuerda esto para sugerencias futuras.
```

**Problema:** Claude olvida contexto entre sesiones

Solución: Asegúrate de que `00-project-context.md` sea completo. La información clave debe estar en archivos, no solo en la conversación.

### Rollback

Si necesitas deshacer la instalación:

```bash
# Eliminar archivos de Claude-Craft
rm -rf .claude/

# Restaurar desde rama de respaldo
git checkout backup/before-claude-craft -- .

# O hard reset
git checkout backup/before-claude-craft
```

---

## Resumen

Has logrado exitosamente:
- [x] Respaldar tu proyecto
- [x] Instalar Claude-Craft de forma segura
- [x] Hacer que Claude entienda tu codebase
- [x] Hacer tu primera modificación asistida por IA
- [x] Hacer push de cambios a tu repositorio
- [x] Preparar la incorporación del equipo

### ¿Qué Sigue?

| Tarea | Guía |
|-------|------|
| Aprender el flujo TDD completo | [Desarrollo de Funcionalidades](03-feature-development.md) |
| Debuggear efectivamente | [Corrección de Bugs](04-bug-fixing.md) |
| Gestionar tu backlog con IA | [Gestión del Backlog](07-backlog-management.md) |
| Explorar herramientas avanzadas | [Referencia de Herramientas](05-tools-reference.md) |

---

[&larr; Anterior: Configuración Proyecto Nuevo](08-setup-new-project.md) | [Volver al Índice](../index.md)
