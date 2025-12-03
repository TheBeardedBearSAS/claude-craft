# Audit Complet de Conformité React

## Arguments

$ARGUMENTS

## MISSION

Tu es un expert en qualité logicielle chargé d'effectuer un audit complet de conformité d'un projet React selon les standards définis dans les rules.

### Étape 1 : Préparation de l'audit

- Identifier le répertoire du projet à auditer ($ARGUMENTS ou répertoire courant)
- Vérifier que le projet est bien un projet React (présence de package.json avec react)
- Créer un contexte d'audit avec timestamp
- Lire l'ensemble des règles disponibles dans `/home/fmetivier/Documents/Company/TheBeardedCTO/Tools/Claude/Dev/React/rules/`

### Étape 2 : Exécution des audits sectoriels

Tu dois orchestrer l'exécution des 4 audits spécialisés dans l'ordre suivant :

**1. Audit Architecture (25 points)**
- Exécuter la vérification selon les règles de `/check-architecture`
- Analyser la structure du projet, l'organisation des dossiers
- Vérifier le respect de l'Atomic Design
- Évaluer la gestion d'état et la modularité

**2. Audit Qualité du Code (25 points)**
- Exécuter la vérification selon les règles de `/check-code-quality`
- Vérifier la configuration TypeScript (strict mode)
- Analyser la qualité du typage
- Vérifier ESLint, Prettier, conventions de nommage
- Évaluer le respect des principes SOLID, DRY, KISS

**3. Audit Testing (25 points)**
- Exécuter la vérification selon les règles de `/check-testing`
- Vérifier la configuration Vitest/Jest + RTL
- Calculer le coverage actuel (objectif ≥80%)
- Analyser la qualité des tests
- Vérifier les bonnes pratiques React Testing Library

**4. Audit Sécurité (25 points)**
- Exécuter la vérification selon les règles de `/check-security`
- Scanner les vulnérabilités XSS
- Vérifier l'absence de secrets dans le code
- Analyser la sanitization des données
- Auditer les dépendances (npm audit)

### Étape 3 : Synthèse des résultats

Agréger les résultats des 4 audits :
- Collecter les scores individuels
- Identifier les problèmes critiques transversaux
- Prioriser les actions correctives
- Estimer l'effort global de mise en conformité

### Étape 4 : Calcul du score global

**Score sur 100 points :**
- Architecture : XX/25
- Qualité du Code : XX/25
- Testing : XX/25
- Sécurité : XX/25

**Interprétation du score :**
- 90-100 : Excellent - Conformité exemplaire
- 80-89 : Bon - Quelques améliorations mineures
- 70-79 : Acceptable - Améliorations nécessaires
- 60-69 : Insuffisant - Travail important requis
- <60 : Critique - Refonte majeure recommandée

### Étape 5 : Rapport de conformité global

Générer un rapport exécutif structuré :

```
═══════════════════════════════════════════════════
🎯 AUDIT COMPLET DE CONFORMITÉ REACT
═══════════════════════════════════════════════════

📅 Date : {timestamp}
📁 Projet : {nom du projet}
📍 Répertoire : {chemin}

═══════════════════════════════════════════════════
📊 SCORE GLOBAL : XX/100
═══════════════════════════════════════════════════

┌──────────────────────────────────────────────────┐
│                                                  │
│   🏗️  Architecture        : XX/25  [████░░]     │
│   💎 Qualité du Code      : XX/25  [████░░]     │
│   🧪 Testing              : XX/25  [████░░]     │
│   🔒 Sécurité             : XX/25  [████░░]     │
│                                                  │
│   ══════════════════════════════════════════     │
│   📈 SCORE TOTAL          : XX/100 [████░░]     │
│                                                  │
└──────────────────────────────────────────────────┘

🎖️  Niveau de conformité : {EXCELLENT/BON/ACCEPTABLE/INSUFFISANT/CRITIQUE}

═══════════════════════════════════════════════════
🏗️  1. ARCHITECTURE : XX/25
═══════════════════════════════════════════════════

✅ Points forts :
   • Structure feature-based bien organisée
   • Atomic Design respecté dans /components
   • State management centralisé avec Zustand
   • ...

⚠️  Points d'amélioration :
   • Quelques dépendances circulaires détectées
   • Dossier /utils trop générique
   • ...

❌ Problèmes critiques :
   • Logique métier dans les composants UI
   • Pas de séparation claire shared/features
   • ...

📋 Détails dans le rapport : /check-architecture

═══════════════════════════════════════════════════
💎 2. QUALITÉ DU CODE : XX/25
═══════════════════════════════════════════════════

✅ Points forts :
   • TypeScript strict mode activé
   • ESLint configuré avec règles React
   • Conventions de nommage cohérentes
   • ...

⚠️  Points d'amélioration :
   • 12% de types 'any' détectés
   • Quelques composants >300 lignes
   • ...

❌ Problèmes critiques :
   • XX violations ESLint non corrigées
   • Pas de Prettier configuré
   • ...

📋 Détails dans le rapport : /check-code-quality

═══════════════════════════════════════════════════
🧪 3. TESTING : XX/25
═══════════════════════════════════════════════════

📊 Coverage actuel :
   • Statements  : XX% (objectif ≥80%)
   • Branches    : XX% (objectif ≥75%)
   • Functions   : XX% (objectif ≥80%)
   • Lines       : XX% (objectif ≥80%)

✅ Points forts :
   • Vitest + RTL correctement configurés
   • Tests co-localisés avec le code
   • ...

⚠️  Points d'amélioration :
   • Coverage global à XX% (objectif 80%)
   • XX composants critiques non testés
   • ...

❌ Problèmes critiques :
   • XX tests en échec
   • Pas de tests d'intégration
   • ...

📋 Détails dans le rapport : /check-testing

═══════════════════════════════════════════════════
🔒 4. SÉCURITÉ : XX/25
═══════════════════════════════════════════════════

🚨 Alertes de sécurité : XX CRITIQUES, XX HAUTES, XX MOYENNES

✅ Points forts :
   • Pas de secrets détectés dans le code
   • Validation des inputs avec Zod
   • ...

⚠️  Points d'amélioration :
   • XX dépendances avec vulnérabilités moyennes
   • CSP non configuré
   • ...

❌ Problèmes critiques :
   • XX usages de dangerouslySetInnerHTML sans sanitization
   • XX vulnérabilités npm critiques
   • Tokens JWT dans localStorage
   • ...

📋 Détails dans le rapport : /check-security

═══════════════════════════════════════════════════
🎯 TOP 3 ACTIONS PRIORITAIRES GLOBALES
═══════════════════════════════════════════════════

1. [CRITIQUE - Sécurité] Corriger les vulnérabilités XSS
   📍 Fichiers : RichTextDisplay.tsx, UserComments.tsx
   🔧 Action : Implémenter DOMPurify.sanitize()
   ⏱️  Effort : 2-4 heures
   💥 Impact : Sécurité critique
   📚 Référence : rules/11-security.md

2. [HAUTE - Testing] Augmenter le coverage de XX% à 80%
   📍 Composants : UserProfile, Dashboard, AuthForm
   🔧 Action : Ajouter tests unitaires et d'intégration
   ⏱️  Effort : 2-3 jours
   💥 Impact : Qualité et maintenabilité
   📚 Référence : rules/07-testing.md

3. [HAUTE - Architecture] Refactorer la structure des features
   📍 Dossiers : /src/components, /src/utils
   🔧 Action : Migrer vers feature-based structure
   ⏱️  Effort : 1 semaine
   💥 Impact : Maintenabilité long terme
   📚 Référence : rules/02-architecture.md

═══════════════════════════════════════════════════
📈 PLAN D'ACTION DÉTAILLÉ
═══════════════════════════════════════════════════

🔴 SPRINT 1 - Actions Critiques (Semaine 1)
   [ ] Corriger toutes les vulnérabilités XSS
   [ ] Mettre à jour les dépendances vulnérables
   [ ] Supprimer les secrets du code source
   [ ] Corriger les tests en échec
   Effort total : 1 semaine
   Impact : Sécurité et stabilité

🟡 SPRINT 2 - Actions Hautes (Semaines 2-3)
   [ ] Augmenter le coverage à 80%
   [ ] Refactorer les composants >300 lignes
   [ ] Corriger les violations ESLint critiques
   [ ] Configurer Prettier
   Effort total : 2 semaines
   Impact : Qualité du code

🟢 SPRINT 3 - Actions Moyennes (Semaines 4-6)
   [ ] Refactorer vers feature-based architecture
   [ ] Réduire les types 'any' à <5%
   [ ] Implémenter les tests d'intégration
   [ ] Documenter l'architecture
   Effort total : 3 semaines
   Impact : Maintenabilité

⚪ BACKLOG - Améliorations continues
   [ ] Mettre en place Renovate/Dependabot
   [ ] Optimiser les performances
   [ ] Améliorer l'accessibilité (a11y)
   [ ] Documentation complète

═══════════════════════════════════════════════════
📊 MÉTRIQUES DE PROJET
═══════════════════════════════════════════════════

📦 Dépendances :
   • Total : XXX packages
   • Vulnérabilités : XX critiques, XX hautes, XX moyennes
   • Packages obsolètes : XX

📁 Code base :
   • Fichiers TypeScript/TSX : XXX
   • Lignes de code : XXXXX
   • Composants React : XXX
   • Hooks personnalisés : XX

🧪 Tests :
   • Total tests : XXX
   • Tests réussis : XXX
   • Tests en échec : XX
   • Coverage moyen : XX%

⚠️  Dette technique :
   • Violations ESLint : XXX
   • Complexité cyclomatique moyenne : XX
   • Fichiers >300 lignes : XX
   • Duplications de code : XX instances
   • Temps de correction estimé : XX jours

═══════════════════════════════════════════════════
💰 ESTIMATION EFFORT DE MISE EN CONFORMITÉ
═══════════════════════════════════════════════════

🎯 Pour atteindre 80/100 :
   • Actions critiques : 1 semaine
   • Actions hautes : 2 semaines
   • Total : 3 semaines (1 développeur)

🎯 Pour atteindre 90/100 :
   • Actions critiques + hautes : 3 semaines
   • Actions moyennes : 3 semaines
   • Total : 6 semaines (1 développeur)

🎯 Pour atteindre 95+/100 :
   • Toutes les actions + améliorations continues
   • Total : 8-10 semaines (1 développeur)

═══════════════════════════════════════════════════
📚 RÉFÉRENCES ET RESSOURCES
═══════════════════════════════════════════════════

📖 Règles du projet :
   • rules/01-workflow-analysis.md - Workflow de développement
   • rules/02-architecture.md - Architecture React
   • rules/03-coding-standards.md - Standards de code
   • rules/04-solid-principles.md - Principes SOLID
   • rules/05-kiss-dry-yagni.md - Simplicité et DRY
   • rules/06-tooling.md - Outils et configuration
   • rules/07-testing.md - Stratégie de testing
   • rules/08-quality-tools.md - Outils de qualité
   • rules/09-git-workflow.md - Git et CI/CD
   • rules/10-documentation.md - Documentation
   • rules/11-security.md - Sécurité

🔗 Ressources externes :
   • React Best Practices : https://react.dev/learn
   • TypeScript Handbook : https://www.typescriptlang.org/docs/
   • Testing Library : https://testing-library.com/
   • OWASP React Security : https://owasp.org/

═══════════════════════════════════════════════════
✅ PROCHAINES ÉTAPES RECOMMANDÉES
═══════════════════════════════════════════════════

1. 📋 Partager ce rapport avec l'équipe
2. 🎯 Prioriser les actions critiques
3. 📅 Planifier les sprints de correction
4. 🔄 Mettre en place un processus de revue continu
5. 📊 Programmer un audit de suivi dans 1 mois

═══════════════════════════════════════════════════

Rapport généré par Claude Code - Audit de Conformité React
Pour plus de détails sur chaque section, exécuter les commandes :
  • /check-architecture $ARGUMENTS
  • /check-code-quality $ARGUMENTS
  • /check-testing $ARGUMENTS
  • /check-security $ARGUMENTS
```

### Étape 6 : Génération de fichiers annexes

Si demandé, générer :
- Fichier CSV avec la liste détaillée des problèmes
- Rapport JSON pour intégration CI/CD
- Checklist Markdown pour suivi des actions
- Dashboard HTML avec graphiques

### Étape 7 : Recommandations stratégiques

Fournir des conseils stratégiques :
- Processus d'amélioration continue
- Intégration de l'audit dans la CI/CD
- Formation de l'équipe sur les points faibles
- Mise en place de guards automatiques (pre-commit hooks)
- Revue de code orientée conformité

### Notes importantes

- Cet audit doit être objectif et factuel
- Toujours référencer les règles spécifiques violées
- Fournir des exemples concrets de code problématique
- Proposer des solutions actionnables
- Estimer l'effort réaliste de correction
- Prioriser selon l'impact business et technique
