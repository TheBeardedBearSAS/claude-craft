---
description: Audit FrankenPHP security posture
argument-hint: [scope]
---

# Auditoria de Seguranca FrankenPHP

Voce e um especialista em seguranca FrankenPHP. Voce deve realizar uma auditoria de seguranca abrangente do deployment FrankenPHP.

## Argumentos
$ARGUMENTS

Argumentos:
- (Opcional) Escopo: tls, headers, caddyfile, container, php, admin, full (padrao: full)

Exemplo: `/frankenphp:security-audit scope:full`

## Plan Mode

> **Plan mode e condicional.** Ativa automaticamente quando o escopo e "full" para apresentar o plano de auditoria antes de prosseguir.

## MISSAO

### Passo 1: Definicao do Escopo

```
══════════════════════════════════════════════════════════════
AUDITORIA DE SEGURANCA FRANKENPHP
══════════════════════════════════════════════════════════════

Escopo: {tls, headers, caddyfile, container, php, admin, full}

──────────────────────────────────────────────────────────────
ESCOPO DA AUDITORIA
──────────────────────────────────────────────────────────────

| Categoria | Incluida | Peso |
|-----------|----------|------|
| Configuracao TLS | {sim/nao} | 25% |
| Headers de Seguranca | {sim/nao} | 20% |
| Hardening do Caddyfile | {sim/nao} | 20% |
| Seguranca de Container | {sim/nao} | 15% |
| Hardening PHP | {sim/nao} | 10% |
| Admin API | {sim/nao} | 10% |
```

### Passo 2: Auditoria TLS

```
──────────────────────────────────────────────────────────────
CONFIGURACAO TLS
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|---------|
| Auto-HTTPS habilitado | {sim/nao/proxy} | {configuracao} |
| Versao do protocolo TLS | {1.3/1.2} | {recomendacao} |
| Header HSTS | {definido/ausente} | {max-age, preload} |
| Validade do certificado | {valido/expirando/expirado} | {dias restantes} |
| HTTP/3 habilitado | {sim/nao} | {status UDP 443} |
| Suporte ECH | {sim/nao} | {funcionalidade v1.6+} |
| Suporte PQC | {sim/nao} | {funcionalidade v1.6+} |
```

### Passo 3: Auditoria de Headers de Seguranca

```
──────────────────────────────────────────────────────────────
HEADERS DE SEGURANCA
──────────────────────────────────────────────────────────────

| Header | Status | Valor |
|--------|--------|-------|
| Strict-Transport-Security | {definido/ausente} | {valor} |
| X-Content-Type-Options | {definido/ausente} | {valor} |
| X-Frame-Options | {definido/ausente} | {valor} |
| Content-Security-Policy | {definido/ausente} | {valor} |
| Referrer-Policy | {definido/ausente} | {valor} |
| Permissions-Policy | {definido/ausente} | {valor} |
| Header Server removido | {sim/nao} | {valor} |
```

### Passo 4: Auditoria do Caddyfile

```
──────────────────────────────────────────────────────────────
HARDENING DO CADDYFILE
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|---------|
| Rate limiting configurado | {sim/nao} | {limites} |
| Filtragem de IP (se necessario) | {sim/nao} | {regras} |
| Endpoints de debug desabilitados | {sim/nao} | {caminhos} |
| Paginas de erro customizadas | {sim/nao} | {sem vazamento de info} |
| Secrets via env vars | {sim/nao} | {nao hardcoded} |
```

### Passo 5: Auditoria de Container

```
──────────────────────────────────────────────────────────────
SEGURANCA DE CONTAINER
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|---------|
| Usuario nao-root | {sim/nao} | {usuario} |
| Capabilities minimas | {sim/nao} | {capabilities} |
| Filesystem read-only | {sim/nao} | {caminhos graváveis} |
| Sem secrets nas camadas | {sim/nao} | {avaliacao} |
| Scan de vulnerabilidades da imagem | {pass/fail} | {contagem CVE} |
```

### Passo 6: Auditoria PHP

```
──────────────────────────────────────────────────────────────
SEGURANCA PHP
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|---------|
| disable_functions | {definido/vazio} | {funcoes} |
| open_basedir | {definido/vazio} | {caminhos} |
| expose_php | {off/on} | {recomendacao} |
| Cookies de sessao seguros | {sim/nao} | {httpOnly, secure, sameSite} |
| allow_url_include | {off/on} | {recomendacao} |
```

### Passo 7: Relatorio Final

```
══════════════════════════════════════════════════════════════
RELATORIO DE AUDITORIA DE SEGURANCA
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
PONTUACAO
──────────────────────────────────────────────────────────────

| Categoria | Pontuacao | Status |
|-----------|-----------|--------|
| Configuracao TLS | {x}/100 | {pass/warn/fail} |
| Headers de Seguranca | {x}/100 | {pass/warn/fail} |
| Hardening do Caddyfile | {x}/100 | {pass/warn/fail} |
| Seguranca de Container | {x}/100 | {pass/warn/fail} |
| Hardening PHP | {x}/100 | {pass/warn/fail} |
| Admin API | {x}/100 | {pass/warn/fail} |
| **Geral** | **{x}/100** | **{status}** |

──────────────────────────────────────────────────────────────
DESCOBERTAS CRITICAS
──────────────────────────────────────────────────────────────

1. [ ] {descoberta critica 1}
2. [ ] {descoberta critica 2}

──────────────────────────────────────────────────────────────
RECOMENDACOES
──────────────────────────────────────────────────────────────

Prioridade 1 (Imediata):
- [ ] {recomendacao}

Prioridade 2 (Este sprint):
- [ ] {recomendacao}

Prioridade 3 (Proximo trimestre):
- [ ] {recomendacao}
```
