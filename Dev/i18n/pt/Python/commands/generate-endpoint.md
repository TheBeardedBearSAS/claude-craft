# Gerar Endpoint FastAPI

Você é um desenvolvedor Python sênior. Você deve gerar um endpoint FastAPI completo com validação Pydantic, tratamento de erros e testes.

## Argumentos
$ARGUMENTS

Argumentos:
- Nome do recurso (ex: `user`, `product`, `order`)
- (Opcional) Tipo (crud, list, detail, action)

Exemplo: `/python:generate-endpoint user crud`

## MISSÃO

### Passo 1: Estrutura do Endpoint

```
app/
├── api/
│   └── v1/
│       └── endpoints/
│           └── {resource}.py
├── schemas/
│   └── {resource}.py
├── crud/
│   └── {resource}.py
├── models/
│   └── {resource}.py
└── tests/
    └── api/
        └── v1/
            └── test_{resource}.py
```

### Passo 2: Modelo SQLAlchemy

[Criar template de modelo com UUID, timestamps, etc.]

### Passo 3: Schemas Pydantic

[Criar schemas: Base, Create, Update, InDB, Response, List]

### Passo 4: Operações CRUD

[Criar classe CRUD com get, create, update, delete, paginação]

### Passo 5: Endpoint FastAPI

[Criar router com endpoints GET, POST, PATCH, DELETE]

### Passo 6: Testes

[Criar classe de teste com todos os testes de endpoint]

### Passo 7: Registro do Router

[Adicionar router ao arquivo principal da API]

### Resumo

```
══════════════════════════════════════════════════════════════
✅ ENDPOINT GERADO - {resource}
══════════════════════════════════════════════════════════════

📁 Arquivos Criados:
- app/models/{resource}.py
- app/schemas/{resource}.py
- app/crud/{resource}.py
- app/api/v1/endpoints/{resource}.py
- app/tests/api/v1/test_{resource}.py

🔗 Endpoints Disponíveis:
- GET    /api/v1/{resource}s/     - Lista paginada
- POST   /api/v1/{resource}s/     - Criação
- GET    /api/v1/{resource}s/{id} - Detalhe
- PATCH  /api/v1/{resource}s/{id} - Atualização
- DELETE /api/v1/{resource}s/{id} - Exclusão

🔧 Próximos Passos:
1. Adicionar router em app/api/v1/api.py
2. Criar migração Alembic
3. Executar testes: pytest app/tests/api/v1/test_{resource}.py
```
