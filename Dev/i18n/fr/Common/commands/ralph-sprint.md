---
description: Lancer le conducteur de sprint autonome pour une execution overnight/sans surveillance
argument-hint: <nom-sprint> [--overnight|--parallel N|--supervised|--max-stories N]
---

# Ralph Sprint - Conducteur de Sprint Autonome (ASC)

Execute un sprint entier de maniere autonome avec un minimum d'interventions humaines. Le Conducteur de Sprint Autonome (ASC) gere la reclamation des stories, l'execution, les transitions, la recuperation d'erreurs et l'escalade des problemes bloquants.

## Arguments

**$ARGUMENTS**

- `<nom-sprint>`: Nom ou ID du sprint a traiter
- `--overnight`: Mode overnight (limite, arret a 6h)
- `--parallel N`: Traiter jusqu'a N stories en parallele (defaut: 1)
- `--supervised`: Pause avant chaque story pour confirmation
- `--max-stories N`: Nombre maximum de stories (defaut: 10)
- `--timeout H`: Duree maximale en heures (defaut: 12)

## Fonctionnalites Cles

| Fonctionnalite | Description |
|----------------|-------------|
| **Auto-Claim** | Reclame automatiquement la prochaine story prete |
| **Auto-Transition** | Transite les stories selon l'etat de completion |
| **Moteur de Recuperation** | Auto-recuperation des erreurs transitoires/recuperables |
| **Service d'Escalade** | File d'attente des problemes bloquants pour resolution humaine |
| **Traitement Parallele** | Traite plusieurs stories independantes simultanement |
| **Execution Limitee** | Fenetres de temps, limites de stories, seuils d'echecs |

## Processus

### 1. Initialisation du Sprint

1. **Charger la configuration du sprint**:
   - Lire les metadonnees depuis `.bmad/sprint-status.yaml`
   - Charger la config autonome depuis `ralph-autonomous.yml`
   - Initialiser le moteur de recuperation et le service d'escalade

2. **Activer le mode autonome**:
   - Configurer le circuit breaker en profil autonome
   - Activer la recuperation avant declenchement
   - Initialiser le gestionnaire parallele si active

### 2. Boucle Principale du Conducteur

```
┌─────────────────────────────────────────────────────────────────┐
│              CONDUCTEUR DE SPRINT AUTONOME (ASC)                 │
└───────────────────────────────┬─────────────────────────────────┘
                                │
    ┌───────────────────────────┼───────────────────────────────┐
    ▼                           ▼                               ▼
┌─────────┐              ┌─────────────┐               ┌─────────────┐
│Prochaine│──────────────│  Reclamer   │───────────────│Executer avec│
│  Story  │              │   Story     │               │    Ralph    │
└────┬────┘              └─────────────┘               └──────┬──────┘
     │                                                        │
     │ Aucune story ────────────────────┐      ┌──────────────┘
     ▼                                  ▼      ▼
┌─────────┐                      ┌─────────┐ ┌─────────┐
│Verifier │                      │Finaliser│ │Transiter│
│Escalades│                      │ Sprint  │ │  Story  │
└─────────┘                      └─────────┘ └─────────┘
```

### 3. Recuperation d'Erreurs

Le Moteur de Recuperation classifie les erreurs en 4 niveaux:

| Niveau | Type | Action | Exemples |
|--------|------|--------|----------|
| 0 | **Transitoire** | Auto-retry avec backoff | Timeout, rate limit, reseau |
| 1 | **Recuperable** | Auto-fix + retry | Lint, tests, deps, syntaxe |
| 2 | **Degrade** | Continuer avec warning | Docs, gates optionnels, coverage |
| 3 | **Bloque** | Escalader a humain | Securite, architecture, auth |

### 4. Gestion des Escalades

Les problemes bloquants sont mis en file d'attente:

```yaml
# .ralph/escalations/queue/ESC-xxx.yaml
id: "ESC-1704067200-123"
level: "blocked"
error_type: "security"
priority: "critical"
timeout_at: "2024-01-02T10:00:00Z"
default_action: "pause"
```

**Options de resolution**:
- `proceed` - Continuer avec la tache
- `skip` - Ignorer cette story et continuer
- `retry` - Reessayer l'operation echouee
- `abort` - Arreter le sprint

### 5. Conditions d'Arret

Le conducteur s'arrete quand une condition est atteinte:

| Condition | Defaut | Description |
|-----------|--------|-------------|
| Max stories | 10 | Nombre maximum de stories |
| Max echecs | 3 | Seuil d'echecs consecutifs |
| Max runtime | 12h | Duree maximale totale |
| Fenetre d'arret | 06:00 | Arret base sur l'heure (overnight) |
| Escalade critique | - | Pause sur problemes critiques |

## Exemples Rapides

```bash
# Sprint overnight
/common:ralph-sprint "Sprint 3" --overnight

# Traitement parallele avec 3 sessions
/common:ralph-sprint "Sprint 3" --parallel 3

# Mode supervise (confirmer chaque story)
/common:ralph-sprint "Sprint 3" --supervised

# Execution limitee (5 stories, 4 heures)
/common:ralph-sprint "Sprint 3" --max-stories 5 --timeout 4
```

## Configuration

L'ASC utilise `Tools/Ralph/config/ralph-autonomous.yml`:

```yaml
autonomous:
  enabled: true
  mode: "bounded"
  schedule:
    stop_window: "06:00"
    max_runtime_hours: 12
  limits:
    max_stories_per_session: 10
    max_consecutive_failures: 3
  parallel:
    enabled: false
    max_concurrent: 3

recovery:
  enabled: true
  max_attempts: 3
  auto_retry_transient: true
  auto_fix_lint: true
  auto_fix_tests: "retry_tdd"

escalation:
  enabled: true
  timeout_hours: 4
  default_action: "skip"
  critical_action: "pause"
```

## Sortie

```
╔════════════════════════════════════════════════════════════╗
║     Conducteur de Sprint Autonome (ASC)                     ║
║     Sprint 3                                                ║
╚════════════════════════════════════════════════════════════╝

ℹ [ASC] Conducteur initialise
ℹ [ASC]   Session: ASC-20240101-120000-12345
ℹ [ASC]   Mode: bounded
ℹ [ASC]   Max stories: 10

ℹ [ASC] Traitement story: US-001
✓ [ASC] Story terminee: US-001
ℹ [ASC] US-001 transite vers review

ℹ [ASC] Traitement story: US-002
⚠ Erreur classifiee Niveau 1 (recuperable): test_fail
ℹ Tentative auto-fix pour: test_fail
✓ [ASC] Story terminee: US-002

════════════════════════════════════════
    Resume du Conducteur de Sprint
════════════════════════════════════════

Session: ASC-20240101-120000-12345
Duree: 4h 23m

Stories:
  Terminees: 7
  Echouees:  1
  Ignorees:  2

Escalades:
  creees: 3
  resolues: 2

Tentatives de recuperation: 8
```

## Metriques de Succes

| Metrique | Actuel | Cible |
|----------|--------|-------|
| Interventions humaines/sprint | ~15 | <5 |
| Stories completees overnight | 0 | 3-5 |
| Taux auto-recuperation | N/A | >70% |
| Temps avant escalade | N/A | <15 min |
| Efficacite parallelisation | N/A | >60% |

## Bonnes Pratiques

1. **Commencer en supervise**: Utilisez `--supervised` d'abord
2. **Limites realistes**: Ne pas mettre max-stories trop haut initialement
3. **Surveiller escalades**: Verifier `.ralph/escalations/queue/` regulierement
4. **Analyser metriques**: Examiner `metrics-*.json` apres chaque run
5. **Configurer webhooks**: Notifications Slack/Teams pour problemes critiques

## Voir Aussi

- `/common:ralph-run` - Boucle continue pour une tache
- `/project:run-sprint` - Execution standard de sprint
- `/sprint:next-story` - Obtenir prochaine story prete
- `@ralph-conductor` - Agent d'orchestration Ralph
