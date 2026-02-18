---
description: Validar el Tech Spec contra el quality gate (≥90%)
argument-hint: [archivo-techspec]
---

# Validar el Tech Spec Gate

Valida una Especificacion Tecnica contra el quality gate Tech Spec.
El Tech Spec debe alcanzar al menos 90% para aprobar.

## Argumentos

$ARGUMENTS (format: [archivo-techspec])
- **archivo-techspec** (opcional): Ruta hacia el archivo Tech Spec. Por defecto: `docs/tech-spec.md`

## Criterios del Gate

| Criterio | Peso | Requerido | Descripcion |
|----------|------|-----------|-------------|
| Vision general Arquitectura | 12% | Si | Descripcion del diseno del sistema |
| Diagrama Arquitectura | 10% | Si | Representacion visual |
| Componentes | 12% | Si | Definiciones de modulos/servicios |
| Modelo de datos | 10% | Si | Diseno de base de datos/entidades |
| Contratos API | 10% | Si | Especificaciones de endpoints |
| Seguridad | 12% | Si | Autenticacion y medidas de seguridad |
| Rendimiento | 8% | No | Requisitos de rendimiento |
| Manejo de errores | 8% | No | Estrategia de errores |
| Estrategia de pruebas | 10% | Si | Enfoque de testing |
| Despliegue | 8% | No | CI/CD y release |

**Umbral: 90%**

## Proceso

### Paso 1: Localizar el archivo Tech Spec

1. Usar la ruta proporcionada o la predeterminada `docs/tech-spec.md`
2. Verificar que el archivo existe
3. Cargar el contenido para analisis

### Paso 2: Validar cada criterio

Para cada criterio:
- Verificar las secciones y palabras clave relevantes
- Verificar la existencia de diagramas (mermaid, imagenes)
- Validar la profundidad tecnica

### Paso 3: Calcular la puntuacion

Puntuacion = suma de los pesos de los criterios validados

### Paso 4: Generar el informe

Mostrar los resultados detallados con sugerencias.

## Formato de salida

### Tech Spec validado

```
═══════════════════════════════════════════════════════
          Validacion Quality Gate Tech Spec
═══════════════════════════════════════════════════════

Archivo: docs/tech-spec.md
Umbral: 90%

Resultados de validacion:
──────────────────────────────────────────────────────
✅ Vision general Arquitectura (12%)
   Encontrado: Clean Architecture con 4 capas descritas

✅ Diagrama Arquitectura (10%)
   Encontrado: Diagrama Mermaid en la seccion "System Design"

✅ Componentes (12%)
   Encontrado: 6 componentes con responsabilidades definidas

✅ Modelo de datos (10%)
   Encontrado: Definiciones de entidades con relaciones

✅ Contratos API (10%)
   Encontrado: Endpoints REST con esquemas request/response

✅ Seguridad (12%)
   Encontrado: JWT auth, RBAC, cifrado en reposo

✅ Rendimiento (8%)
   Encontrado: Objetivos de latencia, estrategia de cache

✅ Manejo de errores (8%)
   Encontrado: Codigos de error, politicas de retry

✅ Estrategia de pruebas (10%)
   Encontrado: Planes de tests unitarios, integracion, e2e

✅ Despliegue (8%)
   Encontrado: Pipeline CI/CD, despliegue blue-green

Puntuacion: 100/100 (100%)
──────────────────────────────────────────────────────

✅ TECH SPEC GATE VALIDADO

Listo para pasar a la creacion del Backlog.
Siguiente: /arch:handoff po
═══════════════════════════════════════════════════════
```

### Tech Spec no validado

```
═══════════════════════════════════════════════════════
          Validacion Quality Gate Tech Spec
═══════════════════════════════════════════════════════

Archivo: docs/tech-spec.md
Umbral: 90%

Resultados de validacion:
──────────────────────────────────────────────────────
✅ Vision general Arquitectura (12%)
❌ Diagrama Arquitectura (10%)
   Faltante: Ningun diagrama encontrado (mermaid, PNG, SVG)
✅ Componentes (12%)
✅ Modelo de datos (10%)
⚠️ Contratos API (10%)
   Parcial: Endpoints listados pero sin esquemas
❌ Seguridad (12%)
   Faltante: Sin autenticacion/autorizacion definida
✅ Rendimiento (8%)
✅ Manejo de errores (8%)
✅ Estrategia de pruebas (10%)
⚠️ Despliegue (8%)
   Parcial: CI mencionado pero sin estrategia CD

Puntuacion: 68/100 (68%)
──────────────────────────────────────────────────────

❌ TECH SPEC GATE FALLIDO (necesita 90%, obtuvo 68%)

Acciones requeridas:
──────────────────────────────────────────────────────
1. Agregar un diagrama de arquitectura
   ```mermaid
   graph TB
     Client --> API[API Gateway]
     API --> Service[Business Logic]
     Service --> DB[(Database)]
   ```

2. Definir la estrategia de seguridad
   - Metodo de autenticacion (JWT, OAuth2)
   - Modelo de autorizacion (RBAC, ABAC)
   - Enfoque de cifrado de datos

3. Completar los contratos API con esquemas
   - Esquemas JSON request/response
   - Formatos de respuestas de error
   - Estrategia de versionado

4. Agregar estrategia de despliegue
   - Pasos del pipeline CI/CD
   - Promocion entre entornos
   - Procedimientos de rollback

Relanzar despues de correcciones: /gate:validate-techspec
═══════════════════════════════════════════════════════
```

## Ejemplo

```
/gate:validate-techspec
/gate:validate-techspec docs/auth-tech-spec.md
```

## Revision de arquitectura

Considere crear un ADR para las decisiones significativas:
```
/arch:adr "JWT vs autenticacion basada en sesion"
```

Configuracion del gate: `.bmad/gates/techspec-gate.yaml`

## Siguiente paso

```
╔══════════════════════════════════════════════════════════╗
║                    SIGUIENTE PASO                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Si PASS (≥ umbral):                                     ║
║  → /gate:validate-backlog                                ║
║    Validar el backlog                                    ║
║                                                          ║
║  Si FAIL (< umbral):                                     ║
║  → Corregir las especificaciones técnicas                ║
║  → /gate:validate-techspec (re-run tras correcciones)    ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
