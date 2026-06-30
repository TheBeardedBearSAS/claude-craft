# Guia de Criação de Projeto

Este guia acompanha você na configuração de um novo projeto com o Claude-Craft, desde a escolha da stack de tecnologia até a configuração do ambiente de desenvolvimento.

---

## Sumário

1. [Escolhendo a Sua Tecnologia](#escolhendo-a-sua-tecnologia)
2. [Métodos de Instalação](#métodos-de-instalação)
3. [Projetos de Tecnologia Única](#projetos-de-tecnologia-única)
4. [Projetos Monorepo](#projetos-monorepo)
5. [Configuração Pós-Instalação](#configuração-pós-instalação)
6. [Lista de Verificação de Início de Projeto](#lista-de-verificação-de-início-de-projeto)

---

## Escolhendo a Sua Tecnologia

### Comparação de Tecnologias

| Tecnologia | Melhor Para | Arquitetura | Características Principais |
|------------|-------------|-------------|---------------------------|
| **.NET / C#** | APIs corporativas | Clean Architecture + CQRS | MediatR, EF Core, C# 14 |
| **Symfony** | APIs backend, Apps web | Clean Architecture + DDD | Doctrine, Messenger, API Platform |
| **Flutter** | Apps móveis | Feature-based + BLoC | Material/Cupertino, gerenciamento de estado |
| **Python** | APIs, Serviços de dados | Clean Architecture | FastAPI, async/await, Pydantic |
| **React** | SPAs web | Feature-based + Hooks | Gerenciamento de estado, acessibilidade |
| **React Native** | Mobile multiplataforma | Baseada em navegação | Módulos nativos, código específico por plataforma |
| **Angular** | Apps web corporativos | Domain-driven | Signals, Standalone, RxJS |
| **Vue.js** | SPAs web | Composition API | Pinia, Vitest, TypeScript |
| **Laravel** | APIs PHP, Apps web | Clean Architecture | Actions, Pest PHP, Sanctum |
| **PHP** | Bibliotecas, Backend | Clean Architecture | PSR-12, PHPStan, Pest PHP |

### Escolhendo com Base no Tipo de Projeto

| Tipo de Projeto | Stack Recomendado |
|-----------------|-------------------|
| API REST | Symfony ou Python |
| App móvel (sensação nativa) | Flutter |
| App móvel (equipe JS) | React Native |
| SPA Web | React |
| Full-stack web | Symfony + React |
| Full-stack móvel | Symfony + Flutter |
| Microsserviços | Python (FastAPI) |

### Combinações Comuns

```
Aplicação Web:      Symfony (backend) + React (frontend)
Aplicação Móvel:    Symfony (API) + Flutter (mobile)
Plataforma Completa: Symfony (API) + React (web) + Flutter (mobile)
Plataforma de Dados: Python (API) + React (dashboard)
```

---

## Métodos de Instalação

O Claude-Craft oferece múltiplos métodos de instalação para se adaptar a diferentes fluxos de trabalho.

### Método 1: Makefile (Recomendado)

A abordagem mais simples e flexível.

```bash
# Sintaxe básica
make install-{tecnologia} TARGET=caminho RULES_LANG=idioma

# Exemplos
make install-symfony TARGET=./backend RULES_LANG=en
make install-flutter TARGET=./mobile RULES_LANG=fr
make install-python TARGET=./api RULES_LANG=es
make install-react TARGET=./frontend RULES_LANG=de
make install-reactnative TARGET=./app RULES_LANG=pt
```

#### Opções Disponíveis

| Opção | Descrição | Exemplo |
|-------|-----------|---------|
| `TARGET` | Caminho de instalação | `TARGET=~/projects/myapp` |
| `LANG` | Código do idioma | `LANG=fr` |
| `OPTIONS` | Flags adicionais | `OPTIONS="--force --backup"` |

#### Flags de Opção

```bash
# Pré-visualizar mudanças sem aplicar
make install-symfony TARGET=./backend OPTIONS="--dry-run"

# Forçar sobrescrita de arquivos existentes (cria backup)
make install-symfony TARGET=./backend OPTIONS="--force"

# Criar backup antes da instalação
make install-symfony TARGET=./backend OPTIONS="--backup"

# Modo interativo (solicita informações do projeto)
make install-symfony TARGET=./backend OPTIONS="--interactive"

# Apenas atualizar (preserva arquivos específicos do projeto)
make install-symfony TARGET=./backend OPTIONS="--update"
```

### Método 2: Execução Direta de Script

Execute os scripts de instalação diretamente para mais controle.

```bash
# Sintaxe
./Dev/scripts/install-{tecnologia}-rules.sh [OPTIONS] [TARGET]

# Exemplos
./Dev/scripts/install-symfony-rules.sh --lang=fr ~/meu-projeto
./Dev/scripts/install-flutter-rules.sh --lang=en --dry-run .
./Dev/scripts/install-python-rules.sh --force --backup ~/api
```

#### Opções do Script

```bash
--lang=XX       # Idioma (en, fr, es, de, pt)
--install       # Modo de instalação completa
--update        # Atualizar apenas as regras comuns
--force         # Sobrescrever todos os arquivos
--dry-run       # Pré-visualizar sem alterações
--backup        # Criar backup primeiro
--interactive   # Solicitar informações do projeto
--help          # Mostrar ajuda
--version       # Mostrar versão
```

### Método 3: Configuração YAML

Melhor para monorepos e configurações com múltiplos projetos.

```bash
# Criar a configuração
cp claude-projects.yaml.example claude-projects.yaml

# Editar a configuração
nano claude-projects.yaml

# Validar a configuração
make config-validate CONFIG=claude-projects.yaml

# Instalar um projeto específico
make config-install CONFIG=claude-projects.yaml PROJECT=my-project

# Instalar todos os projetos
make config-install-all CONFIG=claude-projects.yaml
```

---

## Projetos de Tecnologia Única

### Projeto Symfony

```bash
# Criar o diretório do projeto
mkdir ~/minha-api-symfony
cd ~/minha-api-symfony
composer create-project symfony/skeleton .
git init

# Instalar as regras Claude-Craft
make install-symfony TARGET=. RULES_LANG=fr

# Verificar a instalação
ls -la .claude/
```

**Conteúdo instalado:**
- 21 regras específicas para Symfony (Clean Architecture, DDD, CQRS, etc.)
- 10+ comandos Symfony (`/symfony:generate-crud`, `/symfony:check-compliance`, etc.)
- Agente revisor do Symfony
- Templates de código (Service, ValueObject, Aggregate, etc.)
- Listas de verificação de qualidade

### Projeto Flutter

```bash
# Criar o projeto
flutter create my_flutter_app
cd my_flutter_app
git init

# Instalar as regras Claude-Craft
make install-flutter TARGET=. RULES_LANG=en

# Verificar
ls -la .claude/
```

**Conteúdo instalado:**
- 13 regras específicas para Flutter (BLoC, gerenciamento de estado, testes)
- 10 comandos Flutter
- Agente revisor do Flutter
- Templates de Widget e BLoC
- Listas de verificação de qualidade

### Projeto Python

```bash
# Criar o projeto
mkdir ~/minha-api-python
cd ~/minha-api-python
python -m venv venv
git init

# Instalar as regras Claude-Craft
make install-python TARGET=. RULES_LANG=en

# Verificar
ls -la .claude/
```

**Conteúdo instalado:**
- 12 regras específicas para Python (FastAPI, async, tipagem)
- 10 comandos Python
- Agente revisor do Python
- Templates de serviço e API
- Listas de verificação de qualidade

### Projeto React

```bash
# Criar o projeto
npx create-react-app my-react-app
cd my-react-app

# Instalar as regras Claude-Craft
make install-react TARGET=. RULES_LANG=en

# Verificar
ls -la .claude/
```

### Projeto React Native

```bash
# Criar o projeto
npx react-native init MyApp
cd MyApp

# Instalar as regras Claude-Craft
make install-reactnative TARGET=. RULES_LANG=en

# Verificar
ls -la .claude/
```

---

## Projetos Monorepo

### Entendendo a Estrutura do Monorepo

Um monorepo típico pode ter a seguinte estrutura:

```
my-platform/
├── backend/          # API Symfony
├── web/              # Frontend React
├── mobile/           # App Flutter
├── shared/           # Tipos/contratos compartilhados
└── claude-projects.yaml
```

### Estrutura da Configuração YAML

```yaml
# claude-projects.yaml

settings:
  default_lang: "fr"              # Idioma padrão para todos os projetos
  claude_craft_path: "~/claude-craft"  # Caminho para o claude-craft (opcional)

projects:
  - name: "my-platform"
    description: "Plataforma SaaS full-stack"
    path: "~/Projects/my-platform"
    modules:
      - name: "api"
        path: "backend"
        technologies: ["symfony"]
        lang: "en"                # Substituir o idioma padrão

      - name: "web"
        path: "web"
        technologies: ["react"]

      - name: "mobile"
        path: "mobile"
        technologies: ["flutter"]
```

### Campos de Configuração

#### Nível do Projeto

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `name` | Sim | Identificador do projeto |
| `description` | Não | Descrição do projeto |
| `path` | Sim | Caminho absoluto para a raiz do projeto |
| `lang` | Não | Substituição de idioma |
| `modules` | Não | Lista de módulos (para monorepos) |
| `technologies` | Não | Tecnologias se não houver módulos |

#### Nível do Módulo

| Campo | Obrigatório | Descrição |
|-------|-------------|-----------|
| `name` | Sim | Identificador do módulo |
| `path` | Sim | Caminho relativo a partir da raiz do projeto |
| `technologies` | Sim | Lista de tecnologias |
| `lang` | Não | Substituição de idioma |
| `skip_common` | Não | Pular regras comuns (padrão: false) |

### Comandos de Instalação

```bash
# Validar a configuração
make config-validate CONFIG=claude-projects.yaml

# Listar projetos configurados
make config-list CONFIG=claude-projects.yaml

# Instalar um projeto específico
make config-install CONFIG=claude-projects.yaml PROJECT=my-platform

# Instalar um módulo específico
make config-install CONFIG=claude-projects.yaml PROJECT=my-platform MODULE=api

# Dry-run para pré-visualizar
make config-install CONFIG=claude-projects.yaml PROJECT=my-platform OPTIONS="--dry-run"

# Instalar todos os projetos
make config-install-all CONFIG=claude-projects.yaml
```

### Exemplos do Mundo Real

#### Exemplo 1: Plataforma SaaS

```yaml
projects:
  - name: "saas-platform"
    path: "~/Projects/saas"
    modules:
      - name: "api"
        path: "services/api"
        technologies: ["symfony"]
      - name: "admin"
        path: "apps/admin"
        technologies: ["react"]
      - name: "mobile"
        path: "apps/mobile"
        technologies: ["flutter"]
```

#### Exemplo 2: Microsserviços

```yaml
projects:
  - name: "microservices"
    path: "~/Projects/micro"
    modules:
      - name: "gateway"
        path: "gateway"
        technologies: ["python"]
      - name: "users"
        path: "services/users"
        technologies: ["symfony"]
      - name: "orders"
        path: "services/orders"
        technologies: ["symfony"]
      - name: "analytics"
        path: "services/analytics"
        technologies: ["python"]
```

#### Exemplo 3: Múltiplos Projetos Independentes

```yaml
settings:
  default_lang: "fr"

projects:
  - name: "client-a"
    path: "~/Clients/client-a"
    technologies: ["symfony", "react"]

  - name: "client-b"
    path: "~/Clients/client-b"
    technologies: ["flutter"]
    lang: "en"

  - name: "internal-tool"
    path: "~/Internal/tool"
    technologies: ["python"]
```

---

## Configuração Pós-Instalação

Após a instalação, configure estes arquivos para o seu projeto específico.

### 1. Contexto do Projeto (`rules/00-project-context.md`)

Este é o arquivo mais importante para personalizar. Ele informa ao Claude sobre o seu projeto específico.

**Opção A: Configuração Interativa (Recomendada)**

Execute este comando no Claude Code para detectar automaticamente a sua stack e responder perguntas direcionadas:
```bash
/common:setup-project-context
```

**Opção B: Configuração Manual**

Edite o arquivo diretamente com os detalhes do seu projeto:

```markdown
# Contexto do Projeto

## Informações do Projeto
- **Nome**: Minha API Incrível
- **Tipo**: API REST para plataforma e-commerce
- **Tamanho da Equipe**: 3 desenvolvedores

## Stack Técnico
- PHP 8.3 com Symfony 7.0
- PostgreSQL 16
- Redis para cache
- RabbitMQ para mensageria

## Convenções
- Padrão de codificação PSR-12
- Tipagem estrita habilitada
- Código em inglês, documentação em francês

## Restrições
- Conformidade com RGPD obrigatória
- Deve suportar arquitetura multitenant
- Tempo máximo de resposta: 200ms

## Dependências Externas
- Stripe para pagamentos
- SendGrid para e-mails
- S3 para armazenamento de arquivos
```

### 2. Configuração Principal (`CLAUDE.md`)

O arquivo CLAUDE.md no diretório `.claude/` contém a configuração principal. Seções-chave para revisar:

```markdown
# Configuração do Projeto

## Configurações de Idioma
- Código: Inglês
- Documentação: Francês
- Comentários: Inglês

## Arquitetura
Clean Architecture + DDD + Hexagonal

## Requisitos de Qualidade
- Cobertura de testes: 80%+
- Nível PHPStan: 9
- Sem problemas críticos de segurança

## Requisitos Docker
Todos os comandos devem usar Docker via targets do make.
```

### 3. Configuração dos Agentes

Revise os agentes instalados em `.claude/agents/` e personalize se necessário:

```bash
ls .claude/agents/
# api-designer.md
# database-architect.md
# symfony-reviewer.md
# tdd-coach.md
# ...
```

---

## Lista de Verificação de Início de Projeto

Use esta lista ao configurar um novo projeto:

### Pré-Instalação

- [ ] Diretório do projeto criado
- [ ] Repositório Git inicializado
- [ ] Stack de tecnologia decidido
- [ ] Preferência de idioma escolhida

### Instalação

- [ ] Regras Claude-Craft instaladas
- [ ] Instalação verificada (`ls .claude/`)
- [ ] Sem erros na saída da instalação

### Configuração

- [ ] `00-project-context.md` personalizado com os detalhes do projeto
- [ ] `CLAUDE.md` revisado e ajustado
- [ ] Convenções da equipe documentadas
- [ ] Restrições e requisitos listados

### Verificação

- [ ] Claude Code iniciado no diretório do projeto
- [ ] Comandos disponíveis (tente `/symfony:check-compliance`)
- [ ] Agentes respondendo (tente `@symfony-reviewer hello`)

### Configuração da Equipe

- [ ] Diretório `.claude/` commitado no git
- [ ] Membros da equipe informados sobre os comandos disponíveis
- [ ] README atualizado com informações de uso do Claude-Craft

---

## Padrões Comuns

### Instalando Apenas as Regras Comuns

Para bibliotecas ou pacotes compartilhados que não se encaixam em uma tecnologia específica:

```bash
make install-common TARGET=./shared-lib RULES_LANG=en
```

### Instalando Ferramentas de Gerenciamento de Projeto

Para rastreamento de sprint e gerenciamento de backlog:

```bash
make install-project TARGET=. RULES_LANG=fr
```

### Instalando Ferramentas de Infraestrutura

Para suporte a Docker e CI/CD:

```bash
make install-infra TARGET=. RULES_LANG=en
```

### Instalação Completa (Todas as Tecnologias)

```bash
make install-all TARGET=. RULES_LANG=fr
```

---

### Configuração de Otimização de Tokens

Após instalar as regras, opcionalmente configure o RTK para economia de tokens:

```bash
# Na sessão do Claude Code
/common:setup-rtk
```

Isso configura o proxy RTK, a otimização do modelo de sub-agentes e templates de hook para uma redução geral de tokens de 55-65%.

---

## Atualizando as Regras

Quando o Claude-Craft lançar novas versões:

```bash
# Atualizar para a versão mais recente (preserva arquivos específicos do projeto)
make install-symfony TARGET=./backend OPTIONS="--update"

# Forçar reinstalação completa (backup criado automaticamente)
make install-symfony TARGET=./backend OPTIONS="--force"
```

---

## Próximos Passos

Seu projeto está agora configurado! Continue com:

1. **[Guia de Desenvolvimento de Funcionalidades](03-feature-development.md)** - Aprenda o fluxo de trabalho TDD
2. **[Guia de Correção de Bugs](04-bug-fixing.md)** - Trate bugs de forma eficaz
3. **[Referência de Ferramentas](05-tools-reference.md)** - Explore ferramentas adicionais

---

[&larr; Primeiros Passos](01-getting-started.md) | [Desenvolvimento de Funcionalidades &rarr;](03-feature-development.md)
