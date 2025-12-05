# Checklist Pre-Commit

## Antes de Cada Commit

### 1. Calidad del Código

- [ ] **Linting** - El código sigue los estándares
  ```bash
  make lint
  # o
  ruff check src/ tests/
  ```

- [ ] **Formato** - El código está formateado correctamente
  ```bash
  make format-check
  # o
  black --check src/ tests/
  isort --check src/ tests/
  ```

- [ ] **Verificación de Tipos** - Sin errores de tipo
  ```bash
  make type-check
  # o
  mypy src/
  ```

- [ ] **Seguridad** - Sin vulnerabilidades obvias
  ```bash
  make security-check
  # o
  bandit -r src/ -ll
  ```

### 2. Pruebas

- [ ] **Todas las pruebas pasan**
  ```bash
  make test
  # o
  pytest tests/
  ```

- [ ] **Nuevas pruebas escritas** para código nuevo
  - [ ] Pruebas unitarias para nueva lógica
  - [ ] Pruebas de integración si es necesario
  - [ ] Pruebas E2E si flujo crítico

- [ ] **Cobertura mantenida** (> 80%)
  ```bash
  make test-cov
  # o
  pytest --cov=src --cov-report=term
  ```

- [ ] **Pruebas relevantes** para bugs corregidos
  - [ ] Prueba reproduce bug (debe fallar antes de corrección)
  - [ ] Prueba pasa después de corrección

### 3. Estándares de Código

- [ ] **PEP 8** respetado
  - [ ] Línea máx 88 caracteres
  - [ ] Importaciones organizadas (stdlib, third-party, local)
  - [ ] Sin espacios en blanco al final

- [ ] **Anotaciones de tipo** en todas las funciones públicas
  ```python
  def my_function(param: str) -> int:
      """Docstring."""
      pass
  ```

- [ ] **Docstrings** estilo Google
  ```python
  def function(arg1: str, arg2: int) -> bool:
      """
      Línea de resumen.

      Args:
          arg1: Descripción
          arg2: Descripción

      Returns:
          Descripción

      Raises:
          ValueError: Si condición
      """
      pass
  ```

- [ ] **Convenciones de nomenclatura**
  - [ ] Clases: PascalCase
  - [ ] Funciones/variables: snake_case
  - [ ] Constantes: UPPER_CASE
  - [ ] Privado: _prefijo

### 4. Arquitectura

- [ ] **Clean Architecture** respetada
  - [ ] El dominio no depende de nada
  - [ ] Las dependencias apuntan hacia adentro
  - [ ] Protocols para abstracciones

- [ ] **SOLID** aplicado
  - [ ] Responsabilidad Única
  - [ ] Abierto/Cerrado
  - [ ] Sustitución de Liskov
  - [ ] Segregación de Interfaces
  - [ ] Inversión de Dependencias

- [ ] **KISS, DRY, YAGNI**
  - [ ] Solución simple
  - [ ] Sin duplicación
  - [ ] Sin código innecesario

### 5. Seguridad

- [ ] **Sin secretos** codificados en duro en el código
  - [ ] Sin contraseñas
  - [ ] Sin claves API
  - [ ] Sin tokens

- [ ] **Variables de entorno**
  - [ ] Agregadas a `.env.example` si son nuevas
  - [ ] Documentadas en README si es necesario

- [ ] **Validación de entrada**
  - [ ] Todas las entradas validadas (Pydantic)
  - [ ] Sin inyección SQL (consultas parametrizadas)
  - [ ] Sin inyección XSS

- [ ] **Datos sensibles**
  - [ ] Contraseñas hasheadas (bcrypt)
  - [ ] PII protegida
  - [ ] Los logs no contienen datos sensibles

### 6. Base de Datos

- [ ] **Migración** creada si hay cambio de schema
  ```bash
  make db-migrate msg="Descripción"
  # o
  alembic revision --autogenerate -m "Descripción"
  ```

- [ ] **Migración probada**
  - [ ] Upgrade funciona
  - [ ] Downgrade funciona
  - [ ] Sin pérdida de datos

- [ ] **Índices** agregados si es necesario
  - [ ] En columnas frecuentemente buscadas
  - [ ] En claves foráneas

### 7. Rendimiento

- [ ] **Consultas N+1** evitadas
  - [ ] Uso de joinedload/selectinload si es necesario
  - [ ] Sin consultas en bucles

- [ ] **Paginación** para listas grandes
  - [ ] Limit/offset implementado
  - [ ] Sin cargar miles de items

- [ ] **Caché** si es apropiado
  - [ ] Caché para datos frecuentemente accedidos
  - [ ] Invalidación de caché gestionada

### 8. Logging & Monitoreo

- [ ] **Logging apropiado**
  - [ ] Nivel correcto (DEBUG, INFO, WARNING, ERROR)
  - [ ] Mensajes claros e informativos
  - [ ] Contexto agregado (user_id, request_id, etc.)

- [ ] **Sin print()** - usar logger
  ```python
  # ❌ Malo
  print(f"Usuario {user_id} creado")

  # ✅ Bueno
  logger.info(f"Usuario creado", extra={"user_id": user_id})
  ```

- [ ] **Excepciones registradas**
  ```python
  try:
      risky_operation()
  except Exception as e:
      logger.error(f"Operación falló: {e}", exc_info=True)
      raise
  ```

### 9. Documentación

- [ ] **Comentarios de código** para lógica compleja
  - [ ] Sin comentarios obvios
  - [ ] Explicación del "por qué", no del "qué"

- [ ] **README** actualizado si es necesario
  - [ ] Nuevas funcionalidades documentadas
  - [ ] Instrucciones de setup actualizadas
  - [ ] Variables de entorno documentadas

- [ ] **Docs de API** actualizados
  - [ ] Nuevos endpoints documentados
  - [ ] Ejemplos proporcionados
  - [ ] Errores documentados

### 10. Git

- [ ] **Mensaje de commit** sigue Conventional Commits
  ```
  tipo(scope): asunto

  cuerpo

  pie de página
  ```
  - Tipos: feat, fix, docs, style, refactor, test, chore
  - Asunto: imperativo, minúsculas, sin punto
  - Cuerpo: opcional, detalles del cambio
  - Pie: breaking changes, closes issues

- [ ] **Commit atómico**
  - [ ] Un commit = un cambio lógico
  - [ ] Sin commits gigantes
  - [ ] Sin commits "WIP" o "fix"

- [ ] **Archivos temporales** no incluidos
  - [ ] Sin .pyc, __pycache__
  - [ ] Sin .env (solo .env.example)
  - [ ] Sin archivos de IDE

### 11. Dependencias

- [ ] **Nuevas dependencias** justificadas
  - [ ] ¿Realmente necesaria?
  - [ ] ¿No hay alternativa en deps existentes?
  - [ ] ¿Librería mantenida y segura?

- [ ] **Archivo lock** actualizado
  ```bash
  poetry lock
  # o
  uv lock
  ```

- [ ] **Versión fijada** correctamente
  - [ ] No versiones demasiado amplias (`*`)
  - [ ] Compatible con otras deps

### 12. Limpieza

- [ ] **Código muerto** eliminado
  - [ ] Sin código comentado
  - [ ] Sin funciones no usadas
  - [ ] Sin importaciones no usadas

- [ ] **Código de debug** eliminado
  - [ ] Sin breakpoint()
  - [ ] Sin prints de debug
  - [ ] Sin TODO/FIXME (o crear issue)

- [ ] **Logs de consola** eliminados
  - [ ] Sin print() de debug
  - [ ] Logs apropiados usados

## Comando de Verificación Rápida

```bash
# One-liner para verificar todo
make quality && make test-cov
```

## Hook Pre-commit

Para automatizar, usar hooks pre-commit:

```bash
# .pre-commit-config.yaml ya configurado
pre-commit install

# Ejecutar manualmente
pre-commit run --all-files
```

## Si Algo Falla

### Errores de Linting

```bash
# Auto-corregir lo que se pueda
make lint-fix
# o
ruff check --fix src/ tests/
```

### Errores de Formato

```bash
# Auto-formatear
make format
# o
black src/ tests/
isort src/ tests/
```

### Pruebas Fallando

```bash
# Ejecutar pruebas en verbose para debug
pytest -vv tests/

# Ejecutar prueba específica
pytest tests/path/to/test.py::test_function -vv

# Ver stdout/stderr
pytest -s tests/
```

### Errores de Tipo

```bash
# Ver errores detallados
mypy src/ --show-error-codes

# Ignorar temporalmente (¡evitar!)
# type: ignore[error-code]
```

## Excepciones

### Hotfix Urgente

Si hotfix de producción urgente:
- [ ] Pruebas mínimas pasan
- [ ] Corrección verificada manualmente
- [ ] PR creado inmediatamente después
- [ ] TODO creado para mejorar pruebas

### Commit WIP

Si realmente es necesario (evitar):
- [ ] Commit en rama separada
- [ ] Con prefijo `WIP:`
- [ ] Squash antes de merge a main

## Checklist Rápido (Mínimo)

- [ ] `make lint` ✅
- [ ] `make type-check` ✅
- [ ] `make test` ✅
- [ ] Mensaje de commit válido ✅
- [ ] Sin secretos ✅
