# Seguridad en Python

## Principios fundamentales de seguridad

### Defensa en profundidad

Aplique multiples capas de seguridad:
1. Valide tanto en el cliente COMO en el servidor
2. Sanee los datos del usuario
3. Use HTTPS en todas partes
4. Implemente limitacion de tasa
5. Aplique el principio de minimo privilegio
6. Registre eventos de seguridad

## Validacion de entradas

### Pydantic para validacion de datos

```python
from pydantic import BaseModel, Field, EmailStr, SecretStr, validator
from typing import Annotated
import re

class UserCreate(BaseModel):
    """Esquema seguro de creacion de usuario."""

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
            raise ValueError("La contrasena debe contener al menos una letra mayuscula")
        if not re.search(r"[a-z]", password):
            raise ValueError("La contrasena debe contener al menos una letra minuscula")
        if not re.search(r"[0-9]", password):
            raise ValueError("La contrasena debe contener al menos un digito")
        if not re.search(r"[^A-Za-z0-9]", password):
            raise ValueError("La contrasena debe contener al menos un caracter especial")
        return v


class SearchQuery(BaseModel):
    """Esquema seguro de consulta de busqueda."""

    query: Annotated[str, Field(max_length=100)]
    page: Annotated[int, Field(ge=1, le=1000)] = 1
    limit: Annotated[int, Field(ge=1, le=100)] = 20

    @validator("query")
    def sanitize_query(cls, v: str) -> str:
        # Eliminar caracteres potencialmente peligrosos
        return re.sub(r"[<>\"';]", "", v).strip()
```

### FastAPI con validacion

```python
from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import ValidationError

app = FastAPI()

@app.post("/users/", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate) -> dict:
    """Crear usuario con datos validados."""
    # Pydantic valida automaticamente la entrada
    # Si la validacion falla, FastAPI retorna 422 Unprocessable Entity

    # Hashear contrasena antes de almacenar
    hashed_password = hash_password(user.password.get_secret_value())

    return {"username": user.username, "email": user.email}


@app.get("/search/")
async def search(query: SearchQuery = Depends()) -> dict:
    """Busqueda con consulta validada y saneada."""
    # query ya esta validada y saneada
    results = await perform_search(query.query, query.page, query.limit)
    return {"results": results}
```

## Prevencion de inyeccion SQL

### Usar consultas parametrizadas

```python
# MALO - Vulnerable a inyeccion SQL
async def get_user_unsafe(user_id: str) -> dict:
    query = f"SELECT * FROM users WHERE id = '{user_id}'"  # PELIGRO!
    return await database.fetch_one(query)

# BUENO - Usar consultas parametrizadas
async def get_user_safe(user_id: str) -> dict:
    query = "SELECT * FROM users WHERE id = :user_id"
    return await database.fetch_one(query, {"user_id": user_id})
```

### SQLAlchemy ORM (recomendado)

```python
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from models import User

async def get_user_by_email(
    session: AsyncSession,
    email: str
) -> User | None:
    """Consulta segura de usuario por email usando ORM."""
    # SQLAlchemy maneja la parametrizacion automaticamente
    stmt = select(User).where(User.email == email)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def search_users(
    session: AsyncSession,
    search_term: str,
    limit: int = 20
) -> list[User]:
    """Busqueda segura con ORM."""
    # Seguro: ilike maneja el escape
    stmt = (
        select(User)
        .where(User.username.ilike(f"%{search_term}%"))
        .limit(limit)
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())
```

## Autenticacion y autorizacion

### Hash de contrasenas con bcrypt

```python
from passlib.context import CryptContext
from pydantic import SecretStr

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hashear una contrasena de forma segura."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar una contrasena contra su hash."""
    return pwd_context.verify(plain_password, hashed_password)


# Uso
hashed = hash_password("my_secure_password")
is_valid = verify_password("my_secure_password", hashed)
```

### Manejo de tokens JWT

```python
from datetime import datetime, timedelta, timezone
from typing import Any
import jwt
from pydantic import BaseModel

SECRET_KEY = os.environ["JWT_SECRET_KEY"]  # Cargar desde el entorno
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
    """Crear un token JWT seguro."""
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
    """Decodificar y validar un token JWT."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenPayload(**payload)
    except jwt.ExpiredSignatureError:
        raise ValueError("El token ha expirado")
    except jwt.InvalidTokenError:
        raise ValueError("Token invalido")
```

### Dependencia FastAPI para autenticacion

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenPayload:
    """Validar token y retornar usuario actual."""
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
    """Dependencia para requerir roles especificos."""
    async def role_checker(
        user: TokenPayload = Depends(get_current_user)
    ) -> TokenPayload:
        if user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permisos insuficientes"
            )
        return user
    return role_checker


# Uso
@app.get("/admin/users/")
async def list_users(
    user: TokenPayload = Depends(require_role(["admin"]))
) -> list[dict]:
    """Endpoint solo para administradores."""
    return await get_all_users()
```

## Gestion de secretos

### Variables de entorno

```python
from pydantic_settings import BaseSettings
from pydantic import SecretStr


class Settings(BaseSettings):
    """Configuracion de aplicacion con valores por defecto seguros."""

    # Base de datos
    database_url: SecretStr
    database_pool_size: int = 5

    # Autenticacion
    jwt_secret_key: SecretStr
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Claves API
    api_key: SecretStr

    # Servicios externos
    redis_url: SecretStr | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()

# Acceder a secretos de forma segura
db_url = settings.database_url.get_secret_value()
```

### .env.example

```env
# .env.example (haga commit de este archivo)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET_KEY=your-secret-key-here-change-in-production
API_KEY=your-api-key-here
REDIS_URL=redis://localhost:6379
```

### .gitignore

```gitignore
# Secretos - NUNCA haga commit de estos
.env
.env.local
.env.production
*.pem
*.key
secrets/
```

## Limitacion de tasa

### FastAPI con slowapi

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
@limiter.limit("5/minute")  # 5 intentos por minuto
async def login(request: Request, credentials: LoginCredentials) -> dict:
    """Inicio de sesion con limitacion de tasa."""
    return await authenticate_user(credentials)


@app.get("/api/search/")
@limiter.limit("100/minute")  # 100 solicitudes por minuto
async def search(request: Request, q: str) -> dict:
    """Busqueda con limitacion de tasa."""
    return await perform_search(q)
```

## Configuracion CORS

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configurar CORS correctamente
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://example.com",
        "https://app.example.com",
    ],  # Especificar origenes exactos, NO "*"
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,  # Cache preflight por 10 minutos
)
```

## Encabezados de seguridad

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Agregar encabezados de seguridad a todas las respuestas."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # Encabezados de seguridad
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

## Registro seguro

```python
import logging
import re
from typing import Any

class SensitiveDataFilter(logging.Filter):
    """Filtro para redactar datos sensibles de los registros."""

    SENSITIVE_PATTERNS = [
        (re.compile(r'"password"\s*:\s*"[^"]*"'), '"password": "[REDACTADO]"'),
        (re.compile(r'"token"\s*:\s*"[^"]*"'), '"token": "[REDACTADO]"'),
        (re.compile(r'"api_key"\s*:\s*"[^"]*"'), '"api_key": "[REDACTADO]"'),
        (re.compile(r'"secret"\s*:\s*"[^"]*"'), '"secret": "[REDACTADO]"'),
        (re.compile(r"Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*"),
         "Bearer [REDACTADO]"),
    ]

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            for pattern, replacement in self.SENSITIVE_PATTERNS:
                record.msg = pattern.sub(replacement, record.msg)
        return True


# Configurar registro
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)
logger.addFilter(SensitiveDataFilter())


# Uso
def log_login_attempt(email: str, success: bool) -> None:
    """Registrar intento de inicio de sesion sin datos sensibles."""
    logger.info(
        f"Intento de inicio de sesion para {email}: {'exito' if success else 'fallido'}"
    )
    # La contrasena nunca se registra!
```

## Seguridad en carga de archivos

```python
from fastapi import UploadFile, HTTPException
from pathlib import Path
import hashlib
import magic  # Biblioteca python-magic

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".pdf"}
ALLOWED_MIME_TYPES = {
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf"
}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


async def validate_upload(file: UploadFile) -> bytes:
    """Validar archivo subido por seguridad."""

    # Verificar extension del archivo
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Extension de archivo {ext} no permitida"
        )

    # Leer contenido del archivo
    content = await file.read()

    # Verificar tamano del archivo
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Archivo demasiado grande"
        )

    # Validar tipo MIME usando contenido del archivo (no solo extension)
    mime_type = magic.from_buffer(content, mime=True)
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de archivo {mime_type} no permitido"
        )

    return content


def generate_safe_filename(original_filename: str, content: bytes) -> str:
    """Generar nombre de archivo seguro para prevenir path traversal."""
    ext = Path(original_filename).suffix.lower()
    content_hash = hashlib.sha256(content).hexdigest()[:16]
    return f"{content_hash}{ext}"
```

## Seguridad de dependencias

### Auditorias regulares

```bash
# Auditoria con pip-audit
pip install pip-audit
pip-audit

# Auditoria con safety
pip install safety
safety check

# Actualizar paquetes vulnerables
pip-audit --fix
```

### Fijacion de versiones

```toml
# pyproject.toml - Fijar versiones por seguridad
[project]
dependencies = [
    "fastapi>=0.115.0,<0.116.0",
    "pydantic>=2.10.0,<3.0.0",
    "sqlalchemy>=2.0.0,<3.0.0",
]
```

### Configuracion de Dependabot

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

## Lista de verificacion de seguridad

### Antes de cada release

- [ ] Auditar dependencias (`pip-audit`, `safety check`)
- [ ] Sin secretos codificados en el codigo
- [ ] Todos los endpoints tienen autenticacion apropiada
- [ ] Validacion de entrada en todas las entradas de usuario
- [ ] Proteccion contra inyeccion SQL (ORM o consultas parametrizadas)
- [ ] Limitacion de tasa en endpoints sensibles
- [ ] CORS configurado correctamente
- [ ] Encabezados de seguridad establecidos
- [ ] Registro seguro (sin datos sensibles)
- [ ] Cargas de archivos validadas
- [ ] HTTPS forzado
- [ ] Secretos en variables de entorno

### Conciencia OWASP Top 10

1. **Inyeccion**: Usar ORMs, consultas parametrizadas
2. **Autenticacion rota**: Hash seguro de contrasenas, manejo JWT
3. **Exposicion de datos sensibles**: Cifrar datos, usar HTTPS
4. **Entidades externas XML**: Deshabilitar procesamiento XML
5. **Control de acceso roto**: Acceso basado en roles, validar permisos
6. **Configuracion de seguridad incorrecta**: Valores por defecto seguros, encabezados de seguridad
7. **Cross-Site Scripting (XSS)**: Sanear salida
8. **Deserializacion insegura**: Validar entrada, usar parsers seguros
9. **Componentes vulnerables**: Auditorias regulares de dependencias
10. **Registro insuficiente**: Registrar eventos de seguridad, proteger registros

## Conclusion

La seguridad en Python requiere:

1. **Validacion**: Validacion estricta de entrada con Pydantic
2. **Autenticacion**: Hash seguro de contrasenas, manejo JWT
3. **Autorizacion**: Control de acceso basado en roles
4. **Proteccion**: Prevencion de inyeccion SQL, XSS
5. **Monitoreo**: Registro seguro, auditorias regulares

**Regla de oro**: NUNCA confie en la entrada del usuario. Siempre valide, sanee y asegure.
