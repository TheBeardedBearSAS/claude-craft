---
description: Verificacao de Conformidade de Padroes
---

# Verificacao de Conformidade de Padroes

Verificar se o projeto React segue padroes de codigo e melhores praticas estabelecidas.

## O Que Este Comando Faz

1. **Verificacao de Padroes**
   - Verificar convencoes de codigo
   - Verificar convencoes de nomenclatura
   - Validar organizacao de arquivos
   - Verificar ordem de imports
   - Verificar padroes de documentacao

2. **Areas de Conformidade**
   - Melhores praticas TypeScript
   - Padroes React
   - Convencoes CSS/Styling
   - Padroes de testes
   - Convencoes de commit Git

3. **Relatorio Gerado**
   - Arquivos nao-conformes
   - Niveis de severidade
   - Recomendacoes de remediacao
   - Score de conformidade

## Padroes de Codigo

### 1. Convencoes de Nomenclatura

```typescript
// ✅ Componentes: PascalCase
export const UserProfile: FC = () => {};

// ✅ Funcoes/variaveis: camelCase
const getUserData = () => {};
const isAuthenticated = true;

// ✅ Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.exemplo.com';
const MAX_RETRY_ATTEMPTS = 3;

// ✅ Tipos/Interfaces: PascalCase
interface User {}
type UserRole = 'admin' | 'user';
```

### 2. Organizacao de Arquivos

```typescript
// ✅ Bom - Organizacao adequada
src/
├── features/
│   └── users/
│       ├── components/
│       ├── hooks/
│       └── types/
```

## Checklist de Conformidade

- [ ] Convencoes de nomenclatura seguidas
- [ ] Arquivos organizados adequadamente
- [ ] Imports ordenados corretamente
- [ ] Modo strict do TypeScript habilitado
- [ ] Sem tipos `any` usados
- [ ] Todas as props tipadas adequadamente
- [ ] Regras dos React Hooks seguidas
- [ ] Testes seguem padrao AAA
- [ ] Cobertura de testes > 80%
- [ ] CSS organizado (modules/Tailwind)
- [ ] Commits seguem convencoes
- [ ] Componentes documentados
- [ ] ESLint passa sem erros
- [ ] Formatacao Prettier aplicada
