# Guia de Desenvolvimento de Funcionalidades

Este guia cobre o fluxo de trabalho completo para desenvolver novas funcionalidades usando o Claude-Craft, desde a análise inicial até a revisão final.

---

## Sumário

1. [Visão Geral do Fluxo TDD](#visão-geral-do-fluxo-tdd)
2. [Fase 1: Análise](#fase-1-análise)
3. [Fase 2: Design](#fase-2-design)
4. [Fase 3: Escrita de Testes](#fase-3-escrita-de-testes)
5. [Fase 4: Implementação](#fase-4-implementação)
6. [Fase 5: Refatoração](#fase-5-refatoração)
7. [Fase 6: Revisão](#fase-6-revisão)
8. [Exemplo Completo](#exemplo-completo)
9. [Recursos Disponíveis](#recursos-disponíveis)

---

## Visão Geral do Fluxo TDD

O Claude-Craft impõe um fluxo de Desenvolvimento Orientado a Testes (TDD):

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  1. Analisar│ --> │  2. Design  │ --> │  3. Testes  │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  6. Revisão │ <-- │5. Refatorar │ <-- │4. Implementar│
└─────────────┘     └─────────────┘     └─────────────┘
```

### Por Que TDD?

- **Confiança**: Os testes provam que o seu código funciona
- **Documentação**: Os testes descrevem o comportamento esperado
- **Design**: Escrever os testes primeiro leva a APIs melhores
- **Regressão**: Os testes detectam bugs futuros

---

## Fase 1: Análise

Antes de escrever qualquer código, entenda o que precisa ser construído.

### Definir o Nível de Esforço

Para fases de análise que exigem raciocínio profundo, defina alto esforço:

```bash
/effort high
```

Use `/effort low` para buscas simples e `/effort medium` para trabalho de implementação padrão.

### Usando o Comando de Análise

```bash
/common:analyze-feature "Autenticação de usuário com tokens JWT e controle de acesso baseado em papéis"
```

Este comando irá:
1. Decompor a funcionalidade em componentes
2. Identificar requisitos técnicos
3. Listar possíveis casos extremos
4. Sugerir a abordagem de implementação

### Usando o Agente de Pesquisa

```markdown
@research-assistant Pesquise as melhores práticas para autenticação JWT no Symfony 7
```

O agente de pesquisa irá:
- Buscar documentação e melhores práticas
- Resumir as descobertas
- Fornecer exemplos de código
- Destacar considerações de segurança

### Lista de Verificação da Análise

- [ ] História de usuário claramente definida
- [ ] Critérios de aceitação documentados
- [ ] Casos extremos identificados
- [ ] Abordagem técnica escolhida
- [ ] Dependências identificadas
- [ ] Implicações de segurança revisadas

---

## Fase 2: Design

Projete a arquitetura antes da implementação.

### Design do Banco de Dados

```markdown
@database-architect Projete o esquema para a entidade User com papéis e permissões

Requisitos:
- O usuário pode ter múltiplos papéis
- Os papéis possuem permissões
- Suporte a exclusão lógica (soft delete)
- Trilha de auditoria para alterações
```

O arquiteto de banco de dados irá:
- Projetar um esquema normalizado
- Sugerir índices
- Considerar relacionamentos
- Planejar as migrações

### Design da API

```markdown
@api-designer Projete a API REST para o gerenciamento de usuários

Endpoints necessários:
- Operações CRUD para usuários
- Atribuição de papéis
- Autenticação (login/logout)
- Fluxo de redefinição de senha
```

O designer de API irá:
- Definir os endpoints e métodos
- Especificar os formatos de requisição/resposta
- Documentar os requisitos de autenticação
- Planejar as respostas de erro

### Decisão de Arquitetura

```bash
/common:architecture-decision "Como implementar controle de acesso baseado em papéis"
```

Use este comando para escolhas arquiteturais importantes. Ele cria um Registro de Decisão de Arquitetura (ADR) documentando:
- Contexto e problema
- Opções consideradas
- Solução escolhida
- Consequências

### Lista de Verificação do Design

- [ ] Esquema de banco de dados projetado
- [ ] Endpoints da API definidos
- [ ] Decisões de arquitetura documentadas
- [ ] Modelo de segurança definido
- [ ] Estratégia de tratamento de erros planejada

---

## Fase 3: Escrita de Testes

Escreva os testes ANTES da implementação. Este é o "TD" do TDD.

### Usando o Coach de TDD

```markdown
@tdd-coach Ajude-me a escrever testes para o método de autenticação do UserService

O método deve:
- Aceitar e-mail e senha
- Retornar token JWT em caso de sucesso
- Lançar exceção para credenciais inválidas
- Bloquear a conta após 5 tentativas falhas
```

O coach de TDD irá:
- Sugerir casos de teste
- Escrever exemplos de código de teste
- Explicar as asserções
- Identificar casos extremos

### Categorias de Testes

#### Testes Unitários

Teste componentes individuais em isolamento:

```php
// tests/Unit/Domain/User/UserTest.php
public function test_user_can_change_password(): void
{
    $user = User::create(
        email: 'test@example.com',
        password: 'old-password'
    );

    $user->changePassword('new-password');

    $this->assertTrue($user->verifyPassword('new-password'));
    $this->assertFalse($user->verifyPassword('old-password'));
}
```

#### Testes de Integração

Teste as interações entre componentes:

```php
// tests/Integration/UserServiceTest.php
public function test_user_service_creates_user_in_database(): void
{
    $service = $this->container->get(UserService::class);

    $user = $service->createUser(
        email: 'test@example.com',
        password: 'secure-password'
    );

    $this->assertNotNull($user->getId());
    $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
}
```

#### Testes BDD/Funcionais

Teste cenários de negócio:

```gherkin
# features/authentication.feature
Feature: Autenticação de Usuário
  Como um usuário
  Quero fazer login com minhas credenciais
  Para que eu possa acessar recursos protegidos

  Scenario: Login bem-sucedido
    Given Tenho um usuário registrado com o e-mail "user@example.com"
    When Envio credenciais válidas
    Then Devo receber um token JWT
    And O token deve ser válido por 1 hora
```

### Comandos de Teste por Tecnologia

```bash
# Symfony
/symfony:check-testing

# Flutter
/flutter:check-testing

# Python
/python:check-testing

# React
/react:check-testing
```

### Lista de Verificação de Escrita de Testes

- [ ] Testes unitários para a lógica de domínio
- [ ] Testes de integração para os serviços
- [ ] Testes de API para os endpoints
- [ ] Casos extremos cobertos
- [ ] Cenários de erro testados
- [ ] Todos os testes falhando (ainda não implementados)

---

## Fase 4: Implementação

Agora implemente o código para fazer os testes passarem.

### Comandos de Geração de Código

#### Symfony

```bash
# Gerar CRUD com testes
/symfony:generate-crud User

# Gerar endpoint de API
/symfony:api-endpoint POST /api/users CreateUserRequest

# Gerar comando
/symfony:generate-command SendWelcomeEmailCommand
```

#### Flutter

```bash
# Gerar BLoC
/flutter:generate-bloc Authentication

# Gerar tela
/flutter:generate-screen LoginScreen

# Gerar widget
/flutter:generate-widget UserAvatar
```

#### Python

```bash
# Gerar endpoint FastAPI
/python:generate-endpoint POST /users CreateUser

# Gerar serviço
/python:generate-service UserService

# Gerar modelo
/python:generate-model User
```

#### React

```bash
# Gerar componente
/react:generate-component UserProfile

# Gerar hook
/react:generate-hook useAuth

# Gerar contexto
/react:generate-context AuthContext
```

### Usando Templates

Os templates fornecem padrões de código prontos para uso. Acesse-os com:

```markdown
Mostre-me o template de serviço para Symfony
```

Templates disponíveis por tecnologia:

| Symfony | Flutter | Python | React |
|---------|---------|--------|-------|
| service.md | bloc.md | service.md | component.md |
| value-object.md | widget.md | repository.md | hook.md |
| aggregate-root.md | screen.md | endpoint.md | context.md |
| domain-event.md | state.md | model.md | reducer.md |
| repository.md | cubit.md | schema.md | - |

### Boas Práticas de Implementação

1. **Um teste de cada vez**: Faça um teste passar antes de avançar para o próximo
2. **Código mínimo**: Escreva apenas o suficiente para passar no teste
3. **Sem otimização prematura**: Foque na corretude primeiro
4. **Siga os padrões existentes**: Use templates e convenções

### Lista de Verificação da Implementação

- [ ] Todos os testes unitários passando
- [ ] Todos os testes de integração passando
- [ ] Todos os testes de API passando
- [ ] Sem valores hardcoded
- [ ] Tratamento de erros implementado
- [ ] Logging adicionado

---

## Fase 5: Refatoração

Com os testes passando, melhore a qualidade do código.

### Comandos de Refatoração

```bash
# Verificar qualidade do código
/symfony:check-code-quality
/flutter:check-code-quality
/python:check-code-quality
/react:check-code-quality

# Verificar conformidade de arquitetura
/symfony:check-architecture
/flutter:check-architecture
```

### Usando o Especialista em Refatoração

```markdown
@refactoring-specialist Revise esta classe de serviço em busca de possíveis melhorias

[cole o código aqui]
```

O especialista em refatoração irá:
- Identificar code smells
- Sugerir melhorias
- Mostrar exemplos refatorados
- Explicar os trade-offs

### Padrões Comuns de Refatoração

1. **Extrair Método**: Dividir métodos longos em métodos menores
2. **Extrair Classe**: Dividir classes grandes
3. **Introduzir Value Object**: Substituir primitivos por tipos de domínio
4. **Substituir Condicional por Polimorfismo**: Usar o padrão strategy
5. **Mover Método**: Colocar os métodos onde eles pertencem

### Lista de Verificação da Refatoração

- [ ] Sem duplicação de código
- [ ] Métodos com menos de 20 linhas
- [ ] Classes com menos de 200 linhas
- [ ] Nomenclatura clara
- [ ] Estilo consistente
- [ ] Todos os testes ainda passando

---

## Fase 6: Revisão

Verificação de qualidade final antes da conclusão.

### Auditoria de Conformidade

```bash
# Verificação de conformidade completa (retorna pontuação /100)
/symfony:check-compliance
/flutter:check-compliance
/python:check-compliance
/react:check-compliance
```

Esta auditoria abrangente verifica:
- Conformidade de arquitetura
- Qualidade do código
- Cobertura de testes
- Problemas de segurança
- Documentação

### Revisão de Código com Agentes

```markdown
@symfony-reviewer Revise minha implementação completa de autenticação de usuário

Arquivos alterados:
- src/Domain/User/User.php
- src/Application/Service/AuthenticationService.php
- src/Infrastructure/Security/JwtTokenGenerator.php
- tests/Unit/Domain/User/UserTest.php
- tests/Integration/AuthenticationServiceTest.php
```

O revisor irá:
- Verificar a conformidade de arquitetura
- Identificar possíveis problemas
- Sugerir melhorias
- Verificar as melhores práticas

### Auditoria de Segurança

```bash
/common:security-audit
```

Ou use o agente focado em segurança:

```markdown
@devops-engineer Revise a segurança do sistema de autenticação

Preocupações:
- Segurança do token JWT
- Armazenamento de senhas
- Rate limiting
- Configuração de CORS
```

### Lista de Verificação da Funcionalidade

Use a lista de verificação integrada:

```bash
cat .claude/checklists/feature-checklist.md
```

Itens-chave:
- [ ] Requisitos da história de usuário atendidos
- [ ] Todos os critérios de aceitação verificados
- [ ] Testes escritos e passando (cobertura de 80%+)
- [ ] Código revisado
- [ ] Auditoria de segurança aprovada
- [ ] Documentação atualizada
- [ ] Sem problemas críticos na análise estática
- [ ] Desempenho aceitável
- [ ] Pronto para revisão de código

---

## Exemplo Completo

Vamos percorrer uma funcionalidade completa: Adicionar o registro de usuário.

### Passo 1: Analisar

```markdown
/common:analyze-feature "Registro de usuário com verificação de e-mail"

Esperado:
- O usuário envia e-mail e senha
- O sistema envia um e-mail de verificação
- O usuário clica no link para verificar
- A conta se torna ativa
```

### Passo 2: Projetar o Banco de Dados

```markdown
@database-architect Projete o esquema para User com verificação de e-mail

Campos necessários:
- id, email, password_hash
- email_verified_at (timestamp nullable)
- verification_token
- created_at, updated_at
```

### Passo 3: Projetar a API

```markdown
@api-designer Projete os endpoints de API para o registro

POST /api/register - Criar conta
POST /api/verify-email - Verificar e-mail com token
POST /api/resend-verification - Reenviar e-mail de verificação
```

### Passo 4: Escrever os Testes

```markdown
@tdd-coach Ajude-me a escrever testes para o UserRegistrationService

Casos de teste:
1. Registro bem-sucedido cria o usuário
2. E-mail duplicado retorna erro
3. Senha fraca retorna erro
4. E-mail de verificação é enviado
5. Token de verificação ativa a conta
6. Token expirado retorna erro
```

### Passo 5: Gerar Código

```bash
/symfony:generate-crud User --with-api
/symfony:generate-command SendVerificationEmailCommand
```

### Passo 6: Implementar

Faça os testes passarem um por um:

```php
// Fazer o teste 1 passar
public function register(string $email, string $password): User
{
    $user = User::create($email, $password);
    $this->repository->save($user);
    return $user;
}

// Fazer o teste 2 passar
public function register(string $email, string $password): User
{
    if ($this->repository->findByEmail($email)) {
        throw new DuplicateEmailException($email);
    }
    // ...
}

// Continuar para cada teste...
```

### Passo 7: Refatorar

```bash
/symfony:check-code-quality
```

Corrija todos os problemas identificados.

### Passo 8: Revisar

```markdown
@symfony-reviewer Revise minha implementação de registro de usuário

Implementação completa incluindo:
- Domain: Entidade User, ValueObjects
- Application: RegistrationService
- Infrastructure: DoctrineUserRepository
- API: RegisterController
- Tests: Unitários, Integração, API
```

### Passo 9: Verificação Final

```bash
/symfony:check-compliance
```

Meta: Pontuação 90+/100

---

## Recursos Disponíveis

### Resumo dos Agentes

| Agente | Para Usar |
|--------|-----------|
| `@api-designer` | Design de endpoints de API |
| `@database-architect` | Design de esquema de banco de dados |
| `@tdd-coach` | Orientação para escrita de testes |
| `@refactoring-specialist` | Melhoria de código |
| `@{tech}-reviewer` | Revisão de código |
| `@devops-engineer` | Revisão de infraestrutura |
| `@research-assistant` | Pesquisa de melhores práticas |

### Resumo dos Comandos

| Fase | Comandos |
|------|----------|
| Análise | `/common:analyze-feature` |
| Design | `/common:architecture-decision` |
| Testes | `/{tech}:check-testing` |
| Geração | `/{tech}:generate-*` |
| Qualidade | `/{tech}:check-code-quality` |
| Revisão | `/{tech}:check-compliance` |
| Segurança | `/common:security-audit` |

### Localização dos Templates

```bash
ls .claude/templates/
```

### Localização das Listas de Verificação

```bash
ls .claude/checklists/
```

---

## Dicas para o Sucesso

1. **Não pule os testes**: Eles são a sua rede de segurança
2. **Use os agentes**: Eles fornecem orientação especializada
3. **Execute as verificações de conformidade com frequência**: Identifique problemas cedo
4. **Siga o fluxo de trabalho**: Cada fase tem um propósito
5. **Documente as decisões**: Use ADRs para escolhas importantes
6. **Gerencie o contexto**: Use `/context` para verificar sugestões de otimização, `/clear` entre fases
7. **Ajuste o esforço**: Use `/effort high` para análise/design, `/effort low` para geração de código

---

[&larr; Criação de Projeto](02-project-creation.md) | [Correção de Bugs &rarr;](04-bug-fixing.md)
