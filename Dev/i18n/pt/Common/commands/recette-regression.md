---
description: Ver e gerenciar o registro de testes de regressao QA Recette
argument-hint: [--list|--stats|--check] [--status=<active|verified|obsolete>] [--source=<story-id>]
---

# QA Recette Regression - Registro de Testes de Regressao

Ver e gerenciar o registro de testes de regressao. Navegar pelos testes registrados, verificar pontuacoes de estabilidade e detectar violacoes da Regra de Ouro. Implementa a **Regra de Ouro**: Um bug corrigido NUNCA deve reaparecer.

## Argumentos

**$ARGUMENTS**

- `--list` : Listar todos os testes de regressao do registro
- `--stats` : Mostrar pontuacao de estabilidade e analise de tendencia
- `--check` : Executar testes de regressao e detectar violacoes
- `--status=<status>` : Filtrar por status (active, verified, obsolete)
- `--source=<id>` : Filtrar por story/sprint de origem (ex: US-001)
- `--trend` : Mostrar dados de tendencia historica
- `--format=<type>` : Formato de saida (table, yaml, json) — padrao: table

## Funcionalidades Principais

| Funcionalidade | Descricao |
|----------------|-----------|
| **Navegacao do Registro** | Listar todos os testes de regressao com metadados |
| **Pontuacao de Estabilidade** | Pontuacao de 0-100 baseada na taxa de aprovacao dos testes |
| **Analise de Tendencia** | Tendencia historica da estabilidade de regressao |
| **Verificacao Regra de Ouro** | Alerta sobre falhas de testes de regressao |
| **Filtragem por Origem** | Filtrar testes por story ou sprint de origem |
| **Gestao de Status** | Acompanhar testes ativos, verificados e obsoletos |

## Processo

### 1. Carregamento do Registro

```
┌─────────────────────────────────────────┐
│  1. load_registry()                     │
│     - Ler .recette/regression/          │
│       registry.yaml                     │
│     - Carregar metadados dos testes     │
│     - Aplicar filtros                   │
└─────────────────────────────────────────┘
```

### 2. Lista do Registro (--list)

```
┌──────────┬─────────────────────────────────┬──────────┬──────────────────────────────┬──────────┐
│ ID       │ Erro                            │ Origem   │ Caminho do Teste             │ Status   │
├──────────┼─────────────────────────────────┼──────────┼──────────────────────────────┼──────────┤
│ REG-001  │ Validacao login nao exibida     │ US-001   │ tests/Unit/Auth/LoginTest.php │ verified │
│ REG-002  │ Timeout API em /api/users       │ US-001   │ tests/Func/Api/UsersTest.php  │ active   │
│ REG-003  │ Erro calculo total carrinho     │ US-015   │ tests/Unit/Cart/TotalTest.php │ active   │
└──────────┴─────────────────────────────────┴──────────┴──────────────────────────────┴──────────┘
```

### 3. Pontuacao de Estabilidade (--stats)

```
Pontuacao de Estabilidade de Regressao: 94/100

  Detalhamento:
    Testes ativos:      12
    Testes verificados:  8
    Testes obsoletos:    2
    Total:              22

  Ultimas 5 execucoes:
    ████████████████████  100% (2026-02-01)
    ████████████████░░░░   88% (2026-01-31)
    ████████████████████  100% (2026-01-30)
    ████████████████████  100% (2026-01-29)
    ██████████████░░░░░░   75% (2026-01-28)

  Tendencia: ↑ Melhorando (+6 pts em 5 execucoes)
```

### 4. Verificacao Regra de Ouro (--check)

```
Verificacao Regra de Ouro: 1 VIOLACAO DETECTADA

  ⚠ REG-002: Timeout API em /api/users
    Origem:  US-001
    Teste:   tests/Functional/Api/UsersTest.php
    Status:  FALHANDO (passava em 2026-01-30)
    Acao:    Bug reapareceu — correcao imediata necessaria

  ✓ REG-001: Validacao login — APROVADO
  ✓ REG-003: Total carrinho — APROVADO
  ...

  Resumo: 11/12 testes ativos aprovados (91.7%)
```

## Fontes de Dados

| Fonte | Caminho | Descricao |
|-------|---------|-----------|
| Registro | `.recette/regression/registry.yaml` | Todos os testes de regressao registrados |
| Testes | `.recette/regression/tests/` | Arquivos de testes gerados |
| Historico | `.recette/metrics/history.jsonl` | Dados historicos de execucao |

## Exemplos

```bash
# Listar todos os testes de regressao
/qa:recette-regression --list

# Mostrar pontuacao de estabilidade
/qa:recette-regression --stats

# Executar verificacao de regressao (detectar violacoes)
/qa:recette-regression --check

# Filtrar por story de origem
/qa:recette-regression --list --source=US-001

# Filtrar por status
/qa:recette-regression --list --status=active

# Mostrar tendencia historica
/qa:recette-regression --stats --trend

# Saida em JSON
/qa:recette-regression --list --format=json
```

## Estrutura de Saida

```
.recette/regression/
├── registry.yaml          # Registro de testes de regressao
└── tests/
    ├── Unit/              # Testes de regressao unitarios
    ├── Functional/        # Testes de regressao funcionais
    └── Behat/             # Features de regressao Behat

.recette/metrics/
└── history.jsonl          # Dados historicos para analise de tendencia
```

## Comandos Relacionados

| Comando | Descricao |
|---------|-----------|
| `/qa:recette` | Executar testes de aceitacao |
| `/qa:recette-fix` | Corrigir bugs de uma sessao |
| `/qa:recette-status` | Mostrar status da sessao |
| `/qa:recette-report` | Gerar relatorio |

## Mensagens de Erro

| Erro | Solucao |
|------|---------|
| "Registro nao encontrado" | Execute `/qa:recette` primeiro para gerar um registro |
| "Sem testes de regressao" | Nenhum erro detectado em execucoes anteriores |
| "Violacao da Regra de Ouro" | Um bug reapareceu — execute `/qa:recette-fix` |
| "Arquivo historico ausente" | Execute ao menos 2 sessoes recette para tendencias |

## Melhores Praticas

1. **Verifique regularmente** : Execute `--check` antes de cada deploy
2. **Monitore tendencias** : Use `--stats --trend` para acompanhar a estabilidade
3. **Corrija violacoes imediatamente** : Violacoes indicam bugs reintroduzidos
4. **Limpe testes obsoletos** : Marque como obsoletos testes de funcionalidades removidas
5. **Filtre por origem** : Examine testes de regressao por story para analise direcionada
