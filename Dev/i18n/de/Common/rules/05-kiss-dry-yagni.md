# Prinzipien KISS, DRY, YAGNI

## Überblick

Die Prinzipien **KISS** (Keep It Simple, Stupid), **DRY** (Don't Repeat Yourself) und **YAGNI** (You Aren't Gonna Need It) sind **obligatorisch**, um einfachen, wartbaren und erweiterbaren Code zu gewährleisten.

> **Referenzen:**
> - `04-solid-principles.md` - Ergänzende SOLID-Prinzipien

---

## Inhaltsverzeichnis

1. [KISS - Keep It Simple, Stupid](#kiss---keep-it-simple-stupid)
2. [DRY - Don't Repeat Yourself](#dry---dont-repeat-yourself)
3. [YAGNI - You Aren't Gonna Need It](#yagni---you-arent-gonna-need-it)
4. [Häufige Anti-Patterns](#häufige-anti-patterns)
5. [Validierungs-Checkliste](#validierungs-checkliste)

---

## KISS - Keep It Simple, Stupid

### Definition

**Einfachheit muss ein zentrales Designziel sein. Komplexität muss vermieden werden.**

Der einfachste Code ist oft der beste Code.

### KISS-Regeln

1. **Kurze Methoden:** Maximal 20 Zeilen pro Methode
2. **Zyklomatische Komplexität:** Maximal 10 pro Methode
3. **Einrückungstiefe:** Maximal 3 Ebenen
4. **Parameter:** Maximal 4 Parameter pro Methode
5. **Klassen:** Maximal 200 Zeilen pro Klasse

### Anzeichen einer Verletzung

- Methoden mit mehr als 20 Zeilen
- Tiefe Verschachtelungsebenen (> 3)
- Kommentare, die erklären, was der Code tut
- Schwierigkeit, eine Funktion zu benennen (tut zu viele Dinge)
- Komplexe Tests mit viel Setup

### Anwendung

```
SCHLECHT - Komplexer Code
┌─────────────────────────────────────────────┐
│ calculatePrice(order):                      │
│   total = 0                                 │
│   for item in order.items:                  │
│     price = item.basePrice                  │
│     if item.category == "food":             │
│       if item.isOrganic:                    │
│         if item.weight > 1:                 │
│           price = price * 0.9               │
│         else:                               │
│           price = price * 0.95              │
│       else:                                 │
│         // ... 50 weitere Zeilen            │
│     // ... noch mehr Bedingungen            │
│   return total                              │
└─────────────────────────────────────────────┘

GUT - Zerlegter und einfacher Code
┌─────────────────────────────────────────────┐
│ PricingService:                             │
│   calculateTotal(order):                    │
│     return sum(                             │
│       calculateItemPrice(item)              │
│       for item in order.items               │
│     )                                       │
│                                             │
│ ItemPriceCalculator:                        │
│   calculate(item):                          │
│     basePrice = item.basePrice              │
│     return applyDiscounts(basePrice, item)  │
│                                             │
│ DiscountPolicy:                             │
│   apply(price, item): Money                 │
└─────────────────────────────────────────────┘
```

### Einfachheitsregeln

1. **Ein einziger Return pro Methode** (außer Early Returns für Validierung)
2. **Kein Else** wenn möglich (Early Returns, Guard Clauses)
3. **Aussagekräftige Benennung** (keine Kommentare nötig)
4. **Komposition > Vererbung**
5. **Standardmäßig Immutabilität**

### Early Returns (Guard Clauses)

```
SCHLECHT - Verschachtelte Else
function process(user):
  if user != null:
    if user.isActive:
      if user.hasPermission:
        // Geschäftslogik
      else:
        throw NoPermission
    else:
      throw Inactive
  else:
    throw NotFound

GUT - Early Returns
function process(user):
  if user == null:
    throw NotFound

  if not user.isActive:
    throw Inactive

  if not user.hasPermission:
    throw NoPermission

  // Geschäftslogik (keine Einrückung)
```

---

## DRY - Don't Repeat Yourself

### Definition

**Jedes Wissen muss eine einzige, eindeutige und maßgebliche Repräsentation im System haben.**

Duplizieren Sie nicht die Geschäftslogik, Validierungsregeln oder Algorithmen.

### Zu vermeidende Duplikationstypen

| Typ | Beschreibung | Lösung |
|-----|-------------|--------|
| **Logik** | Gleicher Code an mehreren Stellen | In eine Funktion/Klasse extrahieren |
| **Wissen** | Gleiche Geschäftsregeln neu definiert | Value Objects, Domain Services |
| **Strukturell** | Gleiche Patterns wiederholt | Abstraktionen, Templates |
| **Dokumentation** | Gleiche Infos in mehreren Formaten | Single Source of Truth |

### Anwendung

```
SCHLECHT - Duplizierte Validierung
┌─────────────────────────────────────────────┐
│ // Im Controller                            │
│ if not isValidEmail(email):                 │
│   throw InvalidEmail                        │
│                                             │
│ // Im Form                                  │
│ emailField.addConstraint(EmailConstraint)   │
│                                             │
│ // In der Entity                            │
│ @Assert.Email                               │
│ email: string                               │
│                                             │
│ // 3 Stellen mit der gleichen Regel!        │
└─────────────────────────────────────────────┘

GUT - Zentralisierte Validierung (Value Object)
┌─────────────────────────────────────────────┐
│ class Email:                                │
│   constructor(value):                       │
│     if not isValidEmail(value):             │
│       throw InvalidEmail(value)             │
│     this.value = value                      │
│                                             │
│ // Überall verwendet:                       │
│ // - Entity: email: Email                   │
│ // - Form: Transformation zu Email          │
│ // - Controller: empfängt Email             │
│                                             │
│ // EINE EINZIGE Wahrheitsquelle!            │
└─────────────────────────────────────────────┘
```

### Dreierregel

> **Nicht abstrahieren, bevor das Pattern 3 Mal gesehen wurde.**

```
// 1 Mal gesehen → kopieren
// 2 Mal gesehen → notieren
// 3 Mal gesehen → abstrahieren
```

### DRY vs WET (Write Everything Twice)

**Akzeptable Duplikation:**
- Ähnliche Struktur, aber verschiedene Typen (Type Safety)
- Testcode (Klarheit > DRY)
- Konfiguration pro Umgebung

**Zu vermeidende Duplikation:**
- Geschäftsregeln
- Validierung
- Algorithmen
- Berechnungen

---

## YAGNI - You Aren't Gonna Need It

### Definition

**Implementieren Sie keine Funktionalität, solange sie nicht benötigt wird.**

Programmieren Sie nicht für hypothetische zukünftige Bedürfnisse.

### Anzeichen einer Verletzung

- Code "für den Fall"
- Vorzeitige Abstraktionen
- Nicht angeforderte Funktionalitäten
- Unterstützung von Fällen, die noch nicht existieren
- Over-Engineering

### Anwendung

```
SCHLECHT - Over-Engineering
┌─────────────────────────────────────────────┐
│ ExportService:                              │
│   export(data, format):                     │
│     if format == "csv":                     │
│       // implementiert                      │
│     if format == "xml":                     │
│       // implementiert (nicht angefordert)   │
│     if format == "json":                    │
│       // implementiert (nicht angefordert)   │
│     if format == "pdf":                     │
│       // implementiert (nicht angefordert)   │
│     if format == "xlsx":                    │
│       // implementiert (nicht angefordert)   │
│                                             │
│ // Nur CSV ist erforderlich!                │
└─────────────────────────────────────────────┘

GUT - Nur das Nötige
┌─────────────────────────────────────────────┐
│ CsvExporter:                                │
│   export(data, filename):                   │
│     // Implementiert NUR CSV                │
│     // (das einzige erforderliche Format)   │
│                                             │
│ // Bei zukünftigem Bedarf: neue Klasse      │
│ // Ohne Bestehendes zu ändern (OCP)         │
└─────────────────────────────────────────────┘
```

### YAGNI-Checkliste

Bevor Sie eine Funktionalität hinzufügen, fragen Sie sich:

- [ ] **Ist es JETZT erforderlich?** (im aktuellen Ticket)
- [ ] **Ist es getestet?** (existierender Test, der fehlschlägt)
- [ ] **Ist es im MVP?** (definierter Scope)
- [ ] **Hat der Kunde es explizit angefordert?**

Wenn **NEIN** bei einer dieser Fragen → **YAGNI: Nicht implementieren**

### YAGNI vs Erweiterbarkeit

**Gutes Gleichgewicht:** Einfacher Code, ABER erweiterbar

```
Interface einfach, bei Bedarf erweiterbar
┌─────────────────────────────────────────────┐
│ interface ExportPolicy:                     │
│   export(data): bytes                       │
│                                             │
│ class CsvExporter implements ExportPolicy:  │
│   export(data): bytes                       │
│     // CSV-Implementierung                  │
│                                             │
│ // Bei zukünftigem Bedarf: PdfExporter      │
│ // Ohne CsvExporter zu ändern (OCP)         │
└─────────────────────────────────────────────┘
```

---

## Häufige Anti-Patterns

### 1. Premature Optimization

```
SCHLECHT
// Komplexer Cache bevor überhaupt ein Leistungsproblem besteht
class Repository:
  cache = {}
  cacheTimestamps = {}
  CACHE_TTL = 300

  find(id):
    if id in cache and not expired(id):
      return cache[id]
    // ... unnötige Komplexität

GUT
// Erst einfache Implementierung
class Repository:
  find(id):
    return database.find(id)

// Cache NUR hinzufügen, wenn Profiling ein Problem zeigt
```

### 2. Gold Plating

```
SCHLECHT - Nicht angeforderte Funktionalitäten
class Notifier:
  sendEmail()      // Erforderlich
  sendSms()        // Nicht angefordert
  sendPush()       // Nicht angefordert
  sendWhatsApp()   // Nicht angefordert

GUT - Nur das Nötige
class EmailNotifier:
  send()  // Nur E-Mail (erforderlich)
```

### 3. Speculative Generality

```
SCHLECHT - Internes generisches Framework
abstract class AbstractEntityManager
  abstract getEntityClass()
  findAll()
  findById()
  save()
  delete()
  // ... 50 generische Methoden

class UserManager extends AbstractEntityManager
  // ... für EINEN Anwendungsfall

GUT - Bestehende Tools verwenden
class UserRepository:
  find(id): User
    return orm.find(User, id)
```

### 4. Lasagna Code

```
SCHLECHT - Zu viele Schichten
interface FinderInterface
interface SearchInterface extends FinderInterface
interface QueryInterface extends SearchInterface
abstract class AbstractFinder implements QueryInterface
class BaseFinder extends AbstractFinder
class ConcreteFinder extends BaseFinder
// Um zu tun: finder.find(id)

GUT - Nur gerechtfertigte Schichten
interface RepositoryInterface    // Domain
class ConcreteRepository         // Infrastructure
// 2 Schichten reichen
```

---

## Validierungs-Checkliste

### Vor jedem Commit

#### KISS
- [ ] Methoden < 20 Zeilen
- [ ] Zyklomatische Komplexität < 10
- [ ] Einrückung max 3 Ebenen
- [ ] Parameter max 4 pro Methode
- [ ] Keine verschachtelten Else (Early Returns)
- [ ] Aussagekräftige Benennung (keine Kommentare nötig)

#### DRY
- [ ] Kein duplizierter Code (> 3 identische Zeilen)
- [ ] Zentralisierte Validierung (Value Objects)
- [ ] Geschäftsregeln an einem einzigen Ort
- [ ] Keine Wissensduplikation

#### YAGNI
- [ ] Funktionalität explizit angefordert
- [ ] Fehlschlagender Test existiert
- [ ] Im Scope des aktuellen Tickets
- [ ] Kein Code "für den Fall"
- [ ] Keine vorzeitige Abstraktion

### Zielmetriken

| Metrik | Ziel | Grenzwert |
|--------|------|-----------|
| Zeilen pro Methode | < 10 | < 20 |
| Zyklomatische Komplexität | < 5 | < 10 |
| Zeilen pro Klasse | < 150 | < 200 |
| Duplikation | 0% | < 3% |
| Testabdeckung | > 80% | > 70% |
| Abhängigkeiten pro Klasse | < 5 | < 7 |

---

## Ressourcen

- **Buch:** *The Pragmatic Programmer* - Andy Hunt & Dave Thomas
- **Buch:** *Clean Code* - Robert C. Martin
- **Artikel:** [KISS Principle](https://en.wikipedia.org/wiki/KISS_principle)
- **Artikel:** [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- **Artikel:** [YAGNI](https://martinfowler.com/bliki/Yagni.html)

---

**Datum der letzten Aktualisierung:** 2025-01
**Version:** 1.0.0
**Autor:** The Bearded CTO
