# Padrões de Documentação

## Documentação de Código

### Comentários JSDoc

```typescript
/**
 * Busca dados do usuário da API
 *
 * @param userId - O identificador único do usuário
 * @returns Uma promise que resolve para o objeto do usuário
 * @throws {ApiError} Quando a requisição da API falha
 *
 * @example
 * ```typescript
 * const user = await fetchUser('123');
 * console.log(user.name);
 * ```
 */
export async function fetchUser(userId: string): Promise<User> {
  const response = await apiClient.get(\`/users/\${userId}\`);
  return response.data;
}
```

### Documentação de Componentes

```typescript
/**
 * Um componente de botão reutilizável com múltiplas variantes
 *
 * @component
 * @example
 * ```tsx
 * <Button variant="primary" onPress={handlePress}>
 *   Click me
 * </Button>
 * ```
 */
export const Button: FC<ButtonProps> = ({ variant, onPress, children }) => {
  // Implementação
};
```

---

## Estrutura do README.md

```markdown
# Nome do Projeto

Breve descrição

## Funcionalidades

- Funcionalidade 1
- Funcionalidade 2

## Pré-requisitos

- Node.js 18+
- npm 9+
- Expo CLI

## Instalação

```bash
npm install
```

## Configuração

Copiar \`.env.example\` para \`.env\`:
```bash
cp .env.example .env
```

## Executando

```bash
npx expo start
```

## Testes

```bash
npm test
```

## Build

```bash
eas build --platform all
```

## Estrutura do Projeto

```
src/
├── app/
├── components/
└── services/
```

## Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md)

## Licença

MIT
```

---

## Comentários Inline

### Quando Comentar

```typescript
// ✅ BOM: Explica o "porquê"
// Workaround para bug do teclado iOS no React Native 0.72
if (Platform.OS === 'ios') {
  Keyboard.dismiss();
}

// ✅ BOM: Explica lógica de negócio complexa
// Usuários com assinatura premium ganham 3 tentativas,
// usuários gratuitos ganham apenas 1 tentativa
const maxRetries = user.isPremium ? 3 : 1;

// ❌ RUIM: Explica o "o quê" (já é óbvio)
// Definir count para 0
setCount(0);

// ❌ RUIM: Comentário obsoleto
// TODO: Corrigir isso depois (de 2 anos atrás)
```

---

## Architecture Decision Records (ADR)

### Template

```markdown
# ADR-001: Use Zustand for Global State

## Status
Aceito

## Contexto
Precisamos de uma solução de gerenciamento de estado para o estado global do app
(tema, sessão do usuário, configurações).

## Decisão
Usar Zustand com persistência MMKV.

## Consequências

### Positivas
- Leve (< 1kb)
- API simples
- Suporte TypeScript
- Persistência rápida com MMKV

### Negativas
- Menos ecossistema que Redux
- Sem sistema de middleware

## Alternativas Consideradas
1. Redux Toolkit - Muito pesado
2. Context API - Problemas de performance
3. Jotai - Menos maduro

## Referências
- [Zustand Docs](https://github.com/pmndrs/zustand)
```

---

## Documentação de API

```typescript
/**
 * Serviço de API de Usuários
 *
 * Gerencia todas as chamadas de API relacionadas a usuários.
 */
export class UsersService {
  /**
   * Obtém todos os usuários com filtragem opcional
   *
   * @param filters - Filtros opcionais (nome, email, role)
   * @returns Lista paginada de usuários
   *
   * @example
   * ```typescript
   * const users = await usersService.getAll({ role: 'admin' });
   * ```
   */
  async getAll(filters?: UserFilters): Promise<PaginatedResponse<User>> {
    // Implementação
  }
}
```

---

## Changelog

### CHANGELOG.md

```markdown
# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto adere ao [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Adicionado
- Suporte a modo escuro
- Modo offline para artigos

### Alterado
- Melhorada a performance da lista de artigos

### Corrigido
- Crash de login no Android

## [1.2.0] - 2024-01-15

### Adicionado
- Login social (Google, Apple)
- Notificações push
- Upload de imagem

### Alterado
- Atualizado para Expo SDK 50

### Descontinuado
- Endpoints antigos da API de auth

### Removido
- Sistema de navegação legado

### Corrigido
- Memory leak na tela de perfil

### Segurança
- Atualizadas dependências com vulnerabilidades de segurança

## [1.1.0] - 2023-12-01

...
```

---

## Checklist Documentação

- [ ] README.md atualizado
- [ ] JSDoc para funções públicas
- [ ] Comentários inline pertinentes
- [ ] ADR para decisões importantes
- [ ] CHANGELOG.md mantido
- [ ] API documentada
- [ ] Arquitetura documentada

---

**Uma boa documentação economiza tempo para toda a equipe.**
