---
description: Préparation Sprint Review
argument-hint: [arguments]
---

# Préparation Sprint Review

Tu es un Scrum Master expérimenté. Tu dois préparer et faciliter la Sprint Review en rassemblant les informations sur le travail accompli.

## Arguments
$ARGUMENTS

Arguments :
- Numéro du sprint

Exemple : `/common:sprint-review 5`

## MISSION

### Étape 1 : Collecter les Données du Sprint

```bash
# Récupérer les commits du sprint
git log --since="YYYY-MM-DD" --until="YYYY-MM-DD" --oneline

# PRs mergées
gh pr list --state merged --search "merged:YYYY-MM-DD..YYYY-MM-DD"

# Issues fermées
gh issue list --state closed --search "closed:YYYY-MM-DD..YYYY-MM-DD"
```

### Étape 2 : Analyser le Sprint Backlog

```
══════════════════════════════════════════════════════════════
📊 SPRINT REVIEW - Sprint {N}
══════════════════════════════════════════════════════════════

Date : {YYYY-MM-DD}
Sprint Goal : "{Objectif}"

──────────────────────────────────────────────────────────────
🎯 ATTEINTE DU SPRINT GOAL
──────────────────────────────────────────────────────────────

Sprint Goal atteint : ✅ OUI / ❌ NON / ⚠️ PARTIELLEMENT

Justification : {Explication}

──────────────────────────────────────────────────────────────
📦 USER STORIES LIVRÉES
──────────────────────────────────────────────────────────────

| ID | Titre | Points | Demo | Status |
|----|-------|--------|------|--------|
| US-045 | Inscription utilisateur | 5 | ✅ | ✅ Livré |
| US-046 | Login OAuth Google | 8 | ✅ | ✅ Livré |
| US-047 | Login OAuth GitHub | 5 | ✅ | ✅ Livré |
| US-048 | Reset mot de passe | 3 | ⏳ | ⚠️ 80% |

**Livré : 18/21 points (86%)**

──────────────────────────────────────────────────────────────
❌ USER STORIES NON TERMINÉES
──────────────────────────────────────────────────────────────

| ID | Titre | Points | Avancement | Raison |
|----|-------|--------|------------|--------|
| US-048 | Reset mot de passe | 3 | 80% | API mail non dispo |

Action : Reporter au Sprint {N+1}

──────────────────────────────────────────────────────────────
📈 MÉTRIQUES
──────────────────────────────────────────────────────────────

| Métrique | Valeur | Tendance |
|----------|--------|----------|
| Points planifiés | 21 | - |
| Points livrés | 18 | - |
| Vélocité | 18 | ↗️ (+2 vs S-1) |
| Taux de complétion | 86% | ↗️ |
| Bugs découverts | 2 | ↘️ |
| Bugs corrigés | 3 | ↗️ |

──────────────────────────────────────────────────────────────
🎬 DÉMONSTRATION
──────────────────────────────────────────────────────────────

## Ordre de démo suggéré

1. **US-045 : Inscription utilisateur** (~5 min)
   - Montrer le formulaire d'inscription
   - Email de confirmation
   - Activation du compte
   - Démo par : @dev1

2. **US-046 : Login OAuth Google** (~5 min)
   - Bouton "Se connecter avec Google"
   - Flux OAuth
   - Création compte automatique
   - Démo par : @dev2

3. **US-047 : Login OAuth GitHub** (~3 min)
   - Même flux avec GitHub
   - Démo par : @dev1

## Scénario de démo

```gherkin
# Scénario complet pour la démo
Given je suis sur la page d'accueil
When je clique sur "S'inscrire"
And je remplis le formulaire
Then je reçois un email de confirmation
And je peux activer mon compte

Given je suis sur la page de login
When je clique sur "Google"
Then je suis redirigé vers Google
And après auth, je suis connecté
```

──────────────────────────────────────────────────────────────
💬 FEEDBACK À COLLECTER
──────────────────────────────────────────────────────────────

Questions pour les stakeholders :

1. "Le flux d'inscription est-il clair ?"
2. "Manque-t-il des providers OAuth ?" (Apple, Microsoft, etc.)
3. "Le design correspond-il aux attentes ?"
4. "Priorité pour le sprint suivant ?"

──────────────────────────────────────────────────────────────
📝 NOTES DE SESSION
──────────────────────────────────────────────────────────────

Feedback reçu :
- {Feedback 1}
- {Feedback 2}

Nouvelles demandes :
- {Demande 1} → Créer US-XXX
- {Demande 2} → Ajouter au backlog

Décisions prises :
- {Décision 1}
- {Décision 2}
```

### Étape 3 : Préparer les Supports

#### 3.1 Burndown Chart

```
Points |
  21   |██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
  18   |████████░░░░░░░░░░░░░░░░░░░░░░░░
  15   |████████████░░░░░░░░░░░░░░░░░░░░
  12   |████████████████░░░░░░░░░░░░░░░░
   9   |████████████████████░░░░░░░░░░░░
   6   |████████████████████████░░░░░░░░
   3   |████████████████████████████████ (idéal)
   3   |███████████████████████████████░ (réel)
       J1  J2  J3  J4  J5  J6  J7  J8  J9  J10

Légende : ██ Réel  ░░ Idéal
```

#### 3.2 Cumulative Flow

```
US |
 4 |                    ████████████████
 3 |            ████████████████████████
 2 |    ████████████████████████████████
 1 |████████████████████████████████████
   |________________________________
   J1  J2  J3  J4  J5  J6  J7  J8  J9  J10

██ Done  ░░ In Progress  ▒▒ To Do
```

### Étape 4 : Agenda Sprint Review

```
══════════════════════════════════════════════════════════════
📅 AGENDA SPRINT REVIEW
══════════════════════════════════════════════════════════════

Durée totale : 2h

00:00 - 00:10 | Introduction & Contexte
               - Rappel Sprint Goal
               - Participants présents
               - Agenda

00:10 - 01:00 | Démonstration des US livrées
               - US par US
               - Questions/feedback après chaque démo

01:00 - 01:20 | Métriques & Résultats
               - Burndown chart
               - Vélocité
               - Points non livrés

01:20 - 01:40 | Discussion & Feedback
               - Réactions stakeholders
               - Nouvelles idées
               - Priorisation

01:40 - 02:00 | Prochaines étapes
               - Impact sur le Product Backlog
               - Vision Sprint suivant
               - Questions

══════════════════════════════════════════════════════════════
```

### Étape 5 : Template sprint-review.md

```markdown
# Sprint Review - Sprint {N}

## Informations

| Attribut | Valeur |
|----------|--------|
| Date | {YYYY-MM-DD} |
| Durée | 2h |
| Animateur | {Nom} |

## Participants

- [ ] Product Owner
- [ ] Scrum Master
- [ ] Équipe Dev
- [ ] Stakeholder 1
- [ ] Stakeholder 2

## Sprint Goal

> "{Objectif}"

**Atteint : ✅ / ❌ / ⚠️**

## Démonstration

### US-XXX : Titre
- **Démo par** : @membre
- **Feedback** : {notes}

### US-XXX : Titre
- **Démo par** : @membre
- **Feedback** : {notes}

## Métriques

| Métrique | Valeur |
|----------|--------|
| Planifié | X pts |
| Livré | Y pts |
| Vélocité | Y pts |
| Taux | Z% |

## Feedback Stakeholders

### Positif
- {Feedback positif 1}
- {Feedback positif 2}

### À améliorer
- {Point d'amélioration 1}
- {Point d'amélioration 2}

### Nouvelles idées
- {Idée 1} → US-XXX créée
- {Idée 2} → À affiner

## Impact sur le Backlog

| Action | US | Description |
|--------|-----|-------------|
| Ajoutée | US-XXX | {Titre} |
| Repriorisée | US-XXX | {Raison} |
| Supprimée | US-XXX | {Raison} |

## Prochaines étapes

1. {Action 1}
2. {Action 2}
3. {Action 3}
```

## Conseils Sprint Review

### Ce que c'est
- Une inspection de l'incrément
- Un moment de feedback
- Une collaboration avec les stakeholders

### Ce que ce n'est PAS
- Un status meeting
- Une démo technique
- Un rapport pour le management

### Bonnes pratiques
- Démo sur environnement réel (staging/prod)
- L'équipe démontre, pas seulement le SM
- Collecter le feedback activement
- Adapter le backlog en temps réel
