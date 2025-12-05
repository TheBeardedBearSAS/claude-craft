# Template: Componente de Pantalla

## Nombre de la Pantalla

`{{SCREEN_NAME}}Screen.tsx`

## Estructura

```typescript
// app/{{ROUTE_PATH}}.tsx (or screens/{{SCREEN_NAME}}Screen.tsx if not using Expo Router)
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';

// Import components
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';

// Import hooks
import { use{{FEATURE_NAME}} } from '@/hooks/use{{FEATURE_NAME}}';

// Import types
import type { {{TYPE_NAME}} } from '@/types/{{TYPE_NAME}}.types';

// Import styles
import { styles } from './{{SCREEN_NAME}}Screen.styles';

/**
 * {{SCREEN_NAME}} Screen
 *
 * Descripción: {{DESCRIPTION}}
 *
 * @screen
 */
export default function {{SCREEN_NAME}}Screen() {
  // 1. Params (if dynamic route)
  const params = useLocalSearchParams<{ id: string }>();

  // 2. State
  const [state, setState] = React.useState<StateType>(initialState);

  // 3. Hooks - Data fetching
  const { data, isLoading, error } = use{{FEATURE_NAME}}();

  // 4. Hooks - Effects
  React.useEffect(() => {
    // Side effects
  }, []);

  // 5. Handlers
  const handleAction = () => {
    // Handle action
  };

  // 6. Early returns
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

  // 7. Main render
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{{TITLE}}</Text>
        </View>

        <View style={styles.body}>
          {/* Main content */}
        </View>

        <View style={styles.actions}>
          <Button onPress={handleAction}>Action</Button>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Optional: Screen options for Expo Router
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

## Test

```typescript
// __tests__/screens/{{SCREEN_NAME}}Screen.test.tsx
import { render, waitFor } from '@testing-library/react-native';
import {{SCREEN_NAME}}Screen from '../{{SCREEN_NAME}}Screen';

describe('{{SCREEN_NAME}}Screen', () => {
  it('renders correctly', () => {
    const { getByText } = render(<{{SCREEN_NAME}}Screen />);
    expect(getByText('{{TITLE}}')).toBeTruthy();
  });

  it('handles loading state', async () => {
    const { getByTestId } = render(<{{SCREEN_NAME}}Screen />);
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('handles error state', async () => {
    // Mock error
    const { getByText } = render(<{{SCREEN_NAME}}Screen />);
    await waitFor(() => {
      expect(getByText('Error')).toBeTruthy();
    });
  });
});
```
