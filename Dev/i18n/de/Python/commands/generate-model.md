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

## MISSION

### Schritt 1: Anforderungen analysieren

Identifizieren:
- Modell- und Tabellenname
- Felder und ihre Typen
- Relationen (ForeignKey, OneToMany, ManyToMany)
- Indizes und Constraints
- Validierungen

### Schritt 2-6: [Modellgenerierung...]

### Zusammenfassung

```
══════════════════════════════════════════════════════════════
✅ MODELL GENERIERT - {Model}
══════════════════════════════════════════════════════════════

📁 Erstellte Dateien:
- app/models/{model}.py

📊 Tabellenstruktur:
| Spalte | Typ | Constraints |
|--------|------|-------------|
| id | UUID | PK |
| name | VARCHAR(255) | NOT NULL, INDEX |

[...]
```
