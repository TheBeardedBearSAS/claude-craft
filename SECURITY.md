# Security Policy

## Supported Versions

| Version | Supported          |
|---------|--------------------|
| 8.2.x   | :white_check_mark: |
| 8.1.x   | :white_check_mark: |
| < 8.1   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability in Claude Craft, please report it responsibly.

**Email:** security@thebearded-cto.com

### What to include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Disclosure Timeline

- We will acknowledge your report within **48 hours**.
- We aim to provide a fix within **90 days** of the initial report.
- **Do not** publicly disclose the vulnerability before a fix has been released.
- Once a fix is available, we will coordinate with you on public disclosure.

### What to Expect

- A confirmation of receipt within 48 hours.
- Regular updates on the status of the fix (at least every 2 weeks).
- Credit in the release notes (unless you prefer to remain anonymous).

### Out of Scope

- Vulnerabilities in dependencies managed by upstream maintainers (please report those directly to the relevant project).
- Issues that require physical access to the user's machine.
- Social engineering attacks.

## Security Best Practices

When using Claude Craft:

- Keep Claude Code updated to the minimum recommended version (2.1.97+).
- Review agent permissions in `.claude/settings.json` before granting access.
- Never commit sensitive data (API keys, tokens) in BMAD configuration files.
- Use the sandbox mode to restrict skill directory writes.

### Known CVE Fixes (Claude Code)

Claude Code v2.1.97+ includes critical security fixes:

| CVE | Severity | Fixed In | Description |
|-----|----------|----------|-------------|
| CVE-2025-59536 | 8.7/10 CVSS | v2.1.51 | Command injection via MCP hook inputs |
| CVE-2026-21852 | 5.3/10 CVSS | v2.0.65 | API key exfiltration via path traversal |
| CVE-2026-35020 | High | v2.1.97 | Compound command bypass in Bash tool |
| CVE-2026-35021 | High | v2.1.97 | Network redirect bypass in Bash tool |
| CVE-2026-35022 | High | v2.1.98 | Env-var prefix injection in Bash tool |
| N/A | High | v2.1.101 | Command injection via POSIX `which` fallback |

**Incident**: Claude Code v2.1.88 exposed source code via `.map` file (59.8 MB). Fixed in v2.1.89.

### Subprocess Sandboxing (v2.1.98+)

- **PID namespace isolation**: Subprocesses run in dedicated PID namespace (Linux)
- **Environment scrubbing**: `CLAUDE_CODE_SUBPROCESS_ENV_SCRUB=1` removes credentials
- **Fail-safe mode**: `sandbox.failIfUnavailable` fails if sandbox unavailable (v2.1.83+)

---

## Software Supply Chain Security

Claude Craft follows modern supply chain security practices to ensure the integrity and provenance of published packages.

### SLSA Build Level 2 Provenance

Starting with version 8.1.0, all releases include **SLSA Build Level 2** provenance attestations:

- **Automated build**: Builds run in GitHub Actions with no manual intervention
- **Provenance generation**: SLSA provenance is automatically generated via `slsa-framework/slsa-github-generator`
- **Signed attestations**: Provenance is cryptographically signed using Sigstore keyless signing
- **NPM provenance**: npm packages are published with `--provenance` flag (requires npm 9+)

**How to verify provenance:**

```bash
# Verify npm package provenance (npm 9+)
npm audit signatures

# View provenance for a specific version
npm view @the-bearded-bear/claude-craft@8.1.0 dist.attestations
```

**GitHub Release attestations:**

Each tagged release includes a SLSA provenance attestation file attached as a release asset. You can verify it using:

```bash
# Download the provenance attestation from the release assets
# Then verify using slsa-verifier
slsa-verifier verify-artifact \
  --provenance-path claude-craft.intoto.jsonl \
  --source-uri github.com/TheBeardedBearSAS/claude-craft
```

### Software Bill of Materials (SBOM)

Every release includes a **CycloneDX SBOM** (JSON format) for full dependency transparency:

- **Format**: CycloneDX 1.6+ (JSON)
- **Generation**: Automated via GitHub Actions using `CycloneDX/gh-node-module-generatebom`
- **Availability**: Attached to each GitHub Release as `claude-craft-sbom.json`
- **Retention**: 90 days as GitHub Actions artifact

**How to verify SBOM:**

1. Go to the [Releases page](https://github.com/TheBeardedBearSAS/claude-craft/releases)
2. Download `claude-craft-sbom.json` from the release assets
3. Validate using a CycloneDX-compatible tool:

```bash
# Install CycloneDX CLI
npm install -g @cyclonedx/cyclonedx-cli

# Validate SBOM
cyclonedx validate --input-file claude-craft-sbom.json
```

**SBOM contents:**

The SBOM includes:
- All production dependencies (from `dependencies` in package.json)
- Transitive dependencies (full dependency tree)
- Component metadata (name, version, license, purl)
- Dependency relationships

### Sigstore npm Signatures

All npm packages published since version 8.1.0 are signed using **Sigstore keyless signing**:

- **Signature verification**: Automatic via `npm audit signatures` (npm 9+)
- **Transparency log**: All signatures are recorded in the public Rekor transparency log
- **No secret keys**: Uses OIDC tokens from GitHub Actions (keyless signing)

**How to verify signatures:**

```bash
# Verify all installed dependencies including claude-craft
npm audit signatures

# Check specific package integrity
npm view @the-bearded-bear/claude-craft@latest dist.integrity
```

### Compliance Standards

Claude Craft supply chain practices align with:

- **SLSA Framework**: Build Level 2 (working toward Level 3)
- **NIS2 Directive**: Software supply chain security requirements (EU)
- **NIST SSDF**: Secure Software Development Framework
- **OpenSSF Scorecard**: Continuous security posture monitoring

### Vulnerability Scanning

All dependencies are scanned for known vulnerabilities:

- **Pre-publish**: `npm audit --omit=dev --audit-level=high` runs in CI before every release
- **Continuous**: Dependabot monitors dependencies and opens PRs for security updates
- **Threshold**: High and critical vulnerabilities must be resolved before release

### Reproducible Builds

Starting with version 8.1.0:

- **Pinned dependencies**: All dependencies use exact versions (no semver ranges in package-lock.json)
- **Locked CI environment**: GitHub Actions runners use pinned versions (`ubuntu-latest`, `node-version: '22'`)
- **Deterministic builds**: `npm ci` ensures reproducible builds from package-lock.json

### Contact for Supply Chain Issues

If you discover a supply chain security issue (compromised dependency, malicious package, signature mismatch):

**Email:** security@thebearded-cto.com

**Subject:** `[SUPPLY-CHAIN] <brief description>`

Include:
- Package name and version
- Affected dependency (if applicable)
- Evidence of compromise (SBOM diff, signature mismatch, hash mismatch)
- Potential impact

We will respond within **24 hours** for supply chain incidents.
