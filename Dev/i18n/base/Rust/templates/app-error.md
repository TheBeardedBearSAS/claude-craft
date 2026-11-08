# Template: AppError (thiserror + IntoResponse, RFC 9457)

One error type for the HTTP layer. Domain and application crates keep their own `thiserror` enums; `AppError` maps them to HTTP. Every failure renders as `application/problem+json` (RFC 9457). Internal details are logged, never returned.

## Conventions

- `thiserror` in library crates; `anyhow` only in binaries (`main`, CLI tools), never inside `AppError` paths of the HTTP crate
- One `impl IntoResponse for AppError`; handlers return `Result<T, AppError>`
- `From` impls convert domain errors, `sqlx::Error` and extractor rejections so `?` works in handlers
- Match domain error enums exhaustively (no wildcard) so a new variant forces a mapping decision
- 5xx responses carry a generic `detail`; the cause goes to `tracing::error!`

## Domain Error (domain crate, no HTTP knowledge)

```rust
// crates/domain/src/user.rs
#[derive(Debug, thiserror::Error)]
pub enum UserError {
    #[error("invalid email address")]
    InvalidEmail,
    #[error("password must contain at least 12 characters")]
    WeakPassword,
    #[error("email already registered")]
    EmailTaken,
}
```

## Problem Details Body

```rust
// crates/http/src/error.rs
use serde::Serialize;

/// RFC 9457 problem details. `type` is a stable URI identifying the problem class.
#[derive(Debug, Serialize)]
struct Problem<'a> {
    #[serde(rename = "type")]
    kind: &'a str,
    title: &'a str,
    status: u16,
    #[serde(skip_serializing_if = "Option::is_none")]
    detail: Option<String>,
    /// Extension member: per-field validation errors.
    #[serde(skip_serializing_if = "Vec::is_empty")]
    errors: Vec<FieldError>,
}

#[derive(Debug, Clone, Serialize)]
pub struct FieldError {
    pub field: &'static str,
    pub message: String,
}
```

## AppError

```rust
// crates/http/src/error.rs (continued)
use axum::{
    extract::rejection::JsonRejection,
    http::{StatusCode, header},
    response::{IntoResponse, Response},
    Json,
};

use domain::user::UserError;

#[derive(Debug, thiserror::Error)]
pub enum AppError {
    #[error("validation failed")]
    Validation(Vec<FieldError>),
    #[error("malformed request body: {0}")]
    BadRequest(String),
    #[error("authentication required")]
    Unauthorized,
    #[error("access denied")]
    Forbidden,
    #[error("resource not found")]
    NotFound,
    #[error("conflict: {0}")]
    Conflict(&'static str),
    #[error("internal error")]
    Internal(#[source] Box<dyn std::error::Error + Send + Sync>),
}

impl AppError {
    fn parts(&self) -> (StatusCode, &'static str, &'static str) {
        match self {
            Self::Validation(_) => (StatusCode::UNPROCESSABLE_ENTITY, "validation-failed", "Validation failed"),
            Self::BadRequest(_) => (StatusCode::BAD_REQUEST, "bad-request", "Malformed request"),
            Self::Unauthorized => (StatusCode::UNAUTHORIZED, "unauthorized", "Authentication required"),
            Self::Forbidden => (StatusCode::FORBIDDEN, "forbidden", "Access denied"),
            Self::NotFound => (StatusCode::NOT_FOUND, "not-found", "Resource not found"),
            Self::Conflict(_) => (StatusCode::CONFLICT, "conflict", "Conflict"),
            Self::Internal(_) => (StatusCode::INTERNAL_SERVER_ERROR, "internal", "Internal server error"),
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, slug, title) = self.parts();

        // Log the cause of server errors; never send it to the client.
        if let Self::Internal(source) = &self {
            tracing::error!(error = %source, "internal error");
        }

        let kind = format!("https://errors.example.com/{slug}"); // replace with your own problem type URIs
        let (detail, errors) = match self {
            Self::Validation(errors) => (None, errors),
            Self::BadRequest(msg) => (Some(msg), Vec::new()),
            Self::Conflict(msg) => (Some(msg.to_owned()), Vec::new()),
            Self::Unauthorized | Self::Forbidden | Self::NotFound | Self::Internal(_) => (None, Vec::new()),
        };

        let body = Problem { kind: &kind, title, status: status.as_u16(), detail, errors };
        (status, [(header::CONTENT_TYPE, "application/problem+json")], Json(body)).into_response()
    }
}
```

## Conversions

```rust
// crates/http/src/error.rs (continued)
impl From<UserError> for AppError {
    fn from(err: UserError) -> Self {
        match err {
            UserError::InvalidEmail => Self::Validation(vec![FieldError {
                field: "email",
                message: err.to_string(),
            }]),
            UserError::WeakPassword => Self::Validation(vec![FieldError {
                field: "password",
                message: err.to_string(),
            }]),
            UserError::EmailTaken => Self::Conflict("email already registered"),
        }
    }
}

impl From<sqlx::Error> for AppError {
    fn from(err: sqlx::Error) -> Self {
        match err {
            sqlx::Error::RowNotFound => Self::NotFound,
            sqlx::Error::Database(db) if db.is_unique_violation() => Self::Conflict("resource already exists"),
            other => Self::Internal(Box::new(other)),
        }
    }
}

impl From<JsonRejection> for AppError {
    fn from(rejection: JsonRejection) -> Self {
        Self::BadRequest(rejection.body_text())
    }
}
```

`JsonRejection` is `#[non_exhaustive]`, so converting through `body_text()` avoids matching its variants. Use it in a handler as `payload: Result<Json<Dto>, JsonRejection>` and then `let Json(dto) = payload?;`.

## Usage

```rust
async fn show(State(state): State<AppState>, Path(id): Path<Uuid>) -> Result<Json<UserResponse>, AppError> {
    let user = state.users.find(id).await?.ok_or(AppError::NotFound)?; // sqlx::Error -> AppError via `?`
    Ok(Json(user.into()))
}
```

## Tests to write with it

- Each variant maps to the expected status and `Content-Type: application/problem+json`
- A 5xx body contains no cause, SQL text or file path
- A unique-violation `sqlx::Error` becomes 409, `RowNotFound` becomes 404
- A malformed JSON body becomes 400 and a missing `Content-Type` is reported without panicking

## Notes

- `anyhow::Error` is acceptable at the very edge in `main` (startup failures), not as a variant that hides typed errors
- Add `CatchPanicLayer` (tower-http) as a last resort; panics are bugs, not control flow
- Keep problem `type` URIs stable and documented in the OpenAPI document
