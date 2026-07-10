# Guia do Usuário do AI Craft
# Framework de Desenvolvimento Multi-IA

## Índice

1. [Introdução](#introdução)
2. [Instalação](#instalação)
3. [Primeiros Passos](#primeiros-passos)
4. [Configuração de Provedores](#configuração-de-provedores)
5. [Servidores MCP](#servidores-mcp)
6. [Hooks](#hooks)
7. [Memória Compartilhada](#memória-compartilhada)
8. [Migração a partir do Claude Craft](#migração-a-partir-do-claude-craft)
9. [Referência de Comandos](#referência-de-comandos)
10. [Melhores Práticas](#melhores-práticas)
11. [Solução de Problemas](#solução-de-problemas)

---

## Introdução

O AI Craft é um framework abrangente de desenvolvimento multi-IA que estende a metodologia comprovada do Claude Craft para funcionar de forma transparente com múltiplos provedores de IA. Seja usando **Vibe (Mistral AI)**, **Codex (OpenAI)**, **OpenCode (sst/opencode)**, **Claude Code (Anthropic)** ou **Cursor CLI**, o AI Craft fornece uma interface unificada para instalar regras, agentes, comandos e fluxos de trabalho.

> **O GitHub Copilot não é suportado atualmente** — não existe um `copilot-provider.js` em `cli/lib/provider/`. O GitHub Copilot CLI (`github.com/github/copilot-cli`) é um produto real e distinto que poderia ser adicionado como um provedor futuro.

### Principais Recursos

- ✅ **Suporte Multi-Provedor**: Funciona com Vibe, Codex, OpenCode, Claude Code, Cursor e outros
- ✅ **Integração MCP**: Suporte completo ao Model Context Protocol com descoberta automática
- ✅ **Memória Compartilhada**: Histórico de conversas e contexto compartilhados entre provedores
- ✅ **Sistema de Hooks**: Hooks pré/pós comando e mensagem para cada provedor
- ✅ **Retrocompatível**: 100% compatível com projetos Claude Craft existentes
- ✅ **Migração Fácil**: Ferramenta de migração automática para projetos Claude Craft

### Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Craft CLI                                │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Vibe      │  │   Codex      │  │    OpenCode         │  │
│  │ (Mistral)   │  │ (OpenAI)     │  │ (sst/opencode)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │   Claude    │  │   Cursor     │                          │
│  │ (Anthropic) │  │ (CLI)        │                          │
│  └─────────────┘  └─────────────┘                          │
└─────────────────────────────────────────────────────────────┘
         │              │              │
         ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                 Memória Compartilhada & MCP                   │
├─────────────────────────────────────────────────────────────┤
│  • Histórico de Conversas                                      │
│  • Contexto do Projeto                                         │
│  • Preferências do Usuário                                     │
│  • Servidores MCP (filesystem, git, process, custom)           │
└─────────────────────────────────────────────────────────────┘
```

---

## Instalação

### Instalação Global

```bash
# Instalar o AI Craft globalmente
npm install -g @ai-craft/core

# Verificar a instalação
ai-craft --version
# Saída: 9.0.0
```

### Instalação Local (em um projeto)

```bash
# Inicializar o AI Craft no seu projeto
npx @ai-craft/core init-ai-craft

# Ou instalar em um diretório específico
npx @ai-craft/core install ./my-project
```

### A partir do Código-Fonte

```bash
# Clonar o repositório
git clone https://github.com/TheBeardedBearSAS/ai-craft.git
cd ai-craft

# Instalar as dependências
npm install

# Vincular globalmente
npm link

# Executar
ai-craft --version
```

---

## Primeiros Passos

### Início Rápido

```bash
# Navegar até o seu projeto
cd my-project

# Inicializar o AI Craft
ai-craft init-ai-craft

# Listar os provedores de IA disponíveis
ai-craft providers

# Definir o seu provedor preferido
ai-craft use vibe

# Instalar as regras para o seu stack técnico
ai-craft install --tech=symfony
```

### Estrutura do Projeto

Após a inicialização, o seu projeto terá a seguinte estrutura:

```
my-project/
├── .ai-craft/                    # Configuração do AI Craft
│   ├── AI-CRAFT.md              # Instruções principais de IA
│   ├── ai-craft.yaml            # Arquivo de configuração
│   ├── providers/               # Configurações específicas de cada provedor
│   │   ├── vibe/
│   │   │   ├── config/
│   │   │   │   └── default.yaml
│   │   │   ├── hooks/
│   │   │   │   ├── pre-execute.sh
│   │   │   │   └── post-execute.sh
│   │   │   └── mcp/
│   │   ├── codex/
│   │   ├── opencode/
│   │   ├── claude/
│   │   └── cursor/
│   ├── rules/                   # Regras de IA
│   ├── agents/                  # Agentes de IA
│   ├── commands/                # Comandos slash
│   ├── skills/                  # Skills da comunidade
│   ├── templates/               # Templates de projeto
│   ├── memory/                  # Memória compartilhada
│   │   ├── conversations/
│   │   ├── project-state.json
│   │   └── user-preferences.json
│   └── mcp/                     # Servidores MCP globais
└── .claude/                     # Link simbólico para .ai-craft/ (retrocompatível)
```

### Usando com Diferentes Provedores

```bash
# Listar todos os provedores disponíveis
ai-craft providers

# Mostrar o status de saúde dos provedores
ai-craft provider-status

# Definir o provedor padrão para este projeto
ai-craft use vibe

# Substituir o provedor para um único comando
ai-craft --provider=codex install ./my-project
```

---

## Configuração de Provedores

### Visualizando a Configuração

```bash
# Mostrar a configuração atual
ai-craft config show

# Obter um valor específico
ai-craft config show | grep primary
```

### Definindo a Configuração

```bash
# Definir o provedor padrão
ai-craft config set providers.primary vibe

# Definir o roteamento de modelos
ai-craft config set optimization.model_routing auto

# Definir as configurações de memória
ai-craft config set memory.enabled true
```

### Configuração Específica por Provedor

Cada provedor tem seu próprio arquivo de configuração em `.ai-craft/providers/<name>/config/default.yaml`:

**Exemplo de Configuração do Vibe:**
```yaml
provider:
  name: vibe
  display_name: "Vibe (Mistral AI)"
  binary: "vibe"

model:
  default: "mistral-large-3.5"
  aliases:
    opus: "mistral-large-3.5"
    sonnet: "mistral-medium-3.5"
    haiku: "mistral-small-3.5"

mcp:
  enabled: true
  servers:
    filesystem: true
    git: true
    process: true
```

**Alterando os Modelos do Provedor:**
```yaml
model:
  default: "mistral-large-3.5"
  routing:
    architecture: "mistral-large-3.5"
    code_review: "mistral-medium-3.5"
    implementation: "mistral-medium-3.5"
    quick: "mistral-small-3.5"
```

---

## Servidores MCP

### O que é o MCP?

O MCP (Model Context Protocol) é um padrão para conectar modelos de IA a ferramentas, APIs e fontes de dados. O AI Craft suporta servidores MCP em todos os provedores, permitindo um acesso consistente às ferramentas independentemente da IA que você usa.

### Servidores MCP Integrados

Cada provedor vem com servidores MCP integrados:

| Servidor | Descrição | Vibe | Codex | OpenCode | Claude | Cursor |
|--------|-------------|------|-------|----------|--------|--------|
| filesystem | Acesso ao sistema de arquivos | ✅ | ✅ | ✅ | ✅ | ✅ |
| git | Acesso ao repositório Git | ✅ | ✅ | ✅ | ✅ | ✅ |
| process | Execução de processos | ✅ | ❌ | ✅ | ❌ | ❌ |

### Gerenciando Servidores MCP

```bash
# Listar todos os servidores MCP do provedor atual
ai-craft mcp list

# Adicionar um servidor MCP personalizado
ai-craft mcp add my-server --command="npx" --args="-y,@modelcontextprotocol/server-postgres" --description="PostgreSQL access"

# Iniciar todos os servidores MCP
ai-craft mcp start
```

### Configuração de Servidor MCP Personalizado

Crie um arquivo JSON em `.ai-craft/providers/<name>/mcp/` ou `.ai-craft/mcp/`:

```json
{
  "name": "postgres",
  "description": "PostgreSQL database access",
  "command": "npx",
  "args": ["-y", "@modelcontextprotocol/server-postgres"],
  "env": {
    "DATABASE_URL": "postgresql://user:password@localhost:5432/db"
  },
  "timeout": 30,
  "enabled": true,
  "auto_start": true
}
```

### Servidores MCP Comuns

- `@modelcontextprotocol/server-filesystem` - Acesso ao sistema de arquivos
- `@modelcontextprotocol/server-git` - Acesso ao repositório Git
- `@modelcontextprotocol/server-process` - Execução de processos
- `@modelcontextprotocol/server-sqlite` - Acesso a banco de dados SQLite
- `@modelcontextprotocol/server-postgres` - Acesso ao PostgreSQL

---

## Hooks

Os hooks permitem executar scripts personalizados antes e depois dos comandos de IA. Eles são úteis para:

- Validação de ambiente
- Registro de logs
- Pré-processamento personalizado
- Pós-processamento de respostas
- Tratamento de erros

### Tipos de Hooks

1. **pre-execute.sh** - Executa antes de qualquer execução de comando
2. **post-execute.sh** - Executa após a execução do comando
3. **pre-message.sh** - Executa antes de enviar uma mensagem
4. **post-message.sh** - Executa após receber uma resposta

### Localização dos Hooks

Os hooks estão localizados em `.ai-craft/providers/<name>/hooks/`:

```
.ai-craft/
└── providers/
    └── vibe/
        └── hooks/
            ├── pre-execute.sh
            └── post-execute.sh
```

### Exemplo de Hook: pre-execute.sh

```bash
#!/bin/bash
# AI Craft - Vibe Provider Pre-Execute Hook

# Check if API key is set
if [[ -z "${MISTRAL_API_KEY:-}" ]]; then
  echo "⚠️  MISTRAL_API_KEY not set" >&2
  exit 1
fi

# Set system prompt from AI-CRAFT.md
if [[ -f ".ai-craft/AI-CRAFT.md" ]]; then
  export VIBE_SYSTEM_PROMPT="$(cat .ai-craft/AI-CRAFT.md)"
fi

exit 0
```

### Criando Hooks Personalizados

1. Crie um diretório de hooks:
```bash
mkdir -p .ai-craft/providers/vibe/hooks
```

2. Crie o seu script de hook:
```bash
cat > .ai-craft/providers/vibe/hooks/pre-execute.sh << 'EOF'
#!/bin/bash
# My custom pre-execute hook
echo "Running custom pre-execute hook..."
# Add your custom logic here
exit 0
EOF
chmod +x .ai-craft/providers/vibe/hooks/pre-execute.sh
```

3. Ative o hook na configuração:
```yaml
# In .ai-craft/providers/vibe/config/default.yaml
hooks:
  enabled: true
  pre_command:
    - "pre-execute.sh"
    - "custom-pre-execute.sh"
  post_command:
    - "post-execute.sh"
```

---

## Memória Compartilhada

O AI Craft fornece um sistema de memória compartilhada que permite que diferentes provedores compartilhem:

- **Conversas**: Histórico de mensagens entre provedores
- **Contexto do Projeto**: Informações compartilhadas do projeto
- **Preferências do Usuário**: Configurações específicas do usuário
- **Cache**: Armazenamento temporário de dados

### Usando a Memória Compartilhada

```bash
# A memória fica automaticamente disponível através da CLI do AI Craft
# Você pode acessá-la programaticamente nos seus scripts
```

### Acesso Programático

```javascript
import { memoryManager } from '@ai-craft/core/cli/lib/memory.js';

// Get or create a conversation
const conversation = memoryManager.getConversation('session-1', {
  provider: 'vibe',
  model: 'mistral-large-3.5'
});

// Add messages
memoryManager.addMessage('session-1', {
  role: 'user',
  content: 'Hello!'
});

// Get conversation history
const history = memoryManager.getHistory('session-1', 10);

// Set user preferences
memoryManager.setPreference('theme', 'dark');
const theme = memoryManager.getPreference('theme');

// Use cache
memoryManager.setCache('temp-data', { foo: 'bar' }, 60000); // 60s TTL
const data = memoryManager.getCache('temp-data');
```

### Estrutura da Memória

```
.ai-craft/memory/
├── conversations/           # Histórico de conversas (arquivos JSON)
│   ├── session-1.json
│   └── session-2.json
├── project-state.json      # Contexto e estado do projeto
└── user-preferences.json   # Preferências do usuário
```

---

## Migração a partir do Claude Craft

O AI Craft oferece uma migração transparente a partir de projetos Claude Craft.

### Migração Automática

```bash
# Navegar até o seu projeto Claude Craft
cd my-claude-craft-project

# Executar a migração
npx @ai-craft/core migrate

# Ou usar o comando init
npx @ai-craft/core init-ai-craft
```

### O que é Migrado

| Componente | Status da Migração | Notas |
|-----------|-----------------|-------|
| `.claude/CLAUDE.md` | ✅ Migrado | → `.ai-craft/AI-CRAFT.md` |
| `.claude/settings.json` | ✅ Migrado | Configurações adaptadas para multi-provedor |
| `.claude/context.yaml` | ✅ Migrado | → `.ai-craft/ai-craft.yaml` |
| `.claude/rules/` | ✅ Migrado | Copiado para `.ai-craft/rules/` |
| `.claude/agents/` | ✅ Migrado | Copiado para `.ai-craft/agents/` |
| `.claude/commands/` | ✅ Migrado | Copiado para `.ai-craft/commands/` |
| `.claude/skills/` | ✅ Migrado | Copiado para `.ai-craft/skills/` |
| `.claude/templates/` | ✅ Migrado | Copiado para `.ai-craft/templates/` |
| `.claude/mcp/` | ✅ Migrado | Copiado para `.ai-craft/mcp/` |
| Link simbólico `.claude/` | ✅ Criado | Aponta para `.ai-craft/` para retrocompatibilidade |

### Etapas de Migração Manual

Se preferir migrar manualmente:

1. Crie o diretório `.ai-craft/`
2. Copie todos os arquivos de `.claude/` para `.ai-craft/`
3. Renomeie `CLAUDE.md` para `AI-CRAFT.md`
4. Atualize as referências de `.claude/` para `.ai-craft/`
5. Crie os diretórios específicos de cada provedor
6. Crie o link simbólico: `ln -s .ai-craft .claude`

### Pós-Migração

Após a migração, você pode:

```bash
# Verificar a migração
ai-craft doctor

# Definir o seu provedor preferido
ai-craft use vibe

# Verificar o status do provedor
ai-craft provider-status

# Começar a usar o AI Craft
npx @ai-craft/core install --tech=symfony
```

---

## Referência de Comandos

### Comandos Principais

| Comando | Descrição |
|---------|-------------|
| `ai-craft --version` | Mostra a versão |
| `ai-craft --help` | Mostra a ajuda |
| `ai-craft install` | Instalação interativa |
| `ai-craft install <path>` | Instala em um diretório específico |
| `ai-craft install --auto` | Instalação automática (sem perguntas) |
| `ai-craft install --tech=<name>` | Instala para uma tecnologia específica |
| `ai-craft init-ai-craft` | Inicializa o AI Craft |

### Comandos de Provedores

| Comando | Descrição |
|---------|-------------|
| `ai-craft providers` | Lista todos os provedores |
| `ai-craft provider-status` | Mostra a saúde do provedor |
| `ai-craft use <provider>` | Define o provedor padrão |
| `ai-craft --provider=<name> <cmd>` | Substitui o provedor para o comando |

### Comandos MCP

| Comando | Descrição |
|---------|-------------|
| `ai-craft mcp list` | Lista os servidores MCP |
| `ai-craft mcp add <name> [options]` | Adiciona um servidor MCP personalizado |
| `ai-craft mcp start` | Inicia os servidores MCP |

### Comandos de Configuração

| Comando | Descrição |
|---------|-------------|
| `ai-craft config show` | Mostra a configuração |
| `ai-craft config set <key> <value>` | Define um valor de configuração |
| `ai-craft config edit` | Edita a configuração no editor |

### Comandos de Migração

| Comando | Descrição |
|---------|-------------|
| `ai-craft migrate` | Migra um projeto Claude Craft |
| `ai-craft migrate <path>` | Migra o projeto no caminho indicado |

### Comandos Legados (Retrocompatíveis)

Todos os comandos do Claude Craft continuam funcionando:

| Comando | Descrição |
|---------|-------------|
| `claude-craft install` | O mesmo que `ai-craft install` |
| `claude-craft --version` | O mesmo que `ai-craft --version` |
| Todos os comandos `/workflow:*` | Continuam funcionando |
| Todos os comandos `/common:*` | Continuam funcionando |

### Opções de Comando de Servidor MCP

| Opção | Descrição | Exemplo |
|--------|-------------|---------|
| `--command=<cmd>` | Comando a executar | `--command=npx` |
| `--args=<args>` | Argumentos separados por vírgula | `--args="-y,@modelcontextprotocol/server-postgres"` |
| `--description=<desc>` | Descrição do servidor | `--description="PostgreSQL access"` |
| `--timeout=<seconds>` | Tempo limite em segundos | `--timeout=30` |

### Chaves de Configuração

Você pode definir qualquer chave de configuração usando a notação de ponto:

```bash
# Set primary provider
ai-craft config set providers.primary vibe

# Set fallback providers
ai-craft config set providers.fallback[0] codex

# Set memory settings
ai-craft config set memory.enabled true

# Set optimization settings
ai-craft config set optimization.prompt_caching true
```

---

## Melhores Práticas

### 1. Comece Pequeno

Comece com a configuração padrão e adicione personalizações de forma incremental.

### 2. Use Configurações Específicas por Provedor

Cada provedor tem pontos fortes diferentes. Configure-os adequadamente:

- **Vibe**: Ótimo para tarefas de codificação, use com modelos Mistral
- **Codex**: Agente de codificação em terminal da OpenAI, integração profunda com o GitHub
- **OpenCode**: Mais de 75 provedores de modelos em nuvem via Models.dev, backend auto-hospedado opcional
- **Claude Code**: Confiabilidade comprovada, excelente para tarefas complexas
- **Cursor CLI**: Agente de terminal autônomo completo, scriptável em CI/SSH

### 3. Ative os Servidores MCP de Forma Incremental

Comece com os servidores MCP integrados (filesystem, git) e adicione servidores personalizados conforme necessário.

### 4. Use Hooks para Validação

Crie hooks pre-execute para validar o seu ambiente antes de executar comandos de IA.

### 5. Compartilhe o Contexto Entre Provedores

Use o sistema de memória compartilhada para manter o contexto ao alternar entre provedores.

### 6. Mantenha a Configuração sob Controle de Versão

Faça commit do seu `.ai-craft/ai-craft.yaml` e das configurações de provedores no controle de versão, mas exclua:

```
.ai-craft/memory/
.ai-craft/logs/
.ai-craft/mcp/*.json  # If they contain API keys
```

### 7. Atualize Regularmente

O AI Craft é desenvolvido ativamente. Atualize regularmente:

```bash
npm update -g @ai-craft/core
```

---

## Solução de Problemas

### Problemas Comuns

#### "Provider not found"

```bash
# Check installed providers
ai-craft providers

# Install missing provider
# For Vibe: npm install -g @vibe/cli
# For Codex: npm install -g @openai/codex
# For OpenCode: npm install -g opencode-ai
# For Claude Code: Follow Anthropic instructions
# For Cursor: curl https://cursor.com/install -fsS | bash
```

#### "MCP server not starting"

```bash
# MCP auto-start is not yet implemented (startAllMCPServers() is a stub
# that registers servers without spawning a process) - there is no
# .ai-craft/logs/mcp.log to check. Start servers manually for now, see
# .ai-craft/providers/MCP-README.md.

# Test server manually
npx @modelcontextprotocol/server-filesystem --help

# Check permissions
ls -la .ai-craft/providers/*/mcp/
chmod +x .ai-craft/providers/*/mcp/*.json
```

#### "Hook failed"

```bash
# Check hook logs
tail -f .ai-craft/logs/*-hooks.log

# Test hook manually
bash .ai-craft/providers/vibe/hooks/pre-execute.sh

# Fix permissions
chmod +x .ai-craft/providers/*/hooks/*.sh
```

#### "Memory not persisting"

```bash
# Check memory directory exists
ls -la .ai-craft/memory/

# Check permissions
chmod -R 755 .ai-craft/memory/
```

### Modo Debug

Ative o registro de logs de depuração:

```bash
DEBUG=ai-craft* ai-craft providers
```

### Reiniciando o AI Craft

```bash
# Remove AI Craft directory
rm -rf .ai-craft/

# Reinitialize
npx @ai-craft/core init-ai-craft
```

### Verificando o Ambiente

```bash
# Check Node.js version (requires >= 22.0.0)
node --version

# Check npm version
npm --version

# Check AI Craft version
ai-craft --version
```

---

## Suporte

- **Documentação**: [https://github.com/TheBeardedBearSAS/ai-craft](https://github.com/TheBeardedBearSAS/ai-craft)
- **Issues**: [GitHub Issues](https://github.com/TheBeardedBearSAS/ai-craft/issues)
- **Discussões**: [GitHub Discussions](https://github.com/TheBeardedBearSAS/ai-craft/discussions)
- **Claude Craft Original**: [https://github.com/TheBeardedBearSAS/claude-craft](https://github.com/TheBeardedBearSAS/claude-craft)

---

*AI Craft - Framework de Desenvolvimento Multi-IA | Versão 9.0.0 | © 2026 TheBeardedCTO*
