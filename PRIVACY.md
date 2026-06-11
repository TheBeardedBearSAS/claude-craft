# Privacy Policy

**Effective Date:** April 15, 2026  
**Last Updated:** April 15, 2026

This Privacy Policy describes how Claude Craft ("we", "us", or "the Project") collects, uses, and protects your personal data in compliance with the General Data Protection Regulation (GDPR) Articles 13 and 14.

## 1. Data Controller

The Bearded Bear SAS  
Contact: privacy@the-bearded-bear.com (or open a GitHub issue at https://github.com/TheBeardedBearSAS/claude-craft/issues)

## 2. What Data We Collect

Claude Craft is an open-source framework that runs locally on your machine. We collect minimal data:

### 2.1 Ralph Autonomous Agent Logs (If Used)

- **What**: Command execution logs, error messages, task outcomes when using the Ralph feature (`/common:ralph-run`)
- **Why**: To improve the autonomous agent's reliability and debug failures
- **How Long**: 90 days
- **Legal Basis**: Legitimate interest (product improvement), or your explicit consent if opted-in

### 2.2 Crash Telemetry (Opt-in Only)

- **What**: Stack traces, error types, runtime environment (OS, Node.js version) when the CLI crashes
- **Why**: To identify and fix bugs
- **How Long**: 30 days
- **Legal Basis**: Explicit consent (you must opt-in via `claude-craft telemetry on` — first-run 3-button prompt since v8.2)
- **Provider**: Sentry (EU region)

### 2.3 CLI Usage Analytics (Opt-in Only)

- **What**: Commands executed (e.g., `/team:audit`), frequency, anonymized project identifiers (UUID v4 local)
- **Why**: To understand feature adoption and prioritize development
- **How Long**: 12 months
- **Legal Basis**: Explicit consent (you must opt-in via `claude-craft telemetry on` — first-run 3-button prompt since v8.2)
- **Provider**: Posthog (EU region: `eu.posthog.com`)
- **Revocation**: `claude-craft telemetry off` ou variable d'environnement `CLAUDE_CRAFT_TELEMETRY=off`
- **Purge** (RGPD Art. 17): `claude-craft telemetry purge` envoie une requête d'effacement au provider et supprime les données locales
- **PII scrubbing**: les paths, emails, tokens API et patterns sensibles sont supprimés avant envoi (voir `.claude/telemetry.json.template` → `redaction.patterns`)
- **Dashboard public**: [stats.claude-craft.dev](https://stats.claude-craft.dev) affiche les métriques agrégées (WAU, top commandes, taux d'erreur, adoption versions)

### 2.4 Data We Do NOT Collect

- Your source code
- API keys or secrets
- Personal identifiers (email, name) unless you explicitly provide them in bug reports
- Browsing history or activity outside Claude Craft
- Anthropic API request/response contents (these are subject to Anthropic's Privacy Policy)

## 3. Legal Basis for Processing (GDPR Art. 6)

| Data Type | Legal Basis |
|-----------|-------------|
| Ralph logs | Legitimate interest (Art. 6(1)(f)) OR Consent (Art. 6(1)(a)) |
| Crash telemetry | Consent (Art. 6(1)(a)) |
| CLI analytics | Consent (Art. 6(1)(a)) |

You can withdraw consent at any time by running `claude-craft config set telemetry.enabled=false` or `claude-craft config set analytics.enabled=false`.

## 4. Data Retention

| Data Type | Retention Period |
|-----------|------------------|
| Ralph logs | 90 days |
| Crash telemetry | 30 days |
| CLI analytics | 12 months |

After these periods, data is automatically deleted from our systems.

## 5. Your Rights (GDPR Art. 15-22)

You have the following rights under GDPR:

1. **Right to Access (Art. 15)**: Request a copy of your data
2. **Right to Rectification (Art. 16)**: Correct inaccurate data
3. **Right to Erasure (Art. 17)**: Request deletion of your data ("right to be forgotten")
4. **Right to Data Portability (Art. 20)**: Receive your data in a structured, machine-readable format
5. **Right to Object (Art. 21)**: Object to processing based on legitimate interest
6. **Right to Restriction (Art. 18)**: Request limited processing of your data

To exercise these rights, contact us at privacy@the-bearded-bear.com or open a GitHub issue.

## 6. Third-Party Services

Claude Craft integrates with the following third-party services:

### 6.1 Anthropic API

- **What**: Your prompts and code are sent to Anthropic's Claude API when you use Claude Code
- **Privacy Policy**: https://www.anthropic.com/privacy
- **Data Location**: Anthropic's infrastructure (see their Privacy Policy for details)
- **Your Control**: You control what you send to Claude. Claude Craft does not send data to Anthropic without your explicit action.

### 6.2 GitHub

- **What**: Contribution metadata (username, commit messages) when you contribute to the Project
- **Privacy Policy**: https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement
- **Data Location**: GitHub's infrastructure (global)

## 7. Data Transfers (Schrems II Compliance)

If you are located in the European Union:

- **Ralph logs, telemetry, and analytics** may be stored on servers located in the EU or the United States
- We comply with GDPR Chapter V requirements for international data transfers (Standard Contractual Clauses or adequacy decisions)
- Anthropic API transfers are subject to Anthropic's Privacy Policy and compliance mechanisms

## 8. Tenant Isolation (Multi-User Environments)

If you deploy Claude Craft in a multi-tenant or multi-user environment (e.g., shared CI/CD server):

- Ensure that each tenant/user has isolated project directories
- Ralph logs and telemetry are stored per-project; avoid sharing project directories
- Implement OS-level access controls to prevent cross-tenant data access
- See `.claude/rules/14-multitenant.md` for technical guidance

## 9. Security

We implement industry-standard security measures:

- Encryption in transit (TLS 1.3)
- Encryption at rest for stored telemetry
- Access controls to limit data access to authorized personnel only
- Regular security audits

However, no system is 100% secure. If you discover a security vulnerability, please report it responsibly via GitHub Security Advisories or privacy@the-bearded-bear.com.

## 10. Children's Privacy

Claude Craft is not intended for use by children under 16. We do not knowingly collect personal data from children. If you believe we have collected data from a child, contact us immediately.

## 11. Changes to This Policy

We may update this Privacy Policy from time to time. We will notify you of material changes by:

- Posting a notice in the GitHub repository (https://github.com/TheBeardedBearSAS/claude-craft)
- Updating the "Last Updated" date above
- Sending a notification via the CLI (if you have opted into updates)

Your continued use of Claude Craft after changes constitutes acceptance of the updated policy.

## 12. Contact & Data Protection Officer

For privacy-related questions or to exercise your rights:

- **Email**: privacy@the-bearded-bear.com
- **GitHub Issues**: https://github.com/TheBeardedBearSAS/claude-craft/issues
- **DPO (if applicable)**: Contact privacy@the-bearded-bear.com to reach our Data Protection Officer

## 13. Supervisory Authority

If you are located in the EU and believe we are not complying with GDPR, you have the right to lodge a complaint with your local data protection authority:

- **France (CNIL)**: https://www.cnil.fr/
- **Other EU countries**: https://edpb.europa.eu/about-edpb/about-edpb/members_en

## 14. Language

This Privacy Policy is provided in English. Translations to French, Spanish, German, and Portuguese will be provided in Phase 2 of our compliance roadmap. In case of conflict between translations, the English version prevails.

---

**Acknowledgment**: By using Claude Craft, you acknowledge that you have read and understood this Privacy Policy.
