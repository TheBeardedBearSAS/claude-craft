# Template: Repository-Pattern

## Repository-Pattern

Das Repository-Pattern:
- Abstrahiert Datenzugriff
- Trennt Domain von Infrastructure
- Ermöglicht DB-Wechsel ohne Domain-Auswirkung
- Erleichtert Testing (Mocks)

## Struktur

1. **Interface (Protocol)** in `domain/repositories/`
2. **Implementierung** in `infrastructure/database/repositories/`
3. **ORM-Modell** in `infrastructure/database/models/`

## Template: Interface (Domain)

```python
# src/myproject/domain/repositories/[entity]_repository.py
"""Interface für [Entity]-Repository."""

from typing import Optional, Protocol
from uuid import UUID

from myproject.domain.entities.[entity] import [Entity]


class [Entity]Repository(Protocol):
    """
    Port (Interface) für [Entity]-Repository.

    Die Domain definiert den Vertrag, Infrastructure liefert Implementierung.
    Verwendet Protocol (PEP 544) für strukturelle Subtypisierung.

    Dieses Interface definiert alle Persistenzoperationen
    für [Entity]-Entität.
    """

    def save(self, entity: [Entity]) -> [Entity]:
        """
        Speichert eine [Entity].

        Erstellt neue [Entity] oder aktualisiert bestehende.

        Args:
            entity: Die zu speichernde [Entity]

        Returns:
            Gespeicherte [Entity] (mit generierter ID falls neu)

        Raises:
            RepositoryError: Wenn Speichern fehlschlägt
        """
        ...

    def find_by_id(self, entity_id: UUID) -> Optional[[Entity]]:
        """
        Findet [Entity] nach ID.

        Args:
            entity_id: Die [Entity]-ID

        Returns:
            Gefundene [Entity] oder None wenn nicht gefunden
        """
        ...

    def find_all(self) -> list[[Entity]]:
        """
        Ruft alle [Entities] ab.

        Returns:
            Liste aller [Entities]
        """
        ...

    def delete(self, entity_id: UUID) -> None:
        """
        Löscht [Entity].

        Args:
            entity_id: Die zu löschende [Entity]-ID

        Raises:
            RepositoryError: Wenn Löschung fehlschlägt
            [Entity]NotFoundError: Wenn [Entity] nicht existiert
        """
        ...
```

## Template: Implementierung (Infrastructure)

[Vollständige Repository-Implementierung mit SQLAlchemy]

## Template: ORM-Modell

[SQLAlchemy-Modell mit ordnungsgemäßen Spalten, Indizes, Zeitstempeln]

## Konkretes Beispiel: UserRepository

[Vollständiges Arbeitsbeispiel mit User-Entität]

## Tests

[Unit- und Integrationstest-Beispiele]

## Checkliste

- [ ] Interface (Protocol) in domain/repositories/
- [ ] Implementierung in infrastructure/database/repositories/
- [ ] ORM-Modell in infrastructure/database/models/
- [ ] Basis-CRUD-Methoden (save, find_by_id, find_all, delete)
- [ ] Entitätsspezifische Suchmethoden
- [ ] Entity <-> Modell-Konvertierung in privaten Methoden
- [ ] Fehlerbehandlung mit try/catch
- [ ] Rollback bei Fehler
- [ ] Unit-Tests mit Mocks
- [ ] Integrationstests mit echter DB
- [ ] Vollständige Docstrings
