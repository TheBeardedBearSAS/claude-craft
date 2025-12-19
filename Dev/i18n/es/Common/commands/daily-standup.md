---
description: Generación de Resumen de Stand-up Diario
argument-hint: [arguments]
---

# Generación de Resumen de Stand-up Diario

Eres un asistente Scrum. Debes generar un resumen de actividades de desarrollo para facilitar el stand-up diario.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Período (predeterminado: desde ayer)

Ejemplo: `/common:daily-standup` o `/common:daily-standup "2024-01-15"`

## MISIÓN

### Paso 1: Recopilar Datos

```bash
# Commits desde ayer
git log --since="yesterday" --oneline --all

# Ramas activas
git branch -a --sort=-committerdate | head -10

# PRs abiertos
gh pr list --state open

# Issues actuales
gh issue list --assignee @me --state open

# Archivos modificados localmente
git status --short
```

### Paso 2: Generar Resumen

```
══════════════════════════════════════════════════════════════
📅 STAND-UP DIARIO - {AAAA-MM-DD}
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
📊 RESUMEN DEL SPRINT
──────────────────────────────────────────────────────────────

Sprint: {N}
Día: {X}/10
Puntos restantes: {Y}
Burndown: 📉 En curso / 📈 Adelantado / 📊 Atrasado

──────────────────────────────────────────────────────────────
✅ LO QUE SE HIZO (AYER)
──────────────────────────────────────────────────────────────

### Commits
- {hash} {mensaje} (@autor)
- {hash} {mensaje} (@autor)

### PRs Fusionados
- PR #123: {título} (@autor)

### Issues Cerrados
- Issue #456: {título}

──────────────────────────────────────────────────────────────
🎯 LO QUE ESTÁ PLANIFICADO (HOY)
──────────────────────────────────────────────────────────────

### En Progreso
| Rama | Issue | Asignado | Estado |
|---------|-------|---------|--------|
| feature/auth | #45 | @dev1 | 🟡 70% |
| fix/login | #48 | @dev2 | 🟢 90% |

### Por Iniciar
- Issue #50: {título} (sin asignar)

──────────────────────────────────────────────────────────────
🚧 BLOQUEADORES / RIESGOS
──────────────────────────────────────────────────────────────

| Bloqueador | Impacto | Acción Requerida |
|----------|--------|----------------|
| API externa caída | PR #123 bloqueado | Contactar soporte |
| Revisión pendiente | PR #125 hace 2 días | ¿@dev3 disponible? |

──────────────────────────────────────────────────────────────
📈 PULL REQUESTS ACTIVOS
──────────────────────────────────────────────────────────────

| PR | Título | Autor | Edad | Revisiones |
|----|-------|--------|-----|---------|
| #125 | Agregar login OAuth | @dev1 | 2d | 1/2 ✅ |
| #127 | Corregir perfil usuario | @dev2 | 1d | 0/2 ⏳ |
| #128 | Actualizar deps | @bot | 3d | 0/1 ⏳ |

──────────────────────────────────────────────────────────────
💡 NOTAS / RECORDATORIOS
──────────────────────────────────────────────────────────────

- 🗓️ Refinamiento de backlog mañana 2pm
- ⚠️ Fecha límite Feature X: Viernes
- 📣 Sprint Review: {fecha}
```

### Paso 3: Formato Corto (para Slack/Teams)

```markdown
**📅 Daily - {AAAA-MM-DD}**

**Ayer:**
• PR #123 fusionado (OAuth Google)
• 5 commits en feature/auth

**Hoy:**
• Terminar PR #125 (OAuth GitHub)
• Iniciar Issue #50 (Recuperación contraseña)

**Bloqueadores:**
• ⚠️ Revisión pendiente PR #125 (@dev3)

**PRs para revisar:**
• PR #127 - Corregir perfil usuario (0/2)
```

### Paso 4: Métricas del Equipo

```
══════════════════════════════════════════════════════════════
👥 ACTIVIDAD DEL EQUIPO (Últimos 7 días)
══════════════════════════════════════════════════════════════

| Miembro | Commits | PRs | Revisiones | Issues |
|--------|---------|-----|---------|--------|
| @dev1 | 12 | 3 | 5 | 4 |
| @dev2 | 8 | 2 | 3 | 3 |
| @dev3 | 15 | 4 | 8 | 5 |

──────────────────────────────────────────────────────────────
📊 VELOCIDAD ACTUAL
──────────────────────────────────────────────────────────────

| Día | Puntos Entregados | Acumulado | Ideal |
|------|---------------|--------|-------|
| D1 | 3 | 3 | 2.1 |
| D2 | 5 | 8 | 4.2 |
| D3 | 2 | 10 | 6.3 |
| D4 | 0 | 10 | 8.4 |
| D5 | ... | ... | 10.5 |

Estado: 📈 Adelantado por 1.6 puntos
```

## Consejos para Stand-up Diario

### Las 3 Preguntas Clásicas
1. ¿Qué hice ayer?
2. ¿Qué haré hoy?
3. ¿Hay algún obstáculo?

### Mejores Prácticas
- **15 minutos máximo** para todo el equipo
- **De pie** (fomenta la brevedad)
- **Misma hora** cada día
- **Sin resolución de problemas** (parking lot)
- **Enfoque en el Objetivo del Sprint**

### Anti-Patrones a Evitar
- ❌ Reportar al Scrum Master (hablar al equipo)
- ❌ Discusiones técnicas largas
- ❌ Esperar tu turno sin escuchar
- ❌ "Trabajé en X" (demasiado vago)

### Formato Alternativo: Recorrer el Tablero
1. Empezar desde columna "Hecho"
2. Pasar a "En Progreso"
3. Luego "Por Hacer"
4. Enfocarse en lo que bloquea el progreso

## Automatización

### GitHub Action para Resumen Diario

```yaml
name: Daily Digest
on:
  schedule:
    - cron: '0 7 * * 1-5'  # 7am Lunes a Viernes
  workflow_dispatch:

jobs:
  digest:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Generate Digest
        run: |
          echo "# Daily Digest - $(date +%Y-%m-%d)" > digest.md
          echo "" >> digest.md
          echo "## Commits (24h)" >> digest.md
          git log --since="24 hours ago" --oneline >> digest.md
          echo "" >> digest.md
          echo "## Open PRs" >> digest.md
          gh pr list --state open --json number,title,author >> digest.md

      - name: Post to Slack
        uses: slackapi/slack-github-action@v1
        with:
          channel-id: 'daily-standup'
          payload-file-path: digest.md
```
