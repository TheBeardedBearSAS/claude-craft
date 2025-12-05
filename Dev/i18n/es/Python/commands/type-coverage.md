# Verificar Cobertura de Tipos Python

Eres un experto en Python. Debes verificar la cobertura de anotaciones de tipo en el proyecto e identificar funciones/métodos sin tipar.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Ruta a módulo específico
- (Opcional) Umbral mínimo de cobertura (ej: `80`)

Ejemplo: `/python:type-coverage app/` o `/python:type-coverage app/api/ 90`

## MISIÓN

### Paso 1: Configuración de MyPy

[Mostrar configuración de mypy en pyproject.toml]

### Paso 2: Lanzar Análisis

```bash
# MyPy estándar
mypy app/

# Con reporte de cobertura
mypy app/ --txt-report type-coverage/

# Reporte HTML
mypy app/ --html-report type-coverage-html/

# Modo estricto progresivo
mypy app/ --strict --warn-return-any
```

### Paso 3: Script de Análisis de Cobertura

[Script Python para analizar cobertura de tipos usando AST]

### Paso 4: Patrones de Tipado

[Mostrar patrones: TypeAlias, Generics, Protocols, Callable, Overload, etc.]

### Paso 5: Generar Reporte

```
══════════════════════════════════════════════════════════════
📊 REPORTE DE COBERTURA DE TIPOS
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📈 RESUMEN GLOBAL
──────────────────────────────────────────────────────────────

| Métrica | Valor | Umbral | Estado |
|---------|-------|--------|--------|
| Cobertura Global | 78.5% | 80% | ⚠️ |
| Funciones Totales | 245 | - | - |
| Completamente Tipadas | 192 | - | - |
| Parcialmente Tipadas | 38 | - | - |
| Sin Tipar | 15 | - | - |

──────────────────────────────────────────────────────────────
📁 COBERTURA POR MÓDULO
──────────────────────────────────────────────────────────────

| Módulo | Funciones | Tipadas | Cobertura |
|--------|-----------|---------|-----------|
| app/api/ | 45 | 45 | 100% ✅ |
| app/core/ | 32 | 30 | 93.8% ✅ |
| app/services/ | 58 | 52 | 89.7% ✅ |
| app/crud/ | 40 | 35 | 87.5% ✅ |
| app/models/ | 28 | 20 | 71.4% ⚠️ |
| app/utils/ | 42 | 10 | 23.8% ❌ |

──────────────────────────────────────────────────────────────
❌ FUNCIONES SIN TIPAR
──────────────────────────────────────────────────────────────

### app/utils/helpers.py

| Línea | Función | Faltante |
|-------|---------|----------|
| 15 | `parse_date` | tipo de retorno |
| 28 | `format_currency` | param: amount, retorno |
| 45 | `slugify` | tipo de retorno |
| 67 | `calculate_hash` | param: data |

──────────────────────────────────────────────────────────────
🔧 CORRECCIONES SUGERIDAS
──────────────────────────────────────────────────────────────

### app/utils/helpers.py:15

```python
# Antes
def parse_date(date_str):
    ...

# Después
def parse_date(date_str: str) -> datetime | None:
    ...
```

──────────────────────────────────────────────────────────────
🎯 PRIORIDADES
──────────────────────────────────────────────────────────────

1. [ ] Tipar app/utils/ (23.8% → 80%+)
2. [ ] Completar app/models/ (71.4% → 90%+)
3. [ ] Corregir 23 errores de mypy
4. [ ] Agregar plugin de mypy para SQLAlchemy
5. [ ] Configurar hook pre-commit de mypy
```
