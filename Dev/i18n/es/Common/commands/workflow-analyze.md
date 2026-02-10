---
name: workflow-analyze
description: Ejecutar la fase de Analisis - investigacion, exploracion e identificacion de restricciones
arguments:
  - name: focus
    description: Area especifica a analizar (mercado, tecnica, competidores)
    required: false
---

# /workflow:analyze

## Mision

Ejecutar la fase de Analisis del flujo de trabajo Enterprise. Esta fase se centra en la investigacion, exploracion e identificacion de restricciones antes de comenzar la planificacion detallada.

## Cuando usar

- Proyectos con flujo **Enterprise**
- Nuevas plataformas o iniciativas importantes
- Cuando el conocimiento del dominio es limitado
- Antes de comprometerse con un enfoque tecnico

## Flujo de trabajo

### Paso 1: Configuracion del analisis

```
╔══════════════════════════════════════════════════════════╗
║            FASE DE ANALISIS - INICIANDO                    ║
╠══════════════════════════════════════════════════════════╣
║ Track: Enterprise                                         ║
║ Fase: 1 de 4 - Analisis                                   ║
║                                                           ║
║ Objetivos:                                                ║
║ • Comprender el dominio del problema                      ║
║ • Investigar soluciones existentes                        ║
║ • Identificar restricciones tecnicas                      ║
║ • Documentar riesgos y oportunidades                      ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 2: Areas de investigacion

**Preguntas guiadas de investigacion:**

```
┌─────────────────────────────────────────────────────────┐
│ INVESTIGACION DEL DOMINIO                                │
├─────────────────────────────────────────────────────────┤
│ 1. Que problema estamos resolviendo?                     │
│ 2. Quienes son las partes interesadas clave?             │
│ 3. Cuales son los impulsores del negocio?                │
│ 4. Como se define el exito?                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ INVESTIGACION DE MERCADO                                 │
├─────────────────────────────────────────────────────────┤
│ 1. Que soluciones existentes hay?                        │
│ 2. Que esta haciendo la competencia?                     │
│ 3. Cuales son las mejores practicas del sector?          │
│ 4. Cuales son las tendencias emergentes?                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ INVESTIGACION TECNICA                                    │
├─────────────────────────────────────────────────────────┤
│ 1. Que tecnologias podriamos usar?                       │
│ 2. Cuales son los requisitos de integracion?             │
│ 3. Cuales son las necesidades de escalabilidad?          │
│ 4. Que requisitos de seguridad/cumplimiento existen?     │
└─────────────────────────────────────────────────────────┘
```

### Paso 3: Investigacion Context7 (Opcional)

Si MCP Context7 esta configurado, usarlo para investigacion tecnica:

```
Usando Context7 MCP para documentacion actualizada...

Investigando:
• Mejores practicas actuales de la API de Stripe
• Estandares de seguridad actuales para procesamiento de pagos
• Requisitos de cumplimiento PCI DSS
```

### Paso 4: Identificacion de restricciones

Documentar las restricciones descubiertas:

```
╔══════════════════════════════════════════════════════════╗
║               RESTRICCIONES IDENTIFICADAS                 ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ RESTRICCIONES TECNICAS:                                   ║
║ • Debe integrarse con el backend Symfony 7.x existente    ║
║ • Base de datos: PostgreSQL (existente, no se puede       ║
║   cambiar)                                                ║
║ • Debe soportar apps moviles via API existente            ║
║                                                           ║
║ RESTRICCIONES DE NEGOCIO:                                 ║
║ • Presupuesto: Limitado al equipo existente               ║
║ • Plazo: MVP necesario en Q2 2026                         ║
║ • Debe mantener compatibilidad hacia atras                ║
║                                                           ║
║ RESTRICCIONES REGULATORIAS:                               ║
║ • Cumplimiento RGPD requerido (usuarios UE)               ║
║ • PCI DSS para procesamiento de pagos                     ║
║                                                           ║
║ RESTRICCIONES DE RECURSOS:                                ║
║ • Equipo: 2 backend, 1 frontend                           ║
║ • Sin recurso DevOps dedicado                             ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 5: Analisis de riesgos y oportunidades

```
╔══════════════════════════════════════════════════════════╗
║            RIESGOS Y OPORTUNIDADES                        ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ RIESGOS:                                                  ║
║ ┌─────────┬──────────┬────────────┬───────────────────┐  ║
║ │ Riesgo  │ Impacto  │Probabilidad│ Mitigacion        │  ║
║ ├─────────┼──────────┼────────────┼───────────────────┤  ║
║ │ Caida   │ Alto     │ Bajo       │ Proveedor de      │  ║
║ │ Stripe  │          │            │ respaldo          │  ║
║ ├─────────┼──────────┼────────────┼───────────────────┤  ║
║ │ Retraso │ Medio    │ Medio      │ Reduccion de      │  ║
║ │ plazo   │          │            │ alcance MVP       │  ║
║ └─────────┴──────────┴────────────┴───────────────────┘  ║
║                                                           ║
║ OPORTUNIDADES:                                            ║
║ • Aprovechar los nuevos Payment Elements de Stripe        ║
║ • Potencial para expansion del modelo de suscripcion      ║
║ • Pago movil (Apple Pay, Google Pay) listo                ║
║                                                           ║
╚══════════════════════════════════════════════════════════╝
```

### Paso 6: Generar artefactos de analisis

Crear documentos de analisis:

```
project-management/
└── analysis/
    ├── research-summary.md      # Hallazgos clave
    ├── constraints.md           # Todas las restricciones identificadas
    ├── risks-opportunities.md   # Registro de riesgos y oportunidades
    └── technical-options.md     # Evaluacion tecnologica
```

### Paso 7: Finalizacion de la fase

```
╔══════════════════════════════════════════════════════════╗
║            FASE DE ANALISIS COMPLETADA                    ║
╠══════════════════════════════════════════════════════════╣
║                                                           ║
║ Artefactos creados:                                       ║
║ ✅ research-summary.md                                    ║
║ ✅ constraints.md                                         ║
║ ✅ risks-opportunities.md                                 ║
║ ✅ technical-options.md                                   ║
║                                                           ║
║ Hallazgos clave:                                          ║
║ • 4 restricciones tecnicas identificadas                  ║
║ • 3 restricciones de negocio identificadas                ║
║ • 5 riesgos documentados con mitigaciones                 ║
║ • 3 oportunidades a considerar                            ║
║                                                           ║
║ ─────────────────────────────────────────────────────────║
║ SIGUIENTE FASE: Planificacion                             ║
║ Comando: /workflow:plan                                   ║
║ ─────────────────────────────────────────────────────────║
║                                                           ║
║ El analisis informara la creacion del PRD y arquitectura. ║
╚══════════════════════════════════════════════════════════╝
```

## Agentes involucrados

- **research-assistant**: Investigacion tecnica y busqueda de documentacion
- **product-owner**: Contexto de negocio y analisis de partes interesadas

## Archivos de salida

| Archivo | Proposito |
|---------|-----------|
| `analysis/research-summary.md` | Hallazgos de investigacion consolidados |
| `analysis/constraints.md` | Restricciones tecnicas, de negocio y regulatorias |
| `analysis/risks-opportunities.md` | Registro de riesgos con mitigaciones |
| `analysis/technical-options.md` | Evaluacion y recomendaciones tecnologicas |

## Comandos relacionados

- `/workflow:init` - Inicializar flujo de trabajo (debe ejecutarse primero)
- `/workflow:plan` - Siguiente fase: Planificacion
- `/workflow:status` - Verificar progreso
- `/common:research-context7` - Investigacion profunda con Context7 MCP
