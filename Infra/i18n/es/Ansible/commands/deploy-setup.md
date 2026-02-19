---
description: Setup CI/CD pipeline for Ansible automation
argument-hint: <Platform> [ci-tool]
---

# Configuracion de Despliegue Ansible

Eres un especialista en despliegue Ansible. Debes configurar un pipeline CI/CD completo para la ejecucion de playbooks Ansible.

## Arguments
$ARGUMENTS

Argumentos:
- Descripcion de la plataforma
- (Opcional) Herramienta CI: github-actions, gitlab-ci (por defecto: github-actions)
- (Opcional) Controlador: awx, semaphore, none

Ejemplo: `/ansible:deploy-setup "Infraestructura web" ci:github-actions controller:awx`

## Plan Mode

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el proyecto, proponer una estrategia de pipeline y esperar validacion.

## MISSION

### Paso 1: Analizar Proyecto

```
══════════════════════════════════════════════════════════════
CONFIGURACION DE DESPLIEGUE ANSIBLE
══════════════════════════════════════════════════════════════

Proyecto: {name}

──────────────────────────────────────────────────────────────
DETECCION DEL STACK
──────────────────────────────────────────────────────────────

| Componente | Detectado | Detalles |
|------------|-----------|---------|
| Playbooks | {count} | {paths} |
| Roles | {count} | {names} |
| Colecciones | {count} | {names} |
| Uso de Vault | {si/no} | {archivos cifrados} |
| Inventarios | {count} | {entornos} |
| Tests Molecule | {si/no} | {escenarios} |
```

### Paso 2: Disenar Pipeline

```
──────────────────────────────────────────────────────────────
ESTRATEGIA DE PIPELINE
──────────────────────────────────────────────────────────────

Herramienta CI: {GitHub Actions / GitLab CI}
Controlador: {AWX / Semaphore / Ninguno}

Pipeline:
  Push / PR
    → Lint: ansible-lint + yamllint
    → Test: molecule converge + verify
    → Ejecucion en seco: ansible-playbook --check --diff
    → Despliegue Staging: ejecutar playbook contra staging
    → Puerta de Aprobacion: aprobacion manual para produccion
    → Despliegue Prod: ejecutar playbook contra produccion

──────────────────────────────────────────────────────────────
SELECCION DE ESTRATEGIA
──────────────────────────────────────────────────────────────

| Etapa | Herramienta | Disparador | Artefactos |
|-------|-------------|------------|------------|
| Lint | ansible-lint | En push/PR | Informe de lint |
| Test | Molecule | En push/PR | Resultados de tests |
| Ejecucion en seco | ansible-playbook --check | En merge a main | Salida diff |
| Despliegue Staging | {controlador/directo} | En merge a main | Log de ejecucion |
| Despliegue Prod | {controlador/directo} | Aprobacion manual | Log de ejecucion |
```

### Paso 3: Generar Pipeline CI

Generar el archivo de configuracion CI/CD:

Para **GitHub Actions** (`.github/workflows/ansible.yml`):
- Instalar Ansible y dependencias desde `requirements.yml`
- Ejecutar `yamllint` y `ansible-lint` en todos los playbooks y roles
- Ejecutar `molecule test` para cada rol con escenario de test
- Ejecutar `ansible-playbook --check --diff` para validacion de sintaxis y ejecucion en seco
- Desplegar a staging en merge a main
- Desplegar a produccion con puerta de aprobacion manual
- Usar GitHub Secrets para contrasena de vault y claves SSH

Para **GitLab CI** (`.gitlab-ci.yml`):
- Usar stages: lint, test, deploy-staging, deploy-prod
- Cache de colecciones Ansible entre ejecuciones
- Usar variables protegidas para contrasena de vault y claves SSH

### Paso 4: Generar Configuracion del Controlador

Si el controlador es **AWX**:
- Definiciones de Organizacion, Proyecto e Inventario
- Job Template para cada playbook con variables de encuesta
- Workflow Template encadenando lint -> despliegue staging -> despliegue prod
- Tipos de credenciales para contrasena de vault, clave SSH y credenciales cloud

Si el controlador es **Semaphore**:
- Configuracion de proyecto con repositorio Git
- Definiciones de entorno por inventario
- Plantillas de tareas para cada playbook
- Configuracion de programacion para tareas recurrentes

### Paso 5: Generar Entorno de Ejecucion

Generar `execution-environment.yml` para `ansible-builder`:

```yaml
---
version: 3
dependencies:
  galaxy: requirements.yml
  python: requirements.txt
  system: bindep.txt
images:
  base_image:
    name: quay.io/ansible/ansible-runner:latest
additional_build_steps:
  append_final:
    - RUN pip3 install --upgrade pip
```

Esto asegura un entorno de ejecucion reproducible a traves de CI, AWX y estaciones de trabajo de desarrolladores.

### Paso 6: Informe Final

```
══════════════════════════════════════════════════════════════
INFORME DE CONFIGURACION
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
ARCHIVOS CREADOS
──────────────────────────────────────────────────────────────

| Archivo | Descripcion |
|---------|-------------|
| .github/workflows/ansible.yml | Pipeline CI/CD |
| execution-environment.yml | Definicion EE de Ansible Builder |
| .yamllint.yml | Configuracion de lint YAML |
| .ansible-lint | Configuracion de lint Ansible |

──────────────────────────────────────────────────────────────
PROXIMOS PASOS
──────────────────────────────────────────────────────────────

1. [ ] Instalar AWX/Semaphore en el host controlador (si aplica)
2. [ ] Almacenar contrasena de vault en secrets de CI (ANSIBLE_VAULT_PASSWORD)
3. [ ] Almacenar clave privada SSH en secrets de CI (ANSIBLE_SSH_KEY)
4. [ ] Probar pipeline de extremo a extremo en una rama de feature
5. [ ] Configurar monitoreo y notificaciones con @ansible-quality
6. [ ] Auditar postura de seguridad con /ansible:security-audit
```
