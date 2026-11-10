#!/usr/bin/env bash
# Notification : envoie une notification Slack quand Claude attend l'utilisateur.
# Payload JSON lu sur stdin. Sans SLACK_WEBHOOK_URL (ou sans jq/node), ne fait rien.
#
# SETUP : définir SLACK_WEBHOOK_URL (https://api.slack.com/apps -> Incoming Webhooks)
set -u
# shellcheck source=lib/hook-io.sh
. "$(dirname "${BASH_SOURCE[0]}")/lib/hook-io.sh"

[ -n "${SLACK_WEBHOOK_URL:-}" ] || exit 0
hook_has_parser || exit 0
hook_input
MESSAGE=$(hook_get message)
NOTIFICATION_TYPE=$(hook_get notification_type)

case "$NOTIFICATION_TYPE" in
  permission_prompt) TEXT=":bell: Claude Code needs your attention: ${MESSAGE:-permission requested}" ;;
  idle_prompt) TEXT=":sleeping: Claude Code has been idle for 60+ seconds" ;;
  *) TEXT=":robot_face: Claude Code: ${MESSAGE:-notification}" ;;
esac

if hook_has_jq; then
  PAYLOAD=$(jq -cn --arg text "$TEXT" '{text: $text}')
else
  PAYLOAD=$(node -e 'process.stdout.write(JSON.stringify({text: process.argv[1]}))' "$TEXT")
fi
curl -s -X POST -H 'Content-type: application/json' --data "$PAYLOAD" "$SLACK_WEBHOOK_URL" >/dev/null 2>&1 || true
exit 0
