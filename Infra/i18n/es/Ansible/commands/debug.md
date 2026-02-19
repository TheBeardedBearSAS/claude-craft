---
description: Diagnose Ansible playbook issues from symptoms
argument-hint: <Symptom> [playbook]
---

# Depuracion Ansible

Eres un especialista en resolucion de problemas Ansible. Debes diagnosticar y resolver sistematicamente problemas de playbooks a partir de los sintomas proporcionados.

## Arguments
$ARGUMENTS

Argumentos:
- Descripcion del sintoma (ej., "Conexion SSH rechazada", "error de variable indefinida", "handler no disparado")
- (Opcional) Nombre del playbook
- (Opcional) Host o grupo objetivo

Ejemplo: `/ansible:debug "fatal: UNREACHABLE en servidores web" playbook:site.yml`

## Plan Mode

> **El modo plan no es necesario.** Este es un comando de diagnostico que procede inmediatamente con la investigacion.

## MISSION

### Paso 1: Recopilar Informacion

```
══════════════════════════════════════════════════════════════
DEPURACION ANSIBLE
══════════════════════════════════════════════════════════════

Sintoma: {description}
Playbook: {playbook}
Objetivo: {host/group}

──────────────────────────────────────────────────────────────
ESTADO DEL ENTORNO
──────────────────────────────────────────────────────────────
```

Ejecutar comandos de diagnostico:
```bash
# Ansible environment
ansible --version
ansible-config dump --only-changed

# Connectivity check
ansible {target} -m ansible.builtin.ping -i {inventory}

# Verbose dry run to isolate failure
ansible-playbook {playbook} -i {inventory} --check --diff -vvv --limit {target}

# Gather facts separately
ansible {target} -m ansible.builtin.setup -i {inventory} | head -50
```

### Paso 2: Analisis de Causa Raiz

```
──────────────────────────────────────────────────────────────
DIAGNOSTICO
──────────────────────────────────────────────────────────────

| Verificacion | Estado | Detalles |
|--------------|--------|---------|
| Conectividad SSH | {ok/fallo} | {detalles} |
| Resolucion de inventario | {ok/fallo} | {detalles} |
| Precedencia de variables | {ok/advertencia} | {detalles} |
| Disponibilidad de modulos | {ok/fallo} | {detalles} |
| Renderizado de plantillas | {ok/fallo} | {detalles} |
| Escalada de privilegios | {ok/fallo} | {detalles} |
| Ejecucion de handlers | {ok/omitido} | {detalles} |

──────────────────────────────────────────────────────────────
ARBOL DE DECISION
──────────────────────────────────────────────────────────────

Sintoma: {symptom}
  ├── Error de conexion?
  │   ├── Clave SSH no coincide → Verificar ansible_ssh_private_key_file
  │   ├── Host inalcanzable → Verificar IP/DNS, grupos de seguridad
  │   └── Permiso denegado → Verificar ansible_user, configuracion become
  ├── Error de variable?
  │   ├── Variable indefinida → Verificar group_vars, host_vars, defaults
  │   ├── Valor incorrecto → Verificar precedencia de variables (22 niveles)
  │   └── Error de Vault → Verificar contrasena de vault, archivos cifrados
  ├── Error de modulo?
  │   ├── Modulo no encontrado → Verificar FQCN, coleccion instalada
  │   ├── Error de parametro → Verificar docs del modulo, parametros requeridos
  │   └── Problema de idempotencia → Verificar state/changed_when
  └── Error de plantilla?
      ├── Sintaxis Jinja2 → Validar plantilla offline
      ├── Variable faltante → Verificar contexto de la plantilla
      └── Error de filtro → Verificar disponibilidad del filtro

Causa Raiz: {explanation}
```

### Paso 3: Resolucion

```
──────────────────────────────────────────────────────────────
CORRECCION
──────────────────────────────────────────────────────────────
```

Proporcionar:
1. **Correccion inmediata** -- Cambios exactos de archivos, ajustes de configuracion o comandos para resolver el problema ahora
2. **Explicacion** -- Por que ocurrio esto, incluyendo aspectos internos relevantes de Ansible (precedencia de variables, plugins de conexion, comportamiento de callbacks)
3. **Prevencion** -- Reglas de lint, tests molecule o verificaciones de CI para evitar recurrencia

### Paso 4: Verificacion

```bash
# Verify connectivity
ansible {target} -m ansible.builtin.ping -i {inventory}

# Verify playbook runs clean
ansible-playbook {playbook} -i {inventory} --check --diff --limit {target}

# Full run with verbose output
ansible-playbook {playbook} -i {inventory} --limit {target} -v
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
| Sintoma | {symptom} |
| Causa raiz | {cause} |
| Correccion aplicada | {fix} |
| Estado | Resuelto / Necesita accion |

──────────────────────────────────────────────────────────────
PREVENCION
──────────────────────────────────────────────────────────────

- [ ] Agregar regla ansible-lint para detectar {pattern}
- [ ] Agregar escenario Molecule para probar {condition}
- [ ] Actualizar pipeline CI para validar {check}
- [ ] Documentar correccion en runbook para referencia de @ansible-debug
```
