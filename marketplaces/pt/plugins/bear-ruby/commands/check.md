---
description: "Auditoria Ruby/Rails por eixo: architecture, code-quality, security, testing, ou all (agregado com pontuação)"
argument-hint: "<architecture|code-quality|security|testing|all> [caminho]"
---

# Verificação Ruby

## Argumentos

$ARGUMENTS

O primeiro argumento é o eixo; o restante (por exemplo, o caminho de um projeto) é repassado sem alteração. Sem eixo, execute `all`.

| Eixo | Checklist a seguir |
|------|--------------------|
| `architecture` | `${CLAUDE_PLUGIN_ROOT}/references/ruby/checks/architecture.md` |
| `code-quality` | `${CLAUDE_PLUGIN_ROOT}/references/ruby/checks/code-quality.md` |
| `security` | `${CLAUDE_PLUGIN_ROOT}/references/ruby/checks/security.md` |
| `testing` | `${CLAUDE_PLUGIN_ROOT}/references/ruby/checks/testing.md` |
| `all` | `${CLAUDE_PLUGIN_ROOT}/references/ruby/checks/all.md`: os 4 eixos e depois um relatório consolidado pontuado sobre 100 |

## MISSÃO

1. Leia o primeiro argumento. Se não corresponder a nenhum dos 5 eixos acima, liste-os com um exemplo (`/bear-ruby:check security app/`) e pare.
2. Leia o arquivo de checklist desse eixo e siga-o passo a passo. Nesse arquivo, `$ARGUMENTS` designa os argumentos que vêm depois do eixo.
3. Produza o relatório no formato de saída definido pela checklist.

Exemplos: `/bear-ruby:check architecture`, `/bear-ruby:check testing ./app`, `/bear-ruby:check all`.
