# Guia de início rápido dos hooks

Hooks do Claude Code para controlo de qualidade e segurança automatizados, instalados no seu projeto pelo claude-craft.

## Instalação

1. **Instalar com o instalador** (copia os scripts para `.claude/hooks/` e funde os hooks em `.claude/settings.json` sem substituir os seus):
   ```bash
   bash Dev/scripts/install-common-rules.sh --hooks=default /caminho/do/projeto
   # ou através do CLI: npx @the-bearded-bear/claude-craft install . --hooks=default
   ```
   - `--hooks=default` (predefinição): guardas de segurança, verificação de segredos, avisos sobre saídas volumosas, reinjeção do contexto após a compactação.
   - `--hooks=full`: `default` mais a barreira de testes Stop, o lint após edição, a notificação Slack, as métricas de sessão e as pistas de recuperação após falha de ferramenta.
   - `--hooks=none`: sem hooks. Acrescente `,memory` (ex.: `--hooks=default,memory`) para o add-on de memória SQLite entre sessões (requer `sqlite3` e `jq`).

2. **Personalizar**: edite os scripts em `.claude/hooks/` conforme as suas ferramentas. Voltar a executar o instalador nunca remove nem reescreve os seus próprios hooks.

3. **Fundir à mão** se preferir: os fragmentos são `hooks.default.json`, `hooks.full.json` e `hooks.memory.json` (`node <claude-craft>/Dev/scripts/lib/merge-hooks.mjs add --settings .claude/settings.json --fragment <fragmento>`). Exemplos para adaptar são copiados para `.claude/templates/hooks/`.

## Hooks disponíveis

| Hook | Função | Evento | Perfil |
|------|--------|--------|--------|
| `guard-network.sh` | Bloqueia descarregar e executar (`curl \| sh`) | PreToolUse | default |
| `block-dangerous-commands.sh` | Bloqueia `rm -rf /`, `sudo`, `chmod 777`... | PreToolUse | default |
| `pre-commit-check.sh` | Bloqueia segredos nos commits | PreToolUse | default |
| `protect-sensitive-files.sh` | Bloqueia a edição de `.env`, chaves... | PreToolUse | default |
| `output-size-hint.sh` | Aconselha resumir as saídas grandes | PostToolUse | default |
| `post-edit-lint.sh` | Lint automático após editar | PostToolUse | full |
| `quality-gate.sh` | Executa os testes antes de terminar | Stop | full |
| `notify-slack.sh` | Notificações Slack | Notification | full |
| `session-init.sh` | Deteta a stack, exporta variáveis seguras de `.env.local` | SessionStart | full |
| `session-end.sh` | Registo e métricas de sessão | SessionEnd | full |
| `post-tool-failure.sh` | Pistas de recuperação após falha de ferramenta | PostToolUseFailure | full |
| `pre-compact.sh` | Guarda o estado BMAD antes da compactação | PreCompact | opcional (não ligado) |
| `output-filter.sh` | Trunca as saídas com mais de 50 KB | PostToolUse | opcional (exemplo) |

## Convém saber

- O payload chega como **JSON no stdin**; só o **código de saída 2** bloqueia (qualquer outro código diferente de zero é um erro não bloqueante).
- Só `hookSpecificOutput.additionalContext` chega ao modelo; o stdout em texto simples do PreCompact é lido como instruções de compactação.
- Os scripts precisam de `jq` ou `node` para ler o payload: as guardas de segurança bloqueiam se nenhum estiver disponível, os hooks informativos não fazem nada.

## Mais informações

Documentação completa: [docs/HOOKS.md](/docs/HOOKS.md) e a referência oficial <https://code.claude.com/docs/en/hooks>.
