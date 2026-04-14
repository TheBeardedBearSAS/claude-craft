# Guia de Resolução de Problemas

Problemas comuns e suas soluções ao usar Claude-Craft.

---

## Problemas de Instalação

### Comandos Não Reconhecidos
**Soluções:**
1. Reiniciar Claude Code (`exit` + `claude`)
2. Verificar instalação: `ls -la .claude/commands/`
3. Verificar formato dos arquivos de comandos

### Arquivos Não Encontrados
**Soluções:**
1. Verificar caminho do Claude-Craft: `pwd && ls Dev/scripts/`
2. Verificar arquivos de idioma: `ls Dev/i18n/pt/`
3. Usar caminho TARGET absoluto

### Erros de Permissão
```bash
chmod +x Dev/scripts/*.sh
chmod +x Tools/*/*.sh
```

---

## Problemas de Agentes

### Agente Não Disponível
1. Verificar arquivos: `ls .claude/agents/`
2. Verificar formato do frontmatter
3. Reinstalar: `make install-common TARGET=. OPTIONS="--force"`

### Respostas Irrelevantes
1. Fornecer mais contexto na solicitação
2. Ser específico no pedido
3. Verificar `00-project-context.md`

---

## Problemas de Comandos

### Comando Não Encontrado
1. Verificar diretório: `ls .claude/commands/symfony/`
2. Verificar namespace correto
3. Listar comandos: `/help`

### Erros de Execução
1. Verificar pré-requisitos
2. Revisar arquivo de comando
3. Fornecer parâmetros obrigatórios

---

## Problemas de Configuração

### YAML Inválido
```bash
yq e '.' claude-projects.yaml  # Validar sintaxe
make config-validate CONFIG=claude-projects.yaml
```

### Projeto Não Encontrado
1. Verificar ortografia do nome (sensível a maiúsculas)
2. Verificar caminho do arquivo de configuração

---

## Problemas de Ferramentas

### StatusLine Não Aparece
```bash
ls -la ~/.claude/statusline.sh  # Verificar instalação
echo '{"model":{"display_name":"Test"}}' | ~/.claude/statusline.sh  # Teste
```

### Problemas de Perfil MultiAccount
```bash
./claude-accounts.sh list
ls -la ~/.claude-profiles/
```

### Erros yq
```bash
# Instalar yq v4.x (mikefarah/yq)
brew install yq  # macOS
sudo snap install yq  # Linux
yq --version  # Verificar versão
```

---

## Problemas de Desempenho

### Execução Lenta
1. Ajustar TTL de cache em `statusline.conf`
2. Limpar caches: `rm /tmp/.ccusage_*`
3. Verificar conexão de rede

### Alto Uso de Contexto
1. Usar `/compact` para compactar o contexto proativamente
2. Usar `/clear` entre tarefas não relacionadas
3. Usar `/effort low` para tarefas simples (reduz consumo de tokens)
4. Usar `/context` para obter sugestões de otimização
5. Configurar RTK para economia de tokens de 60-90% (`/common:setup-rtk`)
6. Delegar investigações a sub-agentes

---

## Obter Ajuda

### Documentação
- `docs/AGENTS.md` - Referência de agentes
- `docs/COMMANDS.md` - Referência de comandos
- `docs/TECHNOLOGIES.md` - Guia de tecnologias

### Versões
```bash
./Dev/scripts/install-symfony-rules.sh --version
./Tools/MultiAccount/claude-accounts.sh --version
```

---

## Checklist de Correções Rápidas

- [ ] Reiniciar Claude Code
- [ ] Verificar instalação (`ls .claude/`)
- [ ] Verificar permissões de arquivos
- [ ] Validar configuração
- [ ] Limpar caches
- [ ] Verificar dependências (jq, yq)
- [ ] Tentar reinstalação com `--force`

---

[&larr; Referência de Ferramentas](05-tools-reference.md) | [Gestão do Backlog &rarr;](07-backlog-management.md)
