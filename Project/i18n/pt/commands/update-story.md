---
description: Atualizar uma User Story
argument-hint: [arguments]
---

# Atualizar uma User Story

Modificar informações de uma User Story existente.

## Argumentos

$ARGUMENTS (formato: US-XXX [campo] [valor])
- **US-ID** (obrigatório): ID da User Story (ex: US-001)
- **Campo** (opcional): Campo a modificar
- **Valor** (opcional): Novo valor

## Campos Modificáveis

| Campo | Descrição | Exemplo |
|-------|-------------|---------|
| `name` | Nome da US | "Novo nome" |
| `points` | Story points | 1, 2, 3, 5, 8 |
| `epic` | EPIC pai | EPIC-002 |
| `persona` | Persona relacionada | P-001 |
| `story` | Texto da US | "Como..." |
| `criteria` | Critérios de aceitação | (modo interativo) |

## Processo

### Modo Interativo (sem argumentos de campo)

```
/project:update-story US-001
```

Exibir informações e oferecer modificações:

```
📖 US-001: Login de usuário

Campos atuais:
1. Nome: Login de usuário
2. EPIC: EPIC-001
3. Pontos: 5
4. Persona: P-001 (Usuário Padrão)
5. Story: Como usuário, eu quero...
6. Critérios de aceitação: [3 critérios]

Qual campo modificar? (1-6, ou 'q' para sair)
>
```

### Modo Direto

```
/project:update-story US-001 points 8
```

### Modificar Critérios de Aceitação

No modo interativo, opção para:
- Adicionar um critério
- Modificar critério existente
- Deletar um critério

```
Critérios de aceitação atuais:
1. CA-1: Login com email/senha
2. CA-2: Mensagem de erro em falha
3. CA-3: Redirecionamento após sucesso

Ação? (a)dicionar, (m)odificar, (d)eletar, (q)uit
> a

Novo critério (formato Gherkin):
GIVEN:
WHEN:
THEN:
```

### Etapas

1. Validar que US existe
2. Ler arquivo atual
3. Modificar campo solicitado
4. Atualizar data de modificação
5. Salvar arquivo
6. Atualizar EPIC pai se alterado
7. Atualizar índice

## Formato de Saída

```
✅ User Story atualizada!

📖 US-001: Login de usuário

Modificação:
  Pontos: 5 → 8

⚠️ Aviso: 8 pontos é o máximo recomendado.
   Considere dividir esta US se for muito complexa.

Arquivo: project-management/backlog/user-stories/US-001-user-login.md
```

## Mudança de EPIC

Se alterando EPIC pai:

```
✅ User Story movida!

📖 US-001: Login de usuário

Modificação:
  EPIC: EPIC-001 → EPIC-002

Atualizações:
  - EPIC-001: US removida da lista
  - EPIC-002: US adicionada à lista
  - Índice: Atualizado
```

## Exemplos

```
# Modo interativo
/project:update-story US-001

# Alterar pontos
/project:update-story US-001 points 3

# Alterar EPIC
/project:update-story US-001 epic EPIC-002

# Alterar nome
/project:update-story US-001 name "Login de usuário com SSO"
```

## Validação

- Pontos: Fibonacci (1, 2, 3, 5, 8)
- Se pontos > 8: Aviso para dividir
- EPIC: Deve existir
- Persona: Deve estar definida em personas.md
