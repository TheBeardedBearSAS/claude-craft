---
description: Configure and manage Coolify backups
argument-hint: [arguments]
---

# Coolify Backup Configuration

You are a Coolify backup and disaster recovery expert. You must configure backup strategies, test restores, and document recovery procedures for Coolify-managed services.

## Arguments
$ARGUMENTS

Arguments:
- Action: audit, configure, test, restore
- (Optional) Service name or type
- (Optional) S3 provider: backblaze, wasabi, aws, minio

Example: `/coolify:backup audit` or `/coolify:backup configure provider:backblaze` or `/coolify:backup test service:postgres`

## MISSION

### Step 1: Audit Current Backup State

```bash
# Inventory all services
docker ps --format "table {{.Names}}\t{{.Status}}" | sort

# Identify databases
docker ps --filter "ancestor=postgres" --filter "ancestor=mysql" --filter "ancestor=mongo" --filter "ancestor=redis" --format "{{.Names}}"

# Check existing volumes
docker volume ls --format "table {{.Name}}\t{{.Driver}}"

# Current disk usage
df -h /var/lib/docker
du -sh /var/lib/docker/volumes/* 2>/dev/null | sort -rh | head -20
```

```
══════════════════════════════════════════════════════════════
COOLIFY BACKUP AUDIT
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
SERVICE INVENTORY
──────────────────────────────────────────────────────────────

| Service | Type | Data Size | Backup Status |
|---------|------|-----------|---------------|
| {name} | {PostgreSQL/MySQL/Redis/App} | {size} | {configured/missing} |

──────────────────────────────────────────────────────────────
CURRENT BACKUP STATUS
──────────────────────────────────────────────────────────────

| Item | Status | Details |
|------|--------|---------|
| S3 storage | {configured/missing} | {provider name or N/A} |
| DB backups | {active/inactive} | {frequency or N/A} |
| Volume backups | {active/inactive} | {frequency or N/A} |
| Last backup | {date} | {size} |
| Retention | {X days} | {policy or none} |
| Restore tested | {yes/no/never} | {last test date} |
```

### Step 2: Configure S3-Compatible Storage

```
──────────────────────────────────────────────────────────────
S3 STORAGE CONFIGURATION
──────────────────────────────────────────────────────────────

### Provider Selection

| Provider | Monthly Cost (50GB) | Egress | Best For |
|----------|---------------------|--------|----------|
| Backblaze B2 | $0.25 | Free via CF | Budget |
| Wasabi | $0.35 | Free | No egress fees |
| Hetzner | $0.25 | Included | EU compliance |
| AWS S3 | $1.15 | $0.09/GB | AWS ecosystem |
| MinIO | Free (self-host) | N/A | Full control |

### Coolify Configuration
Dashboard > Settings > S3 Storage > Add New:

| Field | Value |
|-------|-------|
| Name | {production-backups} |
| Endpoint | {provider endpoint URL} |
| Bucket | {bucket-name} |
| Region | {region} |
| Access Key | {access-key} |
| Secret Key | {secret-key} |

### Test Connection
→ Click "Test Connection" in Coolify dashboard
→ Verify: test file uploaded and deleted successfully
```

### Step 3: Set Backup Schedule and Retention

```
──────────────────────────────────────────────────────────────
BACKUP SCHEDULE
──────────────────────────────────────────────────────────────

### Database Backups (Coolify Built-in)
For each database service:
Dashboard > Database > Backups

| Database | Frequency | Retention | S3 Destination |
|----------|-----------|-----------|----------------|
| {PostgreSQL} | {cron expression} | {N backups} | {storage name} |
| {MySQL} | {cron expression} | {N backups} | {storage name} |
| {Redis} | {cron expression} | {N backups} | {storage name} |

Common schedules:
- Small project: 0 3 * * *        (daily at 3 AM)
- Production:    0 */6 * * *      (every 6 hours)
- Critical:      0 * * * *        (hourly)

### Volume Backups (Custom)
Configure via Coolify scheduled task or cron:

| Volume | Frequency | Retention | Method |
|--------|-----------|-----------|--------|
| {uploads} | Daily | 14 days | tar + S3 |
| {config} | Weekly | 4 weeks | tar + S3 |

### Retention Policy

| Backup Type | Keep | Estimated Storage |
|-------------|------|-------------------|
| Hourly DB | 24 backups | {size estimate} |
| Daily DB | 30 backups | {size estimate} |
| Weekly volumes | 4 backups | {size estimate} |
| Monthly full | 3 backups | {size estimate} |
| Total | - | {total estimate} |
| Monthly cost | - | {cost estimate} |
```

### Step 4: Test Backup and Restore

```
──────────────────────────────────────────────────────────────
BACKUP VERIFICATION
──────────────────────────────────────────────────────────────

### 1. Verify Backup Exists
\`\`\`bash
# List recent backups in S3
aws s3 ls s3://{bucket}/databases/ --recursive --human-readable | tail -5

# Or via Coolify dashboard
# Database > Backups > View list
\`\`\`

### 2. Download and Verify Integrity
\`\`\`bash
# Download latest backup
aws s3 cp s3://{bucket}/databases/postgresql/{latest}.sql.gz /tmp/

# Verify file is not corrupted
gunzip -t /tmp/{latest}.sql.gz && echo "Integrity OK" || echo "CORRUPTED"
\`\`\`

### 3. Test Database Restore
\`\`\`bash
# Create test database
docker exec {postgres-container} psql -U {user} -c "CREATE DATABASE restore_test;"

# Restore backup
gunzip -c /tmp/{latest}.sql.gz | \
  docker exec -i {postgres-container} psql -U {user} -d restore_test

# Verify data
docker exec {postgres-container} psql -U {user} -d restore_test \
  -c "SELECT schemaname, tablename FROM pg_tables WHERE schemaname='public';"

# Row count verification
docker exec {postgres-container} psql -U {user} -d restore_test \
  -c "SELECT count(*) as rows FROM {main_table};"

# Cleanup test database
docker exec {postgres-container} psql -U {user} -c "DROP DATABASE restore_test;"
\`\`\`

### 4. Test Volume Restore
\`\`\`bash
# Download volume backup
aws s3 cp s3://{bucket}/volumes/{latest}.tar.gz /tmp/

# Restore to test volume
docker volume create test_restore
docker run --rm -v test_restore:/data -v /tmp:/backup:ro \
  alpine tar xzf /backup/{latest}.tar.gz -C /data

# Verify contents
docker run --rm -v test_restore:/data alpine ls -la /data/

# Cleanup
docker volume rm test_restore
\`\`\`
```

### Step 5: Configure Alerts

```
──────────────────────────────────────────────────────────────
ALERTING CONFIGURATION
──────────────────────────────────────────────────────────────

### Coolify Notifications
Dashboard > Settings > Notifications:

| Channel | Type | Events |
|---------|------|--------|
| {Slack/Discord/Email} | {webhook URL} | Backup success/failure |

### Backup Monitoring Script
\`\`\`bash
#!/bin/bash
# check-backups.sh - Run daily via cron

BUCKET="s3://{bucket}"
MAX_AGE_HOURS=24
WEBHOOK_URL="{slack-webhook-url}"

# Check latest PostgreSQL backup age
LATEST=$(aws s3 ls ${BUCKET}/databases/postgresql/ | sort | tail -1 | awk '{print $1" "$2}')
LATEST_EPOCH=$(date -d "$LATEST" +%s 2>/dev/null || echo 0)
NOW_EPOCH=$(date +%s)
AGE_HOURS=$(( (NOW_EPOCH - LATEST_EPOCH) / 3600 ))

if [ "$AGE_HOURS" -gt "$MAX_AGE_HOURS" ]; then
  curl -s -X POST "$WEBHOOK_URL" \
    -d "{\"text\": \"BACKUP ALERT: PostgreSQL backup is ${AGE_HOURS}h old (max: ${MAX_AGE_HOURS}h)\"}"
fi
\`\`\`
```

### Step 6: Document Disaster Recovery Plan

```
══════════════════════════════════════════════════════════════
DISASTER RECOVERY PLAN
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RECOVERY METRICS
──────────────────────────────────────────────────────────────

| Metric | Target | Achieved |
|--------|--------|----------|
| RPO (data loss tolerance) | {hours} | {hours} |
| RTO (recovery time) | {hours} | {hours} |

──────────────────────────────────────────────────────────────
RECOVERY PROCEDURES
──────────────────────────────────────────────────────────────

### Single Service Recovery
1. Identify failed service in Coolify dashboard
2. Check deployment logs for error
3. Redeploy or rollback to previous version
4. If data issue: restore database from S3 backup
Time: 15-30 minutes

### Complete Server Recovery
1. Provision new VPS (same specs)
2. Install Coolify
3. Configure S3 storage connection
4. Restore databases from backup
5. Reconnect Git sources and redeploy apps
6. Update DNS records
Time: 1-2 hours

──────────────────────────────────────────────────────────────
BACKUP SUMMARY
──────────────────────────────────────────────────────────────

| Component | Schedule | Retention | S3 Path |
|-----------|----------|-----------|---------|
| {database} | {frequency} | {days/count} | {s3://path} |
| {volumes} | {frequency} | {days/count} | {s3://path} |

──────────────────────────────────────────────────────────────
NEXT STEPS
──────────────────────────────────────────────────────────────

1. [ ] Backup schedule verified and active
2. [ ] Restore procedure tested successfully
3. [ ] Alert notifications verified
4. [ ] DR plan shared with team
5. [ ] Next restore test scheduled: {date}
```
