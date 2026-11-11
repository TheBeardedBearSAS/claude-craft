# Standards de Code Rust

## Vue d'ensemble

Standards pour le code Rust (édition 2024) dans les services Axum. Les Rust API Guidelines, rustfmt et clippy font autorité ; ce document résume les règles du projet et leur justification.

## En-tête de crate et lints obligatoires

```rust
#![forbid(unsafe_code)]
```

Toute crate applicative interdit `unsafe`. La forme préférée est une table de lints au niveau du workspace, héritée par chaque membre :

```toml
# Cargo.toml (workspace root)
[workspace.lints.rust]
unsafe_code = "forbid"

[workspace.lints.clippy]
all = { level = "warn", priority = -1 }
pedantic = { level = "warn", priority = -1 }
unwrap_used = "deny"
expect_used = "warn"
panic = "deny"

# crates/api/Cargo.toml
[lints]
workspace = true
```

`clippy::unwrap_used` et `clippy::panic` tiennent les panics à l'écart des chemins de requête ; assouplissez-les pour le code de test avec `#![cfg_attr(test, allow(clippy::unwrap_used))]` ou un `clippy.toml` (`allow-unwrap-in-tests = true`). Si une dépendance a réellement besoin de `unsafe`, isolez-la dans une crate séparée et relue plutôt que d'affaiblir le lint.

---

## Conventions de nommage (Rust API Guidelines)

| Élément | Convention | Exemple |
|---------|------------|---------|
| Crates, modules, fichiers | `snake_case` | `order_item.rs` |
| Types, traits, variantes d'enum | `UpperCamelCase` | `OrderItem`, `PaymentGateway` |
| Fonctions, méthodes, variables | `snake_case` | `calculate_total` |
| Constantes, statics | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES` |
| Paramètres de type | `UpperCamelCase` court | `T`, `S`, `Repo` |
| Getters | Pas de préfixe `get_` | `fn name(&self)` |
| Conversions | `as_` (emprunt peu coûteux), `to_` (coûteux), `into_` (consommant) | `as_str`, `to_vec`, `into_inner` |
| Constructeurs | `new`, `with_*`, `from_*`, `try_from` | `Order::new` |
| Booléens | Forme prédicat, `is_` non requis mais courant | `is_empty`, `has_items` |
| Bindings inutilisés | Préfixer avec `_` | `_state` |

```rust
// BAD
struct order_item;
fn getTotal(&self) -> i64;

// GOOD
struct OrderItem;
fn total(&self) -> Money;
```

---

## Formatage

| Règle | Valeur |
|-------|--------|
| Formateur | `rustfmt` (`cargo fmt`), la CI exécute `cargo fmt --check` |
| Indentation | 4 espaces |
| Largeur de ligne | 100 caractères (défaut de rustfmt ; garder une configuration minimale) |
| Imports | Groupés std / externes / crate, un `use` par arbre de chemin |
| Virgules finales | Obligatoires dans les littéraux multi-lignes (rustfmt les ajoute) |
| Édition | `edition = "2024"` dans chaque crate |

```toml
# rustfmt.toml: keep it small, the defaults are the standard
edition = "2024"
```

Lancez `docker compose exec app cargo fmt` pour formater ; ne formatez jamais à la main.

---

## Fonctions

### Taille et complexité (KISS)

| Métrique | Cible | Limite |
|----------|-------|--------|
| Lignes par fonction | < 10 | < 20 |
| Paramètres | 3 | 4 maximum (utiliser une struct ou un builder) |
| Complexité cognitive | < 7 | < 10 |
| Profondeur d'imbrication | 2 | 3 maximum |

Les lints clippy `cognitive_complexity` et `too_many_arguments` aident ; définissez `cognitive-complexity-threshold` dans `clippy.toml` pour correspondre à la limite du projet.

### Retours anticipés et `?`

```rust
// BAD: nested matching
fn discount(user: Option<&User>) -> u8 {
    match user {
        Some(u) => {
            if u.is_premium() { 20 } else { 0 }
        }
        None => 0,
    }
}

// GOOD: let-else and guard clauses
fn discount(user: Option<&User>) -> u8 {
    let Some(user) = user else { return 0 };
    if !user.is_premium() {
        return 0;
    }
    20
}
```

### Newtypes et parsing à la frontière

```rust
// BAD: primitive obsession, validation scattered
fn send_invoice(email: String, amount: i64) {}

// GOOD: parse once, carry the guarantee in the type
pub struct EmailAddress(String);

impl EmailAddress {
    pub fn parse(raw: &str) -> Result<Self, DomainError> {
        if raw.contains('@') && raw.len() <= 254 {
            Ok(Self(raw.to_owned()))
        } else {
            Err(DomainError::InvalidEmail)
        }
    }
}
```

Rendez les états invalides non représentables : enums plutôt que booléens et chaînes, `NonZeroU32`, `Duration` plutôt que des entiers bruts.

---

## Ownership et borrowing

| Situation | Recommandation |
|-----------|----------------|
| La fonction ne fait que lire | Prendre `&str`, `&[T]`, `&T` |
| La fonction stocke ou consomme | Prendre la valeur possédée (`String`, `Vec<T>`) ou `impl Into<String>` |
| Donnée empruntée optionnelle | `Option<&T>` plutôt que `&Option<T>` |
| Partage entre tâches | `Arc<T>` ; mutabilité intérieure via `tokio::sync::Mutex` ou `RwLock` seulement si nécessaire |
| Retour de données empruntées | Élider les lifetimes ; ne les nommer que lorsque l'élision échoue |
| Copies lourdes | Passer des références, utiliser `Cow<'_, str>` lorsque la possession est conditionnelle |

```rust
// BAD: needless clone to appease the borrow checker
let name = user.name.clone();
log(&name);

// GOOD: borrow
log(&user.name);
```

Directives :
- Un `.clone()` qui n'existe que pour faire taire le borrow checker est une mauvaise odeur de conception ; restructurez d'abord
- Clonez les `Arc` librement (peu coûteux), clonez les grosses données possédées de façon délibérée
- Préférez les itérateurs et combinateurs aux boucles par index ; évitez de collecter dans un `Vec` juste pour itérer à nouveau
- Ne conservez jamais un `std::sync::MutexGuard` à travers un `.await` ; le lint clippy `await_holding_lock` le détecte

---

## Gestion des erreurs

```rust
// BAD: panics on request paths
let id: Uuid = s.parse().unwrap();
let user = repo.find(id).await.expect("user exists");

// GOOD: propagate with ?
let id: Uuid = s.parse().map_err(|_| AppError::Validation(vec![FieldError::new("id", "invalid")]))?;
let user = repo.find(id).await?.ok_or(AppError::NotFound)?;
```

| Où | Règle |
|----|-------|
| Crates bibliothèques | Enums `thiserror`, `#[from]` pour les conversions, pas d'`anyhow` |
| Crate binaire | `anyhow::Result` et `.context("...")` pour le démarrage et le code de liaison |
| Chemins de requête | Pas de `unwrap()`, `expect()`, `panic!`, `unreachable!` sur une entrée externe, pas d'indexation non vérifiée (`v[i]`) |
| Démarrage (config, bind) | `expect` avec un message clair est acceptable, échouer vite |
| Tests | `unwrap()` et `expect()` sont acceptables |

N'avalez jamais les erreurs avec `let _ =` sur un `Result`, sauf si l'échec est réellement sans importance et documenté.

---

## Conventions async

- `async fn` dans les traits est natif ; aucun `#[async_trait]` n'est nécessaire pour le dispatch statique (ne l'utilisez, ou une future boxée, que pour `dyn Trait`)
- Ne bloquez pas l'exécuteur : `tokio::fs`, `tokio::time::sleep`, `spawn_blocking` pour le CPU ou les E/S bloquantes
- Les futures doivent être `Send` pour Tokio multi-thread : évitez de conserver des `Rc`, des guards de `RefCell` ou des types non `Send` à travers un `.await`
- Sûreté face à l'annulation : tout `.await` peut être abandonné lorsqu'un client se déconnecte ; gardez les sections critiques dans des transactions
- Bornez toujours la concurrence (sémaphores, channels bornés) et définissez des timeouts sur les appels sortants

---

## Documentation

```rust
/// Computes the order total, including line-item discounts.
///
/// # Errors
///
/// Returns [`DomainError::EmptyOrder`] when the order has no items.
pub fn total(&self) -> Result<Money, DomainError> { /* ... */ }
```

- Les éléments publics portent une rustdoc `///` ; sections `# Errors` et `# Panics` lorsque pertinent
- Les commentaires expliquent le POURQUOI, pas le QUOI
- `#![warn(missing_docs)]` pour les crates bibliothèques
- Les exemples de documentation sont compilés par `cargo test --doc`

---

## Dépendances

| Règle | Détail |
|-------|--------|
| Déclarer les versions partagées une seule fois | `[workspace.dependencies]`, les membres utilisent `dep.workspace = true` |
| Features minimales | `default-features = false` et activer uniquement ce qui est utilisé (tokio, sqlx, tower-http) |
| Versionner `Cargo.lock` | Les applications sont des builds reproductibles |
| Pas de versions joker | `"*"` est rejeté par `cargo deny` |

---

## Sources

- Rust API Guidelines : https://rust-lang.github.io/api-guidelines/
- Lints Clippy : https://rust-lang.github.io/rust-clippy/master/
- Release Rust 1.99.1 : https://blog.rust-lang.org/2026/10/01/Rust-1.99.1/ (édition 2024)

## Checklist

- [ ] `unsafe_code = "forbid"` via les lints de workspace
- [ ] `cargo fmt --check` et `cargo clippy -- -D warnings` sans alerte
- [ ] `snake_case` / `UpperCamelCase` / `SCREAMING_SNAKE_CASE` respectés
- [ ] Fonctions < 10 lignes (limite 20), retours anticipés, `let ... else`
- [ ] Newtypes aux frontières, états invalides non représentables
- [ ] Pas de `unwrap()` / `expect()` / `panic!` sur les chemins de requête
- [ ] Pas de `.clone()` inutile, paramètres empruntés autant que possible
- [ ] Aucun appel bloquant ni guard de verrou à travers un `.await`
- [ ] Éléments publics documentés, sections `# Errors` présentes
- [ ] Versions de dépendances partagées dans `[workspace.dependencies]`
