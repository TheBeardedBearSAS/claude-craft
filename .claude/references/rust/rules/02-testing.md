# Testing Rust — TDD / Property-Based

## Vue d'ensemble

Le testing Rust combine tests unitaires, integration, et property-based testing.

**Principes** :
- ✅ Pyramide : 70% unit, 20% integration, 10% E2E
- ✅ cargo test natif pour tout
- ✅ Property-based (proptest) pour exhaustivité
- ✅ Mutation testing obligatoire (cargo-mutants)
- ✅ Coverage ≥ 80%

---

## Tests Unitaires

### Tests Module

```rust
// crates/domain/src/user/email.rs
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_valid_email() {
        let email = Email::new("user@example.com");
        assert!(email.is_ok());
        assert_eq!(email.unwrap().as_str(), "user@example.com");
    }

    #[test]
    fn test_invalid_email_missing_at() {
        let email = Email::new("userexample.com");
        assert!(email.is_err());
    }

    #[test]
    fn test_invalid_email_empty() {
        let email = Email::new("");
        assert!(email.is_err());
    }
}
```

### Tests avec rstest (parametrized)

```rust
use rstest::rstest;

#[rstest]
#[case("user@example.com", true)]
#[case("invalid", false)]
#[case("", false)]
#[case("user@", false)]
fn test_email_validation(#[case] input: &str, #[case] expected: bool) {
    let result = Email::new(input);
    assert_eq!(result.is_ok(), expected);
}
```

---

## Tests Async

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_user() {
        let repo = MockUserRepository::new();
        let use_case = CreateUserUseCase::new(repo);

        let result = use_case.execute(CreateUserInput {
            email: "test@example.com".to_string(),
            name: "Test".to_string(),
        }).await;

        assert!(result.is_ok());
    }
}
```

---

## Mocks

### mockall

```rust
use mockall::predicate::*;
use mockall::mock;

mock! {
    pub UserRepository {}

    #[async_trait]
    impl UserRepository for UserRepository {
        async fn get(&self, id: &str) -> Result<User, DomainError>;
        async fn save(&self, user: &User) -> Result<(), DomainError>;
        async fn find_by_email(&self, email: &Email) -> Result<Option<User>, DomainError>;
    }
}

#[tokio::test]
async fn test_create_user_with_mock() {
    let mut mock_repo = MockUserRepository::new();
    
    mock_repo
        .expect_find_by_email()
        .with(eq(Email::new("test@example.com").unwrap()))
        .times(1)
        .returning(|_| Ok(None));

    mock_repo
        .expect_save()
        .times(1)
        .returning(|_| Ok(()));

    let use_case = CreateUserUseCase::new(mock_repo);
    
    let result = use_case.execute(CreateUserInput {
        email: "test@example.com".to_string(),
        name: "Test".to_string(),
    }).await;

    assert!(result.is_ok());
}
```

---

## Tests Intégration

### Structure

```
tests/
├── integration/
│   ├── mod.rs
│   ├── user_test.rs
│   └── order_test.rs
└── common/
    └── mod.rs  # Helpers partagés
```

### Test avec DB réelle (testcontainers)

```rust
// tests/integration/user_test.rs
use sqlx::PgPool;
use testcontainers::{clients, images::postgres::Postgres, Container};

async fn setup_db() -> (PgPool, Container<'static, Postgres>) {
    let docker = clients::Cli::default();
    let postgres = docker.run(Postgres::default());

    let connection_string = format!(
        "postgres://postgres:postgres@localhost:{}/postgres",
        postgres.get_host_port_ipv4(5432)
    );

    let pool = PgPool::connect(&connection_string).await.unwrap();

    // Migrations
    sqlx::migrate!("./migrations")
        .run(&pool)
        .await
        .unwrap();

    (pool, postgres)
}

#[tokio::test]
async fn test_user_repository_integration() {
    let (pool, _container) = setup_db().await;

    let repo = PostgresUserRepository::new(pool);
    let user = User::new(
        Email::new("test@example.com").unwrap(),
        "Test User".to_string(),
    );

    // Save
    repo.save(&user).await.unwrap();

    // Get
    let retrieved = repo.get(&user.id).await.unwrap();
    assert_eq!(retrieved.email.as_str(), "test@example.com");
}
```

---

## Property-Based Testing

### proptest

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn test_email_roundtrip(email in "[a-z]+@[a-z]+\\.[a-z]+") {
        let parsed = Email::new(&email).unwrap();
        prop_assert_eq!(parsed.as_str(), email);
    }

    #[test]
    fn test_user_age_always_positive(age in 0..150u8) {
        let user = User::new_with_age(age);
        prop_assert!(user.age >= 0);
    }
}
```

---

## Snapshot Testing

### insta

```rust
use insta::assert_snapshot;

#[test]
fn test_user_serialization() {
    let user = User::new(
        Email::new("test@example.com").unwrap(),
        "Test User".to_string(),
    );

    let json = serde_json::to_string_pretty(&user).unwrap();
    assert_snapshot!(json);
}

// Lancer : cargo insta review
```

---

## Benchmarks

### criterion.rs

```rust
// benches/email_bench.rs
use criterion::{black_box, criterion_group, criterion_main, Criterion};
use domain::user::Email;

fn benchmark_email_parsing(c: &mut Criterion) {
    c.bench_function("parse valid email", |b| {
        b.iter(|| Email::new(black_box("user@example.com")))
    });
}

criterion_group!(benches, benchmark_email_parsing);
criterion_main!(benches);
```

```toml
# Cargo.toml
[[bench]]
name = "email_bench"
harness = false
```

```bash
# Lancer
cargo bench
```

---

## Coverage

### cargo-tarpaulin

```bash
# Installer
cargo install cargo-tarpaulin

# Coverage HTML
cargo tarpaulin --out Html --output-dir coverage/

# CI : seuil minimum
cargo tarpaulin --fail-under 80
```

### cargo-llvm-cov

```bash
# Installer
cargo install cargo-llvm-cov

# Coverage
cargo llvm-cov --html

# CI
cargo llvm-cov --fail-under-lines 80
```

---

## Mutation Testing

### cargo-mutants

```bash
# Installer
cargo install cargo-mutants

# Lancer mutation tests
cargo mutants

# CI : vérifier score ≥ 70%
cargo mutants --check
```

**Mutation score** : % de mutants tués par les tests.
- < 60% : tests faibles
- 60-80% : acceptable
- > 80% : excellent

---

## Fuzzing

### cargo-fuzz (AFL++)

```bash
# Installer
cargo install cargo-fuzz

# Initialiser
cargo fuzz init

# Créer fuzz target
cargo fuzz add email_fuzz

# Lancer
cargo fuzz run email_fuzz
```

```rust
// fuzz/fuzz_targets/email_fuzz.rs
#![no_main]
use libfuzzer_sys::fuzz_target;
use domain::user::Email;

fuzz_target!(|data: &[u8]| {
    if let Ok(s) = std::str::from_utf8(data) {
        let _ = Email::new(s);
    }
});
```

---

## TDD Workflow

### Red → Green → Refactor

```rust
// 1. RED : Test qui échoue
#[test]
fn test_calculate_total() {
    let cart = Cart::new();
    cart.add_item("item1", 10.0);
    cart.add_item("item2", 5.0);

    assert_eq!(cart.calculate_total(), 15.0); // FAIL : méthode n'existe pas
}

// 2. GREEN : Code minimal
impl Cart {
    pub fn calculate_total(&self) -> f64 {
        self.items.iter().map(|i| i.price).sum()
    }
}

// 3. REFACTOR : Améliorer
impl Cart {
    pub fn calculate_total(&self) -> f64 {
        self.items.iter().fold(0.0, |acc, i| acc + i.price)
    }
}
```

---

## Best Practices

### Test Organization

```rust
// Grouper par feature
#[cfg(test)]
mod tests {
    use super::*;

    mod email {
        use super::*;

        #[test]
        fn valid() { /* ... */ }

        #[test]
        fn invalid_missing_at() { /* ... */ }
    }

    mod user {
        use super::*;

        #[test]
        fn create_valid() { /* ... */ }

        #[test]
        fn change_name() { /* ... */ }
    }
}
```

### Test Isolation

```rust
// Chaque test crée ses propres données
#[tokio::test]
async fn test_example() {
    // Setup
    let repo = MockRepository::new();
    let use_case = UseCase::new(repo);

    // Execute
    let result = use_case.execute(input).await;

    // Assert
    assert!(result.is_ok());

    // Cleanup automatique (Drop trait)
}
```

### Doc Tests

```rust
/// Parse un email valide
///
/// # Examples
///
/// ```
/// use domain::user::Email;
///
/// let email = Email::new("user@example.com").unwrap();
/// assert_eq!(email.as_str(), "user@example.com");
/// ```
pub fn new(email: impl Into<String>) -> Result<Self, Error> {
    // ...
}
```

```bash
# Lancer doc tests
cargo test --doc
```

---

## Checklist Testing

- [ ] Tests unitaires pour toute logique métier
- [ ] rstest pour tests paramétrés
- [ ] mockall pour mocks
- [ ] Tests async avec #[tokio::test]
- [ ] Tests intégration avec testcontainers
- [ ] Property-based (proptest) pour exhaustivité
- [ ] Coverage ≥ 80% (tarpaulin/llvm-cov)
- [ ] Mutation testing ≥ 70% (cargo-mutants)
- [ ] Benchmarks pour code critique (criterion)
- [ ] Fuzzing pour parsers (cargo-fuzz)
- [ ] Doc tests pour exemples publics

---

**Date de dernière mise à jour** : 2026-04
**Version** : 1.0.0
**Auteur** : The Bearded CTO
