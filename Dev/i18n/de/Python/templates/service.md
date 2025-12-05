# Template: Domain-Service

## Wann einen Domain-Service verwenden?

Ein Domain-Service enthält Geschäftslogik, die:
- Nicht natürlich in eine Entität passt
- Auf mehreren Entitäten operiert
- Externe Abhängigkeiten benötigt (Repositories, andere Services)

## Template

```python
# src/myproject/domain/services/[service_name]_service.py
"""
Geschäftsservice für [Beschreibung].

Dieser Service enthält Geschäftslogik für [Funktionalität],
die nicht in einer einzelnen Entität platziert werden kann.
"""

from typing import Protocol
from uuid import UUID

from myproject.domain.entities.[entity] import [Entity]
from myproject.domain.repositories.[repository] import [Repository]
from myproject.domain.exceptions import [DomainException]


class [ServiceName]Service:
    """
    Geschäftsservice für [detaillierte Beschreibung].

    Dieser Service koordiniert [welche Operationen] unter Einhaltung
    folgender Geschäftsregeln:
    - [Geschäftsregel 1]
    - [Geschäftsregel 2]
    - [Geschäftsregel 3]

    Attribute:
        _repository: Repository zum Zugriff auf [Entities]

    Example:
        >>> service = [ServiceName]Service(repository)
        >>> result = service.[method_name](param1, param2)
    """

    def __init__(self, repository: [Repository]) -> None:
        """
        Service initialisieren.

        Args:
            repository: Repository für [Beschreibung]
        """
        self._repository = repository

    def [method_name](
        self,
        param1: Type1,
        param2: Type2
    ) -> ReturnType:
        """
        [Beschreibung was diese Methode tut].

        Diese Methode:
        1. [Schritt 1]
        2. [Schritt 2]
        3. [Schritt 3]

        Angewendete Geschäftsregeln:
        - [Regel 1]
        - [Regel 2]

        Args:
            param1: Beschreibung von Parameter 1
            param2: Beschreibung von Parameter 2

        Returns:
            Beschreibung des Rückgabewerts

        Raises:
            [DomainException]: Wenn [Bedingung]
            ValueError: Wenn [Bedingung]

        Example:
            >>> service.[method_name](value1, value2)
            result_value
        """
        # 1. Geschäftsregel-Validierung
        self._validate_[rule_name](param1, param2)

        # 2. Erforderliche Daten abrufen
        entity = self._repository.find_by_id(param1)
        if not entity:
            raise [DomainException](f"[Entity] nicht gefunden: {param1}")

        # 3. Geschäftslogik anwenden
        result = self._apply_[business_logic](entity, param2)

        # 4. Persistieren falls erforderlich
        self._repository.save(entity)

        # 5. Ergebnis zurückgeben
        return result
```

## Konkretes Beispiel: PricingService

[Vollständiges Pricing-Service-Beispiel mit Rabattregeln]

## Unit-Tests

[Test-Beispiele mit Mocks]

## Checkliste

- [ ] Service-Name als `[Noun]Service` (z.B. PricingService, NotificationService)
- [ ] Vollständiger Docstring mit Example
- [ ] Jede öffentliche Methode dokumentiert
- [ ] Geschäftsregel-Validierung
- [ ] Keine Infrastructure-Abhängigkeit
- [ ] Abhängigkeiten über Konstruktor injiziert
- [ ] Private Methoden mit `_` vorangestellt
- [ ] Geschäfts-Exceptions (DomainException)
- [ ] Unit-Tests mit Mocks
- [ ] Coverage > 95%
