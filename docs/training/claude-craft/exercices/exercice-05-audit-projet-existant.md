# Exercice 5 : Audit d'un Projet Existant

## Objectif

Réaliser un audit complet d'un projet Symfony existant et élaborer un plan de remédiation.

## Durée estimée

25 minutes

---

## Contexte

Vous avez rejoint une équipe avec un projet legacy. Avant de toucher au code, vous devez l'auditer pour comprendre son état et prioriser les améliorations.

---

## Préparation

### Option A : Utiliser votre propre projet

Si vous avez un projet Symfony existant :

```bash
cd /chemin/vers/votre-projet
# Installer Claude-Craft si pas déjà fait
make install-symfony TARGET=. LANG=fr
claude
```

### Option B : Créer un projet de démo avec du code legacy

```bash
mkdir ~/legacy-demo
cd ~/legacy-demo
git init

# Créer une structure avec des "mauvaises pratiques"
mkdir -p src/Controller src/Entity src/Repository src/Service

# Controller avec logique métier (violation SRP)
cat > src/Controller/OrderController.php << 'EOF'
<?php

namespace App\Controller;

use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;

class OrderController
{
    private $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function create(Request $request): JsonResponse
    {
        $data = json_decode($request->getContent(), true);

        // Validation inline (devrait être séparée)
        if (empty($data['customer_id'])) {
            return new JsonResponse(['error' => 'customer_id required'], 400);
        }

        // SQL potentiellement injectable
        $customer = $this->em->getRepository('App:Customer')
            ->createQueryBuilder('c')
            ->where("c.id = '" . $data['customer_id'] . "'")
            ->getQuery()
            ->getOneOrNullResult();

        if (!$customer) {
            return new JsonResponse(['error' => 'Customer not found'], 404);
        }

        // Logique métier dans le controller
        $order = new \App\Entity\Order();
        $order->setCustomer($customer);
        $order->setTotal($data['total'] ?? 0);
        $order->setStatus('pending');

        // Calcul de remise inline
        if ($order->getTotal() > 100) {
            $discount = $order->getTotal() * 0.1;
            $order->setTotal($order->getTotal() - $discount);
        }

        $this->em->persist($order);
        $this->em->flush();

        // Envoi d'email inline (devrait être async)
        mail($customer->getEmail(), 'Order created', 'Your order has been created');

        return new JsonResponse(['id' => $order->getId()]);
    }
}
EOF

# Entity sans encapsulation
cat > src/Entity/Order.php << 'EOF'
<?php

namespace App\Entity;

class Order
{
    public $id;
    public $customer;
    public $total;
    public $status;
    public $createdAt;

    public function getId() { return $this->id; }
    public function setCustomer($c) { $this->customer = $c; }
    public function getTotal() { return $this->total; }
    public function setTotal($t) { $this->total = $t; }
    public function getStatus() { return $this->status; }
    public function setStatus($s) { $this->status = $s; }
}
EOF

# Service avec dépendances concrètes
cat > src/Service/OrderService.php << 'EOF'
<?php

namespace App\Service;

use Doctrine\ORM\EntityManagerInterface;
use App\Entity\Order;

class OrderService
{
    private EntityManagerInterface $em;

    public function __construct(EntityManagerInterface $em)
    {
        $this->em = $em;
    }

    public function findByStatus($status)
    {
        // Query builder avec string non paramétré
        return $this->em->createQuery(
            "SELECT o FROM App\Entity\Order o WHERE o.status = '$status'"
        )->getResult();
    }

    public function calculateTotal(Order $order)
    {
        // Méthode trop longue avec plusieurs responsabilités
        $total = 0;
        foreach ($order->items as $item) {
            $total += $item->price * $item->quantity;
        }

        // Calcul TVA
        $tva = $total * 0.2;
        $total += $tva;

        // Calcul frais de port
        if ($total < 50) {
            $total += 5.99;
        }

        // Calcul remise fidélité
        if ($order->customer->orderCount > 10) {
            $total *= 0.95;
        }

        // Mise à jour
        $order->setTotal($total);
        $this->em->persist($order);
        $this->em->flush();

        return $total;
    }
}
EOF

# Installer Claude-Craft
cd ~/claude-craft
make install-symfony TARGET=~/legacy-demo LANG=fr
cd ~/legacy-demo
```

---

## Étapes

### Étape 1 : Audit complet

```bash
claude

# Lancer l'audit global
/symfony:check-compliance
```

**Notez les scores :**

| Critère | Score |
|---------|-------|
| Architecture | /100 |
| Code quality | /100 |
| Sécurité | /100 |
| Tests | % |

---

### Étape 2 : Focus Architecture

```bash
/symfony:check-architecture
```

**Listez les violations trouvées :**

1. ___
2. ___
3. ___

---

### Étape 3 : Focus Sécurité

```bash
/symfony:check-security
```

**Listez les vulnérabilités :**

| Sévérité | Description | Fichier:ligne |
|----------|-------------|---------------|
| [CRIT] Critique | | |
| [HIGH] Élevé | | |
| [MED] Moyen | | |

---

### Étape 4 : Élaborer le plan de remédiation

Utilisez ce template :

```markdown
# Plan de Remédiation - Legacy Demo

## Scores actuels
- Architecture : X/100
- Qualité : X/100
- Sécurité : X/100
- Tests : X%

## Phase 1 : Quick Wins (cette semaine)

### Sécurité (Priorité 1)
1. [ ] Corriger SQL Injection dans OrderController
   - Fichier: src/Controller/OrderController.php:XX
   - Effort: 1h
   - Impact: Critique

2. [ ] Corriger SQL Injection dans OrderService
   - Fichier: src/Service/OrderService.php:XX
   - Effort: 30min
   - Impact: Critique

### Qualité (Priorité 2)
1. [ ] Extraire validation dans un Validator
   - Effort: 2h
   - Impact: Moyen

## Phase 2 : Moyen terme (ce mois)

### Architecture
1. [ ] Extraire logique métier de OrderController
   - Créer CreateOrderHandler
   - Effort: 4h

2. [ ] Créer OrderRepositoryInterface
   - Implémenter DoctrineOrderRepository
   - Effort: 2h

### Tests
1. [ ] Ajouter tests pour OrderService
   - Couverture cible: 80%
   - Effort: 1 jour

## Phase 3 : Long terme (backlog)

1. [ ] Migration complète vers Clean Architecture
2. [ ] Atteindre 80% de couverture globale
3. [ ] Implémenter CQRS
```

---

### Étape 5 : Corriger un Quick Win

Choisissez l'issue de sécurité la plus critique et corrigez-la :

```bash
"Corrige la vulnérabilité SQL Injection dans OrderController ligne XX"
```

**Avant :**
```php
// Code vulnérable
```

**Après :**
```php
// Code corrigé
```

---

### Étape 6 : Vérifier la correction

```bash
/symfony:check-security
```

**Le score sécurité a-t-il augmenté ?** ___

---

## Livrables

1. **Rapport d'audit** (scores + violations)
2. **Plan de remédiation** (priorisé)
3. **Au moins 1 correction** appliquée
4. **Nouvel audit** montrant l'amélioration

---

## Critères de réussite

- [ ] Audit complet exécuté
- [ ] Violations listées par catégorie
- [ ] Plan de remédiation rédigé
- [ ] Au moins 1 quick win corrigé
- [ ] Amélioration vérifiable

---

## Bonus

1. Corriger toutes les vulnérabilités critiques
2. Ajouter les tests de non-régression pour chaque correction
3. Commencer l'extraction vers Clean Architecture

---

## Points clés appris

1. Toujours auditer avant de modifier du legacy
2. Prioriser : Sécurité > Qualité > Architecture
3. Quick wins d'abord pour des gains rapides
4. Migration progressive, pas de big bang

---

**Prochain exercice :** Audit Qualité et Sécurité
