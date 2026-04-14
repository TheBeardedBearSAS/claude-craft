# Guide de Correction de Bugs

Ce guide couvre l'approche systématique pour corriger les bugs avec Claude-Craft, du diagnostic à la validation.

---

## Table des Matières

1. [Workflow de Correction de Bugs](#workflow-de-correction-de-bugs)
2. [Phase 1 : Reproduire](#phase-1--reproduire)
3. [Phase 2 : Diagnostiquer](#phase-2--diagnostiquer)
4. [Phase 3 : Écrire le Test de Régression](#phase-3--écrire-le-test-de-régression)
5. [Phase 4 : Corriger](#phase-4--corriger)
6. [Phase 5 : Valider](#phase-5--valider)
7. [Phase 6 : Documenter](#phase-6--documenter)
8. [Procédures Hotfix](#procédures-hotfix)
9. [Exemple Complet](#exemple-complet)

---

## Workflow de Correction de Bugs

L'approche systématique pour corriger les bugs :

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 1. Reproduire│ --> │2. Diagnostiquer│ --> │  3. Test    │
└─────────────┘     └─────────────┘     └─────────────┘
                                              │
                                              v
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ 6. Documenter│ <-- │  5. Valider │ <-- │ 4. Corriger │
└─────────────┘     └─────────────┘     └─────────────┘
```

### Pourquoi Cette Approche ?

1. **Reproduire d'abord** : On ne peut pas corriger ce qu'on ne voit pas
2. **Tester avant de corriger** : Prouve que le bug existe et est corrigé
3. **Valider en profondeur** : Assure qu'il n'y a pas de régression
4. **Documenter** : Aide à prévenir des bugs similaires

---

## Phase 1 : Reproduire

Avant de corriger, reproduisez le bug de manière consistante.

### Collecter les Informations

Collecter depuis le rapport de bug :
- Étapes pour reproduire
- Comportement attendu
- Comportement réel
- Environnement (version, OS, etc.)
- Messages d'erreur/logs
- Captures d'écran si applicable

### Créer l'Environnement de Reproduction

```bash
# Checkout de la version problématique
git checkout <commit-ou-tag>

# Configurer l'environnement identique
make docker-up

# Reproduire avec les étapes exactes
```

### Vérifier la Reproduction

Pouvez-vous déclencher le bug de manière consistante ?

- [ ] Le bug survient avec les étapes rapportées
- [ ] Le bug survient dans le même environnement
- [ ] Le bug est déterministe (pas aléatoire)

### Si Vous Ne Pouvez Pas Reproduire

```markdown
@research-assistant Aide-moi à comprendre pourquoi ce bug pourrait être spécifique à l'environnement

Rapport de bug :
- L'utilisateur voit l'erreur X en faisant Y
- Je ne peux pas reproduire localement
- L'utilisateur est sur l'environnement Z

Causes possibles ?
```

---

## Phase 2 : Diagnostiquer

Trouvez la cause racine du bug.

### Utiliser la Commande d'Analyse

```bash
/common:analyze-bug "Les utilisateurs ne peuvent pas se connecter avec les bons identifiants après réinitialisation du mot de passe"
```

Cette commande va :
1. Suggérer des zones à investiguer
2. Identifier les causes potentielles
3. Recommander des étapes de débogage
4. Lister les zones de code liées

### Utiliser le Coach TDD pour le Diagnostic

```markdown
@tdd-coach Aide-moi à diagnostiquer ce bug d'authentification

Symptômes :
- L'utilisateur réinitialise son mot de passe avec succès
- Le nouveau mot de passe est sauvegardé (confirmé en BDD)
- La connexion échoue avec "identifiants invalides"
- L'ancien mot de passe ne fonctionne pas non plus

Que dois-je investiguer ?
```

### Techniques de Débogage

#### Ajouter du Logging

```php
// Logging de debug temporaire
$this->logger->debug('Vérification mot de passe', [
    'user_id' => $user->getId(),
    'stored_hash' => substr($user->getPasswordHash(), 0, 20) . '...',
    'verification_result' => $result,
]);
```

#### Inspecter l'État de la Base de Données

```sql
-- Vérifier l'état utilisateur après réinitialisation
SELECT id, email, password_hash, updated_at
FROM users
WHERE email = 'user@example.com';
```

#### Tracer le Chemin d'Exécution

```php
// Ajouter une stack trace aux points suspects
debug_print_backtrace(DEBUG_BACKTRACE_IGNORE_ARGS);
```

### Identifier la Cause Racine

Catégories courantes :
- **Erreur de logique** : Mauvaise condition ou calcul
- **Erreur d'état** : État de données incorrect
- **Condition de concurrence** : Comportement dépendant du timing
- **Erreur d'intégration** : Problème de service externe
- **Erreur de configuration** : Mauvais paramètres

### Checklist de Diagnostic

- [ ] Bug reproduit de manière consistante
- [ ] Emplacement de l'erreur identifié
- [ ] Cause racine comprise
- [ ] Zones de code liées identifiées
- [ ] Approche de correction déterminée

---

## Phase 3 : Écrire le Test de Régression

Écrivez un test qui échoue AVANT la correction et passe APRÈS.

### Pourquoi Tester d'Abord ?

1. **Prouve que le bug existe** : Le test échoue avec le code actuel
2. **Prouve que la correction fonctionne** : Le test passe après la correction
3. **Prévient la régression** : Le test détecte les futurs problèmes
4. **Documente le comportement** : Le test décrit le comportement attendu

### Utiliser le Coach TDD

```markdown
@tdd-coach Aide-moi à écrire un test de régression pour ce bug

Bug : La réinitialisation de mot de passe ne met pas à jour le hash correctement

Comportement attendu :
- L'utilisateur demande une réinitialisation
- L'utilisateur définit un nouveau mot de passe
- L'utilisateur peut se connecter avec le nouveau mot de passe

Comportement réel :
- La connexion échoue après réinitialisation
```

### Exemple de Test de Régression

```php
/**
 * @test
 * @see https://github.com/company/project/issues/123
 *
 * Bug : Les utilisateurs ne pouvaient pas se connecter après réinitialisation
 * Cause : Le hash de mot de passe n'était pas persisté correctement
 */
public function test_user_can_login_after_password_reset(): void
{
    // Arrange : Créer un utilisateur avec un mot de passe connu
    $user = $this->createUser('user@example.com', 'ancien-mot-de-passe');

    // Act : Réinitialiser le mot de passe
    $this->passwordResetService->resetPassword($user, 'nouveau-mot-de-passe');

    // Assert : Peut se connecter avec le nouveau mot de passe
    $result = $this->authService->authenticate('user@example.com', 'nouveau-mot-de-passe');

    $this->assertTrue($result->isSuccess());
    $this->assertNotNull($result->getToken());
}

/**
 * @test
 * Lié : S'assurer que l'ancien mot de passe ne fonctionne plus
 */
public function test_old_password_fails_after_reset(): void
{
    $user = $this->createUser('user@example.com', 'ancien-mot-de-passe');

    $this->passwordResetService->resetPassword($user, 'nouveau-mot-de-passe');

    $result = $this->authService->authenticate('user@example.com', 'ancien-mot-de-passe');

    $this->assertFalse($result->isSuccess());
}
```

### Checklist d'Écriture de Test

- [ ] Le test reproduit le bug (échoue avant la correction)
- [ ] Le test a un nom descriptif
- [ ] Le test référence le numéro d'issue
- [ ] Le test documente la cause racine en commentaire
- [ ] Les cas limites liés sont testés

---

## Phase 4 : Corriger

Implémentez la correction minimale pour le bug.

### Directives de Correction

1. **Changement minimal** : Ne corrigez que le bug, ne refactorisez pas
2. **Intention claire** : Le code doit montrer ce qui était incorrect
3. **Pas d'effets de bord** : Ne changez pas de comportement non lié
4. **Maintenez le style** : Suivez les patterns du code existant

### Exemple de Correction

```php
// AVANT (bugué)
public function resetPassword(User $user, string $newPassword): void
{
    $hash = $this->hasher->hash($newPassword);
    $user->setPasswordHash($hash);
    // Bug : persist/flush manquants !
}

// APRÈS (corrigé)
public function resetPassword(User $user, string $newPassword): void
{
    $hash = $this->hasher->hash($newPassword);
    $user->setPasswordHash($hash);
    $this->entityManager->persist($user);  // <-- Correction
    $this->entityManager->flush();          // <-- Correction
}
```

### Exécuter le Test de Régression

```bash
# Le test devrait maintenant passer
make test-unit TEST=tests/Unit/PasswordResetTest.php

# Ou exécuter un test spécifique
./vendor/bin/phpunit --filter test_user_can_login_after_password_reset
```

### Checklist de Correction

- [ ] Le test de régression passe maintenant
- [ ] La correction est minimale et ciblée
- [ ] Pas de changements non liés inclus
- [ ] Style de code maintenu

---

## Phase 5 : Valider

Assurez-vous que la correction ne casse rien d'autre.

### Exécuter la Suite de Tests Complète

```bash
# Tous les tests unitaires
make test-unit

# Tous les tests d'intégration
make test-integration

# Suite complète de tests
make test
```

### Vérifications Qualité

```bash
# Qualité du code (par technologie, parmi les 204+ commandes disponibles)
/symfony:check-code-quality
/flutter:check-code-quality
/python:check-code-quality
/react:check-code-quality
/angular:check-code-quality
/vuejs:check-code-quality
/csharp:check-code-quality
/laravel:check-code-quality
/reactnative:check-code-quality
/php:check-code-quality

# Sécurité (si la correction touche du code sensible)
/common:security-audit

# Conformité complète
/{tech}:check-compliance
```

### Tests Manuels

Même avec des tests automatisés, vérifiez manuellement :

1. Suivez les étapes de reproduction originales
2. Vérifiez que le bug ne survient plus
3. Testez les fonctionnalités liées
4. Vérifiez les cas limites

### Utiliser l'Agent Reviewer

```markdown
@symfony-reviewer Revois ma correction pour l'issue #123

Bug : Les utilisateurs ne pouvaient pas se connecter après réinitialisation
Correction : Ajout des appels persist/flush manquants dans resetPassword()

Fichiers modifiés :
- src/Application/Service/PasswordResetService.php
- tests/Unit/PasswordResetTest.php

Vérifie s'il te plaît :
1. La correction est correcte et complète
2. Pas d'effets de bord
3. Couverture de test adéquate
```

### Checklist de Validation

- [ ] Le test de régression passe
- [ ] Tous les tests existants passent
- [ ] L'analyse statique passe
- [ ] Les tests manuels confirment la correction
- [ ] Revue de code effectuée

---

## Phase 6 : Documenter

Documentez la correction pour référence future.

### Format du Message de Commit

```
fix(auth): résoudre l'échec de connexion après réinitialisation mot de passe

Bug : Les utilisateurs ne pouvaient pas se connecter après réinitialisation
Cause racine : Le changement de hash n'était pas persisté en base de données
Correction : Ajout des appels persist() et flush() dans PasswordResetService

Closes #123

Test : test_user_can_login_after_password_reset
```

### Mettre à Jour le Tracker d'Issues

```markdown
## Résolution

**Cause Racine :**
La méthode `resetPassword()` dans `PasswordResetService` mettait à jour le
hash de mot de passe en mémoire mais ne persistait pas le changement en base.

**Correction :**
Ajout des appels `persist()` et `flush()` après la définition du nouveau hash.

**Tests :**
- Ajout du test de régression `test_user_can_login_after_password_reset`
- Ajout du test de cas limite `test_old_password_fails_after_reset`

**Prévention :**
Considérer l'ajout d'un point de checklist de revue de code pour les opérations de persistance.
```

### Entrée Base de Connaissances (si pattern récurrent)

```markdown
# Bug Courant : Changements d'Entité Non Persistés

## Symptômes
- Les changements de données semblent fonctionner (pas d'erreur)
- Les changements n'apparaissent pas en base de données
- Les changements sont perdus après rafraîchissement

## Cause Racine
Appels `persist()` et/ou `flush()` manquants dans Doctrine.

## Pattern de Correction
```php
$entity->setSomething($value);
$this->entityManager->persist($entity); // Ne pas oublier !
$this->entityManager->flush();
```

## Prévention
- Ajouter la vérification de persistance à la checklist de revue de code
- Considérer l'auto-flush dans une classe de base de service
```

### Checklist de Documentation

- [ ] Message de commit décrit le bug et la correction
- [ ] Tracker d'issues mis à jour avec la résolution
- [ ] Documentation liée mise à jour
- [ ] Entrée base de connaissances si pattern

---

## Procédures Hotfix

Pour les bugs critiques en production.

### Workflow Hotfix

```
1. Créer une branche hotfix depuis production
2. Appliquer la correction minimale
3. Tester en profondeur
4. Déployer en production
5. Merger vers main
```

### Étape par Étape

```bash
# 1. Créer la branche hotfix
git checkout production
git checkout -b hotfix/issue-123-echec-connexion

# 2. Appliquer la correction
# ... faire les changements ...

# 3. Écrire le test de régression
# ... ajouter le test ...

# 4. Vérifier
make test
/symfony:check-compliance

# 5. Commiter avec un message clair
git commit -m "fix(auth): résoudre l'échec critique de connexion après réinitialisation

HOTFIX pour problème de production.
Cause racine : Hash de mot de passe non persisté après réinitialisation.

Closes #123"

# 6. Créer la PR pour revue
gh pr create --base production --title "HOTFIX: Échec de connexion après réinitialisation"

# 7. Après merge, déployer
# ... processus de déploiement ...

# 8. Merger vers main
git checkout main
git merge hotfix/issue-123-echec-connexion
git push origin main
```

### Checklist Hotfix

- [ ] Branche hotfix depuis production
- [ ] Correction minimale et ciblée uniquement
- [ ] Test de régression ajouté
- [ ] Tous les tests passent
- [ ] PR revue et approuvée
- [ ] Déployé en production
- [ ] Vérifié en production
- [ ] Mergé vers main

---

## Exemple Complet

Parcourons la correction d'un bug réel.

### Rapport de Bug

```
Issue #456 : Total de commande calculé incorrectement

Étapes pour reproduire :
1. Ajouter un article à 10,00€, quantité 3
2. Ajouter un article à 5,50€, quantité 2
3. Voir le panier

Attendu : Total = 41,00€ (30 + 11)
Réel : Total = 36,00€

Environnement : Production v2.3.1
Rapporté par : Support client
Priorité : Haute
```

### Étape 1 : Reproduire

```php
// Test local rapide
$order = new Order();
$order->addItem(new Item('A', 10.00), 3);  // 30€
$order->addItem(new Item('B', 5.50), 2);   // 11€
echo $order->getTotal(); // Affiche 36.00 - confirmé !
```

### Étape 2 : Diagnostiquer

```markdown
@tdd-coach Aide-moi à trouver le bug dans le calcul du total

Le total devrait être 41,00 mais affiche 36,00
La différence est 5,00, exactement le prix d'un article B

Hypothèse : la quantité du second article n'est pas comptée ?
```

L'investigation révèle :

```php
// Bug trouvé dans Order::calculateTotal()
public function calculateTotal(): Money
{
    $total = Money::zero();
    foreach ($this->items as $item) {
        // BUG : Utilise 1 au lieu de la quantité de l'article !
        $total = $total->add($item->getPrice()->multiply(1));
    }
    return $total;
}
```

### Étape 3 : Écrire le Test de Régression

```php
/**
 * @test
 * @see https://github.com/company/shop/issues/456
 *
 * Bug : Le total ignorait les quantités
 */
public function test_order_total_includes_all_quantities(): void
{
    $order = new Order();
    $order->addItem($this->createItem(10.00), 3);  // 30€
    $order->addItem($this->createItem(5.50), 2);   // 11€

    $total = $order->calculateTotal();

    $this->assertEquals(41.00, $total->getAmount());
}

/**
 * @test
 * Cas limite : article unique avec quantité > 1
 */
public function test_single_item_quantity_multiplied(): void
{
    $order = new Order();
    $order->addItem($this->createItem(10.00), 5);

    $this->assertEquals(50.00, $order->calculateTotal()->getAmount());
}
```

Exécuter le test - confirme qu'il échoue.

### Étape 4 : Corriger

```php
public function calculateTotal(): Money
{
    $total = Money::zero();
    foreach ($this->items as $item) {
        // Corrigé : Utilise la quantité réelle de l'article
        $total = $total->add(
            $item->getPrice()->multiply($item->getQuantity())
        );
    }
    return $total;
}
```

### Étape 5 : Valider

```bash
# Le test de régression passe
./vendor/bin/phpunit --filter test_order_total

# Tous les tests passent
make test

# Vérification qualité
/symfony:check-compliance
# Score : 94/100 ✓
```

### Étape 6 : Documenter

```bash
git commit -m "fix(order): corriger le calcul du total pour inclure les quantités

Bug : Le total ignorait les quantités, utilisant toujours 1
Cause racine : multiply(1) codé en dur au lieu de multiply(quantity)
Correction : Utiliser getQuantity() de l'article dans le calcul

Closes #456

Tests de régression ajoutés :
- test_order_total_includes_all_quantities
- test_single_item_quantity_multiplied"
```

---

## Conseils de Prévention des Bugs

1. **Écrivez les tests d'abord** : Le TDD prévient beaucoup de bugs
2. **Revue de code** : Des yeux frais détectent les problèmes
3. **Analyse statique** : Les outils trouvent les erreurs courantes
4. **Tests d'intégration** : Détectent les bugs d'interaction
5. **Monitoring production** : Détectez les problèmes tôt

---

[&larr; Développement de Fonctionnalités](03-feature-development.md) | [Référence des Outils &rarr;](05-tools-reference.md)
