---
description: "Auditoria React Native por eixo: architecture, code-quality, security, testing, ou all (agregado com pontuação)"
argument-hint: "<architecture|code-quality|security|testing|all> [caminho]"
---

# Verificação React Native

## Argumentos

$ARGUMENTS

O primeiro argumento é o eixo; o restante (por exemplo, o caminho de um projeto) é repassado sem alteração. Sem eixo, execute `all`.

| Eixo | Checklist a seguir |
|------|--------------------|
| `architecture` | `.claude/references/reactnative/checks/architecture.md` |
| `code-quality` | `.claude/references/reactnative/checks/code-quality.md` |
| `security` | `.claude/references/reactnative/checks/security.md` |
| `testing` | `.claude/references/reactnative/checks/testing.md` |
| `all` | `.claude/references/reactnative/checks/all.md`: os 4 eixos e depois um relatório consolidado pontuado sobre 100 |

## MISSÃO

1. Leia o primeiro argumento. Se não corresponder a nenhum dos 5 eixos acima, liste-os com um exemplo (`/reactnative:check security src/`) e pare.
2. Leia o arquivo de checklist desse eixo e siga-o passo a passo. Nesse arquivo, `$ARGUMENTS` designa os argumentos que vêm depois do eixo.
3. Produza o relatório no formato de saída definido pela checklist.

Exemplos: `/reactnative:check architecture`, `/reactnative:check testing ./app`, `/reactnative:check all`.
