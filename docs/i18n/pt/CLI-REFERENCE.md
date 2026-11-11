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

Inicia uma interface web local para visualizar e gerenciar o backlog e os sprints BMAD v6 como um quadro Scrum / Kanban. O servidor escuta somente em `127.0.0.1` e nunca acessa a internet.

### Uso

```bash
npx @the-bearded-bear/claude-craft kanban [caminho] [opções]
```

O `caminho` é, por padrão, o diretório atual. O destino deve conter um subdiretório `project-management/` (gerado por `/workflow:plan` ou `/workflow:start`).

### Opções

| Opção | Descrição |
|-------|-----------|
| `--port=<n>` | Porta HTTP, de 1024 a 65535 (padrão: 3737). A forma com `=` é obrigatória: `--port 4000` (com espaço) é recusado com uma mensagem de uso |
| `--open` | Abre o navegador automaticamente |
| `--readonly` | Desativa toda escrita: o servidor responde 403 `readonly` a cada PATCH, PUT, POST e DELETE, e o quadro não oferece nenhum controle de movimentação |
| `--no-watch` | Desativa o watcher de arquivos (sem recarga em caso de alterações externas) |
| `--user=<nome>` | Autor registrado no `history` das alterações feitas pelo quadro (`kanban:<nome>`). Padrão: `CLAUDE_CRAFT_USER`, depois `git config user.name`, depois o usuário do sistema e, por fim, `kanban` |

### Visualizações

Seis visualizações, listadas na barra de navegação.

- **Board** — 6 colunas (backlog, ready-for-dev, in-progress, review, done, blocked). Um cartão é movido arrastando-o ou pelo menu "Mover" do cartão, que só oferece as colunas permitidas (alternativa para o teclado e para um único ponteiro). Os gates (INVEST ou pontos, tarefas concluídas, fase TDD) são validados no servidor. O cabeçalho da coluna mostra o número de cartões, ou `número/limite` quando há um limite WIP definido.
- **Backlog** — árvore de epics com o progresso de cada um. Selecionam-se uma ou mais stories para adicioná-las a um sprint ou devolvê-las ao backlog; uma barra de capacidade compara os pontos comprometidos com a capacidade do sprint de destino.
- **Sprints** — todos os sprints (planejados, ativo, encerrados) com objetivo, datas, pontos, stories e tarefas expansíveis, além das notas de revisão e de retrospectiva. É aqui que se criam, iniciam e encerram os sprints.
- **Burndown** — curvas ideal e real do sprint ativo, indicador on-track / at-risk / behind. O gráfico de velocidade (pontos comprometidos e entregues dos sprints encerrados, média dos três últimos, previsão dos sprints restantes) vem com uma tabela equivalente.
- **Dependencies** — grafo dirigido das dependências entre stories com os ciclos destacados, e uma tabela equivalente (story, depende de, bloqueia, status, ciclo).
- **Docs** — visualizador markdown de `prd.md`, `tech-spec.md`, `personas.md`, `architecture/*.md` e dos documentos de epics, stories e sprints. Os identificadores `US-XXX` no texto levam à story.

### O que se pode fazer pelo quadro

- **Mover uma story** entre colunas. As transições permitidas estão em [Máquina de estados](#máquina-de-estados); bloquear uma story pede um motivo.
- **Criar, editar e excluir uma story** ("Nova story" nas visualizações Board e Backlog; o formulário fica no detalhe da story). Campos editáveis: título, epic, pontos, prioridade, responsável, sprint, fase TDD e dependências; persona na criação. A exclusão pede confirmação e move o arquivo para `project-management/backlog/user-stories/.trash/` (recuperável, devolvendo-o ao lugar). Uma story em andamento ou em revisão exige confirmação explícita, e uma story da qual outras dependem não pode ser excluída (409 `has_dependents`).
- **Adicionar, renomear e excluir tarefas e alterar o seu status** (`to-do`, `in-progress`, `done`, `blocked`) no detalhe da story; o número de tarefas concluídas é recalculado. Uma story só passa a revisão quando tem tarefas e todas estão concluídas. Numa story que só tinha um contador de tarefas, a primeira alteração regista um status por tarefa (as primeiras tarefas, tantas quantas o contador indicava, contam como concluídas).
- **Planejar um sprint**: selecionar stories na visualização Backlog e adicioná-las a um sprint planejado ou ativo.
- **Criar, iniciar e encerrar um sprint.** A criação (nome, datas de início e fim, objetivo, capacidade) escreve `sprints/sprint-<N>-<slug>/sprint-goal.md`; o sprint fica "planejado". Iniciá-lo o torna o sprint ativo (recusado enquanto outro sprint estiver ativo). O encerramento arquiva as stories `done` em `archived_sprints` e permite escolher o destino das não concluídas: voltar ao backlog ou passar para um sprint planejado.
- **Definir limites WIP** por coluna no painel de Configurações. São indicativos: ultrapassá-los exibe um aviso e nunca bloqueia uma movimentação. Uma coluna conta as stories do sprint ativo, tal como o quadro as mostra.
- **Dados não guardados estão protegidos**: fechar um formulário (Escape, Cancelar, o fundo) ou mudar de URL (Voltar do navegador, um link para uma story) quando um formulário de story ou de sprint tem alterações pede confirmação antes de as descartar.
- **Buscar, filtrar e ordenar**: a caixa de busca (`Ctrl+K` ou `/`) filtra as visualizações Board e Backlog; os filtros de prioridade, responsável e epic e a ordenação ficam na URL, por exemplo `#/kanban?q=auth&prio=must,should&who=alice&epic=E4&sort=priority&dir=desc`. `?story=US-E4-03` abre uma story a partir de qualquer visualização e `#/docs/<caminho>` abre um documento.
- **Idioma da interface**: inglês, francês, espanhol, alemão ou português, escolhido automaticamente pelo navegador ou no painel de Configurações. Os títulos das stories e os documentos são exibidos como foram escritos.

Os comandos `/workflow:*` e `/project:*` continuam válidos e escrevem os mesmos arquivos.

### Onde os dados são gravados

| Dado | Arquivo |
|------|---------|
| Status, pertencimento a um sprint, tarefas, pontos, responsável, prioridade, histórico | `.bmad/sprint-status.yaml` |
| Conteúdo de uma story (descrição, critérios de aceitação, persona) | `project-management/backlog/user-stories/US-*.md` |
| Objetivo de um novo sprint | `project-management/sprints/sprint-<N>-<slug>/sprint-goal.md` |
| Limites WIP | `.bmad/kanban.yaml` |
| Stories excluídas | `project-management/backlog/user-stories/.trash/` |

Os arquivos markdown nunca recebem uma linha de status. As chaves opcionais `stories.<id>.sprint_id` e `metadata.closed_date` estão descritas em `Project/i18n/pt/templates/sprint-status.md`.

### Concorrência

- As gravações em `.bmad/sprint-status.yaml` usam o mesmo bloqueio dos scripts de `.bmad/lib/` (`status-lock.sh`). Enquanto um script o mantém, o quadro responde 423 `locked`; um bloqueio deixado por um processo interrompido é retomado após 10 segundos.
- Os conflitos são detectados story a story: cada story carrega uma revisão, devolvida em `If-Match`. Uma story alterada em outro lugar nesse meio-tempo é recusada com 409 `conflict`, e a interface propõe recarregá-la.
- O arquivo é reescrito após nova validação, com comentários, ordem das chaves e formatação preservados. Um arquivo que não valida nunca é sobrescrito (409 `sprint_status_invalid`).

### Segurança

- Escuta somente em `127.0.0.1`, nunca em `0.0.0.0` nem na rede local.
- O cabeçalho `Host` deve ser o endereço de loopback e a porta servida (proteção contra DNS rebinding); o `Origin` é verificado a cada gravação, e gravações entre origens diferentes são recusadas (403).
- Corpos de requisição limitados a 64 KB (512 KB para o corpo de uma story).
- `--readonly` bloqueia toda gravação.
- Travessia de caminho bloqueada no ponto de acesso aos documentos; as respostas de erro não contêm caminhos do sistema de arquivos.
- Gravações atômicas (bloqueio, arquivo temporário, renomeação).
- CSP estrita (`script-src 'self'`, `connect-src 'self'`), sem `eval`, sem execução de shell e sem chamadas de saída.

### Máquina de estados

Transições permitidas (todas as outras são recusadas com 409 `invalid_transition` e a lista dos destinos permitidos):

```
backlog       -> ready-for-dev (invest_score >= 6 se existir, senão story_points > 0) | blocked
ready-for-dev -> in-progress | backlog | blocked
in-progress   -> review (todas as tarefas concluídas) | blocked
review        -> done (todas as tarefas + tdd_phase entre green|refactor|done) | in-progress | blocked
blocked       -> previous_status (somente desbloqueio)
done          -> (terminal)
```

### Fonte sprint-status do BMAD v6

As stories vêm de `.bmad/sprint-status.yaml` (escrito por `/workflow:*` e `/project:backlog`) e dos arquivos markdown de `project-management/`. Quando uma story é acompanhada na YAML, a YAML prevalece para status, título, pontos, prioridade, responsável, epic, tarefas e sprint; o markdown mantém o conteúdo. O quadro é atualizado em tempo real quando qualquer uma das fontes muda. As stories de um sprint encerrado (`archived_sprints`) são somente leitura.

Se o quadro estiver vazio ou faltar uma story, o aviso de diagnóstico lista os arquivos ilegíveis; `GET /api/diagnostics` devolve a mesma lista. Veja a [solução de problemas](../../TROUBLESHOOTING.md#kanban-board-empty).

### Rotas HTTP

Leituras (`GET`): `/api/health` (`ok`, `readonly`, `user`, `wip_limits`), `/api/diagnostics`, `/api/stories`, `/api/stories/:id`, `/api/dependencies`, `/api/docs`, `/api/docs/<caminho>`, `/api/sprints`, `/api/sprints/:id`, `/api/sprints/current`, `/api/velocity`, `/api/events` (eventos do servidor).

Gravações:

| Rota | Função | Erros específicos |
|------|--------|-------------------|
| `PATCH /api/stories/:id/status` | Mover uma story (`status`, `blocked_reason?`, `reason?`) | 409 `invalid_transition`, `archived`, `read_only_source`, `conflict` |
| `PATCH /api/stories/:id` | Editar título, pontos, responsável, prioridade, fase TDD, epic, sprint (`null` = backlog), dependências | 400 `invalid_payload`; 409 `archived`, `sprint_not_found`, `conflict` |
| `PUT /api/stories/:id/body` | Substituir o corpo markdown (`markdown`, `expected_mtime`) | 409 `no_backing_file`, `conflict`; 422 `status_line_forbidden` |
| `POST /api/stories` | Criar uma story (`title`, `epic_id?`, `story_points?`, `priority?`, `persona?`, `sprint_id?`) | 409 `sprint_status_missing`, `sprint_status_invalid`, `sprint_not_found` |
| `DELETE /api/stories/:id[?force=1]` | Mover uma story para `.trash/` | 409 `story_active`, `has_dependents`, `archived` |
| `PATCH /api/stories/:id/tasks/:taskId` | Alterar o status de uma tarefa e/ou renomeá-la (`status?`, `title?`, pelo menos um; de 1 a 200 caracteres) | 400 `invalid_payload`; 404 `task_not_found`; 409 `task_exists` (nome de outra tarefa), `conflict` |
| `DELETE /api/stories/:id/tasks/:taskId` | Remover uma tarefa (`total` e `completed` são recalculados) | 404 `task_not_found`; 409 `conflict` |
| `POST /api/stories/:id/tasks` | Adicionar uma tarefa por fazer (`title`) | 409 `task_exists` |
| `POST /api/sprints` | Criar um sprint planejado | 409 `sprint_exists` |
| `POST /api/sprints/:id/start` | Iniciar um sprint | 409 `sprint_already_active`, `sprint_closed`, `conflict` |
| `POST /api/sprints/:id/close` | Encerrar um sprint (`carry_over`: `backlog` ou um identificador de sprint) | 409 `not_active`, `sprint_not_found`, `conflict` |
| `PUT /api/settings/wip` | Definir os limites WIP (status → 1..99 ou `null`) | 400 `invalid_payload` |

`:taskId` é o nome atual da tarefa, codificado para a URL (`encodeURIComponent`): nomes com `/`, `%`, `#`, espaços ou caracteres não ASCII são aceitos.

`POST /api/stories`, `POST /api/stories/:id/tasks` e `POST /api/sprints` aceitam um cabeçalho `Idempotency-Key` (string opaca de 8 a 128 caracteres ASCII visíveis; o board envia um `crypto.randomUUID()` novo a cada abertura de formulário). Uma segunda requisição na mesma rota com a mesma chave em 5 minutos recebe a resposta da primeira (mesmo status e corpo, mais `Idempotent-Replayed: true`) e não cria nada; requisições recusadas (status 400 ou superior) não são memorizadas, então uma nova tentativa é avaliada de novo. A memória é a do processo do servidor, limitada a 500 chaves. Uma chave malformada dá 400 `invalid_idempotency_key`.

Erros comuns a todas as gravações: 400 `invalid_json` / `invalid_payload`, 403 `forbidden` / `readonly`, 404 `not_found`, 413 `payload_too_large`, 423 `locked`, 500 `write_failed`. As alterações são enviadas aos navegadores abertos por `/api/events`.

### Atalhos de teclado (Board)

| Tecla | Ação |
|-------|------|
| `↑` `↓` | Navegar entre os cartões |
| `←` `→` | Mudar de coluna |
| `Alt+M` | Abrir o menu de movimentação do cartão em foco |
| `1`-`6` | Mover o cartão para essa coluna (menu aberto) |
| `Enter` | Abrir o detalhe da story |
| `Esc` | Fechar o menu ou a janela |
| `Ctrl+K` (`⌘+K`) ou `/` | Buscar stories |

Os atalhos são opcionais: todas as ações continuam acessíveis com `Tab` e os botões nativos.

### Exemplos

```bash
# Iniciar no projeto atual e abrir o navegador
npx @the-bearded-bear/claude-craft kanban --open

# Modo somente leitura
npx @the-bearded-bear/claude-craft kanban --readonly --port=4040
```

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
