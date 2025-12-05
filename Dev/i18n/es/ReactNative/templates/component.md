# Plantilla: Componente Reutilizable

## Nombre del Componente

`{{COMPONENT_NAME}}.tsx`

## Estructura

```typescript
// components/{{CATEGORY}}/{{COMPONENT_NAME}}/{{COMPONENT_NAME}}.tsx
import React from 'react';
import { View, Text, Pressable, type ViewStyle, type TextStyle } from 'react-native';
import type { FC } from 'react';

// Importar estilos
import { styles } from './{{COMPONENT_NAME}}.styles';

// Importar tipos
import type { {{COMPONENT_NAME}}Props } from './{{COMPONENT_NAME}}.types';

/**
 * Componente {{COMPONENT_NAME}}
 *
 * Descripción: {{DESCRIPTION}}
 *
 * @component
 * @example
 * ```tsx
 * <{{COMPONENT_NAME}}
 *   prop1="valor"
 *   prop2={valor}
 *   onAction={handleAction}
 * />
 * ```
 */
export const {{COMPONENT_NAME}}: FC<{{COMPONENT_NAME}}Props} = ({
  prop1,
  prop2,
  onAction,
  style,
  children,
}) => {
  // 1. State (si es necesario)
  const [internalState, setInternalState] = React.useState(false);

  // 2. Handlers
  const handlePress = () => {
    setInternalState(!internalState);
    onAction?.();
  };

  // 3. Render
  return (
    <View style={[styles.container, style]}>
      <Pressable onPress={handlePress} style={styles.button}>
        <Text style={styles.text}>{prop1}</Text>
      </Pressable>
      {children}
    </View>
  );
};

// Props por defecto (si es necesario)
{{COMPONENT_NAME}}.defaultProps = {
  prop2: 'valor predeterminado',
};
```

## Tipos

```typescript
// components/{{CATEGORY}}/{{COMPONENT_NAME}}/{{COMPONENT_NAME}}.types.ts
import type { ViewStyle } from 'react-native';

export interface {{COMPONENT_NAME}}Props {
  /**
   * Descripción de prop1
   */
  prop1: string;

  /**
   * Descripción de prop2
   * @default "valor predeterminado"
   */
  prop2?: string;

  /**
   * Callback cuando ocurre la acción
   */
  onAction?: () => void;

  /**
   * Estilo personalizado
   */
  style?: ViewStyle;

  /**
   * Elementos hijos
   */
  children?: React.ReactNode;
}
```

## Estilos

```typescript
// components/{{CATEGORY}}/{{COMPONENT_NAME}}/{{COMPONENT_NAME}}.styles.ts
import { StyleSheet } from 'react-native';
import { theme } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.md,
  },
  button: {
    padding: theme.spacing.sm,
  },
  text: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text.primary,
  },
});
```

## Test

```typescript
// components/{{CATEGORY}}/{{COMPONENT_NAME}}/{{COMPONENT_NAME}}.test.tsx
import { render, fireEvent } from '@testing-library/react-native';
import { {{COMPONENT_NAME}} } from './{{COMPONENT_NAME}}';

describe('{{COMPONENT_NAME}}', () => {
  it('renderiza correctamente', () => {
    const { getByText } = render(
      <{{COMPONENT_NAME}} prop1="test" onAction={() => {}} />
    );
    expect(getByText('test')).toBeTruthy();
  });

  it('llama onAction cuando se presiona', () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <{{COMPONENT_NAME}} prop1="test" onAction={onAction} />
    );

    fireEvent.press(getByText('test'));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('renderiza hijos', () => {
    const { getByText } = render(
      <{{COMPONENT_NAME}} prop1="test" onAction={() => {}}>
        <Text>Hijo</Text>
      </{{COMPONENT_NAME}}>
    );
    expect(getByText('Hijo')).toBeTruthy();
  });
});
```

## Exportación Index

```typescript
// components/{{CATEGORY}}/{{COMPONENT_NAME}}/index.ts
export { {{COMPONENT_NAME}} } from './{{COMPONENT_NAME}}';
export type { {{COMPONENT_NAME}}Props } from './{{COMPONENT_NAME}}.types';
```
