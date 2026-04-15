---
description: Auditoria de Segurança PHP
argument-hint: [argumentos]
---

# Auditoria de Segurança PHP

## Argumentos

$ARGUMENTS (opcional: caminho para o projeto PHP a auditar, padrão é o diretório atual)

## Modo Plano

> O modo plano é ativado automaticamente quando o escopo abrange vários módulos ou requer investigação transversal.

## MISSÃO

Auditoria de segurança de um projeto PHP nativo baseada no **OWASP Top 10:2025** (incl. Software Supply Chain Failures e Mishandling of Exceptional Conditions), CWE/SANS Top 25 e SLSA 1.0. Produza um relatório com pontuação de 25 e um plano de remediação priorizado.

**Regras de referência**: `.claude/rules/php-security.md`

### Etapa 1: Varredura de Dependências (4 pts)

```bash
docker compose exec app composer audit
docker compose exec app composer outdated --direct
```

Opcional (SBOM + CVE):

```bash
docker compose exec app trivy fs --scanners vuln,secret,config .
```

Verificar:
- [ ] `composer audit` reporta 0 vulnerabilidades críticas / altas
- [ ] Todas as dependências diretas fixadas em ranges exatos ou caret (sem `*`)
- [ ] Sem pacotes abandonados
- [ ] SBOM gerado (SPDX 3 ou CycloneDX) e incluído no CI
- [ ] Assinatura Sigstore / cosign configurada para artefatos de release (SLSA 1.0)

### Etapa 2: Injeção — SQL, Command, LDAP, Header (5 pts)

Varredura de padrões perigosos:

```bash
docker compose exec app grep -rn "PDO.*->query\|mysqli_query\|->prepare.*\$_" src/
docker compose exec app grep -rn "shell_exec\|passthru\|system\|exec\|popen" src/
```

Verificar:
- [ ] 100% consultas parametrizadas — **sem concatenação de string em SQL**
- [ ] Execução de comandos evitada; se necessária, `escapeshellarg()` + whitelist
- [ ] Injeção de cabeçalho HTTP prevenida (sem CR/LF bruto em `header()`)
- [ ] Filtros LDAP escapados via `ldap_escape()`
- [ ] Parsers XML desabilitam entidades externas (`libxml_disable_entity_loader(true)` / `LIBXML_NONET`)

### Etapa 3: Autenticação & Autorização (4 pts)

- [ ] Senhas hasheadas com **Argon2id** (OWASP 2026: 128 MiB RAM, t=3-5, p=1)
- [ ] `password_hash($p, PASSWORD_ARGON2ID)` usado; **sem MD5/SHA1/bcrypt em código novo**
- [ ] Comprimento mínimo de senha ≥ 12 caracteres
- [ ] Cookies de sessão: `HttpOnly`, `Secure`, `SameSite=Strict`
- [ ] Expiração de sessão 15–30 minutos
- [ ] JWT: **EdDSA (Ed25519)** > ES256 > RS256; expiração curta (15 min)
- [ ] **DPoP (RFC 9449)** para tokens sensíveis
- [ ] Permissões verificadas a cada requisição (deny-by-default, não apenas uma vez no login)

**Comando de detecção**:

```bash
docker compose exec app grep -rn "md5\|sha1\|password_hash.*BCRYPT" src/
```

### Etapa 4: Secrets & Criptografia (4 pts)

- [ ] Sem secrets no histórico do git (`gitleaks detect --log-opts='--all'` / `trufflehog`)
- [ ] Secrets carregados de variáveis de ambiente ou vault (HashiCorp Vault, AWS Secrets Manager)
- [ ] TLS 1.3 obrigatório; TLS 1.2 apenas se retrocompatibilidade necessária
- [ ] Geração aleatória via `random_bytes()` / `random_int()` — **nunca `rand()`/`mt_rand()` para segurança**
- [ ] Estratégia de rotação de chaves documentada
- [ ] Criptografia em repouso para campos sensíveis (ex.: `paragonie/halite` para AEAD em nível de campo)

### Etapa 5: Validação de Entrada & Codificação de Saída (3 pts)

- [ ] Toda entrada de usuário validada server-side (nunca confiar em validação client)
- [ ] Value Objects aplicam invariantes em construtores
- [ ] Saída HTML escapada com `htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')`
- [ ] Saída JSON via `json_encode()` com `JSON_THROW_ON_ERROR`
- [ ] Upload de arquivos: MIME sniffing, limite de tamanho, nome aleatório, fora da raiz web

### Etapa 6: Headers de Segurança & Configuração (3 pts)

- [ ] `Content-Security-Policy` (Nível 3) com nonces, sem `unsafe-inline`
- [ ] `X-Content-Type-Options: nosniff`
- [ ] `X-Frame-Options: DENY` (ou CSP `frame-ancestors 'none'`)
- [ ] `Strict-Transport-Security` (HSTS, 1 ano mín, preload se aplicável)
- [ ] `Referrer-Policy: strict-origin-when-cross-origin`
- [ ] `Cross-Origin-Opener-Policy: same-origin` (COOP)
- [ ] `Cross-Origin-Embedder-Policy: require-corp` (COEP)
- [ ] `Cross-Origin-Resource-Policy` (CORP)
- [ ] `Permissions-Policy` granular
- [ ] `display_errors=Off`, `expose_php=Off` em produção
- [ ] Páginas de erro genéricas — **nunca vazar stack traces em produção**

### Etapa 7: Logging & Supply Chain (2 pts)

- [ ] Logs incluem: logins, mudanças de permissão, acesso a dados sensíveis, erros de autorização
- [ ] Logs **nunca** contêm: senhas, tokens, PII completo, stack traces em prod
- [ ] Logs estruturados (JSON) com IDs de correlação
- [ ] Proveniência SLSA 1.0 nível 1+ em builds CI
- [ ] Dependabot / Renovate com varredura CVE (Trivy, Grype)
- [ ] Builds reprodutíveis verificados em releases

## FORMATO DE SAÍDA

```
AUDITORIA DE SEGURANÇA PHP — OWASP TOP 10:2025
===============================================

PONTUAÇÃO: XX/25
SEVERIDADE: [Crítica / Alta / Média / Baixa]

VARREDURA DE DEPENDÊNCIAS (X/4)
  composer audit: N críticas, N altas
  Pacotes abandonados: N
  SBOM presente: sim/não

INJEÇÃO (X/5)
  SQL não parametrizado: N
  Chamadas de comando perigosas: N
  Risco XXE: sim/não

AUTH & AUTORIZAÇÃO (X/4)
  Hashes fracos (MD5/SHA1/bcrypt): N
  Verificações de permissão faltando: N
  Algoritmo JWT: [EdDSA/ES256/RS256/nenhum]

SECRETS & CRYPTO (X/4)
  Secrets no histórico: N
  Uso de RNG fraco: N

ENTRADA / SAÍDA (X/3)
  Validação faltando: N
  Saída não escapada: N

HEADERS & CONFIG (X/3)
  CSP / HSTS / COOP faltando: N
  display_errors vazando: sim/não

LOGGING & SUPPLY CHAIN (X/2)
  PII em logs: N
  Nível SLSA: [0/1/2/3]

TOP 3 AÇÕES CRÍTICAS:
1. [CRÍTICO] Substituir hashes MD5 por Argon2id
   Arquivos: src/Infrastructure/Auth/...:linha
   Impacto: ALTO — Esforço: MÉDIO
2. [...]
3. [...]

GANHOS RÁPIDOS:
- Execute `composer audit` no CI (0 esforço)
- Adicione `declare(strict_types=1);` em todos os lugares (aplicado por Rector)
- Habilite HSTS em produção (1 linha de config)

ROADMAP DE REMEDIAÇÃO:
Semana 1  — Corrigir todas as CVEs CRÍTICAS do composer audit
Semana 2  — Migração Argon2id + rotação de algoritmo JWT
Mês 2     — SBOM + assinatura Sigstore + SLSA nível 2
```

## NOTAS IMPORTANTES

- **Problemas de segurança são SEMPRE prioridade máxima** — eles superam preocupações arquiteturais
- Use Docker para todas as varreduras; **nunca** vaze secrets reais na saída da varredura
- OWASP Top 10:2025 consolida SSRF em Broken Access Control
- **Mishandling Exceptional Conditions** (novo 2025): um stack trace em produção é uma vulnerabilidade de divulgação
- Supply Chain (novo 2025): assine artefatos com Sigstore/cosign, gere SBOM em cada build
- Re-execute esta auditoria a cada atualização importante de dependência e trimestralmente em estado estável
