# Checklist de Code Review

## Antes de Começar a Revisão

- [ ] Li a descrição da PR
- [ ] Entendo o objetivo das mudanças
- [ ] Verifiquei os tickets relacionados
- [ ] Tenho o contexto necessário para revisar

---

## Checklist de Revisão

### 1. Design e Arquitetura

- [ ] As mudanças são consistentes com a arquitetura existente
- [ ] As responsabilidades estão bem separadas (SRP)
- [ ] Não há acoplamento forte introduzido
- [ ] As abstrações estão no nível certo
- [ ] Os padrões usados são apropriados
- [ ] Não há over-engineering

### 2. Qualidade do Código

#### Legibilidade
- [ ] O código é fácil de ler e entender
- [ ] Os nomes de variáveis/funções são explícitos
- [ ] As funções fazem uma coisa
- [ ] As funções têm um tamanho razoável (< 50 linhas)
- [ ] O código é auto-documentado

#### Manutenibilidade
- [ ] O código é facilmente modificável
- [ ] Não há código duplicado
- [ ] Números mágicos são evitados (constantes nomeadas)
- [ ] As dependências são gerenciadas corretamente

#### Padrões
- [ ] As convenções de nomenclatura são respeitadas
- [ ] A formatação está correta (linter)
- [ ] As importações estão organizadas
- [ ] Não há código comentado desnecessário
- [ ] Não há TODO sem ticket associado

### 3. Lógica e Funcionalidade

- [ ] A lógica de negócio está correta
- [ ] Os casos extremos são tratados
- [ ] As condições de limite são verificadas
- [ ] Não há bugs óbvios
- [ ] O comportamento esperado é implementado

### 4. Tratamento de Erros

- [ ] Os erros são tratados apropriadamente
- [ ] As mensagens de erro são claras e úteis
- [ ] As exceções são usadas corretamente
- [ ] Os casos de falha são cobertos
- [ ] Log apropriado em caso de erro

### 5. Segurança

- [ ] Não há possibilidade de SQL injection
- [ ] Não há possibilidade de XSS
- [ ] Não há secrets no código
- [ ] Validação de entrada do usuário
- [ ] Autorização verificada se necessário
- [ ] Dados sensíveis protegidos

### 6. Performance

- [ ] Não há N+1 queries
- [ ] Não há operações caras em loops
- [ ] Os índices são usados corretamente
- [ ] Cache apropriado
- [ ] Não há memory leaks
- [ ] Complexidade algorítmica aceitável

### 7. Testes

- [ ] Testes unitários presentes e relevantes
- [ ] Os testes cobrem casos nominais
- [ ] Os testes cobrem casos de erro
- [ ] Os testes são legíveis
- [ ] Os testes são independentes
- [ ] Não há testes flaky

### 8. Documentação

- [ ] Código auto-documentado ou comentado se complexo
- [ ] API documentada se pública
- [ ] README atualizado se necessário
- [ ] Mudanças de configuração documentadas

---

## Tipos de Comentário

### Bloqueante (❌)
Deve ser corrigido antes do merge.
```
❌ Esta query pode causar SQL injection
```

### Importante (⚠️)
Deveria ser corrigido, a menos que justificado.
```
⚠️ Esta função poderia se beneficiar de uma extração
```

### Sugestão (💡)
Melhoria possível, não obrigatória.
```
💡 Poderíamos simplificar esta condição
```

### Pergunta (❓)
Pedido de esclarecimento.
```
❓ Por que essa escolha de implementação?
```

### Positivo (✅)
Feedback positivo sobre o código.
```
✅ Bom uso de pattern aqui!
```

---

## Melhores Práticas do Revisor

1. **Seja construtivo** - Critique o código, não a pessoa
2. **Seja preciso** - Dê exemplos ou sugestões
3. **Seja respeitoso** - Use um tom benevolente
4. **Seja responsivo** - Responda rapidamente às discussões
5. **Seja consistente** - Aplique os mesmos padrões para todos

## Melhores Práticas do Autor

1. **Forneça contexto** - Descrição clara da PR
2. **PRs pequenas** - Mais fácil de revisar
3. **Auto-revisão** - Releia antes de solicitar revisão
4. **Responda aos comentários** - Não ignore
5. **Aprenda** - Use o feedback para melhorar

---

## Decisão de Revisão

- [ ] **Aprovado** - Pronto para merge
- [ ] **Solicitar mudanças** - Mudanças necessárias
- [ ] **Comentar** - Perguntas ou sugestões sem bloquear
