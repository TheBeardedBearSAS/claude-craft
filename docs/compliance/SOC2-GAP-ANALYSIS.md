# SOC 2 Type I Gap Analysis — Claude Craft

**Version:** 1.0.0  
**Date:** 2026-04-17  
**Scope:** Claude Craft SaaS platform (Enterprise tier)  
**Target Certification:** SOC 2 Type I (Security, Availability, Confidentiality)

---

## Executive Summary

| Metric | Current | Target (3 months) |
|--------|---------|-------------------|
| **Overall Compliance** | ~50% | 90% |
| **Security Criteria** | 55% | 95% |
| **Availability Criteria** | 60% | 90% |
| **Confidentiality Criteria** | 35% | 85% |
| **Estimated Effort** | — | 3 person-months |
| **Investment** | — | €75,000 (staffing + tools + audit) |

**Readiness Assessment:** Claude Craft has **foundational security practices** (2FA, encryption, monitoring) but lacks **formal policies and documentation** required for SOC 2. With focused remediation, **Type I audit-ready in 3 months**.

---

## Scope Definition

### In Scope
- **SaaS Platform:** Web dashboard, authentication, multi-tenant workspaces, audit logs
- **Infrastructure:** AWS/GCP hosting, CI/CD pipelines, monitoring, backup/restore
- **Data Processing:** User credentials, usage analytics, audit logs, API keys

### Out of Scope
- **NPM Package (MIT):** Community/open-source tier (not covered by SOC 2)
- **Customer-Generated Code:** Code produced by Claude Craft agents (customer responsibility)

---

## Trust Service Criteria — Gap Analysis

### CC1: Control Environment

| Criterion | Description | Status | Gap | Priority |
|-----------|-------------|--------|-----|----------|
| **CC1.1** | Organization demonstrates commitment to integrity and ethical values | 🟡 Partial | Code of Conduct exists, but not formally signed by employees | Medium |
| **CC1.2** | Board of directors demonstrates independence and oversight | 🔴 Gap | Small company (no board), need to document CTO oversight | Low |
| **CC1.3** | Management establishes structures, reporting lines, authorities | 🟢 Compliant | GitHub CODEOWNERS, ARCHITECTURE.md documents roles | — |
| **CC1.4** | Organization demonstrates commitment to competence | 🟡 Partial | Hiring practices exist, but no formal skills matrix | Low |
| **CC1.5** | Organization holds individuals accountable for internal control | 🔴 Gap | No formal performance reviews tied to security responsibilities | Medium |

**Summary CC1:** 1/5 Compliant, 2/5 Partial, 2/5 Gap

---

### CC2: Communication and Information

| Criterion | Description | Status | Gap | Priority |
|-----------|-------------|--------|-----|----------|
| **CC2.1** | Organization obtains/generates relevant quality information | 🟢 Compliant | Sentry (errors), Posthog (usage), CloudWatch (infra) | — |
| **CC2.2** | Organization internally communicates information | 🟡 Partial | Slack used, but no formal incident communication policy | High |
| **CC2.3** | Organization communicates with external parties | 🔴 Gap | No formal customer security notification process (e.g., breach disclosure) | Critical |

**Summary CC2:** 1/3 Compliant, 1/3 Partial, 1/3 Gap

---

### CC3: Risk Assessment

| Criterion | Description | Status | Gap | Priority |
|-----------|-------------|--------|-----|----------|
| **CC3.1** | Organization specifies objectives with sufficient clarity | 🟡 Partial | Business objectives clear, but security objectives undocumented | High |
| **CC3.2** | Organization identifies and analyzes risk | 🔴 Gap | No formal risk register (threats, likelihood, impact) | Critical |
| **CC3.3** | Organization considers potential for fraud | 🔴 Gap | No fraud risk assessment (e.g., credential stuffing, API abuse) | High |
| **CC3.4** | Organization identifies and assesses changes that could impact the system | 🟡 Partial | Change management via GitHub PRs, but no security impact assessment | High |

**Summary CC3:** 0/4 Compliant, 2/4 Partial, 2/4 Gap

---

### CC4: Monitoring Activities

| Criterion | Description | Status | Gap | Priority |
|-----------|-------------|--------|-----|----------|
| **CC4.1** | Organization selects, develops, and performs ongoing/separate evaluations | 🟡 Partial | Automated monitoring (Sentry, CloudWatch), but no quarterly security reviews | High |
| **CC4.2** | Organization evaluates and communicates deficiencies | 🔴 Gap | No formal process to track/escalate security findings | High |

**Summary CC4:** 0/2 Compliant, 1/2 Partial, 1/2 Gap

---

### CC5: Control Activities

| Criterion | Description | Status | Gap | Priority |
|-----------|-------------|--------|-----|----------|
| **CC5.1** | Organization selects and develops control activities | 🟡 Partial | Technical controls exist (2FA, encryption), but no formal control matrix | High |
| **CC5.2** | Organization selects and develops general controls over technology | 🟢 Compliant | Infrastructure-as-Code (Terraform), CI/CD pipelines, automated testing | — |
| **CC5.3** | Organization deploys control activities through policies/procedures | 🔴 Gap | Policies exist in docs, but not formalized (no version control, signatures) | Critical |

**Summary CC5:** 1/3 Compliant, 1/3 Partial, 1/3 Gap

---

### CC6: Logical and Physical Access Controls

| Criterion | Description | Status | Gap | Priority |
|-----------|-------------|--------|-----|----------|
| **CC6.1** | Organization implements logical access security software | 🟢 Compliant | GitHub 2FA mandatory, AWS IAM roles, SSH keys | — |
| **CC6.2** | Organization restricts logical access to authorized users | 🟡 Partial | Access controls exist, but no quarterly access review | High |
| **CC6.3** | Organization manages network security | 🟢 Compliant | AWS Security Groups, VPC isolation, DDoS protection (CloudFlare) | — |
| **CC6.4** | Organization restricts physical access | 🟢 Compliant | Coworking space with badge access (delegated to provider) | — |
| **CC6.6** | Organization implements logical access security measures to protect against threats | 🟡 Partial | GitHub Advanced Security (secret scanning), but no SIEM for anomaly detection | Medium |
| **CC6.7** | Organization restricts transmission, movement, and removal of information | 🔴 Gap | No DLP (Data Loss Prevention) controls | Medium |
| **CC6.8** | Organization implements controls to prevent or detect unauthorized software | 🟡 Partial | Dependabot, Snyk, Trivy in CI/CD, but no endpoint protection (EDR) | Medium |

**Summary CC6:** 3/7 Compliant, 3/7 Partial, 1/7 Gap

---

### CC7: System Operations

| Criterion | Description | Status | Gap | Priority |
|-----------|-------------|--------|-----|----------|
| **CC7.1** | Organization ensures system changes are authorized and properly tested | 🟢 Compliant | GitHub PR reviews, CI/CD tests, staging environment | — |
| **CC7.2** | Organization identifies, develops, and manages system components | 🟢 Compliant | Terraform (IaC), dependency management (npm, Composer) | — |
| **CC7.3** | Organization evaluates security events to identify data incidents | 🟡 Partial | Sentry logs errors, but no formal incident classification process | High |
| **CC7.4** | Organization responds to identified security incidents | 🔴 Gap | No formal incident response plan (playbooks, escalation matrix) | Critical |
| **CC7.5** | Organization identifies, develops, and implements backup controls | 🟡 Partial | AWS automated backups, but no documented restore procedure or RTO/RPO | High |

**Summary CC7:** 2/5 Compliant, 2/5 Partial, 1/5 Gap

---

### CC8: Change Management

| Criterion | Description | Status | Gap | Priority |
|-----------|-------------|--------|-----|----------|
| **CC8.1** | Organization authorizes, designs, develops, tests, approves, and deploys changes | 🟢 Compliant | GitHub PR workflow, CI/CD tests, manual staging approval | — |

**Summary CC8:** 1/1 Compliant

---

### CC9: Risk Mitigation

| Criterion | Description | Status | Gap | Priority |
|-----------|-------------|--------|-----|----------|
| **CC9.1** | Organization identifies, selects, and develops risk mitigation activities | 🔴 Gap | No formal risk treatment plan (accept/mitigate/transfer/avoid) | Critical |
| **CC9.2** | Organization assesses and manages risks associated with vendors and business partners | 🔴 Gap | No vendor risk assessments (Anthropic, AWS, Vercel) | High |

**Summary CC9:** 0/2 Compliant, 0/2 Partial, 2/2 Gap

---

### A1: Availability (Additional Criteria)

| Criterion | Description | Status | Gap | Priority |
|-----------|-------------|--------|-----|----------|
| **A1.1** | Organization maintains, monitors, and evaluates current processing capacity | 🟢 Compliant | AWS Auto Scaling, CloudWatch alarms, load testing | — |
| **A1.2** | Organization authorizes, designs, develops, tests, approves, and deploys environmental protections | 🟡 Partial | Multi-AZ deployment, but no formal disaster recovery plan | High |
| **A1.3** | Organization authorizes, designs, develops, tests, approves, and deploys system recovery and business continuity | 🔴 Gap | No documented RTO/RPO, no DR drills | Critical |

**Summary A1:** 1/3 Compliant, 1/3 Partial, 1/3 Gap

---

### C1: Confidentiality (Additional Criteria)

| Criterion | Description | Status | Gap | Priority |
|-----------|-------------|--------|-----|----------|
| **C1.1** | Organization identifies and maintains confidential information | 🟡 Partial | Audit logs (Enterprise), but no formal data classification policy | High |
| **C1.2** | Organization disposes of confidential information to meet confidentiality objectives | 🔴 Gap | No documented data deletion process (GDPR Article 17) | Critical |

**Summary C1:** 0/2 Compliant, 1/2 Partial, 1/2 Gap

---

## Top 5 Critical Gaps (Must-Fix for Type I)

| Gap | Criteria | Impact | Remediation | Effort | Cost |
|-----|----------|--------|-------------|--------|------|
| **1. No Incident Response Plan** | CC7.4, CC2.3 | Breaches undetected or mishandled, customer trust loss | Create IR playbook, tabletop exercises | 2 weeks | €5K |
| **2. No Formal Policies** | CC5.3 | Auditor cannot verify controls without written policies | Formalize policies (access control, encryption, backup) | 3 weeks | €10K |
| **3. No Risk Register** | CC3.2, CC9.1 | Cannot demonstrate risk-based approach to security | Create risk register, risk treatment plan | 2 weeks | €5K |
| **4. No Disaster Recovery Plan** | A1.3 | SLA breach, prolonged outages | Document RTO/RPO, test failover | 3 weeks | €10K |
| **5. No Data Deletion Process** | C1.2 | GDPR non-compliance, confidentiality breach | Implement deletion API, retention policies | 4 weeks | €15K |

**Total Critical Path:** 14 weeks, €45K

---

## Remediation Roadmap (3 months)

### Phase 1: Policies and Procedures (Month 1)
- [ ] Formalize Information Security Policy
- [ ] Document Incident Response Plan
- [ ] Create Risk Register + Risk Treatment Plan
- [ ] Access Control Policy + quarterly review process

### Phase 2: Technical Controls (Month 2)
- [ ] Data deletion API (C1.2)
- [ ] Disaster recovery plan (A1.3)
- [ ] Customer security notification process (CC2.3)
- [ ] Formal backup/restore procedures (CC7.5)

### Phase 3: Pre-Audit Preparation (Month 3)
- [ ] Policy signatures (all employees acknowledge)
- [ ] Tabletop incident response exercise
- [ ] Vendor risk assessments (Anthropic, AWS, Vercel)
- [ ] Pre-audit gap assessment with external auditor

---

## Cost Breakdown

| Category | Item | Cost |
|----------|------|------|
| **Staffing** | Security engineer (3 months, part-time) | €30,000 |
| **Tools** | SIEM (AWS Security Hub), DLP baseline | €5,000 |
| **Consulting** | SOC 2 auditor (pre-assessment + Type I audit) | €25,000 |
| **Training** | Incident response tabletop exercises | €5,000 |
| **Testing** | DR failover test, penetration test | €10,000 |
| **TOTAL** | — | **€75,000** |

---

## Compliance Timeline

| Milestone | Target Date | Deliverable |
|-----------|-------------|-------------|
| **Gap Analysis Complete** | 2026-04-17 | This document |
| **Phase 1 Complete** | 2026-05-17 | Policies formalized, IR plan operational |
| **Phase 2 Complete** | 2026-06-17 | Technical controls (DR, data deletion) live |
| **Phase 3 Complete** | 2026-07-17 | Pre-audit prep, vendor assessments complete |
| **SOC 2 Type I Audit** | 2026-08-15 | Type I report (point-in-time) |

---

## Resources

- **AICPA SOC 2 Framework:** [aicpa.org/soc2](https://www.aicpa.org/soc-for-service-organizations)
- **SOC 2 Academy:** Free training — [soc2.academy](https://soc2.academy/)
- **Vanta (automation tool):** SOC 2 compliance automation — €12K/year
- **Drata (automation tool):** Alternative to Vanta — €10K/year

---

**Prepared by:** The Bearded CTO — Security Team  
**Reviewed by:** `@security-auditor`, Legal counsel  
**Next Review:** 2026-05-17 (monthly during remediation)
