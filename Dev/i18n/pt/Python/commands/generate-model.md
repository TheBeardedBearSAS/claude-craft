# Gerar Modelo SQLAlchemy

Você é um desenvolvedor Python sênior. Você deve gerar um modelo SQLAlchemy completo com relações, validações e migração Alembic.

## Argumentos
$ARGUMENTS

Argumentos:
- Nome do modelo (ex: `User`, `Product`, `Order`)
- (Opcional) Campos no formato campo:tipo (ex: `name:str email:str:unique`)

Exemplo: `/python:generate-model Product name:str price:decimal category_id:uuid:fk`

## MISSÃO

### Passo 1: Analisar Requisitos

Identificar:
- Nome do modelo e da tabela
- Campos e seus tipos
- Relações (ForeignKey, OneToMany, ManyToMany)
- Índices e restrições
- Validações

### Passo 2: Modelo SQLAlchemy 2.0

[Criar modelo completo com Mapped, relationships, constraints]

### Passo 3: Tipos de Colunas Comuns

[Referência para tipos SQLAlchemy: Integer, String, Text, DateTime, UUID, JSONB, etc.]

### Passo 4: Relações

[Exemplos: OneToMany, ManyToMany com tabela de associação]

### Passo 5: Migração Alembic

[Criar arquivo de migração com funções upgrade/downgrade]

### Passo 6: Comandos

```bash
# Gerar migração automaticamente
alembic revision --autogenerate -m "Create {model}s table"

# Verificar migração
alembic upgrade --sql head

# Aplicar migração
alembic upgrade head

# Rollback se necessário
alembic downgrade -1
```

### Resumo

```
══════════════════════════════════════════════════════════════
✅ MODELO GERADO - {Model}
══════════════════════════════════════════════════════════════

📁 Arquivos Criados:
- app/models/{model}.py

📊 Estrutura da Tabela:
| Coluna | Tipo | Restrições |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL, INDEX |
| slug | VARCHAR(255) | UNIQUE, INDEX |
| description | TEXT | NULLABLE |
| price | NUMERIC(10,2) | DEFAULT 0.00, CHECK >= 0 |
| quantity | INTEGER | DEFAULT 0 |
| is_active | BOOLEAN | DEFAULT true, INDEX |
| category_id | UUID | FK -> categories.id |
| created_at | DATETIME | DEFAULT now() |
| updated_at | DATETIME | DEFAULT now(), ON UPDATE |

🔗 Relações:
- category: ManyToOne -> Category
- order_items: OneToMany -> OrderItem

🔧 Comandos:
# Gerar migração
alembic revision --autogenerate -m "Create {model}s table"

# Aplicar
alembic upgrade head
```
