# React Native Screen Generierung

Sie sind ein Senior React Native Entwickler. Sie müssen einen vollständigen Screen mit Navigation, State Management, Tests und Barrierefreiheit generieren.

## Argumente
$ARGUMENTS

Argumente:
- Screen-Name (z.B. `Profile`, `Settings`, `ProductDetail`)
- (Optional) Typ: list, detail, form, dashboard

Beispiel: `/reactnative:generate-screen ProductDetail detail`

## MISSION

### Schritt 1: Screen-Struktur

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

### Schritt 2: Types

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
  // ...weitere Felder
}

export interface {ScreenName}ScreenState {
  data: {ScreenName}Data | null;
  isLoading: boolean;
  error: string | null;
}
```

### Schritt 3: Custom Hook

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
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
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

### Schritt 4: Styles

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

### Schritt 5: Screen-Komponente

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

  // Initialer Ladezustand
  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={styles.loadingContainer}
          accessibilityLabel="Laden läuft"
          accessibilityRole="progressbar"
        >
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // Fehlerzustand
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
            accessibilityLabel="Erneut versuchen"
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Erneut versuchen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Normaler Zustand mit Daten
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            accessibilityLabel="Seite aktualisieren"
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {data?.imageUrl && (
          <Image
            source={{ uri: data.imageUrl }}
            style={styles.headerImage}
            accessibilityLabel={`Bild von ${data.title}`}
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
              Erstellt am {new Date(data?.createdAt || '').toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Schritt 6: Export

```typescript
// src/screens/{ScreenName}/index.ts
export { {ScreenName}Screen } from './{ScreenName}Screen';
export type { {ScreenName}ScreenProps, {ScreenName}ScreenParams } from './{ScreenName}Screen.types';
```

### Schritt 7: Navigation

```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  Home: undefined;
  {ScreenName}: { id: string; title?: string };
  // ...andere Screens
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

### Schritt 8: Tests

```tsx
// src/screens/{ScreenName}/{ScreenName}Screen.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { {ScreenName}Screen } from './{ScreenName}Screen';
import { {screenName}Service } from '@/services/{screenName}Service';

// Service mocken
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

  describe('Ladezustand', () => {
    it('zeigt Ladeindikator initial an', () => {
      mockService.getById.mockImplementation(() => new Promise(() => {}));

      renderWithNavigation();

      expect(screen.getByLabelText('Laden läuft')).toBeTruthy();
    });
  });

  describe('Erfolgszustand', () => {
    const mockData = {
      id: '123',
      title: 'Test Titel',
      description: 'Test Beschreibung',
      createdAt: '2024-01-15T10:00:00Z',
    };

    beforeEach(() => {
      mockService.getById.mockResolvedValue(mockData);
    });

    it('zeigt Daten korrekt an', async () => {
      renderWithNavigation();

      await waitFor(() => {
        expect(screen.getByText('Test Titel')).toBeTruthy();
      });

      expect(screen.getByText('Test Beschreibung')).toBeTruthy();
    });

    it('unterstützt Pull-to-Refresh', async () => {
      renderWithNavigation();

      await waitFor(() => {
        expect(screen.getByText('Test Titel')).toBeTruthy();
      });

      const scrollView = screen.getByLabelText('Seite aktualisieren');
      fireEvent(scrollView, 'refresh');

      await waitFor(() => {
        expect(mockService.getById).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Fehlerzustand', () => {
    beforeEach(() => {
      mockService.getById.mockRejectedValue(new Error('Netzwerkfehler'));
    });

    it('zeigt Fehlermeldung an', async () => {
      renderWithNavigation();

      await waitFor(() => {
        expect(screen.getByText('Netzwerkfehler')).toBeTruthy();
      });
    });

    it('ermöglicht Wiederholung bei Fehler', async () => {
      renderWithNavigation();

      await waitFor(() => {
        expect(screen.getByText('Netzwerkfehler')).toBeTruthy();
      });

      // Jetzt wird Wiederholung erfolgreich sein
      mockService.getById.mockResolvedValueOnce({
        id: '123',
        title: 'Erfolg',
        description: 'Jetzt funktioniert es',
        createdAt: '2024-01-15',
      });

      fireEvent.press(screen.getByText('Erneut versuchen'));

      await waitFor(() => {
        expect(screen.getByText('Erfolg')).toBeTruthy();
      });
    });
  });

  describe('Barrierefreiheit', () => {
    it('hat korrekte Accessibility-Rollen', async () => {
      mockService.getById.mockResolvedValue({
        id: '123',
        title: 'Test',
        description: 'Beschr',
        createdAt: '2024-01-15',
      });

      renderWithNavigation();

      await waitFor(() => {
        expect(screen.getByRole('header', { name: 'Test' })).toBeTruthy();
      });
    });
  });
});
```

### Schritt 9: Screen-Varianten

#### List Screen

```tsx
// Für einen List-Typ Screen
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
        ListEmptyComponent={<EmptyState message="Keine Elemente" />}
        ListFooterComponent={hasMore ? <ActivityIndicator /> : null}
      />
    </SafeAreaView>
  );
}
```

#### Form Screen

```tsx
// Für einen Form-Typ Screen
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
              placeholder="Name"
              error={fieldState.error?.message}
            />
          )}
        />
        {/* weitere Felder */}
        <Button
          title="Speichern"
          onPress={handleSubmit(onSubmit)}
          loading={formState.isSubmitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

### Zusammenfassung

```
══════════════════════════════════════════════════════════════
✅ SCREEN GENERIERT - {ScreenName}
══════════════════════════════════════════════════════════════

📁 Erstellte Dateien:
- src/screens/{ScreenName}/index.ts
- src/screens/{ScreenName}/{ScreenName}Screen.tsx
- src/screens/{ScreenName}/{ScreenName}Screen.types.ts
- src/screens/{ScreenName}/{ScreenName}Screen.styles.ts
- src/screens/{ScreenName}/{ScreenName}Screen.test.tsx
- src/screens/{ScreenName}/hooks/use{ScreenName}.ts

📝 Features:
- TypeScript strict
- Typisierte Navigation
- Custom Hook für Logik
- Pull-to-Refresh
- Lade-/Fehler-/Erfolgszustände
- Barrierefreiheit (Rollen, Labels)
- Vollständige Tests

🔧 Nächste Schritte:
1. Screen zur Navigation hinzufügen
2. API Service erstellen
3. Styles anpassen
4. Tests ausführen: npm test {ScreenName}
```
