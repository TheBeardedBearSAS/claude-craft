---
description: Valider le PRD contre le quality gate (≥80%)
argument-hint: [fichier-prd]
---

# Valider Gate PRD

Valider un Document de Spécifications Produit contre le quality gate PRD.
Le PRD doit obtenir au moins 80% pour passer.

## Arguments

$ARGUMENTS (format: [fichier-prd])
- **fichier-prd** (optionnel): Chemin vers le fichier PRD. Défaut: `docs/prd.md`

## Critères du Gate

| Critère | Poids | Requis | Description |
|---------|-------|--------|-------------|
| Énoncé du problème | 15% | Oui | Articulation claire du problème |
| Utilisateurs cibles | 15% | Oui | Audience/personas définis |
| Objectifs | 15% | Oui | Objectifs mesurables |
| Métriques de succès | 15% | Oui | KPIs et mesures |
| Périmètre | 10% | Oui | Ce qui est inclus/exclu |
| Aperçu User Stories | 10% | Oui | Liste des fonctionnalités |
| Hypothèses | 10% | Non | Hypothèses documentées |
| Risques | 10% | Non | Identification des risques |

**Seuil: 80%**

## Processus

### Étape 1: Localiser le fichier PRD

1. Utiliser le chemin fourni ou le défaut `docs/prd.md`
2. Vérifier que le fichier existe
3. Charger le contenu pour analyse

### Étape 2: Valider chaque critère

Pour chaque critère, vérifier:
- Le contenu existe avec les mots-clés pertinents
- La section a une longueur de contenu minimale
- Les éléments requis sont présents

### Étape 3: Calculer le score

Calcul du score:
- Chaque critère a un poids (pourcentage)
- Passer un critère ajoute son poids au score
- Score final = somme des poids passés

### Étape 4: Générer le rapport

Afficher:
- Résultats par critère
- Score total et seuil
- Statut Passé/Échoué
- Suggestions d'amélioration

## Format de Sortie

### PRD Validé

```
═══════════════════════════════════════════════════════
            Validation Gate PRD
═══════════════════════════════════════════════════════

Fichier: docs/prd.md
Seuil: 80%

Résultats de Validation:
──────────────────────────────────────────────────────
✅ Énoncé du problème (15%)
✅ Utilisateurs cibles (15%)
✅ Objectifs (15%)
✅ Métriques de succès (15%)
✅ Périmètre (10%)
✅ Aperçu User Stories (10%)
✅ Hypothèses (10%)
⚠️ Risques (10%) - Partiel

Score: 90/100 (90%)
──────────────────────────────────────────────────────

✅ GATE PRD PASSÉ

Prêt à passer à la phase Tech Spec.
Suivant: /pm:handoff architect
═══════════════════════════════════════════════════════
```

### PRD Échoué

```
═══════════════════════════════════════════════════════
            Validation Gate PRD
═══════════════════════════════════════════════════════

Fichier: docs/prd.md
Seuil: 80%

Score: 50/100 (50%)
──────────────────────────────────────────────────────

❌ GATE PRD ÉCHOUÉ (besoin 80%, obtenu 50%)

Actions Requises:
──────────────────────────────────────────────────────
1. Ajouter des objectifs mesurables
2. Définir les métriques de succès et KPIs
3. Documenter les hypothèses
4. Ajouter l'évaluation des risques

Relancer après corrections: /gate:validate-prd
═══════════════════════════════════════════════════════
```

## Exemple

```
/gate:validate-prd
/gate:validate-prd docs/feature-prd.md
```
