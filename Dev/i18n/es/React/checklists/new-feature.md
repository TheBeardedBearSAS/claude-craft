# Checklist: Nueva Característica React

## Antes de Comenzar

### Planificación
- [ ] Ticket o historia de usuario creada y revisada
- [ ] Requisitos claramente definidos
- [ ] Mockups o wireframes disponibles (si aplica)
- [ ] Casos de uso identificados
- [ ] Criterios de aceptación definidos
- [ ] Dependencias identificadas
- [ ] Estimación de tiempo realizada

### Análisis Técnico
- [ ] Arquitectura de la característica planificada
- [ ] Componentes a crear identificados
- [ ] Hooks personalizados necesarios listados
- [ ] Servicios API definidos
- [ ] Modelos de datos diseñados
- [ ] Flujos de estado mapeados
- [ ] Consideraciones de rendimiento evaluadas
- [ ] Impactos de seguridad analizados

## Durante el Desarrollo

### Arquitectura
- [ ] Carpeta de característica creada en `/features`
- [ ] Estructura siguiendo Diseño Atómico
- [ ] Componentes organizados (atoms, molecules, organisms)
- [ ] Separación UI/lógica respetada
- [ ] Rutas configuradas
- [ ] Lazy loading implementado (si es necesario)

### TypeScript
- [ ] Tipos e interfaces definidos en `types.ts`
- [ ] Props de componentes tipadas
- [ ] Funciones con firmas de tipos completas
- [ ] Respuestas API tipadas
- [ ] Eventos tipados
- [ ] Sin `any` injustificado
- [ ] Tipos exportados para reutilización

### Componentes
- [ ] Componentes funcionales con TypeScript
- [ ] Props documentadas con JSDoc
- [ ] Valores por defecto definidos
- [ ] Gestión de estado apropiada (useState, zustand, etc.)
- [ ] Hooks personalizados extraídos si es necesario
- [ ] Componentes optimizados (memo, useMemo, useCallback)
- [ ] Componentes responsivos
- [ ] Tema soportado (dark/light)

### Hooks Personalizados
- [ ] Hooks extraídos de componentes
- [ ] Nombres claros (use + PascalCase)
- [ ] Hooks documentados
- [ ] Lógica reutilizable
- [ ] Manejo de errores
- [ ] Indicadores de carga
- [ ] Limpieza en unmount

### Servicios API
- [ ] Servicio creado en `/services`
- [ ] Cliente HTTP configurado (axios/fetch)
- [ ] Funciones CRUD implementadas
- [ ] Manejo de errores centralizado
- [ ] Tipos de respuesta definidos
- [ ] Interceptores configurados (si es necesario)
- [ ] Timeout configurado
- [ ] Reintentos implementados (si es necesario)

### Gestión de Estado
- [ ] Estado local usado apropiadamente (useState)
- [ ] Estado global definido (Context/Zustand si es necesario)
- [ ] React Query configurado para cache de servidor
- [ ] Mutaciones optimistas implementadas (si aplica)
- [ ] Estado persistido si es necesario (localStorage)
- [ ] Estado no duplicado
- [ ] Estado normalizado para datos complejos

### Formularios
- [ ] Validación con Zod o Yup
- [ ] React Hook Form integrado
- [ ] Mensajes de error mostrados
- [ ] Validación en tiempo real
- [ ] Indicadores de carga en submit
- [ ] Manejo de errores de submit
- [ ] Formularios accesibles (labels, aria)
- [ ] Sanitización de entrada

### Estilos
- [ ] Tailwind CSS usado para estilos
- [ ] Clases utilitarias favorecidas sobre CSS personalizado
- [ ] Variantes definidas con CVA (si es necesario)
- [ ] Responsividad implementada (mobile-first)
- [ ] Dark mode soportado
- [ ] Animaciones/transiciones añadidas (si aplica)
- [ ] Sin estilos inline (usar classes)

### Tests

#### Tests Unitarios (Vitest)
- [ ] Tests para cada componente
- [ ] Tests para hooks personalizados
- [ ] Tests para funciones utilitarias
- [ ] Tests para servicios
- [ ] Casos de éxito cubiertos
- [ ] Casos de error cubiertos
- [ ] Casos límite cubiertos
- [ ] Cobertura >80% para código crítico

#### Tests de Integración
- [ ] Tests para flujos de usuarios
- [ ] Tests con React Testing Library
- [ ] Interacciones de usuario simuladas
- [ ] Llamadas API mockeadas (MSW)
- [ ] Navegación probada
- [ ] Gestión de estado probada

#### Tests E2E (Playwright)
- [ ] Escenarios críticos de usuario identificados
- [ ] Tests E2E escritos con Playwright
- [ ] Happy path probado
- [ ] Flujos de error probados
- [ ] Tests ejecutándose en CI/CD

### Accesibilidad
- [ ] Roles ARIA apropiados
- [ ] Labels para elementos de formulario
- [ ] Alt text para imágenes
- [ ] Navegación por teclado funcional
- [ ] Focus visible
- [ ] Contraste de colores suficiente
- [ ] Textos para lectores de pantalla
- [ ] Validado con herramientas (axe, Lighthouse)

### Rendimiento
- [ ] Componentes pesados memorizados (React.memo)
- [ ] Cálculos costosos cacheados (useMemo)
- [ ] Callbacks memorizados (useCallback)
- [ ] Code splitting implementado
- [ ] Lazy loading de imágenes
- [ ] Listas virtualizadas (si >100 items)
- [ ] Bundle analizado (bundle-analyzer)
- [ ] Lighthouse score >90

### Seguridad
- [ ] Entrada de usuario validada y sanitizada
- [ ] Uso de `dangerouslySetInnerHTML` evitado o sanitizado
- [ ] Tokens almacenados de forma segura
- [ ] Llamadas API autenticadas
- [ ] CSRF protegido
- [ ] XSS prevenido
- [ ] Dependencias auditadas (`npm audit`)
- [ ] Secretos no expuestos (env variables)

### Documentación
- [ ] README actualizado (si aplica)
- [ ] Componentes documentados con JSDoc
- [ ] Hooks documentados
- [ ] Tipos complejos documentados
- [ ] Ejemplos de uso provistos
- [ ] Storybook stories creadas
- [ ] CHANGELOG actualizado

### Git y Versionado
- [ ] Branch creada desde `develop`
- [ ] Commits atómicos y claros
- [ ] Commits siguiendo Conventional Commits
- [ ] No hay código comentado/muerto
- [ ] No hay console.log olvidados
- [ ] No hay TODOs sin ticket asociado
- [ ] No hay archivos de test/debug committeados

## Antes de Crear PR

### Code Review Personal
- [ ] Código auto-revisado
- [ ] Refactorización aplicada
- [ ] Código duplicado eliminado
- [ ] Complejidad reducida
- [ ] Nombres claros y descriptivos
- [ ] Comentarios añadidos donde sea necesario
- [ ] Formateo con Prettier aplicado
- [ ] Linting sin errores/warnings

### Tests y Calidad
- [ ] Todos los tests pasando
- [ ] Coverage suficiente (>80% para crítico)
- [ ] No hay regresiones
- [ ] Funcionalidad probada manualmente
- [ ] Probado en diferentes navegadores
- [ ] Probado en diferentes tamaños de pantalla
- [ ] Modo oscuro probado
- [ ] Tests E2E pasando

### Build y CI/CD
- [ ] Build sin errores
- [ ] Build de producción exitoso
- [ ] No warnings de TypeScript
- [ ] No errores de linting
- [ ] Pipeline CI pasando
- [ ] Tamaño de bundle verificado

### Performance
- [ ] Sin re-renders innecesarios
- [ ] Sin memory leaks
- [ ] Carga rápida (<3s)
- [ ] Interacciones fluidas (60fps)
- [ ] Lighthouse audit pasado

### Seguridad
- [ ] Análisis de seguridad realizado
- [ ] Vulnerabilidades resueltas
- [ ] Datos sensibles protegidos
- [ ] Permisos verificados
- [ ] Validación server-side confirmada

## Pull Request

### Preparación de PR
- [ ] Branch actualizada con `develop`
- [ ] Conflictos resueltos
- [ ] Commits squasheados (si necesario)
- [ ] Título de PR descriptivo
- [ ] Descripción completa
- [ ] Screenshots/videos adjuntos (UI)
- [ ] Issue linkado
- [ ] Reviewers asignados
- [ ] Labels apropiadas añadidas

### Descripción de PR
- [ ] Resumen de cambios
- [ ] Motivación explicada
- [ ] Decisiones técnicas justificadas
- [ ] Breaking changes identificados
- [ ] Migration guide (si aplica)
- [ ] Instrucciones de prueba
- [ ] Checklist de review incluida

### Review Process
- [ ] Review recibido
- [ ] Comentarios abordados
- [ ] Cambios solicitados realizados
- [ ] Aprobación recibida
- [ ] CI pasando
- [ ] Sin conflictos

## Post-Merge

### Deployment
- [ ] Merged a `develop`
- [ ] Deploy a staging exitoso
- [ ] Pruebas en staging
- [ ] Deploy a producción (cuando corresponda)
- [ ] Pruebas de humo en producción

### Monitoreo
- [ ] Monitoreo de errores (Sentry, etc.)
- [ ] Logs verificados
- [ ] Métricas de rendimiento monitoreadas
- [ ] Feedback de usuarios recolectado

### Documentación
- [ ] Documentación de usuario actualizada
- [ ] Documentación técnica actualizada
- [ ] API docs actualizadas (si aplica)
- [ ] Equipo notificado de cambios

### Cleanup
- [ ] Branch de feature eliminada
- [ ] Feature flags removidos (si aplica)
- [ ] Código deprecated eliminado
- [ ] TODOs convertidos en tickets

## Notas

### Severidades de Violación
- 🔴 **Bloqueante**: Debe corregirse antes de merge
- 🟠 **Mayor**: Debe corregirse pronto
- 🟡 **Menor**: Puede abordarse más tarde
- 🔵 **Sugerencia**: Mejora opcional

### Excepciones
Algunas verificaciones pueden no aplicar dependiendo de:
- Tipo de proyecto (MVP, prototipo, producción)
- Tamaño del proyecto (startup, enterprise)
- Fase del proyecto (inicial, madura)
- Recursos disponibles (tiempo, equipo)

**Regla de oro**: Adaptar las prácticas al contexto, pero siempre favorecer calidad y seguridad.

---

**Versión**: 1.0
**Última actualización**: 2025-12-03
