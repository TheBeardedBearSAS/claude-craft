---
description: Comando: Verificar Arquitetura
---

# Comando: Verificar Arquitetura

Avalie a arquitetura da aplicação React Native quanto a estrutura, organização e aderência aos princípios.

---

## Objetivo

Este comando analisa a arquitetura da sua aplicação React Native e fornece recomendações para melhorar organização, manutenibilidade e escalabilidade.

---

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou requer investigação transversal.

## Análise

### 1. Estrutura de Pastas

**Verificar organização:**

```bash
tree src -L 3 -I 'node_modules|__tests__'
```

**Avaliar:**

- [ ] Organização baseada em features (não por tipo técnico)
- [ ] Camadas claramente separadas (UI, Logic, Data)
- [ ] Estrutura consistente em todas as features
- [ ] Arquivos de barrel export (index.ts) presentes
- [ ] Sem pastas muito profundas (max 4-5 níveis)
- [ ] Sem arquivos orphan

**Estrutura recomendada:**

```
src/
├── app/                    # Expo Router (screens)
├── features/               # Features por domínio
│   ├── auth/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── stores/
│   │   └── types/
│   └── articles/
├── components/             # Componentes compartilhados
│   ├── ui/
│   ├── forms/
│   └── layout/
├── hooks/                  # Hooks globais
├── services/               # Serviços globais
├── stores/                 # Estado global
├── utils/                  # Utilitários
├── types/                  # Tipos globais
├── constants/              # Constantes
├── theme/                  # Tema
└── assets/                 # Assets
```

### 2. Separação de Responsabilidades

**Verificar camadas:**

```typescript
// ❌ RUIM: Tudo misturado
export const UserScreen = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch('/api/user')
      .then(res => res.json())
      .then(setUser);
  }, []);

  return <View>{/* UI */}</View>;
};

// ✅ BOM: Camadas separadas
// Hook (Logic Layer)
export const useUser = () => {
  return useQuery({
    queryKey: ['user'],
    queryFn: () => userService.get(),
  });
};

// Screen (Presentation Layer)
export const UserScreen = () => {
  const { data: user } = useUser();
  return <UserProfile user={user} />;
};
```

**Avaliar:**

- [ ] UI components sem lógica de negócio
- [ ] Hooks customizados para lógica reutilizável
- [ ] Serviços para chamadas de API
- [ ] Stores para estado global
- [ ] Types separados dos componentes

### 3. Gerenciamento de Estado

**Verificar arquitetura de estado:**

- [ ] Estado local com useState para estado de componente
- [ ] Estado global com Zustand para estado compartilhado
- [ ] React Query para estado do servidor
- [ ] MMKV para persistência
- [ ] SecureStore para dados sensíveis

**Anti-patterns a evitar:**

```typescript
// ❌ Prop drilling excessivo
<A>
  <B prop={data}>
    <C prop={data}>
      <D prop={data} />
    </C>
  </B>
</A>

// ✅ Usar context ou store global
const useDataStore = create((set) => ({
  data: null,
  setData: (data) => set({ data }),
}));
```

### 4. Navegação

**Verificar Expo Router:**

- [ ] Estrutura de rotas clara e consistente
- [ ] Rotas tipadas (TypeScript)
- [ ] Grupos de rotas usados apropriadamente
- [ ] Layouts compartilhados implementados
- [ ] Deep linking configurado
- [ ] Navegação aninhada gerenciada adequadamente

### 5. Dependências

**Verificar imports:**

```bash
npx madge --circular src
```

**Avaliar:**

- [ ] Sem dependências circulares
- [ ] Imports organizados (React, libs, internos, relativos)
- [ ] Path aliases configurados (@/, @components/, etc.)
- [ ] Barrel exports usados adequadamente
- [ ] Sem imports desnecessários

---

## Relatório

```markdown
## Análise de Arquitetura

### ✅ Pontos Fortes
- [Liste o que está bem arquitetado]

### ⚠️ Problemas Identificados
1. **[Problema]**
   - Impacto: [Alto/Médio/Baixo]
   - Localização: [path/to/files]
   - Recomendação: [ação]

### 💡 Recomendações
1. **[Recomendação]**
   - Benefício: [descrição]
   - Esforço: [Alto/Médio/Baixo]
   - Prioridade: [Alta/Média/Baixa]

### 📊 Métricas
- Aderência à arquitetura feature-based: [%]
- Separação de responsabilidades: [%]
- Qualidade de organização: [%]
```

---

## Ações Recomendadas

- [ ] Refatorar estrutura de pastas para feature-based
- [ ] Extrair lógica de componentes para hooks
- [ ] Centralizar chamadas de API em serviços
- [ ] Configurar path aliases
- [ ] Resolver dependências circulares
- [ ] Implementar barrel exports
- [ ] Documentar arquitetura

---

**Uma boa arquitetura facilita manutenção e escalabilidade. Invista tempo desde o início.**
