---
description: Verificación de Código Asíncrono Python
argument-hint: [arguments]
---

# Verificación de Código Asíncrono Python

## Argumentos

$ARGUMENTS (opcional: ruta a analizar)

## MISIÓN

Analizar el uso de código asíncrono en el proyecto Python e identificar problemas con patrones async/await, llamadas bloqueantes y problemas de rendimiento.

### Paso 1: Identificar Funciones Asíncronas

```bash
# Encontrar todas las funciones async
rg "async def" --type py

# Encontrar uso de await
rg "await " --type py
```

Verificar:
- [ ] Funciones async correctamente declaradas
- [ ] Await usado para llamadas async
- [ ] Sin código bloqueante en funciones async
- [ ] Manejo apropiado de excepciones en async

### Paso 2: Detectar Llamadas Bloqueantes

```python
# Llamadas bloqueantes comunes a evitar en async:
- time.sleep()        # Usar asyncio.sleep()
- requests.get()      # Usar httpx o aiohttp
- open()              # Usar aiofiles
- db.execute()        # Usar driver async de BD
```

### Paso 3: Verificar Patrones Async

```python
# Patrones buenos
async def fetch_data(url: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()

# Verificar:
- [ ] async with para gestores de contexto
- [ ] await para operaciones async
- [ ] asyncio.gather() para tareas concurrentes
- [ ] Manejo apropiado de errores con try/except
```

### Paso 4: Generar Reporte

```
ANÁLISIS DE CÓDIGO ASÍNCRONO
=====================================

FUNCIONES ASYNC: XX
SENTENCIAS AWAIT: XX
LLAMADAS BLOQUEANTES ENCONTRADAS: XX

PROBLEMAS DETECTADOS:

1. Llamada bloqueante en función async
   Archivo: app/services/user.py:45
   Problema: Usando time.sleep() en lugar de asyncio.sleep()
   Corrección: Reemplazar con asyncio.sleep()

2. Await faltante
   Archivo: app/api/endpoints.py:78
   Problema: Función async llamada sin await
   Corrección: Agregar palabra clave await

RECOMENDACIONES:
- Reemplazar llamadas bloqueantes con alternativas async
- Usar asyncio.gather() para operaciones concurrentes
- Agregar manejo apropiado de timeout
```
