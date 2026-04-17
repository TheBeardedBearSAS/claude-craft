# Exercice 8 : Challenge d'Équipe

## Objectif

Appliquer toutes les connaissances acquises pour implémenter une feature complète en équipe.

## Durée

30 minutes

## Format

- Travail en binômes
- Un driver (écrit), un navigator (guide)
- Alternez les rôles à mi-parcours

---

## Le Challenge : Système de Wishlist

### Contexte business

Un site e-commerce veut permettre à ses utilisateurs de créer des listes de souhaits pour sauvegarder les produits qui les intéressent.

### Spécifications fonctionnelles

```markdown
## User Stories

US-1: En tant qu'utilisateur connecté, je peux ajouter un produit à ma wishlist
  - Le produit ne peut être ajouté qu'une seule fois
  - Je reçois une confirmation

US-2: En tant qu'utilisateur, je peux voir ma wishlist
  - Liste triée par date d'ajout (plus récent en premier)
  - Affiche : nom produit, prix, date d'ajout

US-3: En tant qu'utilisateur, je peux retirer un produit de ma wishlist
  - Suppression immédiate
  - Confirmation

US-4: (Bonus) Je reçois une notification si un produit de ma wishlist est en promotion
```

### Contraintes techniques

- Architecture Clean/Hexagonale
- Tests TDD (couverture > 80%)
- API REST
- Pas de logique métier dans les controllers

---

## Étapes recommandées

### Phase 1 : Analyse (5 min)

```bash
/workflow:init "Implémenter le système de Wishlist avec les user stories US-1 à US-3"
```

```bash
/workflow:init
/sprint:transition US-1 in-progress
```

Questions à se poser :
- Quelles entités ?
- Quels endpoints ?
- Quelles règles métier ?

### Phase 2 : Design (5 min)

```bash
@api-designer "Conçois l'API REST pour la Wishlist :
- Ajouter un produit
- Lister la wishlist
- Retirer un produit"
```

```bash
@database-architect "Schéma pour Wishlist et WishlistItem"
```

### Phase 3 : Tests TDD (10 min)

```bash
@tdd-coach "Écris les tests pour AddToWishlistHandler avec les règles :
- Le produit ne peut être ajouté qu'une fois
- L'utilisateur doit exister
- Le produit doit exister"
```

### Phase 4 : Implémentation (10 min)

```bash
/symfony:generate-feature Wishlist

# Ou manuellement
"Implémente AddToWishlistHandler pour faire passer les tests"
```

```bash
/sprint:transition US-1 review
/gate:validate-story US-1
/sprint:transition US-1 done
```

---

## Structure attendue

```
src/
├── Domain/
│   └── Model/
│       └── Wishlist/
│           ├── Wishlist.php
│           ├── WishlistId.php
│           └── WishlistItem.php
├── Application/
│   ├── Command/
│   │   └── AddToWishlist/
│   │       ├── AddToWishlistCommand.php
│   │       └── AddToWishlistHandler.php
│   └── Query/
│       └── GetWishlist/
│           ├── GetWishlistQuery.php
│           └── GetWishlistHandler.php
├── Infrastructure/
│   └── Persistence/
│       └── DoctrineWishlistRepository.php
└── UserInterface/
    └── Api/
        └── WishlistController.php

tests/
├── Unit/
│   └── Domain/
│       └── WishlistTest.php
└── Application/
    └── AddToWishlistHandlerTest.php
```

---

## API attendue

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| POST | `/api/wishlists/{userId}/items` | Ajouter produit | `{"productId": "uuid"}` |
| GET | `/api/wishlists/{userId}` | Voir wishlist | - |
| DELETE | `/api/wishlists/{userId}/items/{productId}` | Retirer produit | - |

---

## Grille d'évaluation

| Critère | Points | Votre score |
|---------|--------|-------------|
| Architecture Clean respectée | /25 | |
| Tests présents et passants | /25 | |
| API fonctionnelle (3 endpoints) | /25 | |
| Code quality (pas de violations) | /15 | |
| Documentation (PHPDoc, README) | /10 | |
| **Total** | **/100** | |

---

## Indices si bloqué

### Entité Wishlist

```php
// Domain/Model/Wishlist/Wishlist.php
class Wishlist
{
    private WishlistId $id;
    private UserId $userId;
    /** @var WishlistItem[] */
    private array $items = [];

    public function addItem(ProductId $productId): void
    {
        if ($this->hasProduct($productId)) {
            throw new ProductAlreadyInWishlistException($productId);
        }
        $this->items[] = new WishlistItem($productId, new \DateTimeImmutable());
    }

    public function hasProduct(ProductId $productId): bool
    {
        foreach ($this->items as $item) {
            if ($item->getProductId()->equals($productId)) {
                return true;
            }
        }
        return false;
    }
}
```

### Handler

```php
// Application/Command/AddToWishlist/AddToWishlistHandler.php
class AddToWishlistHandler
{
    public function __construct(
        private WishlistRepositoryInterface $wishlistRepository,
        private ProductRepositoryInterface $productRepository
    ) {}

    public function handle(AddToWishlistCommand $command): void
    {
        $wishlist = $this->wishlistRepository->findByUserId($command->userId)
            ?? Wishlist::create($command->userId);

        $product = $this->productRepository->findById($command->productId)
            ?? throw new ProductNotFoundException($command->productId);

        $wishlist->addItem($command->productId);

        $this->wishlistRepository->save($wishlist);
    }
}
```

---

## Rendu

À la fin du challenge, chaque binôme présente (2 min) :

1. L'architecture choisie
2. Les tests écrits
3. Une démo de l'API (si fonctionnelle)
4. Les difficultés rencontrées

---

## Critères de réussite minimum

Pour valider le challenge :

- [ ] Au moins 1 endpoint fonctionnel
- [ ] Au moins 3 tests qui passent
- [ ] Architecture Domain/Application séparée
- [ ] Pas de logique métier dans le controller
- [ ] Workflow initialisé et story transitioned

---

## Après le challenge

### Discussion collective

- Quelles approches différentes ?
- Quels pièges rencontrés ?
- Comment Claude a aidé (ou pas) ?

### Améliorations possibles

- Ajouter la notification (US-4)
- Implémenter les tests d'intégration
- Ajouter la pagination sur GET
- Gérer la concurrence
- Lancer un QA Recette dry-run : `/qa:recette --scope=story --id=US-1 --dry-run`
- Lancer un Recette Fix dry-run : `/qa:fix --session=REC-xxx --dry-run`

---

## Points clés

1. Le workflow structure le travail
2. TDD garantit la qualité
3. Les agents accélèrent le design
4. La collaboration est essentielle

---

**Bonne chance !**
