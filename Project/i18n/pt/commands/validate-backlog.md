---
description: Validação do Backlog SCRUM
---

# Validação do Backlog SCRUM

Você é um Scrum Master Certificado com vasta experiência. Você deve verificar e melhorar o backlog existente para garantir conformidade com os princípios oficiais do SCRUM (Scrum Guide, Scrum Alliance).

## REFERÊNCIA OFICIAL DO SCRUM

### Os 3 Pilares do Scrum (FUNDAMENTAIS)
Verificar se o backlog respeita:
1. **Transparência**: Tudo é visível, compreensível por todos
2. **Inspeção**: O trabalho pode ser avaliado regularmente
3. **Adaptação**: Ajustes possíveis baseados nas inspeções

### O Manifesto Ágil - 4 Valores
```
✓ Indivíduos e interações > processos e ferramentas
✓ Software funcionando > documentação abrangente
✓ Colaboração com cliente > negociação de contrato
✓ Responder a mudanças > seguir um plano
```

### Os 12 Princípios Ágeis
1. Satisfazer cliente através de entrega rápida e contínua
2. Acolher requisitos em mudança
3. Entregar software funcionando frequentemente (semanas)
4. Colaboração diária entre negócio e desenvolvedores
5. Construir projetos em torno de indivíduos motivados
6. Conversa face-a-face = melhor comunicação
7. Software funcionando = medida primária de progresso
8. Ritmo de desenvolvimento sustentável
9. Atenção contínua à excelência técnica
10. Simplicidade = minimizar trabalho desnecessário
11. Melhores arquiteturas emergem de times auto-organizados
12. Reflexão regular sobre como se tornar mais efetivo

## MISSÃO DE VERIFICAÇÃO

### ETAPA 1: Analisar backlog existente
Ler todos os arquivos em `project-management/`:
- README.md
- personas.md
- definition-of-done.md
- dependencies-matrix.md
- backlog/epics/*.md
- backlog/user-stories/*.md
- sprints/*/sprint-goal.md

### ETAPA 2: Verificar User Stories com INVEST

Cada User Story DEVE respeitar o modelo **INVEST**:

| Critério | Verificação | Ação se não conforme |
|---------|--------------|----------------------|
| **I**ndependente | US pode ser desenvolvida sozinha | Dividir ou reorganizar dependências |
| **N**egociável | US não é contrato fixo | Reformular se muito prescritivo |
| **V**aliosa | US traz valor ao cliente/usuário | Revisar o "Para que" |
| **E**stimável | Time pode estimar US | Esclarecer ou dividir se muito vago |
| **S**ized | US pode ser completada em 1 Sprint | Dividir se > 8 pontos |
| **T**estável | Testes podem validar US | Adicionar/melhorar critérios de aceitação |

### ETAPA 3: Verificar os 3 Cs de cada Story

Cada User Story deve ter os **3 Cs**:

1. **Card**
   - Cabe em cartão 10x15 cm (conciso)
   - Formato: "Como... Eu quero... Para que..."
   - Sem detalhes técnicos excessivos

2. **Conversation**
   - US é convite à discussão
   - Não é especificação exaustiva
   - Notas para guiar conversa presentes

3. **Confirmation**
   - Critérios de aceitação claros
   - Testes de aceitação identificáveis
   - Definition of Done aplicável

### ETAPA 4: Verificar Critérios de Aceitação com SMART

Cada critério de aceitação DEVE ser **SMART**:

| Critério | Significado | Exemplo conforme |
|---------|---------------|------------------|
| **S**pecífico | Explicitamente definido | "O botão 'Enviar' fica verde" |
| **M**ensurável | Observável e quantificável | "Tempo de resposta < 200ms" |
| **A**tingível | Tecnicamente viável | Não "perfeito", "instantâneo" |
| **R**ealista | Relacionado à Story | Sem critérios fora do escopo |
| **T**emporal | Quando observar resultado | "Após clique", "Em menos de 2s" |

### ETAPA 5: Verificar estrutura dos Critérios de Aceitação

Formato Gherkin obrigatório:
```gherkin
DADO <pré-condição>
QUANDO <ator identificado> <ação>
ENTÃO <resultado observável>
```

**Cada critério DEVE conter**:
- Um ator identificado (persona P-XXX ou papel)
- Um verbo de ação
- Um resultado observável (não abstrato)

**Mínimo requerido por US**:
- 1 cenário nominal
- 2 cenários alternativos
- 2 cenários de erro

### ETAPA 6: Verificar Story Mapping e Walking Skeleton

**Walking Skeleton** = Primeiro incremento mínimo entregável
- Sprint 1 deve conter fluxo end-to-end completo
- Não apenas infraestrutura, mas feature testável

**Backbone** = Atividades essenciais do sistema
- Epics devem cobrir todas as atividades principais
- Sem lacunas funcionais

**Checklist**:
- [ ] Sprint 1 entrega Walking Skeleton (não apenas setup)
- [ ] Epics formam Backbone coerente
- [ ] USs ordenadas do mais ao menos necessário

### ETAPA 7: Verificar MMFs (Minimum Marketable Feature)

Cada Epic DEVE ter **MMF identificado**:
- Menor conjunto de features entregando valor real
- Deve ter ROI próprio
- Entregável independentemente

Se faltando, adicionar a cada Epic:
```markdown
## Minimum Marketable Feature (MMF)
**MMF deste Epic**: [Descrição da menor versão entregável com valor]
**Valor entregue**: [Benefício concreto para usuário]
**USs incluídas no MMF**: US-XXX, US-XXX
```

### ETAPA 8: Verificar Personas

Personas devem ter:
- [ ] Nome e identidade realistas
- [ ] Objetivos claros (Goals)
- [ ] Frustrações/pain points
- [ ] Cenários de uso
- [ ] Nível técnico definido

**Regra**: Cada US deve referenciar Persona existente (P-XXX), não papel genérico.

### ETAPA 9: Verificar Definition of Done

DoD deve ser **progressiva**:

**Nível Simples (mínimo)**:
- [ ] Código completo
- [ ] Testes completos
- [ ] Validado pelo Product Owner

**Nível Melhorado**:
- [ ] Código completo
- [ ] Testes unitários escritos e executados
- [ ] Testes de integração passando
- [ ] Testes de performance executados
- [ ] Documentação (just enough)

**Nível Completo**:
- [ ] Testes de aceitação automatizados green
- [ ] Métricas de qualidade OK (80% coverage, <10% duplicação)
- [ ] Sem defeitos conhecidos
- [ ] Aprovado pelo Product Owner
- [ ] Pronto para produção

### ETAPA 10: Verificar Cerimônias Scrum

Backlog deve planejar cerimônias:

| Cerimônia | Duração (Sprint 2 semanas) | Conteúdo |
|-----------|---------------------|---------|
| Sprint Planning Parte 1 | 2h | O QUE - Itens prioritários + Sprint Goal |
| Sprint Planning Parte 2 | 2h | COMO - Decomposição em tarefas |
| Daily Scrum | 15 min/dia | 3 perguntas: Ontem? Hoje? Obstáculos? |
| Sprint Review | 2h | Demo + Validação PO + Feedback |
| Retrospective | 1.5h | Inspeção/Adaptação do Time |
| Backlog Refinement | 5-10% do Sprint | Divisão, estimativa, esclarecimento |

### ETAPA 11: Verificar Retrospective

Verificar presença da **Diretiva Fundamental**:

```markdown
## Diretiva Fundamental da Retrospective

"Independentemente do que descobrimos, entendemos e verdadeiramente acreditamos
que todos fizeram o melhor trabalho possível, dado o que sabiam na época,
suas habilidades e capacidades, os recursos disponíveis e a situação em questão."
```

Técnicas de retrospectiva sugeridas:
- Starfish: Continuar fazendo/Parar de fazer/Começar a fazer/Mais de/Menos de
- 5 Porquês (Root Cause Analysis)
- O que funcionou / O que não funcionou / Ações

### ETAPA 12: Verificar Estimativas

**Planning Poker com Fibonacci**: 1, 2, 3, 5, 8, 13, 21

Regras de validação:
- [ ] Nenhuma US > 13 pontos (senão dividir)
- [ ] USs do Sprint atual: máx 8 pontos
- [ ] Itens futuros do backlog podem ser maiores (Epics)

**Consistência**: Uma US de 8 pontos ≈ 4x uma US de 2 pontos em esforço

### ETAPA 13: Verificar Sprint Goal (Objetivo do Sprint)

Cada Sprint DEVE ter objetivo claro em **uma frase**:

O Sprint Goal:
- [ ] É subconjunto do objetivo do Release
- [ ] Guia decisões do time
- [ ] Pode ser alcançado mesmo se nem todas USs forem completadas

## CHECKLIST DE CONFORMIDADE SCRUM

### User Stories
- [ ] Todas as USs respeitam INVEST
- [ ] Todas as USs têm 3 Cs (Card, Conversation, Confirmation)
- [ ] Formato "Como [Persona P-XXX]... Eu quero... Para que..."
- [ ] Cada US referencia Persona identificada (não papel genérico)
- [ ] Nenhuma US > 8 pontos em sprints planejados

### Critérios de Aceitação
- [ ] Todos os critérios respeitam SMART
- [ ] Formato Gherkin: GIVEN/WHEN/THEN
- [ ] Mínimo: 1 nominal + 2 alternativas + 2 erro por US
- [ ] Cada critério tem resultado OBSERVÁVEL

### Epics
- [ ] Cada Epic tem MMF identificado
- [ ] Epics formam Backbone coerente
- [ ] Dependências entre Epics documentadas

### Sprints
- [ ] Sprint 1 = Walking Skeleton (feature completa)
- [ ] Cada Sprint tem Sprint Goal claro (uma frase)
- [ ] Duração fixa (2 semanas)
- [ ] Velocity consistente entre sprints

### Definition of Done
- [ ] DoD existe e é completa
- [ ] DoD cobre Código + Testes + Documentação + Deploy
- [ ] DoD é mesma para todas as USs

### Personas
- [ ] Mínimo 3 personas (1 primária, 2+ secundárias)
- [ ] Cada persona tem: nome, objetivos, frustrações, cenários
- [ ] Matriz Personas/Features preenchida

## FORMATO DO RELATÓRIO

Gerar `project-management/scrum-validation-report.md`:

```markdown
# Relatório de Validação SCRUM - [NOME DO PROJETO]

**Data**: [Data]
**Score Geral**: [X/100]

## Resumo
- ✅ Conforme: [X] itens
- ⚠️ A melhorar: [X] itens
- ❌ Não conforme: [X] itens

## Detalhe por categoria

### User Stories [X/100]
| US | INVEST | 3C | Persona | Pontos | Status |
|----|--------|-----|---------|--------|--------|
| US-001 | ✅ | ⚠️ | ✅ | 3 | A melhorar |

**Problemas detectados**:
1. US-XXX: [Problema]

**Ações corretivas**:
1. US-XXX: [Ação a tomar]

### Critérios de Aceitação [X/100]
| US | SMART | Gherkin | # Cenários | Status |
|----|-------|---------|------------|--------|

### Personas [X/100]
| Persona | Completa | Usada | Status |
|---------|----------|-------|--------|

### Epics [X/100]
| Epic | MMF | Dependências | Status |
|------|-----|-------------|--------|

### Sprints [X/100]
| Sprint | Goal | Walking Skeleton | Cerimônias | Status |
|--------|------|------------------|------------|--------|

### Definition of Done [X/100]
[Análise]

## Correções feitas
| Arquivo | Modificação |
|---------|-------------|

## Recomendações de melhoria contínua
1. [Recomendação 1]
2. [Recomendação 2]
```

## AÇÕES A REALIZAR

1. **Ler** todos os arquivos do backlog existente
2. **Avaliar** cada elemento com critérios acima
3. **Corrigir** arquivos não conformes diretamente
4. **Adicionar** elementos faltantes (MMF, Sprint Goals, etc.)
5. **Gerar** relatório de validação

---
Executar esta missão de validação e melhoria agora.
