# Security Audit Checklist

Comprehensive security audit for React Native application.

---

## 1. Sensitive Data Storage

### SecureStore / Keychain

- [ ] Tokens stored in SecureStore (iOS Keychain / Android Keystore)
- [ ] Refresh tokens secured
- [ ] API keys not exposed
- [ ] Credentials never in plain text
- [ ] Biometric keys protected

### Code

- [ ] No hardcoded secrets
- [ ] No tokens in source code
- [ ] No credentials in logs
- [ ] `.env` in `.gitignore`
- [ ] Secrets in EAS Secrets (production)

### Storage

- [ ] MMKV encryption enabled (sensitive data)
- [ ] No PII in AsyncStorage
- [ ] Storage cleared on logout
- [ ] Backup encrypted (iOS/Android)

---

## 2. API Security

### Authentication

- [ ] JWT tokens with short expiration
- [ ] Refresh token mechanism
- [ ] Token rotation implemented
- [ ] Automatic token refresh
- [ ] Logout clears all tokens

### HTTPS

- [ ] All API calls in HTTPS
- [ ] No HTTP in production
- [ ] Certificate pinning (if critical)
- [ ] TLS 1.2+ minimum

### Headers

- [ ] Authorization header present
- [ ] CSRF protection (if applicable)
- [ ] API version in headers
- [ ] Request ID tracking
- [ ] User-Agent present

### Request Security

- [ ] Timeout configured (10s max)
- [ ] Retry logic with backoff
- [ ] Client-side rate limiting
- [ ] Request validation
- [ ] Response validation

---

## 3. Input Validation

### User Input

- [ ] Validation with Zod/Yup
- [ ] Sanitization before display
- [ ] Max length enforced
- [ ] Strict type checking
- [ ] Secure regex validation

### Forms

- [ ] Email validation
- [ ] Password strength enforcement
- [ ] Special characters handled
- [ ] SQL injection prevented (backend)
- [ ] XSS prevention

### URL/Deep Links

- [ ] URL validation
- [ ] Deep link scheme validation
- [ ] Parameter sanitization
- [ ] Whitelist allowed hosts
- [ ] Redirect validation

---

## 4. Authentication & Authorization

### Authentication

- [ ] Secure login flow
- [ ] Biometric authentication (if available)
- [ ] 2FA support (if required)
- [ ] Secure password reset
- [ ] Account lockout after attempts

### Authorization

- [ ] Role-based access control
- [ ] Permission checks before actions
- [ ] Protected routes implementation
- [ ] API permissions validated
- [ ] Resource ownership verified

### Session Management

- [ ] Session timeout configured
- [ ] Automatic logout on inactivity
- [ ] Concurrent session handling
- [ ] Session revocation
- [ ] Secure remember me

---

## 5. Code Security

### Dependencies

- [ ] `npm audit` clean (0 vulnerabilities)
- [ ] Dependencies up to date
- [ ] No suspicious packages
- [ ] Lock file committed
- [ ] Regular updates scheduled

### Code Quality

- [ ] ESLint security rules
- [ ] TypeScript strict mode
- [ ] No `eval()` usage
- [ ] No `dangerouslySetInnerHTML`
- [ ] No malicious obfuscated code

### Secrets Management

- [ ] Environment variables used
- [ ] EAS Secrets for production
- [ ] Config files gitignored
- [ ] No secrets in logs
- [ ] Secrets rotation strategy

---

## 6. Platform Security

### iOS

- [ ] Keychain access configured
- [ ] NSAllowsArbitraryLoads = false
- [ ] SSL pinning (if critical)
- [ ] Screenshot prevention (if sensitive)
- [ ] Touch ID / Face ID configured

### Android

- [ ] ProGuard / R8 enabled
- [ ] Network security config
- [ ] Certificate pinning (if critical)
- [ ] Screenshot prevention (if sensitive)
- [ ] Fingerprint / Face configured

### Permissions

- [ ] Minimal permissions
- [ ] Runtime permissions handled
- [ ] Permission rationale shown
- [ ] Denied permissions handled
- [ ] Permissions documented

---

## 7. Network Security

### Communication

- [ ] HTTPS only
- [ ] No mixed content
- [ ] Certificate validation
- [ ] Pinning (high security)
- [ ] No clear text traffic

### Data Transit

- [ ] Sensitive data encrypted
- [ ] No credentials in URL
- [ ] POST for sensitive data
- [ ] File uploads secured
- [ ] Download validation

---

## 8. Offline Security

### Local Data

- [ ] Sensitive data encrypted
- [ ] Cache invalidation
- [ ] Old data cleanup
- [ ] Secure offline auth
- [ ] Sync conflicts handled

### Storage Cleanup

- [ ] Logout clears cache
- [ ] Temp files deleted
- [ ] Images cached securely
- [ ] Database encrypted
- [ ] Backup encrypted

---

## 9. Error Handling

### Error Messages

- [ ] No sensitive info in errors
- [ ] Generic errors to users
- [ ] Detailed logs server-side only
- [ ] Stack traces hidden (production)
- [ ] Error tracking configured

### Logging

- [ ] No credentials logged
- [ ] No PII logged
- [ ] Logs sanitized
- [ ] Log rotation configured
- [ ] Crash reports secured

---

## 10. Third-Party Security

### SDKs

- [ ] SDKs from trusted sources
- [ ] Privacy policies reviewed
- [ ] Data sharing documented
- [ ] Minimal permissions
- [ ] Analytics anonymized

### APIs

- [ ] Third-party APIs secured
- [ ] API keys in secrets
- [ ] OAuth properly implemented
- [ ] Minimal scope
- [ ] Revocable tokens

---

## 11. WebView Security (if used)

- [ ] HTTPS only
- [ ] JavaScript injection prevented
- [ ] File access restricted
- [ ] Content security policy
- [ ] Domain whitelist

---

## 12. Biometric Security

- [ ] Fallback to passcode
- [ ] Enrollment verified
- [ ] Secure element used
- [ ] Biometric data never stored
- [ ] Privacy respected

---

## 13. Code Obfuscation (Production)

- [ ] Code obfuscated (Hermes)
- [ ] Source maps not included
- [ ] Debug info removed
- [ ] Console logs removed
- [ ] Dead code eliminated

---

## 14. Compliance

### GDPR (if EU)

- [ ] Privacy policy
- [ ] Consent management
- [ ] Data export feature
- [ ] Data deletion feature
- [ ] Cookie consent

### CCPA (if US/CA)

- [ ] Do not sell option
- [ ] Data disclosure
- [ ] Deletion rights
- [ ] Privacy notice

### HIPAA (if health data)

- [ ] Encryption at rest
- [ ] Encryption in transit
- [ ] Access controls
- [ ] Audit logging
- [ ] BAA in place

---

## 15. Monitoring & Response

### Monitoring

- [ ] Security incidents tracked
- [ ] Anomaly detection
- [ ] Failed auth monitoring
- [ ] API abuse detection
- [ ] Performance monitoring

### Incident Response

- [ ] Response plan documented
- [ ] Contact list updated
- [ ] Rollback procedure
- [ ] Communication plan
- [ ] Post-mortem process

---

## 16. Testing

### Security Tests

- [ ] Penetration testing done
- [ ] OWASP Mobile Top 10 checked
- [ ] Man-in-the-middle tested
- [ ] Session hijacking tested
- [ ] SQL injection tested (backend)

### Code Analysis

- [ ] Static analysis ran
- [ ] Dynamic analysis ran
- [ ] Dependency scanning
- [ ] Secret scanning
- [ ] License compliance

---

## Final Check

- [ ] All critical items addressed
- [ ] High severity fixed
- [ ] Medium severity planned
- [ ] Documentation updated
- [ ] Team trained

---

## Security Score

- **Critical**: ___ / ___ ✅
- **High**: ___ / ___ ✅
- **Medium**: ___ / ___ ⚠️
- **Low**: ___ / ___ ℹ️

---

**Security is not a feature, it's a requirement.**

Report generated: {{DATE}}
Auditor: {{NAME}}
