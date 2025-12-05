# Definição de Pronto (DoD)

## Checklist Geral

Uma tarefa é considerada "Pronta" quando TODOS os seguintes critérios são atendidos:

### Código

- [ ] O código está escrito e segue as convenções do projeto
- [ ] O código compila sem erros ou warnings
- [ ] O código passou por code review
- [ ] O código está merged na branch principal
- [ ] Conflitos de merge foram resolvidos

### Testes

- [ ] Testes unitários escritos e passando (cobertura > 80%)
- [ ] Testes de integração escritos e passando
- [ ] Testes E2E passando (se aplicável)
- [ ] Testes de regressão passando
- [ ] Testes manuais realizados e validados

### Documentação

- [ ] Documentação técnica atualizada (se necessário)
- [ ] Documentação do usuário atualizada (se necessário)
- [ ] Comentários no código para partes complexas
- [ ] README atualizado se novo setup necessário
- [ ] CHANGELOG atualizado

### Qualidade

- [ ] Análise estática passou (linter, type-checker)
- [ ] Não há dívida técnica introduzida (ou documentada se inevitável)
- [ ] Code review aprovado por pelo menos 1 desenvolvedor
- [ ] Performance verificada (sem degradação)
- [ ] Segurança verificada (OWASP)

### Deploy

- [ ] Build CI/CD passando
- [ ] Deploy em ambiente de staging
- [ ] Testado em staging
- [ ] Configuração de produção pronta
- [ ] Plano de rollback documentado (se aplicável)

### Validação de Negócio

- [ ] Critérios de aceitação validados
- [ ] Demo ao Product Owner (se aplicável)
- [ ] Feedback integrado

---

## DoD por Tipo de Tarefa

### Correção de Bug

- [ ] Bug reproduzido e documentado
- [ ] Causa raiz identificada
- [ ] Correção implementada
- [ ] Teste de não-regressão adicionado
- [ ] Testado nos ambientes afetados

### Nova Funcionalidade

- [ ] User story entendida e validada
- [ ] Design/UX validado (se aplicável)
- [ ] Implementação completa
- [ ] Testes abrangentes
- [ ] Feature flag se necessário
- [ ] Analytics/tracking configurado (se aplicável)

### Refatoração

- [ ] Escopo da refatoração definido
- [ ] Testes existentes ainda passando
- [ ] Sem mudança de comportamento
- [ ] Performance igual ou melhor
- [ ] Code review minucioso

### Tarefa Técnica

- [ ] Objetivo técnico alcançado
- [ ] Documentação técnica completa
- [ ] Impacto em outros componentes verificado
- [ ] Plano de migração se necessário

---

## Exceções

Exceções à DoD devem ser:
1. Documentadas no ticket
2. Aprovadas pelo Tech Lead
3. Seguidas por um ticket de dívida técnica

---

## Revisão

Esta Definição de Pronto é revista a cada retrospectiva de sprint se necessário.

Última atualização: YYYY-MM-DD
