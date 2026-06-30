# Python-Sicherheit

## Grundlegende Sicherheitsprinzipien

### Verteidigung in der Tiefe

Wenden Sie mehrere Sicherheitsebenen an:
1. Validieren Sie sowohl auf Client- ALS AUCH auf Serverseite
2. Bereinigen Sie Benutzerdaten
3. Verwenden Sie ueberall HTTPS
4. Implementieren Sie Rate-Limiting
5. Wenden Sie das Prinzip der minimalen Berechtigung an
6. Protokollieren Sie Sicherheitsereignisse

## Eingabevalidierung

### Pydantic fuer Datenvalidierung

```python
from pydantic import BaseModel, Field, EmailStr, SecretStr, validator
from typing import Annotated
import re

class UserCreate(BaseModel):
    """Sicheres Benutzer-Erstellungsschema."""

    username: Annotated[
        str,
        Field(min_length=3, max_length=20, pattern=r"^[a-zA-Z0-9_]+$")
    ]
    email: EmailStr
    password: SecretStr = Field(min_length=8, max_length=128)

    @validator("password")
    def validate_password_strength(cls, v: SecretStr) -> SecretStr:
        password = v.get_secret_value()
        if not re.search(r"[A-Z]", password):
            raise ValueError("Das Passwort muss mindestens einen Grossbuchstaben enthalten")
        if not re.search(r"[a-z]", password):
            raise ValueError("Das Passwort muss mindestens einen Kleinbuchstaben enthalten")
        if not re.search(r"[0-9]", password):
            raise ValueError("Das Passwort muss mindestens eine Ziffer enthalten")
        if not re.search(r"[^A-Za-z0-9]", password):
            raise ValueError("Das Passwort muss mindestens ein Sonderzeichen enthalten")
        return v


class SearchQuery(BaseModel):
    """Sicheres Suchabfrage-Schema."""

    query: Annotated[str, Field(max_length=100)]
    page: Annotated[int, Field(ge=1, le=1000)] = 1
    limit: Annotated[int, Field(ge=1, le=100)] = 20

    @validator("query")
    def sanitize_query(cls, v: str) -> str:
        # Potenziell gefaehrliche Zeichen entfernen
        return re.sub(r"[<>\"';]", "", v).strip()
```

### FastAPI mit Validierung

```python
from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import ValidationError

app = FastAPI()

@app.post("/users/", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate) -> dict:
    """Benutzer mit validierten Daten erstellen."""
    # Pydantic validiert die Eingabe automatisch
    # Bei fehlgeschlagener Validierung gibt FastAPI 422 Unprocessable Entity zurueck

    # Passwort vor dem Speichern hashen
    hashed_password = hash_password(user.password.get_secret_value())

    return {"username": user.username, "email": user.email}


@app.get("/search/")
async def search(query: SearchQuery = Depends()) -> dict:
    """Suche mit validierter und bereinigter Abfrage."""
    # query ist bereits validiert und bereinigt
    results = await perform_search(query.query, query.page, query.limit)
    return {"results": results}
```

## SQL-Injection-Praevention

### Parametrisierte Abfragen verwenden

```python
# SCHLECHT - Anfaellig fuer SQL-Injection
async def get_user_unsafe(user_id: str) -> dict:
    query = f"SELECT * FROM users WHERE id = '{user_id}'"  # GEFAHR!
    return await database.fetch_one(query)

# GUT - Parametrisierte Abfragen verwenden
async def get_user_safe(user_id: str) -> dict:
    query = "SELECT * FROM users WHERE id = :user_id"
    return await database.fetch_one(query, {"user_id": user_id})
```

### SQLAlchemy ORM (empfohlen)

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import User

async def get_user_by_email(
    session: AsyncSession,
    email: str
) -> User | None:
    """Sichere Benutzerabfrage per Email mit ORM."""
    # SQLAlchemy behandelt Parametrisierung automatisch
    stmt = select(User).where(User.email == email)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def search_users(
    session: AsyncSession,
    search_term: str,
    limit: int = 20
) -> list[User]:
    """Sichere Suche mit ORM."""
    # Sicher: ilike behandelt Escaping
    stmt = (
        select(User)
        .where(User.username.ilike(f"%{search_term}%"))
        .limit(limit)
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())
```

## Authentifizierung und Autorisierung

### Passwort-Hashing mit Argon2id (pwdlib)

> **passlib wird seit 2020 nicht mehr gepflegt und ist inkompatibel mit Python 3.13+ (das benoetigte `crypt`-Standardmodul wurde entfernt). bcrypt ist in neuem Code durch Projektregel 11 ausdruecklich verboten (OWASP-2026-Vorgabe: Argon2id). Stattdessen `pwdlib` mit Argon2id verwenden.**

```python
# pip install pwdlib[argon2]
from pwdlib import PasswordHash
from pydantic import SecretStr

pwd_hash = PasswordHash.recommended()  # standardmaessig Argon2id


def hash_password(password: str) -> str:
    """Ein Passwort sicher mit Argon2id hashen."""
    return pwd_hash.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Ein Passwort gegen seinen Argon2id-Hash verifizieren."""
    return pwd_hash.verify(plain_password, hashed_password)


# Verwendung
hashed = hash_password("my_secure_password")
is_valid = verify_password("my_secure_password", hashed)
```

### JWT-Token-Behandlung

```python
from datetime import datetime, timedelta, timezone
from typing import Any
import jwt
from pydantic import BaseModel

SECRET_KEY = os.environ["JWT_SECRET_KEY"]  # Aus Umgebung laden
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


class TokenPayload(BaseModel):
    sub: str
    exp: datetime
    iat: datetime
    role: str


def create_access_token(
    user_id: str,
    role: str,
    expires_delta: timedelta | None = None
) -> str:
    """Einen sicheren JWT-Token erstellen."""
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    payload = {
        "sub": user_id,
        "role": role,
        "exp": expire,
        "iat": now,
    }

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> TokenPayload:
    """Einen JWT-Token dekodieren und validieren."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenPayload(**payload)
    except jwt.ExpiredSignatureError:
        raise ValueError("Token ist abgelaufen")
    except jwt.InvalidTokenError:
        raise ValueError("Ungueltiger Token")
```

### FastAPI-Abhaengigkeit fuer Authentifizierung

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenPayload:
    """Token validieren und aktuellen Benutzer zurueckgeben."""
    try:
        payload = decode_token(credentials.credentials)
        return payload
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_role(required_roles: list[str]):
    """Abhaengigkeit fuer bestimmte Rollen."""
    async def role_checker(
        user: TokenPayload = Depends(get_current_user)
    ) -> TokenPayload:
        if user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unzureichende Berechtigungen"
            )
        return user
    return role_checker


# Verwendung
@app.get("/admin/users/")
async def list_users(
    user: TokenPayload = Depends(require_role(["admin"]))
) -> list[dict]:
    """Nur-Admin-Endpunkt."""
    return await get_all_users()
```

## Secrets-Verwaltung

### Umgebungsvariablen

```python
from pydantic_settings import BaseSettings
from pydantic import SecretStr


class Settings(BaseSettings):
    """Anwendungseinstellungen mit sicheren Standardwerten."""

    # Datenbank
    database_url: SecretStr
    database_pool_size: int = 5

    # Authentifizierung
    jwt_secret_key: SecretStr
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # API-Schluessel
    api_key: SecretStr

    # Externe Dienste
    redis_url: SecretStr | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()

# Sicher auf Secrets zugreifen
db_url = settings.database_url.get_secret_value()
```

### .env.example

```env
# .env.example (diese Datei committen)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET_KEY=your-secret-key-here-change-in-production
API_KEY=your-api-key-here
REDIS_URL=redis://localhost:6379
```

### .gitignore

```gitignore
# Secrets - Diese NIEMALS committen
.env
.env.local
.env.production
*.pem
*.key
secrets/
```

## Rate-Limiting

### FastAPI mit slowapi

```python
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import FastAPI, Request

limiter = Limiter(key_func=get_remote_address)
app = FastAPI()
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


@app.post("/login/")
@limiter.limit("5/minute")  # 5 Versuche pro Minute
async def login(request: Request, credentials: LoginCredentials) -> dict:
    """Anmeldung mit Rate-Limiting."""
    return await authenticate_user(credentials)


@app.get("/api/search/")
@limiter.limit("100/minute")  # 100 Anfragen pro Minute
async def search(request: Request, q: str) -> dict:
    """Suche mit Rate-Limiting."""
    return await perform_search(q)
```

## CORS-Konfiguration

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# CORS korrekt konfigurieren
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://example.com",
        "https://app.example.com",
    ],  # Genaue Origins angeben, NICHT "*"
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,  # Preflight fuer 10 Minuten cachen
)
```

## Sicherheits-Header

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Sicherheits-Header zu allen Antworten hinzufuegen."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # Sicherheits-Header — X-XSS-Protection ist veraltet, stattdessen CSP Level 3 verwenden
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains; preload"
        )
        response.headers["Cross-Origin-Opener-Policy"] = "same-origin"
        response.headers["Cross-Origin-Embedder-Policy"] = "require-corp"
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; script-src 'self'; style-src 'self';"
            " frame-ancestors 'none'; upgrade-insecure-requests"
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=()"
        )

        return response


app.add_middleware(SecurityHeadersMiddleware)
```

## Sichere Protokollierung

```python
import logging
import re
from typing import Any

class SensitiveDataFilter(logging.Filter):
    """Filter zum Schwärzen sensibler Daten in Logs."""

    SENSITIVE_PATTERNS = [
        (re.compile(r'"password"\s*:\s*"[^"]*"'), '"password": "[GESCHWÄRZT]"'),
        (re.compile(r'"token"\s*:\s*"[^"]*"'), '"token": "[GESCHWÄRZT]"'),
        (re.compile(r'"api_key"\s*:\s*"[^"]*"'), '"api_key": "[GESCHWÄRZT]"'),
        (re.compile(r'"secret"\s*:\s*"[^"]*"'), '"secret": "[GESCHWÄRZT]"'),
        (re.compile(r"Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*"),
         "Bearer [GESCHWÄRZT]"),
    ]

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            for pattern, replacement in self.SENSITIVE_PATTERNS:
                record.msg = pattern.sub(replacement, record.msg)
        return True


# Protokollierung konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)
logger.addFilter(SensitiveDataFilter())


# Verwendung
def log_login_attempt(email: str, success: bool) -> None:
    """Anmeldeversuch ohne sensible Daten protokollieren."""
    logger.info(
        f"Anmeldeversuch fuer {email}: {'erfolgreich' if success else 'fehlgeschlagen'}"
    )
    # Das Passwort wird niemals protokolliert!
```

## Datei-Upload-Sicherheit

```python
from fastapi import UploadFile, HTTPException
from pathlib import Path
import hashlib
import magic  # python-magic Bibliothek

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".pdf"}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf"
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


async def validate_upload(file: UploadFile) -> bytes:
    """Hochgeladene Datei auf Sicherheit validieren."""

    # Dateierweiterung pruefen
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Dateierweiterung {ext} nicht erlaubt"
        )

    # Dateiinhalt lesen
    content = await file.read()

    # Dateigroesse pruefen
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Datei zu gross"
        )

    # MIME-Typ anhand des Dateiinhalts validieren (nicht nur Erweiterung)
    mime_type = magic.from_buffer(content, mime=True)
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Dateityp {mime_type} nicht erlaubt"
        )

    return content


def generate_safe_filename(original_filename: str, content: bytes) -> str:
    """Sicheren Dateinamen generieren um Path-Traversal zu verhindern."""
    ext = Path(original_filename).suffix.lower()
    content_hash = hashlib.sha256(content).hexdigest()[:16]
    return f"{content_hash}{ext}"
```

## Abhaengigkeits-Sicherheit

### Regelmaessige Audits

```bash
# Audit mit pip-audit
pip install pip-audit
pip-audit

# Audit mit safety
pip install safety
safety check

# Verwundbare Pakete aktualisieren
pip-audit --fix
```

### Versions-Pinning

```toml
# pyproject.toml - Versionen fuer Sicherheit pinnen
[project]
dependencies = [
    "fastapi>=0.115.0,<0.116.0",
    "pydantic>=2.10.0,<3.0.0",
    "sqlalchemy>=2.0.0,<3.0.0",
]
```

### Dependabot-Konfiguration

```yaml
# .github/dependabot.yml
version: 2
updates:
  - package-ecosystem: "pip"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "security"
```

## Sicherheits-Checkliste

### Vor jeder Veroeffentlichung

- [ ] Abhaengigkeiten auditieren (`pip-audit`, `safety check`)
- [ ] Keine hartkodierten Secrets im Code
- [ ] Alle Endpunkte haben korrekte Authentifizierung
- [ ] Eingabevalidierung fuer alle Benutzereingaben
- [ ] SQL-Injection-Schutz (ORM oder parametrisierte Abfragen)
- [ ] Rate-Limiting fuer sensible Endpunkte
- [ ] CORS korrekt konfiguriert
- [ ] Sicherheits-Header gesetzt
- [ ] Sichere Protokollierung (keine sensiblen Daten)
- [ ] Datei-Uploads validiert
- [ ] HTTPS erzwungen
- [ ] Secrets in Umgebungsvariablen

### OWASP Top 10 Bewusstsein

1. **Injection**: ORMs, parametrisierte Abfragen verwenden
2. **Fehlerhafte Authentifizierung**: Sicheres Passwort-Hashing, JWT-Behandlung
3. **Offenlegung sensibler Daten**: Daten verschluesseln, HTTPS verwenden
4. **XML External Entities**: XML-Verarbeitung deaktivieren
5. **Fehlerhafte Zugriffskontrolle**: Rollenbasierter Zugriff, Berechtigungen validieren
6. **Sicherheits-Fehlkonfiguration**: Sichere Standardwerte, Sicherheits-Header
7. **Cross-Site Scripting (XSS)**: Ausgabe bereinigen
8. **Unsichere Deserialisierung**: Eingabe validieren, sichere Parser verwenden
9. **Verwundbare Komponenten**: Regelmaessige Abhaengigkeits-Audits
10. **Unzureichende Protokollierung**: Sicherheitsereignisse protokollieren, Logs schuetzen

## Fazit

Sicherheit in Python erfordert:

1. **Validierung**: Strikte Eingabevalidierung mit Pydantic
2. **Authentifizierung**: Sicheres Passwort-Hashing, JWT-Behandlung
3. **Autorisierung**: Rollenbasierte Zugriffskontrolle
4. **Schutz**: SQL-Injection-, XSS-Praevention
5. **Ueberwachung**: Sichere Protokollierung, regelmaessige Audits

**Goldene Regel**: Benutzereingaben NIEMALS vertrauen. Immer validieren, bereinigen und absichern.
