# Plugin example — `lint-custom`

> **Status** : DRAFT scaffold P3-29.

Enforce custom lint rules (ex : "no direct DB access in controllers") during `/team:audit` and pre-commit.

## Usage

```bash
claude-craft plugin install lint-custom
claude-craft plugin config lint-custom
```

Configure rules in `.claude/plugins/lint-custom.json` :

```json
{
  "rules": [
    {
      "id": "no-db-in-controller",
      "pattern": "(DB::|EntityManager)",
      "paths": ["src/Controller/**"],
      "severity": "error"
    }
  ]
}
```

## Hooks utilisés

- `beforeAudit` : charge les règles, ajoute les findings au rapport
- `onReport` : injecte une section "Custom Lint" dans le rapport

## Files

```
src/
├── index.ts                  # Export
├── config.schema.json        # JSON Schema config
├── hooks/
│   └── beforeAudit.ts
└── lint-engine.ts
```

## TODO avant v1.0

- [ ] Implémenter `lint-engine.ts` (regex + AST optionnel)
- [ ] Tests Vitest (coverage ≥ 80%)
- [ ] Release NPM `claude-craft-plugin-lint-custom@1.0.0`
