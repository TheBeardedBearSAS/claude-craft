---
description: Geração de Tela React Native
argument-hint: [arguments]
---

# Geração de Tela React Native

Você é um desenvolvedor React Native sênior. Você deve gerar uma tela completa com navegação, gerenciamento de estado, testes e acessibilidade.

## Argumentos
$ARGUMENTS

Argumentos:
- Nome da tela (ex.: `Profile`, `Settings`, `ProductDetail`)
- (Opcional) Tipo: list, detail, form, dashboard

Exemplo: `/reactnative:generate-screen ProductDetail detail`

## Modo de Planejamento

> **O modo de planejamento é obrigatório.** Antes de executar, o Claude ativa o modo de planejamento para analisar o código impactado, propor um plano de implementação e aguardar sua validação antes de realizar qualquer alteração.

## MISSÃO

### Etapa 1: Estrutura da Tela

```
src/
└── screens/
    └── {ScreenName}/
        ├── index.ts
        ├── {ScreenName}Screen.tsx
        ├── {ScreenName}Screen.types.ts
        ├── {ScreenName}Screen.styles.ts
        ├── {ScreenName}Screen.test.tsx
        ├── hooks/
        │   └── use{ScreenName}.ts
        └── components/
            └── {ScreenName}Header.tsx
```

### Etapa 2: Tipos

```typescript
// src/screens/{ScreenName}/{ScreenName}Screen.types.ts
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '@/navigation/types';

export type {ScreenName}ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  '{ScreenName}'
>;

export interface {ScreenName}ScreenParams {
  id: string;
  title?: string;
}

export interface {ScreenName}Data {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  createdAt: string;
  // ...outros campos
}

export interface {ScreenName}ScreenState {
  data: {ScreenName}Data | null;
  isLoading: boolean;
  error: string | null;
}
```

### Etapa 3: Hook Personalizado

```typescript
// src/screens/{ScreenName}/hooks/use{ScreenName}.ts
import { useState, useEffect, useCallback } from 'react';
import { useRoute } from '@react-navigation/native';

import { {screenName}Service } from '@/services/{screenName}Service';
import type { {ScreenName}Data, {ScreenName}ScreenParams } from '../{ScreenName}Screen.types';

interface Use{ScreenName}Return {
  data: {ScreenName}Data | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function use{ScreenName}(): Use{ScreenName}Return {
  const route = useRoute<{ params: {ScreenName}ScreenParams }>();
  const { id } = route.params;

  const [data, setData] = useState<{ScreenName}Data | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await {screenName}Service.getById(id);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refresh };
}
```

### Etapa 4: Estilos

```typescript
// src/screens/{ScreenName}/{ScreenName}Screen.styles.ts
import { StyleSheet } from 'react-native';
import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  retryButton: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  retryButtonText: {
    color: theme.colors.white,
    fontWeight: '600',
  },
  headerImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  title: {
    fontSize: theme.typography.h1.fontSize,
    fontWeight: theme.typography.h1.fontWeight,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  metadataText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.textMuted,
  },
});
```

### Etapa 5: Componente da Tela

```tsx
// src/screens/{ScreenName}/{ScreenName}Screen.tsx
import React, { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { use{ScreenName} } from './hooks/use{ScreenName}';
import { styles } from './{ScreenName}Screen.styles';
import type { {ScreenName}ScreenProps } from './{ScreenName}Screen.types';

export function {ScreenName}Screen({ navigation }: {ScreenName}ScreenProps) {
  const { data, isLoading, error, refresh } = use{ScreenName}();
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }, [refresh]);

  // Estado de carregamento inicial
  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={styles.loadingContainer}
          accessibilityLabel="Carregamento em andamento"
          accessibilityRole="progressbar"
        >
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // Estado de erro
  if (error && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text
            style={styles.errorText}
            accessibilityRole="alert"
          >
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={refresh}
            accessibilityLabel="Tentar novamente o carregamento"
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Tentar novamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Estado normal com dados
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            accessibilityLabel="Atualizar página"
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {data?.imageUrl && (
          <Image
            source={{ uri: data.imageUrl }}
            style={styles.headerImage}
            accessibilityLabel={`Imagem de ${data.title}`}
          />
        )}

        <View style={{ padding: 16 }}>
          <Text
            style={styles.title}
            accessibilityRole="header"
          >
            {data?.title}
          </Text>

          <Text style={styles.description}>
            {data?.description}
          </Text>

          <View style={styles.metadata}>
            <Text style={styles.metadataText}>
              Criado em {new Date(data?.createdAt || '').toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Etapa 6: Exportação

```typescript
// src/screens/{ScreenName}/index.ts
export { {ScreenName}Screen } from './{ScreenName}Screen';
export type { {ScreenName}ScreenProps, {ScreenName}ScreenParams } from './{ScreenName}Screen.types';
```

### Etapa 7: Navegação

```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  Home: undefined;
  {ScreenName}: { id: string; title?: string };
  // ...outras telas
};

// src/navigation/RootNavigator.tsx
import { {ScreenName}Screen } from '@/screens/{ScreenName}';

<Stack.Screen
  name="{ScreenName}"
  component={{ScreenName}Screen}
  options={({ route }) => ({
    title: route.params?.title || '{ScreenName}',
    headerBackTitleVisible: false,
  })}
/>
```

### Etapa 8: Testes

```tsx
// src/screens/{ScreenName}/{ScreenName}Screen.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { {ScreenName}Screen } from './{ScreenName}Screen';
import { {screenName}Service } from '@/services/{screenName}Service';

// Mock do serviço
jest.mock('@/services/{screenName}Service');
const mockService = {screenName}Service as jest.Mocked<typeof {screenName}Service>;

const Stack = createNativeStackNavigator();

function renderWithNavigation(params = { id: '123' }) {
  return render(
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="{ScreenName}"
          component={{ScreenName}Screen}
          initialParams={params}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

describe('{ScreenName}Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Estado de carregamento', () => {
    it('exibe indicador de carregamento inicialmente', () => {
      mockService.getById.mockImplementation(() => new Promise(() => {}));

      renderWithNavigation();

      expect(screen.getByLabelText('Carregamento em andamento')).toBeTruthy();
    });
  });

  describe('Estado de sucesso', () => {
    const mockData = {
      id: '123',
      title: 'Título de Teste',
      description: 'Descrição de Teste',
      createdAt: '2024-01-15T10:00:00Z',
    };

    beforeEach(() => {
      mockService.getById.mockResolvedValue(mockData);
    });

    it('exibe os dados corretamente', async () => {
      renderWithNavigation();

      await waitFor(() => {
        expect(screen.getByText('Título de Teste')).toBeTruthy();
      });

      expect(screen.getByText('Descrição de Teste')).toBeTruthy();
    });

    it('suporta pull to refresh', async () => {
      renderWithNavigation();

      await waitFor(() => {
        expect(screen.getByText('Título de Teste')).toBeTruthy();
      });

      const scrollView = screen.getByLabelText('Atualizar página');
      fireEvent(scrollView, 'refresh');

      await waitFor(() => {
        expect(mockService.getById).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Estado de erro', () => {
    beforeEach(() => {
      mockService.getById.mockRejectedValue(new Error('Erro de rede'));
    });

    it('exibe mensagem de erro', async () => {
      renderWithNavigation();

      await waitFor(() => {
        expect(screen.getByText('Erro de rede')).toBeTruthy();
      });
    });

    it('permite tentar novamente em caso de erro', async () => {
      renderWithNavigation();

      await waitFor(() => {
        expect(screen.getByText('Erro de rede')).toBeTruthy();
      });

      // Agora a nova tentativa será bem-sucedida
      mockService.getById.mockResolvedValueOnce({
        id: '123',
        title: 'Sucesso',
        description: 'Agora funciona',
        createdAt: '2024-01-15',
      });

      fireEvent.press(screen.getByText('Tentar novamente'));

      await waitFor(() => {
        expect(screen.getByText('Sucesso')).toBeTruthy();
      });
    });
  });

  describe('Acessibilidade', () => {
    it('possui roles de acessibilidade corretas', async () => {
      mockService.getById.mockResolvedValue({
        id: '123',
        title: 'Teste',
        description: 'Desc',
        createdAt: '2024-01-15',
      });

      renderWithNavigation();

      await waitFor(() => {
        expect(screen.getByRole('header', { name: 'Teste' })).toBeTruthy();
      });
    });
  });
});
```

### Etapa 9: Variantes de Tela

#### Tela de Lista

```tsx
// Para uma tela do tipo lista
import { FlatList } from 'react-native';

export function {ScreenName}ListScreen() {
  const { data, isLoading, refresh, loadMore, hasMore } = use{ScreenName}List();

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <{ScreenName}ListItem item={item} onPress={() => navigate(item.id)} />
        )}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refresh} />
        }
        onEndReached={hasMore ? loadMore : undefined}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={<EmptyState message="Nenhum item" />}
        ListFooterComponent={hasMore ? <ActivityIndicator /> : null}
      />
    </SafeAreaView>
  );
}
```

#### Tela de Formulário

```tsx
// Para uma tela do tipo formulário
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function {ScreenName}FormScreen() {
  const { control, handleSubmit, formState } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '' },
  });

  const onSubmit = async (data) => {
    // ...
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <ScrollView>
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <TextInput
              {...field}
              onChangeText={field.onChange}
              placeholder="Nome"
              error={fieldState.error?.message}
            />
          )}
        />
        {/* outros campos */}
        <Button
          title="Salvar"
          onPress={handleSubmit(onSubmit)}
          loading={formState.isSubmitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

### Resumo

```
══════════════════════════════════════════════════════════════
✅ TELA GERADA - {ScreenName}
══════════════════════════════════════════════════════════════

📁 Arquivos criados:
- src/screens/{ScreenName}/index.ts
- src/screens/{ScreenName}/{ScreenName}Screen.tsx
- src/screens/{ScreenName}/{ScreenName}Screen.types.ts
- src/screens/{ScreenName}/{ScreenName}Screen.styles.ts
- src/screens/{ScreenName}/{ScreenName}Screen.test.tsx
- src/screens/{ScreenName}/hooks/use{ScreenName}.ts

📝 Funcionalidades:
- TypeScript strict
- Navegação tipada
- Hook personalizado para lógica
- Pull-to-refresh
- Tratamento de estados: carregamento/erro/sucesso
- Acessibilidade (roles, labels)
- Testes completos

🔧 Próximos passos:
1. Adicionar a tela à navegação
2. Criar serviço de API
3. Personalizar estilos
4. Executar testes: npm test {ScreenName}
```
