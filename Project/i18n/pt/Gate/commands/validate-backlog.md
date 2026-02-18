---
description: Validar as stories do backlog contra os criterios INVEST
argument-hint: [story-id]
---

# Validar Gate Backlog

Validar as User Stories contra os criterios INVEST.
Todas as stories devem passar nos 6 criterios INVEST.

## Argumentos

$ARGUMENTS (formato: [story-id])
- **story-id** (opcional): Story especifica a validar (ex: US-001). Se omitido, valida todas as stories.

## Criterios INVEST

| Letra | Criterio | Descricao | Verificacoes |
|-------|----------|-----------|--------------|
| **I** | Independente | Pode ser desenvolvida isoladamente | Sem dependencias bloqueadoras |
| **N** | Negociavel | Os detalhes podem ser discutidos | Possui descricao, nao super-especificada |
| **V** | Valiosa | Agrega valor ao usuario | Possui criterios de aceitacao |
| **E** | Estimavel | Pode ser estimada | Possui story points |
| **S** | Suficientemente pequena | Cabe em um sprint | ≤ 8 story points |
| **T** | Testavel | Pode ser testada | Possui criterios de aceitacao |

**Limite: 6/6 para cada story**

## Formato de Saida

### Todas as Stories Aprovadas

```
═══════════════════════════════════════════════════════
          Validacao Gate INVEST Backlog
═══════════════════════════════════════════════════════

Validando 8 stories...

Resultados:
──────────────────────────────────────────────────────
✅ US-001: Login de usuario
   [I] ✓ Independente - Sem dependencias
   [N] ✓ Negociavel - Descricao clara
   [V] ✓ Valiosa - 3 criterios de aceitacao
   [E] ✓ Estimavel - 5 story points
   [S] ✓ Suficientemente pequena - 5 ≤ 8 pontos
   [T] ✓ Testavel - CA Gherkin definidos
   Pontuacao: 6/6 ✅

Resumo:
──────────────────────────────────────────────────────
Stories validadas: 8
Aprovadas (6/6): 8
Alertas (4-5/6): 0
Reprovadas (<4/6): 0

✅ GATE BACKLOG APROVADO
═══════════════════════════════════════════════════════
```

### Stories Reprovadas

```
═══════════════════════════════════════════════════════
          Validacao Gate INVEST Backlog
═══════════════════════════════════════════════════════

⚠️ US-002: Cadastro de usuario
   Pontuacao: 4/6 ⚠️
   Ausente: [E] Estimavel - Sem story points

❌ US-003: Refatoracao completa do sistema auth
   Pontuacao: 3/6 ❌
   Ausente: [I] Independente, [N] Negociavel, [S] Suficientemente pequena

❌ GATE BACKLOG REPROVADO

Acoes Necessarias:
──────────────────────────────────────────────────────
US-002:
  → Adicionar a estimativa em story points
  → Executar: /project:update-story US-002 --points 3

US-003:
  → Dividir em stories menores (≤8 pontos cada)
  → Considerar: /project:split-story US-003

Reexecutar apos correcoes: /gate:validate-backlog
═══════════════════════════════════════════════════════
```

## Exemplo

```
/gate:validate-backlog
/gate:validate-backlog US-005
```

## Próximo passo

```
╔══════════════════════════════════════════════════════════╗
║                    PRÓXIMO PASSO                         ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Se PASS (≥ limiar):                                     ║
║  → /gate:validate-sprint                                 ║
║    Validar a prontidão do sprint                         ║
║                                                          ║
║  Se FAIL (< limiar):                                     ║
║  → Corrigir os problemas identificados                   ║
║  → /gate:validate-backlog (re-run após correções)        ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
