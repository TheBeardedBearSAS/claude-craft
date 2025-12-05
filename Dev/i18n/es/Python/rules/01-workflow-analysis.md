# Flujo de Trabajo de Análisis Obligatorio

## Principio Fundamental

**NINGUNA modificación de código debe realizarse sin un análisis preliminar completo.**

Esta regla es absoluta y se aplica a:
- Creación de nuevas funcionalidades
- Corrección de errores
- Refactorización
- Optimizaciones
- Cambios de configuración
- Actualizaciones de dependencias

## Metodología de Análisis en 7 Pasos

### 1. Comprensión de la Necesidad

#### Preguntas a Formular

1. **¿Cuál es el objetivo exacto?**
   - ¿Qué funcionalidad se necesita agregar/modificar?
   - ¿Qué problema necesita resolverse?
   - ¿Cuál es el comportamiento esperado?

2. **¿Cuál es el contexto del negocio?**
   - ¿Cuál es el impacto en el negocio?
   - ¿Qué usuarios están afectados?
   - ¿Hay restricciones específicas del negocio?

3. **¿Cuáles son las restricciones técnicas?**
   - Rendimiento (tiempo de respuesta, capacidad de procesamiento)
   - Escalabilidad
   - Seguridad
   - Compatibilidad

#### Acciones a Realizar

```python
# Ejemplo de documentación de necesidad
"""
NECESIDAD: Agregar un sistema de notificación por correo electrónico al crear un pedido

CONTEXTO:
- Los clientes deben recibir confirmación inmediata
- El sistema debe soportar 10,000 pedidos/día
- Los correos deben enviarse de forma asíncrona
- Las plantillas de correo deben ser personalizables

RESTRICCIONES:
- Tiempo de respuesta de API < 200ms (el envío debe ser asíncrono)
- Reintento automático en caso de fallo
- Registro completo para auditoría
- Soporte multiidioma

CRITERIOS DE ACEPTACIÓN:
- Correo enviado dentro de los 5 minutos del pedido
- Plantilla personalizable por tipo de pedido
- Seguimiento de correos enviados/fallidos
- Panel de monitoreo de envíos
"""
```

### 2. Exploración del Código Existente

#### Herramientas de Exploración

```bash
# Buscar patrones similares
rg "class.*Service" --type py
rg "async def.*email" --type py
rg "from.*repository import" --type py

# Analizar estructura
tree src/ -L 3 -I "__pycache__|*.pyc"

# Identificar dependencias
rg "^import|^from" src/ --type py | sort | uniq

# Encontrar pruebas existentes
find tests/ -name "*test*.py" -o -name "test_*.py"
```

#### Preguntas a Formular

1. **¿Existe código similar?**
   - Patrones de servicio existentes
   - Repositorios similares
   - Casos de uso comparables

2. **¿Cuál es la arquitectura actual?**
   - ¿Cómo están organizadas las capas?
   - ¿Dónde colocar el nuevo código?
   - ¿Qué abstracciones ya existen?

3. **¿Cuáles son los estándares del proyecto?**
   - Convenciones de nomenclatura utilizadas
   - Patrones de manejo de errores
   - Estructura de pruebas

#### Ejemplo de Análisis

```python
# ANÁLISIS DEL CÓDIGO EXISTENTE
"""
1. SERVICIOS EXISTENTES:
   - src/myapp/domain/services/order_service.py
   - src/myapp/domain/services/payment_service.py
   Patrón: Servicios de negocio en domain/services/

2. COMUNICACIÓN ASÍNCRONA:
   - Infraestructura Celery configurada (infrastructure/tasks/)
   - Colas 'default' y 'emails' ya definidas
   Patrón: Tareas Celery para operaciones asíncronas

3. REPOSITORIOS:
   - Patrón Repository con interfaz + implementación
   - Ubicación: domain/repositories/ (interfaces)
   - Implementación: infrastructure/database/repositories/

4. MANEJO DE ERRORES:
   - Excepciones personalizadas en shared/exceptions/
   - Patrón: DomainException, ApplicationException, InfrastructureException

5. PRUEBAS:
   - Fixtures en tests/conftest.py
   - Mocks con pytest-mock
   - Pruebas unitarias: tests/unit/
   - Pruebas de integración: tests/integration/

CONCLUSIÓN:
- Crear EmailService en domain/services/
- Crear interfaz EmailRepository en domain/repositories/
- Implementar con Celery en infrastructure/tasks/
- Seguir patrón existente para excepciones
"""
```

### 3. Identificación de Impacto

#### Matriz de Impacto

| Zona | Impacto | Detalles | Acciones Requeridas |
|------|---------|---------|---------------------|
| Capa de Dominio | ALTO | Nueva entidad Email, nuevo servicio | Creación + pruebas unitarias |
| Capa de Aplicación | MEDIO | Nuevo caso de uso SendOrderConfirmation | Creación + pruebas |
| Infraestructura | ALTO | Implementación de proveedor de correo, tarea Celery | Configuración + pruebas de integración |
| API | BAJO | Sin nuevo endpoint (activación interna) | Ninguna |
| Base de Datos | MEDIO | Nueva tabla email_logs | Migración + pruebas |
| Configuración | MEDIO | Variables de entorno para SMTP | Documentación |
| Pruebas | ALTO | Pruebas en todas las capas | Suite completa |
| Documentación | MEDIO | Actualización de docs API, README | Redacción |

#### Análisis de Dependencias

```python
# Identificar módulos afectados
"""
MÓDULOS DIRECTAMENTE IMPACTADOS:
├── domain/
│   ├── entities/email.py (NUEVO)
│   ├── services/email_service.py (NUEVO)
│   └── repositories/email_repository.py (NUEVO - interfaz)
├── application/
│   └── use_cases/send_order_confirmation.py (NUEVO)
├── infrastructure/
│   ├── email/
│   │   └── smtp_email_provider.py (NUEVO)
│   ├── tasks/
│   │   └── email_tasks.py (NUEVO)
│   └── database/
│       ├── models/email_log.py (NUEVO)
│       └── repositories/email_repository_impl.py (NUEVO)

MÓDULOS INDIRECTAMENTE IMPACTADOS:
├── application/use_cases/create_order.py (MODIFICADO - llama al nuevo caso de uso)
├── infrastructure/database/migrations/ (NUEVO - migración)
└── infrastructure/di/container.py (MODIFICADO - inyección de dependencias)

ARCHIVOS DE CONFIGURACIÓN:
├── .env.example (MODIFICADO - nuevas variables)
├── docker-compose.yml (POTENCIAL - servicio de correo si mailhog)
└── pyproject.toml (POTENCIAL - nuevas dependencias)
"""
```

### 4. Diseño de la Solución

#### Arquitectura de la Solución

```python
"""
ARQUITECTURA PROPUESTA:

1. CAPA DE DOMINIO (Lógica de Negocio)
┌─────────────────────────────────────────────────────────────┐
│                      Entidad Email                           │
│  - id: UUID                                                   │
│  - recipient: EmailAddress (Value Object)                    │
│  - subject: str                                              │
│  - body: str                                                 │
│  - sent_at: Optional[datetime]                              │
│  - status: EmailStatus (Enum)                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   EmailService (Dominio)                     │
│  + create_order_confirmation(order: Order) -> Email         │
│  + validate_email_content(email: Email) -> bool             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              EmailRepository (Interfaz)                      │
│  + save(email: Email) -> Email                              │
│  + find_by_id(id: UUID) -> Optional[Email]                  │
│  + find_by_order_id(order_id: UUID) -> list[Email]         │
└─────────────────────────────────────────────────────────────┘

2. CAPA DE APLICACIÓN (Casos de Uso)
┌─────────────────────────────────────────────────────────────┐
│           SendOrderConfirmationUseCase                       │
│  - email_service: EmailService                              │
│  - email_repository: EmailRepository                        │
│  - email_provider: EmailProvider                            │
│                                                              │
│  + execute(order_id: UUID) -> EmailDTO                      │
│    1. Recuperar pedido                                      │
│    2. Crear email vía EmailService                          │
│    3. Guardar vía EmailRepository                           │
│    4. Enviar vía EmailProvider (async)                      │
└─────────────────────────────────────────────────────────────┘

3. CAPA DE INFRAESTRUCTURA (Implementaciones)
┌─────────────────────────────────────────────────────────────┐
│              EmailRepositoryImpl                             │
│  + Implementa EmailRepository                               │
│  + Usa SQLAlchemy                                           │
│  + Mapea Email <-> EmailLog (modelo DB)                     │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              SMTPEmailProvider                               │
│  + Implementa EmailProvider                                 │
│  + Usa smtplib / aiosmtplib                                │
│  + Maneja reintentos y manejo de errores                    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              send_email_task (Celery)                        │
│  + Tarea asíncrona                                          │
│  + Reintento automático (3 veces, retroceso exponencial)   │
│  + Registro completo                                        │
└─────────────────────────────────────────────────────────────┘
"""
```

#### Flujo de Datos

```python
"""
FLUJO DE DATOS:

1. CREACIÓN DE PEDIDO
   CreateOrderUseCase
   └── order = order_repository.save(order)
   └── send_order_confirmation_use_case.execute(order.id)  # Asíncrono

2. ENVÍO DE CONFIRMACIÓN
   SendOrderConfirmationUseCase.execute(order_id)
   ├── order = order_repository.find_by_id(order_id)
   ├── email = email_service.create_order_confirmation(order)
   ├── email = email_repository.save(email)  # Estado: PENDING
   └── send_email_task.delay(email.id)  # Tarea Celery

3. TAREA CELERY
   send_email_task(email_id)
   ├── email = email_repository.find_by_id(email_id)
   ├── try:
   │   ├── email_provider.send(email)
   │   ├── email.mark_as_sent()
   │   └── email_repository.save(email)  # Estado: SENT
   └── except Exception as e:
       ├── email.mark_as_failed(e)
       ├── email_repository.save(email)  # Estado: FAILED
       └── raise  # Reintento Celery

4. MANEJO DE ERRORES
   - Reintento automático de Celery (3 intentos)
   - Retroceso exponencial (2^retry * 60 segundos)
   - Registro de cada intento
   - Alerta si fallo definitivo
"""
```

#### Elecciones Técnicas

```python
"""
ELECCIONES TÉCNICAS JUSTIFICADAS:

1. CELERY vs RQ vs ARQ
   Elección: Celery
   Razones:
   - Ya usado en el proyecto
   - Soporte avanzado de reintentos
   - Monitoreo con Flower
   - Ecosistema amplio

2. PROVEEDOR DE CORREO
   Elección: aiosmtplib (SMTP asíncrono)
   Razones:
   - Compatible con asyncio
   - Rendimiento para altos volúmenes
   - Soporte TLS/SSL
   Alternativa: SendGrid/AWS SES para producción

3. ALMACENAMIENTO DE CORREOS
   Elección: PostgreSQL (tabla email_logs)
   Razones:
   - Auditoría completa
   - Búsqueda e informes
   - Consistencia transaccional
   - Sin necesidad de almacenamiento S3 para plantillas simples

4. PLANTILLAS
   Elección: Jinja2
   Razones:
   - Estándar en Python
   - Ya usado para otras plantillas
   - Sintaxis simple
   - Soporte i18n

5. VALIDACIÓN
   Elección: Pydantic + email-validator
   Razones:
   - Validación estricta de correos
   - Seguridad de tipos
   - Integración con FastAPI/Django
"""
```

### 5. Planificación de la Implementación

#### Desglose de Tareas

```python
"""
PLAN DE IMPLEMENTACIÓN (Orden: de arriba hacia abajo)

FASE 1: CAPA DE DOMINIO
□ Tarea 1.1: Crear enum EmailStatus
  └── src/myapp/domain/value_objects/email_status.py
  └── Pruebas: tests/unit/domain/value_objects/test_email_status.py

□ Tarea 1.2: Crear value object EmailAddress
  └── src/myapp/domain/value_objects/email_address.py
  └── Validación con email-validator
  └── Pruebas: tests/unit/domain/value_objects/test_email_address.py

□ Tarea 1.3: Crear entidad Email
  └── src/myapp/domain/entities/email.py
  └── Métodos: mark_as_sent(), mark_as_failed()
  └── Pruebas: tests/unit/domain/entities/test_email.py

□ Tarea 1.4: Crear interfaz EmailRepository
  └── src/myapp/domain/repositories/email_repository.py
  └── Protocol con métodos abstractos

□ Tarea 1.5: Crear interfaz EmailProvider
  └── src/myapp/domain/interfaces/email_provider.py
  └── Protocol para abstracción

□ Tarea 1.6: Crear EmailService
  └── src/myapp/domain/services/email_service.py
  └── Lógica de creación de correos
  └── Pruebas: tests/unit/domain/services/test_email_service.py

FASE 2: CAPA DE INFRAESTRUCTURA
□ Tarea 2.1: Crear migración de base de datos
  └── alembic revision --autogenerate -m "add_email_logs_table"
  └── Columnas: id, recipient, subject, body, status, sent_at, error, metadata

□ Tarea 2.2: Crear modelo EmailLog
  └── src/myapp/infrastructure/database/models/email_log.py
  └── Modelo SQLAlchemy

□ Tarea 2.3: Crear EmailRepositoryImpl
  └── src/myapp/infrastructure/database/repositories/email_repository_impl.py
  └── Implementa EmailRepository
  └── Pruebas: tests/integration/infrastructure/repositories/test_email_repository.py

□ Tarea 2.4: Crear SMTPEmailProvider
  └── src/myapp/infrastructure/email/smtp_provider.py
  └── Configuración SMTP
  └── Pruebas: tests/integration/infrastructure/email/test_smtp_provider.py

□ Tarea 2.5: Crear motor de plantillas
  └── src/myapp/infrastructure/email/template_engine.py
  └── Plantillas Jinja2
  └── Pruebas: tests/unit/infrastructure/email/test_template_engine.py

□ Tarea 2.6: Crear tarea Celery
  └── src/myapp/infrastructure/tasks/email_tasks.py
  └── Configuración de reintentos
  └── Pruebas: tests/integration/infrastructure/tasks/test_email_tasks.py

FASE 3: CAPA DE APLICACIÓN
□ Tarea 3.1: Crear EmailDTO
  └── src/myapp/application/dtos/email_dto.py
  └── Modelo Pydantic

□ Tarea 3.2: Crear SendOrderConfirmationUseCase
  └── src/myapp/application/use_cases/send_order_confirmation.py
  └── Pruebas: tests/unit/application/use_cases/test_send_order_confirmation.py

□ Tarea 3.3: Integrar en CreateOrderUseCase
  └── Modificar src/myapp/application/use_cases/create_order.py
  └── Agregar llamada asíncrona
  └── Pruebas: tests/unit/application/use_cases/test_create_order.py (actualizar)

FASE 4: CONFIGURACIÓN E INYECCIÓN DE DEPENDENCIAS
□ Tarea 4.1: Configurar inyección de dependencias
  └── src/myapp/infrastructure/di/container.py
  └── Registrar EmailService, repositorios, proveedores

□ Tarea 4.2: Agregar variables de entorno
  └── .env.example
  └── Documentación en README

□ Tarea 4.3: Crear plantillas de correo
  └── src/myapp/infrastructure/email/templates/order_confirmation.html
  └── src/myapp/infrastructure/email/templates/order_confirmation.txt

FASE 5: PRUEBAS Y CALIDAD
□ Tarea 5.1: Pruebas de extremo a extremo
  └── tests/e2e/test_order_confirmation_flow.py

□ Tarea 5.2: Pruebas de rendimiento
  └── tests/performance/test_email_throughput.py
  └── Verificar 10k correos/día

□ Tarea 5.3: Calidad de código
  └── make lint
  └── make type-check
  └── make test-cov (>80%)

FASE 6: DOCUMENTACIÓN
□ Tarea 6.1: Documentación de API
  └── Docstrings completos
  └── Documentación Sphinx

□ Tarea 6.2: Actualización de README
  └── Sección de notificaciones por correo
  └── Guía de configuración

□ Tarea 6.3: ADR (Architecture Decision Record)
  └── docs/adr/0001-email-notification-system.md
"""
```

#### Estimación

```python
"""
ESTIMACIÓN (en horas):

FASE 1: CAPA DE DOMINIO
- Tareas 1.1 a 1.6: 8h
  └── 2h dev + 2h pruebas por componente (promedio)

FASE 2: CAPA DE INFRAESTRUCTURA
- Tareas 2.1 a 2.6: 12h
  └── Base de datos + proveedores + celery

FASE 3: CAPA DE APLICACIÓN
- Tareas 3.1 a 3.3: 6h
  └── Casos de uso + integración

FASE 4: CONFIGURACIÓN E INYECCIÓN DE DEPENDENCIAS
- Tareas 4.1 a 4.3: 4h
  └── Configuración + plantillas

FASE 5: PRUEBAS Y CALIDAD
- Tareas 5.1 a 5.3: 6h
  └── E2E + rendimiento + calidad

FASE 6: DOCUMENTACIÓN
- Tareas 6.1 a 6.3: 3h
  └── Documentación completa

TOTAL: 39h (≈ 5 días)
BUFFER 20%: +8h
TOTAL CON BUFFER: 47h (≈ 6 días)
"""
```

### 6. Identificación de Riesgos

#### Matriz de Riesgos

```python
"""
RIESGOS IDENTIFICADOS:

RIESGO 1: Sobrecarga del servidor SMTP
├── Probabilidad: MEDIA
├── Impacto: ALTO
├── Descripción: 10k correos/día pueden saturar SMTP básico
└── Mitigación:
    ├── Limitación de velocidad en Celery (máx 100 correos/minuto)
    ├── Cola dedicada para correos
    ├── Monitoreo de cola
    └── Proveedor de respaldo (SendGrid/SES)

RIESGO 2: Correos marcados como spam
├── Probabilidad: MEDIA
├── Impacto: ALTO
├── Descripción: Los correos transaccionales pueden ser bloqueados
└── Mitigación:
    ├── SPF/DKIM/DMARC configurados
    ├── Calentamiento de IP dedicada
    ├── Plantillas conformes anti-spam
    └── Monitoreo de tasa de entregabilidad

RIESGO 3: Pérdida de correo en caso de fallo
├── Probabilidad: BAJA
├── Impacto: MEDIO
├── Descripción: Fallo antes de persistencia en BD
└── Mitigación:
    ├── Transacción atómica (guardar + encolar)
    ├── Cola de mensajes muertos de Celery
    ├── Monitoreo de tareas fallidas
    └── Sistema de reencolar manual

RIESGO 4: Inyección de plantilla
├── Probabilidad: BAJA
├── Impacto: ALTO
├── Descripción: Inyección de código en plantillas
└── Mitigación:
    ├── Sanitización de entradas
    ├── Plantillas precompiladas
    ├── Validación estricta de datos
    └── Escaneo de seguridad (bandit)

RIESGO 5: Degradación del rendimiento de la API
├── Probabilidad: BAJA
├── Impacto: MEDIO
├── Descripción: Encolar lento retrasa la creación de pedidos
└── Mitigación:
    ├── Encolar estrictamente asíncrono
    ├── Tiempo de espera corto en encolar
    ├── Fallback elegante si la cola está caída
    └── Monitoreo del tiempo de respuesta de API

RIESGO 6: Datos sensibles en correos
├── Probabilidad: MEDIA
├── Impacto: ALTO
├── Descripción: Fuga de datos vía correos no cifrados
└── Mitigación:
    ├── TLS obligatorio
    ├── Sin datos sensibles en texto plano (ej. tarjetas de crédito)
    ├── Enlaces seguros con tokens de corta duración
    └── Auditoría de seguridad de plantillas
"""
```

### 7. Definición de Pruebas

#### Estrategia de Pruebas

```python
"""
ESTRATEGIA DE PRUEBAS:

1. PRUEBAS UNITARIAS (Aislamiento completo)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Capa de Dominio:
├── test_email_entity.py
│   ├── test_create_email_with_valid_data()
│   ├── test_mark_as_sent_updates_status_and_timestamp()
│   ├── test_mark_as_failed_stores_error_message()
│   └── test_cannot_send_already_sent_email()
│
├── test_email_address.py
│   ├── test_valid_email_address()
│   ├── test_invalid_email_raises_exception()
│   ├── test_email_normalization()
│   └── test_equality_comparison()
│
└── test_email_service.py
    ├── test_create_order_confirmation_with_valid_order()
    ├── test_create_order_confirmation_uses_correct_template()
    ├── test_validate_email_content_with_valid_email()
    └── test_validate_email_content_rejects_spam_patterns()

Capa de Aplicación:
└── test_send_order_confirmation_use_case.py
    ├── test_execute_creates_and_saves_email()
    ├── test_execute_enqueues_email_task()
    ├── test_execute_raises_if_order_not_found()
    └── test_execute_rolls_back_on_enqueue_failure()

2. PRUEBAS DE INTEGRACIÓN (Componentes reales)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Capa de Infraestructura:
├── test_email_repository.py
│   ├── test_save_email_to_database()
│   ├── test_find_by_id_returns_email()
│   ├── test_find_by_order_id_returns_all_emails()
│   └── test_update_email_status()
│
├── test_smtp_provider.py
│   ├── test_send_email_via_smtp() (con MailHog/FakeSMTP)
│   ├── test_send_email_with_attachment()
│   ├── test_connection_retry_on_failure()
│   └── test_tls_encryption_enabled()
│
└── test_email_tasks.py
    ├── test_send_email_task_successful()
    ├── test_send_email_task_retry_on_failure()
    ├── test_send_email_task_max_retries_reached()
    └── test_send_email_task_updates_database()

3. PRUEBAS DE EXTREMO A EXTREMO (Flujo completo)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

└── test_order_confirmation_flow.py
    ├── test_complete_order_confirmation_flow()
    │   1. Crear pedido vía API
    │   2. Verificar correo creado en BD
    │   3. Esperar ejecución de tarea Celery
    │   4. Verificar correo enviado (MailHog)
    │   5. Verificar estado = SENT en BD
    │
    ├── test_order_confirmation_with_smtp_failure()
    │   1. Crear pedido
    │   2. Simular fallo SMTP
    │   3. Verificar reintento Celery
    │   4. Verificar estado = FAILED después de reintentos máximos
    │
    └── test_order_confirmation_performance()
        └── Crear 100 pedidos concurrentes
        └── Verificar todos los correos enviados < 5min

4. PRUEBAS DE RENDIMIENTO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

└── test_email_throughput.py
    ├── test_10k_emails_per_day_throughput()
    ├── test_api_response_time_under_200ms()
    ├── test_queue_processing_rate()
    └── test_database_load_under_stress()

5. PRUEBAS DE SEGURIDAD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

└── test_email_security.py
    ├── test_template_injection_prevention()
    ├── test_email_content_sanitization()
    ├── test_tls_connection_enforced()
    └── test_no_sensitive_data_in_logs()

COBERTURA OBJETIVO:
- General: > 80%
- Capa de Dominio: > 95%
- Capa de Aplicación: > 90%
- Capa de Infraestructura: > 75%
"""
```

## Lista de Verificación de Análisis Completo

Antes de comenzar cualquier implementación, verificar:

### Comprensión
- [ ] Objetivo claramente definido y documentado
- [ ] Criterios de aceptación listados
- [ ] Restricciones técnicas identificadas
- [ ] Contexto del negocio comprendido

### Exploración
- [ ] Código similar identificado y analizado
- [ ] Arquitectura actual documentada
- [ ] Patrones del proyecto identificados
- [ ] Dependencias existentes listadas

### Impacto
- [ ] Matriz de impacto creada
- [ ] Módulos afectados listados
- [ ] Efectos secundarios identificados
- [ ] Migraciones necesarias planificadas

### Diseño
- [ ] Arquitectura de la solución definida
- [ ] Flujo de datos documentado
- [ ] Elecciones técnicas justificadas
- [ ] Alternativas evaluadas

### Planificación
- [ ] Tareas desglosadas en pasos atómicos
- [ ] Orden de implementación definido
- [ ] Estimación completada con buffer
- [ ] Dependencias de tareas identificadas

### Riesgos
- [ ] Riesgos identificados y evaluados
- [ ] Planes de mitigación definidos
- [ ] Monitoreo planificado
- [ ] Fallbacks planificados

### Pruebas
- [ ] Estrategia de pruebas definida
- [ ] Pruebas unitarias planificadas
- [ ] Pruebas de integración planificadas
- [ ] Pruebas E2E planificadas
- [ ] Cobertura objetivo definida

## Plantillas de Documentación

### Plantilla: Análisis de Funcionalidad

```markdown
# Análisis: [Nombre de la Funcionalidad]

## 1. Necesidad
### Objetivo
[Descripción clara del objetivo]

### Contexto del Negocio
[Contexto del negocio y usuarios]

### Restricciones
- Rendimiento: [restricciones]
- Seguridad: [restricciones]
- Escalabilidad: [restricciones]

### Criterios de Aceptación
1. [Criterio 1]
2. [Criterio 2]

## 2. Código Existente
### Patrones Identificados
[Lista de patrones similares]

### Arquitectura Actual
[Descripción de la arquitectura]

### Estándares del Proyecto
[Convenciones y estándares]

## 3. Impacto
[Matriz de impacto]

## 4. Solución
### Arquitectura
[Diagramas y descripción]

### Flujo de Datos
[Descripción del flujo]

### Elecciones Técnicas
[Justificación de elecciones]

## 5. Implementación
### Plan
[Lista ordenada de tareas]

### Estimación
[Estimación con buffer]

## 6. Riesgos
[Lista de riesgos y mitigaciones]

## 7. Pruebas
[Estrategia de pruebas detallada]
```

### Plantilla: Análisis de Error

```markdown
# Análisis de Error: [Título del Error]

## 1. Síntomas
### Descripción
[Qué no funciona]

### Reproducción
1. [Paso 1]
2. [Paso 2]

### Comportamiento Esperado vs Real
- Esperado: [comportamiento]
- Real: [comportamiento]

## 2. Investigación
### Registros y Traza de Pila
\`\`\`
[Traza de pila]
\`\`\`

### Código Afectado
[Archivos y líneas]

### Hipótesis
1. [Hipótesis 1]
2. [Hipótesis 2]

## 3. Causa Raíz
[Explicación de la causa]

## 4. Solución
### Corrección Propuesta
[Descripción de la corrección]

### Impacto
[Módulos afectados]

### Riesgos
[Riesgos de la corrección]

## 5. Pruebas
### Pruebas de No Regresión
[Lista de pruebas]

### Validación
[Cómo validar la corrección]
```

## Conclusión

El análisis preliminar no es una pérdida de tiempo, es una **inversión**.

**Beneficios:**
- Reduce los errores de diseño
- Evita refactorización costosa
- Mejora la calidad del código
- Facilita la revisión
- Acelera la implementación
- Reduce la deuda técnica

**Regla de Oro:**
> Dedicar el 20% del tiempo al análisis ahorra el 50% del tiempo total.

**Ejemplo:**
- Funcionalidad estimada: 40h
- Con análisis (8h): 32h de implementación = **40h total**
- Sin análisis: 60h de implementación (errores, refactorización, malentendidos) = **60h total**
- **Ganancia: 20h (33%)**
