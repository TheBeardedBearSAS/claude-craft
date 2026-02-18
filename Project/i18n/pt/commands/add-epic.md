---
description: Adicionar um EPIC
argument-hint: [arguments]
---

# Adicionar um EPIC

Criar um novo EPIC no backlog.

## Argumentos

$ARGUMENTS (formato: "Nome EPIC" [prioridade])
- **Nome** (obrigatório): Título do EPIC
- **Prioridade** (opcional): High, Medium, Low (padrão: Medium)

## Modo Plano

> **O modo plano é obrigatório.** Antes de executar, Claude ativa o modo plano para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de realizar qualquer alteração.

## Processo

### Etapa 1: Analisar argumentos

Extrair:
- Nome do EPIC de $ARGUMENTS
- Prioridade (se fornecida, caso contrário Medium)

### Etapa 2: Gerar ID

1. Ler arquivos em `project-management/backlog/epics/`
2. Encontrar o último ID usado (formato EPIC-XXX)
3. Incrementar para obter o novo ID

### Etapa 3: Coletar informações

Perguntar ao usuário (se não fornecido):
- Descrição do EPIC
- MMF (Minimum Marketable Feature)
- Objetivos de negócio (2-3 pontos)
- Critérios de sucesso

### Etapa 4: Criar o arquivo

1. Usar template `Scrum/templates/epic.md`
2. Substituir placeholders:
   - `{ID}`: ID gerado
   - `{NOM}`: Nome do EPIC
   - `{PRIORITE}`: Prioridade escolhida
   - `{MINIMUM_MARKETABLE_FEATURE}`: MMF
   - `{DESCRIPTION}`: Descrição
   - `{DATE}`: Data atual (YYYY-MM-DD)
   - `{OBJECTIF_1}`, `{OBJECTIF_2}`: Objetivos de negócio
   - `{CRITERE_1}`, `{CRITERE_2}`: Critérios de sucesso

3. Criar arquivo: `project-management/backlog/epics/EPIC-{ID}-{slug}.md`

### Etapa 5: Atualizar índice

1. Ler `project-management/backlog/index.md`
2. Adicionar EPIC à tabela de EPICs
3. Atualizar contadores resumidos
4. Salvar

## Formato de Saída

```
✅ EPIC criado com sucesso!

📋 EPIC-{ID}: {NAME}
   Status: 🔴 To Do
   Prioridade: {PRIORITY}
   Arquivo: project-management/backlog/epics/EPIC-{ID}-{slug}.md

Próximas etapas:
  /project:add-story EPIC-{ID} "Nome da User Story"
```

## Exemplo

```
/project:add-epic "Sistema de Autenticação" High
```

Cria:
- `project-management/backlog/epics/EPIC-001-authentication-system.md`

## Validação

- [ ] Nome não está vazio
- [ ] Prioridade é válida (High/Medium/Low)
- [ ] Diretório `project-management/backlog/epics/` existe
- [ ] ID é único
