# Checklist Security Audit

Audit de sécurité complet pour application React Native.

---

## 1. Sensitive Data Storage

### SecureStore / Keychain

- [ ] Tokens stockés dans SecureStore (iOS Keychain / Android Keystore)
- [ ] Refresh tokens sécurisés
- [ ] API keys non exposées
- [ ] Credentials jamais en plain text
- [ ] Biometric keys protégés

### Code

- [ ] Pas de secrets hardcodés
- [ ] Pas de tokens dans code source
- [ ] Pas de credentials dans logs
- [ ] `.env` dans `.gitignore`
- [ ] Secrets dans EAS Secrets (production)

### Storage

- [ ] MMKV encryption activé (données sensibles)
- [ ] Pas de PII dans AsyncStorage
- [ ] Storage cleared au logout
- [ ] Backup encrypted (iOS/Android)

---

## 2. API Security

### Authentication

- [ ] JWT tokens avec expiration courte
- [ ] Refresh token mechanism
- [ ] Token rotation implémenté
- [ ] Automatic token refresh
- [ ] Logout clears all tokens

### HTTPS

- [ ] Toutes API calls en HTTPS
- [ ] Pas de HTTP en production
- [ ] Certificate pinning (si critique)
- [ ] TLS 1.2+ minimum

### Headers

- [ ] Authorization header présent
- [ ] CSRF protection (si applicable)
- [ ] API version dans headers
- [ ] Request ID tracking
- [ ] User-Agent présent

### Request Security

- [ ] Timeout configuré (10s max)
- [ ] Retry logic avec backoff
- [ ] Rate limiting côté client
- [ ] Request validation
- [ ] Response validation

---

## 3. Input Validation

### User Input

- [ ] Validation avec Zod/Yup
- [ ] Sanitization avant affichage
- [ ] Max length enforced
- [ ] Type checking strict
- [ ] Regex validation secure

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
- [ ] Biometric authentication (si disponible)
- [ ] 2FA support (si requis)
- [ ] Password reset secure
- [ ] Account lockout après tentatives

### Authorization

- [ ] Role-based access control
- [ ] Permission checks avant actions
- [ ] Protected routes implementation
- [ ] API permissions validated
- [ ] Resource ownership verified

### Session Management

- [ ] Session timeout configuré
- [ ] Automatic logout inactivity
- [ ] Concurrent session handling
- [ ] Session revocation
- [ ] Remember me sécurisé

---

## 5. Code Security

### Dependencies

- [ ] `npm audit` clean (0 vulnerabilities)
- [ ] Dependencies à jour
- [ ] Pas de packages suspects
- [ ] Lock file committed
- [ ] Regular updates scheduled

### Code Quality

- [ ] ESLint security rules
- [ ] TypeScript strict mode
- [ ] No `eval()` usage
- [ ] No `dangerouslySetInnerHTML`
- [ ] Pas de code obfusqué malicieux

### Secrets Management

- [ ] Environment variables utilisées
- [ ] EAS Secrets pour production
- [ ] Config files gitignored
- [ ] No secrets in logs
- [ ] Secrets rotation strategy

---

## 6. Platform Security

### iOS

- [ ] Keychain access configured
- [ ] NSAllowsArbitraryLoads = false
- [ ] SSL pinning (si critique)
- [ ] Screenshot prevention (si sensible)
- [ ] Touch ID / Face ID configured

### Android

- [ ] ProGuard / R8 enabled
- [ ] Network security config
- [ ] Certificate pinning (si critique)
- [ ] Screenshot prevention (si sensible)
- [ ] Fingerprint / Face configured

### Permissions

- [ ] Permissions minimales
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
- [ ] Pinning (haute sécurité)
- [ ] No clear text traffic

### Data Transit

- [ ] Sensitive data encrypted
- [ ] No credentials in URL
- [ ] POST pour sensitive data
- [ ] File uploads secured
- [ ] Download validation

---

## 8. Offline Security

### Local Data

- [ ] Sensitive data encrypted
- [ ] Cache invalidation
- [ ] Old data cleanup
- [ ] Offline auth secure
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

- [ ] SDKs trusted sources
- [ ] Privacy policies reviewed
- [ ] Data sharing documented
- [ ] Minimal permissions
- [ ] Analytics anonymized

### APIs

- [ ] Third-party APIs secured
- [ ] API keys in secrets
- [ ] OAuth properly implemented
- [ ] Scope minimal
- [ ] Tokens revocable

---

## 11. WebView Security (si utilisé)

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

### GDPR (si EU)

- [ ] Privacy policy
- [ ] Consent management
- [ ] Data export feature
- [ ] Data deletion feature
- [ ] Cookie consent

### CCPA (si US/CA)

- [ ] Do not sell option
- [ ] Data disclosure
- [ ] Deletion rights
- [ ] Privacy notice

### HIPAA (si health data)

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
