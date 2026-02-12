---
description: Diagnose Coolify deployment issues
argument-hint: [arguments]
---

# Diagnostico Coolify

Eres un experto en depuracion Coolify. Debes diagnosticar y resolver problemas de despliegue y runtime en Coolify PaaS autoalojado.

## Argumentos
$ARGUMENTS

Argumentos:
- Sintoma o mensaje de error
- (Opcional) Nombre del servicio
- (Opcional) Contexto: build, runtime, networking, ssl

Ejemplo: `/coolify:debug "502 Bad Gateway en app.example.com"` o `/coolify:debug "Build falla con OOM" service:api`

## MISION

### Paso 1: Recopilar Sintomas

```
══════════════════════════════════════════════════════════════
DIAGNOSTICO COOLIFY
══════════════════════════════════════════════════════════════

Servicio: {nombre}
Tipo: {Application / Database / Docker Compose}
Build Pack: {Nixpacks / Dockerfile / Compose}

──────────────────────────────────────────────────────────────
SINTOMA REPORTADO
──────────────────────────────────────────────────────────────

{descripcion del problema}

### Clasificacion del Sintoma
| Categoria | Probabilidad |
|-----------|-------------|
| Fallo de build | {Alta/Media/Baja} |
| Error de runtime | {Alta/Media/Baja} |
| Red | {Alta/Media/Baja} |
| SSL/TLS | {Alta/Media/Baja} |
| Webhook/Git | {Alta/Media/Baja} |
| Almacenamiento | {Alta/Media/Baja} |
```

### Paso 2: Verificar Estado del Despliegue y Logs

```bash
# Verificar servicios Coolify
docker ps --filter "name=coolify" --format "table {{.Names}}\t{{.Status}}"

# Verificar contenedores de aplicacion
docker ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Logs de la aplicacion (desde dashboard Coolify o CLI)
docker logs <container-name> --tail 200 2>&1

# Logs del proxy Traefik
docker logs coolify-proxy --tail 100 2>&1 | grep -i "error\|warn"

# Recursos del sistema
free -h
df -h /var/lib/docker
```

```
──────────────────────────────────────────────────────────────
ESTADO DEL DESPLIEGUE
──────────────────────────────────────────────────────────────

| Verificacion | Resultado | Detalles |
|--------------|----------|---------|
| Estado del contenedor | {running/exited/restarting} | {uptime o codigo de salida} |
| Health check | {healthy/unhealthy/none} | {resultado del ultimo check} |
| Ruta Traefik | {activa/ausente} | {estado de enrutamiento del dominio} |
| Ultimo despliegue | {exitoso/fallido} | {timestamp} |
| Recursos | {OK/advertencia} | CPU: {%}, RAM: {usado/total} |
| Disco | {OK/advertencia} | {usado/total} ({porcentaje}) |
```

### Paso 3: Verificar Estado del Contenedor

```bash
# Inspeccion detallada del contenedor
docker inspect <container-name> --format='
  State: {{.State.Status}}
  Exit Code: {{.State.ExitCode}}
  OOM Killed: {{.State.OOMKilled}}
  Started: {{.State.StartedAt}}
  Finished: {{.State.FinishedAt}}
  Restarts: {{.RestartCount}}
'

# Procesos del contenedor
docker exec <container-name> ps aux 2>/dev/null || echo "No se puede exec (contenedor no ejecutandose)"

# Uso de recursos del contenedor
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
```

### Paso 4: Verificar Red

```bash
# Resolucion DNS
dig +short {dominio}
nslookup {dominio} 8.8.8.8

# Accesibilidad de puertos (desde externo)
curl -s -o /dev/null -w "%{http_code}" https://{dominio}
curl -s -o /dev/null -w "%{http_code}" http://{dominio}

# Enrutamiento Traefik
docker logs coolify-proxy 2>&1 | grep "{dominio}"

# Conectividad interna (desde el contenedor)
docker exec <container-name> wget -q -O- http://localhost:{puerto}/health 2>/dev/null

# Verificar firewall
sudo ufw status verbose
```

### Paso 5: Verificar SSL y Let's Encrypt

```bash
# Detalles del certificado
openssl s_client -connect {dominio}:443 -servername {dominio} 2>/dev/null | \
  openssl x509 -noout -dates -subject -issuer

# Logs de Let's Encrypt
docker logs coolify-proxy 2>&1 | grep -i "acme\|certificate\|letsencrypt"

# Almacenamiento ACME
docker exec coolify-proxy cat /data/acme.json 2>/dev/null | jq '.[] | keys'

# Verificacion DNS challenge (si wildcard)
dig TXT _acme-challenge.{dominio}
```

### Paso 6: Verificar Webhooks e Integracion Git

```
──────────────────────────────────────────────────────────────
ESTADO DE GIT Y WEBHOOKS
──────────────────────────────────────────────────────────────

### GitHub App
- Verificar: GitHub > Settings > Applications > Coolify
- Entregas recientes: Settings > Developer settings > GitHub Apps > Advanced
- Verificar: repositorio tiene Coolify app instalada

### Entrega del Webhook
| Verificacion | Estado |
|-------------|--------|
| URL del webhook accesible | {si/no} |
| Estado de entrega reciente | {exitoso/fallido} |
| Codigo de respuesta | {200/404/500} |
| Coincidencia de rama | {si/no} |
| Auto-deploy habilitado | {si/no} |

### Prueba de Activacion Manual
curl -X POST https://coolify.example.com/api/v1/deploy \
  -H "Authorization: Bearer {token}" \
  -d '{"uuid": "{service-uuid}"}'
```

### Paso 7: Proponer Solucion

```
──────────────────────────────────────────────────────────────
DIAGNOSTICO
──────────────────────────────────────────────────────────────

### Causa Raiz
{descripcion de la causa raiz}

### Evidencia
- {evidencia 1}
- {evidencia 2}

──────────────────────────────────────────────────────────────
SOLUCION
──────────────────────────────────────────────────────────────

### Hipotesis 1: {Mas Probable}
**Causa**: {descripcion}
**Solucion**:
\`\`\`bash
{comandos de resolucion}
\`\`\`

### Hipotesis 2: {Alternativa}
**Causa**: {descripcion}
**Solucion**:
\`\`\`bash
{comandos de resolucion}
\`\`\`

──────────────────────────────────────────────────────────────
PREVENCION
──────────────────────────────────────────────────────────────

Para evitar este problema en el futuro:
- [ ] {Recomendacion 1}
- [ ] {Recomendacion 2}
- [ ] {Recomendacion 3}

──────────────────────────────────────────────────────────────
COMANDOS UTILES
──────────────────────────────────────────────────────────────

# Redesplegar servicio
# Dashboard > Service > Deploy (o Rebuild without cache)

# Reiniciar proxy Traefik
docker restart coolify-proxy

# Limpiar recursos Docker
docker system prune -af

# Verificar salud de todos los contenedores
docker ps --format "{{.Names}}: {{.Status}}" | sort
```

## Lista de Verificacion de Diagnostico

### Informacion Basica
- [ ] Mensaje de error exacto o sintoma anotado
- [ ] Momento de inicio del problema identificado
- [ ] Cambios recientes revisados (despliegue, config, DNS)
- [ ] Reproducibilidad confirmada

### Entorno
- [ ] Version de Coolify verificada
- [ ] Recursos del servidor verificados (RAM, disco, CPU)
- [ ] Estado de Docker verificado
- [ ] Conectividad de red probada

### Verificaciones Realizadas
- [ ] Logs de despliegue analizados
- [ ] Estado del contenedor verificado
- [ ] Enrutamiento Traefik verificado
- [ ] Resolucion DNS confirmada
- [ ] Certificado SSL validado
- [ ] Entrega de webhooks verificada
