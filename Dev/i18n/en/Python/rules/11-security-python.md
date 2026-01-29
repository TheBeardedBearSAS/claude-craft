# Python Security

## Fundamental Security Principles

### Defense in Depth

Apply multiple layers of security:
1. Validate on both client AND server side
2. Sanitize user data
3. Use HTTPS everywhere
4. Implement rate limiting
5. Apply principle of least privilege
6. Log security events

## Input Validation

### Pydantic for Data Validation

```python
from pydantic import BaseModel, Field, EmailStr, SecretStr, validator
from typing import Annotated
import re

class UserCreate(BaseModel):
    """Secure user creation schema."""

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
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", password):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"[0-9]", password):
            raise ValueError("Password must contain at least one digit")
        if not re.search(r"[^A-Za-z0-9]", password):
            raise ValueError("Password must contain at least one special character")
        return v


class SearchQuery(BaseModel):
    """Secure search query schema."""

    query: Annotated[str, Field(max_length=100)]
    page: Annotated[int, Field(ge=1, le=1000)] = 1
    limit: Annotated[int, Field(ge=1, le=100)] = 20

    @validator("query")
    def sanitize_query(cls, v: str) -> str:
        # Remove potentially dangerous characters
        return re.sub(r"[<>\"';]", "", v).strip()
```

### FastAPI with Validation

```python
from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import ValidationError

app = FastAPI()

@app.post("/users/", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate) -> dict:
    """Create user with validated data."""
    # Pydantic automatically validates the input
    # If validation fails, FastAPI returns 422 Unprocessable Entity

    # Hash password before storing
    hashed_password = hash_password(user.password.get_secret_value())

    return {"username": user.username, "email": user.email}


@app.get("/search/")
async def search(query: SearchQuery = Depends()) -> dict:
    """Search with validated and sanitized query."""
    # query is already validated and sanitized
    results = await perform_search(query.query, query.page, query.limit)
    return {"results": results}
```

## SQL Injection Prevention

### Use Parameterized Queries

```python
# BAD - Vulnerable to SQL injection
async def get_user_unsafe(user_id: str) -> dict:
    query = f"SELECT * FROM users WHERE id = '{user_id}'"  # DANGER!
    return await database.fetch_one(query)

# GOOD - Use parameterized queries
async def get_user_safe(user_id: str) -> dict:
    query = "SELECT * FROM users WHERE id = :user_id"
    return await database.fetch_one(query, {"user_id": user_id})
```

### SQLAlchemy ORM (Recommended)

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import User

async def get_user_by_email(
    session: AsyncSession,
    email: str
) -> User | None:
    """Safely query user by email using ORM."""
    # SQLAlchemy handles parameterization automatically
    stmt = select(User).where(User.email == email)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def search_users(
    session: AsyncSession,
    search_term: str,
    limit: int = 20
) -> list[User]:
    """Safe search with ORM."""
    # Safe: ilike handles escaping
    stmt = (
        select(User)
        .where(User.username.ilike(f"%{search_term}%"))
        .limit(limit)
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())
```

## Authentication & Authorization

### Password Hashing with bcrypt

```python
from passlib.context import CryptContext
from pydantic import SecretStr

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash a password securely."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash."""
    return pwd_context.verify(plain_password, hashed_password)


# Usage
hashed = hash_password("my_secure_password")
is_valid = verify_password("my_secure_password", hashed)
```

### JWT Token Handling

```python
from datetime import datetime, timedelta, timezone
from typing import Any
import jwt
from pydantic import BaseModel

SECRET_KEY = os.environ["JWT_SECRET_KEY"]  # Load from environment
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
    """Create a secure JWT token."""
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
    """Decode and validate a JWT token."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenPayload(**payload)
    except jwt.ExpiredSignatureError:
        raise ValueError("Token has expired")
    except jwt.InvalidTokenError:
        raise ValueError("Invalid token")
```

### FastAPI Dependency for Authentication

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenPayload:
    """Validate token and return current user."""
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
    """Dependency to require specific roles."""
    async def role_checker(
        user: TokenPayload = Depends(get_current_user)
    ) -> TokenPayload:
        if user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        return user
    return role_checker


# Usage
@app.get("/admin/users/")
async def list_users(
    user: TokenPayload = Depends(require_role(["admin"]))
) -> list[dict]:
    """Admin-only endpoint."""
    return await get_all_users()
```

## Secrets Management

### Environment Variables

```python
from pydantic_settings import BaseSettings
from pydantic import SecretStr


class Settings(BaseSettings):
    """Application settings with secure defaults."""

    # Database
    database_url: SecretStr
    database_pool_size: int = 5

    # Authentication
    jwt_secret_key: SecretStr
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # API keys
    api_key: SecretStr

    # External services
    redis_url: SecretStr | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()

# Access secrets safely
db_url = settings.database_url.get_secret_value()
```

### .env.example

```env
# .env.example (commit this file)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET_KEY=your-secret-key-here-change-in-production
API_KEY=your-api-key-here
REDIS_URL=redis://localhost:6379
```

### .gitignore

```gitignore
# Secrets - NEVER commit these
.env
.env.local
.env.production
*.pem
*.key
secrets/
```

## Rate Limiting

### FastAPI with slowapi

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
@limiter.limit("5/minute")  # 5 attempts per minute
async def login(request: Request, credentials: LoginCredentials) -> dict:
    """Login with rate limiting."""
    return await authenticate_user(credentials)


@app.get("/api/search/")
@limiter.limit("100/minute")  # 100 requests per minute
async def search(request: Request, q: str) -> dict:
    """Search with rate limiting."""
    return await perform_search(q)
```

## CORS Configuration

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configure CORS properly
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://example.com",
        "https://app.example.com",
    ],  # Specify exact origins, NOT "*"
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,  # Cache preflight for 10 minutes
)
```

## Secure Headers

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Add security headers to all responses."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # Security headers
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; script-src 'self'"
        )
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = (
            "geolocation=(), microphone=(), camera=()"
        )

        return response


app.add_middleware(SecurityHeadersMiddleware)
```

## Secure Logging

```python
import logging
import re
from typing import Any

class SensitiveDataFilter(logging.Filter):
    """Filter to redact sensitive data from logs."""

    SENSITIVE_PATTERNS = [
        (re.compile(r'"password"\s*:\s*"[^"]*"'), '"password": "[REDACTED]"'),
        (re.compile(r'"token"\s*:\s*"[^"]*"'), '"token": "[REDACTED]"'),
        (re.compile(r'"api_key"\s*:\s*"[^"]*"'), '"api_key": "[REDACTED]"'),
        (re.compile(r'"secret"\s*:\s*"[^"]*"'), '"secret": "[REDACTED]"'),
        (re.compile(r"Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*"),
         "Bearer [REDACTED]"),
    ]

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            for pattern, replacement in self.SENSITIVE_PATTERNS:
                record.msg = pattern.sub(replacement, record.msg)
        return True


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)
logger.addFilter(SensitiveDataFilter())


# Usage
def log_login_attempt(email: str, success: bool) -> None:
    """Log login attempt without sensitive data."""
    logger.info(
        f"Login attempt for {email}: {'success' if success else 'failed'}"
    )
    # Password is never logged!
```

## File Upload Security

```python
from fastapi import UploadFile, HTTPException
from pathlib import Path
import hashlib
import magic  # python-magic library

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".pdf"}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf"
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


async def validate_upload(file: UploadFile) -> bytes:
    """Validate uploaded file for security."""

    # Check file extension
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"File extension {ext} not allowed"
        )

    # Read file content
    content = await file.read()

    # Check file size
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="File too large"
        )

    # Validate MIME type using file content (not just extension)
    mime_type = magic.from_buffer(content, mime=True)
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"File type {mime_type} not allowed"
        )

    return content


def generate_safe_filename(original_filename: str, content: bytes) -> str:
    """Generate a safe filename to prevent path traversal."""
    ext = Path(original_filename).suffix.lower()
    content_hash = hashlib.sha256(content).hexdigest()[:16]
    return f"{content_hash}{ext}"
```

## Dependency Security

### Regular Audits

```bash
# Audit with pip-audit
pip install pip-audit
pip-audit

# Audit with safety
pip install safety
safety check

# Update vulnerable packages
pip-audit --fix
```

### Requirements Pinning

```toml
# pyproject.toml - Pin versions for security
[project]
dependencies = [
    "fastapi>=0.115.0,<0.116.0",
    "pydantic>=2.10.0,<3.0.0",
    "sqlalchemy>=2.0.0,<3.0.0",
]
```

### Dependabot Configuration

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

## Security Checklist

### Before Each Release

- [ ] Audit dependencies (`pip-audit`, `safety check`)
- [ ] No hardcoded secrets in code
- [ ] All endpoints have proper authentication
- [ ] Input validation on all user inputs
- [ ] SQL injection protection (ORM or parameterized queries)
- [ ] Rate limiting on sensitive endpoints
- [ ] CORS properly configured
- [ ] Security headers set
- [ ] Secure logging (no sensitive data)
- [ ] File uploads validated
- [ ] HTTPS enforced
- [ ] Secrets in environment variables

### OWASP Top 10 Awareness

1. **Injection**: Use ORMs, parameterized queries
2. **Broken Authentication**: Secure password hashing, JWT handling
3. **Sensitive Data Exposure**: Encrypt data, use HTTPS
4. **XML External Entities**: Disable XML processing
5. **Broken Access Control**: Role-based access, validate permissions
6. **Security Misconfiguration**: Secure defaults, security headers
7. **Cross-Site Scripting (XSS)**: Sanitize output
8. **Insecure Deserialization**: Validate input, use safe parsers
9. **Vulnerable Components**: Regular dependency audits
10. **Insufficient Logging**: Log security events, protect logs

## Conclusion

Security in Python requires:

1. **Validation**: Strict input validation with Pydantic
2. **Authentication**: Secure password hashing, JWT handling
3. **Authorization**: Role-based access control
4. **Protection**: SQL injection, XSS prevention
5. **Monitoring**: Secure logging, regular audits

**Golden rule**: NEVER trust user input. Always validate, sanitize, and secure.
