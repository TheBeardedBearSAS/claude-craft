# Principes KISS, DRY, YAGNI

## Vue d'ensemble

Les principes **KISS** (Keep It Simple, Stupid), **DRY** (Don't Repeat Yourself) et **YAGNI** (You Aren't Gonna Need It) sont **obligatoires** pour maintenir un code simple, maintenable et évolutif.

> **Références:**
> - `04-solid-principles.md` - Principes SOLID complémentaires

---

## Table des matières

1. [KISS - Keep It Simple, Stupid](#kiss---keep-it-simple-stupid)
2. [DRY - Don't Repeat Yourself](#dry---dont-repeat-yourself)
3. [YAGNI - You Aren't Gonna Need It](#yagni---you-arent-gonna-need-it)
4. [Anti-patterns courants](#anti-patterns-courants)
5. [Checklist de validation](#checklist-de-validation)

---

## KISS - Keep It Simple, Stupid

### Définition

**La simplicité doit être un objectif clé de la conception. La complexité doit être évitée.**

Le code le plus simple est souvent le meilleur code.

### Règles KISS

1. **Méthodes courtes:** Cible < 10 lignes, limite maximale 20 lignes par méthode
2. **Complexité cyclomatique:** Maximum 10 par méthode
3. **Profondeur d'indentation:** Maximum 3 niveaux
4. **Paramètres:** Maximum 4 paramètres par méthode
5. **Classes:** Maximum 200 lignes par classe

### Signes de violation

- Méthodes de plus de 20 lignes
- Niveaux d'imbrication profonds (> 3)
- Commentaires expliquant ce que fait le code
- Difficulté à nommer une fonction (fait trop de choses)
- Tests complexes avec beaucoup de setup

### Application

```
❌ MAUVAIS - Code complexe
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
│         // ... 50 lignes de plus            │
│     // ... encore plus de conditions        │
│   return total                              │
└─────────────────────────────────────────────┘

✅ BON - Code décomposé et simple
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

### Règles de simplicité

1. **Un seul return par méthode** (sauf early returns pour validation)
2. **Pas de else** quand possible (early returns, guard clauses)
3. **Nommage explicite** (pas besoin de commentaires)
4. **Composition > Héritage**
5. **Immutabilité par défaut**

### Early Returns (Guard Clauses)

```
❌ MAUVAIS - Else imbriqués
function process(user):
  if user != null:
    if user.isActive:
      if user.hasPermission:
        // logique métier
      else:
        throw NoPermission
    else:
      throw Inactive
  else:
    throw NotFound

✅ BON - Early returns
function process(user):
  if user == null:
    throw NotFound

  if not user.isActive:
    throw Inactive

  if not user.hasPermission:
    throw NoPermission

  // logique métier (pas d'indentation)
```

---

## DRY - Don't Repeat Yourself

### Définition

**Chaque connaissance doit avoir une représentation unique, non ambiguë et faisant autorité dans le système.**

Ne dupliquez pas la logique métier, les règles de validation ou les algorithmes.

### Types de duplication à éviter

| Type | Description | Solution |
|------|-------------|----------|
| **Logique** | Même code à plusieurs endroits | Extraire dans une fonction/classe |
| **Connaissance** | Mêmes règles métier redéfinies | Value Objects, Domain Services |
| **Structurelle** | Mêmes patterns répétés | Abstractions, Templates |
| **Documentation** | Mêmes infos en plusieurs formats | Single Source of Truth |

### Application

```
❌ MAUVAIS - Validation dupliquée
┌─────────────────────────────────────────────┐
│ // Dans le Controller                       │
│ if not isValidEmail(email):                 │
│   throw InvalidEmail                        │
│                                             │
│ // Dans le Form                             │
│ emailField.addConstraint(EmailConstraint)   │
│                                             │
│ // Dans l'Entity                            │
│ @Assert.Email                               │
│ email: string                               │
│                                             │
│ // 3 endroits avec la même règle !          │
└─────────────────────────────────────────────┘

✅ BON - Validation centralisée (Value Object)
┌─────────────────────────────────────────────┐
│ class Email:                                │
│   constructor(value):                       │
│     if not isValidEmail(value):             │
│       throw InvalidEmail(value)             │
│     this.value = value                      │
│                                             │
│ // Utilisé partout:                         │
│ // - Entity: email: Email                   │
│ // - Form: transforme en Email              │
│ // - Controller: reçoit Email               │
│                                             │
│ // UNE SEULE source de vérité !             │
└─────────────────────────────────────────────┘
```

### Règle des 3

> **Ne pas abstraire avant d'avoir vu le pattern 3 fois.**

```
// Vu 1 fois → copier
// Vu 2 fois → noter
// Vu 3 fois → abstraire
```

### DRY vs WET (Write Everything Twice)

**Duplication acceptable:**
- Structure similaire mais types différents (type safety)
- Code de test (clarté > DRY)
- Configuration par environnement

**Duplication à éviter:**
- Règles métier
- Validation
- Algorithmes
- Calculs

---

## YAGNI - You Aren't Gonna Need It

### Définition

**N'implémentez pas de fonctionnalité tant qu'elle n'est pas nécessaire.**

Ne codez pas pour des besoins hypothétiques futurs.

### Signes de violation

- Code "au cas où"
- Abstractions prématurées
- Fonctionnalités non demandées
- Support de cas qui n'existent pas encore
- Over-engineering

### Application

```
❌ MAUVAIS - Over-engineering
┌─────────────────────────────────────────────┐
│ ExportService:                              │
│   export(data, format):                     │
│     if format == "csv":                     │
│       // implémenté                         │
│     if format == "xml":                     │
│       // implémenté (pas demandé)           │
│     if format == "json":                    │
│       // implémenté (pas demandé)           │
│     if format == "pdf":                     │
│       // implémenté (pas demandé)           │
│     if format == "xlsx":                    │
│       // implémenté (pas demandé)           │
│                                             │
│ // Seul CSV est requis !                    │
└─────────────────────────────────────────────┘

✅ BON - Juste ce qui est nécessaire
┌─────────────────────────────────────────────┐
│ CsvExporter:                                │
│   export(data, filename):                   │
│     // Implémente UNIQUEMENT CSV            │
│     // (le seul format requis)              │
│                                             │
│ // Si besoin futur: nouvelle classe         │
│ // Sans modifier l'existant (OCP)           │
└─────────────────────────────────────────────┘
```

### Checklist YAGNI

Avant d'ajouter une fonctionnalité, demandez-vous:

- [ ] **Est-ce requis MAINTENANT?** (dans le ticket actuel)
- [ ] **Est-ce testé?** (test existant qui échoue)
- [ ] **Est-ce dans le MVP?** (scope défini)
- [ ] **Le client l'a-t-il demandé explicitement?**

Si **NON** à l'une de ces questions → **YAGNI: Ne pas implémenter**

### YAGNI vs Extensibilité

**Bon équilibre:** Code simple MAIS extensible

```
✅ Interface simple, extensible si besoin
┌─────────────────────────────────────────────┐
│ interface ExportPolicy:                     │
│   export(data): bytes                       │
│                                             │
│ class CsvExporter implements ExportPolicy:  │
│   export(data): bytes                       │
│     // Implémentation CSV                   │
│                                             │
│ // Si besoin futur: PdfExporter             │
│ // Sans modifier CsvExporter (OCP)          │
└─────────────────────────────────────────────┘
```

---

## Anti-patterns courants

### 1. Premature Optimization

```
❌ MAUVAIS
// Cache complexe avant même d'avoir un problème de perf
class Repository:
  cache = {}
  cacheTimestamps = {}
  CACHE_TTL = 300

  find(id):
    if id in cache and not expired(id):
      return cache[id]
    // ... complexité inutile

✅ BON
// Implémentation simple d'abord
class Repository:
  find(id):
    return database.find(id)

// Cache ajouté SEULEMENT si profiling montre un problème
```

### 2. Gold Plating

```
❌ MAUVAIS - Fonctionnalités non demandées
class Notifier:
  sendEmail()      // ✅ Requis
  sendSms()        // ❌ Pas demandé
  sendPush()       // ❌ Pas demandé
  sendWhatsApp()   // ❌ Pas demandé

✅ BON - Juste ce qui est nécessaire
class EmailNotifier:
  send()  // ✅ Uniquement email (requis)
```

### 3. Speculative Generality

```
❌ MAUVAIS - Framework interne générique
abstract class AbstractEntityManager
  abstract getEntityClass()
  findAll()
  findById()
  save()
  delete()
  // ... 50 méthodes génériques

class UserManager extends AbstractEntityManager
  // ... pour UN cas d'utilisation

✅ BON - Utiliser les outils existants
class UserRepository:
  find(id): User
    return orm.find(User, id)
```

### 4. Lasagna Code

```
❌ MAUVAIS - Trop de couches
interface FinderInterface
interface SearchInterface extends FinderInterface
interface QueryInterface extends SearchInterface
abstract class AbstractFinder implements QueryInterface
class BaseFinder extends AbstractFinder
class ConcreteFinder extends BaseFinder
// Pour faire: finder.find(id) 😱

✅ BON - Couches justifiées uniquement
interface RepositoryInterface    // Domain
class ConcreteRepository         // Infrastructure
// 2 couches suffisent
```

---

## Checklist de validation

### Avant chaque commit

#### KISS
- [ ] Méthodes < 10 lignes (limite 20)
- [ ] Complexité cyclomatique < 10
- [ ] Indentation max 3 niveaux
- [ ] Paramètres max 4 par méthode
- [ ] Pas de else imbriqués (early returns)
- [ ] Nommage explicite (pas de commentaires nécessaires)

#### DRY
- [ ] Pas de code dupliqué (> 3 lignes identiques)
- [ ] Validation centralisée (Value Objects)
- [ ] Règles métier en un seul endroit
- [ ] Pas de duplication de connaissance

#### YAGNI
- [ ] Fonctionnalité demandée explicitement
- [ ] Test qui échoue existe
- [ ] Dans le scope du ticket actuel
- [ ] Pas de code "au cas où"
- [ ] Pas d'abstraction prématurée

### Métriques cibles

| Métrique | Cible | Limite |
|----------|-------|--------|
| Lignes par méthode | < 10 | < 20 |
| Complexité cyclomatique | < 5 | < 10 |
| Complexité cognitive | < 7 | < 10 |
| Lignes par classe | < 150 | < 200 |
| Duplication | 0% | < 3% |
| Couverture tests | > 80% | > 70% |
| Dépendances par classe | < 5 | < 7 |

> Les seuils de Cognitive Complexity (SonarQube S3776) < 7 / < 10 sont un choix interne, volontairement plus strict que le défaut de Sonar (15 par fonction) ; à relâcher si le contexte de l'équipe l'exige.

---

## Ressources

- **Livre:** *The Pragmatic Programmer* - Andy Hunt & Dave Thomas
- **Livre:** *Clean Code* - Robert C. Martin
- **Article:** [KISS Principle](https://en.wikipedia.org/wiki/KISS_principle)
- **Article:** [DRY Principle](https://en.wikipedia.org/wiki/Don%27t_repeat_yourself)
- **Article:** [YAGNI](https://martinfowler.com/bliki/Yagni.html)

---

**Date de dernière mise à jour:** 2025-01
**Version:** 1.0.0
**Auteur:** The Bearded CTO
