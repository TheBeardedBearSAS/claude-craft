# Referência CLI

Referência completa da interface de linha de comando Claude Craft.

---

## Instalação NPX

A forma recomendada de instalar Claude Craft é via NPX:

```bash
npx @the-bearded-bear/claude-craft [comando] [opções]
```

### Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `install` | Instalar Claude Craft em um projeto |
| `flatten` | Gerar um contexto achatado do codebase |
| (nenhum comando) | Assistente de instalação interativo |

---

## Assistente Interativo

Execute sem argumentos para o assistente interativo:

```bash
npx @the-bearded-bear/claude-craft
```

O assistente te guiará através de:
1. **Diretório destino** - Onde instalar
2. **Stack tecnológico** - Qual(is) framework(s) usar
3. **Idioma** - Idioma da documentação (en, fr, es, de, pt)
4. **Opções** - Backup, sobrescrita forçada, etc.

---

## Comando Install

### Uso Básico

```bash
npx @the-bearded-bear/claude-craft install <diretório-destino> [opções]
```

### Opções

| Opção | Atalho | Descrição |
|-------|--------|-----------|
| `--tech=<tecnologia>` | `-t` | Stack tecnológico a instalar |
| `--lang=<idioma>` | `-l` | Idioma da documentação |
| `--force` | `-f` | Sobrescrever arquivos existentes |
| `--backup` | `-b` | Criar backup antes de instalar |
| `--dry-run` | `-d` | Simular sem efetuar mudanças |
| `--preserve-config` | | Manter o CLAUDE.md existente |

### Opções de Tecnologia

| Valor | Descrição |
|-------|-----------|
| `symfony` | Backend Symfony/PHP |
| `flutter` | Mobile Flutter/Dart |
| `react` | Frontend React |
| `reactnative` | Mobile React Native |
| `python` | Backend Python |
| `angular` | Frontend Angular |
| `csharp` | Backend C#/.NET |
| `laravel` | Backend Laravel/PHP |
| `vuejs` | Frontend Vue.js |
| `php` | PHP Clean Architecture |
| `common` | Regras comuns apenas |
| `all` | Todas as tecnologias |

### Opções de Idioma

| Valor | Idioma |
|-------|--------|
| `en` | Inglês (padrão) |
| `fr` | Francês |
| `es` | Espanhol |
| `de` | Alemão |
| `pt` | Português |

### Exemplos

```bash
# Instalar regras Symfony em português
npx @the-bearded-bear/claude-craft install ~/meu-projeto --tech=symfony --lang=pt

# Instalar múltiplas tecnologias
npx @the-bearded-bear/claude-craft install . --tech=react
npx @the-bearded-bear/claude-craft install . --tech=python

# Forçar reinstalação com backup
npx @the-bearded-bear/claude-craft install ~/app --tech=flutter --force --backup

# Dry run para previsualizar mudanças
npx @the-bearded-bear/claude-craft install . --tech=angular --dry-run

# Instalar todas as tecnologias
npx @the-bearded-bear/claude-craft install ~/projeto --tech=all --lang=pt
```

---

## Comando Flatten

Gera um resumo achatado do teu codebase para assistentes de IA.

### Uso

```bash
npx @the-bearded-bear/claude-craft flatten [opções]
```

### Opções

| Opção | Descrição |
|-------|-----------|
| `--output=<arquivo>` | Nome do arquivo de saída (padrão: `CODEBASE.md`) |
| `--max-tokens=<n>` | Tokens máximos antes de fragmentação |
| `--exclude=<padrões>` | Padrões adicionais a excluir |

### Exemplos

```bash
# Gerar o codebase achatado
npx @the-bearded-bear/claude-craft flatten

# Arquivo de saída personalizado
npx @the-bearded-bear/claude-craft flatten --output=CONTEXT.md

# Limitar o número de tokens (ativa a fragmentação para projetos grandes)
npx @the-bearded-bear/claude-craft flatten --max-tokens=50000

# Excluir diretórios adicionais
npx @the-bearded-bear/claude-craft flatten --exclude="*.test.ts,*.spec.ts"
```

### Saída

O comando flatten gera:
- Estrutura da árvore de arquivos
- Conteúdo de arquivos por ordem de prioridade
- Estimativa de tokens
- Fragmentação automática para projetos grandes

---

## Comandos Makefile

Quando clonares o repositório, podes usar Make para a instalação.

### Comandos de Instalação

```bash
# Instalar uma tecnologia específica
make install-symfony TARGET=~/projeto
make install-flutter TARGET=~/projeto RULES_LANG=pt
make install-react TARGET=~/projeto OPTIONS="--force"

# Instalar presets
make install-all TARGET=~/projeto         # Tudo
make install-common TARGET=~/projeto      # Regras comuns apenas
make install-web TARGET=~/projeto         # React
make install-backend TARGET=~/projeto     # Symfony + Python
make install-mobile TARGET=~/projeto      # Flutter + React Native

# Instalar as ferramentas
make install-tools                         # Todas as ferramentas
make install-statusline                    # Linha de status personalizada
make install-multiaccount                  # Gestor multi-contas
make install-projectconfig                 # Gestor de configuração de projeto
```

### Comandos Dry Run

```bash
make dry-run-all TARGET=~/projeto
make dry-run-symfony TARGET=~/projeto
make dry-run-flutter TARGET=~/projeto
```

### Comandos de Configuração

```bash
make config-list                           # Listar projetos na config YAML
make config-validate                       # Validar a config YAML
make config-install PROJECT=meu-projeto    # Instalar a partir da config
make config-install-all                    # Instalar tudo a partir da config
make config-dry-run PROJECT=meu-projeto    # Dry run a partir da config
```

### Comandos Utilitários

```bash
make help                                  # Mostrar todos os comandos disponíveis
make list                                  # Listar os componentes disponíveis
make list-agents                           # Listar todos os agentes
make list-commands                         # Listar todos os comandos
make stats                                 # Mostrar as estatísticas
make tree                                  # Mostrar a estrutura do projeto
make fix-permissions                       # Corrigir as permissões dos scripts
```

### Comandos de Migração

```bash
make migrate-check                         # Verificar o estado de migração
```

### Export Plugin

```bash
make plugin-export                         # Exportar como plugin Claude Code
make plugin-export-all                     # Exportar todas as tecnologias
```

---

## Execução Direta de Scripts

Para controle avançado, executa os scripts de instalação diretamente.

### Sintaxe

```bash
./Dev/scripts/install-{tech}-rules.sh [opções] <diretório-destino>
```

### Scripts Disponíveis

| Script | Tecnologia |
|--------|------------|
| `install-common-rules.sh` | Comum/transversal |
| `install-symfony-rules.sh` | Symfony |
| `install-flutter-rules.sh` | Flutter |
| `install-react-rules.sh` | React |
| `install-reactnative-rules.sh` | React Native |
| `install-python-rules.sh` | Python |
| `install-angular-rules.sh` | Angular |
| `install-csharp-rules.sh` | C#/.NET |
| `install-laravel-rules.sh` | Laravel |
| `install-vuejs-rules.sh` | Vue.js |
| `install-php-rules.sh` | PHP |

### Opções dos Scripts

| Opção | Descrição |
|-------|-----------|
| `--install` | Instalação fresca (padrão) |
| `--update` | Atualizar apenas arquivos existentes |
| `--force` | Sobrescrever todos os arquivos |
| `--preserve-config` | Manter CLAUDE.md e contexto projeto |
| `--dry-run` | Simular sem mudanças |
| `--backup` | Criar um backup antes de mudanças |
| `--interactive` | Instalação guiada |
| `--lang=XX` | Definir o idioma (en, fr, es, de, pt) |
| `--agents-only` | Instalar apenas os agentes |
| `--commands-only` | Instalar apenas os comandos |
| `--rules-only` | Instalar apenas as regras |
| `--templates-only` | Instalar apenas os templates |
| `--checklists-only` | Instalar apenas as checklists |

### Exemplos

```bash
# Instalação básica
./Dev/scripts/install-symfony-rules.sh --lang=pt ~/meu-projeto

# Atualizar uma instalação existente
./Dev/scripts/install-flutter-rules.sh --update ~/minha-app

# Forçar a reinstalação com backup
./Dev/scripts/install-python-rules.sh --force --backup ~/api

# Modo interativo
./Dev/scripts/install-react-rules.sh --interactive ~/frontend

# Instalar apenas os agentes
./Dev/scripts/install-symfony-rules.sh --agents-only ~/projeto
```

---

## Ralph Wiggum CLI

Executa Claude em loop contínuo até o cumprimento da tarefa.

### Uso

```bash
npx @the-bearded-bear/claude-craft ralph "descrição da tarefa"
```

### Opções

| Opção | Descrição |
|-------|-----------|
| `--full` | Ativar todos os validadores DoD |
| `--max-iterations=<n>` | Número máximo de iterações (padrão: 10) |
| `--dod=<arquivo>` | Arquivo de configuração DoD personalizado |

### Exemplos

```bash
# Tarefa básica
npx @the-bearded-bear/claude-craft ralph "Implementar a autenticação de utilizador"

# Com todas as verificações DoD
npx @the-bearded-bear/claude-craft ralph --full "Corrigir o bug de login"

# Limite de iterações personalizado
npx @the-bearded-bear/claude-craft ralph --max-iterations=20 "Refatorar o módulo de pagamento"
```

---

## Comando Kanban

Lança uma interface web local que visualiza o diretório BMAD v6 `project-management/` como um quadro Scrum / Kanban. O servidor escuta exclusivamente em `127.0.0.1` e nunca solicita a Internet.

### Uso

```bash
npx @the-bearded-bear/claude-craft kanban [caminho] [opções]
```

O `caminho` é por padrão o diretório atual. O destino deve conter uma subpasta `project-management/` (gerada por `/workflow:plan` ou `/sprint:start`).

### Opções

| Opção | Descrição |
|-------|-----------|
| `--port=<n>` | Porta HTTP (padrão: 3737) |
| `--open` | Abre automaticamente o navegador |
| `--readonly` | Desativa todas as mutações (403 em cada PATCH) |
| `--no-watch` | Desativa o watcher de arquivos |

### Visualizações

- **Kanban** — 6 colunas. Arrastar e soltar para transicionar. Os gates (INVEST 6/6, DoD, tarefas completas) são validados do lado do servidor.
- **Backlog** — árvore Epic (apenas leitura) com progresso por epic.
- **Burndown** — curvas ideal vs real do sprint ativo, indicador on-track / at-risk / behind.
- **Dependencies** — grafo dirigido das dependências inter-stories, ciclos em vermelho.
- **Docs** — visualizador markdown. Os links `[US-XXX]` abrem o cartão correspondente.

### Exemplos

```bash
# Lança no projeto atual e abre o navegador
npx @the-bearded-bear/claude-craft kanban --open

# Modo apenas leitura
npx @the-bearded-bear/claude-craft kanban --readonly --port=4040
```

### Segurança

Bind `127.0.0.1` exclusivo, CSRF same-origin, path traversal bloqueado, escrita atômica (lock + backup + rollback + mtime check), CSP estrita, zero chamadas de saída.

---

## Arquivo de Configuração

### Configuração YAML

Para monorepos e configurações multi-projeto, utiliza `claude-projects.yaml`:

```yaml
settings:
  default_lang: "pt"

projects:
  - name: "meu-monorepo"
    description: "Minha aplicação fullstack"
    root: "~/Projetos/meu-monorepo"
    lang: "pt"
    common: true
    modules:
      - path: "frontend"
        tech: react
      - path: "backend"
        tech: symfony
      - path: "mobile"
        tech: flutter
      - path: "api"
        tech: [python, react]  # Tecnologias múltiplas
```

### Variáveis de Ambiente

| Variável | Descrição | Padrão |
|----------|-----------|--------|
| `CLAUDE_CRAFT_LANG` | Idioma padrão | `en` |
| `CLAUDE_CRAFT_TARGET` | Diretório destino padrão | `.` |
| `CLAUDE_CRAFT_CONFIG` | Caminho do arquivo de config | `claude-projects.yaml` |

---

## Códigos de Saída

| Código | Significado |
|--------|-------------|
| 0 | Sucesso |
| 1 | Erro geral |
| 2 | Argumentos inválidos |
| 3 | Pré-requisitos em falta |
| 4 | Diretório destino não encontrado |
| 5 | Permissão negada |

---

## Solução de Problemas

### Problemas de cache NPX

```bash
# Limpar o cache NPX
npx clear-npx-cache
# ou
rm -rf ~/.npm/_npx
```

### Script não executável

```bash
chmod +x Dev/scripts/*.sh
# ou
make fix-permissions
```

### Má versão de yq

```bash
# Claude Craft requer yq v4 (versão de Mike Farah)
yq --version
# Deve mostrar: yq (https://github.com/mikefarah/yq/) version v4.x.x
```

---

## Otimização de Tokens (RTK)

### Configuração Automática

```bash
# No Claude Code, configura todas as otimizações num comando
/common:setup-rtk
```

### Comandos RTK

| Comando | Descrição |
|---------|-----------|
| `rtk gain` | Mostrar as economias de tokens |
| `rtk gain --history` | Histórico de comandos com economias |
| `rtk discover` | Analisar o histórico para oportunidades perdidas |
| `rtk proxy <cmd>` | Executar um comando sem filtragem (debug) |
| `rtk --version` | Verificar a versão instalada |

### Comandos de Contexto Claude Code

| Comando | Descrição |
|---------|-----------|
| `/effort low\|medium\|high` | Ajustar o nível de esforço do modelo |
| `/context` | Sugestões de otimização do contexto |
| `/compact` | Compactar proativamente o contexto |
| `/clear` | Limpar entre tarefas não relacionadas |
| `/memory` | Aprendizagens persistentes (v2.1.59+) |
| `/loop <intervalo> <cmd>` | Tarefas recorrentes (v2.1.71+) |
| `/model haiku\|sonnet\|opus` | Mudar de modelo em sessão |

---

## Ver Também

- [Guia de Início Rápido](QUICKSTART.md)
- [Pré-requisitos](PREREQUISITES.md)
- [Guia de Instalação](../INSTALLATION.md)
- [Referência de Comandos](../COMMANDS-FULL-REFERENCE.md)
