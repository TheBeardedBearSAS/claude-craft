# Primeiros Passos com Claude-Craft

Bem-vindo ao Claude-Craft! Este guia ajudará você a entender o que é o Claude-Craft e a iniciar seu primeiro projeto em apenas 5 minutos.

---

## O que é Claude-Craft?

Claude-Craft é um framework completo para desenvolvimento assistido por IA com Claude Code. Ele fornece:

- **214+ Comandos Slash** - Ações rápidas em 27 namespaces para geração, análise e qualidade de código
- **63 Agentes IA** - Assistentes especializados para diferentes tarefas (design de API, arquitetura, revisão de código, DevOps, etc.)
- **18 Stacks Tecnológicos** - De .NET/C# a Vue.js, com regras e agentes dedicados
- **41 Skills** - Melhores práticas para arquitetura, testes, segurança e qualidade de código
- **21 Templates** - Padrões de código prontos para usar
- **10 Checklists** - Portões de qualidade para features e releases

### Tecnologias Suportadas

| Tecnologia | Foco | Casos de Uso |
|------------|------|--------------|
| **Symfony / PHP** | Clean Architecture + DDD | APIs, Apps web, Serviços backend |
| **React** | Hooks + State Management | SPAs web, Dashboards |
| **Flutter / Dart** | Padrão BLoC | Apps móveis (iOS/Android) |
| **Python** | FastAPI + async/await | APIs, Serviços de dados, ML |
| **Angular** | Signals + Standalone | SPAs enterprise |
| **Vue.js** | Composition API + Pinia | SPAs web, Dashboards |
| **React Native** | New Architecture | Apps móveis multiplataforma |
| **C# / .NET** | Clean Architecture + CQRS | APIs enterprise, Microserviços |
| **Laravel** | Actions Pattern | APIs, CMS, E-commerce |
| **PHP** | PSR-12 + PHPStan | Bibliotecas, APIs |
| **Docker** | Containerização | Dev local, CI/CD |
| **Coolify** | PaaS auto-hospedado | Deploys simples |
| **Kubernetes** | Orquestração | Microserviços, Scale |
| **OpenTofu** | IaC | Multi-cloud |
| **Ansible** | Automação | Gestão de configuração |
| **Hcloud** | Hetzner Cloud | Hospedagem europeia |
| **PgBouncer** | Connection pooling | PostgreSQL alta carga |
| **FrankenPHP** | Servidor PHP/Go | Performance PHP |

### Idiomas Suportados

Todo o conteúdo está disponível em 5 idiomas: Inglês (en), Francês (fr), Espanhol (es), Alemão (de), Português (pt)

---

## Pré-requisitos

### Obrigatórios
- **Bash** - Shell para executar scripts de instalação
- **Claude Code** - O assistente de codificação IA da Anthropic

### Opcionais (Recomendados)
```bash
# yq - Processador YAML
brew install yq  # macOS
sudo apt install yq  # Linux

# jq - Processador JSON (para StatusLine)
brew install jq  # macOS
sudo apt install jq  # Linux
```

---

## Instalação Rápida

### Método 1: Makefile (Recomendado)

```bash
git clone https://github.com/thebeardedcto/claude-craft.git
cd claude-craft

# Instalar para projeto Symfony (em português)
make install-symfony TARGET=~/meu-projeto LANG=pt
```

### Método 2: Script Direto

```bash
./Dev/scripts/install-symfony-rules.sh --lang=pt ~/meu-projeto
```

### Método 3: Configuração YAML (para Monorepos)

```bash
cp claude-projects.yaml.example claude-projects.yaml
nano claude-projects.yaml
make config-install CONFIG=claude-projects.yaml PROJECT=meu-projeto
```

---

## Seu Primeiro Projeto em 5 Minutos

```bash
# Passo 1: Criar diretório do projeto
mkdir ~/minha-api && cd ~/minha-api && git init

# Passo 2: Instalar regras Claude-Craft
make install-symfony TARGET=~/minha-api LANG=pt

# Passo 3: Verificar instalação
ls -la ~/minha-api/.claude/

# Passo 4: Configurar contexto do projeto (escolha uma opção)
# Opção A: Interativa (recomendada)
cd ~/minha-api && claude
# Depois execute: /common:setup-project-context

# Opção B: Manual
nano ~/minha-api/.claude/rules/00-project-context.md

# Passo 5: Iniciar Claude Code
cd ~/minha-api && claude
```

---

## Entendendo a Estrutura

### Regras (`rules/`)
Diretrizes que o Claude segue ao trabalhar no seu projeto, numeradas por prioridade (00-12+).

### Agentes (`agents/`)
```markdown
@api-designer Projete a API REST para gestão de usuários
@database-architect Crie o esquema para o agregado Pedido
@symfony-reviewer Revise minha implementação do UserService
```

### Comandos (`commands/`)
```bash
/symfony:generate-crud User
/symfony:check-compliance
/common:architecture-decision
```

### Templates (`templates/`)
service.md, value-object.md, aggregate-root.md, test-unit.md

### Checklists (`checklists/`)
feature-checklist.md, pre-commit.md, release.md, security-audit.md

---

## Conceitos-Chave

### 1. Fluxo de Trabalho TDD
```
1. Analisar → 2. Testes → 3. Implementar → 4. Refatorar → 5. Revisar
```

### 2. Clean Architecture
```
┌─────────────────────────────────────┐
│           Apresentação              │
├─────────────────────────────────────┤
│           Aplicação                 │
├─────────────────────────────────────┤
│             Domínio                 │
├─────────────────────────────────────┤
│          Infraestrutura             │
└─────────────────────────────────────┘
```

### 3. Qualidade Primeiro
- 80%+ cobertura de testes
- Análise estática aprovada
- Auditoria de segurança limpa
- Documentação atualizada

---

## Próximos Passos

1. **[Guia de Criação de Projeto](02-project-creation.md)**
2. **[Guia de Desenvolvimento de Features](03-feature-development.md)**
3. **[Guia de Correção de Bugs](04-bug-fixing.md)**

---

[Próximo: Criação de Projeto &rarr;](02-project-creation.md)
