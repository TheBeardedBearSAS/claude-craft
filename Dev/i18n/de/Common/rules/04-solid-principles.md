# SOLID-Prinzipien

## Überblick

Die SOLID-Prinzipien sind **obligatorisch** für den gesamten Projektcode. Diese Prinzipien garantieren wartbaren, testbaren und erweiterbaren Code.

> **Hinweis:** Dieses Dokument stellt die allgemeinen Prinzipien vor. Konsultieren Sie die technologiespezifischen Regeln für konkrete Beispiele.

---

## Inhaltsverzeichnis

1. [SRP - Single Responsibility Principle](#srp---single-responsibility-principle)
2. [OCP - Open/Closed Principle](#ocp---openclosed-principle)
3. [LSP - Liskov Substitution Principle](#lsp---liskov-substitution-principle)
4. [ISP - Interface Segregation Principle](#isp---interface-segregation-principle)
5. [DIP - Dependency Inversion Principle](#dip---dependency-inversion-principle)
6. [Validierungs-Checkliste](#validierungs-checkliste)

---

## SRP - Single Responsibility Principle

### Definition

**Eine Klasse darf nur einen einzigen Grund haben, sich zu ändern.**

Jede Klasse, Methode oder jedes Modul muss eine einzige und klar definierte Verantwortung haben.

### Anzeichen einer Verletzung

- Klasse mit "und" oder "oder" im Namen
- Methode, die mehrere nicht zusammenhängende Dinge tut
- Klasse, die schwer klar zu benennen ist
- Komplexe Tests, die viele Mocks erfordern

### Anwendung

```
SCHLECHT - Mehrere Verantwortlichkeiten
┌─────────────────────────────────────┐
│ OrderService                        │
├─────────────────────────────────────┤
│ - validateOrder()                   │
│ - calculatePrice()                  │
│ - saveToDatabase()                  │
│ - sendEmail()                       │
│ - generatePDF()                     │
└─────────────────────────────────────┘

GUT - Getrennte Verantwortlichkeiten
┌─────────────────┐  ┌─────────────────┐
│ OrderValidator  │  │ PricingService  │
├─────────────────┤  ├─────────────────┤
│ - validate()    │  │ - calculate()   │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ OrderRepository │  │ EmailNotifier   │
├─────────────────┤  ├─────────────────┤
│ - save()        │  │ - notify()      │
└─────────────────┘  └─────────────────┘
```

### Vorteile

- **Testbarkeit:** Jede Klasse kann isoliert getestet werden
- **Wartbarkeit:** Änderungen sind lokalisiert
- **Wiederverwendbarkeit:** Komponenten sind unabhängig
- **Lesbarkeit:** Jede Klasse hat ein klares Ziel

---

## OCP - Open/Closed Principle

### Definition

**Software-Entitäten müssen offen für Erweiterung, aber geschlossen für Modifikation sein.**

Man muss neue Funktionalitäten hinzufügen können, ohne bestehenden Code zu ändern.

### Anzeichen einer Verletzung

- Switch/Case auf Typen zur Bestimmung des Verhaltens
- Häufige Änderungen derselben Klasse
- Hinzufügen von Funktionalität = Änderung bestehenden Codes

### Anwendung

```
SCHLECHT - Änderung bestehenden Codes
┌─────────────────────────────────────┐
│ DiscountCalculator                  │
├─────────────────────────────────────┤
│ calculate(type):                    │
│   if type == "family":              │
│     return basePrice * 0.9          │
│   if type == "student":             │
│     return basePrice * 0.8          │
│   // Um "senior" hinzuzufügen →     │
│   // diese Klasse ändern            │
└─────────────────────────────────────┘

GUT - Erweiterung über Interfaces
┌─────────────────────────────────────┐
│ <<interface>>                       │
│ DiscountPolicy                      │
├─────────────────────────────────────┤
│ + apply(price): Money               │
│ + isApplicable(order): boolean      │
└─────────────────────────────────────┘
         △
         │
    ┌────┴────┬────────────┐
    │         │            │
┌───┴───┐ ┌───┴───┐ ┌──────┴──────┐
│Family │ │Student│ │SeniorPolicy │
│Policy │ │Policy │ │(neu)        │
└───────┘ └───────┘ └─────────────┘
```

### Strategy Pattern

Verwenden Sie das Strategy Pattern, um Erweiterung zu ermöglichen:

1. Ein Interface für das variable Verhalten definieren
2. Jede Variante in einer separaten Klasse implementieren
3. Implementierungen über Konfiguration injizieren

### Vorteile

- **Einfache Erweiterung:** Neue Funktionalitäten = neue Klassen
- **Stabilität:** Bestehender Code wird nicht geändert
- **Tests:** Keine Regression auf bestehendem Code
- **Erweiterbarkeit:** Hinzufügen von Funktionalitäten ohne Risiko

---

## LSP - Liskov Substitution Principle

### Definition

**Objekte einer abgeleiteten Klasse müssen die Objekte der Basisklasse ersetzen können, ohne die Konsistenz des Programms zu beeinträchtigen.**

Untertypen müssen durch ihre Basistypen substituierbar sein.

### Anzeichen einer Verletzung

- Unterklasse, die nicht dokumentierte Exceptions wirft
- Methode, die den konkreten Typ prüft, bevor sie handelt
- Override, das das erwartete Verhalten ändert
- Verstärkte Vorbedingungen oder abgeschwächte Nachbedingungen

### Regeln

1. **Vorbedingungen:** Nicht verstärken (mindestens genauso viel akzeptieren)
2. **Nachbedingungen:** Nicht abschwächen (mindestens genauso viel garantieren)
3. **Invarianten:** Invarianten des Elternteils beibehalten
4. **Historische Einschränkung:** Zustand nicht inkompatibel ändern

### Anwendung

```
SCHLECHT - Vertragsverletzung
┌─────────────────────────────────────┐
│ class Rectangle                     │
├─────────────────────────────────────┤
│ - width, height                     │
│ + setWidth(w)                       │
│ + setHeight(h)                      │
│ + area() = width * height           │
└─────────────────────────────────────┘
         △
         │
┌─────────────────────────────────────┐
│ class Square extends Rectangle     │
├─────────────────────────────────────┤
│ + setWidth(w):                      │
│     this.width = w                  │
│     this.height = w  // Verletzt LSP│
└─────────────────────────────────────┘

GUT - Verträge eingehalten
┌─────────────────────────────────────┐
│ <<interface>> Shape                 │
├─────────────────────────────────────┤
│ + area(): number                    │
└─────────────────────────────────────┘
         △
    ┌────┴────┐
    │         │
┌───┴───┐ ┌───┴───┐
│Rect.  │ │Square │
│w*h    │ │side²  │
└───────┘ └───────┘
```

### Vorteile

- **Sicherer Polymorphismus:** Substitutionen funktionieren immer
- **Klare Verträge:** Gut dokumentierte Interfaces
- **Vorhersehbarkeit:** Keine Überraschungen mit Untertypen
- **Testbarkeit:** Mocks respektieren die Verträge

---

## ISP - Interface Segregation Principle

### Definition

**Clients dürfen nicht von Interfaces abhängen, die sie nicht verwenden.**

Es ist besser, mehrere spezifische Interfaces zu haben als ein allgemeines Interface.

### Anzeichen einer Verletzung

- Interface mit vielen Methoden (> 5)
- Klassen, die leere Methoden implementieren
- Methoden, die `NotImplementedException` werfen
- Clients, die nur einen Teil des Interfaces verwenden

### Anwendung

```
SCHLECHT - Zu breites Interface
┌─────────────────────────────────────┐
│ <<interface>>                       │
│ UserRepository                      │
├─────────────────────────────────────┤
│ + find(id)                          │
│ + findAll()                         │
│ + save(user)                        │
│ + delete(user)                      │
│ + findByEmail(email)                │
│ + findByRole(role)                  │
│ + countByMonth(month)               │
│ + exportToCsv()                     │
│ + importFromCsv()                   │
│ + syncWithLDAP()                    │
└─────────────────────────────────────┘

GUT - Segregierte Interfaces
┌─────────────────┐  ┌─────────────────┐
│ UserFinder      │  │ UserPersister   │
├─────────────────┤  ├─────────────────┤
│ + find(id)      │  │ + save(user)    │
│ + findAll()     │  │ + delete(user)  │
└─────────────────┘  └─────────────────┘

┌─────────────────┐  ┌─────────────────┐
│ UserSearcher    │  │ UserExporter    │
├─────────────────┤  ├─────────────────┤
│ + byEmail()     │  │ + toCsv()       │
│ + byRole()      │  │ + fromCsv()     │
└─────────────────┘  └─────────────────┘
```

### Vorteile

- **Geringe Kopplung:** Clients hängen nur vom Minimum ab
- **Flexibilität:** Teilimplementierungen möglich
- **Testbarkeit:** Einfachere Mocks (weniger Methoden)
- **Erweiterbarkeit:** Hinzufügen von Interfaces ohne Auswirkung auf Bestehendes

---

## DIP - Dependency Inversion Principle

### Definition

**High-Level-Module dürfen nicht von Low-Level-Modulen abhängen. Beide müssen von Abstraktionen abhängen.**

**Abstraktionen dürfen nicht von Details abhängen. Details müssen von Abstraktionen abhängen.**

### Anzeichen einer Verletzung

- Direkte Instanziierung von Abhängigkeiten (`new ConcreteClass()`)
- Import von Infrastructure-Klassen in der Geschäftsschicht
- Starke Kopplung an ein Framework oder eine Bibliothek
- Tests, die ohne echte Datenbank schwer zu schreiben sind

### Anwendung

```
SCHLECHT - Abhängigkeit von Implementierungen
┌─────────────────────────────────────┐
│ OrderService                        │
├─────────────────────────────────────┤
│ - MySQLOrderRepository              │
│ - SmtpMailer                        │
│ - StripePaymentGateway              │
└─────────────────────────────────────┘
     │
     ▼ Hängt ab von
┌─────────────────────────────────────┐
│ Konkrete Infrastruktur              │
└─────────────────────────────────────┘

GUT - Abhängigkeit von Abstraktionen
┌─────────────────────────────────────┐
│ OrderService (Application Layer)    │
├─────────────────────────────────────┤
│ - OrderRepositoryInterface          │
│ - MailerInterface                   │
│ - PaymentGatewayInterface           │
└─────────────────────────────────────┘
     │
     ▼ Hängt ab von
┌─────────────────────────────────────┐
│ Interfaces (Domain Layer)           │
└─────────────────────────────────────┘
     △
     │ Implementiert von
┌─────────────────────────────────────┐
│ MySQL, Smtp, Stripe (Infra Layer)   │
└─────────────────────────────────────┘
```

### Schichtenarchitektur

```
┌─────────────────────────────────────────────┐
│         PRESENTATION (UI/API)               │
│   Controllers, Commands, Forms              │
├─────────────────────────────────────────────┤
│         APPLICATION (Use Cases)             │
│   Services, die die Logik orchestrieren     │
│               │                             │
│       Hängt ab von (Interfaces)             │
├─────────────────────────────────────────────┤
│            DOMAIN (Business)                │
│   Entitäten, Value Objects, Interfaces      │
│               △                             │
│       Implementiert von (Inversion)         │
├─────────────────────────────────────────────┤
│       INFRASTRUCTURE (Technik)              │
│   Repositories, Mailers, Gateways           │
└─────────────────────────────────────────────┘

Die oberen Schichten hängen von Abstraktionen ab
Die unteren Schichten implementieren diese Abstraktionen
Die Geschäftslogik ist von technischen Details isoliert
```

### Vorteile

- **Testbarkeit:** Mocks und Stubs einfach zu erstellen
- **Flexibilität:** Implementierungswechsel ohne Auswirkung
- **Isolation:** Geschäftslogik hängt nicht von der Infrastruktur ab
- **Wiederverwendbarkeit:** Abstraktionen sind wiederverwendbar

---

## Validierungs-Checkliste

### Vor jedem Commit

#### SRP
- [ ] Jede Klasse hat eine einzige klar definierte Verantwortung
- [ ] Methoden tun eine einzige Sache (< 20 Zeilen)
- [ ] Keine Methoden mit "und" oder "oder" im Namen

#### OCP
- [ ] Neue Funktionalitäten durch Erweiterung hinzugefügt, nicht durch Modifikation
- [ ] Verwendung von Interfaces und Strategy Patterns
- [ ] Kein Switch/If auf Typen zur Bestimmung des Verhaltens

#### LSP
- [ ] Untertypen respektieren die Verträge ihrer Eltern
- [ ] Keine verstärkten Vorbedingungen in Unterklassen
- [ ] Keine abgeschwächten Nachbedingungen in Unterklassen
- [ ] Keine neuen nicht dokumentierten Exceptions

#### ISP
- [ ] Interfaces sind klein und fokussiert (< 5 Methoden)
- [ ] Clients hängen nur von den Methoden ab, die sie verwenden
- [ ] Keine Methoden `throw NotImplementedException()`

#### DIP
- [ ] Use Cases hängen von Interfaces ab, nicht von Implementierungen
- [ ] Interfaces sind in der Domain, nicht in der Infrastruktur
- [ ] Dependency Injection über Konstruktor

---

## Ressourcen

- **Buch:** *Clean Architecture* - Robert C. Martin
- **Buch:** *SOLID Principles* - Uncle Bob
- **Video:** [SOLID Principles Explained](https://www.youtube.com/watch?v=pTB30aXS77U)

---

**Datum der letzten Aktualisierung:** 2025-01
**Version:** 1.0.0
**Autor:** The Bearded CTO
