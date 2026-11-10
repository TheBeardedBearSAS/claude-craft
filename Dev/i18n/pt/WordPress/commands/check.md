---
description: "Auditoria WordPress por eixo: architecture, code-quality, security, testing, ou all (agregado com pontuação)"
argument-hint: "<architecture|code-quality|security|testing|all> [caminho]"
---

# Verificação WordPress

## Argumentos

$ARGUMENTS

O primeiro argumento é o eixo; o restante (por exemplo, um caminho de projeto) é repassado sem alteração. Sem eixo, execute `all`.

| Eixo | Checklist a seguir |
|------|--------------------|
| `architecture` | `.claude/references/wordpress/checks/architecture.md` |
| `code-quality` | `.claude/references/wordpress/checks/code-quality.md` |
| `security` | `.claude/references/wordpress/checks/security.md` |
| `testing` | `.claude/references/wordpress/checks/testing.md` |
| `all` | `.claude/references/wordpress/checks/all.md`: os 4 eixos e depois um relatório consolidado pontuado sobre 100 |

## MISSÃO

1. Leia o primeiro argumento. Se ele não for um dos 5 eixos acima, liste-os com um exemplo (`/wordpress:check security wp-content/plugins/my-plugin`) e pare.
2. Leia o arquivo de checklist desse eixo e siga-o passo a passo. Nesse arquivo, `$ARGUMENTS` representa os argumentos que seguem o eixo.
3. Produza o relatório no formato de saída definido pela checklist.

Exemplos: `/wordpress:check architecture`, `/wordpress:check testing ./my-plugin`, `/wordpress:check all`.
