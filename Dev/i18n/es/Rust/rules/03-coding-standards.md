# Estándares de código Rust

## Visión general

Estándares para el código Rust (edition 2024) en servicios Axum. Las Rust API Guidelines, rustfmt y clippy son la autoridad; este documento resume las reglas del proyecto y el razonamiento que hay detrás.

## Cabecera de crate y lints obligatorios

```rust
#![forbid(unsafe_code)]
```

Todo crate de aplicación prohíbe `unsafe`. La forma preferida es una tabla de lints del workspace, heredada por cada miembro:

```toml
# Cargo.toml (raíz del workspace)
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

`clippy::unwrap_used` y `clippy::panic` mantienen los panics fuera de las rutas de petición; relájalos para el código de test con `#![cfg_attr(test, allow(clippy::unwrap_used))]` o un `clippy.toml` (`allow-unwrap-in-tests = true`). Si una dependencia necesita realmente `unsafe`, aíslala en un crate separado y revisado en lugar de debilitar el lint.

---

## Convenciones de nomenclatura (Rust API Guidelines)

| Elemento | Convención | Ejemplo |
|----------|------------|---------|
| Crates, módulos, archivos | `snake_case` | `order_item.rs` |
| Tipos, traits, variantes de enum | `UpperCamelCase` | `OrderItem`, `PaymentGateway` |
| Funciones, métodos, variables | `snake_case` | `calculate_total` |
| Constantes, statics | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES` |
| Parámetros de tipo | `UpperCamelCase` corto | `T`, `S`, `Repo` |
| Getters | Sin prefijo `get_` | `fn name(&self)` |
| Conversiones | `as_` (préstamo barato), `to_` (costosa), `into_` (que consume) | `as_str`, `to_vec`, `into_inner` |
| Constructores | `new`, `with_*`, `from_*`, `try_from` | `Order::new` |
| Booleanos | Forma de predicado, `is_` no es obligatorio pero es habitual | `is_empty`, `has_items` |
| Bindings no usados | Prefijo `_` | `_state` |

```rust
// MAL
struct order_item;
fn getTotal(&self) -> i64;

// BIEN
struct OrderItem;
fn total(&self) -> Money;
```

---

## Formato

| Regla | Valor |
|-------|-------|
| Formateador | `rustfmt` (`cargo fmt`), la CI ejecuta `cargo fmt --check` |
| Indentación | 4 espacios |
| Ancho de línea | 100 caracteres (valor por defecto de rustfmt; mantener la configuración mínima) |
| Imports | Agrupados std / externos / crate, un `use` por árbol de rutas |
| Comas finales | Obligatorias en literales multilínea (rustfmt las añade) |
| Edition | `edition = "2024"` en cada crate |

```toml
# rustfmt.toml: mantenerlo pequeño, los valores por defecto son el estándar
edition = "2024"
```

Ejecuta `docker compose exec app cargo fmt` para formatear; nunca formatees a mano.

---

## Funciones

### Tamaño y complejidad (KISS)

| Métrica | Objetivo | Límite |
|---------|----------|--------|
| Líneas por función | < 10 | < 20 |
| Parámetros | 3 | 4 como máximo (usar un struct o un builder) |
| Complejidad cognitiva | < 7 | < 10 |
| Profundidad de anidamiento | 2 | 3 como máximo |

Los lints `cognitive_complexity` y `too_many_arguments` de clippy ayudan; define `cognitive-complexity-threshold` en `clippy.toml` para que coincida con el límite del proyecto.

### Retornos tempranos y `?`

```rust
// MAL: matching anidado
fn discount(user: Option<&User>) -> u8 {
    match user {
        Some(u) => {
            if u.is_premium() { 20 } else { 0 }
        }
        None => 0,
    }
}

// BIEN: let-else y cláusulas de guarda
fn discount(user: Option<&User>) -> u8 {
    let Some(user) = user else { return 0 };
    if !user.is_premium() {
        return 0;
    }
    20
}
```

### Newtypes y parsing en la frontera

```rust
// MAL: obsesión por los primitivos, validación dispersa
fn send_invoice(email: String, amount: i64) {}

// BIEN: parsear una vez, llevar la garantía en el tipo
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

Haz irrepresentables los estados inválidos: enums en lugar de booleanos y cadenas, `NonZeroU32`, `Duration` en lugar de enteros en bruto.

---

## Ownership y borrowing

| Situación | Guía |
|-----------|------|
| La función solo lee | Tomar `&str`, `&[T]`, `&T` |
| La función almacena o consume | Tomar el valor propio (`String`, `Vec<T>`) o `impl Into<String>` |
| Datos prestados opcionales | `Option<&T>` en lugar de `&Option<T>` |
| Compartir entre tareas | `Arc<T>`; mutabilidad interior mediante `tokio::sync::Mutex` o `RwLock` solo cuando haga falta |
| Devolver datos prestados | Omitir los lifetimes (elision); nombrarlos solo cuando la elision falla |
| Copias costosas | Pasar referencias, usar `Cow<'_, str>` cuando la propiedad es condicional |

```rust
// MAL: clone innecesario para apaciguar al borrow checker
let name = user.name.clone();
log(&name);

// BIEN: tomar prestado
log(&user.name);
```

Directrices:
- Un `.clone()` que existe solo para acallar al borrow checker es un olor de diseño; reestructura primero
- Clona los `Arc` sin miedo (es barato), clona deliberadamente los datos propios grandes
- Preferir iteradores y combinadores a los bucles con índice; evitar recolectar en un `Vec` solo para volver a iterar
- Nunca mantener un `std::sync::MutexGuard` a través de un `.await`; el lint `await_holding_lock` de clippy lo detecta

---

## Gestión de errores

```rust
// MAL: panics en las rutas de petición
let id: Uuid = s.parse().unwrap();
let user = repo.find(id).await.expect("user exists");

// BIEN: propagar con ?
let id: Uuid = s.parse().map_err(|_| AppError::Validation(vec![FieldError::new("id", "invalid")]))?;
let user = repo.find(id).await?.ok_or(AppError::NotFound)?;
```

| Dónde | Regla |
|-------|-------|
| Crates de librería | Enums `thiserror`, `#[from]` para las conversiones, sin `anyhow` |
| Crate binario | `anyhow::Result` y `.context("...")` para el arranque y el código de enlace |
| Rutas de petición | Ningún `unwrap()`, `expect()`, `panic!`, `unreachable!` sobre entradas externas, ninguna indexación sin comprobar (`v[i]`) |
| Arranque (config, bind) | `expect` con un mensaje claro es aceptable, fallar rápido |
| Tests | `unwrap()` y `expect()` están bien |

Nunca te tragues los errores con `let _ =` sobre un `Result` salvo que el fallo sea realmente irrelevante y esté documentado.

---

## Convenciones asíncronas

- `async fn` en los traits es nativo; no hace falta `#[async_trait]` para el despacho estático (úsalo, o un future en Box, solo para `dyn Trait`)
- No bloquear el executor: `tokio::fs`, `tokio::time::sleep`, `spawn_blocking` para la CPU o la E/S bloqueante
- Los futures deben ser `Send` para el Tokio multihilo: evitar mantener `Rc`, guards de `RefCell` o tipos no `Send` a través de un `.await`
- Seguridad frente a la cancelación: cualquier `.await` puede descartarse cuando un cliente se desconecta; mantener las secciones críticas dentro de transacciones
- Acotar siempre la concurrencia (semáforos, canales acotados) y definir timeouts en las llamadas salientes

---

## Documentación

```rust
/// Calcula el total del pedido, incluidos los descuentos por línea.
///
/// # Errors
///
/// Devuelve [`DomainError::EmptyOrder`] cuando el pedido no tiene artículos.
pub fn total(&self) -> Result<Money, DomainError> { /* ... */ }
```

- Los elementos públicos llevan rustdoc `///`; secciones `# Errors` y `# Panics` cuando proceda
- Los comentarios explican el POR QUÉ, no el QUÉ
- `#![warn(missing_docs)]` para los crates de librería
- Los ejemplos de la documentación se compilan con `cargo test --doc`

---

## Dependencias

| Regla | Detalle |
|-------|---------|
| Declarar las versiones compartidas una sola vez | `[workspace.dependencies]`, los miembros usan `dep.workspace = true` |
| Features mínimas | `default-features = false` y activar solo lo que se usa (tokio, sqlx, tower-http) |
| Commitear `Cargo.lock` | Las aplicaciones son builds reproducibles |
| Sin versiones comodín | `"*"` es rechazado por `cargo deny` |

---

## Fuentes

- Rust API Guidelines: https://rust-lang.github.io/api-guidelines/
- Lints de Clippy: https://rust-lang.github.io/rust-clippy/master/
- Lanzamiento de Rust 1.99.1: https://blog.rust-lang.org/2026/10/01/Rust-1.99.1/ (edition 2024)

## Checklist

- [ ] `unsafe_code = "forbid"` mediante los lints del workspace
- [ ] `cargo fmt --check` y `cargo clippy -- -D warnings` limpios
- [ ] Se respetan `snake_case` / `UpperCamelCase` / `SCREAMING_SNAKE_CASE`
- [ ] Funciones < 10 líneas (límite 20), retornos tempranos, `let ... else`
- [ ] Newtypes en las fronteras, estados inválidos irrepresentables
- [ ] Ningún `unwrap()` / `expect()` / `panic!` en las rutas de petición
- [ ] Ningún `.clone()` innecesario, parámetros prestados cuando sea posible
- [ ] Ninguna llamada bloqueante ni guard de lock a través de un `.await`
- [ ] Elementos públicos documentados, secciones `# Errors` presentes
- [ ] Versiones de dependencias compartidas en `[workspace.dependencies]`
