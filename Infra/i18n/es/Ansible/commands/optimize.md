---
description: Optimize Ansible performance and playbook quality
argument-hint: [target]
---

# Optimizacion Ansible

Eres un especialista en optimizacion Ansible. Debes analizar el rendimiento de los playbooks y proporcionar recomendaciones accionables para mejoras de velocidad, calidad y mantenibilidad.

## Arguments
$ARGUMENTS

Argumentos:
- (Opcional) Objetivo: performance, quality, both (por defecto: both)

Ejemplo: `/ansible:optimize target:performance`

## Plan Mode

> **Se recomienda el modo plan.** Claude analiza la estructura actual de los playbooks y los patrones de ejecucion antes de proponer optimizaciones.

## MISSION

### Paso 1: Analisis de Rendimiento

```
══════════════════════════════════════════════════════════════
OPTIMIZACION ANSIBLE
══════════════════════════════════════════════════════════════

Objetivo: {performance/quality/both}

──────────────────────────────────────────────────────────────
PERFIL DE RENDIMIENTO ACTUAL
──────────────────────────────────────────────────────────────

| Configuracion | Actual | Recomendado | Impacto |
|---------------|--------|-------------|---------|
| forks | {valor} | 20-50 | Paralelismo |
| pipelining | {habilitado/deshabilitado} | habilitado | Ida y vuelta SSH |
| fact_caching | {none/jsonfile/redis} | jsonfile/redis | Recoleccion de facts |
| gather_facts | {yes/no/smart} | smart | Tiempo de inicio |
| strategy | {linear/free/host_pinned} | free (donde sea seguro) | Orden de ejecucion |
| SSH multiplexing | {habilitado/deshabilitado} | habilitado | Reutilizacion de conexion |
```

Perfilar con `ANSIBLE_CALLBACKS_ENABLED=timer,profile_tasks` y medir la sobrecarga de conexion con `ansible.builtin.ping`.

### Paso 2: Optimizacion de Conexion

```
──────────────────────────────────────────────────────────────
AJUSTE DE CONEXION
──────────────────────────────────────────────────────────────
```

Generar configuracion optimizada de conexion en `ansible.cfg`:

```ini
[defaults]
forks = 25
gathering = smart
fact_caching = jsonfile
fact_caching_connection = /tmp/ansible_facts_cache
fact_caching_timeout = 86400
callbacks_enabled = timer, profile_tasks

[ssh_connection]
pipelining = True
ssh_args = -o ControlMaster=auto -o ControlPersist=60s
control_path_dir = ~/.ansible/cp
```

| Optimizacion | Antes | Despues | Mejora |
|-------------|--------|---------|--------|
| Pipelining | deshabilitado | habilitado | ~2x mas rapido por tarea |
| ControlMaster | deshabilitado | auto | Reutilizar conexiones SSH |
| Cache de facts | ninguno | jsonfile | Omitir gather_facts |
| Forks | 5 | 25 | 5x paralelismo |

### Paso 3: Optimizacion de Playbooks

```
──────────────────────────────────────────────────────────────
AJUSTE DE PLAYBOOKS
──────────────────────────────────────────────────────────────

| Patron | Actual | Recomendacion | Impacto |
|--------|--------|---------------|---------|
| gather_facts | siempre | smart / por-play | Reducir inicio |
| import vs include | {mixto} | import para estatico, include para dinamico | Previsibilidad |
| serial batching | {valor} | serial: "30%" para rolling | Disponibilidad |
| async tasks | {cantidad} | Usar para tareas de larga duracion (>30s) | Paralelismo |
| free strategy | {usado/no usado} | Usar para tareas independientes | Tiempo de ejecucion |
| tags | {usado/no usado} | Etiquetar todas las tareas para ejecuciones selectivas | Flexibilidad |
```

Patrones clave de optimizacion:
- **Async** para tareas >30s: `async: 300, poll: 10`
- **Free strategy** para hosts independientes: `strategy: free`
- **Facts selectivos**: `gather_subset: [network]` en lugar de recoleccion completa
- **Llamadas de modulo por lote**: pasar lista a `ansible.builtin.apt name:` en lugar de iterar

### Paso 4: Analisis de Calidad

```
──────────────────────────────────────────────────────────────
AUDITORIA DE CALIDAD
──────────────────────────────────────────────────────────────

| Verificacion | Puntuacion | Detalles |
|--------------|-----------|---------|
| Cumplimiento ansible-lint | {x}/100 | {cantidad de violaciones} |
| Uso de FQCN | {x}% | {tareas sin FQCN} |
| Idempotencia | {aprobado/fallo} | {tareas no idempotentes} |
| Diseno de roles | {bueno/necesita trabajo} | {roles monoliticos} |
| Nomenclatura de variables | {consistente/inconsistente} | {violaciones de convencion} |
| Uso de handlers | {correcto/faltante} | {restart sin handler} |
| Cobertura de tags | {x}% | {tareas sin etiquetar} |
| Cobertura de Molecule | {x}% | {roles sin tests} |
```

Ejecutar `ansible-lint`, verificar tareas shell/command no idempotentes sin `changed_when`/`creates`/`removes`, y verificar cumplimiento de FQCN.

### Paso 5: Informe Final

```
══════════════════════════════════════════════════════════════
INFORME DE OPTIMIZACION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMEN
──────────────────────────────────────────────────────────────

| Optimizacion | Impacto | Esfuerzo | Prioridad |
|-------------|---------|----------|-----------|
| Habilitar pipelining | Alto | Bajo | 1 |
| Habilitar cache de facts | Alto | Bajo | 2 |
| Aumentar forks | Medio | Bajo | 3 |
| Optimizar bucles | Medio | Medio | 4 |
| Agregar async para tareas largas | Medio | Medio | 5 |
| Corregir violaciones ansible-lint | Medio | Medio | 6 |
| Agregar tests Molecule | Alto | Alto | 7 |

──────────────────────────────────────────────────────────────
ARCHIVOS GENERADOS
──────────────────────────────────────────────────────────────

| Archivo | Descripcion |
|---------|-------------|
| ansible.cfg | Configuracion Ansible optimizada |
| .ansible-lint | Configuracion de lint actualizada |
| {playbook} | Playbook refactorizado con optimizaciones |

──────────────────────────────────────────────────────────────
PROXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Aplicar ajuste de ansible.cfg a todos los entornos
2. [ ] Ejecutar tests molecule para validar que no hay regresiones
3. [ ] Configurar pipeline CI con /ansible:deploy-setup
4. [ ] Auditar postura de seguridad con /ansible:security-audit
5. [ ] Monitorear tiempos de ejecucion con perfilado de callbacks
```
