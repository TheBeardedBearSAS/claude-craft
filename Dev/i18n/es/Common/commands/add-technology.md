---
description: Añadir una nueva tecnología a claude-craft con best practices de Context7 y búsqueda web
argument-hint: <nombre-tecnología>
---

# Añadir Tecnología

Eres un experto integrador de tecnologías para claude-craft. Tu misión es añadir una nueva stack tecnológica:
1. Investigando best practices usando Context7 MCP y búsqueda web
2. Generando todos los archivos necesarios (rules, commands, templates, skills, agents)
3. Creando el script de instalación
4. Actualizando documentación y página de presentación

## Argumentos
$ARGUMENTS

Argumentos:
- `nombre-tecnología`: Nombre de la tecnología a añadir (ej: "nextjs", "nestjs", "golang", "laravel")
- (Opcional) `categoría`: Categoría de la tecnología (frontend, backend, mobile, devops, fullstack)

Ejemplo: `/common:add-technology "nestjs"` o `/common:add-technology "golang" backend`

## MISIÓN

### Paso 1: Analizar la Tecnología

Identificar:
- Nombre oficial y alias comunes
- Tipo: framework, biblioteca, lenguaje, herramienta
- Categoría: frontend, backend, mobile, devops, fullstack
- Ecosistema: herramientas relacionadas, frameworks de testing, opciones de despliegue
- Público objetivo: web, mobile, API, CLI, etc.

### Paso 2: Investigar con Context7 (MCP)

**Usar Context7 para acceder a documentación oficial:**

```
Consultar Context7 para:
1. Guía oficial de inicio
2. Estructura de proyecto recomendada
3. Best practices y design patterns
4. Estrategias de testing (unitario, integración, e2e)
5. Best practices de seguridad
6. Consejos de optimización de rendimiento
7. Recomendaciones de despliegue
```

#### Información a Extraer

| Tema | Detalles a Encontrar |
|------|---------------------|
| Arquitectura | Patrones recomendados (MVC, Clean, Hexagonal, etc.) |
| Estándares de Código | Guía de estilo, convenciones de nomenclatura, estructura de archivos |
| Herramientas | Herramientas CLI, formateadores, linters, bundlers |
| Testing | Frameworks de test, herramientas de cobertura, estrategias de mock |
| Seguridad | Autenticación, autorización, vulnerabilidades comunes |
| Calidad | Análisis estático, verificación de tipos, prácticas de review |

### Paso 3: Complementar con Búsqueda Web

**Buscar tendencias 2026 y prácticas de la comunidad:**

1. **Últimas Tendencias**
   - Versión estable actual
   - Características próximas
   - Avisos de deprecación
   - Guías de migración

2. **Best Practices de la Comunidad**
   - Boilerplates populares
   - Configuraciones de producción
   - Benchmarks de rendimiento
   - Arquitecturas reales

3. **Errores Comunes**
   - Errores frecuentes
   - Anti-patrones
   - Vulnerabilidades de seguridad
   - Cuellos de botella de rendimiento

4. **Ecosistema**
   - Bibliotecas recomendadas
   - Herramientas de testing
   - Integraciones DevOps
   - Soluciones de monitoreo

### Paso 4: Generar Archivos de Tecnología

**Crear la estructura completa en los 5 idiomas (en, fr, es, de, pt):**

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
│   └── [templates específicos de la tecnología]
├── checklists/
│   ├── pre-commit.md
│   └── new-feature.md
├── agents/
│   └── {tech}-reviewer.md
└── skills/
    └── [skills específicos de la tecnología]
```

### Paso 5: Crear Script de Instalación

**Generar `Dev/scripts/install-{tech}-rules.sh`:**

Seguir el patrón de scripts existentes:
- Soporte de opciones `--lang`, `--force`, `--update`, `--dry-run`, `--backup`
- Copiar reglas genéricas desde Common/
- Copiar reglas específicas de la tecnología
- Generar CLAUDE.md y 00-project-context.md
- Mostrar resumen de instalación

### Paso 6: Actualizar Documentación

**Archivos a actualizar:**

| Archivo | Cambios |
|---------|---------|
| `README.md` | Añadir tecnología a la lista de stacks soportadas |
| `docs/index.html` | Incrementar stats, añadir tarjeta de tecnología |
| `docs/COMMANDS.md` | Documentar nuevos comandos |
| `Makefile` | Añadir target `install-{tech}` |

### Paso 7: Validación

#### Checklist Definition of Done

```
══════════════════════════════════════════════════════════════
✅ DEFINITION OF DONE: Añadir Tecnología [{NOMBRE_TECH}]
══════════════════════════════════════════════════════════════

📁 ARCHIVOS CREADOS
──────────────────────────────────────────────────────────────
- [ ] Rules (7 archivos × 5 idiomas = 35 archivos)
- [ ] Commands (5 archivos × 5 idiomas = 25 archivos)
- [ ] Templates (al menos 2 por idioma)
- [ ] Checklists (2 archivos × 5 idiomas = 10 archivos)
- [ ] Agent {tech}-reviewer (1 archivo × 5 idiomas = 5 archivos)
- [ ] CLAUDE.md.template (× 5 idiomas)
- [ ] Script de instalación (Dev/scripts/install-{tech}-rules.sh)

📄 DOCUMENTACIÓN ACTUALIZADA
──────────────────────────────────────────────────────────────
- [ ] README.md: Tecnología añadida a stacks soportadas
- [ ] docs/index.html: Stats incrementadas
- [ ] docs/index.html: Tarjeta de tecnología añadida
- [ ] docs/index.html: Traducciones i18n añadidas (5 idiomas)
- [ ] docs/COMMANDS.md: Nuevos comandos documentados
- [ ] Makefile: Target install-{tech} añadido

🧪 VERIFICACIÓN
──────────────────────────────────────────────────────────────
- [ ] El script de instalación se ejecuta sin errores
- [ ] Todos los archivos están correctamente formateados
- [ ] Los comandos son funcionales
- [ ] La documentación es precisa

══════════════════════════════════════════════════════════════
```

### Directrices Importantes

1. **Investigar primero** - Siempre usar Context7 y búsqueda web antes de generar archivos
2. **Seguir patrones** - Usar tecnologías existentes (React, Symfony, Flutter) como plantillas
3. **Los 5 idiomas** - Generar contenido para en, fr, es, de, pt
4. **Calidad sobre velocidad** - Asegurar que todos los archivos estén correctamente formateados
5. **Actualizar todo** - No olvidar documentación y página de inicio

### Manejo de Errores

Si la investigación falla:
- Indicar claramente qué información falta
- Proponer fuentes alternativas
- Pedir aclaraciones al usuario si es necesario
- NUNCA generar archivos con contenido placeholder o inventado
