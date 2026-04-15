# Service Level Agreement (SLA) — Template DRAFT

> **Status** : DRAFT P3-26 — requires legal review.
> **Applies to** : Claude Craft Commercial Subscriptions (Starter, Team, Enterprise).

## 1. Severity Levels

| Severity | Definition | Examples |
|---|---|---|
| **SEV-1 Critical** | Production outage, data loss, security breach | CLI crashes all runs, RCE vulnerability |
| **SEV-2 High** | Major feature unusable, workaround painful | Audit command fails on valid repos |
| **SEV-3 Medium** | Minor feature broken, workaround available | Specific skill broken on Node 22 |
| **SEV-4 Low** | Cosmetic, enhancement request | Typo in docs, feature request |

## 2. Response Time Targets

| Tier | SEV-1 | SEV-2 | SEV-3 | SEV-4 |
|---|---|---|---|---|
| **Starter** | 24h business | 48h business | 5 business days | Best effort |
| **Team** | 4h business | 1 business day | 3 business days | Best effort |
| **Enterprise** | 1h 24/7 | 4h 24/7 | 1 business day | 5 business days |

"Business hours" = Monday-Friday 9:00-18:00 CET excluding French public holidays.

## 3. Uptime Guarantee (Cloud-hosted add-ons only)

Applies **only** to cloud services (QA Recette cloud, future hosted marketplace).

| Tier | Monthly Uptime |
|---|---|
| **Starter** | 99.5% |
| **Team** | 99.9% |
| **Enterprise** | 99.95% |

### Service Credits

If monthly uptime drops below the target:

| Downtime | Credit |
|---|---|
| 0.1% - 1% below target | 5% of monthly fee |
| 1% - 5% below target | 10% of monthly fee |
| > 5% below target | 25% of monthly fee |

Credits are applied against the next invoice, capped at the monthly fee.

## 4. Exclusions

SLA does not apply to:

- Force majeure events (natural disasters, war, pandemics)
- Scheduled maintenance announced ≥ 48h in advance (max 4h/month)
- Issues caused by Licensee misuse, custom modifications, or third-party integrations
- Anthropic API outages (subject to Anthropic's own SLA)
- Unsupported versions (> 6 months behind current release)
- Issues on unsupported platforms (non-Linux/macOS/Windows-WSL2)

## 5. Reporting Channels

| Tier | Channel |
|---|---|
| **Starter** | support@thebeardedcto.com |
| **Team** | support@thebeardedcto.com + Slack Connect |
| **Enterprise** | Dedicated Slack channel + on-call PagerDuty bridge |

## 6. Escalation

For SEV-1 after the response time target is missed:
- Email VP Engineering (vpe@thebeardedcto.com)
- Enterprise only : call on-call phone provided at contract signing

## 7. Review Cadence

- **Starter** : annual review
- **Team** : semi-annual review
- **Enterprise** : quarterly business review (QBR) with CTO and customer stakeholders

## 8. Limitations

- Total liability under this SLA is capped at 25% of the annual fees paid, regardless of number of incidents
- Service credits are the **sole and exclusive remedy** for SLA breaches
- Nothing in this SLA overrides the liability cap defined in the Master Services Agreement

---

**⚠️ DRAFT** : not yet legally reviewed. Do not use in signed contracts without IP lawyer approval.
