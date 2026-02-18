---
description: Verificación de Cumplimiento Global del Proyecto React Native
argument-hint: [arguments]
---

# Verificación de Cumplimiento Global del Proyecto React Native

## Argumentos

$ARGUMENTS

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

Eres un experto en cumplimiento de proyectos React Native. Tu misión es orquestar una auditoría completa combinando las auditorías especializadas: arquitectura, calidad de código, testing y seguridad.

Este comando agrega los resultados de:
1. `/reactnative:check-architecture` (25 puntos)
2. `/reactnative:check-code-quality` (25 puntos)
3. `/reactnative:check-testing` (25 puntos)
4. `/reactnative:check-security` (25 puntos)

### Paso 1: Ejecutar las 4 auditorías especializadas

Ejecutar secuencialmente (o mostrar los comandos a ejecutar):

```bash
# 1. Auditoría de Arquitectura
/reactnative:check-architecture

# 2. Auditoría de Calidad de Código
/reactnative:check-code-quality

# 3. Auditoría de Testing
/reactnative:check-testing

# 4. Auditoría de Seguridad
/reactnative:check-security
```

### Paso 2: Agregar resultados

Recolectar puntuaciones de cada auditoría:

```
┌─────────────────────────┬─────────┬─────────┬────────┐
│ Auditoría               │ Puntos  │ Máximo  │ Estado │
├─────────────────────────┼─────────┼─────────┼────────┤
│ Arquitectura            │ XX/25   │ 25      │ ✅/⚠️/❌│
│ Calidad de Código       │ XX/25   │ 25      │ ✅/⚠️/❌│
│ Testing                 │ XX/25   │ 25      │ ✅/⚠️/❌│
│ Seguridad               │ XX/25   │ 25      │ ✅/⚠️/❌│
├─────────────────────────┼─────────┼─────────┼────────┤
│ TOTAL GLOBAL            │ XX/100  │ 100     │ ✅/⚠️/❌│
└─────────────────────────┴─────────┴─────────┴────────┘
```

**Leyenda:**
- ✅ Excelente (≥ 80/100)
- ⚠️ Advertencia (60-79/100)
- ❌ Crítico (< 60/100)

### Paso 3: Evaluación Global

## 📊 INFORME DE CUMPLIMIENTO GLOBAL

### 🎯 Puntuación Global: XX/100

**Evaluación:**
- 90-100: Proyecto listo para producción ✅
- 80-89: Buen proyecto, mejoras menores ⚠️
- 70-79: Proyecto aceptable, mejoras significativas necesarias ⚠️
- 60-69: Proyecto problemático, mejoras mayores requeridas ❌
- < 60: Proyecto crítico, refactorización necesaria ❌

### 📈 Puntuaciones Detalladas

#### 1. Arquitectura (XX/25)
- Estructura Feature-Based: XX/8
- Organización de Carpetas: XX/5
- Navegación: XX/4
- Arquitectura por Capas: XX/4
- Assets: XX/4

**Estado:** [✅/⚠️/❌]
**Acciones Prioritarias:** [Top 2-3]

#### 2. Calidad de Código (XX/25)
- TypeScript: XX/7
- ESLint: XX/6
- Prettier: XX/3
- SOLID: XX/4
- KISS/DRY/YAGNI: XX/5

**Estado:** [✅/⚠️/❌]
**Acciones Prioritarias:** [Top 2-3]

#### 3. Testing (XX/25)
- Configuración Jest: XX/5
- Tests Unitarios: XX/6
- Tests de Componentes: XX/6
- Tests de Integración: XX/4
- Tests E2E: XX/4

**Estado:** [✅/⚠️/❌]
**Acciones Prioritarias:** [Top 2-3]

#### 4. Seguridad (XX/25)
- Datos Sensibles: XX/6
- Seguridad API: XX/5
- Seguridad del Código: XX/5
- Autenticación: XX/5
- Seguridad de Plataforma: XX/4

**Estado:** [✅/⚠️/❌]
**Acciones Prioritarias:** [Top 2-3]

### 🚨 Problemas Críticos (Todas las Auditorías)

Listar todos los problemas críticos de las 4 auditorías:

1. **[Problema Crítico #1]**
   - **Auditoría:** Arquitectura/Calidad de Código/Testing/Seguridad
   - **Impacto:** Crítico
   - **Ubicación:** [Archivos]
   - **Acción:** [Acción inmediata]

2. **[Problema Crítico #2]**
   - **Auditoría:** Arquitectura/Calidad de Código/Testing/Seguridad
   - **Impacto:** Crítico
   - **Ubicación:** [Archivos]
   - **Acción:** [Acción inmediata]

### ⚠️ Problemas de Alta Prioridad

Listar todos los problemas de alta prioridad:

1. **[Problema #1]**
   - **Auditoría:** [Nombre]
   - **Impacto:** Alto
   - **Acción:** [Acción requerida]

2. **[Problema #2]**
   - **Auditoría:** [Nombre]
   - **Impacto:** Alto
   - **Acción:** [Acción requerida]

### 🎯 PLAN DE ACCIÓN GLOBAL

#### Fase 1: Inmediato (Semana 1)
- [ ] [Acción Crítica #1]
- [ ] [Acción Crítica #2]
- [ ] [Acción Crítica #3]

#### Fase 2: Corto Plazo (Semana 2-4)
- [ ] [Acción de Alta Prioridad #1]
- [ ] [Acción de Alta Prioridad #2]
- [ ] [Acción de Alta Prioridad #3]

#### Fase 3: Medio Plazo (Mes 2)
- [ ] [Acción de Prioridad Media #1]
- [ ] [Acción de Prioridad Media #2]
- [ ] [Acción de Prioridad Media #3]

### 📊 Métricas Clave

```
Dashboard de Salud del Proyecto
════════════════════════

Calidad del Código
├─ Errores ESLint: XX
├─ Errores TypeScript: XX
├─ Duplicación de Código: XX%
└─ Deuda Técnica: XX horas

Testing
├─ Cobertura Total: XX%
├─ Tests Unitarios: XX pasando / XX total
├─ Tests de Componentes: XX pasando / XX total
└─ Tests E2E: XX pasando / XX total

Seguridad
├─ Vulnerabilidades en Dependencias: XX
├─ Secretos Expuestos: XX
├─ Advertencias de Seguridad: XX
└─ Problemas OWASP: XX

Arquitectura
├─ Features: XX
├─ Componentes Compartidos: XX
├─ Hooks Personalizados: XX
└─ Profundidad de Carpetas: XX niveles
```

### 🏆 Fortalezas

Listar 5-10 fortalezas generales del proyecto:
- [Fortaleza 1]
- [Fortaleza 2]
- [Fortaleza 3]

### 🎓 Recomendaciones de Aprendizaje

Basado en las brechas identificadas, recomendar formación/aprendizaje para el equipo:
- [Recomendación 1: ej. formación en modo estricto TypeScript]
- [Recomendación 2: ej. taller de performance React Native]
- [Recomendación 3: ej. curso de mejores prácticas de seguridad]

### 📚 Referencias

- `.claude/rules/` - Todas las reglas del proyecto
- [Documentación React Native](https://reactnative.dev/)
- [Manual TypeScript](https://www.typescriptlang.org/docs/)
- [Seguridad Móvil OWASP](https://owasp.org/www-project-mobile-top-10/)

---

## ✅ Checklist de Cumplimiento

Usar esta checklist para futuras verificaciones de cumplimiento:

### Antes del Deploy a Producción
- [ ] Puntuación global ≥ 80/100
- [ ] Sin problemas críticos
- [ ] Cobertura de tests ≥ 70%
- [ ] 0 vulnerabilidades de seguridad (alta/crítica)
- [ ] 0 errores ESLint
- [ ] 0 errores TypeScript
- [ ] Todos los tests pasando
- [ ] Documentación actualizada

---

**Puntuación Global: XX/100**
**Recomendación: [Listo para Producción / Necesita Mejoras / Requiere Refactorización]**
