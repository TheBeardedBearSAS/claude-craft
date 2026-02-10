# Seguranca

## Visao Geral

A seguranca e uma **prioridade absoluta**. Este documento apresenta os principios gerais de seguranca aplicaveis a qualquer projeto.

> **Nota:** Consulte as regras especificas da sua tecnologia para as implementacoes concretas.

**Referencias:**
- OWASP Top 10
- CWE/SANS Top 25

---

## Sumario

1. [OWASP Top 10](#owasp-top-10)
2. [Validacao de entradas](#validacao-de-entradas)
3. [Autenticacao](#autenticacao)
4. [Autorizacao](#autorizacao)
5. [Dados sensiveis](#dados-sensiveis)
6. [Headers de seguranca](#headers-de-seguranca)
7. [Logging e monitoring](#logging-e-monitoring)
8. [Checklist](#checklist)

---

## OWASP Top 10

### 1. Broken Access Control

```
RISCO
- Acesso a recursos sem verificacao
- URLs previsiveis (/admin, /user/123/edit)
- Manipulacao de IDs nas URLs

PROTECAO
- Verificar as permissoes a CADA requisicao
- Utilizar identificadores nao previsiveis (UUID)
- Deny by default
```

### 2. Cryptographic Failures

```
RISCO
- Dados sensiveis em texto plano
- Algoritmos obsoletos (MD5, SHA1)
- Chaves no codigo fonte

PROTECAO
- Criptografar dados sensiveis em repouso
- Utilizar TLS 1.3 em transito
- Algoritmos modernos (bcrypt, Argon2, AES-256)
- Segredos em um vault (nao no codigo)
```

### 3. Injection

```
RISCO
- SQL Injection
- Command Injection
- LDAP Injection

PROTECAO
- Consultas parametrizadas (prepared statements)
- Validacao e sanitizacao das entradas
- Principio do menor privilegio (DB)
- Escape das saidas
```

### 4. Insecure Design

```
RISCO
- Sem threat modeling
- Funcionalidades sensiveis nao protegidas
- Rate limiting ausente

PROTECAO
- Threat modeling desde a concepcao
- Security by design
- Defense in depth
- Rate limiting
```

### 5. Security Misconfiguration

```
RISCO
- Configuracoes padrao nao modificadas
- Funcionalidades desnecessarias ativadas
- Mensagens de erro detalhadas
- Permissoes muito amplas

PROTECAO
- Hardening das configuracoes
- Desativar o desnecessario
- Mensagens de erro genericas em producao
- Principio do menor privilegio
```

### 6. Vulnerable Components

```
RISCO
- Dependencias com vulnerabilidades conhecidas
- Componentes obsoletos
- Sem acompanhamento de CVEs

PROTECAO
- Auditoria regular das dependencias
- Atualizacao automatica (Dependabot)
- SBOM (Software Bill of Materials)
```

### 7. Authentication Failures

```
RISCO
- Senhas fracas permitidas
- Sem MFA
- Sessoes que nao expiram
- Credential stuffing possivel

PROTECAO
- Politica de senhas fortes
- MFA para acessos sensiveis
- Expiracao de sessoes
- Rate limiting no login
- Deteccao de brute force
```

### 8. Data Integrity Failures

```
RISCO
- Dependencias nao verificadas
- CI/CD nao seguro
- Atualizacoes nao assinadas

PROTECAO
- Verificacao de assinaturas
- CI/CD seguro
- Verificacoes de integridade (checksums)
```

### 9. Logging & Monitoring Failures

```
RISCO
- Sem logs de eventos de seguranca
- Logs nao protegidos
- Sem alertas

PROTECAO
- Registrar eventos de seguranca em log
- Proteger os logs (acesso restrito)
- Alertas sobre anomalias
- Retencao apropriada
```

### 10. SSRF (Server-Side Request Forgery)

```
RISCO
- URLs fornecidas pelo usuario nao validadas
- Acesso a recursos internos

PROTECAO
- Whitelist de destinos autorizados
- Validacao rigorosa das URLs
- Sem acesso a rede interna a partir dos inputs
```

---

## Validacao de entradas

### Regra de ouro

> **Nunca confiar nos dados do usuario.**
> Validar do lado do servidor, SEMPRE.

### Tipos de validacao

| Tipo | Descricao | Exemplo |
|------|-----------|---------|
| **Whitelist** | Aceitar apenas o esperado | `status in ["pending", "done"]` |
| **Type checking** | Verificar o tipo | `typeof id === "number"` |
| **Format** | Verificar o formato | `email.matches(EMAIL_REGEX)` |
| **Range** | Verificar os limites | `1 <= page <= 100` |
| **Length** | Verificar o comprimento | `name.length <= 255` |

### Exemplos

```
// RUIM - Sem validacao
function getUser(id):
  return db.query("SELECT * FROM users WHERE id = " + id)

// BOM - Validacao + consulta parametrizada
function getUser(id):
  if not isValidUUID(id):
    throw InvalidInput("Invalid user ID")

  return db.query(
    "SELECT * FROM users WHERE id = ?",
    [id]
  )
```

### Sanitizacao vs Validacao

```
Validacao: Rejeitar dados invalidos
  -> "abc" como ID numerico -> ERRO

Sanitizacao: Limpar os dados
  -> "<script>" em um nome -> "script"

Preferir VALIDACAO (rejeitar) a SANITIZACAO (transformar)
```

---

## Autenticacao

### Senhas

```
Regras:
- Minimo 12 caracteres
- Maiusculas, minusculas, numeros, especiais
- Nao estar em listas de senhas comprometidas
- Hash com bcrypt/Argon2 (NUNCA MD5/SHA1)
- Salt unico por usuario

// BOM
hash = bcrypt.hash(password, costFactor=12)

// RUIM
hash = md5(password)
hash = sha1(password + "static_salt")
```

### Sessoes

```
Regras:
- Token aleatorio criptograficamente seguro
- Armazenamento do lado do servidor (nao em cookies)
- Expiracao: 15-30 min de inatividade
- Renovacao apos login
- Invalidacao apos logout

Session config:
  cookie:
    httpOnly: true     # Nao acessivel via JS
    secure: true       # Somente HTTPS
    sameSite: strict   # Protecao CSRF
```

### JWT (se utilizado)

```
Regras:
- Algoritmo: RS256 ou ES256 (nao HS256 com segredo fraco)
- Expiracao curta (15 min)
- Refresh token longo (7 dias) armazenado de forma segura
- Verificar assinatura e claims
- Nao armazenar dados sensiveis no payload

// RUIM
jwt.sign(payload, "secret123", { algorithm: "HS256" })

// BOM
jwt.sign(payload, privateKey, {
  algorithm: "RS256",
  expiresIn: "15m"
})
```

### Multi-Factor Authentication (MFA)

```
Quando ativar MFA:
- Acesso admin
- Operacoes sensiveis (pagamento, exclusao)
- Mudanca de senha
- Conexao a partir de novo dispositivo

Metodos:
- TOTP (Google Authenticator)
- SMS (menos seguro)
- Hardware keys (FIDO2)
```

---

## Autorizacao

### Principio do menor privilegio

```
Regra: Conceder apenas as permissoes NECESSARIAS.

RUIM
user.role = "admin"  # Acesso a tudo

BOM
user.permissions = ["read:users", "write:orders"]
```

### RBAC (Role-Based Access Control)

```
Papeis:
- admin: Todas as permissoes
- manager: Gestao de usuarios, leitura de relatorios
- user: Acesso aos seus proprios dados

Verificacao:
function deleteUser(userId, currentUser):
  if not currentUser.hasPermission("delete:users"):
    throw Forbidden("Permission denied")

  // ... logica de exclusao
```

### Row-Level Security

```
Regra: Verificar que o usuario tem acesso AO recurso especifico.

// RUIM - Verifica apenas a autenticacao
function getOrder(orderId):
  return db.find("orders", orderId)

// BOM - Verifica a propriedade
function getOrder(orderId, currentUser):
  order = db.find("orders", orderId)

  if order.userId != currentUser.id:
    throw Forbidden("Not your order")

  return order
```

---

## Dados sensiveis

### Classificacao

| Categoria | Exemplos | Protecao |
|-----------|----------|----------|
| **Publico** | Nome do produto | Nenhuma |
| **Interno** | Emails | Acesso restrito |
| **Confidencial** | Dados do cliente | Criptografia |
| **Secreto** | Senhas, chaves | Vault, hash |

### Armazenamento

```
Senhas:
  -> Hash com bcrypt/Argon2
  -> NUNCA em texto plano

Dados pessoais (LGPD):
  -> Criptografia em repouso
  -> Pseudonimizacao se possivel
  -> Retencao limitada

Segredos (API keys, etc.):
  -> Variaveis de ambiente
  -> Vault (HashiCorp, AWS Secrets Manager)
  -> NUNCA no codigo fonte
```

### Transmissao

```
Regras:
- HTTPS obrigatorio (TLS 1.3)
- Certificados validos
- HSTS ativado
- Sem dados sensiveis nas URLs

// RUIM
GET /api/users?password=secret123

// BOM
POST /api/auth
Body: { "password": "..." }
```

---

## Headers de seguranca

### Headers recomendados

```http
# Protecao XSS
Content-Security-Policy: default-src 'self'; script-src 'self'
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block

# Protecao clickjacking
X-Frame-Options: DENY

# HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains

# Referrer
Referrer-Policy: strict-origin-when-cross-origin

# Permissoes
Permissions-Policy: geolocation=(), camera=()
```

### Content-Security-Policy (CSP)

```http
# Restritivo (recomendado)
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self' api.example.com;
  frame-ancestors 'none';
```

---

## Logging e monitoring

### Eventos a registrar em log

```
REGISTRAR:
- Tentativas de conexao (sucesso/falha)
- Mudancas de permissoes
- Acesso a dados sensiveis
- Erros de autorizacao
- Modificacoes de configuracao
- Exportacoes de dados

NAO REGISTRAR:
- Senhas
- Tokens
- Dados pessoais completos
- Numeros de cartao de credito
```

### Formato de log

```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "level": "WARN",
  "event": "login_failed",
  "user_id": "user_123",
  "ip": "192.168.1.100",
  "user_agent": "Mozilla/5.0...",
  "details": {
    "reason": "invalid_password",
    "attempts": 3
  }
}
```

### Alertas

```
Alertas criticos:
- 5+ falhas de login na mesma conta
- Acesso admin a partir de novo IP
- Modificacao de permissoes
- Erros 500 em serie
- Volume anormal de requisicoes
```

---

## Checklist

### Desenvolvimento

- [ ] Validacao de entradas do lado do servidor
- [ ] Consultas parametrizadas (sem concatenacao SQL)
- [ ] Escape das saidas (prevencao XSS)
- [ ] Senhas com hash (bcrypt/Argon2)
- [ ] Sessoes seguras (httpOnly, secure, sameSite)
- [ ] Verificacao de permissoes a cada requisicao
- [ ] Segredos em variaveis de ambiente
- [ ] Dependencias auditadas

### Configuracao

- [ ] HTTPS ativado (TLS 1.3)
- [ ] Headers de seguranca configurados
- [ ] Mensagens de erro genericas em producao
- [ ] Modo debug desativado em producao
- [ ] Rate limiting ativado
- [ ] CORS configurado de forma restrita

### Monitoring

- [ ] Logging de eventos de seguranca
- [ ] Alertas sobre anomalias
- [ ] Auditoria regular de acessos
- [ ] Scan de vulnerabilidades periodico

### Conformidade (se aplicavel)

- [ ] LGPD: Consentimento, direito ao esquecimento
- [ ] PCI-DSS: Dados de pagamento
- [ ] HIPAA: Dados de saude
- [ ] SOC2: Controles de seguranca

---

## Recursos

- **OWASP Top 10:** [owasp.org/Top10](https://owasp.org/Top10/)
- **OWASP Cheat Sheets:** [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/)
- **CWE Top 25:** [cwe.mitre.org/top25](https://cwe.mitre.org/top25/)
- **NIST Guidelines:** [nist.gov](https://www.nist.gov/cyberframework)

---

**Data da ultima atualizacao:** 2025-01
**Versao:** 1.0.0
**Autor:** The Bearded CTO
