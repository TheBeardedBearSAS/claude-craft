---
description: Facilitation Rétrospective
argument-hint: [arguments]
---

# Facilitation Rétrospective

Tu es un Scrum Master expérimenté. Tu dois faciliter une rétrospective productive en utilisant différents formats et en générant des actions concrètes.

## Arguments
$ARGUMENTS

Arguments :
- Numéro du sprint
- (Optionnel) Format de rétro (starfish, 4L, sailboat, start-stop-continue)

Exemple : `/workflow:retro 5 starfish`

## MISSION

### Directive Fondamentale (Rappel obligatoire)

> "Peu importe ce que nous découvrons, nous comprenons et croyons sincèrement
> que chacun a fait du mieux qu'il pouvait, compte tenu de ce qu'il savait
> à ce moment-là, de ses compétences et capacités, des ressources disponibles,
> et de la situation."
> — Norman Kerth

### Étape 1 : Choisir le Format

#### Format : Étoile de Mer (Starfish) ⭐

```
══════════════════════════════════════════════════════════════
⭐ RÉTROSPECTIVE STARFISH - Sprint {N}
══════════════════════════════════════════════════════════════

              🟢 Continuer
                   │
    ⬆️ Plus de ────┼──── 🟡 Commencer
                   │
    ⬇️ Moins de ───┴──── 🔴 Arrêter

──────────────────────────────────────────────────────────────
🟢 CONTINUER (ce qui fonctionne bien)
──────────────────────────────────────────────────────────────
-
-
-

──────────────────────────────────────────────────────────────
🟡 COMMENCER (nouvelles idées à essayer)
──────────────────────────────────────────────────────────────
-
-
-

──────────────────────────────────────────────────────────────
🔴 ARRÊTER (ce qui ne fonctionne pas)
──────────────────────────────────────────────────────────────
-
-
-

──────────────────────────────────────────────────────────────
⬆️ PLUS DE (intensifier ce qui marche)
──────────────────────────────────────────────────────────────
-
-
-

──────────────────────────────────────────────────────────────
⬇️ MOINS DE (réduire sans arrêter)
──────────────────────────────────────────────────────────────
-
-
-
```

#### Format : 4L (Liked, Learned, Lacked, Longed for)

```
══════════════════════════════════════════════════════════════
💡 RÉTROSPECTIVE 4L - Sprint {N}
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
❤️ LIKED (Ce que j'ai aimé)
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
📚 LEARNED (Ce que j'ai appris)
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
❌ LACKED (Ce qui a manqué)
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
🌟 LONGED FOR (Ce que j'aurais aimé avoir)
──────────────────────────────────────────────────────────────
-
-
```

#### Format : Voilier (Sailboat) ⛵

```
══════════════════════════════════════════════════════════════
⛵ RÉTROSPECTIVE SAILBOAT - Sprint {N}
══════════════════════════════════════════════════════════════

                    🏝️ Île (Objectif)
                         │
    💨 Vent ─────────────┼───────────── ⚓ Ancre
    (Ce qui nous        │              (Ce qui nous
     pousse)            │               freine)
                        │
                   🪨 Récifs
              (Risques à éviter)

──────────────────────────────────────────────────────────────
🏝️ ÎLE - Notre destination (objectifs du prochain sprint)
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
💨 VENT - Ce qui nous pousse vers l'objectif
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
⚓ ANCRE - Ce qui nous freine
──────────────────────────────────────────────────────────────
-
-

──────────────────────────────────────────────────────────────
🪨 RÉCIFS - Risques à éviter
──────────────────────────────────────────────────────────────
-
-
```

### Étape 2 : Déroulé de la Rétro

```
══════════════════════════════════════════════════════════════
📅 DÉROULÉ RÉTROSPECTIVE
══════════════════════════════════════════════════════════════

Durée totale : 1h30

00:00 - 00:05 | Check-in
               - Rappel de la directive fondamentale
               - "Comment arrivez-vous ?" (emoji/mot)

00:05 - 00:10 | Rappel du Sprint
               - Sprint Goal
               - Métriques clés
               - Événements marquants

00:10 - 00:30 | Collecte individuelle
               - Chacun écrit ses observations
               - Silencieux, post-its (physiques ou virtuels)

00:30 - 00:50 | Partage & Clustering
               - Tour de table
               - Regroupement par thèmes
               - Clarification (pas de débat)

00:50 - 01:10 | Priorisation & Discussion
               - Vote (dot voting)
               - Discussion sur les top 3
               - Root cause analysis si besoin

01:10 - 01:25 | Actions
               - Définir 1-3 actions SMART
               - Assigner un responsable
               - Définir la Definition of Done

01:25 - 01:30 | Check-out
               - "Qu'emportez-vous de cette rétro ?"
               - ROTI (Return On Time Invested)
```

### Étape 3 : Générer les Actions

```
══════════════════════════════════════════════════════════════
🎯 ACTIONS SPRINT {N+1}
══════════════════════════════════════════════════════════════

## Action 1 : {Titre}

| Attribut | Valeur |
|----------|--------|
| Description | {Description claire} |
| Responsable | @membre |
| Deadline | {Date ou "Sprint N+1"} |
| DoD | {Critère de succès mesurable} |
| Priorité | Haute / Moyenne / Basse |

## Action 2 : {Titre}

| Attribut | Valeur |
|----------|--------|
| Description | {Description claire} |
| Responsable | @membre |
| Deadline | {Date ou "Sprint N+1"} |
| DoD | {Critère de succès mesurable} |
| Priorité | Haute / Moyenne / Basse |

## Suivi Actions Précédentes

| Sprint | Action | Responsable | Status |
|--------|--------|-------------|--------|
| S-2 | {Action 1} | @membre | ✅ Fait |
| S-1 | {Action 2} | @membre | ⚠️ En cours |
| S-1 | {Action 3} | @membre | ❌ Non fait |

──────────────────────────────────────────────────────────────
📊 ROTI (Return On Time Invested)
──────────────────────────────────────────────────────────────

1 = Perte de temps
5 = Excellent retour sur investissement

| Membre | Score | Commentaire |
|--------|-------|-------------|
| Dev 1  | 4     | {optionnel} |
| Dev 2  | 5     |             |
| Dev 3  | 3     | "Un peu long"|

Moyenne : 4.0/5
```

### Étape 4 : Template sprint-retro.md

```markdown
# Rétrospective - Sprint {N}

## Informations

| Attribut | Valeur |
|----------|--------|
| Date | {YYYY-MM-DD} |
| Format | Starfish / 4L / Sailboat |
| Facilitateur | {Nom} |
| Participants | {Nombre} |

## Directive Fondamentale

> "Peu importe ce que nous découvrons, nous comprenons et croyons sincèrement
> que chacun a fait du mieux qu'il pouvait..."

## Check-in

| Membre | Mood |
|--------|------|
| @dev1 | 😊 |
| @dev2 | 😐 |

## Observations

[Coller le format choisi avec les observations collectées]

## Thèmes Identifiés

### Thème 1 : {Communication}
Votes : ●●●●●
- Observation 1
- Observation 2

### Thème 2 : {Processus}
Votes : ●●●
- Observation 1

## Discussion

### Analyse Thème 1

**Problème** : {Description}

**5 Pourquoi** :
1. Pourquoi ? → {Réponse}
2. Pourquoi ? → {Réponse}
3. Pourquoi ? → {Cause racine}

**Solution proposée** : {Solution}

## Actions

### Action 1 : {Améliorer la communication}
- **Responsable** : @dev1
- **Deadline** : Sprint {N+1}
- **DoD** : Daily max 15 min, parking lot utilisé
- **Status** : 🔵 À faire

## Check-out

ROTI moyen : {X}/5

Verbatims :
- "{Ce que j'emporte...}"
- "{Ce que j'emporte...}"
```

## Outils Recommandés

### Virtuels
- Miro / FigJam (boards visuels)
- Retrium (dédié rétros)
- EasyRetro
- Metro Retro

### Formats Alternatifs
- Mad/Sad/Glad
- What Went Well / What Didn't / Ideas
- Speed Car (moteur, parachute, abyss)
- Hot Air Balloon

## Prochaine étape

```
╔══════════════════════════════════════════════════════════╗
║                   PROCHAINE ÉTAPE                        ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║  Si d'autres sprints restent :                           ║
║  → /workflow:start {N+1}                                 ║
║    Démarrer le prochain sprint                           ║
║                                                          ║
║  Si le projet est terminé :                              ║
║  → /common:release-checklist                             ║
║    Préparer la release                                   ║
║  → /common:generate-changelog                            ║
║    Générer le changelog                                  ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
```
