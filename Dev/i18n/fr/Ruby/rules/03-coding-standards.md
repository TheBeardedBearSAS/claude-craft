# Standards de Code Ruby

## Vue d'ensemble

Standards pour le code Ruby 4.0 dans les applications Rails 8.1. Le Ruby Style Guide de la communauté et RuboCop font autorité ; ce document résume les règles du projet et le raisonnement qui les sous-tend.

## En-tête de fichier obligatoire

```ruby
# frozen_string_literal: true
```

Chaque fichier Ruby commence par ce commentaire magique (imposé par `Style/FrozenStringLiteralComment`). Les chaînes deviennent immuables par défaut, ce qui évite les mutations accidentelles et réduit les allocations. Utiliser `+""` ou `String.new` pour un tampon modifiable.

---

## Conventions de nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| Fichiers | `snake_case.rb`, correspondant à la constante | `order_item.rb` -> `OrderItem` |
| Classes, modules | `PascalCase` | `OrderItem`, `Payments::Gateway` |
| Méthodes, variables | `snake_case` | `calculate_total`, `line_items` |
| Constantes | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES` |
| Prédicats | Se terminent par `?`, retournent un booléen | `paid?`, `empty?` |
| Méthodes dangereuses | Se terminent par `!`, une contrepartie sûre doit exister | `save!`, `archive!` |
| Setters | `name=` | `def status=(value)` |
| Variables inutilisées | Préfixer par `_` | `_index` |
| Booléens | Ne pas préfixer par `is_` | `active?` et non `is_active?` |

```ruby
# MAUVAIS
class order_item
  def getTotal; end
  def is_paid; end
end

# BON
class OrderItem
  def total; end
  def paid?; end
end
```

Éviter les préfixes `get_`/`set_` : Ruby utilise de simples lecteurs et des écrivains `name=`.

---

## Formatage

| Règle | Valeur |
|-------|--------|
| Indentation | 2 espaces, pas de tabulations |
| Longueur de ligne | 120 caractères maximum |
| Espaces en fin de ligne | Aucun |
| Retour à la ligne final | Requis |
| Guillemets | Guillemets doubles par défaut (rubocop-rails-omakase) |
| Syntaxe de hash | `{ key: value }` avec des espaces à l'intérieur des accolades |
| Parenthèses d'appel de méthode | Omises pour les appels de DSL (`validates`, `has_many`, `puts`) ; utilisées pour les autres |
| Virgules finales | Autorisées dans les littéraux multi-lignes |

```ruby
# BON
user = User.create!(
  name: "Alice",
  email_address: "alice@example.com",
  role: :admin,
)
```

Lancer `docker compose exec app bin/rubocop -a` pour corriger automatiquement les offenses sûres.

---

## Méthodes

### Taille et complexité (KISS)

| Métrique | Cible | Limite |
|----------|-------|--------|
| Lignes par méthode | < 10 | < 20 |
| Paramètres | 3 | 4 maximum (utiliser des arguments nommés) |
| Complexité cognitive | < 7 | < 10 |
| Profondeur d'imbrication | 2 | 3 maximum |

### Clauses de garde

```ruby
# MAUVAIS : conditions imbriquées
def discount(user)
  if user
    if user.premium?
      0.2
    else
      0
    end
  else
    0
  end
end

# BON : clauses de garde
def discount(user)
  return 0 if user.nil?
  return 0 unless user.premium?

  0.2
end
```

### Arguments nommés

```ruby
# MAUVAIS : booléens positionnels
send_invoice(order, true, false)

# BON : arguments nommés
send_invoice(order, notify_customer: true, attach_pdf: false)
```

### Méthodes endless

À utiliser uniquement pour des lecteurs à expression unique :

```ruby
def full_name = "#{first_name} #{last_name}"
```

### Transfert d'arguments

```ruby
def self.call(...) = new(...).call
```

### Bloc implicite et It

Ruby 3.4+ fournit `it` comme paramètre de bloc implicite pour les blocs à un argument :

```ruby
users.map { it.name }
users.map(&:name)  # toujours préféré lorsqu'une référence de méthode suffit
```

---

## Conditionnelles

```ruby
# Préférer les modificateurs pour les corps d'une ligne
return if order.nil?

# Préférer unless uniquement pour des négations simples, jamais avec else
send_reminder unless user.opted_out?

# MAUVAIS
unless user.active?
  deactivate
else
  activate
end

# BON
if user.active?
  activate
else
  deactivate
end
```

- Ne jamais utiliser `and`/`or` pour le flux de contrôle ; utiliser `&&`/`||`
- Éviter le ternaire pour des expressions imbriquées
- Utiliser `case` avec `then` pour les correspondances plates

### Pattern matching

```ruby
case response
in { status: 200, body: { data: [first, *] } }
  handle(first)
in { status: 404 }
  nil
in { status: 500.. => code }
  raise ServerError, code
end
```

Utiliser le pattern matching pour des données structurées (JSON parsé, objets `Data`). Ne pas l'utiliser là où un `if` suffit.

---

## Collections et Enumerable

```ruby
# MAUVAIS
total = 0
items.each { |i| total += i.price }

# BON
total = items.sum(&:price)

# Préférer
items.select(&:available?).map(&:name)
items.filter_map { |i| i.name if i.available? }
items.each_with_object({}) { |i, h| h[i.id] = i }
items.group_by(&:category)
items.partition(&:available?)
```

- Préférer `find_each` / `in_batches` à `each` sur de grosses relations Active Record
- Préférer `pluck`/`ids` à `map(&:id)` sur les relations
- Préférer `exists?` à `count > 0` ; `any?` sur les collections déjà chargées
- Éviter de muter les arguments

---

## Chaînes et symboles

```ruby
# Interpolation plutôt que concaténation
"Hello, #{user.name}"

# Heredocs avec indentation squiggly
message = <<~TEXT
  Dear #{user.name},
  Your order #{order.id} shipped.
TEXT

# Symboles pour les identifiants, chaînes pour les données
status = :pending
```

---

## Classes et modules

### Value objects avec Data

```ruby
# frozen_string_literal: true

Money = Data.define(:cents, :currency) do
  def initialize(cents:, currency: "EUR")
    raise ArgumentError, "cents must be an Integer" unless cents.is_a?(Integer)

    super
  end

  def +(other)
    raise ArgumentError, "currency mismatch" unless currency == other.currency

    with(cents: cents + other.cents)
  end

  def to_s = format("%.2f %s", cents / 100.0, currency)
end
```

`Data.define` produit des value objects immuables avec construction par arguments nommés. Le préférer à `Struct` pour le nouveau code.

### Visibilité

```ruby
class ReportBuilder
  def call
    header + body
  end

  private

  def header = "..."
  def body = "..."
end
```

- API publique d'abord, section `private` en dernier
- Utiliser `private` pour les helpers ; éviter `protected` sauf pour comparer des instances
- Préférer la composition et les modules à l'héritage profond (2 niveaux maximum au-delà de `ApplicationRecord`/`ApplicationController`)

### Espaces de noms de modules

```ruby
# MAUVAIS : le style compact masque les parents manquants
class Orders::Checkout; end

# BON : style imbriqué, les constantes se résolvent de façon prévisible
module Orders
  class Checkout; end
end
```

Zeitwerk accepte les deux ; le style imbriqué est la convention du projet.

---

## Gestion des erreurs

```ruby
# MAUVAIS
begin
  charge(order)
rescue Exception
  nil
end

# MAUVAIS : rescue silencieux
rescue => e
end

# BON : rescue précis, contexte, re-levée ou résultat géré
begin
  gateway.charge!(order)
rescue Payments::Declined => e
  Rails.logger.warn("payment declined order=#{order.id} reason=#{e.message}")
  Result.failure(e.message)
end
```

Règles :
- Jamais de `rescue Exception`
- Définir les erreurs du domaine sous un espace de noms de module héritant de `StandardError`
- Utiliser `raise` pour les conditions exceptionnelles, des valeurs de retour pour les échecs attendus
- Dans les contrôleurs, faire correspondre les exceptions avec `rescue_from`
- Utiliser `ensure` pour le nettoyage ; préférer les formes à bloc (`File.open`, `transaction`)

```ruby
module Payments
  class Error < StandardError; end
  class Declined < Error; end
end
```

---

## Standards spécifiques à Rails

### Strong parameters

```ruby
def article_params
  params.expect(article: %i[title body])
end
```

`params.expect` (Rails 8) est plus strict que `require(...).permit(...)` et répond 400 sur les payloads malformés.

### Interface de requête

```ruby
# MAUVAIS
User.where("age > #{age}")
User.all.select { |u| u.active? }

# BON
User.where(age: age..)
User.where(active: true)
```

### Temps

```ruby
Time.current        # et non Time.now
Date.current        # et non Date.today
3.days.ago
Time.zone.parse("2026-11-01 10:00")
```

### Journalisation

```ruby
Rails.logger.info("order placed order_id=#{order.id}")
```

Ne jamais journaliser de secrets, de tokens ni de données personnelles. Rails 8.1 propose des événements structurés (`Rails.event.notify("order.placed", order_id: order.id)`) pour des logs lisibles par machine.

### Configuration

```ruby
Rails.application.credentials.dig(:stripe, :secret_key)
ENV.fetch("REDIS_URL")           # échoue immédiatement si absent
```

Utiliser `ENV.fetch` plutôt que `ENV[]` pour les valeurs obligatoires.

---

## Commentaires et documentation

- Commenter le **pourquoi**, pas le quoi
- Préférer des noms clairs aux commentaires
- API publiques des services et des bibliothèques : commentaires de style YARD

```ruby
# Débite le moyen de paiement de la commande.
#
# @param order [Order] une commande en attente
# @return [Result]
# @raise [Payments::Declined] lorsque la carte est refusée
def charge!(order)
end
```

- `TODO`/`FIXME` exigent une référence de ticket
- Supprimer le code commenté

---

## Typage statique optionnel

RBS avec Steep ou Sorbet est optionnel.

```ruby
# sig/orders/checkout.rbs
module Orders
  class Checkout
    def self.call: (user: User, cart: Cart, payment_token: String) -> Result
    def call: () -> Result
  end
end
```

Si adopté : typer d'abord les API publiques des services, lancer `steep check` ou `srb tc` en CI, éviter `untyped` sans commentaire.

---

## Anti-patterns

| Anti-pattern | Correction |
|--------------|------------|
| Monkey-patching des classes du noyau | Refinements ou modules utilitaires |
| `rescue Exception` | Rescuer des erreurs précises |
| `send` / `constantize` / `eval` sur une saisie utilisateur | Liste blanche |
| État mutable global (`$var`, variables de classe) | Injection de dépendances, `Current` |
| Longues listes de paramètres | Arguments nommés ou objet paramètre |
| Modèle fourre-tout > 300 lignes | Concerns pour les comportements cohésifs, service objects pour les workflows |
| Callbacks atteignant d'autres systèmes | Service object ou job |
| `default_scope` | Scopes explicites |
| `update_attribute`, contournement désinvolte des validations | `update!` |
| Abstraction prématurée | Attendre la troisième occurrence |

---

## Checklist rapide

- [ ] `# frozen_string_literal: true` présent
- [ ] Noms en `snake_case`, sémantique des suffixes `?`/`!` respectée
- [ ] Méthodes < 10 lignes (limite 20), clauses de garde
- [ ] Arguments nommés dès 3+ paramètres ou pour les booléens
- [ ] Pas de `rescue Exception`, pas de rescue silencieux
- [ ] `params.expect` pour les strong parameters
- [ ] `Time.current` au lieu de `Time.now`
- [ ] `bin/rubocop` propre
