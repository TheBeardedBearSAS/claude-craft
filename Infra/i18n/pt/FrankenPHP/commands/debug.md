---
description: Diagnose FrankenPHP worker and Caddyfile issues from symptoms
argument-hint: <Symptom> [context]
---

# FrankenPHP Debug

Voce e um especialista em troubleshooting FrankenPHP. Voce deve diagnosticar e resolver sistematicamente problemas de FrankenPHP a partir dos sintomas fornecidos.

## Argumentos
$ARGUMENTS

Argumentos:
- Descricao do sintoma (ex: "worker crashes", "memory leak", "Caddyfile error", "503 errors")
- (Opcional) Framework: symfony, laravel, php
- (Opcional) Modo: worker, classic

Exemplo: `/frankenphp:debug "worker memory keeps growing, RSS at 2GB after 1 hour"`

## Plan Mode

> **Plan mode nao e necessario.** Este e um comando de diagnostico que procede imediatamente com a investigacao.

## MISSAO

### Passo 1: Coletar Informacoes

```
══════════════════════════════════════════════════════════════
FRANKENPHP DEBUG
══════════════════════════════════════════════════════════════

Sintoma: {descricao}
Framework: {symfony/laravel/php}
Modo: {worker/classic}

──────────────────────────────────────────────────────────────
STATUS DO SISTEMA
──────────────────────────────────────────────────────────────
```

Executar comandos de diagnostico:
```bash
# Status do processo
ps aux | grep frankenphp

# Logs recentes
docker logs frankenphp-app --tail 50
# ou: journalctl -u frankenphp --since "10 minutes ago"

# Validacao do Caddyfile
frankenphp validate --config /etc/caddy/Caddyfile

# Uso de memoria
ps -o pid,rss,vsz -p $(pidof frankenphp)

# Extensoes PHP
frankenphp php-cli -m
```

### Passo 2: Analise de Causa Raiz

```
──────────────────────────────────────────────────────────────
DIAGNOSTICO
──────────────────────────────────────────────────────────────

| Verificacao | Status | Detalhes |
|-------------|--------|---------|
| FrankenPHP rodando | {sim/nao} | {pid, uptime} |
| Worker mode ativo | {sim/nao} | {contagem de threads} |
| Caddyfile valido | {sim/nao} | {erros} |
| Memoria estavel | {sim/nao} | {tendencia RSS} |
| Integracao com framework | {ok/falhando} | {Runtime/Octane} |
| Status TLS | {ok/falhando} | {auto/proxy} |

──────────────────────────────────────────────────────────────
ARVORE DE DECISAO
──────────────────────────────────────────────────────────────

Sintoma: {sintoma}
  ├── Crash de worker? → Verificar erros PHP, memoria, segfaults
  ├── Memory leak? → Definir max_requests, auditar estado global
  ├── Erro de Caddyfile? → Validar sintaxe, verificar ordem de diretivas
  ├── Falha TLS? → Verificar auto_https, config de proxy
  ├── Problema de framework? → Verificar instalacao Runtime/Octane
  └── Performance? → Profiling de codigo, verificar OPcache, benchmark

Causa Raiz: {explicacao}
```

### Passo 3: Resolucao

```
──────────────────────────────────────────────────────────────
CORRECAO
──────────────────────────────────────────────────────────────
```

Fornecer:
1. **Correcao imediata** -- Mudancas de configuracao ou comandos para resolver agora
2. **Explicacao** -- Porque isso aconteceu, comportamento especifico do FrankenPHP
3. **Prevencao** -- Ajuste de configuracao, alertas de monitoramento

### Passo 4: Verificacao

```bash
# Verificar saude do FrankenPHP
frankenphp validate --config /etc/caddy/Caddyfile
curl -f http://localhost/healthz
ps -o pid,rss -p $(pidof frankenphp)
```

### Passo 5: Relatorio Final

```
══════════════════════════════════════════════════════════════
RELATORIO DE DEBUG
══════════════════════════════════════════════════════════════

──────────────────────────────────────────────────────────────
RESUMO
──────────────────────────────────────────────────────────────

| Item | Valor |
|------|-------|
| Sintoma | {sintoma} |
| Causa raiz | {causa} |
| Correcao aplicada | {correcao} |
| Status | Resolvido / Precisa de acao |

──────────────────────────────────────────────────────────────
PREVENCAO
──────────────────────────────────────────────────────────────

- [ ] Adicionar alerta de monitoramento para {condicao}
- [ ] Ajustar {parametro} para prevenir {problema}
- [ ] Documentar correcao para referencia do @frankenphp-debug
```
