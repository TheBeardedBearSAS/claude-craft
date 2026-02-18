---
description: Mettre à jour une User Story
argument-hint: [arguments]
---

# Mettre à jour une User Story

Modifier les informations d'une User Story existante.

## Arguments

$ARGUMENTS (format: US-XXX [champ] [valeur])
- **US-ID** (obligatoire): ID de la User Story (ex: US-001)
- **Champ** (optionnel): Champ à modifier
- **Valeur** (optionnel): Nouvelle valeur

## Mode Plan

> **Le mode plan est obligatoire.** Avant l'exécution, Claude active le mode plan pour analyser le code impacté, proposer un plan d'implémentation et attendre votre validation avant toute modification.

## Champs Modifiables

| Champ | Description | Exemple |
|-------|-------------|---------|
| `name` | Nom de la US | "Nouveau nom" |
| `points` | Story points | 1, 2, 3, 5, 8 |
| `epic` | EPIC parent | EPIC-002 |
| `persona` | Persona concerné | P-001 |
| `story` | Texte de la US | "En tant que..." |
| `criteria` | Critères d'acceptation | (mode interactif) |

## Processus

### Mode Interactif (sans arguments de champ)

```
/project:update-story US-001
```

Afficher les informations et proposer les modifications:

```
📖 US-001: Login utilisateur

Champs actuels:
1. Nom: Login utilisateur
2. EPIC: EPIC-001
3. Points: 5
4. Persona: P-001 (Utilisateur Standard)
5. Story: En tant que utilisateur, je veux...
6. Critères d'acceptation: [3 critères]

Quel champ modifier? (1-6, ou 'q' pour quitter)
>
```

### Mode Direct

```
/project:update-story US-001 points 8
```

### Modification des Critères d'Acceptation

En mode interactif, option pour:
- Ajouter un critère
- Modifier un critère existant
- Supprimer un critère

```
Critères d'acceptation actuels:
1. CA-1: Login avec email/password
2. CA-2: Message d'erreur si échec
3. CA-3: Redirection après succès

Action? (a)jouter, (m)odifier, (s)upprimer, (q)uitter
> a

Nouveau critère (format Gherkin):
GIVEN:
WHEN:
THEN:
```

### Étapes

1. Valider que la US existe
2. Lire le fichier actuel
3. Modifier le champ demandé
4. Mettre à jour la date de modification
5. Sauvegarder le fichier
6. Mettre à jour l'EPIC parent si changé
7. Mettre à jour l'index

## Format de Sortie

```
✅ User Story mise à jour!

📖 US-001: Login utilisateur

Modification:
  Points: 5 → 8

⚠️ Attention: 8 points est le maximum recommandé.
   Considérer de découper cette US si trop complexe.

Fichier: project-management/backlog/user-stories/US-001-login-utilisateur.md
```

## Changement d'EPIC

Si on change l'EPIC parent:

```
✅ User Story déplacée!

📖 US-001: Login utilisateur

Modification:
  EPIC: EPIC-001 → EPIC-002

Mises à jour:
  - EPIC-001: US retirée de la liste
  - EPIC-002: US ajoutée à la liste
  - Index: Mis à jour
```

## Exemples

```
# Mode interactif
/project:update-story US-001

# Changer les points
/project:update-story US-001 points 3

# Changer l'EPIC
/project:update-story US-001 epic EPIC-002

# Changer le nom
/project:update-story US-001 name "Connexion utilisateur avec SSO"
```

## Validation

- Points: Fibonacci (1, 2, 3, 5, 8)
- Si points > 8: Avertissement pour découpage
- EPIC: Doit exister
- Persona: Doit être défini dans personas.md
