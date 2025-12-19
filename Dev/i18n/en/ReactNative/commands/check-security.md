---
description: Check React Native Security
argument-hint: [arguments]
---

# Check React Native Security

## Arguments

$ARGUMENTS

## MISSION

You are a React Native security audit expert. Your mission is to analyze security practices according to the standards defined in `.claude/rules/11-security.md`.

### Step 1: Dependencies and configuration analysis

1. Verify installed security dependencies
2. Analyze sensitive configuration files
3. Check for secrets in code
4. Analyze requested permissions

### Step 2: Secure Storage (6 points)

#### 🔐 Expo SecureStore / Keychain

- [ ] **(2 pts)** Use of `expo-secure-store` or `react-native-keychain` for sensitive data
- [ ] **(1 pt)** No token/secret storage in AsyncStorage
- [ ] **(1 pt)** No plain text password storage
- [ ] **(1 pt)** No sensitive data in non-persisted Redux/Zustand state
- [ ] **(1 pt)** Biometric configuration for sensitive data access if applicable

**Files to check:**
```bash
src/services/storage.ts
src/utils/secureStorage.ts
src/hooks/useAuth.ts
```

Search for dangerous patterns:
```bash
# Search AsyncStorage for sensitive data
grep -r "AsyncStorage.setItem.*token" src/
grep -r "AsyncStorage.setItem.*password" src/
grep -r "AsyncStorage.setItem.*secret" src/
```

### Step 3: Secrets and API keys management (5 points)

#### 🔑 No secrets in code

- [ ] **(2 pts)** No hardcoded API key in source code
- [ ] **(1 pt)** Use of environment variables (`.env`, `app.config.js`)
- [ ] **(1 pt)** `.env` in `.gitignore`
- [ ] **(1 pt)** Documentation of required environment variables (`.env.example`)

**Files to check:**
```bash
.env
.env.example
.gitignore
app.config.js
app.json
```

Search for hardcoded secrets:
```bash
# Suspicious patterns
grep -rE "(api[_-]?key|secret|password|token|private[_-]?key).*=.*['\"][a-zA-Z0-9]{20,}" src/ --exclude-dir=node_modules
grep -rE "https?://[^/]*:([^@]+)@" src/ --exclude-dir=node_modules
```

**Specifically check:**
- No hardcoded AWS, Google, Firebase keys
- No hardcoded OAuth tokens
- No certificates or private keys in repo

### Step 4: Secure network communication (5 points)

#### 🌐 HTTPS and Certificate Pinning

- [ ] **(2 pts)** All communications in HTTPS only
- [ ] **(1 pt)** Certificate pinning implemented for critical APIs
- [ ] **(1 pt)** SSL certificate validation enabled
- [ ] **(1 pt)** Appropriate timeout and retry for requests

**Files to check:**
```bash
src/services/api.ts
src/config/network.ts
app.json (iOS NSAppTransportSecurity)
android/app/src/main/AndroidManifest.xml (android:usesCleartextTraffic)
```

Verify:
```typescript
// Good: HTTPS only
const API_URL = 'https://api.example.com';

// Bad: HTTP
const API_URL = 'http://api.example.com';
```

For iOS (app.json):
```json
{
  "ios": {
    "infoPlist": {
      "NSAppTransportSecurity": {
        "NSAllowsArbitraryLoads": false
      }
    }
  }
}
```

For Android (AndroidManifest.xml):
```xml
<!-- Must be false or absent -->
<application android:usesCleartextTraffic="false">
```

### Step 5: Authentication and authorization (4 points)

#### 🔒 Token and session management

- [ ] **(1 pt)** JWT stored securely (SecureStore)
- [ ] **(1 pt)** Refresh token implemented
- [ ] **(1 pt)** Token expiration handled
- [ ] **(1 pt)** Automatic logout after inactivity (if applicable)

**Files to check:**
```bash
src/services/auth.ts
src/hooks/useAuth.ts
src/contexts/AuthContext.tsx
```

**Verify flow:**
```typescript
// Good pattern
const token = await SecureStore.getItemAsync('access_token');
const refreshToken = await SecureStore.getItemAsync('refresh_token');

// Bad pattern
const token = await AsyncStorage.getItem('access_token');
```

### Step 6: Permissions and user data (3 points)

#### 📱 Android/iOS Permissions

- [ ] **(1 pt)** Requested permissions justified and minimal
- [ ] **(1 pt)** Runtime permission requests (not all at startup)
- [ ] **(1 pt)** Explanatory messages for sensitive permissions

**Files to check:**
```bash
app.json (iOS/Android permissions)
android/app/src/main/AndroidManifest.xml
ios/[AppName]/Info.plist
```

**Permissions to audit:**
- Camera (NSCameraUsageDescription / CAMERA)
- Location (NSLocationWhenInUseUsageDescription / ACCESS_FINE_LOCATION)
- Contacts (NSContactsUsageDescription / READ_CONTACTS)
- Storage (READ_EXTERNAL_STORAGE, WRITE_EXTERNAL_STORAGE)

### Step 7: Code protection (2 points)

#### 🛡️ Obfuscation and protection

- [ ] **(1 pt)** Obfuscation enabled for production builds (ProGuard/R8)
- [ ] **(1 pt)** Sensitive logs disabled in production (no console.log of tokens)

**Files to check:**
```bash
android/app/build.gradle (minifyEnabled, shrinkResources)
src/**/*.ts (console.log statements)
```

For Android (build.gradle):
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

Search for sensitive logs:
```bash
grep -rE "console\.(log|debug|info).*token" src/
grep -rE "console\.(log|debug|info).*password" src/
grep -rE "console\.(log|debug|info).*secret" src/
```

### Step 8: Calculate score

```
┌──────────────────────────────────┬─────────┬────────┐
│ Criterion                        │ Score   │ Status │
├──────────────────────────────────┼─────────┼────────┤
│ Secure storage                   │ XX/6    │ ✅/⚠️/❌│
│ Secrets and API keys             │ XX/5    │ ✅/⚠️/❌│
│ Network communication            │ XX/5    │ ✅/⚠️/❌│
│ Authentication                   │ XX/4    │ ✅/⚠️/❌│
│ Permissions                      │ XX/3    │ ✅/⚠️/❌│
│ Code protection                  │ XX/2    │ ✅/⚠️/❌│
├──────────────────────────────────┼─────────┼────────┤
│ TOTAL SECURITY                   │ XX/25   │ ✅/⚠️/❌│
└──────────────────────────────────┴─────────┴────────┘
```

**Legend:**
- ✅ Excellent (≥ 20/25)
- ⚠️ Warning (15-19/25)
- ❌ Critical (< 15/25)

### Step 9: Vulnerability scan

Execute the following commands to detect vulnerabilities:

#### 🔍 NPM Audit

```bash
npm audit
```

Analyze results:
- **Critical vulnerabilities:** XX (target: 0)
- **High vulnerabilities:** XX (target: 0)
- **Medium vulnerabilities:** XX (target: < 5)
- **Low vulnerabilities:** XX

#### 📦 Outdated dependencies

```bash
npm outdated
```

List outdated security dependencies:
- `expo-secure-store`
- `react-native-keychain`
- `react-native-ssl-pinning`
- etc.

### Step 10: Detailed report

## 📊 SECURITY AUDIT RESULTS

### ✅ Strengths

List identified good practices:
- [Practice 1 with location]
- [Practice 2 with location]

### 🚨 Critical Vulnerabilities

List critical security issues (immediate ❌ score):

1. **[CRITICAL - Issue 1]**
   - **Severity:** CRITICAL
   - **Location:** [Affected files]
   - **Risk:** [Risk description]
   - **Example:**
   ```typescript
   // Vulnerable code
   const API_KEY = "sk_live_123456789abcdef"; // ❌ CRITICAL
   ```
   - **Immediate fix:**
   ```typescript
   // Secure code
   const API_KEY = process.env.EXPO_PUBLIC_API_KEY; // ✅
   ```

### ⚠️ Improvement Points

List issues by priority:

1. **[Issue 1]**
   - **Severity:** High/Medium
   - **Location:** [Affected files]
   - **Risk:** [Description]
   - **Recommendation:** [Action]

2. **[Issue 2]**
   - **Severity:** High/Medium
   - **Location:** [Affected files]
   - **Risk:** [Description]
   - **Recommendation:** [Action]

### 📈 Security Metrics

#### Dependency vulnerabilities

```
┌─────────────────────┬──────────┐
│ Severity            │ Count    │
├─────────────────────┼──────────┤
│ 🔴 Critical         │ XX       │
│ 🟠 High             │ XX       │
│ 🟡 Medium           │ XX       │
│ 🟢 Low              │ XX       │
└─────────────────────┴──────────┘
```

#### Detected secrets

- **Hardcoded API keys:** XX (target: 0)
- **Hardcoded tokens:** XX (target: 0)
- **Hardcoded passwords:** XX (target: 0)
- **Private keys in repo:** XX (target: 0)

#### Permissions

- **Total permissions requested:** XX
- **Sensitive permissions:** XX
- **Unjustified permissions:** XX (target: 0)

#### Storage

- **SecureStore/Keychain usage:** Yes/No
- **Sensitive data in AsyncStorage:** XX occurrences (target: 0)
- **Biometry configured:** Yes/No

#### Communication

- **HTTP endpoints (insecure):** XX (target: 0)
- **HTTPS endpoints:** XX
- **Certificate pinning:** Yes/No
- **Cleartext traffic allowed:** Yes/No (target: No)

### 🎯 TOP 3 PRIORITY ACTIONS

#### 1. [SECURITY ACTION #1]
- **Effort:** Low/Medium/High
- **Impact:** CRITICAL/High/Medium
- **Risk if not fixed:** [Risk description]
- **Description:** [Vulnerability detail]
- **Solution:** [Concrete action and code]
- **Affected files:**
  - `[file1]` - [issue]
  - `[file2]` - [issue]
- **Fix example:**
```typescript
// BEFORE (vulnerable)
[vulnerable code]

// AFTER (secure)
[secure code]
```

#### 2. [SECURITY ACTION #2]
- **Effort:** Low/Medium/High
- **Impact:** CRITICAL/High/Medium
- **Risk if not fixed:** [Description]
- **Description:** [Detail]
- **Solution:** [Action]
- **Affected files:** [List]

#### 3. [SECURITY ACTION #3]
- **Effort:** Low/Medium/High
- **Impact:** CRITICAL/High/Medium
- **Risk if not fixed:** [Description]
- **Description:** [Detail]
- **Solution:** [Action]
- **Affected files:** [List]

---

## 🛡️ OWASP Mobile Security Checklist

Reference: [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)

- [ ] **M1: Improper Platform Usage** - Correct platform API usage
- [ ] **M2: Insecure Data Storage** - Secure storage (SecureStore/Keychain)
- [ ] **M3: Insecure Communication** - HTTPS + Certificate Pinning
- [ ] **M4: Insecure Authentication** - Robust authentication with JWT
- [ ] **M5: Insufficient Cryptography** - No custom crypto, use platform APIs
- [ ] **M6: Insecure Authorization** - Server-side authorization validated
- [ ] **M7: Client Code Quality** - Quality code, obfuscated in production
- [ ] **M8: Code Tampering** - Protection against modification (jailbreak detection)
- [ ] **M9: Reverse Engineering** - Code obfuscation and protection
- [ ] **M10: Extraneous Functionality** - No backdoors or debug logs in prod

---

## 🚀 Recommendations

### Immediate actions (today)
1. Fix all CRITICAL vulnerabilities
2. Remove all hardcoded secrets
3. Run `npm audit fix` for auto-fixable vulnerabilities

### Short term actions (this week)
1. Implement SecureStore for all tokens
2. Enable HTTPS only (block HTTP)
3. Add .env to .gitignore if absent
4. Update vulnerable dependencies

### Medium term actions (this month)
1. Implement certificate pinning
2. Enable obfuscation in production
3. Complete permissions audit
4. Team training on best practices

### Recommended tools

```bash
# Install security tools
npm install --save-dev @react-native-community/cli-doctor
npm audit

# For iOS
gem install fastlane

# For Android
# Use ProGuard/R8 (already included)
```

---

## 📚 References

- `.claude/rules/11-security.md` - Security standards
- [OWASP Mobile Top 10](https://owasp.org/www-project-mobile-top-10/)
- [React Native Security](https://reactnative.dev/docs/security)
- [Expo Security](https://docs.expo.dev/guides/security/)

---

**Final score: XX/25**

**⚠️ WARNING: A score < 15/25 in security requires immediate action before any production deployment.**
