---
description: Comando: Implementar Deep Linking
---

# Comando: Implementar Deep Linking

Configure deep linking para sua aplicação React Native com Expo Router.

---

## Objetivo

Este comando o guia pela implementação de deep linking, permitindo que URLs abram seu app diretamente em telas específicas.

---

## Configuração

### 1. Configurar Scheme do App

**app.json/app.config.js:**

```json
{
  "expo": {
    "scheme": "myapp",
    "android": {
      "intentFilters": [
        {
          "action": "VIEW",
          "autoVerify": true,
          "data": [
            {
              "scheme": "https",
              "host": "*.myapp.com",
              "pathPrefix": "/"
            }
          ],
          "category": ["BROWSABLE", "DEFAULT"]
        }
      ]
    },
    "ios": {
      "associatedDomains": ["applinks:myapp.com"]
    }
  }
}
```

### 2. Universal Links (iOS)

**Criar apple-app-site-association:**

```json
{
  "applinks": {
    "apps": [],
    "details": [
      {
        "appID": "TEAM_ID.com.company.myapp",
        "paths": ["*"]
      }
    ]
  }
}
```

**Hospedar em:**
```
https://myapp.com/.well-known/apple-app-site-association
```

### 3. App Links (Android)

**Criar assetlinks.json:**

```json
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "com.company.myapp",
      "sha256_cert_fingerprints": [
        "SHA256_FINGERPRINT"
      ]
    }
  }
]
```

**Hospedar em:**
```
https://myapp.com/.well-known/assetlinks.json
```

---

## Implementação com Expo Router

### 1. Estrutura de Rotas

```
app/
├── _layout.tsx
├── index.tsx
├── article/
│   └── [id].tsx         # Deep link: myapp://article/123
├── user/
│   └── [username].tsx   # Deep link: myapp://user/john
└── (tabs)/
    ├── _layout.tsx
    ├── index.tsx
    └── profile.tsx
```

### 2. Configurar Linking

**app/navigation/linking.ts:**

```typescript
import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

export const linking: LinkingOptions<any> = {
  prefixes: [
    Linking.createURL('/'),
    'myapp://',
    'https://myapp.com',
    'https://*.myapp.com',
  ],
  config: {
    screens: {
      '(tabs)': {
        screens: {
          index: 'home',
          profile: 'profile',
        },
      },
      'article/[id]': 'article/:id',
      'user/[username]': 'user/:username',
      modal: 'modal',
    },
  },
};
```

### 3. Handling Deep Links em Componentes

**app/article/[id].tsx:**

```typescript
import { useLocalSearchParams, useGlobalSearchParams } from 'expo-router';

export default function ArticleScreen() {
  // Pegar parâmetros da rota
  const { id } = useLocalSearchParams<{ id: string }>();

  // Pegar query parameters
  const { utm_source, utm_campaign } = useGlobalSearchParams();

  // Fetch article data
  const { data: article } = useArticle(id);

  // Track deep link
  useEffect(() => {
    if (utm_source) {
      analytics.track('DeepLinkOpened', {
        source: utm_source,
        campaign: utm_campaign,
        articleId: id,
      });
    }
  }, [id, utm_source, utm_campaign]);

  if (!article) return <LoadingScreen />;

  return <ArticleDetail article={article} />;
}
```

### 4. Navegação Programática

```typescript
import { router } from 'expo-router';

// Navegar para rota com parâmetros
router.push({
  pathname: '/article/[id]',
  params: { id: '123' },
});

// Navegar com query params
router.push({
  pathname: '/article/[id]',
  params: {
    id: '123',
    utm_source: 'email',
    utm_campaign: 'newsletter',
  },
});

// Replace (não adiciona à stack)
router.replace('/login');

// Voltar
router.back();

// Ir para root
router.dismiss();
```

---

## Tipos de Deep Links

### 1. Deep Links Simples (Custom Scheme)

```
myapp://article/123
myapp://user/john?tab=posts
myapp://search?q=react+native
```

**Vantagens:**
- Simples de implementar
- Funciona offline

**Desvantagens:**
- Pode abrir app errado se outro app usar mesmo scheme
- Não funciona se app não estiver instalado

### 2. Universal Links (iOS) / App Links (Android)

```
https://myapp.com/article/123
https://myapp.com/user/john?tab=posts
```

**Vantagens:**
- Se app instalado, abre app
- Se app não instalado, abre web
- Mais seguro (verified domains)

**Desvantagens:**
- Requer configuração de servidor
- Mais complexo de setup

---

## Casos de Uso Comuns

### 1. Compartilhamento de Conteúdo

```typescript
// Componente com share button
import * as Sharing from 'expo-sharing';

const handleShare = async () => {
  const url = `https://myapp.com/article/${article.id}`;

  await Sharing.shareAsync(url, {
    dialogTitle: 'Compartilhar Artigo',
  });
};
```

### 2. Notificações Push

```typescript
// Push notification com deep link
const sendNotification = async (userId: string, articleId: string) => {
  await fetch('https://api.expo.dev/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: userId,
      title: 'Novo Artigo',
      body: 'Confira nosso novo artigo!',
      data: {
        url: `myapp://article/${articleId}`,
      },
    }),
  });
};

// Handling no app
import * as Notifications from 'expo-notifications';

Notifications.addNotificationResponseReceivedListener(response => {
  const url = response.notification.request.content.data.url as string;
  if (url) {
    Linking.openURL(url);
  }
});
```

### 3. Email Marketing

```html
<!-- Email com deep link -->
<a href="https://myapp.com/article/123?utm_source=email&utm_campaign=newsletter">
  Leia no App
</a>
```

### 4. QR Codes

```typescript
// Gerar QR code com deep link
import QRCode from 'react-native-qrcode-svg';

const ArticleQRCode = ({ articleId }: { articleId: string }) => {
  const url = `https://myapp.com/article/${articleId}`;

  return (
    <QRCode
      value={url}
      size={200}
      backgroundColor="white"
      color="black"
    />
  );
};
```

---

## Validação e Segurança

### 1. Validar Parâmetros

```typescript
// Hook para validar deep link
export const useValidatedParams = <T extends Record<string, string>>(
  schema: z.ZodSchema<T>
) => {
  const params = useLocalSearchParams();

  try {
    return schema.parse(params);
  } catch (error) {
    // Redirecionar para tela de erro
    router.replace('/error');
    return null;
  }
};

// Usage
const ArticleScreen = () => {
  const params = useValidatedParams(
    z.object({
      id: z.string().uuid(),
    })
  );

  if (!params) return null;

  return <ArticleDetail id={params.id} />;
};
```

### 2. Verificar Autenticação

```typescript
// Middleware para rotas protegidas
export const useProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  const segments = useSegments();

  useEffect(() => {
    // Verificar se usuário está autenticado
    if (!isAuthenticated && segments[0] !== '(auth)') {
      // Redirecionar para login, preservando deep link
      router.replace({
        pathname: '/login',
        params: { redirect: router.pathname },
      });
    }
  }, [isAuthenticated, segments]);
};

// Usage em tela protegida
export default function ProfileScreen() {
  useProtectedRoute();

  return <Profile />;
}
```

### 3. Rate Limiting

```typescript
// Prevenir abuso de deep links
const deepLinkAttempts = new Map<string, number>();

export const useSafeDeepLink = (url: string) => {
  useEffect(() => {
    const attempts = deepLinkAttempts.get(url) || 0;

    if (attempts > 5) {
      console.warn('Too many deep link attempts');
      return;
    }

    deepLinkAttempts.set(url, attempts + 1);

    // Reset após 1 minuto
    setTimeout(() => {
      deepLinkAttempts.delete(url);
    }, 60000);
  }, [url]);
};
```

---

## Testing

### 1. Testar Custom Scheme (Development)

```bash
# iOS Simulator
xcrun simctl openurl booted "myapp://article/123"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "myapp://article/123" com.company.myapp
```

### 2. Testar Universal Links

```bash
# iOS
xcrun simctl openurl booted "https://myapp.com/article/123"

# Android
adb shell am start -W -a android.intent.action.VIEW -d "https://myapp.com/article/123"
```

### 3. Testar no Dispositivo Real

```typescript
// Componente de debug
const DeepLinkTester = () => {
  const [url, setUrl] = useState('');

  const testDeepLink = () => {
    Linking.openURL(url).catch(err =>
      Alert.alert('Erro', 'Não foi possível abrir o link')
    );
  };

  return (
    <View>
      <TextInput
        value={url}
        onChangeText={setUrl}
        placeholder="myapp://article/123"
      />
      <Button title="Testar Deep Link" onPress={testDeepLink} />
    </View>
  );
};
```

---

## Analytics

### 1. Tracking de Deep Links

```typescript
// services/analytics/deeplink.analytics.ts
export const trackDeepLink = (url: string, params: Record<string, any>) => {
  analytics.track('DeepLinkOpened', {
    url,
    params,
    source: params.utm_source,
    campaign: params.utm_campaign,
    medium: params.utm_medium,
    timestamp: new Date().toISOString(),
  });
};

// Hook para tracking automático
export const useDeepLinkTracking = () => {
  const params = useGlobalSearchParams();
  const pathname = usePathname();

  useEffect(() => {
    trackDeepLink(pathname, params);
  }, [pathname, params]);
};
```

### 2. Funil de Conversão

```typescript
// Tracking de funil completo
export const trackDeepLinkFunnel = {
  opened: (url: string) => {
    analytics.track('DeepLinkFunnel', {
      step: 'opened',
      url,
    });
  },

  authenticated: (url: string) => {
    analytics.track('DeepLinkFunnel', {
      step: 'authenticated',
      url,
    });
  },

  converted: (url: string, action: string) => {
    analytics.track('DeepLinkFunnel', {
      step: 'converted',
      url,
      action,
    });
  },
};
```

---

## Troubleshooting

### iOS

**Universal Links não funcionando:**

1. Verificar associatedDomains em app.json
2. Verificar apple-app-site-association no servidor
3. Testar em: https://branch.io/resources/aasa-validator/
4. Verificar se domínio é HTTPS
5. Reinstalar app após mudanças

**Logs:**

```bash
# Ver logs de universal links
xcrun simctl spawn booted log stream --predicate 'subsystem contains "com.apple.CoreSimulator"'
```

### Android

**App Links não funcionando:**

1. Verificar intentFilters em app.json
2. Verificar assetlinks.json no servidor
3. Testar em: https://developers.google.com/digital-asset-links/tools/generator
4. Verificar SHA256 fingerprint
5. Habilitar autoVerify

**Obter SHA256 fingerprint:**

```bash
# Debug keystore
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Release keystore
keytool -list -v -keystore path/to/release.keystore
```

---

## Checklist

- [ ] Custom scheme configurado
- [ ] Universal Links configurados (iOS)
- [ ] App Links configurados (Android)
- [ ] Rotas mapeadas no linking config
- [ ] Parâmetros validados
- [ ] Autenticação verificada para rotas protegidas
- [ ] Analytics implementado
- [ ] Testado em iOS
- [ ] Testado em Android
- [ ] Testado com diferentes tipos de links
- [ ] Documentação atualizada

---

**Deep linking bem implementado melhora significativamente a experiência do usuário e a atribuição de campanhas.**
