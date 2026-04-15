# Dual Licensing — Documentation

> **Status** : DRAFT P3-26. Requires IP lawyer review before publication.

## TL;DR

| Who you are | What you need |
|---|---|
| Individual dev, OSS contributor, edu | **MIT** (free, default) |
| Small business (≤ €1M revenue) | **MIT** (free) |
| Mid/large business (> €1M revenue) using in commercial prod | **Commercial License** |
| Need SLA / contractual support / indemnification | **Commercial License** |

## Files

- `/LICENSE` — MIT (default, applies to everyone)
- `/LICENSE-COMMERCIAL.md` — Commercial license text (DRAFT)
- `./SLA-TEMPLATE.md` — SLA details (DRAFT)

## FAQ (draft)

### Can I use claude-craft in my company for free?

Yes, under the MIT license, if your organization's annual revenue is ≤ €1M or you do not require SLA/contractual support.

### Does the commercial license make claude-craft non-free?

No. The MIT license remains valid for everyone. The commercial license only **adds** rights (SLA, support, indemnification) for organizations that need them.

### Can I still contribute to claude-craft without signing commercial?

Absolutely. Contributions follow the existing CONTRIBUTING.md + DCO (Developer Certificate of Origin). MIT remains the default for merged contributions.

### Why dual-license?

To sustain full-time development. The €1M revenue threshold follows the Sidekiq model: small teams pay nothing, larger organizations fund the project.

## Timeline

- Phase 3 (current) : drafts published, legal review engaged
- Phase 3 + 1 month : legal signed-off version, README updated
- Phase 3 + 2 months : first enterprise contract signed (DoD P3-26)

## Open questions for legal review

1. Is €1M revenue threshold defendable? Alternative : employee count (> 50)?
2. Trademark protection scope (`TRADEMARK.md` already exists phase 1) — conflicts with commercial enforcement?
3. Contributor assignment : do we need a CLA (Contributor License Agreement) in addition to DCO for dual-licensed projects?
4. Tax implications SaaS revenue France / EU VAT (VAT-OSS)?
5. Enforceability if user does not self-report revenue tier?
