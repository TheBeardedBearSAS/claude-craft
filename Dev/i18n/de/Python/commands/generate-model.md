---
description: SQLAlchemy-Modell generieren
argument-hint: [arguments]
---

# SQLAlchemy-Modell generieren

Sie sind ein erfahrener Python-Entwickler. Sie müssen ein vollständiges SQLAlchemy-Modell mit Relationen, Validierungen und Alembic-Migration generieren.

## Argumente
$ARGUMENTS

Argumente:
- Modellname (z.B. `User`, `Product`, `Order`)
- (Optional) Felder im Format field:type (z.B. `name:str email:str:unique`)

Beispiel: `/python:generate-model Product name:str price:decimal category_id:uuid:fk`

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## MISSION

### Schritt 1: Anforderungen analysieren

Identifizieren:
- Modell- und Tabellenname
- Felder und ihre Typen
- Relationen (ForeignKey, OneToMany, ManyToMany)
- Indizes und Constraints
- Validierungen

### Schritt 2: SQLAlchemy 2.0 Modell

[Vollständiges Modell mit Mapped, Relationships, Constraints erstellen]

### Schritt 3: Häufige Spaltentypen

[Referenz für SQLAlchemy-Typen: Integer, String, Text, DateTime, UUID, JSONB, etc.]

### Schritt 4: Relationen

[Beispiele: OneToMany, ManyToMany mit Verbindungstabelle]

### Schritt 5: Alembic-Migration

[Migrationsdatei mit upgrade/downgrade-Funktionen erstellen]

### Schritt 6: Befehle

```bash
# Migration automatisch generieren
alembic revision --autogenerate -m "Create {model}s table"

# Migration prüfen
alembic upgrade --sql head

# Migration anwenden
alembic upgrade head

# Bei Bedarf rückgängig machen
alembic downgrade -1
```

### Zusammenfassung

```
══════════════════════════════════════════════════════════════
✅ MODELL GENERIERT - {Model}
══════════════════════════════════════════════════════════════

📁 Erstellte Dateien:
- app/models/{model}.py

📊 Tabellenstruktur:
| Spalte        | Typ            | Constraints                    |
|---------------|----------------|--------------------------------|
| id            | UUID           | PK                             |
| name          | VARCHAR(255)   | NOT NULL, INDEX                |
| slug          | VARCHAR(255)   | UNIQUE, INDEX                  |
| description   | TEXT           | NULLABLE                       |
| price         | NUMERIC(10,2)  | DEFAULT 0.00, CHECK >= 0       |
| quantity      | INTEGER        | DEFAULT 0                      |
| is_active     | BOOLEAN        | DEFAULT true, INDEX            |
| category_id   | UUID           | FK -> categories.id            |
| created_at    | DATETIME       | DEFAULT now()                  |
| updated_at    | DATETIME       | DEFAULT now(), ON UPDATE       |

🔗 Relationen:
- category: ManyToOne -> Category
- order_items: OneToMany -> OrderItem

🔧 Befehle:
# Migration generieren
alembic revision --autogenerate -m "Create {model}s table"

# Anwenden
alembic upgrade head
```
