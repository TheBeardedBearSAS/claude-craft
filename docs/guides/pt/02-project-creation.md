# Guia de Criação de Projeto

Este guia acompanha você na configuração de um novo projeto com Claude-Craft.

---

## Escolher Sua Tecnologia

Claude-Craft suporta **11 stacks de aplicação** (+ 8 de infraestrutura):

### Stacks de Desenvolvimento

| Tecnologia | Ideal Para | Arquitetura | Características Principais |
|------------|------------|-------------|---------------------------|
| **C# / .NET** | APIs backend, Enterprise | Clean Architecture | CQRS, MediatR, EF Core |
| **Symfony / PHP** | APIs backend, Apps web | Clean Architecture + DDD | Doctrine, Messenger, API Platform |
| **Laravel / PHP** | Apps web, APIs rápidas | Clean Architecture | Actions, Pest PHP, Sanctum |
| **PHP** | Clean Architecture genérica | Clean Architecture | PSR-12, PHPStan, Pest PHP |
| **Flutter / Dart** | Apps móveis | Feature-based + BLoC | Material/Cupertino, Gestão de estado |
| **Python** | APIs, Serviços de dados | Clean Architecture | FastAPI, async/await, Pydantic |
| **React** | SPAs web | Feature-based + Hooks | Zustand, React Query, acessibilidade |
| **React Native** | Móvel multiplataforma | Feature-based | Navigation 7, Reanimated 4 |
| **Angular** | Apps empresariais | Domain-driven | Signals, Standalone, RxJS |
| **Vue.js** | SPAs web | Composition API | Pinia, Vitest, TypeScript |

### Stacks de Infraestrutura

Docker, Coolify, Kubernetes, OpenTofu, Ansible, Hetzner Cloud, PgBouncer, FrankenPHP

### Escolha por Tipo de Projeto

| Tipo de Projeto | Stack Recomendado |
|-----------------|-------------------|
| API REST | Symfony, Laravel ou Python |
| App móvel (nativa) | Flutter |
| App móvel (equipe JS) | React Native |
| SPA Web | React, Vue.js ou Angular |
| Full-stack web | Symfony + React |
| Full-stack móvel | Symfony + Flutter |
| Microserviços | Python (FastAPI) |
| Enterprise | C# / .NET ou Angular |

---

## Métodos de Instalação

### Método 1: Makefile (Recomendado)

```bash
make install-{tecnologia} TARGET=caminho LANG=idioma

# Exemplos
make install-symfony TARGET=./backend LANG=pt
make install-flutter TARGET=./mobile LANG=pt
```

#### Opções
```bash
OPTIONS="--dry-run"      # Pré-visualização sem alterações
OPTIONS="--force"        # Sobrescrever arquivos
OPTIONS="--backup"       # Criar backup
OPTIONS="--interactive"  # Modo interativo
OPTIONS="--update"       # Apenas atualizar
```

### Método 2: Script Direto

```bash
./Dev/scripts/install-symfony-rules.sh --lang=pt ~/meu-projeto
```

### Método 3: Configuração YAML

```yaml
# claude-projects.yaml
settings:
  default_lang: "pt"

projects:
  - name: "minha-plataforma"
    path: "~/Projetos/minha-plataforma"
    modules:
      - name: "api"
        path: "backend"
        technologies: ["symfony"]
      - name: "mobile"
        path: "app"
        technologies: ["flutter"]
```

```bash
make config-install CONFIG=claude-projects.yaml PROJECT=minha-plataforma
```

---

## Projetos Mono-Tecnologia

### Projeto Symfony
```bash
mkdir ~/minha-api && cd ~/minha-api && git init
make install-symfony TARGET=. LANG=pt
```

### Projeto Flutter
```bash
flutter create minha_app && cd minha_app && git init
make install-flutter TARGET=. LANG=pt
```

### Projeto Python
```bash
mkdir ~/minha-api-python && cd ~/minha-api-python && git init
make install-python TARGET=. LANG=pt
```

---

## Configuração Pós-Instalação

### 1. Contexto do Projeto (`rules/00-project-context.md`)

Este é o arquivo mais importante para personalizar.

**Opção A: Configuração Interativa (Recomendada)**

Execute este comando no Claude Code para detectar sua stack e responder perguntas direcionadas:
```bash
/common:setup-project-context
```

**Opção B: Configuração Manual**

Edite o arquivo diretamente com os detalhes do seu projeto:

```markdown
# Contexto do Projeto

## Informações
- **Nome**: Minha API E-commerce
- **Tipo**: API REST para plataforma e-commerce

## Stack Técnico
- PHP 8.3 com Symfony 7.0
- PostgreSQL 16
- Redis para cache

## Convenções
- Código em inglês, documentação em português
```

### 2. Configuração Principal (`CLAUDE.md`)

Revisar e ajustar:
- Configuração de idioma
- Requisitos de arquitetura
- Requisitos de qualidade
- Requisitos Docker

---

## Checklist de Início

### Pré-Instalação
- [ ] Diretório do projeto criado
- [ ] Repositório Git inicializado
- [ ] Stack tecnológico decidido

### Instalação
- [ ] Regras Claude-Craft instaladas
- [ ] Instalação verificada (`ls .claude/`)

### Configuração
- [ ] `00-project-context.md` personalizado
- [ ] `CLAUDE.md` revisado

### Verificação
- [ ] Claude Code iniciado no diretório
- [ ] Comandos disponíveis
- [ ] Agentes respondendo

---

[&larr; Primeiros Passos](01-getting-started.md) | [Desenvolvimento de Features &rarr;](03-feature-development.md)
