---
description: Audit Ansible security posture
argument-hint: [scope]
---

# Auditoria de Seguridad Ansible

Eres un especialista en seguridad Ansible. Debes realizar una auditoria de seguridad exhaustiva del proyecto Ansible.

## Arguments
$ARGUMENTS

Argumentos:
- (Opcional) Alcance: vault, ssh, become, secrets, lint, full (por defecto: full)

Ejemplo: `/ansible:security-audit scope:full`

## Plan Mode

> **El modo plan es condicional.** Se activa automaticamente cuando el alcance es "full" para presentar el plan de auditoria antes de proceder.

## MISSION

### Paso 1: Definicion del Alcance

```
══════════════════════════════════════════════════════════════
AUDITORIA DE SEGURIDAD ANSIBLE
══════════════════════════════════════════════════════════════

Alcance: {vault, ssh, become, secrets, lint, full}

──────────────────────────────────────────────────────────────
ALCANCE DE LA AUDITORIA
──────────────────────────────────────────────────────────────

| Categoria | Incluida | Peso |
|-----------|----------|------|
| Vault | {si/no} | 25% |
| SSH | {si/no} | 20% |
| Escalada de Privilegios | {si/no} | 20% |
| Gestion de Secrets | {si/no} | 20% |
| Lint de Seguridad | {si/no} | 15% |
```

### Paso 2: Auditoria de Vault

```
──────────────────────────────────────────────────────────────
ANALISIS DE VAULT
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|--------------|--------|---------|
| Archivos Vault cifrados | {si/no/parcial} | {archivos encontrados} |
| Estrategia de Vault ID | {unico/multiple/ninguno} | {vault-ids} |
| Gestion de contrasenas | {archivo/env/prompt} | {metodo} |
| Archivo de contrasena en .gitignore | {si/no} | {ruta} |
| Secrets en texto plano en vars | {cantidad} | {archivos} |
| Programacion de rekey de ansible-vault | {si/no} | {frecuencia} |
```

Escanear secrets no cifrados, verificar el cifrado de vault en archivos esperados y verificar la configuracion de vault en ansible.cfg.

### Paso 3: Auditoria SSH

```
──────────────────────────────────────────────────────────────
SEGURIDAD SSH
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|--------------|--------|---------|
| Tipo de clave SSH | {ed25519/rsa/dsa} | {recomendacion} |
| Verificacion de claves de host | {habilitada/deshabilitada} | {configuracion ansible.cfg} |
| ControlMaster | {habilitado/deshabilitado} | {configuracion de multiplexacion} |
| Pipelining | {habilitado/deshabilitado} | {configuracion ansible.cfg} |
| SSH agent forwarding | {habilitado/deshabilitado} | {evaluacion de riesgo} |
| ansible_ssh_common_args | {establecido/no establecido} | {valor} |
```

### Paso 4: Auditoria de Escalada de Privilegios

```
──────────────────────────────────────────────────────────────
ESCALADA DE PRIVILEGIOS
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|--------------|--------|---------|
| Patron de uso de become | {play/tarea/ambos} | {alcance} |
| become_method | {sudo/su/otro} | {metodo} |
| Alcance de become_user | {root/especifico} | {usuarios} |
| NOPASSWD en sudoers | {si/no} | {nivel de riesgo} |
| become a nivel de tarea | {cantidad} | {tareas con become: true} |
| Minimo privilegio | {si/no} | {tareas con exceso de privilegios} |
```

Escanear become a nivel de play (alcance amplio) e identificar tareas que podrian ejecutarse sin root.

### Paso 5: Auditoria de Gestion de Secrets

```
──────────────────────────────────────────────────────────────
GESTION DE SECRETS
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|--------------|--------|---------|
| Integracion de secrets externos | {si/no} | {herramienta: HashiCorp Vault, AWS SM} |
| Uso de no_log | {adecuado/faltante} | {tareas que exponen secrets} |
| Nomenclatura de variables sensibles | {consistente/inconsistente} | {convencion} |
| Cobertura de .gitignore | {completa/parcial} | {patrones faltantes} |
| Almacenamiento de secrets en CI | {seguro/expuesto} | {metodo} |
| Rotacion de secrets | {automatizada/manual/ninguna} | {politica} |
```

Encontrar tareas que puedan filtrar secrets sin `no_log` y verificar secrets hardcodeados fuera de archivos vault.

### Paso 6: Auditoria de Lint de Seguridad

```
──────────────────────────────────────────────────────────────
LINT DE SEGURIDAD
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|--------------|--------|---------|
| Perfil safety de ansible-lint | {habilitado/deshabilitado} | {nivel de perfil} |
| Uso de FQCN | {completo/parcial} | {% cumplimiento} |
| Uso excesivo de shell/command | {cantidad} | {tareas usando shell} |
| changed_when en command | {establecido/faltante} | {tareas sin el} |
| Fijacion de paquetes | {si/no} | {paquetes sin fijar} |
| Permisos de archivos | {explicitos/por defecto} | {tareas sin mode} |
```

Ejecutar `ansible-lint -p safety` y verificar tareas shell/command sin `changed_when`.

### Paso 7: Informe Final

```
══════════════════════════════════════════════════════════════
INFORME DE AUDITORIA DE SEGURIDAD
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
PUNTUACION
──────────────────────────────────────────────────────────────

| Categoria | Puntuacion | Estado |
|-----------|-----------|--------|
| Vault | {x}/100 | {aprobado/advertencia/fallo} |
| SSH | {x}/100 | {aprobado/advertencia/fallo} |
| Escalada de Privilegios | {x}/100 | {aprobado/advertencia/fallo} |
| Gestion de Secrets | {x}/100 | {aprobado/advertencia/fallo} |
| Lint de Seguridad | {x}/100 | {aprobado/advertencia/fallo} |
| **General** | **{x}/100** | **{estado}** |

──────────────────────────────────────────────────────────────
HALLAZGOS CRITICOS
──────────────────────────────────────────────────────────────

1. [ ] {hallazgo critico 1}
2. [ ] {hallazgo critico 2}

──────────────────────────────────────────────────────────────
RECOMENDACIONES
──────────────────────────────────────────────────────────────

Prioridad 1 (Inmediata):
- [ ] {recomendacion}

Prioridad 2 (Este sprint):
- [ ] {recomendacion}

Prioridad 3 (Proximo trimestre):
- [ ] {recomendacion}
```
