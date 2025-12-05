# Template: Componente de Tela

## Nome da Tela

`{{SCREEN_NAME}}Screen.tsx`

## Estrutura

```typescript
// app/{{ROUTE_PATH}}.tsx (ou screens/{{SCREEN_NAME}}Screen.tsx se não usar Expo Router)
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

// Importar componentes
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';

// Importar hooks
import { use{{FEATURE_NAME}} } from '@/hooks/use{{FEATURE_NAME}}';

// Importar tipos
import type { {{TYPE_NAME}} } from '@/types/{{TYPE_NAME}}.types';

// Importar estilos
import { styles } from './{{SCREEN_NAME}}Screen.styles';

/**
 * Tela {{SCREEN_NAME}}
 *
 * Descrição: {{DESCRIPTION}}
 *
 * @screen
 */
export default function {{SCREEN_NAME}}Screen() {
  // 1. Params (se rota dinâmica)
  const params = useLocalSearchParams<{ id: string }>();

  // 2. State
  const [state, setState] = React.useState<StateType>(initialState);

  // 3. Hooks - Busca de dados
  const { data, isLoading, error } = use{{FEATURE_NAME}}();

  // 4. Hooks - Effects
  React.useEffect(() => {
    // Efeitos colaterais
  }, []);

  // 5. Handlers
  const handleAction = () => {
    // Tratar ação
  };

  // 6. Retornos antecipados
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage error={error} />
      </SafeAreaView>
    );
  }

  // 7. Render principal
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{{TITLE}}</Text>
        </View>

        <View style={styles.body}>
          {/* Conteúdo principal */}
        </View>

        <View style={styles.actions}>
          <Button onPress={handleAction}>Ação</Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Opcional: Opções de tela para Expo Router
export const options = {
  title: '{{SCREEN_TITLE}}',
  headerShown: true,
};
```

## Estilos

```typescript
// {{SCREEN_NAME}}Screen.styles.ts
import { StyleSheet } from 'react-native';
import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  content: {
    padding: theme.spacing.md,
  },
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  body: {
    flex: 1,
  },
  actions: {
    marginTop: theme.spacing.lg,
  },
});
```

## Teste

```typescript
// __tests__/screens/{{SCREEN_NAME}}Screen.test.tsx
import { render, waitFor } from '@testing-library/react-native';
import {{SCREEN_NAME}}Screen from '../{{SCREEN_NAME}}Screen';

describe('{{SCREEN_NAME}}Screen', () => {
  it('renderiza corretamente', () => {
    const { getByText } = render(<{{SCREEN_NAME}}Screen />);
    expect(getByText('{{TITLE}}')).toBeTruthy();
  });

  it('trata estado de carregamento', async () => {
    const { getByTestId } = render(<{{SCREEN_NAME}}Screen />);
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('trata estado de erro', async () => {
    // Mock erro
    const { getByText } = render(<{{SCREEN_NAME}}Screen />);
    await waitFor(() => {
      expect(getByText('Erro')).toBeTruthy();
    });
  });
});
```
