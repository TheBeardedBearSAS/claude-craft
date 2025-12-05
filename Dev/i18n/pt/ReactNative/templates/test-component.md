# Template: Teste de Componente

## Estrutura de Teste

```typescript
// components/{{CATEGORY}}/{{COMPONENT_NAME}}/{{COMPONENT_NAME}}.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { {{COMPONENT_NAME}} } from './{{COMPONENT_NAME}}';
import type { {{COMPONENT_NAME}}Props } from './{{COMPONENT_NAME}}.types';

// Mockar dependências se necessário
jest.mock('@/services/api', () => ({
  api: {
    getData: jest.fn(),
  },
}));

describe('{{COMPONENT_NAME}}', () => {
  // Props padrão
  const defaultProps: {{COMPONENT_NAME}}Props = {
    prop1: 'valor de teste',
    onAction: jest.fn(),
  };

  // Função auxiliar para renderizar componente
  const renderComponent = (props: Partial<{{COMPONENT_NAME}}Props> = {}) => {
    return render(<{{COMPONENT_NAME}} {...defaultProps} {...props} />);
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização', () => {
    it('renderiza corretamente', () => {
      const { getByText } = renderComponent();
      expect(getByText('valor de teste')).toBeTruthy();
    });

    it('renderiza com props personalizadas', () => {
      const { getByText } = renderComponent({ prop1: 'valor personalizado' });
      expect(getByText('valor personalizado')).toBeTruthy();
    });

    it('renderiza children', () => {
      const { getByText } = render(
        <{{COMPONENT_NAME}} {...defaultProps}>
          <Text>Conteúdo filho</Text>
        </{{COMPONENT_NAME}}>
      );
      expect(getByText('Conteúdo filho')).toBeTruthy();
    });
  });

  describe('Interações', () => {
    it('chama onAction quando pressionado', () => {
      const onAction = jest.fn();
      const { getByText } = renderComponent({ onAction });

      fireEvent.press(getByText('valor de teste'));

      expect(onAction).toHaveBeenCalledTimes(1);
    });

    it('não chama onAction quando desabilitado', () => {
      const onAction = jest.fn();
      const { getByText } = renderComponent({ onAction, disabled: true });

      fireEvent.press(getByText('valor de teste'));

      expect(onAction).not.toHaveBeenCalled();
    });
  });

  describe('Estados', () => {
    it('mostra estado de carregamento', () => {
      const { getByTestId } = renderComponent({ isLoading: true });
      expect(getByTestId('loading-spinner')).toBeTruthy();
    });

    it('mostra estado de erro', () => {
      const error = new Error('Erro de teste');
      const { getByText } = renderComponent({ error });
      expect(getByText('Erro de teste')).toBeTruthy();
    });

    it('mostra estado vazio', () => {
      const { getByText } = renderComponent({ data: [] });
      expect(getByText('Nenhum dado disponível')).toBeTruthy();
    });
  });

  describe('Comportamento Assíncrono', () => {
    it('carrega dados assincronamente', async () => {
      const { getByText, queryByTestId } = renderComponent();

      // Inicialmente carregando
      expect(queryByTestId('loading-spinner')).toBeTruthy();

      // Aguardar carregamento de dados
      await waitFor(() => {
        expect(getByText('Dados carregados')).toBeTruthy();
      });

      // Loading spinner deve ter sumido
      expect(queryByTestId('loading-spinner')).toBeNull();
    });

    it('trata erros assíncronos', async () => {
      // Mock API para lançar erro
      const { getByText } = renderComponent();

      await waitFor(() => {
        expect(getByText('Erro ocorreu')).toBeTruthy();
      });
    });
  });

  describe('Acessibilidade', () => {
    it('tem labels de acessibilidade corretos', () => {
      const { getByLabelText } = renderComponent();
      expect(getByLabelText('{{COMPONENT_NAME}}')).toBeTruthy();
    });

    it('é acessível', () => {
      const { getByRole } = renderComponent();
      expect(getByRole('button')).toBeTruthy();
    });
  });

  describe('Estilização', () => {
    it('aplica estilo personalizado', () => {
      const customStyle = { backgroundColor: 'red' };
      const { getByTestId } = renderComponent({ style: customStyle });

      const component = getByTestId('{{COMPONENT_NAME}}');
      expect(component.props.style).toContainEqual(customStyle);
    });
  });

  describe('Casos Extremos', () => {
    it('trata dados nulos', () => {
      const { getByText } = renderComponent({ data: null });
      expect(getByText('Sem dados')).toBeTruthy();
    });

    it('trata props indefinidas', () => {
      const { getByText } = renderComponent({ prop1: undefined });
      expect(getByText('Valor padrão')).toBeTruthy();
    });

    it('trata strings muito longas', () => {
      const longString = 'a'.repeat(1000);
      const { getByText } = renderComponent({ prop1: longString });
      expect(getByText(longString)).toBeTruthy();
    });
  });
});
```

## Teste de Snapshot

```typescript
// components/{{CATEGORY}}/{{COMPONENT_NAME}}/{{COMPONENT_NAME}}.snapshot.test.tsx
import React from 'react';
import renderer from 'react-test-renderer';
import { {{COMPONENT_NAME}} } from './{{COMPONENT_NAME}}';

describe('Snapshots {{COMPONENT_NAME}}', () => {
  it('corresponde ao snapshot', () => {
    const tree = renderer
      .create(
        <{{COMPONENT_NAME}} prop1="test" onAction={() => {}} />
      )
      .toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('corresponde ao snapshot com children', () => {
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

## Teste de Integração

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

describe('Integração {{COMPONENT_NAME}}', () => {
  it('integra com API', async () => {
    const { getByText } = render(
      <{{COMPONENT_NAME}} prop1="test" onAction={() => {}} />,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(getByText('Dados carregados')).toBeTruthy();
    });
  });
});
```
