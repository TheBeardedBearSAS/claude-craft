# Adicionar uma User Story

Criar uma nova User Story e associá-la a um EPIC.

## Argumentos

$ARGUMENTS (formato: EPIC-XXX "Nome US" [pontos])
- **EPIC-ID** (obrigatório): ID do EPIC pai (ex: EPIC-001)
- **Nome** (obrigatório): Título da User Story
- **Pontos** (opcional): Story points em Fibonacci (1, 2, 3, 5, 8)

## Processo

### Etapa 1: Analisar argumentos

Extrair de $ARGUMENTS:
- ID do EPIC
- Nome da User Story
- Story points (se fornecidos)

### Etapa 2: Validar EPIC

1. Verificar se EPIC existe em `project-management/backlog/epics/`
2. Se não encontrado, exibir erro com EPICs disponíveis

### Etapa 3: Gerar ID

1. Ler arquivos em `project-management/backlog/user-stories/`
2. Encontrar o último ID usado (formato US-XXX)
3. Incrementar para obter o novo ID

### Etapa 4: Coletar informações

Perguntar ao usuário:
- **Persona**: Quem é o usuário? (P-XXX ou descrição)
- **Ação**: O que ele quer fazer?
- **Benefício**: Por que ele quer isso?
- **Critérios de aceitação**: Pelo menos 2 no formato Gherkin
- **Pontos**: Se não fornecido, estimar (Fibonacci: 1, 2, 3, 5, 8)

### Etapa 5: Criar o arquivo

1. Usar template `Scrum/templates/user-story.md`
2. Substituir placeholders:
   - `{ID}`: ID gerado
   - `{NOM}`: Nome da US
   - `{EPIC_ID}`: ID do EPIC pai
   - `{SPRINT}`: "Backlog" (não atribuído)
   - `{POINTS}`: Story points
   - `{PERSONA}`: Persona identificada
   - `{PERSONA_ID}`: ID da Persona
   - `{ACTION}`: Ação desejada
   - `{BENEFICE}`: Benefício esperado
   - `{DATE}`: Data atual (YYYY-MM-DD)

3. Adicionar critérios de aceitação no formato Gherkin

4. Criar arquivo: `project-management/backlog/user-stories/US-{ID}-{slug}.md`

### Etapa 6: Atualizar EPIC

1. Ler arquivo do EPIC
2. Adicionar US à tabela de User Stories
3. Atualizar progresso
4. Salvar

### Etapa 7: Atualizar índice

1. Ler `project-management/backlog/index.md`
2. Adicionar US à seção "Backlog Priorizado"
3. Atualizar contadores
4. Salvar

## Formato de Saída

```
✅ User Story criada com sucesso!

📖 US-{ID}: {NAME}
   EPIC: {EPIC_ID}
   Status: 🔴 To Do
   Pontos: {POINTS}
   Arquivo: project-management/backlog/user-stories/US-{ID}-{slug}.md

Próximas etapas:
  /project:move-story US-{ID} sprint-X    # Atribuir ao sprint
  /project:add-task US-{ID} "[BE] ..." 4h # Adicionar tarefas
```

## Exemplo

```
/project:add-story EPIC-001 "Login de usuário" 5
```

Cria:
- `project-management/backlog/user-stories/US-001-user-login.md`

## Validação INVEST

Verificar se US segue INVEST:
- **I**ndependente: Pode ser desenvolvida sozinha
- **N**egociável: Detalhes podem ser discutidos
- **V**aliosa: Traz valor para persona
- **E**stimável: Pode ser estimada (pontos fornecidos)
- **S**mall: ≤ 8 pontos (caso contrário, sugerir divisão)
- **T**estável: Possui critérios de aceitação claros
