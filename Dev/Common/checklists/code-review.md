# Checklist Code Review

## Avant de Commencer la Review

- [ ] J'ai lu la description de la PR
- [ ] J'ai compris l'objectif des changements
- [ ] J'ai vérifié les tickets liés
- [ ] J'ai le contexte nécessaire pour reviewer

---

## Checklist de Review

### 1. Conception & Architecture

- [ ] Les changements sont cohérents avec l'architecture existante
- [ ] Les responsabilités sont bien séparées (SRP)
- [ ] Pas de couplage fort introduit
- [ ] Les abstractions sont au bon niveau
- [ ] Les patterns utilisés sont appropriés
- [ ] Pas de sur-ingénierie

### 2. Qualité du Code

#### Lisibilité
- [ ] Le code est facile à lire et comprendre
- [ ] Les noms de variables/fonctions sont explicites
- [ ] Les fonctions font une seule chose
- [ ] Les fonctions ont une longueur raisonnable (< 50 lignes)
- [ ] Le code est auto-documenté

#### Maintenabilité
- [ ] Le code est facilement modifiable
- [ ] Pas de code dupliqué
- [ ] Les magic numbers sont évités (constantes nommées)
- [ ] Les dépendances sont gérées correctement

#### Standards
- [ ] Les conventions de nommage sont respectées
- [ ] Le formatage est correct (linter)
- [ ] Les imports sont organisés
- [ ] Pas de code commenté inutile
- [ ] Pas de TODO sans ticket associé

### 3. Logique & Fonctionnalité

- [ ] La logique métier est correcte
- [ ] Les edge cases sont gérés
- [ ] Les conditions aux limites sont vérifiées
- [ ] Pas de bugs évidents
- [ ] Le comportement attendu est implémenté

### 4. Gestion des Erreurs

- [ ] Les erreurs sont gérées de manière appropriée
- [ ] Les messages d'erreur sont clairs et utiles
- [ ] Les exceptions sont utilisées correctement
- [ ] Les cas d'échec sont couverts
- [ ] Logging approprié en cas d'erreur

### 5. Sécurité

- [ ] Pas d'injection SQL possible
- [ ] Pas de XSS possible
- [ ] Pas de secrets dans le code
- [ ] Validation des inputs utilisateur
- [ ] Autorisation vérifiée si nécessaire
- [ ] Données sensibles protégées

### 6. Performance

- [ ] Pas de requêtes N+1
- [ ] Pas d'opérations coûteuses dans les boucles
- [ ] Index utilisés correctement
- [ ] Mise en cache appropriée
- [ ] Pas de memory leaks
- [ ] Complexité algorithmique acceptable

### 7. Tests

- [ ] Tests unitaires présents et pertinents
- [ ] Tests couvrent les cas nominaux
- [ ] Tests couvrent les cas d'erreur
- [ ] Tests sont lisibles
- [ ] Tests sont indépendants
- [ ] Pas de tests flaky

### 8. Documentation

- [ ] Code auto-documenté ou commenté si complexe
- [ ] API documentée si publique
- [ ] README mis à jour si nécessaire
- [ ] Changements de config documentés

---

## Types de Commentaires

### Bloquant (❌)
Doit être corrigé avant merge.
```
❌ Cette requête peut causer une injection SQL
```

### Important (⚠️)
Devrait être corrigé, sauf justification.
```
⚠️ Cette fonction pourrait bénéficier d'une extraction
```

### Suggestion (💡)
Amélioration possible, non obligatoire.
```
💡 On pourrait simplifier cette condition
```

### Question (❓)
Demande de clarification.
```
❓ Pourquoi ce choix d'implémentation ?
```

### Positif (✅)
Retour positif sur le code.
```
✅ Bonne utilisation du pattern ici !
```

---

## Bonnes Pratiques Reviewer

1. **Être constructif** - Critiquer le code, pas la personne
2. **Être précis** - Donner des exemples ou suggestions
3. **Être respectueux** - Utiliser un ton bienveillant
4. **Être réactif** - Répondre rapidement aux discussions
5. **Être cohérent** - Appliquer les mêmes standards à tous

## Bonnes Pratiques Auteur

1. **Fournir le contexte** - Description claire de la PR
2. **Petites PRs** - Plus faciles à reviewer
3. **Self-review** - Relire avant de demander une review
4. **Répondre aux commentaires** - Ne pas ignorer
5. **Apprendre** - Utiliser les feedbacks pour progresser

---

## Décision de Review

- [ ] **Approved** - Prêt à merger
- [ ] **Request changes** - Changements nécessaires
- [ ] **Comment** - Questions ou suggestions sans blocage
