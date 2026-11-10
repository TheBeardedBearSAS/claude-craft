# Architecture Decision Records (ADR)

> Documentación de las decisiones arquitecturales importantes del proyecto

## ¿Qué es un ADR?

Un **Architecture Decision Record** (ADR) es un documento que captura una decisión arquitectural importante, incluyendo:
- El **contexto** y el problema a resolver
- Las **alternativas** consideradas con sus ventajas/desventajas
- La **decisión** tomada y su justificación
- Las **consecuencias** positivas Y negativas
- Los detalles de **implementación**

**Formato utilizado**: MADR 4.0.0 (Markdown Any Decision Records)

---

## Índice de ADRs

### Críticos (P0)

| ADR | Título | Estado | Fecha | Tags |
|-----|--------|--------|-------|------|
| [0001](0001-halite-encryption.md) | Cifrado Halite para Datos Sensibles GDPR | ✅ Accepted | 2025-11-26 | security, gdpr, halite |
| [0002](0002-gedmo-doctrine-extensions.md) | Gedmo Doctrine Extensions para Audit Trail | ✅ Accepted | 2025-11-26 | audit, gedmo, gdpr |
| [0003](0003-clean-architecture-ddd.md) | Clean Architecture + DDD + Hexagonal | 🔄 Refactoring | 2025-11-26 | architecture, ddd |

### Importantes (P1)

| ADR | Título | Estado | Fecha | Tags |
|-----|--------|--------|-------|------|
| [0004](0004-docker-multi-stage.md) | Docker Multi-stage para Dev y Prod | ✅ Accepted | 2025-11-26 | docker, infra |
| [0005](0005-symfony-messenger-async.md) | Symfony Messenger para Emails Asíncronos | 📝 Proposed | 2025-11-26 | async, messaging |
| [0006](0006-postgresql-database.md) | PostgreSQL 16 como Base de Datos | ✅ Accepted | 2025-11-26 | database |

### Estándar (P2)

| ADR | Título | Estado | Fecha | Tags |
|-----|--------|--------|-------|------|
| [0007](0007-easyadmin-backoffice.md) | EasyAdmin para el Backoffice | ✅ Accepted | 2025-11-26 | admin, crud |
| [0008](0008-tailwind-alpine-frontend.md) | Tailwind CSS + Alpine.js para Frontend | ✅ Accepted | 2025-11-26 | frontend |
| [0009](0009-phpstan-quality-tools.md) | PHPStan y Herramientas de Calidad | ✅ Accepted | 2025-11-26 | quality, phpstan |
| [0010](0010-conventional-commits.md) | Conventional Commits | ✅ Accepted | 2025-11-26 | git, commits |

### Leyenda de Estados

- 📝 **Proposed**: En discusión, aún no aceptada
- ✅ **Accepted**: Decisión validada y en producción
- 🔄 **Refactoring**: Implementación en curso (migración progresiva)
- ⚠️ **Deprecated**: Obsoleta, no usar
- 🔄 **Superseded**: Reemplazada por una nueva ADR (ver enlace)

---

## ¿Cuándo Crear un ADR?

### ✅ CREAR un ADR si:

- **Decisión arquitectural estructural** impactando > 1 bounded context
- **Trade-offs significativos** entre varias opciones viables
- **Restricción** regulatoria/seguridad/rendimiento imponiendo una elección
- **Pregunta recurrente** en code review necesitando una respuesta oficial
- **Cambio de paradigma** (ej: sync → async, monolito → microservicios)
- **Elección de tecnología** mayor (framework, biblioteca, infraestructura)
- **Patrón arquitectural** nuevo para el equipo

### ❌ NO CREAR un ADR si:

- **Decisión táctica local** afectando < 3 archivos
- **Bug fix** simple sin impacto arquitectural
- **CRUD estándar** siguiendo patrones existentes
- **Actualización de dependencia menor** (patch/minor version)
- **Elección obvia** sin alternativa viable
- **Configuración** de entorno (salvo si impacta seguridad/conformidad)

**Regla de oro**: Si dudas, discútelo con el Lead Dev antes de crear el ADR.

---

## Proceso de Creación de un ADR

### 1️⃣ Propuesta (Status: Proposed)

```bash
# 1. Crear rama dedicada
git checkout -b adr/0011-titulo-decision

# 2. Copiar la plantilla
cp .claude/adr/template.md .claude/adr/0011-titulo-decision.md

# 3. Completar todas las secciones obligatorias
# - Mínimo 2 opciones con ventajas/desventajas
# - Justificación clara de la decisión
# - Consecuencias positivas Y negativas

# 4. Commit
git add .claude/adr/0011-titulo-decision.md
git commit -m "docs: add ADR-0011 for [titulo] (Proposed)"
```

### 2️⃣ Discusión (Pull Request)

```bash
# 5. Push y crear PR
git push origin adr/0011-titulo-decision

# 6. Abrir PR con título: [ADR] ADR-0011: Título Decisión
#    - Tag: [ADR]
#    - Reviewers: Lead Dev + 1 Senior mínimo
#    - Descripción: Enlace al ADR en el cuerpo del PR
```

**Elementos a discutir en PR**:
- ¿Se han considerado todas las opciones?
- ¿Es convincente la justificación?
- ¿Son aceptables las consecuencias negativas?
- ¿Hay riesgos no documentados?
- ¿Está clara la implementación?

### 3️⃣ Aceptación (Status: Accepted)

**Criterios de aceptación**:
- ✅ Mínimo 2 reviewers han aprobado (Lead Dev + 1 Senior)
- ✅ Todas las secciones obligatorias completadas
- ✅ Mínimo 2 opciones documentadas con pros/cons
- ✅ Consecuencias positivas Y negativas listadas
- ✅ Referencias a reglas/código existente presentes
- ✅ Ejemplos de código concretos (no genéricos)

### 4️⃣ Implementación

```bash
# Al implementar la decisión:
git commit -m "feat: implement [feature] (see ADR-0011)"
```

### 5️⃣ Superseded (Si Evolución Necesaria)

Si una decisión necesita modificarse significativamente:

```bash
# 1. NUNCA eliminar el antiguo ADR
# 2. Marcar el antiguo ADR como Superseded
#    Status: Superseded by ADR-0015
# 3. Crear nuevo ADR (ADR-0015) explicando:
#    - Por qué la decisión inicial ya no es válida
#    - Qué ha cambiado (contexto, restricciones)
#    - La nueva decisión
# 4. Enlazar ambos ADRs mutuamente
```

---

## Checklist de Validación

Antes de enviar un ADR en PR, verificar:

- [ ] **Título** claro y descriptivo (≤10 palabras)
- [ ] **Estado** correcto (Proposed para nuevo ADR)
- [ ] **Fecha** en formato YYYY-MM-DD
- [ ] **Decisores** listados con nombres completos
- [ ] **Tags** pertinentes (3-5 tags)
- [ ] **Contexto** explica claramente el problema (2-3 párrafos)
- [ ] **Mínimo 2 opciones** documentadas
- [ ] Cada opción tiene **ventajas** Y **desventajas**
- [ ] **Decisión** justificada en detalle (¿por qué esta opción?)
- [ ] **Consecuencias positivas** listadas (3-5)
- [ ] **Consecuencias negativas** listadas honestamente (2-4)
- [ ] **Riesgos** identificados con mitigación
- [ ] **Implementación**: archivos afectados listados
- [ ] **Ejemplo de código** concreto del proyecto (NO genérico)
- [ ] **Referencias** a reglas `.claude/`, docs, ADRs relacionadas
- [ ] **Tests** requeridos descritos
- [ ] Revisión de ortografía/gramática

---

## Recursos y Referencias

### Documentación Interna

- **Configuración proyecto**: [`.claude/CLAUDE.md`](../CLAUDE.md)
- **Reglas arquitectura**: [`.claude/rules/02-architecture-clean-ddd.md`](../rules/02-architecture-clean-ddd.md)
- **Reglas seguridad GDPR**: [`.claude/rules/11-security-rgpd.md`](../rules/11-security-rgpd.md)
- **Plantillas desarrollo**: [`.claude/templates/`](../templates/)
- **Checklists calidad**: [`.claude/checklists/`](../checklists/)

### Recursos MADR

- [MADR (Markdown Any Decision Records)](https://adr.github.io/madr/) - Formato oficial
- [ADR Tools](https://github.com/npryce/adr-tools) - CLI para gestionar ADRs
- [Architecture Decision Records (Michael Nygard)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) - Artículo fundador

---

## Buenas Prácticas

### ✅ HACER

- **Sea conciso**: 2 páginas máximo por ADR (salvo casos excepcionales)
- **Sea honesto**: Documente desventajas y riesgos
- **Sea concreto**: Ejemplos de código del proyecto, no genéricos
- **Referencie**: Enlace ADRs, reglas, código existente
- **Actualice**: Añada feedback post-implementación
- **Versione**: Numeración secuencial (0001, 0002, ...)
- **Feche**: Fecha de creación/aceptación clara

### ❌ NO HACER

- **Nunca elimine** un ADR (use Superseded)
- **No copie** código de las reglas (referencie)
- **No generalice** en exceso (mantenga contexto del proyecto)
- **No olvide** las consecuencias negativas (es crucial)
- **No retrase**: Cree el ADR ANTES de la implementación si es posible
- **No neglija** las reviews (2+ reviewers obligatorios)

---

**Última actualización**: 2025-11-26

- **Total ADRs**: 10
- **Aceptadas**: 9
- **Propuestas**: 1
- **Refactoring**: 1
- **Deprecated**: 0
- **Superseded**: 0

---

*Este README es mantenido por el equipo de Arquitectura. Cualquier modificación debe ser validada por el Lead Dev.*
