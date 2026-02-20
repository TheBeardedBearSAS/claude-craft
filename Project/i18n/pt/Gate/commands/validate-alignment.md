---
description: Validar o alinhamento spec-código para garantir que a implementação corresponde às especificações
argument-hint: [id-story]
---

# Validar Alinhamento Spec-Código

Validar que a implementação do código está alinhada com as especificações (PRD, user stories, spec técnica). Este gate garante que não ocorreu desvio de especificação durante a implementação.

## Argumentos

$ARGUMENTS (formato: [id-story])
- **id-story** (opcional): ID da story a verificar. Padrão: todas as stories do sprint atual

## Critérios do Gate

| Critério | Peso | Obrigatório | Descrição |
|----------|------|-------------|-----------|
| Cobertura de requirements | 20% | Sim | Todos os FR-xxx do PRD cobertos por stories |
| Mapeamento story-código | 20% | Sim | Todas as stories têm referências de código |
| Mapeamento AC-teste | 20% | Sim | Todos os critérios de aceitação têm testes |
| Aderência ao spec técnico | 15% | Sim | A implementação segue o design do spec técnico |
| Conformidade com a constituição | 15% | Sim | O código respeita a constituição do projeto |
| Detecção de desvio | 10% | Não | Sem alterações de código não referenciadas |

**Limiar: 85%**

## Processo

### Etapa 1: Carregar especificações

1. Carregar o PRD com os IDs de requirements FR-xxx
2. Carregar as user stories com as referências `Implements:`
3. Carregar o spec técnico com o mapeamento de requirements
4. Carregar a constituição do projeto (se existir)

### Etapa 2: Rastreamento para frente (Spec → Código)

Para cada requirement FR-xxx no PRD:
1. Encontrar stories que o implementam (`Implements: FR-xxx`)
2. Para cada story, encontrar arquivos de código com `// Story: US-xxx`
3. Para cada AC, encontrar o teste correspondente
4. Registrar o estado de cobertura

### Etapa 3: Rastreamento para trás (Código → Spec)

Para cada arquivo de código com referências de story:
1. Verificar que a referência de story existe no backlog
2. Verificar que a story está atribuída ao sprint correto
3. Procurar alterações de código sem referências de story (desvio)

### Etapa 4: Validar a constituição

Se `project-management/constitution.md` existir:
1. Verificar conformidade das restrições técnicas
2. Verificar aderência aos princípios de design
3. Verificar objetivos NFR

### Etapa 5: Pontuar e reportar

Calcular pontuação ponderada em todos os critérios. Gerar relatório detalhado.

## Formato de saída

### Gate aprovado

```
╔══════════════════════════════════════════════════════════╗
║          GATE ALINHAMENTO SPEC-CÓDIGO ✅                 ║
╠══════════════════════════════════════════════════════════╣
║ Story: US-012 | Pontuação: 92%                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ ✅ Cobertura requirements     3/3 FR-xxx cobertos        ║
║ ✅ Mapeamento story-código    4 arquivos ref. US-012     ║
║ ✅ Mapeamento AC-teste        3/3 ACs têm testes         ║
║ ✅ Aderência spec técnico     Design conforme ao spec    ║
║ ✅ Conformidade constituição  Todas restrições OK        ║
║ ⚠️  Detecção de desvio        1 arquivo não referenciado ║
║                                                          ║
║ → Alinhamento verificado, pronto para merge              ║
╚══════════════════════════════════════════════════════════╝
```

### Gate reprovado

```
╔══════════════════════════════════════════════════════════╗
║          GATE ALINHAMENTO SPEC-CÓDIGO ❌                 ║
╠══════════════════════════════════════════════════════════╣
║ Story: US-012 | Pontuação: 65%                           ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ ✅ Cobertura requirements     3/3 FR-xxx cobertos        ║
║ ❌ Mapeamento story-código    2 arquivos sem referências ║
║ ❌ Mapeamento AC-teste        AC-2 não tem teste         ║
║ ✅ Aderência spec técnico     Design conforme ao spec    ║
║ ❌ Conformidade constituição  NFR de desempenho não OK   ║
║ ⚠️  Detecção de desvio        3 arquivos não referenciados║
║                                                          ║
║ Ações necessárias:                                       ║
║ 1. Adicionar // Story: US-012 a ProfileService.ts       ║
║ 2. Adicionar // Story: US-012 a ProfileValidator.ts     ║
║ 3. Escrever teste para AC-2: Utilizador pode editar     ║
║    email                                                 ║
║ 4. Otimizar API de perfil para meta de <200ms           ║
║                                                          ║
║ → Corrigir problemas antes do merge                      ║
╚══════════════════════════════════════════════════════════╝
```

## Exemplo

```
/gate:validate-alignment US-012
/gate:validate-alignment          # Todas as stories do sprint atual
```

## Comandos relacionados

- `/project:trace` — Ver matriz de rastreabilidade
- `/project:coverage-map` — Verificar cobertura de requirements
- `/project:checkpoint` — Executar checkpoints de fase
- `/gate:validate-story` — Validar completude da story
