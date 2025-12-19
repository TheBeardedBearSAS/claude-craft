# Arquitetura React Native - Princípios e Organização

## Introdução

Este documento define a arquitetura recomendada para aplicações React Native com TypeScript e Expo, baseada nas melhores práticas da indústria.

---

## Princípios Arquiteturais

### 1. Clean Architecture

A aplicação é organizada em **camadas** com responsabilidades claras:

```
┌─────────────────────────────────────┐
│      CAMADA DE APRESENTAÇÃO         │  <- Componentes UI, Telas
├─────────────────────────────────────┤
│      CAMADA DE APLICAÇÃO            │  <- Hooks, Gerenciamento de Estado
├─────────────────────────────────────┤
│      CAMADA DE DOMÍNIO              │  <- Lógica de Negócio, Tipos
├─────────────────────────────────────┤
│      CAMADA DE DADOS                │  <- API, Storage, Serviços
└─────────────────────────────────────┘
```

**Regras de dependência**:
- Camadas superiores podem depender de camadas inferiores
- Camadas inferiores NÃO DEVEM depender de camadas superiores
- Cada camada tem uma responsabilidade única e bem definida

### 2. Organização Baseada em Features

Organização por **feature de negócio** ao invés de tipo técnico:

```typescript
// ✅ BOM: Baseado em features
features/
├── auth/
│   ├── screens/
│   ├── components/
│   ├── hooks/
│   └── types/
└── profile/
    ├── screens/
    ├── components/
    ├── hooks/
    └── types/

// ❌ RUIM: Baseado em tipo
screens/
components/
hooks/
types/
```

### 3. Separação de Responsabilidades

Cada arquivo, função, componente tem **UMA responsabilidade**:

```typescript
// ✅ BOM: Separação clara
// Button.tsx - Apresentação
export const Button = ({ onPress, children }) => (
  <Pressable onPress={onPress}>{children}</Pressable>
);

// useLogin.ts - Lógica
export const useLogin = () => {
  const login = (credentials) => { /* logic */ };
  return { login };
};

// ❌ RUIM: Tudo misturado
export const LoginButton = () => {
  const [loading, setLoading] = useState(false);
  const handleLogin = async () => {
    setLoading(true);
    const response = await fetch('/api/login');
    // Lógica + UI misturados
  };
  return <Pressable onPress={handleLogin}>Login</Pressable>;
};
```

---

## Estrutura de Pastas

### Visão Completa

```
my-app/
├── src/
│   ├── app/                         # Expo Router (App Router)
│   │   ├── (auth)/                  # Grupo Auth (layout compartilhado)
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── _layout.tsx
│   │   ├── (tabs)/                  # Grupo Tabs (navegação em tabs)
│   │   │   ├── index.tsx            # Tab Home
│   │   │   ├── profile.tsx          # Tab Profile
│   │   │   ├── settings.tsx         # Tab Settings
│   │   │   └── _layout.tsx          # Layout de Tabs
│   │   ├── article/
│   │   │   └── [id].tsx             # Rota dinâmica
│   │   ├── modal.tsx                # Tela modal
│   │   ├── _layout.tsx              # Layout raiz
│   │   └── +not-found.tsx           # Tela 404
│   │
│   ├── components/                  # Componentes reutilizáveis
│   │   ├── ui/                      # Componentes UI base
│   │   ├── forms/                   # Componentes de formulário
│   │   ├── layout/                  # Componentes de layout
│   │   └── shared/                  # Componentes compartilhados
│   │
│   ├── features/                    # Features por domínio de negócio
│   │   ├── auth/
│   │   │   ├── components/          # Componentes específicos de auth
│   │   │   ├── hooks/               # Hooks de auth
│   │   │   ├── services/            # Serviços de auth
│   │   │   ├── stores/              # Gerenciamento de estado auth
│   │   │   ├── types/               # Tipos auth
│   │   │   └── utils/               # Utils auth
│   │   ├── profile/
│   │   └── articles/
│   │
│   ├── hooks/                       # Hooks globais/compartilhados
│   ├── services/                    # Serviços globais
│   ├── stores/                      # Gerenciamento de estado global
│   ├── utils/                       # Utilitários
│   ├── constants/                   # Constantes
│   ├── types/                       # Tipos globais
│   ├── config/                      # Configuração
│   ├── theme/                       # Tema
│   └── assets/                      # Assets
│
├── __tests__/                       # Testes
│   ├── unit/
│   ├── integration/
│   └── e2e/
```

---

## Detalhes das Camadas

### 1. Camada de Apresentação (UI)

#### A. App Router (Expo Router)

**Nova arquitetura de roteamento baseada em arquivos**:

```typescript
// src/app/_layout.tsx - Layout raiz
import { Stack } from 'expo-router';
import { QueryClientProvider } from '@tanstack/react-query';

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </QueryClientProvider>
  );
}
```

**Vantagens do Expo Router**:
- Roteamento baseado em arquivos (como Next.js)
- Navegação type-safe
- Deep linking automático
- SEO-friendly (Expo Web)
- Layouts compartilhados
- Navegação aninhada simplificada

---

## Checklist de Arquitetura

**Antes de implementar uma feature**:

- [ ] Pasta de feature criada em features/
- [ ] Tipos definidos em types/
- [ ] Serviço API criado em services/
- [ ] Serviço de storage se necessário
- [ ] Repository se lógica complexa
- [ ] Hook customizado criado em hooks/
- [ ] Componentes UI em components/
- [ ] Screen em app/
- [ ] Navegação configurada
- [ ] Testes unitários
- [ ] Documentação

---

**Arquitetura é a fundação da manutenibilidade. Invista tempo desde o início.**
