---
description: Auditoría de Dependencias Python
argument-hint: [arguments]
---

# Auditoría de Dependencias Python

Eres un experto en seguridad de Python. Debes auditar las dependencias del proyecto para identificar vulnerabilidades, paquetes obsoletos y problemas de licencias.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Enfoque: security, outdated, licenses, all

Ejemplo: `/python:dependency-audit security` o `/python:dependency-audit all`

## Modo Plan

> El modo plan se activa automáticamente cuando el alcance abarca varios módulos o requiere una investigación transversal.

## MISIÓN

### Paso 1: Identificar Configuración

```bash
# Archivos de dependencias posibles
ls -la requirements*.txt pyproject.toml setup.py Pipfile poetry.lock

# Listar dependencias instaladas
pip list --format=json
pip freeze
```

### Paso 2: Auditoría de Seguridad

```bash
# Usar pip-audit (recomendado)
pip install pip-audit
pip-audit

# O safety (alternativa)
pip install safety
safety check -r requirements.txt

# O con pip nativo (Python 3.12+)
pip audit
```

### Paso 3: Verificar Actualizaciones

```bash
# Paquetes obsoletos
pip list --outdated --format=json

# Con pip-tools
pip install pip-tools
pip-compile --upgrade --dry-run

# Con poetry
poetry show --outdated

# Con pipenv
pipenv update --dry-run
```

### Paso 4: Auditoría de Licencias

```bash
# Instalar pip-licenses
pip install pip-licenses

# Listar licencias
pip-licenses --format=markdown

# Filtrar licencias problemáticas
pip-licenses --fail-on="GPL;AGPL"

# Exportar JSON
pip-licenses --format=json --output-file=licenses.json
```

### Paso 5: Análisis de Dependencias Transitivas

```bash
# Árbol de dependencias
pip install pipdeptree
pipdeptree

# Formato JSON
pipdeptree --json

# Dependencias inversas (quién usa qué)
pipdeptree --reverse --packages requests
```

### Paso 6: Generar Reporte

```
══════════════════════════════════════════════════════════════
📦 AUDITORÍA DE DEPENDENCIAS PYTHON
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
🔒 VULNERABILIDADES DE SEGURIDAD
──────────────────────────────────────────────────────────────

| Paquete | Versión | CVE | Severidad | Corregido En |
|---------|---------|-----|-----------|--------------|
| requests | 2.25.0 | CVE-2023-32681 | ALTA | 2.31.0 |
| urllib3 | 1.26.5 | CVE-2023-45803 | MEDIA | 1.26.18 |
| pillow | 9.0.0 | CVE-2023-44271 | CRÍTICA | 10.0.1 |

⚠️ ACCIONES REQUERIDAS:
1. `pip install requests>=2.31.0` (prioridad ALTA)
2. `pip install urllib3>=1.26.18` (prioridad MEDIA)
3. `pip install pillow>=10.0.1` (prioridad CRÍTICA)

──────────────────────────────────────────────────────────────
📈 PAQUETES OBSOLETOS
──────────────────────────────────────────────────────────────

### Actualizaciones MAJOR (Posibles cambios disruptivos)
| Paquete | Actual | Última | Changelog |
|---------|--------|--------|-----------|
| django | 3.2.23 | 5.0.1 | [Changelog](url) |
| pydantic | 1.10.13 | 2.5.3 | [Migración](url) |

### Actualizaciones MINOR (Recomendado)
| Paquete | Actual | Última |
|---------|--------|--------|
| fastapi | 0.104.0 | 0.109.0 |
| sqlalchemy | 2.0.23 | 2.0.25 |

### Actualizaciones PATCH (Seguridad/Bugfix)
| Paquete | Actual | Última |
|---------|--------|--------|
| httpx | 0.26.0 | 0.26.1 |

──────────────────────────────────────────────────────────────
📜 LICENCIAS
──────────────────────────────────────────────────────────────

### Resumen
| Tipo | Cantidad | Paquetes |
|------|----------|----------|
| MIT | 45 | requests, fastapi, ... |
| Apache-2.0 | 12 | google-cloud-*, ... |
| BSD-3-Clause | 8 | numpy, pandas, ... |
| GPL-3.0 | 2 | ⚠️ package-x, package-y |
| DESCONOCIDO | 1 | ❓ private-package |

### ⚠️ Licencias Copyleft Detectadas
Estas licencias pueden tener implicaciones legales:

| Paquete | Licencia | Impacto |
|---------|----------|---------|
| package-x | GPL-3.0 | Código derivado debe ser GPL |
| package-y | AGPL-3.0 | Incluso para SaaS |

**Recomendación**: Verificar compatibilidad con licencia del proyecto.

──────────────────────────────────────────────────────────────
📊 ESTADÍSTICAS
──────────────────────────────────────────────────────────────

| Métrica | Valor |
|---------|-------|
| Paquetes totales | 87 |
| Directos | 23 |
| Transitivos | 64 |
| Vulnerabilidades | 3 |
| Obsoletos | 15 |
| Licencias OK | 82 |
| Licencias a verificar | 5 |

──────────────────────────────────────────────────────────────
🔧 COMANDOS DE CORRECCIÓN
──────────────────────────────────────────────────────────────

# Corregir vulnerabilidades críticas
pip install --upgrade requests>=2.31.0 urllib3>=1.26.18 pillow>=10.0.1

# Actualizar parches de seguridad
pip install --upgrade httpx

# Generar requirements.txt actualizado
pip freeze > requirements.txt

# O con pip-tools
pip-compile --upgrade requirements.in

──────────────────────────────────────────────────────────────
🎯 PRIORIDADES
──────────────────────────────────────────────────────────────

1. [ ] CRÍTICO: Corregir pillow (CVE-2023-44271)
2. [ ] ALTO: Corregir requests (CVE-2023-32681)
3. [ ] MEDIO: Corregir urllib3 (CVE-2023-45803)
4. [ ] Verificar licencias GPL (package-x, package-y)
5. [ ] Planificar migración pydantic v1 → v2
```
