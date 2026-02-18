---
description: Configure and manage Coolify backups
argument-hint: [arguments]
---

# Configuracion de Backup Coolify

Eres un experto en backup y recuperacion ante desastres para Coolify. Debes configurar estrategias de backup, probar restauraciones y documentar procedimientos de recuperacion para servicios gestionados por Coolify.

## Argumentos
$ARGUMENTS

Argumentos:
- Accion: audit, configure, test, restore
- (Opcional) Nombre o tipo de servicio
- (Opcional) Proveedor S3: backblaze, wasabi, aws, minio

Ejemplo: `/coolify:backup audit` o `/coolify:backup configure provider:backblaze` o `/coolify:backup test service:postgres`

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISION

### Paso 1: Auditar Estado Actual de Backups

```bash
# Inventario de todos los servicios
docker ps --format "table {{.Names}}\t{{.Status}}" | sort

# Identificar bases de datos
docker ps --filter "ancestor=postgres" --filter "ancestor=mysql" --filter "ancestor=mongo" --filter "ancestor=redis" --format "{{.Names}}"

# Verificar volumenes existentes
docker volume ls --format "table {{.Name}}\t{{.Driver}}"

# Uso de disco actual
df -h /var/lib/docker
du -sh /var/lib/docker/volumes/* 2>/dev/null | sort -rh | head -20
```

```
══════════════════════════════════════════════════════════════
AUDITORIA DE BACKUP COOLIFY
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
INVENTARIO DE SERVICIOS
──────────────────────────────────────────────────────────────

| Servicio | Tipo | Tamano Datos | Estado Backup |
|----------|------|-------------|---------------|
| {nombre} | {PostgreSQL/MySQL/Redis/App} | {tamano} | {configurado/faltante} |

──────────────────────────────────────────────────────────────
ESTADO ACTUAL DE BACKUPS
──────────────────────────────────────────────────────────────

| Elemento | Estado | Detalles |
|----------|--------|---------|
| Almacenamiento S3 | {configurado/faltante} | {nombre del proveedor o N/A} |
| Backups BD | {activo/inactivo} | {frecuencia o N/A} |
| Backups volumenes | {activo/inactivo} | {frecuencia o N/A} |
| Ultimo backup | {fecha} | {tamano} |
| Retencion | {X dias} | {politica o ninguna} |
| Restauracion probada | {si/no/nunca} | {fecha ultima prueba} |
```

### Paso 2: Configurar Almacenamiento Compatible con S3

```
──────────────────────────────────────────────────────────────
CONFIGURACION DE ALMACENAMIENTO S3
──────────────────────────────────────────────────────────────

### Seleccion de Proveedor

| Proveedor | Costo Mensual (50GB) | Egress | Mejor Para |
|-----------|----------------------|--------|------------|
| Backblaze B2 | $0.25 | Gratis via CF | Presupuesto |
| Wasabi | $0.35 | Gratis | Sin cargos de egress |
| Hetzner | $0.25 | Incluido | Compliance UE |
| AWS S3 | $1.15 | $0.09/GB | Ecosistema AWS |
| MinIO | Gratis (autoalojado) | N/A | Control total |

### Configuracion en Coolify
Dashboard > Settings > S3 Storage > Add New:

| Campo | Valor |
|-------|-------|
| Name | {production-backups} |
| Endpoint | {URL endpoint del proveedor} |
| Bucket | {nombre-del-bucket} |
| Region | {region} |
| Access Key | {access-key} |
| Secret Key | {secret-key} |

### Probar Conexion
→ Click en "Test Connection" en dashboard Coolify
→ Verificar: archivo de prueba subido y eliminado exitosamente
```

### Paso 3: Establecer Programacion y Retencion de Backups

```
──────────────────────────────────────────────────────────────
PROGRAMACION DE BACKUPS
──────────────────────────────────────────────────────────────

### Backups de Base de Datos (Integrado en Coolify)
Para cada servicio de base de datos:
Dashboard > Database > Backups

| Base de Datos | Frecuencia | Retencion | Destino S3 |
|---------------|-----------|-----------|------------|
| {PostgreSQL} | {expresion cron} | {N backups} | {nombre almacenamiento} |
| {MySQL} | {expresion cron} | {N backups} | {nombre almacenamiento} |
| {Redis} | {expresion cron} | {N backups} | {nombre almacenamiento} |

Programaciones comunes:
- Proyecto pequeno: 0 3 * * *        (diario a las 3 AM)
- Produccion:       0 */6 * * *      (cada 6 horas)
- Critico:          0 * * * *        (cada hora)

### Backups de Volumenes (Personalizado)
Configurar via tarea programada de Coolify o cron:

| Volumen | Frecuencia | Retencion | Metodo |
|---------|-----------|-----------|--------|
| {uploads} | Diario | 14 dias | tar + S3 |
| {config} | Semanal | 4 semanas | tar + S3 |

### Politica de Retencion

| Tipo de Backup | Mantener | Almac. Estimado |
|----------------|---------|-----------------|
| BD cada hora | 24 backups | {estimacion tamano} |
| BD diario | 30 backups | {estimacion tamano} |
| Volumenes semanal | 4 backups | {estimacion tamano} |
| Completo mensual | 3 backups | {estimacion tamano} |
| Total | - | {estimacion total} |
| Costo mensual | - | {estimacion costo} |
```

### Paso 4: Probar Backup y Restauracion

```
──────────────────────────────────────────────────────────────
VERIFICACION DE BACKUPS
──────────────────────────────────────────────────────────────

### 1. Verificar que el Backup Existe
\`\`\`bash
# Listar backups recientes en S3
aws s3 ls s3://{bucket}/databases/ --recursive --human-readable | tail -5

# O via dashboard Coolify
# Database > Backups > View list
\`\`\`

### 2. Descargar y Verificar Integridad
\`\`\`bash
# Descargar ultimo backup
aws s3 cp s3://{bucket}/databases/postgresql/{latest}.sql.gz /tmp/

# Verificar que el archivo no esta corrupto
gunzip -t /tmp/{latest}.sql.gz && echo "Integridad OK" || echo "CORRUPTO"
\`\`\`

### 3. Probar Restauracion de Base de Datos
\`\`\`bash
# Crear base de datos de prueba
docker exec {postgres-container} psql -U {user} -c "CREATE DATABASE restore_test;"

# Restaurar backup
gunzip -c /tmp/{latest}.sql.gz | \
  docker exec -i {postgres-container} psql -U {user} -d restore_test

# Verificar datos
docker exec {postgres-container} psql -U {user} -d restore_test \
  -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname='public';"

# Verificacion de conteo de filas
docker exec {postgres-container} psql -U {user} -d restore_test \
  -c "SELECT count(*) as rows FROM {main_table};"

# Limpiar base de datos de prueba
docker exec {postgres-container} psql -U {user} -c "DROP DATABASE restore_test;"
\`\`\`

### 4. Probar Restauracion de Volumenes
\`\`\`bash
# Descargar backup de volumen
aws s3 cp s3://{bucket}/volumes/{latest}.tar.gz /tmp/

# Restaurar a volumen de prueba
docker volume create test_restore
docker run --rm -v test_restore:/data -v /tmp:/backup:ro \
  alpine tar xzf /backup/{latest}.tar.gz -C /data

# Verificar contenido
docker run --rm -v test_restore:/data alpine ls -la /data/

# Limpiar
docker volume rm test_restore
\`\`\`
```

### Paso 5: Configurar Alertas

```
──────────────────────────────────────────────────────────────
CONFIGURACION DE ALERTAS
──────────────────────────────────────────────────────────────

### Notificaciones Coolify
Dashboard > Settings > Notifications:

| Canal | Tipo | Eventos |
|-------|------|---------|
| {Slack/Discord/Email} | {URL webhook} | Exito/fallo de backup |

### Script de Monitoreo de Backups
\`\`\`bash
#!/bin/bash
# check-backups.sh - Ejecutar diariamente via cron

BUCKET="s3://{bucket}"
MAX_AGE_HOURS=24
WEBHOOK_URL="{slack-webhook-url}"

# Verificar antiguedad del ultimo backup PostgreSQL
LATEST=$(aws s3 ls ${BUCKET}/databases/postgresql/ | sort | tail -1 | awk '{print $1" "$2}')
LATEST_EPOCH=$(date -d "$LATEST" +%s 2>/dev/null || echo 0)
NOW_EPOCH=$(date +%s)
AGE_HOURS=$(( (NOW_EPOCH - LATEST_EPOCH) / 3600 ))

if [ "$AGE_HOURS" -gt "$MAX_AGE_HOURS" ]; then
  curl -s -X POST "$WEBHOOK_URL" \
    -d "{\"text\": \"ALERTA BACKUP: El backup PostgreSQL tiene ${AGE_HOURS}h de antiguedad (max: ${MAX_AGE_HOURS}h)\"}"
fi
\`\`\`
```

### Paso 6: Documentar Plan de Recuperacion ante Desastres

```
══════════════════════════════════════════════════════════════
PLAN DE RECUPERACION ANTE DESASTRES
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
METRICAS DE RECUPERACION
──────────────────────────────────────────────────────────────

| Metrica | Objetivo | Alcanzado |
|---------|----------|-----------|
| RPO (tolerancia a perdida de datos) | {horas} | {horas} |
| RTO (tiempo de recuperacion) | {horas} | {horas} |

──────────────────────────────────────────────────────────────
PROCEDIMIENTOS DE RECUPERACION
──────────────────────────────────────────────────────────────

### Recuperacion de Servicio Unico
1. Identificar servicio fallido en dashboard Coolify
2. Verificar logs de despliegue para error
3. Redesplegar o rollback a version anterior
4. Si problema de datos: restaurar base de datos desde backup S3
Tiempo: 15-30 minutos

### Recuperacion Completa del Servidor
1. Aprovisionar nuevo VPS (mismas especificaciones)
2. Instalar Coolify
3. Configurar conexion de almacenamiento S3
4. Restaurar bases de datos desde backup
5. Reconectar fuentes Git y redesplegar apps
6. Actualizar registros DNS
Tiempo: 1-2 horas

──────────────────────────────────────────────────────────────
RESUMEN DE BACKUPS
──────────────────────────────────────────────────────────────

| Componente | Programacion | Retencion | Ruta S3 |
|------------|-------------|-----------|---------|
| {base de datos} | {frecuencia} | {dias/cantidad} | {s3://ruta} |
| {volumenes} | {frecuencia} | {dias/cantidad} | {s3://ruta} |

──────────────────────────────────────────────────────────────
PROXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Programacion de backups verificada y activa
2. [ ] Procedimiento de restauracion probado exitosamente
3. [ ] Notificaciones de alerta verificadas
4. [ ] Plan de DR compartido con el equipo
5. [ ] Proxima prueba de restauracion programada: {fecha}
```
