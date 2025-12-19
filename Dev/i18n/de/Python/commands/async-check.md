---
description: Python Async-Prüfung
argument-hint: [arguments]
---

# Python Async-Prüfung

## Argumente

$ARGUMENTS (optional: Pfad zur Analyse)

## MISSION

Analysieren Sie die Verwendung von asynchronem Code im Python-Projekt und identifizieren Sie Probleme mit async/await-Mustern, blockierenden Aufrufen und Leistungsproblemen.

### Schritt 1: Async-Funktionen identifizieren

```bash
# Alle async-Funktionen finden
rg "async def" --type py

# await-Verwendung finden
rg "await " --type py
```

Prüfen Sie:
- [ ] Async-Funktionen ordnungsgemäß deklariert
- [ ] Await für async-Aufrufe verwendet
- [ ] Kein blockierender Code in async-Funktionen
- [ ] Ordnungsgemäße Exception-Behandlung in async

### Schritt 2: Blockierende Aufrufe erkennen

```python
# Häufige blockierende Aufrufe, die in async vermieden werden sollten:
- time.sleep()        # asyncio.sleep() verwenden
- requests.get()      # httpx oder aiohttp verwenden
- open()              # aiofiles verwenden
- db.execute()        # Async-DB-Treiber verwenden
```

### Schritt 3: Async-Muster prüfen

```python
# Gute Muster
async def fetch_data(url: str) -> dict:
    async with httpx.AsyncClient() as client:
        response = await client.get(url)
        return response.json()

# Prüfen Sie:
- [ ] async with für Context Manager
- [ ] await für async-Operationen
- [ ] asyncio.gather() für gleichzeitige Aufgaben
- [ ] Ordnungsgemäße Fehlerbehandlung mit try/except
```

### Schritt 4: Bericht generieren

```
ASYNC-CODE-ANALYSE
=====================================

ASYNC-FUNKTIONEN: XX
AWAIT-ANWEISUNGEN: XX
BLOCKIERENDE AUFRUFE GEFUNDEN: XX

ERKANNTE PROBLEME:

1. Blockierender Aufruf in async-Funktion
   Datei: app/services/user.py:45
   Problem: time.sleep() statt asyncio.sleep() verwendet
   Behebung: Durch asyncio.sleep() ersetzen

2. Fehlendes await
   Datei: app/api/endpoints.py:78
   Problem: Async-Funktion ohne await aufgerufen
   Behebung: await-Schlüsselwort hinzufügen

EMPFEHLUNGEN:
- Blockierende Aufrufe durch async-Alternativen ersetzen
- asyncio.gather() für gleichzeitige Operationen verwenden
- Ordnungsgemäße Timeout-Behandlung hinzufügen
```
