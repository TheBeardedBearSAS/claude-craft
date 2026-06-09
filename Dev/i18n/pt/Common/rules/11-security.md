# Seguranca

## Visao Geral

A seguranca e uma **prioridade absoluta**. Este documento apresenta os principios gerais de seguranca aplicaveis a qualquer projeto.

> **Nota:** Consulte as regras especificas da sua tecnologia para as implementacoes concretas.

**Referencias:**
- **OWASP Top 10:2025** (publicado novembro 2025)
- CWE/SANS Top 25
- SLSA 1.0

---

## Sumario

1. [OWASP Top 10:2025](#owasp-top-102025)
2. [Validacao de entradas](#validacao-de-entradas)
3. [Autenticacao](#autenticacao)
4. [Autorizacao](#autorizacao)
5. [Dados sensiveis](#dados-sensiveis)
6. [Headers de seguranca](#headers-de-seguranca)
7. [Supply Chain](#supply-chain)
8. [Logging e monitoring](#logging-e-monitoring)
9. [Seguranca MCP & Plugins](#seguranca-mcp--plugins)
10. [Checklist](#checklist)

---

## OWASP Top 10:2025

> **Fonte:** [OWASP Top 10:2025](https://owasp.org/Top10/2025/) — publicado novembro 2025.
> Principais mudancas vs 2021: SSRF consolidado em #1, Supply Chain Failures novo em #6, Mishandling Exceptional Conditions novo em #7.

### 1. Broken Access Control (inclui SSRF consolidado)

```
RISCO
- Acesso a recursos sem verificacao
- URLs previsiveis (/admin, /user/123/edit)
- Manipulacao de IDs nas URLs
- SSRF: URLs fornecidas pelo usuario nao validadas, acesso a recursos internos

PROTECAO
- Verificar as permissoes a CADA requisicao
- Utilizar identificadores nao previsiveis (UUID)
- Deny by default
- SSRF: Whitelist de destinos autorizados, validacao rigorosa das URLs
- Sem acesso a rede interna a partir dos inputs do usuario
```

### 2. Cryptographic Failures

```
RISCO
- Dados sensiveis em texto plano
- Algoritmos obsoletos (MD5, SHA1, bcrypt em novo codigo)
- Chaves no codigo fonte
- JWT com algoritmo fraco (HS256, RS256)

PROTECAO
- Criptografar dados sensiveis em repouso
- Utilizar TLS 1.3 em transito
- Hash de senhas: Argon2id (128 MiB RAM, t=3-5, p=1) — NUNCA MD5/SHA1/bcrypt
- JWT: EdDSA (Ed25519) preferido > ES256 > RS256
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

### 6. Software Supply Chain Failures (novo em 2025)

```
RISCO
- Dependencias com vulnerabilidades conhecidas
- Componentes sem procedencia verificavel
- CI/CD nao seguro
- Artefatos nao assinados

PROTECAO
- SLSA 1.0 niveis 1-3 (fontes verificaveis, builds reproduziveis, procedencia)
- SBOM automatico (SPDX 3 ou CycloneDX) em cada build
- Sigstore keyless signing (cosign) para artefatos e imagens
- Dependabot / Renovate com scan de CVE (Trivy, Grype)
- Versoes fixadas em todas as dependencias (sem "latest")
```

### 7. Mishandling of Exceptional Conditions (novo em 2025)

```
RISCO
- Stack traces expostos em producao
- Excecoes nao tratadas que vazam dados internos
- Comportamento indefinido em inputs mal formados

PROTECAO
- Registrar erros em log, nunca expor stack traces em producao
- Gestores de excecoes globais (error boundaries)
- Mensagens de erro genericas no lado do cliente
- Fail fast com erros de negocio claros
```

### 8. Authentication Failures

```
RISCO
- Senhas fracas permitidas
- Sem MFA
- Sessoes que nao expiram
- Credential stuffing possivel

PROTECAO
- Politica de senhas fortes (min 12 caracteres)
- MFA para acessos sensiveis
- Expiracao de sessoes
- Rate limiting no login
- Deteccao de brute force
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

### 10. Data Integrity Failures

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
Regras OWASP 2026:
- Minimo 12 caracteres
- Maiusculas, minusculas, numeros, especiais
- Nao estar em listas de senhas comprometidas
- Hash com Argon2id (128 MiB RAM, t=3-5, p=1)
- NUNCA MD5/SHA1/bcrypt em novo codigo
- Salt unico por usuario (gerenciado pelo Argon2id)

// BOM
hash = argon2id.hash(password, memory=131072, iterations=3, parallelism=1)

// RUIM
hash = md5(password)
hash = sha1(password + "static_salt")
hash = bcrypt.hash(password, costFactor=12)  // Nao usar em novo codigo
```

Fontes: [Argon2id OWASP 2026](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/)

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
Regras OWASP 2026:
- Algoritmo: EdDSA (Ed25519) preferido > ES256 > RS256
- NUNCA HS256 com segredo fraco
- Expiracao curta (15 min)
- Refresh token longo (7 dias) armazenado de forma segura
- DPoP (RFC 9449) para tokens sensiveis
- Verificar assinatura e claims
- Nao armazenar dados sensiveis no payload

// RUIM
jwt.sign(payload, "secret123", { algorithm: "HS256" })

// BOM
jwt.sign(payload, ed25519PrivateKey, {
  algorithm: "EdDSA",
  expiresIn: "15m"
})
```

Fontes: [JWT Best Practices 2026](https://duendesoftware.com/learn/best-practices-using-jwts-with-web-and-mobile-apps), [RFC 9449 DPoP](https://datatracker.ietf.org/doc/html/rfc9449)

### Multi-Factor Authentication (MFA)

```
Quando ativar MFA:
- Acesso admin
- Operacoes sensiveis (pagamento, exclusao)
- Mudanca de senha
- Conexao a partir de novo dispositivo

Metodos (por nivel de seguranca):
- Hardware keys (FIDO2/WebAuthn) — o mais seguro
- TOTP (Google Authenticator, Authy)
- SMS (menos seguro — evitar se possivel)
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
| **Secreto** | Senhas, chaves | Vault, hash Argon2id |

### Armazenamento

```
Senhas:
  -> Hash com Argon2id (128 MiB RAM, t=3-5, p=1)
  -> NUNCA em texto plano
  -> NUNCA bcrypt/MD5/SHA1 em novo codigo

Dados pessoais (LGPD):
  -> Criptografia em repouso (AES-256-GCM)
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

### Headers obrigatorios 2026

```http
# Protecao XSS + CSP Level 3
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'
X-Content-Type-Options: nosniff

# Protecao clickjacking
X-Frame-Options: DENY

# HTTPS
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

# Referrer
Referrer-Policy: strict-origin-when-cross-origin

# Permissoes granulares
Permissions-Policy: geolocation=(), camera=(), microphone=()

# Cross-Origin Isolation (2026 — obrigatorios)
Cross-Origin-Opener-Policy: same-origin
Cross-Origin-Embedder-Policy: require-corp
Cross-Origin-Resource-Policy: same-origin
```

Fonte: [HTTP Security Headers 2026](https://thibautprobst.fr/en/posts/http-security-headers/)

### Content-Security-Policy (CSP) Level 3

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
  upgrade-insecure-requests;
```

### Cross-Origin Headers (novos em 2026)

| Header | Valor recomendado | Protecao |
|--------|-------------------|----------|
| **COOP** | `same-origin` | Isola o contexto de navegacao (Spectre) |
| **COEP** | `require-corp` | Ativa Cross-Origin Isolation |
| **CORP** | `same-origin` | Protege recursos contra inclusoes cross-origin |
| **Permissions-Policy** | Granular por feature | Controla o acesso as APIs do navegador |

---

## Supply Chain

> **Referencia:** [Supply Chain Security 2026](https://kawaldeepsingh.medium.com/practical-software-supply-chain-security-2026-sboms-signing-slsa-reproducible-builds-a-0416cfac32dc)

### SLSA 1.0 (Supply-chain Levels for Software Artifacts)

| Nivel | Requisitos | Impacto |
|-------|------------|---------|
| **Nivel 1** | Procedencia do build documentada | Rastreabilidade basica |
| **Nivel 2** | Build em plataforma verificavel, assinado | Resistencia a comprometimentos internos |
| **Nivel 3** | Build reproduzivel, infraestrutura reforcada | Resistencia a comprometimentos da plataforma |

### SBOM (Software Bill of Materials)

```
Gerar automaticamente em cada build:
- Formato SPDX 3 ou CycloneDX
- Listar todas as dependencias diretas e transitivas
- Incluir versoes, licencas, CVEs conhecidos
- Publicar no registro de artefatos

Ferramentas: syft, cdxgen, trivy --format cyclonedx
```

### Sigstore / cosign

```
Assinar artefatos e imagens Docker:
cosign sign --key cosign.key ghcr.io/org/image:tag
cosign verify --key cosign.pub ghcr.io/org/image:tag

Keyless signing (recomendado em CI/CD):
cosign sign --identity-token=$(cat $ACTIONS_ID_TOKEN_REQUEST_TOKEN) \
  ghcr.io/org/image:tag
```

### Checklist Supply Chain

- [ ] SBOM gerado automaticamente (SPDX 3 ou CycloneDX)
- [ ] Artefatos assinados com Sigstore/cosign
- [ ] Procedencia SLSA 1+ documentada
- [ ] Dependencias com versoes fixadas (hash ou versao exata)
- [ ] Scan CVE automatizado (Trivy, Grype) em cada build
- [ ] Dependabot / Renovate configurado
- [ ] Revisao de dependencias antes do merge

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
- Stack traces completos em producao
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

## Seguranca MCP & Plugins

### Riscos de servidores MCP de terceiros

> **Alerta:** Pesquisas de seguranca (Snyk, 2026) identificaram 76 payloads maliciosos em registros publicos de servidores MCP. Servidores MCP de terceiros nao verificados representam um risco significativo.

```
RISCOS:
- Injecao de comandos via parametros MCP
- Exfiltracao de dados (arquivos, segredos, contexto)
- Execucao de codigo arbitrario na maquina host
- Escalada de privilegios via ferramentas expostas

PROTECAO:
- Preferir escrever seus proprios servidores MCP
- Auditar o codigo-fonte antes de instalar um servidor de terceiros
- Limitar permissoes (allowlist de ferramentas)
- Usar hook PreToolUse para bloquear padroes perigosos
```

### Checklist de verificacao MCP/Plugin

Antes de instalar um servidor MCP de terceiros:

- [ ] Codigo-fonte disponivel e auditavel
- [ ] Autor/organizacao verificada
- [ ] Sem acesso de rede nao justificado
- [ ] Sem leitura de arquivos sensiveis (.env, segredos)
- [ ] Permissoes minimas (principio do menor privilegio)
- [ ] Versao fixada (nao `latest`)
- [ ] Changelog e historico de seguranca

### Hook PreToolUse para seguranca

> **Boa prática:** Os hooks recebem o input da ferramenta como JSON no **stdin** — usar sempre `jq -r '.tool_input.<campo>'` (não `echo '$TOOL_INPUT'`) para ler valores de forma segura e evitar injeção shell.

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "command": "INPUT=$(jq -r '.tool_input.command // empty'); echo \"$INPUT\" | grep -qE '(curl|wget).*\\.(sh|py|rb)' && echo 'BLOCKED: suspicious download' >&2 && exit 1 || exit 0"
          }
        ]
      }
    ]
  }
}
```

### CLAUDE.md vs Hooks

| Mecanismo | Forca | Uso |
|-----------|-------|-----|
| **CLAUDE.md** | Sugestao | Diretrizes, convencoes |
| **Rules** | Sugestao forte | Regras detalhadas |
| **Hooks** | Aplicacao | Bloqueio efetivo, validacao automatica |

> **Regra:** CLAUDE.md = sugestoes. Hooks = requisitos.
> Para restricoes de seguranca criticas, usar hooks, nao instrucoes textuais.

---

## Checklist

### Desenvolvimento

- [ ] Validacao de entradas do lado do servidor
- [ ] Consultas parametrizadas (sem concatenacao SQL)
- [ ] Escape das saidas (prevencao XSS)
- [ ] Senhas com hash usando **Argon2id** (128 MiB, t=3-5, p=1)
- [ ] Sessoes seguras (httpOnly, secure, sameSite)
- [ ] Verificacao de permissoes a cada requisicao
- [ ] Segredos em variaveis de ambiente ou Vault
- [ ] Dependencias auditadas (scan CVE)
- [ ] JWT com EdDSA ou ES256 (nunca HS256)
- [ ] DPoP (RFC 9449) para tokens sensiveis

### Configuracao

- [ ] HTTPS ativado (TLS 1.3)
- [ ] Headers de seguranca 2026 (CSP L3, HSTS, COOP, COEP, CORP, Permissions-Policy)
- [ ] Mensagens de erro genericas em producao
- [ ] Modo debug desativado em producao
- [ ] Rate limiting ativado
- [ ] CORS configurado de forma restrita

### Supply Chain

- [ ] SBOM gerado (SPDX 3 ou CycloneDX)
- [ ] Artefatos assinados (Sigstore/cosign)
- [ ] Procedencia SLSA 1+ documentada
- [ ] Dependencias fixadas na versao exata

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

- **OWASP Top 10:2025:** [owasp.org/Top10/2025/](https://owasp.org/Top10/2025/)
- **OWASP Cheat Sheets:** [cheatsheetseries.owasp.org](https://cheatsheetseries.owasp.org/)
- **CWE Top 25:** [cwe.mitre.org/top25](https://cwe.mitre.org/top25/)
- **NIST Guidelines:** [nist.gov](https://www.nist.gov/cyberframework)
- **Argon2id 2026:** [Guia completo](https://guptadeepak.com/the-complete-guide-to-password-hashing-argon2-vs-bcrypt-vs-scrypt-vs-pbkdf2-2026/)
- **RFC 9449 DPoP:** [datatracker.ietf.org](https://datatracker.ietf.org/doc/html/rfc9449)
- **JWT Best Practices 2026:** [duendesoftware.com](https://duendesoftware.com/learn/best-practices-using-jwts-with-web-and-mobile-apps)
- **HTTP Security Headers 2026:** [thibautprobst.fr](https://thibautprobst.fr/en/posts/http-security-headers/)
- **Supply Chain 2026:** [kawaldeepsingh.medium.com](https://kawaldeepsingh.medium.com/practical-software-supply-chain-security-2026-sboms-signing-slsa-reproducible-builds-a-0416cfac32dc)

---

**Ultima atualizacao:** 2026-06
**Versao:** 1.2.0
**Autor:** The Bearded CTO
