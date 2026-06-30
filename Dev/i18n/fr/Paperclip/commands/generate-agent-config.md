---
description: Rédiger un payload d'embauche d'agent Paperclip (pour l'API ou le tableau de bord)
argument-hint: [nom-agent]
---

# Rédiger une embauche d'agent Paperclip

## Arguments

1. `agent-name` (requis) — libellé en kebab-case pour le nouvel agent (ex. `senior-coder`, `qa-bot`)

## MISSION

Produire un payload bien formé pour embaucher un agent Paperclip. Paperclip (v2026.609.0) n'embauche **pas** d'agents depuis un fichier `.yaml` via CLI — l'embauche se fait via le tableau de bord ou `POST /companies/:companyId/agents`. Cette commande rédige le payload JSON et guide l'opérateur pour le remplir.

## Procédure

### 1. Collecter les entrées (interactif)

Demander dans l'ordre :
- `companyId` cible (doit exister — voir `/paperclip:setup-company` ou `paperclipai company list`)
- `adapterType` — l'un des types enregistrés (ex. `claude_local`, `codex_local`, `gemini_local`, `cursor_local`, `opencode_local`, `pi_local`). L'`agentConfigurationDoc` de l'adaptateur choisi vous indique quels sous-champs sont acceptés.
- Nom d'affichage de l'agent (`$1`)
- Rôle / titre (ex. "Ingénieur TypeScript senior")
- Objectif à associer (optionnel ; obtenir depuis `paperclipai company get --id <companyId>`)
- Id du modèle (doit être dans la liste `models` de l'adaptateur)
- Budget (tokens, optionnel ; définir une limite **stricte** si vous voulez l'application)
- Configuration spécifique à l'adaptateur : `cwd`, `model`, `extraArgs`, `env`, `workspaceStrategy`, `timeoutSec`, `graceSec`, et tout flag spécifique à l'adaptateur (ex. `dangerouslySkipPermissions` pour `claude_local`)

### 2. Émettre le payload

```json
{
  "name": "{{AGENT_NAME}}",
  "displayName": "{{DISPLAY_NAME}}",
  "role": "{{ROLE}}",
  "goalId": "{{GOAL_ID_OR_NULL}}",
  "adapterType": "{{ADAPTER_TYPE}}",
  "adapterConfig": {
    "model": "{{MODEL_ID}}",
    "cwd": "{{CWD_OR_NULL}}",
    "timeoutSec": 900,
    "graceSec": 15,
    "extraArgs": [],
    "env": {},
    "workspaceStrategy": {
      "type": "git_worktree",
      "baseRef": "main"
    }
  },
  "budget": {
    "tokens": {{TOKEN_BUDGET_OR_NULL}}
  }
}
```

> **Vérifier la forme réelle.** Avant de POSTer, ouvrir `server/src/routes/agents.ts` (ou la spec OpenAPI servie par l'instance) pour confirmer le schéma exact — ce qui précède reflète ce qui a été observé à la v2026.609.0 mais les noms de champs peuvent évoluer.

### 3. Soumettre

**A — Tableau de bord :** coller les champs dans **Agents → Embaucher** et soumettre.

**B — API :**
```bash
paperclipai agent list                      # confirmer que l'entreprise est accessible
curl -X POST "http://localhost:3100/companies/<companyId>/agents" \
  -H "Content-Type: application/json" \
  -H "Cookie: <cookie de session depuis le tableau de bord>" \
  -d @./agent-hire.json
```

(S'authentifier via la session Better Auth. Voir `docs.paperclip.ing` pour la recette d'auth utilisée par votre déploiement.)

### 4. Vérifier

```bash
paperclipai agent list
paperclipai agent get --id <agentId>
paperclipai activity list       # chercher 'agent.hired'
```

## Checklist post-rédaction

- [ ] `adapterType` correspond à un adaptateur actuellement enregistré
- [ ] `model` existe dans la liste `models` de cet adaptateur
- [ ] Budget défini comme entier positif quand l'application est désirée
- [ ] La config spécifique à l'adaptateur passe le validateur propre de l'adaptateur (le tableau de bord rejettera sinon)
- [ ] Aucune valeur de secret en ligne — utiliser des refs de secrets où l'adaptateur les supporte

## Sortie

Imprimer le JSON rédigé plus les instructions exactes curl + tableau de bord. Ne **pas** soumettre automatiquement.
