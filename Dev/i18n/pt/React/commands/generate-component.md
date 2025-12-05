# Gerar Componente React

Gerar um novo componente React com TypeScript, testes e boilerplate de estilo.

## O Que Este Comando Faz

1. **Geracao de Componente**
   - Criar arquivo de componente
   - Gerar interfaces TypeScript
   - Criar arquivo de teste
   - Criar arquivo de estilo (CSS Module ou styled-components)
   - Criar story Storybook (opcional)
   - Criar barrel export index.ts

2. **Templates Usados**
   - Componente funcional com TypeScript
   - Interface de props
   - Estrutura basica de testes
   - Boilerplate de estilo

3. **Arquivos Gerados**
   ```
   src/components/ComponentName/
   ├── ComponentName.tsx
   ├── ComponentName.test.tsx
   ├── ComponentName.module.css
   ├── ComponentName.stories.tsx (opcional)
   └── index.ts
   ```

## Como Usar

```bash
# Gerar componente
npm run generate:component ComponentName

# Com caminho personalizado
npm run generate:component features/users/components/UserCard

# Com opcoes
npm run generate:component ComponentName --story --styled
```

## Template de Componente Basico

```typescript
// ComponentName.tsx
import { FC } from 'react';
import styles from './ComponentName.module.css';

export interface ComponentNameProps {
  children?: React.ReactNode;
  className?: string;
}

export const ComponentName: FC<ComponentNameProps> = ({
  children,
  className
}) => {
  return (
    <div className={`${styles.container} ${className || ''}`}>
      {children}
    </div>
  );
};
```

## Melhores Praticas

1. **PascalCase** para nomes de componentes
2. **Colocalizacao** de arquivos relacionados
3. **Interfaces TypeScript** para props
4. **Comentarios JSDoc** para documentacao
5. **Evitar exports default** (usar exports nomeados)
6. **Interface de props** exportada separadamente
7. **Arquivo de teste** junto com componente
8. **Barrel exports** para imports limpos
