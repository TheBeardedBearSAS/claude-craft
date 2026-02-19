---
description: Audit OpenTofu security posture
argument-hint: [Scope]
---

# Auditoría de Seguridad OpenTofu

Eres un especialista en seguridad OpenTofu. Debes realizar una auditoría de seguridad completa de la configuración de Infraestructura como Código.

## Arguments
$ARGUMENTS

Argumentos:
- (Opcional) Alcance: encryption, secrets, iam, policies, full (por defecto: full)
- (Opcional) Ruta al directorio de configuración

Ejemplo: `/opentofu:security-audit scope:full path:infra/`

## Plan Mode

> **El modo plan es condicional.** Se activa automáticamente cuando el alcance es "full" o abarca múltiples entornos.

## MISSION

### Paso 1: Definición del Alcance

```
══════════════════════════════════════════════════════════════
AUDITORÍA DE SEGURIDAD OPENTOFU
══════════════════════════════════════════════════════════════

Alcance: {full / encryption / secrets / iam / policies}
Ruta: {ruta de configuración}

──────────────────────────────────────────────────────────────
ALCANCE DE LA AUDITORÍA
──────────────────────────────────────────────────────────────
```

### Paso 2: Auditoría de Cifrado de Estado

```
──────────────────────────────────────────────────────────────
CIFRADO DE ESTADO
──────────────────────────────────────────────────────────────

| Verificación | Estado | Detalles |
|--------------|--------|----------|
| Cifrado nativo (v1.7+) | {habilitado/deshabilitado} | {método} |
| Cifrado del backend | {habilitado/deshabilitado} | {tipo} |
| Cifrado del plan | {habilitado/deshabilitado} | {detalles} |
| Gestión de claves | {KMS/PBKDF2/ninguno} | {detalles} |
```

### Paso 3: Auditoría de Secretos

```
──────────────────────────────────────────────────────────────
GESTIÓN DE SECRETOS
──────────────────────────────────────────────────────────────

| Verificación | Estado | Detalles |
|--------------|--------|----------|
| Secretos hardcodeados | {cantidad} | {archivos} |
| Variables sensibles | {%} | {lista faltante} |
| Valores efímeros | {usados/no} | {v1.11+} |
| .tfvars en VCS | {sí/no} | {archivos} |
| Credenciales CI/CD | {OIDC/estáticas} | {detalles} |
```

### Paso 4: Auditoría de IAM y Acceso

```
──────────────────────────────────────────────────────────────
CONTROL DE ACCESO
──────────────────────────────────────────────────────────────

| Verificación | Estado | Detalles |
|--------------|--------|----------|
| IAM de privilegio mínimo | {sí/no} | {políticas demasiado amplias} |
| ACL del backend de estado | {con alcance/abierto} | {detalles} |
| Separación CI/CD | {roles plan/apply} | {detalles} |
| Apply manual deshabilitado | {sí/no} | {detalles} |
```

### Paso 5: Auditoría de Políticas y Cumplimiento

```
──────────────────────────────────────────────────────────────
APLICACIÓN DE POLÍTICAS
──────────────────────────────────────────────────────────────

| Verificación | Estado | Detalles |
|--------------|--------|----------|
| tfsec/checkov | {integrado/no} | {hallazgos} |
| Políticas OPA | {sí/no} | {cantidad} |
| Archivo lock del proveedor | {committed/faltante} | {detalles} |
| Cumplimiento de etiquetas | {obligatorio/no} | {detalles} |
```

### Paso 6: Informe Final

```
══════════════════════════════════════════════════════════════
INFORME DE AUDITORÍA DE SEGURIDAD
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
PUNTUACIÓN
──────────────────────────────────────────────────────────────

| Categoría | Puntuación | Estado |
|-----------|------------|--------|
| Cifrado de Estado | {x}/100 | {aprobado/advertencia/fallo} |
| Gestión de Secretos | {x}/100 | {aprobado/advertencia/fallo} |
| Control de Acceso | {x}/100 | {aprobado/advertencia/fallo} |
| Aplicación de Políticas | {x}/100 | {aprobado/advertencia/fallo} |
| **General** | **{x}/100** | **{estado}** |

──────────────────────────────────────────────────────────────
HALLAZGOS CRÍTICOS
──────────────────────────────────────────────────────────────

1. [ ] {hallazgo crítico 1}
2. [ ] {hallazgo crítico 2}

──────────────────────────────────────────────────────────────
RECOMENDACIONES
──────────────────────────────────────────────────────────────

Prioridad 1 (Inmediato):
- [ ] {recomendación}

Prioridad 2 (Este sprint):
- [ ] {recomendación}

Prioridad 3 (Próximo trimestre):
- [ ] {recomendación}
```
