---
description: "Auditoria Laravel por eixo: architecture, code-quality, security, testing, ou all (agregado com pontuação)"
argument-hint: "<architecture|code-quality|security|testing|all> [caminho]"
---

# Verificação Laravel

## Argumentos

$ARGUMENTS

O primeiro argumento é o eixo; o restante (por exemplo, o caminho de um projeto) é repassado sem alteração. Sem eixo, execute `all`.

| Eixo | Checklist a seguir |
|------|--------------------|
| `architecture` | `${CLAUDE_PLUGIN_ROOT}/references/laravel/checks/architecture.md` |
| `code-quality` | `${CLAUDE_PLUGIN_ROOT}/references/laravel/checks/code-quality.md` |
| `security` | `${CLAUDE_PLUGIN_ROOT}/references/laravel/checks/security.md` |
| `testing` | `${CLAUDE_PLUGIN_ROOT}/references/laravel/checks/testing.md` |
| `all` | `${CLAUDE_PLUGIN_ROOT}/references/laravel/checks/all.md`: os 4 eixos e depois um relatório consolidado pontuado sobre 100 |

## MISSÃO

1. Leia o primeiro argumento. Se não corresponder a nenhum dos 5 eixos acima, liste-os com um exemplo (`/bear-laravel:check security src/`) e pare.
2. Leia o arquivo de checklist desse eixo e siga-o passo a passo. Nesse arquivo, `$ARGUMENTS` designa os argumentos que vêm depois do eixo.
3. Produza o relatório no formato de saída definido pela checklist.

Exemplos: `/bear-laravel:check architecture`, `/bear-laravel:check testing ./app`, `/bear-laravel:check all`.
