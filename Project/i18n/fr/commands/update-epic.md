---
description: Mettre à jour un EPIC
argument-hint: [arguments]
---

# Mettre à jour un EPIC

Modifier les informations d'un EPIC existant.

## Arguments

$ARGUMENTS (format: EPIC-XXX [champ] [valeur])
- **EPIC-ID** (obligatoire): ID de l'EPIC (ex: EPIC-001)
- **Champ** (optionnel): Champ à modifier
- **Valeur** (optionnel): Nouvelle valeur

## Mode Plan

> **Le mode plan est obligatoire.** Avant l'exécution, Claude active le mode plan pour analyser le code impacté, proposer un plan d'implémentation et attendre votre validation avant toute modification.

## Champs Modifiables

| Champ | Description | Exemple |
|-------|-------------|---------|
| `name` | Nom de l'EPIC | "Nouveau nom" |
| `priority` | Priorité | High, Medium, Low |
| `mmf` | Minimum Marketable Feature | "Description MMF" |
| `description` | Description | "Nouvelle description" |

## Processus

### Mode Interactif (sans arguments de champ)

Si seul l'ID est fourni:

```
/project:update-epic EPIC-001
```

Afficher les informations actuelles et proposer les modifications:

```
📋 EPIC-001: Système d'authentification

Champs actuels:
1. Nom: Système d'authentification
2. Priorité: High
3. MMF: Permettre aux utilisateurs de se connecter
4. Description: [...]

Quel champ modifier? (1-4, ou 'q' pour quitter)
>
```

### Mode Direct (avec arguments)

```
/project:update-epic EPIC-001 priority Medium
```

Modifier directement le champ spécifié.

### Étapes

1. Valider que l'EPIC existe
2. Lire le fichier actuel
3. Modifier le champ demandé
4. Mettre à jour la date de modification
5. Sauvegarder le fichier
6. Mettre à jour l'index si nécessaire

## Format de Sortie

```
✅ EPIC mis à jour!

📋 EPIC-001: Système d'authentification

Modification:
  Priorité: High → Medium

Fichier: project-management/backlog/epics/EPIC-001-systeme-authentification.md
```

## Exemples

```
# Mode interactif
/project:update-epic EPIC-001

# Changer le nom
/project:update-epic EPIC-001 name "Authentification et Autorisation"

# Changer la priorité
/project:update-epic EPIC-001 priority Low

# Changer le MMF
/project:update-epic EPIC-001 mmf "Permettre SSO et 2FA"
```

## Validation

- Le champ doit être modifiable
- La priorité doit être High, Medium ou Low
- Le nom ne peut pas être vide
