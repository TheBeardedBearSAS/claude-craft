# Definition of Done (DoD)

## Checklist General

Una tarea se considera "Done" cuando se cumplen TODOS los siguientes criterios:

### Código

- [ ] El código está escrito y sigue las convenciones del proyecto
- [ ] El código compila sin errores ni advertencias
- [ ] El código ha pasado revisión de código
- [ ] El código está fusionado en la rama principal
- [ ] Los conflictos de merge están resueltos

### Tests

- [ ] Tests unitarios escritos y pasando (cobertura > 80%)
- [ ] Tests de integración escritos y pasando
- [ ] Tests E2E pasando (si aplica)
- [ ] Tests de regresión pasando
- [ ] Tests manuales realizados y validados

### Documentación

- [ ] Documentación técnica actualizada (si es necesario)
- [ ] Documentación de usuario actualizada (si es necesario)
- [ ] Comentarios en código para partes complejas
- [ ] README actualizado si se requiere nueva configuración
- [ ] CHANGELOG actualizado

### Calidad

- [ ] Análisis estático pasado (linter, verificador de tipos)
- [ ] Sin deuda técnica introducida (o documentada si es inevitable)
- [ ] Revisión de código aprobada por al menos 1 desarrollador
- [ ] Rendimiento verificado (sin degradación)
- [ ] Seguridad verificada (OWASP)

### Despliegue

- [ ] Build CI/CD pasando
- [ ] Desplegado en entorno de staging
- [ ] Probado en staging
- [ ] Configuración de producción lista
- [ ] Plan de rollback documentado (si aplica)

### Validación de Negocio

- [ ] Criterios de aceptación validados
- [ ] Demo al Product Owner (si aplica)
- [ ] Feedback integrado

---

## DoD por Tipo de Tarea

### Corrección de Bug

- [ ] Bug reproducido y documentado
- [ ] Causa raíz identificada
- [ ] Corrección implementada
- [ ] Test de no regresión agregado
- [ ] Probado en entornos afectados

### Nueva Característica

- [ ] User story entendida y validada
- [ ] Diseño/UX validado (si aplica)
- [ ] Implementación completa
- [ ] Tests exhaustivos
- [ ] Feature flag si es necesario
- [ ] Analytics/tracking configurado (si aplica)

### Refactoring

- [ ] Alcance del refactoring definido
- [ ] Tests existentes siguen pasando
- [ ] Sin cambio de comportamiento
- [ ] Rendimiento igual o mejor
- [ ] Revisión de código exhaustiva

### Tarea Técnica

- [ ] Objetivo técnico alcanzado
- [ ] Documentación técnica completa
- [ ] Impacto en otros componentes verificado
- [ ] Plan de migración si es necesario

---

## Excepciones

Las excepciones a la DoD deben ser:
1. Documentadas en el ticket
2. Aprobadas por el Tech Lead
3. Seguidas por un ticket de deuda técnica

---

## Revisión

Esta Definition of Done se revisa en cada retrospectiva de sprint si es necesario.

Última actualización: YYYY-MM-DD
