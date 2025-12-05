# Atualizar um EPIC

Modificar informações de um EPIC existente.

## Argumentos

$ARGUMENTS (formato: EPIC-XXX [campo] [valor])
- **EPIC-ID** (obrigatório): ID do EPIC (ex: EPIC-001)
- **Campo** (opcional): Campo a modificar
- **Valor** (opcional): Novo valor

## Campos Modificáveis

| Campo | Descrição | Exemplo |
|-------|-------------|---------|
| `name` | Nome do EPIC | "Novo nome" |
| `priority` | Prioridade | High, Medium, Low |
| `mmf` | Minimum Marketable Feature | "Descrição do MMF" |
| `description` | Descrição | "Nova descrição" |

## Processo

### Modo Interativo (sem argumentos de campo)

Se apenas ID for fornecido:

```
/project:update-epic EPIC-001
```

Exibir informações atuais e oferecer modificações:

```
📋 EPIC-001: Sistema de autenticação

Campos atuais:
1. Nome: Sistema de autenticação
2. Prioridade: High
3. MMF: Permitir que usuários façam login
4. Descrição: [...]

Qual campo modificar? (1-4, ou 'q' para sair)
>
```

### Modo Direto (com argumentos)

```
/project:update-epic EPIC-001 priority Medium
```

Modificar diretamente o campo especificado.

### Etapas

1. Validar que EPIC existe
2. Ler arquivo atual
3. Modificar campo solicitado
4. Atualizar data de modificação
5. Salvar arquivo
6. Atualizar índice se necessário

## Formato de Saída

```
✅ EPIC atualizado!

📋 EPIC-001: Sistema de autenticação

Modificação:
  Prioridade: High → Medium

Arquivo: project-management/backlog/epics/EPIC-001-authentication-system.md
```

## Exemplos

```
# Modo interativo
/project:update-epic EPIC-001

# Alterar nome
/project:update-epic EPIC-001 name "Autenticação e Autorização"

# Alterar prioridade
/project:update-epic EPIC-001 priority Low

# Alterar MMF
/project:update-epic EPIC-001 mmf "Permitir SSO e 2FA"
```

## Validação

- Campo deve ser modificável
- Prioridade deve ser High, Medium ou Low
- Nome não pode estar vazio
