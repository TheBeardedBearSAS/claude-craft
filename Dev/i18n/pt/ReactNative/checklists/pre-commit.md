# Checklist: Pré-Commit React Native

Execute este checklist antes de cada commit para garantir qualidade e consistência do código.

---

## 🔍 Verificações Básicas

### Código
- [ ] Código funciona corretamente no iOS
- [ ] Código funciona corretamente no Android
- [ ] Sem console.logs esquecidos
- [ ] Sem debuggers esquecidos
- [ ] Sem código comentado desnecessário
- [ ] Sem imports não utilizados
- [ ] Sem variáveis não utilizadas

### Arquivos
- [ ] Apenas arquivos necessários incluídos no commit
- [ ] Nenhum arquivo de configuração pessoal (.env local, etc.)
- [ ] Nenhum arquivo temporário ou build
- [ ] node_modules não incluído
- [ ] .expo/ não incluído

---

## 📝 TypeScript

### Tipagem
- [ ] Sem erros do TypeScript
- [ ] Sem warnings do TypeScript
- [ ] Sem uso de `any` (ou justificado com comentário)
- [ ] Todas as props de componentes tipadas
- [ ] Todos os retornos de função tipados
- [ ] Interfaces/types documentadas quando complexas

### Strict Mode
- [ ] strict: true respeitado
- [ ] strictNullChecks respeitado
- [ ] noImplicitAny respeitado
- [ ] noUnusedLocals respeitado
- [ ] noUnusedParameters respeitado

---

## 🎨 Estilização

### StyleSheet
- [ ] StyleSheet.create usado (não inline objects)
- [ ] Sem estilos duplicados
- [ ] Tema usado para cores/spacing/typography
- [ ] Nomes de estilos descritivos
- [ ] Estilos organizados logicamente

### Responsividade
- [ ] Testado em diferentes tamanhos de tela
- [ ] Testado em orientação portrait e landscape
- [ ] Testado em tablets (se aplicável)
- [ ] Estilos dinâmicos funcionam corretamente

### Plataforma
- [ ] Diferenças iOS/Android gerenciadas
- [ ] Platform.select usado apropriadamente
- [ ] Arquivos .ios.tsx / .android.tsx se necessário
- [ ] Sombras funcionam em ambas plataformas

---

## ⚡ Performance

### Componentes
- [ ] React.memo usado para componentes caros
- [ ] useCallback aplicado a event handlers passados como props
- [ ] useMemo aplicado a cálculos caros
- [ ] Sem renderizações infinitas
- [ ] Sem memory leaks (cleanup em useEffect)

### Listas
- [ ] FlatList usado para listas longas (não ScrollView com map)
- [ ] keyExtractor fornecido
- [ ] renderItem otimizado
- [ ] Props de otimização configuradas (initialNumToRender, etc.)

### Imagens
- [ ] Imagens otimizadas (tamanho/formato)
- [ ] Placeholder durante carregamento
- [ ] Cache configurado
- [ ] Fast Image usado se múltiplas imagens

---

## 🔧 Código

### Qualidade
- [ ] Funções curtas e focadas
- [ ] Componentes pequenos e reutilizáveis
- [ ] Nomes descritivos (variáveis, funções, componentes)
- [ ] Lógica complexa extraída em funções/hooks
- [ ] Código autodocumentado

### Princípios
- [ ] Single Responsibility Principle respeitado
- [ ] DRY: sem código duplicado
- [ ] KISS: solução mais simples escolhida
- [ ] YAGNI: apenas código necessário

### Hooks
- [ ] Hooks nomeados com `use` prefix
- [ ] Regras dos hooks respeitadas
- [ ] Arrays de dependências corretos
- [ ] Cleanup implementado quando necessário
- [ ] Hooks customizados testáveis

---

## 🌐 API & Data

### Data Fetching
- [ ] React Query usado para server state
- [ ] Query keys consistentes
- [ ] Tratamento de erro implementado
- [ ] Loading states gerenciados
- [ ] Cache configurado apropriadamente

### Error Handling
- [ ] Try-catch para código async
- [ ] Erros logados adequadamente
- [ ] Mensagens de erro amigáveis ao usuário
- [ ] Error boundaries implementadas

---

## 🔒 Segurança

### Dados Sensíveis
- [ ] Nenhuma credencial hardcoded
- [ ] Nenhum token exposto
- [ ] Variáveis de ambiente usadas
- [ ] SecureStore para dados sensíveis
- [ ] Nenhuma key de API no código

### Validação
- [ ] Input do usuário validado
- [ ] Dados de API sanitizados
- [ ] Permissões solicitadas adequadamente

---

## 🧪 Testes

### Execução
- [ ] `npm test` ou `yarn test` passa
- [ ] Nenhum teste quebrado
- [ ] Nenhum teste skipped sem razão
- [ ] Cobertura de testes mantida/melhorada

### Qualidade
- [ ] Novos componentes testados
- [ ] Novos hooks testados
- [ ] Casos extremos cobertos
- [ ] Testes são significativos (não apenas para cobertura)

---

## 🛠️ Ferramentas

### Linting
- [ ] `npx eslint .` passa sem erros
- [ ] Sem warnings críticos de ESLint
- [ ] Regras customizadas respeitadas

### Formatação
- [ ] `npx prettier --check .` passa
- [ ] Código formatado automaticamente
- [ ] Configuração do Prettier respeitada

### Type Checking
- [ ] `npx tsc --noEmit` passa
- [ ] Nenhum erro de tipagem

---

## 📱 Build

### Compilação
- [ ] `npx expo start` funciona sem erros
- [ ] Build iOS compila (se aplicável)
- [ ] Build Android compila (se aplicável)
- [ ] Nenhum warning crítico no build

### Dependências
- [ ] package.json atualizado
- [ ] package-lock.json ou yarn.lock commitado
- [ ] Dependências necessárias instaladas
- [ ] Nenhuma dependência quebrada

---

## 📚 Documentação

### Código
- [ ] Lógica complexa comentada
- [ ] JSDoc adicionado para APIs públicas
- [ ] TODOs marcados com // TODO: quando necessário
- [ ] README atualizado se mudanças estruturais

### Commit
- [ ] Mensagem de commit descritiva
- [ ] Convenção de commit seguida (Conventional Commits)
- [ ] Referência a issue/ticket incluída
- [ ] Quebras de compatibilidade documentadas

---

## 🔄 Git

### Histórico
- [ ] Commit atômico (uma mudança lógica)
- [ ] Branch atualizada com main/develop
- [ ] Nenhum conflito de merge
- [ ] Histórico limpo (sem commits de merge desnecessários)

### Arquivos
- [ ] .gitignore atualizado se necessário
- [ ] Nenhum arquivo grande (>1MB) commitado
- [ ] Nenhum arquivo binário desnecessário

---

## ✅ Checklist Rápido (Mínimo)

Para commits rápidos, pelo menos verifique:

1. [ ] Código funciona (iOS + Android)
2. [ ] Sem console.logs
3. [ ] TypeScript passa (`npx tsc --noEmit`)
4. [ ] ESLint passa (`npx eslint .`)
5. [ ] Prettier formatou (`npx prettier --write .`)
6. [ ] Testes passam (`npm test`)
7. [ ] Mensagem de commit descritiva

---

## 🚀 Automação

**Considere usar Husky + lint-staged para automatizar estes checks:**

```bash
# Instalar
npx husky-init && npm install
npm install --save-dev lint-staged

# Configurar lint-staged em package.json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write",
      "tsc --noEmit"
    ]
  }
}

# Adicionar pre-commit hook
npx husky set .husky/pre-commit "npx lint-staged && npm test"
```

---

**Este checklist ajuda a manter qualidade consistente. Adapte conforme as necessidades do seu projeto.**
