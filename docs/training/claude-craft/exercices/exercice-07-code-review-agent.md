# Exercice 7 : Code Review avec Agent

## Objectif

Réaliser une code review complète en utilisant les agents spécialisés de Claude-Craft.

## Durée estimée

20 minutes

---

## Contexte

Un collègue vous soumet une Pull Request avec un nouveau service de paiement. Vous devez faire la code review en utilisant les agents Claude-Craft.

---

## Le code à reviewer

### PaymentService.php

```php
<?php

namespace App\Service;

use App\Entity\Order;
use App\Entity\Payment;
use Doctrine\ORM\EntityManagerInterface;
use Stripe\Stripe;
use Stripe\Charge;

class PaymentService
{
    private $em;
    private $stripeKey;

    public function __construct(EntityManagerInterface $em, string $stripeKey)
    {
        $this->em = $em;
        $this->stripeKey = $stripeKey;
    }

    public function processPayment(Order $order, string $token): Payment
    {
        Stripe::setApiKey($this->stripeKey);

        try {
            $charge = Charge::create([
                'amount' => $order->getTotal() * 100,
                'currency' => 'eur',
                'source' => $token,
                'description' => 'Order #' . $order->getId(),
            ]);

            $payment = new Payment();
            $payment->setOrder($order);
            $payment->setAmount($order->getTotal());
            $payment->setStripeChargeId($charge->id);
            $payment->setStatus('completed');
            $payment->setCreatedAt(new \DateTime());

            $order->setStatus('paid');
            $order->setPaidAt(new \DateTime());

            $this->em->persist($payment);
            $this->em->flush();

            // Envoyer email de confirmation
            mail(
                $order->getCustomer()->getEmail(),
                'Payment confirmed',
                'Your payment of ' . $order->getTotal() . '€ has been processed.'
            );

            return $payment;

        } catch (\Stripe\Exception\CardException $e) {
            $payment = new Payment();
            $payment->setOrder($order);
            $payment->setAmount($order->getTotal());
            $payment->setStatus('failed');
            $payment->setErrorMessage($e->getMessage());
            $payment->setCreatedAt(new \DateTime());

            $this->em->persist($payment);
            $this->em->flush();

            throw new PaymentFailedException($e->getMessage());
        }
    }

    public function refund(Payment $payment): void
    {
        Stripe::setApiKey($this->stripeKey);

        $refund = \Stripe\Refund::create([
            'charge' => $payment->getStripeChargeId(),
        ]);

        $payment->setStatus('refunded');
        $payment->setRefundedAt(new \DateTime());
        $this->em->flush();
    }
}
```

---

## Partie 1 : Review Architecture (5 min)

### Étape 1.1 : Lancer la review avec @symfony-reviewer

```bash
cd ~/audit-demo  # ou votre projet
claude

# Copier le code ci-dessus dans un fichier ou le passer directement
@symfony-reviewer "Fais une code review de ce PaymentService :

[Coller le code PaymentService.php ici]
"
```

### Étape 1.2 : Noter les issues identifiées

**Violations d'architecture :**
1. ___
2. ___
3. ___

**Violations SOLID :**
1. ___
2. ___

---

## Partie 2 : Review Sécurité (5 min)

### Étape 2.1 : Audit sécurité avec @security-auditor

```bash
@security-auditor "Analyse la sécurité de ce PaymentService :

[Coller le code]
"
```

### Étape 2.2 : Noter les vulnérabilités

| Sévérité | Issue | Recommandation |
|----------|-------|----------------|
| | | |
| | | |
| | | |

---

## Partie 3 : Review Tests (5 min)

### Étape 3.1 : Demander les tests manquants

```bash
@tdd-coach "Quels tests sont nécessaires pour PaymentService ?
Liste les cas de test avec leurs noms et ce qu'ils vérifient."
```

### Étape 3.2 : Noter les tests proposés

**Tests unitaires nécessaires :**
1. `test___` : ___
2. `test___` : ___
3. `test___` : ___
4. `test___` : ___
5. `test___` : ___

---

## Partie 4 : Proposition de refactoring (5 min)

### Étape 4.1 : Demander un refactoring

```bash
"Propose un refactoring de PaymentService en appliquant :
- Clean Architecture (extraction vers Domain)
- SRP (séparation des responsabilités)
- Interface pour Stripe (pour les tests)
- Event pour l'email (async)"
```

### Étape 4.2 : Noter l'architecture proposée

**Nouvelles classes proposées :**

| Classe | Couche | Responsabilité |
|--------|--------|----------------|
| | Domain | |
| | Application | |
| | Infrastructure | |
| | | |

---

### Partie 5 : Test avec agents BMAD et Docker (5 min)

#### Étape 5.1 : Audit QA avec @qa
```bash
@qa "Vérifie que le PaymentService respecte les critères d'acceptance :
- Le paiement est effectué via Stripe
- Un email de confirmation est envoyé
- L'erreur de carte est gérée proprement"
```

#### Étape 5.2 : Debug Docker avec @docker-debug
```bash
@docker-debug "Le container app ne démarre pas, voici les logs :
[coller les logs Docker]"
```

---

## Partie 6 : Rédiger le feedback de review

### Template de feedback PR

Rédigez le commentaire de review que vous feriez sur la PR :

```markdown
## Code Review - PaymentService

### [OK] Points positifs
-
-

### [!] Points à améliorer

#### Architecture
- [ ]
- [ ]

#### Sécurité
- [ ]
- [ ]

#### Tests
- [ ]

### [*] Suggestions de refactoring

[Résumé des propositions]

### [>] Verdict

- [ ] [OK] Approved
- [x] [-] Request changes
- [ ] [.] Comment only

**Bloquant pour merge :** [Oui/Non]
**Priorité des corrections :** [Haute/Moyenne/Basse]
```

---

## Critères de réussite

- [ ] Review architecture effectuée avec @symfony-reviewer
- [ ] Audit sécurité effectué avec @security-auditor
- [ ] Tests manquants identifiés avec @tdd-coach
- [ ] Proposition de refactoring documentée
- [ ] Agents BMAD et Docker testés
- [ ] Feedback de PR rédigé

---

## Issues attendues (référence)

### Architecture
1. **Couplage fort avec Stripe** - Pas d'interface, difficile à tester
2. **Email synchrone** - Devrait être async (event/message)
3. **Logique métier mélangée** - Persistence + External API + Notification
4. **Pas de transaction** - Risque d'incohérence si erreur après Stripe

### Sécurité
1. **Clé Stripe en paramètre** - Devrait venir du vault/env sécurisé
2. **Pas de validation du montant** - Pourrait être manipulé
3. **Pas de logging sécurité** - Pas de trace des paiements
4. **mail() non sécurisé** - Injection possible, pas de template

### SOLID Violations
1. **SRP** - Le service fait trop de choses (payment, email, persistence)
2. **DIP** - Dépend de l'implémentation Stripe, pas d'abstraction
3. **OCP** - Pas extensible pour d'autres providers de paiement

### Tests manquants
1. `testProcessPaymentSuccess()`
2. `testProcessPaymentCardDeclined()`
3. `testProcessPaymentInvalidAmount()`
4. `testRefundSuccess()`
5. `testRefundAlreadyRefunded()`
6. `testEmailSentOnSuccess()`
7. `testNoEmailOnFailure()`

---

## Refactoring suggéré (référence)

```
src/
├── Domain/
│   └── Payment/
│       ├── Payment.php              # Entité
│       ├── PaymentId.php            # Value Object
│       └── PaymentGatewayInterface.php  # Port
├── Application/
│   └── Command/
│       └── ProcessPayment/
│           ├── ProcessPaymentCommand.php
│           └── ProcessPaymentHandler.php
├── Infrastructure/
│   └── Payment/
│       └── StripePaymentGateway.php  # Adapter
└── UserInterface/
    └── Api/
        └── PaymentController.php

# + Event pour l'email
src/Domain/Payment/Event/PaymentCompletedEvent.php
src/Application/EventHandler/SendPaymentConfirmationEmail.php
```

---

## Points clés appris

1. **@symfony-reviewer** identifie les problèmes d'architecture
2. **@security-auditor** trouve les vulnérabilités
3. **@tdd-coach** liste les tests nécessaires
4. **Combiner les agents** donne une review complète
5. **Documenter le feedback** de manière constructive

---

**Prochain exercice :** Challenge d'équipe
