# Security - React Native Best Practices

## Introduction

La sécurité est critique dans les applications mobiles qui manipulent des données sensibles.

---

## Secure Storage

### 1. Expo SecureStore (iOS Keychain / Android Keystore)

```typescript
// services/storage/secure.storage.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class SecureStorage {
  /**
   * Store sensitive data securely
   * iOS: Keychain
   * Android: Encrypted SharedPreferences with Keystore
   */
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Web fallback (not secure, warn user)
      console.warn('SecureStore not available on web, using localStorage');
      localStorage.setItem(key, value);
      return;
    }

    await SecureStore.setItemAsync(key, value, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }

    return await SecureStore.getItemAsync(key);
  }

  async removeItem(key: string): Promise<void> {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }

    await SecureStore.deleteItemAsync(key);
  }
}

export const secureStorage = new SecureStorage();
```

### 2. MMKV with Encryption

```typescript
// services/storage/mmkv.storage.ts
import { MMKV } from 'react-native-mmkv';

// Encrypted storage
export const secureMMKV = new MMKV({
  id: 'secure-storage',
  encryptionKey: 'your-encryption-key', // Store in Keychain/Keystore
});

// Usage
secureMMKV.set('accessToken', token);
const token = secureMMKV.getString('accessToken');
```

### What to Store Securely

```typescript
// ✅ Store in SecureStore
// - Access tokens
// - Refresh tokens
// - API keys
// - User credentials
// - Biometric keys
// - Encryption keys

// ✅ Store in MMKV (encrypted)
// - User preferences
// - Session data
// - Cache data

// ❌ NEVER store in plain text
// - Passwords
// - Credit card numbers
// - Social security numbers
// - Health data
```

---

## API Security

### 1. Token Management

```typescript
// services/auth/token.service.ts
import { secureStorage } from '@/services/storage/secure.storage';

class TokenService {
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      secureStorage.setItem(this.ACCESS_TOKEN_KEY, accessToken),
      secureStorage.setItem(this.REFRESH_TOKEN_KEY, refreshToken),
    ]);
  }

  async getAccessToken(): Promise<string | null> {
    return await secureStorage.getItem(this.ACCESS_TOKEN_KEY);
  }

  async getRefreshToken(): Promise<string | null> {
    return await secureStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  async clearTokens(): Promise<void> {
    await Promise.all([
      secureStorage.removeItem(this.ACCESS_TOKEN_KEY),
      secureStorage.removeItem(this.REFRESH_TOKEN_KEY),
    ]);
  }

  async refreshAccessToken(): Promise<string> {
    const refreshToken = await this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    // Call refresh endpoint
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      await this.clearTokens();
      throw new Error('Token refresh failed');
    }

    const { accessToken, refreshToken: newRefreshToken } = await response.json();
    await this.saveTokens(accessToken, newRefreshToken);

    return accessToken;
  }
}

export const tokenService = new TokenService();
```

### 2. API Request Security

```typescript
// services/api/interceptors.ts
import { tokenService } from '@/services/auth/token.service';
import type { AxiosInstance, AxiosError } from 'axios';
import { router } from 'expo-router';

export const setupInterceptors = (instance: AxiosInstance) => {
  // Request interceptor - Add auth token
  instance.interceptors.request.use(
    async (config) => {
      const token = await tokenService.getAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add request ID for tracking
      config.headers['X-Request-ID'] = generateRequestId();

      // Add app version
      config.headers['X-App-Version'] = Constants.expoConfig?.version;

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor - Handle token refresh
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;

      // Token expired, try to refresh
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await tokenService.refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // Refresh failed, logout user
          await tokenService.clearTokens();
          router.replace('/(auth)/login');
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
};

function generateRequestId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
```

### 3. Certificate Pinning

```typescript
// For bare workflow with react-native-ssl-pinning
import { fetch as sslFetch } from 'react-native-ssl-pinning';

const fetchWithPinning = async () => {
  try {
    const response = await sslFetch('https://api.example.com/data', {
      method: 'GET',
      sslPinning: {
        certs: ['certificate'], // Certificate in android/app/src/main/assets/
      },
    });
    return response.json();
  } catch (error) {
    console.error('SSL Pinning failed:', error);
    throw error;
  }
};
```

---

## Input Validation & Sanitization

### 1. Validation with Zod

```typescript
// utils/validation.schemas.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email too long'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain uppercase, lowercase, and number'
    ),
});

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Name required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters'),
  bio: z
    .string()
    .max(500, 'Bio too long')
    .optional(),
  website: z
    .string()
    .url('Invalid URL')
    .optional()
    .or(z.literal('')),
});

// Usage
const validateLogin = (data: unknown) => {
  try {
    return loginSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle validation errors
      console.error(error.errors);
    }
    throw error;
  }
};
```

### 2. Sanitization

```typescript
// utils/sanitize.utils.ts

/**
 * Sanitize user input to prevent XSS
 */
export const sanitizeString = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Sanitize HTML (if needed)
 */
export const sanitizeHTML = (html: string): string => {
  // Use DOMPurify or similar
  // For React Native, use react-native-render-html with sanitization
  return html; // Implement based on your needs
};

/**
 * Validate and sanitize URL
 */
export const sanitizeURL = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    // Only allow http and https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    return parsed.toString();
  } catch {
    return null;
  }
};
```

---

## Biometric Authentication

### 1. Setup

```bash
npx expo install expo-local-authentication
```

### 2. Implementation

```typescript
// hooks/useBiometrics.ts
import * as LocalAuthentication from 'expo-local-authentication';
import { useState, useEffect } from 'react';

export const useBiometrics = () => {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<string | null>(null);

  useEffect(() => {
    checkBiometrics();
  }, []);

  const checkBiometrics = async () => {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    setIsAvailable(compatible && enrolled);

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      setBiometricType('Face ID');
    } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      setBiometricType('Touch ID');
    }
  };

  const authenticate = async (): Promise<boolean> => {
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to continue',
        fallbackLabel: 'Use passcode',
        cancelLabel: 'Cancel',
      });

      return result.success;
    } catch (error) {
      console.error('Biometric authentication error:', error);
      return false;
    }
  };

  return {
    isAvailable,
    biometricType,
    authenticate,
  };
};

// Usage
const LoginScreen = () => {
  const { isAvailable, biometricType, authenticate } = useBiometrics();

  const handleBiometricLogin = async () => {
    const success = await authenticate();
    if (success) {
      // Login user
    }
  };

  return (
    <View>
      {isAvailable && (
        <Button onPress={handleBiometricLogin}>
          Login with {biometricType}
        </Button>
      )}
    </View>
  );
};
```

---

## Code Obfuscation

### 1. react-native-obfuscating-transformer

```bash
npm install --save-dev react-native-obfuscating-transformer
```

### 2. metro.config.js

```javascript
const obfuscatingTransformer = require('react-native-obfuscating-transformer');

module.exports = {
  transformer: {
    babelTransformerPath: obfuscatingTransformer,
  },
};
```

### 3. What to Obfuscate

```typescript
// ✅ Obfuscate
// - API keys (but prefer env variables)
// - Business logic
// - Algorithms
// - Sensitive constants

// ❌ Don't rely solely on obfuscation
// It's security through obscurity, not real security
// Always use proper encryption for sensitive data
```

---

## Environment Variables Security

### 1. .env Setup

```bash
# .env.development
EXPO_PUBLIC_API_URL=https://dev-api.example.com
EXPO_PUBLIC_ENVIRONMENT=development

# Don't commit secrets!
# Use EAS Secrets for sensitive values
```

### 2. EAS Secrets

```bash
# Set secret
eas secret:create --name API_KEY --value "your-secret-key" --type string

# List secrets
eas secret:list

# Use in app.config.ts
export default {
  expo: {
    extra: {
      apiKey: process.env.API_KEY,
    },
  },
};
```

### 3. Access in App

```typescript
// config/env.ts
import Constants from 'expo-constants';

export const ENV = {
  API_URL: Constants.expoConfig?.extra?.apiUrl || 'https://api.example.com',
  API_KEY: Constants.expoConfig?.extra?.apiKey,
  ENVIRONMENT: Constants.expoConfig?.extra?.environment || 'production',
};

// ❌ NEVER
export const ENV = {
  API_KEY: 'hardcoded-key-in-source', // NEVER DO THIS!
};
```

---

## Network Security

### 1. HTTPS Only

```typescript
// services/api/client.ts
import axios from 'axios';

export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ensure HTTPS
if (!ENV.API_URL.startsWith('https://')) {
  console.error('API URL must use HTTPS');
  // In production, throw error
  if (ENV.ENVIRONMENT === 'production') {
    throw new Error('Insecure API URL');
  }
}
```

### 2. Timeout Configuration

```typescript
// Prevent hanging requests
const apiClient = axios.create({
  timeout: 10000, // 10 seconds
  timeoutErrorMessage: 'Request timeout',
});
```

---

## Screen Security

### 1. Prevent Screenshots (iOS/Android)

```typescript
// utils/security.utils.ts
import { Platform } from 'react-native';

export const preventScreenshots = () => {
  if (Platform.OS === 'android') {
    // Use react-native-screen-capture or similar
    // ScreenCapture.preventScreenCapture();
  }
  // iOS: Set UIApplicationUserInterfaceStylePrivacy in Info.plist
};

export const allowScreenshots = () => {
  if (Platform.OS === 'android') {
    // ScreenCapture.allowScreenCapture();
  }
};
```

### 2. Secure Text Input

```typescript
// components/SecureTextInput.tsx
import { TextInput, type TextInputProps } from 'react-native';

interface SecureTextInputProps extends TextInputProps {
  autoComplete?: 'off';
}

export const SecureTextInput: FC<SecureTextInputProps> = (props) => {
  return (
    <TextInput
      {...props}
      autoComplete="off"
      autoCorrect={false}
      autoCapitalize="none"
      secureTextEntry
      textContentType="none" // Disable autofill
    />
  );
};
```

---

## Deep Link Security

### 1. Validate Deep Links

```typescript
// utils/deeplink.utils.ts
export const validateDeepLink = (url: string): boolean => {
  try {
    const parsed = new URL(url);

    // Only allow your app's scheme
    if (parsed.protocol !== 'myapp:') {
      return false;
    }

    // Validate host
    const allowedHosts = ['login', 'profile', 'article'];
    if (!allowedHosts.includes(parsed.host)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// Usage in app
const handleDeepLink = (url: string) => {
  if (!validateDeepLink(url)) {
    console.error('Invalid deep link:', url);
    return;
  }

  // Process valid deep link
  const parsed = new URL(url);
  router.push(parsed.pathname);
};
```

---

## Security Checklist

### Development Phase
- [ ] Sensitive data in SecureStore/Keychain
- [ ] API tokens secured
- [ ] Input validation implemented (Zod)
- [ ] HTTPS enforced
- [ ] Environment variables configured
- [ ] Biometric auth (if needed)
- [ ] Deep links validated
- [ ] No hardcoded secrets in code

### Pre-Production
- [ ] Code obfuscation enabled
- [ ] Certificate pinning (if needed)
- [ ] Screenshot prevention (if needed)
- [ ] EAS Secrets configured
- [ ] Security audit completed
- [ ] Penetration testing done

### Post-Production
- [ ] Monitor for security incidents
- [ ] Regular dependency updates
- [ ] Token rotation strategy
- [ ] Incident response plan

---

## Common Vulnerabilities

### 1. XSS (Cross-Site Scripting)

```typescript
// ❌ VULNERABLE
<Text>{userInput}</Text> // If userInput contains malicious HTML

// ✅ SAFE
<Text>{sanitizeString(userInput)}</Text>
```

### 2. SQL Injection (Backend)

```typescript
// ❌ VULNERABLE (backend)
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ SAFE (backend)
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email]);
```

### 3. Man-in-the-Middle

```typescript
// ❌ VULNERABLE
fetch('http://api.example.com/data'); // HTTP!

// ✅ SAFE
fetch('https://api.example.com/data'); // HTTPS
// + Certificate pinning for extra security
```

---

## Security Resources

- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [React Native Security Best Practices](https://reactnative.dev/docs/security)
- [Expo Security](https://docs.expo.dev/guides/security/)

---

**La sécurité n'est pas une fonctionnalité, c'est une responsabilité.**
