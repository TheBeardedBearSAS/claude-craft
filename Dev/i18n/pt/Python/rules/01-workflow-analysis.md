# Fluxo de Análise Obrigatório

## Princípio Fundamental

**NENHUMA modificação de código deve ser feita sem uma análise preliminar completa.**

Esta regra é absoluta e se aplica a:
- Criação de novas funcionalidades
- Correção de bugs
- Refatoração
- Otimizações
- Mudanças de configuração
- Atualizações de dependências

## Metodologia de Análise em 7 Etapas

### 1. Compreensão da Necessidade

#### Perguntas a Fazer

1. **Qual é o objetivo exato?**
   - Qual funcionalidade precisa ser adicionada/modificada?
   - Qual problema precisa ser resolvido?
   - Qual é o comportamento esperado?

2. **Qual é o contexto de negócio?**
   - Qual é o impacto no negócio?
   - Quais usuários são afetados?
   - Existem restrições específicas do negócio?

3. **Quais são as restrições técnicas?**
   - Performance (tempo de resposta, taxa de transferência)
   - Escalabilidade
   - Segurança
   - Compatibilidade

#### Ações a Realizar

```python
# Exemplo de documentação da necessidade
"""
NECESSIDADE: Adicionar um sistema de notificação por email ao criar um pedido

CONTEXTO:
- Clientes devem receber confirmação imediata
- O sistema deve suportar 10.000 pedidos/dia
- Emails devem ser enviados de forma assíncrona
- Templates de email devem ser personalizáveis

RESTRIÇÕES:
- Tempo de resposta da API < 200ms (envio deve ser assíncrono)
- Retry automático em caso de falha
- Logging completo para auditoria
- Suporte a múltiplos idiomas

CRITÉRIOS DE ACEITAÇÃO:
- Email enviado em até 5 minutos após pedido
- Template personalizável por tipo de pedido
- Rastreamento de emails enviados/falhados
- Dashboard de monitoramento de envios
"""
```

### 2. Exploração do Código Existente

#### Ferramentas de Exploração

```bash
# Buscar padrões similares
rg "class.*Service" --type py
rg "async def.*email" --type py
rg "from.*repository import" --type py

# Analisar estrutura
tree src/ -L 3 -I "__pycache__|*.pyc"

# Identificar dependências
rg "^import|^from" src/ --type py | sort | uniq

# Encontrar testes existentes
find tests/ -name "*test*.py" -o -name "test_*.py"
```

#### Perguntas a Fazer

1. **Existe código similar?**
   - Padrões de serviço existentes
   - Repositórios similares
   - Casos de uso comparáveis

2. **Qual é a arquitetura atual?**
   - Como as camadas são organizadas?
   - Onde colocar o novo código?
   - Quais abstrações já existem?

3. **Quais são os padrões do projeto?**
   - Convenções de nomenclatura utilizadas
   - Padrões de tratamento de erros
   - Estrutura de testes

#### Exemplo de Análise

```python
# ANÁLISE DO CÓDIGO EXISTENTE
"""
1. SERVIÇOS EXISTENTES:
   - src/myapp/domain/services/order_service.py
   - src/myapp/domain/services/payment_service.py
   Padrão: Serviços de negócio em domain/services/

2. COMUNICAÇÃO ASSÍNCRONA:
   - Infraestrutura Celery configurada (infrastructure/tasks/)
   - Filas 'default' e 'emails' já definidas
   Padrão: Tasks Celery para operações async

3. REPOSITÓRIOS:
   - Padrão Repository com interface + implementação
   - Localização: domain/repositories/ (interfaces)
   - Implementação: infrastructure/database/repositories/

4. TRATAMENTO DE ERROS:
   - Exceções customizadas em shared/exceptions/
   - Padrão: DomainException, ApplicationException, InfrastructureException

5. TESTES:
   - Fixtures em tests/conftest.py
   - Mocks com pytest-mock
   - Testes unitários: tests/unit/
   - Testes de integração: tests/integration/

CONCLUSÃO:
- Criar EmailService em domain/services/
- Criar interface EmailRepository em domain/repositories/
- Implementar com Celery em infrastructure/tasks/
- Seguir padrão existente para exceções
"""
```

### 3. Identificação de Impactos

#### Matriz de Impactos

| Zona | Impacto | Detalhes | Ações Necessárias |
|------|---------|---------|-------------------|
| Camada Domain | ALTO | Nova entidade Email, novo serviço | Criação + testes unitários |
| Camada Application | MÉDIO | Novo caso de uso SendOrderConfirmation | Criação + testes |
| Infrastructure | ALTO | Implementação provedor de email, task Celery | Configuração + testes integração |
| API | BAIXO | Nenhum endpoint novo (trigger interno) | Nenhuma |
| Base de Dados | MÉDIO | Nova tabela email_logs | Migration + testes |
| Configuração | MÉDIO | Variáveis env para SMTP | Documentação |
| Testes | ALTO | Testes em todas as camadas | Suite completa |
| Documentação | MÉDIO | Docs da API, atualização README | Escrita |

#### Análise de Dependências

```python
# Identificar módulos afetados
"""
MÓDULOS DIRETAMENTE IMPACTADOS:
├── domain/
│   ├── entities/email.py (NOVO)
│   ├── services/email_service.py (NOVO)
│   └── repositories/email_repository.py (NOVO - interface)
├── application/
│   └── use_cases/send_order_confirmation.py (NOVO)
├── infrastructure/
│   ├── email/
│   │   └── smtp_email_provider.py (NOVO)
│   ├── tasks/
│   │   └── email_tasks.py (NOVO)
│   └── database/
│       ├── models/email_log.py (NOVO)
│       └── repositories/email_repository_impl.py (NOVO)

MÓDULOS INDIRETAMENTE IMPACTADOS:
├── application/use_cases/create_order.py (MODIFICADO - chama novo caso de uso)
├── infrastructure/database/migrations/ (NOVO - migration)
└── infrastructure/di/container.py (MODIFICADO - injeção de dependência)

ARQUIVOS DE CONFIGURAÇÃO:
├── .env.example (MODIFICADO - novas variáveis)
├── docker-compose.yml (POTENCIAL - serviço de email se mailhog)
└── pyproject.toml (POTENCIAL - novas dependências)
"""
```

### 4. Design da Solução

#### Arquitetura da Solução

```python
"""
ARQUITETURA PROPOSTA:

1. CAMADA DOMAIN (Lógica de Negócio)
┌─────────────────────────────────────────────────────────────┐
│                      Entidade Email                          │
│  - id: UUID                                                   │
│  - recipient: EmailAddress (Value Object)                    │
│  - subject: str                                              │
│  - body: str                                                 │
│  - sent_at: Optional[datetime]                              │
│  - status: EmailStatus (Enum)                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   EmailService (Domain)                      │
│  + create_order_confirmation(order: Order) -> Email         │
│  + validate_email_content(email: Email) -> bool             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              EmailRepository (Interface)                     │
│  + save(email: Email) -> Email                              │
│  + find_by_id(id: UUID) -> Optional[Email]                  │
│  + find_by_order_id(order_id: UUID) -> list[Email]         │
└─────────────────────────────────────────────────────────────┘

2. CAMADA APPLICATION (Casos de Uso)
┌─────────────────────────────────────────────────────────────┐
│           SendOrderConfirmationUseCase                       │
│  - email_service: EmailService                              │
│  - email_repository: EmailRepository                        │
│  - email_provider: EmailProvider                            │
│                                                              │
│  + execute(order_id: UUID) -> EmailDTO                      │
│    1. Recuperar pedido                                      │
│    2. Criar email via EmailService                          │
│    3. Salvar via EmailRepository                            │
│    4. Enviar via EmailProvider (async)                      │
└─────────────────────────────────────────────────────────────┘

3. CAMADA INFRASTRUCTURE (Implementações)
┌─────────────────────────────────────────────────────────────┐
│              EmailRepositoryImpl                             │
│  + Implementa EmailRepository                               │
│  + Usa SQLAlchemy                                           │
│  + Mapeia Email <-> EmailLog (modelo BD)                    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              SMTPEmailProvider                               │
│  + Implementa EmailProvider                                 │
│  + Usa smtplib / aiosmtplib                                │
│  + Trata retry e erros                                      │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│              send_email_task (Celery)                        │
│  + Task assíncrona                                          │
│  + Retry automático (3 vezes, backoff exponencial)         │
│  + Logging completo                                         │
└─────────────────────────────────────────────────────────────┘
"""
```

#### Fluxo de Dados

```python
"""
FLUXO DE DADOS:

1. CRIAÇÃO DE PEDIDO
   CreateOrderUseCase
   └── order = order_repository.save(order)
   └── send_order_confirmation_use_case.execute(order.id)  # Assíncrono

2. ENVIO DA CONFIRMAÇÃO
   SendOrderConfirmationUseCase.execute(order_id)
   ├── order = order_repository.find_by_id(order_id)
   ├── email = email_service.create_order_confirmation(order)
   ├── email = email_repository.save(email)  # Status: PENDING
   └── send_email_task.delay(email.id)  # Task Celery

3. TASK CELERY
   send_email_task(email_id)
   ├── email = email_repository.find_by_id(email_id)
   ├── try:
   │   ├── email_provider.send(email)
   │   ├── email.mark_as_sent()
   │   └── email_repository.save(email)  # Status: SENT
   └── except Exception as e:
       ├── email.mark_as_failed(e)
       ├── email_repository.save(email)  # Status: FAILED
       └── raise  # Retry Celery

4. TRATAMENTO DE ERROS
   - Retry automático Celery (3 tentativas)
   - Backoff exponencial (2^retry * 60 segundos)
   - Logging de cada tentativa
   - Alerta se falha definitiva
"""
```

#### Escolhas Técnicas

```python
"""
ESCOLHAS TÉCNICAS JUSTIFICADAS:

1. CELERY vs RQ vs ARQ
   Escolha: Celery
   Razões:
   - Já usado no projeto
   - Suporte avançado de retry
   - Monitoramento com Flower
   - Grande ecossistema

2. PROVEDOR DE EMAIL
   Escolha: aiosmtplib (SMTP async)
   Razões:
   - Compatível com asyncio
   - Performático para alto volume
   - Suporte TLS/SSL
   Alternativa: SendGrid/AWS SES para produção

3. ARMAZENAMENTO DE EMAILS
   Escolha: PostgreSQL (tabela email_logs)
   Razões:
   - Trilha de auditoria completa
   - Busca e relatórios
   - Consistência transacional
   - Não precisa de armazenamento S3 para templates simples

4. TEMPLATES
   Escolha: Jinja2
   Razões:
   - Padrão Python
   - Já usado para outros templates
   - Sintaxe simples
   - Suporte i18n

5. VALIDAÇÃO
   Escolha: Pydantic + email-validator
   Razões:
   - Validação estrita de email
   - Type safety
   - Integração FastAPI/Django
"""
```

### 5. Planejamento da Implementação

#### Quebra de Tarefas

```python
"""
PLANO DE IMPLEMENTAÇÃO (Ordem: de cima para baixo)

FASE 1: CAMADA DOMAIN
□ Tarefa 1.1: Criar enum EmailStatus
  └── src/myapp/domain/value_objects/email_status.py
  └── Testes: tests/unit/domain/value_objects/test_email_status.py

□ Tarefa 1.2: Criar value object EmailAddress
  └── src/myapp/domain/value_objects/email_address.py
  └── Validação com email-validator
  └── Testes: tests/unit/domain/value_objects/test_email_address.py

□ Tarefa 1.3: Criar entidade Email
  └── src/myapp/domain/entities/email.py
  └── Métodos: mark_as_sent(), mark_as_failed()
  └── Testes: tests/unit/domain/entities/test_email.py

□ Tarefa 1.4: Criar interface EmailRepository
  └── src/myapp/domain/repositories/email_repository.py
  └── Protocol com métodos abstratos

□ Tarefa 1.5: Criar interface EmailProvider
  └── src/myapp/domain/interfaces/email_provider.py
  └── Protocol para abstração

□ Tarefa 1.6: Criar EmailService
  └── src/myapp/domain/services/email_service.py
  └── Lógica de criação de email
  └── Testes: tests/unit/domain/services/test_email_service.py

FASE 2: CAMADA INFRASTRUCTURE
□ Tarefa 2.1: Criar migration do banco
  └── alembic revision --autogenerate -m "add_email_logs_table"
  └── Colunas: id, recipient, subject, body, status, sent_at, error, metadata

□ Tarefa 2.2: Criar modelo EmailLog
  └── src/myapp/infrastructure/database/models/email_log.py
  └── Modelo SQLAlchemy

□ Tarefa 2.3: Criar EmailRepositoryImpl
  └── src/myapp/infrastructure/database/repositories/email_repository_impl.py
  └── Implementa EmailRepository
  └── Testes: tests/integration/infrastructure/repositories/test_email_repository.py

□ Tarefa 2.4: Criar SMTPEmailProvider
  └── src/myapp/infrastructure/email/smtp_provider.py
  └── Configuração SMTP
  └── Testes: tests/integration/infrastructure/email/test_smtp_provider.py

□ Tarefa 2.5: Criar engine de templates
  └── src/myapp/infrastructure/email/template_engine.py
  └── Templates Jinja2
  └── Testes: tests/unit/infrastructure/email/test_template_engine.py

□ Tarefa 2.6: Criar task Celery
  └── src/myapp/infrastructure/tasks/email_tasks.py
  └── Configuração de retry
  └── Testes: tests/integration/infrastructure/tasks/test_email_tasks.py

FASE 3: CAMADA APPLICATION
□ Tarefa 3.1: Criar EmailDTO
  └── src/myapp/application/dtos/email_dto.py
  └── Modelo Pydantic

□ Tarefa 3.2: Criar SendOrderConfirmationUseCase
  └── src/myapp/application/use_cases/send_order_confirmation.py
  └── Testes: tests/unit/application/use_cases/test_send_order_confirmation.py

□ Tarefa 3.3: Integrar no CreateOrderUseCase
  └── Modificar src/myapp/application/use_cases/create_order.py
  └── Adicionar chamada assíncrona
  └── Testes: tests/unit/application/use_cases/test_create_order.py (atualizar)

FASE 4: CONFIGURAÇÃO & DI
□ Tarefa 4.1: Configurar injeção de dependência
  └── src/myapp/infrastructure/di/container.py
  └── Registrar EmailService, repositories, providers

□ Tarefa 4.2: Adicionar variáveis de ambiente
  └── .env.example
  └── Documentação no README

□ Tarefa 4.3: Criar templates de email
  └── src/myapp/infrastructure/email/templates/order_confirmation.html
  └── src/myapp/infrastructure/email/templates/order_confirmation.txt

FASE 5: TESTES & QUALIDADE
□ Tarefa 5.1: Testes end-to-end
  └── tests/e2e/test_order_confirmation_flow.py

□ Tarefa 5.2: Testes de performance
  └── tests/performance/test_email_throughput.py
  └── Verificar 10k emails/dia

□ Tarefa 5.3: Qualidade do código
  └── make lint
  └── make type-check
  └── make test-cov (>80%)

FASE 6: DOCUMENTAÇÃO
□ Tarefa 6.1: Documentação da API
  └── Docstrings completas
  └── Docs Sphinx

□ Tarefa 6.2: Atualização do README
  └── Seção de notificação por email
  └── Guia de configuração

□ Tarefa 6.3: ADR (Architecture Decision Record)
  └── docs/adr/0001-email-notification-system.md
"""
```

#### Estimativa

```python
"""
ESTIMATIVA (em horas):

FASE 1: CAMADA DOMAIN
- Tarefas 1.1 a 1.6: 8h
  └── 2h dev + 2h testes por componente (média)

FASE 2: CAMADA INFRASTRUCTURE
- Tarefas 2.1 a 2.6: 12h
  └── Banco + providers + celery

FASE 3: CAMADA APPLICATION
- Tarefas 3.1 a 3.3: 6h
  └── Casos de uso + integração

FASE 4: CONFIGURAÇÃO & DI
- Tarefas 4.1 a 4.3: 4h
  └── Configuração + templates

FASE 5: TESTES & QUALIDADE
- Tarefas 5.1 a 5.3: 6h
  └── E2E + performance + qualidade

FASE 6: DOCUMENTAÇÃO
- Tarefas 6.1 a 6.3: 3h
  └── Documentação completa

TOTAL: 39h (≈ 5 dias)
BUFFER 20%: +8h
TOTAL COM BUFFER: 47h (≈ 6 dias)
"""
```

### 6. Identificação de Riscos

#### Matriz de Riscos

```python
"""
RISCOS IDENTIFICADOS:

RISCO 1: Sobrecarga do servidor SMTP
├── Probabilidade: MÉDIA
├── Impacto: ALTO
├── Descrição: 10k emails/dia pode saturar SMTP básico
└── Mitigação:
    ├── Rate limiting no Celery (max 100 emails/minuto)
    ├── Fila dedicada para emails
    ├── Monitoramento da fila
    └── Provider de backup (SendGrid/SES)

RISCO 2: Emails marcados como spam
├── Probabilidade: MÉDIA
├── Impacto: ALTO
├── Descrição: Emails transacionais podem ser bloqueados
└── Mitigação:
    ├── SPF/DKIM/DMARC configurados
    ├── Warmup de IP dedicado
    ├── Templates conformes com anti-spam
    └── Monitoramento da taxa de entrega

RISCO 3: Perda de email em caso de crash
├── Probabilidade: BAIXA
├── Impacto: MÉDIO
├── Descrição: Crash antes da persistência no BD
└── Mitigação:
    ├── Transação atômica (salvar + enfileirar)
    ├── Dead letter queue do Celery
    ├── Monitoramento de tasks falhadas
    └── Sistema de re-enfileiramento manual

RISCO 4: Injeção de template
├── Probabilidade: BAIXA
├── Impacto: ALTO
├── Descrição: Injeção de código nos templates
└── Mitigação:
    ├── Sanitização de inputs
    ├── Templates pré-compilados
    ├── Validação rigorosa de dados
    └── Scan de segurança (bandit)

RISCO 5: Degradação de performance da API
├── Probabilidade: BAIXA
├── Impacto: MÉDIO
├── Descrição: Enfileiramento lento atrasa criação de pedido
└── Mitigação:
    ├── Enfileiramento estritamente assíncrono
    ├── Timeout curto no enfileiramento
    ├── Fallback gracioso se fila down
    └── Monitoramento tempo de resposta da API

RISCO 6: Dados sensíveis em emails
├── Probabilidade: MÉDIA
├── Impacto: ALTO
├── Descrição: Vazamento de dados via emails não criptografados
└── Mitigação:
    ├── TLS obrigatório
    ├── Sem dados sensíveis em texto plano (ex: cartões)
    ├── Links seguros com tokens de curta duração
    └── Auditoria de segurança dos templates
"""
```

### 7. Definição de Testes

#### Estratégia de Testes

```python
"""
ESTRATÉGIA DE TESTES:

1. TESTES UNITÁRIOS (Isolamento completo)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Camada Domain:
├── test_email_entity.py
│   ├── test_create_email_with_valid_data()
│   ├── test_mark_as_sent_updates_status_and_timestamp()
│   ├── test_mark_as_failed_stores_error_message()
│   └── test_cannot_send_already_sent_email()
│
├── test_email_address.py
│   ├── test_valid_email_address()
│   ├── test_invalid_email_raises_exception()
│   ├── test_email_normalization()
│   └── test_equality_comparison()
│
└── test_email_service.py
    ├── test_create_order_confirmation_with_valid_order()
    ├── test_create_order_confirmation_uses_correct_template()
    ├── test_validate_email_content_with_valid_email()
    └── test_validate_email_content_rejects_spam_patterns()

Camada Application:
└── test_send_order_confirmation_use_case.py
    ├── test_execute_creates_and_saves_email()
    ├── test_execute_enqueues_email_task()
    ├── test_execute_raises_if_order_not_found()
    └── test_execute_rolls_back_on_enqueue_failure()

2. TESTES DE INTEGRAÇÃO (Componentes reais)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Camada Infrastructure:
├── test_email_repository.py
│   ├── test_save_email_to_database()
│   ├── test_find_by_id_returns_email()
│   ├── test_find_by_order_id_returns_all_emails()
│   └── test_update_email_status()
│
├── test_smtp_provider.py
│   ├── test_send_email_via_smtp() (com MailHog/FakeSMTP)
│   ├── test_send_email_with_attachment()
│   ├── test_connection_retry_on_failure()
│   └── test_tls_encryption_enabled()
│
└── test_email_tasks.py
    ├── test_send_email_task_successful()
    ├── test_send_email_task_retry_on_failure()
    ├── test_send_email_task_max_retries_reached()
    └── test_send_email_task_updates_database()

3. TESTES END-TO-END (Fluxo completo)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

└── test_order_confirmation_flow.py
    ├── test_complete_order_confirmation_flow()
    │   1. Criar pedido via API
    │   2. Verificar email criado no BD
    │   3. Aguardar execução da task Celery
    │   4. Verificar email enviado (MailHog)
    │   5. Verificar status = SENT no BD
    │
    ├── test_order_confirmation_with_smtp_failure()
    │   1. Criar pedido
    │   2. Simular falha SMTP
    │   3. Verificar retry Celery
    │   4. Verificar status = FAILED após max retries
    │
    └── test_order_confirmation_performance()
        └── Criar 100 pedidos concorrentes
        └── Verificar todos os emails enviados < 5min

4. TESTES DE PERFORMANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

└── test_email_throughput.py
    ├── test_10k_emails_per_day_throughput()
    ├── test_api_response_time_under_200ms()
    ├── test_queue_processing_rate()
    └── test_database_load_under_stress()

5. TESTES DE SEGURANÇA
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

└── test_email_security.py
    ├── test_template_injection_prevention()
    ├── test_email_content_sanitization()
    ├── test_tls_connection_enforced()
    └── test_no_sensitive_data_in_logs()

COBERTURA ALVO:
- Geral: > 80%
- Camada Domain: > 95%
- Camada Application: > 90%
- Camada Infrastructure: > 75%
"""
```

## Checklist de Análise Completa

Antes de começar qualquer implementação, verificar:

### Compreensão
- [ ] Objetivo claramente definido e documentado
- [ ] Critérios de aceitação listados
- [ ] Restrições técnicas identificadas
- [ ] Contexto de negócio compreendido

### Exploração
- [ ] Código similar identificado e analisado
- [ ] Arquitetura atual documentada
- [ ] Padrões do projeto identificados
- [ ] Dependências existentes listadas

### Impacto
- [ ] Matriz de impactos criada
- [ ] Módulos afetados listados
- [ ] Efeitos colaterais identificados
- [ ] Migrations necessárias planejadas

### Design
- [ ] Arquitetura da solução definida
- [ ] Fluxo de dados documentado
- [ ] Escolhas técnicas justificadas
- [ ] Alternativas avaliadas

### Planejamento
- [ ] Tarefas quebradas em etapas atômicas
- [ ] Ordem de implementação definida
- [ ] Estimativa completa com buffer
- [ ] Dependências entre tarefas identificadas

### Riscos
- [ ] Riscos identificados e avaliados
- [ ] Planos de mitigação definidos
- [ ] Monitoramento planejado
- [ ] Fallbacks planejados

### Testes
- [ ] Estratégia de testes definida
- [ ] Testes unitários planejados
- [ ] Testes de integração planejados
- [ ] Testes E2E planejados
- [ ] Cobertura alvo definida

## Templates de Documentação

### Template: Análise de Funcionalidade

```markdown
# Análise: [Nome da Funcionalidade]

## 1. Necessidade
### Objetivo
[Descrição clara do objetivo]

### Contexto de Negócio
[Contexto de negócio e usuários]

### Restrições
- Performance: [restrições]
- Segurança: [restrições]
- Escalabilidade: [restrições]

### Critérios de Aceitação
1. [Critério 1]
2. [Critério 2]

## 2. Código Existente
### Padrões Identificados
[Lista de padrões similares]

### Arquitetura Atual
[Descrição da arquitetura]

### Padrões do Projeto
[Convenções e padrões]

## 3. Impacto
[Matriz de impactos]

## 4. Solução
### Arquitetura
[Diagramas e descrição]

### Fluxo de Dados
[Descrição do fluxo]

### Escolhas Técnicas
[Justificativa das escolhas]

## 5. Implementação
### Plano
[Lista ordenada de tarefas]

### Estimativa
[Estimativa com buffer]

## 6. Riscos
[Lista de riscos e mitigações]

## 7. Testes
[Estratégia de testes detalhada]
```

### Template: Análise de Bug

```markdown
# Análise de Bug: [Título do Bug]

## 1. Sintomas
### Descrição
[O que não está funcionando]

### Reprodução
1. [Passo 1]
2. [Passo 2]

### Comportamento Esperado vs Atual
- Esperado: [comportamento]
- Atual: [comportamento]

## 2. Investigação
### Logs & Stack Trace
\`\`\`
[Stack trace]
\`\`\`

### Código Afetado
[Arquivos e linhas]

### Hipóteses
1. [Hipótese 1]
2. [Hipótese 2]

## 3. Causa Raiz
[Explicação da causa]

## 4. Solução
### Correção Proposta
[Descrição da correção]

### Impacto
[Módulos afetados]

### Riscos
[Riscos da correção]

## 5. Testes
### Testes de Não-Regressão
[Lista de testes]

### Validação
[Como validar a correção]
```

## Conclusão

A análise preliminar não é perda de tempo, é um **investimento**.

**Benefícios:**
- Reduz erros de design
- Evita refatorações custosas
- Melhora a qualidade do código
- Facilita a revisão
- Acelera a implementação
- Reduz débito técnico

**Regra de Ouro:**
> Gastar 20% do tempo em análise economiza 50% do tempo total.

**Exemplo:**
- Funcionalidade estimada: 40h
- Com análise (8h): 32h implementação = **40h total**
- Sem análise: 60h implementação (bugs, refatoração, mal-entendidos) = **60h total**
- **Ganho: 20h (33%)**
