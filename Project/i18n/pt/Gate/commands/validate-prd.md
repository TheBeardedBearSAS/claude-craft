---
description: Validar o PRD contra o quality gate (≥80%)
argument-hint: [arquivo-prd]
---

# Validar Gate PRD

Validar um Documento de Requisitos do Produto contra o quality gate PRD.
O PRD deve obter pelo menos 80% para ser aprovado.

## Argumentos

$ARGUMENTS (formato: [arquivo-prd])
- **arquivo-prd** (opcional): Caminho para o arquivo PRD. Padrao: `docs/prd.md`

## Criterios do Gate

| Criterio | Peso | Obrigatorio | Descricao |
|----------|------|-------------|-----------|
| Declaracao do problema | 15% | Sim | Articulacao clara do problema |
| Usuarios-alvo | 15% | Sim | Audiencia/personas definidos |
| Objetivos | 15% | Sim | Objetivos mensuraveis |
| Metricas de sucesso | 15% | Sim | KPIs e medicoes |
| Escopo | 10% | Sim | O que esta incluido/excluido |
| Visao geral User Stories | 10% | Sim | Lista de funcionalidades |
| Premissas | 10% | Nao | Premissas documentadas |
| Riscos | 10% | Nao | Identificacao de riscos |

**Limite: 80%**

## Processo

### Etapa 1: Localizar o arquivo PRD

1. Usar o caminho fornecido ou o padrao `docs/prd.md`
2. Verificar se o arquivo existe
3. Carregar o conteudo para analise

### Etapa 2: Validar cada criterio

Para cada criterio, verificar:
- O conteudo existe com as palavras-chave relevantes
- A secao possui um tamanho minimo de conteudo
- Os elementos obrigatorios estao presentes

### Etapa 3: Calcular a pontuacao

Calculo da pontuacao:
- Cada criterio possui um peso (porcentagem)
- Aprovar um criterio adiciona seu peso a pontuacao
- Pontuacao final = soma dos pesos aprovados

### Etapa 4: Gerar o relatorio

Exibir:
- Resultados por criterio
- Pontuacao total e limite
- Status Aprovado/Reprovado
- Sugestoes de melhoria

## Formato de Saida

### PRD Validado

```
═══════════════════════════════════════════════════════
            Validacao Gate PRD
═══════════════════════════════════════════════════════

Arquivo: docs/prd.md
Limite: 80%

Resultados da Validacao:
──────────────────────────────────────────────────────
✅ Declaracao do problema (15%)
✅ Usuarios-alvo (15%)
✅ Objetivos (15%)
✅ Metricas de sucesso (15%)
✅ Escopo (10%)
✅ Visao geral User Stories (10%)
✅ Premissas (10%)
⚠️ Riscos (10%) - Parcial

Pontuacao: 90/100 (90%)
──────────────────────────────────────────────────────

✅ GATE PRD APROVADO

Pronto para avancar para a fase Tech Spec.
Proximo: /pm:handoff architect
═══════════════════════════════════════════════════════
```

### PRD Reprovado

```
═══════════════════════════════════════════════════════
            Validacao Gate PRD
═══════════════════════════════════════════════════════

Arquivo: docs/prd.md
Limite: 80%

Pontuacao: 50/100 (50%)
──────────────────────────────────────────────────────

❌ GATE PRD REPROVADO (necessario 80%, obtido 50%)

Acoes Necessarias:
──────────────────────────────────────────────────────
1. Adicionar objetivos mensuraveis
2. Definir metricas de sucesso e KPIs
3. Documentar as premissas
4. Adicionar a avaliacao de riscos

Reexecutar apos correcoes: /gate:validate-prd
═══════════════════════════════════════════════════════
```

## Exemplo

```
/gate:validate-prd
/gate:validate-prd docs/feature-prd.md
```
