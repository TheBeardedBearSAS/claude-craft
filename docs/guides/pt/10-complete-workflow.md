# Guia de Fluxo de Trabalho Completo: Da Ideia à Produção

Um guia completo passo a passo para construir uma aplicação inteira usando o Claude Craft, da ideia inicial ao deploy em produção.

---

## Visão Geral

Este guia acompanha você ao longo de todo o ciclo de desenvolvimento:

1. **Ideação** - Definir a visão do seu produto
2. **Requisitos** - Documentar o que você está construindo
3. **Arquitetura** - Projetar a solução técnica
4. **Planejamento** - Criar sprints acionáveis
5. **Desenvolvimento** - Implementar com TDD
6. **Qualidade** - Validar e testar
7. **Deploy** - Entregar em produção

**Pré-requisitos:**
- Claude Craft v8.10.0 instalado no seu projeto
- Claude Code v2.1.159 (recomendado) ou v2.1.97+ (mínimo, CVE-2025-59536 corrigido)
- Conhecimento básico da stack de tecnologia escolhida

---

## Fase 1: Ideação (5-10 minutos)

### Configurar sua Sessão

Antes de começar, configure a sua sessão para desempenho otimizado:

```bash
# Ajustar o nível de raciocínio para planejamento (alto para tarefas complexas)
/effort high

# Opcionalmente, configurar a otimização de tokens
/common:setup-rtk
```

### Iniciar com BMAD

```bash
# Inicializar BMAD no seu projeto
/bmad:init

# Ou iniciar um workflow
/workflow:init
```

### Definir a Visão

Trabalhe com o agente de Product Manager:

```
@pm Quero construir uma plataforma e-commerce para vender produtos artesanais.
Funcionalidades principais:
- Catálogo de produtos com categorias
- Carrinho de compras e checkout
- Autenticação de usuários
- Gestão de pedidos
```

O PM irá ajudá-lo a:
- Clarificar o problema que você está resolvendo
- Identificar os usuários-alvo
- Definir métricas de sucesso

### Criar o Documento de Visão Inicial

```
@pm Crie um documento de visão para este projeto
```

Saída: `docs/vision.md`

---

## Fase 2: Requisitos (15-30 minutos)

### Analisar os Requisitos

Trabalhe com o Analista de Negócios:

```
@ba Analise os requisitos da plataforma e-commerce com base na visão
```

O BA irá:
- Decompor as funcionalidades em histórias de usuário
- Identificar dependências
- Criar um mapa de histórias de usuário

### Criar o PRD

```
@pm Crie um Product Requirements Document
```

### Validar o PRD

```
/gate:validate-prd docs/prd.md
```

Certifique-se de passar no PRD Gate (≥80%):
- [ ] Declaração do problema definida
- [ ] Usuários-alvo identificados
- [ ] Objetivos claros
- [ ] Métricas de sucesso definidas
- [ ] Limites de escopo estabelecidos

---

## Fase 3: Arquitetura (20-45 minutos)

### Projetar a Arquitetura

Trabalhe com o Arquiteto:

```
@architect Projete a arquitetura do sistema para a plataforma e-commerce
Considere:
- Backend Symfony com API Platform
- Banco de dados PostgreSQL
- Cache Redis
- Deploy com Docker
```

O Arquiteto criará:
- Diagrama de arquitetura do sistema
- Design dos componentes
- Modelo de dados
- Contratos de API

### Criar a Especificação Técnica

```
@architect Crie a especificação técnica a partir do PRD
```

Saída: `docs/tech-spec.md`

### Documentar as Decisões

Para escolhas importantes:

```
@architect Crie um ADR para a escolha de JWT em vez de autenticação baseada em sessão
```

Saída: `docs/adr/001-jwt-authentication.md`

### Validar a Especificação Técnica

```
/gate:validate-techspec docs/tech-spec.md
```

Certifique-se de passar no Tech Spec Gate (≥90%):
- [ ] Arquitetura documentada
- [ ] Contratos de API definidos
- [ ] Segurança abordada
- [ ] Requisitos de desempenho estabelecidos
- [ ] Estratégia de testes definida
- [ ] Plano de deploy criado

---

## Fase 4: Planejamento (15-30 minutos)

### Criar o Backlog

Trabalhe com o Product Owner:

```
@po Crie histórias de usuário a partir da especificação técnica
Priorize usando o método MoSCoW
```

O PO criará histórias como:
```
EPIC-001: Autenticação de Usuário
├── US-001: Registro de usuário
├── US-002: Login de usuário
├── US-003: Redefinição de senha
└── US-004: Login social

EPIC-002: Catálogo de Produtos
├── US-005: Navegar pelos produtos
├── US-006: Busca de produtos
├── US-007: Filtragem por categoria
└── US-008: Detalhes do produto
```

### Validar o Backlog

```
/gate:validate-backlog
```

Cada história deve passar no critério INVEST:
- **I**ndependente
- **N**egociável
- **V**aliosa
- **E**stimável
- **S**mall (pequena)
- **T**estável

### Planejar o Primeiro Sprint

Trabalhe com o Scrum Master:

```
@sm Planeje o sprint 1 com as histórias de maior prioridade
Inclua:
- US-001: Registro de usuário
- US-002: Login de usuário
- US-005: Navegar pelos produtos
```

### Validar o Sprint

```
/gate:validate-sprint
```

---

## Fase 5: Desenvolvimento (Variável)

### Iniciar o Desenvolvimento do Sprint

```
/sprint:dev 1
```

Ou trabalhe história por história:

### 5.1 Obter a Próxima História

```
/sprint:next-story --claim
```

Exemplo: US-001 (Registro de Usuário)

### 5.2 Transicionar para Em Andamento

```
/sprint:transition US-001 in-progress
```

### 5.3 Fase Vermelha do TDD (Escrever Teste que Falha)

Trabalhe com o agente Desenvolvedor:

```
@dev Inicie o TDD para US-001 (Registro de Usuário)
Comece com a fase 🔴 Vermelho - escreva testes que falham
```

Crie os testes primeiro:
```php
// tests/Feature/UserRegistrationTest.php
class UserRegistrationTest extends TestCase
{
    public function test_user_can_register_with_valid_data(): void
    {
        $response = $this->post('/api/register', [
            'email' => 'test@example.com',
            'password' => 'SecurePass123!',
            'name' => 'Test User'
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }
}
```

### 5.4 Fase Verde do TDD (Implementar)

```
@dev Agora implemente a fase 🟢 Verde - faça os testes passarem
```

Gere o código:
```
/symfony:generate-crud User
```

### 5.5 Fase de Refatoração do TDD

```
@dev 🔵 Refatorar - limpe a implementação
```

### 5.6 Revisão de Código

```
@symfony-reviewer Revise a implementação do registro de usuário
```

### 5.7 Validar a DoD da História

```
/gate:validate-story US-001
```

### 5.8 Transicionar para Revisão

```
/sprint:transition US-001 review
```

### 5.9 Validação pelo QA

```
@qa Valide os critérios de aceitação para US-001
```

### 5.10 Concluir a História

```
/sprint:transition US-001 done
```

### 5.11 Repetir

Continue com a próxima história até o sprint estar completo.

---

## Fase 6: Qualidade (Contínua)

### Gerenciamento de Contexto

Durante o desenvolvimento, gerencie a janela de contexto de forma eficiente:

```bash
# Verificar sugestões de otimização do contexto
/context

# Mudar para menor esforço em tarefas simples
/effort low

# Limpar o contexto entre tarefas não relacionadas
/clear

# Salvar aprendizados importantes que persistem entre sessões
/memory "Decisão arquitetural-chave: usando CQRS para o módulo de pedidos"
```

### Verificações de Qualidade Contínuas

Execute regularmente durante o desenvolvimento:

```bash
# Configurar monitoramento de qualidade recorrente
/loop 5m /common:pre-commit-check

# Verificação de arquitetura
/symfony:check-architecture

# Qualidade do código
/symfony:check-code-quality

# Auditoria de segurança
/symfony:check-security

# Cobertura de testes
/symfony:check-testing
```

### Auditoria Completa Antes do Lançamento

```
/team:audit --sequential
```

### Validação Pré-Commit

Sempre antes de fazer commit:

```
/common:pre-commit-check
```

### Revisão do Sprint

Ao final do sprint:

```
@sm Execute a revisão do sprint 1
```

### Retrospectiva

```
@sm Execute a retrospectiva do sprint
```

---

## Fase 7: Deploy (30-60 minutos)

### Preparar a Configuração Docker

```
@docker-architect Projete a arquitetura Docker para produção
```

### Criar os Arquivos Docker

```
/docker:compose-setup symfony postgresql redis
```

### Criar o Pipeline de CI/CD

```
/docker:cicd-pipeline github-actions
```

### Verificação de Segurança

```
/docker:security-scan
```

### Lista de Verificação Pré-Lançamento

```
/common:release-checklist
```

### Deploy

```bash
# Build e teste
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Executar migrações
docker compose exec app php bin/console doctrine:migrations:migrate

# Verificar saúde
curl https://your-app.com/health
```

---

## Usando o Ralph para Automação

Para ciclos de desenvolvimento automatizados, use o Ralph Wiggum:

```bash
# Implementar uma funcionalidade automaticamente
/common:ralph-run "Implementar registro de usuário com TDD"

# Com verificações completas de DoD
/common:ralph-run --full "Adicionar funcionalidade de redefinição de senha"
```

O Ralph irá iterar até que:
- Todos os testes passem
- O lint passe
- Os validadores de DoD passem

---

## Sequência Completa de Comandos

Aqui está uma sequência condensada para uma funcionalidade típica:

```bash
# 0. Configuração da sessão
/effort high                    # Planejamento complexo
/common:setup-rtk               # Otimização de tokens (apenas na primeira vez)

# 1. Inicializar
/bmad:init

# 2. Definir (PM)
@pm Crie o PRD para a funcionalidade
/gate:validate-prd docs/prd.md

# 3. Projetar (Arquiteto)
@architect Crie a especificação técnica
/gate:validate-techspec docs/tech-spec.md

# 4. Planejar (PO + SM)
@po Crie as histórias de usuário
@sm Planeje o sprint 1
/gate:validate-sprint

# 5. Desenvolver (Dev)
/sprint:next-story --claim
@dev Implementar com TDD
/gate:validate-story US-001
/sprint:transition US-001 done

# 6. Revisar (QA)
@qa Validar os critérios de aceitação
/team:audit --sequential

# 7. Deploy
/docker:cicd-pipeline github-actions
/common:release-checklist
```

---

## Dicas para o Sucesso

### 0. Gerencie sua Janela de Contexto

A janela de contexto é o seu recurso mais crítico:
- Use `/effort low` para tarefas simples, `/effort high` para tarefas complexas
- Use `/context` regularmente para verificar sugestões de otimização
- Execute `/clear` entre tarefas não relacionadas
- Use `/memory` para persistir decisões-chave entre sessões
- Configure `/loop` para verificações recorrentes em vez de execuções manuais

### 1. Não Pule os Quality Gates

Cada gate detecta problemas diferentes:
- PRD Gate → Evita construir a coisa errada
- Tech Spec Gate → Evita problemas arquiteturais
- Backlog Gate → Garante que as histórias são implementáveis
- Story DoD → Garante código de qualidade

### 2. Use os Agentes de Forma Colaborativa

Deixe os agentes se passarem o trabalho uns para os outros:
```
@bmad-master Direcione isto para o agente adequado
```

### 3. TDD é Inegociável

Sempre siga 🔴 Vermelho → 🟢 Verde → 🔵 Refatorar.

### 4. Documente as Decisões

Use ADRs para escolhas importantes:
```
@architect Crie um ADR para a escolha de X em vez de Y
```

### 5. Revisões Regulares

- Diariamente: `/common:daily-standup`
- Final do Sprint: `@sm Execute a revisão do sprint`
- Contínuo: `@{tech}-reviewer Revise este código`

---

## Solução de Problemas

### Falha no Quality Gate

```
/gate:report
```

Verifique quais critérios estão faltando.

### História Bloqueada

```
/sprint:transition US-001 blocked --reason="Aguardando API"
```

### Necessidade de Reverter

Se estiver usando o Ralph com checkpointing Git:
```bash
git log --oneline --grep="[ralph]"
git reset --hard HEAD~3
```

---

## Próximos Passos

- [Guia Prático BMAD](../BMAD-PRACTICAL-GUIDE.md) - Mergulho profundo no BMAD
- [Guia Ralph Wiggum](../RALPH-GUIDE.md) - Desenvolvimento automatizado
- [Referência de Comandos](../COMMANDS.md) - Todos os comandos disponíveis
- [Referência de Agentes](../AGENTS.md) - Todos os agentes disponíveis
