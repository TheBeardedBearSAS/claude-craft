# Exercice 3 : Workflow Standard

## Objectif

Suivre le workflow Standard complet pour implémenter une feature.

## Durée estimée

30 minutes

---

## Contexte

Vous devez implémenter un système de **remises** pour un e-commerce :
- 10% de remise si le total > 100€
- 20% de remise si le total > 500€
- 5% supplémentaire pour les clients fidèles (> 10 commandes)

---

## Étapes

### Étape 1 : Initialiser le workflow

```bash
cd ~/projet-demo
claude

# Lancer l'analyse
/workflow:init "Système de calcul de remises avec règles :
- 10% si total > 100€
- 20% si total > 500€
- +5% pour clients fidèles (> 10 commandes)"
```

**Attendu :** Claude analyse et recommande le track Standard

**Notez :**
- Complexité estimée : ___
- Track recommandé : ___
- Fichiers estimés : ___

---

### Étape 2 : Phase d'analyse

```bash
/workflow:analyze
```

**Notez :**
- Dépendances identifiées : ___
- Points d'attention : ___

---

### Étape 3 : Génération du plan

```bash
/workflow:plan
```

**Attendu :** Un PRD avec user stories et backlog

**Copiez le backlog généré :**

```markdown
## Backlog
- [ ] ...
- [ ] ...
```

---

### Étape 4 : Design technique

```bash
/workflow:design
```

**Notez l'architecture proposée :**

| Composant | Fichier |
|-----------|---------|
| Entité/VO | |
| Interface | |
| Handler | |
| Service | |

---

### Étape 5 : TDD - Tests d'abord

```bash
@tdd-coach "Écris les tests PHPUnit pour DiscountCalculator avec les règles :
- 10% si total > 100€
- 20% si total > 500€
- +5% pour clients fidèles"
```

**Copiez les tests générés dans un fichier :**

```bash
# Créer le fichier de test
nano tests/Unit/DiscountCalculatorTest.php
# Coller les tests
```

---

### Étape 6 : Implémentation

```bash
"Implémente DiscountCalculator pour faire passer tous les tests"
```

**Créez le fichier :**

```bash
nano src/Service/DiscountCalculator.php
# Coller l'implémentation
```

---

### Étape 7 : Refactoring (optionnel)

```bash
"Refactore DiscountCalculator en utilisant le pattern Strategy
pour chaque règle de remise"
```

---

### Étape 8 : Vérification

```bash
# Vérifier la qualité
/symfony:check-code-quality

# (Ou manuellement si pas de Symfony installé)
"Vérifie que ce code respecte SOLID et les standards"
```

---

### Étape 9 : Quality Gate

```bash
# Valider l'implémentation via la quality gate BMAD
/gate:validate-story

# Claude vérifie :
# ✓ Tests passent
# ✓ Code quality OK
# ✓ Architecture respectée
# ✓ Definition of Done complète
```

**Attendu :** Score de validation 100% (ou liste des points restants)

---

### Étape 10 : Status Transition

```bash
# Transitionner la story vers "done"
/sprint:transition --story=US-001 --status=done

# Vérifier l'état du sprint
/workflow:status
```

**Attendu :** La story passe au statut "done" dans le backlog

---

## Livrables

À la fin de l'exercice, vous devez avoir :

1. **Analyse documentée** (notes des étapes 1-4)
2. **Tests** : `tests/Unit/DiscountCalculatorTest.php`
3. **Implémentation** : `src/Service/DiscountCalculator.php`
4. **Validation** : Rapport de qualité
5. **Quality Gate** : Validation DoD passée
6. **Transition** : Story en statut "done"

---

## Critères de réussite

- [ ] Track Standard identifié par Claude
- [ ] PRD avec user stories généré
- [ ] Tests écrits AVANT l'implémentation
- [ ] Code implémenté
- [ ] Vérification qualité effectuée
- [ ] Quality Gate validée
- [ ] Story transitionnée vers "done"

---

## Bonus

1. Ajouter une règle de remise "première commande = -15%"
2. Implémenter le pattern Strategy pour les règles
3. Ajouter des tests pour les cas limites (total = 100€ exactement)
4. Utiliser `/workflow:status` pour voir l'état du projet

---

## Solution de référence

### Tests attendus

```php
class DiscountCalculatorTest extends TestCase
{
    private DiscountCalculator $calculator;

    protected function setUp(): void
    {
        $this->calculator = new DiscountCalculator();
    }

    public function testNoDiscountUnder100(): void
    {
        $discount = $this->calculator->calculate(50.0, orderCount: 1);
        $this->assertEquals(0.0, $discount);
    }

    public function testTenPercentOver100(): void
    {
        $discount = $this->calculator->calculate(150.0, orderCount: 1);
        $this->assertEquals(0.10, $discount);
    }

    public function testTwentyPercentOver500(): void
    {
        $discount = $this->calculator->calculate(600.0, orderCount: 1);
        $this->assertEquals(0.20, $discount);
    }

    public function testLoyaltyBonus(): void
    {
        $discount = $this->calculator->calculate(50.0, orderCount: 15);
        $this->assertEquals(0.05, $discount);
    }

    public function testCombinedDiscounts(): void
    {
        $discount = $this->calculator->calculate(600.0, orderCount: 15);
        $this->assertEquals(0.25, $discount); // 20% + 5%
    }
}
```

### Implémentation attendue

```php
class DiscountCalculator
{
    public function calculate(float $total, int $orderCount): float
    {
        $discount = 0.0;

        // Remise basée sur le montant
        if ($total > 500) {
            $discount = 0.20;
        } elseif ($total > 100) {
            $discount = 0.10;
        }

        // Bonus fidélité
        if ($orderCount > 10) {
            $discount += 0.05;
        }

        return $discount;
    }
}
```

---

## Points clés appris

1. Le workflow Standard structure le développement
2. L'analyse prépare une meilleure implémentation
3. TDD = Tests d'abord, toujours
4. La vérification qualité valide le travail
5. Les Quality Gates BMAD formalisent la Definition of Done
6. Les transitions de statut assurent la traçabilité du sprint

---

**Prochain exercice :** Nouveau projet Symfony from scratch
