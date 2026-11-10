# Rust-Coding-Standards

## Überblick

Standards für Rust-Code (Edition 2024) in Axum-Services. Die Rust API Guidelines, rustfmt und clippy sind maßgeblich; dieses Dokument fasst die Projektregeln und deren Begründung zusammen.

## Verpflichtender Crate-Kopf und Lints

```rust
#![forbid(unsafe_code)]
```

Jedes Anwendungs-Crate verbietet `unsafe`. Die bevorzugte Form ist eine Workspace-Lint-Tabelle, die jedes Mitglied erbt:

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

`clippy::unwrap_used` und `clippy::panic` halten Panics von Request-Pfaden fern; für Testcode mit `#![cfg_attr(test, allow(clippy::unwrap_used))]` oder einer `clippy.toml` (`allow-unwrap-in-tests = true`) lockern. Benötigt eine Abhängigkeit tatsächlich `unsafe`, sie in einem separaten, geprüften Crate isolieren, statt den Lint abzuschwächen.

---

## Namenskonventionen (Rust API Guidelines)

| Element | Konvention | Beispiel |
|---------|------------|----------|
| Crates, Module, Dateien | `snake_case` | `order_item.rs` |
| Typen, Traits, Enum-Varianten | `UpperCamelCase` | `OrderItem`, `PaymentGateway` |
| Funktionen, Methoden, Variablen | `snake_case` | `calculate_total` |
| Konstanten, Statics | `SCREAMING_SNAKE_CASE` | `MAX_RETRIES` |
| Typparameter | Kurzes `UpperCamelCase` | `T`, `S`, `Repo` |
| Getter | Kein Präfix `get_` | `fn name(&self)` |
| Konvertierungen | `as_` (günstiges Ausleihen), `to_` (teuer), `into_` (verbrauchend) | `as_str`, `to_vec`, `into_inner` |
| Konstruktoren | `new`, `with_*`, `from_*`, `try_from` | `Order::new` |
| Booleans | Prädikatsform, `is_` nicht zwingend, aber üblich | `is_empty`, `has_items` |
| Ungenutzte Bindungen | Mit `_` präfixieren | `_state` |

```rust
// SCHLECHT
struct order_item;
fn getTotal(&self) -> i64;

// GUT
struct OrderItem;
fn total(&self) -> Money;
```

---

## Formatierung

| Regel | Wert |
|-------|------|
| Formatierer | `rustfmt` (`cargo fmt`), die CI führt `cargo fmt --check` aus |
| Einrückung | 4 Leerzeichen |
| Zeilenbreite | 100 Zeichen (rustfmt-Standard; Konfiguration minimal halten) |
| Importe | Gruppiert nach std / extern / Crate, ein `use` pro Pfadbaum |
| Abschließende Kommas | In mehrzeiligen Literalen erforderlich (rustfmt fügt sie hinzu) |
| Edition | `edition = "2024"` in jedem Crate |

```toml
# rustfmt.toml: klein halten, die Standardwerte sind der Standard
edition = "2024"
```

Zum Formatieren `docker compose exec app cargo fmt` ausführen; niemals von Hand formatieren.

---

## Funktionen

### Größe und Komplexität (KISS)

| Metrik | Ziel | Grenze |
|--------|------|--------|
| Zeilen pro Funktion | < 10 | < 20 |
| Parameter | 3 | maximal 4 (Struct oder Builder verwenden) |
| Kognitive Komplexität | < 7 | < 10 |
| Verschachtelungstiefe | 2 | maximal 3 |

Die Lints `cognitive_complexity` und `too_many_arguments` von Clippy helfen; `cognitive-complexity-threshold` in `clippy.toml` passend zur Projektgrenze setzen.

### Early Returns und `?`

```rust
// SCHLECHT: verschachteltes Matching
fn discount(user: Option<&User>) -> u8 {
    match user {
        Some(u) => {
            if u.is_premium() { 20 } else { 0 }
        }
        None => 0,
    }
}

// GUT: let-else und Guard Clauses
fn discount(user: Option<&User>) -> u8 {
    let Some(user) = user else { return 0 };
    if !user.is_premium() {
        return 0;
    }
    20
}
```

### Newtypes und Parsing an der Grenze

```rust
// SCHLECHT: Primitive Obsession, Validierung verstreut
fn send_invoice(email: String, amount: i64) {}

// GUT: einmal parsen, die Garantie im Typ mittragen
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

Ungültige Zustände unrepräsentierbar machen: Enums statt Booleans und Strings, `NonZeroU32`, `Duration` statt roher Ganzzahlen.

---

## Ownership und Borrowing

| Situation | Empfehlung |
|-----------|------------|
| Funktion liest nur | `&str`, `&[T]`, `&T` entgegennehmen |
| Funktion speichert oder verbraucht | Den besitzenden Wert (`String`, `Vec<T>`) oder `impl Into<String>` entgegennehmen |
| Optionale geliehene Daten | `Option<&T>` statt `&Option<T>` |
| Teilen über Tasks hinweg | `Arc<T>`; innere Veränderlichkeit über `tokio::sync::Mutex` oder `RwLock` nur bei Bedarf |
| Geliehene Daten zurückgeben | Lifetimes elidieren; nur benennen, wenn die Elision scheitert |
| Teure Kopien | Referenzen übergeben, `Cow<'_, str>` verwenden, wenn die Ownership bedingt ist |

```rust
// SCHLECHT: überflüssiger Clone, um den Borrow Checker zu besänftigen
let name = user.name.clone();
log(&name);

// GUT: ausleihen
log(&user.name);
```

Richtlinien:
- Ein `.clone()`, das nur existiert, um den Borrow Checker zum Schweigen zu bringen, ist ein Design-Smell; zuerst umstrukturieren
- `Arc`s dürfen großzügig geklont werden (günstig), große besitzende Daten nur bewusst
- Iteratoren und Kombinatoren gegenüber Index-Schleifen bevorzugen; nicht in einen `Vec` sammeln, nur um erneut zu iterieren
- Niemals einen `std::sync::MutexGuard` über ein `.await` hinweg halten; `await_holding_lock` von Clippy erkennt das

---

## Fehlerbehandlung

```rust
// SCHLECHT: Panics auf Request-Pfaden
let id: Uuid = s.parse().unwrap();
let user = repo.find(id).await.expect("user exists");

// GUT: mit ? propagieren
let id: Uuid = s.parse().map_err(|_| AppError::Validation(vec![FieldError::new("id", "invalid")]))?;
let user = repo.find(id).await?.ok_or(AppError::NotFound)?;
```

| Wo | Regel |
|----|-------|
| Library-Crates | `thiserror`-Enums, `#[from]` für Konvertierungen, kein `anyhow` |
| Binary-Crate | `anyhow::Result` und `.context("...")` für Start und Verbindungscode |
| Request-Pfade | Kein `unwrap()`, `expect()`, `panic!`, `unreachable!` bei externen Eingaben, keine ungeprüften Indexzugriffe (`v[i]`) |
| Start (Konfiguration, Bind) | `expect` mit klarer Meldung ist akzeptabel, schnell scheitern |
| Tests | `unwrap()` und `expect()` sind in Ordnung |

Fehler niemals mit `let _ =` auf einem `Result` verschlucken, es sei denn, der Fehlschlag ist tatsächlich irrelevant und dokumentiert.

---

## Async-Konventionen

- `async fn` in Traits ist nativ; für statischen Dispatch wird kein `#[async_trait]` benötigt (nur für `dyn Trait` verwenden, oder ein geboxtes Future)
- Den Executor nicht blockieren: `tokio::fs`, `tokio::time::sleep`, `spawn_blocking` für CPU oder blockierende I/O
- Futures müssen für das Multi-Threaded-Tokio `Send` sein: keine `Rc`-, `RefCell`-Guards oder Nicht-`Send`-Typen über ein `.await` hinweg halten
- Cancellation Safety: Jedes `.await` kann verworfen werden, wenn der Client die Verbindung trennt; kritische Abschnitte innerhalb von Transaktionen halten
- Nebenläufigkeit immer begrenzen (Semaphoren, begrenzte Channels) und Timeouts für ausgehende Aufrufe setzen

---

## Dokumentation

```rust
/// Computes the order total, including line-item discounts.
///
/// # Errors
///
/// Returns [`DomainError::EmptyOrder`] when the order has no items.
pub fn total(&self) -> Result<Money, DomainError> { /* ... */ }
```

- Öffentliche Items tragen `///`-rustdoc; Abschnitte `# Errors` und `# Panics`, wenn relevant
- Kommentare erklären das WARUM, nicht das WAS
- `#![warn(missing_docs)]` für Library-Crates
- Doc-Beispiele werden von `cargo test --doc` kompiliert

---

## Abhängigkeiten

| Regel | Detail |
|-------|--------|
| Gemeinsame Versionen einmal deklarieren | `[workspace.dependencies]`, Mitglieder verwenden `dep.workspace = true` |
| Minimale Features | `default-features = false` und nur aktivieren, was genutzt wird (tokio, sqlx, tower-http) |
| `Cargo.lock` einchecken | Anwendungen sind reproduzierbare Builds |
| Keine Wildcard-Versionen | `"*"` wird von `cargo deny` abgelehnt |

---

## Quellen

- Rust API Guidelines: https://rust-lang.github.io/api-guidelines/
- Clippy-Lints: https://rust-lang.github.io/rust-clippy/master/
- Rust-1.99.1-Release: https://blog.rust-lang.org/2026/10/01/Rust-1.99.1/ (Edition 2024)

## Checkliste

- [ ] `unsafe_code = "forbid"` über Workspace-Lints
- [ ] `cargo fmt --check` und `cargo clippy -- -D warnings` sauber
- [ ] `snake_case` / `UpperCamelCase` / `SCREAMING_SNAKE_CASE` eingehalten
- [ ] Funktionen < 10 Zeilen (Grenze 20), Early Returns, `let ... else`
- [ ] Newtypes an den Grenzen, ungültige Zustände unrepräsentierbar
- [ ] Kein `unwrap()` / `expect()` / `panic!` auf Request-Pfaden
- [ ] Kein überflüssiges `.clone()`, geliehene Parameter wo möglich
- [ ] Keine blockierenden Aufrufe oder Lock-Guards über `.await` hinweg
- [ ] Öffentliche Items dokumentiert, Abschnitte `# Errors` vorhanden
- [ ] Gemeinsame Abhängigkeitsversionen in `[workspace.dependencies]`
