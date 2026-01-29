# Seguranca em Python

## Principios fundamentais de seguranca

### Defesa em profundidade

Aplique multiplas camadas de seguranca:
1. Valide tanto no cliente QUANTO no servidor
2. Higienize os dados do usuario
3. Use HTTPS em todos os lugares
4. Implemente limitacao de taxa
5. Aplique o principio do menor privilegio
6. Registre eventos de seguranca

## Validacao de entrada

### Pydantic para validacao de dados

```python
from pydantic import BaseModel, Field, EmailStr, SecretStr, validator
from typing import Annotated
import re

class UserCreate(BaseModel):
    """Esquema seguro de criacao de usuario."""

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
            raise ValueError("A senha deve conter pelo menos uma letra maiuscula")
        if not re.search(r"[a-z]", password):
            raise ValueError("A senha deve conter pelo menos uma letra minuscula")
        if not re.search(r"[0-9]", password):
            raise ValueError("A senha deve conter pelo menos um digito")
        if not re.search(r"[^A-Za-z0-9]", password):
            raise ValueError("A senha deve conter pelo menos um caractere especial")
        return v


class SearchQuery(BaseModel):
    """Esquema seguro de consulta de pesquisa."""

    query: Annotated[str, Field(max_length=100)]
    page: Annotated[int, Field(ge=1, le=1000)] = 1
    limit: Annotated[int, Field(ge=1, le=100)] = 20

    @validator("query")
    def sanitize_query(cls, v: str) -> str:
        # Remover caracteres potencialmente perigosos
        return re.sub(r"[<>\"';]", "", v).strip()
```

### FastAPI com validacao

```python
from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import ValidationError

app = FastAPI()

@app.post("/users/", status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate) -> dict:
    """Criar usuario com dados validados."""
    # Pydantic valida automaticamente a entrada
    # Se a validacao falhar, FastAPI retorna 422 Unprocessable Entity

    # Fazer hash da senha antes de armazenar
    hashed_password = hash_password(user.password.get_secret_value())

    return {"username": user.username, "email": user.email}


@app.get("/search/")
async def search(query: SearchQuery = Depends()) -> dict:
    """Pesquisa com consulta validada e higienizada."""
    # query ja esta validada e higienizada
    results = await perform_search(query.query, query.page, query.limit)
    return {"results": results}
```

## Prevencao de injecao SQL

### Usar consultas parametrizadas

```python
# RUIM - Vulneravel a injecao SQL
async def get_user_unsafe(user_id: str) -> dict:
    query = f"SELECT * FROM users WHERE id = '{user_id}'"  # PERIGO!
    return await database.fetch_one(query)

# BOM - Usar consultas parametrizadas
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
    # SQLAlchemy lida com parametrizacao automaticamente
    stmt = select(User).where(User.email == email)
    result = await session.execute(stmt)
    return result.scalar_one_or_none()


async def search_users(
    session: AsyncSession,
    search_term: str,
    limit: int = 20
) -> list[User]:
    """Pesquisa segura com ORM."""
    # Seguro: ilike lida com escape
    stmt = (
        select(User)
        .where(User.username.ilike(f"%{search_term}%"))
        .limit(limit)
    )
    result = await session.execute(stmt)
    return list(result.scalars().all())
```

## Autenticacao e autorizacao

### Hash de senha com bcrypt

```python
from passlib.context import CryptContext
from pydantic import SecretStr

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Fazer hash de uma senha de forma segura."""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar uma senha contra seu hash."""
    return pwd_context.verify(plain_password, hashed_password)


# Uso
hashed = hash_password("my_secure_password")
is_valid = verify_password("my_secure_password", hashed)
```

### Tratamento de tokens JWT

```python
from datetime import datetime, timedelta, timezone
from typing import Any
import jwt
from pydantic import BaseModel

SECRET_KEY = os.environ["JWT_SECRET_KEY"]  # Carregar do ambiente
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
    """Criar um token JWT seguro."""
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
    """Decodificar e validar um token JWT."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return TokenPayload(**payload)
    except jwt.ExpiredSignatureError:
        raise ValueError("O token expirou")
    except jwt.InvalidTokenError:
        raise ValueError("Token invalido")
```

### Dependencia FastAPI para autenticacao

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> TokenPayload:
    """Validar token e retornar usuario atual."""
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
    """Dependencia para exigir funcoes especificas."""
    async def role_checker(
        user: TokenPayload = Depends(get_current_user)
    ) -> TokenPayload:
        if user.role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Permissoes insuficientes"
            )
        return user
    return role_checker


# Uso
@app.get("/admin/users/")
async def list_users(
    user: TokenPayload = Depends(require_role(["admin"]))
) -> list[dict]:
    """Endpoint apenas para administradores."""
    return await get_all_users()
```

## Gestao de segredos

### Variaveis de ambiente

```python
from pydantic_settings import BaseSettings
from pydantic import SecretStr


class Settings(BaseSettings):
    """Configuracoes da aplicacao com valores padrao seguros."""

    # Banco de dados
    database_url: SecretStr
    database_pool_size: int = 5

    # Autenticacao
    jwt_secret_key: SecretStr
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # Chaves de API
    api_key: SecretStr

    # Servicos externos
    redis_url: SecretStr | None = None

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = False


settings = Settings()

# Acessar segredos com seguranca
db_url = settings.database_url.get_secret_value()
```

### .env.example

```env
# .env.example (faca commit deste arquivo)
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
JWT_SECRET_KEY=your-secret-key-here-change-in-production
API_KEY=your-api-key-here
REDIS_URL=redis://localhost:6379
```

### .gitignore

```gitignore
# Segredos - NUNCA faca commit destes
.env
.env.local
.env.production
*.pem
*.key
secrets/
```

## Limitacao de taxa

### FastAPI com slowapi

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
@limiter.limit("5/minute")  # 5 tentativas por minuto
async def login(request: Request, credentials: LoginCredentials) -> dict:
    """Login com limitacao de taxa."""
    return await authenticate_user(credentials)


@app.get("/api/search/")
@limiter.limit("100/minute")  # 100 requisicoes por minuto
async def search(request: Request, q: str) -> dict:
    """Pesquisa com limitacao de taxa."""
    return await perform_search(q)
```

## Configuracao CORS

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configurar CORS corretamente
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://example.com",
        "https://app.example.com",
    ],  # Especificar origens exatas, NAO "*"
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Authorization", "Content-Type"],
    max_age=600,  # Cache preflight por 10 minutos
)
```

## Cabecalhos de seguranca

```python
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Adicionar cabecalhos de seguranca a todas as respostas."""

    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)

        # Cabecalhos de seguranca
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
    """Filtro para redigir dados sensiveis dos logs."""

    SENSITIVE_PATTERNS = [
        (re.compile(r'"password"\s*:\s*"[^"]*"'), '"password": "[REDIGIDO]"'),
        (re.compile(r'"token"\s*:\s*"[^"]*"'), '"token": "[REDIGIDO]"'),
        (re.compile(r'"api_key"\s*:\s*"[^"]*"'), '"api_key": "[REDIGIDO]"'),
        (re.compile(r'"secret"\s*:\s*"[^"]*"'), '"secret": "[REDIGIDO]"'),
        (re.compile(r"Bearer\s+[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*"),
         "Bearer [REDIGIDO]"),
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
    """Registrar tentativa de login sem dados sensiveis."""
    logger.info(
        f"Tentativa de login para {email}: {'sucesso' if success else 'falha'}"
    )
    # A senha nunca e registrada!
```

## Seguranca de upload de arquivos

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
    """Validar arquivo enviado para seguranca."""

    # Verificar extensao do arquivo
    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Extensao de arquivo {ext} nao permitida"
        )

    # Ler conteudo do arquivo
    content = await file.read()

    # Verificar tamanho do arquivo
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=400,
            detail="Arquivo muito grande"
        )

    # Validar tipo MIME usando conteudo do arquivo (nao apenas extensao)
    mime_type = magic.from_buffer(content, mime=True)
    if mime_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Tipo de arquivo {mime_type} nao permitido"
        )

    return content


def generate_safe_filename(original_filename: str, content: bytes) -> str:
    """Gerar nome de arquivo seguro para prevenir path traversal."""
    ext = Path(original_filename).suffix.lower()
    content_hash = hashlib.sha256(content).hexdigest()[:16]
    return f"{content_hash}{ext}"
```

## Seguranca de dependencias

### Auditorias regulares

```bash
# Auditoria com pip-audit
pip install pip-audit
pip-audit

# Auditoria com safety
pip install safety
safety check

# Atualizar pacotes vulneraveis
pip-audit --fix
```

### Fixacao de versoes

```toml
# pyproject.toml - Fixar versoes para seguranca
[project]
dependencies = [
    "fastapi>=0.115.0,<0.116.0",
    "pydantic>=2.10.0,<3.0.0",
    "sqlalchemy>=2.0.0,<3.0.0",
]
```

### Configuracao do Dependabot

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

## Lista de verificacao de seguranca

### Antes de cada release

- [ ] Auditar dependencias (`pip-audit`, `safety check`)
- [ ] Sem segredos codificados no codigo
- [ ] Todos os endpoints tem autenticacao apropriada
- [ ] Validacao de entrada em todas as entradas do usuario
- [ ] Protecao contra injecao SQL (ORM ou consultas parametrizadas)
- [ ] Limitacao de taxa em endpoints sensiveis
- [ ] CORS configurado corretamente
- [ ] Cabecalhos de seguranca definidos
- [ ] Registro seguro (sem dados sensiveis)
- [ ] Uploads de arquivos validados
- [ ] HTTPS forcado
- [ ] Segredos em variaveis de ambiente

### Conscientizacao OWASP Top 10

1. **Injecao**: Usar ORMs, consultas parametrizadas
2. **Autenticacao quebrada**: Hash seguro de senhas, tratamento JWT
3. **Exposicao de dados sensiveis**: Criptografar dados, usar HTTPS
4. **Entidades externas XML**: Desabilitar processamento XML
5. **Controle de acesso quebrado**: Acesso baseado em funcoes, validar permissoes
6. **Configuracao incorreta de seguranca**: Padroes seguros, cabecalhos de seguranca
7. **Cross-Site Scripting (XSS)**: Higienizar saida
8. **Desserializacao insegura**: Validar entrada, usar parsers seguros
9. **Componentes vulneraveis**: Auditorias regulares de dependencias
10. **Registro insuficiente**: Registrar eventos de seguranca, proteger logs

## Conclusao

A seguranca em Python requer:

1. **Validacao**: Validacao rigorosa de entrada com Pydantic
2. **Autenticacao**: Hash seguro de senhas, tratamento JWT
3. **Autorizacao**: Controle de acesso baseado em funcoes
4. **Protecao**: Prevencao de injecao SQL, XSS
5. **Monitoramento**: Registro seguro, auditorias regulares

**Regra de ouro**: NUNCA confie na entrada do usuario. Sempre valide, higienize e proteja.
