# Guía de Flujo de Trabajo Completo: De la Idea a la Producción

Una guía completa paso a paso para construir una aplicación completa usando Claude Craft, desde la idea inicial hasta el despliegue en producción.

---

## Visión General

Esta guía te lleva a través del ciclo de vida de desarrollo completo:

1. **Ideación** - Define la visión de tu producto
2. **Requisitos** - Documenta qué estás construyendo
3. **Arquitectura** - Diseña la solución técnica
4. **Planificación** - Crea sprints accionables
5. **Desarrollo** - Implementa con TDD
6. **Calidad** - Valida y prueba
7. **Despliegue** - Lanza a producción

**Prerequisitos:**
- Claude Craft v8.11.0 instalado en tu proyecto
- Claude Code v2.1.159 (recomendado) o v2.1.97+ (mínimo, CVE-2025-59536 parcheado)
- Comprensión básica de tu stack tecnológico elegido

---

## Fase 1: Ideación (5-10 minutos)

### Configura tu Sesión

Antes de empezar, configura tu sesión para un rendimiento óptimo:

```bash
# Ajustar el esfuerzo de razonamiento para la planificación (alto para tareas complejas)
/effort high

# Opcionalmente configurar la optimización de tokens
/common:setup-rtk
```

### Comenzar con BMAD

```bash
# Inicializar BMAD en tu proyecto
/bmad:init

# O iniciar un flujo de trabajo
/workflow:init
```

### Definir la Visión

Trabaja con el agente de Product Manager:

```
@pm Quiero construir una plataforma de e-commerce para vender productos artesanales.
Características clave:
- Catálogo de productos con categorías
- Carrito de compras y pago
- Autenticación de usuarios
- Gestión de pedidos
```

El PM te ayudará a:
- Clarificar el problema que estás resolviendo
- Identificar los usuarios objetivo
- Definir las métricas de éxito

### Crear el Documento de Visión Inicial

```
@pm Crea un documento de visión para este proyecto
```

Salida: `docs/vision.md`

---

## Fase 2: Requisitos (15-30 minutos)

### Analizar los Requisitos

Trabaja con el Analista de Negocio:

```
@ba Analiza los requisitos para la plataforma de e-commerce basándose en la visión
```

El BA hará lo siguiente:
- Desglosar las funcionalidades en historias de usuario
- Identificar dependencias
- Crear un mapa de historias de usuario

### Crear el PRD

```
@pm Crea un Documento de Requisitos de Producto
```

### Validar el PRD

```
/gate:validate-prd docs/prd.md
```

Asegúrate de pasar la Puerta del PRD (≥80%):
- [ ] Declaración del problema definida
- [ ] Usuarios objetivo identificados
- [ ] Objetivos claros
- [ ] Métricas de éxito definidas
- [ ] Límites del alcance establecidos

---

## Fase 3: Arquitectura (20-45 minutos)

### Diseñar la Arquitectura

Trabaja con el Arquitecto:

```
@architect Diseña la arquitectura del sistema para la plataforma de e-commerce
Considera:
- Backend Symfony con API Platform
- Base de datos PostgreSQL
- Caché Redis
- Despliegue con Docker
```

El Arquitecto creará:
- Diagrama de arquitectura del sistema
- Diseño de componentes
- Modelo de datos
- Contratos de API

### Crear la Especificación Técnica

```
@architect Crea la especificación técnica a partir del PRD
```

Salida: `docs/tech-spec.md`

### Documentar las Decisiones

Para elecciones importantes:

```
@architect Crea un ADR para elegir JWT sobre autenticación basada en sesión
```

Salida: `docs/adr/001-jwt-authentication.md`

### Validar la Especificación Técnica

```
/gate:validate-techspec docs/tech-spec.md
```

Asegúrate de pasar la Puerta de la Especificación Técnica (≥90%):
- [ ] Arquitectura documentada
- [ ] Contratos de API definidos
- [ ] Seguridad abordada
- [ ] Requisitos de rendimiento establecidos
- [ ] Estrategia de testing definida
- [ ] Plan de despliegue creado

---

## Fase 4: Planificación (15-30 minutos)

### Crear el Backlog

Trabaja con el Product Owner:

```
@po Crea historias de usuario a partir de la especificación técnica
Prioriza usando el método MoSCoW
```

El PO creará historias como:
```
EPIC-001: Autenticación de Usuarios
├── US-001: Registro de usuarios
├── US-002: Inicio de sesión de usuarios
├── US-003: Restablecimiento de contraseña
└── US-004: Inicio de sesión social

EPIC-002: Catálogo de Productos
├── US-005: Explorar productos
├── US-006: Búsqueda de productos
├── US-007: Filtrado por categoría
└── US-008: Detalles del producto
```

### Validar el Backlog

```
/gate:validate-backlog
```

Cada historia debe pasar INVEST:
- **I**ndependiente
- **N**egociable
- **V**aliosa
- **E**stimable
- **S**mall (pequeña)
- **T**estable

### Planificar el Primer Sprint

Trabaja con el Scrum Master:

```
@sm Planifica el sprint 1 con las historias de mayor prioridad
Incluye:
- US-001: Registro de usuarios
- US-002: Inicio de sesión de usuarios
- US-005: Explorar productos
```

### Validar el Sprint

```
/gate:validate-sprint
```

---

## Fase 5: Desarrollo (Variable)

### Iniciar el Desarrollo del Sprint

```
/sprint:dev 1
```

O trabaja historia por historia:

### 5.1 Obtener la Siguiente Historia

```
/sprint:next-story --claim
```

Ejemplo: US-001 (Registro de Usuarios)

### 5.2 Transicionar a En Progreso

```
/sprint:transition US-001 in-progress
```

### 5.3 Fase Roja TDD (Escribir Test Fallido)

Trabaja con el agente Desarrollador:

```
@dev Comienza TDD para US-001 (Registro de Usuarios)
Empieza con la fase 🔴 Roja - escribe tests fallidos
```

Crea los tests primero:
```php
// tests/Feature/UserRegistrationTest.php
class UserRegistrationTest extends TestCase
{
    public function test_user_can_register_with_valid_data(): void
    {
        $response = $this->post('/api/register', [
            'email' => 'test@example.com',
            'password' => 'SecurePass123!',
            'name' => 'Test User'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }
}
```

### 5.4 Fase Verde TDD (Implementar)

```
@dev Ahora implementa la fase 🟢 Verde - haz que los tests pasen
```

Genera código:
```
/symfony:generate-crud User
```

### 5.5 Fase de Refactorización TDD

```
@dev 🔵 Refactorizar - limpia la implementación
```

### 5.6 Revisión de Código

```
@symfony-reviewer Revisa la implementación del registro de usuarios
```

### 5.7 Validar la DoD de la Historia

```
/gate:validate-story US-001
```

### 5.8 Transicionar a Revisión

```
/sprint:transition US-001 review
```

### 5.9 Validación QA

```
@qa Valida los criterios de aceptación para US-001
```

### 5.10 Completar la Historia

```
/sprint:transition US-001 done
```

### 5.11 Repetir

Continúa con la siguiente historia hasta completar el sprint.

---

## Fase 6: Calidad (A lo Largo del Desarrollo)

### Gestión del Contexto

Durante el desarrollo, gestiona tu ventana de contexto de manera eficiente:

```bash
# Verificar sugerencias de optimización del contexto
/context

# Cambiar a un esfuerzo menor para tareas simples
/effort low

# Limpiar el contexto entre tareas no relacionadas
/clear

# Guardar aprendizajes importantes que persistan entre sesiones
/memory "Decisión arquitectónica clave: usando CQRS para el módulo de pedidos"
```

### Verificaciones de Calidad Continuas

Ejecuta regularmente durante el desarrollo:

```bash
# Configurar monitoreo de calidad recurrente
/loop 5m /common:pre-commit-check

# Verificación de arquitectura
/symfony:check-architecture

# Calidad del código
/symfony:check-code-quality

# Auditoría de seguridad
/symfony:check-security

# Cobertura de tests
/symfony:check-testing
```

### Auditoría Completa Antes del Lanzamiento

```
/team:audit --sequential
```

### Validación Pre-Commit

Siempre antes de hacer commit:

```
/common:pre-commit-check
```

### Revisión del Sprint

Al final del sprint:

```
@sm Ejecuta la revisión del sprint 1
```

### Retrospectiva

```
@sm Ejecuta la retrospectiva del sprint
```

---

## Fase 7: Despliegue (30-60 minutos)

### Preparar la Configuración Docker

```
@docker-architect Diseña la arquitectura Docker para producción
```

### Crear los Archivos Docker

```
/docker:compose-setup symfony postgresql redis
```

### Crear el Pipeline CI/CD

```
/docker:cicd-pipeline github-actions
```

### Verificación de Seguridad

```
/docker:security-scan
```

### Lista de Verificación Pre-Lanzamiento

```
/common:release-checklist
```

### Desplegar

```bash
# Construir y probar
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Ejecutar migraciones
docker compose exec app php bin/console doctrine:migrations:migrate

# Verificar salud
curl https://tu-app.com/health
```

---

## Usar Ralph para la Automatización

Para ciclos de desarrollo automatizados, usa Ralph Wiggum:

```bash
# Implementar una funcionalidad automáticamente
/common:ralph-run "Implementar el registro de usuarios con TDD"

# Con verificaciones completas de DoD
/common:ralph-run --full "Añadir la funcionalidad de restablecimiento de contraseña"
```

Ralph iterará hasta que:
- Todos los tests pasen
- El lint pase
- Los validadores de DoD pasen

---

## Secuencia Completa de Comandos

Aquí hay una secuencia condensada para una funcionalidad típica:

```bash
# 0. Configuración de la sesión
/effort high                    # Planificación compleja
/common:setup-rtk               # Optimización de tokens (solo la primera vez)

# 1. Inicializar
/bmad:init

# 2. Definir (PM)
@pm Crea el PRD para la funcionalidad
/gate:validate-prd docs/prd.md

# 3. Diseñar (Arquitecto)
@architect Crea la especificación técnica
/gate:validate-techspec docs/tech-spec.md

# 4. Planificar (PO + SM)
@po Crea historias de usuario
@sm Planifica el sprint 1
/gate:validate-sprint

# 5. Desarrollar (Dev)
/sprint:next-story --claim
@dev Implementar con TDD
/gate:validate-story US-001
/sprint:transition US-001 done

# 6. Revisar (QA)
@qa Valida los criterios de aceptación
/team:audit --sequential

# 7. Desplegar
/docker:cicd-pipeline github-actions
/common:release-checklist
```

---

## Consejos para el Éxito

### 0. Gestiona tu Ventana de Contexto

La ventana de contexto es tu recurso más crítico:
- Usa `/effort low` para tareas simples, `/effort high` para tareas complejas
- Usa `/context` regularmente para verificar sugerencias de optimización
- Ejecuta `/clear` entre tareas no relacionadas
- Usa `/memory` para persistir las decisiones clave entre sesiones
- Configura `/loop` para verificaciones recurrentes en lugar de ejecuciones manuales

### 1. No Omitas las Puertas de Calidad

Cada puerta detecta diferentes problemas:
- Puerta PRD → Evita construir lo incorrecto
- Puerta de Especificación Técnica → Evita problemas arquitectónicos
- Puerta de Backlog → Asegura que las historias sean implementables
- DoD de Historia → Asegura código de calidad

### 2. Usa los Agentes de Forma Colaborativa

Deja que los agentes se pasen el trabajo entre sí:
```
@bmad-master Enruta esto al agente apropiado
```

### 3. TDD No es Negociable

Sigue siempre 🔴 Rojo → 🟢 Verde → 🔵 Refactorizar.

### 4. Documenta las Decisiones

Usa ADRs para elecciones importantes:
```
@architect Crea un ADR para elegir X sobre Y
```

### 5. Revisiones Regulares

- Diarias: `/common:daily-standup`
- Al final del Sprint: `@sm Ejecuta la revisión del sprint`
- Continuas: `@{tech}-reviewer Revisa este código`

---

## Solución de Problemas

### Falla en la Puerta de Calidad

```
/gate:report
```

Comprueba qué criterios faltan.

### Historia Bloqueada

```
/sprint:transition US-001 blocked --reason="Esperando la API"
```

### Necesitar Revertir Cambios

Si usas Ralph con puntos de control de Git:
```bash
git log --oneline --grep="[ralph]"
git reset --hard HEAD~3
```

---

## Próximos Pasos

- [Guía Práctica de BMAD](../BMAD-PRACTICAL-GUIDE.md) - Profundización en BMAD
- [Guía de Ralph Wiggum](../RALPH-GUIDE.md) - Desarrollo automatizado
- [Referencia de Comandos](../COMMANDS.md) - Todos los comandos disponibles
- [Referencia de Agentes](../AGENTS.md) - Todos los agentes disponibles
