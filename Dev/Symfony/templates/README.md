# Templates Claude Code - Atoll Tourisme

> Templates prêts à l'emploi pour le développement avec Claude Code

## Vue d'ensemble

Ce dossier contient 8 templates réutilisables pour accélérer le développement et garantir la qualité du code.

**Total:** 8 templates | ~6500 lignes de documentation et exemples

---

## 📋 Liste des templates

### 1. `analysis.md` - Analyse pré-implémentation
**Utilisation:** AVANT toute implémentation (obligatoire)

**Contenu:**
- Objectif métier et critères d'acceptation
- Fichiers impactés (nouveaux + modifiés)
- Impacts (breaking changes, BDD, performance, RGPD)
- Risques et mitigations
- Approche TDD (tests à écrire AVANT)

**Exemple:**
```bash
# Créer une analyse
vim docs/analysis/2025-01-15-supplement-single.md
# Utiliser le template .claude/templates/analysis.md
```

**Quand l'utiliser:**
- ✅ Avant toute nouvelle feature
- ✅ Avant refactoring majeur
- ✅ Avant migration BDD

---

### 2. `value-object.md` - Value Object (DDD)
**Utilisation:** Créer des objets immuables représentant des valeurs métier

**Caractéristiques:**
- `final readonly class`
- Validation dans le constructeur
- Factory methods (`fromString`, `fromEuros`, etc.)
- Méthode `equals()` pour comparaison par valeur
- Pas de setters (immuable)

**Exemples concrets Atoll:**
- `Money` - Montant en euros (évite erreurs float)
- `Email` - Email validé
- `DateRange` - Période avec validation

**Quand l'utiliser:**
- ✅ Montants monétaires
- ✅ Emails, téléphones
- ✅ Dates, périodes
- ✅ Taux, pourcentages

---

### 3. `service.md` - Service (Application/Domain)
**Utilisation:** Créer des services contenant la logique métier

**Types:**
- **Domain Service:** Logique métier pure (calculs, règles)
- **Application Service:** Orchestration de use cases

**Principes:**
- Constructor injection uniquement
- Une seule responsabilité (SRP)
- `final readonly class`
- Pas de logique dans le constructeur

**Exemples concrets Atoll:**
- `ReservationService` - Orchestration création réservations
- `PrixCalculatorService` - Calcul prix total

**Quand l'utiliser:**
- ✅ Logique métier complexe
- ✅ Orchestration de plusieurs entités
- ✅ Use cases applicatifs

---

### 4. `aggregate-root.md` - Aggregate Root (DDD)
**Utilisation:** Créer des racines d'agrégat garantissant la cohérence métier

**Caractéristiques:**
- Point d'entrée unique pour modifier l'agrégat
- Gardien des invariants métier
- Émetteur d'événements de domaine
- Relations `OneToMany` avec `cascade`, `orphanRemoval`

**Exemple concret Atoll:**
- `Reservation` (root) avec `Participant` (enfants)

**Quand l'utiliser:**
- ✅ Entités avec enfants à protéger
- ✅ Règles métier à garantir (invariants)
- ✅ Événements de domaine à émettre

---

### 5. `domain-event.md` - Domain Event (DDD)
**Utilisation:** Créer des événements représentant des faits métier

**Caractéristiques:**
- `final readonly class`
- Nommé au passé (`ReservationCreated`, pas `CreateReservation`)
- Horodaté (`occurredOn`)
- Référence l'aggregate ID

**Exemples concrets Atoll:**
- `ReservationCreated` - Nouvelle réservation
- `ReservationConfirmed` - Paiement confirmé
- `ParticipantAdded` - Participant ajouté

**Quand l'utiliser:**
- ✅ Communication entre aggregates
- ✅ Audit log / traçabilité
- ✅ Envoi d'emails asynchrones
- ✅ Événements métier importants

---

### 6. `test-unit.md` - Test unitaire (PHPUnit)
**Utilisation:** Tester la logique métier en isolation

**Pattern AAA:**
- **Arrange:** Préparer les données
- **Act:** Exécuter l'action
- **Assert:** Vérifier le résultat

**Caractéristiques:**
- Mocks pour toutes les dépendances
- Rapide (< 100ms pour tous les tests)
- Data providers pour tests paramétrés

**Exemples concrets:**
- Tests Value Objects (Money, Email, DateRange)
- Tests Services (avec mocks)

**Quand l'utiliser:**
- ✅ TDD phase RED (test qui échoue)
- ✅ Tester la logique métier isolée
- ✅ Coverage > 80%

---

### 7. `test-integration.md` - Test d'intégration (PHPUnit)
**Utilisation:** Tester l'interaction entre composants (Controller + Service + BDD)

**Caractéristiques:**
- Symfony `WebTestCase` ou `KernelTestCase`
- Vraie base de données (avec transactions)
- Fixtures de données
- Tests emails envoyés

**Exemples concrets:**
- Test formulaire réservation (end-to-end)
- Test repository Doctrine
- Test service avec vraie BDD

**Quand l'utiliser:**
- ✅ Tester workflow complet
- ✅ Valider persistance BDD
- ✅ Tester emails/events

---

### 8. `test-behat.md` - Test BDD (Behat)
**Utilisation:** Tests fonctionnels en langage naturel (Gherkin)

**Structure:**
- **Feature file:** Scénarios en français (Given/When/Then)
- **Context class:** Implémentation PHP des steps

**Caractéristiques:**
- Lisible par le métier (PO, clients)
- Spécifications exécutables
- Living documentation

**Exemple concret:**
```gherkin
Scénario: Réservation avec supplément single
  Étant donné un séjour à "1000.00" €
  Quand je réserve avec "1" participant
  Alors le montant total est de "1300.00 €"
```

**Quand l'utiliser:**
- ✅ Spécifications métier
- ✅ Tests d'acceptation
- ✅ Documentation vivante

---

## 🎯 Guide d'utilisation rapide

### Nouvelle feature
```bash
# 1. Analyse (OBLIGATOIRE)
vim docs/analysis/2025-01-15-feature-name.md
# Utiliser template: .claude/templates/analysis.md

# 2. Tests TDD (RED)
vim tests/Unit/Service/MyServiceTest.php
# Utiliser template: .claude/templates/test-unit.md

# 3. Implémentation (GREEN)
vim src/Service/MyService.php
# Utiliser template: .claude/templates/service.md

# 4. Refactor si nécessaire
# Utiliser checklist: .claude/checklists/refactoring.md
```

### Créer un Value Object
```bash
vim src/Domain/ValueObject/Money.php
# Copier/adapter template: .claude/templates/value-object.md
```

### Créer un Aggregate Root
```bash
vim src/Domain/Entity/Reservation.php
# Copier/adapter template: .claude/templates/aggregate-root.md
```

---

## 📚 Références

**Architecture:**
- `.claude/rules/01-architecture-ddd.md` - Architecture DDD
- `.claude/rules/03-coding-standards.md` - Standards de code

**Tests:**
- `.claude/rules/04-testing-tdd.md` - Stratégie TDD

**Sécurité:**
- `.claude/rules/07-security-rgpd.md` - Sécurité et RGPD

---

## ✅ Checklists associées

Voir `.claude/checklists/`:
- `pre-commit.md` - Avant chaque commit
- `new-feature.md` - Pour nouvelle fonctionnalité
- `refactoring.md` - Pour refactoring sécurisé
- `security-rgpd.md` - Audit sécurité/RGPD

---

## 💡 Conseils

### Copy-paste autorisé
Les templates sont faits pour être **copiés et adaptés**. Ne pas réinventer la roue.

### Exemples Atoll Tourisme
Tous les templates contiennent des **exemples concrets** du domaine Atoll Tourisme:
- Réservations
- Séjours
- Participants
- Prix et suppléments

### Documentation en français
- **Code:** Anglais (méthodes, variables, classes)
- **Commentaires/docs:** Français (PHPDoc, README)
- **Tests Behat:** Français (Gherkin)

### TDD obligatoire
Les templates de tests sont conçus pour le **TDD** (Test-Driven Development):
1. 🔴 RED: Écrire le test qui échoue
2. 🟢 GREEN: Implémenter le minimum
3. 🔵 REFACTOR: Améliorer le code

---

## 📊 Statistiques

| Template | Lignes | Exemples | Cas d'usage |
|----------|--------|----------|-------------|
| analysis.md | 323 | 3 | Analyse pré-implémentation |
| value-object.md | 534 | 3 | Money, Email, DateRange |
| service.md | 527 | 2 | ReservationService, PrixCalculator |
| aggregate-root.md | 860 | 2 | Reservation + Participant |
| domain-event.md | 681 | 4 | ReservationCreated, Confirmed, etc. |
| test-unit.md | 735 | 2 | Tests Money, ReservationService |
| test-integration.md | 698 | 3 | Controller, Repository, Service |
| test-behat.md | 674 | 1 | Réservation complète |

**Total:** ~6500 lignes de documentation prête à l'emploi

---

**Dernière mise à jour:** 2025-11-26
