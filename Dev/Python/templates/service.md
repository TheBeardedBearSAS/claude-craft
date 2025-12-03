# Template: Domain Service

## Quand utiliser un Domain Service?

Un Domain Service contient de la logique métier qui:
- Ne rentre naturellement dans aucune entité
- Opère sur plusieurs entités
- Nécessite des dépendances externes (repositories, autres services)

## Template

```python
# src/myproject/domain/services/[service_name]_service.py
"""
Service métier pour [description].

Ce service contient la logique métier de [fonctionnalité]
qui ne peut pas être placée dans une seule entité.
"""

from typing import Protocol
from uuid import UUID

from myproject.domain.entities.[entity] import [Entity]
from myproject.domain.repositories.[repository] import [Repository]
from myproject.domain.exceptions import [DomainException]


class [ServiceName]Service:
    """
    Service métier pour [description détaillée].

    Ce service coordonne [quelles opérations] en respectant
    les règles métier suivantes:
    - [Règle métier 1]
    - [Règle métier 2]
    - [Règle métier 3]

    Attributes:
        _repository: Repository pour accéder aux [entités]

    Example:
        >>> service = [ServiceName]Service(repository)
        >>> result = service.[method_name](param1, param2)
    """

    def __init__(self, repository: [Repository]) -> None:
        """
        Initialise le service.

        Args:
            repository: Repository pour [description]
        """
        self._repository = repository

    def [method_name](
        self,
        param1: Type1,
        param2: Type2
    ) -> ReturnType:
        """
        [Description de ce que fait cette méthode].

        Cette méthode:
        1. [Étape 1]
        2. [Étape 2]
        3. [Étape 3]

        Règles métier appliquées:
        - [Règle 1]
        - [Règle 2]

        Args:
            param1: Description du paramètre 1
            param2: Description du paramètre 2

        Returns:
            Description du retour

        Raises:
            [DomainException]: Si [condition]
            ValueError: Si [condition]

        Example:
            >>> service.[method_name](value1, value2)
            result_value
        """
        # 1. Validation des règles métier
        self._validate_[rule_name](param1, param2)

        # 2. Récupération des données nécessaires
        entity = self._repository.find_by_id(param1)
        if not entity:
            raise [DomainException](f"[Entity] not found: {param1}")

        # 3. Application de la logique métier
        result = self._apply_[business_logic](entity, param2)

        # 4. Persistence si nécessaire
        self._repository.save(entity)

        # 5. Retour du résultat
        return result

    def _validate_[rule_name](
        self,
        param1: Type1,
        param2: Type2
    ) -> None:
        """
        Valide [quelle règle métier].

        Args:
            param1: Description
            param2: Description

        Raises:
            [DomainException]: Si [condition]
        """
        if [condition_invalide]:
            raise [DomainException]("[Message d'erreur]")

    def _apply_[business_logic](
        self,
        entity: [Entity],
        param: Type
    ) -> ReturnType:
        """
        Applique [quelle logique métier].

        Args:
            entity: L'entité sur laquelle appliquer la logique
            param: Paramètre nécessaire

        Returns:
            Le résultat de l'application
        """
        # Logique métier complexe ici
        pass
```

## Exemple Concret: PricingService

```python
# src/myproject/domain/services/pricing_service.py
"""Service métier pour le calcul des prix et discounts."""

from decimal import Decimal
from typing import Protocol

from myproject.domain.entities.order import Order
from myproject.domain.value_objects.money import Money


class DiscountRule(Protocol):
    """Interface pour les règles de discount."""

    def applies_to(self, order: Order) -> bool:
        """Vérifie si la règle s'applique."""
        ...

    def calculate_discount(self, order: Order) -> Money:
        """Calcule le montant du discount."""
        ...


class PricingService:
    """
    Service métier pour le calcul des prix.

    Ce service coordonne le calcul du prix total d'une commande
    en appliquant les règles métier suivantes:
    - Calcul du sous-total basé sur les items
    - Application des discounts selon les règles configurées
    - Calcul des taxes
    - Calcul du total final

    Les discounts ne peuvent jamais rendre le total négatif.
    Les discounts sont appliqués avant les taxes.

    Attributes:
        _discount_rules: Liste des règles de discount à appliquer

    Example:
        >>> rules = [PercentageDiscount(0.10), SeasonalDiscount()]
        >>> service = PricingService(discount_rules=rules)
        >>> total = service.calculate_total(order)
        Money(amount=Decimal("99.99"), currency="EUR")
    """

    def __init__(self, discount_rules: list[DiscountRule]) -> None:
        """
        Initialise le service de pricing.

        Args:
            discount_rules: Liste des règles de discount à appliquer
        """
        self._discount_rules = discount_rules

    def calculate_total(self, order: Order) -> Money:
        """
        Calcule le montant total d'une commande.

        Cette méthode:
        1. Calcule le sous-total (somme des items)
        2. Applique tous les discounts applicables
        3. Calcule les taxes sur le montant après discount
        4. Retourne le total final

        Args:
            order: La commande à pricer

        Returns:
            Le montant total incluant discounts et taxes

        Raises:
            ValueError: Si la commande n'a pas d'items

        Example:
            >>> service.calculate_total(order)
            Money(amount=Decimal("120.00"), currency="EUR")
        """
        # 1. Validation
        if not order.items:
            raise ValueError("Order must have at least one item")

        # 2. Calcul sous-total
        subtotal = self._calculate_subtotal(order)

        # 3. Application discounts
        total_discount = self._calculate_total_discount(order)

        # 4. Montant après discount (ne peut pas être négatif)
        amount_after_discount = subtotal - total_discount
        if amount_after_discount.amount < 0:
            amount_after_discount = Money(Decimal("0"), subtotal.currency)

        # 5. Calcul taxes
        tax = self._calculate_tax(amount_after_discount, order.tax_rate)

        # 6. Total final
        total = amount_after_discount + tax

        return total

    def _calculate_subtotal(self, order: Order) -> Money:
        """
        Calcule le sous-total de la commande.

        Args:
            order: La commande

        Returns:
            Le sous-total (somme des prix des items)
        """
        subtotal = Money(amount=Decimal("0"), currency="EUR")

        for item in order.items:
            item_total = item.unit_price * item.quantity
            subtotal = subtotal + item_total

        return subtotal

    def _calculate_total_discount(self, order: Order) -> Money:
        """
        Calcule le discount total en appliquant toutes les règles.

        Chaque règle est évaluée, et si elle s'applique, son discount
        est ajouté au total.

        Args:
            order: La commande

        Returns:
            Le montant total de discount
        """
        total_discount = Money(amount=Decimal("0"), currency="EUR")

        for rule in self._discount_rules:
            if rule.applies_to(order):
                discount = rule.calculate_discount(order)
                total_discount = total_discount + discount

        return total_discount

    def _calculate_tax(self, amount: Money, tax_rate: Decimal) -> Money:
        """
        Calcule la taxe sur un montant.

        Args:
            amount: Le montant sur lequel calculer la taxe
            tax_rate: Le taux de taxe (ex: Decimal("0.20") pour 20%)

        Returns:
            Le montant de la taxe
        """
        return amount * tax_rate
```

## Tests Unitaires

```python
# tests/unit/domain/services/test_[service_name]_service.py
import pytest
from unittest.mock import Mock

from myproject.domain.services.[service_name]_service import [ServiceName]Service


class Test[ServiceName]Service:
    """Tests unitaires pour [ServiceName]Service."""

    @pytest.fixture
    def mock_repository(self):
        """Mock du repository."""
        return Mock()

    @pytest.fixture
    def service(self, mock_repository):
        """Fixture du service."""
        return [ServiceName]Service(repository=mock_repository)

    def test_[method_name]_with_valid_data(self, service, mock_repository):
        """Test [méthode] avec données valides."""
        # Arrange
        mock_repository.[method].return_value = [expected_value]

        # Act
        result = service.[method_name](param1, param2)

        # Assert
        assert result == [expected_value]
        mock_repository.[method].assert_called_once_with(param1)

    def test_[method_name]_with_invalid_data_raises_error(self, service):
        """Test [méthode] avec données invalides."""
        # Act & Assert
        with pytest.raises([Exception], match="[message]"):
            service.[method_name](invalid_param)

    def test_[method_name]_applies_business_rules(self, service):
        """Test [méthode] applique les règles métier."""
        # Arrange
        [setup]

        # Act
        result = service.[method_name](param)

        # Assert
        # Vérifier que les règles métier sont respectées
        assert [condition]
```

## Checklist

- [ ] Nom du service en `[Noun]Service` (ex: PricingService, NotificationService)
- [ ] Docstring complète avec Example
- [ ] Chaque méthode publique documentée
- [ ] Validation des règles métier
- [ ] Pas de dépendance sur l'infrastructure
- [ ] Dépendances injectées via constructeur
- [ ] Méthodes privées préfixées par `_`
- [ ] Exceptions métier (DomainException)
- [ ] Tests unitaires avec mocks
- [ ] Couverture > 95%
