# Checklist de Release

## Pre-Release (D-7 a D-1)

### Planificación

- [ ] Fecha de release confirmada
- [ ] Alcance del release finalizado (características, correcciones)
- [ ] Notas de release escritas
- [ ] Comunicación planificada (interna + externa)
- [ ] Soporte informado de los cambios
- [ ] Documentación actualizada

### Código

- [ ] Feature freeze respetado
- [ ] Todos los PRs fusionados
- [ ] Revisiones de código completas
- [ ] Sin TODOs críticos pendientes
- [ ] Rama de release creada (si aplica)
- [ ] Versión incrementada (package.json, build.gradle, etc.)

### Tests

- [ ] Tests unitarios pasando (100%)
- [ ] Tests de integración pasando
- [ ] Tests E2E pasando
- [ ] Tests de rendimiento validados
- [ ] Tests de seguridad validados
- [ ] Tests de regresión completos
- [ ] UAT (User Acceptance Testing) validado

### Infraestructura

- [ ] Entorno de producción listo
- [ ] Configuración de producción verificada
- [ ] Escalado configurado si es necesario
- [ ] Monitoreo en su lugar
- [ ] Alertas configuradas
- [ ] Backups verificados

---

## Día del Release (D-Day)

### Antes del Despliegue

- [ ] Equipo de release briefeado
- [ ] Canales de comunicación listos (Slack, email)
- [ ] Plan de rollback listo y probado
- [ ] Ventana de mantenimiento comunicada (si aplica)
- [ ] Soporte en standby
- [ ] Base de datos respaldada

### Despliegue

- [ ] Despliegue final en staging OK
- [ ] Smoke tests en staging OK
- [ ] Tag de release creado
- [ ] Despliegue a producción lanzado
- [ ] Monitoreo observado durante despliegue
- [ ] Smoke tests en producción OK

### Verificación Post-Despliegue

- [ ] Aplicación accesible
- [ ] Funcionalidades críticas verificadas
- [ ] Sin errores en logs
- [ ] Métricas de rendimiento normales
- [ ] Sin alertas disparadas
- [ ] Integraciones de terceros funcionales

---

## Post-Release (D+1 a D+7)

### Monitoreo

- [ ] Tasa de error normal (< 0.1%)
- [ ] Tiempo de respuesta aceptable
- [ ] Sin degradación de rendimiento
- [ ] Feedback de usuarios recopilado
- [ ] Tickets de soporte rastreados

### Comunicación

- [ ] Notas de release publicadas
- [ ] Equipo interno informado
- [ ] Clientes/usuarios notificados
- [ ] Post de blog / changelog actualizado

### Documentación

- [ ] Documentación técnica actualizada
- [ ] Runbook actualizado si es necesario
- [ ] Post-mortem si hubo incidentes
- [ ] Lecciones aprendidas documentadas

### Limpieza

- [ ] Ramas de release fusionadas/eliminadas
- [ ] Feature flags limpiados
- [ ] Entornos de prueba limpiados
- [ ] Recursos temporales eliminados

---

## Checklist de Rollback

En caso de problema crítico:

- [ ] Decisión de rollback tomada (criterios definidos de antemano)
- [ ] Comunicación inmediata al equipo
- [ ] Rollback ejecutado
- [ ] Verificación del rollback
- [ ] Comunicación a usuarios
- [ ] Post-mortem programado

### Criterios de Rollback

- [ ] Tasa de error > 5%
- [ ] Funcionalidad crítica no funcionando
- [ ] Pérdida de datos detectada
- [ ] Vulnerabilidad de seguridad descubierta
- [ ] Impacto empresarial importante

---

## Tipos de Release

### Release Mayor (X.0.0)

- [ ] Todos los criterios anteriores
- [ ] Comunicación de marketing
- [ ] Capacitación del equipo de soporte
- [ ] Guía de migración si hay cambios incompatibles
- [ ] Testing beta previo

### Release Menor (x.Y.0)

- [ ] Criterios estándar
- [ ] Notas de release detalladas
- [ ] Notificación a usuarios

### Patch (x.y.Z)

- [ ] Tests dirigidos a la corrección
- [ ] Despliegue rápido posible
- [ ] Comunicación si es crítico

### Hotfix

- [ ] Proceso acelerado
- [ ] Tests mínimos pero esenciales
- [ ] Despliegue inmediato
- [ ] Post-mortem obligatorio

---

## Contactos de Emergencia

| Rol | Nombre | Contacto |
|------|------|---------|
| Release Manager | | |
| Tech Lead | | |
| DevOps | | |
| Support Lead | | |
| Product Owner | | |

---

## Historial de Releases

| Versión | Fecha | Estado | Notas |
|---------|------|--------|-------|
| | | | |
