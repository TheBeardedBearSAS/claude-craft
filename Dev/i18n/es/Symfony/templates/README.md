# Registros de Decisiones de Arquitectura (ADR)

> Documentación de las decisiones arquitecturales principales del proyecto Atoll Tourisme

## 📖 ¿Qué es una ADR?

Un **Architecture Decision Record** (ADR) es un documento que captura una decisión arquitectural importante, incluyendo:
- El **contexto** y el problema a resolver
- Las **alternativas** consideradas con sus ventajas/desventajas
- La **decisión** tomada y su justificación
- Las **consecuencias** positivas Y negativas
- Los detalles de **implementación**

**Formato utilizado**: MADR 4.0.0 (Markdown Any Decision Records) en español

---

## 📚 Índice de ADRs

### Críticas (P0)

| ADR | Título | Estado | Fecha | Etiquetas |
|-----|--------|--------|-------|-----------|
| [0001](0001-chiffrement-halite.md) | Cifrado Halite para Datos Sensibles RGPD | ✅ Aceptado | 2025-11-26 | security, rgpd, halite |
| [0002](0002-gedmo-doctrine-extensions.md) | Extensiones Gedmo Doctrine para Registro de Auditoría | ✅ Aceptado | 2025-11-26 | audit, gedmo, rgpd |
| [0003](0003-clean-architecture-ddd.md) | Arquitectura Limpia + DDD + Hexagonal | 🔄 Refactorización | 2025-11-26 | architecture, ddd |

### Importantes (P1)

| ADR | Título | Estado | Fecha | Etiquetas |
|-----|--------|--------|-------|-----------|
| [0004](0004-docker-multi-stage.md) | Docker Multi-stage para Dev y Prod | ✅ Aceptado | 2025-11-26 | docker, infra |
| [0005](0005-symfony-messenger-async.md) | Symfony Messenger para Emails Asíncronos | 📝 Propuesto | 2025-11-26 | async, messaging |
| [0006](0006-postgresql-database.md) | PostgreSQL 16 como Base de Datos | ✅ Aceptado | 2025-11-26 | database |

### Estándar (P2)

| ADR | Título | Estado | Fecha | Etiquetas |
|-----|--------|--------|-------|-----------|
| [0007](0007-easyadmin-backoffice.md) | EasyAdmin para el Backoffice | ✅ Aceptado | 2025-11-26 | admin, crud |
| [0008](0008-tailwind-alpine-frontend.md) | Tailwind CSS + Alpine.js para Frontend | ✅ Aceptado | 2025-11-26 | frontend |
| [0009](0009-phpstan-quality-tools.md) | PHPStan y Herramientas de Calidad | ✅ Aceptado | 2025-11-26 | quality, phpstan |
| [0010](0010-conventional-commits.md) | Conventional Commits | ✅ Aceptado | 2025-11-26 | git, commits |

### Leyenda de Estados

- 📝 **Propuesto**: En discusión, aún no aceptado
- ✅ **Aceptado**: Decisión validada y en producción
- 🔄 **Refactorización**: Implementación en curso (migración progresiva)
- ⚠️ **Obsoleto**: Obsoleto, no debe usarse más
- 🔄 **Reemplazado**: Reemplazado por una nueva ADR (ver enlace)

---

## ✍️ ¿Cuándo Crear una ADR?

### ✅ CREAR una ADR si:

- **Decisión arquitectural estructurante** impactando > 1 contexto acotado
- **Trade-offs significativos** entre varias opciones viables
- **Restricción** regulatoria/seguridad/rendimiento imponiendo una elección
- **Pregunta recurrente** en revisión de código necesitando respuesta oficial
- **Cambio de paradigma** (ej: sync → async, monolito → microservicios)
- **Elección de tecnología** importante (framework, biblioteca, infraestructura)
- **Patrón arquitectural** nuevo para el equipo

### ❌ NO CREAR ADR si:

- **Decisión táctica local** afectando < 3 archivos
- **Corrección de bug** simple sin impacto arquitectural
- **CRUD estándar** siguiendo patrones existentes
- **Actualización de dependencia menor** (patch/minor version)
- **Elección obvia** sin alternativa viable
- **Configuración** de entorno (excepto si impacta seguridad/conformidad)

**Regla de oro**: Si dudas, discútelo con el Lead Dev antes de crear la ADR.

---

## 🔄 Proceso de Creación de una ADR

### 1️⃣ Propuesta (Estado: Propuesto)

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

# 6. Abrir PR con título: [ADR] ADR-0011 : Título Decisión
#    - Etiqueta: [ADR]
#    - Revisores: Lead Dev + 1 Senior mínimo
#    - Descripción: Enlace a ADR en el cuerpo de la PR
```

**Elementos a discutir en PR**:
- ¿Se han considerado todas las opciones?
- ¿Es convincente la justificación?
- ¿Son aceptables las consecuencias negativas?
- ¿Hay riesgos no documentados?
- ¿Es clara la implementación?

### 3️⃣ Aceptación (Estado: Aceptado)

**Criterios de aceptación**:
- ✅ Mínimo 2 revisores han aprobado (Lead Dev + 1 Senior)
- ✅ Todas las secciones obligatorias completadas
- ✅ Mínimo 2 opciones documentadas con pros/contras
- ✅ Consecuencias positivas Y negativas listadas
- ✅ Referencias a reglas/código existentes presentes
- ✅ Ejemplos de código concretos (no genéricos)

**Merge**:
```bash
# 7. Fusionar la PR en main
git checkout main
git merge adr/0011-titulo-decision

# 8. Actualizar el estado en README.md (este archivo)
# 9. Push
git push origin main
```

La ADR se convierte entonces en la **referencia oficial** para esta decisión.

### 4️⃣ Implementación

```bash
# Durante la implementación de la decisión:
git commit -m "feat: implement [feature] (see ADR-0011)"
```

**Reglas de implementación**:
- Seguir estrictamente la decisión documentada en la ADR
- Referenciar la ADR en los commits pertinentes
- Crear las pruebas que validen la decisión
- Documentar cualquier desviación significativa con la ADR (y potencialmente modificarla)

### 5️⃣ Reemplazado (Si Evolución Necesaria)

Si una decisión debe modificarse significativamente:

```bash
# 1. NUNCA eliminar la ADR antigua
# 2. Marcar la ADR antigua como Reemplazada
#    Estado: Reemplazado por ADR-0015
# 3. Crear nueva ADR (ADR-0015) explicando:
#    - Por qué la decisión inicial ya no se sostiene
#    - Qué ha cambiado (contexto, restricciones)
#    - La nueva decisión
# 4. Vincular las dos ADRs mutuamente
```

**Razones válidas de Reemplazo**:
- Cambio de restricciones de negocio/regulatorias
- Nueva tecnología más adaptada disponible
- Problema de rendimiento/seguridad descubierto
- Evolución de las necesidades de negocio

---

## 📋 Checklist de Validación

Antes de enviar una ADR en PR, verificar:

- [ ] **Título** claro y descriptivo (≤10 palabras)
- [ ] **Estado** correcto (Propuesto para nueva ADR)
- [ ] **Fecha** en formato YYYY-MM-DD
- [ ] **Decisores** listados con nombres completos
- [ ] **Etiquetas** pertinentes (3-5 etiquetas)
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
- [ ] **Pruebas** requeridas descritas
- [ ] Revisión ortografía/gramática

---

## 🔗 Recursos y Referencias

### Documentación Interna

- **Configuración proyecto**: [`.claude/CLAUDE.md`](../CLAUDE.md)
- **Reglas arquitectura**: [`.claude/rules/02-architecture-clean-ddd.md`](../rules/02-architecture-clean-ddd.md)
- **Reglas seguridad RGPD**: [`.claude/rules/11-security-rgpd.md`](../rules/11-security-rgpd.md)
- **Plantillas desarrollo**: [`.claude/templates/`](../templates/)
- **Checklists calidad**: [`.claude/checklists/`](../checklists/)

### Recursos MADR

- [MADR (Markdown Any Decision Records)](https://adr.github.io/madr/) - Formato oficial
- [ADR Tools](https://github.com/npryce/adr-tools) - CLI para gestionar ADRs
- [Architecture Decision Records (Michael Nygard)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) - Artículo fundador

### Ejemplos Proyectos Open Source

- [Symfony ADRs](https://github.com/symfony/symfony-docs/tree/master/adr)
- [adr/adr-examples](https://github.com/adr/adr-examples)

---

## 🎯 Buenas Prácticas

### ✅ SÍ HACER

- **Sé conciso**: 2 páginas máximo por ADR (excepto casos excepcionales)
- **Sé honesto**: Documenta las desventajas y riesgos
- **Sé concreto**: Ejemplos de código del proyecto, no genéricos
- **Referencia**: Vincula ADRs, reglas, código existente
- **Actualiza**: Añade feedback post-implementación
- **Versiona**: Numeración secuencial (0001, 0002, ...)
- **Fecha**: Fecha de creación/aceptación clara

### ❌ NO HACER

- **No elimines nunca** una ADR (usa Reemplazado)
- **No copies** código de las reglas (referencialas)
- **No generalices** en exceso (mantén el contexto del proyecto)
- **No olvides** las consecuencias negativas (es crucial)
- **No tardes**: Crea la ADR ANTES de la implementación si es posible
- **No descuides** las revisiones (2+ revisores obligatorios)

---

## 📞 Contacto y Soporte

**¿Preguntas sobre las ADRs?**
- Lead Dev: [Nombre Lead Dev]
- Equipo Arquitectura: [Equipo]
- Slack: #architecture-decisions

**Proponer modificación de este README**:
```bash
git checkout -b docs/update-adr-readme
# Modificar .claude/adr/README.md
git commit -m "docs: update ADR README with [descripción]"
# Abrir PR con etiqueta [Documentation]
```

---

## 📊 Estadísticas

**Última actualización**: 2025-11-26

- **Total ADRs**: 10
- **Aceptadas**: 9
- **Propuestas**: 1
- **Refactorización**: 1
- **Obsoletas**: 0
- **Reemplazadas**: 0

---

*Este README es mantenido por el equipo de Arquitectura. Cualquier modificación debe ser validada por el Lead Dev.*
