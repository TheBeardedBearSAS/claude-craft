# Verificar Calidad del Código Python

## Argumentos

$ARGUMENTS (opcional: ruta al proyecto a analizar)

## MISIÓN

Realizar una auditoría completa de calidad del código del proyecto Python verificando cumplimiento de PEP8, tipado, legibilidad y mejores prácticas definidas en las reglas del proyecto.

### Paso 1: Estándares de Codificación PEP8

Verificar cumplimiento de convenciones de Python:
- [ ] Nomenclatura: snake_case para funciones/variables, PascalCase para clases
- [ ] Indentación: 4 espacios (sin tabs)
- [ ] Longitud de línea: máximo 88 caracteres (Black)
- [ ] Importaciones: organizadas (stdlib, third-party, local) y ordenadas
- [ ] Espacios: alrededor de operadores, después de comas
- [ ] Docstrings: presentes para módulos, clases, funciones públicas

**Comando**: Ejecutar `docker run --rm -v $(pwd):/app python:3.11 python -m flake8 /app --max-line-length=88`

**Referencia**: `rules/03-coding-standards.md` sección "Cumplimiento de PEP 8"

### Paso 2: Anotaciones de Tipo y MyPy

Verificar uso de tipado estático:
- [ ] Type hints en todos los parámetros de función
- [ ] Type hints en valores de retorno
- [ ] Anotaciones para atributos de clase
- [ ] Uso de `typing` para tipos complejos (Optional, Union, List, Dict)
- [ ] Sin errores MyPy en modo estricto

**Comando**: Ejecutar `docker run --rm -v $(pwd):/app python:3.11 python -m mypy /app --strict`

**Referencia**: `rules/03-coding-standards.md` sección "Anotaciones de Tipo"

### Paso 3: Linting con Ruff

Analizar código con Ruff (reemplaza Flake8, isort, pydocstyle):
- [ ] Sin importaciones no usadas
- [ ] Sin variables no usadas
- [ ] Sin código muerto (código inalcanzable)
- [ ] Complejidad ciclomática aceptable (<10)
- [ ] Reglas de seguridad respetadas (reglas S)

**Comando**: Ejecutar `docker run --rm -v $(pwd):/app python:3.11 pip install ruff && ruff check /app`

**Referencia**: `rules/06-tooling.md` sección "Linting y Formato"

### Paso 4: Formato con Black

Verificar consistencia de formato:
- [ ] Código formateado con Black
- [ ] Configuración de Black en pyproject.toml
- [ ] Sin diferencias después de `black --check`
- [ ] Longitud de línea consistente (88 caracteres)

**Comando**: Ejecutar `docker run --rm -v $(pwd):/app python:3.11 pip install black && black --check /app`

**Referencia**: `rules/06-tooling.md` sección "Formato de Código"

### Paso 5: Principios KISS, DRY, YAGNI

Analizar simplicidad y claridad del código:
- [ ] Funciones cortas (<20 líneas idealmente)
- [ ] Sin duplicación de código (DRY)
- [ ] Sin sobre-ingeniería (YAGNI)
- [ ] Nomenclatura explícita y auto-documentada
- [ ] Nivel único de abstracción por función
- [ ] Retornos tempranos para reducir complejidad

**Referencia**: `rules/05-kiss-dry-yagni.md`

### Paso 6: Comentarios y Documentación

Evaluar calidad de documentación:
- [ ] Docstrings estilo Google o NumPy
- [ ] Comentarios solo para "por qué", no "qué"
- [ ] README.md completo con setup y uso
- [ ] Sin código comentado (usar git)
- [ ] Documentación de decisiones arquitectónicas importantes

**Referencia**: `rules/03-coding-standards.md` sección "Documentación"

### Paso 7: Manejo de Errores

Verificar robustez del código:
- [ ] Excepciones específicas (no Exception genérica)
- [ ] Sin `pass` silencioso en except
- [ ] Mensajes de error informativos
- [ ] Validación de entrada de usuario
- [ ] Gestión apropiada de recursos (gestores de contexto)

**Referencia**: `rules/03-coding-standards.md` sección "Manejo de Errores"

### Paso 8: Calcular Puntuación

Atribución de puntos (sobre 25):
- PEP8 y formato: 5 puntos
- Type hints y MyPy: 5 puntos
- Linting con Ruff: 4 puntos
- KISS/DRY/YAGNI: 4 puntos
- Documentación: 4 puntos
- Manejo de errores: 3 puntos

## FORMATO DE SALIDA

```
AUDITORÍA DE CALIDAD DEL CÓDIGO PYTHON
================================

PUNTUACIÓN GENERAL: XX/25

FORTALEZAS:
- [Lista de buenas prácticas observadas]

MEJORAS:
- [Lista de mejoras menores]

PROBLEMAS CRÍTICOS:
- [Lista de violaciones graves de estándares]

DETALLES POR CATEGORÍA:

1. PEP8 Y FORMATO (XX/5)
   Estado: [Cumplimiento de estándares Python]
   Errores Flake8: XX
   Diferencias Black: XX archivos

2. ANOTACIONES DE TIPO (XX/5)
   Estado: [Cobertura de tipado estático]
   Errores MyPy: XX
   Cobertura: XX%

3. LINTING RUFF (XX/4)
   Estado: [Calidad del código]
   Advertencias: XX
   Importaciones No Usadas: XX
   Complejidad Máxima: XX

4. KISS/DRY/YAGNI (XX/4)
   Estado: [Simplicidad y claridad]
   Funciones >20 líneas: XX
   Código Duplicado: XX instancias

5. DOCUMENTACIÓN (XX/4)
   Estado: [Calidad de documentación]
   Docstrings Faltantes: XX
   Cobertura: XX%

6. MANEJO DE ERRORES (XX/3)
   Estado: [Robustez del código]
   Excepciones Genéricas: XX
   `except pass`: XX

TOP 3 ACCIONES PRIORITARIAS:
1. [Acción más crítica para mejorar calidad]
2. [Segunda acción prioritaria]
3. [Tercera acción prioritaria]
```

## NOTAS

- Ejecutar todas las herramientas de linting disponibles en el proyecto
- Usar Docker para abstraerse del entorno local
- Proporcionar ejemplos de archivos/líneas problemáticas
- Sugerir correcciones automatizables (hooks pre-commit)
- Priorizar victorias rápidas (auto formato) vs refactorización profunda
