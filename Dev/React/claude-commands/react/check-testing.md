# Vérification des Tests React

## Arguments

$ARGUMENTS

## MISSION

Tu es un expert en testing React chargé d'auditer la stratégie de tests d'un projet React.

### Étape 1 : Analyse du contexte
- Identifier le répertoire du projet à auditer ($ARGUMENTS ou répertoire courant)
- Lire les règles de testing depuis :
  - `/home/fmetivier/Documents/Company/TheBeardedCTO/Tools/Claude/Dev/React/rules/07-testing.md`
  - `/home/fmetivier/Documents/Company/TheBeardedCTO/Tools/Claude/Dev/React/rules/06-tooling.md`

### Étape 2 : Vérification de la configuration des tests

Examiner et vérifier :

**Infrastructure de test (5 points)**
- [ ] Vitest ou Jest configuré
- [ ] React Testing Library installé et configuré
- [ ] Configuration de coverage (vitest.config.ts ou jest.config.js)
- [ ] Scripts npm pour test, test:watch, test:coverage
- [ ] Environment jsdom ou happy-dom configuré

**Configuration du coverage (4 points)**
- [ ] Seuils de coverage définis (statements, branches, functions, lines)
- [ ] Objectif minimum 80% global
- [ ] Exclusions justifiées (.config, .test, .spec)
- [ ] Rapports de coverage générés (lcov, html)

### Étape 3 : Analyse de la couverture de tests

**Coverage global (7 points)**
- [ ] Coverage statements ≥ 80%
- [ ] Coverage branches ≥ 75%
- [ ] Coverage functions ≥ 80%
- [ ] Coverage lines ≥ 80%
- [ ] Fichiers critiques couverts à >90%
- [ ] Pas de fichiers importants non testés
- [ ] Tendance d'amélioration du coverage

**Qualité des tests unitaires (5 points)**
- [ ] Tests co-localisés avec le code (__tests__ ou .test.tsx)
- [ ] Un fichier de test par composant/hook/utilitaire
- [ ] Conventions de nommage : *.test.tsx, *.spec.tsx
- [ ] Tests isolés et indépendants
- [ ] Pas de tests flaky ou skip sans raison

### Étape 4 : Vérification des bonnes pratiques de test

**React Testing Library (4 points)**
- [ ] Tests basés sur le comportement utilisateur (not implementation)
- [ ] Queries prioritaires : getByRole, getByLabelText, getByText
- [ ] Pas d'usage excessif de getByTestId
- [ ] userEvent utilisé pour les interactions
- [ ] Assertions sur les éléments accessibles
- [ ] waitFor pour les opérations asynchrones

### Étape 5 : Analyse des types de tests

Pour un échantillon représentatif :
- Identifier tests unitaires vs tests d'intégration
- Vérifier présence de tests pour :
  - Composants UI (rendu, props, events)
  - Hooks personnalisés
  - Fonctions utilitaires
  - Services/API calls (mocks)
  - Formulaires et validation
  - Gestion d'erreurs
- Évaluer la qualité des assertions
- Vérifier les mocks et stubs (MSW recommandé)

### Étape 6 : Calcul du score

**Score sur 25 points :**
- Infrastructure de test : 5 points
- Configuration du coverage : 4 points
- Coverage global : 7 points
- Qualité des tests unitaires : 5 points
- React Testing Library : 4 points

### Étape 7 : Exécution des tests et analyse

Exécuter les commandes :
```bash
# Lancer les tests avec coverage
npm run test:coverage || yarn test:coverage

# Analyser les résultats
```

Extraire les métriques :
- Coverage actuel par catégorie
- Nombre de tests total
- Temps d'exécution des tests
- Tests en échec ou skipped

### Étape 8 : Rapport de conformité

Générer un rapport structuré :

```
═══════════════════════════════════════════════════
🧪 AUDIT TESTING REACT
═══════════════════════════════════════════════════

📊 SCORE GLOBAL : XX/25

🔧 INFRASTRUCTURE DE TEST : XX/5
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

⚙️  CONFIGURATION COVERAGE : XX/4
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

📈 COVERAGE GLOBAL : XX/7

Métriques actuelles :
• Statements  : XX% (objectif ≥80%)
• Branches    : XX% (objectif ≥75%)
• Functions   : XX% (objectif ≥80%)
• Lines       : XX% (objectif ≥80%)

Fichiers non couverts ou sous le seuil :
• src/features/user/UserProfile.tsx : 45% (critique)
• src/utils/formatDate.ts : 60% (important)
• ...

✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

✨ QUALITÉ DES TESTS : XX/5
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

Problèmes détectés :
• XX tests skipped sans justification
• XX tests flaky identifiés
• XX fichiers sans tests

🎯 REACT TESTING LIBRARY : XX/4
✅ Points forts :
   • ...
⚠️  Points d'amélioration :
   • ...
❌ Problèmes critiques :
   • ...

Anti-patterns détectés :
• Usage excessif de getByTestId dans UserCard.test.tsx
• Tests basés sur l'implémentation dans useAuth.test.ts
• ...

📊 STATISTIQUES
• Total tests : XXX
• Tests réussis : XXX
• Tests en échec : XX
• Tests skipped : XX
• Temps d'exécution : XXs

═══════════════════════════════════════════════════
🎯 TOP 3 ACTIONS PRIORITAIRES
═══════════════════════════════════════════════════

1. [Priorité HAUTE] Augmenter le coverage de XX% à 80%
   → Ajouter tests pour : UserProfile, Dashboard, ...
   → Effort estimé : X jours

2. [Priorité HAUTE] Corriger les XX tests en échec
   → Tests identifiés : ...
   → Effort estimé : X heures

3. [Priorité MOYENNE] Améliorer les pratiques RTL
   → Remplacer getByTestId par getByRole
   → Effort estimé : X heures

═══════════════════════════════════════════════════
📚 RÉFÉRENCES
═══════════════════════════════════════════════════

• rules/07-testing.md - Standards de testing
• rules/06-tooling.md - Configuration des outils
• https://testing-library.com/docs/queries/about/#priority
```

### Étape 9 : Recommandations détaillées

Pour chaque gap de coverage identifié :
- Lister les fichiers/fonctions non testés
- Proposer des cas de test à ajouter
- Fournir des exemples de tests manquants
- Estimer l'effort de mise en conformité
