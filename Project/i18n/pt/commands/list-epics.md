---
description: Listar EPICs
argument-hint: [arguments]
---

# Listar EPICs

Exibir a lista de todos os EPICs com seu status e progresso.

## Argumentos

$ARGUMENTS (opcional, formato: [status] [prioridade])
- **Status** (opcional): todo, in-progress, blocked, done, all (padrão: all)
- **Prioridade** (opcional): high, medium, low

## Processo

### Etapa 1: Ler EPICs

1. Escanear diretório `project-management/backlog/epics/`
2. Ler cada arquivo EPIC-XXX-*.md
3. Extrair metadados de cada EPIC

### Etapa 2: Filtrar (se argumentos)

Aplicar filtros solicitados:
- Por status
- Por prioridade

### Etapa 3: Calcular estatísticas

Para cada EPIC:
- Contar USs totais
- Contar USs por status
- Calcular porcentagem de progresso

### Etapa 4: Exibir

Gerar tabela formatada com resultados.

## Formato de Saída

```
📋 EPICs do Projeto

| ID | Nome | Status | Prioridade | US | Progresso |
|----|-----|--------|------------|-----|-------------|
| EPIC-001 | Autenticação | 🟡 Em Andamento | High | 5 | ████░░░░░░ 40% |
| EPIC-002 | Catálogo | 🔴 A Fazer | Medium | 8 | ░░░░░░░░░░ 0% |
| EPIC-003 | Carrinho | 🔴 A Fazer | High | 6 | ░░░░░░░░░░ 0% |

───────────────────────────────────────────────────
Resumo: 3 EPICs | 🔴 2 A Fazer | 🟡 1 Em Andamento | 🟢 0 Concluído
```

## Formato Compacto (se muitos EPICs)

```
📋 EPICs (12 total)

🔴 A Fazer (5):
   EPIC-002, EPIC-003, EPIC-004, EPIC-007, EPIC-010

🟡 Em Andamento (4):
   EPIC-001 (40%), EPIC-005 (60%), EPIC-008 (25%), EPIC-011 (80%)

⏸️ Bloqueado (1):
   EPIC-006 - Bloqueado por dependência externa

🟢 Concluído (2):
   EPIC-009 ✓, EPIC-012 ✓
```

## Exemplos

```
# Listar todos os EPICs
/project:list-epics

# Listar EPICs em andamento
/project:list-epics in-progress

# Listar EPICs de alta prioridade
/project:list-epics all high

# Listar EPICs bloqueados
/project:list-epics blocked
```

## Detalhes do EPIC

Para ver detalhes de um EPIC específico, sugerir:
```
Ver detalhes: cat project-management/backlog/epics/EPIC-001-*.md
```
