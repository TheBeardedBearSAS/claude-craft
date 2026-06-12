# Primeiros Passos com o Claude-Craft

Bem-vindo ao Claude-Craft! Este guia vai ajudá-lo a entender o que é o Claude-Craft e a colocar seu primeiro projeto em funcionamento em apenas 5 minutos.

---

## O que é o Claude-Craft?

O Claude-Craft é um framework completo para desenvolvimento assistido por IA com o Claude Code. Ele fornece:

- **133 Comandos Slash** - Ações rápidas em 15 namespaces para geração de código, análise e verificações de qualidade
- **70 Agentes de IA (31 especializados + 39 de infraestrutura sob demanda)** - Assistentes especializados com níveis de esforço otimizados e memória persistente
- **11 Stacks Tecnológicos** - De .NET/C# a Vue.js, com regras e agentes dedicados
- **48 Skills** - Melhores práticas de arquitetura, testes e segurança
- **21 Templates** - Padrões de código prontos para uso em componentes comuns
- **10 Checklists** - Portões de qualidade para features, releases e auditorias de segurança
- **937 Testes** - Validação abrangente (vitest + bats)

### Tecnologias Suportadas

| Tecnologia | Foco | Casos de Uso |
|------------|------|--------------|
| **.NET / C#** | Clean Architecture + CQRS | APIs, Aplicações enterprise |
| **Symfony** | Clean Architecture + DDD | APIs, Aplicações web, Serviços backend |
| **Flutter** | Padrão BLoC | Aplicações móveis (iOS/Android) |
| **Python** | FastAPI + async/await | APIs, Serviços de dados, Backends de ML |
| **React** | Hooks + Gerenciamento de estado | SPAs web, Dashboards |
| **React Native** | Mobile multiplataforma | Aplicações móveis com JS |
| **Angular** | Signals + Standalone | Aplicações web enterprise |
| **Vue.js** | Composition API + Pinia | SPAs web, Aplicações progressivas |
| **Laravel** | Clean Architecture + Actions | APIs, Aplicações web |
| **PHP** | PSR-12 + PHPStan | Bibliotecas, Serviços backend |
| **Docker** | Infraestrutura | Containerização, CI/CD |

### Idiomas Suportados

Todo o conteúdo está disponível em 5 idiomas:
- Inglês (en)
- Francês (fr)
- Espanhol (es)
- Alemão (de)
- Português (pt)

---

## Pré-requisitos

### Obrigatórios

- **Bash** - Shell para executar os scripts de instalação
- **Claude Code** - O assistente de codificação por IA da Anthropic

### Compatibilidade com o Claude Code

| Versão | Status |
|--------|--------|
| **2.1.168** | Recomendada (suporte completo a recursos) |
| **2.1.97+** | Mínima suportada (CVE-2025-59536 corrigido) |

### Opcionais (Recomendados)

- **yq** - Processador YAML para arquivos de configuração
  ```bash
  # macOS
  brew install yq

  # Linux (Debian/Ubuntu)
  sudo apt install yq

  # Linux (snap)
  sudo snap install yq
  ```

- **jq** - Processador JSON (para a ferramenta StatusLine)
  ```bash
  # macOS
  brew install jq

  # Linux
  sudo apt install jq
  ```

---

## Instalação Rápida

### Método 1: Makefile (Recomendado)

```bash
# Clonar o Claude-Craft
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft

# Instalar para um projeto Symfony (em francês)
make install-symfony TARGET=~/my-project LANG=fr

# Ou para um projeto Flutter (em inglês)
make install-flutter TARGET=~/my-app LANG=en
```

### Método 2: Script Direto

```bash
# Navegar até o Claude-Craft
cd claude-craft

# Executar o script de instalação
./Dev/scripts/install-symfony-rules.sh --lang=fr ~/my-project
```

### Método 3: Configuração YAML (para Monorepos)

```bash
# Criar o arquivo de configuração
cp claude-projects.yaml.example claude-projects.yaml

# Editar com seus projetos
nano claude-projects.yaml

# Instalar a partir da configuração
make config-install CONFIG=claude-projects.yaml PROJECT=my-project
```

---

## Seu Primeiro Projeto em 5 Minutos

Vamos criar um novo projeto de API Symfony com regras em francês.

### Passo 1: Criar o Diretório do Projeto

```bash
mkdir ~/my-api
cd ~/my-api
git init
```

### Passo 2: Instalar as Regras do Claude-Craft

```bash
# A partir do diretório claude-craft
make install-symfony TARGET=~/my-api LANG=fr
```

### Passo 3: Verificar a Instalação

```bash
ls -la ~/my-api/.claude/
```

Você deverá ver:
```
.claude/
├── CLAUDE.md           # Configuração principal
├── .claudeignore       # Padrões de exclusão para redução de contexto
├── settings.json       # Padrões otimizados com hook PostCompact
├── settings.local.json # Permissões locais (padrões com wildcard)
├── rules/              # 21 arquivos de regras
├── agents/             # Agentes de IA com otimização de esforço/memória
├── commands/           # Comandos slash
│   ├── common/         # Comandos transversais
│   └── symfony/        # Comandos específicos do Symfony
├── templates/          # Templates de código
└── checklists/         # Portões de qualidade
```

### Passo 4: Configurar o Contexto do Projeto

Você pode configurar o contexto do projeto de forma interativa ou manual:

**Opção A: Interativa (Recomendada)**
```bash
cd ~/my-api && claude
# Em seguida, execute:
/common:setup-project-context
```

**Opção B: Manual**
```bash
nano ~/my-api/.claude/rules/00-project-context.md
```

Atualize estas seções:
- Nome e descrição do projeto
- Detalhes do stack técnico
- Convenções da equipe
- Restrições específicas

### Passo 5: Iniciar o Claude Code

```bash
cd ~/my-api
claude
```

Agora você pode usar todos os comandos e agentes instalados!

---

## Entendendo a Estrutura

### Regras (`rules/`)

As regras são diretrizes que o Claude segue ao trabalhar no seu projeto. Elas são numeradas por prioridade:

| Número | Tema |
|--------|------|
| 00 | Contexto do projeto (personalize este!) |
| 01 | Fluxo de trabalho e análise |
| 02 | Arquitetura |
| 03 | Padrões de codificação |
| 04 | Princípios SOLID |
| 05 | KISS, DRY, YAGNI |
| 06 | Docker e ferramentas |
| 07 | Testes |
| 08 | Ferramentas de qualidade |
| 09 | Fluxo de trabalho Git |
| 10 | Documentação |
| 11 | Segurança |
| 12+ | Tópicos avançados (DDD, CQRS, etc.) |

### Agentes (`agents/`)

Os agentes são personas de IA especializadas que você pode invocar para tarefas específicas:

```markdown
@api-designer Projete a API REST para gestão de usuários
@database-architect Crie o esquema para o agregado de Pedidos
@symfony-reviewer Revise minha implementação do UserService
@tdd-coach Ajude-me a escrever testes para o fluxo de autenticação
```

### Comandos (`commands/`)

Os comandos slash são ações rápidas:

```bash
# Gerar código
/symfony:generate-crud User

# Verificar qualidade
/symfony:check-compliance

# Analisar arquitetura
/common:architecture-decision
```

### Templates (`templates/`)

Os templates fornecem padrões de código:
- `service.md` - Template de classe de serviço
- `value-object.md` - Template de Value Object
- `aggregate-root.md` - Template de Aggregate Root DDD
- `test-unit.md` - Template de teste unitário

### Checklists (`checklists/`)

Portões de qualidade para diferentes cenários:
- `feature-checklist.md` - Antes de concluir uma feature
- `pre-commit.md` - Antes de commitar código
- `release.md` - Antes de fazer um release
- `security-audit.md` - Revisão de segurança

---

## Conceitos-Chave

### 1. Fluxo de Trabalho TDD

O Claude-Craft impõe o Desenvolvimento Orientado a Testes (TDD):

```
1. Analisar requisitos
2. Escrever testes com falha
3. Implementar código
4. Refatorar
5. Revisar
```

### 2. Clean Architecture

Todos os stacks tecnológicos seguem os princípios da Clean Architecture:

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

### 3. Qualidade em Primeiro Lugar

Cada feature deve passar pelos portões de qualidade:
- 80%+ de cobertura de testes
- Análise estática aprovada
- Auditoria de segurança sem pendências
- Documentação atualizada

---

## Otimizações Automáticas (v8.7)

O Claude-Craft agora inclui padrões otimizados prontos para uso:

**Instalado automaticamente:**
- ✓ `.claudeignore` para reduzir ruído de contexto
- ✓ `settings.json` com hook PostCompact para reinjeção de contexto
- ✓ `settings.local.json` com permissões wildcard
- ✓ `CLAUDE_CODE_SUBAGENT_MODEL=sonnet` aplicado para economia de custos
- ✓ `--ultra-compact` do RTK aplicado automaticamente durante a instalação

**Opcional: Integração com RTK**

Para máxima redução do output de CLI (economia de 60–90%):

```bash
# No Claude Code, execute o comando de configuração
/common:setup-rtk
```

**Economia esperada:** 55–65% de redução total de tokens com RTK completo + otimizações. Consulte o [Guia de Configuração](08-setup-new-project.md) para detalhes.

---

## Próximos Passos

Agora que você compreende o básico, continue com:

1. **[Guia de Criação de Projeto](02-project-creation.md)** - Configuração detalhada para diferentes cenários
2. **[Guia de Desenvolvimento de Features](03-feature-development.md)** - Fluxo de trabalho TDD com agentes e comandos
3. **[Guia de Correção de Bugs](04-bug-fixing.md)** - Diagnóstico e fluxo de testes de regressão

---

## Referência Rápida

### Comandos Comuns

```bash
# Instalação
make install-{tech} TARGET=caminho LANG=xx

# Listar opções disponíveis
make help

# Validar configuração YAML
make config-validate CONFIG=arquivo.yaml
```

### Agentes Úteis

| Agente | Finalidade |
|--------|-----------|
| `@api-designer` | Design e documentação de API |
| `@database-architect` | Design de esquema de banco de dados |
| `@tdd-coach` | Auxílio na escrita de testes |
| `@{tech}-reviewer` | Revisão de código para a tecnologia específica |

### Comandos Essenciais

| Comando | Finalidade |
|---------|-----------|
| `/common:analyze-feature` | Analisar requisitos |
| `/{tech}:generate-crud` | Gerar código CRUD |
| `/{tech}:check-compliance` | Auditoria completa de qualidade |
| `/common:security-audit` | Revisão de segurança |

---

[Próximo: Guia de Criação de Projeto &rarr;](02-project-creation.md)
