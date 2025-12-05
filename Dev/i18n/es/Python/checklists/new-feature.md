# Checklist: Nueva Funcionalidad

## Fase 1: Análisis (OBLIGATORIO)

### Entender la Necesidad

- [ ] **Objetivo** claramente definido
  - ¿Qué funcionalidad exactamente?
  - ¿Qué problema resuelve?
  - ¿Cuáles son los criterios de aceptación?

- [ ] **Contexto de negocio** comprendido
  - ¿Cuál es el impacto de negocio?
  - ¿Qué usuarios están afectados?
  - ¿Hay restricciones de negocio específicas?

- [ ] **Restricciones técnicas** identificadas
  - ¿Rendimiento requerido?
  - ¿Escalabilidad?
  - ¿Seguridad?
  - ¿Compatibilidad?

### Explorar Código Existente

- [ ] **Patrones similares** identificados
  ```bash
  rg "class.*Service" --type py
  rg "class.*Repository" --type py
  ```

- [ ] **Arquitectura** analizada
  ```bash
  tree src/ -L 3 -I "__pycache__|*.pyc"
  ```

- [ ] **Estándares del proyecto** comprendidos
  - Convenciones de nomenclatura
  - Patrones de manejo de errores
  - Estructura de pruebas

### Identificar Impactos

- [ ] **Matriz de impacto** creada
  - ¿Qué módulos están afectados?
  - ¿Qué migraciones de BD son necesarias?
  - ¿Qué cambios de API?

- [ ] **Dependencias** identificadas
  - Módulos que dependen del código a modificar
  - Módulos de los que depende el nuevo código

### Diseñar la Solución

- [ ] **Arquitectura** definida
  - ¿Qué capa (Dominio/Aplicación/Infraestructura)?
  - ¿Qué clases/funciones crear?
  - ¿Qué interfaces son necesarias?

- [ ] **Flujo de datos** documentado
  - ¿Cómo fluyen los datos?
  - ¿Qué transformaciones?

- [ ] **Elecciones técnicas** justificadas
  - ¿Por qué este enfoque?
  - ¿Qué alternativas se consideraron?

### Planificar Implementación

- [ ] **Tareas** divididas en pasos atómicos
- [ ] **Orden** de implementación definido
- [ ] **Estimación** realizada con buffer (20%)

### Identificar Riesgos

- [ ] **Riesgos** identificados y evaluados
- [ ] **Mitigaciones** planificadas
- [ ] **Fallbacks** definidos si es posible

### Definir Pruebas

- [ ] **Estrategia de pruebas** definida
  - Pruebas unitarias
  - Pruebas de integración
  - Pruebas E2E
- [ ] **Cobertura objetivo** definida

Ver `rules/01-workflow-analysis.md` para detalles.

## Fase 2: Implementación

### Capa de Dominio (Si Aplica)

- [ ] **Entidades** creadas
  - [ ] Dataclass o clase Python
  - [ ] Validación en `__post_init__`
  - [ ] Métodos de negocio
  - [ ] Igualdad basada en ID
  - [ ] Docstrings completos

- [ ] **Value Objects** creados
  - [ ] `frozen=True` (inmutable)
  - [ ] Validación estricta
  - [ ] Igualdad basada en valores

- [ ] **Servicios de Dominio** creados (si es necesario)
  - [ ] Lógica de negocio multi-entidad
  - [ ] Dependencias inyectadas
  - [ ] Sin dependencia de infraestructura

- [ ] **Interfaces de Repositorio** creadas
  - [ ] Protocol en domain/repositories/
  - [ ] Métodos documentados

- [ ] **Excepciones de Dominio** creadas
  - [ ] Heredan de DomainException
  - [ ] Mensajes claros

### Capa de Aplicación

- [ ] **DTOs** creados
  - [ ] Pydantic BaseModel
  - [ ] from_entity() y to_dict() si es necesario
  - [ ] Validación Pydantic

- [ ] **Comandos** creados
  - [ ] Dataclass o Pydantic
  - [ ] Todas las entradas del caso de uso

- [ ] **Casos de Uso** creados
  - [ ] Una clase por caso de uso
  - [ ] Dependencias inyectadas vía __init__
  - [ ] Método execute()
  - [ ] Validación de entrada
  - [ ] Manejo de errores
  - [ ] Retorna DTO

### Capa de Infraestructura

- [ ] **Modelos de Base de Datos** creados (si nueva entidad)
  - [ ] Modelo SQLAlchemy
  - [ ] Columnas apropiadas
  - [ ] Índices si es necesario
  - [ ] Relaciones si es necesario

- [ ] **Migraciones** creadas
  ```bash
  make db-migrate msg="Descripción de migración"
  ```
  - [ ] Migración probada (upgrade + downgrade)

- [ ] **Repositorios** implementados
  - [ ] Implementa interfaz de dominio
  - [ ] Conversión Entity <-> model
  - [ ] Manejo de errores
  - [ ] Rollback en error

- [ ] **Rutas de API** creadas
  - [ ] Router FastAPI
  - [ ] Schemas Pydantic
  - [ ] Inyección de dependencias
  - [ ] Códigos de estado apropiados
  - [ ] Manejo de errores

- [ ] **Servicios Externos** integrados (si es necesario)
  - [ ] Implementa interfaz de dominio
  - [ ] Lógica de reintento
  - [ ] Manejo de timeout
  - [ ] Manejo de errores

### Configuración

- [ ] **Inyección de Dependencias** configurada
  - [ ] Container actualizado
  - [ ] Factories creadas
  - [ ] Dependencias FastAPI creadas

- [ ] **Variables de entorno** agregadas
  - [ ] Agregadas a `.env.example`
  - [ ] Documentadas en README
  - [ ] Validación con Pydantic Settings

- [ ] **Configuración** actualizada
  - [ ] Clase Config actualizada
  - [ ] Valores por defecto definidos

## Fase 3: Pruebas

### Pruebas Unitarias

- [ ] **Capa de Dominio** probada
  - [ ] Pruebas para cada entidad
  - [ ] Pruebas para cada value object
  - [ ] Pruebas para cada servicio
  - [ ] Cobertura > 95%

- [ ] **Capa de Aplicación** probada
  - [ ] Pruebas para cada caso de uso
  - [ ] Mocks para dependencias
  - [ ] Casos nominales + casos extremos
  - [ ] Cobertura > 90%

- [ ] **Todas las pruebas unitarias** pasan
  ```bash
  make test-unit
  ```

### Pruebas de Integración

- [ ] **Repositorio** probado
  - [ ] Operaciones CRUD
  - [ ] Métodos de búsqueda
  - [ ] Con BD real (testcontainers)

- [ ] **Rutas de API** probadas
  - [ ] Casos nominales
  - [ ] Errores (400, 404, 409, 500)
  - [ ] Con FastAPI TestClient

- [ ] **Todas las pruebas de integración** pasan
  ```bash
  make test-integration
  ```

### Pruebas E2E

- [ ] **Flujos completos** probados
  - [ ] Happy path
  - [ ] Casos de error críticos

- [ ] **Todas las pruebas E2E** pasan
  ```bash
  make test-e2e
  ```

### Cobertura

- [ ] **Cobertura general** > 80%
  ```bash
  make test-cov
  ```
- [ ] **Cobertura de dominio** > 95%
- [ ] **Cobertura de aplicación** > 90%

## Fase 4: Calidad

### Calidad del Código

- [ ] **Linting** pasa
  ```bash
  make lint
  ```

- [ ] **Formato** correcto
  ```bash
  make format-check
  ```

- [ ] **Verificación de tipos** pasa
  ```bash
  make type-check
  ```

- [ ] **Verificación de seguridad** pasa
  ```bash
  make security-check
  ```

### Revisión Personal del Código

- [ ] **SOLID** respetado
  - [ ] Responsabilidad Única
  - [ ] Abierto/Cerrado
  - [ ] Sustitución de Liskov
  - [ ] Segregación de Interfaces
  - [ ] Inversión de Dependencias

- [ ] **KISS, DRY, YAGNI** respetados
  - [ ] Solución simple
  - [ ] Sin duplicación
  - [ ] Sin código innecesario

- [ ] **Clean Architecture** respetada
  - [ ] Dependencias hacia adentro
  - [ ] Dominio independiente
  - [ ] Abstracciones (Protocols)

- [ ] **Nomenclatura** clara y consistente
- [ ] **Docstrings** completos
- [ ] **Comentarios** solo para lógica compleja
- [ ] **Código muerto** eliminado

## Fase 5: Documentación

- [ ] **Documentación de API** actualizada
  - [ ] Nuevos endpoints documentados
  - [ ] Ejemplos proporcionados
  - [ ] Schemas Request/Response claros

- [ ] **README** actualizado si es necesario
  - [ ] Nuevas funcionalidades documentadas
  - [ ] Instrucciones de setup actualizadas

- [ ] **ADR** creado si decisión arquitectónica importante
  ```markdown
  docs/adr/NNNN-descripcion.md
  ```

- [ ] **Changelog** actualizado
  ```markdown
  ## [No Publicado]
  ### Agregado
  - Descripción de funcionalidad
  ```

## Fase 6: Git & PR

### Commits

- [ ] **Commits** siguen Conventional Commits
  ```
  feat(scope): agregar sistema de notificación de usuario

  - Implementar notificaciones por email
  - Agregar soporte de notificación SMS
  - Crear repositorio de notificaciones

  Closes #123
  ```

- [ ] **Commits atómicos**
  - Sin commits gigantes
  - Un commit = un cambio lógico

### Pull Request

- [ ] **Rama** nombrada correctamente
  ```
  feature/user-notifications
  ```

- [ ] **Descripción del PR** completa
  ```markdown
  ## Resumen
  - Qué
  - Por qué
  - Cómo

  ## Cambios
  - Cambio 1
  - Cambio 2

  ## Pruebas
  - Cómo se probó
  - Capturas de pantalla si UI

  ## Checklist
  - [x] Pruebas pasan
  - [x] Docs actualizados
  ```

- [ ] **Pruebas** pasan en CI
- [ ] **Sin conflictos** con main
- [ ] **Auto-revisión** realizada

## Fase 7: Despliegue

### Pre-Despliegue

- [ ] **Migración de BD** lista
  - [ ] Probada localmente
  - [ ] Probada en staging
  - [ ] Plan de rollback definido

- [ ] **Variables de entorno** documentadas
  - [ ] Equipo DevOps informado
  - [ ] Valores de producción proporcionados

- [ ] **Feature flags** configurados (si aplica)
  - [ ] Funcionalidad deshabilitada por defecto
  - [ ] Plan de rollout definido

### Post-Despliegue

- [ ] **Monitoreo** en su lugar
  - [ ] Logs verificados
  - [ ] Métricas verificadas
  - [ ] Alertas configuradas

- [ ] **Smoke tests** realizados
  - [ ] Funcionalidad probada en prod
  - [ ] Sin errores visibles

- [ ] **Plan de rollback** listo si hay problema

## Checklist Rápido

### Mínimo Vital

- [ ] Análisis completo realizado
- [ ] Clean architecture (Clean + SOLID)
- [ ] Pruebas escritas y pasando (> 80% cobertura)
- [ ] `make quality` pasa
- [ ] Documentación actualizada
- [ ] Descripción completa del PR

### Antes del Merge

- [ ] Revisión aprobada
- [ ] CI pasa
- [ ] Sin conflictos
- [ ] Squash commits si es necesario

### Señales de Alerta

Si alguno de estos es verdadero, **NO HACER MERGE**:

- ❌ Análisis no realizado
- ❌ Pruebas faltantes
- ❌ Cobertura < 80%
- ❌ Errores de Linting/Type
- ❌ Secretos codificados en duro
- ❌ Cambios disruptivos no documentados
- ❌ Migración de BD no probada
