#!/bin/bash
# Notification hook: Send Slack notification when permission is requested
# This runs on Notification event with matcher "permission_prompt"
#
# SETUP: Set SLACK_WEBHOOK_URL environment variable
# Get webhook URL from: https://api.slack.com/apps -> Incoming Webhooks
set -e

# Read JSON input from stdin
INPUT=$(cat)
MESSAGE=$(echo "$INPUT" | jq -r '.message // "Claude Code notification"')
NOTIFICATION_TYPE=$(echo "$INPUT" | jq -r '.notification_type // "unknown"')

# Only proceed if webhook URL is configured
if [ -z "$SLACK_WEBHOOK_URL" ]; then
    exit 0
fi

# Format message based on notification type
case "$NOTIFICATION_TYPE" in
    permission_prompt)
        SLACK_MESSAGE=":bell: Claude Code needs your attention: $MESSAGE"
        ;;
    idle_prompt)
        SLACK_MESSAGE=":sleeping: Claude Code has been idle for 60+ seconds"
        ;;
    *)
        SLACK_MESSAGE=":robot_face: Claude Code: $MESSAGE"
        ;;
esac

# Send to Slack (safe JSON payload via jq)
PAYLOAD=$(jq -n --arg text "$SLACK_MESSAGE" '{text: $text}')
curl -s -X POST \
    -H 'Content-type: application/json' \
    --data "$PAYLOAD" \
    "$SLACK_WEBHOOK_URL" > /dev/null 2>&1 || true

exit 0
