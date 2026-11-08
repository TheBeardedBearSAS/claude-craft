# Standards de Test Rust / Axum

Le TDD est obligatoire : **Red -> Green -> Refactor**. Objectif de couverture : **>= 80 %** (cargo-llvm-cov). Chaque bug corrigé reçoit un test de non-régression qui échoue avant la correction.

Toutes les commandes s'exécutent dans le conteneur (`docker compose exec app ...`).

## Vue d'ensemble de l'outillage

| Outil | Rôle | Commande |
|-------|------|----------|
| `cargo test` (harnais intégré) | Tests unitaires, d'intégration et de documentation | `cargo test` |
| **cargo-nextest** | Runner rapide, isolation un processus par test, retries, sortie JUnit | `cargo nextest run` |
| **cargo-llvm-cov** | Couverture basée sur le code source | `cargo llvm-cov nextest` |
| `#[sqlx::test]` | Base de données isolée par test | dans le code de test |
| **proptest** | Tests par propriétés | dans le code de test |
| **insta** | Tests par snapshots | `cargo insta review` |
| **cargo-mutants** | Tests de mutation | `cargo mutants` |
| **wiremock** | Simulation HTTP de services externes | dans le code de test |

Règles :
- nextest n'exécute pas les doc tests ; gardez `cargo test --doc` comme étape CI séparée
- Choisissez un style d'assertion (`assert_eq!`, éventuellement `pretty_assertions`) et restez cohérent

## Pyramide des tests

| Type | Part | Vitesse | Emplacement Rust |
|------|------|---------|------------------|
| Unitaire (domaine, cas d'usage avec ports factices) | 70 % | < 1 s | `#[cfg(test)] mod tests` dans le même fichier |
| Intégration (Router, base de données, adaptateurs) | 20 % | < 5 s | `crates/api/tests/*.rs`, `tests/` |
| De bout en bout (vrai serveur, vraies dépendances) | 10 % | < 30 s | `tests/e2e/`, exécutés contre compose |

---

## Tests unitaires

Les tests unitaires vivent à côté du code et peuvent accéder aux éléments privés.

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn new_order_is_pending() {
        let order = Order::new(UserId::new(), vec![]);
        assert_eq!(order.status(), Status::Pending);
    }

    #[test]
    fn pay_moves_pending_to_paid() {
        let mut order = Order::pending_fixture();

        order.pay(fixed_now()).unwrap();

        assert_eq!(order.status(), Status::Paid);
    }

    #[test]
    fn pay_rejects_an_already_paid_order() {
        let mut order = Order::paid_fixture();

        let err = order.pay(fixed_now()).unwrap_err();

        assert!(matches!(err, DomainError::InvalidTransition { .. }));
    }
}
```

Directives :
- Nommez les tests d'après le comportement (`pay_rejects_an_already_paid_order`), pas d'après la fonction
- `unwrap()` / `expect()` sont acceptables dans les tests
- Injectez le temps (port `Clock` ou paramètre `now`) ; ne lisez jamais l'horloge système dans le code du domaine
- Utilisez de petits builders ou des fonctions de fixtures, pas des statics mutables partagés

### Cas d'usage avec ports factices

```rust
struct InMemoryOrders(std::sync::Mutex<Vec<Order>>);

impl OrderRepository for InMemoryOrders {
    async fn save(&self, order: &Order) -> Result<(), RepoError> {
        self.0.lock().unwrap().push(order.clone());
        Ok(())
    }
}

#[tokio::test]
async fn place_order_persists_the_order() {
    let repo = InMemoryOrders::default();
    let use_case = PlaceOrder::new(repo, FixedClock::at(2026, 1, 1));

    let order = use_case.execute(valid_command()).await.unwrap();

    assert_eq!(use_case.repo().count(), 1);
    assert_eq!(order.status(), Status::Pending);
}
```

Préférez des fakes écrits à la main aux frameworks de mocking pour les ports : ils documentent le comportement et survivent aux refactorings. Réservez le mocking (`mockall`) aux frontières difficiles à simuler.

---

## Tests d'intégration : Router avec `oneshot`

Pilotez le Router directement avec `tower::ServiceExt::oneshot` ; aucun listener TCP n'est nécessaire.

```rust
// crates/api/tests/orders.rs
use axum::{body::Body, http::{header, Request, StatusCode}};
use http_body_util::BodyExt;
use tower::ServiceExt;

#[sqlx::test]
async fn create_order_returns_201(pool: sqlx::PgPool) {
    let app = api::build_router(api::AppState::for_test(pool));

    let response = app
        .oneshot(
            Request::post("/orders")
                .header(header::CONTENT_TYPE, "application/json")
                .header(header::AUTHORIZATION, test_bearer_token())
                .body(Body::from(r#"{"items":[{"product_id":"...","quantity":2}]}"#))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::CREATED);
    let body = response.into_body().collect().await.unwrap().to_bytes();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(json["status"], "pending");
}

#[sqlx::test]
async fn unauthenticated_request_is_rejected(pool: sqlx::PgPool) {
    let app = api::build_router(api::AppState::for_test(pool));

    let response = app.oneshot(Request::get("/orders").body(Body::empty()).unwrap()).await.unwrap();

    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}
```

Directives :
- Exposez `build_router(state)` depuis une cible bibliothèque pour que les tests (et le binaire) partagent le même câblage
- `oneshot` consomme le router ; appelez `.clone()` au préalable ou utilisez `into_service()` + `ready()` pour plusieurs requêtes
- Testez la pile de middleware complète, les corps d'erreur (problem+json) et l'autorisation, pas seulement les chemins nominaux
- Vérifiez le statut, les en-têtes (`content-type`, `www-authenticate`) et la forme du corps

### Tester un vrai listener (optionnel)

Pour les tests WebSocket, d'arrêt gracieux ou de bibliothèques clientes, liez-vous à un port éphémère :

```rust
let listener = tokio::net::TcpListener::bind("127.0.0.1:0").await.unwrap();
let addr = listener.local_addr().unwrap();
tokio::spawn(async move { axum::serve(listener, build_router(state)).await.unwrap() });
// call http://{addr} with reqwest
```

---

## Tests de base de données avec `#[sqlx::test]`

`#[sqlx::test]` crée une base de données neuve pour chaque test, applique les migrations, fournit un pool et nettoie en cas de succès (les tests en échec conservent la base pour inspection).

```rust
use sqlx::PgPool;

#[sqlx::test]
async fn repository_round_trip(pool: PgPool) -> sqlx::Result<()> {
    let repo = PgOrderRepository::new(pool);
    let order = Order::pending_fixture();

    repo.save(&order).await.unwrap();
    let found = repo.find(order.id()).await.unwrap();

    assert_eq!(found, Some(order));
    Ok(())
}

#[sqlx::test(fixtures("users", "orders"))]            // ./fixtures/users.sql, ./fixtures/orders.sql
async fn lists_only_the_owners_orders(pool: PgPool) { /* ... */ }

#[sqlx::test(migrations = "../../migrations")]       // override the migrations path when needed
async fn custom_migrations_path(pool: PgPool) { /* ... */ }
```

Prérequis et conseils :
- `DATABASE_URL` doit pointer vers un serveur Postgres où l'utilisateur peut créer des bases de données (le service compose `db`)
- Les tests sont isolés les uns des autres et peuvent s'exécuter en parallèle ; ne vous appuyez ni sur l'ordre ni sur des lignes partagées
- Les fixtures sont du SQL brut appliqué dans l'ordre indiqué ; ordonnez-les pour satisfaire les clés étrangères
- Gardez un test distinct pour chaque contrainte (unicité, clé étrangère) sur laquelle l'application s'appuie
- Lancez `cargo sqlx prepare --check --workspace` en CI pour que les macros compilent hors ligne

---

## Tests par propriétés (proptest)

```rust
use proptest::prelude::*;

proptest! {
    #[test]
    fn money_addition_is_commutative(a in 0i64..1_000_000, b in 0i64..1_000_000) {
        prop_assert_eq!(Money::cents(a) + Money::cents(b), Money::cents(b) + Money::cents(a));
    }

    #[test]
    fn email_parse_never_panics(s in ".*") {
        let _ = EmailAddress::parse(&s);
    }
}
```

Utilisez les propriétés pour les parsers, les value objects, les allers-retours de sérialisation et les machines à états. proptest stocke les cas en échec dans `proptest-regressions/` ; versionnez ce répertoire.

## Tests par snapshots (insta)

```rust
#[test]
fn problem_json_for_not_found() {
    let body = render_problem(&AppError::NotFound);
    insta::assert_json_snapshot!(body);
}
```

Relisez les snapshots avec `cargo insta review` ; versionnez les fichiers `.snap` ; ne les acceptez jamais aveuglément. Adapté aux corps d'erreur d'API, aux documents OpenAPI et aux templates rendus.

## Simuler du HTTP externe (wiremock)

```rust
use wiremock::{matchers::{method, path}, Mock, MockServer, ResponseTemplate};

#[tokio::test]
async fn payment_gateway_maps_declines() {
    let server = MockServer::start().await;
    Mock::given(method("POST")).and(path("/charges"))
        .respond_with(ResponseTemplate::new(402))
        .mount(&server)
        .await;

    let gateway = HttpPaymentGateway::new(server.uri());

    assert!(matches!(gateway.charge(1500).await, Err(PaymentError::Declined)));
}
```

N'appelez jamais de vrais services tiers dans les tests.

---

## Tests async et temps

- `#[tokio::test]` pour les tests unitaires async ; `#[tokio::test(flavor = "multi_thread")]` seulement lorsque le code l'exige
- `tokio::time::pause()` (feature `test-util`) avec `advance` rend les timers déterministes ; aucun `sleep` réel
- Évitez les assertions dépendant de l'ordre d'ordonnancement des tâches ; utilisez des channels ou `JoinHandle::await`
- Testez les chemins d'annulation : abandonner la future d'un handler ne doit laisser aucun état partiel (utilisez des transactions)

---

## Exécuter la suite

```bash
docker compose exec app cargo nextest run --workspace
docker compose exec app cargo nextest run --workspace --retries 0 --no-fail-fast
docker compose exec app cargo test --workspace --doc
docker compose exec app cargo llvm-cov nextest --workspace --fail-under-lines 80
docker compose exec app cargo llvm-cov nextest --workspace --html      # target/llvm-cov/html
docker compose exec app cargo mutants --in-diff changes.diff            # mutants on changed code
```

Configurez nextest dans `.config/nextest.toml` :

```toml
[profile.default]
fail-fast = false
slow-timeout = { period = "30s", terminate-after = 2 }

[profile.ci]
retries = 0
junit.path = "junit.xml"
```

`cargo llvm-cov` nécessite le composant rustup `llvm-tools-preview` (déclaré dans `rust-toolchain.toml`). Excluez le code généré et le bootstrap de `main.rs` du rapport avec `--ignore-filename-regex`, et non en abaissant le seuil.

## Couverture attendue

| Couche | Cible |
|--------|-------|
| Domaine et application | >= 90 % |
| Couche HTTP (tests du Router) | >= 80 % |
| Global (cargo-llvm-cov) | >= 80 % |
| Score de mutation (domaine, indicatif) | >= 70 %, mutants survivants triés |
| Parcours critiques | Tests au niveau Router ou de bout en bout |

La couverture ment ; les tests de mutation disent la vérité. Lancez `cargo mutants` sur les crates domain et application dans un job nocturne et traitez les survivants comme des assertions manquantes.

---

## Anti-patterns

| Anti-pattern | Correction |
|--------------|------------|
| Tests qui vérifient l'implémentation (nombre d'appels) | Vérifier le comportement observable |
| Base de données partagée entre tests | `#[sqlx::test]` par test |
| `sleep` pour attendre un travail async | Channels, `tokio::time::pause`, polling avec timeout |
| `#[ignore]` sans ticket | Corriger ou supprimer |
| Fixtures géantes réutilisées partout | Petits builders par test |
| Vrais appels HTTP vers des tiers | wiremock |

---

## Sources

- cargo-nextest 0.9.151 : https://nexte.st/
- sqlx `#[sqlx::test]` : https://docs.rs/sqlx/latest/sqlx/attr.test.html
- Exemple de test axum (`oneshot`) : https://github.com/tokio-rs/axum/tree/main/examples/testing
- cargo-llvm-cov : https://github.com/taiki-e/cargo-llvm-cov
- proptest 1.12.0, insta 1.49.0, cargo-mutants 27.1.0 (crates.io)

## Checklist

- [ ] Tests écrits en premier (Red -> Green -> Refactor)
- [ ] Couverture >= 80 % imposée par cargo-llvm-cov (`--fail-under-lines 80`)
- [ ] Couches unitaire, Router (`oneshot`) et base de données (`#[sqlx::test]`) couvertes
- [ ] Aucun `sleep` ; horloge injectée, `tokio::time::pause` pour les timers
- [ ] HTTP externe simulé (wiremock), jamais réel
- [ ] Autorisation testée : les utilisateurs ne peuvent pas accéder aux données des autres
- [ ] Réponses d'erreur (problem+json) vérifiées, pas seulement les chemins nominaux
- [ ] Chaque correction de bug a un test de non-régression
- [ ] Doc tests exécutés séparément (`cargo test --doc`)
- [ ] Tests de mutation planifiés sur les crates domain et application
