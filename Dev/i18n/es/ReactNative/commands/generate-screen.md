# Generación de Screen

Genera una nueva screen con toda su estructura.

## Estructura de Screen

```
app/
└── (tabs)/
    └── profile.tsx          # Screen principal

src/
└── features/
    └── profile/
        ├── components/
        │   ├── ProfileHeader.tsx
        │   └── ProfileStats.tsx
        ├── hooks/
        │   └── useProfile.ts
        └── types/
            └── profile.types.ts
```

## Template de Screen

```typescript
// app/(tabs)/profile.tsx
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';

import { ProfileHeader } from '@/features/profile/components/ProfileHeader';
import { ProfileStats } from '@/features/profile/components/ProfileStats';
import { useProfile } from '@/features/profile/hooks/useProfile';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { ErrorMessage } from '@/components/shared/ErrorMessage';

export default function ProfileScreen() {
  const { data: profile, isLoading, error } = useProfile();

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

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerShown: true
        }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        <ProfileHeader profile={profile} />
        <ProfileStats profile={profile} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    padding: 16
  }
});
```

## Hook de Datos

```typescript
// src/features/profile/hooks/useProfile.ts
import { useQuery } from '@tanstack/react-query';
import { profileService } from '@/services/profile.service';

export const useProfile = () => {
  return useQuery({
    queryKey: ['profile'],
    queryFn: () => profileService.getProfile()
  });
};
```

## Tests

```typescript
// __tests__/screens/ProfileScreen.test.tsx
import { render, screen } from '@testing-library/react-native';
import ProfileScreen from '@/app/(tabs)/profile';

describe('ProfileScreen', () => {
  it('renders loading state', () => {
    const { getByTestId } = render(<ProfileScreen />);
    expect(getByTestId('loading-spinner')).toBeTruthy();
  });

  it('renders profile data', async () => {
    const { findByText } = render(<ProfileScreen />);
    expect(await findByText('John Doe')).toBeTruthy();
  });
});
```

## Opciones de Screen

```typescript
// Configurar header
<Stack.Screen
  options={{
    title: 'Profile',
    headerShown: true,
    headerRight: () => <Button>Edit</Button>,
    headerStyle: {
      backgroundColor: '#f4f4f4'
    }
  }}
/>

// Screen modal
<Stack.Screen
  options={{
    presentation: 'modal',
    title: 'Edit Profile'
  }}
/>
```

## Checklist

- [ ] Screen creada en app/
- [ ] Componentes en features/
- [ ] Hook de datos
- [ ] Tipos definidos
- [ ] Loading state
- [ ] Error state
- [ ] Tests agregados
- [ ] Navegación configurada
