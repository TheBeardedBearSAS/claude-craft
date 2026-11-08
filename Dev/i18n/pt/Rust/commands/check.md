---
description: "Auditoria Rust/Axum por eixo: architecture, code-quality, security, testing, ou all (agregado com pontuação)"
argument-hint: "<architecture|code-quality|security|testing|all> [caminho]"
---

# Verificação Rust

## Argumentos

$ARGUMENTS

O primeiro argumento é o eixo; o restante (por exemplo, o caminho de um projeto) é repassado sem alteração. Sem eixo, execute `all`.

| Eixo | Checklist a seguir |
|------|--------------------|
| `architecture` | `.claude/references/rust/checks/architecture.md` |
| `code-quality` | `.claude/references/rust/checks/code-quality.md` |
| `security` | `.claude/references/rust/checks/security.md` |
| `testing` | `.claude/references/rust/checks/testing.md` |
| `all` | `.claude/references/rust/checks/all.md`: os 4 eixos e depois um relatório consolidado pontuado sobre 100 |

## MISSÃO

1. Leia o primeiro argumento. Se não corresponder a nenhum dos 5 eixos acima, liste-os com um exemplo (`/rust:check security crates/api`) e pare.
2. Leia o arquivo de checklist desse eixo e siga-o passo a passo. Nesse arquivo, `$ARGUMENTS` designa os argumentos que vêm depois do eixo.
3. Produza o relatório no formato de saída definido pela checklist.

Exemplos: `/rust:check architecture`, `/rust:check testing ./crates/api`, `/rust:check all`.
