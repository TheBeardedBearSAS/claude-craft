# Guia de Desenvolvimento de Features

Fluxo de trabalho completo para desenvolver novas features com Claude-Craft.

---

## Fluxo de Trabalho TDD

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 1. Analisar │ --> │ 2. Projetar │ --> │  3. Testes  │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  6. Revisar │ <-- │5. Refatorar │ <-- │4. Implementar│
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## Fase 1: Análise

```bash
/common:analyze-feature "Autenticação de usuários com tokens JWT"
```

```markdown
@research-assistant Pesquise as melhores práticas para autenticação JWT no Symfony 7
```

---

## Fase 2: Projeto

### Banco de Dados
```markdown
@database-architect Projete o esquema para a entidade User com funções e permissões
```

### API
```markdown
@api-designer Projete a API REST para gestão de usuários
```

### Decisão Arquitetural
```bash
/common:architecture-decision "Como implementar controle de acesso baseado em funções"
```

---

## Fase 3: Escrever Testes

```markdown
@tdd-coach Ajude-me a escrever testes para o método de autenticação de UserService
```

### Tipos de Testes

**Testes Unitários:**
```php
public function test_user_can_change_password(): void
{
    $user = User::create('test@example.com', 'old-password');
    $user->changePassword('new-password');
    $this->assertTrue($user->verifyPassword('new-password'));
}
```

**Testes de Integração:**
```php
public function test_user_service_creates_user_in_database(): void
{
    $service = $this->container->get(UserService::class);
    $user = $service->createUser('test@example.com', 'password');
    $this->assertNotNull($user->getId());
}
```

---

## Fase 4: Implementação

### Comandos de Geração

```bash
# Symfony
/symfony:generate-crud User
/symfony:api-endpoint POST /api/users CreateUserRequest

# Flutter
/flutter:generate-feature Authentication
/flutter:generate-widget LoginScreen

# Python
/python:generate-endpoint POST /users CreateUser
/python:generate-model User

# React
/react:generate-component UserProfile
/react:generate-hook useAuth

# Angular
/angular:generate-component UserProfile

# Vue.js
/vuejs:generate-component UserProfile

# C# / .NET
/csharp:generate-feature User

# Laravel
/laravel:generate-controller UserController

# React Native
/reactnative:generate-screen LoginScreen
```

---

## Fase 5: Refatoração

```bash
/symfony:check-code-quality
/symfony:check-architecture
```

```markdown
@refactoring-specialist Revise esta classe de serviço para melhorias potenciais
```

---

## Fase 6: Revisão

```bash
# Auditoria completa (pontuação /100)
/symfony:check-compliance
```

```markdown
@symfony-reviewer Revise minha implementação completa de autenticação de User
```

```bash
/common:security-audit
```

---

## Checklist de Feature

- [ ] User story definida
- [ ] Testes escritos (TDD)
- [ ] Código implementado
- [ ] Testes passam (80%+ cobertura)
- [ ] Revisão efetuada
- [ ] Documentação atualizada

---

## Resumo de Agentes

| Agente | Uso |
|--------|-----|
| `@api-designer` | Design de endpoints API |
| `@database-architect` | Design de esquemas BD |
| `@tdd-coach` | Guia para escrita de testes |
| `@refactoring-specialist` | Melhoria de código |
| `@{tech}-reviewer` | Revisão de código |

---

[&larr; Criação de Projeto](02-project-creation.md) | [Correção de Bugs &rarr;](04-bug-fixing.md)
