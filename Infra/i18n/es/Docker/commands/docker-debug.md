---
description: Diagnóstico Docker
argument-hint: [arguments]
---

# Diagnóstico Docker

Eres un experto en depuración Docker. Debes diagnosticar y resolver problemas relacionados con contenedores.

## Argumentos
$ARGUMENTS

Argumentos:
- Síntoma o mensaje de error
- (Opcional) Nombre del contenedor
- (Opcional) Contexto (dev/prod)

Ejemplo: `/docker:debug "El contenedor sale con código 137"` o `/docker:debug app "Connection refused"`

## MISIÓN

### Paso 1: Recopilar Información

```bash
# Estado del contenedor
docker ps -a

# Logs recientes
docker logs <contenedor> --tail 100 2>&1

# Inspección completa
docker inspect <contenedor>

# Recursos
docker stats --no-stream
```

### Paso 2: Identificar el Problema

```
══════════════════════════════════════════════════════════════
🔍 DIAGNÓSTICO DOCKER
══════════════════════════════════════════════════════════════

Contenedor: {nombre}
Imagen: {imagen}
Estado: {running|exited|restarting}
Tiempo activo: {duración}

──────────────────────────────────────────────────────────────
🚨 SÍNTOMA REPORTADO
──────────────────────────────────────────────────────────────

{descripción del problema}

──────────────────────────────────────────────────────────────
📋 ANÁLISIS
──────────────────────────────────────────────────────────────
```

### Paso 3: Árboles de Decisión

#### El Contenedor No Inicia

| Código de Salida | Significado | Acciones |
|------------------|-------------|----------|
| 0 | Terminó normalmente | Verificar CMD/ENTRYPOINT |
| 1 | Error de aplicación | Analizar logs |
| 126 | Permiso denegado | Verificar permisos |
| 127 | Comando no encontrado | Verificar PATH y binario |
| 137 | SIGKILL (OOM o stop) | Verificar memoria |
| 139 | SIGSEGV | Depurar código |

```bash
# Verificar código de salida
docker inspect --format='{{.State.ExitCode}}' <contenedor>

# Verificar OOM
docker inspect --format='{{.State.OOMKilled}}' <contenedor>

# Logs detallados
docker logs <contenedor> 2>&1
```

#### Problemas de Red

```bash
# Resolución DNS
docker exec <contenedor> nslookup <servicio>
docker exec <contenedor> cat /etc/resolv.conf

# Conectividad
docker exec <contenedor> ping -c 3 <host>
docker exec <contenedor> nc -zv <host> <puerto>

# Configuración de red
docker network inspect <red>
docker inspect --format='{{json .NetworkSettings.Networks}}' <contenedor>
```

#### Problemas de Recursos

```bash
# Monitoreo en tiempo real
docker stats <contenedor>

# Procesos en el contenedor
docker exec <contenedor> ps aux
docker exec <contenedor> top -bn1

# Memoria detallada
docker exec <contenedor> free -m
docker exec <contenedor> cat /proc/meminfo
```

#### Problemas de Volúmenes

```bash
# Cambios en el sistema de archivos
docker diff <contenedor>

# Espacio en disco
docker exec <contenedor> df -h

# Permisos
docker exec <contenedor> ls -la /ruta/datos

# Inspeccionar volumen
docker volume inspect <volumen>
```

### Paso 4: Soluciones Comunes

```
──────────────────────────────────────────────────────────────
💡 HIPÓTESIS Y SOLUCIONES
──────────────────────────────────────────────────────────────

### Hipótesis 1: [Más Probable]
**Causa**: {descripción}
**Verificación**:
\`\`\`bash
{comando de diagnóstico}
\`\`\`
**Solución**:
\`\`\`bash
{comando de resolución}
\`\`\`

### Hipótesis 2: [Alternativa]
**Causa**: {descripción}
**Verificación**:
\`\`\`bash
{comando}
\`\`\`
**Solución**:
\`\`\`bash
{comando}
\`\`\`
```

### Paso 5: Reporte Final

```
══════════════════════════════════════════════════════════════
📊 REPORTE DE DIAGNÓSTICO
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🎯 CAUSA IDENTIFICADA
──────────────────────────────────────────────────────────────

{Descripción de la causa raíz}

──────────────────────────────────────────────────────────────
✅ SOLUCIÓN APLICADA
──────────────────────────────────────────────────────────────

{Pasos de resolución}

──────────────────────────────────────────────────────────────
🛡️ PREVENCIÓN
──────────────────────────────────────────────────────────────

Para evitar este problema en el futuro:
- [ ] {Recomendación 1}
- [ ] {Recomendación 2}
- [ ] {Recomendación 3}

──────────────────────────────────────────────────────────────
🔧 COMANDOS ÚTILES
──────────────────────────────────────────────────────────────

# Recrear contenedor
docker compose up -d --force-recreate <servicio>

# Rebuild completo
docker compose build --no-cache <servicio>

# Limpiar recursos
docker system prune -af

# Verificar estado
docker compose ps
docker compose logs -f <servicio>
```

## Lista de Verificación de Diagnóstico

### Información Básica
- [ ] Mensaje de error exacto anotado
- [ ] Fecha y hora del problema
- [ ] Cambios recientes identificados
- [ ] Reproducibilidad verificada

### Entorno
- [ ] Versión de Docker (`docker version`)
- [ ] Sistema operativo del host verificado
- [ ] Recursos disponibles
- [ ] Modo (Compose/Swarm)

### Verificaciones Realizadas
- [ ] Logs analizados
- [ ] Estado del contenedor verificado
- [ ] Recursos verificados
- [ ] Red probada (si aplica)
- [ ] Volúmenes verificados (si aplica)
