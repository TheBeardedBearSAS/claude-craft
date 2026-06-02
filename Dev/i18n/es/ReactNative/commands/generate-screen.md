---
description: Generación de Screen en React Native
argument-hint: [argumentos]
---

# Generación de Screen en React Native

Eres un desarrollador senior de React Native. Debes generar una pantalla completa con navegación, gestión de estado, tests y accesibilidad.

## Argumentos
$ARGUMENTS

Argumentos:
- Nombre de la pantalla (p. ej., `Profile`, `Settings`, `ProductDetail`)
- (Opcional) Tipo: list, detail, form, dashboard

Ejemplo: `/reactnative:generate-screen ProductDetail detail`

## Modo Plan

> **El modo plan es obligatorio.** Antes de ejecutar, Claude activa el modo plan para analizar el código impactado, proponer un plan de implementación y esperar tu validación antes de realizar cualquier cambio.

## MISIÓN

### Paso 1: Estructura de la Pantalla

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

### Paso 2: Tipos

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
  // ...otros campos
}

export interface {ScreenName}ScreenState {
  data: {ScreenName}Data | null;
  isLoading: boolean;
  error: string | null;
}
```

### Paso 3: Hook Personalizado

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
      setError(err instanceof Error ? err.message : 'Se produjo un error');
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

### Paso 4: Estilos

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

### Paso 5: Componente de Pantalla

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

  // Estado de carga inicial
  if (isLoading && !data) {
    return (
      <SafeAreaView style={styles.container}>
        <View
          style={styles.loadingContainer}
          accessibilityLabel="Carga en progreso"
          accessibilityRole="progressbar"
        >
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // Estado de error
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
            accessibilityLabel="Reintentar carga"
            accessibilityRole="button"
          >
            <Text style={styles.retryButtonText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Estado normal con datos
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            accessibilityLabel="Actualizar página"
          />
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {data?.imageUrl && (
          <Image
            source={{ uri: data.imageUrl }}
            style={styles.headerImage}
            accessibilityLabel={`Imagen de ${data.title}`}
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
              Creado el {new Date(data?.createdAt || '').toLocaleDateString()}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

### Paso 6: Exportación

```typescript
// src/screens/{ScreenName}/index.ts
export { {ScreenName}Screen } from './{ScreenName}Screen';
export type { {ScreenName}ScreenProps, {ScreenName}ScreenParams } from './{ScreenName}Screen.types';
```

### Paso 7: Navegación

```typescript
// src/navigation/types.ts
export type RootStackParamList = {
  Home: undefined;
  {ScreenName}: { id: string; title?: string };
  // ...otras pantallas
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

### Paso 8: Tests

```tsx
// src/screens/{ScreenName}/{ScreenName}Screen.test.tsx
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { {ScreenName}Screen } from './{ScreenName}Screen';
import { {screenName}Service } from '@/services/{screenName}Service';

// Mock del servicio
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

  describe('Estado de carga', () => {
    it('muestra el indicador de carga inicialmente', () => {
      mockService.getById.mockImplementation(() => new Promise(() => {}));

      renderWithNavigation();

      expect(screen.getByLabelText('Carga en progreso')).toBeTruthy();
    });
  });

  describe('Estado de éxito', () => {
    const mockData = {
      id: '123',
      title: 'Título de Prueba',
      description: 'Descripción de Prueba',
      createdAt: '2024-01-15T10:00:00Z',
    };

    beforeEach(() => {
      mockService.getById.mockResolvedValue(mockData);
    });

    it('muestra los datos correctamente', async () => {
      renderWithNavigation();

      await waitFor(() => {
        expect(screen.getByText('Título de Prueba')).toBeTruthy();
      });

      expect(screen.getByText('Descripción de Prueba')).toBeTruthy();
    });

    it('soporta pull to refresh', async () => {
      renderWithNavigation();

      await waitFor(() => {
        expect(screen.getByText('Título de Prueba')).toBeTruthy();
      });

      const scrollView = screen.getByLabelText('Actualizar página');
      fireEvent(scrollView, 'refresh');

      await waitFor(() => {
        expect(mockService.getById).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Estado de error', () => {
    beforeEach(() => {
      mockService.getById.mockRejectedValue(new Error('Error de red'));
    });

    it('muestra el mensaje de error', async () => {
      renderWithNavigation();

      await waitFor(() => {
        expect(screen.getByText('Error de red')).toBeTruthy();
      });
    });

    it('permite reintentar en caso de error', async () => {
      renderWithNavigation();

      await waitFor(() => {
        expect(screen.getByText('Error de red')).toBeTruthy();
      });

      // Ahora el reintento tendrá éxito
      mockService.getById.mockResolvedValueOnce({
        id: '123',
        title: 'Éxito',
        description: 'Ahora funciona',
        createdAt: '2024-01-15',
      });

      fireEvent.press(screen.getByText('Reintentar'));

      await waitFor(() => {
        expect(screen.getByText('Éxito')).toBeTruthy();
      });
    });
  });

  describe('Accesibilidad', () => {
    it('tiene los roles de accesibilidad correctos', async () => {
      mockService.getById.mockResolvedValue({
        id: '123',
        title: 'Test',
        description: 'Desc',
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

### Paso 9: Variantes de Pantalla

#### Pantalla de Lista

```tsx
// Para una pantalla de tipo lista
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
        ListEmptyComponent={<EmptyState message="Sin elementos" />}
        ListFooterComponent={hasMore ? <ActivityIndicator /> : null}
      />
    </SafeAreaView>
  );
}
```

#### Pantalla de Formulario

```tsx
// Para una pantalla de tipo formulario
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
              placeholder="Nombre"
              error={fieldState.error?.message}
            />
          )}
        />
        {/* otros campos */}
        <Button
          title="Guardar"
          onPress={handleSubmit(onSubmit)}
          loading={formState.isSubmitting}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
```

### Resumen

```
══════════════════════════════════════════════════════════════
✅ PANTALLA GENERADA - {ScreenName}
══════════════════════════════════════════════════════════════

📁 Archivos creados:
- src/screens/{ScreenName}/index.ts
- src/screens/{ScreenName}/{ScreenName}Screen.tsx
- src/screens/{ScreenName}/{ScreenName}Screen.types.ts
- src/screens/{ScreenName}/{ScreenName}Screen.styles.ts
- src/screens/{ScreenName}/{ScreenName}Screen.test.tsx
- src/screens/{ScreenName}/hooks/use{ScreenName}.ts

📝 Funcionalidades:
- TypeScript estricto
- Navegación tipada
- Hook personalizado para la lógica
- Pull-to-refresh
- Manejo de estados carga/error/éxito
- Accesibilidad (roles, etiquetas)
- Tests completos

🔧 Próximos pasos:
1. Añadir la pantalla a la navegación
2. Crear el servicio API
3. Personalizar los estilos
4. Ejecutar los tests: npm test {ScreenName}
```
