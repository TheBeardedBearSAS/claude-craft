---
description: Check Compliance React Native
argument-hint: [arguments]
---

# Check Compliance React Native

## Arguments

$ARGUMENTS

## MISSION

Tu es un auditeur expert en React Native. Ta mission est de réaliser un audit complet de conformité du projet React Native en orchestrant les 4 audits spécialisés.

### Étape 1 : Analyse du contexte projet

1. Localise et lis le fichier `.claude/rules/00-project-context.md` s'il existe
2. Identifie la structure du projet (Expo, React Native CLI, Expo Router)
3. Note les technologies utilisées (TypeScript, state management, navigation)

### Étape 2 : Exécution des audits spécialisés

Lance les 4 audits suivants dans l'ordre et collecte leurs résultats :

1. **Architecture** (`/check-architecture $ARGUMENTS`)
   - Vérifie la structure feature-based
   - Valide l'organisation des dossiers
   - Score sur 25 points

2. **Qualité de Code** (`/check-code-quality $ARGUMENTS`)
   - Analyse TypeScript strict mode
   - Vérifie ESLint et Prettier
   - Score sur 25 points

3. **Tests** (`/check-testing $ARGUMENTS`)
   - Évalue la couverture de tests
   - Valide Jest, RNTL, Detox
   - Score sur 25 points

4. **Sécurité** (`/check-security $ARGUMENTS`)
   - Audit des pratiques de sécurité
   - Vérifie SecureStore et certificats
   - Score sur 25 points

### Étape 3 : Agrégation des résultats

Compile tous les résultats dans un rapport global avec :

## 📊 SCORE GLOBAL DE CONFORMITÉ

**Score Total : XX/100**

```
┌─────────────────────────┬───────┬────────┐
│ Catégorie               │ Score │ Status │
├─────────────────────────┼───────┼────────┤
│ 🏗️  Architecture        │ XX/25 │ ✅/⚠️/❌│
│ 💎 Qualité de Code      │ XX/25 │ ✅/⚠️/❌│
│ 🧪 Tests                │ XX/25 │ ✅/⚠️/❌│
│ 🔒 Sécurité             │ XX/25 │ ✅/⚠️/❌│
├─────────────────────────┼───────┼────────┤
│ TOTAL                   │ XX/100│ ✅/⚠️/❌│
└─────────────────────────┴───────┴────────┘
```

**Légende des statuts :**
- ✅ Excellent (≥ 20/25 ou ≥ 80/100)
- ⚠️ Attention (15-19/25 ou 60-79/100)
- ❌ Critique (< 15/25 ou < 60/100)

### Étape 4 : Synthèse détaillée

Pour chaque catégorie, liste les points suivants :

#### 🏗️ ARCHITECTURE (XX/25)

**Points forts :**
- [Liste des bonnes pratiques identifiées]

**Points d'amélioration :**
- [Liste des problèmes avec leur impact]

---

#### 💎 QUALITÉ DE CODE (XX/25)

**Points forts :**
- [Liste des bonnes pratiques identifiées]

**Points d'amélioration :**
- [Liste des problèmes avec leur impact]

---

#### 🧪 TESTS (XX/25)

**Points forts :**
- [Liste des bonnes pratiques identifiées]

**Points d'amélioration :**
- [Liste des problèmes avec leur impact]

---

#### 🔒 SÉCURITÉ (XX/25)

**Points forts :**
- [Liste des bonnes pratiques identifiées]

**Points d'amélioration :**
- [Liste des problèmes avec leur impact]

---

## 🎯 TOP 3 ACTIONS PRIORITAIRES

Sur la base de l'ensemble de l'audit, identifie les 3 actions les plus critiques :

### 1. [ACTION PRIORITAIRE #1]
- **Catégorie :** [Architecture/Code/Tests/Sécurité]
- **Impact :** [Critique/Élevé/Moyen]
- **Effort :** [Faible/Moyen/Élevé]
- **Description :** [Explication détaillée du problème]
- **Solution recommandée :** [Actions concrètes à mener]
- **Fichiers concernés :** [Liste des fichiers]

### 2. [ACTION PRIORITAIRE #2]
- **Catégorie :** [Architecture/Code/Tests/Sécurité]
- **Impact :** [Critique/Élevé/Moyen]
- **Effort :** [Faible/Moyen/Élevé]
- **Description :** [Explication détaillée du problème]
- **Solution recommandée :** [Actions concrètes à mener]
- **Fichiers concernés :** [Liste des fichiers]

### 3. [ACTION PRIORITAIRE #3]
- **Catégorie :** [Architecture/Code/Tests/Sécurité]
- **Impact :** [Critique/Élevé/Moyen]
- **Effort :** [Faible/Moyen/Élevé]
- **Description :** [Explication détaillée du problème]
- **Solution recommandée :** [Actions concrètes à mener]
- **Fichiers concernés :** [Liste des fichiers]

---

## 📈 MÉTRIQUES MOBILES GLOBALES

### Performance
- **Frame Rate :** [XX] FPS (cible: ≥ 60 FPS)
- **Bundle Size JS :** [XX] MB (cible: < 500 KB)
- **Startup Time :** [XX] ms (cible: < 2000 ms)
- **Memory Usage :** [XX] MB (cible: < 150 MB)
- **TTI (Time to Interactive) :** [XX] ms (cible: < 3000 ms)

### Qualité
- **Couverture de tests :** [XX]% (cible: ≥ 80%)
- **Complexité cyclomatique moyenne :** [XX] (cible: < 10)
- **Dette technique :** [XX] heures (selon SonarQube)

### Sécurité
- **Vulnérabilités critiques :** [XX] (cible: 0)
- **Secrets dans le code :** [XX] (cible: 0)
- **Dépendances obsolètes :** [XX] (cible: 0)

---

## 📋 RECOMMANDATIONS GÉNÉRALES

1. **Quick Wins** (Effort faible, impact élevé)
   - [Liste des améliorations rapides à mettre en place]

2. **Refactoring prioritaire** (Effort moyen, impact élevé)
   - [Liste des refactorings importants]

3. **Investissements long terme** (Effort élevé, impact élevé)
   - [Liste des initiatives structurelles]

---

## 🔄 PROCHAINE ÉTAPE

Planifier un plan d'action avec :
- Timeline des corrections
- Assignation des responsabilités
- Définition des critères de succès
- Date du prochain audit de conformité

---

**Date de l'audit :** [Date actuelle]
**Auditeur :** Claude AI - React Native Compliance Expert
**Version du référentiel :** 1.0
