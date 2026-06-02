---
description: Agregar una nueva tecnología a claude-craft con las mejores prácticas de Context7 y búsqueda web
argument-hint: <nombre-de-tecnología>
---

# Agregar Tecnología

Eres un experto integrador de tecnología para claude-craft. Tu misión es agregar un nuevo stack tecnológico mediante:
1. Investigar las mejores prácticas usando Context7 MCP y búsqueda web
2. Generar todos los archivos necesarios (reglas, comandos, plantillas, habilidades, agentes)
3. Crear el script de instalación
4. Actualizar la documentación y la página de aterrizaje

## Argumentos
$ARGUMENTS

Argumentos:
- `nombre-de-tecnología`: Nombre de la tecnología a agregar (p. ej., "nextjs", "nestjs", "golang", "laravel")
- (Opcional) `categoría`: Categoría de la tecnología (frontend, backend, mobile, devops, fullstack)

Ejemplo: `/common:add-technology "nestjs"` o `/common:add-technology "golang" backend`

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## MISIÓN

### Paso 1: Analizar la Tecnología

Identificar:
- Nombre oficial y alias comunes
- Tipo: framework, librería, lenguaje, herramienta
- Categoría: frontend, backend, mobile, devops, fullstack
- Ecosistema: herramientas relacionadas, frameworks de pruebas, opciones de despliegue
- Público objetivo: web, móvil, API, CLI, etc.

### Paso 2: Investigar con Context7 (MCP)

**Usar Context7 para acceder a la documentación oficial:**

```
Consultar Context7 para:
1. Guía oficial de inicio rápido
2. Estructura de proyecto recomendada
3. Mejores prácticas y patrones de diseño
4. Estrategias de pruebas (unitarias, integración, e2e)
5. Mejores prácticas de seguridad
6. Consejos de optimización del rendimiento
7. Recomendaciones de despliegue
```

#### Información a Extraer

| Tema | Detalles a Encontrar |
|------|----------------------|
| Arquitectura | Patrones recomendados (MVC, Clean, Hexagonal, etc.) |
| Estándares de Código | Guía de estilo, convenciones de nomenclatura, estructura de archivos |
| Herramientas | Herramientas CLI, formateadores, linters, empaquetadores |
| Pruebas | Frameworks de pruebas, herramientas de cobertura, estrategias de mocking |
| Seguridad | Autenticación, autorización, vulnerabilidades comunes |
| Calidad | Análisis estático, verificación de tipos, prácticas de revisión de código |

### Paso 3: Complementar con Búsqueda Web

**Buscar tendencias 2026 y prácticas de la comunidad:**

1. **Últimas Tendencias**
   - Versión estable actual
   - Próximas funcionalidades
   - Advertencias de deprecación
   - Guías de migración

2. **Mejores Prácticas de la Comunidad**
   - Boilerplates populares
   - Configuraciones de producción
   - Benchmarks de rendimiento
   - Arquitecturas del mundo real

3. **Errores Comunes**
   - Errores frecuentes
   - Anti-patrones
   - Vulnerabilidades de seguridad
   - Cuellos de botella de rendimiento

4. **Ecosistema**
   - Librerías recomendadas
   - Herramientas de pruebas
   - Integraciones DevOps
   - Soluciones de monitoreo

### Paso 4: Generar Archivos de la Tecnología

**Crear la estructura de archivos completa en los 5 idiomas (en, fr, es, de, pt):**

```
Dev/i18n/{lang}/{TECHNOLOGY}/
├── CLAUDE.md.template
├── rules/
│   ├── 00-project-context.md.template
│   ├── 02-architecture-{tech}.md
│   ├── 03-coding-standards.md
│   ├── 06-tooling.md
│   ├── 07-testing-{tech}.md
│   ├── 08-quality-tools.md
│   └── 11-security-{tech}.md
├── commands/
│   ├── check-compliance.md
│   ├── check-architecture.md
│   ├── check-code-quality.md
│   ├── check-testing.md
│   ├── check-security.md
│   └── [generate-*.md si aplica]
├── templates/
│   └── [plantillas específicas de la tecnología]
├── checklists/
│   ├── pre-commit.md
│   └── new-feature.md
├── agents/
│   └── {tech}-reviewer.md
└── skills/
    └── [habilidades específicas de la tecnología]
```

#### Reglas a Generar

| Archivo | Contenido |
|---------|-----------|
| `02-architecture-{tech}.md` | Patrones de arquitectura, estructura de carpetas, principios de arquitectura limpia |
| `03-coding-standards.md` | Guía de estilo, convenciones de nomenclatura, organización de archivos |
| `06-tooling.md` | Comandos CLI, formateadores, linters, herramientas de compilación |
| `07-testing-{tech}.md` | Estrategias de pruebas, frameworks, requisitos de cobertura |
| `08-quality-tools.md` | Análisis estático, verificación de tipos, integración CI/CD |
| `11-security-{tech}.md` | Prácticas de seguridad, vulnerabilidades comunes, autenticación |

#### Comandos a Generar

| Comando | Propósito |
|---------|-----------|
| `check-compliance.md` | Auditoría de cumplimiento completa (puntuación /100) |
| `check-architecture.md` | Revisión de arquitectura |
| `check-code-quality.md` | Análisis de calidad del código |
| `check-testing.md` | Cobertura y calidad de pruebas |
| `check-security.md` | Auditoría de seguridad |

### Paso 5: Crear el Script de Instalación

**Generar `Dev/scripts/install-{tech}-rules.sh`:**

Seguir el patrón de los scripts existentes:
- Soportar las opciones `--lang`, `--force`, `--update`, `--dry-run`, `--backup`
- Copiar reglas genéricas desde Common/
- Copiar reglas específicas de la tecnología
- Generar CLAUDE.md y 00-project-context.md
- Mostrar el resumen de instalación

### Paso 6: Actualizar la Documentación

**Archivos a actualizar:**

| Archivo | Cambios |
|---------|---------|
| `README.md` | Agregar tecnología a la lista de stacks soportados |
| `docs/index.html` | Incrementar estadísticas, agregar tarjeta de tecnología |
| `docs/COMMANDS.md` | Documentar los nuevos comandos |
| `Makefile` | Agregar objetivo `install-{tech}` |

#### Actualizaciones de la Página de Aterrizaje (docs/index.html)

1. **Sección de Estadísticas**: Incrementar el contador de "Stacks Tecnológicos"
2. **Cuadrícula de Tecnologías**: Agregar nueva tarjeta de tecnología:

```html
<div class="bg-slate-800/50 p-6 rounded-xl border border-white/5 hover:border-brand-500/50 transition-colors text-center group">
    <div class="h-16 w-16 mx-auto bg-black rounded-full flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform">
        <span class="text-2xl font-bold text-white">{ICON}</span>
    </div>
    <h3 class="font-bold text-white">{TECH_NAME}</h3>
    <p class="text-xs text-slate-400 mt-2" data-i18n="tech_{tech}_desc">{DESCRIPTION}</p>
</div>
```

3. **Traducciones**: Agregar claves i18n para los 5 idiomas

#### Objetivo de Makefile

```makefile
install-{tech}:
	./Dev/scripts/install-{tech}-rules.sh --lang=$(RULES_LANG) $(OPTIONS) $(TARGET)
```

### Paso 7: Validación

#### Lista de Verificación de Definición de Hecho

```
══════════════════════════════════════════════════════════════
✅ DEFINICIÓN DE HECHO: Agregar Tecnología [{TECH_NAME}]
══════════════════════════════════════════════════════════════

📁 ARCHIVOS CREADOS
──────────────────────────────────────────────────────────────
- [ ] Reglas (7 archivos × 5 idiomas = 35 archivos)
- [ ] Comandos (5 archivos × 5 idiomas = 25 archivos)
- [ ] Plantillas (al menos 2 por idioma)
- [ ] Checklists (2 archivos × 5 idiomas = 10 archivos)
- [ ] Agente {tech}-reviewer (1 archivo × 5 idiomas = 5 archivos)
- [ ] CLAUDE.md.template (× 5 idiomas)
- [ ] Script de instalación (Dev/scripts/install-{tech}-rules.sh)

📄 DOCUMENTACIÓN ACTUALIZADA
──────────────────────────────────────────────────────────────
- [ ] README.md: Tecnología agregada a los stacks soportados
- [ ] docs/index.html: Estadísticas incrementadas
- [ ] docs/index.html: Tarjeta de tecnología agregada
- [ ] docs/index.html: Traducciones i18n agregadas (5 idiomas)
- [ ] docs/COMMANDS.md: Nuevos comandos documentados
- [ ] Makefile: Objetivo install-{tech} agregado

🧪 VERIFICACIÓN
──────────────────────────────────────────────────────────────
- [ ] El script de instalación se ejecuta sin errores
- [ ] Todos los archivos tienen el formato correcto
- [ ] Los comandos son funcionales
- [ ] La documentación es precisa

══════════════════════════════════════════════════════════════
```

### Formato de Salida

Después de completar todos los pasos, proporcionar:

```
══════════════════════════════════════════════════════════════
🎉 TECNOLOGÍA AGREGADA: {TECH_NAME}
══════════════════════════════════════════════════════════════

📊 RESUMEN
──────────────────────────────────────────────────────────────
Tecnología: {TECH_NAME}
Categoría: {CATEGORY}
Versión: {CURRENT_VERSION}

Archivos creados: {COUNT}
- Reglas: 35 archivos
- Comandos: 25 archivos
- Plantillas: {COUNT}
- Checklists: 10 archivos
- Agentes: 5 archivos

📁 ESTRUCTURA
──────────────────────────────────────────────────────────────
Dev/i18n/
├── en/{TECH}/
├── fr/{TECH}/
├── es/{TECH}/
├── de/{TECH}/
└── pt/{TECH}/

Dev/scripts/
└── install-{tech}-rules.sh

🔧 INSTALACIÓN
──────────────────────────────────────────────────────────────
# Vía Makefile
make install-{tech} TARGET=~/mi-proyecto RULES_LANG=en

# Script directo
./Dev/scripts/install-{tech}-rules.sh ~/mi-proyecto

📚 DOCUMENTACIÓN
──────────────────────────────────────────────────────────────
- README.md ✅ Actualizado
- docs/index.html ✅ Actualizado
- docs/COMMANDS.md ✅ Actualizado
- Makefile ✅ Actualizado

✅ DEFINICIÓN DE HECHO: COMPLETA
══════════════════════════════════════════════════════════════
```

### Directrices Importantes

1. **Investigar Primero** — Siempre usar Context7 y búsqueda web antes de generar archivos
2. **Seguir Patrones** — Usar tecnologías existentes (React, Symfony, Flutter) como plantillas
3. **Los 5 Idiomas** — Generar contenido para en, fr, es, de, pt
4. **Calidad sobre Velocidad** — Asegurarse de que todos los archivos estén correctamente formateados y sean funcionales
5. **Actualizar Todo** — No olvidar la documentación y la página de aterrizaje

### Manejo de Errores

Si la investigación falla:
- Indicar claramente qué información falta
- Proponer fuentes alternativas
- Pedir aclaración al usuario si es necesario
- NUNCA generar archivos con contenido provisional o inventado
