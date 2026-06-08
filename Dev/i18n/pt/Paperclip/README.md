# Paperclip — Integração Claude-Craft

> **Paperclip**: orquestração open-source para empresas zero-humanas.
> Docs: https://docs.paperclip.ing/ · Repo: https://github.com/paperclipai/paperclip · License: MIT

Este diretório contém as regras, comandos, skills e templates do Claude-Craft para trabalhar com Paperclip — tanto como **contribuidor** de uma base de código Paperclip quanto como **operador** usando Paperclip com Claude Code como adaptador.

## Stack

| Tool | Version |
|---|---|
| Node.js | 20+ (LTS) |
| TypeScript | 5.x (strict) |
| pnpm | 9.15+ |
| React | 19+ (web UI) |
| Vitest | 4.1+ |
| PostgreSQL | 15+ (or embedded for dev) |
| Paperclip | 2026.529.0+ |

## O que há aqui

```
Paperclip/
├── CLAUDE.md.template
├── README.md                   (este arquivo)
├── rules/                      # 7 arquivos de regras (arquitetura, padrões, ferramentas, testes, qualidade, segurança, protocolo de adaptador)
├── commands/                   # 8 comandos slash (check-*, generate-*, setup-company)
├── templates/                  # Scaffolds de adaptador + agent-config
├── checklists/                 # pre-commit, nova feature, novo adaptador
├── agents/                     # paperclip-reviewer
└── skills/                     # 6 skills sob demanda
```

## Comandos

| Comando | Propósito |
|---|---|
| `/paperclip:check-compliance` | Auditoria completa (Arquitetura + Qualidade + Testes + Segurança + Protocolo de adaptador), pontuação /100 |
| `/paperclip:check-architecture` | Divisão de duas camadas + limites de módulos + cobertura de log de atividades |
| `/paperclip:check-code-quality` | Rigor TypeScript, lint, complexidade, higiene de logging |
| `/paperclip:check-testing` | Cobertura, testes de contrato de adaptador, isolamento entre tenants |
| `/paperclip:check-security` | Tenancy, segredos, aprovações, orçamentos, canal de adaptador assinado |
| `/paperclip:generate-adapter` | Criar scaffold de um adaptador (local / process / http) |
| `/paperclip:generate-agent-config` | Gerar um `agent.yaml` com orçamento + aprovações |
| `/paperclip:setup-company` | Inicializar uma nova empresa Paperclip de ponta a ponta |

## Instalação

### Via Makefile (a partir de um checkout do claude-craft)

```bash
make install-paperclip TARGET=/path/to/my/paperclip-project RULES_LANG=en
```

### Via script

```bash
./Dev/scripts/install-paperclip-rules.sh --lang=en /path/to/my/paperclip-project
```

### Flags

`--install` · `--update` · `--force` · `--preserve-config` · `--dry-run` · `--backup` · `--interactive` · `--lang=<en|fr|es|de|pt>`

## Invariantes de governança (não-negociáveis)

- Adaptadores nunca mantêm estado de governança (orçamentos, aprovações, permissões são somente do plano de controle).
- Orçamentos são limites rígidos. Ultrapassagens silenciosas nunca são aceitáveis.
- Aprovações bloqueiam a execução do adaptador até que o plano de controle retorne uma decisão.
- Toda mutação do DB emite um evento de atividade. O log de atividades é somente para anexar (append-only).
- `companyId` sempre deriva da sessão autenticada.
- Plugins declaram capacidades mínimas; o host rejeita chamadas fora do escopo com `CapabilityDeniedError`.
- Endpoints públicos rodam atrás de TLS 1.3; autenticação de operador via Better Auth com `BETTER_AUTH_SECRET` rotacionado.

## Links

- Documentação Paperclip: https://docs.paperclip.ing/
- Repositório Paperclip: https://github.com/paperclipai/paperclip
- Claude-Craft: https://github.com/the-bearded-cto/claude-craft
