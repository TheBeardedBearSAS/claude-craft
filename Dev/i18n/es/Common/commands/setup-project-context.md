---
name: setup-project-context
description: Analizar el codigo y configurar el contexto del proyecto interactivamente
arguments:
  - name: mode
    description: Modo de deteccion (--auto preguntas minimas, --full cuestionario completo)
    required: false
---

# Configuracion del Contexto del Proyecto

Configura `.claude/rules/00-project-context.md` analizando el codigo y haciendo preguntas especificas.

## Ejecucion

### Fase 1: Deteccion Automatica

Analizar los siguientes archivos y directorios:

**Archivos de Configuracion:**
- `package.json` → Nombre del proyecto Node.js, dependencias, scripts
- `composer.json` → Nombre del proyecto PHP, dependencias, framework
- `pubspec.yaml` → Nombre del proyecto Flutter/Dart, dependencias
- `requirements.txt` / `pyproject.toml` → Dependencias Python
- `Cargo.toml` → Proyecto Rust
- `go.mod` → Modulo Go

**Entorno y Configuracion:**
- `.env`, `.env.example` → Base de datos, servicios
- `config/` → Configuracion del framework
- `docker-compose.yml` → Servicios (DB, Redis, etc.)

**Estructura:**
- `src/`, `lib/`, `app/` → Ubicacion del codigo fuente
- `tests/`, `spec/` → Framework de testing
- `docs/`, `specifications/` → Documentacion
- `.github/`, `.gitlab-ci.yml` → CI/CD

**Dominio (si aplica):**
- `src/Entity/`, `src/Domain/` → Entidades de negocio (PHP/Symfony)
- `lib/models/`, `lib/domain/` → Modelos (Flutter/Dart)
- `models/`, `schemas/` → Modelos de datos
- `migrations/` → Esquema de base de datos

Mostrar resultados del analisis:

```
╔══════════════════════════════════════════════════════════════╗
║             RESULTADOS DEL ANALISIS DEL PROYECTO              ║
╚══════════════════════════════════════════════════════════════╝

✅ Informacion Detectada:
┌─────────────────┬────────────────────────────────┐
│ Elemento        │ Valor                          │
├─────────────────┼────────────────────────────────┤
│ Nombre Proyecto │ {nombre_detectado}             │
│ Lenguaje        │ {lenguaje_detectado}           │
│ Framework       │ {framework_detectado}          │
│ Base de Datos   │ {database_detectada}           │
│ Testing         │ {testing_detectado}            │
│ CI/CD           │ {cicd_detectado}               │
└─────────────────┴────────────────────────────────┘

📁 Estructura del Proyecto:
{estructura_detectada}

📄 Documentacion Encontrada:
{docs_detectados}

❌ No Detectado (se preguntara):
- {elementos_faltantes}
```

### Fase 2: Preguntas Interactivas

Preguntar solo por informacion NO detectada en la Fase 1.
Omitir preguntas si se usa el modo `--auto` y existe un valor por defecto razonable.

**Preguntas Esenciales:**

1. **Tipo de Aplicacion** (si no se detecto):
   ```
   Que tipo de aplicacion es?
   [ ] API REST      [ ] Aplicacion Web    [ ] Aplicacion Movil
   [ ] Herramienta CLI [ ] Libreria/Paquete [ ] Monorepo
   ```

2. **Dominio de Negocio**:
   ```
   Cual es el dominio de negocio?
   [ ] E-commerce    [ ] Plataforma SaaS   [ ] FinTech
   [ ] HealthTech    [ ] EdTech            [ ] Social/Comunidad
   [ ] Media/Contenido [ ] IoT             [ ] Otro: _____
   ```

3. **Usuarios Objetivo** (2-3 personas):
   ```
   Describe a tus usuarios principales:

   Usuario Principal:
   > Rol: _____
   > Objetivo principal: _____

   Usuario Secundario (opcional):
   > Rol: _____
   > Objetivo principal: _____
   ```

4. **Requisitos de Cumplimiento**:
   ```
   Que requisitos de cumplimiento aplican?
   [ ] GDPR (Proteccion de datos UE)
   [ ] HIPAA (Salud EEUU)
   [ ] PCI-DSS (Tarjetas de pago)
   [ ] SOC2 (Seguridad)
   [ ] Ninguno / No aplica
   ```

**Preguntas Extendidas** (solo con modo `--full`):

5. **Objetivos de Negocio**:
   ```
   Objetivos a corto plazo (3-6 meses):
   > _____

   Objetivos a mediano plazo (6-12 meses):
   > _____
   ```

6. **Problemas Conocidos/Deuda Tecnica**:
   ```
   Hay problemas conocidos o deuda tecnica a documentar?
   > _____
   ```

7. **Terminos del Glosario**:
   ```
   Terminos clave de negocio a definir (separados por comas):
   > _____
   ```

### Fase 3: Generar Archivo de Contexto

Crear `.claude/rules/00-project-context.md`:

```markdown
# Contexto del Proyecto - {NOMBRE_PROYECTO}

> Generado automaticamente por `/common:setup-project-context` el {FECHA}
> Revisar y personalizar segun sea necesario.

## Vision General

**{NOMBRE_PROYECTO}** es una aplicacion {TIPO} para el dominio {DOMINIO}.

{DESCRIPCION_DESDE_README_O_USUARIO}

## Stack Tecnico

| Componente   | Tecnologia           |
|--------------|----------------------|
| Lenguaje     | {LENGUAJE}           |
| Framework    | {FRAMEWORK}          |
| Base Datos   | {DATABASE}           |
| Cache        | {CACHE_SI_DETECTADO} |
| Testing      | {FRAMEWORKS_TEST}    |
| CI/CD        | {PLATAFORMA_CICD}    |

## Estructura del Proyecto

```
{ESTRUCTURA_DETECTADA}
```

## Dominio de Negocio

### Conceptos Clave

{ENTIDADES_SI_DETECTADAS}

### Bounded Contexts

<!-- Agregar si usa DDD -->
- Contexto 1: ...
- Contexto 2: ...

## Usuarios y Personas

### {ROL_USUARIO_PRINCIPAL}
- **Objetivo:** {OBJETIVO_USUARIO_PRINCIPAL}
- **Puntos de friccion:** Por documentar
- **Flujos clave:** Por documentar

### {ROL_USUARIO_SECUNDARIO}
- **Objetivo:** {OBJETIVO_USUARIO_SECUNDARIO}
- **Puntos de friccion:** Por documentar
- **Flujos clave:** Por documentar

## Restricciones

### Cumplimiento
{REQUISITOS_CUMPLIMIENTO}

### Objetivos de Rendimiento
- Tiempo de carga de pagina: < 3s
- Tiempo de respuesta API: < 200ms
- Disponibilidad: 99.9%

### Requisitos de Seguridad
- Cumplimiento OWASP Top 10
- Validacion de entrada en todos los endpoints
- Autenticacion requerida para recursos protegidos

## Objetivos

### Corto plazo
{OBJETIVOS_CORTO_PLAZO_O_PLACEHOLDER}

### Mediano plazo
{OBJETIVOS_MEDIANO_PLAZO_O_PLACEHOLDER}

## Problemas Conocidos / Deuda Tecnica

{PROBLEMAS_O_PLACEHOLDER}

## Glosario

| Termino | Definicion |
|---------|------------|
{TERMINOS_GLOSARIO_O_EJEMPLOS}
```

### Fase 4: Validacion y Siguientes Pasos

Mostrar resumen y recomendaciones:

```
╔══════════════════════════════════════════════════════════════╗
║              CONTEXTO DEL PROYECTO GENERADO                   ║
╚══════════════════════════════════════════════════════════════╝

✅ Archivo creado: .claude/rules/00-project-context.md

Resumen:
┌─────────────────┬────────────────────────────────┐
│ Proyecto        │ {NOMBRE_PROYECTO}              │
│ Tipo            │ {TIPO}                         │
│ Stack           │ {FRAMEWORK} + {DATABASE}       │
│ Dominio         │ {DOMINIO}                      │
│ Cumplimiento    │ {CUMPLIMIENTO}                 │
│ Personas        │ {CANTIDAD} definidos           │
└─────────────────┴────────────────────────────────┘

📋 Siguientes Pasos Recomendados:

1. Revisar archivo generado y completar secciones placeholder
2. Agregar bounded contexts detallados si usa DDD
3. Documentar flujos de negocio clave
4. Considerar ejecutar agentes especializados:
   - @database-architect → Documentar esquema de base de datos
   - @api-designer → Documentar endpoints de API
   - @security-reviewer → Revisar restricciones de seguridad

Desea que abra el archivo para revision?
```

## Modos

| Modo | Comportamiento |
|------|----------------|
| (defecto) | Deteccion + preguntas esenciales (tipo, dominio, usuarios, cumplimiento) |
| `--auto` | Deteccion maxima, omitir preguntas con valores por defecto razonables |
| `--full` | Todas las preguntas incluyendo objetivos, problemas y glosario |

## Ejemplos

```bash
# Modo estandar - deteccion y preguntas equilibradas
/common:setup-project-context

# Modo auto - interaccion minima
/common:setup-project-context --auto

# Modo completo - cuestionario exhaustivo
/common:setup-project-context --full
```
