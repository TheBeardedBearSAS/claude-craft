# Principes SOLID

## Vue d'ensemble

Les principes SOLID sont **obligatoires** pour tout le code du projet. Ces principes garantissent un code maintenable, testable et évolutif.

> **Note:** Ce document présente les principes généraux. Consultez les règles spécifiques à votre technologie pour des exemples concrets.

---

## Table des matières

1. [SRP - Single Responsibility Principle](#srp---single-responsibility-principle)
2. [OCP - Open/Closed Principle](#ocp---openclosed-principle)
3. [LSP - Liskov Substitution Principle](#lsp---liskov-substitution-principle)
4. [ISP - Interface Segregation Principle](#isp---interface-segregation-principle)
5. [DIP - Dependency Inversion Principle](#dip---dependency-inversion-principle)
6. [Checklist de validation](#checklist-de-validation)

---

## SRP - Single Responsibility Principle

### Définition

**Une classe ne doit avoir qu'une seule raison de changer.**

Chaque classe, méthode ou module doit avoir une responsabilité unique et bien définie.

### Signes de violation

- Classe avec "and" ou "or" dans le nom
- Méthode qui fait plusieurs choses non liées
- Classe difficile à nommer clairement
- Tests complexes nécessitant beaucoup de mocks

### Application

```
❌ MAUVAIS - Multiple responsabilités
┌─────────────────────────────────────┐
│ OrderService                        │
├─────────────────────────────────────┤
│ - validateOrder()                   │
│ - calculatePrice()                  │
│ - saveToDatabase()                  │
│ - sendEmail()                       │
│ - generatePDF()                     │
└─────────────────────────────────────┘

✅ BON - Responsabilités séparées
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

### Avantages

- ✅ **Testabilité:** Chaque classe peut être testée isolément
- ✅ **Maintenabilité:** Les changements sont localisés
- ✅ **Réutilisabilité:** Les composants sont indépendants
- ✅ **Lisibilité:** Chaque classe a un objectif clair

---

## OCP - Open/Closed Principle

### Définition

**Les entités logicielles doivent être ouvertes à l'extension mais fermées à la modification.**

On doit pouvoir ajouter de nouvelles fonctionnalités sans modifier le code existant.

### Signes de violation

- Switch/case sur des types pour déterminer le comportement
- Modifications fréquentes d'une même classe
- Ajout de fonctionnalité = modification de code existant

### Application

```
❌ MAUVAIS - Modification du code existant
┌─────────────────────────────────────┐
│ DiscountCalculator                  │
├─────────────────────────────────────┤
│ calculate(type):                    │
│   if type == "family":              │
│     return basePrice * 0.9          │
│   if type == "student":             │
│     return basePrice * 0.8          │
│   // Pour ajouter "senior" →        │
│   // modifier cette classe          │
└─────────────────────────────────────┘

✅ BON - Extension via interfaces
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
│Policy │ │Policy │ │(nouvelle)   │
└───────┘ └───────┘ └─────────────┘
```

### Pattern Strategy

Utilisez le pattern Strategy pour permettre l'extension:

1. Définir une interface pour le comportement variable
2. Implémenter chaque variante dans une classe séparée
3. Injecter les implémentations via configuration

### Avantages

- ✅ **Extension facile:** Nouvelles fonctionnalités = nouvelles classes
- ✅ **Stabilité:** Le code existant n'est pas modifié
- ✅ **Tests:** Pas de régression sur le code existant
- ✅ **Évolutivité:** Ajout de fonctionnalités sans risque

---

## LSP - Liskov Substitution Principle

### Définition

**Les objets d'une classe dérivée doivent pouvoir remplacer les objets de la classe de base sans altérer la cohérence du programme.**

Les sous-types doivent être substituables à leurs types de base.

### Signes de violation

- Sous-classe qui lève des exceptions non documentées
- Méthode qui vérifie le type concret avant d'agir
- Override qui change le comportement attendu
- Préconditions renforcées ou postconditions affaiblies

### Règles

1. **Préconditions:** Ne pas renforcer (accepter au moins autant)
2. **Postconditions:** Ne pas affaiblir (garantir au moins autant)
3. **Invariants:** Maintenir les invariants du parent
4. **Contrainte historique:** Ne pas modifier l'état de manière incompatible

### Application

```
❌ MAUVAIS - Violation du contrat
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
│     this.height = w  // ❌ Viole LSP│
└─────────────────────────────────────┘

✅ BON - Contrats respectés
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

### Avantages

- ✅ **Polymorphisme sûr:** Les substitutions fonctionnent toujours
- ✅ **Contrats clairs:** Interfaces bien documentées
- ✅ **Prévisibilité:** Pas de surprises avec les sous-types
- ✅ **Testabilité:** Les mocks respectent les contrats

---

## ISP - Interface Segregation Principle

### Définition

**Les clients ne doivent pas dépendre d'interfaces qu'ils n'utilisent pas.**

Il vaut mieux plusieurs interfaces spécifiques qu'une interface générale.

### Signes de violation

- Interface avec beaucoup de méthodes (> 5)
- Classes qui implémentent des méthodes vides
- Méthodes qui lèvent `NotImplementedException`
- Clients qui n'utilisent qu'une partie de l'interface

### Application

```
❌ MAUVAIS - Interface trop large
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

✅ BON - Interfaces ségrégées
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

### Avantages

- ✅ **Couplage faible:** Les clients dépendent du minimum nécessaire
- ✅ **Flexibilité:** Implémentations partielles possibles
- ✅ **Testabilité:** Mocks plus simples (moins de méthodes)
- ✅ **Évolutivité:** Ajout d'interfaces sans impacter l'existant

---

## DIP - Dependency Inversion Principle

### Définition

**Les modules de haut niveau ne doivent pas dépendre des modules de bas niveau. Les deux doivent dépendre d'abstractions.**

**Les abstractions ne doivent pas dépendre des détails. Les détails doivent dépendre des abstractions.**

### Signes de violation

- Instanciation directe de dépendances (`new ConcreteClass()`)
- Import de classes d'infrastructure dans la couche métier
- Couplage fort avec un framework ou une bibliothèque
- Tests difficiles à écrire sans base de données réelle

### Application

```
❌ MAUVAIS - Dépendance aux implémentations
┌─────────────────────────────────────┐
│ OrderService                        │
├─────────────────────────────────────┤
│ - MySQLOrderRepository              │
│ - SmtpMailer                        │
│ - StripePaymentGateway              │
└─────────────────────────────────────┘
     │
     ▼ Dépend de
┌─────────────────────────────────────┐
│ Infrastructure concrète             │
└─────────────────────────────────────┘

✅ BON - Dépendance aux abstractions
┌─────────────────────────────────────┐
│ OrderService (Application Layer)    │
├─────────────────────────────────────┤
│ - OrderRepositoryInterface          │
│ - MailerInterface                   │
│ - PaymentGatewayInterface           │
└─────────────────────────────────────┘
     │
     ▼ Dépend de
┌─────────────────────────────────────┐
│ Interfaces (Domain Layer)           │
└─────────────────────────────────────┘
     △
     │ Implémenté par
┌─────────────────────────────────────┐
│ MySQL, Smtp, Stripe (Infra Layer)   │
└─────────────────────────────────────┘
```

### Architecture en couches

```
┌─────────────────────────────────────────────┐
│         PRESENTATION (UI/API)               │
│   Controllers, Commands, Forms              │
├─────────────────────────────────────────────┤
│         APPLICATION (Use Cases)             │
│   Services orchestrant la logique           │
│               │                             │
│       Dépend de (Interfaces)                │
├─────────────────────────────────────────────┤
│            DOMAIN (Business)                │
│   Entités, Value Objects, Interfaces        │
│               △                             │
│       Implémenté par (Inversion)            │
├─────────────────────────────────────────────┤
│       INFRASTRUCTURE (Technique)            │
│   Repositories, Mailers, Gateways           │
└─────────────────────────────────────────────┘

✅ Les couches hautes dépendent d'abstractions
✅ Les couches basses implémentent ces abstractions
✅ La logique métier est isolée des détails techniques
```

### Avantages

- ✅ **Testabilité:** Mocks et stubs faciles à créer
- ✅ **Flexibilité:** Changement d'implémentation sans impact
- ✅ **Isolation:** La logique métier ne dépend pas de l'infrastructure
- ✅ **Réutilisabilité:** Les abstractions sont réutilisables

---

## Checklist de validation

### Avant chaque commit

#### SRP
- [ ] Chaque classe a une seule responsabilité clairement définie
- [ ] Les méthodes font une seule chose (< 20 lignes)
- [ ] Pas de méthodes avec "et" ou "ou" dans le nom

#### OCP
- [ ] Nouvelles fonctionnalités ajoutées par extension, pas modification
- [ ] Utilisation d'interfaces et de patterns Strategy
- [ ] Pas de switch/if sur des types pour déterminer le comportement

#### LSP
- [ ] Les sous-types respectent les contrats de leurs parents
- [ ] Pas de préconditions renforcées dans les sous-classes
- [ ] Pas de postconditions affaiblies dans les sous-classes
- [ ] Pas d'exceptions nouvelles non documentées

#### ISP
- [ ] Les interfaces sont petites et focalisées (< 5 méthodes)
- [ ] Les clients ne dépendent que des méthodes qu'ils utilisent
- [ ] Pas de méthodes `throw NotImplementedException()`

#### DIP
- [ ] Les use cases dépendent d'interfaces, pas d'implémentations
- [ ] Les interfaces sont dans le domaine, pas l'infrastructure
- [ ] Injection de dépendances via constructeur

---

## Ressources

- **Livre:** *Clean Architecture* - Robert C. Martin
- **Livre:** *SOLID Principles* - Uncle Bob
- **Vidéo:** [SOLID Principles Explained](https://www.youtube.com/watch?v=pTB30aXS77U)

---

**Date de dernière mise à jour:** 2025-01
**Version:** 1.0.0
**Auteur:** The Bearded CTO
