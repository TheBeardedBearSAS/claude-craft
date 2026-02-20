---
description: Valider l'alignement spec-code pour garantir que l'implémentation correspond aux spécifications
argument-hint: [id-story]
---

# Valider l'Alignement Spec-Code

Valider que l'implémentation du code est alignée avec les spécifications (PRD, user stories, spec technique). Ce gate vérifie qu'aucune dérive de spécification ne s'est produite pendant l'implémentation.

## Arguments

$ARGUMENTS (format: [id-story])
- **id-story** (optionnel) : ID de la story à vérifier. Défaut : toutes les stories du sprint courant

## Critères du Gate

| Critère | Poids | Requis | Description |
|---------|-------|--------|-------------|
| Couverture des requirements | 20% | Oui | Tous les FR-xxx du PRD sont couverts par des stories |
| Mapping story-code | 20% | Oui | Toutes les stories ont des références de code |
| Mapping AC-test | 20% | Oui | Tous les critères d'acceptance ont des tests |
| Adhérence au spec technique | 15% | Oui | L'implémentation suit la conception du spec technique |
| Conformité constitution | 15% | Oui | Le code respecte la constitution du projet |
| Détection de dérive | 10% | Non | Pas de changements de code non référencés |

**Seuil : 85%**

## Processus

### Étape 1 : Charger les spécifications

1. Charger le PRD avec les IDs de requirements FR-xxx
2. Charger les user stories avec les références `Implements:`
3. Charger le spec technique avec le mapping des requirements
4. Charger la constitution du projet (si elle existe)

### Étape 2 : Traçage avant (Spec → Code)

Pour chaque requirement FR-xxx dans le PRD :
1. Trouver les stories qui l'implémentent (`Implements: FR-xxx`)
2. Pour chaque story, trouver les fichiers de code avec `// Story: US-xxx`
3. Pour chaque AC, trouver le test correspondant
4. Enregistrer le statut de couverture

### Étape 3 : Traçage arrière (Code → Spec)

Pour chaque fichier de code avec des références de story :
1. Vérifier que la référence de story existe dans le backlog
2. Vérifier que la story est assignée au sprint correct
3. Chercher des changements de code sans références de story (dérive)

### Étape 4 : Valider la constitution

Si `project-management/constitution.md` existe :
1. Vérifier la conformité des contraintes techniques
2. Vérifier l'adhérence aux principes de design
3. Vérifier les objectifs NFR

### Étape 5 : Scorer et rapporter

Calculer le score pondéré sur tous les critères. Générer un rapport détaillé.

## Format de sortie

### Gate réussi

```
╔══════════════════════════════════════════════════════════╗
║          GATE ALIGNEMENT SPEC-CODE ✅                    ║
╠══════════════════════════════════════════════════════════╣
║ Story : US-012 | Score : 92%                             ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ ✅ Couverture requirements    3/3 FR-xxx couverts (100%) ║
║ ✅ Mapping story-code         4 fichiers réf. US-012     ║
║ ✅ Mapping AC-test            3/3 ACs ont des tests      ║
║ ✅ Adhérence spec technique   Design conforme au spec    ║
║ ✅ Conformité constitution    Toutes contraintes OK      ║
║ ⚠️  Détection de dérive       1 fichier non référencé    ║
║                                                          ║
║ → Alignement vérifié, prêt pour le merge                 ║
╚══════════════════════════════════════════════════════════╝
```

### Gate échoué

```
╔══════════════════════════════════════════════════════════╗
║          GATE ALIGNEMENT SPEC-CODE ❌                    ║
╠══════════════════════════════════════════════════════════╣
║ Story : US-012 | Score : 65%                             ║
╠══════════════════════════════════════════════════════════╣
║                                                          ║
║ ✅ Couverture requirements    3/3 FR-xxx couverts        ║
║ ❌ Mapping story-code         2 fichiers sans références ║
║ ❌ Mapping AC-test            AC-2 n'a pas de test       ║
║ ✅ Adhérence spec technique   Design conforme au spec    ║
║ ❌ Conformité constitution    NFR perf non atteint       ║
║ ⚠️  Détection de dérive       3 fichiers non référencés  ║
║                                                          ║
║ Actions requises :                                       ║
║ 1. Ajouter // Story: US-012 à ProfileService.ts         ║
║ 2. Ajouter // Story: US-012 à ProfileValidator.ts       ║
║ 3. Écrire un test pour AC-2 : L'utilisateur peut        ║
║    modifier son email                                    ║
║ 4. Optimiser l'API profil pour atteindre l'objectif     ║
║    de <200ms                                             ║
║                                                          ║
║ → Corriger les problèmes avant le merge                  ║
╚══════════════════════════════════════════════════════════╝
```

## Exemple

```
/gate:validate-alignment US-012
/gate:validate-alignment          # Toutes les stories du sprint courant
```

## Commandes associées

- `/project:trace` — Voir la matrice de traçabilité
- `/project:coverage-map` — Vérifier la couverture des requirements
- `/project:checkpoint` — Exécuter les checkpoints de phase
- `/gate:validate-story` — Valider la complétude de la story
