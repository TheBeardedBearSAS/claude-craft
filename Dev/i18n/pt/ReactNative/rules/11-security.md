# Segurança - Melhores Práticas React Native

## Introdução

A segurança é crítica em aplicações móveis que manipulam dados sensíveis.

---

## Armazenamento Seguro

### 1. Expo SecureStore (iOS Keychain / Android Keystore)

```typescript
// services/storage/secure.storage.ts
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class SecureStorage {
  /**
   * Armazena dados sensíveis de forma segura
   * iOS: Keychain
   * Android: Encrypted SharedPreferences com Keystore
   */
  async setItem(key: string, value: string): Promise<void> {
    if (Platform.OS === 'web') {
      // Fallback web (não seguro, avisar usuário)
      console.warn('SecureStore não disponível na web, usando localStorage');
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

### 2. MMKV com Encriptação

```typescript
// services/storage/mmkv.storage.ts
import { MMKV } from 'react-native-mmkv';

// Armazenamento encriptado
export const secureMMKV = new MMKV({
  id: 'secure-storage',
  encryptionKey: 'your-encryption-key', // Armazenar no Keychain/Keystore
});

// Uso
secureMMKV.set('accessToken', token);
const token = secureMMKV.getString('accessToken');
```

### O Que Armazenar de Forma Segura

```typescript
// ✅ Armazenar no SecureStore
// - Access tokens
// - Refresh tokens
// - API keys
// - Credenciais do usuário
// - Chaves biométricas
// - Chaves de encriptação

// ✅ Armazenar no MMKV (encriptado)
// - Preferências do usuário
// - Dados de sessão
// - Dados em cache

// ❌ NUNCA armazenar em texto simples
// - Senhas
// - Números de cartão de crédito
// - Números de segurança social
// - Dados de saúde
```

---

## Segurança de API

### 1. Gerenciamento de Tokens

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
      throw new Error('Nenhum refresh token disponível');
    }

    // Chamar endpoint de refresh
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      await this.clearTokens();
      throw new Error('Falha ao atualizar token');
    }

    const { accessToken, refreshToken: newRefreshToken } = await response.json();
    await this.saveTokens(accessToken, newRefreshToken);

    return accessToken;
  }
}

export const tokenService = new TokenService();
```

### 2. Segurança de Requisições API

```typescript
// services/api/interceptors.ts
import { tokenService } from '@/services/auth/token.service';
import type { AxiosInstance, AxiosError } from 'axios';
import { router } from 'expo-router';

export const setupInterceptors = (instance: AxiosInstance) => {
  // Interceptor de requisição - Adicionar token de autenticação
  instance.interceptors.request.use(
    async (config) => {
      const token = await tokenService.getAccessToken();

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Adicionar ID de requisição para rastreamento
      config.headers['X-Request-ID'] = generateRequestId();

      // Adicionar versão do app
      config.headers['X-App-Version'] = Constants.expoConfig?.version;

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Interceptor de resposta - Lidar com renovação de token
  instance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config;

      // Token expirado, tentar renovar
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          const newToken = await tokenService.refreshAccessToken();
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return instance(originalRequest);
        } catch (refreshError) {
          // Falha na renovação, fazer logout do usuário
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
// Para bare workflow com react-native-ssl-pinning
import { fetch as sslFetch } from 'react-native-ssl-pinning';

const fetchWithPinning = async () => {
  try {
    const response = await sslFetch('https://api.example.com/data', {
      method: 'GET',
      sslPinning: {
        certs: ['certificate'], // Certificado em android/app/src/main/assets/
      },
    });
    return response.json();
  } catch (error) {
    console.error('Falha no SSL Pinning:', error);
    throw error;
  }
};
```

---

## Validação e Sanitização de Entrada

### 1. Validação com Zod

```typescript
// utils/validation.schemas.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .email('Formato de email inválido')
    .max(255, 'Email muito longo'),
  password: z
    .string()
    .min(8, 'Senha deve ter pelo menos 8 caracteres')
    .max(128, 'Senha muito longa')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Senha deve conter maiúscula, minúscula e número'
    ),
});

export const profileUpdateSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome obrigatório')
    .max(100, 'Nome muito longo')
    .regex(/^[a-zA-Z\s]+$/, 'Nome só pode conter letras'),
  bio: z
    .string()
    .max(500, 'Bio muito longa')
    .optional(),
  website: z
    .string()
    .url('URL inválida')
    .optional()
    .or(z.literal('')),
});

// Uso
const validateLogin = (data: unknown) => {
  try {
    return loginSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Lidar com erros de validação
      console.error(error.errors);
    }
    throw error;
  }
};
```

### 2. Sanitização

```typescript
// utils/sanitize.utils.ts

/**
 * Sanitizar entrada do usuário para prevenir XSS
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
 * Sanitizar HTML (se necessário)
 */
export const sanitizeHTML = (html: string): string => {
  // Usar DOMPurify ou similar
  // Para React Native, usar react-native-render-html com sanitização
  return html; // Implementar conforme necessidade
};

/**
 * Validar e sanitizar URL
 */
export const sanitizeURL = (url: string): string | null => {
  try {
    const parsed = new URL(url);
    // Permitir apenas http e https
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

## Autenticação Biométrica

### 1. Configuração

```bash
npx expo install expo-local-authentication
```

### 2. Implementação

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
        promptMessage: 'Autentique-se para continuar',
        fallbackLabel: 'Usar código',
        cancelLabel: 'Cancelar',
      });

      return result.success;
    } catch (error) {
      console.error('Erro de autenticação biométrica:', error);
      return false;
    }
  };

  return {
    isAvailable,
    biometricType,
    authenticate,
  };
};

// Uso
const LoginScreen = () => {
  const { isAvailable, biometricType, authenticate } = useBiometrics();

  const handleBiometricLogin = async () => {
    const success = await authenticate();
    if (success) {
      // Fazer login do usuário
    }
  };

  return (
    <View>
      {isAvailable && (
        <Button onPress={handleBiometricLogin}>
          Login com {biometricType}
        </Button>
      )}
    </View>
  );
};
```

---

## Ofuscação de Código

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

### 3. O Que Ofuscar

```typescript
// ✅ Ofuscar
// - API keys (mas prefira variáveis de ambiente)
// - Lógica de negócio
// - Algoritmos
// - Constantes sensíveis

// ❌ Não confie apenas na ofuscação
// É segurança por obscuridade, não segurança real
// Sempre use encriptação adequada para dados sensíveis
```

---

## Segurança de Variáveis de Ambiente

### 1. Configuração .env

```bash
# .env.development
EXPO_PUBLIC_API_URL=https://dev-api.example.com
EXPO_PUBLIC_ENVIRONMENT=development

# Não faça commit de segredos!
# Use EAS Secrets para valores sensíveis
```

### 2. EAS Secrets

```bash
# Definir segredo
eas secret:create --name API_KEY --value "your-secret-key" --type string

# Listar segredos
eas secret:list

# Usar em app.config.ts
export default {
  expo: {
    extra: {
      apiKey: process.env.API_KEY,
    },
  },
};
```

### 3. Acessar no App

```typescript
// config/env.ts
import Constants from 'expo-constants';

export const ENV = {
  API_URL: Constants.expoConfig?.extra?.apiUrl || 'https://api.example.com',
  API_KEY: Constants.expoConfig?.extra?.apiKey,
  ENVIRONMENT: Constants.expoConfig?.extra?.environment || 'production',
};

// ❌ NUNCA
export const ENV = {
  API_KEY: 'hardcoded-key-in-source', // NUNCA FAÇA ISSO!
};
```

---

## Segurança de Rede

### 1. Apenas HTTPS

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

// Garantir HTTPS
if (!ENV.API_URL.startsWith('https://')) {
  console.error('URL da API deve usar HTTPS');
  // Em produção, lançar erro
  if (ENV.ENVIRONMENT === 'production') {
    throw new Error('URL da API insegura');
  }
}
```

### 2. Configuração de Timeout

```typescript
// Prevenir requisições travadas
const apiClient = axios.create({
  timeout: 10000, // 10 segundos
  timeoutErrorMessage: 'Tempo limite da requisição excedido',
});
```

---

## Segurança de Tela

### 1. Prevenir Screenshots (iOS/Android)

```typescript
// utils/security.utils.ts
import { Platform } from 'react-native';

export const preventScreenshots = () => {
  if (Platform.OS === 'android') {
    // Usar react-native-screen-capture ou similar
    // ScreenCapture.preventScreenCapture();
  }
  // iOS: Definir UIApplicationUserInterfaceStylePrivacy no Info.plist
};

export const allowScreenshots = () => {
  if (Platform.OS === 'android') {
    // ScreenCapture.allowScreenCapture();
  }
};
```

### 2. Entrada de Texto Segura

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
      textContentType="none" // Desabilitar preenchimento automático
    />
  );
};
```

---

## Segurança de Deep Links

### 1. Validar Deep Links

```typescript
// utils/deeplink.utils.ts
export const validateDeepLink = (url: string): boolean => {
  try {
    const parsed = new URL(url);

    // Permitir apenas o esquema do seu app
    if (parsed.protocol !== 'myapp:') {
      return false;
    }

    // Validar host
    const allowedHosts = ['login', 'profile', 'article'];
    if (!allowedHosts.includes(parsed.host)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// Uso no app
const handleDeepLink = (url: string) => {
  if (!validateDeepLink(url)) {
    console.error('Deep link inválido:', url);
    return;
  }

  // Processar deep link válido
  const parsed = new URL(url);
  router.push(parsed.pathname);
};
```

---

## Checklist de Segurança

### Fase de Desenvolvimento
- [ ] Dados sensíveis no SecureStore/Keychain
- [ ] Tokens de API seguros
- [ ] Validação de entrada implementada (Zod)
- [ ] HTTPS obrigatório
- [ ] Variáveis de ambiente configuradas
- [ ] Autenticação biométrica (se necessário)
- [ ] Deep links validados
- [ ] Sem segredos fixos no código

### Pré-Produção
- [ ] Ofuscação de código habilitada
- [ ] Certificate pinning (se necessário)
- [ ] Prevenção de screenshots (se necessário)
- [ ] EAS Secrets configurado
- [ ] Auditoria de segurança concluída
- [ ] Testes de penetração realizados

### Pós-Produção
- [ ] Monitorar incidentes de segurança
- [ ] Atualizações regulares de dependências
- [ ] Estratégia de rotação de tokens
- [ ] Plano de resposta a incidentes

---

## Vulnerabilidades Comuns

### 1. XSS (Cross-Site Scripting)

```typescript
// ❌ VULNERÁVEL
<Text>{userInput}</Text> // Se userInput contém HTML malicioso

// ✅ SEGURO
<Text>{sanitizeString(userInput)}</Text>
```

### 2. SQL Injection (Backend)

```typescript
// ❌ VULNERÁVEL (backend)
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ SEGURO (backend)
const query = 'SELECT * FROM users WHERE email = ?';
db.query(query, [email]);
```

### 3. Man-in-the-Middle

```typescript
// ❌ VULNERÁVEL
fetch('http://api.example.com/data'); // HTTP!

// ✅ SEGURO
fetch('https://api.example.com/data'); // HTTPS
// + Certificate pinning para segurança extra
```

---

## Recursos de Segurança

- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [React Native Security Best Practices](https://reactnative.dev/docs/security)
- [Expo Security](https://docs.expo.dev/guides/security/)

---

**A segurança não é uma funcionalidade, é uma responsabilidade.**
