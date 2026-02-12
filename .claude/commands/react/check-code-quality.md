---
description: Vérification de la Qualité du Code React
argument-hint: [arguments]
---

# Vérification de la Qualité du Code React

## Arguments

$ARGUMENTS

## MISSION

Tu es un expert en qualité de code React chargé d'auditer les standards de code d'un projet React.

### Étape 1 : Analyse du contexte
- Identifier le répertoire du projet à auditer ($ARGUMENTS ou répertoire courant)
- Lire les règles de qualité depuis :
  - `/home/fmetivier/Documents/Company/TheBeardedCTO/Tools/Claude/Dev/React/rules/03-coding-standards.md`
  - `/home/fmetivier/Documents/Company/TheBeardedCTO/Tools/Claude/Dev/React/rules/04-solid-principles.md`
  - `/home/fmetivier/Documents/Company/TheBeardedCTO/Tools/Claude/Dev/React/rules/05-kiss-dry-yagni.md`
  - `/home/fmetivier/Documents/Company/TheBeardedCTO/Tools/Claude/Dev/React/rules/08-quality-tools.md`

### Étape 2 : Vérification TypeScript et typage

Examiner et vérifier :

**Configuration TypeScript (6 points)**
- [ ] tsconfig.json avec strict: true
- [ ] noImplicitAny, strictNullChecks activés
- [ ] Pas de @ts-ignore ou @ts-expect-error sans justification
- [ ] Types exportés depuis des fichiers .types.ts ou .d.ts

**Qualité du typage (7 points)**
- [ ] Props des composants typées avec interfaces
- [ ] Hooks personnalisés retournent des types explicites
- [ ] Pas d'usage excessif de 'any' (<5% des types)
- [ ] Types génériques utilisés correctement
- [ ] Enums ou union types pour les constantes
- [ ] Type guards pour les narrowing
- [ ] Discriminated unions pour les variants

### Étape 3 : Vérification ESLint et formatting

**Configuration ESLint (4 points)**
- [ ] ESLint configuré avec règles React recommandées
- [ ] Plugin @typescript-eslint actif
- [ ] Règles react-hooks activées
- [ ] Pas de violations non justifiées (eslint-disable)

**Code style (4 points)**
- [ ] Prettier configuré et appliqué
- [ ] Conventions de nommage cohérentes
- [ ] Imports organisés (absolus vs relatifs)
- [ ] Pas de code mort ou commentaires inutiles

### Étape 4 : Vérification des conventions de nommage

**Nommage des composants (4 points)**
- [ ] PascalCase pour les composants React
- [ ] camelCase pour les fonctions utilitaires
- [ ] UPPER_CASE pour les constantes
- [ ] Noms descriptifs et auto-documentés
- [ ] Préfixes cohérents (use pour hooks, is/has pour booléens)

### Étape 5 : Analyse des principes SOLID et bonnes pratiques

Pour un échantillon représentatif de composants :
- Vérifier le principe de responsabilité unique (SRP)
- Identifier les composants trop complexes (>300 lignes)
- Vérifier la composition vs l'héritage
- Analyser le couplage et la cohésion
- Vérifier DRY (pas de duplication de code)
- Vérifier KISS (simplicité des solutions)

### Étape 6 : Calcul du score

**Score sur 25 points :**
- Configuration TypeScript : 6 points
- Qualité du typage : 7 points
- Configuration ESLint : 4 points
- Code style : 4 points
- Conventions de nommage : 4 points

### Étape 7 : Rapport de conformité

Générer un rapport structuré :

```
═══════════════════════════════════════════════════
💎 AUDIT QUALITÉ DU CODE REACT
═══════════════════════════════════════════════════

📊 SCORE GLOBAL : XX/25

🔷 TYPESCRIPT CONFIGURATION : XX/6
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

📝 QUALITÉ DU TYPAGE : XX/7
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

Exemples de problèmes détectés :
• Fichier : path/to/file.tsx:42
  Problème : Utilisation de 'any' sans justification
  Suggestion : Définir une interface explicite

🔧 ESLINT & FORMATTING : XX/4
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

✨ CODE STYLE : XX/4
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

🏷️  CONVENTIONS DE NOMMAGE : XX/4
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

Exemples de violations :
• get_user_data() → devrait être getUserData()
• MyComponent.tsx contient plusieurs composants
• Constantes en camelCase au lieu de UPPER_CASE

═══════════════════════════════════════════════════
🎯 TOP 3 ACTIONS PRIORITAIRES
═══════════════════════════════════════════════════

1. [Priorité HAUTE] ...
2. [Priorité HAUTE] ...
3. [Priorité MOYENNE] ...

═══════════════════════════════════════════════════
📚 RÉFÉRENCES
═══════════════════════════════════════════════════

• rules/03-coding-standards.md - Standards de code
• rules/04-solid-principles.md - Principes SOLID
• rules/05-kiss-dry-yagni.md - Principes de simplicité
• rules/08-quality-tools.md - Outils de qualité
```

### Étape 8 : Métriques de qualité

Calculer et afficher :
- Pourcentage de fichiers avec strict mode TypeScript
- Nombre de any détectés vs types explicites
- Taux de conformité ESLint
- Nombre de fichiers non formatés par Prettier
- Complexité cyclomatique moyenne
- Dette technique estimée (en heures de refactoring)
