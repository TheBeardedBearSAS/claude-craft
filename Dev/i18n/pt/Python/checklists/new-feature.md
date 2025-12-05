# Checklist: Nova Funcionalidade

## Fase 1: Análise (OBRIGATÓRIA)

### Compreender a Necessidade

- [ ] **Objetivo** claramente definido
  - Qual funcionalidade exatamente?
  - Qual problema isso resolve?
  - Quais são os critérios de aceitação?

- [ ] **Contexto de negócio** compreendido
  - Qual impacto nos negócios?
  - Quais usuários afetados?
  - Alguma restrição de negócio específica?

- [ ] **Restrições técnicas** identificadas
  - Performance necessária?
  - Escalabilidade?
  - Segurança?
  - Compatibilidade?

### Explorar o Código Existente

- [ ] **Padrões similares** identificados
  ```bash
  rg "class.*Service" --type py
  rg "class.*Repository" --type py
  ```

- [ ] **Arquitetura** analisada
  ```bash
  tree src/ -L 3 -I "__pycache__|*.pyc"
  ```

- [ ] **Padrões do projeto** compreendidos
  - Convenções de nomenclatura
  - Padrões de tratamento de erros
  - Estrutura de testes

### Identificar Impactos

- [ ] **Matriz de impacto** criada
  - Quais módulos afetados?
  - Quais migrações de BD necessárias?
  - Quais mudanças de API?

- [ ] **Dependências** identificadas
  - Módulos dependendo do código a modificar
  - Módulos dos quais o novo código depende

### Projetar a Solução

- [ ] **Arquitetura** definida
  - Qual camada (Domínio/Aplicação/Infraestrutura)?
  - Quais classes/funções criar?
  - Quais interfaces necessárias?

- [ ] **Fluxo de dados** documentado
  - Como os dados fluem?
  - Quais transformações?

- [ ] **Escolhas técnicas** justificadas
  - Por que essa abordagem?
  - Quais alternativas consideradas?

### Planejar Implementação

- [ ] **Tarefas** divididas em passos atômicos
- [ ] **Ordem** de implementação definida
- [ ] **Estimativa** realizada com margem (20%)

### Identificar Riscos

- [ ] **Riscos** identificados e avaliados
- [ ] **Mitigações** planejadas
- [ ] **Fallbacks** definidos se possível

### Definir Testes

- [ ] **Estratégia de teste** definida
  - Testes unitários
  - Testes de integração
  - Testes E2E
- [ ] **Cobertura alvo** definida

Veja `rules/01-workflow-analysis.md` para detalhes.

## Fase 2: Implementação

### Camada de Domínio (Se Aplicável)

- [ ] **Entidades** criadas
  - [ ] Dataclass ou classe Python
  - [ ] Validação em `__post_init__`
  - [ ] Métodos de negócio
  - [ ] Igualdade baseada em ID
  - [ ] Docstrings completas

- [ ] **Value Objects** criados
  - [ ] `frozen=True` (imutável)
  - [ ] Validação estrita
  - [ ] Igualdade baseada em valor

- [ ] **Serviços de Domínio** criados (se necessário)
  - [ ] Lógica de negócio multi-entidade
  - [ ] Dependências injetadas
  - [ ] Sem dependência de infraestrutura

- [ ] **Interfaces de Repository** criadas
  - [ ] Protocol em domain/repositories/
  - [ ] Métodos documentados

- [ ] **Exceções de Domínio** criadas
  - [ ] Herdam de DomainException
  - [ ] Mensagens claras

### Camada de Aplicação

- [ ] **DTOs** criados
  - [ ] Pydantic BaseModel
  - [ ] from_entity() e to_dict() se necessário
  - [ ] Validação Pydantic

- [ ] **Commands** criados
  - [ ] Dataclass ou Pydantic
  - [ ] Todas as entradas do caso de uso

- [ ] **Casos de Uso** criados
  - [ ] Uma classe por caso de uso
  - [ ] Dependências injetadas via __init__
  - [ ] Método execute()
  - [ ] Validação de entrada
  - [ ] Tratamento de erros
  - [ ] Retorna DTO

### Camada de Infraestrutura

- [ ] **Modelos de Banco de Dados** criados (se nova entidade)
  - [ ] Modelo SQLAlchemy
  - [ ] Colunas apropriadas
  - [ ] Índices se necessário
  - [ ] Relações se necessário

- [ ] **Migrações** criadas
  ```bash
  make db-migrate msg="Descrição da migração"
  ```
  - [ ] Migração testada (upgrade + downgrade)

- [ ] **Repositories** implementados
  - [ ] Implementa interface do domínio
  - [ ] Conversão Entidade <-> modelo
  - [ ] Tratamento de erros
  - [ ] Rollback em caso de erro

- [ ] **Rotas de API** criadas
  - [ ] Roteador FastAPI
  - [ ] Schemas Pydantic
  - [ ] Injeção de dependência
  - [ ] Códigos de status apropriados
  - [ ] Tratamento de erros

- [ ] **Serviços Externos** integrados (se necessário)
  - [ ] Implementa interface do domínio
  - [ ] Lógica de retry
  - [ ] Tratamento de timeout
  - [ ] Tratamento de erros

### Configuração

- [ ] **Injeção de Dependência** configurada
  - [ ] Container atualizado
  - [ ] Factories criadas
  - [ ] Dependências FastAPI criadas

- [ ] **Variáveis de ambiente** adicionadas
  - [ ] Adicionadas ao `.env.example`
  - [ ] Documentadas no README
  - [ ] Validação com Pydantic Settings

- [ ] **Configuração** atualizada
  - [ ] Classe Config atualizada
  - [ ] Valores padrão definidos

## Fase 3: Testes

### Testes Unitários

- [ ] **Camada de Domínio** testada
  - [ ] Testes para cada entidade
  - [ ] Testes para cada value object
  - [ ] Testes para cada serviço
  - [ ] Cobertura > 95%

- [ ] **Camada de Aplicação** testada
  - [ ] Testes para cada caso de uso
  - [ ] Mocks para dependências
  - [ ] Casos nominais + casos extremos
  - [ ] Cobertura > 90%

- [ ] **Todos os testes unitários** passam
  ```bash
  make test-unit
  ```

### Testes de Integração

- [ ] **Repository** testado
  - [ ] Operações CRUD
  - [ ] Métodos de busca
  - [ ] Com BD real (testcontainers)

- [ ] **Rotas de API** testadas
  - [ ] Casos nominais
  - [ ] Erros (400, 404, 409, 500)
  - [ ] Com FastAPI TestClient

- [ ] **Todos os testes de integração** passam
  ```bash
  make test-integration
  ```

### Testes E2E

- [ ] **Fluxos completos** testados
  - [ ] Caminho feliz
  - [ ] Casos de erro críticos

- [ ] **Todos os testes E2E** passam
  ```bash
  make test-e2e
  ```

### Cobertura

- [ ] **Cobertura geral** > 80%
  ```bash
  make test-cov
  ```
- [ ] **Cobertura do domínio** > 95%
- [ ] **Cobertura da aplicação** > 90%

## Fase 4: Qualidade

### Qualidade do Código

- [ ] **Linting** passa
  ```bash
  make lint
  ```

- [ ] **Formatação** correta
  ```bash
  make format-check
  ```

- [ ] **Verificação de tipos** passa
  ```bash
  make type-check
  ```

- [ ] **Verificação de segurança** passa
  ```bash
  make security-check
  ```

### Revisão Pessoal do Código

- [ ] **SOLID** respeitado
  - [ ] Single Responsibility
  - [ ] Open/Closed
  - [ ] Liskov Substitution
  - [ ] Interface Segregation
  - [ ] Dependency Inversion

- [ ] **KISS, DRY, YAGNI** respeitados
  - [ ] Solução simples
  - [ ] Sem duplicação
  - [ ] Sem código desnecessário

- [ ] **Arquitetura Limpa** respeitada
  - [ ] Dependências para dentro
  - [ ] Domínio independente
  - [ ] Abstrações (Protocols)

- [ ] **Nomenclatura** clara e consistente
- [ ] **Docstrings** completas
- [ ] **Comentários** apenas para lógica complexa
- [ ] **Código morto** removido

## Fase 5: Documentação

- [ ] **Documentação da API** atualizada
  - [ ] Novos endpoints documentados
  - [ ] Exemplos fornecidos
  - [ ] Schemas Request/Response claros

- [ ] **README** atualizado se necessário
  - [ ] Novas funcionalidades documentadas
  - [ ] Instruções de configuração atualizadas

- [ ] **ADR** criado se decisão arquitetural importante
  ```markdown
  docs/adr/NNNN-description.md
  ```

- [ ] **Changelog** atualizado
  ```markdown
  ## [Não Lançado]
  ### Adicionado
  - Descrição da funcionalidade
  ```

## Fase 6: Git & PR

### Commits

- [ ] **Commits** seguem Conventional Commits
  ```
  feat(scope): adicionar sistema de notificação de usuário

  - Implementar notificações por email
  - Adicionar suporte a notificações SMS
  - Criar repository de notificações

  Closes #123
  ```

- [ ] **Commits atômicos**
  - Sem commits gigantes
  - Um commit = uma mudança lógica

### Pull Request

- [ ] **Branch** nomeada corretamente
  ```
  feature/user-notifications
  ```

- [ ] **Descrição do PR** completa
  ```markdown
  ## Resumo
  - O quê
  - Por quê
  - Como

  ## Mudanças
  - Mudança 1
  - Mudança 2

  ## Testes
  - Como foi testado
  - Screenshots se UI

  ## Checklist
  - [x] Testes passam
  - [x] Docs atualizadas
  ```

- [ ] **Testes** passam na CI
- [ ] **Sem conflitos** com main
- [ ] **Auto-revisão** realizada

## Fase 7: Implantação

### Pré-Implantação

- [ ] **Migração de BD** pronta
  - [ ] Testada localmente
  - [ ] Testada em staging
  - [ ] Plano de rollback definido

- [ ] **Variáveis de ambiente** documentadas
  - [ ] Equipe DevOps informada
  - [ ] Valores de produção fornecidos

- [ ] **Feature flags** configuradas (se aplicável)
  - [ ] Funcionalidade desabilitada por padrão
  - [ ] Plano de rollout definido

### Pós-Implantação

- [ ] **Monitoramento** em vigor
  - [ ] Logs verificados
  - [ ] Métricas verificadas
  - [ ] Alertas configurados

- [ ] **Smoke tests** realizados
  - [ ] Funcionalidade testada em prod
  - [ ] Sem erros visíveis

- [ ] **Plano de rollback** pronto se houver problema

## Checklist Rápida

### Mínimo Vital

- [ ] Análise completa realizada
- [ ] Arquitetura limpa (Clean + SOLID)
- [ ] Testes escritos e passando (> 80% cobertura)
- [ ] `make quality` passa
- [ ] Documentação atualizada
- [ ] Descrição completa do PR

### Antes do Merge

- [ ] Revisão aprovada
- [ ] CI passa
- [ ] Sem conflitos
- [ ] Squash commits se necessário

### Sinais de Alerta

Se algum destes for verdadeiro, **NÃO FAZER MERGE**:

- ❌ Análise não feita
- ❌ Testes faltando
- ❌ Cobertura < 80%
- ❌ Erros de Linting/Type
- ❌ Secrets hardcoded
- ❌ Breaking changes não documentadas
- ❌ Migração de BD não testada
