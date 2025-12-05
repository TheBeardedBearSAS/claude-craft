# Security Audit Checklist

## Sensitive Data

- [ ] Tokens in flutter_secure_storage
- [ ] No passwords in SharedPreferences
- [ ] No hardcoded secrets
- [ ] .env in .gitignore
- [ ] Obfuscation enabled in prod

## API & Network

- [ ] HTTPS only
- [ ] Certificate pinning implemented
- [ ] Timeouts configured
- [ ] Secure retry strategy
- [ ] Network error handling

## Authentication

- [ ] Secure JWT tokens
- [ ] Refresh token implemented
- [ ] Clean logout
- [ ] Session timeout
- [ ] Biometry if available

## Validation

- [ ] Client-side validation
- [ ] Server-side validation
- [ ] Input sanitization
- [ ] XSS prevention
- [ ] SQL injection prevention

## Permissions

- [ ] Minimal permissions
- [ ] Request at right time
- [ ] Handle denial
- [ ] Permission documentation

## Production

- [ ] ProGuard/R8 configured
- [ ] Symbols uploaded
- [ ] Production logs disabled
- [ ] Error tracking configured
