# Template: Test de Componente

## Estructura del Test

```typescript
// components/{{CATEGORY}}/{{COMPONENT_NAME}}/{{COMPONENT_NAME}}.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { {{COMPONENT_NAME}} } from './{{COMPONENT_NAME}}';
import type { {{COMPONENT_NAME}}Props } from './{{COMPONENT_NAME}}.types';

// Mock dependencies if needed
jest.mock('@/services/api', () => ({
  api: {
    getData: jest.fn(),
  },
}));

describe('{{COMPONENT_NAME}}', () => {
  // Default props
  const defaultProps: {{COMPONENT_NAME}}Props = {
    prop1: 'test value',
    onAction: jest.fn(),
  };

  // Helper function to render component
  const renderComponent = (props: Partial<{{COMPONENT_NAME}}Props> = {}) => {
    return render(<{{COMPONENT_NAME}} {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders correctly', () => {
      const { getByText } = renderComponent();
      expect(getByText('test value')).toBeTruthy();
    });

    it('renders with custom props', () => {
      const { getByText } = renderComponent({ prop1: 'custom value' });
      expect(getByText('custom value')).toBeTruthy();
    });

    it('renders children', () => {
      const { getByText } = render(
        <{{COMPONENT_NAME}} {...defaultProps}>
          <Text>Child content</Text>
        </{{COMPONENT_NAME}}>
      );
      expect(getByText('Child content')).toBeTruthy();
    });
  });

  describe('Interactions', () => {
    it('calls onAction when pressed', () => {
      const onAction = jest.fn();
      const { getByText } = renderComponent({ onAction });

      fireEvent.press(getByText('test value'));

      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('does not call onAction when disabled', () => {
      const onAction = jest.fn();
      const { getByText } = renderComponent({ onAction, disabled: true });

      fireEvent.press(getByText('test value'));

      expect(onAction).not.toHaveBeenCalled();
    });
  });

  describe('States', () => {
    it('shows loading state', () => {
      const { getByTestId } = renderComponent({ isLoading: true });
      expect(getByTestId('loading-spinner')).toBeTruthy();
    });

    it('shows error state', () => {
      const error = new Error('Test error');
      const { getByText } = renderComponent({ error });
      expect(getByText('Test error')).toBeTruthy();
    });

    it('shows empty state', () => {
      const { getByText } = renderComponent({ data: [] });
      expect(getByText('No data available')).toBeTruthy();
    });
  });

  describe('Async Behavior', () => {
    it('loads data asynchronously', async () => {
      const { getByText, queryByTestId } = renderComponent();

      // Initially loading
      expect(queryByTestId('loading-spinner')).toBeTruthy();

      // Wait for data to load
      await waitFor(() => {
        expect(getByText('Loaded data')).toBeTruthy();
      });

      // Loading spinner should be gone
      expect(queryByTestId('loading-spinner')).toBeNull();
    });

    it('handles async errors', async () => {
      // Mock API to throw error
      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText('Error occurred')).toBeTruthy();
      });
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility labels', () => {
      const { getByLabelText } = renderComponent();
      expect(getByLabelText('{{COMPONENT_NAME}}')).toBeTruthy();
    });

    it('is accessible', () => {
      const { getByRole } = renderComponent();
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Styling', () => {
    it('applies custom style', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = renderComponent({ style: customStyle });

      const component = getByTestId('{{COMPONENT_NAME}}');
      expect(component.props.style).toContainEqual(customStyle);
    });
  });

  describe('Edge Cases', () => {
    it('handles null data', () => {
      const { getByText } = renderComponent({ data: null });
      expect(getByText('No data')).toBeTruthy();
    });

    it('handles undefined props', () => {
      const { getByText } = renderComponent({ prop1: undefined });
      expect(getByText('Default value')).toBeTruthy();
    });

    it('handles very long strings', () => {
      const longString = 'a'.repeat(1000);
      const { getByText } = renderComponent({ prop1: longString });
      expect(getByText(longString)).toBeTruthy();
    });
  });
});
```

## Test de Snapshot

```typescript
// components/{{CATEGORY}}/{{COMPONENT_NAME}}/{{COMPONENT_NAME}}.snapshot.test.tsx
import React from 'react';
import renderer from 'react-test-renderer';
import { {{COMPONENT_NAME}} } from './{{COMPONENT_NAME}}';

describe('{{COMPONENT_NAME}} Snapshots', () => {
  it('matches snapshot', () => {
    const tree = renderer
      .create(
        <{{COMPONENT_NAME}} prop1="test" onAction={() => {}} />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('matches snapshot with children', () => {
    const tree = renderer
      .create(
        <{{COMPONENT_NAME}} prop1="test" onAction={() => {}}>
          <Text>Child</Text>
        </{{COMPONENT_NAME}}>
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });
});
```

## Test de Integración

```typescript
// __tests__/integration/{{COMPONENT_NAME}}.integration.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { {{COMPONENT_NAME}} } from '@/components/{{CATEGORY}}/{{COMPONENT_NAME}}';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('{{COMPONENT_NAME}} Integration', () => {
  it('integrates with API', async () => {
    const { getByText } = render(
      <{{COMPONENT_NAME}} prop1="test" onAction={() => {}} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(getByText('Data loaded')).toBeTruthy();
    });
  });
});
```
