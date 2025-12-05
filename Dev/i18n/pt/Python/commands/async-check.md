# Verificação de Async Python

## Argumentos

$ARGUMENTS (opcional: caminho para analisar)

## MISSÃO

Analisar o uso de código assíncrono no projeto Python e identificar problemas com padrões async/await, chamadas bloqueantes e problemas de performance.

### Passo 1: Identificar Funções Async

```bash
# Encontrar todas as funções async
rg "async def" --type py

# Encontrar uso de await
rg "await " --type py
```

Verificar:
- [ ] Funções async declaradas adequadamente
- [ ] Await usado para chamadas async
- [ ] Sem código bloqueante em funções async
- [ ] Tratamento adequado de exceções em async

### Passo 2: Detectar Chamadas Bloqueantes

```python
# Chamadas bloqueantes comuns a evitar em async:
- time.sleep()        # Usar asyncio.sleep()
- requests.get()      # Usar httpx ou aiohttp
- open()              # Usar aiofiles
- db.execute()        # Usar driver de BD async
```

### Passo 3: Verificar Padrões Async

```python
# Bons padrões
async def fetch_data(url: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()

# Verificar:
- [ ] async with para context managers
- [ ] await para operações async
- [ ] asyncio.gather() para tarefas concorrentes
- [ ] Tratamento adequado de erros com try/except
```

### Passo 4: Gerar Relatório

```
ANÁLISE DE CÓDIGO ASYNC
=====================================

FUNÇÕES ASYNC: XX
INSTRUÇÕES AWAIT: XX
CHAMADAS BLOQUEANTES ENCONTRADAS: XX

PROBLEMAS DETECTADOS:

1. Chamada bloqueante em função async
   Arquivo: app/services/user.py:45
   Problema: Usando time.sleep() em vez de asyncio.sleep()
   Correção: Substituir por asyncio.sleep()

2. Await faltando
   Arquivo: app/api/endpoints.py:78
   Problema: Função async chamada sem await
   Correção: Adicionar palavra-chave await

RECOMENDAÇÕES:
- Substituir chamadas bloqueantes por alternativas async
- Usar asyncio.gather() para operações concorrentes
- Adicionar tratamento adequado de timeout
```
