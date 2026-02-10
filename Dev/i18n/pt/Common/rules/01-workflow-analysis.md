# Workflow de Analise Obrigatorio

## Principio Fundamental

**ANTES de qualquer modificacao de codigo (feature, bugfix, refactoring), uma fase de analise aprofundada e OBRIGATORIA.**

Esta regra e CRITICA e NAO NEGOCIAVEL. Ela evita:
- As regressoes
- Os efeitos colaterais inesperados
- A divida tecnica
- Os bugs em producao

---

## Processo em 4 Etapas

### Etapa 1: Compreender a Demanda

**Perguntas a fazer:**
1. Qual e o objetivo preciso?
2. Quais sao os criterios de aceitacao?
3. Ha restricoes (desempenho, seguranca, conformidade)?
4. Qual e o impacto para o usuario?

**Acoes:**
- Reformular a demanda para validacao
- Identificar os use cases envolvidos
- Verificar o alinhamento com os objetivos de negocio

### Etapa 2: Analisar o Codigo Existente

**Arquivos a ler OBRIGATORIAMENTE:**
1. Os arquivos diretamente envolvidos pela modificacao
2. Os arquivos dependentes (que utilizam o codigo modificado)
3. Os testes existentes (para compreender o comportamento esperado)
4. As migracoes de schema (se houver impacto no banco de dados)

**Pontos de atencao:**
- Ha testes que vao quebrar?
- Ha outros modulos que dependem deste codigo?
- O codigo respeita a arquitetura do projeto?
- Ha dados sensiveis?

### Etapa 3: Documentar a Analise

**Conteudo obrigatorio:**

1. **Objetivo** : Descricao clara da modificacao
2. **Arquivos impactados** : Lista exaustiva com justificativa
3. **Impactos** :
   - Breaking changes : sim/nao
   - Migracao DB necessaria : sim/nao
   - Impacto no desempenho : sim/nao
   - Dados sensiveis : sim/nao
4. **Riscos** : Lista + mitigacoes
5. **Abordagem** : Estrategia de implementacao (TDD, refactoring progressivo, etc.)
6. **Testes TDD** : Lista dos testes a escrever ANTES da implementacao

**Exemplo:**

```markdown
## Analise: Adicao de uma funcionalidade de notificacao

### Objetivo
Enviar uma notificacao por email ao criar um pedido.

### Arquivos impactados
- OrderService (adicao de dispatch event)
- NotificationListener (novo)
- EmailService (utilizacao existente)
- Testes unitarios para o listener

### Impactos
- Breaking change: NAO
- Migracao DB: NAO
- Desempenho: Baixo (async recomendado)
- Dados sensiveis: Email do usuario (ja tratado)

### Riscos
1. Sobrecarga de email -> Mitigacao: fila async
2. Email em spam -> Mitigacao: configuracao DKIM/SPF

### Abordagem
1. TDD: escrever testes do listener
2. Implementar o listener
3. Disparar o event a partir do OrderService
4. Testar integracao

### Testes TDD
1. test_should_send_email_on_order_created()
2. test_should_not_send_if_user_opted_out()
3. test_should_handle_email_failure_gracefully()
```

### Etapa 4: Validacao

**Criterios de decisao:**

| Impacto | Acao |
|---------|------|
| **Baixo** (1 arquivo, sem breaking change, < 1h) | Prosseguir diretamente |
| **Medio** (2-5 arquivos, migracao DB, < 4h) | Validar com o usuario |
| **Alto** (> 5 arquivos, breaking changes, refactoring de arquitetura) | Planejamento detalhado + validacao obrigatoria |

**Perguntas de validacao:**
- A abordagem respeita a arquitetura do projeto?
- Os testes TDD sao suficientes?
- Ha uma alternativa mais simples (KISS)?
- Os riscos sao aceitaveis?

---

## Anti-Patterns a Evitar

### Codificar sem ler o codigo existente

```
// RUIM: modificacao sem compreender o impacto
function updateOrder(order) {
  order.status = "confirmed"  // Impacto em outros modulos?
}
```

### Ignorar as dependencias

```
// RUIM: modificacao sem verificar quem utiliza este metodo
function getPrice() {
  return this.price * 0.8  // Quem chama getPrice()?
}
```

### Esquecer os testes

```
// RUIM: sem verificacao dos testes existentes
// Se eu modificar User, quais testes vao quebrar?
```

### Ignorar a seguranca

```
// RUIM: adicionar um campo sensivel sem protecao
class User {
  socialSecurityNumber: string  // Dados sensiveis!
}
```

---

## Checklist Rapida

Antes de qualquer modificacao:

- [ ] Li e compreendi a demanda
- [ ] Li os arquivos envolvidos
- [ ] Identifiquei as dependencias
- [ ] Documentei a analise
- [ ] Avaliei os riscos
- [ ] Defini os testes TDD
- [ ] Validei a abordagem (se impacto medio/alto)
- [ ] Verifiquei a conformidade com arquitetura + SOLID
- [ ] Verifiquei seguranca se dados sensiveis

---

## Workflow Visual

```
+---------------------------------------------------------+
|                    DEMANDA RECEBIDA                       |
+----------------------------+----------------------------+
                             |
                             v
+---------------------------------------------------------+
|             ETAPA 1: COMPREENDER                         |
|  - Objetivo preciso?                                     |
|  - Criterios de aceitacao?                               |
|  - Restricoes?                                           |
+----------------------------+----------------------------+
                             |
                             v
+---------------------------------------------------------+
|             ETAPA 2: ANALISAR                            |
|  - Ler os arquivos envolvidos                            |
|  - Identificar as dependencias                           |
|  - Verificar os testes existentes                        |
+----------------------------+----------------------------+
                             |
                             v
+---------------------------------------------------------+
|             ETAPA 3: DOCUMENTAR                          |
|  - Arquivos impactados                                   |
|  - Riscos + mitigacoes                                   |
|  - Testes TDD a escrever                                 |
+----------------------------+----------------------------+
                             |
                             v
+---------------------------------------------------------+
|             ETAPA 4: VALIDAR                             |
|  - Impacto baixo -> Prosseguir                           |
|  - Impacto medio/alto -> Solicitar validacao             |
+----------------------------+----------------------------+
                             |
                             v
+---------------------------------------------------------+
|                    IMPLEMENTAR                            |
|  1. Escrever os testes (RED)                             |
|  2. Implementar o codigo (GREEN)                         |
|  3. Refatorar (REFACTOR)                                 |
+---------------------------------------------------------+
```

---

## Templates Associados

- `templates/analysis.md` - Template de analise detalhada
- `checklists/new-feature.md` - Checklist nova feature
- `checklists/refactoring.md` - Checklist refactoring

---

**Data da ultima atualizacao:** 2025-01
**Versao:** 1.0.0
**Autor:** The Bearded CTO
