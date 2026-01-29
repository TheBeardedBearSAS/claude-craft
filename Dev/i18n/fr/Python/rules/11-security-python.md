# Securite Python

## Principes fondamentaux de securite

### Defense en profondeur

Appliquez plusieurs couches de securite :
1. Validez cote client ET cote serveur
2. Assainissez les donnees utilisateur
3. Utilisez HTTPS partout
4. Implementez la limitation de debit
5. Appliquez le principe du moindre privilege
6. Journalisez les evenements de securite

## Validation des entrees

### Pydantic pour la validation des donnees

```python
from pydantic import BaseModel, Field, EmailStr, SecretStr, validator
from typing import Annotated
import re

class UserCreate(BaseModel):
    """Schema securise de creation d'utilisateur."""

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
            raise ValueError("Le mot de passe doit contenir au moins une lettre majuscule")
        if not re.search(r"[a-z]", password):
            raise ValueError("Le mot de passe doit contenir au moins une lettre minuscule")
        if not re.search(r"[0-9]", password):
            raise ValueError("Le mot de passe doit contenir au moins un chiffre")
        if not re.search(r"[^A-Za-z0-9]", password):
            raise ValueError("Le mot de passe doit contenir au moins un caractere special")
        return v


class SearchQuery(BaseModel):
    """Schema securise de requete de recherche."""

    query: Annotated[str, Field(max_length=100)]
    page: Annotated[int, Field(ge=1, le=1000)] = 1
    limit: Annotated[int, Field(ge=1, le=100)] = 20

    @validator("query")
    def sanitize_query(cls, v: str) -> str:
        # Supprimer les caracteres potentiellement dangereux
        return re.sub(r"[<>\"';]", "", v).strip()
```

### FastAPI avec validation

```python
from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import ValidationError

app = FastAPI()

@app.post("/users/", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate) -> dict:
    """Creer un utilisateur avec des donnees validees."""
    # Pydantic valide automatiquement l'entree
    # Si la validation echoue, FastAPI retourne 422 Unprocessable Entity

    # Hacher le mot de passe avant stockage
    hashed_password = hash_password(user.password.get_secret_value())

    return {"username": user.username, "email": user.email}


@app.get("/search/")
async def search(query: SearchQuery = Depends()) -> dict:
    """Recherche avec requete validee et assainie."""
    # query est deja validee et assainie
    results = await perform_search(query.query, query.page, query.limit)
    return {"results": results}
```

## Prevention des injections SQL

### Utiliser des requetes parametrees

```python
# MAUVAIS - Vulnerable aux injections SQL
async def get_user_unsafe(user_id: str) -> dict:
    query = f"SELECT * FROM users WHERE id = '{user_id}'"  # DANGER !
    return await database.fetch_one(query)

# BON - Utiliser des requetes parametrees
async def get_user_safe(user_id: str) -> dict:
    query = "SELECT * FROM users WHERE id = :user_id"
    return await database.fetch_one(query, {"user_id": user_id})
```

### SQLAlchemy ORM (recommande)

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import User

async def get_user_by_email(
    session: AsyncSession,
    email: str
) -> User | None:
    """Requete securisee d'utilisateur par email avec ORM."""
    # SQLAlchemy gere automatiquement le parametrage
    stmt = select(User).where(User.email == email)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def search_users(
    session: AsyncSession,
    search_term: str,
    limit: int = 20
) -> list[User]:
    """Recherche securisee avec ORM."""
    # Securise : ilike gere l'echappement
    stmt = (
        select(User)
        .where(User.username.ilike(f"%{search_term}%"))
        .limit(limit)
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())
```

## Authentification et autorisation

### Hachage de mot de passe avec bcrypt

```python
from passlib.context import CryptContext
from pydantic import SecretStr

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hacher un mot de passe de maniere securisee."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifier un mot de passe par rapport a son hachage."""
    return pwd_context.verify(plain_password, hashed_password)


# Utilisation
hashed = hash_password("my_secure_password")
is_valid = verify_password("my_secure_password", hashed)
```

### Gestion des tokens JWT

```python
from datetime import datetime, timedelta, timezone
from typing import Any
import jwt
from pydantic import BaseModel

SECRET_KEY = os.environ["JWT_SECRET_KEY"]  # Charger depuis l'environnement
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
    """Creer un token JWT securise."""
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
    """Decoder et valider un token JWT."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenPayload(**payload)
    except jwt.ExpiredSignatureError:
        raise ValueError("Le token a expire")
    except jwt.InvalidTokenError:
        raise ValueError("Token invalide")
```

### Dependance FastAPI pour l'authentification

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenPayload:
    """Valider le token et retourner l'utilisateur actuel."""
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
    """Dependance pour exiger des roles specifiques."""
    async def role_checker(
        user: TokenPayload = Depends(get_current_user)
    ) -> TokenPayload:
        if user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permissions insuffisantes"
            )
        return user
    return role_checker


# Utilisation
@app.get("/admin/users/")
async def list_users(
    user: TokenPayload = Depends(require_role(["admin"]))
) -> list[dict]:
    """Endpoint reserve aux administrateurs."""
    return await get_all_users()
```

## Gestion des secrets

### Variables d'environnement

```python
from pydantic_settings import BaseSettings
from pydantic import SecretStr


class Settings(BaseSettings):
    """Parametres d'application avec des valeurs par defaut securisees."""

    # Base de donnees
    database_url: SecretStr
    database_pool_size: int = 5

    # Authentification
    jwt_secret_key: SecretStr
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Cles API
    api_key: SecretStr

    # Services externes
    redis_url: SecretStr | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()

# Acceder aux secrets en toute securite
db_url = settings.database_url.get_secret_value()
```

### .env.example

```env
# .env.example (commitez ce fichier)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET_KEY=your-secret-key-here-change-in-production
API_KEY=your-api-key-here
REDIS_URL=redis://localhost:6379
```

### .gitignore

```gitignore
# Secrets - NE JAMAIS commiter ces fichiers
.env
.env.local
.env.production
*.pem
*.key
secrets/
```

## Limitation de debit

### FastAPI avec slowapi

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
@limiter.limit("5/minute")  # 5 tentatives par minute
async def login(request: Request, credentials: LoginCredentials) -> dict:
    """Connexion avec limitation de debit."""
    return await authenticate_user(credentials)


@app.get("/api/search/")
@limiter.limit("100/minute")  # 100 requetes par minute
async def search(request: Request, q: str) -> dict:
    """Recherche avec limitation de debit."""
    return await perform_search(q)
```

## Configuration CORS

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configurer CORS correctement
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://example.com",
        "https://app.example.com",
    ],  # Specifier les origines exactes, PAS "*"
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,  # Mettre en cache le preflight pendant 10 minutes
)
```

## En-tetes de securite

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Ajouter des en-tetes de securite a toutes les reponses."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # En-tetes de securite
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

## Journalisation securisee

```python
import logging
import re
from typing import Any

class SensitiveDataFilter(logging.Filter):
    """Filtre pour caviarder les donnees sensibles des logs."""

    SENSITIVE_PATTERNS = [
        (re.compile(r'"password"\s*:\s*"[^"]*"'), '"password": "[CAVIARDE]"'),
        (re.compile(r'"token"\s*:\s*"[^"]*"'), '"token": "[CAVIARDE]"'),
        (re.compile(r'"api_key"\s*:\s*"[^"]*"'), '"api_key": "[CAVIARDE]"'),
        (re.compile(r'"secret"\s*:\s*"[^"]*"'), '"secret": "[CAVIARDE]"'),
        (re.compile(r"Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*"),
         "Bearer [CAVIARDE]"),
    ]

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            for pattern, replacement in self.SENSITIVE_PATTERNS:
                record.msg = pattern.sub(replacement, record.msg)
        return True


# Configurer la journalisation
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)
logger.addFilter(SensitiveDataFilter())


# Utilisation
def log_login_attempt(email: str, success: bool) -> None:
    """Journaliser les tentatives de connexion sans donnees sensibles."""
    logger.info(
        f"Tentative de connexion pour {email}: {'succes' if success else 'echec'}"
    )
    # Le mot de passe n'est jamais journalise !
```

## Securite des telechargements de fichiers

```python
from fastapi import UploadFile, HTTPException
from pathlib import Path
import hashlib
import magic  # Bibliotheque python-magic

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".pdf"}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf"
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 Mo


async def validate_upload(file: UploadFile) -> bytes:
    """Valider le fichier telecharge pour la securite."""

    # Verifier l'extension du fichier
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Extension de fichier {ext} non autorisee"
        )

    # Lire le contenu du fichier
    content = await file.read()

    # Verifier la taille du fichier
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Fichier trop volumineux"
        )

    # Valider le type MIME en utilisant le contenu du fichier (pas seulement l'extension)
    mime_type = magic.from_buffer(content, mime=True)
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Type de fichier {mime_type} non autorise"
        )

    return content


def generate_safe_filename(original_filename: str, content: bytes) -> str:
    """Generer un nom de fichier securise pour prevenir le path traversal."""
    ext = Path(original_filename).suffix.lower()
    content_hash = hashlib.sha256(content).hexdigest()[:16]
    return f"{content_hash}{ext}"
```

## Securite des dependances

### Audits reguliers

```bash
# Audit avec pip-audit
pip install pip-audit
pip-audit

# Audit avec safety
pip install safety
safety check

# Mettre a jour les paquets vulnerables
pip-audit --fix
```

### Epinglage des versions

```toml
# pyproject.toml - Epingler les versions pour la securite
[project]
dependencies = [
    "fastapi>=0.115.0,<0.116.0",
    "pydantic>=2.10.0,<3.0.0",
    "sqlalchemy>=2.0.0,<3.0.0",
]
```

### Configuration Dependabot

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

## Liste de verification de securite

### Avant chaque release

- [ ] Auditer les dependances (`pip-audit`, `safety check`)
- [ ] Pas de secrets codes en dur dans le code
- [ ] Tous les endpoints ont une authentification appropriee
- [ ] Validation des entrees sur toutes les donnees utilisateur
- [ ] Protection contre les injections SQL (ORM ou requetes parametrees)
- [ ] Limitation de debit sur les endpoints sensibles
- [ ] CORS correctement configure
- [ ] En-tetes de securite definis
- [ ] Journalisation securisee (pas de donnees sensibles)
- [ ] Telechargements de fichiers valides
- [ ] HTTPS impose
- [ ] Secrets dans les variables d'environnement

### Sensibilisation OWASP Top 10

1. **Injection** : Utiliser les ORMs, requetes parametrees
2. **Authentification defaillante** : Hachage securise des mots de passe, gestion JWT
3. **Exposition de donnees sensibles** : Chiffrer les donnees, utiliser HTTPS
4. **Entites externes XML** : Desactiver le traitement XML
5. **Controle d'acces defaillant** : Acces base sur les roles, valider les permissions
6. **Mauvaise configuration de securite** : Valeurs par defaut securisees, en-tetes de securite
7. **Cross-Site Scripting (XSS)** : Assainir les sorties
8. **Deserialisation non securisee** : Valider les entrees, utiliser des parseurs securises
9. **Composants vulnerables** : Audits reguliers des dependances
10. **Journalisation insuffisante** : Journaliser les evenements de securite, proteger les logs

## Conclusion

La securite en Python necessite :

1. **Validation** : Validation stricte des entrees avec Pydantic
2. **Authentification** : Hachage securise des mots de passe, gestion JWT
3. **Autorisation** : Controle d'acces base sur les roles
4. **Protection** : Prevention des injections SQL, XSS
5. **Surveillance** : Journalisation securisee, audits reguliers

**Regle d'or** : NE JAMAIS faire confiance aux entrees utilisateur. Toujours valider, assainir et securiser.
