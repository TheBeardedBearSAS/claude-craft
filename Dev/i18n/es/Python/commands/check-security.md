---
description: Verificar Seguridad Python
argument-hint: [arguments]
---

# Verificar Seguridad Python

## Argumentos

$ARGUMENTS (opcional: ruta al proyecto a analizar)

## MISIÓN

Realizar una auditoría completa de seguridad del proyecto Python identificando vulnerabilidades, secretos expuestos y malas prácticas de seguridad definidas en las reglas del proyecto.

### Paso 1: Análisis de Seguridad con Bandit

Escanear código con Bandit para detectar vulnerabilidades:
- [ ] Sin contraseñas/secretos codificados en duro
- [ ] Sin uso de `eval()` o `exec()`
- [ ] Sin deserialización insegura (pickle)
- [ ] Sin inyección SQL (ORM o consultas parametrizadas)
- [ ] Sin inyección de comandos shell
- [ ] Criptografía segura (no MD5/SHA1)

**Comando**: Ejecutar `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install bandit && bandit -r /app -f json"`

**Referencia**: `rules/06-tooling.md` sección "Análisis de Seguridad"

### Paso 2: Detección de Secretos

Buscar secretos y credenciales en el código:
- [ ] Sin claves API en código fuente
- [ ] Sin tokens en archivos
- [ ] Sin contraseñas en texto plano
- [ ] Variables de entorno para configuración sensible
- [ ] .env en .gitignore
- [ ] .env.example proporcionado (sin valores reales)

**Comando**: Usar grep/buscar para detectar patrones de secretos

**Patrones a buscar**:
- `password\s*=\s*["'][^"']+["']`
- `api_key\s*=\s*["'][^"']+["']`
- `secret\s*=\s*["'][^"']+["']`
- `token\s*=\s*["'][^"']+["']`

**Referencia**: `rules/03-coding-standards.md` sección "Mejores Prácticas de Seguridad"

### Paso 3: Validación de Entrada de Usuario

Verificar validación y sanitización de datos:
- [ ] Validación de todas las entradas de usuario
- [ ] Uso de Pydantic para validación
- [ ] Sanitización de datos antes de procesarlos
- [ ] Sin confianza ciega en datos externos
- [ ] Validación de tipo y formato
- [ ] Límites en tamaño de entrada

**Referencia**: `rules/03-coding-standards.md` sección "Validación de Entrada"

### Paso 4: Dependencias y Vulnerabilidades

Analizar dependencias para vulnerabilidades conocidas:
- [ ] Sin dependencias con CVEs críticos
- [ ] Versiones de librerías actualizadas
- [ ] requirements.txt con versiones fijadas
- [ ] Uso de `pip-audit` o `safety`
- [ ] Sin dependencias obsoletas

**Comando**: Ejecutar `docker run --rm -v $(pwd):/app python:3.11 sh -c "pip install pip-audit && pip-audit --requirement /app/requirements.txt"`

**Referencia**: `rules/06-tooling.md` sección "Gestión de Dependencias"

### Paso 5: Manejo de Errores y Logs

Verificar manejo seguro de errores:
- [ ] Sin stack traces expuestos en producción
- [ ] Mensajes de error genéricos para usuarios
- [ ] Logs seguros (sin datos sensibles)
- [ ] Sin modo debug en producción
- [ ] Manejo apropiado de excepciones
- [ ] Registro de eventos de seguridad

**Referencia**: `rules/03-coding-standards.md` sección "Manejo de Errores"

### Paso 6: Autenticación y Autorización

Verificar seguridad de autenticación:
- [ ] Sin gestión manual de contraseñas (usar bcrypt/argon2)
- [ ] Tokens JWT con expiración
- [ ] HTTPS obligatorio para endpoints sensibles
- [ ] Protección CSRF si aplica
- [ ] Rate limiting en endpoints sensibles
- [ ] Validación de permisos (RBAC/ABAC)

**Referencia**: `rules/02-architecture.md` sección "Capa de Seguridad"

### Paso 7: Configuración y Entorno

Analizar configuración de seguridad:
- [ ] Variables de entorno para secretos
- [ ] Configuración diferente por entorno (dev/staging/prod)
- [ ] Sin secretos en docker-compose.yml
- [ ] Secretos en variables de entorno o vault
- [ ] .env.example documentado
- [ ] DEBUG=False en producción

**Referencia**: `rules/06-tooling.md` sección "Configuración de Entorno"

### Paso 8: Inyecciones y XSS

Verificar protección contra inyecciones:
- [ ] Sin inyección SQL (ORM o consultas parametrizadas)
- [ ] Escapado de datos en templates
- [ ] Sin inyección de comandos (subprocess seguro)
- [ ] Validación de rutas de archivo (path traversal)
- [ ] Content-Security-Policy si aplicación web
- [ ] Sanitización de entrada HTML

**Referencia**: `rules/03-coding-standards.md` sección "Mejores Prácticas de Seguridad"

### Paso 9: Calcular Puntuación

Atribución de puntos (sobre 25):
- Bandit (vulnerabilidades): 6 puntos
- Secretos y credenciales: 5 puntos
- Validación de entrada: 4 puntos
- Dependencias seguras: 4 puntos
- Manejo de errores: 3 puntos
- Auth/Authz: 2 puntos
- Inyección/XSS: 1 punto

## FORMATO DE SALIDA

```
AUDITORÍA DE SEGURIDAD PYTHON
================================

PUNTUACIÓN GENERAL: XX/25

FORTALEZAS:
- [Lista de buenas prácticas de seguridad observadas]

MEJORAS:
- [Lista de mejoras menores de seguridad]

PROBLEMAS CRÍTICOS:
- [Lista de vulnerabilidades críticas a corregir INMEDIATAMENTE]

DETALLES POR CATEGORÍA:

1. ESCANEO BANDIT (XX/6)
   Estado: [Análisis de vulnerabilidades]
   Problemas Críticos: XX
   Problemas Medios: XX
   Problemas Bajos: XX

2. SECRETOS EXPUESTOS (XX/5)
   Estado: [Detección de secretos]
   Secretos Codificados: XX
   Archivos .env Seguros: ✅/❌

3. VALIDACIÓN DE ENTRADA (XX/4)
   Estado: [Validación y sanitización]
   Entradas Sin Validar: XX
   Uso de Pydantic: ✅/❌

4. DEPENDENCIAS (XX/4)
   Estado: [Vulnerabilidades de dependencias]
   CVEs Críticos: XX
   CVEs Medios: XX
   Dependencias Obsoletas: XX

5. MANEJO DE ERRORES (XX/3)
   Estado: [Seguridad de errores y logs]
   Stack Traces Expuestos: XX
   Datos Sensibles en Logs: XX

6. AUTENTICACIÓN (XX/2)
   Estado: [Auth/Authz]
   Hash Seguro: ✅/❌
   JWT con Expiración: ✅/❌

7. INYECCIONES (XX/1)
   Estado: [Protección contra inyecciones]
   Riesgos de Inyección SQL: XX
   Riesgos de Inyección de Comandos: XX

VULNERABILIDADES CRÍTICAS:
[Lista detallada de vulnerabilidades a corregir inmediatamente con archivo:línea]

TOP 3 ACCIONES PRIORITARIAS:
1. [Acción de seguridad más crítica - URGENTE]
2. [Segunda acción prioritaria - IMPORTANTE]
3. [Tercera acción prioritaria - RECOMENDADO]
```

## NOTAS

- Los problemas de seguridad DEBEN tratarse con prioridad absoluta
- Usar Docker para ejecutar herramientas de seguridad
- Proporcionar archivo y línea exactos para cada vulnerabilidad
- Proponer correcciones concretas para cada problema
- Documentar riesgos e impacto potencial
- Probar correcciones sugeridas
- NUNCA commitear secretos en el código
