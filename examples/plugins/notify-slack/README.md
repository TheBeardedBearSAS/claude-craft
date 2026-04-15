# Plugin example — `notify-slack`

> **Status** : DRAFT scaffold P3-29.

Send Slack notifications on key Claude Craft events (audit done, release, errors).

## Configuration

```bash
export SLACK_WEBHOOK_URL="https://hooks.slack.com/services/XXX/YYY/ZZZ"
claude-craft plugin install notify-slack
```

Or via `.claude/plugins/notify-slack.json` :

```json
{
  "channels": {
    "audit": "#quality",
    "release": "#releases",
    "errors": "#alerts"
  },
  "events": ["afterAudit", "afterRelease", "onCommandError"]
}
```

## Hooks

- `afterAudit` : POST summary avec score
- `afterRelease` : POST changelog link
- `onCommandError` : POST stack trace (si non sensible)

## Sécurité

- Le webhook URL n'est JAMAIS écrit dans les reports
- Les messages sont filtrés pour ne pas exposer de PII
- Rate limit : 10 messages/minute max
