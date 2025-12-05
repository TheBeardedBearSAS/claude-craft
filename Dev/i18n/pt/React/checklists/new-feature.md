# Checklist: Nova Funcionalidade React

## 1. Planejamento e Design

- [ ] Requisitos claramente definidos
- [ ] Mockups/wireframes aprovados
- [ ] Casos de uso documentados
- [ ] Impacto em funcionalidades existentes avaliado
- [ ] Abordagem tecnica discutida e aprovada
- [ ] Ticket/Issue criado

## 2. Configuracao

- [ ] Branch criada a partir de `develop`
- [ ] Nomenclatura da branch: `feature/TICKET-descricao`
- [ ] Dependencias necessarias identificadas
- [ ] Ambiente de desenvolvimento pronto

## 3. Desenvolvimento

### Arquitetura

- [ ] Componentes organizados por funcionalidade
- [ ] Separacao de responsabilidades (container/presenter)
- [ ] Reutilizacao de componentes existentes quando possivel
- [ ] Props e tipos bem definidos
- [ ] Hooks personalizados para logica compartilhada

### Componentes

- [ ] Componentes funcionais com TypeScript
- [ ] Props tipadas e documentadas (JSDoc)
- [ ] Estados gerenciados adequadamente
- [ ] Efeitos colaterais tratados corretamente
- [ ] Memoizacao aplicada quando necessario
- [ ] Acessibilidade implementada (ARIA, roles, labels)

### State Management

- [ ] Estado local vs global apropriado
- [ ] Zustand/Redux/Context bem configurado
- [ ] Atualizacoes de estado imutaveis
- [ ] Otimizacao para evitar re-renderizacoes desnecessarias

### Data Fetching

- [ ] React Query/SWR configurado
- [ ] Estados de loading/error tratados
- [ ] Cache configurado apropriadamente
- [ ] Revalidacao implementada
- [ ] Otimistic updates quando relevante

### Styling

- [ ] Abordagem consistente com o projeto
- [ ] Design responsivo implementado
- [ ] Temas aplicados corretamente
- [ ] Sem inline styles desnecessarios
- [ ] Acessibilidade visual (contraste, tamanhos)

## 4. Qualidade de Codigo

### TypeScript

- [ ] Tipagem rigorosa (sem `any`)
- [ ] Interfaces bem definidas
- [ ] Type guards quando necessarios
- [ ] Sem erros de compilacao

### Linting e Formatacao

- [ ] ESLint sem erros
- [ ] ESLint sem warnings
- [ ] Prettier aplicado
- [ ] Codigo limpo e legivel

### Best Practices

- [ ] Codigo DRY (sem duplicacao)
- [ ] Funcoes pequenas e focadas
- [ ] Nomes descritivos
- [ ] Comentarios uteis (nao obvios)
- [ ] Sem console.log/debugger
- [ ] Sem codigo comentado

## 5. Testes

### Testes Unitarios

- [ ] Componentes principais testados
- [ ] Hooks personalizados testados
- [ ] Utilitarios testados
- [ ] Cobertura > 80%
- [ ] Casos de borda cobertos

### Testes de Integracao

- [ ] Fluxos principais testados
- [ ] Interacoes entre componentes testados
- [ ] Estados de loading/error testados

### Testes E2E (quando aplicavel)

- [ ] Jornadas criticas do usuario testadas
- [ ] Fluxos completos verificados

## 6. Seguranca

- [ ] Input do usuario validado
- [ ] Dados do usuario sanitizados
- [ ] XSS prevenido
- [ ] CSRF protegido
- [ ] Sem segredos hardcoded
- [ ] Permissoes verificadas

## 7. Performance

- [ ] Lazy loading implementado
- [ ] Code splitting aplicado
- [ ] Imagens otimizadas
- [ ] Re-renderizacoes minimizadas
- [ ] Bundle size razoavel
- [ ] Lighthouse score > 90

## 8. Acessibilidade

- [ ] Navegacao por teclado funcional
- [ ] Leitores de tela suportados
- [ ] Atributos ARIA corretos
- [ ] Contraste de cores adequado
- [ ] Textos alternativos presentes
- [ ] Focus management implementado

## 9. Documentacao

- [ ] README atualizado
- [ ] Componentes documentados (JSDoc)
- [ ] Storybook criado (quando relevante)
- [ ] CHANGELOG atualizado
- [ ] Guias de uso escritos
- [ ] Diagramas atualizados

## 10. Revisao Pre-Commit

- [ ] Auto-revisao do codigo realizada
- [ ] Testes locais passando
- [ ] Build bem-sucedido
- [ ] Sem conflitos com `develop`
- [ ] Commits atomicos e bem descritos
- [ ] Mensagens de commit seguem Conventional Commits

## 11. Pull Request

- [ ] PR criado com descricao completa
- [ ] Screenshots/videos incluidos (se UI)
- [ ] Checklist preenchido
- [ ] Revisores atribuidos
- [ ] Labels aplicados
- [ ] Issue linkada

## 12. Revisao de Codigo

- [ ] Feedback de revisao recebido
- [ ] Mudancas solicitadas implementadas
- [ ] Discussoes resolvidas
- [ ] Aprovacao obtida

## 13. Pre-Merge

- [ ] Todos os testes CI passando
- [ ] Cobertura de codigo mantida/melhorada
- [ ] Sem warnings no build
- [ ] Branch atualizada com `develop`
- [ ] Conflitos resolvidos

## 14. Pos-Merge

- [ ] Feature verificada em staging
- [ ] Regressoes verificadas
- [ ] Metricas de performance verificadas
- [ ] Branch local deletada
- [ ] Branch remota deletada

## 15. Deployment

- [ ] Deploy para staging bem-sucedido
- [ ] Testes de aceitacao passando
- [ ] Deploy para producao agendado
- [ ] Rollback plan documentado
- [ ] Monitoramento configurado

## 16. Pos-Deployment

- [ ] Funcionalidade verificada em producao
- [ ] Metricas monitoradas
- [ ] Feedback de usuarios coletado
- [ ] Bugs reportados tratados
- [ ] Documentacao de usuario atualizada

## Notas

- Marcar cada item ao completar
- Adaptar checklist conforme necessidade do projeto
- Documentar desvios e justificativas
- Revisar checklist regularmente para melhorias
