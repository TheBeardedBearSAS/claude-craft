# Validation SCRUM du Backlog

Tu es un Certified Scrum Master expérimenté. Tu dois vérifier et améliorer le backlog existant pour garantir sa conformité avec les principes SCRUM officiels (Scrum Guide, Scrum Alliance).

## RÉFÉRENTIEL SCRUM OFFICIEL

### Les 3 Piliers de Scrum (FONDAMENTAUX)
Vérifie que le backlog respecte :
1. **Transparence** : Tout est visible, compréhensible par tous
2. **Inspection** : Le travail peut être évalué régulièrement  
3. **Adaptation** : Ajustements possibles basés sur les inspections

### Le Manifeste Agile - 4 Valeurs
```
✓ Les individus et leurs interactions > processus et outils
✓ Des logiciels opérationnels > documentation exhaustive
✓ La collaboration avec les clients > négociation contractuelle
✓ L'adaptation au changement > suivi d'un plan
```

### Les 12 Principes Agile
1. Satisfaire le client par des livraisons rapides et régulières
2. Accueillir positivement les changements de besoins
3. Livrer fréquemment un logiciel opérationnel (quelques semaines)
4. Collaboration quotidienne business/développeurs
5. Réaliser les projets avec des personnes motivées
6. Dialogue en face à face = meilleure communication
7. Un logiciel opérationnel = principale mesure d'avancement
8. Rythme de développement soutenable
9. Attention continue à l'excellence technique
10. Simplicité = minimiser le travail inutile
11. Les meilleures architectures émergent d'équipes auto-organisées
12. Réflexion régulière sur comment devenir plus efficace

## MISSION DE VÉRIFICATION

### ÉTAPE 1 : Analyser le backlog existant
Lis tous les fichiers dans `project-management/` :
- README.md
- personas.md
- definition-of-done.md
- dependencies-matrix.md
- backlog/epics/*.md
- backlog/user-stories/*.md
- sprints/*/sprint-goal.md

### ÉTAPE 2 : Vérifier les User Stories avec INVEST

Chaque User Story DOIT respecter le modèle **INVEST** :

| Critère | Vérification | Action si non conforme |
|---------|--------------|----------------------|
| **I**ndependent | La US peut être développée seule | Découper ou réorganiser les dépendances |
| **N**egotiable | La US n'est pas un contrat figé | Reformuler si trop prescriptive |
| **V**aluable | La US apporte de la valeur au client/utilisateur | Revoir le "Afin de" |
| **E**stimable | L'équipe peut estimer la US | Clarifier ou découper si trop vague |
| **S**ized appropriately | La US peut être terminée en 1 Sprint | Découper si > 8 points |
| **T**estable | Des tests peuvent valider la US | Ajouter/améliorer les critères d'acceptance |

### ÉTAPE 3 : Vérifier les 3 C de chaque Story

Chaque User Story doit avoir les **3 C** :

1. **Carte** (Card)
   - Tient sur une carte 10x15 cm (concis)
   - Format : "En tant que... Je veux... Afin de..."
   - Pas de détails techniques excessifs

2. **Conversation**  
   - La US est une invitation à la discussion
   - Pas une spécification exhaustive
   - Notes pour guider la conversation présentes

3. **Confirmation**
   - Critères d'acceptance clairs
   - Tests d'acceptance identifiables
   - Definition of Done applicable

### ÉTAPE 4 : Vérifier les Critères d'Acceptance avec SMART

Chaque critère d'acceptance DOIT être **SMART** :

| Critère | Signification | Exemple conforme |
|---------|---------------|------------------|
| **S**pécifique | Explicitement défini | "Le bouton 'Valider' devient vert" |
| **M**esurable | Observable et quantifiable | "Temps de réponse < 200ms" |
| **A**tteignable | Réalisable techniquement | Pas de "parfait", "instantané" |
| **R**éaliste | En rapport avec la Story | Pas de critères hors scope |
| **T**emporel | Quand observer le résultat | "Après clic", "En moins de 2s" |

### ÉTAPE 5 : Vérifier la structure des Critères d'Acceptance

Format Gherkin obligatoire :
```gherkin
GIVEN <pré-condition>
WHEN <acteur identifié> <action>
THEN <résultat observable>
```

**Chaque critère DOIT contenir** :
- Un acteur identifié (persona P-XXX ou rôle)
- Un verbe d'action
- Un résultat observable (pas abstrait)

**Minimum requis par US** :
- 1 scénario nominal
- 2 scénarios alternatifs
- 2 scénarios d'erreur

### ÉTAPE 6 : Vérifier le Story Mapping et le Walking Skeleton

**Walking Skeleton** = Premier incrément livrable minimal
- Sprint 1 doit contenir un parcours complet de bout en bout
- Pas juste de l'infrastructure, mais une fonctionnalité testable

**Backbone** (Épine dorsale) = Activités essentielles du système
- Les Epics doivent couvrir toutes les activités principales
- Pas de gaps fonctionnels

**Checklist** :
- [ ] Sprint 1 livre un Walking Skeleton (pas juste setup)
- [ ] Les Epics forment une Backbone cohérente
- [ ] Les US sont ordonnées du plus nécessaire au moins nécessaire

### ÉTAPE 7 : Vérifier les MMF (Minimum Marketable Feature)

Chaque Epic DOIT avoir un **MMF identifié** :
- Plus petit ensemble de fonctionnalités apportant une valeur réelle
- Devrait avoir son propre ROI
- Livrable indépendamment

Si absent, ajouter dans chaque Epic :
```markdown
## Minimum Marketable Feature (MMF)
**MMF de cet Epic** : [Description de la plus petite version livrable avec valeur]
**Valeur livrée** : [Bénéfice concret pour l'utilisateur]
**US incluses dans le MMF** : US-XXX, US-XXX
```

### ÉTAPE 8 : Vérifier les Personas

Les Personas doivent avoir :
- [ ] Un nom et une identité réaliste
- [ ] Des objectifs clairs (Goals)
- [ ] Des frustrations/pain points
- [ ] Des scénarios d'utilisation
- [ ] Un niveau technique défini

**Règle** : Chaque US doit référencer un Persona existant (P-XXX), pas un rôle générique.

### ÉTAPE 9 : Vérifier la Definition of Done

La DoD doit être **progressive** :

**Niveau Simple (minimum)** :
- [ ] Code fini
- [ ] Tests finis
- [ ] Validé par le Product Owner

**Niveau Amélioré** :
- [ ] Code fini
- [ ] Tests unitaires rédigés et exécutés
- [ ] Tests d'intégration passants
- [ ] Tests de performance exécutés
- [ ] Documentation (juste ce qu'il faut)

**Niveau Complet** :
- [ ] Tests d'acceptance automatisés au vert
- [ ] Métriques qualité code OK (80% couverture, <10% duplicata)
- [ ] Aucun défaut connu
- [ ] Approuvé par le Product Owner
- [ ] Prêt pour la production

### ÉTAPE 10 : Vérifier les Cérémonies Scrum

Le backlog doit prévoir les cérémonies :

| Cérémonie | Durée (Sprint 2 sem) | Contenu |
|-----------|---------------------|---------|
| Sprint Planning Part 1 | 2h | Le QUOI - Items prioritaires + Objectif Sprint |
| Sprint Planning Part 2 | 2h | Le COMMENT - Décomposition en tâches |
| Daily Scrum | 15 min/jour | 3 questions : Hier? Aujourd'hui? Obstacles? |
| Sprint Review | 2h | Démo + Validation PO + Feedback |
| Rétrospective | 1.5h | Inspection/Adaptation de l'équipe |
| Affinage Backlog | 5-10% du Sprint | Découpage, estimation, clarification |

### ÉTAPE 11 : Vérifier la Rétrospective

Vérifier la présence de la **Directive Fondamentale** :

```markdown
## Directive Fondamentale de la Rétrospective

"Peu importe ce que nous découvrons, nous comprenons et croyons 
sincèrement que tout le monde a fait le meilleur travail possible, 
compte tenu de ce qu'ils savaient à l'époque, leurs compétences 
et aptitudes, les ressources disponibles, et la situation à portée de main."
```

Techniques de rétrospective suggérées :
- Étoile de Mer (Starfish) : Continuer/Arrêter/Commencer/Plus de/Moins de
- Les 5 Pourquoi (Root Cause Analysis)
- Ce qui a marché / Ce qui n'a pas marché / Actions

### ÉTAPE 12 : Vérifier les Estimations

**Planning Poker avec Fibonacci** : 1, 2, 3, 5, 8, 13, 21

Règles de validation :
- [ ] Aucune US > 13 points (sinon découper)
- [ ] US du Sprint actuel : max 8 points
- [ ] Items du backlog futur peuvent être plus gros (Epics)

**Cohérence** : Une US de 8 points ≈ 4x une US de 2 points en effort

### ÉTAPE 13 : Vérifier l'Objectif du Sprint (Sprint Goal)

Chaque Sprint DOIT avoir un objectif clair en **une phrase** :

L'objectif du Sprint :
- [ ] Est un sous-ensemble de l'objectif de la Release
- [ ] Guide les décisions de l'équipe
- [ ] Peut être atteint même si toutes les US ne sont pas terminées

## CHECKLIST DE CONFORMITÉ SCRUM

### User Stories
- [ ] Toutes les US respectent INVEST
- [ ] Toutes les US ont les 3 C (Carte, Conversation, Confirmation)
- [ ] Format "En tant que [Persona P-XXX]... Je veux... Afin de..."
- [ ] Chaque US référence un Persona identifié (pas de rôle générique)
- [ ] Aucune US > 8 points dans les sprints planifiés

### Critères d'Acceptance
- [ ] Tous les critères respectent SMART
- [ ] Format Gherkin : GIVEN/WHEN/THEN
- [ ] Minimum : 1 nominal + 2 alternatifs + 2 erreurs par US
- [ ] Chaque critère a un résultat OBSERVABLE

### Epics
- [ ] Chaque Epic a un MMF identifié
- [ ] Les Epics forment une Backbone cohérente
- [ ] Dépendances entre Epics documentées

### Sprints
- [ ] Sprint 1 = Walking Skeleton (fonctionnalité complète)
- [ ] Chaque Sprint a un Sprint Goal clair (une phrase)
- [ ] Durée fixe (2 semaines)
- [ ] Vélocité cohérente entre sprints

### Definition of Done
- [ ] DoD existe et est complète
- [ ] DoD couvre Code + Tests + Documentation + Déploiement
- [ ] DoD est la même pour toutes les US

### Personas
- [ ] Minimum 3 personas (1 primaire, 2+ secondaires)
- [ ] Chaque persona a : nom, objectifs, frustrations, scénarios
- [ ] Matrice Personas/Fonctionnalités remplie

## FORMAT DU RAPPORT

Génère `project-management/scrum-validation-report.md` :

```markdown
# Rapport de Validation SCRUM - [NOM DU PROJET]

**Date** : [Date]
**Score Global** : [X/100]

## Résumé
- ✅ Conformes : [X] éléments
- ⚠️ À améliorer : [X] éléments  
- ❌ Non conformes : [X] éléments

## Détail par catégorie

### User Stories [X/100]
| US | INVEST | 3C | Persona | Points | Statut |
|----|--------|-----|---------|--------|--------|
| US-001 | ✅ | ⚠️ | ✅ | 3 | À améliorer |

**Problèmes détectés** :
1. US-XXX : [Problème]

**Actions correctives** :
1. US-XXX : [Action à effectuer]

### Critères d'Acceptance [X/100]
| US | SMART | Gherkin | Nb Scénarios | Statut |
|----|-------|---------|--------------|--------|

### Personas [X/100]
| Persona | Complet | Utilisé | Statut |
|---------|---------|---------|--------|

### Epics [X/100]
| Epic | MMF | Dépendances | Statut |
|------|-----|-------------|--------|

### Sprints [X/100]
| Sprint | Goal | Walking Skeleton | Cérémonies | Statut |
|--------|------|------------------|------------|--------|

### Definition of Done [X/100]
[Analyse]

## Corrections effectuées
| Fichier | Modification |
|---------|--------------|

## Recommandations d'amélioration continue
1. [Recommandation 1]
2. [Recommandation 2]
```

## ACTIONS À EFFECTUER

1. **Lire** tous les fichiers du backlog existant
2. **Évaluer** chaque élément avec les critères ci-dessus
3. **Corriger** les fichiers non conformes directement
4. **Ajouter** les éléments manquants (MMF, Sprint Goals, etc.)
5. **Générer** le rapport de validation

---
Exécute maintenant cette mission de validation et amélioration.
