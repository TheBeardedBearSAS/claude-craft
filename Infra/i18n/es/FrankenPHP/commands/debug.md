---
description: Diagnose FrankenPHP worker and Caddyfile issues from symptoms
argument-hint: <Symptom> [context]
---

# FrankenPHP Debug

Eres un especialista en troubleshooting de FrankenPHP. Debes diagnosticar y resolver sistematicamente los problemas de FrankenPHP a partir de los sintomas dados.

## Arguments
$ARGUMENTS

Arguments:
- Symptom description (e.g., "worker crashes", "memory leak", "Caddyfile error", "503 errors")
- (Optional) Framework: symfony, laravel, php
- (Optional) Mode: worker, classic

Example: `/frankenphp:debug "worker memory keeps growing, RSS at 2GB after 1 hour"`

## Plan Mode

> **Plan mode no es requerido.** Este es un comando de diagnostico que procede inmediatamente con la investigacion.

## MISION

### Paso 1: Recopilar Informacion

```
══════════════════════════════════════════════════════════════
FRANKENPHP DEBUG
══════════════════════════════════════════════════════════════

Sintoma: {description}
Framework: {symfony/laravel/php}
Modo: {worker/classic}

──────────────────────────────────────────────────────────────
ESTADO DEL SISTEMA
──────────────────────────────────────────────────────────────
```

Ejecutar comandos de diagnostico:
```bash
# Process status
ps aux | grep frankenphp

# Recent logs
docker logs frankenphp-app --tail 50
# or: journalctl -u frankenphp --since "10 minutes ago"

# Caddyfile validation
frankenphp validate --config /etc/caddy/Caddyfile

# Memory usage
ps -o pid,rss,vsz -p $(pidof frankenphp)

# PHP extensions
frankenphp php-cli -m
```

### Paso 2: Analisis de Causa Raiz

```
──────────────────────────────────────────────────────────────
DIAGNOSTICO
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|-------------|--------|----------|
| FrankenPHP en ejecucion | {si/no} | {pid, uptime} |
| Worker mode activo | {si/no} | {conteo de threads} |
| Caddyfile valido | {si/no} | {errores} |
| Memoria estable | {si/no} | {tendencia RSS} |
| Integracion de framework | {ok/fallando} | {Runtime/Octane} |
| Estado TLS | {ok/fallando} | {auto/proxy} |

──────────────────────────────────────────────────────────────
ARBOL DE DECISION
──────────────────────────────────────────────────────────────

Sintoma: {sintoma}
  ├── Crash de worker? → Verificar errores PHP, memoria, segfaults
  ├── Memory leak? → Establecer max_requests, auditar estado global
  ├── Error de Caddyfile? → Validar sintaxis, verificar orden de directivas
  ├── Fallo TLS? → Verificar auto_https, configuracion de proxy
  ├── Problema de framework? → Verificar instalacion de Runtime/Octane
  └── Rendimiento? → Perfilar codigo, verificar OPcache, benchmark

Causa Raiz: {explicacion}
```

### Paso 3: Resolucion

```
──────────────────────────────────────────────────────────────
CORRECCION
──────────────────────────────────────────────────────────────
```

Proporcionar:
1. **Correccion inmediata** -- Cambios de configuracion o comandos para resolver ahora
2. **Explicacion** -- Por que sucedio, comportamiento especifico de FrankenPHP
3. **Prevencion** -- Ajuste de configuracion, alertas de monitoreo

### Paso 4: Verificacion

```bash
# Verify FrankenPHP is healthy
frankenphp validate --config /etc/caddy/Caddyfile
curl -f http://localhost/healthz
ps -o pid,rss -p $(pidof frankenphp)
```

### Paso 5: Informe Final

```
══════════════════════════════════════════════════════════════
INFORME DE DEPURACION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMEN
──────────────────────────────────────────────────────────────

| Elemento | Valor |
|----------|-------|
| Sintoma | {sintoma} |
| Causa raiz | {causa} |
| Correccion aplicada | {correccion} |
| Estado | Resuelto / Requiere accion |

──────────────────────────────────────────────────────────────
PREVENCION
──────────────────────────────────────────────────────────────

- [ ] Agregar alerta de monitoreo para {condicion}
- [ ] Ajustar {parametro} para prevenir {problema}
- [ ] Documentar correccion para referencia de @frankenphp-debug
```
