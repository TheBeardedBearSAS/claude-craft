# Gestao de Contexto

## Visao Geral

A janela de contexto e **O recurso critico** no Claude Code. Cada token conta. Uma gestao eficaz do contexto e a diferenca entre um assistente produtivo e um que perde o fio.

> **Fonte:** Recomendacao #1 da Anthropic — "The context window is the single most important resource to manage."

**Principios:**
- O contexto e um recurso finito e precioso
- CLAUDE.md e as regras competem pela atencao do modelo
- Usar sub-agentes para as investigacoes
- Limpar o contexto entre tarefas

---

## Sumario

1. [Regras de tamanho CLAUDE.md](#regras-de-tamanho-claudemd)
2. [Limpeza do contexto](#limpeza-do-contexto)
3. [Sub-agentes para investigacoes](#sub-agentes-para-investigacoes)
4. [Context compaction](#context-compaction)
5. [Loops de verificacao](#loops-de-verificacao)
6. [Plan Mode](#plan-mode)
7. [Rastreamento de tokens](#rastreamento-de-tokens)
8. [Checklist](#checklist)

---

## Regras de tamanho CLAUDE.md

### Limite recomendado

> **CLAUDE.md principal: 150-200 linhas maximo.**
> Cada instrucao adicional dilui a atencao nas instrucoes existentes.

### Estrategia de modularidade

```
.claude/
  CLAUDE.md              <- Resumo (150-200 linhas max)
  rules/                 <- Regras detalhadas (carregadas sob demanda)
  references/            <- Documentacao tecnica
  skills/                <- Competencias sob demanda
```

### Boas praticas

| Pratica | Descricao |
|---------|-----------|
| **CLAUDE.md curto** | Visao geral, links para regras |
| **Regras modulares** | Um arquivo por tema em `.claude/rules/` |
| **Referencias separadas** | Docs tecnicos em `.claude/references/` |
| **Skills sob demanda** | Competencias carregadas apenas quando necessarias |

---

## Limpeza do contexto

### Quando usar `/clear`

```
Usar /clear:
- Entre duas tarefas NAO relacionadas
- Apos uma longa investigacao
- Quando o contexto ultrapassa 50% da janela
- Antes de comecar uma nova feature

NAO usar /clear:
- No meio de uma tarefa em andamento
- Se o contexto anterior e necessario
- Logo apos carregar arquivos relevantes
```

### Sinais de poluicao do contexto

- Claude repete informacoes ja fornecidas
- As respostas tornam-se menos precisas
- Claude confunde elementos de tarefas diferentes
- Os erros aumentam apesar de instrucoes claras

---

## Sub-agentes para investigacoes

### Principio

> **Delegar pesquisas aos sub-agentes para manter o contexto principal limpo.**

Os sub-agentes (ferramenta Task) tem sua propria janela de contexto. Usar um sub-agente para explorar o codebase evita poluir o contexto principal.

### Quando usar um sub-agente

| Situacao | Acao |
|----------|------|
| Buscar arquivo/padrao especifico | Glob/Grep diretamente |
| Explorar arquitetura desconhecida | Sub-agente Explore |
| Investigacao multi-arquivo (> 3) | Sub-agente Explore |
| Planejar uma implementacao | Sub-agente Plan |
| Tarefa independente em paralelo | Sub-agente general-purpose |

---

## Context compaction

### Funcionamento

O Claude Code compacta automaticamente o contexto quando se aproxima dos limites da janela. Mensagens antigas sao resumidas para liberar espaco.

### Hooks de re-injecao

Usar o hook `SessionStart` com o matcher `compact` para re-injetar o contexto critico apos uma compactacao:

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "compact",
        "command": "cat .claude/context-essentials.md"
      }
    ]
  }
}
```

---

## Loops de verificacao

### Principio

> **Sempre fornecer meios de verificacao: testes, screenshots, outputs esperados.**
> Fonte: "2-3x improvement in final result quality" (Anthropic)

### Padrao: Especificacao-Implementacao-Verificacao

```
1. ESPECIFICACAO
   -> Definir o comportamento esperado
   -> Fornecer exemplos de input/output
   -> Escrever testes primeiro (TDD)

2. IMPLEMENTACAO
   -> Codificar a solucao

3. VERIFICACAO
   -> Executar testes
   -> Comparar com outputs esperados
   -> Corrigir se necessario
```

---

## Plan Mode

### Quando investir em planejamento

| Situacao | Acao |
|----------|------|
| Bug simples, 1 arquivo | Corrigir diretamente |
| Feature simples, < 3 arquivos | Implementar diretamente |
| Feature complexa, > 3 arquivos | Plan Mode |
| Refactoring arquitetural | Plan Mode |
| Escolha tecnologica | Plan Mode |
| Impacto incerto | Plan Mode |

---

## Rastreamento de tokens

### Limites de acao

| Contexto usado | Acao |
|----------------|------|
| < 30% | Normal, continuar |
| 30-60% | Monitorar, evitar leituras desnecessarias |
| 60-80% | Delegar a sub-agentes, considerar /clear |
| > 80% | Compactacao iminente, salvar contexto critico |

---

## Worktrees paralelas

### Principio

> **"Single biggest productivity unlock"** — Boris Cherny (Anthropic)

Usar `git worktree` para trabalhar em multiplas branches simultaneamente com sessoes Claude independentes.

### Setup

```bash
git worktree add ../feature-auth feature/auth
cd ../feature-auth && claude
```

### Padrao Writer/Reviewer

```
Terminal 1 (Writer):
  cd ../feature-auth
  claude "Implementar autenticacao JWT"

Terminal 2 (Reviewer):
  cd ../review-auth
  claude "Revisar o codigo de autenticacao"
```

### Recomendacoes

- 3-5 worktrees maximo
- Uma worktree = uma tarefa
- Remover worktrees concluidas
- Nao compartilhar sessoes entre worktrees

---

## Checklist

### Antes de cada sessao

- [ ] CLAUDE.md < 200 linhas
- [ ] Regras modulares em `.claude/rules/`
- [ ] Contexto limpo

### Durante a sessao

- [ ] Monitorar % de contexto
- [ ] Delegar investigacoes a sub-agentes
- [ ] `/clear` entre tarefas nao relacionadas
- [ ] Fornecer testes/outputs esperados

### Para tarefas complexas

- [ ] Usar Plan Mode
- [ ] Decompor em sub-tarefas
- [ ] Worktrees para paralelismo
- [ ] Loops de verificacao

---

## Recursos

- **Anthropic Best Practices:** [docs.anthropic.com](https://docs.anthropic.com/en/docs/claude-code/overview)
- **Boris Cherny Workflow:** Worktrees paralelas + loops de verificacao
- **Claude Code Context Management:** Context compaction, `/clear`, sub-agentes

---

**Ultima atualizacao:** 2026-02
**Versao:** 1.0.0
**Autor:** The Bearded CTO
