# Paperclip — Claude-Craft Integration

> **Paperclip**: Open-Source-Orchestrierung für Unternehmen ohne menschliches Personal.
> Docs: https://docs.paperclip.ing/ · Repo: https://github.com/paperclipai/paperclip · License: MIT

Dieses Verzeichnis enthält die Claude-Craft-Regeln, -Befehle, -Skills und -Templates für die Arbeit mit Paperclip — sowohl als **Contributor** zu einer Paperclip-Codebasis als auch als **Operator**, der Paperclip mit Claude Code als Adapter verwendet.

## Stack

| Tool | Version |
|---|---|
| Node.js | 22+ LTS |
| TypeScript | 5.x (strict) |
| pnpm | 9.15+ |
| React | 19+ (web UI) |
| Vitest | 4.1+ |
| PostgreSQL | 15+ (oder embedded für dev) |
| Paperclip | 2026.609.0+ |

## Inhalt

```
Paperclip/
├── CLAUDE.md.template
├── README.md                   (diese Datei)
├── rules/                      # 7 Regeldateien (Architektur, Standards, Tooling, Testing, Qualität, Sicherheit, Adapter-Protokoll)
├── commands/                   # 8 Slash-Befehle (check-*, generate-*, setup-company)
├── templates/                  # Adapter + agent-config Vorlagen
├── checklists/                 # pre-commit, new-feature, new-adapter
├── agents/                     # paperclip-reviewer
└── skills/                     # 6 On-Demand-Skills
```

## Befehle

| Befehl | Zweck |
|---|---|
| `/paperclip:check-compliance` | Vollständiges Audit (Architektur + Qualität + Tests + Sicherheit + Adapter-Protokoll), Score /100 |
| `/paperclip:check-architecture` | Two-Layer-Trennung + Modulgrenzen + Activity-Log-Abdeckung |
| `/paperclip:check-code-quality` | TypeScript-Strenge, Lint, Komplexität, Logging-Hygiene |
| `/paperclip:check-testing` | Coverage, Adapter-Vertragstests, mandantenübergreifende Isolation |
| `/paperclip:check-security` | Tenancy, Secrets, Approvals, Budgets, signierter Adapter-Channel |
| `/paperclip:generate-adapter` | Generiert einen Adapter (local / process / http) |
| `/paperclip:generate-agent-config` | Generiert eine `agent.yaml` mit Budget + Approvals |
| `/paperclip:setup-company` | Bootstrapped eine neue Paperclip-Company End-to-End |

## Installation

### Via Makefile (aus einem claude-craft Checkout)

```bash
make install-paperclip TARGET=/path/to/my/paperclip-project RULES_LANG=en
```

### Via Skript

```bash
./Dev/scripts/install-paperclip-rules.sh --lang=en /path/to/my/paperclip-project
```

### Flags

`--install` · `--update` · `--force` · `--preserve-config` · `--dry-run` · `--backup` · `--interactive` · `--lang=<en|fr|es|de|pt>`

## Governance-Invarianten (nicht verhandelbar)

- Adapter halten niemals Governance-Zustand (Budgets, Approvals, Permissions sind ausschließlich Control-Plane).
- Budgets sind harte Grenzen. Stille Überschreitungen sind niemals akzeptabel.
- Approvals blockieren die Adapter-Ausführung, bis die Control-Plane eine Entscheidung zurückgibt.
- Jede DB-Mutation emittiert ein Activity-Event. Das Activity-Log ist append-only.
- `companyId` leitet sich immer aus der authentifizierten Session ab.
- Plugins deklarieren minimale Capabilities; der Host lehnt Out-of-Scope-Aufrufe mit `CapabilityDeniedError` ab.
- Öffentliche Endpoints laufen hinter TLS 1.3; Operator-Auth via Better Auth mit rotiertem `BETTER_AUTH_SECRET`.

## Links

- Paperclip docs: https://docs.paperclip.ing/
- Paperclip repo: https://github.com/paperclipai/paperclip
- Claude-Craft: https://github.com/TheBeardedBearSAS/claude-craft
