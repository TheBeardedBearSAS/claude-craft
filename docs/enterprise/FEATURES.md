# Claude Craft — Enterprise Features Matrix

## Feature Comparison by Tier

| Feature | Community | Pro | Enterprise |
|---------|-----------|-----|------------|
| **Core** | | | |
| Commands | 214 | 214 | 214 |
| Agents | 67 | 67 | 67 + custom |
| Skills | All (60+) | All + marketplace | All + custom |
| Technology stacks | 11 | 11 | 11 |
| RTK integration | ✅ | ✅ | ✅ |
| BMAD framework | ✅ | ✅ | ✅ + custom tracks |
| Docker workflows | ✅ | ✅ | ✅ |
| **Support** | | | |
| Community (GitHub) | ✅ | ✅ | ✅ |
| Email support | ❌ | 48h SLA | 4h SLA |
| Dedicated engineer | ❌ | ❌ | ✅ (Slack channel) |
| Priority bug fixes | ❌ | ✅ | ✅✅ |
| **Analytics** | | | |
| Usage tracking | ❌ | ✅ | ✅ |
| Token savings metrics | ❌ | ✅ | ✅ |
| Agent utilization | ❌ | ✅ | ✅ |
| Custom reports | ❌ | ❌ | ✅ |
| **Collaboration** | | | |
| Shared skills (team) | ❌ | ✅ | ✅ |
| Private marketplace | ❌ | ✅ | ✅ |
| Multi-tenant workspaces | ❌ | ❌ | ✅ |
| Role-based access | ❌ | ❌ | ✅ |
| **Security** | | | |
| SSO/SAML | ❌ | ❌ | ✅ |
| Audit logs | ❌ | ❌ | ✅ |
| IP allowlisting | ❌ | ❌ | ✅ |
| SOC 2 compliance | ❌ | ❌ | ✅ (assistance) |
| ISO 27001 compliance | ❌ | ❌ | ✅ (assistance) |
| **Deployment** | | | |
| Local installation | ✅ | ✅ | ✅ |
| Self-hosted | ❌ | ❌ | ✅ |
| Air-gapped environments | ❌ | ❌ | ✅ |
| **SLA** | | | |
| Uptime guarantee | ❌ | ❌ | 99.9% |
| Incident response | ❌ | Best effort | 1h acknowledgment |
| **Customization** | | | |
| Custom agents | ❌ | ❌ | ✅ (built by us) |
| Custom workflows | ❌ | Templates | ✅ (tailored) |
| Priority features | ❌ | ❌ | ✅ (roadmap input) |
| **License** | | | |
| Type | MIT (open source) | Commercial | Enterprise |
| Commercial use | ✅ | ✅ | ✅ |
| Redistribution | ✅ (MIT terms) | ❌ | ❌ |

---

## Enterprise-Only Features (Detail)

### SSO/SAML Authentication
- **Supported providers:** Okta, Azure AD, Google Workspace, OneLogin, Auth0
- **Protocol:** SAML 2.0, OAuth 2.0/OIDC
- **Group sync:** Automatic role assignment based on IdP groups

### Audit Logs
- **Logged events:** All commands, agent invocations, skill executions, configuration changes
- **Retention:** 1 year (configurable up to 7 years)
- **Export:** JSON, CSV, SIEM-compatible (Splunk, Datadog, Elastic)
- **Compliance:** ISO 27001, SOC 2, GDPR-ready

### Multi-Tenant Workspaces
- **Isolation:** Full data separation per tenant (dedicated schemas or databases)
- **Customization:** Per-tenant branding, workflows, agents
- **Billing:** Usage-based sub-billing per tenant

### Self-Hosted Deployment
- **Formats:** Docker Compose, Kubernetes (Helm chart), bare metal
- **Database:** PostgreSQL 15+, MySQL 8+, SQLite (dev only)
- **Reverse proxy:** Nginx, Traefik, Caddy configurations included
- **Updates:** Automated (opt-in) or manual

---

## Coming Soon (All Tiers)

- **Web UI** (Q2 2026): Browser-based interface for non-CLI users
- **VS Code Extension** (Q3 2026): Native integration with VS Code
- **GitHub Actions** (Q2 2026): Pre-built actions for CI/CD pipelines
- **Mobile app** (Q4 2026): iOS/Android companion for notifications, approvals

---

**For detailed pricing, see [PRICING.md](PRICING.md)**

**Questions?** Contact sales@claude-craft.io
