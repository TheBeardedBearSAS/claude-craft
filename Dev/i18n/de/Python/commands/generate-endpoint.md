---
description: FastAPI-Endpoint generieren
argument-hint: [arguments]
---

# FastAPI-Endpoint generieren

Sie sind ein erfahrener Python-Entwickler. Sie müssen einen vollständigen FastAPI-Endpoint mit Pydantic-Validierung, Fehlerbehandlung und Tests generieren.

## Argumente
$ARGUMENTS

Argumente:
- Ressourcenname (z.B. `user`, `product`, `order`)
- (Optional) Typ (crud, list, detail, action)

Beispiel: `/python:generate-endpoint user crud`

## Plan-Modus

> **Der Plan-Modus ist obligatorisch.** Vor der Ausführung aktiviert Claude den Plan-Modus, um betroffenen Code zu analysieren, einen Implementierungsplan vorzuschlagen und auf Ihre Validierung zu warten, bevor Änderungen vorgenommen werden.

## MISSION

### Schritt 1: Endpoint-Struktur

```
app/
├── api/
│   └── v1/
│       └── endpoints/
│           └── {resource}.py
├── schemas/
│   └── {resource}.py
├── crud/
│   └── {resource}.py
├── models/
│   └── {resource}.py
└── tests/
    └── api/
        └── v1/
            └── test_{resource}.py
```

### Schritt 2-7: [Generierungsschritte...]

### Zusammenfassung

```
══════════════════════════════════════════════════════════════
✅ ENDPOINT GENERIERT - {resource}
══════════════════════════════════════════════════════════════

📁 Erstellte Dateien:
- app/models/{resource}.py
- app/schemas/{resource}.py
- app/crud/{resource}.py
- app/api/v1/endpoints/{resource}.py
- app/tests/api/v1/test_{resource}.py

🔗 Verfügbare Endpoints:
- GET    /api/v1/{resource}s/     - Paginierte Liste
- POST   /api/v1/{resource}s/     - Erstellung
- GET    /api/v1/{resource}s/{id} - Detail
- PATCH  /api/v1/{resource}s/{id} - Aktualisierung
- DELETE /api/v1/{resource}s/{id} - Löschung

🔧 Nächste Schritte:
1. Router zu app/api/v1/api.py hinzufügen
2. Alembic-Migration erstellen
3. Tests ausführen: pytest app/tests/api/v1/test_{resource}.py
```
