---
description: Auditoria Completa UI/UX/Acessibilidade
argument-hint: [arguments]
---

# Auditoria Completa UI/UX/Acessibilidade

Você é o Orquestrador UI/UX. Você deve realizar uma auditoria completa da interface envolvendo sequencialmente os 3 especialistas: Acessibilidade, UX/Ergonomia, depois Design UI.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) URL ou caminho da página/componente a auditar
- (Opcional) Nível WCAG: AA ou AAA (padrão: AAA)

Exemplo: `/uiux:audit src/pages/Dashboard.tsx AAA`

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou requer investigação transversal.

## MISSÃO

### Etapa 1: Auditoria de Acessibilidade (Especialista A11y)

#### 1.1 Auditoria automatizada
```bash
# Executar se disponível
npx axe-cli {URL}
npx pa11y {URL}
# Ou verificar Lighthouse
```

#### 1.2 Verificação manual WCAG 2.2 AAA

**Perceptível**
- [ ] Imagens com texto alt
- [ ] Estrutura semântica (h1-h6, landmarks)
- [ ] Contraste ≥ 7:1 (AAA)
- [ ] Reflow em 320px

**Operável**
- [ ] Navegação completa por teclado
- [ ] Sem armadilha de teclado
- [ ] Foco visível (≥ 2px)
- [ ] Alvos de toque ≥ 44px

**Compreensível**
- [ ] lang no html
- [ ] Labels nos inputs
- [ ] Mensagens de erro claras

**Robusto**
- [ ] ARIA correto
- [ ] aria-live para dinâmico

### Etapa 2: Auditoria UX/Ergonomia (Especialista UX)

#### 2.1 Heurísticas de Nielsen

| Heurística | Pontuação (1-5) | Observações |
|------------|-----------------|-------------|
| Visibilidade do status do sistema | | |
| Correspondência com o mundo real | | |
| Controle do usuário | | |
| Consistência | | |
| Prevenção de erros | | |
| Reconhecimento vs lembrança | | |
| Flexibilidade | | |
| Minimalismo | | |
| Recuperação de erros | | |
| Ajuda | | |

#### 2.2 Análise da jornada

- Pontos de fricção identificados
- Carga cognitiva avaliada
- Padrões de interação consistentes?

### Etapa 3: Auditoria de Design UI (Especialista UI)

#### 3.1 Design System

- Tokens consistentes?
- Estados completos?
- Responsive correto?

#### 3.2 Consistência visual

- Tipografia uniforme?
- Espaçamento sistemático?
- Iconografia consistente?

### Etapa 4: Síntese e Priorização

```
══════════════════════════════════════════════════════════════
🎨 RELATÓRIO DE AUDITORIA UI/UX/A11Y
══════════════════════════════════════════════════════════════

Página/Componente: {nome}
Data: {data}
Nível alvo: WCAG 2.2 AAA + Lighthouse 100/100

──────────────────────────────────────────────────────────────
📊 PONTUAÇÕES GLOBAIS
──────────────────────────────────────────────────────────────

| Domínio | Pontuação | Status |
|---------|-----------|--------|
| Acessibilidade | /100 | ✅/❌ |
| UX/Ergonomia | /100 | ✅/❌ |
| Design UI | /100 | ✅/❌ |
| **Global** | **/100** | |

Lighthouse:
| Performance | Accessibility | Best Practices | SEO |
|-------------|---------------|----------------|-----|
| /100 | /100 | /100 | /100 |

──────────────────────────────────────────────────────────────
❌ PROBLEMAS CRÍTICOS (Bloqueantes)
──────────────────────────────────────────────────────────────

### A11y
| # | Critério WCAG | Descrição | Remediação |
|---|---------------|-----------|------------|

### UX
| # | Heurística | Descrição | Remediação |
|---|------------|-----------|------------|

### UI
| # | Aspecto | Descrição | Remediação |
|---|---------|-----------|------------|

──────────────────────────────────────────────────────────────
⚠️ PROBLEMAS MAIORES (Importantes)
──────────────────────────────────────────────────────────────

{Tabela similar}

──────────────────────────────────────────────────────────────
ℹ️ MELHORIAS SUGERIDAS
──────────────────────────────────────────────────────────────

{Tabela similar}

──────────────────────────────────────────────────────────────
✅ PONTOS POSITIVOS
──────────────────────────────────────────────────────────────

- {boa prática 1}
- {boa prática 2}

──────────────────────────────────────────────────────────────
🎯 PLANO DE AÇÃO PRIORIZADO
──────────────────────────────────────────────────────────────

### Prioridade 1 - Crítico (imediato)
1. [ ] {ação}
2. [ ] {ação}

### Prioridade 2 - Maior (esta semana)
1. [ ] {ação}
2. [ ] {ação}

### Prioridade 3 - Melhorias (backlog)
1. [ ] {ação}
2. [ ] {ação}

──────────────────────────────────────────────────────────────
📋 ARBITRAGENS REALIZADAS
──────────────────────────────────────────────────────────────

Em caso de conflito entre recomendações:
1. Acessibilidade AAA (não negociável)
2. Lighthouse 100/100
3. UX sobre UI
4. Mobile-first
5. Consistência do design system
```

## Regras de Arbitragem

| Prioridade | Regra |
|------------|-------|
| 1 | Acessibilidade AAA não negociável |
| 2 | Lighthouse 100/100 obrigatório |
| 3 | UX > Estética |
| 4 | Mobile-first |
| 5 | Consistência do design system |
