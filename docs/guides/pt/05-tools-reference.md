# Guia de Referência de Ferramentas

Este guia cobre as ferramentas utilitárias incluídas no Claude-Craft para gerenciar perfis, exibição de status, configuração de projetos e comandos e funcionalidades do Claude Code (v8.7).

---

## Índice

1. [Comandos do Claude Code](#comandos-do-claude-code)
2. [Eventos de Hook](#eventos-de-hook)
3. [Frontmatter de Agentes](#frontmatter-de-agentes)
4. [Pesquisa de Ferramentas MCP](#pesquisa-de-ferramentas-mcp)
5. [Modo Automático](#modo-automático)
6. [Templates de Hook](#templates-de-hook)
7. [Configurações Gerenciadas](#configurações-gerenciadas)
8. [Gerenciador MultiConta](#gerenciador-multiconta)
9. [StatusLine](#statusline)
10. [Gerenciador ProjectConfig](#gerenciador-projectconfig)
11. [Instalação](#instalação)

---

## Comandos do Claude Code

O Claude Code fornece comandos integrados para gerenciamento de contexto e sessão. Esses comandos estão disponíveis em qualquer sessão do Claude Code (v2.1.47+).

### Comandos de Gerenciamento de Contexto

| Comando | Versão | Descrição |
|---------|--------|-----------|
| `/clear` | Todos | Limpa o contexto entre tarefas não relacionadas |
| `/compact` | Todos | Compacta o contexto proativamente (executar em ~70% de uso) |
| `/context` | v2.1.74+ | Obtém sugestões acionáveis para otimização de contexto |
| `/effort low\|medium\|high` | v2.1.72+ | Ajusta o esforço de raciocínio do modelo por complexidade da tarefa |
| `/memory` | v2.1.59+ | Salva aprendizados persistentes entre sessões e compactações |
| `/model haiku\|sonnet\|opus` | v2.1.72+ | Alterna o modelo durante a sessão com base na complexidade da tarefa |

### Comandos de Sessão

| Comando | Versão | Descrição |
|---------|--------|-----------|
| `/loop [interval] [command]` | v2.1.71+ | Executa tarefas recorrentes (ex.: `/loop 5m /common:pre-commit-check`) |
| `/proactive` | v2.1.105+ | Alias para `/loop` |
| `/color` | v2.1.94+ | Altera o esquema de cores do terminal |
| `/rename` | v2.1.94+ | Renomeia a sessão atual |
| `/powerup` | v2.1.94+ | Ativa funcionalidades avançadas |

### Exemplos de Uso

```bash
# Ajustar esforço para uma consulta simples
/effort low

# Alternar para um modelo mais econômico para exploração
/model sonnet

# Configurar monitoramento recorrente de CI
/loop 5m "Check if CI pipeline passed"

# Salvar contexto importante antes da compactação
/memory "Authentication uses JWT with RS256, refresh tokens in HttpOnly cookies"
```

---

## Eventos de Hook

O Claude Code suporta 24 eventos de hook (8 adicionados nas versões recentes do Claude Code) para automatizar fluxos de trabalho:

### Todos os Eventos de Hook

| Evento | Momento | Caso de Uso |
|--------|---------|-------------|
| **PreToolUse** | Antes da execução da ferramenta | Bloquear comandos perigosos, reescrever com RTK |
| **PostToolUse** | Após a execução da ferramenta | Filtrar saída verbosa, resumir resultados |
| **PreCompact** | Antes da compactação de contexto | Salvar contexto crítico; código de saída 2 bloqueia a compactação (v2.1.105+) |
| **PostCompact** | Após a compactação de contexto | Reinjetar contexto essencial |
| **SessionStart** | No início da sessão | Carregar essenciais de contexto, configurar ambiente |
| **StopFailure** | Em parada inesperada | Salvar estado, alertar sobre falhas |
| **Notification** | Em eventos de notificação | Alertas customizados |
| **TaskCreated** | Quando tarefa de subagente é criada | Rastrear trabalho de subagente |
| **CwdChanged** | Mudança de diretório de trabalho | Atualizar ambiente por diretório |
| **FileChanged** | Modificação de arquivo detectada | Disparar rebuilds, linting |
| **PermissionDenied** | Falha na verificação de permissão | Registrar eventos de segurança |
| **Elicitation** | Antes do prompt do usuário | Personalizar fluxo de elicitação |
| **ElicitationResult** | Após resposta do usuário | Processar resultados de elicitação |
| **Stop** | No encerramento da sessão | Limpeza |

### Melhorias de Hook (v8.7)

| Funcionalidade | Descrição |
|----------------|-----------|
| **`if` condicional** | Executar hooks apenas quando a condição corresponder |
| **`defer`** | Adiar execução do hook para não bloquear |
| **Bloqueio de PreCompact** | Código de saída 2 no hook PreCompact bloqueia a compactação (v2.1.105+) |

### Exemplo: Filtro de Saída PostToolUse

```json
{
  "hooks": {
    "PostToolUse": [{
      "matcher": "Bash",
      "hooks": [{
        "type": "command",
        "command": "echo '$TOOL_OUTPUT' | head -100"
      }]
    }]
  }
}
```

---

## Frontmatter de Agentes

Agentes customizados (v2.1.78+) suportam campos de frontmatter para controlar comportamento e custo:

```yaml
---
effort: low          # Esforço de raciocínio (low/medium/high)
maxTurns: 10         # Número máximo de turnos de conversa
disallowedTools:     # Ferramentas que o agente não pode usar
  - Edit
  - Write
---
```

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `effort` | string | Esforço de raciocínio `low`, `medium` ou `high` |
| `maxTurns` | número | Número máximo de turnos antes de parar |
| `disallowedTools` | lista | Ferramentas que o agente não tem permissão de usar |

Isso é útil para criar agentes de exploração econômicos que podem ler, mas não modificar o código.

---

## Pesquisa de Ferramentas MCP

A Pesquisa de Ferramentas MCP (v2.1.80+) permite o carregamento preguiçoso (lazy loading) de ferramentas MCP, reduzindo o consumo de contexto em 95%:

| Abordagem | Custo de Contexto |
|-----------|-------------------|
| MCP clássico (todas as ferramentas carregadas) | ~500-2000 tokens/ferramenta/turno |
| MCP com Pesquisa de Ferramentas (lazy) | ~50 tokens no total |

### Uso

```bash
# Carregar uma ferramenta específica sob demanda
ToolSearch with query: "select:tool_name"

# Pesquisar por palavra-chave
ToolSearch with query: "slack send"
```

Em vez de carregar todas as ferramentas do servidor MCP na inicialização, a Pesquisa de Ferramentas as carrega apenas quando necessário.

---

## Modo Automático

O Modo Automático (v2.1.94+) é um classificador de permissões baseado em IA que substitui `--dangerously-skip-permissions` de forma mais segura:

| Modo | Proteção | Velocidade | Caso de Uso |
|------|----------|-----------|-------------|
| Manual | Máxima | Lenta | Fluxos auditados, alta segurança |
| Modo Automático | Alta | Rápida | Fluxos de desenvolvimento confiáveis |
| Pular Permissões | Mínima | Máxima | Somente projetos locais/pessoais |

**Funcionalidades de segurança:**
- Um modelo de segurança em segundo plano avalia cada chamada de ferramenta
- Operações seguras (leituras, testes) são aprovadas automaticamente
- Ações arriscadas (exclusão em massa, exfiltração) são bloqueadas
- 3 bloqueios consecutivos revertem para o modo manual
- 20+ bloqueios em uma sessão revertem para o modo manual completo

Disponível para planos Team com aprovação do administrador.

---

## Templates de Hook

O Claude-Craft fornece templates de hook prontos para uso em `.claude/templates/hooks/`:

| Template | Finalidade |
|----------|-----------|
| `output-filter.json` | Filtro PostToolUse para saídas grandes de CLI |
| `pre-compact.json` | Hook PreCompact para preservar contexto crítico |
| `context-reinject.json` | Hook SessionStart para reinjeção de contexto após compactação |

### Instalação

Copie os templates para o `.claude/settings.json` do seu projeto ou mescle na sua configuração de hooks:

```bash
# Ver templates disponíveis
ls .claude/templates/hooks/

# Aplicar ao seu projeto (mesclar manualmente no settings.json)
cat .claude/templates/hooks/output-filter.json
```

---

## Configurações Gerenciadas

O diretório `managed-settings.d/` (v2.1.83+) permite configuração modular via mesclagem alfabética:

```
.claude/
  managed-settings.d/
    00-base.json          # Configuração base
    10-security.json      # Regras de segurança
    20-team.json          # Preferências da equipe
```

Os arquivos são mesclados em ordem alfabética, permitindo que as equipes componham configurações em camadas sem conflitos.

---

## Gerenciador MultiConta

Gerencie múltiplos perfis do Claude Code para diferentes contas ou contextos.

### Finalidade

- Alternar entre contas Claude (pessoal, trabalho, cliente)
- Gerenciar limites de uso alternando perfis
- Manter contextos de projeto isolados
- Compartilhar ou isolar configurações

### Instalação

```bash
# Via Makefile
make install-multiaccount

# Ou manualmente
cp Tools/MultiAccount/claude-accounts.sh ~/.local/bin/
chmod +x ~/.local/bin/claude-accounts.sh
```

### Uso

#### Modo Interativo

```bash
# Iniciar menu interativo
./claude-accounts.sh
# Ou se instalado globalmente
claude-accounts.sh
```

Opções do menu:
```
1. List profiles
2. Add a profile
3. Delete a profile
4. Authenticate a profile
5. Launch Claude Code
6. Install ccsp() function
7. Migrate legacy profile
8. Help
9. Exit
```

#### Modo CLI

```bash
# Listar todos os perfis
./claude-accounts.sh list

# Adicionar novo perfil
./claude-accounts.sh add <profile-name>

# Remover perfil
./claude-accounts.sh remove <profile-name>

# Autenticar perfil
./claude-accounts.sh auth <profile-name>

# Iniciar Claude Code com perfil
./claude-accounts.sh launch <profile-name>

# Exibir ajuda
./claude-accounts.sh --help
```

### Modos de Perfil

#### Modo Compartilhado (Padrão)

O perfil compartilha configuração com o `~/.claude` principal:

```bash
./claude-accounts.sh add work --mode=shared
```

- Configurações vinculadas simbolicamente a `~/.claude`
- Indicado para: alternar entre contas mantendo as configurações
- Caso de uso: gerenciamento de limites de uso

#### Modo Isolado

O perfil possui configuração completamente independente:

```bash
./claude-accounts.sh add client-a --mode=isolated
```

- Cópia independente das configurações
- Indicado para: trabalho com clientes com regras separadas
- Caso de uso: configurações de projeto distintas

### Troca Rápida de Perfil

Instale a função shell `ccsp()`:

```bash
# Adicionar via opção 6 do menu
# Ou adicionar manualmente a ~/.bashrc ou ~/.zshrc:

ccsp() {
    if [ -z "$1" ]; then
        claude-accounts.sh list
    else
        export CLAUDE_CONFIG_DIR="$HOME/.claude-profiles/$1"
        echo "Switched to profile: $1"
    fi
}
```

Uso:
```bash
# Listar perfis
ccsp

# Alternar para um perfil
ccsp work

# Iniciar Claude Code (usa o perfil atual)
claude
```

### Estrutura de Perfis

```
~/.claude-profiles/
├── work/
│   ├── .mode              # "shared" ou "isolated"
│   ├── config/            # Configuração do Claude
│   └── settings.json      # Configurações do perfil
├── client-a/
│   └── ...
└── personal/
    └── ...
```

### Suporte a Idiomas

```bash
# Usar em idioma específico
./claude-accounts.sh --lang=fr list
./claude-accounts.sh --lang=es add trabajo
./claude-accounts.sh --lang=de --help
```

---

## StatusLine

Exibe informações contextuais na barra de status do Claude Code.

### Finalidade

- Mostrar o perfil atual
- Exibir o modelo em uso
- Mostrar branch e status do Git
- Rastrear percentual de uso do contexto
- Monitorar custos da sessão e semanais
- Exibir limites de uso

### Instalação

```bash
# Via Makefile
make install-statusline

# Ou manualmente
cp Tools/StatusLine/statusline.sh ~/.claude/statusline.sh
cp Tools/StatusLine/statusline.conf.example ~/.claude/statusline.conf
chmod +x ~/.claude/statusline.sh
```

### Configurar o Claude Code

Adicione ao `~/.claude/settings.json`:

```json
{
  "statusLine": {
    "type": "command",
    "command": "~/.claude/statusline.sh"
  }
}
```

### Formato da Linha de Status

```
🔑 pro | 🧠 Opus | 🌿 main +2~1 | 📁 my-project | 📊 45% | ⏱️ 5h: 23% | 📅 Sem: 45% | 💰 $0.42 | 🕐 14:32
```

| Elemento | Descrição |
|----------|-----------|
| 🔑 pro | Nome do perfil ativo |
| 🧠 Opus | Modelo atual (🧠 Opus, 🎵 Sonnet, 🍃 Haiku) |
| 🌿 main +2~1 | Branch Git + status (+staged ~modificados ?não rastreados) |
| 📁 my-project | Nome do diretório do projeto |
| 📊 45% | Uso da janela de contexto |
| ⏱️ 5h: 23% | Percentual de uso da sessão (5h) |
| 📅 Sem: 45% | Percentual de uso semanal |
| 💰 $0.42 | Custo da sessão |
| 🕐 14:32 | Hora atual |

### Codificação de Cores

Os indicadores de uso mudam de cor com base em limites:

| Cor | Significado | Limite |
|-----|-------------|--------|
| Verde | Uso baixo | < 60% |
| Amarelo | Uso moderado | 60-80% |
| Vermelho | Uso alto | > 80% |

### Configuração

Edite `~/.claude/statusline.conf`:

```bash
# =============================================================================
# LIMITES DE USO
# =============================================================================
# Valores recomendados por plano:
#   - Pro ($20/mês)      : SESSION=25,   WEEKLY=150
#   - Max 5x ($100/mês)  : SESSION=125,  WEEKLY=750
#   - Max 20x ($200/mês) : SESSION=500,  WEEKLY=3000

SESSION_COST_LIMIT=500.00
WEEKLY_COST_LIMIT=3000.00

# =============================================================================
# LIMITES DE ALERTA (percentual)
# =============================================================================
USAGE_WARN_THRESHOLD=60    # Amarelo em 60%
USAGE_CRIT_THRESHOLD=80    # Vermelho em 80%

# =============================================================================
# CACHE (desempenho)
# =============================================================================
SESSION_CACHE_TTL=60       # Atualização da sessão a cada 60s
WEEKLY_CACHE_TTL=300       # Atualização semanal a cada 5min

# =============================================================================
# OPÇÕES DE EXIBIÇÃO
# =============================================================================
SHOW_SESSION_LIMIT=true
SHOW_WEEKLY_LIMIT=true

# Rótulos personalizados
SESSION_LABEL="⏱️ 5h"
WEEKLY_LABEL="📅 Sem"
```

### Dependências

```bash
# Obrigatório: jq (processador JSON)
# macOS
brew install jq

# Linux
sudo apt install jq

# Opcional: ccusage (rastreamento de custos)
npm install -g ccusage
```

### Solução de Problemas

**Linha de status não aparece:**
```bash
# Verificar se o script é executável
ls -la ~/.claude/statusline.sh

# Testar manualmente
echo '{"model":{"display_name":"Test"}}' | ~/.claude/statusline.sh
```

**Custo mostra $0.00:**
```bash
# Verificar se ccusage funciona
npx ccusage daily --json
```

**Percentuais de uso não aparecem:**
```bash
# Verificar arquivos de cache
ls -la /tmp/.ccusage_*

# Limpar cache para atualizar
rm /tmp/.ccusage_*
```

---

## Gerenciador ProjectConfig

Gerencie configurações de projetos do Claude-Craft via YAML.

### Finalidade

- Definir configurações de projeto em YAML
- Gerenciar múltiplos projetos
- Lidar com configurações de monorepo
- Validar configurações
- Instalar regras a partir da configuração

### Instalação

```bash
# Via Makefile
make install-projectconfig

# Ou manualmente
cp Tools/ProjectConfig/claude-projects.sh ~/.local/bin/
chmod +x ~/.local/bin/claude-projects.sh
```

### Dependências

```bash
# Obrigatório: yq (processador YAML)
# macOS
brew install yq

# Linux (snap)
sudo snap install yq

# Linux (binário)
wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
chmod +x /usr/local/bin/yq
```

### Uso

#### Modo Interativo

```bash
./claude-projects.sh
```

Opções do menu:
```
1. List projects
2. Add a project
3. Edit a project
4. Add a module
5. Delete a project
6. Validate configuration
7. Install project
8. Help
9. Exit
```

#### Modo CLI

```bash
# Listar projetos configurados
./claude-projects.sh list

# Validar arquivo de configuração
./claude-projects.sh validate [config-file]

# Instalar projeto específico
./claude-projects.sh install <project-name>

# Instalar todos os projetos
./claude-projects.sh install-all

# Exibir detalhes do projeto
./claude-projects.sh show <project-name>

# Adicionar novo projeto
./claude-projects.sh add <project-name> <path>

# Remover projeto
./claude-projects.sh remove <project-name>
```

### Arquivo de Configuração

Localização padrão: `./claude-projects.yaml`

```yaml
settings:
  default_lang: "fr"

projects:
  - name: "my-saas"
    description: "SaaS platform"
    path: "~/Projects/my-saas"
    modules:
      - name: "api"
        path: "backend"
        technologies: ["symfony"]
      - name: "web"
        path: "frontend"
        technologies: ["react"]
      - name: "mobile"
        path: "app"
        technologies: ["flutter"]

  - name: "internal-tool"
    path: "~/Projects/internal"
    technologies: ["python"]
    lang: "en"
```

### Validação

```bash
# Validar configuração
./claude-projects.sh validate

# Ou via Makefile
make config-validate CONFIG=claude-projects.yaml
```

Verificações de validação:
- Sintaxe YAML válida
- Campos obrigatórios presentes
- Caminhos existem
- Tecnologias válidas
- Idiomas válidos

### Instalação a partir da Configuração

```bash
# Instalar projeto único
./claude-projects.sh install my-saas

# Ou via Makefile
make config-install CONFIG=claude-projects.yaml PROJECT=my-saas

# Instalar todos os projetos
make config-install-all CONFIG=claude-projects.yaml

# Simulação (dry run)
make config-install CONFIG=claude-projects.yaml PROJECT=my-saas OPTIONS="--dry-run"
```

### Suporte a Idiomas

```bash
# Usar em idioma específico
./claude-projects.sh --lang=fr list
./claude-projects.sh --lang=de validate
```

---

## Instalação

### Instalar Todas as Ferramentas

```bash
make install-tools
```

Isso instala:
- Gerenciador MultiConta
- StatusLine
- Gerenciador ProjectConfig

### Instalar Ferramentas Individualmente

```bash
# Apenas MultiConta
make install-multiaccount

# Apenas StatusLine
make install-statusline

# Apenas ProjectConfig
make install-projectconfig
```

### Verificar Instalação

```bash
# Verificar MultiConta
which claude-accounts.sh
claude-accounts.sh --version

# Verificar StatusLine
ls ~/.claude/statusline.sh
cat ~/.claude/settings.json | jq '.statusLine'

# Verificar ProjectConfig
which claude-projects.sh
claude-projects.sh --version
```

---

## Referência Rápida

### Comandos MultiConta

| Comando | Descrição |
|---------|-----------|
| `list` | Mostrar todos os perfis |
| `add <name>` | Criar novo perfil |
| `remove <name>` | Excluir perfil |
| `auth <name>` | Autenticar perfil |
| `launch <name>` | Iniciar Claude com o perfil |
| `migrate` | Converter perfil legado |

### Elementos da StatusLine

| Emoji | Significado |
|-------|-------------|
| 🔑 | Perfil |
| 🧠 | Modelo Opus |
| 🎵 | Modelo Sonnet |
| 🍃 | Modelo Haiku |
| 🌿 | Branch Git |
| 📁 | Projeto |
| 📊 | % de Contexto |
| ⏱️ | Uso da sessão |
| 📅 | Uso semanal |
| 💰 | Custo |
| 🕐 | Hora |

### Comandos ProjectConfig

| Comando | Descrição |
|---------|-----------|
| `list` | Mostrar todos os projetos |
| `validate` | Verificar validade da configuração |
| `install <name>` | Instalar regras do projeto |
| `install-all` | Instalar todos os projetos |
| `show <name>` | Mostrar detalhes do projeto |
| `add <name> <path>` | Adicionar novo projeto |
| `remove <name>` | Excluir projeto |

---

[&larr; Correção de Bugs](04-bug-fixing.md) | [Solução de Problemas &rarr;](06-troubleshooting.md)
