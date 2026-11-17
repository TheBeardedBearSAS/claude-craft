# Check Ruby / Rails Security

## Arguments

$ARGUMENTS (optional: path to project to analyze)

## Plan Mode

> Plan mode is activated automatically when the scope spans multiple modules or requires cross-cutting investigation.

## MISSION

Security audit of a Ruby 4.0 / Rails 8.1 application, aligned with OWASP Top 10:2025. Combine automated scanners (Brakeman, bundler-audit) with targeted manual review. All commands run in Docker. Security findings are ALWAYS top priority in the consolidated report.

### Step 1: Brakeman Static Analysis (6 points)

Rails 8 ships Brakeman by default (`bin/brakeman`).

```bash
docker compose exec app bin/brakeman --no-pager -q
docker compose exec app bundle exec brakeman -f json -o brakeman.json
docker compose exec app bundle exec brakeman --no-pager -q --confidence-level 1
ls config/brakeman.ignore
```

Checklist:
- [ ] Brakeman runs in CI and fails the build on new warnings
- [ ] Zero High-confidence warnings
- [ ] `config/brakeman.ignore` entries each have a note explaining why the warning is a false positive
- [ ] Brakeman version is current (it tracks Rails releases)

**Scoring**: 6 pts. Any High confidence warning (SQL injection, command injection, mass assignment, unsafe deserialization, XSS) = -3 each (min 0). Medium = -1 each. Unjustified ignore entries = -1.

### Step 2: Dependency Vulnerabilities (4 points)

```bash
docker compose exec app bundle exec bundler-audit check --update
docker compose exec app bundle outdated --strict | head -20
docker compose exec app bin/rails about
ls .github/dependabot.yml renovate.json
docker compose exec app grep -nE "^\s*gem .*(git:|github:)" Gemfile
```

Checklist:
- [ ] `bundler-audit` reports no known advisories (or each is documented with a mitigation)
- [ ] Rails and Ruby are on supported releases: Rails 8.1 is supported until 2027-10-10; Rails 8.0 reaches end of life on 2026-11-07; Ruby 4.0.x is current
- [ ] Dependabot or Renovate configured for `bundler`, `github-actions`, and `docker`
- [ ] `Gemfile.lock` committed; gems pinned through the lockfile
- [ ] No gems from Git branches without a pinned `ref`
- [ ] Container image and system packages scanned (Trivy or Grype) in CI

**Scoring**: 4 pts. Critical advisory = -2, High = -1, EOL framework version = -1.

### Step 3: Secrets and Credentials (4 points)

```bash
docker compose exec app ls config/credentials* config/master.key .env*
git ls-files | grep -E "master\.key|\.env$|\.pem$"
docker compose exec app grep -rnEi "(api[_-]?key|secret|password|token)\s*[:=]\s*['\"][A-Za-z0-9_\-]{12,}" app config lib --include="*.rb" --include="*.yml"
docker compose exec app grep -rn "secret_key_base" config
```

Checklist:
- [ ] `config/master.key` and all `config/credentials/*.key` are gitignored and never committed
- [ ] Secrets stored in encrypted credentials (`bin/rails credentials:edit --environment production`) or in a secrets manager / Kamal secrets
- [ ] No hardcoded keys, tokens, or passwords in source, YAML, Dockerfiles, or CI files
- [ ] `RAILS_MASTER_KEY` injected at deploy time only
- [ ] `config.filter_parameters` covers passwords, tokens, and personal data so they never reach logs
- [ ] Sensitive columns use Active Record Encryption (`encrypts :ssn`) with keys in credentials; deterministic encryption only where querying is required

**Scoring**: 4 pts. Committed secret = 0 for the whole step.

### Step 4: Authentication and Authorization (4 points)

```bash
docker compose exec app grep -rnE "has_secure_password|authenticate_by|generates_token_for|devise" app Gemfile
docker compose exec app grep -rnE "skip_before_action|allow_unauthenticated_access|skip_forgery_protection|protect_from_forgery" app
docker compose exec app grep -rnE "authorize|policy_scope|can\?|load_and_authorize" app/controllers | wc -l
docker compose exec app grep -rnE "\.find\(params\[:id\]\)" app/controllers | head -20
```

Checklist:
- [ ] Authentication uses the Rails 8 generator (`bin/rails generate authentication`), Devise, or an equivalent maintained solution; no home-grown crypto
- [ ] Passwords: `has_secure_password` (bcrypt) is the Rails default and acceptable; Argon2id is preferred for new non-Rails-default code (minimum OWASP 19 MiB / t=2 / p=1). Never MD5 or SHA1. Bcrypt inputs are limited to 72 bytes
- [ ] Use `User.authenticate_by(email:, password:)` for timing-safe credential checks
- [ ] Password reset and email confirmation tokens via `generates_token_for` (expiring, signed)
- [ ] Sessions: cookies `httponly`, `secure`, `same_site: :lax` or `:strict`; session reset on login (`reset_session`)
- [ ] CSRF protection active (`protect_from_forgery` is the default via `ActionController::Base`); `skip_forgery_protection` only on token-authenticated API controllers
- [ ] Every controller action authorized (deny by default); `allow_unauthenticated_access` or `skip_before_action :authenticate` is explicit and minimal
- [ ] IDOR prevented: records are loaded through the current user's scope (`current_user.orders.find(params[:id])`), not `Order.find`
- [ ] MFA available for privileged accounts; brute-force protection active (see Step 6)
- [ ] Multi-tenant apps scope every query by tenant (default scope or `acts_as_tenant`) and have isolation tests

**Scoring**: 4 pts. Missing authorization on a data-returning action = -2. IDOR pattern = -1 each (min 0).

### Step 5: Injection, XSS, Mass Assignment (4 points)

```bash
# SQL injection: interpolation in query fragments
docker compose exec app grep -rnE "(where|order|group|having|joins|select|pluck|find_by_sql|exists\?|calculate)\([^)]*#\{" app lib
docker compose exec app grep -rnE "connection\.(execute|select_all|exec_query)\(.*#\{" app lib
# XSS: unsafe output
docker compose exec app grep -rnE "html_safe|raw\(|raw @|<%==|sanitize\(.*tags" app
# Mass assignment
docker compose exec app grep -rnE "permit!|params\.to_unsafe_h|params\[:\w+\]\)$" app/controllers
# Command injection, unsafe deserialization, open redirects
docker compose exec app grep -rnE "system\(|exec\(|\`.*#\{|%x|Open3|Kernel\.open|YAML\.load\(|Marshal\.load" app lib
docker compose exec app grep -rnE "redirect_to params|redirect_to \w+\.(referer|referrer)" app
```

Checklist:
- [ ] SQL built only with placeholders or hash conditions: `where("email = ?", email)` or `where(email: email)`, never `"... #{value}"`; `order` column names whitelisted
- [ ] Views rely on ERB auto-escaping; `html_safe` / `raw` / `<%==` only on trusted, sanitized content and never on user input
- [ ] Rich text rendered via `sanitize` with an explicit allowlist or Action Text
- [ ] Strong parameters on every create/update: `params.expect(user: [:name, :email])` (Rails 8) or `params.require(:user).permit(...)`; never `permit!`; role/admin flags never permitted from user input
- [ ] No `system`, backticks, or `Open3` with interpolated user input; arguments passed as arrays
- [ ] No `YAML.load` or `Marshal.load` on untrusted data (`YAML.safe_load` with permitted classes)
- [ ] `redirect_to` targets validated (`url_from`, `allow_other_host: false`)
- [ ] File uploads: Active Storage content-type validation, size limits, no user-controlled filenames on disk, served from a separate domain or with `Content-Disposition: attachment`
- [ ] Outbound HTTP to user-supplied URLs guarded against SSRF (allowlist, block private ranges)

**Scoring**: 4 pts. Each confirmed injection = -2; each unsafe `html_safe` on user data = -1; `permit!` = -1 (min 0).

### Step 6: Secure Configuration, Headers, Rate Limiting (3 points)

```bash
docker compose exec app grep -nE "force_ssl|assume_ssl|hosts|consider_all_requests_local|log_level" config/environments/production.rb
docker compose exec app cat config/initializers/content_security_policy.rb
docker compose exec app grep -rnE "rate_limit|Rack::Attack" app config Gemfile
docker compose exec app grep -rnE "default_headers|Permissions-Policy|Referrer-Policy" config
docker compose exec app grep -nE "cors|Rack::Cors" Gemfile config -r
```

Checklist:
- [ ] Production: `config.force_ssl = true` and `config.assume_ssl = true` behind a TLS-terminating proxy (Thruster/Kamal proxy); HSTS active
- [ ] `config.consider_all_requests_local = false`; generic error pages; no stack traces exposed
- [ ] `config.hosts` allowlist set (DNS rebinding protection), with a health check exclusion for `/up`
- [ ] Content Security Policy initializer enabled and enforced (not report-only forever); nonces for inline scripts when needed
- [ ] Security headers present: `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`, COOP/CORP where applicable
- [ ] Rate limiting on login, password reset, signup, and expensive endpoints: Rails 8 `rate_limit to: 10, within: 3.minutes, only: :create` in controllers, or `rack-attack` for IP-level throttling
- [ ] CORS restricted to explicit origins (no `*` with credentials)
- [ ] Logs exclude secrets (`filter_parameters`); log retention >= 1 year where compliance requires; auth failures are logged and alerted
- [ ] Rails 8.1 `bin/ci` includes Brakeman and bundler-audit steps

**Scoring**: 3 pts (1 transport/errors/hosts, 1 CSP and headers, 1 rate limiting and CORS).

## OUTPUT FORMAT

```
RUBY / RAILS SECURITY AUDIT
===========================

SCORE: XX/25

Brakeman: H high / M medium / L weak   bundler-audit: N advisories

SUB-SCORES:
  Brakeman                     : XX/6
  Dependencies                 : XX/4
  Secrets and credentials      : XX/4
  Authentication / authorization: XX/4
  Injection / XSS / mass assign.: XX/4
  Configuration / headers / rate limiting: XX/3

STRENGTHS:
- [...]

VULNERABILITIES (by severity):
- CRITICAL: [OWASP category] [file:line] [description] -> [fix]
- HIGH: ...
- MEDIUM: ...
- LOW: ...

RECOMMENDATIONS:
1. [Action] (effort, impact)
```

## IMPORTANT NOTES

- Never print secret values in the report; cite the file and line only
- Verify every scanner hit before reporting it (Brakeman produces false positives)
- A confirmed exploitable finding (injection, auth bypass, committed secret) caps the overall security score at 12/25
- Do not run exploit payloads against shared or production environments
