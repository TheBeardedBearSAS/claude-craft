# Guia de Solução de Problemas

Este guia cobre os problemas mais comuns e suas soluções ao usar o Claude-Craft.

---

## Índice

1. [Problemas de Instalação](#problemas-de-instalação)
2. [Problemas de Agentes](#problemas-de-agentes)
3. [Problemas de Comandos](#problemas-de-comandos)
4. [Problemas de Configuração](#problemas-de-configuração)
5. [Problemas de Ferramentas](#problemas-de-ferramentas)
6. [Problemas de Desempenho](#problemas-de-desempenho)
7. [Obtendo Ajuda](#obtendo-ajuda)

---

## Problemas de Instalação

### Comandos Não Reconhecidos Após a Instalação

**Sintomas:**
- Comandos slash como `/symfony:check-compliance` não funcionam
- Claude não reconhece os comandos instalados

**Soluções:**

1. **Reiniciar o Claude Code**
   ```bash
   # Sair completamente do Claude Code
   exit

   # Iniciar novamente
   claude
   ```

2. **Verificar a instalação**
   ```bash
   ls -la .claude/commands/
   # Deve mostrar os diretórios de comandos
   ```

3. **Verificar o formato do arquivo de comando**
   ```bash
   head -5 .claude/commands/symfony/check-compliance.md
   # Deve começar com o cabeçalho markdown correto
   ```

### Arquivos Não Encontrados Durante a Instalação

**Sintomas:**
- Erros de "Source file not found"
- Regras ou templates ausentes

**Soluções:**

1. **Verificar o caminho do Claude-Craft**
   ```bash
   # Certifique-se de estar executando do diretório claude-craft
   pwd
   ls -la Dev/scripts/
   ```

2. **Verificar se os arquivos de idioma existem**
   ```bash
   ls -la Dev/i18n/en/Symfony/rules/
   ```

3. **Usar o caminho TARGET absoluto**
   ```bash
   # Em vez de
   make install-symfony TARGET=./backend

   # Use
   make install-symfony TARGET=/caminho/completo/para/backend
   ```

### Erros de Permissão Negada

**Sintomas:**
- Não é possível executar os scripts de instalação
- Não é possível gravar no diretório alvo

**Soluções:**

1. **Tornar os scripts executáveis**
   ```bash
   chmod +x Dev/scripts/*.sh
   chmod +x Project/*.sh
   chmod +x Infra/*.sh
   chmod +x Tools/*/*.sh
   ```

2. **Verificar permissões do diretório alvo**
   ```bash
   ls -la ~/my-project/
   # Certifique-se de ter permissões de escrita
   ```

3. **Executar com o usuário adequado**
   ```bash
   # Não use sudo, a menos que seja necessário
   # Verifique a propriedade do diretório
   ls -la ~/my-project
   ```

### Instalação Cria Diretório Vazio

**Sintomas:**
- Diretório `.claude/` criado, mas vazio ou com arquivos faltando

**Soluções:**

1. **Verificar erros na saída**
   ```bash
   # Executar com saída detalhada
   make install-symfony TARGET=./backend 2>&1 | tee install.log
   ```

2. **Verificar se a fonte existe**
   ```bash
   ls -la Dev/i18n/en/Symfony/
   ```

3. **Tentar execução direta do script**
   ```bash
   ./Dev/scripts/install-symfony-rules.sh --lang=en ./backend
   ```

---

## Problemas de Agentes

### Agente Não Disponível

**Sintomas:**
- `@api-designer` ou outros agentes não respondem
- Erros do tipo "Unknown agent"

**Soluções:**

1. **Verificar se os arquivos do agente existem**
   ```bash
   ls -la .claude/agents/
   # Deve listar os arquivos .md dos agentes
   ```

2. **Verificar o formato do arquivo do agente**
   ```bash
   head -20 .claude/agents/api-designer.md
   # Deve ter frontmatter correto com nome e descrição
   ```

3. **Reinstalar os agentes**
   ```bash
   make install-common TARGET=. OPTIONS="--force"
   ```

### Agente Dá Respostas Irrelevantes

**Sintomas:**
- O agente não segue suas instruções especializadas
- Respostas genéricas em vez de conselhos especializados

**Soluções:**

1. **Fornecer mais contexto**
   ```markdown
   @symfony-reviewer Revise minha implementação do UserService

   Contexto:
   - Symfony 7 com API Platform
   - Clean Architecture
   - Abordagem DDD

   Código para revisar:
   [cole o código aqui]
   ```

2. **Ser específico na sua solicitação**
   ```markdown
   # Em vez de
   @database-architect Ajude com meu banco de dados

   # Use
   @database-architect Projete o schema para o agregado User com:
   - Entidade User (id, email, password_hash)
   - Entidade Role (muitos-para-muitos com User)
   - Entidade Permission (muitos-para-muitos com Role)
   - Trilha de auditoria para alterações de usuário
   ```

3. **Verificar o arquivo de contexto do projeto**
   ```bash
   cat .claude/references/<your-tech>/project-context.md
   # Certifique-se de que descreve seu projeto com precisão
   ```

### Conflito do Agente com as Regras do Projeto

**Sintomas:**
- As sugestões do agente contradizem as convenções do projeto
- Conselhos inconsistentes

**Soluções:**

1. **Atualizar o contexto do projeto**
   - Adicionar convenções específicas ao `00-project-context.md`
   - Incluir preferências e restrições da equipe

2. **Ser explícito nas solicitações**
   ```markdown
   @api-designer Projete o endpoint seguindo nossas convenções RESTful
   (veja 00-project-context.md para nossos padrões de API)
   ```

---

## Problemas de Comandos

### Comando Não Encontrado

**Sintomas:**
- `/symfony:generate-crud` retorna "unknown command"
- Sugestões de comandos não aparecem

**Soluções:**

1. **Verificar o diretório de comandos**
   ```bash
   ls .claude/commands/symfony/
   # Deve incluir generate-crud.md
   ```

2. **Verificar o namespace**
   ```bash
   # Os comandos estão no formato: /{namespace}:{command}
   # Namespaces disponíveis:
   ls .claude/commands/
   # common/, symfony/, flutter/, python/, react/, reactnative/, docker/
   ```

3. **Listar os comandos disponíveis**
   ```bash
   # No Claude Code, digite:
   /help
   ```

### Erros de Execução de Comandos

**Sintomas:**
- O comando inicia mas falha
- Saída inesperada ou erros

**Soluções:**

1. **Verificar os pré-requisitos**
   - Alguns comandos exigem ferramentas específicas
   - Verificar se as dependências necessárias estão instaladas

2. **Revisar o arquivo de comando**
   ```bash
   cat .claude/commands/symfony/generate-crud.md
   # Entender o que o comando espera
   ```

3. **Fornecer os parâmetros obrigatórios**
   ```bash
   # Em vez de
   /symfony:generate-crud

   # Use
   /symfony:generate-crud User --with-api --with-tests
   ```

### Saída do Comando Incorreta

**Sintomas:**
- O código gerado não corresponde ao estilo do projeto
- Padrões de tecnologia errados utilizados

**Soluções:**

1. **Atualizar o contexto do projeto**
   ```bash
   # Editar .claude/references/<your-tech>/project-context.md
   # Adicionar padrões e convenções específicos
   ```

2. **Personalizar os templates**
   ```bash
   # Editar templates em .claude/templates/
   # Ajustar para corresponder ao estilo do seu projeto
   ```

---

## Problemas de Configuração

### Configuração YAML Inválida

**Sintomas:**
- `make config-validate` falha
- Erros de sintaxe na configuração

**Soluções:**

1. **Verificar a sintaxe YAML**
   ```bash
   # Validar YAML
   yq e '.' claude-projects.yaml
   ```

2. **Erros comuns de YAML:**
   ```yaml
   # Errado: indentação inconsistente
   projects:
     - name: "project"
       path: "/path"  # 2 espaços
        technologies: ["symfony"]  # 3 espaços - ERRO!

   # Correto: indentação consistente
   projects:
     - name: "project"
       path: "/path"
       technologies: ["symfony"]
   ```

3. **Validar com a ferramenta**
   ```bash
   make config-validate CONFIG=claude-projects.yaml
   ```

### Projeto Não Encontrado na Configuração

**Sintomas:**
- "Project not found" ao instalar
- Projeto não listado

**Soluções:**

1. **Verificar a ortografia do nome do projeto**
   ```bash
   # Listar projetos
   make config-list CONFIG=claude-projects.yaml

   # Os nomes diferenciam maiúsculas de minúsculas
   ```

2. **Verificar o caminho do arquivo de configuração**
   ```bash
   # Por padrão, busca claude-projects.yaml no diretório atual
   # Especificar explicitamente:
   make config-install CONFIG=/caminho/para/config.yaml PROJECT=myprojeto
   ```

### Configuração Não Aplicada

**Sintomas:**
- Alterações na configuração não têm efeito
- Configurações antigas persistem

**Soluções:**

1. **Reinstalar com força**
   ```bash
   make config-install CONFIG=claude-projects.yaml PROJECT=myprojeto OPTIONS="--force"
   ```

2. **Verificar conflitos**
   ```bash
   # Remover instalação existente
   rm -rf /caminho/para/projeto/.claude

   # Reinstalar
   make config-install CONFIG=claude-projects.yaml PROJECT=myprojeto
   ```

---

## Problemas de Ferramentas

### StatusLine Não Está Sendo Exibida

**Sintomas:**
- Barra de status vazia ou padrão
- Linha de status personalizada não aparece

**Soluções:**

1. **Verificar se o script está instalado**
   ```bash
   ls -la ~/.claude/statusline.sh
   # Deve existir e ser executável
   ```

2. **Verificar o settings.json**
   ```bash
   cat ~/.claude/settings.json | jq '.statusLine'
   # Deve mostrar:
   # {
   #   "type": "command",
   #   "command": "~/.claude/statusline.sh"
   # }
   ```

3. **Testar o script manualmente**
   ```bash
   echo '{"model":{"display_name":"Test","id":"claude-opus"}}' | ~/.claude/statusline.sh
   # Deve exibir a linha de status formatada
   ```

4. **Verificar o jq**
   ```bash
   which jq
   # Instalar se ausente: brew install jq / apt install jq
   ```

### Problemas de Perfil MultiConta

**Sintomas:**
- Não é possível alternar perfis
- Perfil não reconhecido

**Soluções:**

1. **Listar os perfis**
   ```bash
   ./claude-accounts.sh list
   ```

2. **Verificar o diretório de perfis**
   ```bash
   ls -la ~/.claude-profiles/
   # Deve conter os diretórios de perfil
   ```

3. **Verificar o arquivo de modo do perfil**
   ```bash
   cat ~/.claude-profiles/meuperfil/.mode
   # Deve conter "shared" ou "isolated"
   ```

4. **Recriar o perfil com problema**
   ```bash
   ./claude-accounts.sh remove meuperfil
   ./claude-accounts.sh add meuperfil --mode=shared
   ```

### Erros de yq no ProjectConfig

**Sintomas:**
- "yq: command not found"
- Erros de análise de YAML

**Soluções:**

1. **Instalar yq**
   ```bash
   # macOS
   brew install yq

   # Linux
   sudo snap install yq
   # ou
   sudo wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/local/bin/yq
   sudo chmod +x /usr/local/bin/yq
   ```

2. **Verificar a versão do yq**
   ```bash
   yq --version
   # Deve ser v4.x (mikefarah/yq, não kislyuk/yq)
   ```

---

## Problemas de Hook

### Hook Não Está Disparando

**Sintomas:**
- Hooks PreToolUse/PostToolUse não executam
- Nenhuma saída dos comandos de hook

**Soluções:**

1. **Verificar a configuração de hook no settings.json**
   ```bash
   cat .claude/settings.json | jq '.hooks'
   ```

2. **Verificar a sintaxe do matcher**
   ```json
   {
     "hooks": {
       "PreToolUse": [{
         "matcher": "Bash",
         "hooks": [{"type": "command", "command": "echo test"}]
       }]
     }
   }
   ```
   O `matcher` deve corresponder exatamente ao nome da ferramenta (ex.: `Bash`, `Edit`, `Write`).

3. **Testar o comando do hook de forma independente**
   ```bash
   # Executar o comando do hook manualmente para verificar se funciona
   bash -c 'echo test'
   ```

### Bloqueio do Hook PreCompact

**Sintomas:**
- A compactação de contexto não acontece quando esperado
- Compactação parece travada

**Solução:** Os hooks PreCompact (v2.1.105+) podem bloquear a compactação com código de saída 2. Verifique seus hooks:
```bash
cat .claude/settings.json | jq '.hooks.PreCompact'
# Certifique-se de que os scripts de hook não retornem acidentalmente o código de saída 2
```

### Erros de Sandbox

**Sintomas:**
- Erros de "Sandbox unavailable"
- Problemas de permissão em subprocessos

**Soluções:**

1. **Verificar a versão do Claude Code** (sandbox exige v2.1.98+)
   ```bash
   claude --version
   ```

2. **No Linux, verificar suporte a namespaces PID**
   ```bash
   # Verificar se unshare está disponível
   which unshare
   ```

3. **Desativar sandbox estrita se necessário** (não recomendado por segurança)
   - Remover `sandbox.failIfUnavailable` das configurações, se tiver sido adicionado

### Falhas de Hook Relacionadas à Segurança

Se estiver usando servidores MCP com hooks, certifique-se de que o Claude Code seja v2.1.97+ para evitar CVEs conhecidas:
- CVE-2025-59536: Injeção de comandos via entradas MCP no pipeline de hook
- CVE-2026-35020: Bypass de comando composto
- CVE-2026-35022: Injeção de prefixo via variável de ambiente

---

## Problemas de Desempenho

### Execução Lenta de Comandos

**Sintomas:**
- Comandos demoram muito para responder
- StatusLine atualiza lentamente

**Soluções:**

1. **Verificar as configurações de cache**
   ```bash
   # Em ~/.claude/statusline.conf
   SESSION_CACHE_TTL=60   # Reduzir se estiver muito lento
   WEEKLY_CACHE_TTL=300   # Reduzir se estiver muito lento
   ```

2. **Limpar caches**
   ```bash
   rm /tmp/.ccusage_*
   ```

3. **Verificar a rede**
   - Algumas funcionalidades exigem rede (ccusage)
   - Rede lenta = atualizações lentas

### Alto Uso da Janela de Contexto

**Sintomas:**
- Indicador de contexto mostra percentual alto rapidamente
- Avisos de "Context limit"

**Soluções:**

1. **Usar `/context` para sugestões de otimização** (v2.1.74+)
   ```bash
   /context
   ```

2. **Ajustar o nível de esforço** para tarefas simples (v2.1.72+)
   ```bash
   /effort low    # Consultas simples
   /effort medium # Trabalho padrão
   ```

3. **Compactar proativamente** em ~70% de uso
   ```bash
   /compact
   ```

4. **Usar `/clear` entre tarefas não relacionadas**

5. **Salvar aprendizados importantes** antes da compactação
   ```bash
   /memory "Important: auth uses JWT RS256 with 15min expiry"
   ```

6. **Configurar RTK** para economia de 55-65% de tokens
   ```bash
   /common:setup-rtk
   ```

7. **Usar agentes para tarefas complexas**
   ```markdown
   # Em vez de colar toda a base de código
   @research-assistant Find all authentication-related files in src/
   ```

---

## Obtendo Ajuda

### Verificar a Documentação

1. **Docs principais**: diretório `docs/`
2. **Referência de agentes**: `docs/AGENTS.md`
3. **Referência de comandos**: `docs/COMMANDS.md`
4. **Guia de tecnologias**: `docs/TECHNOLOGIES.md`

### Obter Informações de Versão

```bash
# Scripts de instalação
./Dev/scripts/install-symfony-rules.sh --version

# Ferramentas
./Tools/MultiAccount/claude-accounts.sh --version
./Tools/ProjectConfig/claude-projects.sh --version
```

### Reportar Problemas

Se encontrar bugs:

1. Coletar informações:
   - Versão do Claude-Craft
   - Sistema operacional
   - Passos para reproduzir
   - Mensagens de erro

2. Verificar os problemas existentes no GitHub

3. Criar um novo issue com os detalhes

### Pedir Ajuda

```markdown
@research-assistant Estou com problema em [descrever o problema]

Ambiente:
- SO: [seu SO]
- Versão do Claude-Craft: [versão]
- Tecnologia: [symfony/flutter/etc.]

O que tentei:
1. [passo 1]
2. [passo 2]

Mensagem de erro:
[colar o erro]
```

---

## Checklist de Correções Rápidas

Quando algo não funcionar:

- [ ] Reiniciar o Claude Code
- [ ] Verificar a instalação (`ls .claude/`)
- [ ] Verificar as permissões de arquivos
- [ ] Validar a configuração
- [ ] Limpar caches
- [ ] Verificar as dependências (jq, yq)
- [ ] Tentar reinstalar com `--force`
- [ ] Verificar a documentação
- [ ] Pedir ajuda

---

[&larr; Referência de Ferramentas](05-tools-reference.md) | [Gestão do Backlog &rarr;](07-backlog-management.md)
