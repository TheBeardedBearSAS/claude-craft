---
description: Validar a preparacao do sprint antes do inicio
argument-hint: [--verbose]
---

# Validar Sprint Gate

Valida que o sprint esta corretamente planejado e pronto para iniciar.
Todos os criterios obrigatorios devem ser atendidos.

## Argumentos

$ARGUMENTS (formato: [--verbose])
- **--verbose** (opcional): Exibir o detalhe por story

## Criterios Sprint Ready

| Criterio | Peso | Obrigatorio | Descricao |
|----------|------|-------------|-----------|
| Metadados Sprint | 20% | Sim | ID, nome, datas definidos |
| Sprint Goal | 15% | Sim | Objetivo claro definido |
| Stories prontas | 25% | Sim | Stories em ready-for-dev |
| Stories estimadas | 20% | Sim | Todas possuem pontos |
| Verificacao de capacidade | 10% | Nao | Pontos dentro da capacidade |
| Dependencias resolvidas | 10% | Nao | Nenhuma story bloqueada em ready |

**Limite: Todos os criterios obrigatorios**

## Processo

### Etapa 1: Carregar o status do sprint

1. Ler `.bmad/sprint-status.yaml`
2. Extrair os metadados
3. Contar as stories por status

### Etapa 2: Validar os metadados

Verificar os campos obrigatorios:
- `metadata.sprint_id` - Identificador do sprint
- `metadata.name` - Nome do sprint
- `metadata.start_date` - Data de inicio
- `metadata.end_date` - Data de fim
- `metadata.goal` - Objetivo do sprint (min 10 caracteres)

### Etapa 3: Validar as stories

Verificar a preparacao das stories:
- Pelo menos 1 story em `ready-for-dev`
- Todas as stories possuem story points
- Nenhuma story bloqueada em status ready

### Etapa 4: Verificacao de capacidade opcional

Se `metadata.capacity_points` definido:
- Soma dos pontos das stories ready ≤ capacidade + 20%

### Etapa 5: Gerar o relatorio

Exibir o status de preparacao do sprint.

## Formato de Saida

### Sprint Pronto

```
═══════════════════════════════════════════════════════
           Validacao Sprint Ready Gate
═══════════════════════════════════════════════════════

Sprint: sprint-3 - Gestao de Usuarios
Periodo: 2026-01-29 → 2026-02-12 (14 dias)

Resultados da validacao:
──────────────────────────────────────────────────────
✅ Metadados Sprint (20%)
   ID: sprint-3
   Nome: Gestao de Usuarios
   Inicio: 2026-01-29
   Fim: 2026-02-12

✅ Sprint Goal (15%)
   "Implementar as funcionalidades de gestao de usuario
    incluindo cadastro, login e gestao de perfil"

✅ Stories prontas (25%)
   5 stories em status ready-for-dev
   Total de pontos: 21

✅ Stories estimadas (20%)
   As 8 stories possuem story points

✅ Verificacao de capacidade (10%)
   Planejado: 21 pontos
   Capacidade: 25 pontos
   Utilizacao: 84%

✅ Dependencias resolvidas (10%)
   Nenhuma story bloqueada em status ready

Pontuacao: 100/100
──────────────────────────────────────────────────────

✅ SPRINT READY GATE VALIDADO

O sprint pode ser iniciado.

Stories prontas:
  📖 US-010: Cadastro de usuario (5 pts)
  📖 US-011: Login de usuario (5 pts)
  📖 US-012: Pagina de perfil (5 pts)
  📖 US-013: Redefinicao de senha (3 pts)
  📖 US-014: Verificacao de email (3 pts)

Comandos:
  /sprint:start           Iniciar o sprint
  /sprint:next-story     Pegar a primeira story
═══════════════════════════════════════════════════════
```

### Sprint Nao Pronto

```
═══════════════════════════════════════════════════════
           Validacao Sprint Ready Gate
═══════════════════════════════════════════════════════

Sprint: (nao configurado)

Resultados da validacao:
──────────────────────────────────────────────────────
❌ Metadados Sprint (20%)
   Ausente: sprint_id
   Ausente: start_date
   Ausente: end_date

❌ Sprint Goal (15%)
   Ausente: Nenhum objetivo definido

⚠️ Stories prontas (25%)
   Apenas 1 story em ready-for-dev
   Recomendado: pelo menos 3 stories

❌ Stories estimadas (20%)
   3 stories sem story points:
   - US-010: Cadastro de usuario
   - US-012: Pagina de perfil
   - US-015: Pagina de configuracoes

⏳ Verificacao de capacidade (10%)
   Ignorado: Nenhuma capacidade definida

⚠️ Dependencias resolvidas (10%)
   1 story ready esta bloqueada:
   - US-011: Bloqueada por API externa

Pontuacao: 35/100
──────────────────────────────────────────────────────

❌ SPRINT READY GATE REPROVADO

Acoes necessarias:
──────────────────────────────────────────────────────
1. Configurar os metadados do sprint
   Editar .bmad/sprint-status.yaml:
   ```yaml
   metadata:
     sprint_id: "sprint-3"
     name: "Gestao de Usuarios"
     start_date: "2026-01-29"
     end_date: "2026-02-12"
     goal: "Implementar as funcionalidades de gestao de usuario"
   ```

2. Definir o objetivo do sprint
   Adicionar um objetivo claro e mensuravel

3. Estimar as stories ausentes
   /project:update-story US-010 --points 5
   /project:update-story US-012 --points 5
   /project:update-story US-015 --points 3

4. Resolver as stories bloqueadas
   US-011 bloqueada por: dependencia API externa
   Opcoes:
   - Remover do sprint
   - Desbloquear a dependencia
   - Reordenar as stories

Reexecutar: /gate:validate-sprint
═══════════════════════════════════════════════════════
```

## Exemplo

```
/gate:validate-sprint
/gate:validate-sprint --verbose
```

## Configuracao Sprint

Configurar o sprint em `.bmad/sprint-status.yaml`:

```yaml
metadata:
  sprint_id: "sprint-3"
  name: "Gestao de Usuarios"
  start_date: "2026-01-29"
  end_date: "2026-02-12"
  goal: "Implementar as funcionalidades de gestao de usuario"
  capacity_points: 25  # Opcional: capacidade da equipe
```

Configuracao do gate: `.bmad/gates/sprint-ready-gate.yaml`
