# Checklist de Nueva Funcionalidad

Flujo completo para desarrollar una nueva funcionalidad.

---

## Fase 1: Análisis (OBLIGATORIO)

Ver [01-workflow-analysis.md](../rules/01-workflow-analysis.md)

- [ ] Necesidad claramente comprendida
- [ ] User stories definidas
- [ ] Criterios de aceptación listados
- [ ] Restricciones técnicas identificadas
- [ ] Casos de uso documentados

---

## Fase 2: Diseño

### Arquitectura

- [ ] Capas impactadas identificadas (Data, Lógica, UI)
- [ ] Nuevos archivos/carpetas planificados
- [ ] Dependencias externas identificadas
- [ ] Impacto en código existente evaluado
- [ ] Patrón de diseño elegido (y justificado)

### Modelado de Datos

- [ ] Tipos TypeScript definidos
- [ ] Interfaces creadas
- [ ] DTOs definidos (si API)
- [ ] Esquemas de validación (Zod) creados

### Decisiones Técnicas

- [ ] Gestión de estado elegida (Query/Zustand/State)
- [ ] Estrategia de navegación definida
- [ ] Endpoints API definidos
- [ ] Estrategia de almacenamiento definida
- [ ] Rendimiento considerado

---

## Fase 3: Configuración

### Branch & Ticket

- [ ] Ticket/Issue creado
- [ ] Branch creada (`feature/nombre-funcionalidad`)
- [ ] Branch actualizada con develop

### Dependencias

- [ ] Nuevas dependencias instaladas
- [ ] Versiones compatibles verificadas
- [ ] `npx expo install --fix` ejecutado

---

## Fase 4: Implementación

### Desarrollo Bottom-Up

#### 1. Capa de Datos

- [ ] Tipos creados en `types/`
- [ ] Servicio API creado en `services/api/`
- [ ] Servicio de almacenamiento creado (si necesario)
- [ ] Repositorio creado (si lógica compleja)
- [ ] Tests de servicios escritos

#### 2. Capa de Lógica

- [ ] Hooks personalizados creados en `hooks/`
- [ ] Store creado (si estado global)
- [ ] Lógica de negocio implementada
- [ ] Tests de hooks escritos

#### 3. Componentes UI

- [ ] Componentes UI base creados
- [ ] Componentes reutilizables creados
- [ ] Estilos creados (StyleSheet)
- [ ] Tests de componentes escritos

#### 4. Pantallas

- [ ] Pantalla creada en `app/` (Expo Router)
- [ ] Navegación configurada
- [ ] Integración de componentes
- [ ] Tests de pantalla escritos

#### 5. Integración

- [ ] Funcionalidad integrada en la app
- [ ] Flujos de navegación probados
- [ ] Deep links configurados (si necesario)
- [ ] Tests E2E escritos

---

## Fase 5: Aseguramiento de Calidad

### Calidad del Código

- [ ] ESLint: 0 errores, 0 advertencias
- [ ] TypeScript: 0 errores (modo estricto)
- [ ] Prettier: Código formateado
- [ ] Revisión propia del código realizada
- [ ] Refactorización aplicada si necesario

### Testing

- [ ] Tests unitarios: Cobertura > 80%
- [ ] Tests de componentes: Todos los escenarios
- [ ] Tests de integración: Happy path + errores
- [ ] Tests E2E: Flujos completos del usuario
- [ ] Tests pasando localmente

### Rendimiento

- [ ] Impacto en tamaño del bundle < 100kb
- [ ] Imágenes optimizadas
- [ ] FlatLists optimizadas
- [ ] Animaciones a 60 FPS
- [ ] Memory leaks verificados
- [ ] Llamadas de red optimizadas

### Seguridad

- [ ] Validación de entradas
- [ ] Datos sensibles asegurados
- [ ] Llamadas API aseguradas
- [ ] Sin secrets expuestos
- [ ] Auditoría de dependencias limpia

### Accesibilidad

- [ ] Etiquetas de accesibilidad agregadas
- [ ] Screen reader probado
- [ ] Contraste de color suficiente
- [ ] Objetivos táctiles 44x44+

---

## Fase 6: Documentación

- [ ] JSDoc para funciones públicas
- [ ] Comentarios para lógica compleja
- [ ] README actualizado
- [ ] CHANGELOG actualizado
- [ ] ADR creado (si decisión importante)

---

## Fase 7: Pruebas Manuales

### Funcionales

- [ ] Happy path probado
- [ ] Casos límite probados
- [ ] Casos de error probados
- [ ] Comportamiento offline probado (si aplicable)

### Plataformas

- [ ] iOS probado
- [ ] Android probado
- [ ] Tablet probado (si soportado)
- [ ] Diferentes tamaños de pantalla

### UX

- [ ] Animaciones fluidas
- [ ] Estados de carga claros
- [ ] Mensajes de error útiles
- [ ] Feedback apropiado al usuario

---

## Fase 8: Revisión de Código

- [ ] Pull Request creado
- [ ] Descripción clara con capturas de pantalla
- [ ] Revisores asignados
- [ ] Checks de CI/CD pasando
- [ ] Feedback atendido
- [ ] Aprobado por al menos 1 revisor

---

## Fase 9: Merge & Deploy

- [ ] Branch fusionada en develop
- [ ] Tests pasando en develop
- [ ] Deploy a staging
- [ ] Pruebas en staging
- [ ] Deploy a producción (si aprobado)
- [ ] Monitoreo post-deploy

---

## Fase 10: Limpieza

- [ ] Feature branch eliminada
- [ ] Branches locales limpiadas
- [ ] Ticket/Issue cerrado
- [ ] Documentación finalizada

---

## Post-Lanzamiento

- [ ] Métricas recolectadas
- [ ] Feedback de usuarios capturado
- [ ] Bugs/Issues triados
- [ ] Retrospectiva (si funcionalidad importante)

---

**Flujo completo: Análisis → Diseño → Implementación → QA → Revisión → Deploy → Monitoreo**
