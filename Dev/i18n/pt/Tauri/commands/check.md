---
description: "Auditoria Tauri v2 por eixo: architecture, code-quality, security, testing, ou all (agregado com pontuação)"
argument-hint: "<architecture|code-quality|security|testing|all> [caminho]"
---

# Verificação Tauri

## Argumentos

$ARGUMENTS

O primeiro argumento é o eixo; o restante (por exemplo, um caminho de projeto) é repassado sem alteração. Sem eixo, execute `all`.

| Eixo | Checklist a seguir |
|------|--------------------|
| `architecture` | `.claude/references/tauri/checks/architecture.md` |
| `code-quality` | `.claude/references/tauri/checks/code-quality.md` |
| `security` | `.claude/references/tauri/checks/security.md` |
| `testing` | `.claude/references/tauri/checks/testing.md` |
| `all` | `.claude/references/tauri/checks/all.md`: os 4 eixos e depois um relatório consolidado pontuado sobre 100 |

## MISSÃO

1. Leia o primeiro argumento. Se não corresponder a nenhum dos 5 eixos acima, liste-os com um exemplo (`/tauri:check security src-tauri`) e pare.
2. Leia o arquivo de checklist desse eixo e siga-o passo a passo. Nesse arquivo, `$ARGUMENTS` designa os argumentos que vêm depois do eixo.
3. Produza o relatório no formato de saída definido pela checklist.

Exemplos: `/tauri:check architecture`, `/tauri:check testing ./src-tauri`, `/tauri:check all`.
