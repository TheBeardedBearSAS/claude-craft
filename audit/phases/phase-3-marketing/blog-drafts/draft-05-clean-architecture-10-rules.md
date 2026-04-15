---
title: "Clean Architecture + Claude Code : 10 rules that actually work"
publishedAt: ""
canonical: ""
tags: ["clean-architecture", "ddd", "ai", "claude-code"]
status: DRAFT
author: Flavien Métivier
wordCount: ~2500
---

# Clean Architecture + Claude Code : 10 rules that actually work

**TL;DR** : Claude Code peut générer du Clean Architecture propre, mais seulement si on encadre. Voici les 10 règles distillées après 6 mois de production.

## Contexte

La Clean Architecture (Uncle Bob) est séduisante : layers séparés, dépendances pointant vers le domaine, testabilité maximale. En pratique, Claude Code a tendance à :

- Créer des abstractions prématurées (rule 05 YAGNI cassée)
- Ignorer les bounded contexts
- Mélanger couches (controller appelle repository direct)
- Générer des use cases CRUD monolithiques

D'où ces 10 règles — testées sur Symfony, Laravel, .NET.

## Rule 1 : Le domaine ne sait rien du framework

❌ Mauvais :
```php
namespace App\Domain\Order;

use Doctrine\ORM\Mapping as ORM;  // DEPENDANCE FRAMEWORK

#[ORM\Entity]
class Order { ... }
```

✅ Bon : les annotations Doctrine dans l'infrastructure (XML/YAML/attributes side-car).

**Prompt pour Claude** : "Ne JAMAIS importer Doctrine / Eloquent / EF Core dans `src/Domain/`. Valider avec un script CI."

## Rule 2 : Chaque use case est un fichier

Un use case = une intention métier = un fichier.

```
src/Application/Order/
├── PlaceOrder/
│   ├── PlaceOrderCommand.php
│   ├── PlaceOrderHandler.php
│   └── PlaceOrderResult.php
└── CancelOrder/
    ├── CancelOrderCommand.php
    └── CancelOrderHandler.php
```

Pas de `OrderService` fourre-tout avec 15 méthodes.

## Rule 3 : Value Objects > primitives

Cf. rule 04 claude-craft. Pas de `string $status` : `OrderStatus::paid()`.

Claude Code tend à accepter des primitives partout. À cadrer dans `CLAUDE.md` / skill `value-objects`.

## Rule 4 : Repositories exposent des intentions, pas du SQL

❌ `$repo->queryByFilter($filters)` : fuite d'abstraction.
✅ `$repo->findPendingOrdersOlderThan(Duration $age)` : intention claire.

## Rule 5 : Les DTO traversent les couches — c'est OK

Dogme strict : "les couches ne partagent rien." Pragmatique 2026 : un DTO stable (input/output use case) peut traverser. Évite l'anémie sans rigidifier.

Source : rule 04 claude-craft §"Clean pragmatique".

## Rule 6 : Tests de domaine sans Docker, sans BD

Un test unitaire du domaine doit tourner en < 100ms. Si `docker compose up` est requis, c'est un test d'intégration, pas unitaire.

```php
// Domain test (< 100ms)
it('cannot place order without items', function () {
    expect(fn() => Order::place(customerId: $id, items: []))
        ->toThrow(EmptyOrderException::class);
});
```

## Rule 7 : Domain Events > callbacks

Au lieu de :
```php
$order->place();
$this->mailer->send(...);
$this->inventory->reserve(...);
```

Publier un `OrderPlacedEvent` et laisser les subscribers gérer. Découplage + testabilité.

Cf. rule 06 claude-craft (domain-events).

## Rule 8 : Async par défaut pour side-effects

Toute opération > 200ms qui n'est pas directement liée à la réponse HTTP va en queue (Symfony Messenger / Laravel Queue).

Cf. rule 17 claude-craft (async).

## Rule 9 : CQRS seulement si justifié

CQRS sépare lecture/écriture. Coût : double modèle, complexité.

Bénéfice justifié si :
- Ratio lecture/écriture > 10:1
- Audit légal requis
- Projections multiples

Sinon : architecture classique suffit. Cf. rule 21 claude-craft.

## Rule 10 : La frontière avec Claude Code est explicite

Claude Code **génère du code dans les couches qu'on lui pointe**. Si on prompt "implémente la feature X" sans scoper la couche, il va :
- Mettre du SQL dans le controller
- Mélanger domaine + infra
- Générer des tests qui testent l'implémentation

Solution : prompts spécifiques par couche.

```
✅ "Génère le domain model (src/Domain/Order/) pour placer une commande. Respecter rule 05 + value objects."
✅ "Génère le handler Application pour PlaceOrder. Pas de dépendance infra directe."
✅ "Génère l'adapter Doctrine (src/Infrastructure/Persistence/) implémentant OrderRepositoryInterface."
```

Ou mieux : `/symfony:generate-crud` qui fait cette séparation automatiquement.

## Outils

- `/symfony:check-architecture` : vérifie les dépendances entre couches
- `/laravel:check-architecture` : idem Laravel
- `/csharp:check-architecture` : idem .NET
- Deptrac (Symfony) / ArchUnit (.NET) / Dephpend : validation CI

## Les 3 anti-patterns les plus fréquents avec Claude Code

1. **Service Locator déguisé** : injecter le container dans un use case. Toujours injecter les dépendances explicitement.
2. **Entités anémiques** : getters/setters partout, logique dans un "Service". Le domaine doit **contenir** la logique.
3. **Tests couplés à l'implémentation** : tester les méthodes privées ou la structure interne. Tester les **comportements**.

## Conclusion

Clean Architecture + AI = combo puissant si on pose le cadre. Claude Code ne remplace pas le tech lead qui relit. Mais il accélère x3-x5 une fois les règles intégrées dans `CLAUDE.md` + skills.

---

*Ressources Claude Craft :*
- `.claude/rules/04-solid-principles.md`
- `.claude/rules/05-kiss-dry-yagni.md`
- `.claude/skills/architecture-clean-ddd/SKILL.md`
- `/symfony:check-architecture`
