# Qual caminho seguir? Seu workflow em 30 segundos

> **Para quem?** Para qualquer pessoa prestes a começar com o Claude Craft e que se pergunta: «quais comandos executo e em que ordem?». Responda a duas perguntas e siga um único caminho.
>
> **Regra prática:** uma situação = um caminho = uma sequência curta de comandos. Você nunca precisa dos outros 100+ comandos para começar.

---

## 1. A árvore de decisão

```
                    O que você vai fazer hoje?
                           │
        ┌──────────────┬───┴──────────┬──────────────────┐
        ▼              ▼              ▼                  ▼
  Um produto       Código           Um bug a         Um sprint planejado
  novo, do zero    existente, ainda corrigir         que você quer concluir
                   sem backlog                       sem supervisão
        │              │              │                  │
        ▼              ▼              ▼                  ▼
   GREENFIELD      BROWNFIELD      BUGFIX         SPRINT AUTÔNOMO
  /workflow:init  /project:reverse scan  /qa:tdd   /workflow:auto-sprint N
        │              │        (+ Quick Flow)          │
        ▼              ▼              ▼                  ▼
     Seção 2        Seção 3       Seção 4            Seção 5

  Perdido a qualquer momento?  →  /workflow:status   (Seção 6)
```

Não tem certeza? Faça-se estas perguntas:

1. **Já existe código?** Não → Greenfield. Sim → pergunta 2.
2. **Já existe um backlog (épicos e histórias)?** Não → Brownfield. Sim → pergunta 3.
3. **É um único bug?** Sim → Bugfix. Não → continue o sprint com `/workflow:start N` ou entregue-o ao Sprint autônomo.

---

## 2. Greenfield: um produto novo

Você tem uma ideia e um repositório vazio. Siga o caminho principal, uma fase de cada vez:

```
/workflow:init  →  /workflow:plan  →  /workflow:design  →  /workflow:start 1
                →  /workflow:implement  →  /workflow:review  →  /workflow:retro
```

| Etapa | Comando | O que você obtém |
|-------|---------|------------------|
| 1 | `/workflow:init` | Análise do projeto, track recomendado (Quick, Standard ou Enterprise) e `.bmad/sprint-status.yaml` |
| 2 | `/workflow:plan` | PRD, personas e backlog gerado |
| 3 | `/workflow:design` | Especificação técnica e arquitetura |
| 4 | `/workflow:start 1` | Sprint 1 preparado: histórias selecionadas e prontas para desenvolvimento |
| 5 | `/workflow:implement` | Histórias construídas com TDD (Red → Green → Refactor) |
| 6 | `/workflow:review` | Preparação da revisão do sprint |
| 7 | `/workflow:retro` | Retrospectiva e retorno a `/workflow:start 2` |

Para uma versão narrada passo a passo, leia o [tutorial do workflow completo](10-complete-workflow.md).

---

## 3. Brownfield: código existente, sem backlog

Você herdou (ou já escreveu) uma base de código, mas ninguém documentou o que ela faz. Primeiro faça a engenharia reversa do produto e depois junte-se ao caminho principal:

```
/project:reverse scan  →  /project:reverse prd  →  /project:reverse stories
               →  /project:reverse gaps  →  /workflow:start
```

| Etapa | Comando | O que você obtém |
|-------|---------|------------------|
| 1 | `/project:reverse scan` | Inventário da base de código: stack, estrutura, módulos |
| 2 | `/project:reverse prd` | Um PRD reconstruído a partir do que o código realmente faz |
| 3 | `/project:reverse stories` | Histórias de usuário deduzidas das funcionalidades existentes |
| 4 | `/project:reverse gaps` | Funcionalidades ausentes, testes ausentes, dívida técnica |
| 5 | `/workflow:start` | Primeiro sprint planejado a partir das lacunas; continue com `/workflow:implement` |

Veja também o [guia de integração em um projeto existente](09-setup-existing-project.md).

---

## 4. Bugfix: reproduzir primeiro, corrigir depois

Um bug não precisa de PRD. Use o track mais leve e deixe o teste conduzir a correção:

```
/qa:tdd        ← escreva PRIMEIRO o teste que reproduz o bug (ele deve falhar)
/workflow:init --quick    ← track Quick Flow: apenas implementação
```

1. Execute `/qa:tdd` e descreva o bug. O teste que o reproduz é escrito **antes** de qualquer correção e deve falhar.
2. Execute `/workflow:init --quick` para forçar o track Quick Flow (sem fases de planejamento nem de design).
3. Corrija o código até o teste passar e depois refatore. O teste permanece na suíte como proteção contra regressões: um bug corrigido nunca deve voltar.

Veja o [guia de correção de bugs](04-bug-fixing.md) para mais detalhes.

---

## 5. Sprint autônomo: um comando, do início ao merge

Quando o trabalho já está planejado, deixe o Claude Craft conduzir o sprint inteiro:

```
/workflow:auto-sprint N
```

**Pré-requisitos**

- Existe um backlog (vindo do caminho Greenfield ou Brownfield).
- O sprint `N` está planejado.

**O que ele faz:** encadeia o início, a decomposição em tarefas, a validação, a implementação, a pull request, a CI, a revisão, a retrospectiva e, por fim, o merge. A execução termina com a **PR, uma CI verde e o merge**. Você revisa o resultado em vez de digitar cada comando.

Prefere controle a velocidade? Fique no caminho principal manual da Seção 2.

---

## 6. Onde estou?

A qualquer momento, seja qual for o caminho:

```
/workflow:status
```

O comando mostra a fase atual, o progresso do sprint e a próxima ação recomendada.

> **Fonte única da verdade:** `.bmad/sprint-status.yaml` guarda o status de cada história (`backlog → ready-for-dev → in-progress → review → done`, ou `blocked`). Ele é criado por `/workflow:init`, e todo comando o lê e o atualiza. Se duas visões divergirem, este arquivo prevalece.

---

## Resumo rápido

| Situação | Comece com | Depois |
|----------|------------|--------|
| Produto novo | `/workflow:init` | `/workflow:plan` → `/workflow:design` → `/workflow:start 1` |
| Código existente, sem backlog | `/project:reverse scan` | `/project:reverse prd` → `/project:reverse stories` → `/project:reverse gaps` → `/workflow:start` |
| Bug | `/qa:tdd` | `/workflow:init --quick` |
| Sprint planejado, sem intervenção | `/workflow:auto-sprint N` | Revisar a PR |
| Perdido | `/workflow:status` | Seguir a ação recomendada |
