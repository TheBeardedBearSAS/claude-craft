---
description: Vérification de lArchitecture React
argument-hint: [arguments]
model: haiku

---

# Vérification de l'Architecture React

## Arguments

$ARGUMENTS

## MISSION

Tu es un expert en architecture React chargé d'auditer la conformité architecturale d'un projet React.

### Étape 1 : Analyse du contexte
- Identifier le répertoire du projet à auditer ($ARGUMENTS ou répertoire courant)
- Lire les règles architecturales depuis `/home/fmetivier/Documents/Company/TheBeardedCTO/Tools/Claude/Dev/React/rules/02-architecture.md`
- Comprendre la structure attendue (Feature-based, Atomic Design)

### Étape 2 : Vérification de la structure du projet

Examiner et vérifier :

**Organisation des dossiers (8 points)**
- [ ] Structure feature-based ou modulaire présente
- [ ] Séparation claire features/shared/core
- [ ] Dossiers par domaine métier identifiables
- [ ] Pas de code métier dans `/src/components` racine

**Atomic Design (7 points)**
- [ ] Hiérarchie atoms/molecules/organisms/templates/pages
- [ ] Composants atomiques réutilisables
- [ ] Composition progressive respectée
- [ ] Pas de logique métier dans les atoms

**Structure des features (5 points)**
- [ ] Chaque feature contient : components, hooks, services, types
- [ ] Index.ts avec exports publics
- [ ] API interne encapsulée
- [ ] Tests co-localisés avec le code

**Gestion d'état (5 points)**
- [ ] State management centralisé (Context/Zustand/Redux)
- [ ] Pas de prop drilling excessif (>3 niveaux)
- [ ] State local vs global clairement séparé
- [ ] Hooks personnalisés pour la logique réutilisable

### Étape 3 : Analyse approfondie

Pour chaque feature/module identifié :
- Vérifier la cohésion interne
- Identifier les dépendances circulaires
- Vérifier l'encapsulation des API
- Mesurer le couplage inter-features

### Étape 4 : Calcul du score

**Score sur 25 points :**
- Organisation des dossiers : 8 points
- Atomic Design : 7 points
- Structure des features : 5 points
- Gestion d'état : 5 points

### Étape 5 : Rapport de conformité

Générer un rapport structuré :

```
═══════════════════════════════════════════════════
🏗️  AUDIT ARCHITECTURE REACT
═══════════════════════════════════════════════════

📊 SCORE GLOBAL : XX/25

📁 ORGANISATION DES DOSSIERS : XX/8
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

⚛️  ATOMIC DESIGN : XX/7
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

🎯 STRUCTURE DES FEATURES : XX/5
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

🔄 GESTION D'ÉTAT : XX/5
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

═══════════════════════════════════════════════════
🎯 TOP 3 ACTIONS PRIORITAIRES
═══════════════════════════════════════════════════

1. [Priorité HAUTE] ...
2. [Priorité HAUTE] ...
3. [Priorité MOYENNE] ...

═══════════════════════════════════════════════════
📚 RÉFÉRENCES
═══════════════════════════════════════════════════

• rules/02-architecture.md - Standards architecturaux
• rules/03-coding-standards.md - Conventions de code
```

### Étape 6 : Recommandations détaillées

Pour chaque problème identifié :
- Expliquer l'impact
- Proposer une solution concrète
- Fournir un exemple de code si pertinent
- Indiquer le niveau d'effort (Low/Medium/High)
