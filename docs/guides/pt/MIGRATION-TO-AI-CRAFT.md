# 🚀 Guia de Migração: Claude Craft → AI Craft

**Versão:** 9.0.0
**Status:** Trabalho em Andamento
**Branch:** `refactor/ai-craft`
**Última Atualização:** 2026-07-10

---

## 📌 Visão Geral

Este documento descreve o caminho de migração do **Claude Craft** (provedor único, apenas Claude Code) para o **AI Craft** (multi-provedor, com suporte a Vibe, Codex, OpenCode, Claude Code, Cursor e GitHub Copilot).

### Status Atual

| Componente | Status | Detalhes |
|-----------|--------|---------|
| **Arquitetura Principal** | ✅ Completo | AI Provider Manager implementado |
| **Integrações de Provedores** | ✅ 80% Completo | Vibe, Codex, OpenCode, Claude, Cursor |
| **Configuração** | ✅ Completo | ai-craft.yaml, AI-CRAFT.md |
| **Documentação** | ✅ 70% Completo | README, AI-CRAFT.md atualizados |
| **Retrocompatibilidade** | ✅ Completo | Links simbólicos, modo legado |
| **Migração de Agentes** | ⏳ Não Iniciado | 70 agentes a atualizar |
| **Migração de Comandos** | ⏳ Não Iniciado | 220 comandos a verificar |
| **Testes** | ⏳ Não Iniciado | Testes multi-provedor necessários |
| **Atualizações de Bundles** | ⏳ Não Iniciado | bundles vibe/, codex/, opencode/ |

---

## 🎯 Fases da Migração

### Fase 1: Fundação (Branch Atual)
**Branch:** `refactor/ai-craft`
**Status:** ✅ Completo
**Duração:** 2 semanas (estimado)

#### O que Está Pronto

1. **AI Provider Manager** (`cli/lib/ai-provider.js`)
   - Classe de provedor base com interface comum
   - Detecção de provedor (configuração, env, binários)
   - Execução de comandos com fallback
   - Suporte a sub-agentes
   - Gerenciamento de servidores MCP

2. **Implementações de Provedores** (`cli/lib/provider/`)
   - `base-provider.js` - Classe base abstrata
   - `vibe-provider.js` - Mistral AI Vibe
   - `codex-provider.js` - Google Codex
   - `opencode-provider.js` - OpenCode auto-hospedado
   - `claude-provider.js` - Anthropic Claude Code
   - `cursor-provider.js` - Cursor (VSCode)

3. **Configuração**
   - `ai-craft.yaml` - Template de configuração multi-provedor
   - `AI-CRAFT.md` - Instruções principais para todos os provedores
   - Configurações de retrocompatibilidade

4. **Compatibilidade Legada** (`cli/lib/legacy/claude-compat.js`)
   - Detecção de projetos Claude Craft
   - Ferramenta de migração automática
   - Gerenciamento de links simbólicos (`.claude/ -> .ai-craft/`)
   - Funcionalidade de backup e restauração

5. **Atualizações do Pacote**
   - Nome do pacote: `@ai-craft/core` (era `@the-bearded-bear/claude-craft`)
   - Versão: `9.0.0` (salto de versão maior — continuidade SemVer a partir da série
     `8.19.x` do Claude Craft, não um reset para `1.0.0`, já que a renomeação do
     pacote é tratada como a breaking change deste projeto, não um produto totalmente novo)
   - Binários: `ai-craft` + `claude-craft` (retrocompatibilidade)

6. **Descontinuação do Pacote Antigo** (ação do mantenedor, não automatizada por este repositório)
   - Assim que o `@ai-craft/core` for publicado, marque o pacote antigo como depreciado
     para que as instalações existentes exibam um ponteiro claro em vez de ficarem
     silenciosamente desatualizadas:
     ```bash
     npm deprecate @the-bearded-bear/claude-craft "Renamed to @ai-craft/core — see https://github.com/TheBeardedBearSAS/claude-craft/blob/main/docs/guides/en/MIGRATION-TO-AI-CRAFT.md"
     ```
   - Isso requer acesso de publicação npm ao nome do pacote antigo e não é executado por
     nenhum script deste repositório — é uma etapa manual e única para quem detiver
     esse acesso.

#### Arquivos Modificados/Criados

```
cli/
├── lib/
│   ├── ai-provider.js          # ✅ NOVO: Gerenciador principal de provedores
│   ├── provider/               # ✅ NOVO: Implementações de provedores
│   │   ├── base-provider.js
│   │   ├── vibe-provider.js
│   │   ├── codex-provider.js
│   │   ├── opencode-provider.js
│   │   ├── claude-provider.js
│   │   └── cursor-provider.js
│   └── legacy/                 # ✅ NOVO: Camada de compatibilidade
│       └── claude-compat.js
├── index.js                    # ⚠️ TODO: Atualizar para usar o gerenciador de provedores
│
.claude/
└── AI-CRAFT.md                # ✅ NOVO: Instruções multi-provedor

ai-craft.yaml                  # ✅ NOVO: Configuração padrão
package.json                   # ✅ ATUALIZADO: Novo nome e versão
README.md                      # ✅ ATUALIZADO: Aviso de transição
docs/guides/en/MIGRATION-TO-AI-CRAFT.md  # ✅ NOVO: Este arquivo (traduzido para fr/es/de/pt)
```

---

## 📋 Checklist de Migração

### Para Mantenedores do Framework

- [x] Criar a branch `refactor/ai-craft`
- [x] Atualizar o package.json com o novo nome e versão
- [x] Criar a arquitetura do AI Provider Manager
- [x] Implementar a classe de provedor base
- [x] Implementar o provedor Vibe
- [x] Implementar o provedor Codex
- [x] Implementar o provedor OpenCode
- [x] Implementar o provedor Claude (retrocompatível)
- [x] Implementar o provedor Cursor
- [x] Criar a configuração ai-craft.yaml
- [x] Criar as instruções AI-CRAFT.md
- [x] Criar a camada de retrocompatibilidade
- [x] Atualizar o README.md com o aviso de transição
- [x] Criar este guia de migração
- [ ] Atualizar a CLI para usar o gerenciador de provedores
- [ ] Atualizar o instalador para criar a estrutura .ai-craft/
- [ ] Atualizar o Ralph para funcionar com multi-provedor
- [ ] Atualizar o QA Recette para multi-browser
- [ ] Atualizar os hooks do BMAD para multi-provedor
- [ ] Migrar todos os 70 agentes para o formato multi-provedor
- [ ] Verificar se todos os 220 comandos funcionam com todos os provedores
- [ ] Criar uma suíte de testes multi-provedor
- [ ] Atualizar a documentação para todos os provedores
- [ ] Criar bundles específicos por provedor
- [ ] Testar a migração de projetos Claude Craft
- [ ] Atualizar o GitHub Actions CI/CD
- [ ] Atualizar os metadados do pacote npm
- [ ] Preparar as notas de release
- [ ] Anunciar à comunidade

### Para Usuários Migrando Projetos

1. **Faça backup do seu projeto**
   ```bash
   cd ~/my-project
   git commit -am "Backup before AI Craft migration"
   ```

2. **Instale o AI Craft**
   ```bash
   npx @ai-craft/core install ~/my-project
   ```

3. **Execute a migração** (se for um projeto Claude Craft)
   ```bash
   npx @ai-craft/core migrate ~/my-project
   ```

4. **Verifique a instalação**
   ```bash
   # Check .ai-craft/ directory exists
   ls -la .ai-craft/

   # Check symlink exists
   ls -la .claude/  # Should show -> .ai-craft/

   # Test with your provider
   vibe --system .ai-craft/AI-CRAFT.md
   ```

5. **Atualize o seu fluxo de trabalho**
   - Use o comando `ai-craft` (ou `claude-craft` para retrocompatibilidade)
   - Atualize os scripts que referenciam `.claude/` para usar `.ai-craft/`
   - Configure o seu provedor preferido em `ai-craft.yaml`

---

## 🔧 Detalhes Técnicos de Implementação

### Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Craft CLI                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────┐    ┌────────────────────────┐   │
│  │   Gerenciador de     │    │        Comandos          │   │
│  │   Provedores de IA   │    │                         │   │
│  │                     │    │  /workflow:init         │   │
│  │  ┌───────────────┐  │    │  /team:audit           │   │
│  │  │ Detecção de   │  │    │  /qa:recette          │   │
│  │  │ Provedor      │  │    │  /common:ralph-run    │   │
│  │  └───────────────┘  │    │                         │   │
│  │                     │    └────────────────────────┘   │
│  │  ┌───────────────┐  │                                  │
│  │  │ Execução de   │  │    ┌────────────────────────┐   │
│  │  │ Provedor      │  │    │   Compatibilidade        │   │
│  │  └───────────────┘  │    │        Legada             │   │
│  │                     │    │                         │   │
│  │  ┌───────────────┐  │    │  Migração do             │   │
│  │  │ Tratamento de │  │    │  Claude Craft            │   │
│  │  │ Fallback      │  │    │  Gerenciamento de Links  │   │
│  │  └───────────────┘  │    │  Simbólicos               │   │
│  └─────────────────────┘                                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
          │              │              │
          ▼              ▼              ▼
┌─────────────────┐ ┌──────────────┐ ┌─────────────────┐
│   Provedor Vibe  │ │Provedor Codex │ │Provedor OpenCode │
│   (Mistral AI)   │ │   (Google)    │ │ (Auto-Hospedado) │
└─────────────────┘ └──────────────┘ └─────────────────┘
          │              │              │
          ▼              ▼              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Provedores de IA                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │
│  │   Vibe CLI  │ │ Codex CLI   │ │ OpenCode CLI│    │
│  │ (vibe)      │ │ (codex)     │ │ (opencode)  │    │
│  └─────────────┘ └─────────────┘ └─────────────┘    │
│                                                    │
│  ┌─────────────┐ ┌─────────────┐                    │
│  │ Claude Code │ │   Cursor    │                    │
│  │ (claude)    │ │ (VSCode)    │                    │
│  └─────────────┘ └─────────────┘                    │
└─────────────────────────────────────────────────────────────┘
```

### Interface de Provedor

Todos os provedores implementam a seguinte interface:

```javascript
class BaseProvider {
  // Metadata
  name: string              // 'vibe', 'codex', etc.
  displayName: string       // 'Vibe (Mistral AI)'
  mcpSupported: boolean     // Supports MCP servers
  hooksSupported: boolean   // Supports hooks system
  subAgentsSupported: boolean // Supports sub-agents
  forkSupported: boolean    // Supports context forking

  // Configuration
  supportedModels: string[] // List of supported models
  defaultModel: string      // Default model to use
  modelAliases: Object      // Model name mappings

  // Methods
  async execute(command, args, options)      // Execute a command
  async sendMessage(prompt, options)         // Send a message to AI
  async spawnSubAgent(prompt, options)       // Spawn a sub-agent
  getMCPServers()                           // Get MCP server configs
  mapCommand(command, args)                 // Map generic → provider-specific
  async isAvailable()                       // Check if provider is installed
  async getVersion()                        // Get provider version
  validateConfig(config)                    // Validate provider config
  getEnvVars()                              // Get environment variables
}
```

### Estrutura de Configuração

**Nova Estrutura (`.ai-craft/`):**
```
.ai-craft/
├── AI-CRAFT.md              # Instruções principais (substitui CLAUDE.md)
├── ai-craft.yaml            # Configuração multi-provedor
├── ai-craft-config.json     # Configurações genéricas (opcional)
├── providers/               # Configurações específicas de cada provedor
│   ├── vibe.yaml
│   ├── codex.yaml
│   ├── opencode.yaml
│   ├── claude.yaml
│   └── cursor.yaml
├── agents/                  # Agentes multi-provedor
│   └── api-designer.md
│   └── symfony-reviewer.md
│   └── ...
├── commands/                # Comandos do framework
├── skills/                  # Skills universais
├── templates/               # Templates de geração de código
├── memory/                  # Memória entre sessões
├── logs/                    # Arquivos de log
└── hooks/                   # Scripts de hooks
```

**Estrutura Legada (`.claude/`):**
```
.claude/ → .ai-craft/  (link simbólico para retrocompatibilidade)
```

### Mapeamento de Nomes de Modelo

O AI Craft fornece mapeamento automático de nomes de modelo entre provedores:

| Nome Genérico | Vibe (Mistral) | Codex (Google) | OpenCode | Claude (Anthropic) |
|--------------|----------------|---------------|----------|-------------------|
| `opus` | `mistral-large-3.5` | `codex-pro` | `llama-3.2-90b` | `opus-4.8` |
| `sonnet` | `mistral-medium-3.5` | `codex-plus` | `llama-3.2-70b` | `sonnet-5` |
| `haiku` | `mistral-small-3.5` | `codex` | `llama-3.2-11b` | `haiku-4.5` |

Isso permite que os comandos existentes do Claude Craft funcionem sem modificação:
```bash
# These work the same across all providers
/workflow:init --model=opus
/team:audit --model=sonnet
```

---

## 🎛️ Configuração Específica por Provedor

### Vibe (Mistral AI)

**Pré-requisitos:**
- Instalar a Vibe CLI: `curl -sSL https://vibe.mistral.ai | sh`
- Definir a chave de API: `export MISTRAL_API_KEY=your_key`

**Configuração:**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "vibe"

provider_settings:
  vibe:
    model: "mistral-large-3.5"
    api_endpoint: "https://api.mistral.ai"
```

### Codex (Google)

**Pré-requisitos:**
- Instalar a Codex CLI: `npm install -g @google-cloud/codex-cli`
- Definir a chave de API: `export CODEX_API_KEY=your_key`

**Configuração:**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "codex"

provider_settings:
  codex:
    model: "codex-pro"
```

### OpenCode (Auto-Hospedado)

**Pré-requisitos:**
- Instalar o OpenCode: `npm install -g @open-code/cli`
- Executar o servidor LLM (ex.: `llama-3.2-90b`)
- Definir o endpoint: `export OPENCODE_ENDPOINT=http://localhost:8080`

**Configuração:**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "opencode"

provider_settings:
  opencode:
    model: "llama-3.2-90b"
    base_url: "http://localhost:8080"
```

### Claude Code (Anthropic)

**Pré-requisitos:**
- Instalar o Claude Code: `brew install claude-code` (macOS) ou consulte a [documentação](https://code.claude.com)

**Configuração:**
```yaml
# .ai-craft/ai-craft.yaml
providers:
  primary: "claude"

provider_settings:
  claude:
    model: "sonnet-5"
```

### Cursor (VSCode)

**Pré-requisitos:**
- Instalar a extensão Cursor no VSCode

**Configuração:**
```json
// VSCode settings.json
{
  "cursor.rules": [
    {
      "path": ".ai-craft",
      "prompt": ".ai-craft/AI-CRAFT.md"
    }
  ]
}
```

---

## 🚀 Início Rápido para Desenvolvedores

### Clonar e Configurar

```bash
# Clone the repository
git clone https://github.com/TheBeardedBearSAS/claude-craft.git
cd claude-craft

# Switch to the AI Craft branch
git checkout refactor/ai-craft

# Install dependencies
npm install

# Link the package locally
npm link
```

### Testar a Migração

```bash
# Create a test project
mkdir ~/ai-craft-test
cd ~/ai-craft-test

# Initialize AI Craft
npx @ai-craft/core install . --provider=vibe

# Or test migration from Claude Craft
npx @the-bearded-bear/claude-craft install . --tech=symfony
npx @ai-craft/core migrate .

# Test with different providers
ai-craft --provider=vibe workflow:init
ai-craft --provider=codex workflow:init
ai-craft --provider=claude workflow:init
```

### Executar os Testes

```bash
# Run existing tests
npm test

# Run lint
npm run lint

# Check multi-provider functionality
node tests/ai-provider.test.mjs
```

---

## 🐛 Solução de Problemas

### Problemas Comuns

**1. Provedor não detectado**
```
❌ Error: No AI provider detected
```
**Solução:**
- Instale a CLI do provedor (vibe, codex, opencode ou claude)
- Defina a variável de ambiente apropriada
- Ou especifique o provedor explicitamente: `--provider=vibe`

**2. Link simbólico não criado**
```
❌ Error: .claude/ directory not found
```
**Solução:**
- A migração deve criar um link simbólico automaticamente
- Crie-o manualmente: `ln -s .ai-craft .claude`
- Ou use os comandos `ai-craft` diretamente

**3. Comando não encontrado**
```
❌ Error: ai-craft: command not found
```
**Solução:**
- Certifique-se de que o npm link foi executado: `npm link`
- Ou use o npx: `npx @ai-craft/core`
- Ou instale globalmente: `npm install -g .`

**4. Permissão negada**
```
❌ Error: EACCES: permission denied
```
**Solução:**
- Use sudo se necessário: `sudo npm link`
- Ou corrija as permissões do npm: `npm config set prefix ~/.npm-global`

**5. Erros de configuração**
```
❌ Error: Invalid configuration
```
**Solução:**
- Verifique a sintaxe do `ai-craft.yaml` com um validador YAML
- Compare com a configuração padrão
- Remova e regenere: `rm -rf .ai-craft && npx @ai-craft/core install .`

---

## 📊 Acompanhamento do Progresso da Migração

| Tarefa | Status | Responsável | Notas |
|------|--------|-------|-------|
| Arquitetura principal | ✅ Concluído | - | Gerenciador de provedores completo |
| Provedor Vibe | ✅ Concluído | - | Implementação completa |
| Provedor Codex | ✅ Concluído | - | Implementação completa |
| Provedor OpenCode | ✅ Concluído | - | Implementação completa |
| Provedor Claude | ✅ Concluído | - | Retrocompatível |
| Provedor Cursor | ✅ Concluído | - | Integração com o VSCode |
| Configuração | ✅ Concluído | - | Template ai-craft.yaml |
| AI-CRAFT.md | ✅ Concluído | - | Instruções multi-provedor |
| Retrocompatibilidade | ✅ Concluído | - | Gerenciamento de links simbólicos |
| Atualização do README | ✅ Concluído | - | Aviso de transição |
| Guia de migração | ✅ Concluído | - | Este documento |
| Integração da CLI | ⏳ A FAZER | Dev | Atualizar cli/index.js |
| Atualização do instalador | ⏳ A FAZER | Dev | Criar a estrutura .ai-craft/ |
| Adaptação do Ralph | ⏳ A FAZER | Dev | Loop multi-provedor |
| Adaptação do QA Recette | ⏳ A FAZER | Dev | Suporte multi-browser |
| Migração de agentes | ⏳ A FAZER | Dev | Atualizar 70 agentes |
| Verificação de comandos | ⏳ A FAZER | QA | Testar 220 comandos |
| Suíte de testes | ⏳ A FAZER | QA | Testes multi-provedor |
| Documentação | ⏳ A FAZER | Docs | Atualizar toda a documentação |
| Bundles | ⏳ A FAZER | Dev | Criar bundles para cada provedor |
| Atualização do CI/CD | ⏳ A FAZER | DevOps | GitHub Actions |
| Publicação do pacote | ⏳ A FAZER | DevOps | npm publish |
| Anúncio à comunidade | ⏳ A FAZER | Marketing | Anúncio de release |

---

## 🎯 Roadmap de Migração para o AI Craft

### Fase 1: Fundações (Semanas 1-2) ✅ **COMPLETO**
- [x] Arquitetura do AI Provider Manager
- [x] Implementação dos provedores base
- [x] Configuração multi-provedor
- [x] Camada de compatibilidade com o Claude Craft
- [x] Documentação inicial

### Fase 2: Integração da CLI (Semanas 3-4) ⏳ **EM ANDAMENTO**
- [ ] Atualização do cli/index.js para usar o gerenciador de provedores
- [ ] Atualização do instalador (Dev/scripts/install-*.sh)
- [ ] Integração do Ralph com multi-provedor
- [ ] Testes de integração básicos

### Fase 3: Adaptação das Ferramentas (Semanas 5-6) ⏳ **A VIR**
- [ ] Ralph Wiggum multi-provedor
- [ ] QA Recette multi-browser + multi-IA
- [ ] Hooks do BMAD multi-provedor
- [ ] Atualização dos templates de hooks

### Fase 4: Migração dos Agentes (Semanas 7-8) ⏳ **A VIR**
- [ ] Script de migração dos agentes
- [ ] Atualização dos 70 agentes existentes
- [ ] Frontmatter multi-provedor
- [ ] Validação dos agentes

### Fase 5: Testes & Validação (Semanas 9-10) ⏳ **A VIR**
- [ ] Suíte de testes multi-provedor
- [ ] Testes de integração ponta a ponta
- [ ] Validação da retrocompatibilidade
- [ ] Benchmark de desempenho

### Fase 6: Release (Semana 11-12) ⏳ **A VIR**
- [ ] Atualização da documentação
- [ ] Criação dos bundles multi-IDE
- [ ] Atualização do CI/CD
- [ ] Publicação no npm
- [ ] Anúncio à comunidade

---

## 🤝 Como Contribuir

Recebemos com prazer contribuições para o AI Craft! Veja como você pode ajudar:

### 1. Reportar Problemas
- Abra uma issue no GitHub com a label `ai-craft`
- Inclua detalhes sobre:
  - Seu sistema operacional
  - O(s) provedor(es) de IA que você está usando
  - Passos para reproduzir
  - Comportamento esperado vs. real

### 2. Corrigir Bugs
- Faça um fork do repositório
- Crie uma branch: `git checkout -b fix/your-issue`
- Faça as suas alterações
- Adicione testes para a correção
- Envie um Pull Request

### 3. Adicionar Funcionalidades
- Discuta a funcionalidade primeiro no GitHub Discussions
- Crie uma branch: `git checkout -b feat/your-feature`
- Implemente a funcionalidade
- Adicione testes e documentação
- Envie um Pull Request

### 4. Melhorar a Documentação
- Atualize a documentação existente
- Adicione exemplos
- Melhore as traduções (en, fr, es, de, pt)

### 5. Testar Novos Provedores
- Experimente o AI Craft com diferentes provedores de IA
- Reporte problemas de compatibilidade
- Ajude a melhorar as implementações de provedores

---

## 📞 Suporte

### Comunidade
- **GitHub Discussions:** [TheBeardedBearSAS/ai-craft/discussions](https://github.com/TheBeardedBearSAS/ai-craft/discussions)
- **Discord:** [Junte-se ao nosso servidor Discord](https://discord.gg/...) (link a ser atualizado)
- **Twitter/X:** [@TheBeardedCTO](https://twitter.com/TheBeardedCTO)

### Documentação
- **Documentação Principal:** [ai-craft.the-bearded-bear.com](https://ai-craft.the-bearded-bear.com) (em breve)
- **Wiki do GitHub:** [TheBeardedBearSAS/ai-craft/wiki](https://github.com/TheBeardedBearSAS/ai-craft/wiki)

### Suporte Comercial
Para suporte enterprise, desenvolvimento personalizado ou treinamento:
- **E-mail:** support@the-bearded-bear.com
- **Website:** [https://the-bearded-bear.com](https://the-bearded-bear.com)

---

## 📜 Licença

O AI Craft é **100% open-source** sob a [Licença MIT](LICENSE).

Isso significa que você pode:
- ✅ Usá-lo gratuitamente (uso pessoal e comercial)
- ✅ Modificar o código-fonte
- ✅ Distribuir versões modificadas
- ✅ Usá-lo em software proprietário

Você não pode:
- ❌ Usar as marcas registradas sem permissão
- ❌ Nos responsabilizar por quaisquer problemas

---

## 🙏 Agradecimentos

O AI Craft se constrói sobre a fundação do **Claude Craft**, criado e mantido por [The Bearded CTO](https://the-bearded-bear.com) com contribuições da comunidade open-source.

Agradecimentos especiais a:
- **Anthropic** por criar o Claude Code
- **Mistral AI** pelo Vibe e pelas contribuições open-source
- **Google** pelo Codex e pela pesquisa em IA
- **Todos os contribuidores** que ajudaram a moldar este framework

---

**AI Craft - O Framework de Desenvolvimento Multi-IA**
*Anteriormente Claude Craft - Agora Independente de Provedor!*
*Construído com ❤️ pela Comunidade AI Craft*
